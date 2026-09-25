import assert from 'node:assert/strict'
import test from 'node:test'

import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import { serializeCsv } from './localized-name-provenance.mjs'
import {
  buildOrganicTargets, COMPOSED_FAUNA_HANDOFF_HEADERS, extractObjectTemplateCombinations, extractOmodNamingRelationships,
  generateOrganicProvenance, ORGANIC_CLASSIFICATIONS, resolveCctClassification, selectInnrRule,
  TEMPLATE_LINEAGE_HEADERS, validateCommittedOrganicArtifacts,
} from './organic-provenance.mjs'

function bytes32(value) {
  const result = Buffer.alloc(4)
  result.writeUInt32LE(value >>> 0)
  return result
}

function subrecord(signature, data = Buffer.alloc(0)) { return { signature, size: data.length, data } }
function record(signature, id, subrecords = []) { return { signature, formIdHex: id, subrecords } }
function fullRecord(signature, id, stringId) { return record(signature, id, [subrecord('FULL', bytes32(stringId))]) }
function provider(plugin, value) { return { plugin, record: value } }

function obts(...omodIds) {
  const data = Buffer.alloc(18 + omodIds.length * 7)
  data.writeUInt32LE(omodIds.length)
  for (let index = 0; index < omodIds.length; index += 1) data.writeUInt32LE(omodIds[index], 18 + index * 7)
  return subrecord('OBTS', data)
}

function omodData(includes, keywordIds) {
  const data = Buffer.alloc(48 + includes.length * 7 + keywordIds.length * 24)
  data.writeUInt32LE(includes.length, 0)
  data.writeUInt32LE(keywordIds.length, 4)
  data.writeUInt32LE(20, 10)
  data.write('TESNPC_InstanceData', 14, 'utf8')
  for (let index = 0; index < includes.length; index += 1) data.writeUInt32LE(includes[index], 48 + index * 7)
  const start = 48 + includes.length * 7
  for (let index = 0; index < keywordIds.length; index += 1) {
    const offset = start + index * 24
    data.write('NKEY', offset + 8, 'ascii')
    data.writeUInt32LE(keywordIds[index], offset + 12)
  }
  return subrecord('DATA', data)
}

const csvHeader = 'SpeciesType,SpeciesFormID,SpeciesEditorID,SpeciesDisplayName,SpeciesSourceFile'

test('builds one canonical flora/fauna target per stable species identity', () => {
  const csv = [
    csvHeader,
    'Flora,00000001,FloraOne,Plant,Starfield.esm',
    'Flora,00000001,FloraOne,Plant,Starfield.esm',
    'Fauna,01000002,FaunaTwo,Animal,ShatteredSpace.esm',
  ].join('\n')
  const result = buildOrganicTargets(csv)
  assert.deepEqual(result.targets.map((item) => [item.entityKind, item.entityId, item.recordSignature]), [
    ['fauna', '01000002', 'NPC_'], ['flora', '00000001', 'FLOR'],
  ])
  assert.deepEqual(result.statistics, {
    organicOccurrenceRows: 3, uniqueFlora: 1, uniqueFauna: 1, uniqueOrganicSpecies: 2,
    duplicateOrganicOccurrencesCollapsed: 1, floraDuplicateOccurrencesCollapsed: 1, faunaDuplicateOccurrencesCollapsed: 0,
    organicSourcePluginCounts: { 'Starfield.esm': 1, 'ShatteredSpace.esm': 1, 'SFBGS00D.esm': 0 },
  })
})

