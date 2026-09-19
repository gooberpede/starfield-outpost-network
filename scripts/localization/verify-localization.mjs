#!/usr/bin/env node
/** Thin locale closure command that delegates to authoritative repository verifiers. */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { localeMetadataFor } from './locale-metadata.mjs'

const root = path.resolve(import.meta.dirname, '../..')

export function localizationVerificationCommands(localeValue) {
  const locale = localeMetadataFor(localeValue).trackerLocale
  return [
    ['validate-localized-name-provenance.mjs'],
    ['verify-official-terminology.mjs', '--locale', locale],
    ['verify-reference-name-overlay.mjs', '--locale', locale],
  ]
}

function argumentsFrom(args) {
  const localeIndex = args.indexOf('--locale')
  if (args.some((arg, index) => arg.startsWith('--') && (arg !== '--locale' || index !== localeIndex))) {
    throw new Error('Usage: verify-localization.mjs [--locale <tracker-locale>]')
  }
  const locale = localeIndex >= 0 ? args[localeIndex + 1] : 'ja-JP'
  if (!locale) throw new Error('Missing value for --locale.')
  return { locale }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const { locale } = argumentsFrom(process.argv.slice(2))
  for (const command of localizationVerificationCommands(locale)) {
    const result = spawnSync(process.execPath, [path.join(import.meta.dirname, command[0]), ...command.slice(1)], {
      cwd: root, stdio: 'inherit',
    })
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}
