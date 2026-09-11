/** Golden and adversarial checks for canonical item and recipe generation. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from 'csv-parse/sync'

import {
  BESPOKE_EXTRACT_TIMESTAMP,
  BESPOKE_SOURCE_FILE,
  INDUSTRIAL_WORKBENCH_HEADERS,
  ITEM_TRACKER_METADATA_HEADERS,
  buildItemReferenceData,
  parseIndustrialWorkbenchCsv,
  parseItemTrackerMetadataCsv,
  reduceCanonicalOrganicIdentities,
  validateCurrentItemPopulation,
} from './item-reference-data.mjs'
import {
  buildInorganicResources,
  parseCanonicalInorganicCsv,
  parseInorganicTrackerPolicyCsv,
} from './inorganic-resource-data.mjs'

const read = (name) => readFile(new URL(`../reference-source/${name}`, import.meta.url), 'utf8')
const industrialCsv = await read('industrial-workbench.csv')
const metadataCsv = await read('item-tracker-metadata.csv')
const organicCsv = await read('biome-organic-resources.csv')
const inorganicCsv = await read('inorganic-resource-dictionary.csv')
const inorganicPolicyCsv = await read('inorganic-resource-tracker-policy.csv')
const recipeRows = parseIndustrialWorkbenchCsv(industrialCsv)
const metadataRows = parseItemTrackerMetadataCsv(metadataCsv)
const organicRows = parse(organicCsv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
const inorganicBuild = buildInorganicResources(
  parseCanonicalInorganicCsv(inorganicCsv),
  parseInorganicTrackerPolicyCsv(inorganicPolicyCsv),
)
const built = buildItemReferenceData(
  recipeRows,
  organicRows,
  metadataRows,
  inorganicBuild.resourceByFormId,
)

function csvCell(value) {
  return JSON.stringify(String(value))
}

function toCsv(headers, rows) {
  return [headers.join(','), ...rows.map((row) =>
    headers.map((header) => csvCell(row[header] ?? '')).join(','),
  )].join('\n')
}

function recipeRow(overrides = {}) {
  return {
    SourceFile: 'Starfield.esm',
    ExtractTimestamp: '2026-09-11 13:11:31',
    ProductFormID: '00000001',
    ProductEditorID: 'ProductA',
    ProductName: 'Product A',
    RecipeSourceFile: 'Starfield.esm',
    RecipeFormID: '00000101',
    RecipeEditorID: 'RecipeA',
    IngredientSourceFile: 'Starfield.esm',
    IngredientFormID: '00001001',
    IngredientEditorID: 'ResourceA',
    IngredientName: 'Resource A',
    Quantity: '1',
    ...overrides,
  }
}

test('canonical source and metadata retain the reviewed populations and provenance', () => {
  validateCurrentItemPopulation(recipeRows, metadataRows)
  assert.equal(reduceCanonicalOrganicIdentities(organicRows).size, 30)
  assert.equal(metadataRows.filter((row) => row.ItemType === 'product').length, 30)
  assert.equal(metadataRows.filter((row) => row.ItemType === 'organic').length, 30)
  assert.ok(metadataRows.every((row) => row.SourceFile === BESPOKE_SOURCE_FILE))
  assert.ok(metadataRows.every((row) => row.ExtractTimestamp === BESPOKE_EXTRACT_TIMESTAMP))
  assert.equal(new Set(metadataRows.map((row) => row.ShortName)).size, 60)
  assert.ok(metadataRows.every((row) => !['Non', 'TxA', 'Unq'].includes(row.ShortName)))
})

test('stable IDs and intentional display decisions survive FormID crosswalking', async () => {
  assert.deepEqual(
    built.products.find((product) => product.id === 'substrate-molecular-sieve'),
    {
      id: 'substrate-molecular-sieve',
      name: 'Substrate Molecule Sieve',
      shortName: 'SMS',
      rarity: 'unique',
    },
  )
  assert.deepEqual(
    built.organicResourceByFormId.get('0007782F').resource,
    {
      id: 'gastronomic-delight',
      name: 'Gastronomic Delight',
      shortName: 'GDl',
      category: 'organic',
      rarity: 'unique',
      parentId: null,
      sortOrder: null,
      plannedSupplyPlacement: null,
    },
  )
  const currentProducts = JSON.parse(await readFile(
    new URL('../public/reference-data/products.json', import.meta.url),
    'utf8',
  ))
  assert.deepEqual(
    new Set(built.products.map((product) => product.id)),
    new Set(currentProducts.map((product) => product.id)),
  )
  const currentResources = JSON.parse(await readFile(
    new URL('../public/reference-data/resources.json', import.meta.url),
    'utf8',
  ))
  assert.deepEqual(
    new Set([
      ...inorganicBuild.resources.map((resource) => resource.id),
      ...built.organicResources.map((resource) => resource.id),
    ]),
    new Set(currentResources.map((resource) => resource.id)),
  )
})

test('every ingredient FormID resolves uniquely by canonical population', () => {
  const organicIds = new Set(built.organicResourceByFormId.keys())
  const inorganicIds = new Set(inorganicBuild.resourceByFormId.keys())
  const productIds = new Set(recipeRows.map((row) => row.ProductFormID))
  const classified = new Map()
  for (const row of recipeRows) {
    const matches = [inorganicIds, organicIds, productIds]
      .filter((ids) => ids.has(row.IngredientFormID)).length
    assert.equal(matches, 1, row.IngredientFormID)
    classified.set(
      row.IngredientFormID,
      inorganicIds.has(row.IngredientFormID) ? 'inorganic'
        : organicIds.has(row.IngredientFormID) ? 'organic' : 'product',
    )
  }
  assert.deepEqual(
    Object.fromEntries(['inorganic', 'organic', 'product'].map((type) => [
      type,
      [...classified.values()].filter((value) => value === type).length,
    ])),
    { inorganic: 30, organic: 8, product: 17 },
  )
  const aluminum = built.productRecipes
    .find((recipe) => recipe.productId === 'adaptive-frame').ingredients[0]
  assert.deepEqual(aluminum, {
    item: { type: 'resource', id: 'aluminium' },
    quantity: 1,
  })
})

test('reviewed canonical recipe delta is exactly one edge and one quantity', () => {
  const legacyRows = recipeRows
    .filter((row) => !(row.ProductName === 'Austenitic Manifold' &&
      row.IngredientName === 'Reactive Gauge'))
    .map((row) => row.ProductName === 'Mag Pressure Tank' && row.IngredientName === 'Aluminum'
      ? { ...row, Quantity: '1' }
      : row)
  const legacy = buildItemReferenceData(
    legacyRows,
    organicRows,
    metadataRows,
    inorganicBuild.resourceByFormId,
  )
  const flatten = (recipes) => new Map(recipes.flatMap((recipe) =>
    recipe.ingredients.map((ingredient) => [
      `${recipe.productId}:${ingredient.item.type}:${ingredient.item.id}`,
      ingredient.quantity,
    ]),
  ))
  const before = flatten(legacy.productRecipes)
  const after = flatten(built.productRecipes)
  const added = [...after].filter(([key]) => !before.has(key))
  const removed = [...before].filter(([key]) => !after.has(key))
  const changed = [...after].filter(([key, quantity]) =>
    before.has(key) && before.get(key) !== quantity,
  )
  assert.deepEqual(added, [['austenitic-manifold:product:reactive-gauge', 1]])
  assert.deepEqual(removed, [])
  assert.deepEqual(changed, [['mag-pressure-tank:resource:aluminium', 2]])
})

test('canonical parser rejects schema, identity, assignment, quantity, and graph faults', () => {
  const base = recipeRow()
  assert.throws(
    () => parseIndustrialWorkbenchCsv(toCsv(
      [...INDUSTRIAL_WORKBENCH_HEADERS.slice(0, -1), 'Wrong'],
      [base],
    )),
    /headers/,
  )
  assert.throws(
    () => parseIndustrialWorkbenchCsv(
      `${INDUSTRIAL_WORKBENCH_HEADERS.join(',')}\n${INDUSTRIAL_WORKBENCH_HEADERS.slice(0, -1).map((field) => csvCell(base[field])).join(',')}`,
    ),
    /columns|Record Length/,
  )
  for (const [overrides, diagnostic] of [
    [{ ProductFormID: 'bad' }, /FormID/],
    [{ ExtractTimestamp: '2026-99-99 13:11:31' }, /ExtractTimestamp/],
    [{ Quantity: '0' }, /Quantity/],
    [{ Quantity: '1.5' }, /Quantity/],
  ]) {
    assert.throws(
      () => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
        recipeRow(overrides),
      ])),
      diagnostic,
    )
  }
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base,
    recipeRow({ IngredientFormID: '00001002', IngredientEditorID: 'ResourceB',
      IngredientName: 'Resource B', ProductName: 'Changed' }),
  ])), /product identity.*conflicts/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base,
    recipeRow({ IngredientFormID: '00001002', IngredientEditorID: 'ResourceB',
      IngredientName: 'Resource B', RecipeEditorID: 'Changed' }),
  ])), /recipe identity.*conflicts/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base,
    recipeRow({ ProductFormID: '00000002', ProductEditorID: 'ProductB',
      ProductName: 'Product B', RecipeFormID: '00000102', RecipeEditorID: 'RecipeB',
      IngredientName: 'Changed' }),
  ])), /ingredient identity.*conflicts/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base,
    recipeRow({ IngredientFormID: '00001002', IngredientEditorID: 'ResourceB',
      IngredientName: 'Resource B', RecipeFormID: '00000102', RecipeEditorID: 'RecipeB' }),
  ])), /recipe assignment.*conflicts/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base,
    recipeRow({ ProductFormID: '00000002', ProductEditorID: 'ProductB',
      ProductName: 'Product B', IngredientFormID: '00001002',
      IngredientEditorID: 'ResourceB', IngredientName: 'Resource B' }),
  ])), /product assignment.*conflicts/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    base, base,
  ])), /duplicates product\/ingredient/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    recipeRow({ IngredientFormID: '00000001', IngredientEditorID: 'ProductA',
      IngredientName: 'Product A' }),
  ])), /self-edge/)
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    recipeRow({ IngredientFormID: '00000002', IngredientEditorID: 'ProductB',
      IngredientName: 'Product B' }),
    recipeRow({ ProductFormID: '00000002', ProductEditorID: 'ProductB',
      ProductName: 'Product B', RecipeFormID: '00000102', RecipeEditorID: 'RecipeB',
      IngredientFormID: '00000001', IngredientEditorID: 'ProductA',
      IngredientName: 'Product A' }),
  ])), /cycle/)
})

test('canonical parser rejects inconsistent timestamps and ingredient tuples', () => {
  assert.throws(() => parseIndustrialWorkbenchCsv(toCsv(INDUSTRIAL_WORKBENCH_HEADERS, [
    recipeRow(),
    recipeRow({ IngredientFormID: '00001002', IngredientEditorID: 'ResourceB',
      IngredientName: 'Resource B', ExtractTimestamp: '2026-09-11 13:11:32' }),
  ])), /inconsistent ExtractTimestamp/)
})

test('metadata parser enforces exact schema, sentinels, sparse overrides, and uniqueness', () => {
  assert.throws(
    () => parseItemTrackerMetadataCsv(metadataCsv.replace('SourceFile,', 'Wrong,')),
    /headers/,
  )
  assert.throws(
    () => parseItemTrackerMetadataCsv(metadataCsv.replace(BESPOKE_SOURCE_FILE, 'BESPOKE')),
    /SourceFile sentinel/,
  )
  assert.throws(
    () => parseItemTrackerMetadataCsv(metadataCsv.replace(BESPOKE_EXTRACT_TIMESTAMP, '9999-12-31')),
    /ExtractTimestamp sentinel/,
  )
  const row = metadataRows[0]
  for (const [change, diagnostic] of [
    [{ ItemType: 'inorganic' }, /ItemType/],
    [{ ItemFormID: 'bad' }, /FormID/],
    [{ ItemId: 'Bad Id' }, /ItemId/],
    [{ TrackerRarity: 'legendary' }, /TrackerRarity/],
    [{ DisplayNameOverride: row.CanonicalName }, /redundant/],
  ]) {
    assert.throws(
      () => parseItemTrackerMetadataCsv(toCsv(ITEM_TRACKER_METADATA_HEADERS, [
        { ...row, ...change },
      ])),
      diagnostic,
    )
  }
  assert.throws(
    () => parseItemTrackerMetadataCsv(toCsv(ITEM_TRACKER_METADATA_HEADERS, [row, row])),
    /duplicates/,
  )
  assert.throws(
    () => buildItemReferenceData(recipeRows, organicRows, metadataRows.slice(1),
      inorganicBuild.resourceByFormId),
    /coverage differs/,
  )
})

test('runtime recipe objects remain lean and deterministically ordered', () => {
  assert.ok(built.productRecipes.every((recipe) =>
    Object.keys(recipe).sort().join(',') === 'ingredients,productId'))
  assert.ok(built.productRecipes.every((recipe) => recipe.ingredients.every((ingredient) =>
    Object.keys(ingredient).sort().join(',') === 'item,quantity' &&
    Object.keys(ingredient.item).sort().join(',') === 'id,type')))
  for (const recipe of built.productRecipes) {
    const types = recipe.ingredients.map((ingredient) => ingredient.item.type)
    assert.equal(types.join(',').includes('product,resource'), false)
  }
})
