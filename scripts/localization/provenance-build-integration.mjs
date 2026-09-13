/**
 * Purpose: Apply C8 source policy, coverage, row-shape, locale, and drift gates.
 * Architecture: Pure helpers keep repository-only tests independent of installed game files.
 * Change this file when: The provenance build contract or drift vocabulary changes.
 */
import { createHash } from 'node:crypto'

export const DRIFT_CATEGORIES = Object.freeze({ INPUT: 'input', EDITORIAL: 'editorial', STRUCTURAL: 'structural' })

export function validateInputPolicy(configuredPlugins, policy) {
  const configured = new Map(configuredPlugins.map((plugin) => [plugin.filename, plugin]))
  const required = policy.authoritativePlugins.map((plugin) => plugin.filename)
  const missing = required.filter((filename) => !configured.has(filename))
  if (missing.length) {
    throw new Error(`AUTHORITATIVE_PLUGIN_MISSING: Required authoritative input(s): ${missing.join(', ')}.`)
  }
  return {
    authoritative: required.map((filename) => configured.get(filename)),
    optionalCompatibility: policy.optionalCompatibilityPlugins.map((filename) => ({
      filename, present: configured.has(filename), required: false,
    })),
    ignored: configuredPlugins.filter((plugin) => !required.includes(plugin.filename) && !policy.optionalCompatibilityPlugins.includes(plugin.filename))
      .map((plugin) => plugin.filename).sort(),
  }
}

export function buildCanonicalPopulation(targetGroups) {
  const population = new Map()
  for (const targets of targetGroups) {
    for (const target of targets) {
      const entityKind = target.entityKind ?? target.EntityKind
      const entityId = target.entityId ?? target.EntityId
      const key = `${entityKind}:${entityId}`
      if (population.has(key)) throw new Error(`DUPLICATE_CANONICAL_ENTITY: ${key}.`)
      population.set(key, { entityKind, entityId })
    }
  }
  return population
}

export function validateCoverage(population, provenance, unresolved, excluded = []) {
  const resolved = new Set(provenance.map((row) => `${row.EntityKind}:${row.EntityId}`))
  const unresolvedKeys = new Set(unresolved.map((row) => `${row.EntityKind}:${row.EntityId}`))
  const excludedKeys = new Set(excluded.map((row) => `${row.EntityKind ?? row.entityKind}:${row.EntityId ?? row.entityId}`))
  const actual = new Set([...resolved, ...unresolvedKeys, ...excludedKeys])
  const overlap = [...actual].filter((key) => [resolved.has(key), unresolvedKeys.has(key), excludedKeys.has(key)].filter(Boolean).length !== 1)
  const missing = [...population.keys()].filter((key) => !actual.has(key))
  const extra = [...actual].filter((key) => !population.has(key))
  if (overlap.length || missing.length || extra.length) {
    throw new Error(`COVERAGE_RECONCILIATION_FAILED: ${JSON.stringify({ overlap, missing, extra })}`)
  }
  return { canonicalEntities: population.size, resolvedEntities: resolved.size, unresolvedEntities: unresolvedKeys.size, excludedEntities: excludedKeys.size }
}

