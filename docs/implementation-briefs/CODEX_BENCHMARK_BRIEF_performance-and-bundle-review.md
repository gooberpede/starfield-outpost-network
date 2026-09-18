# Codex Benchmark Brief — Performance and Bundle Review

## Objective

Conduct a **read-only performance and bundle benchmark/audit** of the Starfield Outpost Tracker.

This is a peace-of-mind review, not an optimization sprint.

The goals are to determine:

1. whether the current production bundle size creates any measurable user-facing problem;
2. what materially contributes to the main JavaScript bundle;
3. whether startup work — especially reference-data verification — causes noticeable delay;
4. whether normal editing and realistic large-network usage remain responsive;
5. whether browser memory, Undo/Redo history, localStorage, rendering, or data duplication create meaningful scaling risks;
6. whether any low-risk cleanup is justified;
7. which warnings are merely advisory and should not trigger unnecessary architectural change.

Do not implement optimizations during this benchmark.

Do not commit or push.

---

## Branch and workflow

Work on:

- `staging`

Before benchmarking:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify any unrelated working-tree changes.

Do not work directly on `main`.

Do not change production hosting configuration.

---

## Deliverable

Create:

```text
docs/benchmarks/PERFORMANCE-AND-BUNDLE-REVIEW.md
```

The report should be evidence-led and reproducible.

Do not turn the benchmark into a broad speculative list of “best practices.”

---

## Current known context

The production Vite build currently emits a large-chunk advisory for the main JavaScript bundle.

Recent deployed build output has been approximately:

```text
dist/assets/index-*.js   ~535 kB raw
                         ~143 kB gzip
```

This warning alone is **not** evidence of a performance defect.

The app is:

- React + TypeScript + Vite;
- static Cloudflare Pages hosting;
- client-only;
- no backend;
- no analytics/RUM;
- no Worker/Function runtime;
- reference-data-gated before the editor mounts;
- localStorage-backed for user data;
- Undo/Redo session-global and non-persisted;
- configured with deliberately generous domain/capacity limits.

Recent reference-data integrity work added:

- runtime manifest verification;
- 13 required runtime JSON assets;
- SHA-256 checks;
- MIME/status/size/basic-shape validation;
- fail-closed startup before `App` mounts.

This benchmark should determine whether those protections create any material startup cost.

---

## Benchmark principles

1. Measure before recommending.
2. Do not optimize solely to silence Vite warnings.
3. Prefer real user-facing evidence over theoretical micro-optimizations.
4. Distinguish:
   - measurable defect;
   - low-risk cleanup;
   - future scaling concern;
   - advisory/noise;
   - no action.
5. Preserve correctness and integrity guarantees.
6. Do not weaken the reference-data gate merely to reduce startup time.
7. Do not introduce code splitting, virtualization, memoization, caching, or dependency changes without evidence.
8. Where a recommendation is speculative, label it as such.

---

## Required benchmark areas

### 1. Production bundle composition

Inspect the production build and determine:

- raw JS size;
- gzip size;
- CSS size;
- number of emitted chunks/assets;
- largest contributors to the main JS bundle;
- major third-party libraries included;
- whether duplicate library copies exist;
- whether obviously unused/dead dependencies are shipped;
- whether dev-only/test-only code is leaking into production;
- whether source maps are emitted in production;
- whether localization/reference code materially contributes to the main chunk.

Use appropriate static analysis tools if already available or if they can be used transiently without changing project dependencies.

Do not permanently add a bundle-analysis dependency unless explicitly approved.

If using a transient tool, document the command and version/source.

### Key question

> Is the ~535 kB raw / ~143 kB gzip main bundle actually problematic for this application, or merely large enough to trigger Vite’s advisory threshold?

---

### 2. Code-splitting opportunity assessment

Identify realistic split candidates, if any.

Examples may include:

- rarely opened dialogs;
- import/export tooling;
- large reference-only UI;
- optional secondary panels;
- localization-heavy modules;
- infrequently used analysis tools.

For each candidate, estimate:

- approximate bytes removable from initial chunk;
- whether the module is truly non-critical at startup;
- complexity introduced;
- potential regression risk;
- whether the improvement would be noticeable.

Do not recommend code splitting merely because it is technically possible.

Explicitly state whether the current single-chunk approach is acceptable.

---

### 3. Reference-data transfer and startup gate cost

Measure the runtime reference-data footprint.

Record:

- size of each of the 13 JSON assets;
- manifest size;
- total raw bytes;
- compressed transfer size if practical to measure;
- whether browser fetches are issued in parallel or serially;
- time spent waiting on network;
- time spent hashing;
- time spent parsing JSON;
- time spent performing lightweight validation;
- total time from startup gate beginning to `App` mount.

Inspect implementation to determine where timings can be measured without changing production behavior.

If temporary local instrumentation is needed:

- keep it outside committed source if possible;
- remove it before completion;
- document methodology.

