import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'unspecified-organic-production-source'

function validate(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    for (const route of outpost.activeProduction) {
      if (route.type !== 'organic-unspecified') continue
      issues.push({
        ruleId: RULE_ID, category: 'operational', severity: 'warning',
        messageKey: 'validation.unspecifiedOrganicSource',
        outpostId: outpost.id,
        cargoItem: { type: 'resource', id: route.resourceId },
      })
    }
  }
  return issues
}

export const unspecifiedOrganicProductionSourceRule: ValidationRule = {
  id: RULE_ID, name: 'Unspecified organic production source',
  description: 'Flags migrated organic production that still needs a specific species source.',
  category: 'operational', defaultSeverity: 'warning', validate,
}
