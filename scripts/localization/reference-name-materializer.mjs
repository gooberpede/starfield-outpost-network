/**
 * Purpose: Materialize locale reference names from committed qualified provenance.
 * Architecture: Pure locale-neutral helpers keep generation and repository verification testable.
 * Change this file when: Runtime-kind normalization or overlay serialization policy changes.
 */
import { createHash } from 'node:crypto'

export const REFERENCE_NAME_TOOL_VERSION = '2.0.0'
export const RUNTIME_KIND_ORDER = Object.freeze(['biome', 'body', 'species', 'official-term', 'product', 'resource', 'system'])
export const EXPECTED_REFERENCE_NAME_COUNTS = Object.freeze({
  biome: 428, body: 1776, species: 1121, 'official-term': 5, product: 30, resource: 78, system: 123,
})
export const COMPOSED_SEPARATOR = ' '

export function normalizeReferenceKind(kind) {
  if (kind === 'flora' || kind === 'fauna') return 'species'
  if (RUNTIME_KIND_ORDER.includes(kind)) return kind
  throw new Error(`UNKNOWN_REFERENCE_KIND: ${kind}.`)
}

function qualifiedTableKey(row, locale) {
  return `${row.NameSourcePlugin}:${locale}:${row.NameStringTable}`
}

function resolveQualifiedValue(row, localizedTables, locale) {
  const tableKey = qualifiedTableKey(row, locale)
  const stringId = Number.parseInt(row.NameStringID, 16) >>> 0
  const value = localizedTables.get(tableKey)?.get(stringId)
  if (value === undefined) {
    throw new Error(`LOCALIZATION_TABLE_MISSING: ${row.EntityKind}:${row.EntityId} component ${row.ComponentOrder} requires ${tableKey}:${row.NameStringID}.`)
  }
  if (!value || value.includes('\uFFFD')) {
    throw new Error(`INVALID_LOCALIZED_VALUE: ${row.EntityKind}:${row.EntityId} component ${row.ComponentOrder}.`)
  }
  return value
}

export function materializeReferenceNames(provenance, localizedTables, { locale = 'ja' } = {}) {
  const grouped = new Map()
  for (const row of provenance) {
    const entityKey = `${row.EntityKind}:${row.EntityId}`
    grouped.set(entityKey, [...(grouped.get(entityKey) ?? []), row])
  }
  const overlay = Object.fromEntries(RUNTIME_KIND_ORDER.map((kind) => [kind, {}]))
  for (const [entityKey, rows] of grouped) {
    const runtimeKind = normalizeReferenceKind(rows[0].EntityKind)
    const id = rows[0].EntityId
    if (Object.hasOwn(overlay[runtimeKind], id)) {
      throw new Error(`DUPLICATE_RUNTIME_KEY: ${runtimeKind}:${id} (from ${entityKey}).`)
    }
    const sourceKinds = new Set(rows.map((row) => row.DisplayNameSourceKind))
    if (sourceKinds.size !== 1) throw new Error(`COMPOSITION_SHAPE_INVALID: ${entityKey} mixes source kinds.`)
    const sourceKind = rows[0].DisplayNameSourceKind
    let value
    if (sourceKind === 'direct' || sourceKind === 'template') {
      if (rows.length !== 1) throw new Error(`COMPOSITION_SHAPE_INVALID: ${entityKey} ${sourceKind} requires one row.`)
      value = resolveQualifiedValue(rows[0], localizedTables, locale)
    } else if (sourceKind === 'composed') {
      const ordered = [...rows].sort((a, b) => Number(a.ComponentOrder) - Number(b.ComponentOrder))
      if (!ordered.some((row) => row.ComponentOrder === '1' && row.ComponentRole === 'species')) {
        throw new Error(`COMPOSITION_SHAPE_INVALID: ${entityKey} requires species slot 1.`)
      }
      value = ordered.map((row) => resolveQualifiedValue(row, localizedTables, locale)).filter(Boolean).join(COMPOSED_SEPARATOR)
    } else throw new Error(`UNSUPPORTED_PROVENANCE_SOURCE_KIND: ${entityKey} uses ${sourceKind}.`)
    overlay[runtimeKind][id] = value
  }
  const lexical = ([left], [right]) => left < right ? -1 : left > right ? 1 : 0
  return Object.fromEntries(RUNTIME_KIND_ORDER.map((kind) => [kind, Object.fromEntries(Object.entries(overlay[kind]).sort(lexical))]))
}

export function countReferenceNames(overlay) {
  return Object.fromEntries(RUNTIME_KIND_ORDER.map((kind) => [kind, Object.keys(overlay[kind] ?? {}).length]))
}

export function assertExpectedReferenceNameCounts(overlay) {
  const counts = countReferenceNames(overlay)
  if (JSON.stringify(counts) !== JSON.stringify(EXPECTED_REFERENCE_NAME_COUNTS)) {
    throw new Error(`REFERENCE_NAME_COVERAGE_FAILED: ${JSON.stringify(counts)}.`)
  }
  return counts
}

