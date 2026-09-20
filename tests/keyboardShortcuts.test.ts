import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatAccessibleShortcutChord,
  formatShortcutChord,
  getAdjacentOutpostId,
  getHistoryShortcut,
  getOutpostShortcut,
  handleHistoryShortcut,
  handleOutpostShortcut,
  handleSearchFocusShortcut,
  isEditableShortcutTarget,
  isTextEditingShortcutTarget,
  isSearchFocusShortcut,
  matchesShortcut,
  shortcutRegistry,
} from '../src/ui/keyboardShortcuts.ts'
import { enUSMessages } from '../src/localization/locales/en-US.ts'
import { jaJPMessages } from '../src/localization/locales/ja-JP.ts'
import type { NetworkCollection } from '../src/data/networkCollection.ts'
import {
  collectionEditingSessionReducer,
  createCollectionEditingSession,
} from '../src/domain/collectionEditingSession.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { OutpostNetwork } from '../src/domain/models.ts'

const shortcut = {
  ctrlKey: true,
  altKey: true,
  shiftKey: false,
  metaKey: false,
  key: 'n',
  repeat: false,
  target: null,
}

test('registry has unique IDs and chords with only the intentional Redo alias', () => {
  assert.equal(new Set(shortcutRegistry.map(({ id }) => id)).size, shortcutRegistry.length)
  const chordKeys = shortcutRegistry.map(({ chord }) => JSON.stringify(chord))
  assert.equal(new Set(chordKeys).size, shortcutRegistry.length)
  assert.deepEqual(
    shortcutRegistry.filter(({ aliasOf }) => aliasOf).map(({ action, aliasOf }) => ({ action, aliasOf })),
    [{ action: 'redo', aliasOf: 'redo-ctrl-y' }],
  )
  assert.deepEqual(new Set(shortcutRegistry.map(({ action }) => action)), new Set([
    'undo', 'redo', 'focus-search', 'focus-search-results', 'add-outpost', 'previous-outpost',
    'next-outpost', 'toggle-navigation', 'focus-navigation', 'focus-outpost-details',
    'focus-planned-supply', 'focus-resource-matrix', 'focus-first-inorganic',
    'focus-first-organic', 'focus-manufacturing-action', 'focus-cargo-links',
    'add-cargo-link', 'expand-all-cargo-links', 'collapse-all-cargo-links', 'import',
    'export', 'toggle-validation',
  ]))
  assert.equal(shortcutRegistry.length, 23)
})

test('registry formatters provide visual and accessible chords', () => {
  const undo = shortcutRegistry.find(({ id }) => id === 'undo-ctrl-z')!
  const next = shortcutRegistry.find(({ id }) => id === 'next-outpost-ctrl-alt-arrow-down')!
  assert.equal(formatShortcutChord(undo), 'Ctrl + Z')
  assert.equal(formatShortcutChord(next), 'Ctrl + Alt + Arrow Down')
  assert.equal(formatAccessibleShortcutChord(undo), 'Control plus Z')
  assert.equal(formatAccessibleShortcutChord(next, 'ja-JP'), 'Control、Alt、矢印 Down')
  assert.equal(formatAccessibleShortcutChord(next, 'fr-FR'), 'Contrôle plus Alt plus Flèche bas')
  assert.equal(formatAccessibleShortcutChord(next, 'de-DE'), 'Steuerung plus Alt plus Pfeil nach unten')
  assert.equal(formatAccessibleShortcutChord(next, 'es-ES'), 'Control más Alt más Flecha abajo')
  assert.equal(formatAccessibleShortcutChord(next, 'it-IT'), 'Control più Alt più Freccia giù')
  assert.equal(formatAccessibleShortcutChord(next, 'pt-BR'), 'Control mais Alt mais Seta para baixo')
  const redoWithShift = shortcutRegistry.find(({ id }) => id === 'redo-ctrl-shift-z')!
  assert.equal(formatAccessibleShortcutChord(redoWithShift, 'es-ES'), 'Control más Mayús más Z')
  assert.equal(formatAccessibleShortcutChord(redoWithShift, 'it-IT'), 'Control più Maiusc più Z')
  assert.equal(formatAccessibleShortcutChord(redoWithShift, 'pt-BR'), 'Control mais Shift mais Z')
  assert.equal(formatShortcutChord(next), 'Ctrl + Alt + Arrow Down')
  assert.equal(formatShortcutChord(redoWithShift), 'Ctrl + Shift + Z')
})

