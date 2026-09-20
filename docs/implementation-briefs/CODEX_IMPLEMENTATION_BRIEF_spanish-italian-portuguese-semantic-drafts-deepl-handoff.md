# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Semantic Drafting and DeepL Handoff Preparation

## Objective

Perform the first half of the semantic-catalogue stage for:

```text
Spanish (Spain)        es-ES
Italian                it-IT
Portuguese (Brazil)    pt-BR
```

This task should create the three **independent Codex semantic drafts**, generate the deterministic review packages, and produce the three XLIFF files that the user will manually submit to DeepL.

This is intentionally **only the handoff-preparation half** of semantic review.

Do **not** import DeepL results, adjudicate rows, generate final semantic catalogues, activate locales at runtime, or commit/push.

The user will return the three translated XLIFF files afterward. Those returned files, together with this implementation diff, will be reviewed before the separate adjudication/final-catalogue task begins.

No commit should occur at the end of this task.

---

# Settled workflow

The workflow is:

## This task

For each locale independently:

```text
approved glossary/constraints
    -> independent Codex 414-key draft
    -> deterministic review CSV
    -> deterministic DeepL XLIFF handoff
```

## User step afterward

The user will manually upload:

```text
es-ES-deepl.xliff
it-IT-deepl.xliff
pt-BR-deepl.xliff
```

to DeepL and return the translated files.

## Later separate task

After review of:

- this diff;
- generated review CSVs;
- generated XLIFF handoffs;
- DeepL-returned XLIFF files;

a separate implementation brief will:

```text
import DeepL output
classify comparisons
adjudicate rows
resolve any glossary reconsideration
generate final locale catalogues
```

Do not anticipate or perform that later work now.

---

# No commit between the two halves

This semantic-catalogue stage is intentionally split for review, but it remains one logical implementation tranche.

At the end of this task:

- leave all changes uncommitted;
- do not push;
- do not suggest that the work is commit-ready yet;
- the repository should remain suitable for continuing directly into the adjudication/final-catalogue task after the external DeepL round trip.

The final commit decision comes only after the second half is reviewed.

---

# Primary authority

Treat these as current policy:

```text
docs/audits/SPANISH-ITALIAN-PORTUGUESE-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md

docs/localization/SPANISH-GLOSSARY.md
docs/localization/ITALIAN-GLOSSARY.md
docs/localization/PORTUGUESE-BRAZIL-GLOSSARY.md

reference-source/official-terminology-values-es-ES.csv
reference-source/official-terminology-values-it-IT.csv
reference-source/official-terminology-values-pt-BR.csv

reference-source/localization-locale-metadata.json

src/localization/reviewPackage.ts
src/localization/reviewAdjudication.ts
scripts/localization/
AGENTS.md
```

Also inspect the completed French/German semantic review implementation and current deterministic review/XLIFF tooling.

Where historical briefs differ from current durable documentation, current durable documentation wins.

---

# 1. Preserve independence of the three Codex drafts

Create one complete independent Codex draft for each locale:

```text
es-ES
it-IT
pt-BR
```

Each draft must be produced from:

- current `en-US` semantic source;
- current context metadata;
- current risk classification;
- current placeholder/protected-token rules;
- the approved locale glossary;
- approved official terminology constraints.

Do not use:

- DeepL output;
- translations from the other two new locales;
- French/German wording as a translation source;
- machine-translated output from any external provider.

Cross-locale architecture/context may be reused, but target-language phrasing must be independently authored.

---

# 2. Full semantic coverage

Each draft must cover the entire current full semantic catalogue.

Expected current scale is approximately:

```text
414 message keys per locale
```

The durable invariant is exact parity with current `en-US`, not a hard-coded historical count.

Verify for each locale:

- every baseline key exists;
- no extra key exists;
- no value is accidentally empty;
- parameters/placeholders are preserved exactly;
- supported plural syntax remains valid;
- protected technical tokens remain intact;
- no accidental source-language fallback appears in ordinary translated UI text.

