/**
 * outpostSkillLimit.ts
 *
 * Purpose:
 *   Detects networks whose number of outposts exceeds the maximum currently
 *   allowed by the character's Planetary Habitation skill.
 *
 * Architecture:
 *   This is an operational validator. The recorded network may represent
 *   future or planned expansion beyond the character's current skill level,
 *   so the rule reports a warning rather than blocking or mutating the data.
 *
 *   This rule emits a single network-level issue because the limit applies to
 *   the total number of outposts, not to any one outpost.
 *
 * Change this file when:
 *   - Planetary Habitation outpost limits change;
 *   - skill progression rules change;
 *   - outpost-capacity diagnostics need richer information.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'outpost-skill-limit'

/**
 * Returns the maximum number of outposts allowed by the current
 * Planetary Habitation level.
 *
 * Level 0 allows 8 outposts. Each trained level adds 4, up to 24 at level 4.
 *
 * Invalid levels above 4 are capped at the known level-4 maximum here.
 * A separate validator will later report skill values outside the valid
 * 0-4 range.
 */
function getOutpostLimit(
  planetaryHabitationLevel: number,
): number {
  const validLevel =
    Math.min(
      Math.max(
        planetaryHabitationLevel,
        0,
      ),
      4,
    )

  return 8 + validLevel * 4
}

/**
 * Reports a single issue when the recorded network exceeds the character's
 * current outpost capacity.
 */
function validateOutpostSkillLimit(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const outpostCount =
    network.outposts.length

  const limit =
    getOutpostLimit(
      network.character.skills.planetaryHabitation,
    )

  if (outpostCount <= limit) {
    return []
  }

  return [
    {
      ruleId: RULE_ID,
      category: 'operational',
      severity: 'warning',
      message:
        `This network has ${outpostCount} outposts, but the current Planetary Habitation level allows a maximum of ${limit}.`,
    },
  ]
}

export const outpostSkillLimitRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Outpost skill limit',
    description:
      'Flags networks whose outpost count exceeds the maximum allowed by the current Planetary Habitation skill level.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateOutpostSkillLimit,
  }