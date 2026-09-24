# Starfield Outpost Network — Implementation Workflow

## Purpose

This document defines the normal implementation workflow for feature batches and maintenance changes.

It complements `AGENTS.md`.

The goals are:

- preserve deliberate design decisions;
- keep implementation scope narrow;
- make Codex changes easy to review;
- avoid accidental commits or unrelated refactors;
- ensure each completed batch is tested before commit.

---

## Roles

### ChatGPT design/review role

Use ChatGPT primarily for:

- product and UX discussion;
- domain-rule clarification;
- architecture decisions;
- implementation-brief preparation;
- diff review;
- manual test design;
- commit-message suggestions.

ChatGPT does not assume that a design discussion is permission to modify the repository.

### Codex implementation role

Use Codex primarily for:

- inspecting the current repository;
- implementing one coherent brief;
- making the smallest reasonable code changes;
- running build/lint/checks;
- reporting changed files and verification results.

Unless explicitly requested otherwise, Codex must not commit or push.

### User role

The user remains the final integration point:

- starts the Codex implementation session;
- runs/observes manual tests;
- stages changes;
- provides review diffs;
- decides whether to commit;
- commits and syncs.

---

## Normal feature-batch workflow

### 1. Discuss the design first

Before implementation:

- define the user-visible goal;
- clarify domain semantics;
- identify presentation-only versus persisted state;
- settle important interaction rules;
- identify non-goals;
- avoid asking Codex to invent unresolved product behaviour.

If the design is still materially ambiguous, continue the design discussion before implementation.

### 2. Audit architecture for cross-cutting work when needed

For changes that cross major state ownership, persistence, history, migration,
import/export, or several feature boundaries, perform an architecture audit
before implementation. The audit should map current collision points, identify
the affected architectural boundaries, and recommend a target structure
without making implementation changes.

Small and local changes do not require an architecture audit.

### 3. Produce an implementation brief

ChatGPT prepares a focused implementation brief, normally as a downloadable Markdown file.

A good brief should contain:

- Objective
- Current behaviour
- Required behaviour
- Presentation-state/domain rules
- Non-goals
- Architecture constraints
- Acceptance criteria
- Implementation guidance
- explicit instruction not to commit or push

The brief is authoritative for that implementation batch.

Implementation briefs must be self-contained across Codex chats. A fresh chat
should not be expected to recover artifacts or reasoning from an earlier chat.
If a prior audit or specification is required, attach or provide it with the
current task; otherwise restate every implementation-relevant conclusion in
the brief. Mark unavailable prior artifacts as optional when they are only
background.

### 4. Start a fresh Codex chat for a coherent batch

Prefer a new Codex conversation for each distinct feature batch.

Reuse the same Codex chat when:

- correcting the implementation it just produced;
- making a small follow-up required to complete the same batch;
- clarifying an acceptance criterion from the same brief.

A fresh chat improves navigability and reduces accidental scope carry-over.

### 5. Codex inspects before editing

Codex should inspect:

- `AGENTS.md`;
- relevant files under `docs/`;
- the components/domain modules directly involved;
- the existing implementation paths it intends to extend.

Codex should not assume that a named file exists merely because it would be useful.

If repository documentation conflicts materially with the implementation brief, Codex should report the conflict instead of silently choosing one.

### 6. Implement narrowly

Codex should:

- change only what is required for the batch;
- preserve stable IDs and existing domain semantics;
- keep presentation state out of persisted models unless explicitly directed otherwise;
- reuse existing editing/history/reorder pathways where practical;
- avoid unrelated cleanup;
- avoid opportunistic architectural refactors;
- avoid new dependencies unless justified by the brief.

Existing comments should remain useful and new non-obvious logic should follow the repository’s comment conventions.

### 7. Run automated verification

For a typical batch:

- run `npm test`;
- run `npm run build`;
- run `npm run lint` or relevant targeted lint/checks;
- run `git diff --check`;
- run focused browser checks where practical.

Run the relevant checks the repository actually supports and report anything
not run. Manual/browser checks remain important for interaction-heavy
behaviour.

If full `npm run lint` fails only because of known pre-existing unrelated errors:

- report them;
- do not broaden scope merely to make the entire repository lint-clean.

### 8. Codex reports results

The completion report should identify:

- files changed;
- important implementation decisions;
- build/lint/check results;
- anything that could not be reliably automated;
- manual checks still required;
- confirmation that no commit/push was performed.

---

## Manual testing

Manual testing should focus on:

- acceptance criteria from the brief;
- interaction edge cases;
- persistence and reload behaviour;
- Undo/Redo;
- import/export where relevant;
- long/empty/boundary inputs;
- visual stability;
- accessibility/focus/tooltip behaviour where relevant.

