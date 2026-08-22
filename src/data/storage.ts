/**
 * storage.ts
 *
 * Purpose:
 *   Provides persistence for the Starfield outpost network using the
 *   browser's localStorage API.
 *
 * Architecture:
 *   This file belongs to the data layer. It knows how to load and save
 *   OutpostNetwork objects, but it does not know anything about React
 *   components or how the network is presented in the UI.
 *
 *   It also contains the migration logic needed to upgrade older saved
 *   browser data into the current schema before that data reaches the
 *   rest of the application.
 *
 * Change this file when:
 *   - the persisted OutpostNetwork schema changes;
 *   - saved data needs to be migrated between schema versions;
 *   - the persistence mechanism changes from localStorage to something
 *     else, such as IndexedDB or a remote service.
 */

import type {
  CargoItem,
  CargoLink,
  OutpostNetwork,
} from '../domain/models'

const STORAGE_KEY = 'starfield-outpost-network'

interface LegacyCargoLink {
  destination: {
    type: 'outpost'
    outpostId: string
    cargoPadId?: string | null
  }
  exports?: CargoItem[]
}

interface LegacyCargoPad {
  id: string
  label: string
  type: 'regular' | 'interstellar'
  outboundItems?: CargoItem[]
  link?: LegacyCargoLink | null
}

interface LegacyOutpost {
  id: string
  name: string
  system: string
  body: string
  localResources?: string[]
  activeProduction?: string[]
  manufacturing?: {
    productId: string
    quantity: number
  }[]
  plannedSupply?: CargoItem[]
  cargoPads?: LegacyCargoPad[]
}

interface LegacyNetwork {
  schemaVersion?: number
  character: OutpostNetwork['character']
  outposts: LegacyOutpost[]
  cargoLinks?: CargoLink[]
}

/**
 * Creates a stable key for a cargo link regardless of which endpoint
 * happened to be recorded first.
 *
 * This lets the migration recognise A↔B and B↔A as the same
 * bidirectional relationship rather than creating duplicate links.
 */
function createCargoLinkKey(
  endpointA: CargoLink['endpointA'],
  endpointB: CargoLink['endpointB'],
): string {
  const endpoints = [
    `${endpointA.outpostId}:${endpointA.cargoPadId}`,
    `${endpointB.outpostId}:${endpointB.cargoPadId}`,
  ].sort()

  return endpoints.join('|')
}

/**
 * Loads the saved network and upgrades older cargo-pad data into the
 * current network-level cargo-link model.
 *
 * Old links that identify only an outpost, but not a specific remote
 * cargo pad, cannot be migrated safely and are therefore left unlinked.
 * Their outbound cargo is still preserved on the local pad.
 */
export function loadNetwork(): OutpostNetwork | null {
  const storedValue = localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  try {
    const storedNetwork = JSON.parse(storedValue) as LegacyNetwork

    const cargoLinks: CargoLink[] = []
    const cargoLinkKeys = new Set<string>()

    const outposts = (storedNetwork.outposts ?? []).map((outpost) => ({
      id: outpost.id,
      name: outpost.name,
      systemId: outpost.system,
      bodyId: outpost.body,

      /*
      * Persisted outpost collections have been added over time. Supply an
      * empty collection when loading older saves so the rest of the
      * application can always work with the current Outpost shape.
      */
      localResources: outpost.localResources ?? [],
      activeProduction: outpost.activeProduction ?? [],
      manufacturing: outpost.manufacturing ?? [],
      plannedSupply: outpost.plannedSupply ?? [],

      cargoPads: (outpost.cargoPads ?? []).map((pad) => {
        const outboundItems =
          pad.outboundItems ??
          pad.link?.exports ??
          []

        const destination = pad.link?.destination

        /*
         * A network-level cargo link can only be created when both
         * endpoints are known. Older records may know the destination
         * outpost but not which of its pads was selected.
         */
        if (
          destination?.type === 'outpost' &&
          destination.cargoPadId
        ) {
          const endpointA = {
            outpostId: outpost.id,
            cargoPadId: pad.id,
          }

          const endpointB = {
            outpostId: destination.outpostId,
            cargoPadId: destination.cargoPadId,
          }

          const linkKey = createCargoLinkKey(
            endpointA,
            endpointB,
          )

          /*
           * If both ends of an old link recorded each other, they
           * describe the same relationship. Store it only once.
           */
          if (!cargoLinkKeys.has(linkKey)) {
            cargoLinkKeys.add(linkKey)

            cargoLinks.push({
              id: crypto.randomUUID(),
              endpointA,
              endpointB,
            })
          }
        }

        return {
          id: pad.id,
          label: pad.label,
          type: pad.type,
          outboundItems,
        }
      }),
    }))

    /*
     * If a network already contains network-level cargo links, retain
     * them. This makes the loader safe to use after the migration has
     * already taken place.
     */
    for (const cargoLink of storedNetwork.cargoLinks ?? []) {
      const linkKey = createCargoLinkKey(
        cargoLink.endpointA,
        cargoLink.endpointB,
      )

      if (!cargoLinkKeys.has(linkKey)) {
        cargoLinkKeys.add(linkKey)
        cargoLinks.push(cargoLink)
      }
    }

    return {
      schemaVersion: 2,
      character: storedNetwork.character,
      outposts,
      cargoLinks,
    }
  } catch {
    return null
  }
}

/**
 * Saves the current network exactly as represented by the current schema.
 *
 * Migration happens only on load; once an older network has been loaded
 * successfully, subsequent saves persist the upgraded representation.
 */
export function saveNetwork(network: OutpostNetwork): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(network),
  )
}