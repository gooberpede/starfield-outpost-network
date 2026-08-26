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
 *   The application itself knows nothing about CSV files or this script.
 *   It simply loads the generated JSON files at runtime.
 *
 * Current outputs:
 *   - systems.json
 *   - bodies.json
 *   - resources.json
 *   - products.json
 *   - body-resources.json
 *   - product-recipes.json
 *
 * Resource occurrence architecture:
 *   Planetary resource occurrence data identifies resources with canonical
 *   ResourceFormID values. The application catalogue uses stable logical
 *   ResourceId values derived from player-facing resource names.
 *
 *   Because several canonical FormIDs may represent the same logical
 *   player-facing resource, this script builds a crosswalk:
 *
 *     ResourceFormID -> application ResourceId
 *
 *   Most mappings are resolved automatically from normalised names.
 *   Known source/display-name differences are handled by the explicit
 *   RESOURCE_NAME_ALIASES table below.
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

const ORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'organic-resource-dictionary.csv',
)

const ORGANIC_OCCURRENCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'organic-resources.csv',
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

const ALL_RESOURCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'planet-all-resources.csv',
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

const BODY_RESOURCES_OUTPUT_FILE = resolve(
  PROJECT_ROOT,
  'public',
  'reference-data',
  'body-resources.json',
)

/**
 * Explicit mappings for canonical runtime names that differ from the
 * player-facing names used by the application catalogue.
 *
 * Keys use:
 *   category:canonical-name
 *
 * Values are the corresponding player-facing catalogue names.
 *
 * These aliases are deliberately visible and explicit rather than hidden
 * behind fuzzy matching, so unexpected source discrepancies fail loudly.
 */
const RESOURCE_NAME_ALIASES = new Map([
  [
    'inorganic:Aluminum',
    'Aluminium',
  ],
  [
    'organic:Gastronomic',
    'Gastronomic Delight',
  ],
  [
    'organic:MemorySubstrate',
    'Memory Substrate',
  ],
  [
    'organic:HighTensileSpidrion',
    'High-Tensile Spidroin',
  ],
  [
    'organic:LuxuryTextile',
    'Luxury Textile',
  ],
  [
    'organic:Toxin Agent',
    'Toxin',
  ],
])

/*
 * These values are artifacts of the current organic occurrence/enrichment
 * dataset rather than logical catalogue resources.
 *
 * "None" represents organisms with no harvestable resource.
 * "Unique" currently stands in for several unresolved unique-resource fauna.
 * Those occurrences are intentionally omitted until the upstream xEdit
 * extraction/cleanup pipeline can resolve canonical resource identity cleanly.
 *
 * Do not add species-specific repair mappings here; fix the source dataset
 * instead when the organic extraction pipeline is revisited.
 */
const NON_RESOURCE_ORGANIC_OCCURRENCE_NAMES = new Set([
  'None',
  'Unique',
])

const RARITY_BY_SOURCE_VALUE = new Map([
  ['Common', 'common'],
  ['Uncommon', 'uncommon'],
  ['Rare', 'rare'],
  ['Exotic', 'exotic'],
  ['Unique', 'unique'],
])

const RARITY_ORDER = new Map([
  ['common', 0],
  ['uncommon', 1],
  ['rare', 2],
  ['exotic', 3],
  ['unique', 4],
])

/**
 * Reads and parses one CSV source file into objects keyed by header name.
 *
 * Keeping CSV parsing in one helper ensures every source receives the
 * same trimming and empty-line behaviour.
 */
