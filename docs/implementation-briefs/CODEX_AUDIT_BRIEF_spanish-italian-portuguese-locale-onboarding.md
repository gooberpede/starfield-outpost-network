# Codex Audit Brief — Spanish, Italian, and Brazilian Portuguese Locale Onboarding Plan

## Purpose

Perform a **read-only audit and implementation-planning pass** for the next Starfield Outpost Tracker localization tranche.

The target languages are:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
```

The purpose of the audit is to determine whether these three locales can be onboarded together using the now-proven localization pipeline established by Japanese and then generalized/validated through French and German.

This is **not** an implementation task.

Do not add locale catalogues, generate committed overlays, modify runtime locale registration, change search behavior, alter CSS/layout, modify persisted data, or expose any new locale in the application.

Do not commit or push.

---

## Naming rule

Planning identifiers used in discussion/audit sequencing must not leak into repository-facing names.

Do not use names such as:

```text
Parcel
Phase
P1/P2/etc.
```

in:

- source identifiers;
- filenames created by the audit;
- npm scripts;
- comments;
- tests;
- commit messages.

Use descriptive names based on actual responsibility.

---

## Audit output

Create the durable audit report at:

```text
docs/audits/SPANISH-ITALIAN-PORTUGUESE-LOCALE-ONBOARDING-PLAN.md
```

The report should be implementation-ready and should end with a recommended implementation sequence.

---

# Product goal

Determine whether Spanish (Spain), Italian, and Portuguese (Brazil) should proceed as one coherent V1 localization tranche.

The current supported Bethesda-language targets are:

```text
English
Japanese
French
German
```

The remaining V1 targets are:

```text
Spanish (Spain)
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

The current planning hypothesis is:

```text
Spanish (Spain) + Italian + Portuguese (Brazil)
```

as one tranche, with Polish and Simplified Chinese handled separately later.

Do not assume the three-locale grouping is correct merely because all three use Latin script. Verify that the current tooling, official inputs, grammar/search needs, reference-name composition behavior, and QA burden make the grouping reasonable.

---

# Primary durable documentation

Read and treat as current policy:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
AGENTS.md
```

Also inspect the completed French/German implementation history and artifacts because they represent the current proven onboarding pattern.

At minimum inspect relevant files under:

```text
docs/implementation-briefs/
docs/audits/
docs/localization/
reference-source/
scripts/localization/
src/localization/
tests/
```

Prioritize the current durable handbook over historical implementation briefs if wording/policy differs.

---

# Current localization architecture to inspect

Audit the current implementation, including:

```text
reference-source/localization-locale-metadata.json
reference-source/official-terminology-provenance.csv
reference-source/official-terminology-values-*.csv
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-c6-fauna.csv
reference-source/localized-reference-names-*-manifest.json
src/localization/locales/
src/localization/generated/
src/localization/reviewPackage.ts
src/localization/reviewAdjudication.ts
scripts/localization/
tests/localization*
```

Also inspect:

- runtime locale registry;
- browser locale resolver;
- locale preference persistence;
- reference-name lookup;
- semantic catalogue parity checks;
- review CSV generation;
- XLIFF generation/re-import;
- neutral adjudication enforcement;
- glossary-constraint matching;
- search normalization/ranking;
- shared collation/formatting;
- accessible shortcut speech;
- locale closure orchestration.

The audit should identify what is already fully data-driven versus what would still require locale-specific implementation.

---

# Lessons from French/German that are now binding

Treat these as established pipeline rules unless new evidence shows a problem:

- official Bethesda names/terminology come from exact qualified identities, not machine translation;
- semantic UI text uses independent Codex + DeepL comparison;
- DeepL XLIFF handoff must include useful context;
- high-risk ambiguous strings need explicit sense disambiguation;
- no machine-translation source is the default winner;
- substantive disagreements require explicit editorial adjudication and rationale;
- glossary constraints must cover all applicable approved concepts and may need key/context-aware matching;
- generated reference overlays are per-locale;
- terminology evidence identity is locale-neutral, locale values are per-locale;
- fauna composition uses evidence-backed prediction plus practical in-game screenshot checking;
- user screenshot collection must be opportunistic, not a targeted foreign-language scavenger hunt;
- physical UI geometry is frozen during localization QA unless a separate reviewed UI task explicitly authorizes changes;
- XLIFF files remain temporarily under `docs/localization/` while active onboarding continues.

Do not regress these decisions.

---

# 1. Determine exact tracker locale IDs

Recommend exact tracker/runtime locale IDs for:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
```

