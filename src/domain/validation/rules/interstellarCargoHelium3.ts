/**
 * interstellarCargoHelium3.ts
 *
 * Purpose:
 *   Detects sending endpoints of cross-system interstellar cargo links that
 *   do not have Helium-3 available at the sending outpost.
 *
 * Architecture:
 *   Helium-3 is required only by an endpoint that is actually sending cargo.
 *   Each direction of a bidirectional cargo link is therefore validated
 *   independently.
 *
 *   Availability follows the application's existing supply semantics:
 *   local production, inbound cargo, or Planned Supply may all satisfy the
 *   Helium-3 requirement.
 *
 *   Missing endpoints and cross-system regular cargo pads belong to their
 *   dedicated structural validators and are deliberately ignored here.
 *
 *   Fuel quantities, usage rates, and bootstrap/circular-flow feasibility are
 *   outside the scope of this first operational check.
 *
 * Change this file when:
 *   - Helium-3 fuel requirements change;
 *   - fuel quantity or throughput is introduced;
 *   - availability semantics change;
 *   - interstellar cargo operation rules change.
 */

import {
  getAvailableItemsAtOutpost,
} from '../../availability'

import type {
  CargoLinkEndpoint,
  CargoPad,
  Outpost,
} from '../../models'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'interstellar-cargo-helium-3'

const HELIUM_3_RESOURCE_ID =
  'helium-3'

/**
 * Returns true when the sending outpost currently has Helium-3 available
 * according to the application's normal supply rules.
 */
function hasAvailableHelium3(
  outpostId: string,
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): boolean {
  return getAvailableItemsAtOutpost(
    outpostId,
    network,
    referenceData,
  ).some(
    (item) =>
      item.type === 'resource' &&
      item.id === HELIUM_3_RESOURCE_ID,
  )
}

/**
 * Reports a warning for one sending endpoint when its pad exports cargo but
 * the sending outpost has no available Helium-3 supply.
 */
function validateSendingEndpoint(
  endpoint: CargoLinkEndpoint,
  cargoPad: CargoPad,
  outpost: Outpost,
  cargoLinkId: string,
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue | null {
  if (cargoPad.outboundItems.length === 0) {
    return null
  }

  if (
    hasAvailableHelium3(
      outpost.id,
      network,
      referenceData,
    )
  ) {
    return null
  }

  return {
    ruleId: RULE_ID,
    category: 'operational',
    severity: 'warning',
    messageKey: 'validation.interstellarHelium3',
    cargoLinkId,
    outpostId: endpoint.outpostId,
    cargoPadId: endpoint.cargoPadId,
  }
}

/**
 * Checks each direction of every structurally valid cross-system
 * interstellar cargo link independently.
 */
function validateInterstellarCargoHelium3(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
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

    /*
     * Same-system links do not require this interstellar fuel check.
     */
    if (outpostA.systemId === outpostB.systemId) {
      continue
    }

    /*
     * Cross-system regular-pad problems belong to the dedicated structural
     * validator. Avoid overlapping diagnostics for an already invalid link.
     */
    if (
      cargoPadA.type !== 'interstellar' ||
      cargoPadB.type !== 'interstellar'
    ) {
      continue
    }

    const issueA =
      validateSendingEndpoint(
        link.endpointA,
        cargoPadA,
        outpostA,
        link.id,
        network,
        referenceData,
      )

    if (issueA) {
      issues.push(issueA)
    }

    const issueB =
      validateSendingEndpoint(
        link.endpointB,
        cargoPadB,
        outpostB,
        link.id,
        network,
        referenceData,
      )

    if (issueB) {
      issues.push(issueB)
    }
  }

  return issues
}

export const interstellarCargoHelium3Rule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Interstellar cargo Helium-3',
    description:
      'Flags sending endpoints of cross-system interstellar cargo links whose outpost has no available Helium-3 supply.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateInterstellarCargoHelium3,
  }
