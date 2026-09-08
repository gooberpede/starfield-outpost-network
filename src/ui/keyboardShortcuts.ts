/**
 * Pure recognition and selection helpers for application-wide shortcuts.
 *
 * Keeping shortcut policy outside React lets every global shortcut share the
 * same editing guard while application callbacks retain ownership of effects.
 */

export type OutpostShortcut = 'add' | 'previous' | 'next'

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
