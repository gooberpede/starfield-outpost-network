/**
 * Purpose: Measure current-schema import capacity without changing app behavior.
 * Architecture: Deterministic fixtures exercise the public data/domain/session APIs.
 * Change this file when: import capacity questions or measured stages change.
 */
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { performance } from 'node:perf_hooks'
import type { NetworkCollection } from '../src/data/networkCollection.ts'
import { getActiveSavedNetwork } from '../src/data/networkCollection.ts'
import { validateExternalNetworkSource, validateImportedCollection } from '../src/data/externalImportValidation.ts'
import { migrateNetworkCollectionData } from '../src/data/networkCollection.ts'
import { deserializeNetworkCollection, serializeNetworkCollection } from '../src/data/serialization.ts'
import { loadNetworkCollection, saveNetworkCollection } from '../src/data/storage.ts'
import { getAvailableItemsAtOutpost, getFeasibleManufacturedProductIdsAtOutpost } from '../src/domain/availability.ts'
import { collectionEditingSessionReducer as reduce, createCollectionEditingSession } from '../src/domain/collectionEditingSession.ts'
import type { CargoItem, CargoLink, Outpost, OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { validateNetwork } from '../src/domain/validation/validateNetwork.ts'
import { validationRules } from '../src/domain/validation/registry.ts'

type Shape = { name: string; networks: number; outposts: number; pads: number;
  links: number; manufacturing: number; planned: number; outbound: number; stringLength?: number }

const shapes: Shape[] = [
  { name: 'light', networks: 1, outposts: 5, pads: 2, links: 3, manufacturing: 2, planned: 3, outbound: 2 },
  { name: 'medium', networks: 2, outposts: 12, pads: 3, links: 12, manufacturing: 3, planned: 5, outbound: 3 },
  { name: 'large', networks: 8, outposts: 24, pads: 6, links: 45, manufacturing: 4, planned: 6, outbound: 4 },
  { name: 'maximal', networks: 32, outposts: 24, pads: 6, links: 60, manufacturing: 6, planned: 8, outbound: 5 },
  { name: 'ultra-maximal', networks: 100, outposts: 24, pads: 6, links: 60, manufacturing: 6, planned: 8, outbound: 5 },
  { name: 'modded-96', networks: 1, outposts: 96, pads: 6, links: 200, manufacturing: 6, planned: 8, outbound: 5 },
  { name: 'modded-128', networks: 1, outposts: 128, pads: 6, links: 250, manufacturing: 6, planned: 8, outbound: 5 },
  { name: 'balanced-96', networks: 1, outposts: 96, pads: 8, links: 192, manufacturing: 8, planned: 12, outbound: 8 },
  { name: 'balanced-128', networks: 1, outposts: 128, pads: 8, links: 256, manufacturing: 8, planned: 12, outbound: 8 },
  { name: 'wide-pad-64', networks: 1, outposts: 64, pads: 12, links: 192, manufacturing: 8, planned: 12, outbound: 8 },
  { name: 'wide-pad-96', networks: 1, outposts: 96, pads: 12, links: 256, manufacturing: 8, planned: 12, outbound: 8 },
  { name: 'dense-48', networks: 1, outposts: 48, pads: 12, links: 250, manufacturing: 12, planned: 20, outbound: 12 },
  { name: 'dense-64', networks: 1, outposts: 64, pads: 12, links: 320, manufacturing: 12, planned: 20, outbound: 12 },
  { name: 'dense-96', networks: 1, outposts: 96, pads: 12, links: 500, manufacturing: 12, planned: 20, outbound: 12 },
  { name: 'dense-128', networks: 1, outposts: 128, pads: 12, links: 700, manufacturing: 12, planned: 20, outbound: 12 },
  { name: 'manufacturing-heavy', networks: 1, outposts: 8, pads: 2, links: 4, manufacturing: 2000, planned: 4, outbound: 2 },
  { name: 'planned-heavy', networks: 1, outposts: 8, pads: 2, links: 4, manufacturing: 4, planned: 5000, outbound: 2 },
  { name: 'outbound-heavy', networks: 1, outposts: 8, pads: 4, links: 12, manufacturing: 4, planned: 4, outbound: 1000 },
  { name: 'links-heavy', networks: 1, outposts: 128, pads: 16, links: 1000, manufacturing: 2, planned: 2, outbound: 2 },
  { name: 'strings-heavy', networks: 1, outposts: 4, pads: 2, links: 2, manufacturing: 2, planned: 2, outbound: 2, stringLength: 200_000 },
]

export async function loadBenchmarkReferenceData(): Promise<ReferenceData> {
  const names = [
    'biomes', 'body-biomes', 'inorganic-occurrences', 'species', 'planet-species',
    'organic-occurrences', 'organic-farming-profiles', 'systems', 'bodies',
    'resources', 'products', 'body-resources', 'product-recipes',
  ] as const
  const values = await Promise.all(names.map(async (name) =>
    JSON.parse(await readFile(resolve('public/reference-data', `${name}.json`), 'utf8')) as unknown))
  return Object.fromEntries(names.map((name, index) => [name.replace(/-([a-z])/g,
    (_, letter: string) => letter.toUpperCase()), values[index]])) as unknown as ReferenceData
}

export function createFixture(shape: Shape, refs: ReferenceData): NetworkCollection {
  const bodies = refs.bodies.filter((body) => body.outpostAllowed)
  const resources = refs.resources.filter((item) => item.category === 'inorganic')
  const products = refs.products
  const networks = Array.from({ length: shape.networks }, (_, networkIndex) => {
    const outposts: Outpost[] = Array.from({ length: shape.outposts }, (_, outpostIndex) => {
      const body = bodies[outpostIndex % bodies.length]
      const id = `network-${networkIndex}-outpost-${outpostIndex}`
      const cargoPads = Array.from({ length: shape.pads }, (_, padIndex) => ({
        id: `${id}-pad-${padIndex}`,
        label: shape.stringLength && padIndex === 0 ? 'L'.repeat(shape.stringLength) : `Pad ${padIndex + 1}`,
        type: (padIndex % 2 ? 'regular' : 'interstellar') as 'regular' | 'interstellar',
        outboundItems: Array.from({ length: shape.outbound }, (_, itemIndex): CargoItem => ({
          type: 'resource', id: resources[(outpostIndex + itemIndex) % resources.length].id,
        })),
      }))
      return {
        id: shape.stringLength && outpostIndex === 0 ? `id-${'I'.repeat(shape.stringLength)}` : id,
        name: shape.stringLength && outpostIndex === 0 ? 'N'.repeat(shape.stringLength) : `Outpost ${outpostIndex + 1}`,
        systemId: shape.stringLength && outpostIndex === 0
          ? 'S'.repeat(shape.stringLength) : body.systemId,
        bodyId: body.id, selectedBiomeIds: [],
        localResources: resources.slice(outpostIndex % 8, outpostIndex % 8 + 3).map((item) => item.id),
        explicitResourcePresence: [],
        activeProduction: [{ type: 'inorganic', resourceId: resources[outpostIndex % resources.length].id }],
        manufacturing: Array.from({ length: shape.manufacturing }, (_, index) => ({
          productId: products[(outpostIndex + index) % products.length].id, quantity: 1,
        })),
        plannedSupply: Array.from({ length: shape.planned }, (_, index): CargoItem => ({
          type: 'resource', id: shape.stringLength && outpostIndex === 0 && index === 0
            ? 'R'.repeat(shape.stringLength)
            : resources[(outpostIndex + index + 3) % resources.length].id,
        })),
        cargoPads,
      }
    })
    const endpoints = outposts.flatMap((outpost) => outpost.cargoPads.map((pad) => ({
      outpostId: outpost.id, cargoPadId: pad.id,
    })))
    const cargoLinks: CargoLink[] = []
    const half = Math.floor(endpoints.length / 2)
    for (let index = 0; index < half && cargoLinks.length < shape.links; index += 1) {
      if (endpoints[index].outpostId === endpoints[index + half].outpostId) continue
      cargoLinks.push({ id: `network-${networkIndex}-link-${index}`,
        endpointA: endpoints[index], endpointB: endpoints[index + half] })
    }
    const network: OutpostNetwork = {
      schemaVersion: 4,
      character: {
        name: shape.stringLength ? 'C'.repeat(shape.stringLength) : `Character ${networkIndex + 1}`,
        level: 200,
        skills: { outpostManagement: 4, outpostEngineering: 4, planetaryHabitation: 4,
          researchMethods: 4, specialProjects: 4 },
        capabilities: { xTechExtraction: true },
      },
      outposts, cargoLinks,
    }
    return { id: `network-${networkIndex}`, network }
  })
  return { schemaVersion: 1, networks, activeNetworkId: networks[0].id }
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

function timed<T>(run: () => T): [T, number] {
  const start = performance.now()
  const result = run()
  return [result, performance.now() - start]
}

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function measure(collection: NetworkCollection, refs: ReferenceData, repeats: number,
  sourceText?: string) {
  const compact = JSON.stringify(collection)
  const importText = sourceText ?? compact
  const counts = collection.networks.reduce((total, saved) => {
    const network = saved.network
    total.outposts += network.outposts.length
    total.pads += network.outposts.reduce((sum, outpost) => sum + outpost.cargoPads.length, 0)
    total.links += network.cargoLinks.length
    total.manufacturing += network.outposts.reduce((sum, outpost) => sum + outpost.manufacturing.length, 0)
    total.planned += network.outposts.reduce((sum, outpost) => sum + outpost.plannedSupply.length, 0)
    total.outbound += network.outposts.reduce((sum, outpost) => sum + outpost.cargoPads.reduce(
      (padSum, pad) => padSum + pad.outboundItems.length, 0), 0)
    return total
  }, { outposts: 0, pads: 0, links: 0, manufacturing: 0, planned: 0, outbound: 0 })
  const samples: Record<string, number[]> = {}
  const take = <T>(key: string, action: () => T): T => {
    const [result, ms] = timed(action)
    ;(samples[key] ??= []).push(ms)
    return result
  }
  const prior = createFixture(shapes[1], refs)
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() })
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    const parsed = take('parse', () => JSON.parse(importText) as NetworkCollection)
    take('preValidate', () => parsed.networks.forEach((saved, index) =>
      validateExternalNetworkSource(saved.network, `networks[${index}].network`)))
    const migrated = take('migrate', () => migrateNetworkCollectionData(parsed))
    take('postValidate', () => validateImportedCollection(migrated))
    take('fullImport', () => deserializeNetworkCollection(importText))
    let session = createCollectionEditingSession(prior)
    session = take('replace', () => reduce(session, { type: 'replace-collection', collection: migrated, timestamp: repeat }))
    if (session.history.past.length !== 1) throw new Error('Import history missing')
    const selected = getActiveSavedNetwork(session.collection).network
    take('domainValidate', () => validateNetwork(selected, refs))
    take('availability', () => getAvailableItemsAtOutpost(selected.outposts[0].id, selected, refs))
    if (session.collection.networks.length > 1) {
      session = take('switch', () => reduce(session, {
        type: 'switch-network', networkId: session.collection.networks.at(-1)!.id,
      }))
    }
    session = take('undoImport', () => reduce(session, { type: 'undo' }))
    if (session.collection !== prior) throw new Error('Import undo failed')
    session = take('redoImport', () => reduce(session, { type: 'redo' }))
    if (session.collection !== migrated) throw new Error('Import redo failed')
    session = take('edit', () => reduce(session, {
      type: 'apply-active-network', timestamp: repeat + 100, label: { key: 'history.benchmark', parameters: { label: 'name' } },
      update: (network) => ({ ...network, character: { ...network.character, name: `${network.character.name}!` } }),
    }))
    session = take('undoEdit', () => reduce(session, { type: 'undo' }))
    session = take('redoEdit', () => reduce(session, { type: 'redo' }))
    take('serialize', () => serializeNetworkCollection(session.collection))
    take('storageWrite', () => saveNetworkCollection(session.collection))
    if (repeat === 0) assert.deepEqual(loadNetworkCollection(), session.collection)
  }
  const active = getActiveSavedNetwork(collection).network
  const topRules = validationRules.map((rule) => ({
    id: rule.id, ms: +timed(() => rule.validate(active, refs))[1].toFixed(3),
  })).sort((left, right) => right.ms - left.ms).slice(0, 4)
  return { networks: collection.networks.length, ...counts,
    members: Object.values(counts).reduce((sum, value) => sum + value, collection.networks.length),
    normalizedCompactBytes: Buffer.byteLength(compact),
    normalizedExportBytes: Buffer.byteLength(serializeNetworkCollection(collection)),
    ms: Object.fromEntries(Object.entries(samples).map(([key, values]) => [key, +median(values).toFixed(3)])),
    topRules,
  }
}

