# Codex Implementation Brief — French and German Runtime Localization Integration

## Objective

Activate French and German as first-class runtime locales using the semantic catalogues, official terminology, and official reference-name overlays that are already complete and verified.

The target locales are:

```text
fr-FR
de-DE
```

This implementation should:

- register the French and German semantic catalogues;
- register the French and German official reference-name overlays;
- make both locales selectable in the application;
- enable browser-language automatic resolution;
- persist and restore both locale preferences;
- update `document.documentElement.lang` correctly;
- preserve presentation-only locale switching with no persisted-domain mutation;
- implement the approved search-only diacritic folding policy;
- preserve canonical English aliases and current search ranking;
- retain current locale-aware collation boundaries;
- generalize accessible keyboard-shortcut chord speech for French and German;
- add the required runtime/search/collation/formatter tests;
- perform targeted smoke checks sufficient to identify blockers.

Broad layout hardening, full accessibility/reflow certification, and release closure remain later work unless this implementation exposes a concrete blocker.

Do not commit or push unless explicitly instructed.

---

## Naming rule

Planning identifiers used in audits/discussion must not leak into repository-facing names.

Do not use names such as:

```text
Parcel 5
Parcel5
P5
Phase 5
```

in:

- source identifiers;
- filenames;
- npm scripts;
- generated artifact names;
- tests;
- comments;
- documentation headings introduced by this implementation;
- commit messages.

Use descriptive names based on actual responsibility, such as:

```text
runtime locale integration
localized search
locale resolution
shortcut speech
```

---

## Primary design sources

Read and preserve current policy in:

```text
docs/audits/FRENCH-GERMAN-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/BACKLOG.md
AGENTS.md
```

Also inspect the completed French/German artifacts and current runtime localization/search code, including current equivalents of:

```text
src/localization/locales/fr-FR.ts
src/localization/locales/de-DE.ts
src/localization/generated/fr-FR-reference-names.ts
src/localization/generated/de-DE-reference-names.ts
src/localization/referenceNames.ts
src/localization/*
src/ui/keyboardShortcuts.ts
Search for Items / Search Results code
locale preference / browser-resolution code
shared Intl formatter/collator helpers
```

Follow the current generalized localization architecture rather than adding locale-specific parallel paths.

---

# Locked product decisions

## Runtime locale IDs

Activate:

```text
fr-FR
de-DE
```

as full runtime-supported locales.

These are the only French/German catalogues shipped.

Do not create separate regional catalogues such as:

```text
fr-CA
de-AT
de-CH
```

---

## Browser-language mapping

Automatic locale resolution should map:

```text
fr
fr-FR
any fr-* including fr-CA
    -> fr-FR
```

and:

```text
de
de-DE
any de-* including de-AT and de-CH
    -> de-DE
```

This mapping means:

> use the one supported French or German catalogue for that language family.

It does **not** mean the app claims native regional translation for Canadian French, Austrian German, or Swiss German.

Preserve current English/Japanese behavior.

---

## Locale selector labels

Use self-identifying explicit labels:

```text
Français (France)
Deutsch (Deutschland)
```

Keep existing locale-selector conventions for other locales.

For the automatic/effective locale indicator, preserve the current product pattern. If it currently presents a short effective locale tag, use:

```text
FR-FR
DE-DE
```

rather than inventing a new display convention.

---

## Search normalization policy

Implement **search-only diacritic folding** for French and German.

The policy is:

- keep the original locale-normalized form for exact/prefix/substring ranking;
- also derive a folded search form using Unicode decomposition and combining-mark removal;
- folded matches are fallback conveniences, not equal to an exact localized spelling;
- preserve one result per stable entity;
- preserve canonical English aliases;
- preserve abbreviations and curated alternates.

Do **not** add:

- fuzzy edit-distance search;
- transliteration;
- automatic `ae/oe/ue/ss` aliases for German;
- automatic `oe` ↔ `œ` equivalence;
- broad punctuation folding without evidence.

Apostrophe/hyphen normalization should remain unchanged unless current generated-corpus evidence demonstrates a real need.

---

## Collation policy

Use the shared locale-aware collator for genuinely alphabetical presentation only.

Recheck/apply it to:

```text
star-system selector
cargo export candidates
alphabetical Planned Supply groups
Search result tie-breaking
```

Preserve domain/user order for:

```text
body/orbit/source order
biome occurrence/index order
resource-family/topology order
persisted outpost order
cargo user order
validation severity/rule order
history chronology
explicit source-class order
```

Do not alphabetize bodies as incidental localization work.

---

## Shortcut speech

Visible shortcut key tokens remain unchanged.

