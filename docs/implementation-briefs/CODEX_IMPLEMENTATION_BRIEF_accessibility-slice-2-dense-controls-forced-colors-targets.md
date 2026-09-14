# CODEX IMPLEMENTATION BRIEF — Accessibility Slice 2: Dense Controls, Forced Colors, and Target Size

## Purpose

Implement the second accessibility correction slice from the completed whole-product accessibility audit.

This slice covers:

- **A11Y-02 — Resource Matrix passive status chips create excessive sequential Tab stops**
- **A11Y-05 — Selected/stale dense-control states are too dependent on authored color/fill**
- **A11Y-07 — Several frequent compact controls have undersized interactive targets**

The Resource Matrix is the main focus, but this slice also includes targeted Planned Supply, Cargo, Search, Context Help, and X-Tech control adjustments where required by the audit.

Do **not** implement Slice 3 findings.

Do **not** commit or push.

---

# Source audit

The authoritative audit report is:

```text
docs/audits/codex-whole-product-accessibility-audit.md
```

Slice 1 has already been implemented, manually sanity-checked in the browser, committed, and synced.

Assume its responsive workspace and semantic-shell changes are now baseline.

Do not disturb:

- the `39rem` workspace stacking behavior;
- the single-main landmark structure;
- heading/action sibling markup;
- the corrected Resource Matrix row-group/table ownership;
- existing Matrix local horizontal scrolling.

---

# Scope classification

**Medium cross-cutting implementation.**

The work spans several dense-control surfaces, but the changes should remain small and behaviorally focused.

This is **not** a Resource Matrix redesign.

It is specifically about:

1. removing inert Matrix controls from sequential keyboard traversal while retaining their readable semantics;
2. ensuring important selected/stale states survive Windows forced-colors/high-contrast rendering;
3. increasing the practical hit area of a small set of frequent compact controls without making the UI visually bulky.

---

# Part 1 — Resource Matrix passive status chips must leave sequential Tab order

## Current defect

Read-only Matrix states currently use generic focusable spans such as:

```text
Inputs
Producing
Import
Logistics
```

These passive states receive:

```text
tabIndex={0}
```

even though they perform no action.

In the audit's sampled network, 10 such passive states contributed to 53 sequentially focusable elements.

In a dense network this can create many inert keyboard stops.

The problem is **keyboard efficiency**, not missing text.

---

## Required interaction model

Keep actual Matrix controls in sequential keyboard order.

Examples of genuinely interactive controls should remain keyboard reachable as they are now.

Passive read-only state displays should **not** each require a Tab stop.

Preferred direction:

```text
interactive Matrix control
    -> normal keyboard focus

passive Matrix status
    -> readable through table/cell semantics and screen-reader browse/reading mode
    -> not in normal sequential Tab order
```

### Requirements

For read-only Matrix state displays:

- remove `tabIndex={0}`;
- do not replace it with another per-chip sequential focus mechanism;
- retain visible text/state;
- retain sufficient programmatic text for assistive technology;
- retain any state-specific explanation that is genuinely needed;
- do not make passive spans fake buttons;
- do not add `aria-disabled` merely to justify focus;
- do not create a custom Matrix cursor;
- do not introduce a full ARIA-grid/roving-grid keyboard model.

If essential explanation currently exists only through `title` on the focusable status chip, move/associate that information in a way that remains available without requiring the chip to be in sequential Tab order.

Possible approaches include:

- cell text that is already self-explanatory;
- associated visually hidden descriptive text;
- a cell-level `aria-describedby`;
- row/cell accessible naming.

Choose the smallest structure that preserves meaning.

---

# Part 2 — Verify Matrix reading semantics after focus cleanup

After removing passive Tab stops, verify that a screen-reader user can still determine:

```text
resource/product identity
outpost/column context
state value
state-specific explanation where needed
```

Do not duplicate every visible Matrix word in multiple ARIA strings merely to make the accessibility tree verbose.

Prefer the table's existing row/column context plus concise state text.

The corrected Slice 1 table/row-group structure should be reused, not replaced.

---

# Part 3 — Forced-colors/high-contrast resilience

## Current problem

Programmatic state is generally good, but several visible state distinctions depend strongly on authored:

```text
background color
border color
opacity
fill
```

These may flatten or disappear in Windows forced-colors/high-contrast mode.

The audit specifically identified:

- selected Matrix controls;
- selected/planned Planned Supply controls;
- selected/export state in Cargo;
- stale Cargo exports.

ARIA/programmatic state already exists in many of these cases.

This correction is about preserving a **visible non-color distinction**.

---

## Required approach

Add restrained forced-colors handling using:

```css
@media (forced-colors: active)
```

where it materially improves state recognition.

