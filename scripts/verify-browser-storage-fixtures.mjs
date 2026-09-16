/** Verify generated browser-storage baselines without committing large JSON. */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const directory = resolve('.local-work/browser-import-capacity-validation')
const dense = JSON.parse(await readFile(resolve(directory, 'dense-import-envelope.json'), 'utf8'))
const broad = JSON.parse(await readFile(resolve(directory, 'broad-import-envelope.json'), 'utf8'))
const pair = {
  schemaVersion: 1,
  networks: [dense.networks[0], { ...dense.networks[0], id: 'second-dense-network' }],
  activeNetworkId: dense.activeNetworkId,
}
const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
try {
  const { initializeNetworkCollection } = await server.ssrLoadModule('/src/data/storage.ts')
  for (const [name, collection] of [['dense', dense], ['broad', broad], ['larger pair', pair]]) {
    let value = JSON.stringify(collection)
    const initial = value
    globalThis.localStorage = {
      getItem: () => value,
      setItem: (_key, next) => { value = next },
    }
    const loaded = initializeNetworkCollection()
    if (loaded.status.kind !== 'saved' || loaded.collection.networks.length !== collection.networks.length ||
      JSON.stringify(loaded.collection) !== initial || value !== initial) {
      throw new Error(`${name} did not recover intact`)
    }
    console.log(`${name}: ${initial.length} code units, ${loaded.collection.networks.length} networks, recovered`)
  }
} finally {
  await server.close()
}
