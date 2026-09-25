import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildStarSystemTargets, extractPndtSystemNumber, extractStdtSystemNumber,
  generateSystemProvenance, indexStdtBySystemNumber, OFFICIAL_SYSTEM_PLUGINS,
} from './star-system-provenance.mjs'
import { buildNameNormalizationPolicy, NAME_NORMALIZATIONS, validateNameNormalizations } from './name-normalization-policy.mjs'

function bytes32(value) {
  const data = Buffer.alloc(4)
  data.writeUInt32LE(value >>> 0)
  return data
}

function subrecord(signature, data) {
  return { signature, size: data.length, data }
}

function fixtureRecord(signature, formId, subrecords) {
  return { signature, formId, formIdHex: formId.toString(16).toUpperCase().padStart(8, '0'), subrecords }
}

function pndt(formId, systemNumber, extra = []) {
  const tuple = Buffer.alloc(12)
  tuple.writeUInt32LE(systemNumber)
  return fixtureRecord('PNDT', formId, [subrecord('GNAM', bytes32(0x3F000000)), subrecord('GNAM', tuple), ...extra])
}

function stdt(formId, systemNumber, stringId, name = 'Fixture') {
  return fixtureRecord('STDT', formId, [
    subrecord('DNAM', bytes32(systemNumber)),
    subrecord('FULL', bytes32(0xDEADBEEF)),
    subrecord('BFCB', Buffer.from('TESFullName_Component\0')),
    subrecord('FULL', bytes32(stringId)),
    subrecord('BFCE', Buffer.alloc(0)),
    subrecord('ANAM', Buffer.from(`${name}\0`)),
  ])
}

function recordsByPlugin(entries) {
  const result = new Map()
  for (const [plugin, records] of Object.entries(entries)) {
    result.set(plugin, new Map(records.map((record) => [`${record.signature}:${record.formIdHex}`, record])))
  }
  return result
}

function starRecords(entries) {
  return new Map(OFFICIAL_SYSTEM_PLUGINS.map((plugin) => [plugin, entries[plugin] ?? []]))
}

test('extracts only the audited 12-byte PNDT.GNAM system tuple', () => {
  assert.equal(extractPndtSystemNumber(pndt(1, 71456)), 71456)
  assert.throws(() => extractPndtSystemNumber(fixtureRecord('PNDT', 1, [])), (error) => error.code === 'SYSTEM_NUMBER_MISSING')
  assert.throws(() => extractPndtSystemNumber(fixtureRecord('PNDT', 1, [subrecord('GNAM', Buffer.alloc(8))])), (error) => error.code === 'UNSUPPORTED_RECORD_SHAPE')
  const duplicate = Buffer.alloc(12)
  assert.throws(() => extractPndtSystemNumber(pndt(1, 71456, [subrecord('GNAM', duplicate)])), (error) => error.code === 'UNSUPPORTED_RECORD_SHAPE')
})

test('matches STDT records only by exact numeric DNAM', () => {
  const one = stdt(0x5E60A, 71456, 0xA9D0, 'Alpha Centauri')
  const unrelated = stdt(2, 99999, 2)
  const index = indexStdtBySystemNumber(starRecords({ 'Starfield.esm': [unrelated, one] }))
  assert.equal(extractStdtSystemNumber(one), 71456)
  assert.deepEqual(index.get(71456).map((item) => item.record.formIdHex), ['0005E60A'])
  assert.equal(index.has(12345), false)

  const duplicate = indexStdtBySystemNumber(starRecords({
    'Starfield.esm': [one], 'ShatteredSpace.esm': [stdt(3, 71456, 3)],
  }))
  assert.equal(duplicate.get(71456).length, 2)
})

test('deduplicates canonical body rows into one stable system target', () => {
  const csv = [
    'SourceFile,PlanetFormID,StarSystemID,SystemName',
    'Starfield.esm,00000002,71456,Alpha Centauri',
    'Starfield.esm,00000001,71456,Alpha Centauri',
    'Starfield.esm,00000001,71456,Alpha Centauri',
    'ShatteredSpace.esm,01000003,119226,Kavnyk',
  ].join('\n')
  const result = buildStarSystemTargets(csv)
  assert.equal(result.statistics.bodyRows, 4)
  assert.equal(result.statistics.uniqueBodies, 3)
  assert.equal(result.statistics.canonicalSystems, 2)
  assert.deepEqual(result.targets.find((item) => item.entityId === '71456').bodies.map((body) => body.recordFormId), ['00000001', '00000002'])
})

