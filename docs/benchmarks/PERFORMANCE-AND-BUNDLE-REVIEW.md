# Performance and bundle review

18 September 2026 · `staging` · read-only product audit. The supplied brief was untracked before this review; no application or deployment file was edited.

## 1. Executive summary

The current **535,207-byte JavaScript / 142.58 kB Vite gzip** chunk triggers Vite's 500 kB advisory, but this review found no demonstrated ordinary-use defect caused by that threshold. The single chunk contains React DOM, application UI/domain code, and bundled localization. The 13 required JSON assets total 2,762,769 raw bytes and about 105,698 bytes under local Brotli compression. Local file-backed execution of the actual reference loader took 18–24 ms after its first run; network time and browser mount/paint were not included. The integrity gate remains reasonable for this dataset on available evidence.

Five-run Node medians for active-network validation rose from 2.3 ms for the 2-network/24-outpost fixture to 41–65 ms for deliberately extreme 96-outpost fixtures. Ninety-six outposts is a conjectural, effectively non-realistic user state; these are reassuring upper-stress observations, not an optimization target. **No performance issue was demonstrated and no production optimization is currently warranted.** A controlled browser Performance/Network pass against a release candidate would resolve the unmeasured deployed timing, memory, and cache questions.

## 2. Environment and methodology

- Windows desktop, Node `v24.21.0`, npm `11.19.0`, Vite `8.2.1`, Rolldown `1.2.4`; installed Edge `153.0.4234.32` and Chrome `153.0.8010.48`. CPU/RAM and the in-app browser's Chromium build were not exposed for this run. No CPU throttling result is claimed.
- `npm run build` produced `dist/`. A separate transient `npx vite build --sourcemap --outDir .local-work/bundle` supplied source-map attribution. It did not change Vite config or shipped output. Byte allocations from minified source-map spans are **approximations**, not exact savings from removing a module; about 60 kB is unmapped or outside attributable spans. The transient map is not in `dist/`.
- Existing `benchmark:import-capacity` fixtures were run five times per selected shape in Node through Vite's module loader. The benchmark uses an in-memory `localStorage` stand-in, so its write timings cover validation/serialization and stand-in assignment, not disk-backed browser storage or React paint. Existing `benchmark:history` used explicit GC and immutable reducer operations. A separate local Edge storage measurement from [Browser storage capacity benchmark](BROWSER-STORAGE-CAPACITY-BENCHMARK.md) is cited as historical supporting evidence, not rerun here.
- A transient `.local-work/reference-gate-bench.mjs` invoked the unmodified loader with file-backed `Response` objects: one first run and eleven repeat runs. It excluded HTTP, Vite module loading, React mount, and paint. Ten isolated SHA-256 and JSON.parse passes used the same 13 file bytes. Concurrent fetch/hash wall-time sums overlap and are not added to loader duration. A separate GC-assisted Node parse measured an indicative reference-object heap delta; it is not a browser heap snapshot. Transient scripts and source maps were removed after recording results.
- The in-app browser loaded the local production preview at `127.0.0.1:5177` and the deployed production origin. Its asset inventory and DOM were inspectable, but its read-only page evaluation did not expose `performance`, Resource Timing, heap, long tasks, transfer bytes, response headers, or CPU throttling. An automated click's several-second tool round trip is **not** an input-latency measurement. Staging redirected to a Cloudflare Access login, so no staging app timing was taken. The generic web fetch and shell `curl` could not retrieve production headers in this environment.

## 3. Production bundle composition and split candidates

| Emitted class | Files | Raw | Local gzip / Vite display | Notes |
| --- | ---: | ---: | ---: | --- |
| JavaScript | 1 | 535,207 B | 141,143 B / 142.58 kB | One eager module, no lazy production chunk |
| CSS | 1 | 53,362 B | 8,906 B / 8.90 kB | Includes external font CSS import |
| HTML | 1 | 572 B | 0.33 kB displayed | No inline application JS |
| Reference JSON and manifest | 14 | 2,764,610 B | 159,197 B local gzip | 13 assets plus manifest |

