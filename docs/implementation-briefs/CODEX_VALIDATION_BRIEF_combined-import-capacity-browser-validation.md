# Codex Validation Brief — Combined Import Capacity Envelope in Real Browsers

## Objective

Validate the proposed external-import capacity envelope against the real application in desktop browsers before any production limits are implemented.

This is a **validation/probe task**, not an implementation task.

The goal is to answer:

> Can collections near the proposed import-capacity envelope be imported, rendered, edited, navigated, persisted, and traversed through normal Undo/Redo without unacceptable degradation in real browser execution?

Use programmatically generated fixtures. The user is not expected to hand-author any large JSON file.

Do **not** implement the proposed production limits in this task.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- source code;
- tests;
- comments;
- documentation;
- localization keys;
- fixture names;
- generated artifacts;
- filenames.

Use durable descriptive names such as:
- `combined-import-envelope`;
- `dense-import-envelope`;
- `broad-import-envelope`;
- `browser-import-capacity-validation`;
- similar neutral wording.

Existing historical occurrences are out of scope.

---

## Read first

Before starting, inspect and follow:
- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- `docs/IMPORT-CAPACITY-BENCHMARK.md`;
- the current import-capacity benchmark harness;
- current import/export code;
- external structural validation;
- collection/history reducer;
- persistence/storage code;
- relevant validation rules;
- relevant Cargo Link/Cargo Pad UI;
- Resource Matrix / Outpost Status Matrix;
- current browser/component test setup.

Use the repository as the source of truth for current paths, schema versions, commands, and terminology.

---

## Candidate envelope under validation

Treat the following as **candidate ceilings only**:

| Boundary | Candidate ceiling |
| --- | ---: |
| Input file | 4 MiB |
| Saved networks | 64 |
| Outposts per network | 96 |
| Cargo Link structures / cargo pads per outpost | 12 |
| Cargo Links per network | 256 |
| Manufacturing entries per outpost | 256 |
| Planned Supply entries per outpost | 256 |
| Outbound items per cargo pad | 128 |
| Aggregate persisted members | 25,000 |
| Any persisted string | 4,096 UTF-16 code units |

These limits are not yet production behavior.

The purpose of this task is to determine whether this envelope remains operationally safe and usable in real browsers.

---

## Important terminology note: the 12-per-outpost boundary

The persisted model stores Cargo Link structures as `cargoPads`.

The user-facing/game concept is Cargo Links / Cargo Link structures.

When discussing the product boundary, treat this as:

> up to 12 Cargo Link structures per outpost

while making the internal `cargoPads` mapping explicit where needed in code/tests.

This boundary deserves special emphasis because it is relatively close to normal vanilla usage:
- vanilla maximum: 6;
- candidate technical ceiling: 12.

The other candidate limits sit much farther beyond normal vanilla usage.

The validation must therefore exercise the 12-per-outpost boundary deliberately, not merely incidentally.

---

## Core validation strategy

Use at least **two deterministic generated fixtures**:

1. **Dense-envelope fixture**
   - stresses one active network;
   - concentrates the aggregate member budget into expensive validation and UI paths;
   - includes multiple outposts at the exact 12 Cargo Link structure boundary;
   - includes significant Cargo Link relationships, outbound items, Planned Supply, manufacturing, and diagnostics.

2. **Broad-envelope fixture**
   - stresses many saved networks/universes;
   - emphasizes collection breadth, switching, import replacement, Undo/Redo, export, persistence, and reload;
   - keeps individual networks more moderate so the fixture explores a different performance profile from the dense fixture.

Do not attempt to set every individual ceiling to its maximum simultaneously if doing so would violate:
- the 25,000 aggregate-member ceiling;
- the 4 MiB input ceiling.

The fixture must represent the **intersection of the candidate limits**, not the Cartesian product of all maxima.

---

## Dense-envelope fixture design

The dense fixture should be computationally hostile while still remaining structurally valid and within the proposed envelope.

### Required characteristics

Aim for:

- exactly or very near 96 outposts;
- several outposts with exactly 12 Cargo Link structures;
- network-wide Cargo Link count near 256;
- aggregate persisted member count near 25,000 without exceeding it;
- significant manufacturing;
- significant Planned Supply;
- significant outbound cargo contents;
- at least one persisted string at or near 4,096 UTF-16 code units;
- structurally valid stable IDs;
- current schema;
- deterministic generation.

Do not add artificial whitespace or meaningless padding merely to approach 4 MiB.

Prefer real persisted members and strings that exercise actual application paths.

