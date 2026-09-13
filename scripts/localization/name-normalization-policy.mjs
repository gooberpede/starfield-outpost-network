/** Explicit, entity-scoped approvals for structural-source versus localized-display differences. */
import { parse } from 'csv-parse/sync'

export const NAME_NORMALIZATION_HEADERS = Object.freeze([
  'EntityKind', 'EntityId', 'ExpectedSourceEnglish', 'ExpectedLocalizedEnglish', 'ReasonCode', 'Detail',
])
export const NAME_NORMALIZATIONS = Object.freeze([
  Object.freeze({
    entityKind: 'system',
    entityId: '0',
    expectedSourceEnglish: 'SOL',
    expectedLocalizedEnglish: 'Sol',
    reasonCode: 'TRACKER_NORMALIZATION',
    detail: 'xEdit structural source preserves SOL; official localized STDT FULL is Sol.',
  }),
  Object.freeze({
    entityKind: 'body',
    entityId: '00223320',
    expectedSourceEnglish: '_TridentLuxuryLinesOrbital',
    expectedLocalizedEnglish: 'Trident Luxury Liners Staryard',
    reasonCode: 'TRACKER_NORMALIZATION',
    detail: 'Canonical PNDT structural text is an internal orbital label; official localized PNDT FULL is Trident Luxury Liners Staryard.',
  }),
  Object.freeze({
    entityKind: 'resource',
    entityId: 'gastronomic-delight',
    expectedSourceEnglish: 'Gastronomic Delight',
    expectedLocalizedEnglish: 'Gastro Delight',
    reasonCode: 'TRACKER_NORMALIZATION',
    detail: 'Tracker display override preserves Gastronomic Delight; official localized IRES FULL is Gastro Delight.',
  }),
])

export function buildNameNormalizationPolicy(entries = NAME_NORMALIZATIONS) {
  const policy = new Map()
  for (const entry of entries) {
    if (entry.reasonCode !== 'TRACKER_NORMALIZATION') throw new Error(`Invalid normalization reason for ${entry.entityKind}:${entry.entityId}.`)
    const key = `${entry.entityKind}:${entry.entityId}`
    if (policy.has(key)) throw new Error(`Duplicate name normalization ${key}.`)
    policy.set(key, {
      canonicalEnglish: entry.expectedSourceEnglish,
      officialEnglish: entry.expectedLocalizedEnglish,
      reasonCode: entry.reasonCode,
      detail: entry.detail,
    })
  }
  return policy
}

export function parseNameNormalizationsCsv(csv) {
  const data = parse(csv, { bom: true, skip_empty_lines: true, trim: true })
  const headers = data.shift() ?? []
  if (JSON.stringify(headers) !== JSON.stringify(NAME_NORMALIZATION_HEADERS)) throw new Error('localized-name-normalizations.csv has unexpected headers.')
  return data.map((values, index) => {
    if (values.length !== NAME_NORMALIZATION_HEADERS.length) throw new Error(`localized-name-normalizations.csv row ${index + 2} has an unexpected column count.`)
    return Object.fromEntries(NAME_NORMALIZATION_HEADERS.map((header, column) => [header, values[column]]))
  })
}

export function validateNameNormalizations(entries, targets, provenance, unresolved, normalizedRows) {
  const targetByKey = new Map(targets.map((target) => [`${target.entityKind}:${target.entityId}`, target]))
  const resolvedKeys = new Set(provenance.map((row) => `${row.EntityKind}:${row.EntityId}`))
  const unresolvedKeys = new Set(unresolved.map((row) => `${row.EntityKind}:${row.EntityId}`))
  buildNameNormalizationPolicy(entries)
  for (const entry of entries) {
    const key = `${entry.entityKind}:${entry.entityId}`
    const target = targetByKey.get(key)
    if (!target) throw new Error(`Name normalization ${key} does not identify a canonical target.`)
    if (target.canonicalEnglish !== entry.expectedSourceEnglish) {
      throw new Error(`Name normalization ${key} expected source ${JSON.stringify(entry.expectedSourceEnglish)} but canonical source is ${JSON.stringify(target.canonicalEnglish)}.`)
    }
    if (!resolvedKeys.has(key) || unresolvedKeys.has(key)) throw new Error(`Name normalization ${key} must identify one resolved provenance entity.`)
  }
  if (normalizedRows) {
    const expected = entries.map((entry) => ({
      EntityKind: entry.entityKind, EntityId: entry.entityId,
      ExpectedSourceEnglish: entry.expectedSourceEnglish,
      ExpectedLocalizedEnglish: entry.expectedLocalizedEnglish,
      ReasonCode: entry.reasonCode, Detail: entry.detail,
    }))
    if (JSON.stringify(normalizedRows) !== JSON.stringify(expected)) {
      throw new Error('Committed name-normalization metadata does not exactly match the approved entity-scoped policy.')
    }
  }
  return entries.length
}
