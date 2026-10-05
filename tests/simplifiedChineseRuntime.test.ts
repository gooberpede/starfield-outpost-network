import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { translate } from '../src/localization/catalog.ts'
import { zhHANSReferenceNames } from '../src/localization/generated/zh-Hans-reference-names.ts'
import { getLocaleSelectorOptions } from '../src/localization/locale.ts'
import { zhHansMessages } from '../src/localization/locales/zh-Hans.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'
import {
  formatAccessibleShortcutChord,
  shortcutRegistry,
  type ShortcutDefinition,
} from '../src/ui/keyboardShortcuts.ts'

test('Simplified Chinese runtime catalogue, selector, and reference overlay are complete', () => {
  assert.equal(supportedLocaleIds.includes('zh-Hans'), true)
  assert.equal(Object.keys(zhHansMessages).length, 451)
  assert.equal(translate('zh-Hans', 'about.description'), zhHansMessages['about.description'])
  assert.deepEqual(getLocaleSelectorOptions('en-US').find(({ value }) => value === 'zh-Hans'), {
    value: 'zh-Hans', label: '简体中文',
  })
  assert.equal(
    Object.values(zhHANSReferenceNames).reduce(
      (total, family) => total + Object.keys(family).length,
      0,
    ),
    3561,
  )
})

test('Simplified Chinese uses the approved locale-scoped system font stack', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  const rule = css.match(/:lang\(zh-Hans\)\s*\{(?<body>[^}]+)\}/)?.groups?.body
  assert.ok(rule)
  const approvedOrder = [
    "'Microsoft YaHei UI'", "'Microsoft YaHei'", "'PingFang SC'",
    "'Noto Sans CJK SC'", 'system-ui', 'sans-serif',
  ]
  let previous = -1
  for (const font of approvedOrder) {
    const index = rule.indexOf(font)
    assert.ok(index > previous, font)
    previous = index
  }
  assert.doesNotMatch(rule, /url\(|@font-face/i)
})

test('Simplified Chinese shortcut speech preserves modifiers and localizes connectors and arrows', () => {
  const next = shortcutRegistry.find(({ id }) => id === 'next-outpost-ctrl-alt-arrow-down')!
  const redo = shortcutRegistry.find(({ id }) => id === 'redo-ctrl-shift-z')!
  assert.equal(formatAccessibleShortcutChord(next, 'zh-Hans'), 'Control加Alt加下箭头')
  assert.equal(formatAccessibleShortcutChord(redo, 'zh-Hans'), 'Control加Shift加Z')

  for (const [key, expected] of [
    ['ArrowUp', '上箭头'], ['ArrowDown', '下箭头'],
    ['ArrowLeft', '左箭头'], ['ArrowRight', '右箭头'],
  ] as const) {
    const definition = {
      ...next,
      chord: { ...next.chord, key },
    } as ShortcutDefinition
    assert.equal(formatAccessibleShortcutChord(definition, 'zh-Hans'), `Control加Alt加${expected}`)
  }
})
