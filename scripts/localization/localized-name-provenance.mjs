/**
 * Purpose: Normalize C2 canonical entities and verify direct localized-name provenance.
 * Architecture: Canonical identity drives exact plugin/FormID reads; English is verification only.
 * Change this file when: a C2 population, schema, or explicit mismatch policy changes.
 */
import { parse } from 'csv-parse/sync'

import { extractLocalizedId, getLocalizedFieldDefinition, SEMANTIC_PATHS } from './localized-field-map.mjs'

export const PROVENANCE_HEADERS = [
  'EntityKind', 'EntityId', 'DisplayNameSourceKind', 'ComponentOrder', 'ComponentRole',
  'RecordSourcePlugin', 'RecordFormID', 'RecordSignature', 'NameFieldPath',
  'NameSourcePlugin', 'NameStringTable', 'NameStringID', 'CanonicalEnglish',
]
export const UNRESOLVED_HEADERS = [
  'EntityKind', 'EntityId', 'RecordSourcePlugin', 'RecordFormID', 'RecordSignature',
  'CanonicalEnglish', 'ReasonCode', 'Detail',
]
export const REASON_CODES = new Set([
  'WRONG_FIELD', 'WRONG_PLUGIN', 'WRONG_TABLE', 'MISSING_STRING_ID',
  'TRACKER_NORMALIZATION', 'CANONICAL_SOURCE_ERROR', 'UNSUPPORTED_RECORD_SHAPE',
  'OVERRIDE_PROVIDER_UNRESOLVED', 'MISSING_LOCALIZATION_INPUT',
  'SYSTEM_NUMBER_MISSING', 'SYSTEM_NUMBER_CONFLICT', 'SYSTEM_STDT_NOT_FOUND',
  'SYSTEM_STDT_AMBIGUOUS', 'SYSTEM_NAME_MISMATCH',
])

export const OFFICIAL_TERMS = Object.freeze([
  { entityId: 'skill.special-projects', formId: '0004CE2D', canonicalEnglish: 'Special Projects' },
  { entityId: 'skill.outpost-management', formId: '0023826F', canonicalEnglish: 'Outpost Management' },
  { entityId: 'skill.planetary-habitation', formId: '0027CBC2', canonicalEnglish: 'Planetary Habitation' },
  { entityId: 'skill.research-methods', formId: '002C555C', canonicalEnglish: 'Research Methods' },
  { entityId: 'skill.outpost-engineering', formId: '002C59E0', canonicalEnglish: 'Outpost Engineering' },
])

