/**
 * activeProductionValidForBody.ts
 *
 * Purpose:
 *   Detects active resource production that is not supported by the selected
 *   planetary body's resource reference data.
 *
 * Architecture:
 *   Planetary resource occurrence comes from external reference data rather
 *   than from the persisted network itself.
 *   Production eligibility is shared with the matrix: organic presence alone
 *   is insufficient without a domesticable source on this body.
 *
 *   Unknown bodies and unknown resource IDs are deliberately ignored here
 *   because they belong to the separate unknown-reference-data validator.
 *
 *   Special production mechanisms that are valid independently of normal
 *   planetary resource occurrence should be handled explicitly rather than
 *   weakening the meaning of body resource data.
 *
 * Change this file when:
 *   - planetary resource occurrence rules change;
 *   - special production mechanisms such as X-Tech are represented;
 *   - resource-production diagnostics need richer context.
 */

import { getBodyProductionResources } from '../../bodyResourceAvailability.ts'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'active-production-valid-for-body'

/**
 * Returns true when a resource is produced through a special mechanism that
 * does not require the resource to occur naturally on the selected body.
 *
 * X-Tech will eventually belong here once it has an authoritative identifier
 * in application reference data.
 */
function isSpecialProductionResource(): boolean {
  return false
}

/**
 * Reports active production entries that are known resources but are not
 * supported by the selected body's known resource occurrence data.
 */
function validateActiveProductionValidForBody(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) {
    return []
  }

  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    if (!outpost.bodyId) {
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

    const bodyResources =
      referenceData.bodyResources.find(
        (entry) =>
          entry.bodyId === body.id,
      )

    if (!bodyResources) {
      continue
    }

    const productionResourceIds = new Set(
      getBodyProductionResources(referenceData, body.id).map((resource) => resource.id),
    )

    for (
      const resourceId of
      outpost.activeProduction
    ) {
      const resourceExists =
        referenceData.resources.some(
          (resource) =>
            resource.id === resourceId,
        )

      if (!resourceExists) {
        continue
      }

      if (
        isSpecialProductionResource()
      ) {
        continue
      }

      if (
        productionResourceIds.has(
          resourceId,
        )
      ) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'operational',
        severity: 'warning',
        message:
          'This resource is marked as actively produced, but it is not available on the selected planetary body.',
        outpostId: outpost.id,
        cargoItem: {
          type: 'resource',
          id: resourceId,
        },
      })
    }
  }

  return issues
}

export const activeProductionValidForBodyRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Active production valid for body',
    description:
      'Flags active resource production that is not supported by the selected planetary body.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateActiveProductionValidForBody,
  }
