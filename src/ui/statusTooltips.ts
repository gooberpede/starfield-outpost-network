/**
 * Purpose:
 *   Build localized status explanations from domain state and reference facts.
 *
 * Architecture:
 *   Owns presentation wording and reference-name resolution, not the underlying
 *   domain state. Callers supply already-derived status except where a tooltip
 *   needs a narrowly defined reference-data fact.
 *
 * Change this file when:
 *   Status explanation content or its reference-data presentation needs change.
 */
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
import { formatDecimal, formatList, formatPercent, getCollator } from '../localization/formatters.ts'
import { getReferenceDisplayName } from '../localization/referenceNames.ts'
import type { SupportedLocale } from '../localization/types.ts'
import type { ManufacturingProducingState } from './statusStates.ts'

const qualitativePowerKeys = {
  'very-poor': 'power.quality.veryPoor',
  poor: 'power.quality.poor',
  normal: 'power.quality.normal',
  good: 'power.quality.good',
  none: 'power.quality.none',
  unknown: 'power.quality.unknown',
} as const

export function getPowerEfficiencyTooltip(
  source: string,
  efficiency: SolarEfficiency | WindEfficiency,
  baseOutput: number | null,
  locale: SupportedLocale = 'en-US',
): string {
  const qualitative = translate(locale, qualitativePowerKeys[efficiency])
  if (efficiency === 'unknown' || baseOutput === null) {
    return translate(locale, 'power.tooltip.unknown', { source, quality: qualitative })
  }

  const multiplier = baseOutput / 6
  const percentage = Math.round((multiplier - 1) * 100)
  const multiplierText = formatDecimal(locale, multiplier)
  if (percentage === 0) {
    return translate(locale, 'power.tooltip.noModifier', {
      source, quality: qualitative, multiplier: multiplierText,
    })
  }
  const modifier = `${percentage > 0 ? '+' : '−'}${formatPercent(locale, Math.abs(percentage) / 100)}`
  return translate(locale, 'power.tooltip.modified', {
    source, quality: qualitative, multiplier: multiplierText, modifier,
  })
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

export function getExplicitResourceAddTooltip(
  resourceName: string,
  locale: SupportedLocale,
): string {
  return translate(locale, 'matrix.tooltip.xTech.add', { resource: resourceName })
}

export function getExplicitResourcePresentTooltip(
  resourceName: string,
  locale: SupportedLocale,
): string {
  return translate(locale, 'matrix.tooltip.xTech.present', { resource: resourceName })
}

export function getOrganicPresentTooltip(
  resourceName: string,
  route: ResourceProductionRoute,
  isPresent: boolean,
  referenceData: ReferenceData,
  bodyId: string | null,
  _selectedBiomeIds: string[],
  locale: SupportedLocale = 'en-US',
): string {
  if (route.type !== 'organic') return resourceName

  // Farming eligibility is planet-level. Natural-biome organic occurrences are
  // evidence of wild presence and must not substitute for planetSpecies here.
  const planetSpecies = referenceData.planetSpecies.find((entry) =>
    entry.bodyId === bodyId &&
    entry.speciesId === route.speciesId &&
    entry.resourceId === route.resourceId &&
    entry.domesticable)
  if (!planetSpecies) return resourceName

  return translate(locale, isPresent
    ? 'help.organic.availablePlanet'
    : 'help.organic.unavailablePlanet', { resource: resourceName })
}
export function getDomesticableSourceNames(
  referenceData: ReferenceData,
  bodyId: string | null,
  resourceId: ResourceId,
  locale: SupportedLocale = 'en-US',
): string[] {
  const speciesById = new Map(referenceData.species.map((entry) => [
    entry.id, getReferenceDisplayName('species', entry.id, entry.name, locale),
  ]))
  // Source choices follow planet-level domesticability, not natural-biome occurrence.
  const names = referenceData.planetSpecies
    .filter((entry) =>
      entry.bodyId === bodyId &&
      entry.domesticable &&
      entry.resourceId === resourceId)
    .map((entry) => speciesById.get(entry.speciesId))
    .filter((name): name is string => Boolean(name))

  return [...new Set(names)].sort(getCollator(locale).compare)
}

export function getProducingTooltip(
  itemName: string,
  producing: boolean,
  locale: SupportedLocale,
): string {
  return translate(locale, producing
    ? 'matrix.tooltip.producing.active'
    : 'matrix.tooltip.producing.inactive', { item: itemName })
}

export function getManufacturingProducingTooltip(
  productName: string,
  state: ManufacturingProducingState,
  locale: SupportedLocale,
): string {
  return translate(locale, state === 'producing'
    ? 'matrix.tooltip.producing.active'
    : 'matrix.tooltip.manufacturing.blocked', { item: productName })
}

export function getInputTooltip(
  itemName: string,
  available: boolean,
  locale: SupportedLocale,
): string {
  return translate(locale, available
    ? 'matrix.tooltip.input.available'
    : 'matrix.tooltip.input.unavailable', { item: itemName })
}

export function getExportTooltip(
  itemName: string,
  destinationNames: readonly string[],
  locale: SupportedLocale,
): string {
  if (destinationNames.length === 0) {
    return translate(locale, 'matrix.tooltip.export.inactive', { item: itemName })
  }
  return translate(locale, 'matrix.tooltip.export.active', {
    item: itemName,
    destinations: formatList(locale, destinationNames),
  })
}

export function getImportTooltip(
  itemName: string,
  locale: SupportedLocale,
): string {
  return translate(locale, 'matrix.tooltip.import.active', { item: itemName })
}
