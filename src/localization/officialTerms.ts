import type { Character } from '../domain/models.ts'
import { translate } from './catalog.ts'
import { getReferenceDisplayName } from './referenceNames.ts'
import type { MessageKey, SupportedLocale } from './types.ts'

export type CharacterSkill = keyof Character['skills']

export const officialTermBySkill = {
  outpostManagement: {
    id: 'skill.outpost-management',
    messageKey: 'character.skill.outpostManagement',
  },
  outpostEngineering: {
    id: 'skill.outpost-engineering',
    messageKey: 'character.skill.outpostEngineering',
  },
  planetaryHabitation: {
    id: 'skill.planetary-habitation',
    messageKey: 'character.skill.planetaryHabitation',
  },
  researchMethods: {
    id: 'skill.research-methods',
    messageKey: 'character.skill.researchMethods',
  },
  specialProjects: {
    id: 'skill.special-projects',
    messageKey: 'character.skill.specialProjects',
  },
} as const satisfies Record<CharacterSkill, { id: string; messageKey: MessageKey }>

/** Resolves Bethesda skill names without storing localized text or game FormIDs. */
export function getSkillDisplayName(
  skill: CharacterSkill,
  locale: SupportedLocale,
): string {
  const term = officialTermBySkill[skill]
  const canonicalEnglish = translate('en-US', term.messageKey)
  return getReferenceDisplayName('official-term', term.id, canonicalEnglish, locale)
}
