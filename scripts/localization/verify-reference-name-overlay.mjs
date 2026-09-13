#!/usr/bin/env node
/** Repository-only integrity verification for the committed reference-name overlay. */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

import {
  RUNTIME_KIND_ORDER, assertExpectedReferenceNameCounts, normalizeReferenceKind,
  parseGeneratedReferenceNameModule, sha256Text,
} from './reference-name-materializer.mjs'
import { validateProvenanceRowShapes } from './provenance-build-integration.mjs'

const ROOT = path.resolve(import.meta.dirname, '../..')

export async function verifyCommittedReferenceNameOverlay(root = ROOT) {
  const modulePath = path.join(root, 'src/localization/generated/ja-JP-reference-names.ts')
  const provenancePath = path.join(root, 'reference-source/localized-name-provenance.csv')
  const sidecarPath = path.join(root, 'reference-source/localized-reference-names-manifest.json')
  const [moduleSource, provenanceBytes, sidecarSource, resourcesSource] = await Promise.all([
    readFile(modulePath, 'utf8'), readFile(provenancePath), readFile(sidecarPath, 'utf8'),
    readFile(path.join(root, 'public/reference-data/resources.json'), 'utf8'),
  ])
  const overlay = parseGeneratedReferenceNameModule(moduleSource)
  const provenance = parse(provenanceBytes, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  validateProvenanceRowShapes(provenance)
  const sidecar = JSON.parse(sidecarSource)
  const unknownKinds = Object.keys(overlay).filter((kind) => !RUNTIME_KIND_ORDER.includes(kind))
  if (unknownKinds.length) throw new Error(`UNKNOWN_REFERENCE_KIND: ${unknownKinds.join(', ')}.`)
  const counts = assertExpectedReferenceNameCounts(overlay)
  const generatedKeys = new Set()
  const serializedKeys = new Set()
  let serializedKind
  for (const line of moduleSource.split('\n')) {
    const kindMatch = line.match(/^  "([^"]+)": \{$/)
    if (kindMatch) serializedKind = kindMatch[1]
    const idMatch = line.match(/^    "([^"]+)": /)
    if (idMatch && serializedKind) {
      const key = `${serializedKind}:${idMatch[1]}`
      if (serializedKeys.has(key)) throw new Error(`DUPLICATE_RUNTIME_KEY: ${key}.`)
      serializedKeys.add(key)
    }
  }
  for (const kind of RUNTIME_KIND_ORDER) for (const [id, value] of Object.entries(overlay[kind] ?? {})) {
    const key = `${kind}:${id}`
    if (generatedKeys.has(key)) throw new Error(`DUPLICATE_RUNTIME_KEY: ${key}.`)
    if (!value || value.includes('\uFFFD')) throw new Error(`INVALID_LOCALIZED_VALUE: ${key}.`)
    generatedKeys.add(key)
  }
  const provenanceKeys = new Set(provenance.map((row) => `${normalizeReferenceKind(row.EntityKind)}:${row.EntityId}`))
  const missing = [...provenanceKeys].filter((key) => !generatedKeys.has(key))
  const extra = [...generatedKeys].filter((key) => !provenanceKeys.has(key))
  if (missing.length || extra.length) throw new Error(`REFERENCE_NAME_COVERAGE_FAILED: ${JSON.stringify({ missing, extra })}`)
  if (sidecar.provenanceSha256 !== sha256Text(provenanceBytes)) throw new Error('UPSTREAM_PROVENANCE_HASH_MISMATCH.')
  if (sidecar.generatedModuleSha256 !== sha256Text(moduleSource)) throw new Error('GENERATED_MODULE_HASH_MISMATCH.')
  if (sidecar.entityCount !== generatedKeys.size || sidecar.provenanceRowCount !== provenance.length || JSON.stringify(sidecar.perKindCounts) !== JSON.stringify(counts)) {
    throw new Error('REFERENCE_NAME_SIDECAR_COUNT_MISMATCH.')
  }
  const provenanceResources = new Set(provenance.filter((row) => row.EntityKind === 'resource').map((row) => row.EntityId))
  const runtimeResources = new Set(JSON.parse(resourcesSource).map((resource) => resource.id))
  const sourceOnly = [...provenanceResources].filter((id) => !runtimeResources.has(id)).sort()
  const missingResources = [...runtimeResources].filter((id) => !provenanceResources.has(id)).sort()
  if (provenanceResources.size !== 78 || runtimeResources.size !== 76 || missingResources.length || JSON.stringify(sourceOnly) !== JSON.stringify(['aqueous-hematite', 'caelumite'])) {
    throw new Error(`RESOURCE_CATALOGUE_RECONCILIATION_FAILED: ${JSON.stringify({ provenance: provenanceResources.size, runtime: runtimeResources.size, missingResources, sourceOnly })}`)
  }
  return { entityCount: generatedKeys.size, provenanceRows: provenance.length, counts, sourceOnly }
}

if (process.argv[1] && process.argv[1].endsWith('verify-reference-name-overlay.mjs')) {
  verifyCommittedReferenceNameOverlay().then((result) => process.stdout.write(
    `Verified committed Japanese reference-name overlay: ${result.entityCount} entities, ${result.provenanceRows} provenance rows, resources 78/76+2.\n`,
  )).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1 })
}
