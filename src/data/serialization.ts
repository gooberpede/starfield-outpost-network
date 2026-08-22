import type { OutpostNetwork } from '../domain/models'

export function serializeNetwork(network: OutpostNetwork): string {
  return JSON.stringify(network, null, 2)
}

export function deserializeNetwork(json: string): OutpostNetwork {
  const data: unknown = JSON.parse(json)

  if (!isOutpostNetwork(data)) {
    throw new Error('The selected file is not a valid outpost network.')
  }

  return data
}

function isOutpostNetwork(value: unknown): value is OutpostNetwork {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  if (candidate.schemaVersion !== 2) {
    return false
  }

  if (
    typeof candidate.character !== 'object' ||
    candidate.character === null
  ) {
    return false
  }

  if (!Array.isArray(candidate.outposts)) {
    return false
  }

  return true
}