### Cargo Link emphasis

At least several selected outposts should contain exactly 12 Cargo Link structures.

Where practical:
- connect as many of those pads as possible to valid remote endpoints;
- populate outbound cargo;
- include inter-system links where appropriate;
- create legitimate states that exercise provenance and Helium-3 validation;
- ensure the Cargo Links UI has meaningful work to perform.

The fixture should allow the browser validation to:
- open a fully populated 12-link outpost;
- expand/edit Cargo Links;
- change outbound contents;
- traverse/select related outposts;
- Undo/Redo those edits.

### Expensive domain state

Include structurally valid but domain-questionable states where useful to trigger expensive normal diagnostics, especially:
- unresolved cargo export/provenance;
- inter-system Helium-3 conditions;
- manufacturing prerequisites;
- Planned Supply interactions;
- other existing expensive validation paths identified by the benchmark.

Do not use malformed input.

The purpose is to test accepted-but-diagnosed state, consistent with the tracker’s recovery philosophy.

---

## Broad-envelope fixture design

The broad fixture should stress collection breadth rather than one dense active network.

### Required characteristics

Use many saved networks while staying within:
- the 64-network candidate ceiling;
- 4 MiB serialized input;
- 25,000 aggregate members.

Choose the highest practical network count consistent with those limits.

Individual networks should remain moderate enough that:
- switching among them is the main stress dimension;
- the fixture does not simply duplicate the dense case.

Include:
- varied outpost counts;
- Cargo Links;
- extraction;
- manufacturing;
- Planned Supply;
- realistic saved-network state.

The fixture should make it practical to test:
- import replacement;
- active-network switching;
- previous/next/wraparound navigation if applicable;
- Undo/Redo across collection replacement;
- export;
- persistence;
- reload.

---

## Fixture generation

Generate fixtures programmatically from the existing deterministic benchmark machinery where practical.

Prefer extending or reusing existing generator infrastructure rather than creating giant hand-authored JSON.

Requirements:
- deterministic output;
- current schema;
- stable reproducible counts;
- no committed multi-megabyte JSON blobs unless there is a compelling reason;
- generated JSON may be written to a temporary/local path for browser import testing;
- generated output should report:
  - source/export byte size;
  - compact byte size;
  - network count;
  - outpost count;
  - cargo pad count;
  - Cargo Link count;
  - manufacturing count;
  - Planned Supply count;
  - outbound item count;
  - aggregate persisted member count;
  - maximum persisted string length.

If a generated fixture exceeds any proposed candidate ceiling, adjust it downward.

If it is impossible to construct a meaningful fixture near the proposed structural limits without exceeding 4 MiB, report that as evidence that the candidate limits are internally inconsistent.

---

## Browser targets

Valid desktop browser targets are:

- Microsoft Edge;
- Google Chrome;
- Mozilla Firefox.

Test as many of these as are available in the environment.

### Minimum acceptable browser evidence

At least one real desktop browser must be exercised.

If Edge, Chrome, and Firefox are all available, test all three.

If only one or two are available:
- test what is available;
- state exactly which browsers/versions were tested;
- do not imply coverage for unavailable browsers.

Chromium-family coverage should not be assumed to prove Firefox behavior, and vice versa.

---

## Browser execution method

Prefer real browser automation where the available repository/environment supports it.

Possible approaches include:
- existing browser automation already present in the repo;
- a minimal test harness using an already-available browser-driving tool;
- local manual browser validation supported by generated fixtures and timing/observation logging.

Do not add a substantial new browser-testing dependency solely for this probe unless clearly justified.

If automated real-browser interaction cannot be completed:
- generate the fixtures;
- provide a precise manual validation checklist;
- run whatever real browser steps are possible;
- clearly distinguish automated evidence from manual observations.

Do not substitute jsdom-only measurements for this task.

---

## Required browser workflow — dense fixture

Exercise the real application through this sequence:

1. Start from an existing non-trivial collection.
2. Import the generated dense-envelope JSON through the normal file-import UI.
3. Confirm the import completes without:
   - page-unresponsive browser warning;
   - crash;
   - obvious broken render;
   - loss of input responsiveness.
