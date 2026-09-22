import assert from 'node:assert/strict'
import test from 'node:test'

import {
  LOCALIZATION_LOCALE_METADATA, bethesdaTokenForLocale, encodingForKnownLocale, localeMetadataFor,
  localizationArtifactNames, referenceNameArtifactNames,
} from './locale-metadata.mjs'
import { verifyCommittedReferenceNameOverlay } from './verify-reference-name-overlay.mjs'

test('locale metadata maps tracker identities, Bethesda tokens, encodings, and runtime roles', () => {
  assert.equal(bethesdaTokenForLocale('en-US'), 'en')
  assert.equal(bethesdaTokenForLocale('fr-FR'), 'fr')
  assert.equal(bethesdaTokenForLocale('de-DE'), 'de')
  assert.equal(encodingForKnownLocale('en'), 'windows-1252')
  assert.equal(encodingForKnownLocale('ja-JP'), 'utf-8')
  assert.equal(encodingForKnownLocale('fr-FR'), 'utf-8')
  assert.equal(encodingForKnownLocale('de-DE'), 'utf-8')
  assert.equal(encodingForKnownLocale('pl'), 'utf-8')
  assert.equal(encodingForKnownLocale('pl-PL'), 'utf-8')
  assert.equal(encodingForKnownLocale('zhhans'), 'utf-8')
  assert.equal(encodingForKnownLocale('zh-Hans'), 'utf-8')
  assert.equal(localeMetadataFor('fr-FR').runtimeAvailable, true)
  assert.equal(localeMetadataFor('de-DE').runtimeAvailable, true)
  assert.equal(localeMetadataFor('fr-FR').catalogueRole, 'full')
  assert.equal(localeMetadataFor('de-DE').catalogueRole, 'full')
  assert.deepEqual(referenceNameArtifactNames('fr-FR'), {
    trackerLocale: 'fr-FR', module: 'src/localization/generated/fr-FR-reference-names.ts',
    sidecar: 'reference-source/localized-reference-names-fr-FR-manifest.json',
    faunaEvidence: 'reference-source/localized-fauna-evidence-fr-FR.json',
  })

  const newlyRuntimeIntegrated = [
    ['es-ES', 'es'], ['it-IT', 'it'], ['pt-BR', 'ptbr'],
  ]
  for (const [trackerLocale, bethesdaToken] of newlyRuntimeIntegrated) {
    assert.equal(bethesdaTokenForLocale(trackerLocale), bethesdaToken)
    assert.equal(encodingForKnownLocale(bethesdaToken), 'utf-8')
    assert.equal(encodingForKnownLocale(trackerLocale), 'utf-8')
    assert.equal(localeMetadataFor(trackerLocale).runtimeAvailable, true)
    assert.equal(localeMetadataFor(trackerLocale).catalogueRole, 'full')
    assert.deepEqual(localizationArtifactNames(trackerLocale), {
      trackerLocale,
      review: `docs/localization/${trackerLocale}-review.csv`,
      xliff: `.local-work/localization/${trackerLocale}/${trackerLocale}-deepl.xliff`,
      reviewDraft: `src/localization/reviewDrafts/${trackerLocale}.ts`,
      catalogue: `src/localization/locales/${trackerLocale}.ts`,
      catalogueExport: `${trackerLocale.slice(0, 2)}${trackerLocale.slice(3, 5)}Messages`,
      terminologyValues: `reference-source/official-terminology-values-${trackerLocale}.csv`,
      module: `src/localization/generated/${trackerLocale}-reference-names.ts`,
      sidecar: `reference-source/localized-reference-names-${trackerLocale}-manifest.json`,
      faunaEvidence: `reference-source/localized-fauna-evidence-${trackerLocale}.json`,
    })
  }

  assert.deepEqual(localeMetadataFor('pl-PL'), {
    trackerLocale: 'pl-PL', bethesdaToken: 'pl', stringTableEncoding: 'utf-8',
    catalogueRole: 'full', runtimeAvailable: true,
  })
  assert.deepEqual(localizationArtifactNames('pl'), {
    trackerLocale: 'pl-PL',
    review: 'docs/localization/pl-PL-review.csv',
    xliff: '.local-work/localization/pl-PL/pl-PL-deepl.xliff',
    reviewDraft: 'src/localization/reviewDrafts/pl-PL.ts',
    catalogue: 'src/localization/locales/pl-PL.ts',
    catalogueExport: 'plPLMessages',
    terminologyValues: 'reference-source/official-terminology-values-pl-PL.csv',
    module: 'src/localization/generated/pl-PL-reference-names.ts',
    sidecar: 'reference-source/localized-reference-names-pl-PL-manifest.json',
    faunaEvidence: 'reference-source/localized-fauna-evidence-pl-PL.json',
  })

  assert.deepEqual(localeMetadataFor('zh-Hans'), {
    trackerLocale: 'zh-Hans', bethesdaToken: 'zhhans', stringTableEncoding: 'utf-8',
    catalogueRole: 'full', runtimeAvailable: true,
  })
  assert.deepEqual(localizationArtifactNames('zhhans'), {
    trackerLocale: 'zh-Hans',
    review: 'docs/localization/zh-Hans-review.csv',
    xliff: '.local-work/localization/zh-Hans/zh-Hans-deepl.xliff',
    reviewDraft: 'src/localization/reviewDrafts/zh-Hans.ts',
    catalogue: 'src/localization/locales/zh-Hans.ts',
    catalogueExport: 'zhHansMessages',
    terminologyValues: 'reference-source/official-terminology-values-zh-Hans.csv',
    module: 'src/localization/generated/zh-Hans-reference-names.ts',
    sidecar: 'reference-source/localized-reference-names-zh-Hans-manifest.json',
    faunaEvidence: 'reference-source/localized-fauna-evidence-zh-Hans.json',
  })
  assert.deepEqual(Intl.getCanonicalLocales('zh-Hans'), ['zh-Hans'])
  assert.notEqual(Intl.getCanonicalLocales('zh-Hant')[0], 'zh-Hans')
})

test('locale metadata identities are unique and unsupported values fail closed', () => {
  assert.equal(new Set(LOCALIZATION_LOCALE_METADATA.map(({ trackerLocale }) => trackerLocale)).size, LOCALIZATION_LOCALE_METADATA.length)
  assert.throws(() => localeMetadataFor('xx-XX'), /UNSUPPORTED_LOCALE/)
})

test('Polish reference overlay routing verifies deterministic runtime artifacts', async () => {
  const result = await verifyCommittedReferenceNameOverlay(undefined, 'pl-PL')
  assert.equal(result.entityCount, 3561)
  assert.equal(result.provenanceRows, 4818)
  assert.equal(result.evidenceStatus, 'provisionally-accepted')
  assert.equal(localeMetadataFor('pl-PL').runtimeAvailable, true)
})

test('Simplified Chinese reference overlay verifies for the active runtime locale', async () => {
  const result = await verifyCommittedReferenceNameOverlay(undefined, 'zh-Hans')
  assert.equal(result.entityCount, 3561)
  assert.equal(result.provenanceRows, 4818)
  assert.equal(result.evidenceStatus, 'provisionally-accepted')
  assert.equal(localeMetadataFor('zh-Hans').runtimeAvailable, true)
})
