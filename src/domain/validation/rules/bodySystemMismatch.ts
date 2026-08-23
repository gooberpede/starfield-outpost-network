/**
 * bodySystemMismatch.ts
 *
 * Purpose:
 *   Detects outposts whose selected planetary body does not belong to the
 *   selected star system.
 *
 * Architecture:
 *   The persisted network stores only body and system IDs. The authoritative
 *   relationship between those IDs comes from external reference data.
 *
 *   If reference data is unavailable, this validator emits no issues rather
 *   than guessing. Unknown IDs are deliberately left to the separate
 *   unknown-reference-data validator.
 *
 * Change this file when:
 *   - planetary-body/system relationships change;
 *   - reference-data structure changes;
 *   - body/system diagnostics need richer context.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'body-system-mismatch'

/**
 * Reports one issue for each outpost whose known body belongs to a different
 * known star system from the one recorded on the outpost.
 */
function validateBodySystemMismatch(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) {
    return []
  }

  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    /*
     * Missing selections and unknown IDs belong to other validation concerns.
     * This rule only checks a relationship when both stored values can be
     * meaningfully compared.
     */
    if (!outpost.systemId || !outpost.bodyId) {
      continue
    }

    const body =
      referenceData.bodies.find(
        (candidate) =>
          candidate.id === outpost.bodyId,
      )

    if (!body) {
      continue
    }

    const systemExists =
      referenceData.systems.some(
        (system) =>
          system.id === outpost.systemId,
      )

    if (!systemExists) {
      continue
    }

    if (body.systemId === outpost.systemId) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      message:
        'This outpost\'s selected planetary body does not belong to its selected star system.',
      outpostId: outpost.id,
    })
  }

  return issues
}

export const bodySystemMismatchRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Body/system mismatch',
    description:
      'Flags outposts whose selected planetary body belongs to a different star system.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateBodySystemMismatch,
  }