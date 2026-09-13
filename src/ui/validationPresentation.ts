/** Resolves structured validation facts into localized diagnostic presentation. */
import { getBiomeButtonGroups, isProductionRouteAvailable } from '../domain/bodyResourceAvailability.ts'
import type { CargoItem, Outpost, ResourceProductionRoute } from '../domain/models.ts'
import type { ReferenceData } from '../domain/referenceData.ts'
import type { ValidationIssue } from '../domain/validation/types.ts'
import { translate } from '../localization/catalog.ts'
import { formatList, getCollator } from '../localization/formatters.ts'
import { getReferenceDisplayName } from '../localization/referenceNames.ts'
import { getSkillDisplayName } from '../localization/officialTerms.ts'
import type { MessageKey, MessageParameters, SupportedLocale } from '../localization/types.ts'
import type { CharacterSkill } from '../localization/officialTerms.ts'
import { getDomesticableSourceNames } from './statusTooltips.ts'
import {
  getBiomeGroupDisplayName,
  getBodyBiomeDisplayName,
  type ReferenceNameResolver,
} from './biomePresentation.ts'

export interface ValidationIssuePresentation {
  context: string | null
  message: string
  remediation: string | null
}

const validationSkillByMessage: Partial<Record<MessageKey, CharacterSkill>> = {
  'validation.cargoPadSkillLimit': 'outpostManagement',
  'validation.outpostSkillLimit': 'planetaryHabitation',
  'validation.planetaryHabitationRequirement': 'planetaryHabitation',
}

function getCargoItemName(
  item: CargoItem,
  data: ReferenceData | null,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver,
) {
  const reference = item.type === 'resource'
    ? data?.resources.find(({ id }) => id === item.id)
    : data?.products.find(({ id }) => id === item.id)
  return resolveName(item.type, item.id, reference?.name, locale)
}

function getBiomeName(
  id: string,
  data: ReferenceData | null,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver,
) {
  return getBodyBiomeDisplayName(id, data, locale, resolveName)
}

function getIssueMessage(
  issue: ValidationIssue,
  outpost: Outpost | undefined,
  data: ReferenceData | null,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver,
): string {
  let key: MessageKey = issue.messageKey
  let parameters: MessageParameters = { ...issue.parameters }
  const skill = key === 'validation.invalidSkillLevel'
    ? issue.skillId
    : validationSkillByMessage[key]
  if (skill) {
    parameters = {
      ...parameters,
      skill: getSkillDisplayName(skill, locale),
    }
  } else if (key === 'validation.manufacturingInputUnavailable' && issue.productId && issue.cargoItem) {
    const product = data?.products.find(({ id }) => id === issue.productId)
    parameters = {
      product: resolveName('product', issue.productId, product?.name, locale),
      input: getCargoItemName(issue.cargoItem, data, locale, resolveName),
    }
  } else if (key === 'validation.organicInputUnavailable' && issue.speciesId && issue.cargoItem) {
    const species = data?.species.find(({ id }) => id === issue.speciesId)
    parameters = {
      species: resolveName('species', issue.speciesId, species?.name, locale),
      input: getCargoItemName(issue.cargoItem, data, locale, resolveName),
    }
  } else if (key === 'validation.plannedSupplyUnresolved' && issue.cargoItems) {
    const names = issue.cargoItems.map((item) => getCargoItemName(item, data, locale, resolveName))
      .sort(getCollator(locale).compare)
    parameters = { count: names.length, itemList: formatList(locale, names) }
  } else if (key.startsWith('validation.duplicate') && issue.cargoItem) {
    parameters = { item: getCargoItemName(issue.cargoItem, data, locale, resolveName) }
  } else if (key === 'validation.duplicateBiome' && issue.bodyBiomeId) {
    parameters = { item: getBiomeName(issue.bodyBiomeId, data, locale, resolveName) }
  } else if (key === 'validation.unspecifiedOrganicSource' && issue.cargoItem) {
    parameters = { resource: getCargoItemName(issue.cargoItem, data, locale, resolveName) }
  } else if ((key === 'validation.xTechCapabilityProduced' ||
    key === 'validation.xTechCapabilityPresent' ||
    key === 'validation.xTechRequiresPresence') && issue.cargoItem) {
    parameters = { resource: getCargoItemName(issue.cargoItem, data, locale, resolveName) }
  } else if ((key === 'validation.activeProductionOrganicInvalid' ||
    key === 'validation.activeProductionInorganicInvalid') && issue.cargoItem && outpost && data) {
    const groups = getBiomeButtonGroups(data, outpost.bodyId)
    const names = [...new Set(outpost.selectedBiomeIds.length > 0
      ? outpost.selectedBiomeIds.map((id) => {
          const group = groups.find((candidate) => candidate.bodyBiomeIds.includes(id))
          return group
            ? getBiomeGroupDisplayName(group, locale, resolveName)
            : getBodyBiomeDisplayName(id, data, locale, resolveName)
        })
      : groups.map((group) => getBiomeGroupDisplayName(group, locale, resolveName)))]
      .sort(getCollator(locale).compare)
    key = key === 'validation.activeProductionOrganicInvalid'
      ? names.length === 1
        ? 'validation.activeProductionOrganicInvalidOne'
        : 'validation.activeProductionOrganicInvalidMany'
      : names.length === 1
        ? 'validation.activeProductionInorganicInvalidOne'
        : 'validation.activeProductionInorganicInvalidMany'
    parameters = {
      resource: getCargoItemName(issue.cargoItem, data, locale, resolveName),
      biomes: formatList(locale, names),
    }
  }
  return translate(locale, key, parameters)
}

