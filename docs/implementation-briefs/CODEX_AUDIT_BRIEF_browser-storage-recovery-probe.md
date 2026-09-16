# Codex Audit Brief — Browser Storage and Recovery Probe

## Objective

Conduct a read-only code inspection and focused probe of the tracker’s browser-storage and recovery behavior before implementation work begins.

The goal is to answer one remaining design question:

> Does browser-stored application state require its own independent resource-safety boundary, distinct from the strict external-import capacity limits that are already implemented?

This task should also map the current load/save/recovery architecture and identify the cheapest test seams for the later robustness implementation.

This is **not an implementation task**.

Do not change production behavior.

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

## Output location

Create the audit report under:

`docs/audits/`

Use a durable descriptive filename, for example:

`docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md`

Do not place this report in top-level `docs/`.

Do not place it in `docs/benchmarks/` unless substantial empirical timing/size benchmarking becomes necessary; if that occurs, explain why before creating a separate benchmark report.

---

## Read first

Inspect the current synced repository state, especially:

- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- current browser-storage abstraction;
- current collection load/save code;
- startup/bootstrap orchestration;
- collection migration code;
- current external import/deserialization code;
- current error/status handling;
- collection/history reducer;
- current tests covering persistence, recovery, migration, import rejection, and startup;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- relevant existing audit reports in `docs/audits/`.

Use the current committed repo as the source of truth.

---

## Product decisions already settled

Do not reopen these unless the existing implementation makes one impossible.

### Recovery philosophy

Browser storage is app-owned state and should remain more forgiving than external file import.

Preferred behavior:

- recover structurally unambiguous, migratable state;
- reject/fallback only when state cannot be interpreted safely;
- do not silently erase recoverable user intent;
- do not silently drop individual saved networks from a malformed collection merely to salvage the rest.

### Unrecoverable stored data

Preferred behavior:

- app starts in a fresh usable state;
- clearly reports that stored state could not be loaded;
- original failed stored payload is **not immediately overwritten merely because fallback occurred**.

### Save failure

Preferred behavior:

- in-memory edit succeeds;
- persistence failure is reported;
- edit is not rolled back solely because persistence failed;
- Undo/Redo continues to function in-memory.

### Persistence warning

Preferred behavior:

- persistent/visible unsaved-state indication until a later save succeeds;
- avoid modal/native-alert recovery UX.

### Retry behavior

Preferred behavior:

- subsequent normal edits/save opportunities automatically retry persistence;
- successful later save clears the persistence warning.

### Partial collection salvage

Preferred behavior:

- no silent partial salvage of a malformed multi-network collection;
- deterministic migration/repair is acceptable;
- ambiguous/incoherent collection state should not be partially dropped behind the user’s back.

### Migration failure

Preferred behavior:

- preserve the original serialized representation;
- do not overwrite source data until migration and validation have fully succeeded.

### Successful migration + failed re-save

Preferred behavior:

- migrated in-memory state remains usable;
- persistence failure is reported;
- original stored representation remains available until a successful save occurs.

### Scope

The future implementation should be a narrow robustness/recovery correction, not a full recovery-management product feature.

Do not design download-recovery/reset-management UI in this probe unless the existing architecture makes it clearly necessary.

---

## Core questions to answer

### 1. Current persistence flow

Map the exact current flow for:

- application startup;
- reading browser storage;
- parsing stored JSON;
- collection/schema migration;
- current-shape validation;
- fallback/default creation;
- in-memory collection initialization;
- automatic save/write behavior;
- later edits;
- history;
- reload.

Identify concrete files/functions.

A concise flow diagram or bullet sequence in the report is welcome.

---

### 2. Storage abstraction

Determine:

- whether all `localStorage` access goes through one abstraction;
- where `getItem`, `setItem`, `removeItem`, or equivalent calls occur;
- whether serialization happens before or inside that abstraction;
- whether storage exceptions are caught;
- whether `JSON.stringify` failures are caught;
- whether `JSON.parse` failures are caught;
- whether reads/writes are synchronous;
- what return/error contract the abstraction exposes.

