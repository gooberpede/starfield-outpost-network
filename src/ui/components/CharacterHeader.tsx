/**
 * CharacterHeader.tsx
 *
 * Purpose:
 *   Edits the character-level information currently relevant to network
 *   behaviour.
 *
 * Architecture:
 *   Operationally useful fields presented here are character name and level,
 *   Outpost Management, and Planetary Habitation.
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

import { useEffect, useRef, useState } from 'react'

import type { Character } from '../../domain/models'
import { parseCharacterLevelDraft } from '../../domain/characterLevel'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { formatInteger } from '../../localization/formatters.ts'
import { getSkillDisplayName } from '../../localization/officialTerms.ts'

import './CharacterHeader.css'

type CharacterSkill = keyof Character['skills']

interface CharacterHeaderProps {
  character: Character
  onNameCommit: (name: string) => void
  onLevelCommit: (level: number | null) => void
  onSkillCommit: (
    skill: CharacterSkill,
    rank: number | null,
  ) => void
}

interface CharacterLevelFieldProps {
  level: number | null
  onCommit: (level: number | null) => void
  onDraftChange: () => void
  onReject: (message: string) => void
}

function CharacterLevelField({
  level,
  onCommit,
  onDraftChange,
  onReject,
}: CharacterLevelFieldProps) {
  const { locale, t } = useLocalization()
  const [draftLevel, setDraftLevel] = useState(level === null ? '' : String(level))

  function commitDraft() {
    const parsedLevel = parseCharacterLevelDraft(draftLevel)
    if (parsedLevel === undefined) {
      setDraftLevel(level === null ? '' : String(level))
      onReject(t(level === null
        ? 'character.level.rejectedEmpty'
        : 'character.level.rejectedRestored', level === null
        ? undefined
        : { value: formatInteger(locale, level) }))
    } else if (parsedLevel !== level) {
      onCommit(parsedLevel)
    }
  }
  return (
    <label className="character-header__field">
      <span>{t('character.level')}</span>
      <input
        className="character-header__level"
        type="text"
        inputMode="numeric"
        value={draftLevel}
        onChange={(event) => {
          setDraftLevel(event.target.value)
          onDraftChange()
        }}
        onBlur={commitDraft}
      />
    </label>
  )
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
  const { t } = useLocalization()
  const [draftName, setDraftName] =
    useState(name)

  return (
    <label className="character-header__field">
      <span>{t('character.name')}</span>

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
  onDraftChange: () => void
  onReject: (message: string) => void
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
  onDraftChange,
  onReject,
}: SkillRankFieldProps) {
  const { locale, t } = useLocalization()
  const [draftRank, setDraftRank] =
    useState(
      rank === null
        ? ''
        : String(rank),
    )

  function commitDraft() {
    const trimmedDraftRank = draftRank.trim()
    if (trimmedDraftRank === '') {
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
    onReject(t(rank === null
      ? 'character.skillRank.rejectedEmpty'
      : 'character.skillRank.rejectedRestored', rank === null
      ? undefined
      : { value: formatInteger(locale, rank) }))
  }

  return (
    <label className="character-header__field">
      <span>{label}</span>

      <input
        className="character-header__number"
        type="text"
        inputMode="numeric"
        value={draftRank}
        onChange={(event) => {
          setDraftRank(event.target.value)
          onDraftChange()
        }}
        onBlur={commitDraft}
      />
    </label>
  )
}

/** Defers blur-time rejection speech until the browser has settled focus. */
function useDeferredRejectionAnnouncement() {
  const [announcement, setAnnouncement] = useState('')
  const pendingFrameRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (pendingFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingFrameRef.current)
    }
  }, [])

  function clearAnnouncement() {
    setAnnouncement('')
  }

  function announceAfterFocusSettles(message: string) {
    if (pendingFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingFrameRef.current)
    }

    setAnnouncement('')
    pendingFrameRef.current = window.requestAnimationFrame(() => {
      pendingFrameRef.current = null
      setAnnouncement(message)
    })
  }

  return { announcement, clearAnnouncement, announceAfterFocusSettles }
}

export function CharacterHeader({
  character,
  onNameCommit,
  onLevelCommit,
  onSkillCommit,
}: CharacterHeaderProps) {
  const { locale } = useLocalization()
  const {
    announcement,
    clearAnnouncement,
    announceAfterFocusSettles,
  } = useDeferredRejectionAnnouncement()
  return (
    <header className="character-header">

      <div className="character-header__fields">
        <CharacterNameField
          key={character.name}
          name={character.name}
          onCommit={onNameCommit}
        />

        <CharacterLevelField
          key={`level:${character.level ?? 'unknown'}`}
          level={character.level}
          onCommit={onLevelCommit}
          onDraftChange={clearAnnouncement}
          onReject={announceAfterFocusSettles}
        />

        <SkillRankField
          key={`outpostManagement:${character.skills.outpostManagement ?? 'unknown'}`}
          label={getSkillDisplayName('outpostManagement', locale)}
          rank={character.skills.outpostManagement}
          skill="outpostManagement"
          onCommit={onSkillCommit}
          onDraftChange={clearAnnouncement}
          onReject={announceAfterFocusSettles}
        />

        <SkillRankField
          key={`planetaryHabitation:${character.skills.planetaryHabitation ?? 'unknown'}`}
          label={getSkillDisplayName('planetaryHabitation', locale)}
          rank={character.skills.planetaryHabitation}
          skill="planetaryHabitation"
          onCommit={onSkillCommit}
          onDraftChange={clearAnnouncement}
          onReject={announceAfterFocusSettles}
        />
      </div>
      <div className="ui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </header>
  )
}
