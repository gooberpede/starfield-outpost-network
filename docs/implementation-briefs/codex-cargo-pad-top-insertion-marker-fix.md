# Codex Correction Brief — Cargo Pad Top Insertion Marker

## Objective

Fix one visual defect in Cargo Pad drag-and-drop reshuffling.

Current behavior:

- dragging a Cargo Pad to the first/top position works correctly;
- dropping there reorders correctly;
- however, the insertion marker is not shown for the topmost insertion position.

The goal is to make the top insertion position visually consistent with all other valid insertion positions.

This is a **narrow visual correction only**.

Do not redesign Cargo Pad reshuffling.

Do not change reorder semantics unless absolutely necessary to render the marker correctly.

Do not implement drag auto-scroll.

---

# Read first

Read:

- `AGENTS.md`
- `docs/UX-DESIGN.md`
- `docs/ARCHITECTURE.md`

Inspect the current Cargo Pad reshuffle implementation, especially:

- drag state;
- drop-index calculation;
- insertion-marker rendering;
- card boundary/drop-zone logic;
- CSS for insertion markers;
- current first/last-position handling.

Relevant files will likely include:

- `src/ui/components/CargoPadsEditor.tsx`
- `src/ui/components/CargoPadsEditor.css`

and any shared drag/reorder helper if applicable.

---

# Problem

For `n` Cargo Pads there are conceptually `n + 1` insertion positions:

```text
──────── insertion position 0
Pad A
──────── insertion position 1
Pad B
──────── insertion position 2
Pad C
──────── insertion position 3
```

Current behavior appears to render the marker for positions after cards, but not for insertion position `0`.

The actual top-position drop already works, so the underlying reorder semantics are believed to be correct.

The missing behavior is the **visual insertion marker above the first Cargo Pad card**.

---

# Required behavior

When dragging a Cargo Pad and the computed destination is the first/top insertion position:

- show the same insertion-marker visual used elsewhere;
- render it immediately above the first Cargo Pad card;
- keep it aligned with the Cargo Pad reorder row/card width in the same way as other insertion markers;
- remove it normally when the pointer leaves that target, drag is cancelled, or drag completes.

The top position should not have a special visual grammar; it should look like the same insertion boundary used between/below cards.

---

# Preserve existing behavior

Do not regress:

- top-position drop functionality;
- bottom-position insertion marker;
- middle-position insertion markers;
- drag-handle-only initiation;
- source card remaining stationary during drag;
- no live reshuffling;
- Escape cancellation;
- outside-list cancellation;
- no-op suppression;
- one completed reorder = one Undo history action;
- stable Cargo Pad IDs;
- CargoLinks;
- outbound cargo;
- pad types;
- expansion state;
- toolbar behavior;
- independent Cargo Pad scrolling.

---

# Implementation guidance

Prefer fixing the rendering model rather than altering reorder math that already works.

A clean approach is to ensure that insertion position `0` has an explicit marker render location before the first card, while existing positions continue to render at their current boundaries.

If the current implementation associates markers only with "after card index X", introduce the smallest structural change needed so the list can also represent "before first card".

Do not duplicate drag-state logic unnecessarily.

Do not create a special top-drop interaction separate from the existing drop-target calculation.

---

# Auto-scroll remains deferred

Do **not** implement:

- edge-triggered drag auto-scroll;
- scroll acceleration;
- drag-hover scrolling;
- navigation scrolling changes.

This bug fix is independent of those deferred enhancements.

---

# Acceptance criteria

1. Dragging toward the top insertion position shows an insertion marker above the first Cargo Pad.
2. Dropping there still moves the dragged pad to index `0`.
3. The marker uses the same visual treatment as existing insertion markers.
4. Middle insertion markers remain correct.
5. Bottom insertion marker remains correct.
6. Escape cancellation removes the marker.
7. Outside-list cancellation removes the marker.
8. No-op drops remain suppressed.
9. Reorder history semantics are unchanged.
10. No domain/state behavior changes are introduced.
11. No auto-scroll work is added.
12. `npm run lint` remains green.
13. `npm run build` remains green.

---

# Verification

Run:

```bash
npm run lint
```

Run:

```bash
npm run build
```

Run:

```bash
git diff --check
```

---

# Manual test checklist

With at least three Cargo Pads:

## Top position

- drag the last pad toward the top;
- confirm insertion marker appears above the first pad;
- drop;
- confirm dragged pad becomes first.

## Middle

- drag a pad between two existing pads;
- confirm existing insertion marker still appears correctly;
- drop and confirm reorder.

## Bottom

- drag a pad to the final position;
- confirm bottom insertion marker still appears;
- drop and confirm reorder.

## Cancellation

- begin drag;
- hover top insertion position;
- press Escape;
- confirm marker disappears and order remains unchanged.

Repeat with an outside-list release.

## Regression

Confirm:

- Undo/Redo still treats the reorder as one history action;
- linked/exporting pads retain identity/data after reorder;
- Cargo Pad scrolling remains unchanged.

---

# Completion report

Report:

- files changed;
- root cause of the missing top marker;
- how insertion position `0` is now rendered;
- whether drop-index logic was changed or left intact;
- `npm run lint` result;
- `npm run build` result;
- `git diff --check` result;
- manual drag checks performed.

Do not commit or push.
