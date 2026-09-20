# Codex Correction Brief — Spanish, Italian, and Brazilian Portuguese Semantic Draft Cleanup Before DeepL Adjudication

## Objective

Correct the first-half semantic-review artifacts for:

```text
Spanish (Spain)        es-ES
Italian                it-IT
Portuguese (Brazil)    pt-BR
```

before proceeding to DeepL import/adjudication.

This correction exists because the initial Codex drafts contain a non-trivial number of mixed-language strings with leftover English, and the current plural validator is not strict enough to catch all malformed localized ICU-like plural syntax.

The three DeepL-returned XLIFF files must **not** be used as input to this correction.

The purpose is to restore the intended independence of the Codex witness, strengthen validation, and regenerate the deterministic review/XLIFF handoff artifacts.

Do not commit or push.

---

# Critical independence rule

The returned DeepL files must not influence this correction.

Do not inspect, parse, import, compare against, or derive wording from any DeepL-returned XLIFF in this task.

Use only:

- current `en-US` semantic source;
- approved locale glossaries;
- approved terminology constraints;
- existing review context/risk metadata;
- current Codex drafts;
- repository tests and tooling.

The corrected Codex drafts must remain an independent translation witness.

The existing DeepL outputs will be imported later under a separate adjudication task.

---

# Known defect class 1: mixed-language Codex draft strings

The initial drafts contain strings that are partially translated but retain ordinary English words.

Representative examples observed during review include patterns like:

```text
Spanish
Finish reordenación de enlaces de cargamento
Mostrar/hide Navigation
Buscar resources or products
Borrar character nivel
Exportar all networks to JSON

Italian
Finish riordino di collegamenti merci
Mostra/hide Navigation
Cerca resources or products
Cancella character livello
Esporta all networks to JSON

Portuguese
Finish reordenação de vínculos de carga
Mostrar/hide Navigation
Pesquisar resources or products
Limpar character nível
Exportar all networks to JSON
```

Other observed examples include mixed-language fragments in:

- destructive confirmations;
- schema/version messages;
- compact state labels;
- Search/help/accessibility text;
- network controls;
- import/export text.

These are examples of the defect class, not an exhaustive replacement list.

Do not merely patch the listed examples.

Perform a systematic review of all three 414-key drafts.

---

# 1. Review every Codex draft for accidental English residue

Inspect:

```text
src/localization/reviewDrafts/es-ES.ts
src/localization/reviewDrafts/it-IT.ts
src/localization/reviewDrafts/pt-BR.ts
```

For every locale:

- identify ordinary English words/phrases that should have been translated;
- distinguish real defects from legitimate protected/invariant tokens;
- correct mixed-language strings using the English source, approved glossary, and context;
- preserve placeholders and protected technical tokens exactly.

Do not translate legitimate invariants such as:

```text
Starfield
JSON
FormID
He-3
Ctrl
Esc
Shift
ID
```

or any other token explicitly preserved by current policy.

Do not use the DeepL output to decide wording.

---

# 2. Strengthen accidental-English detection

The previous validation incorrectly reported no ordinary English fallback despite the mixed-language strings above.

Improve the detector so this class of problem is materially harder to miss.

The detector should:

- operate on full-locale Codex drafts;
- ignore approved protected/invariant tokens;
- ignore placeholders and technical identifiers;
- detect suspicious ordinary English residue;
- avoid relying on one hard-coded list of the currently observed mistakes;
- produce actionable key/locale diagnostics.

A bounded curated English-word heuristic is acceptable if it is robust and documented.

Do not build a general language-detection framework.

Do not add network/API dependencies.

Prefer deterministic repository-local validation.

---

# 3. Avoid false positives

The detector must not reject legitimate values solely because they contain approved English-looking tokens.

At minimum preserve:

```text
Starfield
JSON
FormID
He-3
Ctrl
Esc
Shift
ID
X-Tech
```

and locale-approved invariant/official forms.

Also account for:

- file extensions;
- keyboard key names;
- technical abbreviations;
- placeholders;
- stable IDs;
- proper nouns that intentionally remain unchanged.

Add tests for both:

```text
should fail
should not fail
```

cases.

---

# 4. Fix plural validation generically

The current plural validator is too permissive.

It currently detects some malformed localized plural syntax through a blacklist-style check, but can miss forms such as:

```text
{count, plurale, un {...} altri {...}}
```

because the placeholder set may still appear superficially correct.

Do not add another locale word such as:

```text
plurale
```

to a blacklist.

Instead validate plural structure positively.

For every translation whose English source contains a supported plural expression:

- require the translation to contain the corresponding supported plural structure;
- require the same plural parameter name;
- require valid supported syntax;
- reject translated plural keywords/categories or structurally malformed variants.

The current supported contract is intentionally narrow.

Preserve the existing accepted format, conceptually:

```text
{count, plural, one {...} other {...}}
```

with the same parameter name.

Do not introduce a full ICU MessageFormat parser unless genuinely necessary.

Use existing helpers such as:

```text
pluralParametersOf()
parametersOf()
```

where practical.

---

# 5. Strengthen plural tests

Add regression tests proving malformed forms fail generically.

Include representative invalid examples modeled on possible machine-translation damage, such as localized variants of:

```text
plural
one
other
```

without making the validator locale-specific.

Test at minimum:

- valid unchanged plural syntax passes;
- localized plural keyword fails;
- localized category keyword fails;
- missing `other` fails;
- changed plural parameter name fails;
- ordinary non-plural placeholders still work;
- current Japanese/French/German catalogues remain valid.

---

# 6. Preserve the review/XLIFF schema

Do not redesign the review package.

