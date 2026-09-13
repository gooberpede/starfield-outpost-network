import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildC2Targets, generateProvenance, ORGANIC_RESOURCE_ADDENDUM_IDS, PROVENANCE_HEADERS, serializeCsv,
  UNRESOLVED_HEADERS, validateCommittedCrosswalk, verifyEnglish,
} from './localized-name-provenance.mjs'
import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import { StringTableError, readStringTable } from './string-table-reader.mjs'

function parsedRecord(signature, formId, id) {
  return {
    signature, formIdHex: formId, subrecords: [{ signature: 'FULL', data: Buffer.from([
      id & 0xFF, (id >>> 8) & 0xFF, (id >>> 16) & 0xFF, (id >>> 24) & 0xFF,
    ]) }],
  }
}

const targets = [
  ['resource', 'aluminium', 'Starfield.esm', '000057D6', 'Aluminum', 'IRES', 0x8155],
  ['resource', 'x-tech', 'SFBGS00D.esm', '01033E3F', 'X-Tech', 'IRES', 0xFC7],
  ['product', 'control-rod', 'Starfield.esm', '0029C460', 'Control Rod', 'IRES', 0x1111],
  ['biome', '002ACD5A', 'Starfield.esm', '002ACD5A', 'Rocky Desert', 'BIOM', 0x62F4],
  ['official-term', 'skill.special-projects', 'Starfield.esm', '0004CE2D', 'Special Projects', 'PERK', 0x30F39],
].map(([entityKind, entityId, recordSourcePlugin, recordFormId, canonicalEnglish, recordSignature, id]) => ({
  entityKind, entityId, recordSourcePlugin, recordFormId, canonicalEnglish,
  recordSignature, semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, id,
}))

function inputs(items = targets) {
  const records = new Map()
  const tables = new Map()
  for (const item of items) {
    if (!records.has(item.recordSourcePlugin)) records.set(item.recordSourcePlugin, new Map())
    records.get(item.recordSourcePlugin).set(`${item.recordSignature}:${item.recordFormId}`, parsedRecord(item.recordSignature, item.recordFormId, item.id))
    const key = `${item.recordSourcePlugin}:strings`
    if (!tables.has(key)) tables.set(key, new Map())
    tables.get(key).set(item.id, item.canonicalEnglish)
  }
  return { records, tables }
}

const sourceNames = {
  inorganic: 'inorganic-resource-dictionary.csv', inorganicPolicy: 'inorganic-resource-tracker-policy.csv',
  itemMetadata: 'item-tracker-metadata.csv', recipes: 'industrial-workbench.csv',
  biomeInorganic: 'biome-inorganic-resources.csv', biomeOrganic: 'biome-organic-resources.csv',
}
const committedSources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [
  key, await readFile(new URL(`../../reference-source/${name}`, import.meta.url), 'utf8'),
])))

test('generates direct resource, product, biome, skill, and plugin-qualified rows', () => {
  const { records, tables } = inputs()
  const result = generateProvenance(targets, records, tables)
  assert.equal(result.unresolved.length, 0)
  assert.deepEqual(result.provenance.map((row) => [row.EntityKind, row.EntityId]), [
    ['biome', '002ACD5A'], ['official-term', 'skill.special-projects'], ['product', 'control-rod'],
    ['resource', 'aluminium'], ['resource', 'x-tech'],
  ])
  assert.deepEqual(result.provenance.find((row) => row.EntityId === 'x-tech'), {
    EntityKind: 'resource', EntityId: 'x-tech', DisplayNameSourceKind: 'direct', ComponentOrder: '0',
    ComponentRole: 'complete', RecordSourcePlugin: 'SFBGS00D.esm', RecordFormID: '01033E3F',
    RecordSignature: 'IRES', NameFieldPath: SEMANTIC_PATHS.TOP_LEVEL_FULL,
    NameSourcePlugin: 'SFBGS00D.esm', NameStringTable: 'strings', NameStringID: '00000FC7', CanonicalEnglish: 'X-Tech',
  })
})

test('preserves distinct BIOM string identity for repeated English names', () => {
  const repeated = [
    { ...targets[3], entityId: '00000001', recordFormId: '00000001', id: 1 },
    { ...targets[3], entityId: '00000002', recordFormId: '00000002', id: 2 },
  ]
  const { records, tables } = inputs(repeated)
  const result = generateProvenance(repeated, records, tables)
  assert.deepEqual(result.provenance.map((row) => row.NameStringID), ['00000001', '00000002'])
})

