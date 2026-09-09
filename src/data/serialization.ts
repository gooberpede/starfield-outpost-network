import type { OutpostNetwork } from '../domain/models'
import type { ReferenceData } from '../domain/referenceData'
import { migrateNetworkData } from './networkMigration.ts'
import {
  CURRENT_COLLECTION_SCHEMA_VERSION,
  migrateNetworkCollectionData,
} from './networkCollection.ts'
import type { NetworkCollection } from './networkCollection'

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
    !('schemaVersion' in data) || data.schemaVersion !== CURRENT_COLLECTION_SCHEMA_VERSION) {
    throw new Error('The selected file is not a valid network collection.')
  }
  if (data.networks.length === 0) {
    throw new Error('The selected collection does not contain any networks.')
  }
  const ids = new Set<string>()
  for (const candidate of data.networks) {
    if (typeof candidate !== 'object' || candidate === null ||
      !('id' in candidate) || typeof candidate.id !== 'string' || !candidate.id ||
      !('network' in candidate)) {
      throw new Error('The selected collection contains a malformed network entry.')
    }
    if (ids.has(candidate.id)) {
      throw new Error(`The selected collection contains duplicate network ID "${candidate.id}".`)
    }
    ids.add(candidate.id)
    migrateNetworkData(candidate.network)
  }
  return migrateNetworkCollectionData(data)
}
