/**
 * availability.ts
 *
 * Purpose:
 *   Derives actual and effective item availability at an outpost.
 *
 * Architecture:
 *   Availability is derived rather than persisted. Base actual supply comes
 *   from active local production and inbound cargo. Planned Supply joins that
 *   base only for prerequisite resolution, then a fixed-point pass adds each
 *   locally configured product whose complete recipe is effectively supplied.
 *
 *   A feasible manufactured output is actual local supply even when one of
 *   its inputs is virtual Planned Supply. Planned Supply entries themselves
 *   remain virtual and never appear in actual availability.
 *
 * Change this file when:
 *   - new forms of actual or prerequisite supply are introduced;
 *   - manufacturing feasibility rules change;
 *   - external or manual supply sources are added.
 */

import { getEligibleCargoLinks } from './cargoConnections.ts'
import type {
  CargoItem,
  Outpost,
  OutpostNetwork,
} from './models'
import { getActiveProducedResourceIds } from './productionRoutes.ts'
import type {
  ProductId,
  ReferenceData,
} from './referenceData.ts'

/** Resource and product IDs can overlap, so type participates in identity. */
function getCargoItemKey(item: CargoItem) {
  return `${item.type}:${item.id}`
}

function addAvailableItem(
  itemsByKey: Map<string, CargoItem>,
  item: CargoItem,
) {
  itemsByKey.set(getCargoItemKey(item), item)
}

/** Returns actual supply that does not depend on local manufacturing. */
function getBaseActuallyAvailableItemsAtOutpost(
  outpost: Outpost,
  network: OutpostNetwork,
): Map<string, CargoItem> {
  const itemsByKey = new Map<string, CargoItem>()

  for (const resourceId of getActiveProducedResourceIds(outpost)) {
    addAvailableItem(itemsByKey, { type: 'resource', id: resourceId })
  }

  /* The remote pad's outbound selection supplies the whole local outpost. */
  for (const link of getEligibleCargoLinks(network)) {
    const remoteEndpoint =
      link.endpointA.outpostId === outpost.id
        ? link.endpointB
        : link.endpointB.outpostId === outpost.id
          ? link.endpointA
          : null

    if (!remoteEndpoint) continue

    const remoteOutpost = network.outposts.find(
      (candidate) => candidate.id === remoteEndpoint.outpostId,
    )
    const remotePad = remoteOutpost?.cargoPads.find(
      (pad) => pad.id === remoteEndpoint.cargoPadId,
    )

    if (!remotePad) continue

    for (const item of remotePad.outboundItems) {
      addAvailableItem(itemsByKey, item)
    }
  }

  return itemsByKey
}

/**
 * Resolves configured manufacturing through repeated passes over recipes.
 *
 * Products are added only when reference data proves every direct input is
 * effective. An unseeded recipe cycle therefore adds nothing and terminates,
 * while an externally supplied member can seed normal propagation.
 */
export function getFeasibleManufacturedProductIdsAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
  referenceData?: ReferenceData,
): Set<ProductId> {
  const outpost = network.outposts.find(
    (candidate) => candidate.id === outpostId,
  )

  if (!outpost || !referenceData) return new Set()

  const effectiveItemKeys = new Set(
    getBaseActuallyAvailableItemsAtOutpost(outpost, network).keys(),
  )
  for (const item of outpost.plannedSupply) {
    effectiveItemKeys.add(getCargoItemKey(item))
  }

  const recipesByProductId = new Map(
    referenceData.productRecipes.map((recipe) => [recipe.productId, recipe]),
  )
  const feasibleProductIds = new Set<ProductId>()
  let addedProduct = true

  while (addedProduct) {
    addedProduct = false

    for (const entry of outpost.manufacturing) {
      if (feasibleProductIds.has(entry.productId)) continue

      const recipe = recipesByProductId.get(entry.productId)
      if (!recipe || !recipe.ingredients.every((ingredient) =>
        effectiveItemKeys.has(getCargoItemKey(ingredient.item)))) {
        continue
      }

      feasibleProductIds.add(entry.productId)
      effectiveItemKeys.add(`product:${entry.productId}`)
      addedProduct = true
    }
  }

  return feasibleProductIds
}

/**
 * Returns active local production, inbound cargo, and feasible local
 * manufacturing. Planned Supply is excluded, though it may supply a recipe.
 */
export function getActuallyAvailableItemsAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
  referenceData?: ReferenceData,
): CargoItem[] {
  const outpost = network.outposts.find(
    (candidate) => candidate.id === outpostId,
  )

  if (!outpost) return []

  const itemsByKey = getBaseActuallyAvailableItemsAtOutpost(outpost, network)
  for (const productId of getFeasibleManufacturedProductIdsAtOutpost(
    outpostId,
    network,
    referenceData,
  )) {
    addAvailableItem(itemsByKey, { type: 'product', id: productId })
  }

  return [...itemsByKey.values()]
}

/** Returns actual items plus virtual Planned Supply placeholders. */
export function getAvailableItemsAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
  referenceData?: ReferenceData,
): CargoItem[] {
  const outpost = network.outposts.find(
    (candidate) => candidate.id === outpostId,
  )

  if (!outpost) return []

  const itemsByKey = new Map<string, CargoItem>()
  for (const item of getActuallyAvailableItemsAtOutpost(
    outpostId,
    network,
    referenceData,
  )) {
    addAvailableItem(itemsByKey, item)
  }
  for (const item of outpost.plannedSupply) {
    addAvailableItem(itemsByKey, item)
  }

  return [...itemsByKey.values()]
}

/**
 * Retires virtual placeholders whose exact items now have actual sources.
 * This collateral change belongs in the same history entry as the user action
 * that fulfilled the supply.
 */
export function retireFulfilledPlannedSupply(
  network: OutpostNetwork,
  referenceData?: ReferenceData,
): OutpostNetwork {
  const outposts = network.outposts.map((outpost) => {
    const actuallyAvailableKeys = new Set(
      getActuallyAvailableItemsAtOutpost(
        outpost.id,
        network,
        referenceData,
      ).map(getCargoItemKey),
    )
    const plannedSupply = outpost.plannedSupply.filter(
      (item) => !actuallyAvailableKeys.has(getCargoItemKey(item)),
    )

    return plannedSupply.length === outpost.plannedSupply.length
      ? outpost
      : { ...outpost, plannedSupply }
  })

  return outposts.every((outpost, index) => outpost === network.outposts[index])
    ? network
    : { ...network, outposts }
}