Identify any direct browser-storage calls that bypass the abstraction.

---

### 3. Malformed stored JSON

Determine current behavior if the stored value:

- is not valid JSON;
- parses to the wrong top-level type;
- lacks required collection shape;
- contains invalid identities;
- contains an unsupported schema;
- contains malformed nested state.

Answer:

- Does startup fail?
- Does the app fall back?
- Is an error surfaced?
- Is the bad payload preserved?
- Is it overwritten immediately or on the next automatic save?

---

### 4. Migration behavior

Determine:

- when migration occurs relative to validation;
- whether the original serialized payload is preserved during migration;
- whether migrated state is written back automatically;
- what happens if migration throws/fails;
- what happens if migrated state is valid in memory but re-save fails;
- whether any migration step silently drops malformed state.

This probe should distinguish deterministic historical migration from forgiving recovery of malformed data.

---

### 5. Read failures / unavailable storage

Probe or inspect behavior when browser storage access itself fails.

Examples:
- `localStorage.getItem()` throws;
- storage is unavailable;
- browser/private/hardened mode denies access.

Determine whether the app:
- crashes;
- falls back;
- reports the failure;
- continues usable in-memory.

Use mocks/test seams rather than trying to force browser privacy modes unless a real-browser check is trivial.

---

### 6. Write failures

Probe or inspect behavior when:

- `localStorage.setItem()` throws;
- quota is exceeded;
- storage becomes unavailable after startup;
- serialization succeeds but storage write fails.

Determine:
- whether the user edit remains in memory;
- whether history remains intact;
- whether the UI knows the save failed;
- whether later edits retry;
- whether any failure is swallowed;
- whether the app can incorrectly appear “saved”.

If quota errors are browser-specific DOMExceptions, identify how current code sees them.

Do not add production handling in this task.

---

### 7. Fallback overwrite risk

This is a critical question.

Determine whether any startup failure can lead to this sequence:

1. stored payload fails to load;
2. app falls back to a default/fresh collection;
3. normal initialization/autosave immediately writes that default collection;
4. original failed payload is destroyed before the user has any recovery opportunity.

If this can happen, document the exact path.

If it cannot happen, explain why.

---

### 8. Partial-salvage behavior

Determine whether current recovery logic can:

- discard one bad network and keep others;
- filter malformed outposts/pads/links;
- silently remove unknown nested state;
- repair duplicate/empty identities;
- otherwise mutate malformed stored state into something accepted.

Classify each behavior as:
- deterministic migration;
- explicit recovery;
- silent lossy cleanup;
- not present.

This is important because the future implementation should avoid invisible user-data loss.

---

### 9. Interaction with external-import capacity limits

Determine whether browser-storage loading currently calls:

- `deserializeNetworkCollection`;
- `validateExternalImportCapacity`;
- strict external structural validation;
- any shared capacity helper.

Answer clearly:

> Are the newly implemented external-import limits currently applied to browser-storage recovery?

If yes:
- identify which limits;
- explain whether that was intentional or incidental.

If no:
- confirm storage recovery remains separate.

---

### 10. Browser-storage resource-safety risk

This is the primary design question.

Assess whether arbitrary stored state can cause a resource-exhaustion problem before safe fallback.

Consider at least:

- extremely large stored strings;
- deeply nested JSON;
- huge arrays;
- many networks/outposts/pads;
- long string values;
- migration cost;
- validation cost;
- serialization/write cost;
- synchronous main-thread blocking.

Important:
- `localStorage` itself has browser quota limits, but do not assume quota alone is a sufficient safety boundary;
- devtools/extensions/older app versions may create pathological state;
- browser quota differs by implementation.

Answer:

> Does browser-storage recovery need its own hard defensive bound?

Possible conclusions include:

A. No independent bound needed; existing browser/storage constraints and current recovery architecture are sufficient.

B. Yes, but the same external-import envelope can safely be reused.

C. Yes, but storage needs a distinct looser/tighter bound.

