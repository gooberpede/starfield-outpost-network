# CODEX CORRECTION BRIEF — Localization Parcel B3: Evidence-Based Comparative Adjudication

## Purpose

Apply a **focused correction pass** to Parcel B3 before commit.

The existing B3 implementation is largely sound, but its row-level adjudication evidence is too biased toward the Codex B1 draft because most non-Bethesda disagreements default automatically to `ACCEPT_CODEX`.

This correction must make the comparative adjudication genuinely evidence-based.

Do **not** redo Parcel B3 from scratch.

Do **not** alter application architecture.

Do **not** touch persistence, reference-data schemas, validation semantics, history semantics, or UI structure.

Do **not** begin Parcels C/D/E.

---

# Working-file location

Use the existing untracked working area:

`D:\Projects\starfield-outpost-network\.local-work\translation\jp`

The working adjudication CSV and any helper scripts remain untracked there.

Do not move working-only adjudication artifacts into tracked repository paths.

Durable tracked outputs remain limited to:

- `src/localization/locales/ja-JP.ts`
- `docs/localization/JAPANESE-GLOSSARY.md`
- `docs/THIRD-PARTY-REFERENCES.md`
- `docs/audits/codex-japanese-translation-review.md`

plus tests if needed.

---

# Problem to correct

The current adjudication helper assigns most rows according to:

```text
Bethesda dependency -> DEFER_BETHESDA
Exact agreement      -> AUTO_ACCEPT_AGREEMENT
Otherwise            -> ACCEPT_CODEX
```

This means the current `151 ACCEPT_CODEX` decisions do not necessarily represent an explicit row-by-row comparison of Codex Japanese against DeepL Japanese.

Similarly, current HIGH-risk reasons may automatically claim:

```text
Tier 1 independent second pass
```

without row-level evidence that an independent second comparison was actually performed.

Because there is no human Japanese reviewer, the durable audit trail must be stronger than this.

---

# Required correction

Explicitly review every **non-exact, non-Bethesda disagreement** currently classified as `ACCEPT_CODEX`.

This is expected to be approximately 151 rows.

For each such row:

1. compare the English source;
2. compare Codex Japanese;
3. compare DeepL Japanese;
4. inspect context;
5. inspect glossary/product semantics;
6. inspect parameters/protected tokens;
7. determine whether the difference is:
   - punctuation/spacing only;
   - stylistic synonym;
   - register difference;
   - genuine semantic difference;
   - UI-context difference;
   - technical terminology difference.

Then assign a real decision:

```text
ACCEPT_CODEX
ACCEPT_DEEPL
REWRITE
DEFER_BETHESDA
```

Do not retain `ACCEPT_CODEX` merely because no explicit override exists.

---

# Evidence standard

Every non-exact disagreement must have a review reason that reflects the actual comparison.

The reason does **not** need to be long.

Acceptable examples:

```text
Codex is more concise for a compact button; DeepL adds unnecessary explanatory wording.
```

```text
DeepL better preserves the action direction and reads more naturally in Japanese UI language.
```

```text
Both are semantically equivalent; Codex is preferred for consistency with nearby glossary terms.
```

```text
Neither is satisfactory; rewrite avoids ambiguity between inventory and configured supply.
```

Do not use one generic reason for a large class of semantically different rows.

---

# Fast-path categories

To control usage cost, you may use concise categorical adjudication for low-risk differences.

Examples:

## PUNCTUATION_ONLY

If the Japanese wording is effectively identical and only punctuation/spacing differs:

- prefer the project style consistently;
- record a short reason.

## STYLE_EQUIVALENT

If both convey the same meaning and differ only in harmless synonym/register:

- prefer the option consistent with glossary and nearby UI;
- record that explicitly.

## COMPACT_UI

For buttons/headings where one version is materially shorter but semantically complete:

- prefer the concise software-UI wording.

## FULL_SENTENCE

For help/validation/accessibility sentences:

- prefer natural complete Japanese over compressed label-style wording.

These categories may appear in the reason or in an added working-only review field if useful.

---

# HIGH-risk rows

Every HIGH-risk non-exact row currently classified `ACCEPT_CODEX` requires a **real semantic comparison**.

Do not auto-generate the phrase:

```text
Tier 1 independent second pass
```

unless a second review pass actually occurred.

For HIGH-risk rows, the reason must mention the core issue being checked, for example:

- Planned Supply meaning;
- presence versus temporal “current”;
- active production versus throughput;
- logistics as routed export;
- harvesting versus extraction;
- validation severity;
- destructive action meaning;
- accessibility instruction clarity.

If a separate second reasoning pass is performed, record its result honestly.

If not, remove claims that it occurred.

---

# Second-pass requirement

For difficult HIGH-risk rows, perform a second reasoning pass that is genuinely separate from the first comparison.

The second pass should reassess:

- English source;
- product/context definition;
- Codex Japanese;
- DeepL Japanese;
- glossary;
- syntax constraints.

It should answer:

```text
Best option: Codex / DeepL / neither
Reason
Residual risk
Bethesda dependency?
```

You do not need to second-pass every trivial LOW/MEDIUM disagreement.

---

