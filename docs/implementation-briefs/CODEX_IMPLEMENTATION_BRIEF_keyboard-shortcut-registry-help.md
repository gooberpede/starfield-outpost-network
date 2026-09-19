# Codex Implementation Brief — Keyboard Shortcut Registry, Behavior Normalization, and Help Dialog

## Objective

Implement Parcel 2 from:

```text
docs/audits/KEYBOARD-SHORTCUT-INVENTORY-AND-DISCOVERABILITY.md
```

This parcel should:

1. introduce a small declarative shortcut registry for the **existing** application shortcut set only;
2. centralize shared shortcut recognition/display policy without creating a command framework;
3. normalize modal, composition/AltGr, repeat, modifier, and editable-focus behavior;
4. define and test focus outcomes for the existing shortcut actions;
5. add localized shortcut metadata;
6. add a dedicated localized **Keyboard Shortcuts** dialog;
7. expose that dialog from a short **Help** button in the title area, so the global title controls read:

```text
[EN-GB] [Help] [About]
```

8. add focused registry/behavior/component tests;
9. update the existing shortcut-related backlog item to reflect completion of registry/discoverability work while preserving unimplemented shortcut candidates for Parcel 3.

Do **not** add new application shortcuts in this parcel.

Do **not** commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before editing:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Existing shortcut baseline

There are currently **8 chord bindings / 7 logical actions**:

```text
Ctrl+Z             Undo
Ctrl+Y             Redo
Ctrl+Shift+Z       Redo (intentional alternate binding)
/                  Focus Search for Items
Ctrl+Alt+N         Add outpost
Ctrl+Alt+ArrowUp   Previous outpost
Ctrl+Alt+ArrowDown Next outpost
Ctrl+Alt+V         Toggle Validation details
```

Do not add further chords in this parcel.

Redo must remain one logical action with two supported bindings.

---

## Architectural direction

The project should gain a **small explicit registry**, not a command bus/framework.

The registry should become the authoritative source for static shortcut metadata used by:

- recognition/matching;
- visual chord formatting;
- accessible chord formatting;
- the Keyboard Shortcuts dialog;
- registry-driven contract tests.

Effects and dynamic availability should remain in App or the owning feature/component.

Do not move domain behavior into the registry.

---

## Registry design

Use the audit as the design baseline.

A minimal conceptual shape may resemble:

```ts
type ShortcutDefinition = {
  id: ShortcutId
  action: ShortcutActionId
  chord: {
    key: string
    match: 'key' | 'code'
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  labelKey: MessageKey
  groupKey: MessageKey
  scope: ShortcutScope
  focusPolicy: ShortcutFocusPolicy
  aliases?: readonly ShortcutId[]
}
```

This is illustrative, not mandatory.

Prefer the smallest repository-consistent shape that supports the required behavior.

### The registry should contain

At minimum:

- stable shortcut ID;
- stable logical action ID;
- chord definition;
- explicit `key` vs `code` match strategy;
- modifier requirements;
- localized action label/description key;
- localized group key;
- declarative scope;
- named editable/focus policy;
- enough metadata for visual and accessible chord display;
- intentional alias/grouping metadata for Redo.

### The registry should not contain

Do not place in static registry metadata:

- React setters;
- refs;
- component instances;
- domain mutation functions;
- `canUndo` / `canRedo` values;
- selected outpost state;
- persistence state;
- modal state;
- focus DOM nodes;
- imperative focus effects;
- arbitrary dynamic availability callbacks;
- widget-local keys such as listbox arrows or dialog Tab trapping.

Dynamic state stays with the dispatcher/action owner.

---

## Recognition and dispatcher policy

Centralize the **shared policy layer** so it does not drift between App shortcuts and Validation shortcuts.

The common policy should cover:

- exact modifier matching;
- `event.repeat`;
- `event.isComposing`;
- AltGraph / AltGr rejection;
- editable/text-editing focus policy;
- modal suppression;
- `key` vs `code` strategy.

Do not force all existing bindings into the same focus policy where they intentionally differ.

### Preserve current editable-focus semantics

Keep the useful distinction identified by the audit:

- history and `/` should yield to text-editing contexts;
- `Ctrl+Alt` application commands should remain suppressed in broad editable controls.

Use named reusable policies rather than ad hoc DOM tests in each shortcut family.

---

## AltGr and composition normalization

Add explicit protection for:

- `event.isComposing`;
- `event.getModifierState('AltGraph')` where supported;
- the supported Chromium/Windows AltGr representation.

Requirements:

- application shortcuts must not fire while an IME composition is active;
- `Ctrl+Alt` application shortcuts must not accidentally execute because the user is using AltGr;
- preserve visible controls as the fallback path.

Do not switch every shortcut blindly from `KeyboardEvent.key` to `code`.

Retain semantic `key` matching where it is appropriate:

- conventional Undo/Redo;
- `/`;
- named arrow keys.

Use `code` only if there is a deliberate physical-key requirement.

---

## Modal normalization

The audit found a real defect:

- Undo/Redo: already suppressed through modals;
- Search: already suppressed through modals;
- Add/Previous/Next outpost: currently leak through modals;
- Validation: currently leaks through modals.

Fix this.

### Required policy

When an application modal is open:

- no global application command shortcut may mutate state or open/toggle a background panel;
- modal-local keyboard behavior remains active;
- `Escape`, `Tab`, focus trapping, and dialog-local handling remain owned by the modal.

The application currently has:

- About dialog;
- network delete/reset confirmation dialog.

Use one coherent aggregate modal gate for global command dispatch.

Do not introduce per-shortcut modal exceptions for the current shortcut set.

---

## Validation shortcut integration

Validation currently has its own document listener and modifier-recognition logic.

Use judgment to reduce policy duplication.

Preferred outcome:

- Validation continues to own its UI state/effect behavior;
- chord recognition/policy comes from the same registry/common dispatcher model as the other application shortcuts;
- modal policy is no longer able to drift.

Do not move Validation state ownership into App merely to centralize metadata.

If keeping two listeners is still the cleanest architecture, make sure both consume the same registry/policy layer and cannot double-handle a chord.

If one listener becomes clearly simpler, that is acceptable provided feature ownership remains sensible.

---

## `preventDefault()` policy

Preserve the current good behavior:

> recognize a valid app chord + confirm scope/availability + execute action, then prevent the native default.

Do not broadly swallow keyboard events.

Ignored/unavailable commands should remain unprevented.

Examples:

- unavailable Undo/Redo should not prevent default;
- modal-suppressed commands should not prevent default;
- editable-suppressed commands should not prevent default;
- failed Search focus should not prevent default.

---

## Repeat policy

All current command bindings already reject repeated `keydown`.

Preserve that.

The registry/common dispatcher should make this contract consistent and testable.

Do not absorb normal local widget key repeat behavior into the command registry.

---

## Focus behavior

This parcel must explicitly define and test the focus outcome for each existing shortcut family.

### Search

Preserve current behavior:

- focus Search;
- select existing Search text.

### Validation

Preserve current behavior:

- opening places focus appropriately;
- closing restores focus appropriately when Validation owns focus.

### Add Outpost

After the shortcut adds/selects the new outpost, choose and implement one consistent accessible focus target.

Preferred candidates from the audit:

- the newly selected outpost's Navigation button; or
- a stable Outpost Details landmark/heading.

Use repository/UI behavior to determine which is more consistent.

Do not leave focus on stale or unrelated content.

### Previous / Next Outpost

After selection changes, focus should move predictably with the newly selected context.

Prefer a destination that:

- makes the newly selected outpost obvious;
- keeps keyboard navigation coherent;
- does not force the user through an unexpected long Tab loop.

The selected Navigation item is likely the strongest candidate if it fits existing structure.

### Undo / Redo

Do **not** force focus movement on every history operation.

Instead:

- preserve focus when the focused element still exists and remains visible/usable;
- repair focus when history removes/replaces/hides the focused element.

Use the smallest reliable strategy.

Do not create a complex focus manager.

### Required focus tests

Add focused integration coverage for:

- Add Outpost;
- Previous/Next;
- structural Undo/Redo where the focused node disappears;
- modal suppression;
- Search;
- Validation.

---

## Keyboard Shortcuts Help UI

Add a dedicated localized **Keyboard Shortcuts** dialog.

### Entry point

Add a new title-area button named:

```text
Help
```

The title controls should read:

```text
[EN-GB] [Help] [About]
```

Use the existing locale-selector label appropriate to the active locale.

Do **not** label the title button `Keyboard Shortcuts`.

The short `Help` label is intentional and should match the concise title-area control style.

### Dialog title

The dialog itself should be titled:

```text
Keyboard Shortcuts
```

localized appropriately.

### Placement

Place `Help` beside `About` in the global title/help area.

