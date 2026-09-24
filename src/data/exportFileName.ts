/**
 * exportFileName.ts
 *
 * Purpose:
 *   Builds a useful default filename for exported outpost-network JSON files.
 *
 * Architecture:
 *   Filename generation is kept separate from the export UI so naming rules can
 *   evolve without changing browser-download behaviour.
 *
 *   Character names are converted to a filename-safe identifier. The timestamp
 *   uses the user's local time and includes seconds so repeated exports are
 *   unlikely to collide.
 *
 * Change this file when:
 *   - export filename conventions change;
 *   - additional identifying information is added to filenames;
 *   - filename sanitization rules change.
 */

/**
 * Converts free-form text into a compact filename-safe segment.
 */
function toFileNameSegment(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const MAX_CHARACTER_NAME_SEGMENT_LENGTH = 64

/**
 * Pads one numeric date/time component to two digits.
 */
function twoDigits(
  value: number,
): string {
  return String(value).padStart(2, '0')
}

/**
 * Builds the default JSON filename for one network export.
 *
 * Examples:
 *   starfield-outposts-rhea-2026-08-25-175012.json
 *   starfield-outposts-2026-08-25-175012.json
 */
export function createNetworkExportFileName(
  characterName: string,
  characterLevel: number | null = null,
  now: Date = new Date(),
): string {
  const characterSegment =
    toFileNameSegment(characterName).slice(0, MAX_CHARACTER_NAME_SEGMENT_LENGTH)

  const date =
    [
      now.getFullYear(),
      twoDigits(now.getMonth() + 1),
      twoDigits(now.getDate()),
    ].join('-')

  const time =
    [
      twoDigits(now.getHours()),
      twoDigits(now.getMinutes()),
      twoDigits(now.getSeconds()),
    ].join('')

  const parts = [
    'starfield-outposts',
    characterSegment,
    characterLevel === null ? '' : String(characterLevel),
    `${date}-${time}`,
  ].filter(Boolean)

  return `${parts.join('-')}.json`
}
