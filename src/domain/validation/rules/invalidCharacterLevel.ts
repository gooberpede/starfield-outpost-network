/**
 * invalidCharacterLevel.ts
 *
 * Purpose:
 *   Detects invalid recorded character levels.
 *
 * Architecture:
 *   Character level is persisted network data and may therefore become invalid
 *   through malformed imports, hand-edited JSON, or future migration bugs.
 *
 *   A null level is valid and means that no character level is currently
 *   recorded. Any recorded level must be a whole number of at least 1.
 *
 *   This is a structural validator because an invalid recorded level makes the
 *   stored character record itself invalid.
 *
 * Change this file when:
 *   - character-level validity rules change;
 *   - character-level diagnostics need richer context.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'invalid-character-level'

const MIN_CHARACTER_LEVEL = 1
const MAX_CHARACTER_LEVEL = 999

/**
 * Reports an issue when a recorded character level is not a positive whole
 * number. An unrecorded null value is valid and produces no issue.
 */
function validateInvalidCharacterLevel(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const level =
    network.character.level

  if (level === null) {
    return []
  }

  if (
    Number.isInteger(level) &&
    level >= MIN_CHARACTER_LEVEL &&
    level <= MAX_CHARACTER_LEVEL
  ) {
    return []
  }

  return [
    {
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      messageKey: 'validation.invalidCharacterLevel',
      parameters: {
        level,
        minimum: MIN_CHARACTER_LEVEL,
        maximum: MAX_CHARACTER_LEVEL,
      },
    },
  ]
}

export const invalidCharacterLevelRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Invalid character level',
    description:
      'Flags recorded character levels outside the whole-number range 1–999.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateInvalidCharacterLevel,
  }
