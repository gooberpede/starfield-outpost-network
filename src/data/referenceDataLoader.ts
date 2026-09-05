/**
 * referenceDataLoader.ts
 *
 * Purpose:
 *   Loads the application's external reference-data JSON files at runtime
 *   and combines them into a single ReferenceData object.
 *
 * Architecture:
 *   This file belongs to the data layer. It knows where the flat files
 *   are located and how to fetch and parse them, but it does not know
 *   anything about React components or how the data is displayed.
 *
 *   Keeping runtime loading here means the UI can later request a reload
 *   without being coupled to file paths or fetch logic.
 *
 * Change this file when:
 *   - reference-data files are moved or renamed;
 *   - loading changes from local JSON files to another source;
 *   - reload/error-handling behaviour changes;
 *   - new reference datasets are added.
 */

import type {
  BiomeReference,
  BodyBiomeReference,
  InorganicResourceOccurrenceReference,
  SpeciesReference,
  PlanetSpeciesReference,
  OrganicSpeciesOccurrenceReference,
  OrganicFarmingProfileReference,
  PlanetaryBodyReference,
  ProductRecipeReference,
  ProductReference,
  ReferenceData,
  ResourceReference,
  StarSystemReference,
  BodyResourcesReference,
} from '../domain/referenceData'

/**
 * Loads and parses one JSON file.
 *
 * This helper deliberately performs only transport/parsing. Structural
 * validation can be added later once the reference-data format settles.
 */
async function loadJsonFile<T>(path: string): Promise<T> {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(
      `Failed to load reference data from ${path}: ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

/**
 * Loads all runtime reference datasets used by the application.
 *
 * The files are fetched independently so each catalogue remains
 * physically separate even though the application receives them as one
 * ReferenceData object.
 */
export async function loadReferenceData(): Promise<ReferenceData> {
  const [
    biomes,
    bodyBiomes,
    inorganicOccurrences,
    species,
    planetSpecies,
    organicOccurrences,
    organicFarmingProfiles,
    systems,
    bodies,
    resources,
    products,
    bodyResources,
    productRecipes,
  ] = await Promise.all([
    loadJsonFile<BiomeReference[]>('/reference-data/biomes.json'),
    loadJsonFile<BodyBiomeReference[]>('/reference-data/body-biomes.json'),
    loadJsonFile<InorganicResourceOccurrenceReference[]>('/reference-data/inorganic-occurrences.json'),
    loadJsonFile<SpeciesReference[]>('/reference-data/species.json'),
    loadJsonFile<PlanetSpeciesReference[]>('/reference-data/planet-species.json'),
    loadJsonFile<OrganicSpeciesOccurrenceReference[]>('/reference-data/organic-occurrences.json'),
    loadJsonFile<OrganicFarmingProfileReference[]>('/reference-data/organic-farming-profiles.json'),
    loadJsonFile<StarSystemReference[]>(
      '/reference-data/systems.json',
    ),
    loadJsonFile<PlanetaryBodyReference[]>(
      '/reference-data/bodies.json',
    ),
    loadJsonFile<ResourceReference[]>(
      '/reference-data/resources.json',
    ),
    loadJsonFile<ProductReference[]>(
      '/reference-data/products.json',
    ),
    loadJsonFile<BodyResourcesReference[]>(
      '/reference-data/body-resources.json',
    ),
    loadJsonFile<ProductRecipeReference[]>(
      '/reference-data/product-recipes.json',
    ),
  ])

  return {
    biomes,
    bodyBiomes,
    inorganicOccurrences,
    species,
    planetSpecies,
    organicOccurrences,
    organicFarmingProfiles,
    systems,
    bodies,
    resources,
    products,
    bodyResources,
    productRecipes,
  }
}