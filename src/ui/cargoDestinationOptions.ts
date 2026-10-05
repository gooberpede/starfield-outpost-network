export type CargoOption = { kind: 'id'; id: string } | { kind: 'empty' | 'add' | 'status' }
export const encodeCargoOption = (option: CargoOption): string =>
  JSON.stringify(option.kind === 'id' ? ['id', option.id] : [option.kind])
export function decodeCargoOption(value: string): CargoOption | null {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return null
    if (parsed.length === 2 && parsed[0] === 'id' && typeof parsed[1] === 'string') return { kind: 'id', id: parsed[1] }
    if (parsed.length === 1 && (parsed[0] === 'empty' || parsed[0] === 'add' || parsed[0] === 'status')) return { kind: parsed[0] }
  } catch { /* Unrecognized UI tokens are never persisted. */ }
  return null
}
