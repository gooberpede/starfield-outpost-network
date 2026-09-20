import { enUSMessages } from '../locales/en-US.ts'
import type { MessageCatalogue, MessageKey } from '../types.ts'

export type DraftReplacement = readonly [source: string, target: string]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Builds a complete draft from editorial key overrides and an ordered phrase
 * lexicon. This keeps the frozen catalogue exhaustive while the CSV remains
 * the durable unit-by-unit review artifact.
 */
export function buildReviewDraft(
  exactByKey: Partial<Record<MessageKey, string>>,
  replacements: readonly DraftReplacement[],
): MessageCatalogue {
  const entries = (Object.entries(enUSMessages) as [MessageKey, string][]).map(([key, source]) => {
    const exact = exactByKey[key]
    if (exact) return [key, exact]
    const protectedSegments: string[] = []
    let translated = source.replace(
      /\{\w+, plural, one \{[^{}]*\} other \{[^{}]*\}\}|\{\w+\}/g,
      (segment) => `@@PLACEHOLDER_${protectedSegments.push(segment) - 1}@@`,
    )
    for (const [english, target] of replacements) {
      translated = translated.replace(new RegExp(`(?<![A-Za-z])${escapeRegExp(english)}(?![A-Za-z])`, 'g'), target)
    }
    translated = translated.replace(/@@PLACEHOLDER_(\d+)@@/g, (_match, index: string) => protectedSegments[Number(index)])
    return [key, translated]
  })
  return Object.fromEntries(entries) as MessageCatalogue
}
