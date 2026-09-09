/**
 * Resolves validation issue metadata into compact diagnostic presentation.
 * Stable IDs remain the source of identity; missing references fall back to
 * raw IDs so malformed imported data still produces useful diagnostics.
 */
import {
  getBiomeButtonGroups,
  isProductionRouteAvailable,
} from '../domain/bodyResourceAvailability.ts'
import type {
  CargoItem,
  Outpost,
  ResourceProductionRoute,
} from '../domain/models.ts'
import type { ReferenceData } from '../domain/referenceData.ts'
import type { ValidationIssue } from '../domain/validation/types.ts'
import { getDomesticableSourceNames } from './statusTooltips.ts'
import { translate } from '../localization/catalog.ts'
import { getReferenceDisplayName } from '../localization/referenceNames.ts'
import type { SupportedLocale } from '../localization/types.ts'
import { formatList as formatLocalizedList } from '../localization/formatters.ts'

export interface ValidationIssuePresentation {
  context: string | null
  message: string
  remediation: string | null
}

function getLocalizedCargoItemName(
  item: CargoItem,
  referenceData: ReferenceData | null,
  locale: SupportedLocale,
): string {
  const reference = item.type === 'resource'
    ? referenceData?.resources.find(({ id }) => id === item.id)
    : referenceData?.products.find(({ id }) => id === item.id)
  return getReferenceDisplayName(item.type, item.id, reference?.name, locale)
}

function formatList(values: string[]): string {
  if (values.length < 2) return values[0] ?? ''
  if (values.length === 2) return values.join(' and ')
  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
}

function getActiveProductionRemediation(
  issue: ValidationIssue,
  outpost: Outpost | undefined,
  referenceData: ReferenceData | null,
): string | null {
  if (
    issue.ruleId !== 'active-production-valid-for-body' ||
    issue.cargoItem?.type !== 'resource' ||
    !outpost ||
    !referenceData
  ) {
    return null
  }

  const resource = referenceData.resources.find(
    (entry) => entry.id === issue.cargoItem?.id,
  )
  if (!resource) return null

  let route: ResourceProductionRoute
  if (issue.speciesId) {
    if (resource.category !== 'organic') return null
    if (!referenceData.species.some((entry) => entry.id === issue.speciesId)) {
      return null
    }
    route = {
      type: 'organic',
      resourceId: issue.cargoItem.id,
      speciesId: issue.speciesId,
    }
  } else {
    if (resource.category !== 'inorganic') return null
    route = {
      type: 'inorganic',
      resourceId: issue.cargoItem.id,
    }
  }

  const availableBiomeNames = getBiomeButtonGroups(referenceData, outpost.bodyId)
    .filter((group) => isProductionRouteAvailable(
      referenceData,
      outpost.bodyId,
      group.bodyBiomeIds,
      route,
    ))
    .map((group) => group.label)

  if (availableBiomeNames.length === 0) return null

  return `Available for ${issue.speciesId ? 'harvesting' : 'extraction'} in: ${
    formatList(availableBiomeNames)
  }`
}

function getUnspecifiedOrganicSourceRemediation(
  issue: ValidationIssue,
  outpost: Outpost | undefined,
  referenceData: ReferenceData | null,
): string | null {
  if (
    issue.ruleId !== 'unspecified-organic-production-source' ||
    issue.cargoItem?.type !== 'resource' ||
    !outpost ||
    !referenceData
  ) {
    return null
  }

  const names = getDomesticableSourceNames(
    referenceData,
    outpost.bodyId,
    outpost.selectedBiomeIds,
    issue.cargoItem.id,
  )
  return names.length > 0 ? `Available from: ${names.join(', ')}` : null
}

export function getValidationIssuePresentation(
  issue: ValidationIssue,
  outposts: Outpost[],
  referenceData: ReferenceData | null,
  locale: SupportedLocale = 'en-US',
): ValidationIssuePresentation {
  const outpost = issue.outpostId
    ? outposts.find((candidate) => candidate.id === issue.outpostId)
    : undefined

  const contextParts: string[] = []
  if (issue.outpostId) contextParts.push(outpost?.name ?? issue.outpostId)

  if (issue.cargoPadId) {
    const padIndex = outpost?.cargoPads.findIndex(
      (candidate) => candidate.id === issue.cargoPadId,
    ) ?? -1
    contextParts.push(padIndex >= 0 ? `Pad ${padIndex + 1}` : issue.cargoPadId)
  }

  let message = issue.message
  if (
    issue.messageKey === 'validation.manufacturingInputUnavailable' &&
    issue.productId &&
    issue.cargoItem &&
    referenceData
  ) {
    const product = referenceData.products.find(({ id }) => id === issue.productId)
    const inputReference = issue.cargoItem.type === 'resource'
      ? referenceData.resources.find(({ id }) => id === issue.cargoItem?.id)
      : referenceData.products.find(({ id }) => id === issue.cargoItem?.id)
    message = translate(locale, issue.messageKey, {
      product: getReferenceDisplayName('product', issue.productId, product?.name, locale),
      input: getReferenceDisplayName(
        issue.cargoItem.type,
        issue.cargoItem.id,
        inputReference?.name,
        locale,
      ),
    })
  } else if (
    issue.messageKey === 'validation.plannedSupplyUnresolved' &&
    issue.cargoItems &&
    issue.cargoItems.length > 0
  ) {
    const itemNames = issue.cargoItems
      .map((item) => getLocalizedCargoItemName(item, referenceData, locale))
      .sort((left, right) => left.localeCompare(right, locale))
    message = translate(locale, issue.messageKey, {
      count: itemNames.length,
      itemList: formatLocalizedList(locale, itemNames),
    })
  }

  return {
    context: contextParts.length > 0 ? contextParts.join(' · ') : null,
    message,
    remediation: getActiveProductionRemediation(issue, outpost, referenceData) ??
      getUnspecifiedOrganicSourceRemediation(issue, outpost, referenceData),
  }
}

export function sortValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const severityOrder = { error: 0, warning: 1, info: 2 }
  return issues
    .map((issue, index) => ({ issue, index }))
    .sort((left, right) =>
      severityOrder[left.issue.severity] - severityOrder[right.issue.severity] ||
      left.index - right.index,
    )
    .map(({ issue }) => issue)
}
