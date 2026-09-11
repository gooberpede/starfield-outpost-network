/**
 * types.ts
 *
 * Purpose:
 *   Defines the shared types used by all network validation rules.
 *
 * Architecture:
 *   Validation rules are independent domain-level checks. Each rule has
 *   stable metadata and returns zero or more structured ValidationIssue
 *   objects.
 *
 *   Rule configuration is deliberately kept outside individual validators.
 *   A future settings layer can therefore enable or disable rules, groups,
 *   or severity levels without changing the validator implementations.
 *
 * Change this file when:
 *   - validation categories or severity levels change;
 *   - validation rules need additional shared metadata;
 *   - validation issues need additional structured location information.
 */

import type {
  CargoItem,
  Character,
  OutpostNetwork,
} from '../models'

import type {
  ReferenceData,
  SpeciesId,
  BodyBiomeId,
  ProductId,
} from '../referenceData'
import type { MessageKey, MessageParameters } from '../../localization/types.ts'

/**
 * Groups validators by the kind of problem they detect.
 *
 * These categories are domain metadata, not merely UI labels. They can later
 * support group filtering and operations such as enabling or disabling all
 * supply validators.
 */
export type ValidationCategory =
  | 'supply'
  | 'structural'
  | 'operational'

/**
 * Describes how seriously a validation issue should be presented by default.
 */
export type ValidationSeverity =
  | 'info'
  | 'warning'
  | 'error'

/**
 * One concrete problem found by a validation rule.
 *
 * Stable IDs locate the affected part of the network without embedding
 * presentation names into domain data.
 *
 * cargoItem is optional because many future validators will concern network
 * structure, limits, or outposts rather than a particular material.
 */
export interface ValidationIssue {
  ruleId: string
  category: ValidationCategory
  severity: ValidationSeverity
  /** Domain rules emit semantic facts; presentation owns final wording. */
  messageKey: Extract<MessageKey, `validation.${string}`>
  parameters?: MessageParameters
  
  cargoLinkId?: string
  outpostId?: string
  cargoPadId?: string
  cargoItem?: CargoItem
  cargoItems?: CargoItem[]
  productId?: ProductId
  speciesId?: SpeciesId
  bodyBiomeId?: BodyBiomeId
  skillId?: keyof Character['skills']
}

/**
 * Defines one independent validation rule.
 *
 * Metadata describes the rule itself. validate() examines a network and
 * returns one ValidationIssue for each concrete problem it finds.
 *
 * Whether this rule is currently enabled is intentionally not stored here.
 */
export interface ValidationRule {
  id: string
  name: string
  description: string
  category: ValidationCategory
  defaultSeverity: ValidationSeverity

  validate: (
    network: OutpostNetwork,
    referenceData?: ReferenceData,
  ) => ValidationIssue[]
}
