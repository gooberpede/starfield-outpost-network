/**
 * Purpose: Report selected bodies beyond the recorded character's habitation rank.
 * Architecture: Operational warning, separate from categorical body eligibility
 *   and malformed skill/reference diagnostics. Validation never edits the save.
 * Change this file when: body minimum-rank requirements change.
 */
import { isValidSkillRank } from '../../skillRanks.ts'
import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'planetary-habitation-requirement'

function validatePlanetaryHabitationRequirement(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  const rank = network.character.skills.planetaryHabitation
  // Unknown capability is not failure; invalid ranks belong to invalid-skill-level.
  if (!referenceData || !isValidSkillRank(rank)) {
    return []
  }

  const bodiesById = new Map(referenceData.bodies.map((body) => [body.id, body]))
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    if (!outpost.bodyId) continue
    const body = bodiesById.get(outpost.bodyId)
    if (!body || !body.outpostAllowed || body.planetaryHabitationRank === null) continue
    if (rank >= body.planetaryHabitationRank) continue

    issues.push({
      ruleId: RULE_ID,
      category: 'operational',
      severity: 'warning',
      messageKey: 'validation.planetaryHabitationRequirement',
      parameters: { required: body.planetaryHabitationRank, recorded: rank },
      outpostId: outpost.id,
    })
  }
  return issues
}

export const planetaryHabitationRequirementRule: ValidationRule = {
  id: RULE_ID,
  name: 'Planetary Habitation requirement',
  description: 'Flags eligible bodies whose minimum Planetary Habitation rank exceeds the recorded character rank.',
  category: 'operational',
  defaultSeverity: 'warning',
  validate: validatePlanetaryHabitationRequirement,
}