Prefer system colors such as:

```text
Canvas
CanvasText
ButtonText
Highlight
HighlightText
GrayText
```

or other appropriate forced-color-safe mechanisms.

### Selected / planned states

Ensure selected/planned/active dense controls remain visibly distinct from neutral controls when custom background colors are removed.

Possible durable cues:

- thicker/system-color border;
- inset outline;
- simple structural marker;
- selected-state text/symbol already present, if sufficient.

Do not add decorative complexity to normal mode solely for high contrast.

### Stale Cargo exports

Stale state must remain visibly distinguishable if warning color and opacity are flattened.

Prefer a durable cue such as:

- explicit stale text/marker if already semantically appropriate;
- border pattern/shape;
- forced-colors-specific outline;
- another restrained structural cue.

Do not rely on opacity alone.

Do not make stale controls look disabled if they are still actionable.

---

# Part 4 — Preserve normal-mode visual hierarchy

Forced-colors support must not flatten the existing product hierarchy in ordinary mode.

In particular:

- Planned Supply unavailable items may remain visually receded;
- active/planned items should continue to jump out;
- readable muted text must remain distinct from disabled/unavailable text;
- selected-state focus indicators must remain visible;
- Cargo stale state should remain legible without becoming visually dominant.

The existing visual design is not being replaced.

The aim is:

```text
normal mode -> current visual hierarchy retained
forced colors -> state meaning survives
```

---

# Part 5 — Compact target-size corrections

The audit identified several controls whose interactive box is smaller than a practical ~24×24 CSS-pixel target at the responsive 16 px root size.

Examples observed:

```text
Context Help       ~16×16
Search submit      ~23×20
X-Tech Add         ~51×18
Planned Supply disclosure ~22×22
Cargo disclosure   ~23×23
```

This is a LOW-severity usability/accessibility issue.

Increase practical interactive hit areas while preserving the dense desktop appearance.

---

# Part 6 — X-Tech Add should follow the Manufactured Products `[edit]` control

This is a specific product-design correction requested by the user.

The existing:

```text
[+ X-Tech]
```

control has previously been adjusted in isolation.

Do not continue treating it as a bespoke compact button.

Use the existing **Manufactured Products `[edit]` control as the visual/sizing precedent**.

The X-Tech control should follow that established pattern in:

- visual treatment;
- control height;
- padding;
- bracketed compact-button language where applicable;
- focus treatment;
- target-size strategy.

The exact visible wording may remain appropriate to the action; this requirement is about **control pattern**, not necessarily changing the localized text to `edit`.

### Important

Inspect the current Manufactured Products `[edit]` implementation and reuse its existing class/pattern if practical.

Do not create a near-duplicate CSS treatment if a shared compact-control style can cleanly serve both.

Avoid broad refactoring if the two controls have meaningful behavioral differences.

The result should feel as if both controls were always designed as members of the same interface family.

All accessible names/tooltips must remain complete and localized.

---

# Part 7 — Other compact targets

For the other audit-identified small controls, increase the practical hit area without making the UI visually heavy.

Prioritize:

- Context Help;
- Search submit;
- Planned Supply disclosure;
- Cargo disclosure.

Preferred techniques:

- modest padding;
- min-inline-size / min-block-size;
- larger transparent clickable box around the existing glyph;
- pseudo-element hit-area expansion if safe and unambiguous.

### Requirements

- target should be approximately 24×24 CSS px or better where practical;
- visible glyph may remain small;
- adjacent controls must not overlap;
- pointer hit areas must not overlap each other;
- focus outline should correspond sensibly to the actual clickable area;
- ordinary dense visual rhythm should remain intact.

Do not inflate every compact button across the app blindly.

Change the audit-identified controls and clearly shared equivalents only.

---

# Part 8 — Keyboard and focus behavior must remain stable

After target-size and forced-colors changes:

- no new Tab stops should be introduced except where a control was already interactive;
- passive Matrix statuses must reduce the total Tab count;
- disclosure buttons remain native keyboard controls;
- Search submit remains keyboard reachable;
- Context Help remains keyboard reachable;
- X-Tech Add remains keyboard reachable;
- visible focus treatment remains clear in normal mode;
- selected/dark focus treatment from the localization batch must not regress.

Do not alter Search submission semantics in this slice.

That belongs to Slice 3.

---

# Part 9 — Component/static regression coverage

Add focused regression tests.

## Matrix passive status focus model

Verify:

- passive read-only Matrix states are absent from sequential Tab order;
- interactive Matrix controls remain keyboard reachable;
- passive state meaning remains present in the rendered accessible structure;
- row/column/table structure from Slice 1 remains intact.

A simple rendered test is preferred over source-text assertions where practical.

## Planned Supply

