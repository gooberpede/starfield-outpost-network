import type {
  SolarEfficiency,
  WindEfficiency,
} from '../domain/powerEfficiency'

export type PowerEfficiencyLabel = 'V.Poor' | 'Poor' | 'Norm.' | 'Good' | 'None' | '—'

/** Keeps compact presentation wording separate from the domain buckets. */
export function getSolarEfficiencyLabel(
  efficiency: SolarEfficiency,
): PowerEfficiencyLabel {
  switch (efficiency) {
    case 'very-poor': return 'V.Poor'
    case 'poor': return 'Poor'
    case 'normal': return 'Norm.'
    case 'good': return 'Good'
    case 'unknown': return '—'
  }
}

export function getWindEfficiencyLabel(
  efficiency: WindEfficiency,
): PowerEfficiencyLabel {
  switch (efficiency) {
    case 'none': return 'None'
    case 'poor': return 'Poor'
    case 'normal': return 'Norm.'
    case 'good': return 'Good'
    case 'unknown': return '—'
  }
}
