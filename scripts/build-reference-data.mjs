/**
 * build-reference-data.mjs
 *
 * Purpose:
 *   Converts curated Starfield source datasets into the JSON reference
 *   files consumed by the web application at runtime.
 *
 * Architecture:
 *   This is a development/build-time script, not part of the browser
 *   application. Canonical source data is exported into reference-source/,
 *   while generated runtime JSON is written into public/reference-data/.
 *
 *   Planetary data flows directly from the canonical game-derived CSV exports into
 *   generated runtime JSON. Source provenance stays in the CSV; only the
 *   gameplay fields needed by the application are emitted for each body.
 *
 *   The application itself knows nothing about delimited source files or
 *   this script. It simply loads the generated JSON files at runtime.
 *
 * Current outputs:
 *   - systems.json
 *   - bodies.json
 *   - resources.json
 *   - products.json
 *   - body-resources.json
 *   - product-recipes.json
 *   - biomes.json, body-biomes.json, inorganic-occurrences.json
 *   - species.json, planet-species.json, organic-occurrences.json
 *   - organic-farming-profiles.json
 *
 * Resource occurrence architecture:
 *   Planetary resource occurrence data identifies resources with canonical
 *   ResourceFormID values. The application catalogue uses stable logical
 *   ResourceId values pinned by tracker policy.
 *
 *   Canonical dictionary and tracker policy build the crosswalk:
 *
 *     ResourceFormID -> application ResourceId
 *
 *   Occurrence names and EditorIDs are consistency assertions, not keys.
 *
 * Change this file when:
 *   - source CSV structures change;
 *   - new reference datasets are added;
 *   - generated JSON fields change;
 *   - known canonical/display-name aliases change;
 *   - validation or duplicate handling needs to become stricter.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildBiomeData, validateInorganicManifest, parseBodyNumber } from './biome-reference-data.mjs'
import {
  buildInorganicResources,
  parseCanonicalInorganicCsv,
  parseInorganicTrackerPolicyCsv,
} from './inorganic-resource-data.mjs'

import { parse } from 'csv-parse/sync'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, '..')

const PLANET_DIRECTORY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'planet-directory.csv',
)

const INORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'inorganic-resource-dictionary.csv',
)

const INORGANIC_RESOURCE_TRACKER_POLICY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'inorganic-resource-tracker-policy.csv',
)

const ORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'organic-resource-dictionary.csv',
)

const ORGANIC_OCCURRENCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'biome-organic-resources.csv',
)

const INDUSTRIAL_WORKBENCH_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'industrial-workbench.csv',
)

const MANUFACTURED_PRODUCT_DICTIONARY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'manufactured-product-dictionary.csv',
)

const INORGANIC_OCCURRENCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'biome-inorganic-resources.csv',
)

const SYSTEMS_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'systems.json',
)

const BODIES_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'bodies.json',
)

const RESOURCES_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'resources.json',
)

const PRODUCTS_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'products.json',
)

const PRODUCT_RECIPES_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'product-recipes.json',
)

const RARITY_BY_SOURCE_VALUE = new Map([
  ['Common', 'common'],
  ['Uncommon', 'uncommon'],
  ['Rare', 'rare'],
  ['Exotic', 'exotic'],
  ['Unique', 'unique'],
])

const PLANETARY_BODY_TYPE_BY_SOURCE_VALUE = new Map([
  ['Planet', 'planet'],
  ['Moon', 'moon'],
  ['Orbital', 'orbital'],
])

const PLANET_DIRECTORY_REQUIRED_FIELDS = [
  'SourceFile',
  'PlanetFormID',
  'PlanetEditorID',
  'PlanetName',
  'BodyType',
  'StarSystemID',
  'SystemName',
  'ParentPlanetID',
  'PlanetID',
  'PlanetNotLandable',
  'OceanWorld',
  'ExtractTimestamp',
]

/**
 * Reads and parses one CSV source file into objects keyed by header name.
 *
 * Keeping CSV parsing in one helper ensures every source receives the
 * same trimming and empty-line behaviour.
 */
async function loadCsvFile(path) {
  const csv = await readFile(path, 'utf8')

  return parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
}

