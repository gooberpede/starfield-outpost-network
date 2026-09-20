# Codex Implementation Brief — French and German Localization QA and Release Closure

## Objective

Perform the final French/German localization quality-assurance and release-closure pass for:

```text
fr-FR
de-DE
```

The purpose is to verify the completed runtime localization under realistic use, identify any remaining localization/accessibility/reflow problems, implement only narrowly scoped **non-geometry** corrections that are clearly safe, and close the durable locale documentation if no blocking issue remains.

This is **not** a visual redesign, layout-refinement, or UI-geometry parcel.

French and German may be marked supported only if the release-closure checks pass and no blocking issue remains.

Do not commit or push unless explicitly instructed.

---

## Critical visual/geometry freeze

This requirement is absolute for this implementation.

Do **not** change the physical geometry or visual design of any part of the application.

Do not change:

- button width, height, padding, or placement;
- panel size, position, gaps, or scrolling geometry;
- text-field/select dimensions;
- column widths;
- grid/flex proportions;
- margins;
- padding;
- gaps;
- min/max widths or heights;
- breakpoints;
- wrapping geometry;
- sticky/fixed positioning;
- scroll-container dimensions;
- typography size/line-height/letter-spacing where it changes layout;
- colors;
- borders;
- shadows;
- visual emphasis;
- icon sizing;
- status-bar geometry;
- dialog dimensions;
- Resource Matrix geometry;
- Navigation geometry;
- Cargo/Planned Supply geometry;
- any previously tuned 1366px workspace sizing.

Previous layout/visual work is considered frozen.

Do not “improve” or “clean up” UI geometry during this task.

If localization exposes a visual/layout issue whose mitigation would require any of the above:

1. **do not implement the physical change**;
2. record the issue clearly;
3. identify the affected locale/surface;
4. describe severity and user impact;
5. propose one or more candidate mitigations;
6. estimate regression risk;
7. leave the decision for explicit later review.

This task should prefer **observation and reporting** over autonomous visual changes.

---

## Allowed corrections

Corrections are permitted only when they do not alter frozen physical geometry or visual styling.

Examples of potentially acceptable changes:

- incorrect translated text;
- untranslated semantic text;
- incorrect glossary usage;
- incorrect accessible name/description;
- incorrect `document.lang`;
- broken locale preference behavior;
- incorrect search/collation/formatting behavior;
- missing or incorrect live-region/announcement text;
- incorrect shortcut accessible speech;
- localization test/documentation corrections;
- source-data/reference-name integration defects;
- semantic/accessibility fixes that do not alter visible geometry.

If there is any doubt whether a change affects layout or appearance, **report it instead of implementing it**.

---

## Naming rule

Planning identifiers used in discussion/audit documents must not leak into repository-facing names.

Do not use names such as:

```text
Parcel 6
Parcel6
P6
Phase 6
```

in:

- source identifiers;
- filenames;
- tests;
- comments;
- docs headings introduced by this work;
- commit messages.

Use descriptive names based on actual responsibility, such as:

```text
localization release closure
French QA
German QA
locale verification
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

Also inspect the completed French/German runtime implementation, semantic catalogues, reference overlays, search/collation integration, shortcut speech, and locale closure tooling.

---

# Locked release-closure decisions

## Layout acceptance standard

Do not attempt to “fix every truncation.”

Classify observed layout/localization presentation findings by actual user impact.

### Blocking

Examples:

- essential information hidden with no usable alternative;
- control unusable or unreachable;
- page-level horizontal overflow that prevents normal operation;
- focused actionable content obscured;
- focus indicator clipped or invisible;
- text overlap preventing comprehension;
- breakpoint behavior that makes a surface unusable.

### Non-blocking but noteworthy

Examples:

- avoidable truncation of useful explanatory text;
- placeholder truncation where field purpose remains obvious;
- compact ellipsis where full value remains accessible elsewhere;
- awkward but usable wrapping.

For every issue requiring a physical/layout change:

- report only;
- do not modify geometry;
- propose mitigation options for later review.

---

## Accessibility closure scope

Use the established Windows/Chromium desktop baseline.

Verify French and German under:

- keyboard navigation;
- visible focus;
- Search interaction/announcements;
- Validation interaction/announcements;
- modal focus containment/restoration;
- accessible names/descriptions;
- status/live-region announcements;
- keyboard-shortcut Help;
- localized shortcut speech;
- `document.lang`;
- 200% browser zoom/reflow;
- Narrator smoke testing.

Do **not** reopen the whole accessibility program.

Apple/WebKit/Safari/VoiceOver/iPhone work remains a separate platform follow-up and is not a French/German release blocker unless new evidence establishes a concrete production defect.

---

## Typography policy

Assume the existing Latin font stack is correct unless testing reveals a real rendering defect.

Verify representative French/German glyphs and uppercase/tracking behavior.

Do not add:

- new font binaries;
- new web fonts;
- `:lang(fr)` or `:lang(de)` styling;
- letter-spacing changes;
- font-size changes;
- line-height changes;

in this task.

If typography creates a visible defect, report it with suggested mitigation only.

---

## Bundle policy

Measure and report the final production bundle after French/German integration.

Do not introduce:

- lazy locale loading;
- dynamic imports;
- code splitting;
- dependency changes;
- chunk-threshold tuning;

merely to remove the Vite advisory.

The dedicated post-localization bundle review remains scheduled after all planned V1 locales are onboarded.

---

## Supported-status policy

French and German may move to:

```text
Supported
```

only if:

- semantic catalogue closure passes;
- terminology closure passes;
- reference-name closure passes;
- runtime selection works;
- browser resolution works;
- search/collation behavior works;
- accessibility smoke checks pass;
- no blocking localized presentation defect remains;
- durable locale profiles are complete;
- known limitations are explicitly documented.

Native-speaker review remains desirable but non-blocking.

---

## XLIFF cleanup

Do not relocate `.xliff` files in this task.

The project has explicitly decided that XLIFF working/handoff files may remain under:

```text
docs/localization/
```

until all planned localization work is finished.

A later cleanup should move them to an ignored `.local-work/localization/...` location and update tooling/docs accordingly.

Record or preserve that future cleanup item, but do not interrupt the current localization sequence to perform it.

---

# Required QA matrix

## 1. Desktop widths

Verify both locales at:

```text
1366 px
1600 px
```

German should receive full coverage first because it is the higher string-length risk.

French should receive the same critical-surface checks plus spot checks across the full app.

Do not alter geometry in response to findings.

---

## 2. Zoom/reflow

Verify at:

```text
200% browser zoom
```

Check at minimum:

- title/header;
- locale selector;
- network controls;
- Navigation;
- Outpost Details;
- Resource Matrix;
- Planned Supply;
- Cargo Links;
- Search and Search Results;
- Validation;
- Help;
- About;
- confirmation dialogs;
- status/live feedback.

Also inspect behavior near existing responsive breakpoints where practical.

Do not modify breakpoints.

---

# Surface-specific review

## 3. Header and global controls

Verify:

- locale labels;
- Help/About labels;
- Character/level/skill labels;
- network actions;
- Undo/Redo;
- Import/Export;
- network navigation.

Report:

- clipping;
- overlap;
- unusable controls;
- misleading truncation.

Do not resize controls.

---

## 4. Navigation

Verify:

- heading;
- count/status;
- Add/Reorder controls;
- long outpost names;
- selected-state readability;
- keyboard focus;
- localized accessible names.

Do not change Navigation dimensions, row heights, margins, or column widths.

---

## 5. Outpost Details

Verify:

- System;
- Body;
- Solar;
- Wind;
- Biomes;
- localized official names;
- help/tooltips;
- focus behavior.

Check French and German official reference names in real controls.

Do not resize selectors/buttons or alter grid geometry.

---

## 6. Resource Matrix

Verify:

- matrix headings;
- Present/Producing/Inputs/Logistics terms;
- section headings;
- product/resource names;
- X-Tech control and tooltip;
- search field;
- action controls;
- keyboard focus;
- internal scoped overflow.

Known observation to assess:

> At 1366px the French/German Search placeholder may truncate.

Determine whether this is:

```text
blocking
non-blocking
```

If a width/layout change would improve it, report the recommendation but **do not implement it**.

Do not change matrix widths, column sizing, gaps, or action-cell geometry.

---

## 7. Planned Supply

Verify:

- section headings;
- resource/product groups;
- add/remove controls;
- tooltips;
- localized reference names;
- focus visibility;
- overflow behavior.

Do not alter group/cell widths.

---

## 8. Cargo Links

Verify:

- summary text;
- destination/source language;
- actions;
- localized resource/product names;
- state text;
- expansion;
- focus behavior;
- accessible descriptions.

Do not alter cargo card/grid geometry.

---

## 9. Search / Search Results

Verify:

- localized placeholder;
- localized result names;
- canonical English aliases;
- unaccented search matches;
- exact localized spelling priority;
- abbreviation search;
- stable-ID deduplication;
- result focus;
- result announcements;
- French accent behavior;
- German umlaut behavior.

Confirm no implicit:

```text
oe <-> œ
ae/oe/ue <-> ä/ö/ü
ss <-> ß
```

aliases were introduced.

Do not widen Search or Search Results solely for localized copy.

---

## 10. Validation

Verify:

- severity labels;
- counts;
- localized messages;
- contextual reference names;
- filters;
- keyboard navigation;
- live/accessible presentation.

Do not resize the Validation panel.

---

## 11. Keyboard Shortcuts Help

Verify:

- all action labels;
- group labels;
- intro/help text;
- both Redo chords;
- French/German spoken chord descriptions;
- focus trap;
- restore focus;
- Escape;
- 200% zoom usability.

If long German labels cause layout pressure, report it.

Do not resize the dialog, change columns, breakpoints, or keycap geometry.

---

## 12. About and confirmations

Verify:

- translated content;
- accessible dialog name/description;
- controls;
- focus trap/restoration;
- 200% zoom;
- long warning/destructive copy.

Report physical-layout issues only.

Do not resize dialogs.

---

## 13. Status/live feedback

Verify:

- Import success/failure;
- Export feedback;
- validation/status summaries;
- live-region announcements;
- complete spoken text even if visual text is truncated;
- French/German grammar and terminology.

Do not change status-bar geometry.

---

# Accessibility verification

## 14. Keyboard

Verify representative full workflows using keyboard only:

- locale switching;
- outpost navigation;
- Search;
- Search Results;
- Validation;
- dialogs;
- Resource Matrix controls;
- Planned Supply;
- Cargo actions;
- Help/About.

Confirm localized content does not create unreachable or invisible focus.

---

## 15. Narrator smoke test

Perform a bounded Windows Narrator smoke test in French and German.

Verify representative:

- locale selector options;
- form labels;
- Search;
- Search Results;
- Validation;
- dialog names;
- Help/shortcut chord speech;
- status/live announcements;
- compact/icon controls.

This is not a full screen-reader certification.

Report pronunciation quirks separately from semantic/accessibility defects.

---

## 16. `document.lang`

Verify exact values:

```text
fr-FR
de-DE
```

under explicit and automatic selection.

Verify switching back to Japanese/English still updates correctly.

---

# Typography verification

## 17. French glyphs

Inspect representative rendering of:

```text
À Â Æ Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü Ÿ
à â æ ç é è ê ë î ï ô œ ù û ü ÿ
```

Check:

- no missing glyphs;
- no accidental per-glyph fallback;
- no obvious width jumps;
- uppercase/tracking remains legible.

Report visual issues; do not change typography here.

---

## 18. German glyphs

Inspect:

```text
Ä Ö Ü ä ö ü ß
```

including uppercase/transformed headings where relevant.

Check:

- no missing glyphs;
- no accidental fallback;
- no pathological transformation;
- no unreadable tracking.

Report visual issues; do not change typography here.

---

# Functional localization regression

## 19. Locale switching

Verify repeated switching among:

```text
en-US
en-GB
ja-JP
fr-FR
de-DE
```

Preserve:

- selected network;
- selected outpost;
- user data;
- history;
- cargo/link state;
- import/export compatibility.

Locale switching remains presentation-only.

---

## 20. Persistence

Verify:

- explicit French preference survives refresh;
- explicit German preference survives refresh;
- Automatic remains functional;
- existing Japanese/English preference remains valid.

---

## 21. Reference names

Spot-check official localized names from multiple populations:

- systems;
- bodies;
- biomes;
- resources;
- products;
- flora/fauna;
- official terms.

Confirm no visible fallback to English for covered entities.

---

# Automated verification

Run the complete localization/runtime suite, including at minimum:

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

Run any targeted locale/accessibility tests added during closure.

---

# Bundle measurement

Record:

- minified production JS size;
- gzip size;
- major locale/reference contributions if current tooling reports them;
- startup behavior observed during smoke testing.

Do not optimize in this task unless there is a concrete severe runtime failure.

The existing Vite warning is not itself a defect.

---

# Defect handling policy

For every finding, classify:

```text
BLOCKING
NON-BLOCKING
INFORMATIONAL
```

For each finding record:

- locale(s);
- surface;
- reproduction;
- user impact;
- whether correction can be made without geometry/style changes;
- recommended mitigation;
- regression risk.

## If correction is non-visual/non-geometry

A narrow fix may be implemented if clearly safe.

## If correction requires visual/physical change

Do not implement.

Report the issue and mitigation recommendation for explicit later approval.

This applies even if the physical change looks small.

---

# Documentation closure

If QA passes without blockers:

Update:

```text
docs/localization/LOCALE-ONBOARDING.md
```

so French and German become:

```text
Supported
```

with complete locale profiles covering:

- semantic catalogue;
- official terminology;
- reference names;
- runtime integration;
- browser mapping;
- search policy;
- collation;
- fauna composition evidence;
- typography verification;
- accessibility smoke results;
- layout findings;
- known limitations;
- manual platforms checked.

Update `ARCHITECTURE.md` / `UX-DESIGN.md` only if the final state establishes a durable rule not already documented.

Do not turn durable docs into a chronological implementation diary.

---

# Native-speaker review

Native-speaker review remains desirable but non-blocking.

Record its absence, if still absent, as a known limitation.

Do not block French/German supported status solely because no native-speaker review was available.

---

# Apple/WebKit

Do not make Safari/VoiceOver/iPhone testing a French/German-specific closure blocker.

Preserve existing deferred Apple/WebKit follow-up.

Do not claim Apple-platform certification.

---

# XLIFF cleanup note

Preserve the future cleanup decision:

> After the planned localization program is complete, relocate working `.xliff` files out of `docs/localization/` into an ignored `.local-work/localization/...` location and update tooling/documentation accordingly.

Do not perform this relocation now.

---

# Expected completion state

If no blocker remains:

- French status: Supported;
- German status: Supported;
- semantic/reference/terminology closure green;
- runtime integration green;
- search/collation green;
- accessibility smoke green;
- no blocking localized presentation issue;
- layout issues requiring physical change documented but not implemented;
- native-speaker review limitation recorded;
- Apple/WebKit still deferred;
- XLIFF cleanup still deferred;
- complete durable locale profiles.

---

# Completion response

Return:

1. branch;
2. files changed;
3. French QA result;
4. German QA result;
5. 1366px findings;
6. 1600px findings;
7. 200% zoom/reflow findings;
8. Search placeholder assessment;
9. Resource Matrix findings;
10. Planned Supply findings;
11. Cargo findings;
12. Validation findings;
13. Help/About/dialog findings;
14. keyboard findings;
15. Narrator findings;
16. typography/glyph findings;
17. localization/reference-name spot checks;
18. persistence/switching result;
19. bundle measurement;
20. all BLOCKING findings;
21. all NON-BLOCKING findings requiring physical/layout changes;
22. proposed mitigations for those findings;
23. non-visual fixes implemented, if any;
24. French supported-status decision;
25. German supported-status decision;
26. documentation updates;
27. native-speaker review limitation;
28. Apple/WebKit deferred status;
29. XLIFF cleanup deferred status;
30. complete verification results;
31. deviations from the brief;
32. recommended next step;
33. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
