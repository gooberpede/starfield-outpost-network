/**
 * regularCargoPadCrossSystem.ts
 *
 * Purpose:
 *   Detects cargo links that cross star systems while using a regular
 *   cargo pad.
 *
 * Architecture:
 *   Regular cargo pads are valid only for same-system links. Cross-system
 *   cargo links require interstellar cargo pads at both endpoints.
 *
 *   Missing endpoints are deliberately ignored here because they belong to
 *   the dedicated missing-endpoint validator.
 *
 * Change this file when:
 *   - cargo-pad type rules change;
 *   - cross-system linking rules change;
 *   - pad-type diagnostics need richer context.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'regular-cargo-pad-cross-system'

/**
 * Reports one issue for each regular cargo pad participating in a
 * cross-system cargo link.
 */
function validateRegularCargoPadCrossSystem(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const link of network.cargoLinks) {
    const outpostA =
      network.outposts.find(
        (outpost) =>
          outpost.id === link.endpointA.outpostId,
      )

    const outpostB =
      network.outposts.find(
        (outpost) =>
          outpost.id === link.endpointB.outpostId,
      )

    if (!outpostA || !outpostB) {
      continue
    }

    const cargoPadA =
      outpostA.cargoPads.find(
        (cargoPad) =>
          cargoPad.id === link.endpointA.cargoPadId,
      )

    const cargoPadB =
      outpostB.cargoPads.find(
        (cargoPad) =>
          cargoPad.id === link.endpointB.cargoPadId,
      )

    if (!cargoPadA || !cargoPadB) {
      continue
    }

    if (outpostA.systemId === outpostB.systemId) {
      continue
    }

    if (cargoPadA.type === 'regular') {
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        messageKey: 'validation.regularPadCrossSystem',
        outpostId: outpostA.id,
        cargoPadId: cargoPadA.id,
      })
    }

    if (cargoPadB.type === 'regular') {
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        messageKey: 'validation.regularPadCrossSystem',
        outpostId: outpostB.id,
        cargoPadId: cargoPadB.id,
      })
    }
  }

  return issues
}

export const regularCargoPadCrossSystemRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Regular cargo pad cross-system link',
    description:
      'Flags regular cargo pads that participate in cargo links between different star systems.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateRegularCargoPadCrossSystem,
  }
