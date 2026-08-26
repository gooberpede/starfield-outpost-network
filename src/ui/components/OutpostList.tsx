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

import { useState } from 'react'

import type { Outpost } from '../../domain/models'

import './OutpostList.css'

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
  const [isReshuffling, setIsReshuffling] =
    useState(false)

  return (
    <section className="outpost-list">
      <h2>
        Outposts [
        {outposts.length}
        {maxOutposts !== null && `/${maxOutposts}`}
        ]
      </h2>

      <div className="outpost-list__actions">
        <button
          type="button"
          onClick={onAddOutpost}
        >
          + Add Outpost
        </button>

        <button
          type="button"
          onClick={() =>
            setIsReshuffling(
              (currentValue) =>
                !currentValue,
            )
          }
          aria-pressed={isReshuffling}
        >
          {isReshuffling
            ? 'Lock order'
            : 'Reshuffle'}
        </button>
      </div>

      <ul className="outpost-list__items">
        {outposts.map((outpost, index) => (
          <li
            key={outpost.id}
            className="outpost-list__item"
          >
            <span
              className={`outpost-list__drag-handle${
                isReshuffling
                  ? ' outpost-list__drag-handle--enabled'
                  : ''
              }`}
              aria-disabled={!isReshuffling}
              aria-label={
                isReshuffling
                  ? `Drag handle for ${outpost.name}; drag-and-drop is not yet available`
                  : 'Reshuffle mode disabled'
              }
              title={
                isReshuffling
                  ? 'Drag-and-drop reordering coming soon'
                  : 'Reshuffle mode disabled'
              }
              tabIndex={0}
            >
              ⠿
            </span>

            <button
              type="button"
              className="outpost-list__selection"
              onClick={() =>
                onSelectOutpost(outpost.id)
              }
              disabled={
                outpost.id === selectedOutpostId
              }
              title={outpost.name}
            >
              {outpost.name}
            </button>

            <span className="outpost-list__move-controls">
              {isReshuffling && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onMoveOutpostUp(outpost.id)
                    }
                    disabled={index === 0}
                    title={`Move ${outpost.name} up`}
                    aria-label={`Move ${outpost.name} up`}
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
                    aria-label={`Move ${outpost.name} down`}
                  >
                    ↓
                  </button>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
