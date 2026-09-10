import assert from 'node:assert/strict'
import test from 'node:test'
import {
  beginSearchPaletteDrag,
  clampSearchPalettePosition,
  finishSearchPaletteDrag,
  getInitialSearchPalettePosition,
  moveSearchPaletteDrag,
  resolveSearchPalettePositionOnOpen,
} from '../src/ui/itemSearchPosition.ts'

test('initial placement appears below its anchor and clamps to the safe viewport', () => {
  assert.deepEqual(getInitialSearchPalettePosition(
    { left: 100, bottom: 80 }, { width: 300, height: 200 }, { width: 1000, height: 800 },
  ), { left: 100, top: 86 })
  assert.deepEqual(getInitialSearchPalettePosition(
    { left: 900, bottom: 700 }, { width: 300, height: 200 }, { width: 1000, height: 800 },
  ), { left: 688, top: 532 })
})

test('pointer and keyboard candidate positions share viewport/status-bar clamping', () => {
  assert.deepEqual(clampSearchPalettePosition(
    { left: -20, top: -10 }, { width: 400, height: 300 }, { width: 800, height: 600 },
  ), { left: 12, top: 12 })
  assert.deepEqual(clampSearchPalettePosition(
    { left: 900, top: 900 }, { width: 400, height: 300 }, { width: 800, height: 600 },
  ), { left: 388, top: 232 })
})

test('outline drag clamps transient movement and commits only on completion', () => {
  const original = { left: 100, top: 100 }
  const started = beginSearchPaletteDrag(original)
  const moved = moveSearchPaletteDrag(
    started,
    { left: 900, top: -40 },
    { width: 300, height: 200 },
    { width: 800, height: 600 },
  )
  assert.deepEqual(started, { original, outline: original })
  assert.deepEqual(moved, { original, outline: { left: 488, top: 12 } })
  assert.deepEqual(finishSearchPaletteDrag(moved, false), { left: 488, top: 12 })
})

test('pointer cancellation restores the original committed position', () => {
  const started = beginSearchPaletteDrag({ left: 80, top: 90 })
  const moved = moveSearchPaletteDrag(
    started,
    { left: 250, top: 260 },
    { width: 300, height: 200 },
    { width: 800, height: 600 },
  )
  assert.deepEqual(finishSearchPaletteDrag(moved, true), { left: 80, top: 90 })
})

test('close and reopen retain the last committed position until a network reset', () => {
  const committed = finishSearchPaletteDrag(moveSearchPaletteDrag(
    beginSearchPaletteDrag({ left: 80, top: 90 }),
    { left: 260, top: 220 },
    { width: 300, height: 200 },
    { width: 800, height: 600 },
  ), false)
  const anchor = { left: 100, bottom: 80 }
  const palette = { width: 300, height: 200 }
  const viewport = { width: 1000, height: 800 }

  // Closing changes visibility only, so the committed network-local position remains.
  assert.deepEqual(
    resolveSearchPalettePositionOnOpen(committed, anchor, palette, viewport),
    { left: 260, top: 220 },
  )
  // A network/lifecycle reset clears it, so the next open uses initial placement.
  assert.deepEqual(
    resolveSearchPalettePositionOnOpen(null, anchor, palette, viewport),
    { left: 100, top: 86 },
  )
})