test('physical shortcuts use code matching and human-friendly display tokens', () => {
  const physical = shortcutRegistry.filter(({ chord }) => chord.match === 'code')
  assert.deepEqual(physical.map(({ chord }) => [chord.key, chord.displayKey]), [
    ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Comma', ','], ['Period', '.'],
  ])
  for (const definition of physical) {
    const event = { ...shortcut, key: definition.chord.displayKey!, code: definition.chord.key }
    assert.equal(matchesShortcut(event, definition), true)
    assert.equal(matchesShortcut({ ...event, code: `Numpad${definition.chord.displayKey}` }, definition), false)
    assert.equal(matchesShortcut({ ...event, code: 'WrongPhysicalCode' }, definition), false)
    assert.equal(matchesShortcut({ ...event, shiftKey: true }, definition), false)
    assert.equal(formatShortcutChord(definition).endsWith(definition.chord.displayKey!), true)
  }
  assert.equal(shortcutRegistry.filter(({ chord }) => chord.match === 'key' && /^[a-z]$/i.test(chord.key)).length, 15)
})

test('registry label and group keys exist in complete locales', () => {
  for (const definition of shortcutRegistry) {
    assert.ok(enUSMessages[definition.labelKey])
    assert.ok(enUSMessages[definition.groupKey])
    assert.ok(jaJPMessages[definition.labelKey])
    assert.ok(jaJPMessages[definition.groupKey])
  }
})

test('shared policy rejects composition and AltGraph while honoring match strategy', () => {
  const add = shortcutRegistry.find(({ id }) => id === 'add-outpost-ctrl-alt-n')!
  assert.equal(matchesShortcut({ ...shortcut, isComposing: true }, add), false)
  assert.equal(matchesShortcut({ ...shortcut, getModifierState: (name) => name === 'AltGraph' }, add), false)
  assert.equal(matchesShortcut({ ...shortcut, key: 'ñ' }, add), false)
  assert.equal(matchesShortcut({ ...shortcut, key: 'Process', isComposing: true }, add), false)
  assert.equal(matchesShortcut(shortcut, { ...add, chord: { ...add.chord, match: 'code', key: 'KeyN' } }), false)
  assert.equal(matchesShortcut({ ...shortcut, code: 'KeyN' }, { ...add, chord: { ...add.chord, match: 'code', key: 'KeyN' } }), true)
})

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
  assert.equal(handleOutpostShortcut(event, () => true, true), false)
  assert.equal(preventedCount, 1)
  assert.equal(handleOutpostShortcut(event, () => false), false)
  assert.equal(preventedCount, 1)
  assert.equal(
    handleOutpostShortcut({ ...event, repeat: true }, () => true),
    false,
  )
  assert.equal(preventedCount, 1)
})

const historyShortcut = {
  ctrlKey: true,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  key: 'z',
  repeat: false,
  target: null,
}

test('history shortcuts recognize only the requested Undo and Redo chords', () => {
  assert.equal(getHistoryShortcut(historyShortcut), 'undo')
  assert.equal(
    getHistoryShortcut({ ...historyShortcut, key: 'Z', shiftKey: true }),
    'redo',
  )
  assert.equal(getHistoryShortcut({ ...historyShortcut, key: 'y' }), 'redo')
  assert.equal(getHistoryShortcut({ ...historyShortcut, key: 'Y' }), 'redo')
  assert.equal(getHistoryShortcut({ ...historyShortcut, key: 'y', shiftKey: true }), null)
  assert.equal(getHistoryShortcut({ ...historyShortcut, altKey: true }), null)
  assert.equal(getHistoryShortcut({ ...historyShortcut, metaKey: true }), null)
  assert.equal(getHistoryShortcut({ ...historyShortcut, repeat: true }), null)
})

