import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getActuallyAvailableItemsAtOutpost,
  getAvailableItemsAtOutpost,
  getFeasibleManufacturedProductIdsAtOutpost,
  retireFulfilledPlannedSupply,
} from '../src/domain/availability.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { CargoItem, Outpost, OutpostNetwork } from '../src/domain/models.ts'
import {
  createCollectionEditingSession,
  collectionEditingSessionReducer,
} from '../src/domain/collectionEditingSession.ts'
import { getItemProvenanceAtOutpost } from '../src/domain/provenance.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { manufacturingInputsUnavailableRule } from '../src/domain/validation/rules/manufacturingInputsUnavailable.ts'

const referenceData: ReferenceData = {
  systems: [], bodies: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
  bodyResources: [],
  resources: [
    { id: 'c', name: 'Resource C', shortName: 'C', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'x', name: 'Resource X', shortName: 'X', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
  ],
  products: [
    { id: 'a', name: 'Product A', shortName: 'A', rarity: 'common' },
    { id: 'b', name: 'Product B', shortName: 'B', rarity: 'common' },
    { id: 'mrg', name: 'Microsecond Regulator', shortName: 'MRg', rarity: 'common' },
    { id: 'unknown-recipe', name: 'Unknown Recipe', shortName: 'UR', rarity: 'common' },
  ],
  productRecipes: [
    { productId: 'a', ingredients: [{ item: { type: 'product', id: 'b' }, quantity: 1 }] },
    { productId: 'b', ingredients: [{ item: { type: 'resource', id: 'c' }, quantity: 1 }] },
    { productId: 'mrg', ingredients: [
      { item: { type: 'resource', id: 'c' }, quantity: 1 },
      { item: { type: 'resource', id: 'x' }, quantity: 1 },
    ] },
  ],
}

function makeOutpost(id: string, overrides: Partial<Outpost> = {}): Outpost {
  return {
    id, name: id, systemId: 'system', bodyId: 'body', selectedBiomeIds: [],
    localResources: [], explicitResourcePresence: [], activeProduction: [], manufacturing: [], plannedSupply: [],
    cargoPads: [], ...overrides,
  }
}

function makeNetwork(outposts: Outpost[], cargoLinks: OutpostNetwork['cargoLinks'] = []): OutpostNetwork {
  return { ...createDefaultNetwork(), outposts, cargoLinks }
}

function itemKeys(items: CargoItem[]) {
  return new Set(items.map((item) => `${item.type}:${item.id}`))
}

test('infeasible Microsecond Regulator is not actual, exportable, or local provenance', () => {
  const outpost = makeOutpost('factory', {
    manufacturing: [{ productId: 'mrg', quantity: 1 }],
  })
  const network = makeNetwork([outpost])

  assert.equal(itemKeys(getActuallyAvailableItemsAtOutpost(
    outpost.id, network, referenceData,
  )).has('product:mrg'), false)
  assert.equal(itemKeys(getAvailableItemsAtOutpost(
    outpost.id, network, referenceData,
  )).has('product:mrg'), false)
  assert.equal(getItemProvenanceAtOutpost(
    outpost.id, { type: 'product', id: 'mrg' }, network, referenceData,
  ).local, false)
  assert.deepEqual(
    manufacturingInputsUnavailableRule.validate(network, referenceData)
      .map((issue) => issue.cargoItem?.id),
    ['c', 'x'],
  )

  const plannedNetwork = makeNetwork([{ ...outpost, plannedSupply: [
    { type: 'product', id: 'mrg' },
  ] }])
  assert.equal(itemKeys(getAvailableItemsAtOutpost(
    outpost.id, plannedNetwork, referenceData,
  )).has('product:mrg'), true)
  assert.equal(itemKeys(getActuallyAvailableItemsAtOutpost(
    outpost.id, plannedNetwork, referenceData,
  )).has('product:mrg'), false)
})

test('Planned Supply inputs make manufactured outputs actual and locally sourced', () => {
  const outpost = makeOutpost('factory', {
    activeProduction: [{ type: 'inorganic', resourceId: 'c' }],
    manufacturing: [{ productId: 'mrg', quantity: 1 }],
    plannedSupply: [{ type: 'resource', id: 'x' }],
  })
  const network = makeNetwork([outpost])

  assert.equal(itemKeys(getActuallyAvailableItemsAtOutpost(
    outpost.id, network, referenceData,
  )).has('product:mrg'), true)
  assert.equal(getItemProvenanceAtOutpost(
    outpost.id, { type: 'product', id: 'mrg' }, network, referenceData,
  ).local, true)
  assert.deepEqual(manufacturingInputsUnavailableRule.validate(network, referenceData), [])
})

test('fixed-point manufacturing resolves supplied chains and leaves broken chains unavailable', () => {
  const configured = {
    manufacturing: [
      { productId: 'a', quantity: 1 },
      { productId: 'b', quantity: 1 },
    ],
  }
  const supplied = makeOutpost('supplied', {
    ...configured,
    plannedSupply: [{ type: 'resource', id: 'c' }],
  })
  const broken = makeOutpost('broken', configured)
  const network = makeNetwork([supplied, broken])

  assert.deepEqual(
    [...getFeasibleManufacturedProductIdsAtOutpost('supplied', network, referenceData)],
    ['b', 'a'],
  )
  assert.deepEqual(
    [...getFeasibleManufacturedProductIdsAtOutpost('broken', network, referenceData)],
    [],
  )
})

test('manufacturing cycles require an effective seed and terminate safely', () => {
  const cyclicReferenceData: ReferenceData = {
    ...referenceData,
    productRecipes: [
      { productId: 'a', ingredients: [{ item: { type: 'product', id: 'b' }, quantity: 1 }] },
      { productId: 'b', ingredients: [{ item: { type: 'product', id: 'a' }, quantity: 1 }] },
    ],
  }
  const manufacturing = [
    { productId: 'a', quantity: 1 },
    { productId: 'b', quantity: 1 },
  ]
  const unseeded = makeOutpost('unseeded', { manufacturing })
  const seeded = makeOutpost('seeded', {
    manufacturing,
    plannedSupply: [{ type: 'product', id: 'a' }],
  })
  const network = makeNetwork([unseeded, seeded])

  assert.deepEqual([...getFeasibleManufacturedProductIdsAtOutpost(
    'unseeded', network, cyclicReferenceData,
  )], [])
  assert.deepEqual(new Set(getFeasibleManufacturedProductIdsAtOutpost(
    'seeded', network, cyclicReferenceData,
  )), new Set(['a', 'b']))
})

test('inbound intermediates satisfy recipes and missing recipes never imply feasibility', () => {
  const source = makeOutpost('source', {
    cargoPads: [{
      id: 'source-pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'product', id: 'b' }],
    }],
  })
  const factory = makeOutpost('factory', {
    manufacturing: [
      { productId: 'a', quantity: 1 },
      { productId: 'unknown-recipe', quantity: 1 },
    ],
    cargoPads: [{ id: 'factory-pad', label: 'Pad 1', type: 'regular', outboundItems: [] }],
  })
  const network = makeNetwork([source, factory], [{
    id: 'link',
    endpointA: { outpostId: 'source', cargoPadId: 'source-pad' },
    endpointB: { outpostId: 'factory', cargoPadId: 'factory-pad' },
  }])

  const actual = itemKeys(getActuallyAvailableItemsAtOutpost('factory', network, referenceData))
  assert.equal(actual.has('product:a'), true)
  assert.equal(actual.has('product:unknown-recipe'), false)
  assert.equal(getItemProvenanceAtOutpost(
    'factory', { type: 'product', id: 'a' }, network, referenceData,
  ).local, true)
})

test('fulfilling a fabricator retires its product placeholder in the same undo step', () => {
  const initial = makeNetwork([makeOutpost('factory', {
    manufacturing: [{ productId: 'mrg', quantity: 1 }],
    plannedSupply: [{ type: 'product', id: 'mrg' }],
  })])
  let session = createCollectionEditingSession({
    schemaVersion: 1, networks: [{ id: 'only', network: initial }], activeNetworkId: 'only',
  })
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network', label: { key: 'history.benchmark', parameters: { label: 'Supply fabricator' } }, timestamp: 1,
    update: (network) => retireFulfilledPlannedSupply({
      ...network,
      outposts: network.outposts.map((outpost) => ({
        ...outpost,
        plannedSupply: [
          ...outpost.plannedSupply,
          { type: 'resource' as const, id: 'c' },
          { type: 'resource' as const, id: 'x' },
        ],
      })),
    }, referenceData),
  })

  assert.deepEqual(session.collection.networks[0].network.outposts[0].plannedSupply, [
    { type: 'resource', id: 'c' },
    { type: 'resource', id: 'x' },
  ])
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.deepEqual(session.collection.networks[0].network.outposts[0].plannedSupply, [
    { type: 'product', id: 'mrg' },
  ])
})
