# Codex Benchmark Brief — History Capacity and Performance Investigation

## Objective

Build a **development-only history benchmark harness** for Starfield Outpost Network.

Do **not** implement a production history cap yet.

The purpose of this parcel is to gather evidence about practical history depth by generating realistic edit workloads automatically through the same editing/session paths the app already uses, then measuring performance at increasing history depths.

The benchmark should help answer:

> At what history depth do memory growth or Undo/Redo latency become meaningfully worse compared with a realistic session that appears to need only a few hundred deliberate history entries?

---

# PART A — READ FIRST

Review:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect current implementation of:

```text
CollectionEditingSession
history entry creation
whole-collection before/after snapshots
Undo/Redo traversal
context restoration
outpost/network editing actions
cargo pad editing
cargo links
manufacturing
planned supply
import/collection replacement
```

Also inspect the supplied exported collection:

```text
starfield-outposts-rhea-205-2026-09-09-213844.json
```

Use it as a **representative workload reference**, not as a direct memory estimate.

Important:

- the export describes final persisted state, not historical intermediate states;
- serialized JSON size must not be multiplied by history depth to estimate heap use;
- history snapshots may retain structural sharing in memory that JSON serialization destroys.

---

# PART B — REPRESENTATIVE WORKLOAD BASIS

The supplied export contains two substantial networks.

Use their structure to define a realistic edit mix rather than inventing a completely synthetic shape.

Approximate final-state scale:

```text
Network 1
    9 outposts
    19 cargo pads
    8 cargo links

Network 2
    14 outposts
    44 cargo pads
    21 cargo links
```

A conservative clean-build decomposition is approximately:

```text
Network 1
    ~133 deliberate history-producing operations

Network 2
    ~243 deliberate history-producing operations

Combined collection
    ~376 clean-build operations
```

These are approximate planning figures only. Do not hardcode them as correctness assertions.

The important conclusion is:

> A realistic substantial session likely needs history measured in the hundreds rather than the thousands.

---

# PART C — BENCHMARK PRINCIPLES

## 1. Do not fake history entries

The benchmark must not directly append fabricated history entries.

Instead, exercise the same editing/session APIs used by normal app behavior so history grows naturally.

Every benchmarked entry should result from a legitimate editing transaction.

---

## 2. Prefer non-UI orchestration

Do not automate DOM clicking merely to create history.

Prefer exercising the application/session/domain editing APIs directly.

The benchmark should be deterministic, fast, and repeatable.

Use the UI only if a browser-accessible trigger is later needed for heap observation.

---

## 3. Keep benchmark code dev-only

Do not create user-facing product UI.

Preferred homes include:

```text
tests/benchmarks/
scripts/
src/dev/
```

or another clearly non-production location.

If a temporary browser-accessible benchmark trigger is needed, gate it so it cannot appear in normal production behavior.

Do not add benchmark controls to the normal interface.

---

# PART D — WORKLOAD MIX

## 4. Create a representative mixed workload

Use a deterministic scripted cycle with a mix of operation types roughly inspired by the supplied export.

Include at least:

```text
small scalar edits
outpost creation
outpost rename
system/body selection
biome selection
resource/production toggles
manufacturing edits
planned-supply edits
cargo pad additions
cargo pad type changes
outbound item assignments
cargo link creation
```

The exact proportions do not need to reproduce the export byte-for-byte.

The goal is to approximate a mature network-building session.

---

## 5. Include structural edits

Include operations that change membership/shape, such as:

```text
add outpost
remove outpost
add cargo pad
remove cargo pad
create cargo link
remove cargo link
```

Use them at a lower frequency than ordinary value edits.

Preserve existing domain validity where practical, but the benchmark does not need to create an aesthetically perfect network.

---

## 6. Include small edits

Include cheap operations such as:

```text
character level change
rename outpost
toggle production
change manufacturing quantity
planned supply add/remove
```

This helps measure the common case.

---

