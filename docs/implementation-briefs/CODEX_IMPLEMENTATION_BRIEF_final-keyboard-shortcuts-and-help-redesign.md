# Codex Implementation Brief — Final Keyboard Shortcuts and Help Dialog Redesign

## Objective

Implement Parcel 3 of the Starfield Outpost Tracker keyboard-shortcut work.

This parcel should:

1. add the final approved shortcut set to the existing shortcut registry;
2. preserve the current shared shortcut policy and accessibility safeguards;
3. implement the agreed focus and action contracts for each new shortcut;
4. add independent Expand All / Collapse All Cargo Links commands;
5. implement the Resource Matrix landmark focus shortcuts;
6. implement Search Results focus;
7. implement Import / Export / Add Cargo Link shortcuts;
8. implement Navigation show/hide and focus shortcuts;
9. redesign the Keyboard Shortcuts Help dialog around the complete shortcut set;
10. harmonize Help visually with About;
11. fix the existing Help-dialog chord/label overlap;
12. update tests, localization, and backlog accordingly.

Do not add any shortcuts beyond the approved map below.

Do not commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

```text
staging
```

Before editing:

```text
git status
git branch --show-current
```

Confirm `staging`.

Identify unrelated working-tree changes before implementation.

Do not work directly on `main`.

Do not commit or push.

---

## Approved final shortcut map

This key map is locked for Parcel 3.

```text
Ctrl+Alt+O    Import / Open
Ctrl+Alt+S    Export / Save
Ctrl+Alt+A    Add Cargo Link

Ctrl+Alt+,    Expand all Cargo Links
Ctrl+Alt+.    Collapse all Cargo Links

Ctrl+Alt+B    Focus Navigation
Ctrl+Alt+W    Show/hide Navigation
Ctrl+Alt+T    Focus Outpost Details
Ctrl+Alt+G    Focus Resource Matrix
Ctrl+Alt+C    Focus Cargo Links
Ctrl+Alt+P    Focus Planned Supply
Ctrl+Alt+J    Focus Search Results

Ctrl+Alt+1    Focus first Inorganic Present control
Ctrl+Alt+2    Focus first Organic Present indicator
Ctrl+Alt+3    Focus Manufacturing Edit/Save
```

Existing shortcuts remain unchanged:

```text
Ctrl+Z             Undo
Ctrl+Y             Redo
Ctrl+Shift+Z       Redo alias
/                  Focus Search
Ctrl+Alt+N         Add Outpost
Ctrl+Alt+ArrowUp   Previous Outpost
Ctrl+Alt+ArrowDown Next Outpost
Ctrl+Alt+V         Toggle Validation details
```

After implementation the app should have:

- 22 logical shortcut actions;
- 23 chord bindings including the Redo alias.

---

## Matching strategy

Use:

### `KeyboardEvent.key`

For all mnemonic letter shortcuts:

```text
O S A B W T G C P J
```

These should be semantic letter shortcuts.

### `KeyboardEvent.code`

For physical paired/ordinal shortcuts:

```text
Comma
Period
Digit1
Digit2
Digit3
```

Use separate display tokens so Help renders:

```text
,
.
1
2
3
```

Do not display raw code tokens such as `Comma`, `Digit1`, etc.

Exclude numpad equivalents for the numeric shortcuts.

---

## Existing shortcut policy must remain intact

Preserve the shared dispatcher behavior already introduced in Parcel 2.

Every new shortcut must inherit:

- exact modifier matching;
- repeat suppression;
- IME/composition suppression;
- AltGraph / AltGr suppression;
- modal suppression;
- editable-focus suppression according to the appropriate policy;
- handled-only `preventDefault()`;
- deterministic dispatch;
- no hidden bypass around visible-control availability.

Do not weaken any existing policy to make new shortcuts work.

---

## Windows accessibility constraints

The final map was selected specifically to avoid adding new conflicts with Windows Magnifier and Magnifier reading commands.

Do not reintroduce:

```text
Ctrl+Alt+I
Ctrl+Alt+L
Ctrl+Alt+D
Ctrl+Alt+M
Ctrl+Alt+R
Ctrl+Alt+-
Ctrl+Alt+H
Ctrl+Alt+K
Ctrl+Alt+Enter
```

The existing `Ctrl+Alt+ArrowUp/ArrowDown` Magnifier overlap is historical and out of scope for this parcel.

Do not alter existing bindings unless required for a regression fix discovered during implementation.

---

## Registry extension

Use the existing registry as the single source for shortcut metadata.

