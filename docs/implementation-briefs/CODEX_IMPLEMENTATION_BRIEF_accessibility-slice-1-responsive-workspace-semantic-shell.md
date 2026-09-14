# CODEX IMPLEMENTATION BRIEF — Accessibility Slice 1: Responsive Workspace and Semantic Shell

## Purpose

Implement the first accessibility correction slice from the completed whole-product accessibility audit.

This slice covers:

- **A11Y-01 — Zoom/reflow failure in the selected-outpost workspace**
- **A11Y-03 — Landmark, heading, and Resource Matrix structural semantics**

Do **not** implement any other accessibility findings in this pass.

Do **not** commit or push.

This is a **medium/high cross-cutting implementation** because it touches the application shell, workspace layout, Matrix structure, and browser-level reflow behavior, but it should remain bounded to the issues below.

---

# Source audit

The authoritative audit report is:

```text
docs/audits/codex-whole-product-accessibility-audit.md
```

Relevant conclusions:

- no accessibility redesign is required;
- the Resource Matrix interaction model remains directionally sound;
- the HIGH issue is reflow at constrained widths representative of 200% zoom;
- semantic-shell corrections should be targeted, not architectural reinvention.

---

# Part 1 — Preserve a usable workspace at constrained widths

## Current defect

The selected-outpost workspace currently uses a two-column layout where Cargo retains a minimum width while the central Matrix/Planned Supply column is allowed to collapse.

Observed audit behavior:

```text
1003 CSS px -> normal working layout
768 CSS px  -> Matrix ~113 px wide
683 CSS px  -> Matrix ~28 px wide + page-wide horizontal overflow
640 CSS px  -> Matrix 0 px wide
```

The current grid effectively allows Cargo to consume the available track before the Matrix can remain usable.

This makes a core editing workflow effectively inaccessible at constrained widths representative of high browser zoom.

---

## Required behavior

Introduce a deliberate constrained-width layout transition **before** the Resource Matrix becomes unusable.

Preferred product behavior:

```text
normal width:
[ central editing column ] [ Cargo ]

constrained width:
[ central editing column ]
[ Cargo ]
```

In other words, stack Cargo below the central column when necessary rather than allowing the Matrix to collapse.

The exact breakpoint should be determined from the existing layout and measured behavior, not chosen arbitrarily from the audit's sampled viewport numbers.

### Requirements

At the constrained-width mode:

- Resource Matrix retains a practical viewport width;
- Planned Supply remains usable;
- Cargo remains fully reachable below;
- Matrix/Planned Supply may retain their own local horizontal scrolling;
- Cargo may retain its own internal layout constraints;
- document-level horizontal overflow should not become the normal task-flow mechanism;
- the user should not need to horizontally scroll the entire page to move between Matrix and Cargo;
- sticky/fixed UI must not obscure the stacked surfaces;
- no locale-specific breakpoint;
- preserve current desktop layout at ordinary widths.

Do not redesign the visual language.

Do not introduce resizable panes.

Do not add manual layout persistence.

Do not remove legitimate local scrollers from dense surfaces.

---

# Part 2 — One coherent main landmark

## Current defect

The app currently exposes:

```text
outer <main>
  ...
  nested <main> inside WorkspaceLayout
```

A page should expose one coherent primary main landmark.

---

## Required correction

Use exactly one primary `<main>` landmark for the application content.

The complete selected-outpost workspace should live inside that main landmark.

Other major areas should use appropriate non-main structure, for example:

- `nav` where the UI is genuinely navigation;
- labelled `section`/`region` where useful;
- ordinary structural wrappers where landmarks would add noise.

Do not add landmarks mechanically to every panel.

The result should improve landmark navigation without producing landmark spam.

---

# Part 3 — Separate heading names from adjacent actions

## Current defect

Some visual heading strips place buttons inside heading elements.

This causes computed heading names to include action text such as:

```text
expand Planned Supply / Planned Supply / help
```

The visual strip is reasonable; the semantic ownership is not.

---

## Required correction

Preserve the current visual header-strip layout, but change markup so that:

```text
heading text
```

and:

```text
action controls
```

are semantic siblings rather than controls being descendants of the heading.

Example conceptual structure:

```html
<div class="panel-heading-strip">
  <h2>Planned Supply</h2>
  <div class="panel-heading-actions">
    ...
  </div>
</div>
```

Exact element levels/classes should follow the existing hierarchy.

### Requirements

- heading accessible name should contain the section title only;
- action buttons retain their own localized accessible names;
- visual layout should remain essentially unchanged;
- heading hierarchy should remain logical;
- do not introduce hidden duplicate headings merely to satisfy semantics.

Audit all affected heading strips in the application shell, not only Planned Supply, but change only instances with the same structural defect.

---

# Part 4 — Regularize Resource Matrix table ownership

## Current defect

The Resource Matrix uses table semantics, but labelled `section` elements currently sit directly between the `role="table"` container and the row structures.

The audit specifically recommended valid table ownership/row-group semantics rather than a full ARIA-grid redesign.

---

## Required correction

Keep the current **table + native buttons** model.

Do **not** convert the Resource Matrix to a full ARIA grid.

Regularize the semantic structure so row/column ownership is valid and understandable.

Preferred direction:

- retain the outer table semantic;
- represent grouped row sections with valid row-group semantics where appropriate;
- keep column headers and row labels associated with the correct cells;
- retain existing localized accessible names/states on interactive Matrix controls;
- preserve local horizontal scrolling.

