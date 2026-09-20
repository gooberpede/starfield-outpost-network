/** Explicit semantic-review source routing for each locale with a completed draft. */
import type { MessageCatalogue } from '../../src/localization/types.ts'
import { deDEReviewDraft } from '../../src/localization/reviewDrafts/de-DE.ts'
import { frFRReviewDraft } from '../../src/localization/reviewDrafts/fr-FR.ts'
import { jaJPMessages } from '../../src/localization/locales/ja-JP.ts'

import { localeMetadataFor, localizationArtifactNames } from './locale-metadata.mjs'

interface ReviewSource {
  translations: Partial<MessageCatalogue>
  createXliff: boolean
}

const reviewSourcesByLocale: Readonly<Record<string, ReviewSource>> = {
  'ja-JP': { translations: jaJPMessages, createXliff: false },
  'fr-FR': { translations: frFRReviewDraft, createXliff: true },
  'de-DE': { translations: deDEReviewDraft, createXliff: true },
}

export function reviewRouteForLocale(localeValue: string): {
  locale: string
  artifacts: ReturnType<typeof localizationArtifactNames>
  source: ReviewSource
} {
  const metadata = localeMetadataFor(localeValue)
  if (metadata.catalogueRole !== 'full') {
    throw new Error(`REVIEW_LOCALE_UNAVAILABLE: ${metadata.trackerLocale} is a sparse locale.`)
  }
  const source = reviewSourcesByLocale[metadata.trackerLocale]
  if (!source) {
    throw new Error(
      `REVIEW_DRAFT_MISSING: ${metadata.trackerLocale} requires an independent draft at ` +
      `${localizationArtifactNames(metadata.trackerLocale).reviewDraft}.`,
    )
  }
  return { locale: metadata.trackerLocale, artifacts: localizationArtifactNames(metadata.trackerLocale), source }
}
