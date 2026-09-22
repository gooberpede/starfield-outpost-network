import assert from 'node:assert/strict'
import test from 'node:test'

import {
  alignVerticalScrollToCssPixels,
  getMinimalVerticalScroll,
} from '../src/ui/focusVisibility.ts'

test('visible targets need no vertical correction', () => {
  assert.equal(getMinimalVerticalScroll(
    { top: 120, bottom: 180 },
    { top: 80, bottom: 300 },
  ), 0)
})

test('targets above the usable interval use the smallest upward correction', () => {
  assert.equal(getMinimalVerticalScroll(
    { top: 60, bottom: 100 },
    { top: 80, bottom: 300 },
  ), -20)
})

test('targets below the usable interval use the smallest downward correction', () => {
  assert.equal(getMinimalVerticalScroll(
    { top: 280, bottom: 325 },
    { top: 80, bottom: 300 },
  ), 25)
})

test('fractional corrections round outward so fixed chrome cannot retain a sliver', () => {
  assert.equal(alignVerticalScrollToCssPixels(0.42), 1)
  assert.equal(alignVerticalScrollToCssPixels(-0.42), -1)
})
