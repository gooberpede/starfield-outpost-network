import { render, screen } from '@testing-library/react'
import { useRef, type ReactNode } from 'react'
import { describe, expect, test, vi } from 'vitest'

import type { Outpost } from '../src/domain/models.ts'
import type { PlanetaryBodyReference } from '../src/domain/referenceData.ts'
import { translate } from '../src/localization/catalog.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import type { SupportedLocale } from '../src/localization/types.ts'
import { OutpostDetails } from '../src/ui/components/OutpostDetails.tsx'
import { SearchForItems } from '../src/ui/components/SearchForItems.tsx'
import {
  PowerEfficiencyIndicator,
} from '../src/ui/components/PowerEfficiencyIndicator.tsx'
import type { PowerEfficiencyState } from '../src/ui/powerEfficiencyPresentation.ts'

const noOp = vi.fn()

function localized(locale: SupportedLocale, children: ReactNode) {
  return render(<LocalizationContext value={{
    locale,
    automaticLocale: 'en-US',
    localeOverride: locale,
    setLocaleOverride: noOp,
    t: (key, parameters) => translate(locale, key, parameters),
  }}>{children}</LocalizationContext>)
}

const expectedFilledCounts: Record<PowerEfficiencyState, number> = {
  'very-poor': 1,
  poor: 2,
  normal: 3,
  good: 4,
  none: 0,
  unknown: 0,
}

describe('PowerEfficiencyIndicator', () => {
  for (const [state, expectedFilled] of Object.entries(expectedFilledCounts) as [PowerEfficiencyState, number][]) {
    test(`${state} renders the exact qualitative segment state`, () => {
      const { container } = render(<PowerEfficiencyIndicator state={state} />)
      const indicator = container.querySelector('[data-power-state]')
      const segments = container.querySelectorAll('.power-efficiency-indicator__segment')

      expect(indicator).toHaveAttribute('aria-hidden', 'true')
      expect(segments).toHaveLength(4)
      expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(expectedFilled)
      if (state === 'none') {
        expect(container.querySelector('.power-efficiency-indicator__none-marker')).toBeInTheDocument()
      } else {
        expect(container.querySelector('.power-efficiency-indicator__none-marker')).not.toBeInTheDocument()
      }
      if (state === 'unknown') {
        expect(container.querySelector('.power-efficiency-indicator__unknown-marker')).toBeInTheDocument()
      } else {
        expect(container.querySelector('.power-efficiency-indicator__unknown-marker')).not.toBeInTheDocument()
      }
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.queryByRole('meter')).not.toBeInTheDocument()
    })
  }
})

function makeOutpost(): Outpost {
  return {
    id: 'outpost',
    name: 'Alpha',
    systemId: 'system',
    bodyId: 'body',
    selectedBiomeIds: [],
    localResources: [],
    explicitResourcePresence: [],
    activeProduction: [],
    manufacturing: [],
    plannedSupply: [],
    cargoPads: [],
  }
}

function makeBody(solarArrayPower: number | null, windTurbinePower: number | null): PlanetaryBodyReference {
  return {
    id: 'body',
    systemId: 'system',
    name: 'Body',
    bodyType: 'planet',
    outpostAllowed: true,
    solarArrayPower,
    windTurbinePower,
    planetaryHabitationRank: 0,
  }
}

test('Outpost Details keeps full localized semantics on focusable outputs', () => {
  const { container } = localized('pl-PL', <OutpostDetails
    outpost={makeOutpost()}
    systems={[{ id: 'system', name: 'System' }]}
    bodies={[makeBody(4, 0)]}
    biomeGroups={[]}
    onNameCommit={noOp}
    onSystemChange={noOp}
    onBodyChange={noOp}
    onBiomeGroupToggle={noOp}
  />)

  expect(screen.getByText('Słońce')).toBeVisible()
  expect(screen.getByText('Wiatr')).toBeVisible()
  const outputs = [...container.querySelectorAll('output')]
  expect(outputs).toHaveLength(2)
  expect(outputs[0]).toHaveAttribute('tabindex', '0')
  expect(outputs[0]).toHaveAccessibleName(expect.stringContaining('Energia słoneczna: Słaba'))
  expect(outputs[1]).toHaveAccessibleName(expect.stringContaining('Energia wiatrowa: Brak'))
  expect(outputs[0].querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  expect(outputs[0]).not.toHaveTextContent(/0\.67|33%|1\/4/)
})

function SearchHarness() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <SearchForItems
    inputRef={inputRef}
    draftQuery=""
    matches={[]}
    highlightedMatchKey={null}
    isAutocompleteOpen={false}
    submittedItemName={null}
    results={[]}
    isResultsOpen={false}
    palettePosition={null}
    onDraftQueryChange={noOp}
    onHighlightChange={noOp}
    onAutocompleteOpenChange={noOp}
    onSubmit={noOp}
    onResultsOpenChange={noOp}
    onPalettePositionChange={noOp}
    onSelectOutpost={noOp}
  />
}

test.each([
  ['fr-FR', 'Rechercher…', 'Recherchez des ressources ou des produits dans vos avant-postes.'],
  ['de-DE', 'Suchen…', 'Suchen Sie nach Ressourcen oder Produkten in Ihren Außenposten.'],
] as const)('compact %s Search placeholder preserves the full accessible instruction', (
  locale,
  placeholder,
  accessibleName,
) => {
  localized(locale, <SearchHarness />)
  const input = screen.getByRole('combobox', { name: accessibleName })
  expect(input).toHaveAttribute('placeholder', placeholder)
})
