# CODEX AUDIT BRIEF — Source Documentation and Commenting Standard Review

## Objective

Review the repository's current source-documentation/commenting conventions, formalize a clearer coding/documentation standard, and audit the current tracked source tree against that standard.

The current repository guidance in `AGENTS.md` is directionally correct but intentionally brief. It says that substantial new or rewritten files should retain the repository's explanatory comment convention where useful:

```text
Purpose
Architecture
Change this file when
```

It also says that non-obvious functions should have short intent comments, comments should explain **why** rather than restating obvious syntax, and trivial code should not be over-commented.

The user wants to preserve and strengthen that philosophy.

The central principle for this audit is:

> **Comments should preserve intent, ownership, constraints, invariants, and reasons that are not obvious from the code itself. They should not narrate straightforward implementation.**

A competent programmer can usually see what code does. The valuable documentation is the context needed to understand **why it is written that way**, especially when debugging, reviewing, refactoring, or modifying it.

This is an **audit and standards-definition task only**.

Do not make executable-code changes.

---

## 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/IMPLEMENTATION-WORKFLOW.md
README.md
```

Then inspect the tracked source tree, including:

```text
src/
scripts/
tests/
```

and representative config/build/tooling files where source documentation is relevant.

Do not modify the supplied audit brief.

---

## 2. Existing repository guidance

Start from the existing `AGENTS.md` section:

```text
## Code style and comments
```

Treat its current philosophy as the baseline, not something to discard.

Evaluate:

- what is already useful;
- what is too vague for consistent agent application;
- what should remain in `AGENTS.md`;
- what should move into a more formal durable coding/documentation standard.

Do not turn `AGENTS.md` into a large style manual.

---

## 3. Desired commenting philosophy

Formalize the following principle:

```text
Comment intent, constraints, ownership, invariants, and non-obvious reasons.
Do not comment obvious mechanics.
```

A useful comment should answer questions such as:

```text
Why is this boundary here?
Why must this state remain presentation-only?
Why is this exact producer identity preserved?
Why is this helper using one data source instead of another?
Why must this operation be one Undo entry?
Why is this browser/layout workaround necessary?
What tempting simplification would break an invariant?
What responsibility deliberately belongs elsewhere?
```

Avoid comments that merely translate code into prose.

Example of low-value commentary:

```ts
// Filter planet species by body ID.
const candidates = referenceData.planetSpecies.filter(
  (entry) => entry.bodyId === bodyId,
)
```

Example of high-value commentary:

```ts
// Farming eligibility is planet-level. Do not filter through organicOccurrences:
// those records describe natural biome occurrence, not greenhouse/husbandry access.
const candidates = referenceData.planetSpecies.filter(
  (entry) => entry.bodyId === bodyId,
)
```

The audit should use this distinction consistently.

---

## 4. Proposed formal standard

Define a concise proposed durable standard suitable for a new file such as:

```text
docs/CODE-STYLE.md
```

or an equally appropriate repository-consistent location/name.

Do not create it during this audit unless the task requires a report-only embedded proposal; the audit report should contain the proposed content/structure.

The standard should be lightweight and practical.

At minimum it should cover:

1. module/file headers;
2. owner-module versus small-helper distinction;
3. function comments;
4. invariant/boundary comments;
5. scripts/tooling;
6. tests;
7. stale/misleading comments;
8. over-commenting;
9. history/change-log comments;
10. examples.

---

## 5. Module classification

Define at least these module classes.

### A. Substantial owner module

A file that owns one or more of:

```text
feature behavior
domain rule
state-management responsibility
persistence/storage boundary
validation responsibility
significant UI region
layout responsibility
reference-data pipeline stage
generation/verification tooling
cross-feature orchestration
```

These files should normally have the full explanatory header convention:

```text
Purpose
Architecture
Change this file when
```

The header should explain ownership and boundaries, not list functions.

### B. Small supporting module

Examples:

```text
small formatter
narrow pure predicate
small constant table
tiny mapping helper
simple adapter
```

These do not require a large header when the filename/types already make responsibility obvious.

A short one- or two-line purpose comment may be sufficient if needed.

### C. Tests

Test files should not require boilerplate module headers by default.

The test names/groups should carry the behavioral contract.

Comments are appropriate for:

```text
non-obvious fixtures
why a regression matters
why a seemingly strange setup is required
cross-layer invariants
historical bug context when needed to prevent recurrence
```

Do not require comments on every test.

---

## 6. File-header standard

For substantial owner modules, the preferred header shape is:

```ts
/**
 * Purpose:
 *   Why this module exists and what responsibility it owns.
 *
 * Architecture:
 *   Where it sits in the system, what it owns, what it deliberately does not
 *   own, and which boundaries/invariants matter.
 *
 * Change this file when:
 *   What kinds of requirements or changes properly belong here rather than
 *   in an adjacent module.
 */
