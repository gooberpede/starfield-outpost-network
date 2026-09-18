import assert from 'node:assert/strict'
import test from 'node:test'

import {
  collectionEditingSessionReducer,
  createCollectionEditingSession,
} from '../src/domain/collectionEditingSession.ts'
import type { OutpostNetwork } from '../src/domain/models.ts'
import {
  deserializeNetwork,
  deserializeNetworkCollection,
  serializeNetworkCollection,
} from '../src/data/serialization.ts'

const stableIds = [
  'aluminium',
  'carboxylic-acids',
  'aldumite',
  'water',
  'helium-3',
]

function resourceIds(network: OutpostNetwork): string[] {
  const outpost = network.outposts[0]
  return [
    ...outpost.localResources,
    ...outpost.activeProduction.map((route) => route.resourceId),
    ...outpost.plannedSupply.filter((item) => item.type === 'resource').map((item) => item.id),
    ...outpost.cargoPads.flatMap((pad) =>
      pad.outboundItems.filter((item) => item.type === 'resource').map((item) => item.id)),
  ]
}

test('legacy stable resource IDs survive import, edit, Undo/Redo, export, and reload', () => {
  // Schema 3 is external input; migration supplies today's required fields.
  const historicalNetwork = {
    schemaVersion: 3,
    character: {
      name: 'Legacy',
      level: 42,
      skills: {
        outpostManagement: 0,
        outpostEngineering: null,
        planetaryHabitation: 2,
        researchMethods: null,
        specialProjects: 1,
      },
    },
    outposts: [{
      id: 'outpost',
      name: 'Compatibility',
      systemId: '',
      bodyId: '',
      selectedBiomeIds: [],
      localResources: ['aluminium'],
      activeProduction: [
        { type: 'inorganic', resourceId: 'carboxylic-acids' },
        { type: 'inorganic', resourceId: 'aldumite' },
      ],
      manufacturing: [],
      plannedSupply: [{ type: 'resource', id: 'water' }],
      cargoPads: [{
        id: 'pad',
        label: 'Pad 1',
        type: 'interstellar',
        outboundItems: [{ type: 'resource', id: 'helium-3' }],
      }],
    }],
    cargoLinks: [],
  }

  const imported = deserializeNetwork(JSON.stringify(historicalNetwork))
  assert.deepEqual(resourceIds(imported), stableIds)
  const collection = { schemaVersion: 1, networks: [{ id: 'network', network: imported }], activeNetworkId: 'network' }
  let session = createCollectionEditingSession(collection)
  session = collectionEditingSessionReducer(session, {
    type: 'apply-active-network',
    label: { key: 'history.benchmark', parameters: { label: 'Rename character' } },
    timestamp: 1,
    update: (current) => ({ ...current, character: { ...current.character, name: 'Edited' } }),
  })
  session = collectionEditingSessionReducer(session, { type: 'undo' })
  assert.deepEqual(resourceIds(session.collection.networks[0].network), stableIds)
  session = collectionEditingSessionReducer(session, { type: 'redo' })
  assert.deepEqual(resourceIds(session.collection.networks[0].network), stableIds)
  const reloaded = deserializeNetworkCollection(serializeNetworkCollection(session.collection))
  assert.deepEqual(resourceIds(reloaded.networks[0].network), stableIds)
  assert.equal(reloaded.networks[0].network.schemaVersion, 4)
  assert.equal(reloaded.networks[0].network.character.capabilities.xTechExtraction, true)
  assert.deepEqual(reloaded.networks[0].network.outposts[0].explicitResourcePresence, [])
})

test('unknown and deferred resource IDs remain preserved instead of cleaned up', () => {
  const raw = {
    schemaVersion: 3,
    character: { name: '', level: null, skills: {
      outpostManagement: null, outpostEngineering: null, planetaryHabitation: null,
      researchMethods: null, specialProjects: null,
    } },
    outposts: [{
      id: 'outpost', name: 'Unknown', systemId: '', bodyId: '', selectedBiomeIds: [],
      localResources: ['x-tech', 'future-resource'], activeProduction: [], manufacturing: [],
      plannedSupply: [], cargoPads: [],
    }],
    cargoLinks: [],
  }
  assert.deepEqual(deserializeNetwork(JSON.stringify(raw)).outposts[0].localResources, [
    'x-tech', 'future-resource',
  ])
})
