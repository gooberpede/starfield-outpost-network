import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from '../src/App.tsx'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'
import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import type { NetworkCollection } from '../src/data/networkCollection.ts'

const referenceData: ReferenceData = {
  systems: [], bodies: [], bodyResources: [], resources: [], products: [],
  productRecipes: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
}

function mount() {
  return render(<LocalizationContext value={{
    locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
    setLocaleOverride: vi.fn(), t: (key, parameters) => translate('en-US', key, parameters),
  }}><App referenceData={referenceData} /></LocalizationContext>)
}

function seedCargoPads(...padCounts: number[]) {
  const network = createDefaultNetwork()
  network.outposts = padCounts.map((padCount, outpostIndex) => ({
    ...createDefaultOutpost([], `outpost-${outpostIndex + 1}`, `Outpost ${outpostIndex + 1}`),
    cargoPads: Array.from({ length: padCount }, (_, padIndex) => ({
      id: `pad-${outpostIndex + 1}-${padIndex + 1}`,
      label: `Pad ${padIndex + 1}`,
      type: 'regular' as const,
      outboundItems: [],
    })),
  }))
  const collection: NetworkCollection = {
    schemaVersion: 1,
    networks: [{ id: 'network-1', network }],
    activeNetworkId: 'network-1',
  }
  localStorage.setItem('starfield-outpost-network', JSON.stringify(collection))
}

function cargoDisclosures() {
  return screen.getAllByRole('button', { name: /^(?:Expand|Collapse) Cargo Link \d+$/ })
}

function cargoDisclosureStates() {
  return cargoDisclosures().map((button) => button.getAttribute('aria-expanded'))
}

test('failed source survives mount and passive render; an edit allows replacement', async () => {
  localStorage.setItem('starfield-outpost-network', '{malformed')
  const write = vi.spyOn(Storage.prototype, 'setItem')
  const view = mount()
  expect(screen.getByText(/Saved browser data could not be restored/)).toBeInTheDocument()
  expect(localStorage.getItem('starfield-outpost-network')).toBe('{malformed')
  expect(write).not.toHaveBeenCalled()
  view.rerender(<LocalizationContext value={{
    locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
    setLocaleOverride: vi.fn(), t: (key, parameters) => translate('en-US', key, parameters),
  }}><App referenceData={referenceData} /></LocalizationContext>)
  expect(write).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: /Validation: 0 issues/ }))
  expect(write).not.toHaveBeenCalled()
  const name = screen.getByRole('textbox', { name: 'Character' })
  fireEvent.change(name, { target: { value: 'Recovered edit' } })
  fireEvent.blur(name)
  await waitFor(() => expect(JSON.parse(localStorage.getItem('starfield-outpost-network')!)
    .networks[0].network.character.name).toBe('Recovered edit'))
  expect(screen.queryByText(/Saved browser data could not be restored/)).not.toBeInTheDocument()
  write.mockRestore()
})

test('quota failure keeps editor mounted and warning persists until retry succeeds', async () => {
  const nativeSet = Storage.prototype.setItem
  let fail = true
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === 'starfield-outpost-network' && fail) throw new DOMException('quota', 'QuotaExceededError')
    nativeSet.call(this, key, value)
  })
  const view = mount()
  expect(screen.getByText(/Changes are only in memory/)).toBeInTheDocument()
  const name = screen.getByRole('textbox', { name: 'Character' })
  fireEvent.change(name, { target: { value: 'Unsaved edit' } })
  fireEvent.blur(name)
  expect(screen.getByText(/Changes are only in memory/)).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Character' })).toHaveValue('Unsaved edit')
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(screen.getByRole('textbox', { name: 'Character' })).toHaveValue('')
  expect(screen.getByText(/Changes are only in memory/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
  expect(screen.getByRole('textbox', { name: 'Character' })).toHaveValue('Unsaved edit')
  fail = false
  fireEvent.click(screen.getByRole('button', { name: '+ Add Outpost' }))
  await waitFor(() => expect(screen.queryByText(/Changes are only in memory/)).not.toBeInTheDocument())
  expect(JSON.parse(localStorage.getItem('starfield-outpost-network')!).networks[0].network.character.name)
    .toBe('Unsaved edit')
  view.unmount()
  write.mockRestore()
})

