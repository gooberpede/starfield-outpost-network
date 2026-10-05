import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { AboutDialog } from '../src/ui/components/AboutDialog.tsx'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'
import { supportedLocaleIds } from '../src/localization/types.ts'
import { buildIdentity } from '../src/buildIdentity.ts'

function Harness() {
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Open About</button>
    {open && <AboutDialog onClose={() => setOpen(false)} />}</>
}

test.each(supportedLocaleIds)('%s About preserves localized Close, top focus and interactive-only Tab order', async locale => {
  const user = userEvent.setup()
  const storageWrite = vi.spyOn(Storage.prototype, 'setItem')
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  render(<LocalizationContext value={{ locale, automaticLocale: 'en-US', localeOverride: locale,
    setLocaleOverride: vi.fn(), t: (key, params) => translate(locale, key, params) }}><Harness /></LocalizationContext>)
  await user.click(screen.getByRole('button', { name: 'Open About' }))
  const dialog = screen.getByRole('dialog')
  const [iconClose, close] = within(dialog).getAllByRole('button', { name: translate(locale, 'common.close') })
  expect(iconClose).toHaveAccessibleName(translate(locale, 'common.close'))
  expect(iconClose).not.toHaveAttribute('aria-label')
  expect(iconClose).toHaveAttribute('title', translate(locale, 'common.close'))
  expect(within(iconClose).getByText('×')).toHaveAttribute('aria-hidden', 'true')
  expect(within(dialog).queryByRole('document')).toBeNull()
  expect(within(dialog).getAllByRole('paragraph')).toHaveLength(8)
  const heading = within(dialog).getByRole('heading', { name: translate(locale, 'common.about') })
  expect(heading).toHaveFocus()
  expect(heading).toHaveAttribute('tabindex', '-1')
  expect(close).not.toHaveFocus()
  expect(dialog.scrollTop).toBe(0)
  expect(within(dialog).getByText('Starfield Outpost Network')).toBeVisible()
  for (const paragraph of within(dialog).getAllByRole('paragraph')) {
    expect(paragraph).not.toHaveAttribute('tabindex')
    expect(paragraph).toBeVisible()
  }
  expect(dialog).toHaveAccessibleName(translate(locale, 'common.about'))
  expect(dialog).not.toHaveAttribute('aria-describedby')
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  const expected = [
    '/legal/LICENSE.txt', '/legal/THIRD-PARTY-NOTICE.txt',
    'https://github.com/gooberpede/starfield-outpost-network',
    'https://github.com/gooberpede/starfield-outpost-network/releases',
    ...(buildIdentity.sourceUrl ? [buildIdentity.sourceUrl] : []),
    'https://github.com/gooberpede/starfield-outpost-network/issues',
    'mailto:support@starfieldoutposts.com', 'https://ko-fi.com/gooberpede',
    'https://www.flaticon.com/free-icons/cosmos',
  ]
  const links = within(dialog).getAllByRole('link')
  expect(links.map(link => link.getAttribute('href'))).toEqual(expected)
  for (const link of links) {
    expect(link).toHaveAccessibleName()
    if (!link.getAttribute('href')?.startsWith('mailto:')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  }
  expect(within(dialog).getByText('designed by gravisio from Flaticon')).toBeVisible()
  expect(dialog).toHaveTextContent('GPL-3.0-or-later')
  expect(dialog).toHaveTextContent(buildIdentity.version)
  await user.tab({ shift: true })
  expect(close).toHaveFocus()
  await user.tab()
  expect(iconClose).toHaveFocus()
  await user.tab({ shift: true })
  expect(close).toHaveFocus()
  for (const target of [iconClose, ...links, close]) {
    await user.tab()
    expect(target).toHaveFocus()
    expect(dialog.contains(document.activeElement)).toBe(true)
  }
  fireEvent.mouseDown(dialog.parentElement!)
  expect(dialog).toBeInTheDocument()
  expect(dialog.contains(document.activeElement)).toBe(true)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('button', { name: 'Open About' })).toHaveFocus()
  await user.click(screen.getByRole('button', { name: 'Open About' }))
  expect(screen.getByRole('heading', { name: translate(locale, 'common.about') })).toHaveFocus()
  expect(screen.getByRole('dialog').scrollTop).toBe(0)
  await user.tab()
  const reopenedCloseButtons = screen.getAllByRole('button', { name: translate(locale, 'common.close') })
  expect(reopenedCloseButtons[0]).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('button', { name: 'Open About' })).toHaveFocus()
  await user.click(screen.getByRole('button', { name: 'Open About' }))
  await user.click(screen.getAllByRole('button', { name: translate(locale, 'common.close') })[1])
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('button', { name: 'Open About' })).toHaveFocus()
  expect(storageWrite).not.toHaveBeenCalled()
  expect(fetchSpy).not.toHaveBeenCalled()
  storageWrite.mockRestore()
  fetchSpy.mockRestore()
})
