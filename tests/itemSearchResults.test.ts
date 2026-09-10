import assert from 'node:assert/strict'
import test from 'node:test'

import { getItemSearchResults } from '../src/domain/itemSearchResults.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { Outpost, OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'

const referenceData: ReferenceData = {
  systems: [], bodies: [], bodyResources: [], organicFarmingProfiles: [],
  resources: [
    { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
    { id: 'fiber', name: 'Fiber', shortName: 'Fb', category: 'organic', rarity: 'common', parentId: null, sortOrder: null },
  ],
  products: [
    { id: 'wire', name: 'Zero Wire', shortName: 'ZW', rarity: 'common' },
    { id: 'unknown', name: 'Unknown', shortName: 'U', rarity: 'common' },
    { id: 'broken-reference', name: 'Broken Reference', shortName: 'BR', rarity: 'common' },
  ],
  productRecipes: [
    { productId: 'wire', ingredients: [
      { item: { type: 'resource', id: 'iron' }, quantity: 1 },
    ] },
    { productId: 'broken-reference', ingredients: [
      { item: { type: 'resource', id: 'missing-reference' }, quantity: 1 },
    ] },
  ],
  biomes: [{ id: 'forest', name: 'Forest' }],
  bodyBiomes: [{ id: 'body:0', bodyId: 'body', biomeId: 'forest', biomeIndex: 0 }],
  species: [{ id: 'plant', name: 'Plant', type: 'flora' }],
  planetSpecies: [{
    bodyId: 'body', speciesId: 'plant', sourceClass: 'plant', domesticable: true, resourceId: 'fiber',
  }],
  organicOccurrences: [{ bodyBiomeId: 'body:0', speciesId: 'plant' }],
  inorganicOccurrences: [],
}

function outpost(id: string, overrides: Partial<Outpost> = {}): Outpost {
  return {
    id, name: id, systemId: 'system', bodyId: 'body', selectedBiomeIds: [],
    localResources: [], activeProduction: [], manufacturing: [], plannedSupply: [],
    cargoPads: [], ...overrides,
  }
}

function network(outposts: Outpost[], cargoLinks: OutpostNetwork['cargoLinks'] = []): OutpostNetwork {
  return { ...createDefaultNetwork(), outposts, cargoLinks }
}

test('resource results combine flags in fixed order and preserve outpost order', () => {
  const source = outpost('source', {
    localResources: ['iron'],
    activeProduction: [{ type: 'inorganic', resourceId: 'iron' }],
    plannedSupply: [{ type: 'resource', id: 'iron' }],
    cargoPads: [{
      id: 'source-pad', label: 'Pad', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'iron' }],
    }],
  })
  const receiver = outpost('receiver', {
    cargoPads: [{ id: 'receiver-pad', label: 'Pad', type: 'regular', outboundItems: [] }],
  })
  const value = network([source, receiver], [{
    id: 'link', endpointA: { outpostId: 'source', cargoPadId: 'source-pad' },
    endpointB: { outpostId: 'receiver', cargoPadId: 'receiver-pad' },
  }])

  assert.deepEqual(getItemSearchResults(
    { type: 'resource', id: 'iron' }, value, referenceData,
  ), [
    { outpostId: 'source', outpostName: 'source', flags: [
      'present', 'producing', 'exporting', 'planned-supply',
    ] },
    { outpostId: 'receiver', outpostName: 'receiver', flags: ['importing'] },
  ])
})

test('product readiness distinguishes producing, missing inputs, and unresolved recipes', () => {
  const supplied = outpost('supplied', {
    manufacturing: [{ productId: 'wire', quantity: 1 }],
    plannedSupply: [{ type: 'resource', id: 'iron' }],
  })
  const missing = outpost('missing', {
    manufacturing: [{ productId: 'wire', quantity: 1 }],
  })
  const unresolved = outpost('unresolved', {
    manufacturing: [
      { productId: 'unknown', quantity: 1 },
      { productId: 'broken-reference', quantity: 1 },
    ],
  })
  const value = network([supplied, missing, unresolved])
  assert.deepEqual(getItemSearchResults(
    { type: 'product', id: 'wire' }, value, referenceData,
  ), [
    { outpostId: 'supplied', outpostName: 'supplied', flags: ['producing'] },
    { outpostId: 'missing', outpostName: 'missing', flags: ['missing-inputs'] },
  ])
  assert.deepEqual(getItemSearchResults(
    { type: 'product', id: 'unknown' }, value, referenceData,
  ), [])
  assert.deepEqual(getItemSearchResults(
    { type: 'product', id: 'broken-reference' }, value, referenceData,
  ), [])
})

test('PRESENT mirrors source-specific organic Matrix semantics', () => {
  const present = outpost('present')
  const wrongBiome = outpost('wrong-biome', { selectedBiomeIds: ['foreign'] })
  assert.deepEqual(getItemSearchResults(
    { type: 'resource', id: 'fiber' }, network([present, wrongBiome]), referenceData,
  ), [{ outpostId: 'present', outpostName: 'present', flags: ['present'] }])
})

test('recipe ingredients alone never create item results', () => {
  const factory = outpost('factory', {
    manufacturing: [{ productId: 'wire', quantity: 1 }],
  })
  assert.deepEqual(getItemSearchResults(
    { type: 'resource', id: 'iron' }, network([factory]), referenceData,
  ), [])
})
