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

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'invalid-skill-level'

const MIN_SKILL_LEVEL = 0
const MAX_SKILL_LEVEL = 4

/**
 * Human-readable names for the persisted character skill fields.
 *
 * Keeping display names here avoids exposing camelCase model keys directly
 * in validation messages.
 */
const skillNames = {
  outpostManagement: 'Outpost Management',
  outpostEngineering: 'Outpost Engineering',
  planetaryHabitation: 'Planetary Habitation',
  researchMethods: 'Research Methods',
  specialProjects: 'Special Projects',
} as const

/**
 * Reports one issue for each recorded character skill whose stored level falls
 * outside the valid 0-4 range. Unrecorded null values are valid and skipped.
 */
function validateInvalidSkillLevels(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const [
    skillId,
    skillName,
  ] of Object.entries(skillNames)) {
    const level =
      network.character.skills[
        skillId as keyof typeof network.character.skills
      ]

    if (level === null) {
      continue
    }

    if (
      level >= MIN_SKILL_LEVEL &&
      level <= MAX_SKILL_LEVEL
    ) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      message:
        `${skillName} has level ${level}, but valid skill levels are ${MIN_SKILL_LEVEL} through ${MAX_SKILL_LEVEL}.`,
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