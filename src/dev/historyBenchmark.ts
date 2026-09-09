/**
 * Purpose: Generate deterministic, development-only history workloads.
 * Architecture: All measured entries pass through CollectionEditingSession's
 * public reducer; baseline construction and navigation are outside history.
 * Change this file when: benchmark workloads or measurements need refinement.
 */
import type { NetworkCollection } from '../data/networkCollection.ts'
import {
  collectionEditingSessionReducer as reduce,
  createCollectionEditingSession,
} from '../domain/collectionEditingSession.ts'
import type {
  CargoItem,
  CargoLink,
  CargoPad,
  Outpost,
  OutpostNetwork,
} from '../domain/models.ts'
import type { CollectionEditingSession } from '../domain/collectionEditingSession.ts'

export type HistoryBenchmarkWorkload = 'representative' | 'replacement'

export interface HistoryMemorySample {
  heapUsedBytes?: number
  heapTotalBytes?: number
  externalBytes?: number
  rssBytes?: number
  browserJsHeapBytes?: number
  explicitGc: boolean
}

export interface TraversalMeasurement {
  steps: number
  medianPerStepMs: number
  worstStepMs: number
}

export interface HistoryBenchmarkResult {
  workload: HistoryBenchmarkWorkload
  checkpoint: number
  historyDepth: number
  undoDepth: number
  redoDepth: number
  context: { networkId: string; outpostId: string | null }
  elapsedMs: number
  incrementalElapsedMs: number
  undo: TraversalMeasurement[]
  redo: TraversalMeasurement[]
  memory?: HistoryMemorySample
}

export interface HistoryMemorySampler {
  sample(): HistoryMemorySample
}

export interface HistoryBenchmarkController {
  readonly workload: HistoryBenchmarkWorkload
  getSession(): CollectionEditingSession
  runTo(depth: number): HistoryBenchmarkResult
}

const RESOURCE_IDS = ['resource-iron', 'resource-copper', 'resource-water', 'resource-helium']
const PRODUCT_IDS = ['product-frame', 'product-wire', 'product-magnet']

function itemKey(item: CargoItem): string {
  return `${item.type}:${item.id}`
}

function makeOutpost(networkOrdinal: number, outpostOrdinal: number, padCount: number): Outpost {
  const outpostId = `bench-n${networkOrdinal}-outpost-${outpostOrdinal}`
  return {
    id: outpostId,
    name: `Benchmark Outpost ${networkOrdinal}.${outpostOrdinal}`,
    systemId: `system-${(outpostOrdinal % 4) + 1}`,
    bodyId: `body-${(outpostOrdinal % 8) + 1}`,
    selectedBiomeIds: [],
    localResources: [RESOURCE_IDS[outpostOrdinal % RESOURCE_IDS.length]],
    activeProduction: [],
    manufacturing: [],
    plannedSupply: [],
    cargoPads: Array.from({ length: padCount }, (_, padIndex): CargoPad => ({
      id: `${outpostId}-pad-${padIndex + 1}`,
      label: `Pad ${padIndex + 1}`,
      type: padIndex % 3 === 0 ? 'interstellar' : 'regular',
      outboundItems: [],
    })),
  }
}

function makeNetwork(networkOrdinal: number, outpostCount: number, padCount: number,
  linkCount: number, variant = 0): OutpostNetwork {
  const basePads = Math.floor(padCount / outpostCount)
  const extraPads = padCount % outpostCount
  const outposts = Array.from({ length: outpostCount }, (_, index) =>
    makeOutpost(networkOrdinal, index + 1, basePads + (index < extraPads ? 1 : 0)))
  const pads = outposts.flatMap((outpost) => outpost.cargoPads.map((pad) => ({ outpost, pad })))
  const cargoLinks: CargoLink[] = []
  const used = new Set<string>()
  for (let left = 0; left < pads.length && cargoLinks.length < linkCount; left += 1) {
    if (used.has(pads[left].pad.id)) continue
    const right = pads.findIndex((candidate, index) => index > left &&
      candidate.outpost.id !== pads[left].outpost.id && !used.has(candidate.pad.id))
    if (right < 0) continue
    used.add(pads[left].pad.id)
    used.add(pads[right].pad.id)
    cargoLinks.push({
      id: `bench-n${networkOrdinal}-link-${cargoLinks.length + 1}`,
      endpointA: { outpostId: pads[left].outpost.id, cargoPadId: pads[left].pad.id },
      endpointB: { outpostId: pads[right].outpost.id, cargoPadId: pads[right].pad.id },
    })
  }
  return {
    schemaVersion: 3,
    character: {
      name: `Benchmark Character ${networkOrdinal}-${variant}`,
      level: 50 + (variant % 950),
      skills: {
        outpostManagement: 4,
        outpostEngineering: 4,
        planetaryHabitation: 4,
        researchMethods: 4,
        specialProjects: 4,
      },
    },
    outposts,
    cargoLinks,
  }
}

