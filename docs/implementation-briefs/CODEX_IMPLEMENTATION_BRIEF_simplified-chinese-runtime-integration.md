# Codex Implementation Brief — Simplified Chinese Runtime Integration and Manual QA Readiness

## Objective

Activate the already-complete Simplified Chinese locale (`zh-Hans`) in the Starfield Outpost Tracker runtime using the existing localization architecture.

This stage should:

- make `zh-Hans` selectable in the live application;
- map supported browser-language preferences to `zh-Hans`;
- register the completed semantic catalogue and official Bethesda reference-name overlay;
- set the correct document language;
- use the approved Simplified Chinese system-font stack;
- use the approved Chinese collation baseline;
- localize shortcut-speech strings using the agreed modifier/arrow terminology;
- preserve the already-agreed Chinese search behavior;
- add or update focused automated tests;
- prepare the locale for manual 200% zoom, Narrator, and layout-capacity QA.

Do not perform broad cross-locale selector-order cleanup in this stage.

Do not make geometry/layout changes unless a change is required to fix a demonstrable functional defect and is separately justified.

Do not commit or push.

---

# Current state

Simplified Chinese semantic and reference-data work is already complete.

Runtime locale contract:

```text
runtime locale: zh-Hans
Bethesda token: zhhans
encoding: strict UTF-8
scope: full
```

Current staged metadata still has:

```text
runtimeAvailable: false
```

Completed inputs include:

- final 414-key `zh-Hans` semantic catalogue;
- official Bethesda terminology/glossary constraints;
- 3,561-entry Simplified Chinese reference-name overlay;
- zero unresolved official reference-name mappings;
- fauna composition/evidence closure from supplied in-game screenshots;
- provenance verification.

This task activates those existing assets. It must not reopen semantic adjudication or reference-name generation.

---

# Settled runtime decisions

## 1. Locale identity

Use:

```text
zh-Hans
```

Do not rename this to:

```text
zh-CN
zh
zhhans
```

Those may be accepted browser/input aliases as described below, but the application locale identity is:

```text
zh-Hans
```

---

## 2. Selector label

The live language selector label must be:

```text
简体中文
```

Do not append:

```text
(中国)
(简体)
zh-Hans
```

unless the existing selector architecture displays technical locale tags separately for all locales.

Use the same selector presentation pattern as the other supported locales.

---

# Browser-language mapping

## 3. Supported mappings to `zh-Hans`

Map the following browser-language preferences to Simplified Chinese:

```text
zh
zh-Hans
zh-Hans-*
zh-CN
zh-SG
```

Examples that should resolve to `zh-Hans`:

```text
zh
zh-Hans
zh-Hans-CN
zh-Hans-SG
zh-CN
zh-SG
```

Regional subtags beneath a matching Simplified/script form should continue to resolve to `zh-Hans`.

---

## 4. Explicit Traditional Chinese must not map to `zh-Hans`

Do **not** map the following to Simplified Chinese:

```text
zh-Hant
zh-Hant-*
zh-TW
zh-HK
zh-MO
```

These should continue through the browser-language preference list and allow the next supported locale to resolve normally.

Do not fall back from explicit Traditional Chinese to `zh-Hans`.

---

## 5. Explicit script outranks region inference

If a language tag contains an explicit script subtag, the explicit script controls the result.

Examples:

```text
zh-Hant-CN
```

must **not** map to `zh-Hans` merely because the region is `CN`.

Likewise:

```text
zh-Hans-TW
```

should map to `zh-Hans` because the explicit script is Simplified even though the region is `TW`.

Preserve the browser preference order already used by the application.

Do not invent geopolitical assumptions beyond these language-tag rules.

---

# Runtime registration

## 6. Activate the locale

Change the established locale metadata so:

```text
runtimeAvailable: true
```

for `zh-Hans`.

Register the locale through the same runtime path as existing supported locales.

Do not add a Chinese-only registration mechanism.

---

## 7. Semantic catalogue

Use the completed final catalogue:

```text
src/localization/locales/zh-Hans.ts
```

Do not regenerate or rewrite semantic strings as part of runtime activation.

