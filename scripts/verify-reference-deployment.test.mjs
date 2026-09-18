import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, writeFile, copyFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { generateReferenceManifest, verifyReferenceDeployment } from './verify-reference-deployment.mjs'
import { referenceAssets, canonicalDatasetContent } from '../src/data/referenceManifest.ts'
import { createHash } from 'node:crypto'

test('manifest is deterministic and uses exactly the committed 13 files', async () => {
  const first = await verifyReferenceDeployment({ writeArtifacts: false })
  const second = await verifyReferenceDeployment({ writeArtifacts: false })
  assert.deepEqual(first, second)
  assert.deepEqual(first.assets.map(({ path }) => path), referenceAssets.map(([path]) => path))
  const hash = createHash('sha256').update(canonicalDatasetContent(first.assets)).digest('hex')
  assert.equal(first.datasetId, `sha256:${hash}`)
})

test('missing, extra, malformed and stale committed assets fail without rewriting', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'reference-test-'))
  const committed = resolve(root, 'committed')
  const expected = resolve(root, 'expected')
  const { mkdir } = await import('node:fs/promises')
  await mkdir(committed)
  await mkdir(expected)
  try {
    for (const [path] of referenceAssets) {
      await copyFile(resolve('public/reference-data', path), resolve(committed, path))
      await copyFile(resolve('public/reference-data', path), resolve(expected, path))
    }
    const good = await verifyReferenceDeployment({ committedDirectory: committed, expectedDirectory: expected, writeArtifacts: false })
    assert.equal(good.assets.length, 13)
    assert.deepEqual(await generateReferenceManifest({ committedDirectory: committed, writeArtifacts: false }), good)
    await rm(resolve(committed, 'biomes.json'))
    await assert.rejects(verifyReferenceDeployment({ committedDirectory: committed, expectedDirectory: expected, writeArtifacts: false }))
    await copyFile(resolve(expected, 'biomes.json'), resolve(committed, 'biomes.json'))
    await writeFile(resolve(committed, 'unexpected.json'), '[]')
    await assert.rejects(verifyReferenceDeployment({ committedDirectory: committed, expectedDirectory: expected, writeArtifacts: false }))
    await rm(resolve(committed, 'unexpected.json'))
    await writeFile(resolve(committed, 'biomes.json'), '{invalid')
    await assert.rejects(verifyReferenceDeployment({ committedDirectory: committed, expectedDirectory: expected, writeArtifacts: false }))
    await writeFile(resolve(committed, 'biomes.json'), '[]')
    const refreshed = await generateReferenceManifest({ committedDirectory: committed, writeArtifacts: false })
    assert.notEqual(refreshed.datasetId, good.datasetId)
    await assert.rejects(verifyReferenceDeployment({ committedDirectory: committed, expectedDirectory: expected, writeArtifacts: false }))
    assert.deepEqual((await readdir(committed)).sort(), referenceAssets.map(([path]) => path).sort())
    assert.equal((await readFile(resolve(committed, 'biomes.json'), 'utf8')), '[]')
  } finally { await rm(root, { recursive: true, force: true }) }
})
