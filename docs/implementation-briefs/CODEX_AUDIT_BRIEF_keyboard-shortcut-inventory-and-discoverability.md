# Codex Audit Brief — Keyboard Shortcut Inventory, Discoverability, and Registry Design

## Objective

Conduct a **read-only audit** of the Starfield Outpost Tracker's existing keyboard shortcut system.

The audit should establish:

1. every shortcut that currently exists;
2. where and how each shortcut is implemented;
3. whether shortcut behavior is consistent across scope, focus, disabled state, repeat handling, dialogs, and browser interaction;
4. whether the current `Ctrl+Alt+<key>` convention can be retained safely;
5. what discoverability mechanism should be built **before** any additional shortcuts are added;
6. whether a small central shortcut registry should be introduced, and what it should contain;
7. which actions are plausible candidates for future shortcuts after the existing system is made discoverable and coherent.

This is a **read-only audit**.

Do not implement shortcuts, discoverability UI, registry code, tests, or refactors during this audit.

Do not commit or push.

---

## Branch and workflow

Work on:

- `staging`

Before inspection:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Product direction

The shortcut work should proceed in three parcels:

1. **inventory and audit existing shortcuts;**
2. **design and implement shortcut discoverability using the existing shortcut set;**
3. **add genuinely missing shortcuts after the discoverability pattern has been proven.**

This audit is parcel 1 only.

Do not skip ahead to assigning new shortcuts.

---

## Existing convention

The project has so far tended to use:

```text
Ctrl + Alt + <key>
```

The user prefers to continue this convention if practical.

The audit must therefore test whether this pattern is still appropriate for the supported environment rather than replacing it pre-emptively.

Current primary platform/accessibility baseline:

- Windows
- Chromium/Edge

Other platforms may be noted where relevant, but do not redesign the scheme around unsupported platforms unless a major portability problem is uncovered.

---

## Required inventory

Identify every existing application keyboard shortcut.

For each shortcut, record at minimum:

- exact chord;
- logical action performed;
- user-facing label/action name;
- implementation file(s);
- handler/function used;
- whether the action also has a visible UI control;
- scope:
  - global;
  - network;
  - selected outpost;
  - matrix;
  - cargo;
  - dialog/modal;
  - other;
- whether it works while focus is in:
  - text input;
  - textarea;
  - search field;
  - select;
  - button;
  - other editable/contenteditable element;
- whether it operates while a modal/dialog is open;
- whether it respects the visible control's enabled/disabled state;
- whether it calls `preventDefault()`;
- whether it checks `event.repeat`;
- whether it uses `KeyboardEvent.key`, `KeyboardEvent.code`, or another mechanism;
- whether modifier matching is exact;
- whether it has automated tests;
- whether any visible discoverability currently exists;
- focus behavior after execution;
- any duplicate or overlapping keyboard path for the same action.

Do not rely only on one keyboard handler file.

Search from both directions:

- keyboard event handling;
- actions/commands that may expose shortcut labels or tests.

---

## Search targets

Inspect at minimum:

- global keydown handlers;
- component-level key handlers;
- shortcut utilities/helpers;
- application action dispatch;
- Undo/Redo;
- network navigation;
- outpost navigation/editing;
- Cargo Links;
- Resource Matrix;
- Planned Supply;
- Import/Export;
- dialogs;
- reorder/reshuffle modes;
- tests mentioning:
  - `keydown`
  - `KeyboardEvent`
  - `ctrlKey`
  - `altKey`
  - `metaKey`
  - `shiftKey`
  - shortcut labels
  - hotkeys
  - accelerators

Also inspect localization files for any existing shortcut/help strings.

---

## Core audit questions

### 1. What shortcuts already exist?

Produce a complete inventory.

Do not infer intended shortcuts from button mnemonics or labels.

Only record shortcuts that actually exist in code.

### 2. Are existing shortcuts internally consistent?

Assess:

- modifier pattern;
- key matching;
- scope;
- disabled-state behavior;
- input/editable suppression;
- modal behavior;
- event-repeat handling;
- `preventDefault()` behavior;
- focus restoration/movement;
- test coverage.

Highlight inconsistencies.

### 3. Are shortcuts routed through the same application actions as visible controls?

A shortcut should normally trigger the same application action path as the corresponding button/menu control.

Identify cases where:

- keyboard and pointer paths share the same action cleanly;
- keyboard handling duplicates logic;
- keyboard handling bypasses validation/availability;
- keyboard handling mutates state separately.

Do not change anything during the audit.

### 4. Is `Ctrl+Alt+<key>` still viable?

Perform a quick collision review for:

- Windows;
- Edge/Chromium;
- common browser-reserved chords;
- operating-system reserved chords;
- common accessibility/system shortcuts;
- common input-method behavior.

Do not attempt an exhaustive survey of every installed application.

The goal is to determine whether the project convention is broadly safe enough to retain.

### 5. AltGr / keyboard-layout implications

Investigate whether the current shortcut implementation is sensitive to:

- AltGr being represented as `Ctrl+Alt`;
- non-US keyboard layouts;
- `KeyboardEvent.key` versus `KeyboardEvent.code`;
- locale-dependent printable characters.

