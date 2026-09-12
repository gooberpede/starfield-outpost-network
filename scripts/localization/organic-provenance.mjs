/**
 * Purpose: Classify canonical organic species and resolve Parcel C5 name provenance.
 * Architecture: The tracker defines identity; narrow record readers reproduce the exporter precedence.
 * Change this file when: the production organic exporter changes its direct/CCT/template name routes.
 */
import { parse } from 'csv-parse/sync'

import { extractLocalizedId, SEMANTIC_PATHS } from './localized-field-map.mjs'
import { formatHex32, PluginReaderError } from './starfield-plugin-reader.mjs'
import { verifyEnglish } from './localized-name-provenance.mjs'
import { OFFICIAL_SYSTEM_PLUGINS } from './star-system-provenance.mjs'

export const ORGANIC_CLASSIFICATIONS = Object.freeze({
  DIRECT_FLORA: 'RESOLVED_DIRECT_FLORA',
  DIRECT_FAUNA: 'RESOLVED_DIRECT_FAUNA',
  TEMPLATE_FAUNA: 'RESOLVED_TEMPLATE_FAUNA',
  COMPOSED_FAUNA: 'DEFERRED_COMPOSED_FAUNA_C6',
  RESOLVED_COMPOSED_FAUNA: 'RESOLVED_COMPOSED_FAUNA_C6',
  UNRESOLVED: 'UNRESOLVED',
})

export const C6_HANDOFF_HEADERS = [
  'EntityKind', 'EntityId', 'SpeciesSourcePlugin', 'SpeciesFormID', 'SpeciesEditorID',
  'CanonicalEnglish', 'Classification', 'Detail', 'ObjectTemplateCombinationCount', 'ResolvedCombinationName',
]

export const TEMPLATE_LINEAGE_HEADERS = [
  'EntityKind', 'EntityId', 'CanonicalSourcePlugin', 'CanonicalNPCFormID',
  'LeveledListSourcePlugin', 'LeveledListFormID', 'LeveledNPCSourcePlugin', 'LeveledNPCFormID',
  'EncounterNPCSourcePlugin', 'EncounterNPCFormID', 'CanonicalEnglish',
]

function sourceError(message) {
  throw new Error(`CANONICAL_SOURCE_ERROR: ${message}`)
}

