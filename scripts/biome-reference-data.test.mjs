/**
 * Purpose: Regression checks for source joins and canonical assertion failures.
 * Architecture: Uses current extracts and mutated copies; never edits source CSVs.
 * Change this file when: canonical invariants or supported manifest schemas change.
 */
import assert from 'node:assert/strict'
import { readFile, mkdtemp, writeFile, rm, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { parse } from 'csv-parse/sync'
import { buildBiomeData, parseBodyNumber, validateInorganicManifest } from './biome-reference-data.mjs'
import { buildBodies, validatePlanetDirectory } from './build-reference-data.mjs'
import {
  buildInorganicResources,
  parseCanonicalInorganicCsv,
  parseInorganicTrackerPolicyCsv,
} from './inorganic-resource-data.mjs'

const csv = async (name) => parse(await readFile(new URL(`../reference-source/${name}.csv`, import.meta.url), 'utf8'), { columns: true, trim: true, bom: true })
const planets = await csv('planet-directory')
const inorganic = await csv('biome-inorganic-resources')
const organic = await csv('biome-organic-resources')
const bodies = buildBodies(planets)
const resources = JSON.parse(await readFile(new URL('../public/reference-data/resources.json', import.meta.url), 'utf8'))
const canonicalInorganicRows = parseCanonicalInorganicCsv(
  await readFile(new URL('../reference-source/inorganic-resource-dictionary.csv', import.meta.url), 'utf8'),
)
const inorganicPolicyRows = parseInorganicTrackerPolicyCsv(
  await readFile(new URL('../reference-source/inorganic-resource-tracker-policy.csv', import.meta.url), 'utf8'),
)
const { resourceByFormId } = buildInorganicResources(canonicalInorganicRows, inorganicPolicyRows)
const build = (i = inorganic, o = organic) =>
  buildBiomeData(i, o, bodies, resources, resourceByFormId)

test('canonical data retains all occurrence grains and wild-only presence', () => {
  validatePlanetDirectory(planets)
  const data = build()
  assert.equal(data.inorganicOccurrences.length, 7780)
  assert.equal(data.organicOccurrences.length, 3855)
  assert.equal(data.planetSpecies.filter((entry) => entry.resourceId === null).length, 2)
  assert.equal(data.organicFarmingProfiles.length, 3)
  const wild = data.planetSpecies.find((entry) => entry.resourceId && !entry.domesticable &&
    !data.planetSpecies.some((other) => other.bodyId === entry.bodyId && other.resourceId === entry.resourceId && other.domesticable))
  assert.ok(data.bodyResources.find((entry) => entry.bodyId === wild.bodyId).resourceIds.includes(wild.resourceId))
  const duplicateName = data.bodyBiomes.some((entry) => data.bodyBiomes.some((other) =>
    entry.bodyId === other.bodyId && entry.biomeId !== other.biomeId &&
    data.biomes.find((biome) => biome.id === entry.biomeId).name === data.biomes.find((biome) => biome.id === other.biomeId).name))
  assert.ok(duplicateName)
})

for (const [field, value, diagnostic] of [
  ['PlanetFormID', 'missing', /unresolved body/],
  ['LocationType', 'OCEAN', /LocationType/],
  ['BiomeFormID', '', /BiomeFormID/],
  ['BiomeIndex', '-1', /BiomeIndex/],
  ['ResourceFormID', 'FFFFFFFF', /cannot crosswalk inorganic FormID/],
  ['ResourceName', 'unmapped', /contradictory inorganic name/],
  ['ResourceEditorID', 'WrongEditorId', /contradictory ResourceEditorID/],
  ['StarSystemID', 'bad', /contradictory system/],
]) {
  test(`inorganic rejects ${field}=${value}`, () => {
    assert.throws(() => build([{ ...inorganic[0], [field]: value }], []), diagnostic)
  })
}

test('biome identity conflicts fail while exact repetitions deduplicate', () => {
  const row = inorganic[0]
  assert.throws(() => build([row, { ...row, BiomeFormID: 'different' }], []), /conflicting/)
  assert.throws(() => build([row, { ...row, BiomeIndex: '99' }], []), /conflicting/)
  assert.throws(() => build([row, { ...row, BiomeName: 'different' }], []), /conflicting/)
  assert.throws(() => build([row, { ...row, Rarity: 'different' }], []), /conflicting/)
  assert.equal(build([row, row], []).inorganicOccurrences.length, 1)
  const shared = inorganic.find((i) => organic.some((o) => o.PlanetFormID === i.PlanetFormID && o.BiomeIndex === i.BiomeIndex))
  const sharedOrganic = organic.find((o) => o.PlanetFormID === shared.PlanetFormID && o.BiomeIndex === shared.BiomeIndex)
  assert.throws(() => build([shared], [{ ...sharedOrganic, BiomeName: 'contradiction' }]), /conflicting/)
})

for (const [field, value, diagnostic] of [
  ['Domesticable', 'Maybe', /Domesticable/],
  ['ResourceFormID', '', /FormID/],
  ['ResourceName', 'missing', /crosswalk/],
  ['ResourceInput1Name', 'missing', /contradictory inorganic name/],
  ['ResourceInput1Qty', '3', /signature/],
  ['ResourceResolutionStatus', 'Unknown', /ResourceResolutionStatus/],
]) {
  test(`organic rejects ${field}=${value}`, () => {
    assert.throws(() => build([], [{ ...organic[0], [field]: value }]), diagnostic)
  })
}

test('planet/species facts and global species metadata must agree', () => {
  const row = organic[0]
  for (const change of [
    { Domesticable: 'Yes' },
    { SpeciesDisplayName: 'different' },
    { ResourceFormID: '0007782D', ResourceName: 'Sealant' },
    { ResourceInput2FormID: '000777E6', ResourceInput2Name: 'Nutrient' },
  ]) assert.throws(() => build([], [row, { ...row, ...change }]), /conflicting/)
})

test('directory duplicates and unsupported numeric/body values fail', () => {
  assert.throws(() => buildBodies([planets[0], planets[0]]), /Duplicate PlanetFormID/)
  assert.throws(() => validatePlanetDirectory([{ ...planets[0], BodyType: 'unknown' }]), /BodyType/)
  assert.throws(() => validatePlanetDirectory([{ ...planets[0], StarSystemID: '1x' }]), /StarSystemID/)
  for (const field of ['SolarArrayPower', 'WindTurbinePower', 'PlanetaryHabitationRank']) {
    assert.equal(parseBodyNumber({ PlanetFormID: 'test', [field]: '' }, field), null)
    assert.equal(parseBodyNumber({ PlanetFormID: 'test', [field]: '0' }, field), 0)
    for (const value of ['-1', 'NaN', 'Infinity', '1junk']) {
      assert.throws(() => parseBodyNumber({ PlanetFormID: 'test', [field]: value }, field), /invalid/)
    }
  }
  assert.throws(() => parseBodyNumber({ PlanetaryHabitationRank: '5' }, 'PlanetaryHabitationRank'), /invalid/)
})

test('manifest is optional, validates each assertion, and ignores upstream provenance', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'biome-manifest-test-'))
  const path = join(directory, 'manifest.json')
  try {
    await validateInorganicManifest(path, inorganic)
    const manifest = JSON.parse(await readFile(new URL('../reference-source/biome-inorganic-resources.manifest.json', import.meta.url), 'utf8'))
    await writeFile(path, JSON.stringify({ ...manifest, input_datasets: [{ sha256: 'deliberately different', row_count: 0 }] }))
    await validateInorganicManifest(path, inorganic)
    for (const patch of [
      { dataset: 'wrong' }, { schema_version: 2 }, { output_filename: 'wrong.csv' },
      { row_count: 0 }, { location_row_counts: { BIOME: 0 } }, { location_row_counts: { ATMOSPHERE: 0 } },
    ]) {
      await writeFile(path, JSON.stringify({ ...manifest, ...patch }))
      await assert.rejects(() => validateInorganicManifest(path, inorganic), /expected .*actual/)
    }
  } finally {
    await rm(path, { force: true })
    await rmdir(directory)
  }
})
