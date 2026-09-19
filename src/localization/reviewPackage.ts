import { createHash } from 'node:crypto'
import { parse } from 'csv-parse/sync'

import { enUSMessages } from './locales/en-US.ts'
import type { MessageCatalogue, MessageKey } from './types.ts'

export type ReviewRisk = 'LOW' | 'MEDIUM' | 'HIGH'
export type ReviewComparisonStatus =
  | 'IDENTICAL'
  | 'TYPOGRAPHIC_ONLY'
  | 'SUBSTANTIVE'
  | 'MISSING'
  | 'INVALID_TOKENS'

export interface ReviewRow {
  Key: MessageKey
  Locale: string
  EnglishSource: string
  EnglishSourceSha256: string
  Context: string
  Risk: ReviewRisk
  Parameters: string
  ProtectedTokens: string
  OfficialTermConstraints: string
  CodexTranslation: string
  DeepLTranslation: string
  ComparisonStatus: ReviewComparisonStatus
  FinalTranslation: string
  ReviewerNote: string
}

export const REVIEW_COLUMNS = [
  'Key', 'Locale', 'EnglishSource', 'EnglishSourceSha256', 'Context', 'Risk',
  'Parameters', 'ProtectedTokens', 'OfficialTermConstraints', 'CodexTranslation',
  'DeepLTranslation', 'ComparisonStatus', 'FinalTranslation', 'ReviewerNote',
] as const satisfies readonly (keyof ReviewRow)[]

const contextByNamespace: Record<string, string> = {
  locale: 'Language selector and effective-locale presentation.', common: 'Shared visible or accessible UI action.',
  about: 'About dialog content or accessible control.', character: 'Character details field or Starfield skill label.',
  network: 'Network navigation, creation, reset, or deletion UI.', outpost: 'Outpost navigation or details UI.',
  power: 'Power quality label or explanatory tooltip.', matrix: 'Resource Matrix label, action, state, or tooltip.',
  production: 'Active Production section.', plannedSupply: 'Planned Supply planning UI; virtual supply, not inventory.',
  cargo: 'Cargo Link, destination, or export UI.', validation: 'Validation severity, diagnostic, context, or remediation.',
  status: 'Status bar, import/export feedback, or reference-data feedback.', transfer: 'Whole-collection JSON import/export control.',
  history: 'Relocalizable Undo/Redo action description.', help: 'Contextual help, tooltip, or explanatory guidance.',
  search: 'Item search control, result, state flag, or accessibility instruction.',
}

const protectedTokenCandidates = [
  'Cosmos icons created by gravisio - Flaticon', 'He-3', 'JSON', 'Esc', 'Shift', 'ID',
] as const

export function englishSourceSha256(source: string): string {
  return createHash('sha256').update(source).digest('hex').toUpperCase()
}