/**
 * Validates one curated rarity and converts it to the runtime representation.
 */
function parseRarity(value, sourceName, rowNumber) {
  const rarity = RARITY_BY_SOURCE_VALUE.get(value)

  if (!rarity) {
    throw new Error(
      `${sourceName} row ${rowNumber} has invalid rarity "${value ?? ''}".`,
    )
  }

  return rarity
}

function assertUniqueValue(seenValues, value, description) {
  if (seenValues.has(value)) {
    throw new Error(`Duplicate ${description} "${value}".`)
  }

  seenValues.add(value)
}

/**
 * Loads the canonical Planet Directory source.
 */
async function loadPlanetDirectory() {
  return loadCsvFile(PLANET_DIRECTORY_SOURCE_FILE)
}

/**
 * Verifies that the minimum fields required by the current planetary
 * reference model are present on every source row.
 */
export function validatePlanetDirectory(rows) {
  let extractTimestamp = null

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2

    for (const field of PLANET_DIRECTORY_REQUIRED_FIELDS) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        throw new Error(
          `Planet Directory row ${rowNumber} is missing ${field}.`,
        )
      }
    }

    if (!PLANETARY_BODY_TYPE_BY_SOURCE_VALUE.has(row.BodyType)) {
      throw new Error(
        `Planet Directory row ${rowNumber} has invalid BodyType ` +
          `"${row.BodyType}".`,
      )
    }

    for (const field of ['PlanetNotLandable', 'OceanWorld']) {
      if (row[field] !== '0' && row[field] !== '1') {
        throw new Error(
          `Planet Directory row ${rowNumber} has invalid ${field} ` +
            `"${row[field]}"; expected "0" or "1".`,
        )
      }
    }

    for (const field of ['StarSystemID', 'ParentPlanetID', 'PlanetID']) {
      if (!/^\d+$/.test(row[field]) || !Number.isSafeInteger(Number(row[field]))) {
        throw new Error('Planet ' + row.PlanetFormID + ': invalid ' + field + ' "' + row[field] + '".')
      }
    }

    if (extractTimestamp === null) {
      extractTimestamp = row.ExtractTimestamp
    } else if (row.ExtractTimestamp !== extractTimestamp) {
      throw new Error(
        `Planet Directory row ${rowNumber} has ExtractTimestamp ` +
          `"${row.ExtractTimestamp}" instead of "${extractTimestamp}".`,
      )
    }
  }
}

/**
 * Builds the unique system catalogue from Planet Directory rows.
 *
 * StarSystemID comes from the canonical source and acts as the stable
 * application identifier. SystemName remains display text only.
 */
