/**
 * Purpose: Build product, organic-resource, and recipe reference data from
 * canonical FormID identities plus explicit tracker metadata.
 * Architecture: Canonical CSVs own source identity and recipe facts. The
 * tracker metadata file pins stable app IDs and presentation-only metadata.
 * Recipe COBJ identity is validated here and deliberately omitted at runtime.
 * Change this file when: canonical item schemas, crosswalk invariants, or
 * runtime catalogue/recipe construction rules change.
 */
import { parse } from 'csv-parse/sync'

export const INDUSTRIAL_WORKBENCH_HEADERS = [
  'SourceFile',
  'ExtractTimestamp',
  'ProductFormID',
  'ProductEditorID',
  'ProductName',
  'RecipeSourceFile',
  'RecipeFormID',
  'RecipeEditorID',
  'IngredientSourceFile',
  'IngredientFormID',
  'IngredientEditorID',
  'IngredientName',
  'Quantity',
]

export const ITEM_TRACKER_METADATA_HEADERS = [
  'SourceFile',
  'ExtractTimestamp',
  'ItemType',
  'ItemFormID',
  'ItemEditorID',
  'CanonicalName',
  'ItemId',
  'ShortName',
  'TrackerRarity',
  'DisplayNameOverride',
]

export const BESPOKE_SOURCE_FILE = 'BESPOKE - NO SOURCE FILE'
export const BESPOKE_EXTRACT_TIMESTAMP = '9999-12-31 00:00:00'

const FORM_ID_PATTERN = /^[0-9A-F]{8}$/
const APP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EXTRACT_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
const TRACKER_RARITIES = new Set(['common', 'uncommon', 'rare', 'exotic', 'unique'])
const ITEM_TYPES = new Set(['organic', 'product'])

function parseCsvWithExactHeaders(csv, expectedHeaders, sourceName) {
  const records = parse(csv, { bom: true, skip_empty_lines: true, trim: true })
  const headers = records.shift() ?? []
  if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
    throw new Error(`${sourceName} has unexpected headers: ${headers.join(',')}.`)
  }
  return records.map((values, index) => {
    if (values.length !== expectedHeaders.length) {
      throw new Error(
        `${sourceName} row ${index + 2} has ${values.length} columns; ` +
          `expected ${expectedHeaders.length}.`,
      )
    }
    return Object.fromEntries(
      expectedHeaders.map((header, column) => [header, values[column]]),
    )
  })
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (typeof row[field] !== 'string' || row[field] === '') {
      throw new Error(`${context} is missing ${field}.`)
    }
  }
}

function assertFormId(value, context) {
  if (!FORM_ID_PATTERN.test(value)) {
    throw new Error(`${context} has invalid FormID "${value}".`)
  }
}

function assertConsistent(map, key, value, context) {
  const previous = map.get(key)
  if (previous !== undefined && JSON.stringify(previous) !== JSON.stringify(value)) {
    throw new Error(
      `${context} conflicts for ${key}: ${JSON.stringify(previous)} versus ` +
        `${JSON.stringify(value)}.`,
    )
  }
  map.set(key, value)
}

function canonicalTimestamp(value, context) {
  const match = EXTRACT_TIMESTAMP_PATTERN.exec(value)
  const instant = match ? new Date(value.replace(' ', 'T') + 'Z') : null
  const normalized = instant && !Number.isNaN(instant.valueOf())
    ? instant.toISOString().slice(0, 19).replace('T', ' ')
    : null
  if (!match || normalized !== value) {
    throw new Error(`${context} has invalid ExtractTimestamp "${value}".`)
  }
  return value
}

