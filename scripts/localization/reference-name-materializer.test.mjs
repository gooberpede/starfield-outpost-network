import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  COMPOSED_SEPARATOR, classifyReferenceNameSidecarDrift, compareReferenceNameOverlays, materializeReferenceNames,
  normalizeReferenceKind, serializeReferenceNameModule, sha256Text,
} from './reference-name-materializer.mjs'
import { verifyCommittedReferenceNameOverlay } from './verify-reference-name-overlay.mjs'

const completeRow = (overrides = {}) => ({
  EntityKind: 'resource', EntityId: 'fixture', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
  NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '00000001', ...overrides,
})
const tables = new Map([['Starfield.esm:ja:strings', new Map([[1, '直接'], [2, '種'], [3, '接頭'], [4, '食性']])]])

test('direct and template rows resolve only through qualified table identity', () => {
  assert.equal(materializeReferenceNames([completeRow()], tables).resource.fixture, '直接')
  assert.equal(materializeReferenceNames([completeRow({ DisplayNameSourceKind: 'template' })], tables).resource.fixture, '直接')
  assert.throws(() => materializeReferenceNames([completeRow({ NameSourcePlugin: 'Other.esm' })], tables), /LOCALIZATION_TABLE_MISSING/)
  assert.throws(() => materializeReferenceNames([completeRow({ NameStringID: '000000FF' })], tables), /LOCALIZATION_TABLE_MISSING/)
})

test('composed fauna require species and join ordered non-empty components with exactly U+0020', () => {
  const rows = [
    completeRow({ EntityKind: 'fauna', DisplayNameSourceKind: 'composed', ComponentOrder: '2', ComponentRole: 'diet', NameStringID: '00000004' }),
    completeRow({ EntityKind: 'fauna', DisplayNameSourceKind: 'composed', ComponentOrder: '0', ComponentRole: 'prefix', NameStringID: '00000003' }),
    completeRow({ EntityKind: 'fauna', DisplayNameSourceKind: 'composed', ComponentOrder: '1', ComponentRole: 'species', NameStringID: '00000002' }),
  ]
  assert.equal(COMPOSED_SEPARATOR.codePointAt(0), 0x20)
  assert.equal(materializeReferenceNames(rows, tables).species.fixture, '接頭 種 食性')
  assert.throws(() => materializeReferenceNames(rows.filter((row) => row.ComponentOrder !== '1'), tables), /requires species slot 1/)
})

test('kind normalization merges flora and fauna into species and rejects collisions', () => {
  assert.equal(normalizeReferenceKind('flora'), 'species')
  assert.equal(normalizeReferenceKind('fauna'), 'species')
  assert.equal(normalizeReferenceKind('body'), 'body')
  assert.throws(() => normalizeReferenceKind('unknown'), /UNKNOWN_REFERENCE_KIND/)
  assert.throws(() => materializeReferenceNames([
    completeRow({ EntityKind: 'flora' }), completeRow({ EntityKind: 'fauna', NameStringID: '00000002' }),
  ], tables), /DUPLICATE_RUNTIME_KEY/)
})

test('serialization is byte-identical and drift reports keys and Japanese values', () => {
  const overlay = materializeReferenceNames([completeRow()], tables)
  assert.equal(serializeReferenceNameModule(overlay), serializeReferenceNameModule(structuredClone(overlay)))
  const changed = structuredClone(overlay); changed.resource.fixture = '変更'; changed.resource.added = '追加'
  assert.deepEqual(compareReferenceNameOverlays(changed, overlay).map((item) => item.type), ['added-key', 'changed-japanese-value'])
  assert.equal(sha256Text(serializeReferenceNameModule(overlay)).length, 64)
})

test('sidecar drift distinguishes provenance, Japanese input identity, and generated hashes', () => {
  const before = { provenanceSha256: 'A', provenanceManifestIdentity: 'B', generatedModuleSha256: 'C' }
  assert.ok(classifyReferenceNameSidecarDrift({ ...before, provenanceSha256: 'D' }, before).includes('changed upstream provenance hash'))
  assert.ok(classifyReferenceNameSidecarDrift({ ...before, provenanceManifestIdentity: 'D' }, before).includes('changed Japanese input manifest/table identity'))
  assert.ok(classifyReferenceNameSidecarDrift({ ...before, generatedModuleSha256: 'D' }, before).includes('changed generated hash'))
})

test('repository-only verifier detects generated module tampering', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'reference-overlay-'))
  try {
    await mkdir(path.join(root, 'src/localization/generated'), { recursive: true })
    await mkdir(path.join(root, 'reference-source'), { recursive: true })
    await mkdir(path.join(root, 'public/reference-data'), { recursive: true })
    const repositoryRoot = path.resolve(import.meta.dirname, '../..')
    for (const relative of ['src/localization/generated/ja-JP-reference-names.ts', 'reference-source/localized-name-provenance.csv', 'reference-source/localized-reference-names-manifest.json', 'public/reference-data/resources.json']) {
      await writeFile(path.join(root, relative), await readFile(path.join(repositoryRoot, relative)))
    }
    const modulePath = path.join(root, 'src/localization/generated/ja-JP-reference-names.ts')
    await writeFile(modulePath, `${await readFile(modulePath, 'utf8')}\n`)
    await assert.rejects(verifyCommittedReferenceNameOverlay(root), /GENERATED_MODULE_HASH_MISMATCH/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
