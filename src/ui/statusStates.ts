/**
 * Purpose: Derive compact semantic state tokens used by status controls.
 * Architecture: Keeps presentation state names independent of CSS details.
 * Change this file when: manufacturing or cargo fuel status semantics change.
 */
import type { CargoItem } from '../domain/models.ts'
import type { ProductId } from '../domain/referenceData.ts'

export type ManufacturingProducingState = 'producing' | 'not-producing'

export function getManufacturingProducingState(
  productId: ProductId,
  actuallyAvailableItems: CargoItem[],
): ManufacturingProducingState {
  return actuallyAvailableItems.some(
    (item) => item.type === 'product' && item.id === productId,
  )
    ? 'producing'
    : 'not-producing'
}

export type InterstellarFuelState = 'regular' | 'fuelled' | 'unfuelled'

export function getInterstellarFuelState(
  isInterstellar: boolean,
  hasActualHelium3: boolean,
): InterstellarFuelState {
  if (!isInterstellar) return 'regular'
  return hasActualHelium3 ? 'fuelled' : 'unfuelled'
}
