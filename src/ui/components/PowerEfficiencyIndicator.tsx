import type { SolarEfficiency, WindEfficiency } from '../../domain/powerEfficiency.ts'
import { getPowerEfficiencyFilledSegmentCount } from '../powerEfficiencyPresentation.ts'

type PowerEfficiencyState = SolarEfficiency | WindEfficiency

/** Passive visual encoding; the parent output owns focus and localized semantics. */
export function PowerEfficiencyIndicator({ state }: { state: PowerEfficiencyState }) {
  const filledCount = getPowerEfficiencyFilledSegmentCount(state)

  return <span
    className="power-efficiency-indicator"
    data-power-state={state}
    aria-hidden="true"
  >
    <span className="power-efficiency-indicator__segments">
      {[0, 1, 2, 3].map((index) => <span
        className="power-efficiency-indicator__segment"
        data-filled={index < filledCount ? 'true' : 'false'}
        key={index}
      />)}
    </span>
    {state === 'none' && <span className="power-efficiency-indicator__none-marker" />}
    {state === 'unknown' && <span className="power-efficiency-indicator__unknown-marker">?</span>}
  </span>
}
