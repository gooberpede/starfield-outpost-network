# CODEX AUDIT BRIEF — Whole-Product Accessibility Audit

## Purpose

Perform a deliberate whole-product accessibility audit of **Starfield Outpost Network**.

This audit follows the completed localization/release-hardening batch. Several accessibility issues were already discovered and corrected during that work. This audit should therefore:

- verify that those corrections remain sound;
- avoid rediscovering already-closed work unless regression evidence exists;
- deliberately inspect areas that have not yet received a systematic accessibility review;
- identify genuine usability/accessibility defects across the whole application;
- classify findings by severity;
- recommend a small number of correction slices;
- separate automated/source findings from manual verification requirements.

Do **not** implement fixes during this audit.

Do **not** commit or push.

Write the audit report to:

```text
docs/audits/codex-whole-product-accessibility-audit.md
```

---

# Scope classification

**High cross-cutting audit.**

This is intentionally broader than the release-hardening audit that accompanied localization.

Expected inspection areas:

- keyboard operability;
- focus order;
- focus visibility;
- accessible names/roles/states/descriptions;
- screen-reader reading order and announcements;
- forms and instructions;
- color/contrast;
- zoom/reflow;
- semantic document structure;
- Resource Matrix accessibility;
- Planned Supply accessibility;
- Cargo Link accessibility;
- Validation accessibility;
- dialogs/destructive actions;
- tooltips/hover dependence;
- transient UI/motion;
- localization/accessibility interaction;
- current automated accessibility coverage;
- manual verification requirements.

Do not modify application code, tests, or documentation during the audit.

---

# Important context — already completed global accessibility work

The localization/release-hardening batch already corrected the following global issues:

- readable muted text separated from disabled/unavailable presentation;
- per-row validation severity restored visibly and programmatically;
- status/live-region infrastructure added;
- failed import announcements deferred until browser focus returns from the native file picker;
- pointer-only drag handles removed from sequential keyboard focus;
- native move-up/down buttons retained as the keyboard reorder mechanism;
- clipped focus rings moved inside controls where required;
- selected/dark Planned Supply states receive a contrasting light focus ring;
- Search Results receives deliberate keyboard focus hand-off after keyboard submission;
- closing Search Results restores focus to Search;
- Inter-System marker has robust noninteractive semantics;
- cargo operational states have accessible descriptions;
- compact `+ Add` controls retain full accessible names;
- Japanese locale font/typography hardening completed;
- current localization count is 331/331 for full supported locales;
- current component accessibility test harness exists.

Treat these as baseline behavior.

Do not reopen them merely because they are accessibility-related. Reopen only if the audit finds an actual regression or incomplete coverage.

---

# Audit objective

Answer:

> Can a user operate and understand the tracker effectively with keyboard-only navigation, screen-reader output, high zoom/magnification, reduced visual cues, and localized UI, without requiring a redesign of the product?

The audit should distinguish:

```text
structural defect
usability weakness
accessibility defect
manual-verification limitation
accepted non-blocking limitation
```

Do not label every deviation from an idealized accessibility pattern as a defect if the current behavior is already clear, operable, and semantically sound.

---

# Audit order

Perform the audit in this order:

1. source/component semantics;
2. keyboard and focus;
3. major control surfaces;
4. contrast/reflow/visual accessibility;
5. screen-reader semantics;
6. localization interaction;
7. automated test coverage;
8. manual verification checklist LAST.

Do not start with manual testing unless needed to resolve a source-level ambiguity.

---

# 1. Keyboard operability and focus order

Audit every essential workflow.

Check:

- every essential interactive control is keyboard reachable;
- no essential workflow is mouse-only;
- no inert element appears in the Tab order;
- Tab order follows visual/task order closely enough to remain usable;
- portalled/floating UI receives deliberate focus treatment where needed;
- focus restoration occurs after closing dialogs, Search Results, overlays, and similar transient surfaces;
- hidden/collapsed controls are not focusable;
- reshuffle/reorder workflows remain fully possible through keyboard controls;
- Enter/Space behavior matches control semantics;
- Escape behavior is predictable and does not conflict across overlays;
- no unintended focus trap exists.

