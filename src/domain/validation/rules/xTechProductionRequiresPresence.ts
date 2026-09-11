import { hasExplicitResourcePresence, X_TECH_RESOURCE_ID } from '../../resourcePresence.ts'
import type { ValidationIssue, ValidationRule } from '../types.ts'

const RULE_ID = 'x-tech-production-requires-explicit-presence'

function validate(network: Parameters<ValidationRule['validate']>[0]): ValidationIssue[] {
  return network.outposts.flatMap((outpost) => {
    const producing = outpost.activeProduction.some((route) =>
      route.type === 'inorganic' && route.resourceId === X_TECH_RESOURCE_ID)
    if (!producing || hasExplicitResourcePresence(outpost, X_TECH_RESOURCE_ID)) return []
    return [{
      ruleId: RULE_ID,
      category: 'operational' as const,
      severity: 'warning' as const,
      messageKey: 'validation.xTechRequiresPresence',
      outpostId: outpost.id,
      cargoItem: { type: 'resource' as const, id: X_TECH_RESOURCE_ID },
    }]
  })
}

export const xTechProductionRequiresPresenceRule: ValidationRule = {
  id: RULE_ID,
  name: 'X-Tech production requires explicit presence',
  description: 'Flags X-Tech production without explicit X-Tech presence.',
  category: 'operational',
  defaultSeverity: 'warning',
  validate,
}
