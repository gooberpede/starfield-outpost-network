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

import type {
  ValidationRule,
} from './types'

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
]