/**
 * Purpose: Generate reproducible combined-envelope collections for browser validation.
 * Architecture: Reuse the benchmark's current-schema generator and verify candidate bounds.
 * Change this file when: the browser validation fixtures or candidate bounds change.
 */
import { createServer } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputDirectory = resolve('.local-work/browser-import-capacity-validation')
const limits = {
  bytes: 4 * 1024 * 1024,
  networks: 64,
  outposts: 96,
  pads: 12,
  links: 256,
  manufacturing: 256,
  planned: 256,
  outbound: 128,
  members: 25_000,
  stringLength: 4_096,
}

function inspect(collection) {
  const counts = { networks: collection.networks.length, outposts: 0, pads: 0,
    links: 0, manufacturing: 0, planned: 0, outbound: 0 }
  let members = 0
  let maxStringLength = 0
  function visit(value) {
    if (typeof value === 'string') maxStringLength = Math.max(maxStringLength, value.length)
    else if (Array.isArray(value)) {
      members += value.length
      value.forEach(visit)
    } else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(collection)
  for (const { network } of collection.networks) {
    counts.links += network.cargoLinks.length
    if (network.cargoLinks.length > limits.links) throw new Error('Too many links')
    counts.outposts += network.outposts.length
    if (network.outposts.length > limits.outposts) throw new Error('Too many outposts')
    for (const outpost of network.outposts) {
      counts.pads += outpost.cargoPads.length
      counts.manufacturing += outpost.manufacturing.length
      counts.planned += outpost.plannedSupply.length
      if (outpost.cargoPads.length > limits.pads ||
        outpost.manufacturing.length > limits.manufacturing ||
        outpost.plannedSupply.length > limits.planned) throw new Error('Outpost limit exceeded')
      for (const pad of outpost.cargoPads) {
        counts.outbound += pad.outboundItems.length
        if (pad.outboundItems.length > limits.outbound) throw new Error('Too many outbound items')
      }
    }
  }
  if (counts.networks > limits.networks || members > limits.members ||
    maxStringLength > limits.stringLength) throw new Error('Collection limit exceeded')
  return { ...counts, members, maxStringLength }
}

const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
try {
  const { createFixture, loadBenchmarkReferenceData } = await server.ssrLoadModule('/scripts/import-capacity-benchmark.ts')
  const { deserializeNetworkCollection, serializeNetworkCollection } =
    await server.ssrLoadModule('/src/data/serialization.ts')
  const refs = await loadBenchmarkReferenceData()
  const dense = createFixture({ name: 'combined-import-envelope', networks: 1, outposts: 96,
    pads: 12, links: 256, manufacturing: 12, planned: 20, outbound: 17 }, refs)
  dense.networks[0].network.character.name = 'Expedition '.repeat(373).slice(0, 4_096)
  const broad = createFixture({ name: 'broad-import-envelope', networks: 64, outposts: 8,
    pads: 4, links: 12, manufacturing: 6, planned: 8, outbound: 5 }, refs)
  // Vary breadth without changing stable IDs or breaking relationships.
  for (const [index, saved] of broad.networks.entries()) {
    if (index % 3 === 0) {
      const retained = new Set(saved.network.outposts.slice(0, 6).map(({ id }) => id))
      saved.network.outposts = saved.network.outposts.slice(0, 6)
      saved.network.cargoLinks = saved.network.cargoLinks.filter((link) =>
        retained.has(link.endpointA.outpostId) && retained.has(link.endpointB.outpostId))
    }
  }
  await mkdir(outputDirectory, { recursive: true })
  const results = []
  for (const [name, collection] of [['dense-import-envelope', dense], ['broad-import-envelope', broad]]) {
    const stats = inspect(collection)
    const compact = JSON.stringify(collection)
    const exported = serializeNetworkCollection(collection)
    const compactBytes = Buffer.byteLength(compact)
    const sourceBytes = Buffer.byteLength(exported)
    if (sourceBytes > limits.bytes || compactBytes > limits.bytes) throw new Error(`${name} exceeds 4 MiB`)
    const imported = deserializeNetworkCollection(exported)
    if (JSON.stringify(imported) !== compact) throw new Error(`${name} failed import round trip`)
    const path = resolve(outputDirectory, `${name}.json`)
    await writeFile(path, exported)
    results.push({ name, path, ...stats, compactBytes, sourceBytes })
  }
  console.log(JSON.stringify(results, null, 2))
} finally {
  await server.close()
}
