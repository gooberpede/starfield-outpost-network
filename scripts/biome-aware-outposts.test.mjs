/** Regression coverage for schema-3 biome scope and production-route semantics. */
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPlanetaryOrganicFarmingRoutes,
  isOrganicFarmingRouteEligibleOnBody,
  getBiomeButtonGroups,
  getEffectiveBodyBiomeIds,
  getOutpostAvailableInorganicResourceIds,
} from '../src/domain/bodyResourceAvailability.ts'
import { getActiveProducedResourceIds } from '../src/domain/productionRoutes.ts'
import { migrateNetworkData } from '../src/data/networkMigration.ts'
import { deserializeNetwork, serializeNetwork } from '../src/data/serialization.ts'
import { duplicateCollectionEntriesRule } from '../src/domain/validation/rules/duplicateCollectionEntries.ts'
import { unknownReferenceDataIdRule } from '../src/domain/validation/rules/unknownReferenceDataId.ts'
import { selectedBiomeValidForBodyRule } from '../src/domain/validation/rules/selectedBiomeValidForBody.ts'
import { unspecifiedOrganicProductionSourceRule } from '../src/domain/validation/rules/unspecifiedOrganicProductionSource.ts'
import { organicFarmingInputsUnavailableRule } from '../src/domain/validation/rules/organicFarmingInputsUnavailable.ts'
import { activeProductionValidForBodyRule } from '../src/domain/validation/rules/activeProductionValidForBody.ts'
import { createDefaultOutpost } from '../src/domain/defaults.ts'
import {
  changeOutpostBody,
  changeOutpostSystem,
  toggleOutpostBiomeGroup,
  toggleOutpostProductionRoute,
} from '../src/domain/outpostEdits.ts'
import {
  createCollectionEditingSession,
  collectionEditingSessionReducer,
} from '../src/domain/collectionEditingSession.ts'