If the existing structure can use native table elements cleanly without destabilizing layout, that is acceptable.

If ARIA table roles remain preferable, ensure ownership relationships are valid.

Do not add a custom roving-grid keyboard model.

---

# Part 5 — Browser/reflow regression coverage

The audit identified this defect through runtime viewport checks. JSDOM alone is not sufficient.

Add the smallest practical browser-level regression coverage using the repository's existing tooling if such a browser harness already exists.

If no browser-level harness exists:

- do **not** introduce a large new testing framework solely for this slice without strong justification;
- add the strongest feasible structural/layout regression tests in the current test stack;
- document the remaining manual zoom/reflow requirement in the final report.

If adding lightweight browser-level coverage is low-cost and already consistent with repository tooling, cover at least:

```text
ordinary desktop width
constrained width before previous Matrix collapse
narrower constrained width
```

Assert meaningful outcomes such as:

- workspace switches to stacked layout;
- Matrix has nonzero/practical width;
- Cargo remains visible/reachable;
- document does not rely on large page-wide horizontal overflow.

Avoid brittle pixel-perfect assertions.

---

# Part 6 — Component/static regression coverage

Add focused tests for the semantic-shell corrections.

At minimum, where practical:

- exactly one `main` landmark;
- heading names exclude adjacent action-button labels;
- Resource Matrix retains coherent table/row/row-group semantics;
- no regression to existing localized accessible names/states.

Do not add an axe dependency in this slice.

Automated axe-style scanning belongs to the later regression-tooling slice.

---

# Explicit non-goals

Do **not** address in this implementation:

- Matrix passive status-chip Tab stops;
- forced-colors/high-contrast cues;
- compact pointer/touch target sizes;
- numeric character-form validation;
- collapsed Cargo semantic summaries;
- Validation trigger/panel relationship;
- Search submit behavior;
- new screen-reader tooling;
- axe-core/jest-axe;
- Safari/WebKit;
- mobile support;
- pane resizing;
- layout persistence;
- localization architecture;
- canonical reference data;
- persistence/import/export/history schema.

Do not opportunistically fix unrelated layout or style issues.

---

# Localization constraints

All new user-facing text, if any is genuinely required, must use the localization layer.

Prefer no new text if the semantic/layout corrections can be made without it.

Do not alter stable IDs, canonical reference identities, or persisted data.

Locale switching must remain presentation-only.

---

# Design constraints

Preserve the existing tracker design language:

- dense desktop institutional/technical UI;
- pale flat surfaces;
- restrained borders;
- no generic card redesign;
- no glow/shadow treatment;
- no unnecessary visual chrome;
- compact controls remain compact;
- adapt before overflowing.

Important principle:

> A border must have a job. A box must have a better one.

The accessibility correction should feel like the same product at narrower widths, not a different responsive redesign.

---

# Manual verification required after implementation

Do not mark these as passed unless actually observed manually.

## Reflow / zoom

Test true browser zoom if practical:

```text
100%
125%
150%
200%
```

Prefer at least one common desktop display width around 1366 px and, if practical, a wider desktop width.

Verify:

- ordinary desktop layout unchanged;
- constrained mode activates before the Matrix becomes unusable;
- Matrix remains usable;
- Planned Supply remains usable;
- Cargo stacks below and remains reachable;
- no page-wide horizontal task-flow scrolling;
- local Matrix/Planned Supply horizontal scrolling remains operable;
- focus indicators remain visible at scroller edges;
- no sticky header/footer obstruction.

## Keyboard

Verify:

- Tab order remains coherent after stacking;
- keyboard can still reach Matrix, Planned Supply, then Cargo;
- local horizontal scrolling remains keyboard-operable;
- no hidden/collapsed element becomes focusable accidentally.

## Screen reader / semantic smoke test

With Narrator if available:

- only one main landmark;
- heading navigation announces section titles without embedded action labels;
- Matrix table/row/column context remains coherent;
- interactive Matrix controls retain localized names and states.

Do not expand this into the full accessibility manual checklist yet.

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

Run any existing browser/e2e command used by the repository if relevant.

---

# Acceptance criteria

This slice is complete when:

1. Cargo stacks below the central editing column before the Resource Matrix collapses to an unusable width;
2. the Matrix retains a practical usable viewport in constrained-width mode;
3. Planned Supply remains usable;
4. Cargo remains reachable and usable;
5. page-wide horizontal overflow is no longer the normal solution for this constrained layout;
6. legitimate local Matrix/Planned Supply scrolling is preserved;
7. ordinary desktop layout is not materially regressed;
8. the application exposes one coherent `main` landmark;
9. affected heading accessible names contain section titles only, not adjacent action labels;
10. Resource Matrix table ownership/row-group semantics are structurally valid;
11. Matrix interactive names/states remain intact;
12. no ARIA-grid keyboard redesign is introduced;
13. focused regression tests are added;
14. all standard verification commands pass;
15. no unrelated accessibility findings are implemented;
16. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- chosen constrained-width breakpoint and why;
- workspace behavior before/after the breakpoint;
- whether any page-wide overflow remains and under what conditions;
- final main-landmark structure;
- heading/action markup changes;
- Resource Matrix semantic structure after correction;
- tests added/updated;
- browser/runtime checks performed;
- full verification results;
- manual checks performed vs still outstanding;
- confirmation that no unrelated accessibility findings were implemented.
