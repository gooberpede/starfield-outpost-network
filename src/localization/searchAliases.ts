import type { ReferenceNameKind } from './referenceNames.ts'

/** Curated search-only spellings that are established by product localization. */
const referenceSearchAlternates: Partial<
  Record<ReferenceNameKind, Record<string, readonly string[]>>
> = {
  resource: {
    aluminium: ['Aluminium'],
  },
}

/**
 * Returns deliberately supported aliases without widening visible reference
 * names or treating every localized name as a hidden search term.
 */
export function getReferenceSearchAlternates(
  kind: ReferenceNameKind,
  id: string,
): readonly string[] {
  return referenceSearchAlternates[kind]?.[id] ?? []
}
