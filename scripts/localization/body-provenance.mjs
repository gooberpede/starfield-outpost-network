/**
 * Purpose: Define the canonical C4 body population for localized-name provenance.
 * Architecture: Tracker-ingested rows drive exact PNDT lookups; ESM contents never expand scope.
 * Change this file when: the canonical body source schema or audited body-name route changes.
 */
import { parse } from 'csv-parse/sync'

import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import { OFFICIAL_SYSTEM_PLUGINS } from './star-system-provenance.mjs'

export const CANONICAL_BODY_TYPES = Object.freeze(['Planet', 'Moon', 'Orbital'])

function compareTargets(left, right) {
  return left.entityId.localeCompare(right.entityId)
}

/** Every canonical tracker row is one body target, including ingested orbitals. */
export function buildC4Targets(planetDirectoryCsv, authoritativePlugins = OFFICIAL_SYSTEM_PLUGINS) {
  const rows = parse(planetDirectoryCsv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  const targets = []
  const identities = new Set()
  const bodyTypeCounts = Object.fromEntries(CANONICAL_BODY_TYPES.map((bodyType) => [bodyType, 0]))
  const sourcePluginCounts = Object.fromEntries(authoritativePlugins.map((plugin) => [plugin, 0]))

  for (const row of rows) {
    if (!row.SourceFile || !row.PlanetFormID || !row.PlanetName || !row.BodyType) {
      throw new Error(`CANONICAL_SOURCE_ERROR: incomplete body identity on ${row.PlanetFormID || '<unknown>'}.`)
    }
    if (!CANONICAL_BODY_TYPES.includes(row.BodyType)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: unsupported canonical body type ${JSON.stringify(row.BodyType)} on ${row.PlanetFormID}.`)
    }
    if (!authoritativePlugins.includes(row.SourceFile)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: unsupported body source plugin ${JSON.stringify(row.SourceFile)} on ${row.PlanetFormID}.`)
    }
    if (!/^[0-9A-F]{8}$/.test(row.PlanetFormID)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: invalid body FormID ${JSON.stringify(row.PlanetFormID)}.`)
    }
    if (identities.has(row.PlanetFormID)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: duplicate body identity ${row.PlanetFormID}.`)
    }
    identities.add(row.PlanetFormID)
    bodyTypeCounts[row.BodyType] += 1
    sourcePluginCounts[row.SourceFile] += 1
    targets.push({
      entityKind: 'body',
      entityId: row.PlanetFormID,
      canonicalEnglish: row.PlanetName,
      recordSourcePlugin: row.SourceFile,
      recordFormId: row.PlanetFormID,
      recordSignature: 'PNDT',
      semanticPath: SEMANTIC_PATHS.TES_FULL_NAME,
      bodyType: row.BodyType,
    })
  }

  targets.sort(compareTargets)
  return {
    targets,
    statistics: { canonicalBodies: targets.length, bodyTypeCounts, sourcePluginCounts },
  }
}
