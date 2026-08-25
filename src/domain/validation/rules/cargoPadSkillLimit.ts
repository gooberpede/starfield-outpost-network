/**
 * cargoPadSkillLimit.ts
 *
 * Purpose:
 *   Detects outposts whose number of cargo pads exceeds the maximum currently
 *   allowed by the character's recorded Outpost Management skill.
 *
 * Architecture:
 *   This is an operational validator. The recorded network is allowed to
 *   contain planned or future infrastructure that the character cannot yet
 *   build, so the rule reports a warning rather than blocking or mutating
 *   the network.
 *
 *   If no Outpost Management rank is recorded, the character's cargo-pad
 *   capacity is unknown and this rule emits no issue.
 *
 * Change this file when:
 *   - Outpost Management cargo-pad limits change;
 *   - skill progression rules change;
 *   - cargo-pad capacity validation needs richer diagnostics.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

import {
  getCargoPadLimit,
} from '../../capacity'

const RULE_ID =
  'cargo-pad-skill-limit'

/**
 * Reports one issue for each outpost that exceeds its known cargo-pad limit.
 * If the relevant skill rank is unrecorded, no capacity assertion can be made
 * and the rule returns no issues.
 */
function validateCargoPadSkillLimit(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const outpostManagementLevel =
    network.character.skills.outpostManagement

  if (outpostManagementLevel === null) {
    return issues
  }

  const limit =
    getCargoPadLimit(
      outpostManagementLevel,
    )

  for (const outpost of network.outposts) {
    const cargoPadCount =
      outpost.cargoPads.length

    if (cargoPadCount <= limit) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'operational',
      severity: 'warning',
      message:
        `This outpost has ${cargoPadCount} cargo pads, but the current Outpost Management level allows a maximum of ${limit}.`,
      outpostId: outpost.id,
    })
  }

  return issues
}

export const cargoPadSkillLimitRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Cargo pad skill limit',
    description:
      'Flags outposts whose cargo-pad count exceeds the maximum allowed by the recorded Outpost Management skill level.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateCargoPadSkillLimit,
  }