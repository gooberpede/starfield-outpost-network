#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

import { buildDirectNameTargets, validateCommittedCrosswalk } from './localized-name-provenance.mjs'
import { buildBodyTargets } from './body-provenance.mjs'
import { validateCommittedComposedFaunaArtifacts } from './composed-fauna-provenance.mjs'
import { NAME_NORMALIZATIONS, parseNameNormalizationsCsv, validateNameNormalizations } from './name-normalization-policy.mjs'
import { buildOrganicTargets, validateCommittedOrganicArtifacts } from './organic-provenance.mjs'
import { buildStarSystemTargets } from './star-system-provenance.mjs'
import { buildCanonicalPopulation, validateCoverage, validateProvenanceRowShapes, validateResourceCatalogueReconciliation } from './provenance-build-integration.mjs'

const sourceNames = {
  inorganic: 'inorganic-resource-dictionary.csv', inorganicPolicy: 'inorganic-resource-tracker-policy.csv',
  recipes: 'industrial-workbench.csv', itemMetadata: 'item-tracker-metadata.csv',
  biomeInorganic: 'biome-inorganic-resources.csv', biomeOrganic: 'biome-organic-resources.csv',
  planets: 'planet-directory.csv',
}
const directory = path.resolve('reference-source')
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(directory, name), 'utf8')])))
const { targets: directNameTargets } = buildDirectNameTargets(sources)
const { targets: starSystemTargets } = buildStarSystemTargets(sources.planets)
const { targets: bodyTargets } = buildBodyTargets(sources.planets)
const { targets: organicTargets } = buildOrganicTargets(sources.biomeOrganic)
const targets = [...directNameTargets, ...starSystemTargets, ...bodyTargets, ...organicTargets]
const result = validateCommittedCrosswalk(
  await readFile(path.join(directory, 'localized-name-provenance.csv'), 'utf8'),
  await readFile(path.join(directory, 'localized-name-provenance-unresolved.csv'), 'utf8'),
  targets,
)
const policy = JSON.parse(await readFile(path.join(directory, 'localization-provenance-policy.json'), 'utf8'))
const population = buildCanonicalPopulation([directNameTargets, starSystemTargets, bodyTargets, organicTargets])
const coverage = validateCoverage(population, result.provenance, result.unresolved)
validateProvenanceRowShapes(result.provenance)
const resourceReconciliation = validateResourceCatalogueReconciliation(
  result.provenance,
  JSON.parse(await readFile(path.resolve(directory, '../public/reference-data/resources.json'), 'utf8')),
  parse(sources.inorganicPolicy, { bom: true, columns: true, skip_empty_lines: true, trim: true })
    .filter((row) => row.Disposition === 'excluded').map((row) => row.ResourceId),
)
const normalizedRows = parseNameNormalizationsCsv(await readFile(path.join(directory, 'localized-name-normalizations.csv'), 'utf8'))
const normalized = validateNameNormalizations(NAME_NORMALIZATIONS, targets, result.provenance, result.unresolved, normalizedRows)
const organic = validateCommittedOrganicArtifacts(
  result.provenance, result.unresolved,
  await readFile(path.join(directory, 'localized-name-provenance-composed-fauna.csv'), 'utf8'),
  await readFile(path.join(directory, 'localized-name-provenance-template-fauna-lineage.csv'), 'utf8'),
  organicTargets,
)
const composedFauna = validateCommittedComposedFaunaArtifacts(
  result.provenance, result.unresolved,
  await readFile(path.join(directory, 'localized-name-provenance-composed-fauna.csv'), 'utf8'),
  await readFile(path.join(directory, 'localized-name-composed-fauna-ja-preview.csv'), 'utf8'),
)
if (coverage.resolvedEntities !== policy.expectedClosure.resolvedEntities || result.provenance.length !== policy.expectedClosure.provenanceRows ||
    result.unresolved.length !== policy.expectedClosure.unresolvedRows || composedFauna.statistics.entities !== policy.expectedClosure.composedFaunaEntities ||
    composedFauna.statistics.rows !== policy.expectedClosure.composedFaunaRows) {
  throw new Error(`Committed integrated provenance closure totals drifted: ${JSON.stringify({ coverage, provenanceRows: result.provenance.length, composedFauna: composedFauna.statistics })}`)
}
const providerRows = Object.fromEntries(policy.authoritativePlugins.map(({ filename }) => [filename, result.provenance.filter((row) => row.NameSourcePlugin === filename).length]))
if (JSON.stringify(providerRows) !== JSON.stringify(policy.expectedClosure.providerRows)) throw new Error(`Committed official provider totals drifted: ${JSON.stringify(providerRows)}.`)
const manifest = JSON.parse(await readFile(path.join(directory, 'localized-name-provenance-manifest.json'), 'utf8'))
if (JSON.stringify(manifest.authoritativePlugins.map((plugin) => plugin.filename)) !== JSON.stringify(policy.authoritativePlugins.map((plugin) => plugin.filename))) {
  throw new Error('Committed provenance manifest authoritative plugin policy drifted.')
}
process.stdout.write(
  `Validated ${new Set(result.provenance.map((row) => `${row.EntityKind}:${row.EntityId}`)).size} resolved entities in ${result.provenance.length} provenance rows, ` +
  `${normalized} normalized, and ${result.unresolved.length} unresolved; ${composedFauna.statistics.entities} composed fauna in ${composedFauna.statistics.rows} component rows ` +
  `and ${organic.lineage.length} template lineages; resource reconciliation ${JSON.stringify(resourceReconciliation)}; ` +
  `authoritative providers ${JSON.stringify(providerRows)}.\n`,
)
