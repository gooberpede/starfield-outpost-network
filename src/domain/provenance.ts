/**
 * provenance.ts
 *
 * Purpose:
 *   Derives the actual source or sources that provide a resource or
 *   manufactured product to a particular outpost.
 *
 * Architecture:
 *   Provenance is derived from network state rather than persisted.
 *
 *   For cargo/supply purposes, sources are intentionally coarse-grained:
 *   - local: the selected outpost actively produces or manufactures the item;
 *   - remote: one or more linked outposts export the item into this outpost.
 *
 *   Planned Supply is not an actual source and therefore never contributes
 *   provenance.
 *
 * Change this file when:
 *   - new forms of actual supply are introduced;
 *   - source-resolution rules change;
 *   - validation needs richer source information.
 *
 * Presentation concerns such as displaying "local", outpost names, or
 * "no source" belong in the UI layer rather than here.
 */

import type {
  CargoItem,
  OutpostNetwork,
} from './models'
import { getActiveProducedResourceIds } from './productionRoutes.ts'

/**
 * Describes the actual sources currently providing one item to an outpost.
 *
 * remoteOutpostIds contains stable IDs rather than display names so domain
 * logic remains independent of presentation.
 */
export interface ItemProvenance {
  local: boolean
  remoteOutpostIds: string[]
}

/**
 * Tests whether two CargoItem values identify the same logical item.
 */
function cargoItemsMatch(
  left: CargoItem,
  right: CargoItem,
) {
  return (
    left.type === right.type &&
    left.id === right.id
  )
}

/**
 * Returns the actual sources currently providing one item to an outpost.
 *
 * Local extraction/farming and local manufacturing are deliberately treated
 * as the same source category because cargo configuration only needs to know
 * whether the item originates at this outpost.
 *
 * Remote suppliers are deduplicated by outpost. Multiple pads or links from
 * the same remote outpost therefore produce one remote source entry.
 */
export function getItemProvenanceAtOutpost(
  outpostId: string,
  item: CargoItem,
  network: OutpostNetwork,
): ItemProvenance {
  const outpost =
    network.outposts.find(
      (candidate) => candidate.id === outpostId,
    )

  if (!outpost) {
    return {
      local: false,
      remoteOutpostIds: [],
    }
  }

  let local = false

  if (
    item.type === 'resource' &&
    getActiveProducedResourceIds(outpost).includes(item.id)
  ) {
    local = true
  }

  if (
    item.type === 'product' &&
    outpost.manufacturing.some(
      (entry) => entry.productId === item.id,
    )
  ) {
    local = true
  }

  const remoteOutpostIds =
    new Set<string>()

  /*
   * Cargo links are bidirectional. For each link involving this outpost,
   * locate the opposite endpoint and inspect that remote pad's outbound
   * contents.
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

    if (!remoteOutpost || !remotePad) {
      continue
    }

    if (
      remotePad.outboundItems.some(
        (outboundItem) =>
          cargoItemsMatch(
            outboundItem,
            item,
          ),
      )
    ) {
      remoteOutpostIds.add(remoteOutpost.id)
    }
  }

  return {
    local,
    remoteOutpostIds: [...remoteOutpostIds],
  }
}
