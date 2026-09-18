import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { referenceAssets } from '../src/data/referenceManifest.ts'

const directory = resolve('dist/reference-data')
const manifest = JSON.parse(await readFile(resolve(directory, 'manifest.json'), 'utf8'))
const names = (await readdir(directory)).filter((name) => name.endsWith('.json') && name !== 'manifest.json')
if (names.length !== referenceAssets.length || names.some((name) => !referenceAssets.some(([path]) => path === name))) {
  throw new Error('dist reference asset inventory is incomplete.')
}
for (const entry of manifest.assets) {
  const hash = createHash('sha256').update(await readFile(resolve(directory, entry.path))).digest('hex')
  if (hash !== entry.sha256) throw new Error(`dist hash mismatch: ${entry.path}`)
}
