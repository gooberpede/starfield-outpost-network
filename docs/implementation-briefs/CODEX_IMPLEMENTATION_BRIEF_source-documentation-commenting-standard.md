# CODEX IMPLEMENTATION BRIEF — Source Documentation and Commenting Standard

## Objective

Implement the documentation-only cleanup recommended by:

```text
docs/audits/SOURCE-DOCUMENTATION-AND-COMMENTING-STANDARD-REVIEW.md
```

The goal is to formalize and consistently apply the repository's existing source-commenting philosophy:

> **Document intent, ownership, constraints, invariants, and non-obvious reasons. Do not narrate straightforward mechanics.**

This implementation should:

- create a concise durable source-documentation standard;
- keep `AGENTS.md` lightweight and point it to that standard;
- add/complete owner-module headers where justified;
- add focused invariant/boundary comments where they materially reduce maintenance risk;
- correct the one stale/contextless source comment identified by the audit;
- conservatively remove redundant narration where it adds no intent;
- extend the same standard to substantial project-owned CSS modules;
- make **no executable behavior changes**.

This is a **documentation-only implementation**.

---

## 1. Authority

Treat the following as authoritative for this task:

```text
AGENTS.md
docs/audits/SOURCE-DOCUMENTATION-AND-COMMENTING-STANDARD-REVIEW.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/IMPLEMENTATION-WORKFLOW.md
README.md
```

The audit disposition is:

```text
DOCS-B — bounded documentation-only cleanup recommended before release
```

Do not broaden into a general code-style, formatting, refactoring, or linting initiative.

---

## 2. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Do not modify the supplied implementation brief.

No commit, push, deployment, tag, release, branch creation, repository-publication, or remote-state operation is authorized.

---

## 3. Central standard

Use this rule throughout:

```text
Comments should preserve intent, ownership, constraints, invariants,
source-of-truth distinctions, and non-obvious reasons.

Comments should not merely restate obvious mechanics.
```

A competent programmer should be able to see what the code does.

The documentation should preserve what is not obvious from the code alone:

```text
why this module owns the responsibility
what it deliberately does not own
which invariant must survive refactoring
which source of truth must be used
why a seemingly simpler alternative would be wrong
why side effects are grouped
why a browser/platform workaround exists
what compatibility or migration boundary is protected
```

---

## 4. Create `docs/CODE-STYLE.md`

Create:

```text
docs/CODE-STYLE.md
```

Keep it concise and documentation-focused.

It is **not** a general TypeScript/React formatting guide.

Recommended structure:

1. Purpose
2. Principle: document intent, not mechanics
3. Owner docs vs local source comments
4. Module classes
5. Substantial owner-module headers
6. Small supporting modules
7. Function comments
8. Invariant and boundary comments
9. Scripts and tooling
10. Tests
11. CSS modules
12. Stale comments and history
13. What not to comment
14. Strong/weak examples
15. Review checklist

The document should be readable during normal code review, not encyclopedic.

---

## 5. Owner docs vs local comments

Make the distinction explicit:

```text
docs/DOMAIN-RULES.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
    → full durable system/domain/UX explanation

source comments
    → local ownership, intent, invariant, reason, or boundary
      needed to safely modify nearby code
```

Do not copy long owner-document passages into source files.

Local comments may refer to a durable concept/document where useful, but should remain understandable in place.

---

## 6. Module classes

Formalize these classes.

### A. Substantial owner module

A module is substantial if it owns one or more of:

```text
feature behavior
domain rule
state transition
persistence/storage boundary
validation responsibility
significant UI region
layout responsibility
reference-data pipeline stage
generation/verification tooling
cross-feature orchestration
```

Ownership matters more than line count.

These modules should normally carry a concise explanatory header.

### B. Small supporting module

Examples:

```text
small formatter
narrow pure predicate
small constant table
simple mapping helper
tiny adapter
```

No large header is required when filename, types, and implementation already make purpose obvious.

A one- or two-line purpose comment is acceptable where it preserves a useful distinction.

### C. Tests

Do not add boilerplate file headers to tests by default.

Test names/groups should express behavior.

Comments are appropriate only where they preserve:

```text
non-obvious fixture intent
historical regression significance
magic contractual values
surprising setup
cross-layer invariants
```

### D. Substantial CSS module

Apply the same owner-module principle to project-owned CSS.

