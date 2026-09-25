/**
 * Purpose: Normalize canonical direct-name entities and verify localized-name provenance.
 * Architecture: Canonical identity drives exact plugin/FormID reads; English is verification only.
 * Change this file when: a direct-name population, schema, or explicit mismatch policy changes.
 */
import { parse } from 'csv-parse/sync'

import { reduceCanonicalOrganicIdentities } from '../item-reference-data.mjs'
import { extractLocalizedId, getLocalizedFieldDefinition, SEMANTIC_PATHS } from './localized-field-map.mjs'
import {
  AUTHORITATIVE_LOCALIZATION_PLUGINS, logicalIdentityForRecord, resolveLocalizedFieldProvider,
} from './official-master-provider-chains.mjs'

const AUTHORITATIVE_NAME_PROVIDERS = new Set(AUTHORITATIVE_LOCALIZATION_PLUGINS)

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
  'ORGANIC_DIRECT_FULL_NOT_FOUND', 'FAUNA_CCT_CHAIN_UNSUPPORTED',
  'FAUNA_CCT_NAME_AMBIGUOUS', 'DEFERRED_COMPOSED_FAUNA',
  'FAUNA_TEMPLATE_NAME_NOT_FOUND', 'FAUNA_TEMPLATE_NAME_AMBIGUOUS',
  'FAUNA_TEMPLATE_CHAIN_UNSUPPORTED',
  'COMPOSED_FAUNA_NPC_NOT_FOUND', 'COMPOSED_FAUNA_OBJECT_TEMPLATE_MISSING', 'COMPOSED_FAUNA_MULTIPLE_FINAL_NAMES',
  'COMPOSED_FAUNA_REQUIRED_SPECIES_COMPONENT_MISSING', 'COMPOSED_FAUNA_INNR_RECORD_NOT_FOUND', 'COMPOSED_FAUNA_INNR_RULE_UNSUPPORTED',
  'COMPOSED_FAUNA_WNAM_ZERO', 'COMPOSED_FAUNA_STRING_ID_MISSING', 'COMPOSED_FAUNA_PROVIDER_AMBIGUOUS',
  'COMPOSED_FAUNA_ENGLISH_RECONSTRUCTION_MISMATCH', 'COMPOSED_FAUNA_UNSUPPORTED_LOCALE_ENCODING',
])

export const OFFICIAL_TERMS = Object.freeze([
  { entityId: 'skill.special-projects', formId: '0004CE2D', canonicalEnglish: 'Special Projects' },
  { entityId: 'skill.outpost-management', formId: '0023826F', canonicalEnglish: 'Outpost Management' },
  { entityId: 'skill.planetary-habitation', formId: '0027CBC2', canonicalEnglish: 'Planetary Habitation' },
  { entityId: 'skill.research-methods', formId: '002C555C', canonicalEnglish: 'Research Methods' },
  { entityId: 'skill.outpost-engineering', formId: '002C59E0', canonicalEnglish: 'Outpost Engineering' },
])

