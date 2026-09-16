# External import capacity benchmark

## Scope and environment

This is a design probe. No production import, validation, history, storage, or UI behavior changed. The attached 56,787 byte exported collection was read as an empirical baseline, but is not copied into the repository. It contains two networks, 23 outposts, 64 pads, 29 links, 20 manufacturing entries, five Planned Supply entries, and 47 outbound items.

Measurements ran on Windows NT 10.0.19045, an Intel Family 6 Model 165 machine with 16 logical processors, Node 24.19.0, npm 11.17.0, Vite 8.2.1, Vitest 5.0.0, and jsdom 30.0.1. Physical RAM could not be queried in this environment. Node used the Vite module loader to resolve application TypeScript imports; component measurements used Vitest/jsdom. The production build was verified but was not the timed runtime. No real Chromium timing, browser heap snapshot, or browser storage quota test was captured.

Run from the repository root:

```powershell
npm run benchmark:import-capacity -- --repeats 5 --sample 'C:\Users\User\Downloads\starfield-outposts-rhea-200-2026-09-14-134231.json'
npx vitest run tests/importCapacityRender.test.tsx --reporter=verbose --silent=false
```

The sample argument is optional. Without it, all generated fixtures still run. The harness prints JSON results; redirect standard output to a local file for analysis. Each Node stage is measured five times and reported as a median. For the attached sample, parse and full-import timings use the original supplied file text; downstream history, domain, serialization, and storage measurements use the normalized imported collection. Fixture generation is one timed pass. Timings are diagnostic, not portable latency promises. The jsdom values are medians of three mount, outpost selection, and network switch rerenders; they do not measure paint, input response, or the complete App component.

## Fixtures

The deterministic generator uses IDs from committed runtime reference data and current collection/network schemas. It builds resource production, manufacturing, Planned Supply, linked pads, and outbound selections. Synthetic identifiers are used only for stable object identity and the separate recipe-chain stress case. Some focused fixtures deliberately repeat semantically duplicate items: they are accepted by import structure checks and reported by ordinary domain validation. No generated JSON is committed.

| Fixture | Networks | Outposts | Pads | Links | Manufacturing | Planned | Outbound | Compact JSON | Export JSON |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 1 | 5 | 10 | 3 | 10 | 15 | 20 | 5 KiB | 12 KiB |
| Medium | 2 | 24 | 72 | 24 | 72 | 120 | 216 | 34 KiB | 84 KiB |
| Attached sample | 2 | 23 | 64 | 29 | 20 | 5 | 47 | 27 KiB | 55 KiB |
| Large, vanilla-sized networks | 8 | 192 | 1,152 | 360 | 768 | 1,152 | 4,608 | 469 KiB | 1,217 KiB |
| Maximal, vanilla-sized networks | 32 | 768 | 4,608 | 1,920 | 4,608 | 6,144 | 23,040 | 2,265 KiB | 5,899 KiB |
| Ultra-maximal, vanilla-sized networks | 100 | 2,400 | 14,400 | 6,000 | 14,400 | 19,200 | 72,000 | 7,089 KiB | 18,445 KiB |
| Modded 96, six pads/outpost | 1 | 96 | 576 | 200 | 576 | 768 | 2,880 | 273 KiB | 721 KiB |
| Modded 128, six pads/outpost | 1 | 128 | 768 | 250 | 768 | 1,024 | 3,840 | 362 KiB | 956 KiB |
| Balanced 96, eight pads/outpost | 1 | 96 | 768 | 192 | 768 | 1,152 | 6,144 | 425 KiB | 1,192 KiB |
| Balanced 128, eight pads/outpost | 1 | 128 | 1,024 | 256 | 1,024 | 1,536 | 8,192 | 567 KiB | 1,589 KiB |
| Wide pad 64, 12 pads/outpost | 1 | 64 | 768 | 192 | 512 | 768 | 6,144 | 391 KiB | 1,106 KiB |
| Wide pad 96, 12 pads/outpost | 1 | 96 | 1,152 | 256 | 768 | 1,152 | 9,216 | 579 KiB | 1,646 KiB |
| Dense 48 | 1 | 48 | 576 | 250 | 576 | 960 | 6,912 | 417 KiB | 1,191 KiB |
| Dense 64 | 1 | 64 | 768 | 320 | 768 | 1,280 | 9,216 | 553 KiB | 1,583 KiB |
| Dense 96 | 1 | 96 | 1,152 | 500 | 1,152 | 1,920 | 13,824 | 834 KiB | 2,381 KiB |
| Dense 128 | 1 | 128 | 1,536 | 700 | 1,536 | 2,560 | 18,432 | 1,119 KiB | 3,187 KiB |
| Manufacturing heavy | 1 | 8 | 16 | 4 | 16,000 | 32 | 32 | 727 KiB | 1,769 KiB |
| Planned Supply heavy | 1 | 8 | 16 | 4 | 32 | 40,000 | 32 | 1,402 KiB | 3,990 KiB |
| Outbound heavy | 1 | 8 | 32 | 12 | 32 | 32 | 32,000 | 1,126 KiB | 3,701 KiB |
| Links heavy | 1 | 128 | 2,048 | 1,000 | 256 | 256 | 4,096 | 590 KiB | 1,383 KiB |
| Strings heavy | 1 | 4 | 8 | 2 | 8 | 8 | 16 | 2,152 KiB | 2,157 KiB |