A stylesheet is substantial when it owns meaningful:

```text
layout responsibility
sticky/fixed geometry
responsive behavior
feature presentation state
browser-specific behavior
shared interaction geometry
```

Such files may use the same:

```text
Purpose
Architecture
Change this file when
```

header convention.

Do not add boilerplate to trivial stylesheets or simple component-local style files whose ownership is already obvious.

---

## 7. Header standard

For substantial owner modules, prefer:

```ts
/**
 * Purpose:
 *   Why this module exists and what responsibility it owns.
 *
 * Architecture:
 *   Where it sits, what it owns and deliberately does not own, and the
 *   boundaries/invariants a maintainer must preserve.
 *
 * Change this file when:
 *   Which requirement changes belong here rather than in adjacent modules.
 */
```

Headers should be concise.

Do not list every exported function.

Do not narrate imports.

A compact equivalent is acceptable where it communicates the same ownership more clearly.

Preserve good existing prose headers such as `src/ui/focusVisibility.ts` if they already meet the intent.

---

## 8. Function-comment standard

Add or retain an intent comment when a function:

```text
implements a non-obvious domain rule
owns/groups a state transition
protects persistence/import/migration/Undo-Redo semantics
deliberately avoids side effects
depends on a subtle source-of-truth distinction
implements browser/platform geometry or timing
contains compatibility behavior
is likely to be "simplified" incorrectly
```

Do not add comments where:

```text
name + types + local context already explain the contract
the comment would only restate a branch/loop/assignment
parameter/return prose would duplicate TypeScript types
```

---

## 9. Invariant/boundary comments

Prioritize comments that prevent plausible future regressions.

Repository-relevant examples include:

```text
presentation-only state must not be persisted
one user operation should map to one Undo entry
exact organic producer identity must be preserved
natural biome occurrence is not organic farming eligibility
cargo links are network-owned while outbound selections are pad-owned
reference IDs are stored while names are resolved at presentation time
failed import must not mutate collection/history
Cargo viewport geometry is measured/coalesced for a specific browser-layout reason
```

Use only where the local code actually needs the reminder.

Do not duplicate durable domain docs line-for-line.

---

## 10. Scripts and tooling

Apply the owner-module standard to substantial files under:

```text
scripts/
```

A substantial script header should usually communicate:

```text
what artifact/evidence it owns
authoritative inputs
whether it generates/verifies/transforms/audits
key identity/coverage/drift/safety invariants
what it deliberately does not infer, mutate, or publish
```

Thin CLI wrappers may remain compact.

Being non-runtime code is not an exemption from ownership documentation.

---

## 11. CSS documentation extension

Perform a bounded review of project-owned CSS using the same ownership criteria.

Do **not** turn this into a CSS-commenting sweep.

Preserve strong existing headers where present, including files such as:

```text
WorkspaceLayout.css
CargoPadsEditor.css
StatusBar.css
PageHeader.css
```

Only add/complete CSS documentation where a substantial stylesheet materially lacks:

```text
what layout/presentation responsibility it owns
which geometry/breakpoint/browser constraint is intentional
which adjacent component/layout layer owns other concerns
```

Do not comment individual straightforward CSS declarations.

Do not describe obvious properties such as:

```text
display: flex
padding: ...
border: ...
```

unless the property participates in a non-obvious invariant/workaround.

---

## 12. Tests

Do not add blanket test headers.

Retain strong behavioral names.

Add comments only for high-value fixture/regression intent.

The audit found no broad test-commenting debt; respect that.

---

## 13. Stale/history comments

Correct comments that depend on transient or unidentified historical context.

Specifically fix:

```text
src/dev/historyBenchmark.ts
```

where the comment refers to:

```text
"the brief"
```

Replace it with a durable explanation of what the fixture shapes represent, or point to a durable benchmark document if that provenance genuinely matters.

Do not introduce new references to temporary:

```text
Phase
Parcel
Batch
Tranche
C-number task IDs
implementation briefs
```

unless the comment belongs to the historical owner document itself.

Git owns change history.

Source comments should describe the current system and current compatibility promises.

---

## 14. DOC-B owner-header implementation

Implement the 30 DOC-B findings from the audit.

At minimum include the listed files in:

### Application/data

```text
src/App.tsx
src/data/referenceDataLoader.ts
src/data/serialization.ts
src/data/storage.ts
src/data/storageCoherence.ts
src/data/storageEnvelope.ts
```

