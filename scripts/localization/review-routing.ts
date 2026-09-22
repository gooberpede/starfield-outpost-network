/** Explicit semantic-review source routing for each locale with a completed draft. */
import type { MessageCatalogue } from '../../src/localization/types.ts'
import { deDEReviewDraft } from '../../src/localization/reviewDrafts/de-DE.ts'
import { esESReviewDraft } from '../../src/localization/reviewDrafts/es-ES.ts'
import { frFRReviewDraft } from '../../src/localization/reviewDrafts/fr-FR.ts'
import { itITReviewDraft } from '../../src/localization/reviewDrafts/it-IT.ts'
import { plPLReviewDraft } from '../../src/localization/reviewDrafts/pl-PL.ts'
import { ptBRReviewDraft } from '../../src/localization/reviewDrafts/pt-BR.ts'
import { zhHansReviewDraft } from '../../src/localization/reviewDrafts/zh-Hans.ts'
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
  'es-ES': { translations: esESReviewDraft, createXliff: true },
  'it-IT': { translations: itITReviewDraft, createXliff: true },
  'pt-BR': { translations: ptBRReviewDraft, createXliff: true },
  'pl-PL': { translations: plPLReviewDraft, createXliff: true },
  'zh-Hans': { translations: zhHansReviewDraft, createXliff: true },
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
    const staged = !metadata.runtimeAvailable ? ' Staged locale onboarding is incomplete.' : ''
    throw new Error(
      `REVIEW_DRAFT_MISSING: ${metadata.trackerLocale} requires an independent draft at ` +
      `${localizationArtifactNames(metadata.trackerLocale).reviewDraft}.${staged}`,
    )
  }
  return { locale: metadata.trackerLocale, artifacts: localizationArtifactNames(metadata.trackerLocale), source }
}