Explicitly inspect:

```text
locale selector
Search
Search Results
network controls
outpost navigation
Add/Remove/Reshuffle
system/body selectors
outpost-name field
biome controls
Resource Matrix
Planned Supply
Cargo Links
Validation
history controls
About/settings
dialogs
import/export/status controls
```

Report any workflow that requires excessive or illogical tabbing even if technically reachable.

---

# 2. Focus visibility

Verify that every interactive control has a clearly visible focus indicator.

Check:

- ordinary/light controls;
- dark/selected controls;
- disabled-adjacent controls;
- controls at container edges;
- first/last cells in dense grids;
- compact icon controls;
- move buttons;
- Search Results;
- dialog controls;
- native selects/inputs;
- validation rows;
- focus rings under zoom.

Look for:

- clipping;
- insufficient contrast;
- selected-state focus disappearing;
- overlap with neighboring borders;
- focus indication conveyed only by subtle color change.

Do not mark existing inset focus treatment defective merely because it differs from the previous external outline; evaluate visibility, not style preference.

---

# 3. Accessible names, roles, states, and descriptions

Audit all interactive and meaningful passive UI elements.

For each relevant control, verify:

- accessible name exists;
- role matches behavior;
- state is programmatically exposed;
- supporting descriptions are associated correctly;
- visible shorthand does not replace semantic meaning.

Inspect use of:

```text
aria-label
aria-labelledby
aria-describedby
aria-pressed
aria-expanded
aria-disabled
aria-selected
role
title
```

Pay special attention to:

```text
+ Add
close controls
move controls
collapse/expand controls
Inter-System marker
Inter-System toggle
stale exports
Search options
validation rows
status feedback
icon/symbol controls
```

Do not treat `title` as an adequate substitute for a programmatic accessible name.

Avoid unnecessary ARIA when native HTML semantics already suffice.

---

# 4. Screen-reader reading order and announcements

Audit logical reading order in the rendered DOM.

Questions:

- Does linear reading order make sense without visual layout?
- Are section headings and controls encountered in a coherent sequence?
- Do context + state + message relationships remain understandable?
- Are decorative glyphs hidden from assistive tech where appropriate?
- Are relevant passive indicators exposed where needed?
- Are live announcements concise and non-duplicative?

Reinspect:

- Search combobox/listbox;
- Search Results;
- Validation rows;
- dialogs;
- import/export feedback;
- Inter-System marker;
- cargo operational state;
- collapsed summaries.

For asynchronous status:

- success should announce once;
- failure should announce once;
- no duplicate live-region speech;
- dismiss button remains independent;
- visible status remains immediate.

---

# 5. Forms, labels, instructions, and errors

Audit every input/select/control that collects or changes user data.

Verify:

- visible or programmatic labels exist;
- placeholders are not the only labels;
- help/instruction text is associated where needed;
- invalid states are announced programmatically;
- error recovery does not depend on color;
- user-authored data remains distinguishable from labels;
- locale switching does not invalidate labels/descriptions.

Inspect:

```text
network naming
outpost naming
system selector
body selector
biome controls
manufacturing selectors
cargo destination selectors
Search
locale selector
import/export controls
```

---

# 6. Color and contrast

Perform a systematic source-level contrast review.

Prioritize:

- body text;
- readable muted text;
- disabled/unavailable text;
- selected controls;
- validation severity text;
- warning/error/info states;
- focus indicators;
- tooltip text;
- status messages;
- link/button text;
- text on dark selected states.

Current design rule:

```text
muted != disabled
```

Do not collapse them into one state.

Readable muted text should satisfy ordinary readable-text contrast on intended surfaces.

Disabled/unavailable presentation may remain more subdued, but state must still be understandable and essential information must remain available.

Check whether any meaning is conveyed by color alone.

Do not claim blanket WCAG conformance unless every relevant rendered combination has actually been measured.

---

# 7. Zoom, reflow, and scaling