# PART E — SEPARATE IMPORT/REPLACEMENT STRESS CASE

## 7. Benchmark whole-collection replacement separately

Whole-collection import/replacement may share substantially less structure with the prior collection than normal nested edits.

Create a separate stress case that repeatedly performs legitimate whole-collection replacement transactions using valid collections.

Do not conflate this with the representative mixed workload.

Measure it separately and label results clearly.

Possible pattern:

```text
Collection A
↔
Collection B
```

or a series of distinct deterministic collections.

Ensure the operation uses the same application/session import/replacement path that creates one history entry for import.

---

# PART F — HISTORY DEPTH CHECKPOINTS

## 8. Run checkpoints

Support at least:

```text
0
250
500
1000
2000
5000
10000
```

The harness may generate one long run and record checkpoints, or perform separate runs.

Prefer whichever gives cleaner measurements.

Do not assume all checkpoints will be equally meaningful.

If very large checkpoints become prohibitively slow, report that rather than hiding it.

---

# PART G — MEASUREMENTS

## 9. Record history depth

At each checkpoint record:

```text
history entries
undo depth
redo depth
current collection/network/outpost context
```

Ensure history depth matches expected transaction count.

---

## 10. Measure workload generation time

Record elapsed time to create each block of history.

At minimum report:

```text
time to reach 250
time to reach 500
time to reach 1000
time to reach 2000
time to reach 5000
time to reach 10000
```

Also report incremental block times if easy.

---

## 11. Measure Undo latency

At each checkpoint, measure representative Undo traversal latency.

Prefer more than one sample, e.g.:

```text
undo 1 step
undo 10 steps
undo 100 steps
```

where practical.

Do not measure only the first step after a cold start.

Report:

```text
mean or median per-step latency
worst observed latency
```

Exact methodology should be documented.

---

## 12. Measure Redo latency

After Undo sampling, measure equivalent Redo traversal latency.

Confirm context restoration remains correct during benchmark traversal.

---

# PART H — MEMORY OBSERVATION

## 13. Node/V8 memory is comparative only

If the benchmark runs under Node, it may record:

```text
process.memoryUsage()
heapUsed
heapTotal
external
rss
```

Treat this as **comparative diagnostic data**, not authoritative browser memory.

Where possible:

- run with explicit GC support if the project can do so safely;
- measure after GC at checkpoints;
- document whether GC was available.

Do not add production dependencies solely for memory measurement.

---

## 14. Browser heap support

Provide a practical way to reproduce the same deterministic workload in the browser for manual Chrome DevTools heap inspection.

Preferred options:

```text
dev-only query parameter
dev-only console-accessible function
dev-only benchmark module callable from DevTools
```

Avoid visible production UI.

The browser run should allow pausing at checkpoints such as:

```text
500
1000
2000
5000
```

so the user can:

```text
force GC
take heap snapshot
record JS heap size
continue
```

If Chrome exposes `performance.memory` in the current environment, it may be displayed as supplemental data, but do not rely on it as the sole measurement source.

---

# PART I — BENCHMARK OUTPUT

## 15. Produce machine-readable results if practical

Prefer a clear result structure such as:

```json
{
  "workload": "representative",
  "checkpoint": 1000,
  "historyDepth": 1000,
  "elapsedMs": 1234,
  "undoMedianMs": 0.8,
  "redoMedianMs": 0.7,
  "heapUsedBytes": 12345678
}
```

A simple console table/JSON output is sufficient.

Do not build a dashboard.

---

## 16. Produce human-readable summary

At the end of a benchmark run, print a concise table such as:

| Depth | Build time | Undo median | Redo median | Heap used* |
|---:|---:|---:|---:|---:|
| 250 | ... | ... | ... | ... |
| 500 | ... | ... | ... | ... |
| 1000 | ... | ... | ... | ... |

Mark Node heap values clearly as non-browser/comparative if applicable.

---

# PART J — CORRECTNESS GUARDS

## 17. Preserve real history behavior

The benchmark must use current production history semantics:

