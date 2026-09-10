/**
 * Pure recognition and selection helpers for application-wide shortcuts.
 *
 * Keeping shortcut policy outside React lets every global shortcut share the
 * same editing guard while application callbacks retain ownership of effects.
 */

export type OutpostShortcut = 'add' | 'previous' | 'next'
export type HistoryShortcut = 'undo' | 'redo'

type ShortcutEvent = Pick<
  KeyboardEvent,
  | 'altKey'
  | 'ctrlKey'
  | 'key'
  | 'metaKey'
  | 'repeat'
  | 'shiftKey'
  | 'target'
>

const textEditingInputTypes = new Set([
  '',
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
])

/**
 * Identifies controls whose native editing history must take precedence over
 * the application's collection history.
 */
export function isTextEditingShortcutTarget(
  target: EventTarget | null,
): boolean {
  const candidate = target as {
    tagName?: unknown
    type?: unknown
    isContentEditable?: unknown
  } | null
  const tagName = typeof candidate?.tagName === 'string'
    ? candidate.tagName.toLowerCase()
    : ''

  if (tagName === 'textarea') return true
  if (tagName === 'input') {
    const inputType = typeof candidate?.type === 'string'
      ? candidate.type.toLowerCase()
      : ''
    return textEditingInputTypes.has(inputType)
  }

  // HTMLElement.isContentEditable includes inherited contenteditable state,
  // so descendants of an editable host are protected as well as the host.
  return candidate?.isContentEditable === true
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  const candidate = target as {
    tagName?: unknown
    isContentEditable?: unknown
  } | null
  const tagName = typeof candidate?.tagName === 'string'
    ? candidate.tagName.toLowerCase()
    : ''

  return tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    candidate?.isContentEditable === true
}

function hasGlobalShortcutModifiers(event: ShortcutEvent): boolean {
  return event.ctrlKey &&
    event.altKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.repeat &&
    !isEditableShortcutTarget(event.target)
}

export function getOutpostShortcut(
  event: ShortcutEvent,
): OutpostShortcut | null {
  if (!hasGlobalShortcutModifiers(event)) return null

  if (event.key.toLowerCase() === 'n') return 'add'
  if (event.key === 'ArrowUp') return 'previous'
  if (event.key === 'ArrowDown') return 'next'
  return null
}

export function getAdjacentOutpostId(
  outpostIds: readonly string[],
  selectedOutpostId: string,
  direction: 'previous' | 'next',
): string | null {
  if (outpostIds.length <= 1) return null

  const currentIndex = outpostIds.indexOf(selectedOutpostId)
  if (currentIndex === -1) return null

  const targetIndex = direction === 'previous'
    ? (currentIndex - 1 + outpostIds.length) % outpostIds.length
    : (currentIndex + 1) % outpostIds.length

  return outpostIds[targetIndex]
}

export function handleOutpostShortcut(
  event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>,
  onShortcut: (shortcut: OutpostShortcut) => boolean,
): boolean {
  const shortcut = getOutpostShortcut(event)
  if (!shortcut || !onShortcut(shortcut)) return false

  event.preventDefault()
  return true
}

export function getHistoryShortcut(
  event: ShortcutEvent,
): HistoryShortcut | null {
  if (
    !event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.repeat ||
    isTextEditingShortcutTarget(event.target)
  ) {
    return null
  }

  const key = event.key.toLowerCase()
  if (key === 'z') return event.shiftKey ? 'redo' : 'undo'
  if (key === 'y' && !event.shiftKey) return 'redo'
  return null
}

export function handleHistoryShortcut(
  event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>,
  options: {
    isModalOpen: boolean
    canUndo: boolean
    canRedo: boolean
    onUndo: () => void
    onRedo: () => void
  },
): boolean {
  const shortcut = getHistoryShortcut(event)
  if (!shortcut || options.isModalOpen) return false

  if (shortcut === 'undo') {
    if (!options.canUndo) return false
    options.onUndo()
  } else {
    if (!options.canRedo) return false
    options.onRedo()
  }

  event.preventDefault()
  return true
}

export function isSearchFocusShortcut(event: ShortcutEvent): boolean {
  return event.key === '/' &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.repeat &&
    !isTextEditingShortcutTarget(event.target)
}

export function handleSearchFocusShortcut(
  event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>,
  options: { isModalOpen: boolean; focusSearch: () => boolean },
): boolean {
  if (!isSearchFocusShortcut(event) || options.isModalOpen || !options.focusSearch()) return false
  event.preventDefault()
  return true
}
