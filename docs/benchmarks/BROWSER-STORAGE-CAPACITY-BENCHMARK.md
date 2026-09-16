# Browser storage capacity benchmark

> Implementation update (16 September 2026): The proposed inclusive browser
> envelope below is implemented in `src/data/storageEnvelope.ts`, independently
> of external import. The measurements and former-state descriptions below
> remain the rationale rather than a description of current load behavior.

## Scope and environment

Focused production-bound design probe on 16 September 2026. No production load, save, migration, import, history, or UI behavior changed. This follows [the browser-storage recovery audit](../audits/BROWSER-STORAGE-RECOVERY-PROBE.md) and uses the validated fixtures from the [import browser validation](IMPORT-CAPACITY-BROWSER-VALIDATION.md). The settled recovery policy remains authoritative: oversized or incoherent source data must not be overwritten merely because fallback occurred.

Measurements used installed **Microsoft Edge 153.0.4234.32** (64-bit Windows, headless Chromium mode), determined from the installed executable's product version. Edge's reduced user-agent reported `Edg/153.0.0.0`. Vite 8.2.1 served a temporary local-only page at `127.0.0.1:5174`, separate from the normal app origin. A fresh isolated Edge profile and dedicated quota key were used; gameplay and quota keys were removed after the probe. The page used the browser Performance API and actual `localStorage`, imported the current storage, migration and reducer modules, and displayed results read through a local debugging connection. The warm browser's first-control render was observed by a script installed before navigation. Timings below are five-run medians per storage stage and three reloads per rendered fixture. They are observations on this machine/profile, not portable latency guarantees.

## Lifecycle and fixtures

Current `loadNetworkCollection` synchronously calls `getItem`, `JSON.parse`, `migrateStoredNetworkData`, `JSON.stringify`, and `setItem`, even for a current-shape collection. The loader does **no separate complete current-shape validation or normalization pass** after migration; that requested timing category is included in the migration stage. `App` then initializes its collection session and saves again in an effect. A later collection edit updates the reducer/history and the effect saves the entire collection. These boundaries are described in the linked audit.

`node scripts/browser-import-capacity-fixtures.mjs` regenerated the established dense and broad source files. The ignored `.local-work/storage-capacity-fixtures.mjs` reused the same deterministic `createFixture` and reference data to make **two dense, 96-outpost modded networks**, with 12 pads and 256 links per network. It is intentionally larger in aggregate without increasing the active network's density or saturating every possible maximum. All three fixtures are current-schema JSON. The generator wrote temporary compact JSON files to `public/` solely for the local browser probe; these are removed after measurement.

| Fixture | Stored UTF-16 units | Stored UTF-8 bytes | All array members | Networks | Total outposts | Pads | Links | Longest string |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Dense | 1,012,195 | 1,012,195 | 24,545 | 1 | 96 | 1,152 | 256 | 4,096 |
| Broad | 1,074,141 | 1,074,141 | 20,868 | 64 | 468 | 1,872 | 680 total, at most 12/network | 26 |
| Larger modded pair | 2,020,243 | 2,020,243 | 49,090 | 2 | 192 | 2,304 | 512 total, 256/network | 4,096 |

All stored strings in these generated fixtures are ASCII, so code-unit and UTF-8 byte counts coincide. The prior *pretty-printed external files* were 3,031,409 bytes dense and 2,782,589 bytes broad; the app writes compact JSON after migration. The source and normalized compact lengths matched for each current-schema fixture. The larger fixture exceeds the external import's 25,000-member aggregate limit but is recoverable through browser storage.

## Real-browser storage load and later save

Each stage was timed separately on the same source, then the actual `loadNetworkCollection` was timed end to end after restoring that source. The action stage applied a normal immutable character-name edit with `collectionEditingSessionReducer`, then serialized and wrote the changed whole collection. Its total is reducer through completed `setItem`, without React scheduling or paint. All writes and load round trips succeeded.

| Fixture | `getItem` | `JSON.parse` | Migration/current handling | `JSON.stringify` | `setItem` | Actual loader total | Edit reducer | Later stringify | Later `setItem` | Reducer through saved edit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Dense | <0.1 | 3.1 | 0.5 | 1.4 | 2.7 | 9.0 | 0.1 | 2.4 | 2.6 | 5.0 |
| Broad | <0.1 | 3.1 | 0.7 | 1.4 | 2.7 | 8.0 | 0.1 | 1.3 | 2.9 | 4.2 |
| Larger modded pair | <0.1 | 6.6 | 0.5 | 2.9 | 5.8 | 16.1 | <0.1 | 5.5 | 6.1 | 11.6 |

