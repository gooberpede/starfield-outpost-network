/** Declarative metadata and pure policy for application command shortcuts. */
import type { MessageKey, SupportedLocale } from '../localization/types.ts'

export type ShortcutActionId = 'undo' | 'redo' | 'focus-search' | 'add-outpost' | 'previous-outpost' | 'next-outpost' | 'toggle-validation'
export type ShortcutId = 'undo-ctrl-z' | 'redo-ctrl-y' | 'redo-ctrl-shift-z' | 'focus-search-slash' | 'add-outpost-ctrl-alt-n' | 'previous-outpost-ctrl-alt-arrow-up' | 'next-outpost-ctrl-alt-arrow-down' | 'toggle-validation-ctrl-alt-v'
export type ShortcutFocusPolicy = 'text-editing' | 'broad-editable'
export type ShortcutGroupId = 'history' | 'search' | 'outpost-navigation' | 'validation'

export interface ShortcutDefinition {
  id: ShortcutId
  action: ShortcutActionId
  chord: { key: string; match: 'key' | 'code'; ctrl: boolean; alt: boolean; shift: boolean | 'optional'; meta: boolean }
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
  { id: 'add-outpost-ctrl-alt-n', action: 'add-outpost', chord: { key: 'n', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.addOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'previous-outpost-ctrl-alt-arrow-up', action: 'previous-outpost', chord: { key: 'ArrowUp', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.previousOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
  { id: 'next-outpost-ctrl-alt-arrow-down', action: 'next-outpost', chord: { key: 'ArrowDown', match: 'key', ctrl: true, alt: true, shift: false, meta: false }, labelKey: 'shortcuts.action.nextOutpost', group: 'outpost-navigation', groupKey: 'shortcuts.group.outpostNavigation', scope: 'application', focusPolicy: 'broad-editable' },
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
  tokens.push(definition.chord.key.length === 1 ? definition.chord.key.toLocaleUpperCase() : definition.chord.key.replace('Arrow', 'Arrow '))
  return tokens
}

export function formatShortcutChord(definition: ShortcutDefinition): string {
  return getShortcutChordTokens(definition).join(' + ')
}

export function formatAccessibleShortcutChord(definition: ShortcutDefinition, locale: SupportedLocale = 'en-US'): string {
  const separator = locale === 'ja-JP' ? '、' : ' plus '
  return getShortcutChordTokens(definition).map((token) => token.replace('Ctrl', 'Control').replace('Arrow', locale === 'ja-JP' ? '矢印' : 'Arrow')).join(separator)
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
