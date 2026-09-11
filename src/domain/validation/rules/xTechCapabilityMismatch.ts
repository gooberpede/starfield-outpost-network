import { hasExplicitResourcePresence, X_TECH_RESOURCE_ID } from '../../resourcePresence.ts'
import type { ValidationIssue, ValidationRule } from '../types.ts'

const RULE_ID = 'x-tech-capability-mismatch'

function validate(network: Parameters<ValidationRule['validate']>[0]): ValidationIssue[] {
  if (network.character.capabilities.xTechExtraction) return []
  return network.outposts.flatMap((outpost) => {
    const producing = outpost.activeProduction.some((route) =>
      route.type === 'inorganic' && route.resourceId === X_TECH_RESOURCE_ID)
    const present = hasExplicitResourcePresence(outpost, X_TECH_RESOURCE_ID)
    if (!present && !producing) return []
    return [{
      ruleId: RULE_ID,
      category: 'operational' as const,
      severity: 'warning' as const,
      message: producing
        ? 'X-Tech is recorded as produced, but the character lacks the required extraction capability.'
        : 'X-Tech is recorded as present, but the character lacks the required extraction capability.',
      outpostId: outpost.id,
      cargoItem: { type: 'resource' as const, id: X_TECH_RESOURCE_ID },
    }]
  })
}

export const xTechCapabilityMismatchRule: ValidationRule = {
  id: RULE_ID,
  name: 'X-Tech capability mismatch',
  description: 'Flags X-Tech presence or production without the required character capability.',
  category: 'operational',
  defaultSeverity: 'warning',
  validate,
}
