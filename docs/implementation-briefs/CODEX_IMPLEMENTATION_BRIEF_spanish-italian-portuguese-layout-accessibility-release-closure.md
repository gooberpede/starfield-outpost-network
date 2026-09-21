# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Layout, Accessibility, and Release Closure

## Objective

Perform the final localization QA and release-closure pass for:

- Spanish (Spain) — `es-ES`
- Italian — `it-IT`
- Portuguese (Brazil) — `pt-BR`

This task verifies the completed runtime localization under realistic use, identifies remaining localization/accessibility/reflow defects, implements only narrowly scoped **non-geometry** corrections that are clearly safe, and marks the locales Supported if the agreed closure gates pass.

This is **not** a visual redesign, layout-refinement, or UI-geometry task.

Do not commit or push unless explicitly instructed.

## Critical visual/geometry freeze

This requirement is absolute.

Do **not** change:
- button/control dimensions or placement;
- panel geometry;
- text-field/select dimensions;
- column widths;
- grid/flex proportions;
- margins, padding, gaps;
- min/max widths or heights;
- breakpoints;
- wrapping geometry;
- sticky/fixed positioning;
- scroll-container dimensions;
- typography metrics where they affect layout;
- colors, borders, shadows;
- icon sizing;
- header/status-bar geometry;
- dialog dimensions;
- Resource Matrix, Navigation, Cargo, or Planned Supply geometry.

Previous visual/layout work is frozen.

If localization exposes a visual/layout issue requiring a physical change:
1. do not implement it;
2. record locale/surface/reproduction;
3. classify severity;
4. describe user impact;
5. propose one or more mitigations;
6. note regression risk;
7. leave implementation for explicit later review.

## Allowed corrections

Only narrowly scoped non-geometry corrections are allowed, for example:
- wrong or untranslated semantic text;
- glossary/terminology mistake;
- incorrect accessible name/description;
- incorrect `document.lang`;
- broken locale preference;
- incorrect browser-locale mapping;
- incorrect search/collation/formatting;
- missing/incorrect live announcement;
- incorrect shortcut speech;
- documentation/test corrections.

If in doubt, report rather than implement.

## Supported-status criterion

Intended end state:

- `es-ES` → Supported
- `it-IT` → Supported
- `pt-BR` → Supported

Only if:
- semantic catalogue closure passes;
- terminology closure passes;
- reference-name closure passes;
- runtime selection works;
- conservative browser mapping works;
- search/collation works;
- preference persistence works;
- Windows/Chromium accessibility smoke passes;
- manual 1366/1600/200% checks pass;
- no blocking localized presentation defect remains;
- locale profiles are complete;
- known limitations are documented.

Native-speaker review remains desirable but non-blocking. Apple/WebKit remains deferred.

## Known global issues that are not locale blockers

These are already-known application issues and should not block support merely because they reproduce:
- intermittent missing visible focus indicator after Resource Matrix shortcuts;
- Undoing Cargo Link deletion may collapse unrelated expanded Cargo Links;
- focused/programmatically navigated content may be obscured by fixed header/status-bar chrome, especially at high zoom.

Record if reproduced. Do not fix them here unless a genuinely new locale-specific regression is found.

## Known presentation pressure

Long Solar/Wind values are expected to pressure fixed controls, for example:
- Spanish: `Muy deficiente`
- Italian: `Molto scarso`
- Portuguese: `Muito ruim`

Do not shorten correct translations merely to fit.

Classify as blocking/non-blocking based on usability and report possible mitigation only.

## Manual QA matrix

Run the full matrix for **all three locales**:

- 1366px @ 100%
- 1600px @ 100%
- 200% browser zoom/reflow
- keyboard-only
- Windows Narrator smoke
- import/export announcement pass
- typography/glyph check
- locale-switch/persistence regression

Do not use one locale as a proxy for the other two.

## Layout acceptance standard

### Blocking
Examples:
- essential information hidden with no usable alternative;
- controls unusable/unreachable;
- page-level overflow preventing normal use;
- actionable focus obscured so operation becomes impractical;
- focus indicator missing where operation becomes ambiguous/unusable;
- overlapping text preventing comprehension;
- dialog/panel unusable at 200%;
- essential accessible semantics missing.

### Non-blocking
Examples:
- understandable ellipsis;
- cramped but usable labels;
- long correct wording pressing against fixed controls;
- cosmetic wrapping;
- truncated placeholder where the accessible name is complete.

Any issue requiring physical/layout changes must be reported, not implemented.

## Surface checks