There are 23 output files in `dist/` including `_headers`, the reference `404.html`, favicon sizes, `icons.svg`, and `robots.txt`. There is **no production `.map`**. The output's only build warning was Vite's large-chunk advisory. The extra source-map build was diagnostic only.

Approximate minified source-map span attribution: `react-dom` **178 kB**, `react` **7.8 kB**, `scheduler` **3.5 kB**, localization **129 kB**, other app source **156 kB**, and about **60 kB** not attributed by this method. The largest individual spans were `react-dom-client.production.js` **175 kB**, generated Japanese reference names **81 kB**, `en-US` **25 kB**, `App.tsx` **19 kB**, `ja-JP` **19 kB**, and `OutpostStatusMatrix.tsx` **13 kB**. The loader itself accounts for about **4 kB** of mapped span. These are raw mapped spans, not compressed module sizes or independent removable chunks.

`npm ls` showed one deduplicated React 19.2.8/React DOM 19.2.8 tree and Scheduler 0.27.0. `csv-parse` is present for build/data scripts and absent from the mapped browser bundle. No Vitest, Testing Library, Node build tooling, or the development-only `historyBenchmark` chunk appeared. Static imports of the English/Japanese catalogues and generated Japanese names explain the localization share.

| Candidate | Rough upper bound from mapped raw span | Startup role / cost | Assessment |
| --- | ---: | --- | --- |
| Japanese reference-name overlay | ~81 kB | English startup does not need Japanese names, but locale switching does; asynchronous locale loading changes provider/error flow | Plausible bytes, unmeasured user benefit; backlog only if cold-start trace shows cost |
| Import/export and recovery code | Several modules, each ~2–6 kB | User-initiated, but splitting adds a download and import/error boundary | Likely too small to notice; no action |
| Matrix/secondary editor surfaces | Matrix ~13 kB; Cargo Pads editor ~8 kB mapped | Matrix is the primary selected-outpost workspace; deferral could delay normal use | Poor split candidate |
| About/rare dialogs | Small | Truly optional, but savings below measurement noise here | No action |

The **single-chunk approach is acceptable** on current evidence. Splitting merely to remove the warning would add complexity and deployment-version exposure without a measured interaction gain.

## 4. Reference-data footprint and startup gate

Local compression below uses Node `zlib` defaults on individual files; it is a transfer *estimate*, not observed CDN wire traffic.

| File | Raw B | Local gzip B | Local Brotli B |
| --- | ---: | ---: | ---: |
| `biomes.json` | 23,941 | 2,302 | 1,443 |
| `bodies.json` | 397,777 | 18,566 | 11,523 |
| `body-biomes.json` | 340,369 | 30,831 | 17,563 |
| `body-resources.json` | 217,230 | 13,466 | 10,574 |
| `inorganic-occurrences.json` | 1,115,923 | 46,657 | 33,045 |
| `organic-farming-profiles.json` | 538 | 157 | 133 |
| `organic-occurrences.json` | 269,853 | 17,108 | 8,550 |
| `planet-species.json` | 261,306 | 13,624 | 10,157 |
| `product-recipes.json` | 13,642 | 996 | 898 |
| `products.json` | 3,546 | 773 | 693 |
| `resources.json` | 16,466 | 1,691 | 1,469 |
| `species.json` | 95,893 | 10,921 | 8,545 |
| `systems.json` | 6,285 | 1,346 | 1,105 |
| **13 assets** | **2,762,769** | **158,438** | **105,698** |
| `manifest.json` | 1,841 | 759 | 674 |

`ReferenceStartupGate` renders a pending placeholder and mounts `App` only after `loadReferenceData` resolves. The loader fetches and checks the manifest first, then starts all 13 fixed asset requests with `Promise.allSettled`; it verifies status/MIME/size, SHA-256, parsing, and lightweight row shape. Thus manifest round trip is serial, asset requests are parallel, and the slowest asset matters. The gate intentionally prevents editor initialization and storage writes on failure.

