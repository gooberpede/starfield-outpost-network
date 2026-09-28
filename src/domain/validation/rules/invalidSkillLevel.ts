/**
 * invalidSkillLevel.ts
 *
 * Purpose:
 *   Detects recorded character skill values outside Starfield's valid 0-4
 *   range.
 *
 * Architecture:
 *   Character skills are stored as persisted network data and may therefore
 *   become invalid through malformed imports, hand-edited JSON, or future
 *   migration bugs.
 *
 *   A null skill value is valid and means that no rank is currently recorded.
 *   This is a structural validator because a recorded out-of-range skill value
 *   makes the stored character record itself invalid, regardless of whether
 *   any gameplay limit is currently exceeded.
 *
 * Change this file when:
 *   - the supported skill range changes;
 *   - additional character skills are added to the model;
 *   - skill-level diagnostics need richer context.
 */

import { isValidSkillRank } from '../../skillRanks.ts'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'invalid-skill-level'

const MIN_SKILL_LEVEL = 0
const MAX_SKILL_LEVEL = 4

const skillIds = [
  'outpostManagement',
  'outpostEngineering',
  'planetaryHabitation',
  'researchMethods',
  'specialProjects',
] as const

function validateInvalidSkillLevels(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const skillId of skillIds) {
    const level = network.character.skills[skillId]

    if (level === null) {
      continue
    }

    if (
      isValidSkillRank(level)
    ) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      messageKey: 'validation.invalidSkillLevel',
      parameters: {
        level,
        minimum: MIN_SKILL_LEVEL,
        maximum: MAX_SKILL_LEVEL,
      },
      skillId,
    })
  }

  return issues
}

export const invalidSkillLevelRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Invalid skill level',
    description:
      'Flags recorded character skill levels outside the valid 0-4 range.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateInvalidSkillLevels,
  }
