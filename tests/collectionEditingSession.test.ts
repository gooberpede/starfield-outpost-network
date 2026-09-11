import assert from 'node:assert/strict'
import test from 'node:test'
import type { NetworkCollection } from '../src/data/networkCollection'
import { collectionEditingSessionReducer as reduce, createCollectionEditingSession, formatNetworkHistoryLabel, getHistoryPresentationReset, MAX_HISTORY_ENTRIES, normalizeHistoryState } from '../src/domain/collectionEditingSession.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { OutpostNetwork } from '../src/domain/models'

function network(name: string, ...ids: string[]): OutpostNetwork {
  const blank = createDefaultNetwork()
  return { ...blank, character: { ...blank.character, name }, outposts: ids.map((id) => ({ id, name: id, systemId: '', bodyId: '', selectedBiomeIds: [], localResources: [], activeProduction: [], manufacturing: [], plannedSupply: [], cargoPads: [] })) }
}
function collection(): NetworkCollection {
  return { schemaVersion: 1, networks: [{ id: 'a', network: network('A', 'a1', 'a2') }, { id: 'b', network: network('B', 'b1', 'b2') }], activeNetworkId: 'a' }
}

function editCharacterName(name: string, timestamp: number) {
  return {
    type: 'apply-active-network' as const,
    label: name,
    timestamp,
    update: (value: OutpostNetwork) => ({
      ...value,
      character: { ...value.character, name },
    }),
  }
}

function createNamedEditHistory(count: number) {
  let session = createCollectionEditingSession(collection())
  for (let index = 1; index <= count; index += 1) {
    session = reduce(session, editCharacterName(`Edit ${index}`, index))
  }
  return session
}

test('working-context normalization repairs missing IDs and active/context invariant', () => {
  const value = collection()
  assert.deepEqual(normalizeHistoryState({ collection: value, context: { networkId: 'b', outpostId: 'b2' } }).context, { networkId: 'b', outpostId: 'b2' })
  assert.deepEqual(normalizeHistoryState({ collection: value, context: { networkId: 'b', outpostId: 'missing' } }).context, { networkId: 'b', outpostId: 'b1' })
  const repaired = normalizeHistoryState({ collection: { ...value, activeNetworkId: 'missing' }, context: { networkId: 'missing', outpostId: 'missing' } })
  assert.equal(repaired.context.networkId, 'a')
  assert.equal(repaired.collection.activeNetworkId, 'a')
  assert.equal(normalizeHistoryState({ collection: { schemaVersion: 1, networks: [{ id: 'empty', network: network('Empty') }], activeNetworkId: 'empty' }, context: { networkId: 'empty', outpostId: 'missing' } }).context.outpostId, null)
})

test('manual navigation remembers outposts and creates no history', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  session = reduce(session, { type: 'switch-network', networkId: 'b' })
  session = reduce(session, { type: 'select-outpost', outpostId: 'b2' })
  session = reduce(session, { type: 'switch-network', networkId: 'a' })
  assert.equal(session.context.outpostId, 'a2')
  assert.equal(session.history.past.length, 0)
})

test('ordinary edit Undo/Redo restores action context despite later navigation', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  session = reduce(session, { type: 'apply-active-network', label: 'Rename', timestamp: 1, update: (value) => ({ ...value, character: { ...value.character, name: 'Changed' } }) })
  session = reduce(session, { type: 'switch-network', networkId: 'b' })
  session = reduce(session, { type: 'undo' })
  assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })
  assert.equal(session.collection.networks[0].network.character.name, 'A')
  session = reduce(session, { type: 'switch-network', networkId: 'b' })
  session = reduce(session, { type: 'redo' })
  assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })
  assert.equal(session.collection.networks[0].network.character.name, 'Changed')
})

test('new action after Undo clears Redo', () => {
  let session = createCollectionEditingSession(collection())
  const edit = (name: string, timestamp: number) => ({ type: 'apply-active-network' as const, label: name, timestamp, update: (value: OutpostNetwork) => ({ ...value, character: { ...value.character, name } }) })
  session = reduce(session, edit('First', 1))
  session = reduce(session, { type: 'undo' })
  session = reduce(session, edit('Branched', 2))
  assert.equal(session.history.future.length, 0)
})

