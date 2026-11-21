import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import type { OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'

export const fuelReference: ReferenceData = {
  systems: ['A', 'B', 'C'].map(id => ({ id, name: id })),
  bodies: [], resources: [], products: [], bodyResources: [], productRecipes: [],
  biomes: [], bodyBiomes: [], inorganicOccurrences: [], species: [], planetSpecies: [],
  organicOccurrences: [], organicFarmingProfiles: [],
}
export const end = (outpostId: string) => ({ outpostId, cargoPadId: 'pad' })
export const helium = { type: 'resource', id: 'helium-3' } as const

export function fuelNetwork(): OutpostNetwork {
  return {
    ...createDefaultNetwork(),
    outposts: ['A', 'B', 'C'].map(id => ({
      ...createDefaultOutpost([], id, 'Station ' + id), systemId: id,
      cargoPads: [{ id: 'pad', label: 'Pad 1', type: 'interstellar', outboundItems: [] }],
    })),
    cargoLinks: [{ id: 'route', endpointA: end('A'), endpointB: end('B') }],
  }
}
