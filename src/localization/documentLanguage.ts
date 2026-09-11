import type { SupportedLocale } from './types.ts'

/** Keeps document metadata aligned with the effective presentation locale. */
export function setDocumentLanguage(
  locale: SupportedLocale,
  target: Pick<Document, 'documentElement'> = document,
): void {
  target.documentElement.lang = locale
}
