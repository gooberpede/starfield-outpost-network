# Codex Implementation Brief — Cargo Pad Expanded Editor Redesign

## Objective

Redesign the **expanded Cargo Pad editor only**.

The goal is to make each expanded cargo pad compact, legible, and focused on two questions:

1. **Where is this pad linked?**
2. **What is this pad configured to export?**

This batch should also fix related history behavior for destination selection and correct the Outpost Details `Logistics` summary so that only exports on an actual configured route count as active Logistics.

Do **not** redesign the compact cargo-pad header in this batch.

Do **not** implement cargo-pad reordering/reshuffle in this batch.

Do **not** add an independent Cargo Pads column scrollbar in this batch.

---

## Read first

Before editing, read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current implementation of:

- Cargo Pads expanded editor
- Cargo Pad compact header
- destination Outpost selector
- destination Pad selector
- CargoLink creation/update/removal
- cargo-pad outbound item selection
- regular/interstellar pad type control
- He-3 availability derivation
- Outpost Details matrix Logistics derivation
- Undo/Redo update pathways
- cargo-pad removal semantics
- existing CargoLink validators

Preserve existing domain boundaries.

---

# Scope summary

Implement this expanded-pad layout conceptually:

```text
[Inter-System]                               [Remove]
[Unlinked                                           ]
[Select cargo pad...                                ]

Exports
[Al][Cu][Fe][Li][xF4]

[Mem][Slv][Sea][Fib]

[AFr][RGa][ZWr]
```

Notes:

- compact header remains unchanged and is not shown in the mockup;
- destination controls come first;
- `Exports` is the only visible subsection heading;
- inorganic / organic / manufactured are separated by grouping/spacing, **not labels**;
- export buttons are compact two-state controls;
- no verbose provenance labels appear in the export selector.

---

# 1. Keep the current destination selectors, with small refinements

The current Outpost and Pad selectors are fundamentally good and should remain recognizable.

Do not replace them with custom segmented controls or button grids.

## Outpost selector

Keep the current descriptive selector behavior.

### Outposts with zero cargo pads

Improve the destination Outpost selector so outposts that have **no cargo pads at all** are not normal selectable destinations.

Preferred behavior:

- keep them visible but unavailable/greyed-out if practical;
- if the current selector implementation does not support disabled options cleanly, omission is acceptable;
- do not make them look normally selectable.

The current outpost must remain unavailable as a destination.

## Pad selector

Keep the current Pad selector behavior and descriptive option text.

The selector currently communicates useful information such as:

- whether a remote pad is already linked;
- what the remote pad is exporting, if anything.

Preserve that.

Pads unavailable because already linked elsewhere should remain visible with informative state rather than being silently filtered away, unless current behavior already intentionally omits them.

## Conditional visibility

Preserve current behavior:

- Outpost selector is always visible in expanded mode;
- Pad selector only appears once a remote Outpost is selected.

Do not add labels above these selectors.

The selected text itself is sufficient context.

---

# 2. Destination changes must create Undo/Redo history

The current destination Outpost selection appears not to create history.

Fix this.

Changing cargo-link destination is a deliberate network edit and must be undoable.

## Change remote Outpost

When the user changes the remote Outpost:

- clear/reset the previously selected remote Pad as necessary;
- apply all collateral link changes atomically;
- create **one history entry**.

Example:

```text
Before:
Feynman I / Pad 2

User selects:
Feynman VI-b

After:
Feynman VI-b / no Pad selected
```

Undo must restore:

```text
Feynman I / Pad 2
```

as one action.

## Change remote Pad

Changing only the remote Pad should create **one history entry**.

## No-op selections

Selecting the already selected Outpost or Pad should be a no-op and create no history entry.

## Unlinking

`Unlinked` remains a valid explicit Outpost-selector state.

Choosing `Unlinked` should:

- remove the CargoLink;
- preserve the local pad's selected outbound items;
- create one history entry.

Undo should restore the previous destination Outpost + Pad pairing.

---

# 3. Preserve current broken-link behavior

If the currently linked remote pad/outpost becomes invalid because it changes elsewhere — for example:

- the remote pad is deleted;
- the remote pad is otherwise unlinked in a way that invalidates the connection;
- the remote endpoint no longer exists;

preserve current behavior:

- the local pad reverts to an **unlinked** state;
- no remote Outpost or Pad remains selected;
- the local pad keeps whatever outbound exports were already selected.

Do not preserve a stale/broken remote selector value in this batch.

Do not auto-select a replacement remote pad.

---

