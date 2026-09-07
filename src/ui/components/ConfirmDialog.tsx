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
  useEffect,
  useId,
  useRef,
} from 'react'
import type {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react'

import './ConfirmDialog.css'

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
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    cancelButtonRef.current?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.paddingRight = previousBodyPaddingRight
      previouslyFocusedElement?.focus({ preventScroll: true })
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCancel()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    )

    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault()
      lastElement?.focus()
    } else if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault()
      firstElement.focus()
    }
  }

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
