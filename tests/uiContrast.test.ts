import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)?.map((channel) => parseInt(channel, 16) / 255)
  assert.ok(channels && channels.length === 3)
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

test('readable muted text meets normal-text contrast on every intended solid surface', async () => {
  const source = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  const tokens = Object.fromEntries(
    [...source.matchAll(/--(ui-[\w-]+):\s*(#[0-9a-f]{6});/gi)]
      .map((match) => [match[1], match[2].toLowerCase()]),
  )

  assert.notEqual(tokens['ui-text-muted'], tokens['ui-text-disabled'])
  for (const surface of ['ui-background', 'ui-surface', 'ui-panel', 'ui-highlight']) {
    assert.ok(
      contrastRatio(tokens['ui-text-muted'], tokens[surface]) >= 4.5,
      `ui-text-muted must retain 4.5:1 contrast on ${surface}`,
    )
  }
})
