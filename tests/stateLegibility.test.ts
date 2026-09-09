import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getActuallyAvailableItemsAtOutpost,
} from '../src/domain/availability.ts'
import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { Outpost, OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { plannedSupplyUnresolvedRule } from '../src/domain/validation/rules/plannedSupplyUnresolved.ts'
import { unresolvedCargoExportRule } from '../src/domain/validation/rules/unresolvedCargoExport.ts'
import {
  getInterstellarFuelState,
  getManufacturingProducingState,
} from '../src/ui/statusStates.ts'

const referenceData: ReferenceData = {
  systems: [], bodies: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
  bodyResources: [],
  resources: [
    { id: 'shared-id', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
    { id: 'input', name: 'Aluminum', shortName: 'Al', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null },
  ],
  products: [
    { id: 'shared-id', name: 'Adaptive Frame', shortName: 'AFr', rarity: 'common' },
  ],
  productRecipes: [{
    productId: 'shared-id',
    ingredients: [{ item: { type: 'resource', id: 'input' }, quantity: 1 }],
  }],
}

function makeOutpost(overrides: Partial<Outpost> = {}): Outpost {
  return {
    id: 'outpost', name: 'Outpost', systemId: 'system', bodyId: 'body',
    selectedBiomeIds: [], localResources: [], activeProduction: [],
    manufacturing: [], plannedSupply: [], cargoPads: [], ...overrides,
  }
}

function makeNetwork(outposts: Outpost[]): OutpostNetwork {
  return { ...createDefaultNetwork(), outposts }
}

test('Planned Supply is a valid virtual cargo source and retains its information issue', () => {
  const network = makeNetwork([makeOutpost({
    plannedSupply: [{ type: 'resource', id: 'shared-id' }],
    cargoPads: [{
      id: 'pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'shared-id' }],
    }],
  })])

  assert.deepEqual(unresolvedCargoExportRule.validate(network, referenceData), [])
  assert.equal(plannedSupplyUnresolvedRule.validate(network, referenceData).length, 1)
})

test('cargo source matching uses both item type and stable ID', () => {
  const network = makeNetwork([makeOutpost({
    plannedSupply: [{ type: 'product', id: 'shared-id' }],
    cargoPads: [{
      id: 'pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'shared-id' }],
    }],
  })])

  assert.equal(unresolvedCargoExportRule.validate(network, referenceData).length, 1)
})

test('cargo export without any source still receives the warning', () => {
  const network = makeNetwork([makeOutpost({
    cargoPads: [{
      id: 'pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'shared-id' }],
    }],
  })])

  const issues = unresolvedCargoExportRule.validate(network, referenceData)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].message, 'This cargo export has no actual source.')
})

test('actual local and imported cargo sources remain valid', () => {
  const local = makeOutpost({
    id: 'local',
    activeProduction: [{ type: 'inorganic', resourceId: 'shared-id' }],
    cargoPads: [{
      id: 'local-pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'shared-id' }],
    }],
  })
  const source = makeOutpost({
    id: 'source',
    cargoPads: [{
      id: 'source-pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'input' }],
    }],
  })
  const importer = makeOutpost({
    id: 'importer',
    cargoPads: [{
      id: 'importer-pad', label: 'Pad 1', type: 'regular',
      outboundItems: [{ type: 'resource', id: 'input' }],
    }],
  })
  const network = {
    ...makeNetwork([local, source, importer]),
    cargoLinks: [{
      id: 'link', type: 'regular' as const,
      endpointA: { outpostId: 'source', cargoPadId: 'source-pad' },
      endpointB: { outpostId: 'importer', cargoPadId: 'importer-pad' },
    }],
  }

  assert.deepEqual(unresolvedCargoExportRule.validate(network, referenceData), [])
})

test('manufacturing Producing state follows actual recipe feasibility', () => {
  const blockedOutpost = makeOutpost({
    manufacturing: [{ productId: 'shared-id', quantity: 1 }],
  })
  const blockedNetwork = makeNetwork([blockedOutpost])
  assert.equal(getManufacturingProducingState(
    'shared-id',
    getActuallyAvailableItemsAtOutpost('outpost', blockedNetwork, referenceData),
  ), 'not-producing')

  const readyOutpost = makeOutpost({
    activeProduction: [{ type: 'inorganic', resourceId: 'input' }],
    manufacturing: [{ productId: 'shared-id', quantity: 1 }],
  })
  const readyNetwork = makeNetwork([readyOutpost])
  assert.equal(getManufacturingProducingState(
    'shared-id',
    getActuallyAvailableItemsAtOutpost('outpost', readyNetwork, referenceData),
  ), 'producing')
})

test('interstellar fuel state distinguishes fuelled, unfuelled, and regular pads', () => {
  assert.equal(getInterstellarFuelState(true, true), 'fuelled')
  assert.equal(getInterstellarFuelState(true, false), 'unfuelled')
  assert.equal(getInterstellarFuelState(false, true), 'regular')
})
