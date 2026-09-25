# CODEX IMPLEMENTATION BRIEF — Transient Identifier Cleanup in Localization Provenance Tooling

## Objective

Implement the pre-release cleanup identified by:

```text
docs/audits/TRACKED-TREE-TRANSIENT-IDENTIFIER-REVIEW.md
```

The goal is to remove transient implementation-sequence identifiers such as:

```text
C2
C3
C4
C5
C6
C7
C8
Parcel D
Batch 1 / Batch 3
```

from the **current durable/source/tooling tree** where those identifiers have leaked beyond the historical briefs/audits that originally owned them.

This is a bounded localization-provenance terminology migration.

The cleanup must:

- replace temporary task-sequence names with semantic, responsibility-based names;
- preserve all existing localization/provenance behavior;
- rename three active `reference-source` artifacts;
- migrate the affected structured classification/reason values;
- replace the task-derived provenance generator version `8.0.0-c8` with the agreed semantic tool version `1.0.0`;
- update all current consumers atomically;
- update current durable documentation;
- preserve historical briefs/audits and Git history unchanged;
- verify that no actionable transient sequence terminology remains in the current non-historical tree.

This task does **not** change the application runtime model, persisted user data, browser storage, localization output semantics, reference dataset schema, or app version.

---

## Authority and source material

Treat these as the task authority:

```text
AGENTS.md
docs/audits/TRACKED-TREE-TRANSIENT-IDENTIFIER-REVIEW.md
docs/ARCHITECTURE.md
docs/localization/LOCALIZATION-INPUTS.md
docs/localization/JAPANESE-GLOSSARY.md
```

Also inspect all directly affected scripts/tests before editing.

The audit concluded:

```text
TREE-D
```

because transient IDs entered current tooling/generated contracts, but **not** user/browser persistence or public runtime reference-data schemas.

Do not reopen that classification unless the current committed tree materially differs from the audit baseline.

---

## 1. Baseline

Work from the current committed `staging` branch.

Before editing, record:

```text
branch
commit
tracked/untracked state
```

Do not modify the user-supplied implementation brief.

No commit, push, deployment, history rewrite, repository publication, tag, or release operation is authorized.

---

## 2. Historical-owner documents remain untouched

Historical briefs/audits that own their own implementation sequences are **not cleanup targets**.

Examples:

```text
docs/implementation-briefs/*parcel-c6*
docs/implementation-briefs/*batch-3*
docs/audits/*c6*
docs/audits/*parcel-d*
```

Leave those paths and historical narrative unchanged.

Do not rewrite history.

Do not rename historical audit/brief filenames merely for consistency.

A historical document may continue referring to a filename that existed at the time it was written.

Current owner docs and current tooling must use the new semantic names.

---

## 3. Semantic vocabulary

Use the following semantic replacements throughout current tooling/docs.

```text
C2 → direct localized-name provenance / direct-name targets
C3 → star-system provenance / star-system targets
C4 → body provenance / body targets
C5 → organic provenance or template-fauna provenance, depending on role
C6 → composed-fauna provenance / composed-fauna targets / composed-fauna preview
C7 → official provider-chain validation
C8 → integrated provenance closure / source-policy validation
Parcel D → localized reference-name overlay generation/integration
```

Do not mechanically replace tokens without regard to role.

Choose the narrowest semantic term appropriate to each symbol, diagnostic, fixture, comment, or documentation sentence.

---

## 4. Rename the three tracked artifacts

Apply these exact semantic filenames:

```text
reference-source/localized-name-provenance-c6-fauna.csv
→ reference-source/localized-name-provenance-composed-fauna.csv

reference-source/localized-name-provenance-c5-fauna-lineage.csv
→ reference-source/localized-name-provenance-template-fauna-lineage.csv

reference-source/localized-name-c6-fauna-ja-preview.csv
→ reference-source/localized-name-composed-fauna-ja-preview.csv
```

These are active artifacts, not obsolete files.

Do not remove them.

Update every current tracked producer/consumer.

Historical references in old briefs/audits may remain unchanged.

---

## 5. Migrate composed-fauna classification/reason vocabulary

The current composed-fauna provenance CSV contains:

```text
RESOLVED_COMPOSED_FAUNA_C6
```

in all 922 data rows.

Change the current semantic contract to:

```text
RESOLVED_COMPOSED_FAUNA
```