A small extension is permitted if required so physical code matching can render human-friendly key caps.

For example:

```ts
chord: {
  key: 'Digit1',
  displayKey: '1',
  match: 'code',
  ctrl: true,
  alt: true,
  shift: false,
  meta: false
}
```

Equivalent naming is acceptable.

The registry should continue to contain only static shortcut metadata.

Do not put into the registry:

- React refs;
- callbacks;
- dynamic availability state;
- domain mutation functions;
- modal state;
- focus nodes;
- selected outpost state;
- Cargo expansion state;
- Search Results state.

Dynamic behavior remains with action owners / dispatch handlers.

---

# New shortcut behavior

## 1. Import — `Ctrl+Alt+O`

Mnemonic:

```text
Open
```

Requirements:

- invoke the exact same import action path as the visible Import control;
- trigger the existing hidden file input / chooser;
- do not create a second import implementation;
- do not bypass existing parsing, validation, capacity checks, or error handling;
- suppress in modal/editable/composition/AltGraph states;
- reject repeats;
- no-op if the file input / action owner is unavailable;
- if no-op, do not call `preventDefault()`.

Focus:

- preserve normal browser/file-picker focus behavior;
- do not invent special post-cancel focus movement;
- preserve existing post-import behavior.

---

## 2. Export — `Ctrl+Alt+S`

Mnemonic:

```text
Save
```

Requirements:

- invoke the same export path as the visible Export control;
- export exactly once per handled keydown;
- repeat suppression must prevent download bursts;
- preserve current export filename/content behavior;
- no-op if export owner unavailable;
- handled-only `preventDefault()`.

Focus:

- preserve existing focus after export.

---

## 3. Add Cargo Link — `Ctrl+Alt+A`

Use the same action path as the visible Cargo Add control.

Current product terminology may create an unlinked Cargo pad before a network-level link exists; preserve actual current semantics.

Requirements:

- do not invent a shortcut-specific Cargo creation path;
- preserve advisory vs hard-limit behavior;
- create exactly one item/history operation as the visible control does;
- after render, focus the new Cargo item’s primary disclosure/control;
- preserve its normal default expanded/collapsed state;
- unavailable owner: no-op, unprevented.

---

# Cargo Links Expand / Collapse

## 4. Expand all Cargo Links — `Ctrl+Alt+,`

Match:

```text
code: Comma
display: ,
```

## 5. Collapse all Cargo Links — `Ctrl+Alt+.`

Match:

```text
code: Period
display: .
```

These are **separate commands**, not a toggle shortcut.

Required semantics:

- Expand All expands every Cargo Link/pad regardless of mixed state.
- Collapse All collapses every Cargo Link/pad regardless of mixed state.
- zero Cargo items: no-op and do not prevent default;
- no domain history entry;
- no persistence/schema change;
- presentation-only state remains component-local.

Refactor the visible Cargo toggle if needed so all three paths share one primitive.

Preferred shape:

```ts
setAllCargoPadsExpanded(expanded: boolean)
```

Then:

```text
visible toggle -> setAllCargoPadsExpanded(!areAllExpanded)
Ctrl+Alt+,    -> setAllCargoPadsExpanded(true)
Ctrl+Alt+.    -> setAllCargoPadsExpanded(false)
```

Do not change the visible button’s existing semantics unless necessary to route through the shared helper.

---

# Navigation shortcuts

## 6. Focus Navigation — `Ctrl+Alt+B`

Mnemonic:

```text
Bar
```

Behavior:

- if Navigation is visible and selected outpost button exists, focus it;
- if selection cannot resolve but outposts exist, focus the first outpost button;
- if there are no outposts, focus a stable programmatically focusable Navigation heading/region;
- do not toggle Navigation visibility;
- if Navigation is hidden, no-op;
- hidden state must remain hidden;
- no-op must not prevent default.

Use an explicit ref / semantic focus target.

Do not depend on brittle positional DOM queries.

---

## 7. Show/hide Navigation — `Ctrl+Alt+W`

Mnemonic:

```text
Workspace
```

Use the same visibility action path as the existing Navigation show/hide control.

Behavior:

### Showing Navigation

- change visibility only;
- do not move focus automatically.

### Hiding Navigation

If focus is currently inside Navigation:

- repair focus to the visible Show Navigation control or other established stable visible trigger.

If focus is outside Navigation:

- leave focus where it is.

Do not combine this command with Focus Navigation.

---

# Workspace focus shortcuts

