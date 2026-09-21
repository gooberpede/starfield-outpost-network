export interface LocalizationLocaleMetadata {
  trackerLocale: string
  bethesdaToken: string
  stringTableEncoding: string
  catalogueRole: 'full' | 'sparse'
  runtimeAvailable: boolean
}

export interface LocalizationArtifactNames {
  trackerLocale: string
  review: string
  xliff: string
  reviewDraft: string
  catalogue: string
  catalogueExport: string
  terminologyValues: string
  module: string
  sidecar: string
  faunaEvidence: string
}

export const LOCALIZATION_LOCALE_METADATA: readonly LocalizationLocaleMetadata[]
export function localeMetadataFor(value: string): LocalizationLocaleMetadata
export function bethesdaTokenForLocale(value: string): string
export function encodingForKnownLocale(value: string): string
export function referenceNameArtifactNames(locale: string): {
  trackerLocale: string
  module: string
  sidecar: string
  faunaEvidence: string
}
export function localizationArtifactNames(locale: string): LocalizationArtifactNames
