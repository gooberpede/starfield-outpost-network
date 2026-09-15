# CODEX CORRECTION BRIEF — Accessibility Reflow and Forced-Colors Fixes

## Purpose

Implement the first post-manual-verification accessibility correction pass.

This pass addresses two confirmed manual failures:

1. **Manufacturing row label overlap under browser zoom/reflow**
2. **Unreadable active Resource Matrix button labels in several Windows high-contrast themes**

These are now the highest-priority remaining accessibility defects.

Do **not** implement screen-reader corrections in this pass.

Do **not** implement backlog items such as new keyboard shortcuts, the Inter-System Helium-3 validator, or the broader 1366px visual review.

Do **not** commit or push.

---

# Source of truth

Use the updated whole-product accessibility audit:

```text
docs/audits/codex-whole-product-accessibility-audit.md
```

The original source-level audit findings remain historical.

A later manual-verification section now records the newly observed failures.

Manual screenshots supplied with this correction show:

- Manufacturing labels overlapping Producing/Input content at 125% and 200% zoom;
- active/lit Matrix buttons losing visible text in several Windows high-contrast modes.

Treat those manual observations as authoritative.

---

# Scope classification

**Medium cross-cutting accessibility correction.**

Expected affected areas:

- `OutpostStatusMatrix.tsx`
- `OutpostStatusMatrix.css`
- related tests
- possibly shared forced-colors rules if the issue is caused by a common state style

Avoid broad redesign.

---

# Finding 1 — Manufacturing label overlap at 125% / 200% zoom

## Observed problem

At true browser zoom:

```text
125%
200%
```

long Manufacturing item names can overlap or completely cover content in the:

```text
Producing
Inputs
```

columns.

Observed examples include product labels such as:

```text
Isocentered Magnet
```

At 200% zoom, the product label can intrude deeply into adjacent cells.

This is a real reflow/accessibility defect.

The previous workspace-level reflow fix is still correct and should remain.

The problem is now **inside the Matrix row geometry**.

---

## Important existing Matrix policy

Preserve the existing stable Matrix column model.

Do not introduce:

- runtime width measurement;
- per-row layout;
- outpost-specific templates;
- JavaScript-resized columns;
- a full responsive redesign.

The existing Matrix compression strategy intentionally uses stable grid/table tracks and local horizontal scrolling.

---

# Required diagnosis before implementation

Identify the exact reason Manufacturing labels overlap adjacent columns at zoom.

Likely possibilities include:

- sticky Item cell width exceeds its actual grid track;
- text is overflowing without clipping;
- sticky cell background/stacking allows label text to paint over neighboring cells;
- Manufacturing rows differ structurally from ordinary resource rows;
- `white-space`, overflow, min-width, or sticky positioning behaves differently under zoom.

Do not guess.

Inspect computed layout at representative zoom/constrained widths and determine:

```text
actual Item track width
actual Manufacturing item-cell width
text overflow behavior
sticky positioning
z-index/background
neighboring cell bounds
```

Report the cause.

---

# Preferred correction principle

The Matrix should remain readable by using:

```text
stable column geometry
+ local horizontal scrolling
+ contained cell content
```

A long item label must not paint over adjacent columns.

Acceptable approaches include:

- clipping overflowing item text within the Item cell;
- `overflow: hidden`;
- `text-overflow: ellipsis` where appropriate;
- ensuring the sticky Item cell has a correct width/max-width matching its track;
- correcting min-width/flex/grid behavior so the cell does not expand beyond the track;
- ensuring sticky background prevents underlying/adjacent visual collision where needed.

Prefer the smallest robust CSS fix.

---

# Product-name visibility requirement

Do not sacrifice discoverability.

If long Manufacturing names are clipped/ellipsized:

- retain the full existing `title` tooltip if already present;
- retain the full accessible name/text for assistive technology;
- do not truncate programmatic names;
- do not shorten canonical/localized display names in data.

The visual cell may truncate; the semantic name must remain complete.

---

# Sticky Item cell requirements