/** Mirrors the substantial 9/19/8 and 14/44/21 network shapes in the brief. */
export function createRepresentativeBenchmarkCollection(variant = 0): NetworkCollection {
  const firstId = `bench-network-a-${variant}`
  const secondId = `bench-network-b-${variant}`
  return {
    schemaVersion: 1,
    networks: [
      { id: firstId, network: makeNetwork(1 + variant * 2, 9, 19, 8, variant) },
      { id: secondId, network: makeNetwork(2 + variant * 2, 14, 44, 21, variant) },
    ],
    activeNetworkId: firstId,
  }
}

function updateOutpost(network: OutpostNetwork, outpostId: string,
  update: (outpost: Outpost) => Outpost): OutpostNetwork {
  return {
    ...network,
    outposts: network.outposts.map((outpost) => outpost.id === outpostId
      ? update(outpost) : outpost),
  }
}

function apply(session: CollectionEditingSession, operation: number, label: string,
  update: (network: OutpostNetwork) => OutpostNetwork,
  outpostId?: string | null): CollectionEditingSession {
  const next = reduce(session, {
    type: 'apply-active-network', label, timestamp: operation + 1, update, outpostId,
  })
  if (next.history.past.length !== session.history.past.length + 1) {
    throw new Error(`Benchmark operation ${operation} (${label}) did not create one history entry.`)
  }
  return next
}

function chooseWorkingOutpost(session: CollectionEditingSession, operation: number) {
  const active = session.collection.networks.find(({ id }) => id === session.context.networkId)!
  return active.network.outposts[operation % active.network.outposts.length]
}