test('Cargo Pad removal Undo and Redo preserve unrelated expansion state', () => {
  seedCargoPads(3)
  mount()
  cargoDisclosures().forEach((button) => fireEvent.click(button))
  expect(cargoDisclosureStates()).toEqual(['true', 'true', 'true'])

  fireEvent.click(screen.getByRole('button', { name: 'Remove Cargo Link 1' }))
  expect(cargoDisclosureStates()).toEqual(['true', 'true'])

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(cargoDisclosureStates()).toEqual(['true', 'true', 'true'])

  fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
  expect(cargoDisclosureStates()).toEqual(['true', 'true'])

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(cargoDisclosureStates()).toEqual(['true', 'true', 'true'])
})

test('Cargo Pad removal Undo preserves current mixed state and expands only the restored pad', () => {
  seedCargoPads(3)
  mount()
  fireEvent.click(cargoDisclosures()[0])
  fireEvent.click(cargoDisclosures()[2])
  expect(cargoDisclosureStates()).toEqual(['true', 'false', 'true'])

  fireEvent.click(screen.getByRole('button', { name: 'Remove Cargo Link 1' }))
  fireEvent.click(screen.getByRole('button', { name: 'Collapse Cargo Link 2' }))
  expect(cargoDisclosureStates()).toEqual(['false', 'false'])

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(cargoDisclosureStates()).toEqual(['true', 'false', 'false'])
})

test('the only restored Cargo Pad expands and expansion does not leak across outposts', () => {
  seedCargoPads(1, 1)
  mount()
  fireEvent.click(cargoDisclosures()[0])
  fireEvent.click(screen.getByRole('button', { name: 'Remove Cargo Link 1' }))
  expect(screen.queryByRole('button', { name: /Cargo Link 1/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(cargoDisclosureStates()).toEqual(['true'])

  fireEvent.click(screen.getByRole('button', { name: 'Outpost 2' }))
  expect(cargoDisclosureStates()).toEqual(['false'])
})

function dispatchShortcut(key: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options })
  const remainedUncancelled = fireEvent(document, event)
  return { event, remainedUncancelled }
}

test('global shortcuts provide predictable focus outcomes', async () => {
  mount()
  dispatchShortcut('n', { ctrlKey: true, altKey: true })
  await waitFor(() => {
    expect(document.querySelectorAll('.outpost-list__selection')).toHaveLength(1)
    expect(screen.getByRole('button', { current: 'page' })).toHaveFocus()
  })
  dispatchShortcut('n', { ctrlKey: true, altKey: true })
  await waitFor(() => {
    expect(document.querySelectorAll('.outpost-list__selection')).toHaveLength(2)
    expect(screen.getByRole('button', { current: 'page' })).toHaveFocus()
  })

  dispatchShortcut('ArrowUp', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { current: 'page' })).toHaveFocus())
  dispatchShortcut('ArrowDown', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { current: 'page' })).toHaveFocus())

  const search = screen.getByRole('combobox', { name: /Search for resources or products/ })
  fireEvent.change(search, { target: { value: 'iron' } })
  dispatchShortcut('/')
  expect(search).toHaveFocus()
  expect(search).toHaveProperty('selectionStart', 0)
  expect(search).toHaveProperty('selectionEnd', 4)

  screen.getByRole('button', { current: 'page' }).focus()
  dispatchShortcut('v', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { name: /Validation: 0 issues/ })).toHaveFocus())

  const selectedBeforeUndo = screen.getByRole('button', { current: 'page' })
  selectedBeforeUndo.focus()
  dispatchShortcut('z', { ctrlKey: true })
  await waitFor(() => {
    expect(selectedBeforeUndo).not.toBeInTheDocument()
    expect(screen.getByRole('button', { current: 'page' })).toHaveFocus()
  })
})

