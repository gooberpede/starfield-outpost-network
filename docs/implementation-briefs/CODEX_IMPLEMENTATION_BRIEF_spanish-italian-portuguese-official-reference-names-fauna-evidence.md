# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Official Reference Names and Fauna Evidence

## Objective

Complete the official reference-name and composed-fauna evidence stage for:

```text
Spanish (Spain)        es-ES
Italian                it-IT
Portuguese (Brazil)    pt-BR
```

This task should:

1. generate and verify the three complete official Bethesda reference-name overlays;
2. generate the composed-fauna predictions for all three locales;
3. inspect the supplied first-party in-game screenshots;
4. map visible fauna names back to canonical tracker identities;
5. evaluate whether each locale’s current fauna composition prediction can be provisionally accepted;
6. write/update per-locale evidence records and sidecar/manifest metadata honestly;
7. keep all three locales runtime-inactive.

This is still a **data/evidence stage**, not runtime integration.

Do not activate the locales in the application.

Do not commit or push unless explicitly instructed.

---

# One-task recommendation

This task does **not** need to be split in two if the user supplies the in-game screenshots together with the brief.

Codex should:

```text
generate official overlays
generate fauna predictions
inspect supplied screenshots
adjudicate composition evidence
complete sidecars/evidence records
```

in one coherent pass.

If the supplied screenshots prove insufficient for one or more locales, do not invent evidence and do not silently mark that locale accepted.

Instead:

- complete all deterministic official-name generation;
- leave the affected locale’s fauna evidence status pending;
- report exactly what was observed and what remains unproven;
- do not recommend committing the whole stage until all three locale evidence gates are satisfactorily closed.

---

# Naming rule

Planning identifiers used in discussion must not leak into repository-facing names.

Do not use names such as:

```text
Brief 4
Parcel 4
Phase 4
P4
```

in:

- source identifiers;
- filenames;
- tests;
- comments;
- durable headings;
- commit messages.

Use descriptive responsibility-based names.

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

reference-source/localization-locale-metadata.json
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-c6-fauna.csv
reference-source/official-terminology-provenance.csv

src/localization/generated/
scripts/localization/
tests/
AGENTS.md
```

Also inspect the completed French/German official reference-name/fauna implementation because it is the immediate precedent.

Preserve current durable policy over older implementation-history wording if they differ.

---

# Settled canonical provenance

Do not rediscover canonical reference identities.

Reuse the existing canonical/provenance contract:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved canonical identities
```

Reuse exactly the existing:

- stable IDs;
- source plugins;
- provider chains;
- FormIDs;
- fields;
- string IDs;
- template/component relationships;
- approved source/display normalizations.

The locale-specific work is resolving the already-known identities against the correct official string tables.

Do not modify canonical IDs or provider selection merely because a localized value is surprising.

---

# Canonical content sources

The current canonical content sources remain:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

The terminology-only source remains:

```text
SFBGS050.esm
```

Do not ingest `SFBGS050.esm` entities into the canonical runtime reference population merely because its localization tables are available.

---

# Locale/table contracts

Use:

```text
es-ES -> Bethesda token es   -> strict UTF-8
it-IT -> Bethesda token it   -> strict UTF-8
pt-BR -> Bethesda token ptbr -> strict UTF-8
```

The audit already confirmed complete:

```text
.strings
.dlstrings
.ilstrings
```

coverage across all required plugins.

If installed archive/hash state differs from what the audit observed, regenerate current source manifests/hashes as required by the existing tooling contract.

Do not silently use stale local evidence.

---

# 1. Generate Spanish official reference overlay

Generate:

```text
src/localization/generated/es-ES-reference-names.ts
```

and:

```text
reference-source/localized-reference-names-es-ES-manifest.json
```

Expected canonical closure:

```text
3,561 entities
4,818 qualified provenance rows
0 unresolved
```

Preserve established kind counts unless the canonical universe itself has changed.

Expected historical breakdown:

```text
428 biomes
1,776 bodies
1,121 species
5 official terms
30 products
78 resources
123 systems
```

Do not manually translate unresolved official names.

Unresolved qualified identities should fail the locale overlay closure.

---

# 2. Generate Italian official reference overlay

Generate:

```text
src/localization/generated/it-IT-reference-names.ts
```

and:

```text
reference-source/localized-reference-names-it-IT-manifest.json
```