test('history retains every entry below and exactly at the cap', () => {
  const belowCap = createNamedEditHistory(MAX_HISTORY_ENTRIES - 1)
  assert.equal(belowCap.history.past.length, 999)
  assert.equal(belowCap.history.past[0].timestamp, 1)

  let atCap = createNamedEditHistory(MAX_HISTORY_ENTRIES)
  assert.equal(atCap.history.past.length, 1_000)
  assert.equal(atCap.history.past[0].timestamp, 1)
  for (let index = 0; index < MAX_HISTORY_ENTRIES; index += 1) {
    atCap = reduce(atCap, { type: 'undo' })
  }
  assert.equal(atCap.collection.networks[0].network.character.name, 'A')
  assert.equal(atCap.history.past.length, 0)
  assert.equal(atCap.history.future.length, 1_000)
})

test('first history overflow retains the newest 1000 entries for full Undo and Redo', () => {
  let session = createNamedEditHistory(MAX_HISTORY_ENTRIES + 1)
  const finalCollection = session.collection
  assert.equal(session.history.past.length, 1_000)
  assert.deepEqual(session.history.past.map(({ timestamp }) => timestamp),
    Array.from({ length: MAX_HISTORY_ENTRIES }, (_, index) => index + 2))

  for (let index = 0; index < MAX_HISTORY_ENTRIES; index += 1) {
    session = reduce(session, { type: 'undo' })
  }
  assert.equal(session.collection.networks[0].network.character.name, 'Edit 1')
  assert.equal(session.history.past.length, 0)
  assert.equal(session.history.future.length, 1_000)
  const fullyUndone = session
  session = reduce(session, { type: 'undo' })
  assert.equal(session, fullyUndone)

  for (let index = 0; index < MAX_HISTORY_ENTRIES; index += 1) {
    session = reduce(session, { type: 'redo' })
  }
  assert.deepEqual(session.collection, finalCollection)
  assert.equal(session.history.past.length, 1_000)
  assert.equal(session.history.future.length, 0)
})

test('larger history overflow retains the correct chronological window', () => {
  const session = createNamedEditHistory(1_250)
  assert.equal(session.history.past.length, 1_000)
  assert.equal(session.history.past[0].timestamp, 251)
  assert.equal(session.history.past.at(-1)?.timestamp, 1_250)
})

test('divergent edit near the cap clears Redo without exceeding retention', () => {
  let session = createNamedEditHistory(MAX_HISTORY_ENTRIES)
  for (let index = 0; index < 10; index += 1) {
    session = reduce(session, { type: 'undo' })
  }
  assert.equal(session.history.past.length, 990)
  assert.equal(session.history.future.length, 10)

  session = reduce(session, editCharacterName('Branched', 1_001))
  assert.equal(session.history.past.length, 991)
  assert.equal(session.history.future.length, 0)
  assert.equal(session.history.past[0].timestamp, 1)
  assert.deepEqual(session.history.past.at(-1)?.label, {
    key: 'history.benchmark', parameters: { label: 'Branched' }, networkOrdinal: 1,
  })
})

test('mixed edits and collection replacement share the cap and preserve context', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  session = reduce(session, editCharacterName('Discarded boundary edit', 1))

  const imported = collection()
  imported.activeNetworkId = 'b'
  session = reduce(session, {
    type: 'replace-collection', collection: imported, timestamp: 2,
  })
  for (let timestamp = 3; timestamp <= MAX_HISTORY_ENTRIES + 1; timestamp += 1) {
    const networkId = timestamp % 2 === 0 ? 'a' : 'b'
    const outpostId = `${networkId}${timestamp % 4 < 2 ? '1' : '2'}`
    session = reduce(session, { type: 'switch-network', networkId })
    session = reduce(session, { type: 'select-outpost', outpostId })
    session = reduce(session, editCharacterName(`Mixed edit ${timestamp}`, timestamp))
  }

  assert.equal(session.history.past.length, MAX_HISTORY_ENTRIES)
  assert.deepEqual(session.history.past[0].label, { key: 'history.importNetworks' })
  assert.equal(session.history.past[0].timestamp, 2)
  const finalCollection = session.collection
  const finalContext = session.context
  const retainedEntries = [...session.history.past]

  for (let index = retainedEntries.length - 1; index >= 0; index -= 1) {
    const entry = retainedEntries[index]
    session = reduce(session, { type: 'undo' })
    assert.deepEqual(session.context, entry.before.context)
  }
  assert.equal(session.collection.networks[0].network.character.name,
    'Discarded boundary edit')
  assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })

  for (let index = 0; index < retainedEntries.length; index += 1) {
    const entry = retainedEntries[index]
    session = reduce(session, { type: 'redo' })
    assert.deepEqual(session.context, entry.after.context)
  }
  assert.deepEqual(session.collection, finalCollection)
  assert.deepEqual(session.context, finalContext)
})

