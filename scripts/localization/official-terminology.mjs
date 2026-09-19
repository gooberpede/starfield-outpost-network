import { parse } from 'csv-parse/sync'

export const OFFICIAL_TERMINOLOGY_SCHEMA_VERSION = 2

export const OFFICIAL_TERMINOLOGY_COLUMNS = [
  'EvidenceId', 'TermId', 'CanonicalEnglish', 'EvidenceKind', 'SourceUse',
  'SourcePlugin', 'RecordSignature', 'RecordFormID', 'FieldPath',
  'NameSourcePlugin', 'StringTable', 'StringID', 'Context', 'ContextNotes',
  'Confidence', 'Notes',
]
export const OFFICIAL_TERMINOLOGY_VALUE_COLUMNS = [
  'EvidenceId', 'Locale', 'OfficialValue', 'RecommendedDefault',
]

const evidenceKinds = new Set(['standalone', 'contextual', 'absence'])
const sourceUses = new Set(['canonical-content', 'terminology-evidence-only'])
const stringTables = new Set(['strings', 'dlstrings', 'ilstrings'])
const qualifiedId = /^[0-9A-F]{8}$/

export function parseOfficialTerminologyCsv(source) {
  return parse(source, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  })
}

export function parseOfficialTerminologyValuesCsv(source) {
  return parseOfficialTerminologyCsv(source)
}

function assertStringArray(value, name) {
  if (!Array.isArray(value) || value.length === 0 ||
    value.some((item) => typeof item !== 'string' || item.length === 0) ||
    new Set(value).size !== value.length) {
    throw new Error(`${name} must be a non-empty array of unique plugin filenames.`)
  }
}

/** Validates committed evidence without requiring installed game files. */
export function validateOfficialTerminology(policy, rows) {
  if (policy.schemaVersion !== OFFICIAL_TERMINOLOGY_SCHEMA_VERSION) {
    throw new Error(`Unsupported official terminology schema version: ${policy.schemaVersion}`)
  }
  assertStringArray(policy.canonicalContentPlugins, 'canonicalContentPlugins')
  assertStringArray(policy.terminologyEvidencePlugins, 'terminologyEvidencePlugins')

  const canonicalPlugins = new Set(policy.canonicalContentPlugins)
  const evidencePlugins = new Set(policy.terminologyEvidencePlugins)
  for (const plugin of canonicalPlugins) {
    if (!evidencePlugins.has(plugin)) {
      throw new Error(`Canonical content plugin ${plugin} is missing from terminologyEvidencePlugins.`)
    }
  }
  if (canonicalPlugins.size === evidencePlugins.size) {
    throw new Error('Terminology evidence plugins must be distinct from canonical content plugins.')
  }

  const evidenceIds = new Set()
  for (const [index, row] of rows.entries()) {
    const location = `official terminology row ${index + 2}`
    if (JSON.stringify(Object.keys(row)) !== JSON.stringify(OFFICIAL_TERMINOLOGY_COLUMNS)) {
      throw new Error(`${location} does not match the required column schema.`)
    }
    if (!row.EvidenceId || evidenceIds.has(row.EvidenceId)) {
      throw new Error(`${location} has an empty or duplicate EvidenceId: ${row.EvidenceId}`)
    }
    evidenceIds.add(row.EvidenceId)
    if (!row.TermId) throw new Error(`${location} has an empty TermId.`)
    if (!evidenceKinds.has(row.EvidenceKind)) {
      throw new Error(`${location} has unsupported EvidenceKind ${row.EvidenceKind}.`)
    }
    if (!sourceUses.has(row.SourceUse)) {
      throw new Error(`${location} has unsupported SourceUse ${row.SourceUse}.`)
    }
    if (!evidencePlugins.has(row.SourcePlugin)) {
      throw new Error(`${location} uses unsupported plugin ${row.SourcePlugin}.`)
    }

    const isCanonicalPlugin = canonicalPlugins.has(row.SourcePlugin)
    if (isCanonicalPlugin !== (row.SourceUse === 'canonical-content')) {
      throw new Error(`${location} has SourceUse ${row.SourceUse}, incompatible with ${row.SourcePlugin}.`)
    }
    if (row.SourcePlugin === 'SFBGS050.esm' && row.SourceUse === 'canonical-content') {
      throw new Error(`${location} must not treat SFBGS050.esm as canonical content.`)
    }

    if (row.RecordFormID && !qualifiedId.test(row.RecordFormID)) {
      throw new Error(`${location} has invalid RecordFormID ${row.RecordFormID}.`)
    }
    if (row.StringID && !qualifiedId.test(row.StringID)) {
      throw new Error(`${location} has invalid StringID ${row.StringID}.`)
    }
    const recordFields = [row.RecordSignature, row.RecordFormID, row.FieldPath]
    if (recordFields.some(Boolean) && !recordFields.every(Boolean)) {
      throw new Error(`${location} has a partially qualified record identity.`)
    }
    if (row.EvidenceKind === 'absence') {
      if (recordFields.some(Boolean) || row.NameSourcePlugin || row.StringTable ||
        row.StringID) {
        throw new Error(`${location} must keep unsupported source identities empty.`)
      }
      if (!row.Context || !row.Notes.toLowerCase().includes('retired')) {
        throw new Error(`${location} must explicitly document its retired absence status.`)
      }
    } else {
      if (!stringTables.has(row.StringTable)) {
        throw new Error(`${location} has invalid StringTable ${row.StringTable}.`)
      }
      if (!evidencePlugins.has(row.NameSourcePlugin)) {
        throw new Error(`${location} has unsupported NameSourcePlugin ${row.NameSourcePlugin}.`)
      }
      if (!row.StringID) throw new Error(`${location} is missing its string-table identity.`)
    }
  }

  return {
    rows: rows.length,
    terms: new Set(rows.map(({ TermId }) => TermId)).size,
  }
}