Likewise replace the active deferred classification/reason vocabulary:

```text
DEFERRED_COMPOSED_FAUNA_C6
→ DEFERRED_COMPOSED_FAUNA
```

Apply this consistently across:

```text
generator constants
validators
tests
fixtures
diagnostics
generated CSV output
```

Do not introduce compatibility aliases unless a current tracked consumer genuinely requires them.

This is build/reference tooling data, not persisted user data. No browser-state migration is required.

Preserve all existing population counts and fail-closed behavior.

---

## 6. Migrate composed-fauna diagnostic/error-code names

Current stable-looking codes such as:

```text
C6_*
```

must be replaced with semantic codes such as:

```text
COMPOSED_FAUNA_*
```

Use one coherent naming family.

Do not change when/why errors are raised.

Only the names/messages should change.

Update:

```text
exports
imports
tests
fixtures
assertions
operator diagnostics
```

atomically.

---

## 7. Migrate current API/function/constant names

Inspect and rename transient-sequence identifiers in the affected localization tooling.

Examples called out by the audit include names such as:

```text
buildC5Targets
c6Result
c6Fauna
c6Handoff
c6Preview
c5Lineage
C6_EXPECTED
```

Replace them with semantic names such as:

```text
buildDirectNameTargets
buildStarSystemTargets
buildBodyTargets
templateFaunaLineage
composedFauna
composedFaunaPreview
```

or equally precise names justified by the real code.

Do not rename unrelated stable APIs merely for style.

Do not change signatures or data shape except where the old transient key name itself is part of the contract being cleaned.

---

## 8. Build-report key migration

The ignored/local build report currently inherits C-numbered keys from the builder.

Replace task-derived keys with semantic keys.

Preferred vocabulary:

```text
directNames
starSystems
bodies
organic
templateFaunaLineage
composedFauna
composedFaunaPreview
officialProviderChains
provenanceClosure
```

Use only keys actually required by the report.

This is a tooling contract migration.

Update all current tracked code/tests that expect the old build-report shape.

Do not preserve duplicate old/new keys merely for compatibility unless a real current consumer exists.

---

## 9. Provenance generator tool version

The current manifest uses:

```text
generator.toolVersion = "8.0.0-c8"
```

Replace it with:

```text
generator.toolVersion = "1.0.0"
```

This is the agreed first semantic/public provenance-generator tool version.

It is **independent** of:

```text
application version 0.9.0-beta.1
future application version 1.0.0
reference dataset ID
save schema versions
```

Do not derive the tool version from the application version.

If the tool version is currently hard-coded in `scripts/localization/provenance-manifest.mjs` or another owner module, update that owner and regenerate the manifest.

Do not add automatic tool-version bumping in this task.

---

## 10. Specific files called out by the audit

At minimum inspect and update the affected files identified by the audit.

### Current durable documents

```text
docs/ARCHITECTURE.md
docs/localization/JAPANESE-GLOSSARY.md
docs/localization/LOCALIZATION-INPUTS.md
```

### Localization scripts

Likely affected:

```text
scripts/localization/body-provenance.mjs
scripts/localization/star-system-provenance.mjs
scripts/localization/localized-name-provenance.mjs
scripts/localization/localization-input-manifest.mjs
scripts/localization/localized-field-map.mjs
scripts/localization/organic-provenance.mjs
scripts/localization/composed-fauna-provenance.mjs
scripts/localization/build-localized-name-provenance.mjs
scripts/localization/provenance-build-integration.mjs
scripts/localization/provenance-manifest.mjs
scripts/localization/starfield-plugin-reader.mjs
scripts/localization/validate-localized-name-provenance.mjs
```

### Localization tests

Likely affected:

```text
scripts/localization/localization-inputs.test.mjs
scripts/localization/localized-name-provenance.test.mjs
scripts/localization/organic-provenance.test.mjs
scripts/localization/composed-fauna-provenance.test.mjs
scripts/localization/official-master-provider-chains.test.mjs
```

The audit estimated 17 script/test files with actionable content leakage.

Do not assume this list is exhaustive.

After renaming symbols/files, repeat exact searches and use import/test failures to identify any additional current consumers.

---

## 11. Durable documentation cleanup

Update only current owner documentation.

### `docs/ARCHITECTURE.md`

Replace task-sequence terminology such as `Batch 1`, `Batch 3`, and C5/C6 artifact names with current semantic descriptions.

