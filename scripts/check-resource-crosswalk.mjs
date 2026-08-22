/**
 * check-resource-crosswalk.mjs
 *
 * Purpose:
 *   Diagnoses how canonical resource records from planet-all-resources.csv
 *   correspond to the resource names currently used to build resources.json.
 *
 * Architecture:
 *   This is a development-time diagnostic tool only. It does not write or
 *   modify any application reference data.
 *
 *   Canonical planetary occurrence data identifies resources using
 *   ResourceFormID and ResourceName. The existing resource catalogue uses
 *   curated player-facing names from separate inorganic and organic sources.
 *
 *   This script checks whether those two representations can be joined
 *   reliably before that mapping is incorporated into the real generator.
 *
 * Change this file when:
 *   - resource source structures change;
 *   - new known spelling aliases need to be investigated;
 *   - crosswalk diagnostics need to become stricter.
 */

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'csv-parse/sync'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, '..')

const ALL_RESOURCES_SOURCE_FILE = resolve(
  PROJECT_ROOT,
  'reference-source',
  'planet-all-resources.csv',
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

/**
 * Reads one CSV source using the same basic parsing rules as the main
 * reference-data generator.
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
 * Reduces formatting differences that should not affect identity.
 *
 * For example:
 *   "Helium-3"       -> "helium3"
 *   "Metabolic Agent" -> "metabolicagent"
 *   "IonicLiquids"    -> "ionicliquids"
 *
 * This deliberately does NOT attempt to correct spelling differences
 * such as Aluminum vs Aluminium. Those should remain visible so we can
 * decide on explicit mappings rather than hiding them.
 */
function normalizeResourceName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Extracts the unique canonical resources found in planetary occurrence
 * data and checks that one FormID is not associated with conflicting
 * category/name combinations.
 */
function buildCanonicalResources(rows) {
  const resourcesByFormId = new Map()

  for (const [index, row] of rows.entries()) {
    if (
      !row.ResourceFormID ||
      !row.ResourceName ||
      !row.ResourceCategory
    ) {
      throw new Error(
        `All Resources row ${index + 2} is missing resource identity data.`,
      )
    }

    const resource = {
      formId: row.ResourceFormID,
      name: row.ResourceName,
      category: row.ResourceCategory.toLowerCase(),
    }

    const existing = resourcesByFormId.get(resource.formId)

    if (
      existing &&
      (
        existing.name !== resource.name ||
        existing.category !== resource.category
      )
    ) {
      throw new Error(
        `Resource FormID ${resource.formId} has conflicting source records.`,
      )
    }

    resourcesByFormId.set(
      resource.formId,
      resource,
    )
  }

  return [...resourcesByFormId.values()]
}

/**
 * Builds the set of curated catalogue names currently used by the app.
 *
 * We retain category here so an inorganic resource cannot accidentally
 * match an organic resource that happens to normalize to the same text.
 */
function buildCatalogueResources(
  inorganicRows,
  organicRows,
) {
  const catalogue = []

  for (const row of inorganicRows) {
    if (row.Resource) {
      catalogue.push({
        name: row.Resource,
        category: 'inorganic',
      })
    }
  }

  const seenOrganicNames = new Set()

  for (const row of organicRows) {
    if (
      row.Resource &&
      !seenOrganicNames.has(row.Resource)
    ) {
      seenOrganicNames.add(row.Resource)

      catalogue.push({
        name: row.Resource,
        category: 'organic',
      })
    }
  }

  return catalogue
}

/**
 * Finds candidates whose names differ only by formatting such as spaces,
 * punctuation, or hyphens.
 */
function findMatches(
  canonicalResource,
  catalogue,
) {
  const canonicalKey =
    normalizeResourceName(canonicalResource.name)

  return catalogue.filter(
    (catalogueResource) =>
      catalogueResource.category ===
        canonicalResource.category &&
      normalizeResourceName(
        catalogueResource.name,
      ) === canonicalKey,
  )
}

/**
 * Runs the crosswalk diagnostic without modifying generated reference data.
 */
async function main() {
  const [
    allResourceRows,
    inorganicRows,
    organicRows,
  ] = await Promise.all([
    loadCsvFile(ALL_RESOURCES_SOURCE_FILE),
    loadCsvFile(INORGANIC_RESOURCES_SOURCE_FILE),
    loadCsvFile(ORGANIC_RESOURCES_SOURCE_FILE),
  ])

  const canonicalResources =
    buildCanonicalResources(allResourceRows)

  const catalogue =
    buildCatalogueResources(
      inorganicRows,
      organicRows,
    )

  const matched = []
  const unmatched = []
  const ambiguous = []

  for (const canonicalResource of canonicalResources) {
    const matches = findMatches(
      canonicalResource,
      catalogue,
    )

    if (matches.length === 1) {
      matched.push({
        ...canonicalResource,
        catalogueName: matches[0].name,
      })
    } else if (matches.length === 0) {
      unmatched.push(canonicalResource)
    } else {
      ambiguous.push({
        canonicalResource,
        matches,
      })
    }
  }

  console.log(
    `Canonical resources: ${canonicalResources.length}`,
  )

  console.log(
    `Catalogue resources: ${catalogue.length}`,
  )

  console.log(
    `Matched automatically: ${matched.length}`,
  )

  console.log(
    `Unmatched: ${unmatched.length}`,
  )

  console.log(
    `Ambiguous: ${ambiguous.length}`,
  )

  if (unmatched.length > 0) {
    console.log('\nUnmatched canonical resources:')

    for (const resource of unmatched) {
      console.log(
        `  ${resource.formId} | ` +
          `${resource.category} | ` +
          `${resource.name}`,
      )
    }
  }

  if (ambiguous.length > 0) {
    console.log('\nAmbiguous canonical resources:')

    for (const entry of ambiguous) {
      console.log(
        `  ${entry.canonicalResource.formId} | ` +
          `${entry.canonicalResource.name} -> ` +
          entry.matches
            .map((match) => match.name)
            .join(', '),
      )
    }
  }
}

main().catch((error) => {
  console.error('Resource crosswalk check failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})