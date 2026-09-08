/**
 * registry.ts
 *
 * Purpose:
 *   Provides the authoritative list of validation rules supported by the
 *   application.
 *
 * Architecture:
 *   Individual validators remain independent. This registry only collects
 *   them so higher-level code can enumerate and execute the available rules.
 *
 *   Future validator settings can use rule IDs and categories from this
 *   registry to enable or disable individual rules or groups of rules.
 *
 * Change this file when:
 *   - a new validator is added;
 *   - an existing validator is removed;
 *   - validator registration order needs to change.
 */

import {
  unresolvedCargoExportRule,
} from './rules/unresolvedCargoExport'

import {
  missingCargoLinkEndpointRule,
} from './rules/missingCargoLinkEndpoint'

import {
  cargoPadLinkedMultipleTimesRule,
} from './rules/cargoPadLinkedMultipleTimes'

import {
  cargoPadSkillLimitRule,
} from './rules/cargoPadSkillLimit'

import {
  outpostSkillLimitRule,
} from './rules/outpostSkillLimit'

import {
  invalidSkillLevelRule,
} from './rules/invalidSkillLevel'

import {
  invalidCharacterLevelRule,
} from './rules/invalidCharacterLevel'

import {
  selfLinkedCargoPadRule,
} from './rules/selfLinkedCargoPad'

import {
  regularCargoPadCrossSystemRule,
} from './rules/regularCargoPadCrossSystem'

import {
  interstellarCargoHelium3Rule,
} from './rules/interstellarCargoHelium3'

import {
  bodySystemMismatchRule,
} from './rules/bodySystemMismatch'

import {
  duplicateCollectionEntriesRule,
} from './rules/duplicateCollectionEntries'

import {
  duplicateOutpostNameRule,
} from './rules/duplicateOutpostName'

import {
  activeProductionValidForBodyRule,
} from './rules/activeProductionValidForBody'

import {
  unknownReferenceDataIdRule,
} from './rules/unknownReferenceDataId'

import {
  manufacturingInputsUnavailableRule,
} from './rules/manufacturingInputsUnavailable'

import {
  outpostBodyNotEligibleRule,
} from './rules/outpostBodyNotEligible'

import {
  outpostNameLengthRule,
} from './rules/outpostNameLength'

import {
  plannedSupplyUnresolvedRule,
} from './rules/plannedSupplyUnresolved'

import type {
  ValidationRule,
} from './types'

import { planetaryHabitationRequirementRule } from './rules/planetaryHabitationRequirement'
import { selectedBiomeValidForBodyRule } from './rules/selectedBiomeValidForBody.ts'
import { unspecifiedOrganicProductionSourceRule } from './rules/unspecifiedOrganicProductionSource.ts'
import { organicFarmingInputsUnavailableRule } from './rules/organicFarmingInputsUnavailable.ts'

/**
 * Complete set of validators currently known to the application.
 */
export const validationRules: ValidationRule[] = [
  unresolvedCargoExportRule,
  missingCargoLinkEndpointRule,
  cargoPadLinkedMultipleTimesRule,
  cargoPadSkillLimitRule,
  outpostSkillLimitRule,
  invalidSkillLevelRule,
  invalidCharacterLevelRule,
  selfLinkedCargoPadRule,
  regularCargoPadCrossSystemRule,
  interstellarCargoHelium3Rule,
  bodySystemMismatchRule,
  duplicateCollectionEntriesRule,
  duplicateOutpostNameRule,
  activeProductionValidForBodyRule,
  unknownReferenceDataIdRule,
  manufacturingInputsUnavailableRule,
  outpostBodyNotEligibleRule,
  outpostNameLengthRule,
  planetaryHabitationRequirementRule,
  selectedBiomeValidForBodyRule,
  unspecifiedOrganicProductionSourceRule,
  organicFarmingInputsUnavailableRule,
  plannedSupplyUnresolvedRule,
]