The file-backed loader's first invocation was **63 ms** in the final measurement run; eleven repeats were **18–24 ms**, median about **20.5 ms**. A prior 12-run session had 22–35 ms repeats and a 94 ms first run, showing warmup/host variation. Ten isolated sequential passes across all 13 assets took **5.6–6.3 ms for SHA-256** (median ~6.1) and **9.2–9.7 ms for UTF-8 decode plus JSON.parse** (median ~9.5). Measured parsing within the final full-loader repeats was about 8.7–10.3 ms. Shape-validation-only time was not separately instrumented; the remaining few milliseconds include response streaming/copying, validation, scheduling, and manifest work. Summed per-request file-read/hash times overlap because the loader runs requests concurrently. **Network wait, browser main-thread impact, and gate-start-to-`App` mount were not measured.**

On this local CPU, verification's intrinsic work is short relative to a human-noticeable delay. The data does **not** prove that a slow connection or CPU-throttled laptop sees the same gate time. No evidence warrants weakening the integrity model or lazy-loading required data.

## 5. Startup responsiveness and device baseline

The local production build rendered an interactive one-outpost editor and a populated resource matrix; the production origin loaded the same JS/CSS hashes and all 13 JSON paths. The browser inventory saw one manifest and one entry per asset on each settled page, with no captured console warning/error. A local default outpost had about **483 DOM elements** after load; this is a static count, not a paint cost. The production browser profile showed an empty outpost list, so it was not used as a representative matrix benchmark or mutated.

Time to initial HTML/CSS paint, pending-gate paint, `App` mount, first usable editor input, cold/warm browser navigation, scripting/rendering/network split, long tasks, layout shifts, and CPU-throttled behavior remain **unmeasured** in this run. The available browser API did not expose these traces. A narrow/mobile view was not tested; mobile is secondary to this release. The local loader numbers above must not be presented as end-to-end browser startup time.

## 6. Normal editing responsiveness

The local production build accepted an Add Outpost action and updated outpost count, selected detail, and Undo availability. Existing automated tests cover editing, cargo, resources, planning, Undo/Redo, locale, and storage semantics; they are functional checks, not frame-time measurements. No trustworthy click-to-paint timing was available through the browser surface. Source review found `App` owns a broad reducer and recomputes selected-outpost availability, validation, and matrix props after collection changes; `OutpostStatusMatrix` also derives rows and uses several memoized maps/sets. This can make link-dense active-network validation the dominant synchronous operation. No basis was found for blanket memoization.

Network selection, cargo-link edits, manufacturing changes, heavy tables, Undo/Redo, and locale switching were not separately timed in a real browser in this run. The earlier [import browser validation](IMPORT-CAPACITY-BROWSER-VALIDATION.md) reported ~265–296 ms network switches in a 64-network test and subsecond editing in Edge/Chrome/Firefox on its then-current build; that is historical, separate-fixture evidence and should not be merged with current Node medians.

## 7. Large-network / growth-headroom benchmark

Five-repeat medians from the current deterministic harness. The **large** fixture is eight 24-outpost networks; the other modded fixtures are one 96-outpost network. Ninety-six outposts is a conjectural, effectively non-realistic user state used to stress the implementation, not a target for normal-use optimization. Values measure JavaScript/domain work only. The harness deliberately permits some duplicate planning items, which domain validation reports; they do not represent a clean gameplay save.

| Shape | Networks / total outposts / links | Compact JSON | Full import | Active-network validation | Selected-outpost availability | Serialization / stand-in save |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Light | 1 / 5 / 3 | 5,047 B | 0.29 ms | 2.78 ms | 0.025 ms | 0.06 / 0.10 ms |
| Medium | 2 / 24 / 24 | 34,828 B | 0.75 ms | 2.31 ms | 0.026 ms | 0.21 / 0.27 ms |
| Large | 8 / 192 / 360 | 479,934 B | 12.28 ms | 4.73 ms | 0.031 ms | 3.54 / 3.56 ms |
| Modded 96 | 1 / 96 / 200 | 279,981 B | 4.57 ms | 40.92 ms | 0.055 ms | 1.73 / 1.66 ms |
| Balanced 96 | 1 / 96 / 192 | 434,731 B | 8.10 ms | 65.48 ms | 0.080 ms | 3.04 / 2.27 ms |