function buildSystems(rows) {
  const systemsById = new Map()

  for (const row of rows) {
    const id = String(row.StarSystemID)

    const existingSystem = systemsById.get(id)

    /*
     * The same system occurs on many body rows. Repeated occurrences are
     * expected, but conflicting names for one ID indicate bad source data.
     */
    if (
      existingSystem &&
      existingSystem.name !== row.SystemName
    ) {
      throw new Error(
        `Star system ${id} has conflicting names: ` +
          `"${existingSystem.name}" and "${row.SystemName}".`,
      )
    }

    systemsById.set(id, {
      id,
      name: row.SystemName,
    })
  }

  return [...systemsById.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

/**
 * Builds the planetary-body catalogue.
 *
 * PlanetFormID provides a stable body identifier, while StarSystemID
 * establishes the relationship back to the system catalogue.
 */
export function buildBodies(rows) {
  const sourceRowsById = new Map()

  for (const row of rows) {
    const id = String(row.PlanetFormID)
    const existingRow = sourceRowsById.get(id)

    if (existingRow) {
      throw new Error(`Duplicate PlanetFormID ${id}.`)
    }

    sourceRowsById.set(id, row)
  }

  const bodies = [...sourceRowsById.values()].map((row) => {
    const bodyType = PLANETARY_BODY_TYPE_BY_SOURCE_VALUE.get(row.BodyType)

    return {
      id: String(row.PlanetFormID),
      systemId: String(row.StarSystemID),
      name: row.PlanetName,
      solarArrayPower: parseBodyNumber(row, 'SolarArrayPower'),
      windTurbinePower: parseBodyNumber(row, 'WindTurbinePower'),
      planetaryHabitationRank: parseBodyNumber(row, 'PlanetaryHabitationRank'),
      bodyType,
      outpostAllowed:
        bodyType !== 'orbital' &&
        row.PlanetNotLandable === '0' &&
        row.OceanWorld === '0',
    }
  })

  return bodies.sort((left, right) => {
    const systemComparison =
      left.systemId.localeCompare(right.systemId)

    return systemComparison !== 0
      ? systemComparison
      : left.name.localeCompare(right.name)
  })
}

/**
 * Creates a stable application ID from a player-facing name.
 *
 * Resource and product IDs remain logical application identifiers rather
 * than canonical FormIDs. Canonical FormIDs are resolved to these IDs by
 * the resource crosswalk during reference-data generation.
 */
function createNameId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Builds the complete logical resource catalogue from policy-joined canonical
 * inorganics and the curated organic dictionary. Occurrence sources never
 * manufacture catalogue records.
 */
function buildResources(
  inorganicResources,
  organicDictionaryRows,
) {
  const resourcesById = new Map(
    inorganicResources.map((resource) => [resource.id, resource]),
  )
  const resourceIds = new Set(resourcesById.keys())

  const organicNames = new Set()
  const organicIds = new Set()
  const organicShortNames = new Set()

  for (const [index, row] of organicDictionaryRows.entries()) {
    const rowNumber = index + 2

    if (!row.Resource || !row.ShortName || !row.Rarity) {
      throw new Error(
        `Organic resource row ${rowNumber} is missing ` +
          'Resource, ShortName, or Rarity.',
      )
    }

    const id = createNameId(row.Resource)

    assertUniqueValue(
      organicNames,
      row.Resource,
      'organic resource name',
    )
    assertUniqueValue(
      organicIds,
      id,
      'organic resource ID',
    )
    assertUniqueValue(
      organicShortNames,
      row.ShortName,
      'organic resource abbreviation',
    )
    assertUniqueValue(
      resourceIds,
      id,
      'resource ID',
    )

    resourcesById.set(id, {
      id,
      name: row.Resource,
      shortName: row.ShortName,
      category: 'organic',
      rarity: parseRarity(
        row.Rarity,
        'Organic resource',
        rowNumber,
      ),
      parentId: null,
      sortOrder: null,
      plannedSupplyPlacement: null,
    })
  }

  return [...resourcesById.values()].map((resource) => ({
    id: resource.id,
    name: resource.name,
    shortName: resource.shortName,
    category: resource.category,
    rarity: resource.rarity,
    parentId: resource.parentId,
    sortOrder: resource.sortOrder,
    plannedSupplyPlacement: resource.plannedSupplyPlacement,
  })).sort((left, right) => {
    const categoryComparison =
      left.category.localeCompare(right.category)

    return categoryComparison !== 0
      ? categoryComparison
      : left.name.localeCompare(right.name)
  })
}

/**
 * Builds the manufactured-product catalogue from its curated dictionary.
 * Industrial Workbench remains a recipe source only.
 */
function buildProducts(rows) {
  const names = new Set()
  const ids = new Set()
  const shortNames = new Set()
  const products = []

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2

    if (!row.Name || !row.ShortName || !row.Rarity) {
      throw new Error(
        `Manufactured product row ${rowNumber} is missing ` +
          'Name, ShortName, or Rarity.',
      )
    }

    const id = createNameId(row.Name)

    assertUniqueValue(names, row.Name, 'manufactured product name')
    assertUniqueValue(ids, id, 'manufactured product ID')
    assertUniqueValue(
      shortNames,
      row.ShortName,
      'manufactured product abbreviation',
    )

    products.push({
      id,
      name: row.Name,
      shortName: row.ShortName,
      rarity: parseRarity(
        row.Rarity,
        'Manufactured product',
        rowNumber,
      ),
    })
  }

  return products.sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

/**
 * Builds canonical manufacturing recipes from Industrial Workbench rows.
 *
 * Product and ingredient names are resolved against the already-built
 * application catalogues rather than converted directly into IDs here.
 * This makes source/catalogue discrepancies visible during generation.
 *
 * Recipe quantities remain the unmodified base-game values. Character
 * modifiers such as Research Methods belong to later domain logic.
 */
export function buildProductRecipes(
  rows,
  resources,
  products,
) {
  const resourcesByName =
    new Map(
      resources.map((resource) => [
        resource.name,
        resource,
      ]),
    )

  const resourcesById = new Map(
    resources.map((resource) => [resource.id, resource]),
  )

  // Industrial Workbench remains legacy name-based; pin known spellings to
  // stable app identity instead of coupling recipes to canonical/localized text.
  const recipeResourceCompatibility = new Map([
    ['Aluminium', 'aluminium'],
  ])

  const productsByName =
    new Map(
      products.map((product) => [
        product.name,
        product,
      ]),
    )

  const recipesByProductId = new Map()

  for (const [index, row] of rows.entries()) {
    if (
      !row.Product ||
      !row.Ingredient ||
      !row.Quantity
    ) {
      throw new Error(
        `Industrial Workbench row ${index + 2} is missing ` +
          'Product, Ingredient, or Quantity.',
      )
    }

    const product =
      productsByName.get(row.Product)

    if (!product) {
      throw new Error(
        `Industrial Workbench row ${index + 2} refers to ` +
          `unknown product "${row.Product}".`,
      )
    }

    const compatibleResourceId = recipeResourceCompatibility.get(row.Ingredient)
    const resourceIngredient = compatibleResourceId
      ? resourcesById.get(compatibleResourceId)
      : resourcesByName.get(row.Ingredient)

    const productIngredient =
      productsByName.get(row.Ingredient)

    if (
      resourceIngredient &&
      productIngredient
    ) {
      throw new Error(
        `Industrial Workbench row ${index + 2} has ambiguous ` +
          `ingredient "${row.Ingredient}", which exists as both ` +
          'a resource and a product.',
      )
    }

    if (
      !resourceIngredient &&
      !productIngredient
    ) {
      throw new Error(
        `Industrial Workbench row ${index + 2} refers to ` +
          `unknown ingredient "${row.Ingredient}".`,
      )
    }

    const quantity =
      Number(row.Quantity)

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        `Industrial Workbench row ${index + 2} has invalid ` +
          `quantity "${row.Quantity}".`,
      )
    }

    const item =
      resourceIngredient
        ? {
            type: 'resource',
            id: resourceIngredient.id,
          }
        : {
            type: 'product',
            id: productIngredient.id,
          }

    let recipe =
      recipesByProductId.get(product.id)

    if (!recipe) {
      recipe = {
        productId: product.id,
        ingredients: [],
      }

      recipesByProductId.set(
        product.id,
        recipe,
      )
    }

    const duplicateIngredient =
      recipe.ingredients.some(
        (ingredient) =>
          ingredient.item.type === item.type &&
          ingredient.item.id === item.id,
      )

    if (duplicateIngredient) {
      throw new Error(
        `Industrial Workbench contains duplicate ingredient ` +
          `"${row.Ingredient}" for product "${row.Product}".`,
      )
    }

    recipe.ingredients.push({
      item,
      quantity,
    })
  }

  const productsWithoutRecipes = products.filter(
    (product) => !recipesByProductId.has(product.id),
  )

  if (productsWithoutRecipes.length > 0) {
    throw new Error(
      'Manufactured product dictionary entries have no Industrial ' +
        'Workbench recipe: ' +
        productsWithoutRecipes
          .map((product) => `"${product.name}"`)
          .join(', ') +
        '.',
    )
  }

  /*
   * Follow product catalogue order so generated output stays deterministic
   * and easy to compare with products.json.
   */
  return products
    .map((product) =>
      recipesByProductId.get(product.id),
    )
    .filter((recipe) => recipe !== undefined)
}

