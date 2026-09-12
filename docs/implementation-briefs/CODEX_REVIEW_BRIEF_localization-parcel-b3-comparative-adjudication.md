# CODEX REVIEW BRIEF — Localization Parcel B3: Comparative Japanese Adjudication

## Purpose

Perform **Parcel B3: comparative adjudication** of the first-pass Japanese tracker catalogue against the independent DeepL translation pass.

This is a **translation-review task**, not an application refactor.

The goal is to produce a reasoned, auditable set of Japanese translation decisions for all tracker-authored semantic messages, while explicitly deferring Bethesda-owned terminology that should be settled later from official Bethesda localization data.

Do not commit or push.

Do not change application architecture.

Do not modify persistence, reference-data schemas, validation semantics, history semantics, or UI structure.

---

# Working-file location

All Japanese translation working files are stored locally under:

`D:\Projects\starfield-outpost-network\.local-work\translation\jp`

This directory is intentionally **not committed to the repository**.

Treat it as the working area for:

- DeepL-returned XLIFF;
- Codex-vs-DeepL comparison CSV;
- DeepL intake report;
- temporary adjudication tables;
- machine-review outputs;
- any intermediate scripts or notes created specifically for this adjudication workflow.

Do not move these working artifacts into tracked repository paths unless a later brief explicitly instructs you to.

The durable tracked outputs from B3 are limited to:

- the approved Japanese catalogue changes, if adjudication reaches that point;
- the durable review report under `docs/audits/`;
- glossary/provenance updates where required.

---

# Expected working inputs

Use the current repository plus the local B3 working files.

Expected files under `.local-work\translation\jp` include or should be identifiable as:

- the B1 review source package;
- the DeepL-returned XLIFF;
- `ja-JP-codex-vs-deepl-comparison.csv`;
- `ja-JP-deepl-intake-report.md`;
- any B1 translation notes copied there by the user.

Also read the committed durable translation sources:

- `src/localization/locales/en-US.ts`
- `src/localization/locales/ja-JP.ts`
- `docs/localization/JAPANESE-GLOSSARY.md`
- `docs/THIRD-PARTY-REFERENCES.md`
- `docs/audits/codex-localization-coverage-and-japanese-audit.md`
- current localization tests.

If a working file is missing, do not invent its contents; report the missing input.

---

# Current translation state

Parcel B1 is complete and committed.

Current state:

- 330 tracker-authored semantic messages;
- complete first-pass `ja-JP` catalogue;
- B1 risk classification:
  - 87 HIGH
  - 196 MEDIUM
  - 47 LOW
- independent DeepL pass completed from English source;
- DeepL was not seeded with Codex Japanese;
- all 330 semantic keys returned from DeepL;
- 67 Codex/DeepL Japanese strings are exact matches;
- 20 DeepL rows altered interpolation placeholder identifiers;
- 2 DeepL rows altered protected tokens;
- 4 DeepL rows altered ICU plural syntax.

The DeepL output is therefore valid as **independent linguistic evidence**, but must not be imported directly into application code.

---

# Adjudication principle

Do not compare Japanese strings by surface appearance alone.

For each disputed message, evaluate:

1. **Semantic fidelity**
   - Does the Japanese preserve the actual product meaning?
   - Does it avoid introducing a stronger/weaker or different concept?

2. **Context suitability**
   - Is the wording appropriate for:
     - compact UI;
     - explanatory help;
     - validation;
     - accessibility;
     - history;
     - destructive confirmation;
     - status/error feedback?

3. **Glossary consistency**
   - Does it follow the established product terminology in `JAPANESE-GLOSSARY.md`?

4. **Natural Japanese software language**
   - Is it idiomatic for a software interface rather than a literal English calque?

5. **Register/tone**
   - Neutral, concise, professional.
   - Avoid inconsistent politeness or stylistic drift.

6. **Technical integrity**
   - Preserve placeholders;
   - preserve protected tokens;
   - preserve ICU structure where required;
   - do not translate stable IDs or technical syntax.

7. **Bethesda ownership**
   - If the dispute depends on an official game term, mark it as Bethesda-dependent and defer final canonical terminology to Parcels C/D.

---

# Decision classes

Every row must receive one of these decisions:

```text
ACCEPT_CODEX
ACCEPT_DEEPL
REWRITE
AUTO_ACCEPT_AGREEMENT
DEFER_BETHESDA
```

Use them as follows.

## AUTO_ACCEPT_AGREEMENT

Codex and DeepL are exactly identical, no placeholder/token problem exists, and the message is not dependent on unresolved Bethesda terminology.

## ACCEPT_CODEX

Codex is semantically/contextually better and no rewrite is needed.

## ACCEPT_DEEPL

DeepL is semantically/contextually better **after restoring application syntax as necessary**.

Do not paste damaged DeepL placeholders/ICU syntax verbatim.

## REWRITE

Neither translation is satisfactory, or a hybrid/new phrasing is better.