### Domain

```text
src/domain/defaults.ts
src/domain/models.ts
src/domain/outpostEdits.ts
src/domain/resourcePresence.ts
```

### Localization runtime/review

```text
src/localization/catalog.ts
src/localization/locale.ts
src/localization/preferences.ts
src/localization/reviewPackage.ts
```

### UI/presentation

```text
src/ui/components/ContextHelp.tsx
src/ui/components/NetworkImportButton.tsx
src/ui/itemSearch.ts
src/ui/keyboardShortcuts.ts
src/ui/statusTooltips.ts
src/ui/validationPresentation.ts
```

### Scripts/tooling

```text
scripts/build-reference-data.mjs
scripts/localization/ba2-localization-reader.mjs
scripts/localization/build-localized-name-provenance.mjs
scripts/localization/build-reference-name-overlay.mjs
scripts/localization/fauna-composition-evidence.mjs
scripts/localization/localization-inputs.mjs
scripts/localization/official-terminology.mjs
scripts/localization/validate-localized-name-provenance.mjs
scripts/localization/verify-localized-proof-targets.mjs
scripts/localization/verify-reference-name-overlay.mjs
```

Use the audit report for the precise ownership context.

Do not invent responsibilities beyond what the code/docs support.

---

## 15. DOC-C invariant/boundary implementation

Implement the 12 DOC-C findings from the audit.

Prioritize exactly the intent identified there.

### HIGH

- `src/data/referenceDataLoader.ts`
  - explain why manifest/build identity, size/media type, schema, and hash checks form a fail-closed startup gate;
  - explain why retry uses stronger request-cache modes.

- `src/ui/statusTooltips.ts`
  - explain that organic farming eligibility is planet-level and must use `planetSpecies`, not natural-biome `organicOccurrences`.

- `scripts/localization/build-localized-name-provenance.mjs`
  - explain canonical identity vs English verification;
  - explain reviewed write-mode boundary for committed output changes.

### MEDIUM / LOW

Implement the remaining audit findings for:

```text
src/domain/defaults.ts
src/localization/locale.ts
src/ui/components/ContextHelp.tsx
src/ui/components/NetworkImportButton.tsx
src/ui/itemSearch.ts
src/ui/keyboardShortcuts.ts
scripts/localization/official-terminology.mjs
scripts/localization/verify-localized-proof-targets.mjs
src/ui/validationPresentation.ts
```

Keep each comment concise and local.

---

## 16. DOC-D correction

Correct the single stale/contextless comment in:

```text
src/dev/historyBenchmark.ts
```

Remove dependency on an unidentified brief.

Use current durable benchmark intent.

Do not change fixture data or executable logic.

---

## 17. DOC-E cleanup

The audit identified up to 9 files with redundant narration.

Remove only comments/JSDoc that clearly duplicate:

```text
function name
strong module header
obvious control flow
```

Examples include simple comments above:

```text
undo
redo
validation rule functions that merely "report one issue"
```

Preserve nearby comments that explain:

```text
history grouping
presentation repair
severity
non-mutation
null semantics
division of responsibility
```

If uncertain whether a comment carries intent, keep it.

DOC-E cleanup is lower priority than DOC-B/C/D.

Do not create churn for cosmetic consistency.

---

## 18. Update `AGENTS.md`

Replace only:

```text
## Code style and comments
```

with a concise version aligned to the audit.

Use the audit's proposed text as the starting point:

```markdown
## Code style and comments

Follow the source-documentation standard in `docs/CODE-STYLE.md`.

Comment intent, ownership, constraints, invariants, and non-obvious reasons;
do not narrate straightforward implementation. Substantial owner modules should
normally use the repository's concise `Purpose` / `Architecture` / `Change this
file when` header. Small helpers and tests do not require boilerplate headers.

Add function or boundary comments where a maintainer could otherwise simplify
code incorrectly, especially around domain rules, persistence, Undo/Redo,
reference-data identity, migrations, and browser workarounds. Keep current
system truth in comments and change history in Git. Remove stale comments when
behavior changes, and avoid JSDoc or parameter prose that merely repeats names
and TypeScript types.
```

You may adjust wording minimally for clarity/consistency with the final `CODE-STYLE.md`.

Do not rewrite unrelated `AGENTS.md` sections.

---

## 19. Add review checklist

