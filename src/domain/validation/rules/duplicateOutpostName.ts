/**
 * duplicateOutpostName.ts
 *
 * Purpose:
 *   Detects outposts that share the same recorded name.
 *
 * Architecture:
 *   Outpost names are user-facing labels rather than identity keys. Duplicate
 *   names therefore do not make the persisted network structurally invalid.
 *
 *   They can, however, make navigation, validation messages, history labels,
 *   and cargo-link descriptions ambiguous, so this rule reports an advisory
 *   warning.
 *
 *   One issue is emitted per duplicated name rather than per affected outpost.
 *   The collision is a property of the group, and grouping avoids repeating
 *   the same warning several times in the validation summary.
 *
 *   Name comparison is currently exact and case-sensitive. Any future
 *   normalization policy should be introduced deliberately rather than being
 *   hidden inside this validator.
 *
 * Change this file when:
 *   - outpost-name uniqueness policy changes;
 *   - name normalization rules are introduced;
 *   - duplicate-name diagnostics need richer context.
 */

import type {
  ValidationIssue,
  ValidationRule,
} from '../types'

const RULE_ID =
  'duplicate-outpost-name'

/**
 * Reports one warning for each exact outpost name used more than once.
 */
function validateDuplicateOutpostNames(
  network: Parameters<ValidationRule['validate']>[0],
): ValidationIssue[] {
  const nameCounts =
    new Map<string, number>()

  for (const outpost of network.outposts) {
    nameCounts.set(
      outpost.name,
      (nameCounts.get(outpost.name) ?? 0) + 1,
    )
  }

  const issues: ValidationIssue[] = []

  for (const [name, count] of nameCounts) {
    if (count <= 1) {
      continue
    }

    issues.push({
      ruleId: RULE_ID,
      category: 'operational',
      severity: 'warning',
      messageKey: 'validation.duplicateOutpostName',
      parameters: { count, name },
    })
  }

  return issues
}

export const duplicateOutpostNameRule:
  ValidationRule = {
    id: RULE_ID,
    name: 'Duplicate outpost name',
    description:
      'Warns once for each exact outpost name shared by two or more outposts.',
    category: 'operational',
    defaultSeverity: 'warning',
    validate: validateDuplicateOutpostNames,
  }