Likely candidates may be:

```text
es-ES
it-IT
pt-BR
```

but verify against:

- current project BCP-47 conventions;
- intended regional target;
- browser locale behavior;
- `Intl` behavior;
- Bethesda language naming;
- future compatibility with unsupported regional variants.

Do not simply adopt likely IDs without checking repository conventions and platform behavior.

The report should recommend exact tracker IDs.

---

# 2. Determine exact Bethesda string-table tokens

Inspect installed Starfield localization archives using the existing intake tooling.

Determine the actual Bethesda tokens used for:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
```

Do not guess token names such as `es`, `it`, `ptbr` from memory.

Record exact observed table member names/tokens.

Verify complete coverage for:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

and terminology-only evidence source:

```text
SFBGS050.esm
```

across:

```text
.strings
.dlstrings
.ilstrings
```

If any locale/plugin/table-type coverage is missing, classify whether that blocks the tranche.

---

# 3. Determine encoding policy

Use bounded diagnostics against the actual installed official tables.

Determine the correct strict encoding for each Bethesda locale token.

Do not guess based on language family.

Requirements:

- fatal decode;
- no byte sniffing;
- no silent fallback;
- clear unsupported-locale failure.

The report should recommend explicit locale-token encoding entries and tests.

---

# 4. Three-locale tranche viability

Assess whether all three languages should stay together through the full onboarding sequence.

Consider:

- shared tooling work;
- official input availability;
- encoding;
- terminology resolution effort;
- three complete semantic catalogues;
- DeepL/editorial workload;
- official reference overlays;
- composed-fauna evidence;
- runtime activation;
- search/collation;
- layout/accessibility QA.

Recommend one of:

```text
one three-locale tranche
```

or:

```text
split into smaller groups
```

If split is recommended, identify the concrete reason rather than generic caution.

---

# 5. Semantic review workflow reuse

Audit whether the current review/XLIFF/adjudication tooling can support three simultaneous locales without architecture changes.

Verify support for:

- deterministic per-locale review CSV;
- exact English source hash;
- context;
- LOW/MEDIUM/HIGH risk;
- placeholders;
- protected tokens;
- official terminology constraints;
- Codex draft;
- DeepL draft;
- comparison state;
- explicit adjudication provenance;
- reviewer rationale;
- final translation;
- stale-source detection;
- stale-constraint detection.

Identify any remaining hard-coded French/German/Japanese assumptions.

Do not propose a translation-management platform.

---

# 6. DeepL/XLIFF planning

Determine how to reuse the current XLIFF handoff for all three locales.

The audit should verify:

- exact generated XLIFF format/version;
- whether DeepL supports all three target language directions cleanly;
- one XLIFF per locale;
- stable message-key round-trip;
- placeholder protection;
- protected-token handling;
- context-note preservation;
- deterministic re-import.

Preserve the current provenance rule:

> committed XLIFF is a deterministic current handoff representation, not historical proof of exact bytes originally submitted to DeepL.

Do not call DeepL during this audit.

---

# 7. Official terminology onboarding

Audit how the current 37 evidence rows / 19 term IDs generalize to the three target locales.

Determine:

- whether the same qualified identities resolve cleanly;
- whether context creates language-specific standalone-term ambiguity;
- whether any official term differs significantly from tracker-owned expectations;
- whether terminology value artifacts can be generated without schema change;
- whether existing verifier behavior is fully locale-parameterized.

Recommend glossary deliverables analogous to:

```text
SPANISH-GLOSSARY.md
ITALIAN-GLOSSARY.md
PORTUGUESE-BRAZIL-GLOSSARY.md
```

or cleaner naming consistent with existing docs.

Do not create the glossaries in the audit.

---

# 8. Tracker-owned terminology risks

Identify likely language-specific risks for recurring tracker concepts, especially:

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
Inorganic
Organic
Network
Active Production
Source
Destination
Undo
Redo
```

