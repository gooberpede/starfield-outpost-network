/**
 * cargoPadLinkedMultipleTimes.ts
 *
 * Purpose:
 *   Detects cargo pads that are referenced by more than one persisted
 *   cargo link.
 *
 * Architecture:
 *   Cargo-pad link uniqueness is a structural network invariant. This
 *   validator reports violations without modifying or repairing the network.
 *
 *   One issue is emitted per affected cargo pad, regardless of how many
 *   links reference it.
 *
 * Change this file when:
 *   - cargo-pad linking rules change;
 *   - multiple links per pad become valid in some circumstances;
 *   - duplicate-link diagnostics need richer context.
 */

import type {
  CargoLinkEndpoint,
} from '../../models'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'cargo-pad-linked-multiple-times'

/**
 * Produces a stable lookup key for one cargo-link endpoint.
 *
 * The outpost ID is included because cargo-pad IDs are owned by their
 * outposts rather than treated as network-global identifiers.
 */
function getEndpointKey(
  endpoint: CargoLinkEndpoint,
): string {
  return `${endpoint.outpostId}:${endpoint.cargoPadId}`
}

/**
 * Counts how many cargo links refer to each endpoint and reports pads that
 * appear more than once.
 */
function validateCargoPadsLinkedMultipleTimes(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const endpointCounts =
    new Map<string, number>()

  for (const link of network.cargoLinks) {
    const endpointKeys =
      new Set([
        getEndpointKey(link.endpointA),
        getEndpointKey(link.endpointB),
      ])

    /*
    * Count each cargo pad at most once per link.
    *
    * A self-linked cargo pad is the responsibility of the dedicated
    * self-link validator and should not also be reported here merely because
    * the same endpoint appears twice within one link.
    */
    for (const key of endpointKeys) {
      endpointCounts.set(
        key,
        (endpointCounts.get(key) ?? 0) + 1,
      )
    }
  }

  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    for (const cargoPad of outpost.cargoPads) {
      const key =
        getEndpointKey({
          outpostId: outpost.id,
          cargoPadId: cargoPad.id,
        })

      if ((endpointCounts.get(key) ?? 0) <= 1) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        messageKey: 'validation.cargoPadLinkedMultiple',
        outpostId: outpost.id,
        cargoPadId: cargoPad.id,
      })
    }
  }

  return issues
}

export const cargoPadLinkedMultipleTimesRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Cargo pad linked multiple times',
    description:
      'Flags cargo pads that are referenced by more than one cargo link.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateCargoPadsLinkedMultipleTimes,
  }