```

The audit should assess whether all three headings are always useful or whether rare exceptions are appropriate.

Do not encourage long headers.

A strong header is concise and durable.

Bad example:

```text
Purpose:
Imports React and renders CargoPadsEditor.
```

Better example:

```text
Purpose:
Owns presentation/editing of one outpost's cargo pads.

Architecture:
Cargo links remain network-level state. This component resolves those
relationships into local/remote pad information for presentation and editing.

Change this file when:
Cargo-pad editing/presentation or local resolution of network cargo links changes.
```

---

## 7. Function-comment standard

Recommend an intent comment when a function does one or more of the following:

```text
implements a non-obvious domain rule
owns a state transition
coordinates multiple mutations
protects an invariant
has surprising side effects or deliberately has none
depends on a subtle source-of-truth distinction
implements browser/platform-specific behavior
performs data migration/compatibility behavior
participates in persistence or Undo/Redo boundaries
contains logic a future maintainer may be tempted to simplify incorrectly
```

Do not require a comment when:

```text
name + types + local context are already sufficient
logic is straightforward
comment would merely restate syntax
```

The audit should identify representative examples of both.

---

## 8. Invariant-comment standard

This is especially important for this repository.

Require or strongly recommend intent/invariant comments where code protects a rule that is easy to accidentally "simplify."

Examples of valuable invariant topics include:

```text
presentation-only state must not be persisted
one user operation should create one Undo entry
exact organic producer identity must be preserved
natural biome occurrence is not organic farming eligibility
cargo-link state is network-level, not pad-owned
reference IDs are stored while names are resolved at presentation time
failed imports must not mutate current state/history
sticky Cargo geometry is viewport-relative and rAF-coalesced to avoid stale sizing
```

The audit should identify current locations where an invariant exists in code/docs but lacks a durable local comment and would materially benefit from one.

---

## 9. Scripts and tooling

Apply the same documentation philosophy to substantial files under:

```text
scripts/
```

A substantial generation/verification script should usually explain:

```text
what artifact or evidence it owns
what authoritative inputs it consumes
whether it generates, verifies, audits, or transforms
which invariants it enforces
what responsibility it deliberately does not own
```

Do not treat scripts as exempt merely because they are not runtime code.

Pay particular attention to:

```text
reference generation
localization/provenance tooling
verification scripts
build-identity/version tooling
import/reference verification
```

---

## 10. Tests

Audit test documentation separately from production/source modules.

Do not flag every test file without a header.

Look instead for:

```text
opaque fixture setup
regressions whose reason is not obvious
large test helpers with hidden assumptions
magic IDs/values whose significance is not explained
cases where a future maintainer could remove a "redundant" assertion without understanding the invariant
```

Recommend comments only where they preserve useful intent.

---

## 11. What not to formalize

Explicitly reject a documentation standard requiring:

```text
comments on every function
JSDoc on every export
parameter/return comments when TypeScript types already explain them
comments that restate branches/loops/assignments
author/date headers
manual change logs in source files
temporary implementation-brief IDs
"added in phase X" / "from parcel C6" historical comments
large prose headers for tiny helper files
```

Git history owns change history.

Current comments should describe the current system.

---

## 12. Stale and misleading comments

Audit for comments that:

```text
describe behavior that has changed
refer to obsolete architecture
refer to old task identifiers
describe a temporary migration as current behavior
contradict owner documentation
promise invariants the code no longer enforces
```

These are higher priority than merely missing comments.

Classify stale/misleading comments separately.

---

## 13. Documentation ownership and duplication

Assess whether source comments duplicate content that belongs in:

```text
docs/DOMAIN-RULES.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
```

The desired relationship should be:

```text
owner docs
→ full durable system/domain/UX explanation

