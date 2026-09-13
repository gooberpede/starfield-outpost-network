#!/usr/bin/env node
/** Generate or verify the committed Japanese official reference-name overlay. */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

import { localizationInputsFromManifest } from './localization-input-manifest.mjs'
import { stableManifestIdentity, validateProvenanceRowShapes } from './provenance-build-integration.mjs'
import { readStringTable } from './string-table-reader.mjs'
import {
  REFERENCE_NAME_TOOL_VERSION, assertExpectedReferenceNameCounts,
  classifyReferenceNameSidecarDrift, compareReferenceNameOverlays, materializeReferenceNames, parseGeneratedReferenceNameModule,
  serializeReferenceNameModule, sha256Text,
} from './reference-name-materializer.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const PROVENANCE_PATH = path.join(ROOT, 'reference-source/localized-name-provenance.csv')
const PROVENANCE_MANIFEST_PATH = path.join(ROOT, 'reference-source/localized-name-provenance-manifest.json')
const MODULE_PATH = path.join(ROOT, 'src/localization/generated/ja-JP-reference-names.ts')
const SIDECAR_PATH = path.join(ROOT, 'reference-source/localized-reference-names-manifest.json')

function argumentsFrom(args) {
  const options = { configPath: path.join(ROOT, '.local-work/localization/provenance/localization-provenance-inputs.json'), write: false }
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--write') options.write = true
    else if (args[index] === '--config') options.configPath = path.resolve(args[++index])
    else throw new Error(`Unknown argument: ${args[index]}`)
  }
  return options
}

function japaneseTableIdentities(manifest) {
  return manifest.localizationInputs.filter((item) => item.locale === 'ja').map((item) => ({
    plugin: item.plugin, tableType: item.tableType, memberName: item.memberName, size: item.size, sha256: item.sha256,
  }))
}

function compareJapaneseInputIdentity(intake, committed) {
  const fresh = []
  for (const plugin of committed.authoritativePlugins.map((item) => item.filename)) {
    const tables = intake.plugins?.[plugin]?.tables?.ja ?? {}
    for (const [tableType, item] of Object.entries(tables)) fresh.push({ plugin, tableType, memberName: item.memberName, size: item.size, sha256: item.sha256 })
  }
  const order = (left, right) => left.plugin.localeCompare(right.plugin) || left.tableType.localeCompare(right.tableType)
  fresh.sort(order)
  const expected = japaneseTableIdentities(committed).sort(order)
  if (JSON.stringify(fresh) !== JSON.stringify(expected)) {
    throw new Error(`JAPANESE_INPUT_MANIFEST_DRIFT: installed table identity differs from committed provenance manifest.`)
  }
  return expected
}

export async function buildReferenceNameOverlay(options) {
  const provenanceBytes = await readFile(PROVENANCE_PATH)
  const provenance = parse(provenanceBytes, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  validateProvenanceRowShapes(provenance)
  const provenanceManifestBytes = await readFile(PROVENANCE_MANIFEST_PATH)
  const provenanceManifest = JSON.parse(provenanceManifestBytes)
  const config = JSON.parse(await readFile(options.configPath, 'utf8'))
  if (!config.localizationInputManifest) throw new Error('LOCALIZATION_INPUT_MANIFEST_MISSING: Configure localizationInputManifest.')
  const intakePath = path.resolve(path.dirname(options.configPath), config.localizationInputManifest)
  const intake = JSON.parse(await readFile(intakePath, 'utf8'))
  const tableIdentities = compareJapaneseInputIdentity(intake, provenanceManifest)
  const plugins = provenanceManifest.authoritativePlugins.map((item) => item.filename)
  const inputs = await localizationInputsFromManifest(intake, intakePath, 'ja', plugins)
  const tables = new Map(inputs.map((input) => [`${input.plugin}:ja:${input.tableType}`, readStringTable(input.path, input.tableType, { locale: 'ja' })]))
  const overlay = materializeReferenceNames(provenance, tables, { locale: 'ja' })
  const counts = assertExpectedReferenceNameCounts(overlay)
  const moduleSource = serializeReferenceNameModule(overlay)
  const sidecar = {
    schemaVersion: 1,
    locale: 'ja-JP',
    gameVersion: provenanceManifest.gameVersion,
    provenanceSha256: sha256Text(provenanceBytes),
    provenanceManifestSha256: sha256Text(provenanceManifestBytes),
    provenanceManifestIdentity: stableManifestIdentity(provenanceManifest),
    authoritativePlugins: provenanceManifest.authoritativePlugins.map((item) => item.filename),
    japaneseLocalizationInputs: tableIdentities,
    entityCount: Object.values(counts).reduce((sum, count) => sum + count, 0),
    perKindCounts: counts,
    provenanceRowCount: provenance.length,
    compositionPolicy: { slots: { 0: 'prefix', 1: 'species', 2: 'diet' }, requiredSlot: 1, assembly: 'precomposed-at-build-time' },
    separatorPolicy: { value: 'U+0020', literal: ' ', betweenNonEmptyComponents: true },
    generatedModuleSha256: sha256Text(moduleSource),
    generator: { toolVersion: REFERENCE_NAME_TOOL_VERSION },
  }
  const sidecarSource = `${JSON.stringify(sidecar, null, 2)}\n`
  if (options.write) {
    await mkdir(path.dirname(MODULE_PATH), { recursive: true })
    await writeFile(MODULE_PATH, moduleSource, 'utf8')
    await writeFile(SIDECAR_PATH, sidecarSource, 'utf8')
  } else {
    let committedModule
    try { committedModule = await readFile(MODULE_PATH, 'utf8') } catch { throw new Error('REFERENCE_NAME_DRIFT: added key/generated module missing; run with --write after review.') }
    const drift = compareReferenceNameOverlays(overlay, parseGeneratedReferenceNameModule(committedModule))
    if (drift.length) throw new Error(`REFERENCE_NAME_DRIFT: ${JSON.stringify(drift.slice(0, 20))}`)
    const committedSidecar = JSON.parse(await readFile(SIDECAR_PATH, 'utf8'))
    const categories = classifyReferenceNameSidecarDrift(sidecar, committedSidecar)
    if (committedModule !== moduleSource || categories.length) throw new Error(`REFERENCE_NAME_DRIFT: ${categories.join(', ') || 'generated byte drift'}.`)
  }
  return { counts, entityCount: sidecar.entityCount, provenanceRows: provenance.length, resolvedQualifiedIds: provenance.length }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'))) {
  const options = argumentsFrom(process.argv.slice(2))
  buildReferenceNameOverlay(options).then((result) => {
    process.stdout.write(`${options.write ? 'Wrote' : 'Verified'} Japanese reference-name overlay: ${result.entityCount} entities in ${result.provenanceRows} qualified rows; ${JSON.stringify(result.counts)}.\n`)
  }).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1 })
}
