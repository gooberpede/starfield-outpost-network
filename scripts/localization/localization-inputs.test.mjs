import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { deflateSync } from 'node:zlib'

import {
  Ba2LocalizationError, discoverLocalizationMembers, extractBa2Member, inspectBa2,
} from './ba2-localization-reader.mjs'
import { generateProvenance } from './localized-name-provenance.mjs'
import { SEMANTIC_PATHS } from './localized-field-map.mjs'
import { encodingForLocale, readStringTable, StringTableError } from './string-table-reader.mjs'

function tableBytes(id = 1, value = 'Fixture') {
  const text = Buffer.from(`${value}\0`, 'utf8')
  const buffer = Buffer.alloc(16 + text.length)
  buffer.writeUInt32LE(1, 0)
  buffer.writeUInt32LE(text.length, 4)
  buffer.writeUInt32LE(id, 8)
  buffer.writeUInt32LE(0, 12)
  text.copy(buffer, 16)
  return buffer
}

function fixtureBa2(filePath, members, { magic = 'BTDX', version = 2, type = 'GNRL', truncate = 0 } = {}) {
  const headerSize = 32
  const recordSize = 36
  const recordsSize = members.length * recordSize
  const stored = members.map((member) => member.compressed ? deflateSync(member.data) : member.data)
  let dataOffset = headerSize + recordsSize
  const records = Buffer.alloc(recordsSize)
  for (let index = 0; index < members.length; index += 1) {
    const offset = index * recordSize
    records.writeBigUInt64LE(BigInt(dataOffset), offset + 16)
    records.writeUInt32LE(members[index].compressed ? stored[index].length : 0, offset + 24)
    records.writeUInt32LE(members[index].data.length, offset + 28)
    records.writeUInt32LE(0xBAADF00D, offset + 32)
    dataOffset += stored[index].length
  }
  const names = Buffer.concat(members.map((member) => {
    const name = Buffer.from(member.name, 'utf8')
    const length = Buffer.alloc(2)
    length.writeUInt16LE(name.length)
    return Buffer.concat([length, name])
  }))
  const header = Buffer.alloc(headerSize)
  header.write(magic, 0, 'ascii')
  header.writeUInt32LE(version, 4)
  header.write(type, 8, 'ascii')
  header.writeUInt32LE(members.length, 12)
  header.writeBigUInt64LE(BigInt(dataOffset), 16)
  header.writeUInt32LE(1, 24)
  const complete = Buffer.concat([header, records, ...stored, names])
  writeFileSync(filePath, truncate ? complete.subarray(0, complete.length - truncate) : complete)
}

function tempFile(name) {
  return path.join(mkdtempSync(path.join(tmpdir(), 'son-localization-')), name)
}

test('enumerates and extracts stored and compressed BA2 v2 GNRL members', () => {
  const filePath = tempFile('fixture.ba2')
  const stored = tableBytes(1, 'Stored')
  const compressed = tableBytes(2, 'Compressed')
  fixtureBa2(filePath, [
    { name: 'Strings/Fixture_EN.STRINGS', data: stored },
    { name: 'strings/fixture_ja.strings', data: compressed, compressed: true },
  ])
  const archive = inspectBa2(filePath)
  assert.equal(archive.memberCount, 2)
  assert.deepEqual(extractBa2Member(archive, archive.members[0]), stored)
  assert.deepEqual(extractBa2Member(archive, archive.members[1]), compressed)
})

test('rejects malformed headers, unsupported archive types, and truncation', () => {
  for (const [options, code] of [
    [{ magic: 'NOPE' }, 'BA2_INVALID_HEADER'],
    [{ version: 3 }, 'BA2_UNSUPPORTED_VERSION'],
    [{ type: 'DX10' }, 'BA2_UNSUPPORTED_TYPE'],
    [{ truncate: 1 }, 'BA2_MEMBER_TRUNCATED'],
  ]) {
    const filePath = tempFile(`${code}.ba2`)
    fixtureBa2(filePath, [{ name: 'fixture_en.strings', data: tableBytes() }], options)
    assert.throws(() => inspectBa2(filePath), (error) => error instanceof Ba2LocalizationError && error.code === code)
  }
})

