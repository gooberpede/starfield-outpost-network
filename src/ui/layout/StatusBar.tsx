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

interface StatusBarProps {
  main: ReactNode

  message?: {
    kind: 'success' | 'error'
    content: ReactNode
    onDismiss?: () => void
  }
}

export function StatusBar({
  main,
  message,
}: StatusBarProps) {
  return (
    <footer className="status-bar">
      <div className="status-bar__main">
        {main}
      </div>

      {message && (
        <div
          className={`status-bar__message status-bar__message--${message.kind}`}
        >
          <span>
            {message.content}
          </span>

          {message.onDismiss && (
            <button
              type="button"
              onClick={message.onDismiss}
              aria-label="Dismiss status message"
              title="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      )}
    </footer>
  )
}