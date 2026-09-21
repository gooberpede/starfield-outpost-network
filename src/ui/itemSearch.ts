/** Pure localized catalogue construction and deterministic item matching. */
import type { CargoItem } from '../domain/models.ts'
import type { ReferenceData } from '../domain/referenceData.ts'
import { getReferenceDisplayName } from '../localization/referenceNames.ts'
import { getReferenceSearchAlternates } from '../localization/searchAliases.ts'
import { getCollator } from '../localization/formatters.ts'
import type { SupportedLocale } from '../localization/types.ts'

export type ItemSearchAliasKind = 'canonical-en' | 'alternate'

export interface ItemSearchAlias {
  kind: ItemSearchAliasKind
  value: string
  normalizedValue: string
}

export interface ItemSearchEntry {
  item: CargoItem
  key: string
  displayName: string
  abbreviation: string
  category: CargoItem['type']
  normalizedName: string
  foldedNormalizedName?: string
  normalizedAbbreviation: string
  aliases: ItemSearchAlias[]
  needsCategoryDisambiguator: boolean
}

export function normalizeItemSearchText(value: string, locale: SupportedLocale): string {
  return value
    .trim()
    .normalize('NFC')
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase(locale)
}

/** Adds a search-only convenience form without changing display text or exact-match ranking. */
export function foldLocalizedItemSearchText(
  value: string,
  locale: SupportedLocale,
): string {
  const normalized = normalizeItemSearchText(value, locale)
  if (!['fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'pl-PL'].includes(locale)) {
    return normalized
  }
  const folded = normalized.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC')
  if (locale === 'it-IT') return folded.replaceAll('’', "'")
  return locale === 'pl-PL' ? folded.replaceAll('ł', 'l') : folded
}

export function buildItemSearchCatalogue(
  referenceData: ReferenceData,
  locale: SupportedLocale,
): ItemSearchEntry[] {
  const entries: ItemSearchEntry[] = [
    ...referenceData.resources.map((reference) => ({
      item: { type: 'resource' as const, id: reference.id },
      displayName: getReferenceDisplayName('resource', reference.id, reference.name, locale),
      abbreviation: reference.shortName,
      canonicalName: reference.name,
    })),
    ...referenceData.products.map((reference) => ({
      item: { type: 'product' as const, id: reference.id },
      displayName: getReferenceDisplayName('product', reference.id, reference.name, locale),
      abbreviation: reference.shortName,
      canonicalName: reference.name,
    })),
  ].map(({ item, displayName, abbreviation, canonicalName }) => {
    const aliasValues: Array<{ kind: ItemSearchAliasKind; value: string }> = [
      { kind: 'canonical-en', value: canonicalName },
      ...getReferenceSearchAlternates(item.type, item.id).map((value) => ({
        kind: 'alternate' as const,
        value,
      })),
    ]
    const normalizedVisibleValues = new Set([
      normalizeItemSearchText(displayName, locale),
      normalizeItemSearchText(abbreviation, locale),
    ])
    const aliases = aliasValues
      .map(({ kind, value }) => ({
        kind,
        value,
        normalizedValue: normalizeItemSearchText(value, locale),
      }))
      .filter(({ normalizedValue }, index, all) =>
        !normalizedVisibleValues.has(normalizedValue) &&
        all.findIndex((alias) => alias.normalizedValue === normalizedValue) === index)

    return {
      item,
      key: `${item.type}:${item.id}`,
      displayName,
      abbreviation,
      category: item.type,
      normalizedName: normalizeItemSearchText(displayName, locale),
      foldedNormalizedName: foldLocalizedItemSearchText(displayName, locale),
      normalizedAbbreviation: normalizeItemSearchText(abbreviation, locale),
      aliases,
      needsCategoryDisambiguator: false,
    }
  })

  const visibleIdentityCounts = new Map<string, number>()
  for (const entry of entries) {
    for (const identity of new Set([
      entry.normalizedName,
      entry.normalizedAbbreviation,
      ...entry.aliases.map(({ normalizedValue }) => normalizedValue),
    ])) {
      visibleIdentityCounts.set(identity, (visibleIdentityCounts.get(identity) ?? 0) + 1)
    }
  }

  return entries.map((entry) => ({
    ...entry,
    needsCategoryDisambiguator:
      (visibleIdentityCounts.get(entry.normalizedName) ?? 0) > 1 ||
      (visibleIdentityCounts.get(entry.normalizedAbbreviation) ?? 0) > 1 ||
      entry.aliases.some(
        ({ normalizedValue }) => (visibleIdentityCounts.get(normalizedValue) ?? 0) > 1,
      ),
  }))
}

function getMatchTier(entry: ItemSearchEntry, query: string, foldedQuery: string): number | null {
  if (entry.normalizedName === query) return 1
  if (entry.normalizedAbbreviation === query) return 2
  if (entry.normalizedName.startsWith(query)) return 3
  if (entry.normalizedAbbreviation.startsWith(query)) return 4
  if (entry.normalizedName.includes(query)) return 5
  const foldedName = entry.foldedNormalizedName ?? entry.normalizedName
  if (foldedName !== entry.normalizedName) {
    if (foldedName === foldedQuery) return 6
    if (foldedName.startsWith(foldedQuery)) return 7
    if (foldedName.includes(foldedQuery)) return 8
  }
  const canonicalAlias = entry.aliases.find(({ kind }) => kind === 'canonical-en')
  if (canonicalAlias?.normalizedValue === query) return 9
  if (canonicalAlias?.normalizedValue.startsWith(query)) return 10
  if (canonicalAlias?.normalizedValue.includes(query)) return 11
  const alternateAliases = entry.aliases.filter(({ kind }) => kind === 'alternate')
  if (alternateAliases.some(({ normalizedValue }) => normalizedValue === query)) return 12
  if (alternateAliases.some(({ normalizedValue }) => normalizedValue.startsWith(query))) return 13
  if (alternateAliases.some(({ normalizedValue }) => normalizedValue.includes(query))) return 14
  return null
}

export function getItemSearchMatches(
  catalogue: readonly ItemSearchEntry[],
  draftQuery: string,
  locale: SupportedLocale,
): ItemSearchEntry[] {
  const query = normalizeItemSearchText(draftQuery, locale)
  if (!query) return []
  const foldedQuery = foldLocalizedItemSearchText(draftQuery, locale)
  const collator = getCollator(locale)
  const categoryOrder = { resource: 0, product: 1 } as const

  return catalogue
    .map((entry) => ({ entry, tier: getMatchTier(entry, query, foldedQuery) }))
    .filter((candidate): candidate is { entry: ItemSearchEntry; tier: number } =>
      candidate.tier !== null)
    .sort((left, right) =>
      left.tier - right.tier ||
      collator.compare(left.entry.displayName, right.entry.displayName) ||
      categoryOrder[left.entry.category] - categoryOrder[right.entry.category] ||
      left.entry.item.id.localeCompare(right.entry.item.id))
    .map(({ entry }) => entry)
}

/** A free-text draft resolves only when the complete match set is unambiguous. */
export function getUniquelyResolvedSearchItem(
  matches: readonly ItemSearchEntry[],
): CargoItem | null {
  return matches.length === 1 ? { ...matches[0].item } : null
}