In the balanced 96 fixture, `unresolved-cargo-export` took ~30 ms and `interstellar-cargo-helium-3` ~12 ms in separate rule timing; these repeatedly traverse links and derived availability. Network breadth mainly affects import and serialization; active-network link/pad density affects validation disproportionately. Even under this extreme fixture, measured validation remained 41–65 ms in Node. Reducer switch/edit/Undo/Redo medians in these Node fixtures were at most a few hundredths of a millisecond, excluding React and validation. A synthetic reverse-ordered recipe chain took ~1.8/32/144 ms at 100/500/1000 recipes, but current canonical recipes contain 30 products; this is a stress curve, not normal usage.

The harness's `maximal` (32-network) case now exceeds the implemented 25,000-member external import cap; its `dense-96` has 500 links and exceeds the 256-link cap. Those cases stopped at expected capacity checks rather than producing timing results. The history fixture similarly stops making a distinct edit at operation 1000; its 999-entry result is valid, and automated tests cover correctness and pruning at/above the cap. These are **known benchmark limitations with no action needed** unless those specific stress benchmarks are revisited. No fixture here exercises the Cartesian maximum of every allowed field.

## 8. Persistence and localStorage

The collection is serialized to one localStorage key on collection changes. `trySaveNetworkCollection` synchronously stringifies the whole collection, checks the resource envelope, then calls `setItem` in an effect. Initial load synchronously gets/parses/migrates and attempts a normalized save. Import/export have additional strict validation and pretty serialization; failed imports are tested to preserve state. The current browser-storage envelope caps stored text at **4,194,304 UTF-16 units** and bounds members, arrays, strings, and depth. External import uses stricter limits.

The current Node fixtures range from 5 kB to 480 kB compact and took 0.1–3.6 ms for the stand-in save. The earlier real-Edge [storage capacity benchmark](BROWSER-STORAGE-CAPACITY-BENCHMARK.md) measured 1.0 MB dense and 2.0 MB paired collections: five-run median actual `setItem` ~2.7 and ~5.8 ms, full load ~9 and ~16 ms, and later edit-through-save ~5 and ~12 ms respectively. Those numbers predate some current implementation details but provide a real-browser order of magnitude. Its fresh-profile quota probe accepted 4 million ASCII units and rejected 6 million; it does not promise capacity for other profiles/origins. The app catches write failure and keeps in-memory edits/Undo history, as current tests confirm. Realistic saves have comfortable headroom; unusually broad or dense modded collections can approach the defensive envelope or browser quota. The normal per-change whole-collection write is synchronous, but no present visible stall was demonstrated.

## 9. Undo/Redo and memory

Each history entry retains immutable **before and after collection roots plus working context**. Structural sharing means an ordinary local edit does not deep-copy every network, but replacing/importing whole collections can retain two large roots. History is session-only and capped at **1000** entries; this is a defensive ceiling, not a realistic usage target. Realistic sessions are expected to top out around roughly **300–400 operations**. The reducer slices off oldest entries on overflow. Automated tests passed for exactly at cap, first overflow, larger overflow, and redo divergence.

The representative history benchmark (two networks, 9 and 14 outposts, 19 and 44 pads) used explicit Node GC. At 0 to 999 entries, heap used rose from **8.60 to 9.70 MiB**, about **1.10 MiB** incremental for that workload, or roughly **1.1 KiB/entry on average**. At depth 999, median reducer Undo and Redo steps over 100 traversals were ~**0.0016/0.0021 ms**. These exclude React work and are not a universal per-entry memory bound. Large collection replacements, repeatedly touched nested arrays, and retained redo branches could cost more, but 1000 such operations are not a realistic target. Pruning is correct by tests. Current ordinary history is an acceptable trade-off with no action indicated.

The 13 parsed reference arrays retained about **2.47 MB of additional Node heap** in one GC-assisted parse of 21,616 rows. This is indicative only: Node object layout and GC differ from Chromium. Raw response buffers are transient during the gate; the loader returns one parsed reference-data object, while consumers derive maps, sets, row lists, and validation data as needed. Source inspection found no second persistent full reference-data copy, global leaked listener, or saved derived index. A browser idle/large/history heap snapshot was unavailable, so no browser-memory ceiling is asserted.

