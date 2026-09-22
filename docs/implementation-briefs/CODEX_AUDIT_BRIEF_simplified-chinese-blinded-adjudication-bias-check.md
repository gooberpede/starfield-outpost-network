# Codex Audit Brief — Simplified Chinese Blinded Adjudication Bias Check

## Objective

Create a **blinded comparative audit package** for the current Simplified Chinese semantic adjudication so an independent reviewer can evaluate whether the earlier adjudication process favored the Codex draft over DeepL.

This task is **mechanical package preparation only**.

Codex must **not** re-adjudicate the translations itself.

Codex must **not** modify the current final Simplified Chinese catalogue, current adjudication decisions, or current review evidence.

Do not commit or push.

---

# Why this audit is being run

The current Simplified Chinese adjudication produced a highly asymmetric result among structurally valid substantive disagreements:

```text
CODEX:  265
DEEPL:    3
CUSTOM:   3
```

That asymmetry may be justified by actual translation quality and terminology conformance, but it is large enough to warrant an independent blinded check.

A preliminary review identified a particularly useful population:

```text
73 structurally valid SUBSTANTIVE disagreements
with no binding terminology constraint
```

These rows are the first audit population because glossary/official-term enforcement cannot explain the source preference there.

The purpose is to test the **decision process**, not to assume the final Chinese catalogue is wrong.

---

# Source of truth

Use the current committed/staged Simplified Chinese review evidence:

```text
docs/localization/zh-Hans-review.csv
```

and current semantic source/context metadata.

Do not regenerate or alter:

```text
src/localization/locales/zh-Hans.ts
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
docs/localization/zh-Hans-deepl.xliff
```

unless this brief explicitly asks for a new audit artifact.

---

# Core blinding rule

The independent reviewer must not know which candidate came from Codex and which came from DeepL while making decisions.

Therefore the audit-facing package must not expose:

- `CodexTranslation`;
- `DeepLTranslation`;
- current `AdjudicationDecision`;
- current `FinalTranslation`;
- current `ReviewerNote`;
- any origin-specific labels;
- any ordering pattern that trivially reveals origin.

Candidates must appear only as:

```text
CandidateA
CandidateB
```

The A/B assignment must be deterministic and reproducible, but not visually predictable from row order or source.

---

# 1. Freeze the existing adjudication

Treat the current Simplified Chinese review CSV and final catalogue as frozen evidence.

Do not:

- change decisions;
- change final translations;
- rewrite rationales;
- "improve" either candidate;
- normalize punctuation;
- normalize spacing;
- repair terminology;
- repair placeholders;
- substitute synonyms.

The blind package must contain the exact candidate strings currently stored in the review evidence.

---

# 2. Define the initial audit population

Select rows satisfying **all** of the following:

```text
Locale == zh-Hans
ComparisonStatus == SUBSTANTIVE
DeepL candidate is structurally valid
DeepL candidate is not Chinese-quality-invalid
OfficialTermConstraints is empty
```

Exclude:

```text
IDENTICAL
TYPOGRAPHIC_ONLY
INVALID_TOKENS
MISSING
rows with Chinese-quality-invalid DeepL candidates
rows with non-empty OfficialTermConstraints
```

Expected initial population from the current review evidence:

```text
73 rows
```

Do not hard-code `73` as a pass criterion.

Derive the count from the frozen review CSV and report the actual result.

If the derived count differs from 73, explain exactly why before proceeding.

---

# 3. Preserve the full comparison context

Create a blinded CSV containing, at minimum:

```text
Key
EnglishSource
Context
Risk
Parameters
ProtectedTokens
OfficialTermConstraints
CandidateA
CandidateB
BlindDecision
BlindRationale
```

For this initial unconstrained population:

```text
OfficialTermConstraints
```

should be empty by selection, but retain the column so the same schema can later support a constrained audit.

Do not include the current final translation or current decision.

---

# 4. Deterministic A/B assignment

Assign Codex and DeepL candidates to `CandidateA` / `CandidateB` using a deterministic per-key rule.

Requirements:

- approximately balanced A/B origin distribution across the audit set;
- deterministic regeneration;
- assignment cannot depend on current decision;
- assignment cannot depend on lexical order;
- assignment cannot alternate visibly by row;
- assignment cannot simply put Codex in A for all rows.

Recommended method:

```text
SHA-256 of a fixed audit namespace + semantic key
```

Use one stable bit of the hash to decide which origin becomes A.

