import assert from 'node:assert/strict'
import test from 'node:test'

import { jaJPReferenceNames } from '../src/localization/generated/ja-JP-reference-names.ts'
import { frFRReferenceNames } from '../src/localization/generated/fr-FR-reference-names.ts'
import { deDEReferenceNames } from '../src/localization/generated/de-DE-reference-names.ts'
import { esESReferenceNames } from '../src/localization/generated/es-ES-reference-names.ts'
import { itITReferenceNames } from '../src/localization/generated/it-IT-reference-names.ts'
import { ptBRReferenceNames } from '../src/localization/generated/pt-BR-reference-names.ts'
import { plPLReferenceNames } from '../src/localization/generated/pl-PL-reference-names.ts'
import { zhHANSReferenceNames } from '../src/localization/generated/zh-Hans-reference-names.ts'
import { getSkillDisplayName, officialTermBySkill } from '../src/localization/officialTerms.ts'
import { getReferenceDisplayName } from '../src/localization/referenceNames.ts'

test('generated Japanese reference-name module imports with representative official values', () => {
  assert.equal(jaJPReferenceNames.resource.aluminium, 'アルミニウム')
  assert.equal(jaJPReferenceNames.resource['x-tech'], 'X-テック')
  assert.equal(jaJPReferenceNames.resource.adhesive, '接着剤')
  assert.equal(jaJPReferenceNames.resource['gastronomic-delight'], '美食の喜び')
  assert.equal(jaJPReferenceNames.product['adaptive-frame'], '順応型フレーム')
  assert.equal(jaJPReferenceNames.system['119226'], 'カヴニク')
  assert.equal(jaJPReferenceNames.body['01000801'], 'ヴァルーン・カイ')
  assert.equal(jaJPReferenceNames.body['0005E364'], 'ムフリドIV')
  assert.equal(jaJPReferenceNames.biome['01012244'], '岩石砂漠')
  assert.equal(jaJPReferenceNames.species['01039BE3'], 'ヘイルポッド')
  assert.equal(jaJPReferenceNames.species['00170A43'], '小型のシルバーフィッシュ')
  assert.equal(jaJPReferenceNames.species['0008D0D8'], 'グリロバハンター')
  assert.equal(jaJPReferenceNames.species['000065E6'], '遊牧の グロウバック スカベンジャー')
  assert.equal(jaJPReferenceNames['official-term']['skill.outpost-management'], '拠点管理')
})

test('generated Polish reference-name module preserves representative official values', () => {
  assert.equal(plPLReferenceNames.resource.aluminium, 'Glin')
  assert.equal(plPLReferenceNames.resource['x-tech'], 'X-Tech')
  assert.equal(plPLReferenceNames.product['adaptive-frame'], 'Panel adaptatywny')
  assert.equal(plPLReferenceNames.species['00048A34'], 'Drapież. Papugosokół')
  assert.equal(plPLReferenceNames.species['0019B89C'], 'Trzodn. Kosigłów Roślinożerca')
  assert.equal(plPLReferenceNames['official-term']['skill.outpost-management'], 'Zarządzanie placówką')
})

test('generated Simplified Chinese reference-name module preserves official literals', () => {
  assert.equal(zhHANSReferenceNames.resource['x-tech'], 'X技术')
  assert.equal(zhHANSReferenceNames.resource['helium-3'], '氦-3')
  assert.equal(zhHANSReferenceNames.system['119224'], '天狼星-B')
  assert.equal(zhHANSReferenceNames.body['000116C1'], '_RL082Orbital')
  assert.equal(zhHANSReferenceNames.species['0019B899'], '卡拉蜗 [食腐动物]')
  assert.equal(zhHANSReferenceNames.species['0019B89C'], '[畜牧] 绞刀 [食草动物]')
  assert.equal(zhHANSReferenceNames.species['00048A34'], '[顶级掠食者] 鹦鹉鹰')
  assert.equal(zhHANSReferenceNames['official-term']['skill.outpost-management'], '哨站管理')
})

