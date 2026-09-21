import assert from 'node:assert/strict'
import test from 'node:test'

import { composedFaunaPredictions, parseFaunaPredictions, serializeFaunaPredictions, TARGET_EVIDENCE_LOCALES, validateFaunaEvidence } from './fauna-composition-evidence.mjs'
import { parseGeneratedReferenceNameModule } from './reference-name-materializer.mjs'

const fixtureRows = [
  { EntityKind: 'fauna', EntityId: '00000001', DisplayNameSourceKind: 'composed', CanonicalEnglish: 'Herding Dodo Grazer', ComponentOrder: '2', ComponentRole: 'diet', NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '00000003' },
  { EntityKind: 'fauna', EntityId: '00000001', DisplayNameSourceKind: 'composed', CanonicalEnglish: 'Herding Dodo Grazer', ComponentOrder: '0', ComponentRole: 'prefix', NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '00000001' },
  { EntityKind: 'fauna', EntityId: '00000001', DisplayNameSourceKind: 'composed', CanonicalEnglish: 'Herding Dodo Grazer', ComponentOrder: '1', ComponentRole: 'species', NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '00000002' },
]
const prediction = {
  locale: 'de-DE', faunaId: '00000001', canonicalEnglish: 'Herding Dodo Grazer',
  predictedLocalizedName: 'Gruppe Dodo Pflanzenfresser', componentShape: 'prefix+species+diet',
  bodyIds: ['000000AA'],
  components: fixtureRows.sort((left, right) => Number(left.ComponentOrder) - Number(right.ComponentOrder)).map((row) => ({
    role: row.ComponentRole, order: Number(row.ComponentOrder), plugin: row.NameSourcePlugin, table: row.NameStringTable, stringId: row.NameStringID,
  })),
}
const predictions = [prediction]

