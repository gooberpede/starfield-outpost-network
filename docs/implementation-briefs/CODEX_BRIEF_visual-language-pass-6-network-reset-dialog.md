# Codex Implementation Brief — Visual Language Pass 6: Network Reset Confirmation Dialog

## Objective

Replace the current native browser confirmation for resetting the active network with an **application-owned confirmation dialog** that matches the established visual language.

The current native browser confirm dialog:

```text
localhost:5173 says
Delete this network and start again?
OK / Cancel
```

should be removed from this workflow.

The replacement should be:

- centered in the viewport;
- flat and two-dimensional;
- pale;
- square / near-square;
- thin-bordered;
- shadowless;
- explicit in wording;
- safe in keyboard behavior;
- visually consistent with the rest of the application.

This pass should also establish a modest, reusable visual pattern for future simple confirmation dialogs.

---

## 1. Read repository guidance first

Before editing, inspect the repository and relevant guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
BACKLOG.md
```

Also inspect:

```text
Delete Network / reset-network handler
current native confirm() usage
Undo/Redo integration
selection-reset behavior
existing visual tokens
existing button/focus styles
any existing modal/dialog component
```

Preserve current network-reset semantics.

---

## 2. Hard scope boundary

### In scope

Implement an application-owned modal confirmation for the current reset-network action, including:

```text
dialog markup/component
backdrop
title treatment
message copy
Cancel button
Reset Network button
focus behavior
Escape handling
focus trapping
visual styling
```

A small reusable modal/confirm component is acceptable if it remains simple.

### Out of scope

Do **not**:

```text
expose multi-network UI
add universe/network labels
change persistence schema
change reset semantics
change Undo/Redo semantics
redesign validation
alter import/export flows
migrate other confirmations
```

Do not build a large generic modal framework.

---

## 3. Preserve current reset behavior exactly

The current action resets the contents of the current network rather than removing the saved collection entry.

Preserve existing behavior, including:

- clear current character/outposts/etc.;
- preserve the stable network slot/id;
- clear selected-outpost UI state as currently implemented;
- create one undoable network replacement;
- allow Undo to restore the previous state and selected outpost where possible;
- leave inactive collection entries unaffected.

The dialog is confirmation only.

---

## 4. User-facing wording

Do **not** mention:

```text
universes
multiple networks
network slots
active network IDs
```

The current UI does not expose multi-network functionality.

Use this copy:

### Title

```text
RESET NETWORK
```

### Message

```text
Reset the current network?

This will clear the character and all outposts in the current network.

