/**
 * Reports outposts placed on known bodies that cannot host outposts.
 * Unknown body IDs remain the responsibility of unknown-reference validation.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID = 'outpost-body-not-eligible'

function validateOutpostBodyEligibility(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) {
    return []
  }

  const bodiesById = new Map(
    referenceData.bodies.map((body) => [body.id, body]),
  )
  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    const body = bodiesById.get(outpost.bodyId)

    if (!body || body.outpostAllowed) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      message:
        'This outpost is located on a body that cannot host outposts.',
      outpostId: outpost.id,
    })
  }

  return issues
}

export const outpostBodyNotEligibleRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Outpost body not eligible',
    description:
      'Flags outposts located on known bodies that cannot host outposts.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateOutpostBodyEligibility,
  }
