import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const criticalUiFiles = [
  '../src/App.tsx',
  '../src/ui/components/AboutDialog.tsx',
  '../src/ui/components/CargoExportsEditor.tsx',
  '../src/ui/components/CargoPadEditor.tsx',
  '../src/ui/components/CargoPadsEditor.tsx',
  '../src/ui/components/CharacterHeader.tsx',
  '../src/ui/components/ConfirmDialog.tsx',
  '../src/ui/components/NetworkExportButton.tsx',
  '../src/ui/components/NetworkImportButton.tsx',
  '../src/ui/components/OutpostDetails.tsx',
  '../src/ui/components/OutpostList.tsx',
  '../src/ui/components/OutpostStatusMatrix.tsx',
  '../src/ui/components/PlannedSupplyEditor.tsx',
  '../src/ui/components/ValidationSummary.tsx',
  '../src/ui/layout/StatusBar.tsx',
  '../src/ui/layout/WorkspaceLayout.tsx',
]

/** Focused guard for the high-risk JSX paths; reference names and technical tokens are excluded. */
test('critical UI paths contain no literal English accessibility attributes or JSX copy', async () => {
  for (const relativePath of criticalUiFiles) {
    const source = (await readFile(new URL(relativePath, import.meta.url), 'utf8'))
      .replaceAll('Starfield Outpost Network', '')
    assert.doesNotMatch(source, /(?:aria-label|title|placeholder)="[A-Za-z][^"]+"/, relativePath)
    assert.doesNotMatch(source, />\s*[A-Za-z][A-Za-z ]{2,}[.!]?\s*</, relativePath)
  }
})
