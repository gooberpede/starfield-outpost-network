import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(path: string): Promise<string> {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('Japanese typography selects an explicit UI stack and keeps mono separate', async () => {
  const css = await source('../src/index.css')
  assert.match(css, /:lang\(ja\)[\s\S]*--ui-font:[\s\S]*'Yu Gothic UI'[\s\S]*'Hiragino Sans'[\s\S]*Meiryo/)
  assert.match(css, /--ui-font-mono:\s*'IBM Plex Mono'/)
  assert.match(css, /--ui-font-brand:\s*'Barlow Semi Condensed'/)
  assert.doesNotMatch(css, /\.woff2?|\.ttf|\.otf/)

  const titleBarCss = await source('../src/ui/layout/TitleBar.css')
  assert.match(titleBarCss, /\.title-bar h1[\s\S]*font-family: var\(--ui-font-brand\)/)

  const validationCss = await source('../src/ui/components/ValidationSummary.css')
  const contextRule = validationCss.match(/\.validation-summary-panel__context\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(contextRule, /var\(--ui-font\)/)
  assert.doesNotMatch(contextRule, /var\(--ui-font-mono\)/)
})

test('compact Add controls retain full semantics and Inter-System uses an accessible symbol', async () => {
  const outposts = await source('../src/ui/components/OutpostList.tsx')
  assert.match(outposts, /aria-label=\{t\('outpost\.navigation\.addButton'\)\}/)
  assert.match(outposts, /title=\{t\('outpost\.navigation\.addButton'\)\}/)
  assert.match(outposts, /\{t\('common\.add'\)\}/)

  const cargo = await source('../src/ui/components/CargoPadsEditor.tsx')
  assert.match(cargo, /aria-label=\{t\('cargo\.addButton'\)\}/)
  assert.match(cargo, /title=\{t\('cargo\.addButton'\)\}/)
  assert.match(cargo, /aria-label=\{t\('cargo\.interstellar'\)\}/)
  assert.match(cargo, /✷⇄✷/)
  assert.doesNotMatch(cargo, /\[INT\]/)
  assert.match(cargo, /pad\.type === 'interstellar'/)
})

test('responsive hardening keeps the matrix scroller untouched', async () => {
  const headerCss = await source('../src/ui/layout/PageHeader.css')
  assert.match(headerCss, /@media \(max-width: 1280px\)[\s\S]*\.page-header__main\s*\{\s*grid-column: 1 \/ -1;/)

  const detailsCss = await source('../src/ui/components/OutpostDetails.css')
  assert.match(detailsCss, /@media \(max-width: 1180px\)/)
  assert.match(detailsCss, /\.outpost-details__biomes\s*\{\s*grid-column: 1 \/ -1;/)

  const matrixCss = await source('../src/ui/components/OutpostStatusMatrix.css')
  assert.match(matrixCss, /overflow-x:\s*auto/)
})
