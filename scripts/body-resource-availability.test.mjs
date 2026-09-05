/**
 * Purpose: Preserve occurrence-path and production semantics across reference updates.
 * Architecture: Synthetic edge cases plus checks against generated canonical data.
 * Change this file when: availability semantics or canonical fixtures change.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  getBodyPresentResourceIds, getBodyAtmosphericResourceIds, getBodyBiomeResourceIds,
  getBodyDomesticableOrganicResourceIds, getBodyProductionResources,
} from '../src/domain/bodyResourceAvailability.ts'

const productionIds = (data, bodyId) => getBodyProductionResources(data, bodyId).map((resource) => resource.id)

function fixture() {
  return {
    resources: ['biome', 'air', 'both', 'wild', 'farm'].map((id) => ({
      id, name: id, category: ['wild', 'farm'].includes(id) ? 'organic' : 'inorganic',
    })),
    bodyResources: [{ bodyId: 'body', resourceIds: ['biome', 'air', 'both', 'both', 'wild', 'farm'] }],
    inorganicOccurrences: [
      { bodyId: 'body', resourceId: 'biome', location: { type: 'biome', bodyBiomeId: 'one' } },
      { bodyId: 'body', resourceId: 'both', location: { type: 'biome', bodyBiomeId: 'one' } },
      { bodyId: 'body', resourceId: 'both', location: { type: 'biome', bodyBiomeId: 'two' } },
      ...['air', 'both', 'both'].map((resourceId) => ({ bodyId: 'body', resourceId, location: { type: 'atmosphere' } })),
      { bodyId: 'other', resourceId: 'biome', location: { type: 'atmosphere' } },
    ],
    biomes: [{ id: 'biome-one', name: 'One' }, { id: 'biome-two', name: 'Two' }],
    bodyBiomes: [
      { id: 'one', bodyId: 'body', biomeId: 'biome-one', biomeIndex: 0 },
      { id: 'two', bodyId: 'body', biomeId: 'biome-two', biomeIndex: 1 },
    ],
    planetSpecies: [
      { bodyId: 'body', speciesId: 'wild-species', resourceId: 'wild', domesticable: false },
      { bodyId: 'other', speciesId: 'wild-species', resourceId: 'wild', domesticable: true },
      { bodyId: 'body', speciesId: 'farm-species', resourceId: 'farm', domesticable: true },
      { bodyId: 'body', speciesId: 'farm-species', resourceId: 'farm', domesticable: true },
      { bodyId: 'body', speciesId: 'none', resourceId: null, domesticable: true },
    ],
    organicOccurrences: [{ bodyBiomeId: 'one', speciesId: 'wild-species' }, { bodyBiomeId: 'one', speciesId: 'farm-species' }],
    species: [], products: [], productRecipes: [], systems: [], bodies: [],
    organicFarmingProfiles: [{ sourceClass: 'plant', inputs: [{ resourceId: 'wild', quantity: 1 }] }],
  }
}

test('biome-only, atmospheric-only and shared inorganics retain one logical identity', () => {
  const data = fixture()
  const before = structuredClone(data)
  assert.deepEqual(getBodyPresentResourceIds(data, 'body'), ['biome', 'air', 'both', 'wild', 'farm'])
  assert.deepEqual(getBodyAtmosphericResourceIds(data, 'body'), ['air', 'both'])
  assert.deepEqual(getBodyBiomeResourceIds(data, 'body'), ['biome', 'both'])
  assert.deepEqual(productionIds(data, 'body'), ['biome', 'air', 'both', 'farm'])
  assert.deepEqual(data, before)
})

test('wild-only presence and farming inputs do not imply domesticable production', () => {
  const data = fixture()
  assert.ok(getBodyPresentResourceIds(data, 'body').includes('wild'))
  assert.deepEqual(getBodyDomesticableOrganicResourceIds(data, 'body'), ['farm'])
  assert.ok(!productionIds(data, 'body').includes('wild'))
  assert.ok(productionIds(data, 'body').includes('farm'))
})

test('empty and unknown body selections return empty availability', () => {
  for (const bodyId of [null, '', 'missing']) {
    for (const helper of [getBodyPresentResourceIds, getBodyAtmosphericResourceIds,
      getBodyBiomeResourceIds, getBodyDomesticableOrganicResourceIds, getBodyProductionResources]) {
      assert.deepEqual(helper(fixture(), bodyId), [])
    }
  }
})

const generated = Object.fromEntries(await Promise.all([
  ['bodies', 'bodies'], ['resources', 'resources'], ['bodyResources', 'body-resources'],
  ['planetSpecies', 'planet-species'], ['inorganicOccurrences', 'inorganic-occurrences'],
  ['bodyBiomes', 'body-biomes'], ['organicOccurrences', 'organic-occurrences'],
].map(async ([key, file]) => [key, JSON.parse(await readFile(new URL(`../public/reference-data/${file}.json`, import.meta.url), 'utf8'))])))

test('generated atmospheric resources are present and production-valid without duplicates', (t) => {
  let atmosphericOnly
  let shared
  for (const entry of generated.inorganicOccurrences.filter((entry) => entry.location.type === 'atmosphere')) {
    const present = getBodyPresentResourceIds(generated, entry.bodyId)
    const production = productionIds(generated, entry.bodyId)
    assert.equal(present.filter((id) => id === entry.resourceId).length, 1)
    assert.equal(production.filter((id) => id === entry.resourceId).length, 1)
    if (getBodyBiomeResourceIds(generated, entry.bodyId).includes(entry.resourceId)) shared ??= entry
    else atmosphericOnly ??= entry
  }
  assert.ok(atmosphericOnly)
  assert.ok(shared)
  for (const [label, entry] of [['Atmospheric only', atmosphericOnly], ['Atmosphere and biome', shared]]) {
    t.diagnostic(`${label}: ${generated.bodies.find((body) => body.id === entry.bodyId).name} / ${entry.resourceId}`)
  }
})

test('generated wild-only, Montara Luna domesticables and Shattered Space remain intact', (t) => {
  const wild = generated.planetSpecies.find((entry) => entry.resourceId && !entry.domesticable &&
    !getBodyDomesticableOrganicResourceIds(generated, entry.bodyId).includes(entry.resourceId))
  assert.ok(wild)
  assert.ok(getBodyPresentResourceIds(generated, wild.bodyId).includes(wild.resourceId))
  assert.ok(!productionIds(generated, wild.bodyId).includes(wild.resourceId))
  const montara = generated.bodies.find((body) => body.name === 'Montara Luna')
  assert.ok(montara)
  const farmable = getBodyDomesticableOrganicResourceIds(generated, montara.id)
  assert.ok(farmable.length > 0)
  for (const id of farmable) assert.ok(productionIds(generated, montara.id).includes(id))
  const dlc = generated.bodies.find((body) => body.name === "Va'ruun'kai")
  assert.ok(dlc)
  assert.ok(getBodyPresentResourceIds(generated, dlc.id).length > 0)
  t.diagnostic(`Wild-only: ${generated.bodies.find((body) => body.id === wild.bodyId).name} / ${wild.resourceId}; Montara Luna: ${farmable.join(', ')}; Shattered Space: ${dlc.name}`)
})
