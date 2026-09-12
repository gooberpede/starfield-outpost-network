#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildC2Targets, generateProvenance, PROVENANCE_HEADERS, serializeCsv, UNRESOLVED_HEADERS } from './localized-name-provenance.mjs'
import { buildC4Targets } from './body-provenance.mjs'
import { localizationInputsFromManifest } from './localization-input-manifest.mjs'
import { buildNameNormalizationPolicy, NAME_NORMALIZATION_HEADERS, NAME_NORMALIZATIONS, validateNameNormalizations } from './name-normalization-policy.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import { findAvailableRecordsInPlugin, findStarRecordsInPlugin } from './starfield-plugin-reader.mjs'
import { buildC3Targets, generateSystemProvenance, OFFICIAL_SYSTEM_PLUGINS } from './star-system-provenance.mjs'
import { readStringTable } from './string-table-reader.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCES = {
  inorganic: 'reference-source/inorganic-resource-dictionary.csv',
  inorganicPolicy: 'reference-source/inorganic-resource-tracker-policy.csv',
  recipes: 'reference-source/industrial-workbench.csv',
  itemMetadata: 'reference-source/item-tracker-metadata.csv',
  biomeInorganic: 'reference-source/biome-inorganic-resources.csv',
  biomeOrganic: 'reference-source/biome-organic-resources.csv',
  planets: 'reference-source/planet-directory.csv',
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
  if (config.localizationInputManifest) {
    const intakeManifestPath = resolveLocal(config.localizationInputManifest)
    const intakeManifest = JSON.parse(await readFile(intakeManifestPath, 'utf8'))
    localizationInputs.push(...await localizationInputsFromManifest(
      intakeManifest,
      intakeManifestPath,
      config.localizationInputLocale ?? 'en',
    ))
  }
  const sources = await loadSources()
  const { targets: c2Targets, statistics: c2Statistics } = buildC2Targets(sources)
  const { targets: systemTargets, statistics: systemStatistics } = buildC3Targets(sources.planets)
  const { targets: bodyTargets, statistics: bodyStatistics } = buildC4Targets(sources.planets)
  const pluginByName = new Map(plugins.map((item) => [item.filename, item]))
  const missingOfficialPlugins = OFFICIAL_SYSTEM_PLUGINS.filter((plugin) => !pluginByName.has(plugin))
  if (missingOfficialPlugins.length) throw new Error(`Missing required official plugin input(s): ${missingOfficialPlugins.join(', ')}.`)
  const recordsByPlugin = new Map()
  const recordTargets = [
    ...c2Targets,
    ...systemTargets.flatMap((item) => item.bodies.map((body) => ({ ...body, entityKind: 'body-evidence' }))),
    ...bodyTargets,
  ]
  for (const pluginName of new Set(recordTargets.map((item) => item.recordSourcePlugin))) {
    const plugin = pluginByName.get(pluginName)
    if (!plugin) continue
    const pluginTargets = recordTargets.filter((item) => item.recordSourcePlugin === pluginName)
    const records = findAvailableRecordsInPlugin(plugin.path, pluginTargets.map((item) => ({ signature: item.recordSignature, formId: Number.parseInt(item.recordFormId, 16) })))
    recordsByPlugin.set(pluginName, new Map(records.map((record) => [`${record.signature}:${record.formIdHex}`, record])))
  }
  const starRecordsByPlugin = new Map()
  for (const pluginName of OFFICIAL_SYSTEM_PLUGINS) {
    starRecordsByPlugin.set(pluginName, findStarRecordsInPlugin(pluginByName.get(pluginName).path))
  }
  const tables = new Map()
  for (const input of localizationInputs) {
    const key = `${input.plugin}:${input.tableType}`
    if (tables.has(key)) throw new Error(`LOCALIZATION_TABLE_AMBIGUOUS: Multiple inputs were supplied for ${key}.`)
    tables.set(key, readStringTable(input.path, input.tableType))
  }
  const normalizationPolicy = buildNameNormalizationPolicy()
  const c2Result = generateProvenance(c2Targets, recordsByPlugin, tables, normalizationPolicy)
  const systemResult = generateSystemProvenance(systemTargets, recordsByPlugin, starRecordsByPlugin, tables, normalizationPolicy)
  const bodyResult = generateProvenance(bodyTargets, recordsByPlugin, tables, normalizationPolicy)
  const result = {
    provenance: [...c2Result.provenance, ...systemResult.provenance, ...bodyResult.provenance].sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || Number(a.ComponentOrder) - Number(b.ComponentOrder)),
    unresolved: [...c2Result.unresolved, ...systemResult.unresolved, ...bodyResult.unresolved].sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || a.ReasonCode.localeCompare(b.ReasonCode)),
    normalizations: [...c2Result.normalizations, ...systemResult.normalizations, ...bodyResult.normalizations],
  }
  validateNameNormalizations(NAME_NORMALIZATIONS, [...c2Targets, ...systemTargets, ...bodyTargets], result.provenance, result.unresolved, result.normalizations)
  const fatal = c2Result.unresolved.filter((row) => ['CANONICAL_SOURCE_ERROR', 'MISSING_STRING_ID', 'WRONG_FIELD', 'WRONG_PLUGIN', 'WRONG_TABLE'].includes(row.ReasonCode))
  if (fatal.length) throw new Error(`English provenance verification failed: ${fatal.map((row) => `${row.EntityKind}:${row.EntityId} ${row.ReasonCode}`).join(', ')}.`)

  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance.csv'), serializeCsv(PROVENANCE_HEADERS, result.provenance), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance-unresolved.csv'), serializeCsv(UNRESOLVED_HEADERS, result.unresolved), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-normalizations.csv'), serializeCsv(NAME_NORMALIZATION_HEADERS, result.normalizations), 'utf8')
  const manifest = await createProvenanceManifest({
    pluginPaths: plugins.map((item) => item.path), localizationInputs,
    gameVersion: config.gameVersion ?? 'unknown',
  })
  const manifestPath = path.resolve(options.manifestPath ?? path.join(ROOT, '.local-work/localization/provenance/c2-manifest.json'))
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  const owningPluginCounts = Object.fromEntries(OFFICIAL_SYSTEM_PLUGINS.map((plugin) => [plugin, systemResult.provenance.filter((row) => row.RecordSourcePlugin === plugin).length]))
  const bodyResolvedPluginCounts = Object.fromEntries(OFFICIAL_SYSTEM_PLUGINS.map((plugin) => [plugin, bodyResult.provenance.filter((row) => row.RecordSourcePlugin === plugin).length]))
  const bodyUnresolvedPluginCounts = Object.fromEntries(OFFICIAL_SYSTEM_PLUGINS.map((plugin) => [plugin, bodyResult.unresolved.filter((row) => row.RecordSourcePlugin === plugin).length]))
  const orbitalIds = new Set(bodyTargets.filter((target) => target.bodyType === 'Orbital').map((target) => target.entityId))
  return {
    ...result,
    statistics: {
      ...c2Statistics, ...systemStatistics, ...bodyStatistics, owningPluginCounts,
      bodyResolvedPluginCounts, bodyUnresolvedPluginCounts,
      orbitalResolved: bodyResult.provenance.filter((row) => orbitalIds.has(row.EntityId)).length,
      orbitalUnresolved: bodyResult.unresolved.filter((row) => orbitalIds.has(row.EntityId)).length,
    },
    manifest, manifestPath,
  }
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
  const resolvedBodies = report.provenance.filter((row) => row.EntityKind === 'body').length
  const unresolvedBodies = report.unresolved.filter((row) => row.EntityKind === 'body').length
  process.stdout.write(
    `Body targets ${report.statistics.canonicalBodies}; types ${JSON.stringify(report.statistics.bodyTypeCounts)}\n` +
    `Bodies resolved ${resolvedBodies}; unresolved ${unresolvedBodies}; source targets ${JSON.stringify(report.statistics.sourcePluginCounts)}\n` +
    `Body resolved by plugin ${JSON.stringify(report.statistics.bodyResolvedPluginCounts)}; unresolved by plugin ${JSON.stringify(report.statistics.bodyUnresolvedPluginCounts)}\n` +
    `Orbitals resolved ${report.statistics.orbitalResolved}; unresolved ${report.statistics.orbitalUnresolved}\n`,
  )
  const resolvedSystems = report.provenance.filter((row) => row.EntityKind === 'system').length
  const unresolvedSystems = report.unresolved.filter((row) => row.EntityKind === 'system').length
  process.stdout.write(
    `System targets ${report.statistics.canonicalSystems}; body rows ${report.statistics.bodyRows}; ` +
    `unique bodies ${report.statistics.uniqueBodies}; multi-body systems ${report.statistics.multiBodySystems}\n` +
    `Systems resolved ${resolvedSystems}; unresolved ${unresolvedSystems}; STDT owners ${JSON.stringify(report.statistics.owningPluginCounts)}\n`,
  )
  process.stdout.write(`Normalized source/display differences ${report.normalizations.length}: ${JSON.stringify(report.normalizations)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
}
