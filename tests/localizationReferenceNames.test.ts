import assert from 'node:assert/strict'
import test from 'node:test'

import { jaJPReferenceNames } from '../src/localization/generated/ja-JP-reference-names.ts'
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
