/**
 * OutpostDetails.tsx
 *
 * Purpose:
 *   Edits the basic identity and location of the currently selected outpost.
 *
 * Architecture:
 *   This component presents the outpost name as an editable heading above a
 *   compact location strip. Layout-specific styling is delegated to
 *   OutpostDetails.css, while selection and persistence remain upstream.
 *
 * Change this file when:
 *   - outpost identity/location fields change;
 *   - the semantic structure of the details strip changes.
 */

import {
  useState,
} from 'react'

import type {
  Outpost,
} from '../../domain/models'

import type {
  BodyBiomeId,
  PlanetaryBodyReference,
  StarSystemReference,
} from '../../domain/referenceData'

import './OutpostDetails.css'

interface OutpostDetailsProps {
  outpost: Outpost
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]
  biomeGroups: {
    key: string
    label: string
    bodyBiomeIds: BodyBiomeId[]
  }[]
  onNameCommit: (
    name: string,
  ) => void
  onSystemChange: (
    systemId: string,
  ) => void
  onBodyChange: (
    bodyId: string,
  ) => void
  onBiomeGroupToggle: (bodyBiomeIds: BodyBiomeId[]) => void
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
    <input
      className="outpost-details__name"
      type="text"
      aria-label="Outpost name"
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
  )
}

export function OutpostDetails({
  outpost,
  systems,
  bodies,
  biomeGroups,
  onNameCommit,
  onSystemChange,
  onBodyChange,
  onBiomeGroupToggle,
}: OutpostDetailsProps) {
  const eligibleBodies = bodies.filter(
    (body) => body.outpostAllowed,
  )
  const eligibleSystemIds = new Set(
    eligibleBodies.map((body) => body.systemId),
  )
  const currentSystem = systems.find(
    (system) => system.id === outpost.systemId,
  )
  const availableSystems = systems.filter(
    (system) =>
      eligibleSystemIds.has(system.id) ||
      system.id === outpost.systemId,
  )
  const currentBody = bodies.find(
    (body) => body.id === outpost.bodyId,
  )
  const availableBodies = eligibleBodies.filter(
    (body) => body.systemId === outpost.systemId,
  )

  if (
    currentBody &&
    !availableBodies.some((body) => body.id === currentBody.id)
  ) {
    availableBodies.push(currentBody)
  }

  return (
    <section className="outpost-details">
      <OutpostNameField
        key={`${outpost.id}:${outpost.name}`}
        name={outpost.name}
        onCommit={onNameCommit}
      />

      <div className="outpost-details__fields">
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

            {outpost.systemId && !currentSystem && (
              <option value={outpost.systemId}>
                {outpost.systemId}
              </option>
            )}

            {availableSystems.map((system) => (
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

            {outpost.bodyId && !currentBody && (
              <option value={outpost.bodyId}>
                {outpost.bodyId}
              </option>
            )}

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

        <div className="outpost-details__field outpost-details__biomes">
          <span>Biome</span>
          <div className="outpost-details__biome-buttons">
            {biomeGroups.map((group) => {
              const pressed = outpost.selectedBiomeIds.length > 0 &&
                group.bodyBiomeIds.every((id) => outpost.selectedBiomeIds.includes(id))
              return (
                <button
                  key={group.key}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onBiomeGroupToggle(group.bodyBiomeIds)}
                >
                  {group.label}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