/** Strictly parses and validates the canonical, relationship-grain extract. */
export function parseIndustrialWorkbenchCsv(csv) {
  const rows = parseCsvWithExactHeaders(
    csv,
    INDUSTRIAL_WORKBENCH_HEADERS,
    'Industrial Workbench',
  )
  const products = new Map()
  const recipes = new Map()
  const ingredients = new Map()
  const recipeByProduct = new Map()
  const productByRecipe = new Map()
  const pairs = new Set()
  let extractTimestamp = null

  for (const [index, row] of rows.entries()) {
    const context = `Industrial Workbench row ${index + 2}`
    requireFields(row, INDUSTRIAL_WORKBENCH_HEADERS, context)
    for (const field of ['ProductFormID', 'RecipeFormID', 'IngredientFormID']) {
      assertFormId(row[field], `${context} ${field}`)
    }
    const timestamp = canonicalTimestamp(row.ExtractTimestamp, context)
    if (extractTimestamp === null) extractTimestamp = timestamp
    if (timestamp !== extractTimestamp) {
      throw new Error(`${context} has inconsistent ExtractTimestamp.`)
    }
    if (!/^\d+$/.test(row.Quantity) || !Number.isSafeInteger(Number(row.Quantity)) ||
        Number(row.Quantity) < 1) {
      throw new Error(`${context} has invalid Quantity "${row.Quantity}".`)
    }

    assertConsistent(products, row.ProductFormID, {
      sourceFile: row.SourceFile,
      formId: row.ProductFormID,
      editorId: row.ProductEditorID,
      canonicalName: row.ProductName,
    }, `${context} product identity`)
    assertConsistent(recipes, row.RecipeFormID, {
      sourceFile: row.RecipeSourceFile,
      formId: row.RecipeFormID,
      editorId: row.RecipeEditorID,
    }, `${context} recipe identity`)
    assertConsistent(ingredients, row.IngredientFormID, {
      sourceFile: row.IngredientSourceFile,
      formId: row.IngredientFormID,
      editorId: row.IngredientEditorID,
      canonicalName: row.IngredientName,
    }, `${context} ingredient identity`)
    assertConsistent(
      recipeByProduct,
      row.ProductFormID,
      row.RecipeFormID,
      `${context} recipe assignment`,
    )
    assertConsistent(
      productByRecipe,
      row.RecipeFormID,
      row.ProductFormID,
      `${context} product assignment`,
    )

    const pair = `${row.ProductFormID}:${row.IngredientFormID}`
    if (pairs.has(pair)) {
      throw new Error(`${context} duplicates product/ingredient pair ${pair}.`)
    }
    pairs.add(pair)
    if (row.ProductFormID === row.IngredientFormID) {
      throw new Error(`${context} contains a product self-edge ${row.ProductFormID}.`)
    }
  }

  const states = new Map()
  function visit(formId, path) {
    if (states.get(formId) === 'visiting') {
      throw new Error(`Industrial Workbench product dependency graph contains a cycle: ${[...path, formId].join(' -> ')}.`)
    }
    if (states.get(formId) === 'visited') return
    states.set(formId, 'visiting')
    for (const row of rows) {
      if (row.ProductFormID === formId && products.has(row.IngredientFormID)) {
        visit(row.IngredientFormID, [...path, formId])
      }
    }
    states.set(formId, 'visited')
  }
  for (const formId of products.keys()) visit(formId, [])
  return rows
}

export function reduceCanonicalProducts(rows) {
  const products = new Map()
  for (const [index, row] of rows.entries()) {
    assertConsistent(products, row.ProductFormID, {
      sourceFile: row.SourceFile,
      formId: row.ProductFormID,
      editorId: row.ProductEditorID,
      canonicalName: row.ProductName,
    }, `Industrial Workbench row ${index + 2} product identity`)
  }
  return products
}

/** Reduces occurrence-grain organic rows to their canonical IRES identities. */
export function reduceCanonicalOrganicIdentities(rows) {
  const organics = new Map()
  for (const [index, row] of rows.entries()) {
    if (row.ResourceResolutionStatus !== 'Resolved') continue
    const context = `Organic occurrence row ${index + 2}`
    requireFields(row, [
      'ResourceFormID', 'ResourceEditorID', 'ResourceName', 'ResourceSourceFile',
    ], context)
    assertFormId(row.ResourceFormID, `${context} ResourceFormID`)
    assertConsistent(organics, row.ResourceFormID, {
      sourceFile: row.ResourceSourceFile,
      formId: row.ResourceFormID,
      editorId: row.ResourceEditorID,
      canonicalName: row.ResourceName,
    }, `${context} organic identity`)
  }
  return organics
}

