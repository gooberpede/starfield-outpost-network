import { performance } from 'node:perf_hooks'
import { render, cleanup } from '@testing-library/react'
import { test, expect } from 'vitest'
import { createFixture, loadBenchmarkReferenceData } from '../scripts/import-capacity-benchmark.ts'
import { getAvailableItemsAtOutpost, getActuallyAvailableItemsAtOutpost } from '../src/domain/availability.ts'
import { LocalizationContext } from '../src/localization/LocalizationContext.ts'
import { translate } from '../src/localization/catalog.ts'
import { OutpostList } from '../src/ui/components/OutpostList.tsx'
import { OutpostStatusMatrix } from '../src/ui/components/OutpostStatusMatrix.tsx'
import type { OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'

const noop = () => {}

test('generated collections have deterministic current-schema structure', async () => {
  const refs = await loadBenchmarkReferenceData()
  const shape = { name: 'determinism', networks: 2, outposts: 12, pads: 6,
    links: 30, manufacturing: 4, planned: 8, outbound: 5 }
  const first = createFixture(shape, refs)
  expect(JSON.stringify(first)).toBe(JSON.stringify(createFixture(shape, refs)))
  expect(first.networks).toHaveLength(2)
  expect(first.networks[0].network.outposts).toHaveLength(12)
  expect(first.networks[0].network.cargoLinks).toHaveLength(30)
  expect(first.networks[0].network.outposts[0].cargoPads).toHaveLength(6)
})

function workspace(network: OutpostNetwork, refs: ReferenceData, selectedIndex: number) {
  const outpost = network.outposts[selectedIndex]
  return <LocalizationContext value={{
    locale: 'en-US', automaticLocale: 'en-US', localeOverride: 'en-US',
    setLocaleOverride: noop, t: (key, parameters) => translate('en-US', key, parameters),
  }}>
    <OutpostList outposts={network.outposts} maxOutposts={24}
      selectedOutpostId={outpost.id} onSelectOutpost={noop}
      onMoveOutpost={noop} onMoveOutpostUp={noop} onMoveOutpostDown={noop}
      onAddOutpost={noop} onDragActiveChange={noop} onHideNavigation={noop}
      hideNavigationControlRef={null} />
    <OutpostStatusMatrix outpost={outpost} network={network}
      resources={refs.resources} products={refs.products} referenceData={refs}
      availableItems={getAvailableItemsAtOutpost(outpost.id, network, refs)}
      actuallyAvailableItems={getActuallyAvailableItemsAtOutpost(outpost.id, network, refs)}
      onToggleResource={noop} onToggleExplicitResourcePresence={noop}
      onToggleActiveProduction={noop} onCommitManufacturing={noop} />
  </LocalizationContext>
}

test('representative outpost navigation and matrix renders remain measurable', async () => {
  const refs = await loadBenchmarkReferenceData()
  const rows = []
  const median = (values: number[]) => [...values].sort((a, b) => a - b)[1]
  for (const outpostCount of [24, 96, 128]) {
    const collection = createFixture({ name: 'render', networks: 2, outposts: outpostCount,
      pads: outpostCount === 24 ? 6 : 12, links: outpostCount * 3,
      manufacturing: 8, planned: 12, outbound: 6 }, refs)
    const first = collection.networks[0].network
    const second = collection.networks[1].network
    const mounts: number[] = []
    const selects: number[] = []
    const switches: number[] = []
    for (let repeat = 0; repeat < 3; repeat += 1) {
      const started = performance.now()
      const view = render(workspace(first, refs, 0))
      mounts.push(performance.now() - started)
      expect(view.container.querySelectorAll('button').length).toBeGreaterThan(outpostCount)
      const selectStart = performance.now()
      view.rerender(workspace(first, refs, outpostCount - 1))
      selects.push(performance.now() - selectStart)
      const switchStart = performance.now()
      view.rerender(workspace(second, refs, 0))
      switches.push(performance.now() - switchStart)
      cleanup()
    }
    rows.push({ outposts: outpostCount, mountMs: +median(mounts).toFixed(1),
      selectMs: +median(selects).toFixed(1), switchMs: +median(switches).toFixed(1) })
  }
  console.log(`import capacity component timings: ${JSON.stringify(rows)}`)
})
