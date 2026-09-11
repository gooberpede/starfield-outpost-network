/** Central policy for resource-presence mechanisms and their capability gates. */
import {
  getAvailableOrganicProductionRoutes,
  getOutpostAvailableInorganicResourceIds,
} from './bodyResourceAvailability.ts'
import type { Character, Outpost, ResourceProductionRoute } from './models.ts'
import type { ReferenceData, ResourceId } from './referenceData.ts'

export const X_TECH_RESOURCE_ID: ResourceId = 'x-tech'

const explicitPresenceCapabilities = new Map<ResourceId, keyof Character['capabilities']>([
  [X_TECH_RESOURCE_ID, 'xTechExtraction'],
])

export function usesExplicitPresence(resourceId: ResourceId): boolean {
  return explicitPresenceCapabilities.has(resourceId)
}

export function hasExplicitResourcePresence(outpost: Outpost, resourceId: ResourceId): boolean {
  return usesExplicitPresence(resourceId) && (outpost.explicitResourcePresence ?? []).includes(resourceId)
}

export function isResourcePresentAtOutpost(
  resourceId: ResourceId,
  outpost: Outpost,
  referenceData: ReferenceData,
): boolean {
  if (usesExplicitPresence(resourceId)) return hasExplicitResourcePresence(outpost, resourceId)
  const resource = referenceData.resources.find((candidate) => candidate.id === resourceId)
  if (resource?.category === 'inorganic') return outpost.localResources.includes(resourceId)
  if (resource?.category !== 'organic') return false
  return getAvailableOrganicProductionRoutes(referenceData, outpost.bodyId, outpost.selectedBiomeIds)
    .some((route) => route.resourceId === resourceId)
}

export function canAddExplicitResourcePresence(character: Character, resourceId: ResourceId): boolean {
  const capability = explicitPresenceCapabilities.get(resourceId)
  return capability !== undefined && character.capabilities[capability]
}

export function canActivateProductionRoute(
  character: Character,
  outpost: Outpost,
  route: ResourceProductionRoute,
  referenceData: ReferenceData,
): boolean {
  if (usesExplicitPresence(route.resourceId)) {
    return route.type === 'inorganic' &&
      canAddExplicitResourcePresence(character, route.resourceId) &&
      hasExplicitResourcePresence(outpost, route.resourceId)
  }
  if (route.type === 'inorganic') return outpost.localResources.includes(route.resourceId)
  return isResourcePresentAtOutpost(route.resourceId, outpost, referenceData)
}

export function getInorganicMatrixResourceIds(
  outpost: Outpost,
  referenceData: ReferenceData,
): ResourceId[] {
  const ordinary = getOutpostAvailableInorganicResourceIds(
    referenceData, outpost.bodyId, outpost.selectedBiomeIds,
  ).filter((id) => !usesExplicitPresence(id))
  const explicit = (outpost.explicitResourcePresence ?? []).filter((id) =>
    usesExplicitPresence(id) && referenceData.resources.some((resource) => resource.id === id))
  const recovery = outpost.activeProduction.filter((route) => route.type === 'inorganic')
    .map((route) => route.resourceId)
  return [...new Set([...ordinary, ...explicit, ...recovery])]
}
