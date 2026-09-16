# Codex Implementation Brief — Browser Storage Recovery and Persistence Hardening

## Objective

Implement the validated browser-storage recovery and persistence-hardening design for the Starfield Outpost Tracker.

This work should make browser-stored gameplay state resilient to:

- malformed or incoherent stored JSON;
- unsupported/unrecoverable stored collections;
- migration failures;
- storage read exceptions;
- storage write/quota failures;
- transient re-save failures;
- pathological stored values that would otherwise consume excessive resources;
- fallback-state overwrite of recoverable original source;
- silent partial salvage of malformed collections.

The app must remain usable in-memory when persistence fails.

This is a production implementation task.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- filenames;
- source code;
- tests;
- comments;
- documentation;
- localization keys;
- error codes;
- generated artifacts.

Use durable descriptive names only.

---

## Read first

Inspect and follow the current committed repository state, especially:

- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- `docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md`;
- `docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- current gameplay storage abstraction;
- `loadNetworkCollection` / `saveNetworkCollection`;
- migration code;
- startup/bootstrap/App initialization;
- collection/history reducer;
- existing import-error/status architecture;
- current persistence and lifecycle tests.

Use the current committed repository as the source of truth for file paths, architecture and localization conventions.

---

# Settled product policy

Do not reopen these decisions.

## Browser storage remains distinct from external import

Browser storage is app-owned/historical state and should remain more forgiving than external file import.

Do **not** route browser recovery through the strict external-file capacity/structure boundary.

Do not reuse external import behavior blindly.

---

## Unrecoverable stored state

When browser-stored gameplay state cannot be recovered safely:

- app must start with a fresh usable in-memory collection;
- user must receive a visible recovery/load warning;
- the original failed stored payload must **not** be overwritten merely because fallback occurred.

Fallback itself is not consent to destroy the original source.

---

## Source replacement after fallback

While the app is merely running on fallback state:

- suppress automatic persistence that would overwrite the failed source.

Once the user makes a **deliberate collection mutation** to the fallback state:

- that mutation represents new intentional user state;
- a subsequent successful save may replace the failed original source.

Do not introduce a separate recovery-backup key in this task.

The original gameplay storage key remains the preserved source until intentional replacement succeeds.

---

## Save failure

When saving current in-memory state fails:

- keep the edit;
- keep the current in-memory collection;
- keep Undo/Redo/history;
- do not roll the edit back;
- mark the session persistently as unsaved;
- retry on later normal save opportunities.

A later successful save clears the unsaved state.

---

## Editing beyond the application storage envelope

If an already-loaded valid collection grows through normal user editing beyond one of the browser-storage resource ceilings:

- do not reject the edit;
- do not roll back the edit;
- do not prevent history;
- keep the in-memory state;
- mark the session as unsaved / not safely persisted;
- report that browser storage cannot safely persist the current collection.

This storage envelope is a persistence/resource boundary, not a gameplay editing rule.

---

## Partial salvage

Do not silently:
- skip a malformed saved network and keep the rest;
- filter malformed collection members;
- drop ambiguous nested state;
- repair identity collisions;
- rewrite a partially salvaged collection as though recovery succeeded.

Deterministic historical migration remains allowed.

Ambiguous/incoherent malformed collection state should trigger whole-collection recovery fallback, while preserving the original raw source.

---

## Recovery UI scope

Keep recovery UI narrow and nonmodal.

Do not add:
- recovery file download;
- recovery-key management;
- reset wizard;
- modal error workflow;
- native browser alerts.

Use the existing app-owned status/feedback patterns.

---

# Browser-storage production envelope

Implement the benchmarked browser-storage resource-safety limits.

All ceilings are inclusive.

| Dimension | Production ceiling |
| --- | ---: |
| Raw stored value | 4,194,304 UTF-16 code units |
| Aggregate array members | 65,536 |
| Saved networks | 128 |
| Outposts per network | 128 |
| Cargo pads per outpost | 16 |
| Cargo Links per network | 384 |
| Outbound items per pad | 256 |
| Other arrays | 512 each |
| Every string value | 16,384 UTF-16 code units |
| Every object key | 16,384 UTF-16 code units |
| Nesting depth | 64 edges from root at depth 0 |

### “Other arrays”

The generic 512 ceiling should apply to arrays not covered by a more specific storage limit.

This includes:
- manufacturing arrays;
- Planned Supply arrays;
- unknown/historical arrays.

Specific ceilings take precedence where applicable.

### Aggregate members

Definition:

> Sum the lengths of all arrays recursively across the stored source graph.

Stop as soon as the total exceeds 65,536.

### Nesting depth

Root is depth 0.

Any child reached through one object property or array element increments depth by one edge.

Reject processing of any value deeper than 64 edges.

Use iterative traversal.

Do not recurse through arbitrary external/stored JSON.

---

# Defensive load ordering

The browser-storage recovery path should follow this order.

## 1. Read storage safely

Call gameplay storage `getItem` inside an exception boundary.

If storage read fails:
- produce a usable in-memory fallback;
- preserve the fact that persistence is unavailable;
- expose a recovery/storage warning;
- do not attempt to treat the failure as corrupt JSON.

No source could be read, so there is no raw payload to preserve.

---

## 2. Missing/empty storage

If there is no existing stored gameplay value:

- create the normal default collection;
- attempt initial save separately;
- if the initial save fails, still return/use the default collection in memory;
- mark the session unsaved/storage-unavailable.

Do not let first-run `setItem` failure prevent startup.

---

## 3. Raw length check before parse

For a nonempty stored string:

```text
storedValue.length <= 4,194,304
```

must be checked before `JSON.parse`.

If over limit:
- do not parse;
- preserve raw source untouched;
- use in-memory fallback;
- expose a recovery warning.

---

## 4. Parse

Catch `JSON.parse` errors separately from save failures.

If parsing fails:
- preserve raw source;
- use in-memory fallback;
- expose recovery warning;
- do not write fallback automatically.

---

## 5. Bounded storage-recovery traversal

Before migration, traverse the parsed source iteratively and enforce:

- depth;
- every string value;
- every object key;
- aggregate array members;
- specific array ceilings;
- generic 512 array ceiling.

Short-circuit at the first breach.

This traversal is for resource safety, not full domain/schema validation.

Do not silently mutate the source to fit the envelope.

---

## 6. Deterministic migration

Only after resource validation succeeds:

- run deterministic historical migration;
- do not silently skip malformed saved networks;
- do not silently filter ambiguous current-state data merely to get a usable result.

If migration/recovery cannot produce one coherent collection:
- preserve raw source;
- use fallback;
- expose recovery warning.

---

## 7. Validate coherent recovered state

Use the narrowest current-shape/coherence validation appropriate to browser recovery.

The goal is not to apply strict external import policy.

The goal is to ensure the migrated collection is coherent enough to become live state without silent ambiguity.

At minimum, ensure malformed wrapper/network identity and other unrecoverable collection-level ambiguity do not get silently dropped.

If current code lacks a reusable validation helper, factor one carefully rather than routing storage through external import wholesale.

---

## 8. Initialize in-memory state

Once recovery succeeds:

- initialize app/session state from the recovered collection;
- keep history empty on startup as today.

---

## 9. Normalized re-save is a separate operation

Do not combine load/migration failure handling with normalized re-save failure handling.

If recovered state is valid in memory but normalized save fails:

- keep the recovered collection live;
- preserve the original stored source if it still exists;
- mark the session unsaved;
- surface persistence failure;
- do not fall back to a fresh collection.

This specifically fixes the current “transient re-save failure becomes corrupt-load fallback” bug.

---

# Startup autosave coordination

The current mount/update save effect must not undo source preservation.

Implement coordination so:

- successful recovered/current collection can save normally;
- failed-source fallback does **not** auto-overwrite the preserved raw source on mount;
- fallback becomes eligible to save only after deliberate user mutation;
- save failures do not crash/disrupt the mounted app.

Do not use fragile timing hacks.

Prefer explicit persistence/recovery state.

---

# Persistence state model

Introduce explicit internal persistence/recovery status sufficient to distinguish at least:

1. **saved**
   - current in-memory collection is durably persisted.

2. **unsaved**
   - current in-memory collection is valid but latest save failed or exceeds app storage envelope.

3. **recovery-fallback**
   - app is running on fallback because stored source could not be safely recovered;
   - failed raw source is preserved and autosave is suppressed.

4. **storage-unavailable**
   - storage read/write access is currently unavailable.

Exact type names are up to Codex.

The important point is to avoid collapsing all cases into one generic load/save exception.

---

# Retry behavior

Later normal collection mutations should trigger normal persistence attempts where allowed.

For:
- unsaved;
- storage-unavailable after startup;
- previously failed quota/write;

a later successful save should:
- persist current in-memory state;
- clear the persistent unsaved/storage warning;
- restore saved status.

For recovery-fallback:
- do not save merely due to mount/re-render;
- once user deliberately mutates the collection, normal save attempts may begin.

---

# “Deliberate user mutation” rule

Use the existing reducer/action architecture to distinguish actual collection mutations from:

- mount;
- rerender;
- selected-outpost changes that do not mutate collection;
- passive context initialization.

Examples that should count as deliberate mutation:
- editing character/network/outpost state;
- adding/removing/reordering;
- changing active network if that currently mutates persisted collection;
- Undo/Redo of a deliberate collection change;
- other actions that produce a new persisted collection state.

Do not create a special user confirmation dialog.

---

# Storage envelope on later saves

Before writing the current in-memory collection:

1. serialize safely;
2. apply the storage envelope to the serialized/current graph;
3. if over application limit:
   - do not call `setItem`;
   - keep state in memory;
   - mark unsaved;
   - report persistence-capacity failure.

Do not mutate or trim the collection to fit.

If `JSON.stringify` itself throws:
- treat it as a persistence failure;
- keep in-memory state;
- mark unsaved.

---

# Error/status model

Use durable machine-readable internal status/error reasons.

Suggested conceptual categories:

- storage-read-failed;
- stored-data-too-large;
- stored-data-resource-limit;
- stored-data-malformed;
- stored-data-unrecoverable;
- storage-write-failed;
- storage-capacity-exceeded;
- storage-quota-failed.

Exact naming should fit existing architecture.

Do not use transient audit identifiers.

---

# User-visible messaging

Use concise app-owned localized messages.

The UI should distinguish broadly between:

### Recovery load warning
Meaning:
> Saved browser data could not be safely restored. The app is using a temporary fresh collection and has preserved the original stored data.

### Unsaved/persistence warning
Meaning:
> Changes are currently only in memory and have not been saved in this browser.

### Persistence restored
When a later save succeeds:
- clear the persistent warning;
- a separate celebratory message is not required unless current UX conventions favor one.

Do not expose:
- internal object paths;
- UTF-16 terminology;
- member counts;
- quota implementation details;
unless existing diagnostic/details UI already does so.

---

# Persistent warning behavior

The warning should remain visible while the current session is not durably saved.

It should not disappear merely because:
- another edit occurs;
- navigation occurs;
- Undo/Redo occurs.

It clears only when:
- a later save succeeds for the current collection state;
- or the app transitions to an equivalent confirmed-saved state.

Use the existing status area or another existing nonmodal app-owned surface.

Do not add modal dialogs.

---

# Localization

Add/adjust locale keys according to current localization policy.

Ensure:
- en-US complete;
- ja-JP parity remains satisfied;
- en-GB sparse override policy remains unchanged.

Update generated Japanese review/catalogue artifacts if the repo requires it.

Do not embed English-only production strings in deep storage code.

---

# Partial salvage correction

The audit found current migration/recovery can silently:
- skip malformed saved-network wrappers;
- swallow per-member migration errors;
- filter/default nested arrays;
- rewrite the salvaged result.

Correct the browser-storage recovery path so a malformed multi-network collection is not silently reduced.

Important distinction:

## Allowed
- deterministic schema migration;
- known historical field transformation;
- normal defaulting required by an older schema version when unambiguous;
- preservation of unknown/stale IDs where current philosophy already allows them.

## Not allowed
- skipping one malformed current/historical saved network while loading others;
- dropping ambiguous identity collisions;
- filtering malformed nested state merely to make the collection load;
- rewriting a partially salvaged graph as though it were the original user state.

If migration helpers are also used elsewhere, avoid breaking external-import behavior unintentionally.

Factor strict/coherent storage recovery separately if needed.

---

# Resource traversal implementation

Prefer a reusable storage-specific helper, separate from strict external import capacity validation.

Requirements:
- iterative;
- early-exit;
- bounded diagnostic path context if paths are recorded;
- depth-aware;
- checks object keys as well as string values;
- generic per-array 512 fallback;
- more specific path ceilings where defined.

Known storage-specific paths should recognize at least:
- saved networks;
- outposts;
- cargo pads;
- Cargo Links;
- outbound items.

Manufacturing and Planned Supply may rely on the generic 512 ceiling if that keeps the implementation simpler.

---

# Internal recovery vs external import

Do not change external import behavior.

External import remains:
- strict;
- 4 MiB byte-gated;
- stricter structural limits;
- all-or-nothing.

Browser storage remains:
- independently bounded;
- recovery-oriented;
- deterministic-migration capable;
- source-preserving on failure.

Document this distinction clearly.

---

# Preference storage

Gameplay collection storage is the primary scope.

The audit also identified that locale preference storage can throw before gameplay startup.

If containing preference-storage exceptions is trivial and localized:
- prevent preference-storage read/write failure from blocking the app.

Do not build equivalent recovery/status infrastructure for preferences.

If nontrivial:
- leave it out;
- record as follow-up.

Do not let preference work expand the main scope.

---

# Tests

Add comprehensive focused coverage.

## Storage read

Test:
- missing key;
- normal valid current collection;
- deterministic historical migration;
- `getItem` throws;
- raw value at exactly 4,194,304 code units;
- raw value one code unit over;
- malformed JSON;
- wrong root/unrecoverable shape.

Verify:
- usable in-memory state;
- warnings/status;
- source preservation;
- no unintended overwrite.

---

## Resource envelope

Exact-limit and one-over-limit tests for:

- aggregate members 65,536 / 65,537;
- networks 128 / 129;
- outposts 128 / 129;
- pads 16 / 17;
- links 384 / 385;
- outbound 256 / 257;
- generic array 512 / 513;
- string 16,384 / 16,385;
- object key 16,384 / 16,385;
- depth 64 / 65.

Avoid huge memory-heavy tests where a direct helper invocation can test boundaries cheaply.

---

## Migration/coherence

Test:
- legitimate historical schema migration succeeds;
- malformed one-of-many saved network does **not** silently disappear;
- duplicate/empty ambiguous wrapper identity does not get partially salvaged;
- migration exception preserves original source and triggers fallback;
- recovered valid collection is not replaced by default merely because normalized re-save fails.

---

## Re-save failure

Test:
- valid stored collection loads;
- normalized re-save fails;
- loaded collection remains live;
- original raw stored value remains;
- status becomes unsaved;
- no fallback/default replacement occurs.

---

## Startup fallback overwrite

Test:
- malformed source triggers fallback;
- mount/startup autosave does not overwrite source;
- passive rerender/navigation does not overwrite source;
- first deliberate collection mutation permits save attempt;
- successful save after deliberate mutation replaces source and clears warning.

---

## Later write failure

Test:
- user edit commits in memory;
- history records it;
- save throws;
- app remains mounted/usable;
- Undo works;
- Redo works;
- persistent unsaved status remains.

---

## Retry success

Test:
- one save fails;
- later normal mutation causes retry;
- retry succeeds;
- current state is written;
- persistent warning clears.

---

## Later state exceeds storage envelope

Test:
- valid loaded collection grows beyond an app storage limit;
- edit remains;
- history remains;
- `setItem` is not called for the over-limit state;
- persistent unsaved/capacity warning appears;
- reducing state back within envelope allows later successful save and warning clear.

---

## Quota-style failure

Mock `DOMException('...', 'QuotaExceededError')`.

Test:
- treated as write failure;
- no rollback;
- persistent unsaved state;
- later retry can succeed.

Do not require browser-specific user wording.

---

## Dense/broad/larger regression

Regenerate and test:

- dense;
- broad;
- larger modded pair if generator remains available or can be reproduced cheaply.

All must remain recoverable through browser storage.

Do not commit multi-megabyte fixture JSON.

---

# Atomicity and source preservation

For any unrecoverable stored source:

- raw source remains untouched;
- fallback is in-memory only until deliberate mutation;
- no partial replacement;
- no history mutation from startup recovery itself;
- no storage write merely because fallback exists.

For any later save failure:

- in-memory edit remains;
- history remains;
- stored prior successful version remains untouched.

---

# Documentation

Update durable documentation.

At minimum:
- `docs/ARCHITECTURE.md`;
- relevant persistence/recovery section(s);
- `docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md` if needed to mark findings as implemented;
- `docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md` if needed to mark the envelope as implemented.

Keep:
- audits under `docs/audits/`;
- benchmarks under `docs/benchmarks/`.

Do not create transient audit-number docs.

---

# Accessibility

Persistent recovery/unsaved warnings must remain accessible.

Use existing live/status semantics appropriately.

Avoid:
- repeated announcement spam on every failed autosave;
- modal traps;
- focus stealing.

A status transition should be announced meaningfully, but an unchanged persistent warning should not be re-announced on every render.

---

# Non-goals

Do not in this task:

- change external import limits;
- add recovery file download/export;
- add backup storage keys;
- add a recovery-management UI;
- redesign whole status bar;
- change export filename handling;
- optimize cargo/provenance validation;
- change Undo/Redo history limits;
- change gameplay domain caps;
- add server/backend persistence;
- add dependencies without strong justification.

---

# Verification

Run at minimum:

- focused storage/recovery tests;
- focused migration/coherence tests;
- focused startup/component persistence tests;
- focused collection/history tests;
- regenerate browser-storage benchmark fixtures where needed;
- confirm dense storage recovery;
- confirm broad storage recovery;
- confirm larger modded pair storage recovery if available;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If there is a reasonable browser smoke test for:
- normal save;
- forced quota/write failure via test harness;
- later retry success;

run it and report it.

Do not perform a broad manual browser campaign unless implementation behavior differs unexpectedly from the tested benchmark assumptions.

---

# Completion response

Return:

1. concise implementation summary;
2. files changed;
3. final browser-storage resource envelope implemented;
4. exact load/recovery ordering;
5. how raw source preservation works;
6. how fallback autosave suppression works;
7. what counts as deliberate mutation;
8. persistence/recovery state model;
9. read-failure behavior;
10. malformed/unrecoverable behavior;
11. migration-failure behavior;
12. normalized re-save failure behavior;
13. later save/quota failure behavior;
14. retry-success behavior;
15. behavior when live state exceeds storage envelope;
16. partial-salvage correction;
17. localization/status changes;
18. preference-storage containment, if any;
19. exact-limit/one-over test coverage;
20. dense fixture result;
21. broad fixture result;
22. larger fixture result if tested;
23. verification commands/results;
24. documentation updated;
25. confirmation external import behavior is unchanged;
26. confirmation Undo/Redo remains functional through save failures;
27. confirmation no recovery backup key/download UI was added;
28. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