### Key questions

> Is the gate noticeably delaying first usable interaction?

> Is the cost dominated by network transfer, hashing, JSON parsing, or something else?

> Is “verify everything before editor mount” still reasonable for the current dataset size?

Do not recommend lazy-loading required integrity data unless there is strong evidence and the integrity model can be preserved.

---

### 4. Startup responsiveness

Measure a representative cold startup and warm/repeat startup.

Where practical capture:

- time to initial HTML/CSS render;
- time to fatal/loading gate presentation if visible;
- time to `App` mount;
- time until editor interaction is usable;
- main-thread long tasks;
- scripting vs rendering vs network time.

Use browser Performance tooling, Lighthouse, DevTools, or equivalent if available.

If Codex cannot directly exercise the deployed browser environment, benchmark locally and clearly label deployment-specific measurements as pending/manual.

Do not invent deployed timings.

---

### 5. Normal editing responsiveness

Inspect and, where practical, measure common interactions such as:

- selecting a network;
- selecting an outpost;
- adding/editing/removing an outpost;
- adding/editing cargo links;
- changing resources;
- manufacturing/planning edits;
- opening heavier tables/matrices;
- Undo;
- Redo;
- switching locale.

Look for:

- broad React rerenders;
- obviously repeated expensive selectors/calculations;
- large synchronous recomputations;
- repeated parsing/normalization;
- expensive table rendering;
- event handlers causing unnecessary whole-app work.

Use React profiling only if available without invasive setup.

Do not add memoization pre-emptively.

---

### 6. Large-network / growth-headroom benchmark

Exercise or construct representative large datasets near realistic and configured limits.

Do not assume absolute maximum every field simultaneously is a realistic user case, but test enough scale to identify nonlinear behavior.

Include scenarios such as:

- many networks;
- a network with many outposts;
- many cargo links;
- many manufacturing/planned items;
- large resource matrices;
- substantial Undo/Redo history.

Current configured limits include approximately:

- up to 64 networks;
- up to 96 outposts per network;
- up to 256 links per network;
- up to 256 manufacturing/planned entries;
- up to 128 outbound items;
- aggregate caps around 25k items;
- Undo/Redo max history entries: 1000.

Determine:

- whether operations remain responsive;
- whether serialization/deserialization becomes expensive;
- whether persistence writes block noticeably;
- whether matrices or tables degrade sharply;
- whether any operation scales unexpectedly badly.

If creating synthetic benchmark data, do so in scripts/test fixtures that are not retained unless explicitly useful.

Do not pollute real user data.

---

### 7. localStorage and persistence cost

Inspect:

- size of realistic saved data;
- size near configured limits;
- serialization/deserialization cost;
- frequency of writes;
- whether writes are synchronous and whether they create visible stalls;
- whether recovery/import/export paths materially differ.

Estimate whether browser storage capacity is comfortable for realistic usage.

Do not reopen previously-settled capacity limits unless performance evidence justifies it.

---

### 8. Undo/Redo memory and performance

Review:

- what each history entry stores;
- whether history snapshots duplicate large network state;
- approximate memory growth per entry;
- behavior near `MAX_HISTORY_ENTRIES = 1000`;
- Undo/Redo operation cost on large networks;
- whether history is pruned correctly.

Classify any concern as:

- current problem;
- future concern;
- acceptable trade-off.

Do not redesign history architecture during this benchmark.

---

### 9. Browser memory footprint

Estimate or measure browser memory at:

- idle startup;
- normal representative network;
- larger representative network;
- after substantial editing/Undo history.

Inspect for:

- duplicate in-memory copies of reference datasets;
- duplicate derived structures;
- unreleased event listeners;
- retained stale state;
- unnecessarily duplicated normalized data.

A rough, reproducible estimate is sufficient; do not claim precision the tooling cannot provide.

---

### 10. Rendering and large-table behavior

Pay particular attention to:

- resource matrices;
- manufacturing feasibility views;
- large outpost/resource tables;
- any list rendering many rows/cells.

Assess whether:

- DOM node counts become excessive;
- virtualization would materially help;
- CSS/layout/reflow dominates;
- rendering remains acceptable at realistic limits.

Do not introduce virtualization without demonstrated need.

---

### 11. Caching and repeat-visit behavior

Inspect actual production/static caching behavior where possible.

Review:

- hashed JS/CSS asset caching;
- reference JSON caching;
- effect of `cache: 'no-store'` on reference-data fetches;
- whether the integrity gate intentionally re-downloads/revalidates every visit;
- whether Cloudflare compression/caching mitigates that cost.

Explicitly assess the trade-off of `cache: 'no-store'`.

Do not change it during the benchmark.

If browser or CDN caching means transfer cost is smaller than raw asset size suggests, record that distinction.

---

### 12. Cloudflare transfer/compression behavior

Where possible verify deployed behavior for:

- gzip/Brotli;
- cache-control;
- age/cache status;
- transfer size versus resource size;
- hashed static asset caching;
- reference-data transfer.

Use harmless read-only inspection only.

Do not alter Cloudflare settings.

If deployed inspection is unavailable to Codex, mark manual verification required.

---

### 13. Google Fonts dependency

Assess the production effect of externally hosted Google Fonts.

Determine:

- number of font/style requests;
- whether they block meaningful rendering;
- cache behavior;
- whether failure leaves the app usable;
- whether font loading creates measurable layout shift or startup delay.

Do not self-host fonts unless evidence shows a concrete deployed problem.

---

### 14. Device/CPU baseline

Where practical, compare:

- normal desktop;
- CPU-throttled browser profile representing a slower laptop;
- optional narrow/mobile viewport only as a secondary observation.

Mobile/touch support is not currently a primary release target.

Do not create a mobile optimization project from this benchmark.

---

### 15. Production warning review

Review all current production build/browser warnings.

At minimum classify:

- Vite large-chunk advisory;
- the known four Chromium browser-platform warnings, if still present.

Do not conflate browser/platform noise with application defects.

Document which warnings warrant action and which should remain ignored/accepted.

---

## Reproducibility

For every quantitative result, record:

- command/tool;
- environment;
- Node version;
- browser/version if relevant;
- dataset/scenario;
- cold vs warm run;
- measurement method;
- number of runs where practical.

Avoid false precision.

If timings vary, report a range or median rather than a single cherry-picked value.

---

## Required classifications

Each finding should receive one of these labels:

### A. Measurable user-facing issue

Evidence demonstrates noticeable delay, jank, memory pressure, or poor scaling.

### B. Worthwhile low-risk cleanup

Not currently harmful, but a simple change offers clear value with little complexity.

### C. Future scaling concern

Current behavior is acceptable, but projected growth could expose a problem.

### D. Advisory / no demonstrated impact

A warning or theoretical concern exists, but measurements do not justify action.

### E. No issue found

Reviewed and found healthy.

Do not rank findings by drama. Rank by evidence and practical impact.

---

## Recommendation format

For every proposed optimization, include:

- problem demonstrated;
- measured evidence;
- proposed change;
- expected benefit;
- estimated complexity;
- regression risk;
- whether it should be:
  - now;
  - before release;
  - backlog;
  - not pursued.

Avoid generic recommendations such as “use memoization” or “code split more” without a specific measured target.

---

## Required report structure

Create:

```text
docs/benchmarks/PERFORMANCE-AND-BUNDLE-REVIEW.md
```

Suggested sections:

1. Executive summary
2. Environment and methodology
3. Production bundle composition
4. Reference-data startup cost
5. Startup responsiveness
6. Normal editing responsiveness
7. Large-network benchmark
8. Persistence/localStorage
9. Undo/Redo
10. Browser memory
11. Rendering and large tables
12. Caching and network behavior
13. Google Fonts
14. Warning review
15. Findings table
16. Recommended actions
17. Deferred / not warranted optimizations
18. Reproduction commands and notes
19. Limits of the benchmark

---

## Required final findings table

Include columns like:

| Finding | Evidence | Classification | Recommendation | Timing |
| --- | --- | --- | --- | --- |

The report should make it easy to distinguish:

- real defects;
- peace-of-mind results;
- optional cleanup;
- release-relevant work;
- unnecessary optimization.

---

## Scope constraints

This benchmark is read-only.

Do not modify:

- application source;
- Vite configuration;
- reference-data gate;
- caching behavior;
- Cloudflare configuration;
- dependencies;
- package lock;
- code splitting;
- React memoization;
- virtualization;
- persistence architecture;
- Undo/Redo design;
- font hosting.

Temporary local benchmark scripts are acceptable if:

- clearly isolated;
- not committed;
- removed before completion unless explicitly useful;
- documented in the report.

---

## Validation

At minimum run:

- `npm run build`
- `npm run test`
- `npm run reference:test`
- `npm run test:components`
- `npm run lint`
- `git diff --check`

If additional benchmark commands are used, record them in the report.

---

## Completion response

Return:

1. concise overall conclusion;
2. current branch;
3. benchmark report created;
4. current bundle size and composition summary;
5. whether the Vite chunk warning represents a demonstrated problem;
6. measured reference-data startup cost;
7. whether the integrity gate causes noticeable delay;
8. startup responsiveness summary;
9. large-network responsiveness summary;
10. persistence/localStorage findings;
11. Undo/Redo findings;
12. memory findings;
13. caching/network findings;
14. Google Fonts findings;
15. any measurable user-facing issues;
16. any low-risk cleanup recommendations;
17. any future scaling concerns;
18. optimizations explicitly judged not warranted;
19. test/build/lint results;
20. confirmation no implementation files changed;
21. confirmation no Cloudflare settings changed;
22. confirmation no dependency/lockfile change;
23. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
