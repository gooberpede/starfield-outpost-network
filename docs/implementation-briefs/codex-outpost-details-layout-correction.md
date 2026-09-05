# Codex Correction Brief — Restore Outpost Details Workspace Layout

## Objective

Make a **focused corrective pass only** on the recently implemented Outpost Details status matrix.

The matrix behavior is broadly correct and should be preserved.

This correction exists to fix one structural layout regression and a few directly related issues:

1. Move the status matrix out of the full-width/top region and back into the **middle Outpost Details column**.
2. Keep Planned Supply beneath the matrix in that same middle column.
3. Keep Cargo Pads in the existing right column.
4. Remove the matrix's independent vertical scrolling / artificial max-height.
5. Preserve horizontal overflow when the matrix cannot fit its allotted middle-column width.
6. Preserve the sticky shared header and sticky Item column as far as practical within the corrected layout.
7. Replace the Manufacturing remove glyph with a plain ASCII `-`.
8. Correct only the documentation changed by the previous batch where it now describes the mistaken full-width/local-vertical-scroll arrangement.

Do **not** redesign matrix density, button size, row spacing, section spacing, or Cargo Pads in this pass.

---

# Read first

Read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Also inspect the current uncommitted implementation from the previous status-matrix batch, especially:

- `src/App.tsx`
- `src/ui/components/OutpostStatusMatrix.tsx`
- `src/ui/components/OutpostStatusMatrix.css`
- the workspace layout component/CSS used for left–middle–right placement
- documentation files modified by the previous batch

This brief is a **correction to that implementation**, not a replacement design.

---

# Preserve the successful parts

Do not rewrite the status-matrix feature unless a minimal change is necessary for the layout correction.

Preserve current behavior for:

- alphabetical Inorganic and Organic rows;
- Present/Producing prerequisite behavior;
- atomic collateral production removal and Undo;
- derived lit/dim Logistics state;
- actual-availability-only manufacturing Inputs;
- staged Manufacturing Edit/Save/Cancel;
- one history action on Manufacturing Save;
- preserved hidden fabricator quantities;
- Imports aggregated at source-outpost grain;
- duplicate imported items de-duplicated;
- wrapped imported Logistics items;
- existing validation behavior;
- existing JSON/schema behavior;
- deletion of the now-superseded `ResourceEditor` and `ManufacturingEditor`, if those deletions remain appropriate.

The matrix itself is close to the intended design.

---

# 1. Restore the left–middle–right workspace structure

The previous implementation incorrectly promoted `OutpostStatusMatrix` into the full-width/top region.

That changed the established workspace from:

```text
┌─────────────────────────────────────────────────────────────┐
│ Outpost identity/details                                    │
├───────────────┬───────────────────────────┬─────────────────┤
│ Navigation    │ Outpost Details content   │ Cargo Pads      │
│               │                           │                 │
└───────────────┴───────────────────────────┴─────────────────┘
```

into a layout where the matrix spans across the workspace and pushes Cargo Pads below it.

That is a regression.

## Required placement

The intended composition is:

```text
TOP
  Outpost identity/details only

WORKSPACE
  LEFT
    Navigation

  MIDDLE
    Outpost Status Matrix
    Planned Supply

  RIGHT
    Cargo Pads
```

Conceptually:

```text
┌─────────────────────────────────────────────────────────────┐
│ Outpost identity/details                                    │
├───────────────┬───────────────────────────┬─────────────────┤
│ Navigation    │ Status Matrix             │ Cargo Pads      │
│               │                           │                 │
│               │ Planned Supply            │                 │
│               │                           │                 │
└───────────────┴───────────────────────────┴─────────────────┘
```

## App composition

In `App.tsx`:

- keep `OutpostDetails` / identity-location editing in `top`;
- move `OutpostStatusMatrix` into `middle`;
- place it before `PlannedSupplyEditor`;
- leave Cargo Pads in `right`.

Do not create a new full-width matrix region.

Do not move Cargo Pads.

Do not change Navigation placement.

## Workspace CSS

