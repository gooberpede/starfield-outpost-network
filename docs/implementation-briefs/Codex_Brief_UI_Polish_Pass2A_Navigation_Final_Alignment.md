# Codex Mini-Brief — UI Polish Pass 2A: Navigation Pane Final Alignment

## Objective

Make one final, tightly scoped correction to the navigation pane.

The current navigation rows are substantially improved and should remain as implemented. The Cargo Pads pane is also complete and must not be touched.

This correction should:

1. make the navigation pane slightly narrower;
2. restore `Reshuffle` to the right edge of the navigation header row;
3. preserve the current full-width outpost selector rows;
4. avoid any unrelated UI changes.

Do **not commit or push**.

---

# 1. Read first

Inspect the current pending UI-polish changes, especially:

- `src/ui/layout/WorkspaceLayout.css`
- `src/ui/components/OutpostList.css`
- `src/ui/components/OutpostList.tsx`

Also review the latest navigation screenshot as the visual target.

This is a tiny geometry correction only.

---

# 2. Navigation pane width

The navigation column was reduced from:

```text
260px
```

to:

```text
250px
```

in the previous pass.

The pane still has a noticeable amount of unused horizontal space to the right of even the longest normal outpost names.

Reduce the navigation column slightly further.

Suggested target:

```text
240px
```

A nearby value such as `235px` is acceptable only if browser inspection shows it is clearly better.

Do not make a large jump.

The goal is:

> reduce the remaining dead space while preserving comfortable button widths and existing truncation behaviour.

Do not change the Cargo Pads column width.

Do not squeeze the center pane more than the small navigation reduction naturally changes it.

---

# 3. Preserve current outpost-row behaviour

The current outpost selector rows now correctly use the available width.

Keep that behaviour.

Each row should remain:

```text
grab handle + selector button filling remaining width
```

Preserve:

- grab handle width/alignment;
- flex/grid fill behaviour;
- ellipsis/truncation;
- title/tooltip behaviour;
- disabled state;
- selected state;
- drag-and-drop;
- reshuffle-mode movement controls.

Do not revert the improvement that removed unnecessary permanently reserved row space.

---

# 4. Restore `Reshuffle` right-edge alignment

## Current issue

The previous pass replaced the wide header spacing with a compact fixed gap.

That moved the `Reshuffle` button left, so it no longer aligns with the right edge of the navigation pane.

The desired arrangement is:

```text
[+ Add Outpost]            [Reshuffle]
```

with:

- `+ Add Outpost` anchored to the left;
- `Reshuffle` anchored to the right.

Restore right-edge alignment using normal layout behaviour.

Preferred solution:

```css
justify-content: space-between;
```

or equivalent flex/grid positioning.

Because the pane will now be narrower, the resulting gap should no longer appear excessively large.

Do not hard-code a margin between the buttons.

Do not move either button vertically.

---

# 5. Preserve outer gutters

Do not alter the shared:

```text
--page-gutter: 1.25rem
```

The navigation pane should remain aligned to the page’s established left gutter.

Do not change TitleBar, PageHeader, StatusBar, or workspace outer padding.

---

# 6. Cargo Pads are finished

Do **not** modify:

- `CargoPadsEditor.css`;
- Cargo Pad card widths;
- Cargo Pad header controls;
- right-edge alignment;
- cargo-pane width.

The Cargo Pads alignment from the previous pass is approved and should remain untouched.

---

# 7. No other UI changes

Do not change:

- System / Body / Biome layout;
- matrix geometry;
- input widths;
- Planned Supply;
- page title;
- header controls;
- footer;
- scrollbars;
- sample data;
- any functionality.

This is the final navigation-pane correction only.

---

# 8. Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Then perform a browser smoke test at desktop width comparable to the supplied screenshots.

Verify:

1. navigation pane is slightly narrower than 250px;
2. outpost buttons still fill the row cleanly;
3. longest normal names still have reasonable usable width;
4. `+ Add Outpost` aligns left;
5. `Reshuffle` aligns with the pane’s right edge;
6. grab handles remain aligned;
7. drag-and-drop and reshuffle mode still work;
8. outer gutters remain unchanged;
9. Cargo Pads remain unchanged;
10. no console errors;
11. no temporary smoke-test edits remain.

---

# 9. Completion report

Report:

1. files changed;
2. navigation width before/after;
3. how header-button edge alignment was restored;
4. confirmation outpost row fill/truncation behaviour stayed unchanged;
5. lint result;
6. build result;
7. `git diff --check` result;
8. browser smoke-test result;
9. confirmation Cargo Pads and all unrelated UI were untouched.

Do not commit or push.
