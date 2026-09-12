import { enUSMessages } from './locales/en-US.ts'
import { jaJPMessages } from './locales/ja-JP.ts'
import type { MessageKey } from './types.ts'

export type JapaneseReviewRisk = 'LOW' | 'MEDIUM' | 'HIGH'

export interface JapaneseReviewRow {
  Key: MessageKey
  English: string
  Context: string
  Risk: JapaneseReviewRisk
  ProtectedTokens: string
  Parameters: string
  CodexJapanese: string
  TrackerOrBethesdaOwned: 'Tracker-authored'
}

const contextByNamespace: Record<string, string> = {
  locale: 'Language selector and effective-locale presentation.',
  common: 'Shared visible or accessible UI action.',
  about: 'About dialog content or accessible control.',
  character: 'Character details field or Starfield skill label.',
  network: 'Network navigation, creation, reset, or deletion UI.',
  outpost: 'Outpost navigation or details UI.',
  power: 'Power quality label or explanatory tooltip.',
  matrix: 'Resource Matrix label, action, state, or tooltip.',
  production: 'Active Production section.',
  plannedSupply: 'Planned Supply planning UI; virtual supply, not inventory.',
  cargo: 'Cargo-pad, cargo-link, destination, or export UI.',
  validation: 'Validation severity, diagnostic, context, or remediation.',
  status: 'Status bar, import/export feedback, or reference-data feedback.',
  transfer: 'Whole-collection JSON import/export control.',
  history: 'Relocalizable Undo/Redo action description.',
  help: 'Contextual help, tooltip, or explanatory guidance.',
  search: 'Item search control, result, state flag, or accessibility instruction.',
}

const protectedTokenCandidates = [
  'Cosmos icons created by gravisio - Flaticon',
  'X-Tech Power Cores',
  'Starfield',
  'He-3',
  'X-Tech',
  'JSON',
  'Esc',
  'Shift',
  'ID',
] as const

function parametersOf(template: string): string[] {
  const normalized = template.replace(
    /\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g,
    '{$1}',
  )
  return [...new Set([...normalized.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))]
    .sort()
}

function protectedTokensOf(template: string): string[] {
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

function riskOf(key: MessageKey): JapaneseReviewRisk {
  if (
    key.startsWith('validation.') ||
    key.startsWith('help.') ||
    key === 'network.reset.explanation' ||
    key === 'network.delete.explanation' ||
    key === 'network.delete.undoHint' ||
    key === 'plannedSupply.heading' ||
    key === 'help.plannedSupply' ||
    key === 'search.results.dragInstructions'
  ) return 'HIGH'

  if (
    key.startsWith('cargo.') ||
    key.startsWith('matrix.') ||
    key.startsWith('history.') ||
    key.startsWith('status.') ||
    key.startsWith('power.') ||
    key.startsWith('search.') ||
    key.startsWith('plannedSupply.') ||
    key.startsWith('transfer.') ||
    key.includes('.navigation.') ||
    key.includes('.tooltip')
  ) return 'MEDIUM'

  return 'LOW'
}

/** Derives the B2/B3 join artifact from the two catalogues; Japanese is never duplicated. */
export function createJapaneseReviewRows(): JapaneseReviewRow[] {
  return (Object.keys(enUSMessages) as MessageKey[]).sort().map((key) => {
    const english = enUSMessages[key]
    return {
      Key: key,
      English: english,
      Context: contextByNamespace[key.split('.')[0]] ?? 'Tracker-authored application message.',
      Risk: riskOf(key),
      ProtectedTokens: protectedTokensOf(english).join('; '),
      Parameters: parametersOf(english).join('; '),
      CodexJapanese: jaJPMessages[key],
      TrackerOrBethesdaOwned: 'Tracker-authored',
    }
  })
}

const reviewColumns = [
  'Key', 'English', 'Context', 'Risk', 'ProtectedTokens', 'Parameters',
  'CodexJapanese', 'TrackerOrBethesdaOwned',
] as const satisfies readonly (keyof JapaneseReviewRow)[]

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function createJapaneseReviewCsv(): string {
  const lines = [
    reviewColumns.map(csvCell).join(','),
    ...createJapaneseReviewRows().map((row) =>
      reviewColumns.map((column) => csvCell(row[column])).join(',')),
  ]
  return `${lines.join('\n')}\n`
}
