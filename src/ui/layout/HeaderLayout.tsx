/**
 * HeaderLayout.tsx
 *
 * Purpose:
 *   Arranges the application's primary character information and network-level
 *   actions in a compact top-of-page region.
 *
 * Architecture:
 *   HeaderLayout owns positioning only. It does not know anything about
 *   characters, importing, exporting, or network state.
 *
 *   The main region is intended for CharacterHeader, while the actions region
 *   provides a visually separate home for network-level controls.
 *
 * Change this file when:
 *   - the major regions of the application header change;
 *   - additional header-level regions are introduced;
 *   - the semantic grouping of header content changes.
 */

import type { ReactNode } from 'react'

import './HeaderLayout.css'

interface HeaderLayoutProps {
  main: ReactNode
  actions: ReactNode
}

export function HeaderLayout({
  main,
  actions,
}: HeaderLayoutProps) {
  return (
    <div className="header-layout">
      <div className="header-layout__main">
        {main}
      </div>

      <aside className="header-layout__actions">
        {actions}
      </aside>
    </div>
  )
}