function referenceFixture() {
  return {
    systems: [{ id: 'system', name: 'System' }],
    bodies: [
      { id: 'body', systemId: 'system', name: 'Body', bodyType: 'planet', outpostAllowed: true,
        solarArrayPower: null, windTurbinePower: null, planetaryHabitationRank: null },
      { id: 'other', systemId: 'system', name: 'Other', bodyType: 'planet', outpostAllowed: true,
        solarArrayPower: null, windTurbinePower: null, planetaryHabitationRank: null },
    ],
    resources: [
      { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
      { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
      { id: 'argon', name: 'Argon', shortName: 'Ar', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
      { id: 'sealant', name: 'Sealant', shortName: 'Seal', category: 'organic', rarity: 'common', parentId: null, sortOrder: null },
      { id: 'water', name: 'Water', shortName: 'H2O', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
    ],
    biomes: [{ id: 'same', name: 'Volcanic' }],
    bodyBiomes: [0, 1, 2, 3].map((biomeIndex) => ({
      id: `b${biomeIndex}`, bodyId: 'body', biomeId: 'same', biomeIndex,
    })).concat([{ id: 'foreign', bodyId: 'other', biomeId: 'same', biomeIndex: 0 }]),
    inorganicOccurrences: [
      { bodyId: 'body', resourceId: 'iron', location: { type: 'biome', bodyBiomeId: 'b0' } },
      { bodyId: 'body', resourceId: 'iron', location: { type: 'biome', bodyBiomeId: 'b1' } },
      { bodyId: 'body', resourceId: 'copper', location: { type: 'biome', bodyBiomeId: 'b2' } },
      { bodyId: 'body', resourceId: 'argon', location: { type: 'atmosphere' } },
    ],
    species: [
      { id: 'plant-a', name: 'Plant A', type: 'flora' },
      { id: 'plant-b', name: 'Plant B', type: 'flora' },
      { id: 'wild-plant', name: 'Wild Plant', type: 'flora' },
    ],
    planetSpecies: [
      { bodyId: 'body', speciesId: 'plant-a', sourceClass: 'plant', domesticable: true, resourceId: 'sealant' },
      { bodyId: 'body', speciesId: 'plant-b', sourceClass: 'plant', domesticable: true, resourceId: 'sealant' },
      { bodyId: 'other', speciesId: 'plant-a', sourceClass: 'plant', domesticable: true, resourceId: 'sealant' },
      { bodyId: 'body', speciesId: 'wild-plant', sourceClass: 'plant', domesticable: false, resourceId: 'sealant' },
    ],
    organicOccurrences: [
      { bodyBiomeId: 'b0', speciesId: 'plant-a' },
      { bodyBiomeId: 'b1', speciesId: 'plant-a' },
      { bodyBiomeId: 'b1', speciesId: 'plant-b' },
      { bodyBiomeId: 'b3', speciesId: 'plant-b' },
    ],
    organicFarmingProfiles: [{ sourceClass: 'plant', inputs: [{ resourceId: 'water', quantity: 1 }] }],
    bodyResources: [{ bodyId: 'body', resourceIds: ['iron', 'copper', 'argon', 'sealant'] }],
    products: [], productRecipes: [],
  }
}

function networkFixture() {
  return {
    schemaVersion: 3,
    character: { name: '', level: null, skills: { outpostManagement: null, outpostEngineering: null,
      planetaryHabitation: null, researchMethods: null, specialProjects: null } },
    outposts: [{ id: 'outpost', name: 'Outpost', systemId: 'system', bodyId: 'body',
      selectedBiomeIds: [], localResources: [], explicitResourcePresence: [], activeProduction: [], manufacturing: [],
      plannedSupply: [], cargoPads: [] }],
    cargoLinks: [],
  }
}

test('empty and explicit-all biome scope are equivalent; subsets retain atmosphere', () => {
  const data = referenceFixture()
  const all = ['b0', 'b1', 'b2', 'b3']
  assert.deepEqual(getEffectiveBodyBiomeIds(data, 'body', []), all)
  assert.deepEqual(getEffectiveBodyBiomeIds(data, 'body', all), all)
  assert.deepEqual(new Set(getOutpostAvailableInorganicResourceIds(data, 'body', [])),
    new Set(getOutpostAvailableInorganicResourceIds(data, 'body', all)))
  assert.deepEqual(getOutpostAvailableInorganicResourceIds(data, 'body', ['b0']).sort(), ['argon', 'iron'])
  const planetaryRoutes = getPlanetaryOrganicFarmingRoutes(data, 'body')
  assert.equal(planetaryRoutes.length, 2)
  assert.deepEqual(planetaryRoutes, getPlanetaryOrganicFarmingRoutes(data, 'body'))
  assert.ok(!getOutpostAvailableInorganicResourceIds(data, 'body', ['b0']).includes('copper'))
})

test('same-biome occurrences group by inorganic-only production signatures in index order', () => {
  const groups = getBiomeButtonGroups(referenceFixture(), 'body')
  assert.deepEqual(groups.map(({ biomeId, baseLabel, ordinal }) => ({
    biomeId, baseLabel, ordinal,
  })), [
    { biomeId: 'same', baseLabel: 'Volcanic', ordinal: 1 },
    { biomeId: 'same', baseLabel: 'Volcanic', ordinal: 2 },
    { biomeId: 'same', baseLabel: 'Volcanic', ordinal: 3 },
  ])
  assert.deepEqual(groups.map((group) => [group.label, group.bodyBiomeIds]), [
    ['Volcanic 1', ['b0', 'b1']],
    ['Volcanic 2', ['b2']],
    ['Volcanic 3', ['b3']],
  ])
})

test('planetary organic farming preserves exact producers and ignores natural biome occurrence', () => {
  const data = referenceFixture()
  const plantA = { type: 'organic', resourceId: 'sealant', speciesId: 'plant-a' }
  const plantB = { type: 'organic', resourceId: 'sealant', speciesId: 'plant-b' }
  assert.equal(isOrganicFarmingRouteEligibleOnBody(data, 'body', plantA), true)
  assert.equal(isOrganicFarmingRouteEligibleOnBody(data, 'body', plantB), true)
  assert.equal(isOrganicFarmingRouteEligibleOnBody(data, 'other', plantB), false)
  assert.equal(isOrganicFarmingRouteEligibleOnBody(
    data, 'body', { ...plantA, speciesId: 'missing' },
  ), false)
})
test('multiple species routes collapse only at the downstream resource boundary', () => {
  const network = networkFixture()
  network.outposts[0].activeProduction = [
    { type: 'organic', resourceId: 'sealant', speciesId: 'plant-a' },
    { type: 'organic', resourceId: 'sealant', speciesId: 'plant-b' },
  ]
  assert.deepEqual(getActiveProducedResourceIds(network.outposts[0]), ['sealant'])
})

test('schema migration preserves biomes and maps legacy organic production to unspecified', () => {
  const legacy = networkFixture()
  legacy.schemaVersion = 2
  delete legacy.outposts[0].selectedBiomeIds
  legacy.outposts[0].activeProduction = ['iron', 'sealant', 'mangled']
  const migrated = migrateNetworkData(legacy, (id) => id === 'sealant' ? 'organic' : id === 'iron' ? 'inorganic' : undefined)
  assert.equal(migrated.schemaVersion, 5)
  assert.equal(migrated.character.capabilities.xTechExtraction, true)
  assert.deepEqual(migrated.outposts[0].explicitResourcePresence, [])
  assert.deepEqual(migrated.outposts[0].selectedBiomeIds, [])
  assert.deepEqual(migrated.outposts[0].activeProduction, [
    { type: 'inorganic', resourceId: 'iron' },
    { type: 'organic-unspecified', resourceId: 'sealant' },
    { type: 'inorganic', resourceId: 'mangled' },
  ])
  assert.equal(
    deserializeNetwork(JSON.stringify(legacy)).outposts[0].activeProduction[1].type,
    'organic-unspecified',
  )
})

test('schema-3 export/import migrates while preserving biome IDs and routes', () => {
  const network = networkFixture()
  network.outposts[0].selectedBiomeIds = ['b0', 'b1']
  network.outposts[0].activeProduction = [{ type: 'organic', resourceId: 'sealant', speciesId: 'plant-a' }]
  const migrated = deserializeNetwork(serializeNetwork(network), referenceFixture())
  assert.equal(migrated.schemaVersion, 5)
  assert.deepEqual(migrated.outposts[0].selectedBiomeIds, network.outposts[0].selectedBiomeIds)
  assert.deepEqual(migrated.outposts[0].activeProduction, network.outposts[0].activeProduction)
  const data = referenceFixture()
  assert.equal(activeProductionValidForBodyRule.validate(migrated, data).length, 0)

  const wrongBody = structuredClone(network)
  wrongBody.outposts[0].bodyId = 'other'
  wrongBody.outposts[0].activeProduction = [
    { type: 'organic', resourceId: 'sealant', speciesId: 'plant-b' },
  ]
  const wrongBodyImport = deserializeNetwork(serializeNetwork(wrongBody), data)
  assert.deepEqual(wrongBodyImport.outposts[0].selectedBiomeIds, ['b0', 'b1'])
  assert.equal(activeProductionValidForBodyRule.validate(wrongBodyImport, data).length, 1)

  const wildOnly = structuredClone(network)
  wildOnly.outposts[0].activeProduction = [
    { type: 'organic', resourceId: 'sealant', speciesId: 'wild-plant' },
  ]
  const wildOnlyImport = deserializeNetwork(serializeNetwork(wildOnly), data)
  assert.equal(activeProductionValidForBodyRule.validate(wildOnlyImport, data).length, 1)
})

test('biome, unspecified-source, and farming-input validators have separate ownership', () => {
  const data = referenceFixture()
  const network = networkFixture()
  const outpost = network.outposts[0]
  outpost.selectedBiomeIds = ['missing', 'foreign', 'foreign']
  outpost.activeProduction = [
    { type: 'organic-unspecified', resourceId: 'sealant' },
    { type: 'organic', resourceId: 'sealant', speciesId: 'plant-a' },
  ]
  assert.equal(unknownReferenceDataIdRule.validate(network, data).filter((issue) => issue.bodyBiomeId).length, 1)
  assert.equal(selectedBiomeValidForBodyRule.validate(network, data).length, 2)
  assert.equal(duplicateCollectionEntriesRule.validate(network).filter((issue) => issue.bodyBiomeId).length, 1)
  assert.equal(unspecifiedOrganicProductionSourceRule.validate(network).length, 1)
  assert.equal(organicFarmingInputsUnavailableRule.validate(network, data).length, 1)

  outpost.selectedBiomeIds = ['b0']
  assert.equal(organicFarmingInputsUnavailableRule.validate(network, data).length, 1)
  outpost.plannedSupply = [{ type: 'resource', id: 'water' }]
  assert.equal(organicFarmingInputsUnavailableRule.validate(network, data).length, 0)
})

test('new outposts are unrestricted by default', () => {
  assert.deepEqual(createDefaultOutpost([]).selectedBiomeIds, [])
})

test('location changes clear biomes and one Undo restores a grouped selection', () => {
  const network = networkFixture()
  network.outposts[0].selectedBiomeIds = ['b0', 'b1']
  assert.deepEqual(changeOutpostBody(network.outposts[0], 'other').selectedBiomeIds, [])
  assert.deepEqual(changeOutpostSystem(network.outposts[0], 'other-system').selectedBiomeIds, [])

  let session = createCollectionEditingSession({
    schemaVersion: 1, networks: [{ id: 'only', network }], activeNetworkId: 'only',
  })
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', label: 'Toggle grouped biome', timestamp: 1,
    update: (current) => ({ ...current, outposts: [toggleOutpostBiomeGroup(current.outposts[0], ['b0', 'b1'])] }),
  })
  assert.deepEqual(session.collection.networks[0].network.outposts[0].selectedBiomeIds, [])
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.deepEqual(session.collection.networks[0].network.outposts[0].selectedBiomeIds, ['b0', 'b1'])
})

test('choosing a specific organic source retires unspecified without recreating it later', () => {
  const outpost = networkFixture().outposts[0]
  outpost.activeProduction = [{ type: 'organic-unspecified', resourceId: 'sealant' }]
  const route = { type: 'organic', resourceId: 'sealant', speciesId: 'plant-a' }
  const resolved = toggleOutpostProductionRoute(outpost, route)
  assert.deepEqual(resolved.activeProduction, [route])
  assert.deepEqual(toggleOutpostProductionRoute(resolved, route).activeProduction, [])
})
