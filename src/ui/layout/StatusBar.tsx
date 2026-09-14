/**
 * StatusBar.tsx
 *
 * Purpose:
 *   Provides the application's bottom status area for persistent session
 *   information and transient user feedback.
 *
 * Architecture:
 *   StatusBar is presentational only. It does not own file-loading state,
 *   errors, timers, or network data.
 *
 *   Persistent status belongs in the main region. Transient messages belong
 *   in the message region so the two concerns can evolve independently.
 *
 * Change this file when:
 *   - footer/status information is regrouped;
 *   - persistent and transient status presentation changes;
 *   - additional status regions are introduced.
 */

import { useEffect, useState, type ReactNode } from 'react'

import './StatusBar.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'

interface StatusBarProps {
  main: ReactNode

  interactionHint?: ReactNode

  message?: {
    kind: 'success' | 'error'
    content: ReactNode
    announcementText?: string
    announcementId?: number
    deferAssertiveUntilWindowFocus?: boolean
    onDismiss?: () => void
  }
}

export function StatusBar({
  main,
  interactionHint,
  message,
}: StatusBarProps) {
  const { t } = useLocalization()
  const [deferredAssertiveAnnouncement, setDeferredAssertiveAnnouncement] =
    useState<{ id: number; content: ReactNode } | null>(null)

  useEffect(() => {
    if (
      message?.kind !== 'error' ||
      !message.deferAssertiveUntilWindowFocus ||
      message.announcementId === undefined ||
      message.announcementText === undefined
    ) {
      return
    }

    const announcementId = message.announcementId
    const announcementContent = message.announcementText
    let animationFrameId: number | null = null

    const publishAnnouncement = () => {
      window.removeEventListener('focus', publishAnnouncement)
      animationFrameId = window.requestAnimationFrame(() => {
        setDeferredAssertiveAnnouncement({
          id: announcementId,
          content: announcementContent,
        })
      })
    }

    if (document.hasFocus()) {
      publishAnnouncement()
    } else {
      window.addEventListener('focus', publishAnnouncement, { once: true })
    }

    return () => {
      window.removeEventListener('focus', publishAnnouncement)
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [
    message?.announcementId,
    message?.announcementText,
    message?.deferAssertiveUntilWindowFocus,
    message?.kind,
  ])

  let assertiveAnnouncement: ReactNode = null
  if (message?.kind === 'error') {
    if (!message.deferAssertiveUntilWindowFocus) {
      assertiveAnnouncement = message.announcementText ?? message.content
    } else if (
      deferredAssertiveAnnouncement &&
      deferredAssertiveAnnouncement.id === message.announcementId
    ) {
      assertiveAnnouncement = deferredAssertiveAnnouncement.content
    }
  }

  return (
    <footer className="status-bar">
      <div
        className="ui-visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message?.kind === 'success'
          ? message.announcementText ?? message.content
          : null}
      </div>
      <div
        className="ui-visually-hidden"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {assertiveAnnouncement}
      </div>

      <div className="status-bar__main">
        {main}
      </div>

      {(interactionHint || message) && (
        <div className="status-bar__feedback">
          {interactionHint && (
            <span className="status-bar__interaction-hint">
              {interactionHint}
            </span>
          )}

          {message && (
            <div
              className={`status-bar__message status-bar__message--${message.kind}`}
            >
              <span>{message.content}</span>

              {message.onDismiss && (
                <button
                  type="button"
                  onClick={message.onDismiss}
                  aria-label={t('status.dismiss')}
                  title={t('status.dismiss.short')}
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </footer>
  )
}
