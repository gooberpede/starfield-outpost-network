import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import { createHash, webcrypto } from 'node:crypto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocalizationProvider } from '../src/localization/LocalizationProvider'
import { translate } from '../src/localization/catalog'
import { ReferenceStartupGate } from '../src/ReferenceStartupGate'
import { ReferenceIntegrityError, loadReferenceData } from '../src/data/referenceDataLoader'
import type { ReferenceFailureCode } from '../src/data/referenceDataLoader'
import { referenceAssets } from '../src/data/referenceManifest'
import { canonicalDatasetContent } from '../src/data/referenceManifest'
import type { ReferenceData } from '../src/domain/referenceData'

let manifest: { schemaVersion: number; datasetId: string; assets: { path: string; sha256: string }[] }
const files = new Map<string, Uint8Array>()
beforeAll(async () => {
  vi.stubGlobal('crypto', webcrypto)
  manifest = JSON.parse(await readFile('public/reference-data/manifest.json', 'utf8'))
  for (const [path] of referenceAssets) files.set(path, new Uint8Array(await readFile(`public/reference-data/${path}`)))
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear() })

function response(bytes: Uint8Array | string, status = 200, type = 'application/json; charset=utf-8'): Response {
  return new Response(bytes instanceof Uint8Array ? new Uint8Array(bytes) : bytes, { status, headers: { 'content-type': type } })
}
function serve(override?: (path: string) => Response | undefined, alteredManifest = manifest) {
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const path = url.replace('/reference-data/', '')
    return override?.(path) ?? (path === 'manifest.json'
      ? response(JSON.stringify(alteredManifest))
      : response(files.get(path)!))
  }))
}
async function code(): Promise<ReferenceFailureCode> {
  try { await loadReferenceData(); throw new Error('expected failure') }
  catch (error) {
    if (!(error instanceof ReferenceIntegrityError)) throw error
    return error.failure.code
  }
}

describe('runtime integrity loader', () => {
  it('accepts the complete exact-byte deployed snapshot', async () => {
    serve()
    const data = await loadReferenceData()
    expect(data.systems.length).toBeGreaterThan(0)
    expect(data.inorganicOccurrences.length).toBeGreaterThan(0)
    expect(Object.keys(data)).toHaveLength(13)
  })
  it.each([
    ['manifest status', (path: string) => path === 'manifest.json' ? response('{}', 404) : undefined, 'REF_MANIFEST_FETCH'],
    ['manifest HTML fallback', (path: string) => path === 'manifest.json' ? response('<html/>', 200, 'text/html') : undefined, 'REF_MANIFEST_INVALID'],
    ['manifest JSON', (path: string) => path === 'manifest.json' ? response('{') : undefined, 'REF_MANIFEST_INVALID'],
    ['asset status', (path: string) => path === 'biomes.json' ? response('{}', 404) : undefined, 'REF_ASSET_FETCH'],
    ['asset HTML fallback', (path: string) => path === 'biomes.json' ? response('<html/>', 200, 'text/html') : undefined, 'REF_ASSET_CONTENT_TYPE'],
    ['asset wrong MIME', (path: string) => path === 'biomes.json' ? response('{}', 200, 'text/plain') : undefined, 'REF_ASSET_CONTENT_TYPE'],
    ['asset hash', (path: string) => path === 'biomes.json' ? response('[]') : undefined, 'REF_ASSET_HASH'],
    ['asset oversized', (path: string) => path === 'biomes.json' ? response(' '.repeat(8 * 1024 * 1024 + 1)) : undefined, 'REF_ASSET_SIZE'],
  ] as const)('%s fails closed', async (_name, override, expected) => {
    serve(override)
    expect(await code()).toBe(expected)
  })
  it.each([
    ['version', (m: typeof manifest) => ({ ...m, schemaVersion: 2 }), 'REF_MANIFEST_VERSION'],
    ['missing asset', (m: typeof manifest) => ({ ...m, assets: m.assets.slice(1) }), 'REF_MANIFEST_INVALID'],
    ['duplicate asset', (m: typeof manifest) => ({ ...m, assets: [m.assets[0], ...m.assets.slice(0, -1)] }), 'REF_MANIFEST_INVALID'],
    ['path traversal', (m: typeof manifest) => ({ ...m, assets: [{ ...m.assets[0], path: '../biomes.json' }, ...m.assets.slice(1)] }), 'REF_MANIFEST_INVALID'],
    ['absolute URL', (m: typeof manifest) => ({ ...m, assets: [{ ...m.assets[0], path: 'https://example.com/biomes.json' }, ...m.assets.slice(1)] }), 'REF_MANIFEST_INVALID'],
    ['malformed hash', (m: typeof manifest) => ({ ...m, assets: [{ ...m.assets[0], sha256: 'bad' }, ...m.assets.slice(1)] }), 'REF_MANIFEST_INVALID'],
    ['dataset ID', (m: typeof manifest) => ({ ...m, datasetId: 'sha256:' + '0'.repeat(64) }), 'REF_MANIFEST_INVALID'],
  ] as const)('rejects manifest %s', async (_name, change, expected) => {
    serve(undefined, change(manifest))
    expect(await code()).toBe(expected)
  })
  it('reports the first failed asset in manifest order despite completion order', async () => {
    serve((path) => path === 'biomes.json' || path === 'body-biomes.json' ? response('{}', 404) : undefined)
    await expect(loadReferenceData()).rejects.toMatchObject({ failure: { asset: 'biomes.json' } })
  })
  it('fails if Web Crypto is unavailable', async () => {
    serve()
    vi.stubGlobal('crypto', {})
    expect(await code()).toBe('REF_LOADER_INTERNAL')
  })
  it('rejects a self-consistent manifest from another app build', async () => {
    const changed = { ...manifest, assets: manifest.assets.map((entry, index) => index === 0 ? { ...entry, sha256: '0'.repeat(64) } : entry) }
    changed.datasetId = 'sha256:' + createHash('sha256').update(canonicalDatasetContent(changed.assets)).digest('hex')
    serve(undefined, changed)
    expect(await code()).toBe('REF_BUILD_MISMATCH')
  })
  it.each([
    ['invalid JSON', '{', 'REF_ASSET_JSON'],
    ['invalid shape', '[{"id":42,"name":"Bad"}]', 'REF_ASSET_SCHEMA'],
  ] as const)('detects a correctly hashed asset with %s', async (_name, payload, expected) => {
    const changed = { ...manifest, assets: manifest.assets.map((entry, index) => index === 0 ? { ...entry, sha256: createHash('sha256').update(payload).digest('hex') } : entry) }
    changed.datasetId = 'sha256:' + createHash('sha256').update(canonicalDatasetContent(changed.assets)).digest('hex')
    serve((path) => path === 'biomes.json' ? response(payload) : undefined, changed)
    await expect(loadReferenceData(undefined, changed.datasetId)).rejects.toMatchObject({ failure: { code: expected } })
  })
})

