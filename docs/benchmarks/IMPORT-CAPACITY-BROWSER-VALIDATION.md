# Combined import capacity browser validation

## Scope and evidence sequence

This is a probe of the proposed envelope in [the import capacity benchmark](IMPORT-CAPACITY-BENCHMARK.md). It does not implement production limits or change import, history, storage, validation, or UI behavior.

Evidence was collected in three stages: deterministic fixture generation and schema checks; an automated Codex in-app-browser probe; then user-performed manual confirmation in Edge, Chrome, and Firefox. The in-app probe ran on 16 September 2026 on Windows 10 build 19045 x64, Intel Core i7-10700F (16 logical processors), 15.9 GiB RAM, and the Vite 8.2.1 development build. Its exact browser engine/version was not exposed. The manual results and exact named-browser versions are recorded below. These observations apply to the tested desktop environment; they are not guarantees for other operating systems, mobile browsers, Safari/WebKit, arbitrary hardware, or future browser versions.

Durations in the in-app results are end-to-end automation actions, including control overhead and application work. They are approximate observations, not isolated main-thread timings or an SLA. Its viewport was roughly 990 × 940. Console, heap, frame, and quota profiling were not performed. The later named-browser results are qualitative manual observations, not instrumented timings.

## Fixtures and candidate consistency

Generate both JSON files with `node scripts/browser-import-capacity-fixtures.mjs`. They are written under ignored `.local-work/browser-import-capacity-validation/`. The script reuses the deterministic benchmark generator, verifies a strict current-schema import round trip, counts **all array members recursively** (including smaller outpost arrays), and rejects any candidate-limit breach. Source/export size is the pretty JSON written for file import.

| Fixture | Networks | Outposts | Pads | Links | Manufacturing | Planned | Outbound | All members | Max string | Compact bytes | Source/export bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Dense | 1 | 96 | 1,152 | 256 | 1,152 | 1,920 | 19,584 | 24,545 | 4,096 | 1,012,195 | 3,031,409 |
| Broad | 64 | 468 | 1,872 | 680 | 2,808 | 3,744 | 9,360 | 20,868 | 26 | 1,074,141 | 2,782,589 |

The dense network has exactly 12 Cargo Link structures (`cargoPads`) at **every** outpost; the first several have connected remote endpoints, including inter-system links. Its 256 links use the network ceiling. The browser showed 4,647 ordinary diagnostics from accepted but questionable cargo/provenance and manufacturing states. The broad collection has 64 saved networks with six or eight outposts and at most 12 links per network. Both files are below 4 MiB, both collections are below 25,000 aggregate members, and all per-structure candidate ceilings are respected. These fixtures test the intersection of the limits, not every maximum simultaneously.

## Earlier Codex in-app-browser probe

| Workflow | Dense | Broad |
| --- | --- | --- |
| Import over nontrivial collection | File picker accepted JSON; 96 outposts rendered after replacing a two-network collection | File picker accepted JSON; 64 networks rendered after replacing dense collection |
| First render and navigation | No broken page or warning; last outpost and linked 12-structure outpost selected at about 370 ms each | Five successive network switches took about 265–296 ms per action; previous/next wraparound 1↔64 worked |
| Cargo Links | Expanded all 12 in about 276 ms; collapsed all in about 301 ms; opened two individual links; changed outbound Helium-3 in about 606 ms | Moderate four-pad outpost rendered during switching |
| Resource Matrix and planning | Searched Copper, opened results, selected an outpost from results, and removed a Planned Supply item in about 913 ms | Removed a Planned Supply item in about 295 ms |
| History | Cargo and planning edit Undo/Redo worked; import Undo restored the original two-network collection in about 267 ms; Redo restored dense in about 482 ms; a further edit after Redo also undid/redid | Edit Undo/Redo worked; import Undo restored dense in about 604 ms; Redo restored 64 networks in about 269 ms |
| Export | Export action showed the generated filename in app feedback | Export action executed, but no download event or saved file was exposed |
| Reload | Restored one network, 96 outposts, and edited outbound Helium-3 | Restored 64 networks; previous from first still reached network 64 |

The dense export filename incorporated the 4,096-unit character name and was impractically long. The app reported the export action, but this browser surface exposed neither a download event nor a saved file for either fixture. **The in-app probe alone did not verify file creation or export round-trip integrity.** The broad fixture avoids the long-name case; its download event was still unavailable. Serialization passed the generator's strict import round trip. The later named-browser tests verified real file export and re-import.

All 12 structures and their individual controls rendered. At the observed viewport, the Cargo Links column was narrow, each compact card used internal overflow, and expanding all 12 created a long scrolling editor. No control visibly overlapped or disappeared in the inspected viewport, but repeated 17-item outbound lists made the expanded view cumbersome. The header showed `12/6`, reflecting existing vanilla capacity display. Keyboard traversal, focus restoration, and nonvisible overflow were not fully audited. Linked destination names and inter-system markers appeared; related outposts were reachable via the outpost list and Matrix search. Direct linked-outpost navigation from a Cargo Link card was not separately verified.

Normal Undo/Redo remained usable for accepted imports and later edits in the in-app probe. Save/reload restored representative dense and broad state. This does not characterize storage quota or repeated-large-import memory pressure.

## Later manual desktop-browser confirmation