If the previous matrix batch added or changed workspace CSS solely to support the full-width matrix placement, remove/revert only those changes that are no longer needed.

For example, inspect any changes such as `.workspace-layout__top` flex/gap behavior introduced specifically for the mistaken arrangement.

Do not broadly redesign WorkspaceLayout.

---

# 2. Remove independent vertical scrolling from the matrix

The matrix should **not** be a vertically constrained mini-window with its own scrollbar.

Remove behavior equivalent to:

```css
max-height: ...;
overflow: auto;
```

where that causes the matrix itself to own vertical scrolling.

The matrix should participate in the normal vertical flow of the middle Outpost Details column.

A long planet/resource list may make the page/workspace taller and require ordinary vertical scrolling. That is acceptable.

Do not attempt to eliminate vertical scrolling by compressing the matrix in this correction.

## Explicitly out of scope

Do not tune:

- button dimensions;
- row padding;
- row gaps;
- section spacing;
- typography;
- overall matrix density.

Those are possible later tune-ups.

This pass is structural only.

---

# 3. Preserve horizontal overflow

The matrix still has meaningful fixed semantic columns:

```text
Item | Source | Present | Producing | Inputs | Logistics
```

When those columns cannot fit comfortably inside the middle column:

- preserve the shared column geometry;
- allow horizontal overflow/scrolling;
- do not collapse to cards;
- do not stack/reorder columns;
- do not shrink content differently per outpost;
- do not let content-driven widths make columns move when switching outposts.

The same viewport/workspace width must still produce the same matrix column positions for every outpost.

Do not assume the current matrix minimum width is wrong merely because it looked too wide in the mistaken full-width placement.

First preserve the existing matrix sizing unless a minimal adjustment is required to make horizontal scrolling function correctly inside the middle column.

Do **not** perform width/density tuning in this pass.

---

# 4. Sticky header and sticky Item column

Retain the intended spreadsheet-like behavior where practical:

- shared matrix header sticky while vertically scrolling the enclosing Outpost Details/workspace region;
- Item column sticky while horizontally scrolling the matrix;
- top-left Item header sticky in both relevant directions.

However:

- do not reintroduce an independent vertical matrix scrollbar merely to make `position: sticky` easy;
- do not redesign the entire workspace scrolling architecture;
- do not implement the deferred broad “independent middle workspace scrolling” feature.

If CSS overflow/sticky constraints mean the exact vertical sticky behavior cannot be retained without creating a new scroll architecture, prefer:

1. correct left–middle–right layout;
2. normal vertical flow;
3. correct horizontal matrix overflow and sticky Item column;

over restoring the mistaken vertical mini-scroll region.

Document any unavoidable limitation in the completion report rather than broadening scope.

---

# 5. Manufacturing remove control

The current Manufacturing edit-mode remove button renders nicely as:

```text
[-]
```

but its source appears to use a non-ASCII minus glyph that may be encoding-sensitive in diffs/tools.

Replace the source character with a plain ASCII hyphen-minus:

```text
-
```

Preserve the current visual result as closely as possible:

```text
[-]
```

Do not otherwise redesign the Manufacturing action bar.

---

# 6. Documentation correction

The previous batch updated architecture/UX documentation to describe the implemented matrix.

Review **only the documentation lines changed by that batch** that now encode the mistaken layout/scroll behavior.

Correct them so the durable design says:

- the status matrix lives in the **middle Outpost Details column**;
- Cargo Pads remain in the right column;
- Planned Supply remains below the matrix in the middle column;
- matrix semantic column geometry is stable across outposts;
- horizontal overflow is allowed when needed;
- the matrix does not own an artificial independent vertical scrollbar;
- ordinary vertical scrolling follows the enclosing Outpost Details/workspace layout;
- sticky header/Item behavior is scoped accordingly.

Do not rewrite unrelated documentation.

Do not use this correction to add new backlog ideas or redesign settled UX.

---

# 7. Files that should not be restored merely because they were deleted

The previous batch removed superseded:

- `ResourceEditor.tsx`
- `ManufacturingEditor.tsx`

If their responsibilities are fully absorbed by `OutpostStatusMatrix`, keep those deletions.

