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
  | 'matrix.tooltip.producing.active'
  | 'matrix.tooltip.producing.inactive'
  | 'matrix.tooltip.manufacturing.blocked'
  | 'matrix.tooltip.input.available'
  | 'matrix.tooltip.input.unavailable'
  | 'matrix.tooltip.export.active'
  | 'matrix.tooltip.export.inactive'
  | 'matrix.tooltip.import.active'
  | 'search.input.label'
  | 'search.input.placeholder'
  | 'search.input.description'
  | 'search.submit'
  | 'search.autocomplete.resource'
  | 'search.autocomplete.product'
  | 'search.results.title'
  | 'search.results.found'
  | 'search.results.notFound'
  | 'search.results.close'
  | 'search.results.flag.present'
  | 'search.results.flag.producing'
  | 'search.results.flag.missingInputs'
  | 'search.results.flag.importing'
  | 'search.results.flag.exporting'
  | 'search.results.flag.plannedSupply'
  | 'search.results.dragInstructions'

export type MessageParameters = Record<string, string | number>
export type MessageCatalogue = Record<MessageKey, string>
export type LocaleOverrides = Partial<MessageCatalogue>
