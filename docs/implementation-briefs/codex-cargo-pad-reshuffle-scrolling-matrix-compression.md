# Codex Implementation Brief — Cargo Pad Reshuffle, Scrolling, and Workspace Compression

## Objective

Implement the next focused workspace UX batch for the Starfield Outpost Network app.

This batch has two main goals:

1. improve the Cargo Pads column so it works comfortably with several pads and supports reordering using the same interaction grammar as the Outpost navigation panel;
2. let the Outpost Details status matrix compress further before horizontal overflow appears.

Do not broaden this batch into a general workspace redesign.

The Cargo Pad reshuffle experience should feel like the **same reorder interaction already used by the Outpost navigation list**, adapted carefully to the Cargo Pad card presentation.

---

# Read first

Read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current implementations of:

- Outpost navigation `Reshuffle` / `Lock order`;
- Outpost navigation drag handles;
- Outpost navigation move-up / move-down controls;
- Outpost navigation drag-and-drop behavior and insertion markers;
- Cargo Pad toolbar;
- Cargo Pad collapsed/expanded card structure;
- Cargo Pad expansion-state ownership;
- Cargo Pad ordering in persisted network state;
- CargoLink endpoint identity;
- Undo/Redo snapshot/history integration;
- Outpost Details status-matrix layout and horizontal overflow behavior.

Reuse established navigation-panel interaction patterns wherever practical rather than inventing a second reorder system.

---

# Scope summary

Implement:

## Cargo Pads

- independent vertical scrolling for the Cargo Pads list;
- persistent Cargo Pads toolbar outside the scrollable region;
- toolbar wording/layout update;
- `Reshuffle` / `Lock order`;
- drag handles;
- move-up / move-down controls;
- Cargo Pad drag-and-drop using the same interaction grammar as Outpost navigation;
- temporary reorder gutters only while reshuffling;
- internal padding for expanded Cargo Pad contents;
- reorder preserving stable Cargo Pad identity, links, cargo, pad type, destination, and expansion state;
- display-label renumbering after reorder;
- one completed reorder = one Undo history action.

## Outpost Details matrix

- allow more responsive compression before horizontal overflow appears;
- preserve stable shared column geometry across outposts;
- preserve current left sticky Item-column behavior;
- preserve horizontal overflow as the final fallback.

---

# Explicitly out of scope

Do **not**:

- implement status-matrix sticky vertical header behavior;
- add independent Navigation-panel scrolling in this batch;
- redesign the Navigation panel;
- add drag auto-scroll refinements beyond existing behavior;
- redesign Cargo Pad compact headers;
- change Cargo Pad linking semantics;
- change Cargo Pad export semantics;
- change Cargo Pad validation;
- change CargoLink identity or schema;
- change persisted network schema unless absolutely required and explicitly justified;
- redesign Planned Supply;
- change status-matrix semantic content;
- add throughput modeling;
- add history timeline UI;
- change Undo/Redo architecture;
- commit or push.

---

# 1. Cargo Pads — independent vertical scrolling

## Goal

The Cargo Pads area becomes usable when several pads exist and/or multiple pads are expanded.

The **toolbar remains visible** while the list of Cargo Pad cards scrolls independently.

Conceptually:

```text
Cargo Pads

[+ Add Cargo Pad]       [Expand all] [Reshuffle]

┌─────────────────────────────────────┐
│ scrollable Cargo Pad list           │
│                                     │
│ Pad 1                               │
│ Pad 2                               │
│ Pad 3                               │
│ ...                                 │
└─────────────────────────────────────┘
```

## Required behavior

- Cargo Pad toolbar remains outside the scrollable list.
- Cargo Pad cards scroll within their own vertical region.
- Existing overall page/workspace structure should remain otherwise unchanged.
- Do not introduce a second inner scrollbar inside individual Cargo Pad cards.
- Expanded cards should simply contribute more height to the scrollable Cargo Pad list.
- Preserve existing card expansion/collapse behavior.

## Drag interaction

The new scroll container should become the clear boundary for Cargo Pad drag-and-drop.

Do not implement sophisticated edge-triggered drag auto-scroll in this batch unless it already falls out cleanly from reusing existing navigation behavior.

If drag auto-scroll remains imperfect, leave it for the already-deferred follow-up.

---

# 2. Cargo Pads toolbar

## Current

```text
[+ Add Cargo Pad]              [Expand All Pads]
```

where the right control toggles to:

```text
[Collapse All Pads]
```

## New layout

Use:

```text
[+ Add Cargo Pad]       [Expand all] [Reshuffle]
```

When all pads are expanded:

```text
[+ Add Cargo Pad]       [Collapse all] [Reshuffle]
```