# Bethesda-dependent rows

Do not reopen Bethesda deferrals merely because Codex/DeepL disagree.

Keep:

```text
DEFER_BETHESDA
```

when the unresolved choice genuinely depends on official game terminology.

Examples:

- X-Tech;
- Cargo Pad;
- Inter-System;
- Outpost;
- Starfield skill names;
- biome/body/system terminology;
- game-native resources/products/species.

However, tracker-owned grammar surrounding those terms can still be improved if needed.

Do not canonize a machine translation as an official game term.

---

# Exact agreements

The existing exact agreements may remain:

```text
AUTO_ACCEPT_AGREEMENT
```

unless:

- Bethesda terminology is embedded;
- syntax/protected-token concerns exist;
- the English source itself is ambiguous.

No need to spend substantial review effort on straightforward exact agreements.

---

# Working adjudication CSV

Update:

`D:\Projects\starfield-outpost-network\.local-work\translation\jp\ja-JP-adjudication.csv`

so that every decision/reason reflects actual review.

If helpful, add working-only columns such as:

```text
ComparisonType
SecondPassResult
```

but do not duplicate translation sources unnecessarily.

The final CSV must still match the runtime catalogue exactly after accepted changes.

---

# Adjudication helper script

If `build-adjudication.mjs` remains part of the working process:

- remove or neutralize the automatic `otherwise -> ACCEPT_CODEX` policy;
- require explicit reviewed decisions for non-exact disagreements;
- fail if a disagreement lacks an explicit adjudication;
- remove automatic insertion of “independent second pass” wording;
- only record second-pass language where review evidence exists.

Preferred behavior:

```text
Exact agreement + no dependency -> AUTO_ACCEPT_AGREEMENT
Bethesda dependency             -> DEFER_BETHESDA
Everything else                 -> explicit reviewed decision required
```

The script should become a verifier/assembler of adjudication decisions, not a default decision engine.

---

# Catalogue updates

After explicit re-review:

- update `src/localization/locales/ja-JP.ts` only where the final decision changes;
- keep semantic keys unchanged;
- preserve placeholders and ICU syntax;
- preserve protected tokens;
- do not change `en-US`;
- do not add Bethesda reference overlays.

Report how many additional catalogue strings changed during this correction.

---

# Glossary updates

Update `docs/localization/JAPANESE-GLOSSARY.md` only where re-review changes a settled tracker-owned term or adds a useful durable clarification.

Do not inflate the glossary with one-off sentence decisions.

Do not promote Bethesda-dependent terminology to approved status.

---

# Durable audit corrections

Update:

`docs/audits/codex-japanese-translation-review.md`

The report should accurately describe the real method.

In particular:

- remove any implication that all non-exact Codex choices were individually adjudicated if that was previously untrue;
- after this correction, state that all non-exact non-Bethesda disagreements were explicitly reviewed;
- distinguish fast-path stylistic adjudication from deep semantic review;
- state exactly which HIGH-risk rows received a second reasoning pass;
- preserve uncertainty where it remains.

---

# Human-review wording

The current audit may recommend obtaining a native Japanese review as if it were an expected next step.

The user does not have access to a Japanese-speaking reviewer.

Change this wording to something like:

> A future native-speaker review would still be valuable if one becomes available. In its absence, retain the machine-assisted audit trail and prioritize further review of MEDIUM-confidence and Bethesda-dependent strings.

Do not imply that B4 is blocked on human review.

---

# Provenance ledger

Update `docs/THIRD-PARTY-REFERENCES.md` only if the actual correction introduces another external model/tool.

If no new external tool is used, no new provenance entry is required.

Do not invent vendor/tool usage.

---

# Tests and verification

After catalogue changes, run:

```text
npm run localization:review
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

Also verify:

- 330 Japanese keys still present;
- placeholder parity intact;
- protected tokens intact;
- ICU syntax intact;
- adjudication CSV matches runtime catalogue exactly;
- no unresolved non-exact non-Bethesda row remains without an explicit review decision.

Do not commit or push.

---

# Final report

Report:

- number of non-exact non-Bethesda disagreements explicitly re-reviewed;
- revised decision counts;
- revised confidence counts;
- number of additional `ja-JP.ts` changes;
- number of HIGH-risk rows receiving genuine second-pass review;
- examples where DeepL won;
- examples where Codex remained preferable;
- examples rewritten;
- any new Bethesda deferrals;
- helper-script methodology changes;
- audit wording changes;
- verification results;
- confirmation that no app architecture/reference/persistence work was introduced.

---

# Acceptance criteria

This correction is complete when:

- no non-exact non-Bethesda disagreement is accepted by default;
- every such disagreement has an explicit comparative decision;
- every HIGH-risk disagreement has a real semantic rationale;
- second-pass claims exist only where a second pass actually occurred;
- the adjudication helper no longer defaults disagreements to `ACCEPT_CODEX`;
- final Japanese catalogue reflects reviewed decisions only;
- working adjudication CSV matches runtime catalogue;
- durable audit accurately describes the review method;
- native-speaker review is framed as optional future value, not a blocker;
- all tests/build/lint/reference checks pass;
- no commit or push occurs.