Generalize accessible/spoken chord formatting so French and German no longer inherit English connector/direction speech.

Examples of semantic concepts that may need localization:

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

Exact wording should use the approved semantic catalogue architecture.

Do not change shortcut bindings.

---

## Broad layout work remains later

Do not turn this implementation into the full French/German layout-hardening pass.

This implementation should perform targeted smoke checks sufficient to identify blocking runtime defects.

Broad fixes for:

- 1366 px density;
- 1600 px comparison;
- 200% zoom;
- breakpoint refinement;
- long German labels;
- dialog wrapping;
- status-bar pressure;
- final accessibility/reflow closure;

belong to the later QA/release-closure work unless a defect prevents meaningful use of the newly activated locales.

---

# Scope

Implement the following areas.

## 1. Runtime locale registration

Add `fr-FR` and `de-DE` to the runtime-supported locale contract.

Update the current:

- supported-locale union/type;
- locale registry;
- selector data;
- persisted preference validation;
- any component prop unions or explicit locale arrays;
- `document.lang` handling;
- locale-switch tests.

Do not create a separate runtime-localization provider.

Use the existing architecture.

---

## 2. Register semantic catalogues

Register the complete:

```text
fr-FR
de-DE
```

semantic catalogues.

Requirements:

- exact existing `en-US` key/placeholder parity remains enforced;
- no sparse fallback model for French/German;
- no runtime fallback to English for ordinary semantic messages;
- invariant technical tokens remain invariant by design;
- Japanese remains unchanged.

Locale switching should update visible tracker-authored text immediately.

---

## 3. Register official reference-name overlays

Statically import/register the completed French/German generated overlays through the existing stable-ID reference-name lookup layer.

Requirements:

- locale switch updates displayed official names without rewriting persisted state;
- canonical English fallback remains available only where the established lookup contract genuinely requires it;
- French/German complete overlays should not silently fall back for covered canonical entities;
- Japanese runtime behavior remains unchanged;
- stable IDs remain the only persisted/reference identity.

Do not introduce lazy loading in this implementation.

---

## 4. Automatic browser-locale resolution

Generalize current browser resolution into a clear data-driven language-family mapping.

Required cases include:

```text
fr        -> fr-FR
fr-FR     -> fr-FR
fr-CA     -> fr-FR
other fr-* -> fr-FR

de        -> de-DE
de-DE     -> de-DE
de-AT     -> de-DE
de-CH     -> de-DE
other de-* -> de-DE
```

Preserve current behavior for:

```text
ja / ja-*
en-US
en / other en-*
unsupported locales
navigator.languages ordering
```

Unsupported browser tags should continue to the next browser preference before final fallback.

Do not infer unsupported regional variants as distinct supported locales.

---

## 5. Persisted locale preference

Update preference validation/storage so users can explicitly select and restore:

```text
fr-FR
de-DE
```

Requirements:

- existing stored English/Japanese preferences remain valid;
- switching locale must not mutate network/outpost/domain data;
- import/export schema remains unchanged;
- history snapshots remain locale-independent;
- startup with a persisted French/German preference resolves immediately and consistently.

Add migration only if current preference representation genuinely requires one.

Do not version-bump unrelated persisted schemas.

---

## 6. `document.lang`

Ensure:

```text
document.documentElement.lang
```

tracks the exact effective runtime locale:

```text
fr-FR
de-DE
```

and still behaves correctly for existing locales and `Automatic`.

Test explicit and automatic modes.

---

# Search integration

## 7. Preserve stable-entity search model

Search must retain:

```text
one stable entity
multiple aliases
localized display name
canonical English alias
abbreviation
curated alternates
```

Selecting any alias must return the same stable entity ID.

Visible result text remains in the active locale.

Locale switching must not duplicate entities.

---

## 8. Diacritic-folded search

Add a reusable search-only folded normalization form for French/German.

Recommended conceptual behavior:

```text
localized original-normalized
localized folded-normalized
canonical English normalized
abbreviation normalized
curated alternates normalized
```

Ranking should continue to prefer:

1. localized exact;
2. abbreviation exact where current policy places it;
3. localized prefix;
4. localized substring;
5. folded-localized convenience matches;
6. canonical English aliases;
7. curated alternates;
8. locale-aware display-name tie-break;
9. stable-ID fallback.

If the current ranking contract has a slightly different established order, preserve it and insert folded matches at the narrowest sensible fallback point.

Do not let folding demote a correctly accented exact localized match.

---

## 9. French search cases

Add representative tests for:

```text
é
è
ê
ë
à
â
ç
î
ï
ô
ù
û
ü
ÿ
```