function measureRecipeChain(refs: ReferenceData, length: number, repeats: number) {
  const collection = createFixture({ name: 'recipe-chain', networks: 1, outposts: 1,
    pads: 0, links: 0, manufacturing: 0, planned: 0, outbound: 0 }, refs)
  const network = collection.networks[0].network
  const entries = Array.from({ length }, (_, index) => ({ productId: `chain-${length - index}`, quantity: 1 }))
  network.outposts[0].manufacturing = entries
  network.outposts[0].plannedSupply = [{ type: 'product', id: 'chain-0' }]
  const augmented = { ...refs, productRecipes: [...refs.productRecipes,
    ...Array.from({ length }, (_, index) => ({ productId: `chain-${index + 1}`,
      ingredients: [{ item: { type: 'product' as const, id: `chain-${index}` }, quantity: 1 }],
    }))] }
  const samples = Array.from({ length: repeats }, () => timed(() =>
    getFeasibleManufacturedProductIdsAtOutpost(network.outposts[0].id, network, augmented)))
  if (samples.some(([products]) => products.size !== length)) throw new Error('Recipe chain incomplete')
  return { length, ms: +median(samples.map(([, ms]) => ms)).toFixed(3) }
}

export async function runBenchmark(): Promise<void> {
  const { values } = parseArgs({ options: {
    names: { type: 'string' }, repeats: { type: 'string', default: '3' }, sample: { type: 'string' },
  } })
  const refs = await loadBenchmarkReferenceData()
  const repeats = Number(values.repeats)
  if (!Number.isInteger(repeats) || repeats < 1) throw new Error('--repeats must be positive')
  const selected = values.names ? new Set(values.names.split(',')) : null
  const results = []
  for (const shape of shapes) {
    if (selected && !selected.has(shape.name)) continue
    const [fixture, generationMs] = timed(() => createFixture(shape, refs))
    const result = measure(fixture, refs, repeats)
    results.push({ name: shape.name, ...result, generationMs: +generationMs.toFixed(3),
      stringLength: shape.stringLength ?? 0 })
    console.error(`${shape.name}: ${(result.normalizedCompactBytes / 1024).toFixed(0)} KiB`)
  }
  if (values.sample) {
    const text = await readFile(values.sample, 'utf8')
    const imported = deserializeNetworkCollection(text)
    results.push({ name: 'attached-sample', ...measure(imported, refs, repeats, text),
      sourceBytes: Buffer.byteLength(text), stringLength: 0 })
  }
  console.log(JSON.stringify({ node: process.version, repeats, results,
    recipeChains: [100, 500, 1000].map((length) => measureRecipeChain(refs, length, repeats)),
  }, null, 2))
}