test('resolves agreeing bodies once and locks the Alpha Centauri numeric proof', () => {
  const target = {
    entityKind: 'system', entityId: '71456', canonicalEnglish: 'Alpha Centauri',
    bodies: [
      { recordSourcePlugin: 'Starfield.esm', recordFormId: '00000001', recordSignature: 'PNDT' },
      { recordSourcePlugin: 'Starfield.esm', recordFormId: '00000002', recordSignature: 'PNDT' },
    ],
  }
  const pndts = recordsByPlugin({ 'Starfield.esm': [pndt(1, 71456), pndt(2, 71456)] })
  const stars = starRecords({ 'Starfield.esm': [stdt(0x5E60A, 71456, 0xA9D0, 'Alpha Centauri')] })
  const tables = new Map([['Starfield.esm:strings', new Map([[0xA9D0, 'Alpha Centauri']])]])
  const result = generateSystemProvenance([target], pndts, stars, tables)
  assert.equal(result.unresolved.length, 0)
  assert.deepEqual(result.provenance[0], {
    EntityKind: 'system', EntityId: '71456', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0005E60A', RecordSignature: 'STDT',
    NameFieldPath: 'baseFormComponents.TESFullName_Component.fullName.FULL', NameSourcePlugin: 'Starfield.esm',
    NameStringTable: 'strings', NameStringID: '0000A9D0', CanonicalEnglish: 'Alpha Centauri',
  })
})

test('classifies conflicts, zero STDT matches, duplicate matches, and English mismatch', () => {
  const target = {
    entityKind: 'system', entityId: '1', canonicalEnglish: 'Expected', bodies: [
      { recordSourcePlugin: 'Starfield.esm', recordFormId: '00000001', recordSignature: 'PNDT' },
      { recordSourcePlugin: 'Starfield.esm', recordFormId: '00000002', recordSignature: 'PNDT' },
    ],
  }
  const conflict = recordsByPlugin({ 'Starfield.esm': [pndt(1, 10), pndt(2, 11)] })
  assert.equal(generateSystemProvenance([target], conflict, starRecords({}), new Map()).unresolved[0].ReasonCode, 'SYSTEM_NUMBER_CONFLICT')

  const agreeing = recordsByPlugin({ 'Starfield.esm': [pndt(1, 10), pndt(2, 10)] })
  assert.equal(generateSystemProvenance([target], agreeing, starRecords({}), new Map()).unresolved[0].ReasonCode, 'SYSTEM_STDT_NOT_FOUND')
  const duplicate = starRecords({ 'Starfield.esm': [stdt(3, 10, 3)], 'ShatteredSpace.esm': [stdt(4, 10, 4)] })
  assert.equal(generateSystemProvenance([target], agreeing, duplicate, new Map()).unresolved[0].ReasonCode, 'SYSTEM_STDT_AMBIGUOUS')
  const single = starRecords({ 'ShatteredSpace.esm': [stdt(4, 10, 4)] })
  const mismatch = new Map([['ShatteredSpace.esm:strings', new Map([[4, 'Different']])]])
  assert.equal(generateSystemProvenance([target], agreeing, single, mismatch).unresolved[0].ReasonCode, 'SYSTEM_NAME_MISMATCH')
})

