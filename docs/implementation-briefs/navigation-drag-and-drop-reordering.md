# Implementation Brief: Navigation Drag-and-Drop Reordering

## Objective

Add drag-and-drop reordering to the Outpost navigation panel using the existing Reshuffle mode and drag handles.

The interaction must be deliberate, stable, and unambiguous:

- no live reordering preview while dragging;
- clear insertion feedback;
- clear cancellation behaviour;
- no accidental edge snapping outside the list;
- one successful drop equals one Undoable outpost reorder action.

This batch should extend the navigation-panel Reshuffle work already implemented without changing persisted ordering semantics or introducing scrolling behaviour.

---

## Current behaviour

The Outpost navigation panel already has:

- presentation-only `Reshuffle` / `Lock order` mode;
- fixed drag-handle, outpost-name, and movement-control columns;
- drag handles visible in both modes;
- drag handles disabled while order is locked;
- existing move-up / move-down buttons shown only in Reshuffle mode;
- persisted outpost ordering through the `outposts` array;
- Undo/Redo support for existing arrow-based reorder operations;
- stable outpost IDs;
- presentation-only Reshuffle state;
- a modestly widened navigation pane.

The drag handles are currently affordances only and do not yet reorder outposts.

---

## Required behaviour

### 1. Drag activation

Drag-and-drop reordering must be available only when Reshuffle mode is active.

The drag handle must be the **only** drag initiation target.

Do not make the entire outpost row draggable.

When Reshuffle mode is locked:

- drag handles remain visible;
- drag handles remain visually disabled;
- drag-and-drop cannot start;
- existing tooltip/disabled-state behaviour should remain appropriate.

When Reshuffle mode is active:

- drag handles become active;
- the existing up/down controls remain available as an alternative reorder method.

### 2. No live list reordering preview

While an outpost is being dragged, the list must **not** reorder or shuffle dynamically.

The source outpost must remain in its original list position until the user completes a valid drop.

Dragging should communicate intended placement through an insertion marker only.

Do not implement a sortable-list style preview where rows continuously move out of the way under the pointer.

### 3. Source-row feedback

While dragging:

- the source row should remain visible in its original position;
- it should receive a subtle visual treatment indicating that it is the item currently being dragged, for example reduced opacity or another lightweight state;
- do not remove the row from the list while the drag is active.

A browser/native drag image is acceptable for this batch.

Do not build a complex custom floating drag-preview component unless necessary for reliable behaviour.

### 4. Insertion-marker model

Potential drop positions must be represented as positions **between outpost rows**, not as dropping “onto” another outpost.

Conceptually:

```text
--------------------  before first outpost
Outpost A
--------------------  between A and B
Outpost B
--------------------  between B and C
Outpost C
--------------------  after last outpost
```

Only one insertion marker should be visible at a time.

The insertion marker should be visually clear enough that the user can tell exactly where the dragged outpost will be placed if released.

The list itself must remain stationary while the marker moves.

### 5. Top and bottom drop behaviour

The top and bottom positions require explicit, conservative behaviour.

A valid “move to first position” target must exist **within the list’s valid top insertion zone**.

A valid “move to last position” target must exist **within the list’s valid bottom insertion zone**.

Dragging above or below the list into unrelated UI, such as:

- the panel heading;
- the Add Outpost / Reshuffle action area;
- other workspace regions;
- page chrome;

must **not** implicitly mean “move to top” or “move to bottom”.

When the pointer leaves valid list drop zones:

- the insertion marker must disappear;
- releasing must cancel the drag with no reorder.

Do not implement edge snapping outside the list.

### 6. Validity feedback

The UI must clearly distinguish between:

- a valid drop position; and
- an invalid/outside-list position.

The primary visual rule is:

- visible insertion marker = releasing will reorder;
- no insertion marker = releasing will cancel.

Avoid ambiguous feedback where the user cannot tell whether dropping outside the list will commit or cancel.

### 7. Cancellation

The user must be able to intentionally cancel an active drag.

Support at least:

- pressing `Escape` to cancel immediately;
- releasing outside any valid insertion zone to cancel;
- dropping at the outpost’s effective original position as a no-op.

