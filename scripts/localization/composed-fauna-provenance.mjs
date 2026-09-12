/**
 * Purpose: Resolve Parcel C6's bounded CCT-fauna population into component provenance.
 * Architecture: Canonical handoff IDs drive fixed-role INNR selection; localized text only verifies identity.
 * Change this file when: the audited CCT role mapping, selection rules, or C6 verification gates change.
 */
import { parse } from 'csv-parse/sync'

import {
  extractInnrRuleSets, extractKeywordIds, extractObjectTemplateCombinations,
  extractOmodNamingRelationships, selectInnrRule,
} from './organic-provenance.mjs'
import { formatHex32 } from './starfield-plugin-reader.mjs'

export const C6_RESOLVED_CLASSIFICATION = 'RESOLVED_COMPOSED_FAUNA_C6'
export const C6_PREVIEW_HEADERS = [
  'EntityKind', 'EntityId', 'CanonicalEnglish', 'JapanesePreview', 'ComponentShape', 'Separator',
]
export const C6_EXPECTED = Object.freeze({
  entities: 922,
  rows: 2179,
  shapes: Object.freeze({ 'prefix + species + diet': 335, 'species + diet': 320, 'prefix + species': 267 }),
  occurrences: Object.freeze({ prefix: 602, species: 922, diet: 655 }),
  unique: Object.freeze({ prefix: 8, species: 198, diet: 6, all: 212 }),
  ruleOrderTies: 8,
  recursiveOmodFauna: 35,
  shatteredSpaceEntities: 4,
})

const EXPECTED_RULE_ORDER_TIE_IDS = Object.freeze([
  '001A634D', '001A634E', '001AD18F', '001E4E98', '001E757E', '001E757F', '001EF5E8', '003AD1FA',
])
const REPRESENTATIVE_JAPANESE = Object.freeze({
  '000065E2': 'カラカタツムリ スカベンジャー',
  '0019BD96': '遊牧の ドードー スカベンジャー',
  '0019B89E': '狩猟する タスクフロッグ',
  '0008BDB7': '調教された クロノサウルス スカベンジャー',
  '00048A34': '頂点の オウムタカ',
  '0103D5DE': 'チューブクローラー スカベンジャー',
})

const ROLE_DEFINITIONS = Object.freeze([
  Object.freeze({ role: 'prefix', order: 0, editorId: 'dn_CCTPrefixes', ruleSetIndex: 0, required: false }),
  Object.freeze({ role: 'species', order: 1, editorId: 'dn_CCTSuffixes', ruleSetIndex: 0, required: true }),
  Object.freeze({ role: 'diet', order: 2, editorId: 'dn_CCTSuffixes', ruleSetIndex: 1, required: false }),
])

export class ComposedFaunaError extends Error {
  constructor(code, message, context = {}) {
    super(`${code}: ${message}`)
    this.name = 'ComposedFaunaError'
    this.code = code
    this.context = context
  }
}

function fail(code, message, context) {
  throw new ComposedFaunaError(code, message, context)
}