Example conceptual rule:

```text
hash("zh-Hans-blind-audit-v1:" + key)
lowest bit = 0 -> Codex=A, DeepL=B
lowest bit = 1 -> DeepL=A, Codex=B
```

Equivalent deterministic logic is acceptable.

Do not use nondeterministic randomness.

Record the exact algorithm in the durable audit README/report.

---

# 5. Hidden origin mapping

Create a separate mapping artifact containing:

```text
Key
CandidateAOrigin
CandidateBOrigin
```

where origins are:

```text
CODEX
DEEPL
```

This mapping must **not** be included in the reviewer-facing CSV.

Store it under ignored local working space, for example:

```text
.local-work/localization/zh-Hans-blind-audit/origin-map.csv
```

The mapping must not be committed.

Do not print the origin mapping in the Codex completion summary.

Do not paste it into chat.

Do not include origin counts broken down by A/B in a way that would make individual rows inferable.

It should remain sealed until the independent reviewer has completed all blind decisions.

---

# 6. Reviewer-facing audit artifact

Create a durable or user-shareable blinded CSV at:

```text
docs/localization/zh-Hans-blind-adjudication-audit.csv
```

or, if repository policy treats this as temporary working evidence rather than durable review evidence:

```text
.local-work/localization/zh-Hans-blind-audit/zh-Hans-blind-adjudication-audit.csv
```

Use the repository's existing documentation policy to choose.

Preferred behavior for this audit:

- the blinded CSV may be tracked if review evidence is normally durable;
- the origin map must remain ignored/untracked;
- no adjudication mutation occurs.

If uncertain, keep both files in `.local-work` and report the decision.

Do not invent a new long-term documentation convention merely for this audit.

---

# 7. Blind decision vocabulary

The reviewer-facing CSV must allow exactly these decision values:

```text
A
B
EQUIVALENT
CUSTOM
```

Meaning:

## A

Candidate A is materially preferable.

## B

Candidate B is materially preferable.

## EQUIVALENT

Both are acceptable in this context and neither is materially superior.

This is important: do not force a winner when the candidates differ only stylistically.

## CUSTOM

Neither candidate is good enough; a different final wording is warranted.

The reviewer may optionally populate a proposed custom translation in a separate field if desired.

Recommended optional column:

```text
CustomTranslation
```

Leave blank initially.

---

# 8. Blind rationale requirements

Add an empty:

```text
BlindRationale
```

column.

The independent reviewer will populate it.

No Codex-generated reviewer rationale should be prefilled.

The later review should prefer concrete reasons such as:

- semantic fidelity;
- UI role;
- ambiguity;
- idiomatic Simplified Chinese;
- punctuation/spacing;
- concise control wording;
- state/action distinction;
- consistency within a key family.

Avoid generic rationale templates such as:

```text
more natural
more precise
better context
```

without explaining the specific difference.

Codex must not fill this field in this package-generation task.

---

# 9. Preserve candidate bytes/text faithfully

Do not alter candidate strings when placing them in the blinded CSV.

Preserve:

- Chinese punctuation;
- ASCII punctuation;
- spaces;
- placeholders;
- technical tokens;
- quotation marks;
- line breaks if any;
- capitalization of embedded Latin;
- unusual wording.

The reviewer must compare exactly what was originally adjudicated.

Do not normalize candidates before blinding.

---

# 10. Structural sanity check

Although the selected population should already contain structurally valid DeepL rows, verify before writing the package:

- both CandidateA and CandidateB are non-empty;
- both retain exact required placeholder names;
- both have valid plural syntax;
- both preserve required protected tokens;
- neither is Chinese-quality-invalid under the current validator;
- `ComparisonStatus` is genuinely `SUBSTANTIVE`;
- `OfficialTermConstraints` is empty.

If a row fails one of these conditions, exclude it and report why.

Do not repair it to keep it in the audit.

---

# 11. Do not expose current adjudication indirectly

Avoid fields that could reveal the original winner.

Do not include:

- current final value;
- current decision;
- current reviewer note;
- "selected candidate";
- equality to current catalogue;
- decision-source counts per row;
- comments like "approved terminology";
- a column indicating which candidate passed a special check only one origin is known to fail.

The reviewer should see only the source/context and two valid candidates.

---

# 12. Audit package README

Create a short README or metadata file for the blinded package, for example:

```text
.local-work/localization/zh-Hans-blind-audit/README.md
```

It should record:

- purpose;
- frozen source review CSV hash;
- selection criteria;
- row count;
- A/B assignment algorithm;
- blinded CSV hash;
- origin-map hash;
- explicit instruction not to reveal the origin map until decisions are complete;
- decision vocabulary;
- statement that no current adjudication was changed.

Do not include the actual A/B origin mapping in the README.

---

# 13. Hashes and determinism

Report SHA-256 for:

```text
frozen source review CSV
blinded audit CSV
hidden origin map
```

Regenerate the blinded package twice and verify byte-identical results.

If regeneration differs, stop and fix determinism before handing the package to the reviewer.

---

# 14. Initial audit only — do not expand yet

Do **not** generate the full 271-row substantive audit unless separately requested.

This first package is specifically:

```text
all structurally valid
Chinese-quality-valid
unconstrained
SUBSTANTIVE disagreements
```

Expected roughly:

```text
73 rows
```

The independent reviewer will evaluate this set first.

Only after blind decisions are complete will the user/assistant decide whether to:

- accept the existing adjudication process;
- perform a stratified constrained-row audit;
- expand to all valid substantive disagreements.

---

# 15. Do not unblind automatically

After generating the package:

- do not compare blind decisions to current decisions;
- do not reveal A/B origins;
- do not produce a "winner" analysis;
- do not amend the catalogue.

The independent reviewer will fill the blind decisions outside this Codex task.

Unblinding requires a separate explicit instruction after completed blind review evidence is supplied.

---

# 16. No implementation changes

Do not modify:

```text
src/localization/locales/zh-Hans.ts
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
src/localization/reviewPackage.ts
runtime localization code
tests governing translation behavior
CSS/UI
reference data
fauna data
```

unless a tiny standalone audit-package generator/test is necessary.

Prefer a disposable audit script under:

```text
.local-work/localization/zh-Hans-blind-audit/
```

so no production API changes are needed.

Do not widen production exports for this audit.

---

# 17. Suggested audit script

A local ignored script may:

1. read `docs/localization/zh-Hans-review.csv`;
2. parse rows using existing CSV semantics or a local CSV library;
3. apply the selection criteria;
4. deterministically assign origins to A/B;
5. write the blinded CSV;
6. write the sealed origin map;
7. write README/hash metadata;
8. regenerate and compare hashes.

It must not mutate source files.

---

# 18. Validation

At minimum run:

```text
git diff --check
```

If no tracked repository files change, full application tests/build are not required.

If you add a tracked audit artifact or audit-specific test, run the smallest relevant verification.

Confirm:

- current review CSV unchanged;
- final Chinese catalogue unchanged;
- no runtime files changed;
- origin map untracked/ignored;
- no commit/push occurred.

---

# 19. Completion criteria

This task is complete when:

- the initial blind population is derived mechanically;
- every included row meets the exact selection criteria;
- candidates are assigned A/B deterministically;
- the reviewer-facing package contains no origin/current-decision leakage;
- the origin map is sealed in ignored local working storage;
- hashes are recorded;
- regeneration is byte-identical;
- current Chinese adjudication/catalogue is untouched.

---

# Completion response

Return:

1. branch;
2. files created/changed;
3. frozen source review CSV path;
4. frozen source review CSV SHA-256;
5. derived blind-row count;
6. count excluded for structural invalidity, if any;
7. count excluded for Chinese quality invalidity;
8. count excluded because constrained;
9. count excluded because non-substantive;
10. blinded CSV path;
11. blinded CSV SHA-256;
12. decision columns present;
13. confirmation candidates contain exact original text;
14. A/B assignment algorithm description;
15. confirmation A/B assignment is deterministic;
16. confirmation origin distribution is reasonably balanced, without revealing row-level mapping;
17. hidden origin-map path;
18. hidden origin-map SHA-256;
19. confirmation origin map is ignored/untracked;
20. README/metadata path;
21. deterministic regeneration result;
22. confirmation no current adjudication decision was changed;
23. confirmation final `zh-Hans.ts` catalogue unchanged;
24. confirmation review draft unchanged;
25. confirmation review CSV unchanged;
26. confirmation no production API/runtime/UI changes occurred;
27. `git diff --check` result;
28. deviations from brief;
29. exact instruction for the next step: provide only the blinded CSV to the independent reviewer, keep the origin map sealed;
30. suggested commit message only if a durable tracked audit artifact was intentionally created;
31. confirmation no commit/push occurred.

Do not reveal the hidden mapping in the completion response.
