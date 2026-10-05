import assert from 'node:assert/strict'
import test from 'node:test'

import { getActuallyAvailableItemsAtOutpost } from '../src/domain/availability.ts'
import {
  collectionEditingSessionReducer,
  createCollectionEditingSession,
} from '../src/domain/collectionEditingSession.ts'
import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import { getItemSearchResults } from '../src/domain/itemSearchResults.ts'
import {
  addExplicitResourcePresence,
  removeExplicitResourcePresence,
} from '../src/domain/outpostEdits.ts'
import {
  canActivateProductionRoute,
  canAddExplicitResourcePresence,
  getInorganicMatrixResourceIds,
  isResourcePresentAtOutpost,
  X_TECH_RESOURCE_ID,
} from '../src/domain/resourcePresence.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { xTechCapabilityMismatchRule } from '../src/domain/validation/rules/xTechCapabilityMismatch.ts'
import { xTechProductionRequiresPresenceRule } from '../src/domain/validation/rules/xTechProductionRequiresPresence.ts'
import { activeProductionValidForBodyRule } from '../src/domain/validation/rules/activeProductionValidForBody.ts'
import { duplicateCollectionEntriesRule } from '../src/domain/validation/rules/duplicateCollectionEntries.ts'
import { unknownReferenceDataIdRule } from '../src/domain/validation/rules/unknownReferenceDataId.ts'
import { deserializeNetwork } from '../src/data/serialization.ts'

const referenceData: ReferenceData = {
  systems: [], bodies: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
  resources: [{
    id: X_TECH_RESOURCE_ID, name: 'X-Tech', shortName: 'XT', category: 'inorganic',
    rarity: 'unique', parentId: null, sortOrder: 3, plannedSupplyPlacement: 'special',
  }],
  products: [], bodyResources: [], productRecipes: [],
}

function networkFixture() {
  const network = createDefaultNetwork()
  return { ...network, outposts: [createDefaultOutpost([], 'outpost')] }
}

test('schema 3 defaults X-Tech state while schema 4 preserves false and explicit IDs', () => {
  const legacy = networkFixture()
  legacy.schemaVersion = 3
  const rawLegacy = JSON.parse(JSON.stringify(legacy))
  delete rawLegacy.character.capabilities
  delete rawLegacy.outposts[0].explicitResourcePresence
  const migrated = deserializeNetwork(JSON.stringify(rawLegacy))
  assert.equal(migrated.schemaVersion, 5)
  assert.equal(migrated.character.capabilities.xTechExtraction, true)
  assert.deepEqual(migrated.outposts[0].explicitResourcePresence, [])

  const current = networkFixture()
  current.character.capabilities.xTechExtraction = false
  current.outposts[0].explicitResourcePresence = ['future-resource', 'future-resource']
  const roundTrip = deserializeNetwork(JSON.stringify(current))
  assert.equal(roundTrip.character.capabilities.xTechExtraction, false)
  assert.deepEqual(roundTrip.outposts[0].explicitResourcePresence, ['future-resource', 'future-resource'])
  const malformed = JSON.parse(JSON.stringify(current))
  malformed.character.capabilities.xTechExtraction = 'yes'
  assert.throws(() => deserializeNetwork(JSON.stringify(malformed)), /capability/)
})

test('X-Tech presence, production, activation, and row recovery stay separate', () => {
  const network = networkFixture()
  const outpost = network.outposts[0]
  const route = { type: 'inorganic' as const, resourceId: X_TECH_RESOURCE_ID }
  assert.equal(canAddExplicitResourcePresence(network.character, X_TECH_RESOURCE_ID), true)
  assert.equal(isResourcePresentAtOutpost(X_TECH_RESOURCE_ID, outpost, referenceData), false)
  assert.equal(canActivateProductionRoute(network.character, outpost, route, referenceData), false)

  const present = addExplicitResourcePresence(outpost, X_TECH_RESOURCE_ID)
  assert.equal(isResourcePresentAtOutpost(X_TECH_RESOURCE_ID, present, referenceData), true)
  assert.deepEqual(getActuallyAvailableItemsAtOutpost('outpost', { ...network, outposts: [present] }), [])
  assert.equal(canActivateProductionRoute(network.character, present, route, referenceData), true)

  const producing = { ...present, activeProduction: [route] }
  assert.deepEqual(
    getActuallyAvailableItemsAtOutpost('outpost', { ...network, outposts: [producing] }),
    [{ type: 'resource', id: X_TECH_RESOURCE_ID }],
  )
  assert.equal(getInorganicMatrixResourceIds(producing, referenceData).at(-1), X_TECH_RESOURCE_ID)
  const malformed = { ...outpost, activeProduction: [route] }
  assert.equal(getInorganicMatrixResourceIds(malformed, referenceData).at(-1), X_TECH_RESOURCE_ID)

  network.character.capabilities.xTechExtraction = false
  assert.equal(canAddExplicitResourcePresence(network.character, X_TECH_RESOURCE_ID), false)
  assert.equal(canActivateProductionRoute(network.character, present, route, referenceData), false)
})

