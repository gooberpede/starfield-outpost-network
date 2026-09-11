import type { BiomeButtonGroup } from '../domain/bodyResourceAvailability.ts'
import type { ReferenceData } from '../domain/referenceData.ts'
import { formatInteger } from '../localization/formatters.ts'
import {
  getReferenceDisplayName,
  type ReferenceNameKind,
} from '../localization/referenceNames.ts'
import type { SupportedLocale } from '../localization/types.ts'

export type ReferenceNameResolver = (
  kind: ReferenceNameKind,
  id: string,
  canonicalName: string | null | undefined,
  locale: SupportedLocale,
) => string

/** Localizes a grouped selector label through stable biome identity. */
export function getBiomeGroupDisplayName(
  group: BiomeButtonGroup,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver = getReferenceDisplayName,
): string {
  const baseName = resolveName('biome', group.biomeId, group.baseLabel, locale)
  return group.ordinal === null
    ? baseName
    : `${baseName} ${formatInteger(locale, group.ordinal)}`
}

/** Resolves a body-specific occurrence through its underlying stable biome ID. */
export function getBodyBiomeDisplayName(
  bodyBiomeId: string,
  referenceData: ReferenceData | null,
  locale: SupportedLocale,
  resolveName: ReferenceNameResolver = getReferenceDisplayName,
): string {
  const bodyBiome = referenceData?.bodyBiomes.find(({ id }) => id === bodyBiomeId)
  if (!bodyBiome) return bodyBiomeId
  const biome = referenceData?.biomes.find(({ id }) => id === bodyBiome.biomeId)
  return resolveName('biome', bodyBiome.biomeId, biome?.name, locale)
}
