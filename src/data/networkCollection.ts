/**
 * Purpose: Define and transform the persisted collection of universe networks.
 * Architecture: Collection identity/order stay outside each gameplay document.
 * Change this file when: collection schema or active-network rules change.
 */
import { createDefaultNetwork } from '../domain/defaults.ts'
import type { OutpostNetwork } from '../domain/models'
import { migrateNetworkData } from './networkMigration.ts'

export const CURRENT_COLLECTION_SCHEMA_VERSION = 1

export interface SavedNetwork {
  id: string
  network: OutpostNetwork
}

export interface NetworkCollection {
  schemaVersion: number
  networks: SavedNetwork[]
  activeNetworkId: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createDefaultNetworkCollection(): NetworkCollection {
  const id = crypto.randomUUID()
  return {
    schemaVersion: CURRENT_COLLECTION_SCHEMA_VERSION,
    networks: [{ id, network: createDefaultNetwork() }],
    activeNetworkId: id,
  }
}

/** Recovers valid entries in order and discards only malformed wrappers/documents. */
export function migrateNetworkCollectionData(value: unknown): NetworkCollection {
  if (!isRecord(value) || !Array.isArray(value.networks)) {
    throw new Error('Stored data is not a network collection.')
  }

  if (
    typeof value.schemaVersion === 'number' &&
    value.schemaVersion !== CURRENT_COLLECTION_SCHEMA_VERSION
  ) {
    throw new Error(`Unsupported network collection schema version: ${value.schemaVersion}`)
  }

  const seenIds = new Set<string>()
  const networks: SavedNetwork[] = []

  for (const candidate of value.networks) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !candidate.id ||
      seenIds.has(candidate.id)) {
      continue
    }

    try {
      networks.push({
        id: candidate.id,
        network: migrateNetworkData(candidate.network),
      })
      seenIds.add(candidate.id)
    } catch {
      // Another valid entry may still preserve the user's recoverable data.
    }
  }

  if (networks.length === 0) {
    return createDefaultNetworkCollection()
  }

  const requestedActiveId =
    typeof value.activeNetworkId === 'string' ? value.activeNetworkId : ''
  const activeNetworkId = networks.some(({ id }) => id === requestedActiveId)
    ? requestedActiveId
    : networks[0].id

  return {
    schemaVersion: CURRENT_COLLECTION_SCHEMA_VERSION,
    networks,
    activeNetworkId,
  }
}

/** Wraps the legacy single-network storage representation without altering it. */
export function migrateStoredNetworkData(value: unknown): NetworkCollection {
  if (isRecord(value) && Array.isArray(value.networks)) {
    return migrateNetworkCollectionData(value)
  }

  const id = crypto.randomUUID()
  return {
    schemaVersion: CURRENT_COLLECTION_SCHEMA_VERSION,
    networks: [{ id, network: migrateNetworkData(value) }],
    activeNetworkId: id,
  }
}

export function getActiveSavedNetwork(collection: NetworkCollection): SavedNetwork {
  return collection.networks.find(({ id }) => id === collection.activeNetworkId) ??
    collection.networks[0]
}

/** Replaces only the active gameplay document, preserving slot identity and order. */
export function updateActiveNetwork(
  collection: NetworkCollection,
  network: OutpostNetwork,
): NetworkCollection {
  return {
    ...collection,
    networks: collection.networks.map((savedNetwork) =>
      savedNetwork.id === collection.activeNetworkId
        ? { ...savedNetwork, network }
        : savedNetwork,
    ),
  }
}
