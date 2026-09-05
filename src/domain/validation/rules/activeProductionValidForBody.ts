/** Reports known specific routes that current body/biome reference facts do not support. */
import { isProductionRouteAvailable } from '../../bodyResourceAvailability.ts'
import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'active-production-valid-for-body'

function validate(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) return []
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    if (!referenceData.bodies.some((body) => body.id === outpost.bodyId)) continue
    for (const route of outpost.activeProduction) {
      if (route.type === 'organic-unspecified') continue
      const resource = referenceData.resources.find((entry) => entry.id === route.resourceId)
      if (!resource || (route.type === 'organic' &&
        !referenceData.species.some((entry) => entry.id === route.speciesId))) continue
      if (isProductionRouteAvailable(
        referenceData, outpost.bodyId, outpost.selectedBiomeIds ?? [], route,
      ) && resource.category === route.type) continue
      issues.push({
        ruleId: RULE_ID, category: 'operational', severity: 'warning',
        message: route.type === 'organic'
          ? 'This organic source is marked as actively producing, but it is not available for the selected body and biomes.'
          : 'This resource is marked as actively produced, but it is not available for the selected body and biomes.',
        outpostId: outpost.id,
        speciesId: route.type === 'organic' ? route.speciesId : undefined,
        cargoItem: { type: 'resource', id: route.resourceId },
      })
    }
  }
  return issues
}

export const activeProductionValidForBodyRule: ValidationRule = {
  id: RULE_ID,
  name: 'Active production valid for body and biome',
  description: 'Flags active production routes unsupported by the selected body and biome scope.',
  category: 'operational', defaultSeverity: 'warning', validate,
}
