/**
 * CharacterHeader.tsx
 *
 * Purpose:
 *   Edits character-level information that applies to the whole outpost
 *   network.
 *
 * Architecture:
 *   Character fields are presented as a compact horizontal strip so they
 *   remain visible without consuming much vertical workspace.
 *
 *   Layout-specific styling is delegated to CharacterHeader.css.
 *
 * Change this file when:
 *   - character-level fields change;
 *   - skill controls change;
 *   - header actions are moved into this component;
 *   - the semantic structure of the character strip changes.
 */

import {
  useEffect,
  useState,
} from 'react'

import type { Character } from '../../domain/models'

import './CharacterHeader.css'

interface CharacterHeaderProps {
  character: Character
  onNameCommit: (name: string) => void
  onLevelCommit: (
    level: number | null,
  ) => void
  onSkillCommit: (
    skill: keyof Character['skills'],
    rank: number | null,
  ) => void
}

export function CharacterHeader({
  character,
  onNameCommit,
  onLevelCommit,
  onSkillCommit,
}: CharacterHeaderProps) {

  /**
   * Holds the character name currently being typed without immediately changing
   * the persisted network.
   *
   * The completed value is committed when the field loses focus so the entire
   * editing session becomes one Undo/Redo action.
   */
  const [draftName, setDraftName] =
    useState(character.name)

  /**
   * Keeps the local draft synchronized with persisted character state, including
   * changes caused by Undo/Redo.
   */
  useEffect(() => {
    setDraftName(character.name)
  }, [
    character.name,
  ])

  /**
   * Holds the character level as text while the numeric input is being edited.
   *
   * Keeping the draft as a string allows temporary editing states such as an
   * empty field without immediately writing an invalid number to network state.
   */
  const [draftLevel, setDraftLevel] =
    useState(
      character.level === null
        ? ''
        : String(character.level),
    )

  /**
   * Synchronizes the numeric draft with persisted character state, including
   * changes caused by Undo/Redo.
   */
  useEffect(() => {
    setDraftLevel(
      character.level === null
        ? ''
        : String(character.level),
    )
  }, [
    character.level,
  ])

  /**
   * Holds skill ranks as editable text so temporary invalid states do not
   * immediately affect persisted character data.
   */
  const [draftSkills, setDraftSkills] =
    useState<Record<keyof Character['skills'], string>>({
      outpostManagement:
        character.skills.outpostManagement === null
          ? ''
          : String(character.skills.outpostManagement),

      outpostEngineering:
        character.skills.outpostEngineering === null
          ? ''
          : String(character.skills.outpostEngineering),

      planetaryHabitation:
        character.skills.planetaryHabitation === null
          ? ''
          : String(character.skills.planetaryHabitation),

      researchMethods:
        character.skills.researchMethods === null
          ? ''
          : String(character.skills.researchMethods),

      specialProjects:
        character.skills.specialProjects === null
          ? ''
          : String(character.skills.specialProjects),
    })

  /**
   * Keeps skill drafts synchronized with persisted state, including Undo/Redo.
   */
  useEffect(() => {
    setDraftSkills({
      outpostManagement:
        character.skills.outpostManagement === null
          ? ''
          : String(character.skills.outpostManagement),

      outpostEngineering:
        character.skills.outpostEngineering === null
          ? ''
          : String(character.skills.outpostEngineering),

      planetaryHabitation:
        character.skills.planetaryHabitation === null
          ? ''
          : String(character.skills.planetaryHabitation),

      researchMethods:
        character.skills.researchMethods === null
          ? ''
          : String(character.skills.researchMethods),

      specialProjects:
        character.skills.specialProjects === null
          ? ''
          : String(character.skills.specialProjects),
    })
  }, [
    character.skills.outpostManagement,
    character.skills.outpostEngineering,
    character.skills.planetaryHabitation,
    character.skills.researchMethods,
    character.skills.specialProjects,
  ])

  /**
   * Updates one local skill-rank draft without touching persisted network state.
   */
  function updateSkillDraft(
    skill: keyof Character['skills'],
    value: string,
  ) {
    setDraftSkills((current) => ({
      ...current,
      [skill]: value,
    }))
  }

  /**
   * Commits one completed skill-rank edit.
   *
   * Blank means that no rank is recorded. Otherwise skill ranks must be whole
   * numbers from 0 through 4. Invalid nonblank drafts revert to the persisted
   * value when the field loses focus.
   */
  function commitSkillDraft(
    skill: keyof Character['skills'],
  ) {
    const draftValue =
      draftSkills[skill]

    const currentRank =
      character.skills[skill]

    if (draftValue.trim() === '') {
      if (currentRank !== null) {
        onSkillCommit(
          skill,
          null,
        )
      }

      return
    }

    const rank =
      Number(draftValue)

    if (
      Number.isInteger(rank) &&
      rank >= 0 &&
      rank <= 4
    ) {
      if (rank !== currentRank) {
        onSkillCommit(
          skill,
          rank,
        )
      }

      return
    }

    setDraftSkills((current) => ({
      ...current,

      [skill]:
        currentRank === null
          ? ''
          : String(currentRank),
    }))
  }

  return (
    <header className="character-header">
      <h1 className="character-header__title">
        Starfield Outpost Network
      </h1>

      <div className="character-header__fields">
        <label className="character-header__field">
          <span>Character</span>

          <input
            type="text"
            value={draftName}
            onChange={(event) =>
              setDraftName(
                event.target.value,
              )
            }
            onBlur={() => {
              if (
                draftName !== character.name
              ) {
                onNameCommit(draftName)
              }
            }}
          />
        </label>

        <label className="character-header__field">
          <span>Level</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={draftLevel}
            onChange={(event) =>
              setDraftLevel(
                event.target.value,
              )
            }
            onBlur={() => {
              if (draftLevel.trim() === '') {
                if (character.level !== null) {
                  onLevelCommit(null)
                }

                return
              }

              const level =
                Number(draftLevel)

              if (
                Number.isInteger(level) &&
                level >= 1
              ) {
                if (
                  level !== character.level
                ) {
                  onLevelCommit(level)
                }

                return
              }

              setDraftLevel(
                character.level === null
                  ? ''
                  : String(character.level),
              )
            }}
          />
        </label>

        <label className="character-header__field">
          <span>Outpost Management</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={
              draftSkills.outpostManagement
            }
            onChange={(event) =>
              updateSkillDraft(
                'outpostManagement',
                event.target.value,
              )
            }
            onBlur={() =>
              commitSkillDraft(
                'outpostManagement',
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Outpost Engineering</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={
              draftSkills.outpostEngineering
            }
            onChange={(event) =>
              updateSkillDraft(
                'outpostEngineering',
                event.target.value,
              )
            }
            onBlur={() =>
              commitSkillDraft(
                'outpostEngineering',
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Planetary Habitation</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={
              draftSkills.planetaryHabitation
            }
            onChange={(event) =>
              updateSkillDraft(
                'planetaryHabitation',
                event.target.value,
              )
            }
            onBlur={() =>
              commitSkillDraft(
                'planetaryHabitation',
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Research Methods</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={
              draftSkills.researchMethods
            }
            onChange={(event) =>
              updateSkillDraft(
                'researchMethods',
                event.target.value,
              )
            }
            onBlur={() =>
              commitSkillDraft(
                'researchMethods',
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Special Projects</span>

          <input
            className="character-header__number"
            type="text"
            inputMode="numeric"
            value={
              draftSkills.specialProjects
            }
            onChange={(event) =>
              updateSkillDraft(
                'specialProjects',
                event.target.value,
              )
            }
            onBlur={() =>
              commitSkillDraft(
                'specialProjects',
              )
            }
          />
        </label>
      </div>
    </header>
  )
}