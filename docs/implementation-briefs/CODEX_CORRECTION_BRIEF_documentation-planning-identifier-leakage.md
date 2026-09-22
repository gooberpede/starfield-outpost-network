# CODEX CORRECTION BRIEF — Remove Planning-Identifier Leakage and Record Durable Documentation Rule

## Objective

Correct the Simplified Chinese manual-closure documentation diff before commit by removing transient onboarding-plan identifiers from durable documents that do not own that numbering scheme.

Also add a small repository-wide documentation rule to `AGENTS.md` so future Codex work does not leak temporary discussion/implementation sequencing labels such as **Step 7**, **Step 8**, **Parcel 3**, **Parcel 7**, **Batch 2**, or similar identifiers into unrelated durable documentation.

This is a narrow documentation-only correction.

---

## Background

The current Simplified Chinese onboarding plan intentionally uses numbered steps as an internal planning structure.

That numbering is valid **inside the onboarding plan itself**.

However, the current uncommitted documentation diff propagated those identifiers into other durable documents, including:

- `docs/audits/SIMPLIFIED-CHINESE-LOCALE-QA.md`
- `docs/BACKLOG.md`

This is not desired.

Durable documents should describe the underlying state or work directly, for example:

- `Layout/accessibility/release closure is complete.`
- `Post-localization cleanup is next.`
- `Bundle/startup review remains deferred post-localization work.`

They should not depend on another document's transient sequence labels such as `Step 7` or `Step 8`.

The numbered sequence may remain in:

`docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md`

because that document defines and owns the sequence.

---

# 1. Correct leaked identifiers

Inspect the current uncommitted diff and remove planning identifiers that escaped the onboarding plan.

At minimum correct the known instances below.

## `docs/audits/SIMPLIFIED-CHINESE-LOCALE-QA.md`

The current conclusion includes wording equivalent to:

> Step 7 is complete, and Step 8 — Post-localization cleanup — is next.

Replace this with durable descriptive wording that does not depend on the onboarding-plan numbering.

Preferred meaning:

> Layout/accessibility/release closure is complete. Post-localization cleanup is the next localization programme phase.

Equivalent wording is acceptable if it preserves the same meaning and fits the document.

Do not weaken or otherwise rewrite the accepted QA conclusion.

---

## `docs/BACKLOG.md`

The current diff includes at least two references to work being:

> separately scoped Step 8 work

Replace these with direct durable descriptions such as:

> separately scoped post-localization cleanup work

or another concise equivalent.

Do not change the underlying backlog decisions.

---

# 2. Search for any additional leakage

Search the **entire current uncommitted diff**, not merely the two known files, for transient planning/implementation identifiers.

Look for patterns including, but not limited to:

```text
Step 1
Step 2
...
Step 8

Parcel 1
Parcel 2
...
Parcel N

Batch 1
Batch 2
...
Phase 1
Phase 2
...
Tranche 1
Tranche 2
...
```

Use judgment: these words are not inherently forbidden.

The issue is a numbered or named identifier whose meaning depends on a temporary conversation, implementation brief, onboarding plan, audit sequence, or Codex work breakdown.

Examples that are normally undesirable outside the document that owns them:

```text
Step 8 cleanup
Parcel 7 closure
Batch 3 fixes
Phase B work
```

Examples that may be legitimate:

```text
schema version 3
WCAG 2.2
Stage 1 migration     [only if "Stage 1" is itself a durable product/domain concept]
```

If you find another ambiguous case, report it rather than mechanically rewriting it.

Do not remove ordinary unnumbered words such as `parcel`, `phase`, or `tranche` merely because they occur in prose. The concern is leaked task-sequencing identity, not the vocabulary itself.

---

# 3. Preserve onboarding-plan numbering

Do **not** remove `Step 1`–`Step 8` from:

`docs/audits/SIMPLIFIED-CHINESE-LOCALE-ONBOARDING-PLAN.md`

That document defines the numbered sequence and is the appropriate place to preserve it.

