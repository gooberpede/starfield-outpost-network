# Codex Audit Brief — Simplified Chinese Constrained Blinded Adjudication Review

## Objective

Create a **second blinded comparative audit package** for the remaining Simplified Chinese tracker-authored semantic strings where:

- Codex and DeepL produced structurally valid but substantively different translations;
- the DeepL candidate passes the Simplified Chinese quality gate;
- the row has one or more non-empty approved terminology/glossary constraints;
- the row was **not** part of the first unconstrained blind audit.

This audit is intended to test whether the current Simplified Chinese adjudication was appropriately neutral on constrained tracker-app strings.

This task is **mechanical package preparation only**.

Codex must **not** re-adjudicate the translations itself.

Codex must **not** modify the current Simplified Chinese review CSV, final catalogue, glossary, constraints, terminology values, reference data, runtime code, or any Bethesda-authored strings.

Do not commit or push.

---

# Audit boundary

This audit covers **tracker-authored application strings only**.

It must not audit or compare Bethesda-authored official strings as competing translations.

Do **not** include:

```text
official reference-name overlay values
Bethesda resource names
Bethesda product names
Bethesda system/body/biome/species names
official skill-name source values
official terminology evidence rows as standalone translation candidates
fauna component strings
```

Those remain governed by official Bethesda provenance and terminology evidence.

The constrained semantic rows may reference approved Bethesda terminology in:

```text
OfficialTermConstraints
```

That constraint information should remain visible because compliance with official terminology is part of judging a tracker-authored translation.

---

# Why this second blind audit is being run

The first blind audit reviewed all structurally valid, Chinese-quality-valid, **unconstrained** substantive disagreements.

That first pass produced:

```text
72 reviewed rows

Blind source preference after unblinding:
Codex:      51
DeepL:       5
Equivalent: 14
Custom:      2
```

Comparison with the original adjudication showed:

```text
53 original decisions directly affirmed
14 existing final values acceptable but candidates judged equivalent
3 blind reversals in favor of DeepL
2 blind custom replacements
```

The first blind audit therefore found that:

- Codex genuinely outperformed DeepL heavily on this Chinese app-string population;
- the original process nevertheless overclaimed superiority in a number of stylistic ties;
- five material final-string improvements were identified.

The remaining question is whether the same pattern holds for the **terminology/glossary-constrained substantive disagreements**.

The current catalogue must remain frozen until this second blind audit is complete and unblinded.

---

# Source of truth

Use the current frozen Simplified Chinese semantic review evidence:

```text
docs/localization/zh-Hans-review.csv
```

Do not alter it.

Also use the first blind-audit package only to exclude rows already reviewed.

The first blind audit reviewed exactly the unconstrained population, so a row with a non-empty:

```text
OfficialTermConstraints
```

should not normally overlap.

Nevertheless, derive the population mechanically and verify no duplicate review occurs.

---

# Core blinding rule

The independent reviewer must not know which candidate came from Codex and which came from DeepL.

The audit-facing package must not expose:

```text
CodexTranslation
DeepLTranslation
AdjudicationDecision
FinalTranslation
ReviewerNote
current catalogue value
origin labels
```

Candidates must appear only as:

```text
CandidateA
CandidateB
```

The A/B assignment must be deterministic and reproducible but not visually predictable.

---

# 1. Freeze the current adjudication

Treat these current artifacts as frozen evidence:

```text
docs/localization/zh-Hans-review.csv
src/localization/reviewDrafts/zh-Hans.ts
src/localization/locales/zh-Hans.ts
docs/localization/zh-Hans-deepl.xliff
```

Do not:

- change any translation;
- change any adjudication decision;
- change any rationale;
- rewrite terminology;
- normalize punctuation;
- normalize spacing;
- repair candidates;
- update the final catalogue.

The blinded package must contain the exact currently recorded candidate strings.

---

# 2. Define the second audit population

Select rows satisfying **all** of the following:

```text
Locale == zh-Hans
ComparisonStatus == SUBSTANTIVE
DeepL candidate is structurally valid
DeepL candidate is Chinese-quality-valid
OfficialTermConstraints is non-empty
```

Exclude:

```text
IDENTICAL
TYPOGRAPHIC_ONLY
INVALID_TOKENS
MISSING
Chinese-quality-invalid DeepL candidates
rows with empty OfficialTermConstraints
rows already included in the first blind audit
```

Expected population from the current adjudication is approximately:

```text
196 rows
```

Do not hard-code 196 as the pass criterion.

Derive the count mechanically from the frozen review CSV.

If the actual count differs, report the exact reason before proceeding.

---

# 3. Tracker-app semantic rows only

Verify that every selected row is a tracker semantic catalogue key from the normal `en-US` message catalogue.