test('Add/Delete Outpost Undo/Redo restores before and after selections', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  session = reduce(session, { type: 'apply-active-network', label: 'Add outpost', timestamp: 1, outpostId: 'a3', update: (value) => ({ ...value, outposts: [...value.outposts, network('x', 'a3').outposts[0]] }) })
  session = reduce(session, { type: 'undo' })
  assert.equal(session.context.outpostId, 'a2')
  session = reduce(session, { type: 'redo' })
  assert.equal(session.context.outpostId, 'a3')
  session = reduce(session, { type: 'apply-active-network', label: 'Delete outpost', timestamp: 2, outpostId: 'a2', update: (value) => ({ ...value, outposts: value.outposts.filter(({ id }) => id !== 'a3') }) })
  session = reduce(session, { type: 'undo' })
  assert.equal(session.context.outpostId, 'a3')
  session = reduce(session, { type: 'redo' })
  assert.equal(session.context.outpostId, 'a2')
})

test('Add/Delete Network Undo/Redo restores lifecycle contexts and frozen ordinals', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  session = reduce(session, { type: 'add-network', networkId: 'c', outpostId: 'c1', timestamp: 1 })
  assert.deepEqual(session.history.past.at(-1)?.label, {
    key: 'history.addNetwork', networkOrdinal: 3,
  })
  session = reduce(session, { type: 'undo' })
  assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })
  session = reduce(session, { type: 'redo' })
  assert.deepEqual(session.context, { networkId: 'c', outpostId: 'c1' })
  session = reduce(session, { type: 'delete-network', timestamp: 2 })
  assert.deepEqual(session.history.past.at(-1)?.label, {
    key: 'history.deleteNetwork', networkOrdinal: 3,
  })
  session = reduce(session, { type: 'undo' })
  assert.deepEqual(session.context, { networkId: 'c', outpostId: 'c1' })
  session = reduce(session, { type: 'redo' })
  assert.deepEqual(session.context, { networkId: 'b', outpostId: 'b1' })
})

test('single reset and whole-collection import are contextual actions', () => {
  const only: NetworkCollection = { schemaVersion: 1, networks: [{ id: 'only', network: network('Only', 'old') }], activeNetworkId: 'only' }
  let session = createCollectionEditingSession(only)
  session = reduce(session, { type: 'reset-network', outpostId: 'fresh', timestamp: 1 })
  session = reduce(session, { type: 'undo' })
  assert.equal(session.context.outpostId, 'old')
  session = reduce(session, { type: 'redo' })
  assert.equal(session.context.outpostId, 'fresh')
  const imported = collection(); imported.activeNetworkId = 'b'
  session = reduce(session, { type: 'replace-collection', collection: imported, timestamp: 2 })
  assert.deepEqual(session.history.past.at(-1)?.label, { key: 'history.importNetworks' })
  assert.deepEqual(session.context, { networkId: 'b', outpostId: 'b1' })
  session = reduce(session, { type: 'undo' })
  assert.deepEqual(session.context, { networkId: 'only', outpostId: 'fresh' })
  session = reduce(session, { type: 'redo' })
  assert.deepEqual(session.context, { networkId: 'b', outpostId: 'b1' })
})

test('history label formatting is concise for one network and prefixed for many', () => {
  const one: NetworkCollection = { schemaVersion: 1, networks: [{ id: 'a', network: network('A', 'a1') }], activeNetworkId: 'a' }
  assert.deepEqual(formatNetworkHistoryLabel(one, 'a', 'Edit'), {
    key: 'history.benchmark', parameters: { label: 'Edit' },
  })
  assert.deepEqual(formatNetworkHistoryLabel(collection(), 'b', 'Edit'), {
    key: 'history.benchmark', parameters: { label: 'Edit' }, networkOrdinal: 2,
  })
})

