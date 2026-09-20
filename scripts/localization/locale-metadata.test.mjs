import assert from 'node:assert/strict'
import test from 'node:test'

import {
  LOCALIZATION_LOCALE_METADATA, bethesdaTokenForLocale, encodingForKnownLocale, localeMetadataFor,
  localizationArtifactNames, referenceNameArtifactNames,
} from './locale-metadata.mjs'

test('locale metadata maps tracker identities, Bethesda tokens, encodings, and runtime roles', () => {
  assert.equal(bethesdaTokenForLocale('en-US'), 'en')
  assert.equal(bethesdaTokenForLocale('fr-FR'), 'fr')
  assert.equal(bethesdaTokenForLocale('de-DE'), 'de')
  assert.equal(encodingForKnownLocale('en'), 'windows-1252')
  assert.equal(encodingForKnownLocale('ja-JP'), 'utf-8')
  assert.equal(encodingForKnownLocale('fr-FR'), 'utf-8')
  assert.equal(encodingForKnownLocale('de-DE'), 'utf-8')
  assert.equal(localeMetadataFor('fr-FR').runtimeAvailable, true)
  assert.equal(localeMetadataFor('de-DE').runtimeAvailable, true)
  assert.equal(localeMetadataFor('fr-FR').catalogueRole, 'full')
  assert.equal(localeMetadataFor('de-DE').catalogueRole, 'full')
  assert.deepEqual(referenceNameArtifactNames('fr-FR'), {
    trackerLocale: 'fr-FR', module: 'src/localization/generated/fr-FR-reference-names.ts',
    sidecar: 'reference-source/localized-reference-names-fr-FR-manifest.json',
  })

  const staged = [
    ['es-ES', 'es'], ['it-IT', 'it'], ['pt-BR', 'ptbr'],
  ]
  for (const [trackerLocale, bethesdaToken] of staged) {
    assert.equal(bethesdaTokenForLocale(trackerLocale), bethesdaToken)
    assert.equal(encodingForKnownLocale(bethesdaToken), 'utf-8')
    assert.equal(encodingForKnownLocale(trackerLocale), 'utf-8')
    assert.equal(localeMetadataFor(trackerLocale).runtimeAvailable, false)
    assert.equal(localeMetadataFor(trackerLocale).catalogueRole, 'full')
    assert.deepEqual(localizationArtifactNames(trackerLocale), {
      trackerLocale,
      review: `docs/localization/${trackerLocale}-review.csv`,
      xliff: `docs/localization/${trackerLocale}-deepl.xliff`,
      reviewDraft: `src/localization/reviewDrafts/${trackerLocale}.ts`,
      catalogue: `src/localization/locales/${trackerLocale}.ts`,
      catalogueExport: `${trackerLocale.slice(0, 2)}${trackerLocale.slice(3, 5)}Messages`,
      terminologyValues: `reference-source/official-terminology-values-${trackerLocale}.csv`,
      module: `src/localization/generated/${trackerLocale}-reference-names.ts`,
      sidecar: `reference-source/localized-reference-names-${trackerLocale}-manifest.json`,
    })
  }
})

test('locale metadata identities are unique and unsupported values fail closed', () => {
  assert.equal(new Set(LOCALIZATION_LOCALE_METADATA.map(({ trackerLocale }) => trackerLocale)).size, LOCALIZATION_LOCALE_METADATA.length)
  assert.throws(() => localeMetadataFor('xx-XX'), /UNSUPPORTED_LOCALE/)
})
