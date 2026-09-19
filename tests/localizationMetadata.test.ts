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

test('tooling-known locales remain separate from runtime-supported locales', () => {
  const runtimeLocales = metadata.locales.filter(({ runtimeAvailable }) => runtimeAvailable)
    .map(({ trackerLocale }) => trackerLocale)
  assert.deepEqual(runtimeLocales, [...supportedLocaleIds])
  assert.equal(getLocaleSelectorOptions('en-US').some(({ value }) => value === ('fr-FR' as never)), false)
  assert.equal(getLocaleSelectorOptions('en-US').some(({ value }) => value === ('de-DE' as never)), false)
  assert.equal(resolveBrowserLocale(['fr-FR']), 'en-US')
  assert.equal(resolveBrowserLocale(['de-DE']), 'en-US')
})
