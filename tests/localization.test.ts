import assert from 'node:assert/strict'
import test from 'node:test'

import { translate, translateDescriptor } from '../src/localization/catalog.ts'
import {
  getBrowserLanguages,
  getLocaleSelectorOptions,
  resolveBrowserLocale,
  resolveEffectiveLocale,
} from '../src/localization/locale.ts'
import {
  APPLICATION_PREFERENCES_STORAGE_KEY,
  loadApplicationPreferences,
  saveApplicationPreferences,
} from '../src/localization/preferences.ts'
import { getReferenceDisplayName } from '../src/localization/referenceNames.ts'
import { createDefaultOutpost } from '../src/domain/defaults.ts'
import { createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'
import { createDefaultNetworkCollection } from '../src/data/networkCollection.ts'
import { getExportTooltip, getInorganicPresentTooltip } from '../src/ui/statusTooltips.ts'
import { formatDecimal, formatInteger, formatList, formatPercent, getCollator } from '../src/localization/formatters.ts'
import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { enGBMessages } from '../src/localization/locales/en-GB.ts'
import { setDocumentLanguage } from '../src/localization/documentLanguage.ts'
import { getImportFailurePresentation } from '../src/ui/importErrorPresentation.ts'
import { NetworkImportError } from '../src/data/importErrors.ts'
import { getHistoryDisplayLabel } from '../src/ui/historyPresentation.ts'
import {
  deserializeNetworkCollection,
  serializeNetworkCollection,
} from '../src/data/serialization.ts'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

test('locale resolution honours explicit choice and deterministic English mapping', () => {
  assert.equal(resolveEffectiveLocale('en-US', ['en-GB']), 'en-US')
  assert.equal(resolveEffectiveLocale('en-GB', ['en-US']), 'en-GB')
  assert.equal(resolveEffectiveLocale(null, ['en-US']), 'en-US')
  assert.equal(resolveEffectiveLocale(null, ['en-GB']), 'en-GB')
  assert.equal(resolveEffectiveLocale(null, ['en-AU']), 'en-GB')
  assert.equal(resolveEffectiveLocale(null, ['en-NZ']), 'en-GB')
  assert.equal(resolveEffectiveLocale(null, ['fr-FR']), 'fr-FR')
  assert.equal(resolveBrowserLocale([]), 'en-US')
  assert.deepEqual(getBrowserLanguages({ language: 'en-AU' }), ['en-AU'])
  assert.deepEqual(getBrowserLanguages({}), [])
})

test('browser locale resolution maps supported French and German language families in order', () => {
  for (const language of ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'FR-fr-x-private']) {
    assert.equal(resolveBrowserLocale([language]), 'fr-FR', language)
  }
  for (const language of ['de', 'de-DE', 'de-AT', 'de-CH', 'de-LI', 'DE-de-x-private']) {
    assert.equal(resolveBrowserLocale([language]), 'de-DE', language)
  }
  assert.equal(resolveBrowserLocale(['fr-CA', 'en-US']), 'fr-FR')
  assert.equal(resolveBrowserLocale(['de-CH', 'en-US']), 'de-DE')
  assert.equal(resolveBrowserLocale(['xx-YY', 'de-AT', 'en-US']), 'de-DE')
  assert.equal(resolveBrowserLocale(['xx-YY', 'en-US']), 'en-US')
})

test('browser locale resolution conservatively maps Spanish, Italian, and Brazilian Portuguese', () => {
  for (const language of ['es', 'es-ES', 'es-ES-x-private', 'ES-es-u-nu-latn']) {
    assert.equal(resolveBrowserLocale([language]), 'es-ES', language)
  }
  for (const language of ['it', 'it-IT', 'it-IT-x-private', 'IT-it-u-nu-latn']) {
    assert.equal(resolveBrowserLocale([language]), 'it-IT', language)
  }
  for (const language of ['pt', 'pt-BR', 'pt-BR-x-private', 'PT-br-u-nu-latn']) {
    assert.equal(resolveBrowserLocale([language]), 'pt-BR', language)
  }

  assert.equal(resolveBrowserLocale(['es-MX', 'en-US']), 'en-US')
  assert.equal(resolveBrowserLocale(['es-AR', 'fr-FR']), 'fr-FR')
  assert.equal(resolveBrowserLocale(['it-CH', 'de-DE']), 'de-DE')
  assert.equal(resolveBrowserLocale(['pt-PT', 'en-US']), 'en-US')
  assert.equal(resolveBrowserLocale(['pt-PT', 'es-ES']), 'es-ES')
})

