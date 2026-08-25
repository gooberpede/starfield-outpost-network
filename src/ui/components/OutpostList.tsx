/**
 * OutpostList.tsx
 *
 * Purpose:
 *   Provides navigation between outposts and the control for creating a new
 *   outpost.
 *
 * Architecture:
 *   This component owns presentation controls for browsing and ordering the
 *   outpost list. Persisted network changes are delegated upward through
 *   callbacks so history remains owned by the application layer.
 *
 *   Actions that modify the contents of the currently selected outpost, such
 *   as deletion, belong in the outpost-details area.
 * 
 *   The component also presents the network's current outpost count and, when
 *   the relevant character skill is known, the calculated maximum capacity.
 *   Capacity calculation itself remains in the domain layer.
 *
 * Change this file when:
 *   - outpost navigation behaviour changes;
 *   - outpost ordering or grouping is introduced;
 *   - controls related to browsing the outpost list are added.
 */

import type { Outpost } from '../../domain/models'

interface OutpostListProps {
  outposts: Outpost[]
  maxOutposts: number | null
  selectedOutpostId: string
  onSelectOutpost: (outpostId: string) => void
  onMoveOutpostUp: (outpostId: string) => void
  onMoveOutpostDown: (outpostId: string) => void
  onAddOutpost: () => void
}

export function OutpostList({
  outposts,
  maxOutposts,
  selectedOutpostId,
  onSelectOutpost,
  onMoveOutpostUp,
  onMoveOutpostDown,
  onAddOutpost,
}: OutpostListProps) {
  return (
    <section>
      <h2>
        Outposts [
        {outposts.length}
        {maxOutposts !== null && `/${maxOutposts}`}
        ]
      </h2>

      <button
        type="button"
        onClick={onAddOutpost}
      >
        + Add Outpost
      </button>

      <ul>
        {outposts.map((outpost, index) => (
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

            <button
              type="button"
              onClick={() =>
                onMoveOutpostUp(outpost.id)
              }
              disabled={index === 0}
              title={`Move ${outpost.name} up`}
            >
              ↑
            </button>

            <button
              type="button"
              onClick={() =>
                onMoveOutpostDown(outpost.id)
              }
              disabled={
                index === outposts.length - 1
              }
              title={`Move ${outpost.name} down`}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}