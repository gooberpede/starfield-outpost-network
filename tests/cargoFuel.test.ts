import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveCargoFuel } from '../src/domain/cargoFuel.ts'
import { getActuallyAvailableItemsAtOutpost } from '../src/domain/availability.ts'
import { interstellarCargoHelium3Rule as rule } from '../src/domain/validation/rules/interstellarCargoHelium3.ts'
import type { OutpostNetwork } from '../src/domain/models.ts'
import { end, fuelNetwork, fuelReference, helium } from './cargoFuelFixture.ts'

const actual = (n: OutpostNetwork) => resolveCargoFuel(n, fuelReference,
  id => getActuallyAvailableItemsAtOutpost(id, n, fuelReference))

test('fuel availability is symmetric across exports, plans and endpoint order', () => {
  for (const reversed of [false, true]) for (const exports of [0, 1, 2, 3]) {
    for (const production of [0, 1, 2, 3]) for (const planned of [0, 1, 2, 3]) {
      const n = fuelNetwork()
      if (reversed) n.cargoLinks[0] = { id: 'route', endpointA: end('B'), endpointB: end('A') }
      for (const [index, outpost] of n.outposts.slice(0, 2).entries()) {
        const bit = 1 << index
        if (production & bit) outpost.activeProduction.push({ type: 'inorganic', resourceId: helium.id })
        if (planned & bit) outpost.plannedSupply.push(helium)
        if (exports & bit) outpost.cargoPads[0].outboundItems.push({ type: 'resource', id: 'iron' })
      }
      const original = structuredClone(n)
      const fuel = actual(n)
      for (const [index, id] of ['A', 'B'].entries()) {
        assert.equal(fuel.sourceAt(end(id)), production & (1 << index) ? 'local' : production ? 'remote' : 'neither')
      }
      const issues = rule.validate(n, fuelReference)
      assert.deepEqual(issues.map(i => [i.cargoLinkId, i.linkedOutpostIds]),
        production || planned ? [] : [['route', ['A', 'B']]])
      assert.deepEqual(n, original)
    }
  }
})

test('inbound helium at a connected outpost supplies both indicators', () => {
  const n = fuelNetwork()
  n.outposts[0].cargoPads.push({ id: 'feed', label: 'Feed', type: 'regular', outboundItems: [] })
  n.outposts[2].cargoPads[0].outboundItems.push(helium)
  n.cargoLinks.push({ id: 'supply', endpointA: end('C'), endpointB: { outpostId: 'A', cargoPadId: 'feed' } })
  assert.equal(actual(n).sourceAt(end('A')), 'local')
  assert.equal(actual(n).sourceAt(end('B')), 'remote')
  assert.deepEqual(rule.validate(n, fuelReference), [])
})

const invalid: Record<string, (n: OutpostNetwork) => void> = {
  unlinked: n => { n.cargoLinks = [] },
  intent: n => { n.cargoLinks = []; n.outposts[0].cargoPads[0].destinationIntent = { outpostId: 'B' } },
  self: n => { n.cargoLinks[0].endpointB = end('A') },
  missingOutpost: n => { n.outposts.pop(); n.outposts.pop() },
  missingPad: n => { n.outposts[1].cargoPads = [] },
  conflict: n => { n.cargoLinks.push({ id: 'AC', endpointA: end('A'), endpointB: end('C') }) },
  duplicate: n => { n.cargoLinks.push({ ...n.cargoLinks[0], id: 'duplicate' }) },
  regularAtA: n => { n.outposts[0].cargoPads[0].type = 'regular' },
  regularAtB: n => { n.outposts[1].cargoPads[0].type = 'regular' },
  sameSystem: n => { n.outposts[1].systemId = 'A' },
  unknownSystem: n => { n.outposts[1].systemId = 'unknown' },
  blankSystem: n => { n.outposts[1].systemId = '' },
}
for (const [kind, change] of Object.entries(invalid)) test(kind + ' uses local fuel only', () => {
  const n = fuelNetwork()
  change(n)
  assert.deepEqual(rule.validate(n, fuelReference), [])
  for (const outpost of n.outposts.slice(1)) outpost.activeProduction.push({ type: 'inorganic', resourceId: helium.id })
  assert.equal(actual(n).sourceAt(end('A')), 'local-unavailable')
})

test('fuel warnings keep stable link order across network and endpoint reordering', () => {
  const n = fuelNetwork()
  n.outposts[1].cargoPads.push({ id: 'second', label: 'Pad 2', type: 'interstellar', outboundItems: [] })
  n.cargoLinks.push({ id: 'other', endpointA: end('C'), endpointB: { outpostId: 'B', cargoPadId: 'second' } })
  const before = rule.validate(n, fuelReference)
  assert.deepEqual(before.map(issue => issue.cargoLinkId), ['other', 'route'])
  n.outposts.reverse()
  n.cargoLinks.reverse()
  for (const link of n.cargoLinks) [link.endpointA, link.endpointB] = [link.endpointB, link.endpointA]
  assert.deepEqual(rule.validate(n, fuelReference), before)
})