Do not create runtime catalogue files yet.

The Codex drafts should remain review-source artifacts, not final `src/localization/locales/*.ts` catalogues.

---

# 3. Use the approved glossaries as binding editorial guidance

The three glossaries are now authoritative inputs to this review stage.

Respect:

- official Bethesda terminology;
- tracker-owned preferred terminology;
- context-sensitive terminology;
- capitalization guidance;
- regional-language discipline;
- semantic-sense notes;
- compact-label notes;
- allowed grammatical variation.

Do not silently revise glossary decisions inside translations.

If a glossary decision appears genuinely wrong or impossible to use naturally, do **not** locally improvise a new policy.

Flag:

```text
GLOSSARY_RECONSIDERATION_REQUIRED
```

with:

- locale;
- glossary concept;
- affected keys;
- existing approved term/rule;
- linguistic problem;
- proposed reconsideration;
- whether it blocks XLIFF generation.

A real contradiction may reopen a glossary decision, but only explicitly.

---

# 4. Regional discipline

## Spanish

Use:

```text
Spanish (Spain)
es-ES
```

Do not neutralize toward Latin-American Spanish.

Avoid adopting Latin-American regional vocabulary merely because it is common in generic machine translation.

## Italian

Use standard Italian appropriate to:

```text
it-IT
```

## Portuguese

Use:

```text
Portuguese (Brazil)
pt-BR
```

Do not drift toward European Portuguese.

Do not neutralize Brazilian grammar/vocabulary merely for pan-Portuguese similarity.

---

# 5. Semantic-risk handling

Give special editorial attention to HIGH-risk and ambiguity-prone concepts.

At minimum:

```text
Planned Supply
Present
Producing
Inputs
Logistics
Manufacturing
Validation
Resource Matrix
Reshuffle
Lock
Network
Active Production
Source
Destination
Undo
Redo
Inorganic
Organic
```

Also carefully review:

- validation messages;
- import/export feedback;
- history strings;
- help/tooltips;
- accessible descriptions;
- Search instructions;
- keyboard-shortcut descriptions;
- destructive confirmations;
- pluralized/count messages;
- parameterized status text.

Do not translate terse English UI labels without using their recorded context.

---

# 6. Context-sensitive grammar

The new glossary model deliberately allows context-sensitive terminology.

Use natural target-language grammar where required.

Examples may involve:

- articles;
- contractions;
- gender;
- number;
- adjective agreement;
- prepositions;
- elision;
- verbal/state forms;
- imperative versus noun labels.

Do not force literal glossary substrings where the approved constraint strategy says semantic/contextual matching is appropriate.

At the same time, do not treat context sensitivity as permission to ignore terminology.

---

# 7. Capitalization

Respect the distinction between:

```text
official evidence capitalization
tracker presentation capitalization
```

Examples:

- `Starfield` remains the product name;
- `X-Tech` / `Tec-X` remains invariant where the approved locale glossary requires it;
- Portuguese official title-case evidence does not require title case in ordinary prose;
- sentence-case controls/prose should remain natural.

Do not normalize all translated strings into English-style title case.

---

# 8. Protected tokens and placeholders

Preserve all required technical tokens and placeholders exactly.

Examples may include:

```text
JSON
FormID
He-3
Ctrl
Esc
Shift
ID
```

and message parameters such as:

```text
{name}
{count}
{resource}
```

Do not translate placeholder names.

Do not alter parameter cardinality.

Do not replace technical abbreviations unless the established localization contract explicitly allows it.

---

# 9. Generate deterministic review CSVs

Generate:

```text
docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv
```

Each row must preserve the established review schema, including:

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

At this stage:

```text
CodexTranslation
```

must be populated.

The later DeepL/adjudication fields should remain in the correct pre-handoff state.

Do not fabricate DeepL content.

Do not pre-adjudicate.

---

# 10. Generate deterministic XLIFF 1.2 handoffs

Generate exactly one DeepL handoff per locale:

