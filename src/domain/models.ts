import type {
  BodyBiomeId,
  PlanetaryBodyId,
  ProductId,
  ProductReference,
  ResourceId,
  ResourceReference,
  SpeciesId,
  StarSystemId,
} from './referenceData'

export interface CharacterSkills {
  outpostManagement: number | null
  outpostEngineering: number | null
  planetaryHabitation: number | null
  researchMethods: number | null
  specialProjects: number | null
}

export interface Character {
  name: string
  level: number | null
  skills: CharacterSkills
}

export type Resource = ResourceReference
export type Product = ProductReference

export interface ManufacturingEntry {
  productId: ProductId
  quantity: number
}

/** Identifies one persisted local resource-production mechanism. */
export type ResourceProductionRoute =
  | { type: 'inorganic'; resourceId: ResourceId }
  | { type: 'organic'; resourceId: ResourceId; speciesId: SpeciesId }
  | { type: 'organic-unspecified'; resourceId: ResourceId }

export type CargoPadType = 'regular' | 'interstellar'

/**
 * Identifies a resource or manufactured product used by cargo/supply logic.
 *
 * CargoItem represents the identity of an item without implying where it
 * comes from or how it is being used. The same shape can therefore describe
 * cargo-pad outbound contents or outpost-level planned supply.
 */
export type CargoItem =
  | {
      type: 'resource'
      id: ResourceId
    }
  | {
      type: 'product'
      id: ProductId
    }
    
/**
 * Identifies one physical endpoint of a cargo link.
 *
 * Both the outpost and cargo-pad IDs are required because cargo links
 * connect specific pads rather than outposts in general.
 */
export interface CargoLinkEndpoint {
  outpostId: string
  cargoPadId: string
}

/**
 * Represents one bidirectional relationship between two cargo pads.
 *
 * Cargo links belong to the network rather than to either individual
 * pad. endpointA and endpointB are equivalent sides of the relationship;
 * neither represents an inherent source or destination.
 *
 * Each cargo pad may participate in at most one CargoLink. That rule is
 * enforced by the application logic rather than by this type definition.
 */
export interface CargoLink {
  id: string
  endpointA: CargoLinkEndpoint
  endpointB: CargoLinkEndpoint
}

/**
 * Represents a cargo pad constructed at an outpost.
 *
 * A pad owns its outbound contents but does not store its cargo-link
 * relationship or its inbound contents. Links are stored at network
 * level, while inbound contents are derived from the outbound contents
 * of the pad at the opposite end of the link.
 */
export interface CargoPad {
  id: string
  label: string
  type: CargoPadType
  outboundItems: CargoItem[]
}

export interface Outpost {
  id: string
  name: string
  systemId: StarSystemId
  bodyId: PlanetaryBodyId
  selectedBiomeIds: BodyBiomeId[]
  localResources: ResourceId[]
  activeProduction: ResourceProductionRoute[]
  manufacturing: ManufacturingEntry[]
  plannedSupply: CargoItem[]
  cargoPads: CargoPad[]
}

/**
 * Top-level representation of a player's outpost network.
 *
 * Network-wide relationships such as cargo links live here rather than
 * being duplicated inside individual outposts or cargo pads.
 */
export interface OutpostNetwork {
  schemaVersion: number
  character: Character
  outposts: Outpost[]
  cargoLinks: CargoLink[]
}
