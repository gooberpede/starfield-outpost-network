import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from '../src/App.tsx'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'

function mount() {
  return render(<LocalizationContext value={{
    locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
    setLocaleOverride: vi.fn(), t: (key, parameters) => translate('en-US', key, parameters),
  }}><App /></LocalizationContext>)
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
  }}><App /></LocalizationContext>)
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
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
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
