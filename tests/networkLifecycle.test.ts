import assert from 'node:assert/strict'
import test from 'node:test'
import { appendNetworkFromLatestCharacter, createDefaultNetworkCollection, deleteNetwork, getActiveSavedNetwork, getNextNetworkId, getPreviousNetworkId, migrateNetworkCollectionData, resetOnlyNetwork } from '../src/data/networkCollection.ts'
import { loadNetworkCollection } from '../src/data/storage.ts'
import { deserializeNetworkCollection, serializeNetworkCollection } from '../src/data/serialization.ts'
import { createNetworkExportFileName } from '../src/data/exportFileName.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { OutpostNetwork } from '../src/domain/models'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function installStorage(initialValue?: unknown) {
  const storage = new MemoryStorage()
  if (initialValue !== undefined) storage.setItem('starfield-outpost-network', JSON.stringify(initialValue))
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
}

function network(name: string, outpostId = `${name}-outpost`): OutpostNetwork {
  const blank = createDefaultNetwork()
  return {
    ...blank,
    character: { ...blank.character, name, level: 42, skills: { outpostManagement: 1, outpostEngineering: 2, planetaryHabitation: 3, researchMethods: 4, specialProjects: 0 } },
    outposts: [{ id: outpostId, name: `${name} Outpost`, systemId: 'system', bodyId: 'body', selectedBiomeIds: ['biome'], localResources: ['iron'], explicitResourcePresence: [], activeProduction: [{ type: 'inorganic', resourceId: 'iron' }], manufacturing: [{ productId: 'frame', quantity: 2 }], plannedSupply: [{ type: 'resource', id: 'copper' }], cargoPads: [{ id: 'pad', label: 'Pad 1', type: 'regular', outboundItems: [] }] }],
    cargoLinks: [{ id: 'link', endpointA: { outpostId, cargoPadId: 'pad' }, endpointB: { outpostId: 'remote', cargoPadId: 'remote-pad' } }],
  }
}

function collection(activeNetworkId = 'a') {
  return { schemaVersion: 1, networks: [{ id: 'a', network: network('First', 'a-outpost') }, { id: 'b', network: network('Last', 'b-outpost') }, { id: 'c', network: network('Third', 'c-outpost') }], activeNetworkId }
}

test('browser storage retains bare-network migration and default recovery', () => {
  const legacy = network('Legacy')
  legacy.character.capabilities.xTechExtraction = false
  installStorage(legacy)
  const migrated = loadNetworkCollection()
  assert.equal(migrated.networks.length, 1)
  assert.equal(getActiveSavedNetwork(migrated).network.character.name, 'Legacy')
  assert.equal(getActiveSavedNetwork(migrated).network.character.capabilities.xTechExtraction, false)
  installStorage({ schemaVersion: 1, networks: [], activeNetworkId: '' })
  assert.equal(loadNetworkCollection().networks.length, 1)
})

test('collection recovery preserves valid order and repairs active ID', () => {
  const recovered = migrateNetworkCollectionData({ schemaVersion: 1, networks: [{ id: 'broken', network: null }, { id: 'a', network: network('A') }, { id: 'b', network: network('B') }], activeNetworkId: 'missing' })
  assert.deepEqual(recovered.networks.map(({ id }) => id), ['a', 'b'])
  assert.equal(recovered.activeNetworkId, 'a')
})

test('previous and next navigation wrap in collection order', () => {
  assert.equal(getPreviousNetworkId(collection('a')), 'c')
  assert.equal(getNextNetworkId(collection('c')), 'a')
  assert.equal(getPreviousNetworkId(collection('b')), 'a')
  assert.equal(getNextNetworkId(collection('b')), 'c')
})

