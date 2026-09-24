/** Reports character names beyond Starfield's normal 25-character convention. */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID = 'character-name-length'
const BASE_GAME_NAME_LIMIT = 25

function validateCharacterNameLength(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  if (network.character.name.length <= BASE_GAME_NAME_LIMIT) return []

  return [{
    ruleId: RULE_ID,
    category: 'operational',
    severity: 'info',
    messageKey: 'validation.characterNameLength',
  }]
}

export const characterNameLengthRule: ValidationRule = {
  id: RULE_ID,
  name: 'Character name exceeds base-game convention',
  description:
    'Advises when a character name exceeds Starfield\'s normal 25-character convention.',
  category: 'operational',
  defaultSeverity: 'info',
  validate: validateCharacterNameLength,
}