Do not flatten or rewrite the plan merely to satisfy the new convention.

The distinction is:

```text
document owns the sequence
    → identifier may remain

another durable document merely refers to the work/state
    → describe the work/state directly
```

---

# 4. Add repository-wide convention to `AGENTS.md`

Add a short rule to `AGENTS.md`.

Recommended location:

`## Documentation`

Place it near the existing guidance about document ownership and durable project documentation.

Keep the addition concise.

The rule should establish this principle:

> Temporary task-planning identifiers from implementation briefs, conversations, audits, onboarding plans, or Codex work breakdowns must not leak into unrelated durable documentation. Terms such as numbered Steps, Parcels, Batches, Phases, or Tranches may be retained in the document that defines/owns that sequence, but other durable documents should describe the underlying feature, state, finding, or work directly.

Also make clear that:

- this applies to new documentation and updates to existing documentation;
- agents should not create cross-document dependencies on temporary numbering schemes;
- if a durable sequence really is a product/project concept in its own right, that is different and may be retained.

Do not add a large new policy section. This should be a compact repository-wide documentation convention.

---

# 5. Preserve all accepted manual-closure evidence

Do not alter the substantive Simplified Chinese QA closure already reviewed.

Preserve:

- true browser-controlled 200% zoom: PASS;
- no observed text overflow or clipping at true 200%;
- Narrator structural interaction: PASS;
- Chinese speech itself not verified because the test environment consistently skipped Chinese text;
- roles/states/positions/numeric and Latin/user-authored content behavior;
- all recorded surface-by-surface Narrator observations;
- shared/global Narrator shortcut interception debt;
- no Simplified Chinese-specific blocker;
- Simplified Chinese fully closed/supported within the stated tested Windows/Chromium scope;
- Apple/WebKit/VoiceOver remaining separate deferred/platform work;
- post-localization cleanup as the next programme-level work.

This correction is about documentation vocabulary and durable document boundaries, not QA conclusions.

---

# 6. Scope

Expected modified files should be limited to:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-QA.md
docs/BACKLOG.md
AGENTS.md
```

plus the already-modified onboarding/status documentation from the current uncommitted closure parcel **only if** another leaked identifier is discovered there and needs correction.

Do not modify production code, tests, localization assets, translation catalogues, reference overlays, CSS, runtime behavior, or generated data.

Do not begin post-localization cleanup work.

---

# 7. Verification

After the correction:

1. Run `git diff --check`.
2. Review the complete uncommitted diff.
3. Search the changed files for leaked task-sequencing identifiers.
4. Confirm that numbered Simplified Chinese onboarding steps remain only where contextually owned by the onboarding plan.
5. Confirm no numbered Parcel identifier has been introduced into unrelated durable documentation.
6. Confirm the QA conclusions and manual-test evidence remain unchanged in substance.
7. Confirm `AGENTS.md` contains the new concise repository-wide convention.
8. Confirm no code/runtime/test/localization files changed.

Do not claim broader repository-wide historical cleanup unless you actually inspect existing committed documentation for that purpose. This correction is primarily concerned with the current diff and preventing future leakage.

If you notice a pre-existing committed instance while working, report it separately rather than expanding this correction without authorization.

---

# 8. Expected Codex summary

Report:

1. branch used;
2. files modified by this correction;
3. each leaked identifier removed from the current diff;
4. whether any additional leakage was found;
5. the rule added to `AGENTS.md`;
6. confirmation that onboarding-plan numbering remains intact inside its owning document;
7. confirmation that Simplified Chinese QA conclusions/manual evidence were not substantively changed;
8. checks/searches run and results;
9. any pre-existing committed leakage noticed but deliberately left untouched;
10. suggested commit message;
11. confirmation that no commit or push was performed.

Suggested commit message remains:

`docs: close Simplified Chinese localization QA`

The `AGENTS.md` convention is part of making this closure documentation durable and should remain in the same commit unless the user later chooses to split it.
