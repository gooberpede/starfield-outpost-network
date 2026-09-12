#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { extractLocalizedId, SEMANTIC_PATHS } from './localized-field-map.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import { findRecordsInPlugin, formatHex32, PluginReaderError } from './starfield-plugin-reader.mjs'

export const AUDITED_GAME_VERSION = '1.16.244.0'
export const AUDITED_STARFIELD_ESM_SHA256 = '1DABED00C3F4282DD3BB54D2E9601E40B577D8742D078B7CCEF203ADBFEF0DA7'

export const PROOF_TARGETS = Object.freeze([
  { label: 'Aluminum', signature: 'IRES', formId: 0x000057D6, semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, expectedIdHex: '00008155' },
  { label: 'Rocky Desert', signature: 'BIOM', formId: 0x002ACD5A, semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, expectedIdHex: '000062F4' },
  { label: 'Alpha Centauri', signature: 'STDT', formId: 0x0005E60A, semanticPath: SEMANTIC_PATHS.TES_FULL_NAME, expectedIdHex: '0000A9D0' },
  { label: 'Akila', signature: 'PNDT', formId: 0x0005E2B6, semanticPath: SEMANTIC_PATHS.TES_FULL_NAME, expectedIdHex: '0000A3B2', mustBeCompressed: true },
])

function parseArguments(args) {
  const result = { acknowledgeHashMismatch: false, verbose: false }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--acknowledge-hash-mismatch') result.acknowledgeHashMismatch = true
    else if (argument === '--verbose') result.verbose = true
    else if (argument === '--plugin') result.pluginPath = args[++index]
    else if (argument === '--manifest') result.manifestPath = args[++index]
    else throw new Error(`Unknown argument: ${argument}`)
  }
  if (!result.pluginPath) throw new Error('Missing required --plugin <path-to-Starfield.esm>.')
  return result
}

export async function verifyProofTargets(options) {
  const manifest = await createProvenanceManifest({
    pluginPaths: [options.pluginPath],
    gameVersion: AUDITED_GAME_VERSION,
  })
  const plugin = manifest.plugins[0]
  const records = findRecordsInPlugin(options.pluginPath, PROOF_TARGETS)
  const results = PROOF_TARGETS.map((target, index) => {
    const record = records[index]
    const localized = extractLocalizedId(record, target.semanticPath)
    if (target.mustBeCompressed && !record.compressed) {
      throw new PluginReaderError('PROOF_EXPECTATION_MISMATCH', `${target.label} no longer exercises compressed-record handling.`, target)
    }
    return { ...target, ...localized, compressed: record.compressed, pass: localized.idHex === target.expectedIdHex }
  })
  return { manifest, hashMatchesAudit: plugin.sha256 === AUDITED_STARFIELD_ESM_SHA256, results }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const report = await verifyProofTargets(options)
  const manifestPath = path.resolve(options.manifestPath ?? '.local-work/localization/provenance/provenance-manifest.json')
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(report.manifest, null, 2)}\n`, 'utf8')

  const plugin = report.manifest.plugins[0]
  process.stdout.write(`Plugin ${plugin.filename}\nSize ${plugin.size}\nSHA-256 ${plugin.sha256}\n`)
  if (!report.hashMatchesAudit) {
    process.stderr.write(`WARNING: Hash differs from audited Starfield ${AUDITED_GAME_VERSION}; proof expectations may require re-audit.\n`)
  }
  for (const result of report.results) {
    const status = result.pass ? 'PASS' : 'FAIL'
    process.stdout.write(`${status} ${result.label}\n  ${result.signature}:${formatHex32(result.formId)}\n  ${result.semanticPath}\n  ${result.stringTable}:${result.idHex}\n`)
    if (options.verbose) process.stdout.write(`  compressed: ${result.compressed}\n`)
  }
  process.stdout.write(`Manifest ${manifestPath}\n`)

  if (!report.hashMatchesAudit && !options.acknowledgeHashMismatch) {
    throw new PluginReaderError(
      'PROOF_HASH_ACKNOWLEDGEMENT_REQUIRED',
      'Re-run with --acknowledge-hash-mismatch after reviewing version drift; extracted values were reported but are not classified as implementation defects.',
    )
  }
  const mismatches = report.results.filter((result) => !result.pass)
  if (mismatches.length > 0) {
    throw new PluginReaderError('PROOF_EXPECTATION_MISMATCH', `Proof mismatch: ${mismatches.map((item) => item.label).join(', ')}.`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
