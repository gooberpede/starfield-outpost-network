import { enGBMessages } from './locales/en-GB.ts'
import { enUSMessages } from './locales/en-US.ts'
import { jaJPMessages } from './locales/ja-JP.ts'
import type { LocaleMetadata, LocaleOverrides, SupportedLocale } from './types.ts'

export interface LocaleRegistration extends LocaleMetadata {
  messages: LocaleOverrides
}

/** The single registration point for supported locale modules and metadata. */
export const localeRegistry: Record<SupportedLocale, LocaleRegistration> = {
  'en-US': {
    id: 'en-US', shortLabel: 'EN-US', displayName: 'English (US)', messages: enUSMessages,
  },
  'en-GB': {
    id: 'en-GB', shortLabel: 'EN-GB', displayName: 'English (UK)', messages: enGBMessages,
  },
  'ja-JP': {
    id: 'ja-JP', shortLabel: '日本語', displayName: '日本語', messages: jaJPMessages,
  },
}
