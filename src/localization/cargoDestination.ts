import { translate } from './catalog.ts'
import { formatInteger } from './formatters.ts'
import type { SupportedLocale } from './types.ts'

/** Whole-message variants keep Polish forms out of the general one/other parser. */
export function formatCargoDestination(locale: SupportedLocale, outpost: string, count: number): string {
  const category = new Intl.PluralRules(locale).select(count)
  const variant = category === 'one' ? 'one' : locale === 'pl-PL' && category === 'few' ? 'few' : 'other'
  return translate(locale, `cargo.destination.count.${variant}`, { outpost, count: formatInteger(locale, count) })
}
