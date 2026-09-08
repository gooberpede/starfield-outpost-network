# Codex Implementation Brief — Navigation Width, Collapse/Reopen, and Global Shortcuts

## Objective

Implement the next Navigation batch as one coherent UX change:

1. widen the visible Navigation pane to the audited target;
2. add true collapse/reopen behavior;
3. add global shortcuts for New Outpost, Previous Outpost, and Next Outpost.

The result should make Navigation genuinely useful when visible, completely reclaimable when not needed, and operable without reopening for common actions.

Do **not** add manual pane resizing in this pass.

## Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially:

```text
src/App.tsx
src/ui/layout/WorkspaceLayout.tsx
src/ui/layout/WorkspaceLayout.css
src/ui/components/OutpostList.tsx
src/ui/components/OutpostList.css
```

Also inspect the existing global Validation shortcut implementation and reuse its interaction rules where appropriate.

Existing shortcut:

```text
Ctrl+Alt+V — Validation
```

Do not duplicate shortcut-handling logic unnecessarily if a reusable helper/pattern already exists.

---

# A. Visible Navigation width

## 1. Adopt the audited width

Use:

```text
17.5rem
```

for the normal visible Navigation pane.

At the normal 18px root size this is approximately:

```text
315px
```

The audit established this width so realistic 25-character Starfield outpost names remain fully readable even in Reshuffle mode without shrinking the drag handle, move controls, font, row height, or focus outlines.

## 2. Keep the same width in Locked and Reshuffle modes

Remove the current mode-dependent outer Navigation sizing.

Do not keep separate track minima such as:

```text
10rem Locked
13rem Reshuffle
```

Preferred direction:

```css
minmax(17.5rem, 3fr)
```

using the actual existing workspace grid.

The pane should not visibly change width merely because Reshuffle controls appear.

## 3. Preserve current row geometry

Do not miniaturize or redesign:

```text
drag gutter
move-up control
move-down control
selected marker
name font treatment
row height
focus styling
```

The audit found those controls are not the problem.

Keep ellipsis/title fallback for:

```text
modded names over 25 characters
pathological wide-glyph names
other genuinely extreme cases
```

---

# B. True collapse

## 4. Collapse model

Implement a **true collapse**.

When collapsed:

- the Navigation pane disappears;
- its 17.5rem workspace track is removed;
- its normal inter-pane gap should also disappear where practical;
- no miniature icon rail remains.

The reclaimed space should become available to the selected-outpost workspace.

## 5. Reopen affordance

Leave only a **very narrow persistent reopen control** at the left edge of the workspace.

Conceptually:

```text
Visible:
┌───────────────────────────────┐
│ OUTPOSTS              11/16 ‹ │
│ + Add Outpost                 │
│ ...                           │
└───────────────────────────────┘

Collapsed:
│ › │ Resource Matrix ...
```

The collapsed-state affordance should be:

```text
obvious
compact
keyboard reachable
visually quiet
consistent with B1 styling
```

It should not become an icon rail or miniature Navigation pane.

## 6. Open-state collapse control

Place a compact collapse control in the Navigation heading area, preferably at the far right of the heading/count row.

It should remain visually subordinate to:

```text
Add Outpost
Reshuffle / Lock order
```

Use clear accessible labels:

```text
Hide outpost navigation
Show outpost navigation
```

Use existing directional glyph/icon conventions where suitable.

---

# C. Presentation state

## 7. Collapse state is presentation-only

The open/collapsed state:

- must not be persisted in `OutpostNetwork`;
- must not mutate domain data;
- must not create Undo/Redo history;
- must not require schema changes.

For V1, keep it session-local unless an existing ephemeral UI-state mechanism clearly applies.

Do not add new persistence solely for this feature.

## 8. Preserve selection

Collapsing or reopening Navigation must not change:

```text
selected outpost
outpost order
cargo state
planned supply
validation state
```

Only presentation changes.

---

# D. Reshuffle interaction

## 9. Collapsing exits Reshuffle mode

If Navigation is in Reshuffle mode when collapsed:

- exit Reshuffle;
- return Navigation to ordinary Locked mode before/while collapsing.

Reason:

> Reshuffle is an interaction mode whose controls cease to exist when Navigation disappears.

Do not retain hidden reorder-mode state.

When Navigation is reopened, it should open in Locked mode.

This remains presentation-only and must not create Undo/Redo history.

---

# E. Focus behavior

## 10. Collapse focus transfer

If the user activates **Hide outpost navigation**:

- collapse Navigation;
- move focus to the newly exposed **Show outpost navigation** control.

Do not allow focus to disappear with the removed DOM subtree.

