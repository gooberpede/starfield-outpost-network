# CODEX IMPLEMENTATION BRIEF — Cargo Links Sticky Rail / Flex Scroller Geometry Refactor

## Objective

Implement the bounded Cargo Links vertical-geometry refactor recommended by:

```text
docs/audits/CARGO-LINKS-VERTICAL-GEOMETRY-REVIEW.md
```

The goal is to preserve the Cargo Links region's **independent vertical scrollbar** while fixing the current viewport-geometry defect in which expanded Cargo content can extend behind the fixed Status Bar and later leave a large blank gap after document scrolling.

The intended user experience is:

- collapsed Cargo Links remain compact and visually close to the current accepted presentation;
- expanded Cargo content grows naturally until it reaches the usable viewport boundary;
- tall Cargo content scrolls internally;
- the Cargo context can remain visible while the user independently scrolls the Resource Matrix / main document;
- no expanded Cargo controls are hidden behind the fixed Status Bar;
- no stale viewport arithmetic creates a large artificial blank region beneath Cargo after document scrolling;
- narrow/stacked layouts degrade cleanly rather than forcing the desktop sticky-rail behavior.

This is a **layout-only implementation**. Do not change cargo-link domain semantics, persistence, Undo/Redo, localization content, app version, or deployment behavior.

---

## 1. Authority

Treat the following as authoritative:

```text
AGENTS.md
docs/audits/CARGO-LINKS-VERTICAL-GEOMETRY-REVIEW.md
src/ui/layout/WorkspaceLayout.css
src/ui/layout/PageHeader.css
src/ui/layout/StatusBar.css
src/ui/components/CargoPadsEditor.css
src/ui/components/CargoPadEditor.css
src/ui/focusVisibility.ts
```

The audit disposition is:

```text
CGEO-C — bounded sticky/flex geometry refactor recommended
```

Do not reopen the overall architectural direction unless implementation measurements contradict the audit.

---

## 2. Baseline

Work from the current committed `staging` branch.

Before editing, record:

```text
branch
commit
tracked/untracked state
```

Do not modify the supplied implementation brief.

No commit, push, deployment, tag, release, repository-publication, or remote-state operation is authorized.

---

## 3. Root cause to remove

The current Cargo list directly owns:

```css
max-height: calc(100svh - 12rem);
overflow-y: auto;
```

This is the defect source.

The audit measured that, at page top with four expanded cargo pads:

```text
1366×768:
rendered list height     556.50 px
actual usable list space 342.80 px
overrun behind Status Bar 213.70 px

1600×900:
same 213.70 px mismatch
```

Document scrolling then moves the Cargo panel upward while the viewport-derived maximum height remains unchanged, causing the later large bottom gap.

The final implementation must remove this stale `100svh - 12rem` geometry model.

Do not replace it with a different arbitrary constant.

---

## 4. Recommended ownership model

Implement the audit's responsibility split:

```text
.workspace-layout__right
    → sticky positioning owner in the two-column layout

.cargo-pads
    → vertical flex shell
    → owns the usable-height cap

.cargo-pads__list
    → flex child
    → independent vertical scroll owner
```

Keep:

```text
Cargo heading
Cargo action row
```

outside the list scroller.

Do not add a new wrapper unless runtime geometry proves the current DOM cannot express the intended behavior cleanly.

---

## 5. Sticky right rail

In the two-column selected-outpost layout, make:

```text
.workspace-layout__right
```

the sticky rail.

Use the existing authoritative measured header token:

```css
--page-header-height
```

rather than a hard-coded header offset.

The intended sticky boundary is conceptually:

```css
position: sticky;
top: var(--page-header-height);
align-self: start;
```

but this is not a copy-ready instruction.

Verify actual runtime geometry at all required states before finalizing declarations.

Do not add JavaScript measurement unless CSS proves insufficient.

---

## 6. Critical correction to the audit's illustrative CSS

The audit's CSS sketch is **conceptual only**.

