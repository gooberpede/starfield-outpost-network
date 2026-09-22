/** Authoritative locale identities shared by localization tooling contracts. */
import { readFileSync } from 'node:fs'

const metadataUrl = new URL('../../reference-source/localization-locale-metadata.json', import.meta.url)
export const LOCALIZATION_LOCALE_METADATA = Object.freeze(
  JSON.parse(readFileSync(metadataUrl, 'utf8')).locales.map((item) => Object.freeze(item)),
)

const byTrackerLocale = new Map(LOCALIZATION_LOCALE_METADATA.map((item) => [item.trackerLocale.toLowerCase(), item]))
const byBethesdaToken = new Map()
for (const item of LOCALIZATION_LOCALE_METADATA) {
  const token = item.bethesdaToken.toLowerCase()
  const current = byBethesdaToken.get(token)
  if (current && current.stringTableEncoding !== item.stringTableEncoding) {
    throw new Error(`LOCALE_METADATA_INVALID: ${token} has conflicting encodings.`)
  }
  byBethesdaToken.set(token, current ?? item)
}

export function localeMetadataFor(value) {
  const normalized = String(value).trim().toLowerCase().replaceAll('_', '-')
  const metadata = byTrackerLocale.get(normalized) ?? byBethesdaToken.get(normalized)
  if (!metadata) throw new Error(`UNSUPPORTED_LOCALE: No localization metadata is configured for ${JSON.stringify(value)}.`)
  return metadata
}

export function bethesdaTokenForLocale(value) {
  return localeMetadataFor(value).bethesdaToken
}

export function encodingForKnownLocale(value) {
  return localeMetadataFor(value).stringTableEncoding
}

export function referenceNameArtifactNames(locale) {
  const { trackerLocale } = localeMetadataFor(locale)
  return {
    module: `src/localization/generated/${trackerLocale}-reference-names.ts`,
    sidecar: `reference-source/localized-reference-names-${trackerLocale}-manifest.json`,
    faunaEvidence: `reference-source/localized-fauna-evidence-${trackerLocale}.json`,
    trackerLocale,
  }
}

function moduleIdentifierForLocale(locale) {
  const { trackerLocale } = localeMetadataFor(locale)
  const [language, ...subtags] = trackerLocale.split('-')
  return `${language.toLowerCase()}${subtags.map((part) => part.length === 2 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1).toLowerCase()).join('')}`
}

/** Deterministic paths shared by staged and runtime-available full locales. */
export function localizationArtifactNames(locale) {
  const metadata = localeMetadataFor(locale)
  const { trackerLocale } = metadata
  if (metadata.catalogueRole !== 'full') {
    throw new Error(`LOCALE_ARTIFACTS_UNAVAILABLE: ${trackerLocale} is a sparse locale.`)
  }
  return {
    trackerLocale,
    review: `docs/localization/${trackerLocale}-review.csv`,
    xliff: `.local-work/localization/${trackerLocale}/${trackerLocale}-deepl.xliff`,
    reviewDraft: `src/localization/reviewDrafts/${trackerLocale}.ts`,
    catalogue: `src/localization/locales/${trackerLocale}.ts`,
    catalogueExport: `${moduleIdentifierForLocale(trackerLocale)}Messages`,
    terminologyValues: `reference-source/official-terminology-values-${trackerLocale}.csv`,
    ...referenceNameArtifactNames(trackerLocale),
  }
}
