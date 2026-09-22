/** Declarative metadata and pure policy for application command shortcuts. */
import type { MessageKey, SupportedLocale } from '../localization/types.ts'

export type ShortcutActionId = 'undo' | 'redo' | 'focus-search' | 'focus-search-results' | 'add-outpost' | 'previous-outpost' | 'next-outpost' | 'toggle-validation' | 'import' | 'export' | 'add-cargo-link' | 'expand-all-cargo-links' | 'collapse-all-cargo-links' | 'focus-navigation' | 'toggle-navigation' | 'focus-outpost-details' | 'focus-resource-matrix' | 'focus-cargo-links' | 'focus-planned-supply' | 'focus-first-inorganic' | 'focus-first-organic' | 'focus-manufacturing-action'
export type ShortcutId = 'undo-ctrl-z' | 'redo-ctrl-y' | 'redo-ctrl-shift-z' | 'focus-search-slash' | 'add-outpost-ctrl-alt-n' | 'previous-outpost-ctrl-alt-arrow-up' | 'next-outpost-ctrl-alt-arrow-down' | 'toggle-validation-ctrl-alt-v' | 'import-ctrl-alt-o' | 'export-ctrl-alt-s' | 'add-cargo-link-ctrl-alt-a' | 'expand-all-cargo-links-ctrl-alt-comma' | 'collapse-all-cargo-links-ctrl-alt-period' | 'focus-navigation-ctrl-alt-b' | 'toggle-navigation-ctrl-alt-w' | 'focus-outpost-details-ctrl-alt-t' | 'focus-resource-matrix-ctrl-alt-g' | 'focus-cargo-links-ctrl-alt-c' | 'focus-planned-supply-ctrl-alt-p' | 'focus-search-results-ctrl-alt-j' | 'focus-first-inorganic-ctrl-alt-digit1' | 'focus-first-organic-ctrl-alt-digit2' | 'focus-manufacturing-action-ctrl-alt-digit3'
export type ShortcutFocusPolicy = 'text-editing' | 'broad-editable'
export type ShortcutGroupId = 'history' | 'search' | 'outpost-navigation' | 'workspace' | 'resource-matrix' | 'cargo-links' | 'import-export' | 'validation'

export interface ShortcutDefinition {
  id: ShortcutId
  action: ShortcutActionId
  chord: { key: string; displayKey?: string; match: 'key' | 'code'; ctrl: boolean; alt: boolean; shift: boolean | 'optional'; meta: boolean }
  labelKey: MessageKey
  group: ShortcutGroupId
  groupKey: MessageKey
  scope: 'application'
  focusPolicy: ShortcutFocusPolicy
  aliasOf?: ShortcutId
}

