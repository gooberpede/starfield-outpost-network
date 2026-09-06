import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { createDefaultNetworkCollection, getActiveSavedNetwork, migrateNetworkCollectionData, updateActiveNetwork } from '../src/data/networkCollection.ts'
import { loadNetworkCollection, saveNetworkCollection } from '../src/data/storage.ts'
import { deserializeNetwork, serializeNetwork } from '../src/data/serialization.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import { createNetworkEditingSession, networkEditingSessionReducer } from '../src/domain/networkEditingSession.ts'
import { sampleNetwork } from '../src/domain/sampleData.ts'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

const storageKey = 'starfield-outpost-network'

function installStorage(initialValue?: unknown): MemoryStorage {
  const storage = new MemoryStorage()
  if (initialValue !== undefined) storage.setItem(storageKey, JSON.stringify(initialValue))
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  return storage
}

function populatedNetwork(name: string) {
  const blank = createDefaultNetwork()
  return {
    ...blank,
    character: { ...blank.character, name },
    outposts: [{
      id: `${name}-outpost`, name: `${name} Outpost`, systemId: '', bodyId: '',
      selectedBiomeIds: [], localResources: [], activeProduction: [],
      manufacturing: [], plannedSupply: [], cargoPads: [],
    }],
  }
}

test('first run creates and persists one blank active network', () => {
  const storage = installStorage()
  const collection = loadNetworkCollection()
  assert.equal(collection.networks.length, 1)
  assert.equal(getActiveSavedNetwork(collection).network.outposts.length, 0)
  assert.equal(getActiveSavedNetwork(collection).network.character.name, '')
  assert.ok(storage.getItem(storageKey))
})

test('legacy single-network storage migrates without losing gameplay data', () => {
  installStorage(populatedNetwork('Legacy'))
  const collection = loadNetworkCollection()
  assert.equal(collection.networks.length, 1)
  assert.equal(collection.activeNetworkId, collection.networks[0].id)
  assert.equal(getActiveSavedNetwork(collection).network.character.name, 'Legacy')
  assert.equal(getActiveSavedNetwork(collection).network.outposts[0].name, 'Legacy Outpost')
})

test('multiple entries retain order and active edits preserve inactive networks', () => {
  const collection = {
    schemaVersion: 1,
    networks: [
      { id: 'older', network: populatedNetwork('First') },
      { id: 'newer', network: populatedNetwork('Second') },
    ],
    activeNetworkId: 'newer',
  }
  installStorage()
  saveNetworkCollection(collection)
  const changed = updateActiveNetwork(loadNetworkCollection(), populatedNetwork('Changed'))
  assert.deepEqual(changed.networks.map(({ id }) => id), ['older', 'newer'])
  assert.equal(changed.networks[0].network.character.name, 'First')
  assert.equal(changed.networks[1].network.character.name, 'Changed')
})

test('collection recovery keeps valid entries and repairs an invalid active ID', () => {
  const recovered = migrateNetworkCollectionData({
    schemaVersion: 1,
    networks: [
      { id: 'broken', network: null },
      { id: 'valid', network: populatedNetwork('Valid') },
    ],
    activeNetworkId: 'missing',
  })
  assert.deepEqual(recovered.networks.map(({ id }) => id), ['valid'])
  assert.equal(recovered.activeNetworkId, 'valid')
})

test('empty or wholly malformed collections recover to one blank network', () => {
  for (const value of [
    { schemaVersion: 1, networks: [], activeNetworkId: '' },
    { schemaVersion: 1, networks: [{ id: '', network: null }], activeNetworkId: '' },
  ]) {
    const recovered = migrateNetworkCollectionData(value)
    assert.equal(recovered.networks.length, 1)
    assert.equal(getActiveSavedNetwork(recovered).network.outposts.length, 0)
  }
})

test('network reset is one undoable replacement and redo clears it again', () => {
  const original = populatedNetwork('Original')
  let session = createNetworkEditingSession(original)
  session = networkEditingSessionReducer(session, {
    type: 'apply', label: 'Delete network', timestamp: 1, update: createDefaultNetwork,
  })
  assert.equal(session.network.outposts.length, 0)
  assert.equal(session.history.past.length, 1)
  assert.equal(session.network.cargoLinks.length, 0)
  assert.equal(session.network.character.name, '')
  session = networkEditingSessionReducer(session, { type: 'undo' })
  assert.strictEqual(session.network, original)
  session = networkEditingSessionReducer(session, { type: 'redo' })
  assert.equal(session.network.outposts.length, 0)
})

test('resetting and importing preserve active slot identity and inactive entries', () => {
  const collection = {
    schemaVersion: 1,
    networks: [
      { id: 'old', network: populatedNetwork('Old') },
      { id: 'active', network: populatedNetwork('Active') },
    ],
    activeNetworkId: 'active',
  }
  const reset = updateActiveNetwork(collection, createDefaultNetwork())
  assert.deepEqual(reset.networks.map(({ id }) => id), ['old', 'active'])
  assert.equal(reset.activeNetworkId, 'active')
  assert.equal(reset.networks[1].network.outposts.length, 0)
  const imported = deserializeNetwork(serializeNetwork(populatedNetwork('Imported')))
  const afterImport = updateActiveNetwork(reset, imported)
  assert.equal(afterImport.networks[0].network.character.name, 'Old')
  assert.equal(afterImport.networks[1].network.character.name, 'Imported')
  assert.equal(JSON.parse(serializeNetwork(afterImport.networks[1].network)).networks, undefined)
})

test('failed import parsing cannot mutate a collection', () => {
  const collection = createDefaultNetworkCollection()
  assert.throws(() => deserializeNetwork('{bad json'))
  assert.equal(collection.networks.length, 1)
  assert.equal(getActiveSavedNetwork(collection).network.outposts.length, 0)
})

test('sample fixture uses current shapes and canonical reference IDs', () => {
  const systems = JSON.parse(readFileSync(
    new URL('../public/reference-data/systems.json', import.meta.url), 'utf8',
  )) as Array<{ id: string }>
  const bodies = JSON.parse(readFileSync(
    new URL('../public/reference-data/bodies.json', import.meta.url), 'utf8',
  )) as Array<{ id: string; systemId: string }>
  assert.deepEqual(deserializeNetwork(serializeNetwork(sampleNetwork)), sampleNetwork)
  assert.ok(systems.some(({ id }) => id === '86469'))
  assert.ok(bodies.some(({ id, systemId }) => id === '0005E0E3' && systemId === '86469'))
  assert.ok(bodies.some(({ id, systemId }) => id === '0005E0DA' && systemId === '86469'))
})