/** Parses tracker-authored metadata without deriving identity from display text. */
export function parseItemTrackerMetadataCsv(csv) {
  const rows = parseCsvWithExactHeaders(
    csv,
    ITEM_TRACKER_METADATA_HEADERS,
    'Item tracker metadata',
  )
  const formIds = new Set()
  const appIds = new Set()
  const shortNamesByType = new Map([...ITEM_TYPES].map((type) => [type, new Set()]))

  for (const [index, row] of rows.entries()) {
    const context = `Item tracker metadata row ${index + 2}`
    requireFields(row, ITEM_TRACKER_METADATA_HEADERS.filter(
      (field) => field !== 'DisplayNameOverride',
    ), context)
    if (row.SourceFile !== BESPOKE_SOURCE_FILE) {
      throw new Error(`${context} has invalid SourceFile sentinel.`)
    }
    if (row.ExtractTimestamp !== BESPOKE_EXTRACT_TIMESTAMP) {
      throw new Error(`${context} has invalid ExtractTimestamp sentinel.`)
    }
    if (!ITEM_TYPES.has(row.ItemType)) {
      throw new Error(`${context} has invalid ItemType "${row.ItemType}".`)
    }
    assertFormId(row.ItemFormID, `${context} ItemFormID`)
    if (!APP_ID_PATTERN.test(row.ItemId)) {
      throw new Error(`${context} has invalid ItemId "${row.ItemId}".`)
    }
    if (!TRACKER_RARITIES.has(row.TrackerRarity)) {
      throw new Error(`${context} has invalid TrackerRarity "${row.TrackerRarity}".`)
    }
    if (row.DisplayNameOverride === row.CanonicalName) {
      throw new Error(`${context} has a redundant DisplayNameOverride.`)
    }
    const typedFormId = `${row.ItemType}:${row.ItemFormID}`
    const typedAppId = `${row.ItemType}:${row.ItemId}`
    if (formIds.has(typedFormId)) throw new Error(`${context} duplicates ${typedFormId}.`)
    if (appIds.has(typedAppId)) throw new Error(`${context} duplicates ${typedAppId}.`)
    if (shortNamesByType.get(row.ItemType).has(row.ShortName)) {
      throw new Error(`${context} duplicates ${row.ItemType} ShortName "${row.ShortName}".`)
    }
    formIds.add(typedFormId)
    appIds.add(typedAppId)
    shortNamesByType.get(row.ItemType).add(row.ShortName)
  }
  return rows
}

function joinMetadata(canonicalByFormId, metadataRows, itemType) {
  const rows = metadataRows.filter((row) => row.ItemType === itemType)
  const metadataByFormId = new Map(rows.map((row) => [row.ItemFormID, row]))
  const missing = [...canonicalByFormId.keys()].filter((formId) => !metadataByFormId.has(formId))
  const extra = [...metadataByFormId.keys()].filter((formId) => !canonicalByFormId.has(formId))
  if (missing.length || extra.length) {
    throw new Error(
      `${itemType} canonical/metadata FormID coverage differs; ` +
        `missing metadata: ${missing.join(', ') || 'none'}; ` +
        `unknown metadata: ${extra.join(', ') || 'none'}.`,
    )
  }

  const joined = new Map()
  for (const [formId, canonical] of canonicalByFormId) {
    const metadata = metadataByFormId.get(formId)
    if (metadata.ItemEditorID !== canonical.editorId ||
        metadata.CanonicalName !== canonical.canonicalName) {
      throw new Error(
        `${itemType} metadata ${formId} contradicts canonical EditorID/name.`,
      )
    }
    joined.set(formId, { canonical, metadata })
  }
  return joined
}

