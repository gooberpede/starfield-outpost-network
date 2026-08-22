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

import type { Character } from '../../domain/models'

import './CharacterHeader.css'

interface CharacterHeaderProps {
  character: Character
  onChange: (character: Character) => void
}

export function CharacterHeader({
  character,
  onChange,
}: CharacterHeaderProps) {
  /**
   * Updates the character name while preserving all other character data.
   */
  function updateName(name: string) {
    onChange({
      ...character,
      name,
    })
  }

  /**
   * Updates the recorded character level.
   */
  function updateLevel(level: number) {
    onChange({
      ...character,
      level,
    })
  }

  /**
   * Updates one skill rank while preserving the remaining skill values.
   */
  function updateSkill(
    skill: keyof Character['skills'],
    rank: number,
  ) {
    onChange({
      ...character,
      skills: {
        ...character.skills,
        [skill]: rank,
      },
    })
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
            value={character.name}
            onChange={(event) =>
              updateName(event.target.value)
            }
          />
        </label>

        <label className="character-header__field">
          <span>Level</span>

          <input
            className="character-header__number"
            type="number"
            min="1"
            value={character.level}
            onChange={(event) =>
              updateLevel(
                Number(event.target.value),
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Outpost Management</span>

          <input
            className="character-header__number"
            type="number"
            min="0"
            max="4"
            value={
              character.skills
                .outpostManagement
            }
            onChange={(event) =>
              updateSkill(
                'outpostManagement',
                Number(event.target.value),
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Outpost Engineering</span>

          <input
            className="character-header__number"
            type="number"
            min="0"
            max="4"
            value={
              character.skills
                .outpostEngineering
            }
            onChange={(event) =>
              updateSkill(
                'outpostEngineering',
                Number(event.target.value),
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Planetary Habitation</span>

          <input
            className="character-header__number"
            type="number"
            min="0"
            max="4"
            value={
              character.skills
                .planetaryHabitation
            }
            onChange={(event) =>
              updateSkill(
                'planetaryHabitation',
                Number(event.target.value),
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Research Methods</span>

          <input
            className="character-header__number"
            type="number"
            min="0"
            max="4"
            value={
              character.skills
                .researchMethods
            }
            onChange={(event) =>
              updateSkill(
                'researchMethods',
                Number(event.target.value),
              )
            }
          />
        </label>

        <label className="character-header__field">
          <span>Special Projects</span>

          <input
            className="character-header__number"
            type="number"
            min="0"
            max="4"
            value={
              character.skills
                .specialProjects
            }
            onChange={(event) =>
              updateSkill(
                'specialProjects',
                Number(event.target.value),
              )
            }
          />
        </label>
      </div>
    </header>
  )
}