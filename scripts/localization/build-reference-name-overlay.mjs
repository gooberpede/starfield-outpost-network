#!/usr/bin/env node
/** Generate or verify one committed official reference-name overlay. */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

import { localizationInputsFromManifest } from './localization-input-manifest.mjs'
import { stableManifestIdentity, validateProvenanceRowShapes } from './provenance-build-integration.mjs'
import { readStringTable } from './string-table-reader.mjs'
import { bethesdaTokenForLocale, encodingForKnownLocale, localeMetadataFor, referenceNameArtifactNames } from './locale-metadata.mjs'
import {
  REFERENCE_NAME_TOOL_VERSION, assertExpectedReferenceNameCounts,
  classifyReferenceNameSidecarDrift, compareReferenceNameOverlays, materializeReferenceNames, parseGeneratedReferenceNameModule,
  serializeReferenceNameModule, sha256Text,
} from './reference-name-materializer.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const PROVENANCE_PATH = path.join(ROOT, 'reference-source/localized-name-provenance.csv')
const PROVENANCE_MANIFEST_PATH = path.join(ROOT, 'reference-source/localized-name-provenance-manifest.json')
function argumentsFrom(args) {
  const options = { configPath: path.join(ROOT, '.local-work/localization/provenance/localization-provenance-inputs.json'), write: false, locale: 'ja-JP' }
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--write') options.write = true
    else if (args[index] === '--config') options.configPath = path.resolve(args[++index])
    else if (args[index] === '--locale') options.locale = args[++index]
    else throw new Error(`Unknown argument: ${args[index]}`)
  }
  return options
}

function localeTableIdentities(manifest, token) {
  return manifest.localizationInputs.filter((item) => item.locale === token).map((item) => ({
    plugin: item.plugin, tableType: item.tableType, memberName: item.memberName, size: item.size, sha256: item.sha256,
  }))
}

function compareLocaleInputIdentity(intake, committed, token) {
  const fresh = []
  for (const plugin of committed.authoritativePlugins.map((item) => item.filename)) {
    const tables = intake.plugins?.[plugin]?.tables?.[token] ?? {}
    for (const [tableType, item] of Object.entries(tables)) fresh.push({ plugin, tableType, memberName: item.memberName, size: item.size, sha256: item.sha256 })
  }
  const order = (left, right) => left.plugin.localeCompare(right.plugin) || left.tableType.localeCompare(right.tableType)
  fresh.sort(order)
  const expected = localeTableIdentities(committed, token).sort(order)
  if (JSON.stringify(fresh) !== JSON.stringify(expected)) {
    throw new Error(`LOCALE_INPUT_MANIFEST_DRIFT: ${token} table identity differs from committed provenance manifest.`)
  }
  return expected
}

export async function buildReferenceNameOverlay(options) {
  const locale = localeMetadataFor(options.locale)
  if (locale.catalogueRole === 'sparse') throw new Error(`REFERENCE_NAME_LOCALE_UNAVAILABLE: ${locale.trackerLocale} is a sparse locale.`)
  const token = bethesdaTokenForLocale(locale.trackerLocale)
  const artifactNames = referenceNameArtifactNames(locale.trackerLocale)
  const modulePath = path.join(ROOT, artifactNames.module)
  const sidecarPath = path.join(ROOT, artifactNames.sidecar)
  const provenanceBytes = await readFile(PROVENANCE_PATH)
  const provenance = parse(provenanceBytes, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  validateProvenanceRowShapes(provenance)
  const provenanceManifestBytes = await readFile(PROVENANCE_MANIFEST_PATH)
  const provenanceManifest = JSON.parse(provenanceManifestBytes)
  const config = JSON.parse(await readFile(options.configPath, 'utf8'))
  if (!config.localizationInputManifest) throw new Error('LOCALIZATION_INPUT_MANIFEST_MISSING: Configure localizationInputManifest.')
  const intakePath = path.resolve(path.dirname(options.configPath), config.localizationInputManifest)
  const intake = JSON.parse(await readFile(intakePath, 'utf8'))
  const tableIdentities = compareLocaleInputIdentity(intake, provenanceManifest, token)
  const plugins = provenanceManifest.authoritativePlugins.map((item) => item.filename)
  const inputs = await localizationInputsFromManifest(intake, intakePath, token, plugins)
  const tables = new Map(inputs.map((input) => [`${input.plugin}:${token}:${input.tableType}`, readStringTable(input.path, input.tableType, { locale: token })]))
  const overlay = materializeReferenceNames(provenance, tables, { locale: token })
  const counts = assertExpectedReferenceNameCounts(overlay)
  const moduleSource = serializeReferenceNameModule(overlay, locale.trackerLocale)
  const sidecar = {
    schemaVersion: 2,
    trackerLocale: locale.trackerLocale,
    bethesdaToken: token,
    encoding: encodingForKnownLocale(token),
    gameVersion: provenanceManifest.gameVersion,
    provenanceSha256: sha256Text(provenanceBytes),
    provenanceManifestSha256: sha256Text(provenanceManifestBytes),
    provenanceManifestIdentity: stableManifestIdentity(provenanceManifest),
    authoritativePlugins: provenanceManifest.authoritativePlugins.map((item) => item.filename),
    localizationInputs: tableIdentities,
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
    await mkdir(path.dirname(modulePath), { recursive: true })
    await writeFile(modulePath, moduleSource, 'utf8')
    await writeFile(sidecarPath, sidecarSource, 'utf8')
  } else {
    let committedModule
    try { committedModule = await readFile(modulePath, 'utf8') } catch { throw new Error(`REFERENCE_NAME_ARTIFACT_MISSING: ${locale.trackerLocale} generated module is not committed.`) }
    const drift = compareReferenceNameOverlays(overlay, parseGeneratedReferenceNameModule(committedModule, locale.trackerLocale))
    if (drift.length) throw new Error(`REFERENCE_NAME_DRIFT: ${JSON.stringify(drift.slice(0, 20))}`)
    const committedSidecar = JSON.parse(await readFile(sidecarPath, 'utf8'))
    const categories = classifyReferenceNameSidecarDrift(sidecar, committedSidecar)
    if (committedModule !== moduleSource || categories.length) throw new Error(`REFERENCE_NAME_DRIFT: ${categories.join(', ') || 'generated byte drift'}.`)
  }
  return { counts, entityCount: sidecar.entityCount, provenanceRows: provenance.length, resolvedQualifiedIds: provenance.length }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'))) {
  const options = argumentsFrom(process.argv.slice(2))
  buildReferenceNameOverlay(options).then((result) => {
    process.stdout.write(`${options.write ? 'Wrote' : 'Verified'} ${options.locale} reference-name overlay: ${result.entityCount} entities in ${result.provenanceRows} qualified rows; ${JSON.stringify(result.counts)}.\n`)
  }).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1 })
}
