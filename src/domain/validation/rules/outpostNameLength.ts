/** Reports names beyond Starfield's normal 25-character outpost-name limit. */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID = 'outpost-name-length'
const BASE_GAME_NAME_LIMIT = 25

function validateOutpostNameLengths(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  return network.outposts
    .filter((outpost) =>
      outpost.name.length > BASE_GAME_NAME_LIMIT,
    )
    .map((outpost) => ({
      ruleId: RULE_ID,
      category: 'operational',
      severity: 'warning',
      message:
        'Starfield normally limits outpost names to 25 characters; longer modded names remain supported.',
      outpostId: outpost.id,
    }))
}

export const outpostNameLengthRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Outpost name exceeds base-game limit',
    description:
      'Warns when an outpost name exceeds Starfield\'s normal 25-character limit.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateOutpostNameLengths,
  }
