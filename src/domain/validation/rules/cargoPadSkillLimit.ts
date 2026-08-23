/**
 * cargoPadSkillLimit.ts
 *
 * Purpose:
 *   Detects outposts whose number of cargo pads exceeds the maximum currently
 *   allowed by the character's Outpost Management skill.
 *
 * Architecture:
 *   This is an operational validator. The recorded network is allowed to
 *   contain planned or future infrastructure that the character cannot yet
 *   build, so the rule reports a warning rather than blocking or mutating
 *   the network.
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

const RULE_ID =
  'cargo-pad-skill-limit'

/**
 * Returns the cargo-pad limit implied by the current Outpost Management level.
 *
 * Level 0 allows three pads per outpost. Any valid trained level allows six.
 *
 * Invalid skill values are deliberately treated conservatively here rather
 * than granting capacity beyond the game's known limits. A separate validator
 * will later report skill levels outside the valid 0-4 range.
 */
function getCargoPadLimit(
  outpostManagementLevel: number,
): number {
  return outpostManagementLevel >= 1
    ? 6
    : 3
}

/**
 * Reports one issue for each outpost that exceeds its current cargo-pad limit.
 */
function validateCargoPadSkillLimit(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const limit =
    getCargoPadLimit(
      network.character.skills.outpostManagement,
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
      'Flags outposts whose cargo-pad count exceeds the maximum allowed by the current Outpost Management skill level.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateCargoPadSkillLimit,
  }