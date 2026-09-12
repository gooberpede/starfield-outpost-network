#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildC2Targets, generateProvenance, PROVENANCE_HEADERS, serializeCsv, UNRESOLVED_HEADERS } from './localized-name-provenance.mjs'
import { buildC4Targets } from './body-provenance.mjs'
import {
  C6_PREVIEW_HEADERS, generateComposedFaunaProvenance, parseC6Targets,
} from './composed-fauna-provenance.mjs'
import { localizationInputsFromManifest } from './localization-input-manifest.mjs'
import { buildNameNormalizationPolicy, NAME_NORMALIZATION_HEADERS, NAME_NORMALIZATIONS, validateNameNormalizations } from './name-normalization-policy.mjs'
import {
  buildC5Targets, buildNamingRules, C6_HANDOFF_HEADERS, generateOrganicProvenance, ORGANIC_CLASSIFICATIONS, TEMPLATE_LINEAGE_HEADERS,
} from './organic-provenance.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import {
  AUTHORITATIVE_LOCALIZATION_PLUGINS, buildSupportedProviderChains, logicalIdentityForRecord, readTes4MasterList,
} from './official-master-provider-chains.mjs'
import { findAvailableRecordsInPlugin, findRecordsBySignaturesInPlugin, findStarRecordsInPlugin } from './starfield-plugin-reader.mjs'
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
  c6Fauna: 'reference-source/localized-name-provenance-c6-fauna.csv',
}
const PROVIDER_SIGNATURES = Object.freeze(['IRES', 'BIOM', 'PERK', 'STDT', 'PNDT', 'FLOR', 'NPC_', 'LVLN', 'OMOD', 'INNR'])
const EXPECTED_FULL_MODULE_MASTERS = Object.freeze({
  'Starfield.esm': Object.freeze([]),
  'ShatteredSpace.esm': Object.freeze(['Starfield.esm']),
  'SFBGS00D.esm': Object.freeze(['Starfield.esm']),
})
const INSTALLED_C7_EXPECTED = Object.freeze({
  resolvedEntities: 3539, provenanceRows: 4796, unresolvedRows: 0, distinctRecords: 2619,
  singleProviderRows: 4795, overrideRows: 1, winnerOwnsRows: 4796, inheritedRows: 0,
  nameProviders: Object.freeze({ 'Starfield.esm': 4759, 'ShatteredSpace.esm': 35, 'SFBGS00D.esm': 2 }),
})

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
  const localizationInputs = (config.localizationInputs ?? []).map((item) => ({ locale: 'en', ...item, path: resolveLocal(item.path) }))
  if (config.localizationInputManifest) {
    const intakeManifestPath = resolveLocal(config.localizationInputManifest)
    const intakeManifest = JSON.parse(await readFile(intakeManifestPath, 'utf8'))
    for (const locale of ['en', 'ja']) localizationInputs.push(...await localizationInputsFromManifest(intakeManifest, intakeManifestPath, locale))
  }
  const sources = await loadSources()
  const { targets: c2Targets, statistics: c2Statistics } = buildC2Targets(sources)
  const { targets: systemTargets, statistics: systemStatistics } = buildC3Targets(sources.planets)
  const { targets: bodyTargets, statistics: bodyStatistics } = buildC4Targets(sources.planets)
  const { targets: organicTargets, statistics: organicStatistics } = buildC5Targets(sources.biomeOrganic)
  const c6Targets = parseC6Targets(sources.c6Fauna)
  const pluginByName = new Map(plugins.map((item) => [item.filename, item]))
  const missingOfficialPlugins = OFFICIAL_SYSTEM_PLUGINS.filter((plugin) => !pluginByName.has(plugin))
  if (missingOfficialPlugins.length) throw new Error(`Missing required official plugin input(s): ${missingOfficialPlugins.join(', ')}.`)
  const mastersByPlugin = new Map()
  const authoritativeRecordsByPlugin = new Map()
  for (const pluginName of AUTHORITATIVE_LOCALIZATION_PLUGINS) {
    const plugin = pluginByName.get(pluginName)
    if (!plugin) throw new Error(`Missing required authoritative localization plugin input: ${pluginName}.`)
    const masters = readTes4MasterList(plugin.path)
    if (JSON.stringify(masters) !== JSON.stringify(EXPECTED_FULL_MODULE_MASTERS[pluginName])) {
      throw new Error(`C7 ${pluginName} full-module master list drifted: ${JSON.stringify(masters)}.`)
    }
    mastersByPlugin.set(pluginName, masters)
    authoritativeRecordsByPlugin.set(pluginName, findRecordsBySignaturesInPlugin(plugin.path, PROVIDER_SIGNATURES))
  }
  const providerChains = buildSupportedProviderChains(AUTHORITATIVE_LOCALIZATION_PLUGINS.map((plugin) => ({
    plugin, masters: mastersByPlugin.get(plugin), records: authoritativeRecordsByPlugin.get(plugin),
  })))
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
  const organicCanonicalRecords = new Map()
  const organicRelationshipRecords = new Map()
  const organicProviderChains = new Map()
  for (const pluginName of OFFICIAL_SYSTEM_PLUGINS) {
    const records = findRecordsBySignaturesInPlugin(pluginByName.get(pluginName).path, ['FLOR', 'NPC_', 'LVLN', 'OMOD', 'INNR'])
    for (const record of records) {
      const provider = { plugin: pluginName, record }
      const key = `${record.signature}:${record.formIdHex}`
      organicProviderChains.set(key, [...(organicProviderChains.get(key) ?? []), provider])
      organicRelationshipRecords.set(key, provider)
      organicCanonicalRecords.set(`${pluginName}:${record.signature}:${record.formIdHex}`, provider)
    }
  }
  const tables = new Map()
  const localizedTables = new Map()
  for (const input of localizationInputs) {
    const locale = input.locale ?? 'en'
    const localizedKey = `${input.plugin}:${locale}:${input.tableType}`
    if (localizedTables.has(localizedKey)) throw new Error(`LOCALIZATION_TABLE_AMBIGUOUS: Multiple inputs were supplied for ${localizedKey}.`)
    const table = readStringTable(input.path, input.tableType, { locale })
    localizedTables.set(localizedKey, table)
    if (locale === 'en') tables.set(`${input.plugin}:${input.tableType}`, table)
  }
  const normalizationPolicy = buildNameNormalizationPolicy()
  const providerContext = { mastersByPlugin, providerChains }
  const c2Result = generateProvenance(c2Targets, recordsByPlugin, tables, normalizationPolicy, providerContext)
  const systemResult = generateSystemProvenance(systemTargets, recordsByPlugin, starRecordsByPlugin, tables, normalizationPolicy)
  const bodyResult = generateProvenance(bodyTargets, recordsByPlugin, tables, normalizationPolicy, providerContext)
  const organicResult = generateOrganicProvenance(
    organicTargets, organicCanonicalRecords, organicRelationshipRecords, tables,
    buildNamingRules(organicRelationshipRecords), normalizationPolicy,
  )
  const c6Result = generateComposedFaunaProvenance(
    c6Targets, organicCanonicalRecords, organicRelationshipRecords, organicProviderChains, localizedTables,
  )
  const c6Keys = new Set(c6Targets.map((target) => `${target.EntityKind}:${target.EntityId}`))
  const organicUnresolved = organicResult.unresolved.filter((row) => !c6Keys.has(`${row.EntityKind}:${row.EntityId}`))
  const organicClassifications = organicResult.classifications.map((entry) => c6Keys.has(`${entry.item.entityKind}:${entry.item.entityId}`)
    ? { ...entry, classification: ORGANIC_CLASSIFICATIONS.RESOLVED_COMPOSED_FAUNA }
    : entry)
  const result = {
    provenance: [...c2Result.provenance, ...systemResult.provenance, ...bodyResult.provenance, ...organicResult.provenance, ...c6Result.provenance].sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || Number(a.ComponentOrder) - Number(b.ComponentOrder)),
    unresolved: [...c2Result.unresolved, ...systemResult.unresolved, ...bodyResult.unresolved, ...organicUnresolved].sort((a, b) => a.EntityKind.localeCompare(b.EntityKind) || a.EntityId.localeCompare(b.EntityId) || a.ReasonCode.localeCompare(b.ReasonCode)),
    normalizations: [...c2Result.normalizations, ...systemResult.normalizations, ...bodyResult.normalizations, ...organicResult.normalizations],
  }
  const providerStatistics = validateInstalledC7Population(result, providerChains, mastersByPlugin, localizedTables)
  validateNameNormalizations(NAME_NORMALIZATIONS, [...c2Targets, ...systemTargets, ...bodyTargets, ...organicTargets], result.provenance, result.unresolved, result.normalizations)
  const fatal = [...c2Result.unresolved, ...organicUnresolved].filter((row) => ['CANONICAL_SOURCE_ERROR', 'MISSING_STRING_ID', 'WRONG_FIELD', 'WRONG_PLUGIN', 'WRONG_TABLE'].includes(row.ReasonCode))
  if (fatal.length) throw new Error(`English provenance verification failed: ${fatal.map((row) => `${row.EntityKind}:${row.EntityId} ${row.ReasonCode}`).join(', ')}.`)

  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance.csv'), serializeCsv(PROVENANCE_HEADERS, result.provenance), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance-unresolved.csv'), serializeCsv(UNRESOLVED_HEADERS, result.unresolved), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-normalizations.csv'), serializeCsv(NAME_NORMALIZATION_HEADERS, result.normalizations), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance-c6-fauna.csv'), serializeCsv(C6_HANDOFF_HEADERS, c6Result.handoff), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-c6-fauna-ja-preview.csv'), serializeCsv(C6_PREVIEW_HEADERS, c6Result.preview), 'utf8')
  await writeFile(path.join(ROOT, 'reference-source/localized-name-provenance-c5-fauna-lineage.csv'), serializeCsv(TEMPLATE_LINEAGE_HEADERS, organicResult.lineage), 'utf8')
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
      ...c2Statistics, ...systemStatistics, ...bodyStatistics, ...organicStatistics, owningPluginCounts,
      bodyResolvedPluginCounts, bodyUnresolvedPluginCounts,
      orbitalResolved: bodyResult.provenance.filter((row) => orbitalIds.has(row.EntityId)).length,
      orbitalUnresolved: bodyResult.unresolved.filter((row) => orbitalIds.has(row.EntityId)).length,
      providerChains: providerStatistics,
    },
    organic: { ...organicResult, unresolved: organicUnresolved, classifications: organicClassifications, handoff: c6Result.handoff }, c6: c6Result,
    manifest, manifestPath,
  }
}