When order is unlocked:

```text
[+ Add Cargo Pad]       [Expand all] [Lock order]
```

or:

```text
[+ Add Cargo Pad]       [Collapse all] [Lock order]
```

depending on current expansion state.

## Requirements

- Keep **one** Expand/Collapse toggle.
- Do **not** add separate Expand All and Collapse All buttons.
- Remove redundant word `Pads` from this toggle.
- `Expand all` ↔ `Collapse all` remains independent from reshuffle state.
- `Reshuffle` ↔ `Lock order` appears at the far right.
- Entering Reshuffle must **not** automatically expand or collapse pads.
- Leaving Reshuffle must **not** alter expansion state.

The arrangement should visually echo the Navigation-panel toolbar, where the ordering control lives at the right.

---

# 3. Cargo Pad expanded-body padding

## Problem

The recent expanded Cargo Pad redesign left expanded controls too close to the card edges.

Affected expanded-body elements include:

- destination selectors;
- Inter-System toggle;
- Remove button;
- Exports heading;
- export toggle buttons;
- other expanded-body labels/controls.

They currently butt too closely against the left, right, and bottom edges.

## Required outcome

Add appropriate internal spacing to the **expanded body only**.

Do not disturb the compact header, which is already visually satisfactory.

Conceptually:

```text
┌─────────────────────────────────────┐
│ existing compact header             │
├─────────────────────────────────────┤
│   expanded controls with padding    │
│   selectors                         │
│   Inter-System              Remove  │
│                                     │
│   Exports                           │
│   [Al] [Cu] [Fe] ...                │
│                                     │
└─────────────────────────────────────┘
```

## Important

Do not solve this by applying new blanket padding to the entire Cargo Pad card if that changes the compact header's spacing.

Prefer a dedicated expanded-content/body container or equivalent scoped styling.

---

# 4. Cargo Pad Reshuffle / Lock order

## Interaction principle

Use the **same overall appearance and functionality** as Outpost navigation reshuffling.

The user should not have to learn a second reorder grammar while looking at both lists on the same screen.

## Normal mode

- no drag handles;
- no move buttons;
- Cargo Pad cards use full available width.

## Reshuffle mode

Show temporary reorder gutters:

```text
┌───┬─────────────────────────────────────┬───┐
│ ↕ │ Cargo Pad card                      │ ↑ │
│   │                                     │ ↓ │
└───┴─────────────────────────────────────┴───┘
```

The gutters exist only while ordering is unlocked.

## Left gutter

- dedicated drag handle;
- same visual grammar as Navigation reshuffle handle;
- handle-only drag initiation.

## Right gutter

- move-up and move-down buttons;
- buttons should look like the corresponding Navigation-panel reorder buttons;
- stack them **vertically** rather than side-by-side because the Cargo Pads column is narrow;
- preserve ordinary first/last-item disabling behavior.

## Card width

While reshuffling, the central Cargo Pad card may become slightly narrower to make room for the temporary gutters.

When order is locked again, the gutters disappear and the card regains the full available width.

Do not overlay reorder controls on top of the compact header or expanded-body controls.

---

# 5. Compact versus expanded Cargo Pads

The entire Cargo Pad card is the reorderable item.

This applies whether the card is:

- collapsed;
- expanded.

## Control alignment

The reorder controls should align conceptually with the card/header start, not vertically center themselves against the full height of a large expanded card.

An expanded card may be much taller, but it remains one reorderable unit.

## Expansion state

Do not auto-collapse pads when entering Reshuffle.

Preserve each pad's current expansion state across reorder.

Example:

```text
Before:
Pad A expanded
Pad B collapsed
Pad C expanded
```

Reorder C above A:

```text
After:
Pad C expanded
Pad A expanded
Pad B collapsed
```

Expansion state is presentation-only and should follow pad identity during the session.

Undo/Redo of the reorder should affect ordering only, not manufacture separate expansion-state history actions.

---

# 6. Cargo Pad drag-and-drop behavior

Reuse the Outpost Navigation drag-and-drop interaction model wherever possible.

Required behavior:

- drag can begin only from the dedicated handle;
- drag-and-drop enabled only in Reshuffle mode;
- source card remains stationary while dragging;
- no live list reshuffling during drag;
- show insertion-marker feedback between complete Cargo Pad cards;
- drop zones represent positions between whole cards;
- expanded card height does not change reorder semantics;
- invalid/outside-list drop cancels cleanly;
- `Escape` cancels drag;
- suppress no-op drops;
- one completed reorder = one Undoable history action.

Do not invent a new drag model for Cargo Pads.

---

