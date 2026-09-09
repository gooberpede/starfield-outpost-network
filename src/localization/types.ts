export const supportedLocaleIds = ['en-US', 'en-GB'] as const
export type SupportedLocale = typeof supportedLocaleIds[number]

export interface ApplicationPreferences {
  localeOverride: SupportedLocale | null
}

export interface LocaleMetadata {
  id: SupportedLocale
  shortLabel: string
  displayName: string
}

export type MessageKey =
  | 'locale.selector.label'
  | 'locale.selector.automatic'
  | 'network.delete.button'
  | 'network.delete.confirmTitle'
  | 'network.delete.explanation'
  | 'network.delete.undoHint'
  | 'outpost.defaultName'
  | 'validation.issueCount'
  | 'validation.manufacturingInputUnavailable'
  | 'validation.plannedSupplyUnresolved'
  | 'help.inorganicPresentRecorded'
  | 'help.inorganicPresentPossible'

export type MessageParameters = Record<string, string | number>
export type MessageCatalogue = Record<MessageKey, string>
export type LocaleOverrides = Partial<MessageCatalogue>