Describe behavior directly, e.g.:

```text
biome-aware reference-data migration
organic provenance
composed-fauna provenance
```

### `docs/localization/JAPANESE-GLOSSARY.md`

Replace current-use provenance language such as:

```text
Codex B1
Parcel B3
```

with semantic descriptions such as:

```text
Codex first draft
independent comparative adjudication
```

Use a semantic heading such as:

```text
Comparative adjudication decisions
```

where appropriate.

### `docs/localization/LOCALIZATION-INPUTS.md`

Reframe the current workflow around semantic responsibilities:

```text
direct-name provenance
star-system provenance
body provenance
organic/template-fauna provenance
composed-fauna provenance
official provider-chain validation
integrated provenance closure
localized reference-name overlay generation
```

Remove dependence on C2–C8 / Parcel C / Parcel D terminology.

Update the three renamed artifact paths.

Preserve the actual operational sequence where useful, but number/describe steps locally rather than relying on historical project IDs.

---

## 12. Code comments and diagnostics

Rewrite current comments/messages that require historical context.

Examples:

```text
// C6 handoff
// Parcel C5 boundary
// Added in C8
```

should become semantic explanations of responsibility.

Keep comments useful.

Do not replace meaningful comments with generic wording.

Operator-facing diagnostics should explain the failing provenance responsibility directly.

---

## 13. Test descriptions and fixtures

Rename test descriptions that currently require historical sequence knowledge.

Examples:

```text
"rejects C6..."
"validates C7 provider..."
```

should become behavior-oriented descriptions.

Also replace temporary fixture codes/prefixes such as:

```text
c7-tes4-
```

where those values are implementation-work labels rather than stable domain fixture IDs.

Preserve legitimate fixture IDs such as generic `c1` object IDs where they have no planning-sequence meaning.

Do not reduce behavioral test coverage.

---

## 14. Regeneration requirements

Regenerate only what the tooling migration requires.

Expected regenerated tracked artifacts include at least:

```text
reference-source/localized-name-provenance-composed-fauna.csv
reference-source/localized-name-provenance-manifest.json
```

The two renamed artifacts:

```text
localized-name-provenance-template-fauna-lineage.csv
localized-name-composed-fauna-ja-preview.csv
```

should remain content-equivalent except for path/metadata changes unless the normal deterministic generator writes them.

If regeneration is the repository-standard path, prefer regeneration to hand-editing generated evidence.

Review diffs carefully.

Preserve these audit-established invariants:

```text
922 composed-fauna entities
2,179 composed component rows
5 template-fauna lineage rows
922 Japanese preview rows
```

and all existing provider/closure/count invariants.

If current authoritative generation produces a different count, stop and report rather than silently accepting semantic drift.

---

## 15. Manifest/hash implications

Regenerate the provenance manifest through the normal tool.

Expect:

```text
generator.toolVersion → 1.0.0
generated timestamp/commit/tool metadata → normal regeneration changes
```

Verify source/input hashes remain coherent.

Do not hand-adjust hashes to force a match.

Do not change reference runtime dataset hashes unless normal verified generation legitimately requires it.

---

## 16. Exact-path search after migration

Before declaring completion, search the tracked current tree for the exact old artifact names:

```text
localized-name-provenance-c6-fauna.csv
localized-name-provenance-c5-fauna-lineage.csv
localized-name-c6-fauna-ja-preview.csv
```

Expected:

```text
no current consumer/owner-doc references remain
```

Historical briefs/audits may still contain the old names.

Classify those as intentional historical references.

---

## 17. Transient-token verification after migration

Repeat a context-aware scan of the current tracked tree for:

```text
C2
C3
C4
C5
C6
C7
C8
Parcel C
Parcel D
Batch 1
Batch 3
```

Do not expect zero raw matches globally.

Expected legitimate matches include:

```text
historical briefs/audits
C6Hn
self-contained procedure steps
fixture/domain IDs
```

What must be zero is:

> actionable transient-sequence use outside historical owners or legitimate domain/self-contained contexts.

Document the remaining match classes.

Do not remove legitimate domain strings to satisfy a grep count.

---

## 18. No runtime/user-data changes

This cleanup must not change:

```text
src/ application behavior
browser persistence
NetworkCollection schema
OutpostNetwork schema
reference runtime JSON schema
reference IDs
localized display values
locale coverage
search behavior
import/export
Undo/Redo
```