Audit behavior at representative zoom/scaling targets.

Source review should identify risk areas; manual checklist should include final observation.

Target:

```text
100%
125%
150%
200% where practical
```

Check:

- text clipping;
- control clipping;
- document-level horizontal overflow;
- local scrollers;
- sticky/fixed content obscuring information;
- focus-ring visibility;
- dialogs remaining reachable;
- Search Results remaining reachable;
- Resource Matrix scrolling;
- Cargo Link layout;
- header wrapping;
- Outpost Details;
- Validation panel;
- tooltips/popovers.

A desktop application may legitimately retain local horizontal scrolling in dense data surfaces.

Distinguish acceptable local scrolling from page-wide overflow that breaks task flow.

---

# 8. Semantic structure

Audit the document structure, not just individual controls.

Inspect:

- heading hierarchy;
- region/landmark semantics;
- lists;
- groups;
- tables/grids;
- dialogs;
- non-modal floating regions;
- status regions;
- section labelling.

Questions:

- Are visual sections represented meaningfully?
- Are repeated row/list structures understandable to assistive technology?
- Are generic `div`/`span` wrappers being used where native structure would materially improve navigation?
- Are roles being added unnecessarily?

Avoid semantic overengineering. Recommend structure changes only where they materially improve navigation or understanding.

---

# 9. Resource Matrix — dedicated audit

The Resource Matrix is the densest and most semantically complex control surface and requires its own review.

Audit:

## Row/column context

Can a screen-reader user determine:

- which outpost/column a control belongs to;
- which resource/product/row a control belongs to;
- what state the cell represents?

## State semantics

Verify state controls expose meaningful distinctions for concepts such as:

```text
Present
Producing
Inputs
Logistics
```

where applicable.

Check that visual state, text state, and programmatic state agree.

## Keyboard traversal

Determine whether keyboard traversal is practical.

Do not assume a true ARIA grid is required.

Compare current interaction with likely alternatives and recommend grid/table semantics only if it would materially improve accessibility without making keyboard behavior worse.

## Read-only/disabled states

Verify unavailable/read-only states are distinguishable programmatically.

## Scrolling

Ensure local horizontal scrolling remains operable with keyboard and zoom.

This section should explicitly conclude whether the current Matrix semantic model is adequate or needs a focused redesign.

---

# 10. Planned Supply — dedicated audit

Audit the three-state catalogue interaction.

Verify users can distinguish:

```text
neutral/selectable
planned/selected
unavailable/informative
```

through more than color alone.

Check:

- `aria-pressed` / `aria-disabled` or equivalent semantics;
- focus contrast;
- keyboard traversal;
- row/section labelling;
- whether unavailable items are misleadingly actionable;
- whether omitted Logistics widgets for non-exported resources remain understandable;
- whether visual row scanning remains efficient after accessibility corrections.

Do not propose making unavailable controls visually dominant merely to increase contrast.

---

# 11. Cargo Links — dedicated audit

Audit both collapsed and expanded states.

Check:

- disclosure semantics;
- summary readability;
- destination selector labels;
- export state;
- stale export descriptions;
- Inter-System toggle state;
- fuelled/unfuelled description;
- Inter-System marker;
- reshuffle mode;
- move controls;
- pointer drag behavior vs keyboard alternatives;
- focus order;
- tooltip dependence;
- collapsed-summary abbreviations.

Determine whether collapsed summaries expose enough information to keyboard/touch/screen-reader users without adding excessive tab stops.

---

# 12. Validation — dedicated audit

Audit:

- severity rail;
- visible severity prefix;
- programmatic severity;
- context association;
- issue message;
- remediation/help text;
- ordering;
- keyboard navigation;
- focus model;
- screen-reader reading order;
- aggregate counts vs individual issue severity.

Verify error/warning/info meaning is never color-only.

---

# 13. Dialogs and destructive actions

Audit:

- initial focus;
- dialog naming;
- description;
- `aria-modal`;
- focus containment;
- Escape behavior;
- focus restoration;
- destructive-action wording;
- button order;
- keyboard activation;
- accidental default action risks.

