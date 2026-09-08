# Codex Implementation Brief — Validation Navigation and Planned Supply Info

## Objective

Implement the next Validation batch:

1. make actionable validation rows navigate to their affected outpost;
2. make the Validation panel fully keyboard-operable;
3. add one Info-level Planned Supply summary issue per outpost.

This is a focused interaction/domain-validation pass.

Do **not** add deep target highlighting, auto-expansion, auto-scrolling, or new workspace navigation behavior beyond selecting the affected outpost.

---

# PART A — READ PROJECT GUIDANCE FIRST

Before editing, inspect:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially:

```text
src/ui/components/ValidationSummary.tsx
src/ui/components/ValidationSummary.css
src/domain/validation/validateNetwork.ts
src/domain/validation/types.ts
src/domain/validation/registry.ts
src/App.tsx
```

Also inspect:

- current validation issue metadata;
- existing focus styles;
- current panel open/close behavior;
- existing Escape/keyboard handling patterns elsewhere in the app;
- tests covering validation and selected-outpost behavior.

---

# PART B — LOCKED VALIDATION NAVIGATION SEMANTICS

## 1. Actionable issue rows

Any validation issue with a valid `outpostId` is actionable.

Clicking **anywhere on the issue row** should:

```text
select the affected outpost
```

It should **not** close the Validation panel.

If the affected outpost is already selected, activation should be a harmless no-op.

Issues without a navigable `outpostId` remain read-only/non-interactive.

Do not invent fake navigation targets.

---

## 2. Keep the panel open

The Validation panel is a persistent diagnostic/work list, not a one-shot menu.

Activating an issue:

- selects the outpost;
- keeps the panel open;
- keeps keyboard focus within the Validation panel if activation came from keyboard;
- allows the user to continue through the issue list.

Do not auto-dismiss the panel after activation.

---

## 3. Navigation abstraction

Do not directly hard-wire validation-row click handlers to workspace selection logic inside the Validation component.

Prefer a callback abstraction such as conceptually:

```ts
onNavigateToIssue(issue)
```

or equivalent.

The first implementation may only select the issue's `outpostId`.

Design the boundary so future enhancement can later use existing metadata such as:

```text
cargoPadId
productId
cargoItem
speciesId
bodyBiomeId
```

without redesigning the Validation component.

Do **not** implement precise target navigation in this pass.

---

# PART C — MOUSE INTERACTION

## 4. Whole-row hover treatment

Actionable rows should visibly indicate that they can be activated.

On mouse hover:

- highlight the entire row;
- use the existing B1 visual language;
- keep the treatment restrained;
- do not turn the row into a large conventional button;
- preserve severity rail/message layout.

Non-actionable rows should not receive misleading hover affordances.

---

## 5. Click focus behavior

Clicking an actionable row should also focus that row if practical.

Hover alone must **not** move keyboard focus.

Mouse hover and keyboard focus may share similar visual emphasis, but keyboard focus must remain independently visible.

---

# PART D — GLOBAL VALIDATION SHORTCUT

## 6. Locked shortcut

Use:

```text
Ctrl + Alt + V
```

to toggle the Validation panel.

This choice has been manually tested as inert in:

```text
Edge
Chrome
Firefox
```

on the current Windows environment.

Do not substitute another shortcut.

---

## 7. Shortcut handling rules

Handle only:

```text
keydown
```

Ignore repeating events:

```ts
event.repeat === true
```

Do not handle the shortcut while focus is inside editable controls:

```text
input
textarea
select
editable contenteditable
```

In those cases:

- leave the event untouched;
- do not call `preventDefault()`.

When the app **does** handle `Ctrl+Alt+V`, call `preventDefault()`.

Use a simple, predictable editable-target guard.

---

## 8. Shortcut toggle behavior

`Ctrl+Alt+V` is a true toggle:

### Panel closed

```text
open panel
```

### Panel open

```text
close panel
```

If closing while keyboard focus is inside the Validation panel, restore focus to the Validation trigger.

---

# PART E — KEYBOARD NAVIGATION INSIDE THE PANEL

## 9. Opening from keyboard

When the panel is opened with `Ctrl+Alt+V`:

- move focus to the first actionable issue;
- if there are no actionable issues, keep or return focus to the Validation trigger.

When the panel is opened by mouse click on the Validation trigger:

- preserve normal mouse behavior;
- do not forcibly move focus into the issue list merely because the panel opened.

---

## 10. Roving focus

Use a roving-focus pattern for actionable issue rows.

Do **not** make every row a permanent Tab stop.

Conceptually:

```text
one actionable issue row has tabIndex=0
other actionable issue rows have tabIndex=-1
non-actionable rows are not in the roving set
```

Maintain a sensible active/focused row while the panel remains open.

