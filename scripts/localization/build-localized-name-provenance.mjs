#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildC2Targets, generateProvenance, PROVENANCE_HEADERS, serializeCsv, UNRESOLVED_HEADERS } from './localized-name-provenance.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import { findRecordsInPlugin } from './starfield-plugin-reader.mjs'
import { readStringTable } from './string-table-reader.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCES = {
  inorganic: 'reference-source/inorganic-resource-dictionary.csv',
  inorganicPolicy: 'reference-source/inorganic-resource-tracker-policy.csv',
  recipes: 'reference-source/industrial-workbench.csv',
  itemMetadata: 'reference-source/item-tracker-metadata.csv',
  biomeInorganic: 'reference-source/biome-inorganic-resources.csv',
  biomeOrganic: 'reference-source/biome-organic-resources.csv',
}

function parseArguments(args) {
  const result = {}
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--config') result.configPath = args[++index]
    else if (args[index] === '--manifest') result.manifestPath = args[++index]
    else throw new Error(`Unknown argument: ${args[index]}`)
  }
  if (!result.configPath) throw new Error('Missing required --config <local-inputs.json>.')
  return result
}

async function loadSources() {
  return Object.fromEntries(await Promise.all(Object.entries(SOURCES).map(async ([key, relative]) => [key, await readFile(path.join(ROOT, relative), 'utf8')])))
}

export async function buildLocalizedNameProvenance(options) {
  const configPath = path.resolve(options.configPath)
  const configDirectory = path.dirname(configPath)
  const config = JSON.parse(await readFile(configPath, 'utf8'))
  const resolveLocal = (value) => path.resolve(configDirectory, value)
  const plugins = (config.plugins ?? []).map((item) => ({ ...item, path: resolveLocal(item.path) }))
  const localizationInputs = (config.localizationInputs ?? []).map((item) => ({ ...item, path: resolveLocal(item.path) }))
  const { targets, statistics } = buildC2Targets(await loadSources())
  const pluginByName = new Map(plugins.map((item) => [item.filename, item]))
  const recordsByPlugin = new Map()
  for (const pluginName of new Set(targets.map((item) => item.recordSourcePlugin))) {
    const plugin = pluginByName.get(pluginName)
    if (!plugin) continue
    const pluginTargets = targets.filter((item) => item.recordSourcePlugin === pluginName)
    const records = findRecordsInPlugin(plugin.path, pluginTargets.map((item) => ({ signature: item.recordSignature, formId: Number.parseInt(item.recordFormId, 16) })))
    recordsByPlugin.set(pluginName, new Map(records.map((record) => [`${record.signature}:${record.formIdHex}`, record])))
  }
  const tables = new Map(localizationInputs.map((input) => [`${input.plugin}:${input.tableType}`, readStringTable(input.path, input.tableType)]))
  const result = generateProvenance(targets, recordsByPlugin, tables)
  const fatal = result.unresolved.filter((row) => ['CANONICAL_SOURCE_ERROR', 'MISSING_STRING_ID', 'WRONG_FIELD', 'WRONG_PLUGIN', 'WRONG_TABLE'].includes(row.ReasonCode))
  if (fatal.length) throw new Error(`English provenance verification failed: ${fatal.map((row) => `${row.EntityKind}:${row.EntityId} ${row.ReasonCode}`).join(', ')}.`)

  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance.csv'), serializeCsv(PROVENANCE_HEADERS, result.provenance), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance-unresolved.csv'), serializeCsv(UNRESOLVED_HEADERS, result.unresolved), 'utf8')
  const manifest = await createProvenanceManifest({
    pluginPaths: plugins.map((item) => item.path), localizationInputs,
    gameVersion: config.gameVersion ?? 'unknown',
  })
  const manifestPath = path.resolve(options.manifestPath ?? path.join(ROOT, '.local-work/localization/provenance/c2-manifest.json'))
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return { ...result, statistics, manifest, manifestPath }
}

async function main() {
  const report = await buildLocalizedNameProvenance(parseArguments(process.argv.slice(2)))
  const counts = new Map()
  for (const row of report.provenance) counts.set(row.EntityKind, (counts.get(row.EntityKind) ?? 0) + 1)
  const unresolved = new Map()
  for (const row of report.unresolved) unresolved.set(row.ReasonCode, (unresolved.get(row.ReasonCode) ?? 0) + 1)
  process.stdout.write(`Resolved ${report.provenance.length}: ${JSON.stringify(Object.fromEntries(counts))}\n`)
  process.stdout.write(`Unresolved ${report.unresolved.length}: ${JSON.stringify(Object.fromEntries(unresolved))}\n`)
  process.stdout.write(`Recipe entities ${report.statistics.uniqueRecipeEntities}; duplicate occurrences collapsed ${report.statistics.duplicateRecipeOccurrencesCollapsed}\n`)
  const resolvedBiomes = report.provenance.filter((row) => row.EntityKind === 'biome').length
  process.stdout.write(
    `Biome targets ${report.statistics.uniqueBiomes}; resolved rows ${resolvedBiomes}; ` +
    `repeated-name groups ${report.statistics.repeatedBiomeNameGroups}\nManifest ${report.manifestPath}\n`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
}
