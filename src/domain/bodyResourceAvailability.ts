/**
 * Purpose: Distinguish natural presence, occurrence paths, and production eligibility.
 * Architecture: Derives eligibility from reference facts without editing saves.
 * Change this file when: local production eligibility becomes biome-aware.
 */
import type { PlanetaryBodyId, ReferenceData, ResourceId, ResourceReference } from './referenceData'

/** Body presence includes wild organics; it does not assert production or supply. */
export function getBodyPresentResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(
    referenceData.bodyResources.find((entry) => entry.bodyId === bodyId)?.resourceIds ?? [],
  )]
}

/** Atmosphere is body-wide and must remain independent of future biome filtering. */
export function getBodyAtmosphericResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(referenceData.inorganicOccurrences
    .filter((entry) => entry.bodyId === bodyId && entry.location.type === 'atmosphere')
    .map((entry) => entry.resourceId))]
}

/** Collects inorganic biome occurrences without creating a second resource identity. */
export function getBodyBiomeResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  return [...new Set(referenceData.inorganicOccurrences
    .filter((entry) => entry.bodyId === bodyId && entry.location.type === 'biome')
    .map((entry) => entry.resourceId))]
}

/** Domesticability is a species fact, never inferred from farming inputs. */
export function getBodyDomesticableOrganicResourceIds(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceId[] {
  const domesticable = new Set(referenceData.planetSpecies
    .filter((entry) => entry.bodyId === bodyId && entry.domesticable === true)
    .map((entry) => entry.resourceId))
  return referenceData.resources
    .filter((resource) => resource.category === 'organic' && domesticable.has(resource.id))
    .map((resource) => resource.id)
}

/** Eligibility only: active production remains the user's persisted selection. */
export function getBodyProductionResources(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceReference[] {
  const present = new Set(getBodyPresentResourceIds(referenceData, bodyId))
  const farmable = new Set(getBodyDomesticableOrganicResourceIds(referenceData, bodyId))
  return referenceData.resources.filter((resource) =>
    (resource.category === 'inorganic' && present.has(resource.id)) || farmable.has(resource.id),
  )
}