All values are **milliseconds, five-run medians**. `getItem` rounded to 0.0 at the browser's roughly 0.1 ms reporting resolution; it was performed and did not cost literally zero. Stage medians do not sum exactly to the independently timed loader median. Observed loader ranges were 6.7–9.0, 7.4–8.1, and 14.4–17.8 ms; later saved-edit ranges were 4.6–8.2, 3.9–5.5, and 10.6–15.8 ms respectively. These isolated storage/edit operations were imperceptible in this profile.

The first rendered network controls in the actual app appeared at these times after warm reload navigation: dense **309–351 ms** (median 344), broad **108–124 ms** (median 115), larger **346–387 ms** (median 362). The displayed ordinals were `1 / 1`, `1 / 64`, and `1 / 2`, with 129, 31, and 129 main-area buttons respectively, confirming the fixture reached the UI. An earlier first dense navigation was about 588 ms before the repeated warm measurements. These first-control times include document/module work, React and active-network computation; they are **not** isolated storage timings or paint/frame measurements. Dense and larger were noticeable but acceptable here; broad was short. The larger pair kept the same dense active network, so its extra storage work was small relative to rendering that network.

## Quota and pathological observations

A dedicated key received one ASCII string at a time, removed between steps, after fixture keys had been cleared. In this fresh Edge profile, `setItem` succeeded at 1,000,000 units (3.1 ms), 2,000,000 (7.4 ms), and 4,000,000 (13.1 ms); a 6,000,000-unit attempt threw **`QuotaExceededError`**. The failed step was the stopping point. This does not locate the exact quota, account for other origin data, or guarantee that a 4-million-unit collection will save in a populated profile. The fixture writes themselves succeeded. The browser quota, the application's defensive safety ceiling, and acceptable UI latency are separate constraints.

The ignored `.local-work/storage-capacity-pathology.mjs` exercised an illustrative iterative guard **only in Node**, never in the browser or production code. It accepted all three fixtures and rejected: a 4,194,305-unit string before invoking the parse stub; 1,000 levels of nested arrays at depth 65; 80,000 array members while each array was individually within its ceiling; and a 20,000-unit string. A large raw string can be refused before `JSON.parse`. Compact arrays and nested unknown properties need a bounded post-parse traversal **before migration**, with aggregate, per-array, string and depth checks. The current loader lacks that ordering. Even a raw limit cannot avoid allocation of the already-read storage string; it prevents additional parse/migration and normalized-write work.

## Scaling and recommended independent envelope

The pair approximately doubled compact storage size and member count against dense; parse and `setItem` roughly doubled while migration stayed below 1 ms in the warm median. The active dense network drove the much larger first-control time. Prior import benchmarks found that link density and outbound/provenance validation can grow disproportionately even in a relatively small JSON string. A raw limit alone therefore cannot bound expensive concentrated arrays. The following **proposed production acceptance limits are inclusive**; any value above a ceiling is an unrecoverable-for-now storage load whose source must be preserved, not silently trimmed or overwritten.

| Dimension | Proposed ceiling | Definition and reason |
| --- | ---: | --- |
| Raw stored value | **4,194,304 UTF-16 code units** | Check `storedValue.length` immediately after `getItem`, before parse. This gives about 2.1× room over the larger compact fixture and more than 4× over each baseline, while remaining near a size successfully written in this one profile. It is a code-unit limit, not the external 4 MiB file-byte limit or a promise of quota availability. |
| Aggregate members | **65,536** | Sum the lengths of **all arrays recursively**, including unknown/historical fields, stopping as soon as the total exceeds this number. It admits the 49,090-member pair with 33% headroom and caps broad or concentrated graphs. |
| Networks | **128** | Saved-network array length; twice the broad baseline. |
| Outposts per network | **128** | Modded headroom above 96 while limiting active-network render and validation cost. |
| Pads per outpost | **16** | Headroom above dense's 12 while bounding repeated card/UI work. |
| Links per network | **384** | Headroom above dense's 256, below the previously measured 500–700-link dense cases with disproportionate validation cost. |
| Outbound items per pad | **256** | Bounds one pad's provenance/validation fanout; twice the external ceiling. |
| Other arrays, including manufacturing and Planned Supply per outpost | **512 each** | A generic per-array maximum catches a concentrated malformed/historical array without a separate ceiling for every field. Thus each manufacturing and Planned Supply array is at most 512. More specific limits above take precedence. |
| Every string value and object key | **16,384 UTF-16 code units** | Four times the external string ceiling; avoids one enormous label/ID consuming the raw budget or rendering an unbounded text node. Preserve smaller historical/modded strings. Export filename handling remains a separate issue. |
| Nesting depth | **64 edges from root at depth 0** | Reject any value deeper than 64, using an **iterative** traversal. This independent limit stops deeply nested unknown state while avoiding recursion overflow in the guard. The expected persisted model is far shallower. |