# 7. Move-up / move-down behavior

Move buttons are an alternate input for the same reorder operation.

Requirements:

- same semantics as Navigation reorder controls;
- same conceptual button appearance;
- vertically stacked;
- first pad cannot move further up;
- last pad cannot move further down;
- one button press = one Undo history action;
- no-op impossible/disabled states should not create history entries.

---

# 8. Cargo Pad identity and reorder semantics

This is a critical domain requirement.

Cargo Pads have stable identity.

Reordering changes:

```text
array/display order
```

It must **not** change:

- Cargo Pad UUID;
- outbound cargo;
- pad type;
- CargoLink endpoint identity;
- remote destination;
- link assignment;
- current expanded/collapsed presentation state.

Example:

```text
Before:
Pad 1 = UUID A
Pad 2 = UUID B
Pad 3 = UUID C
```

Move Pad 3 to top:

```text
After:
Pad 1 = UUID C
Pad 2 = UUID A
Pad 3 = UUID B
```

The display labels renumber according to the new array/display order.

UUID C remains the same logical pad and keeps:

- its outbound items;
- its CargoLink;
- its pad type;
- all other persisted properties.

Links that reference UUID C must continue referencing UUID C.

Do not recreate Cargo Pads during reorder.

Do not migrate outbound cargo between pads.

---

# 9. Cargo Pad labels

For this batch, preserve the current persisted/model behavior unless the existing implementation already derives visible labels safely from order.

The key UX requirement is:

> visible pad numbering/ordering must reflect the new order after reshuffle.

Do not broaden this batch into a schema migration for `CargoPad.label`.

The backlog explicitly retains the larger question of whether labels should remain persisted or eventually be fully derived from stable array order.

If current label persistence requires a small local update to keep visible numbering coherent after reorder, implement the smallest safe behavior and report it clearly.

Do not undertake a broad label-model migration.

---

# 10. History / Undo / Redo

Each deliberate reorder operation is exactly one history action.

This applies to:

- drag-and-drop reorder;
- move-up;
- move-down.

Undo restores the prior Cargo Pad order.

Redo reapplies the reorder.

Undo/Redo must preserve:

- pad UUIDs;
- outbound cargo;
- pad types;
- CargoLinks;
- destinations.

Reshuffle/Lock state is presentation-only and must not enter history.

Expansion state is presentation-only and must not create history entries.

---

# 11. Status-matrix responsive compression

## Goal

The middle Outpost Details status matrix currently reaches horizontal overflow earlier than necessary.

Allow it to compress/crowd further before the horizontal scrollbar appears.

## Preserve

- shared column positions across all outposts at a given workspace width;
- content-independent grid geometry;
- existing column order;
- current semantic content;
- current left-side sticky Item-column horizontal behavior;
- horizontal overflow as the final fallback.

## Desired progression

Conceptually:

```text
wide workspace
    ->
comfortable column widths

narrower workspace
    ->
progressively tighter shared columns

genuinely too narrow
    ->
horizontal overflow
```

Do not make the matrix columns individually content-driven.

Do not let one outpost produce different column geometry from another because its content is longer/shorter.

## Important

Do **not** implement or revisit sticky vertical header behavior in this batch.

Do **not** add an independent vertical scrollbar to the matrix.

This task is only about responsive compression before horizontal overflow.

---

# 12. Preserve existing Cargo Pad behavior

Do not regress:

- compact two-row Cargo Pad summary;
- Expand/Collapse behavior;
- destination selectors;
- linked-pad overwrite/reassignment behavior;
- Unlinked behavior;
- Inter-System toggle;
- actual-He-3 positive treatment;
- Planned Supply semantics;
- stale export display/removal;
- export grouping/order;
- routed-export status-matrix Logistics semantics;
- Imports;
- Cargo Pad validation;
- Outpost/cargo history semantics.

The recent Cargo Pad redesign is otherwise considered successful and should not be casually redesigned.

---

# Acceptance criteria

## Cargo Pads scrolling

1. Cargo Pad toolbar remains visible while Cargo Pad cards scroll independently.
2. Multiple expanded pads can be browsed without requiring the whole page to carry the Cargo Pad list vertically.
3. No nested per-card vertical scrolling is introduced.

## Toolbar

4. Toolbar uses:
   - `+ Add Cargo Pad`
   - `Expand all` / `Collapse all`
   - `Reshuffle` / `Lock order`
5. Expand/Collapse remains one toggle.
6. `Pads` is removed from Expand/Collapse wording.
7. Reshuffle state does not alter expansion state.

## Expanded-body spacing

8. Expanded-body controls have appropriate left/right/bottom padding.
9. Compact header spacing remains unchanged.

