# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Runtime Localization Integration

## Objective

Integrate the completed localization artifacts for:

```text
Spanish (Spain)        es-ES
Italian                it-IT
Portuguese (Brazil)    pt-BR
```

into the running application.

All three locales now have:

- complete semantic catalogues;
- approved terminology/glossaries;
- complete official reference-name overlays;
- provisionally accepted fauna composition evidence;
- passing terminology/reference-name closure.

This task should:

1. activate all three locales at runtime;
2. register semantic catalogues and reference overlays;
3. expose them in the locale selector;
4. implement the agreed conservative browser-locale mapping;
5. enable locale-appropriate search normalization;
6. preserve canonical English aliases;
7. enable locale-aware collation/formatting through the existing shared helpers;
8. add localized accessible shortcut speech;
9. keep locale switching presentation-only;
10. leave full visual/accessibility release closure for the later QA stage.

Do not commit or push unless explicitly instructed.

---

# Settled product decisions

## Activate all three together

Activate:

```text
es-ES
it-IT
pt-BR
```

in one coherent runtime integration.

Do not activate only one or two unless a concrete implementation blocker is discovered.

---

## Runtime availability

At the end of this task:

```text
runtimeAvailable: true
```

for all three locales.

Only flip the runtime flag when the corresponding semantic catalogue and reference overlay are registered in the same change.

Do not create an intermediate state where metadata advertises runtime support but the application cannot fully render the locale.

---

## Locale switching remains presentation-only

Switching locale must not change:

- persisted `NetworkCollection`;
- stable IDs;
- selected network/outpost identity;
- history snapshots;
- Cargo Links;
- manufacturing state;
- Planned Supply state;
- import/export schema;
- canonical reference identity;
- user-authored names.

Do not rewrite stored data on locale change.

---

# Conservative browser-locale mapping

Implement the approved mapping exactly.

## Spanish

Map:

```text
es
es-ES
descendants of es-ES
    -> es-ES
```

Do **not** automatically map explicit non-Spain Spanish regional tags such as:

```text
es-MX
es-AR
es-CL
es-CO
```

to `es-ES`.

When such a tag is encountered, continue to the next browser preference.

---

## Italian

Map:

```text
it
it-IT
descendants of it-IT
    -> it-IT
```

Do not automatically map explicit non-Italy tags such as:

```text
it-CH
```

to `it-IT`.

Continue to the next browser preference.

---

## Portuguese

Map:

```text
pt
pt-BR
descendants of pt-BR
    -> pt-BR
```

Do not automatically map:

```text
pt-PT
other explicit non-Brazilian pt-*
```

to `pt-BR`.

Continue to the next browser preference.

---

## Preference-list traversal

Automatic locale resolution must walk the browser preference list rather than stopping at the first unsupported regional variant.

Example:

```text
navigator.languages = ['es-MX', 'en-US']
```

Expected:

```text
es-MX -> not mapped
continue
en-US -> en-US
```

Do not silently fall back from `es-MX` to `es-ES`.

Likewise, if a later browser preference maps to another supported locale, that preference may win.

Only after exhausting usable preferences should normal application fallback apply.

---

# Locale selector labels

Add visible selector entries:

```text
Español (España)
Italiano (Italia)
Português (Brasil)
```

Do not use flags.

Do not settle the final global locale ordering in this task.

Use the current registry/append convention consistently and leave final ordering for the post-onboarding locale-order review.

---

# Semantic catalogue registration

Register:

```text
src/localization/locales/es-ES.ts
src/localization/locales/it-IT.ts
src/localization/locales/pt-BR.ts
```

in the runtime localization registry.

Requirements:

- exact full-catalogue behavior;
- no sparse fallback model for these locales;
- `en-US` remains baseline fallback;
- locale switch updates visible and accessible tracker-authored UI immediately;
- no stale previous-locale strings remain.

Do not edit catalogue wording in this task unless a clear runtime integration defect proves an artifact problem.

---

# Official reference overlay registration

Register:

```text
src/localization/generated/es-ES-reference-names.ts
src/localization/generated/it-IT-reference-names.ts
src/localization/generated/pt-BR-reference-names.ts
```

in the runtime reference-name lookup.

Requirements:

