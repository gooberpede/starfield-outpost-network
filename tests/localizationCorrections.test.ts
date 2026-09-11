import assert from 'node:assert/strict'
import test from 'node:test'

import { getBiomeButtonGroups } from '../src/domain/bodyResourceAvailability.ts'
import {
  getInvariantCargoPadLabel,
  renumberCargoPadLabels,
} from '../src/domain/cargoPadLabels.ts'
import type { CargoPad } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'
import { translate } from '../src/localization/catalog.ts'
import {
  getBiomeGroupDisplayName,
  getBodyBiomeDisplayName,
  type ReferenceNameResolver,
} from '../src/ui/biomePresentation.ts'
import { getHistoryDisplayLabel } from '../src/ui/historyPresentation.ts'
import { getValidationIssuePresentation } from '../src/ui/validationPresentation.ts'

function referenceFixture(): ReferenceData {
  return {
    systems: [],
    bodies: [],
    biomes: [{ id: 'stable-plains', name: 'Frozen Plains' }],
    bodyBiomes: [
      { id: 'body-plains-a', bodyId: 'body', biomeId: 'stable-plains', biomeIndex: 0 },
      { id: 'body-plains-b', bodyId: 'body', biomeId: 'stable-plains', biomeIndex: 1 },
    ],
    resources: [
      { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
      { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    ],
    products: [],
    bodyResources: [],
    inorganicOccurrences: [
      { bodyId: 'body', resourceId: 'iron', location: { type: 'biome', bodyBiomeId: 'body-plains-a' } },
      { bodyId: 'body', resourceId: 'copper', location: { type: 'biome', bodyBiomeId: 'body-plains-b' } },
    ],
    species: [],
    planetSpecies: [],
    organicOccurrences: [],
    organicFarmingProfiles: [],
    productRecipes: [],
  }
}

test('persisted cargo-pad labels remain invariant while ordinal presentation is localized', () => {
  assert.equal(getInvariantCargoPadLabel(0), 'Pad 1')
  assert.equal(getInvariantCargoPadLabel(1), 'Pad 2')
  const labelsByLocale = (['en-US', 'en-GB'] as const).map(() => [
    getInvariantCargoPadLabel(0),
    getInvariantCargoPadLabel(1),
  ])
  assert.deepEqual(labelsByLocale[0], labelsByLocale[1])

  const pads: CargoPad[] = [
    { id: 'second', label: 'Legacy B', type: 'regular', outboundItems: [] },
    { id: 'first', label: 'Legacy A', type: 'interstellar', outboundItems: [] },
  ]
  const beforeLocaleChange = structuredClone(pads)
  for (const locale of ['en-US', 'en-GB'] as const) {
    assert.equal(translate(locale, 'cargo.pad.summary', { ordinal: 1 }), 'Pad 1')
    assert.deepEqual(pads, beforeLocaleChange)
  }

  const renumbered = renumberCargoPadLabels(pads)
  assert.deepEqual(renumbered.map(({ id, label }) => ({ id, label })), [
    { id: 'second', label: 'Pad 1' },
    { id: 'first', label: 'Pad 2' },
  ])
  assert.deepEqual(pads, beforeLocaleChange)
  assert.equal(
    getHistoryDisplayLabel({
      key: 'history.deleteCargoPad',
      parameters: { outpost: 'Home' },
      cargoPadOrdinalParameters: [{ parameter: 'pad', ordinal: 2 }],
    }, 'en-GB'),
    'Delete Home / Pad 2',
  )
})

test('body-biome and grouped labels localize through stable biome identity', () => {
  const data = referenceFixture()
  const seenIds: string[] = []
  const syntheticResolver: ReferenceNameResolver = (kind, id, fallback) => {
    assert.equal(kind, 'biome')
    seenIds.push(id)
    return id === 'stable-plains' ? 'Localized Plains' : fallback ?? id
  }

  assert.equal(
    getBodyBiomeDisplayName('body-plains-a', data, 'en-US', syntheticResolver),
    'Localized Plains',
  )
  assert.equal(
    getBodyBiomeDisplayName('body-plains-b', data, 'en-US', syntheticResolver),
    'Localized Plains',
  )

  const groups = getBiomeButtonGroups(data, 'body')
  assert.deepEqual(groups.map(({ key, biomeId, ordinal }) => ({ key, biomeId, ordinal })), [
    { key: 'body-plains-a', biomeId: 'stable-plains', ordinal: 1 },
    { key: 'body-plains-b', biomeId: 'stable-plains', ordinal: 2 },
  ])
  assert.deepEqual(
    groups.map((group) => getBiomeGroupDisplayName(group, 'en-US', syntheticResolver)),
    ['Localized Plains 1', 'Localized Plains 2'],
  )
  assert.ok(seenIds.every((id) => id === 'stable-plains'))
  assert.ok(!seenIds.includes(groups[0].key))

  const issue: ValidationIssue = {
    ruleId: 'duplicate-biome-selection',
    category: 'structural',
    severity: 'warning',
    messageKey: 'validation.duplicateBiome',
    bodyBiomeId: 'body-plains-a',
  }
  assert.equal(
    getValidationIssuePresentation(issue, [], data, 'en-US', syntheticResolver).message,
    'Localized Plains appears more than once in this outpost\'s biome selection.',
  )
})

test('biome display retains canonical and raw-ID fallbacks', () => {
  const data = referenceFixture()
  assert.equal(getBodyBiomeDisplayName('body-plains-a', data, 'en-GB'), 'Frozen Plains')
  assert.equal(getBodyBiomeDisplayName('missing-occurrence', data, 'en-GB'), 'missing-occurrence')

  const missingBiomeData: ReferenceData = {
    ...data,
    biomes: [],
    bodyBiomes: [{
      id: 'known-occurrence', bodyId: 'body', biomeId: 'missing-biome', biomeIndex: 0,
    }],
  }
  assert.equal(
    getBodyBiomeDisplayName('known-occurrence', missingBiomeData, 'en-US'),
    'missing-biome',
  )
})
