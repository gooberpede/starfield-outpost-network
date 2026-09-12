/** Reproducibility metadata for local, read-only provenance runs. */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

export const PROVENANCE_TOOL_VERSION = '1.0.0-c1'

export async function sha256File(filePath) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex').toUpperCase()
}

export async function createProvenanceManifest({ pluginPaths, gameVersion, generatedAt = new Date().toISOString() }) {
  const plugins = []
  for (const pluginPath of pluginPaths) {
    const details = await stat(pluginPath)
    plugins.push({
      sourcePath: path.basename(pluginPath),
      filename: path.basename(pluginPath),
      size: details.size,
      sha256: await sha256File(pluginPath),
    })
  }
  return {
    gameVersion,
    toolVersion: PROVENANCE_TOOL_VERSION,
    generatedAt,
    plugins,
    declaredLoadOrder: plugins.map((plugin) => plugin.filename),
  }
}