test('add appends clean gameplay state and copies every character field from the last slot', () => {
  const source = collection('a')
  source.networks.at(-1)!.network.character.capabilities.xTechExtraction = false
  const added = appendNetworkFromLatestCharacter(source, 'fresh', 'fresh-outpost')
  const saved = getActiveSavedNetwork(added)
  assert.deepEqual(added.networks.map(({ id }) => id), ['a', 'b', 'c', 'fresh'])
  assert.deepEqual(saved.network.character, source.networks.at(-1)?.network.character)
  assert.notStrictEqual(saved.network.character.skills, source.networks.at(-1)?.network.character.skills)
  assert.notStrictEqual(saved.network.character.capabilities, source.networks.at(-1)?.network.character.capabilities)
  assert.equal(saved.network.character.capabilities.xTechExtraction, false)
  assert.equal(saved.network.outposts.length, 1)
  assert.equal(saved.network.outposts[0].id, 'fresh-outpost')
  assert.equal(saved.network.outposts[0].name, 'New Outpost')
  assert.deepEqual(saved.network.outposts[0].cargoPads, [])
  assert.deepEqual(saved.network.outposts[0].localResources, [])
  assert.deepEqual(saved.network.outposts[0].explicitResourcePresence, [])
  assert.deepEqual(saved.network.outposts[0].manufacturing, [])
  assert.deepEqual(saved.network.cargoLinks, [])
})

test('delete first, middle, and last select the required neighbour', () => {
  const first = deleteNetwork(collection('a'))
  assert.deepEqual(first.networks.map(({ id }) => id), ['b', 'c'])
  assert.equal(first.activeNetworkId, 'b')
  const middle = deleteNetwork(collection('b'))
  assert.deepEqual(middle.networks.map(({ id }) => id), ['a', 'c'])
  assert.equal(middle.activeNetworkId, 'a')
  const last = deleteNetwork(collection('c'))
  assert.deepEqual(last.networks.map(({ id }) => id), ['a', 'b'])
  assert.equal(last.activeNetworkId, 'b')
})

test('single-network reset preserves stable ID and non-empty invariants', () => {
  const only = { schemaVersion: 1, networks: [{ id: 'stable', network: network('Old') }], activeNetworkId: 'stable' }
  const reset = resetOnlyNetwork(only, 'new-outpost')
  assert.equal(reset.networks.length, 1)
  assert.equal(reset.networks[0].id, 'stable')
  assert.equal(reset.networks[0].network.outposts[0].id, 'new-outpost')
  assert.equal(reset.networks[0].network.character.name, '')
})

test('whole collection serialization preserves order, IDs, and active ID', () => {
  const original = collection('b')
  original.networks[1].network.character.capabilities.xTechExtraction = false
  assert.deepEqual(deserializeNetworkCollection(serializeNetworkCollection(original)), original)
})

test('external import rejects bare networks, duplicate IDs, and malformed entries', () => {
  assert.throws(() => deserializeNetworkCollection(JSON.stringify(network('Bare'))), /collection/)
  const duplicate = collection('a')
  duplicate.networks[1] = { ...duplicate.networks[1], id: 'a' }
  assert.throws(() => deserializeNetworkCollection(JSON.stringify(duplicate)), /duplicate network ID/)
  assert.throws(() => deserializeNetworkCollection(JSON.stringify({ schemaVersion: 1, networks: [{ id: '', network: network('Bad') }], activeNetworkId: '' })), /malformed/)
})

test('external import repairs invalid active ID to the first entry', () => {
  const value = collection('a')
  value.activeNetworkId = 'missing'
  assert.equal(deserializeNetworkCollection(JSON.stringify(value)).activeNetworkId, 'a')
})

test('export filename supports name and level independently', () => {
  const now = new Date(2026, 7, 26, 12, 51, 47)
  assert.equal(createNetworkExportFileName('Rhea', 26, now), 'starfield-outposts-rhea-26-2026-08-26-125147.json')
  assert.equal(createNetworkExportFileName('Rhea', null, now), 'starfield-outposts-rhea-2026-08-26-125147.json')
  assert.equal(createNetworkExportFileName('', 26, now), 'starfield-outposts-26-2026-08-26-125147.json')
  assert.equal(createNetworkExportFileName('', null, now), 'starfield-outposts-2026-08-26-125147.json')
})

test('new collection starts with one stable active slot', () => {
  const fresh = createDefaultNetworkCollection()
  assert.equal(fresh.networks.length, 1)
  assert.equal(fresh.activeNetworkId, fresh.networks[0].id)
  assert.equal(fresh.networks[0].network.schemaVersion, 4)
  assert.equal(fresh.networks[0].network.character.capabilities.xTechExtraction, true)
})
