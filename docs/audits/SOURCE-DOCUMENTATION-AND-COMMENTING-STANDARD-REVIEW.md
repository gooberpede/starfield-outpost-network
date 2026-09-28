# Source Documentation and Commenting Standard Review

## 1. Scope and disposition

This audit reviews the tracked TypeScript, TSX, MJS, and project-owned tooling
tree against one principle:

> Comment intent, constraints, ownership, invariants, and non-obvious reasons.
> Do not comment obvious mechanics.

The review is documentation-only. It does not propose code refactoring as a
condition of improving comments, and this audit did not modify source comments,
tests, configuration, `AGENTS.md`, or executable code.

**Disposition: DOCS-B — bounded documentation-only cleanup recommended before
release.**

The gaps are safe to fix before release. They are concentrated enough for one
atomic documentation-only pass, and none is a functional release blocker. The
single contextless historical comment and the highest-value boundary comments
should be included; low-value consistency cleanup should not become an open-ended
release gate.

## 2. Baseline

- Branch: `staging`
- Commit: `746c0d8c0179c185ad60d91456b6a50d7008e915`
- Initial tracked state: clean
- Initial untracked state:
  `docs/implementation-briefs/CODEX_AUDIT_BRIEF_source-documentation-commenting-standard.md`
- Supplied audit brief: read as the task specification, left unmodified, and not
  counted as part of the tracked source inventory

The required owner documentation was read first: `AGENTS.md`,
`docs/ARCHITECTURE.md`, `docs/DOMAIN-RULES.md`, `docs/UX-DESIGN.md`,
`docs/IMPLEMENTATION-WORKFLOW.md`, and `README.md`.

The tracked inventory then covered:

- 261 TypeScript, TSX, MJS, or project-owned JS/config files;
- 135 non-generated files under `src/`;
- 46 non-test scripts;
- 68 test files (including script tests);
- 9 generated TypeScript modules; and
- `vite.config.ts`, `vitest.config.ts`, and `eslint.config.js`.

Generated reference-name modules, locale catalogues, review-draft data, tiny
wrappers, lockfiles, data files, historical briefs/audits, licences, and
third-party material were excluded from owner-header expectations or classified
as intentionally lightweight.

## 3. Current `AGENTS.md` assessment

The existing **Code style and comments** section is directionally strong. It
already establishes the repository's three-heading convention, asks for intent
comments on non-obvious functions, prefers “why” over syntax narration, and
warns against over-commenting. That philosophy should be preserved.

What is too vague for consistent application is:

- which files are substantial enough to need the full header;
- when a compact purpose comment is sufficient;
- how scripts and tests differ from runtime owner modules;
- which invariants deserve local comments even when owner docs explain the full
  rule;
- how to handle stale task/history references; and
- what reviewers should remove as redundant narration.

`AGENTS.md` should remain short. The durable detail belongs in a proposed
`docs/CODE-STYLE.md`, with `AGENTS.md` linking to it.

## 4. Proposed durable philosophy

### 4.1 Owner docs and local comments have different jobs

The relationship should remain:

```text
docs/DOMAIN-RULES.md, docs/ARCHITECTURE.md, docs/UX-DESIGN.md
    full durable system, domain, and interaction explanation

source comments
    local ownership, intent, constraint, invariant, and reason needed to
    modify this code safely
```

Source should not copy long owner-document passages. A local comment may point
to a durable concept, but it must still say enough to explain the nearby choice.

### 4.2 Comment decision rule

Add or retain a comment when it answers a question that names, types, and nearby
code cannot answer reliably:

- Why does this module own the behavior?
- What does it deliberately not own?
- Which source of truth must be used?
- Which invariant would a tempting simplification violate?
- Which side effects are grouped into one user operation?
- Why is a browser/platform workaround necessary?
- What compatibility or migration promise is being protected?

Do not add a comment merely to translate a branch, loop, assignment, or function
name into prose.

## 5. Module classification

### A. Substantial owner module

A module is substantial when it owns a feature, domain rule, state transition,
persistence boundary, validation responsibility, significant UI/layout region,
reference pipeline stage, generation/verification tool, or cross-feature
orchestration. Ownership matters more than line count.

It should normally use the full header:

```ts
/**
 * Purpose:
 *   Why this module exists and what responsibility it owns.
 *
 * Architecture:
 *   Where it sits, what it owns and deliberately does not own, and the
 *   boundaries or invariants a maintainer must preserve.
 *
 * Change this file when:
 *   Which requirement changes belong here rather than in adjacent modules.
 */
```

