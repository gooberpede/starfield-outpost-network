/** Qualitative classifications derived from canonical base-generator output. */
export type SolarEfficiency =
  | 'very-poor'
  | 'poor'
  | 'normal'
  | 'good'
  | 'unknown'

export type WindEfficiency =
  | 'none'
  | 'poor'
  | 'normal'
  | 'good'
  | 'unknown'

/** Unsupported future values stay unknown rather than being rounded to a bucket. */
export function getSolarEfficiency(
  solarArrayPower: number | null,
): SolarEfficiency {
  switch (solarArrayPower) {
    case 2: return 'very-poor'
    case 4: return 'poor'
    case 6: return 'normal'
    case 8: return 'good'
    default: return 'unknown'
  }
}

/** Zero is a known absence of wind power; null remains unknown. */
export function getWindEfficiency(
  windTurbinePower: number | null,
): WindEfficiency {
  switch (windTurbinePower) {
    case 0: return 'none'
    case 3: return 'poor'
    case 6: return 'normal'
    case 10: return 'good'
    default: return 'unknown'
  }
}