---

## 11. Arrow-key navigation

While focus is on an actionable issue row:

```text
ArrowDown
```

moves focus to the next actionable issue.

```text
ArrowUp
```

moves focus to the previous actionable issue.

Do not navigate onto non-actionable rows.

At boundaries, use whichever of these best matches existing application conventions:

- clamp at first/last;
- or wrap.

Prefer **clamping** unless there is a strong existing convention to wrap.

---

## 12. Home / End

While focus is inside the issue list:

```text
Home
```

moves to the first actionable issue.

```text
End
```

moves to the last actionable issue.

---

## 13. Activate issue

While an actionable issue row has focus:

```text
Enter
Space
```

activate it.

Activation:

- selects the affected outpost;
- does not close the panel;
- does not move focus into the workspace;
- keeps the issue row focused if it still exists.

Do not create Undo/Redo history for outpost selection.

---

## 14. Escape behavior

While focus is inside the Validation issue list:

```text
Escape
```

should:

- leave the issue list;
- return focus to the Validation trigger;
- keep the Validation panel open.

This is intentionally different from `Ctrl+Alt+V`, which toggles the panel closed.

Do not use Escape to dismiss the Validation panel.

---

## 15. Tab behavior

Do not create a large Tab trap.

The issue list should use roving focus and standard Tab behavior.

If focus reaches the issue row via keyboard, Tab may continue into the rest of the app normally.

Escape remains the explicit “leave the Validation list but keep it open” action.

Do not convert the panel into a modal focus trap.

---

# PART F — LIVE-UPDATE FOCUS BEHAVIOR

## 16. Issue disappears after a fix

The validation list updates live.

If the currently focused/actionable issue disappears because the user fixes it:

- move focus to the next surviving actionable issue if one exists at that position;
- otherwise move to the previous actionable issue;
- if no actionable issues remain, move focus to the Validation trigger.

Do not leave focus on a removed DOM node.

Do not preserve historical/ghost issues.

---

## 17. Issue ordering changes

If live validation updates reorder issues:

- preserve focus on the same issue identity where practical;
- otherwise fall back to a nearby valid actionable issue.

Use stable issue identity if the current validation model supports one.

If no explicit issue ID exists, derive a stable-enough key from current issue metadata without changing persistence schema.

Document the choice.

---

# PART G — PLANNED SUPPLY INFO VALIDATION

## 18. New Info-level rule

Add a validation rule that reports unresolved Planned Supply at each outpost.

The rule should emit:

```text
one Info issue per outpost
```

when that outpost has one or more Planned Supply items.

Do **not** emit one issue per item.

Do **not** emit downstream-consequence issues.

No issue is emitted when Planned Supply is empty.

---

## 19. Message wording

Use the exact semantic form:

### Singular

```text
1 item in Planned Supply: {item1}.
```

### Plural

```text
{N} items in Planned Supply: {item1}, {item2}, ... {itemN}.
```

Use:

- full player-facing names;
- alphabetical ordering by full name;
- stable deterministic output;
- correct singular/plural grammar.

Do not use abbreviations.

Do not truncate the list in this first implementation.

---

## 20. Severity and category

Severity:

```text
info
```

The issue should sort naturally below warnings/errors using the existing validation severity ordering.

Use the most appropriate existing validation category.

Prefer an existing category over inventing a new taxonomy unless genuinely necessary.

A likely rule ID is:

```text
planned-supply-unresolved
```

but use project naming conventions if another identifier is more consistent.

---

## 21. Actionability

The Planned Supply Info issue must carry the affected:

```text
outpostId
```

so it behaves like other actionable outpost-scoped issues.

Clicking or keyboard-activating it:

- selects that outpost;
- keeps the Validation panel open.

Do **not** auto-expand Planned Supply in this pass.

---

# PART H — PRESENTATION

## 22. Actionable-row visual states

Add only the minimum styling needed for:

```text
hover
focus
focus-visible
```

for actionable rows.

Use current B1 tokens.

Preserve:

- flat diagnostic-row geometry;
- severity rail;
- square/technical language;
- no shadows;
- no rounded-card treatment.

Keyboard focus should use the established Structural-dark focus grammar.

Do not alter severity colors or panel geometry unless necessary.

---

## 23. Cursor

Actionable rows may use:

```text
cursor: pointer
```

or the project's established equivalent.

Non-actionable rows should retain neutral cursor behavior.

---

# PART I — ACCESSIBILITY

## 24. Use appropriate interactive semantics

Do not create inaccessible clickable `<div>` behavior.

Use an appropriate interactive element or equivalent semantics that support:

- keyboard focus;
- Enter/Space activation;
- accessible name;
- predictable focus handling.

Preserve the issue message/context text as the user-facing label.