All three headings are useful by default, but they are not a ritual. A rare
compact equivalent is acceptable when it communicates the same durable
ownership and boundaries more clearly. For example, the prose header in
`src/ui/focusVisibility.ts` is adequate without mechanically adopting the three
labels. A tiny rule or adapter is not made “substantial” by adding headings.

### B. Small supporting module

A narrow formatter, predicate, constant table, mapping helper, or adapter needs
no large header when its name and types are sufficient. A one- or two-line
purpose comment is appropriate when it preserves a non-obvious distinction.

### C. Tests

Tests do not require boilerplate headers. Describe the behavioral contract in
suite and test names. Add comments only for opaque fixtures, historical
regressions whose significance is otherwise lost, surprising setup, magic
values with contractual meaning, or cross-layer invariants that a maintainer
might otherwise remove.

## 6. Function and invariant comment standard

An intent comment is recommended when a function:

- implements a non-obvious domain rule;
- owns or groups a state transition;
- protects a persistence, migration, import, or Undo/Redo boundary;
- deliberately avoids a side effect;
- depends on a subtle source-of-truth distinction;
- implements platform-specific geometry or timing;
- contains compatibility behavior; or
- is likely to be “simplified” incorrectly.

No comment is required when the name, types, and local context already express
the contract. Parameter and return prose should not repeat TypeScript types.

This repository especially benefits from local comments that preserve:

- presentation-only state versus persisted network state;
- one deliberate operation versus one history entry;
- exact organic producer identity;
- planet-level farming eligibility versus natural biome occurrence;
- network-owned cargo links versus pad-owned outbound selections;
- stored IDs versus presentation-time name resolution;
- failure-before-mutation import behavior; and
- viewport-relative, coalesced browser geometry.

## 7. Scripts and tooling standard

Substantial scripts follow the same owner-module rule as runtime code. Their
header should state:

- the artifact or evidence they own;
- authoritative inputs;
- whether they generate, verify, audit, or transform;
- enforced identity, coverage, drift, or safety invariants; and
- what they deliberately do not infer, mutate, or publish.

Thin CLI wrappers need only a compact purpose comment, if any. Being build-time
code is not an exemption from explaining ownership.

## 8. Test standard

The current test suite generally uses precise behavioral names and should not
receive blanket headers. Existing comments such as the exact member-count
calculation in `tests/externalImportCapacity.test.ts:77`, the browser-path
boundary in `tests/networkLifecycle.test.ts:61`, and the typing/announcement
contracts in `tests/componentAccessibility.test.tsx:185` preserve useful reasons.

No material opaque fixture was found that justifies a DOC-C finding. Large
files such as `tests/localizationReview.test.ts` and
`tests/componentAccessibility.test.tsx` remain navigable through descriptive
test names; adding a comment to every fixture or test would reduce signal.

## 9. Stale and misleading comment criteria

A comment is actionable when it describes obsolete behavior or architecture,
promises an invariant the code does not enforce, treats a completed migration
as temporary current behavior, or depends on a transient task identifier or an
unidentified “brief.” These findings take priority over missing polish.

Compatibility words such as “legacy” and “historical” are not stale by
themselves. They remain valuable where code actively supports an older stored
shape. Git owns author/date/change history; source comments describe the current
system and current compatibility contract.

## 10. Anti-patterns and non-goals

The formal standard should explicitly reject:

- comments on every function;
- JSDoc on every export;
- parameter/return prose already expressed by TypeScript;
- narration of branches, loops, assignments, or JSX;
- author/date headers and source-file change logs;
- “added in phase X,” parcel/batch/tranche labels, or brief identifiers;
- large headers on tiny helpers or data-only modules; and
- copying owner documentation into code.

This is not a general TypeScript formatting guide. Existing compiler, lint, and
formatting conventions own those concerns.

## 11. Proposed `docs/CODE-STYLE.md`

The future file should be named `docs/CODE-STYLE.md`. Its documentation-focused
content should be concise enough to read during review:

1. **Purpose** — scope is source documentation, not formatting.
2. **Principle: document intent, not mechanics** — the decision rule and owner
   docs/source comments relationship.
3. **Module classes** — substantial owner, small supporting, tests, and generated
   or data-only modules.
4. **Substantial module headers** — preferred template, concise examples, and
   rare compact-equivalent exception.