test('deduplicates recipe and biome occurrences while retaining stable identities', () => {
  const sources = {
    inorganic: 'ResourceFormID,SourceFile,ResourceName\n00000001,Starfield.esm,Iron\n',
    inorganicPolicy: 'ResourceFormID,ResourceId\n00000001,iron\n',
    itemMetadata: 'ItemType,ItemFormID,ItemEditorID,CanonicalName,ItemId,DisplayNameOverride\n' +
      'product,00000002,AdaptiveFrameRecord,Adaptive Frame,adaptive-frame,\n' +
      'organic,00000003,FiberRecord,Fiber,fiber,\n',
    recipes: 'ProductFormID,SourceFile,ProductName,IngredientFormID,IngredientSourceFile,IngredientName\n00000002,Starfield.esm,Adaptive Frame,00000001,Starfield.esm,Iron\n00000002,Starfield.esm,Adaptive Frame,00000003,Starfield.esm,Fiber\n',
    biomeInorganic: 'BiomeFormID,BiomeSourceFile,BiomeName\n00000004,Starfield.esm,Rocky Desert\n00000004,Starfield.esm,Rocky Desert\n',
    biomeOrganic: 'BiomeFormID,BiomeSourceFile,BiomeName,ResourceResolutionStatus,ResourceFormID,ResourceEditorID,ResourceName,ResourceSourceFile\n' +
      '00000004,Starfield.esm,Rocky Desert,Resolved,00000003,FiberRecord,Fiber,Starfield.esm\n' +
      '00000004,Starfield.esm,Rocky Desert,Resolved,00000003,FiberRecord,Fiber,Starfield.esm\n',
  }
  const result = buildC2Targets(sources)
  assert.equal(result.targets.filter((item) => item.entityId === 'adaptive-frame').length, 1)
  assert.equal(result.targets.filter((item) => item.entityKind === 'biome').length, 1)
  assert.equal(result.statistics.uniqueBiomes, 1)
  assert.equal(result.statistics.repeatedBiomeNameGroups, 0)
  assert.equal(result.statistics.uniqueOrganicResources, 1)
  assert.equal(result.statistics.duplicateOrganicResourceOccurrencesCollapsed, 1)
  assert.equal(result.statistics.organicResourceTargetsAdded, 0)
})

test('adds the 22 missing organic resources through canonical FormID joins', () => {
  const result = buildC2Targets(committedSources)
  const resources = new Map(result.targets.filter((item) => item.entityKind === 'resource').map((item) => [item.entityId, item]))
  const expected = new Map([
    ['adhesive', '00077828'], ['amino-acids', '0007782A'], ['analgesic', '00077829'],
    ['antimicrobial', '00077820'], ['aromatic', '000777FB'], ['gastronomic-delight', '0007782F'],
    ['hallucinogen', '0029F403'], ['high-tensile-spidroin', '000777FC'], ['hypercatalyst', '0029F40C'],
    ['immunostimulant', '00077830'], ['luxury-textile', '00077831'], ['metabolic-agent', '0029F3FD'],
    ['neurologic', '0029F408'], ['nutrient', '000777E6'], ['ornamental', '00077822'],
    ['pigment', '0029F401'], ['sealant', '0007782D'], ['sedative', '0007782B'], ['spice', '0007782E'],
    ['stimulant', '00077825'], ['structural', '000777FA'], ['toxin', '00077823'],
  ])
  assert.deepEqual([...expected.keys()], [...ORGANIC_RESOURCE_ADDENDUM_IDS])
  for (const [id, formId] of expected) {
    const resource = resources.get(id)
    assert.equal(resource.recordFormId, formId)
    assert.equal(resource.recordSourcePlugin, 'Starfield.esm')
    assert.equal(resource.recordSignature, 'IRES')
    assert.equal(resource.semanticPath, SEMANTIC_PATHS.TOP_LEVEL_FULL)
  }
  assert.equal(resources.get('gastronomic-delight').canonicalEnglish, 'Gastronomic Delight')
  assert.equal(result.statistics.uniqueOrganicResources, 30)
  assert.equal(result.statistics.organicResourceTargetsAdded, 22)
  assert.equal(resources.size, 78)
})