- stable IDs remain canonical;
- official localized reference names display in the active locale;
- canonical English names remain available as search aliases;
- no localized reference string becomes persisted identity;
- fauna composed names use the already accepted per-locale prediction/evidence model;
- existing Japanese/French/German overlays remain unchanged.

Do not regenerate overlay content merely because runtime registration is now added.

---

# Search normalization

## Shared rules

Preserve the current search-ranking principle:

1. localized exact;
2. abbreviation exact;
3. localized prefix;
4. localized substring;
5. canonical English exact;
6. canonical English prefix/substring;
7. curated alternate matches;
8. locale-aware visible-name tie-break;
9. stable-ID final tie-break.

Where search-only normalized aliases are added, exact localized spelling must outrank them.

Visible result text remains localized.

One stable entity must still produce one result.

No fuzzy edit-distance search.

No broad synonym generation.

No transliteration framework.

---

## Spanish search

Enable the lower-ranked decomposition/combining-mark fold for localized Spanish names.

This should allow convenient input such as unaccented variants of names containing:

```text
á
é
í
ó
ú
ü
ñ
```

The fold may make `ñ` searchable with `n`, but:

- exact `ñ` spelling still ranks higher;
- visible spelling remains unchanged;
- Spanish locale-aware collation still treats `ñ` correctly;
- do not rewrite canonical names.

Do not add broad punctuation stripping.

Do not add Latin-American Spanish synonyms.

---

## Italian search

Enable the lower-ranked decomposition fold for accented vowels.

Also add search-only equivalence between:

```text
straight apostrophe '
curly apostrophe ’
```

for localized Italian names.

Requirements:

- display value remains official;
- exact punctuation/spelling ranks ahead of normalized alias;
- no broad punctuation removal;
- no other punctuation equivalence without evidence;
- no fuzzy matching.

---

## Brazilian Portuguese search

Enable the lower-ranked decomposition fold for localized names containing:

```text
acute accents
circumflex
grave
tilde
cedilla
diaeresis if present
```

Requirements:

- exact localized spelling ranks higher;
- visible spelling remains unchanged;
- do not introduce European Portuguese aliases;
- do not add broad punctuation stripping.

---

# Canonical English aliases

Under all three new locales, canonical English names must remain searchable.

Examples:

```text
localized official name
canonical English name
approved abbreviation
curated alternate
```

must all converge to the same stable entity ID.

Do not display English merely because the user searched using English.

Search submission remains stable-ID based.

---

# Collation and formatting

Use the existing shared locale-aware helpers.

For genuinely alphabetical presentation lists use the active locale collator, including:

- system selector;
- Cargo export candidates;
- alphabetical Planned Supply groups;
- Search result tie-breaks.

Do not locale-sort lists with domain/user ordering.

Preserve:

```text
body/orbit/source order
biome occurrence/index order
resource-family/topology order
persisted outpost order
cargo link user order
validation severity/rule order
history chronology
source-class ordering
```

Use the existing `Intl` number/list/plural formatting pipeline for all three locales.

Do not introduce new formatting libraries.

---

# Accessible shortcut speech

Add localized spoken forms for the existing visible shortcut tokens.

The audit’s initial speech policy is:

| Token | es-ES | it-IT | pt-BR |
|---|---|---|---|
| Control | `Control` | `Control` | `Control` |
| Alt | `Alt` | `Alt` | `Alt` |
| Shift | `Mayús` | `Maiusc` | `Shift` |
| plus | `más` | `più` | `mais` |
| Arrow Up | `Flecha arriba` | `Freccia su` | `Seta para cima` |
| Arrow Down | `Flecha abajo` | `Freccia giù` | `Seta para baixo` |
| Arrow Left | `Flecha izquierda` | `Freccia sinistra` | `Seta para a esquerda` |
| Arrow Right | `Flecha derecha` | `Freccia destra` | `Seta para a direita` |

These are accessible speech phrases only.

Do not change:

- visible shortcut chords;
- shortcut bindings;
- keyboard registry actions;
- modifier semantics.

Narrator pronunciation/naturalness will be verified in the later manual QA stage.

If runtime integration exposes an obvious speech-contract defect, fix it narrowly; do not redesign the shortcut system.

---

# `document.lang`

When each new locale is active, set exactly:

```text
es-ES
it-IT
pt-BR
```

respectively.

Automatic resolution must also produce the correct exact active tag.

