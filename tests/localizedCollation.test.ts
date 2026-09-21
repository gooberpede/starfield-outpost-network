import assert from 'node:assert/strict'
import test from 'node:test'

import { compareLocalizedItems } from '../src/ui/localizedCollation.ts'
import { getCollator } from '../src/localization/formatters.ts'
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
    ['es-ES', [{ id: 'n2', name: 'Ñandú 10' }, { id: 'n1', name: 'Naranja 2' }], ['n1', 'n2']],
    ['it-IT', [{ id: 'e2', name: 'Èpsilon 10' }, { id: 'e1', name: 'Edera 2' }], ['e1', 'e2']],
    ['pt-BR', [{ id: 'a2', name: 'Árvore 10' }, { id: 'a1', name: 'Amora 2' }], ['a1', 'a2']],
    ['pl-PL', [{ id: 'z2', name: 'Żuraw 10' }, { id: 'z1', name: 'Zamek 2' }], ['z1', 'z2']],
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

  assert.notEqual(getCollator('es-ES').compare('n', 'ñ'), 0)
  for (const [plain, polish] of [['a', 'ą'], ['c', 'ć'], ['l', 'ł'], ['n', 'ń'], ['o', 'ó'], ['s', 'ś'], ['z', 'ź'], ['ź', 'ż']] as const) {
    assert.ok(getCollator('pl-PL').compare(plain, polish) < 0, `${plain} / ${polish}`)
  }
  assert.ok(getCollator('pl-PL').compare('Element 2', 'Element 10') < 0)
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