test('fauna evidence eligibility includes every non-English full locale', () => {
  assert.deepEqual(TARGET_EVIDENCE_LOCALES, ['fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'pl-PL', 'zh-Hans'])
})

test('fauna prediction support preserves stable identity, semantic order, and qualified sources', () => {
  assert.equal(prediction.faunaId, '00000001')
  assert.equal(prediction.componentShape, 'prefix+species+diet')
  assert.deepEqual(prediction.components.map(({ role }) => role), ['prefix', 'species', 'diet'])
  const parsed = parseFaunaPredictions(serializeFaunaPredictions(predictions))
  assert.equal(parsed[0].PredictedLocalizedName, 'Gruppe Dodo Pflanzenfresser')
})

test('evidence is locale-bound, requires explicit matches, and fails closed on accepted contradictions', () => {
  const observation = {
    id: 'de-example-1', locale: 'de-DE', faunaId: '00000001',
    observedText: 'Gruppe Dodo Pflanzenfresser', predictedText: 'Gruppe Dodo Pflanzenfresser',
    matchesPrediction: true, componentOrder: 'prefix species diet', separator: 'U+0020', punctuation: 'none', grammarNotes: '', screenshotReference: 'local screenshot',
  }
  assert.deepEqual(validateFaunaEvidence({ schemaVersion: 1, locale: 'de-DE', status: 'provisionally-accepted', support: 'independently-observed', observations: [observation] }, predictions, 'de-DE'), {
    status: 'provisionally-accepted', support: 'independently-observed', observationCount: 1, contradictions: 0,
  })
  assert.throws(() => validateFaunaEvidence({ schemaVersion: 1, locale: 'de-DE', status: 'provisionally-accepted', support: 'independently-observed', observations: [{ ...observation, matchesPrediction: false }] }, predictions, 'de-DE'), /FAUNA_EVIDENCE_CONTRADICTION/)
  assert.throws(() => validateFaunaEvidence({ schemaVersion: 1, locale: 'de-DE', status: 'pending-opportunistic-screenshots', support: 'independently-observed', observations: [{ ...observation, componentShape: 'species+diet' }] }, predictions, 'de-DE'), /stale component shape/)
  assert.throws(() => validateFaunaEvidence({ schemaVersion: 1, locale: 'de-DE', status: 'pending-opportunistic-screenshots', support: 'independently-observed', observations: [{ ...observation, bodyId: '000000BB' }] }, predictions, 'de-DE'), /not mapped/)
  assert.throws(() => validateFaunaEvidence({ schemaVersion: 1, locale: 'de-DE', status: 'pending-opportunistic-screenshots', support: 'independently-observed', observations: [{ ...observation, matchStatus: 'scanner-case-only', observedText: 'Andere Wörter' }] }, predictions, 'de-DE'), /scanner-case-only/)
  assert.throws(() => validateFaunaEvidence({ schemaVersion: 1, locale: 'fr-FR', status: 'pending-opportunistic-screenshots', support: 'inherited-from-current-model', observations: [] }, predictions, 'de-DE'), /FAUNA_EVIDENCE_INVALID/)
})

test('committed Polish screenshot evidence maps all supplied frames and covers every composition shape', async () => {
  const { readFile } = await import('node:fs/promises')
  const { parse } = await import('csv-parse/sync')
  const rows = parse(await readFile(new URL('../../reference-source/localized-name-provenance.csv', import.meta.url)), { columns: true, bom: true })
  const overlay = parseGeneratedReferenceNameModule(await readFile(new URL('../../src/localization/generated/pl-PL-reference-names.ts', import.meta.url), 'utf8'), 'pl-PL')
  const occurrences = JSON.parse(await readFile(new URL('../../public/reference-data/planet-species.json', import.meta.url), 'utf8'))
  const groupedOccurrences = Map.groupBy(occurrences, (item) => item.speciesId)
  const bodyIdsByFauna = new Map([...groupedOccurrences].map(([faunaId, faunaOccurrences]) => [
    faunaId, new Set(faunaOccurrences.map((occurrence) => occurrence.bodyId)),
  ]))
  const predictions = composedFaunaPredictions(rows, overlay, 'pl-PL', { bodyIdsByFauna })
  const evidence = JSON.parse(await readFile(new URL('../../reference-source/localized-fauna-evidence-pl-PL.json', import.meta.url), 'utf8'))
  assert.deepEqual(validateFaunaEvidence(evidence, predictions, 'pl-PL'), {
    status: 'provisionally-accepted', support: 'independently-observed', observationCount: 8, contradictions: 0,
  })
  assert.deepEqual(Object.fromEntries([...Map.groupBy(evidence.observations, (item) => item.componentShape)].map(([shape, items]) => [shape, items.length])), {
    'prefix+species': 4, 'prefix+species+diet': 2, 'species+diet': 2,
  })
  assert.deepEqual(Object.fromEntries([...Map.groupBy(evidence.observations, (item) => item.bodyName)].map(([body, items]) => [body, items.length])), {
    Jemison: 5, Codos: 3,
  })
  assert.ok(evidence.observations.every((item) => item.matchStatus === 'scanner-case-only' && item.truncated === false))
})

test('committed provenance closes all 922 composed fauna and 2,179 components by shape', async () => {
  const { readFile } = await import('node:fs/promises')
  const { parse } = await import('csv-parse/sync')
  const rows = parse(await readFile(new URL('../../reference-source/localized-name-provenance.csv', import.meta.url)), { columns: true, bom: true })
  const overlay = parseGeneratedReferenceNameModule(await readFile(new URL('../../src/localization/generated/fr-FR-reference-names.ts', import.meta.url), 'utf8'), 'fr-FR')
  const species = JSON.parse(await readFile(new URL('../../public/reference-data/species.json', import.meta.url), 'utf8'))
  const canonicalNames = new Map(species.filter((item) => item.type === 'fauna').map((item) => [item.id, item.name]))
  const predictions = composedFaunaPredictions(rows, overlay, 'fr-FR', { canonicalNames })
  assert.equal(predictions.length, 922)
  assert.equal(predictions.find((item) => item.faunaId === '0019B89C').canonicalEnglish, 'Herding Cutterhead Herbivore')
})
