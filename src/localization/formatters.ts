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

export function formatInteger(locale: SupportedLocale, value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

export function formatDecimal(
  locale: SupportedLocale,
  value: number,
  fractionDigits = 2,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatPercent(
  locale: SupportedLocale,
  value: number,
  fractionDigits = 0,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function getCollator(locale: SupportedLocale): Intl.Collator {
  return new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
}