For interaction-heavy features, browser automation is not a substitute for manual testing if the interaction cannot be synthesized reliably.

If manual testing exposes an issue:

- keep the batch open;
- return to the same Codex chat for a focused correction;
- avoid expanding into unrelated improvements.

---

## Review-diff workflow

### Why plain `git diff` is not always enough

`git diff` does not include brand-new untracked files.

That can produce an incomplete review artifact.

### Preferred complete review workflow

After Codex finishes and before commit:

```powershell
git add -A
git diff --cached | Out-File -Encoding utf8 "$env:USERPROFILE\Desktop\codex-review.diff"
```

This includes:

- modified tracked files;
- deleted files;
- new files.

Upload the generated diff for review.

### Scope caution

`git add -A` stages every current repository change.

If unrelated local edits are present, either:

- stage only the files belonging to the feature batch; or
- accept that the review diff will contain unrelated changes and call them out explicitly.

Staging is not committing.

If needed, unstage without discarding working-tree edits:

```powershell
git restore --staged .
```

### Alternative when using VS Code

VS Code Source Control may be used to stage only the intended feature files before generating the cached diff.

The important requirement is that the review artifact includes every file intended for the commit, including new files.

---

## Diff review

ChatGPT reviews the diff for:

- adherence to the brief;
- architecture/domain-rule consistency;
- persistence/history mistakes;
- duplicated state or logic;
- index/boundary errors;
- interaction ambiguity;
- unintended changes;
- missing new files;
- likely regression risks.

If the diff is incomplete, do not assume omitted files are correct.

---

## Commit decision

Commit only after:

- automated checks are satisfactory;
- required manual tests pass;
- diff review is satisfactory;
- any necessary follow-up correction is complete.

Use Conventional Commit style.

Common examples:

```text
feat: add navigation reshuffle mode
feat: add drag-and-drop outpost reordering
fix: correct cargo link validation
docs: clarify same-outpost cargo routing
docs: add project workflow and backlog
```

The exact message should describe the primary purpose of the batch rather than enumerate every changed file.

---

## Commit and sync

The user normally performs the commit and sync through VS Code.

Codex and ChatGPT should not assume permission to commit, push, or otherwise modify repository history.

After commit/sync, the batch is considered complete.

---

## Documentation updates

Update persistent repository documentation when a completed batch changes:

- architecture;
- domain semantics;
- durable workflow;
- deferred-work status;
- stable UX/product direction that future implementers need to know.

Do not copy transient implementation-brief details into permanent docs unless they remain useful beyond the batch.

Use:

- `AGENTS.md` for agent operating rules;
- `docs/ARCHITECTURE.md` for current technical structure;
- `docs/DOMAIN-RULES.md` for semantic/domain contracts;
- `docs/BACKLOG.md` for deferred work and unresolved decisions;
- `docs/IMPLEMENTATION-WORKFLOW.md` for the development handoff/review process;
- `docs/UX-DESIGN.md` for settled presentation and interaction conventions;

At the end of a substantial sprint or architectural parcel, review durable
documentation and backlog state before grooming the next sprint. This is a
periodic maintenance step, not a requirement after every small patch.

---

## Implementation briefs are temporary by default

Implementation briefs are normally working artifacts, not canonical repository documentation.

Do not save every brief under `docs/` by default.

If recurring value emerges later, a dedicated implementation-history/reference area can be introduced deliberately.

---

## Scope discipline

A useful rule for every batch:

> Finish the requested change completely, but do not finish adjacent deferred work merely because the code is nearby.

When a new idea emerges during implementation:

- record it in the backlog if useful;
- do not silently include it in the current batch.

## Release preparation versus launch

Keep preparation, manual acceptance, publication sign-off and launch operations
distinct. Maintain package/lockfile version agreement and test modified/unknown
identity as well as clean builds. Run the component, test-type, localization,
build and lint checks and verify emitted legal outputs with
`node --experimental-strip-types scripts/verify-release-dist.ts`.
Use a disposable checkout-shaped copy for npm ci/build without game inputs.
Read README and Deployment for candidate/version/source conventions. A passing
local build neither publishes source nor accepts a release candidate. Useful
historical briefs, audits and benchmarks remain at their paths; packaging or
history changes require separate authorization.

Application versions are deliberate checkpoints, not per-commit identifiers.
Use the maintainer commands documented in README to synchronize package and
lockfile metadata; the Git commit remains the exact build identity. Review and
test the resulting diff, then commit and sync manually. The version commands do
not create commits or tags, push, publish, deploy, or accept a release candidate.
