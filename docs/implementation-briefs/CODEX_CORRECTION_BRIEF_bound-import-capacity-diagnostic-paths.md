# Codex Correction Brief — Bound Capacity-Validation Diagnostic Paths

## Objective

Make one narrow correction to the external-import capacity implementation before commit.

The current pre-validation capacity traversal is iterative, which avoids call-stack recursion, but it carries the full dotted/indexed path string for every pending node. Because this traversal runs on arbitrary external JSON **before structural validation**, an extremely deep but otherwise small document can make path construction grow disproportionately with nesting depth.

Correct that implementation so diagnostic-path handling remains bounded even for pathological nesting.

Do **not** change the validated production limits, import semantics, history behavior, localization, or any other production behavior.

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

Inspect the current uncommitted implementation, especially:

- `src/data/externalImportValidation.ts`;
- `src/data/importErrors.ts`;
- `src/data/serialization.ts`;
- `src/ui/components/NetworkImportButton.tsx`;
- current external-import capacity tests;
- existing import application/orchestration tests, if any;
- current architecture documentation touched by the implementation.

Use the current working tree as the source of truth.

---

## Problem to correct

The capacity traversal currently carries paths in the form:

- `networks[0].network.outposts[0]...`
- arbitrary unknown object paths;
- arbitrary unknown array paths.

For normal tracker state this is shallow and harmless.

However, because capacity validation intentionally runs before strict structural validation and also visits unknown/legacy fields, a small external document can contain an extremely deep chain of nested objects.

If each traversal step constructs and stores the entire ancestral path, cumulative string allocation/copying can grow much faster than the actual useful diagnostic information.

This creates a pathological resource-consumption shape that is inconsistent with the purpose of the capacity boundary.

---

## Required correction

Bound the diagnostic-path representation used by the capacity traversal.

### Desired invariant

> Traversing another nested object/array level must not cause the stored diagnostic context to grow without bound.

The traversal must remain iterative.

Do not reintroduce recursive function calls merely to simplify path handling.

### Acceptable implementation approaches

Use whichever approach best fits the existing code, for example:

- a helper that appends path segments only while a bounded diagnostic-path budget remains;
- retaining exact paths for known shallow schema locations while truncating/summarizing arbitrary deep paths;
- storing bounded segment metadata and materializing a bounded diagnostic string only when throwing;
- another equivalent bounded representation.

The exact implementation is up to Codex.

### Important requirement: known capacity paths must still work

The implementation must continue to recognize the exact known shallow paths used for per-array ceilings, including:

- `networks`;
- `networks[].network.outposts`;
- `networks[].network.cargoLinks`;
- `networks[].network.outposts[].cargoPads`;
- `networks[].network.outposts[].manufacturing`;
- `networks[].network.outposts[].plannedSupply`;
- `networks[].network.outposts[].cargoPads[].outboundItems`;
- legacy pad-link export arrays currently covered by the capacity implementation.

Do not let path bounding accidentally disable or weaken those per-array checks.

A reasonable internal diagnostic-path cap can be comfortably larger than any legitimate known schema path.

---

## Do not create a new product-facing depth limit unless necessary

The preferred correction is bounded internal diagnostic context.

Do **not** introduce a new externally documented nesting-depth ceiling merely as a shortcut unless the implementation demonstrates that a depth boundary is genuinely required for resource safety.

The benchmarked/validated production envelope should remain unchanged.

---

## Error behavior

Existing machine-readable capacity error categories must remain unchanged unless a small internal refactor requires otherwise.

For capacity errors that include a `path` parameter:

- keep the path useful;
- keep it bounded;
- do not include unbounded imported content;
- do not expose a gigantic attacker-controlled string.

If a diagnostic path is truncated/summarized, it is acceptable for the path to indicate truncation in a neutral durable way.

Do not add new user-facing localization solely for path truncation.

---

## Regression test: pathological nesting

