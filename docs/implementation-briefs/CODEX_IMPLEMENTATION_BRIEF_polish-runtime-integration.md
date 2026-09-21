# Codex Implementation Brief — Polish Runtime Integration

## Objective

Activate Polish as a fully runtime-available locale using the already completed and approved Polish semantic catalogue, official reference-name overlay, terminology policy, and fauna evidence.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Encoding:         utf-8
Catalogue role:   full
Runtime status:   activate in this parcel
```

This parcel should wire Polish into the running application while preserving the existing localization architecture and stable-ID presentation model.

Do not perform the final full layout/accessibility/release-closure matrix in this task. That remains a separate following parcel.

Do not change physical UI geometry or styling.

Do not commit or push unless explicitly instructed.

---

# Source of truth

Use the already committed Polish artifacts:

```text
src/localization/locales/pl-PL.ts
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-reference-names-pl-PL-manifest.json
reference-source/localized-fauna-evidence-pl-PL.json
reference-source/official-terminology-values-pl-PL.csv
docs/localization/POLISH-GLOSSARY.md
docs/audits/POLISH-LOCALE-ONBOARDING-PLAN.md
reference-source/localization-locale-metadata.json
```

Polish semantic and reference artifacts are already complete and accepted.

Do not reopen terminology, semantic adjudication, or fauna composition unless runtime integration reveals a concrete contradiction.

---

# Settled runtime policy

Treat these decisions as fixed for this parcel.

## Selector label

Use:

```text
Polski (Polska)
```

Do not settle final global selector ordering yet.

## Browser mapping

Use the conservative mapping policy:

```text
pl
pl-PL
pl-PL-*
    -> pl-PL
