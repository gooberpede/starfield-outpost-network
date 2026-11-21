import { getEligibleCargoLinks, resolveEndpoint, endpointKey } from './cargoConnections.ts'
import type { CargoItem, CargoLinkEndpoint, OutpostNetwork } from './models.ts'
import type { ReferenceData } from './referenceData.ts'

export type CargoFuelSource = 'local' | 'remote' | 'neither' | 'local-unavailable'

/** Only resolved interstellar pairs in distinct, identified systems share fuel.
 * The caller supplies actual or planned-inclusive availability for this snapshot.
 */
export function resolveCargoFuel(network: OutpostNetwork, reference: ReferenceData | undefined,
  itemsAt: (outpostId: string) => CargoItem[]) {
  const systems = new Set(reference?.systems.map(system => system.id))
  const partners = new Map<string, string>()
  const supply = new Map<string, boolean>()
  function hasFuel(id: string) {
    let found = supply.get(id)
    if (found === undefined) {
      found = itemsAt(id).some(item => item.type === 'resource' && item.id === 'helium-3')
      supply.set(id, found)
    }
    return found
  }
  const links = getEligibleCargoLinks(network).filter(link => {
    const a = resolveEndpoint(network, link.endpointA)
    const b = resolveEndpoint(network, link.endpointB)
    if (a.pad?.type !== 'interstellar' || b.pad?.type !== 'interstellar' ||
      !a.outpost?.systemId.trim() || !b.outpost?.systemId.trim() ||
      a.outpost.systemId === b.outpost.systemId ||
      !systems.has(a.outpost.systemId) || !systems.has(b.outpost.systemId)) return false
    partners.set(endpointKey(link.endpointA), link.endpointB.outpostId)
    partners.set(endpointKey(link.endpointB), link.endpointA.outpostId)
    return true
  })
  function sourceAt(endpoint: CargoLinkEndpoint): CargoFuelSource {
    if (hasFuel(endpoint.outpostId)) return 'local'
    const partner = partners.get(endpointKey(endpoint))
    if (partner === undefined) return 'local-unavailable'
    return hasFuel(partner) ? 'remote' : 'neither'
  }
  return { links, sourceAt }
}
