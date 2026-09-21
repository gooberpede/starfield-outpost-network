# Codex Implementation Brief — Polish Official Reference Names and Fauna Evidence

## Objective

Implement the next Polish onboarding batch by generating and verifying the complete official Polish reference-name overlay and evaluating Polish fauna composition against the supplied first-party in-game screenshots.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   inactive
```

This parcel should produce:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
reference-source/localized-fauna-evidence-pl-PL.json
```

plus any deterministic local prediction/support artifacts required by the existing fauna-evidence workflow.

Do not activate Polish at runtime in this task.

Do not change the final Polish semantic catalogue unless an actual terminology/reference contradiction is discovered and reported first.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Use:

```text
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
docs/localization/POLISH-GLOSSARY.md
reference-source/official-terminology-values-pl-PL.csv
src/localization/locales/pl-PL.ts
reference-source/localization-locale-metadata.json
```

and the unchanged canonical provenance/reference population.

Known expected closure:

```text
3,561 canonical entities
4,818 qualified provenance rows
0 unresolved
```

Expected entity counts:

```text
428 biomes
1,776 bodies
1,121 species
5 official terms
30 products
78 resources
123 systems
----------------
3,561 total
```

Do not regenerate or redefine canonical provenance merely to onboard Polish.

---

# Supplied first-party fauna evidence

The user is supplying a ZIP of eight Polish in-game screenshots alongside this brief:

```text
screenshots-pl.zip
```

The screenshots were taken during normal gameplay on:

```text
Jemison
Codos
```

Expected image filenames inside the ZIP:

```text
20260921151638_1.jpg
20260921151733_1.jpg
20260921151747_1.jpg
20260921151812_1.jpg
20260921151827_1.jpg
20260921152438_1.jpg
20260921152536_1.jpg
20260921152602_1.jpg
```

Treat these as the initial first-party rendered evidence set for Polish fauna composition.

Do not request additional screenshots merely to satisfy a quota.

Do not target-hunt for specific fauna unless a contradiction or genuine evidentiary gap is discovered later.

---

# 1. Generate the official Polish reference overlay

Use the existing generalized reference-name materializer.

Generate:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
```

from:

```text
pl-PL -> pl -> strict UTF-8
```

Requirements:

- unchanged canonical provenance;
- exact winning-provider behavior;
- strict UTF-8;
- no replacement decoding;
- no guessed/fan/community translations;
- deterministic output;
- exact entity coverage;
- exact qualified-row closure;
- official skill/term reconciliation;
- resource/product reconciliation;
- manifest/source-table identity verification.

Expected:

```text
3,561 / 3,561 entities
4,818 / 4,818 qualified rows
0 unresolved
```

If any count differs, stop and investigate rather than patching locally.

---

# 2. Verify overlay kind counts

Verify exact expected population:

```text
biomes          428
bodies        1,776
species       1,121
official terms    5
products          30
resources         78
systems          123
total           3,561
```

Report any deviation explicitly.

---

# 3. Preserve official standalone reference names exactly

Reference-overlay values are official Bethesda standalone names.

Do not project contextual declension from Polish prose onto standalone names.

Do not:

- decline body/system/resource/product/species names;
- title-case them according to English habits;
- normalize abbreviations away;
- expand official compact components;
- replace punctuation;
- remove Polish diacritics.

Preserve the official supplied value unless the existing pipeline has an already-approved normalization.

---

# 4. Generate Polish fauna predictions

Reuse the fixed existing fauna population and prediction model:

```text
922 composed fauna
2,179 components