source comments
→ local intent, ownership, invariant, and reason needed to safely work in this code
```

Do not recommend copying large documentation sections into code.

Likewise, code comments may point to a durable concept/document when useful, but should remain understandable locally.

---

## 14. Proposed `AGENTS.md` revision

Recommend a concise replacement/expansion for the current:

```text
## Code style and comments
```

section.

The revised `AGENTS.md` guidance should:

- preserve the intent-first philosophy;
- link to the formal code-style/documentation standard;
- state the expectation for substantial owner-module headers;
- state the "why, not what" principle;
- discourage trivial narration;
- remain short enough for `AGENTS.md`.

Do not rewrite unrelated `AGENTS.md` sections.

---

## 15. Audit scope

Audit the current tracked tree, with primary focus on:

```text
src/**/*.ts
src/**/*.tsx
scripts/**/*.ts
scripts/**/*.mjs
tests/**/*.ts
tests/**/*.tsx
```

Also inspect relevant:

```text
vite.config.ts
vitest.config.ts
other substantial project-owned config/tool files
```

Exclude or classify appropriately:

```text
generated reference data
third-party code
license text
lockfiles
simple JSON/CSV data
historical briefs/audits
```

Do not mistake generated data for source needing headers/comments.

---

## 16. Inventory methodology

Create a tracked-file inventory.

For each source file determine:

```text
file path
file type/class
approximate size/complexity
whether it is a substantial owner module
whether it has a module header
header quality
important local intent/invariant comments
stale/misleading comments
whether additional documentation is warranted
```

Do not mechanically classify by line count alone.

Size may be a signal, but ownership/responsibility matters more.

---

## 17. Suggested finding classes

Classify files/findings using:

```text
DOC-A — adequate; no change recommended

DOC-B — substantial owner module missing or materially lacking a module header

DOC-C — important local intent/invariant/boundary is undocumented

DOC-D — stale, misleading, obsolete, or historically transient comment should be corrected

DOC-E — excessive/redundant narration; comment cleanup recommended

DOC-F — intentionally lightweight/self-explanatory module; no added documentation needed
```

A file may have more than one actionable finding if justified.

Avoid inflating counts with trivial observations.

---

## 18. Severity / priority

For actionable documentation gaps, distinguish:

```text
HIGH
Code is easy to modify incorrectly without understanding an undocumented invariant
or current comment is materially misleading.

MEDIUM
Owner/boundary intent is unclear enough to slow safe maintenance/review.

