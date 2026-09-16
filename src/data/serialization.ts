import type { OutpostNetwork } from '../domain/models'
import type { ReferenceData } from '../domain/referenceData'
import { migrateNetworkData } from './networkMigration.ts'
import {
  CURRENT_COLLECTION_SCHEMA_VERSION,
  migrateNetworkCollectionData,
} from './networkCollection.ts'
import type { NetworkCollection } from './networkCollection'
import { NetworkImportError } from './importErrors.ts'
import {
  validateExternalNetworkSource,
  validateImportedCollection,
} from './externalImportValidation.ts'

export function serializeNetwork(network: OutpostNetwork): string {
  return JSON.stringify(network, null, 2)
}

export function deserializeNetwork(
  json: string,
  referenceData?: ReferenceData,
): OutpostNetwork {
  const data: unknown = JSON.parse(json)
  if (!referenceData) {
    return migrateNetworkData(data)
  }
  const categories = new Map(referenceData?.resources.map((resource) => [
    resource.id, resource.category,
  ]))
  return migrateNetworkData(data, (resourceId) => categories.get(resourceId))
}

export function serializeNetworkCollection(collection: NetworkCollection): string {
  return JSON.stringify(collection, null, 2)
}

/** External imports are deliberately stricter than recoverable browser storage. */
export function deserializeNetworkCollection(
  json: string,
): NetworkCollection {
  const data: unknown = JSON.parse(json)
  if (typeof data !== 'object' || data === null ||
    !('networks' in data) || !Array.isArray(data.networks) ||
    !('schemaVersion' in data)) {
    throw new NetworkImportError('invalid-collection')
  }
  if (data.schemaVersion !== CURRENT_COLLECTION_SCHEMA_VERSION) {
    throw new NetworkImportError('unsupported-collection-schema', {
      version: typeof data.schemaVersion === 'string' || typeof data.schemaVersion === 'number'
        ? data.schemaVersion : 'invalid',
    })
  }
  if (data.networks.length === 0) {
    throw new NetworkImportError('empty-collection')
  }
  if (!('activeNetworkId' in data) || typeof data.activeNetworkId !== 'string') {
    throw new NetworkImportError('invalid-structure', { path: 'activeNetworkId' })
  }
  const networkIds = new Set<string>()
  for (const [index, candidate] of data.networks.entries()) {
    if (typeof candidate !== 'object' || candidate === null ||
      !('id' in candidate) || typeof candidate.id !== 'string' ||
      !('network' in candidate)) {
      throw new NetworkImportError('malformed-network-entry', { index })
    }
    if (!candidate.id || networkIds.has(candidate.id)) {
      throw new NetworkImportError('invalid-identity', {
        reason: candidate.id ? 'duplicate' : 'empty',
        scope: 'network',
        ...(candidate.id ? { id: candidate.id } : {}),
      })
    }
    networkIds.add(candidate.id)
    validateExternalNetworkSource(candidate.network, `networks[${index}].network`)
  }
  const collection = migrateNetworkCollectionData(data)
  validateImportedCollection(collection)
  return collection
}