Determine:

- what the current code does;
- whether the existing shortcut set is affected;
- what policy should be used for future shortcuts.

Do not redesign the localization model unless required.

### 6. Input/editable-field behavior

Audit whether shortcuts fire while the user is typing.

Shortcut handling should generally not interfere with:

- character name fields;
- numeric skill fields;
- search fields;
- text inputs;
- textareas;
- contenteditable areas.

Exceptions should be explicit and intentional.

Identify any current shortcut that can unexpectedly fire while editing text.

### 7. Modal/dialog behavior

Determine what happens when dialogs/panels such as:

- About;
- Validation Summary;
- import/export-related modal UI;
- other overlays

are open.

Global shortcuts should not silently operate "through" a modal unless intentionally designed.

Record current behavior and recommended policy.

### 8. Repeat behavior

Inspect `KeyboardEvent.repeat`.

Actions that should not repeat merely because a key is held down should be guarded.

Identify:

- current repeat-safe shortcuts;
- shortcuts vulnerable to repeated execution;
- actions where repeat could be destructive or surprising.

### 9. Disabled-state parity

Verify whether shortcut execution respects the same availability conditions as visible controls.

Examples may include:

- Undo when unavailable;
- Redo when unavailable;
- move/reorder actions at boundaries;
- actions requiring a selected outpost/network;
- actions unavailable during a modal or special mode.

A shortcut must not become a hidden way to bypass disabled UI.

### 10. `preventDefault()` policy

Assess whether handlers:

- call `preventDefault()` only after recognizing an app shortcut;
- prevent native behavior even when the app action cannot execute;
- steal browser shortcuts unnecessarily.

Recommend a consistent policy.

### 11. Focus behavior after shortcut execution

For shortcuts that:

- change selection;
- change network;
- open/close modes;
- delete;
- add;
- move/reorder;
- open dialogs;

record what happens to keyboard focus.

Identify cases where focus becomes:

- lost;
- stale;
- hidden;
- left on a removed element;
- moved appropriately.

This is especially important for accessibility.

---

## Shortcut discoverability audit

The next parcel will implement discoverability **using the existing shortcuts only**.

Before designing it, inspect current UI/help patterns.

Assess suitable options for this application, including:

- dedicated Keyboard Shortcuts dialog;
- entry point near About/help;
- shortcut hints adjacent to selected high-value controls;
- tooltips as secondary reinforcement;
- other repository-consistent patterns.

Do not implement anything.

### Discoverability requirements

The recommended solution should:

- expose the full existing shortcut set in one place;
- be keyboard accessible;
- be screen-reader accessible;
- be localizable;
- preserve clear grouping by function;
- avoid requiring hover;
- avoid duplicating shortcut strings manually in many places if possible.

Tooltips alone should not be recommended as the sole discoverability mechanism.

---

## Central shortcut registry assessment

The user is positively inclined toward a small registry.

Determine whether the existing code would benefit from one.

### Desired role

A registry could potentially become the single source for:

- shortcut ID;
- action ID;
- chord definition;
- display label;
- localized description key;
- scope;
- maybe availability metadata if appropriate.

The registry should help prevent drift between:

- keyboard handling;
- help/discoverability UI;
- tests;
- displayed shortcut notation.

### Avoid overengineering

Do not recommend a full command framework unless current architecture genuinely needs one.

The preferred outcome, if justified, is a **small explicit registry**.

Assess:

- what data belongs in the registry;
- what should remain in existing action/state code;
- whether availability callbacks belong there or would create unwanted coupling;
- whether scopes should be declarative;
- how tests could consume it;
- how localized display labels should be represented;
- whether chord parsing/formatting should be centralized.

### Required registry recommendation

If recommending a registry, include a suggested conceptual shape such as:

```ts
type ShortcutDefinition = {
  id: ShortcutId
  action: ActionId
  chord: ShortcutChord
  labelKey: MessageKey
  scope: ShortcutScope
}
```

This is illustrative only.

Do not force this exact interface if the repository suggests a better minimal shape.

---

## Future shortcut candidate inventory

Do **not** assign new keys yet.

Instead, identify actions that might plausibly deserve shortcuts in the later implementation parcel.

Classify candidates by:

- high-frequency action;
- navigation action;
- edit/reorder action;
- destructive action;
- already keyboard-accessible through ordinary focus/tabbing;
- poor candidate for shortcut;
- needs product decision.

The point is to produce an **action inventory**, not a final shortcut map.

Do not treat every button as deserving a shortcut.

---

## Collision analysis

For existing shortcuts and likely future `Ctrl+Alt+<key>` use, classify collisions as:

- application-internal collision;
- browser collision;
- Windows/system collision;
- keyboard-layout/AltGr concern;
- accessibility concern;
- no obvious collision.

Be practical.

Do not reject `Ctrl+Alt+<key>` merely because a theoretical third-party application could use the same chord.

---

## Testing audit

Inspect current test coverage.

Identify whether tests cover:

