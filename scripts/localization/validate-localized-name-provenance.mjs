#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { buildC2Targets, validateCommittedCrosswalk } from './localized-name-provenance.mjs'

const sourceNames = {
  inorganic: 'inorganic-resource-dictionary.csv', inorganicPolicy: 'inorganic-resource-tracker-policy.csv',
  recipes: 'industrial-workbench.csv', itemMetadata: 'item-tracker-metadata.csv',
  biomeInorganic: 'biome-inorganic-resources.csv', biomeOrganic: 'biome-organic-resources.csv',
}
const directory = path.resolve('reference-source')
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(directory, name), 'utf8')])))
const { targets } = buildC2Targets(sources)
const result = validateCommittedCrosswalk(
  await readFile(path.join(directory, 'localized-name-provenance.csv'), 'utf8'),
  await readFile(path.join(directory, 'localized-name-provenance-unresolved.csv'), 'utf8'),
  targets,
)
process.stdout.write(`Validated ${result.provenance.length} resolved and ${result.unresolved.length} unresolved C2 provenance rows.\n`)
