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

import type { ReactNode } from 'react'

import './StatusBar.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'

interface StatusBarProps {
  main: ReactNode

  interactionHint?: ReactNode

  message?: {
    kind: 'success' | 'error'
    content: ReactNode
    onDismiss?: () => void
  }
}

export function StatusBar({
  main,
  interactionHint,
  message,
}: StatusBarProps) {
  const { t } = useLocalization()
  return (
    <footer className="status-bar">
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
