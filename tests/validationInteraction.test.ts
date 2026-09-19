import assert from 'node:assert/strict'
import test from 'node:test'

import {
  activateValidationIssue,
  getValidationIssueIdentity,
  getValidationRovingIndex,
  handleValidationShortcut,
  isValidationActivationKey,
  isEditableValidationTarget,
  shouldHandleValidationShortcut,
} from '../src/ui/validationInteraction.ts'

import type { ValidationIssue } from '../src/domain/validation/types.ts'

test('only issues with a valid outpost invoke the navigation callback', () => {
  const navigatedIssues: ValidationIssue[] = []
  const actionableIssue: ValidationIssue = {
    ruleId: 'test-rule', category: 'supply', severity: 'warning',
    messageKey: 'validation.plannedSupplyUnresolved', outpostId: 'outpost-2',
  }
  const validOutpostIds = new Set(['outpost-2'])

  assert.equal(
    activateValidationIssue(actionableIssue, validOutpostIds, (issue) => {
      navigatedIssues.push(issue)
    }),
    true,
  )
  assert.equal(navigatedIssues[0], actionableIssue)

  assert.equal(
    activateValidationIssue(
      { ...actionableIssue, outpostId: undefined },
      validOutpostIds,
      (issue) => { navigatedIssues.push(issue) },
    ),
    false,
  )
  assert.equal(
    activateValidationIssue(
      { ...actionableIssue, outpostId: 'missing-outpost' },
      validOutpostIds,
      (issue) => { navigatedIssues.push(issue) },
    ),
    false,
  )
  assert.equal(navigatedIssues.length, 1)
})

test('validation issue identity follows stable target metadata', () => {
  const issue: ValidationIssue = {
    ruleId: 'test-rule', category: 'supply', severity: 'warning',
    messageKey: 'validation.plannedSupplyUnresolved', outpostId: 'outpost-2', cargoPadId: 'pad-1',
  }
  assert.equal(getValidationIssueIdentity(issue), getValidationIssueIdentity({ ...issue }))
  assert.notEqual(
    getValidationIssueIdentity(issue),
    getValidationIssueIdentity({ ...issue, outpostId: 'outpost-3' }),
  )
})

test('validation roving focus clamps and supports Home and End', () => {
  assert.equal(getValidationRovingIndex(1, 'ArrowDown', 3), 2)
  assert.equal(getValidationRovingIndex(2, 'ArrowDown', 3), 2)
  assert.equal(getValidationRovingIndex(1, 'ArrowUp', 3), 0)
  assert.equal(getValidationRovingIndex(0, 'ArrowUp', 3), 0)
  assert.equal(getValidationRovingIndex(1, 'Home', 3), 0)
  assert.equal(getValidationRovingIndex(1, 'End', 3), 2)
  assert.equal(getValidationRovingIndex(0, 'End', 0), null)
  assert.equal(isValidationActivationKey('Enter'), true)
  assert.equal(isValidationActivationKey(' '), true)
  assert.equal(isValidationActivationKey('Escape'), false)
})

test('Ctrl+Alt+V handling ignores repeats and editable targets', () => {
  const shortcut = {
    ctrlKey: true,
    altKey: true,
    shiftKey: false,
    metaKey: false,
    key: 'v',
    repeat: false,
    target: null,
  }
  assert.equal(shouldHandleValidationShortcut(shortcut), true)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, key: 'V' }), true)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, repeat: true }), false)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, ctrlKey: false }), false)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, shiftKey: true }), false)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, isComposing: true }), false)
  assert.equal(shouldHandleValidationShortcut({
    ...shortcut, getModifierState: (name) => name === 'AltGraph',
  }), false)

  for (const tagName of ['INPUT', 'textarea', 'Select']) {
    const target = { tagName } as unknown as EventTarget
    assert.equal(isEditableValidationTarget(target), true)
    assert.equal(shouldHandleValidationShortcut({ ...shortcut, target }), false)
  }

  const editableTarget = { tagName: 'DIV', isContentEditable: true } as unknown as EventTarget
  assert.equal(isEditableValidationTarget(editableTarget), true)
  assert.equal(shouldHandleValidationShortcut({ ...shortcut, target: editableTarget }), false)
})

test('handled shortcuts prevent default and toggle while ignored events remain untouched', () => {
  let isOpen = false
  let preventedCount = 0
  const event = {
    ctrlKey: true,
    altKey: true,
    shiftKey: false,
    metaKey: false,
    key: 'v',
    repeat: false,
    target: null,
    preventDefault: () => { preventedCount += 1 },
  }

  assert.equal(handleValidationShortcut(event, () => { isOpen = !isOpen }), true)
  assert.equal(isOpen, true)
  assert.equal(handleValidationShortcut(event, () => { isOpen = !isOpen }), true)
  assert.equal(isOpen, false)
  assert.equal(preventedCount, 2)

  assert.equal(
    handleValidationShortcut({ ...event, repeat: true }, () => { isOpen = !isOpen }),
    false,
  )
  assert.equal(isOpen, false)
  assert.equal(preventedCount, 2)

  assert.equal(
    handleValidationShortcut(event, () => { isOpen = !isOpen }, true),
    false,
  )
  assert.equal(isOpen, false)
  assert.equal(preventedCount, 2)
})
