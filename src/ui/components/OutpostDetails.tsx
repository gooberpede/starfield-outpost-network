/**
 * OutpostDetails.tsx
 *
 * Purpose:
 *   Edits the basic identity and location of the currently selected outpost.
 *
 * Architecture:
 *   This component presents outpost-level context as a compact horizontal
 *   strip. Layout-specific styling is delegated to OutpostDetails.css so the
 *   structure can be adjusted later without changing application state logic.
 *
 * Change this file when:
 *   - outpost identity/location fields change;
 *   - actions that apply to the selected outpost are added or removed;
 *   - the semantic structure of the details strip changes.
 */

import {
  useEffect,
  useState,
} from 'react'

import type {
  Outpost,
} from '../../domain/models'

import type {
  PlanetaryBodyReference,
  StarSystemReference,
} from '../../domain/referenceData'

import './OutpostDetails.css'

interface OutpostDetailsProps {
  outpost: Outpost
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]
  onNameCommit: (
    name: string,
  ) => void
  onSystemChange: (
    systemId: string,
  ) => void
  onBodyChange: (
    bodyId: string,
  ) => void
  onDelete: () => void
  canDelete: boolean
}

export function OutpostDetails({
  outpost,
  systems,
  bodies,
  onNameCommit,
  onSystemChange,
  onBodyChange,
  onDelete,
  canDelete,
}: OutpostDetailsProps) {

  /**
   * Holds the name currently being typed without immediately changing the
   * persisted network.
   *
   * The completed value is committed when the text field loses focus, allowing
   * an entire editing session to become one Undo/Redo action rather than one
   * history entry per keystroke.
   */
  const [draftName, setDraftName] =
    useState(outpost.name)

  /**
   * Keeps the local text field synchronized when another persisted action
   * changes the selected outpost or its name, such as navigation or Undo/Redo.
   */
  useEffect(() => {
    setDraftName(outpost.name)
  }, [
    outpost.id,
    outpost.name,
  ])

  const availableBodies =
    bodies.filter(
      (body) =>
        body.systemId === outpost.systemId,
    )

  return (
    <section className="outpost-details">
      <h2 className="outpost-details__heading">
        Outpost Details
      </h2>

      <div className="outpost-details__fields">
        <label className="outpost-details__field">
          <span>Name</span>

          <input
            type="text"
            value={draftName}
            onChange={(event) =>
              setDraftName(
                event.target.value,
              )
            }
            onBlur={() => {
              if (draftName !== outpost.name) {
                onNameCommit(draftName)
              }
            }}
          />
        </label>

        <label className="outpost-details__field">
          <span>System</span>

          <select
            value={outpost.systemId}
            onChange={(event) =>
              onSystemChange(
                event.target.value,
              )
            }
          >
            <option value="">
              Select system...
            </option>

            {systems.map((system) => (
              <option
                key={system.id}
                value={system.id}
              >
                {system.name}
              </option>
            ))}
          </select>
        </label>

        <label className="outpost-details__field">
          <span>Body</span>

          <select
            value={outpost.bodyId}
            disabled={!outpost.systemId}
            onChange={(event) =>
              onBodyChange(
                event.target.value,
              )
            }
          >
            <option value="">
              Select body...
            </option>

            {availableBodies.map((body) => (
              <option
                key={body.id}
                value={body.id}
              >
                {body.name}
              </option>
            ))}
          </select>
        </label>

        <button
          className="outpost-details__delete"
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
        >
          Delete Outpost
        </button>
      </div>
    </section>
  )
}