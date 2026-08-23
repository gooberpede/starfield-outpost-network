/**
 * validateNetwork.ts
 *
 * Purpose:
 *   Runs the registered validation rules against one outpost network and
 *   combines their results into a single issue list.
 *
 * Architecture:
 *   Individual validation rules contain the actual validation logic.
 *   This file only orchestrates rule execution.
 *
 *   Validator configuration is supplied externally. The runner does not
 *   persist settings and individual validators do not know whether they are
 *   enabled or disabled.
 *
 * Change this file when:
 *   - validator execution rules change;
 *   - validator settings gain additional behaviour;
 *   - validation results need orchestration-level processing.
 */

import type {
  OutpostNetwork,
} from '../models'

import {
  validationRules,
} from './registry'

import type {
  ValidationIssue,
} from './types'

/**
 * Runs all registered validators, or only the supplied enabled rule IDs.
 *
 * Omitting enabledRuleIds means every registered rule is enabled.
 */
export function validateNetwork(
  network: OutpostNetwork,
  enabledRuleIds?: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const rule of validationRules) {
    if (
      enabledRuleIds &&
      !enabledRuleIds.has(rule.id)
    ) {
      continue
    }

    issues.push(
      ...rule.validate(network),
    )
  }

  return issues
}