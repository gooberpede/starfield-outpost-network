# Codex Mini-Brief — UI Polish Pass 1: Page Gutters and Outpost Header Alignment

## Objective

Make a focused presentation-only cleanup to the application shell.

This pass should improve alignment and page-edge consistency without changing application behaviour, feature logic, persistence, validation, navigation semantics, or scroll behaviour.

The goals are:

1. set the browser/tab title to `Starfield Outpost Network`;
2. establish consistent left and right outer page gutters from top to bottom;
3. align the Outpost Details `System`, `Body`, and `Biome` field groups cleanly;
4. avoid touching navigation-pane internals yet, except where strictly necessary to establish the common left gutter;
5. preserve the current overall three-column balance as much as possible.

Do **not commit or push**.

---

# 1. Read first

Before changing code, read and follow:

- `AGENTS.md`
- `docs/UX-DESIGN.md`
- `docs/ARCHITECTURE.md`
- relevant shell/layout CSS
- `src/App.tsx`
- Outpost Details component/CSS
- navigation component/CSS
- Cargo Pads component/CSS
- app entry HTML/document title source

This is a CSS/layout polish pass, not a feature batch.

---

# 2. Browser/tab title

The browser tab currently shows:

```text
starfield-outpost-network
```

Change it to:

```text
Starfield Outpost Network
```

so it matches the visible application title.

Do not otherwise rename the application.

---

# 3. Establish consistent outer page gutters

## Problem

Current screenshots show inconsistent horizontal spacing at the outer edges:

- page title/header controls/footer have a comfortable inset from the window edge;
- left navigation content begins much closer to the left border;
- Cargo Pads content ends much closer to the right border.

The page should read as one aligned shell with a consistent outer gutter.

## Required result

Create one visually consistent left/right outer margin from top to bottom.

Conceptually:

```text
| gutter | navigation | centre content | cargo pads | gutter |
```

The exact CSS technique is up to the implementation, but avoid brittle element-by-element nudges if the shell/grid can own the spacing cleanly.

## Left side

Move the navigation region/content inward so its visible controls align with the same left gutter used by:

- page title;
- character/header controls;
- footer/status controls.

Do **not** yet redesign the navigation rows/buttons.

If accommodating the new left gutter naturally causes the navigation column to become slightly narrower, that is acceptable.

Do not intentionally squeeze the centre pane more than necessary.

## Right side

Inset the Cargo Pads region so it has the same outer right gutter as the header controls above it.

The Cargo Pads panel should no longer appear to almost touch the right browser edge.

Prefer solving this through shared shell/grid spacing rather than hard-coded offsets.

## Preserve centre balance

Do not substantially redesign:

- centre-pane width;
- cargo-pane width;
- matrix width;
- column proportions;

unless a small adjustment is necessary to establish the common gutters.

The aim is boundary/alignment cleanup, not a new page layout.

---

# 4. Outpost header alignment

## Problem

The `System`, `Body`, and `Biome` field groups do not currently align cleanly.

The labels sit at slightly different vertical positions, and the controls appear aligned by their bottom edge rather than as complete field groups.

## Required structure

Treat each as a vertical field unit:

```text
Label
Control
```

Align the **top of the field groups**, so all labels sit on the same baseline and all controls begin at the same vertical position below them.

Desired visual:

```text
System             Body               Biome
[ system ... ]     [ body ... ]       [Biome1] [Biome2] [Biome3]
                                      [Biome4] [Biome5]
```

## Biome wrapping

Biome buttons may wrap to multiple rows.

When they wrap:

- they must wrap within the Biome region;
- subsequent biome-button rows must remain under the first biome row;
- they must not flow underneath the System or Body controls.

Do not change biome-selection functionality.

Do not change button semantics, grouping, ordering, numbering, or selection state.

---

# 5. Explicitly defer navigation-pane internals

Do **not** yet implement the proposed navigation cleanup:

```text
narrower pane
wider outpost buttons
tighter Add Outpost / Reshuffle arrangement
```

That belongs to UI Polish Pass 2 after we inspect the result of this shell/gutter pass.

Only make navigation changes that are strictly necessary to align the entire panel with the new left outer gutter.

Preserve:

- grab handles;
- drag/drop;
- reorder semantics;
- truncation/ellipsis;
- titles/tooltips;
- button widths unless the shell change itself requires a minor adjustment.

---

# 6. Do not touch scrollbars

Scrollbar behaviour and styling remain explicitly deferred.

Do not modify:

- overflow behaviour;
- scrollbar width;
- scrollbar appearance;
- pane scrolling;
- matrix scrolling.

---

# 7. Preserve functionality

This pass must not change:

- persisted schema;
- reference data;
- biome selection behaviour;
- production routes;
- validators;
- cargo pads;
- matrix semantics;
- Undo/Redo;
- import/export;
- navigation behaviour;
- outpost selection;
- drag/drop;
- Planned Supply;
- manufacturing;
- resource availability.

This should be presentation-only except for the document title.

---

# 8. CSS quality

Prefer:

- shared shell/container spacing;
- grid/flex alignment;
- existing spacing variables where practical;
- minimal reversible changes.

Avoid:

- magic pixel offsets attached to individual controls;
- unrelated width changes;
- opportunistic redesign;
- new abstraction layers for a small CSS adjustment.

Keep the implementation easy to inspect and revert.

---

# 9. Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Then perform a browser smoke test.

Check at desktop width comparable to the supplied screenshots:

1. browser tab reads `Starfield Outpost Network`;
2. visible left edge of navigation content aligns with header/footer left gutter;
3. Cargo Pads region has a matching right outer gutter;
4. centre matrix remains comfortably sized;
5. System / Body / Biome labels align vertically;
6. controls beneath them align cleanly;
7. biome buttons still wrap only inside the Biome region;
8. no functionality changed;
9. no console errors;
10. no scrollbar changes.

Do not leave temporary app state changes behind.

---

# 10. Completion report

Report:

1. files changed;
2. how the document title was updated;
3. how common left/right gutters were implemented;
4. any shell/grid width adjustments made;
5. how System/Body/Biome alignment was corrected;
6. whether any navigation width changed incidentally;
7. lint result;
8. build result;
9. `git diff --check` result;
10. browser smoke-test result;
11. confirmation that no functionality/persistence/scrollbar behaviour changed;
12. any follow-up visual issue worth checking in the screenshot checkpoint.

Do not commit or push.
