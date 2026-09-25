# CODEX AUDIT BRIEF — Cargo Links Vertical Geometry and Independent Scroll Behavior

## Objective

Perform a focused geometry/layout audit of the Cargo Links region to understand why expanded cargo links are visibly compressed/cut off while leaving substantial unused vertical space below the cargo panel after page scrolling.

The user will attach three screenshots with this brief:

1. collapsed cargo links — visually acceptable baseline;
2. expanded cargo links — second expanded link visibly cut off;
3. page scrolled lower — large blank gap between the bottom of the cargo panel and the fixed bottom status bar.

The intended product behavior remains:

- Cargo Links should retain an **independent vertical scrollbar**;
- a user should be able to keep a particular cargo link visible while independently scrolling the Resource Matrix / main page;
- collapsed cargo links should remain compact;
- the fix should target general desktop/tablet behavior rather than optimize specifically for iPhone;
- iPhone landscape is useful evidence because the defect becomes more obvious with limited vertical space.

This is an **audit only**. Do not implement layout changes.

---

## 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
src/ui/layout/WorkspaceLayout.tsx
src/ui/layout/WorkspaceLayout.css
src/ui/layout/PageHeader.css
src/ui/layout/StatusBar.css
src/ui/components/CargoPadsEditor.tsx
src/ui/components/CargoPadsEditor.css
src/ui/components/CargoPadEditor.tsx
src/ui/components/CargoPadEditor.css
src/index.css
src/ui/focusVisibility.ts
```

Inspect any other directly relevant shell/scroll code as needed.

Do not modify the supplied audit brief or screenshots.

---

## 2. Known current geometry to verify

Explicitly investigate:

```css
.cargo-pads__list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: calc(100svh - 12rem);
  margin-top: 0.75rem;
  padding: 0 0 0.25rem;
  overflow-y: auto;
}
```

alongside:

```css
.page-header {
  position: sticky;
  top: 0;
}
```

and:

```css
.status-bar {
  position: fixed;
  bottom: 0;
  height: var(--status-bar-height);
}
```

plus:

```css
#root {
  min-height: 100svh;
  padding-bottom: var(--status-bar-height);
}
```

Do not assume the `12rem` calculation is the root cause merely because it is suspicious. Prove or disprove that with measurements.

---

## 3. Questions the audit must answer

Determine:

1. which element currently establishes the Cargo region's usable vertical height;
2. whether `.cargo-pads__list` is sized against the viewport rather than its actual current viewport position;
3. whether the fixed status bar can overlap the independent Cargo scroller;
4. whether page scrolling changes the cargo panel's viewport position while leaving its max-height unchanged;
5. whether that explains both:
   - the truncation/guillotine effect in the expanded screenshot;
   - the large blank gap below Cargo after the page is scrolled;
6. whether ancestor grid/flex sizing, intrinsic minimum size, overflow, or `align-items` contributes;
7. whether the existing stacked layout changes the behavior materially;
8. whether Safari/WebKit viewport-unit behavior makes the same design more fragile.

---

## 4. Visual evidence

Use the supplied screenshots as required evidence.

For each screenshot, identify or infer:

```text
viewport size
page scroll position
cargo list top
cargo list bottom
fixed status-bar top
visible unused space
which cargo content is clipped or partially visible
```

If exact values cannot be extracted from the screenshots, reproduce the same state locally and measure it.

---

## 5. Runtime reproduction and measurements

Reproduce at least at:

```text
1366 × 768
1600 × 900
```

If practical, include one short-height landscape diagnostic viewport such as:

```text
844 × 390
```

Test:

```text
A. all cargo links collapsed
B. one expanded
C. multiple expanded
D. page near top
E. page scrolled lower through the Matrix
```

For each representative state record bounding/computed geometry for:

```text
viewport
.page-header
.workspace-layout__right
.cargo-pads
.cargo-pads__heading
.cargo-pads__actions
.cargo-pads__list
first expanded cargo pad
last visible cargo pad
.status-bar
```

Record at minimum:

```text
top
bottom
height
clientHeight
scrollHeight
overflow-y
position
computed max-height
window.innerHeight
window.scrollY
visualViewport.height if available
```

Calculate:

```text
actual available list space =
status-bar top - cargo list top
```

and compare it with the computed Cargo list max-height.

Repeat before and after document scrolling.

---

## 6. Scroll ownership map

Document the vertical scroll hierarchy:

```text
document/body
workspace
selected-outpost region
right Cargo column
Cargo component
Cargo list
Resource Matrix/local scrollers
```

Identify which elements actually scroll and which merely move with document flow.

The report should make the nested-scroll relationship unambiguous.

---

## 7. Sticky-rail feasibility

Evaluate whether the right-hand Cargo area should become a **viewport-aware sticky rail** while retaining the Cargo list's independent scrollbar.

Conceptual target:

```text
sticky page header
────────────────────────────

