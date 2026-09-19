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
    trackerLocale,
  }
}