The final catalogue must remain:

```text
414/414 keys
```

with exact placeholder parity.

Any unexpected semantic diff is out of scope and should stop the task.

---

## 8. Reference-name overlay

Register/use the completed generated Simplified Chinese reference overlay through the existing generalized reference-localization path.

Expected artifact:

```text
src/localization/generated/zh-Hans-reference-names.ts
```

Expected coverage:

```text
3,561/3,561
0 unresolved
```

Do not rebuild or reinterpret Bethesda translations unless the existing verification workflow requires deterministic regeneration.

Do not introduce a runtime-only fallback that bypasses the verified overlay.

---

# Document language

## 9. Set `document.documentElement.lang`

When `zh-Hans` is active, the document language must be:

```html
<html lang="zh-Hans">
```

Use the existing locale/document-language mechanism.

Do not use:

```text
zh-CN
zh
zhhans
```

for the HTML language attribute.

Verify that switching away from Chinese restores the appropriate language attribute for the newly selected locale.

---

# Simplified Chinese font stack

## 10. Use a locale-scoped system-font stack

Add a Simplified Chinese font stack scoped to:

```css
:lang(zh-Hans)
```

or the repository's equivalent locale-aware typography selector.

Approved stack:

```css
'Microsoft YaHei UI',
'Microsoft YaHei',
'PingFang SC',
'Noto Sans CJK SC',
system-ui,
sans-serif
```

Rationale:

- `Microsoft YaHei UI` / `Microsoft YaHei` provide the primary Windows QA target;
- `PingFang SC` provides a native macOS/Safari fallback;
- `Noto Sans CJK SC` provides a common Linux/CJK fallback;
- `system-ui` / `sans-serif` preserve final generic fallback behavior.

Do not bundle fonts.

Do not fetch network fonts.

Do not make these fonts the application-wide default.

Do not alter font sizes, weights, line heights, or geometry merely because Chinese uses a different font.

The stack must remain easy to reorder later if WebKit/macOS QA indicates a better platform preference.

---

# Typography and line breaking

## 11. Use browser-default CJK line breaking initially

Do not add Chinese-specific:

```css
word-break
line-break
overflow-wrap
white-space
```

rules unless an existing rule actively breaks normal Chinese rendering.

The baseline is normal browser CJK behavior.

If runtime/manual QA exposes a real line-breaking defect, report it rather than pre-emptively adding CSS.

---

# Collation and sorting

## 12. Approved collation baseline

Where locale-aware sorting uses an `Intl.Collator`, use:

```ts
new Intl.Collator('zh-Hans', {
  sensitivity: 'base',
  numeric: true,
})
```

or the equivalent through the existing shared collation abstraction.

Do not implement:

- pinyin-specific sorting logic;
- custom stroke/radical sorting;
- manual transliteration;
- Chinese-specific sort tables.

Reuse the generalized locale-aware sorting architecture.

If the app already creates the collator from the active locale generically, prefer that rather than adding a special case.

---

# Search behavior

## 13. Preserve the already-approved search policy

Simplified Chinese search should use:

- exact localized-name matches;
- prefix matches;
- substring matches;
- English aliases;
- abbreviations;
- existing curated alternates;
- existing deterministic ranking rules.

Do **not** add:

```text
pinyin
fuzzy transliteration
Simplified/Traditional conversion
broad width folding
space-removal normalization
new punctuation folding
phonetic matching
```

Do not change search ranking merely because Chinese becomes active.

The official Chinese localized name should participate through the same localized-reference catalogue path as other locales.

---

# Shortcut speech / accessible shortcut descriptions

## 14. Approved spoken key terminology

For Chinese localized shortcut speech/descriptions, preserve the familiar Latin modifier key names:

```text
Control
Alt
Shift
```

Use Chinese for:

```text
加
上箭头
下箭头
左箭头
右箭头
```

Do not replace the modifier names with:

```text
控制键
替换键
换档键
```

or other literal translations.

Use the existing shortcut-description architecture.

Do not special-case global Narrator behavior here.

