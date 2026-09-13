import assert from 'node:assert/strict'
import test from 'node:test'

import type { ReferenceData } from '../src/domain/referenceData.ts'
import {
  buildItemSearchCatalogue,
  getItemSearchMatches,
  getUniquelyResolvedSearchItem,
} from '../src/ui/itemSearch.ts'

const references: ReferenceData = {
  systems: [], bodies: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
  bodyResources: [], productRecipes: [],
  resources: [
    { id: 'aluminium', name: 'Aluminum', shortName: 'Al', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'carboxylic-acids', name: 'Carboxylic Acids', shortName: 'R-COOH', category: 'inorganic', rarity: 'rare', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'wire-resource', name: 'Wire Fibre', shortName: 'WF', category: 'organic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: null },
    { id: 'x-tech', name: 'X-Tech', shortName: 'XT', category: 'inorganic', rarity: 'unique', parentId: null, sortOrder: 3, plannedSupplyPlacement: 'special' },
  ],
  products: [
    { id: 'zero-wire', name: 'Zero Wire', shortName: 'ZW', rarity: 'common' },
    { id: 'adaptive-frame', name: 'Adaptive Frame', shortName: 'AF', rarity: 'common' },
  ],
}

test('matching uses the required tiers, normalization, and stable identities', () => {
  const catalogue = buildItemSearchCatalogue(references, 'en-US')
  assert.deepEqual(getItemSearchMatches(catalogue, '  ZERO WIRE  ', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'zw', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'zero w', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'w', 'en-US')
    .map(({ key }) => key), ['resource:wire-resource', 'product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'dapt', 'en-US')
    .map(({ key }) => key), ['product:adaptive-frame'])
  assert.deepEqual(getItemSearchMatches(catalogue, '   ', 'en-US'), [])
  assert.deepEqual(getItemSearchMatches(catalogue, 'missing', 'en-US'), [])
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'zero w', 'en-US'),
  ), { type: 'product', id: 'zero-wire' })
  assert.equal(getItemSearchMatches(catalogue, 'X-Tech', 'en-US')[0].item.id, 'x-tech')
  assert.equal(getItemSearchMatches(catalogue, 'XT', 'en-US')[0].item.id, 'x-tech')
})

test('localized names rebuild between US and UK English without changing identity', () => {
  const us = buildItemSearchCatalogue(references, 'en-US')
  const gb = buildItemSearchCatalogue(references, 'en-GB')
  assert.equal(us.find(({ key }) => key === 'resource:aluminium')?.displayName, 'Aluminum')
  assert.equal(gb.find(({ key }) => key === 'resource:aluminium')?.displayName, 'Aluminium')
  assert.equal(getItemSearchMatches(us, 'aluminum', 'en-US')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(gb, 'aluminium', 'en-GB')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(us, 'Al', 'en-US')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(us, 'R-COOH', 'en-US')[0].item.id, 'carboxylic-acids')
  assert.deepEqual(getItemSearchMatches(us, 'R-COC', 'en-US'), [])
})

test('Japanese display and matching preserve the submitted stable identity', () => {
  const catalogue = buildItemSearchCatalogue(references, 'ja-JP')
  const resource = catalogue.find(({ key }) => key === 'resource:aluminium')
  const product = catalogue.find(({ key }) => key === 'product:adaptive-frame')
  assert.equal(resource?.displayName, 'アルミニウム')
  assert.equal(product?.displayName, '順応型フレーム')
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'アルミニウム', 'ja-JP'),
  ), { type: 'resource', id: 'aluminium' })
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, '順応型フレーム', 'ja-JP'),
  ), { type: 'product', id: 'adaptive-frame' })
  for (const query of ['アルミ', 'Aluminum', 'Aluminium', 'AL', 'al']) {
    const matches = getItemSearchMatches(catalogue, query, 'ja-JP')
    assert.deepEqual(matches.map(({ key }) => key), ['resource:aluminium'], query)
    assert.equal(matches[0].displayName, 'アルミニウム', query)
  }
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'adaptive frame', 'ja-JP'),
  ), { type: 'product', id: 'adaptive-frame' })
  assert.equal(getItemSearchMatches(catalogue, 'adaptive', 'ja-JP')[0].displayName, '順応型フレーム')
  assert.equal(getItemSearchMatches(catalogue, 'Aluminum', 'ja-JP').length, 1)
})

test('localized matches outrank canonical and alternate aliases', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      references.resources[0],
      { ...references.resources[1], id: 'localized-aluminum', name: 'Aluminum' },
    ],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'en-GB')
  assert.deepEqual(getItemSearchMatches(catalogue, 'Aluminum', 'en-GB').map(({ key }) => key), [
    'resource:localized-aluminum',
    'resource:aluminium',
  ])
})

test('ordering and collision disambiguation remain deterministic', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      { ...references.resources[0], id: 'same-b', name: 'Same', shortName: 'S' },
      { ...references.resources[0], id: 'same-a', name: 'Same', shortName: 'SA' },
    ],
    products: [{ ...references.products[0], id: 'same-product', name: 'Same', shortName: 'SP' }],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'en-US')
  const matches = getItemSearchMatches(catalogue, 'same', 'en-US')
  assert.deepEqual(matches.map(({ key }) => key), [
    'resource:same-a', 'resource:same-b', 'product:same-product',
  ])
  assert.equal(matches.every(({ needsCategoryDisambiguator }) => needsCategoryDisambiguator), true)
})

test('canonical alias collisions keep one deterministic row per stable entity', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      { ...references.resources[0], id: 'shared-b', name: 'Shared Alias', shortName: 'SB' },
      { ...references.resources[0], id: 'shared-a', name: 'Shared Alias', shortName: 'SA' },
    ],
    products: [],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'ja-JP')
  const matches = getItemSearchMatches(catalogue, 'shared alias', 'ja-JP')
  assert.deepEqual(matches.map(({ key }) => key), [
    'resource:shared-a',
    'resource:shared-b',
  ])
  assert.equal(new Set(matches.map(({ key }) => key)).size, 2)
  assert.equal(matches.every(({ needsCategoryDisambiguator }) => needsCategoryDisambiguator), true)
  assert.equal(getUniquelyResolvedSearchItem(matches), null)
})