test('presentation reset detection distinguishes ordinary traversal from boundaries', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, {
    type: 'apply-active-network', label: 'Ordinary edit', timestamp: 1,
    update: (value) => ({ ...value, character: { ...value.character, level: 10 } }),
  })
  assert.deepEqual(getHistoryPresentationReset(session, 'undo'), {
    navigation: false, cargo: false, search: false,
  })
  session = reduce(session, { type: 'undo' })
  assert.deepEqual(getHistoryPresentationReset(session, 'redo'), {
    navigation: false, cargo: false, search: false,
  })
  session = reduce(session, { type: 'switch-network', networkId: 'b' })
  assert.deepEqual(getHistoryPresentationReset(session, 'redo'), {
    navigation: true, cargo: true, search: true,
  })

  let topologySession = createCollectionEditingSession(collection())
  topologySession = reduce(topologySession, {
    type: 'apply-active-network', label: 'Add outpost', timestamp: 2,
    outpostId: 'a3',
    update: (value) => ({
      ...value,
      outposts: [...value.outposts, network('Added', 'a3').outposts[0]],
    }),
  })
  assert.deepEqual(getHistoryPresentationReset(topologySession, 'undo'), {
    navigation: true, cargo: true, search: false,
  })

  const only: NetworkCollection = {
    schemaVersion: 1,
    networks: [{ id: 'only', network: network('Only', 'old') }],
    activeNetworkId: 'only',
  }
  let resetSession = createCollectionEditingSession(only)
  resetSession = reduce(resetSession, {
    type: 'reset-network', outpostId: 'fresh', timestamp: 3,
  })
  assert.deepEqual(getHistoryPresentationReset(resetSession, 'undo'), {
    navigation: true, cargo: true, search: true,
  })
})

test('outpost context changes reset Cargo without remounting Navigation', () => {
  let session = createCollectionEditingSession(collection())
  session = reduce(session, {
    type: 'apply-active-network', label: 'Edit A', timestamp: 1,
    update: (value) => ({ ...value, character: { ...value.character, level: 20 } }),
  })
  session = reduce(session, { type: 'select-outpost', outpostId: 'a2' })
  assert.deepEqual(getHistoryPresentationReset(session, 'undo'), {
    navigation: false,
    cargo: true,
    search: false,
  })
})

test('membership detection ignores reorder but distinguishes outposts and cargo pads', () => {
  let reorderSession = createCollectionEditingSession(collection())
  reorderSession = reduce(reorderSession, {
    type: 'apply-active-network', label: 'Reorder outposts', timestamp: 1,
    update: (value) => ({ ...value, outposts: [...value.outposts].reverse() }),
  })
  assert.deepEqual(getHistoryPresentationReset(reorderSession, 'undo'), {
    navigation: false,
    cargo: false,
    search: false,
  })

  const padReorderCollection = collection()
  padReorderCollection.networks[0].network.outposts[0].cargoPads = [
    { id: 'p1', label: 'Pad 1', type: 'regular', outboundItems: [] },
    { id: 'p2', label: 'Pad 2', type: 'regular', outboundItems: [] },
  ]
  let padReorderSession = createCollectionEditingSession(padReorderCollection)
  padReorderSession = reduce(padReorderSession, {
    type: 'apply-active-network', label: 'Reorder cargo pads', timestamp: 2,
    update: (value) => ({
      ...value,
      outposts: value.outposts.map((outpost) => outpost.id === 'a1' ? {
        ...outpost,
        cargoPads: [...outpost.cargoPads].reverse(),
      } : outpost),
    }),
  })
  assert.deepEqual(getHistoryPresentationReset(padReorderSession, 'undo'), {
    navigation: false,
    cargo: false,
    search: false,
  })

  let padSession = createCollectionEditingSession(collection())
  padSession = reduce(padSession, {
    type: 'apply-active-network', label: 'Add cargo pad', timestamp: 3,
    update: (value) => ({
      ...value,
      outposts: value.outposts.map((outpost) => outpost.id === 'a1' ? {
        ...outpost,
        cargoPads: [...outpost.cargoPads, {
          id: 'pad', label: 'Pad 1', type: 'regular', outboundItems: [],
        }],
      } : outpost),
    }),
  })
  assert.deepEqual(getHistoryPresentationReset(padSession, 'undo'), {
    navigation: false,
    cargo: true,
    search: false,
  })

  const imported = collection()
  imported.networks[0] = {
    ...imported.networks[0],
    network: { ...imported.networks[0].network },
  }
  let importSession = createCollectionEditingSession(collection())
  importSession = reduce(importSession, {
    type: 'replace-collection', collection: imported, timestamp: 4,
  })
  assert.deepEqual(getHistoryPresentationReset(importSession, 'undo'), {
    navigation: true,
    cargo: true,
    search: true,
  })
})
