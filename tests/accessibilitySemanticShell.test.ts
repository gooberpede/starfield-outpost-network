import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function source(path: string): Promise<string> {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

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
