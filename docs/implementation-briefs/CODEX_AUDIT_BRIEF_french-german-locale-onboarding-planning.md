# Codex Audit Brief — French and German Locale Onboarding Planning

## Purpose

Perform a **read-only audit and implementation-planning pass** for the next localization tranche of the Starfield Outpost Tracker.

The locked target locales are:

```text
French
German
```

This audit should determine exactly how the current localization system, which was hardened around Japanese, should be extended so French and German can be onboarded cleanly and efficiently.

This is **not** an implementation parcel.

Do not add French or German catalogues, generate production overlays, alter runtime locale behavior, change CSS, modify source datasets, or change localization tooling unless a tiny diagnostic spike is genuinely required to answer an audit question.

Do not commit or push.

---

## Audit output

Create the durable report at:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
```

The report should be implementation-ready and should end with a recommended parcel sequence.

---

# Product decision already settled

The project’s V1 localization target is the full Starfield interface/text language set.

Current supported tracker locales:

```text
en-US    complete baseline
en-GB    sparse override
ja-JP    complete
```

The remaining substantial V1 locales are:

```text
French
German
Spanish (Spain)
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

For the next tranche, **French and German are locked in together as the target pair**.

Do not revisit whether another locale should come first unless repository evidence reveals a concrete blocker that makes one of these two impractical.

---

# Why French and German are paired

This pair is intentional.

French should provide a comparatively conventional Latin-script onboarding case.

German should act as a useful stress case for:

- long labels;
- compound words;
- layout expansion;
- dense controls;
- wrapping;
- breakpoint pressure;
- tooltip/help density;
- accessible labels.

The goal is to prove that the current Japanese-derived architecture has become a repeatable multi-locale onboarding process.

The audit should determine whether French and German can realistically remain one implementation tranche or whether repository/tooling evidence justifies splitting them.

Do not split them by default.

---

# Required durable documentation

Read and treat these as current policy:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
AGENTS.md
```

The two localization documents are the primary source of truth for current onboarding policy.

Do not override their current policy with an older historical brief.

---

# Historical implementation material

Inspect the earlier Japanese localization briefs selectively to understand how the current tooling and policies emerged.

At minimum inspect:

```text
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-coverage-and-japanese.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-inventory-and-architecture.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-parcel-c-canonical-string-provenance.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-parcel-c-organic-resource-provenance.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-parcel-c6-composed-fauna-naming.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-parcel-c7-official-master-hardening.md
docs/implementation-briefs/CODEX_AUDIT_BRIEF_japanese-search-typography-layout-hardening.md
```

Also inspect any implementation/correction briefs directly related to:

- Japanese semantic catalogue creation;
- Japanese reference-name overlay generation;
- localization review CSVs;
- terminology provenance;
- Japanese closure verification;
- locale-specific typography/search/collation work.

The historical briefs are evidence and implementation history.

`LOCALE-ONBOARDING.md` and `LOCALIZATION-INPUTS.md` remain authoritative where wording or policy has evolved.

---

# Existing localization architecture to inspect

Audit the current repository implementation, including at minimum:

```text
src/localization/
src/localization/locales/
src/localization/generated/
scripts/localization/
reference-source/localization-provenance-policy.json
reference-source/official-terminology-policy.json
reference-source/official-terminology-provenance.csv
reference-source/localized-name-provenance*
reference-source/localized-reference-names-manifest.json
docs/localization/
tests/
package.json
```

Also inspect:

- locale selector/preference code;
- runtime reference-name lookup;
- locale-aware search;
- locale-aware collation;
- font/typography rules;
- localized help/keyboard shortcut strings;
- validator localization;
- status/transient feedback;
- history labels;
- dialogs;
- About;
- Search Results;
- Resource Matrix;
- Planned Supply;
- Cargo Links;
- Navigation.

The purpose is to distinguish what is already genuinely generic from what is still implicitly or explicitly Japanese-specific.

---

# Core audit question

The central question is:

> What must change, and what must not change, to onboard French and German as first-class V1 locales using the current architecture?

The audit should prefer reuse over redesign.

Japanese already solved most of the architecture.

Do not propose a new localization framework merely because more locales are being added.

---

# 1. Locale-identifier decisions

Determine the appropriate tracker locale identifiers for French and German.

Inspect existing repository conventions before recommending final tags.

Likely candidates may be region-specific locales such as:

```text
fr-FR
de-DE
```

but do not simply assume them.

Confirm against:

- Bethesda locale data naming;
- browser locale resolution;
- existing project locale conventions;
- `Intl` behavior;
- future fallback behavior.

The report should recommend exact locale identifiers for implementation.

---

# 2. Bethesda localization input availability

Audit the current installed-game localization input path for French and German.

Using `LOCALIZATION-INPUTS.md` and current tooling, determine:

- Bethesda locale tokens used by the string tables;
- which BA2 archives provide them;
- whether the current intake tool already discovers them cleanly;
- whether the input manifest format already supports adding both locales in one config;
- expected string-table types;
- whether coverage is available for all canonical/terminology source plugins currently used by the tracker.

Do not commit or redistribute Bethesda string tables.

If installed game files are unavailable in the audit environment, distinguish:

```text
repository-proven fact
```

from:

```text
local-input step that must be verified during implementation
```

Do not guess from memory where the repository can answer.

---

# 3. Encoding policy

`LOCALIZATION-INPUTS.md` currently records explicit locale-policy decoding, with English and Japanese as known examples.

Audit what encodings the official French and German Starfield string tables actually require.

Determine:

- whether both use the same encoding as English;
- whether either requires a new explicit encoding entry;
- where encoding policy is currently hard-coded;
- what tests should enforce it;
- whether multiple added locales can share the same decoding policy cleanly.

Do not introduce byte-guessing.

The existing fail-closed principle must remain.

---

# 4. Semantic tracker catalogue onboarding

Audit the current full semantic catalogue model.

Determine:

- current `en-US` key count;
- exact parity requirements;
- placeholder rules;
- which scripts/tests currently assume only `ja-JP`;
- whether full-locale catalogues are structurally generic;
- how French and German files should be created;
- whether one implementation parcel can safely add both.

The eventual implementation should preserve:

```text
en-US = complete baseline
en-GB = sparse override
full non-English locales = exact key and placeholder parity
```

Do not recommend sparse French/German release catalogues.

---

# 5. Tracker-authored translation workflow

The Japanese effort used an independent comparison workflow for project-owned strings.

The intended French/German workflow is:

```text
English semantic source
    -> Codex translation
    -> independent DeepL translation
    -> comparison/review
    -> editorially resolved final catalogue
