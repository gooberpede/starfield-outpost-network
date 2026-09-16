import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultNetwork, createDefaultOutpost } from '../src/domain/defaults.ts'
import { deserializeNetworkCollection } from '../src/data/serialization.ts'
import { NetworkImportError, type ImportErrorCode } from '../src/data/importErrors.ts'
import { validateExternalImportCapacity } from '../src/data/externalImportValidation.ts'
import { createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'

function source() {
  return { schemaVersion: 1, activeNetworkId: 'n0', networks: [{
    id: 'n0', network: { ...createDefaultNetwork(), outposts: [createDefaultOutpost([], 'o0')] },
  }] }
}

function check(value: unknown, code?: ImportErrorCode) {
  const read = () => deserializeNetworkCollection(JSON.stringify(value))
  if (code) assert.throws(read, (error) => error instanceof NetworkImportError && error.code === code)
  else assert.doesNotThrow(read)
}

test('each scoped array accepts its ceiling and rejects the next member', () => {
  const cases: { maximum: number; change: (count: number) => unknown }[] = [
    { maximum: 64, change: (count) => {
      const value = source()
      value.networks = Array.from({ length: count }, (_, i) => ({
        id: `n${i}`, network: { ...createDefaultNetwork(), outposts: [] },
      }))
      return value
    } },
    { maximum: 96, change: (count) => {
      const value = source()
      value.networks[0].network.outposts = Array.from({ length: count }, (_, i) => createDefaultOutpost([], `o${i}`))
      return value
    } },
    { maximum: 12, change: (count) => {
      const value = source()
      value.networks[0].network.outposts[0].cargoPads = Array.from({ length: count }, (_, i) => ({
        id: `p${i}`, label: '', type: 'regular' as const, outboundItems: [],
      }))
      return value
    } },
    { maximum: 256, change: (count) => {
      const value = source()
      value.networks[0].network.cargoLinks = Array.from({ length: count }, (_, i) => ({
        id: `l${i}`, endpointA: { outpostId: `o${i}`, cargoPadId: 'a' },
        endpointB: { outpostId: `o${i}`, cargoPadId: 'b' },
      }))
      return value
    } },
    { maximum: 256, change: (count) => {
      const value = source()
      value.networks[0].network.outposts[0].manufacturing = Array.from({ length: count }, (_, i) => ({ productId: `p${i}`, quantity: 1 }))
      return value
    } },
    { maximum: 256, change: (count) => {
      const value = source()
      value.networks[0].network.outposts[0].plannedSupply = Array.from({ length: count }, (_, i) => ({ type: 'resource' as const, id: `r${i}` }))
      return value
    } },
    { maximum: 128, change: (count) => {
      const value = source()
      value.networks[0].network.outposts[0].cargoPads = [{
        id: 'p', label: '', type: 'regular',
        outboundItems: Array.from({ length: count }, (_, i) => ({ type: 'resource' as const, id: `r${i}` })),
      }]
      return value
    } },
  ]
  for (const { maximum, change } of cases) {
    check(change(maximum))
    check(change(maximum + 1), maximum === 64 ? 'network-limit-exceeded' : 'array-limit-exceeded')
  }
})

test('aggregate counts all nested source arrays, including legacy and discarded fields', () => {
  const value = source() as ReturnType<typeof source> & { legacy?: { nested: number[][] } }
  // Baseline: networks + outposts = 2. Nested arrays add one outer and 24,997 inner members.
  value.legacy = { nested: [Array(24_997).fill(0)] }
  check(value)
  value.legacy.nested[0].push(0)
  check(value, 'aggregate-limit-exceeded')
})

test('all source strings use JavaScript code-unit length, including discarded fields', () => {
  const value = source() as ReturnType<typeof source> & { legacy?: { note: string } }
  value.networks[0].network.character.name = '🌌'.repeat(2048)
  value.legacy = { note: 'x'.repeat(4096) }
  check(value)
  value.legacy.note += 'x'
  check(value, 'string-too-long')
  value.legacy.note = ''
  value.networks[0].network.character.name += 'x'
  check(value, 'string-too-long')
})

test('legacy network at the outpost ceiling migrates, while one over is rejected', () => {
  const value = source()
  value.networks[0].network.outposts = Array.from({ length: 96 }, (_, i) => createDefaultOutpost([], `o${i}`))
  const legacy = JSON.parse(JSON.stringify(value))
  legacy.networks[0].network.schemaVersion = 3
  delete legacy.networks[0].network.character.capabilities
  for (const outpost of legacy.networks[0].network.outposts) delete outpost.explicitResourcePresence
  check(legacy)
  legacy.networks[0].network.outposts.push(createDefaultOutpost([], 'o96'))
  check(legacy, 'array-limit-exceeded')
})

test('a known breach stops before accessing later hostile input', () => {
  const value = source()
  value.networks = Array.from({ length: 65 }, (_, i) => ({
    id: `n${i}`, network: { ...createDefaultNetwork(), outposts: [] },
  }))
  Object.defineProperty(value.networks[0], 'hostile', { enumerable: true, get: () => {
    throw new Error('visited beyond capacity breach')
  } })
  assert.throws(() => validateExternalImportCapacity(value), (error) =>
    error instanceof NetworkImportError && error.code === 'network-limit-exceeded')
})

test('deep valid JSON keeps a bounded diagnostic path without recursive traversal', () => {
  const depth = 5_000
  const json = `${JSON.stringify(source()).slice(0, -1)},"unknown":${'{"deep":'.repeat(depth)}${JSON.stringify('x'.repeat(4_097))}${'}'.repeat(depth)}}`
  assert.ok(Buffer.byteLength(json) < 4 * 1024 * 1024)
  assert.throws(() => deserializeNetworkCollection(json), (error) => {
    if (!(error instanceof NetworkImportError) || error.code !== 'string-too-long') return false
    const path = error.parameters.path
    return typeof path === 'string' && path.length <= 256 && path.endsWith('…')
  })
})

test('legacy pad-link exports retain the outbound ceiling', () => {
  const legacy = JSON.parse(JSON.stringify(source()))
  const network = legacy.networks[0].network
  delete network.schemaVersion
  delete network.cargoLinks
  delete network.character.capabilities
  const outpost = network.outposts[0]
  delete outpost.selectedBiomeIds
  delete outpost.explicitResourcePresence
  const pad = { id: 'p', label: '', type: 'regular', link: {
    exports: Array.from({ length: 128 }, (_, i) => ({ type: 'resource', id: `r${i}` })),
    destination: null,
  } }
  outpost.cargoPads = [pad]
  check(legacy)
  pad.link.exports.push({ type: 'resource', id: 'extra' })
  check(legacy, 'array-limit-exceeded')
})

test('capacity rejection leaves session context, history, and storage alone', () => {
  const original = source()
  const session = createCollectionEditingSession(original)
  const before = structuredClone(session)
  const stored = JSON.stringify(original)
  const oversized = source()
  oversized.networks[0].network.outposts = Array.from({ length: 97 }, (_, i) => createDefaultOutpost([], `o${i}`))
  check(oversized, 'array-limit-exceeded')
  assert.deepEqual(session, before)
  assert.equal(JSON.stringify(original), stored)
})
