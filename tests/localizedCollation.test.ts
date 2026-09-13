import assert from 'node:assert/strict'
import test from 'node:test'

import { compareLocalizedItems } from '../src/ui/localizedCollation.ts'

test('localized alphabetical sorting uses the active locale and stable ID fallback', () => {
  const localized = [
    { id: 'system-b', name: 'Beta' },
    { id: 'system-a', name: 'Alpha' },
    { id: 'same-b', name: 'Same' },
    { id: 'same-a', name: 'Same' },
  ]

  assert.deepEqual(
    [...localized]
      .sort((left, right) => compareLocalizedItems(left, right, 'en-US'))
      .map(({ id }) => id),
    ['system-a', 'system-b', 'same-a', 'same-b'],
  )

  const japanese = [
    { id: 'b', name: 'ベータ星系' },
    { id: 'a', name: 'アルファ星系' },
  ]
  assert.deepEqual(
    [...japanese]
      .sort((left, right) => compareLocalizedItems(left, right, 'ja-JP'))
      .map(({ id }) => id),
    ['a', 'b'],
  )
})