Do not add unnecessary ARIA roles if native semantics are sufficient.

---

## 25. Panel semantics

Do not convert the Validation panel into:

```text
menu
listbox
dialog
modal
```

unless the current structure genuinely requires one of those roles.

It remains a persistent non-modal diagnostic panel with keyboard-operable rows.

Avoid ARIA patterns that imply selection semantics the panel does not actually have.

---

# PART J — EXPLICITLY OUT OF SCOPE

## 26. Do not implement

Do not add:

```text
automatic scrolling to the exact offending control
automatic expansion of Cargo Pads
automatic expansion of Planned Supply
specific manufacturing-row highlighting
specific resource-cell highlighting
temporary flash/highlight in workspace
validation history
issue dismissal
issue suppression
issue grouping UI changes
new panel close behavior
new pane resizing
new outpost keyboard navigation
```

Do not change:

```text
responsive workspace sizing
Cargo ellipsization
multiple-network behavior
throughput logic
manufacturing availability semantics
Planned Supply persistence semantics
```

---

# PART K — TESTING

## 27. Automated tests

Add focused tests for:

### Validation navigation

- actionable issue invokes navigation callback with the correct issue/outpost;
- non-actionable issue does not navigate;
- panel remains open after issue activation.

### Planned Supply Info rule

Test:

```text
0 items -> no issue
1 item -> singular wording
multiple items -> plural wording
alphabetical ordering
full names
severity = info
correct outpostId
```

### Keyboard behavior

Where practical with the existing test setup, cover:

```text
ArrowUp
ArrowDown
Home
End
Enter
Space
Escape
```

and roving `tabIndex`.

### Shortcut

Cover:

```text
Ctrl+Alt+V opens panel
Ctrl+Alt+V closes panel
repeat ignored
editable targets ignored
handled event prevents default
```

Do not overfit tests to incidental DOM structure.

---

## 28. Standard checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

---

# PART L — BROWSER SMOKE TEST

## 29. Manual/runtime verification

Verify in the actual app:

### Mouse

- open Validation;
- hover actionable row;
- full row highlights;
- click row;
- affected outpost becomes active;
- panel remains open.

### Keyboard shortcut

Verify `Ctrl+Alt+V` in:

```text
Edge
Chrome
Firefox
```

if practical.

Confirm:

- opens;
- closes;
- no browser action occurs;
- no repeated rapid toggling.

### Editable controls

With focus in:

```text
input
select
```

confirm `Ctrl+Alt+V` is ignored.

### Issue navigation

Verify:

```text
ArrowUp
ArrowDown
Home
End
Enter
Space
Escape
```

Confirm:

- navigation skips non-actionable rows;
- activation selects outpost;
- activation keeps focus in the panel;
- Escape returns focus to Validation trigger but leaves panel open.

### Live issue removal

Fix an issue while the panel remains open and confirm focus does not become lost.

### Planned Supply Info

Create an outpost with Planned Supply and confirm:

```text
Info issue appears
correct singular/plural wording
alphabetical full-name list
click selects outpost
issue disappears when Planned Supply becomes empty
```

---

# PART M — DOCUMENTATION

## 30. Update durable UX documentation

Update `docs/UX-DESIGN.md` if needed to capture the settled reusable interaction pattern:

- Validation rows may be actionable;
- actionable rows navigate to outpost context;
- panel remains open after activation;
- keyboard navigation uses roving focus;
- `Ctrl+Alt+V` toggles Validation;
- Escape leaves the issue list without closing the panel.

Update `docs/BACKLOG.md` only to remove/rewrite items that this implementation completes.

Do not turn future exact-target highlighting/navigation into current requirements.

---

# PART N — COMPLETION REPORT

## 31. Report

On completion, report:

```text
files changed
validation navigation callback/API
row interaction semantics
hover/focus styling
roving-focus implementation
Ctrl+Alt+V implementation
editable-target guard
Escape behavior
live-update focus handling
Planned Supply Info rule
message examples
tests added/updated
browser smoke-test results
documentation changes
```

Explicitly state whether:

- panel close behavior changed after row activation;
- any workspace highlighting/scrolling was added;
- persistence schema changed;
- validation issue schema changed;
- any non-Validation feature behavior changed.

Do not commit or push unless explicitly asked.

---

## 32. Suggested commit message

If accepted:

```text
feat: add validation navigation and planned supply info
```

---

## 33. Final instruction

This batch should make Validation useful as a **persistent navigable diagnostic worklist**.

The minimum successful outcome is:

```text
Ctrl+Alt+V opens Validation
keyboard and mouse can navigate issues
activating an issue selects its outpost
panel stays open
Planned Supply appears as one Info summary per affected outpost
```

Do not extend the work into exact workspace target navigation yet.
