# Implementation Brief: Navigation Panel Cleanup and Reshuffle Mode

## Objective

Clean up the Outpost navigation panel and introduce a presentation-only `Reshuffle` / `Lock order` mode for manual outpost reordering.

This batch should improve compactness, alignment, and clarity without yet implementing drag-and-drop or independent scrolling.

---

## Current behaviour

The Outpost navigation panel currently:

- displays outposts as a bulleted list;
- always shows move-up / move-down buttons;
- allows variable-length outpost names to affect where the movement controls appear;
- can wrap movement controls awkwardly beneath long names;
- uses the current manual up/down controls to reorder outposts;
- has a narrower column than is ideal for the planned control layout.

The selected outpost behaviour and current ordering semantics already work and should be preserved.

---

## Required behaviour

### 1. Navigation pane width

Modestly widen the Outpost navigation pane so the new controls have more room.

The adjacent Outpost Details area currently has sufficient spare horizontal space, so the change should come primarily from adjusting the workspace column proportions rather than increasing the overall page width.

Do not redesign the overall workspace layout in this batch.

### 2. Remove list bullets

Remove the visible bullets from the outpost list.

The space on the left side of each outpost row should instead be reserved for a drag-handle affordance.

### 3. Stable row layout

Each outpost row should use a stable three-part layout:

```text
[drag handle] [outpost name / selection target] [move controls]
```

The layout must prevent variable-length outpost names from pushing the move controls onto inconsistent lines.

Movement controls should remain aligned at the right side of each row.

The outpost name should remain the primary selection target.

Preserve the existing selected-outpost styling and behaviour unless a very small CSS adjustment is required to support the new structure.

### 4. Reshuffle mode

Add one action button to the Outpost navigation panel action area.

Default state:

```text
[+ Add Outpost]       [Reshuffle]
```

When `Reshuffle` is clicked:

- reshuffle mode becomes active;
- the button label changes to `Lock order`;
- move-up / move-down buttons become visible;
- drag handles become active;
- actual drag-and-drop reordering is **not** implemented in this batch.

When `Lock order` is clicked:

- reshuffle mode becomes inactive;
- the button label changes back to `Reshuffle`;
- move-up / move-down buttons are hidden;
- drag handles become disabled.

Reshuffle mode is presentation/session state only.

It must not be persisted in:

- `OutpostNetwork`;
- browser storage;
- JSON;
- Undo/Redo history.

The default state on application/network load is locked.

### 5. Drag-handle affordance

Reserve a fixed left-side drag-handle position for each outpost row.

The handle should remain visible in both modes so row alignment does not shift.

When reshuffle mode is locked:

- the handle is visually disabled;
- it must not initiate any drag behaviour;
- it should provide a tooltip such as:

```text
Reshuffle mode disabled
```

When reshuffle mode is active:

- the handle should appear enabled;
- it should visually indicate that the row will eventually be draggable.

Do not implement actual drag-and-drop in this batch.

Use an appropriate compact handle symbol or icon consistent with the existing no-dependency UI approach.

Do not add a dependency solely for the icon.

### 6. Existing up/down controls

Reuse the current outpost move-up / move-down behaviour.

Do not create a second ordering model.

When reshuffle mode is active:

- show the existing up/down controls;
- preserve existing boundary behaviour:
  - move-up disabled for the first outpost;
  - move-down disabled for the last outpost.

When reshuffle mode is locked:

- hide the up/down controls rather than displaying them disabled.

Outpost reordering remains:

- persisted through array order;
- one Undoable action per move;
- based on stable outpost IDs.

Undo/Redo must work regardless of whether reshuffle mode is currently locked or active.

---

## Presentation-state scope

Reshuffle mode belongs to the Outpost navigation panel as a whole.

It is not specific to the currently selected outpost.

Switching selected outposts must not toggle reshuffle mode.

Ordinary network edits, Undo, and Redo must not automatically change reshuffle mode.

A full application/network load should begin with order locked.

---

## Non-goals

Do not implement any of the following in this batch:

- drag-and-drop reordering;
- independent navigation-panel scrolling;
- Outpost Details redesign;
- selected-outpost header changes;
- cargo-pad Reshuffle mode;
- outpost-name length validation;
- changes to outpost ordering semantics;
- changes to persisted schema;
- new dependencies.

The 25-character in-game outpost-name limit is a known future validation rule, but it is explicitly out of scope here.

---

## Architecture constraints

Follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`

In particular:

- reshuffle state is presentation-only;
- outpost array order remains the persisted ordering mechanism;
- stable outpost IDs remain identity;
- manual movement remains one Undoable network action;
- do not move ordering logic into CSS or duplicate ordering state in the UI.

---

## Acceptance criteria

1. Load a network containing several outposts.
   - Reshuffle mode starts locked.
   - Button shows `Reshuffle`.
   - Move-up / move-down controls are hidden.
   - Drag handles are visible but disabled.
   - Hovering/focusing a disabled handle provides a `Reshuffle mode disabled` tooltip or equivalent.

2. Click `Reshuffle`.
   - Button changes to `Lock order`.
   - Drag handles become visually enabled.
   - Move-up / move-down controls appear.
   - Row alignment remains stable.

3. Click `Lock order`.
   - Button changes back to `Reshuffle`.
   - Move controls disappear.
   - Drag handles return to disabled state.
   - Outpost order remains unchanged.

4. Reorder outposts using the existing arrow controls while reshuffle mode is active.
   - Ordering behaves exactly as before.
   - First/last boundary controls remain correctly disabled.
   - Each move is one Undoable action.

5. Use Undo/Redo while reshuffle mode is active.
   - Outpost order changes appropriately.
   - Reshuffle mode itself does not enter history.

6. Use Undo/Redo while reshuffle mode is locked.
   - Outpost order can still be restored/reapplied.
   - Locked state remains presentation-only.

7. Switch between selected outposts.
   - Selection behaviour remains unchanged.
   - Reshuffle mode does not change.

8. Test short and long outpost names.
   - Move controls remain in a consistent right-side position.
   - They do not wrap beneath the name merely because name lengths differ.

9. Outpost list no longer displays bullets.

10. Navigation pane is modestly wider and the adjacent Outpost Details area remains usable.

11. No reshuffle/drag state appears in exported JSON.

12. `npm run build` passes.

---

## Implementation guidance

Inspect the current Outpost navigation component, its CSS, and the workspace layout CSS before editing.

Prefer a simple row layout such as CSS Grid or another stable alignment mechanism rather than spacing controls manually.

Extend the existing reordering callbacks and ordering semantics rather than reimplementing them.

Do not add drag-and-drop behaviour yet; this batch establishes the mode and visual affordance that the next batch will use.

Use the smallest coherent set of changes that satisfies the brief.

Do not commit or push changes.
