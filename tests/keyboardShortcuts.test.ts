import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getAdjacentOutpostId,
  getOutpostShortcut,
  handleOutpostShortcut,
  isEditableShortcutTarget,
} from '../src/ui/keyboardShortcuts.ts'

const shortcut = {
  ctrlKey: true,
  altKey: true,
  shiftKey: false,
  metaKey: false,
  key: 'n',
  repeat: false,
  target: null,
}

test('outpost shortcuts recognize add, previous, and next', () => {
  assert.equal(getOutpostShortcut(shortcut), 'add')
  assert.equal(getOutpostShortcut({ ...shortcut, key: 'N' }), 'add')
  assert.equal(getOutpostShortcut({ ...shortcut, key: 'ArrowUp' }), 'previous')
  assert.equal(getOutpostShortcut({ ...shortcut, key: 'ArrowDown' }), 'next')
  assert.equal(getOutpostShortcut({ ...shortcut, key: 'v' }), null)
})

test('outpost shortcuts ignore repeats, other modifiers, and editable targets', () => {
  assert.equal(getOutpostShortcut({ ...shortcut, repeat: true }), null)
  assert.equal(getOutpostShortcut({ ...shortcut, ctrlKey: false }), null)
  assert.equal(getOutpostShortcut({ ...shortcut, shiftKey: true }), null)

  for (const tagName of ['INPUT', 'textarea', 'Select']) {
    const target = { tagName } as unknown as EventTarget
    assert.equal(isEditableShortcutTarget(target), true)
    assert.equal(getOutpostShortcut({ ...shortcut, target }), null)
  }

  const editableTarget = {
    tagName: 'DIV',
    isContentEditable: true,
  } as unknown as EventTarget
  assert.equal(isEditableShortcutTarget(editableTarget), true)
  assert.equal(getOutpostShortcut({ ...shortcut, target: editableTarget }), null)
})

test('adjacent selection follows current order in either direction', () => {
  const outpostIds = ['outpost-3', 'outpost-1', 'outpost-2']

  assert.equal(getAdjacentOutpostId(outpostIds, 'outpost-1', 'previous'), 'outpost-3')
  assert.equal(getAdjacentOutpostId(outpostIds, 'outpost-1', 'next'), 'outpost-2')
})

test('adjacent selection wraps using the current reordered sequence', () => {
  const outpostIds = ['outpost-3', 'outpost-1', 'outpost-2']

  assert.equal(getAdjacentOutpostId(outpostIds, 'outpost-3', 'previous'), 'outpost-2')
  assert.equal(getAdjacentOutpostId(outpostIds, 'outpost-2', 'next'), 'outpost-3')
})

test('adjacent selection ignores empty, single-item, and invalid selections', () => {
  assert.equal(getAdjacentOutpostId([], '', 'previous'), null)
  assert.equal(getAdjacentOutpostId([], '', 'next'), null)
  assert.equal(getAdjacentOutpostId(['outpost-1'], 'outpost-1', 'previous'), null)
  assert.equal(getAdjacentOutpostId(['outpost-1'], 'outpost-1', 'next'), null)
  assert.equal(
    getAdjacentOutpostId(['outpost-3', 'outpost-1', 'outpost-2'], 'missing', 'next'),
    null,
  )
})

test('default is prevented only when the application performs an action', () => {
  let preventedCount = 0
  const event = {
    ...shortcut,
    preventDefault: () => { preventedCount += 1 },
  }

  assert.equal(handleOutpostShortcut(event, () => true), true)
  assert.equal(preventedCount, 1)
  assert.equal(handleOutpostShortcut(event, () => false), false)
  assert.equal(preventedCount, 1)
  assert.equal(
    handleOutpostShortcut({ ...event, repeat: true }, () => true),
    false,
  )
  assert.equal(preventedCount, 1)
})