Focus on semantic ambiguity, gender/number, agreement, article use, and compact-label suitability.

Do not translate the catalogue during the audit.

The report should identify terms likely to need especially strong context in the later review/XLIFF pass.

---

# 9. Official reference-name pipeline reuse

Confirm that all three locales can reuse:

```text
same 3,561 canonical entities
same 4,818 qualified provenance identities
same providers/FormIDs/string IDs
different locale-specific values
```

Do not rerun canonical discovery.

Audit whether the generalized overlay tooling can produce:

```text
one generated module per locale
one sidecar per locale
```

without additional architecture changes.

Identify any remaining assumptions tied specifically to Japanese/French/German.

---

# 10. Composed fauna

Audit the existing 922-fauna / 2,179-component model for the three locales.

Determine what must be verified per locale before accepting the existing:

```text
prefix + species + diet
U+0020 separator
```

model.

Important product constraint:

The user should **not** be asked to hunt specific fauna by English or foreign-language name.

Future evidence collection should remain:

- normal gameplay in the target locale;
- opportunistic screenshots whenever fauna names are visible;
- Codex/tooling maps screenshots back to canonical identities afterward;
- no Creation Kit navigation requirement;
- no rigid screenshot quota.

The audit should identify likely Spanish/Italian/Brazilian Portuguese grammar/composition risks and what kinds of screenshot examples would be useful if encountered, without turning them into mandatory targets.

---

# 11. Search normalization audit

Inspect actual expected orthography and the current search normalizer.

For each target locale, determine whether the French/German decomposition-based diacritic fold is appropriate.

Investigate likely corpus behavior for:

## Spanish

Potential examples:

```text
á é í ó ú ü ñ
¿ ¡
```

Do not assume `ñ -> n` should or should not fold without examining current normalization behavior and product expectations.

## Italian

Potential examples:

```text
à è é ì ò ó ù
apostrophes
```

## Portuguese (Brazil)

Potential examples:

```text
á â ã à ç é ê í ó ô õ ú ü
```

Assess:

- decomposition-based mark folding;
- characters not handled by combining-mark removal;
- apostrophe variants;
- hyphen variants;
- ligatures if present;
- punctuation actually appearing in official names.

Preserve:

- exact localized spelling at higher rank;
- canonical English aliases;
- abbreviations;
- one result per stable ID.

Do not recommend fuzzy search without evidence.

---

# 12. Collation

Verify that the shared:

```text
Intl.Collator(locale, { sensitivity: 'base', numeric: true })
```

model is appropriate for the three target locales.

Assess only genuinely alphabetical presentation lists:

- systems;
- cargo export candidates;
- Planned Supply alphabetical groups;
- Search tie-breaks.

Preserve domain/user ordering elsewhere.

Identify any locale-specific collation concern that cannot be handled by the shared helper.

---

# 13. Browser-locale mapping

Recommend automatic browser mapping.

Likely conceptual policy:

```text
es-* -> es-ES
it-* -> it-IT
pt-* -> pt-BR
```

but examine whether broad `pt-* -> pt-BR` is appropriate, especially for `pt-PT`.

The audit must explicitly discuss this rather than assuming all Portuguese variants should map to Brazilian Portuguese.

Likewise consider whether all `es-*` should map to Spain Spanish, including Latin American regional tags.