export const shortcutRegistry: readonly ShortcutDefinition[] = [
  { id: 'undo-ctrl-z', action: 'undo', chord: { key: 'z', match: 'key', ctrl: true, alt: false, shift: false, meta: false }, labelKey: 'shortcuts.action.undo', group: 'history', groupKey: 'shortcuts.group.history', scope: 'application', focusPolicy: 'text-editing' },
  { id: 'redo-ctrl-y', action: 'redo', chord: { key: 'y', match: 'key', ctrl: true, alt: false, shift: false, meta: false }, labelKey: 'shortcuts.action.redo', group: 'history', groupKey: 'shortcuts.group.history', scope: 'application', focusPolicy: 'text-editing' },
  { id: 'redo-ctrl-shift-z', action: 'redo', chord: { key: 'z', match: 'key', ctrl: true, alt: false, shift: true, meta: false }, labelKey: 'shortcuts.action.redo', group: 'history', groupKey: 'shortcuts.group.history', scope: 'application', focusPolicy: 'text-editing', aliasOf: 'redo-ctrl-y' },
  { id: 'focus-search-slash', action: 'focus-search', chord: { key: '/', match: 'key', ctrl: false, alt: false, shift: 'optional', meta: false }, labelKey: 'shortcuts.action.focusSearch', group: 'search', groupKey: 'shortcuts.group.search', scope: 'application', focusPolicy: 'text-editing' },
  { id: 'focus-search-results-ctrl-alt-j', action: 'focus-search-results', chord: { key: 'j', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusSearchResults', group: 'search', groupKey: 'shortcuts.group.search', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'add-outpost-ctrl-alt-n', action: 'add-outpost', chord: { key: 'n', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.addOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'previous-outpost-ctrl-alt-arrow-up', action: 'previous-outpost', chord: { key: 'ArrowUp', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.previousOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'next-outpost-ctrl-alt-arrow-down', action: 'next-outpost', chord: { key: 'ArrowDown', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.nextOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'toggle-navigation-ctrl-alt-w', action: 'toggle-navigation', chord: { key: 'w', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.toggleNavigation', group: 'workspace', groupKey: 'shortcuts.group.workspace', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-navigation-ctrl-alt-b', action: 'focus-navigation', chord: { key: 'b', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusNavigation', group: 'workspace', groupKey: 'shortcuts.group.workspace', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-outpost-details-ctrl-alt-t', action: 'focus-outpost-details', chord: { key: 't', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusOutpostDetails', group: 'workspace', groupKey: 'shortcuts.group.workspace', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-planned-supply-ctrl-alt-p', action: 'focus-planned-supply', chord: { key: 'p', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusPlannedSupply', group: 'workspace', groupKey: 'shortcuts.group.workspace', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-resource-matrix-ctrl-alt-g', action: 'focus-resource-matrix', chord: { key: 'g', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusResourceMatrix', group: 'resource-matrix', groupKey: 'shortcuts.group.resourceMatrix', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-first-inorganic-ctrl-alt-digit1', action: 'focus-first-inorganic', chord: { key: 'Digit1', displayKey: '1', match: 'code', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusFirstInorganic', group: 'resource-matrix', groupKey: 'shortcuts.group.resourceMatrix', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-first-organic-ctrl-alt-digit2', action: 'focus-first-organic', chord: { key: 'Digit2', displayKey: '2', match: 'code', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusFirstOrganic', group: 'resource-matrix', groupKey: 'shortcuts.group.resourceMatrix', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-manufacturing-action-ctrl-alt-digit3', action: 'focus-manufacturing-action', chord: { key: 'Digit3', displayKey: '3', match: 'code', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusManufacturingAction', group: 'resource-matrix', groupKey: 'shortcuts.group.resourceMatrix', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'focus-cargo-links-ctrl-alt-c', action: 'focus-cargo-links', chord: { key: 'c', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.focusCargoLinks', group: 'cargo-links', groupKey: 'shortcuts.group.cargoLinks', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'add-cargo-link-ctrl-alt-a', action: 'add-cargo-link', chord: { key: 'a', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.addCargoLink', group: 'cargo-links', groupKey: 'shortcuts.group.cargoLinks', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'expand-all-cargo-links-ctrl-alt-comma', action: 'expand-all-cargo-links', chord: { key: 'Comma', displayKey: ',', match: 'code', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.expandAllCargoLinks', group: 'cargo-links', groupKey: 'shortcuts.group.cargoLinks', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'collapse-all-cargo-links-ctrl-alt-period', action: 'collapse-all-cargo-links', chord: { key: 'Period', displayKey: '.', match: 'code', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.collapseAllCargoLinks', group: 'cargo-links', groupKey: 'shortcuts.group.cargoLinks', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'import-ctrl-alt-o', action: 'import', chord: { key: 'o', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.import', group: 'import-export', groupKey: 'shortcuts.group.importExport', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'export-ctrl-alt-s', action: 'export', chord: { key: 's', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.export', group: 'import-export', groupKey: 'shortcuts.group.importExport', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'toggle-validation-ctrl-alt-v', action: 'toggle-validation', chord: { key: 'v', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.toggleValidation', group: 'validation', groupKey: 'shortcuts.group.validation', scope: 'application', focusPolicy: 'broad-editable' },
]

export type ShortcutEvent = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'repeat' | 'shiftKey' | 'target'> & Partial<Pick<KeyboardEvent, 'code' | 'isComposing' | 'getModifierState'>>
const textEditingInputTypes = new Set(['', 'email', 'number', 'password', 'search', 'tel', 'text', 'url'])

export function isTextEditingShortcutTarget(target: EventTarget | null): boolean {
  const candidate = target as { tagName?: unknown; type?: unknown; isContentEditable?: unknown } | null
  const tagName = typeof candidate?.tagName === 'string' ? candidate.tagName.toLowerCase() : ''
  if (tagName === 'textarea') return true
  if (tagName === 'input') {
    const inputType = typeof candidate?.type === 'string' ? candidate.type.toLowerCase() : ''
    return textEditingInputTypes.has(inputType)
  }
  return candidate?.isContentEditable === true
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  const candidate = target as { tagName?: unknown; isContentEditable?: unknown } | null
  const tagName = typeof candidate?.tagName === 'string' ? candidate.tagName.toLowerCase() : ''
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || candidate?.isContentEditable === true
}

function isAltGraphEvent(event: ShortcutEvent): boolean {
  return event.key === 'AltGraph' || event.getModifierState?.call(event, 'AltGraph') === true
}

export function matchesShortcut(event: ShortcutEvent, definition: ShortcutDefinition): boolean {
  if (event.repeat || event.isComposing || isAltGraphEvent(event)) return false
  const { chord } = definition
  if (event.ctrlKey !== chord.ctrl || event.altKey !== chord.alt || event.metaKey !== chord.meta) return false
  if (chord.shift !== 'optional' && event.shiftKey !== chord.shift) return false
  const actual = chord.match === 'code' ? event.code ?? '' : event.key
  const keyMatches = chord.key.length === 1 ? actual.toLocaleLowerCase() === chord.key.toLocaleLowerCase() : actual === chord.key
  if (!keyMatches) return false
  return definition.focusPolicy === 'text-editing' ? !isTextEditingShortcutTarget(event.target) : !isEditableShortcutTarget(event.target)
}

export function getShortcutForAction(event: ShortcutEvent, actions: readonly ShortcutActionId[]): ShortcutDefinition | null {
  return shortcutRegistry.find((definition) => actions.includes(definition.action) && matchesShortcut(event, definition)) ?? null
}

export function getShortcutChordTokens(definition: ShortcutDefinition): string[] {
  const tokens: string[] = []
  if (definition.chord.ctrl) tokens.push('Ctrl')
  if (definition.chord.alt) tokens.push('Alt')
  if (definition.chord.shift === true) tokens.push('Shift')
  const key = definition.chord.displayKey ?? definition.chord.key
  tokens.push(key.length === 1 ? key.toLocaleUpperCase() : key.replace('Arrow', 'Arrow '))
  return tokens
}

export function formatShortcutChord(definition: ShortcutDefinition): string {
  return getShortcutChordTokens(definition).join(' + ')
}

export function formatAccessibleShortcutChord(definition: ShortcutDefinition, locale: SupportedLocale = 'en-US'): string {
  const speech = {
    'en-US': { separator: ' plus ', ctrl: 'Control', shift: 'Shift', arrows: { Up: 'Arrow Up', Down: 'Arrow Down', Left: 'Arrow Left', Right: 'Arrow Right' } },
    'en-GB': { separator: ' plus ', ctrl: 'Control', shift: 'Shift', arrows: { Up: 'Arrow Up', Down: 'Arrow Down', Left: 'Arrow Left', Right: 'Arrow Right' } },
    'ja-JP': { separator: '、', ctrl: 'Control', shift: 'Shift', arrows: { Up: '矢印 Up', Down: '矢印 Down', Left: '矢印 Left', Right: '矢印 Right' } },
    'fr-FR': { separator: ' plus ', ctrl: 'Contrôle', shift: 'Majuscule', arrows: { Up: 'Flèche haut', Down: 'Flèche bas', Left: 'Flèche gauche', Right: 'Flèche droite' } },
    'de-DE': { separator: ' plus ', ctrl: 'Steuerung', shift: 'Umschalttaste', arrows: { Up: 'Pfeil nach oben', Down: 'Pfeil nach unten', Left: 'Pfeil nach links', Right: 'Pfeil nach rechts' } },
    'es-ES': { separator: ' más ', ctrl: 'Control', shift: 'Mayús', arrows: { Up: 'Flecha arriba', Down: 'Flecha abajo', Left: 'Flecha izquierda', Right: 'Flecha derecha' } },
    'it-IT': { separator: ' più ', ctrl: 'Control', shift: 'Maiusc', arrows: { Up: 'Freccia su', Down: 'Freccia giù', Left: 'Freccia sinistra', Right: 'Freccia destra' } },
    'pt-BR': { separator: ' mais ', ctrl: 'Control', shift: 'Shift', arrows: { Up: 'Seta para cima', Down: 'Seta para baixo', Left: 'Seta para a esquerda', Right: 'Seta para a direita' } },
    'pl-PL': { separator: ' plus ', ctrl: 'Control', shift: 'Shift', arrows: { Up: 'Strzałka w górę', Down: 'Strzałka w dół', Left: 'Strzałka w lewo', Right: 'Strzałka w prawo' } },
    'zh-Hans': { separator: '加', ctrl: 'Control', shift: 'Shift', arrows: { Up: '上箭头', Down: '下箭头', Left: '左箭头', Right: '右箭头' } },
  } satisfies Record<SupportedLocale, {
    separator: string
    ctrl: string
    shift: string
    arrows: Record<'Up' | 'Down' | 'Left' | 'Right', string>
  }>
  const localeSpeech = speech[locale]
  return getShortcutChordTokens(definition).map((token) => {
    if (token === 'Ctrl') return localeSpeech.ctrl
    if (token === 'Shift') return localeSpeech.shift
    const arrowDirection = token.match(/^Arrow (Up|Down|Left|Right)$/)?.[1] as
      | 'Up' | 'Down' | 'Left' | 'Right' | undefined
    return arrowDirection ? localeSpeech.arrows[arrowDirection] : token
  }).join(localeSpeech.separator)
}

export type OutpostShortcut = 'add' | 'previous' | 'next'
export type HistoryShortcut = 'undo' | 'redo'

export function getOutpostShortcut(event: ShortcutEvent): OutpostShortcut | null {
  const action = getShortcutForAction(event, ['add-outpost', 'previous-outpost', 'next-outpost'])?.action
  return action === 'add-outpost' ? 'add' : action === 'previous-outpost' ? 'previous' : action === 'next-outpost' ? 'next' : null
}

export function getAdjacentOutpostId(outpostIds: readonly string[], selectedOutpostId: string, direction: 'previous' | 'next'): string | null {
  if (outpostIds.length <= 1) return null
  const currentIndex = outpostIds.indexOf(selectedOutpostId)
  if (currentIndex === -1) return null
  return outpostIds[direction === 'previous' ? (currentIndex - 1 + outpostIds.length) % outpostIds.length : (currentIndex + 1) % outpostIds.length]
}

export function handleOutpostShortcut(event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>, onShortcut: (shortcut: OutpostShortcut) => boolean, isModalOpen = false): boolean {
  const shortcut = getOutpostShortcut(event)
  if (!shortcut || isModalOpen || !onShortcut(shortcut)) return false
  event.preventDefault()
  return true
}

export function getHistoryShortcut(event: ShortcutEvent): HistoryShortcut | null {
  const action = getShortcutForAction(event, ['undo', 'redo'])?.action
  return action === 'undo' || action === 'redo' ? action : null
}

export function handleHistoryShortcut(event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>, options: { isModalOpen: boolean; canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void }): boolean {
  const shortcut = getHistoryShortcut(event)
  if (!shortcut || options.isModalOpen) return false
  if (shortcut === 'undo') { if (!options.canUndo) return false; options.onUndo() } else { if (!options.canRedo) return false; options.onRedo() }
  event.preventDefault()
  return true
}

export function isSearchFocusShortcut(event: ShortcutEvent): boolean {
  return getShortcutForAction(event, ['focus-search']) !== null
}

export function handleSearchFocusShortcut(event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>, options: { isModalOpen: boolean; focusSearch: () => boolean }): boolean {
  if (!isSearchFocusShortcut(event) || options.isModalOpen || !options.focusSearch()) return false
  event.preventDefault()
  return true
}