```text
whole-collection snapshots
working-context capture
Network + Outpost restoration
one deliberate action per history entry
```

Do not create benchmark-only history shortcuts.

---

## 18. Validate context restoration

Include a benchmark or test case where edits occur across multiple networks/outposts.

After Undo/Redo sampling, verify:

```text
active Network
selected Outpost
collection state
```

are restored through the existing path.

---

## 19. Avoid accidental history pollution

Benchmark setup steps that are not intended to count toward measured history should happen before measurement begins or use a clearly defined baseline.

Document which operations count.

---

# PART K — TESTING THE HARNESS

## 20. Add focused benchmark-harness tests

Test at least:

```text
requested depth produces expected history depth
representative workload uses legitimate session edits
Undo/Redo returns to expected state
context restoration remains correct
whole-collection replacement benchmark creates one entry per replacement
benchmark is deterministic
benchmark code is not reachable in ordinary production UI
```

Do not make normal test suite runtime unreasonable.

If full 10,000-entry runs are too slow for routine `npm test`, keep them as explicit benchmark commands rather than normal unit tests.

---

# PART L — COMMAND / EXECUTION EXPERIENCE

## 21. Make benchmark execution obvious

Add one or more clear development commands, e.g. conceptually:

```text
npm run benchmark:history
npm run benchmark:history -- --depth 1000
```

Exact package scripts are up to the repository structure.

A developer inspecting the repo should be able to find and run the benchmark without reading implementation internals.

If browser benchmarking requires a separate dev command, document it concisely.

---

# PART M — DOCUMENTATION

## 22. Do not make a history-cap decision yet

Update `docs/BACKLOG.md` only if needed to record that history-size investigation is now in progress or benchmark tooling exists.

Do not remove the history-size investigation item until results have been reviewed and a policy is decided.

Do not write a cap into durable docs.

---

## 23. Add benchmark usage notes

Add a small development note in an appropriate existing doc or a focused benchmark README if necessary.

Document:

```text
what the benchmark measures
how to run it
representative vs replacement workload
checkpoint meanings
Node heap caveat
browser heap workflow
```

Keep it concise.

---

# PART N — OUT OF SCOPE

Do not:

```text
implement a production history cap
truncate history
change history entry structure
change Undo/Redo UX
change import/export semantics
change network/outpost schemas
change localization
add product-facing benchmark UI
add analytics/telemetry
add external profiling dependencies unless truly necessary
commit
push
```

---

# PART O — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also run at least one representative benchmark at:

```text
250
500
1000
```

and one larger stress checkpoint if practical:

```text
2000 or 5000
```

Do not require 10,000 as a blocking verification if runtime is excessive; report whether it was run.

Run the separate whole-collection replacement benchmark at a smaller but meaningful depth.

---

# PART P — COMPLETION REPORT

Report:

### Harness architecture

Explain:

```text
where benchmark code lives
how it generates legitimate history
how representative workload is constructed
how import/replacement workload differs
```

### Execution

Provide exact commands.

### Results

Include measured results for all checkpoints actually run.

### Memory methodology

State clearly:

```text
Node/V8 memory method
whether explicit GC was available
browser heap method
what still requires manual DevTools observation
```

### Correctness

Confirm:

```text
history depth matches expected operations
Undo/Redo still restores Network + Outpost context
benchmark does not alter production behavior
```

### Files changed

List all files.

### Verification

Report exact results for:

```text
npm test
npm run build
npm run lint
git diff --check
```

### Deferred decision

Explicitly state:

> No production history limit was implemented; benchmark results are for subsequent policy discussion.

Do not commit or push.

---

## Final instruction

The goal is not to find the absolute theoretical maximum history depth.

The goal is to establish a practical evidence base around realistic use:

> **A mature real network appears to require only a few hundred clean-build history operations, so measure how performance and memory behave at 250, 500, 1000, 2000, 5000, and 10000 entries before deciding whether a production cap is needed and where it should sit.**
