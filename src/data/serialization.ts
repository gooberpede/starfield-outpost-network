import type { OutpostNetwork } from '../domain/models'
import type { ReferenceData } from '../domain/referenceData'
import { migrateNetworkData } from './networkMigration.ts'

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
