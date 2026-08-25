/**
 * capacity.ts
 *
 * Purpose:
 *   Provides shared calculations for character-skill-dependent outpost and
 *   cargo-pad capacity.
 *
 * Architecture:
 *   Capacity rules belong in the domain layer because they are game rules
 *   consumed by both validation and presentation code.
 *
 *   These helpers accept only recorded numeric skill ranks. Callers must
 *   handle null separately because null means that the player's rank, and
 *   therefore the applicable capacity, is unknown.
 *
 * Change this file when:
 *   - Planetary Habitation outpost limits change;
 *   - Outpost Management cargo-pad limits change;
 *   - additional skill-dependent capacity rules are introduced.
 */

/**
 * Returns the maximum number of outposts allowed by a recorded Planetary
 * Habitation rank.
 *
 * Rank 0 allows 8 outposts. Each trained rank adds 4, up to 24 at rank 4.
 *
 * Unexpected numeric values are clamped to the known 0-4 range so this helper
 * never grants capacity beyond the game's supported limits. Structural
 * validation remains responsible for reporting invalid stored skill ranks.
 */
export function getOutpostLimit(
  planetaryHabitationRank: number,
): number {
  const validRank =
    Math.min(
      Math.max(
        planetaryHabitationRank,
        0,
      ),
      4,
    )

  return 8 + validRank * 4
}

/**
 * Returns the cargo-pad limit per outpost implied by a recorded Outpost
 * Management rank.
 *
 * Rank 0 allows three cargo pads per outpost. Any trained rank allows six.
 * Invalid numeric ranks are handled conservatively; structural validation is
 * responsible for reporting them separately.
 */
export function getCargoPadLimit(
  outpostManagementRank: number,
): number {
  return outpostManagementRank >= 1
    ? 6
    : 3
}