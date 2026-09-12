import assert from 'node:assert/strict'
import test from 'node:test'

import { buildC4Targets } from './body-provenance.mjs'
import {
  generateProvenance, PROVENANCE_HEADERS, serializeCsv, UNRESOLVED_HEADERS, validateCommittedCrosswalk,
} from './localized-name-provenance.mjs'
import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import { buildNameNormalizationPolicy } from './name-normalization-policy.mjs'

function subrecord(signature, data) {
  return { signature, size: data.length, data }
}

function localizedId(value) {
  const data = Buffer.alloc(4)
  data.writeUInt32LE(value)
  return data
}

function pndt(formId, stringId, inlineName = 'Not provenance') {
  return {
    signature: 'PNDT', formIdHex: formId,
    subrecords: [
      subrecord('ANAM', Buffer.from(`${inlineName}\0`)),
      subrecord('BFCB', Buffer.from('TESFullName_Component\0')),
      subrecord('FULL', localizedId(stringId)),
      subrecord('BFCE', Buffer.alloc(0)),
    ],
  }
}

const header = 'SourceFile,PlanetFormID,PlanetName,BodyType,StarSystemID,SystemName'

test('includes every canonical Planet, Moon, and Orbital row without semantic filtering', () => {
  const csv = [
    header,
    'Starfield.esm,00000003,Orbital Target,Orbital,1,Fixture',
    'Starfield.esm,00000001,Planet Target,Planet,1,Fixture',
    'ShatteredSpace.esm,01000002,Moon Target,Moon,2,DLC Fixture',
  ].join('\n')
  const result = buildC4Targets(csv)
  assert.equal(result.statistics.canonicalBodies, 3)
  assert.deepEqual(result.statistics.bodyTypeCounts, { Planet: 1, Moon: 1, Orbital: 1 })
  assert.deepEqual(result.targets.map((target) => [target.entityId, target.bodyType]), [
    ['00000001', 'Planet'], ['00000003', 'Orbital'], ['01000002', 'Moon'],
  ])
  assert.ok(result.targets.every((target) => target.entityKind === 'body' && target.semanticPath === SEMANTIC_PATHS.TES_FULL_NAME))
})

test('resolves Planet, Moon, non-landable-like, and Orbital targets through the same PNDT FULL route', () => {
  const csv = [
    header,
    'Starfield.esm,0005E2B6,Akila,Planet,72432,Cheyenne',
    'Starfield.esm,00000002,Gas Giant,Planet,1,Fixture',
    'Starfield.esm,00000003,Non-landable Moon,Moon,1,Fixture',
    'Starfield.esm,00000004,The Den,Orbital,1,Fixture',
  ].join('\n')
  const { targets } = buildC4Targets(csv)
  const records = new Map([['Starfield.esm', new Map([
    ['PNDT:0005E2B6', pndt('0005E2B6', 0xA3B2, 'Akila inline')],
    ['PNDT:00000002', pndt('00000002', 2)],
    ['PNDT:00000003', pndt('00000003', 3)],
    ['PNDT:00000004', pndt('00000004', 4, 'The Den inline')],
    // A non-canonical ESM orbital cannot enter the result because it is absent from targets.
    ['PNDT:00000005', pndt('00000005', 5, 'Untracked Station')],
  ])]])
  const tables = new Map([['Starfield.esm:strings', new Map([
    [0xA3B2, 'Akila'], [2, 'Gas Giant'], [3, 'Non-landable Moon'], [4, 'The Den'], [5, 'Untracked Station'],
  ])]])
  const result = generateProvenance(targets, records, tables)
  assert.equal(result.unresolved.length, 0)
  assert.equal(result.provenance.length, 4)
  assert.equal(result.provenance.some((row) => row.EntityId === '00000005'), false)
  assert.deepEqual(result.provenance.find((row) => row.EntityId === '0005E2B6'), {
    EntityKind: 'body', EntityId: '0005E2B6', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0005E2B6', RecordSignature: 'PNDT',
    NameFieldPath: SEMANTIC_PATHS.TES_FULL_NAME, NameSourcePlugin: 'Starfield.esm',
    NameStringTable: 'strings', NameStringID: '0000A3B2', CanonicalEnglish: 'Akila',
  })
})