The three vanilla-sized families use 24 outposts and six pads per outpost in each network, but have 45 or 60 links rather than saturating all 72 possible pad pairings. The attached sample's **original source file is 56,787 bytes**; its normalized compact serialization is **27,913 bytes**, and its normalized pretty/export serialization is **56,787 bytes**. The strings fixture places 200,000 character values in character name, outpost name, outpost ID, system ID, a reference item ID, and a pad label. Its size comes almost entirely from strings rather than objects. All of these fields pass current external structure validation. Generated member count is the sum of network, outpost, pad, link, manufacturing, Planned Supply, and outbound array members; other small arrays are omitted from that count.

## Node results

Median milliseconds from the five repeat run. Import is the full `deserializeNetworkCollection` path (parse, external validation, migration, and current-shape validation). The attached-sample row comes from a focused five-repeat rerun using its original 56,787-byte text for parse and full import. Domain validation runs all registered rules for the active network, matching the current App path. Save uses the existing storage abstraction backed by an in-memory `localStorage` substitute and verifies a deep-equal reload. Undo/Redo and the representative immutable edit used the real collection reducer.

| Fixture | Generate | Parse | Full import | Domain validation | Availability, selected outpost | Export serialization | Storage write | Import Undo |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 0.74 | 0.04 | 0.13 | 1.41 | 0.02 | 0.03 | 0.02 | 0.011 |
| Medium | 0.26 | 0.18 | 0.41 | 2.13 | 0.02 | 0.17 | 0.09 | 0.004 |
| Attached sample, original source text for parse/import | n/a | 0.16 | 0.39 | 7.21 | 0.02 | 0.13 | 0.06 | 0.008 |
| Large | 1.40 | 2.23 | 4.29 | 5.09 | 0.03 | 2.86 | 1.25 | 0.003 |
| Maximal | 5.17 | 10.46 | 19.90 | 5.84 | 0.03 | 12.72 | 6.44 | 0.005 |
| Ultra maximal | 17.50 | 32.88 | 64.55 | 6.59 | 0.04 | 43.28 | 19.03 | 0.005 |
| Modded 96 | 0.78 | 1.32 | 2.03 | 39.50 | 0.04 | 1.49 | 0.65 | 0.010 |
| Modded 128 | 0.99 | 1.73 | 2.64 | 51.47 | 0.04 | 1.95 | 0.82 | 0.010 |
| Balanced 96 | 2.01 | 2.12 | 3.56 | 58.64 | 0.07 | 2.73 | 1.06 | 0.018 |
| Balanced 128 | 1.55 | 2.69 | 4.33 | 80.83 | 0.07 | 3.33 | 1.42 | 0.013 |
| Wide pad 64 | 1.15 | 1.94 | 3.08 | 53.72 | 0.08 | 2.36 | 0.89 | 0.011 |
| Wide pad 96 | 2.32 | 2.87 | 5.63 | 92.64 | 0.09 | 3.48 | 1.65 | 0.020 |
| Dense 48 | 0.84 | 2.09 | 2.93 | 88.16 | 0.12 | 2.46 | 0.96 | 0.012 |
| Dense 64 | 1.21 | 2.72 | 3.89 | 127.99 | 0.12 | 3.26 | 1.38 | 0.013 |
| Dense 96 | 1.66 | 4.07 | 5.95 | 250.29 | 0.14 | 5.22 | 2.11 | 0.012 |
| Dense 128 | 2.73 | 5.46 | 8.51 | 386.64 | 0.14 | 6.43 | 3.13 | 0.010 |
| Manufacturing heavy | 0.95 | 2.63 | 2.99 | 23.26 | 0.44 | 3.51 | 1.58 | 0.011 |
| Planned Supply heavy | 2.25 | 7.66 | 8.26 | 95.17 | 2.99 | 8.46 | 3.85 | 0.013 |
| Outbound heavy | 1.80 | 6.13 | 6.58 | 67.54 | 2.35 | 7.61 | 3.06 | 0.012 |
| Links heavy | 2.32 | 2.54 | 5.45 | 165.79 | 0.06 | 2.68 | 1.30 | 0.011 |
| Strings heavy | 0.10 | 1.34 | 1.73 | 1.45 | 0.05 | 2.37 | 2.18 | 0.006 |