Provide a final proposed Japanese translation plus rationale.

## DEFER_BETHESDA

The unresolved choice depends on official Starfield Japanese terminology and should remain provisional until C/D.

Examples may include:

- X-Tech;
- Cargo Pad;
- Inter-System cargo terminology;
- Outpost;
- official Starfield skill names;
- Bethesda-owned resource/product/body/system/biome/species terms.

For these rows:

- do not invent a canonical official term;
- retain the current provisional tracker rendering for runtime continuity unless a clearly better tracker-only phrasing is needed;
- record the exact Bethesda terminology dependency.

---

# Review priority

Do not spend equal effort on all 330 rows.

Use this priority order:

## Tier 1 — mandatory deep review

Review all:

- 87 HIGH-risk rows;
- all Bethesda-dependent rows;
- all 20 placeholder-damaged DeepL rows;
- all 2 protected-token-damaged rows;
- all 4 ICU-syntax-damaged rows;
- destructive confirmations;
- accessibility instructions;
- validation/remediation messages;
- Planned Supply semantics;
- Present / Producing / Inputs / Logistics;
- harvesting vs extraction;
- Cargo Pad / Inter-System terminology;
- skill-name references.

## Tier 2 — substantive disagreements

Review MEDIUM/LOW rows where Codex and DeepL differ in:

- meaning;
- grammatical role;
- state semantics;
- action direction;
- technical nuance;
- UI interpretation.

## Tier 3 — stylistic-only disagreements

For minor punctuation, spacing, or synonym variation:

- prefer consistency with the glossary and nearby messages;
- do not over-invest usage unless there is a real semantic issue.

## Tier 4 — exact agreements

Auto-accept unless:

- Bethesda terminology is embedded;
- a protected syntax concern exists;
- the English source itself is ambiguous.

---

# Required comparison record

Create a working adjudication CSV under:

`D:\Projects\starfield-outpost-network\.local-work\translation\jp`

Recommended filename:

`ja-JP-adjudication.csv`

Columns:

```text
Key
English
Context
Risk
CodexJapanese
DeepLJapanese
Decision
FinalJapanese
Confidence
Reason
BethesdaDependency
PlaceholderOrSyntaxIssue
Category
```

Use:

```text
Confidence = HIGH | MEDIUM | LOW
```

Recommended categories:

```text
TRACKER_CONCEPT
VALIDATION
ACCESSIBILITY
HISTORY
STATUS
DESTRUCTIVE_ACTION
TECHNICAL_TOKEN
BETHESDA_TERM
GENERAL_UI
HELP
```

`FinalJapanese` must be populated for all decisions except where a row is explicitly deferred and current provisional wording is retained.

If deferred, record that retained provisional wording in `FinalJapanese` and explain that the official term remains unresolved.

---

# High-risk concept rules

## Planned Supply

Do not adjudicate from the words alone.

Use the product definition:

> A virtual assertion that an item will eventually be supplied to the outpost, allowing downstream production/logistics to be designed before the real supply route exists.

It is **not**:

- stock currently held;
- reserved inventory;
- actual incoming cargo;
- a generic supply plan detached from the virtual-state feature.

Compare `供給予定`, `計画供給`, and any proposed rewrite against that actual meaning.

## Present

The concept is presence/existence at the outpost, not “current/now.”

Reject Japanese that means merely temporal “present/current.”

## Producing

The state means configured/active production, extraction, harvesting, or manufacturing in the tracker.

Do not imply throughput quantity.

## Inputs

Manufacturing/organic-production requirements.

Not keyboard/input-device terminology.

## Logistics

Means **actually configured on a routed export**, not merely exportable or available.

## Cargo Import / Export

Keep the distinction between:

- file import/export;
- cargo movement into/out of an outpost.

The current glossary distinction between `インポート`/`エクスポート` and `搬入`/`搬出` is intentional unless adjudication finds a strong reason to change it.

---

# Bethesda terminology handling

Do not let machine adjudication create unofficial canonical Starfield terminology.

Terms such as:

- `X-Tech`
- `X-Tech Power Cores`
- `Cargo Pad`
- `Inter-System`
- `Outpost`
- displayed Starfield skill names
- resources/products
- systems
- planets/moons
- biomes
- species

may already have official Japanese equivalents in Bethesda localization data.

Where a message depends on one of these:

1. adjudicate the tracker-owned grammar around the term;
2. mark the term as Bethesda-dependent;
3. defer final canonical game terminology to Parcels C/D;
4. avoid hard-coding an unofficial machine-generated replacement into messages where the runtime reference-name layer should eventually supply the official value.

If a term is currently embedded directly in a tracker message rather than supplied as a parameter, flag it explicitly for C/D review.

---

# Third-model / independent reasoning pass

Because there is no human Japanese reviewer, use a second reasoning pass for difficult rows.

For Tier 1 rows:

- perform an independent review pass that does not merely rubber-stamp the first adjudication;
- compare:
  - English source;
  - product/context definition;
  - Codex Japanese;
  - DeepL Japanese;
  - glossary;
  - syntax/protected-token constraints.