The following results were supplied after manual testing of both generated fixtures through the normal application workflow. They supplement, rather than replace, the earlier in-app probe.

| Browser and exact version | Dense fixture | Broad fixture |
| --- | --- | --- |
| Microsoft Edge 153.0.4234.32 (Official build) (64-bit) | Import, representative edit, import and edit Undo/Redo, export, exported-file re-import, and reload succeeded. Minor but noticeable lag stayed below approximately one second per operation. No crash, unresponsive warning, or functional loss. | Same workflow succeeded. Exported filename retained its timestamp; no noticeable lag. |
| Google Chrome 152.0.7977.83 (Official Build) (64-bit) | Same successful import, edit, history, export, re-import, and reload behavior as Edge. Minor but noticeable sub-second lag; no crash or unresponsive warning. | Same successful workflow as Edge; no noticeable lag. |
| Mozilla Firefox 156.0 (64-bit) | Same successful functional result as Edge and Chrome. Minor but noticeable sub-second lag of approximately the same magnitude; no crash or unresponsive warning. | Same successful workflow as Edge and Chrome; no noticeable lag. |

The manual tests confirm normal Undo/Redo for collection replacement and representative edits, successful save/reload, and real exported files that re-imported. The dense 12-structure outposts preserved functionality in all three browsers. Navigating and expanding many structures was cumbersome, but still technically usable. This makes **12 Cargo Link structures per outpost an acceptable upper technical boundary** in the tested environment. Current evidence supports neither raising it above 12 nor lowering it below 12. The backlog separately records that legitimate modded users may exceed it.

### Export filename follow-up

Edge successfully exported and re-imported the dense file, but the 4,096-unit character name caused the resulting filename to be truncated and its timestamp suffix to be lost. The broad fixture's shorter name produced an untruncated filename with the timestamp appended normally. Chrome and Firefox also exported and re-imported successfully; the brief does not report their exact dense filename behavior.

This is a filename-construction concern, separate from the technical ceiling for persisted strings. A future change should bound or sanitize the character-name fragment used in export filenames while reserving room for stable suffixes such as the timestamp and `.json`. No exact fragment limit is decided here.

## Validated candidate envelope

The named-browser gate is complete for the tested Windows desktop environment. The dense fixture remained functional with minor, noticeable sub-second latency; the broad fixture remained functional without noticeable latency. The tested candidate envelope is **validated for this environment** and may proceed to a separate production implementation stage. No ceiling is reduced based on these observations.

| Boundary | Intended ceiling |
| --- | ---: |
| Input file | 4 MiB |
| Saved networks | 64 |
| Outposts per network | 96 |
| Cargo Link structures (`cargoPads`) per outpost | 12 |
| Cargo Links per network | 256 |
| Manufacturing entries per outpost | 256 |
| Planned Supply entries per outpost | 256 |
| Outbound items per cargo pad | 128 |
| Aggregate persisted array members | 25,000 |
| Any persisted string | 4,096 UTF-16 code units |

Aggregate persisted array members means **the sum of the lengths of all arrays recursively in the persisted collection**. This report validates the candidate boundaries in combination through the two fixtures, not the Cartesian product of all maxima. No production capacity limit is implemented by this documentation update.

The existing benchmark identifies repeated provenance/availability work in `unresolved-cargo-export` and `interstellar-cargo-helium-3` as expensive paths. This probe did not optimize them. A later task can profile those rules in a named browser if stalls emerge.

## Manual smoke test

The JSON is generated; no hand editing is needed. To repeat the completed manual validation on a future browser version or machine, run the generator above, start `npm run dev`, then in each browser:

1. Start with a nontrivial collection; import `.local-work/browser-import-capacity-validation/dense-import-envelope.json` through **Import**.
2. Select Outpost 96, then Outpost 1; expand all 12 structures, edit outbound cargo, use Resource Matrix, and edit Planned Supply.
3. Switch outposts; Undo/Redo edits; Undo/Redo import; edit again after Redo.
4. Export and confirm a real file exists and re-imports; reload and check 96 outposts and the edited item.
5. Import `.local-work/browser-import-capacity-validation/broad-import-envelope.json`; switch networks, test wraparound and outpost selection, edit, Undo/Redo edit and import, export, and reload to confirm 64 networks and order.
6. Record exact browser version and any warning, long pause, clipping, focus loss, keyboard trap, or failed file/storage operation.

## Verification

Passed: `node scripts/browser-import-capacity-fixtures.mjs`; `npm run benchmark:import-capacity -- --names wide-pad-96,dense-96 --repeats 3`; `node --experimental-strip-types --test tests/collectionEditingSession.test.ts tests/serialization.test.ts tests/externalImportValidation.test.ts` (16 tests; the latter two paths had no tests in this checkout); `npx vitest run tests/importCapacityRender.test.tsx --reporter=verbose --silent=false` (2); `npm test` (162); `npm run test:components` (26); `npm run build`; `npm run lint`; `git diff --check`. The build emitted the existing large-chunk advisory. No dependency or production capacity limit was added.

After incorporating the manual results and moving both capacity reports under `docs/benchmarks/`, repository path/reference checks passed, as did a fresh `npm test` (162), `npm run test:components` (26), `npm run build`, `npm run lint`, and `git diff --check`. The manual browser observations above were supplied separately; these repository commands did not rerun the browser workflows.
