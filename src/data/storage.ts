/** Browser persistence; all schema upgrades are delegated to networkMigration. */
import type { OutpostNetwork } from '../domain/models'
import { migrateNetworkData } from './networkMigration.ts'

const STORAGE_KEY = 'starfield-outpost-network'

export function loadNetwork(): OutpostNetwork | null {
  const storedValue = localStorage.getItem(STORAGE_KEY)
  if (!storedValue) return null
  try {
    return migrateNetworkData(JSON.parse(storedValue))
  } catch {
    return null
  }
}

export function saveNetwork(network: OutpostNetwork): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(network))
}
