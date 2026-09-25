import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assembleComposedName, buildComposedFaunaRoleRules, collectEffectiveKeywordIds,
  ComposedFaunaError, generateComposedFaunaProvenance,
} from './composed-fauna-provenance.mjs'

function bytes32(value) { const data = Buffer.alloc(4); data.writeUInt32LE(value); return data }
function subrecord(signature, data = Buffer.alloc(0)) { return { signature, size: data.length, data } }
function record(signature, formIdHex, subrecords = []) { return { signature, formIdHex, subrecords } }
function provider(plugin, value) { return { plugin, record: value } }
function kwda(...ids) { return subrecord('KWDA', Buffer.concat(ids.map(bytes32))) }
function obts(...ids) {
  const data = Buffer.alloc(18 + ids.length * 7)
  data.writeUInt32LE(ids.length)
  ids.forEach((id, index) => data.writeUInt32LE(id, 18 + index * 7))
  return subrecord('OBTS', data)
}
function omodData(includes, keywords) {
  const data = Buffer.alloc(48 + includes.length * 7 + keywords.length * 24)
  data.writeUInt32LE(includes.length, 0)
  data.writeUInt32LE(keywords.length, 4)
  data.writeUInt32LE(20, 10)
  data.write('TESNPC_InstanceData', 14, 'utf8')
  includes.forEach((id, index) => data.writeUInt32LE(id, 48 + index * 7))
  const start = 48 + includes.length * 7
  keywords.forEach((id, index) => { data.write('NKEY', start + index * 24 + 8, 'ascii'); data.writeUInt32LE(id, start + index * 24 + 12) })
  return subrecord('DATA', data)
}
function rule(stringId, keywordIds, ynam = 5) {
  const priority = Buffer.alloc(2); priority.writeUInt16LE(ynam)
  return [subrecord('WNAM', bytes32(stringId)), subrecord('KSIZ', bytes32(keywordIds.length)), kwda(...keywordIds), subrecord('YNAM', priority)]
}
function ruleSet(...rules) { return [subrecord('VNAM', bytes32(rules.length)), ...rules.flat()] }
function innr(formId, edid, sets) { return record('INNR', formId, [subrecord('EDID', Buffer.from(`${edid}\0`)), ...sets.flat()]) }

function fixture(zeroPrefix = false) {
  const prefix = provider('Starfield.esm', innr('00220394', 'dn_CCTPrefixes', [ruleSet(rule(zeroPrefix ? 0 : 100, [1]))]))
  const suffix = provider('Starfield.esm', innr('003E8650', 'dn_CCTSuffixes', [ruleSet(rule(200, [2])), ruleSet(rule(300, [3]))]))
  const records = new Map([
    ['INNR:00220394', prefix], ['INNR:003E8650', suffix],
    ['OMOD:00000010', provider('Starfield.esm', record('OMOD', '00000010', [omodData([0x11, 0x11], [1, 2])]))],
    ['OMOD:00000011', provider('Starfield.esm', record('OMOD', '00000011', [omodData([0x10], [3])]))],
    ['OMOD:00000012', provider('Starfield.esm', record('OMOD', '00000012', [omodData([], [3])]))],
  ])
  const chains = new Map([['INNR:00220394', [prefix]], ['INNR:003E8650', [suffix]]])
  const canonical = new Map([
    ['Starfield.esm:NPC_:00000001', provider('Starfield.esm', record('NPC_', '00000001', [obts(0x10)]))],
    ['Starfield.esm:NPC_:00000002', provider('Starfield.esm', record('NPC_', '00000002', [kwda(2), obts(0x12)]))],
    ['ShatteredSpace.esm:NPC_:01000003', provider('ShatteredSpace.esm', record('NPC_', '01000003', [kwda(1, 2), obts()]))],
  ])
  const tables = new Map([
    ['Starfield.esm:en:strings', new Map([[100, 'Herding'], [200, 'Dodo'], [300, 'Scavenger']])],
    ['Starfield.esm:ja:strings', new Map([[100, '遊牧の'], [200, 'ドードー'], [300, 'スカベンジャー']])],
  ])
  return { prefix, suffix, records, chains, canonical, tables }
}

