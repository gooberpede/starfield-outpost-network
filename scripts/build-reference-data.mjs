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

const INORGANIC_RESOURCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'inorganic-resource-dictionary.csv',
)

const ORGANIC_RESOURCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'organic-resources.csv',
)

const INDUSTRIAL_WORKBENCH_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'industrial-workbench.csv',
)

const ABBREVIATIONS_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'abbreviations.csv',
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
 * Creates the lookup key used by the curated abbreviation source.
 *
 * Type + player-facing name is intentionally used rather than application ID
 * so abbreviations.csv remains easy to read and edit by hand.
 */
function createAbbreviationKey(type, name) {
  return `${type}:${name.trim()}`
}

/**
 * Validates abbreviations.csv and builds a Type + Name -> ShortName lookup.
 *
 * Abbreviations are curated source data. Missing or duplicate mappings should
 * therefore fail the build rather than silently falling back to generated
 * abbreviations.
 */
function buildAbbreviationLookup(rows) {
  const lookup = new Map()

  for (const [index, row] of rows.entries()) {
    if (
      !row.Type ||
      !row.Name ||
      !row.ShortName
    ) {
      throw new Error(
        `Abbreviations row ${index + 2} is missing ` +
          `Type, Name, or ShortName.`,
      )
    }

    const type =
      row.Type.trim().toLowerCase()

    if (
      type !== 'organic' &&
      type !== 'product'
    ) {
      throw new Error(
        `Abbreviations row ${index + 2} has unsupported ` +
          `Type "${row.Type}".`,
      )
    }

    const key =
      createAbbreviationKey(
        type,
        row.Name,
      )

    if (lookup.has(key)) {
      throw new Error(
        `Duplicate abbreviation mapping for ` +
          `"${type}: ${row.Name}".`,
      )
    }

    lookup.set(
      key,
      row.ShortName.trim(),
    )
  }

  return lookup
}

/**
 * Retrieves one required curated abbreviation.
 *
 * Failing here makes new resources/products visible during development rather
 * than quietly exposing their full names as cargo abbreviations.
 */