export function validateOfficialTerminologyValues(evidenceRows, valueRows, locale) {
  const evidence = new Map(evidenceRows.map((row) => [row.EvidenceId, row]))
  const seen = new Set()
  for (const [index, row] of valueRows.entries()) {
    const location = `${locale} terminology value row ${index + 2}`
    if (JSON.stringify(Object.keys(row)) !== JSON.stringify(OFFICIAL_TERMINOLOGY_VALUE_COLUMNS)) {
      throw new Error(`${location} does not match the required value column schema.`)
    }
    if (row.Locale !== locale) throw new Error(`${location} has locale ${row.Locale}.`)
    if (!row.EvidenceId || seen.has(row.EvidenceId)) throw new Error(`${location} has an empty or duplicate EvidenceId: ${row.EvidenceId}`)
    const evidenceRow = evidence.get(row.EvidenceId)
    if (!evidenceRow) throw new Error(`${location} references unknown EvidenceId ${row.EvidenceId}.`)
    if (evidenceRow.EvidenceKind === 'absence') {
      if (row.OfficialValue || row.RecommendedDefault) throw new Error(`${location} must keep absence values empty.`)
    } else if (!row.OfficialValue) throw new Error(`${location} is missing OfficialValue.`)
    seen.add(row.EvidenceId)
  }
  const missing = [...evidence.keys()].filter((id) => !seen.has(id))
  if (missing.length) throw new Error(`${locale} terminology values are missing EvidenceId ${missing[0]}.`)
  const expectedOrder = evidenceRows.map(({ EvidenceId }) => EvidenceId)
  const actualOrder = valueRows.map(({ EvidenceId }) => EvidenceId)
  if (JSON.stringify(actualOrder) !== JSON.stringify(expectedOrder)) {
    throw new Error(`${locale} terminology values must follow deterministic evidence order.`)
  }
  return { locale, values: valueRows.length }
}
