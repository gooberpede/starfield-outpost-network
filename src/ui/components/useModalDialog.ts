/**
 * useModalDialog.ts
 *
 * Purpose:
 *   Provides the shared keyboard, focus, and scroll behavior for the
 *   application's compact modal dialogs.
 *
 * Architecture:
 *   Dialog components retain ownership of their content and presentation.
 *   This hook centralizes only modal interaction so application-owned dialogs
 *   cannot drift apart in their accessibility behavior.
 *
 * Change this file when:
 *   - focus trapping or restoration changes for application modals;
 *   - modal scroll locking or Escape behavior changes.
 */

import {
  useEffect,
  useRef,
} from 'react'
import type {
  KeyboardEvent,
  RefObject,
} from 'react'
import { focusAndReveal } from '../focusVisibility.ts'

interface UseModalDialogOptions {
  initialFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
}

export function useModalDialog({
  initialFocusRef,
  onClose,
}: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDivElement>(null)

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

    focusAndReveal(initialFocusRef.current, { preventScroll: true })

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.paddingRight = previousBodyPaddingRight
      focusAndReveal(previouslyFocusedElement, { preventScroll: true })
    }
  }, [initialFocusRef])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
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

  return {
    dialogRef,
    handleKeyDown,
  }
}
