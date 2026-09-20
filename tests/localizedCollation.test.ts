import assert from 'node:assert/strict'
import test from 'node:test'

import { compareLocalizedItems } from '../src/ui/localizedCollation.ts'
import { sortValidationIssues } from '../src/ui/validationPresentation.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'

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

  for (const [locale, values, expected] of [
    ['fr-FR', [{ id: 'e2', name: 'Étoile 10' }, { id: 'e1', name: 'Etain 2' }], ['e1', 'e2']],
    ['de-DE', [{ id: 'u2', name: 'Übergang 10' }, { id: 'u1', name: 'Uber 2' }], ['u1', 'u2']],
  ] as const) {
    assert.deepEqual(
      [...values].sort((left, right) => compareLocalizedItems(left, right, locale))
        .map(({ id }) => id),
      expected,
    )
  }

  assert.deepEqual(
    [{ id: 'b', name: 'Égal' }, { id: 'a', name: 'Egal' }]
      .sort((left, right) => compareLocalizedItems(left, right, 'fr-FR'))
      .map(({ id }) => id),
    ['a', 'b'],
  )
})

test('localized system collation does not reorder domain and chronology boundaries', () => {
  const systems = [
    { id: 'beta', name: 'ベータ' },
    { id: 'alpha', name: 'アルファ' },
  ]
  const bodies = ['orbit-2', 'orbit-1']
  const resourceTopology = ['root', 'child-b', 'child-a']
  const persistedOutposts = ['outpost-b', 'outpost-a']
  const history = ['oldest', 'middle', 'newest']
  const issues: ValidationIssue[] = [
    { ruleId: 'info', category: 'operational', severity: 'info', messageKey: 'validation.plannedSupplyUnresolved' },
    { ruleId: 'error', category: 'structural', severity: 'error', messageKey: 'validation.bodySystemMismatch' },
    { ruleId: 'warning', category: 'supply', severity: 'warning', messageKey: 'validation.unresolvedCargoExport' },
  ]

  assert.deepEqual(
    [...systems].sort((left, right) => compareLocalizedItems(left, right, 'ja-JP'))
      .map(({ id }) => id),
    ['alpha', 'beta'],
  )
  assert.deepEqual(bodies, ['orbit-2', 'orbit-1'])
  assert.deepEqual(resourceTopology, ['root', 'child-b', 'child-a'])
  assert.deepEqual(persistedOutposts, ['outpost-b', 'outpost-a'])
  assert.deepEqual(sortValidationIssues(issues).map(({ severity }) => severity), [
    'error', 'warning', 'info',
  ])
  assert.deepEqual(history, ['oldest', 'middle', 'newest'])
})
