/**
 * availability.ts
 *
 * Purpose:
 *   Derives which resources and manufactured products are currently
 *   available at a particular outpost from the recorded network state.
 *
 * Architecture:
 *   Availability is derived rather than stored. This prevents duplicated
 *   state from becoming stale when extraction, manufacturing, or cargo
 *   links change.
 *
 *   Actual supply comes from:
 *   - resources in active local production;
 *   - products currently manufactured at the outpost;
 *   - items arriving through inbound cargo links.
 *
 *   Selectable supply additionally includes Planned Supply. Planned Supply
 *   lets downstream configuration assume an item will eventually be present
 *   even though no actual source currently exists.
 *
 *   Manual stockpiles and other asserted sources are intentionally not
 *   modelled yet.
 *
 * Change this file when:
 *   - new ways for materials to become available are introduced;
 *   - availability rules become more detailed;
 *   - external or manual supply sources are added.
 */

import type {
  CargoItem,
  OutpostNetwork,
} from './models'
import { getActiveProducedResourceIds } from './productionRoutes.ts'

/**
 * Produces a stable comparison key for a cargo item.
 *
 * Resource and product IDs can theoretically contain the same text, so
 * the item type forms part of the identity.
 */
function getCargoItemKey(item: CargoItem) {
  return `${item.type}:${item.id}`
}

/**
 * Adds one cargo item to the availability set without introducing
 * duplicates.
 */
function addAvailableItem(
  itemsByKey: Map<string, CargoItem>,
  item: CargoItem,
) {
  itemsByKey.set(
    getCargoItemKey(item),
    item,
  )
}

/**
 * Returns the resources and products selectable as supply at one outpost.
 *
 * Availability is derived from recorded supply, not from cargo-pad usage.
 * An outbound cargo selection therefore does not make an item available
 * by itself.
 *
 * Existing usages elsewhere in the application should not be deleted when
 * an item ceases to appear in this result. Consumers can instead compare
 * their persistent configuration against current availability and flag
 * unresolved usages.
 */
export function getActuallyAvailableItemsAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
): CargoItem[] {
  const outpost =
    network.outposts.find(
      (candidate) => candidate.id === outpostId,
    )

  if (!outpost) {
    return []
  }

  const itemsByKey =
    new Map<string, CargoItem>()

  /*
   * Resources count as available only when they are actively being
   * extracted or farmed. Merely existing naturally on the body is not
   * sufficient.
   */
  for (const resourceId of getActiveProducedResourceIds(outpost)) {
    addAvailableItem(
      itemsByKey,
      {
        type: 'resource',
        id: resourceId,
      },
    )
  }

  /*
   * A manufacturing entry represents active local fabrication, so its
   * product is available for storage or onward export.
   */
  for (const entry of outpost.manufacturing) {
    addAvailableItem(
      itemsByKey,
      {
        type: 'product',
        id: entry.productId,
      },
    )
  }

  /*
   * Cargo links are bidirectional relationships. For every link involving
   * this outpost, locate the remote cargo pad and treat its outbound items
   * as inbound availability at the current outpost.
   */
  for (const link of network.cargoLinks) {
    let remoteEndpoint = null

    if (link.endpointA.outpostId === outpostId) {
      remoteEndpoint = link.endpointB
    } else if (link.endpointB.outpostId === outpostId) {
      remoteEndpoint = link.endpointA
    }

    if (!remoteEndpoint) {
      continue
    }

    const remoteOutpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === remoteEndpoint.outpostId,
      )

    const remotePad =
      remoteOutpost?.cargoPads.find(
        (pad) =>
          pad.id === remoteEndpoint.cargoPadId,
      )

    if (!remotePad) {
      continue
    }

    for (const item of remotePad.outboundItems) {
      addAvailableItem(
        itemsByKey,
        item,
      )
    }
  }

  return [...itemsByKey.values()]
}

/**
 * Returns the resources and products selectable as supply at one outpost.
 *
 * Cargo configuration may use both genuinely supplied items and explicit
 * Planned Supply assumptions. Existing callers that need the complete
 * selectable set should use this function rather than actual availability
 * alone.
 */
export function getAvailableItemsAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
): CargoItem[] {
  const outpost =
    network.outposts.find(
      (candidate) => candidate.id === outpostId,
    )

  if (!outpost) {
    return []
  }

  const itemsByKey =
    new Map<string, CargoItem>()

  for (
    const item of getActuallyAvailableItemsAtOutpost(
      outpostId,
      network,
    )
  ) {
    addAvailableItem(
      itemsByKey,
      item,
    )
  }

  /*
   * Planned Supply extends the selectable set without pretending that
   * those items already have a real source.
   */
  for (const item of outpost.plannedSupply) {
    addAvailableItem(
      itemsByKey,
      item,
    )
  }

  return [...itemsByKey.values()]
}