Resource Matrix        Cargo Links
(document scroll)      [sticky right rail]
                       heading
                       actions
                       ┌─────────────┐
                       │ cargo list  │
                       │ independent │
                       │ scroll      │
                       └─────────────┘

────────────────────────────
fixed status bar
```

Evaluate these possible sticky owners:

```text
.workspace-layout__right
.cargo-pads
a new inner cargo-shell wrapper if justified
```

For each, assess:

```text
sticky containing block
top offset
bottom/height constraint
grid interaction
short-content natural height
tall-content behavior
page-scroll behavior
```

Do not implement the sticky design.

---

## 8. Header offset strategy

The page header is sticky and can change height at layout breakpoints.

Do not recommend a new arbitrary value such as:

```css
top: 4rem;
```

without evidence.

Evaluate:

```text
A. an authoritative shared CSS custom property for header height
B. shell/grid structure that avoids explicit header arithmetic
C. measuring the real header height through existing layout infrastructure
D. breakpoint-specific CSS if height is genuinely deterministic
```

If a header-height token/mechanism already exists, identify whether it is currently authoritative and reusable.

Recommend one approach.

---

## 9. Outer-shell versus list height ownership

Evaluate replacing:

```text
Cargo list directly owns viewport max-height
```

with:

```text
Cargo outer shell owns available viewport cap
Cargo list flexes into remaining space
```

Conceptually:

```css
cargo shell {
  display: flex;
  flex-direction: column;
  max-height: <usable viewport space>;
}

cargo list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
```

Assess:

```text
natural compact height for short content
whether min-height: 0 is required
height vs max-height
whether heading/actions remain outside the scroller
intrinsic grid/flex sizing
```

Desired behavior:

```text
short/collapsed content → natural compact height
long/expanded content → capped to usable viewport and internally scrollable
```

---

## 10. Viewport-unit analysis

Assess current use of:

```text
100svh
```

against:

```text
desktop Chromium
desktop Safari/WebKit
iOS/iPadOS dynamic browser chrome
short landscape viewports
```

Determine whether the recommended architecture should use:

```text
svh
dvh
vh
or no direct viewport unit
```

Prefer structural sizing over magic viewport arithmetic where robustly possible.

---

## 11. Fixed status-bar interaction

Determine whether `#root` bottom padding protects:

```text
document-flow content only
nested Cargo scrollers
both
```

Specifically verify whether the Cargo scroller can extend behind the fixed status bar despite the root reservation.

Any proposed geometry should reuse:

```css
--status-bar-height
```

rather than duplicate that dimension.

---

## 12. Existing stacked/container-query behavior

Current selected-outpost content stacks at:

```css
@container selected-outpost (max-width: 39rem)
```

Audit both:

```text
two-column Matrix + Cargo
single-column stacked Matrix/Cargo
```

A sticky side rail may be appropriate only in the two-column layout.

Determine whether sticky positioning should be disabled/reset in the stacked layout.

---

## 13. Preserve the collapsed baseline

The supplied collapsed screenshot is the baseline to preserve.

Any recommended architecture should retain:

```text
compact collapsed list
natural height when content is short
current summary readability
current ordering/reshuffle controls
```

Do not recommend a mandatory full-height empty Cargo panel.

---

## 14. Expanded-mode usability goal

The final geometry should allow:

```text
one or several expanded cargo links
independent Cargo scrolling
full access to all expanded controls
no content hidden behind the status bar
no large artificial blank region caused by stale viewport arithmetic
```

The user should be able to:

1. expand the relevant cargo link;
2. position it within the Cargo list;
3. scroll the Resource Matrix/page independently;
4. retain the Cargo context without continual reshuffling.

Assess whether each proposed option achieves this.

---

## 15. Focus/accessibility implications

Inspect:

```text
src/ui/focusVisibility.ts
Cargo disclosure focus behavior
Cargo keyboard focus-region behavior
scrollIntoView/focus-and-reveal logic
```

Determine whether sticky positioning or a changed nested scroller would affect:

```text
focus reveal
keyboard navigation
header/status-bar occlusion
screen-reader reading order
```

Recommend safeguards if required.

Do not broaden this into a general accessibility audit.

---

## 16. Reshuffle/drag implications

Assess whether changed overflow/sticky/flex ownership affects:

```text
drag insertion markers
drag auto-scroll
drop coordinates
keyboard reorder controls
```

If native drag autoscroll behavior needs implementation verification, call that out.

Do not redesign reshuffling.

---

## 17. Browser compatibility

Evaluate the proposed approach conceptually for:

```text
Chromium
Firefox
WebKit/Safari
```

Pay particular attention to:

```text
position: sticky inside CSS grid
sticky + nested overflow
dynamic viewport units
min-height: 0
fixed footer overlap
```

Do not make iPhone compatibility a release criterion.

---

## 18. Compare alternatives

Compare at least:

### Option A — adjust `calc(100svh - 12rem)`

Assess as a minimal patch.

### Option B — compute a better viewport-derived max-height

For example using authoritative shell/header/status geometry.

### Option C — sticky right-hand Cargo rail with internal flex scroller

Expected leading candidate.

### Option D — remove Cargo's independent scrollbar and rely on document scroll

Assess against the user's stated workflow and explain the usability cost.

Include another option if clearly superior.

---

## 19. Recommendation standard

Prefer a solution that:

```text
uses semantic shell/layout geometry
minimizes magic constants
preserves independent Cargo scroll
preserves natural compact height
works in two-column desktop layouts
degrades cleanly in stacked layouts
avoids JavaScript measurement unless CSS cannot express the constraint robustly
reuses existing header/status tokens where possible
```

Do not optimize only for the exact screenshot dimensions.

---

## 20. Proposed implementation outline

The report should specify, without editing code:

```text
which element should become sticky, if any
which element should own max-height/height
which element should own overflow-y
where min-height: 0 is needed
how top/bottom offsets are derived
what container-query reset is needed
what current magic max-height should be removed
```

If JavaScript measurement is recommended, specify:

```text
what is measured
when it updates
how resize is observed
why pure CSS is insufficient
```

Prefer CSS if robust.

---

## 21. Later implementation verification matrix

Define a finite test matrix including:

```text
1366×768
1600×900
two-column layout
stacked layout
all collapsed
one expanded
multiple expanded
page near top
page scrolled deep
100% zoom
200% zoom
High Contrast if geometry can change
Chromium
WebKit/Safari spot check if available
```

Verify:

```text
Cargo list remains independently scrollable
last expanded control is reachable
no status-bar overlap
no unexplained large bottom gap
collapsed mode remains compact
Matrix/page can scroll independently of Cargo
focus reveal still works
reshuffle still works
```

---

## 22. Audit-only constraints

Do not:

```text
edit CSS
edit TSX
change scroll behavior
change breakpoints
change header/status sizing
add JavaScript measurement
change Cargo interactions
change app version
commit
push
deploy
```

Only create the audit report.

---

## 23. Expected report

Create:

```text
docs/audits/CARGO-LINKS-VERTICAL-GEOMETRY-REVIEW.md
```

Include:

1. baseline;
2. screenshot interpretation;
3. current scroll/height ownership map;
4. measured geometry tables;
5. reproduction results;
6. root-cause analysis;
7. status-bar/header interaction;
8. viewport-unit analysis;
9. sticky-rail feasibility;
10. outer-shell-vs-list ownership analysis;
11. stacked-layout implications;
12. accessibility/focus implications;
13. reshuffle/drag implications;
14. browser compatibility;
15. option comparison;
16. recommended architecture;
17. implementation outline;
18. finite verification plan;
19. release-readiness disposition.

---

## 24. Disposition

End with one:

```text
CGEO-A — current behavior is intentional/acceptable; no change recommended
CGEO-B — small CSS correction to current geometry is sufficient
CGEO-C — bounded sticky/flex geometry refactor recommended
CGEO-D — issue requires broader workspace-shell redesign
```

Use the narrowest justified classification.

---

## 25. Verification

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report is created
the supplied audit brief/screenshots remain untouched
no source/runtime files changed
no commit/push/deployment occurred
```

No full build/test run is required for report-only work.

---

## Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. CGEO-A/B/C/D disposition;
4. confirmed root cause;
5. whether `max-height: calc(100svh - 12rem)` is materially responsible;
6. measured mismatch between actual available space and current max-height;
7. whether fixed status-bar overlap occurs;
8. whether page scroll explains the later blank gap;
9. recommended sticky owner;
10. recommended height/overflow owner;
11. header-offset strategy;
12. viewport-unit recommendation;
13. stacked-layout behavior;
14. focus/reshuffle risks;
15. exact implementation scope;
16. later verification matrix;
17. confirmation no implementation occurred.

Suggested commit message:

```text
docs: audit cargo vertical geometry
```