Do not assume this formula alone is sufficient:

```css
max-height:
  calc(
    100dvh
    - var(--page-header-height)
    - var(--status-bar-height)
  );
```

The implementation must explicitly prove and solve **both vertical states**:

### A. Pre-sticky state

Before `.workspace-layout__right` reaches its sticky threshold, the Cargo rail remains at its natural document-flow position.

At page top in the audit, the Cargo shell began well below the Page Header. Therefore a max-height based only on:

```text
viewport - header - status
```

can still overestimate the actual space available beneath the Cargo shell's current top.

Requirement:

> Before the rail is stuck, expanded Cargo content must still terminate above the fixed Status Bar.

### B. Sticky state

Once the right rail reaches:

```text
top: var(--page-header-height)
```

the shell must fit within the authoritative header-to-status-bar viewport band.

Requirement:

> After the rail is stuck, document scrolling must no longer move the Cargo context vertically, and the shell/list must remain entirely above the Status Bar.

Do not declare the geometry complete unless both states are measured and pass.

---

## 7. Preferred implementation strategy

Prefer a pure-CSS solution.

The intended structural behavior is:

```text
short Cargo content
→ natural compact height

tall Cargo content
→ capped to currently usable vertical space
→ inner Cargo list scrolls independently
```

The outer Cargo shell should become:

```text
display: flex
flex-direction: column
max-height: <authoritative usable height>
```

The Cargo list should become:

```text
flex: 1 1 auto
min-height: 0
overflow-y: auto
```

Remove the direct:

```css
max-height: calc(100svh - 12rem);
```

from `.cargo-pads__list`.

Do not force a mandatory full-height Cargo box.

---

## 8. How to solve the pre-sticky geometry

Before finalizing the CSS, determine the narrowest correct way to keep the shell above the Status Bar while the rail is still in normal flow.

Evaluate in implementation, in this order:

### Option 1 — CSS/layout structure can express it directly

Prefer this if the usable lower boundary can be derived without duplicating dynamic shell measurements.

### Option 2 — state-dependent CSS behavior

If the shell only needs the full header-to-status cap once the sticky threshold is reached, determine whether CSS can express a safe pre-sticky natural/capped state and sticky-state cap without JavaScript.

### Option 3 — minimal existing-measurement reuse

Only if pure CSS cannot represent the pre-sticky boundary robustly, consider reusing existing shell measurement infrastructure.

Do **not** add a continuous window-scroll measurement loop merely to calculate list height.

If JavaScript measurement becomes necessary, stop and document:

```text
what must be measured
why CSS cannot solve it
what event/observer updates it
why the implementation remains bounded
```

before broadening the patch.

---

## 9. Viewport unit

For the sticky viewport-bound state, prefer:

```text
100dvh
```

with an appropriate fallback consistent with the project's supported browser baseline.

Do not revert to:

```text
100svh - arbitrary constant
```

The height calculation should use semantic shell variables:

```css
--page-header-height
--status-bar-height
```

plus only a deliberate layout gap if the existing visual structure actually requires one.

Do not duplicate header or footer pixel values.

---

## 10. Preserve compact collapsed mode

The collapsed screenshot is an accepted baseline.

Requirements:

- all-collapsed Cargo remains naturally compact;
- the right rail must not stretch to the full viewport height;
- no large empty framed panel should appear below a short Cargo list;
- heading/action spacing remains visually consistent;
- summary rows remain unchanged in width/height unless the geometry refactor necessarily affects them.

Use `max-height`, not a mandatory fixed `height`, unless runtime proof demonstrates a different design is required.

---

## 11. Expanded behavior

With one or more links expanded:

- Cargo may grow naturally until it reaches the usable lower viewport boundary;
- once content exceeds that space, the list must scroll internally;
- every control in the final expanded card must be reachable;
- no portion of the scrollport may sit behind the Status Bar;
- the scroll position of Cargo should remain independent of the Resource Matrix/document.

