import type { SupportedLocale } from './types.ts'

export type ReferenceNameKind = 'resource' | 'product' | 'system' | 'body' | 'biome' | 'species'

const referenceNameOverrides: Partial<Record<SupportedLocale, Partial<Record<ReferenceNameKind, Record<string, string>>>>> = {
  'en-US': { resource: { aluminium: 'Aluminum' } },
  'en-GB': { resource: { aluminium: 'Aluminium' } },
}

/** Stable IDs select sparse locale overlays; canonical names remain fallback. */
export function getReferenceDisplayName(
  kind: ReferenceNameKind,
  id: string,
  canonicalName: string | null | undefined,
  locale: SupportedLocale,
): string {
  return referenceNameOverrides[locale]?.[kind]?.[id] ?? canonicalName ?? id
}