function getRequiredAbbreviation(
  abbreviationLookup,
  type,
  name,
) {
  const key =
    createAbbreviationKey(type, name)

  const shortName =
    abbreviationLookup.get(key)

  if (!shortName) {
    throw new Error(
      `No abbreviation defined for "${type}: ${name}".`,
    )
  }

  return shortName
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
 * Builds the complete logical resource catalogue from the curated
 * inorganic dictionary and organic-resource source.
 */
function buildResources(
  inorganicRows,
  organicRows,
  allResourceRows,
  abbreviationLookup,
) {
  const resourcesById = new Map()

  for (const [index, row] of inorganicRows.entries()) {
    if (!row.Code || !row.Resource) {
      throw new Error(
        `Inorganic resource row ${index + 2} is missing Code or Resource.`,
      )
    }

    const id = createNameId(row.Resource)

    resourcesById.set(id, {
      id,
      name: row.Resource,
      shortName: row.Code,
      category: 'inorganic',
    })
  }

  for (const [index, row] of organicRows.entries()) {
    if (!row.Resource) {
      throw new Error(
        `Organic resource row ${index + 2} is missing Resource.`,
      )
    }

    const id = createNameId(row.Resource)

    const existingResource = resourcesById.get(id)

    /*
     * A name collision between organic and inorganic catalogues would be
     * ambiguous in the current model and should be investigated rather
     * than silently choosing one category.
     */
    if (
      existingResource &&
      existingResource.category !== 'organic'
    ) {
      throw new Error(
        `Resource "${row.Resource}" appears in both organic ` +
          `and inorganic source data.`,
      )
    }

    if (!existingResource) {
      resourcesById.set(id, {
        id,
        name: row.Resource,
        shortName: getRequiredAbbreviation(
          abbreviationLookup,
          'organic',
          row.Resource,
        ),
        category: 'organic',
      })
    }
  }

  /*
   * The cleaned organic occurrence source does not contain every unique
   * organic resource in the game. Known canonical/display-name aliases
   * therefore also act as an explicit source for logical catalogue
   * resources that are otherwise absent.
   *
   * This deliberately uses only RESOURCE_NAME_ALIASES. We do not create
   * arbitrary catalogue resources from canonical runtime names because
   * those names are not always player-facing labels.
   */
  for (const row of allResourceRows) {
    if (
      !row.ResourceName ||
      !row.ResourceCategory
    ) {
      continue
    }

    const category =
      row.ResourceCategory.toLowerCase()

    const aliasKey =
      `${category}:${row.ResourceName}`

    const aliasedName =
      RESOURCE_NAME_ALIASES.get(aliasKey)

    if (!aliasedName) {
      continue
    }

    const id =
      createNameId(aliasedName)

    const existingResource =
      resourcesById.get(id)

    /*
     * Existing records such as Aluminium are expected and need no change.
     * Missing aliased resources are added using the known player-facing
     * name supplied by the explicit alias table.
     */
    if (!existingResource) {
      resourcesById.set(id, {
        id,
        name: aliasedName,
        shortName: getRequiredAbbreviation(
          abbreviationLookup,
          'organic',
          aliasedName,
        ),
        category,
      })
    }
  }

  return [...resourcesById.values()].sort((left, right) => {
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
  organicRows,
) {
  if (
    organicRows.length > 0 &&
    !Object.prototype.hasOwnProperty.call(
      organicRows[0],
      'Farmable',
    )
  ) {
    throw new Error(
      'Organic resource source is missing the Farmable column.',
    )
  }

  const farmableKeys = new Set()

  for (const [index, row] of organicRows.entries()) {
    if (!isFarmableValue(row.Farmable)) {
      continue
    }

    if (
      !row.System ||
      !row.Body ||
      !row.Resource
    ) {
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
  organicRows,
  bodies,
  resourceIdsByFormId,
) {
  const knownBodyIds =
    new Set(bodies.map((body) => body.id))

  const farmableOrganicKeys =
    buildFarmableOrganicOccurrenceKeys(
      organicRows,
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
 * Builds the manufactured-product catalogue from Industrial Workbench rows.
 *
 * The source contains one row per product ingredient, so the same product
 * appears repeatedly. At this stage we need only the product catalogue,
 * not recipe composition, so products are deduplicated by generated ID.
 */
function buildProducts(
  rows,
  abbreviationLookup,
) {
  const productsById = new Map()

  for (const [index, row] of rows.entries()) {
    if (!row.Product) {
      throw new Error(
        `Industrial Workbench row ${index + 2} is missing Product.`,
      )
    }

    const id = createNameId(row.Product)

    const product = {
      id,
      name: row.Product,
      shortName: getRequiredAbbreviation(
        abbreviationLookup,
        'product',
        row.Product,
      ),
    }

    const existingProduct =
      productsById.get(id)

    /*
     * Repeated rows for the same product are expected because each row
     * represents one ingredient. A conflicting name for one generated ID
     * would indicate a source naming collision that needs investigation.
     */
    if (
      existingProduct &&
      existingProduct.name !== product.name
    ) {
      throw new Error(
        `Product ID "${id}" is generated from conflicting names: ` +
          `"${existingProduct.name}" and "${product.name}".`,
      )
    }

    productsById.set(id, product)
  }

  return [...productsById.values()].sort((left, right) =>
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
    organicRows,
    allResourceRows,
  ] = await Promise.all([
    loadCsvFile(
      INORGANIC_RESOURCES_SOURCE_FILE,
    ),
    loadCsvFile(
      ORGANIC_RESOURCES_SOURCE_FILE,
    ),
    loadCsvFile(
      ALL_RESOURCES_SOURCE_FILE,
    ),
  ])

  console.log('Loading abbreviations...')

  const abbreviationRows =
    await loadCsvFile(
      ABBREVIATIONS_SOURCE_FILE,
    )

  const abbreviationLookup =
    buildAbbreviationLookup(
      abbreviationRows,
    )

  const resources =
    buildResources(
      inorganicRows,
      organicRows,
      allResourceRows,
      abbreviationLookup,
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
      organicRows,
      bodies,
      resourceIdsByFormId,
    )
  
  console.log('Loading Industrial Workbench...')

  const productRows =
    await loadCsvFile(
      INDUSTRIAL_WORKBENCH_SOURCE_FILE,
    )

  const products =
    buildProducts(
      productRows,
      abbreviationLookup,
    )

  const productRecipes =
    buildProductRecipes(
      productRows,
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