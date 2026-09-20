# Codex Correction Brief — Official Skill-Name Adjudication Corrections for Spanish and Brazilian Portuguese

## Objective

Correct three final semantic-catalogue adjudication decisions that conflict with already verified official Starfield skill names.

This is a **narrow correction pass**.

Do not reopen the broader Spanish/Italian/Brazilian Portuguese semantic review unless the correction itself exposes a concrete dependent defect.

Do not commit or push unless explicitly instructed.

---

## Affected locales

```text
es-ES
pt-BR
```

Italian requires no corresponding correction.

---

## Affected rows

Correct exactly these three semantic rows unless a direct dependency requires an adjacent generated artifact update:

```text
es-ES  character.skill.outpostEngineering
es-ES  character.skill.outpostManagement
pt-BR  character.skill.researchMethods
```

---

# 1. Spanish — Outpost Engineering

Key:

```text
character.skill.outpostEngineering
```

English source:

```text
Outpost Engineering
```

Verified official Starfield value:

```text
Ingeniería de puestos
```

The current final/adjudicated wording incorrectly uses:

```text
Ingeniería de puestos avanzados
```

This expands the official Starfield skill name and is not the approved terminology value.

Correct the final translation to:

```text
Ingeniería de puestos
```

Use the already approved official terminology evidence and glossary constraint.

The adjudication decision must be updated so it is consistent with the final value and the two witnesses.

If the Codex witness already exactly equals:

```text
Ingeniería de puestos
```

then the final decision should normally be:

```text
CODEX
```

with a decision-specific reviewer note explaining that the verified official Starfield skill name must be preserved and that the DeepL wording added `avanzados`, changing the official name.

Do not use `DEEPL`.

Do not classify this as a stylistic preference.

This is official terminology preservation.

---

# 2. Spanish — Outpost Management

Key:

```text
character.skill.outpostManagement
```

English source:

```text
Outpost Management
```

Verified official Starfield value:

```text
Gestión de puestos
```

The current final/adjudicated wording incorrectly uses:

```text
Gestión de puestos avanzados
```

Correct the final translation to:

```text
Gestión de puestos
```

As above, if the Codex witness already matches the official value, use:

```text
CODEX
```

and write a row-specific reviewer note explaining that the DeepL version added `avanzados`, which changes the official skill name.

Do not use `DEEPL`.

---

# 3. Brazilian Portuguese — Research Methods

Key:

```text
character.skill.researchMethods
```

English source:

```text
Research Methods
```

Verified official Starfield value:

```text
Métodos de Pesquisa
```

The current final value uses:

```text
Métodos de pesquisa
```

For ordinary prose, sentence-case reasoning may be valid, but this row is specifically a Starfield skill label.

Preserve the official skill-name capitalization:

```text
Métodos de Pesquisa
```

Update the adjudication decision and reviewer note consistently with the witnesses.

If the Codex witness already exactly matches the official value, the expected decision is:

```text
CODEX
```

with a reviewer note stating that this row is a named Starfield skill label and therefore preserves the official title capitalization rather than applying general prose sentence-case guidance.

Do not treat this as a generic capitalization-style preference.

---

# 4. Source of authority

Use the existing official terminology artifacts and approved glossary constraints already in the repository.

Relevant authoritative artifacts include:

```text
reference-source/official-terminology-values-es-ES.csv
reference-source/official-terminology-values-pt-BR.csv
docs/localization/SPANISH-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md
```

Do not modify the official terminology values.

These corrections bring the semantic review back into conformance with those already approved artifacts.

---

# 5. Review CSV updates

Update:

```text
docs/localization/es-ES-review.csv
docs/localization/pt-BR-review.csv
```

For the three affected rows only, update as required:

```text
AdjudicationDecision
FinalTranslation
ReviewerNote
```

Do not alter:

```text
Key
Locale
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

No source/context/constraint change is expected.

---

# 6. Generated catalogue regeneration

Regenerate the final semantic catalogues from the corrected review evidence:

```text
src/localization/locales/es-ES.ts
src/localization/locales/pt-BR.ts
```

Italian should remain byte-identical unless the normal deterministic generation command rewrites it identically.

Do not hand-edit generated final catalogues independently of the review CSVs.

The review CSV remains the durable adjudication evidence.

---

# 7. Do not reopen unrelated adjudication

Do not revisit other rows merely because this correction pass is open.

In particular:

- do not rebalance Codex/DeepL decision counts;
- do not revise `CUSTOM` rows;
- do not revisit invalid-token repairs;
- do not alter glossary choices;
- do not perform broader capitalization cleanup;
- do not normalize all skill-name casing mechanically.

Only fix another row if the existing validators reveal a direct contradiction caused by these changes.

---

# 8. Runtime remains inactive

Do not activate:

```text
es-ES
it-IT
pt-BR
```

No changes to:

- locale selector;
- browser mapping;
- runtime registry;
- reference overlays;
- search;
- collation;
- shortcut speech;
- `document.lang`;
- persistence acceptance.

No UI/CSS changes.

---

# 9. Verification

Run the relevant semantic-review and regression checks.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run localization:provenance:test
npm run localization:provenance:verify

npm run localization:terminology:verify -- --locale es-ES
npm run localization:terminology:verify -- --locale pt-BR

npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE

npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE

npm run build
npm run lint
git diff --check
```

Also verify:

- all three corrected rows validate;
- final catalogues remain exactly reconstructible from review CSVs;
- `es-ES` and `pt-BR` retain exact key parity;
- placeholders/protected tokens/plural syntax remain valid;
- accidental-English detector remains green;
- Italian review/catalogue remains unchanged;
- runtime remains unchanged.

Full localization closure for the three staged locales may still stop at the expected missing reference-name artifact gate.

Do not weaken that gate.

---

# 10. Expected decision-count changes

Do not optimize for exact totals, but report the before/after distribution impact caused by the three corrected rows.

Expected qualitative effect:

```text
Spanish:
  two rows move away from DEEPL
  likely into CODEX

Brazilian Portuguese:
  one row moves away from its current decision
  likely into CODEX
```

If the actual witnesses imply a different valid decision code, explain why.

The final translation values are the authoritative requirement.

---

# 11. Diff review

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- only the intended review evidence, generated catalogue output, and any unavoidable deterministic metadata/test artifact changed;
- no unrelated adjudication changed;
- no glossary changed;
- no runtime activation;
- no returned DeepL XLIFF added;
- no UI/CSS change;
- no commit/push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. corrected Spanish `character.skill.outpostEngineering` final value and decision;
4. corrected Spanish `character.skill.outpostManagement` final value and decision;
5. corrected Brazilian Portuguese `character.skill.researchMethods` final value and decision;
6. reviewer-note rationale for each;
7. Spanish decision-distribution delta;
8. Brazilian Portuguese decision-distribution delta;
9. confirmation no other adjudication rows changed;
10. final catalogue regeneration result;
11. review-to-catalogue determinism result;
12. key/placeholder/plural/protected-token validation result;
13. accidental-English validation result;
14. Italian unchanged confirmation;
15. current-locale regression results;
16. build/lint/test results;
17. `git diff --check` result;
18. confirmation runtime remains inactive for all three staged locales;
19. confirmation no glossary/UI/CSS/reference-overlay/browser-mapping changes;
20. confirmation no commit or push occurred;
21. readiness recommendation for committing the complete semantic-catalogue stage.

Do not commit or push unless explicitly instructed.
