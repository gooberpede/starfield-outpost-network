/** Parses the Character Header draft without committing invalid values. */
export function parseCharacterLevelDraft(draft: string): number | null | undefined {
  if (draft.trim() === '') return null
  const level = Number(draft)
  return Number.isInteger(level) && level >= 1 && level <= 999 ? level : undefined
}
