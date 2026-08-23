/**
 * missingCargoLinkEndpoint.ts
 *
 * Purpose:
 *   Detects cargo links whose stored endpoint no longer resolves to an
 *   existing outpost and cargo pad.
 *
 * Architecture:
 *   Cargo links are network-level references. This validator checks those
 *   references without mutating or repairing the network.
 *
 *   One issue is emitted for each broken endpoint so the user can see
 *   exactly which side of a cargo link is invalid.
 *
 * Change this file when:
 *   - cargo-link endpoint structure changes;
 *   - endpoint resolution rules change;
 *   - broken-link diagnostics need richer context.
 */

import type {
  CargoLinkEndpoint,
} from '../../models'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'cargo-link-endpoint-missing'

/**
 * Returns true when an endpoint resolves to both an existing outpost and
 * an existing cargo pad within that outpost.
 */
function endpointExists(
  endpoint: CargoLinkEndpoint,
  network: Parameters<ValidationRule['validate']>[0],
): boolean {
  const outpost =
    network.outposts.find(
      (candidate) =>
        candidate.id === endpoint.outpostId,
    )

  if (!outpost) {
    return false
  }

  return outpost.cargoPads.some(
    (cargoPad) =>
      cargoPad.id === endpoint.cargoPadId,
  )
}

/**
 * Checks both sides of every persisted cargo link.
 */
function validateMissingCargoLinkEndpoints(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const link of network.cargoLinks) {
    const endpoints = [
      link.endpointA,
      link.endpointB,
    ]

    for (const endpoint of endpoints) {
      if (endpointExists(endpoint, network)) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          'This cargo link refers to a missing outpost or cargo pad.',
        outpostId: endpoint.outpostId,
        cargoPadId: endpoint.cargoPadId,
      })
    }
  }

  return issues
}

export const missingCargoLinkEndpointRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Missing cargo link endpoint',
    description:
      'Flags cargo links whose endpoint no longer resolves to an existing outpost and cargo pad.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateMissingCargoLinkEndpoints,
  }