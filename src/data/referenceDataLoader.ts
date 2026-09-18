/** Validates deployment bytes before App mounts. */
import type { ReferenceData } from '../domain/referenceData'
import { expectedReferenceDatasetId } from '../generated/referenceDataset'
import { canonicalDatasetContent, maxReferenceAssetBytes, maxReferenceManifestBytes, referenceAssets, referenceManifestSchemaVersion } from './referenceManifest'
import type { ReferenceAssetEntry } from './referenceManifest'

export type ReferenceFailureCode =
  | 'REF_MANIFEST_FETCH' | 'REF_MANIFEST_INVALID' | 'REF_MANIFEST_VERSION'
  | 'REF_BUILD_MISMATCH' | 'REF_ASSET_FETCH' | 'REF_ASSET_CONTENT_TYPE'
  | 'REF_ASSET_JSON' | 'REF_ASSET_SCHEMA' | 'REF_ASSET_SIZE' | 'REF_ASSET_HASH'
  | 'REF_LOADER_INTERNAL'

export interface ReferenceFailure {
  code: ReferenceFailureCode
  asset?: string
  status?: number
  mediaType?: string
  schemaVersion?: number
  expectedDatasetId?: string
  actualDatasetId?: string
  expectedHashPrefix?: string
  actualHashPrefix?: string
}

export class ReferenceIntegrityError extends Error {
  readonly failure: ReferenceFailure
  constructor(failure: ReferenceFailure) { super(failure.code); this.failure = failure }
}

function fail(failure: ReferenceFailure): never { throw new ReferenceIntegrityError(failure) }
function mediaType(response: Response): string {
  const type = (response.headers.get('content-type') ?? '').split(';', 1)[0].trim().toLowerCase()
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(type) ? type : ''
}
function isJsonMediaType(type: string): boolean {
  return type === 'application/json' || /^[\w!#$&^.+-]+\/[\w!#$&^.+-]+\+json$/.test(type)
}

class ReferenceAssetSizeError extends Error {}

async function boundedBytes(response: Response, limit: number): Promise<Uint8Array> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Reference response has no bounded stream')
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.length
      if (length > limit) {
        await reader.cancel().catch(() => undefined)
        throw new ReferenceAssetSizeError('Reference response exceeds size limit')
      }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes
}