export function parametersOf(template: string): string[] {
  const normalized = template.replace(/\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g, '{$1}')
  return [...new Set([...normalized.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort()
}

export function protectedTokensOf(template: string): string[] {
  const found: string[] = []
  let remaining = template
  for (const token of protectedTokenCandidates) {
    if (remaining.includes(token)) {
      found.push(token)
      remaining = remaining.replaceAll(token, '')
    }
  }
  return found
}

function riskOf(key: MessageKey): ReviewRisk {
  if (key.startsWith('validation.') || key.startsWith('help.') ||
    ['network.reset.explanation', 'network.delete.explanation', 'network.delete.undoHint', 'plannedSupply.heading', 'search.results.dragInstructions'].includes(key)) return 'HIGH'
  if (['cargo.', 'matrix.', 'history.', 'status.', 'power.', 'search.', 'plannedSupply.', 'transfer.'].some((prefix) => key.startsWith(prefix)) ||
    key.includes('.navigation.') || key.includes('.tooltip')) return 'MEDIUM'
  return 'LOW'
}

export function comparisonStatus(codex: string, deepL: string): ReviewComparisonStatus {
  if (!codex || !deepL) return 'MISSING'
  if (codex === deepL) return 'IDENTICAL'
  const typographic = (value: string) => value.replaceAll('\r\n', '\n').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  return typographic(codex) === typographic(deepL) ? 'TYPOGRAPHIC_ONLY' : 'SUBSTANTIVE'
}

export function createReviewRows(locale: string, translations: Partial<MessageCatalogue> = {}): ReviewRow[] {
  return (Object.keys(enUSMessages) as MessageKey[]).sort().map((key) => {
    const english = enUSMessages[key]
    const codex = translations[key] ?? ''
    return {
      Key: key, Locale: locale, EnglishSource: english, EnglishSourceSha256: englishSourceSha256(english),
      Context: contextByNamespace[key.split('.')[0]] ?? 'Tracker-authored application message.', Risk: riskOf(key),
      Parameters: parametersOf(english).join('; '), ProtectedTokens: protectedTokensOf(english).join('; '),
      OfficialTermConstraints: '', CodexTranslation: codex, DeepLTranslation: '',
      ComparisonStatus: 'MISSING', FinalTranslation: '', ReviewerNote: '',
    }
  })
}

function csvCell(value: string): string { return `"${value.replaceAll('"', '""')}"` }

export function createReviewCsv(locale: string, translations: Partial<MessageCatalogue> = {}): string {
  return serializeReviewRows(createReviewRows(locale, translations))
}

export function serializeReviewRows(rows: readonly ReviewRow[]): string {
  const lines = [REVIEW_COLUMNS.map(csvCell).join(','), ...rows
    .map((row) => REVIEW_COLUMNS.map((column) => csvCell(row[column])).join(','))]
  return `${lines.join('\n')}\n`
}

export function parseAndValidateReviewCsv(source: string, locale: string): ReviewRow[] {
  const rows = parse(source, { bom: true, columns: true, skip_empty_lines: true }) as ReviewRow[]
  const seen = new Set<string>()
  for (const row of rows) {
    if (JSON.stringify(Object.keys(row)) !== JSON.stringify(REVIEW_COLUMNS)) throw new Error('REVIEW_SCHEMA_INVALID')
    if (row.Locale !== locale) throw new Error(`REVIEW_LOCALE_MISMATCH: ${row.Key}`)
    if (seen.has(row.Key)) throw new Error(`REVIEW_DUPLICATE_KEY: ${row.Key}`)
    seen.add(row.Key)
    const english = enUSMessages[row.Key]
    if (english === undefined) throw new Error(`REVIEW_UNKNOWN_KEY: ${row.Key}`)
    if (row.EnglishSource !== english || row.EnglishSourceSha256 !== englishSourceSha256(english)) throw new Error(`REVIEW_STALE_SOURCE: ${row.Key}`)
    const expectedComparison = comparisonStatus(row.CodexTranslation, row.DeepLTranslation)
    if (row.ComparisonStatus !== expectedComparison) throw new Error(`REVIEW_COMPARISON_STATUS_INVALID: ${row.Key}`)
    for (const field of ['CodexTranslation', 'DeepLTranslation', 'FinalTranslation'] as const) {
      if (!row[field]) continue
      if (JSON.stringify(parametersOf(row[field])) !== JSON.stringify(parametersOf(english))) throw new Error(`REVIEW_INVALID_PLACEHOLDERS: ${row.Key}:${field}`)
      if (protectedTokensOf(english).some((token) => !row[field].includes(token))) throw new Error(`REVIEW_INVALID_PROTECTED_TOKEN: ${row.Key}:${field}`)
    }
  }
  const missing = (Object.keys(enUSMessages) as MessageKey[]).filter((key) => !seen.has(key))
  if (missing.length) throw new Error(`REVIEW_MISSING_KEY: ${missing[0]}`)
  return rows
}

export function finalCatalogueFromReview(source: string, locale: string): MessageCatalogue {
  const rows = parseAndValidateReviewCsv(source, locale)
  const result = {} as MessageCatalogue
  for (const row of rows) {
    if (!row.FinalTranslation || ['MISSING', 'INVALID_TOKENS'].includes(row.ComparisonStatus)) throw new Error(`REVIEW_ROW_NOT_APPROVED: ${row.Key}`)
    result[row.Key] = row.FinalTranslation
  }
  return result
}
