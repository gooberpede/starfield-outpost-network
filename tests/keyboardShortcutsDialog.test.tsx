import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocalizationProvider } from '../src/localization/LocalizationProvider.tsx'
import { KeyboardShortcutsDialog } from '../src/ui/components/KeyboardShortcutsDialog.tsx'
import { shortcutRegistry } from '../src/ui/keyboardShortcuts.ts'

describe('Keyboard Shortcuts dialog', () => {
  it('renders every logical action once and groups both Redo chords', () => {
    render(<LocalizationProvider><KeyboardShortcutsDialog onClose={vi.fn()} /></LocalizationProvider>)
    const dialog = screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })
    expect(within(dialog).getByText('History')).toBeVisible()
    expect(within(dialog).getByText('Search')).toBeVisible()
    expect(within(dialog).getByText('Outpost Navigation')).toBeVisible()
    expect(within(dialog).getByText('Workspace')).toBeVisible()
    expect(within(dialog).getByText('Resource Matrix')).toBeVisible()
    expect(within(dialog).getByText('Cargo Links')).toBeVisible()
    expect(within(dialog).getByText('Import / Export')).toBeVisible()
    expect(within(dialog).getByText('Validation')).toBeVisible()
    expect(within(dialog).getAllByText('Redo')).toHaveLength(1)
    expect(within(dialog).getByLabelText('Control plus Y')).toBeVisible()
    expect(within(dialog).getByLabelText('Control plus Shift plus Z')).toBeVisible()
    expect(within(dialog).getAllByRole('term')).toHaveLength(new Set(shortcutRegistry.map(({ action }) => action)).size)
  })

  it('focuses Close, closes with Escape, and invokes the visible Close action', () => {
    const onClose = vi.fn()
    render(<LocalizationProvider><KeyboardShortcutsDialog onClose={onClose} /></LocalizationProvider>)
    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(close)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