For each locale at 1366 and 1600, verify:
- header and locale selector;
- network/character controls;
- Navigation;
- Outpost Details;
- system/body selectors;
- Solar/Wind;
- biomes;
- Resource Matrix;
- Planned Supply;
- Cargo Links collapsed/expanded;
- Search and Search Results;
- Validation;
- Help;
- About;
- confirmations;
- status/import/export feedback.

At 200% zoom/reflow, verify the same major surfaces plus focus visibility and dialog operability.

### Spanish focus areas
- `Puesto` terminology consistency;
- `Matriz de recursos`;
- `Materiales de entrada`;
- `Suministro planificado`;
- `Enlace de cargamento intersistema`;
- `Núcleo de energía de X-Tech`;
- long Solar/Wind values.

### Italian focus areas
- dense multi-line Matrix headings;
- `Matrice delle risorse`;
- `Materiali richiesti`;
- `Fornitura pianificata`;
- `Collegamento merci intersistema`;
- `Nucleo energetico di X-Tech`;
- curly apostrophes;
- long Solar/Wind values.

### Brazilian Portuguese focus areas
- `Matriz de recursos`;
- `Insumos`;
- `Suprimento planejado`;
- `Vínculo de carga entre sistemas`;
- `Núcleo de energia Tec-X`;
- long Solar/Wind values.

## Keyboard-only pass

In each locale, verify:
- selector;
- network controls;
- Navigation;
- Search;
- Search Results;
- Resource Matrix shortcuts;
- Planned Supply;
- Cargo;
- Validation;
- Help;
- About;
- confirmations.

Confirm focus order, modal containment/restoration, Escape, and shortcut operation.

Record the known intermittent Matrix focus-border issue if observed.

## Narrator smoke

In each locale, verify representative:
- locale selector options;
- form labels;
- Search;
- Search Results;
- Validation;
- dialog names;
- Help/shortcut chord speech;
- status/live announcements;
- compact/icon controls.

The user is not expected to certify linguistic naturalness in languages they do not speak. Acceptance is that complete localized semantics are announced, critical information is not omitted, and obvious English fallback is absent.

Record native-speaker verification as unavailable where applicable.

## Import/export manual pass

This must be exercised in each locale.

For each:
1. successful export;
2. localized visual success feedback;
3. Narrator announces success including filename;
4. successful import of a valid exported file;
5. localized visual + Narrator success feedback;
6. one invalid JSON import;
7. localized visual + Narrator failure feedback.

Do not change import/export logic unless a concrete locale-specific defect is found.

## Search closure

### Spanish
Verify:
- exact accented match;
- unaccented fallback;
- `ñ` exact;
- `n` folded fallback;
- English alias;
- one stable entity/result;
- localized display unchanged.

### Italian
Verify:
- accented/unaccented search;
- curly apostrophe exact;
- straight apostrophe finds same entity;
- English alias;
- one stable entity/result.

Use a real official name containing a curly apostrophe.

### Brazilian Portuguese
Verify:
- accented/unaccented search;
- tilde;
- cedilla;
- English alias;
- one stable entity/result;
- official display preserved.

Exact localized spelling must outrank folded forms.

## Conservative browser mapping closure

Confirm tests remain authoritative:

- `es` / `es-ES` → `es-ES`; explicit non-Spain `es-*` continues to next preference.
- `it` / `it-IT` → `it-IT`; explicit non-Italy `it-*` continues.
- `pt` / `pt-BR` → `pt-BR`; `pt-PT` and explicit non-Brazilian `pt-*` continue.

Do not reopen the policy unless behavior contradicts tests.

## Typography/glyph verification

### Spanish
Inspect:
`á é í ó ú ü ñ Ñ ¿ ¡`

### Italian
Inspect:
`à è é ì ò ó ù ’ '`

### Brazilian Portuguese
Inspect:
`á â ã à ç é ê í ó ô õ ú ü` and uppercase equivalents.

Check missing glyphs, fallback, malformed apostrophes/elision, bad uppercase accents, and illegible tracking.

No font changes unless there is a real rendering failure.

## Live semantic sanity check

Perform a bounded live sanity review on:
- Outposts/Navigation;
- Resource Matrix;
- Cargo Links;
- Planned Supply;
- Validation;
- Outpost Details;
- Network controls.

Look only for:
- obvious wrong lexical sense;
- untranslated English;
- glossary contradiction;
- inconsistent core terminology;
- official skill/reference names replaced by generic translations.

This is not a new wholesale translation review.

## Locale-switch/persistence regression

Switch among:
`en-US`, `en-GB`, `ja-JP`, `fr-FR`, `de-DE`, `es-ES`, `it-IT`, `pt-BR`.