Preserve:

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
AdjudicationDecision
FinalTranslation
ReviewerNote
```

At the end of this correction:

```text
CodexTranslation
```

should contain corrected independent drafts.

These fields must remain unpopulated/pre-adjudication:

```text
DeepLTranslation
AdjudicationDecision
FinalTranslation
ReviewerNote
```

and `ComparisonStatus` should remain the appropriate pre-DeepL state.

Do not import any DeepL content.

---

# 7. Regenerate review CSVs

Regenerate:

```text
docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv
```

from the corrected Codex drafts.

Verify:

- 414 rows each, or exact current `en-US` parity if the baseline count changed;
- zero empty Codex translations;
- zero imported DeepL translations;
- zero adjudicated rows;
- zero stale source hashes;
- zero stale glossary constraints;
- zero invalid placeholders/tokens/plurals;
- zero unapproved mixed-language residue under the strengthened detector.

---

# 8. Regenerate handoff XLIFFs

Regenerate:

```text
docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

using the corrected review metadata.

The files remain deterministic current handoff representations.

Important:

- these regenerated files are for repository consistency;
- the user does **not** need to resubmit them to DeepL;
- existing returned DeepL translations remain valid as independent translations of the same frozen English source/context;
- do not attempt to reconcile regenerated handoff target empties with returned DeepL content in this task.

---

# 9. Do not rerun DeepL

Do not:

- call DeepL;
- request another external translation;
- suggest that the user re-upload corrected handoffs merely because Codex draft wording changed.

The DeepL witness was generated independently from the English source/context.

Codex-draft corrections do not invalidate that witness.

Only if this correction changes:

```text
EnglishSource
EnglishSourceSha256
Context
OfficialTermConstraints
```

for a row should the completion response explicitly flag that row as potentially requiring external retranslation.

Avoid such source/context changes unless a genuine defect requires them.

---

# 10. Preserve glossaries unless genuinely contradicted

Do not revise:

```text
docs/localization/SPANISH-GLOSSARY.md
docs/localization/ITALIAN-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md
```

merely to make draft cleanup easier.

If a draft defect reveals a real glossary contradiction, stop and report:

```text
GLOSSARY_RECONSIDERATION_REQUIRED
```

with:

- locale;
- concept;
- affected keys;
- existing approved terminology;
- why it cannot be applied naturally;
- proposed reconsideration.

Do not silently edit glossary policy.

---

# 11. Preserve runtime inactivity

At completion:

```text
es-ES
it-IT
pt-BR
```

must still remain runtime-inactive.

Do not add:

- locale selector entries;
- runtime catalogues;
- browser mapping;
- reference overlays;
- search integration;
- collation integration;
- shortcut speech;
- `document.lang` activation.

No UI/CSS changes.

---

# 12. Preserve geometry freeze

Do not alter:

- CSS;
- control dimensions;
- columns;
- margins/padding;
- breakpoints;
- fonts;
- colors;
- wrapping geometry.

If corrected translations remain long, leave that for later QA.

Do not shorten a correct translation merely to fit.

---

# 13. Existing locale preservation

Verify no regression to:

```text
ja-JP
fr-FR
de-DE
```

especially:

- review package parsing;
- plural validation;
- deterministic review artifacts;
- terminology closure;
- localization closure.

If stricter plural validation breaks a current supported locale, investigate whether the existing value is actually invalid before weakening the validator.

Do not silently grandfather malformed syntax.

---

# 14. Targeted audit report in completion response

Provide a concise correction summary per locale:

```text
rows changed
keys changed
main defect classes
remaining suspicious-English detections
plural-validation findings
glossary reconsideration flags
```

Also report whether any corrected row required a change to:

```text
EnglishSource
Context
OfficialTermConstraints
```

because that determines whether any returned DeepL unit may need special handling later.

Preferred result:

```text
0 source/context/constraint changes
```

---

# 15. Verification

Run:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
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

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE

npm run build
npm run lint
git diff --check
```

Also run targeted tests for:

- accidental-English detection;
- approved invariant-token exemptions;
- plural structure;
- deterministic review CSV regeneration;
- deterministic XLIFF regeneration;
- all three corrected Codex drafts.

---

# 16. Diff review

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- no DeepL-returned content entered the repo;
- no adjudication occurred;
- no final locale catalogues were generated;
- no runtime activation;
- no reference overlays;
- no UI/CSS changes;
- glossaries unchanged unless explicitly stopped for reconsideration;
- corrected review artifacts remain deterministic;
- no commit/push.

---

# Explicitly out of scope

Do not:

- import returned DeepL XLIFFs;
- populate `DeepLTranslation`;
- calculate final comparison/adjudication state;
- adjudicate rows;
- generate final semantic catalogues;
- activate locales;
- implement browser mapping;
- implement search/collation/speech;
- generate reference overlays;
- accept fauna evidence;
- change glossaries silently;
- change UI geometry;
- commit or push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Spanish draft correction count and key list;
4. Italian draft correction count and key list;
5. Brazilian Portuguese draft correction count and key list;
6. accidental-English detector design;
7. false-positive exemptions;
8. plural-validator change;
9. plural regression tests added;
10. review CSV regeneration results;
11. XLIFF regeneration results;
12. confirmation no DeepL-returned content was inspected/imported;
13. confirmation no adjudication occurred;
14. confirmation no final semantic catalogues were generated;
15. source/context/constraint changes, if any;
16. whether any returned DeepL units may therefore need special handling later;
17. glossary reconsideration flags, if any;
18. existing-locale regression results;
19. build/lint/test results;
20. `git diff --check` result;
21. confirmation runtime remains unchanged;
22. confirmation no commit or push occurred;
23. recommended readiness for the later adjudication task.

Do not suggest a commit message. The semantic-review work remains intentionally uncommitted until the adjudication/final-catalogue stage is complete.