test('detects only exact case-insensitive plugin, locale, and table identities', () => {
  const filePath = tempFile('mapping.ba2')
  fixtureBa2(filePath, [
    { name: 'assets/unrelated.bin', data: Buffer.from('asset') },
    { name: 'strings/FIXTURE_EN.STRINGS', data: tableBytes() },
    { name: 'strings/other_en.strings', data: tableBytes() },
  ])
  const result = discoverLocalizationMembers([inspectBa2(filePath)], 'Fixture.esm', ['en', 'ja'])
  assert.deepEqual(result.matches.map((item) => `${item.locale}:${item.tableType}`), ['en:strings'])
  assert.deepEqual(result.missingLanguages, ['ja'])
  assert.throws(
    () => discoverLocalizationMembers([inspectBa2(filePath)], 'Fixture.esm', ['ja'], { requireLanguages: true }),
    (error) => error.code === 'LANGUAGE_NOT_FOUND',
  )
})

test('maps one plugin across multiple explicit archives and rejects ambiguity', () => {
  const firstPath = tempFile('first.ba2')
  const secondPath = tempFile('second.ba2')
  fixtureBa2(firstPath, [{ name: 'fixture_en.strings', data: tableBytes() }])
  fixtureBa2(secondPath, [{ name: 'fixture_en.dlstrings', data: tableBytes() }])
  const archives = [inspectBa2(firstPath), inspectBa2(secondPath)]
  assert.deepEqual(
    discoverLocalizationMembers(archives, 'Fixture.esm', ['en']).matches.map((item) => item.tableType).sort(),
    ['dlstrings', 'strings'],
  )
  const duplicatePath = tempFile('duplicate.ba2')
  fixtureBa2(duplicatePath, [{ name: 'other/path/FIXTURE_en.strings', data: tableBytes() }])
  assert.throws(
    () => discoverLocalizationMembers([...archives, inspectBa2(duplicatePath)], 'Fixture.esm', ['en']),
    (error) => error.code === 'LOCALIZATION_TABLE_AMBIGUOUS',
  )
})

test('an exact extracted table resolves C2 while a wrong-plugin table does not', () => {
  const tablePath = tempFile('fixture_en.strings')
  writeFileSync(tablePath, tableBytes(0xFC7, 'X-Tech'))
  const table = readStringTable(tablePath)
  const target = {
    entityKind: 'resource', entityId: 'x-tech', recordSourcePlugin: 'Fixture.esm', recordFormId: '01033E3F',
    canonicalEnglish: 'X-Tech', recordSignature: 'IRES', semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL,
  }
  const record = { signature: 'IRES', formIdHex: '01033E3F', subrecords: [{ signature: 'FULL', data: Buffer.from([0xC7, 0x0F, 0, 0]) }] }
  const records = new Map([['Fixture.esm', new Map([['IRES:01033E3F', record]])]])
  assert.equal(generateProvenance([target], records, new Map()).unresolved[0].ReasonCode, 'MISSING_LOCALIZATION_INPUT')
  assert.equal(generateProvenance([target], records, new Map([['Wrong.esm:strings', table]])).unresolved[0].ReasonCode, 'MISSING_LOCALIZATION_INPUT')
  assert.equal(generateProvenance([target], records, new Map([['Fixture.esm:strings', table]])).provenance.length, 1)
  assert.equal(readFileSync(tablePath).length, tableBytes(0xFC7, 'X-Tech').length)
})

test('decodes string tables with an explicit locale policy', () => {
  const englishPath = tempFile('fixture_en.strings')
  const japanesePath = tempFile('fixture_ja.strings')
  const english = tableBytes(1, 'Creche')
  english[18] = 0xE8
  writeFileSync(englishPath, english)
  writeFileSync(japanesePath, tableBytes(1, '遊牧の'))
  assert.equal(readStringTable(englishPath, 'strings', { locale: 'en' }).get(1), 'Crèche')
  assert.equal(readStringTable(japanesePath, 'strings', { locale: 'ja-JP' }).get(1), '遊牧の')
  assert.equal(encodingForLocale('en-US'), 'windows-1252')
  assert.equal(encodingForLocale('fr'), 'utf-8')
  assert.equal(encodingForLocale('fr-FR'), 'utf-8')
  assert.equal(encodingForLocale('de'), 'utf-8')
  assert.equal(encodingForLocale('de-DE'), 'utf-8')
  assert.equal(encodingForLocale('ja-JP'), 'utf-8')
  assert.throws(
    () => encodingForLocale('xx'),
    (error) => error instanceof StringTableError && error.code === 'UNSUPPORTED_LOCALE_ENCODING',
  )
})

test('malformed UTF-8 fails without byte sniffing or fallback', () => {
  const frenchPath = tempFile('fixture_fr.strings')
  const malformed = tableBytes(1, 'xx')
  malformed[16] = 0xC3
  malformed[17] = 0x28
  writeFileSync(frenchPath, malformed)
  assert.throws(() => readStringTable(frenchPath, 'strings', { locale: 'fr' }), /encoded data was not valid|decoding/i)
})