Known global Narrator/shortcut interaction issues remain separate follow-up debt, including:

- some shortcut chords not being announced;
- `Ctrl+Alt+ArrowUp` / `Ctrl+Alt+ArrowDown` potentially being intercepted with “Not on table”;
- `/` Search shortcut potentially being unavailable while Narrator is running.

Those issues are not blockers for Chinese activation unless this parcel introduces a new Chinese-specific regression.

---

# Accessibility

## 15. Preserve existing accessible names and live-region behavior

Verify that Chinese localized strings populate:

- labels;
- accessible names;
- descriptions;
- live-region/status messages;
- validation messages;
- shortcut help.

Do not restructure accessibility code solely for Chinese.

Any locale-independent accessibility defect found during QA should be reported separately rather than disguised as a Chinese translation fix.

---

# Layout / geometry freeze

## 16. Do not autonomously change geometry

Localization activation must **not** change physical UI geometry or styling merely to accommodate Chinese.

Do not alter:

- control widths/heights;
- panel dimensions;
- grid/flex proportions;
- margins;
- padding;
- gaps;
- min/max dimensions;
- breakpoints;
- wrapping geometry;
- sticky/fixed positioning;
- scroll geometry;
- typography metrics where layout changes;
- dialog geometry;
- header geometry;
- status-bar geometry;
- Resource Matrix geometry;
- Navigation geometry;
- Cargo geometry;
- Planned Supply geometry;
- tuned 1366 layout;
- colors;
- borders;
- shadows;
- icon sizing.

If Chinese causes clipping, wrapping, overlap, or capacity pressure, record it for the separate cross-locale layout review.

Do not fix shared layout debt inside this activation parcel unless the defect prevents basic use.

---

# Known layout-risk areas to inspect

## 17. Manual QA should explicitly observe

During runtime/manual QA, pay particular attention to:

- Solar/Wind quality controls;
- Resource Matrix headers;
- localized search placeholder;
- language selector;
- About/help dialogs;
- validation/status text;
- Cargo Link labels;
- Planned Supply labels;
- shortcut-help dialog;
- fixed header and status bar at high zoom.

Existing localized control-capacity/layout debt is not automatically a Chinese blocker.

Classify findings as:

```text
Chinese-specific blocker
shared cross-locale debt
cosmetic/non-blocking
```

Do not silently adjust layout during this implementation.

---

# Language selector ordering

## 18. Do not perform final selector ordering cleanup here

Add `简体中文` using the current selector-order convention sufficient to expose the locale correctly.

Do not use this stage to redesign or globally reorder all languages.

Final language-selector ordering is a separate post-localization cleanup task now that all V1 locales are present.

Avoid unrelated churn.

---

# Locale switching

## 19. Verify live switching

Switching to and from Simplified Chinese must correctly update:

- semantic UI strings;
- official reference names;
- document language;
- locale-aware sorting;
- shortcut descriptions;
- persisted user locale selection, if existing locales already persist selection.

Do not reload the page unless that is already the established behavior for all locales.

Chinese should follow the same lifecycle as existing locales.

---

# Persistence and import/export

## 20. Locale activation must not mutate user data

Changing locale must not:

- rewrite network data;
- alter canonical stored IDs;
- change exported data schema;
- localize persisted identifiers;
- change import compatibility.

Reference localization remains a presentation concern.

Run relevant persistence/import/export regressions already used for other locale activations.

---

# Tests

## 21. Focused runtime tests

Add/extend tests covering at minimum:

### Locale activation

- `zh-Hans` is runtime-available;
- selector exposes `简体中文`;
- final 414-key catalogue is used;
- 3,561-entry reference overlay resolves through runtime.

### Browser mapping

Positive mapping:

```text
zh
zh-Hans
zh-Hans-CN
zh-Hans-SG
zh-CN
zh-SG
```

Negative/continue-later-preference behavior:

```text
zh-Hant
zh-Hant-CN
zh-TW
zh-HK
zh-MO
```

Explicit-script precedence:

```text
zh-Hans-TW -> zh-Hans
zh-Hant-CN -> not zh-Hans
```

### Document language

