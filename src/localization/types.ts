export const supportedLocaleIds = [
  'en-US', 'en-GB', 'ja-JP', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'pl-PL',
  'zh-Hans',
] as const
export type SupportedLocale = typeof supportedLocaleIds[number]

export interface ApplicationPreferences {
  localeOverride: SupportedLocale | null
}

export interface LocaleMetadata {
  id: SupportedLocale
  shortLabel: string
  displayName: string
}

import type { enUSMessages } from './locales/en-US.ts'

export type MessageKey = keyof typeof enUSMessages

export type MessageParameters = Record<string, string | number>
export type MessageCatalogue = Record<MessageKey, string>
export type LocaleOverrides = Partial<MessageCatalogue>

/** A relocalizable user-facing message retained as semantic session/domain data. */
export interface MessageDescriptor {
  key: MessageKey
  parameters?: MessageParameters
}
