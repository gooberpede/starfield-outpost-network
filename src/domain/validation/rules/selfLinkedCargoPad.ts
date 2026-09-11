/**
 * selfLinkedCargoPad.ts
 *
 * Purpose:
 *   Detects cargo links whose two endpoints refer to the same cargo pad.
 *
 * Architecture:
 *   A cargo link must connect two distinct endpoints. A link that points back
 *   to the same outpost and cargo pad on both sides is structurally invalid.
 *
 *   This validator reports the problem without modifying or repairing the
 *   stored network.
 *
 * Change this file when:
 *   - cargo-link endpoint rules change;
 *   - self-linking becomes valid in some future model;
 *   - self-link diagnostics need richer context.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'self-linked-cargo-pad'

/**
 * Reports one issue for each cargo link whose two endpoints identify the
 * same outpost and cargo pad.
 */
function validateSelfLinkedCargoPads(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const link of network.cargoLinks) {
    const sameOutpost =
      link.endpointA.outpostId ===
      link.endpointB.outpostId

    const sameCargoPad =
      link.endpointA.cargoPadId ===
      link.endpointB.cargoPadId

    if (!sameOutpost || !sameCargoPad) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'structural',
      severity: 'error',
      messageKey: 'validation.selfLinkedCargoPad',
      outpostId: link.endpointA.outpostId,
      cargoPadId: link.endpointA.cargoPadId,
    })
  }

  return issues
}

export const selfLinkedCargoPadRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Self-linked cargo pad',
    description:
      'Flags cargo links whose two endpoints refer to the same cargo pad.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateSelfLinkedCargoPads,
  }