LOW
Useful polish/consistency improvement, but code is already locally understandable.
```

Do not label missing boilerplate as HIGH merely because a header is absent.

---

## 19. Representative architecture areas

Pay special attention to modules involving:

```text
NetworkCollection / persistence
Undo/Redo
import/export
reference-data loading/integrity
organic/inorganic availability
validation
Cargo Links
Resource Matrix / Planned Supply
focus/scroll geometry
localization/provenance
build/version identity
```

These contain non-obvious boundaries and have higher documentation value.

---

## 20. Comment-quality examples from the repository

Identify several existing comments/headers that are especially good examples of the desired style.

Explain why they work.

Also identify several weak examples, such as:

```text
missing owner context
mechanical narration
stale wording
overly implementation-specific history
```

Use repository examples rather than inventing only hypothetical ones.

Do not modify them during the audit.

---

## 21. Formal-standard design

The audit report should propose an outline for:

```text
docs/CODE-STYLE.md
```

Recommended sections may include:

```text
Purpose
Principle: document intent, not mechanics
Module classes
Substantial module headers
Function comments
Invariant/boundary comments
Scripts/tooling
Tests
Stale comments
What not to comment
Examples
Review checklist
```

Keep the proposed standard concise.

Do not design a general TypeScript formatting/style guide unless needed.

The repository already has linting/formatting conventions; this task is primarily about documentation/comment quality.

---

## 22. Review checklist

Propose a short checklist future Codex/maintainers can apply when creating or modifying a substantial file.

For example:

```text
Does the file make its responsibility clear?
Does it explain boundaries a maintainer could otherwise misunderstand?
Is there an invariant that could be accidentally simplified?
Are comments explaining why rather than narrating what?
Are any comments stale after this change?
Is history being recorded in Git rather than source prose?
```

Refine as appropriate.

---

## 23. Implementation scope estimate

The audit should estimate the future documentation-only implementation pass.

Report:

```text
number of DOC-B files
number of DOC-C findings
number of DOC-D findings
number of DOC-E findings
number of DOC-F files reviewed
```

Group likely changes by:

```text
src/domain
src/data
src/ui
scripts
tests
top-level tooling
```

Identify whether the cleanup is best done:

```text
in one atomic documentation-only pass
or
in several bounded batches
```

Recommend one.

---

## 24. No executable-code changes

The eventual implementation is intended to be documentation-only.

Therefore this audit should identify any finding that cannot be fixed without executable-code modification and separate it clearly.

Do not suggest refactoring code merely because it would be easier to comment.

The future implementation should be able to change:

```text
comments
file headers
durable documentation
```

without changing behavior.

---

## 25. Scope relationship to current release

This is a **MEDIUM-priority pre-release cleanup**, not a functional release blocker unless the audit finds materially misleading documentation that could affect current correctness/maintenance.

The audit should state whether:

```text
documentation gaps are safe to fix before release
or
the scope is large enough that some low-value cleanup should be deferred
```

Do not turn documentation consistency into an open-ended release gate.

---

## 26. Audit-only constraints

Do not:

```text
change executable source
add/remove comments in source
create CODE-STYLE.md
edit AGENTS.md
refactor code
rename files/symbols
change tests
change dependencies
change app version
commit
push
deploy
```

Only create the audit report.

---

## 27. Expected report

Create:

```text
docs/audits/SOURCE-DOCUMENTATION-AND-COMMENTING-STANDARD-REVIEW.md
```

or an equally clear repository-consistent filename.

Include:

1. baseline;
2. current `AGENTS.md` assessment;
3. proposed documentation philosophy;
4. proposed module classification;
5. proposed header standard;
6. proposed function/invariant comment standard;
7. scripts/tooling standard;
8. tests standard;
9. stale/misleading comment criteria;
10. anti-patterns/non-goals;
11. proposed `docs/CODE-STYLE.md` outline/content;
12. proposed concise `AGENTS.md` revision;
13. inventory methodology;
14. findings by classification;
15. representative strong examples;
16. representative weak examples;
17. findings by repository area;
18. severity/priority;
19. implementation scope estimate;
20. one-batch vs multi-batch recommendation;
21. future verification plan;
22. release-readiness disposition.

---

## 28. Disposition

End with one:

```text
DOCS-A — current source documentation is already sufficiently consistent; only formal standard needed

DOCS-B — bounded documentation-only cleanup recommended before release

DOCS-C — substantial documentation debt; prioritize high-value owner/invariant gaps before release and defer the rest

DOCS-D — materially misleading source documentation creates a correctness/maintenance risk requiring immediate correction
```

Use the narrowest justified classification.

---

## 29. Verification

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report is created
the supplied audit brief remains untouched
no source comments/headers were changed
AGENTS.md was not changed
no CODE-STYLE.md was created
no executable code changed
no commit/push/deployment occurred
```

No build/test run is required for report-only work.

---

## Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. DOCS-A/B/C/D disposition;
4. assessment of current `AGENTS.md` guidance;
5. proposed formal-standard location/name;
6. number of substantial owner modules reviewed;
7. DOC-B count;
8. DOC-C count;
9. DOC-D count;
10. DOC-E count;
11. representative good examples;
12. highest-value documentation gaps;
13. stale/misleading findings;
14. proposed `AGENTS.md` revision;
15. recommended `CODE-STYLE.md` structure;
16. one-batch vs multi-batch cleanup recommendation;
17. estimated pre-release scope;
18. confirmation no executable/source documentation changes occurred.

Suggested commit message:

```text
docs: audit source documentation standards
```