Check all current dialog types, including destructive/reset/delete flows and About/settings if modal.

Do not assume all dialogs need the same initial-focus target.

---

# 14. Tooltips and hover-dependent information

Identify every case where information is exposed through:

```text
title
hover tooltip
pointer-only affordance
```

For each, classify whether the information is:

```text
supplementary
useful but nonessential
essential
```

Essential information must have a keyboard/touch/screen-reader equivalent.

Do not make every noninteractive tooltip target focusable.

Audit particularly:

- collapsed Cargo summaries;
- Inter-System state tooltips;
- stale export tooltips;
- abbreviated labels;
- passive indicators.

---

# 15. Motion, transient UI, and timing

Audit:

- animation;
- transition;
- auto-dismiss messages;
- floating palettes;
- status messages;
- focus-moving behavior.

Questions:

- Is any essential information available only briefly?
- Can user action unexpectedly move focus?
- Is reduced-motion preference relevant anywhere?
- Does any transition impede task completion?

If the app currently has negligible motion, say so rather than inventing work.

---

# 16. Language and localization interaction

Verify accessibility remains correct across:

```text
en-US
en-GB
ja-JP
```

Check:

- accessible names are localized;
- accessible descriptions are localized;
- no English-only ARIA strings remain in Japanese;
- document `lang` updates correctly;
- Japanese screen-reader order remains coherent;
- locale switching does not change roles/states/focus model;
- Japanese typography does not hide focus or truncate essential labels.

Do not reopen settled Japanese provenance/reference-name work unless an accessibility defect requires it.

---

# 17. High-contrast / forced-colors readiness

Perform a source-level audit for Windows high-contrast / forced-colors behavior.

Check whether:

- selected states remain distinguishable;
- focus indicators remain visible;
- borders/icons survive forced colors;
- color-only distinctions disappear safely;
- custom backgrounds obscure text/control boundaries.

If practical, include Windows forced-colors/high-contrast mode in the final manual checklist.

Do not claim support without observation.

---

# 18. Reduced-motion preference

Inspect whether the app uses meaningful animation/transitions.

If it does, determine whether:

```css
prefers-reduced-motion
```

handling is warranted.

If current motion is trivial/nonessential, record that no correction is required.

Do not add reduced-motion code merely to satisfy a checklist.

---

# 19. Pointer/touch target considerations

Audit control hit areas, especially compact controls.

Check:

- compact Add buttons;
- close buttons;
- move buttons;
- disclosure controls;
- tiny icon buttons;
- Cargo summary actions;
- Validation controls.

Evaluate whether target sizes are practical for pointer/touch use.

Do not treat iPhone/mobile support as in scope.

This is about general target usability, not responsive mobile certification.

---

# 20. Automated/static accessibility coverage

Review the current test regime.

Current context:

- pure/unit tests exist;
- JSDOM/Vitest component harness exists;
- Testing Library is available;
- several accessibility-sensitive component tests were added during Parcel F.

Identify:

- what is already covered;
- what can be cheaply added to component tests;
- what needs a browser-level tool;
- what only manual assistive-tech testing can establish.

Consider whether adding an automated accessibility checker such as `axe-core` / `jest-axe` / equivalent would provide useful value.

Do **not** add dependencies during the audit.

Recommend such tooling only if it materially improves ongoing confidence.

Do not treat automated accessibility scans as proof of accessibility.

---

# 21. Manual test matrix — LAST

After completing all source/component analysis, provide a concise manual checklist.

Do not report items as passed unless actually observed.

Recommended categories:

## Keyboard-only

- full task flow;
- focus order;
- Search;
- Matrix;
- Planned Supply;
- Cargo;
- Validation;
- dialogs;
- reshuffle/reorder;
- import/export.

## Screen reader

Primary available environment:

```text
Windows Narrator + primary Chromium browser
```

Smoke-test:

- Search;
- Search Results;
- locale selector;
- Matrix;
- Planned Supply;
- Cargo;
- Validation;
- dialogs;
- import/export;
- Inter-System semantics.

