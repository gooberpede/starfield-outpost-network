/**
 * WorkspaceLayout.tsx
 *
 * Purpose:
 *   Defines the major regions of the selected-outpost workspace.
 *
 * Architecture:
 *   The left region contains outpost navigation.
 *
 *   The selected outpost occupies the remaining workspace. Its high-level
 *   details can span both editing columns, while the main content beneath
 *   those details is divided between a middle region and a right region.
 *
 *   Resource Matrix and Cargo Pads occupy sibling operational columns within
 *   the selected outpost, without becoming peers of the outpost itself.
 *
 * Change this file when:
 *   - the major workspace regions change;
 *   - another region needs to span multiple workspace columns;
 *   - the hierarchy of navigation versus selected-outpost content changes.
 */

import type { ReactNode } from 'react'

import './WorkspaceLayout.css'

interface WorkspaceLayoutProps {
  left: ReactNode
  middle: ReactNode
  right: ReactNode

  /**
   * Optional selected-outpost content that spans both editing columns.
   *
   * This is temporarily optional so the layout can be introduced without
   * breaking existing callers before App.tsx is updated.
   */
  top?: ReactNode
}

export function WorkspaceLayout({
  left,
  middle,
  right,
  top,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <aside className="workspace-layout__left">
        {left}
      </aside>

      <div className="workspace-layout__outpost">
        {top && (
          <div className="workspace-layout__top">
            {top}
          </div>
        )}

        <div className="workspace-layout__content">
          <main className="workspace-layout__middle">
            {middle}
          </main>

          <aside className="workspace-layout__right">
            {right}
          </aside>
        </div>
      </div>
    </div>
  )
}
