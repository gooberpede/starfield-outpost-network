import type { ValidationIssue, ValidationRule } from '../types'

const RULE_ID = 'selected-biome-valid-for-body'

function validate(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) return []
  const issues: ValidationIssue[] = []
  for (const outpost of network.outposts) {
    for (const bodyBiomeId of outpost.selectedBiomeIds) {
      const bodyBiome = referenceData.bodyBiomes.find((entry) => entry.id === bodyBiomeId)
      if (!bodyBiome || bodyBiome.bodyId === outpost.bodyId) continue
      issues.push({
        ruleId: RULE_ID, category: 'structural', severity: 'error',
        message: 'This selected biome belongs to a different planetary body.',
        outpostId: outpost.id, bodyBiomeId,
      })
    }
  }
  return issues
}

export const selectedBiomeValidForBodyRule: ValidationRule = {
  id: RULE_ID, name: 'Selected biome valid for body',
  description: 'Flags selected biome occurrences belonging to another body.',
  category: 'structural', defaultSeverity: 'error', validate,
}
