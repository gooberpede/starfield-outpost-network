import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { AboutDialog } from '../src/ui/components/AboutDialog.tsx'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'

vi.mock('../src/buildIdentity.ts', () => ({ buildIdentity: {
  version: '<img src=x onerror=alert(1)>',
  commit: 'a'.repeat(40), status: 'clean',
  sourceUrl: `https://github.com/gooberpede/starfield-outpost-network/tree/${'a'.repeat(40)}`,
} }))

test('clean identity links full source SHA and renders unusual version text without HTML interpretation', () => {
  render(<LocalizationContext value={{ locale: 'en-US', automaticLocale: 'en-US', localeOverride: null,
    setLocaleOverride: vi.fn(), t: (key, params) => translate('en-US', key, params) }}>
    <AboutDialog onClose={vi.fn()} />
  </LocalizationContext>)
  expect(screen.getByRole('link', { name: 'Source for this build' })).toHaveAttribute('href',
    `https://github.com/gooberpede/starfield-outpost-network/tree/${'a'.repeat(40)}`)
  expect(screen.getByRole('dialog')).toHaveTextContent('Build aaaaaaaa')
  expect(screen.getByRole('dialog')).toHaveTextContent('<img src=x onerror=alert(1)>')
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.queryByText(/local \/ modified|local \/ unverified/)).toBeNull()
})

import { supportedLocaleIds } from '../src/localization/types.ts'
test.each(supportedLocaleIds)('About release history link is safe and localized in %s', (locale) => {
  render(<LocalizationContext value={{ locale, automaticLocale: locale, localeOverride: null,
    setLocaleOverride: vi.fn(), t: (key, params) => translate(locale, key, params) }}>
    <AboutDialog onClose={vi.fn()} />
  </LocalizationContext>)
  const link = screen.getByRole('link', { name: translate(locale, 'about.releaseNotes') })
  expect(link).toHaveAttribute('href', 'https://github.com/gooberpede/starfield-outpost-network/releases')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
