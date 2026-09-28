/**
 * Purpose:
 *   Resolve browser and user locale choices to the supported locale registry.
 *
 * Architecture:
 *   Owns conservative browser-locale matching and deterministic fallback. It
 *   does not persist preferences or translate messages.
 *
 * Change this file when:
 *   Supported locale matching, fallback, or selector presentation policy changes.
 */
import type {
  SupportedLocale,
} from './types.ts'
import { localeRegistry, localeSelectorLocaleIds } from './registry.ts'

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

/** Data-driven selector metadata follows the settled user-visible order. */
export const supportedLocales = localeSelectorLocaleIds.map((locale) => localeRegistry[locale])

const languageFamilyLocales: Readonly<Record<string, SupportedLocale>> = {
  ja: 'ja-JP',
  fr: 'fr-FR',
  de: 'de-DE',
}

// Some families have one unambiguous supported target. Regional languages do
// not: they require an exact supported region rather than a broad language fallback.
const conservativeRegionalLocales: Readonly<Record<string, SupportedLocale>> = {
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-BR',
  pl: 'pl-PL',
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
    if (languageFamily === 'zh') {
      const subtags = normalized.split('-').slice(1)
      const extensionIndex = subtags.findIndex((subtag) => subtag.length === 1)
      const languageSubtags = extensionIndex === -1 ? subtags : subtags.slice(0, extensionIndex)
      const explicitScript = languageSubtags.find((subtag) => /^[a-z]{4}$/.test(subtag))
      if (explicitScript === 'hans') return 'zh-Hans'
      if (explicitScript !== undefined) continue
      const region = languageSubtags.find((subtag) => /^(?:[a-z]{2}|\d{3})$/.test(subtag))
      if (region === undefined || region === 'cn' || region === 'sg') return 'zh-Hans'
      continue
    }
    const familyLocale = languageFamilyLocales[languageFamily]
    if (familyLocale) return familyLocale
    const conservativeLocale = conservativeRegionalLocales[languageFamily]
    if (conservativeLocale) {
      const target = conservativeLocale.toLowerCase()
      if (normalized === languageFamily || normalized === target || normalized.startsWith(`${target}-`)) {
        return conservativeLocale
      }
      continue
    }
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