5. **Function comments** — triggers and non-triggers.
6. **Invariant and boundary comments** — repository-specific examples.
7. **Scripts and tooling** — input/output/authority/mutation expectations.
8. **Tests** — fixture/regression comments without boilerplate.
9. **Stale comments and history** — current truth locally, change history in Git.
10. **What not to comment** — explicit anti-patterns.
11. **Examples** — paired strong/weak repository examples.
12. **Review checklist** — the short checklist below.

Recommended review checklist:

- Is this file's responsibility clear?
- Are ownership boundaries a maintainer could misunderstand explained?
- Is there an invariant or source-of-truth choice that could be simplified
  incorrectly?
- Do comments explain why instead of narrating what?
- Did this change make an existing comment stale?
- Is history recorded in Git rather than source prose?

## 12. Proposed concise `AGENTS.md` revision

Replace only the current **Code style and comments** section with:

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

## 13. Inventory methodology

The audit used `git ls-files` so untracked task material was not mistaken for
current repository source. For each in-scope file it recorded path, extension,
line count, the presence of the three header headings in the opening region,
and comment density. It then reviewed comments and ownership manually rather
than classifying by those signals alone.

Manual review considered:

- imports/exports and the responsibility actually implemented;
- architecture/domain/UX ownership documents;
- nearby invariant comments and their durability;
- transient planning/history language;
- tests and callers that reveal non-obvious contracts; and
- whether a compact comment already communicates the necessary boundary.

The review identified **98 substantial owner modules**. Of those, 68 already
use the full header convention (excluding two data-only review-draft modules
that happen to carry headers), while several others use adequate compact prose.
Thirty substantial owner modules materially lack owner/boundary context.

## 14. Findings summary

| Class | Count | Meaning in this audit |
| --- | ---: | --- |
| DOC-A | representative, not exhaustively counted | adequate; no change recommended |
| DOC-B | 30 files | substantial owner module missing or materially lacking a header |
| DOC-C | 12 findings | important local intent/invariant/boundary should be documented |
| DOC-D | 1 finding | contextless historical/transient comment should be corrected |
| DOC-E | 9 files | redundant narration can be trimmed without losing intent |
| DOC-F | 105 files | intentionally lightweight/self-explanatory; no added documentation needed |

Classes overlap where appropriate. In particular, a module can need both an
owner header (DOC-B) and one focused invariant comment (DOC-C). DOC-F includes
68 self-describing test files, 9 generated modules, data/catalogue modules,
small helpers, thin wrappers, and compact top-level tooling.

## 15. DOC-B — owner modules needing header work

These are documentation-only findings. A header should remain concise and
should not inventory functions.

### Application and data boundaries

- `src/App.tsx` — cross-feature orchestration, collection/history context,
  persistence coordination, and presentation-only state ownership are not
  summarized at module level.
- `src/data/referenceDataLoader.ts` — owns the startup integrity gate, request
  policy, bounded loading, and failure vocabulary; its one-line comment is too
  narrow.
- `src/data/serialization.ts` — owns import/export parsing and the deliberately
  stricter external-import boundary versus recoverable storage.
- `src/data/storage.ts` — owns browser initialization, recovery fallback,
  persistence status, and no-overwrite-on-failure behavior.
- `src/data/storageCoherence.ts` — owns validation before permissive historical
  migration can normalize or drop ambiguous input.
- `src/data/storageEnvelope.ts` — owns resource bounds for browser storage,
  deliberately separate from external-file import limits.

### Domain

- `src/domain/defaults.ts` — owns persisted initial values and automatic naming,
  not merely object literals.
- `src/domain/models.ts` — defines persisted domain ownership and identities;
  the excellent cargo comments do not replace a concise module boundary.
- `src/domain/outpostEdits.ts` — owns grouped immutable outpost transitions used
  by application history and regression tests.
- `src/domain/resourcePresence.ts` — owns presence mechanisms and capability
  gates distinct from active production and availability.

### Localization runtime/review

- `src/localization/catalog.ts` — owns fallback, parameter, and plural-resolution
  policy.
- `src/localization/locale.ts` — owns browser-locale matching and conservative
  fallback policy.
- `src/localization/preferences.ts` — owns best-effort UI preference persistence,
  separate from the network model and its stronger storage status.
- `src/localization/reviewPackage.ts` — owns a large review/evidence pipeline,
  deterministic rows, validation, handoff, and adjudication contracts.

### UI and presentation policy

- `src/ui/components/ContextHelp.tsx` — owns the singleton popover interaction,
  portal placement, dismissal, and focus return.
- `src/ui/components/NetworkImportButton.tsx` — owns file selection/reading and
  the handoff from validated parsing to application mutation.