test('base and Shattered Space systems share one pipeline; zero-target plugins are valid', () => {
  const targets = [
    { entityKind: 'system', entityId: '1', canonicalEnglish: 'Base', bodies: [{ recordSourcePlugin: 'Starfield.esm', recordFormId: '00000001', recordSignature: 'PNDT' }] },
    { entityKind: 'system', entityId: '2', canonicalEnglish: 'DLC', bodies: [{ recordSourcePlugin: 'ShatteredSpace.esm', recordFormId: '01000002', recordSignature: 'PNDT' }] },
  ]
  const pndts = recordsByPlugin({ 'Starfield.esm': [pndt(1, 1)], 'ShatteredSpace.esm': [pndt(0x1000002, 2)] })
  const stars = starRecords({ 'Starfield.esm': [stdt(3, 1, 11)], 'ShatteredSpace.esm': [stdt(0x1000004, 2, 12)] })
  const tables = new Map([
    ['Starfield.esm:strings', new Map([[11, 'Base']])],
    ['ShatteredSpace.esm:strings', new Map([[12, 'DLC']])],
  ])
  const result = generateSystemProvenance(targets, pndts, stars, tables)
  assert.equal(result.provenance.length, 2)
  assert.equal(result.unresolved.length, 0)
  assert.equal(stars.get('SFBGS00D.esm').length, 0)
})

test('approves only the exact system:0 SOL to Sol source/display normalization', () => {
  const policy = buildNameNormalizationPolicy()
  const systemNormalizations = NAME_NORMALIZATIONS.filter((entry) => entry.entityKind === 'system')
  const target = {
    entityKind: 'system', entityId: '0', canonicalEnglish: 'SOL',
    bodies: [{ recordSourcePlugin: 'Starfield.esm', recordFormId: '00000001', recordSignature: 'PNDT' }],
  }
  const pndts = recordsByPlugin({ 'Starfield.esm': [pndt(1, 0)] })
  const stars = starRecords({ 'Starfield.esm': [stdt(0x5E5CB, 0, 0xA9FD, 'Sol')] })
  const result = generateSystemProvenance(
    [target], pndts, stars, new Map([['Starfield.esm:strings', new Map([[0xA9FD, 'Sol']])]]), policy,
  )
  assert.equal(result.provenance.length, 1)
  assert.equal(result.unresolved.length, 0)
  assert.deepEqual(result.normalizations.map((item) => [item.EntityKind, item.EntityId, item.ExpectedSourceEnglish, item.ExpectedLocalizedEnglish, item.ReasonCode]), [
    ['system', '0', 'SOL', 'Sol', 'TRACKER_NORMALIZATION'],
  ])
  assert.equal(validateNameNormalizations(systemNormalizations, [target], result.provenance, result.unresolved, result.normalizations), 1)
  assert.throws(
    () => validateNameNormalizations(
      systemNormalizations, [target], result.provenance, result.unresolved,
      result.normalizations.map((item) => ({ ...item, ExpectedLocalizedEnglish: 'Sun' })),
    ),
    /does not exactly match/,
  )

  const wrongLocalized = generateSystemProvenance(
    [target], pndts, stars, new Map([['Starfield.esm:strings', new Map([[0xA9FD, 'Sun']])]]), policy,
  )
  assert.equal(wrongLocalized.unresolved[0].ReasonCode, 'SYSTEM_NAME_MISMATCH')

  const wrongEntity = { ...target, entityId: '1' }
  const wrongEntityResult = generateSystemProvenance(
    [wrongEntity], pndts, stars, new Map([['Starfield.esm:strings', new Map([[0xA9FD, 'Sol']])]]), policy,
  )
  assert.equal(wrongEntityResult.unresolved[0].ReasonCode, 'SYSTEM_NAME_MISMATCH')

  const genericCaseMismatch = { ...target, entityId: '2', canonicalEnglish: 'FOO' }
  const genericResult = generateSystemProvenance(
    [genericCaseMismatch], pndts, stars, new Map([['Starfield.esm:strings', new Map([[0xA9FD, 'Foo']])]]), policy,
  )
  assert.equal(genericResult.unresolved[0].ReasonCode, 'SYSTEM_NAME_MISMATCH')
})

test('normalization validation rejects canonical source drift', () => {
  const target = { entityKind: 'system', entityId: '0', canonicalEnglish: 'Sol' }
  assert.throws(
    () => validateNameNormalizations(NAME_NORMALIZATIONS, [target], [{ EntityKind: 'system', EntityId: '0' }], []),
    /expected source "SOL" but canonical source is "Sol"/,
  )
})
