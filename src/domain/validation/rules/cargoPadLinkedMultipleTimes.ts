/** Reports every surviving participant in directly competing pairing records. */
import { analyzeCargoConnections } from '../../cargoConnections.ts'
import type { ValidationRule, ValidationIssue } from '../types.ts'
export const cargoPadLinkedMultipleTimesRule: ValidationRule = {
  id: 'cargo-pad-linked-multiple-times', name: 'Conflicting cargo pairings',
  description: 'Flags surviving participants of directly conflicting pairing records.',
  category: 'structural', defaultSeverity: 'error',
  validate(network) {
    const analysis = analyzeCargoConnections(network)
    const issues: ValidationIssue[] = []
    for (const outpost of network.outposts) for (const pad of outpost.cargoPads) {
      const owner = { outpostId: outpost.id, cargoPadId: pad.id }
      const records = analysis.conflictContext(owner)
      if (records.length) issues.push({ ...owner, ruleId: this.id, category: 'structural', severity: 'error',
        messageKey: 'validation.cargoPairingConflict', cargoRecords: records })
    }
    return issues
  },
}
