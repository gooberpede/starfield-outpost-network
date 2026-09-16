# Codex Benchmark Brief — Browser Storage Capacity Envelope

## Objective

Run a focused browser-storage benchmark/probe to choose a defensible production resource-safety envelope for browser-stored gameplay state.

This benchmark exists to answer one remaining design question before the browser-storage/recovery implementation:

> What raw-size and structural bounds should apply to browser-stored state so startup/load/save work remains safe and responsive, while still preserving legitimate historical/modded state more permissively than strict external import?

This is a **benchmark/probe task**, not a production implementation task.

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

Create the benchmark report under:

`docs/benchmarks/`

Use a durable descriptive filename such as:

`docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md`

Do not place it in top-level `docs/`.

Do not place it in `docs/audits/`; the architecture/risk inspection is already captured in:

`docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md`

---

## Read first

Inspect the current synced repository state, especially:

- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- `docs/audits/BROWSER-STORAGE-RECOVERY-PROBE.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- browser storage abstraction/load/save code;
- migration code;
- startup/bootstrap flow;
- benchmark fixture generator(s);
- ignored generated dense/broad fixtures from the import-capacity work;
- existing storage/persistence tests.

Use the current committed repository as the source of truth.

---

## Settled design context

Do not reopen these decisions.

Browser storage recovery should:

- remain more forgiving than external file import;
- preserve original failed source data until a deliberate successful save policy allows replacement;
- fall back to usable in-memory state when recovery fails;
- keep in-memory edits and Undo/Redo when persistence fails;
- show a persistent unsaved/recovery indication until a later successful save;
- retry persistence on later normal save opportunities;
- avoid silent partial salvage of malformed saved networks;
- preserve deterministic historical migration;
- keep migrated in-memory state usable if re-save fails;
- remain a narrow robustness/recovery correction rather than a full recovery-management feature.

The only unresolved question for this benchmark is the **resource-safety envelope** for browser-stored state.

---

## Benchmark philosophy

Do not automatically reuse the external-import limits.

External file import and browser storage have different semantics:

### External import
- untrusted file boundary;
- strict structure;
- 4 MiB file guard;
- strict capacity ceilings;
- malformed state rejected.

### Browser storage
- app-owned/historical state;
- must support deterministic migration and more forgiving recovery;
- current storage is synchronous;
- recovery should not silently destroy user state;
- still needs defensive bounds before expensive parsing/migration.

The benchmark should therefore determine a separate browser-storage envelope.

---

## Core benchmark questions

Answer these questions empirically.

### 1. Normal legitimate storage cost

For the existing validated **dense** and **broad** fixtures, measure real-browser storage lifecycle cost.

At minimum record:

- raw stored string length in UTF-16 code units;
- UTF-8 byte size if convenient;
- `localStorage.getItem`;
- `JSON.parse`;
- migration;
- normalization/current-shape handling currently performed by the loader;
- `JSON.stringify`;
- `localStorage.setItem`;
- full current `loadNetworkCollection` end-to-end time;
- time from application reload/start to first usable/rendered UI if practical.

The goal is to separate:
- browser storage API cost;
- JSON work;
- migration work;
- full startup/user-visible cost.

---

### 2. Later save cost

Using the same fixtures, measure a representative later collection edit/save path.

At minimum:
- one normal edit that changes the collection;
- serialization cost;
- `setItem` cost;
- end-to-end action/save completion if measurable.

Do not require exact React frame timing.

---

### 3. Larger but plausible stored collection

Generate or reuse one collection larger than the validated dense/broad fixtures but still plausibly recoverable/modded.

This fixture should be intentionally above the ordinary validated storage shape without becoming absurd.

Possible strategy:
- increase collection breadth;
- increase one dense active network;
- or combine multiple moderately dense networks.

The exact dimensions are up to Codex after inspecting the existing generator.

Requirements:
- deterministic;
- structurally compatible with browser-storage migration/load;
- not designed to violate every axis simultaneously;
- large enough to show whether storage time scales materially beyond dense/broad.

Report:
- raw string size;
- member counts;
- network/outpost/link/pad counts;
- lifecycle timings.

---

### 4. Deliberately oversized/pathological stored payload

Create one or more mock-only pathological values to test proposed defensive ordering.

At minimum include one case that demonstrates why a bound should be checked **before migration**.

Examples:
- very large raw JSON string;
- deep nesting;
- huge arrays;
- long strings.

Do not feed dangerously large pathological values into the real browser if that risks freezing it.

Use a mock/local harness where appropriate.

The benchmark should identify:
- what can be rejected by raw string length before `JSON.parse`;
- what requires bounded structural traversal after parsing;
- whether a depth bound is needed independently of array/member/string limits.

---

## Browser targets

For real storage timing, one named desktop Chromium-family browser is sufficient for the primary benchmark.

Preferred order:
1. Microsoft Edge;
2. Google Chrome.

Firefox should be used only if:
- storage behavior appears materially different;
- quota/write failure semantics differ;
- or it is cheap to run the same benchmark for comparison.

Do not run a broad cross-browser campaign.

Record exact browser version.

---

## Real-browser method

Use real browser execution, not jsdom, for storage timing.

Automation is preferred where available, but manual timing/probe code is acceptable.

The benchmark may use:
- browser Performance API;
- small instrumentation hooks in a local benchmark harness;
- dev-only/local scripts;
- browser console timing;
- another non-production probe mechanism.

Do not add substantial production instrumentation.

Do not permanently alter `loadNetworkCollection` merely for benchmark timing.

If temporary instrumentation is needed, keep it probe-only or clearly isolated.

---

## Quota/write behavior

This task does **not** require a comprehensive browser quota survey.

The goal is only to determine enough to choose a conservative storage envelope.

At minimum:

- confirm dense and broad fixtures save successfully in the chosen real browser;
- confirm the larger plausible fixture saves successfully or record failure;
- probe one or more increasing raw sizes until:
  - write failure occurs, or
  - a reasonable upper test point is reached.

Record:
- approximate stored size at each step;
- whether `setItem` succeeds;
- thrown exception name if it fails;
- observed latency.

Do not attempt to fill the entire browser profile storage quota through destructive or uncontrolled testing.

Use a dedicated key/local test page if appropriate.

Clean up benchmark keys afterward.

---

## Do not equate quota with safety

The report must explicitly distinguish:

- browser quota limit;
- application resource-safety limit;
- acceptable user-perceived latency.

Even if the browser allows a very large string, the app may need a much smaller defensive bound because:
- storage is synchronous;
- parse/migration/stringify are main-thread work;
- whole-collection saves happen after collection changes.

---

## Candidate storage-bound dimensions

The benchmark should recommend whether browser storage needs hard limits for:

- raw stored string length;
- aggregate array members;
- networks;
- outposts/network;
- pads/outpost;
- links/network;
- manufacturing/outpost;
- Planned Supply/outpost;
- outbound items/pad;
- string length;
- nesting depth.

Do not assume all of these need distinct ceilings.

A good conclusion may be:

- raw size + aggregate members + bounded nesting are sufficient;
- or raw size plus a looser version of selected per-array ceilings;
- or another small combination.

Prefer the smallest robust set of limits.

---

## Storage bound should be looser than external import where justified

External import currently uses:

- 4 MiB file size;
- 64 networks;
- 96 outposts/network;
- 12 pads/outpost;
- 256 links/network;
- 256 manufacturing/outpost;
- 256 Planned Supply/outpost;
- 128 outbound/pad;
- 25,000 aggregate array members;
- 4,096 UTF-16 units/string.

Browser storage may need:
- more headroom;
- fewer distinct structural limits;
- or a different raw-size ceiling.

The benchmark should recommend numbers based on measured cost, not symmetry.

---

## Acceptance baseline

The storage envelope must comfortably admit the existing dense and broad fixtures.

They are known legitimate near-envelope collections from the previous validation work.

A proposed storage ceiling that rejects either existing dense or broad fixture is unacceptable unless the benchmark uncovers a concrete safety reason.

---

## Responsiveness criteria

Do not invent a strict frame-time target.

Classify observed operations using practical categories:

- imperceptible;
- noticeable but acceptable;
- sluggish;
- problematic;
- browser warning/failure.

Where reliable timing is available, report milliseconds.

For startup/save, multi-second stalls should be treated as a meaningful problem.

Sub-second work can still be noted if clearly noticeable.

---

## Suggested fixture set

At minimum benchmark:

1. **Dense**
   - existing generated fixture.

2. **Broad**
   - existing generated fixture.

3. **Larger plausible**
   - deterministic generated storage fixture above dense/broad.

4. **Pathological mock**
   - designed only to test defensive ordering and proposed bound behavior.

Do not create a large fixture zoo.

---

## Benchmark harness

Prefer reusing existing generator and Vite/module-loading patterns.

A dedicated script is acceptable, for example under:

`scripts/`

if it is generally useful and deterministic.

Otherwise keep probe-only scripts under ignored `.local-work/`.

If a script is committed, it must:
- be deterministic;
- avoid production behavior changes;
- cleanly report fixture statistics and timings;
- not write multi-megabyte committed fixture blobs.

---

## Report structure

Create:

`docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md`

Suggested sections:

1. Scope
2. Environment
3. Current storage lifecycle under test
4. Fixtures
5. Raw size/member statistics
6. Real-browser load timing
7. Real-browser save timing
8. Quota/write observations
9. Pathological/mock observations
10. Scaling analysis
11. Recommended browser-storage envelope
12. Rationale vs external-import envelope
13. Remaining uncertainty
14. Verification

---

## Recommended envelope section

The final report should recommend concrete production values.

At minimum state:

### Raw stored string ceiling
Give:
- exact proposed number;
- unit;
- inclusive/exclusive semantics.

### Structural ceiling(s)
Give:
- exact proposed values;
- definitions;
- why each is needed.

### Nesting-depth policy
State whether:
- an explicit depth ceiling is needed;
- bounded iterative traversal alone is enough;
- or depth should be implicitly bounded by another rule.

### String-length policy
State whether:
- storage can reuse 4,096 UTF-16 units;
- should be looser;
- or needs no independent per-string ceiling once raw/member limits exist.

---

## Proposed implementation ordering

Without implementing it, recommend the future defensive sequence.

Likely shape:

1. `getItem`;
2. raw stored-string size check;
3. `JSON.parse`;
4. bounded storage-recovery structural/resource traversal;
5. deterministic migration;
6. current-shape/recovery decision;
7. in-memory state;
8. attempted normalized save;
9. status/retry behavior on failure.

Confirm or revise this ordering based on findings.

---

## Failure preservation

The benchmark should keep the future recovery rule in view:

A stored payload that exceeds the storage safety envelope should **not** be immediately overwritten by fallback state merely because recovery refuses to process it.

This task does not implement that behavior, but the report should state it explicitly so the later implementation brief preserves it.

---

## Production scope

Do not in this task:

- change storage load/save behavior;
- add production bounds;
- change migration;
- change fallback behavior;
- add unsaved-state UI;
- change retry semantics;
- change external-import limits;
- change history;
- add recovery download/reset UI;
- change export filename handling;
- add new dependencies without strong justification.

---

## Verification

Run at minimum:

- benchmark fixture generation;
- real-browser timing probe;
- relevant storage/persistence tests;
- relevant migration tests;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If a committed benchmark script is added, run it and report the exact command.

If a browser automation/tooling limitation prevents one metric, state that limitation rather than substituting jsdom.

---

## Completion response

Return:

1. concise benchmark summary;
2. files created/changed;
3. browser and exact version tested;
4. dense fixture storage statistics;
5. broad fixture storage statistics;
6. larger plausible fixture statistics;
7. load timing breakdown;
8. save timing breakdown;
9. quota/write observations;
10. pathological/mock findings;
11. recommended raw storage ceiling;
12. recommended structural/member ceilings;
13. recommended nesting-depth policy;
14. recommended per-string policy;
15. comparison with external-import limits;
16. recommended future defensive ordering;
17. remaining uncertainty;
18. verification commands/results;
19. confirmation that production behavior was not changed;
20. confirmation that no commit or push was performed.

Do not commit or push unless explicitly instructed.