The presence of an official terminology constraint does **not** make the row Bethesda-authored.

Examples that are valid audit rows include tracker messages such as:

```text
Add Cargo Link
Destination outpost
Resource Matrix help
Outpost validation messages
Starfield tracker About text
history descriptions
search/result labels
status messages
```

provided they satisfy the selection criteria.

Do not include any standalone Bethesda source table or reference overlay row.

---

# 4. Preserve visible terminology constraints

The reviewer-facing package must include:

```text
OfficialTermConstraints
```

unchanged.

This is intentional.

For constrained rows, judging whether a candidate respects approved terminology such as:

```text
哨站
货运链接
跨星系货运链接
行星体
星系
星空
X技术
资源状态表
计划供应
```

is part of the translation judgment.

Do not hide or simplify these constraints.

Do not expose which candidate the original adjudication believed complied better.

---

# 5. Reviewer-facing CSV schema

Create a blinded CSV containing at least:

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
CustomTranslation
BlindRationale
```

Initialize:

```text
BlindDecision
CustomTranslation
BlindRationale
```

as blank for every row.

Do not include current decision/final-value fields.

---

# 6. Reuse the established decision vocabulary

The independent reviewer will use exactly:

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

Both are acceptable for the tracker context and neither is materially superior.

The reviewer must not be forced to manufacture a winner for stylistic differences.

## CUSTOM

Neither candidate is satisfactory and a different final wording is preferred.

The reviewer may populate:

```text
CustomTranslation
```

when using `CUSTOM`.

---

# 7. Deterministic A/B assignment

Use the same general blinding method as the first audit, but use a distinct namespace for this second population.

Recommended namespace:

```text
zh-Hans-blind-audit-constrained-v1:
```

Conceptual algorithm:

```text
SHA-256(namespace + semantic key)

