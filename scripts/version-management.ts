/**
 * Purpose: calculate deliberate application-version transitions and synchronize package metadata.
 * Architecture: dependency-free maintainer tooling; package.json remains the version authority.
 * Change this file when: the supported beta, RC, or stable-release workflow changes.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export type VersionCommand = 'beta' | 'rc' | 'release' | 'patch' | 'minor' | 'major'

type StableVersion = {
  major: number
  minor: number
  patch: number
  prerelease: null
}

type PrereleaseVersion = Omit<StableVersion, 'prerelease'> & {
  prerelease: {
    label: 'beta' | 'rc'
    number: number
  }
}

type SupportedVersion = StableVersion | PrereleaseVersion

const supportedVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(beta|rc)\.([1-9]\d*))?$/
const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export function parseSupportedVersion(value: string): SupportedVersion {
  const match = supportedVersionPattern.exec(value)
  if (!match) {
    throw new Error(
      `Unsupported application version "${value}". Expected X.Y.Z, X.Y.Z-beta.N, or X.Y.Z-rc.N without leading zeroes.`,
    )
  }
  const [, major, minor, patch, label, prereleaseNumber] = match
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: label
      ? { label: label as 'beta' | 'rc', number: Number(prereleaseNumber) }
      : null,
  }
}

function formatCore(version: Pick<SupportedVersion, 'major' | 'minor' | 'patch'>): string {
  return `${version.major}.${version.minor}.${version.patch}`
}

function compareCore(left: SupportedVersion, right: SupportedVersion): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch
}

function parseStableTarget(value: string): StableVersion {
  if (!stableVersionPattern.test(value)) {
    throw new Error(`Invalid RC target "${value}". Supply a plain stable version such as 1.0.0.`)
  }
  return parseSupportedVersion(value) as StableVersion
}

export function calculateNextVersion(
  currentValue: string,
  command: VersionCommand,
  target?: string,
): string {
  const current = parseSupportedVersion(currentValue)

  if (command !== 'rc' && target !== undefined) {
    throw new Error(`The ${command} command does not accept a target version.`)
  }

  if (command === 'beta') {
    if (current.prerelease?.label !== 'beta') {
      throw new Error('version:beta requires an existing X.Y.Z-beta.N version.')
    }
    return `${formatCore(current)}-beta.${current.prerelease.number + 1}`
  }

  if (command === 'rc') {
    if (target !== undefined) {
      const next = parseStableTarget(target)
      const comparison = compareCore(next, current)
      if (comparison < 0 || (!current.prerelease && comparison === 0)) {
        throw new Error(`New RC target ${target} cannot move back from the current version ${currentValue}.`)
      }
      if (current.prerelease?.label === 'rc' && comparison === 0) {
        throw new Error('Continue the current RC train without a target instead of resetting it to rc.1.')
      }
      return `${target}-rc.1`
    }
    if (current.prerelease?.label !== 'rc') {
      throw new Error('Starting an RC train requires an explicit stable target, for example: npm run version:rc -- 1.0.0')
    }
    return `${formatCore(current)}-rc.${current.prerelease.number + 1}`
  }

  if (command === 'release') {
    if (!current.prerelease) {
      throw new Error('version:release requires a beta or RC prerelease version.')
    }
    return formatCore(current)
  }

  if (current.prerelease) {
    throw new Error(`version:${command} requires a stable version; promote the prerelease with version:release first.`)
  }

  if (command === 'patch') return `${current.major}.${current.minor}.${current.patch + 1}`
  if (command === 'minor') return `${current.major}.${current.minor + 1}.0`
  return `${current.major + 1}.0.0`
}

type PackageMetadata = { version?: unknown; [key: string]: unknown }
type LockMetadata = {
  version?: unknown
  packages?: Record<string, PackageMetadata>
  [key: string]: unknown
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T
}

export function updateVersionMetadata(
  root: string,
  command: VersionCommand,
  target?: string,
): { previous: string; next: string } {
  const packagePath = path.join(root, 'package.json')
  const lockPath = path.join(root, 'package-lock.json')
  const packageJson = readJson<PackageMetadata>(packagePath)
  const lockJson = readJson<LockMetadata>(lockPath)
  const current = packageJson.version

  if (typeof current !== 'string') {
    throw new Error('package.json must contain a string version.')
  }
  if (lockJson.version !== current || lockJson.packages?.['']?.version !== current) {
    throw new Error('Application package/lockfile versions must agree before changing the version.')
  }

  // Calculate and validate the complete transition before mutating either parsed document.
  const next = calculateNextVersion(current, command, target)
  packageJson.version = next
  lockJson.version = next
  lockJson.packages[''].version = next

  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  writeFileSync(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`)
  return { previous: current, next }
}

function runCli(): void {
  const [commandValue, target, ...extra] = process.argv.slice(2)
  const commands: VersionCommand[] = ['beta', 'rc', 'release', 'patch', 'minor', 'major']
  if (!commands.includes(commandValue as VersionCommand) || extra.length > 0) {
    throw new Error('Usage: version-management.ts <beta|rc|release|patch|minor|major> [stable-rc-target]')
  }
  const result = updateVersionMetadata(process.cwd(), commandValue as VersionCommand, target)
  process.stdout.write(`Application version ${result.previous} -> ${result.next}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli()
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