test('Polish reference corpus retains official punctuation and has no new search-fold collisions', () => {
  const allValues = Object.values(plPLReferenceNames).flatMap((names) => Object.values(names))
  const lowerCorpus = allValues.join('').toLocaleLowerCase('pl-PL')
  for (const letter of ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż']) assert.match(lowerCorpus, new RegExp(letter))
  assert.equal(allValues.filter((value) => value.includes("'")).length, 3)
  assert.equal(allValues.filter((value) => value.includes('-')).length, 902)
  assert.equal(allValues.filter((value) => /[‘’‐‑‒–—―]/u.test(value)).length, 0)

  const searchable = [...Object.values(plPLReferenceNames.resource), ...Object.values(plPLReferenceNames.product)]
  const collisionCount = (normalize: (value: string) => string) => {
    const originalsByFold = new Map<string, string[]>()
    for (const value of searchable) originalsByFold.set(normalize(value), [...(originalsByFold.get(normalize(value)) ?? []), value])
    return [...originalsByFold.values()].filter((values) =>
      new Set(values.map((value) => value.toLocaleLowerCase('pl-PL').normalize('NFC'))).size > 1).length
  }
  const nfdFold = (value: string) => value.toLocaleLowerCase('pl-PL').normalize('NFD').replace(/\p{M}/gu, '')
  assert.equal(collisionCount(nfdFold), 0)
  assert.equal(collisionCount((value) => nfdFold(value).replaceAll('ł', 'l')), 0)
})

test('runtime lookup registers representative Japanese reference-name families', () => {
  const cases = [
    ['resource', 'aluminium', 'Aluminum', 'アルミニウム'],
    ['resource', 'x-tech', 'X-Tech', 'X-テック'],
    ['resource', 'gastronomic-delight', 'Gastronomic Delight', '美食の喜び'],
    ['product', 'adaptive-frame', 'Adaptive Frame', '順応型フレーム'],
    ['system', '119226', 'Kavnyk', 'カヴニク'],
    ['body', '01000801', "Va'ruun'kai", 'ヴァルーン・カイ'],
    ['body', '0005E364', 'Muphrid IV', 'ムフリドIV'],
    ['biome', '01012244', 'Rocky Desert', '岩石砂漠'],
    ['species', '01039BE3', 'Hailpod', 'ヘイルポッド'],
    ['species', '0008D0D8', 'Grylloba Hunter', 'グリロバハンター'],
    ['species', '000065E6', 'Flocking Glowback Scavenger', '遊牧の グロウバック スカベンジャー'],
    ['official-term', 'skill.outpost-management', 'Outpost Management', '拠点管理'],
  ] as const

  for (const [kind, id, canonical, japanese] of cases) {
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'ja-JP'), japanese)
  }
})

test('runtime lookup registers complete French and German reference-name overlays', () => {
  const cases = [
    ['resource', 'aluminium', 'Aluminum', frFRReferenceNames.resource.aluminium, deDEReferenceNames.resource.aluminium],
    ['product', 'adaptive-frame', 'Adaptive Frame', frFRReferenceNames.product['adaptive-frame'], deDEReferenceNames.product['adaptive-frame']],
    ['system', '119226', 'Kavnyk', frFRReferenceNames.system['119226'], deDEReferenceNames.system['119226']],
    ['body', '01000801', "Va'ruun'kai", frFRReferenceNames.body['01000801'], deDEReferenceNames.body['01000801']],
    ['biome', '01012244', 'Rocky Desert', frFRReferenceNames.biome['01012244'], deDEReferenceNames.biome['01012244']],
    ['species', '01039BE3', 'Hailpod', frFRReferenceNames.species['01039BE3'], deDEReferenceNames.species['01039BE3']],
    ['official-term', 'skill.outpost-management', 'Outpost Management', frFRReferenceNames['official-term']['skill.outpost-management'], deDEReferenceNames['official-term']['skill.outpost-management']],
  ] as const

  for (const [kind, id, canonical, french, german] of cases) {
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'fr-FR'), french)
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'de-DE'), german)
  }
})

