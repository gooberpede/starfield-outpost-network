import { fireEvent, render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'
import { NetworkImportButton } from '../src/ui/components/NetworkImportButton.tsx'

afterEach(() => vi.unstubAllGlobals())

test('4 MiB reads normally; one byte over reports failure before reading or changing state', () => {
  let document = JSON.stringify({ schemaVersion: 1, activeNetworkId: 'n',
    networks: [{ id: 'n', network: createDefaultNetwork() }] })
  const reads = vi.fn()
  class Reader {
    result: string | null = null
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    readAsText() {
      reads()
      this.result = document
      this.onload?.()
    }
  }
  vi.stubGlobal('FileReader', Reader)
  const onImport = vi.fn()
  const onImportError = vi.fn()
  const view = render(<LocalizationContext value={{
    locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
    setLocaleOverride: vi.fn(), t: (key, parameters) => translate('en-US', key, parameters),
  }}><NetworkImportButton onImport={onImport} onImportError={onImportError} /></LocalizationContext>)
  const input = view.container.querySelector('input[type=file]')!
  const file = new File(['{}'], 'network.json', { type: 'application/json' })
  Object.defineProperty(file, 'size', { value: 4 * 1024 * 1024 })
  fireEvent.change(input, { target: { files: [file] } })
  expect(reads).toHaveBeenCalledTimes(1)
  expect(onImport).toHaveBeenCalledTimes(1)
  expect(onImportError).not.toHaveBeenCalled()

  const oversized = new File(['{}'], 'oversized.json', { type: 'application/json' })
  Object.defineProperty(oversized, 'size', { value: 4 * 1024 * 1024 + 1 })
  fireEvent.change(input, { target: { files: [oversized] } })
  expect(reads).toHaveBeenCalledTimes(1)
  expect(onImport).toHaveBeenCalledTimes(1)
  expect(onImportError).toHaveBeenCalledWith('oversized.json', {
    key: 'status.import.fileTooLarge', parameters: { actual: 4 * 1024 * 1024 + 1, maximum: 4 * 1024 * 1024 },
  }, undefined)

  document = JSON.stringify({ schemaVersion: 1, activeNetworkId: 'n0',
    networks: Array.from({ length: 65 }, (_, i) => ({ id: `n${i}`, network: createDefaultNetwork() })),
  })
  fireEvent.change(input, { target: { files: [new File(['{}'], 'too-many-networks.json')] } })
  expect(reads).toHaveBeenCalledTimes(2)
  expect(onImport).toHaveBeenCalledTimes(1)
  expect(onImportError).toHaveBeenCalledWith('too-many-networks.json', {
    key: 'status.import.tooManyNetworks', parameters: { path: 'networks', actual: 65, maximum: 64 },
  }, undefined)
})
