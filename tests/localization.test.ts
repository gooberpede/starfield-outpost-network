import assert from 'node:assert/strict'
import test from 'node:test'

import { translate } from '../src/localization/catalog.ts'
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
import { formatList } from '../src/localization/formatters.ts'

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
  assert.equal(resolveEffectiveLocale(null, ['fr-FR']), 'en-US')
  assert.equal(resolveBrowserLocale([]), 'en-US')
  assert.deepEqual(getBrowserLanguages({ language: 'en-AU' }), ['en-AU'])
  assert.deepEqual(getBrowserLanguages({}), [])
})

test('application preferences persist separately and recover invalid values as Automatic', () => {
  const storage = new MemoryStorage()
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })

  for (const localeOverride of [null, 'en-US', 'en-GB'] as const) {
    saveApplicationPreferences({ localeOverride }, storage)
    assert.deepEqual(loadApplicationPreferences(storage), { localeOverride })
  }

  storage.setItem(APPLICATION_PREFERENCES_STORAGE_KEY, JSON.stringify({ localeOverride: 'fr-FR' }))
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })
  storage.setItem(APPLICATION_PREFERENCES_STORAGE_KEY, 'invalid json')
  assert.deepEqual(loadApplicationPreferences(storage), { localeOverride: null })
})

test('stable reference identity receives sparse locale display overlays', () => {
  const id = 'aluminium'
  assert.equal(getReferenceDisplayName('resource', id, 'Aluminium', 'en-US'), 'Aluminum')
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
  ])
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
})

test('locale-aware list formatting owns conjunction and punctuation', () => {
  assert.equal(formatList('en-US', ['Aluminum', 'Iron']), 'Aluminum and Iron')
  assert.equal(formatList('en-GB', ['Aluminium', 'Iron']), 'Aluminium and Iron')
})

test('matrix export tooltip combines localized names with localized list formatting', () => {
  const resourceName = getReferenceDisplayName('resource', 'aluminium', 'Aluminium', 'en-US')
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
