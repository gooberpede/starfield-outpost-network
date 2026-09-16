/** Browser persistence for the ordered collection of universe networks. */
import {
  createDefaultNetworkCollection,
  migrateStoredNetworkData,
} from './networkCollection.ts'
import type { NetworkCollection } from './networkCollection'
import { validateStoredSource, validateRecoveredCollection } from './storageCoherence.ts'
import { MAX_STORED_LENGTH, StorageEnvelopeError, validateStorageEnvelope } from './storageEnvelope.ts'

const STORAGE_KEY = 'starfield-outpost-network'

export type PersistenceStatus =
  | { kind: 'saved' }
  | { kind: 'unsaved'; reason: 'write-failed' | 'capacity-exceeded' }
  | { kind: 'recovery-fallback'; reason: 'too-large' | 'resource-limit' | 'malformed' | 'unrecoverable' }
  | { kind: 'storage-unavailable'; reason: 'read-failed' }

export interface CollectionLoadResult {
  collection: NetworkCollection
  status: PersistenceStatus
}

/** A failed source is never written over during initialization. */
export function initializeNetworkCollection(): CollectionLoadResult {
  let storedValue: string | null
  try {
    storedValue = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { collection: createDefaultNetworkCollection(),
      status: { kind: 'storage-unavailable', reason: 'read-failed' } }
  }
  if (!storedValue) {
    const collection = createDefaultNetworkCollection()
    return { collection, status: trySaveNetworkCollection(collection) }
  }
  if (storedValue.length > MAX_STORED_LENGTH) return {
    collection: createDefaultNetworkCollection(),
    status: { kind: 'recovery-fallback', reason: 'too-large' },
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(storedValue)
  } catch {
    return { collection: createDefaultNetworkCollection(),
      status: { kind: 'recovery-fallback', reason: 'malformed' } }
  }
  try {
    validateStorageEnvelope(parsed)
  } catch {
    return { collection: createDefaultNetworkCollection(),
      status: { kind: 'recovery-fallback', reason: 'resource-limit' } }
  }
  let collection: NetworkCollection
  try {
    validateStoredSource(parsed)
    collection = migrateStoredNetworkData(parsed, true)
    validateRecoveredCollection(collection)
  } catch {
    return { collection: createDefaultNetworkCollection(),
      status: { kind: 'recovery-fallback', reason: 'unrecoverable' } }
  }
  return { collection, status: trySaveNetworkCollection(collection) }
}

/** Compatibility convenience for callers that only need the live collection. */
export function loadNetworkCollection(): NetworkCollection {
  return initializeNetworkCollection().collection
}

export function saveNetworkCollection(collection: NetworkCollection): void {
  const serialized = JSON.stringify(collection)
  if (serialized.length > MAX_STORED_LENGTH) throw new StorageEnvelopeError()
  validateStorageEnvelope(collection)
  localStorage.setItem(STORAGE_KEY, serialized)
}

export function trySaveNetworkCollection(collection: NetworkCollection): PersistenceStatus {
  try {
    saveNetworkCollection(collection)
    return { kind: 'saved' }
  } catch (error) {
    return { kind: 'unsaved', reason: error instanceof StorageEnvelopeError
      ? 'capacity-exceeded' : 'write-failed' }
  }
}