Do not restore dead components simply to minimize file deletion count.

If you discover that some unrelated behavior was lost with them, report that specifically and make the smallest necessary correction.

---

# Explicitly out of scope

Do not:

- redesign Cargo Pads;
- modify Cargo Pad export selection;
- modify Planned Supply behavior or appearance;
- change matrix row ordering;
- change Present/Producing semantics;
- change Imports aggregation;
- change Input availability rules;
- change Manufacturing edit semantics;
- add manufactured “ghost rows” for imported products;
- change fabricator quantity model/schema;
- change JSON import/export;
- change validators;
- perform matrix density tuning;
- reduce button sizes;
- reduce row padding/gaps;
- change section spacing;
- redesign responsive breakpoints beyond what is required to restore correct placement/overflow;
- commit or push.

---

# Acceptance criteria

## Workspace layout

1. `OutpostStatusMatrix` no longer spans the full workspace width.
2. `OutpostStatusMatrix` appears in the middle column.
3. `PlannedSupplyEditor` appears below it in the middle column.
4. Cargo Pads remain visible in the right column beside the matrix.
5. Navigation remains in the left column.
6. Outpost identity/location details remain in the top region.

## Scrolling

7. The matrix no longer has an independent vertical scrollbar.
8. The matrix no longer has an artificial vertical `max-height` solely to create local scrolling.
9. Long matrices grow naturally in normal vertical flow.
10. Horizontal scrolling remains available when the six semantic columns exceed the middle-column width.
11. Column positions remain stable across outposts at the same viewport width.
12. Rows may still grow vertically for wrapped Logistics content.

## Sticky behavior

13. Sticky Item behavior works during horizontal matrix scrolling.
14. Shared header remains sticky within the intended enclosing scroll context if achievable without restoring independent vertical matrix scrolling.
15. No new full-app/workspace scroll architecture is introduced.

## Manufacturing control

16. Remove uses ASCII `-` in source.
17. It still renders as the compact `[-]` control or equivalent current appearance.

## Regression

18. Matrix behavior from the previous batch still works.
19. Present/Producing prerequisite still works.
20. Manufacturing Edit/Save/Cancel still works.
21. Save still creates one history entry.
22. Actual-availability Input lit/dim behavior still works.
23. Imports still aggregate/de-duplicate by source outpost.
24. Planned Supply remains unchanged.
25. Cargo Pads remain functionally unchanged.
26. Existing deleted superseded editors are not restored without cause.

---

# Verification

Run:

```bash
npm run build
```

Run targeted lint for changed files.

Run:

```bash
git diff --check
```

Run full lint if that is the established workflow, but do not fix unrelated pre-existing failures.

---

# Manual visual checks

Use representative outposts with:

- few resources;
- many resources;
- manufacturing entries;
- imports;
- Cargo Pads.

Confirm:

## Structure

- matrix is in the middle column;
- Cargo Pads remain beside it on the right;
- matrix no longer pushes Cargo Pads underneath;
- Planned Supply is below matrix in the middle column.

## Vertical behavior

- matrix itself does not show a vertical scrollbar;
- long resource lists extend naturally;
- ordinary page/workspace scrolling reaches lower matrix rows and Planned Supply.

## Horizontal behavior

- when middle column is too narrow, matrix can scroll horizontally;
- Item remains usable/sticky while scrolling horizontally;
- switching between outposts does not make columns jump.

## Regression

- Present/Producing interactions still work;
- Manufacturing edit/save/cancel still works;
- Inputs still change lit/dim with actual availability;
- Imports still wrap and aggregate correctly;
- Cargo Pad UI itself is unchanged.

---

# Completion report

Report:

- files changed;
- exact App/Workspace placement correction;
- CSS removed/changed to eliminate local vertical scrolling;
- how horizontal overflow now works in the middle column;
- sticky header/Item behavior after correction;
- whether any sticky limitation remained because vertical local scrolling was removed;
- documentation lines corrected;
- verification commands and results;
- any pre-existing lint failures left untouched;
- recommended manual checks.

Do not commit or push.