and actual corpus examples.

Important:

Unicode combining-mark removal does **not** convert:

```text
œ -> oe
```

Do not add that equivalence automatically.

Keep `œ` behavior exact unless later evidence demonstrates a practical need.

Do not add broad apostrophe transformation unless the current official-name corpus demonstrates a real mismatch problem.

---

## 10. German search cases

Add representative tests for:

```text
ä
ö
ü
ß
```

A plain-base-letter folded search may allow:

```text
a -> ä
o -> ö
u -> ü
```

through decomposition-based mark removal.

Do **not** automatically implement:

```text
ae -> ä
oe -> ö
ue -> ü
ss -> ß
```

Those are separate alias policies and are not approved now.

If current official names expose a concrete high-value exception, report it rather than silently generalizing.

---

## 11. Search punctuation

The current French/German corpus review documented:

- ASCII apostrophes/hyphens;
- French non-breaking spaces;
- accented letters and `œ`;
- German umlauts and `ß`;
- no unusual German hyphen code point.

Do not add punctuation normalization merely for theoretical robustness.

If search already collapses/normalizes ordinary whitespace, ensure non-breaking-space display does not make search unusable; otherwise record a concrete finding.

Do not change visible localized names merely to improve matching.

---

# Collation integration

## 12. Shared collator

Use the existing shared locale collator.

Add/parameterize representative tests for:

```text
fr-FR
de-DE
```

Cover:

- accented French names;
- German umlauts;
- numeric names where relevant;
- deterministic stable-ID fallback.

Do not implement per-locale sort functions unless evidence shows the shared `Intl.Collator` is inadequate.

---

## 13. Audit raw `localeCompare`

The onboarding audit identified at least one raw `localeCompare` in matrix presentation code.

Inspect it.

If it is a genuinely alphabetical presentation sort, route it through the shared locale-aware helper.

If it is domain ordering, preserve it.

Do not broaden this into unrelated sorting cleanup.

---

# Shortcut accessibility integration

## 14. Generalize spoken shortcut chords

Inspect current:

```text
formatAccessibleShortcutChord()
```

or equivalent.

Replace any architecture equivalent to:

```text
ja-JP special case
else English
```

with a small semantic locale-aware speech formatter.

Requirements:

- visible keycap/chord display remains unchanged;
- screen-reader accessible description is localized;
- French/German connectors and arrow directions are natural;
- Japanese behavior remains unchanged;
- English behavior remains unchanged;
- no shortcut bindings change.

Prefer semantic catalogue keys or a small locale-policy structure over hard-coded prose branches in UI components.

---

## 15. Shortcut Help dialog

Because French/German semantic catalogues are now active, verify:

- all action labels render translated;
- group labels render translated;
- intro/close/help text render translated;
- accessible chord speech uses the active locale;
- both Redo chord aliases remain correctly represented;
- registry/help completeness tests still pass.

Do not perform broad dialog layout redesign here unless content becomes unusable.

---

# Formatting integration

## 16. Intl helpers

Parameterize/add tests for existing locale-aware formatters:

```text
Intl.NumberFormat
Intl.ListFormat
Intl.PluralRules
Intl.Collator
```

Cover representative French/German expectations.

Do not introduce FormatJS/ICU unless a concrete current message proves the existing semantic catalogue syntax cannot express correct output.

Current audit found no such requirement.

---

# Runtime/reference integrity

## 17. Locale closure orchestration

Update the thin localization closure command so:

```text
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE
```

now pass fully if all runtime registration requirements are satisfied.

It should orchestrate existing authoritative checks rather than create a parallel validator.

Expected closure includes:

- semantic catalogue parity;
- official terminology;
- reference-name overlay;
- sidecar integrity;
- provenance closure;
- no generated drift.

Japanese must continue to pass.

---

## 18. Reference-data startup gate

Do not change the existing reference-data integrity/fatal-startup architecture.

Activating French/German must not:

- alter runtime reference JSON;
- bypass the deployment manifest;
- change startup ordering;
- weaken fatal integrity checks.

The overlays remain bundled presentation data.

---

# Manual smoke verification

## 19. Required smoke checks

Perform targeted manual verification in both French and German.

At minimum verify:

- locale selector shows both explicit locales;
- switching is immediate;
- `document.lang` changes correctly;
- selected network/outpost remains selected;
- Undo/Redo history remains semantically intact;
- user-entered names do not change;
- system/body/resource/product/species names localize;
- Search displays localized names;
- canonical English alias search still finds the localized result;
- unaccented search can find at least representative accented names;
- no duplicate Search results appear;
- star-system ordering is locale-aware;
- locale preference survives refresh/reload;
- Japanese still works after switching away and back.

