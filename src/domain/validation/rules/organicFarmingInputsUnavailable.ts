import { getAvailableItemsAtOutpost } from '../../availability.ts'
import { isProductionRouteAvailable } from '../../bodyResourceAvailability.ts'
import { getOrganicRouteInputs } from '../../productionRoutes.ts'
import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'organic-farming-inputs-unavailable'

function validate(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) return []
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    const available = new Set(getAvailableItemsAtOutpost(outpost.id, network, referenceData)
      .map((item) => `${item.type}:${item.id}`))
    for (const route of outpost.activeProduction) {
      if (route.type !== 'organic' || !isProductionRouteAvailable(
        referenceData, outpost.bodyId, outpost.selectedBiomeIds ?? [], route,
      )) continue
      for (const input of getOrganicRouteInputs(referenceData, outpost.bodyId, route)) {
        if (available.has(`resource:${input.resourceId}`)) continue
        issues.push({
          ruleId: RULE_ID, category: 'operational', severity: 'warning',
          messageKey: 'validation.organicInputUnavailable',
          outpostId: outpost.id, speciesId: route.speciesId,
          cargoItem: { type: 'resource', id: input.resourceId },
        })
      }
    }
  }
  return issues
}

export const organicFarmingInputsUnavailableRule: ValidationRule = {
  id: RULE_ID, name: 'Organic farming inputs unavailable',
  description: 'Flags unavailable inputs for each valid active organic source route.',
  category: 'operational', defaultSeverity: 'warning', validate,
}
