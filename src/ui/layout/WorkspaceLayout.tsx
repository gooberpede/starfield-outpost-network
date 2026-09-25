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

import {
  useLayoutEffect,
  useRef,
  type ReactNode,
  type Ref,
} from 'react'

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
  const topRef = useRef<HTMLDivElement>(null)
  const cargoRailRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const cargoRail = cargoRailRef.current
    const pageHeader = document.querySelector<HTMLElement>('.page-header')
    const statusBar = document.querySelector<HTMLElement>('.status-bar')

    if (!cargoRail || !pageHeader || !statusBar) return

    let isActive = true
    let scheduledFrame: number | null = null

    const updateCargoMaxHeight = () => {
      if (!isActive) return
      const railTop = cargoRail.getBoundingClientRect().top
      const headerBottom = pageHeader.getBoundingClientRect().bottom
      const statusTop = statusBar.getBoundingClientRect().top
      const effectiveTop = Math.max(railTop, headerBottom)
      const safeHeight = Math.max(0, Math.floor(statusTop - effectiveTop))
      cargoRail.style.setProperty('--cargo-rail-max-height', `${safeHeight}px`)
    }

    const scheduleCargoMaxHeightUpdate = () => {
      if (!isActive || scheduledFrame !== null) return
      scheduledFrame = requestAnimationFrame(() => {
        scheduledFrame = null
        updateCargoMaxHeight()
      })
    }

    updateCargoMaxHeight()

    const resizeObserver = new ResizeObserver(scheduleCargoMaxHeightUpdate)
    const observedElements = [
      document.querySelector<HTMLElement>('.title-bar'),
      pageHeader,
      statusBar,
      topRef.current,
    ]
    for (const element of observedElements) {
      if (element) resizeObserver.observe(element)
    }

    window.addEventListener('scroll', scheduleCargoMaxHeightUpdate, { passive: true })
    window.addEventListener('resize', scheduleCargoMaxHeightUpdate)
    document.fonts?.ready.then(scheduleCargoMaxHeightUpdate)
    document.fonts?.addEventListener('loadingdone', scheduleCargoMaxHeightUpdate)

    return () => {
      isActive = false
      if (scheduledFrame !== null) cancelAnimationFrame(scheduledFrame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleCargoMaxHeightUpdate)
      window.removeEventListener('resize', scheduleCargoMaxHeightUpdate)
      document.fonts?.removeEventListener('loadingdone', scheduleCargoMaxHeightUpdate)
      cargoRail.style.removeProperty('--cargo-rail-max-height')
    }
  }, [])

  return (
    <div className={`workspace-layout${
      isNavigationOpen ? '' : ' workspace-layout--navigation-collapsed'
    }`}>
      {isNavigationOpen ? (
        <nav
          className="workspace-layout__left"
          aria-label={t('outpost.navigation.heading')}
        >
          {left}
        </nav>
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
          <div ref={topRef} className="workspace-layout__top">
            {top}
          </div>
        )}

        <div className="workspace-layout__content">
          <div className="workspace-layout__middle">
            {middle}
          </div>

          <aside
            ref={cargoRailRef}
            className="workspace-layout__right"
            aria-label={t('cargo.heading')}
          >
            {right}
          </aside>
        </div>
      </div>
    </div>
  )
}
