/**
 * referenceData.ts
 *
 * Purpose:
 *   Defines the TypeScript shapes used by externally loaded reference
 *   data such as star systems, planetary bodies, resources, and
 *   manufactured products.
 *
 * Architecture:
 *   This file belongs to the domain layer. It describes the structure
 *   of reference data, but it does not load files, fetch data, or know
 *   anything about React components.
 *
 *   The reference-data loader will use these types when converting JSON
 *   files into in-memory application data. UI components will then consume
 *   the loaded reference data through higher-level props or context.
 *
 * Change this file when:
 *   - a reference dataset gains new fields;
 *   - a new kind of reference entity is introduced;
 *   - relationships between reference entities change;
 *   - future validation or planning features require richer metadata.
 */

/**
 * Stable identifier for a star system.
 *
 * IDs are intended to remain unchanged even if display names or other
 * descriptive fields are edited later.
 */
export type StarSystemId = string

/**
 * Stable identifier for a planetary body.
 */
export type PlanetaryBodyId = string

export type BiomeId = string
export type BodyBiomeId = string
export type SpeciesId = string

/** Broad canonical body classification provided by Planet Directory. */
export type PlanetaryBodyType =
  | 'planet'
  | 'moon'
  | 'orbital'

/**
 * Stable identifier for a resource.
 */
export type ResourceId = string

/**
 * Stable identifier for a manufactured product.
 */
export type ProductId = string

/**
 * Represents a star system available for selection in the outpost editor.
 *
 * For the first version only identity and display name are required.
 * Additional system-level metadata can be added later without changing
 * the basic relationship between systems and planetary bodies.
 */
export interface StarSystemReference {
  id: StarSystemId
  name: string
}

/**
 * Represents a planet, moon, or orbital in the canonical body catalogue.
 *
 * Each body references its parent star system by ID rather than storing
 * the system name directly. This keeps system identity consistent and
 * allows the UI to filter bodies by the selected system.
 *
 * Outpost eligibility is derived during reference-data generation from
 * source-specific xEdit fields. Runtime consumers should use the resulting
 * outpostAllowed fact instead of reproducing that derivation.
 */
export interface PlanetaryBodyReference {
  id: PlanetaryBodyId
  systemId: StarSystemId
  name: string
  bodyType: PlanetaryBodyType
  outpostAllowed: boolean
  solarArrayPower: number | null
  windTurbinePower: number | null
  planetaryHabitationRank: number | null
}

/**
 * Identifies the broad gameplay category of a resource.
 *
 * More detailed classifications, such as storage class, can be added
 * later without changing whether a resource is organic or inorganic.
 */
export type ResourceCategory =
  | 'inorganic'
  | 'organic'

/** Shared rarity scale used by resource and manufactured-product catalogues. */
export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'exotic'
  | 'unique'

/**
 * Represents an organic or inorganic resource known to the application.
 *
 * Inorganic resources may reference their immediate family parent and an
 * optional sibling order. Organic resources carry explicit nulls for both.
 */
export interface ResourceReference {
  id: ResourceId
  name: string
  shortName: string
  category: ResourceCategory
  rarity: Rarity
  parentId: ResourceId | null
  sortOrder: number | null
}

/** Canonical FormID identity; display names are deliberately non-unique. */
export interface BiomeReference {
  id: BiomeId
  name: string
}

/** Stable body FormID + biome index identity, retaining source ordering. */
export interface BodyBiomeReference {
  id: BodyBiomeId
  bodyId: PlanetaryBodyId
  biomeId: BiomeId
  biomeIndex: number
}

export type InorganicOccurrenceLocation =
  | { type: 'biome'; bodyBiomeId: BodyBiomeId }
  | { type: 'atmosphere' }

export interface InorganicResourceOccurrenceReference {
  bodyId: PlanetaryBodyId
  resourceId: ResourceId
  location: InorganicOccurrenceLocation
}

export type SpeciesType = 'flora' | 'fauna'
export type OrganicSourceClass = 'plant' | 'herbivore' | 'carnivore'

export interface SpeciesReference {
  id: SpeciesId
  name: string
  type: SpeciesType
}

/** Resource, class, and domesticability must agree across this body's biomes. */
export interface PlanetSpeciesReference {
  bodyId: PlanetaryBodyId
  speciesId: SpeciesId
  sourceClass: OrganicSourceClass | null
  domesticable: boolean
  resourceId: ResourceId | null
}

export interface OrganicSpeciesOccurrenceReference {
  bodyBiomeId: BodyBiomeId
  speciesId: SpeciesId
}

export interface FarmingIngredientReference {
  resourceId: ResourceId
  quantity: number
}

/** Inputs describe a source class; their presence does not imply farmability. */
export interface OrganicFarmingProfileReference {
  sourceClass: OrganicSourceClass
  inputs: FarmingIngredientReference[]
}

/**
 * Lists the resources known to occur on one planetary body.
 *
 * Derived compatibility index: all biome/atmospheric inorganics plus all
 * harvested organics, including non-domesticable sources. This is not
 * canonical source truth and can retire once consumers are biome-aware.
 */
export interface BodyResourcesReference {
  bodyId: PlanetaryBodyId
  resourceIds: ResourceId[]
}

/**
 * Represents a manufactured product known to the application.
 *
 * Recipe inputs remain separate, while rarity is shared with resources.
 */
export interface ProductReference {
  id: ProductId
  name: string
  shortName: string
  rarity: Rarity
}

/**
 * Identifies one resource or manufactured product used as a recipe input.
 *
 * This intentionally mirrors the resource/product distinction used by
 * CargoItem without importing the persisted network model into reference
 * data. Reference data should remain independent of player-network state.
 */
export type RecipeIngredientItemReference =
  | {
      type: 'resource'
      id: ResourceId
    }
  | {
      type: 'product'
      id: ProductId
    }

/**
 * Represents one input required by a product's canonical crafting recipe.
 *
 * Quantity stores the unmodified base-game requirement. Character-specific
 * modifiers such as Research Methods must be applied separately by domain
 * logic rather than altering the stored recipe.
 */
export interface RecipeIngredientReference {
  item: RecipeIngredientItemReference
  quantity: number
}

/**
 * Represents the canonical crafting recipe for one manufactured product.
 *
 * Recipes are stored separately from ProductReference so product identity
 * remains independent of crafting relationships and future recipe metadata.
 */
export interface ProductRecipeReference {
  productId: ProductId
  ingredients: RecipeIngredientReference[]
}

/**
 * Aggregates all reference datasets loaded by the application.
 *
 * Keeping the datasets inside one top-level object gives the loader and
 * UI a single reference-data snapshot that can later be replaced when
 * the user reloads or refreshes the flat files.
 */
export interface ReferenceData {
  biomes: BiomeReference[]
  bodyBiomes: BodyBiomeReference[]
  inorganicOccurrences: InorganicResourceOccurrenceReference[]
  species: SpeciesReference[]
  planetSpecies: PlanetSpeciesReference[]
  organicOccurrences: OrganicSpeciesOccurrenceReference[]
  organicFarmingProfiles: OrganicFarmingProfileReference[]
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]
  resources: ResourceReference[]
  products: ProductReference[]
  bodyResources: BodyResourcesReference[]
  productRecipes: ProductRecipeReference[]
}