test('organic target assembly fails closed for inconsistent rows, unmatched metadata, and same-name variant FormIDs', () => {
  const base = {
    inorganic: 'ResourceFormID,SourceFile,ResourceName\n',
    inorganicPolicy: 'ResourceFormID,ResourceId\n', recipes: 'ProductFormID,SourceFile,ProductName,IngredientFormID,IngredientSourceFile,IngredientName\n',
    biomeInorganic: 'BiomeFormID,BiomeSourceFile,BiomeName\n',
    itemMetadata: 'ItemType,ItemFormID,ItemEditorID,CanonicalName,ItemId,DisplayNameOverride\norganic,00000001,CanonicalRecord,Fiber,fiber,\n',
    biomeOrganic: 'BiomeFormID,BiomeSourceFile,BiomeName,ResourceResolutionStatus,ResourceFormID,ResourceEditorID,ResourceName,ResourceSourceFile\n' +
      ',,,Resolved,00000001,CanonicalRecord,Fiber,Starfield.esm\n',
  }
  const consistent = buildC2Targets(base)
  assert.equal(consistent.targets.find((item) => item.entityId === 'fiber').recordFormId, '00000001')
  assert.throws(() => buildC2Targets({
    ...base,
    biomeOrganic: base.biomeOrganic + ',,,Resolved,00000001,ChangedRecord,Fiber,Starfield.esm\n',
  }), /conflicts/)
  assert.throws(() => buildC2Targets({
    ...base,
    itemMetadata: base.itemMetadata + 'organic,00000002,HerbivoreVariant,Fiber,fiber-variant,\n',
  }), /unmatched metadata: 00000002/)
  assert.throws(() => buildC2Targets({
    ...base,
    itemMetadata: base.itemMetadata + 'organic,00000002,HerbivoreVariant,Fiber,fiber,\n',
    biomeOrganic: base.biomeOrganic + ',,,Resolved,00000002,HerbivoreVariant,Fiber,Starfield.esm\n',
  }), /duplicate organic stable ID fiber/)
})

test('English verification classifies missing inputs/IDs, mismatches, and explicit normalization', () => {
  const row = { EntityKind: 'resource', EntityId: 'fixture', NameSourcePlugin: 'Fixture.esm', NameStringTable: 'strings', NameStringID: '00000001', CanonicalEnglish: 'Canonical' }
  assert.equal(verifyEnglish(row).reasonCode, 'MISSING_LOCALIZATION_INPUT')
  assert.equal(verifyEnglish(row, new Map()).reasonCode, 'MISSING_STRING_ID')
  assert.equal(verifyEnglish(row, new Map([[1, 'Different']])).reasonCode, 'CANONICAL_SOURCE_ERROR')
  assert.deepEqual(verifyEnglish(row, new Map([[1, 'Canonical']])), { value: 'Canonical' })
  const policy = new Map([['resource:fixture', { officialEnglish: 'Official', canonicalEnglish: 'Canonical' }]])
  assert.equal(verifyEnglish(row, new Map([[1, 'Official']]), policy).classification, 'TRACKER_NORMALIZATION')
})

test('Gastronomic Delight requires the exact entity-scoped display normalization', () => {
  const gastronomic = buildC2Targets(committedSources).targets.find((item) => item.entityId === 'gastronomic-delight')
  const records = new Map([['Starfield.esm', new Map([[
    'IRES:0007782F', parsedRecord('IRES', '0007782F', 0x81A0),
  ]])]])
  const tables = new Map([['Starfield.esm:strings', new Map([[0x81A0, 'Gastro Delight']])]])
  assert.equal(generateProvenance([gastronomic], records, tables).unresolved[0].ReasonCode, 'CANONICAL_SOURCE_ERROR')
  const result = generateProvenance([gastronomic], records, tables, new Map([[
    'resource:gastronomic-delight', {
      canonicalEnglish: 'Gastronomic Delight', officialEnglish: 'Gastro Delight',
      reasonCode: 'TRACKER_NORMALIZATION', detail: 'Reviewed fixture.',
    },
  ]]))
  assert.equal(result.unresolved.length, 0)
  assert.deepEqual(result.provenance[0], {
    EntityKind: 'resource', EntityId: 'gastronomic-delight', DisplayNameSourceKind: 'direct',
    ComponentOrder: '0', ComponentRole: 'complete', RecordSourcePlugin: 'Starfield.esm',
    RecordFormID: '0007782F', RecordSignature: 'IRES', NameFieldPath: SEMANTIC_PATHS.TOP_LEVEL_FULL,
    NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '000081A0',
    CanonicalEnglish: 'Gastronomic Delight',
  })
  assert.equal(result.normalizations[0].ExpectedLocalizedEnglish, 'Gastro Delight')
})

test('wrong table input fails closed', () => {
  assert.throws(() => readStringTable('fixture.strings', 'dlstrings'), (error) => error instanceof StringTableError && error.code === 'WRONG_TABLE')
})

