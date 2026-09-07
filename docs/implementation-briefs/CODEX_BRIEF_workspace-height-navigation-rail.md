# Codex Implementation Brief — Workspace Height Fix: Navigation Rail to Footer

## Objective

Fix the workspace layout so the **Outpost navigation pane's pale background and right-edge separator extend continuously down to the StatusBar**, even when the center workspace becomes taller than the navigation list.

This is a narrow layout correction following the Planned Supply redesign.

The current problem is visible when expanded Planned Supply makes the center column substantially taller: the navigation pane's styled surface ends when its own content ends, leaving the lower-left portion of the page on the main workspace background.

The intended result is:

> The navigation pane should behave like a continuous vertical rail from the top of the workspace to the StatusBar, regardless of how much or how little content the navigation list itself contains.

---

## 1. Read current layout first

Inspect the current implementation and CSS for:

```text
WorkspaceLayout
Outpost navigation pane/container
main/center workspace column
Cargo pane
StatusBar/footer clearance
page/workspace scrolling
```

Also read relevant repository guidance, including as applicable:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
```

Do not assume the fix should be a hard-coded height.

---

## 2. Hard scope boundary

### In scope

Only the layout/sizing needed to make the navigation rail extend to the footer correctly.

Possible affected files may include:

```text
WorkspaceLayout.tsx
WorkspaceLayout.css
OutpostList.css
```

but keep changes minimal.

### Out of scope

Do **not** restyle or redesign:

```text
Navigation contents
Planned Supply
Resource Matrix
Cargo Pads
Outpost Header
PageHeader
TitleBar
StatusBar
validation
dialogs
```

Do not change component behavior.

Do not change scroll semantics unless strictly required for the height fix.

---

## 3. Required visual behavior

The navigation pane should:

- retain its current pale surface;
- retain its current right-edge separator;
- begin at the same workspace top position as today;
- extend continuously to the StatusBar;
- remain continuous when the center column is taller than the navigation content;
- remain continuous when Planned Supply is expanded;
- remain continuous with few or many outposts;
- not introduce a separate nested scrollbar unless one already exists by design.

The fix should work whether the center workspace is:

```text
short
normal height
taller than viewport
very tall due to expanded Planned Supply
```

---

## 4. Preferred implementation approach

Prefer a **layout-driven stretch solution** using the existing grid/flex structure.

Examples of acceptable strategies include:

```text
grid/flex stretch
shared row height
min-height / block-size inherited from the workspace
align-self: stretch
background applied to the full-height grid track/container
```

Choose the solution that best fits the existing architecture.

Avoid brittle approaches such as:

```text
hard-coded pixel heights
large arbitrary min-height values
viewport-height calculations that ignore dynamic content
absolute-positioned decorative pseudo-elements detached from layout
JavaScript resize measurements
```

The rail should naturally grow with the workspace content.

---

## 5. StatusBar interaction

The StatusBar is fixed/persistent and the workspace already maintains clearance for it.

Preserve that behavior.

The navigation rail should terminate visually at the same lower boundary as the center workspace content area, immediately above the StatusBar clearance.

Do not:

- cover the StatusBar;
- extend behind the StatusBar in a way that is visibly inconsistent;
- change StatusBar height/position;
- alter footer-clearance logic unless a tiny shared correction is necessary.

If a shared correction is required, report it explicitly.

---

## 6. Scroll behavior

Preserve the application's existing page/workspace scroll behavior.

In particular:

- tall Planned Supply should continue to scroll normally;
- navigation should remain visually continuous while the page scrolls;
- do not make the navigation pane independently scroll unless it already does so;
- do not pin/fix the navigation contents merely to achieve the background effect.

The issue is **surface height**, not sticky/fixed navigation behavior.

---

## 7. Width and proportions

Do not alter:

```text
navigation width
center/cargo proportions
matrix width
cargo width
```

The current proportions have already been visually approved.

This fix should not affect horizontal layout.

---

## 8. Visual consistency

Preserve the committed Navigation visual language:

```text
quiet pale rail
thin workspace-edge separator
compact rows
subtle selected marker
```

Do not add new borders, shadows, or background colors.

No new design tokens should be necessary.

---

## 9. Verification

Run appropriate checks:

```text
npm test
npm run lint
npm run build
git diff --check
```

### Manual browser smoke tests

Verify at least:

```text
0/few outposts if easily available
many outposts
Planned Supply collapsed
Planned Supply expanded
wide Planned Supply layout
narrow/wrapped Planned Supply layout
page taller than viewport
page shorter than viewport
```

Confirm:

- navigation pale background reaches the StatusBar;
- right-edge separator reaches the StatusBar;
- no abrupt cutoff remains;
- no new vertical or horizontal overflow is introduced;
- StatusBar remains fixed and unobscured;
- center/cargo widths remain unchanged;
- no navigation behavior changes;
- scrolling remains as before.

---

## 10. Deliverable report

When complete, report:

```text
files changed
layout cause identified
implementation used
scroll behavior impact
StatusBar interaction
tests/checks run
manual smoke-test results
```

Explicitly state whether:

- any out-of-scope component changed visually;
- any width/proportion changed;
- any new scrollbar was introduced;
- any fixed/sticky behavior changed.

Do not commit or push unless explicitly asked.

---

## 11. Suggested commit message

If accepted:

```text
fix: extend navigation rail to footer
```

---

## 12. Final instruction

This is a narrow layout correction.

Prefer the smallest robust CSS/layout fix that makes the navigation rail naturally stretch with the full workspace height.
