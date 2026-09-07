/** Reports known specific routes that current body/biome reference facts do not support. */
import {
  getBiomeButtonGroups,
  isProductionRouteAvailable,
} from '../../bodyResourceAvailability.ts'
import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'active-production-valid-for-body'

function formatList(values: string[]): string {
  if (values.length < 2) return values[0] ?? 'the selected'
  if (values.length === 2) return values.join(' and ')
  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
}

function validate(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) return []
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    if (!referenceData.bodies.some((body) => body.id === outpost.bodyId)) continue
    const biomeGroups = getBiomeButtonGroups(referenceData, outpost.bodyId)
    const selectedBiomeNames = [...new Set(
      outpost.selectedBiomeIds.length > 0
        ? outpost.selectedBiomeIds.map((bodyBiomeId) =>
            biomeGroups.find((group) => group.bodyBiomeIds.includes(bodyBiomeId))?.label ??
            bodyBiomeId,
          )
        : biomeGroups.map((group) => group.label),
    )]
    const selectedBiomeList = formatList(selectedBiomeNames)
    const biomeNoun = selectedBiomeNames.length === 1 ? 'biome' : 'biomes'
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
          ? `${resource.name} is marked as produced, but is not available for outpost harvesting in ${selectedBiomeList} ${biomeNoun}.`
          : `${resource.name} is marked as produced, but is not available for outpost extraction in ${selectedBiomeList} ${biomeNoun}.`,
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
