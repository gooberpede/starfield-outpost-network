import {
  getBiomeButtonGroups,
  isProductionRouteAvailable,
} from '../domain/bodyResourceAvailability.ts'
import type { ResourceProductionRoute } from '../domain/models.ts'
import type {
  ReferenceData,
  ResourceId,
} from '../domain/referenceData.ts'
import type {
  SolarEfficiency,
  WindEfficiency,
} from '../domain/powerEfficiency.ts'
import { translate } from '../localization/catalog.ts'
import type { SupportedLocale } from '../localization/types.ts'

const qualitativePowerLabels = {
  'very-poor': 'Very Poor',
  poor: 'Poor',
  normal: 'Normal',
  good: 'Good',
  none: 'None',
  unknown: 'Unknown',
} as const

export function getPowerEfficiencyTooltip(
  source: 'Solar' | 'Wind',
  efficiency: SolarEfficiency | WindEfficiency,
  baseOutput: number | null,
): string {
  const qualitative = qualitativePowerLabels[efficiency]
  if (efficiency === 'unknown' || baseOutput === null) return `${source}: ${qualitative}`

  const multiplier = baseOutput / 6
  const percentage = Math.round((multiplier - 1) * 100)
  const modifier = percentage === 0
    ? 'no modifier'
    : `${percentage > 0 ? '+' : '−'}${Math.abs(percentage)}%`
  return `${source}: ${qualitative} · ${multiplier.toFixed(2)}× output (${modifier})`
}

export function getInorganicPresentTooltip(
  resourceName: string,
  recordedPresent: boolean,
  potentiallyPresent: boolean,
  locale: SupportedLocale = 'en-US',
): string {
  if (recordedPresent) {
    return translate(locale, 'help.inorganicPresentRecorded', { resource: resourceName })
  }
  if (potentiallyPresent) {
    return translate(locale, 'help.inorganicPresentPossible', { resource: resourceName })
  }
  return resourceName
}

function getSupportingSelectedBiomeNames(
  referenceData: ReferenceData,
  bodyId: string | null,
  selectedBiomeIds: string[],
  route: ResourceProductionRoute,
): string[] {
  if (selectedBiomeIds.length === 0) return []
  const selectedIds = new Set(selectedBiomeIds)
  return getBiomeButtonGroups(referenceData, bodyId)
    .filter((group) => group.bodyBiomeIds.some((id) => selectedIds.has(id)))
    .filter((group) => isProductionRouteAvailable(
      referenceData,
      bodyId,
      group.bodyBiomeIds,
      route,
    ))
    .map((group) => group.label)
}

export function getOrganicPresentTooltip(
  resourceName: string,
  route: ResourceProductionRoute,
  isPresent: boolean,
  referenceData: ReferenceData,
  bodyId: string | null,
  selectedBiomeIds: string[],
): string {
  if (route.type !== 'organic') return resourceName

  const planetSpecies = referenceData.planetSpecies.find((entry) =>
    entry.bodyId === bodyId &&
    entry.speciesId === route.speciesId &&
    entry.resourceId === route.resourceId &&
    entry.domesticable)
  if (!planetSpecies) return resourceName

  if (!isPresent) {
    if (selectedBiomeIds.length === 0) {
      return `${resourceName} is not available from this domesticable species on this planet.`
    }
    return `${resourceName} is not available from this domesticable species in the selected ${selectedBiomeIds.length === 1 ? 'biome' : 'biomes'}.`
  }

  if (selectedBiomeIds.length === 0) {
    return `${resourceName} is available from a domesticable species on this planet.`
  }

  const biomeNames = getSupportingSelectedBiomeNames(
    referenceData,
    bodyId,
    selectedBiomeIds,
    route,
  )
  if (biomeNames.length === 1) {
    return `${resourceName} is available from a domesticable species in ${biomeNames[0]}.`
  }
  return `${resourceName} is available from a domesticable species in the selected ${selectedBiomeIds.length === 1 ? 'biome' : 'biomes'}.`
}

export function getDomesticableSourceNames(
  referenceData: ReferenceData,
  bodyId: string | null,
  selectedBiomeIds: string[],
  resourceId: ResourceId,
): string[] {
  const speciesById = new Map(referenceData.species.map((entry) => [entry.id, entry.name]))
  const names = referenceData.planetSpecies
    .filter((entry) =>
      entry.bodyId === bodyId &&
      entry.domesticable &&
      entry.resourceId === resourceId)
    .filter((entry) => isProductionRouteAvailable(
      referenceData,
      bodyId,
      selectedBiomeIds,
      { type: 'organic', resourceId, speciesId: entry.speciesId },
    ))
    .map((entry) => speciesById.get(entry.speciesId))
    .filter((name): name is string => Boolean(name))

  return [...new Set(names)].sort((left, right) => left.localeCompare(right))
}
