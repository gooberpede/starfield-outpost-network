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

interface OutpostNameFieldProps {
  name: string
  onCommit: (name: string) => void
}

/**
 * Owns one outpost-name editing session. Its parent keys the field by outpost
 * identity and authoritative name so navigation and Undo/Redo reset the draft.
 */
function OutpostNameField({
  name,
  onCommit,
}: OutpostNameFieldProps) {
  const [draftName, setDraftName] =
    useState(name)

  return (
    <label className="outpost-details__field">
      <span>Name</span>

      <input
        type="text"
        value={draftName}
        onChange={(event) =>
          setDraftName(event.target.value)
        }
        onBlur={() => {
          if (draftName !== name) {
            onCommit(draftName)
          }
        }}
      />
    </label>
  )
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
        <OutpostNameField
          key={`${outpost.id}:${outpost.name}`}
          name={outpost.name}
          onCommit={onNameCommit}
        />

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
