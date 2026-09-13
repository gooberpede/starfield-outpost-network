import { getCollator } from '../localization/formatters.ts'
import type { SupportedLocale } from '../localization/types.ts'

export interface LocalizedCollationItem {
  id: string
  name: string
}

/** Alphabetizes localized presentation names with stable identity as fallback. */
export function compareLocalizedItems(
  left: LocalizedCollationItem,
  right: LocalizedCollationItem,
  locale: SupportedLocale,
): number {
  return getCollator(locale).compare(left.name, right.name) ||
    left.id.localeCompare(right.id)
}