# 4. Replace Interstellar checkbox with Inter-System toggle button

The game terminology is **Inter-System**.

Rename the UI label from `Interstellar` to:

```text
Inter-System
```

Do not change persisted/domain enum names unless required by existing architecture; this is primarily a presentation terminology change.

## Interaction

Replace the checkbox with a compact toggle button.

It has two user-controlled semantic states:

- unselected/off;
- selected/on.

Do not make this a three-choice control.

## Optional derived visual enhancement

When Inter-System is selected **and actual He-3 is available at the local outpost**, give the selected button a distinct positive/lit treatment.

So visually:

```text
off                         -> ordinary unselected
on, no actual He-3          -> selected
on, actual He-3 available   -> selected + special positive/lit treatment
```

This third appearance is derived only; it is not a third interactive state.

## He-3 availability semantics

Use **actual availability only**.

Planned Supply alone must not produce the He-3-positive/lit treatment.

## Do not auto-correct configuration

Inter-System remains independently editable even while unlinked.

Do not automatically toggle Inter-System based on destination.

Examples that should remain representable:

- same-system destination + Inter-System selected;
- cross-system destination + Inter-System unselected.

Existing validators should judge invalid/unnecessary combinations.

The editor records configuration; validators judge it.

## History

Each deliberate Inter-System toggle creates one history action.

---

# 5. Compact top action row

Use a compact top row in the expanded pad:

```text
[Inter-System]                               [Remove]
```

Rename:

```text
Remove Cargo Pad
```

to:

```text
Remove
```

Preserve current cargo-pad removal semantics and atomic Undo behavior.

---

# 6. Simplify headings and labels

Required visible text:

- `Inter-System`
- destination selector option text
- `Exports`
- `Remove`
- compact exports empty-state text if needed

Do **not** render visible labels such as:

- `Outpost`
- `Pad`
- `Type`
- `Inorganic`
- `Organic`
- `Manufactured Products`

Use grouping and whitespace instead.

---

# 7. Redesign Exports as compact abbreviation toggles

Replace the current verbose export list with compact two-state buttons.

## Candidate set

The displayed export item set is:

```text
actual availability
∪ Planned Supply
∪ current pad exports
```

The last term is important so stale selected exports remain visible and removable.

## Group order

Group items in this order:

1. inorganic resources
2. organic resources
3. manufactured products

Do not show visible group labels.

Separate non-empty groups with a small amount of vertical whitespace.

If a group is empty, omit it without leaving an empty gap.

## Sort order

Within each group, sort alphabetically by full player-facing item name.

## Button content

Use abbreviations / short names:

```text
[Al]
[Cu]
[xF4]
[Mem]
[AFr]
```

Full item name remains inspectable via tooltip/title.

## Button size

These export buttons should be **smaller and denser than the buttons used in Outpost Details**.

They are a compact multi-select cluster, not matrix status cells.

Priorities:

- small height;
- compact width;
- tight horizontal/vertical gap;
- equal sizing within the Cargo Pad export control family where practical;
- natural wrapping;
- good click target without creating tall stacks.

Do not copy the larger Outpost Details matrix button dimensions blindly.

## Wrapping

Allow natural wrapping inside each group.

Do not truncate item lists.

Do not use nested scrollbars inside Exports.

Do not show `+N more`.

---

# 8. Export button state semantics

All export controls remain fundamentally two-state:

- not selected;
- selected.

However, stale selected exports need distinct presentation.

## Normal unselected

```text
item is actual or planned
AND not selected
```

Render normal unselected.

## Normal selected

```text
item is actual or planned
AND selected
```

Render normal selected.

## Stale selected

```text
item is selected
AND item is neither actual nor planned
```

Keep visible.

Render selected plus dim/warning-like styling.

It must remain clickable so the user can remove it.

## Omitted

```text
item is neither actual nor planned
AND not selected
```

Do not show it.

## Source changes

If provenance changes but the item remains actually available, do not alter export-selection state.

Cargo Pad export UI does not display provenance.

## Planned-only supply

If actual supply disappears but Planned Supply remains:

- item remains a normal candidate;
- if selected, it remains normal selected;
- do not treat it as stale.

Existing validation may still warn that the export has no actual source.

---

# 9. Exports empty state

If there are no items in:

```text
actual ∪ planned ∪ current exports
```

keep the `Exports` heading and show:

```text
No items available to export.
```

Use current app wording/style conventions if an established equivalent exists.

---

# 10. Outpost Details Logistics semantics correction

