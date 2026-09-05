/**
 * Purpose: Exercise habitation requirements and diagnostic ownership together.
 * Architecture: Run the real registry through Node's TypeScript support; the
 *   test-only resolver supports the application's extensionless domain imports.
 * Change this file when: rank or validation interaction contracts change.
 */
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context)
    }
    return nextResolve(specifier, context)
  },
})
const { validateNetwork } = await import('../src/domain/validation/validateNetwork.ts')

const RULE_ID = 'planetary-habitation-requirement'

function fixture(requirement = 4, rank = 3) {
  return {
    network: {
      schemaVersion: 1,
      character: { name: '', level: null, skills: {
        outpostManagement: null, outpostEngineering: null, planetaryHabitation: rank,
        researchMethods: null, specialProjects: null,
      } },
      outposts: [{ id: 'outpost', name: 'Outpost', systemId: 'system', bodyId: 'body',
        localResources: [], activeProduction: [], manufacturing: [], plannedSupply: [], cargoPads: [] }],
      cargoLinks: [],
    },
    referenceData: {
      systems: [{ id: 'system', name: 'System' }],
      bodies: [{ id: 'body', systemId: 'system', name: 'Body', bodyType: 'planet',
        outpostAllowed: true, planetaryHabitationRank: requirement, solarArrayPower: null, windTurbinePower: null }],
      resources: [], products: [], bodyResources: [], productRecipes: [],
      biomes: [], bodyBiomes: [], inorganicOccurrences: [], species: [], planetSpecies: [],
      organicOccurrences: [], organicFarmingProfiles: [],
    },
  }
}

for (const [required, rank, count] of [
  [0, 0, 0], [1, 0, 1], [4, 4, 0], [4, 3, 1], [1, 4, 0], [null, 0, 0], [4, null, 0],
]) {
  test(`requirement ${required}, recorded rank ${rank}: ${count} habitation issues`, () => {
    const { network, referenceData } = fixture(required, rank)
    const before = structuredClone(network)
    const issues = validateNetwork(network, referenceData)
    assert.equal(issues.length, count)
    if (count) assert.deepEqual(issues[0], {
      ruleId: RULE_ID, category: 'operational', severity: 'warning', outpostId: 'outpost',
      message: `This outpost requires Planetary Habitation rank ${required}, but the recorded character rank is ${rank}.`,
    })
    assert.deepEqual(network, before)
  })
}

for (const rank of [-1, 5, 1.5, NaN, Infinity, -Infinity, '2']) {
  test(`invalid rank ${rank} is structural, never habitation insufficiency`, () => {
    const { network, referenceData } = fixture(4, rank)
    const issues = validateNetwork(network, referenceData)
    assert.equal(issues.filter((issue) => issue.ruleId === 'invalid-skill-level').length, 1)
    assert.equal(issues.filter((issue) => issue.ruleId === RULE_ID).length, 0)
  })
}

test('missing selections, references and ineligible bodies do not duplicate habitation issues', () => {
  const { network, referenceData } = fixture()
  assert.deepEqual(validateNetwork(network), [])
  network.outposts[0].bodyId = ''
  assert.deepEqual(validateNetwork(network, referenceData), [])
  network.outposts[0].bodyId = 'unknown'
  assert.deepEqual(validateNetwork(network, referenceData).map((issue) => issue.ruleId), ['unknown-reference-data-id'])
  network.outposts[0].bodyId = 'body'
  referenceData.bodies[0].outpostAllowed = false
  assert.deepEqual(validateNetwork(network, referenceData).map((issue) => issue.ruleId), ['outpost-body-not-eligible'])
})

test('generated body requirements preserve zero, positive and null semantics', async (t) => {
  const bodies = JSON.parse(await readFile(new URL('../public/reference-data/bodies.json', import.meta.url), 'utf8'))
  const { network, referenceData } = fixture(0, 0)
  referenceData.bodies = bodies
  for (const [label, predicate, expected] of [
    ['zero', (body) => body.outpostAllowed && body.planetaryHabitationRank === 0, 0],
    ['positive', (body) => body.outpostAllowed && body.planetaryHabitationRank > 0, 1],
    ['null', (body) => body.planetaryHabitationRank === null, 0],
  ]) {
    const body = bodies.find(predicate)
    assert.ok(body)
    network.outposts[0].bodyId = body.id
    assert.equal(validateNetwork(network, referenceData, new Set([RULE_ID])).length, expected)
    t.diagnostic(`${label} requirement: ${body.name} (${body.planetaryHabitationRank})`)
  }
  for (const body of bodies.filter((body) => body.planetaryHabitationRank === null)) {
    network.outposts[0].bodyId = body.id
    assert.deepEqual(validateNetwork(network, referenceData, new Set([RULE_ID])), [])
  }
})

test('body/system and production diagnostics stay independent; one habitation issue per outpost', () => {
  const { network, referenceData } = fixture()
  referenceData.systems.push({ id: 'other', name: 'Other' })
  network.outposts[0].systemId = 'other'
  referenceData.resources.push({ id: 'iron', category: 'inorganic' })
  referenceData.bodyResources.push({ bodyId: 'body', resourceIds: [] })
  network.outposts[0].activeProduction = ['iron']
  const ids = validateNetwork(network, referenceData).map((issue) => issue.ruleId)
  assert.deepEqual(ids, ['body-system-mismatch', 'active-production-valid-for-body', RULE_ID])
  network.outposts.push({ ...network.outposts[0], id: 'second', name: 'Second' })
  assert.deepEqual(validateNetwork(network, referenceData, new Set([RULE_ID])).map((issue) => issue.outpostId), ['outpost', 'second'])
  assert.deepEqual(validateNetwork(network, referenceData, new Set()), [])
})