test('history shortcuts preserve native editing in text-editable targets', () => {
  for (const type of [
    'text', 'search', 'email', 'url', 'tel', 'password', 'number',
  ]) {
    const target = { tagName: 'INPUT', type } as unknown as EventTarget
    assert.equal(isTextEditingShortcutTarget(target), true)
    assert.equal(getHistoryShortcut({ ...historyShortcut, target }), null)
  }

  const textarea = { tagName: 'TEXTAREA' } as unknown as EventTarget
  const editable = {
    tagName: 'DIV', isContentEditable: true,
  } as unknown as EventTarget
  const editableDescendant = {
    tagName: 'SPAN', isContentEditable: true,
  } as unknown as EventTarget

  for (const target of [textarea, editable, editableDescendant]) {
    assert.equal(isTextEditingShortcutTarget(target), true)
    assert.equal(getHistoryShortcut({ ...historyShortcut, target }), null)
  }
})

test('history shortcuts remain available on ordinary non-text controls', () => {
  for (const target of [
    { tagName: 'BUTTON' },
    { tagName: 'SELECT' },
    { tagName: 'INPUT', type: 'checkbox' },
    { tagName: 'INPUT', type: 'radio' },
  ]) {
    assert.equal(
      isTextEditingShortcutTarget(target as unknown as EventTarget),
      false,
    )
    assert.equal(
      getHistoryShortcut({
        ...historyShortcut,
        target: target as unknown as EventTarget,
      }),
      'undo',
    )
  }
})

function dispatchHistoryShortcut(options: {
  key?: string
  shiftKey?: boolean
  target?: EventTarget | null
  isModalOpen?: boolean
  canUndo?: boolean
  canRedo?: boolean
}) {
  let undoCount = 0
  let redoCount = 0
  let preventedCount = 0
  const handled = handleHistoryShortcut({
    ...historyShortcut,
    key: options.key ?? 'z',
    shiftKey: options.shiftKey ?? false,
    target: options.target ?? null,
    preventDefault: () => { preventedCount += 1 },
  }, {
    isModalOpen: options.isModalOpen ?? false,
    canUndo: options.canUndo ?? true,
    canRedo: options.canRedo ?? true,
    onUndo: () => { undoCount += 1 },
    onRedo: () => { redoCount += 1 },
  })
  return { handled, undoCount, redoCount, preventedCount }
}

test('modal suppression leaves all history chords unhandled', () => {
  for (const chord of [
    { key: 'z', shiftKey: false },
    { key: 'y', shiftKey: false },
    { key: 'z', shiftKey: true },
  ]) {
    assert.deepEqual(
      dispatchHistoryShortcut({ ...chord, isModalOpen: true }),
      { handled: false, undoCount: 0, redoCount: 0, preventedCount: 0 },
    )
  }
})

test('unavailable and editable history shortcuts do not prevent default', () => {
  assert.deepEqual(
    dispatchHistoryShortcut({ canUndo: false }),
    { handled: false, undoCount: 0, redoCount: 0, preventedCount: 0 },
  )
  assert.deepEqual(
    dispatchHistoryShortcut({ key: 'y', canRedo: false }),
    { handled: false, undoCount: 0, redoCount: 0, preventedCount: 0 },
  )
  assert.deepEqual(
    dispatchHistoryShortcut({
      target: { tagName: 'INPUT', type: 'text' } as unknown as EventTarget,
    }),
    { handled: false, undoCount: 0, redoCount: 0, preventedCount: 0 },
  )
})

const searchShortcut = {
  ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
  key: '/', repeat: false, target: null,
}

test('plain slash focuses Search from normal workspace controls', () => {
  for (const target of [
    null,
    { tagName: 'BUTTON' },
    { tagName: 'SELECT' },
    { tagName: 'INPUT', type: 'checkbox' },
    { tagName: 'INPUT', type: 'radio' },
  ]) {
    assert.equal(isSearchFocusShortcut({
      ...searchShortcut, target: target as EventTarget | null,
    }), true)
  }
})

