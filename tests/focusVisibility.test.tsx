import { fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import {
  focusAndReveal,
  observePageHeaderHeight,
} from '../src/ui/focusVisibility.ts'

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    height: bottom - top,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

test('header measurement updates the shared document inset when its size changes', () => {
  let resize: (() => void) | undefined
  class ResizeObserverMock {
    constructor(callback: () => void) { resize = callback }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)

  const header = document.createElement('header')
  let height = 77
  header.getBoundingClientRect = () => rect(0, height)
  const disconnect = observePageHeaderHeight(header)
  expect(document.documentElement.style.getPropertyValue('--page-header-height')).toBe('77px')

  height = 132
  resize?.()
  expect(document.documentElement.style.getPropertyValue('--page-header-height')).toBe('132px')
  disconnect()
  expect(document.documentElement.style.getPropertyValue('--page-header-height')).toBe('')
  vi.unstubAllGlobals()
})

test('an already-focused target above fixed chrome is minimally revealed and marked', () => {
  const header = document.createElement('header')
  header.className = 'page-header'
  header.getBoundingClientRect = () => rect(0, 80)
  const status = document.createElement('footer')
  status.className = 'status-bar'
  status.getBoundingClientRect = () => rect(300, 350)
  const target = document.createElement('button')
  target.getBoundingClientRect = () => rect(60, 100)
  document.body.append(header, target, status)
  target.focus()
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  vi.stubGlobal('requestAnimationFrame', vi.fn())

  expect(focusAndReveal(target, { showFocusRing: true })).toBe(true)
  expect(target).toHaveFocus()
  expect(target).toHaveClass('app-programmatic-focus-visible')
  expect(scrollBy).toHaveBeenCalledWith({ top: -20, behavior: 'auto' })

  fireEvent.blur(target)
  expect(target).not.toHaveClass('app-programmatic-focus-visible')
  scrollBy.mockRestore()
  header.remove()
  target.remove()
  status.remove()
  vi.unstubAllGlobals()
})

test('nested scroll targets use their local container without moving the document', () => {
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  const scroller = document.createElement('div')
  scroller.style.overflowY = 'auto'
  Object.defineProperties(scroller, {
    clientHeight: { value: 100 },
    scrollHeight: { value: 300 },
  })
  scroller.getBoundingClientRect = () => rect(100, 200)
  const target = document.createElement('button')
  target.getBoundingClientRect = () => rect(215, 240)
  scroller.append(target)
  overlay.append(scroller)
  document.body.append(overlay)
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  const focus = vi.spyOn(target, 'focus')
  vi.stubGlobal('requestAnimationFrame', vi.fn())

  focusAndReveal(target, { preventScroll: true })
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(scroller.scrollTop).toBe(40)
  expect(scrollBy).not.toHaveBeenCalled()
  focus.mockRestore()
  scrollBy.mockRestore()
  overlay.remove()
  vi.unstubAllGlobals()
})
