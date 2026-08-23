/**
 * unknownReferenceDataId.ts
 *
 * Purpose:
 *   Detects persisted network references whose IDs do not exist in the
 *   currently loaded application reference data.
 *
 * Architecture:
 *   This is a structural data-integrity validator. Network records persist
 *   stable IDs for systems, bodies, resources, and products, while the
 *   authoritative catalogue of those IDs lives in external reference data.
 *
 *   Cargo-link outpost and cargo-pad references are deliberately excluded
 *   because missing link endpoints belong to their dedicated validator.
 *
 *   Empty system/body selections are also ignored. They represent an
 *   unselected value rather than an unknown reference.
 *
 * Change this file when:
 *   - new persisted reference-data relationships are added;
 *   - reference-data structure changes;
 *   - unknown-reference diagnostics need richer context.
 */

import type {
  CargoItem,
} from '../../models'

import type {
  ReferenceData,
} from '../../referenceData'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'unknown-reference-data-id'

/**
 * Returns true when a CargoItem refers to a known resource or product.
 */
function cargoItemExists(
  item: CargoItem,
  referenceData: ReferenceData,
): boolean {
  if (item.type === 'resource') {
    return referenceData.resources.some(
      (resource) =>
        resource.id === item.id,
    )
  }

  return referenceData.products.some(
    (product) =>
      product.id === item.id,
  )
}

/**
 * Reports network references that cannot be resolved against the currently
 * loaded reference-data catalogue.
 */
function validateUnknownReferenceDataIds(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) {
    return []
  }

  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    if (
      outpost.systemId &&
      !referenceData.systems.some(
        (system) =>
          system.id === outpost.systemId,
      )
    ) {
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown star system ID "${outpost.systemId}".`,
        outpostId: outpost.id,
      })
    }

    if (
      outpost.bodyId &&
      !referenceData.bodies.some(
        (body) =>
          body.id === outpost.bodyId,
      )
    ) {
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown planetary body ID "${outpost.bodyId}".`,
        outpostId: outpost.id,
      })
    }

    for (const resourceId of outpost.localResources) {
      if (
        referenceData.resources.some(
          (resource) =>
            resource.id === resourceId,
        )
      ) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown resource ID "${resourceId}" in its local resources.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'resource',
          id: resourceId,
        },
      })
    }

    for (const resourceId of outpost.activeProduction) {
      if (
        referenceData.resources.some(
          (resource) =>
            resource.id === resourceId,
        )
      ) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown resource ID "${resourceId}" in its active production.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'resource',
          id: resourceId,
        },
      })
    }

    for (const entry of outpost.manufacturing) {
      if (
        referenceData.products.some(
          (product) =>
            product.id === entry.productId,
        )
      ) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown product ID "${entry.productId}" in its manufacturing list.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'product',
          id: entry.productId,
        },
      })
    }

    for (const item of outpost.plannedSupply) {
      if (
        cargoItemExists(
          item,
          referenceData,
        )
      ) {
        continue
      }

      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message:
          `This outpost refers to unknown ${item.type} ID "${item.id}" in Planned Supply.`,
        outpostId: outpost.id,
        cargoItem: item,
      })
    }

    for (const cargoPad of outpost.cargoPads) {
      for (const item of cargoPad.outboundItems) {
        if (
          cargoItemExists(
            item,
            referenceData,
          )
        ) {
          continue
        }

        issues.push({
          ruleId: RULE_ID,
          category: 'structural',
          severity: 'error',
          message:
            `This cargo pad refers to unknown ${item.type} ID "${item.id}" in its outbound items.`,
          outpostId: outpost.id,
          cargoPadId: cargoPad.id,
          cargoItem: item,
        })
      }
    }
  }

  return issues
}

export const unknownReferenceDataIdRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Unknown reference-data ID',
    description:
      'Flags persisted system, body, resource, or product IDs that do not exist in the loaded reference data.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateUnknownReferenceDataIds,
  }