```

Explicit other regional Polish tags such as:

```text
pl-UA
pl-LT
```

must **not** be treated as `pl-PL`.

They should continue to the next browser preference and then normal fallback behavior.

## Search

Use:

1. exact localized match;
2. existing localized prefix/substring tiers;
3. lower-ranked diacritic folding;
4. narrow Polish search-only equivalence:

```text
ł -> l
```

Exact Polish spelling must outrank folded forms.

Do not add:

- fuzzy matching;
- broad transliteration;
- punctuation stripping;
- synthetic spelling variants;
- apostrophe normalization not evidenced by the corpus.

Canonical English aliases remain searchable.

## Collation

Use the shared locale-aware collator:

```text
Intl.Collator('pl-PL', { sensitivity: 'base', numeric: true })
```

No custom Polish sort table.

## Shortcut speech

Initial Polish speech policy:

```text
Control
Alt
Shift
plus
Strzałka w górę
Strzałka w dół
Strzałka w lewo
Strzałka w prawo
```

Do not attempt to optimize pronunciation heuristically in this parcel.

Narrator verification belongs to the final QA parcel.

## document.lang

Use exact:

```text
pl-PL
```

## Geometry

The localization geometry freeze remains absolute.

Do not change:

- control sizes;
- column widths;
- grid/flex proportions;
- padding/margins/gaps;
- breakpoints;
- wrapping geometry;
- fixed/sticky positioning;
- typography metrics that materially alter layout;
- icon sizes;
- dialog/header/status-bar geometry.

If Polish exposes presentation defects, record them for the closure parcel.

---

# 1. Activate Polish locale metadata

Update the Polish metadata entry:

```text
runtimeAvailable: false
```

to:

```text
runtimeAvailable: true
```

only after the runtime catalogue and reference overlay are correctly registered.

Do not expose an incomplete activation state in intermediate committed code.

---

# 2. Extend supported runtime locale typing

Add:

```text
pl-PL
```

to the runtime-supported locale type/registry using the same explicit compile-time pattern as existing locales.

Preserve the distinction between:

- metadata-known onboarding locales;
- runtime-supported locales.

Do not replace the explicit registry with dynamic discovery.

---

# 3. Register Polish semantic catalogue

Register:

```text
src/localization/locales/pl-PL.ts
```

in the runtime catalogue registry.

Requirements:

- exact 414-key coverage remains intact;
- no fallback should be needed for ordinary Polish semantic keys;
- `en-US` remains the baseline fallback only for genuine runtime fallback behavior;
- no user-authored data is translated or mutated.

Locale switching must remain presentation-only.

---

# 4. Register Polish official reference names

Register:

```text
src/localization/generated/pl-PL-reference-names.ts
```

in the runtime reference-name lookup.

Requirements:

- stable IDs remain canonical;
- Polish display text is presentation-only;
- switching locale must not rewrite:
  - networks;
  - outposts;
  - Cargo Links;
  - history;
  - persisted IDs;
  - import/export data;
  - user-authored names.

Verify representative display of:

- resources;
- products;
- systems;
- bodies;
- biomes;
- species;
- official skill names;
- official terms.

---

# 5. Language selector

Add:

```text
Polski (Polska)
```

to the locale selector.

Requirements:

- visible only after runtime activation;
- switching is immediate;
- current network/outpost selection is preserved;
- no gameplay/domain state changes;
- no reload required;
- selected locale persists using the existing preference mechanism.

Do not change final locale-selector ordering policy.

Use the current established ordering convention for now.

---

# 6. Browser-locale resolution

Implement conservative Polish routing.

Positive cases:

```text
pl       -> pl-PL
pl-PL    -> pl-PL
pl-PL-*  -> pl-PL
```

Negative/continuation cases:

```text
pl-UA
pl-LT
other explicit non-Poland pl-*
```

must continue to later browser preferences.

Do not globally fall back to Polish merely because a tag begins with `pl-`.

Preserve existing preference-list traversal semantics.

Add tests proving that a later supported preference is still selected after an unsupported regional Polish preference.

---

# 7. document.lang

Ensure active Polish sets:

```html
<html lang="pl-PL">
```

through the existing document-language boundary.

Test:

- switch to Polish;
- exact `document.lang`;
- switch away;
- exact restoration to the newly active locale.

Do not infer browser language independently of the locale resolver.

---

# 8. Polish search normalization

Extend the existing localized-search folding policy to Polish.

Use the current lower-ranked decomposition fold for:

```text
ą -> a
ć -> c
ę -> e
ń -> n
ó -> o
ś -> s
ź -> z
ż -> z
```

and add the one narrow Polish-specific equivalence:

```text
ł -> l
```

Important:

- exact localized spelling remains highest-ranked;
- folded aliases are search-only;
- display text remains exact official Polish;
- stable entity identity remains unchanged;
- canonical English aliases remain available;
- abbreviations remain available;
- no duplicate visible results should be created.

Do not strip punctuation.

Do not normalize apostrophes.

Do not add fuzzy matching.

---

# 9. Search regression coverage

Add representative tests for:

- exact Polish spelling;
- unaccented Polish typing;
- `ł -> l`;
- `ź -> z`;
- `ż -> z`;
- `ó -> o`;
- English canonical alias lookup;
- one stable result per entity;
- localized Polish display after English-alias search;
- exact-before-folded ranking;
- no regression for existing locales.

Use real resource/product names from the Polish overlay where practical.

The previous corpus audit found zero new collisions under:

```text
NFD folding
NFD folding + ł -> l
```

Preserve deterministic tie-breaking in case future data introduces collisions.

---

# 10. Locale-aware collation

Ensure Polish uses the existing shared locale collator.

Add/extend tests for representative ordering:

```text
a / ą
c / ć
l / ł
n / ń
o / ó
s / ś
z / ź / ż
```

and numeric ordering.

Do not locale-sort lists with domain order.

Preserve domain ordering for:

- body/orbit/source order;
- biome occurrence order;
- resource-family topology;
- persisted outpost order;
- Cargo Link user order;
- validation severity/rule order;
- history chronology;
- explicit source-class order.

---

# 11. Polish shortcut speech

Add Polish speech forms for the existing keyboard-shortcut registry:

```text
Control
Alt
Shift
plus
Strzałka w górę
Strzałka w dół
Strzałka w lewo
Strzałka w prawo
```

Requirements:

- visible chord tokens/bindings remain unchanged;
- speech strings come from the existing locale-aware speech layer;
- Help remains registry-driven;
- no new shortcut bindings;
- no Narrator-specific workaround yet.

Final audible verification is deferred to the closure parcel.

---

# 12. Formatting

Verify existing formatters resolve correctly under:

```text
pl-PL
```

At minimum test:

- integers/grouping;
- decimal separator;
- percent formatting;
- lists/conjunctions;
- current plural-rendering path.

Do not add date/time formatting unless current runtime actually displays localized dates/times.

Persisted/schema formats remain invariant.

Export filename timestamps remain invariant.

---

# 13. Typography and glyph sanity

Automated/runtime checks should ensure Polish strings flow through the existing Latin font stack.

Required glyph set includes:

```text
Ą Ć Ę Ł Ń Ó Ś Ź Ż
ą ć ę ł ń ó ś ź ż
```

Do not add Polish-specific fonts or CSS.

A focused smoke test may check representative headings/labels, but full typography/fallback QA belongs to the final closure parcel.

If a missing-glyph defect is discovered, report it rather than changing geometry or transliterating text.

---

# 14. Focused runtime smoke test

This parcel should perform a focused runtime smoke, not the full release matrix.

At minimum verify in Polish:

- locale appears in selector;
- switching to Polish works immediately;
- selector persists after reload;
- current network/outpost context survives switching;
- Navigation displays;
- Outpost Details displays;
- Resource Matrix opens;
- Planned Supply opens;
- Cargo opens;
- Search works;
- Validation opens;
- Help opens;
- About opens;
- reference names appear localized;
- locale switch back to another supported locale works;
- `document.lang` follows the active locale.

Do not duplicate the later full 1366/1600/200%/keyboard/Narrator/import-export matrix.

---

# 15. Import/export

No new schema or persistence behavior is required.

Automated/runtime integration tests should prove locale switching does not affect:

- export schema;
- imported data identity;
- stable IDs;
- history snapshots.

A full manual localized import/export QA pass is deferred to release closure.

---

# 16. Bundle measurement

Measure the production build after Polish activation.

Report at least:

```text
HTML raw / gzip
CSS raw / gzip
JS raw / gzip
```

Compare against the previous post-Portuguese baseline where available.

Do not optimize merely because Vite emits a large-chunk warning.

Do not introduce lazy locale loading in this parcel.

The dedicated bundle/startup review remains after Simplified Chinese onboarding unless Polish activation exposes a concrete runtime problem.

---

# 17. Existing global defects are not Polish blockers

Do not reopen or fix in this parcel unless Polish reveals a genuinely distinct regression:

- Resource Matrix focus moves but visible focus border may be missing;
- focused/programmatically navigated content can be hidden beneath fixed page chrome;
- Cargo Link Undo may collapse unrelated expanded Cargo Links;
- intermittent Narrator Solar-control/focus ambiguity;
- Narrator shortcut chord announcement/interception issues;
- compact Cargo/Matrix accessible-context follow-up.

Record Polish-specific worsening if observed.

Do not silently fix global accessibility/layout debt during runtime integration.

---

# 18. No final support status yet

After this parcel, Polish should be:

```text
runtime available
release closure pending
```

Do not mark:

```text
Supported
```

yet.

Support status is reserved for the next full layout/accessibility/release-closure parcel.

Do not add a final Polish Locale Profile claiming closure until that QA passes.

---

# 19. Durable documentation

Update durable documentation only where runtime activation makes current statements materially stale.

Likely minimal changes may include:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/ARCHITECTURE.md
```

