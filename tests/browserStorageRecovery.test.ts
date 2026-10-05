import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultNetworkCollection, migrateStoredNetworkData } from '../src/data/networkCollection.ts'
import { initializeNetworkCollection, trySaveNetworkCollection } from '../src/data/storage.ts'
import {
  MAX_STORED_LENGTH, StorageEnvelopeError, validateStorageEnvelope,
} from '../src/data/storageEnvelope.ts'
import { collectionEditingSessionReducer, createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'
import { loadApplicationPreferences, saveApplicationPreferences } from '../src/localization/preferences.ts'

class MemoryStorage {
  value: string | null = null
  writes = 0
  failRead = false
  failWrite = false
  failNextWrite = false
  getItem() {
    if (this.failRead) throw new Error('access denied')
    return this.value
  }
  setItem(_key: string, value: string) {
    this.writes++
    if (this.failWrite || this.failNextWrite) {
      this.failNextWrite = false
      throw new DOMException('quota', 'QuotaExceededError')
    }
    this.value = value
  }
}
function storage(source?: string) {
  const instance = new MemoryStorage()
  instance.value = source ?? null
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: instance })
  return instance
}
function source() { return JSON.stringify(createDefaultNetworkCollection()) }
function fallbackFor(value: string, kind = 'recovery-fallback') {
  const store = storage(value)
  const loaded = initializeNetworkCollection()
  assert.equal(loaded.status.kind, kind)
  assert.equal(store.value, value)
  assert.equal(store.writes, 0)
  assert.equal(loaded.collection.networks.length, 1)
}

test('missing, valid, read failure and first-write failure keep usable collection', () => {
  const empty = storage()
  assert.equal(initializeNetworkCollection().status.kind, 'saved')
  assert.equal(empty.writes, 1)
  const original = source()
  const existing = storage(original)
  assert.equal(initializeNetworkCollection().status.kind, 'saved')
  assert.equal(existing.value, original)
  const unreadable = storage(original)
  unreadable.failRead = true
  assert.equal(initializeNetworkCollection().status.kind, 'storage-unavailable')
  assert.equal(unreadable.writes, 0)
  const unwritable = storage()
  unwritable.failWrite = true
  assert.equal(initializeNetworkCollection().status.kind, 'unsaved')
})

test('raw length is checked before parse, including the exact boundary', () => {
  const exact = storage('x'.repeat(MAX_STORED_LENGTH))
  assert.deepEqual(initializeNetworkCollection().status,
    { kind: 'recovery-fallback', reason: 'malformed' })
  assert.equal(exact.writes, 0)
  const over = storage('x'.repeat(MAX_STORED_LENGTH + 1))
  assert.deepEqual(initializeNetworkCollection().status,
    { kind: 'recovery-fallback', reason: 'too-large' })
  assert.equal(over.writes, 0)
})

test('malformed, wrong-root, unsupported and partially malformed collections preserve source', () => {
  fallbackFor('{')
  fallbackFor('null')
  const original = JSON.parse(source())
  fallbackFor(JSON.stringify({ ...original, schemaVersion: 99 }))
  fallbackFor(JSON.stringify({ ...original, networks: [...original.networks,
    { id: 'bad', network: null }] }))
  fallbackFor(JSON.stringify({ ...original, networks: [...original.networks,
    { ...original.networks[0] }] }))
  fallbackFor(JSON.stringify({ ...original, networks: [{ ...original.networks[0], id: '' }] }))
  const migrationFailure = JSON.parse(source())
  migrationFailure.networks[0].network.character.level = 'invalid'
  fallbackFor(JSON.stringify(migrationFailure))
  assert.throws(() => migrateStoredNetworkData({ ...original, networks: [
    original.networks[0], { id: 'broken', network: null },
  ] }, true))
  const nested = JSON.parse(source())
  nested.networks[0].network.outposts.push({ id: 'one', name: 'One',
    systemId: '', bodyId: '', selectedBiomeIds: [], localResources: ['iron', 12],
    explicitResourcePresence: [], activeProduction: [], manufacturing: [], plannedSupply: [], cargoPads: [] })
  fallbackFor(JSON.stringify(nested))
  const collision = JSON.parse(source())
  const outpost = { id: 'same', name: 'Outpost', systemId: '', bodyId: '',
    selectedBiomeIds: [], localResources: [], explicitResourcePresence: [],
    activeProduction: [], manufacturing: [], plannedSupply: [], cargoPads: [] }
  collision.networks[0].network.outposts = [outpost, { ...outpost }]
  fallbackFor(JSON.stringify(collision))
})