The pre-migration and post-migration validation stages stayed below 12 ms even at 100 vanilla-sized networks (11.38 and 11.34 ms). Migration was 6.10 ms there. Collection replacement, navigation, edits, Undo, and Redo were all sub-millisecond medians. Network switching was at most 0.03 ms in the measured fixtures. These reducer numbers exclude React render and domain validation that the app recomputes after a state change.

The measured jsdom component subset (outpost navigation plus the selected Outpost Status Matrix) had these median mount/select/switch times: 24 outposts 20.8/17.0/17.0 ms; 96 outposts 25.0/19.9/24.9 ms; 128 outposts 16.4/7.0/12.8 ms. Non-monotonic results show the limits of this small jsdom run. It established that these components rendered and rerendered with the generated shapes, not that a real browser would maintain a particular frame rate. The full App, Cargo Pads editor, paint, and storage quota were not measured.

## Expensive shapes and algorithms

Collection breadth is relatively cheap for the active network: 100 vanilla-sized networks yielded 64.55 ms full import and 6.59 ms active-network domain validation, despite a 7.09 MiB compact / 18.44 MiB pretty-printed representation. By contrast, one dense 96 outpost network required 250.29 ms domain validation at 834 KiB compact JSON. File size alone cannot express the runtime cost.

The leading rule in the dense 96 case was `unresolved-cargo-export` at 133 ms in a separate rule breakdown, followed by `interstellar-cargo-helium-3` at 62 ms. They repeatedly resolve provenance, availability, outposts, pads, and links. At dense 128 those rules took 218 and 93 ms. The links-heavy case spent 69 and 55 ms in those two rules. These rule timings are a second run and need not sum exactly to the main table.

The Planned Supply heavy case spent about 29 ms sorting and resolving the Planned Supply diagnostic, and about 24 ms each in manufacturing and organic farming input validation. The outbound heavy case spent about 23 ms on unresolved exports and about 14 ms each on manufacturing and organic farming validation. Those repeated derivations and `.find()` searches merit separate optimization if larger modded networks become common.

A focused reverse-ordered synthetic recipe chain required 1.48 ms for 100 products, 28.51 ms for 500, and 133.02 ms for 1,000 (three-run medians). This intentionally stresses the fixed-point pass rather than today's finite canonical recipe graph. Ordinary canonical manufacturing arrays with many duplicates were much cheaper, but structural import validation currently accepts such arrays.

## Recommended future import envelope