/** Deduplicate Planet x Biome occurrences by the exporter's stable species identity. */
export function buildC5Targets(csv) {
  const occurrenceRows = parse(csv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  const targets = new Map()
  const occurrenceCounts = { flora: 0, fauna: 0 }
  const sourcePluginCounts = Object.fromEntries(OFFICIAL_SYSTEM_PLUGINS.map((plugin) => [plugin, 0]))
  for (const row of occurrenceRows) {
    const type = row.SpeciesType?.toLowerCase()
    if (!['flora', 'fauna'].includes(type)) sourceError(`unsupported organic species type ${JSON.stringify(row.SpeciesType)}.`)
    for (const field of ['SpeciesFormID', 'SpeciesEditorID', 'SpeciesDisplayName', 'SpeciesSourceFile']) {
      if (!row[field]) sourceError(`missing ${field} on organic species ${row.SpeciesFormID || '<unknown>'}.`)
    }
    if (!/^[0-9A-F]{8}$/.test(row.SpeciesFormID)) sourceError(`invalid species FormID ${JSON.stringify(row.SpeciesFormID)}.`)
    if (!OFFICIAL_SYSTEM_PLUGINS.includes(row.SpeciesSourceFile)) sourceError(`unsupported species source plugin ${JSON.stringify(row.SpeciesSourceFile)}.`)
    occurrenceCounts[type] += 1
    const item = {
      entityKind: type,
      entityId: row.SpeciesFormID,
      canonicalEnglish: row.SpeciesDisplayName,
      recordSourcePlugin: row.SpeciesSourceFile,
      recordFormId: row.SpeciesFormID,
      recordSignature: type === 'flora' ? 'FLOR' : 'NPC_',
      semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL,
      speciesEditorId: row.SpeciesEditorID,
    }
    const previous = targets.get(`${type}:${row.SpeciesFormID}`)
    if (previous && JSON.stringify(previous) !== JSON.stringify(item)) sourceError(`conflicting species identity ${type}:${row.SpeciesFormID}.`)
    if (!previous) sourcePluginCounts[row.SpeciesSourceFile] += 1
    targets.set(`${type}:${row.SpeciesFormID}`, item)
  }
  const result = [...targets.values()].sort((a, b) => a.entityKind.localeCompare(b.entityKind) || a.entityId.localeCompare(b.entityId))
  const uniqueFlora = result.filter((item) => item.entityKind === 'flora').length
  const uniqueFauna = result.length - uniqueFlora
  return {
    targets: result,
    statistics: {
      organicOccurrenceRows: occurrenceRows.length,
      uniqueFlora,
      uniqueFauna,
      uniqueOrganicSpecies: result.length,
      duplicateOrganicOccurrencesCollapsed: occurrenceRows.length - result.length,
      floraDuplicateOccurrencesCollapsed: occurrenceCounts.flora - uniqueFlora,
      faunaDuplicateOccurrencesCollapsed: occurrenceCounts.fauna - uniqueFauna,
      organicSourcePluginCounts: sourcePluginCounts,
    },
  }
}

function oneSubrecord(record, signature) {
  const matches = record.subrecords.filter((item) => item.signature === signature)
  if (matches.length > 1) throw new PluginReaderError('RELATIONSHIP_AMBIGUOUS', `${record.signature}.${signature} occurred more than once.`, { formId: record.formIdHex })
  return matches[0]
}

function linkedId(record, signature) {
  const field = oneSubrecord(record, signature)
  if (!field) return null
  if (field.data.length !== 4) throw new PluginReaderError('RELATIONSHIP_INVALID', `${record.signature}.${signature} is not a four-byte FormID.`, { formId: record.formIdHex })
  return formatHex32(field.data.readUInt32LE(0))
}

export function extractKeywordIds(record) {
  const field = oneSubrecord(record, 'KWDA')
  if (!field) return []
  if (field.data.length % 4 !== 0) throw new PluginReaderError('RELATIONSHIP_INVALID', `${record.signature}.KWDA is not a FormID array.`, { formId: record.formIdHex })
  const ids = []
  for (let offset = 0; offset < field.data.length; offset += 4) ids.push(formatHex32(field.data.readUInt32LE(offset)))
  return ids
}

/** Starfield OBTS stores a fixed 18-byte header followed by seven-byte OMOD include entries. */
export function extractObjectTemplateCombinations(record) {
  return record.subrecords.filter((item) => item.signature === 'OBTS').map((field) => {
    if (field.data.length < 18) throw new PluginReaderError('RELATIONSHIP_INVALID', 'NPC_.OBTS is shorter than its audited header.', { formId: record.formIdHex })
    const count = field.data.readUInt32LE(0)
    if (field.data.length !== 18 + count * 7) throw new PluginReaderError('RELATIONSHIP_INVALID', 'NPC_.OBTS include count does not match its payload.', { formId: record.formIdHex })
    const ids = []
    for (let index = 0; index < count; index += 1) ids.push(formatHex32(field.data.readUInt32LE(18 + index * 7)))
    return ids
  })
}

/** Decode only TESNPC_InstanceData includes and NKEY (NPC - Keyword) properties. */
export function extractOmodNamingRelationships(record) {
  const field = oneSubrecord(record, 'DATA')
  if (!field || field.data.length < 48) return { includes: [], keywordIds: [] }
  const data = field.data
  const includeCount = data.readUInt32LE(0)
  const propertyCount = data.readUInt32LE(4)
  const nameLength = data.readUInt32LE(10)
  const instanceName = data.subarray(14, 14 + nameLength).toString('utf8').replace(/\0+$/, '')
  if (instanceName !== 'TESNPC_InstanceData') return { includes: [], keywordIds: [] }
  const expected = 48 + includeCount * 7 + propertyCount * 24
  if (data.length !== expected) throw new PluginReaderError('RELATIONSHIP_INVALID', 'OMOD TESNPC_InstanceData counts do not match its payload.', { formId: record.formIdHex })
  const includes = []
  for (let index = 0; index < includeCount; index += 1) includes.push(formatHex32(data.readUInt32LE(48 + index * 7)))
  const keywordIds = []
  const propertyStart = 48 + includeCount * 7
  for (let index = 0; index < propertyCount; index += 1) {
    const offset = propertyStart + index * 24
    if (data.toString('ascii', offset + 8, offset + 12) === 'NKEY') keywordIds.push(formatHex32(data.readUInt32LE(offset + 12)))
  }
  return { includes, keywordIds }
}

/** INNR rule sets are delimited by VNAM counts; WNAM is localized rule text. */
export function extractInnrRuleSets(record) {
  const sets = []
  let index = record.subrecords.findIndex((item) => item.signature === 'VNAM')
  while (index >= 0 && index < record.subrecords.length) {
    const marker = record.subrecords[index]
    if (marker.data.length !== 4) throw new PluginReaderError('RELATIONSHIP_INVALID', 'INNR.VNAM has an unexpected size.', { formId: record.formIdHex })
    const count = marker.data.readUInt32LE(0)
    const rules = []
    index += 1
    for (let ruleIndex = 0; ruleIndex < count; ruleIndex += 1) {
      const text = record.subrecords[index++]
      const size = record.subrecords[index++]
      const keywords = record.subrecords[index++]
      const priority = record.subrecords[index++]
      if (text?.signature !== 'WNAM' || size?.signature !== 'KSIZ' || keywords?.signature !== 'KWDA' || priority?.signature !== 'YNAM' ||
          text.data.length !== 4 || size.data.length !== 4 || priority.data.length !== 2 || keywords.data.length !== size.data.readUInt32LE(0) * 4) {
        throw new PluginReaderError('RELATIONSHIP_INVALID', 'INNR naming rule has an unsupported shape.', { formId: record.formIdHex, ruleIndex })
      }
      const keywordIds = []
      for (let offset = 0; offset < keywords.data.length; offset += 4) keywordIds.push(formatHex32(keywords.data.readUInt32LE(offset)))
      rules.push({ ruleIndex, stringId: text.data.readUInt32LE(0), keywordIds, ynam: priority.data.readUInt16LE(0) })
    }
    sets.push(rules)
    const next = record.subrecords.findIndex((item, candidate) => candidate >= index && item.signature === 'VNAM')
    if (next < 0) break
    index = next
  }
  return sets
}

export function selectInnrRule(rules, keywordIds) {
  const available = new Set(keywordIds)
  return rules.filter((rule) => rule.keywordIds.length > 0 && rule.keywordIds.every((id) => available.has(id)))
    .sort((a, b) => b.keywordIds.length - a.keywordIds.length || b.ynam - a.ynam || a.ruleIndex - b.ruleIndex)[0] ?? null
}

function localizedRuleText(rule, strings) {
  if (!rule || rule.stringId === 0) return ''
  if (!strings) throw new PluginReaderError('MISSING_LOCALIZATION_INPUT', 'The Starfield.esm strings table required for CCT classification was not supplied.')
  const value = strings.get(rule.stringId)
  if (value === undefined) throw new PluginReaderError('MISSING_STRING_ID', `INNR WNAM string ${formatHex32(rule.stringId)} is missing.`)
  return value
}

function collectOmodKeywords(formId, records, keywordIds, visited) {
  if (visited.has(formId)) return
  visited.add(formId)
  const provider = records.get(`OMOD:${formId}`)
  if (!provider) return
  const relationships = extractOmodNamingRelationships(provider.record)
  for (const id of relationships.keywordIds) keywordIds.add(id)
  for (const included of relationships.includes) collectOmodKeywords(included, records, keywordIds, visited)
}

export function resolveCctClassification(record, records, namingRules, strings) {
  const combinations = extractObjectTemplateCombinations(record)
  const names = new Set()
  for (const omodIds of combinations) {
    const keywords = new Set(extractKeywordIds(record))
    const visited = new Set()
    for (const id of omodIds) collectOmodKeywords(id, records, keywords, visited)
    const prefix = localizedRuleText(selectInnrRule(namingRules.prefix, keywords), strings)
    const species = localizedRuleText(selectInnrRule(namingRules.species, keywords), strings)
    const diet = localizedRuleText(selectInnrRule(namingRules.diet, keywords), strings)
    if (species) names.add([prefix, species, diet].filter(Boolean).join(' '))
  }
  if (names.size > 1) return { kind: 'ambiguous', combinationCount: combinations.length, names: [...names].sort() }
  if (names.size === 1) return { kind: 'composed', combinationCount: combinations.length, name: [...names][0] }
  return { kind: 'none', combinationCount: combinations.length }
}

function encounterCandidates(record, records, strings) {
  const leveledListId = linkedId(record, 'TPLT')
  if (!leveledListId) return { reasonCode: 'FAUNA_TEMPLATE_CHAIN_UNSUPPORTED', detail: 'Canonical NPC_ has no TPLT link.' }
  const leveledList = records.get(`LVLN:${leveledListId}`)
  if (!leveledList) return { reasonCode: 'FAUNA_TEMPLATE_CHAIN_UNSUPPORTED', detail: `TPLT ${leveledListId} is not an LVLN.` }
  const candidates = []
  for (const entry of leveledList.record.subrecords.filter((item) => item.signature === 'LVLO')) {
    if (entry.data.length !== 12) continue
    const leveledNpcId = formatHex32(entry.data.readUInt32LE(4))
    const leveledNpc = records.get(`NPC_:${leveledNpcId}`)
    if (!leveledNpc) continue
    let encounterNpcId
    try { encounterNpcId = linkedId(leveledNpc.record, 'TPLT') } catch { continue }
    const encounterNpc = encounterNpcId ? records.get(`NPC_:${encounterNpcId}`) : null
    if (!encounterNpc) continue
    let localized
    try { localized = extractLocalizedId(encounterNpc.record, SEMANTIC_PATHS.TOP_LEVEL_FULL) } catch { continue }
    const name = strings.get(`${encounterNpc.plugin}:${localized.stringTable}`)?.get(localized.id)
    if (name) candidates.push({ name, localized, leveledList, leveledNpc, encounterNpc })
  }
  if (candidates.length === 0) return { reasonCode: 'FAUNA_TEMPLATE_NAME_NOT_FOUND', detail: 'No usable leveled entry reached an encounter NPC_.FULL.' }
  const names = [...new Set(candidates.map((item) => item.name))]
  if (names.length > 1) return { reasonCode: 'FAUNA_TEMPLATE_NAME_AMBIGUOUS', detail: `Encounter templates resolve to ${names.sort().join(' | ')}.` }
  return { candidate: candidates[0], usableEntryCount: candidates.length }
}

function unresolved(item, reasonCode, detail) {
  return {
    EntityKind: item.entityKind, EntityId: item.entityId, RecordSourcePlugin: item.recordSourcePlugin,
    RecordFormID: item.recordFormId, RecordSignature: item.recordSignature,
    CanonicalEnglish: item.canonicalEnglish, ReasonCode: reasonCode, Detail: detail,
  }
}

function provenanceRow(item, provider, localized, displayNameSourceKind = 'direct') {
  return {
    EntityKind: item.entityKind, EntityId: item.entityId, DisplayNameSourceKind: displayNameSourceKind,
    ComponentOrder: '0', ComponentRole: 'complete', RecordSourcePlugin: provider.plugin,
    RecordFormID: provider.record.formIdHex, RecordSignature: provider.record.signature,
    NameFieldPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, NameSourcePlugin: provider.plugin,
    NameStringTable: localized.stringTable, NameStringID: localized.idHex, CanonicalEnglish: item.canonicalEnglish,
  }
}

export function generateOrganicProvenance(targets, canonicalRecords, relationshipRecords, tables, namingRules, normalizationPolicy = new Map()) {
  const provenance = []
  const unresolvedRows = []
  const classifications = []
  const handoff = []
  const lineage = []
  const normalizations = []

  const verify = (item, row) => {
    const result = verifyEnglish(row, tables.get(`${row.NameSourcePlugin}:${row.NameStringTable}`), normalizationPolicy)
    if (result.reasonCode) {
      unresolvedRows.push(unresolved(item, result.reasonCode, `Extracted ${row.NameStringTable}:${row.NameStringID}; ${result.detail}`))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: result.reasonCode })
      return false
    }
    provenance.push(row)
    if (result.classification) normalizations.push({
      EntityKind: row.EntityKind, EntityId: row.EntityId, ExpectedSourceEnglish: row.CanonicalEnglish,
      ExpectedLocalizedEnglish: result.value, ReasonCode: result.classification, Detail: result.detail ?? '',
    })
    return true
  }

  for (const item of targets) {
    const provider = canonicalRecords.get(`${item.recordSourcePlugin}:${item.recordSignature}:${item.recordFormId}`)
    if (!provider) {
      unresolvedRows.push(unresolved(item, 'UNSUPPORTED_RECORD_SHAPE', 'Exact canonical species record was not available.'))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: 'UNSUPPORTED_RECORD_SHAPE' })
      continue
    }
    let direct = null
    try { direct = extractLocalizedId(provider.record, SEMANTIC_PATHS.TOP_LEVEL_FULL) } catch (error) {
      if (error.code !== 'SEMANTIC_FIELD_NOT_FOUND') {
        unresolvedRows.push(unresolved(item, 'UNSUPPORTED_RECORD_SHAPE', error.message))
        classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: 'UNSUPPORTED_RECORD_SHAPE' })
        continue
      }
    }
    if (direct) {
      const classification = item.entityKind === 'flora' ? ORGANIC_CLASSIFICATIONS.DIRECT_FLORA : ORGANIC_CLASSIFICATIONS.DIRECT_FAUNA
      if (verify(item, provenanceRow(item, provider, direct))) classifications.push({ item, classification })
      continue
    }
    if (item.entityKind === 'flora') {
      unresolvedRows.push(unresolved(item, 'ORGANIC_DIRECT_FULL_NOT_FOUND', 'Canonical FLOR has no top-level FULL.'))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: 'ORGANIC_DIRECT_FULL_NOT_FOUND' })
      continue
    }

    let cct
    try { cct = resolveCctClassification(provider.record, relationshipRecords, namingRules, tables.get('Starfield.esm:strings')) } catch (error) {
      const reasonCode = ['MISSING_LOCALIZATION_INPUT', 'MISSING_STRING_ID'].includes(error.code)
        ? error.code
        : 'FAUNA_CCT_CHAIN_UNSUPPORTED'
      unresolvedRows.push(unresolved(item, reasonCode, error.message))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode })
      continue
    }
    if (cct.kind === 'ambiguous') {
      unresolvedRows.push(unresolved(item, 'FAUNA_CCT_NAME_AMBIGUOUS', `Object Template combinations resolve to ${cct.names.join(' | ')}.`))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: 'FAUNA_CCT_NAME_AMBIGUOUS' })
      continue
    }
    if (cct.kind === 'composed') {
      if (cct.name !== item.canonicalEnglish) {
        unresolvedRows.push(unresolved(item, 'CANONICAL_SOURCE_ERROR', `CCT composition is ${JSON.stringify(cct.name)}; canonical English is ${JSON.stringify(item.canonicalEnglish)}.`))
        classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: 'CANONICAL_SOURCE_ERROR' })
        continue
      }
      const detail = `CCT composition resolves to ${cct.name}; localized component provenance is deferred to Parcel C6.`
      unresolvedRows.push(unresolved(item, 'DEFERRED_COMPOSED_FAUNA_C6', detail))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.COMPOSED_FAUNA })
      handoff.push({
        EntityKind: item.entityKind, EntityId: item.entityId, SpeciesSourcePlugin: item.recordSourcePlugin,
        SpeciesFormID: item.recordFormId, SpeciesEditorID: item.speciesEditorId, CanonicalEnglish: item.canonicalEnglish,
        Classification: ORGANIC_CLASSIFICATIONS.COMPOSED_FAUNA, Detail: detail,
        ObjectTemplateCombinationCount: String(cct.combinationCount), ResolvedCombinationName: cct.name,
      })
      continue
    }

    const fallback = encounterCandidates(provider.record, relationshipRecords, tables)
    if (!fallback.candidate) {
      unresolvedRows.push(unresolved(item, fallback.reasonCode, fallback.detail))
      classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.UNRESOLVED, reasonCode: fallback.reasonCode })
      continue
    }
    const candidate = fallback.candidate
    const row = provenanceRow(item, candidate.encounterNpc, candidate.localized, 'template')
    if (!verify(item, row)) continue
    classifications.push({ item, classification: ORGANIC_CLASSIFICATIONS.TEMPLATE_FAUNA })
    lineage.push({
      EntityKind: item.entityKind, EntityId: item.entityId, CanonicalSourcePlugin: item.recordSourcePlugin,
      CanonicalNPCFormID: item.recordFormId, LeveledListSourcePlugin: candidate.leveledList.plugin,
      LeveledListFormID: candidate.leveledList.record.formIdHex, LeveledNPCSourcePlugin: candidate.leveledNpc.plugin,
      LeveledNPCFormID: candidate.leveledNpc.record.formIdHex, EncounterNPCSourcePlugin: candidate.encounterNpc.plugin,
      EncounterNPCFormID: candidate.encounterNpc.record.formIdHex, CanonicalEnglish: item.canonicalEnglish,
    })
  }

  const sort = (a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId)
  provenance.sort((a, b) => sort(a, b) || Number(a.ComponentOrder) - Number(b.ComponentOrder))
  unresolvedRows.sort((a, b) => sort(a, b) || a.ReasonCode.localeCompare(b.ReasonCode))
  handoff.sort(sort)
  lineage.sort(sort)
  if (provenance.length + unresolvedRows.length !== targets.length || classifications.length !== targets.length) throw new Error('C5 coverage invariant failed.')
  return { provenance, unresolved: unresolvedRows, classifications, handoff, lineage, normalizations }
}