Switching back to existing locales must continue to update `document.lang` correctly.

---

# Persisted locale preference

Add all three to the runtime-supported preference validation.

Verify:

- explicit `es-ES` persists across reload;
- explicit `it-IT` persists across reload;
- explicit `pt-BR` persists across reload;
- Automatic remains functional;
- existing saved `en-US`, `en-GB`, `ja-JP`, `fr-FR`, `de-DE` preferences remain valid;
- invalid/unsupported stored values follow current fallback policy.

No persistence schema change.

---

# Locale selector / Automatic effective label

Extend the current selector/effective-locale presentation consistently.

If the closed Automatic state currently shows compact locale tags, use:

```text
ES-ES
IT-IT
PT-BR
```

consistent with existing conventions.

Do not redesign selector geometry.

Do not settle final ordering.

---

# Reference-name and semantic interaction

Verify representative mixed surfaces where tracker-authored text and official Bethesda names coexist:

- Outpost Details;
- system/body selectors;
- biome labels/tooltips;
- Resource Matrix;
- Planned Supply;
- Cargo Links;
- Search results;
- Validation;
- Help/About;
- status/import/export feedback.

Tracker-authored UI comes from semantic catalogues.

Official game entities come from reference overlays.

Do not flatten both into one localization source.

---

# No geometry changes

This requirement remains absolute during this task.

Do not change:

- button dimensions;
- panel dimensions;
- text-field/select dimensions;
- column widths;
- margins;
- padding;
- gaps;
- breakpoints;
- wrapping geometry;
- header/status-bar geometry;
- dialog sizes;
- font sizes;
- line heights;
- letter spacing;
- colors;
- borders;
- shadows.

If runtime activation exposes clipping, wrapping, truncation, or other presentation pressure:

1. record it;
2. classify it;
3. suggest possible mitigation;
4. do **not** implement the physical change.

The full layout/accessibility closure belongs to the later QA task.

---

# Bounded smoke testing in this task

Do not perform the full release-closure matrix yet.

Perform enough runtime smoke testing to prove integration works.

At minimum verify:

- each new locale can be selected;
- selector labels are correct;
- visible semantic UI changes;
- official system/body/resource/product/species names localize;
- Search returns localized results;
- canonical English aliases still work;
- accent-folded search works;
- Italian apostrophe equivalence works;
- preference survives reload;
- switching among all runtime locales preserves app state;
- `document.lang` updates;
- existing Japanese/French/German behavior remains intact;
- no runtime error/fatal screen appears.

Record any presentation defects but do not alter geometry.

---

# Conservative browser mapping tests

Add explicit tests for positive and negative cases.

## Spanish positive

```text
es
es-ES
es-ES descendants
```

## Spanish negative

Examples:

```text
es-MX
es-AR
```

must not automatically map to `es-ES`.

Test preference continuation, for example:

```text
['es-MX', 'en-US'] -> en-US
['es-MX', 'fr-FR'] -> fr-FR
```

---

## Italian positive

```text
it
it-IT
it-IT descendants
```

## Italian negative

```text
it-CH
```

must continue to the next preference rather than mapping to `it-IT`.

---

## Portuguese positive

```text
pt
pt-BR
pt-BR descendants
```

## Portuguese negative

```text
pt-PT
```

must not map to `pt-BR`.

Examples:

```text
['pt-PT', 'en-US'] -> en-US
['pt-PT', 'es-ES'] -> es-ES
```

Do not weaken the conservative policy to make tests simpler.

---

# Search tests

Add targeted regression coverage.

## Spanish

Test:

- exact accented match outranks folded match;
- `ñ` exact outranks `n` fallback;
- unaccented input can find accented names;
- one stable entity/result;
- canonical English alias works;
- no display normalization.

## Italian

Test:

- accented/unaccented search;
- straight apostrophe finds curly-apostrophe official name;
- curly exact ranks ahead;
- one stable entity/result;
- English alias works.

## Portuguese

Test:

- diacritic folding;
- tilde/cedilla handling;
- exact localized match priority;
- one stable entity/result;
- English alias works.

Prefer representative real official names from the generated overlays.

---

# Collation tests

Extend parameterized collation tests to:

```text
es-ES
it-IT
pt-BR
```

Verify:

- appropriate locale collation is selected;
- numeric sorting remains enabled;
- stable ID remains deterministic fallback;
- Spanish collation retains distinct `ñ` behavior;
- no domain-ordered lists are accidentally changed.

---

# Shortcut speech tests

Add parameterized tests for the three new locale speech maps.

Verify representative:

```text
Ctrl + Alt + ArrowUp
Ctrl + Shift + Z
Ctrl + Alt + 1
```

or equivalent existing registry chords.

Ensure visible chord formatting remains invariant while accessible speech localizes.

---

# Build and bundle measurement

Run the production build and record the final bundle sizes after all three new semantic catalogues and overlays are runtime-registered.

Do not optimize bundle size in this task.

Do not introduce:

- lazy locale loading;
- dynamic imports;
- code splitting;
- chunk-threshold changes.

The dedicated post-localization bundle review remains deferred until Polish and Simplified Chinese are also onboarded unless a concrete runtime problem appears.

The existing Vite chunk-size advisory alone is not a blocker.

---

# Documentation status

Update:

```text
docs/localization/LOCALE-ONBOARDING.md
```

so each new locale reflects:

```text
semantic catalogue complete
official reference overlay complete
fauna composition provisionally accepted
runtime integrated
layout/accessibility release closure pending
```

Do not mark:

```text
Supported
```

yet.

Full supported status comes only after the later manual layout/accessibility/release-closure pass.

Update other durable docs only if runtime policy materially changed.

Do not create a chronological implementation diary.

---

# Existing locale preservation

Preserve:

```text
en-US
en-GB
ja-JP
fr-FR
de-DE
```

Verify:

- selector entries still present;
- preferences still restore;
- automatic mapping still works;
- `document.lang` still works;
- semantic catalogues remain unchanged;
- reference overlays remain unchanged;
- Search behavior remains correct;
- shortcut speech remains correct;
- Japanese/French/German locale closure remains green.

Do not refactor completed locale behavior merely for symmetry unless required by a real shared defect.

---

# Explicitly out of scope

Do not:

- perform full 1366/1600/200% release QA;
- perform full Narrator certification;
- change UI geometry;
- fix visual truncation by resizing;
- change semantic translations merely for fit;
- regenerate official overlays;
- change fauna evidence;
- alter canonical provenance;
- add Polish;
- add Simplified Chinese;
- settle final locale-selector ordering;
- move XLIFF files;
- optimize the bundle;
- change persistence schema;
- alter domain data.

---

# Verification

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

After runtime activation, the three new locale closure commands should pass through the runtime-integration gate and reflect their current status correctly.

Do not weaken closure semantics merely to produce green output.

---

# Diff review

Before finishing:

```text
git diff --stat
git diff
```

Confirm:

- all three locales activated together;
- semantic and reference registries both updated;
- `runtimeAvailable` true for all three;
- conservative browser mapping implemented exactly;
- selector labels correct;
- search normalization implemented narrowly;
- canonical English aliases preserved;
- Italian apostrophe equivalence search-only;
- collation/formatting use shared helpers;
- shortcut speech localized;
- no UI geometry/CSS changes;
- no semantic/reference artifact churn;
- no persistence/schema changes;
- no commit/push.

---

# Completion response

Return:

1. branch;
2. files changed;
3. runtime registry changes;
4. `runtimeAvailable` changes;
5. selector labels;
6. Spanish browser-mapping behavior;
7. Italian browser-mapping behavior;
8. Portuguese browser-mapping behavior;
9. preference-list continuation test results;
10. Spanish search normalization changes;
11. Italian search normalization/apostrophe changes;
12. Brazilian Portuguese search normalization changes;
13. canonical English alias verification;
14. collation/formatting changes;
15. accessible shortcut speech changes;
16. `document.lang` behavior;
17. persisted preference behavior;
18. representative semantic UI smoke results;
19. representative official-reference-name smoke results;
20. locale-switch state-preservation results;
21. presentation defects observed, if any;
22. confirmation no geometry/CSS changes were made;
23. bundle size before/after or final measured size;
24. Japanese/French/German regression results;
25. all automated verification results;
26. `git diff --check` result;
27. deviations from the brief;
28. blockers before manual release-closure QA;
29. recommended next stage;
30. suggested commit message.

Do not commit or push unless explicitly instructed.

The suggested commit message must be descriptive and must not contain planning identifiers.
