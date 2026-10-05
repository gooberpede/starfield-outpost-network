import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import { incompleteCargoDestinationRule } from '../src/domain/validation/rules/incompleteCargoDestination.ts'
import { missingCargoLinkEndpointRule } from '../src/domain/validation/rules/missingCargoLinkEndpoint.ts'
import { cargoPadLinkedMultipleTimesRule } from '../src/domain/validation/rules/cargoPadLinkedMultipleTimes.ts'
import { selfLinkedCargoPadRule } from '../src/domain/validation/rules/selfLinkedCargoPad.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'
import { ValidationSummary } from '../src/ui/components/ValidationSummary.tsx'

const cases = ['incomplete', 'missing-intent', 'missing-outpost', 'missing-pad', 'orphan', 'conflict', 'self'] as const

for (const locale of supportedLocaleIds) test.each(cases)(`Validation opens for %s in ${locale}`, (kind) => {
  const network = createDefaultNetwork()
  network.outposts = ['A', 'B', 'C'].map(id => ({
    ...createDefaultOutpost([], id, `Outpost ${id}`),
    cargoPads: [{ id: `pad-${id}`, label: 'Pad', type: 'regular', outboundItems: [] }],
  }))
  const endpoint = (outpostId: string, cargoPadId = `pad-${outpostId}`) => ({ outpostId, cargoPadId })
  const link = (id: string, target: ReturnType<typeof endpoint>) => ({ id, endpointA: endpoint('A'), endpointB: target })
  if (kind === 'incomplete' || kind === 'missing-intent') {
    network.outposts[0].cargoPads[0].destinationIntent = { outpostId: kind === 'incomplete' ? 'B' : 'absent' }
  } else if (kind === 'missing-outpost') network.cargoLinks = [link('record', endpoint('absent'))]
  else if (kind === 'missing-pad') network.cargoLinks = [link('record', endpoint('B', 'absent-pad'))]
  else if (kind === 'orphan') network.cargoLinks = [{ id: 'orphan-record', endpointA: endpoint('gone-A'), endpointB: endpoint('gone-B') }]
  else if (kind === 'conflict') network.cargoLinks = [link('AB', endpoint('B')), link('AC', endpoint('C'))]
  else network.cargoLinks = [link('self-record', endpoint('A'))]

  const issues = [incompleteCargoDestinationRule, missingCargoLinkEndpointRule, cargoPadLinkedMultipleTimesRule, selfLinkedCargoPadRule]
    .flatMap(rule => rule.validate(network))
  expect(issues.length).toBeGreaterThan(0)
  const expected = kind === 'incomplete' ? translate(locale, 'validation.cargoDestinationIncomplete', { destination: 'Outpost B' })
    : kind === 'missing-intent' || kind === 'missing-outpost' ? translate(locale, 'validation.cargoMissingOutpost', { id: 'absent' })
    : kind === 'missing-pad' ? translate(locale, 'validation.cargoMissingPad', { destination: 'Outpost B', id: 'absent-pad' })
    : kind === 'orphan' ? translate(locale, 'validation.cargoOrphan')
    : kind === 'conflict' ? translate(locale, 'validation.cargoPairingConflict')
    : translate(locale, 'validation.selfLinkedCargoPad')
  const view = render(<LocalizationContext value={{ locale, automaticLocale: locale, localeOverride: locale,
    setLocaleOverride: vi.fn(), t: (key, parameters) => translate(locale, key, parameters),
  }}><ValidationSummary issues={issues} outposts={network.outposts} referenceData={null} onNavigateToIssue={vi.fn()} /></LocalizationContext>)
  const trigger = view.container.querySelector<HTMLButtonElement>('button[aria-expanded="false"]')!
  expect(trigger).not.toBeNull()
  expect(screen.queryByText(expected)).not.toBeInTheDocument()
  fireEvent.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getAllByText(expected).length).toBeGreaterThan(0)
  if (kind === 'conflict' || kind === 'orphan') {
    expect(view.container.textContent).toContain(kind === 'orphan' ? 'orphan-record' : 'AB')
    expect(view.container.textContent).toContain(kind === 'orphan' ? 'gone-A' : 'AC')
  }
})
