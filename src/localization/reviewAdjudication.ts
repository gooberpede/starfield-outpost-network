import type { ReviewRow } from './reviewPackage.ts'

/**
 * Resolves already-recorded editorial decisions without preferring either candidate source.
 * The review CSV is the durable source of truth; missing or contradictory decisions are
 * rejected by review-package validation before this function is called.
 */
export function adjudicateReviewRows(rows: readonly ReviewRow[]): ReviewRow[] {
  return rows.map((row) => {
    let selected: string
    switch (row.AdjudicationDecision) {
      case 'AGREED':
      case 'CODEX':
        selected = row.CodexTranslation
        break
      case 'DEEPL':
        selected = row.DeepLTranslation
        break
      case 'CUSTOM':
      case 'INVALID_DEEPL_REPAIRED':
        selected = row.FinalTranslation
        break
      case '':
        throw new Error(`REVIEW_DECISION_REQUIRED: ${row.Key}`)
      default: {
        const exhaustive: never = row.AdjudicationDecision
        throw new Error(`REVIEW_DECISION_INVALID: ${row.Key}:${exhaustive}`)
      }
    }
    if (selected !== row.FinalTranslation) {
      throw new Error(`REVIEW_DECISION_CONTRADICTS_EVIDENCE: ${row.Key}`)
    }
    return { ...row, FinalTranslation: selected }
  })
}
