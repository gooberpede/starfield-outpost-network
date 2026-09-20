# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese DeepL Import, Neutral Adjudication, and Final Semantic Catalogues

## Objective

Complete the semantic-catalogue stage for:

```text
Spanish (Spain)        es-ES
Italian                it-IT
Portuguese (Brazil)    pt-BR
```

This task is the second half of the semantic-review work.

Starting state:

- the three independent Codex drafts have been corrected and frozen;
- the deterministic review CSV/XLIFF handoff artifacts exist;
- the user has already run the three XLIFF handoffs through DeepL;
- the returned DeepL XLIFF files are available separately;
- no semantic-review commit has yet been made.

This task should:

1. import the three returned DeepL XLIFF files;
2. record invalid placeholder/token/plural output rather than aborting the import;
3. classify every comparison;
4. neutrally adjudicate every row, one locale at a time;
5. explicitly resolve invalid DeepL rows;
6. produce complete final semantic catalogues;
7. preserve review evidence in the review CSVs;
8. leave all three locales runtime-inactive.

Do not activate the locales in the application.

Do not commit or push unless explicitly instructed.

---

# Semantic-review independence

The two translation witnesses are now frozen:

```text
CodexTranslation
DeepLTranslation
```

The Codex drafts were corrected without access to the returned DeepL files.

Do not regenerate or rewrite the Codex drafts in response to DeepL wording during this task.

The purpose of adjudication is to compare two independent witnesses against:

- the English source;
- UI context;
- risk metadata;
- approved terminology/glossaries;
- grammar;
- intended product meaning.

Do not turn one witness into an edited copy of the other.

---

# Returned DeepL files

Use the three user-returned translated XLIFF files corresponding to:

```text
es-ES
it-IT
pt-BR
```

Match each file by:

- XLIFF `target-language`;
- stable message key;
- English source;
- source hash.

Do not rely only on the external filename.

The returned files may have DeepL-generated filenames differing from repository handoff names.

Do not overwrite the repository’s deterministic current-handoff XLIFF files with returned DeepL output.

The committed/current XLIFF convention remains:

> repository XLIFF files are deterministic current handoff representations, not historical proof of the exact translated file returned by DeepL.

Returned DeepL files are import inputs/evidence, not canonical repository handoff artifacts.

---

# 1. Import with invalid-token recording enabled

Import each returned XLIFF using the established import path with invalid-token recording enabled.

Conceptually:

```text
recordInvalidTokens: true
```

Do not abort the whole locale merely because DeepL:

- translated placeholder names;
- altered ICU plural keywords/categories;
- damaged a protected token;
- otherwise produced a structurally invalid translation.

Instead:

- preserve the returned DeepL wording in `DeepLTranslation`;
- set `ComparisonStatus` to `INVALID_TOKENS`;
- retain the row for adjudication.

All other structural safety checks remain strict.

Still fail on:

- locale mismatch;
- unknown key;
- duplicate key;
- missing key;
- stale English source;
- stale English source hash;
- empty returned target;
- malformed/unreadable XLIFF structure.

---

# 2. Expected invalid DeepL behavior

Previous review of the returned files found substantial placeholder/plural damage.

Examples included patterns such as:

```text
{outpost} -> translated placeholder name
{resource} -> translated placeholder name
{product} -> translated placeholder name
```

and localized variants of:

```text
plural
one
other
```

This is expected evidence to adjudicate, not a reason to discard the entire DeepL witness.

Do not manually pre-clean the returned XLIFF before import.

Do not silently normalize it during import.

The review CSV must show that the original DeepL row was invalid.

---

# 3. Import all three review packages before adjudication

After import, update:

```text
docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv
```

with:

```text
DeepLTranslation
ComparisonStatus
```

populated.

Before adjudicating, report and verify the comparison distribution for each locale:

```text
IDENTICAL
TYPOGRAPHIC_ONLY
SUBSTANTIVE
INVALID_TOKENS
MISSING
```

Expected result:

```text
MISSING = 0
```

Do not proceed to final catalogue generation if any row remains `MISSING`.

---

# 4. Adjudicate one complete locale at a time

Use this order:

```text
1. es-ES
2. it-IT
3. pt-BR
```

Finish all 414 rows for one locale before beginning the next.

This is an editorial-coherence rule, not a runtime dependency.

Do not adjudicate one English key horizontally across all three locales as the primary workflow.

