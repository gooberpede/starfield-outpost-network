import { translate } from './catalog.ts'
import type { MessageKey, SupportedLocale } from './types.ts'

/** Approved compact copy is scoped to one surface and never replaces semantic messages. */
export type CompactDisplayConcept =
  | 'outpost-details.solar-heading'
  | 'outpost-details.wind-heading'
  | 'item-search.placeholder'

const semanticKeys: Record<CompactDisplayConcept, MessageKey> = {
  'outpost-details.solar-heading': 'outpost.solar.label',
  'outpost-details.wind-heading': 'outpost.wind.label',
  'item-search.placeholder': 'search.input.placeholder',
}

const compactOverrides: Partial<Record<SupportedLocale, Partial<Record<CompactDisplayConcept, string>>>> = {
  'de-DE': {
    'item-search.placeholder': 'Suchen…',
  },
  'fr-FR': {
    'item-search.placeholder': 'Rechercher…',
  },
  'pl-PL': {
    'outpost-details.solar-heading': 'Słońce',
    'outpost-details.wind-heading': 'Wiatr',
  },
}

/** Resolves an approved surface-specific compact form, then the full semantic fallback. */
export function getCompactDisplayText(
  locale: SupportedLocale,
  concept: CompactDisplayConcept,
): string {
  return compactOverrides[locale]?.[concept] ?? translate(locale, semanticKeys[concept])
}
