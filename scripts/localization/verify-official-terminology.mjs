#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  parseOfficialTerminologyCsv,
  parseOfficialTerminologyValuesCsv,
  validateOfficialTerminology,
  validateOfficialTerminologyValues,
} from './official-terminology.mjs'
import { localeMetadataFor } from './locale-metadata.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')

export async function verifyOfficialTerminology(localeValue = 'ja-JP', root = ROOT) {
  const locale = localeMetadataFor(localeValue).trackerLocale
  const directory = path.join(root, 'reference-source')
  const valuePath = path.join(directory, `official-terminology-values-${locale}.csv`)
  const [policySource, provenanceSource, valuesSource] = await Promise.all([
    readFile(path.join(directory, 'official-terminology-policy.json'), 'utf8'),
    readFile(path.join(directory, 'official-terminology-provenance.csv'), 'utf8'),
    readFile(valuePath, 'utf8').catch((error) => {
      if (error?.code === 'ENOENT') {
        throw new Error(`TERMINOLOGY_VALUES_MISSING: No terminology value artifact exists for ${locale}: ${valuePath}.`)
      }
      throw error
    }),
  ])
  const evidenceRows = parseOfficialTerminologyCsv(provenanceSource)
  const evidence = validateOfficialTerminology(JSON.parse(policySource), evidenceRows)
  const values = validateOfficialTerminologyValues(
    evidenceRows,
    parseOfficialTerminologyValuesCsv(valuesSource),
    locale,
  )
  return { ...evidence, locale, values: values.values }
}

function argumentsFrom(args) {
  const localeIndex = args.indexOf('--locale')
  if (args.some((arg, index) => arg.startsWith('--') && (arg !== '--locale' || index !== localeIndex))) {
    throw new Error('Usage: verify-official-terminology.mjs [--locale <tracker-locale>]')
  }
  const locale = localeIndex >= 0 ? args[localeIndex + 1] : 'ja-JP'
  if (!locale) throw new Error('Missing value for --locale.')
  return { locale }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const { locale } = argumentsFrom(process.argv.slice(2))
  verifyOfficialTerminology(locale).then((result) => {
    process.stdout.write(`Validated ${result.rows} official terminology evidence rows across ${result.terms} terms and ${result.values} ${result.locale} values.\n`)
  }).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1 })
}