Include in `docs/CODE-STYLE.md` a short checklist such as:

```text
Is this file's responsibility clear?
Are ownership boundaries a maintainer could misunderstand explained?
Is there an invariant/source-of-truth choice that could be simplified incorrectly?
Do comments explain why instead of narrating what?
Did this change make an existing comment stale?
Is history recorded in Git rather than source prose?
```

Add a CSS-specific prompt only if concise, e.g.:

```text
Does a substantial stylesheet explain non-obvious layout/browser constraints?
```

---

## 20. No executable-code changes

This is mandatory.

Do not change:

```text
identifiers
expressions
control flow
types
imports/exports except if comment placement requires no semantic change
function signatures
CSS declarations
selectors
test assertions
fixtures
package files
config behavior
```

Only change:

```text
comments
file/module headers
AGENTS.md
docs/CODE-STYLE.md
```

If a documentation improvement appears to require executable-code refactoring, do not perform it.

Report it separately.

---

## 21. Diff discipline

Because many source files may be touched, review the final diff carefully.

Confirm:

```text
all source-file changes are comment-only
all CSS-file changes are comment-only
no executable tokens changed
no string literals used by runtime/tests changed
no imports/exports moved or altered semantically
```

Use a token-aware or whitespace/comment-aware review where practical.

Do not rely solely on tests to prove a documentation-only diff.

---

## 22. Verification

Run:

```sh
git diff --check
npm run build
```

Also run a scoped/normal lint if practical:

```sh
npm run lint
```

If normal lint remains blocked solely by the known ignored:

```text
.local-work/reference-overlay-prototype
```

multiple-TSConfig-root issue, use the established clean-checkout-shaped lint verification and report that limitation.

Full behavioral tests are optional for a strictly comment/docs-only diff, but may be run if convenient.

If any executable text changes accidentally occur, run the normal relevant test suites before handoff.

---

## 23. Comment-content search

Before completion, search current source comments for likely transient-history leakage such as:

```text
the brief
Parcel
Batch
Phase
Tranche
C1-C9 task identifiers
```

Classify matches contextually.

Do not remove legitimate durable concepts or test data merely to produce zero grep matches.

The goal is:

```text
no unexplained temporary planning identifier in current source comments
```

Historical docs are outside this cleanup.

---

## 24. CSS bounded review

In addition to the audit's TS/TSX/MJS inventory, review project-owned CSS files for substantial owner modules.

Report:

```text
number of substantial CSS modules reviewed
which already had adequate owner headers
which received new/completed headers
```

Do not create a requirement that every stylesheet needs a header.

If no additional CSS gap is found, report that clearly.

---

## 25. Success criteria

The documentation cleanup is complete when:

- `docs/CODE-STYLE.md` exists and is concise;
- `AGENTS.md` links to it and retains only concise repository-wide guidance;
- the 30 DOC-B owner modules have adequate ownership headers;
- the 12 DOC-C intent/invariant gaps are documented;
- the one DOC-D stale comment is corrected;
- DOC-E narration is conservatively reduced where clearly redundant;
- substantial CSS modules have been reviewed under the same standard;
- no executable code or CSS behavior changed;
- no temporary planning IDs leak into current source comments without durable meaning;
- `npm run build` passes;
- lint verification is reported;
- `git diff --check` passes.

---

## 26. Non-goals

Do not:

```text
refactor code
rename symbols
reformat whole files
standardize quote style
change TypeScript style
add JSDoc everywhere
comment every function
add test headers
rewrite historical audits/briefs
change runtime strings
change localization
change dependencies
change version
change schemas
change deployment
commit
push
deploy
```

---

## 27. Completion report

Report:

1. baseline branch/commit;
2. `docs/CODE-STYLE.md` path and section outline;
3. exact `AGENTS.md` section changed;
4. files receiving owner headers;
5. files receiving focused invariant/boundary comments;
6. DOC-D correction;
7. DOC-E removals;
8. CSS modules reviewed and any CSS header changes;
9. representative strong comments added;
10. confirmation all source/CSS changes are comment-only;
11. transient-history comment search results;
12. `npm run build` result;
13. lint result / known environment limitation;
14. `git diff --check` result;
15. whether any finding could not be fixed documentation-only;
16. confirmation no executable behavior, dependency, version, commit, push, or deployment changed.

Suggested commit message:

```text
docs: formalize source commenting standard
```
