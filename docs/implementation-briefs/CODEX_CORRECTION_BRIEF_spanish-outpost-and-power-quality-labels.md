# Codex Correction Brief — Spanish Outpost Terminology and Power-Quality Label Corrections

## Objective

Perform a narrow semantic-catalogue correction pass for the newly runtime-integrated Spanish, Italian, and Brazilian Portuguese locales.

Two issues must be corrected before the runtime-integration stage is committed:

1. Spanish `Outpost` terminology has drifted from the approved official tracker term `Puesto` / `puestos` into `puesto avanzado` / `puestos avanzados` across multiple semantic rows.
2. The compact `power.label.good` value is semantically wrong in all three new locales:
   - Spanish: `Producto`
   - Italian: `Merce`
   - Brazilian Portuguese: `Bem`

These are semantic-catalogue corrections only.

Do not alter runtime-integration architecture, browser mapping, search behavior, reference overlays, UI geometry, CSS, or any unrelated adjudication.

Do not commit or push unless explicitly instructed.

---

# Primary authority

Use the current approved terminology/glossary artifacts as authoritative.

Relevant sources include:

```text
docs/localization/SPANISH-GLOSSARY.md
docs/localization/ITALIAN-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md

reference-source/official-terminology-values-es-ES.csv
reference-source/official-terminology-values-it-IT.csv
reference-source/official-terminology-values-pt-BR.csv

docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv

src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

The review CSV remains the durable adjudication evidence.

Generated final catalogues must be regenerated from corrected review evidence rather than hand-edited independently.

---

# 1. Spanish Outpost terminology correction

## Approved term

The Spanish glossary establishes:

```text
Outpost -> Puesto
plural  -> puestos
```

with official Bethesda evidence.

`puesto avanzado` is not the approved tracker term.

The current Spanish semantic catalogue contains multiple `puesto avanzado` / `puestos avanzados` strings introduced during DeepL adjudication.

This contradicts the glossary constraint:

```text
term.outpost=Puesto
```

even where reviewer notes claimed terminology compliance.

---

## Required scope

Systematically audit **every Spanish semantic row constrained by `term.outpost`**.

Do not merely patch the currently visible examples.

Identify all rows where the final translation uses:

```text
puesto avanzado
puestos avanzados
```

or another wording that materially departs from the approved `Puesto` concept.

Expected affected areas may include:

- Outpost navigation;
- Add/Delete Outpost controls;
- default outpost name;
- Outpost Details labels/headings;
- Search labels/results;
- shortcut labels;
- history messages;
- validation messages;
- fatal/report text;
- any other semantic row carrying the outpost terminology constraint.

Use the review metadata/constraint set to define the authoritative row population.

---

## Correction rule

For each affected Spanish row:

- preserve the approved concept `puesto` / `puestos`;
- rewrite the surrounding sentence naturally in Spain Spanish;
- adjust articles, prepositions, gender/number, and word order as required;
- do not perform blind string replacement;
- do not introduce Latin-American regional wording;
- do not change official reference names or canonical IDs.

If a specific row genuinely cannot use `puesto` naturally without changing the intended meaning, flag:

```text
GLOSSARY_RECONSIDERATION_REQUIRED
```

with a precise explanation.

Do not silently retain `puesto avanzado` as an exception.

---

## Adjudication evidence

For every corrected row in:

```text
docs/localization/es-ES-review.csv
```

update as necessary:

```text
AdjudicationDecision
FinalTranslation
ReviewerNote
```

Do not change:

```text
EnglishSource
EnglishSourceSha256
Context
Risk
Parameters
ProtectedTokens
OfficialTermConstraints
CodexTranslation
DeepLTranslation
ComparisonStatus
```

unless a direct inconsistency is discovered.

The reviewer note must explicitly explain the terminology correction where the previous final value contradicted `term.outpost=Puesto`.

Use the appropriate decision code based on the frozen witnesses:

```text
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
AGREED
```

Do not force a particular code merely to simplify statistics.

If the corrected final string differs from both frozen witnesses, use:

```text
CUSTOM
```

with a decision-specific rationale.

---

# 2. Spanish compact power-quality label

Key:

```text
power.label.good
```

English source:

```text
Good
```

Current incorrect final value:

```text
Producto
```

This is the noun sense “product/good”, not the qualitative rating.

The corresponding full quality term is already:

```text
power.quality.good -> Bueno
```

Correct the compact label to an appropriate Spanish qualitative form consistent with the power-quality scale.

Expected value:

```text
Bueno
```

unless existing grammatical UI context clearly requires another gendered form.

Do not shorten it merely for geometry.

Update:

```text
docs/localization/es-ES-review.csv
src/localization/locales/es-ES.ts
```

through the normal review-to-catalogue generation path.

Reviewer rationale should explicitly note that the previous DeepL choice used the wrong lexical sense of English `Good`.

---

# 3. Italian compact power-quality label

Key:

```text
power.label.good
```

Current incorrect value:

```text
Merce
```

This means merchandise/goods and is the wrong lexical sense.

The corresponding full quality term is:

```text
power.quality.good -> Buono
```

Correct the compact label to:

```text
Buono
```

unless the actual control grammar requires a different inflected form.

Update the Italian review evidence and regenerate the catalogue deterministically.

Reviewer rationale should identify this as a word-sense correction.

Do not alter any other Italian semantic row unless directly required by validation.

---

# 4. Brazilian Portuguese compact power-quality label

Key:

```text
power.label.good
```

Current value:

```text
Bem
```

This is not the intended adjectival quality label.

The corresponding full quality term is:

```text
power.quality.good -> Bom
```

Correct the compact label to:

```text
Bom
```

unless the actual control grammar requires a different inflected form.

Update the Brazilian Portuguese review evidence and regenerate the catalogue deterministically.

Reviewer rationale should identify the previous choice as the wrong word class/sense for a quality rating.

---

# 5. Power-label consistency audit

While correcting `power.label.good`, perform a **bounded semantic consistency check** of the compact power-quality label family in all three new locales:

```text
power.label.veryPoor
power.label.poor
power.label.normal
power.label.good
power.label.none
power.label.unknown
```

Compare them against:

```text
power.quality.*
```

The goal is only to detect obvious lexical-sense errors or accidental semantic mismatches.

Do not reopen stylistic choices merely because compact and full labels are not identical.

Do not shorten long labels for fit.

If no concrete semantic defect exists beyond `power.label.good`, leave the other rows unchanged.

---

# 6. Preserve geometry freeze

The live UI has already shown long Solar/Wind labels in the new locales.

Do not respond by changing:

- button width/height;
- font size;
- line height;
- padding;
- margins;
- grid/flex geometry;
- breakpoints;
- wrapping behavior;
- colors;
- typography.

Long-label presentation remains a later QA/layout issue.

This correction is semantic only.

---

# 7. Preserve runtime integration

Do not change:

- locale selector entries;
- `runtimeAvailable`;
- browser mapping;
- preference persistence;
- `document.lang`;
- search folding;
- Italian apostrophe equivalence;
- English aliases;
- collation;
- shortcut speech;
- reference overlay registration.

The runtime-integration implementation is not being reopened.

All three locales must remain active exactly as before.

---

# 8. Preserve global known UX defects

Do not modify unrelated global issues observed during smoke testing:

- intermittent missing Resource Matrix focus indicator after shortcuts;
- Cargo Link Undo collapsing unrelated expanded links;
- focused content occlusion by fixed page chrome;
- long Solar/Wind labels.

Those remain separate backlog/QA concerns.

---

# 9. Generated catalogue regeneration

After correcting the review evidence, regenerate:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

through the established deterministic generation path.

Italian and Brazilian Portuguese should change only for `power.label.good` unless validation reveals a direct dependent issue.

Spanish will likely contain multiple `Outpost` terminology corrections plus `power.label.good`.

Do not hand-edit generated catalogue output without corresponding review evidence.

---

# 10. Add regression tests

Add focused regression coverage so these specific semantic failures cannot recur unnoticed.

At minimum verify:

## Spanish outpost terminology

For every Spanish row carrying the `term.outpost` constraint:

- the final semantic catalogue does not contain unapproved `puesto avanzado` / `puestos avanzados` wording unless a documented context exception exists;
- the approved `Puesto` semantic concept remains represented correctly.

Prefer a constraint-aware test over a brittle hand-maintained key list.

Do not require every sentence to contain the exact standalone substring `puesto`; valid grammatical variation may apply.

The test should catch the specific prior contradiction between reviewer-note constraint compliance and final terminology.

## Power quality

Assert:

```text
es-ES power.label.good == Bueno
it-IT power.label.good == Buono
pt-BR power.label.good == Bom
```

and ensure these retain the same qualitative sense as their corresponding `power.quality.good` values.

---

# 11. Review evidence integrity

After corrections, verify:

- all review CSV rows remain complete;
- adjudication decisions match final translations;
- reviewer notes are decision-specific;
- no source/context/hash/constraint drift;
- final catalogue remains reconstructible exactly from review CSV;
- no DeepL-returned XLIFF is modified or committed;
- deterministic repository XLIFF handoffs remain unchanged.

---

# 12. Runtime smoke check

Perform a bounded smoke test after regeneration.

Verify:

- Spanish locale now shows `Puesto`-based tracker terminology rather than `Puesto avanzado` where affected;
- Spanish/Italian/Portuguese Solar/Wind `Good` state displays the corrected qualitative term;
- all three locales remain selectable;
- existing locales remain selectable;
- no runtime error appears;
- no state loss occurs when switching locale.

Do not perform the full release-closure QA matrix yet.

---

# 13. Verification

Run the full relevant suite.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run reference:build

npm run localization:provenance:test
npm run localization:provenance:verify

npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE
npm run localization:terminology:verify -- --locale es-ES
npm run localization:terminology:verify -- --locale it-IT
npm run localization:terminology:verify -- --locale pt-BR

npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE
npm run localization:reference-names:verify -- --locale es-ES
npm run localization:reference-names:verify -- --locale it-IT
npm run localization:reference-names:verify -- --locale pt-BR

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE
npm run localization:verify -- --locale es-ES
npm run localization:verify -- --locale it-IT
npm run localization:verify -- --locale pt-BR

npm run build
npm run lint
git diff --check
```