function getRemediation(
  issue: ValidationIssue,
  outpost: Outpost | undefined,
  data: ReferenceData | null,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver,
): string | null {
  if (issue.ruleId === 'active-production-valid-for-body' &&
    issue.cargoItem?.type === 'resource' && outpost && data) {
    const resource = data.resources.find(({ id }) => id === issue.cargoItem?.id)
    if (!resource) return null
    let route: ResourceProductionRoute
    if (issue.speciesId) {
      if (resource.category !== 'organic' || !data.species.some(({ id }) => id === issue.speciesId)) {
        return null
      }
      route = { type: 'organic', resourceId: issue.cargoItem.id, speciesId: issue.speciesId }
    } else {
      if (resource.category !== 'inorganic') return null
      route = { type: 'inorganic', resourceId: issue.cargoItem.id }
    }
    const names = getBiomeButtonGroups(data, outpost.bodyId)
      .filter((group) => isProductionRouteAvailable(data, outpost.bodyId, group.bodyBiomeIds, route))
      .map((group) => getBiomeGroupDisplayName(group, locale, resolveName))
      .sort(getCollator(locale).compare)
    if (names.length === 0) return null
    return translate(locale, issue.speciesId
      ? 'validation.remediation.harvesting'
      : 'validation.remediation.extraction', { biomes: formatList(locale, names) })
  }
  if (issue.ruleId === 'unspecified-organic-production-source' &&
    issue.cargoItem?.type === 'resource' && outpost && data) {
    const names = getDomesticableSourceNames(
      data, outpost.bodyId, outpost.selectedBiomeIds, issue.cargoItem.id, locale,
    )
    return names.length > 0
      ? translate(locale, 'validation.remediation.organicSources', {
          sources: formatList(locale, names),
        })
      : null
  }
  return null
}

export function getValidationIssuePresentation(
  issue: ValidationIssue,
  outposts: Outpost[],
  data: ReferenceData | null,
  locale: SupportedLocale = 'en-US',
  resolveName: ReferenceNameResolver = getReferenceDisplayName,
): ValidationIssuePresentation {
  const outpost = issue.outpostId ? outposts.find(({ id }) => id === issue.outpostId) : undefined
  const outpostContext = issue.outpostId ? outpost?.name ?? issue.outpostId : null
  let padContext: string | null = null
  if (issue.cargoPadId) {
    const index = outpost?.cargoPads.findIndex(({ id }) => id === issue.cargoPadId) ?? -1
    padContext = index >= 0
      ? translate(locale, 'validation.context.pad', { ordinal: index + 1 })
      : issue.cargoPadId
  }
  const context = outpostContext && padContext
    ? translate(locale, 'validation.context.separator', { outpost: outpostContext, pad: padContext })
    : outpostContext ?? padContext
  return {
    context,
    message: getIssueMessage(issue, outpost, data, locale, resolveName),
    remediation: getRemediation(issue, outpost, data, locale, resolveName),
  }
}

export function sortValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const severityOrder = { error: 0, warning: 1, info: 2 }
  return issues.map((issue, index) => ({ issue, index }))
    .sort((left, right) =>
      severityOrder[left.issue.severity] - severityOrder[right.issue.severity] || left.index - right.index)
    .map(({ issue }) => issue)
}