test('final workspace and Cargo shortcuts use their visible action and focus contracts', async () => {
  mount()
  dispatchShortcut('n', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { current: 'page' })).toBeVisible())

  dispatchShortcut('b', { ctrlKey: true, altKey: true })
  expect(screen.getByRole('button', { current: 'page' })).toHaveFocus()

  dispatchShortcut('t', { ctrlKey: true, altKey: true })
  expect(screen.getByRole('textbox', { name: 'Outpost name' })).toHaveFocus()

  dispatchShortcut('g', { ctrlKey: true, altKey: true })
  expect(document.querySelector('.outpost-status-matrix')).toHaveFocus()
  expect(document.querySelector('.outpost-status-matrix'))
    .toHaveClass('app-programmatic-focus-visible')
  dispatchShortcut('p', { ctrlKey: true, altKey: true })
  expect(screen.getByRole('button', { name: 'Expand Planned Supply' })).toHaveFocus()
  dispatchShortcut('c', { ctrlKey: true, altKey: true })
  expect(document.querySelector('.cargo-pads')).toHaveFocus()
  dispatchShortcut('3', { code: 'Digit3', ctrlKey: true, altKey: true })
  expect(screen.getByRole('button', { name: 'edit' })).toHaveFocus()

  dispatchShortcut('a', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { name: /Expand Cargo Link 1/ })).toHaveFocus())
  dispatchShortcut(',', { code: 'Comma', ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { name: /Collapse Cargo Link 1/ })).toBeVisible())
  dispatchShortcut('.', { code: 'Period', ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { name: /Expand Cargo Link 1/ })).toBeVisible())

  dispatchShortcut('b', { ctrlKey: true, altKey: true })
  dispatchShortcut('w', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Show outpost navigation' })).toHaveFocus())
  dispatchShortcut('w', { ctrlKey: true, altKey: true })
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Outposts' })).toBeVisible())
  expect(screen.getByRole('button', { current: 'page' })).not.toHaveFocus()

  const hiddenResults = dispatchShortcut('j', { ctrlKey: true, altKey: true })
  expect(hiddenResults.event.defaultPrevented).toBe(false)
})

test('Import and Export shortcuts invoke the existing controls once and reject repeats', () => {
  const inputClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)
  const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  })
  mount()

  dispatchShortcut('o', { ctrlKey: true, altKey: true })
  dispatchShortcut('o', { ctrlKey: true, altKey: true, repeat: true })
  expect(inputClick).toHaveBeenCalledTimes(1)

  dispatchShortcut('s', { ctrlKey: true, altKey: true })
  dispatchShortcut('s', { ctrlKey: true, altKey: true, repeat: true })
  expect(anchorClick).toHaveBeenCalledTimes(1)
  inputClick.mockRestore()
  anchorClick.mockRestore()
  vi.unstubAllGlobals()
})