## Zoom

```text
100%
125%
150%
200% where practical
```

## High contrast / forced colors

If practical on Windows.

## Locales

Representative:

```text
en-US
ja-JP
```

`en-GB` can usually rely on English structural equivalence unless a specific override affects semantics.

## Apple/WebKit

Remain deferred unless a suitable environment becomes available.

Do not block this accessibility batch on unavailable Safari/iPhone testing.

---

# 22. Finding severity

Classify findings as:

```text
BLOCKER
HIGH
MEDIUM
LOW
COSMETIC
```

Use accessibility-specific definitions.

## BLOCKER

Examples:

- core workflow impossible without mouse;
- essential action inaccessible to assistive technology;
- severe focus trap preventing use;
- critical data/state impossible to understand nonvisually.

## HIGH

Examples:

- major common workflow is substantially harder or misleading for keyboard/screen-reader users;
- essential state missing programmatic semantics;
- severe contrast/focus problem across common controls.

## MEDIUM

Examples:

- clear accessibility defect with a viable workaround;
- poor reading order;
- inefficient focus behavior;
- missing supplementary state on a meaningful control.

## LOW

Examples:

- minor semantic inconsistency;
- edge-case tooltip/help discoverability weakness;
- limited structural/navigation improvement.

## COSMETIC

Visual polish without meaningful accessibility impact.

Do not inflate severity merely because a finding maps to a WCAG concept.

---

# 23. Required audit report structure

The report should contain:

## Executive summary

Include:

```text
overall accessibility disposition
finding count by severity
whether any core workflow is inaccessible
whether keyboard-only operation is fundamentally sound
whether screen-reader semantics are fundamentally sound
whether Resource Matrix needs redesign
whether any release-blocking accessibility issue exists
```

## Already-closed baseline checks

Briefly confirm previously corrected Parcel F behavior remains intact.

Do not spend most of the report restating it.

## Findings table

Use:

```text
ID
Area
Issue
Evidence
Recommended change
Severity
```

## Dedicated control-surface conclusions

Include explicit conclusions for:

```text
Resource Matrix
Planned Supply
Cargo Links
Validation
Search
Dialogs
```

## Automated coverage assessment

State:

- current coverage;
- useful missing component tests;
- whether automated axe-style scanning is worth adding;
- what must remain manual.

## Accepted limitations

List non-blocking limitations separately.

## Recommended correction slices

Group findings into the smallest coherent implementation batches.

Avoid one fix per issue if several share the same underlying cause.

## Manual verification checklist

Place this section last.

---

# 24. Audit disposition

End with exactly one of:

## Outcome A — accessibility baseline is sound

No significant correction batch is required; only small polish/manual verification remains.

## Outcome B — targeted corrections required

A bounded accessibility correction batch is recommended.

## Outcome C — substantial accessibility work required

One or more major workflows or control surfaces require deeper redesign before the application can reasonably be considered accessible.

---

# 25. Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

If another existing repository accessibility/static-analysis command exists, run it.

Do not add dependencies during the audit.

---

# 26. Final report requirements

The final report must explicitly state:

1. exact finding count by severity;
2. whether any essential workflow is mouse-only;
3. whether Tab order is generally coherent;
4. whether focus visibility is adequate;
5. whether screen-reader naming/state semantics are adequate;
6. whether live announcements are adequate;
7. whether form labels/instructions are adequate;
8. whether any color-only essential meaning remains;
9. whether any known contrast failures remain;
10. whether zoom/reflow presents significant risk;
11. whether semantic document structure needs material improvement;
12. whether Resource Matrix requires redesign or only targeted fixes;
13. whether Planned Supply requires redesign or only targeted fixes;
14. whether Cargo Links require redesign or only targeted fixes;
15. whether Validation requires redesign or only targeted fixes;
16. whether automated accessibility tooling should be added;
17. accepted limitations;
18. recommended correction slices;
19. final manual verification checklist;
20. overall accessibility disposition.

Do not implement fixes unless separately instructed.