4. Observe first full-app render.
5. Select an outpost near the end of the outpost list.
6. Select one of the outposts with exactly 12 Cargo Link structures.
7. Open/expand the Cargo Links / Cargo Pads editing surface.
8. Inspect and interact with multiple links.
9. Change at least one outbound cargo selection.
10. Exercise an inter-system link if represented.
11. Open/use the Resource Matrix / Outpost Status Matrix.
12. Perform a representative manufacturing or planning edit.
13. Switch to another outpost and back.
14. Undo the edit.
15. Redo the edit.
16. Undo the entire import back to the original collection.
17. Redo the import.
18. Make another representative edit after redo.
19. Undo/Redo that edit.
20. Export the imported collection.
21. Reload/reopen the application so persisted state is restored.
22. Confirm the restored collection is semantically intact.

Where possible, capture timing or interaction latency for the major steps.

---

## Required browser workflow — broad fixture

Exercise:

1. Import over an existing non-trivial collection.
2. Confirm first render.
3. Switch repeatedly among saved networks.
4. Use previous/next/wraparound navigation where applicable.
5. Select outposts in several different networks.
6. Make a representative edit.
7. Undo/Redo the edit.
8. Undo the entire import.
9. Redo the import.
10. Export the collection.
11. Reload/reopen from persisted state.
12. Confirm network ordering, active network, and representative state remain intact.

The goal is to stress collection breadth and lifecycle behavior rather than one dense network.

---

## Responsiveness criteria

Do not invent a rigid frame-time SLA.

Use practical desktop-app/browser responsiveness criteria.

### Passing behavior

The candidate envelope is acceptable if:
- import completes without browser unresponsive warnings;
- no crash occurs;
- no multi-second main-thread lockup occurs during ordinary interactions;
- selecting outposts remains practically usable;
- opening/editing Cargo Links remains practically usable;
- Resource Matrix interaction remains practically usable;
- switching saved networks remains practically usable;
- Undo/Redo remains practically usable;
- export and reload succeed;
- no cumulative degradation becomes obvious over the validation workflow.

### Timing guidance

Where tooling permits, record elapsed times for:
- import;
- initial render;
- selecting a dense outpost;
- opening the 12-link Cargo Link editor;
- changing cargo;
- network switch;
- Undo import;
- Redo import;
- representative edit;
- Undo/Redo edit;
- export serialization;
- reload/restore.

Use median/repeated timings where automation makes that cheap.

For manual observations, record:
- instant / imperceptible;
- noticeable but acceptable;
- sluggish;
- problematic;
- browser warning/failure.

Do not claim precision beyond the measurement method.

---

## Special focus: 12 Cargo Link structures per outpost

This candidate ceiling must receive a specific conclusion.

For each tested browser, answer:

- Did an outpost with 12 Cargo Link structures render correctly?
- Was the Cargo Links editor still usable?
- Did expanding/collapsing remain responsive?
- Could outbound cargo be changed normally?
- Did linked-outpost navigation behave correctly?
- Did Undo/Redo remain usable?
- Were there layout/accessibility regressions visible at this density?
- Did the user-facing UI become unwieldy even if technically responsive?

This is both a performance and a product-usability observation.

---

## Backlog note for legitimate >12 usage

If the 12-per-outpost boundary remains the recommended candidate ceiling, add a **separate future product backlog note** stating that legitimate users may occasionally exceed this boundary.

Do not design or implement the solution in this task.

Possible future areas may include:
- graceful handling of otherwise valid over-limit imports;
- warning/recovery workflows;
- selective import;
- reconciliation;
- other special handling.

Do not commit to a specific solution yet.

This backlog note should remain product-oriented and should not use transient audit/slice identifiers.

---

## Persistence and storage scope

For this validation:

Do:
- confirm normal save succeeds in real browser;
- reload/reopen;
- confirm the generated fixture restores correctly.

Do not:
- characterize browser quota across browsers/devices;
- redesign storage;
- implement quota recovery;
- test every quota edge case.

Storage quota/recovery remains a separate security task.

If one browser fails to persist the fixture because of quota or synchronous-storage behavior:
- record that explicitly;
- do not fix storage behavior in this task.

---

## History scope

Normal Undo/Redo should remain universal for accepted imports.

Test:
- import replacement;
- Undo import;
- Redo import;
- representative edits after import;
- Undo/Redo those edits;
- network switching around those operations.

Optionally repeat one import a second time if useful.

Do not create a special “large import disables history” path.

Do not run a 1,000-large-import memory stress test here unless needed to explain an observed problem.

---

## If performance is poor

Do not optimize production code in this task.

If the near-envelope fixture performs poorly:

1. identify the expensive dimension;
2. reduce one relevant candidate ceiling;
3. regenerate;
4. rerun the relevant browser workflow;
5. recommend a revised ceiling.

