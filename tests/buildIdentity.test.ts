import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runInNewContext } from 'node:vm'
import { readBuildIdentity, resolveBuildIdentity } from '../scripts/build-identity.ts'

const sha = 'a'.repeat(40)
test('build identity prefers verified checkout and never claims pristine modified source', () => {
  for (const gitDirty of [false, true]) {
    const identity = resolveBuildIdentity({ version: '0.0.0', gitCommit: sha, gitDirty,
      pagesCommit: 'b'.repeat(40), pagesBuild: true })
    assert.equal(identity.commit, sha)
    assert.equal(identity.status, gitDirty ? 'modified' : 'clean')
    assert.equal(identity.sourceUrl, gitDirty ? null : `https://github.com/gooberpede/starfield-outpost-network/tree/${sha}`)
  }
})
test('invalid/missing metadata and environment-only commits cannot certify pristine source', () => {
  for (const pagesCommit of [undefined, '', 'abcdef0', '../secret', '<script>', 'g'.repeat(40)]) {
    const identity = resolveBuildIdentity({ version: '0.0.0', pagesBuild: true, pagesCommit })
    assert.equal(identity.commit, null)
    assert.equal(identity.status, 'unknown')
    assert.equal(identity.sourceUrl, null)
  }
  assert.equal(resolveBuildIdentity({ version: '0.0.0', pagesCommit: sha }).commit, null)
  const ci = resolveBuildIdentity({ version: '0.0.0', pagesBuild: true, pagesCommit: sha.toUpperCase() })
  assert.equal(ci.commit, sha)
  assert.equal(ci.status, 'unknown')
  assert.equal(ci.sourceUrl, null)
  assert.equal(resolveBuildIdentity({ version: '0.0.0', gitCommit: sha }).status, 'unknown')
})
test('package is the version authority; archive builds remain honest and metadata is allowlisted', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'outpost-identity-'))
  try {
    const version = '0.0.0-"\\\n<script>'
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version, private: true, secret: 'not-exposed' }))
    writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ version, packages: { '': { version } } }))
    const identity = readBuildIdentity(root)
    assert.equal(identity.version, version)
    assert.equal(identity.status, 'unknown')
    assert.equal(identity.sourceUrl, null)
    assert.deepEqual(Object.keys(identity), ['version', 'commit', 'status', 'sourceUrl'])
    const encoded = JSON.stringify(identity)
    assert.deepEqual(JSON.parse(encoded), identity)
    assert.equal(runInNewContext(`(${encoded}).version`), version)
    assert.equal(encoded.includes(root), false)
    assert.equal(encoded.includes('not-exposed'), false)
    writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ version: '1.0.0', packages: { '': { version } } }))
    assert.throws(() => readBuildIdentity(root), /versions must agree/)
  } finally { rmSync(root, { recursive: true, force: true }) }
  const actual = readBuildIdentity(process.cwd())
  assert.equal(actual.version, JSON.parse(readFileSync('package.json', 'utf8')).version)
})
