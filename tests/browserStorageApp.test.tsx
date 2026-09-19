import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from '../src/App.tsx'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'

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
