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

import type { ReactNode, Ref } from 'react'

import './WorkspaceLayout.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'

interface WorkspaceLayoutProps {
  left: ReactNode
  middle: ReactNode
  right: ReactNode
  isNavigationOpen: boolean
  onShowNavigation: () => void
  showNavigationControlRef: Ref<HTMLButtonElement>

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
  isNavigationOpen,
  onShowNavigation,
  showNavigationControlRef,
}: WorkspaceLayoutProps) {
  const { t } = useLocalization()
  return (
    <div className={`workspace-layout${
      isNavigationOpen ? '' : ' workspace-layout--navigation-collapsed'
    }`}>
      {isNavigationOpen ? (
        <aside className="workspace-layout__left">
          {left}
        </aside>
      ) : (
        <div className="workspace-layout__reopen">
          <button
            ref={showNavigationControlRef}
            type="button"
            onClick={onShowNavigation}
            aria-label={t('outpost.navigation.show')}
            title={t('outpost.navigation.show')}
          >
            ›
          </button>
        </div>
      )}

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