D. More empirical benchmarking is required before choosing a bound.

Support the conclusion with concrete implementation evidence.

---

### 11. If a storage bound appears necessary

Do not implement it.

Instead identify what should be measured before choosing it.

Potential measurements:
- maximum realistic persisted collection size;
- dense/broad validated fixtures in localStorage;
- parse/migration/validation time from storage;
- synchronous `setItem` time;
- behavior near browser quota;
- malformed/deep nested state.

Recommend only the smallest useful benchmark needed.

If the validated dense/broad fixtures already provide sufficient evidence, say so.

---

### 12. Existing test seams

Identify the cheapest existing seams for the eventual implementation tests.

Specifically look for ways to test:

- malformed stored JSON;
- unsupported schema;
- storage read exception;
- storage write exception;
- quota-style write failure;
- fallback without overwrite;
- migrated load + failed re-save;
- later retry success;
- persistent unsaved status;
- history remaining usable after save failure.

State whether each can be tested with:
- pure unit test;
- storage abstraction test;
- reducer/session test;
- component test;
- startup integration test.

Do not build substantial new test infrastructure during this probe.

---

## Focused probe changes allowed

This is primarily read-only, but small probe-only additions are allowed if necessary to answer behavior empirically.

Allowed:
- temporary/local scripts under ignored working directories;
- focused test-only probe code;
- audit documentation.

Do not change production behavior.

If a probe test is useful enough to keep permanently and only documents existing behavior, you may include it, but explain why.

Prefer not to add committed test code unless it materially improves the audit.

---

## Browser testing

Do not perform a broad cross-browser manual campaign.

If a real browser check is needed to clarify one storage API behavior, keep it minimal and record:
- browser/version;
- what was tested;
- what was not tested.

Most failure modes should be tested through mocks/stubs.

---

## Storage quota

Do not attempt a comprehensive quota survey.

The probe should answer:
- how quota failure would surface through the current code;
- whether it is caught;
- whether current dense/broad fixtures persist successfully;
- whether quota characterization is needed before implementation.

Cross-browser quota limits themselves are not the deliverable.

---

## Audit report structure

Create:

`docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md`

Suggested sections:

1. Scope
2. Current persistence architecture
3. Startup/load flow
4. Save flow
5. Current failure behavior
6. Migration/recovery behavior
7. Fallback overwrite risk
8. External-import limit interaction
9. Resource-safety assessment
10. Storage-bound recommendation
11. Test seams
12. Recommended future implementation behavior
13. Open questions
14. Verification / limitations

---

## Recommended future behavior section

Compare the current implementation against the already-settled product decisions in this brief.

Use a table if helpful:

| Scenario | Current behavior | Desired future behavior | Gap? |

Include at least:
- malformed JSON;
- unsupported/unrecoverable stored collection;
- migration failure;
- migrated load + failed save;
- read exception;
- write exception;
- quota failure;
- later retry success;
- fallback overwrite;
- partial malformed collection.

Do not implement the gaps in this task.

---

## Verification

Run relevant existing tests needed to confirm inspected behavior.

At minimum:
- storage/persistence tests;
- migration/serialization tests;
- collection/history tests;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If probe-only tests/scripts are created, run and report them.

Do not alter production code just to make a test easier.

---

## Completion response

Return:

1. concise summary of current browser-storage architecture;
2. exact load/save flow;
3. current malformed-data behavior;
4. current migration-failure behavior;
5. current read-failure behavior;
6. current write/quota-failure behavior;
7. whether fallback can overwrite failed source data;
8. whether partial salvage/lossy cleanup exists;
9. whether external-import capacity limits currently affect browser-storage recovery;
10. resource-safety assessment;
11. recommendation on an independent storage bound;
12. any benchmark/probe recommended before implementation;
13. cheapest test seams for the future correction;
14. files created/changed;
15. verification commands/results;
16. known limitations;
17. confirmation that production behavior was not changed;
18. confirmation that no commit or push was performed.

Do not commit or push unless explicitly instructed.
