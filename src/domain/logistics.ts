/**
 * logistics.ts
 *
 * Purpose:
 *   Derives compact whole-outpost logistics summaries from cargo pads and
 *   network-level cargo links.
 *
 * Architecture:
 *   Cargo configuration remains persisted on pads/links. These helpers expose
 *   read-only summaries for presentation without duplicating logistics state.
 *
 * Change this file when:
 *   - cargo link direction/endpoint semantics change;
 *   - another UI needs a whole-outpost import or export summary.
 */

import type {
  CargoItem,
  OutpostNetwork,
} from './models'

export interface OutpostImportSummary {
  sourceOutpostId: string
  sourceOutpostName: string
  items: CargoItem[]
}

export function getCargoItemKey(item: CargoItem): string {
  return `${item.type}:${item.id}`
}

/**
 * Returns distinct outbound items whose local pad has a defined, existing
 * remote cargo-link endpoint. Validator success is deliberately not required.
 */
export function getRoutedExportedItemKeysAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
): Set<string> {
  return new Set(getRoutedExportDestinationNamesAtOutpost(outpostId, network).keys())
}

/**
 * Groups each routed outbound item by destination outpost name. Cargo-pad order
 * provides deterministic presentation order; repeated destination names collapse.
 */
export function getRoutedExportDestinationNamesAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
): Map<string, string[]> {
  const destinationsByItem = new Map<string, string[]>()
  const outpost = network.outposts.find((candidate) => candidate.id === outpostId)
  if (!outpost) return destinationsByItem

  for (const pad of outpost.cargoPads) {
    const link = network.cargoLinks.find((candidate) =>
      (
        candidate.endpointA.outpostId === outpostId &&
        candidate.endpointA.cargoPadId === pad.id
      ) || (
        candidate.endpointB.outpostId === outpostId &&
        candidate.endpointB.cargoPadId === pad.id
      ),
    )
    if (!link) continue

    const remoteEndpoint =
      link.endpointA.outpostId === outpostId && link.endpointA.cargoPadId === pad.id
        ? link.endpointB
        : link.endpointA
    const remoteOutpost = network.outposts.find(
      (candidate) => candidate.id === remoteEndpoint.outpostId,
    )
    const remotePadExists = remoteOutpost?.cargoPads.some(
      (candidate) => candidate.id === remoteEndpoint.cargoPadId,
    )
    if (!remoteOutpost || !remotePadExists) continue

    for (const item of pad.outboundItems) {
      const itemKey = getCargoItemKey(item)
      const destinationNames = destinationsByItem.get(itemKey) ?? []
      if (!destinationNames.includes(remoteOutpost.name)) {
        destinationNames.push(remoteOutpost.name)
      }
      destinationsByItem.set(itemKey, destinationNames)
    }
  }

  return destinationsByItem
}

/**
 * Aggregates actual inbound cargo by remote source outpost.
 *
 * Multiple links from one outpost collapse into a single summary and repeated
 * item identities are retained only once.
 */
export function getImportSummariesAtOutpost(
  outpostId: string,
  network: OutpostNetwork,
): OutpostImportSummary[] {
  const summariesByOutpost = new Map<
    string,
    {
      sourceOutpostName: string
      itemsByKey: Map<string, CargoItem>
    }
  >()

  for (const link of network.cargoLinks) {
    const remoteEndpoint =
      link.endpointA.outpostId === outpostId
        ? link.endpointB
        : link.endpointB.outpostId === outpostId
          ? link.endpointA
          : null

    if (!remoteEndpoint) {
      continue
    }

    const remoteOutpost = network.outposts.find(
      (candidate) => candidate.id === remoteEndpoint.outpostId,
    )
    const remotePad = remoteOutpost?.cargoPads.find(
      (pad) => pad.id === remoteEndpoint.cargoPadId,
    )

    if (!remoteOutpost || !remotePad || remotePad.outboundItems.length === 0) {
      continue
    }

    const summary = summariesByOutpost.get(remoteOutpost.id) ?? {
      sourceOutpostName: remoteOutpost.name,
      itemsByKey: new Map<string, CargoItem>(),
    }

    for (const item of remotePad.outboundItems) {
      summary.itemsByKey.set(getCargoItemKey(item), item)
    }

    summariesByOutpost.set(remoteOutpost.id, summary)
  }

  return [...summariesByOutpost.entries()]
    .map(([sourceOutpostId, summary]) => ({
      sourceOutpostId,
      sourceOutpostName: summary.sourceOutpostName,
      items: [...summary.itemsByKey.values()],
    }))
    .sort((left, right) =>
      left.sourceOutpostName.localeCompare(right.sourceOutpostName),
    )
}
