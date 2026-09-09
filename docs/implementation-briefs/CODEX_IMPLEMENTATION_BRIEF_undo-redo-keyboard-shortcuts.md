# Codex Implementation Brief — Undo/Redo Keyboard Shortcuts

## Objective

Add conventional application-level keyboard shortcuts for the existing global contextual Undo/Redo system:

```text
Ctrl+Z       Undo
Ctrl+Y       Redo
Ctrl+Shift+Z Redo
```

The shortcuts must invoke the **same existing Undo/Redo path** as the current UI controls.

Core UX rule:

> **Typing undo should undo typing; application undo should undo application actions.**

Do not create a second history mechanism.

---

## Read first

Review:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/DOMAIN-RULES.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/BACKLOG.md
```

Inspect the current implementation of:

```text
global collection-level history
Undo/Redo controls
CollectionEditingSession
App-level keyboard/event handling
modals/dialogs
character/outpost name fields
other editable controls
```

Preserve current history semantics:

```text
whole-collection before/after snapshots
Network + Outpost working-context restoration
manual Network navigation creates no history
manual Outpost navigation creates no history
```

---

## Shortcut semantics

Implement:

```text
Ctrl+Z
Ctrl+Y
Ctrl+Shift+Z
```

Do not add other shortcuts in this batch.

Keyboard-triggered Undo/Redo must route through the same application commands as button-triggered Undo/Redo.

Do not:

```text
manipulate history arrays directly
reimplement context restoration
add shortcut-specific traversal
create history entries for shortcut use
```

---

## Editable-control exclusions

Do **not** intercept app-level Undo/Redo when the event originates from a text-editable context.

At minimum exempt:

```text
input[type="text"]
input[type="search"]
input[type="email"]
input[type="url"]
input[type="tel"]
input[type="password"]
input[type="number"]
textarea
contenteditable
```

Also handle descendants of a `contenteditable` ancestor.

If the app has custom controls that genuinely rely on native text editing, include them.

Examples:

- editing Character Name + `Ctrl+Z` => native text undo;
- editing Outpost Name + `Ctrl+Z` => native text undo;
- editing a number field + `Ctrl+Z` => native field undo.

Do **not** automatically exempt ordinary non-text controls such as:

```text
button
select
checkbox
radio
locale selector
```

On those controls, application Undo/Redo may operate normally unless a modal is open.

---

## Modal suppression

While any application modal/confirmation dialog is open, suppress application-level Undo/Redo shortcuts.

This includes current destructive dialogs such as:

```text
Delete Network
Delete Outpost
Reset
```

Requirements:

```text
modal open + Ctrl+Z       => no app Undo
modal open + Ctrl+Y       => no app Redo
modal open + Ctrl+Shift+Z => no app Redo
```

Do not close the modal automatically.

If an editable field exists inside a modal, native editing behavior must remain untouched.

Rationale:

> Undoing hidden application state underneath an open modal is more surprising than useful.

---

## Event handling

Prefer one clear global application-level keyboard listener at the narrowest sensible top-level boundary.

Avoid scattered listeners across components.

The handler should conceptually:

```text
1. inspect key/modifier combination
2. determine Undo vs Redo
3. stop app handling if a modal is open
4. stop app handling if target is editable
5. check whether the relevant history action is available
6. invoke the existing Undo/Redo command
7. call preventDefault only when the app actually handles the shortcut
```

If Undo/Redo is unavailable, do not swallow the shortcut unnecessarily.

---

## Presentation state

Keyboard Undo/Redo must inherit existing presentation behavior exactly.

Do not change:

```text
Navigation reset boundaries
Cargo reset boundaries
same-context Undo/Redo presentation preservation
stable-ID reorder continuity
```

This feature only adds another invocation path into the current history commands.

---

## Localization / visible hints

Keep current Undo/Redo controls.

If you add visible shortcut hints such as:

```text
Undo (Ctrl+Z)
Redo (Ctrl+Y)
```

route that copy through the existing localization system.

Do not redesign the controls merely for this feature.

The key chords themselves are invariant.

---

## Testing

Add focused tests for at least:

### App-level Undo

```text
Undo available
focus not editable
Ctrl+Z
=> same result as clicking Undo
```

### App-level Redo

```text
Ctrl+Y
=> Redo

Ctrl+Shift+Z
=> Redo
```

### Context restoration

Use at least one case where the historical action belongs to another Outpost or Network.

Confirm keyboard Undo/Redo restores:

```text
data
active Network
selected Outpost
```

through the existing history path.

### Editable exclusions

Confirm app Undo/Redo is not invoked for:

```text
text input
number input
textarea
contenteditable
descendant inside contenteditable
```

Where practical, confirm the app does not call `preventDefault()` in these cases.

### Non-text controls

Test at least one ordinary non-text control such as:

```text
button
select
```

and confirm app Undo/Redo remains available.

### Modal suppression

Test:

```text
modal open + Ctrl+Z
modal open + Ctrl+Y
modal open + Ctrl+Shift+Z
```

and confirm no app history traversal occurs.

### Unavailable history

Test:

```text
no Undo + Ctrl+Z
=> no app action
=> no app preventDefault

no Redo + Ctrl+Y
=> no app action
=> no app preventDefault
```

---

## Manual browser checks

Verify:

1. Make an app-level edit; `Ctrl+Z` behaves exactly like Undo button.
2. `Ctrl+Y` behaves exactly like Redo.
3. `Ctrl+Shift+Z` behaves exactly like Redo.
4. Edit Character Name; `Ctrl+Z` only undoes typing.
5. Edit Outpost Name; `Ctrl+Z` only undoes typing.
6. Open Delete Network/Delete Outpost/Reset modal; shortcuts do not traverse app history.
7. Edit on one Outpost/Network, navigate elsewhere, then keyboard Undo; Network + Outpost context restores exactly as button Undo does.

---

## Documentation

Update durable docs only where useful.

At minimum, `docs/UX-DESIGN.md` should record:

> Application Undo/Redo shortcuts use conventional key chords, but native text-editing Undo/Redo takes precedence in editable controls, and application history shortcuts are suppressed while modal dialogs are open.

Remove or update the corresponding Undo/Redo keyboard-shortcut backlog item once implemented.

Do not document DOM-selector minutiae.

---

## Out of scope

Do not:

```text
change history data structures
change history-size policy
add history timeline UI
add direct history jump
change Undo/Redo button design
add unrelated keyboard shortcuts
change modal architecture
change field commit semantics
perform accessibility/security audits
change localization architecture
commit
push
```

---

## Verification

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Report exact results.

Do not commit or push.

---

## Completion report

Report:

- implemented shortcut mappings;
- editable target detection;
- modal suppression behavior;
- confirmation that shortcuts route through the same contextual history path;
- exact test/build/lint/diff-check results;
- files changed;
- backlog/doc updates;
- any equivalent implementation deviations.

---

## Final instruction

The goal is:

> **Conventional keyboard Undo/Redo everywhere it is safe, native text-editing Undo/Redo wherever the user is editing text, and no hidden application history traversal while a modal dialog is open.**