export function buildNamingRules(relationshipRecords) {
  const byEditorId = new Map()
  for (const provider of relationshipRecords.values()) {
    if (provider.record.signature !== 'INNR') continue
    const edid = provider.record.subrecords.find((item) => item.signature === 'EDID')?.data.toString('utf8').replace(/\0+$/, '')
    if (edid) byEditorId.set(edid, provider.record)
  }
  const prefix = byEditorId.get('dn_CCTPrefixes')
  const suffix = byEditorId.get('dn_CCTSuffixes')
  if (!prefix || !suffix) throw new Error('Required CCT naming INNR records dn_CCTPrefixes/dn_CCTSuffixes were not found.')
  const prefixSets = extractInnrRuleSets(prefix)
  const suffixSets = extractInnrRuleSets(suffix)
  return { prefix: prefixSets[0] ?? [], species: suffixSets[0] ?? [], diet: suffixSets[1] ?? [] }
}

function parseArtifact(csv, headers, name) {
  const data = parse(csv, { bom: true, skip_empty_lines: true, trim: true })
  const actualHeaders = data.shift() ?? []
  if (JSON.stringify(actualHeaders) !== JSON.stringify(headers)) throw new Error(`${name} has unexpected headers.`)
  return data.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`${name} row ${index + 2} has an unexpected column count.`)
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]))
  })
}