Fix the Outpost Details status matrix so `Logistics` only lights for **actual routed exports**, not merely configured outbound cargo intent.

Current confusing behavior:

- local pad has selected outbound items;
- pad is unlinked;
- Outpost Details Logistics still lights those items.

Change that.

## Correct distinction

Cargo Pad editor uses:

```text
configured outbound items
```

Outpost Details Logistics uses:

```text
routed export items
```

A routed export means:

```text
item is selected in local pad outbound cargo
AND the local pad participates in a CargoLink with a defined remote endpoint
```

## Important interpretation

Do **not** require the route to pass every validator before Logistics lights.

Examples:

- cross-system route using a regular pad may still be invalid, but it has a defined destination and should count as routed;
- Inter-System without He-3 may be invalid, but it has a defined destination and should count as routed.

Validators remain responsible for configuration problems.

The Logistics distinction is only:

```text
has defined route
vs
no defined route
```

## Unlinked pad

If a pad is unlinked but retains selected outbound items:

- those items remain visible/selected in the Cargo Pad editor;
- they do **not** light in Outpost Details Logistics.

## Link removal/restoration

When a CargoLink is removed, corresponding Logistics cells dim/off automatically.

If Undo restores the link, corresponding Logistics cells light again automatically.

## Imports

Do not change Imports semantics.

---

# 11. Preserve existing validations

Do not remove or weaken existing cargo validation, including:

- unresolved cargo export
- missing cargo link endpoint
- pad linked multiple times
- regular pad cross-system
- Inter-System / He-3
- other existing cargo-domain rules

UI simplification must not replace validation.

---

# 12. Right-column scrolling explicitly deferred

Do **not** give Cargo Pads its own vertical scrollbar in this batch.

Do not redesign workspace scrolling.

A later pass will consider:

- independent Cargo Pads right-column scrolling;
- broader workspace scrolling architecture;
- Cargo Pad Reshuffle/Lock mode;
- drag-and-drop pad reordering;
- move controls;
- stable IDs/links/cargo through reorder.

---

# 13. Cargo Pad reordering explicitly deferred

Do not add:

- Reshuffle/Lock;
- drag-and-drop;
- reorder arrows;
- manual pad reordering UX.

Keep current ordering behavior unchanged.

---

# Component architecture

Prefer focused helpers/components where they clarify semantics.

Possible concepts:

- compact Inter-System toggle;
- export candidate derivation;
- export group derivation;
- compact export toggle;
- routed-export helper for Outpost Details Logistics.

Avoid duplicating availability or CargoLink domain logic in multiple UI components.

Keep:

```text
configured outbound
```

and:

```text
routed export
```

as deliberately distinct concepts.

---

# Accessibility

Use sensible local semantics:

- Inter-System toggle exposes pressed/on state;
- export buttons expose selected state;
- stale selected exports remain focusable/clickable;
- full item names are available via tooltip/title;
- unavailable destination options communicate unavailability where possible;
- Remove has clear accessible context.

Do not expand into a full-app accessibility redesign.

---

# Styling priorities

The expanded Cargo Pad editor should feel:

- compact;
- uncluttered;
- quick to scan;
- vertically economical;
- consistent with the app without copying oversized matrix controls.

Avoid:

- category headings;
- verbose source annotations;
- large export buttons;
- nested scroll areas;
- card-per-export layouts;
- excessive labels;
- independent scrollbar in this batch.

---

# Acceptance criteria

## Destination controls

1. Destination controls appear above Exports.
2. Outpost selector keeps current descriptive behavior.
3. Outposts with zero cargo pads are unavailable or omitted.
4. Current outpost cannot be selected.
5. Pad selector only appears after an Outpost is selected.
6. Pad selector preserves current informative option labels.
7. Changing destination Outpost creates one history action.
8. Changing destination Pad creates one history action.
9. Selecting the current value again creates no history.
10. Unlinking creates one history action and preserves outbound items.
11. Undo restores previous destination pairing.

## Broken-link behavior

12. If remote endpoint becomes invalid/deleted, local pad reverts to Unlinked.
13. Remote Outpost/Pad selection clears.
14. Existing local outbound selections remain.

## Inter-System

15. Checkbox is replaced by toggle button.
16. Visible terminology is `Inter-System`.
17. Off/on are the only interactive states.
18. Selected + actual He-3 may use distinct positive/lit styling.
19. Planned Supply He-3 alone does not trigger the positive state.
20. Toggle remains editable while unlinked.
21. Toggle does not auto-correct destination/type combinations.
22. Each toggle change is one history action.