## 8. Focus Outpost Details — `Ctrl+Alt+T`

Mnemonic:

```text
Top
```

Preferred target:

- selected outpost name input / first meaningful control in Outpost Details.

Requirements:

- focus only;
- do not alter values;
- no selected outpost/details content: no-op;
- handled-only `preventDefault()`.

---

## 9. Focus Resource Matrix — `Ctrl+Alt+G`

Mnemonic:

```text
Grid
```

Focus the Resource Matrix region itself.

Preferred implementation:

- meaningful heading/region;
- programmatic `tabIndex=-1` where needed.

Do **not**:

- focus Search as a substitute;
- toggle anything;
- change matrix filters;
- alter resources.

If Matrix is unavailable/not rendered, no-op.

---

## 10. Focus Cargo Links — `Ctrl+Alt+C`

Focus the Cargo Links region/heading.

Preferred implementation:

- stable focusable region/heading via explicit ref;
- `tabIndex=-1` if required.

Do not:

- add Cargo items;
- expand/collapse;
- select or mutate a Cargo Link.

Absent section: no-op.

---

## 11. Focus Planned Supply — `Ctrl+Alt+P`

Focus the existing Planned Supply disclosure/toggle control.

Requirements:

- focus only;
- do not expand/collapse;
- same target whether section currently open or closed;
- absent section: no-op.

---

# Search Results focus

## 12. Focus Search Results — `Ctrl+Alt+J`

Mnemonic:

```text
Jump
```

Strict behavior:

> If Search Results is visible, move focus into it. If not visible, do nothing.

Requirements:

- do not reopen Search Results;
- do not submit Search;
- do not focus Search;
- do not alter results;
- hidden/absent palette: no-op, no `preventDefault()`.

Use the Search Results palette’s existing focus contract.

Current expected behavior:

- zero results: focus palette region;
- one result: focus palette region;
- many results: focus palette region;
- if focus is already inside palette: report handled but do not unnecessarily move it.

Reuse existing ref/region behavior where possible.

---

# Resource Matrix landmark shortcuts

These three shortcuts are **focus-only**.

They must never click, toggle, edit, save, or otherwise activate their targets.

## 13. `Ctrl+Alt+1` — first Inorganic Present

Match:

```text
code: Digit1
display: 1
```

Target:

- Present control associated with the first rendered current Inorganic row.

Requirements:

- use semantic row ordering already used by the application;
- use explicit ref or stable semantic selector;
- do not rely on `nth-child`;
- focus only;
- never toggle Present;
- target absent/disabled/unfocusable: no-op;
- exclude numpad `1`.

---

## 14. `Ctrl+Alt+2` — first Organic Present

Match:

```text
code: Digit2
display: 2
```

Target:

- Present indicator associated with the first rendered current Organic row.

Current indicator may be a read-only non-focusable span.

If required:

- add `tabIndex=-1` only to the designated focus target;
- do not turn it into an interactive button;
- preserve its read-only semantics.

Requirements:

- focus only;
- no state mutation;
- absent target: no-op;
- exclude numpad `2`.

---

## 15. `Ctrl+Alt+3` — Manufacturing Edit / Save

Match:

```text
code: Digit3
display: 3
```

Dynamic target:

```text
not editing -> Edit button
editing     -> Save button
```

Requirements:

- focus only;
- do not enter edit mode;
- do not save;
- never focus Cancel as a substitute;
- absent Manufacturing action: no-op;
- exclude numpad `3`.

Use explicit refs for Edit and Save.

---

# Help dialog redesign

The complete shortcut set now contains:

- 22 logical actions;
- 23 chord badges including the Redo alias.

The Help dialog must be redesigned around this complete set.

Known current issues:

1. Help does not visually match About closely enough.
2. `Ctrl + Alt + Arrow Up` can overlap the neighboring Validation label.

Both must be fixed in this parcel.

Do not solve either problem by:

- reducing font size;
- truncating labels;
- abbreviating chord notation;
- ellipsizing commands.

---

## Help dialog width and responsive layout

Use the audit recommendation as the baseline.

Preferred maximum geometry:

```text
min(58rem, calc(100vw - 2rem))
```

Exact implementation may differ slightly if repository CSS suggests a cleaner equivalent.

Requirements:

- two columns only when both columns have sufficient room;
- switch to one column at a content-driven breakpoint around `54rem`;
- keep each group intact where practical;
- no chord badge may overlap another column or label;
- chord badges stay on one line;
- Redo may wrap between its two complete chord badges, never inside one badge;
- internal vertical scrolling is acceptable under short viewport heights;
- title/close controls must remain immediately reachable.

