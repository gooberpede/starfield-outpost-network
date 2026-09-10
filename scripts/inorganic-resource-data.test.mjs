/** Golden and adversarial checks for canonical inorganic identity migration. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { buildProductRecipes } from './build-reference-data.mjs'
import {
  LEGACY_INORGANIC_RESOURCE_IDS,
  buildInorganicResources,
  parseCanonicalInorganicCsv,
  parseInorganicTrackerPolicyCsv,
} from './inorganic-resource-data.mjs'

const sourceUrl = new URL('../reference-source/inorganic-resource-dictionary.csv', import.meta.url)
const policyUrl = new URL('../reference-source/inorganic-resource-tracker-policy.csv', import.meta.url)
const sourceCsv = await readFile(sourceUrl, 'utf8')
const policyCsv = await readFile(policyUrl, 'utf8')
const canonicalRows = parseCanonicalInorganicCsv(sourceCsv)
const policyRows = parseInorganicTrackerPolicyCsv(policyCsv)
const built = buildInorganicResources(canonicalRows, policyRows)

test('canonical extract and policy preserve the complete explicit inventory', () => {
  assert.equal(canonicalRows.length, 48)
  assert.equal(policyRows.length, 48)
  assert.equal(canonicalRows.filter((row) => row.SourceFile === 'Starfield.esm').length, 47)
  assert.equal(canonicalRows.filter((row) => row.SourceFile === 'SFBGS00D.esm').length, 1)
  assert.equal(built.resources.length, 45)
  assert.deepEqual(new Set(built.resources.map((resource) => resource.id)), LEGACY_INORGANIC_RESOURCE_IDS)
})

test('golden canonical facts crosswalk to stable tracker identity and presentation', () => {
  const entry = (formId) => built.resourceByFormId.get(formId)
  assert.deepEqual(
    { id: entry('000057D6').resource.id, name: entry('000057D6').resource.name },
    { id: 'aluminium', name: 'Aluminum' },
  )
  assert.equal(entry('00005DF5').resource.parentId, 'caesium')
  assert.equal(entry('000057E8').resource.shortName, 'R-COOH')
  assert.deepEqual(
    [entry('000057F5'), entry('000083EC')].map(({ canonical, resource }) => ({
      id: resource.id,
      sourceRarity: canonical.SNAMRarity,
      trackerRarity: resource.rarity,
      placement: resource.plannedSupplyPlacement,
      order: resource.sortOrder,
    })),
    [
      { id: 'helium-3', sourceRarity: 'Special', trackerRarity: 'common', placement: 'special', order: 1 },
      { id: 'water', sourceRarity: 'Everywhere', trackerRarity: 'common', placement: 'special', order: 2 },
    ],
  )
  assert.equal(built.policyByFormId.get('01033E3F').Disposition, 'special-deferred')
  assert.equal(built.policyByFormId.get('00006529').Disposition, 'excluded')
  assert.equal(built.policyByFormId.get('00252074').Disposition, 'excluded')
})

test('deferred and excluded canonical rows do not leak into runtime resources', async () => {
  const runtimeResources = JSON.parse(
    await readFile(new URL('../public/reference-data/resources.json', import.meta.url), 'utf8'),
  )
  const ids = new Set(runtimeResources.map((resource) => resource.id))
  for (const id of ['x-tech', 'aqueous-hematite', 'caelumite']) assert.equal(ids.has(id), false)
  assert.equal(runtimeResources.filter((resource) => resource.category === 'inorganic').length, 45)
})

test('canonical parser rejects contract, identity, parent, and classification faults', () => {
  assert.throws(() => parseCanonicalInorganicCsv(sourceCsv.replace('SourceFile,', 'WrongHeader,')), /headers/)
  assert.throws(() => parseCanonicalInorganicCsv(sourceCsv.replace('01033E3F', '000057D6')), /Duplicate canonical ResourceFormID/)
  assert.throws(() => parseCanonicalInorganicCsv(sourceCsv.replace('Y2_Res_X-Tech', 'ResInorgRareMercury_L')), /Duplicate canonical ResourceEditorID/)
  assert.throws(() => parseCanonicalInorganicCsv(sourceCsv.replace('Y2_X-Tech_Resource_Keyword', 'UnknownKeyword')), /ClassificationKeyword/)
  assert.throws(() => parseCanonicalInorganicCsv(sourceCsv.replace('"000057E0","ResInorgExoticCaesium_L","Caesium"', '"FFFFFFFF","ResInorgExoticCaesium_L","Caesium"')), /unknown parent FormID/)
  const cyclic = sourceCsv.replace(
    '"ResourceTypeCraftingInorganicCommon","","","",""\r\n"Starfield.esm","2026-09-10 20:37:10","000057D5"',
    '"ResourceTypeCraftingInorganicCommon","Starfield.esm","000057D8","ResInorgUncommonBeryllium","Beryllium"\r\n"Starfield.esm","2026-09-10 20:37:10","000057D5"',
  )
  assert.throws(() => parseCanonicalInorganicCsv(cyclic), /cycle/)
})

test('policy completeness is exact and independent of source row order', () => {
  assert.throws(() => buildInorganicResources(canonicalRows, policyRows.slice(1)), /one-to-one/)
  const reversed = buildInorganicResources(canonicalRows, [...policyRows].reverse())
  assert.deepEqual(reversed.resources, built.resources)
})

test('legacy Aluminium recipe spelling resolves explicitly to app ID aluminium', () => {
  const products = [{ id: 'frame', name: 'Frame', shortName: 'Fr', rarity: 'common' }]
  const recipes = buildProductRecipes(
    [{ Product: 'Frame', Ingredient: 'Aluminium', Quantity: '1' }],
    built.resources,
    products,
  )
  assert.deepEqual(recipes[0].ingredients[0], {
    item: { type: 'resource', id: 'aluminium' },
    quantity: 1,
  })
  assert.throws(
    () => buildProductRecipes([{ Product: 'Frame', Ingredient: 'Unknown', Quantity: '1' }], built.resources, products),
    /unknown ingredient/,
  )
})
