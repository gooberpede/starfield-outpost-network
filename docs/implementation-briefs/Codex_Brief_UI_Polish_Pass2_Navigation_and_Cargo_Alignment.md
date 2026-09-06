# Codex Mini-Brief — UI Polish Pass 2: Navigation Pane Density and Cargo Pad Alignment

## Objective

Make a second focused presentation-only cleanup to the Starfield Outpost Network UI.

This pass should:

1. make better use of horizontal space inside the navigation pane;
2. reduce unnecessary empty space in that pane without squeezing the center content;
3. align the right edge of Cargo Pad cards with the right edge of the `Reshuffle` button above them;
4. preserve all existing functionality and interaction semantics;
5. leave sample/default network data and scrollbar work untouched.

Do **not commit or push**.

---

# 1. Read first

Before changing code, read and follow:

- `AGENTS.md`
- `docs/UX-DESIGN.md`
- `docs/ARCHITECTURE.md`

Inspect at minimum:

- navigation component/CSS;
- workspace layout CSS;
- Cargo Pads component/CSS;
- relevant shell/layout styles;
- recent Pass 1 gutter changes.

This is a small CSS/layout polish pass, not a feature change.

---

# 2. Navigation pane — current issue

The navigation pane currently has noticeable unused horizontal space to the right of the outpost selector buttons.

Current visual pattern is roughly:

```text
Outposts [9/16]

[+ Add Outpost]       [Reshuffle]

⋮  [Outpost 1       ]     unused space
⋮  [Outpost 2       ]     unused space
⋮  [Outpost 3       ]     unused space
```

The goal is to use the existing pane width more efficiently.

Preferred result:

```text
Outposts [9/16]

[+ Add Outpost] [Reshuffle]

⋮  [Outpost 1             ]
⋮  [Outpost 2             ]
⋮  [Outpost 3             ]
```

This is a geometry/density cleanup only.

---

# 3. Navigation pane width

The current navigation column is:

```text
260px
```

It may be reduced slightly if doing so improves the layout.

However:

- do not shrink it aggressively;
- do not squeeze the center pane unnecessarily;
- do not force names to truncate more than they do now;
- do not change overall three-column proportions more than needed.

Use the current screenshot and layout as the baseline.

The intent is:

> reclaim wasted internal space first, then narrow the pane only as much as remains visually beneficial.

If widening the outpost buttons already solves most of the problem, keep any column-width change modest.

---

# 4. Navigation row layout

Each outpost row should continue to contain:

```text
grab handle + outpost selector button
```

Preserve the grab-handle column.

Make the selector button fill the remaining available row width.

Use normal flex/grid sizing rather than a hard-coded button width if practical.

The button should remain compatible with:

- ellipsis/truncation;
- title/tooltip behaviour;
- disabled state;
- drag-and-drop;
- selected/active styling.

Do not change the underlying outpost-name text or truncation semantics.

---

# 5. Navigation header controls

The `+ Add Outpost` and `Reshuffle` buttons currently have more empty space between them than necessary.

Tighten their arrangement so the row feels intentionally packed within the pane.

Preferred visual:

```text
[+ Add Outpost] [Reshuffle]
```

rather than:

```text
[+ Add Outpost]       [Reshuffle]
```

Do not make them touch.

Use a normal small gap consistent with the rest of the UI.

Do not change button labels, behaviour, or ordering.

---

# 6. Cargo Pads right-edge alignment

## Current issue

In the Cargo Pads pane, the right edge of each pad card ends slightly **left** of the right edge of the `Reshuffle` button above it.

The `Reshuffle` button is already correctly aligned with the page’s right gutter.

Do **not** move the button.

Do **not** move the whole pad card.

## Required result

Expand each pad card slightly **to the right** so:

```text
right edge of pad card
=
right edge of Reshuffle button
```

Keep the pad card’s left edge where it is.

This is a width adjustment, not a translation.

Conceptually:

```text
[ + Add Cargo Pad ]      [Expand all] [Reshuffle]
[ Pad 1 ....................................... ]
```

with the card ending on the same vertical line as the `Reshuffle` button.

Prefer solving this through the Cargo Pad list/container width rather than one-off margins on individual cards.

---

# 7. Preserve the new page gutters

Pass 1 introduced a shared page gutter.

Do not disturb:

```text
--page-gutter: 1.25rem
```

or the consistent outer alignment already established.

The navigation and cargo changes should remain inside that shell.

Do not rework the page-edge system.

---

# 8. Do not touch sample/default network data

Do **not** modify:

```text
sampleData.ts
```

or any default/sample outpost/network values in this pass.

That will be handled later as part of a separate network-lifecycle discussion covering:

- multiple networks;
- create new network;
- delete current network;
- default/sample network semantics.

---

# 9. Do not touch scrollbars

Scrollbar work remains deferred.

Do not modify:

- overflow behaviour;
- scrollbar appearance;
- scrollbar width;
- scroll containers;
- pane scrolling.

---

# 10. Preserve functionality

This pass must not change:

- outpost selection;
- drag-and-drop;
- reshuffle behaviour;
- navigation ordering;
- disabled states;
- Cargo Pad behaviour;
- expand/collapse;
- cargo links;
- persisted schema;
- sample/default network;
- import/export;
- Undo/Redo;
- validators;
- biome selection;
- production routes;
- resource matrix;
- Planned Supply;
- reference data.

Presentation only.

---

# 11. CSS quality

Prefer:

- flex/grid fill behaviour;
- `min-width: 0` where needed for ellipsis;
- container-based widths;
- small consistent gaps;
- minimal reversible changes.

Avoid:

- per-row magic offsets;
- absolute positioning;
- element-specific negative margins;
- unrelated shell changes.

Keep the implementation easy to inspect.

---

# 12. Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Then perform a browser smoke test at a desktop width comparable to the supplied screenshots.

Check:

1. navigation outpost buttons use the available row width more fully;
2. the pane no longer has a large unused strip to the right;
3. `+ Add Outpost` and `Reshuffle` sit with a compact, intentional gap;
4. grab handles remain visible and aligned;
5. truncation/ellipsis still works;
6. drag-and-drop still works;
7. the center pane is not noticeably squeezed;
8. Cargo Pad card right edge aligns with the `Reshuffle` button right edge;
9. Cargo Pad card left edge remains unchanged;
10. outer page gutters remain aligned;
11. no scrollbar changes occurred;
12. no console errors;
13. no temporary smoke-test edits remain.

---

# 13. Screenshot checkpoint

After implementation, provide a fresh full-page screenshot if browser tooling is available.

Also provide or inspect focused screenshots of:

- the navigation pane;
- the Cargo Pads header/card alignment.

Do not make additional speculative polish changes after the screenshot checkpoint unless explicitly required.

---

# 14. Completion report

Report:

1. files changed;
2. whether the navigation column width changed and from/to what value;
3. how outpost selector buttons were made to fill available width;
4. how Add Outpost / Reshuffle spacing changed;
5. how Cargo Pad right-edge alignment was corrected;
6. confirmation the Cargo Pad left edge did not move;
7. lint result;
8. build result;
9. `git diff --check` result;
10. browser smoke-test result;
11. confirmation no functionality/sample-data/scrollbar changes were made;
12. any remaining visual issue worth considering after the screenshot checkpoint.

Do not commit or push.