- `src/ui/itemSearch.ts` — owns localized catalogue construction, normalization,
  ranking, and deterministic matching.
- `src/ui/keyboardShortcuts.ts` — owns the command registry, matching semantics,
  editable-target policy, and aliases.
- `src/ui/statusTooltips.ts` — owns localized explanations derived from domain and
  reference facts.
- `src/ui/validationPresentation.ts` — owns the domain-issue-to-localized-
  diagnostic boundary and stable-ID fallback behavior.

`src/ui/focusVisibility.ts` is not a DOC-B finding: its compact prose header
already communicates shared ownership, nested scroll behavior, and the
presentation-only geometry boundary.

### Scripts and tooling

- `scripts/build-reference-data.mjs` — strong Purpose/Architecture prose, but no
  `Change this file when` ownership guidance despite being the central reference
  generator.
- `scripts/localization/ba2-localization-reader.mjs` — substantial bounded binary
  reader whose accepted surface and deliberate exclusions deserve a full header.
- `scripts/localization/build-localized-name-provenance.mjs` — central generation,
  verification, drift, and write-gate orchestrator has no owner header.
- `scripts/localization/build-reference-name-overlay.mjs` — one-line generation
  description does not capture authoritative inputs, evidence boundary, or
  verify/write behavior.
- `scripts/localization/fauna-composition-evidence.mjs` — owns project evidence
  validation and serialization but has only a mechanical summary.
- `scripts/localization/localization-inputs.mjs` — owns manifested extraction and
  local-only Bethesda inputs; the safety/authority boundary merits a header.
- `scripts/localization/official-terminology.mjs` — owns evidence/value schemas
  and validation without any module context.
- `scripts/localization/validate-localized-name-provenance.mjs` — repository-only
  committed-artifact verifier lacks a header.
- `scripts/localization/verify-localized-proof-targets.mjs` — pinned proof profile
  and mismatch-acknowledgement semantics lack module context.
- `scripts/localization/verify-reference-name-overlay.mjs` — one-line integrity
  description is insufficient for the multi-artifact, locale, and sidecar gates.

## 16. DOC-C — missing local intent/invariant comments

| Priority | Location | Intent worth preserving locally |
| --- | --- | --- |
| HIGH | `src/data/referenceDataLoader.ts` | Explain why manifest/build identity, size/media type, schema, and hash checks form a fail-closed startup gate, and why retry uses stronger request-cache modes. |
| HIGH | `src/ui/statusTooltips.ts:90` and `:110` | State that farming eligibility is planet-level and must use `planetSpecies`, not natural-biome occurrence records. This is the clearest tempting-wrong-data-source risk. |
| HIGH | `scripts/localization/build-localized-name-provenance.mjs` | Explain that canonical identity drives reads, English only verifies, and committed output changes require explicit reviewed write mode. |
| MEDIUM | `src/domain/defaults.ts:21` | Explain why X-Tech extraction defaults to enabled while skill ranks default to unknown; this is a persisted product-policy choice, not an incidental boolean. |
| MEDIUM | `src/localization/locale.ts` | Explain why some language families map automatically while regional languages require conservative matching instead of broad language-only fallback. |
| MEDIUM | `src/ui/components/ContextHelp.tsx:22` | Explain that the document event enforces one open help popover across portalled component instances without lifting transient state into the application model. |
| MEDIUM | `src/ui/components/NetworkImportButton.tsx:42` | Record that file reading and deserialization complete before `onImport`; errors are reported without granting this component mutation/history ownership. |
| MEDIUM | `src/ui/itemSearch.ts` | Explain why `missing-inputs` is emitted only for a known product with a fully resolved direct recipe, avoiding a false feasibility claim from incomplete reference data. |
| MEDIUM | `src/ui/keyboardShortcuts.ts:12-17` | Explain the difference between key/code matching, optional Shift for `/`, and the two editable-focus policies; these are compatibility/accessibility policy, not arbitrary metadata. |
| MEDIUM | `scripts/localization/official-terminology.mjs` | Explain why evidence rows and locale value rows remain separate, and how explicit absence evidence differs from missing data. |
| MEDIUM | `scripts/localization/verify-localized-proof-targets.mjs` | Explain the pinned game/hash profile and why a hash mismatch may produce observations but cannot silently become accepted proof. |
| LOW | `src/ui/validationPresentation.ts` | Explain that presentation resolves stable IDs when possible but must preserve raw-ID fallbacks so stale reference data never hides a diagnostic. |