test('runtime lookup registers complete Spanish, Italian, and Brazilian Portuguese overlays', () => {
  const cases = [
    ['resource', 'aluminium', 'Aluminum', esESReferenceNames.resource.aluminium, itITReferenceNames.resource.aluminium, ptBRReferenceNames.resource.aluminium],
    ['product', 'adaptive-frame', 'Adaptive Frame', esESReferenceNames.product['adaptive-frame'], itITReferenceNames.product['adaptive-frame'], ptBRReferenceNames.product['adaptive-frame']],
    ['system', '119226', 'Kavnyk', esESReferenceNames.system['119226'], itITReferenceNames.system['119226'], ptBRReferenceNames.system['119226']],
    ['body', '01000801', "Va'ruun'kai", esESReferenceNames.body['01000801'], itITReferenceNames.body['01000801'], ptBRReferenceNames.body['01000801']],
    ['biome', '01012244', 'Rocky Desert', esESReferenceNames.biome['01012244'], itITReferenceNames.biome['01012244'], ptBRReferenceNames.biome['01012244']],
    ['species', '01039BE3', 'Hailpod', esESReferenceNames.species['01039BE3'], itITReferenceNames.species['01039BE3'], ptBRReferenceNames.species['01039BE3']],
    ['official-term', 'skill.outpost-management', 'Outpost Management', esESReferenceNames['official-term']['skill.outpost-management'], itITReferenceNames['official-term']['skill.outpost-management'], ptBRReferenceNames['official-term']['skill.outpost-management']],
  ] as const

  for (const [kind, id, canonical, spanish, italian, portuguese] of cases) {
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'es-ES'), spanish)
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'it-IT'), italian)
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'pt-BR'), portuguese)
  }
})

test('runtime lookup registers representative Polish reference-name families', () => {
  for (const [kind, id, canonical, polish] of [
    ['resource', 'aluminium', 'Aluminum', plPLReferenceNames.resource.aluminium],
    ['product', 'adaptive-frame', 'Adaptive Frame', plPLReferenceNames.product['adaptive-frame']],
    ['system', '119226', 'Kavnyk', plPLReferenceNames.system['119226']],
    ['body', '01000801', "Va'ruun'kai", plPLReferenceNames.body['01000801']],
    ['biome', '01012244', 'Rocky Desert', plPLReferenceNames.biome['01012244']],
    ['species', '01039BE3', 'Hailpod', plPLReferenceNames.species['01039BE3']],
    ['official-term', 'skill.outpost-management', 'Outpost Management', plPLReferenceNames['official-term']['skill.outpost-management']],
  ] as const) {
    assert.equal(getReferenceDisplayName(kind, id, canonical, 'pl-PL'), polish)
  }
})

test('English overlays and missing Japanese fallbacks remain intact', () => {
  assert.equal(getReferenceDisplayName('resource', 'aluminium', 'Aluminum', 'en-US'), 'Aluminum')
  assert.equal(getReferenceDisplayName('resource', 'aluminium', 'Aluminum', 'en-GB'), 'Aluminium')
  assert.equal(getReferenceDisplayName('resource', 'aluminium', 'Aluminum', 'ja-JP'), 'アルミニウム')
  assert.equal(getReferenceDisplayName('resource', 'missing', 'Canonical English', 'ja-JP'), 'Canonical English')
  assert.equal(getReferenceDisplayName('resource', 'missing-id', undefined, 'ja-JP'), 'missing-id')
})

test('all character skills map to official-term IDs and canonical English fallbacks', () => {
  assert.deepEqual(officialTermBySkill, {
    outpostManagement: {
      id: 'skill.outpost-management', messageKey: 'character.skill.outpostManagement',
    },
    outpostEngineering: {
      id: 'skill.outpost-engineering', messageKey: 'character.skill.outpostEngineering',
    },
    planetaryHabitation: {
      id: 'skill.planetary-habitation', messageKey: 'character.skill.planetaryHabitation',
    },
    researchMethods: {
      id: 'skill.research-methods', messageKey: 'character.skill.researchMethods',
    },
    specialProjects: {
      id: 'skill.special-projects', messageKey: 'character.skill.specialProjects',
    },
  })
  assert.deepEqual(
    Object.keys(officialTermBySkill).map((skill) =>
      getSkillDisplayName(skill as keyof typeof officialTermBySkill, 'ja-JP')),
    ['拠点管理', '拠点エンジニアリング', '惑星居住', '研究手法', '特別プロジェクト'],
  )
  assert.equal(getSkillDisplayName('outpostEngineering', 'en-US'), 'Outpost Engineering')
  assert.doesNotMatch(JSON.stringify(officialTermBySkill), /[0-9A-F]{8}/)
})
