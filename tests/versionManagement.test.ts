import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  calculateNextVersion,
  type VersionCommand,
  updateVersionMetadata,
} from '../scripts/version-management.ts'

test('beta increments an existing beta train without changing its core', () => {
  assert.equal(calculateNextVersion('0.9.0-beta.1', 'beta'), '0.9.0-beta.2')
  assert.equal(calculateNextVersion('0.9.0-beta.9', 'beta'), '0.9.0-beta.10')
  assert.throws(() => calculateNextVersion('0.9.0', 'beta'), /existing X\.Y\.Z-beta\.N/)
  assert.throws(() => calculateNextVersion('1.0.0-rc.1', 'beta'), /existing X\.Y\.Z-beta\.N/)
})

test('rc continues an RC train or starts a greater explicit stable target', () => {
  assert.equal(calculateNextVersion('1.0.0-rc.1', 'rc'), '1.0.0-rc.2')
  assert.equal(calculateNextVersion('0.9.0-beta.3', 'rc', '1.0.0'), '1.0.0-rc.1')
  assert.equal(calculateNextVersion('1.0.0-beta.3', 'rc', '1.0.0'), '1.0.0-rc.1')
  assert.throws(() => calculateNextVersion('0.9.0-beta.3', 'rc'), /explicit stable target/)
  assert.throws(() => calculateNextVersion('0.9.0-beta.3', 'rc', '1.0'), /plain stable version/)
  assert.throws(() => calculateNextVersion('1.0.0', 'rc', '1.0.0'), /cannot move back/)
  assert.throws(() => calculateNextVersion('1.0.0-rc.2', 'rc', '1.0.0'), /without a target/)
})

test('release promotes either supported prerelease and rejects stable versions', () => {
  assert.equal(calculateNextVersion('1.0.0-rc.8', 'release'), '1.0.0')
  assert.equal(calculateNextVersion('0.9.0-beta.3', 'release'), '0.9.0')
  assert.throws(() => calculateNextVersion('1.0.0', 'release'), /requires a beta or RC/)
})

test('stable release commands apply normal SemVer increments', () => {
  assert.equal(calculateNextVersion('1.0.0', 'patch'), '1.0.1')
  assert.equal(calculateNextVersion('1.0.1', 'minor'), '1.1.0')
  assert.equal(calculateNextVersion('1.1.0', 'major'), '2.0.0')
  for (const command of ['patch', 'minor', 'major'] as const) {
    assert.throws(() => calculateNextVersion('1.0.0-rc.1', command), /requires a stable version/)
  }
})

test('unsupported versions and irrelevant targets fail clearly', () => {
  for (const version of ['1.0', '01.0.0', '1.0.0-alpha.1', '1.0.0-beta.0', '1.0.0+build', ' 1.0.0']) {
    assert.throws(() => calculateNextVersion(version, 'patch'), /Unsupported application version/)
  }
  assert.throws(() => calculateNextVersion('1.0.0', 'patch', '2.0.0'), /does not accept a target/)
})

test('every command synchronizes package and lockfile roots in temporary repositories', () => {
  const cases: Array<[VersionCommand, string, string | undefined, string]> = [
    ['beta', '0.9.0-beta.1', undefined, '0.9.0-beta.2'],
    ['rc', '1.0.0-rc.1', undefined, '1.0.0-rc.2'],
    ['rc', '0.9.0-beta.2', '1.0.0', '1.0.0-rc.1'],
    ['release', '1.0.0-rc.2', undefined, '1.0.0'],
    ['patch', '1.0.0', undefined, '1.0.1'],
    ['minor', '1.0.1', undefined, '1.1.0'],
    ['major', '1.1.0', undefined, '2.0.0'],
  ]

  for (const [command, current, target, expected] of cases) {
    const root = mkdtempSync(path.join(tmpdir(), 'outpost-version-'))
    try {
      writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'fixture', version: current }, null, 2))
      writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({
        name: 'fixture', version: current, lockfileVersion: 3,
        packages: { '': { name: 'fixture', version: current } },
      }, null, 2))
      updateVersionMetadata(root, command, target)
      const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as { version: string }
      const lockJson = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8')) as {
        version: string; packages: Record<string, { version: string }>
      }
      assert.equal(packageJson.version, expected)
      assert.equal(lockJson.version, expected)
      assert.equal(lockJson.packages[''].version, expected)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('metadata validation failure leaves both files unchanged', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'outpost-version-invalid-'))
  try {
    const packagePath = path.join(root, 'package.json')
    const lockPath = path.join(root, 'package-lock.json')
    const packageText = JSON.stringify({ version: '1.0.0' }, null, 2)
    const lockText = JSON.stringify({ version: '0.9.0', packages: { '': { version: '0.9.0' } } }, null, 2)
    writeFileSync(packagePath, packageText)
    writeFileSync(lockPath, lockText)
    assert.throws(() => updateVersionMetadata(root, 'patch'), /versions must agree/)
    assert.equal(readFileSync(packagePath, 'utf8'), packageText)
    assert.equal(readFileSync(lockPath, 'utf8'), lockText)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
