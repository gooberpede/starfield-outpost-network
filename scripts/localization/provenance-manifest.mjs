/** Reproducibility metadata for local, read-only provenance runs. */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { encodingForKnownLocale } from './locale-metadata.mjs'

export const PROVENANCE_TOOL_VERSION = '1.0.0'

export async function sha256File(filePath) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex').toUpperCase()
}

export async function createProvenanceManifest({
  plugins,
  localizationInputs = [],
  intakeManifest,
  policy,
  mastersByPlugin,
  gameVersion,
  generatedAt = new Date().toISOString(),
  generatorCommit = null,
}) {
  const pluginEntries = []
  for (const plugin of plugins) {
    const details = await stat(plugin.path)
    pluginEntries.push({
      localReference: `Data/${plugin.filename}`,
      filename: plugin.filename,
      moduleClass: policy.authoritativePlugins.find((item) => item.filename === plugin.filename)?.moduleClass ?? 'full',
      masters: mastersByPlugin.get(plugin.filename) ?? [],
      size: details.size,
      sha256: await sha256File(plugin.path),
    })
  }
  const tables = []
  for (const input of localizationInputs) {
    const details = await stat(input.path)
    tables.push({
      plugin: input.plugin,
      locale: input.locale,
      tableType: input.tableType,
      archiveFilename: input.archiveFilename ?? null,
      memberName: input.memberName ?? path.basename(input.path),
      size: details.size,
      sha256: await sha256File(input.path),
    })
  }
  const archives = []
  for (const plugin of policy.authoritativePlugins.map((item) => item.filename)) {
    for (const archive of intakeManifest?.plugins?.[plugin]?.archives ?? []) {
      archives.push({
        plugin, filename: archive.filename, size: archive.size, sha256: archive.sha256,
        version: archive.version, archiveType: archive.archiveType, memberCount: archive.memberCount,
      })
    }
  }
  return {
    schemaVersion: 1,
    gameVersion,
    generatedAt,
    generator: { toolVersion: PROVENANCE_TOOL_VERSION, commit: generatorCommit },
    authoritativePlugins: pluginEntries.sort((a, b) => policy.authoritativePlugins.findIndex((item) => item.filename === a.filename) - policy.authoritativePlugins.findIndex((item) => item.filename === b.filename)),
    optionalCompatibilityPlugins: [...policy.optionalCompatibilityPlugins].sort(),
    localizationArchives: archives.sort((a, b) => a.plugin.localeCompare(b.plugin) || a.filename.localeCompare(b.filename)),
    localizationInputs: tables.sort((a, b) => a.plugin.localeCompare(b.plugin) || a.locale.localeCompare(b.locale) || a.tableType.localeCompare(b.tableType)),
    locales: [...policy.provenanceLocales],
    tableTypes: [...new Set(tables.map((table) => table.tableType))].sort(),
    encodingPolicy: Object.fromEntries(policy.provenanceLocales.map((locale) => [locale, encodingForKnownLocale(locale)])),
  }
}
