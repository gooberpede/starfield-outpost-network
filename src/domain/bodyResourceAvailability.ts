/**
 * Purpose: Share extractable/farmable resource eligibility between matrix and validation.
 * Architecture: Derives eligibility from reference facts without editing saves.
 * Change this file when: local production eligibility becomes biome-aware.
 */
import type { PlanetaryBodyId, ReferenceData, ResourceReference } from './referenceData'

export function getBodyProductionResources(
  referenceData: ReferenceData,
  bodyId: PlanetaryBodyId | null,
): ResourceReference[] {
  const present = new Set(
    referenceData.bodyResources.find((entry) => entry.bodyId === bodyId)?.resourceIds ?? [],
  )
  const farmable = new Set(
    referenceData.planetSpecies
      .filter((entry) => entry.bodyId === bodyId && entry.domesticable && entry.resourceId !== null)
      .map((entry) => entry.resourceId),
  )
  return referenceData.resources.filter((resource) =>
    present.has(resource.id) && (resource.category === 'inorganic' || farmable.has(resource.id)),
  )
}