one stable hash bit decides:
Codex -> A / DeepL -> B
or
DeepL -> A / Codex -> B
```

Requirements:

- deterministic;
- independent of current adjudication;
- independent of lexical ordering;
- independent of risk;
- independent of constraints;
- no random state;
- no obvious alternating pattern.

A reasonably balanced origin allocation should result naturally.

Do not manipulate assignments to reach exact 50/50 balance.

---

# 8. Separate sealed origin map

Create an ignored origin-map file containing only:

```text
Key
CandidateAOrigin
CandidateBOrigin
```

Origins:

```text
CODEX
DEEPL
```

Store under ignored working space, for example:

```text
.local-work/localization/zh-Hans-blind-audit-constrained/origin-map.csv
```

The origin map must:

- remain untracked;
- not be included in the reviewer-facing CSV;
- not be printed in the completion summary;
- not be shown to the independent reviewer;
- remain sealed until every blind decision/rationale is complete.

---

# 9. Reviewer-facing artifact location

Create the blinded audit CSV under ignored local work unless an existing durable-audit convention clearly requires otherwise.

Preferred path:

```text
.local-work/localization/zh-Hans-blind-audit-constrained/zh-Hans-blind-adjudication-constrained.csv
```

Also create:

```text
.local-work/localization/zh-Hans-blind-audit-constrained/README.md
```

No tracked artifact is required for package preparation.

The reviewed result may later become durable evidence if we choose to preserve it after unblinding.

---

# 10. Preserve exact candidate text

Do not alter candidate strings during blinding.

Preserve exactly:

- punctuation;
- Chinese quotation marks;
- ASCII punctuation;
- spaces;
- placeholders;
- Latin tokens;
- capitalization;
- slash characters;
- ellipses;
- technical syntax;
- unusual wording.

Do not "help" either candidate before independent review.

---

# 11. Structural/quality sanity check before inclusion

Verify each selected row before writing the package.

Both candidates must:

- be non-empty;
- preserve required placeholder names;
- have valid plural syntax;
- preserve protected tokens;
- be eligible for comparison under the frozen review evidence.

The DeepL candidate must additionally:

- pass the current Chinese accidental-English quality gate;
- pass the current Chinese prose-presence gate.

The row must have:

```text
ComparisonStatus == SUBSTANTIVE
OfficialTermConstraints != empty
```

If a row unexpectedly fails, exclude it and report why.

Do not repair it.

---

# 12. No current-adjudication leakage

Do not include or indirectly reveal:

- original winner;
- final translation;
- reviewer rationale;
- which candidate matched constraints according to prior review;
- which candidate equals the current catalogue;
- current decision counts;
- any "recommended" source.

The reviewer must evaluate both candidates against the visible:

```text
EnglishSource
Context
Risk
Parameters
ProtectedTokens
OfficialTermConstraints
```

only.

---

# 13. README metadata

Create a short README recording:

- purpose;
- frozen source review CSV path;
- source review CSV SHA-256;
- selection criteria;
- derived row count;
- excluded categories/counts;
- A/B assignment algorithm;
- blinded CSV SHA-256;
- sealed origin-map SHA-256;
- decision vocabulary;
- instruction to keep origin map sealed;
- statement that this covers tracker-authored semantic strings only;
- statement that Bethesda reference strings are excluded;
- statement that no adjudication/catalogue mutation occurred.

Do not include row-level origin mapping.

---

# 14. Determinism and hashes

Record SHA-256 for:

```text
frozen source review CSV
blinded constrained CSV
hidden origin map
README
```

Regenerate the package twice.

Require byte-identical output for:

```text
blinded CSV
origin map
README
```

If not deterministic, stop and correct the generator.

---

# 15. Balance reporting

Codex may report that the origin distribution is "reasonably balanced" and may report aggregate A-origin/B-origin counts if needed to validate the generator.

Do not reveal any row-level mapping.

Do not reveal origin distribution in a form that lets the reviewer infer individual rows.

---

# 16. Do not perform the blind review

Codex's role ends after package preparation.

Do not:

- choose A/B;
- write blind rationales;
- compare candidates;
- score Codex versus DeepL;
- analyze terminology quality;
- unblind;
- update the catalogue.

The independent reviewer will perform the actual judgment outside this task.

---

# 17. Keep the first audit separate

Do not merge the previous unconstrained 72-row reviewed audit into this new package.

The second audit is only the constrained population.

The two passes will be reconciled after the second blind review is complete.

Do not re-review the first 72 rows.

---

# 18. No Bethesda-string audit

Explicitly confirm that the package includes **no Bethesda-authored reference strings**.

Do not include:

```text
resource/product reference names
body/system names
biome names
species names
fauna components
official skill source values as standalone rows
official terminology-value CSV rows as standalone rows
```

Official terminology may appear only inside the tracker row's:

```text
OfficialTermConstraints
```

field.

---

# 19. No implementation changes

Do not modify:

```text
src/localization/locales/zh-Hans.ts
src/localization/reviewDrafts/zh-Hans.ts
docs/localization/zh-Hans-review.csv
src/localization/reviewPackage.ts
docs/localization/SIMPLIFIED-CHINESE-GLOSSARY.md
reference-source/official-terminology-values-zh-Hans.csv
runtime localization code
reference overlays
fauna evidence
tests governing product translation behavior
CSS/UI
```

Prefer a disposable ignored generator under:

```text
.local-work/localization/zh-Hans-blind-audit-constrained/
```

Do not widen production APIs.

---

# 20. Validation

At minimum:

```text
git diff --check
```

If no tracked files change, full build/test suites are not required.

Confirm:

- source review CSV unchanged;
- final `zh-Hans.ts` unchanged;
- review draft unchanged;
- glossary/terminology artifacts unchanged;
- no runtime/UI/reference changes;
- package files ignored/untracked;
- no commit/push occurred.

---

# 21. Completion criteria

This package-generation audit is complete when:

- the constrained tracker-app population is derived mechanically;
- Bethesda reference strings are proven excluded;
- every included row satisfies the exact criteria;
- constraints remain visible;
- candidates are blinded deterministically;
- no source/current-decision information leaks;
- the origin map remains sealed/ignored;
- output hashes are stable;
- current Chinese adjudication/catalogue remains frozen.

---

# Completion response

Return:

1. branch;
2. files created;
3. frozen source review CSV path;
4. frozen source review CSV SHA-256;
5. derived constrained blind-row count;
6. count excluded for structural invalidity;
7. count excluded for Chinese quality invalidity;
8. count excluded because unconstrained;
9. count excluded because non-substantive;
10. confirmation all included rows are tracker-authored semantic catalogue rows;
11. confirmation no Bethesda reference strings are included;
12. blinded CSV path;
13. blinded CSV SHA-256;
14. reviewer-facing columns;
15. confirmation `OfficialTermConstraints` remains visible;
16. confirmation candidates preserve exact original text;
17. A/B assignment namespace/algorithm;
18. deterministic-regeneration result;
19. aggregate origin-balance result without row-level disclosure;
20. hidden origin-map path;
21. hidden origin-map SHA-256;
22. confirmation origin map is ignored/untracked;
23. README path;
24. README SHA-256;
25. confirmation blind decision/rationale fields are blank;
26. confirmation no current adjudication decision changed;
27. confirmation final `zh-Hans.ts` unchanged;
28. confirmation review draft and review CSV unchanged;
29. confirmation no production/runtime/UI/reference/fauna changes;
30. `git diff --check` result;
31. deviations from brief;
32. exact next-step instruction: provide only the blinded constrained CSV to the independent reviewer; keep the origin map sealed;
33. confirmation no commit/push occurred.

Do not reveal the hidden mapping in the completion response.