test('slash focus respects modifiers, repeats, text editors, and modals', () => {
  assert.equal(isSearchFocusShortcut({ ...searchShortcut, ctrlKey: true }), false)
  assert.equal(isSearchFocusShortcut({ ...searchShortcut, altKey: true }), false)
  assert.equal(isSearchFocusShortcut({ ...searchShortcut, metaKey: true }), false)
  assert.equal(isSearchFocusShortcut({ ...searchShortcut, repeat: true }), false)
  assert.equal(isSearchFocusShortcut({
    ...searchShortcut,
    target: { tagName: 'INPUT', type: 'text' } as unknown as EventTarget,
  }), false)

  let focused = 0
  let prevented = 0
  const event = { ...searchShortcut, preventDefault: () => { prevented += 1 } }
  assert.equal(handleSearchFocusShortcut(event, {
    isModalOpen: true, focusSearch: () => { focused += 1; return true },
  }), false)
  assert.deepEqual({ focused, prevented }, { focused: 0, prevented: 0 })
  assert.equal(handleSearchFocusShortcut(event, {
    isModalOpen: false, focusSearch: () => { focused += 1; return true },
  }), true)
  assert.deepEqual({ focused, prevented }, { focused: 1, prevented: 1 })
})

function namedNetwork(name: string, ...outpostIds: string[]): OutpostNetwork {
  const blank = createDefaultNetwork()
  return {
    ...blank,
    character: { ...blank.character, name },
    outposts: outpostIds.map((id) => ({
      id, name: id, systemId: '', bodyId: '', selectedBiomeIds: [],
      localResources: [], explicitResourcePresence: [], activeProduction: [], manufacturing: [],
      plannedSupply: [], cargoPads: [],
    })),
  }
}

test('keyboard traversal uses the contextual history commands', () => {
  const collection: NetworkCollection = {
    schemaVersion: 1,
    networks: [
      { id: 'a', network: namedNetwork('Before', 'a1', 'a2') },
      { id: 'b', network: namedNetwork('Other', 'b1') },
    ],
    activeNetworkId: 'a',
  }
  let session = createCollectionEditingSession(collection)
  session = collectionEditingSessionReducer(session, {
    type: 'select-outpost', outpostId: 'a2',
  })
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', label: { key: 'history.benchmark', parameters: { label: 'Rename' } }, timestamp: 1,
    update: (network) => ({
      ...network,
      character: { ...network.character, name: 'After' },
    }),
  })
  session = collectionEditingSessionReducer(session, {
    type: 'switch-network', networkId: 'b',
  })

  const expectedAfterUndo = collectionEditingSessionReducer(session, { type: 'undo' })
  let preventedCount = 0
  assert.equal(handleHistoryShortcut({
    ...historyShortcut,
    preventDefault: () => { preventedCount += 1 },
  }, {
    isModalOpen: false,
    canUndo: session.history.past.length > 0,
    canRedo: session.history.future.length > 0,
    onUndo: () => { session = collectionEditingSessionReducer(session, { type: 'undo' }) },
    onRedo: () => { session = collectionEditingSessionReducer(session, { type: 'redo' }) },
  }), true)
  assert.deepEqual(session, expectedAfterUndo)
  assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })
  assert.equal(session.collection.networks[0].network.character.name, 'Before')

  for (const chord of [
    { key: 'y', shiftKey: false },
    { key: 'z', shiftKey: true },
  ]) {
    const expectedAfterRedo = collectionEditingSessionReducer(session, { type: 'redo' })
    assert.equal(handleHistoryShortcut({
      ...historyShortcut,
      ...chord,
      preventDefault: () => { preventedCount += 1 },
    }, {
      isModalOpen: false,
      canUndo: session.history.past.length > 0,
      canRedo: session.history.future.length > 0,
      onUndo: () => { session = collectionEditingSessionReducer(session, { type: 'undo' }) },
      onRedo: () => { session = collectionEditingSessionReducer(session, { type: 'redo' }) },
    }), true)
    assert.deepEqual(session, expectedAfterRedo)
    assert.deepEqual(session.context, { networkId: 'a', outpostId: 'a2' })
    assert.equal(session.collection.networks[0].network.character.name, 'After')

    session = collectionEditingSessionReducer(session, { type: 'undo' })
  }
  assert.equal(preventedCount, 3)
})