test('application preferences persist separately and recover invalid values as Automatic', () => {
  const storage = new MemoryStorage()
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })

  for (const localeOverride of [
    null, 'en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR',
  ] as const) {
    saveApplicationPreferences({ localeOverride }, storage)
    assert.deepEqual(loadApplicationPreferences(storage), { localeOverride })
  }

  storage.setItem(APPLICATION_PREFERENCES_STORAGE_KEY, JSON.stringify({ localeOverride: 'xx-YY' }))
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })
  storage.setItem(APPLICATION_PREFERENCES_STORAGE_KEY, 'invalid json')
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })
})

test('stable reference identity receives sparse locale display overlays', () => {
  const id = 'aluminium'
  assert.equal(getReferenceDisplayName('resource', id, 'Aluminum', 'en-US'), 'Aluminum')
  assert.equal(getReferenceDisplayName('resource', id, 'Aluminum', 'en-GB'), 'Aluminium')
  assert.equal(id, 'aluminium')
  assert.equal(getReferenceDisplayName('resource', 'iron', 'Iron', 'en-GB'), 'Iron')
  assert.equal(getReferenceDisplayName('resource', 'unknown', undefined, 'en-US'), 'unknown')
})

test('selector model exposes the effective closed label and dynamic Automatic row', () => {
  assert.deepEqual(getLocaleSelectorOptions('en-GB'), [
    { value: 'automatic', label: 'Automatic (EN-GB)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'fr-FR', label: 'Français (France)' },
    { value: 'de-DE', label: 'Deutsch (Deutschland)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'it-IT', label: 'Italiano (Italia)' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
  ])
  assert.equal(getLocaleSelectorOptions('es-ES')[0].label, 'Automatic (ES-ES)')
  assert.equal(getLocaleSelectorOptions('it-IT')[0].label, 'Automatic (IT-IT)')
  assert.equal(getLocaleSelectorOptions('pt-BR')[0].label, 'Automatic (PT-BR)')
  assert.equal(resolveEffectiveLocale('en-US', ['en-GB']), 'en-US')

  const session = createCollectionEditingSession(createDefaultNetworkCollection())
  const storage = new MemoryStorage()
  saveApplicationPreferences({ localeOverride: 'en-GB' }, storage)
  assert.equal(loadApplicationPreferences(storage).localeOverride, 'en-GB')
  assert.equal(session.history.past.length, 0)
})

test('proof messages cover static, parameterized, tooltip, and plural paths', () => {
  assert.equal(translate('en-US', 'network.delete.button'), 'Delete Network')
  assert.equal(
    translate('en-GB', 'validation.manufacturingInputUnavailable', {
      product: 'Adaptive Frame', input: 'Aluminium',
    }),
    'Adaptive Frame requires Aluminium, but Aluminium is not available at this outpost.',
  )
  assert.equal(
    getInorganicPresentTooltip('Aluminum', false, true, 'en-US'),
    'Aluminum may be present at this outpost.',
  )
  assert.equal(translate('en-US', 'validation.issueCount', { count: 1 }), 'Validation: 1 issue')
  assert.equal(translate('en-GB', 'validation.issueCount', { count: 2 }), 'Validation: 2 issues')
  assert.throws(
    () => translate('en-US', 'missing.key' as Parameters<typeof translate>[1]),
    /Missing baseline localization message/,
  )
  assert.throws(
    () => translate('en-US', 'network.delete.button', { unexpected: 'value' }),
    /Unexpected localization parameter/,
  )
  assert.throws(
    () => translate('en-US', 'status.export.success'),
    /Missing localization parameter/,
  )
})

test('baseline catalogue is complete and regional English remains a sparse override', () => {
  assert.ok(Object.keys(enUSMessages).length >= 300)
  assert.ok(Object.keys(enGBMessages).length < Object.keys(enUSMessages).length)
  for (const key of Object.keys(enUSMessages) as (keyof typeof enUSMessages)[]) {
    assert.equal(typeof translate('en-GB', key, sampleParameters(enUSMessages[key])), 'string')
  }
})

function sampleParameters(template: string): Record<string, string | number> {
  const normalized = template.replace(
    /\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g, '{$1}',
  )
  return Object.fromEntries([...normalized.matchAll(/\{(\w+)\}/g)].map((match) => [
    match[1], match[1] === 'count' ? 2 : 'value',
  ]))
}

test('semantic descriptors relocalize without changing their stored facts', () => {
  const descriptor = { key: 'history.addExport' as const, parameters: {
    item: 'Aluminum', outpost: 'Home', pad: 'Pad 1',
  } }
  assert.equal(
    translateDescriptor('en-US', descriptor),
    'Add export Aluminum to Home / Pad 1',
  )
  assert.deepEqual(descriptor.parameters, {
    item: 'Aluminum', outpost: 'Home', pad: 'Pad 1',
  })
})

test('history resolves stable reference facts in the current locale', () => {
  const descriptor = {
    key: 'history.addLocalResource' as const,
    parameters: { outpost: 'Home' },
    referenceParameters: [{
      parameter: 'resource', kind: 'resource' as const,
      id: 'aluminium', fallback: 'Aluminum',
    }],
  }
  assert.equal(
    getHistoryDisplayLabel(descriptor, 'en-US'),
    'Add local resource Aluminum to Home',
  )
  assert.equal(
    getHistoryDisplayLabel(descriptor, 'en-GB'),
    'Add local resource Aluminium to Home',
  )
  assert.equal(
    getHistoryDisplayLabel(descriptor, 'ja-JP'),
    'Homeに現地資源アルミニウムを追加',
  )
  assert.deepEqual(descriptor.referenceParameters[0], {
    parameter: 'resource', kind: 'resource', id: 'aluminium', fallback: 'Aluminum',
  })
})

test('history relocalization and locale preferences leave collection and history unchanged', () => {
  const session = createCollectionEditingSession(createDefaultNetworkCollection())
  const descriptor = {
    key: 'history.addPlannedSupply' as const,
    referenceParameters: [{
      parameter: 'item', kind: 'product' as const,
      id: 'adaptive-frame', fallback: 'Adaptive Frame',
    }],
  }
  const collectionBefore = structuredClone(session.collection)
  const historyBefore = structuredClone(session.history)
  const exportBefore = serializeNetworkCollection(session.collection)

  assert.match(getHistoryDisplayLabel(descriptor, 'ja-JP'), /順応型フレーム/)
  assert.match(getHistoryDisplayLabel(descriptor, 'en-US'), /Adaptive Frame/)
  assert.match(getHistoryDisplayLabel(descriptor, 'ja-JP'), /順応型フレーム/)
  assert.deepEqual(session.collection, collectionBefore)
  assert.deepEqual(session.history, historyBefore)
  assert.equal(serializeNetworkCollection(session.collection), exportBefore)
  assert.equal(session.context.outpostId, null)
})

test('collection import and export are locale-independent for every supported preference', () => {
  const storage = new MemoryStorage()
  const collection = createDefaultNetworkCollection()
  collection.networks[0].id = 'stable-network'
  collection.activeNetworkId = 'stable-network'
  collection.networks[0].network.outposts = [
    createDefaultOutpost([], 'stable-outpost', 'Locale fixture'),
  ]
  const fixture = serializeNetworkCollection(collection)

  const results = (['en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE'] as const).map((localeOverride) => {
    saveApplicationPreferences({ localeOverride }, storage)
    const imported = deserializeNetworkCollection(fixture)
    return {
      localeOverride: loadApplicationPreferences(storage).localeOverride,
      serialized: serializeNetworkCollection(imported),
      networkIds: imported.networks.map(({ id }) => id),
      outpostIds: imported.networks.flatMap(({ network }) =>
        network.outposts.map(({ id }) => id)),
    }
  })

  for (const result of results) {
    assert.equal(result.serialized, fixture)
    assert.deepEqual(result.networkIds, ['stable-network'])
    assert.deepEqual(result.outpostIds, ['stable-outpost'])
  }
  assert.deepEqual(results.map(({ localeOverride }) => localeOverride), [
    'en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE',
  ])
})

test('skill history labels use official names in the locale active at render time', () => {
  const descriptor = {
    key: 'history.setSkill' as const,
    skillId: 'outpostEngineering' as const,
    parameters: { rank: 2 },
  }
  assert.equal(getHistoryDisplayLabel(descriptor, 'en-US'), 'Set Outpost Engineering to 2')
  assert.match(getHistoryDisplayLabel(descriptor, 'ja-JP'), /拠点エンジニアリング/)
  assert.deepEqual(descriptor, {
    key: 'history.setSkill', skillId: 'outpostEngineering', parameters: { rank: 2 },
  })
})

test('locale-aware list formatting owns conjunction and punctuation', () => {
  assert.equal(formatList('en-US', ['Aluminum', 'Iron']), 'Aluminum and Iron')
  assert.equal(formatList('en-GB', ['Aluminium', 'Iron']), 'Aluminium and Iron')
  assert.equal(formatList('fr-FR', ['Aluminium', 'Fer']), 'Aluminium et Fer')
  assert.equal(formatList('de-DE', ['Aluminium', 'Eisen']), 'Aluminium und Eisen')
})

test('locale-aware number helpers and collator use Intl presentation', () => {
  assert.equal(formatInteger('en-US', 1234), '1,234')
  assert.equal(formatDecimal('en-US', 2 / 3), '0.67')
  assert.equal(formatPercent('en-US', 0.25), '25%')
  assert.ok(getCollator('en-US').compare('Pad 2', 'Pad 10') < 0)
  assert.equal(formatInteger('fr-FR', 1234), new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(1234))
  assert.equal(formatDecimal('de-DE', 2 / 3), '0,67')
  assert.equal(formatPercent('fr-FR', 0.25), '25 %')
  assert.equal(new Intl.PluralRules('fr-FR').select(1), 'one')
  assert.equal(new Intl.PluralRules('de-DE').select(2), 'other')
  assert.ok(getCollator('fr-FR').compare('Item 2', 'Item 10') < 0)
  assert.ok(getCollator('de-DE').compare('Item 2', 'Item 10') < 0)
})

test('document language follows initial and switched effective locale', () => {
  const target = { documentElement: { lang: 'en' } } as Pick<Document, 'documentElement'>
  setDocumentLanguage('en-US', target)
  assert.equal(target.documentElement.lang, 'en-US')
  setDocumentLanguage('en-GB', target)
  assert.equal(target.documentElement.lang, 'en-GB')
  setDocumentLanguage('fr-FR', target)
  assert.equal(target.documentElement.lang, 'fr-FR')
  setDocumentLanguage('de-DE', target)
  assert.equal(target.documentElement.lang, 'de-DE')
  setDocumentLanguage('es-ES', target)
  assert.equal(target.documentElement.lang, 'es-ES')
  setDocumentLanguage('it-IT', target)
  assert.equal(target.documentElement.lang, 'it-IT')
  setDocumentLanguage('pt-BR', target)
  assert.equal(target.documentElement.lang, 'pt-BR')
})

test('known import failures use stable descriptors and retain diagnostics', () => {
  const invalidJson = getImportFailurePresentation(new SyntaxError('Unexpected token'))
  assert.equal(invalidJson.reason.key, 'status.import.invalidJson')
  assert.equal(invalidJson.diagnostic, 'Unexpected token')
  const unsupported = getImportFailurePresentation(
    new Error('Unsupported network schema version: 99'),
  )
  assert.deepEqual(unsupported.reason, {
    key: 'status.import.unsupportedNetworkSchema', parameters: { version: '99' },
  })
  assert.equal(unsupported.diagnostic, 'Unsupported network schema version: 99')
  const malformed = getImportFailurePresentation(new NetworkImportError(
    'invalid-structure', { path: 'networks[0].network.outposts[0].manufacturing' },
  ))
  assert.deepEqual(malformed.reason, {
    key: 'status.import.invalidStructure',
    parameters: { path: 'networks[0].network.outposts[0].manufacturing' },
  })
  assert.deepEqual(malformed.details, {
    code: 'invalid-structure',
    parameters: { path: 'networks[0].network.outposts[0].manufacturing' },
  })
  assert.equal(malformed.diagnostic, undefined)
})

test('matrix export tooltip combines localized names with localized list formatting', () => {
  const resourceName = getReferenceDisplayName('resource', 'aluminium', 'Aluminum', 'en-US')
  assert.equal(
    getExportTooltip(resourceName, ['Alpha', 'Beta', 'Gamma'], 'en-US'),
    'Aluminum is being exported to Alpha, Beta, and Gamma.',
  )

  const britishResourceName = getReferenceDisplayName(
    'resource', 'aluminium', 'Aluminum', 'en-GB',
  )
  assert.equal(
    getExportTooltip(britishResourceName, ['Alpha', 'Beta'], 'en-GB'),
    'Aluminium is being exported to Alpha and Beta.',
  )
})

test('localized generated outpost defaults are persisted ordinary names', () => {
  const baseName = translate('en-GB', 'outpost.defaultName')
  const first = createDefaultOutpost([], 'one', baseName)
  const second = createDefaultOutpost([first], 'two', baseName)
  assert.equal(first.name, 'New Outpost')
  assert.equal(second.name, 'New Outpost (2)')
  assert.equal(first.name, 'New Outpost')
})
