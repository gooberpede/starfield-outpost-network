import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildC2Targets, generateProvenance, PROVENANCE_HEADERS, serializeCsv,
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
    itemMetadata: 'ItemType,ItemFormID,ItemId\nproduct,00000002,adaptive-frame\norganic,00000003,fiber\n',
    recipes: 'ProductFormID,SourceFile,ProductName,IngredientFormID,IngredientSourceFile,IngredientName\n00000002,Starfield.esm,Adaptive Frame,00000001,Starfield.esm,Iron\n00000002,Starfield.esm,Adaptive Frame,00000003,Starfield.esm,Fiber\n',
    biomeInorganic: 'BiomeFormID,BiomeSourceFile,BiomeName\n00000004,Starfield.esm,Rocky Desert\n00000004,Starfield.esm,Rocky Desert\n',
    biomeOrganic: 'BiomeFormID,BiomeSourceFile,BiomeName\n00000004,Starfield.esm,Rocky Desert\n',
  }
  const result = buildC2Targets(sources)
  assert.equal(result.targets.filter((item) => item.entityId === 'adaptive-frame').length, 1)
  assert.equal(result.targets.filter((item) => item.entityKind === 'biome').length, 1)
  assert.equal(result.statistics.uniqueBiomes, 1)
  assert.equal(result.statistics.repeatedBiomeNameGroups, 0)
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
