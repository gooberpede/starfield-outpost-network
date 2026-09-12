/** Adapter from extracted localization-input manifests to the existing C2 table contract. */
import { stat } from 'node:fs/promises'
import path from 'node:path'

import { Ba2LocalizationError } from './ba2-localization-reader.mjs'
import { sha256File } from './provenance-manifest.mjs'

export async function localizationInputsFromManifest(manifest, manifestPath, locale = 'en') {
  const manifestDirectory = path.dirname(path.resolve(manifestPath))
  const inputs = []
  for (const [plugin, details] of Object.entries(manifest.plugins ?? {})) {
    for (const [tableType, table] of Object.entries(details.tables?.[locale] ?? {})) {
      const tablePath = path.resolve(manifestDirectory, table.path)
      const fileDetails = await stat(tablePath)
      const actualHash = await sha256File(tablePath)
      if (fileDetails.size !== table.size || actualHash !== table.sha256) {
        throw new Ba2LocalizationError('TABLE_HASH_MISMATCH', 'Extracted localization table does not match its intake manifest.', {
          plugin, locale, tableType, memberName: table.memberName,
          expectedSize: table.size, actualSize: fileDetails.size, expectedSha256: table.sha256, actualSha256: actualHash,
        })
      }
      inputs.push({ plugin, locale, tableType, path: tablePath })
    }
  }
  return inputs
}