export function buildItemReferenceData(
  recipeRows,
  organicOccurrenceRows,
  metadataRows,
  inorganicResourceByFormId,
) {
  const canonicalProducts = reduceCanonicalProducts(recipeRows)
  const canonicalOrganics = reduceCanonicalOrganicIdentities(organicOccurrenceRows)
  const productsByFormId = joinMetadata(canonicalProducts, metadataRows, 'product')
  const organicsByFormId = joinMetadata(canonicalOrganics, metadataRows, 'organic')

  const products = [...productsByFormId.values()].map(({ metadata }) => ({
    id: metadata.ItemId,
    name: metadata.DisplayNameOverride || metadata.CanonicalName,
    shortName: metadata.ShortName,
    rarity: metadata.TrackerRarity,
  })).sort((left, right) => left.name.localeCompare(right.name))
  const productOrder = new Map(products.map((product, index) => [product.id, index]))
  const organicResources = [...organicsByFormId.values()].map(({ metadata }) => ({
    id: metadata.ItemId,
    name: metadata.DisplayNameOverride || metadata.CanonicalName,
    shortName: metadata.ShortName,
    category: 'organic',
    rarity: metadata.TrackerRarity,
    parentId: null,
    sortOrder: null,
    plannedSupplyPlacement: null,
  })).sort((left, right) => left.name.localeCompare(right.name))
  const resourceDisplayOrder = new Map(
    [...inorganicResourceByFormId.values()].map(({ resource }) => resource)
      .concat(organicResources)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((resource, index) => [resource.id, index]),
  )

  const runtimeProductByFormId = new Map()
  for (const [formId, joined] of productsByFormId) {
    runtimeProductByFormId.set(formId, {
      ...joined,
      resource: products.find((product) => product.id === joined.metadata.ItemId),
    })
  }
  const organicResourceByFormId = new Map()
  for (const [formId, joined] of organicsByFormId) {
    organicResourceByFormId.set(formId, {
      ...joined,
      resource: organicResources.find((resource) => resource.id === joined.metadata.ItemId),
    })
  }

  const recipesByProductId = new Map()
  for (const [index, row] of recipeRows.entries()) {
    const context = `Industrial Workbench row ${index + 2}`
    const product = runtimeProductByFormId.get(row.ProductFormID)
    if (!product) throw new Error(`${context} cannot resolve product FormID ${row.ProductFormID}.`)
    const candidates = [
      inorganicResourceByFormId.get(row.IngredientFormID) && {
        type: 'resource',
        canonical: inorganicResourceByFormId.get(row.IngredientFormID).canonical,
        runtime: inorganicResourceByFormId.get(row.IngredientFormID).resource,
        fields: ['ResourceEditorID', 'ResourceName'],
      },
      organicResourceByFormId.get(row.IngredientFormID) && {
        type: 'resource',
        canonical: organicResourceByFormId.get(row.IngredientFormID).canonical,
        runtime: organicResourceByFormId.get(row.IngredientFormID).resource,
        fields: ['editorId', 'canonicalName'],
      },
      runtimeProductByFormId.get(row.IngredientFormID) && {
        type: 'product',
        canonical: runtimeProductByFormId.get(row.IngredientFormID).canonical,
        runtime: runtimeProductByFormId.get(row.IngredientFormID).resource,
        fields: ['editorId', 'canonicalName'],
      },
    ].filter(Boolean)
    if (candidates.length !== 1) {
      throw new Error(
        `${context} ingredient FormID ${row.IngredientFormID} resolves to ` +
          `${candidates.length} canonical populations.`,
      )
    }
    const candidate = candidates[0]
    const sourceFile = candidate.canonical.SourceFile ?? candidate.canonical.sourceFile
    const editorId = candidate.canonical[candidate.fields[0]]
    const canonicalName = candidate.canonical[candidate.fields[1]]
    if (sourceFile !== row.IngredientSourceFile ||
        editorId !== row.IngredientEditorID || canonicalName !== row.IngredientName) {
      throw new Error(`${context} ingredient ${row.IngredientFormID} contradicts canonical identity.`)
    }
    const recipe = recipesByProductId.get(product.resource.id) ?? {
      productId: product.resource.id,
      ingredients: [],
    }
    recipe.ingredients.push({
      item: { type: candidate.type, id: candidate.runtime.id },
      quantity: Number(row.Quantity),
    })
    recipesByProductId.set(product.resource.id, recipe)
  }

  for (const recipe of recipesByProductId.values()) {
    recipe.ingredients.sort((left, right) => {
      const typeComparison = left.item.type.localeCompare(right.item.type) * -1
      if (typeComparison !== 0) return typeComparison
      const order = left.item.type === 'resource' ? resourceDisplayOrder : productOrder
      return order.get(left.item.id) - order.get(right.item.id)
    })
  }
  const productRecipes = products.map((product) => recipesByProductId.get(product.id))
  if (productRecipes.some((recipe) => recipe === undefined)) {
    throw new Error('Every canonical manufactured product must have a recipe.')
  }
  return { products, organicResources, organicResourceByFormId, productRecipes }
}

export function validateCurrentItemPopulation(recipeRows, metadataRows) {
  const counts = {
    rows: recipeRows.length,
    products: new Set(recipeRows.map((row) => row.ProductFormID)).size,
    recipes: new Set(recipeRows.map((row) => row.RecipeFormID)).size,
    ingredients: new Set(recipeRows.map((row) => row.IngredientFormID)).size,
    productMetadata: metadataRows.filter((row) => row.ItemType === 'product').length,
    organicMetadata: metadataRows.filter((row) => row.ItemType === 'organic').length,
  }
  const expected = {
    rows: 90, products: 30, recipes: 30, ingredients: 55,
    productMetadata: 30, organicMetadata: 30,
  }
  if (JSON.stringify(counts) !== JSON.stringify(expected)) {
    throw new Error(
      `Current canonical item population differs: expected ${JSON.stringify(expected)}, ` +
        `received ${JSON.stringify(counts)}.`,
    )
  }
  const overrides = metadataRows.filter((row) => row.DisplayNameOverride !== '')
  if (overrides.length !== 1 || overrides[0].ItemType !== 'organic' ||
      overrides[0].ItemFormID !== '0007782F' ||
      overrides[0].DisplayNameOverride !== 'Gastronomic Delight') {
    throw new Error('Current item metadata must contain only the reviewed Gastronomic Delight display override.')
  }
  const sourceFields = ['SourceFile', 'RecipeSourceFile', 'IngredientSourceFile']
  if (recipeRows.some((row) => sourceFields.some((field) => row[field] !== 'Starfield.esm')) ||
      recipeRows.some((row) => row.ExtractTimestamp !== '2026-09-11 13:11:31')) {
    throw new Error('Current Industrial Workbench provenance differs from the reviewed extract.')
  }
}
