/**
 * unresolvedCargoExport.ts
 *
 * Purpose:
 *   Detects cargo-pad outbound items that have no actual source at the
 *   outpost exporting them.
 *
 * Architecture:
 *   This rule is independent of validator configuration and presentation.
 *   It uses shared provenance logic to determine whether an exported item
 *   is supplied locally or by one or more inbound cargo links.
 *
 *   Planned Supply counts as a valid virtual source for this rule while
 *   remaining distinct from actual provenance elsewhere in the domain.
 *
 * Change this file when:
 *   - the unresolved-export rule itself changes;
 *   - the rule's metadata changes;
 *   - unresolved cargo exports need additional issue context.
 */

import {
  getItemProvenanceAtOutpost,
} from '../../provenance.ts'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types.ts'

const RULE_ID = 'unresolved-cargo-export'

/**
 * Finds cargo-pad exports whose outpost has neither an actual source nor
 * an exact matching Planned Supply placeholder for the exported item.
 */
function validateUnresolvedCargoExports(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    for (const cargoPad of outpost.cargoPads) {
      for (const item of cargoPad.outboundItems) {
        const provenance =
          getItemProvenanceAtOutpost(
            outpost.id,
            item,
            network,
            referenceData,
          )

        const hasActualSource =
          provenance.local ||
          provenance.remoteOutpostIds.length > 0
        const hasPlannedSource = outpost.plannedSupply.some(
          (plannedItem) =>
            plannedItem.type === item.type &&
            plannedItem.id === item.id,
        )

        if (hasActualSource || hasPlannedSource) {
          continue
        }

        issues.push({
          ruleId: RULE_ID,
          category: 'supply',
          severity: 'warning',
          message:
            'This cargo export has no actual source.',
          outpostId: outpost.id,
          cargoPadId: cargoPad.id,
          cargoItem: item,
        })
      }
    }
  }

  return issues
}

/**
 * Independent validator for unresolved cargo exports.
 */
export const unresolvedCargoExportRule: ValidationRule = {
  id: RULE_ID,
  name: 'Unresolved cargo export',
  description:
    'Flags cargo-pad exports that have no actual or Planned Supply source.',
  category: 'supply',
  defaultSeverity: 'warning',
  validate: validateUnresolvedCargoExports,
}