- active Chinese produces `lang="zh-Hans"`;
- switching away restores the selected locale's language tag.

### Font stack

- locale-scoped Chinese font rule exists;
- Windows, Apple, Noto, and generic fallbacks are present in the approved order;
- no bundled/network font dependency is introduced.

### Collation

- Chinese uses `zh-Hans` locale-aware collation through the existing abstraction;
- numeric ordering behavior remains enabled.

Do not write brittle tests expecting a particular dictionary/pinyin sort order unless already contractual.

### Search

Verify representative:

- Chinese exact localized-name match;
- Chinese prefix match;
- Chinese substring match;
- English alias still finds the localized result;
- abbreviation behavior remains intact;
- no pinyin behavior is accidentally introduced.

### Accessibility/shortcuts

Verify Chinese shortcut speech fragments use:

```text
Control
Alt
Shift
加
上箭头
下箭头
左箭头
右箭头
```

as applicable.

---

# Cross-locale regression protection

## 22. Existing supported locales must remain stable

Verify that activation of Chinese does not alter:

```text
English
Japanese
French
German
Spanish (Spain)
Italian
Polish
Portuguese (Brazil)
```

except for the expected addition of `zh-Hans` to runtime-supported locale lists.

Do not regenerate unrelated catalogues/overlays unless the existing deterministic process requires it.

If unrelated generated hashes change unexpectedly, stop and investigate.

---

# Manual QA readiness

## 23. Prepare, but do not fabricate, manual QA results

This implementation should leave the app ready for the user to perform:

- normal-scale smoke test;
- true 200% browser zoom;
- keyboard-only navigation;
- Windows Narrator;
- locale switching;
- import/export announcement checks;
- Resource Matrix;
- Cargo Links;
- Planned Supply;
- search;
- About/help dialogs.

Codex must not claim manual QA passed unless the user actually reports it.

Automated tests may verify code-level accessibility behavior, but they are not a substitute for the user's Narrator/zoom pass.

---

# Expected manual QA matrix after implementation

The user will subsequently verify at least:

```text
1. Select 简体中文.
2. Confirm main UI becomes Simplified Chinese.
3. Confirm official Starfield reference names are Chinese.
4. Confirm no missing-glyph/tofu characters.
5. Confirm switching away/back works.
6. Confirm true 200% zoom remains usable.
7. Inspect Solar/Wind controls for capacity pressure.
8. Inspect Resource Matrix headers.
9. Inspect search placeholder/results.
10. Inspect Cargo Links and Planned Supply.
11. Run keyboard-only navigation.
12. Run Narrator through key controls, dialogs, status announcements, and shortcut help.
13. Exercise import/export success/failure announcements.
14. Confirm no new page-level scrollbar at the supported 1366 desktop baseline unless already known/shared.
```

Do not encode this exact sequence into production code.

It may be included in documentation or completion guidance.

---

# Documentation

## 24. Update Simplified Chinese onboarding status

Update the existing Simplified Chinese onboarding audit to record:

- runtime activation implemented;
- selector label `简体中文`;
- browser mapping policy;
- explicit Traditional Chinese exclusions;
- script-precedence behavior;
- `document.lang = zh-Hans`;
- font stack;
- collation baseline;
- shortcut-speech terminology;
- search policy unchanged;
- semantic catalogue/reference overlay counts;
- runtime automated tests passed;
- manual 200%/Narrator QA still pending until user reports results.

Do not mark the locale fully closed/supported solely from automated tests if the established locale process requires manual QA.

---

# Runtime status transition

## 25. `runtimeAvailable`

This parcel should change:

```text
runtimeAvailable: false
```

to:

```text
runtimeAvailable: true
```

only after the runtime integration is complete and automated verification passes.

If the repository architecture uses a separate support/readiness flag for manual QA closure, preserve that distinction.

Do not falsely record manual QA completion.

---

# Out of scope

Do not perform:

```text
semantic translation changes
reference-overlay translation changes
fauna evidence changes
DeepL/Codex adjudication
pinyin search
Traditional Chinese support
Simplified/Traditional conversion
final selector ordering cleanup
global XLIFF cleanup
post-all-localization bundle review
broad cross-locale layout fixes
Apple/WebKit compatibility work
global Narrator shortcut fixes
Cargo Undo expansion bug fix
focus-border bug fix
fixed-header/high-zoom focus visibility fix
About/support/Ko-Fi expansion
app versioning work
HSTS review
public-launch noindex removal
```

Report any newly observed issue rather than absorbing it into this parcel.

---

# Validation

Run the repository's actual relevant commands.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:terminology:verify
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify -- --locale zh-Hans
npm run reference:test
npm run build
npm run lint
git diff --check
```

Also run focused runtime/browser-mapping/search/shortcut tests for `zh-Hans`.

If a dedicated localization runtime or browser-language test command exists, run it.

---

# Stop conditions

Stop and report rather than improvising if:

- activation requires changing Chinese semantic/reference data unexpectedly;
- any official reference mapping becomes unresolved;
- runtime uses a locale identity other than `zh-Hans`;
- explicit `zh-Hant` begins mapping to Simplified Chinese;
- another locale disappears from the selector;
- existing locale browser mappings regress;
- Chinese requires bundled/network fonts;
- pinyin or transliteration becomes necessary to make normal search work;
- generalized runtime architecture cannot register the Chinese overlay without special-case duplication;
- existing locale generated output changes unexpectedly;
- a geometry change appears necessary simply to make Chinese fit.

Do not silently broaden scope.

---

# Completion criteria

This stage is complete when:

- `zh-Hans` is runtime-available;
- `简体中文` appears in the live selector;
- accepted browser Simplified-Chinese language tags map correctly;
- explicit Traditional-Chinese language tags do not map to `zh-Hans`;
- explicit script takes precedence over region inference;
- semantic catalogue is live;
- official Chinese reference overlay is live;
- `document.lang` is `zh-Hans` while active;
- approved locale-scoped font stack is present;
- locale-aware collation uses `zh-Hans`;
- search behavior remains within approved scope;
- shortcut speech uses agreed terminology;
- existing locales remain available and stable;
- automated verification passes;
- manual zoom/Narrator QA is clearly left pending for user execution.

---

# Completion response

Return:

1. branch;
2. files changed;
3. locale metadata/runtime registration changes;
4. confirmation `runtimeAvailable` is now `true`;
5. selector label;
6. selector position under the current ordering convention;
7. semantic catalogue key count;
8. reference overlay entry count;
9. positive browser-language mappings implemented;
10. Traditional-Chinese exclusions verified;
11. explicit-script precedence test results;
12. `document.lang` behavior;
13. exact Chinese font stack implemented;
14. confirmation font rule is scoped to `zh-Hans`;
15. confirmation no bundled/network fonts were added;
16. collation implementation/result;
17. search behavior verification;
18. confirmation no pinyin/Simplified-Traditional conversion was added;
19. shortcut-speech terminology implemented;
20. locale switching verification;
21. persistence/import/export regression result;
22. focused `zh-Hans` runtime test results;
23. browser-mapping test results;
24. search test results;
25. accessibility/shortcut test results;
26. cross-locale regression result;
27. `npm test` result;
28. `npm run test:components` result;
29. `npm run typecheck:tests` result;
30. `npm run localization:terminology:verify` result;
31. `npm run localization:provenance:test` result;
32. `npm run localization:provenance:verify` result;
33. `npm run localization:reference-names:verify -- --locale zh-Hans` result;
34. `npm run reference:test` result;
35. `npm run build` result;
36. `npm run lint` result;
37. `git diff --check` result;
38. onboarding-audit update;
39. confirmation manual 200%/Narrator QA is still pending;
40. confirmation no geometry/layout changes were made;
41. confirmation no final selector-order cleanup was performed;
42. confirmation no Apple/WebKit-specific work was performed;
43. deviations from brief;
44. unresolved user decisions;
45. recommended manual QA next step;
46. suggested commit message;
47. confirmation no commit/push occurred.

Suggested commit message:

```text
feat: activate Simplified Chinese locale
```
