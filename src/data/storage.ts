/** Browser persistence for the ordered collection of universe networks. */
import {
  createDefaultNetworkCollection,
  migrateStoredNetworkData,
} from './networkCollection.ts'
import type { NetworkCollection } from './networkCollection'

const STORAGE_KEY = 'starfield-outpost-network'

export function loadNetworkCollection(): NetworkCollection {
  const storedValue = localStorage.getItem(STORAGE_KEY)
  if (!storedValue) {
    const collection = createDefaultNetworkCollection()
    saveNetworkCollection(collection)
    return collection
  }

  try {
    const collection = migrateStoredNetworkData(JSON.parse(storedValue))
    saveNetworkCollection(collection)
    return collection
  } catch {
    const collection = createDefaultNetworkCollection()
    saveNetworkCollection(collection)
    return collection
  }
}

export function saveNetworkCollection(collection: NetworkCollection): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
}
