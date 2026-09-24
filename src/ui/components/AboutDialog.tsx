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
import { buildIdentity } from '../../buildIdentity.ts'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const { t } = useLocalization()
  const titleId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { dialogRef, handleKeyDown } = useModalDialog({
    initialFocusRef: headingRef,
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
        onKeyDown={handleKeyDown}
      >
        <header className="about-dialog__header">
          <h2 ref={headingRef} id={titleId} tabIndex={-1}>{t('common.about')}</h2>
          <button
            type="button"
            className="about-dialog__icon-close"
            title={t('common.close')}
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
            <span className="ui-visually-hidden">{t('common.close')}</span>
          </button>
        </header>

        <div className="about-dialog__content">
          <p className="about-dialog__app-name">
            Starfield Outpost Network
          </p>
          <p>{t('about.description')}</p>
          <p>
            {t('about.version', { version: buildIdentity.version })}{' · '}
            {t('about.build', { commit: buildIdentity.commit?.slice(0, 8) ?? '—' })}
            {buildIdentity.status !== 'clean' && ` · ${t(buildIdentity.status === 'modified' ? 'about.modified' : 'about.unknown')}`}
          </p>
          <p>© 2026 Gooberpede. {t('about.licenseSummary')}</p>
          <div className="about-dialog__links">
            <a href="/legal/LICENSE.txt" target="_blank" rel="noopener noreferrer">{t('about.license')}</a>
            <a href="/legal/THIRD-PARTY-NOTICE.txt" target="_blank" rel="noopener noreferrer">{t('about.notices')}</a>
            <a href="https://github.com/gooberpede/starfield-outpost-network" target="_blank" rel="noopener noreferrer">{t('about.repository')}</a>
            {buildIdentity.sourceUrl && <a href={buildIdentity.sourceUrl} target="_blank" rel="noopener noreferrer">{t('about.buildSource')}</a>}
            <a href="https://github.com/gooberpede/starfield-outpost-network/issues" target="_blank" rel="noopener noreferrer">{t('about.issues')}</a>
            <a href="mailto:support@starfieldoutposts.com">{t('about.contact')}</a>
            <a href="https://ko-fi.com/gooberpede" target="_blank" rel="noopener noreferrer">{t('about.support')}</a>
          </div>
          <p>{t('about.funding')}</p>
          <p>{t('about.backup')}</p>
          <p>{t('about.unofficial')}</p>
          <p>
            {t('about.artwork')}{' '}
            <a
              href="https://www.flaticon.com/free-icons/cosmos"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('about.attribution')}
            </a>
          </p>
        </div>

        <div className="about-dialog__actions">
          <button
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