if they explicitly enumerate runtime locales or Polish status.

Use wording such as:

```text
Polish runtime integrated; release closure pending
```

Do not mark Polish Supported.

Do not alter the remaining Simplified Chinese roadmap beyond necessary count/status wording.

Do not perform final selector-order cleanup.

---

# 20. Tests

Add/extend durable coverage for:

- runtime locale registry;
- `runtimeAvailable: true`;
- semantic catalogue registration;
- reference overlay registration;
- selector label;
- preference persistence;
- browser mapping positive/negative cases;
- preference-list continuation;
- `document.lang`;
- localized reference lookup;
- Polish search folding;
- `ł -> l`;
- exact-before-folded ranking;
- canonical English aliases;
- collation;
- shortcut speech;
- formatters;
- runtime switching without domain mutation;
- build-time overlay verification.

Prefer shared parameterized locale tables.

Do not duplicate entire test suites solely for Polish.

---

# 21. Verification

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

Run any dedicated locale-closure/runtime-registration/search tests currently used by other locales.

Report exact results.

---

# 22. Scope discipline

Expected tracked changes may include:

```text
reference-source/localization-locale-metadata.json
src/localization/types.ts
src/localization/registry.ts
src/localization/referenceNames.ts
src/localization/locale.ts
src/ui/itemSearch.ts
src/ui/keyboardShortcuts.ts
tests/...
possibly small durable docs
```