```text
docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

Preserve the established XLIFF 1.2 contract.

Each unit should carry enough information for a high-quality independent translation.

Preserve where supported by the existing handoff format:

- stable message key;
- English source;
- source hash;
- locale target identity;
- context;
- risk;
- parameters;
- protected tokens;
- approved terminology constraints;
- sense notes where needed.

Do not combine the three locales into one XLIFF.

Do not call DeepL from repository tooling.

---

# 11. Context quality audit before handoff

Before considering XLIFF files ready for the user, inspect whether ambiguous strings have sufficient context.

Particularly verify context quality for:

```text
Present
Producing
Inputs
Source
Destination
Lock
Reshuffle
Network
Planned Supply
Active Production
Logistics
Manufacturing
```

If a generic namespace context is insufficient for a specific key, improve the reusable key-specific context metadata before producing the final XLIFF.

Do not add one-off prose directly into generated XLIFF if the context belongs in durable review metadata.

Any context improvements must preserve existing French/German deterministic behavior unless the improvement is intentionally global and justified.

---

# 12. Review-risk classification

Retain the current risk model unless a concrete defect is found.

Do not downgrade difficult rows merely to reduce manual review volume.

If the current HIGH/MEDIUM/LOW classification clearly misses a risky new context, make the smallest reusable correction and document it.

Do not make locale-specific risk levels unless the pipeline has a clear supported concept for them.

---

# 13. Pre-handoff validation

Before returning the XLIFF files to the user, verify for each locale:

- exact key count/parity;
- no missing Codex draft values;
- no empty translations;
- placeholders valid;
- protected tokens valid;
- plural syntax valid;
- terminology constraints present where required;
- all 36 applicable constraint IDs represented;
- no stale source hash;
- no stale glossary constraint;
- locale identity correct;
- deterministic generation;
- no accidental DeepL values;
- no adjudication values.

If any row fails, fix it before handoff.

---

# 14. No final catalogue generation

Do not generate:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

as final semantic catalogues.

Those files belong to the later adjudication/final-catalogue stage.

If temporary generated material is necessary to produce review artifacts, keep it within the established review/draft architecture rather than registering it as runtime localization.

---

# 15. Runtime remains inactive

At completion:

```text
es-ES
it-IT
pt-BR
```

must remain absent from runtime support.

Do not add them to:

- locale selector;
- runtime semantic catalogue registry;
- runtime reference overlay registry;
- persisted supported-locale acceptance;
- `document.lang` switching;
- automatic browser resolution;
- user-facing localized UI.

Keep:

```text
runtimeAvailable: false
```

unchanged.

The user's current app should look exactly as it did before this task.

---

# 16. Browser mapping remains deferred

Do not implement browser mapping.

The approved future policy remains:

```text
es / es-ES -> es-ES
explicit non-Spain es-* -> no automatic mapping

it / it-IT -> it-IT
explicit non-Italy it-* -> no automatic mapping

pt / pt-BR -> pt-BR
pt-PT and explicit non-Brazilian pt-* -> no automatic mapping
```

This task should not modify runtime resolution.

---

# 17. No official reference overlays yet

Do not generate final official reference-name overlays or manifests for:

```text
es-ES
it-IT
pt-BR
```

That remains the next major data stage after semantic-catalogue closure.

Do not collect or accept fauna composition evidence here.

---

# 18. No search/collation/speech integration yet

Do not implement:

- Spanish diacritic folding;
- Italian diacritic folding;
- Italian straight/curly apostrophe equivalence;
- Brazilian Portuguese diacritic folding;
- locale runtime collation registration;
- selector labels;
- accessible shortcut speech;
- search aliases;
- runtime `Intl` wiring.

Those belong to later runtime integration.

---

# 19. Geometry freeze

Do not change:

- CSS;
- layout;
- widths/heights;
- control geometry;
- columns;
- margins/padding;
- breakpoints;
- fonts;
- colors;
- wrapping rules.

If a draft translation looks long, record it as a possible later QA risk.

Do not shorten correct wording merely to fit current UI.

---

# 20. Review summary artifacts

At completion, provide useful review statistics for each locale.

At minimum:

```text
total rows
LOW count
MEDIUM count
HIGH count
rows with terminology constraints
rows with parameters
rows with protected tokens
rows flagged for glossary reconsideration
rows with notable compact-label risk
```

Also identify a concise list of the highest-risk semantic keys that deserve special attention after DeepL returns.

Do not adjudicate those rows yet.

---

# 21. Suggested user handoff instructions

In the completion response, tell the user exactly which three files to upload manually to DeepL.

Use the repository paths:

```text
docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