function validateInstalledC7Population(result, providerChains, mastersByPlugin, localizedTables) {
  const identities = new Set()
  let singleProviderRows = 0
  let overrideRows = 0
  let winnerOwnsRows = 0
  let inheritedRows = 0
  for (const row of result.provenance) {
    const identity = logicalIdentityForRecord(
      row.RecordSourcePlugin, mastersByPlugin, row.RecordSignature, Number.parseInt(row.RecordFormID, 16) >>> 0,
    )
    identities.add(identity.key)
    const chain = providerChains.get(identity.key)
    if (!chain?.length) throw new Error(`C7 provider chain missing for ${row.EntityKind}:${row.EntityId}.`)
    if (chain.length === 1) singleProviderRows += 1
    else overrideRows += 1
    if (row.NameSourcePlugin === chain.at(-1).plugin) winnerOwnsRows += 1
    else inheritedRows += 1
  }
  const nameProviders = Object.fromEntries(AUTHORITATIVE_LOCALIZATION_PLUGINS.map((plugin) => [
    plugin, result.provenance.filter((row) => row.NameSourcePlugin === plugin).length,
  ]))
  const statistics = {
    resolvedEntities: new Set(result.provenance.map((row) => `${row.EntityKind}:${row.EntityId}`)).size,
    provenanceRows: result.provenance.length, unresolvedRows: result.unresolved.length,
    distinctRecords: identities.size, singleProviderRows, overrideRows, winnerOwnsRows, inheritedRows, nameProviders,
  }
  for (const key of ['resolvedEntities', 'provenanceRows', 'unresolvedRows', 'distinctRecords', 'singleProviderRows', 'overrideRows', 'winnerOwnsRows', 'inheritedRows']) {
    if (statistics[key] !== INSTALLED_C7_EXPECTED[key]) throw new Error(`C7 installed invariant ${key} expected ${INSTALLED_C7_EXPECTED[key]}, received ${statistics[key]}.`)
  }
  if (JSON.stringify(nameProviders) !== JSON.stringify(INSTALLED_C7_EXPECTED.nameProviders)) {
    throw new Error(`C7 installed name-provider counts drifted: ${JSON.stringify(nameProviders)}.`)
  }
  const muphrid = result.provenance.find((row) => row.EntityKind === 'body' && row.EntityId === '0005E364')
  const expected = {
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0005E364', RecordSignature: 'PNDT',
    NameSourcePlugin: 'SFBGS00D.esm', NameStringTable: 'strings', NameStringID: '0000A682',
  }
  if (!muphrid || Object.entries(expected).some(([key, value]) => muphrid[key] !== value)) {
    throw new Error(`C7 Muphrid IV regression failed: ${JSON.stringify(muphrid)}.`)
  }
  const japanese = localizedTables.get('SFBGS00D.esm:ja:strings')?.get(0xA682)
  if (muphrid.CanonicalEnglish !== 'Muphrid IV' || japanese !== 'ムフリドIV') {
    throw new Error(`C7 Muphrid IV localized values drifted: en=${JSON.stringify(muphrid.CanonicalEnglish)}, ja=${JSON.stringify(japanese)}.`)
  }
  return statistics
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
  const organicCounts = new Map()
  for (const row of report.organic.classifications) organicCounts.set(row.classification, (organicCounts.get(row.classification) ?? 0) + 1)
  const organicReasons = new Map()
  for (const row of report.organic.classifications.filter((item) => item.reasonCode)) organicReasons.set(row.reasonCode, (organicReasons.get(row.reasonCode) ?? 0) + 1)
  process.stdout.write(
    `Organic occurrence rows ${report.statistics.organicOccurrenceRows}; unique flora ${report.statistics.uniqueFlora}; ` +
    `unique fauna ${report.statistics.uniqueFauna}; duplicates collapsed ${report.statistics.duplicateOrganicOccurrencesCollapsed}; ` +
    `source targets ${JSON.stringify(report.statistics.organicSourcePluginCounts)}\n` +
    `Organic classifications ${JSON.stringify(Object.fromEntries(organicCounts))}\n` +
    `Organic unresolved reasons ${JSON.stringify(Object.fromEntries(organicReasons))}\n`,
  )
  process.stdout.write(`C6 ${JSON.stringify(report.c6.statistics)}\n`)
  process.stdout.write(`C7 provider chains ${JSON.stringify(report.statistics.providerChains)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
}