function rows(csv) {
  return parse(csv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
}

function assertSame(previous, next, context) {
  if (previous && JSON.stringify(previous) !== JSON.stringify(next)) {
    throw new Error(`CANONICAL_SOURCE_ERROR: conflicting ${context}.`)
  }
}

function target(entityKind, entityId, plugin, formId, canonicalEnglish, signature = 'IRES') {
  return {
    entityKind, entityId, recordSourcePlugin: plugin, recordFormId: formId,
    recordSignature: signature, semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, canonicalEnglish,
  }
}

export function buildC2Targets(sources) {
  const policy = new Map(rows(sources.inorganicPolicy).map((row) => [row.ResourceFormID, row.ResourceId]))
  const metadata = new Map(rows(sources.itemMetadata).map((row) => [`${row.ItemType}:${row.ItemFormID}`, row]))
  const targets = new Map()
  const add = (item) => {
    const key = `${item.entityKind}:${item.entityId}`
    assertSame(targets.get(key), item, key)
    targets.set(key, item)
  }
  for (const row of rows(sources.inorganic)) {
    const id = policy.get(row.ResourceFormID)
    if (!id) throw new Error(`CANONICAL_SOURCE_ERROR: missing resource identity for ${row.ResourceFormID}.`)
    add(target('resource', id, row.SourceFile, row.ResourceFormID, row.ResourceName))
  }

  const recipeRows = rows(sources.recipes)
  for (const row of recipeRows) {
    const product = metadata.get(`product:${row.ProductFormID}`)
    if (!product) throw new Error(`CANONICAL_SOURCE_ERROR: missing product identity for ${row.ProductFormID}.`)
    add(target('product', product.ItemId, row.SourceFile, row.ProductFormID, row.ProductName))

    const inorganicId = policy.get(row.IngredientFormID)
    const organic = metadata.get(`organic:${row.IngredientFormID}`)
    const ingredientProduct = metadata.get(`product:${row.IngredientFormID}`)
    const matches = [inorganicId && target('resource', inorganicId, row.IngredientSourceFile, row.IngredientFormID, row.IngredientName),
      organic && target('resource', organic.ItemId, row.IngredientSourceFile, row.IngredientFormID, row.IngredientName),
      ingredientProduct && target('product', ingredientProduct.ItemId, row.IngredientSourceFile, row.IngredientFormID, row.IngredientName),
    ].filter(Boolean)
    if (matches.length !== 1) throw new Error(`CANONICAL_SOURCE_ERROR: ingredient ${row.IngredientFormID} maps to ${matches.length} populations.`)
    add(matches[0])
  }

  const biomeIdentities = new Map()
  for (const csv of [sources.biomeInorganic, sources.biomeOrganic]) {
    for (const row of rows(csv)) {
      if (!row.BiomeFormID) continue
      const item = target('biome', row.BiomeFormID, row.BiomeSourceFile, row.BiomeFormID, row.BiomeName, 'BIOM')
      const sourceKey = `${row.BiomeSourceFile}:${row.BiomeFormID}`
      assertSame(biomeIdentities.get(sourceKey), item, `biome ${sourceKey}`)
      biomeIdentities.set(sourceKey, item)
    }
  }
  for (const item of biomeIdentities.values()) add(item)
  for (const term of OFFICIAL_TERMS) add(target('official-term', term.entityId, 'Starfield.esm', term.formId, term.canonicalEnglish, 'PERK'))

  const targetRows = [...targets.values()].sort(compareTargets)
  const biomeNameCounts = new Map()
  for (const item of targetRows.filter((item) => item.entityKind === 'biome')) {
    biomeNameCounts.set(item.canonicalEnglish, (biomeNameCounts.get(item.canonicalEnglish) ?? 0) + 1)
  }
  return {
    targets: targetRows,
    statistics: {
      recipeRows: recipeRows.length,
      uniqueRecipeEntities: new Set([...recipeRows.map((row) => `item:${row.SourceFile}:${row.ProductFormID}`), ...recipeRows.map((row) => `item:${row.IngredientSourceFile}:${row.IngredientFormID}`)]).size,
      duplicateRecipeOccurrencesCollapsed: recipeRows.length * 2 - new Set([...recipeRows.map((row) => `item:${row.ProductFormID}`), ...recipeRows.map((row) => `item:${row.IngredientFormID}`)]).size,
      uniqueBiomes: biomeIdentities.size,
      repeatedBiomeNameGroups: [...biomeNameCounts.values()].filter((count) => count > 1).length,
    },
  }
}

function compareTargets(left, right) {
  return left.entityKind.localeCompare(right.entityKind) || left.entityId.localeCompare(right.entityId)
}

export function verifyEnglish(row, table, normalizationPolicy = new Map()) {
  if (!table) return { reasonCode: 'MISSING_LOCALIZATION_INPUT', detail: `No ${row.NameStringTable} input was supplied for ${row.NameSourcePlugin}.` }
  const value = table.get(Number.parseInt(row.NameStringID, 16) >>> 0)
  if (value === undefined) return { reasonCode: 'MISSING_STRING_ID', detail: `${row.NameStringTable}:${row.NameStringID} is absent from ${row.NameSourcePlugin}.` }
  if (value === row.CanonicalEnglish) return { value }
  const policyKey = `${row.EntityKind}:${row.EntityId}`
  const approval = normalizationPolicy.get(policyKey)
  if (approval?.officialEnglish === value && approval?.canonicalEnglish === row.CanonicalEnglish) {
    return { value, classification: approval.reasonCode ?? 'TRACKER_NORMALIZATION', detail: approval.detail }
  }
  return { reasonCode: 'CANONICAL_SOURCE_ERROR', detail: `Official English is ${JSON.stringify(value)}; canonical English is ${JSON.stringify(row.CanonicalEnglish)}.` }
}

export function generateProvenance(targets, recordsByPlugin, tablesByQualifiedKey, normalizationPolicy = new Map()) {
  const provenance = []
  const unresolved = []
  const normalizations = []
  for (const item of targets) {
    const pluginRecords = recordsByPlugin.get(item.recordSourcePlugin)
    if (!pluginRecords) {
      unresolved.push(unresolvedRow(item, 'WRONG_PLUGIN', 'The canonical source plugin was not supplied or did not match the declared filename.'))
      continue
    }
    const record = pluginRecords.get(`${item.recordSignature}:${item.recordFormId}`)
    if (!record) {
      unresolved.push(unresolvedRow(item, 'UNSUPPORTED_RECORD_SHAPE', 'Exact canonical record was not available.'))
      continue
    }
    let localized
    try {
      localized = extractLocalizedId(record, item.semanticPath)
    } catch (error) {
      unresolved.push(unresolvedRow(item, error.code === 'SEMANTIC_FIELD_NOT_FOUND' ? 'WRONG_FIELD' : 'UNSUPPORTED_RECORD_SHAPE', error.message))
      continue
    }
    const row = {
      EntityKind: item.entityKind, EntityId: item.entityId, DisplayNameSourceKind: 'direct',
      ComponentOrder: '0', ComponentRole: 'complete', RecordSourcePlugin: item.recordSourcePlugin,
      RecordFormID: item.recordFormId, RecordSignature: item.recordSignature, NameFieldPath: item.semanticPath,
      NameSourcePlugin: item.recordSourcePlugin, NameStringTable: localized.stringTable,
      NameStringID: localized.idHex, CanonicalEnglish: item.canonicalEnglish,
    }
    const verification = verifyEnglish(row, tablesByQualifiedKey.get(`${row.NameSourcePlugin}:${row.NameStringTable}`), normalizationPolicy)
    if (verification.reasonCode) {
      unresolved.push(unresolvedRow(
        item,
        verification.reasonCode,
        `Extracted ${localized.stringTable}:${localized.idHex}; ${verification.detail}`,
      ))
    }
    else {
      provenance.push(row)
      if (verification.classification) normalizations.push({
        EntityKind: row.EntityKind, EntityId: row.EntityId, ExpectedSourceEnglish: row.CanonicalEnglish,
        ExpectedLocalizedEnglish: verification.value, ReasonCode: verification.classification, Detail: verification.detail ?? '',
      })
    }
  }
  provenance.sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || Number(a.ComponentOrder) - Number(b.ComponentOrder))
  unresolved.sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || a.ReasonCode.localeCompare(b.ReasonCode))
  if (provenance.length + unresolved.length !== targets.length) throw new Error('C2 coverage invariant failed.')
  return { provenance, unresolved, normalizations }
}