Do not reduce ordinary typography size.

---

## Help grouping

Use these eight groups unless implementation evidence strongly supports a small naming adjustment:

### History
- Undo
- Redo

### Search
- Focus Search
- Focus Search Results

### Outpost Navigation
- Add Outpost
- Previous Outpost
- Next Outpost

### Workspace
- Show/hide Navigation
- Focus Navigation
- Focus Outpost Details
- Focus Planned Supply

### Resource Matrix
- Focus Resource Matrix
- First Inorganic Present
- First Organic Present
- Manufacturing Edit/Save

### Cargo Links
- Focus Cargo Links
- Add Cargo Link
- Expand All
- Collapse All

### Import / Export
- Import
- Export

### Validation
- Toggle Validation details

Redo remains one logical row with two chord badges.

---

## Help column distribution

Preferred desktop distribution:

### Left
- History
- Search
- Outpost Navigation
- Workspace

### Right
- Resource Matrix
- Cargo Links
- Import / Export
- Validation

Do not simply auto-flow groups into equal columns if that causes poor balance or splitting.

---

# Help / About visual harmonization

Help should adopt About’s established visual language while remaining wider.

Align as appropriate:

- title typography;
- uppercase/structural title treatment;
- header divider;
- background;
- border;
- radius;
- backdrop;
- header spacing;
- close affordance;
- close hover/focus behavior;
- footer Close button styling;
- body spacing;
- section-heading hierarchy.

Use:

```text
box-sizing: border-box
```

where appropriate to prevent geometry overshoot.

Pixel-identical width is **not** required.

Help-specific grid/group/kbd styling is expected.

The goal is:

> same modal family, different content geometry.

---

# Localization

Add localization keys for all new action labels / group content required by Help.

Preserve:

- en-US baseline;
- sparse en-GB overlay behavior;
- ja-JP semantic parity tooling.

Do not localize shortcut definitions themselves.

The registry should continue to reference translation keys.

Check that Japanese Help layout remains readable at:

```text
1366 × 768
```

and in the single-column responsive state.

---

# Accessibility

Preserve and verify:

- keyboard-only operation;
- visible focus;
- screen-reader-compatible Help content;
- modal focus trap;
- Help Escape close;
- focus restoration to Help trigger;
- global shortcuts suppressed behind modals;
- AltGraph / IME safety;
- editable-field suppression;
- no focus-only shortcut causes activation;
- no new Windows Magnifier conflicts.

Help chord notation should retain accessible spoken labels derived from registry metadata.

---

# 1366px / zoom non-regression

Re-test:

```text
1366 × 768
100% zoom
```

for:

- en-US;
- en-GB;
- ja-JP.

Also verify:

```text
1600 × 900
```

and:

```text
200% browser zoom
```

for Help dialog usability.

Requirements:

- no page-level horizontal scrollbar;
- no Resource Matrix horizontal-scroll regression;
- Help dialog remains usable;
- no label/chord overlap;
- no tiny typography;
- title controls remain usable;
- one-column Help layout activates where appropriate.

---

# Tests

Add/extend tests for all new behavior.

## Registry

Test:

- 23 unique chord bindings;
- 22 logical actions;
- only Redo is aliased;
- no accidental duplicate signatures;
- letter shortcuts use `key`;
- comma/period/digits use `code`;
- display tokens render correctly;
- numpad digits do not match;
- wrong physical code/right character does not match;
- Shift is rejected for all new shortcuts;
- AltGraph suppression;
- composition suppression;
- repeat suppression;
- modal suppression;
- editable suppression;
- Help completeness from registry.

---

## Import / Export

Test:

- Import triggers chooser path once;
- no duplicate import path;
- Export triggers once;
- repeat does not duplicate;
- unavailable owner no-ops;
- `preventDefault()` only after successful handling.

---

## Cargo

Test:

- Add Cargo Link uses visible action path;
- new Cargo item focus;
- Expand All from:
  - all collapsed;
  - all expanded;
  - mixed;
- Collapse All from:
  - all collapsed;
  - all expanded;
  - mixed;
- zero Cargo items no-op;
- no history entry for expand/collapse;
- visible toggle still works.

---

## Navigation

Test:

- Focus Navigation selected item;
- fallback first item;
- no-outpost fallback region;
- hidden Navigation no-op;
- Show Navigation does not move focus;
- Hide Navigation repairs focus only when focus was inside the panel.

---

