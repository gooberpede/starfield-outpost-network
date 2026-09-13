import assert from 'node:assert/strict'
import test from 'node:test'

import { jaJPReferenceNames } from '../src/localization/generated/ja-JP-reference-names.ts'

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