test('Help dialog is complete, modal, and restores focus to its trigger', async () => {
  mount()
  const help = screen.getByRole('button', { name: 'Help' })
  help.focus()
  fireEvent.click(help)
  expect(screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  await waitFor(() => expect(help).toHaveFocus())
})

test.each([
  ['About', () => fireEvent.click(screen.getByRole('button', { name: 'About' }))],
  ['confirmation', () => fireEvent.click(screen.getByRole('button', { name: 'Reset Network' }))],
])('every application shortcut is inert and unprevented behind the %s modal', async (_name, openModal) => {
  mount()
  fireEvent.click(screen.getByRole('button', { name: '+ Add Outpost' }))
  fireEvent.click(screen.getByRole('button', { name: '+ Add Outpost' }))
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  const countBefore = document.querySelectorAll('.outpost-list__selection').length
  const selectedBefore = screen.getByRole('button', { current: 'page' })
  const search = screen.getByRole('combobox', { name: /Search for resources or products/ })
  openModal()
  expect(screen.getByRole('dialog')).toBeVisible()

  for (const [key, options] of [
    ['z', { ctrlKey: true }], ['y', { ctrlKey: true }], ['z', { ctrlKey: true, shiftKey: true }],
    ['/', {}], ['n', { ctrlKey: true, altKey: true }],
    ['ArrowUp', { ctrlKey: true, altKey: true }], ['ArrowDown', { ctrlKey: true, altKey: true }],
    ['v', { ctrlKey: true, altKey: true }],
    ['o', { ctrlKey: true, altKey: true }], ['s', { ctrlKey: true, altKey: true }],
    ['a', { ctrlKey: true, altKey: true }], [',', { code: 'Comma', ctrlKey: true, altKey: true }],
    ['.', { code: 'Period', ctrlKey: true, altKey: true }], ['b', { ctrlKey: true, altKey: true }],
    ['w', { ctrlKey: true, altKey: true }], ['t', { ctrlKey: true, altKey: true }],
    ['g', { ctrlKey: true, altKey: true }], ['c', { ctrlKey: true, altKey: true }],
    ['p', { ctrlKey: true, altKey: true }], ['j', { ctrlKey: true, altKey: true }],
    ['1', { code: 'Digit1', ctrlKey: true, altKey: true }],
    ['2', { code: 'Digit2', ctrlKey: true, altKey: true }],
    ['3', { code: 'Digit3', ctrlKey: true, altKey: true }],
  ] as const) {
    const { remainedUncancelled, event } = dispatchShortcut(key, options)
    expect(remainedUncancelled).toBe(true)
    expect(event.defaultPrevented).toBe(false)
  }

  expect(document.querySelectorAll('.outpost-list__selection')).toHaveLength(countBefore)
  expect(screen.getByRole('button', { current: 'page' })).toBe(selectedBefore)
  expect(search).not.toHaveFocus()
  expect(screen.getByRole('button', { name: /Validation: 0 issues/ })).toHaveAttribute('aria-expanded', 'false')
})

test('remote creation persists the selected destination and is one reversible native change', async () => {
  seedCargoPads(1, 0)
  const view = mount()
  fireEvent.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
  const outer = screen.getByRole('combobox', { name: 'Destination outpost' })
  expect(screen.getByRole('option', { name: 'Outpost 2 — 0 cargo links' })).not.toBeDisabled()
  fireEvent.change(outer, { target: { value: JSON.stringify(['id', 'outpost-2']) } })
  fireEvent.blur(outer)
  const read = () => JSON.parse(localStorage.getItem('starfield-outpost-network')!).networks[0].network
  expect(read().outposts[0].cargoPads[0].destinationIntent).toEqual({ outpostId: 'outpost-2' })
  view.unmount()
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
  const select = screen.getByRole('combobox', { name: 'Destination cargo link' })
  select.focus()
  expect(select).toHaveValue(JSON.stringify(['empty']))
  fireEvent.change(select, { target: { value: JSON.stringify(['add']) } })
  expect(read().outposts[1].cargoPads).toHaveLength(1)
  expect(read().outposts[1].cargoPads[0].outboundItems).toEqual([])
  const padId = read().outposts[1].cargoPads[0].id
  expect(select).toHaveValue(JSON.stringify(['id', padId]))
  expect(select).toHaveFocus()
  fireEvent.change(select, { target: { value: JSON.stringify(['empty']) } })
  expect(select).toHaveValue(JSON.stringify(['id', padId]))
  expect(read().cargoLinks).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(read().outposts[1].cargoPads).toHaveLength(0)
  expect(read().outposts[0].cargoPads[0].destinationIntent).toEqual({ outpostId: 'outpost-2' })
  fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
  expect(read().outposts[1].cargoPads[0].id).toBe(padId)
  fireEvent.change(screen.getByRole('combobox', { name: 'Destination cargo link' }), { target: { value: JSON.stringify(['add']) } })
  expect(read().outposts[1].cargoPads).toHaveLength(2)
  expect(read().cargoLinks).toHaveLength(1)
  expect(read().outposts[1].cargoPads[0].destinationIntent).toBeUndefined()
})

test('conflict records stay visible and removal is available from a peripheral participant', () => {
  seedCargoPads(1, 1, 1)
  const raw = JSON.parse(localStorage.getItem('starfield-outpost-network')!)
  const endpoint = (index: number) => ({ outpostId: `outpost-${index}`, cargoPadId: `pad-${index}-1` })
  raw.networks[0].network.cargoLinks = [
    { id: 'AB', endpointA: endpoint(1), endpointB: endpoint(2) },
    { id: 'AC', endpointA: endpoint(1), endpointB: endpoint(3) },
  ]
  localStorage.setItem('starfield-outpost-network', JSON.stringify(raw))
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'Outpost 2' }))
  fireEvent.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
  expect(screen.getByRole('combobox', { name: 'Destination outpost' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: /^Remove pairing AB:/ }))
  const read = () => JSON.parse(localStorage.getItem('starfield-outpost-network')!).networks[0].network
  expect(read().cargoLinks.map((r: { id: string }) => r.id)).toEqual(['AC'])
  expect(screen.getByRole('combobox', { name: 'Destination outpost' })).not.toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(read().cargoLinks).toHaveLength(2)
  expect(screen.getByRole('button', { name: /^Remove pairing AB:/ })).toBeEnabled()
})