These are proposed capacity/resource limits, **not implemented limits**. A future import boundary should reject oversized input as early as practical: check `File.size` before reading; read and parse JSON; then perform a bounded structural traversal that validates relevant structure, counts persisted members, enforces per-array and string-length ceilings, and stops as soon as a hard limit is exceeded. Capacity accounting may be integrated into the existing strict external structural validation traversal; it need not be a separate pass. Continue with migration and post-migration current-shape/identity validation only after that bounded check succeeds. Normal domain validation remains separate and runs after import acceptance. A clean rejection should precede live-state mutation.

| Boundary | Candidate ceiling | Basis and headroom |
| --- | ---: | --- |
| Input file | 4 MiB | About 74 times the attached 55 KiB export; allows several large vanilla networks while excluding the 5.90 MiB 32-network and 18.44 MiB 100-network exports. Leaves more room than an 8 MiB input for ordinary browser storage, though quota remains unverified. |
| Saved networks | 64 | Tens of networks were cheap to import and switch. File and aggregate ceilings normally bind first for substantial networks; this protects tiny-network breadth. |
| Outposts in one network | 96 | Four times vanilla's 24. A 96-outpost, six-pad case validated in 39.50 ms; the balanced eight-pad case in 58.64 ms. The 128-outpost cases were still functional but allow more density to accumulate. |
| Pads in one outpost | 12 | Twice vanilla's six. The 96-outpost, 12-pad, 256-link case validated in 92.64 ms, near the noticeable region. |
| Links in one network | 256 | More than three times the maximum 72 pairings of 144 vanilla pads. Dense 96 with 500 links reached 250.29 ms validation; 128 with 700 reached 386.64 ms. |
| Manufacturing entries per outpost | 256 | Far beyond the canonical catalogue; blocks thousands of duplicate or synthetic entries and bounds fixed-point work. |
| Planned Supply entries per outpost | 256 | The 40,000-entry case took 95.17 ms validation at only 1.40 MiB compact JSON. |
| Outbound items per pad | 128 | The 32,000-entry case took 67.54 ms validation at 1.13 MiB compact JSON. |
| Aggregate persisted members | 25,000 | About 130 times the attached sample's measured 190 members. The balanced 96 case had 9,121 members; dense 128 had 24,893 but was already problematic because of relationship density. Count all nested members in an eventual implementation; the current harness's displayed count omits smaller arrays. |
| Any persisted string | 4,096 UTF-16 code units | Preserves substantial modded/localized IDs and labels. A 200,000-character field is structurally accepted now and can inflate a tiny collection into megabytes without adding useful capacity. This is a technical, not gameplay, name limit. |

These candidate boundaries required combined real-browser validation before implementation. That validation was subsequently completed using dense and broad near-envelope fixtures; see [Combined import capacity browser validation](./IMPORT-CAPACITY-BROWSER-VALIDATION.md).

## History and persistence conclusion

Every measured import used normal `replace-collection` history from a pre-existing medium collection. The harness switched networks, undid back to the exact prior collection, redid the imported graph, made an immutable character edit, and undid/redid that edit. Full graph identity and storage reload were checked. No fixture needed a special history class; reducer traversal stayed sub-millisecond. Normal Undo/Redo should remain universal for accepted imports.

History stores object graphs, not serialized JSON, and ordinary edits share unchanged structures. The existing 1,000-entry history count cap does not bound bytes for 1,000 distinct large imports. The separate [history benchmark](../HISTORY-BENCHMARK.md) measures many replacements of smaller graphs; this probe did not heap-profile 1,000 imports near the proposed byte ceiling. That remains a browser-memory uncertainty, not evidence for disabling history on large imports.

The storage substitute confirmed semantic round trips through `saveNetworkCollection` and `loadNetworkCollection`, but cannot model quota or synchronous main-thread disk behavior. Browser quota and recovery deserve their already separate task. A future collection subset/export workflow could help users with unusually many saved universes; it should be considered separately from the import safety boundary.

## Verification

The focused benchmark, attached-sample round trip, deterministic fixture test, and component probe passed. Repository checks passed: `npm test` (162 tests), `npm run test:components` (26 tests), `npm run build`, `npm run lint`, and `git diff --check`. The production build emitted its existing large-chunk advisory. No new dependency was added.