---

# 5. Neutral adjudication

The permitted decision provenance remains:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

No source is the default winner.

Do not apply rules such as:

```text
DeepL unless obviously wrong
Codex unless obviously wrong
shorter translation wins
more literal translation wins
official-sounding translation wins
```

For every row, determine the final wording from:

- exact English meaning;
- UI role/context;
- approved glossary;
- official terminology;
- target-language grammar;
- consistency with related keys;
- placeholders/protected tokens;
- regional target;
- accessibility purpose where relevant.

---

# 6. Decision semantics

## AGREED

Use only when:

```text
CodexTranslation === DeepLTranslation
ComparisonStatus === IDENTICAL
```

and the agreed wording is acceptable.

## CODEX

Use when the Codex wording is preferable and becomes the final translation.

The reviewer note must explain why for that row.

## DEEPL

Use only when the DeepL wording is structurally valid and preferable.

Do not use `DEEPL` on `INVALID_TOKENS` rows.

## CUSTOM

Use when neither witness is good enough and a third wording is editorially preferable.

The final wording must genuinely differ from both witnesses.

Explain the specific reason.

## INVALID_DEEPL_REPAIRED

Use when:

```text
ComparisonStatus === INVALID_TOKENS
```

and the final translation is an editorially valid repair informed by the DeepL semantic wording and/or the Codex witness while restoring the repository’s required syntax.

The reviewer note must identify the defect class and explain the repaired choice.

Do not hide invalid DeepL rows by relabeling them `CODEX`, `DEEPL`, or `CUSTOM` merely to reduce invalid-row counts.

---

# 7. Repair invalid DeepL rows carefully

For `INVALID_TOKENS` rows:

- preserve exact placeholder names from English;
- preserve supported ICU plural syntax;
- preserve protected tokens;
- preserve required parameter cardinality;
- retain natural target-language sentence grammar around them.

Do not mechanically replace translated placeholder words inside DeepL text if the surrounding sentence becomes ungrammatical.

Treat the DeepL wording as semantic evidence, then construct a valid final target-language string.

If the Codex witness is already clearly correct, it may be used as the final repaired wording, but the decision provenance should remain:

```text
INVALID_DEEPL_REPAIRED
```

because the DeepL witness itself was structurally invalid.

---

# 8. Approved glossaries remain authoritative

Use:

```text
docs/localization/SPANISH-GLOSSARY.md
docs/localization/ITALIAN-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md
```

as binding editorial guidance.

Pay special attention where DeepL disagrees with approved terminology.

Previously observed examples included differences around concepts such as:

```text
Present
Producing
Inputs
Planned Supply
Cargo Link
Outpost
X-Tech / Tec-X
```

A fluent DeepL alternative is not automatically preferable if it changes the tracker’s agreed semantic vocabulary.

---

# 9. Glossary reconsideration protocol

If adjudication reveals that an approved glossary choice is genuinely wrong, unnatural, or impossible to apply consistently, do not silently work around it.

Flag:

```text
GLOSSARY_RECONSIDERATION_REQUIRED
```

and stop final closure for that locale/concept.

Report:

- locale;
- glossary concept;
- affected keys;
- current approved value/rule;
- Codex wording;
- DeepL wording;
- linguistic/product problem;
- proposed glossary change;
- downstream rows affected.

A genuine glossary contradiction may be corrected, but it requires explicit review.

Do not casually reopen glossary decisions merely because DeepL prefers a synonym.

---

# 10. High-risk rows

Give explicit attention to at least:

```text
matrix.column.present
matrix.column.producing
matrix.column.inputs
matrix.column.logistics
plannedSupply.heading
outpost.navigation.reshuffleButton
outpost.navigation.lockOrder
cargo.reshuffleButton
cargo.lockOrder
validation.manufacturingInputUnavailable
validation.plannedSupplyUnresolved
cargo.pad.semanticSummary
matrix.tooltip.xTech.add
```

Also review carefully:

- Undo/Redo history messages;
- Search instructions;
- keyboard-accessibility instructions;
- import/export failures;
- destructive confirmations;
- reference-data fatal state;
- pluralized messages;
- multi-parameter validation/status messages.

Do not assume the earlier Codex correction means these rows are editorially closed.

---

# 11. Regional discipline

## Spanish

Final wording must remain:

```text
Spanish (Spain)
```

