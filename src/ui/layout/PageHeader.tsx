/**
 * PageHeader.tsx
 *
 * Purpose:
 *   Provides the persistent network-level working header that remains visible
 *   while the user scrolls through the main workspace.
 *
 * Architecture:
 *   PageHeader owns layout and sticky presentation only. It does not own
 *   character state, Undo/Redo history, importing, exporting, or validation.
 *
 *   Those behaviours are supplied by the application layer as already-built
 *   content regions.
 *
 * Change this file when:
 *   - sticky header regions change;
 *   - network-level controls are regrouped;
 *   - page-header layout or semantics change.
 */

import type { ReactNode } from 'react'

import './PageHeader.css'

interface PageHeaderProps {
  main: ReactNode
  actions: ReactNode
}

export function PageHeader({
  main,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        {main}
      </div>

      <div className="page-header__actions">
        {actions}
      </div>
    </header>
  )
}