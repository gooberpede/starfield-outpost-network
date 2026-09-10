export interface PalettePosition { left: number; top: number }
export interface PaletteSize { width: number; height: number }
export interface ViewportSize { width: number; height: number }
export interface PaletteDragSession {
  original: PalettePosition
  outline: PalettePosition
}

export const SEARCH_PALETTE_MARGIN = 12
export const STATUS_BAR_SAFE_HEIGHT = 56

/** Keeps the palette inside the viewport area above the fixed status bar. */
export function clampSearchPalettePosition(
  position: PalettePosition,
  palette: PaletteSize,
  viewport: ViewportSize,
): PalettePosition {
  const maxLeft = Math.max(SEARCH_PALETTE_MARGIN,
    viewport.width - palette.width - SEARCH_PALETTE_MARGIN)
  const maxTop = Math.max(SEARCH_PALETTE_MARGIN,
    viewport.height - STATUS_BAR_SAFE_HEIGHT - palette.height - SEARCH_PALETTE_MARGIN)
  return {
    left: Math.min(Math.max(position.left, SEARCH_PALETTE_MARGIN), maxLeft),
    top: Math.min(Math.max(position.top, SEARCH_PALETTE_MARGIN), maxTop),
  }
}

export function getInitialSearchPalettePosition(
  anchor: Pick<DOMRect, 'left' | 'bottom'>,
  palette: PaletteSize,
  viewport: ViewportSize,
): PalettePosition {
  return clampSearchPalettePosition(
    { left: anchor.left, top: anchor.bottom + 6 }, palette, viewport,
  )
}

/** Reopening reuses the network-local committed position; a reset starts at the anchor. */
export function resolveSearchPalettePositionOnOpen(
  committedPosition: PalettePosition | null,
  anchor: Pick<DOMRect, 'left' | 'bottom'>,
  palette: PaletteSize,
  viewport: ViewportSize,
): PalettePosition {
  return committedPosition ?? getInitialSearchPalettePosition(anchor, palette, viewport)
}

export function beginSearchPaletteDrag(position: PalettePosition): PaletteDragSession {
  return { original: { ...position }, outline: { ...position } }
}

export function moveSearchPaletteDrag(
  session: PaletteDragSession,
  candidate: PalettePosition,
  palette: PaletteSize,
  viewport: ViewportSize,
): PaletteDragSession {
  return {
    ...session,
    outline: clampSearchPalettePosition(candidate, palette, viewport),
  }
}

/** Cancellation restores the committed origin; completion returns the outline. */
export function finishSearchPaletteDrag(
  session: PaletteDragSession,
  cancelled: boolean,
): PalettePosition {
  return { ...(cancelled ? session.original : session.outline) }
}