test('requires complete unique canonical body identities and supported source values', () => {
  assert.throws(() => buildC4Targets(`${header}\nStarfield.esm,00000001,One,Planet,1,A\nStarfield.esm,00000001,Two,Moon,1,A`), /duplicate body identity/)
  assert.throws(() => buildC4Targets(`${header}\nStarfield.esm,00000001,Station,Station,1,A`), /unsupported canonical body type/)
  assert.throws(() => buildC4Targets(`${header}\nMod.esm,00000001,Planet,Planet,1,A`), /unsupported body source plugin/)
})

test('approves only the exact entity-scoped orbital source/display difference', () => {
  const target = buildC4Targets(`${header}\nStarfield.esm,00223320,_TridentLuxuryLinesOrbital,Orbital,72432,Cheyenne`).targets[0]
  const records = new Map([['Starfield.esm', new Map([['PNDT:00223320', pndt('00223320', 0x2E08E)]])]])
  const policy = buildNameNormalizationPolicy()
  const exact = generateProvenance(
    [target], records,
    new Map([['Starfield.esm:strings', new Map([[0x2E08E, 'Trident Luxury Liners Staryard']])]]),
    policy,
  )
  assert.equal(exact.provenance.length, 1)
  assert.deepEqual(exact.normalizations.map((row) => [row.EntityKind, row.EntityId, row.ExpectedSourceEnglish, row.ExpectedLocalizedEnglish]), [
    ['body', '00223320', '_TridentLuxuryLinesOrbital', 'Trident Luxury Liners Staryard'],
  ])

  const wrongText = generateProvenance(
    [target], records,
    new Map([['Starfield.esm:strings', new Map([[0x2E08E, 'Trident Staryard']])]]),
    policy,
  )
  assert.equal(wrongText.unresolved[0].ReasonCode, 'CANONICAL_SOURCE_ERROR')

  const unapprovedEntity = { ...target, entityId: '00223321' }
  const wrongEntity = generateProvenance(
    [unapprovedEntity], records,
    new Map([['Starfield.esm:strings', new Map([[0x2E08E, 'Trident Luxury Liners Staryard']])]]),
    policy,
  )
  assert.equal(wrongEntity.unresolved[0].ReasonCode, 'CANONICAL_SOURCE_ERROR')
})

test('committed-data validation locks the complete direct PNDT body shape', () => {
  const target = buildC4Targets(`${header}\nShatteredSpace.esm,0102BA29,The Oracle,Orbital,119226,Kavnyk`).targets[0]
  const row = {
    EntityKind: 'body', EntityId: '0102BA29', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
    RecordSourcePlugin: 'ShatteredSpace.esm', RecordFormID: '0102BA29', RecordSignature: 'PNDT',
    NameFieldPath: SEMANTIC_PATHS.TES_FULL_NAME, NameSourcePlugin: 'ShatteredSpace.esm',
    NameStringTable: 'strings', NameStringID: '00000001', CanonicalEnglish: 'The Oracle',
  }
  assert.equal(validateCommittedCrosswalk(
    serializeCsv(PROVENANCE_HEADERS, [row]), serializeCsv(UNRESOLVED_HEADERS, []), [target],
  ).provenance.length, 1)
  assert.throws(() => validateCommittedCrosswalk(
    serializeCsv(PROVENANCE_HEADERS, [{ ...row, NameFieldPath: SEMANTIC_PATHS.TOP_LEVEL_FULL }]),
    serializeCsv(UNRESOLVED_HEADERS, []), [target],
  ), /field NameFieldPath/)
})
