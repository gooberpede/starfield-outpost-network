/**
 * Purpose: Identify canonical recorded ranks before evaluating character capability.
 * Architecture: Unknown null ranks and malformed values are not comparable ranks.
 * Change this file when: the supported Starfield skill range changes.
 */
export function isValidSkillRank(rank: number | null): rank is number {
  return rank !== null && Number.isInteger(rank) && rank >= 0 && rank <= 4
}
