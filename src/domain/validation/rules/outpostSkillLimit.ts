/**
 * outpostSkillLimit.ts
 *
 * Purpose:
 *   Detects networks whose number of outposts exceeds the maximum currently
 *   allowed by the character's recorded Planetary Habitation skill.
 *
 * Architecture:
 *   This is an operational validator. The recorded network may represent
 *   future or planned expansion beyond the character's current skill level,
 *   so the rule reports a warning rather than blocking or mutating the data.
*
 *   If no Planetary Habitation rank is recorded, the character's outpost
 *   capacity is unknown and this rule emits no issue.
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

import {
  getOutpostLimit,
} from '../../capacity'

const RULE_ID =
  'outpost-skill-limit'

/**
 * Reports a single issue when the recorded network exceeds the character's
 * known outpost capacity. If the relevant skill rank is unrecorded, no
 * capacity assertion can be made and the rule returns no issue.
 */
function validateOutpostSkillLimit(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const outpostCount =
    network.outposts.length

  const planetaryHabitationLevel =
    network.character.skills.planetaryHabitation

  if (planetaryHabitationLevel === null) {
    return []
  }

  const limit =
    getOutpostLimit(
      planetaryHabitationLevel,
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
      'Flags networks whose outpost count exceeds the maximum allowed by the recorded Planetary Habitation skill level.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateOutpostSkillLimit,
  }