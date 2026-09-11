/**
 * manufacturingInputsUnavailable.ts
 *
 * Purpose:
 *   Detects manufactured products whose direct recipe inputs are not
 *   available at the manufacturing outpost.
 *
 * Architecture:
 *   Product recipes come from external reference data, while supply
 *   availability is derived from the recorded outpost network.
 *
 *   Availability follows the application's normal selectable-supply
 *   semantics: active local production, local manufacturing, inbound cargo,
 *   and Planned Supply may all satisfy a recipe input.
 *
 *   This rule reports only direct missing inputs for each entry. The shared
 *   availability resolver determines whether locally manufactured
 *   intermediates are feasible, avoiding recursive duplicate warnings.
 *
 *   Recipe quantities and Research Methods adjustments are outside the
 *   scope of this validator because this rule asks only whether an input
 *   source exists, not whether throughput is sufficient.
 *
 * Change this file when:
 *   - manufacturing availability semantics change;
 *   - recipe-reference structure changes;
 *   - recursive recipe feasibility changes;
 *   - quantity/throughput validation is added.
 */

import {
  getAvailableItemsAtOutpost,
} from '../../availability.ts'

import type {
  CargoItem,
} from '../../models.ts'

import type {
  RecipeIngredientItemReference,
} from '../../referenceData.ts'

import type {
  ValidationIssue,
  ValidationRule,
} from '../types.ts'

const RULE_ID =
  'manufacturing-inputs-unavailable'

/**
 * Produces a stable comparison key for resource/product items.
 */
function getItemKey(
  item:
    | CargoItem
    | RecipeIngredientItemReference,
): string {
  return `${item.type}:${item.id}`
}

/**
 * Reports one warning for each direct recipe ingredient that is not
 * available at the outpost manufacturing the product.
 */
function validateManufacturingInputsUnavailable(
  network: Parameters<ValidationRule['validate']>[0],
  referenceData: Parameters<ValidationRule['validate']>[1],
): ValidationIssue[] {
  if (!referenceData) {
    return []
  }

  const issues: ValidationIssue[] = []

  for (const outpost of network.outposts) {
    const availableItemKeys =
      new Set(
        getAvailableItemsAtOutpost(
          outpost.id,
          network,
          referenceData,
        ).map(getItemKey),
      )

    for (const manufacturingEntry of outpost.manufacturing) {
      /*
       * Unknown product IDs belong to the unknown-reference-data validator.
       */
      const product =
        referenceData.products.find(
          (candidate) =>
            candidate.id === manufacturingEntry.productId,
        )

      if (!product) {
        continue
      }

      const recipe =
        referenceData.productRecipes.find(
          (candidate) =>
            candidate.productId ===
            manufacturingEntry.productId,
        )

      /*
       * Missing recipe reference data is not assumed feasible. The separate
       * reference-data integrity validator owns reporting that data problem.
       */
      if (!recipe) {
        continue
      }

      for (const ingredient of recipe.ingredients) {
        if (
          availableItemKeys.has(
            getItemKey(ingredient.item),
          )
        ) {
          continue
        }

        issues.push({
          ruleId: RULE_ID,
          category: 'operational',
          severity: 'warning',
          messageKey: 'validation.manufacturingInputUnavailable',
          outpostId: outpost.id,
          productId: manufacturingEntry.productId,
          cargoItem: {
            type: ingredient.item.type,
            id: ingredient.item.id,
          },
        })
      }
    }
  }

  return issues
}

export const manufacturingInputsUnavailableRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Manufacturing inputs unavailable',
    description:
      'Flags direct recipe inputs that are not available at the outpost manufacturing the product.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateManufacturingInputsUnavailable,
  }