If the Item column remains sticky during local horizontal scrolling:

- preserve sticky behavior;
- preserve row alignment;
- prevent label paint-over;
- preserve focus visibility;
- preserve high-contrast boundaries;
- preserve Japanese text behavior.

Do not remove sticky behavior unless there is no viable alternative.

---

# Reflow verification targets

Test at minimum:

```text
100%
125%
150%
200%
```

using true browser zoom where available.

Also test a representative narrow Matrix container after the workspace stack transition.

Verify:

- no item label overlaps Producing;
- no item label overlaps Inputs;
- no item label paints over Present;
- local horizontal scrolling remains usable;
- sticky Item behavior remains correct;
- Matrix header/data tracks remain aligned;
- Japanese product/resource names do not create a new overlap issue.

---

# Finding 2 — active Matrix labels disappear in Windows high-contrast themes

## Observed problem

In Windows forced-colors/high-contrast modes:

- High Contrast #1: labels remained readable;
- High Contrast #2: active/lit Matrix controls could show no visible text;
- High Contrast Black: same failure;
- High Contrast White: same failure.

The screenshots show active Matrix state buttons retaining a filled/highlighted box while their text effectively disappears.

This means the current forced-colors state treatment is not robust across themes.

---

# Required diagnosis

Inspect the current Matrix forced-colors rules.

Identify whether the problem comes from:

- `color`;
- `background`;
- `forced-color-adjust`;
- inherited authored color;
- Highlight / HighlightText mismatch;
- ButtonText / CanvasText mismatch;
- transparent text/background combination;
- selected/lit pseudo-state selector specificity;
- native high-contrast substitution.

Do not patch by trial and error.

Use computed forced-colors values if the browser environment exposes them.

---

# Required forced-colors behavior

For all Matrix states, visible label text must remain legible.

At minimum verify:

```text
neutral editable
selected/lit editable
disabled/unavailable
read-only lit
read-only dimmed
focused selected/lit
```

Use system colors deliberately.

Preferred pattern for selected/lit controls may be conceptually:

```css
@media (forced-colors: active) {
  .selected-or-lit {
    background: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
}
```

or another equivalent system-color combination.

The exact solution should follow current class/state semantics.

Do not hard-code black/white.

Do not rely on theme-specific color assumptions.

---

# Preserve state distinction

The forced-colors correction must preserve visible distinction between:

```text
lit / selected
unlit / neutral
disabled / unavailable
focused
```

The goal is not merely "text visible."

A user in forced-colors mode should still be able to tell state differences.

Suitable durable cues may include:

- Highlight / HighlightText;
- Canvas / CanvasText;
- ButtonText;
- GrayText;
- thicker borders;
- inset outlines;
- simple non-color structural cues.

Use restraint.

---

# `forced-color-adjust`

Do not use:

```css
forced-color-adjust: none;
```

merely to force authored colors through.

Only use it if there is a strong, documented reason and system-color behavior cannot represent the control correctly.

Prefer allowing Windows forced-colors to do its job while supplying compatible system colors.

---

# Preserve normal-mode appearance

Normal mode must remain visually unchanged.

Do not alter:

- selected dark Matrix styling;
- normal resource/product state colors;
- X-Tech styling/alignment;
- Context Help cleanup;
- Planned Supply normal appearance;
- Cargo normal appearance.

This is a forced-colors-only correction unless the reflow fix requires normal Matrix CSS.

---

# Planned Supply / Cargo regression check

The manual high-contrast failure was observed in the Resource Matrix.

Do not broaden this implementation unnecessarily.

However, because Slice 2 introduced forced-colors handling across:

```text
Resource Matrix
Planned Supply
Cargo
```

perform a quick regression check that the Matrix fix does not weaken the already-authored forced-colors cues elsewhere.

Do not refactor Planned Supply/Cargo unless an actual regression is found.

---

# Automated tests

Add/update focused regression coverage.

## Reflow/content containment

Where practical, assert structural/style intent such as:

- Matrix item cells have an explicit overflow-containment strategy;
- sticky Item cells retain expected class semantics;
- full semantic/`title` names remain intact.

Do not write brittle pixel-perfect JSDOM tests.

If existing browser/runtime test infrastructure can cheaply inspect actual geometry, add a bounded regression for:

```text
long Manufacturing label
-> item cell right edge <= adjacent track boundary
```

at a constrained/zoom-equivalent width.

If no browser harness exists, keep this manual/runtime.

---

## Forced colors

Static/source tests should verify the selected/lit Matrix state receives an explicit forced-colors text/background pairing.

Do not pretend JSDOM proves Windows theme rendering.

Manual Windows high-contrast retest remains required.

---

# Manual verification after implementation

This pass should include only the failed zoom/forced-colors items.

## Zoom/reflow

Test:

```text
100%
125%
150%
200%
```

Verify:

- Manufacturing labels never cover Present/Producing/Inputs;
- labels remain understandable through visible clipping/tooltip/full semantic name if truncated;
- local horizontal scrolling still works;
- no page-wide task-flow overflow regression;
- sticky Item cells behave correctly.

Use both English and one representative Japanese Matrix if practical.

---

## Windows forced colors / high contrast

Retest at least:

```text
High Contrast #1
High Contrast #2
High Contrast Black
High Contrast White
```

Verify Matrix:

- lit active button text visible;
- unlit button text visible;
- state distinction remains visible;
- disabled state distinguishable;
- focus indicator visible;
- borders remain understandable.

Capture screenshots if useful.

Do not re-run the entire manual accessibility checklist yet.

---

# Explicit non-goals

Do **not** implement:

- screen-reader fixes;
- locale-selector Narrator changes;
- Logistics announcement changes;
- Planned Supply duplicate Narrator speech;
- Context Help narration;
- Cargo abbreviation expansion;
- Validation navigation/Narrator changes;
- Outpost Details landmark changes;
- new keyboard shortcuts;
- Inter-System Helium-3 validator;
- 1366px general visual redesign;
- Safari/WebKit;
- touch/touchpad work;
- axe tooling;
- new Matrix keyboard model.

---

# Localization constraints

Do not change user-facing wording unless absolutely required.

If no new strings are needed, leave localization catalogues untouched.

Preserve full localized names in accessibility text and tooltips even if visible Matrix cells truncate.

---

# Verification commands

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

Run any existing browser/runtime accessibility command if available.

---

# Acceptance criteria

Complete when:

1. Manufacturing item labels no longer overlap Present, Producing, or Inputs at 125%, 150%, or 200% browser zoom;
2. long item names remain semantically complete;
3. local Matrix scrolling remains intact;
4. sticky Item-column behavior remains correct;
5. Matrix header/data track alignment remains correct;
6. no Japanese text regression is introduced;
7. lit/selected Matrix button labels are visible in all tested Windows high-contrast themes;
8. neutral/unlit Matrix labels remain visible;
9. disabled/unavailable Matrix states remain distinguishable;
10. focus remains visible in forced colors;
11. state distinction does not rely on hard-coded black/white assumptions;
12. normal-mode Matrix appearance remains unchanged apart from necessary label containment;
13. X-Tech and Context Help cleanup remain untouched;
14. Planned Supply/Cargo forced-colors behavior does not regress;
15. focused tests are added/updated;
16. all standard tests/build/lint/verifiers pass;
17. no screen-reader correction is implemented;
18. no backlog item is implemented;
19. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- root cause of Manufacturing overlap;
- exact containment/reflow fix;
- behavior at 100/125/150/200%;
- whether truncation/ellipsis is used;
- how full item names remain available;
- root cause of forced-colors text disappearance;
- final forced-colors system-color strategy;
- results in High Contrast #1, #2, Black, and White if tested;
- normal-mode regression result;
- Planned Supply/Cargo forced-colors regression check;
- tests added/updated;
- full verification results;
- manual checks performed vs still outstanding;
- confirmation screen-reader items were untouched;
- confirmation backlog items were untouched;
- confirmation no commit or push was performed.