Add a focused regression test proving that pathological nesting does not produce unbounded diagnostic-path growth.

### Required properties

Construct a deeply nested unknown object or unknown object/array chain that:

- remains under the 4 MiB external file ceiling;
- does not rely on malformed JavaScript objects/getters;
- is valid JSON-shaped data;
- reaches substantial depth;
- eventually triggers an existing capacity failure, preferably a string-length or aggregate-member failure.

Assert that:

1. validation throws the expected existing `NetworkImportError`;
2. the error’s diagnostic `path`, if present, remains bounded;
3. validation completes without stack overflow;
4. the test does not depend on elapsed-time thresholds.

Do not write a brittle performance timing test.

### Suggested shape

A chain conceptually like:

```text
root.deep.deep.deep.deep....value
```

with an over-limit string or over-limit nested array at the bottom is sufficient.

Use a depth large enough that the old full-path implementation would clearly accumulate a very large path.

---

## Preserve all existing capacity semantics

Do not change:

- 4 MiB selected-file ceiling;
- 64 saved networks;
- 96 outposts/network;
- 12 cargo pads/outpost;
- 256 Cargo Links/network;
- 256 manufacturing/outpost;
- 256 Planned Supply/outpost;
- 128 outbound items/pad;
- 25,000 aggregate recursively counted array members;
- 4,096 UTF-16 code units per persisted string;
- inclusive exact-limit semantics;
- pre-migration enforcement;
- post-migration validation;
- structured import errors;
- localization;
- atomic external-import rejection;
- normal Undo/Redo for accepted imports;
- internal browser-storage recovery policy.

Dense and broad validated fixtures must continue to import successfully.

---

## Optional atomicity-test strengthening

The current test named similarly to “capacity rejection leaves session context, history, and storage alone” verifies a pure deserialization failure while an unrelated editing session remains untouched.

That is not harmful, but it does not by itself prove that the import application/orchestration layer refrains from dispatching collection replacement.

### If an existing cheap test seam exists

If the repository already has an import application/component/orchestration test seam where this can be asserted without adding new infrastructure, strengthen coverage so a capacity rejection demonstrably does not invoke the successful-import/replacement path.

For example:
- failed deserialization does not call `onImport`;
- reducer replacement is not dispatched;
- history remains untouched.

### If no cheap seam exists

Leave the existing architecture and tests alone.

Do **not** build new orchestration infrastructure solely for this optional refinement.

This is not the primary correction.

---

## Production scope

Do not:

- alter any production capacity ceiling;
- change import messages;
- add new localized user-facing text;
- change `NetworkImportButton` file-size behavior;
- change export filename handling;
- alter history semantics;
- alter storage/recovery;
- optimize provenance/availability validation;
- redesign Cargo Links;
- solve imports above 12 pads;
- add dependencies.

---

## Verification

Run at minimum:

- focused capacity-validation tests;
- new pathological-depth regression test;
- existing file-size import test;
- relevant external-import integrity tests;
- regenerate validated fixtures:
  - `node scripts/browser-import-capacity-fixtures.mjs`;
- confirm dense fixture imports;
- confirm broad fixture imports;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If the current repository has a focused command for the capacity test file, run it and report the exact command.

No new manual browser performance pass is required for this narrow correction unless behavior unexpectedly changes.

---

## Completion response

Return:

1. concise summary of the correction;
2. files changed;
3. how diagnostic-path growth is now bounded;
4. the internal path bound/representation used;
5. confirmation that all known per-array path ceilings still match correctly;
6. pathological-depth regression-test description and result;
7. whether atomicity coverage was strengthened, and how;
8. dense fixture result;
9. broad fixture result;
10. verification commands/results;
11. confirmation that production capacity ceilings are unchanged;
12. confirmation that localization/user-visible behavior is unchanged;
13. confirmation that Undo/Redo and storage/recovery semantics are unchanged;
14. confirmation that no commit or push was performed.

Do not commit or push unless explicitly instructed.