No finding requires executable-code modification.

## 17. DOC-D — stale, misleading, or transient comments

One finding was identified:

- **MEDIUM — `src/dev/historyBenchmark.ts:132`:** “Mirrors the substantial
  9/19/8 and 14/44/21 network shapes in the brief.” The unnamed brief is not a
  durable referent and leaves future maintainers unable to recover what the
  numbers represent. Replace it with the current benchmark purpose (for example,
  that the fixtures cover the repository's substantial baseline and stress
  network shapes), or point to a durable benchmark document if exact provenance
  matters.

No comment was found that materially contradicts current domain or architecture
documentation. Active legacy/schema compatibility comments describe behavior
the code still performs and should remain.

## 18. DOC-E — redundant narration

Cleanup should be conservative. Nine files contain clear candidates where a
function comment restates a name or duplicates an already strong module header:

- `src/App.tsx` — comments such as “Moves the editing session backward…” above
  `undo` and the matching `redo` comment add no intent; retain nearby comments
  that explain presentation repair, grouped history, and collateral effects.
- `src/domain/validation/rules/cargoPadSkillLimit.ts`
- `src/domain/validation/rules/invalidCharacterLevel.ts`
- `src/domain/validation/rules/invalidSkillLevel.ts`
- `src/domain/validation/rules/outpostSkillLimit.ts`
- `src/domain/validation/rules/regularCargoPadCrossSystem.ts`
- `src/domain/validation/rules/selfLinkedCargoPad.ts`
- `src/domain/validation/rules/unknownReferenceDataId.ts`
- `src/domain/validation/rules/unresolvedCargoExport.ts`

For the validation files, preserve header text that explains severity,
non-mutation, null handling, and division of responsibility with other rules.
Remove only JSDoc such as “Reports one issue…” where the function name and the
header already say the same thing.

## 19. Representative strong examples

- `src/domain/availability.ts:1-13` explains that availability is derived, names
  its sources, distinguishes Planned Supply from actual supply, and says where
  cargo relationships are interpreted. It documents ownership rather than an
  export list.
- `src/domain/bodyResourceAvailability.ts:107` says validation must preserve the
  exact persisted organic producer rather than substitute at resource level.
  That guards a tempting but incorrect simplification.
- `src/domain/models.ts:76-83` explains that cargo links are network-owned,
  endpoints are symmetric, and link uniqueness is enforced by application logic
  rather than the type. This is excellent local boundary documentation even
  though the file still needs a module header.
- `src/ui/components/CargoPadsEditor.tsx:771-773` explains why persisted link
  state wins during Undo while an unlinked destination remains a presentation
  draft for Redo.
- `src/ui/focusVisibility.ts:113-115` explains the `requestAnimationFrame` timing
  as protection against focus-driven layout/effects and repeated-shortcut repair.
- `scripts/item-reference-data.mjs:1-8` distinguishes canonical identity and
  recipe facts from tracker policy and deliberately omitted runtime provenance.
- `tests/externalImportCapacity.test.ts:77` documents the arithmetic behind a
  boundary fixture rather than narrating the assertion.

These comments are concise, local, and durable; they answer why a future edit
must preserve the current shape.

## 20. Representative weak examples

- `src/dev/historyBenchmark.ts:132` depends on “the brief,” a transient and
  unidentified history reference (DOC-D).
- `src/App.tsx:1522-1538` describes `undo` and `redo` in words without explaining
  the non-obvious presentation repair performed by those functions (DOC-E).
- `src/domain/validation/rules/regularCargoPadCrossSystem.ts:28-32` repeats the
  function and strong module header rather than adding a boundary (DOC-E).
- `src/data/referenceDataLoader.ts:1` says only “validates deployment bytes,”
  omitting its fail-closed startup ownership and request/integrity policy
  (DOC-B/DOC-C).
- `scripts/localization/build-localized-name-provenance.mjs:1-29` begins directly
  with imports despite owning the largest provenance orchestration boundary
  (DOC-B/DOC-C).

## 21. Findings by repository area

