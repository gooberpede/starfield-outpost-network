/**
 * Purpose:
 *   Bound the work and memory used to inspect app-owned browser storage.
 *
 * Architecture:
 *   Owns storage-specific depth, member, string, and collection limits. These
 *   recovery bounds are intentionally separate from the stricter external-file
 *   import envelope.
 *
 * Change this file when:
 *   Browser storage capacity or traversal-safety policy changes.
 */
export const MAX_STORED_LENGTH = 4_194_304
export const MAX_STORED_MEMBERS = 65_536
export const MAX_STORED_STRING = 16_384
export const MAX_STORED_DEPTH = 64

const arrayLimits: Record<string, number> = {
  networks: 128,
  'networks[].network.outposts': 128,
  'networks[].network.cargoLinks': 384,
  'networks[].network.outposts[].cargoPads': 16,
  'networks[].network.outposts[].cargoPads[].outboundItems': 256,
  // The historical bare-network representation is also accepted.
  outposts: 128,
  cargoLinks: 384,
  'outposts[].cargoPads': 16,
  'outposts[].cargoPads[].outboundItems': 256,
}

export class StorageEnvelopeError extends Error {
  constructor() { super('Browser storage resource limit exceeded') }
}

/** Iterative and early-exiting; canonical paths never include attacker-sized keys. */
export function validateStorageEnvelope(value: unknown): void {
  let members = 0
  const pending: { value: unknown; path: string; depth: number }[] = [
    { value, path: '', depth: 0 },
  ]
  while (pending.length) {
    const { value: current, path, depth } = pending.pop()!
    if (depth > MAX_STORED_DEPTH) throw new StorageEnvelopeError()
    if (typeof current === 'string' && current.length > MAX_STORED_STRING) {
      throw new StorageEnvelopeError()
    }
    if (Array.isArray(current)) {
      if (current.length > (arrayLimits[path] ?? 512)) throw new StorageEnvelopeError()
      members += current.length
      if (members > MAX_STORED_MEMBERS) throw new StorageEnvelopeError()
      for (const entry of current) {
        pending.push({ value: entry, path: `${path}[]`, depth: depth + 1 })
      }
    } else if (current !== null && typeof current === 'object') {
      for (const [key, entry] of Object.entries(current)) {
        if (key.length > MAX_STORED_STRING) throw new StorageEnvelopeError()
        // Unknown branches need only the generic array ceiling.
        const nextPath = `${path}${path ? '.' : ''}${key}`.slice(0, 256)
        pending.push({ value: entry, path: nextPath, depth: depth + 1 })
      }
    }
  }
}
