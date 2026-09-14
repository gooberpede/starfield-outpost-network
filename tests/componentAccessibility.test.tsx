import { useRef, useState, type ReactNode } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { createDefaultNetworkCollection } from '../src/data/networkCollection.ts'
import { serializeNetworkCollection } from '../src/data/serialization.ts'
import { createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'
import type { Outpost } from '../src/domain/models.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'
import { translate } from '../src/localization/catalog.ts'
import { LocalizationContext, useLocalization } from '../src/localization/LocalizationContext.ts'
import type { LocalizationContextValue } from '../src/localization/LocalizationContext.ts'
import { LocalizationProvider } from '../src/localization/LocalizationProvider.tsx'
import type { SupportedLocale } from '../src/localization/types.ts'
import { CargoPadEditor } from '../src/ui/components/CargoPadEditor.tsx'
import { CargoPadsEditor } from '../src/ui/components/CargoPadsEditor.tsx'
import { OutpostList } from '../src/ui/components/OutpostList.tsx'
import { SearchForItems } from '../src/ui/components/SearchForItems.tsx'
import { ValidationSummary } from '../src/ui/components/ValidationSummary.tsx'
import type { ItemSearchEntry } from '../src/ui/itemSearch.ts'
import { StatusBar } from '../src/ui/layout/StatusBar.tsx'

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
    await user.click(screen.getByRole('button', { name: '検証：1件の問題' }))
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
    const staleDescription = document.getElementById(staleExport.getAttribute('aria-describedby')!)
    expect(staleDescription).toHaveTextContent('This cargo export has no actual source.')
    expect(staleExport).toHaveAccessibleDescription('This cargo export has no actual source.')
    expect(staleExport).toHaveAttribute(
      'title',
      'Iron · This cargo export has no actual source.',
    )
    const normalExport = screen.getByRole('button', { name: 'Toggle export for Copper' })
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
  const session = createCollectionEditingSession(collection, {
    networkId: collection.activeNetworkId,
    outpostId: 'selected-outpost',
  })
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
