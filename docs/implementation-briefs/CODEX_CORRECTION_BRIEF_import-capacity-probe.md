# Codex Correction Brief — Import Capacity Probe

## Objective

Make a narrow correction pass over the import-capacity benchmark/report so that the probe accurately reflects what was measured and does not carry an undesirable validation-order assumption into the future implementation design.

Do **not** redesign the benchmark suite, add production import limits, or start the combined-envelope Chromium validation in this task.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- source code;
- tests;
- comments;
- documentation;
- localization keys;
- benchmark fixture names;
- generated artifacts;
- filenames.

Existing historical occurrences are out of scope.

## Scope

Change only what is necessary to address the four corrections below:

1. future capacity checks should be described as early/bounded checks rather than something performed only after exhaustive structural validation;
2. the attached baseline sample should be timed using its original supplied text, not only a normalized compact reserialization;
3. rename the “vanilla maximal” benchmark labels so they do not imply every dimension is saturated;
4. preserve the existing durable benchmark report, which is already tracked.

Do not broaden the task.

## 1. Correct the future validation-order recommendation

The current report says the future capacity/resource limits should be applied after the existing strict structural and identity checks.

That should be revised.

### Desired principle

A future resource-safety implementation should reject oversized/pathological input as early as practical.

The intended conceptual order is:

1. pre-read file byte check using `File.size`;
2. read and parse JSON;
3. perform a **bounded structural traversal** that:
   - validates the relevant structure;
   - counts persisted members;
   - enforces per-array ceilings;
   - checks string-length ceilings;
   - aborts immediately when a capacity limit is exceeded;
4. continue with migration;
5. perform post-migration current-shape / identity validation;
6. continue into normal domain validation only after the import is accepted.

Do **not** prescribe that this must be implemented as two separate traversals.

It may be preferable for a future implementation to integrate capacity accounting into the same traversal that performs strict external structural validation.

The important design property is:

> A pathological file should not require exhaustive validation of every nested member before the application discovers that the document already exceeds a hard resource-safety limit.

### Required report change

Update the benchmark report so it no longer recommends applying all quantitative limits only after existing strict structural/identity validation.

State instead that capacity checks should occur during or as early as possible in structural traversal, with short-circuit rejection when a hard ceiling is reached.

This task is documentation/benchmark correction only. Do not implement those limits now.

## 2. Measure the attached baseline sample in its original textual form

The current benchmark path loads the supplied sample, imports it once, then passes the resulting normalized collection into the generic `measure()` function.

That means the reported repeated parse/full-import timings are based on the normalized compact serialization of the imported collection rather than repeatedly using the exact supplied 56,787-byte file text.

### Desired correction

When `--sample` is supplied:

- retain the original file text;
- measure `JSON.parse` against that original text;
- measure `deserializeNetworkCollection` against that original text;
- retain the normalized imported collection for the downstream history/domain/render/storage measurements where appropriate.

The benchmark output/report should clearly distinguish:
- source file bytes;
- normalized compact bytes;
- normalized pretty/export bytes.

Do not change the production import path.

### Report correction

Update the attached-sample timing row and explanatory text so that:
- parse/full-import values refer to the original attached file text;
- normalized compact/export sizes remain available as useful comparisons;
- the report does not imply that the old 0.31 ms number measured the exact supplied pretty-printed file unless the rerun confirms that value.

Rerun the relevant benchmark after this change and update measured values in the report.

There is no need to rerun unrelated stress cases unless the script structure makes that simpler.

## 3. Rename misleading “vanilla maximal” fixture labels

Some fixture labels currently use wording equivalent to “vanilla maximal networks”.

Those fixtures use:
- vanilla maximum outpost scale;
- vanilla maximum cargo-pad scale;
- but do not necessarily saturate every possible relationship dimension, especially Cargo Links.

For 24 outposts × 6 pads, the theoretical maximum number of bidirectional pad pairings is 72 Cargo Links if every pad is used exactly once.

Some current fixtures use lower link counts.

### Desired naming

Rename the affected descriptive labels in the report and benchmark naming where needed to wording such as:

- `large, vanilla-sized networks`;
- `maximal, vanilla-sized networks`;
- `ultra-maximal, vanilla-sized networks`;

or an equivalent neutral phrase that means:
> vanilla maximum outpost/pad scale without claiming every dimension is saturated.

Do not rename unrelated fixture families such as dense/modded/wide-pad/pathological cases unless necessary for consistency.

The benchmark category words `light`, `medium`, `large`, `maximal`, and `ultra-maximal` remain acceptable exploratory benchmark labels. The correction is specifically about the misleading phrase “vanilla maximal”.

## 4. Benchmark report tracking

`docs/IMPORT-CAPACITY-BENCHMARK.md` is already tracked.

Do not remove, relocate, or regenerate it under a new filename.

Keep it as the durable report for this probe.

Do not add a duplicate report.

## Combined-envelope validation is NOT part of this task

Do not create or run the combined worst-allowed fixture yet.

That is the next task after this correction is reviewed and committed.

The future combined-envelope validation fixture will be generated programmatically by Codex or another automated harness. The user is **not** expected to hand-author it.

Do not constrain the future design around requiring a manually created JSON file.

A subsequent brief will specify:
- how to generate a collection near the intersection of the proposed limits;
- how to export it to a temporary/local JSON fixture if needed;
- how to exercise it in real Chromium;
- the exact import/edit/Undo/Redo/reload interactions to test.

## Production behavior

Production behavior must remain unchanged.

Do not:
- add file-size limits;
- add count/member limits;
- add string-length limits;
- alter `NetworkImportButton`;
- alter import error messages;
- alter history semantics;
- alter storage behavior;
- alter domain validation rules;
- add user-facing warnings;
- add dependencies unless absolutely necessary for the benchmark correction.

## Tests / verification

Run the smallest focused checks needed for the correction, then the normal repository verification.

At minimum:

- corrected benchmark command using the attached baseline sample;
- deterministic benchmark fixture test;
- relevant import/serialization tests;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If only labels/report text and the sample measurement path change, there is no need to invent new UI tests.

## Completion response

Return:

1. concise summary of the correction;
2. files changed;
3. updated attached-sample source/normalized sizes;
4. updated attached-sample parse/full-import timings;
5. exact wording used for the renamed vanilla-sized fixture categories;
6. confirmation that the report now recommends early/bounded capacity checking during structural traversal rather than only after exhaustive validation;
7. verification commands/results;
8. confirmation that production behavior is unchanged;
9. confirmation that the combined-envelope Chromium validation was not started.

Do not commit or push unless explicitly instructed.