These are resource ceilings, **not domain validity or automatic repairs**. The dimensions are deliberately separate from external import's strict 4 MiB bytes, 25,000 members, 64 networks, 96 outposts, 12 pads, 256 links, 128 outbound, 256 manufacturing/Planned Supply, and 4,096-unit strings. The browser policy has more room and retains historical migration; it should reject an over-budget stored graph as a whole and preserve raw source. The generic 512 array ceiling plus selected active-render/relationship ceilings is the smallest practical set found here: raw and aggregate caps limit total work, while per-array caps prevent a single cheap-looking but expensive fanout. The depth and string checks handle distinct shapes that member counts miss. Maximum values are a conservative proposal supported by baseline/pair timings and earlier dense/link stress data, **not** a measurement of every Cartesian combination at the ceilings.

## Future defensive ordering and recovery

1. Catch `getItem`/unavailable-storage errors and keep a usable in-memory fallback with visible recovery status.
2. For a nonempty raw string, check the inclusive code-unit ceiling **before** `JSON.parse`.
3. Parse, then iteratively traverse the entire source graph with early exits for depth, every string/key, aggregate members and scoped array lengths; do not silently delete a bad saved network.
4. Perform deterministic historical migration only after that resource check; validate the coherent current shape/recovery decision without dropping ambiguous user intent.
5. Initialize usable in-memory state and attempt a normalized save separately from load/migration errors. Preserve the original serialized source on rejection or failed re-save; coordinate the mount autosave so fallback cannot overwrite it.
6. Keep edits and Undo/Redo in memory on later save failure, display persistent unsaved status, and retry on later normal save opportunities. Clear the warning on successful save.

The ceiling also has to be considered on later writes: an allowed loaded collection can grow through normal edits, and quota can fail below the application ceiling. Report failure without rolling back in-memory work. A future implementation should explicitly decide how to communicate reaching its own cap through edits, without treating the browser's quota as validation.

## Remaining uncertainty and verification

This was headless Edge on one desktop machine and a fresh profile; it did not profile heap, paint, frame response, populated-profile quota, mobile/WebKit, or real later UI click-to-persistence latency. Warm startup samples vary with module cache and JIT. The larger pair tests breadth of two dense networks, not a more concentrated 128-outpost/384-link active network. The proposed ceiling has measured acceptance margin for the three fixtures, but a follow-up implementation should exercise exact boundaries and whole-App failure recovery tests. No exhaustive quota survey is warranted by this brief.

Commands/results:

- `node scripts/browser-import-capacity-fixtures.mjs`: regenerated both baseline fixtures and checked strict import round trips.
- `node .local-work/storage-capacity-fixtures.mjs`: generated the larger deterministic fixture and printed all sizes/member counts.
- Local Vite server plus Edge 153 headless Performance API page, read via `.local-work/storage-capacity-read-cdp.mjs`: all fixture load/save and quota observations above. `.local-work/storage-capacity-render-cdp.mjs`: three actual-app warm reload observations per fixture; all controls and ordinals appeared.
- `node .local-work/storage-capacity-pathology.mjs`: all three legitimate fixtures accepted and all four pathological cases rejected by the proposed mock guard.

- Focused storage/migration/import/history tests: 44/44 passed; `npm test`: 170/170 passed; `npm run test:components`: 27/27 passed.
- `npm run build`: passed with the existing >500 kB Vite chunk advisory; `npm run lint`: passed.
- `git diff --check`: passed. As the new report is untracked, a separate `git diff --no-index --check -- /dev/null docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md` emitted no whitespace warnings (exit 1 means the new file differs from an empty file).

Only this report is intended as a deliverable; temporary browser probe assets and multi-megabyte JSON are not committed.
