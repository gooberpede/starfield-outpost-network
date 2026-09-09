import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCharacterLevelDraft } from '../src/domain/characterLevel.ts'
import { invalidCharacterLevelRule } from '../src/domain/validation/rules/invalidCharacterLevel.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'

test('character level draft accepts blank and integers 1 through 999 only', () => {
  assert.equal(parseCharacterLevelDraft(''), null)
  assert.equal(parseCharacterLevelDraft('1'), 1)
  assert.equal(parseCharacterLevelDraft('999'), 999)
  for (const draft of ['0', '1000', '-1', '1.5', 'abc']) assert.equal(parseCharacterLevelDraft(draft), undefined)
})

test('domain validation enforces recorded character level 1 through 999', () => {
  for (const level of [null, 1, 999]) {
    const value = createDefaultNetwork(); value.character.level = level
    assert.equal(invalidCharacterLevelRule.validate(value).length, 0)
  }
  for (const level of [0, 1000, -1, 1.5]) {
    const value = createDefaultNetwork(); value.character.level = level
    assert.equal(invalidCharacterLevelRule.validate(value).length, 1)
  }
})