test('retained empty missing reference uses unavailable status rather than the ordinary placeholder', () => {
  seedCargoPads(1, 0)
  const raw = JSON.parse(localStorage.getItem('starfield-outpost-network')!)
  raw.networks[0].network.cargoLinks = [{ id: 'missing-pad',
    endpointA: { outpostId: 'outpost-1', cargoPadId: 'pad-1-1' },
    endpointB: { outpostId: 'outpost-2', cargoPadId: '' },
  }]
  localStorage.setItem('starfield-outpost-network', JSON.stringify(raw))
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
  const padSelect = screen.getByRole('combobox', { name: 'Destination cargo link' })
  expect(padSelect).toHaveValue(JSON.stringify(['status']))
  expect(screen.getByRole('option', { name: 'Cargo Link unavailable ()' })).toBeDisabled()
  fireEvent.change(padSelect, { target: { value: JSON.stringify(['empty']) } })
  expect(padSelect).toHaveValue(JSON.stringify(['status']))
  fireEvent.change(padSelect, { target: { value: JSON.stringify(['add']) } })
  const read = () => JSON.parse(localStorage.getItem('starfield-outpost-network')!).networks[0].network
  expect(read().cargoLinks[0].id).not.toBe('missing-pad')
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(read().cargoLinks[0]).toEqual(raw.networks[0].network.cargoLinks[0])
})

test('remote Add retires planning in its snapshot and permits a later deliberate Add', () => {
  seedCargoPads(1, 0)
  const raw = JSON.parse(localStorage.getItem('starfield-outpost-network')!)
  raw.networks[0].network.outposts[0].cargoPads[0].outboundItems = [{ type: 'resource', id: 'iron' }]
  raw.networks[0].network.outposts[1].plannedSupply = [{ type: 'resource', id: 'iron' }]
  localStorage.setItem('starfield-outpost-network', JSON.stringify(raw))
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'Expand Cargo Link 1' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Destination outpost' }), { target: { value: JSON.stringify(['id', 'outpost-2']) } })
  const select = screen.getByRole('combobox', { name: 'Destination cargo link' })
  if (!(select instanceof HTMLSelectElement)) throw new Error('Expected native select')
  fireEvent.change(select, { target: { value: JSON.stringify(['add']) } })
  const read = () => JSON.parse(localStorage.getItem('starfield-outpost-network')!).networks[0].network
  expect(read().outposts[1].cargoPads).toHaveLength(1)
  expect(read().outposts[1].plannedSupply).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(read().outposts[1].cargoPads).toHaveLength(0)
  expect(read().outposts[1].plannedSupply).toEqual([{ type: 'resource', id: 'iron' }])
  expect(read().outposts[0].cargoPads).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
  expect(read().outposts[1].plannedSupply).toHaveLength(0)
  fireEvent.change(select, { target: { value: JSON.stringify(['add']) } })
  expect(read().outposts[1].cargoPads).toHaveLength(2)
  fireEvent.change(screen.getByRole('combobox', { name: 'Destination outpost' }), { target: { value: JSON.stringify(['empty']) } })
  expect(read().cargoLinks).toHaveLength(0)
  expect(read().outposts[1].plannedSupply).toHaveLength(0)
})

test('unfinished compact cargo keeps the outpost name and opens Validation without throwing', () => {
  seedCargoPads(1, 0)
  const raw: NetworkCollection = JSON.parse(localStorage.getItem('starfield-outpost-network')!)
  raw.networks[0].network.outposts[0].cargoPads[0].destinationIntent = { outpostId: 'outpost-2' }
  localStorage.setItem('starfield-outpost-network', JSON.stringify(raw))
  const view = mount()
  const destination = view.container.querySelector('.cargo-pad__destination')!
  expect(destination.textContent).toBe('Outpost 2')
  expect(destination).toHaveAttribute('title', 'Outpost 2 — choose Cargo Link')
  expect(view.container.querySelector('.cargo-pad__inbound-summary')).toHaveTextContent('no remote link')
  expect(cargoDisclosures()[0]).toHaveAccessibleDescription(/Outpost 2 — choose Cargo Link/)
  fireEvent.click(screen.getByRole('button', { name: /Validation:/ }))
  expect(screen.getByText('Choose or add a Cargo Link at Outpost 2 to finish this connection.')).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Character' })).toBeInTheDocument()
})
