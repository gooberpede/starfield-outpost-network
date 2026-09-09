import { isSupportedLocale } from './locale.ts'
import type { ApplicationPreferences, SupportedLocale } from './types.ts'

export const APPLICATION_PREFERENCES_STORAGE_KEY =
  'starfield-outpost-network-preferences'

const defaultPreferences: ApplicationPreferences = { localeOverride: null }

export function loadApplicationPreferences(
  storage: Pick<Storage, 'getItem'> = localStorage,
): ApplicationPreferences {
  const stored = storage.getItem(APPLICATION_PREFERENCES_STORAGE_KEY)
  if (!stored) return defaultPreferences
  try {
    const localeOverride = (JSON.parse(stored) as { localeOverride?: unknown }).localeOverride
    return {
      localeOverride: localeOverride === null || isSupportedLocale(localeOverride)
        ? localeOverride as SupportedLocale | null
        : null,
    }
  } catch {
    return defaultPreferences
  }
}

export function saveApplicationPreferences(
  preferences: ApplicationPreferences,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(APPLICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