## 11. Reopen focus transfer

If the user activates **Show outpost navigation**:

- reopen Navigation;
- move focus to the restored **Hide outpost navigation** control.

Preserve normal tab order afterward.

Do not introduce a focus trap.

---

# F. Global shortcuts

## 12. Locked shortcut vocabulary

Implement:

```text
Ctrl+Alt+N     — Add new outpost
Ctrl+Alt+Up    — Select previous outpost
Ctrl+Alt+Down  — Select next outpost
Ctrl+Alt+V     — Validation (existing; unchanged)
```

The new shortcuts were manually checked in Edge, Chrome, and Firefox and appeared unused there.

Known external caveat:

```text
Ctrl+Alt+Arrow combinations may have legacy/third-party OS or graphics-driver bindings on some systems.
```

Do not reject the shortcuts for that reason; just avoid implying they are universally collision-free outside the browser.

## 13. Reuse Validation shortcut interaction rules

The new shortcuts should follow the existing Validation rules:

- ignore when focus is inside `input`, `textarea`, `select`, or editable/contenteditable regions;
- ignore auto-repeat;
- call `preventDefault()` only when the app actually handles the shortcut;
- do not interfere with ordinary typing/editing.

If the Validation shortcut already uses a helper such as an editable-target guard, reuse it.

---

# G. Ctrl+Alt+N — New Outpost

## 14. Use the existing creation path

`Ctrl+Alt+N` must invoke the same application/domain path as clicking:

```text
+ Add Outpost
```

Do not create a second implementation.

Expected semantics:

- creates exactly one new outpost;
- uses the same defaults;
- uses the same history-aware path;
- produces the same selection behavior;
- produces the same validation behavior;
- preserves existing Undo/Redo semantics.

The shortcut must work whether Navigation is open or collapsed.

Do not automatically reopen Navigation solely because a new outpost was added.

---

# H. Ctrl+Alt+Up / Down — Previous and Next

## 15. Previous Outpost

`Ctrl+Alt+Up` selects the outpost immediately before the current selected outpost in the current Navigation order.

This is selection/presentation behavior only.

It must not:

- reorder anything;
- create Undo/Redo history;
- mutate network domain data.

## 16. Next Outpost

`Ctrl+Alt+Down` selects the outpost immediately after the current selected outpost in the current Navigation order.

Apply the same rules as Previous.

## 17. Boundary behavior

Use **clamped boundaries**, not wraparound.

At the first outpost:

```text
Ctrl+Alt+Up => no-op
```

At the last outpost:

```text
Ctrl+Alt+Down => no-op
```

Do not wrap first ↔ last.

If the app guarantees a selected outpost whenever outposts exist, preserve that invariant. If not, use the safest existing selection semantics rather than inventing a surprising jump.

## 18. Shortcuts work while Navigation is hidden

This is a core requirement.

When Navigation is collapsed:

```text
Ctrl+Alt+N
Ctrl+Alt+Up
Ctrl+Alt+Down
```

must continue to function.

---

# I. No collapse shortcut yet

## 19. Do not add a global show/hide shortcut

Do not introduce a keyboard shortcut for collapsing/reopening Navigation in this batch.

The visible controls plus Add/Previous/Next shortcuts are sufficient for V1.

---

# J. Workspace layout

## 20. Visible state

When Navigation is open:

- use the audited 17.5rem visible width;
- preserve the current Matrix/Cargo relationship;
- do not change Cargo pane width rules.

## 21. Collapsed state

When Navigation is collapsed:

- remove its main workspace track;
- remove/reduce its associated inter-pane gap so the reclaimed space is useful;
- allow the selected-outpost workspace to expand naturally.

Do not:

```text
change Resource Matrix internal column geometry
change Cargo pane internal layout
add manual resizing
```

The recent Matrix compression work should simply benefit from the additional available width.

---

# K. Visual behavior

## 22. Animation is optional

Do not make a sliding animation a requirement.

A short CSS transition is acceptable only if it is trivial, does not create awkward intermediate grid states, does not impair focus, and respects reduced-motion preferences where applicable.

An instant layout change is completely acceptable.

Prioritize reliable width reclamation over animation polish.

## 23. B1 visual language

Collapse/reopen controls should follow the existing app language:

```text
pale surfaces
square / near-square geometry
thin rules
quiet structural emphasis
no glow
no decorative shadow
```

The reopen control should be easy to find without becoming visually dominant.

---

# L. Accessibility

## 24. Verify

- collapse and reopen controls are keyboard reachable;
- accessible labels clearly describe the action;
- focus transfers correctly after DOM removal/restoration;
- focus-visible styling remains clear;
- no keyboard trap exists;
- shortcuts do not fire while editing text/select/editable fields;
- Previous/Next selection remains exposed through existing selected-state semantics.

