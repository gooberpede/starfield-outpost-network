#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildC2Targets, generateProvenance, ORGANIC_RESOURCE_ADDENDUM_IDS, PROVENANCE_HEADERS, serializeCsv, UNRESOLVED_HEADERS, validateCommittedCrosswalk } from './localized-name-provenance.mjs'
import { buildC4Targets } from './body-provenance.mjs'
import {
  C6_PREVIEW_HEADERS, generateComposedFaunaProvenance, parseC6Targets,
} from './composed-fauna-provenance.mjs'
import { localizationInputsFromManifest } from './localization-input-manifest.mjs'
import { buildNameNormalizationPolicy, NAME_NORMALIZATION_HEADERS, NAME_NORMALIZATIONS, parseNameNormalizationsCsv, validateNameNormalizations } from './name-normalization-policy.mjs'
import {
  buildC5Targets, buildNamingRules, C6_HANDOFF_HEADERS, generateOrganicProvenance, ORGANIC_CLASSIFICATIONS, TEMPLATE_LINEAGE_HEADERS,
} from './organic-provenance.mjs'
import { createProvenanceManifest } from './provenance-manifest.mjs'
import {
  buildCanonicalPopulation, compareInputManifests, compareProvenanceArtifacts, stableManifestIdentity,
  validateCoverage, validateInputPolicy, validateProvenanceRowShapes, verifyJapaneseAvailability,
} from './provenance-build-integration.mjs'
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
const OUTPUT_PATHS = Object.freeze({
  provenance: 'reference-source/localized-name-provenance.csv',
  unresolved: 'reference-source/localized-name-provenance-unresolved.csv',
  normalizations: 'reference-source/localized-name-normalizations.csv',
  c6Handoff: 'reference-source/localized-name-provenance-c6-fauna.csv',
  c6Preview: 'reference-source/localized-name-c6-fauna-ja-preview.csv',
  c5Lineage: 'reference-source/localized-name-provenance-c5-fauna-lineage.csv',
  manifest: 'reference-source/localized-name-provenance-manifest.json',
})

function parseArguments(args) {
  const result = {}
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--config') result.configPath = args[++index]
    else if (args[index] === '--manifest') result.manifestPath = args[++index]
    else if (args[index] === '--write') result.write = true
    else throw new Error(`Unknown argument: ${args[index]}`)
  }
  result.configPath ??= '.local-work/localization/provenance/localization-provenance-inputs.json'
  return result
}

async function loadSources() {
  return Object.fromEntries(await Promise.all(Object.entries(SOURCES).map(async ([key, relative]) => [key, await readFile(path.join(ROOT, relative), 'utf8')])))
}

