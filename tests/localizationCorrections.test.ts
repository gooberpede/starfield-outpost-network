import assert from 'node:assert/strict'
import test from 'node:test'

import { getBiomeButtonGroups } from '../src/domain/bodyResourceAvailability.ts'
import {
  getInvariantCargoPadLabel,
  renumberCargoPadLabels,
} from '../src/domain/cargoPadLabels.ts'
import type { CargoPad } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'
import { translate } from '../src/localization/catalog.ts'
import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import {
  getBiomeGroupDisplayName,
  getBodyBiomeDisplayName,
  type ReferenceNameResolver,
} from '../src/ui/biomePresentation.ts'
import { getHistoryDisplayLabel } from '../src/ui/historyPresentation.ts'
import { getValidationIssuePresentation } from '../src/ui/validationPresentation.ts'

function referenceFixture(): ReferenceData {
  return {
    systems: [],
    bodies: [],
    biomes: [{ id: 'stable-plains', name: 'Frozen Plains' }],
    bodyBiomes: [
      { id: 'body-plains-a', bodyId: 'body', biomeId: 'stable-plains', biomeIndex: 0 },
      { id: 'body-plains-b', bodyId: 'body', biomeId: 'stable-plains', biomeIndex: 1 },
    ],
    resources: [
      { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
      { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    ],
    products: [],
    bodyResources: [],
    inorganicOccurrences: [
      { bodyId: 'body', resourceId: 'iron', location: { type: 'biome', bodyBiomeId: 'body-plains-a' } },
      { bodyId: 'body', resourceId: 'copper', location: { type: 'biome', bodyBiomeId: 'body-plains-b' } },
    ],
    species: [],
    planetSpecies: [],
    organicOccurrences: [],
    organicFarmingProfiles: [],
    productRecipes: [],
  }
}

test('persisted cargo-pad labels remain invariant while ordinal presentation is localized', () => {
  assert.equal(getInvariantCargoPadLabel(0), 'Pad 1')
  assert.equal(getInvariantCargoPadLabel(1), 'Pad 2')
  const labelsByLocale = (['en-US', 'en-GB'] as const).map(() => [
    getInvariantCargoPadLabel(0),
    getInvariantCargoPadLabel(1),
  ])
  assert.deepEqual(labelsByLocale[0], labelsByLocale[1])

  const pads: CargoPad[] = [
    { id: 'second', label: 'Legacy B', type: 'regular', outboundItems: [] },
    { id: 'first', label: 'Legacy A', type: 'interstellar', outboundItems: [] },
  ]
  const beforeLocaleChange = structuredClone(pads)
  for (const locale of ['en-US', 'en-GB'] as const) {
    assert.equal(translate(locale, 'cargo.pad.summary', { ordinal: 1 }), 'Cargo Link 1')
    assert.deepEqual(pads, beforeLocaleChange)
  }

  const renumbered = renumberCargoPadLabels(pads)
  assert.deepEqual(renumbered.map(({ id, label }) => ({ id, label })), [
    { id: 'second', label: 'Pad 1' },
    { id: 'first', label: 'Pad 2' },
  ])
  assert.deepEqual(pads, beforeLocaleChange)
  assert.equal(
    getHistoryDisplayLabel({
      key: 'history.deleteCargoPad',
      parameters: { outpost: 'Home' },
      cargoPadOrdinalParameters: [{ parameter: 'pad', ordinal: 2 }],
    }, 'en-GB'),
    'Delete Home / Cargo Link 2',
  )
})

test('official Cargo Link presentation migration covers the intended 26 semantic keys', () => {
  const expected = {
    'cargo.heading': ['Cargo Links', '貨物リンク'],
    'cargo.add': ['Add cargo link', '貨物リンクを追加'],
    'cargo.addButton': ['+ Add Cargo Link', '＋ 貨物リンクを追加'],
    'cargo.addWithLimit': ['Add cargo link ({count} of {limit})', '貨物リンクを追加（{count}/{limit}）'],
    'cargo.reshuffle': ['Reshuffle cargo links', '貨物リンクを並べ替え'],
    'cargo.finishReshuffle': ['Finish reshuffling cargo links', '貨物リンクの並べ替えを完了'],
    'cargo.destination.pad': ['Destination cargo link', '搬送先の貨物リンク'],
    'cargo.destination.noPads': ['{outpost} — no cargo links', '{outpost} — 貨物リンクなし'],
    'cargo.destination.selectPad': ['Select cargo link...', '貨物リンクを選択...'],
    'cargo.destination.unknownPad': ['Unknown cargo link', '不明な貨物リンク'],
    'cargo.destination.unknownPadInline': ['unknown cargo link', '不明な貨物リンク'],
    'cargo.interSystem.context': ['Inter-System Cargo Links', '星系間貨物リンク'],
    'cargo.interstellar': ['Inter-System Cargo Link', '星系間貨物リンク'],
    'cargo.pad.summary': ['Cargo Link {ordinal}', '貨物リンク{ordinal}'],
    'cargo.pad.count': ['{count} {count, plural, one {cargo link} other {cargo links}}', '{count}件の貨物リンク'],
    'validation.context.pad': ['Cargo Link {ordinal}', '貨物リンク{ordinal}'],
    'help.interSystem': ['Inter-System Cargo Links can connect outposts in different star systems and require Helium-3.', '星系間貨物リンクは異なる星系の拠点同士を接続でき、He-3を必要とします。'],
    'status.import.invalidCargoPad': ['The selected file contains an invalid cargo link.', '選択したファイルに無効な貨物リンクが含まれています。'],
    'validation.cargoPadLinkedMultiple': ['This Cargo Link has more than one connection.', 'この貨物リンクには複数の接続が設定されています。'],
    'validation.cargoPadSkillLimit': ['This outpost has {count} cargo links, but the current {skill} level allows a maximum of {limit}.', 'この拠点の貨物リンク数は{count}ですが、現在の{skill}レベルでは最大{limit}です。'],
    'validation.duplicateOutboundItem': ["{item} appears more than once in this Cargo Link's outbound items.", '{item}がこの貨物リンクの搬出項目に複数回含まれています。'],
    'validation.interstellarHelium3': ['This Inter-System Cargo Link is sending cargo, but its outpost has no available Helium-3 supply.', 'この星系間貨物リンクは貨物を発送していますが、拠点で利用できるHe-3の供給がありません。'],
    'validation.missingCargoEndpoint': ['This cargo connection refers to a missing outpost or Cargo Link endpoint.', 'この貨物接続が、存在しない拠点または接続先の貨物リンクを参照しています。'],
    'validation.regularPadCrossSystem': ['This Cargo Link is connected to an outpost in another star system; use an Inter-System Cargo Link instead.', 'この貨物リンクは別の星系の拠点に接続されています。代わりに星系間貨物リンクを使用してください。'],
    'validation.selfLinkedCargoPad': ['This cargo connection uses the same Cargo Link at both endpoints.', 'この貨物接続では、両端に同じ貨物リンクが指定されています。'],
    'validation.unknownOutboundItem': ['This Cargo Link refers to unknown {kind} ID "{id}" in its outbound items.', 'この貨物リンクの搬出項目が不明な{kind} ID「{id}」を参照しています。'],
  } as const

  assert.equal(Object.keys(expected).length, 26)
  for (const [key, [english, japanese]] of Object.entries(expected)) {
    assert.equal(enUSMessages[key as keyof typeof enUSMessages], english, key)
    assert.equal(jaJPMessages[key as keyof typeof jaJPMessages], japanese, key)
  }
})

test('semantic catalogue values contain no retired cargo presentation wording', () => {
  for (const [key, value] of Object.entries(enUSMessages)) {
    assert.doesNotMatch(value, /cargo pads?|Cargo Pads?/, key)
    if (key.startsWith('cargo.') || key === 'validation.interstellarHelium3') {
      assert.doesNotMatch(value, /interstellar/i, key)
    }
  }
  for (const [key, value] of Object.entries(jaJPMessages)) {
    assert.doesNotMatch(value, /貨物パッド/, key)
  }
})

test('official Japanese semantic corrections retain contextual biome wording', () => {
  assert.equal(jaJPMessages['about.description'], 'スターフィールドの拠点ネットワークを記録・管理するツールです。')
  assert.match(jaJPMessages['validation.outpostNameLength'], /^スターフィールド/)
  assert.equal(jaJPMessages['character.skill.outpostEngineering'], '拠点エンジニアリング')
  assert.match(jaJPMessages['matrix.tooltip.xTech.add'], /X-テックパワーコア/)
  assert.equal(jaJPMessages['outpost.biomes.label'], 'バイオーム')
  assert.match(jaJPMessages['help.biomes'], /バイオーム/)
})

test('body-biome and grouped labels localize through stable biome identity', () => {
  const data = referenceFixture()
  const seenIds: string[] = []
  const syntheticResolver: ReferenceNameResolver = (kind, id, fallback) => {
    assert.equal(kind, 'biome')
    seenIds.push(id)
    return id === 'stable-plains' ? 'Localized Plains' : fallback ?? id
  }

  assert.equal(
    getBodyBiomeDisplayName('body-plains-a', data, 'en-US', syntheticResolver),
    'Localized Plains',
  )
  assert.equal(
    getBodyBiomeDisplayName('body-plains-b', data, 'en-US', syntheticResolver),
    'Localized Plains',
  )

  const groups = getBiomeButtonGroups(data, 'body')
  assert.deepEqual(groups.map(({ key, biomeId, ordinal }) => ({ key, biomeId, ordinal })), [
    { key: 'body-plains-a', biomeId: 'stable-plains', ordinal: 1 },
    { key: 'body-plains-b', biomeId: 'stable-plains', ordinal: 2 },
  ])
  assert.deepEqual(
    groups.map((group) => getBiomeGroupDisplayName(group, 'en-US', syntheticResolver)),
    ['Localized Plains 1', 'Localized Plains 2'],
  )
  assert.ok(seenIds.every((id) => id === 'stable-plains'))
  assert.ok(!seenIds.some((id) => id === groups[0].key))

  const issue: ValidationIssue = {
    ruleId: 'duplicate-biome-selection',
    category: 'structural',
    severity: 'warning',
    messageKey: 'validation.duplicateBiome',
    bodyBiomeId: 'body-plains-a',
  }
  assert.equal(
    getValidationIssuePresentation(issue, [], data, 'en-US', syntheticResolver).message,
    'Localized Plains appears more than once in this outpost\'s biome selection.',
  )
})

test('biome display retains canonical and raw-ID fallbacks', () => {
  const data = referenceFixture()
  assert.equal(getBodyBiomeDisplayName('body-plains-a', data, 'en-GB'), 'Frozen Plains')
  assert.equal(getBodyBiomeDisplayName('missing-occurrence', data, 'en-GB'), 'missing-occurrence')

  const missingBiomeData: ReferenceData = {
    ...data,
    biomes: [],
    bodyBiomes: [{
      id: 'known-occurrence', bodyId: 'body', biomeId: 'missing-biome', biomeIndex: 0,
    }],
  }
  assert.equal(
    getBodyBiomeDisplayName('known-occurrence', missingBiomeData, 'en-US'),
    'missing-biome',
  )
})