test('explicit presence edits prevent duplicates and removal clears only exact production', () => {
  const base = createDefaultOutpost([], 'outpost')
  const once = addExplicitResourcePresence(base, X_TECH_RESOURCE_ID)
  assert.strictEqual(addExplicitResourcePresence(once, X_TECH_RESOURCE_ID), once)
  const producing = {
    ...once,
    activeProduction: [
      { type: 'inorganic' as const, resourceId: X_TECH_RESOURCE_ID },
      { type: 'inorganic' as const, resourceId: 'iron' },
    ],
  }
  const removed = removeExplicitResourcePresence(producing, X_TECH_RESOURCE_ID)
  assert.deepEqual(removed.explicitResourcePresence, [])
  assert.deepEqual(removed.activeProduction, [{ type: 'inorganic', resourceId: 'iron' }])
})

test('X-Tech Search flags use explicit presence and keep malformed production asserted', () => {
  const network = networkFixture()
  const item = { type: 'resource' as const, id: X_TECH_RESOURCE_ID }
  assert.deepEqual(getItemSearchResults(item, network, referenceData), [])
  network.outposts[0].explicitResourcePresence = [X_TECH_RESOURCE_ID]
  assert.deepEqual(getItemSearchResults(item, network, referenceData)[0].flags, ['present'])
  network.outposts[0].activeProduction = [{ type: 'inorganic', resourceId: X_TECH_RESOURCE_ID }]
  assert.deepEqual(getItemSearchResults(item, network, referenceData)[0].flags, ['present', 'producing'])
  network.outposts[0].explicitResourcePresence = []
  assert.deepEqual(getItemSearchResults(item, network, referenceData)[0].flags, ['producing'])
})

test('X-Tech contradictions produce only focused warnings and structural state is preserved', () => {
  const network = networkFixture()
  network.character.capabilities.xTechExtraction = false
  network.outposts[0].explicitResourcePresence = [X_TECH_RESOURCE_ID, 'unknown', 'unknown']
  network.outposts[0].activeProduction = [{ type: 'inorganic', resourceId: X_TECH_RESOURCE_ID }]
  assert.equal(xTechCapabilityMismatchRule.validate(network).length, 1)
  assert.equal(xTechProductionRequiresPresenceRule.validate(network).length, 0)
  assert.equal(activeProductionValidForBodyRule.validate(network, referenceData).length, 0)
  assert.equal(unknownReferenceDataIdRule.validate(network, referenceData).length, 2)
  assert.equal(duplicateCollectionEntriesRule.validate(network, referenceData).length, 1)
  network.outposts[0].explicitResourcePresence = []
  assert.equal(xTechProductionRequiresPresenceRule.validate(network).length, 1)
  assert.equal(xTechCapabilityMismatchRule.validate(network).length, 1)
})

test('atomic X-Tech removal is one undoable entry and Undo restores both fields', () => {
  const network = networkFixture()
  network.outposts[0].explicitResourcePresence = [X_TECH_RESOURCE_ID]
  network.outposts[0].activeProduction = [{ type: 'inorganic', resourceId: X_TECH_RESOURCE_ID }]
  let session = createCollectionEditingSession({
    schemaVersion: 1, networks: [{ id: 'network', network }], activeNetworkId: 'network',
  })
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', label: { key: 'history.benchmark', parameters: { label: 'Remove X-Tech' } }, timestamp: 1,
    update: (current) => ({
      ...current,
      outposts: current.outposts.map((outpost) =>
        removeExplicitResourcePresence(outpost, X_TECH_RESOURCE_ID)),
    }),
  })
  assert.equal(session.history.past.length, 1)
  assert.deepEqual(session.collection.networks[0].network.outposts[0].explicitResourcePresence, [])
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.deepEqual(session.collection.networks[0].network.outposts[0].explicitResourcePresence, [X_TECH_RESOURCE_ID])
  assert.equal(session.collection.networks[0].network.outposts[0].activeProduction.length, 1)
})

test('organic activation requires the exact planet-eligible producer route', () => {
  const network = networkFixture()
  const outpost = { ...network.outposts[0], bodyId: 'body', selectedBiomeIds: ['other-biome'] }
  const data: ReferenceData = {
    ...referenceData,
    resources: [{
      id: 'fiber', name: 'Fiber', shortName: 'Fb', category: 'organic', rarity: 'common',
      parentId: null, sortOrder: null, plannedSupplyPlacement: null,
    }],
    species: [
      { id: 'valid', name: 'Valid Plant', type: 'flora' },
      { id: 'invalid', name: 'Invalid Plant', type: 'flora' },
    ],
    planetSpecies: [
      { bodyId: 'body', speciesId: 'valid', sourceClass: 'plant', domesticable: true, resourceId: 'fiber' },
      { bodyId: 'other', speciesId: 'invalid', sourceClass: 'plant', domesticable: true, resourceId: 'fiber' },
    ],
  }
  assert.equal(canActivateProductionRoute(
    network.character, outpost,
    { type: 'organic', resourceId: 'fiber', speciesId: 'valid' }, data,
  ), true)
  assert.equal(canActivateProductionRoute(
    network.character, outpost,
    { type: 'organic', resourceId: 'fiber', speciesId: 'invalid' }, data,
  ), false)
})