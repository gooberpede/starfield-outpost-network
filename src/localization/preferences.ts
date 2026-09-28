/**
 * Purpose:
 *   Load and save presentation-only localization preferences.
 *
 * Architecture:
 *   Uses a separate best-effort browser record from network persistence.
 *   Preference failures fall back silently and never affect network data,
 *   import/export, or Undo/Redo.
 *
 * Change this file when:
 *   Application preference shape or its browser-storage policy changes.
 */
import { isSupportedLocale } from './locale.ts'
import type { ApplicationPreferences, SupportedLocale } from './types.ts'

export const APPLICATION_PREFERENCES_STORAGE_KEY =
  'starfield-outpost-network-preferences'

const defaultPreferences: ApplicationPreferences = { localeOverride: null }

export function loadApplicationPreferences(
  storage?: Pick<Storage, 'getItem'>,
): ApplicationPreferences {
  try {
    const stored = (storage ?? localStorage).getItem(APPLICATION_PREFERENCES_STORAGE_KEY)
    if (!stored) return defaultPreferences
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
  storage?: Pick<Storage, 'setItem'>,
): void {
  try {
    (storage ?? localStorage).setItem(APPLICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Preferences are best-effort and remain live in provider state.
  }
}
