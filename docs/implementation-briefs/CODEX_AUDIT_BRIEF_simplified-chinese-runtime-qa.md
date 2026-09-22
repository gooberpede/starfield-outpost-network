# Codex Audit Brief — Simplified Chinese Runtime QA and Closure Readiness

## Objective

Run the **standard post-activation Simplified Chinese QA matrix** for `zh-Hans`, record the results durably, and determine whether the locale is ready for final manual 200% zoom + Windows Narrator closure.

This is a **QA/audit parcel**, not an implementation parcel.

Do not change translations, layout, selector order, runtime behavior, search behavior, or accessibility architecture unless a narrowly scoped fix is separately authorized.

Do not commit or push.

---

# Current state

Simplified Chinese has already been activated at runtime.

Completed implementation includes:

- `runtimeAvailable: true`;
- selector label `简体中文`;
- final 414-key semantic catalogue;
- 3,561-entry official Bethesda reference overlay;
- browser mapping for Simplified Chinese tags;
- explicit Traditional Chinese exclusions;
- `document.lang = zh-Hans`;
- locale-scoped CJK system font stack;
- locale-aware collation through the shared runtime path;
- approved Chinese search behavior;
- approved shortcut-speech strings;
- no geometry changes;
- no Apple/WebKit-specific work.

The user has already completed a broad normal-scale smoke test in Simplified Chinese.

That evidence should be treated as already completed manual coverage, not re-litigated.

---

# User-completed normal-scale smoke evidence

The user manually verified:

- locale selector shows `简体中文`;
- Help is translated and shows no unexpected English;
- About is translated except intentional English branding/attribution;
- import/export works and translated status-bar messages appear, including invalid-file cases;
- Delete Network guardrail dialog is translated;
- validation messages are translated;
- Navigation panel works, including reshuffle mode;
- Cargo Links works, including reshuffle mode;
- Resource Matrix works with no new clipping apart from known flora/fauna-name pressure shared by other locales;
- Resource Matrix tooltips show no unexpected English;
- Planned Supply works;
- search and search results work;
- tooltips inspected showed no unexpected English;
- Outpost Details works with no new layout/clipping issues;
- title-bar branding remains intentionally English;
- font/typography changes caused no new clipping/layout issues at normal scale;
- smoke test confirmed no other locales disappeared or regressed.

The user additionally observed that Planned Supply abbreviations may be less useful in Chinese than the full localized name, but this is explicitly **non-blocking** and belongs to later UI/capacity review.

Do not reopen that design decision in this parcel.

---

# QA scope

This parcel should perform and document the same kinds of checks used for previous locale closure:

- semantic runtime coverage;
- reference overlay runtime coverage;
- browser-locale routing;
- live locale switching;
- document language;
- import/export announcements;
- validation/status announcements;
- dialogs;
- navigation;
- Cargo Links;
- Resource Matrix;
- Planned Supply;
- search;
- keyboard-accessible controls;
- shortcut help;
- accessible names/descriptions;
- live regions;
- focus order/wiring;
- cross-locale regressions;
- automated layout/overflow checks where supported;
- build/lint/test integrity.

The parcel should **not** claim that real Narrator or true browser 200% interaction has passed unless the user reports it.

---

# 1. No translation changes

Do not change:

```text
src/localization/locales/zh-Hans.ts
src/localization/generated/zh-Hans-reference-names.ts
docs/localization/zh-Hans-review.csv
Simplified Chinese glossary/terminology files
fauna evidence
reference overlay content
```

unless a corruption or unintended regression is discovered.

If a translation issue is found, report it separately.

Do not fix copy in this QA parcel.

---

# 2. No layout/geometry changes

Do not alter:

- control dimensions;
- panel dimensions;
- grid/flex proportions;
- margins/padding/gaps;
- breakpoints;
- wrapping geometry;
- sticky/fixed positioning;
- scroll geometry;
- typography metrics;
- dialog dimensions;
- header/status-bar dimensions;
- Resource Matrix geometry;
- Navigation geometry;
- Cargo geometry;
- Planned Supply geometry;
- tuned 1366 layout;
- icon sizing;
- colors/borders/shadows.