async function sha256(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) return fail({ code: 'REF_LOADER_INTERNAL' })
  try {
    const buffer = new ArrayBuffer(bytes.length)
    new Uint8Array(buffer).set(bytes)
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)))
      .map((part) => part.toString(16).padStart(2, '0')).join('')
  } catch { return fail({ code: 'REF_LOADER_INTERNAL' }) }
}
function parseJson(bytes: Uint8Array, failure: ReferenceFailure): unknown {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) }
  catch { return fail(failure) }
}
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateManifest(value: unknown): { datasetId: string; assets: ReferenceAssetEntry[] } {
  if (!object(value)) return fail({ code: 'REF_MANIFEST_INVALID' })
  if (typeof value.schemaVersion !== 'number' || !Number.isInteger(value.schemaVersion)) return fail({ code: 'REF_MANIFEST_INVALID' })
  if (value.schemaVersion !== referenceManifestSchemaVersion) {
    return fail({ code: 'REF_MANIFEST_VERSION', schemaVersion: value.schemaVersion })
  }
  if (typeof value.datasetId !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(value.datasetId) || !Array.isArray(value.assets) || value.assets.length !== referenceAssets.length) {
    return fail({ code: 'REF_MANIFEST_INVALID' })
  }
  const assets: ReferenceAssetEntry[] = []
  for (let index = 0; index < referenceAssets.length; index++) {
    const entry: unknown = value.assets[index]
    if (!object(entry) || entry.path !== referenceAssets[index][0] || typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      return fail({ code: 'REF_MANIFEST_INVALID' })
    }
    assets.push({ path: entry.path as string, sha256: entry.sha256 })
  }
  return { datasetId: value.datasetId, assets }
}
function validateShape(value: unknown, specification: readonly string[]): boolean {
  if (!Array.isArray(value) || value.length === 0) return false
  const [, , ...fields] = specification
  const ids = new Set<string>()
  for (const row of value) {
    if (!object(row)) return false
    for (const field of fields) {
      const part = row[field]
      if (field === 'domesticable' || field === 'outpostAllowed') {
        if (typeof part !== 'boolean') return false
      } else if (field === 'biomeIndex') {
        if (typeof part !== 'number' || !Number.isFinite(part)) return false
      } else if (field === 'inputs' || field === 'ingredients' || field === 'resourceIds') {
        if (!Array.isArray(part)) return false
      } else if (field === 'location') {
        if (!object(part) || typeof part.type !== 'string') return false
      } else if (typeof part !== 'string' || !part) return false
    }
    if (fields[0] === 'id') {
      if (typeof row.id !== 'string' || !row.id || ids.has(row.id)) return false
      ids.add(row.id)
    }
  }
  return true
}
async function fetchAsset(entry: ReferenceAssetEntry, specification: readonly string[], signal?: AbortSignal): Promise<unknown> {
  const asset = entry.path
  let response: Response
  try { response = await fetch(`/reference-data/${asset}`, { cache: 'no-store', signal }) }
  catch { return fail({ code: 'REF_ASSET_FETCH', asset }) }
  if (!response.ok) return fail({ code: 'REF_ASSET_FETCH', asset, status: response.status })
  const type = mediaType(response)
  if (!isJsonMediaType(type)) return fail({ code: 'REF_ASSET_CONTENT_TYPE', asset, mediaType: type })
  let bytes: Uint8Array
  try { bytes = await boundedBytes(response, maxReferenceAssetBytes) }
  catch (error) { return fail({ code: error instanceof ReferenceAssetSizeError ? 'REF_ASSET_SIZE' : 'REF_ASSET_SCHEMA', asset }) }
  const actualHash = await sha256(bytes)
  if (actualHash !== entry.sha256) return fail({ code: 'REF_ASSET_HASH', asset, expectedHashPrefix: entry.sha256.slice(0, 12), actualHashPrefix: actualHash.slice(0, 12) })
  const parsed = parseJson(bytes, { code: 'REF_ASSET_JSON', asset })
  if (!validateShape(parsed, specification)) return fail({ code: 'REF_ASSET_SCHEMA', asset })
  return parsed
}

export async function loadReferenceData(signal?: AbortSignal, expectedDatasetId = expectedReferenceDatasetId): Promise<ReferenceData> {
  let response: Response
  try { response = await fetch('/reference-data/manifest.json', { cache: 'no-store', signal }) }
  catch { return fail({ code: 'REF_MANIFEST_FETCH' }) }
  if (!response.ok) return fail({ code: 'REF_MANIFEST_FETCH', status: response.status })
  const type = mediaType(response)
  if (!isJsonMediaType(type)) return fail({ code: 'REF_MANIFEST_INVALID', mediaType: type })
  let bytes: Uint8Array
  try { bytes = await boundedBytes(response, maxReferenceManifestBytes) }
  catch { return fail({ code: 'REF_MANIFEST_INVALID' }) }
  const manifest = validateManifest(parseJson(bytes, { code: 'REF_MANIFEST_INVALID' }))
  const canonicalHash = await sha256(new TextEncoder().encode(canonicalDatasetContent(manifest.assets)))
  if (manifest.datasetId !== `sha256:${canonicalHash}`) return fail({ code: 'REF_MANIFEST_INVALID' })
  if (manifest.datasetId !== expectedDatasetId) return fail({ code: 'REF_BUILD_MISMATCH', expectedDatasetId, actualDatasetId: manifest.datasetId })
  const settled = await Promise.allSettled(manifest.assets.map((entry, index) => fetchAsset(entry, referenceAssets[index], signal)))
  const data: Record<string, unknown> = {}
  for (let index = 0; index < settled.length; index++) {
    const result = settled[index]
    if (result.status === 'rejected') {
      if (result.reason instanceof ReferenceIntegrityError) throw result.reason
      return fail({ code: 'REF_LOADER_INTERNAL' })
    }
    data[referenceAssets[index][1]] = result.value
  }
  return data as unknown as ReferenceData
}