test('every target ends resolved or unresolved with no silent omission', () => {
  const { records, tables } = inputs(targets.slice(0, 2))
  const result = generateProvenance(targets, records, tables)
  assert.equal(result.provenance.length + result.unresolved.length, targets.length)
  const provenanceCsv = serializeCsv(PROVENANCE_HEADERS, result.provenance)
  const unresolvedCsv = serializeCsv(UNRESOLVED_HEADERS, result.unresolved)
  const validated = validateCommittedCrosswalk(provenanceCsv, unresolvedCsv, targets)
  assert.equal(validated.provenance.length + validated.unresolved.length, targets.length)
  assert.equal(generateProvenance([targets[0]], new Map(), new Map()).unresolved[0].ReasonCode, 'WRONG_PLUGIN')
})

test('drift review may read a committed subset while normal validation still requires full coverage', () => {
  const { records, tables } = inputs(targets.slice(0, 1))
  const result = generateProvenance(targets.slice(0, 1), records, tables)
  const provenanceCsv = serializeCsv(PROVENANCE_HEADERS, result.provenance)
  const unresolvedCsv = serializeCsv(UNRESOLVED_HEADERS, result.unresolved)
  assert.throws(() => validateCommittedCrosswalk(provenanceCsv, unresolvedCsv, targets), /does not cover/)
  assert.equal(validateCommittedCrosswalk(
    provenanceCsv, unresolvedCsv, targets, { allowMissingTargets: true },
  ).provenance.length, 1)
})

test('committed validation rejects syntactically valid resolved canonical drift', () => {
  const { records, tables } = inputs()
  const result = generateProvenance(targets, records, tables)
  const cases = [
    ['RecordFormID', '00000001'],
    ['RecordSourcePlugin', 'Wrong.esm'],
    ['CanonicalEnglish', 'Aluminium'],
    ['NameFieldPath', 'topLevel.WRONG'],
    ['NameStringTable', 'dlstrings'],
  ]
  for (const [field, value] of cases) {
    const changed = result.provenance.map((row) => row.EntityId === 'aluminium' ? { ...row, [field]: value } : row)
    assert.throws(
      () => validateCommittedCrosswalk(
        serializeCsv(PROVENANCE_HEADERS, changed),
        serializeCsv(UNRESOLVED_HEADERS, result.unresolved),
        targets,
      ),
      new RegExp(`resource:aluminium field ${field} expected`),
    )
  }
})

test('committed validation rejects an unaudited differing name provider', () => {
  const { records, tables } = inputs()
  const result = generateProvenance(targets, records, tables)
  const changed = result.provenance.map((row) => row.EntityId === 'aluminium'
    ? { ...row, NameSourcePlugin: 'ShatteredSpace.esm' }
    : row)
  assert.throws(
    () => validateCommittedCrosswalk(
      serializeCsv(PROVENANCE_HEADERS, changed), serializeCsv(UNRESOLVED_HEADERS, result.unresolved), targets,
    ),
    /unaudited differing name provider/,
  )
})

test('committed validation rejects canonical drift in an unresolved row', () => {
  const { records, tables } = inputs()
  tables.delete('SFBGS00D.esm:strings')
  const result = generateProvenance(targets, records, tables)
  const changed = result.unresolved.map((row) => row.EntityId === 'x-tech'
    ? { ...row, RecordSourcePlugin: 'Starfield.esm' }
    : row)
  assert.throws(
    () => validateCommittedCrosswalk(
      serializeCsv(PROVENANCE_HEADERS, result.provenance),
      serializeCsv(UNRESOLVED_HEADERS, changed),
      targets,
    ),
    /resource:x-tech field RecordSourcePlugin expected/,
  )
})

test('committed validation checks project-owned C3 system shape without inventing STDT identity', () => {
  const systemTarget = {
    entityKind: 'system', entityId: '71456', canonicalEnglish: 'Alpha Centauri',
    bodies: [{ recordSourcePlugin: 'Starfield.esm', recordFormId: '0003F5A1', recordSignature: 'PNDT' }],
  }
  const row = {
    EntityKind: 'system', EntityId: '71456', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0005E60A', RecordSignature: 'STDT',
    NameFieldPath: SEMANTIC_PATHS.TES_FULL_NAME, NameSourcePlugin: 'Starfield.esm',
    NameStringTable: 'strings', NameStringID: '0000A9D0', CanonicalEnglish: 'Alpha Centauri',
  }
  assert.equal(validateCommittedCrosswalk(
    serializeCsv(PROVENANCE_HEADERS, [row]), serializeCsv(UNRESOLVED_HEADERS, []), [systemTarget],
  ).provenance.length, 1)
  assert.throws(() => validateCommittedCrosswalk(
    serializeCsv(PROVENANCE_HEADERS, [{ ...row, RecordSignature: 'PNDT' }]),
    serializeCsv(UNRESOLVED_HEADERS, []), [systemTarget],
  ), /system:71456 field RecordSignature expected/)
})