export const ORGANIC_RESOURCE_ADDENDUM_IDS = Object.freeze([
  'adhesive', 'amino-acids', 'analgesic', 'antimicrobial', 'aromatic',
  'gastronomic-delight', 'hallucinogen', 'high-tensile-spidroin', 'hypercatalyst',
  'immunostimulant', 'luxury-textile', 'metabolic-agent', 'neurologic', 'nutrient',
  'ornamental', 'pigment', 'sealant', 'sedative', 'spice', 'stimulant', 'structural', 'toxin',
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

export function buildDirectNameTargets(sources) {
  const policy = new Map(rows(sources.inorganicPolicy).map((row) => [row.ResourceFormID, row.ResourceId]))
  const metadataRows = rows(sources.itemMetadata)
  const metadata = new Map(metadataRows.map((row) => [`${row.ItemType}:${row.ItemFormID}`, row]))
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

  // Harvested-resource identity comes from the canonical occurrence FormID; display text is verification only.
  const organicOccurrences = rows(sources.biomeOrganic)
  const organicByFormId = reduceCanonicalOrganicIdentities(organicOccurrences)
  const organicMetadata = metadataRows.filter((row) => row.ItemType === 'organic')
  const organicMetadataByFormId = new Map()
  const organicIds = new Set()
  for (const row of organicMetadata) {
    if (organicMetadataByFormId.has(row.ItemFormID)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: duplicate organic metadata FormID ${row.ItemFormID}.`)
    }
    if (organicIds.has(row.ItemId)) {
      throw new Error(`CANONICAL_SOURCE_ERROR: duplicate organic stable ID ${row.ItemId}.`)
    }
    organicMetadataByFormId.set(row.ItemFormID, row)
    organicIds.add(row.ItemId)
  }
  const missingMetadata = [...organicByFormId.keys()].filter((formId) => !organicMetadataByFormId.has(formId))
  const unmatchedMetadata = [...organicMetadataByFormId.keys()].filter((formId) => !organicByFormId.has(formId))
  if (missingMetadata.length || unmatchedMetadata.length) {
    throw new Error(
      `CANONICAL_SOURCE_ERROR: organic FormID coverage differs; missing metadata: ${missingMetadata.join(', ') || 'none'}; ` +
      `unmatched metadata: ${unmatchedMetadata.join(', ') || 'none'}.`,
    )
  }
  const targetCountBeforeOrganics = targets.size
  for (const [formId, canonical] of organicByFormId) {
    const item = organicMetadataByFormId.get(formId)
    if (item.ItemEditorID !== canonical.editorId || item.CanonicalName !== canonical.canonicalName) {
      throw new Error(`CANONICAL_SOURCE_ERROR: organic metadata ${formId} contradicts canonical EditorID/name.`)
    }
    add(target(
      'resource', item.ItemId, canonical.sourceFile, formId,
      item.DisplayNameOverride || item.CanonicalName,
    ))
  }
  const organicResourceTargetsAdded = targets.size - targetCountBeforeOrganics

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
      organicResourceOccurrenceRows: organicOccurrences.filter((row) => row.ResourceResolutionStatus === 'Resolved').length,
      uniqueOrganicResources: organicByFormId.size,
      duplicateOrganicResourceOccurrencesCollapsed: organicOccurrences.filter((row) => row.ResourceResolutionStatus === 'Resolved').length - organicByFormId.size,
      organicResourceTargetsAdded,
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

export function generateProvenance(targets, recordsByPlugin, tablesByQualifiedKey, normalizationPolicy = new Map(), providerContext) {
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
    let nameSourcePlugin = item.recordSourcePlugin
    try {
      if (providerContext) {
        const identity = logicalIdentityForRecord(
          item.recordSourcePlugin, providerContext.mastersByPlugin, item.recordSignature,
          Number.parseInt(item.recordFormId, 16) >>> 0,
        )
        const resolved = resolveLocalizedFieldProvider(providerContext.providerChains.get(identity.key), item.semanticPath)
        localized = resolved.localized
        nameSourcePlugin = resolved.plugin
      } else localized = extractLocalizedId(record, item.semanticPath)
    } catch (error) {
      const reasonCode = error.code === 'SEMANTIC_FIELD_NOT_FOUND' ? 'WRONG_FIELD'
        : error.code === 'OVERRIDE_PROVIDER_UNRESOLVED' ? 'OVERRIDE_PROVIDER_UNRESOLVED' : 'UNSUPPORTED_RECORD_SHAPE'
      unresolved.push(unresolvedRow(item, reasonCode, error.message))
      continue
    }
    const row = {
      EntityKind: item.entityKind, EntityId: item.entityId, DisplayNameSourceKind: 'direct',
      ComponentOrder: '0', ComponentRole: 'complete', RecordSourcePlugin: item.recordSourcePlugin,
      RecordFormID: item.recordFormId, RecordSignature: item.recordSignature, NameFieldPath: item.semanticPath,
      NameSourcePlugin: nameSourcePlugin, NameStringTable: localized.stringTable,
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
  if (provenance.length + unresolved.length !== targets.length) throw new Error('Direct-name coverage invariant failed.')
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

export function validateCommittedCrosswalk(provenanceCsv, unresolvedCsv, targets, options = {}) {
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
    if (row.RecordSourcePlugin === 'SFBGS050.esm' || row.NameSourcePlugin === 'SFBGS050.esm') {
      throw new Error(`Non-authoritative localization provider on ${key}.`)
    }
  }
  for (const row of unresolved) if (!REASON_CODES.has(row.ReasonCode)) throw new Error(`Invalid unresolved reason ${row.ReasonCode}.`)
  const resolvedKeys = new Set(provenance.map((row) => `${row.EntityKind}:${row.EntityId}`))
  const unresolvedKeys = new Set(unresolved.map((row) => `${row.EntityKind}:${row.EntityId}`))
  const expected = new Set(targets.map((item) => `${item.entityKind}:${item.entityId}`))
  const actual = new Set([...resolvedKeys, ...unresolvedKeys])
  const missingOrOverlapping = [...expected].some((key) =>
    (!actual.has(key) && options.allowMissingTargets !== true) || (resolvedKeys.has(key) && unresolvedKeys.has(key)))
  if ([...actual].some((key) => !expected.has(key)) || missingOrOverlapping) {
    throw new Error('Committed provenance crosswalk does not cover every canonical target in exactly one resolved/unresolved state.')
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
    for (const [field, value] of [['EntityKind', target.entityKind], ['EntityId', target.entityId]]) {
      validateField(row, target, field, value)
    }
    if (row.DisplayNameSourceKind !== 'composed') validateField(row, target, 'CanonicalEnglish', target.canonicalEnglish)
    if (target.entityKind !== 'system' && !(target.entityKind === 'fauna' && ['template', 'composed'].includes(row.DisplayNameSourceKind))) {
      for (const [field, value] of [
        ['RecordSourcePlugin', target.recordSourcePlugin], ['RecordFormID', target.recordFormId], ['RecordSignature', target.recordSignature],
      ]) validateField(row, target, field, value)
    }
    return target
  }
  for (const row of provenance) {
    const target = validateCanonicalIdentity(row)
    if (row.DisplayNameSourceKind === 'composed') {
      const roles = { prefix: '0', species: '1', diet: '2' }
      if (target.entityKind !== 'fauna' || roles[row.ComponentRole] !== row.ComponentOrder || row.RecordSignature !== 'INNR' ||
          row.NameStringTable !== 'strings' || row.NameSourcePlugin !== row.RecordSourcePlugin || !row.CanonicalEnglish ||
          !/^Naming Rules\[\d+]\/Names\[\d+]\/WNAM - Text$/.test(row.NameFieldPath)) {
        throw new Error(`Committed composed provenance fauna:${target.entityId} has an invalid component row.`)
      }
      continue
    }
    const recordSignature = target.entityKind === 'system' ? 'STDT' : target.entityKind === 'fauna' && row.DisplayNameSourceKind === 'template' ? 'NPC_' : target.recordSignature
    const semanticPath = target.entityKind === 'system' ? SEMANTIC_PATHS.TES_FULL_NAME : target.semanticPath
    const definition = getLocalizedFieldDefinition(recordSignature, semanticPath)
    for (const [field, value] of [
      ['DisplayNameSourceKind', target.entityKind === 'fauna' && row.DisplayNameSourceKind === 'template' ? 'template' : 'direct'],
      ['ComponentOrder', '0'],
      ['ComponentRole', 'complete'],
      ['RecordSignature', recordSignature],
      ['NameFieldPath', semanticPath],
      ['NameStringTable', definition.stringTable],
    ]) validateField(row, target, field, value)
    if (!AUTHORITATIVE_NAME_PROVIDERS.has(row.NameSourcePlugin)) {
      throw new Error(`Committed provenance ${target.entityKind}:${target.entityId} has unsupported name provider ${row.NameSourcePlugin}.`)
    }
    const isMuphridOverride = row.EntityKind === 'body' && row.EntityId === '0005E364'
    if (!isMuphridOverride && row.NameSourcePlugin !== row.RecordSourcePlugin) {
      throw new Error(`Committed provenance ${target.entityKind}:${target.entityId} has an unaudited differing name provider ${row.NameSourcePlugin}.`)
    }
    if (target.entityKind === 'system' && !AUTHORITATIVE_LOCALIZATION_PLUGINS.includes(row.RecordSourcePlugin)) {
      throw new Error(`Committed provenance system:${target.entityId} has unsupported STDT owner ${row.RecordSourcePlugin}.`)
    }
    if (target.entityKind === 'fauna' && row.DisplayNameSourceKind === 'template' &&
        !AUTHORITATIVE_LOCALIZATION_PLUGINS.includes(row.RecordSourcePlugin)) {
      throw new Error(`Committed provenance fauna:${target.entityId} has unsupported encounter NPC_ owner ${row.RecordSourcePlugin}.`)
    }
  }
  for (const row of unresolved) {
    const target = validateCanonicalIdentity(row)
    validateField(row, target, 'CanonicalEnglish', target.canonicalEnglish)
    if (row.RecordSourcePlugin === 'SFBGS050.esm') throw new Error(`Non-authoritative unresolved provider on ${row.EntityKind}:${row.EntityId}.`)
  }
  const muphrid = provenance.find((row) => row.EntityKind === 'body' && row.EntityId === '0005E364')
  if (muphrid) {
    for (const [field, value] of Object.entries({
      RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0005E364', RecordSignature: 'PNDT',
      NameSourcePlugin: 'SFBGS00D.esm', NameStringTable: 'strings', NameStringID: '0000A682',
    })) validateField(muphrid, targetByIdentity.get('body:0005E364'), field, value)
  }
  return { provenance, unresolved }
}