test('decodes CCT combinations plus nested OMOD includes and keyword properties', () => {
  const npc = record('NPC_', '00000001', [obts(2)])
  const outer = record('OMOD', '00000002', [omodData([3], [4])])
  const inner = record('OMOD', '00000003', [omodData([2], [5])])
  assert.deepEqual(extractObjectTemplateCombinations(npc), [['00000002']])
  assert.deepEqual(extractOmodNamingRelationships(outer), { includes: ['00000003'], keywordIds: ['00000004'] })
  const records = new Map([
    ['OMOD:00000002', provider('Starfield.esm', outer)],
    ['OMOD:00000003', provider('Starfield.esm', inner)],
  ])
  const rules = { prefix: [], species: [{ ruleIndex: 0, stringId: 10, keywordIds: ['00000004', '00000005'], ynam: 1 }], diet: [] }
  assert.deepEqual(resolveCctClassification(npc, records, rules, new Map([[10, 'Nested Beast']])), {
    kind: 'composed', combinationCount: 1, name: 'Nested Beast',
  })
})

test('CCT selection uses specificity, then YNAM, then earliest rule', () => {
  const keywords = ['00000001', '00000002']
  const rules = [
    { ruleIndex: 0, keywordIds: ['00000001'], ynam: 99 },
    { ruleIndex: 1, keywordIds: ['00000001', '00000002'], ynam: 4 },
    { ruleIndex: 2, keywordIds: ['00000001', '00000002'], ynam: 5 },
    { ruleIndex: 3, keywordIds: ['00000001', '00000002'], ynam: 5 },
    { ruleIndex: 4, keywordIds: [], ynam: 500 },
  ]
  assert.equal(selectInnrRule(rules, keywords), rules[2])
})

test('native NPC keywords participate and a missing species suffix is not composed', () => {
  const kwda = Buffer.concat([bytes32(1)])
  const npc = record('NPC_', '00000001', [subrecord('KWDA', kwda), obts()])
  const speciesRule = { ruleIndex: 0, stringId: 10, keywordIds: ['00000001'], ynam: 1 }
  assert.equal(resolveCctClassification(npc, new Map(), { prefix: [], species: [speciesRule], diet: [] }, new Map([[10, 'Native Beast']])).kind, 'composed')
  assert.equal(resolveCctClassification(npc, new Map(), { prefix: [speciesRule], species: [], diet: [] }, new Map([[10, 'Prefix']])).kind, 'none')
})

test('different useful Object Template combinations are ambiguous and fail closed', () => {
  const npc = record('NPC_', '00000001', [obts(2), obts(3)])
  const records = new Map([
    ['OMOD:00000002', provider('Starfield.esm', record('OMOD', '00000002', [omodData([], [4])]))],
    ['OMOD:00000003', provider('Starfield.esm', record('OMOD', '00000003', [omodData([], [5])]))],
  ])
  const rules = { prefix: [], species: [
    { ruleIndex: 0, stringId: 10, keywordIds: ['00000004'], ynam: 1 },
    { ruleIndex: 1, stringId: 11, keywordIds: ['00000005'], ynam: 1 },
  ], diet: [] }
  assert.deepEqual(resolveCctClassification(npc, records, rules, new Map([[10, 'One'], [11, 'Two']])), {
    kind: 'ambiguous', combinationCount: 2, names: ['One', 'Two'],
  })
})

test('identical useful Object Template combination names remain one composed-fauna classification', () => {
  const npc = record('NPC_', '00000001', [obts(2), obts(3)])
  const records = new Map([
    ['OMOD:00000002', provider('Starfield.esm', record('OMOD', '00000002', [omodData([], [4])]))],
    ['OMOD:00000003', provider('Starfield.esm', record('OMOD', '00000003', [omodData([], [5])]))],
  ])
  const rules = { prefix: [], species: [
    { ruleIndex: 0, stringId: 10, keywordIds: ['00000004'], ynam: 1 },
    { ruleIndex: 1, stringId: 10, keywordIds: ['00000005'], ynam: 1 },
  ], diet: [] }
  assert.deepEqual(resolveCctClassification(npc, records, rules, new Map([[10, 'Same Beast']])), {
    kind: 'composed', combinationCount: 2, name: 'Same Beast',
  })
})

function target(kind, id, name, plugin = 'Starfield.esm') {
  return {
    entityKind: kind, entityId: id, canonicalEnglish: name, recordSourcePlugin: plugin,
    recordFormId: id, recordSignature: kind === 'flora' ? 'FLOR' : 'NPC_',
    semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, speciesEditorId: `${kind}Fixture`,
  }
}