| Area | Owner modules reviewed | DOC-B | DOC-C | DOC-D | DOC-E | Assessment |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `src/domain` | 32 | 4 | 1 | 0 | 8 | Core rule modules are generally the strongest documented area; trim duplicate validator narration. |
| `src/data` | 9 | 5 | 1 | 0 | 0 | Collection/migration modules are strong; storage, import, and startup-integrity boundaries need consistent owner context. |
| `src/ui` plus `src/App.tsx` | 26 | 7 | 6 | 0 | 1 | Feature components/layout are well documented; policy helpers and application orchestration lag behind. |
| `src/localization` | 4 | 4 | 1 | 0 | 0 | Runtime/review policy owners need headers; locale catalogues and generated overlays correctly remain lightweight/data-oriented. |
| `scripts` | 27 | 10 | 3 | 0 | 0 | Newer provenance modules show strong headers, but several central entry points and verifiers do not. |
| `tests` | test class, not owner count | 0 | 0 | 0 | 0 | Test names carry contracts; targeted fixture comments are already used well. |
| Top-level tooling | lightweight | 0 | 0 | 0 | 0 | Configuration is concise and self-explanatory. |
| `src/dev` | included with app above | 0 | 0 | 1 | 0 | One transient brief reference should be made durable. |
| **Total** | **98** | **30** | **12** | **1** | **9** | Bounded documentation-only pass. |

## 22. Severity and implementation priority

There are no documentation findings severe enough for DOCS-D disposition.

Recommended order:

1. **HIGH:** the three source-of-truth/safety comments in the startup loader,
   planet-level organic presentation, and provenance generator.
2. **MEDIUM:** owner headers for application, storage/import, localization review,
   UI policy, and substantial script entry points; the one transient benchmark
   comment; the remaining boundary comments.
3. **LOW:** removal of redundant function narration and the validation
   presentation fallback comment.

Missing boilerplate alone is never HIGH. The HIGH items are high because an
otherwise plausible edit could select the wrong source, weaken a fail-closed
boundary, or accept unreviewed provenance output.

## 23. Implementation scope estimate

The future pass is approximately:

- 30 concise owner-header additions or completions;
- 12 focused invariant/boundary comments;
- 1 stale/contextless comment correction; and
- up to 9 files with small redundant-comment removals.

Likely touch distribution:

- `src/domain`: 4 header additions, 1 invariant note, selective cleanup in 8
  validators;
- `src/data`: 5 headers and 1 focused integrity-boundary note;
- `src/ui`/`src/App.tsx`: 7 headers, 6 focused comments, and one small narration
  cleanup;
- `src/localization`: 4 headers and 1 locale-policy comment;
- `scripts`: 10 headers and 3 focused comments;
- `tests`: no blanket changes; and
- top-level tooling: no changes.

This is best completed as **one atomic documentation-only pass**. The affected
files are numerous but the changes are small, behavior-neutral, and governed by
one standard. Splitting by temporary phases would add coordination/history
language without reducing implementation risk. If release time is constrained,
complete HIGH and MEDIUM items plus `docs/CODE-STYLE.md`/`AGENTS.md`, and defer
DOC-E polishing rather than fragmenting the standard itself.

## 24. Future verification plan

The documentation implementation should:

1. create `docs/CODE-STYLE.md` with the concise standard above;
2. replace only the `AGENTS.md` **Code style and comments** section;
3. add/complete the 30 owner headers without listing functions;
4. add only the 12 justified local comments;
5. correct the DOC-D comment and conservatively remove DOC-E narration;
6. search source comments for transient phase/parcel/batch/brief identifiers;
7. review the final diff to confirm no tokens outside comments/documentation
   changed;
8. run `git diff --check`; and
9. run the normal test/build checks only if the final diff accidentally touches
   executable text or if repository policy at implementation time requires them.

For a truly comments/documentation-only diff, build and test execution provides
little additional behavioral evidence; diff inspection is the primary gate.

## 25. Audit verification

- `git diff --check` passed with no output.
- A no-index whitespace check of this new report passed.
- Final status contains only this new report and the pre-existing untracked
  supplied audit brief.
- The supplied audit brief remains untouched.
- No source file or source comment/header changed.
- `AGENTS.md` was not changed.
- `docs/CODE-STYLE.md` was not created.
- No executable code, tests, configuration, dependency, or version changed.
- No commit, push, deployment, build, or test run occurred. The brief explicitly
  does not require build/tests for report-only work.

## 26. Release-readiness conclusion

Current documentation is good in the high-risk domain, validation, cargo, and
layout areas, with several repository-quality examples worth standardizing.
The inconsistency is real but bounded: most gaps are module ownership context,
not absent domain truth, and only one source comment is contextless historical
wording. A single pre-release documentation pass is appropriate and safe. Low-
value narration cleanup may be deferred if necessary and should not block the
release.

**Final disposition: DOCS-B — bounded documentation-only cleanup recommended
before release.**