Use native buttons where appropriate.

---

# M. Browser/runtime verification

## 25. Visible Navigation

Verify at representative viewports:

```text
1440px
1280px
1100px
1024px
900px
```

Confirm:

- Navigation uses the intended stable visible width where layout permits;
- Reshuffle no longer narrows the pane relative to Locked mode;
- realistic 25-character names remain readable/full in Reshuffle;
- no controls overlap.

## 26. Collapse behavior

Verify:

```text
open -> collapse
collapse -> reopen
collapse while Reshuffle active
selected outpost retained
workspace width reclaimed
Resource Matrix expands
Cargo remains valid
```

Confirm there is no stale hidden Reshuffle mode after reopening.

## 27. Focus behavior

Keyboard-test:

```text
focus Hide Navigation
activate
focus lands on Show Navigation

focus Show Navigation
activate
focus lands on Hide Navigation
```

Also Tab through surrounding controls before and after collapse.

## 28. Shortcut verification

Test all new shortcuts in:

```text
Edge
Chrome
Firefox
```

### Ctrl+Alt+N

Verify:

```text
creates exactly one outpost
uses existing creation path
works open
works collapsed
does not fire in text/select/editable controls
does not repeat while held
```

### Ctrl+Alt+Up / Down

Verify:

```text
moves one outpost at a time
follows current Navigation order
works open
works collapsed
clamps at first/last
creates no Undo/Redo history
does not fire in text/select/editable controls
does not repeat while held
```

### Ctrl+Alt+V

Confirm existing Validation behavior remains unchanged.

---

# N. Tests

## 29. Add focused automated coverage

At minimum, cover where practical:

```text
editable-target exclusion
repeat suppression
Ctrl+Alt+N recognition
Ctrl+Alt+Up recognition
Ctrl+Alt+Down recognition
boundary clamping
previous/next ordering
```

If component-level Navigation interaction tests are available, also cover:

```text
collapse presentation state
Reshuffle exits on collapse
selection preserved
```

Avoid brittle pixel-perfect layout tests.

## 30. Run checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Also perform browser runtime verification.

---

# O. Documentation

## 31. Update `docs/UX-DESIGN.md`

Document the durable Navigation behavior concisely:

- visible Navigation is intentionally wide enough for normal 25-character names even in Reshuffle;
- visible width remains stable between Locked and Reshuffle;
- Navigation may be fully collapsed to reclaim workspace;
- collapsed state is presentation-only;
- collapse exits Reshuffle;
- a narrow reopen affordance remains available;
- global shortcuts:
  - `Ctrl+Alt+N` New Outpost
  - `Ctrl+Alt+Up` Previous Outpost
  - `Ctrl+Alt+Down` Next Outpost
- shortcuts do not activate while editing text/select/editable fields.

Do not over-document rem/pixel implementation detail unless useful.

## 32. Update `docs/BACKLOG.md` if appropriate

If backlog items currently refer to:

```text
Navigation pane width
Navigation hide/show exploration
Navigation keyboard switching
```

remove or rewrite completed portions.

Do not accidentally close unrelated future items such as:

```text
manual pane resizing
Cargo pane hide/show
broader workspace scrolling
```

---

# P. Explicitly out of scope

Do not implement:

```text
manual pane resizing
Cargo pane collapse
Cargo pane resizing
Navigation persistence across sessions
Navigation collapse keyboard shortcut
Resource Matrix redesign
Cargo Pad redesign
broader workspace scrolling changes
```

---

# Q. Completion report

## 33. Report

Provide:

```text
files changed
final visible Navigation track
how collapsed layout is represented
reopen-control implementation
focus-transfer behavior
Reshuffle-on-collapse behavior
shortcut implementation/helper structure
New Outpost shortcut result
Previous/Next boundary behavior
browser verification
tests/checks run
documentation changes
```

Explicitly state whether:

- any persisted schema changed;
- any domain rule changed;
- any Undo/Redo semantics changed;
- Cargo pane width changed;
- Resource Matrix internal layout changed;
- manual pane resizing was introduced.

Do not commit or push unless explicitly asked.

## 34. Suggested commit message

If accepted:

```text
feat: add collapsible outpost navigation
```

## 35. Final instruction

Implement Navigation as:

> **Wide enough to be genuinely useful when visible, completely reclaimable when hidden, and operable through consistent global shortcuts for common outpost actions.**

The visible pane should support realistic 25-character outpost names even in Reshuffle mode. The hidden state should reclaim the pane’s workspace without changing domain state or selection.