The second pass should answer:

```text
Which is best: Codex, DeepL, or neither?
Why?
What exact final Japanese is recommended?
What risk remains?
Does this depend on Bethesda official terminology?
```

If the second pass disagrees materially with the first:

- mark confidence MEDIUM or LOW;
- record the disagreement;
- do not hide the uncertainty.

Do not use DeepL again as the second adjudicator; DeepL is already one of the source signals.

---

# Mechanical syntax protection

For every accepted/rewrite result:

- restore original interpolation placeholder identifiers exactly;
- restore ICU plural/select syntax exactly;
- preserve protected tokens exactly;
- preserve ASCII braces in placeholders;
- preserve semantic key identity.

The final catalogue must pass the same B1 completeness and parameter-parity tests.

Do not trust DeepL output mechanically.

---

# Catalogue application

After adjudication is complete:

- update `src/localization/locales/ja-JP.ts` only with adjudicated changes;
- keep semantic keys unchanged;
- do not modify `en-US`;
- do not modify reference-name data;
- do not add Bethesda Japanese overlays;
- do not change app architecture.

If the adjudication determines that some current glossary choices should change, update:

`docs/localization/JAPANESE-GLOSSARY.md`

with the final tracker-owned terminology decisions.

Do not promote Bethesda-dependent terms to “approved” until official localization evidence exists.

---

# Durable B3 review report

Create:

`docs/audits/codex-japanese-translation-review.md`

This file **must be committed later** as the durable audit trail.

It should include:

1. Executive summary
2. Inputs used
3. Review method
4. Decision counts
5. Confidence counts
6. Exact-agreement handling
7. High-risk adjudications
8. Planned Supply decision
9. Present / Producing / Inputs / Logistics decisions
10. Validation/accessibility findings
11. Placeholder/protected-token repairs
12. Bethesda-dependent unresolved terminology
13. Glossary changes
14. Catalogue changes made
15. Remaining uncertainties
16. Recommendation for B4
17. Explicit statement that no human Japanese review was available.

Do not include all 330 rows in the durable report if the working adjudication CSV already preserves row-level detail.

Summarize patterns and list the important exceptions.

---

# Provenance / third-party ledger

Update `docs/THIRD-PARTY-REFERENCES.md` so DeepL's role is no longer merely “planned.”

Record accurately:

- DeepL used as an independent English-source Japanese translation signal for Parcel B2;
- output compared against the Codex B1 translation in B3;
- DeepL is not a runtime dependency;
- DeepL output was not blindly imported;
- application placeholders/ICU/protected tokens required independent validation;
- Bethesda-owned terminology was not treated as canonical based on DeepL.

If another external model/tool is actually used during B3, add it to the ledger with its exact role.

Do not invent attribution obligations.

---

# Tests after catalogue updates

Run/extend tests for:

- all 330 Japanese keys present;
- exact placeholder parity;
- protected token preservation;
- ICU syntax integrity;
- representative HIGH-risk messages;
- locale rendering;
- existing Japanese selector behavior;
- document language;
- review-package generation if affected.

Do not rewrite unrelated tests.

---

# Verification

Run at minimum:

```text
npm run localization:review
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

Also perform a targeted browser smoke test in Japanese after applying adjudicated changes.

Do not begin Parcel E layout/font work.

Record visible issues only.

Do not commit or push.

---

# Final report to user

Report:

- total adjudicated rows;
- decision counts:
  - AUTO_ACCEPT_AGREEMENT
  - ACCEPT_CODEX
  - ACCEPT_DEEPL
  - REWRITE
  - DEFER_BETHESDA
- confidence counts;
- number of `ja-JP.ts` strings changed;
- important terminology decisions;
- unresolved Bethesda-dependent terms;
- placeholder/token/ICU repairs;
- glossary changes;
- durable audit path;
- working adjudication CSV path;
- verification results;
- browser smoke-test result;
- confirmation that no reference-name overlay or BA2 extraction work was done.

---

# Acceptance criteria

B3 is complete when:

- all 330 tracker messages have an adjudication decision;
- every HIGH-risk row received deliberate review;
- difficult HIGH-risk rows received a second independent reasoning pass;
- final tracker-owned terminology is documented;
- Bethesda-owned terminology remains explicitly provisional where official evidence is still pending;
- syntax/protected-token damage from DeepL is repaired or rejected;
- `ja-JP.ts` reflects only adjudicated final choices;
- glossary is updated consistently;
- `docs/audits/codex-japanese-translation-review.md` exists;
- `docs/THIRD-PARTY-REFERENCES.md` records the actual DeepL role;
- the working adjudication CSV remains under `.local-work\translation\jp` and is not committed;
- all tests/build/lint/reference checks pass;
- no persistence/schema change occurs;
- no Bethesda BA2/string extraction or reference-name overlay is implemented;
- no commit or push is performed.
