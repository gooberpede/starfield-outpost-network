/**
 * CharacterHeader.tsx
 *
 * Purpose:
 *   Edits the character-level information currently relevant to network
 *   behaviour.
 *
 * Architecture:
 *   Only operationally useful character fields are currently presented:
 *   character name, Outpost Management, and Planetary Habitation.
 *
 *   Other persisted character data remains in the model and serialization but
 *   is intentionally hidden until corresponding application features use it.
 *
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

import { useState } from 'react'

import type { Character } from '../../domain/models'

import './CharacterHeader.css'

type CharacterSkill = keyof Character['skills']

interface CharacterHeaderProps {
  character: Character
  onNameCommit: (name: string) => void
  onSkillCommit: (
    skill: CharacterSkill,
    rank: number | null,
  ) => void
}

interface CharacterNameFieldProps {
  name: string
  onCommit: (name: string) => void
}

/**
 * Owns one character-name editing session. The parent keys this field by the
 * authoritative name so Undo, Redo, and import start a fresh matching draft.
 */
function CharacterNameField({
  name,
  onCommit,
}: CharacterNameFieldProps) {
  const [draftName, setDraftName] =
    useState(name)

  return (
    <label className="character-header__field">
      <span>Character</span>

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

interface SkillRankFieldProps {
  label: string
  rank: number | null
  skill: CharacterSkill
  onCommit: (
    skill: CharacterSkill,
    rank: number | null,
  ) => void
}

/**
 * Keeps one rank as editable text so blank and temporary invalid values remain
 * local until blur. A keyed remount synchronizes authoritative rank changes.
 */
function SkillRankField({
  label,
  rank,
  skill,
  onCommit,
}: SkillRankFieldProps) {
  const [draftRank, setDraftRank] =
    useState(
      rank === null
        ? ''
        : String(rank),
    )

  function commitDraft() {
    if (draftRank.trim() === '') {
      if (rank !== null) {
        onCommit(skill, null)
      }

      return
    }

    const parsedRank = Number(draftRank)

    if (
      Number.isInteger(parsedRank) &&
      parsedRank >= 0 &&
      parsedRank <= 4
    ) {
      if (parsedRank !== rank) {
        onCommit(skill, parsedRank)
      }

      return
    }

    setDraftRank(
      rank === null
        ? ''
        : String(rank),
    )
  }

  return (
    <label className="character-header__field">
      <span>{label}</span>

      <input
        className="character-header__number"
        type="text"
        inputMode="numeric"
        value={draftRank}
        onChange={(event) =>
          setDraftRank(event.target.value)
        }
        onBlur={commitDraft}
      />
    </label>
  )
}

export function CharacterHeader({
  character,
  onNameCommit,
  onSkillCommit,
}: CharacterHeaderProps) {
  return (
    <header className="character-header">

      <div className="character-header__fields">
        <CharacterNameField
          key={character.name}
          name={character.name}
          onCommit={onNameCommit}
        />

        <SkillRankField
          key={`outpostManagement:${character.skills.outpostManagement ?? 'unknown'}`}
          label="Outpost Management"
          rank={character.skills.outpostManagement}
          skill="outpostManagement"
          onCommit={onSkillCommit}
        />

        <SkillRankField
          key={`planetaryHabitation:${character.skills.planetaryHabitation ?? 'unknown'}`}
          label="Planetary Habitation"
          rank={character.skills.planetaryHabitation}
          skill="planetaryHabitation"
          onCommit={onSkillCommit}
        />
      </div>
    </header>
  )
}
