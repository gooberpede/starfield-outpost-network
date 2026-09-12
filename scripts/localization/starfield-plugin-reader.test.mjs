import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import zlib from 'node:zlib'

import { extractLocalizedId, SEMANTIC_PATHS } from './localized-field-map.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import {
  COMPRESSED_RECORD_FLAG,
  decodeRecordPayload,
  decodeSubrecords,
  findRecordsInBuffer,
  formatHex32,
} from './starfield-plugin-reader.mjs'

function subrecord(signature, data = Buffer.alloc(0), declaredSize = data.length) {
  const header = Buffer.alloc(6)
  header.write(signature, 0, 4, 'ascii')
  header.writeUInt16LE(declaredSize, 4)
  return Buffer.concat([header, data])
}

function extendedSubrecord(signature, data) {
  const size = Buffer.alloc(4)
  size.writeUInt32LE(data.length)
  return Buffer.concat([subrecord('XXXX', size), subrecord(signature, data, 0)])
}

function localizedId(value) {
  const data = Buffer.alloc(4)
  data.writeUInt32LE(value >>> 0)
  return data
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

function group(...children) {
  const payload = Buffer.concat(children)
  const header = Buffer.alloc(24)
  header.write('GRUP', 0, 4, 'ascii')
  header.writeUInt32LE(24 + payload.length, 4)
  header.write('TEST', 8, 4, 'ascii')
  return Buffer.concat([header, payload])
}

function parsedRecord(signature, formId, payload, flags = 0) {
  return findRecordsInBuffer(record(signature, formId, payload, flags), [{ signature, formId }])[0]
}

function assertCode(code) {
  return (error) => error?.code === code
}

test('selects one uncompressed record by exact signature and raw FormID', () => {
  const selected = parsedRecord('IRES', 0x57D6, subrecord('FULL', localizedId(0x8155)))
  assert.equal(selected.signature, 'IRES')
  assert.equal(selected.formIdHex, '000057D6')
  assert.equal(selected.compressed, false)
})

test('recurses through nested groups and retains group ancestry', () => {
  const fixture = group(group(record('BIOM', 0x2ACD5A, subrecord('FULL', localizedId(0x62F4)))))
  const selected = findRecordsInBuffer(fixture, [{ signature: 'BIOM', formId: 0x2ACD5A }])[0]
  assert.equal(selected.groupAncestry.length, 2)
})

test('rejects incomplete headers and record payloads outside their boundary', () => {
  assert.throws(() => findRecordsInBuffer(Buffer.alloc(23), [{ signature: 'IRES', formId: 1 }]), assertCode('PLUGIN_TRUNCATED'))
  const bad = Buffer.alloc(24)
  bad.write('IRES', 0, 4, 'ascii')
  bad.writeUInt32LE(12, 4)
  bad.writeUInt32LE(1, 12)
  assert.throws(() => findRecordsInBuffer(bad, [{ signature: 'IRES', formId: 1 }]), assertCode('PLUGIN_TRUNCATED'))
})

test('decodes valid compressed records and verifies the size prefix', () => {
  const selected = parsedRecord('PNDT', 7, subrecord('FULL', localizedId(3)), COMPRESSED_RECORD_FLAG)
  assert.equal(selected.compressed, true)
  assert.equal(selected.subrecords[0].signature, 'FULL')

  const compressed = zlib.deflateSync(Buffer.from('payload'))
  const wrongSize = Buffer.alloc(4)
  wrongSize.writeUInt32LE(999)
  assert.throws(
    () => decodeRecordPayload(Buffer.concat([wrongSize, compressed]), { flags: COMPRESSED_RECORD_FLAG }),
    assertCode('RECORD_SIZE_MISMATCH'),
  )
  assert.throws(
    () => decodeRecordPayload(Buffer.concat([Buffer.alloc(4), Buffer.from('not zlib')]), { flags: COMPRESSED_RECORD_FLAG }),
    assertCode('RECORD_DECOMPRESSION_FAILED'),
  )
})

test('decodes normal, multiple, and XXXX-sized subrecords', () => {
  const large = Buffer.alloc(70_000, 0x5A)
  const decoded = decodeSubrecords(Buffer.concat([
    subrecord('EDID', Buffer.from('Fixture\0')),
    subrecord('FULL', localizedId(0x1234)),
    extendedSubrecord('PCCC', large),
  ]))
  assert.deepEqual(decoded.map((item) => item.signature), ['EDID', 'FULL', 'XXXX', 'PCCC'])
  assert.equal(decoded[3].size, 70_000)
})

test('rejects dangling, incomplete, and out-of-bounds XXXX structures', () => {
  const size = localizedId(10)
  assert.throws(() => decodeSubrecords(subrecord('XXXX', size)), assertCode('XXXX_WITHOUT_FOLLOWING_SUBRECORD'))
  assert.throws(() => decodeSubrecords(subrecord('XXXX', Buffer.alloc(2))), assertCode('SUBRECORD_TRUNCATED'))
  assert.throws(
    () => decodeSubrecords(Buffer.concat([subrecord('XXXX', size), subrecord('FULL', Buffer.alloc(2), 0)])),
    assertCode('SUBRECORD_TRUNCATED'),
  )
})

test('extracts supported IRES and BIOM top-level FULL fields', () => {
  for (const signature of ['IRES', 'BIOM']) {
    const selected = parsedRecord(signature, 1, subrecord('FULL', localizedId(0x8155)))
    assert.deepEqual(extractLocalizedId(selected, SEMANTIC_PATHS.TOP_LEVEL_FULL), {
      id: 0x8155, idHex: '00008155', stringTable: 'strings', semanticPath: 'topLevel.FULL',
    })
  }
})

test('component selection requires TESFullName_Component and ignores sibling FULL and inline ANAM', () => {
  const marker = (name) => subrecord('BFCB', Buffer.from(`${name}\0`))
  const payload = Buffer.concat([
    marker('Other_Component'), subrecord('FULL', localizedId(0xBAD)), subrecord('BFCE'),
    marker('TESFullName_Component'), subrecord('FULL', localizedId(0xA9D0)), subrecord('BFCE'),
    subrecord('ANAM', Buffer.from('Alpha Centauri\0')),
  ])
  for (const signature of ['STDT', 'PNDT']) {
    const result = extractLocalizedId(parsedRecord(signature, 2, payload), SEMANTIC_PATHS.TES_FULL_NAME)
    assert.equal(result.idHex, '0000A9D0')
  }
})

test('semantic selection fails closed for unsupported, missing, and ambiguous paths', () => {
  const full = subrecord('FULL', localizedId(1))
  assert.throws(
    () => findRecordsInBuffer(record('FLOR', 1, full), [{ signature: 'FLOR', formId: 1 }]),
    assertCode('UNSUPPORTED_RECORD_SIGNATURE'),
  )
  const ires = parsedRecord('IRES', 1, full)
  assert.throws(() => extractLocalizedId(ires, 'unknown.path'), assertCode('UNSUPPORTED_SEMANTIC_PATH'))
  const missing = parsedRecord('STDT', 2, full)
  assert.throws(() => extractLocalizedId(missing, SEMANTIC_PATHS.TES_FULL_NAME), assertCode('SEMANTIC_FIELD_NOT_FOUND'))
  const duplicate = parsedRecord('BIOM', 3, Buffer.concat([full, full]))
  assert.throws(() => extractLocalizedId(duplicate, SEMANTIC_PATHS.TOP_LEVEL_FULL), assertCode('SEMANTIC_FIELD_AMBIGUOUS'))
})

test('localized IDs require four little-endian bytes and normalize as uppercase hex', () => {
  const invalid = parsedRecord('IRES', 1, subrecord('FULL', Buffer.alloc(3)))
  assert.throws(() => extractLocalizedId(invalid, SEMANTIC_PATHS.TOP_LEVEL_FULL), assertCode('LOCALIZED_ID_INVALID_LENGTH'))
  assert.equal(formatHex32(0x89ABCDEF), '89ABCDEF')
})

test('manifest records stable plugin identity, hash, version, and declared load order', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'starfield-provenance-'))
  const pluginPath = path.join(directory, 'Fixture.esm')
  try {
    await writeFile(pluginPath, Buffer.from('project-authored fixture'))
    const manifest = await createProvenanceManifest({
      pluginPaths: [pluginPath],
      gameVersion: 'fixture-version',
      generatedAt: '2026-09-12T00:00:00.000Z',
    })
    assert.equal(manifest.gameVersion, 'fixture-version')
    assert.equal(manifest.generatedAt, '2026-09-12T00:00:00.000Z')
    assert.equal(manifest.plugins[0].sourcePath, 'Fixture.esm')
    assert.equal(manifest.plugins[0].filename, 'Fixture.esm')
    assert.equal(manifest.plugins[0].size, 24)
    assert.match(manifest.plugins[0].sha256, /^[0-9A-F]{64}$/)
    assert.deepEqual(manifest.declaredLoadOrder, ['Fixture.esm'])
  } finally {
    await rm(directory, { recursive: true })
  }
})
