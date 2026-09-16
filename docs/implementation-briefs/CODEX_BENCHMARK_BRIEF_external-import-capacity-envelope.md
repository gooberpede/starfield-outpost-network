# Codex Benchmark / Design Probe Brief — External Import Capacity Envelope

## Objective

Investigate the practical capacity envelope for externally imported network collections so that future import limits can be based on measured application behavior rather than arbitrary numbers.

This is a **benchmark/design probe**, not a production implementation task.

Do not add import limits, user-facing warnings, production validation rules, or new UX in this task.

The goal is to answer:

> How large and structurally dense can an imported collection become while the tracker still behaves like an ordinary, fully supported collection — including normal validation, rendering, persistence, and Undo/Redo?

Use the findings to recommend a future safe import envelope with substantial headroom above realistic user collections.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- source code;
- tests;
- comments;
- documentation;
- localization keys;
- benchmark fixture names;
- generated benchmark artifacts;
- filenames.

Existing historical occurrences are out of scope and may remain unchanged.

Use neutral descriptive names such as:
- `import-capacity-benchmark`;
- `large-network-fixture`;
- `collection-capacity-report`;
- similar durable wording.

## Read first

Before designing the probe, inspect and follow:
- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- relevant import/export, persistence, validation, history, and accessibility documentation;
- the current external import validation code;
- the current collection editing/history implementation;
- the current storage implementation;
- current domain capacity helpers;
- relevant unit/component/performance-oriented tests.

Use the repository as the source of truth for current paths, APIs, schema versions, and commands.

## Context

Current representative smoke-test data is approximately:

- just under **60 KB serialized JSON**;
- two multi-outpost networks;
- resource extraction;
- manufacturing;
- Cargo Links;
- other normal planning state;
- does not exceed current game-imposed caps.

Treat this as a useful empirical **medium-ish real-world baseline**, not as a hard definition of “medium”.

Current game-derived maxima include:
- up to 24 outposts in a network under vanilla gameplay;
- up to 6 cargo pads per outpost under vanilla gameplay.

Do not assume future technical import ceilings must equal vanilla limits. The tracker deliberately preserves representable modded/recoverable state.

Current history behavior:
- imports are ordinary undoable `replace-collection` operations;
- history entries retain immutable before/after object graphs;
- ordinary edits structurally share unchanged state;
- history is capped by entry count, not bytes.

The desired product direction is:

> Anything accepted by the import boundary should remain a normal collection with normal Undo/Redo.

Avoid designing a special “large import disables Undo/Redo” mode unless the probe proves that no reasonable import ceiling can preserve ordinary history behavior.

## Questions the probe must answer

### 1. What does realistic growth look like?

Characterize realistic and deliberately extreme collections along multiple dimensions rather than treating file size as the only variable.

At minimum distinguish:

- **collection breadth** — many saved networks/universes;
- **network breadth** — many outposts in one network;
- **outpost density** — many persisted members inside individual outposts;
- **relationship density** — many Cargo Links and cargo-pad contents;
- **string inflation** — unusually long but structurally valid strings;
- **aggregate JSON size**.

### 2. Where does ordinary app behavior begin to degrade?

For each benchmark tier, determine whether the application remains acceptably responsive through the relevant lifecycle:

- serialized file generation;
- file/text size;
- `JSON.parse`;
- pre-migration external structural validation;
- migration;
- post-migration current-shape validation;
- collection replacement/history recording;
- normal network/domain validation;
- availability/manufacturing derivation;
- initial render or representative component render where practical;
- network switching;
- representative edits;
- Undo;
- Redo;
- serialization for persistence/export;
- browser-storage write where practical.

The purpose is not to optimize individual milliseconds prematurely. We need to identify where behavior changes from “ordinary” to “noticeable” to “problematic”.

### 3. Which dimensions are expensive per byte?

Determine whether some compact structures are substantially more expensive than equivalent-size JSON elsewhere.

Pay particular attention to:
- manufacturing arrays and their fixed-point feasibility pass;
- Planned Supply arrays;
- Cargo Link traversal;
- outbound-item arrays;
- repeated `.find()` patterns over outposts/pads;
- large network collections;
- any validation path whose runtime grows worse than linearly with member count.

### 4. What future safety boundaries would be sufficient?

Based on evidence, recommend a future combination of limits.

Possible classes include:
- pre-read file byte ceiling;
- maximum saved networks per collection;
- maximum outposts per network;
- maximum cargo pads per outpost;
- maximum Cargo Links per network;
- maximum aggregate persisted members;
- maximum per-array members where justified;
- maximum persisted string length.

Do not implement these limits in this task.

## Benchmark fixture strategy

Create benchmark/test-only collection generators or fixtures that produce structurally valid current-schema collections.

Do not hand-author enormous static JSON fixtures if generated fixtures are simpler and more maintainable.

The generated data should be deterministic unless nondeterminism is necessary for the measurement.

Do not commit huge generated JSON blobs unless there is a compelling repository reason.

