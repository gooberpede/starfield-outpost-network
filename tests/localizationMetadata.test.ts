import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { supportedLocaleIds } from '../src/localization/types.ts'
import { getLocaleSelectorOptions, resolveBrowserLocale } from '../src/localization/locale.ts'

interface LocaleMetadataDocument {
  locales: Array<{ trackerLocale: string, runtimeAvailable: boolean }>
}

const metadata = JSON.parse(await readFile(
  new URL('../reference-source/localization-locale-metadata.json', import.meta.url), 'utf8',
)) as LocaleMetadataDocument

test('runtime-supported locales agree with locale metadata and selector registration', () => {
  const runtimeLocales = metadata.locales.filter(({ runtimeAvailable }) => runtimeAvailable)
    .map(({ trackerLocale }) => trackerLocale)
  assert.deepEqual(runtimeLocales, [...supportedLocaleIds])
  assert.equal(getLocaleSelectorOptions('en-US').some(({ value }) => value === 'fr-FR'), true)
  assert.equal(getLocaleSelectorOptions('en-US').some(({ value }) => value === 'de-DE'), true)
  assert.equal(resolveBrowserLocale(['fr-FR']), 'fr-FR')
  assert.equal(resolveBrowserLocale(['de-DE']), 'de-DE')
})
