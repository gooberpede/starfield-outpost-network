import type { CargoPad } from './models.ts'

/** Persisted positional labels remain invariant legacy data, independent of UI locale. */
export function getInvariantCargoPadLabel(index: number): string {
  return `Pad ${index + 1}`
}

/** Reassigns positional labels without changing stable pad identity or nested data. */
export function renumberCargoPadLabels(cargoPads: CargoPad[]): CargoPad[] {
  return cargoPads.map((cargoPad, index) => ({
    ...cargoPad,
    label: getInvariantCargoPadLabel(index),
  }))
}
