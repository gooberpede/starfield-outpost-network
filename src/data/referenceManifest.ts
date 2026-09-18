/** Fixed deployment inventory shared by the build verifier and browser gate. */
export const referenceAssets = [
  ['biomes.json', 'biomes', 'id', 'name'],
  ['body-biomes.json', 'bodyBiomes', 'id', 'bodyId', 'biomeId'],
  ['inorganic-occurrences.json', 'inorganicOccurrences', 'bodyId', 'resourceId', 'location'],
  ['species.json', 'species', 'id', 'name', 'type'],
  ['planet-species.json', 'planetSpecies', 'bodyId', 'speciesId', 'domesticable'],
  ['organic-occurrences.json', 'organicOccurrences', 'bodyBiomeId', 'speciesId'],
  ['organic-farming-profiles.json', 'organicFarmingProfiles', 'sourceClass', 'inputs'],
  ['systems.json', 'systems', 'id', 'name'],
  ['bodies.json', 'bodies', 'id', 'systemId', 'name', 'bodyType', 'outpostAllowed'],
  ['resources.json', 'resources', 'id', 'name', 'category'],
  ['products.json', 'products', 'id', 'name', 'rarity'],
  ['body-resources.json', 'bodyResources', 'bodyId', 'resourceIds'],
  ['product-recipes.json', 'productRecipes', 'productId', 'ingredients'],
] as const

export const referenceManifestSchemaVersion = 1
// Current largest file is ~1.1 MiB. 8 MiB per file permits substantial growth.
export const maxReferenceAssetBytes = 8 * 1024 * 1024
export const maxReferenceManifestBytes = 16 * 1024

export interface ReferenceAssetEntry { path: string; sha256: string }

/** UTF-8 SHA-256 over this exact JSON, without datasetId or whitespace. */
export function canonicalDatasetContent(assets: readonly ReferenceAssetEntry[]): string {
  return JSON.stringify({ schemaVersion: referenceManifestSchemaVersion, assets })
}
