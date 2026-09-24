/**
 * Purpose: resolve a small, explicitly allowlisted application build identity.
 * Architecture: build-only Git/package access; the browser receives no environment.
 * Change this file when: identity precedence or source correspondence changes.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { BuildIdentity } from '../src/buildIdentity.ts'

export const repositoryUrl = 'https://github.com/gooberpede/starfield-outpost-network'

export function resolveBuildIdentity(input: {
  version: string
  gitCommit?: string
  gitDirty?: boolean
  pagesCommit?: string
  pagesBuild?: boolean
}): BuildIdentity {
  const validCommit = (value: string | undefined) =>
    value && /^[a-f0-9]{40}$/i.test(value) ? value.toLowerCase() : null
  const git = validCommit(input.gitCommit)
  const pages = input.pagesBuild ? validCommit(input.pagesCommit) : null
  const commit = git ?? pages
  // Checkout evidence wins over configurable CI variables. Without a status
  // check, even a syntactically valid environment SHA cannot certify clean source.
  const status = git && input.gitDirty !== undefined
    ? input.gitDirty ? 'modified' : 'clean'
    : 'unknown'
  return {
    version: input.version,
    commit,
    status,
    sourceUrl: status === 'clean' ? `${repositoryUrl}/tree/${commit}` : null,
  }
}

export function readBuildIdentity(root: string): BuildIdentity {
  const { version } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as { version: string }
  const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8')) as {
    version: string; packages: Record<string, { version: string }>
  }
  if (typeof version !== 'string' || lock.version !== version || lock.packages[''].version !== version) {
    throw new Error('Application package/lockfile versions must agree.')
  }
  const git = (args: string[]) => execFileSync('git', args, {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
  let gitCommit: string | undefined
  let gitDirty: boolean | undefined
  try {
    // A source archive nested in another checkout must not inherit its identity.
    if (path.resolve(git(['rev-parse', '--show-toplevel'])) === path.resolve(root)) {
      gitCommit = git(['rev-parse', '--verify', 'HEAD'])
      gitDirty = git(['status', '--porcelain', '--untracked-files=normal']).length > 0
    }
  } catch { /* Source archives and unavailable Git remain honest unknown builds. */ }
  return resolveBuildIdentity({
    version, gitCommit, gitDirty,
    pagesBuild: process.env.CF_PAGES === '1',
    pagesCommit: process.env.CF_PAGES_COMMIT_SHA,
  })
}