```

The user currently has an active DeepL trial and is willing to use it.

Audit how to reproduce this workflow cleanly for French and German.

Determine:

- whether existing Japanese review CSV structure can be generalized/reused;
- what columns are needed;
- whether the review artifact should contain:
  - key;
  - English source;
  - parameters/placeholders;
  - Codex translation;
  - DeepL translation;
  - disagreement indicator;
  - final selected translation;
  - reviewer note/rationale;
  - official-term constraints where relevant;
- whether separate review CSVs should exist per locale;
- whether a generator can produce the review source deterministically;
- how later English-source drift should be detected;
- how the final approved catalogue should relate to the review artifact.

Do **not** treat DeepL as authoritative.

The purpose of DeepL is independent cross-checking.

Where Codex and DeepL disagree:

- compare both against the English source;
- honor official Bethesda terminology where applicable;
- consider UI context;
- choose editorially;
- record meaningful decisions where useful.

Do not mechanically choose the shorter, more literal, or DeepL version.

---

# 6. Glossary and terminology constraints

Audit whether French and German should each receive a durable locale glossary analogous to Japanese.

Determine:

- current Japanese glossary location/format;
- what parts are reusable;
- whether official Bethesda terms should populate glossary constraints;
- how tracker-owned terms should be stabilized before bulk translation;
- how abbreviations and technical tokens should be treated;
- how to prevent translation drift between visually similar concepts.

Particular tracker concepts to inspect include:

```text
Outpost
Cargo Link
Inter-System Cargo Link
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
X-Tech
X-Tech Power Core
```

Do not assume the English conceptual relationships translate mechanically.

---

# 7. Official Bethesda terminology

Audit the current terminology provenance workflow for both target locales.

Determine:

- whether the current `official-terminology-provenance.csv` is locale-neutral identity evidence that can be reused;
- how French/German official text should be resolved from the same qualified identities;
- whether terminology-only evidence from `SFBGS050.esm` works without architecture changes;
- whether runtime locale terminology should live in semantic catalogues, generated overlays, or another existing boundary;
- whether any current verifier is hard-coded to Japanese.

Preserve the distinction between:

```text
canonical content sources
terminology-only evidence sources
tracker-owned terminology
```

Do not translate official Bethesda terms with Codex/DeepL where official localized wording is available.

---

# 8. Official reference-name overlays

Audit how the Japanese generated reference-name overlay should generalize to two additional locales.

Current Japanese closure is documented as:

```text
3,561 canonical names
4,818 qualified provenance rows
0 unresolved
```

with kinds including:

```text
biomes
bodies
species
official terms
products
resources
systems
```

Determine:

- which generator/verifier paths are still `ja-JP`-specific;
- whether they should become locale-parameterized now;
- whether output should remain one generated module per locale;
- whether the sidecar manifest should remain one shared manifest or become per-locale;
- how upstream table hashes/locale identity should be represented;
- how multiple generated overlays should be registered at runtime;
- whether adding two locales creates undesirable static bundle duplication;
- whether any optimization should be deferred until the planned post-localization bundle review.

Do not introduce lazy loading merely because there will be more locale files.

Measure later; preserve the existing roadmap.

---

# 9. Provenance pipeline reuse

Audit whether the existing canonical provenance data is already sufficient for French and German without re-discovering identities.

Expected model:

```text
same canonical entity population
same provider identities
same FormIDs
same qualified string identities
different locale-specific localized values
```

Verify this from the current contracts.

The audit should explicitly identify any step that should **not** be rerun or redesigned.

Future locale onboarding must not rediscover canonical identities by matching English names.

---

# 10. Composed fauna

This is a critical audit area.

Japanese required explicit composed-fauna analysis and a documented composition policy.

For French and German, determine:

- whether the existing semantic prefix/species/diet provenance is sufficient;
- whether fixed component order is safe to reuse;
- whether official French/German composition requires independent evidence;
- whether separators/punctuation differ;
- whether articles, inflection, gender, agreement, or elision can affect composed fauna;
- whether Bethesda strings themselves encode enough grammar to preserve the existing composition model;
- what representative checks are needed before accepting full overlay generation.

Do not assume that because French/German use Latin script they share English composition.

Do not prebuild a grammar engine unless evidence proves one is required.

The report should recommend a bounded proof set for each locale before full generation.

---

# 11. Search behavior

Audit the current localized Search behavior for French and German.

Preserve the existing principle:

```text
one stable entity
multiple searchable aliases
localized display
canonical English remains searchable
```

Determine whether French or German require additional normalization beyond current behavior.

Check:

- case folding;
- accents/diacritics;
- apostrophes;
- hyphens;
- German umlauts;
- `ß`;
- canonical English aliases;
- abbreviations;
- `Intl.Collator`;
- prefix/substring behavior.

Do not add fuzzy search or broad transliteration without evidence.

For German, explicitly consider whether users may type ASCII substitutions such as:

```text
ae / oe / ue / ss
```

but do not recommend them automatically unless product or game-language evidence justifies them.

---

# 12. Collation

Audit locale-aware alphabetical presentation under French and German.

Determine whether the current shared collator is sufficient and whether the correct locale tag will naturally provide the desired behavior.

Preserve domain order for non-alphabetical lists.

Explicitly re-check:

- system selector;
- cargo export candidates;
- Planned Supply alphabetical groups;
- Search tie-breaking.

Do not locale-sort:

- resource-family topology;
- body/orbit/source order;
- persisted outpost order;
- cargo user order;
- validation severity/rule order;
- history chronology.

---

# 13. Typography

Audit whether the current Latin UI/font stack adequately supports French and German.

Check:

- accented French characters;
- German umlauts;
- `ß`;
- mono/technical surfaces;
- fallback behavior;
- tracking/case transformations;
- uppercase rendering.

Expected outcome may be that no locale-specific font stack is needed, but verify rather than assume.

Do not add font binaries.

Do not add new web-font dependencies merely for these locales.

---

# 14. Layout and density

Perform a planning-level layout risk review for both languages.

German should receive particular attention.

Identify high-risk UI surfaces based on current component/CSS structure and expected translated string length.

At minimum include:

```text
title/header
locale selector
Help/About controls
network controls
Navigation
Outpost Details
System/Body selectors
Resource Matrix
Planned Supply
Cargo Links
Search
Validation
Keyboard Shortcuts dialog
About dialog
confirmation dialogs
import/export/status feedback
```

The report should identify:

- which surfaces need manual 1366px verification;
- which need 1600px verification;
- which need 200% zoom/reflow checks;
- whether any existing fixed widths are likely to fail;
- whether German likely exposes structural rather than locale-specific defects.

Do not prescribe German-only CSS unless evidence makes that unavoidable.

Cross-locale layout fixes are preferred.

---

# 15. Keyboard Shortcuts Help dialog

This was added after much of the Japanese localization work.

Audit it explicitly for French and German.

Check:

- all action labels;
- group headings;
- accessible chord labels;
- two-column layout;
- one-column breakpoint;
- long German labels;
- Redo dual-chord wrapping;
- modal dimensions;
- 200% zoom.

Do not change shortcut bindings.

---

# 16. Accessibility

Audit whether locale onboarding needs any new accessibility implementation rather than only verification.

Check:

- localized accessible names;
- screen-reader-visible text;
- dialog naming/descriptions;
- status/live-region messages;
- search announcements;
- validation text;
- keyboard shortcut help.

Japanese exposed global accessibility defects previously, but those are now considered fixed.

Do not reopen the completed accessibility batch unless current code reveals a real locale-specific gap.

---

# 17. Formatting

Audit French/German use of current `Intl` helpers.

Check current user-facing:

- numbers;
- percentages;
- lists;
- collation.

Also verify that user-visible dates/times are still absent or deferred as documented.

Persisted/schema values and export filename timestamps remain invariant.

Do not add ICU/FormatJS unless a real French/German message requirement demonstrates that the current interpolation model cannot express correct grammar.

If a real limitation exists, identify the exact message(s).

---

# 18. Locale selection and fallback

Audit browser/automatic locale resolution for French and German.

Determine expected behavior for browser language values such as:

```text
fr
fr-FR
fr-CA
de
de-DE
de-AT
de-CH
```

Recommend exact fallback/mapping policy.

The target locales should resolve predictably without accidentally presenting an unsupported regional variant as though separately translated.

Document what `Automatic` should do.

Do not create region-specific translation catalogues that are outside the V1 scope.

---

# 19. Runtime registration and bundle impact

Audit how locales are registered and bundled.

Determine:

- how many locale catalogues are statically imported today;
- how generated reference overlays are imported;
- approximate impact of adding French and German;
- whether implementation can remain statically bundled for now.

Do not optimize solely because Vite reports a large chunk.

The project already has a planned **post-localization bundle review after all planned V1 locales are onboarded**.

The audit should distinguish:

```text
necessary architecture change now
```

from:

```text
optimization intentionally deferred until after locale onboarding
```

---

# 20. Tooling generalization

Produce a concrete inventory of Japanese-specific assumptions.

Classify each as:

```text
already generic
rename/generalize now
safe locale-specific exception
defer
```

Inspect especially:

- npm scripts;
- CLI arguments;
- generated filenames;
- manifest filenames;
- verifier names;
- locale policy tables;
- review CSV tooling;
- tests;
- hard-coded locale unions;
- runtime registry;
- reference-name lookup;
- typography selectors;
- search/collation helpers;
- docs.

Do not generalize for hypothetical future flexibility if adding `fr` and `de` cleanly does not require it.

---

# 21. Test strategy

Audit and recommend the minimum durable test expansion.

At minimum consider:

- locale catalogue key parity;
- placeholder parity;
- locale registry coverage;
- browser-locale resolution;
- official reference-name overlay closure;
- provenance hashes/drift;
- terminology closure;
- search localized-name and English-alias behavior;
- locale collation;
- accent/umlaut handling;
- composed fauna representative cases;
- Help dialog completeness;
- layout/manual test matrix.

Avoid duplicating identical tests once per locale where a parameterized contract test is cleaner.

The audit should explicitly identify which current Japanese tests should become locale-parameterized.

---

# 22. Manual review workflow

Recommend a practical manual workflow for the implementation tranche.

The expected broad sequence is:

```text
1. prepare/generate review source
2. Codex translation
3. DeepL independent translation
4. compare
5. editorially resolve disagreements
6. integrate catalogues
7. extract/resolve Bethesda official names and terminology
8. generate overlays
9. run automated closure
10. manual UI/layout/search/accessibility review
```

The audit may recommend a different order if repository dependencies justify it.

Make clear which steps require the user to provide DeepL output manually.

Do not assume Codex can call DeepL directly.

---

# 23. DeepL handoff design

Because DeepL is an external manual step, recommend a low-friction exchange format.

Prefer something deterministic and easy to paste/upload, such as CSV/TSV, with protected placeholders intact.

The report should specify:

- exact columns;
- whether one file per locale is better than one combined file;
- how placeholders/tokens should be protected;
- how multiline strings should be represented;
- how re-import/comparison should work;
- how to detect lost placeholders or technical tokens;
- how to flag identical translations vs substantive disagreements.

Do not design a large translation-management system.

This is a small application.

---

# 24. Official vs machine-translated text boundary

Reassert and verify the boundary:

## Bethesda-authored

Use official French/German Bethesda localization wherever available:

- resources;
- products;
- systems;
- bodies;
- biomes;
- species/components;
- official skills/terms;
- X-Tech terminology;
- other canonical game-native names.

## Tracker-authored

Use project translation workflow:

- UI controls;
- explanations;
- validation;
- status feedback;
- Help;
- About;
- accessibility text;
- tracker-specific terminology.

Do not feed official reference names through Codex/DeepL as substitutes for Bethesda strings.

---

# 25. Documentation updates expected during implementation

Identify which durable docs should be updated when French/German implementation eventually completes.

Likely candidates include:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/BACKLOG.md
```