State the intended DeepL target for each:

```text
es-ES -> Spanish
it-IT -> Italian
pt-BR -> Portuguese (Brazil) / PT-BR
```

If DeepL's UI uses a different label, do not silently substitute another regional variant.

The user should return the translated XLIFF files without manually editing them first.

---

# 22. DeepL-returned file handling is out of scope

Do not:

- import returned XLIFF;
- inspect returned translations;
- populate `DeepLTranslation`;
- calculate comparison statuses;
- adjudicate;
- repair DeepL output;
- generate final catalogues.

That belongs to the next separate brief after the user returns the translated files.

---

# 23. Existing locale preservation

Verify that current supported locales remain unchanged.

At minimum:

```text
ja-JP
fr-FR
de-DE
```

Preserve:

- terminology closure;
- reference overlays;
- semantic catalogues;
- review artifacts;
- runtime behavior.

If shared review-context or risk metadata changes, verify whether it intentionally affects reproducible French/German review handoffs.

Do not accept unexplained churn.

---

# 24. Documentation

Update durable documentation only if this stage introduces a reusable semantic-review contract not already documented.

Do not mark the new locales:

```text
Supported
Runtime integrated
Semantic review complete
```

A suitable interim state is conceptually:

```text
Semantic draft/XLIFF handoff prepared; DeepL comparison pending
```

Do not turn durable docs into a task diary if existing status mechanisms already cover staged onboarding.

---

# 25. Verification

Run the appropriate full regression suite.

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

Also run targeted deterministic generation/validation tests for:

```text
es-ES-review.csv
it-IT-review.csv
pt-BR-review.csv

es-ES-deepl.xliff
it-IT-deepl.xliff
pt-BR-deepl.xliff
```

Full closure for the three new locales is expected to remain incomplete.

---

# 26. Diff review requirements

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- no runtime activation;
- no final semantic catalogues;
- no reference overlays;
- no search integration;
- no browser mapping;
- no UI/CSS changes;
- no DeepL content fabricated;
- no adjudication performed;
- no commit/push;
- the three generated handoff files are present and deterministic.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Spanish Codex draft summary;
4. Italian Codex draft summary;
5. Brazilian Portuguese Codex draft summary;
6. row count/parity per locale;
7. HIGH/MEDIUM/LOW counts per locale;
8. terminology-constraint coverage per locale;
9. parameter/protected-token counts per locale;
10. glossary reconsideration flags, if any;
11. compact-label risks worth watching later;
12. context/risk metadata changes, if any;
13. review CSV paths;
14. XLIFF handoff paths;
15. confirmation XLIFF 1.2 generation is deterministic;
16. confirmation no DeepL content was imported or fabricated;
17. confirmation no adjudication occurred;
18. confirmation no final semantic catalogues were created;
19. confirmation all three locales remain runtime-inactive;
20. existing-locale regression results;
21. build/lint/test results;
22. `git diff --check` result;
23. deviations from the brief;
24. blockers before external DeepL handoff;
25. exact instructions for which three XLIFF files the user should upload to DeepL and which target language/region to select;
26. recommended review points before the later adjudication task;
27. confirmation no commit or push occurred.

Do **not** suggest a commit message yet. This semantic-review stage is deliberately uncommitted until the later adjudication/final-catalogue task is complete.
