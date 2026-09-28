/**
 * Purpose:
 *   Intake explicitly supplied Bethesda localization archives into manifested local inputs.
 *
 * Architecture:
 *   Discovers and extracts only configured localization members, records their
 *   identities, and writes local-only artifacts. It does not infer archive
 *   authority, mutate game files, or publish Bethesda data.
 *
 * Change this file when:
 *   Localization intake configuration, extraction, manifest, or safety policy changes.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { discoverLocalizationMembers, extractBa2Member, inspectBa2 } from './ba2-localization-reader.mjs'
import { sha256File } from './provenance-manifest.mjs'
import { readStringTable } from './string-table-reader.mjs'

export const LOCALIZATION_INPUT_TOOL_VERSION = '1.0.0'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex').toUpperCase()
}

function parseArguments(args) {
  const result = { mode: 'extract' }
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--config') result.configPath = args[++index]
    else if (args[index] === '--manifest') result.manifestPath = args[++index]
    else if (args[index] === '--inspect') result.mode = 'inspect'
    else throw new Error(`Unknown argument: ${args[index]}`)
  }
  if (!result.configPath) throw new Error('Missing required --config <local-inputs.json>.')
  return result
}

function localPath(configDirectory, value) {
  return path.resolve(configDirectory, value)
}

function portablePath(manifestDirectory, value) {
  return path.relative(manifestDirectory, value).replaceAll('\\', '/')
}

export async function intakeLocalizationInputs(options) {
  const configPath = path.resolve(options.configPath)
  const configDirectory = path.dirname(configPath)
  const config = JSON.parse(await readFile(configPath, 'utf8'))
  const languages = [...new Set((config.languages ?? ['en', 'ja']).map((value) => String(value).toLowerCase()))].sort()
  if (!languages.length) throw new Error('At least one language must be requested.')
  const manifestPath = path.resolve(options.manifestPath ?? config.manifestPath ?? path.join(ROOT, '.local-work/localization/inputs/manifest.json'))
  const manifestDirectory = path.dirname(manifestPath)
  const outputDirectory = localPath(configDirectory, config.outputDirectory ?? path.join(ROOT, '.local-work/localization/inputs'))
  const plugins = {}

  for (const pluginConfig of config.plugins ?? []) {
    const plugin = pluginConfig.plugin
    const archivePaths = (pluginConfig.archives ?? []).map((value) => localPath(configDirectory, value))
    if (!plugin || !archivePaths.length) throw new Error(`Plugin entries require plugin and non-empty archives: ${JSON.stringify(pluginConfig)}`)
    const archives = archivePaths.map(inspectBa2)
    const discovered = discoverLocalizationMembers(archives, plugin, languages)
    const archiveReports = []
    for (const archive of archives) {
      archiveReports.push({
        filename: archive.archiveFilename, size: archive.size, sha256: await sha256File(archive.archivePath),
        version: archive.version, archiveType: archive.archiveType, memberCount: archive.memberCount,
      })
    }
    const tables = Object.fromEntries(languages.map((locale) => [locale, {}]))
    for (const item of discovered.matches.sort((left, right) => left.locale.localeCompare(right.locale) || left.tableType.localeCompare(right.tableType))) {
      const bytes = extractBa2Member(item.archive, item.member)
      const destination = path.join(outputDirectory, discovered.pluginBase, `${discovered.pluginBase}_${item.locale}.${item.tableType}`)
      if (options.mode !== 'inspect') {
        await mkdir(path.dirname(destination), { recursive: true })
        await writeFile(destination, bytes)
        readStringTable(destination, item.tableType, { locale: item.locale })
      }
      tables[item.locale][item.tableType] = {
        path: portablePath(manifestDirectory, destination), archiveFilename: item.archive.archiveFilename,
        memberName: item.member.memberName, size: bytes.length, sha256: sha256Buffer(bytes), compressed: item.member.compressed,
      }
    }
    plugins[plugin] = {
      pluginBase: discovered.pluginBase, archives: archiveReports, tables,
      coverage: Object.fromEntries(languages.map((locale) => [locale, {
        present: Object.keys(tables[locale]).length > 0,
        tableTypes: Object.keys(tables[locale]).sort(),
        diagnostic: discovered.missingLanguages.includes(locale) ? 'LANGUAGE_NOT_FOUND' : undefined,
      }])),
    }
  }

  const manifest = {
    schemaVersion: 1, toolVersion: LOCALIZATION_INPUT_TOOL_VERSION,
    generatedAt: options.generatedAt ?? new Date().toISOString(), languages, plugins,
  }
  if (options.mode !== 'inspect') {
    await mkdir(manifestDirectory, { recursive: true })
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  }
  return { manifest, manifestPath, outputDirectory }
}

function printReport(report) {
  for (const [plugin, details] of Object.entries(report.manifest.plugins)) {
    process.stdout.write(`${plugin} (${details.pluginBase})\n`)
    for (const archive of details.archives) {
      process.stdout.write(`  ${archive.filename}: ${archive.size} bytes, SHA-256 ${archive.sha256}, BA2 v${archive.version} ${archive.archiveType}, ${archive.memberCount} members\n`)
    }
    for (const locale of report.manifest.languages) {
      const coverage = details.coverage[locale]
      process.stdout.write(`  ${locale}: ${coverage.present ? coverage.tableTypes.join(', ') : coverage.diagnostic}\n`)
      for (const [tableType, table] of Object.entries(details.tables[locale])) {
        process.stdout.write(`    ${table.archiveFilename} -> ${table.memberName}: ${table.size} bytes, SHA-256 ${table.sha256}\n`)
      }
    }
  }
  process.stdout.write(`Manifest ${report.manifestPath}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  intakeLocalizationInputs(parseArguments(process.argv.slice(2)))
    .then(printReport)
    .catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
}
