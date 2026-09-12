import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import {
  buildSupportedProviderChains, normalizeFullModuleRecordIdentity, readTes4MasterList, resolveLocalizedFieldProvider,
} from './official-master-provider-chains.mjs'

function subrecord(signature, data = Buffer.alloc(0)) {
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

function pndt(formId, id) {
  const subrecords = id === undefined ? [] : [
    { signature: 'BFCB', data: Buffer.from('TESFullName_Component\0') },
    { signature: 'FULL', data: localizedId(id) },
    { signature: 'BFCE', data: Buffer.alloc(0) },
  ]
  return { signature: 'PNDT', formId: formId >>> 0, formIdHex: (formId >>> 0).toString(16).toUpperCase().padStart(8, '0'), subrecords }
}

function inputs(base, shattered, patch) {
  return [
    { plugin: 'Starfield.esm', masters: [], records: base },
    { plugin: 'ShatteredSpace.esm', masters: ['Starfield.esm'], records: shattered },
    { plugin: 'SFBGS00D.esm', masters: ['Starfield.esm'], records: patch },
  ]
}

test('reads ordered TES4 MAST entries without interpreting unrelated header fields', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'c7-tes4-'))
  const pluginPath = path.join(directory, 'Fixture.esm')
  const payload = Buffer.concat([
    subrecord('HEDR', Buffer.alloc(12)), subrecord('MAST', Buffer.from('Starfield.esm\0')),
    subrecord('DATA', Buffer.alloc(8)), subrecord('MAST', Buffer.from('Other.esm\0')),
  ])
  const header = Buffer.alloc(24)
  header.write('TES4', 0, 4, 'ascii')
  header.writeUInt32LE(payload.length, 4)
  try {
    await writeFile(pluginPath, Buffer.concat([header, payload]))
    assert.deepEqual(readTes4MasterList(pluginPath), ['Starfield.esm', 'Other.esm'])
  } finally {
    await rm(directory, { recursive: true })
  }
})

test('normalizes full-module master and local namespaces while retaining origin qualification', () => {
  assert.equal(normalizeFullModuleRecordIdentity('SFBGS00D.esm', ['Starfield.esm'], 'PNDT', 0x0005E364).key, 'PNDT:Starfield.esm:385892')
  assert.equal(normalizeFullModuleRecordIdentity('ShatteredSpace.esm', ['Starfield.esm'], 'PNDT', 0x01000001).key, 'PNDT:ShatteredSpace.esm:1')
  assert.equal(normalizeFullModuleRecordIdentity('SFBGS00D.esm', ['Starfield.esm'], 'PNDT', 0x01000001).key, 'PNDT:SFBGS00D.esm:1')
  assert.throws(
    () => normalizeFullModuleRecordIdentity('Starfield.esm', [], 'PNDT', 0x01000001),
    (error) => error.code === 'FORM_ID_NORMALIZATION_FAILED',
  )
})

test('explicit winning field ownership selects the override and its qualified string table', () => {
  const chains = buildSupportedProviderChains(inputs([pndt(1, 7)], [], [pndt(1, 7)]))
  const resolved = resolveLocalizedFieldProvider(chains.get('PNDT:Starfield.esm:1'), SEMANTIC_PATHS.TES_FULL_NAME)
  const tables = new Map([
    ['Starfield.esm:strings', new Map([[7, 'Master text']])],
    ['SFBGS00D.esm:strings', new Map([[7, 'Override text']])],
  ])
  assert.equal(resolved.plugin, 'SFBGS00D.esm')
  assert.equal(resolved.inherited, false)
  assert.equal(tables.get(`${resolved.plugin}:${resolved.localized.stringTable}`).get(resolved.localized.id), 'Override text')
})

test('an override that omits the exact field inherits from the latest explicit provider', () => {
  const chains = buildSupportedProviderChains(inputs([pndt(1, 9)], [], [pndt(1)]))
  const resolved = resolveLocalizedFieldProvider(chains.get('PNDT:Starfield.esm:1'), SEMANTIC_PATHS.TES_FULL_NAME)
  assert.equal(resolved.plugin, 'Starfield.esm')
  assert.equal(resolved.localized.id, 9)
  assert.equal(resolved.inherited, true)
})

test('provider resolution fails closed when no provider serializes the selected field', () => {
  const chains = buildSupportedProviderChains(inputs([pndt(1)], [], [pndt(1)]))
  assert.throws(
    () => resolveLocalizedFieldProvider(chains.get('PNDT:Starfield.esm:1'), SEMANTIC_PATHS.TES_FULL_NAME),
    (error) => error.code === 'OVERRIDE_PROVIDER_UNRESOLVED',
  )
})
