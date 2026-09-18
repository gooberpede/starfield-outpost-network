import { useRef, useState, type ReactNode } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { createDefaultNetworkCollection } from '../src/data/networkCollection.ts'
import { serializeNetworkCollection } from '../src/data/serialization.ts'
import { createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { CargoItem, Outpost } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'
import { translate } from '../src/localization/catalog.ts'
import { LocalizationContext, useLocalization } from '../src/localization/LocalizationContext.ts'
import type { LocalizationContextValue } from '../src/localization/LocalizationContext.ts'
import { LocalizationProvider } from '../src/localization/LocalizationProvider.tsx'
import type { SupportedLocale } from '../src/localization/types.ts'
import { CargoPadEditor } from '../src/ui/components/CargoPadEditor.tsx'
import { CargoPadsEditor } from '../src/ui/components/CargoPadsEditor.tsx'
import { CharacterHeader } from '../src/ui/components/CharacterHeader.tsx'
import { ContextHelp } from '../src/ui/components/ContextHelp.tsx'
import { OutpostDetails } from '../src/ui/components/OutpostDetails.tsx'
import { OutpostList } from '../src/ui/components/OutpostList.tsx'
import { OutpostStatusMatrix } from '../src/ui/components/OutpostStatusMatrix.tsx'
import { PlannedSupplyEditor } from '../src/ui/components/PlannedSupplyEditor.tsx'
import { SearchForItems } from '../src/ui/components/SearchForItems.tsx'
import { ValidationSummary } from '../src/ui/components/ValidationSummary.tsx'
import type { ItemSearchEntry } from '../src/ui/itemSearch.ts'
import { StatusBar } from '../src/ui/layout/StatusBar.tsx'
import { TitleBar } from '../src/ui/layout/TitleBar.tsx'
import { WorkspaceLayout } from '../src/ui/layout/WorkspaceLayout.tsx'

function localized(locale: SupportedLocale, children: ReactNode) {
  return render(
    <LocalizationContext value={{
      locale,
      automaticLocale: 'en-US',
      localeOverride: locale,
      setLocaleOverride: vi.fn(),
      t: (key, parameters) => translate(locale, key, parameters),
    }}>
      {children}
    </LocalizationContext>,
  )
}

function makeOutpost(id: string, name: string, padCount = 0): Outpost {
  return {
    id,
    name,
    systemId: '',
    bodyId: '',
    selectedBiomeIds: [],
    localResources: [],
    explicitResourcePresence: [],
    activeProduction: [],
    manufacturing: [],
    plannedSupply: [],
    cargoPads: Array.from({ length: padCount }, (_, index) => ({
      id: `${id}-pad-${index + 1}`,
      label: `Pad ${index + 1}`,
      type: index === 0 ? 'interstellar' : 'regular',
      outboundItems: [],
    })),
  }
}

const noOp = vi.fn()

describe('release accessibility semantics', () => {
  test('locale selector exposes its selected locale through a native semantic relationship', () => {
    localized('ja-JP', <TitleBar onAbout={noOp} />)

    const selector = screen.getByRole('combobox', { name: '言語と地域' })
    const description = document.getElementById(selector.getAttribute('aria-describedby')!)
    expect(selector).toHaveValue('ja-JP')
    expect(screen.getByRole('option', { name: 'English (US)' })).toHaveAttribute('lang', 'en-US')
    expect(screen.getByRole('option', { name: 'English (UK)' })).toHaveAttribute('lang', 'en-GB')
    const japaneseOption = screen.getByRole('option', { name: '日本語' })
    expect(japaneseOption).toHaveAttribute('lang', 'ja-JP')
    expect(japaneseOption).toHaveProperty('selected', true)
    expect(screen.getByRole('option', { name: '自動（EN-US）' })).toHaveAttribute('lang', 'ja-JP')
    expect(description).toHaveTextContent('言語と地域：日本語')
    expect(selector).toHaveAccessibleDescription('言語と地域：日本語')
  })

  test('Context Help associates opened localized content with its trigger', async () => {
    const user = userEvent.setup()
    localized('en-US', <ContextHelp context="Logistics" text="Cargo routes appear here." />)

    const trigger = screen.getByRole('button', { name: 'Help for Logistics' })
    expect(trigger).not.toHaveAttribute('aria-describedby')
    await user.click(trigger)
    const note = screen.getByRole('note')
    expect(trigger).toHaveAttribute('aria-controls', note.id)
    expect(trigger).toHaveAttribute('aria-describedby', note.id)
    expect(trigger).toHaveAccessibleDescription('Cargo routes appear here.')
  })

  test('Outpost Details exposes a localized named region without adding a main', () => {
    localized('en-US', <OutpostDetails
      outpost={makeOutpost('one', 'Alpha')}
      systems={[]} bodies={[]} biomeGroups={[]}
      onNameCommit={noOp} onSystemChange={noOp} onBodyChange={noOp}
      onBiomeGroupToggle={noOp}
    />)

    expect(screen.getByRole('region', { name: 'Outpost Details' })).toBeVisible()
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })

  test('character numeric drafts validate only on blur and announce one frame later', async () => {
    const user = userEvent.setup()
    const levelCommit = vi.fn()
    const skillCommit = vi.fn()
    const frameCallbacks: FrameRequestCallback[] = []
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.push(callback)
      return frameCallbacks.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(noOp)
    const character = createDefaultNetwork().character
    character.level = 12
    character.skills.outpostManagement = 2

    localized('en-US', <CharacterHeader
      character={character}
      onNameCommit={noOp}
      onLevelCommit={levelCommit}
      onSkillCommit={skillCommit}
    />)

    const statusRegion = screen.getByRole('status')
    const level = screen.getByRole('textbox', { name: 'Level' })
    const rank = screen.getByRole('textbox', { name: 'Outpost Management' })
    const planetaryRank = screen.getByRole('textbox', { name: 'Planetary Habitation' })

    // Slow typing remains a silent edit buffer until blur.
    await user.clear(level)
    await user.type(level, 'x')
    await user.type(level, 'y')
    expect(level).toHaveValue('xy')
    expect(level).not.toHaveAttribute('aria-invalid')
    expect(level).not.toHaveAttribute('aria-describedby')
    expect(statusRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(0)
    expect(levelCommit).not.toHaveBeenCalled()

    await user.tab()
    expect(level).toHaveValue('12')
    expect(document.activeElement).toBe(rank)
    expect(statusRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(1)
    act(() => frameCallbacks.shift()?.(0))
    expect(statusRegion).toHaveTextContent(
      'Invalid level. Restored to 12. Enter a level from 1 to 999.',
    )
    expect(levelCommit).not.toHaveBeenCalled()

    // A valid edit clears stale speech and still commits exactly once.
    await user.click(level)
    await user.clear(level)
    await user.type(level, '999')
    expect(statusRegion).toBeEmptyDOMElement()
    await user.tab()
    expect(levelCommit).toHaveBeenCalledOnce()
    expect(levelCommit).toHaveBeenLastCalledWith(999)
    expect(frameCallbacks).toHaveLength(0)
    expect(statusRegion).toBeEmptyDOMElement()

    // Fast multi-character typing is equally silent, then restores on blur.
    await user.clear(rank)
    await user.type(rank, '55')
    expect(rank).toHaveValue('55')
    expect(rank).not.toHaveAttribute('aria-invalid')
    expect(rank).not.toHaveAttribute('aria-describedby')
    expect(statusRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(0)
    expect(skillCommit).not.toHaveBeenCalled()
    await user.tab()
    expect(rank).toHaveValue('2')
    expect(document.activeElement).toBe(planetaryRank)
    expect(statusRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(1)
    act(() => frameCallbacks.shift()?.(0))
    expect(statusRegion).toHaveTextContent(
      'Invalid rank. Restored to 2. Enter a rank from 0 to 4.',
    )
    expect(skillCommit).not.toHaveBeenCalled()

    // Blank optional metadata commits null without rejection speech.
    await user.click(rank)
    await user.clear(rank)
    expect(statusRegion).toBeEmptyDOMElement()
    await user.tab()
    expect(skillCommit).toHaveBeenCalledOnce()
    expect(skillCommit).toHaveBeenLastCalledWith('outpostManagement', null)
    expect(frameCallbacks).toHaveLength(0)

    // Repeating an invalid blur updates the one stable region exactly once.
    skillCommit.mockClear()
    await user.click(rank)
    await user.type(rank, '6')
    await user.tab()
    expect(rank).toHaveValue('2')
    expect(statusRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(1)
    act(() => frameCallbacks.shift()?.(0))
    expect(screen.getAllByRole('status')).toEqual([statusRegion])
    expect(statusRegion).toHaveTextContent(
      'Invalid rank. Restored to 2. Enter a rank from 0 to 4.',
    )

    // Valid correction clears the prior announcement and commits once.
    await user.click(rank)
    await user.clear(rank)
    await user.type(rank, '4')
    expect(statusRegion).toBeEmptyDOMElement()
    await user.tab()
    expect(skillCommit).toHaveBeenCalledOnce()
    expect(skillCommit).toHaveBeenLastCalledWith('outpostManagement', 4)
    expect(frameCallbacks).toHaveLength(0)

    // A null prior value uses restoration wording that does not invent a rank.
    await user.click(planetaryRank)
    await user.type(planetaryRank, '5')
    await user.tab()
    expect(planetaryRank).toHaveValue('')
    expect(frameCallbacks).toHaveLength(1)
    act(() => frameCallbacks.shift()?.(0))
    expect(statusRegion).toHaveTextContent(
      'Invalid rank. Previous value restored. Enter a rank from 0 to 4.',
    )

    requestFrame.mockRestore()
    cancelFrame.mockRestore()
  })

  test('workspace exposes one main with labelled Navigation and Cargo regions', () => {
    localized('en-US', <main>
      <WorkspaceLayout
        left={<p>Outpost list</p>}
        middle={<p>Editing column</p>}
        right={<p>Cargo controls</p>}
        isNavigationOpen
        onShowNavigation={noOp}
        showNavigationControlRef={{ current: null }}
      />
    </main>)

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: 'Outposts' })).toBeVisible()
    expect(screen.getByRole('complementary', { name: 'Cargo Links' })).toBeVisible()
  })

  test('panel headings exclude adjacent controls and summary counts', () => {
    const outpost = makeOutpost('one', 'Alpha')
    localized('en-US', <>
      <OutpostList
        outposts={[outpost]} maxOutposts={8} selectedOutpostId="one"
        onSelectOutpost={noOp} onMoveOutpost={noOp} onMoveOutpostUp={noOp}
        onMoveOutpostDown={noOp} onAddOutpost={noOp} onDragActiveChange={noOp}
        onHideNavigation={noOp} hideNavigationControlRef={{ current: null }}
      />
      <PlannedSupplyEditor
        resources={[]} products={[]} plannedSupply={[]} actuallyAvailableItems={[]}
        onTogglePlannedSupply={noOp}
      />
      <CargoPadsEditor
        outpost={outpost} maxCargoPads={6} allOutposts={[outpost]} cargoLinks={[]}
        resources={[]} products={[]} availableItems={[]} actuallyAvailableItems={[]}
        onUnlinkCargoPad={noOp} onSetCargoLink={noOp} onAddCargoPad={noOp}
        onMoveCargoPad={noOp} onMoveCargoPadUp={noOp} onMoveCargoPadDown={noOp}
        onDeleteCargoPad={noOp} onToggleExport={noOp} onToggleCargoPadType={noOp}
      />
    </>)

    expect(screen.getByRole('heading', { name: 'Outposts' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Planned Supply' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Cargo Links' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Hide outpost navigation' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Expand Planned Supply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Help for Planned Supply' })).toBeVisible()
  })

  test('Resource Matrix uses owned row groups and retains interactive names and states', () => {
    const outpost = makeOutpost('one', 'Alpha')
    outpost.activeProduction = [{ type: 'inorganic', resourceId: 'iron' }]
    outpost.manufacturing = [{ productId: 'adaptive-frame', quantity: 1 }]
    const network = createDefaultNetwork()
    network.outposts = [outpost]
    const iron = {
      id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic' as const,
      rarity: 'common' as const, parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' as const,
    }
    const xTech = {
      id: 'x-tech', name: 'X-Tech', shortName: 'X', category: 'inorganic' as const,
      rarity: 'unique' as const, parentId: null, sortOrder: null, plannedSupplyPlacement: 'special' as const,
    }
    const adaptiveFrame = {
      id: 'adaptive-frame', name: 'Adaptive Frame', shortName: 'AF', rarity: 'common' as const,
    }
    const referenceData: ReferenceData = {
      biomes: [], bodyBiomes: [], inorganicOccurrences: [], species: [], planetSpecies: [],
      organicOccurrences: [], organicFarmingProfiles: [], systems: [], bodies: [],
      resources: [iron, xTech], products: [adaptiveFrame], bodyResources: [], productRecipes: [{
        productId: 'adaptive-frame',
        ingredients: [{ item: { type: 'resource', id: 'iron' }, quantity: 1 }],
      }],
    }
    localized('en-US', <OutpostStatusMatrix
      outpost={outpost} network={network} resources={[iron, xTech]} products={[adaptiveFrame]}
      referenceData={referenceData} availableItems={[]} actuallyAvailableItems={[
        { type: 'product', id: 'adaptive-frame' },
      ]}
      onToggleResource={noOp} onToggleExplicitResourcePresence={noOp}
      onToggleActiveProduction={noOp} onCommitManufacturing={noOp}
    />)

    const table = screen.getByRole('table', { name: 'Resource Matrix' })
    const rowGroups = within(table).getAllByRole('rowgroup')
    expect(rowGroups.length).toBeGreaterThanOrEqual(4)
    for (const rowGroup of rowGroups) {
      expect(Array.from(rowGroup.children).every((child) => child.getAttribute('role') === 'row')).toBe(true)
    }
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6)
    const present = screen.getByRole('button', { name: 'Toggle Present for Iron' })
    const producing = screen.getByRole('button', { name: 'Toggle Producing for Iron' })
    expect(present).toHaveAttribute('aria-pressed', 'false')
    expect(producing).toHaveAttribute('aria-pressed', 'true')
    present.focus()
    expect(document.activeElement).toBe(present)

    const passiveStates = table.querySelectorAll('.outpost-status-matrix__state:not(button)')
    expect(passiveStates.length).toBeGreaterThanOrEqual(2)
    for (const passiveState of passiveStates) expect(passiveState).not.toHaveAttribute('tabindex')
    const manufacturedState = within(table).getByText('AF').closest('.outpost-status-matrix__state')
    expect(manufacturedState).toHaveAccessibleName('Adaptive Frame: active')
    expect(manufacturedState).toHaveAccessibleDescription(
      'Adaptive Frame is being produced at this outpost.',
    )
    const manufacturingLabel = within(table).getByRole('rowheader', { name: 'Adaptive Frame' })
    expect(manufacturingLabel).not.toHaveClass('outpost-status-matrix__item--span-source')
    expect(manufacturingLabel).toHaveAttribute('title', 'Adaptive Frame')
    expect(manufacturingLabel.nextElementSibling).toHaveAttribute('role', 'cell')
    expect(manufacturingLabel.nextElementSibling).toBeEmptyDOMElement()

    const xTechAdd = screen.getByRole('button', { name: 'Add X-Tech as present' })
    const manufacturingEdit = screen.getByRole('button', { name: 'edit' })
    expect(xTechAdd).toHaveClass('outpost-status-matrix__compact-action')
    expect(xTechAdd).toHaveClass('outpost-status-matrix__add-explicit')
    expect(manufacturingEdit).toHaveClass('outpost-status-matrix__compact-action')
    expect(manufacturingEdit).not.toHaveClass('outpost-status-matrix__add-explicit')
  })

  test('Matrix Logistics cells contain passive localized export and import meanings', () => {
    const origin = makeOutpost('origin', 'Origin', 3)
    const alpha = makeOutpost('alpha', 'Alpha', 2)
    const beta = makeOutpost('beta', 'Beta', 1)
    origin.manufacturing = [
      { productId: 'no-export', quantity: 1 },
      { productId: 'one-destination', quantity: 1 },
      { productId: 'many-destinations', quantity: 1 },
    ]
    origin.cargoPads[0].outboundItems = [{ type: 'product', id: 'one-destination' }]
    origin.cargoPads[1].outboundItems = [{ type: 'product', id: 'many-destinations' }]
    origin.cargoPads[2].outboundItems = [{ type: 'product', id: 'many-destinations' }]
    alpha.cargoPads[0].outboundItems = [{ type: 'product', id: 'imported-product' }]
    const products = [
      { id: 'no-export', name: 'No Export', shortName: 'NE', rarity: 'common' as const },
      { id: 'one-destination', name: 'One Destination', shortName: 'OD', rarity: 'common' as const },
      { id: 'many-destinations', name: 'Many Destinations', shortName: 'MD', rarity: 'common' as const },
      { id: 'imported-product', name: 'Imported Product', shortName: 'IP', rarity: 'common' as const },
    ]
    const network = createDefaultNetwork()
    network.outposts = [origin, alpha, beta]
    network.cargoLinks = [
      { id: 'one', endpointA: { outpostId: 'origin', cargoPadId: 'origin-pad-1' }, endpointB: { outpostId: 'alpha', cargoPadId: 'alpha-pad-1' } },
      { id: 'many-alpha', endpointA: { outpostId: 'origin', cargoPadId: 'origin-pad-2' }, endpointB: { outpostId: 'alpha', cargoPadId: 'alpha-pad-2' } },
      { id: 'many-beta', endpointA: { outpostId: 'origin', cargoPadId: 'origin-pad-3' }, endpointB: { outpostId: 'beta', cargoPadId: 'beta-pad-1' } },
    ]
    const referenceData: ReferenceData = {
      biomes: [], bodyBiomes: [], inorganicOccurrences: [], species: [], planetSpecies: [],
      organicOccurrences: [], organicFarmingProfiles: [], systems: [], bodies: [], resources: [],
      products, bodyResources: [], productRecipes: [],
    }
    localized('en-US', <OutpostStatusMatrix
      outpost={origin} network={network} resources={[]} products={products}
      referenceData={referenceData} availableItems={[]} actuallyAvailableItems={[]}
      onToggleResource={noOp} onToggleExplicitResourcePresence={noOp}
      onToggleActiveProduction={noOp} onCommitManufacturing={noOp}
    />)

    const inactive = screen.getByRole('cell', { name: 'No Export is not being exported.' })
    const single = screen.getByRole('cell', { name: 'One Destination is being exported to Alpha.' })
    const multiple = screen.getByRole('cell', {
      name: 'Many Destinations is being exported to Alpha and Beta.',
    })
    const imported = screen.getByRole('cell', { name: 'Imported Product is being imported.' })
    expect(inactive).not.toHaveAttribute('aria-label')
    expect(within(inactive).getByText('No Export is not being exported.'))
      .toHaveClass('ui-visually-hidden')
    expect(single).toHaveTextContent('OD')
    expect(multiple).toHaveTextContent('MD')
    expect(imported).toHaveTextContent('IP')
    expect(within(single).getByText('One Destination is being exported to Alpha.'))
      .toHaveClass('ui-visually-hidden')
    expect(within(multiple).getByText('Many Destinations is being exported to Alpha and Beta.'))
      .toHaveClass('ui-visually-hidden')
    expect(within(imported).getByText('Imported Product is being imported.'))
      .toHaveClass('ui-visually-hidden')
    for (const logisticsCell of [inactive, single, multiple, imported]) {
      expect(logisticsCell).not.toHaveAttribute('aria-label')
      expect(logisticsCell).not.toHaveAttribute('tabindex')
      expect(within(logisticsCell).queryByRole('button')).not.toBeInTheDocument()
      expect(within(logisticsCell).queryByRole('checkbox')).not.toBeInTheDocument()
    }
    for (const [logisticsCell, abbreviation] of [
      [single, 'OD'],
      [multiple, 'MD'],
      [imported, 'IP'],
    ] as const) {
      expect(within(logisticsCell).getByText(abbreviation)
        .closest('.outpost-status-matrix__state')).toHaveAttribute('aria-hidden', 'true')
    }
  })

  test('Planned Supply retains neutral, planned, and unavailable semantics', async () => {
    const user = userEvent.setup()
    const products = [
      { id: 'neutral', name: 'Neutral', shortName: 'N', rarity: 'common' as const },
      { id: 'planned', name: 'Planned', shortName: 'P', rarity: 'common' as const },
      { id: 'available', name: 'Available', shortName: 'A', rarity: 'common' as const },
    ]
    function PlannedHarness() {
      const [plannedSupply, setPlannedSupply] = useState<CargoItem[]>([{ type: 'product', id: 'planned' }])
      return <PlannedSupplyEditor
        resources={[]} products={products} plannedSupply={plannedSupply}
        actuallyAvailableItems={[{ type: 'product', id: 'available' }]}
        onTogglePlannedSupply={(item) => setPlannedSupply((current) =>
          current.some((candidate) => candidate.id === item.id)
            ? current.filter((candidate) => candidate.id !== item.id)
            : [...current, item])}
      />
    }
    const { container } = localized('en-US', <PlannedHarness />)

    await user.click(screen.getByRole('button', { name: 'Expand Planned Supply' }))
    const catalogue = container.querySelector('.planned-supply__catalogue')!
    const neutral = catalogue.querySelector('button[title="Neutral"]')
    const planned = catalogue.querySelector('button[title="Planned"]')
    const available = catalogue.querySelector('button[title="Available"]')
    expect(neutral).toHaveAttribute('data-state', 'neither')
    expect(neutral).toHaveAttribute('aria-pressed', 'false')
    expect(neutral).toHaveAttribute('aria-disabled', 'false')
    expect(neutral).toHaveAccessibleName('Neutral')
    expect(planned).toHaveAttribute('data-state', 'planned')
    expect(planned).toHaveAttribute('aria-pressed', 'true')
    expect(planned).toHaveAttribute('aria-disabled', 'false')
    expect(planned).toHaveAccessibleName('Planned')
    expect(available).toHaveAttribute('data-state', 'available')
    expect(available).toHaveAttribute('aria-disabled', 'true')
    expect(available).toHaveAttribute('aria-pressed', 'false')
    expect(available).toHaveAccessibleName('Available')
    expect(catalogue.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(0)
    await user.click(neutral!)
    expect(neutral).toHaveAttribute('aria-pressed', 'true')
    expect(neutral).toHaveAccessibleName('Neutral')
  })

  test('remote Cargo Link options keep abbreviations visible and expose full names', async () => {
    const user = userEvent.setup()
    const local = makeOutpost('local', 'Alpha', 1)
    const remote = makeOutpost('remote', 'Beta', 1)
    remote.cargoPads[0].outboundItems = [{ type: 'product', id: 'microsecond-regulator' }]
    localized('en-US', <CargoPadsEditor
      outpost={local} maxCargoPads={6} allOutposts={[local, remote]} cargoLinks={[]}
      resources={[]} products={[{
        id: 'microsecond-regulator', name: 'Microsecond Regulator', shortName: 'MRg', rarity: 'rare',
      }]} availableItems={[]} actuallyAvailableItems={[]}
      onUnlinkCargoPad={noOp} onSetCargoLink={noOp} onAddCargoPad={noOp}
      onMoveCargoPad={noOp} onMoveCargoPadUp={noOp} onMoveCargoPadDown={noOp}
      onDeleteCargoPad={noOp} onToggleExport={noOp} onToggleCargoPadType={noOp}
    />)

    await user.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Destination outpost' }), 'remote')
    const option = screen.getByRole('option', { name: 'Cargo Link 1: (Microsecond Regulator)' })
    expect(option).toHaveTextContent('Cargo Link 1: (MRg)')
  })

  test('compact Add controls keep concise copy and full contextual names', async () => {
    const user = userEvent.setup()
    const outposts = [makeOutpost('one', 'Alpha', 2), makeOutpost('two', 'Beta')]
    localized('en-US', <>
      <OutpostList
        outposts={outposts}
        maxOutposts={8}
        selectedOutpostId="one"
        onSelectOutpost={noOp}
        onMoveOutpost={noOp}
        onMoveOutpostUp={noOp}
        onMoveOutpostDown={noOp}
        onAddOutpost={noOp}
        onDragActiveChange={noOp}
        onHideNavigation={noOp}
        hideNavigationControlRef={{ current: null }}
      />
      <CargoPadsEditor
        outpost={outposts[0]}
        maxCargoPads={6}
        allOutposts={outposts}
        cargoLinks={[]}
        resources={[]}
        products={[]}
        availableItems={[]}
        actuallyAvailableItems={[]}
        onUnlinkCargoPad={noOp}
        onSetCargoLink={noOp}
        onAddCargoPad={noOp}
        onMoveCargoPad={noOp}
        onMoveCargoPadUp={noOp}
        onMoveCargoPadDown={noOp}
        onDeleteCargoPad={noOp}
        onToggleExport={noOp}
        onToggleCargoPadType={noOp}
      />
    </>)

    const addOutpost = screen.getByRole('button', { name: '+ Add Outpost' })
    const addCargo = screen.getByRole('button', { name: '+ Add Cargo Link' })
    expect(addOutpost).toHaveTextContent('+ Add')
    expect(addOutpost).toHaveAttribute('title', '+ Add Outpost')
    expect(addCargo).toHaveTextContent('+ Add')
    expect(addCargo).toHaveAttribute('title', '+ Add Cargo Link')
    addOutpost.focus()
    await user.keyboard('{Enter}')
    expect(noOp).toHaveBeenCalled()
  })

  test('Inter-System marker is semantic, non-focusable, and hides its glyph', () => {
    const outpost = makeOutpost('one', 'Alpha', 2)
    localized('ja-JP', <CargoPadsEditor
      outpost={outpost} maxCargoPads={6} allOutposts={[outpost]} cargoLinks={[]}
      resources={[]} products={[]} availableItems={[]} actuallyAvailableItems={[]}
      onUnlinkCargoPad={noOp} onSetCargoLink={noOp} onAddCargoPad={noOp}
      onMoveCargoPad={noOp} onMoveCargoPadUp={noOp} onMoveCargoPadDown={noOp}
      onDeleteCargoPad={noOp} onToggleExport={noOp} onToggleCargoPadType={noOp}
    />)

    const marker = screen.getByRole('img', { name: '星系間貨物リンク' })
    expect(marker).not.toHaveAttribute('tabindex')
    expect(marker).not.toHaveTextContent('[INT]')
    expect(marker.querySelector('[aria-hidden="true"]')).toHaveTextContent('✷⇄✷')
  })

  test('collapsed Cargo Links expose one localized full-name semantic summary', () => {
    const alpha = makeOutpost('alpha', 'Alpha', 2)
    const beta = makeOutpost('beta', 'Feynman I', 1)
    alpha.cargoPads[0].outboundItems = [
      { type: 'resource', id: 'lithium' },
      { type: 'resource', id: 'copper' },
    ]
    beta.cargoPads[0].outboundItems = [{ type: 'product', id: 'adaptive-frame' }]
    const resources = [
      { id: 'lithium', name: 'Lithium', shortName: 'Li', category: 'inorganic' as const, rarity: 'common' as const, parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' as const },
      { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic' as const, rarity: 'common' as const, parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' as const },
    ]
    const products = [{ id: 'adaptive-frame', name: 'Adaptive Frame', shortName: 'AF', rarity: 'common' as const }]
    localized('en-US', <CargoPadsEditor
      outpost={alpha} maxCargoPads={6} allOutposts={[alpha, beta]}
      cargoLinks={[{ id: 'link', endpointA: { outpostId: 'alpha', cargoPadId: 'alpha-pad-1' }, endpointB: { outpostId: 'beta', cargoPadId: 'beta-pad-1' } }]}
      resources={resources} products={products} availableItems={[]} actuallyAvailableItems={[]}
      onUnlinkCargoPad={noOp} onSetCargoLink={noOp} onAddCargoPad={noOp}
      onMoveCargoPad={noOp} onMoveCargoPadUp={noOp} onMoveCargoPadDown={noOp}
      onDeleteCargoPad={noOp} onToggleExport={noOp} onToggleCargoPadType={noOp}
    />)

    const interSystemDisclosure = screen.getByRole('button', { name: 'Expand Cargo Link 1' })
    expect(interSystemDisclosure).toHaveAccessibleDescription(
      'Destination Feynman I. Outbound: Lithium and Copper. Inbound: Adaptive Frame. Inter-System Cargo Link.',
    )
    const standardDisclosure = screen.getByRole('button', { name: 'Expand Cargo Link 2' })
    expect(standardDisclosure).toHaveAccessibleDescription(
      'Destination Unlinked. Outbound: No outbound cargo. Inbound: No inbound cargo. Standard Cargo Link.',
    )
    expect(document.querySelectorAll('.cargo-pad__summary-cargo [tabindex]')).toHaveLength(0)
  })

  test('pointer drag handles leave Tab order while move buttons stay labelled buttons', async () => {
    const user = userEvent.setup()
    const outposts = [makeOutpost('one', 'Alpha', 3), makeOutpost('two', 'Beta')]
    const { container } = localized('en-US', <>
      <OutpostList
        outposts={outposts} maxOutposts={8} selectedOutpostId="one"
        onSelectOutpost={noOp} onMoveOutpost={noOp} onMoveOutpostUp={noOp}
        onMoveOutpostDown={noOp} onAddOutpost={noOp} onDragActiveChange={noOp}
        onHideNavigation={noOp} hideNavigationControlRef={{ current: null }}
      />
      <CargoPadsEditor
        outpost={outposts[0]} maxCargoPads={6} allOutposts={outposts} cargoLinks={[]}
        resources={[]} products={[]} availableItems={[]} actuallyAvailableItems={[]}
        onUnlinkCargoPad={noOp} onSetCargoLink={noOp} onAddCargoPad={noOp}
        onMoveCargoPad={noOp} onMoveCargoPadUp={noOp} onMoveCargoPadDown={noOp}
        onDeleteCargoPad={noOp} onToggleExport={noOp} onToggleCargoPadType={noOp}
      />
    </>)

    const reshuffleButtons = screen.getAllByRole('button', { name: 'Reshuffle' })
    await user.click(reshuffleButtons[0])
    await user.click(reshuffleButtons[1])
    const handles = container.querySelectorAll('[draggable="true"]')
    expect(handles).toHaveLength(5)
    for (const handle of handles) {
      expect(handle).toHaveAttribute('tabindex', '-1')
      expect(handle).toHaveAttribute('aria-hidden', 'true')
    }
    const moveOutpostUp = screen.getByRole('button', { name: 'Move Beta up' })
    const moveCargoUp = screen.getByRole('button', { name: 'Move Cargo Link 2 up' })
    expect(moveOutpostUp).toBeEnabled()
    expect(moveCargoUp).toBeEnabled()
    moveCargoUp.focus()
    expect(document.activeElement).toBe(moveCargoUp)
  })

  test('validation rows include localized severity text', async () => {
    const user = userEvent.setup()
    const issue: ValidationIssue = {
      ruleId: 'outpost-name-length',
      category: 'structural',
      severity: 'warning',
      messageKey: 'validation.outpostNameLength',
    }
    localized('ja-JP', <ValidationSummary
      issues={[issue]} outposts={[]} referenceData={null} onNavigateToIssue={noOp}
    />)
    const trigger = screen.getByRole('button', { name: '検証：1件の問題' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('region', { name: '検証' })
    expect(trigger).toHaveAttribute('aria-controls', panel.id)
    const row = screen.getByRole('listitem')
    const message = row.querySelector('.validation-summary-panel__message')
    const severity = within(row).getByText('警告:')
    expect(message).toHaveTextContent(`警告: ${translate('ja-JP', 'validation.outpostNameLength')}`)
    expect(severity.parentElement).toBe(message)
    expect(severity.tagName).toBe('SPAN')
    expect(row.className).toContain('warning')
  })

  test('status feedback updates stable polite and assertive text-only live regions', () => {
    const contextValue: LocalizationContextValue = {
      locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
      setLocaleOverride: noOp, t: (key, parameters) => translate('en-US', key, parameters),
    }
    const { rerender } = render(<LocalizationContext value={contextValue}>
      <StatusBar main="Ready" />
    </LocalizationContext>)
    const politeLiveRegion = screen.getByRole('status')
    const assertiveLiveRegion = screen.getByRole('alert')
    expect(politeLiveRegion).toBeEmptyDOMElement()
    expect(assertiveLiveRegion).toBeEmptyDOMElement()

    rerender(<LocalizationContext value={contextValue}><StatusBar
      main="Ready" message={{ kind: 'success', content: 'Imported collection.json' }}
    /></LocalizationContext>)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('status')).toBe(politeLiveRegion)
    expect(screen.getByRole('alert')).toBe(assertiveLiveRegion)
    expect(politeLiveRegion).toHaveAttribute('aria-live', 'polite')
    expect(politeLiveRegion).toHaveAttribute('aria-atomic', 'true')
    expect(assertiveLiveRegion).toHaveAttribute('aria-live', 'assertive')
    expect(assertiveLiveRegion).toHaveAttribute('aria-atomic', 'true')
    expect(politeLiveRegion).toHaveTextContent('Imported collection.json')
    expect(assertiveLiveRegion).toBeEmptyDOMElement()

    rerender(<LocalizationContext value={contextValue}><StatusBar main="Ready" message={{
      kind: 'error', content: 'Import failed', onDismiss: noOp,
    }} /></LocalizationContext>)
    expect(screen.getByRole('status')).toBe(politeLiveRegion)
    expect(screen.getByRole('alert')).toBe(assertiveLiveRegion)
    expect(politeLiveRegion).toBeEmptyDOMElement()
    expect(assertiveLiveRegion).toHaveTextContent('Import failed')
    expect(within(politeLiveRegion).queryByRole('button')).not.toBeInTheDocument()
    expect(within(assertiveLiveRegion).queryByRole('button')).not.toBeInTheDocument()
    const dismissButton = screen.getByRole('button', { name: 'Dismiss status message' })
    expect(dismissButton).toBeVisible()
    expect(politeLiveRegion).not.toContainElement(dismissButton)
    expect(assertiveLiveRegion).not.toContainElement(dismissButton)

    rerender(<LocalizationContext value={contextValue}><StatusBar
      main="Ready" message={{ kind: 'success', content: 'Exported collection.json' }}
    /></LocalizationContext>)
    expect(screen.getByRole('status')).toBe(politeLiveRegion)
    expect(screen.getByRole('alert')).toBe(assertiveLiveRegion)
    expect(politeLiveRegion).toHaveTextContent('Exported collection.json')
    expect(assertiveLiveRegion).toBeEmptyDOMElement()

    rerender(<LocalizationContext value={contextValue}><StatusBar
      main="Ready" message={{ kind: 'error', content: 'Export failed' }}
    /></LocalizationContext>)
    expect(screen.getByRole('status')).toBe(politeLiveRegion)
    expect(screen.getByRole('alert')).toBe(assertiveLiveRegion)
    expect(politeLiveRegion).toBeEmptyDOMElement()
    expect(assertiveLiveRegion).toHaveTextContent('Export failed')
  })

  test('deferred import failure stays visible while its alert waits for focus and a frame', () => {
    const frameCallbacks: FrameRequestCallback[] = []
    const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.push(callback)
      return frameCallbacks.length
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(noOp)

    localized('en-US', <StatusBar
      main="Ready"
      message={{
        kind: 'error',
        content: 'Import failed immediately',
        announcementText: 'Import failed immediately',
        announcementId: 1,
        deferAssertiveUntilWindowFocus: true,
        onDismiss: noOp,
      }}
    />)

    const politeLiveRegion = screen.getByRole('status')
    const assertiveLiveRegion = screen.getByRole('alert')
    const visibleMessage = document.querySelector('.status-bar__message')
    expect(visibleMessage).toHaveTextContent('Import failed immediately')
    expect(politeLiveRegion).toBeEmptyDOMElement()
    expect(assertiveLiveRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(0)

    fireEvent.focus(window)
    expect(assertiveLiveRegion).toBeEmptyDOMElement()
    expect(frameCallbacks).toHaveLength(1)

    act(() => frameCallbacks[0](0))
    expect(assertiveLiveRegion).toHaveTextContent('Import failed immediately')
    expect(politeLiveRegion).toBeEmptyDOMElement()

    fireEvent.focus(window)
    expect(frameCallbacks).toHaveLength(1)
    expect(within(assertiveLiveRegion).getAllByText('Import failed immediately')).toHaveLength(1)

    hasFocus.mockRestore()
    requestFrame.mockRestore()
    cancelFrame.mockRestore()
  })

  test('cargo controls expose unfuelled and stale-export descriptions and tooltips', () => {
    const pad = {
      id: 'pad', label: 'Pad 1', type: 'interstellar' as const,
      outboundItems: [{ type: 'resource' as const, id: 'iron' }],
    }
    localized('en-US', <CargoPadEditor
      pad={pad} displayLabel="Cargo Link 1" outposts={[makeOutpost('one', 'Alpha')]}
      currentOutpostId="one" onRemove={noOp} onToggleExport={noOp}
      onToggleType={noOp} resources={[
        { id: 'helium-3', name: 'Helium-3', shortName: 'He-3', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
        { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
        { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
      ]} products={[]} availableItems={[{ type: 'resource', id: 'copper' }]} actuallyAvailableItems={[]}
      linkedOutpostId="" linkedCargoPadId="" onLinkedOutpostChange={noOp}
      onLinkedCargoPadChange={noOp} getDestinationPadLabel={() => ''}
    />)

    const interSystem = screen.getByRole('button', { name: 'Inter-System' })
    const fuelDescription = document.getElementById(interSystem.getAttribute('aria-describedby')!)
    expect(fuelDescription).toHaveTextContent('Helium-3 is not available at this outpost.')
    expect(interSystem).toHaveAccessibleDescription('Helium-3 is not available at this outpost.')
    expect(interSystem).toHaveAttribute(
      'title',
      'Inter-System Cargo Link · Helium-3 is not available at this outpost.',
    )
    const staleExport = screen.getByRole('button', { name: 'Toggle export for Iron' })
    expect(staleExport).toHaveAttribute('aria-pressed', 'true')
    expect(staleExport).toHaveAttribute('data-state', 'stale')
    const staleDescription = document.getElementById(staleExport.getAttribute('aria-describedby')!)
    expect(staleDescription).toHaveTextContent('This cargo export has no actual source.')
    expect(staleExport).toHaveAccessibleDescription('This cargo export has no actual source.')
    expect(staleExport).toHaveAttribute(
      'title',
      'Iron · This cargo export has no actual source.',
    )
    const normalExport = screen.getByRole('button', { name: 'Toggle export for Copper' })
    expect(normalExport).toHaveAttribute('aria-pressed', 'false')
    expect(normalExport).toHaveAttribute('title', 'Copper')
    expect(normalExport).not.toHaveAttribute('aria-describedby')
  })

  test('fuelled Inter-System state has an associated description', () => {
    const helium3 = { type: 'resource' as const, id: 'helium-3' }
    localized('en-US', <CargoPadEditor
      pad={{ id: 'pad', label: 'Pad 1', type: 'interstellar', outboundItems: [] }}
      displayLabel="Cargo Link 1" outposts={[makeOutpost('one', 'Alpha')]}
      currentOutpostId="one" onRemove={noOp} onToggleExport={noOp}
      onToggleType={noOp} resources={[
        { id: 'helium-3', name: 'Helium-3', shortName: 'He-3', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
      ]} products={[]} availableItems={[helium3]} actuallyAvailableItems={[helium3]}
      linkedOutpostId="" linkedCargoPadId="" onLinkedOutpostChange={noOp}
      onLinkedCargoPadChange={noOp} getDestinationPadLabel={() => ''}
    />)
    const button = screen.getByRole('button', { name: 'Inter-System' })
    expect(document.getElementById(button.getAttribute('aria-describedby')!))
      .toHaveTextContent('Helium-3 is available at this outpost.')
    expect(button).toHaveAccessibleDescription('Helium-3 is available at this outpost.')
    expect(button).toHaveAttribute(
      'title',
      'Inter-System Cargo Link · Helium-3 is available at this outpost.',
    )
  })

  test('standard Cargo Link toggle keeps a concise visible tooltip without a fuel description', () => {
    localized('en-US', <CargoPadEditor
      pad={{ id: 'pad', label: 'Pad 1', type: 'regular', outboundItems: [] }}
      displayLabel="Cargo Link 1" outposts={[makeOutpost('one', 'Alpha')]}
      currentOutpostId="one" onRemove={noOp} onToggleExport={noOp}
      onToggleType={noOp} resources={[]} products={[]} availableItems={[]}
      actuallyAvailableItems={[]} linkedOutpostId="" linkedCargoPadId=""
      onLinkedOutpostChange={noOp} onLinkedCargoPadChange={noOp}
      getDestinationPadLabel={() => ''}
    />)
    const button = screen.getByRole('button', { name: 'Inter-System' })
    expect(button).toHaveAttribute('title', 'Inter-System Cargo Link')
    expect(button).not.toHaveAttribute('aria-describedby')
  })
})

test('Search exposes localized options and preserves keyboard combobox behavior', async () => {
  const user = userEvent.setup()
  const matches: ItemSearchEntry[] = [
    {
      item: { type: 'resource', id: 'iron' }, key: 'resource:iron', displayName: '鉄',
      abbreviation: 'Fe', category: 'resource', normalizedName: '鉄',
      normalizedAbbreviation: 'fe', aliases: [{ kind: 'canonical-en', value: 'Iron', normalizedValue: 'iron' }],
      needsCategoryDisambiguator: true,
    },
    {
      item: { type: 'product', id: 'iron' }, key: 'product:iron', displayName: '鉄製部品',
      abbreviation: 'FeP', category: 'product', normalizedName: '鉄製部品',
      normalizedAbbreviation: 'fep', aliases: [], needsCategoryDisambiguator: true,
    },
  ]
  const submitted = vi.fn()

  function Harness() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [highlighted, setHighlighted] = useState<string | null>(null)
    const [open, setOpen] = useState(true)
    return <SearchForItems
      inputRef={inputRef} draftQuery="鉄" matches={matches}
      highlightedMatchKey={highlighted} isAutocompleteOpen={open}
      submittedItemName={null} results={[]} isResultsOpen={false} palettePosition={null}
      onDraftQueryChange={noOp} onHighlightChange={setHighlighted}
      onAutocompleteOpenChange={setOpen} onSubmit={submitted}
      onResultsOpenChange={noOp} onPalettePositionChange={noOp} onSelectOutpost={noOp}
    />
  }

  localized('ja-JP', <Harness />)
  const input = screen.getByRole('combobox', { name: '拠点の資源または製造品を検索します。' })
  expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
  expect(screen.getByRole('option', { name: /鉄 Fe\s*資源/ })).toBeVisible()
  expect(screen.queryByText('Iron')).not.toBeInTheDocument()
  await user.click(input)
  await user.keyboard('{ArrowDown}')
  expect(input.getAttribute('aria-activedescendant')).toContain('resource-iron')
  await user.keyboard('{Escape}')
  expect(input).toHaveAttribute('aria-expanded', 'false')
  fireEvent.focus(input)
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
  expect(submitted).toHaveBeenCalledWith({ type: 'product', id: 'iron' })
  expect(input).toHaveAttribute('aria-expanded', 'false')
})

test('Search button and Enter share deterministic zero, one, and highlighted-match submission', async () => {
  const user = userEvent.setup()
  const matches: ItemSearchEntry[] = [
    { item: { type: 'resource', id: 'iron' }, key: 'resource:iron', displayName: 'Iron', abbreviation: 'Fe', category: 'resource', normalizedName: 'iron', normalizedAbbreviation: 'fe', aliases: [], needsCategoryDisambiguator: false },
    { item: { type: 'resource', id: 'copper' }, key: 'resource:copper', displayName: 'Copper', abbreviation: 'Cu', category: 'resource', normalizedName: 'copper', normalizedAbbreviation: 'cu', aliases: [], needsCategoryDisambiguator: false },
  ]
  const submitted = vi.fn()

  function Harness() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [currentMatches, setCurrentMatches] = useState<ItemSearchEntry[]>([])
    const [highlighted, setHighlighted] = useState<string | null>(null)
    return <>
      <button onClick={() => { setCurrentMatches([]); setHighlighted(null) }}>zero</button>
      <button onClick={() => { setCurrentMatches([matches[0]]); setHighlighted(null) }}>one</button>
      <button onClick={() => { setCurrentMatches(matches); setHighlighted(null) }}>many</button>
      <SearchForItems
        inputRef={inputRef} draftQuery="item" matches={currentMatches}
        highlightedMatchKey={highlighted} isAutocompleteOpen
        submittedItemName={null} results={[]} isResultsOpen={false} palettePosition={null}
        onDraftQueryChange={noOp} onHighlightChange={setHighlighted}
        onAutocompleteOpenChange={noOp} onSubmit={submitted}
        onResultsOpenChange={noOp} onPalettePositionChange={noOp} onSelectOutpost={noOp}
      />
    </>
  }

  localized('en-US', <Harness />)
  const input = screen.getByRole('combobox')
  const submit = screen.getByRole('button', { name: 'Search for item' })
  expect(submit).toBeDisabled()
  input.focus()
  await user.keyboard('{Enter}')
  expect(submitted).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'one' }))
  expect(submit).toBeEnabled()
  await user.click(submit)
  expect(submitted).toHaveBeenLastCalledWith(matches[0].item)
  submitted.mockClear()
  input.focus()
  await user.keyboard('{Enter}')
  expect(submitted).toHaveBeenLastCalledWith(matches[0].item)

  submitted.mockClear()
  await user.click(screen.getByRole('button', { name: 'many' }))
  expect(submit).toBeDisabled()
  input.focus()
  await user.keyboard('{Enter}')
  expect(submitted).not.toHaveBeenCalled()
  await user.keyboard('{ArrowDown}')
  expect(submit).toBeEnabled()
  await user.click(submit)
  expect(submitted).toHaveBeenLastCalledWith(matches[0].item)
})

test('keyboard Search submission focuses the portalled results and restores Search on close', async () => {
  const user = userEvent.setup()
  const match: ItemSearchEntry = {
    item: { type: 'resource', id: 'iron' },
    key: 'resource:iron',
    displayName: 'Iron',
    abbreviation: 'Fe',
    category: 'resource',
    normalizedName: 'iron',
    normalizedAbbreviation: 'fe',
    aliases: [],
    needsCategoryDisambiguator: false,
  }

  function Harness() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [highlighted, setHighlighted] = useState<string | null>(null)
    const [autocompleteOpen, setAutocompleteOpen] = useState(true)
    const [submittedName, setSubmittedName] = useState<string | null>(null)
    const [resultsOpen, setResultsOpen] = useState(false)
    return <SearchForItems
      inputRef={inputRef}
      draftQuery="Iron"
      matches={[match]}
      highlightedMatchKey={highlighted}
      isAutocompleteOpen={autocompleteOpen}
      submittedItemName={submittedName}
      results={[{ outpostId: 'outpost', outpostName: 'Alpha', flags: ['present'] }]}
      isResultsOpen={resultsOpen}
      palettePosition={{ left: 20, top: 20 }}
      onDraftQueryChange={noOp}
      onHighlightChange={setHighlighted}
      onAutocompleteOpenChange={setAutocompleteOpen}
      onSubmit={() => {
        setSubmittedName('Iron')
        setResultsOpen(true)
      }}
      onResultsOpenChange={setResultsOpen}
      onPalettePositionChange={noOp}
      onSelectOutpost={noOp}
    />
  }

  localized('en-US', <Harness />)
  const input = screen.getByRole('combobox', {
    name: 'Search for resources or products in your outposts.',
  })
  input.focus()
  await user.keyboard('{ArrowDown}{Enter}')
  const results = screen.getByRole('region', { name: 'Search Results' })
  expect(results.parentElement).toBe(document.body)
  expect(results).toHaveAttribute('tabindex', '-1')
  expect(document.activeElement).toBe(results)

  await user.click(screen.getByRole('button', { name: 'Close Search Results' }))
  expect(screen.queryByRole('region', { name: 'Search Results' })).not.toBeInTheDocument()
  expect(document.activeElement).toBe(input)

  await user.keyboard('{ArrowDown}{Enter}')
  expect(document.activeElement).toBe(screen.getByRole('region', { name: 'Search Results' }))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('region', { name: 'Search Results' })).not.toBeInTheDocument()
  expect(document.activeElement).toBe(input)
})

test('provider locale switches do not mutate network selection, outpost context, data, or history', async () => {
  const user = userEvent.setup()
  const collection = createDefaultNetworkCollection()
  collection.networks[0].network.outposts = [makeOutpost('selected-outpost', 'Selected')]
  const session = createCollectionEditingSession(collection)
  const collectionBefore = structuredClone(session.collection)
  const historyBefore = structuredClone(session.history)
  const serializedBefore = serializeNetworkCollection(session.collection)

  function Switcher() {
    const { locale, setLocaleOverride } = useLocalization()
    return <div>
      <output>{locale}</output>
      {(['en-US', 'en-GB', 'ja-JP'] as const).map((candidate) =>
        <button key={candidate} onClick={() => setLocaleOverride(candidate)}>{candidate}</button>)}
    </div>
  }

  render(<LocalizationProvider><Switcher /></LocalizationProvider>)
  for (const locale of ['en-US', 'en-GB', 'ja-JP']) {
    await user.click(screen.getByRole('button', { name: locale }))
    expect(screen.getByText(locale, { selector: 'output' })).toBeVisible()
    expect(session.collection).toEqual(collectionBefore)
    expect(session.context).toEqual({
      networkId: collection.activeNetworkId,
      outpostId: 'selected-outpost',
    })
    expect(session.history).toEqual(historyBefore)
    expect(serializeNetworkCollection(session.collection)).toBe(serializedBefore)
  }
})
