# Codex Implementation Brief — External Import Capacity Limits

## Objective

Implement the validated external-import capacity/resource-safety boundary for the Starfield Outpost Tracker.

This work turns the previously benchmarked and browser-validated candidate envelope into production behavior.

The implementation must reject oversized or pathologically dense external imports **before they can consume disproportionate browser resources or mutate live application state**, while preserving the existing distinction between:

1. structurally/capacity-invalid external input, which is rejected at the trust boundary; and
2. structurally valid but stale/domain-questionable tracker state, which remains accepted and is handled by normal domain diagnostics.

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

Before changing code, inspect and follow the current repository state, especially:

- `AGENTS.md`;
- `README.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DOMAIN-RULES.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- current external import/deserialization code;
- `src/data/externalImportValidation.ts`;
- `src/data/importErrors.ts`;
- collection/network migration code;
- `NetworkImportButton` and current file-reading/import status behavior;
- current collection/history reducer;
- storage/recovery code;
- existing import/serialization/migration tests;
- benchmark fixture generator(s).

Use the repository as source of truth for current paths, APIs, schema versions, and localization keys.

Do not rely on historical briefs when they conflict with the current committed implementation or current benchmark/validation reports.

---

## Validated production envelope

Implement these hard external-import ceilings:

| Boundary | Production ceiling |
| --- | ---: |
| Input file | 4 MiB |
| Saved networks | 64 |
| Outposts per network | 96 |
| Cargo Link structures / `cargoPads` per outpost | 12 |
| Cargo Links per network | 256 |
| Manufacturing entries per outpost | 256 |
| Planned Supply entries per outpost | 256 |
| Outbound items per cargo pad | 128 |
| Aggregate persisted array members | 25,000 |
| Any persisted string | 4,096 UTF-16 code units |

### Aggregate-member definition

The aggregate persisted member count is:

> the sum of the lengths of all arrays recursively in the persisted collection.

This is intentionally broader than only counting headline arrays such as networks, outposts, pads, links, manufacturing, Planned Supply, and outbound cargo.

### String-length definition

The 4,096 ceiling is measured in JavaScript string `.length` / UTF-16 code units.

This is a technical external-import safety limit, not a gameplay/domain name-length rule.

Do not convert it into a special character-name/outpost-name gameplay restriction.

---

## Core implementation principle

Reject oversized/pathological input as early as practical.

The intended sequence is:

1. file byte-size check before reading;
2. read text;
3. `JSON.parse`;
4. bounded external structural traversal:
   - validate required shape/types;
   - enforce per-array count ceilings;
   - count aggregate persisted array members;
   - enforce persisted string-length ceiling;
   - enforce identity requirements as currently appropriate;
   - stop immediately when a hard ceiling is exceeded;
5. migration;
6. post-migration current-schema validation;
7. normal domain diagnostics;
8. live-state replacement only after successful import.

Do **not** require a second exhaustive counting traversal if capacity accounting can be integrated cleanly into the existing strict external structural validation.

The important invariant is:

> Once a hard capacity breach is known, validation should short-circuit rather than continue traversing the remainder of the import.

---

## Pre-read file-size guard

The current import UI reads the selected file with `FileReader`.

Add a cheap guard using the selected file’s byte size before `readAsText`.

Reject external import when:

```text
file.size > 4 * 1024 * 1024
```

Use exactly 4 MiB = 4,194,304 bytes.

### Required behavior

For an oversized file:

- do not call `FileReader.readAsText`;
- do not parse JSON;
- do not mutate the collection;
- do not change active/selected network state;
- do not add history;
- do not change localStorage;
- surface the failure through the existing import-status/accessibility mechanism.

The file-size check belongs specifically to external file import.

Do not impose this check on internal browser-storage recovery merely because the same collection model is involved.

---

## Bounded structural validation

Extend the existing external-import validation so the quantitative limits are enforced as part of, or tightly integrated with, the structural traversal.

### Required hard ceilings

At minimum enforce:

#### Collection scope
- saved networks <= 64;
- aggregate recursively counted array members <= 25,000.

#### Network scope
- outposts <= 96;
- Cargo Links <= 256.

#### Outpost scope
- Cargo Link structures / `cargoPads` <= 12;
- manufacturing entries <= 256;
- Planned Supply entries <= 256.

#### Cargo pad scope
- outbound items <= 128.

#### String scope
- every persisted string encountered during external import <= 4,096 UTF-16 code units.

### Aggregate counting

Count all arrays recursively across the external persisted document.

Avoid double-counting the same array.

The implementation may use a traversal helper/context object carrying:
- aggregate member count;
- limits;
- current path.

Fail immediately when adding an array’s length would exceed 25,000.

Where practical, check the individual array ceiling **before** iterating its members.

### Strings

Whenever the structural validator encounters a persisted string, enforce the 4,096 code-unit ceiling.

Do not restrict strings that are not persisted external input, such as:
- generated localized UI text;
- error presentation text;
- in-memory labels created by the application.

---

## Pre-migration vs post-migration behavior

The previous external-import integrity work established the principle that lossy migration must not be allowed to hide malformed external state.

Preserve that architecture.

Capacity validation must protect the **external source document before lossy migration can erase evidence of a breach**.

At minimum:
- current/external arrays and strings that exist in the source document must be bounded before migration;
- structural ambiguity must not be silently repaired into an accepted document;
- post-migration current-schema validation must still run.

If legacy schemas contain fields/arrays that migrate away, they still count toward external resource consumption and should remain subject to appropriate aggregate/string bounds.

Do not weaken historical schema support solely to simplify capacity checks.

---

## Error model

Use the existing machine-readable import-error architecture.

Do not throw ad hoc user-facing strings from deep validation code.

Add durable capacity/resource error kinds/codes as appropriate.

Examples of distinct machine-readable categories may include concepts such as:
- input file too large;
- collection too large;
- nested array limit exceeded;
- aggregate member limit exceeded;
- persisted string too long.

Exact naming should fit the existing `NetworkImportError`/import-error structure.

### Structured parameters

Where useful, include locale-neutral parameters such as:
- path;
- actual count/length;
- maximum allowed;
- category/type of boundary.

Do not include large rejected string values or dump imported content into error parameters.

### Presentation

Map new error kinds through the existing localized import-status presentation.

User-visible text should remain concise.

Examples of desired meaning:
- “This import is too large to open safely.”
- “This import contains too many saved networks.”
- “This import contains too many items in one section.”
- “This import contains a text value that is too long.”

Do not expose implementation jargon such as:
- UTF-16;
- recursive array-member accounting;
- internal property names,
unless an existing details/debug surface explicitly calls for that.

No rich details/report UI is required in this task.

---

## Atomic rejection

Every new capacity failure must preserve the established all-or-nothing external-import behavior.

On rejection:

- current collection unchanged;
- active network unchanged;
- selected outpost/network UI state unchanged except normal failure status;
- Undo/Redo history unchanged;
- no storage write;
- no partial import;
- no automatic trimming;
- no automatic dropping of networks/outposts/pads/items;
- no deduplication or repair intended merely to fit the capacity envelope.

Do not offer “import what fits”.

---

## History behavior

Normal Undo/Redo must remain universal for every accepted import.

Do not:
- disable history for large accepted files;
- special-case near-limit collections;
- clear history on import;
- reduce history semantics as a resource workaround.

The benchmark/browser validation already established that accepted near-envelope imports can remain normal `replace-collection` history operations.

---

## Internal storage/recovery behavior

Keep browser-storage recovery behavior separate from the external trust boundary.

Do not simply route localStorage recovery through the new strict external file-size guard.

Existing internal recovery remains intentionally more forgiving where already designed that way.

If shared validation helpers are reused, ensure the semantics remain explicit:
- external import = strict capacity boundary;
- internal persisted recovery = existing recovery policy unless a limit is already required there for technical correctness.

Storage quota/recovery is a separate task.

---

## Cargo Link structure ceiling

The production external-import ceiling is 12 Cargo Link structures / `cargoPads` per outpost.

This is intentionally retained despite being closer to vanilla usage than the other ceilings.

The browser validation found:
- 12 is technically operable;
- 12 is ergonomically cumbersome;
- there is no evidence to lower it;
- there is no justification to raise it.

Do not alter the existing in-app gameplay capacity model merely because external imports may contain up to 12.

The UI may continue to show vanilla capacity rules such as `12/6` for imported modded/recovery state.

The existing backlog item about otherwise valid imports above 12 remains future product work.

---

## Export filename issue is out of scope

The browser validation also found that a 4,096-character character name can consume the export filename budget and remove the timestamp.

Do not solve that problem in this implementation.

Specifically:
- keep the 4,096 technical persisted-string import ceiling;
- do not reduce the import limit to match filesystem filename concerns;
- do not modify export filename construction in this task.

The existing backlog item for bounding/sanitizing export filename fragments remains separate.

---

## Boundary semantics

Use inclusive ceilings.

Examples:

- 4,194,304-byte file: accepted if otherwise valid;
- 4,194,305-byte file: rejected;
- 64 networks: accepted;
- 65 networks: rejected;
- 96 outposts: accepted;
- 97 outposts: rejected;
- 12 pads: accepted;
- 13 pads: rejected;
- 256 links: accepted;
- 257 links: rejected;
- 25,000 aggregate array members: accepted;
- 25,001: rejected;
- 4,096 string code units: accepted;
- 4,097: rejected.

Write boundary tests for exact-limit and one-over-limit cases.

---

## Tests

Add focused tests for every production boundary.

### File-size guard

Test:
- exactly 4 MiB accepted into normal read path;
- one byte over rejected before file reading;
- failure is surfaced through existing import feedback;
- no state/history mutation.

Avoid constructing a real 4 MiB fixture in unit tests if a lightweight mock of `File.size` is sufficient.

### Saved networks
- 64 accepted;
- 65 rejected.

### Outposts
- 96 accepted;
- 97 rejected.

### Cargo Link structures / pads
- 12 accepted;
- 13 rejected.

### Network Cargo Links
- 256 accepted;
- 257 rejected.

### Manufacturing
- 256 accepted;
- 257 rejected.

### Planned Supply
- 256 accepted;
- 257 rejected.

### Outbound items
- 128 accepted;
- 129 rejected.

### Aggregate recursively counted arrays
- exactly 25,000 accepted;
- 25,001 rejected;
- include smaller/nested arrays so the test proves this is truly recursive and not merely a sum of headline collections.

### Strings
- 4,096 UTF-16 code units accepted;
- 4,097 rejected;
- test at least one non-name persisted string as well as a human-facing name/string so the implementation is demonstrably generic.

If useful, include a surrogate-pair/non-BMP test only to prove the code follows JavaScript `.length` semantics; do not overcomplicate the suite.

### Short-circuit behavior

Where testable without brittle implementation-detail assertions, verify that a clear early breach does not traverse/process the entire remaining pathological structure.

Do not add fragile timing-based unit tests.

### Atomicity

For representative failures verify:
- collection unchanged;
- history unchanged;
- active state unchanged;
- storage unchanged.

### Legacy migration

Include at least one legacy-schema import near/at a capacity boundary to ensure pre-migration checks do not accidentally break valid historical migration.

---

## Benchmark fixture regression

Use the existing generated dense and broad fixtures as integration/regression evidence where practical.

Both should continue to import successfully after limits are implemented because they were designed to sit within the validated envelope:

- dense: near aggregate/network/pad/link/string limits;
- broad: 64-network breadth case.

Do not commit generated multi-megabyte JSON fixtures if they are currently generated into ignored local-work directories.

Regenerate them during verification.

---

## Documentation

Update durable documentation as needed.

At minimum:
- document the production external-import envelope in the most appropriate durable architecture/domain/import documentation;
- update `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md` and/or `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md` only if needed to mark that the validated limits are now implemented;
- keep benchmark reports under `docs/benchmarks/`;
- keep audit reports under `docs/audits/`.

Do not create transient slice/audit-number documentation.

Do not rewrite the benchmark reports into implementation docs.

---

## Accessibility

Preserve the current accessible import-status behavior.

A rejected import must continue to be announced through the existing status/live-region mechanism.

Do not add:
- persistent invalid styling;
- modal error dialogs;
- browser-native alerts.

If localization keys are added, ensure all supported locale behavior remains consistent with current localization policy.

---

## Non-goals

Do not in this task:

- optimize cargo provenance/availability algorithms;
- optimize `unresolved-cargo-export`;
- optimize `interstellar-cargo-helium-3`;
- redesign Cargo Links UI;
- solve legitimate >12-link recovery;
- add collection splitting;
- change storage quota/recovery behavior;
- implement export filename truncation;
- change normal gameplay capacity rules;
- change domain diagnostics into import rejection unless explicitly part of the capacity boundary above;
- add backend/server logic;
- add new dependencies without strong justification.

---

## Verification

Run at minimum:

- focused external import validation tests;
- focused serialization/migration tests;
- focused import UI/file-size tests;
- focused collection/history atomicity tests;
- fixture generation:
  - `node scripts/browser-import-capacity-fixtures.mjs`;
- verify dense fixture imports successfully;
- verify broad fixture imports successfully;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If current repo commands differ, use the current equivalents and report them exactly.

Where practical, rerun the existing import-capacity benchmark selectively to confirm no material regression in accepted imports.

No new manual browser performance benchmark is required unless implementation unexpectedly changes runtime characteristics.

---

## Completion response

Return:

1. concise implementation summary;
2. files changed;
3. exact production limits implemented;
4. where the pre-read 4 MiB guard is enforced;
5. how bounded structural traversal/counting was implemented;
6. definition used for aggregate persisted members;
7. how string length is measured;
8. new machine-readable import error categories;
9. localization/presentation changes;
10. exact-limit and one-over-limit test coverage;
11. atomic-rejection/history results;
12. legacy migration coverage;
13. dense fixture result;
14. broad fixture result;
15. verification commands/results;
16. documentation updated;
17. confirmation that internal browser-storage recovery semantics were not unintentionally tightened;
18. confirmation that normal Undo/Redo remains available for all accepted imports;
19. confirmation that export filename handling, >12-link recovery, storage quota/recovery, and performance optimization remain out of scope;
20. confirmation that no commit or push was performed.

Do not commit or push unless explicitly instructed.
