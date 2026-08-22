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
  PlanetaryBodyReference,
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
    systems,
    bodies,
    resources,
    products,
    bodyResources,
  ] = await Promise.all([
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
  ])

  return {
    systems,
    bodies,
    resources,
    products,
    bodyResources,
  }
}