export function validateProvenanceRowShapes(provenance) {
  const grouped = new Map()
  for (const row of provenance) {
    const key = `${row.EntityKind}:${row.EntityId}`
    grouped.set(key, [...(grouped.get(key) ?? []), row])
  }
  for (const [key, rows] of grouped) {
    const kinds = new Set(rows.map((row) => row.DisplayNameSourceKind))
    if (kinds.size !== 1) throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} mixes source kinds.`)
    const kind = rows[0].DisplayNameSourceKind
    if (kind === 'direct' || kind === 'template') {
      if (rows.length !== 1 || rows[0].ComponentOrder !== '0' || rows[0].ComponentRole !== 'complete') {
        throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} ${kind} must have one complete row at slot 0.`)
      }
    } else if (kind === 'composed') {
      const expectedRoles = new Map([['0', 'prefix'], ['1', 'species'], ['2', 'diet']])
      if (rows.length < 1 || rows.length > 3) throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} composed row count is ${rows.length}.`)
      const seen = new Set()
      for (const row of rows) {
        if (seen.has(row.ComponentOrder) || expectedRoles.get(row.ComponentOrder) !== row.ComponentRole) {
          throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} has invalid composed slot ${row.ComponentOrder}:${row.ComponentRole}.`)
        }
        seen.add(row.ComponentOrder)
      }
      if (!seen.has('1')) throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} composed provenance requires the species component at slot 1.`)
    } else throw new Error(`PROVENANCE_ROW_SHAPE_INVALID: ${key} has unsupported source kind ${kind}.`)
  }
  return grouped.size
}

export function validateResourceCatalogueReconciliation(provenance, runtimeResources, excludedResourceIds) {
  const provenanceIds = new Set(provenance.filter((row) => row.EntityKind === 'resource').map((row) => row.EntityId))
  const runtimeIds = new Set(runtimeResources.map((resource) => resource.id))
  const excludedIds = new Set(excludedResourceIds)
  const missing = [...runtimeIds].filter((id) => !provenanceIds.has(id)).sort()
  const sourceOnly = [...provenanceIds].filter((id) => !runtimeIds.has(id)).sort()
  if (missing.length || JSON.stringify(sourceOnly) !== JSON.stringify([...excludedIds].sort())) {
    throw new Error(`RESOURCE_CATALOGUE_RECONCILIATION_FAILED: ${JSON.stringify({ missing, sourceOnly, excluded: [...excludedIds].sort() })}`)
  }
  return { provenanceResources: provenanceIds.size, runtimeResources: runtimeIds.size, sourceOnly }
}

export function verifyJapaneseAvailability(provenance, localizedTables) {
  const missing = []
  for (const row of provenance) {
    const key = `${row.NameSourcePlugin}:ja:${row.NameStringTable}`
    const value = localizedTables.get(key)?.get(Number.parseInt(row.NameStringID, 16) >>> 0)
    if (value === undefined) missing.push({ entity: `${row.EntityKind}:${row.EntityId}`, componentOrder: row.ComponentOrder, table: key, stringId: row.NameStringID })
  }
  if (missing.length) throw new Error(`LOCALIZATION_TABLE_MISSING: ${missing.length} qualified Japanese IDs are unavailable; first=${JSON.stringify(missing[0])}.`)
  return { requiredIds: provenance.length, missingIds: 0 }
}

const ROW_KEY = (row) => `${row.EntityKind}:${row.EntityId}:${row.ComponentOrder ?? 'state'}`
const ENTITY_KEY = (row) => `${row.EntityKind}:${row.EntityId}`
const STRUCTURAL_FIELDS = ['DisplayNameSourceKind', 'ComponentRole', 'RecordSourcePlugin', 'RecordFormID', 'RecordSignature', 'NameFieldPath', 'NameSourcePlugin', 'NameStringTable']
const EDITORIAL_FIELDS = ['NameStringID', 'CanonicalEnglish']
const FIELD_DRIFT_TYPES = Object.freeze({
  DisplayNameSourceKind: 'composition-shape-changed', ComponentRole: 'composition-shape-changed',
  RecordSourcePlugin: 'record-changed', RecordFormID: 'record-changed', RecordSignature: 'record-changed',
  NameFieldPath: 'field-path-changed', NameSourcePlugin: 'provider-changed', NameStringTable: 'string-table-changed',
  NameStringID: 'string-id-changed', CanonicalEnglish: 'canonical-english-changed',
})

export function compareProvenanceArtifacts(fresh, committed) {
  const drift = []
  const compareRows = (freshRows, committedRows) => {
    const next = new Map(freshRows.map((row) => [ROW_KEY(row), row]))
    const before = new Map(committedRows.map((row) => [ROW_KEY(row), row]))
    for (const key of [...new Set([...next.keys(), ...before.keys()])].sort()) {
      const after = next.get(key)
      const previous = before.get(key)
      if (!previous) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: 'added-provenance-component', key, after })
      else if (!after) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: 'removed-provenance-component', key, before: previous })
      else {
        const structural = STRUCTURAL_FIELDS.filter((field) => previous[field] !== after[field])
        const editorial = EDITORIAL_FIELDS.filter((field) => previous[field] !== after[field])
        for (const field of structural) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: FIELD_DRIFT_TYPES[field], key, fields: [field], before: previous[field], after: after[field] })
        for (const field of editorial) drift.push({ category: DRIFT_CATEGORIES.EDITORIAL, type: FIELD_DRIFT_TYPES[field], key, fields: [field], before: previous[field], after: after[field] })
      }
    }
  }
  compareRows(fresh.provenance, committed.provenance)
  const freshEntities = new Set(fresh.provenance.map(ENTITY_KEY)); const committedEntities = new Set(committed.provenance.map(ENTITY_KEY))
  for (const key of [...freshEntities].filter((key) => !committedEntities.has(key)).sort()) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: 'added-entity', key })
  for (const key of [...committedEntities].filter((key) => !freshEntities.has(key)).sort()) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: 'removed-entity', key })
  const unresolvedMap = (rows) => new Map(rows.map((row) => [ENTITY_KEY(row), row]))
  const nextUnresolved = unresolvedMap(fresh.unresolved); const beforeUnresolved = unresolvedMap(committed.unresolved)
  for (const key of [...new Set([...nextUnresolved.keys(), ...beforeUnresolved.keys()])].sort()) {
    if (JSON.stringify(beforeUnresolved.get(key)) !== JSON.stringify(nextUnresolved.get(key))) drift.push({ category: DRIFT_CATEGORIES.STRUCTURAL, type: 'unresolved-status-changed', key, before: beforeUnresolved.get(key), after: nextUnresolved.get(key) })
  }
  if (JSON.stringify(fresh.normalizations) !== JSON.stringify(committed.normalizations)) drift.push({ category: DRIFT_CATEGORIES.EDITORIAL, type: 'normalization-changed', key: 'normalizations', before: committed.normalizations, after: fresh.normalizations })
  return drift
}

export function stableManifestIdentity(manifest) {
  const stable = JSON.parse(JSON.stringify(manifest))
  delete stable.generatedAt
  if (stable.generator) delete stable.generator.commit
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex').toUpperCase()
}

export function compareInputManifests(fresh, committed) {
  if (!committed) return [{ category: DRIFT_CATEGORIES.INPUT, type: 'committed-input-manifest-missing' }]
  if (stableManifestIdentity(fresh) === stableManifestIdentity(committed)) return []
  const drift = []
  if (fresh.gameVersion !== committed.gameVersion) drift.push({ category: DRIFT_CATEGORIES.INPUT, type: 'game-version-changed', before: committed.gameVersion, after: fresh.gameVersion })
  const compareCollections = (nextRows, beforeRows, keyFor, fields, prefix) => {
    const next = new Map((nextRows ?? []).map((row) => [keyFor(row), row]))
    const before = new Map((beforeRows ?? []).map((row) => [keyFor(row), row]))
    for (const key of [...new Set([...next.keys(), ...before.keys()])].sort()) {
      const after = next.get(key); const previous = before.get(key)
      if (!previous || !after) drift.push({ category: DRIFT_CATEGORIES.INPUT, type: `${prefix}-${previous ? 'removed' : 'added'}`, key, before: previous, after })
      else for (const [field, type] of fields) if (JSON.stringify(previous[field]) !== JSON.stringify(after[field])) {
        drift.push({ category: DRIFT_CATEGORIES.INPUT, type, key, field, before: previous[field], after: after[field] })
      }
    }
  }
  compareCollections(fresh.authoritativePlugins, committed.authoritativePlugins, (row) => row.filename, [
    ['sha256', 'plugin-hash-changed'], ['size', 'plugin-size-changed'], ['masters', 'load-master-metadata-changed'], ['moduleClass', 'module-class-changed'],
  ], 'plugin')
  compareCollections(fresh.localizationArchives, committed.localizationArchives, (row) => `${row.plugin}:${row.filename}`, [
    ['sha256', 'archive-hash-changed'], ['size', 'archive-size-changed'], ['version', 'archive-metadata-changed'], ['archiveType', 'archive-metadata-changed'],
  ], 'archive')
  compareCollections(fresh.localizationInputs, committed.localizationInputs, (row) => `${row.plugin}:${row.locale}:${row.tableType}`, [
    ['sha256', 'string-table-hash-changed'], ['size', 'string-table-size-changed'], ['archiveFilename', 'string-table-member-changed'], ['memberName', 'string-table-member-changed'],
  ], 'string-table')
  if (!drift.length) drift.push({ category: DRIFT_CATEGORIES.INPUT, type: 'input-policy-or-tool-changed', beforeIdentity: stableManifestIdentity(committed), afterIdentity: stableManifestIdentity(fresh) })
  return drift
}
