/**
 * ConfirmDialog.tsx
 *
 * Purpose:
 *   Provides a compact application-owned confirmation surface for deliberate
 *   actions that need explicit consent.
 *
 * Architecture:
 *   This component owns modal presentation and interaction only. Callers keep
 *   responsibility for the action being confirmed and for whether the dialog
 *   is mounted.
 *
 * Change this file when:
 *   - the shared confirmation-dialog interaction contract changes;
 *   - focus trapping, focus restoration, or scroll locking changes.
 */

import {
  useId,
  useRef,
} from 'react'
import type {
  MouseEvent,
  ReactNode,
} from 'react'

import './ConfirmDialog.css'
import { useModalDialog } from './useModalDialog'

interface ConfirmDialogProps {
  title: string
  children: ReactNode
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const { dialogRef, handleKeyDown } = useModalDialog({
    initialFocusRef: cancelButtonRef,
    onClose: onCancel,
  })

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      event.preventDefault()
    }
  }

  return (
    <div
      className="confirm-dialog__backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>

        <div id={descriptionId} className="confirm-dialog__message">
          {children}
        </div>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-dialog__confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