export async function buildLocalizedNameProvenance(options) {
  const configPath = path.resolve(options.configPath)
  const configDirectory = path.dirname(configPath)
  const config = JSON.parse(await readFile(configPath, 'utf8'))
  const policy = JSON.parse(await readFile(path.join(ROOT, 'reference-source/localization-provenance-policy.json'), 'utf8'))
  const resolveLocal = (value) => path.resolve(configDirectory, value)
  const configuredPlugins = (config.plugins ?? []).map((item) => ({ ...item, path: resolveLocal(item.path) }))
  const inputPolicy = validateInputPolicy(configuredPlugins, policy)
  const plugins = inputPolicy.authoritative
  for (const plugin of plugins) {
    try { await access(plugin.path) } catch {
      throw new Error(`AUTHORITATIVE_PLUGIN_MISSING: ${plugin.filename} was not found at configured path ${plugin.path}.`)
    }
  }
  const authoritativePluginNames = policy.authoritativePlugins.map((item) => item.filename)
  const localizationInputs = (config.localizationInputs ?? [])
    .filter((item) => authoritativePluginNames.includes(item.plugin))
    .map((item) => ({ locale: 'en', ...item, path: resolveLocal(item.path) }))
  let intakeManifest
  if (config.localizationInputManifest) {
    const intakeManifestPath = resolveLocal(config.localizationInputManifest)
    intakeManifest = JSON.parse(await readFile(intakeManifestPath, 'utf8'))
    for (const locale of policy.locales) localizationInputs.push(...await localizationInputsFromManifest(intakeManifest, intakeManifestPath, locale, authoritativePluginNames))
  }
  const sources = await loadSources()
  const { targets: c2Targets, statistics: c2Statistics } = buildC2Targets(sources)
  const { targets: systemTargets, statistics: systemStatistics } = buildC3Targets(sources.planets)
  const { targets: bodyTargets, statistics: bodyStatistics } = buildC4Targets(sources.planets, authoritativePluginNames)
  const { targets: organicTargets, statistics: organicStatistics } = buildC5Targets(sources.biomeOrganic, authoritativePluginNames)
  const c6Targets = parseC6Targets(sources.c6Fauna)
  const pluginByName = new Map(plugins.map((item) => [item.filename, item]))
  const missingOfficialPlugins = authoritativePluginNames.filter((plugin) => !pluginByName.has(plugin))
  if (missingOfficialPlugins.length) throw new Error(`Missing required official plugin input(s): ${missingOfficialPlugins.join(', ')}.`)
  const mastersByPlugin = new Map()
  const authoritativeRecordsByPlugin = new Map()
  for (const pluginName of authoritativePluginNames) {
    const plugin = pluginByName.get(pluginName)
    if (!plugin) throw new Error(`Missing required authoritative localization plugin input: ${pluginName}.`)
    const masters = readTes4MasterList(plugin.path)
    const expectedMasters = policy.authoritativePlugins.find((item) => item.filename === pluginName).masters
    if (JSON.stringify(masters) !== JSON.stringify(expectedMasters)) {
      throw new Error(`C7 ${pluginName} full-module master list drifted: ${JSON.stringify(masters)}.`)
    }
    mastersByPlugin.set(pluginName, masters)
    authoritativeRecordsByPlugin.set(pluginName, findRecordsBySignaturesInPlugin(plugin.path, PROVIDER_SIGNATURES))
  }
  const providerChains = buildSupportedProviderChains(authoritativePluginNames.map((plugin) => ({
    plugin, masters: mastersByPlugin.get(plugin), records: authoritativeRecordsByPlugin.get(plugin),
  })), authoritativePluginNames)
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
  for (const pluginName of authoritativePluginNames) {
    starRecordsByPlugin.set(pluginName, findStarRecordsInPlugin(pluginByName.get(pluginName).path))
  }
  const organicCanonicalRecords = new Map()
  const organicRelationshipRecords = new Map()
  const organicProviderChains = new Map()
  for (const pluginName of authoritativePluginNames) {
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
    normalizations: [...systemResult.normalizations, ...bodyResult.normalizations, ...c2Result.normalizations, ...organicResult.normalizations],
  }
  const population = buildCanonicalPopulation([c2Targets, systemTargets, bodyTargets, organicTargets])
  const coverage = validateCoverage(population, result.provenance, result.unresolved)
  validateProvenanceRowShapes(result.provenance)
  const japanese = verifyJapaneseAvailability(result.provenance, localizedTables)
  const providerStatistics = validateInstalledC7Population(result, providerChains, mastersByPlugin, localizedTables, policy)
  validateNameNormalizations(NAME_NORMALIZATIONS, [...c2Targets, ...systemTargets, ...bodyTargets, ...organicTargets], result.provenance, result.unresolved, result.normalizations)
  const fatal = [...c2Result.unresolved, ...organicUnresolved].filter((row) => ['CANONICAL_SOURCE_ERROR', 'MISSING_STRING_ID', 'WRONG_FIELD', 'WRONG_PLUGIN', 'WRONG_TABLE'].includes(row.ReasonCode))
  if (fatal.length) throw new Error(`English provenance verification failed: ${fatal.map((row) => `${row.EntityKind}:${row.EntityId} ${row.ReasonCode}`).join(', ')}.`)

  const manifest = await createProvenanceManifest({
    plugins, localizationInputs, intakeManifest, policy, mastersByPlugin, gameVersion: config.gameVersion ?? 'unknown',
    generatorCommit: (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim() } catch { return null } })(),
  })
  const serialized = {
    provenance: serializeCsv(PROVENANCE_HEADERS, result.provenance), unresolved: serializeCsv(UNRESOLVED_HEADERS, result.unresolved),
    normalizations: serializeCsv(NAME_NORMALIZATION_HEADERS, result.normalizations), c6Handoff: serializeCsv(C6_HANDOFF_HEADERS, c6Result.handoff),
    c6Preview: serializeCsv(C6_PREVIEW_HEADERS, c6Result.preview), c5Lineage: serializeCsv(TEMPLATE_LINEAGE_HEADERS, organicResult.lineage),
  }
  let committedManifest
  try { committedManifest = JSON.parse(await readFile(path.join(ROOT, OUTPUT_PATHS.manifest), 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  const committedCrosswalk = validateCommittedCrosswalk(
    await readFile(path.join(ROOT, OUTPUT_PATHS.provenance), 'utf8'), await readFile(path.join(ROOT, OUTPUT_PATHS.unresolved), 'utf8'),
    [...c2Targets, ...systemTargets, ...bodyTargets, ...organicTargets], { allowMissingTargets: true },
  )
  const committed = {
    ...committedCrosswalk,
    normalizations: parseNameNormalizationsCsv(await readFile(path.join(ROOT, OUTPUT_PATHS.normalizations), 'utf8')),
  }
  const drift = [
    ...compareInputManifests(manifest, committedManifest),
    ...compareProvenanceArtifacts(result, committed),
  ]
  const supportingDrift = []
  for (const key of ['c6Handoff', 'c6Preview', 'c5Lineage']) {
    if (serialized[key] !== await readFile(path.join(ROOT, OUTPUT_PATHS[key]), 'utf8')) supportingDrift.push({ category: 'structural', type: 'supporting-artifact-changed', key })
  }
  drift.push(...supportingDrift)
  const reportPath = path.resolve(options.manifestPath ?? path.join(ROOT, '.local-work/localization/provenance/build-report.json'))
  const entityKindCounts = Object.fromEntries([...new Set(result.provenance.map((row) => row.EntityKind))].sort().map((kind) => [kind, new Set(result.provenance.filter((row) => row.EntityKind === kind).map((row) => row.EntityId)).size]))
  const buildReport = {
    schemaVersion: 1, generatedAt: new Date().toISOString(), inputManifestIdentity: stableManifestIdentity(manifest),
    inputPolicy, coverage, providerCounts: providerStatistics.nameProviders, entityKindCounts,
    composition: c6Result.statistics, normalizationUsage: { approved: NAME_NORMALIZATIONS.length, used: result.normalizations.length, stale: 0 },
    verification: { englishMismatches: 0, japanese }, drift,
    outputFiles: Object.fromEntries(Object.entries(serialized).map(([key]) => [OUTPUT_PATHS[key], drift.some((item) => item.key === key || !item.key) ? 'review' : 'unchanged'])),
    remainingRuntimeVerification: 'Confirm exact Japanese on-screen U+0020 composed-name separator fidelity in the runtime or Creation Kit.',
  }
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(buildReport, null, 2)}\n`, 'utf8')
  if (options.write) {
    for (const [key, content] of Object.entries(serialized)) await writeFile(path.join(ROOT, OUTPUT_PATHS[key]), content, 'utf8')
    await writeFile(path.join(ROOT, OUTPUT_PATHS.manifest), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  } else if (drift.length) {
    throw new Error(`PROVENANCE_DRIFT_DETECTED: ${drift.length} change(s); inspect ${reportPath}. Use --write only after review.`)
  }
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
    manifest, manifestPath: reportPath, buildReport,
  }
}

function validateInstalledC7Population(result, providerChains, mastersByPlugin, localizedTables, policy) {
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
  const nameProviders = Object.fromEntries(policy.authoritativePlugins.map(({ filename: plugin }) => [
    plugin, result.provenance.filter((row) => row.NameSourcePlugin === plugin).length,
  ]))
  const statistics = {
    resolvedEntities: new Set(result.provenance.map((row) => `${row.EntityKind}:${row.EntityId}`)).size,
    provenanceRows: result.provenance.length, unresolvedRows: result.unresolved.length,
    distinctRecords: identities.size, singleProviderRows, overrideRows, winnerOwnsRows, inheritedRows, nameProviders,
  }
  for (const key of ['resolvedEntities', 'provenanceRows', 'unresolvedRows']) {
    if (statistics[key] !== policy.expectedClosure[key]) throw new Error(`C8 closure invariant ${key} expected ${policy.expectedClosure[key]}, received ${statistics[key]}.`)
  }
  if (JSON.stringify(nameProviders) !== JSON.stringify(policy.expectedClosure.providerRows)) {
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
  const organicAddendumRows = result.provenance.filter((row) =>
    row.EntityKind === 'resource' && ORGANIC_RESOURCE_ADDENDUM_IDS.includes(row.EntityId))
  if (organicAddendumRows.length !== ORGANIC_RESOURCE_ADDENDUM_IDS.length || organicAddendumRows.some((row) => {
    const identity = logicalIdentityForRecord(
      row.RecordSourcePlugin, mastersByPlugin, row.RecordSignature, Number.parseInt(row.RecordFormID, 16) >>> 0,
    )
    const chain = providerChains.get(identity.key)
    return row.RecordSourcePlugin !== 'Starfield.esm' || row.NameSourcePlugin !== 'Starfield.esm' || chain?.length !== 1
  })) throw new Error('C7 organic-resource addendum provider boundary drifted.')
  const gastronomic = organicAddendumRows.find((row) => row.EntityId === 'gastronomic-delight')
  const gastronomicExpected = {
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '0007782F', RecordSignature: 'IRES',
    NameFieldPath: 'topLevel.FULL', NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings',
    NameStringID: '000081A0', CanonicalEnglish: 'Gastronomic Delight',
  }
  const gastronomicEnglish = localizedTables.get('Starfield.esm:en:strings')?.get(0x81A0)
  const gastronomicJapanese = localizedTables.get('Starfield.esm:ja:strings')?.get(0x81A0)
  if (!gastronomic || Object.entries(gastronomicExpected).some(([key, value]) => gastronomic[key] !== value) ||
      gastronomicEnglish !== 'Gastro Delight' || gastronomicJapanese !== '美食の喜び') {
    throw new Error(
      `Organic-resource Gastronomic Delight regression failed: row=${JSON.stringify(gastronomic)}, ` +
      `en=${JSON.stringify(gastronomicEnglish)}, ja=${JSON.stringify(gastronomicJapanese)}.`,
    )
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
  process.stdout.write(
    `C8 coverage ${JSON.stringify(report.buildReport.coverage)}; Japanese missing IDs ${report.buildReport.verification.japanese.missingIds}; ` +
    `drift ${report.buildReport.drift.length}; mode ${report.buildReport.drift.length ? 'review' : 'no-drift'}\n` +
    `Authoritative plugins ${report.manifest.authoritativePlugins.map((plugin) => plugin.filename).join(', ')}\n` +
    `Build report ${report.manifestPath}\n`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
}
