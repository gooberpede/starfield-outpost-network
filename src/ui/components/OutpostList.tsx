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
 *   Drag state describes only an interaction in progress. The persisted list
 *   remains stationary until a valid drop delegates one completed reorder.
 *
 * Change this file when:
 *   - outpost navigation behaviour changes;
 *   - outpost ordering or grouping is introduced;
 *   - controls related to browsing the outpost list are added.
 */

import {
  useEffect,
  useState,
} from 'react'
import type { DragEvent } from 'react'

import type { Outpost } from '../../domain/models'

import './OutpostList.css'

interface OutpostListProps {
  outposts: Outpost[]
  maxOutposts: number | null
  selectedOutpostId: string
  onSelectOutpost: (outpostId: string) => void
  onMoveOutpost: (outpostId: string, finalIndex: number) => void
  onMoveOutpostUp: (outpostId: string) => void
  onMoveOutpostDown: (outpostId: string) => void
  onAddOutpost: () => void
  onDragActiveChange: (isActive: boolean) => void
}

interface ActiveDrag {
  outpostId: string
  insertionIndex: number | null
}

export function OutpostList({
  outposts,
  maxOutposts,
  selectedOutpostId,
  onSelectOutpost,
  onMoveOutpost,
  onMoveOutpostUp,
  onMoveOutpostDown,
  onAddOutpost,
  onDragActiveChange,
}: OutpostListProps) {
  const [isReshuffling, setIsReshuffling] = useState(false)
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

  function clearDrag() {
    setActiveDrag(null)
  }

  const isDragActive = activeDrag !== null

  useEffect(() => {
    onDragActiveChange(isDragActive)
  }, [isDragActive, onDragActiveChange])

  useEffect(() => {
    if (!isDragActive) {
      return
    }

    function cancelWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        clearDrag()
      }
    }

    document.addEventListener('keydown', cancelWithEscape)

    return () => {
      document.removeEventListener('keydown', cancelWithEscape)
    }
  }, [isDragActive])

  function startDrag(
    event: DragEvent<HTMLSpanElement>,
    outpostId: string,
  ) {
    if (!isReshuffling) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', outpostId)
    setActiveDrag({ outpostId, insertionIndex: null })
  }

  /**
   * Maps the pointer to one of the gaps surrounding the stationary rows. The
   * list bounds define the valid edge zones, preventing outside edge snapping.
   */
  function updateInsertionPosition(event: DragEvent<HTMLUListElement>) {
    if (!activeDrag) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const rows = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '.outpost-list__item',
      ),
    )
    const insertionIndex = rows.findIndex((row) => {
      const bounds = row.getBoundingClientRect()
      return event.clientY < bounds.top + bounds.height / 2
    })

    const candidateInsertionIndex =
      insertionIndex === -1 ? rows.length : insertionIndex
    const sourceIndex = outposts.findIndex(
      (outpost) => outpost.id === activeDrag.outpostId,
    )
    const candidateFinalIndex =
      candidateInsertionIndex > sourceIndex
        ? candidateInsertionIndex - 1
        : candidateInsertionIndex
    const nextInsertionIndex =
      candidateFinalIndex === sourceIndex
        ? null
        : candidateInsertionIndex

    if (nextInsertionIndex !== activeDrag.insertionIndex) {
      setActiveDrag({
        ...activeDrag,
        insertionIndex: nextInsertionIndex,
      })
    }
  }

  function leaveList(event: DragEvent<HTMLUListElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom

    if (isOutside && activeDrag) {
      setActiveDrag({ ...activeDrag, insertionIndex: null })
    }
  }

  function dropOutpost(event: DragEvent<HTMLUListElement>) {
    event.preventDefault()

    if (!activeDrag || activeDrag.insertionIndex === null) {
      clearDrag()
      return
    }

    const sourceIndex = outposts.findIndex(
      (outpost) => outpost.id === activeDrag.outpostId,
    )
    const finalIndex =
      activeDrag.insertionIndex > sourceIndex
        ? activeDrag.insertionIndex - 1
        : activeDrag.insertionIndex

    onMoveOutpost(activeDrag.outpostId, finalIndex)
    clearDrag()
  }

  const markerIndex = activeDrag?.insertionIndex ?? null

  return (
    <section className="outpost-list">
      <h2>
        Outposts [{outposts.length}
        {maxOutposts !== null && `/${maxOutposts}`}]
      </h2>

      <div className="outpost-list__actions">
        <button type="button" onClick={onAddOutpost}>
          + Add Outpost
        </button>

        <button
          type="button"
          onClick={() => {
            clearDrag()
            setIsReshuffling((currentValue) => !currentValue)
          }}
          aria-pressed={isReshuffling}
        >
          {isReshuffling ? 'Lock order' : 'Reshuffle'}
        </button>
      </div>

      <ul
        className="outpost-list__items"
        onDragOver={updateInsertionPosition}
        onDragLeave={leaveList}
        onDrop={dropOutpost}
      >
        {outposts.map((outpost, index) => (
          <li
            key={outpost.id}
            className={`outpost-list__item${
              isReshuffling
                ? ' outpost-list__item--reshuffling'
                : ''
            }${
              activeDrag?.outpostId === outpost.id
                ? ' outpost-list__item--dragging'
                : ''
            }${
              markerIndex === index
                ? ' outpost-list__item--marker-before'
                : ''
            }`}
          >
            <span
              className={`outpost-list__drag-handle${
                isReshuffling
                  ? ' outpost-list__drag-handle--enabled'
                  : ''
              }`}
              draggable={isReshuffling}
              onDragStart={(event) => startDrag(event, outpost.id)}
              onDragEnd={clearDrag}
              aria-disabled={!isReshuffling}
              aria-label={
                isReshuffling
                  ? `Drag ${outpost.name} to reorder`
                  : 'Reshuffle mode disabled'
              }
              title={
                isReshuffling
                  ? `Drag ${outpost.name} to reorder`
                  : 'Reshuffle mode disabled'
              }
              tabIndex={0}
            >
              ⠿
            </span>

            <button
              type="button"
              className="outpost-list__selection"
              onClick={() => onSelectOutpost(outpost.id)}
              disabled={outpost.id === selectedOutpostId}
              title={outpost.name}
            >
              {outpost.name}
            </button>

            <span className="outpost-list__move-controls">
              {isReshuffling && (
                <>
                  <button
                    type="button"
                    onClick={() => onMoveOutpostUp(outpost.id)}
                    disabled={index === 0}
                    title={`Move ${outpost.name} up`}
                    aria-label={`Move ${outpost.name} up`}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveOutpostDown(outpost.id)}
                    disabled={index === outposts.length - 1}
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

        {markerIndex === outposts.length && (
          <li className="outpost-list__end-marker" aria-hidden="true" />
        )}
      </ul>
    </section>
  )
}
