import { enGBMessages } from './locales/en-GB.ts'
import { enUSMessages } from './locales/en-US.ts'
import { frFRMessages } from './locales/fr-FR.ts'
import { deDEMessages } from './locales/de-DE.ts'
import { jaJPMessages } from './locales/ja-JP.ts'
import { esESMessages } from './locales/es-ES.ts'
import { itITMessages } from './locales/it-IT.ts'
import { ptBRMessages } from './locales/pt-BR.ts'
import { plPLMessages } from './locales/pl-PL.ts'
import { zhHansMessages } from './locales/zh-Hans.ts'
import type { LocaleMetadata, LocaleOverrides, SupportedLocale } from './types.ts'

export interface LocaleRegistration extends LocaleMetadata {
  messages: LocaleOverrides
}

/** User-visible selector order: English variants first, then English language-name order. */
export const localeSelectorLocaleIds: readonly SupportedLocale[] = [
  'en-US', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'pl-PL', 'pt-BR', 'zh-Hans', 'es-ES',
]

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
  'fr-FR': {
    id: 'fr-FR', shortLabel: 'FR-FR', displayName: 'Français (France)', messages: frFRMessages,
  },
  'de-DE': {
    id: 'de-DE', shortLabel: 'DE-DE', displayName: 'Deutsch (Deutschland)', messages: deDEMessages,
  },
  'es-ES': {
    id: 'es-ES', shortLabel: 'ES-ES', displayName: 'Español (España)', messages: esESMessages,
  },
  'it-IT': {
    id: 'it-IT', shortLabel: 'IT-IT', displayName: 'Italiano (Italia)', messages: itITMessages,
  },
  'pt-BR': {
    id: 'pt-BR', shortLabel: 'PT-BR', displayName: 'Português (Brasil)', messages: ptBRMessages,
  },
  'pl-PL': {
    id: 'pl-PL', shortLabel: 'PL-PL', displayName: 'Polski (Polska)', messages: plPLMessages,
  },
  'zh-Hans': {
    id: 'zh-Hans', shortLabel: '简体中文', displayName: '简体中文', messages: zhHansMessages,
  },
}
