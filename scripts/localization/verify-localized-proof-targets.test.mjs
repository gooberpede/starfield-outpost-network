import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import zlib from 'node:zlib'

import { COMPRESSED_RECORD_FLAG } from './starfield-plugin-reader.mjs'
import { AUDITED_GAME_VERSION, verifyProofTargets } from './verify-localized-proof-targets.mjs'

function subrecord(signature, data) {
  const header = Buffer.alloc(6)
  header.write(signature, 0, 4, 'ascii')
  header.writeUInt16LE(data.length, 4)
  return Buffer.concat([header, data])
}

function localizedId(value) {
  const data = Buffer.alloc(4)
  data.writeUInt32LE(value >>> 0)
  return data
}

function fullNameComponent(value) {
  return Buffer.concat([
    subrecord('BFCB', Buffer.from('TESFullName_Component\0')),
    subrecord('FULL', localizedId(value)),
    subrecord('BFCE', Buffer.alloc(0)),
  ])
}

function record(signature, formId, payload, flags = 0) {
  let storedPayload = payload
  if ((flags & COMPRESSED_RECORD_FLAG) !== 0) {
    const size = Buffer.alloc(4)
    size.writeUInt32LE(payload.length)
    storedPayload = Buffer.concat([size, zlib.deflateSync(payload)])
  }
  const header = Buffer.alloc(24)
  header.write(signature, 0, 4, 'ascii')
  header.writeUInt32LE(storedPayload.length, 4)
  header.writeUInt32LE(flags, 8)
  header.writeUInt32LE(formId >>> 0, 12)
  return Buffer.concat([header, storedPayload])
}

test('the documented --plugin proof path uses the current manifest contract and verifies all pinned targets', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'starfield-proof-'))
  const pluginPath = path.join(directory, 'Starfield.esm')
  const plugin = Buffer.concat([
    record('IRES', 0x000057D6, subrecord('FULL', localizedId(0x00008155))),
    record('BIOM', 0x002ACD5A, subrecord('FULL', localizedId(0x000062F4))),
    record('STDT', 0x0005E60A, fullNameComponent(0x0000A9D0)),
    record('PNDT', 0x0005E2B6, fullNameComponent(0x0000A3B2), COMPRESSED_RECORD_FLAG),
  ])
  try {
    await writeFile(pluginPath, plugin)
    const report = await verifyProofTargets({ pluginPath })
    assert.equal(report.manifest.gameVersion, AUDITED_GAME_VERSION)
    assert.equal(report.manifest.authoritativePlugins.length, 1)
    assert.equal(report.manifest.authoritativePlugins[0].filename, 'Starfield.esm')
    assert.equal(report.manifest.authoritativePlugins[0].localReference, 'Data/Starfield.esm')
    assert.equal(report.manifest.authoritativePlugins[0].size, plugin.length)
    assert.match(report.manifest.authoritativePlugins[0].sha256, /^[0-9A-F]{64}$/)
    assert.deepEqual(report.results.map(({ label, pass }) => [label, pass]), [
      ['Aluminum', true],
      ['Rocky Desert', true],
      ['Alpha Centauri', true],
      ['Akila', true],
    ])
    assert.equal(report.results.at(-1).compressed, true)

    const scriptPath = path.join(import.meta.dirname, 'verify-localized-proof-targets.mjs')
    const manifestPath = path.join(directory, 'proof-manifest.json')
    const unacknowledged = spawnSync(process.execPath, [scriptPath, '--plugin', pluginPath, '--manifest', manifestPath], { encoding: 'utf8' })
    assert.equal(unacknowledged.status, 1)
    assert.match(unacknowledged.stderr, /PROOF_HASH_ACKNOWLEDGEMENT_REQUIRED/)

    const acknowledged = spawnSync(process.execPath, [
      scriptPath, '--plugin', pluginPath, '--manifest', manifestPath, '--acknowledge-hash-mismatch',
    ], { encoding: 'utf8' })
    assert.equal(acknowledged.status, 0, acknowledged.stderr)
    assert.match(acknowledged.stdout, /PASS Aluminum/)
    assert.match(acknowledged.stdout, /PASS Akila/)
    const persistedManifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    assert.equal(persistedManifest.authoritativePlugins[0].filename, 'Starfield.esm')
  } finally {
    await rm(directory, { recursive: true })
  }
})
