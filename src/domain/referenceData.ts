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
 * Represents a planet or moon that may host an outpost.
 *
 * Each body references its parent star system by ID rather than storing
 * the system name directly. This keeps system identity consistent and
 * allows the UI to filter bodies by the selected system.
 */
export interface PlanetaryBodyReference {
  id: PlanetaryBodyId
  systemId: StarSystemId
  name: string
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

/**
 * Represents an organic or inorganic resource known to the application.
 *
 * The first version stores only identity, display name, abbreviation,
 * and broad category. Later versions may add properties such as storage
 * class, mass, value, rarity, or resource-family information.
 */
export interface ResourceReference {
  id: ResourceId
  name: string
  shortName: string
  category: ResourceCategory
}

/**
 * Lists the resources known to occur on one planetary body.
 *
 * This relationship is kept separate from PlanetaryBodyReference so
 * basic body identity/location data remains independent of resource
 * occurrence data.
 */
export interface BodyResourcesReference {
  bodyId: PlanetaryBodyId
  resourceIds: ResourceId[]
}

/**
 * Represents a manufactured product known to the application.
 *
 * The initial model contains only identity and display name. Recipe
 * inputs, value, mass, fabricator tier, and other manufacturing metadata
 * can be added later.
 */
export interface ProductReference {
  id: ProductId
  name: string
  shortName: string
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
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]
  resources: ResourceReference[]
  products: ProductReference[]
  bodyResources: BodyResourcesReference[]
  productRecipes: ProductRecipeReference[]
}