/**
 * duplicateCollectionEntries.ts
 *
 * Purpose:
 *   Detects repeated semantic entries inside collections that should contain
 *   each resource, product, or cargo item at most once.
 *
 * Architecture:
 *   This is a structural data-integrity validator. Duplicate entries may arise
 *   from malformed imports, hand-edited JSON, migration bugs, or future UI
 *   defects.
 *
 *   Object-identity collisions, such as duplicate cargo-pad IDs or cargo-link
 *   IDs, are deliberately outside this rule's scope and can be validated
 *   separately.
 *
 * Change this file when:
 *   - collection uniqueness rules change;
 *   - new unique-entry collections are added to the model;
 *   - duplicate-entry diagnostics need richer context.
 */

import type {
  CargoItem,
  ResourceProductionRoute,
} from '../../models'
import { getProductionRouteKey } from '../../productionRoutes.ts'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'duplicate-collection-entry'

/**
 * Produces a stable key for a resource or product cargo item.
 */
function getCargoItemKey(
  item: CargoItem,
): string {
  return `${item.type}:${item.id}`
}

/**
 * Returns the values that occur more than once in a string collection.
 *
 * Each duplicated value is returned only once, regardless of how many times
 * it appears.
 */
function getDuplicateStrings(
  values: string[],
): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    } else {
      seen.add(value)
    }
  }

  return [...duplicates]
}

/**
 * Returns the cargo items that occur more than once in a CargoItem collection.
 *
 * Resource and product IDs are namespaced by item type so identically named
 * IDs from different item kinds cannot collide.
 */
function getDuplicateCargoItems(
  items: CargoItem[],
): CargoItem[] {
  const seen = new Set<string>()
  const duplicates = new Map<string, CargoItem>()

  for (const item of items) {
    const key =
      getCargoItemKey(item)

    if (seen.has(key)) {
      duplicates.set(
        key,
        item,
      )
    } else {
      seen.add(key)
    }
  }

  return [...duplicates.values()]
}

function getDuplicateRoutes(routes: ResourceProductionRoute[]): ResourceProductionRoute[] {
  const seen = new Set<string>()
  const duplicates = new Map<string, ResourceProductionRoute>()
  for (const route of routes) {
    const key = getProductionRouteKey(route)
    if (seen.has(key)) duplicates.set(key, route)
    else seen.add(key)
  }
  return [...duplicates.values()]
}

/**
 * Reports duplicate entries in collections whose model semantics require
 * unique resources, products, or cargo items.
 */
function validateDuplicateCollectionEntries(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    for (
      const resourceId of
      getDuplicateStrings(outpost.localResources)
    ) {
      const resourceName = referenceData?.resources.find(
        (entry) => entry.id === resourceId,
      )?.name ?? resourceId
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message: `${resourceName} appears more than once in this outpost's local resources.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'resource',
          id: resourceId,
        },
      })
    }

    for (
      const route of getDuplicateRoutes(outpost.activeProduction)
    ) {
      const resourceName = referenceData?.resources.find(
        (entry) => entry.id === route.resourceId,
      )?.name ?? route.resourceId
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message: `${resourceName} appears more than once in this outpost's active production.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'resource',
          id: route.resourceId,
        },
      })
    }

    for (const bodyBiomeId of getDuplicateStrings(outpost.selectedBiomeIds ?? [])) {
      const biomeId = referenceData?.bodyBiomes.find(
        (entry) => entry.id === bodyBiomeId,
      )?.biomeId
      const biomeName = referenceData?.biomes.find(
        (entry) => entry.id === biomeId,
      )?.name ?? bodyBiomeId
      issues.push({
        ruleId: RULE_ID, category: 'structural', severity: 'error',
        message: `${biomeName} appears more than once in this outpost's biome selection.`,
        outpostId: outpost.id, bodyBiomeId,
      })
    }

    const manufacturingProductIds =
      outpost.manufacturing.map(
        (entry) =>
          entry.productId,
      )

    for (
      const productId of
      getDuplicateStrings(manufacturingProductIds)
    ) {
      const productName = referenceData?.products.find(
        (entry) => entry.id === productId,
      )?.name ?? productId
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message: `${productName} appears more than once in this outpost's manufacturing list.`,
        outpostId: outpost.id,
        cargoItem: {
          type: 'product',
          id: productId,
        },
      })
    }

    for (
      const item of
      getDuplicateCargoItems(outpost.plannedSupply)
    ) {
      const itemName = item.type === 'resource'
        ? referenceData?.resources.find((entry) => entry.id === item.id)?.name ?? item.id
        : referenceData?.products.find((entry) => entry.id === item.id)?.name ?? item.id
      issues.push({
        ruleId: RULE_ID,
        category: 'structural',
        severity: 'error',
        message: `${itemName} appears more than once in this outpost's Planned Supply.`,
        outpostId: outpost.id,
        cargoItem: item,
      })
    }

    for (const cargoPad of outpost.cargoPads) {
      for (
        const item of
        getDuplicateCargoItems(
          cargoPad.outboundItems,
        )
      ) {
        const itemName = item.type === 'resource'
          ? referenceData?.resources.find((entry) => entry.id === item.id)?.name ?? item.id
          : referenceData?.products.find((entry) => entry.id === item.id)?.name ?? item.id
        issues.push({
          ruleId: RULE_ID,
          category: 'structural',
          severity: 'error',
          message: `${itemName} appears more than once in this cargo pad's outbound items.`,
          outpostId: outpost.id,
          cargoPadId: cargoPad.id,
          cargoItem: item,
        })
      }
    }
  }

  return issues
}

export const duplicateCollectionEntriesRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Duplicate collection entry',
    description:
      'Flags repeated resources, products, or cargo items in collections that should contain unique entries.',
    category: 'structural',
    defaultSeverity: 'error',
    validate: validateDuplicateCollectionEntries,
  }
