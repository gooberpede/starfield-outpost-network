#!/usr/bin/env node
/** Build an ignored prediction index used to match opportunistic gameplay screenshots. */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

import { composedFaunaPredictions, serializeFaunaPredictions, TARGET_EVIDENCE_LOCALES } from './fauna-composition-evidence.mjs'
import { parseGeneratedReferenceNameModule } from './reference-name-materializer.mjs'
import { referenceNameArtifactNames } from './locale-metadata.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')
const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const locale = localeIndex >= 0 ? args[localeIndex + 1] : undefined
if (!TARGET_EVIDENCE_LOCALES.includes(locale) || args.some((arg, index) => arg.startsWith('--') && (arg !== '--locale' || index !== localeIndex))) {
  throw new Error('Usage: build-fauna-evidence-support.mjs --locale <fr-FR|de-DE>')
}
const provenance = parse(await readFile(path.join(ROOT, 'reference-source/localized-name-provenance.csv')), {
  bom: true, columns: true, skip_empty_lines: true, trim: true,
})
const modulePath = path.join(ROOT, referenceNameArtifactNames(locale).module)
const overlay = parseGeneratedReferenceNameModule(await readFile(modulePath, 'utf8'), locale)
const occurrences = JSON.parse(await readFile(path.join(ROOT, 'public/reference-data/planet-species.json'), 'utf8'))
const species = JSON.parse(await readFile(path.join(ROOT, 'public/reference-data/species.json'), 'utf8'))
const canonicalNames = new Map(species.filter((item) => item.type === 'fauna').map((item) => [item.id, item.name]))
const bodiesBySpecies = Map.groupBy(occurrences, (item) => item.speciesId)
const predictions = composedFaunaPredictions(provenance, overlay, locale, { canonicalNames }).map((item) => ({
  ...item,
  bodyIds: [...new Set((bodiesBySpecies.get(item.faunaId) ?? []).map((occurrence) => occurrence.bodyId))].sort(),
}))
const outputPath = path.join(ROOT, '.local-work/localization/fauna-evidence', `${locale}-predictions.csv`)
await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, serializeFaunaPredictions(predictions), 'utf8')
process.stdout.write(`Wrote ${predictions.length} ${locale} composed-fauna predictions to ${outputPath}.\n`)