test('maps the two audited INNR records and rulesets to fixed semantic roles', () => {
  const { records, chains } = fixture()
  const roles = buildComposedFaunaRoleRules(records, chains)
  assert.deepEqual(Object.fromEntries(Object.entries(roles).map(([role, value]) => [role, [value.order, value.ruleSetIndex, value.provider.record.formIdHex]])), {
    prefix: [0, 0, '00220394'], species: [1, 0, '003E8650'], diet: [2, 1, '003E8650'],
  })
})

test('effective keywords include native and recursive NKEY values with cycle/duplicate protection', () => {
  const { canonical, records } = fixture()
  const npc = canonical.get('Starfield.esm:NPC_:00000001').record
  const result = collectEffectiveKeywordIds(npc, ['00000010', '00000010'], records)
  assert.deepEqual(new Set(result.keywordIds), new Set(['00000001', '00000002', '00000003']))
  assert.deepEqual(result.visitedOmodIds, ['00000010', '00000011'])
  assert.equal(result.recursiveIncludeUsed, true)
})

test('emits fixed-slot component provenance and same-identity Japanese assembly for all shapes', () => {
  const { records, chains, canonical, tables } = fixture()
  const targets = [
    { EntityKind: 'fauna', EntityId: '00000001', SpeciesSourcePlugin: 'Starfield.esm', SpeciesFormID: '00000001', CanonicalEnglish: 'Herding Dodo Scavenger' },
    { EntityKind: 'fauna', EntityId: '00000002', SpeciesSourcePlugin: 'Starfield.esm', SpeciesFormID: '00000002', CanonicalEnglish: 'Dodo Scavenger' },
    { EntityKind: 'fauna', EntityId: '01000003', SpeciesSourcePlugin: 'ShatteredSpace.esm', SpeciesFormID: '01000003', CanonicalEnglish: 'Herding Dodo' },
  ]
  const result = generateComposedFaunaProvenance(targets, canonical, records, chains, tables, { enforceExpected: false })
  assert.deepEqual(result.provenance.filter((row) => row.EntityId === '00000002').map((row) => [row.ComponentOrder, row.ComponentRole]), [['1', 'species'], ['2', 'diet']])
  assert.deepEqual(result.provenance.filter((row) => row.EntityId === '01000003').map((row) => [row.RecordSourcePlugin, row.NameStringID]), [['Starfield.esm', '00000064'], ['Starfield.esm', '000000C8']])
  assert.equal(result.preview[0].JapanesePreview, '遊牧の ドードー スカベンジャー')
  assert.equal(result.statistics.exactEnglishMatches, 3)
})

test('assembly inserts one U+0020 only between present semantic components', () => {
  assert.equal(assembleComposedName([{ order: 1, value: 'Dodo' }, null, { order: 2, value: 'Grazer' }]), 'Dodo Grazer')
  assert.equal(assembleComposedName([{ order: 0, value: 'Apex' }, { order: 1, value: 'Parrothawk' }]), 'Apex Parrothawk')
})

test('a selected zero WNAM fails closed', () => {
  const { records, chains, canonical, tables } = fixture(true)
  const target = [{ EntityKind: 'fauna', EntityId: '00000001', SpeciesSourcePlugin: 'Starfield.esm', SpeciesFormID: '00000001', CanonicalEnglish: 'Herding Dodo Scavenger' }]
  assert.throws(
    () => generateComposedFaunaProvenance(target, canonical, records, chains, tables, { enforceExpected: false }),
    (error) => error instanceof ComposedFaunaError && error.code === 'COMPOSED_FAUNA_WNAM_ZERO',
  )
})
