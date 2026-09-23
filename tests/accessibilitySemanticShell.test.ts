import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(path: string): Promise<string> {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('Matrix header presentation preserves the shared body-track and control contract', async () => {
  const css = await source('../src/ui/components/OutpostStatusMatrix.css')
  assert.match(css, /--outpost-matrix-columns:\s*minmax\(7\.5rem, 1\.35fr\)\s*minmax\(6rem, 0\.9fr\)\s*minmax\(6rem, 0\.55fr\)\s*minmax\(7rem, 0\.65fr\)\s*minmax\(4\.25rem, 1\.35fr\)\s*minmax\(7\.25rem, 1fr\)/)
  assert.match(css, /\.outpost-status-matrix__header,\s*\.outpost-status-matrix__row\s*\{[^}]*grid-template-columns: var\(--outpost-matrix-columns\)/)
  assert.match(css, /\.outpost-status-matrix__table\s*\{[^}]*min-width: 38rem/)
  assert.match(css, /\.outpost-status-matrix__state,\s*\.outpost-status-matrix__state--editable\s*\{[^}]*width: 3\.2rem;[^}]*height: 1\.55rem;/)
  assert.doesNotMatch(css, /:lang\(|\[lang[=|]/)
  const labelRule = css.match(/\.outpost-status-matrix__header-label\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.match(labelRule, /overflow-wrap: normal/)
  assert.match(labelRule, /word-break: normal/)
  assert.doesNotMatch(labelRule, /anywhere|break-all|break-word/)
  const logisticsRule = css.match(/\.outpost-status-matrix__header > \.outpost-status-matrix__logistics-heading\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.doesNotMatch(logisticsRule, /margin|transform|translate|position/)
  assert.match(css, /\.outpost-status-matrix__inputs-heading > \.outpost-status-matrix__header-label\s*\{[^}]*margin-inline:[^;]*var\(--matrix-inputs-overhang\)[^;]*var\(--matrix-header-group-gap\)[^;]*var\(--matrix-inputs-overhang\)/)
  assert.match(css, /\.outpost-status-matrix__heading-tail\s*\{[^}]*display: inline-flex;[^}]*white-space: nowrap;/)
  assert.match(css, /\.outpost-status-matrix__heading-tail > \.context-help\s*\{[^}]*padding: 0\.3rem;/)
})

test('application source contains exactly one main landmark', async () => {
  const [app, workspace] = await Promise.all([
    source('../src/App.tsx'),
    source('../src/ui/layout/WorkspaceLayout.tsx'),
  ])
  const mainElements = `${app}\n${workspace}`.match(/<main(?:\s|>)/g) ?? []

  assert.equal(mainElements.length, 1)
  assert.match(workspace, /<nav[\s\S]*aria-label=\{t\('outpost\.navigation\.heading'\)\}/)
  assert.match(workspace, /<aside[\s\S]*aria-label=\{t\('cargo\.heading'\)\}/)
})

test('fixed chrome shares dynamic document scroll insets and one status reservation', async () => {
  const [globalCss, statusCss, pageHeader, focusVisibility] = await Promise.all([
    source('../src/index.css'),
    source('../src/ui/layout/StatusBar.css'),
    source('../src/ui/layout/PageHeader.tsx'),
    source('../src/ui/focusVisibility.ts'),
  ])

  assert.match(globalCss, /--status-bar-height:\s*3\.5rem/)
  assert.match(globalCss, /padding-bottom:\s*var\(--status-bar-height\)/)
  assert.match(globalCss, /scroll-padding-block-start:\s*var\(--page-header-height\)/)
  assert.match(globalCss, /scroll-padding-block-end:\s*var\(--status-bar-height\)/)
  assert.match(statusCss, /height:\s*var\(--status-bar-height\)/)
  assert.match(pageHeader, /observePageHeaderHeight\(headerRef\.current\)/)
  assert.match(focusVisibility, /new ResizeObserver\(update\)/)
  assert.doesNotMatch(focusVisibility, /77px|77 px/)
})

test('selected-outpost container stacks editing columns at their combined practical minimum', async () => {
  const [workspaceCss, detailsCss, matrixCss, plannedSupplyCss] = await Promise.all([
    source('../src/ui/layout/WorkspaceLayout.css'),
    source('../src/ui/components/OutpostDetails.css'),
    source('../src/ui/components/OutpostStatusMatrix.css'),
    source('../src/ui/components/PlannedSupplyEditor.css'),
  ])

  assert.match(workspaceCss, /container-name:\s*selected-outpost/)
  assert.match(workspaceCss, /@container selected-outpost \(max-width: 39rem\)[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(detailsCss, /@container selected-outpost \(max-width: 39rem\)[\s\S]*grid-template-columns:[\s\S]*minmax\(0, 1fr\)[\s\S]*minmax\(0, 1fr\)/)
  assert.match(matrixCss, /\.outpost-status-matrix__scroll[\s\S]*overflow-x:\s*auto/)
  assert.match(plannedSupplyCss, /\.planned-supply__overflow[\s\S]*overflow-x:\s*auto/)
})

test('Matrix Manufacturing labels stay within the sticky Item track', async () => {
  const [matrix, matrixCss] = await Promise.all([
    source('../src/ui/components/OutpostStatusMatrix.tsx'),
    source('../src/ui/components/OutpostStatusMatrix.css'),
  ])

  assert.doesNotMatch(
    matrix,
    /outpost-status-matrix__item--span-source outpost-status-matrix__manufacturing-item/,
  )
  assert.match(
    matrix,
    /outpost-status-matrix__manufacturing-item" role="rowheader" title=\{display\.name\}[\s\S]*?<span>\{display\.name\}<\/span><\/div>\s*<div role="cell" \/>/,
  )
  assert.match(
    matrixCss,
    /\.outpost-status-matrix__manufacturing-item\s*\{[^}]*overflow:\s*visible;/,
  )
  assert.match(
    matrixCss,
    /\.outpost-status-matrix__manufacturing-item span\s*\{[^}]*overflow:\s*visible;[^}]*text-overflow:\s*clip;/,
  )
})

test('dense controls retain forced-colors cues and practical target sizes', async () => {
  const [matrixCss, plannedSupplyCss, cargoCss, cargoPadsCss, searchCss, helpCss] = await Promise.all([
    source('../src/ui/components/OutpostStatusMatrix.css'),
    source('../src/ui/components/PlannedSupplyEditor.css'),
    source('../src/ui/components/CargoPadEditor.css'),
    source('../src/ui/components/CargoPadsEditor.css'),
    source('../src/ui/components/SearchForItems.css'),
    source('../src/ui/components/ContextHelp.css'),
  ])

  assert.match(
    matrixCss,
    /@media \(forced-colors: active\)[\s\S]*aria-pressed='true'[\s\S]*data-state='lit'[\s\S]*border:\s*3px double CanvasText;[\s\S]*color:\s*CanvasText;[\s\S]*background:\s*Canvas;/,
  )
  assert.match(matrixCss, /@media \(forced-colors: active\)[\s\S]*color:\s*ButtonText;[\s\S]*background:\s*ButtonFace;/)
  assert.match(matrixCss, /@media \(forced-colors: active\)[\s\S]*:disabled[\s\S]*border-style:\s*dashed;/)
  assert.match(matrixCss, /@media \(forced-colors: active\)[\s\S]*:focus-visible[\s\S]*outline-color:\s*CanvasText;/)
  assert.match(matrixCss, /app-programmatic-focus-visible[\s\S]*outline-color:\s*CanvasText;/)
  assert.match(matrixCss, /\.outpost-status-matrix__compact-action[\s\S]*min-height:\s*1\.55rem/)
  assert.match(plannedSupplyCss, /@media \(forced-colors: active\)[\s\S]*data-state='planned'/)
  assert.match(plannedSupplyCss, /\.planned-supply__expand-toggle[\s\S]*width:\s*1\.5rem[\s\S]*height:\s*1\.5rem/)
  assert.match(cargoCss, /@media \(forced-colors: active\)[\s\S]*data-state='stale'[\s\S]*border:\s*2px dashed CanvasText/)
  assert.match(cargoPadsCss, /\.cargo-pad__summary button[\s\S]*width:\s*1\.5rem[\s\S]*height:\s*1\.5rem/)
  assert.match(searchCss, /\.item-search__control \{[^}]*height:\s*1\.5rem/)
  assert.match(helpCss, /\.context-help__trigger[\s\S]*width:\s*0\.9rem[\s\S]*height:\s*0\.9rem/)
  assert.match(helpCss, /\.context-help__trigger::before[\s\S]*inset:\s*calc\(-0\.3rem - 1px\)/)
})