function runRepresentativeOperation(session: CollectionEditingSession,
  operation: number): CollectionEditingSession {
  if (operation > 0 && operation % 12 === 0) {
    const networks = session.collection.networks
    const currentIndex = networks.findIndex(({ id }) => id === session.context.networkId)
    session = reduce(session, {
      type: 'switch-network', networkId: networks[(currentIndex + 1) % networks.length].id,
    })
  }
  const selected = chooseWorkingOutpost(session, operation)
  session = reduce(session, { type: 'select-outpost', outpostId: selected.id })
  const resourceId = RESOURCE_IDS[operation % RESOURCE_IDS.length]
  const productId = PRODUCT_IDS[operation % PRODUCT_IDS.length]
  const cargoItem: CargoItem = operation % 2 === 0
    ? { type: 'resource', id: resourceId }
    : { type: 'product', id: productId }
  const kind = operation % 24

  if (kind === 0) return apply(session, operation, 'Benchmark character level', (network) => ({
    ...network, character: { ...network.character, level: (network.character.level ?? 0) + 1 },
  }))
  if (kind === 1) return apply(session, operation, 'Benchmark outpost rename', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({ ...outpost, name: `${outpost.name}*` })))
  if (kind === 2) return apply(session, operation, 'Benchmark system selection', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      systemId: outpost.systemId === 'system-a' ? 'system-b' : 'system-a',
      bodyId: '',
      selectedBiomeIds: [],
    })))
  if (kind === 3) return apply(session, operation, 'Benchmark body selection', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost, bodyId: outpost.bodyId === 'body-a' ? 'body-b' : 'body-a', selectedBiomeIds: [],
    })))
  if (kind === 4) return apply(session, operation, 'Benchmark biome selection', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      selectedBiomeIds: outpost.selectedBiomeIds.includes('biome-a') ? [] : ['biome-a'],
    })))
  if (kind === 5) return apply(session, operation, 'Benchmark local resource toggle', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      localResources: outpost.localResources.includes(resourceId)
        ? outpost.localResources.filter((id) => id !== resourceId)
        : [...outpost.localResources, resourceId],
    })))
  if (kind === 6) return apply(session, operation, 'Benchmark production toggle', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      activeProduction: outpost.activeProduction.some((route) => route.resourceId === resourceId)
        ? outpost.activeProduction.filter((route) => route.resourceId !== resourceId)
        : [...outpost.activeProduction, { type: 'inorganic', resourceId }],
    })))
  if (kind === 7) return apply(session, operation, 'Benchmark manufacturing edit', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      manufacturing: [{ productId, quantity: (outpost.manufacturing[0]?.quantity ?? 0) + 1 }],
    })))
  if (kind === 8 || kind === 9) return apply(session, operation, 'Benchmark Planned Supply toggle',
    (network) => updateOutpost(network, selected.id, (outpost) => {
      const present = outpost.plannedSupply.some((item) => itemKey(item) === itemKey(cargoItem))
      return {
        ...outpost,
        plannedSupply: present
          ? outpost.plannedSupply.filter((item) => itemKey(item) !== itemKey(cargoItem))
          : [...outpost.plannedSupply, cargoItem],
      }
    }))
  if (kind === 10) return apply(session, operation, 'Benchmark cargo pad type', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      cargoPads: outpost.cargoPads.map((pad, index) => index === 0
        ? { ...pad, type: pad.type === 'regular' ? 'interstellar' : 'regular' } : pad),
    })))
  if (kind === 11 || kind === 12) return apply(session, operation, 'Benchmark outbound assignment',
    (network) => updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      cargoPads: outpost.cargoPads.map((pad, index) => index === 0 ? {
        ...pad,
        outboundItems: pad.outboundItems.some((item) => itemKey(item) === itemKey(cargoItem))
          ? pad.outboundItems.filter((item) => itemKey(item) !== itemKey(cargoItem))
          : [...pad.outboundItems, cargoItem],
      } : pad),
    })))
  if (kind === 13) return apply(session, operation, 'Benchmark add cargo pad', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      cargoPads: [...outpost.cargoPads, {
        id: `bench-added-pad-${operation}`,
        label: `Pad ${outpost.cargoPads.length + 1}`,
        type: 'regular',
        outboundItems: [],
      }],
    })))
  if (kind === 14) return apply(session, operation, 'Benchmark remove cargo pad', (network) => {
    const target = selected.cargoPads.at(-1)!
    return {
      ...updateOutpost(network, selected.id, (outpost) => ({
        ...outpost, cargoPads: outpost.cargoPads.slice(0, -1),
      })),
      cargoLinks: network.cargoLinks.filter((link) =>
        link.endpointA.cargoPadId !== target.id && link.endpointB.cargoPadId !== target.id),
    }
  })
  if (kind === 15) return apply(session, operation, 'Benchmark create cargo link', (network) => {
    const linked = new Set(network.cargoLinks.flatMap((link) =>
      [link.endpointA.cargoPadId, link.endpointB.cargoPadId]))
    const candidates = network.outposts.flatMap((outpost) => outpost.cargoPads
      .filter((pad) => !linked.has(pad.id)).map((pad) => ({ outpost, pad })))
    const left = candidates[0]
    const right = candidates.find((candidate) => candidate.outpost.id !== left.outpost.id)!
    return { ...network, cargoLinks: [...network.cargoLinks, {
      id: `bench-added-link-${operation}`,
      endpointA: { outpostId: left.outpost.id, cargoPadId: left.pad.id },
      endpointB: { outpostId: right.outpost.id, cargoPadId: right.pad.id },
    }] }
  })
  if (kind === 16) return apply(session, operation, 'Benchmark remove cargo link', (network) => ({
    ...network, cargoLinks: network.cargoLinks.slice(0, -1),
  }))
  if (kind === 17) {
    const id = `bench-added-outpost-${operation}`
    return apply(session, operation, 'Benchmark add outpost', (network) => ({
      ...network,
      outposts: [...network.outposts, { ...makeOutpost(99, operation, 2), id }],
    }), id)
  }
  if (kind === 18) {
    const target = session.collection.networks.find(({ id }) => id === session.context.networkId)!
      .network.outposts.at(-1)!
    const fallbackId = session.collection.networks.find(({ id }) => id === session.context.networkId)!
      .network.outposts[0].id
    return apply(session, operation, 'Benchmark remove outpost', (network) => ({
      ...network,
      outposts: network.outposts.filter((outpost) => outpost.id !== target.id),
      cargoLinks: network.cargoLinks.filter((link) =>
        link.endpointA.outpostId !== target.id && link.endpointB.outpostId !== target.id),
    }), fallbackId)
  }
  if (kind === 19) return apply(session, operation, 'Benchmark skill edit', (network) => ({
    ...network,
    character: { ...network.character, skills: {
      ...network.character.skills,
      outpostManagement: ((network.character.skills.outpostManagement ?? 0) + 1) % 5,
    } },
  }))
  if (kind === 20) return apply(session, operation, 'Benchmark character rename', (network) => ({
    ...network, character: { ...network.character, name: `${network.character.name}.` },
  }))
  if (kind === 21) return apply(session, operation, 'Benchmark manufacturing quantity', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      manufacturing: [{ productId, quantity: (outpost.manufacturing[0]?.quantity ?? 1) + 1 }],
    })))
  if (kind === 22) return apply(session, operation, 'Benchmark production edit', (network) =>
    updateOutpost(network, selected.id, (outpost) => {
      const active = outpost.activeProduction.some((route) => route.resourceId === resourceId)
      return {
        ...outpost,
        activeProduction: active
          ? outpost.activeProduction.filter((route) => route.resourceId !== resourceId)
          : [...outpost.activeProduction, { type: 'inorganic', resourceId }],
      }
    }))
  return apply(session, operation, 'Benchmark outbound replacement', (network) =>
    updateOutpost(network, selected.id, (outpost) => ({
      ...outpost,
      cargoPads: outpost.cargoPads.map((pad, index) => index === 0
        ? { ...pad, outboundItems: pad.outboundItems.length === 0 ? [cargoItem] : [] } : pad),
    })))
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function assertContext(actual: CollectionEditingSession, expected: { networkId: string; outpostId: string | null },
  direction: string) {
  if (actual.context.networkId !== expected.networkId || actual.context.outpostId !== expected.outpostId) {
    throw new Error(`${direction} did not restore the expected Network + Outpost context.`)
  }
}

