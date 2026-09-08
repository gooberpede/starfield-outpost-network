export interface ContextHelpPosition {
  left: number
  top: number
}

const viewportMargin = 8
const triggerGap = 6

/** Keeps the fixed-position help box inside the visible viewport. */
export function getContextHelpPosition(
  trigger: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  popover: Pick<DOMRect, 'width' | 'height'>,
  viewport: { width: number; height: number },
): ContextHelpPosition {
  const preferredTop = trigger.bottom + triggerGap
  const top = preferredTop + popover.height <= viewport.height - viewportMargin
    ? preferredTop
    : Math.max(viewportMargin, trigger.top - popover.height - triggerGap)
  const left = Math.min(
    Math.max(viewportMargin, trigger.left),
    Math.max(viewportMargin, viewport.width - popover.width - viewportMargin),
  )

  return { left, top }
}
