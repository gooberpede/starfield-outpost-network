/**
 * AboutDialog.tsx
 *
 * Purpose:
 *   Presents compact application identity and icon attribution information.
 *
 * Architecture:
 *   This component owns presentation and modal interaction only. App.tsx owns
 *   whether it is mounted because visibility is application session state.
 *
 * Change this file when:
 *   - application identity or attribution copy changes;
 *   - About-specific controls or content are added.
 */

import {
  useId,
  useRef,
} from 'react'
import type { MouseEvent } from 'react'

import './AboutDialog.css'
import { useModalDialog } from './useModalDialog'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { dialogRef, handleKeyDown } = useModalDialog({
    initialFocusRef: closeButtonRef,
    onClose,
  })

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      event.preventDefault()
    }
  }

  return (
    <div
      className="about-dialog__backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
      >
        <header className="about-dialog__header">
          <h2 id={titleId}>About</h2>
          <button
            type="button"
            className="about-dialog__icon-close"
            aria-label="Close About dialog"
            title="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div id={descriptionId} className="about-dialog__content">
          <p className="about-dialog__app-name">
            Starfield Outpost Network
          </p>
          <p>A tracking tool for Starfield outpost networks.</p>
          <p>
            <a
              href="https://www.flaticon.com/free-icons/cosmos"
              target="_blank"
              rel="noreferrer"
            >
              Cosmos icons created by gravisio - Flaticon
            </a>
          </p>
        </div>

        <div className="about-dialog__actions">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