## Remove

23. Button text is `Remove`.
24. Existing pad/link cleanup and Undo semantics remain intact.

## Exports layout

25. `Exports` is the only subsection heading.
26. No visible Inorganic/Organic/Manufactured headings.
27. Groups appear in inorganic -> organic -> manufactured order.
28. Empty groups leave no gap.
29. Items are alphabetical within group.
30. Buttons are compact and smaller than Outpost Details matrix buttons.
31. Groups wrap naturally.
32. No nested export scrollbar/truncation/+N-more.

## Export candidate/state behavior

33. Displayed candidates are `actual ∪ planned ∪ current pad exports`.
34. Eligible unselected items are normal unselected.
35. Eligible selected items are normal selected.
36. Stale selected items remain visible and removable.
37. Stale selected items have distinct dim/warning-like selected presentation.
38. Unavailable + unselected items are omitted.
39. Planned-only items remain normal candidates.
40. Provenance changes do not alter export-selection state.

## Empty state

41. If no candidates exist, `Exports` remains visible.
42. Compact empty state is shown.

## Outpost Details Logistics

43. Unlinked outbound selections do not light Logistics.
44. Linked outbound selections do light Logistics.
45. Route only needs a defined destination, not full validator success.
46. Removing the CargoLink dims corresponding Logistics cells.
47. Undo restoring the CargoLink relights them.
48. Imports behavior is unchanged.

## Regression

49. Cargo Pad compact header remains unchanged.
50. Planned Supply remains unchanged.
51. Outpost Details matrix layout remains unchanged except Logistics semantics.
52. Existing cargo validators remain intact.
53. JSON/schema remains unchanged.
54. No Cargo Pads independent vertical scrollbar is added.
55. No Cargo Pad reorder/reshuffle feature is added.

---

# Verification

Run:

```bash
npm run build
```

Run targeted lint/tests for changed files.

Run:

```bash
git diff --check
```

Run full lint if that is the established workflow, but do not fix unrelated pre-existing failures.

---

# Manual test checklist

## Destination history

- create a link;
- change remote Outpost;
- confirm remote Pad clears appropriately;
- Undo;
- confirm original Outpost + Pad restore together;
- Redo;
- confirm changed state restores.

Repeat for only remote Pad change.

Select `Unlinked`:

- confirm outbound selections remain;
- Undo;
- confirm link restores.

## Zero-pad outposts

- confirm outposts with zero cargo pads cannot be selected as normal destinations.

## Broken endpoint

- establish link;
- remove/delete remote pad using current app behavior;
- confirm local pad becomes Unlinked;
- confirm local outbound selections remain.

## Inter-System

- toggle on/off;
- confirm one history action per toggle;
- confirm it works while unlinked;
- with no actual He-3: selected normal;
- with Planned Supply He-3 only: still selected normal;
- with actual He-3: selected positive/lit;
- remove actual He-3: positive enhancement disappears, toggle remains on.

## Export groups

Use outpost with many eligible items:

- confirm compact controls;
- confirm wrapping;
- confirm group order;
- confirm no visible group headings;
- confirm alphabetical ordering;
- confirm no empty gaps.

## Stale export

- select an export;
- remove both actual and Planned Supply availability;
- confirm export stays visible as selected stale state;
- click it;
- confirm it is removed normally.

## Planned-only export

- make item Planned Supply only;
- confirm normal candidate;
- select export;
- confirm normal selected appearance;
- existing unresolved-source validator may still warn.

## Logistics correction

Unlinked pad:

- select several outbound exports;
- confirm Outpost Details Logistics remains dim/off.

Then link the pad:

- confirm corresponding Logistics cells light.

Unlink:

- confirm they dim.

Undo:

- confirm they relight.

Test an invalid-but-defined route if practical:

- confirm Logistics still lights because destination is defined;
- validator should independently warn.

## Regression

- Cargo Pad compact header unchanged;
- pad removal still works/undos;
- existing Pad selector descriptive labels remain;
- Planned Supply unchanged;
- Imports unchanged;
- no new right-column scrollbar;
- no reorder UX added.

---

# Completion report

Report:

- files changed;
- destination selector/history changes;
- how zero-pad outposts are handled;
- Inter-System toggle implementation and He-3-positive state;
- export candidate derivation;
- stale export presentation;
- compact export grouping/wrapping approach;
- routed-export vs configured-outbound Logistics derivation;
- commands run and outcomes;
- any pre-existing lint failures left untouched;
- manual checks recommended before commit.

Do not commit or push changes.
