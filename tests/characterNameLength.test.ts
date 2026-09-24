import assert from 'node:assert/strict'
import test from 'node:test'

import { deserializeNetworkCollection, serializeNetworkCollection } from '../src/data/serialization.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import { characterNameLengthRule } from '../src/domain/validation/rules/characterNameLength.ts'

function networkWithName(name: string) {
  const network = createDefaultNetwork()
  network.character.name = name
  return network
}

test('character-name advisory observes the 25-character boundary', () => {
  for (const length of [0, 24, 25]) {
    assert.deepEqual(characterNameLengthRule.validate(networkWithName('a'.repeat(length))), [])
  }

  for (const length of [26, 200]) {
    const name = 'a'.repeat(length)
    const network = networkWithName(name)
    const issues = characterNameLengthRule.validate(network)
    assert.equal(issues.length, 1)
    assert.deepEqual(issues[0], {
      ruleId: 'character-name-length',
      category: 'operational',
      severity: 'info',
      messageKey: 'validation.characterNameLength',
    })
    assert.equal(network.character.name, name)
  }
})

test('character-name advisory does not affect serialization or import', () => {
  const name = 'Long character name retained in full'
  const network = networkWithName(name)

  const collection = {
    schemaVersion: 1 as const,
    networks: [{ id: 'network-1', network }],
    activeNetworkId: 'network-1',
  }
  const serialized = serializeNetworkCollection(collection)
  assert.equal(JSON.parse(serialized).networks[0].network.character.name, name)
  assert.equal(deserializeNetworkCollection(serialized).networks[0].network.character.name, name)
})
