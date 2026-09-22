/**
 * Shared focus and fixed-chrome visibility support.
 *
 * Application-owned focus moves use this module so nested scrollports and the
 * document shell follow one minimal-scroll contract. Geometry remains
 * presentation-only and is read from the rendered shell.
 */

const PROGRAMMATIC_FOCUS_CLASS = 'app-programmatic-focus-visible'

interface FocusAndRevealOptions {
  preventScroll?: boolean
  showFocusRing?: boolean
}

interface VerticalBounds {
  top: number
  bottom: number
}

export function getMinimalVerticalScroll(
  target: VerticalBounds,
  visible: VerticalBounds,
): number {
  if (target.top < visible.top) return target.top - visible.top
  if (target.bottom > visible.bottom) return target.bottom - visible.bottom
  return 0
}

export function alignVerticalScrollToCssPixels(delta: number): number {
  if (delta < 0) return Math.floor(delta)
  if (delta > 0) return Math.ceil(delta)
  return 0
}

function isVerticallyScrollable(element: HTMLElement): boolean {
  const { overflowY } = getComputedStyle(element)
  return /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight
}

function getVerticalScrollAncestors(target: HTMLElement): HTMLElement[] {
  const ancestors: HTMLElement[] = []
  let ancestor = target.parentElement

  while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
    if (isVerticallyScrollable(ancestor)) ancestors.push(ancestor)
    ancestor = ancestor.parentElement
  }

  return ancestors
}

function belongsToFixedOverlay(target: HTMLElement): boolean {
  let element: HTMLElement | null = target
  while (element && element !== document.body) {
    if (getComputedStyle(element).position === 'fixed') return true
    element = element.parentElement
  }
  return false
}

function revealWithinContainer(target: HTMLElement, container: HTMLElement) {
  const targetRect = target.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const delta = alignVerticalScrollToCssPixels(
    getMinimalVerticalScroll(targetRect, containerRect),
  )
  if (delta !== 0) container.scrollTop += delta
}

export function revealElementWithinUsableViewport(target: HTMLElement) {
  if (!target.isConnected) return

  for (const container of getVerticalScrollAncestors(target)) {
    revealWithinContainer(target, container)
  }

  if (belongsToFixedOverlay(target)) return

  const targetRect = target.getBoundingClientRect()
  const pageHeader = document.querySelector<HTMLElement>('.page-header')
  const statusBar = document.querySelector<HTMLElement>('.status-bar')
  const pageHeaderRect = pageHeader?.getBoundingClientRect()
  const visible = {
    // Before the sticky threshold, Title Bar controls remain visibly above
    // the Page Header in normal flow and must not be treated as occluded.
    top: pageHeaderRect && pageHeaderRect.top <= 0 ? pageHeaderRect.bottom : 0,
    bottom: statusBar?.getBoundingClientRect().top ?? window.innerHeight,
  }
  const delta = alignVerticalScrollToCssPixels(
    getMinimalVerticalScroll(targetRect, visible),
  )
  if (delta !== 0) window.scrollBy({ top: delta, behavior: 'auto' })
}

function showProgrammaticFocusRing(target: HTMLElement) {
  target.classList.add(PROGRAMMATIC_FOCUS_CLASS)
  target.addEventListener('blur', () => {
    target.classList.remove(PROGRAMMATIC_FOCUS_CLASS)
  }, { once: true })
}

export function focusAndReveal(
  target: HTMLElement | null,
  { preventScroll = false, showFocusRing = false }: FocusAndRevealOptions = {},
): boolean {
  if (!target || target.matches(':disabled')) return false

  target.focus({ preventScroll })
  if (showFocusRing) showProgrammaticFocusRing(target)
  revealElementWithinUsableViewport(target)

  // Recheck after focus-driven layout and React effects have settled. This is
  // also what makes repeated shortcuts repair an already-focused target.
  requestAnimationFrame(() => revealElementWithinUsableViewport(target))
  return true
}

export function observePageHeaderHeight(header: HTMLElement): () => void {
  const root = document.documentElement
  const update = () => {
    root.style.setProperty('--page-header-height', `${header.getBoundingClientRect().height}px`)
  }
  update()

  const observer = new ResizeObserver(update)
  observer.observe(header)
  return () => {
    observer.disconnect()
    root.style.removeProperty('--page-header-height')
  }
}
