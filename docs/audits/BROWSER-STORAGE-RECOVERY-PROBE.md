# Browser storage and recovery probe

## Scope and evidence

Read-only production-code inspection and a bounded, ignored mock-storage probe on 16 September 2026. This report describes current behavior and a later correction; it changes no production behavior. Sources include `AGENTS.md`, `README.md`, the architecture, domain and UX documents, the whole-product security audit, the two import-capacity benchmark reports, storage/migration/import code, startup and reducer code, and the related tests. The current brief's settled recovery decisions supersede the older documentation's description of partial salvage as acceptable.

## Current persistence architecture and exact startup flow

The gameplay collection uses the single key `starfield-outpost-network` through `src/data/storage.ts`; locale preferences use a **separate** key and abstraction in `src/localization/preferences.ts`. A search of `src/` finds no `removeItem` or direct gameplay-storage calls elsewhere. Both APIs are synchronous. `saveNetworkCollection` calls `JSON.stringify(collection)` as the argument to `localStorage.setItem`; neither serialization nor the write is caught. The loader calls `localStorage.getItem` **outside** its `try`, parses inside it, and catches parse/migration/**re-save** exceptions together. It returns only a `NetworkCollection` or throws; there is no error/status result. It does not use the portable serializer. The preference getter's default argument and `getItem` are also outside its parse `try`, and preference writes are unguarded; this is a separate, lower-stakes startup risk because `LocalizationProvider` mounts above `App`.

1. `src/main.tsx` mounts `LocalizationProvider`, then `App`, under React `StrictMode`. `App.tsx` initializes `useState(loadNetworkCollection)` at line 142. A failed preference read may prevent reaching this point.
2. `loadNetworkCollection` reads the key. A missing or empty value creates a default one-network collection and **writes it synchronously before returning**. A nonempty value is parsed with `JSON.parse`, sent to `migrateStoredNetworkData`, and **rewritten synchronously even if already current**.
3. `migrateStoredNetworkData` in `src/data/networkCollection.ts` recognizes a collection by an array-valued `networks`; otherwise it tries to wrap a historical bare network with a generated saved-network ID. `migrateNetworkCollectionData` migrates each accepted member through `migrateNetworkData` in `src/data/networkMigration.ts`, repairs an invalid active ID to the first survivor, and makes a new default collection if none survives. There is no separate complete current-shape validation before returning.
4. A parse/migration/re-save exception enters the loader's catch, creates a fresh collection, and **tries another write**. If that write succeeds, startup receives the fresh collection; if it fails, the exception propagates. The original serialized string is not kept in application state or a backup key.
5. `createCollectionEditingSession` initializes working network/outpost context and empty, session-only history. `App.tsx:432-434` also saves `session.collection` in a `useEffect` on mount and after every collection reference change. `StrictMode` can cause additional development-mode initialization/effect work; the dangerous first write already happens inside the loader.
6. `collectionEditingSessionReducer` applies edits and navigation immutably, records deliberate changes as before/after collection and context snapshots (up to 1,000 entries), and implements Undo/Redo without invoking storage. The effect saves the resulting whole collection after React commits. Selecting an outpost alone does not change the collection; switching active networks does, and therefore saves. Reload repeats the loader and starts with empty history and the active network's first outpost selected.

## Current failure behavior

| Stored value / operation | Current result |
| --- | --- |
| Invalid JSON; `null`, array, primitive, or wrong root; missing collection shape | Parsing or bare-network migration fails; fresh collection is written and returned if the write succeeds. No visible load error. A root with `networks: []` is accepted as a collection and becomes a default. |
| Unsupported numeric collection schema; future nested network schema | Collection migration throws or skips the affected member; if no members survive, default is written. A nonnumeric/missing collection schema passes the collection check if `networks` is an array. Nested schema versions above 4 throw in network migration. |
| Bad saved-network identity or malformed nested document | Empty/duplicate wrapper IDs and throwing members are skipped; active ID is repaired. Missing/invalid outpost or pad identity types throw for that member, while empty or duplicate outpost/pad/link IDs are not fully checked here. Some malformed nested arrays are filtered/defaulted; other nested items pass through unchecked. Successful recovery is immediately rewritten, losing omitted content. |
| `getItem` or storage property access throws | Outside the catch: startup exception, no fallback or user-facing status. |
| First-run/fallback `setItem` throws | Startup exception; no usable fallback returned. |
| Valid or migrated load, first re-save fails | The broad catch treats the **write** as a corrupt-load failure, constructs a fresh collection, and attempts to save that. A persistent quota/blocked-storage exception propagates; a transient first failure followed by a successful second write destroys the valid source and returns the fresh collection. |
| Later edit `setItem`/quota-style `DOMException` throws | Reducer has already committed the edit and history in memory. The effect throws without status or rollback; React may report the effect error or disrupt the mounted tree. If it stays mounted, another collection change schedules another save. A successful later save does not clear an unsaved warning because none exists. Reload loses edits since the last successful save. |
| `JSON.stringify` throws | The same unguarded save path applies. In the loader's `try` it is mistaken for load failure and prompts default creation; outside it the exception propagates. Ordinary JSON-parsed data is acyclic, but this remains the abstraction's contract. |

The mock probe reproduced malformed/wrong-root/unsupported/empty fallback overwrite, read and quota-write exception propagation, a transient valid-load re-save failure replacing the valid source, and a two-member collection losing its malformed member. `QuotaExceededError` is seen as an ordinary thrown `DOMException`; no name-specific handling exists. No UI status distinguishes a successful edit from a durable save.

## Migration, recovery, and loss classification

`networkMigration.ts` materializes network schema 4. Historical transformations include schema 1–3 defaults, older resource production-route conversion, and legacy pad-local links promoted to network links when endpoints are known. Unknown resource/reference IDs can survive. Migration works on parsed objects, not the raw string, and the loader writes immediately after it returns. If migration throws, the catch writes a default; if a member throws, collection migration instead skips that member. No snapshot of the original representation is retained after a successful rewrite.

| Behavior | Classification |
| --- | --- |
| Historical defaults and identifiable legacy link/route conversion | Deterministic migration (ambiguous legacy links may remain unlinked). |
| Skipping malformed, empty-ID or duplicate-ID saved-network wrappers; swallowing a member migration exception | Silent partial salvage and lossy cleanup. |
| Replacing an empty/all-invalid collection with a newly generated one; repairing invalid active ID | Explicit recovery in code, silent to the user; the first discards source content, the second changes selection. |
| Filtering nonstring resource/biome/presence entries and invalid production routes; defaulting absent/wrong-type arrays; dropping malformed/deduplicated cargo links and unexpected properties | Silent lossy cleanup, including on some current-schema data. `manufacturing`, `plannedSupply`, and `outboundItems` arrays are copied with limited or no member checks, so unsafe nested shapes can also remain. |
| Repairing duplicate/empty outpost, pad, or link IDs globally | Not present. Only saved-network wrapper IDs are skipped, and link relationships are deduplicated. |

The current partial salvage contradicts the brief's settled rule against silently dropping individual networks. The older architecture text explicitly describes salvage, but it describes current behavior rather than overriding this brief's future policy. Pure deterministic historical migration should be distinguished from repair of malformed current state.

## Fallback overwrite and external import boundary

The overwrite path is direct: `getItem` returns a nonempty failed payload → `JSON.parse` or migration throws → `catch` creates default → `saveNetworkCollection` calls `setItem` on the **same key** → raw source is gone, before `App` can expose any recovery choice. All-invalid and partially salvaged collections can also be rewritten without throwing. Even if a future loader merely returned fallback without writing, the mount effect would currently save it, so both write points need coordination. A transient write failure on an otherwise valid load is a further unexpected overwrite path.

`src/data/serialization.ts` uses `deserializeNetworkCollection` for **external files**, with `validateExternalImportCapacity`, strict source-structure checks, migration, and post-migration `validateImportedCollection`. `src/ui/components/NetworkImportButton.tsx` applies a file-size check before reading. Browser loading calls none of these import validators or file-size checks; it shares only `migrateNetworkCollectionData`/`migrateNetworkData`. Thus the implemented 4 MiB external file ceiling, 64-network/96-outpost and other array limits, 25,000-member aggregate budget, and 4,096-code-unit string limit **do not apply to browser recovery**. This separation is intentional in `serialization.ts` and `docs/ARCHITECTURE.md:1095-1112`.

## Resource safety and storage-bound recommendation

**Recommendation: an independent browser-storage resource boundary is necessary, with a policy distinct from the strict external-import envelope; choose its numerical ceilings after one focused measurement.** This is option C for policy and option D for exact values. A hard upper bound must be checked on the raw string before `JSON.parse`, then bounded structural work must precede migration. The loader currently parses the entire value, maps every network/outpost/pad, builds sets and copies arrays, serializes the entire result, and synchronously writes it on the main thread. Domain validation and active-network rendering follow; history retains later edits. No byte, depth, breadth, member, or string budget stops this path. Very deep JSON may parse but still consume memory; huge arrays/strings and many networks or links can cause allocation and repeated validation work even below a browser's varying storage quota. A byte bound alone does not express relationship-density cost. Storage quota limits writes on one browser/profile, not guaranteed historical, extension, devtools, or policy-created payloads, nor safe synchronous read/parse cost.

The existing near-envelope dense (1,012,195 compact bytes, 24,545 members) and broad (1,074,141 compact bytes, 64 networks) fixtures successfully round-tripped through the actual loader using mock `localStorage` in this probe. Their pretty source strings were 3,031,409 and 2,782,589 UTF-16 units. The earlier report records real Edge 153, Chrome 152, and Firefox 156 import/edit/reload success for both, with modest dense latency. Those results support admitting at least comparable legitimate shapes, but do not establish a storage ceiling: the in-memory substitute cannot measure browser quota or synchronous `getItem`/`setItem`, and those browser tests did not isolate storage timing. A 4 MiB external-file cutoff cannot simply be copied to the stored compact or expanded format, and strict external structural rejection would also break historical recovery.

The smallest useful next benchmark is a focused **storage** load/re-save and later-edit timing plus write-success check in one named desktop browser with the existing dense and broad fixtures, recording raw and normalized UTF-16/byte sizes and `getItem`, parse, migration, stringify, `setItem`, and first usable render separately. Add one bounded larger-but-plausible stored collection and one deliberately oversized/deep malformed value under a mock, so the proposed bound is verified to stop before migration. No comprehensive quota survey or new broad fixture suite is needed. Measure before selecting numbers; do not present the external limits as a storage policy by accident. The existing fixtures alone are sufficient as a lower acceptance calibration, not as an upper safety proof.

## Cheapest future test seams

| Case | Existing seam / recommended test level |
| --- | --- |
| Malformed JSON, unsupported collection/network schema, read exception, write/`QuotaExceededError`, preservation of raw source and fallback without overwrite | Mock `localStorage` around `loadNetworkCollection` in `tests/networkLifecycle.test.ts` or a dedicated storage abstraction unit test. Current `MemoryStorage` already supports injection via `globalThis`; extend it with throwing/call-count behavior. |
| Migration and partial-collection policy; historical normalization without lossy cleanup | Pure `migrateStoredNetworkData`, `migrateNetworkCollectionData`, and `migrateNetworkData` unit tests. Existing lifecycle and resource-persistence fixtures give starting shapes. |
| Migrated load plus failed re-save, later retry success | Storage abstraction test for result and source preservation, then startup integration/component test for the save coordinator's retry/status transition. |
| Persistent unsaved status, startup failure announcement, cleared status after success | Component test of `App`/extracted coordinator with mocked storage and React effects; existing jsdom Vitest setup is available, though there is no current full-App persistence test. |
| In-memory edit and Undo/Redo after failed save | Reducer/session unit test for state/history independence plus a narrow component/integration test to prove a failing save effect does not break the mounted editor. `tests/collectionEditingSession.test.ts` already covers edit/traversal; storage is absent from the reducer by design. |

No production injection hook or substantial test infrastructure is necessary for the pure and storage-level cases. Test the startup effect too: fixing only the loader still leaves the mount autosave overwrite path.

## Recommended future behavior against the settled decisions

| Scenario | Current behavior | Desired future behavior | Gap? |
| --- | --- | --- | --- |
| Malformed JSON | Fresh collection overwrites raw value, no message | Usable fallback, visible load warning, preserve source until an intentional successful save policy permits replacement | Yes |
| Unsupported/unrecoverable collection | Fallback and immediate overwrite | Usable fallback, report failure, preserve original | Yes |
| Migration failure | Member skipped or whole collection replaced and written | Preserve serialized source; reject incoherent collection without silent member drop | Yes |
| Migrated load + failed re-save | Broad catch treats save as load failure; may overwrite with default on retry | Keep migrated in-memory collection and original stored form; show unsaved status | Yes |
| Read exception/unavailable storage | Startup throws | Usable in-memory fallback and visible failure | Yes |
| Write exception/quota failure after edit | Effect throws; in-memory reducer edit/history already applied | Keep edit and Undo/Redo usable; persistent unsaved indication | Yes |
| Later retry success | Later changed collection may cause another effect save if tree survives; no status | Retry on normal save opportunity and clear warning on success | Yes |
| Fallback overwrite | Immediate loader write and mount effect | Do not overwrite failed source merely due to fallback | Yes |
| Partially malformed collection | Bad members silently skipped and survivors rewritten | No silent network-level partial salvage; allow deterministic unambiguous migration | Yes |

Keep recovery UI narrow and nonmodal. Do not add a download/reset-management workflow merely for this correction. Preference storage warrants proportionate exception containment, but gameplay recovery and status are the primary issue.

## Open questions and verification limits

- Choose numerical storage size/member/depth budgets only after the focused measurement. Define whether an explicitly edited fallback may replace a corrupt source and how its load warning and unsaved status interact; the settled rule only forbids immediate overwrite **merely because fallback occurred**.
- Mock storage does not reproduce browser quota, event-loop timing, React error-boundary behavior, or storage policies. The earlier named-browser fixture results establish normal persistence, not failure-mode behavior. No cross-browser quota survey or pathological browser load was run here.
- The ignored probe is `.local-work/browser-storage-recovery-probe.mjs`; it asserts the current behavior and is intentionally not a committed regression test. It reported fallback overwrites, exception propagation, transient re-save data loss, partial salvage, and mock round trips for both existing fixtures.

Verification passed:

- `node --experimental-strip-types .local-work/browser-storage-recovery-probe.mjs`: all asserted mock-storage scenarios and both fixture round trips passed.
- Focused `node --experimental-strip-types --test tests/networkLifecycle.test.ts tests/resourcePersistenceCompatibility.test.ts tests/collectionEditingSession.test.ts tests/externalImportCapacity.test.ts`: 44/44 passed.
- `npm test`: 170/170 passed; `npm run test:components`: 27/27 passed.
- `npm run build`: passed, with the existing Vite >500 kB chunk advisory; `npm run lint`: passed.
- `git diff --check`: passed; because the new report is untracked, `git diff --no-index --check -- /dev/null docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md` also emitted no whitespace warnings (its exit status 1 denotes a new-file difference).

Production code and tests were not changed.
