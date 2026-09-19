/**
 * Pure interaction helpers for the Validation diagnostic worklist.
 *
 * Keeping these decisions outside the React component makes the shortcut and
 * roving-focus rules directly testable without coupling domain validation to
 * browser presentation state.
 */

import type { ValidationIssue } from '../domain/validation/types'
import {
  getShortcutForAction,
  type ShortcutEvent,
} from './keyboardShortcuts.ts'

export {
  isEditableShortcutTarget as isEditableValidationTarget,
} from './keyboardShortcuts.ts'

export type ValidationRovingKey =
  | 'ArrowDown'
  | 'ArrowUp'
  | 'Home'
  | 'End'

export function isValidationIssueActionable(
  issue: ValidationIssue,
  validOutpostIds: ReadonlySet<string>,
): boolean {
  return Boolean(issue.outpostId && validOutpostIds.has(issue.outpostId))
}

export function activateValidationIssue(
  issue: ValidationIssue,
  validOutpostIds: ReadonlySet<string>,
  onNavigateToIssue: (issue: ValidationIssue) => void,
): boolean {
  if (!isValidationIssueActionable(issue, validOutpostIds)) return false

  onNavigateToIssue(issue)
  return true
}

export function getValidationIssueIdentity(issue: ValidationIssue): string {
  return JSON.stringify([
    issue.ruleId,
    issue.outpostId ?? '',
    issue.cargoLinkId ?? '',
    issue.cargoPadId ?? '',
    issue.cargoItem?.type ?? '',
    issue.cargoItem?.id ?? '',
    issue.productId ?? '',
    issue.speciesId ?? '',
    issue.bodyBiomeId ?? '',
    issue.messageKey,
    issue.parameters ?? {},
  ])
}

export function getValidationRovingIndex(
  currentIndex: number,
  key: ValidationRovingKey,
  issueCount: number,
): number | null {
  if (issueCount === 0) return null

  if (key === 'Home') return 0
  if (key === 'End') return issueCount - 1

  const safeIndex = Math.min(
    Math.max(currentIndex, 0),
    issueCount - 1,
  )

  return key === 'ArrowDown'
    ? Math.min(safeIndex + 1, issueCount - 1)
    : Math.max(safeIndex - 1, 0)
}

export function isValidationActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' '
}

export function shouldHandleValidationShortcut(event: ShortcutEvent): boolean {
  return getShortcutForAction(event, ['toggle-validation']) !== null
}

export function handleValidationShortcut(
  event: ShortcutEvent & Pick<KeyboardEvent, 'preventDefault'>,
  onHandled: () => void,
  isModalOpen = false,
): boolean {
  if (isModalOpen || !shouldHandleValidationShortcut(event)) return false

  event.preventDefault()
  onHandled()
  return true
}
