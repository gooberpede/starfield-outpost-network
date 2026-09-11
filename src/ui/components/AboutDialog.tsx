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
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { useModalDialog } from './useModalDialog'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const { t } = useLocalization()
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
          <h2 id={titleId}>{t('common.about')}</h2>
          <button
            type="button"
            className="about-dialog__icon-close"
            aria-label={t('about.closeDialog')}
            title={t('common.close')}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div id={descriptionId} className="about-dialog__content">
          <p className="about-dialog__app-name">
            Starfield Outpost Network
          </p>
          <p>{t('about.description')}</p>
          <p>
            <a
              href="https://www.flaticon.com/free-icons/cosmos"
              target="_blank"
              rel="noreferrer"
            >
              {t('about.attribution')}
            </a>
          </p>
        </div>

        <div className="about-dialog__actions">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