Do not require full release-layout certification here.

---

## 20. Browser-locale test strategy

Automated tests should cover the agreed browser mappings.

Where possible, include ordered preference arrays such as:

```text
["fr-CA", "en-US"]
["de-CH", "en-US"]
["xx-YY", "de-AT", "en-US"]
```

Ensure the first supported language family wins.

Do not use IP/location as a locale signal.

---

# Tests

Add/generalize durable tests for:

## Runtime registration

- supported-locale IDs include French/German;
- selector options exactly match supported explicit locales;
- semantic catalogue registry complete;
- reference overlay registry complete;
- persisted preference accepts/restores French/German;
- `document.lang` correct.

## Automatic resolution

- `fr`, `fr-FR`, `fr-CA`, representative other `fr-*`;
- `de`, `de-DE`, `de-AT`, `de-CH`, representative other `de-*`;
- mixed preference ordering;
- unsupported fallback;
- existing English/Japanese behavior.

## Search

- localized exact;
- localized prefix/substring;
- folded accent match;
- exact accented form outranks folded convenience match;
- canonical English alias;
- abbreviation;
- deduplication by stable ID;
- French accented corpus cases;
- German umlaut cases;
- no implicit `œ/oe` equivalence;
- no implicit German `ae/oe/ue/ss` aliasing.

## Collation

- French representative alphabetical order;
- German representative alphabetical order;
- numeric behavior;
- stable-ID tie-break;
- domain-order non-regression.

## Shortcut speech

- French accessible chord rendering;
- German accessible chord rendering;
- English regression;
- Japanese regression;
- visible chord formatting unchanged.

## Formatters

- French numbers/lists/plurals;
- German numbers/lists/plurals;
- existing locales regression.

---

# Documentation updates

Update durable documentation only for actual completed runtime integration.

Likely:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
```

Update French/German locale profiles to indicate:

- runtime registration complete;
- browser-resolution policy;
- search normalization policy;
- collation policy;
- shortcut speech integration;
- remaining layout/accessibility/release closure work.

Do not mark French/German fully release-closed if the later QA parcel remains outstanding.

Do not update `BACKLOG.md` to claim all localization work complete.

---

# Bundle policy

Keep static bundling.

Do not introduce:

- dynamic locale imports;
- code splitting;
- lazy reference overlays.

Measure the production build and report size change if convenient, but do not optimize solely to remove the existing Vite chunk warning.

The dedicated post-localization bundle review remains later.

---

# Out of scope

Do not:

- perform broad 1366/1600/200% layout correction;
- perform final accessibility certification;
- add German digraph aliases;
- add `œ/oe` search equivalence;
- add fuzzy search;
- add transliteration;
- add locale-specific fonts;
- add `:lang(fr)` / `:lang(de)` CSS unless a blocker is proven;
- change shortcut bindings;
- change persistence schema;
- alter domain identities;
- alter reference-data canonical populations;
- reopen fauna composition policy without new contradictory evidence;
- optimize bundle splitting.

---

# Verification

Run at minimum:

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

Run all new targeted runtime/search/collation/shortcut tests.

If any command name has changed, run the current authoritative equivalent and report the mapping.

---

# Expected completion state

At completion:

- `fr-FR` is selectable and runtime-active;
- `de-DE` is selectable and runtime-active;
- both semantic catalogues render;
- both official reference overlays render;
- browser `fr-*` / `de-*` mappings work;
- persisted locale preference works;
- `document.lang` correct;
- search retains localized + English aliases;
- diacritic folding works without overriding exact ranking;
- no unapproved German digraph or `œ/oe` aliases exist;
- collation works in intended presentation lists;
- shortcut accessible speech is localized;
- full localization closure passes for Japanese, French, and German;
- locale switching remains presentation-only;
- broad layout/accessibility release closure remains later.

---

# Completion response

Return:

1. branch;
2. files changed;
3. runtime locale registration summary;
4. selector labels;
5. browser-language mapping summary;
6. persisted-preference result;
7. reference-overlay registration result;
8. French search-normalization behavior;
9. German search-normalization behavior;
10. explicit confirmation no German digraph or `œ/oe` aliases were added;
11. collation integration result;
12. accessible shortcut-speech result;
13. formatter result;
14. localization closure results for `ja-JP`, `fr-FR`, and `de-DE`;
15. targeted manual smoke-test results;
16. any blocking runtime/layout defects discovered;
17. production build/bundle observation;
18. documentation updates;
19. deviations from the brief, if any;
20. recommended next step;
21. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