Examples:
- reduce Cargo Links per network;
- reduce outposts;
- reduce pads/Cargo Link structures per outpost;
- reduce aggregate members;
- reduce per-array limits.

Do not silently move the goalposts.

Record both:
- the failing configuration;
- the revised configuration that becomes acceptable.

If a production algorithm appears to be the bottleneck, record it as a separate optimization opportunity.

---

## Accessibility observations

This is not a full accessibility audit, but density can create regressions.

During browser validation, check for obvious issues such as:
- focus loss after import or history traversal;
- unusable keyboard navigation in dense Cargo Links UI;
- clipped controls;
- inaccessible overflow;
- broken visible focus;
- layout collisions;
- status messages not appearing as expected.

Do not redesign accessibility behavior here.

If a regression is found, record it for a separate correction.

---

## Production scope

Production behavior should remain unchanged.

Acceptable changes:
- deterministic fixture-generator extensions;
- browser-validation harness;
- browser/probe scripts;
- neutral validation report;
- test-only helpers.

Do not:
- add production capacity limits;
- alter `NetworkImportButton`;
- add new import error messages;
- change migration;
- change history semantics;
- change storage behavior;
- optimize validation algorithms;
- alter localization;
- redesign UI;
- add large committed fixture blobs without strong reason.

---

## Validation report

Create or update a durable neutral report, for example:

`docs/IMPORT-CAPACITY-BROWSER-VALIDATION.md`

Do not use transient audit/slice identifiers in the filename or report.

Include:

### A. Environment

For each browser:
- browser name;
- exact version;
- OS;
- relevant hardware if available;
- dev/prod build mode;
- automation/manual method.

### B. Fixture definitions

For dense and broad fixtures:
- network count;
- outpost count;
- cargo pad count;
- Cargo Link count;
- manufacturing count;
- Planned Supply count;
- outbound count;
- aggregate persisted member count;
- max string length;
- compact size;
- export/source size.

### C. Candidate-ceiling consistency

State whether:
- fixtures remain under 4 MiB;
- fixtures remain under 25,000 members;
- all per-structure limits are respected.

### D. Browser results

For each browser and fixture:
- import result;
- first render;
- dense-outpost selection;
- 12-link UI result;
- representative edit;
- network switching;
- Undo import;
- Redo import;
- edit Undo/Redo;
- export;
- reload/restore;
- qualitative responsiveness;
- measured timings where available.

### E. 12-link conclusion

Give a dedicated conclusion about whether the 12 Cargo Link structure boundary remains technically and ergonomically acceptable.

### F. History conclusion

State whether normal Undo/Redo can remain universal.

### G. Persistence conclusion

State whether normal save/reload succeeded in each tested browser.

### H. Recommended final envelope

Either:
- confirm the existing candidate limits; or
- recommend specific reduced limits based on observed failures.

Explain any revision.

### I. Optimization opportunities

Record any expensive production paths discovered, but do not fix them here.

### J. Backlog opportunities

If relevant, record:
- special handling for legitimate over-12 Cargo Link structure imports;
- collection splitting/subsetting;
- performance optimization;
- accessibility follow-up.

---

## Manual smoke test

Even if browser automation succeeds, provide a short manual smoke-test checklist for the user.

The checklist should be practical and concise.

At minimum:
- import dense fixture;
- open a 12-link outpost;
- edit cargo;
- use Resource Matrix;
- Undo/Redo;
- switch network;
- export;
- reload.

The fixture must be generated for the user by the harness/Codex.

The user should not need to hand-author or manually edit JSON.

---

## Verification

Run:
- fixture generation;
- browser validation harness where available;
- existing import-capacity benchmark if relevant;
- relevant focused import/history tests;
- relevant component tests;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If browser automation uses browser-specific commands, report them exactly.

---

## Completion response

Return:

1. concise summary of what was validated;
2. files added/changed;
3. generated dense fixture statistics;
4. generated broad fixture statistics;
5. browsers and exact versions tested;
6. automated vs manual coverage;
7. key timings/observations;
8. dedicated conclusion for the 12 Cargo Link structures per outpost boundary;
9. Undo/Redo conclusion;
10. persistence/reload conclusion;
11. whether the candidate envelope is confirmed or revised;
12. any revised proposed ceilings;
13. performance bottlenecks observed;
14. backlog items identified;
15. exact verification commands/results;
16. confirmation that production capacity limits were not implemented;
17. confirmation that no commit/push was performed.

Do not commit or push unless explicitly instructed.