function exportNameForLocale(locale) {
  const [language, region] = locale.split('-')
  if (!language || !region) throw new Error(`UNSUPPORTED_REFERENCE_NAME_LOCALE: ${locale}.`)
  return `${language.toLowerCase()}${region.toUpperCase()}ReferenceNames`
}

export function serializeReferenceNameModule(overlay, locale = 'ja-JP') {
  return '// Generated file. Do not edit manually.\n' +
    `// Source: committed localization provenance + official ${locale} Bethesda string tables.\n\n` +
    `export const ${exportNameForLocale(locale)} = ${JSON.stringify(overlay, null, 2)} as const\n`
}

export function parseGeneratedReferenceNameModule(source, locale = 'ja-JP') {
  const prefix = `export const ${exportNameForLocale(locale)} = `
  const start = source.indexOf(prefix)
  const end = source.lastIndexOf(' as const')
  if (start < 0 || end < 0) throw new Error(`GENERATED_MODULE_INVALID: Expected ${exportNameForLocale(locale)} export.`)
  return JSON.parse(source.slice(start + prefix.length, end))
}

export function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex').toUpperCase()
}

export function compareReferenceNameOverlays(fresh, committed) {
  const drift = []
  const nextKinds = new Map(); const beforeKinds = new Map()
  for (const kind of RUNTIME_KIND_ORDER) {
    for (const id of Object.keys(fresh[kind] ?? {})) nextKinds.set(id, kind)
    for (const id of Object.keys(committed[kind] ?? {})) beforeKinds.set(id, kind)
  }
  const movedIds = new Set()
  for (const [id, kind] of nextKinds) if (beforeKinds.has(id) && beforeKinds.get(id) !== kind) {
    movedIds.add(id)
    drift.push({ type: 'changed-kind-mapping', key: id, before: beforeKinds.get(id), after: kind })
  }
  for (const kind of RUNTIME_KIND_ORDER) {
    const next = fresh[kind] ?? {}; const before = committed[kind] ?? {}
    for (const id of [...new Set([...Object.keys(next), ...Object.keys(before)])].sort()) {
      if (!(id in before) && !movedIds.has(id)) drift.push({ type: 'added-key', key: `${kind}:${id}` })
      else if (!(id in next) && !movedIds.has(id)) drift.push({ type: 'removed-key', key: `${kind}:${id}` })
      else if (next[id] !== before[id]) drift.push({ type: 'changed-localized-value', key: `${kind}:${id}`, before: before[id], after: next[id] })
    }
  }
  for (const kind of Object.keys(committed)) if (!RUNTIME_KIND_ORDER.includes(kind)) drift.push({ type: 'changed-kind-mapping', key: kind })
  return drift
}

export function classifyReferenceNameSidecarDrift(fresh, committed) {
  const categories = []
  if (committed.provenanceSha256 !== fresh.provenanceSha256) categories.push('changed upstream provenance hash')
  if (committed.provenanceManifestIdentity !== fresh.provenanceManifestIdentity) categories.push('changed locale input manifest/table identity')
  if (committed.generatedModuleSha256 !== fresh.generatedModuleSha256) categories.push('changed generated hash')
  if (JSON.stringify(committed) !== JSON.stringify(fresh)) categories.push('sidecar metadata drift')
  return categories
}

export function validateReferenceNameSidecar(sidecar, expected) {
  if (sidecar.schemaVersion !== 2 || sidecar.trackerLocale !== expected.trackerLocale ||
    sidecar.bethesdaToken !== expected.bethesdaToken || sidecar.encoding !== expected.encoding) {
    throw new Error('REFERENCE_NAME_SIDECAR_LOCALE_MISMATCH.')
  }
  if (!Array.isArray(sidecar.localizationInputs) || sidecar.localizationInputs.length === 0) {
    throw new Error('REFERENCE_NAME_SIDECAR_INPUTS_INVALID.')
  }
  for (const input of sidecar.localizationInputs) {
    const keys = ['plugin', 'tableType', 'memberName', 'size', 'sha256']
    if (keys.some((key) => input[key] === undefined) || Object.keys(input).some((key) => !keys.includes(key)) ||
      typeof input.memberName !== 'string' || /^[A-Za-z]:[\\/]|^\//.test(input.memberName) ||
      !/^[0-9A-F]{64}$/.test(input.sha256)) throw new Error('REFERENCE_NAME_SIDECAR_INPUTS_INVALID.')
  }
  if (sidecar.compositionPolicy?.assembly !== 'precomposed-at-build-time' ||
    sidecar.separatorPolicy?.value !== 'U+0020' || sidecar.separatorPolicy?.literal !== ' ') {
    throw new Error('REFERENCE_NAME_SIDECAR_COMPOSITION_INVALID.')
  }
  if (expected.toolVersion && sidecar.generator?.toolVersion !== expected.toolVersion) {
    throw new Error('REFERENCE_NAME_SIDECAR_TOOL_VERSION_MISMATCH.')
  }
}