Recommend a clear product policy that does not imply unsupported regional translation.

---

# 14. Locale selector labeling

Recommend self-identifying locale labels.

Likely forms may be:

```text
Español (España)
Italiano (Italia)
Português (Brasil)
```

but verify natural self-labeling and current selector conventions.

Do not decide final locale ordering yet.

Locale-selector ordering will be revisited after all planned languages are onboarded.

---

# 15. Accessible shortcut speech

Audit whether the current small locale speech policy can add all three target locales cleanly.

Determine required localized speech for:

```text
Control
Alt
Shift
plus
Arrow Up
Arrow Down
Arrow Left
Arrow Right
```

Do not alter visible key tokens or shortcut bindings.

No implementation in this audit.

---

# 16. Typography

Assess whether the current Latin font stack covers all required target glyphs.

Check likely glyph sets for:

- Spanish;
- Italian;
- Brazilian Portuguese.

Do not propose new fonts unless real evidence shows missing/poor glyph coverage.

Preserve the geometry freeze:

- no locale-specific font sizing;
- no spacing changes;
- no breakpoints;
- no control resizing;

without a separate reviewed UI decision.

---

# 17. Layout risk

Perform a planning-level risk review using actual completed French/German lessons.

Identify likely high-risk surfaces for the three locales:

- header;
- locale selector;
- network controls;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo Links;
- Search;
- Validation;
- Help;
- About;
- confirmations;
- status feedback.

Do not recommend autonomous geometry changes.

The audit should classify what needs manual observation later and how to report presentation debt without undoing prior UI work.

---

# 18. Accessibility QA reuse

Determine whether the French/German closure checklist can be reused largely unchanged for the next three locales.

Expected Windows/Chromium closure areas include:

- keyboard-only;
- visible focus;
- Search;
- Validation;
- dialogs;
- status/live announcements;
- shortcut speech;
- `document.lang`;
- 1366px;
- 1600px;
- 200% zoom/reflow;
- Narrator smoke;
- typography/glyph rendering.

Native-speaker review remains desirable but non-blocking unless new policy says otherwise.

Apple/WebKit remains shared deferred platform follow-up.

---

# 19. Bundle impact

Estimate the expected additional static-bundle growth from three more semantic catalogues and three more reference overlays.

Do not implement lazy loading.

Assess whether there is any **concrete reason** to pull forward the post-localization bundle review before these three locales are onboarded.

Default assumption should remain:

> finish planned V1 locale onboarding first, then perform the dedicated bundle review.

Only recommend changing that order if evidence shows a practical startup/runtime problem.

---

# 20. Locale selector order

Do **not** settle final selector ordering in this audit.

Record that final locale ordering will be reviewed after all planned V1 locales are onboarded.

The audit may identify whether current registry ordering creates a temporary usability issue, but do not redesign ordering here.

---

# 21. XLIFF cleanup

Do not move existing XLIFF files.

Preserve the settled deferred cleanup:

> after the localization program is complete, relocate working/handoff XLIFF artifacts out of `docs/localization/` into an ignored `.local-work/localization/...` path and update tooling/docs/tests.

The next tranche may continue using the current working location for consistency.

---

# 22. Test strategy

Recommend the minimum durable test expansion for three simultaneous locales.

At minimum consider:

- metadata mapping;
- encoding;
- catalogue parity;
- review/XLIFF round-trip;
- neutral adjudication;
- glossary constraints;
- terminology values;
- overlay closure;
- fauna prediction/evidence;
- browser locale resolution;
- persisted preference;
- reference-name registration;
- search normalization/ranking;
- collation;
- shortcut speech;
- `Intl` formatters;
- locale closure;
- runtime switch regression.

Prefer parameterized tests over copied per-locale suites.

---

# 23. Implementation sequence

Recommend a bounded implementation sequence for the three-locale tranche.

The French/German precedent used distinct work areas for:

- tooling contracts;
- terminology/glossaries;
- semantic catalogue + DeepL review;
- official reference names + fauna evidence;
- runtime/search/collation integration;
- QA/release closure.

Because the tooling is now generalized, determine whether some of those stages can be safely combined or shortened.

Do not combine tasks merely to reduce the number of briefs if doing so makes review less reliable.

---

# 24. Estimated complexity

Estimate each recommended implementation stage.

Separate:

- engineering effort;
- editorial/translation effort;
- DeepL turnaround;
- user screenshot evidence;
- manual QA.

Do not present the estimate as a deadline.

---

# 25. Stop conditions

The audit should identify conditions that would justify splitting the three-locale tranche, including examples such as:

- missing official input coverage;
- incompatible encoding/tooling need;
- language-specific composition model requiring separate architecture;
- review workload becoming impractical;
- regional browser-mapping ambiguity that requires product decision;
- search behavior needing materially different architecture;
- one locale exposing a blocker not shared by the others.

Do not invent blockers without evidence.

---

# Audit constraints

Do not:

- implement any target locale;
- edit locale metadata;
- add catalogues;
- add glossaries;
- generate committed terminology values;
- generate reference overlays;
- change search;
- change runtime registration;
- change locale selector;
- change UI geometry;
- change CSS;
- add fonts;
- move XLIFF files;
- alter persistence/schema;
- commit Bethesda-owned localization corpora;
- commit or push.

Small ignored diagnostics under:

```text
.local-work/localization/es-it-pt-audit/
```

are acceptable if needed.

Do not use planning identifiers in repository-facing diagnostic names if a descriptive alternative is available.

---

# Verification

Because this is an audit, production implementation tests are not required unless tracked files other than the audit report are changed.

At minimum run:

```text
git diff --check
```

If local diagnostics are used, report exactly what was inspected.

Confirm:

- no runtime implementation changed;
- no Bethesda localization corpus was committed;
- no commit or push occurred.

---

# Required report structure

The durable audit report should contain:

1. Executive summary
2. Recommendation on keeping all three locales together
3. Exact recommended tracker locale IDs
4. Exact observed Bethesda tokens
5. Official table coverage by plugin/table type
6. Encoding findings
7. Current pipeline readiness
8. Remaining hard-coded locale assumptions
9. Semantic review/XLIFF readiness
10. DeepL workflow recommendations
11. Official terminology readiness
12. Proposed glossary strategy
13. Tracker-owned terminology risks
14. Reference-overlay readiness
15. Provenance reuse
16. Composed-fauna evidence plan
17. Spanish search considerations
18. Italian search considerations
19. Brazilian Portuguese search considerations
20. Collation
21. Browser-locale mapping policy
22. Locale selector labels
23. Accessible shortcut speech
24. Typography
25. Layout-risk review
26. Accessibility/manual QA plan
27. Bundle impact
28. XLIFF/selector-order deferred items
29. Automated test plan
30. Recommended implementation sequence
31. Estimated complexity
32. Transferable lessons for Polish
33. Transferable lessons for Simplified Chinese
34. Explicit blockers/user decisions before implementation

---

# Completion response

Return a concise summary covering:

- whether Spanish/Italian/Brazilian Portuguese should remain one tranche;
- recommended tracker locale IDs;
- exact Bethesda tokens;
- encoding policy;
- official input coverage;
- whether any new localization architecture is required;
- DeepL/XLIFF readiness;
- terminology/glossary readiness;
- reference-overlay readiness;
- composed-fauna evidence plan;
- search/collation findings;
- browser locale mapping recommendation;
- typography/layout/accessibility risks;
- bundle impact;
- recommended implementation stages;
- estimated effort;
- any user decisions required before implementation;
- audit report path;
- files changed;
- `git diff --check` result;
- confirmation no implementation, commit, or push occurred.

Do not proceed into implementation without a separate brief.