/** Repository-only validation locks canonical identity and checked-in C5 artifact consistency. */
export function validateCommittedOrganicArtifacts(provenance, unresolved, handoffCsv, lineageCsv, targets) {
  const targetByKey = new Map(targets.map((item) => [`${item.entityKind}:${item.entityId}`, item]))
  const organicProvenance = provenance.filter((row) => ['flora', 'fauna'].includes(row.EntityKind))
  const organicUnresolved = unresolved.filter((row) => ['flora', 'fauna'].includes(row.EntityKind))
  const handoff = parseArtifact(handoffCsv, C6_HANDOFF_HEADERS, 'localized-name-provenance-c6-fauna.csv')
  const lineage = parseArtifact(lineageCsv, TEMPLATE_LINEAGE_HEADERS, 'localized-name-provenance-c5-fauna-lineage.csv')
  const deferred = new Set(organicUnresolved.filter((row) => row.ReasonCode === 'DEFERRED_COMPOSED_FAUNA_C6').map((row) => `${row.EntityKind}:${row.EntityId}`))
  const composed = new Set(organicProvenance.filter((row) => row.DisplayNameSourceKind === 'composed').map((row) => `${row.EntityKind}:${row.EntityId}`))
  const template = new Map(organicProvenance.filter((row) => row.DisplayNameSourceKind === 'template').map((row) => [`${row.EntityKind}:${row.EntityId}`, row]))

  const resolvedC6 = handoff.length > 0 && handoff.every((row) => row.Classification === ORGANIC_CLASSIFICATIONS.RESOLVED_COMPOSED_FAUNA)
  const expectedC6 = resolvedC6 ? composed : deferred
  if (handoff.length !== expectedC6.size || (resolvedC6 && deferred.size !== 0)) throw new Error('C6 fauna handoff count does not match its composed provenance state.')
  const seenHandoff = new Set()
  for (const row of handoff) {
    const key = `${row.EntityKind}:${row.EntityId}`
    const target = targetByKey.get(key)
    if (!target || !expectedC6.has(key) || seenHandoff.has(key)) throw new Error(`Invalid C6 fauna handoff identity ${key}.`)
    seenHandoff.add(key)
    for (const [field, value] of [
      ['SpeciesSourcePlugin', target.recordSourcePlugin], ['SpeciesFormID', target.recordFormId],
      ['SpeciesEditorID', target.speciesEditorId], ['CanonicalEnglish', target.canonicalEnglish],
      ['Classification', resolvedC6 ? ORGANIC_CLASSIFICATIONS.RESOLVED_COMPOSED_FAUNA : ORGANIC_CLASSIFICATIONS.COMPOSED_FAUNA],
    ]) if (row[field] !== value) throw new Error(`C6 fauna handoff ${key} field ${field} does not match its canonical target.`)
    if (!/^\d+$/.test(row.ObjectTemplateCombinationCount) || !row.ResolvedCombinationName) throw new Error(`C6 fauna handoff ${key} lacks audited CCT diagnostics.`)
  }

  if (lineage.length !== template.size) throw new Error('C5 fauna lineage count does not match template provenance rows.')
  const seenLineage = new Set()
  for (const row of lineage) {
    const key = `${row.EntityKind}:${row.EntityId}`
    const target = targetByKey.get(key)
    const provider = template.get(key)
    if (!target || !provider || seenLineage.has(key)) throw new Error(`Invalid C5 template lineage identity ${key}.`)
    seenLineage.add(key)
    for (const [field, value] of [
      ['CanonicalSourcePlugin', target.recordSourcePlugin], ['CanonicalNPCFormID', target.recordFormId],
      ['EncounterNPCSourcePlugin', provider.RecordSourcePlugin], ['EncounterNPCFormID', provider.RecordFormID],
      ['CanonicalEnglish', target.canonicalEnglish],
    ]) if (row[field] !== value) throw new Error(`C5 template lineage ${key} field ${field} is inconsistent.`)
    for (const field of ['LeveledListSourcePlugin', 'LeveledListFormID', 'LeveledNPCSourcePlugin', 'LeveledNPCFormID']) {
      if (!row[field]) throw new Error(`C5 template lineage ${key} is missing ${field}.`)
    }
  }
  return { handoff, lineage }
}