You can undo this action during the current session.
```

### Buttons

```text
Cancel
Reset Network
```

Do not use `OK`.

Do not use the old wording `Delete this network and start again?`.

The visible top-level trigger may remain labelled `Delete Network` in this pass unless changing it is clearly safe and desirable; report any such change explicitly.

---

## 5. Visual character

Target:

```text
flat
technical
restrained
centered
pale
square
thin-bordered
no shadow
```

Avoid:

```text
rounded-card styling
large soft shadows
glow
dark-theme modal treatment
oversized alert iconography
generic browser-dialog appearance
```

Use the existing `--ui-*` palette and typography.

No new palette should be introduced.

---

## 6. Dialog surface

Preferred:

- `Highlight` or `Surface` background;
- thin `Rule / border`;
- square / near-square geometry;
- Structural-dark / Primary text;
- no drop shadow.

Use border and backdrop contrast for separation.

---

## 7. Backdrop

Use a restrained modal backdrop:

- semi-transparent dark/neutral overlay;
- low opacity;
- no dramatic blur;
- no near-black dimming.

The backdrop should clearly indicate that the underlying application is temporarily blocked.

Clicking the backdrop should **not** dismiss the dialog.

---

## 8. Positioning

Center the dialog in the viewport.

Requirements:

```text
center horizontally
center vertically
remain centered while page beneath is scrolled
```

Do not anchor it to the trigger button.

---

## 9. Width and density

Keep the dialog compact.

A practical width around:

```text
22–28rem
```

is appropriate if the copy fits well.

Use compact but comfortable spacing.

The dialog only needs:

```text
title
message
two buttons
```

---

## 10. Title treatment

Use:

```text
RESET NETWORK
```

with:

- Barlow Semi Condensed;
- uppercase;
- restrained tracking;
- Primary text / Structural dark.

A small partial rail or thin title separator is acceptable.

Do **not** use a full red title bar.

---

## 11. Message treatment

Use normal UI text, not all caps.

The three parts should read clearly:

1. the question;
2. the consequence;
3. the Undo reassurance.

The Undo sentence may be slightly muted if still clearly legible.

Do not add unnecessary warning prose.

---

## 12. Button order

Use:

```text
Cancel    Reset Network
```

with the destructive action on the right.

---

## 13. Cancel button

Cancel is the safe/default action.

Preferred treatment:

```text
pale neutral control
Primary text
Rule / border
square / near-square
```

Initial keyboard focus should go to **Cancel**.

---

## 14. Reset Network button

Use the existing Critical token:

```text
#C75452
```

The destructive action should be visibly distinct but restrained.

Avoid glow or an oversized red treatment.

Ensure sufficient contrast.

---

## 15. Keyboard behavior

Lock in:

### Escape

```text
Esc = Cancel
```

### Enter

Do **not** make Enter automatically trigger `Reset Network` from the initial dialog state.

Initial focus is Cancel.

If `Reset Network` is explicitly focused, ordinary Enter/Space activation may proceed.

### Tab

Focus must remain trapped within the modal while open.

Tab / Shift+Tab should cycle through dialog controls only.

---

## 16. Focus management

When opening:

1. remember the triggering element;
2. move focus into the modal;
3. focus `Cancel`.

When closing through Cancel/Escape:

- return focus to the original trigger where practical.

After confirmed reset:

- preserve sensible focus;
- do not leave focus lost on `<body>` if avoidable.

Use the existing application-owned focus ring.

---

## 17. Modal semantics / accessibility

Use appropriate semantics, such as:

```text
role="dialog"
aria-modal="true"
aria-labelledby
aria-describedby
```

or a semantic `<dialog>` implementation if it integrates cleanly.

Ensure title and descriptive copy are programmatically associated.

Do not use native browser `confirm()`.

---

## 18. Background interaction

While open:

- block pointer interaction with the app beneath;
- keep keyboard focus inside the dialog;
- do not change persistent state merely by opening/canceling.

If practical, prevent background scrolling without causing layout jumps. Keep scroll-lock implementation minimal and report the chosen behavior.

---

## 19. No shadow / no required warning icon

The design decision is explicit:

> **No drop shadow.**

Also do not add a large warning icon unless an established dialog icon language already exists.

The title, copy, and Critical action are sufficient.

---

## 20. Reusability

This dialog may become the visual pattern for future confirmations.

A small reusable `ConfirmDialog` or `Modal` component is acceptable if it simplifies the code.

Do not migrate unrelated flows in this pass.

---

## 21. Verification

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

### Manual smoke tests

Verify:

```text
open dialog from Delete Network
dialog centered
underlying UI blocked
Cancel closes without state change
Esc closes without state change
backdrop click does not close
initial focus lands on Cancel
Tab / Shift+Tab remain inside dialog
Reset Network performs current reset behavior
Undo restores previous network state
no native browser confirm appears
no console warnings/errors
```

Also test opening the dialog while the page is scrolled.

Confirm closing does not unexpectedly reposition the page.

---

## 22. Visual review checklist

Before completion, confirm:

1. dialog looks like part of the app;
2. flat and shadowless;
3. centered;
4. backdrop is restrained;
5. title is clear without becoming a red alert banner;
6. wording is precise and appropriate to current single-network-facing UI;
7. Cancel and Reset Network are explicit;
8. destructive action is distinct but not garish;
9. Cancel receives initial focus;
10. Escape cancels;
11. backdrop click does nothing;
12. focus trapping works;
13. native browser confirmation is gone from this workflow.

---

## 23. Deliverable report

Report:

```text
files changed
component/dialog structure added
native confirm removal
dialog copy used
visual styling
backdrop behavior
focus management
keyboard behavior
scroll behavior
tests/checks run
manual smoke-test results
```

Explicitly state whether:

- network-reset semantics changed;
- Undo/Redo behavior changed;
- any other confirmation flow changed;
- any out-of-scope component changed visually;
- the trigger label changed.

Do not commit or push unless explicitly asked.

---

## 24. Suggested commit message

If accepted:

```text
feat: add network reset confirmation dialog
```

---

## 25. Final instruction

Replace the browser-native confirmation with a **small, reusable, application-owned destructive-confirmation pattern**.

Prefer:

```text
precision
restraint
safe interaction
explicit wording
visual consistency
```

over decorative treatment or framework-heavy abstraction.
