import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  createHistoryBenchmarkController,
  createRepresentativeBenchmarkCollection,
} from '../src/dev/historyBenchmark.ts'

test('representative baseline follows the supplied mature-network scale', () => {
  const collection = createRepresentativeBenchmarkCollection()
  assert.deepEqual(collection.networks.map(({ network }) => ({
    outposts: network.outposts.length,
    pads: network.outposts.reduce((sum, outpost) => sum + outpost.cargoPads.length, 0),
    links: network.cargoLinks.length,
  })), [
    { outposts: 9, pads: 19, links: 8 },
    { outposts: 14, pads: 44, links: 21 },
  ])
})

test('representative workload creates legitimate deterministic history and restores context', () => {
  const first = createHistoryBenchmarkController()
  const second = createHistoryBenchmarkController()
  const firstResult = first.runTo(120)
  second.runTo(120)
  assert.equal(firstResult.historyDepth, 120)
  assert.equal(firstResult.undoDepth, 120)
  assert.equal(firstResult.redoDepth, 0)
  assert.deepEqual(first.getSession().collection, second.getSession().collection)
  assert.deepEqual(first.getSession().context, second.getSession().context)
  const labels = first.getSession().history.past.map(({ label }) =>
    String(label.parameters?.label ?? label.key))
  assert.ok(labels.some((label) => label.includes('add outpost')))
  assert.ok(labels.some((label) => label.includes('cargo link')))
  assert.ok(labels.some((label) => label.includes('manufacturing')))
  assert.ok(labels.some((label) => label.includes('Planned Supply')))
  assert.equal(new Set(first.getSession().history.past.map(({ timestamp }) => timestamp)).size, 120)
})

test('whole-collection replacement records distinct deterministic import graphs', () => {
  const controller = createHistoryBenchmarkController('replacement')
  const repeat = createHistoryBenchmarkController('replacement')
  const result = controller.runTo(25)
  repeat.runTo(25)
  const entries = controller.getSession().history.past
  assert.equal(result.historyDepth, 25)
  assert.ok(entries.every(({ label }) => label.key === 'history.importNetworks'))
  assert.ok(entries.every(({ after }) => after.collection.networks.every(
    ({ network }) => network.character.level !== null && network.character.level <= 999,
  )))
  assert.equal(new Set(entries.map(({ after }) => after.collection)).size, 25)
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    assert.notEqual(entry.before.collection, entry.after.collection)
    assert.notEqual(entry.before.collection.networks[0].network,
      entry.after.collection.networks[0].network)
    assert.notEqual(entry.before.collection.networks[0].network.outposts,
      entry.after.collection.networks[0].network.outposts)
    assert.notEqual(entry.before.collection.networks[0].network.outposts[0],
      entry.after.collection.networks[0].network.outposts[0])
    if (index > 0) {
      const previous = entries[index - 1].after.collection
      const current = entry.after.collection
      assert.notEqual(previous, current)
      assert.notEqual(previous.networks[0].network, current.networks[0].network)
      assert.notEqual(previous.networks[0].network.outposts,
        current.networks[0].network.outposts)
      assert.notEqual(previous.networks[0].network.outposts[0],
        current.networks[0].network.outposts[0])
    }
  }
  assert.deepEqual(controller.getSession().collection, repeat.getSession().collection)
  assert.deepEqual(entries.map(({ before, after }) => ({ before, after })),
    repeat.getSession().history.past.map(({ before, after }) => ({ before, after })))
  assert.deepEqual(result.context, controller.getSession().context)
})

test('browser benchmark hook is guarded by both DEV and an explicit query parameter', async () => {
  const mainSource = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8')
  assert.match(mainSource, /import\.meta\.env\.DEV/)
  assert.match(mainSource, /has\('historyBenchmark'\)/)
  assert.doesNotMatch(mainSource, /<[^>]*HistoryBenchmark/)
})