test('historical migration is coherent; failed normalized re-save leaves recovered data live', () => {
  const legacy = createDefaultNetworkCollection().networks[0].network
  const old = JSON.stringify(legacy)
  const store = storage(old)
  store.failNextWrite = true
  const loaded = initializeNetworkCollection()
  assert.equal(loaded.collection.networks[0].network.schemaVersion, 5)
  assert.equal(loaded.status.kind, 'unsaved')
  assert.equal(store.value, old)
  assert.equal(store.writes, 1)
  const current = source()
  const currentStore = storage(current)
  currentStore.failNextWrite = true
  const currentLoad = initializeNetworkCollection()
  assert.equal(currentLoad.status.kind, 'unsaved')
  assert.equal(JSON.stringify(currentLoad.collection), current)
  assert.equal(currentStore.value, current)
})

test('preference storage access is best effort', () => {
  const unavailable = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
  }
  assert.deepEqual(loadApplicationPreferences(unavailable), { localeOverride: null })
  assert.doesNotThrow(() => saveApplicationPreferences({ localeOverride: 'ja-JP' }, unavailable))
})

test('fallback remains untouched until changed collection; failed edits retain history and retry', () => {
  const store = storage('{bad')
  const loaded = initializeNetworkCollection()
  let session = createCollectionEditingSession(loaded.collection)
  session = collectionEditingSessionReducer(session, {
    type: 'select-outpost', outpostId: null,
  })
  assert.equal(session.collection, loaded.collection)
  assert.equal(store.writes, 0)
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', timestamp: 1, label: { key: 'history.resetNetwork' },
    update: (network) => ({ ...network, character: { ...network.character, name: 'Edited' } }),
  })
  store.failNextWrite = true
  assert.equal(trySaveNetworkCollection(session.collection).kind, 'unsaved')
  assert.equal(store.value, '{bad')
  assert.equal(session.history.past.length, 1)
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.equal(session.collection.networks[0].network.character.name, '')
  session = collectionEditingSessionReducer(session, { type: 'redo' })
  assert.equal(session.collection.networks[0].network.character.name, 'Edited')
  assert.equal(trySaveNetworkCollection(session.collection).kind, 'saved')
  assert.equal(JSON.parse(store.value!).networks[0].network.character.name, 'Edited')
})

test('later edits beyond envelope stay live and do not call setItem', () => {
  const store = storage(source())
  const loaded = initializeNetworkCollection()
  let session = createCollectionEditingSession(loaded.collection)
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', timestamp: 1, label: { key: 'history.resetNetwork' },
    update: (network) => ({ ...network, character: { ...network.character, name: 'x'.repeat(16_385) } }),
  })
  const beforeWrites = store.writes
  assert.deepEqual(trySaveNetworkCollection(session.collection),
    { kind: 'unsaved', reason: 'capacity-exceeded' })
  assert.equal(store.writes, beforeWrites)
  assert.equal(session.history.past.length, 1)
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.equal(trySaveNetworkCollection(session.collection).kind, 'saved')
})

test('storage envelope exact/one-over boundaries', () => {
  const pairs: [unknown, unknown][] = [
    [{ networks: Array(128).fill(null) }, { networks: Array(129).fill(null) }],
    [{ outposts: Array(128).fill(null) }, { outposts: Array(129).fill(null) }],
    [{ outposts: [{ cargoPads: Array(16).fill(null) }] },
      { outposts: [{ cargoPads: Array(17).fill(null) }] }],
    [{ cargoLinks: Array(384).fill(null) }, { cargoLinks: Array(385).fill(null) }],
    [{ outposts: [{ cargoPads: [{ outboundItems: Array(256).fill(null) }] }] },
      { outposts: [{ cargoPads: [{ outboundItems: Array(257).fill(null) }] }] }],
    [{ other: Array(512).fill(null) }, { other: Array(513).fill(null) }],
    ['x'.repeat(16_384), 'x'.repeat(16_385)],
    [{ ['x'.repeat(16_384)]: null }, { ['x'.repeat(16_385)]: null }],
  ]
  for (const [accepted, rejected] of pairs) {
    assert.doesNotThrow(() => validateStorageEnvelope(accepted))
    assert.throws(() => validateStorageEnvelope(rejected), StorageEnvelopeError)
  }
  validateStorageEnvelope({ networks: [{ network: { outposts: Array(128).fill(null) } }] })
  assert.throws(() => validateStorageEnvelope({ networks: [{ network: {
    outposts: Array(129).fill(null),
  } }] }), StorageEnvelopeError)
  const members = (count: number) => ({ groups: Array.from({ length: 128 },
    (_, index) => ({ entries: Array(index === 0 ? count - 128 - 127 * 512 : 512).fill(null) })) })
  validateStorageEnvelope(members(65_536))
  assert.throws(() => validateStorageEnvelope(members(65_537)), StorageEnvelopeError)
  const deep = (depth: number) => {
    let value: unknown = null
    for (let i = 0; i < depth; i++) value = { next: value }
    return value
  }
  validateStorageEnvelope(deep(64))
  assert.throws(() => validateStorageEnvelope(deep(65)), StorageEnvelopeError)
})