Apply the same closure requirements.

Official values must come from the Italian Bethesda localization tables, not from:

- English fallback;
- Spanish;
- French;
- German;
- DeepL;
- manually inferred translation.

---

# 3. Generate Brazilian Portuguese official reference overlay

Generate:

```text
src/localization/generated/pt-BR-reference-names.ts
```

and:

```text
reference-source/localized-reference-names-pt-BR-manifest.json
```

Use the `ptbr` Bethesda tables.

Do not substitute:

```text
pt-PT
generic Portuguese
European Portuguese
```

wording.

---

# 4. Official Bethesda names remain exact

For official reference-name categories, preserve Bethesda’s localized strings exactly except for already-established explicit source/display normalization policy.

This applies to:

- systems;
- planetary bodies;
- biomes;
- resources;
- manufactured products;
- species/components;
- official terms represented in the overlay.

Do not editorially “improve” names for:

- grammar;
- capitalization;
- perceived naturalness;
- consistency with tracker-authored semantic text.

Tracker-authored UI terminology belongs to semantic catalogues/glossaries.

Official reference names belong to the official-name overlay.

---

# 5. Generate composed-fauna predictions

Reuse the established composed-fauna population:

```text
922 composed fauna
2,179 localized components
```

and existing component-shape model.

Historical shape counts:

```text
267 prefix + species
335 prefix + species + diet
320 species + diet
```

Generate deterministic predicted localized names for:

```text
es-ES
it-IT
pt-BR
```

using the current simple composition hypothesis:

```text
prefix + species + diet
```

with:

```text
U+0020 space
```

between present components.

This is a **prediction** until independently supported by first-party rendered evidence.

Do not mark the model accepted merely because generation succeeds.

---

# 6. Screenshot evidence supplied by the user