describe('startup gate and fatal state', () => {
  it('has Japanese messages and en-GB baseline fallback', () => {
    expect(translate('ja-JP', 'referenceFatal.heading')).toBe('参照データを利用できません')
    expect(translate('en-GB', 'referenceFatal.heading')).toBe(translate('en-US', 'referenceFatal.heading'))
    expect(translate('ja-JP', 'referenceFatal.reason.assetSize')).toContain('サイズ制限')
  })
  it('keeps App and persistence inactive while pending and after failure, then retries successfully', async () => {
    let reject!: (error: unknown) => void
    let resolve!: (data: ReferenceData) => void
    const load = vi.fn()
      .mockImplementationOnce(() => new Promise<ReferenceData>((_resolve, fail) => { reject = fail }))
      .mockImplementationOnce(() => new Promise<ReferenceData>((pass) => { resolve = pass }))
    const renderApp = vi.fn(() => <div>Editor mounted</div>)
    localStorage.setItem('starfield-outpost-network', 'SECRET_NETWORK_NAME_AND_NOTES')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    render(<LocalizationProvider><ReferenceStartupGate load={load} renderApp={renderApp} /></LocalizationProvider>)
    expect(renderApp).not.toHaveBeenCalled()
    reject(new ReferenceIntegrityError({ code: 'REF_ASSET_CONTENT_TYPE', asset: 'biomes.json' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Reference data unavailable' })).toHaveFocus()
    expect(renderApp).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
    const report = screen.getByRole('link', { name: 'Report' }) as HTMLAnchorElement
    const uri = decodeURIComponent(report.href)
    expect(uri).toContain('mailto:support@starfieldoutposts.com')
    expect(uri).toContain('REF_ASSET_CONTENT_TYPE')
    expect(uri).toContain('biomes.json')
    expect(uri).not.toContain('localStorage')
    expect(uri).not.toContain('SECRET_NETWORK_NAME_AND_NOTES')
    expect(screen.getByText(/No saved network data/)).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Reload' })).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(renderApp).not.toHaveBeenCalled()
    resolve({ systems: [] } as unknown as ReferenceData)
    await waitFor(() => expect(screen.getByText('Editor mounted')).toBeInTheDocument())
    expect(renderApp).toHaveBeenCalledTimes(1)
  })
})
