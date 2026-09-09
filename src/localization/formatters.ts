import type { SupportedLocale } from './types.ts'

/** Formats a human-readable conjunction without baking English punctuation into callers. */
export function formatList(
  locale: SupportedLocale,
  values: readonly string[],
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  }).format(values)
}

