/**
 * OutpostList.tsx
 *
 * Purpose:
 *   Provides navigation between outposts and the control for creating a new
 *   outpost.
 *
 * Architecture:
 *   This component is intentionally concerned only with outpost navigation.
 *   Actions that modify the currently selected outpost, such as deletion,
 *   belong in the outpost-details area.
 *
 * Change this file when:
 *   - outpost navigation behaviour changes;
 *   - outpost ordering or grouping is introduced;
 *   - controls related to browsing the outpost list are added.
 */

import type { Outpost } from '../../domain/models'

interface OutpostListProps {
  outposts: Outpost[]
  selectedOutpostId: string
  onSelectOutpost: (outpostId: string) => void
  onAddOutpost: () => void
}

export function OutpostList({
  outposts,
  selectedOutpostId,
  onSelectOutpost,
  onAddOutpost,
}: OutpostListProps) {
  return (
    <section>
      <h2>Outposts</h2>

      <button
        type="button"
        onClick={onAddOutpost}
      >
        + Add Outpost
      </button>

      <ul>
        {outposts.map((outpost) => (
          <li key={outpost.id}>
            <button
              type="button"
              onClick={() =>
                onSelectOutpost(outpost.id)
              }
              disabled={
                outpost.id === selectedOutpostId
              }
            >
              {outpost.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}