Also run targeted tests for:

- Spanish outpost terminology compliance;
- corrected power labels;
- review-to-catalogue determinism;
- accidental-English validation;
- placeholder/plural/protected-token integrity.

---

# 14. Diff review

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- Spanish semantic corrections are limited to `Outpost` terminology plus `power.label.good`;
- Italian semantic correction is limited to `power.label.good`;
- Brazilian Portuguese semantic correction is limited to `power.label.good`;
- no glossary values were changed unless a genuine reconsideration was explicitly reported;
- no runtime integration code changed unnecessarily;
- no CSS/UI geometry changes;
- no reference overlay changes;
- no browser mapping/search/collation/speech changes;
- no commit/push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Spanish outpost-constrained row count audited;
4. Spanish rows corrected from `puesto avanzado` / `puestos avanzados`;
5. final Spanish outpost terminology summary;
6. any Spanish context exceptions retained and why;
7. Spanish `power.label.good` final value/decision/rationale;
8. Italian `power.label.good` final value/decision/rationale;
9. Brazilian Portuguese `power.label.good` final value/decision/rationale;
10. compact power-label consistency audit result;
11. review-decision distribution deltas caused by the correction;
12. regression tests added;
13. review-to-catalogue determinism result;
14. semantic key/placeholder/plural/protected-token validation;
15. accidental-English result;
16. runtime smoke result;
17. confirmation selector/browser mapping/search/collation/speech unchanged;
18. confirmation no UI/CSS/geometry changes;
19. existing-locale regression results;
20. build/lint/test results;
21. `git diff --check` result;
22. deviations from the brief;
23. remaining blockers before manual release-closure QA;
24. readiness recommendation for committing the runtime-integration stage;
25. suggested commit message if commit-ready.

Do not commit or push unless explicitly instructed.