267 prefix + species
335 prefix + species + diet
320 species + diet
```

Baseline hypothesis:

```text
component order exactly as modeled
literal U+0020 between non-empty components
component text unchanged
```

Generate the deterministic Polish prediction support through the existing workflow.

Do not treat predictions as proof.

They are the hypothesis tested by first-party screenshots.

---

# 5. Polish-specific fauna risks

The Polish onboarding audit identified these as the main composition risks:

- adjective agreement with species gender/number;
- component declension or mutation during composition;
- noun/adjective ordering;
- diet-role form changes;
- abbreviated prefixes deliberately avoiding agreement;
- capitalization after abbreviated prefixes;
- preservation of periods in abbreviations;
- hyphenation or punctuation replacing U+0020;
- different behavior among the three composition shapes.

Pay particular attention to these when comparing the supplied screenshots.

Do not invent grammar rules that the rendered evidence does not demonstrate.

---

# 6. Ingest the supplied screenshots as evidence

Inspect all eight supplied images.

For each image:

1. identify the body/planet from the visible scanner UI and user context;
2. transcribe the visible fauna label exactly as rendered;
3. map the rendered fauna to the correct canonical stable fauna/species identity;
4. retrieve its predicted Polish composed name;
5. identify its composition shape;
6. compare:
   - component order;
   - component spelling;
   - abbreviations;
   - punctuation;
   - separator;
   - visible inflection/mutation;
7. classify the observation as:
   - exact match;
   - match under known scanner presentation casing;
   - truncated but consistent;
   - ambiguous/unmappable;
   - contradiction.

Do not rely on filename order alone to identify fauna.

Use the visible name, body context, and canonical data.

---

# 7. Scanner casing is presentation evidence, not source-name capitalization

The scanner UI renders fauna labels in uppercase/uppercase-like presentation.

Record the screenshot text literally, but do not infer that the underlying official composition components should be stored in uppercase merely because the scanner displays them that way.

Comparison may account for established scanner casing presentation.

Do not otherwise normalize:

- punctuation;
- spaces;
- periods in abbreviations;
- Polish letters;
- word order.

A case-only scanner transformation may still count as an exact composition match if the underlying component sequence/text is otherwise identical.

Document this explicitly in the evidence record.

---

# 8. Abbreviated prefixes are important evidence

The supplied screenshots appear to include abbreviated Polish fauna components/prefixes.

Treat periods and abbreviations as meaningful evidence.

If the official component is something like an abbreviated prefix:

```text
Stadn.
Gromad.
Poluj.
```

or another abbreviation observed in the actual tables/screenshots, preserve the official component exactly.

Do not expand it to a full inferred Polish word.

Do not remove its terminal period.

The purpose of evidence is to confirm how Bethesda actually composes names, not to regularize them.

---

# 9. Shape coverage

Determine which of the three modeled shapes the supplied evidence actually covers:

```text
prefix + species
prefix + species + diet
species + diet
```

Do not assume from word count alone; map to the canonical component identities.

Report:

- number of supplied observations by shape;
- exact matches by shape;
- truncated observations by shape;
- contradictions by shape.

No minimum quota is required.

If one shape is not represented but all supplied evidence is non-contradictory, report that limitation without blocking provisional acceptance automatically.

---

# 10. Exact vs truncated evidence

Use this evidence policy:

## Exact visible label

If the entire rendered fauna name is visible and maps confidently:

- compare the full prediction;
- eligible to support exact acceptance.

## Truncated visible label

If the UI visibly truncates a fauna name:

- preserve the visible substring;
- record it as truncated;
- use it only for the component/order facts it actually demonstrates;
- do not claim full-string equality.

## Ambiguous screenshot

If multiple canonical fauna could plausibly match:

- record the ambiguity;
- do not force-map it.

Do not use OCR uncertainty as evidence of contradiction.

Prefer direct visual inspection and canonical matching.

---

# 11. Evidence record

Create/update:

```text
reference-source/localized-fauna-evidence-pl-PL.json
```

following the existing generalized evidence schema.

For each observation include the established fields, including where applicable:

- tracker locale;
- stable fauna ID;
- body/context;
- screenshot filename/reference;
- observed rendered text;
- predicted text;
- composition shape;
- match status;
- truncation status;
- component/order notes;
- punctuation/separator notes;
- grammar notes;
- acceptance/rejection relevance.

Do not embed screenshot image bytes.

Do not commit the screenshots themselves unless the repository's established prior-locale evidence policy explicitly does so. The durable evidence JSON should be sufficient.

---

# 12. Provisional fauna-composition acceptance

Use the same standard as previous locales.

Polish fauna composition may be provisionally accepted if:

- the supplied first-party evidence maps confidently;
- exact/full observations are consistent with the predicted component order and text;
- truncated observations do not contradict it;
- there is no evidence of unmodeled inflection/mutation;
- punctuation/separator behavior is consistent with the model;
- no screenshot contradicts a modeled shape.

Do **not** require:

- a fixed screenshot count;
- one screenshot per planet;
- one screenshot per fauna family;
- Creation Kit evidence;
- deliberate target hunting.

If evidence is thin for a particular shape, record the limitation.

---

# 13. Contradiction policy

If even one clear, full, confidently mapped first-party screenshot contradicts:

```text
component order
component identity/text
inflection/mutation
separator
punctuation
```

do not create a one-off exception.

Instead:

1. mark Polish fauna composition as not yet accepted;
2. identify the contradicted Polish-specific rule;
3. determine whether the issue generalizes by component/shape;
4. stop before runtime activation;
5. report the evidence for review.

Do not regenerate canonical provenance.

Do not alter other locales.

---

# 14. Search-corpus observations

While generating the overlay, record the Polish reference-name corpus observations needed for the later runtime-search parcel.

Confirm:

- all Polish letters actually present;
- apostrophe forms;
- hyphen forms;
- punctuation;
- any additional search-relevant characters.

Re-run the bounded collision analysis for the searchable resource/product population under:

```text
exact normalized text
NFD combining-mark fold
NFD fold + ł -> l
```

Expected audit result was zero new distinct-name collisions.

Do not implement runtime search in this parcel.

If the generated committed overlay changes that finding, report it.

---

# 15. Terminology/reference reconciliation

Verify that overlay values for official terms/skills agree with the already-approved Polish terminology policy where identities overlap.

Do not silently rewrite either side to make them match.

If a genuine contradiction appears between:

```text
official-terminology-values-pl-PL.csv
```

and the generated overlay, stop and report it.

---

# 16. No semantic catalogue changes unless contradiction exists

The final Polish semantic catalogue already exists:

```text
src/localization/locales/pl-PL.ts
```

Do not edit it during ordinary overlay/fauna work.

Only report a problem if official reference evidence reveals a genuine terminology contradiction that affects the semantic catalogue.

Do not opportunistically revise translations.

---

# 17. Runtime remains inactive

Hard requirement:

```text
runtimeAvailable: false
```

must remain unchanged.

Do not add Polish to:

- runtime locale registry;
- selector;
- browser resolution;
- search;
- runtime collation;
- shortcut speech;
- `document.lang`.

The generated overlay may exist without runtime registration.

---

# 18. Tests

Add/extend durable Polish coverage for:

- deterministic reference-overlay generation;
- 3,561 entity closure;
- 4,818 qualified-row closure;
- exact per-kind counts;
- strict UTF-8;
- manifest/source-table identity;
- official skill/term reconciliation;
- resource/product reconciliation;
- fauna prediction population:
  - 922 fauna;
  - 2,179 components;
  - all three shapes;
- Polish evidence-file schema;
- screenshot evidence mapping;
- evidence contradiction rejection;
- provisional acceptance rules;
- stale evidence detection;
- Polish search-fold collision diagnostics if existing tests cover this layer.

Prefer parameterized/shared tests.

---

# 19. Verification

Run at minimum:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify -- --locale pl-PL
npm run localization:terminology:verify
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any focused fauna-evidence build/verify command used for prior locales.

Report the actual command names if they differ.

---

# 20. Scope discipline

Expected tracked changes may include:

```text
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
reference-source/localized-fauna-evidence-pl-PL.json
reference-name/fauna tests
small generalized test/tooling extensions if genuinely needed
```

Do not change:

```text
src/localization/locales/pl-PL.ts
src/ui/*
CSS
runtime locale registry
browser resolver
search runtime
persistence/domain code
```

unless a genuine contradiction/tooling bug is discovered and explicitly reported.

---

# 21. Completion criteria

This parcel is complete when:

- Polish overlay generates deterministically;
- all 3,561 entities resolve;
- all 4,818 qualified rows resolve;
- exact per-kind counts match;
- official terminology reconciliation passes;
- 922 fauna predictions / 2,179 components are generated/verified;
- all eight supplied screenshots are inspected and accounted for;
- every mappable observation has a durable evidence record;
- Polish fauna composition is either:
  - provisionally accepted with explicit limitations; or
  - explicitly held because of a clear contradiction;
- search-corpus/collision observations are recorded for later runtime integration;
- Polish remains runtime-inactive.

---

# Completion response

Return:

1. branch;
2. files changed;
3. overlay path;
4. manifest path;
5. entity closure count;
6. qualified provenance closure count;
7. per-kind entity counts;
8. unresolved count;
9. terminology/reference reconciliation result;
10. fauna prediction count;
11. fauna component count;
12. fauna shape counts;
13. supplied screenshot count;
14. screenshot filenames inspected;
15. Jemison observations mapped;
16. Codos observations mapped;
17. observation count by composition shape;
18. exact-match count;
19. scanner-case-only match count, if tracked separately;
20. truncated-match count;
21. ambiguous/unmapped count;
22. contradiction count;
23. notable abbreviation/punctuation evidence;
24. notable Polish grammar/agreement evidence;
25. separator/order finding;
26. provisional fauna-composition decision;
27. limitations of the evidence set;
28. evidence JSON path;
29. Polish search-corpus observations;
30. `ł -> l` collision result;
31. other fold-collision result;
32. deterministic-generation result;
33. automated verification results;
34. `git diff --check` result;
35. confirmation semantic catalogue unchanged;
36. confirmation runtime remains inactive;
37. deviations from brief;
38. unresolved user decisions, if any;
39. recommended next stage;
40. suggested commit message;
41. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.
