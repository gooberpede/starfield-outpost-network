/**
 * Purpose: Guard the distinction between body presence and local production.
 * Architecture: Exercises the actual domain validator and matrix helper with
 *   isolated reference/network fixtures, without modifying persisted data.
 * Change this file when: production eligibility or warning contracts change.
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { activeProductionValidForBodyRule } from '../src/domain/validation/rules/activeProductionValidForBody.ts'
import { getBodyProductionResources } from '../src/domain/bodyResourceAvailability.ts'

function fixture(domesticable = false) {
  const referenceData = {
    systems: [{ id: 'system', name: 'System' }],
    bodies: [{
      id: 'body', systemId: 'system', name: 'Body', bodyType: 'planet',
      outpostAllowed: true, solarArrayPower: null, windTurbinePower: null,
      planetaryHabitationRank: null,
    }],
    resources: [
      { id: 'toxin', name: 'Toxin', shortName: 'Txn', category: 'organic', rarity: 'common', parentId: null, sortOrder: null },
      { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
    ],
    bodyResources: [{ bodyId: 'body', resourceIds: ['toxin', 'iron'] }],
    planetSpecies: [{ bodyId: 'body', speciesId: 'species', sourceClass: 'plant', domesticable, resourceId: 'toxin' }],
    species: [{ id: 'species', name: 'Plant', type: 'flora' }],
    biomes: [{ id: 'biome', name: 'Biome' }],
    bodyBiomes: [{ id: 'body:0', bodyId: 'body', biomeId: 'biome', biomeIndex: 0 }],
    inorganicOccurrences: [{ bodyId: 'body', resourceId: 'iron', location: { type: 'biome', bodyBiomeId: 'body:0' } }],
    organicOccurrences: [{ bodyBiomeId: 'body:0', speciesId: 'species' }],
    organicFarmingProfiles: [], products: [], productRecipes: [],
  }
  const network = {
    schemaVersion: 1,
    character: { name: '', level: null, skills: {
      outpostManagement: null, outpostEngineering: null, planetaryHabitation: null,
      researchMethods: null, specialProjects: null,
    } },
    outposts: [{
      id: 'outpost', name: 'Outpost', systemId: 'system', bodyId: 'body',
      selectedBiomeIds: [], localResources: [],
      activeProduction: [{ type: 'organic', resourceId: 'toxin', speciesId: 'species' }],
      manufacturing: [], plannedSupply: [], cargoPads: [],
    }],
    cargoLinks: [],
  }
  return { network, referenceData }
}

test('wild-only organic presence produces the normal active-production warning', () => {
  const { network, referenceData } = fixture()
  const before = structuredClone(network)
  assert.deepEqual(activeProductionValidForBodyRule.validate(network, referenceData), [{
    ruleId: 'active-production-valid-for-body', category: 'operational', severity: 'warning',
    message: 'This organic source is marked as actively producing, but it is not available for the selected body and biomes.',
    outpostId: 'outpost', speciesId: 'species', cargoItem: { type: 'resource', id: 'toxin' },
  }])
  assert.deepEqual(getBodyProductionResources(referenceData, 'body').map((resource) => resource.id), ['iron'])
  assert.deepEqual(network, before)
})

test('organic production with a domesticable source remains valid', () => {
  const { network, referenceData } = fixture(true)
  assert.deepEqual(activeProductionValidForBodyRule.validate(network, referenceData), [])
  assert.deepEqual(getBodyProductionResources(referenceData, 'body').map((resource) => resource.id), ['toxin', 'iron'])
})

test('inorganic production present on the body remains valid', () => {
  const { network, referenceData } = fixture()
  network.outposts[0].activeProduction = [{ type: 'inorganic', resourceId: 'iron' }]
  assert.deepEqual(activeProductionValidForBodyRule.validate(network, referenceData), [])
})

test('a domesticable source on another body does not permit local production', () => {
  const { network, referenceData } = fixture()
  referenceData.planetSpecies.push({ ...referenceData.planetSpecies[0], bodyId: 'other-body', domesticable: true })
  assert.equal(activeProductionValidForBodyRule.validate(network, referenceData).length, 1)
})

test('unknown references and missing body inventories retain their existing guards', () => {
  const { network, referenceData } = fixture()
  assert.deepEqual(activeProductionValidForBodyRule.validate(network), [])
  network.outposts[0].bodyId = 'unknown'
  assert.deepEqual(activeProductionValidForBodyRule.validate(network, referenceData), [])
  network.outposts[0].bodyId = 'body'
  network.outposts[0].activeProduction = [{ type: 'inorganic', resourceId: 'unknown' }]
  assert.deepEqual(activeProductionValidForBodyRule.validate(network, referenceData), [])
  network.outposts[0].activeProduction = [{ type: 'organic', resourceId: 'toxin', speciesId: 'species' }]
  referenceData.bodyResources = []
  assert.equal(activeProductionValidForBodyRule.validate(network, referenceData).length, 1)
})