test('direct FULL wins immediately and missing flora FULL is explicit', () => {
  const flora = target('flora', '00000001', 'Plant')
  const fauna = target('fauna', '00000002', 'Animal')
  const missing = target('flora', '00000003', 'Missing')
  const faunaRecord = record('NPC_', fauna.entityId, [subrecord('FULL', bytes32(2)), obts(9)])
  const canonical = new Map([
    ['Starfield.esm:FLOR:00000001', provider('Starfield.esm', fullRecord('FLOR', '00000001', 1))],
    ['Starfield.esm:NPC_:00000002', provider('Starfield.esm', faunaRecord)],
    ['Starfield.esm:FLOR:00000003', provider('Starfield.esm', record('FLOR', '00000003'))],
  ])
  const result = generateOrganicProvenance(
    [flora, fauna, missing], canonical, new Map(),
    new Map([['Starfield.esm:strings', new Map([[1, 'Plant'], [2, 'Animal']])]]),
    { prefix: [], species: [], diet: [] },
  )
  assert.deepEqual(result.classifications.map((item) => item.classification), [
    ORGANIC_CLASSIFICATIONS.DIRECT_FLORA, ORGANIC_CLASSIFICATIONS.DIRECT_FAUNA, ORGANIC_CLASSIFICATIONS.UNRESOLVED,
  ])
  assert.equal(result.unresolved[0].ReasonCode, 'ORGANIC_DIRECT_FULL_NOT_FOUND')
})

test('valid CCT composition defers to composed-fauna resolution before template fallback', () => {
  const item = target('fauna', '00000001', 'Composed Beast')
  const npc = record('NPC_', item.entityId, [subrecord('KWDA', bytes32(4)), obts(), subrecord('TPLT', bytes32(20))])
  const canonical = new Map([['Starfield.esm:NPC_:00000001', provider('Starfield.esm', npc)]])
  const result = generateOrganicProvenance(
    [item], canonical, new Map(), new Map([['Starfield.esm:strings', new Map([[10, 'Composed Beast']])]]),
    { prefix: [], species: [{ ruleIndex: 0, stringId: 10, keywordIds: ['00000004'], ynam: 1 }], diet: [] },
  )
  assert.equal(result.classifications[0].classification, ORGANIC_CLASSIFICATIONS.COMPOSED_FAUNA)
  assert.equal(result.unresolved[0].ReasonCode, 'DEFERRED_COMPOSED_FAUNA')
  assert.equal(result.handoff.length, 1)
})

function templateFixture(names) {
  const item = target('fauna', '00000001', names[0])
  const canonicalNpc = record('NPC_', item.entityId, [subrecord('TPLT', bytes32(20))])
  const lvlo = (npcId) => {
    const data = Buffer.alloc(12)
    data.writeUInt32LE(npcId, 4)
    return subrecord('LVLO', data)
  }
  const relationships = new Map([
    ['LVLN:00000014', provider('Starfield.esm', record('LVLN', '00000014', names.map((_, index) => lvlo(30 + index))))],
  ])
  names.forEach((name, index) => {
    relationships.set(`NPC_:${(30 + index).toString(16).toUpperCase().padStart(8, '0')}`, provider('Starfield.esm', record('NPC_', (30 + index).toString(16).toUpperCase().padStart(8, '0'), [subrecord('TPLT', bytes32(40 + index))])))
    relationships.set(`NPC_:${(40 + index).toString(16).toUpperCase().padStart(8, '0')}`, provider('Starfield.esm', fullRecord('NPC_', (40 + index).toString(16).toUpperCase().padStart(8, '0'), 50 + index)))
  })
  return {
    item,
    canonical: new Map([['Starfield.esm:NPC_:00000001', provider('Starfield.esm', canonicalNpc)]]),
    relationships,
    tables: new Map([['Starfield.esm:strings', new Map(names.map((name, index) => [50 + index, name]))]]),
  }
}