Do not modify:

```text
src/localization/locales/pl-PL.ts
src/localization/generated/pl-PL-reference-names.ts
reference-source/localized-fauna-evidence-pl-PL.json
CSS/layout geometry
persistence/domain schema
```

unless a genuine bug is discovered and explicitly reported.

---

# 23. Explicitly out of scope

Do not:

- redo semantic adjudication;
- change Polish terminology/glossary;
- change Polish fauna evidence;
- change physical UI geometry;
- perform final release closure;
- mark Polish Supported;
- fix unrelated global accessibility bugs;
- perform Apple/WebKit testing;
- reorder final locale selector;
- move XLIFF files;
- optimize bundle/lazy-load locales;
- begin Simplified Chinese onboarding.

---

# 24. Completion criteria

This parcel is complete when:

- Polish is runtime-available;
- Polish semantic catalogue is registered;
- Polish reference overlay is registered;
- selector shows `Polski (Polska)`;
- conservative browser mapping works;
- `document.lang` is exact;
- Polish search folding and `ł -> l` work with exact-first ranking;
- canonical English aliases remain searchable;
- Polish collation works through shared `Intl`;
- shortcut speech is registered;
- formatting uses `pl-PL`;
- focused runtime smoke passes;
- bundle is measured;
- no domain/persistence mutation occurs;
- Polish is not yet marked Supported.

---

# Completion response

Return:

1. branch;
2. files changed;
3. metadata runtime status;
4. supported runtime locale registration;
5. semantic catalogue registration;
6. reference-overlay registration;
7. selector label;
8. browser mapping positive cases;
9. browser mapping negative/continuation cases;
10. `document.lang` result;
11. search folding behavior;
12. `ł -> l` implementation;
13. search collision/tie behavior;
14. canonical English alias behavior;
15. collation result;
16. shortcut speech forms;
17. formatter verification;
18. locale switching/persistence result;
19. domain/persistence invariance result;
20. focused runtime smoke result;
21. any Polish-specific visual issues observed;
22. any Polish-specific accessibility issues observed;
23. HTML bundle raw/gzip;
24. CSS bundle raw/gzip;
25. JS bundle raw/gzip;
26. bundle delta from previous baseline if available;
27. automated verification results;
28. `git diff --check` result;
29. durable documentation changes;
30. confirmation Polish is runtime-available but not yet Supported;
31. confirmation semantic catalogue/reference overlay/fauna evidence were not modified;
32. deviations from brief;
33. recommended next stage;
34. suggested commit message;
35. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.