function measureTraversal(session: CollectionEditingSession, steps: number) {
  const undoTimes: number[] = []
  const redoTimes: number[] = []
  let current = session
  for (let index = 0; index < steps; index += 1) {
    const entry = current.history.past.at(-1)!
    const started = performance.now()
    current = reduce(current, { type: 'undo' })
    undoTimes.push(performance.now() - started)
    assertContext(current, entry.before.context, 'Undo')
  }
  for (let index = 0; index < steps; index += 1) {
    const entry = current.history.future.at(-1)!
    const started = performance.now()
    current = reduce(current, { type: 'redo' })
    redoTimes.push(performance.now() - started)
    assertContext(current, entry.after.context, 'Redo')
  }
  if (current.collection !== session.collection ||
    current.context.networkId !== session.context.networkId ||
    current.context.outpostId !== session.context.outpostId) {
    throw new Error('Undo/Redo sampling did not return to the checkpoint state.')
  }
  return {
    undo: { steps, medianPerStepMs: median(undoTimes), worstStepMs: Math.max(...undoTimes) },
    redo: { steps, medianPerStepMs: median(redoTimes), worstStepMs: Math.max(...redoTimes) },
  }
}

export function createHistoryBenchmarkController(
  workload: HistoryBenchmarkWorkload = 'representative',
  memorySampler?: HistoryMemorySampler,
): HistoryBenchmarkController {
  let session = createCollectionEditingSession(createRepresentativeBenchmarkCollection())
  let operation = 0
  let totalElapsedMs = 0
  let previousElapsedMs = 0
  return {
    workload,
    getSession: () => session,
    runTo(depth) {
      if (!Number.isInteger(depth) || depth < operation) {
        throw new Error(`Depth must be an integer at least ${operation}.`)
      }
      const started = performance.now()
      while (operation < depth) {
        if (workload === 'representative') {
          session = runRepresentativeOperation(session, operation)
        } else {
          session = reduce(session, {
            type: 'replace-collection',
            collection: createRepresentativeBenchmarkCollection(operation + 1),
            timestamp: operation + 1,
          })
          if (session.history.past.length !== operation + 1) {
            throw new Error('A replacement transaction did not create exactly one history entry.')
          }
        }
        operation += 1
      }
      totalElapsedMs += performance.now() - started
      const samples = [1, 10, 100].filter((steps) => steps <= depth)
        .map((steps) => measureTraversal(session, steps))
      const result: HistoryBenchmarkResult = {
        workload,
        checkpoint: depth,
        historyDepth: session.history.past.length,
        undoDepth: session.history.past.length,
        redoDepth: session.history.future.length,
        context: { ...session.context },
        elapsedMs: totalElapsedMs,
        incrementalElapsedMs: totalElapsedMs - previousElapsedMs,
        undo: samples.map(({ undo }) => undo),
        redo: samples.map(({ redo }) => redo),
        memory: memorySampler?.sample(),
      }
      previousElapsedMs = totalElapsedMs
      return result
    },
  }
}

interface BrowserPerformanceMemory {
  usedJSHeapSize: number
}

/** Installs a console-only controller when main.tsx's DEV/query gate requests it. */
export function installBrowserHistoryBenchmark(): void {
  const browserMemory = () => (performance as Performance & {
    memory?: BrowserPerformanceMemory
  }).memory
  const create = (workload: HistoryBenchmarkWorkload = 'representative') =>
    createHistoryBenchmarkController(workload, {
      sample: () => ({
        browserJsHeapBytes: browserMemory()?.usedJSHeapSize,
        explicitGc: false,
      }),
    })
  Object.assign(window, { starfieldHistoryBenchmark: { create } })
  console.info('History benchmark ready: starfieldHistoryBenchmark.create().runTo(500)')
}
