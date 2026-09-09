# Codex Correction Brief — Replacement History Benchmark Must Use Distinct Collection Graphs

## Objective

Make one **targeted correction** to the history-capacity benchmark harness before commit.

The representative mixed-workload benchmark is acceptable as implemented.

The issue is limited to the current **whole-collection replacement stress benchmark**.

At present, the benchmark pre-creates two collections and repeatedly alternates between those same two object graphs:

```text
A → B → A → B → A → B ...
```

That causes later history entries to retain repeated references to the same two collection objects rather than simulating a sequence of substantially unrelated imported collections.

As a result, the current replacement memory result materially understates the memory cost of repeated import/replacement history.

Fix only this replacement benchmark.

Do not redesign the representative workload or implement a production history cap.

---

# PART A — READ FIRST

Review the current uncommitted benchmark implementation, especially:

```text
src/dev/historyBenchmark.ts
scripts/history-benchmark.ts
tests/historyBenchmark.test.ts
docs/HISTORY-BENCHMARK.md
docs/BACKLOG.md
```

Also inspect the production collection replacement/import history path used by:

```text
replace-collection
Import networks
CollectionEditingSession
```

Preserve the existing benchmark architecture unless required for this correction.

---

# PART B — CURRENT PROBLEM

The current replacement workload conceptually does:

```ts
const replacements = [
  createRepresentativeBenchmarkCollection(1),
  createRepresentativeBenchmarkCollection(2),
]

for each operation:
  replace collection with replacements[operation % 2]
```

This means a 250-entry replacement history retains:

```text
the same Collection A object graph
the same Collection B object graph
plus history/context metadata
```

rather than retaining 250 distinct replacement graphs.

That is not representative of a worst-case import/replacement sequence.

The intended stress shape is closer to:

```text
A → B → C → D → E → ...
```

where each replacement introduces a newly-created deterministic collection graph.

---

# PART C — REQUIRED CORRECTION

## 1. Generate a distinct collection for every replacement entry

For each measured replacement operation, create a **new deterministic collection object graph**.

Conceptually:

```ts
const nextCollection =
  createRepresentativeBenchmarkCollection(operationIndex + seed)
```

or an equivalent deterministic factory.

Requirements:

- every replacement transaction receives a fresh collection root object;
- nested network/outpost/pad/link structures should also be freshly created;
- collections should remain valid;
- generation must remain deterministic for repeatable runs.

Do not merely shallow-clone the same two roots while reusing all nested objects.

The intent is to minimize artificial structural sharing between successive replacement snapshots.

---

## 2. Preserve the production replacement path

Each replacement must still flow through the same existing production action/path used for whole-collection replacement/import history.

Do not:

```text
append fake history entries
write directly to history arrays
skip WorkingContext normalization
skip activeNetworkId handling
```

Each replacement should still create exactly one genuine history entry.

---

# PART D — COLLECTION VARIATION

## 3. Ensure distinctness is meaningful

The replacement collections should not differ only by a trivial root-level property while sharing the same nested graph.

Prefer deterministic variation that results in fresh nested data, for example:

```text
fresh stable IDs
fresh outpost IDs
fresh cargo-pad IDs
fresh cargo-link IDs
small deterministic value differences
```

The exact content need not simulate a human import history perfectly.

The important property is:

> each replacement history entry retains a substantially independent collection graph.

---

## 4. Keep scale representative

Reuse the existing representative mature-network shapes unless there is a compelling reason not to.

Do not dramatically increase collection size in this correction.

The purpose is to isolate:

```text
shared ordinary edit history
vs
largely unshared whole-collection replacement history
```

not to combine replacement stress with a much larger state model.

---

# PART E — TESTING

## 5. Strengthen replacement benchmark tests

Add tests that prove the replacement workload is no longer alternating between the same two collection objects.

At minimum verify:

### Distinct collection roots

For multiple consecutive replacement entries:

```text
before/after collection roots are not the same reused objects
```

### Distinct nested structures

Verify at least one representative nested object/array path differs by identity across successive replacement collections, for example:

```text
network object
outposts array
first outpost object
```

Do not rely only on root inequality if nested structures are still reused.

### One entry per replacement

Preserve the existing assertion that every replacement transaction creates exactly one history entry.

### Determinism

Two benchmark runs with the same seed/depth should produce equivalent logical content/results even though each run creates fresh object identities.

---

# PART F — BENCHMARK RESULTS

## 6. Re-run the replacement stress benchmark

After correction, run at least:

```text
100
250
500
```

replacement entries.

If runtime remains cheap, also run:

```text
1000
```

Do not require 5000/10000 replacement entries unless practical.

Record:

```text
history depth
build time
Undo median/worst
Redo median/worst
heapUsed after GC
```

Clearly distinguish these new numbers from the invalidated earlier replacement-memory figures.

---

## 7. Do not alter representative benchmark results unnecessarily

The mixed representative workload is already useful.

Do not change its generation logic unless required by a shared bug.

If unchanged, retain its existing results and state that only replacement-stress numbers were re-measured.

---

# PART G — DOCUMENTATION

## 8. Update benchmark documentation

Update `docs/HISTORY-BENCHMARK.md` so the replacement workload is accurately described as:

> repeated whole-collection replacements using distinct deterministic collection graphs, intended to approximate low-structural-sharing import history.

If the current document contains the earlier invalid replacement numbers, replace them with the corrected measurements or clearly mark the earlier figures as superseded.

Do not make a history-cap recommendation yet.

---

# PART H — OUT OF SCOPE

Do not:

```text
change the representative mixed workload
implement a production history cap
change history entry structure
change Undo/Redo semantics
change import/export semantics
change collection schemas
add product UI
change browser benchmark trigger
add profiling dependencies
commit
push
```

This is a narrow benchmark-correctness fix.

---

# PART I — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also run the corrected replacement benchmark at:

```text
100
250
500
```

and `1000` if practical.

Report exact results.

Do not commit or push.

---

# PART J — COMPLETION REPORT

Report:

### Correction made

Explain how the replacement workload now guarantees fresh collection graphs.

### Identity verification

Confirm tests prove distinct:

```text
collection roots
nested network/outpost structures
```

across consecutive replacement entries.

### Replacement benchmark results

Provide the corrected table.

### Representative workload

Confirm whether it was unchanged.

### Documentation

Confirm replacement-workload description/results were corrected.

### Verification

Report:

```text
npm test
npm run build
npm run lint
git diff --check
```

### Deferred decision

Restate:

> No production history limit was implemented.

---

## Final instruction

The goal is to correct one methodological flaw:

> **Whole-collection replacement stress must measure a sequence of genuinely distinct collection graphs, not repeated references to the same two preconstructed collections.**