function unresolvedRow(item, reasonCode, detail) {
  if (!REASON_CODES.has(reasonCode)) throw new Error(`Unknown unresolved reason ${reasonCode}.`)
  return { EntityKind: item.entityKind, EntityId: item.entityId, RecordSourcePlugin: item.recordSourcePlugin,
    RecordFormID: item.recordFormId, RecordSignature: item.recordSignature,
    CanonicalEnglish: item.canonicalEnglish, ReasonCode: reasonCode, Detail: detail }
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function serializeCsv(headers, data) {
  return `${[headers, ...data.map((row) => headers.map((header) => row[header]))].map((line) => line.map(csvCell).join(',')).join('\n')}\n`
}

export function validateCommittedCrosswalk(provenanceCsv, unresolvedCsv, targets) {
  const parseExact = (csv, headers, name) => {
    const data = parse(csv, { bom: true, skip_empty_lines: true, trim: true })
    const actualHeaders = data.shift() ?? []
    if (JSON.stringify(actualHeaders) !== JSON.stringify(headers)) throw new Error(`${name} has unexpected headers.`)
    return data.map((values, index) => {
      if (values.length !== headers.length) throw new Error(`${name} row ${index + 2} has an unexpected column count.`)
      return Object.fromEntries(headers.map((header, column) => [header, values[column]]))
    })
  }
  const provenance = parseExact(provenanceCsv, PROVENANCE_HEADERS, 'localized-name-provenance.csv')
  const unresolved = parseExact(unresolvedCsv, UNRESOLVED_HEADERS, 'localized-name-provenance-unresolved.csv')
  const seen = new Set()
  for (const row of provenance) {
    const key = `${row.EntityKind}:${row.EntityId}:${row.ComponentOrder}`
    if (seen.has(key)) throw new Error(`Duplicate provenance row ${key}.`)
    seen.add(key)
    if (!/^[0-9A-F]{8}$/.test(row.RecordFormID) || !/^[0-9A-F]{8}$/.test(row.NameStringID)) throw new Error(`Invalid hex identity ${key}.`)
    if (!['strings', 'dlstrings', 'ilstrings'].includes(row.NameStringTable)) throw new Error(`Invalid table ${key}.`)
  }
  for (const row of unresolved) if (!REASON_CODES.has(row.ReasonCode)) throw new Error(`Invalid unresolved reason ${row.ReasonCode}.`)
  const coverage = new Map()
  for (const row of [...provenance, ...unresolved]) {
    const key = `${row.EntityKind}:${row.EntityId}`
    coverage.set(key, (coverage.get(key) ?? 0) + 1)
  }
  const expected = new Set(targets.map((item) => `${item.entityKind}:${item.entityId}`))
  if ([...coverage].some(([key, count]) => !expected.has(key) || count !== 1) ||
      targets.some((item) => coverage.get(`${item.entityKind}:${item.entityId}`) !== 1)) {
    throw new Error('Committed C2-C4 crosswalk does not cover every canonical target exactly once.')
  }

  const targetByIdentity = new Map(targets.map((item) => [`${item.entityKind}:${item.entityId}`, item]))
  const validateField = (row, expectedTarget, field, expectedValue) => {
    if (row[field] !== String(expectedValue)) {
      throw new Error(
        `Committed provenance ${expectedTarget.entityKind}:${expectedTarget.entityId} field ${field} ` +
        `expected ${JSON.stringify(String(expectedValue))} but received ${JSON.stringify(row[field])}.`,
      )
    }
  }
  const validateCanonicalIdentity = (row) => {
    const target = targetByIdentity.get(`${row.EntityKind}:${row.EntityId}`)
    for (const [field, value] of [['EntityKind', target.entityKind], ['EntityId', target.entityId], ['CanonicalEnglish', target.canonicalEnglish]]) {
      validateField(row, target, field, value)
    }
    if (target.entityKind !== 'system') {
      for (const [field, value] of [
        ['RecordSourcePlugin', target.recordSourcePlugin], ['RecordFormID', target.recordFormId], ['RecordSignature', target.recordSignature],
      ]) validateField(row, target, field, value)
    }
    return target
  }
  for (const row of provenance) {
    const target = validateCanonicalIdentity(row)
    const recordSignature = target.entityKind === 'system' ? 'STDT' : target.recordSignature
    const semanticPath = target.entityKind === 'system' ? SEMANTIC_PATHS.TES_FULL_NAME : target.semanticPath
    const definition = getLocalizedFieldDefinition(recordSignature, semanticPath)
    for (const [field, value] of [
      ['DisplayNameSourceKind', 'direct'],
      ['ComponentOrder', '0'],
      ['ComponentRole', 'complete'],
      ['RecordSignature', recordSignature],
      ['NameFieldPath', semanticPath],
      ['NameSourcePlugin', row.RecordSourcePlugin],
      ['NameStringTable', definition.stringTable],
    ]) validateField(row, target, field, value)
    if (target.entityKind === 'system' && !['Starfield.esm', 'ShatteredSpace.esm', 'SFBGS00D.esm', 'SFBGS050.esm'].includes(row.RecordSourcePlugin)) {
      throw new Error(`Committed provenance system:${target.entityId} has unsupported STDT owner ${row.RecordSourcePlugin}.`)
    }
  }
  for (const row of unresolved) validateCanonicalIdentity(row)
  return { provenance, unresolved }
}