When the user scrolls the main page:

- Cargo may move naturally before reaching its sticky threshold;
- once sticky, it should remain docked below the Page Header;
- its own scroll position must not reset merely because the document scrolls.

---

## 12. Stacked layout

At:

```css
@container selected-outpost (max-width: 39rem)
```

reset desktop sticky-rail behavior.

At minimum:

```text
position: static
top: auto
```

or the equivalent appropriate reset.

Do not pin Cargo over the Resource Matrix in stacked mode.

For the stacked layout, choose the safest bounded behavior based on runtime verification:

### Preferred if robust

Keep an independent Cargo scroller using the semantic shell geometry.

### Acceptable fallback

Allow natural-height/document scrolling in the stacked layout if a bounded internal scroller causes header occlusion or fragile short-height behavior.

The project is not targeting iPhone as a primary layout. Preserve correctness and readability over forcing desktop behavior into short landscape viewports.

Document the chosen stacked behavior.

---

## 13. Focus behavior

Verify the existing:

```text
focusAndReveal()
```

behavior after changing the scroll hierarchy.

Specifically test:

- focus on the first Cargo disclosure;
- focus on the last Cargo disclosure;
- focus on controls at the bottom of an expanded editor;
- keyboard shortcut focus of the Cargo region;
- focus reveal while Cargo list is scrolled to each extreme;
- focus reveal while the main document is scrolled;
- 200% zoom.

The implementation must not create a state where focused Cargo controls are hidden behind either:

```text
Page Header
Status Bar
```

If the nested scroll ancestor detected by `focusAndReveal()` changes, add focused regression coverage.

Do not alter semantic DOM order.

---

## 14. Reshuffle / drag behavior

The refactor must preserve:

```text
drag handles
insertion markers
drop positioning
keyboard move-up/move-down controls
```

Test native drag autoscroll at both Cargo-list edges.

Because sticky positioning plus a resized nested overflow box can expose browser differences, verify at least Chromium locally.

If Firefox/WebKit is unavailable, document that as a spot-check item rather than redesigning drag behavior.

Do not broaden this task into a drag/drop rewrite.

---

## 15. Browser behavior

The implementation should remain based on standard primitives:

```text
CSS Grid
position: sticky
column flex
min-height: 0
nested overflow-y: auto
CSS custom properties
dynamic viewport units
```

Avoid browser-specific hacks unless runtime evidence requires them.

Keep ancestors of the sticky rail free of accidental trapping overflow.

Preserve:

```css
align-items: start
```

or an equivalent non-stretching grid behavior.

---

## 16. Files expected to change

The audit expects a bounded CSS change primarily in:

```text
src/ui/layout/WorkspaceLayout.css
src/ui/components/CargoPadsEditor.css
```

Tests may also change/add if needed.

Do not edit TSX unless a genuinely necessary structural issue is discovered.

Do not change:

```text
domain model
cargo-link semantics
persistence
Undo/Redo
localization strings
breakpoint value
header dimensions
status-bar dimensions
application version
```

---

## 17. Runtime measurements required during implementation

Measure the final implementation using `getBoundingClientRect()` / computed styles.

At minimum, for each state record:

```text
Cargo/right top
Cargo shell top/bottom
Cargo list top/bottom
Cargo list clientHeight
Cargo list scrollHeight
Page Header bottom
Status Bar top
document scrollY
```

The key invariant is:

```text
cargo shell/list bottom <= Status Bar top
```

for all relevant tall-content states.

Also verify:

```text
sticky rail top >= Page Header bottom
```

once sticky.

Measure both:

```text
before sticky threshold
after sticky threshold
```

This requirement is mandatory.

---

## 18. Required viewport/state matrix

Test at:

```text
1366×768
1600×900
```

and one short-height diagnostic viewport around:

```text
844×390
```

For each applicable viewport, test:

```text
all collapsed
one expanded
multiple expanded
page near top
just before sticky threshold
just after sticky threshold
deep Matrix/document scroll
document end
```

