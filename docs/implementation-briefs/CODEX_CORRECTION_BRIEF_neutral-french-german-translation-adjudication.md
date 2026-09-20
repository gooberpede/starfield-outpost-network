# Codex Correction Brief — Neutral French/German Translation Adjudication

## Objective

Correct the French/German semantic-catalogue adjudication so that substantive disagreements between Codex and DeepL are reviewed **neutrally**, rather than being resolved by a default source preference.

The existing implementation has strong review/XLIFF infrastructure, valid DeepL evidence capture, complete draft catalogues, and useful context metadata. Preserve that work.

The correction is narrowly focused on:

- removing source-preference bias from adjudication;
- re-reviewing all substantive disagreements;
- requiring auditable rationale for substantive decisions;
- preserving current placeholder/token safety;
- keeping French/German inactive at runtime;
- retaining Japanese behavior unchanged.

Do not redo the translation pipeline from scratch.

Do not commit or push unless explicitly instructed.

---

## Naming rule

Planning identifiers used in discussion must not leak into repository-facing names.

Do not use names such as:

```text
correction parcel
parcel
phase
```

in:

- source identifiers;
- filenames;
- test names;
- comments;
- commit messages.

Use descriptive names such as:

```text
translation adjudication
review decision
semantic review
```

---

## Primary problem to correct

The current adjudication implementation is not neutral.

Its effective default is:

```text
FinalTranslation = DeepLTranslation
```

unless a special case or override applies.

That is not acceptable.

The product decision is:

> DeepL and Codex are independent candidate translations. Neither is the default winner.

For every substantive disagreement, the final translation must be selected editorially against:

- English source meaning;
- UI context;
- risk classification;
- approved glossary terminology;
- official Bethesda terminology constraints;
- target-language grammar;
- message role;
- consistency with related messages.

The valid final result may be:

```text
Codex wording
DeepL wording
third/custom wording
```

but it must not be determined by source identity alone.

---

# Preserve the good work already present

Do not discard or rebuild the current:

- `fr-FR` review CSV;
- `de-DE` review CSV;
- DeepL XLIFF artifacts;
- Codex drafts;
- DeepL raw evidence;
- placeholder/protected-token validation;
- comparison-state machinery;
- risk metadata;
- context metadata;
- glossary constraints;
- final catalogue generation;
- French/German catalogue files;
- Japanese catalogue/runtime behavior;
- runtime-exposure guard.

Use the existing evidence to perform a better adjudication pass.

---

# 1. Remove blanket DeepL preference

Refactor the adjudication path so there is no logic equivalent to:

```ts
let final = deeplTranslation
```

followed by a list of exceptions.

Likewise, do not replace it with:

```ts
let final = codexTranslation
```

plus exceptions.

The implementation should make it impossible for source preference to determine the answer implicitly.

A useful shape may be:

```text
review row
    -> explicit adjudication decision
    -> selected source or custom wording
    -> reason
```

Exact implementation is up to Codex.

The key requirement is that **every substantive disagreement receives an explicit decision**.

---

# 2. Re-adjudicate every substantive disagreement

Re-review all rows where:

```text
ComparisonStatus = SUBSTANTIVE
```

for both locales.

Current counts from the prior summary were:

```text
fr-FR: 248 substantive
de-DE: 228 substantive
```

Recalculate from the actual current review files rather than hard-coding those numbers.

For each substantive row, decide the final translation against the approved criteria.

Do not preserve an existing final merely because it is already present.

Treat the current final value as a candidate that must be justified.

---

# 3. Review all HIGH-risk rows independently

Every HIGH-risk row must be explicitly reviewed even when:

```text
CodexTranslation == DeepLTranslation
```

Agreement reduces concern but does not prove correctness.

HIGH-risk review should consider:

- ambiguity;
- tracker-specific semantics;
- official terminology constraints;
- placeholders;
- plural/message syntax;
- accessibility role;
- compact UI label sense;
- contrast with neighboring concepts.

If Codex and DeepL agree but the shared wording is wrong in context, replace it with a better final translation.

---

# 4. Reviewer notes are required for substantive disagreements

For every `SUBSTANTIVE` disagreement, `ReviewerNote` must contain meaningful rationale.

Do not leave it blank.

Do not use only a generic sentence such as:

```text
Reviewed against the English source, UI context, risk metadata, and approved terminology.
```

unless the note also records the actual reason for the selected wording.

A useful note should say, for example:

```text
DeepL chosen because it preserves the locative sense and matches the approved glossary term; Codex wording sounds temporal.
```

or:

```text
Codex chosen because DeepL mistranslates the tracker-specific logistics state as general transportation.
```

or:

```text
Custom wording used because both drafts are grammatical but neither fits the compact status-label role.
```

The note does not need to be long, but it must be decision-specific.

---

# 5. Record decision provenance explicitly

Add or use an explicit review field to classify the adjudication result.

Preferred semantic values:

```text
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Exact names may follow current conventions.

The review artifact should make it possible to answer:

```text
Which source won?
Why?
Was the final custom?
Was DeepL invalid because tokens/placeholders were damaged?
```

Do not infer this later from string equality alone.

If adding a new CSV column would create excessive churn, use an existing structured field if one already serves this purpose, but the result must be machine-auditable.

---

# 6. Invalid DeepL-token rows

Preserve the current strict safety behavior.

Where DeepL output damaged:

- placeholders;
- protected tokens;
- identifiers;
- XLIFF inline tags;

retain the raw DeepL wording as review evidence if useful, but do not treat it as a valid candidate without repair.

For these rows:

- independently determine the final wording;
- record that the DeepL candidate was invalid;
- preserve exact placeholders/protected tokens;
- explain the repair/replacement in the reviewer note.

Do not silently sanitize a malformed DeepL translation and then call it a valid DeepL win.

---

# 7. Important tracker-specific terms

Pay special attention to terse or overloaded concepts including:

```text
Present
Producing
Inputs
Logistics
Planned Supply
Resource Matrix
Reshuffle
Lock
Inorganic
Organic
Validation
Manufacturing
```

Use the approved French/German glossaries and context notes.

Examples of required sense fidelity:

```text
Present
= exists at this outpost/location
≠ temporal "currently"
```

```text
Lock
= application action that fixes/restricts the relevant ordering/state
≠ physical lock / login / security lock
```

```text
Inputs
= Resource Matrix production inputs
≠ generic UI data-entry "inputs"
```

Do not choose a draft simply because it is shorter.

---

# 8. Neutrality regression tests

Add durable tests that prevent a future default-source preference.

Do **not** test for a required numerical balance between Codex and DeepL.

A 50/50 split is not the goal.

Instead test the adjudication architecture.

Useful assertions may include:

- substantive rows require explicit adjudication;
- no substantive row may reach final catalogue generation without a decision;
- no adjudication function initializes the result from one candidate source as a fallback;
- `CUSTOM` decisions are supported;
- Codex and DeepL selections are both supported;
- invalid DeepL evidence cannot become final without explicit repair/replacement;
- substantive rows require non-empty decision-specific reviewer notes.

Use implementation-level tests rather than brittle source-code string searches where practical.

---

# 9. Produce bias/audit statistics

At completion, report per locale:

```text
total rows
identical
typographic-only
substantive
invalid DeepL evidence
final from Codex
final from DeepL
final custom
invalid-DeepL repaired/replaced
```

Also report:

```text
substantive rows with reviewer notes
HIGH-risk rows reviewed
terminology-constrained rows reviewed
parameterized rows reviewed
```

These statistics are diagnostic only.

Do not force a target distribution.

A lopsided result is acceptable if the row-level editorial evidence supports it.

---

# 10. Spot-check methodology

In addition to the full scripted adjudication pass, manually inspect a representative sample from:

- short one-word labels;
- long help text;
- validation messages;
- accessibility text;
- plural/parameterized messages;
- terminology-constrained rows;
- French grammar-sensitive rows;
- German compound/long-label rows;
- invalid DeepL-token rows;
- rows where final source differs from the previous implementation.

Document representative findings in the completion response.

---

# 11. Glossary changes

If re-adjudication reveals that an approved tracker-owned glossary term is consistently awkward in real message context:

- do not silently diverge message-by-message;
- flag the glossary entry;
- update it deliberately;
- rerun affected rows.

Official Bethesda-backed terms remain authoritative unless the glossary already marks them as contextual rather than standalone.

Report any glossary changes.

If none are needed, say so.

---

# 12. Catalogue regeneration

After neutral adjudication:

- regenerate `fr-FR` catalogue from approved final translations;
- regenerate `de-DE` catalogue from approved final translations;
- preserve exact `en-US` key parity;
- preserve placeholder parity;
- preserve plural syntax;
- preserve protected tokens;
- keep no empty values.

Do not manually edit catalogue files independently of the approved review artifacts if the current workflow can generate them deterministically.

The review artifact should remain the durable editorial source of truth.

---

# 13. Runtime exposure remains unchanged

Do not expose French or German yet.

Verify:

- absent from locale selector;
- absent from browser automatic resolution;
- absent from active runtime locale registry;
- absent from reference-name overlay registration;
- persisted preference behavior unchanged.

Japanese must continue to present exactly as before.

---

# 14. Documentation

Update `docs/localization/LOCALE-ONBOARDING.md` only if the correction establishes a durable adjudication rule that is not already documented.

The durable rule should be:

> Independent machine-translation sources are evidence, not authorities. Substantive disagreements require explicit editorial adjudication and rationale; no source is the default winner.

Do not add implementation-history diary content.

Do not mark French/German fully supported.

---

# 15. Verification

Run at minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:provenance:test
npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run build
npm run lint
git diff --check
```

Also run all new/updated adjudication and catalogue-closure tests.

Full French/German locale closure may still correctly fail because official reference-name overlays do not yet exist.

That is expected.

---

# Scope guard

Do not:

- generate official reference-name overlays;
- perform composed-fauna proof;
- expose French/German at runtime;
- alter search behavior;
- alter layout/CSS;
- add browser locale mapping;
- generalize shortcut spoken-chord behavior;
- change persistence/schema;
- redesign localization architecture;
- redo official terminology extraction;
- redo DeepL translation from scratch unless the existing evidence is unusable.

This is an adjudication correction, not a new translation project.

---

# Completion response

Return:

1. branch;
2. files changed;
3. adjudication logic changes;
4. French comparison/adjudication statistics;
5. German comparison/adjudication statistics;
6. count of substantive rows with explicit reviewer notes;
7. HIGH-risk review completion;
8. invalid DeepL-token handling summary;
9. representative examples where:
   - Codex won;
   - DeepL won;
   - custom wording won;
10. glossary changes, if any;
11. final French catalogue closure;
12. final German catalogue closure;
13. Japanese regression result;
14. runtime-exposure guard result;
15. verification results;
16. any remaining editorial uncertainties;
17. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