## Workspace regions

Test exact focus destinations for:

- Outpost Details;
- Resource Matrix;
- Cargo Links;
- Planned Supply.

Verify absent target = no-op / unprevented.

---

## Search Results

Test:

- hidden;
- zero results;
- one result;
- many results;
- focus already inside;
- shortcut does not reopen or submit Search.

---

## Matrix landmarks

Test:

- first Inorganic target;
- first Organic target;
- Manufacturing Edit target;
- Manufacturing Save target;
- no target;
- focus-only behavior;
- no toggle/save/edit activation;
- numpad rejection.

---

## Help

Test:

- every logical action appears exactly once;
- Redo shows both chords;
- registry-generated notation;
- correct grouping;
- localization keys;
- modal focus behavior;
- no shortcut executes behind Help.

Manual/browser checks should cover visual geometry rather than relying only on DOM assertions.

---

# Backlog update

Update:

```text
docs/BACKLOG.md
```

After successful implementation:

- remove implemented shortcut candidates;
- remove stale “exact key combinations undecided” wording;
- remove stale discoverability/design-review wording;
- retain only deliberately deferred shortcut candidates, if any;
- do not reintroduce rejected actions:
  - network switching;
  - add network;
  - reorder shortcuts;
  - deletion;
  - Validation focus;
  - About/Help shortcuts.

Do not perform unrelated backlog grooming.

---

# Historical audit

Leave:

```text
docs/audits/KEYBOARD-SHORTCUT-FINAL-KEY-ALLOCATION.md
```

unchanged after implementation.

It is the historical decision/audit record.

Do not rewrite it to match implementation details.

---

# Scope boundaries

Do not:

- add any shortcut outside the locked map;
- alter persistence;
- alter schema;
- alter reference data;
- alter domain semantics;
- add dependencies unless absolutely necessary;
- change Cloudflare/deployment;
- change Node runtime;
- redesign unrelated dialogs;
- redesign the visible Cargo control beyond the small shared-helper refactor;
- change existing shortcut chords.

Prefer no dependency or lockfile changes.

---

# Verification

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

Browser verification:

```text
1366 × 768
1600 × 900
200% zoom
```

Locales:

```text
en-US
en-GB
ja-JP
```

Exercise at minimum:

- Import shortcut;
- Export shortcut;
- Add Cargo shortcut;
- Cargo Expand All from mixed state;
- Cargo Collapse All from mixed state;
- Focus Navigation;
- Navigation show/hide;
- Focus Outpost Details;
- Focus Resource Matrix;
- Focus Cargo Links;
- Focus Planned Supply;
- Search Results visible;
- Search Results hidden;
- Inorganic landmark;
- Organic landmark;
- Manufacturing Edit mode;
- Manufacturing non-edit mode;
- Help two-column layout;
- Help one-column layout;
- Help/About visual consistency;
- modal suppression;
- editable-field suppression.

---

# Failure conditions

Stop and report before broadening scope if:

- a locked shortcut collides with a newly verified Windows accessibility/system chord;
- implementation requires a fourth modifier;
- focus targets require a generalized focus framework;
- registry begins absorbing dynamic application state;
- Help requires smaller typography to fit;
- Help cannot avoid overlap without major unrelated layout changes;
- Cargo expand/collapse requires persistence/domain redesign;
- a dependency appears necessary;
- existing shortcut semantics regress.

Do not weaken tests or accessibility policy to force completion.

---

# Completion response

Return:

1. concise implementation summary;
2. current branch;
3. files changed;
4. final registry count;
5. final logical-action count;
6. final chord map implemented;
7. `key` / `code` strategy;
8. registry shape changes;
9. Import behavior;
10. Export behavior;
11. Add Cargo behavior;
12. Cargo Expand/Collapse implementation;
13. Navigation focus behavior;
14. Navigation show/hide behavior;
15. Outpost Details focus;
16. Resource Matrix focus;
17. Cargo Links focus;
18. Planned Supply focus;
19. Search Results focus;
20. Inorganic landmark focus;
21. Organic landmark focus;
22. Manufacturing Edit/Save focus;
23. Help layout redesign;
24. Help/About visual harmonization;
25. localization changes;
26. 1366×768 verification;
27. 1600×900 verification;
28. 200% zoom verification;
29. test results;
30. backlog revision;
31. confirmation no extra shortcuts were added;
32. dependency/lockfile status;
33. confirmation no persistence/schema/reference-data changes;
34. confirmation no Cloudflare/deployment changes;
35. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
