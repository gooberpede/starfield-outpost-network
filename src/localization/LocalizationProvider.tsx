import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translate } from './catalog.ts'
import { LocalizationContext } from './LocalizationContext.ts'
import { getBrowserLanguages, resolveBrowserLocale, resolveEffectiveLocale } from './locale.ts'
import { loadApplicationPreferences, saveApplicationPreferences } from './preferences.ts'
import type { SupportedLocale } from './types.ts'
import { setDocumentLanguage } from './documentLanguage.ts'

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadApplicationPreferences)
  const browserLanguages = getBrowserLanguages()
  const automaticLocale = resolveBrowserLocale(browserLanguages)
  const locale = resolveEffectiveLocale(preferences.localeOverride, browserLanguages)

  useEffect(() => {
    setDocumentLanguage(locale)
  }, [locale])

  const value = useMemo(() => ({
    locale,
    automaticLocale,
    localeOverride: preferences.localeOverride,
    setLocaleOverride(localeOverride: SupportedLocale | null) {
      const next = { localeOverride }
      saveApplicationPreferences(next)
      setPreferences(next)
    },
    t: (key: Parameters<typeof translate>[1], parameters?: Parameters<typeof translate>[2]) =>
      translate(locale, key, parameters),
  }), [automaticLocale, locale, preferences.localeOverride])

  return <LocalizationContext value={value}>{children}</LocalizationContext>
}
