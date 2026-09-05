/**
 * Purpose: Own production-route identity and its resource-level aggregation boundary.
 * Architecture: Route identity stays in production UI/validation; cargo and supply consume IDs.
 * Change this file when: production mechanisms or downstream aggregation semantics change.
 */
import type { Outpost, ResourceProductionRoute } from './models'
import type { ReferenceData, ResourceId } from './referenceData'

export function getProductionRouteKey(route: ResourceProductionRoute): string {
  return route.type === 'organic'
    ? `${route.type}:${route.resourceId}:${route.speciesId}`
    : `${route.type}:${route.resourceId}`
}

export function productionRoutesMatch(
  left: ResourceProductionRoute,
  right: ResourceProductionRoute,
): boolean {
  return getProductionRouteKey(left) === getProductionRouteKey(right)
}

/** Invalid persisted routes still count as asserted production downstream. */
export function getActiveProducedResourceIds(outpost: Outpost): ResourceId[] {
  return [...new Set(outpost.activeProduction.map((route) => route.resourceId))]
}

export function getOrganicRouteInputs(
  referenceData: ReferenceData,
  bodyId: string,
  route: ResourceProductionRoute,
) {
  if (route.type !== 'organic') {
    return []
  }

  const planetSpecies = referenceData.planetSpecies.find(
    (entry) =>
      entry.bodyId === bodyId &&
      entry.speciesId === route.speciesId &&
      entry.resourceId === route.resourceId,
  )
  const profile = referenceData.organicFarmingProfiles.find(
    (entry) => entry.sourceClass === planetSpecies?.sourceClass,
  )

  return profile?.inputs ?? []
}
