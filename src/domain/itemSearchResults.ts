/** Live, presentation-independent semantic results for one stable cargo item. */
import { getFeasibleManufacturedProductIdsAtOutpost } from './availability.ts'
import { getAvailableOrganicProductionRoutes } from './bodyResourceAvailability.ts'
import {
  getCargoItemKey,
  getRoutedExportedItemKeysAtOutpost,
} from './logistics.ts'
import type { CargoItem, Outpost, OutpostNetwork } from './models.ts'
import { getActiveProducedResourceIds } from './productionRoutes.ts'
import { getItemProvenanceAtOutpost } from './provenance.ts'
import type { ReferenceData } from './referenceData.ts'

export const itemSearchResultFlagOrder = [
  'present',
  'producing',
  'missing-inputs',
  'importing',
  'exporting',
  'planned-supply',
] as const

export type ItemSearchResultFlag = typeof itemSearchResultFlagOrder[number]

export interface ItemSearchResult {
  outpostId: string
  outpostName: string
  flags: ItemSearchResultFlag[]
}

export function isResourcePresentAtOutpost(
  resourceId: string,
  outpost: Outpost,
  referenceData: ReferenceData,
): boolean {
  const resource = referenceData.resources.find((candidate) => candidate.id === resourceId)
  if (resource?.category === 'inorganic') return outpost.localResources.includes(resourceId)
  if (resource?.category !== 'organic') return false
  return getAvailableOrganicProductionRoutes(
    referenceData,
    outpost.bodyId,
    outpost.selectedBiomeIds,
  ).some((route) => route.resourceId === resourceId)
}

export function getItemSearchResults(
  item: CargoItem,
  network: OutpostNetwork,
  referenceData: ReferenceData,
): ItemSearchResult[] {
  const itemKey = getCargoItemKey(item)
  const hasKnownProduct = item.type === 'product' &&
    referenceData.products.some((product) => product.id === item.id)
  const recipe = item.type === 'product'
    ? referenceData.productRecipes.find((candidate) => candidate.productId === item.id)
    : undefined
  const hasResolvedRecipe = recipe !== undefined && recipe.ingredients.every((ingredient) =>
    ingredient.item.type === 'resource'
      ? referenceData.resources.some((resource) => resource.id === ingredient.item.id)
      : referenceData.products.some((product) => product.id === ingredient.item.id))

  return network.outposts.flatMap((outpost) => {
    const produced = item.type === 'resource'
      ? getActiveProducedResourceIds(outpost).includes(item.id)
      : getFeasibleManufacturedProductIdsAtOutpost(
          outpost.id, network, referenceData,
        ).has(item.id)
    const configuredProduct = item.type === 'product' &&
      outpost.manufacturing.some((entry) => entry.productId === item.id)
    const flags = itemSearchResultFlagOrder.filter((flag) => {
      if (flag === 'present') {
        return item.type === 'resource' && isResourcePresentAtOutpost(item.id, outpost, referenceData)
      }
      if (flag === 'producing') return produced
      if (flag === 'missing-inputs') {
        return configuredProduct && hasKnownProduct && hasResolvedRecipe && !produced
      }
      if (flag === 'importing') {
        return getItemProvenanceAtOutpost(
          outpost.id, item, network, referenceData,
        ).remoteOutpostIds.length > 0
      }
      if (flag === 'exporting') {
        return getRoutedExportedItemKeysAtOutpost(outpost.id, network).has(itemKey)
      }
      return outpost.plannedSupply.some((planned) => getCargoItemKey(planned) === itemKey)
    })
    return flags.length > 0 ? [{ outpostId: outpost.id, outpostName: outpost.name, flags }] : []
  })
}