Preferred ordering:

```text
[Locale] [Help] [About]
```

Do not hide the entry point in About.

---

## Help dialog behavior

Use the existing modal architecture/pattern.

The Help dialog should:

- use the same modal hook/pattern as About/Confirm where appropriate;
- receive initial focus appropriately;
- trap focus;
- close with Escape;
- restore focus to the Help trigger;
- prevent global shortcuts from firing behind it;
- expose a visible Close button;
- require no hover;
- be screen-reader accessible.

Do not add a keyboard shortcut to open Help in this parcel.

A visible keyboard-focusable Help button is sufficient.

---

## Help dialog content

Generate shortcut content from the registry.

Do not manually duplicate chord strings.

Group the existing logical actions into coherent localized sections, based on the audit:

- History
- Search / Matrix
- Outpost Navigation
- Validation

If a better set of short group names emerges from current localization style, use that, but preserve the same conceptual grouping.

### Redo display

Display Redo as **one logical action** with both supported chords.

Do not show it as two independent commands.

### Chord rendering

Use semantic visual chord tokens, e.g. `<kbd>`.

Provide an accessible spoken representation as well.

Visual examples:

```text
Ctrl + Z
Ctrl + Shift + Z
Ctrl + Alt + N
/
```

Avoid hardcoding localized prose around each chord where a formatter can generate it.

---

## Localization

Add all required localization keys for:

- Help button;
- Keyboard Shortcuts dialog title;
- introduction/help text if used;
- action descriptions;
- shortcut group headings;
- Close button if not already reusable;
- accessible chord descriptions where required.

Preserve the project's localization architecture.

The registry should reference translation keys rather than user-facing English strings.

Ensure:

- en-US baseline complete;
- en-GB sparse overlay behavior remains valid;
- ja-JP semantic parity tooling passes.

Do not add locale-specific shortcut definitions unless absolutely required.

---

## Inline hints and tooltips

This parcel may add **selective reinforcement** if it remains visually clean.

Suitable candidates include:

- Search `/`;
- Undo;
- Redo;
- Add Outpost;
- Validation.

However:

- the dedicated Help dialog is the primary discoverability mechanism;
- tooltips alone are not sufficient;
- do not clutter the dense UI;
- do not add hints to every outpost row;
- Previous/Next outpost need not be permanently labelled in the navigation list.

If visual reinforcement creates layout pressure, omit it and document the decision.

Do not compromise the recently completed 1366px layout.

---

## 1366px non-regression

The title now gains one new `Help` button.

Recheck the completed 1366×768 layout.

At minimum verify:

- en-US / en-GB title area;
- ja-JP title area;
- locale selector + Help + About remain usable;
- wrapping is acceptable if needed;
- no page-level horizontal scrollbar;
- Resource Matrix remains free of horizontal scrolling;
- no regression to the fluid workspace work.

Do not solve title pressure by shrinking controls below current comfortable sizing.

---

## Registry-driven tests

Add durable registry contract tests.

At minimum test:

- unique shortcut IDs;
- no accidental duplicate chord definitions;
- intentional Redo alias/grouping;
- complete logical-action grouping;
- exact modifier behavior;
- repeat suppression;
- composition suppression;
- AltGraph suppression;
- `key`/`code` match strategy;
- display formatter output;
- accessible formatter output;
- translation-key coverage;
- Help dialog completeness relative to the registry.

Do not make tests brittle around irrelevant implementation details.

---

## Shortcut behavior tests

Add/update tests for:

### Editable focus

- text input;
- numeric input;
- search input;
- textarea;
- select;
- contenteditable;
- ordinary button/control.

Preserve the intentional distinction between text-editing and broad-editable policies.

### Modal suppression

Verify **every application shortcut** is suppressed while:

- About is open;
- delete/reset confirmation is open.

Ignored chords should not call `preventDefault()`.

### Composition / AltGr

Cover representative event shapes for:

- `isComposing`;
- AltGraph true;
- Ctrl+Alt printable events;
- arrow keys;
- US/UK-style key values;
- at least representative German/AltGr and Japanese/non-Latin shapes where practical.

Do not claim universal keyboard-layout coverage.

### Focus

Test the defined outcomes for:

- Search;
- Validation;
- Add Outpost;
- Previous/Next;
- structural Undo/Redo;
- modal open/close and Help trigger restoration.

---

## Existing widget keyboard interactions

Do not move these into the global registry:

- dialog Tab/Shift+Tab trapping;
- dialog Escape;
- Search autocomplete arrows/Enter/Escape;
- Search results local keyboard movement;
- Validation issue-list arrows/Home/End/Enter/Space;
- Context Help Escape;
- pointer-drag Escape.

These remain local widget interactions.

The user-facing Help dialog may omit these if the product distinction between global command shortcuts and local widget behavior remains clear.

---

## Backlog update

Inspect:

```text
docs/BACKLOG.md
```

Locate the existing:

```text
Additional keyboard shortcuts
```

item.

After successful implementation of this parcel:

- revise it to state that:
  - the central shortcut registry is implemented;
  - keyboard shortcut discoverability is implemented through Help;
  - common behavior policy is normalized;
  - future shortcuts must enter through the registry and shared test/policy contract;
- remove any stale wording that still asks to design shortcut discoverability;
- retain the unimplemented action candidate list for Parcel 3;
- do not assign final chords in the backlog;
- do not remove future candidate actions simply because discoverability is now done.

Do not perform unrelated backlog grooming.

---

## Audit document

Leave:

```text
docs/audits/KEYBOARD-SHORTCUT-INVENTORY-AND-DISCOVERABILITY.md
```

unchanged as the historical audit.

Do not rewrite its findings to match implementation.

---

## Scope boundaries

Do not add new application shortcuts.

Do not add a shortcut for Help.

Do not build a generic command framework.

Do not alter domain semantics.

Do not change:

- persistence;
- reference data;
- schema;
- Cloudflare;
- deployment;
- Node runtime;
- dependencies unless absolutely necessary.

Prefer no dependency changes.

Do not alter local widget keyboard contracts except where required to preserve modal/global shortcut isolation.

---

## Out-of-scope future shortcut actions

These remain candidates for Parcel 3 and should **not** be implemented now:

- previous/next network;
- add network;
- show/hide Navigation;
- focus major regions;
- Import;
- Export;
- Add Cargo Link/pad;
- toggle all Cargo expansion;
- Reshuffle/Lock mode shortcuts;
- reorder movement shortcuts;
- region-focus shortcuts for Local Resources / Organic Resources / Manufacturing / Planned Supply;
- destructive delete shortcuts;
- Help shortcut.

No key assignments for these should be made in this parcel.

---

## Verification

Run at minimum:

```text
node --version
npm run typecheck:tests
npm run build
npm test
npm run reference:test
npm run test:components
npm run lint
git diff --check
```

Also perform browser verification.

### Browser states

Verify at minimum:

- Help closed;
- Help open;
- About open;
- delete/reset confirmation open;
- Search focused;
- Validation open;
- outpost navigation after shortcut;
- structural Undo/Redo focus repair.

### Locales

Verify at minimum:

- en-US
- en-GB
- ja-JP

### Viewport

Recheck:

```text
1366 × 768
```

at 100% zoom.

Also spot-check a comfortable desktop width such as 1600px.

---

## Failure conditions

Stop and report before broadening scope if:

- registry implementation starts pulling domain effects/state into static metadata;
- modal suppression requires a broad architecture rewrite;
- focus repair requires a generalized focus framework;
- Help causes material 1366px title/layout regression;
- localization architecture cannot support registry-driven labels cleanly;
- AltGr/composition handling becomes browser-specific enough to require a larger compatibility design;
- a dependency appears necessary;
- existing shortcut behavior cannot be preserved without changing product semantics.

Do not force the parcel green by weakening tests or suppressing events broadly.

---

## Completion response

Return:

1. concise summary;
2. current branch;
3. files changed;
4. registry location and shape;
5. existing bindings represented;
6. how Redo aliases are modeled;
7. common recognition/policy layer;
8. AltGr/composition handling;
9. modal normalization;
10. editable-focus policy;
11. repeat/default-prevention policy;
12. focus behavior for each existing shortcut family;
13. Help button placement and label;
14. Help dialog structure;
15. registry-driven chord rendering;
16. localization changes;
17. any inline hints/tooltips added or deliberately omitted;
18. 1366px verification;
19. en-US/en-GB/ja-JP verification;
20. registry contract test results;
21. modal/composition/focus test results;
22. backlog revision;
23. confirmation no new shortcuts were added;
24. confirmation audit remains historical;
25. build/test/reference/component/lint results;
26. `git diff --check` result;
27. dependency/lockfile status;
28. confirmation no Cloudflare/deployment changes;
29. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