Confirm:
- immediate locale change;
- selected network persists;
- selected outpost persists;
- Cargo/Planned Supply/manufacturing state persists;
- Undo/Redo state remains intact;
- user names unchanged;
- explicit preference survives reload;
- Automatic still works.

## `document.lang`

Verify exact:
- `es-ES`
- `it-IT`
- `pt-BR`

Also verify existing locales and Automatic effective locale.

## Accessibility scope

Use the established Windows/Chromium desktop baseline:
- keyboard;
- visible focus;
- Search announcements;
- Validation announcements;
- modal containment/restoration;
- accessible names/descriptions;
- live/status feedback;
- shortcut Help/speech;
- `document.lang`;
- 200% reflow;
- Narrator smoke.

Do not reopen the entire accessibility program.

Apple/WebKit/Safari/VoiceOver/iPhone remains deferred.

## Bundle policy

Measure/report only.

Do not add:
- lazy loading;
- dynamic imports;
- code splitting;
- dependency changes;
- chunk-threshold tuning.

Dedicated bundle review remains after Polish and Simplified Chinese.

## Locale selector ordering

Do not settle final ordering here. It remains deferred until all V1 locales are onboarded.

## XLIFF cleanup

Do not move XLIFF files. Preserve cleanup until all planned localization is complete.

## Native-speaker review

Desirable but non-blocking. Record absence as a limitation, not a support blocker.

## Defect handling

Classify every finding:
- BLOCKING
- NON-BLOCKING
- INFORMATIONAL

Record:
- locale;
- surface;
- reproduction;
- user impact;
- whether a non-visual correction is possible;
- recommended mitigation;
- regression risk.

Visual/physical fixes must not be implemented.

## Documentation closure

If all three locales pass without blockers, update:

`docs/localization/LOCALE-ONBOARDING.md`

so:
- `es-ES` → Supported
- `it-IT` → Supported
- `pt-BR` → Supported

Each locale profile should concisely record:
- semantic catalogue;
- terminology;
- reference names;
- fauna evidence;
- runtime integration;
- browser mapping;
- search;
- collation;
- shortcut speech;
- typography;
- Windows/Chromium QA;
- Narrator;
- import/export announcements;
- layout findings;
- known limitations;
- native-speaker review status;
- Apple/WebKit deferred.

Do not mark all localization complete. Polish and Simplified Chinese remain outstanding.

## Backlog reconciliation

If new non-blocking presentation debt is found:
- update `docs/BACKLOG.md` only if not already covered;
- do not duplicate existing focus/Undo/fixed-chrome items;
- do not encode an unapproved geometry fix.

## Automated verification

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

Run targeted tests for any concrete non-visual fixes.

## Bundle measurement

Record:
- HTML size;
- CSS minified/gzip;
- JavaScript minified/gzip;
- startup behavior observed during smoke testing.

Do not optimize.

## Expected completion state

If no blocker remains:

- `es-ES` Supported
- `it-IT` Supported
- `pt-BR` Supported

with all closure/evidence/runtime/search/accessibility checks green, non-blocking presentation debt documented, native-speaker review noted as unavailable if applicable, Apple/WebKit deferred, XLIFF cleanup deferred, and Polish/Simplified Chinese still outstanding.

## Completion response

Return:
1. branch;
2. files changed;
3. Spanish 1366 result;
4. Spanish 1600 result;
5. Spanish 200% result;
6. Italian 1366 result;
7. Italian 1600 result;
8. Italian 200% result;
9. Brazilian Portuguese 1366 result;
10. Brazilian Portuguese 1600 result;
11. Brazilian Portuguese 200% result;
12. keyboard-only result per locale;
13. Narrator result per locale;
14. import/export result per locale;
15. typography result per locale;
16. Spanish search closure;
17. Italian search/apostrophe closure;
18. Brazilian Portuguese search closure;
19. conservative browser-mapping closure;
20. `document.lang` result;
21. locale-switch/persistence result;
22. live semantic-sanity findings;
23. BLOCKING findings;
24. NON-BLOCKING locale-specific presentation findings;
25. known global issues reproduced;
26. physical/layout mitigations proposed but not implemented;
27. non-visual fixes implemented;
28. bundle measurement;
29. Spanish Supported-status decision;
30. Italian Supported-status decision;
31. Brazilian Portuguese Supported-status decision;
32. documentation updates;
33. backlog updates;
34. native-speaker-review limitation;
35. Apple/WebKit deferred status;
36. XLIFF cleanup deferred status;
37. Polish/Simplified Chinese outstanding status;
38. automated verification results;
39. `git diff --check` result;
40. deviations;
41. recommended next step;
42. suggested commit message.

Do not commit or push unless explicitly instructed.