Possibly architecture/UX docs if genuinely necessary.

The audit should recommend what belongs in:

- shared onboarding policy;
- French locale profile;
- German locale profile;
- historical audit record.

Do not edit those documents in this audit unless the audit itself needs a tiny factual correction.

---

# 26. Implementation parcel sizing

The report must make a recommendation on whether French + German should be:

```text
one implementation parcel
```

or:

```text
multiple bounded implementation parcels
```

Do not decide based only on file count.

Consider:

- tooling generalization;
- Bethesda input generation;
- two semantic catalogues;
- two DeepL review cycles;
- official reference overlays;
- composed fauna proof;
- typography/layout QA;
- tests;
- documentation.

If splitting is recommended, prefer coherent boundaries.

Possible boundaries might be:

```text
A. tooling/generalization
B. semantic catalogues + review
C. official reference names/terminology
D. search/layout/accessibility closure
```

but do not force this shape if a better sequence emerges.

---

# 27. Future-locale lessons

The audit should identify which French/German work will materially reduce cost for later:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
Polish
Simplified Chinese
```

Especially determine whether, after French/German, Spanish/Italian/Portuguese can realistically be onboarded as a three-locale tranche.

Do not audit those languages in depth.

Only record transferable lessons and remaining known architecture gaps.

---

# Audit constraints

Do not:

- implement French;
- implement German;
- add locale catalogues;
- generate committed French/German reference overlays;
- modify runtime locale registration;
- change UI/CSS;
- add dependencies;
- add ICU/FormatJS;
- change persistence/schema;
- alter reference identities;
- redistribute Bethesda localization data;
- add font files;
- call DeepL;
- commit or push.

Small read-only or untracked diagnostic scripts are acceptable only if needed to prove repository/tool behavior.

Place temporary work under:

```text
.local-work/localization/fr-de-audit/
```

and leave it untracked.

---

# Verification

Because this is primarily a read-only audit, no production implementation test run is required unless tracked files beyond the audit report are changed.

At minimum run:

```text
git diff --check
```

If any diagnostic scripts are executed, report exactly what they inspected.

Confirm no Bethesda string-table content or game-file dumps were committed.

---

# Required report structure

The durable audit report should contain, at minimum:

1. Executive summary
2. Current localization architecture
3. Current French/German readiness
4. Locale identifiers and browser fallback policy
5. Bethesda input/table availability
6. Encoding policy
7. Semantic catalogue onboarding
8. Codex + DeepL review workflow
9. Review CSV/handoff design
10. Glossary strategy
11. Official terminology reuse
12. Reference-name overlay generalization
13. Provenance-pipeline reuse
14. Composed-fauna requirements
15. Search behavior
16. Collation behavior
17. Typography
18. Layout/density risks
19. Keyboard Shortcuts dialog risks
20. Accessibility
21. Formatting
22. Runtime locale registration
23. Bundle impact
24. Japanese-specific assumptions inventory
25. Tooling generalization recommendations
26. Automated test plan
27. Manual verification plan
28. Required implementation documentation updates
29. Recommended implementation parcel sequence
30. Estimated complexity/size of each parcel
31. Whether French + German should remain one tranche
32. Transferable lessons for Spanish/Italian/Portuguese
33. Explicit unresolved questions/blockers

---

# Final Codex response

Return a concise summary covering:

- whether French and German can be onboarded together;
- recommended locale identifiers;
- Bethesda locale/input readiness;
- encoding findings;
- what tooling is already generic;
- what remains Japanese-specific;
- recommended Codex/DeepL review artifact;
- whether composed fauna needs locale-specific proof;
- expected layout risk, especially German;
- whether any localization-framework change is actually required;
- recommended implementation parcels and order;
- estimated complexity;
- any blockers requiring a user decision before implementation;
- audit report path;
- files changed;
- `git diff --check` result;
- confirmation no implementation, commit, or push occurred.

Do not proceed into implementation without a separate brief.
