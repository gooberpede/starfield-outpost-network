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
  throw new Error(`Usage: build-fauna-evidence-support.mjs --locale <${TARGET_EVIDENCE_LOCALES.join('|')}>`)
}
const provenance = parse(await readFile(path.join(ROOT, 'reference-source/localized-name-provenance.csv')), {
  bom: true, columns: true, skip_empty_lines: true, trim: true,
})
const modulePath = path.join(ROOT, referenceNameArtifactNames(locale).module)
const moduleSource = await readFile(modulePath, 'utf8').catch((error) => {
  if (error?.code === 'ENOENT') throw new Error(`REFERENCE_NAME_ARTIFACT_MISSING: ${locale} requires ${modulePath}.`)
  throw error
})
const overlay = parseGeneratedReferenceNameModule(moduleSource, locale)
const occurrences = JSON.parse(await readFile(path.join(ROOT, 'public/reference-data/planet-species.json'), 'utf8'))
const species = JSON.parse(await readFile(path.join(ROOT, 'public/reference-data/species.json'), 'utf8'))
const canonicalNames = new Map(species.filter((item) => item.type === 'fauna').map((item) => [item.id, item.name]))
const bodiesBySpecies = Map.groupBy(occurrences, (item) => item.speciesId)
const bodyIdsByFauna = new Map([...bodiesBySpecies].map(([faunaId, faunaOccurrences]) => [
  faunaId, new Set(faunaOccurrences.map((occurrence) => occurrence.bodyId)),
]))
const predictions = composedFaunaPredictions(provenance, overlay, locale, { canonicalNames, bodyIdsByFauna })
const outputPath = path.join(ROOT, '.local-work/localization/fauna-evidence', `${locale}-predictions.csv`)
await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, serializeFaunaPredictions(predictions), 'utf8')
process.stdout.write(`Wrote ${predictions.length} ${locale} composed-fauna predictions to ${outputPath}.\n`)
