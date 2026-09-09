# History benchmark

The development-only history harness measures how the existing whole-collection
Undo/Redo implementation behaves as legitimate editing transactions accumulate.
The completed investigation supports the production policy of retaining the
newest 1,000 collection-global session history entries.

## Node benchmark

Run the default representative checkpoints (250 through 10,000):

```sh
npm run benchmark:history
```

Run selected checkpoints:

```sh
npm run benchmark:history -- --checkpoints 250,500,1000,2000
```

Run the separate whole-collection import/replacement stress case:

```sh
npm run benchmark:history -- --workload replacement --checkpoints 100,250,500
```

The representative baseline mirrors the two mature shapes in the implementation
brief (9 outposts/19 pads/8 links and 14 outposts/44 pads/21 links). A deterministic
24-operation cycle mixes small value edits, location and biome choices, resource
and production toggles, manufacturing, Planned Supply, cargo-pad/link edits, and
lower-frequency membership changes. Navigation is deliberately outside measured
history. Replacement runs perform repeated whole-collection replacements using
distinct deterministic collection graphs via the same `replace-collection`
action used by import. Each transaction constructs fresh nested networks,
outposts, cargo pads, and cargo links to approximate low-structural-sharing
import history.

Results include cumulative and incremental build time, history/Undo/Redo depth,
working context, 1/10/100-step Undo and Redo timings, and V8 memory values. The npm
command enables explicit GC and samples `process.memoryUsage()` after GC. These
figures are comparative Node diagnostics, not authoritative browser memory.

## Manual browser heap workflow

Start the normal dev server, then open the application with
`?historyBenchmark` in the URL. This gate exists only in Vite development builds
and adds no visible UI. In Chrome DevTools, create a controller:

```js
const benchmark = starfieldHistoryBenchmark.create()
benchmark.runTo(500)
benchmark.runTo(1000)
benchmark.runTo(2000)
benchmark.runTo(5000)
```

Pause between calls, use DevTools to force garbage collection, and take a heap
snapshot. `performance.memory` is included when Chrome exposes it, but DevTools
heap snapshots remain the browser measurement source. Use
`starfieldHistoryBenchmark.create('replacement')` for replacement stress.

Checkpoint sampling traverses real Undo/Redo entries and verifies that the saved
Network + Outpost context is restored at every step and that traversal returns to
the exact checkpoint collection.

## Browser measurements and retention decision

Representative Chrome heap snapshots measured:

| History entries | Heap snapshot total |
| ---: | ---: |
| 500 | 20.7 MB |
| 1,000 | 21.0 MB |
| 2,000 | 21.4 MB |
| 5,000 | 22.8 MB |

Distinct whole-collection replacement Chrome heap snapshots measured:

| History entries | Heap snapshot total |
| ---: | ---: |
| 250 | 32.8 MB |
| 500 | 37.4 MB |
| 1,000 | 47.0 MB |

These are Chrome heap-snapshot totals taken after snapshot-triggered garbage
collection. Representative history demonstrates very strong structural sharing.
Distinct replacement history is substantially heavier and grows roughly
linearly, but even that stress case remains modest at 1,000 entries.

The application therefore retains the newest 1,000 collection-global session
history entries and discards older entries as the bound is exceeded. This is a
generous defensive session bound, not an indication that entry 1,001 is unsafe.
