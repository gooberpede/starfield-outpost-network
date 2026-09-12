#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { buildC2Targets, validateCommittedCrosswalk } from './localized-name-provenance.mjs'
import { buildC4Targets } from './body-provenance.mjs'
import { NAME_NORMALIZATIONS, parseNameNormalizationsCsv, validateNameNormalizations } from './name-normalization-policy.mjs'
import { buildC3Targets } from './star-system-provenance.mjs'

const sourceNames = {
  inorganic: 'inorganic-resource-dictionary.csv', inorganicPolicy: 'inorganic-resource-tracker-policy.csv',
  recipes: 'industrial-workbench.csv', itemMetadata: 'item-tracker-metadata.csv',
  biomeInorganic: 'biome-inorganic-resources.csv', biomeOrganic: 'biome-organic-resources.csv',
  planets: 'planet-directory.csv',
}
const directory = path.resolve('reference-source')
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(directory, name), 'utf8')])))
const { targets: c2Targets } = buildC2Targets(sources)
const { targets: c3Targets } = buildC3Targets(sources.planets)
const { targets: c4Targets } = buildC4Targets(sources.planets)
const targets = [...c2Targets, ...c3Targets, ...c4Targets]
const result = validateCommittedCrosswalk(
  await readFile(path.join(directory, 'localized-name-provenance.csv'), 'utf8'),
  await readFile(path.join(directory, 'localized-name-provenance-unresolved.csv'), 'utf8'),
  targets,
)
const normalizedRows = parseNameNormalizationsCsv(await readFile(path.join(directory, 'localized-name-normalizations.csv'), 'utf8'))
const normalized = validateNameNormalizations(NAME_NORMALIZATIONS, targets, result.provenance, result.unresolved, normalizedRows)
process.stdout.write(`Validated ${result.provenance.length} resolved, ${normalized} normalized, and ${result.unresolved.length} unresolved C2-C4 provenance rows.\n`)