If any required migration appears to cross into application runtime/user data, stop and report before proceeding.

The audit explicitly found no such entanglement.

---

## 19. No history rewrite

Do not:

```text
filter-repo
rebase old commits
remove old historical names from past commits
rename old audit/brief paths
force-push
```

Historical development records remain intentionally preserved.

The cleanup applies to the current tree only.

---

## 20. No dependency or architecture expansion

Do not:

```text
add dependencies
change localization architecture
change overlay loading
change reference-data caching
change build/version management
introduce new schema frameworks
```

This is terminology/contract cleanup inside existing localization provenance tooling.

---

## 21. Required focused verification

Run the relevant localization/provenance checks.

At minimum:

```sh
npm run localization:provenance:test
npm run localization:provenance:build
npm run localization:provenance:verify
npm run localization:terminology:verify
npm run localization:reference-names:verify
npm run localization:verify
```

If `localization:provenance:proof` requires locally installed game inputs, run it only if those inputs are available. Otherwise record that limitation; do not fabricate a pass.

Also run, where supported without unavailable external inputs:

```sh
npm run reference:build
npm run reference:test
npm run reference:verify
```

The goal is to prove the terminology migration did not alter generated reference behavior.

---

## 22. Required whole-project verification

Run:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

If normal lint remains blocked only by the known ignored `.local-work/reference-overlay-prototype` multi-TSConfig-root issue:

1. report the known limitation;
2. use the established clean checkout-shaped lint pass if practical;
3. do not modify the ignored prototype.

---

## 23. Diff review requirements

Separate the completion report into:

```text
renames
semantic API/code identifier changes
structured contract value changes
generated artifact changes
documentation rewrites
test updates
```

Pay special attention to accidental semantic changes hidden inside large generated diffs.

The intended generated-content changes are limited to:

```text
renamed paths
renamed classification/reason values
provenance generator toolVersion 1.0.0
normal regenerated metadata
```

Population/content semantics should remain otherwise unchanged.

---

## 24. Success criteria

This cleanup is complete when:

- all three active artifacts have semantic filenames;
- all current tracked consumers use the new names;
- `RESOLVED_COMPOSED_FAUNA_C6` is replaced by `RESOLVED_COMPOSED_FAUNA`;
- `DEFERRED_COMPOSED_FAUNA_C6` is replaced by `DEFERRED_COMPOSED_FAUNA`;
- `C6_*` composed-fauna diagnostic/error codes are semantic;
- current APIs/constants/locals/report keys no longer rely on C2–C8 task terminology;
- `generator.toolVersion` is `1.0.0`;
- the three current durable docs are semantically rewritten;
- historical owner docs remain unchanged;
- no actionable transient sequence terminology remains in the current non-historical tree;
- all provenance/reference invariants remain intact;
- full verification passes subject only to documented environment limitations;
- no application runtime/user-data/schema behavior changes occur.

---

## 25. Manual testing

No broad browser/manual UI test is required for this tooling/documentation cleanup if:

```text
generated runtime outputs are unchanged
full build passes
localization verification passes
reference verification passes
```

If regenerated runtime outputs differ unexpectedly, stop and report before handoff.

Do not resume Apple/Safari/WebKit release testing until this blocker is cleared and committed.

---

## 26. Non-goals

Do not:

```text
rename historical briefs/audits
rewrite Git history
remove retained provenance evidence
change localized wording
change official-name data
change app version
cut 1.0.0-rc.1
change reference caching
change overlay loading
change user save schemas
change Cloudflare/deployment settings
```

---

## 27. Completion report

Report:

1. baseline branch/commit;
2. files renamed;
3. files modified;
4. old → new artifact mapping;
5. old → new classification/reason mapping;
6. old → new error-code/API terminology families;
7. build-report key changes;
8. provenance generator tool version change to `1.0.0`;
9. regenerated artifacts;
10. count/invariant comparison before/after;
11. durable docs updated;
12. historical-owner files intentionally left unchanged;
13. remaining transient-pattern matches and why they are legitimate;
14. focused provenance/reference verification results;
15. full test/build/type/localization/lint results;
16. any unavailable installed-game proof;
17. `git diff --check` result;
18. confirmation no history rewrite/runtime/user-data/schema/deployment/remote operation occurred.

Suggested commit message:

```text
refactor: remove transient localization identifiers
```
