import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { translate } from '../src/localization/catalog.ts'
import { setDocumentLanguage } from '../src/localization/documentLanguage.ts'
import {
  formatDecimal,
  formatInteger,
  formatList,
  formatPercent,
  getCollator,
} from '../src/localization/formatters.ts'
import { createJapaneseReviewCsv, createJapaneseReviewRows } from '../src/localization/japaneseReviewPackage.ts'
import { getLocaleSelectorOptions, resolveBrowserLocale, resolveEffectiveLocale } from '../src/localization/locale.ts'
import { enGBMessages } from '../src/localization/locales/en-GB.ts'
import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import { localeRegistry } from '../src/localization/registry.ts'
import type { MessageKey } from '../src/localization/types.ts'

function parametersOf(template: string): string[] {
  const normalized = template.replace(
    /\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g,
    '{$1}',
  )
  return [...new Set([...normalized.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))]
    .sort()
}

test('Japanese is registered, self-labelled, and selected by Japanese browser locales', () => {
  assert.equal(localeRegistry['ja-JP'].displayName, '日本語')
  assert.equal(resolveEffectiveLocale('ja-JP', ['en-US']), 'ja-JP')
  for (const language of ['ja', 'ja-JP', 'ja-Hira', 'JA-jp', 'Ja-jP-x-private']) {
    assert.equal(resolveBrowserLocale([language]), 'ja-JP', language)
  }
  assert.equal(resolveBrowserLocale(['fr-FR', 'ja-JP']), 'ja-JP')
  assert.equal(resolveBrowserLocale(['en-US', 'ja-JP']), 'en-US')
  assert.equal(resolveBrowserLocale(['en-AU']), 'en-GB')
  assert.equal(resolveBrowserLocale(['en-US']), 'en-US')
  assert.deepEqual(getLocaleSelectorOptions('ja-JP'), [
    { value: 'automatic', label: 'Automatic (日本語)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'ja-JP', label: '日本語' },
  ])
})

test('Japanese is complete with exact key and placeholder parity', () => {
  const englishKeys = Object.keys(enUSMessages).sort()
  const japaneseKeys = Object.keys(jaJPMessages).sort()
  assert.deepEqual(japaneseKeys, englishKeys)
  assert.equal(englishKeys.length, 380)
  assert.ok(Object.keys(enGBMessages).length < englishKeys.length)
  for (const key of englishKeys as MessageKey[]) {
    assert.deepEqual(parametersOf(jaJPMessages[key]), parametersOf(enUSMessages[key]), key)
  }
})

test('Japanese preserves representative protected tokens and has no ordinary exact fallback', () => {
  assert.match(jaJPMessages['about.description'], /スターフィールド/)
  assert.equal(
    jaJPMessages['about.attribution'],
    'Cosmos icons created by gravisio - Flaticon',
  )
  assert.match(jaJPMessages['validation.interstellarHelium3'], /He-3/)
  assert.match(jaJPMessages['help.interSystem'], /He-3/)
  assert.match(jaJPMessages['status.drag.reorder'], /Esc/)
  assert.match(jaJPMessages['search.results.dragInstructions'], /Shift/)
  assert.match(jaJPMessages['transfer.export.tooltip'], /JSON/)
  assert.match(jaJPMessages['validation.unknownSystem'], /ID/)
  assert.match(jaJPMessages['matrix.tooltip.xTech.add'], /X-テックパワーコア/)

  const intentionalInvariantMessages = new Set<MessageKey>([
    'about.attribution',
    'power.label.unknown',
    'cargo.destination.linkedLocator',
    'validation.context.separator',
    'history.benchmark',
  ])
  for (const key of Object.keys(enUSMessages) as MessageKey[]) {
    if (!intentionalInvariantMessages.has(key)) {
      assert.notEqual(jaJPMessages[key], enUSMessages[key], key)
    }
  }
})

test('representative semantic paths render Japanese tracker copy', () => {
  assert.equal(translate('ja-JP', 'network.add'), 'ネットワークを追加')
  assert.equal(translate('ja-JP', 'common.add'), '＋ 追加')
  assert.equal(
    translate('ja-JP', 'validation.manufacturingInputUnavailable', {
      product: 'Adaptive Frame', input: 'Aluminum',
    }),
    'Adaptive FrameにはAluminumが必要ですが、この拠点ではAluminumを利用できません。',
  )
  assert.equal(
    translate('ja-JP', 'history.addExport', { item: 'Iron', outpost: 'Home', pad: 'パッド1' }),
    'Ironの搬出をHome / パッド1に追加',
  )
  assert.equal(translate('ja-JP', 'help.plannedSupply').includes('仮の供給'), true)
  assert.equal(translate('ja-JP', 'matrix.column.present'), '存在')
  assert.equal(translate('ja-JP', 'matrix.column.producing'), '生産中')
  assert.equal(translate('ja-JP', 'matrix.column.inputs'), '必要素材')
  assert.equal(translate('ja-JP', 'matrix.column.logistics'), '物流')
  assert.equal(translate('ja-JP', 'matrix.heading'), '資源マトリックス')
  assert.equal(translate('ja-JP', 'outpost.navigation.lockOrder'), '順序を固定')
  assert.equal(translate('ja-JP', 'power.label.poor'), '低')
  assert.equal(translate('ja-JP', 'power.label.veryPoor'), '極低')
  assert.match(translate('ja-JP', 'help.organic.unavailableBiome', {
    resource: 'Fiber',
  }), /この飼育可能な生物種/)
  assert.equal(translate('ja-JP', 'status.import.invalidJson').includes('JSON'), true)
  assert.match(translate('ja-JP', 'status.import.malformedEntry'), /形式が不正/)
  assert.equal(translate('ja-JP', 'search.results.close'), '検索結果を閉じる')
})

test('document language and existing formatters work under Japanese', () => {
  const target = { documentElement: { lang: 'en-US' } } as Pick<Document, 'documentElement'>
  setDocumentLanguage('ja-JP', target)
  assert.equal(target.documentElement.lang, 'ja-JP')
  setDocumentLanguage('en-GB', target)
  assert.equal(target.documentElement.lang, 'en-GB')

  assert.equal(formatInteger('ja-JP', 1234), new Intl.NumberFormat('ja-JP').format(1234))
  assert.equal(formatDecimal('ja-JP', 2 / 3), new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(2 / 3))
  assert.equal(formatPercent('ja-JP', 0.25), new Intl.NumberFormat('ja-JP', {
    style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(0.25))
  assert.equal(formatList('ja-JP', ['A', 'B']), new Intl.ListFormat('ja-JP', {
    style: 'long', type: 'conjunction',
  }).format(['A', 'B']))
  assert.ok(getCollator('ja-JP').compare('パッド2', 'パッド10') < 0)
})

test('committed Japanese review package is deterministic and catalogue-derived', async () => {
  const rows = createJapaneseReviewRows()
  assert.equal(rows.length, Object.keys(enUSMessages).length)
  assert.equal(new Set(rows.map(({ Key }) => Key)).size, rows.length)
  assert.deepEqual(rows.map(({ Key }) => Key), rows.map(({ Key }) => Key).sort())
  for (const row of rows) {
    assert.equal(row.English, enUSMessages[row.Key])
    assert.equal(row.CodexJapanese, jaJPMessages[row.Key])
    assert.equal(row.Parameters, parametersOf(row.English).join('; '))
    assert.match(row.Context, /\S/)
    assert.match(row.Risk, /^(?:LOW|MEDIUM|HIGH)$/)
  }

  const committed = await readFile(
    new URL('../docs/localization/ja-JP-review-source.csv', import.meta.url),
    'utf8',
  )
  assert.equal(committed, createJapaneseReviewCsv())
})