## Reshuffle controls

10. Reorder gutters appear only in Reshuffle mode.
11. Left gutter contains a Navigation-style drag handle.
12. Right gutter contains Navigation-style move-up/down controls stacked vertically.
13. Cards regain full width when order is locked.

## Drag-and-drop

14. Drag begins only from the handle.
15. No live list reshuffling occurs.
16. Source card remains stationary during drag.
17. Insertion markers appear between whole Cargo Pad cards.
18. Escape cancels.
19. Invalid/outside drop cancels.
20. No-op drops do not create history.
21. One successful drag reorder creates exactly one history action.

## Move controls

22. Move-up/down behavior matches Navigation semantics.
23. First/last boundary controls behave correctly.
24. One move-button action creates exactly one history action.

## Identity preservation

25. Reorder preserves Cargo Pad UUIDs.
26. Reorder preserves outbound cargo.
27. Reorder preserves pad type.
28. Reorder preserves CargoLinks and destinations.
29. Reorder preserves expansion state.
30. Visible pad ordering/numbering updates to match the new order.

## Undo/Redo

31. Undo restores prior order.
32. Redo reapplies reordered state.
33. Undo/Redo does not disturb links/cargo/type/identity.

## Matrix

34. Matrix compresses further before horizontal overflow.
35. Shared column geometry remains stable across outposts.
36. Existing horizontal Item-column stickiness remains.
37. Horizontal overflow still appears when genuinely required.
38. Sticky vertical matrix header behavior is not changed.

## Scope

39. No unrelated UI redesign occurs.
40. No schema/domain behavior changes beyond any minimal label-order accommodation required by current implementation.
41. Full lint remains green.
42. Build remains green.

---

# Verification

Run:

```bash
npm run lint
```

Expected:

```text
0 errors
0 warnings
```

Run:

```bash
npm run build
```

Run:

```bash
git diff --check
```

Run any relevant targeted tests if present.

---

# Manual test checklist

## Cargo Pads scrolling

Create enough Cargo Pads to exceed the available right-column height.

Expand several.

Confirm:

- toolbar remains visible;
- pad list scrolls;
- cards remain usable;
- no layout overlap.

## Toolbar

Confirm:

```text
Expand all <-> Collapse all
Reshuffle <-> Lock order
```

are independent.

Entering/exiting Reshuffle must not change which pads are expanded.

## Expanded-body padding

Inspect an expanded pad.

Confirm selectors, Inter-System, Remove, Exports, and export buttons no longer butt against the card edges.

Confirm compact header appearance is unchanged.

## Move buttons

With at least three Cargo Pads:

- move middle pad up;
- Undo;
- Redo;
- move middle pad down;
- confirm first/last restrictions;
- confirm no unexpected history entries.

## Drag-and-drop

Test collapsed cards.

Test expanded cards.

Confirm:

- handle-only drag;
- source stationary;
- insertion marker;
- successful reorder;
- no-op drop suppression;
- Escape cancel;
- outside-list cancel.

## Identity preservation

Before reorder, note for a target pad:

- pad UUID if accessible in dev/debug output;
- outbound exports;
- regular/interstellar type;
- remote CargoLink destination;
- expanded/collapsed state.

Reorder the pad.

Confirm all of those follow the pad unchanged.

Confirm visible numbering/order updates.

## CargoLink regression

Create links involving multiple pads.

Reorder linked pads.

Confirm:

- links remain attached to the same pad identities;
- no links are deleted or reassigned;
- Imports remain correct;
- Matrix Logistics remains correct.

Undo/Redo reorder and confirm links remain correct.

## Matrix compression

Resize browser progressively narrower.

Confirm:

- columns compress further than before;
- all outposts use the same column positions at the same width;
- horizontal scrollbar appears only after further compression;
- Item column remains horizontally sticky;
- no attempt was made to solve vertical sticky header behavior.

---

# Completion report

Report:

- files changed;
- how the independent Cargo Pad scroll region is structured;
- toolbar changes;
- how expanded-body padding was scoped without disturbing compact headers;
- how Reshuffle/Lock state is stored as presentation-only state;
- how reorder gutters are implemented;
- how drag-and-drop reuses Navigation behavior;
- how vertically stacked move controls are implemented;
- how pad identity is preserved through reorder;
- how visible pad numbering/labels are handled;
- how one-history-action reorder is guaranteed;
- how expansion state is preserved;
- how matrix compression was adjusted;
- `npm run lint` result;
- `npm run build` result;
- `git diff --check` result;
- browser/manual tests performed;
- any remaining caveats, especially drag auto-scroll.

Do not commit or push.