Cancellation must:

- leave the outpost order unchanged;
- create no Undo history entry;
- clear all active drag UI state;
- remove the insertion marker;
- remove source-row drag styling;
- clear the transient status hint.

### 8. Drop/index semantics

A valid drop must place the dragged outpost exactly where the insertion marker indicates.

Be careful about index calculation when dragging downward.

Example:

```text
A
B  <- dragging
C
D
```

If the insertion marker is between `C` and `D`, the final result must be:

```text
A
C
B
D
```

not an off-by-one result caused by calculating the target index before removing `B`.

The insertion marker must represent the **final resulting position**, not an intermediate array index.

### 9. Successful reorder semantics

A successful drag-and-drop reorder must use the same underlying persisted ordering model as the existing arrow controls.

Do not create a second ordering model.

A successful drop must:

- reorder the `outposts` array;
- preserve stable outpost IDs;
- preserve selected-outpost identity;
- create exactly one Undoable reorder action;
- clear Redo according to existing editing-session rules when appropriate.

Do not create history entries for drag movement itself.

Only the completed valid drop is an edit.

### 10. Undo / Redo

Undo and Redo must continue to work regardless of whether Reshuffle mode is currently active or locked.

After a drag reorder:

- Undo restores the previous outpost order in one step;
- Redo reapplies the drag reorder in one step.

Reshuffle mode remains presentation-only and must not enter history.

### 11. Transient drag hint in the status bar

While a drag is active, show a transient interaction hint in the existing status bar.

Use wording such as:

```text
Drop to reorder · Esc to cancel
```

The hint should:

- appear only during an active drag;
- disappear when the drag completes or is cancelled;
- be presentation-only;
- not be persisted;
- not enter Undo/Redo history.

The hint must **not overwrite or suppress persistent error information**.

If the current StatusBar component does not cleanly support simultaneous interaction hints and existing error/action feedback, make the **smallest isolated change necessary** to add a transient informational hint channel.

Do not redesign the entire status bar in this batch.

Do not reorganize validation, version/reference status, errors, or other status-bar concerns unless a minimal wiring change is required.

A broader status-bar information hierarchy/layout review is deferred.

### 12. Existing arrow controls

Keep the existing up/down reorder controls fully functional in Reshuffle mode.

Do not remove or replace them.

They remain:

- a precise one-step reorder mechanism;
- a keyboard/accessibility-friendly alternative;
- based on the same outpost array order;
- Undoable in the same way as before.

---

## Presentation-state scope

Active drag state is presentation/session state only.

Possible presentation state includes:

- which outpost is currently being dragged;
- the current candidate insertion position;
- whether the pointer is over a valid drop zone;
- the transient status-bar drag hint.

None of this belongs in:

- `OutpostNetwork`;
- browser storage;
- JSON export;
- domain models;
- Undo/Redo history.

Only the completed outpost array reorder is persisted/history-bearing.

---

## Non-goals

Do not implement any of the following in this batch:

- independent navigation-panel scrolling;
- drag auto-scroll;
- edge-triggered scrolling;
- snapping to top/bottom when the pointer leaves the list;
- live sortable-list preview/reflow;
- cargo-pad drag-and-drop;
- cargo-pad Reshuffle mode;
- Outpost Details redesign;
- outpost-name validation;
- status-bar redesign;
- new persisted fields;
- schema changes;
- new drag-and-drop dependencies unless absolutely necessary.

Prefer platform/native browser drag-and-drop or a small local implementation if that is sufficient.

Do not introduce a dependency merely for convenience.

---

## Architecture constraints

Follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`

In particular:

- `outposts` array order remains authoritative;
- stable IDs remain identity;
- presentation state stays outside the persisted model;
- one deliberate reorder equals one history entry;
- no-op operations should not create history entries;
- reuse existing reorder/editing-session pathways where practical;
- avoid duplicating reorder semantics in UI-only state.

If the current move-up/down implementation is too specialized for direct reuse, extract the smallest shared reorder primitive needed rather than creating unrelated parallel logic.

---

## Acceptance criteria

### Basic activation

1. Load the app.
   - Reshuffle mode starts locked.
   - Drag handles cannot initiate dragging.

2. Click `Reshuffle`.
   - Drag handles become active.
   - Existing arrow controls remain visible and functional.

3. Click `Lock order`.
   - Dragging becomes unavailable again.

### Drag initiation

4. Attempt to drag using the outpost name or row body.
   - Drag does not start.

5. Drag using the enabled drag handle.
   - Drag begins.
   - Source row remains in its original location.
   - Source row shows a clear but subtle active-drag state.
   - Status bar shows `Drop to reorder · Esc to cancel` or equivalent.

### Stable list and insertion feedback

6. Drag an outpost through several positions.
   - Other outpost rows do not jump or reorder.
   - Exactly one insertion marker moves between rows.
   - The marker clearly indicates the final drop position.

7. Drag to the valid area before the first row.
   - Marker appears above the first row.
   - Dropping moves the outpost to the first position.

8. Drag to the valid area after the last row.
   - Marker appears below the last row.
   - Dropping moves the outpost to the last position.

### Invalid/outside-list behaviour

9. Drag upward from the first valid insertion position into the heading/action area.
   - Insertion marker disappears.
   - Releasing cancels.
   - Outpost order does not change.

10. Drag below the bottom valid list region into unrelated UI.
    - Insertion marker disappears.
    - Releasing cancels.
    - Outpost order does not change.

11. Move the pointer from an invalid area back into a valid insertion zone.
    - Marker reappears at the appropriate valid position.
    - Releasing there commits the reorder.

### Cancellation

12. Start a drag and press `Escape`.
    - Drag cancels immediately.
    - No order change occurs.
    - No history entry is created.
    - Marker/source styling/status hint are cleared.

13. Start a drag and release outside valid drop zones.
    - Drag cancels cleanly.
    - No history entry is created.

14. Drop at the effective original position.
    - Order remains unchanged.
    - No history entry is created.

### Index correctness

15. Test downward movement across multiple rows.
    - Final position exactly matches the insertion marker.
    - No off-by-one behaviour occurs.

16. Test upward movement across multiple rows.
    - Final position exactly matches the insertion marker.

### Undo / Redo

17. Complete one valid drag reorder.
    - One Undo restores the exact previous order.
    - One Redo reapplies the reorder.

18. Repeat Undo/Redo while Reshuffle mode is locked.
    - Ordering still restores/reapplies correctly.
    - Reshuffle state does not change.

### Status bar

19. During drag:
    - transient drag hint is visible.

20. End/cancel drag:
    - transient drag hint disappears.

21. With an existing persistent error/action state present:
    - drag hint does not overwrite or suppress persistent error information.

### Persistence / regression

22. Export JSON after drag reorder.
    - outpost array order reflects the completed reorder;
    - no drag/presentation state is exported.

23. Reload the app.
    - completed outpost order persists according to existing storage behaviour;
    - no active drag state persists;
    - Reshuffle mode starts locked.

24. Existing arrow reordering continues to work as before.

25. `npm run build` passes.

26. Run targeted lint/checks on changed files. If full `npm run lint` still fails only because of known pre-existing unrelated errors, report that explicitly rather than broadening scope.

---

## Implementation guidance

Inspect the current:

- `OutpostList` component;
- `OutpostList.css`;
- App/reorder callbacks;
- editing-session/history path;
- `StatusBar` component and its current feedback props/state;

before changing code.

Prefer a simple, explicit drag state machine over clever implicit behaviour.

The key interaction states should be easy to reason about:

1. idle;
2. dragging with no valid drop target;
3. dragging with a valid insertion target;
4. commit valid drop; or
5. cancel.

Do not mutate persisted order during pointer movement.

Compute and display candidate placement separately, then perform the actual reorder only when a valid drop completes.

Ensure cleanup occurs for all drag termination paths, including:

- valid drop;
- invalid drop;
- Escape;
- browser drag-end events.

Use the smallest coherent set of changes that satisfies the brief.

Do not commit or push changes.