If Chinese exposes clipping/pressure, classify and report it.

Do not fix geometry in this parcel.

---

# 3. No final selector-order cleanup

Do not globally reorder languages.

The current selector placement for `简体中文` is accepted for this QA stage.

Final selector ordering belongs to the post-localization cleanup parcel.

---

# 4. Narrator boundary

Codex may verify:

- ARIA labels/roles;
- accessible names;
- descriptions;
- live-region wiring;
- focusability;
- keyboard sequence;
- focus restoration where testable;
- shortcut-help localized text;
- translated announcement strings.

Codex must **not** claim that Windows Narrator actually spoke or behaved correctly unless the user manually confirms it.

Actual Narrator interaction remains manual.

Known global Narrator/shortcut debt includes:

- some shortcut chords may not be announced;
- `Ctrl+Alt+ArrowUp` / `Ctrl+Alt+ArrowDown` can be intercepted with “Not on table”;
- `/` Search may be unavailable while Narrator is active;
- compact Cargo/Matrix accessible-context follow-up remains shared debt.

Do not misclassify those as Chinese-specific regressions unless Chinese behaves worse than other locales.

---

# 5. 200% zoom boundary

Codex may run:

- automated viewport tests;
- DOM overflow checks;
- Playwright/component layout checks;
- simulated 200%-equivalent viewport checks if the current harness supports them.

However:

```text
automated/simulated zoom != user-performed true browser 200% zoom
```

The locale is not fully manually closed until the user performs the actual 200% browser test.

Do not claim otherwise.

---

# 6. Known global defects to classify correctly

If encountered, classify these as existing cross-locale debt unless new Chinese-specific evidence appears:

- intermittent missing visible focus border after Resource Matrix shortcuts;
- focused/programmatic controls hidden under fixed header/status bar, especially at high zoom;
- Cargo Link Undo collapsing unrelated expanded Cargo Links;
- unexpected Narrator announcement of Solar control when focus is ambiguous;
- Narrator shortcut interception;
- localized search placeholder pressure;
- Solar/Wind control-capacity pressure;
- Resource Matrix header spacing pressure.

Do not fix them here.

---

# 7. Automated locale runtime checks

Verify at minimum:

## Locale availability

- `zh-Hans` remains runtime available;
- selector exposes `简体中文`;
- existing supported locales remain present.

## Browser mapping

Positive:

```text
zh
zh-Hans
zh-Hans-CN
zh-Hans-SG
zh-CN
zh-SG
zh-Hans-TW
```

Negative/continue-later-preference:

```text
zh-Hant
zh-Hant-CN
zh-TW
zh-HK
zh-MO
```

Explicit script must continue to outrank region.

## Document language

- Chinese active → `document.documentElement.lang === 'zh-Hans'`;
- switching away restores the selected locale's correct lang tag.

---

# 8. Semantic catalogue coverage

Verify:

```text
414/414 keys
exact placeholder parity
no fallback to English for normal localized UI paths
no accidental-English regression
```

Intentional English branding/attribution remains allowed according to the approved catalogue.

Do not treat those intentional values as failures.

---

# 9. Reference overlay runtime coverage

Verify:

```text
3,561/3,561 official localized reference names
0 unresolved
```

Exercise representative runtime lookups across:

- systems;
- bodies;
- biomes;
- species;
- resources;
- products;
- official terms.

Confirm official mixed-script/punctuation values still render literally.

---

# 10. Search QA

Verify representative Simplified Chinese runtime search for:

- exact localized-name match;
- prefix match;
- substring match;
- English alias lookup;
- abbreviation lookup;
- deterministic ranking;
- no accidental pinyin support;
- no Simplified/Traditional conversion;
- no unexpected punctuation/space normalization expansion.

Search should return localized Chinese result labels when Chinese is active.

---

# 11. Navigation and major panels

Exercise code-level/runtime checks for:

- Navigation;
- Navigation reshuffle;
- Outpost Details;
- Cargo Links;
- Cargo reshuffle;
- Resource Matrix;
- Planned Supply;
- Validation panel;
- Search results.

Verify localized labels and accessible text exist.

Do not duplicate the user's already-completed manual smoke pass unless automated coverage adds something useful.

---

# 12. Dialog QA

Verify localized content/wiring for at least:

- About;
- Help;
- Delete Network guardrail dialog;
- any generic confirmation/error dialog path covered by existing tests.

Expected intentional English in About:

```text
Starfield Outpost Network
Cosmos icons created by gravisio - Flaticon
```

Do not flag approved branding/attribution as accidental English.

---

# 13. Import/export QA

Exercise:

- successful export;
- successful import;
- invalid import;
- representative guardrail/import failure statuses;
- translated status/live-region messages;
- no persisted-ID localization;
- no schema mutation due to active locale.

Confirm import/export remains presentation-independent.

---

# 14. Validation/status QA

Verify Chinese localized messages for representative:

- error;
- warning;
- info;
- planned-supply unresolved;
- cargo/export validation;
- organic/inorganic production validation;
- storage/reference fatal messages where testable.

Check placeholder substitution.

No raw English should leak through except approved invariants/branding.

---

# 15. Shortcut-help QA

Verify the Chinese shortcut help text and speech strings use:

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

as appropriate.

Exercise keyboard shortcuts at the test/runtime level where safe.

Do not infer actual Narrator spoken output from string correctness.

---

# 16. Accessibility wiring QA

Use existing automated/component/browser tests to verify:

- no missing accessible name on Chinese controls introduced by activation;
- localized `aria-label` / `aria-describedby` values where expected;
- dialogs have accessible names;
- live regions receive localized Chinese strings;
- keyboard focus reaches the same control population as existing locales;
- locale switching does not leave stale English accessible names;
- shortcut help remains keyboard reachable.

Report any gap without broad remediation.

---

# 17. Automated layout/overflow QA

Where the harness permits, inspect:

- 1366 desktop baseline;
- constrained-width/high-zoom-equivalent viewport;
- page-level horizontal/vertical overflow;
- dialog overflow;
- fixed header/status overlap;
- major panel clipping;
- selector overflow;
- Resource Matrix header pressure;
- Solar/Wind controls;
- Planned Supply;
- search results.

Classify findings as:

```text
Chinese-specific blocker
shared cross-locale debt
cosmetic/non-blocking
```

Do not adjust geometry.

---

# 18. Cross-locale regression QA

Verify that activating Chinese has not broken:

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

At minimum confirm:

- registry/selector presence;
- locale switching;
- document lang;
- search/runtime loading;
- no missing reference overlays;
- no changed semantic catalogues from this QA parcel.

---

# 19. Durable QA record

Create/update a durable Simplified Chinese QA record under the existing audit documentation convention.

Preferred:

```text
docs/audits/SIMPLIFIED-CHINESE-LOCALE-QA.md
```

Use a different existing naming convention only if clearly established.

The record should include:

- locale identity;
- runtime activation state;
- semantic/reference counts;
- automated test results;
- browser mapping coverage;
- search coverage;
- accessibility wiring results;
- import/export results;
- validation/status results;
- automated layout/overflow observations;
- cross-locale regression result;
- summary of the user's already-completed normal-scale smoke test;
- known shared/global debt encountered;
- explicit manual pending section for:
  - true browser 200% zoom;
  - Windows Narrator;
  - keyboard interaction under Narrator;
  - manual live announcements;
- closure status.

Do not claim manual QA passed before user confirmation.

---

# 20. Closure status wording

Before user manual 200% + Narrator QA, use wording equivalent to:

```text
Automated/runtime QA passed.
Normal-scale manual smoke test passed.
Manual true-200%-zoom and Windows Narrator closure remains pending.
```

Do not mark the locale fully closed/supported if the established process requires that manual gate.

After the user later confirms manual QA, the durable record can be updated in a separate tiny closure step.

---

