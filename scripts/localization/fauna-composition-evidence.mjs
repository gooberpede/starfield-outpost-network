/** Validate and serialize the project-owned evidence record for composed fauna names. */
import { parse } from 'csv-parse/sync'

export const FAUNA_EVIDENCE_SCHEMA_VERSION = 1
export const TARGET_EVIDENCE_LOCALES = Object.freeze(['fr-FR', 'de-DE'])
export const EXPECTED_FAUNA_SHAPES = Object.freeze({
  'prefix+species': 267,
  'prefix+species+diet': 335,
  'species+diet': 320,
})

export function composedFaunaPredictions(provenance, overlay, locale, { canonicalNames = new Map() } = {}) {
  const grouped = new Map()
  for (const row of provenance.filter((item) => item.EntityKind === 'fauna' && item.DisplayNameSourceKind === 'composed')) {
    grouped.set(row.EntityId, [...(grouped.get(row.EntityId) ?? []), row])
  }
  const predictions = [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([faunaId, rows]) => ({
    locale,
    faunaId,
    canonicalEnglish: canonicalNames.get(faunaId) ?? rows.map((row) => row.CanonicalEnglish).join(' '),
    predictedLocalizedName: overlay.species?.[faunaId],
    componentShape: [...rows].sort((left, right) => Number(left.ComponentOrder) - Number(right.ComponentOrder))
      .map((row) => row.ComponentRole).join('+'),
    components: [...rows].sort((left, right) => Number(left.ComponentOrder) - Number(right.ComponentOrder)).map((row) => ({
      role: row.ComponentRole,
      order: Number(row.ComponentOrder),
      plugin: row.NameSourcePlugin,
      table: row.NameStringTable,
      stringId: row.NameStringID,
    })),
  }))
  const shapeCounts = Object.fromEntries(Object.keys(EXPECTED_FAUNA_SHAPES).map((shape) => [shape, 0]))
  for (const prediction of predictions) {
    if (!prediction.predictedLocalizedName || !(prediction.componentShape in shapeCounts)) {
      throw new Error(`FAUNA_PREDICTION_CLOSURE_FAILED: ${prediction.faunaId}.`)
    }
    shapeCounts[prediction.componentShape] += 1
  }
  const componentCount = predictions.reduce((sum, item) => sum + item.components.length, 0)
  if (predictions.length !== 922 || componentCount !== 2179 ||
    JSON.stringify(shapeCounts) !== JSON.stringify(EXPECTED_FAUNA_SHAPES)) {
    throw new Error(`FAUNA_PREDICTION_CLOSURE_FAILED: ${JSON.stringify({ predictions: predictions.length, componentCount, shapeCounts })}`)
  }
  return predictions
}

export function validateFaunaEvidence(evidence, predictions, locale) {
  if (evidence.schemaVersion !== FAUNA_EVIDENCE_SCHEMA_VERSION || evidence.locale !== locale ||
    !['pending-opportunistic-screenshots', 'provisionally-accepted'].includes(evidence.status) ||
    !['inherited-from-current-model', 'independently-observed'].includes(evidence.support) ||
    !Array.isArray(evidence.observations)) throw new Error('FAUNA_EVIDENCE_INVALID: invalid document header.')
  const byId = new Map(predictions.map((item) => [item.faunaId, item]))
  let contradictions = 0
  const seen = new Set()
  for (const observation of evidence.observations) {
    if (!observation.id || seen.has(observation.id) || !byId.has(observation.faunaId) ||
      observation.locale !== locale || !observation.observedText || !observation.predictedText ||
      typeof observation.matchesPrediction !== 'boolean' || !observation.componentOrder || !observation.separator ||
      !Object.hasOwn(observation, 'punctuation') || !Object.hasOwn(observation, 'grammarNotes') ||
      !observation.screenshotReference) throw new Error('FAUNA_EVIDENCE_INVALID: malformed observation.')
    seen.add(observation.id)
    if (observation.predictedText !== byId.get(observation.faunaId).predictedLocalizedName) {
      throw new Error(`FAUNA_EVIDENCE_INVALID: ${observation.id} has stale predicted text.`)
    }
    if (!observation.matchesPrediction) contradictions += 1
  }
  if (contradictions && evidence.status === 'provisionally-accepted') {
    throw new Error('FAUNA_EVIDENCE_CONTRADICTION: accepted status is forbidden while observations contradict the model.')
  }
  if (evidence.status === 'provisionally-accepted' && evidence.observations.length === 0) {
    throw new Error('FAUNA_EVIDENCE_INVALID: accepted status requires observed first-party evidence.')
  }
  if (evidence.status === 'provisionally-accepted' && evidence.support !== 'independently-observed') {
    throw new Error('FAUNA_EVIDENCE_INVALID: accepted status requires independently observed support.')
  }
  return { status: evidence.status, support: evidence.support, observationCount: evidence.observations.length, contradictions }
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export function serializeFaunaPredictions(predictions) {
  const headings = ['Locale', 'FaunaId', 'CanonicalEnglish', 'PredictedLocalizedName', 'ComponentShape', 'BodyIds', 'ComponentSources']
  const rows = predictions.map((item) => [item.locale, item.faunaId, item.canonicalEnglish, item.predictedLocalizedName,
    item.componentShape, (item.bodyIds ?? []).join('|'),
    item.components.map((part) => `${part.order}:${part.role}:${part.plugin}:${part.table}:${part.stringId}`).join('|')])
  return `${[headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

export function parseFaunaPredictions(source) {
  return parse(source, { columns: true, skip_empty_lines: true })
}
