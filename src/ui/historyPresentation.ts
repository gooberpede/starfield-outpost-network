import { translateDescriptor } from '../localization/catalog.ts'
import { getReferenceDisplayName } from '../localization/referenceNames.ts'
import { formatInteger } from '../localization/formatters.ts'

import type { HistoryLabelDescriptor } from '../domain/collectionEditingSession.ts'
import type { MessageParameters, SupportedLocale } from '../localization/types.ts'

const skillMessageKeys = {
  outpostManagement: 'character.skill.outpostManagement',
  outpostEngineering: 'character.skill.outpostEngineering',
  planetaryHabitation: 'character.skill.planetaryHabitation',
  researchMethods: 'character.skill.researchMethods',
  specialProjects: 'character.skill.specialProjects',
} as const

/** Resolves semantic history facts against the locale active at render time. */
export function getHistoryDisplayLabel(
  label: HistoryLabelDescriptor,
  locale: SupportedLocale,
): string {
  const referenceParameters: MessageParameters = Object.fromEntries(
    (label.referenceParameters ?? []).map((reference) => [
      reference.parameter,
      getReferenceDisplayName(
        reference.kind,
        reference.id,
        reference.fallback,
        locale,
      ),
    ]),
  )
  const skillParameters: MessageParameters = label.skillId
    ? {
        skill: translateDescriptor(locale, {
          key: skillMessageKeys[label.skillId],
        }),
      }
    : {}
  const cargoPadParameters: MessageParameters = Object.fromEntries(
    (label.cargoPadOrdinalParameters ?? []).map(({ parameter, ordinal }) => [
      parameter,
      translateDescriptor(locale, {
        key: 'cargo.pad.summary',
        parameters: { ordinal: formatInteger(locale, ordinal) },
      }),
    ]),
  )
  const action = translateDescriptor(locale, {
    key: label.key,
    parameters: {
      ...label.parameters,
      ...referenceParameters,
      ...skillParameters,
      ...cargoPadParameters,
    },
  })

  return label.networkOrdinal === undefined
    ? action
    : translateDescriptor(locale, {
        key: 'history.networkContext',
        parameters: { ordinal: label.networkOrdinal, action },
      })
}