test('template fallback resolves one unique encounter FULL and records lineage', () => {
  const fixture = templateFixture(['Template Beast', 'Template Beast'])
  const result = generateOrganicProvenance(
    [{ ...fixture.item, canonicalEnglish: 'Template Beast' }], fixture.canonical, fixture.relationships,
    fixture.tables, { prefix: [], species: [], diet: [] },
  )
  assert.equal(result.classifications[0].classification, ORGANIC_CLASSIFICATIONS.TEMPLATE_FAUNA)
  assert.equal(result.provenance[0].DisplayNameSourceKind, 'template')
  assert.equal(result.provenance[0].RecordFormID, '00000028')
  assert.equal(result.lineage.length, 1)
})

test('template fallback rejects different encounter names and missing usable names', () => {
  const ambiguous = templateFixture(['One', 'Two'])
  assert.equal(generateOrganicProvenance(
    [ambiguous.item], ambiguous.canonical, ambiguous.relationships, ambiguous.tables,
    { prefix: [], species: [], diet: [] },
  ).unresolved[0].ReasonCode, 'FAUNA_TEMPLATE_NAME_AMBIGUOUS')
  const missing = templateFixture(['One'])
  missing.tables.get('Starfield.esm:strings').clear()
  assert.equal(generateOrganicProvenance(
    [missing.item], missing.canonical, missing.relationships, missing.tables,
    { prefix: [], species: [], diet: [] },
  ).unresolved[0].ReasonCode, 'FAUNA_TEMPLATE_NAME_NOT_FOUND')
})

test('committed validation locks composed-fauna handoff identity and template provider lineage', () => {
  const composed = target('fauna', '00000001', 'Composed')
  const template = target('fauna', '00000002', 'Template')
  const provenance = [{
    EntityKind: 'fauna', EntityId: template.entityId, DisplayNameSourceKind: 'template',
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '00000020',
  }]
  const unresolved = [{ EntityKind: 'fauna', EntityId: composed.entityId, ReasonCode: 'DEFERRED_COMPOSED_FAUNA' }]
  const handoff = [{
    EntityKind: 'fauna', EntityId: composed.entityId, SpeciesSourcePlugin: 'Starfield.esm',
    SpeciesFormID: composed.entityId, SpeciesEditorID: composed.speciesEditorId, CanonicalEnglish: composed.canonicalEnglish,
    Classification: ORGANIC_CLASSIFICATIONS.COMPOSED_FAUNA, Detail: 'Deferred',
    ObjectTemplateCombinationCount: '1', ResolvedCombinationName: composed.canonicalEnglish,
  }]
  const lineage = [{
    EntityKind: 'fauna', EntityId: template.entityId, CanonicalSourcePlugin: 'Starfield.esm',
    CanonicalNPCFormID: template.entityId, LeveledListSourcePlugin: 'Starfield.esm', LeveledListFormID: '00000010',
    LeveledNPCSourcePlugin: 'Starfield.esm', LeveledNPCFormID: '00000011',
    EncounterNPCSourcePlugin: 'Starfield.esm', EncounterNPCFormID: '00000020', CanonicalEnglish: template.canonicalEnglish,
  }]
  assert.equal(validateCommittedOrganicArtifacts(
    provenance, unresolved, serializeCsv(COMPOSED_FAUNA_HANDOFF_HEADERS, handoff),
    serializeCsv(TEMPLATE_LINEAGE_HEADERS, lineage), [composed, template],
  ).lineage.length, 1)
  assert.throws(() => validateCommittedOrganicArtifacts(
    provenance, unresolved, serializeCsv(COMPOSED_FAUNA_HANDOFF_HEADERS, [{ ...handoff[0], SpeciesEditorID: 'Drift' }]),
    serializeCsv(TEMPLATE_LINEAGE_HEADERS, lineage), [composed, template],
  ), /SpeciesEditorID/)
})