async function loadCsvFile(path) {
  const csv = await readFile(path, 'utf8')

  return parse(csv, {
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

/**
 * Parses an optional positive integer without inventing ordering for blanks.
 */
function parseOptionalSortOrder(value, rowNumber) {
  if (!value) {
    return null
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(
      `Inorganic resource row ${rowNumber} has invalid SortOrder "${value}".`,
    )
  }

  const sortOrder = Number(value)

  if (!Number.isSafeInteger(sortOrder) || sortOrder < 1) {
    throw new Error(
      `Inorganic resource row ${rowNumber} has invalid SortOrder "${value}".`,
    )
  }

  return sortOrder
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
function validatePlanetDirectory(rows) {
  const requiredFields = [
    'SystemName',
    'PlanetName',
    'PlanetFormID',
    'StarSystemID',
  ]

  for (const [index, row] of rows.entries()) {
    for (const field of requiredFields) {
      if (!row[field]) {
        throw new Error(
          `Planet Directory row ${index + 2} is missing ${field}.`,
        )
      }
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
function buildBodies(rows) {
  const bodiesById = new Map()

  for (const row of rows) {
    const id = String(row.PlanetFormID)

    const body = {
      id,
      systemId: String(row.StarSystemID),
      name: row.PlanetName,
    }

    const existingBody = bodiesById.get(id)

    /*
     * Duplicate source rows are harmless if they describe the same body,
     * but conflicting records for one FormID should stop generation.
     */
    if (
      existingBody &&
      (
        existingBody.name !== body.name ||
        existingBody.systemId !== body.systemId
      )
    ) {
      throw new Error(
        `Planetary body ${id} has conflicting source records.`,
      )
    }

    bodiesById.set(id, body)
  }

  return [...bodiesById.values()].sort((left, right) => {
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
 * Reduces harmless formatting differences between canonical runtime
 * names and player-facing catalogue names.
 *
 * Examples:
 *   "Helium-3"        -> "helium3"
 *   "Helium3"         -> "helium3"
 *   "Ionic Liquids"   -> "ionicliquids"
 *   "IonicLiquids"    -> "ionicliquids"
 *
 * Genuine spelling/name differences are handled by RESOURCE_NAME_ALIASES.
 */
function normalizeResourceName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Builds the complete logical resource catalogue from the curated inorganic
 * and organic dictionaries. Occurrence sources never manufacture catalogue
 * records.
 */
function buildResources(
  inorganicRows,
  organicDictionaryRows,
) {
  const resourcesById = new Map()
  const inorganicByName = new Map()
  const resourceIds = new Set()
  const inorganicNames = new Set()
  const inorganicCodes = new Set()

  for (const [index, row] of inorganicRows.entries()) {
    const rowNumber = index + 2

    if (!row.Code || !row.Resource || !row.Rarity) {
      throw new Error(
        `Inorganic resource row ${rowNumber} is missing ` +
          'Code, Resource, or Rarity.',
      )
    }

    const id = createNameId(row.Resource)
    const rarity = parseRarity(
      row.Rarity,
      'Inorganic resource',
      rowNumber,
    )

    assertUniqueValue(
      inorganicNames,
      row.Resource,
      'inorganic resource name',
    )
    assertUniqueValue(
      resourceIds,
      id,
      'resource ID',
    )
    assertUniqueValue(
      inorganicCodes,
      row.Code,
      'inorganic resource abbreviation',
    )

    const resource = {
      id,
      name: row.Resource,
      shortName: row.Code,
      category: 'inorganic',
      rarity,
      parentName: row.ParentResource || null,
      parentId: null,
      sortOrder: parseOptionalSortOrder(
        row.SortOrder,
        rowNumber,
      ),
    }

    resourcesById.set(id, resource)
    inorganicByName.set(row.Resource, resource)
  }

  for (const resource of inorganicByName.values()) {
    if (!resource.parentName) {
      continue
    }

    if (resource.parentName === resource.name) {
      throw new Error(
        `Inorganic resource "${resource.name}" cannot be its own parent.`,
      )
    }

    const parent = inorganicByName.get(resource.parentName)

    if (!parent) {
      throw new Error(
        `Inorganic resource "${resource.name}" has unknown parent ` +
          `"${resource.parentName}".`,
      )
    }

    if (
      RARITY_ORDER.get(parent.rarity) >=
      RARITY_ORDER.get(resource.rarity)
    ) {
      throw new Error(
        `Inorganic resource "${resource.name}" must be rarer than ` +
          `its parent "${parent.name}".`,
      )
    }

    resource.parentId = parent.id
  }

  const visitStates = new Map()

  function visitResource(resource) {
    const state = visitStates.get(resource.id)

    if (state === 'visiting') {
      throw new Error(
        `Inorganic resource family contains a cycle at "${resource.name}".`,
      )
    }

    if (state === 'visited') {
      return
    }

    visitStates.set(resource.id, 'visiting')

    if (resource.parentId) {
      visitResource(resourcesById.get(resource.parentId))
    }

    visitStates.set(resource.id, 'visited')
  }

  for (const resource of inorganicByName.values()) {
    visitResource(resource)
  }

  const sortOrdersByParentId = new Map()

  for (const resource of inorganicByName.values()) {
    if (resource.sortOrder === null) {
      continue
    }

    const siblingKey = resource.parentId ?? '__root__'
    let sortOrders = sortOrdersByParentId.get(siblingKey)

    if (!sortOrders) {
      sortOrders = new Set()
      sortOrdersByParentId.set(siblingKey, sortOrders)
    }

    if (sortOrders.has(resource.sortOrder)) {
      throw new Error(
        `Inorganic siblings under "${resource.parentName ?? 'root'}" ` +
          `reuse SortOrder ${resource.sortOrder}.`,
      )
    }

    sortOrders.add(resource.sortOrder)
  }

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
  })).sort((left, right) => {
    const categoryComparison =
      left.category.localeCompare(right.category)

    return categoryComparison !== 0
      ? categoryComparison
      : left.name.localeCompare(right.name)
  })
}

/**
 * Builds a lookup from resource category + normalised display name to
 * the application's logical ResourceId.
 *
 * This lookup is later used to resolve canonical resource FormIDs.
 */
function buildResourceCatalogueLookup(resources) {
  const lookup = new Map()

  for (const resource of resources) {
    const key =
      `${resource.category}:` +
      normalizeResourceName(resource.name)

    if (lookup.has(key)) {
      throw new Error(
        `Resource catalogue contains an ambiguous normalised key: ${key}.`,
      )
    }

    lookup.set(key, resource.id)
  }

  return lookup
}

/**
 * Resolves one canonical resource occurrence to its logical application
 * ResourceId.
 *
 * Explicit aliases are applied before normalised-name matching.
 */
function resolveCanonicalResourceId(
  row,
  catalogueLookup,
) {
  const category =
    row.ResourceCategory.toLowerCase()

  const aliasKey =
    `${category}:${row.ResourceName}`

  const catalogueName =
    RESOURCE_NAME_ALIASES.get(aliasKey) ??
    row.ResourceName

  const lookupKey =
    `${category}:` +
    normalizeResourceName(catalogueName)

  const resourceId =
    catalogueLookup.get(lookupKey)

  if (!resourceId) {
    throw new Error(
      `Unable to map canonical resource ` +
        `${row.ResourceFormID} (${row.ResourceCategory}: ` +
        `${row.ResourceName}) to the application resource catalogue.`,
    )
  }

  return resourceId
}

/**
 * Builds a canonical ResourceFormID -> application ResourceId crosswalk.
 *
 * Repeated occurrence rows for the same FormID are expected. If one
 * FormID ever resolves to different application resources, generation
 * stops because the source data is internally inconsistent.
 */
function buildResourceFormIdCrosswalk(
  allResourceRows,
  resources,
) {
  const catalogueLookup =
    buildResourceCatalogueLookup(resources)

  const resourceIdsByFormId = new Map()

  for (const [index, row] of allResourceRows.entries()) {
    if (
      !row.ResourceFormID ||
      !row.ResourceName ||
      !row.ResourceCategory
    ) {
      throw new Error(
        `All Resources row ${index + 2} is missing resource identity data.`,
      )
    }

    const resourceId =
      resolveCanonicalResourceId(
        row,
        catalogueLookup,
      )

    const existingResourceId =
      resourceIdsByFormId.get(row.ResourceFormID)

    if (
      existingResourceId &&
      existingResourceId !== resourceId
    ) {
      throw new Error(
        `Resource FormID ${row.ResourceFormID} maps to both ` +
          `"${existingResourceId}" and "${resourceId}".`,
      )
    }

    resourceIdsByFormId.set(
      row.ResourceFormID,
      resourceId,
    )
  }

  return resourceIdsByFormId
}

/**
 * Normalises a system or planetary-body display name for matching between
 * independently exported reference datasets.
 *
 * These names are used only as temporary build-time join keys. Canonical
 * FormIDs remain the runtime identifiers written to generated JSON.
 */
function normalizeLocationName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Creates a build-time key identifying one organic resource occurrence on
 * one planetary body.
 *
 * The cleaned organic source uses player-facing resource names, whereas
 * All Resources may use canonical runtime names. Known aliases are therefore
 * converted to their player-facing equivalents before comparison.
 */
function createOrganicOccurrenceKey(
  systemName,
  bodyName,
  resourceName,
) {
  const aliasKey =
    `organic:${resourceName}`

  const catalogueName =
    RESOURCE_NAME_ALIASES.get(aliasKey) ??
    resourceName

  return [
    normalizeLocationName(systemName),
    normalizeLocationName(bodyName),
    normalizeResourceName(catalogueName),
  ].join('|')
}

/**
 * Interprets the Farmable field from the cleaned organic-resource source.
 *
 * Supporting a few common truthy representations makes the build resilient
 * to harmless spreadsheet/export formatting changes without treating an
 * unknown non-empty value as farmable.
 */
function isFarmableValue(value) {
  const normalised =
    String(value ?? '')
      .trim()
      .toLowerCase()

  return [
    'true',
    'yes',
    'y',
    '1',
    'farmable',
  ].includes(normalised)
}

/**
 * Builds the set of body/resource combinations for which at least one
 * farmable flora or fauna source exists.
 *
 * Multiple wild and farmable organisms may produce the same resource on the
 * same body. The Set deliberately collapses those rows: one farmable source
 * is sufficient for planetary-level availability.
 */
function buildFarmableOrganicOccurrenceKeys(
  organicOccurrenceRows,
  resources,
) {
  if (
    organicOccurrenceRows.length > 0 &&
    !Object.prototype.hasOwnProperty.call(
      organicOccurrenceRows[0],
      'Farmable',
    )
  ) {
    throw new Error(
      'Organic resource source is missing the Farmable column.',
    )
  }

  const farmableKeys = new Set()
  const resourceCatalogueLookup =
    buildResourceCatalogueLookup(resources)

  for (const [index, row] of organicOccurrenceRows.entries()) {
    if (
      row.Resource &&
      NON_RESOURCE_ORGANIC_OCCURRENCE_NAMES.has(row.Resource)
    ) {
      continue
    }

    if (row.Resource) {
      const aliasKey = `organic:${row.Resource}`
      const catalogueName =
        RESOURCE_NAME_ALIASES.get(aliasKey) ?? row.Resource
      const lookupKey =
        `organic:${normalizeResourceName(catalogueName)}`

      if (!resourceCatalogueLookup.has(lookupKey)) {
        throw new Error(
          `Organic occurrence row ${index + 2} refers to unknown ` +
            `resource "${row.Resource}".`,
        )
      }
    }

    if (!isFarmableValue(row.Farmable)) {
      continue
    }

    if (!row.System || !row.Body || !row.Resource) {
      throw new Error(
        `Farmable organic resource row ${index + 2} is missing ` +
          'System, Body, or Resource.',
      )
    }

    farmableKeys.add(
      createOrganicOccurrenceKey(
        row.System,
        row.Body,
        row.Resource,
      ),
    )
  }

  return farmableKeys
}

/**
 * Builds the body -> resources relationship dataset.
 *
 * PlanetFormID is already the application's canonical body ID.
 * ResourceFormID is first resolved through the canonical/logical resource
 * crosswalk, then resources are grouped by body.
 *
 * Inorganic occurrences are included directly from All Resources.
 *
 * Organic occurrences are included only when the cleaned organic source
 * confirms that at least one farmable flora or fauna source produces that
 * resource on the body. A wild source may coexist with a farmable source;
 * one farmable source is sufficient for inclusion.
 *
 * Duplicate occurrences of the same logical resource on one body are
 * collapsed automatically by the Set.
 */
function buildBodyResources(
  allResourceRows,
  organicOccurrenceRows,
  bodies,
  resources,
  resourceIdsByFormId,
) {
  const knownBodyIds =
    new Set(bodies.map((body) => body.id))

  const farmableOrganicKeys =
    buildFarmableOrganicOccurrenceKeys(
      organicOccurrenceRows,
      resources,
    )

  const resourceIdsByBodyId = new Map()

  for (const [index, row] of allResourceRows.entries()) {
    if (
      !row.PlanetFormID ||
      !row.ResourceFormID
    ) {
      throw new Error(
        `All Resources row ${index + 2} is missing body/resource keys.`,
      )
    }

    const bodyId =
      String(row.PlanetFormID)

    if (!knownBodyIds.has(bodyId)) {
      throw new Error(
        `All Resources row ${index + 2} refers to unknown ` +
          `PlanetFormID ${bodyId}.`,
      )
    }

    /*
     * Organic resources are useful to the outpost model only when at least
     * one farmable source exists on this body. Wild-only occurrences remain
     * part of the canonical source data but are omitted from body-resources.
     */
    if (
      row.ResourceCategory.toLowerCase() ===
      'organic'
    ) {
      if (
        !row.SystemName ||
        !row.PlanetName ||
        !row.ResourceName
      ) {
        throw new Error(
          `Organic All Resources row ${index + 2} is missing ` +
            'SystemName, PlanetName, or ResourceName.',
        )
      }

      const occurrenceKey =
        createOrganicOccurrenceKey(
          row.SystemName,
          row.PlanetName,
          row.ResourceName,
        )

      if (
        !farmableOrganicKeys.has(
          occurrenceKey,
        )
      ) {
        continue
      }
    }

    const resourceId =
      resourceIdsByFormId.get(
        row.ResourceFormID,
      )

    if (!resourceId) {
      throw new Error(
        `All Resources row ${index + 2} refers to unmapped ` +
          `ResourceFormID ${row.ResourceFormID}.`,
      )
    }

    let resourceIds =
      resourceIdsByBodyId.get(bodyId)

    if (!resourceIds) {
      resourceIds = new Set()

      resourceIdsByBodyId.set(
        bodyId,
        resourceIds,
      )
    }

    resourceIds.add(resourceId)
  }

  return [...resourceIdsByBodyId.entries()]
    .map(([bodyId, resourceIds]) => ({
      bodyId,
      resourceIds: [...resourceIds].sort(),
    }))
    .sort((left, right) =>
      left.bodyId.localeCompare(right.bodyId),
    )
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
function buildProductRecipes(
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

    const resourceIngredient =
      resourcesByName.get(row.Ingredient)

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
    inorganicRows,
    organicDictionaryRows,
    organicOccurrenceRows,
    allResourceRows,
  ] = await Promise.all([
    loadCsvFile(
      INORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE,
    ),
    loadCsvFile(
      ORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE,
    ),
    loadCsvFile(
      ORGANIC_OCCURRENCES_SOURCE_FILE,
    ),
    loadCsvFile(
      ALL_RESOURCES_SOURCE_FILE,
    ),
  ])

  const resources =
    buildResources(
      inorganicRows,
      organicDictionaryRows,
    )

  console.log('Building resource crosswalk...')

  const resourceIdsByFormId =
    buildResourceFormIdCrosswalk(
      allResourceRows,
      resources,
    )

  console.log(
    `Resolved ${resourceIdsByFormId.size} canonical ` +
      `resource FormIDs to ${resources.length} logical resources.`,
  )

  console.log('Building body-resource relationships...')

  const bodyResources =
    buildBodyResources(
      allResourceRows,
      organicOccurrenceRows,
      bodies,
      resources,
      resourceIdsByFormId,
    )
  
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

  await writeJson(
    BODY_RESOURCES_OUTPUT_FILE,
    bodyResources,
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

main().catch((error) => {
  console.error('Reference-data build failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})