### Required baseline tiers

Build a size ladder roughly inspired by the following categories:

- **light**
- **medium**
- **large**
- **maximal**
- **ultra-maximal**

These labels are exploratory benchmark categories only. Do not bake them into production behavior.

Use the known ~60 KB representative collection as an anchor for the medium region.

A reasonable starting size ladder for exploration is approximately:

- light: ~15 KB;
- medium: ~60 KB;
- large: ~250 KB;
- maximal: ~1 MB;
- ultra-maximal: ~4 MB.

These are starting targets, not product limits. Adjust the actual fixture composition as needed to make the benchmarks meaningful.

If the application remains completely ordinary at the upper end, extend the probe upward cautiously until a meaningful degradation point appears.

If degradation appears much earlier, investigate the structural cause rather than stopping at a byte number.

## Required benchmark families

### A. Realistic collection growth

Generate collections composed of plausible networks using normal reference IDs and normal persisted shapes.

Include at least:
- small/simple networks;
- representative mid-complexity networks;
- vanilla-maximal networks with approximately 24 outposts and 6 pads per outpost where appropriate;
- multiple saved universes/networks in one collection.

Aim to answer:
- how large a realistic vanilla-maximal network becomes in JSON;
- how many such networks can coexist before behavior becomes noticeable;
- whether collection breadth is materially cheaper than one dense network.

### B. Dense single-network growth

Construct one network whose size grows substantially beyond vanilla while remaining structurally valid.

Vary:
- outpost count;
- cargo-pad count;
- Cargo Link count;
- production routes;
- manufacturing;
- Planned Supply;
- outbound cargo contents.

Use this to find graph-density costs that file size alone may hide.

### C. Pathological-but-structurally-valid growth

Construct focused cases designed to stress known loops while still passing current import structure checks.

At minimum include large:
- manufacturing arrays;
- Planned Supply arrays;
- outbound item arrays;
- Cargo Link arrays;
- string fields.

Do not use malformed data.

The goal is to distinguish:
- “large but cheap”;
- “small but computationally expensive”;
- “large and expensive”.

## Vanilla versus technical ceilings

Do not treat vanilla gameplay maxima as automatic future rejection limits.

The eventual design should likely preserve a large modding/recovery margin above vanilla.

For analysis, compare candidate envelopes such as:

- 4× vanilla;
- 5× vanilla;
- other empirically justified margins.

For example, test whether network sizes around 96–128 outposts remain routine.

Similarly, explore technically generous collection counts such as tens, low hundreds, or higher if still cheap.

Do not choose final numbers merely because they are round.

## String-length probe

Current import validation accepts strings by type without length limits.

Probe unusually long persisted strings in fields such as:
- character name;
- outpost name;
- stable IDs;
- reference IDs where structurally permitted;
- cargo-pad labels.

The purpose is not to replicate game UI name limits.

The future boundary only needs to prevent absurd technical sizes such as hundreds of kilobytes in one string while preserving modded/localized identifiers and names.

Recommend a generous technical ceiling based on evidence.

## History / Undo-Redo probe

Preserve the desired product invariant:

> Accepted imports should remain normally undoable.

Explicitly test:
1. start with a non-trivial existing collection;
2. import/replace it with each benchmark collection;
3. confirm the import creates normal history;
4. Undo back to the prior collection;
5. Redo the imported collection;
6. perform a representative edit after import;
7. Undo/Redo that edit;
8. switch networks before and after history traversal.

Observe:
- responsiveness;
- memory pressure where it can be measured reasonably;
- whether retained before/after graphs create practical issues;
- whether the 1,000-entry count limit interacts meaningfully with large imported graphs.

Do not introduce special no-history behavior in the probe.

## Persistence probe

Where the test environment permits safely:

- serialize the collection;
- measure serialized byte size;
- write/read via the existing storage abstraction or a realistic `localStorage` substitute;
- verify no semantic changes occur.

Do not redesign storage or quota handling here.

Browser quota/error recovery belongs to a separate task.

## Browser / render probe

A Node-only parse/migration benchmark is insufficient.

Where practical, exercise the real React/browser-facing code path for representative tiers, especially:
- initial imported collection render;
- selected outpost render;
- Resource Matrix or other derived-heavy UI;
- switching networks/outposts;
- Undo/Redo.

Use the current supported Windows/Chromium-oriented environment if practical.

If automated browser instrumentation is unavailable, say so clearly and perform the strongest component/jsdom or local browser measurement available.

Do not claim browser performance from Node-only numbers.

## Metrics and reporting

Prefer simple, repeatable measurements.

For each fixture record, where available:
- network count;
- outpost count;
- cargo-pad count;
- Cargo Link count;
- manufacturing member count;
- Planned Supply member count;
- outbound item count;
- major string lengths;
- total persisted member count if useful;
- serialized JSON bytes;
- parse time;
- import validation/migration time;
- representative domain derivation time;
- history replacement time;
- Undo time;
- Redo time;
- serialization time;
- persistence write time;
- render/interaction observations.

