/**
 * build-reference-data.mjs
 *
 * Purpose:
 *   Converts canonical Starfield sources and tracker policy into JSON reference
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
 *   - item crosswalk or tracker-metadata rules change;
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
import {
  buildItemReferenceData,
  parseIndustrialWorkbenchCsv,
  parseItemTrackerMetadataCsv,
  validateCurrentItemPopulation,
} from './item-reference-data.mjs'

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

const ITEM_TRACKER_METADATA_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'item-tracker-metadata.csv',
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

const INORGANIC_OCCURRENCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'biome-inorganic-resources.csv',
)

const DEFAULT_OUTPUT_DIRECTORY = resolve(PROJECT_ROOT, 'public', 'reference-data')

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
 * Combines policy-joined canonical inorganics with FormID-crosswalked organics.
 */
function buildResources(
  inorganicResources,
  organicResources,
) {
  const resources = [...inorganicResources, ...organicResources]
  if (new Set(resources.map((resource) => resource.id)).size !== resources.length) {
    throw new Error('Inorganic and organic catalogues contain a duplicate stable ResourceId.')
  }
  return resources.map((resource) => ({
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
export async function buildReferenceData(outputDirectory = DEFAULT_OUTPUT_DIRECTORY) {
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
    itemMetadataCsv,
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
    readFile(
      ITEM_TRACKER_METADATA_SOURCE_FILE,
      'utf8',
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

  console.log('Loading canonical item and recipe sources...')
  const industrialWorkbenchCsv = await readFile(INDUSTRIAL_WORKBENCH_SOURCE_FILE, 'utf8')
  const productRecipeRows = parseIndustrialWorkbenchCsv(industrialWorkbenchCsv)
  const itemMetadataRows = parseItemTrackerMetadataCsv(itemMetadataCsv)
  validateCurrentItemPopulation(productRecipeRows, itemMetadataRows)
  const itemBuild = buildItemReferenceData(
    productRecipeRows,
    organicOccurrenceRows,
    itemMetadataRows,
    inorganicBuild.resourceByFormId,
  )
  const resources = buildResources(inorganicBuild.resources, itemBuild.organicResources)

  await validateInorganicManifest(
    resolve(PROJECT_ROOT, 'reference-source', 'biome-inorganic-resources.manifest.json'),
    inorganicOccurrenceRows,
  )
  const biomeData = buildBiomeData(
    inorganicOccurrenceRows,
    organicOccurrenceRows,
    bodies,
    inorganicBuild.resourceByFormId,
    itemBuild.organicResourceByFormId,
  )
  const { bodyResources } = biomeData
  for (const field of ['solarArrayPower', 'windTurbinePower', 'planetaryHabitationRank']) {
    const nullCount = bodies.filter((body) => body[field] === null).length
    console.log(field + ': null=' + nullCount + ', non-null=' + (bodies.length - nullCount))
  }
  console.log('Planet directory: rows=' + planetRows.length + ', distinct IDs=' + bodies.length)

  const products = itemBuild.products
  const productRecipes = itemBuild.productRecipes

  for (const [key, data] of Object.entries(biomeData)) {
    const filename = key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase())
    await writeJson(resolve(outputDirectory, filename + '.json'), data)
    console.log(filename + '.json: ' + data.length)
  }

  await writeJson(
    resolve(outputDirectory, 'systems.json'),
    systems,
  )

  await writeJson(
    resolve(outputDirectory, 'bodies.json'),
    bodies,
  )

  await writeJson(
    resolve(outputDirectory, 'resources.json'),
    resources,
  )

  await writeJson(
    resolve(outputDirectory, 'products.json'),
    products,
  )

  await writeJson(
    resolve(outputDirectory, 'product-recipes.json'),
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

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildReferenceData().catch((error) => {
  console.error('Reference-data build failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})