## 10. Rendering and large tables

The default local editor's resource matrix was fully rendered at ~483 DOM elements. The matrix derives inorganic, organic, manufacturing, and import rows for the selected outpost; it does not render all 96 outposts' matrices simultaneously. The selected body's resource/species rows therefore matter more than total network count for matrix DOM size. Outpost navigation and cargo pad lists can grow with active-network size. The prior [import capacity benchmark](IMPORT-CAPACITY-BENCHMARK.md) reported jsdom subset rerenders for 24/96/128-outpost fixtures; those are not layout, paint, or frame measurements.

No current DOM/layout trace demonstrates an excessive cell count or reflow bottleneck. Virtualization would add keyboard, focus, accessibility, scrolling, and selection complexity. **Not warranted** without a real-browser large-fixture render trace.

## 11. Caching, network, Cloudflare, and fonts

Hashed JS/CSS names are suitable for cache reuse; stable reference JSON names require coherence checks. The loader requests the manifest and all assets with `cache: 'no-store'`, intentionally bypassing the browser's ordinary reuse/revalidation path and rechecking bytes on each load. This trades repeat-visit transfer/latency for reliable manifest-to-bundle and asset hash verification. `no-store` does **not** prove a CDN edge miss, nor does a 2.76 MB raw data total imply that many wire bytes; local Brotli puts the JSON group near 106 kB if the host applies equivalent compression. No actual `Content-Encoding`, `Cache-Control`, `Age`, cache status, 304, or wire-byte measurements were available here. The deployed production app was reachable and showed the same hashed JS/CSS and all 13 asset requests; staging required Cloudflare Access. A manually authenticated DevTools Network pass remains needed before changing cache policy.

`src/index.css` imports one Google Fonts stylesheet for Barlow Semi Condensed 400/500/600 and IBM Plex Mono 400/500 with `display=swap`. The local and deployed asset inventories observed that stylesheet; neither settled inventory in this browser exposed font-binary entries. A prior [production hosting readiness review](PRODUCTION-HOSTING-READINESS.md) observed three Barlow binaries on its English screen, so zero in this inventory must not be generalized. CSS defines local/system fallbacks, leaving the app usable if Google fails. Font response timing, cache status, layout shift, and render blocking were not measured. No evidence supports self-hosting now.

## 12. Warning review

| Warning | Evidence | Classification |
| --- | --- | --- |
| Vite `>500 kB` large chunk | Build emitted one 535.20 kB JS chunk; local functional load succeeded; no input/paint defect measured | **D — Advisory / no demonstrated impact** |
| Chromium `run-ad-auction`, `join-ad-interest-group`, `private-aggregation`, `attribution-reporting` | Known user-reported browser platform messages in the [CSP review](CLOUDFLARE-CSP-SECURITY-HEADERS.md); none appeared in this run's captured console and they are not application CSP violations | **D — Advisory / no demonstrated impact**, if reproduced in the same form |
| Other build/browser warnings | None captured in current build and local/production browser warning logs | **E — No issue found** within captured logs |

## 13. Findings and recommended actions