Also test:

```text
100% zoom
200% zoom
```

At the 39rem selected-outpost threshold, verify both sides of the stacked/two-column transition.

---

## 19. Visual acceptance

Compare against the user's supplied screenshots.

Expected outcomes:

### Collapsed

Should remain visually close to the accepted collapsed screenshot.

### Expanded

The independent Cargo list should be visibly bounded above the Status Bar, not abruptly hidden behind it.

### Document scrolled

The large blank gap caused by the old fixed viewport cap should no longer appear in the two-column sticky state.

Do not introduce a new mandatory empty full-height Cargo frame.

---

## 20. Functional acceptance

Verify:

```text
Expand All / Collapse All
individual expand/collapse
Add
Remove
link-type toggle
destination selectors
export toggles
reshuffle mode
keyboard reorder
Cargo-region focus shortcut
```

No functional behavior should change.

---

## 21. Automated checks

Run the existing targeted/component tests relevant to:

```text
Cargo Pads
focus visibility
layout/component accessibility
```

Add narrowly scoped regression tests where practical.

Tests should protect behavior, not hard-code one browser's exact pixel geometry unless the repository already has an established geometry-test pattern.

---

## 22. Full verification

Run:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

If normal lint remains blocked only by the known ignored `.local-work/reference-overlay-prototype` multi-TSConfig-root issue:

1. report the known limitation;
2. use the established clean-checkout-shaped lint verification;
3. do not modify the ignored prototype.

---

## 23. Stop conditions

Stop and report before broadening implementation if:

- CSS cannot keep pre-sticky expanded Cargo above the Status Bar without new runtime measurement;
- the sticky rail requires a broader workspace-shell restructuring;
- the change alters Resource Matrix geometry materially;
- stacked mode becomes unusable;
- focus reveal fails in a way requiring non-local accessibility redesign;
- drag/drop requires a larger interaction rewrite;
- application/runtime semantics would need to change.

Do not silently expand scope.

---

## 24. Non-goals

Do not:

```text
redesign Cargo cards
change Cargo widths
change Cargo button geometry
change Matrix layout
change resource/product geometry
change cargo-link ordering semantics
remove independent Cargo scrolling in two-column desktop layout
optimize specifically for iPhone
change app version
change deployment
add dependencies
commit
push
deploy
```

---

## 25. Success criteria

The implementation is complete when:

- the old `calc(100svh - 12rem)` list cap is gone;
- `.workspace-layout__right` provides sticky behavior in the two-column layout;
- `.cargo-pads` owns the bounded natural-height shell behavior;
- `.cargo-pads__list` owns independent scrolling as a flex child with `min-height: 0`;
- collapsed Cargo remains compact;
- tall expanded Cargo is fully reachable;
- neither pre-sticky nor sticky Cargo extends behind the Status Bar;
- sticky Cargo remains below the Page Header;
- document scrolling no longer produces the large stale-height bottom gap;
- stacked mode behaves cleanly;
- focus reveal remains correct;
- reshuffle controls remain functional;
- required tests/build/lint/whitespace verification pass.

---

## 26. Completion report

Report:

1. baseline branch/commit;
2. exact files changed;
3. final sticky owner;
4. final height owner;
5. final overflow owner;
6. exact CSS strategy used;
7. how pre-sticky geometry was solved;
8. how sticky geometry was solved;
9. whether `100dvh` and fallback were used;
10. stacked-layout behavior;
11. before/after geometry at 1366×768;
12. before/after geometry at 1600×900;
13. short-height diagnostic result;
14. collapsed/one-expanded/multi-expanded results;
15. focus verification;
16. reshuffle/drag verification;
17. tests/typecheck/build/lint results;
18. `git diff --check`;
19. any browser spot-check limitations;
20. confirmation no domain/persistence/version/deployment/remote operation occurred.

Suggested commit message:

```text
fix: correct cargo vertical geometry
```
