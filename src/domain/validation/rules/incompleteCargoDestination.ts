/** An explicitly unfinished destination is operational intent, never actual supply. */
import { classifyCargoDestination } from '../../cargoConnections.ts'
import type { ValidationIssue, ValidationRule } from '../types.ts'
export const incompleteCargoDestinationRule: ValidationRule = {
  id: 'cargo-destination-incomplete', name: 'Incomplete cargo destination',
  description: 'Flags an explicit outpost choice awaiting a Cargo Link.',
  category: 'operational', defaultSeverity: 'warning',
  validate(network) {
    const issues: ValidationIssue[] = []
    for (const outpost of network.outposts) for (const pad of outpost.cargoPads) {
      const owner = { outpostId: outpost.id, cargoPadId: pad.id }
      const state = classifyCargoDestination(network, owner)
      if (state.kind === 'incomplete') issues.push({ ...owner, ruleId: this.id,
        category: 'operational', severity: 'warning', messageKey: 'validation.cargoDestinationIncomplete', cargoTarget: state.target })
    }
    return issues
  },
}