The user may supply ordinary in-game screenshots captured while playing in:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
```

Treat those screenshots as the first-party rendered evidence source.

Do not require:

- targeted fauna hunting;
- English-name matching before capture;
- foreign-name matching before capture;
- Creation Kit navigation;
- specific planets;
- a rigid quota;
- a prescribed number of screenshots.

The user should be able to submit whatever fauna names naturally appeared during normal play.

---

# 7. Screenshot evidence workflow

For every supplied screenshot:

1. inspect the visible localized fauna name;
2. identify the current locale from the supplied grouping/context;
3. transcribe the visible name accurately;
4. map it back to the most likely canonical fauna identity using:
   - official localized components;
   - canonical component structure;
   - stable IDs;
   - other screenshot context if useful;
5. record the evidence against the canonical ID;
6. compare the rendered name with the predicted composed name.

Do not rely on OCR if the screenshot is legible through normal visual inspection.

If identification is ambiguous:

- do not guess;
- mark the screenshot unresolved;
- explain what ambiguity remains.

---

# 8. Evidence record artifacts

Create/update per-locale evidence records using the established schema/pattern from French/German.

Expected paths:

```text
reference-source/localized-fauna-evidence-es-ES.json
reference-source/localized-fauna-evidence-it-IT.json
reference-source/localized-fauna-evidence-pt-BR.json
```

Do not invent a new evidence schema if the existing one is sufficient.

Record:

- locale;
- screenshot/evidence reference;
- mapped canonical fauna ID;
- observed localized rendered name;
- predicted composed name;
- component shape;
- whether observed and predicted match;
- relevant punctuation/spacing/agreement observations;
- status;
- limitation notes.

If screenshot files remain ignored/local, durable evidence records should retain the established filename/hash/reference mechanism rather than committing large screenshot corpora unless current policy says otherwise.

---

# 9. Evidence acceptance standard

Do not use a rigid quota.

The criterion for provisional acceptance is:

> enough independent first-party rendered observations to support the current order/separator model for that locale, with no contradictory observation.

Useful evidence includes naturally observed examples of:

```text
prefix + species
species + diet
prefix + species + diet
```

but all three shapes are **not an absolute numerical gate**.

If the supplied observations are sufficiently varied and no contradiction appears, provisional acceptance is reasonable.

If the evidence is too narrow to support a confident conclusion, keep status pending.

Do not manufacture confidence from count alone.

---

# 10. Contradiction policy

Any real rendered contradiction must reopen the composition policy for that locale.

Examples of meaningful contradiction may include:

- reversed component order;
- inserted article;
- omitted component;
- grammatical inflection changing the component string;
- contraction;
- elision;
- punctuation replacing simple spaces;
- hyphenation;
- gender/number agreement modifying one component;
- capitalization carrying lexical meaning;
- different separator behavior.

Do not solve a contradiction by adding silent per-entity exceptions.

If a contradiction appears:

1. isolate it to the affected locale;
2. identify whether it is:
   - systematic;
   - shape-specific;
   - component-specific;
   - entity-specific;
3. report the smallest plausible model change;
4. stop provisional acceptance for that locale until reviewed.

Do not automatically change the other two locales.

---

# 11. Spanish composition risks

Pay attention to evidence of:

- adjective/noun ordering;
- gender agreement;
- number agreement;
- articles;
- punctuation;
- whether official component strings change when rendered in composition.

The current prediction remains the simple model until evidence contradicts it.

Do not prebuild Spanish grammar machinery.

---

# 12. Italian composition risks

Pay attention to:

- elision;
- apostrophes;
- articles;
- prepositions/contractions;
- adjective agreement;
- noun/adjective order;
- punctuation;
- component mutation in composition.

Italian is the locale most likely in this tranche to expose a need beyond literal U+0020 joining.

Do not assume such a need exists without screenshot evidence.

---

# 13. Brazilian Portuguese composition risks

Pay attention to:

- gender/number agreement;
- contractions;
- article insertion;
- adjective/noun ordering;
- hyphenation;
- punctuation;
- whether official components change in composed rendering.

Preserve Brazilian usage.

Do not infer European Portuguese composition behavior.

---

# 14. Search-corpus observations

Use the generated official-name corpora to record useful search observations for the later runtime-integration stage.

Do **not** implement search behavior now.

Confirm/record as applicable:

## Spanish

- accent usage;
- `ñ`;
- diaeresis;
- apostrophes;
- hyphens;
- unusual punctuation;
- decomposition-fold collisions.

## Italian

- accented vowels;
- straight vs curly apostrophes;
- elision;
- hyphens;
- unusual punctuation;
- decomposition-fold collisions.

## Brazilian Portuguese

- acute/circumflex/grave accents;
- tilde;
- cedilla;
- diaeresis if present;
- apostrophes;
- hyphens;
- decomposition-fold collisions.

Preserve the audit’s planned search direction unless corpus evidence contradicts it.

No fuzzy search.

No broad punctuation stripping.

---

# 15. Sidecar/manifest evidence status

Each generated locale sidecar/manifest must represent composition evidence honestly.

Possible conceptual states include:

```text
pending
provisionally accepted
contradicted
```

Use the existing schema/status vocabulary rather than inventing new values if possible.

Do not report:

```text
independently observed
accepted
verified
```

unless the evidence record actually supports that claim.

If one locale remains pending, that locale should not be considered ready for runtime integration.

---

# 16. Runtime remains inactive

At completion:

```text
es-ES
it-IT
pt-BR
```

must remain runtime-inactive.

Do not add them to:

- locale selector;
- runtime reference overlay registry;
- runtime semantic catalogue registry;
- browser-language mapping;
- persisted supported-locale acceptance;
- `document.lang`;
- user-visible app UI.

The generated overlay modules may exist in source while remaining unregistered.

Keep:

```text
runtimeAvailable: false
```

unchanged.

---

# 17. Semantic catalogue preservation

The final semantic catalogues from the previous stage are authoritative.

Do not modify:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

unless an official reference-name integration defect directly proves a semantic-catalogue issue.

A difference between official Bethesda names and tracker-authored semantic terminology is not itself a defect.

---

# 18. No search/runtime integration

Do not implement:

```text
Spanish decomposition folding
Italian decomposition folding
Italian straight/curly apostrophe equivalence
Brazilian Portuguese decomposition folding
browser mapping
selector labels
runtime collator registration
shortcut speech
```

Record corpus evidence only.

Those belong to the next runtime-integration task.

---

# 19. Geometry/UI freeze

Do not modify:

- CSS;
- control sizes;
- panel geometry;
- columns;
- margins;
- padding;
- gaps;
- breakpoints;
- colors;
- fonts;
- typography metrics;
- wrapping rules.

This task is data/evidence only.

---

# 20. Existing locale preservation

Japanese, French, and German must remain unchanged.

Verify current:

```text
ja-JP
fr-FR
de-DE
```

reference overlays/sidecars/evidence remain deterministic and valid.

Do not normalize historical evidence records merely to make them look like new-locale records.

Preserve historical quirks unless a real shared defect requires correction.

---

# 21. Verification

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

npm run build
npm run lint
git diff --check
```