/**
 * Writes a generated reference dataset as readable two-space JSON.
 */
async function writeJson(path, data) {
  await mkdir(dirname(path), {
    recursive: true,
  })

  await writeFile(
    path,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8',
  )
}

/**
 * Runs the complete current reference-data generation pipeline.
 *
 * Every generated dataset is rebuilt from canonical source data so the
 * runtime JSON remains reproducible rather than hand-maintained.
 */
async function main() {
  console.log('Loading Planet Directory...')

  const planetRows =
    await loadPlanetDirectory()

  validatePlanetDirectory(planetRows)

  const systems =
    buildSystems(planetRows)

  const bodies =
    buildBodies(planetRows)

  console.log('Loading resource sources...')

  const [
    inorganicCsv,
    inorganicPolicyCsv,
    organicDictionaryRows,
    organicOccurrenceRows,
    inorganicOccurrenceRows,
  ] = await Promise.all([
    readFile(
      INORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE,
      'utf8',
    ),
    readFile(
      INORGANIC_RESOURCE_TRACKER_POLICY_SOURCE_FILE,
      'utf8',
    ),
    loadCsvFile(
      ORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE,
    ),
    loadCsvFile(
      ORGANIC_OCCURRENCES_SOURCE_FILE,
    ),
    loadCsvFile(
      INORGANIC_OCCURRENCES_SOURCE_FILE,
    ),
  ])

  const canonicalInorganicRows = parseCanonicalInorganicCsv(inorganicCsv)
  const inorganicPolicyRows = parseInorganicTrackerPolicyCsv(inorganicPolicyCsv)
  const inorganicBuild = buildInorganicResources(
    canonicalInorganicRows,
    inorganicPolicyRows,
  )

  const resources =
    buildResources(
      inorganicBuild.resources,
      organicDictionaryRows,
    )

  await validateInorganicManifest(
    resolve(PROJECT_ROOT, 'reference-source', 'biome-inorganic-resources.manifest.json'),
    inorganicOccurrenceRows,
  )
  const biomeData = buildBiomeData(
    inorganicOccurrenceRows,
    organicOccurrenceRows,
    bodies,
    resources,
    inorganicBuild.resourceByFormId,
  )
  const { bodyResources } = biomeData
  for (const field of ['solarArrayPower', 'windTurbinePower', 'planetaryHabitationRank']) {
    const nullCount = bodies.filter((body) => body[field] === null).length
    console.log(field + ': null=' + nullCount + ', non-null=' + (bodies.length - nullCount))
  }
  console.log('Planet directory: rows=' + planetRows.length + ', distinct IDs=' + bodies.length)

  console.log('Loading Industrial Workbench...')

  const [
    productDictionaryRows,
    productRecipeRows,
  ] = await Promise.all([
    loadCsvFile(
      MANUFACTURED_PRODUCT_DICTIONARY_SOURCE_FILE,
    ),
    loadCsvFile(
      INDUSTRIAL_WORKBENCH_SOURCE_FILE,
    ),
  ])

  const products =
    buildProducts(productDictionaryRows)

  const productRecipes =
    buildProductRecipes(
      productRecipeRows,
      resources,
      products,
    )

  for (const [key, data] of Object.entries(biomeData)) {
    const filename = key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase())
    await writeJson(resolve(PROJECT_ROOT, 'public', 'reference-data', filename + '.json'), data)
    console.log(filename + '.json: ' + data.length)
  }

  await writeJson(
    SYSTEMS_OUTPUT_FILE,
    systems,
  )

  await writeJson(
    BODIES_OUTPUT_FILE,
    bodies,
  )

  await writeJson(
    RESOURCES_OUTPUT_FILE,
    resources,
  )

  await writeJson(
    PRODUCTS_OUTPUT_FILE,
    products,
  )

  await writeJson(
    PRODUCT_RECIPES_OUTPUT_FILE,
    productRecipes,
  )

  console.log(
    `Generated ${systems.length} star systems, ` +
      `${bodies.length} planetary bodies, ` +
      `${resources.length} resources, ` +
      `${products.length} products, ` +
      `${bodyResources.length} body-resource records, and ` +
      `${productRecipes.length} product recipes.`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => {
  console.error('Reference-data build failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})
