import type { SupportedLocale } from './types.ts'
import { deDEReferenceNames } from './generated/de-DE-reference-names.ts'
import { frFRReferenceNames } from './generated/fr-FR-reference-names.ts'
import { jaJPReferenceNames } from './generated/ja-JP-reference-names.ts'
import { esESReferenceNames } from './generated/es-ES-reference-names.ts'
import { itITReferenceNames } from './generated/it-IT-reference-names.ts'
import { ptBRReferenceNames } from './generated/pt-BR-reference-names.ts'
import { plPLReferenceNames } from './generated/pl-PL-reference-names.ts'
import { zhHANSReferenceNames } from './generated/zh-Hans-reference-names.ts'

export type ReferenceNameKind =
  | 'resource'
  | 'product'
  | 'system'
  | 'body'
  | 'biome'
  | 'species'
  | 'official-term'

const referenceNameOverrides: Partial<Record<SupportedLocale, Partial<Record<ReferenceNameKind, Record<string, string>>>>> = {
  'en-US': { resource: { aluminium: 'Aluminum' } },
  'en-GB': { resource: { aluminium: 'Aluminium' } },
  'ja-JP': jaJPReferenceNames,
  'fr-FR': frFRReferenceNames,
  'de-DE': deDEReferenceNames,
  'es-ES': esESReferenceNames,
  'it-IT': itITReferenceNames,
  'pt-BR': ptBRReferenceNames,
  'pl-PL': plPLReferenceNames,
  'zh-Hans': zhHANSReferenceNames,
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
