import type {
  SolarEfficiency,
  WindEfficiency,
} from '../domain/powerEfficiency'
import { translate } from '../localization/catalog.ts'
import type { SupportedLocale } from '../localization/types.ts'

export type PowerEfficiencyLabel = string

/** Keeps compact presentation wording separate from the domain buckets. */
export function getSolarEfficiencyLabel(
  efficiency: SolarEfficiency,
  locale: SupportedLocale = 'en-US',
): PowerEfficiencyLabel {
  switch (efficiency) {
    case 'very-poor': return translate(locale, 'power.label.veryPoor')
    case 'poor': return translate(locale, 'power.label.poor')
    case 'normal': return translate(locale, 'power.label.normal')
    case 'good': return translate(locale, 'power.label.good')
    case 'unknown': return translate(locale, 'power.label.unknown')
  }
}

export function getWindEfficiencyLabel(
  efficiency: WindEfficiency,
  locale: SupportedLocale = 'en-US',
): PowerEfficiencyLabel {
  switch (efficiency) {
    case 'none': return translate(locale, 'power.label.none')
    case 'poor': return translate(locale, 'power.label.poor')
    case 'normal': return translate(locale, 'power.label.normal')
    case 'good': return translate(locale, 'power.label.good')
    case 'unknown': return translate(locale, 'power.label.unknown')
  }
}