- chord recognition;
- wrong modifier combinations;
- editable-field suppression;
- disabled-state parity;
- modal suppression;
- repeat handling;
- focus behavior;
- duplicate prevention;
- locale-independent behavior;
- `key` versus `code` behavior.

Recommend a test strategy for the later implementation parcels.

Do not add tests during this audit.

---

## Documentation/backlog

Inspect:

```text
docs/BACKLOG.md
```

Identify existing shortcut-related backlog items.

The audit should recommend how they should be revised after:

1. the discoverability parcel;
2. the missing-shortcut parcel.

Do not edit the backlog during this audit unless the repository's audit convention explicitly requires a report-link annotation.

No unrelated backlog grooming.

---

## Deliverable

Create:

```text
docs/audits/KEYBOARD-SHORTCUT-INVENTORY-AND-DISCOVERABILITY.md
```

Suggested structure:

1. Executive summary
2. Existing shortcut inventory
3. Current implementation architecture
4. Scope/focus/input/modal behavior
5. Disabled-state/repeat/default-prevention behavior
6. Browser/Windows collision review
7. AltGr and keyboard-layout assessment
8. Existing test coverage
9. Discoverability options
10. Recommended discoverability design
11. Shortcut registry assessment
12. Recommended registry shape
13. Future shortcut candidate inventory
14. Risks/non-regression constraints
15. Recommended implementation sequence
16. Parcel sizing
17. Reproduction/inspection notes

---

## Required conclusions

The report must explicitly answer:

- How many shortcuts currently exist?
- What are they?
- Are any duplicated or conflicting?
- Are they all `Ctrl+Alt+<key>`?
- Does the current implementation use `key` or `code`?
- Can `Ctrl+Alt+<key>` remain the default convention?
- Are there meaningful AltGr/layout risks?
- Do shortcuts currently fire inside editable controls?
- Do shortcuts currently operate through dialogs/modals?
- Do disabled controls and shortcuts always agree?
- Is `event.repeat` handled consistently?
- Is `preventDefault()` used appropriately?
- Is focus management adequate?
- How much shortcut logic is duplicated/scattered?
- Should the project introduce a central shortcut registry?
- What should that registry contain?
- What should it deliberately *not* contain?
- What discoverability UI is recommended?
- Where should that UI be accessible from?
- Should button-adjacent hints/tooltips be used in addition?
- What tests are missing?
- Which actions are candidates for later shortcuts?
- What should the next parcel be?
- Is the discoverability parcel small, medium, or large?
- Is the later missing-shortcut parcel small, medium, or large?

---

## Recommended sequencing

The audit should evaluate and, unless evidence strongly contradicts it, preserve this sequence:

### Parcel 1 — Current audit
Read-only inventory and design.

### Parcel 2 — Registry + discoverability
Using **existing shortcuts only**:

- introduce the small registry if justified;
- centralize chord/display metadata;
- build the discoverability UI;
- normalize inconsistent current behavior where necessary;
- add focused tests.

Do not add new shortcuts in Parcel 2 unless one is required solely to open the shortcut help surface and there is a strong product reason.

### Parcel 3 — Missing shortcuts
After discoverability is proven:

- choose actions;
- assign keys;
- collision-check;
- add shortcuts;
- update registry/help automatically;
- add tests.

---

## Non-regression requirements

Future implementation should preserve:

- ordinary text entry;
- browser-native behavior when no app shortcut matches;
- disabled-state parity;
- modal isolation;
- keyboard accessibility;
- focus visibility;
- localization;
- existing button behavior;
- current undo/redo semantics;
- current reorder semantics;
- Windows/Chromium baseline.

No shortcut should become a hidden privileged path around application validation.

---

## Scope boundaries

This is read-only.

Do not modify:

- application code;
- shortcut handlers;
- UI;
- dialogs;
- tests;
- CSS;
- localization;
- domain code;
- persistence;
- reference data;
- dependencies;
- lockfile;
- Cloudflare/deployment configuration.

Do not assign new shortcut chords.

Do not build the registry yet.

Do not build discoverability yet.

---

## Validation

Run only what is useful for audit confidence.

At minimum:

```text
npm run build
git diff --check
```

Run focused existing shortcut tests if helpful.

If browser interaction is used, report:

- browser;
- viewport;
- focus target;
- shortcut tested;
- observed result.

Do not mutate repository state beyond the audit report.

---

## Completion response

Return:

1. concise conclusion;
2. current branch;
3. audit file created;
4. complete shortcut count;
5. shortcut inventory summary;
6. implementation architecture summary;
7. `Ctrl+Alt` viability conclusion;
8. AltGr/layout conclusion;
9. editable-field behavior;
10. modal behavior;
11. repeat handling;
12. disabled-state parity;
13. `preventDefault()` assessment;
14. focus-management assessment;
15. test coverage assessment;
16. registry recommendation;
17. recommended registry contents;
18. discoverability recommendation;
19. future shortcut candidate summary;
20. recommended parcel sequence and sizes;
21. backlog-related recommendation;
22. commands/browser checks used;
23. confirmation no application/test/CSS/localization files changed;
24. confirmation no dependency/lockfile change;
25. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
