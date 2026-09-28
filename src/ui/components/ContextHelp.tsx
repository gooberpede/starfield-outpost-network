/**
 * Purpose:
 *   Present the application's singleton contextual-help popover interaction.
 *
 * Architecture:
 *   Owns portalled placement, dismissal, and focus return as transient UI state.
 *   Help state is deliberately not lifted into the application or persisted model.
 *
 * Change this file when:
 *   Context-help interaction, placement, dismissal, or focus behavior changes.
 */
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  getContextHelpPosition,
  type ContextHelpPosition,
} from '../contextHelpPosition'

import './ContextHelp.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { focusAndReveal } from '../focusVisibility.ts'

interface ContextHelpProps {
  text: string
  context: string
}

// A document event coordinates portalled instances so only one help popover is
// open without promoting this transient state into the application model.
const openEventName = 'starfield-context-help-open'

export function ContextHelp({ text, context }: ContextHelpProps) {
  const { t } = useLocalization()
  const id = useId()
  const panelId = `${id}-context-help`
  const containerRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<ContextHelpPosition | null>(null)

  useLayoutEffect(() => {
    function closeWhenAnotherHelpOpens(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) setIsOpen(false)
    }

    document.addEventListener(openEventName, closeWhenAnotherHelpOpens)
    return () => document.removeEventListener(openEventName, closeWhenAnotherHelpOpens)
  }, [id])

  useLayoutEffect(() => {
    if (!isOpen) return

    function placePopover() {
      if (!triggerRef.current || !panelRef.current) return
      setPosition(getContextHelpPosition(
        triggerRef.current.getBoundingClientRect(),
        panelRef.current.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight },
      ))
    }

    function closeFromOutside(event: PointerEvent) {
      const target = event.target
      if (
        target instanceof Node &&
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    function closeFromEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setIsOpen(false)
      focusAndReveal(triggerRef.current, { preventScroll: true })
    }

    placePopover()
    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeFromEscape)
    window.addEventListener('resize', placePopover)
    window.addEventListener('scroll', placePopover, true)
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeFromEscape)
      window.removeEventListener('resize', placePopover)
      window.removeEventListener('scroll', placePopover, true)
    }
  }, [isOpen])

  function toggleHelp() {
    if (!isOpen) {
      document.dispatchEvent(new CustomEvent(openEventName, { detail: id }))
    }
    setIsOpen(!isOpen)
  }

  return (
    <span className="context-help" ref={containerRef}>
      <button
        ref={triggerRef}
        className="context-help__trigger"
        type="button"
        aria-label={t('help.contextLabel', { context })}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-describedby={isOpen ? panelId : undefined}
        onClick={toggleHelp}
      >
        ?
      </button>
      {isOpen && createPortal(
        <div
          ref={panelRef}
          id={panelId}
          className="context-help__panel"
          role="note"
          style={{
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            visibility: position ? 'visible' : 'hidden',
          }}
        >
          {text}
        </div>,
        document.body,
      )}
    </span>
  )
}