# 21. Tests and validation commands

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

Also run:

- focused `zh-Hans` runtime tests;
- browser-language mapping tests;
- search tests;
- shortcut/accessibility tests;
- any existing locale QA/layout tests used for prior locales.

If a dedicated 1366/layout/accessibility test command exists, run it.

---

# 22. No manual-result fabrication

Do not claim:

```text
Narrator passed
200% zoom passed
keyboard under Narrator passed
spoken announcement passed
```

unless those results were explicitly supplied by the user.

Codex may report those areas as:

```text
manual pending
```

---

# 23. Stop conditions

Stop and report rather than improvising if:

- automated runtime QA shows English leakage beyond approved branding/invariants;
- Chinese reference coverage becomes incomplete;
- another locale disappears/regresses;
- browser mapping violates the agreed Hans/Hant policy;
- automated layout tests find a Chinese-specific blocker;
- accessible names are missing only under Chinese;
- locale switching leaves stale English labels/accessibility strings;
- fixing an issue would require geometry changes;
- fixing an issue would require translation changes;
- a broad accessibility refactor seems necessary.

Do not silently broaden scope.

---

# 24. Out of scope

Do not perform:

```text
translation edits
reference translation edits
fauna changes
selector reordering
Planned Supply abbreviation redesign
layout fixes
font-stack redesign
Apple/WebKit work
Narrator global shortcut fixes
focus-border fixes
Cargo Undo fixes
fixed-header/high-zoom focus fixes
global XLIFF cleanup
bundle optimization
public-launch work
HSTS review
noindex removal
```

---

# Completion criteria

This audit parcel is complete when:

- automated/runtime QA passes or clearly reports blockers;
- user normal-scale smoke evidence is recorded;
- Chinese semantic/reference coverage remains complete;
- browser mapping remains correct;
- search remains within approved behavior;
- accessibility wiring is verified;
- import/export/validation statuses are localized;
- automated layout checks are classified;
- existing locales remain stable;
- durable QA record is created/updated;
- manual true 200% + Narrator closure is explicitly left pending.

---

# Completion response

Return:

1. branch;
2. files changed/created;
3. durable QA record path;
4. semantic key-count result;
5. reference overlay-count result;
6. browser mapping results;
7. document-lang results;
8. locale switching results;
9. search QA results;
10. Navigation QA result;
11. Outpost Details QA result;
12. Cargo Links QA result;
13. Resource Matrix QA result;
14. Planned Supply QA result;
15. dialog QA result;
16. import/export QA result;
17. validation/status QA result;
18. shortcut-help QA result;
19. accessibility-wiring QA result;
20. automated layout/overflow QA result;
21. 1366 baseline result if tested;
22. simulated/high-zoom-equivalent result if tested;
23. cross-locale regression result;
24. known shared/global issues observed;
25. Chinese-specific blockers, if any;
26. user normal-scale smoke evidence recorded;
27. explicit manual true-200%-zoom status;
28. explicit Windows Narrator status;
29. explicit keyboard-under-Narrator status;
30. focused `zh-Hans` test results;
31. browser-mapping test results;
32. search test results;
33. accessibility/shortcut test results;
34. `npm test` result;
35. `npm run test:components` result;
36. `npm run typecheck:tests` result;
37. `npm run localization:terminology:verify` result;
38. `npm run localization:provenance:test` result;
39. `npm run localization:provenance:verify` result;
40. `npm run localization:reference-names:verify -- --locale zh-Hans` result;
41. `npm run reference:test` result;
42. `npm run build` result;
43. `npm run lint` result;
44. `git diff --check` result;
45. confirmation no translation changes were made;
46. confirmation no geometry/layout changes were made;
47. confirmation no selector-order cleanup occurred;
48. confirmation no Apple/WebKit-specific work occurred;
49. closure/readiness status;
50. deviations from brief;
51. unresolved user decisions;
52. recommended manual next step;
53. suggested commit message;
54. confirmation no commit/push occurred.

Suggested commit message:

```text
test: add Simplified Chinese locale QA
```
