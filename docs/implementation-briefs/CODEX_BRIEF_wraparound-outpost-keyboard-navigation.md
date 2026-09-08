# Codex Follow-up Brief — Wraparound Outpost Keyboard Navigation

## Objective

Refine the newly implemented global outpost-navigation shortcuts so that keyboard movement wraps around the outpost list instead of clamping at the first/last item.

Also update `docs/UX-DESIGN.md` to document the settled circular-navigation behavior.

This is a very small follow-up to the current uncommitted Navigation batch.

Do not change the collapse/reopen behavior, visible pane width, or shortcut assignments.

---

## 1. Read the current implementation

Inspect:

```text
src/App.tsx
src/ui/keyboardShortcuts.ts
tests/keyboardShortcuts.test.ts
docs/UX-DESIGN.md
```

Find the existing helper used by:

```text
Ctrl+Alt+Up
Ctrl+Alt+Down
```

The current behavior clamps at list boundaries.

Do not add a second path in `App.tsx` if the existing helper can own the semantics cleanly.

---

# PART A — WRAPAROUND SEMANTICS

## 2. Locked behavior

Keep the existing shortcut assignments:

```text
Ctrl+Alt+Up   — Previous Outpost
Ctrl+Alt+Down — Next Outpost
```

Change only the boundary behavior.

### Previous

If the currently selected outpost is the first item in current Navigation order:

```text
Ctrl+Alt+Up
```

must select the **last** outpost.

### Next

If the currently selected outpost is the last item in current Navigation order:

```text
Ctrl+Alt+Down
```

must select the **first** outpost.

The list therefore behaves as a circular sequence for keyboard switching.

---

## 3. Preserve current order

Wraparound must use the current Navigation order exactly as displayed/persisted.

Do not:

```text
sort by name
sort by ID
use creation order unless that is the current Navigation order
```

If the user has reordered outposts, keyboard cycling follows that reordered sequence.

---

## 4. Edge cases

Handle deliberately:

### Zero outposts

```text
Previous => no-op
Next => no-op
```

### One outpost

```text
Previous => no-op
Next => no-op
```

Do not create pointless reselection or history activity.

### Missing/invalid selected outpost

Use the safest existing application behavior.

Preferred approach:

- preserve the current helper/application convention if one already exists;
- do not invent a surprising wrap target merely because selection is invalid.

Report the chosen behavior.

---

# PART B — PRESERVE EXISTING SHORTCUT RULES

## 5. Do not alter interaction guards

Keep all existing global-shortcut rules:

- ignore editable targets:
  - `input`
  - `textarea`
  - `select`
  - contenteditable/editable regions;
- ignore auto-repeat;
- call `preventDefault()` only when handled;
- shortcuts work whether Navigation is open or collapsed.

Do not change:

```text
Ctrl+Alt+N
Ctrl+Alt+V
```

---

# PART C — NO HISTORY / DOMAIN EFFECT

## 6. Selection-only behavior

Previous/Next remains selection/presentation behavior.

Wraparound must not:

```text
create Undo/Redo entries
mutate outpost order
change domain data
reopen Navigation
exit/re-enter collapse state
```

Only selected-outpost presentation state changes.

---

# PART D — TESTS

## 7. Update focused tests

Replace/adjust the existing boundary-clamping tests.

Add/confirm coverage for:

```text
middle -> previous
middle -> next
first -> previous wraps to last
last -> next wraps to first
zero outposts => no-op
one outpost => no-op
reordered list wraps according to current order
```

Keep existing tests for:

```text
editable-target exclusion
repeat suppression
shortcut recognition
```

Do not add brittle UI-layout tests.

---

# PART E — UX-DESIGN.md

## 8. Update the durable shortcut rule

Find the newly added Navigation keyboard-shortcut section in:

```text
docs/UX-DESIGN.md
```

Replace any wording that says Previous/Next:

```text
clamp at the ends
stop at boundaries
```

with the settled behavior:

> `Ctrl+Alt+Up` and `Ctrl+Alt+Down` cycle through outposts in current Navigation order and wrap from first to last / last to first.

Also preserve/document that:

- the shortcuts work while Navigation is collapsed;
- they are suppressed while editing text/select/editable controls;
- they do not alter outpost order;
- they do not create Undo/Redo history.

Keep the documentation concise and principle-oriented.

---

# PART F — EXPLICITLY OUT OF SCOPE

## 9. Do not change

Do not modify:

```text
Navigation width
17.5rem track
collapse/reopen affordance
focus transfer
Reshuffle exit-on-collapse
Add Outpost shortcut
Validation shortcut
manual pane resizing
mouse/list selection behavior
arrow move controls used for reordering
```

This wraparound behavior belongs only to the global Previous/Next outpost shortcuts.

---

# PART G — VERIFICATION

## 10. Run checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Runtime-check:

```text
first outpost + Ctrl+Alt+Up => last
last outpost + Ctrl+Alt+Down => first
middle movement still correct
works with Navigation open
works with Navigation collapsed
does not fire in editable controls
```

---

# PART H — COMPLETION REPORT

## 11. Report

Provide:

```text
files changed
helper/function changed
first/last wrap semantics
zero/one-item behavior
missing-selection behavior
tests updated
UX-DESIGN wording updated
checks run
```

Explicitly state whether:

- any domain logic changed;
- any Undo/Redo semantics changed;
- Navigation collapse behavior changed;
- shortcut assignments changed.

Do not commit or push unless explicitly asked.

---

## 12. Suggested commit message

This belongs to the current uncommitted Navigation batch, so keep the planned commit:

```text
feat: add collapsible outpost navigation
```

If committed separately:

```text
fix: wrap keyboard outpost navigation
```

---

## 13. Final instruction

Refine the global Previous/Next shortcuts into circular navigation:

> **At the end of the outpost list, continuing in the same keyboard direction should wrap to the opposite end rather than stop.**
