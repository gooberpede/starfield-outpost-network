/** Raw intent checks run before migration can discard malformed evidence. */
export function validCargoIntents(value: unknown): boolean {
  const record = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
  if (!record(value) || !Array.isArray(value.outposts)) return false
  const links = Array.isArray(value.cargoLinks) ? value.cargoLinks : []
  for (const outpost of value.outposts) {
    if (!record(outpost) || !Array.isArray(outpost.cargoPads)) continue
    for (const pad of outpost.cargoPads) {
      if (!record(pad) || !('destinationIntent' in pad)) continue
      const intent = pad.destinationIntent
      if (!record(intent) || typeof intent.outpostId !== 'string' || !intent.outpostId.length ||
        Object.keys(intent).some((key) => key !== 'outpostId')) return false
      for (const link of links) {
        if (!record(link)) continue
        for (const endpoint of [link.endpointA, link.endpointB]) {
          if (record(endpoint) && endpoint.outpostId === outpost.id && endpoint.cargoPadId === pad.id) return false
        }
      }
    }
  }
  return true
}