| Finding | Evidence | Classification | Recommendation | Timing |
| --- | --- | --- | --- | --- |
| Main JS chunk | 535,207 B raw, 142.58 kB Vite gzip; no measured ordinary-use delay | **D** | Keep single chunk; do not tune threshold solely to silence warning | Not pursued |
| Required reference gate | 18–24 ms warm file-backed loader; hashing ~6 ms and parsing ~9–10 ms in isolated local passes; deployed network/mount unknown | **D** | Preserve full pre-mount integrity check; measure deployed end-to-end before any change | Not pursued now |
| Link-dense validation stress test | 41–65 ms Node medians at a conjectural, effectively non-realistic 96 outposts | **D — Stress-test observation / no demonstrated impact** | No action; revisit only if real-world evidence shows a problem at realistic network sizes | Not pursued |
| localStorage / import | 0.3–8.1 ms Node full import for selected fixtures; prior Edge 2 MB edit-through-save ~12 ms | **E** for representative sizes, **C** near capacity | Retain bounds and write-failure handling | No action now |
| Undo/Redo | 999-entry representative run ~1.10 MiB additional Node heap; 1000 is a defensive cap, while roughly 300–400 operations are expected in realistic sessions; pruning tests pass | **E — No issue found** for measured workload | Retain current design; revisit only if real usage shows pressure | No action |
| Matrix rendering | Default editor ~483 DOM elements; no large browser paint trace | **D** | Keep current rendering; no virtualization | Not pursued |
| Cloudflare caching/compression | Production request inventory observed; headers, wire bytes, and cache status unavailable | **D — Measurement gap** | Capture cold/warm authenticated Network trace before changing `no-store` or CDN policy | Before release verification |
| Google Fonts | Stylesheet observed, fallbacks present; font timing/CLS unavailable | **D** | Keep current setup; check failed-font and CLS behavior in a release smoke profile | Before release verification |
| Benchmark harness limits | Some import fixtures exceed current caps; history operation 1000 does not create a distinct edit, while automated tests cover cap correctness | **D — Known benchmark limitation / no demonstrated impact** | No action unless those specific stress benchmarks are needed again | Not pursued |

**A — Measurable user-facing issue:** none demonstrated by this run. The absence of a measured issue is bounded by missing controlled browser cold/warm, throttled-CPU, frame, and heap traces. **No production optimization is currently warranted.** The extreme 96-outpost and 1000-entry scenarios do not create product or benchmark-maintenance work on their own.

Explicitly **not warranted**: weakening the fail-closed gate, lazy-loading required integrity data, generic memoization, code splitting merely to cross below Vite's threshold, matrix virtualization, an Undo/Redo redesign, changing `cache: 'no-store'`, a service worker, or self-hosting fonts. Each adds behavior or maintenance risk without a measured user benefit here.

## 14. Reproduction and limits

From repository root, on `staging`:

```powershell
git status --short
git branch --show-current
node --version
npm run build
npm run benchmark:import-capacity -- --names light,medium,large,modded-96,balanced-96 --repeats 5
npm run benchmark:history -- --checkpoints 0,250,500,750,999
npm run test
npm run reference:test
npm run test:components
npm run lint
git diff --check
```

For byte attribution, the transient command was `npx vite build --sourcemap --outDir .local-work/bundle`, followed by a temporary Node script using the already-installed `@jridgewell/sourcemap-codec` and Node `zlib`. For gate timing, a temporary Vite `ssrLoadModule` harness replaced only `fetch` with local file-backed `Response` objects and instrumented the actual loader; a separate temporary Node loop timed SHA-256 and parse passes. The scripts and diagnostic build were removed. Reproduce the browser inventory by serving `dist/` with `npm run preview -- --host 127.0.0.1 --port 5177` in a disposable browser origin, and inspect the production origin separately. Do not use production localStorage for synthetic fixtures.

Required validation: `npm run build` passed (one chunk advisory); `npm test` **183/183 passed**; `npm run reference:test` **133/133 passed**; `npm run lint` passed; `npm run test:components` first had a focus-timing failure in `referenceIntegrity.test.tsx` while checks ran concurrently, then passed **52/52** on immediate standalone rerun. No implementation change was made between runs. `git diff --check` passed. A separate `git diff --no-index --check -- NUL docs/benchmarks/PERFORMANCE-AND-BUNDLE-REVIEW.md` produced no whitespace warning; its exit code 1 means the new file differs from the empty source. The initial failed benchmark commands and their cap/fixture causes are recorded above rather than omitted.

This report cannot establish real deployed cold/warm latency, exact browser transfer compression/cache behavior, first usable interaction, long tasks, throttled-device latency, full-app large-fixture rendering, DOM growth under every allowed shape, or browser heap/GC pressure. Those need an authenticated browser Performance/Network/Memory session with an isolated test profile and representative fixture. The current results support keeping the architecture as is while performing that targeted release verification.
