# Codex Implementation Brief — Polish Layout, Accessibility, and Release Closure

## Objective

Perform the final Polish localization closure pass and, if the evidence is green, mark Polish as **Supported**.

Target locale:

```text
Tracker locale:   pl-PL
Bethesda token:   pl
Runtime status:   active
Target end state: Supported if closure passes
```

This parcel is verification, release-closure documentation, and only narrowly justified non-geometry correction work.

Do not redesign layout.

Do not perform cross-locale geometry cleanup here.

Do not begin Simplified Chinese onboarding.

Do not commit or push unless explicitly instructed.

---

# Settled release policy

Polish may be marked **Supported** if:

- all automated closure checks pass;
- no Polish-specific blocking semantic, functional, accessibility, typography, or runtime defect is found;
- actual 200% browser zoom remains usable;
- representative Windows/Chromium accessibility checks pass sufficiently for localization closure;
- import/export and localized feedback work;
- search and browser mapping behave as designed;
- known global issues do not show a distinct Polish regression.

Native-speaker review is desirable but **not** a hard support gate.

Apple/WebKit remains deferred.

---

# Known observations to carry into closure

The user has already observed during Polish runtime smoke testing:

## Non-blocking layout pressure

- Solar/Wind headings and controls are visually tight due to longer Polish labels.
- Resource Matrix header-row labels also create some alignment/spacing pressure.

These are **not** currently blocking.

Do not modify geometry in this parcel.

Record them as shared/cross-locale layout debt if not already covered.

## Search Results

The Polish Search Results message was inspected and appears complete rather than truncated.

Do not create a defect for that unless closure testing finds an actual clipping case.

## Runtime smoke already passed

The user has already verified:

- locale selector;
- import/export success;
- invalid JSON localized error feedback;
- Navigation;
- Cargo Links;
- Planned Supply;
- Validation;
- Outpost Details;
- Search;
- Search Results;
- Resource Matrix;
- Help;
- About;
- representative tooltips;
- Polish diacritics rendering.

Do not require the user to repeat checks that Codex can complete or that existing evidence already covers, unless needed to reproduce a new issue.

---

# Geometry freeze

This is absolute during localization closure.

Do not autonomously change:

- button/control widths or heights;
- panel dimensions;
- table/grid/flex proportions;
- margins;
- padding;
- gaps;
- min/max sizes;
- breakpoints;
- wrapping geometry;
- sticky/fixed positioning;
- scroll geometry;
- font size;
- line-height;
- letter-spacing where layout changes;
- colors;
- borders;
- shadows;
- icon sizes;
- dialog geometry;
- header geometry;
- status-bar geometry;
- Resource Matrix geometry;
- Navigation geometry;
- Cargo geometry;
- Planned Supply geometry;
- tuned 1366px layout.

If Polish exposes a presentation issue:

1. document the defect;
2. classify severity and user impact;
3. note candidate mitigation only if useful;
4. preserve geometry;
5. defer implementation to the later cross-locale layout pass.

---

# Blocking vs non-blocking standard

## BLOCKING

Examples:

- inaccessible essential control;
- untranslated/fallback English in required Polish UI;
- broken localized workflow;
- missing or malformed glyphs that obscure meaning;
- materially incorrect Polish semantic content;
- broken search identity or incorrect result;
- broken import/export caused by Polish localization;
- wrong browser-locale routing;
- locale switch mutates domain data;
- inaccessible dialog/focus flow specific to Polish;
- 200% zoom makes essential UI unusable;
- critical screen-reader information unavailable specifically because of Polish localization.

## NON-BLOCKING

Examples:

- text looks cramped but remains usable;
- alignment is imperfect;
- a label wraps or clips cosmetically but meaning remains available;
- known global Narrator/browser shortcut behavior reproduces unchanged;
- known fixed-chrome focus occlusion reproduces unchanged;
- known Matrix focus-border issue reproduces unchanged;
- known Cargo Link Undo collapse regression reproduces unchanged;
- native-speaker review unavailable;
- Apple/WebKit unavailable.

Do not downgrade a real functional failure merely because a related global defect exists.

---

# 1. Polish status remains pending until closure

At the start of this parcel Polish is:

```text
runtime integrated
release closure pending
```

Do not mark it Supported until all required closure evidence is gathered.

---

# 2. Automated semantic/runtime closure

Verify:

- exact 414-key parity;
- exact placeholder-name parity;
- no empty Polish semantic values;
- no accidental English residue outside approved invariants;
- protected tokens intact;
- valid plural syntax;
- official terminology constraints satisfied;
- final catalogue deterministic;
- Polish reference overlay deterministic;
- provenance closure remains exact;
- terminology closure remains exact;
- fauna evidence remains provisionally accepted;
- runtime registry includes Polish;
- `runtimeAvailable: true`;
- selector label is correct;
- locale switching remains presentation-only.

---

# 3. Live semantic sanity pass

Perform a bounded live/runtime semantic pass across dense surfaces.

Inspect at least:

- header / network controls;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo;
- Search;
- Search Results;
- Validation;
- Help;
- About;
- status/import/export feedback.

Look for:

- accidental English fallback;
- stale terminology;
- mistranslated compact labels;
- placeholder rendering problems;
- malformed punctuation;
- count-neutral wording failures;
- obvious grammar contradictions caused by runtime values.

Do not attempt native-speaker editorial certification.

This is a sanity check for implementation mistakes and obvious semantic defects.

---

# 4. Polish count-neutral messages

Exercise the Polish count-neutral strategy live where practical.

Important keys:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
validation.counts
```

Use representative values where the current UI can naturally produce them.

Relevant Polish plural-rule test counts remain:

```text
1
2
5
12
22
25
```

You do not need to force every count manually if automated tests already prove rendering.

The closure question is:

> Does the visible Polish remain grammatically safe without relying on one/few/many noun inflection?

If yes, pass.

If any message becomes grammatically wrong because of count, stop and report it as a semantic blocker.

---

# 5. Layout matrix

Perform automated/browser-capable layout checks for Polish at:

```text
1366px desktop @ 100%
1600px desktop @ 100%
actual browser zoom 200%
```

If Codex cannot exercise true browser-controlled 200% zoom in the available environment, explicitly mark that as a manual gate for the user.

At each size inspect major surfaces:

- header / selector;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo;
- Search Results;
- Validation;
- Help/About dialogs;
- status bar.

Check:

- document-level horizontal overflow;
- unusable control clipping;
- hidden essential text;
- dialogs inaccessible or unscrollable;
- severe breakpoint failures;
- focus targets becoming unreachable;
- text overlap that destroys meaning.

Record the known Solar/Wind and Matrix-header pressure without changing geometry.

---

# 6. Keyboard-only closure

Verify keyboard operation in Polish for:

- locale selector;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo;
- Search;
- Search Results;
- Validation;
- Help;
- About;
- modal Escape/focus restoration;
- all registered keyboard shortcuts;
- reorder modes.

Known global shortcut issues under Narrator are handled separately below.

Polish itself must not introduce broken bindings or inaccessible focus order.

---

# 7. Windows Narrator closure

Use Windows/Chromium Narrator where available.

If unavailable in Codex's environment, leave only those checks for the user.

Do not require native-speaker pronunciation certification.

Verify representative Polish announcements for:

- locale selector;
- Search field;
- Search Result;
- Validation issue;
- Help dialog title;
- one keyboard shortcut;
- About dialog;
- one compact/icon control;
- one ordinary status/live-region message;
- import/export success/failure feedback.

The closure question is whether the relevant accessible name/state/message is present and localized.

---

# 8. Existing global Narrator issues

The following are already shared/global accessibility follow-up and do not block Polish unless behavior is materially worse or distinct:

- shortcut chord text may not be announced;
- `Ctrl+Alt+ArrowUp/ArrowDown` may be intercepted by Narrator;
- `/` Search shortcut may be unavailable under Narrator;
- Cargo compact-control announcement behavior;
- Resource Matrix compact-control accessible-context follow-up;
- intermittent Solar-control announcement/focus ambiguity.

If reproduced unchanged:

```text
GLOBAL / NON-BLOCKING
```

If Polish behaves differently:

```text
POLISH-SPECIFIC / INVESTIGATE
```

Do not fix these in this parcel.

---

# 9. Import/export closure

Verify in Polish:

## Export

- successful export;
- localized status/live-region feedback;
- filename behavior unchanged.

## Valid import

- successful import;
- localized success feedback;
- existing domain/persistence semantics preserved.

## Invalid JSON

- import rejected;
- existing data preserved;
- localized failure message;
- appropriate live-region/Narrator announcement where available.

The user has already reported visual success for these workflows during runtime smoke.

Codex should automate or browser-test what it can.

If audible Narrator announcement cannot be exercised, leave only that sub-check for manual testing.

---

# 10. Search closure

Verify Polish runtime search for:

- exact localized spelling;
- ordinary diacritic folding;
- `ł -> l`;
- `ó -> o`;
- `ą -> a`;
- `ę -> e`;
- `ź -> z`;
- `ż -> z`;
- canonical English alias;
- exact localized spelling ranks ahead of folded matches;
- one visible result per stable entity;
- Polish display text remains localized after English-alias lookup;
- punctuation is not broadly stripped.

Use real resource/product examples from the committed Polish overlay.

---

# 11. Collation closure

Verify representative Polish ordering:

```text
a / ą
c / ć
l / ł
n / ń
o / ó
s / ś
z / ź / ż
```

plus numeric ordering.

Confirm shared `Intl.Collator` is being used.

Do not change domain-order lists.

---

# 12. Browser mapping closure

Verify:

```text
pl       -> pl-PL
pl-PL    -> pl-PL
pl-PL-*  -> pl-PL
```

and negative/continuation behavior for at least:

```text
pl-UA
```

with a later supported preference.

Example:

```text
navigator.languages = ['pl-UA', 'de-DE']
```

should continue and select:

```text
de-DE
```

rather than mapping `pl-UA` to Polish or falling immediately to global default.

Preserve current explicit-user preference precedence.

---

# 13. Locale switching and persistence

Verify:

- switching to Polish is immediate;
- reload preserves Polish;
- switching away works;
- current network survives;
- selected outpost survives;
- user-authored names survive;
- history remains intact;
- stable IDs remain unchanged;
- no import/export schema mutation occurs;
- `document.lang` exactly follows active locale.

---

# 14. Typography/glyph closure

Inspect Polish glyphs in representative UI:

```text
Ą Ć Ę Ł Ń Ó Ś Ź Ż
ą ć ę ł ń ó ś ź ż
```

Check:

- ordinary body text;
- condensed headings;
- uppercase labels;
- buttons;
- table headings;
- technical/mono-adjacent contexts.

Look for:

- missing glyph boxes;
- accidental font fallback with obviously incompatible metrics;
- malformed accents;
- clipping caused specifically by glyph rendering.

Do not solve metric/layout issues in this parcel.

---

# 15. Known Polish layout observations

Explicitly record:

## Solar/Wind

Longer Polish headings create visible pressure/alignment differences.

Current status:

```text
non-blocking unless closure finds actual usability loss
```

## Resource Matrix

Longer Polish header labels create some alignment pressure.

Current status:

```text
non-blocking unless closure finds actual usability loss
```

Do not create separate geometry fixes here.

If these are manifestations of the same broader cross-locale capacity problem, consolidate them in durable backlog wording rather than creating Polish-only geometry work.

---

# 16. Bundle measurement

Run production build and record:

```text
HTML raw / gzip
CSS raw / gzip
JS raw / gzip
```

Measure only.

Do not:

- lazy-load locales;
- code-split solely to suppress Vite warnings;
- remove localization data;
- optimize bundle in this parcel.

Post-localization bundle review remains after Simplified Chinese.

---

# 17. Apple/WebKit

Still deferred.

Do not require:

- Safari;
- VoiceOver;
- iPhone/iPad;
- WebKit.

Do not mark Polish as Apple-certified.

This does not block Windows/Chromium Supported status.

---

# 18. Native-speaker review

Still desirable but non-blocking.

Record:

```text
native-speaker editorial review unavailable / not performed
```

if true.

Do not imply that Narrator testing by a non-Polish speaker substitutes for native-language editorial review.

---

# 19. XLIFF cleanup

Still deferred until Simplified Chinese is complete.

Do not move:

```text
docs/localization/*.xliff
```

to `.local-work` yet.

---

# 20. Selector ordering

Still deferred until Simplified Chinese is complete.

Do not reorder the full locale selector in this parcel.

---

# 21. Simplified Chinese

Do not begin Simplified Chinese onboarding here.

At Polish closure the remaining V1 localization target should be:

```text
Simplified Chinese
```

Do not mark the whole localization program complete.

---

# 22. Durable documentation if closure passes

If all Polish-specific blocking gates pass:

- mark Polish as **Supported** in `docs/localization/LOCALE-ONBOARDING.md`;
- update the Polish Locale Profile with final closure evidence;
- update `docs/BACKLOG.md` only for genuinely new/non-duplicative findings;
- update `docs/ARCHITECTURE.md` only if current runtime/support enumeration becomes stale;
- update remaining-locale wording from two to one if still stale.

The supported Bethesda text/interface target list should then include:

```text
English
French
German
Spanish (Spain)
Japanese
Italian
Polish
Portuguese (Brazil)
```

with:

```text
Simplified Chinese
```

remaining.

`en-GB` remains a sparse tracker override, not a separate Bethesda language target.

---

# 23. Polish Locale Profile final content

If marked Supported, ensure the Polish profile records concisely:

```text
Tracker locale: pl-PL
Bethesda token: pl
Encoding: UTF-8
Selector: Polski (Polska)
Status: Supported
```

and durable final policy/evidence for:

- official terminology/glossary;
- semantic catalogue closure;
- provenance/reference overlay closure;
- fauna provisional acceptance;
- search folding and `ł -> l`;
- English aliases;
- collation;
- browser mapping;
- shortcut speech;
- typography;
- 1366/1600 layout verification;
- actual 200% zoom;
- keyboard-only;
- Narrator outcome/limitations;
- import/export;
- native-speaker review;
- Apple/WebKit deferral;
- known non-blocking layout debt.

Keep this a durable profile, not a chronological diary.

---

# 24. Manual testing handoff policy

Codex should complete everything it can.

At the end, explicitly list **only** the checks that cannot be exercised in the environment.

Do not ask the user to repeat:

- automated checks;
- browser checks Codex successfully completed;
- functional workflows already conclusively verified by Codex.

Likely manual-only gates may include:

```text
true browser-controlled 200% zoom
audible Windows Narrator
```

but list them only if genuinely unavailable.

The user will perform those remaining checks and report results.

---

# 25. Automated verification

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
npm run localization:verify
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any current locale-closure command if available.

Do not weaken tests to achieve closure.

---

# 26. Scope discipline

Allowed changes:

- release-closure tests;
- narrow non-geometry semantic/accessibility corrections if a real Polish-specific defect is found;
- durable documentation/backlog updates;
- generalized test improvements that prevent Polish omission.

Do not:

- change physical geometry;
- redo Polish translations gratuitously;
- alter reference provenance;
- redo fauna evidence;
- change persistence/schema;
- fix unrelated global accessibility debt;
- optimize bundle;
- reorder selector;
- move XLIFFs;
- begin Simplified Chinese.

---

# 27. Completion criteria

Polish may be marked Supported when:

- automated closure passes;
- live semantic sanity passes;
- search passes;
- browser mapping passes;
- switching/persistence passes;
- typography passes;
- keyboard-only passes;
- import/export passes;
- actual 200% browser zoom passes;
- Narrator smoke provides the required localized information, subject to known global limitations;
- no Polish-specific blocker remains.

If a manual gate remains unavailable, keep status pending until the user reports it.

---

# Completion response

Return:

1. branch;
2. files changed;
3. automated closure result;
4. semantic sanity result;
5. 1366 layout result;
6. 1600 layout result;
7. actual 200% zoom result or manual-pending status;
8. keyboard-only result;
9. Narrator result or manual-pending status;
10. export result;
11. valid-import result;
12. invalid-JSON result;
13. import/export announcement result or manual-pending sub-check;
14. Polish exact search result;
15. diacritic-fold search result;
16. `ł -> l` result;
17. English-alias result;
18. search ranking/display result;
19. collation result;
20. browser mapping result;
21. `document.lang` result;
22. switching/persistence result;
23. domain/persistence invariance result;
24. typography/glyph result;
25. plural/count-neutral live result;
26. Solar/Wind layout observation;
27. Resource Matrix header observation;
28. other Polish-specific visual findings;
29. other Polish-specific accessibility findings;
30. known-global issue disposition;
31. HTML raw/gzip;
32. CSS raw/gzip;
33. JS raw/gzip;
34. native-speaker review status;
35. Apple/WebKit status;
36. XLIFF-cleanup status;
37. selector-order status;
38. Polish final support status;
39. remaining V1 locale list;
40. durable documentation changes;
41. backlog changes;
42. full automated verification results;
43. `git diff --check` result;
44. exact manual checks still required from the user, if any;
45. confirmation no geometry changes occurred;
46. deviations from brief;
47. recommended next action;
48. suggested commit message;
49. confirmation no commit/push occurred.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.