Add/extend representative coverage for:

```text
neutral
planned
unavailable
```

Verify programmatic state remains correct.

Do not attempt to prove forced-colors visual rendering in JSDOM.

## Cargo

Verify stale and active state semantics remain intact after styling changes.

## Compact controls

Where useful, assert shared classes/semantic structure rather than brittle exact pixel values.

The X-Tech Add / Manufactured Products edit relationship should be protected against obvious future divergence if a shared style/control primitive is introduced.

---

# Part 10 — Forced-colors testing limits

JSDOM cannot prove Windows forced-colors rendering.

Source/style regression is useful but manual observation remains authoritative.

Do not mark high-contrast behavior fully passed until the consolidated manual verification after Slice 3.

If Codex has a browser environment capable of emulating `forced-colors`, a bounded smoke check is welcome, but do not substitute emulation for the later real Windows high-contrast check.

---

# Manual checks for this slice

The user intends to hold the full manual accessibility checklist until after Slice 3.

Therefore:

## Required now

Only perform implementation/runtime/browser sanity checks sufficient to catch obvious regressions:

- Matrix still renders correctly;
- passive Matrix statuses remain visible;
- interactive Matrix controls still work;
- X-Tech Add visually aligns with the Manufactured Products `[edit]` pattern;
- compact target adjustments do not mangle spacing;
- normal selected/planned/stale presentation remains visually coherent.

Codex may perform these browser checks.

## Explicitly deferred until after Slice 3

- full keyboard traversal;
- Narrator Matrix reading;
- Windows forced-colors/high-contrast mode;
- true browser zoom matrix;
- touch comfort;
- complete focus-order verification.

Do not treat this deferral as failure.

---

# Explicit non-goals

Do **not** implement:

- responsive workspace changes from Slice 1;
- further main/landmark changes unless a regression is discovered;
- numeric character-form validation;
- Cargo collapsed semantic summary;
- Validation `aria-controls`/region relationship;
- Search submit zero/one/multiple-match behavior;
- axe-core/jest-axe;
- Playwright accessibility infrastructure;
- Safari/WebKit work;
- mobile support;
- Resource Matrix ARIA-grid conversion;
- custom Matrix keyboard navigation;
- new localization architecture;
- persistence/history/import/export changes.

---

# Localization constraints

Any new user-facing text must use the localization layer.

Prefer styling/semantic solutions that require no new prose.

If a visible stale/selected marker is introduced in normal mode, it must be localized where it contains language.

Do not hard-code English accessibility text.

Stable IDs and domain data remain unchanged.

---

# Design constraints

Preserve the tracker’s established visual language:

- dense technical desktop UI;
- pale flat surfaces;
- restrained borders;
- compact square/near-square controls;
- no glow;
- no generic card styling;
- no decorative shadows;
- no unnecessary visual bulk.

Especially for target sizing:

> Increase the interactive box before increasing the visual weight.

And for the X-Tech control:

> Treat the existing Manufactured Products `[edit]` control as the established design answer rather than inventing another compact-button pattern.

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

Run any existing browser/runtime smoke-check command if relevant.

---

# Acceptance criteria

This slice is complete when:

1. passive Resource Matrix status chips no longer create per-chip sequential Tab stops;
2. passive Matrix state text/explanation remains accessible through table/cell reading semantics;
3. interactive Matrix controls remain keyboard reachable and unchanged in function;
4. no full ARIA-grid/roving-grid model is introduced;
5. selected Matrix controls remain visibly distinguishable in forced-colors handling;
6. Planned Supply selected/planned states remain visibly distinguishable in forced-colors handling;
7. Cargo selected/export/stale states retain visible non-color distinction in forced-colors handling;
8. stale Cargo state does not rely on opacity/color alone;
9. normal-mode muted/disabled/selected hierarchy is preserved;
10. the X-Tech Add control follows the established Manufactured Products `[edit]` visual/sizing pattern;
11. Context Help, Search submit, Planned Supply disclosure, and Cargo disclosure receive practical larger hit areas without visual bloat;
12. no overlapping pointer targets are introduced;
13. focus visibility does not regress;
14. focused regression tests are added/updated;
15. all standard verification commands pass;
16. no Slice 3 findings are implemented;
17. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- Matrix passive-focus model before/after;
- how passive Matrix descriptions remain available to assistive technology;
- forced-colors strategy and selectors added;
- normal-mode visual impact, if any;
- X-Tech Add implementation and how it reuses/follows the Manufactured Products `[edit]` pattern;
- target-size changes and resulting approximate dimensions where measured;
- tests added/updated;
- browser/runtime sanity checks performed;
- full verification results;
- manual checks explicitly deferred;
- confirmation that no Slice 3 findings were implemented.
