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
 *   Planned Supply does not count as an actual source. Therefore an item
 *   may remain selectable for planning purposes while still producing this
 *   validation issue.
 *
 * Change this file when:
 *   - the unresolved-export rule itself changes;
 *   - the rule's metadata changes;
 *   - unresolved cargo exports need additional issue context.
 */

import {
  getItemProvenanceAtOutpost,
} from '../../provenance'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID = 'unresolved-cargo-export'

/**
 * Finds cargo-pad exports whose outpost has neither a local source nor
 * an inbound remote source for the exported item.
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

        if (hasActualSource) {
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
    'Flags cargo-pad exports that have no actual local or inbound source.',
  category: 'supply',
  defaultSeverity: 'warning',
  validate: validateUnresolvedCargoExports,
}
