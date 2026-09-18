import assert from 'node:assert/strict'
import test from 'node:test'
import { appendNetworkFromLatestCharacter, createDefaultNetworkCollection, deleteNetwork, getActiveSavedNetwork, getNextNetworkId, getPreviousNetworkId, migrateNetworkCollectionData, resetOnlyNetwork } from '../src/data/networkCollection.ts'
import { initializeNetworkCollection, loadNetworkCollection } from '../src/data/storage.ts'
import { deserializeNetworkCollection, serializeNetworkCollection } from '../src/data/serialization.ts'
import { NetworkImportError, type ImportErrorCode } from '../src/data/importErrors.ts'
import { createNetworkExportFileName } from '../src/data/exportFileName.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { OutpostNetwork } from '../src/domain/models'
import {
  collectionEditingSessionReducer,
  createCollectionEditingSession,
} from '../src/domain/collectionEditingSession.ts'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function installStorage(initialValue?: unknown) {
  const storage = new MemoryStorage()
  if (initialValue !== undefined) storage.setItem('starfield-outpost-network', JSON.stringify(initialValue))
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  return storage
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

function assertImportError(value: unknown, code: ImportErrorCode) {
  assert.throws(
    () => deserializeNetworkCollection(JSON.stringify(value)),
    (error) => error instanceof NetworkImportError && error.code === code,
  )
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

/** Exercise the full browser path, including coherence, migration and normalized write. */
function initializeHistoricalSource(source: unknown) {
  const storage = installStorage(source)
  const raw = storage.getItem('starfield-outpost-network')
  const loaded = initializeNetworkCollection()
  assert.deepEqual(loaded.status, { kind: 'saved' })
  assert.equal(loaded.collection.schemaVersion, 1)
  assert.ok(loaded.collection.networks.every(({ network }) => network.schemaVersion === 4))
  const normalized = storage.getItem('starfield-outpost-network')
  assert.equal(normalized, JSON.stringify(loaded.collection))
  return { loaded: loaded.collection, raw, normalized }
}

test('schema-1 bare browser storage migrates pad-local exports and destination link', () => {
  const legacy = network('Legacy pad link')
  Reflect.deleteProperty(legacy, 'schemaVersion')
  Reflect.deleteProperty(legacy, 'cargoLinks')
  Reflect.deleteProperty(legacy.character, 'capabilities')
  const outpost = legacy.outposts[0]
  Reflect.deleteProperty(outpost, 'selectedBiomeIds')
  Reflect.deleteProperty(outpost, 'explicitResourcePresence')
  const pad = outpost.cargoPads[0]
  Reflect.deleteProperty(pad, 'outboundItems')
  Object.assign(pad, { link: {
    exports: [{ type: 'resource', id: 'unknown-resource' }],
    destination: { type: 'outpost', outpostId: 'remote', cargoPadId: 'remote-pad' },
  } })

  const { loaded, raw, normalized } = initializeHistoricalSource(legacy)
  const migrated = getActiveSavedNetwork(loaded).network
  assert.equal(loaded.networks.length, 1)
  assert.deepEqual(migrated.outposts[0].selectedBiomeIds, [])
  assert.deepEqual(migrated.outposts[0].cargoPads[0].outboundItems,
    [{ type: 'resource', id: 'unknown-resource' }])
  assert.equal(migrated.cargoLinks.length, 1)
  assert.deepEqual(migrated.cargoLinks[0].endpointB,
    { outpostId: 'remote', cargoPadId: 'remote-pad' })
  assert.notEqual(normalized, raw)
})

test('schema-1 outpost-only destination preserves exports without inventing a pad link', () => {
  const legacy = network('Unresolved destination')
  legacy.schemaVersion = 1
  Reflect.deleteProperty(legacy, 'cargoLinks')
  Reflect.deleteProperty(legacy.character, 'capabilities')
  const outpost = legacy.outposts[0]
  Reflect.deleteProperty(outpost, 'selectedBiomeIds')
  Reflect.deleteProperty(outpost, 'explicitResourcePresence')
  const pad = outpost.cargoPads[0]
  Reflect.deleteProperty(pad, 'outboundItems')
  Object.assign(pad, { link: {
    exports: [{ type: 'resource', id: 'iron' }],
    destination: { type: 'outpost', outpostId: 'remote' },
  } })

  const { loaded } = initializeHistoricalSource(legacy)
  const migrated = getActiveSavedNetwork(loaded).network
  assert.deepEqual(migrated.outposts[0].cargoPads[0].outboundItems,
    [{ type: 'resource', id: 'iron' }])
  assert.deepEqual(migrated.cargoLinks, [])

  // A present but malformed pad identity is not a historical omission.
  const malformed: unknown = structuredClone(legacy)
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null
  if (!isRecord(malformed) || !Array.isArray(malformed.outposts)) {
    throw new Error('Expected historical outposts')
  }
  const malformedOutpost: unknown = malformed.outposts[0]
  if (!isRecord(malformedOutpost) || !Array.isArray(malformedOutpost.cargoPads)) {
    throw new Error('Expected historical cargo pads')
  }
  const malformedPad: unknown = malformedOutpost.cargoPads[0]
  if (!isRecord(malformedPad) || !isRecord(malformedPad.link) ||
    !isRecord(malformedPad.link.destination)) {
    throw new Error('Expected historical pad destination')
  }
  malformedPad.link.destination.cargoPadId = 17
  const storage = installStorage(malformed)
  const original = storage.getItem('starfield-outpost-network')
  assert.equal(initializeNetworkCollection().status.kind, 'recovery-fallback')
  assert.equal(storage.getItem('starfield-outpost-network'), original)
})

test('schema-2 browser storage migrates old production routes without later fields', () => {
  const old = collection()
  const legacy = old.networks[0].network
  legacy.schemaVersion = 2
  Reflect.deleteProperty(legacy.character, 'capabilities')
  for (const outpost of legacy.outposts) {
    Reflect.deleteProperty(outpost, 'selectedBiomeIds')
    Reflect.deleteProperty(outpost, 'explicitResourcePresence')
    Object.assign(outpost, { activeProduction: ['unknown-resource', 'adhesive'] })
  }

  const { loaded, raw, normalized } = initializeHistoricalSource(old)
  const migrated = getActiveSavedNetwork(loaded).network
  assert.deepEqual(migrated.outposts[0].selectedBiomeIds, [])
  assert.deepEqual(migrated.outposts[0].activeProduction, [
    { type: 'inorganic', resourceId: 'unknown-resource' },
    { type: 'organic-unspecified', resourceId: 'adhesive' },
  ])
  assert.deepEqual(migrated.outposts[0].explicitResourcePresence, [])
  assert.notEqual(normalized, raw)
})

test('schema-3 browser storage adds schema-4 capability and explicit presence', () => {
  const old = collection()
  const legacy = old.networks[0].network
  legacy.schemaVersion = 3
  Reflect.deleteProperty(legacy.character, 'capabilities')
  for (const outpost of legacy.outposts) Reflect.deleteProperty(outpost, 'explicitResourcePresence')

  const { loaded, raw, normalized } = initializeHistoricalSource(old)
  const migrated = getActiveSavedNetwork(loaded).network
  assert.equal(migrated.character.capabilities.xTechExtraction, true)
  assert.deepEqual(migrated.outposts[0].explicitResourcePresence, [])
  assert.deepEqual(migrated.outposts[0].activeProduction,
    [{ type: 'inorganic', resourceId: 'iron' }])
  assert.notEqual(normalized, raw)
})

test('current-schema browser storage initializes and writes without fallback', () => {
  const current = collection('b')
  const { loaded, raw, normalized } = initializeHistoricalSource(current)
  assert.equal(loaded.activeNetworkId, 'b')
  assert.equal(getActiveSavedNetwork(loaded).network.character.name, 'Last')
  assert.equal(normalized, raw)
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
  assertImportError(network('Bare'), 'invalid-collection')
  const duplicate = collection('a')
  duplicate.networks[1] = { ...duplicate.networks[1], id: 'a' }
  assertImportError(duplicate, 'invalid-identity')
  assertImportError({ schemaVersion: 1, networks: [{ id: '', network: network('Bad') }], activeNetworkId: '' }, 'invalid-identity')
})

test('external import rejects malformed nested runtime structures before migration can clean them', () => {
  const malformedValues: unknown[] = []

  const manufacturing = collection()
  Object.assign(manufacturing.networks[0].network.outposts[0], {
    manufacturing: [{ productId: 'frame', quantity: 'two' }],
  })
  malformedValues.push(manufacturing)

  const plannedSupply = collection()
  Object.assign(plannedSupply.networks[0].network.outposts[0], {
    plannedSupply: [{ type: 'resource' }],
  })
  malformedValues.push(plannedSupply)

  const outboundItems = collection()
  Object.assign(outboundItems.networks[0].network.outposts[0].cargoPads[0], {
    outboundItems: [{ type: 'unknown', id: 'iron' }],
  })
  malformedValues.push(outboundItems)

  const route = collection()
  Object.assign(route.networks[0].network.outposts[0], {
    activeProduction: [{ type: 'invalid', resourceId: 'iron' }],
  })
  malformedValues.push(route)

  const cargoLink = collection()
  Object.assign(cargoLink.networks[0].network.cargoLinks[0], { endpointA: null })
  malformedValues.push(cargoLink)

  const filteredId = collection()
  Object.assign(filteredId.networks[0].network.outposts[0], {
    selectedBiomeIds: ['biome', 42],
  })
  malformedValues.push(filteredId)

  for (const value of malformedValues) assertImportError(value, 'invalid-structure')
})

test('external import rejects obsolete pad-level links in network-level link schemas', () => {
  for (const sourceVersion of [2, 4]) {
    const withPadLink = collection()
    withPadLink.networks[0].network.schemaVersion = sourceVersion
    const sourceNetwork = withPadLink.networks[0].network
    sourceNetwork.cargoLinks = []
    const sourceOutpost = sourceNetwork.outposts[0]
    if (sourceVersion === 2) {
      Reflect.deleteProperty(sourceNetwork.character, 'capabilities')
      Reflect.deleteProperty(sourceOutpost, 'selectedBiomeIds')
      Reflect.deleteProperty(sourceOutpost, 'explicitResourcePresence')
    }
    Object.assign(sourceOutpost.cargoPads[0], {
      link: {
        destination: { type: 'outpost', outpostId: 'remote', cargoPadId: 'remote-pad' },
      },
    })

    assertImportError(withPadLink, 'invalid-structure')
  }
})

test('external import rejects a current pad-level link before it can replace a top-level link ID', () => {
  const withDuplicateRelationship = collection()
  const sourceNetwork = withDuplicateRelationship.networks[0].network
  const topLevelLink = sourceNetwork.cargoLinks[0]
  Object.assign(sourceNetwork.outposts[0].cargoPads[0], {
    link: {
      destination: {
        type: 'outpost',
        outpostId: topLevelLink.endpointB.outpostId,
        cargoPadId: topLevelLink.endpointB.cargoPadId,
      },
    },
  })

  assertImportError(withDuplicateRelationship, 'invalid-structure')
  assert.equal(sourceNetwork.cargoLinks[0].id, 'link')
})

test('external import enforces stable identities in their natural namespaces', () => {
  const emptyNetwork = collection()
  emptyNetwork.networks[0].id = ''
  assertImportError(emptyNetwork, 'invalid-identity')

  const emptyOutpost = collection()
  emptyOutpost.networks[0].network.outposts[0].id = ''
  assertImportError(emptyOutpost, 'invalid-identity')

  const emptyLink = collection()
  emptyLink.networks[0].network.cargoLinks[0].id = ''
  assertImportError(emptyLink, 'invalid-identity')

  const emptyPad = collection()
  emptyPad.networks[0].network.outposts[0].cargoPads[0].id = ''
  assertImportError(emptyPad, 'invalid-identity')

  const duplicateOutpost = collection()
  duplicateOutpost.networks[0].network.outposts.push({
    ...structuredClone(duplicateOutpost.networks[0].network.outposts[0]),
    name: 'Duplicate',
  })
  assertImportError(duplicateOutpost, 'invalid-identity')

  const duplicateLink = collection()
  duplicateLink.networks[0].network.cargoLinks.push({
    id: duplicateLink.networks[0].network.cargoLinks[0].id,
    endpointA: { outpostId: 'another', cargoPadId: 'one' },
    endpointB: { outpostId: 'remote', cargoPadId: 'two' },
  })
  assertImportError(duplicateLink, 'invalid-identity')

  const duplicatePad = collection()
  duplicatePad.networks[0].network.outposts[0].cargoPads.push({
    ...duplicatePad.networks[0].network.outposts[0].cargoPads[0],
  })
  assertImportError(duplicatePad, 'invalid-identity')
})

test('external import keeps qualified and unrelated identity namespaces independent', () => {
  const qualifiedPads = collection()
  const firstNetwork = qualifiedPads.networks[0].network
  firstNetwork.outposts.push({
    ...structuredClone(firstNetwork.outposts[0]),
    id: 'second-outpost',
    name: 'Second',
  })
  assert.doesNotThrow(() => deserializeNetworkCollection(JSON.stringify(qualifiedPads)))

  const unrelated = { schemaVersion: 1, networks: [{
    id: 'shared',
    network: network('Shared', 'shared'),
  }], activeNetworkId: 'shared' }
  unrelated.networks[0].network.outposts[0].cargoPads[0].id = 'shared'
  unrelated.networks[0].network.cargoLinks[0] = {
    id: 'shared',
    endpointA: { outpostId: 'shared', cargoPadId: 'shared' },
    endpointB: { outpostId: 'remote', cargoPadId: 'remote-pad' },
  }
  assert.doesNotThrow(() => deserializeNetworkCollection(JSON.stringify(unrelated)))
})

test('external import preserves unknown references and supported historical schemas', () => {
  const unknown = collection()
  const outpost = unknown.networks[0].network.outposts[0]
  outpost.systemId = 'unknown-system'
  outpost.bodyId = 'unknown-body'
  outpost.selectedBiomeIds = ['unknown-biome']
  outpost.localResources = ['unknown-resource']
  outpost.activeProduction = [{ type: 'organic', resourceId: 'unknown-resource', speciesId: 'unknown-species' }]
  outpost.manufacturing = [{ productId: 'unknown-product', quantity: 1 }]
  outpost.plannedSupply = [{ type: 'product', id: 'unknown-product' }]
  const imported = deserializeNetworkCollection(JSON.stringify(unknown))
  assert.deepEqual(imported.networks[0].network.outposts[0].selectedBiomeIds, ['unknown-biome'])
  assert.deepEqual(imported.networks[0].network.outposts[0].plannedSupply, [
    { type: 'product', id: 'unknown-product' },
  ])

  const historical = collection()
  const historicalNetwork = historical.networks[0].network
  Object.assign(historicalNetwork, { schemaVersion: 3 })
  Reflect.deleteProperty(historicalNetwork.character, 'capabilities')
  for (const historicalOutpost of historicalNetwork.outposts) {
    Reflect.deleteProperty(historicalOutpost, 'explicitResourcePresence')
  }
  const migrated = deserializeNetworkCollection(JSON.stringify(historical))
  assert.equal(migrated.networks[0].network.schemaVersion, 4)
  assert.equal(migrated.networks[0].network.character.capabilities.xTechExtraction, true)

  const routes = collection()
  const routesNetwork = routes.networks[0].network
  Object.assign(routesNetwork, { schemaVersion: 2 })
  Reflect.deleteProperty(routesNetwork.character, 'capabilities')
  for (const routeOutpost of routesNetwork.outposts) {
    Reflect.deleteProperty(routeOutpost, 'selectedBiomeIds')
    Reflect.deleteProperty(routeOutpost, 'explicitResourcePresence')
    Object.assign(routeOutpost, { activeProduction: ['unknown-resource'] })
  }
  const migratedRoutes = deserializeNetworkCollection(JSON.stringify(routes))
  assert.deepEqual(migratedRoutes.networks[0].network.outposts[0].activeProduction, [
    { type: 'inorganic', resourceId: 'unknown-resource' },
  ])

  const padLinks = collection()
  const padLinksNetwork = padLinks.networks[0].network
  Reflect.deleteProperty(padLinksNetwork, 'schemaVersion')
  Reflect.deleteProperty(padLinksNetwork, 'cargoLinks')
  Reflect.deleteProperty(padLinksNetwork.character, 'capabilities')
  const legacyOutpost = padLinksNetwork.outposts[0]
  Reflect.deleteProperty(legacyOutpost, 'selectedBiomeIds')
  Reflect.deleteProperty(legacyOutpost, 'explicitResourcePresence')
  const legacyPad = legacyOutpost.cargoPads[0]
  Reflect.deleteProperty(legacyPad, 'outboundItems')
  Object.assign(legacyPad, {
    link: {
      exports: [{ type: 'resource', id: 'unknown-resource' }],
      destination: { type: 'outpost', outpostId: 'remote', cargoPadId: 'remote-pad' },
    },
  })
  const migratedPadLinks = deserializeNetworkCollection(JSON.stringify(padLinks))
  assert.deepEqual(migratedPadLinks.networks[0].network.outposts[0].cargoPads[0].outboundItems, [
    { type: 'resource', id: 'unknown-resource' },
  ])
  assert.equal(migratedPadLinks.networks[0].network.cargoLinks.length, 1)
})

test('rejected external import leaves collection, context, history, and storage unchanged', () => {
  installStorage(collection('b'))
  const session = createCollectionEditingSession(collection('b'))
  const before = structuredClone(session)
  const storedBefore = localStorage.getItem('starfield-outpost-network')
  const malformed = collection()
  Object.assign(malformed.networks[0].network.outposts[0], {
    manufacturing: [{ productId: 'frame', quantity: 'invalid' }],
  })

  let after = session
  try {
    const imported = deserializeNetworkCollection(JSON.stringify(malformed))
    after = collectionEditingSessionReducer(session, {
      type: 'replace-collection', collection: imported, timestamp: 1,
    })
  } catch (error) {
    assert.ok(error instanceof NetworkImportError)
  }

  assert.deepEqual(after, before)
  assert.equal(localStorage.getItem('starfield-outpost-network'), storedBefore)
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