export function parseC6Targets(csv) {
  const targets = parse(csv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  const seen = new Set()
  for (const row of targets) {
    const key = `${row.EntityKind}:${row.EntityId}`
    if (row.EntityKind !== 'fauna' || !/^[0-9A-F]{8}$/.test(row.EntityId) || row.EntityId !== row.SpeciesFormID || seen.has(key)) {
      fail('C6_CANONICAL_SOURCE_ERROR', `Invalid or duplicate C6 target ${key}.`)
    }
    if (!row.SpeciesSourcePlugin || !row.SpeciesEditorID || !row.CanonicalEnglish) fail('C6_CANONICAL_SOURCE_ERROR', `Incomplete C6 target ${key}.`)
    seen.add(key)
  }
  return targets.sort((left, right) => left.EntityId.localeCompare(right.EntityId))
}

function editorId(record) {
  return record.subrecords.find((item) => item.signature === 'EDID')?.data.toString('utf8').replace(/\0+$/, '') ?? ''
}

/** Resolve the audited record/ruleset-to-role mapping without inferring roles from text. */
export function buildC6RoleRules(records, providerChains = new Map()) {
  const byEditorId = new Map()
  for (const provider of records.values()) {
    if (provider.record.signature === 'INNR') byEditorId.set(editorId(provider.record), provider)
  }
  return Object.fromEntries(ROLE_DEFINITIONS.map((definition) => {
    const provider = byEditorId.get(definition.editorId)
    if (!provider) fail('C6_INNR_RECORD_NOT_FOUND', `${definition.editorId} was not found.`)
    const chain = providerChains.get(`INNR:${provider.record.formIdHex}`) ?? [provider]
    if (chain.length !== 1) fail('C6_PROVIDER_AMBIGUOUS', `${definition.editorId} has ${chain.length} official providers.`)
    const rules = extractInnrRuleSets(provider.record)[definition.ruleSetIndex]
    if (!rules) fail('C6_INNR_RULE_UNSUPPORTED', `${definition.editorId} ruleset ${definition.ruleSetIndex} is missing.`)
    return [definition.role, { ...definition, provider, rules }]
  }))
}

/** Union native KWDA with NKEY properties from deterministic recursive OMOD traversal. */
export function collectEffectiveKeywordIds(record, topLevelOmodIds, records) {
  const keywords = new Set(extractKeywordIds(record))
  const visited = new Set()
  let recursiveIncludeUsed = false
  const visit = (formId, nested) => {
    if (visited.has(formId)) return
    visited.add(formId)
    const provider = records.get(`OMOD:${formId}`)
    if (!provider) fail('C6_INNR_RULE_UNSUPPORTED', `Naming OMOD ${formId} was not found.`)
    const relationships = extractOmodNamingRelationships(provider.record)
    for (const keywordId of relationships.keywordIds) keywords.add(keywordId)
    for (const included of relationships.includes) {
      recursiveIncludeUsed = true
      visit(included, true)
    }
    if (nested) recursiveIncludeUsed = true
  }
  for (const formId of topLevelOmodIds) visit(formId, false)
  return { keywordIds: [...keywords], visitedOmodIds: [...visited], recursiveIncludeUsed }
}

export function assembleComposedName(components) {
  return components.filter((component) => component?.value).sort((a, b) => a.order - b.order).map((component) => component.value).join(' ')
}

function sameRankMatches(rules, selected, keywordIds) {
  const available = new Set(keywordIds)
  return rules.filter((rule) => rule.keywordIds.length === selected.keywordIds.length && rule.ynam === selected.ynam &&
    rule.keywordIds.length > 0 && rule.keywordIds.every((id) => available.has(id)))
}

function resolveComponent(target, roleRules, keywordIds, tables, locale) {
  const rule = selectInnrRule(roleRules.rules, keywordIds)
  if (!rule) {
    if (roleRules.required) fail('C6_REQUIRED_SPECIES_COMPONENT_MISSING', `${target.EntityId} has no species rule.`)
    return null
  }
  if (rule.stringId === 0) fail('C6_WNAM_ZERO', `${target.EntityId} selected zero WNAM for ${roleRules.role}.`)
  const provider = roleRules.provider
  const table = tables.get(`${provider.plugin}:${locale}:strings`)
  if (!table) fail('C6_STRING_ID_MISSING', `${provider.plugin}:${locale}:strings was not supplied.`)
  const value = table.get(rule.stringId)
  if (value === undefined) fail('C6_STRING_ID_MISSING', `${provider.plugin}:${locale}:strings:${formatHex32(rule.stringId)} is missing.`)
  if (value !== value.trim()) fail('C6_INNR_RULE_UNSUPPORTED', `${target.EntityId} selected ${roleRules.role} text with separator whitespace.`)
  return {
    role: roleRules.role, order: roleRules.order, ruleSetIndex: roleRules.ruleSetIndex,
    ruleIndex: rule.ruleIndex, stringId: rule.stringId, value, provider,
    tiedByRank: sameRankMatches(roleRules.rules, rule, keywordIds).length > 1,
  }
}

function assertExpected(statistics) {
  const checks = [
    ['entities', statistics.entities, C6_EXPECTED.entities], ['rows', statistics.rows, C6_EXPECTED.rows],
    ['unique all', statistics.unique.all, C6_EXPECTED.unique.all],
    ['rule-order ties', statistics.ruleOrderTies, C6_EXPECTED.ruleOrderTies],
    ['recursive OMOD fauna', statistics.recursiveOmodFauna, C6_EXPECTED.recursiveOmodFauna],
    ['Shattered Space entities', statistics.shatteredSpaceEntities, C6_EXPECTED.shatteredSpaceEntities],
  ]
  for (const role of ['prefix', 'species', 'diet']) {
    checks.push([`${role} occurrences`, statistics.occurrences[role], C6_EXPECTED.occurrences[role]])
    checks.push([`${role} unique`, statistics.unique[role], C6_EXPECTED.unique[role]])
  }
  for (const [shape, expected] of Object.entries(C6_EXPECTED.shapes)) checks.push([shape, statistics.shapes[shape] ?? 0, expected])
  for (const [name, actual, expected] of checks) if (actual !== expected) fail('C6_AUDITED_INVARIANT_DRIFT', `${name} expected ${expected}, received ${actual}.`)
}

export function generateComposedFaunaProvenance(targets, canonicalRecords, relationshipRecords, providerChains, tables, options = {}) {
  const roleRules = buildC6RoleRules(relationshipRecords, providerChains)
  const provenance = []
  const preview = []
  const handoff = []
  const shapeCounts = {}
  const occurrences = { prefix: 0, species: 0, diet: 0 }
  const uniqueByRole = { prefix: new Set(), species: new Set(), diet: new Set() }
  const allUnique = new Set()
  const providerCounts = {}
  let exactEnglishMatches = 0
  let japaneseReconstructions = 0
  let ruleOrderTies = 0
  let recursiveOmodFauna = 0
  const ruleOrderTieIds = []

  for (const target of targets) {
    const npc = canonicalRecords.get(`${target.SpeciesSourcePlugin}:NPC_:${target.SpeciesFormID}`)
    if (!npc) fail('C6_NPC_NOT_FOUND', `${target.SpeciesSourcePlugin}:NPC_:${target.SpeciesFormID} was not found.`)
    const combinations = extractObjectTemplateCombinations(npc.record)
    if (!combinations.length) fail('C6_OBJECT_TEMPLATE_MISSING', `${target.EntityId} has no Object Template combination.`)
    const candidates = []
    let targetRecursive = false
    let targetTie = false
    for (const topLevelOmodIds of combinations) {
      const effective = collectEffectiveKeywordIds(npc.record, topLevelOmodIds, relationshipRecords)
      targetRecursive ||= effective.recursiveIncludeUsed
      const english = ROLE_DEFINITIONS.map(({ role }) => resolveComponent(target, roleRules[role], effective.keywordIds, tables, 'en'))
      const japanese = ROLE_DEFINITIONS.map(({ role }) => resolveComponent(target, roleRules[role], effective.keywordIds, tables, 'ja'))
      targetTie ||= english.some((component) => component?.tiedByRank)
      candidates.push({ english, japanese, englishName: assembleComposedName(english), japaneseName: assembleComposedName(japanese) })
    }
    const usefulNames = [...new Set(candidates.map((candidate) => candidate.englishName).filter(Boolean))]
    if (usefulNames.length > 1) fail('C6_MULTIPLE_FINAL_NAMES', `${target.EntityId} resolves to ${usefulNames.join(' | ')}.`)
    const candidate = candidates.find((item) => item.englishName === usefulNames[0])
    if (!candidate) fail('C6_REQUIRED_SPECIES_COMPONENT_MISSING', `${target.EntityId} has no useful combination.`)
    if (candidate.englishName !== target.CanonicalEnglish) {
      fail('C6_ENGLISH_RECONSTRUCTION_MISMATCH', `${target.EntityId} reconstructed ${JSON.stringify(candidate.englishName)} instead of ${JSON.stringify(target.CanonicalEnglish)}.`)
    }
    exactEnglishMatches += 1
    japaneseReconstructions += 1
    if (targetRecursive) recursiveOmodFauna += 1
    if (targetTie) { ruleOrderTies += 1; ruleOrderTieIds.push(target.EntityId) }
    const emitted = candidate.english.filter(Boolean)
    const shape = emitted.map((component) => component.role).join(' + ')
    shapeCounts[shape] = (shapeCounts[shape] ?? 0) + 1
    for (const component of emitted) {
      const qualified = `${component.provider.plugin}:strings:${formatHex32(component.stringId)}`
      occurrences[component.role] += 1
      uniqueByRole[component.role].add(qualified)
      allUnique.add(qualified)
      providerCounts[component.provider.plugin] = (providerCounts[component.provider.plugin] ?? 0) + 1
      provenance.push({
        EntityKind: 'fauna', EntityId: target.EntityId, DisplayNameSourceKind: 'composed',
        ComponentOrder: String(component.order), ComponentRole: component.role,
        RecordSourcePlugin: component.provider.plugin, RecordFormID: component.provider.record.formIdHex,
        RecordSignature: 'INNR',
        NameFieldPath: `Naming Rules[${component.ruleSetIndex}]/Names[${component.ruleIndex}]/WNAM - Text`,
        NameSourcePlugin: component.provider.plugin, NameStringTable: 'strings',
        NameStringID: formatHex32(component.stringId), CanonicalEnglish: component.value,
      })
    }
    preview.push({
      EntityKind: 'fauna', EntityId: target.EntityId, CanonicalEnglish: target.CanonicalEnglish,
      JapanesePreview: candidate.japaneseName, ComponentShape: shape, Separator: 'U+0020',
    })
    handoff.push({
      ...target, Classification: C6_RESOLVED_CLASSIFICATION,
      Detail: `CCT component provenance resolved and exact English/Japanese component lookup verified for ${target.CanonicalEnglish}.`,
      ResolvedCombinationName: candidate.englishName,
    })
  }
  const statistics = {
    entities: targets.length, rows: provenance.length, shapes: shapeCounts, occurrences,
    unique: { prefix: uniqueByRole.prefix.size, species: uniqueByRole.species.size, diet: uniqueByRole.diet.size, all: allUnique.size },
    providerCounts, exactEnglishMatches, japaneseReconstructions, ruleOrderTies, recursiveOmodFauna,
    ruleOrderTieIds,
    shatteredSpaceEntities: targets.filter((target) => target.SpeciesSourcePlugin === 'ShatteredSpace.esm').length,
  }
  if (options.enforceExpected !== false && JSON.stringify(ruleOrderTieIds.sort()) !== JSON.stringify(EXPECTED_RULE_ORDER_TIE_IDS)) {
    fail('C6_AUDITED_INVARIANT_DRIFT', `Rule-order tie identities changed: ${ruleOrderTieIds.join(', ')}.`)
  }
  if (options.enforceExpected !== false) assertExpected(statistics)
  return { provenance, preview, handoff, statistics }
}

export function validateCommittedC6Artifacts(provenance, unresolved, targetCsv, previewCsv) {
  const targets = parseC6Targets(targetCsv)
  const targetById = new Map(targets.map((target) => [target.EntityId, target]))
  const rows = provenance.filter((row) => row.EntityKind === 'fauna' && row.DisplayNameSourceKind === 'composed')
  const byEntity = new Map()
  for (const row of rows) {
    if (!targetById.has(row.EntityId)) fail('C6_CANONICAL_SOURCE_ERROR', `Unexpected composed fauna ${row.EntityId}.`)
    const pathMatch = row.NameFieldPath.match(/^Naming Rules\[(\d+)]\/Names\[(\d+)]\/WNAM - Text$/)
    if (row.RecordSignature !== 'INNR' || row.NameStringTable !== 'strings' || row.RecordSourcePlugin !== row.NameSourcePlugin ||
        !/^[0-9A-F]{8}$/.test(row.RecordFormID) || !/^[0-9A-F]{8}$/.test(row.NameStringID) ||
        !pathMatch) {
      fail('C6_CANONICAL_SOURCE_ERROR', `Invalid composed provenance structure for ${row.EntityId}.`)
    }
    const definition = ROLE_DEFINITIONS.find((item) => item.role === row.ComponentRole)
    if (!definition || row.ComponentOrder !== String(definition.order) || pathMatch[1] !== String(definition.ruleSetIndex) || !row.CanonicalEnglish) fail('C6_CANONICAL_SOURCE_ERROR', `Invalid semantic component slot for ${row.EntityId}.`)
    byEntity.set(row.EntityId, [...(byEntity.get(row.EntityId) ?? []), row])
  }
  for (const target of targets) {
    const entityRows = byEntity.get(target.EntityId) ?? []
    const roles = new Set(entityRows.map((row) => row.ComponentRole))
    if (!roles.has('species') || entityRows.length !== roles.size || ![2, 3].includes(entityRows.length)) fail('C6_REQUIRED_SPECIES_COMPONENT_MISSING', `${target.EntityId} has an invalid committed component shape.`)
    const reconstructed = entityRows.sort((left, right) => Number(left.ComponentOrder) - Number(right.ComponentOrder)).map((row) => row.CanonicalEnglish).join(' ')
    if (reconstructed !== target.CanonicalEnglish) fail('C6_ENGLISH_RECONSTRUCTION_MISMATCH', `${target.EntityId} committed components reconstruct ${JSON.stringify(reconstructed)}.`)
    if (unresolved.some((row) => row.EntityKind === 'fauna' && row.EntityId === target.EntityId)) fail('C6_CANONICAL_SOURCE_ERROR', `${target.EntityId} remains unresolved.`)
    if (target.Classification !== C6_RESOLVED_CLASSIFICATION) fail('C6_CANONICAL_SOURCE_ERROR', `${target.EntityId} remains in the deliberate-deferral state.`)
  }
  const previews = parse(previewCsv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  if (previews.length !== targets.length || previews.some((row) => !targetById.has(row.EntityId) || row.Separator !== 'U+0020' || !row.JapanesePreview)) {
    fail('C6_CANONICAL_SOURCE_ERROR', 'Japanese preview does not cover the C6 population exactly.')
  }
  const previewById = new Map(previews.map((row) => [row.EntityId, row.JapanesePreview]))
  for (const [entityId, expected] of Object.entries(REPRESENTATIVE_JAPANESE)) {
    if (previewById.get(entityId) !== expected) fail('C6_CANONICAL_SOURCE_ERROR', `Japanese representative ${entityId} drifted.`)
  }
  const statistics = {
    entities: byEntity.size, rows: rows.length,
    shapes: Object.fromEntries([...byEntity.values()].map((entityRows) => entityRows.map((row) => row.ComponentRole).join(' + ')).reduce((map, shape) => map.set(shape, (map.get(shape) ?? 0) + 1), new Map())),
    occurrences: Object.fromEntries(['prefix', 'species', 'diet'].map((role) => [role, rows.filter((row) => row.ComponentRole === role).length])),
    unique: Object.fromEntries(['prefix', 'species', 'diet'].map((role) => [role, new Set(rows.filter((row) => row.ComponentRole === role).map((row) => `${row.NameSourcePlugin}:${row.NameStringTable}:${row.NameStringID}`)).size])),
  }
  statistics.unique.all = new Set(rows.map((row) => `${row.NameSourcePlugin}:${row.NameStringTable}:${row.NameStringID}`)).size
  assertExpected({ ...statistics, ruleOrderTies: 8, recursiveOmodFauna: 35, shatteredSpaceEntities: targets.filter((target) => target.SpeciesSourcePlugin === 'ShatteredSpace.esm').length })
  return { targets, rows, previews, statistics }
}
