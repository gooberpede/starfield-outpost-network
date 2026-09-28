/**
 * Purpose: Derive biome-aware inorganic presence and planetary organic farming eligibility.
 * Architecture: Reference facts are interpreted here without editing persisted selections.
 * Change this file when: biome, atmosphere, or organic-source availability rules change.
 */
import type { ResourceProductionRoute } from './models'
import { getProductionRouteKey } from './productionRoutes.ts'
import type {
  BodyBiomeId,
  BiomeId,
  PlanetaryBodyId,
  ReferenceData,
  ResourceId,
  ResourceReference,
} from './referenceData'

export interface BiomeButtonGroup {
  key: string
  biomeId: BiomeId
  baseLabel: string
  label: string
  bodyBiomeIds: BodyBiomeId[]
  biomeIndex: number
  ordinal: number | null
}

function getBodyBiomes(referenceData: ReferenceData, bodyId: PlanetaryBodyId | null) {
  return referenceData.bodyBiomes
    .filter((entry) => entry.bodyId === bodyId)
    .sort((left, right) => left.biomeIndex - right.biomeIndex)
}

/** Empty selection means every valid biome; non-empty scope ignores foreign/unknown IDs. */
export function getEffectiveBodyBiomeIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
  selectedBiomeIds: BodyBiomeId[],
): BodyBiomeId[] {
  const bodyBiomeIds = getBodyBiomes(referenceData, bodyId).map((entry) => entry.id)
  if (selectedBiomeIds.length === 0) return bodyBiomeIds
  const validIds = new Set(bodyBiomeIds)
  return [...new Set(selectedBiomeIds.filter((id) => validIds.has(id)))]
}

/** Body presence includes wild organics; it does not assert production or supply. */
export function getBodyPresentResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(
    referenceData.bodyResources.find((entry) => entry.bodyId === bodyId)?.resourceIds ?? [],
  )]
}

/** Atmosphere is body-wide and remains available for every biome subset. */
export function getBodyAtmosphericResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(referenceData.inorganicOccurrences
    .filter((entry) => entry.bodyId === bodyId && entry.location.type === 'atmosphere')
    .map((entry) => entry.resourceId))]
}

/** Compatibility helper for every biome occurrence on a body. */
export function getBodyBiomeResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(referenceData.inorganicOccurrences
    .filter((entry) => entry.bodyId === bodyId && entry.location.type === 'biome')
    .map((entry) => entry.resourceId))]
}

export function getOutpostAvailableInorganicResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
  selectedBiomeIds: BodyBiomeId[],
): ResourceId[] {
  const effectiveIds = new Set(getEffectiveBodyBiomeIds(referenceData, bodyId, selectedBiomeIds))
  const result = new Set(getBodyAtmosphericResourceIds(referenceData, bodyId))
  for (const occurrence of referenceData.inorganicOccurrences) {
    if (occurrence.bodyId === bodyId && occurrence.location.type === 'biome' &&
      effectiveIds.has(occurrence.location.bodyBiomeId)) {
      result.add(occurrence.resourceId)
    }
  }
  return [...result]
}

/** Exact domesticable producer routes are body-level; natural biome occurrence is independent. */
export function getPlanetaryOrganicFarmingRoutes(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceProductionRoute[] {
  const routes = new Map<string, ResourceProductionRoute>()
  for (const entry of referenceData.planetSpecies) {
    if (entry.bodyId !== bodyId || !entry.domesticable || !entry.resourceId) continue
    const route: ResourceProductionRoute = {
      type: 'organic', resourceId: entry.resourceId, speciesId: entry.speciesId,
    }
    routes.set(getProductionRouteKey(route), route)
  }
  return [...routes.values()]
}

/** Validates the exact persisted producer rather than a resource-level substitute. */
export function isOrganicFarmingRouteEligibleOnBody(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
  route: ResourceProductionRoute,
): boolean {
  if (route.type !== 'organic') return false
  return referenceData.planetSpecies.some((entry) =>
    entry.bodyId === bodyId &&
    entry.speciesId === route.speciesId &&
    entry.resourceId === route.resourceId &&
    entry.domesticable)
}

export function isProductionRouteAvailable(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
  selectedBiomeIds: BodyBiomeId[],
  route: ResourceProductionRoute,
): boolean {
  if (route.type === 'inorganic') {
    return getOutpostAvailableInorganicResourceIds(referenceData, bodyId, selectedBiomeIds)
      .includes(route.resourceId)
  }
  if (route.type === 'organic-unspecified') return false
  return isOrganicFarmingRouteEligibleOnBody(referenceData, bodyId, route)
}

/** Domesticability is a species fact, never inferred from farming inputs. */
export function getBodyDomesticableOrganicResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(getPlanetaryOrganicFarmingRoutes(referenceData, bodyId)
    .map((route) => route.resourceId))]
}

/** Compatibility resource-grain view used by callers that do not need source identity. */
export function getBodyProductionResources(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceReference[] {
  return getOutpostProductionResources(referenceData, bodyId, [])
}

export function getOutpostProductionResources(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
  selectedBiomeIds: BodyBiomeId[],
): ResourceReference[] {
  const ids = new Set([
    ...getOutpostAvailableInorganicResourceIds(referenceData, bodyId, selectedBiomeIds),
    ...getPlanetaryOrganicFarmingRoutes(referenceData, bodyId)
      .map((route) => route.resourceId),
  ])
  return referenceData.resources.filter((resource) => ids.has(resource.id))
}

function getBiomeSignature(referenceData: ReferenceData, bodyBiomeId: BodyBiomeId): string {
  return [...new Set(referenceData.inorganicOccurrences
    .filter((entry) => entry.location.type === 'biome' && entry.location.bodyBiomeId === bodyBiomeId)
    .map((entry) => entry.resourceId))].sort().join('|')
}

/** Groups occurrences of one stable biome and numbers unequal signatures in source order. */
export function getBiomeButtonGroups(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): BiomeButtonGroup[] {
  const entries = getBodyBiomes(referenceData, bodyId).map((bodyBiome) => ({
    bodyBiome,
    name: referenceData.biomes.find((biome) => biome.id === bodyBiome.biomeId)?.name ?? bodyBiome.biomeId,
    signature: getBiomeSignature(referenceData, bodyBiome.id),
  }))
  const byBiomeId = new Map<BiomeId, typeof entries>()
  for (const entry of entries) {
    byBiomeId.set(
      entry.bodyBiome.biomeId,
      [...(byBiomeId.get(entry.bodyBiome.biomeId) ?? []), entry],
    )
  }
  const groups: BiomeButtonGroup[] = []
  for (const [biomeId, sameBiome] of byBiomeId) {
    const name = sameBiome[0].name
    const bySignature = new Map<string, typeof entries>()
    for (const entry of sameBiome) {
      bySignature.set(entry.signature, [...(bySignature.get(entry.signature) ?? []), entry])
    }
    const signatureGroups = [...bySignature.values()]
      .sort((left, right) => left[0].bodyBiome.biomeIndex - right[0].bodyBiome.biomeIndex)
    signatureGroups.forEach((members, index) => {
      const ids = members.map((member) => member.bodyBiome.id)
      groups.push({
        key: ids.join('|'),
        biomeId,
        baseLabel: name,
        label: signatureGroups.length > 1 ? `${name} ${index + 1}` : name,
        bodyBiomeIds: ids,
        biomeIndex: Math.min(...members.map((member) => member.bodyBiome.biomeIndex)),
        ordinal: signatureGroups.length > 1 ? index + 1 : null,
      })
    })
  }
  return groups.sort((left, right) => left.biomeIndex - right.biomeIndex)
}
