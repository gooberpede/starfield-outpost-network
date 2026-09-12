import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildCanonicalPopulation, compareInputManifests, compareProvenanceArtifacts,
  validateCoverage, validateInputPolicy, validateProvenanceRowShapes,
} from './provenance-build-integration.mjs'

const policy = {
  authoritativePlugins: [{ filename: 'Starfield.esm' }, { filename: 'FutureDLC.esm' }],
  optionalCompatibilityPlugins: ['SFBGS050.esm'],
}

function row(overrides = {}) {
  return {
    EntityKind: 'body', EntityId: '1', DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
    RecordSourcePlugin: 'Starfield.esm', RecordFormID: '00000001', RecordSignature: 'PNDT', NameFieldPath: 'full',
    NameSourcePlugin: 'Starfield.esm', NameStringTable: 'strings', NameStringID: '00000001', CanonicalEnglish: 'One',
    ...overrides,
  }
}

function composedRows(...components) {
  return components.map(([ComponentOrder, ComponentRole]) => row({
    EntityKind: 'fauna', DisplayNameSourceKind: 'composed', ComponentOrder, ComponentRole,
  }))
}

test('source policy requires allowlisted inputs, tolerates historical absence, and ignores mods', () => {
  const result = validateInputPolicy([
    { filename: 'Starfield.esm' }, { filename: 'FutureDLC.esm' }, { filename: 'MyMod.esm' },
  ], policy)
  assert.deepEqual(result.authoritative.map((item) => item.filename), ['Starfield.esm', 'FutureDLC.esm'])
  assert.deepEqual(result.optionalCompatibility, [{ filename: 'SFBGS050.esm', present: false, required: false }])
  assert.deepEqual(result.ignored, ['MyMod.esm'])
  assert.throws(() => validateInputPolicy([{ filename: 'Starfield.esm' }], policy), /AUTHORITATIVE_PLUGIN_MISSING/)
})

test('coverage rejects duplicate, missing, extra, and overlapping states', () => {
  assert.throws(() => buildCanonicalPopulation([[{ entityKind: 'body', entityId: '1' }], [{ EntityKind: 'body', EntityId: '1' }]]), /DUPLICATE_CANONICAL_ENTITY/)
  const population = buildCanonicalPopulation([[{ entityKind: 'body', entityId: '1' }, { entityKind: 'body', entityId: '2' }]])
  assert.deepEqual(validateCoverage(population, [row()], [{ EntityKind: 'body', EntityId: '2' }]), {
    canonicalEntities: 2, resolvedEntities: 1, unresolvedEntities: 1, excludedEntities: 0,
  })
  assert.throws(() => validateCoverage(population, [row()], []), /missing/)
  assert.throws(() => validateCoverage(population, [row(), row({ EntityId: '3' })], [{ EntityKind: 'body', EntityId: '2' }]), /extra/)
  assert.throws(() => validateCoverage(population, [row()], [{ EntityKind: 'body', EntityId: '1' }, { EntityKind: 'body', EntityId: '2' }]), /overlap/)
})

test('row shapes accept complete names and every generically valid composed fauna shape', () => {
  assert.equal(validateProvenanceRowShapes([row()]), 1)
  for (const shape of [
    [['0', 'prefix'], ['1', 'species'], ['2', 'diet']],
    [['1', 'species'], ['2', 'diet']],
    [['0', 'prefix'], ['1', 'species']],
    [['1', 'species']],
  ]) assert.equal(validateProvenanceRowShapes(composedRows(...shape)), 1)
})

test('composed row shapes reject missing, duplicate, or misplaced species components', () => {
  assert.throws(() => validateProvenanceRowShapes([row({ ComponentRole: 'prefix' })]), /ROW_SHAPE/)
  for (const shape of [
    [['0', 'prefix']],
    [['2', 'diet']],
    [['0', 'prefix'], ['2', 'diet']],
    [['1', 'species'], ['1', 'species']],
    [['1', 'diet']],
    [['0', 'species']],
  ]) assert.throws(() => validateProvenanceRowShapes(composedRows(...shape)), /ROW_SHAPE/)
})

test('drift classifies string edits separately from structural provider and population changes', () => {
  const committed = { provenance: [row()], unresolved: [], normalizations: [] }
  const editorial = compareProvenanceArtifacts({ ...committed, provenance: [row({ NameStringID: '00000002' })] }, committed)
  assert.equal(editorial[0].category, 'editorial')
  assert.deepEqual(editorial[0].fields, ['NameStringID'])
  const structural = compareProvenanceArtifacts({ ...committed, provenance: [row({ NameSourcePlugin: 'FutureDLC.esm' })] }, committed)
  assert.equal(structural[0].category, 'structural')
  assert.equal(structural[0].type, 'provider-changed')
  assert.deepEqual(structural[0].fields, ['NameSourcePlugin'])
  const fieldPath = compareProvenanceArtifacts({ ...committed, provenance: [row({ NameFieldPath: 'other' })] }, committed)
  assert.deepEqual(fieldPath[0].fields, ['NameFieldPath'])
  const population = compareProvenanceArtifacts({ ...committed, provenance: [row(), row({ EntityId: '2' })] }, committed)
  assert.ok(population.some((item) => item.type === 'added-entity'))
  const removal = compareProvenanceArtifacts({ ...committed, provenance: [] }, committed)
  assert.ok(removal.some((item) => item.type === 'removed-entity'))
  const unresolved = compareProvenanceArtifacts({ provenance: [], unresolved: [{ EntityKind: 'body', EntityId: '1', ReasonCode: 'fixture' }], normalizations: [] }, committed)
  assert.ok(unresolved.some((item) => item.type === 'unresolved-status-changed'))
})

test('manifest comparison specifically classifies an authoritative plugin hash change', () => {
  const before = {
    schemaVersion: 1, gameVersion: 'fixture', generatedAt: 'one', generator: { commit: 'a', toolVersion: '1' },
    authoritativePlugins: [{ filename: 'Starfield.esm', moduleClass: 'full', masters: [], size: 10, sha256: 'A' }],
    localizationArchives: [], localizationInputs: [], locales: ['en'], encodingPolicy: { en: 'windows-1252' },
  }
  const after = structuredClone(before)
  after.generatedAt = 'two'
  after.generator.commit = 'b'
  assert.deepEqual(compareInputManifests(after, before), [])
  after.authoritativePlugins[0].sha256 = 'B'
  assert.deepEqual(compareInputManifests(after, before), [{
    category: 'input', type: 'plugin-hash-changed', key: 'Starfield.esm', field: 'sha256', before: 'A', after: 'B',
  }])
})

test('manifest comparison retains generic input policy or tool drift classification', () => {
  const before = { generator: { toolVersion: '1' }, authoritativePlugins: [], localizationArchives: [], localizationInputs: [] }
  const after = { ...before, generator: { toolVersion: '2' } }
  assert.equal(compareInputManifests(after, before)[0].type, 'input-policy-or-tool-changed')
})