For timing:
- repeat enough times to reduce obvious one-run noise;
- report median or another defensible summary;
- distinguish warm/cold behavior if it matters;
- do not pretend microbenchmark precision is meaningful for browser UI work.

For memory:
- measure only if tooling makes it reasonably trustworthy;
- otherwise describe memory architecture and observed browser behavior qualitatively;
- do not invent exact memory usage from JSON byte size.

## Candidate safety model to evaluate

The likely future implementation should combine:

1. **pre-read byte limit**
   - checked from `File.size` before `FileReader.readAsText()`;

2. **post-parse structural quantity limits**
   - finite limits on the number of meaningful persisted objects/members;

3. **string-length limit**
   - a generous technical maximum;

4. **existing strict structural/identity validation**
   - unchanged in purpose;

5. **normal domain validation**
   - still separate.

Test whether this model is sufficient.

Do not implement it yet.

## Important boundary distinctions

Preserve these conceptual layers:

### Structural integrity
Can runtime code safely represent and address this document?

### Capacity/resource safety
Is the document bounded enough to process as an ordinary supported collection?

### Domain validity
Does the network make sense according to Starfield and tracker rules?

The benchmark concerns the second layer.

Do not recommend turning ordinary domain warnings into hard capacity failures.

## No special history class unless proven necessary

Do not recommend “large imports disable Undo/Redo” merely because it is easy to implement.

Only recommend that kind of special case if empirical results show that:
- realistic/generous import ceilings cannot preserve normal history behavior; and
- a substantially higher import ceiling provides meaningful user value.

The preferred outcome is one consistent rule:
- accepted import = normal Undo/Redo available;
- rejected import = clean failure before live-state mutation.

## Future split/archive workflow

The user may eventually benefit from a way to split or subset very large collections, especially collections containing many saved universes.

Do not implement or design this UI deeply in this probe.

If the findings suggest such a feature would be useful, record it as a separate future product opportunity.

Possible concepts may include:
- exporting selected saved universes;
- importing a subset;
- splitting one collection into several collections.

Do not allow this possibility to inflate the security boundary unnecessarily.

## Security / robustness considerations

This probe should include adversarial-but-structurally-valid shapes.

However:
- do not attempt denial-of-service against shared infrastructure;
- keep stress work local and controlled;
- stop escalating once the degradation point is clear;
- do not generate absurd files larger than necessary to answer the question;
- avoid committing giant benchmark outputs.

## Production scope

This task should preferably leave production behavior unchanged.

Acceptable changes include:
- benchmark/test-only helpers;
- benchmark scripts;
- temporary or clearly isolated measurement harnesses;
- a durable benchmark report.

If a production-code change is absolutely required solely to expose measurement hooks, keep it minimal and justify it.

Do not:
- add product limits;
- add import warnings;
- change FileReader behavior;
- add localized messages;
- change accessibility behavior;
- change history semantics;
- change storage recovery;
- add dependencies without strong justification.

## Documentation / report

Produce a durable report under an appropriate neutral documentation/benchmark location.

Do not use transient audit identifiers in the filename or report text.

The report should contain:

### A. Environment
- OS/browser/runtime;
- relevant hardware if available;
- Node/browser versions;
- build mode;
- exact commands.

### B. Fixture definitions
For each benchmark family/tier:
- what was generated;
- object/member counts;
- serialized byte size.

### C. Results
A compact table plus explanatory notes.

### D. Observed bottlenecks
Identify which data shapes, algorithms, or UI operations dominate.

### E. Recommended future limits
Recommend:
- file byte ceiling;
- collection/network/outpost/member ceilings;
- string ceiling;
- any aggregate-count ceiling.

For each recommendation explain:
- measured evidence;
- realistic-user headroom;
- modding/recovery headroom;
- why the number is not merely arbitrary.

### F. History conclusion
State whether normal Undo/Redo remains viable throughout the recommended envelope.

### G. Uncertainty
Call out anything the tooling could not measure reliably.

### H. Future opportunities
Optionally note whether collection splitting/subsetting appears worth a separate product feature.

## Tests / verification

Benchmark code must not destabilize normal tests.

Run:
- the relevant focused benchmark/probe commands;
- current import/serialization/migration tests;
- history tests;
- relevant component tests if render behavior is touched;
- `npm test`;
- `npm run test:components` if applicable;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If benchmark fixtures are generated dynamically, confirm deterministic structural counts.

## Completion response

Return:

1. concise summary of what was probed;
2. files added/changed;
3. benchmark environment;
4. benchmark fixture families and sizes;
5. key quantitative results;
6. observed degradation thresholds;
7. recommended future import envelope;
8. explicit conclusion on whether normal Undo/Redo can remain universal;
9. any bottlenecks that deserve separate optimization;
10. uncertainties/limitations;
11. exact verification commands/results.

Do not implement the recommended production limits unless separately instructed.

Do not commit or push unless explicitly instructed.
