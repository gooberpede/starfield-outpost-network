import type {
  SupportedLocale,
} from './types.ts'
import { localeRegistry } from './registry.ts'

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

/** Data-driven selector metadata comes from the central locale registry. */
export const supportedLocales = Object.values(localeRegistry)

const languageFamilyLocales: Readonly<Record<string, SupportedLocale>> = {
  ja: 'ja-JP',
  fr: 'fr-FR',
  de: 'de-DE',
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return supportedLocales.some(({ id }) => id === value)
}

export function resolveBrowserLocale(
  languages: readonly string[] | null | undefined,
): SupportedLocale {
  for (const language of languages ?? []) {
    const normalized = language.trim().toLowerCase()
    const languageFamily = normalized.split('-', 1)[0]
    const familyLocale = languageFamilyLocales[languageFamily]
    if (familyLocale) return familyLocale
    if (normalized === 'en-us' || normalized.startsWith('en-us-')) return 'en-US'
    if (normalized === 'en' || normalized.startsWith('en-')) return 'en-GB'
  }
  return DEFAULT_LOCALE
}

export function resolveEffectiveLocale(
  localeOverride: SupportedLocale | null,
  browserLanguages: readonly string[] | null | undefined,
): SupportedLocale {
  return localeOverride ?? resolveBrowserLocale(browserLanguages)
}

export function getBrowserLanguages(
  browserNavigator: Partial<Pick<Navigator, 'language' | 'languages'>> | undefined =
    typeof navigator === 'undefined' ? undefined : navigator,
): readonly string[] {
  if (!browserNavigator) return []
  if (browserNavigator.languages && browserNavigator.languages.length > 0) {
    return browserNavigator.languages
  }
  return browserNavigator.language ? [browserNavigator.language] : []
}

export interface LocaleSelectorOption {
  value: SupportedLocale | 'automatic'
  label: string
}

export function getLocaleSelectorOptions(
  automaticLocale: SupportedLocale,
  automaticOptionLabel?: string,
): LocaleSelectorOption[] {
  const automaticLabel = supportedLocales.find(({ id }) => id === automaticLocale)?.shortLabel ??
    DEFAULT_LOCALE.toUpperCase()
  return [
    { value: 'automatic', label: automaticOptionLabel ?? `Automatic (${automaticLabel})` },
    ...supportedLocales.map(({ id, displayName }) => ({ value: id, label: displayName })),
  ]
}