Do not drift toward Latin-American regional vocabulary or generic “neutral Spanish.”

## Italian

Use standard Italian appropriate to:

```text
it-IT
```

## Portuguese

Final wording must remain:

```text
Portuguese (Brazil)
```

Do not adopt European Portuguese merely because DeepL offers a plausible variant.

---

# 12. Target-language grammar outranks English syntax

Do not preserve English word order merely for easy comparison.

Allow natural:

- articles;
- contractions;
- gender/number agreement;
- adjective position;
- prepositions;
- elision;
- imperative/noun distinctions;
- sentence restructuring.

However, preserve exact repository syntax for:

- parameters;
- protected tokens;
- supported plural constructs.

---

# 13. Decision-specific reviewer notes

Every approved row must satisfy the existing reviewer-note requirements.

For substantive decisions, notes must be genuinely decision-specific.

Do not populate hundreds of rows with generic boilerplate such as:

```text
Reviewed against the English source and glossary.
```

For `CODEX`, `DEEPL`, `CUSTOM`, and `INVALID_DEEPL_REPAIRED`, state the actual reason for that row.

Useful rationale dimensions include:

- glossary compliance;
- semantic sense;
- regional usage;
- grammar/agreement;
- UI role;
- accessibility clarity;
- ambiguity avoidance;
- placeholder repair;
- consistency with related controls.

For `AGREED`, use concise but valid rationale consistent with current validation rules.

---

# 14. Do not optimize for decision distribution

There is no target percentage for:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

A skewed distribution is acceptable if justified row by row.

Do not balance Codex and DeepL wins artificially.

Do not reduce `CUSTOM` or invalid-repair counts merely because they look high.

---

# 15. Comparison statistics

For each locale, report:

## Before adjudication

```text
IDENTICAL
TYPOGRAPHIC_ONLY
SUBSTANTIVE
INVALID_TOKENS
MISSING
```

## After adjudication

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Also report:

- HIGH-risk decision distribution;
- glossary-constrained decision distribution;
- number of rows whose final translation differs from both witnesses;
- number of invalid DeepL rows repaired;
- number of glossary reconsiderations.

These counts are review diagnostics, not quality scores.

---

# 16. Typography-only comparisons

`TYPOGRAPHIC_ONLY` does not mean automatic approval.

Review punctuation/quotes/apostrophes in context.

Prefer the target-language form appropriate to the locale and repository style.

Do not mechanically favor Codex or DeepL.

---

# 17. Generate final semantic catalogues only after complete approval

After every row for a locale has:

```text
FinalTranslation
AdjudicationDecision
ReviewerNote
```

and validation passes, generate:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

from the final review CSVs using the established deterministic catalogue-generation path.

Do not hand-maintain a separate translation copy.

The review CSV remains the durable adjudication evidence.

The final semantic catalogue is the generated runtime-ready semantic artifact.

---

# 18. Final catalogue requirements

Each final catalogue must have:

- exact current `en-US` key parity;
- zero empty values;
- exact placeholder parity;
- valid supported plural syntax;
- protected-token preservation;
- approved terminology;
- no accidental English residue;
- no unapproved source-language fallback;
- deterministic generation.

The count is expected to be 414 at current baseline, but parity with current `en-US` is authoritative.

---

# 19. Runtime remains inactive

Even though final semantic catalogues will now exist, do not expose:

```text
es-ES
it-IT
pt-BR
```

at runtime.

Keep:

```text
runtimeAvailable: false
```

Do not add them to:

- locale selector;
- runtime semantic registry;
- browser locale mapping;
- runtime reference overlays;
- preference acceptance;
- `document.lang` switching;
- user-visible UI.

Their semantic catalogues are complete data artifacts awaiting later reference-name and runtime-integration stages.

---

# 20. No official reference overlays yet

Do not generate final:

```text
es-ES reference overlay
it-IT reference overlay
pt-BR reference overlay
```

Do not create sidecars/manifests.

Do not accept fauna composition evidence.

That remains the next major localization stage.

---

# 21. Search/collation/speech remain deferred

Do not implement:

- Spanish diacritic folding;
- Italian diacritic folding;
- Italian straight/curly apostrophe equivalence;
- Brazilian Portuguese diacritic folding;
- selector labels;
- browser mapping;
- locale collation registration;
- shortcut speech.

Those belong to runtime integration after reference-name closure.

---

# 22. Geometry remains frozen

Do not change:

- UI geometry;
- CSS;
- widths/heights;
- breakpoints;
- columns;
- margins;
- padding;
- fonts;
- colors.

If a final translation appears likely to create layout pressure, record it as a later QA risk.

Do not shorten correct wording merely to fit.

---

# 23. Compact-label risk report

Carry forward and update compact-label risks after final adjudication.

At minimum inspect terminology around:

```text
Resource Matrix
Planned Supply
Inputs
Lock order
Inter-System Cargo Link
X-Tech / Tec-X Power Core
```

Report likely risks.

Do not implement visual mitigations.

---

# 24. Existing locale preservation

Verify no regression to:

```text
ja-JP
fr-FR
de-DE
```

including:

- semantic catalogues;
- review parsing/validation;
- terminology verification;
- reference overlays;
- locale closure;
- deterministic French/German review artifacts.

Any shared adjudication-tool changes must preserve the existing completed review evidence.

---

# 25. Review CSV final state

At completion, each of:

```text
docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv
```

must contain, for every row:

```text
CodexTranslation
DeepLTranslation
ComparisonStatus
AdjudicationDecision
FinalTranslation
ReviewerNote
```

with no incomplete review state.

Run full parse/validation after writing.

---

# 26. XLIFF repository state

Do not replace the deterministic repository handoff files with returned DeepL output.

Keep:

```text
docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

as current deterministic handoff representations generated from English source/context/constraints.

The returned translated XLIFF files may remain outside tracked repository state unless existing project policy requires otherwise.

Do not add duplicate historical DeepL-return files to durable docs.

---

# 27. Documentation status

Update durable localization documentation only where useful to reflect:

```text
semantic catalogue complete
runtime inactive
reference-name/fauna stage pending
```

Do not mark the locales:

```text
Supported
Runtime integrated
```

Do not turn durable docs into an implementation diary.

---

# 28. Verification

Run the complete relevant suite.

At minimum:

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

Also run targeted verification for:

- DeepL import with invalid-token recording;
- all three comparison distributions;
- neutral adjudication validation;
- invalid DeepL repair;
- final catalogue generation;
- final catalogue parity;
- accidental-English guard;
- plural syntax;
- deterministic regeneration of final catalogues;
- runtime inactivity of all three staged locales.

Full `localization:verify` for the three new locales is still expected to stop later on missing reference-name artifacts.

Do not weaken that gate.

---

# 29. Diff review

Before completion:

```text
git diff --stat
git diff
```

Confirm:

- no runtime activation;
- no browser mapping;
- no reference overlays;
- no search/collation/speech integration;
- no UI/CSS changes;
- no returned DeepL XLIFF accidentally committed;
- no unapproved glossary changes;
- all three final catalogues are generated from approved review evidence;
- semantic review is complete;
- no commit/push has occurred.

---

# 30. Completion response

Return:

1. branch;
2. files changed;
3. returned DeepL files imported/matched by locale;
4. Spanish pre-adjudication comparison distribution;
5. Italian pre-adjudication comparison distribution;
6. Brazilian Portuguese pre-adjudication comparison distribution;
7. Spanish final decision distribution;
8. Italian final decision distribution;
9. Brazilian Portuguese final decision distribution;
10. invalid DeepL rows per locale;
11. invalid rows repaired per locale;
12. HIGH-risk decision distribution per locale;
13. glossary-constrained decision distribution per locale;
14. `CUSTOM` rows per locale;
15. rows whose final translation differs from both witnesses;
16. glossary reconsideration flags, if any;
17. notable semantic decisions;
18. notable regional-language decisions;
19. compact-label risks after adjudication;
20. final review CSV status;
21. final semantic catalogue paths;
22. catalogue parity/placeholder/plural/protected-token results;
23. accidental-English validation result;
24. confirmation repository XLIFFs remain deterministic handoff representations;
25. confirmation returned DeepL XLIFFs were not substituted for tracked handoffs;
26. confirmation locales remain runtime-inactive;
27. existing-locale regression results;
28. build/lint/test results;
29. `git diff --check` result;
30. deviations from the brief;
31. blockers before the reference-name/fauna stage;
32. recommended next stage;
33. suggested commit message for the complete semantic-review work.

Do not commit or push unless explicitly instructed.

The suggested commit message should cover the complete semantic-catalogue/review work, including both halves of this uncommitted stage, and must not contain planning identifiers.
