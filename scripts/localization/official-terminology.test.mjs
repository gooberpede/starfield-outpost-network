import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  parseOfficialTerminologyCsv,
  validateOfficialTerminology,
} from './official-terminology.mjs'

const directory = new URL('../../reference-source/', import.meta.url)
const policy = JSON.parse(await readFile(new URL('official-terminology-policy.json', directory), 'utf8'))
const rows = parseOfficialTerminologyCsv(
  await readFile(new URL('official-terminology-provenance.csv', directory), 'utf8'),
)

test('Free Lanes is terminology evidence but not canonical tracker content', () => {
  assert.equal(policy.canonicalContentPlugins.includes('SFBGS050.esm'), false)
  assert.equal(policy.terminologyEvidencePlugins.includes('SFBGS050.esm'), true)
  assert.doesNotThrow(() => validateOfficialTerminology(policy, rows))
  assert.ok(rows.filter(({ SourcePlugin }) => SourcePlugin === 'SFBGS050.esm')
    .every(({ SourceUse }) => SourceUse === 'terminology-evidence-only'))
})

test('X-Tech Power Core retains its exact qualified official identity', () => {
  const row = rows.find(({ EvidenceId }) => EvidenceId === 'term.x-tech-power-core.item-name')
  assert.deepEqual(row, {
    EvidenceId: 'term.x-tech-power-core.item-name',
    TermId: 'term.x-tech-power-core',
    CanonicalEnglish: 'X-Tech Power Core',
    EvidenceKind: 'standalone',
    SourceUse: 'terminology-evidence-only',
    SourcePlugin: 'SFBGS050.esm',
    RecordSignature: 'MISC',
    RecordFormID: '02031E18',
    FieldPath: 'topLevel.FULL',
    NameSourcePlugin: 'SFBGS050.esm',
    StringTable: 'strings',
    StringID: '000011E5',
    OfficialEnglish: 'X-Tech Power Core',
    OfficialJapanese: 'X-テックパワーコア',
    Context: 'Free Lanes inventory/build-enabling item',
    ContextNotes: '',
    Confidence: 'HIGH',
    RecommendedDefaultForJaJP: 'X-テックパワーコア',
    Notes: 'Official terminology evidence only; do not ingest as a runtime reference entity.',
  })
})

test('required supported terms are evidenced and Cargo Pad exists only as retired absence history', () => {
  const requiredTerms = [
    'term.outpost', 'term.cargo-link', 'term.inter-system-cargo-link',
    'term.inter-system', 'term.biome', 'term.planet', 'term.planetary-body',
    'term.star-system', 'skill.outpost-management', 'skill.outpost-engineering',
    'skill.planetary-habitation', 'skill.research-methods', 'skill.special-projects',
    'term.x-tech', 'term.x-tech-power-core', 'term.starfield', 'term.moon',
    'term.orbital',
  ]
  const evidencedTerms = new Set(rows
    .filter(({ EvidenceKind }) => EvidenceKind !== 'absence')
    .map(({ TermId }) => TermId))
  assert.ok(requiredTerms.every((term) => evidencedTerms.has(term)))

  const cargoPadRows = rows.filter(({ TermId }) => TermId === 'term.cargo-pad')
  assert.ok(cargoPadRows.length > 0)
  assert.ok(cargoPadRows.every(({ EvidenceKind, Notes }) =>
    EvidenceKind === 'absence' && Notes.includes('Retired presentation term')))
})

test('terminology verification rejects canonical Free Lanes use and unsupported plugins', () => {
  const freeLanesCanonical = rows.map((row) => row.EvidenceId === 'term.x-tech-power-core.item-name'
    ? { ...row, SourceUse: 'canonical-content' }
    : row)
  assert.throws(
    () => validateOfficialTerminology(policy, freeLanesCanonical),
    /incompatible|must not treat/,
  )

  const unsupported = rows.map((row, index) => index === 0
    ? { ...row, SourcePlugin: 'Unsupported.esm' }
    : row)
  assert.throws(
    () => validateOfficialTerminology(policy, unsupported),
    /unsupported plugin/,
  )
})