For the three new locales:

- reference-name verification should pass after overlays/manifests are complete;
- full localization closure may still stop at the fauna-evidence gate if evidence is pending;
- after fauna evidence is provisionally accepted, full closure should advance to the next expected runtime-integration gate, not falsely report runtime support.

Do not weaken closure checks.

---

# 22. Overlay-specific verification

For each target locale verify:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved
```

Verify:

- deterministic generated module;
- deterministic sidecar/manifest;
- no empty official values unless explicitly allowed;
- no replacement characters/mojibake;
- correct provider precedence;
- correct locale token/encoding;
- canonical English identity unchanged;
- no runtime registration.

Report per-kind counts.

---

# 23. Fauna-specific verification

For each target locale report:

```text
predicted fauna count
component count
shape counts
screenshots supplied
screenshots mapped
screenshots unresolved
prediction matches
prediction contradictions
evidence status
```

Also report:

- observed separators;
- observed component order;
- punctuation findings;
- agreement/elision findings;
- any limitation caused by evidence coming from a narrow planet/system/sample.

Do not hide limitations.

---

# 24. Commit criterion

The preferred commit criterion for this stage is:

```text
all three official overlays complete
all three reference-name verifiers green
all three fauna evidence statuses provisionally accepted
no unresolved contradiction
runtime still inactive
```

If one locale’s fauna evidence remains pending:

- do not fabricate acceptance;
- report that the deterministic extraction work is complete but the stage is not yet commit-ready;
- preserve work for a later continuation after additional ordinary-play screenshots are supplied.

If all three evidence gates close, the task may be considered commit-ready after review.

---

# 25. Documentation

Update durable localization documentation only where useful.

Likely update:

```text
docs/localization/LOCALE-ONBOARDING.md
```

to reflect, per locale:

```text
semantic catalogue complete
official reference overlay complete
fauna composition evidence status
runtime inactive
```

Do not mark:

```text
Supported
Runtime integrated
```

yet.

If search-corpus observations are durable locale-profile information, record them concisely.

Do not duplicate the audit or write a chronological implementation diary.

---

# 26. Screenshot handling notes

If screenshot filenames are supplied by the user:

- preserve their filenames in evidence records where useful;
- hash them if that is the established evidence pattern;
- do not rename/recompress the user’s originals merely for aesthetics;
- do not commit screenshots if current project policy keeps them ignored/local;
- do not invent screenshot metadata not visible/provided.

If a screenshot visibly contains more than one fauna label, each independently identifiable rendered name may count as a separate observation.

---

# 27. Diff review

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- no runtime activation;
- no semantic-catalogue edits;
- no browser mapping;
- no search implementation;
- no collation/speech integration;
- no UI/CSS changes;
- no canonical provenance rediscovery;
- no Bethesda corpus committed;
- no screenshot corpus committed unless explicitly required by existing policy;
- overlay generation is deterministic;
- evidence status is honest;
- no commit/push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Spanish overlay counts and closure result;
4. Italian overlay counts and closure result;
5. Brazilian Portuguese overlay counts and closure result;
6. canonical provenance reuse confirmation;
7. official table/token/encoding confirmation;
8. Spanish fauna prediction counts;
9. Italian fauna prediction counts;
10. Brazilian Portuguese fauna prediction counts;
11. supplied screenshot inventory by locale;
12. mapped screenshot evidence by locale;
13. unresolved screenshot evidence, if any;
14. observed component-shape coverage;
15. observed separator/order findings;
16. Spanish composition conclusion;
17. Italian composition conclusion;
18. Brazilian Portuguese composition conclusion;
19. contradictions, if any;
20. final evidence status per locale;
21. search-corpus observations per locale;
22. sidecar/manifest status per locale;
23. confirmation semantic catalogues were unchanged;
24. confirmation runtime remains inactive;
25. Japanese/French/German regression results;
26. full test/build/lint results;
27. `git diff --check` result;
28. deviations from the brief;
29. whether all three locales satisfy the preferred commit criterion;
30. blockers before runtime integration;
31. recommended next stage;
32. suggested commit message only if the preferred commit criterion is satisfied.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
