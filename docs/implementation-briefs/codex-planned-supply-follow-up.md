# Codex Follow-up Brief — Planned Supply Compact View + Inorganic Family Centering

## Objective

Make two focused refinements to the Planned Supply UI:

1. restore collapse/expand behavior with a compact Planned Supply summary;
2. refine inorganic family geometry so ancestors are visually centered over branching descendants.

Do not redesign the rest of Planned Supply.

Do not change Planned Supply domain semantics, persistence, availability, history, reference data, cargo validation, or other outpost UI.

---

# Read first

Before editing, read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current:

- `PlannedSupplyEditor.tsx`
- `PlannedSupplyEditor.css`

Also inspect the implementation immediately prior to the current redesign if useful for understanding the former collapse/expand interaction, but do not restore the old checkbox-list presentation.

---

# Scope

This follow-up has exactly two functional goals:

## Goal A — restore collapse/expand with compact summary

Expanded state remains the current full three-section catalogue editor.

Collapsed state becomes a compact summary of only currently Planned items.

## Goal B — improve inorganic branch geometry

Keep the current metadata-driven family layout, but center ancestors over the descendant footprint when a branch widens.

Everything else should remain unchanged unless strictly required to support these two refinements.

---

# Goal A — Compact Planned Supply view

## Collapse/expand control

Restore a collapse/expand control in the `Planned Supply` heading.

Requirements:

- local presentation state only;
- not persisted;
- not part of Undo/Redo history;
- existing Planned Supply data must not change when collapsing or expanding;
- use the project's existing collapse/expand interaction conventions where practical;
- expose `aria-expanded`.

Expanded state should remain the current full editor.

Collapsed state should render the compact summary described below.

## Expanded state

Do not materially redesign the current expanded state.

It should continue to show:

```text
Inorganic Resources
Organic Resources
Manufactured Products
```

with the current grid behavior, except for the inorganic centering refinement described later.

## Collapsed state purpose

Collapsed state is:

> a compact status summary of current Planned Supply plus a lightweight way to remove planned items.

It is **not** a miniature version of the expanded spatial catalogue.

Do not preserve rarity rows, inorganic family topology, or the expanded section geometry in collapsed mode.

## Collapsed item coverage

Show only items currently present in `plannedSupply`.

Do not show:

- Available-only items;
- Neither items;
- unselected catalogue items.

If there are no Planned Supply items, show:

```text
No planned supply.
```

Keep that presentation compact.

## Collapsed grouping order

Group planned items in this order:

1. inorganic resources;
2. organic resources;
3. manufactured products.

Do not show visible group labels unless needed for accessibility or implementation clarity.

The visual grouping should primarily be conveyed by spacing.

## Sorting within groups

Sort alphabetically by full player-facing item name within each group.

Do not use rarity order in compact mode.

Do not use inorganic family order in compact mode.

The compact summary's purpose is easy scanning, not preserving the expanded editor's semantic topology.

## Compact visual layout

Render the compact items as a horizontal sequence of abbreviation buttons that wraps naturally when required.

Conceptually:

```text
Planned Supply
[Ag] [Cu]   [Mem] [Slv]   [VFR]
```

Requirements:

- buttons use abbreviations;
- full names remain available via tooltip;
- small extra horizontal spacing should separate the three category groups;
- wrapping onto subsequent lines is allowed and expected;
- do not force the category groups onto separate rows;
- do not insert visible text headings between groups;
- keep the presentation dense.

The exact group gap may follow existing CSS conventions.

## Compact button behavior

Compact buttons are interactive.

Clicking a compact Planned item:

- removes it from Planned Supply using the existing toggle pathway;
- creates the same Undo/Redo history entry as removal from expanded view;
- causes the item to immediately disappear from the compact summary.

After removal:

- the item is not selectable again while collapsed because it is no longer visible;
- the user must expand the full editor to re-add it;
- Undo must restore it and cause it to reappear in the compact summary.

Do not create a separate compact-view mutation pathway.

Use the same domain callback/path as the expanded Planned toggle.

## Compact item state

Every item shown in compact mode is, by definition, Planned.

Do not show Available or Neither styling variants there.

Use the existing Planned visual grammar where appropriate.

## Compact grouping implementation

Derive groups from runtime reference data and `plannedSupply`.

Do not persist group information.

Do not add category metadata to the network model.

Use stable IDs and existing resource/product catalogues to resolve:

- name;
- shortName;
- resource category.

Handle impossible/missing catalogue references consistently with current project behavior rather than inventing silent fallbacks.

---

# Goal B — Inorganic family ancestor centering

## Current issue

The current layout correctly derives family branches from:

- `parentId`;
- `rarity`;
- `sortOrder`.

However, the current placement algorithm anchors a parent to the leftmost descendant column.

For a branching family such as Copper, this produces:

```text
[Cu ][   ]
[ F ][   ]
[Au ][xF4]
[Sb ][IL ]
```

The desired visual relationship is:

```text
  [Cu ]
  [ F ]
[Au ][xF4]
[Sb ][IL ]
```

The ancestor should visually sit over the descendant footprint it governs.

## Layout principle

Use this rule:

> Descendants establish the horizontal footprint. A single ancestor should be visually centered over the descendant span beneath it.

This is especially important because the design deliberately uses no connector lines.

The layout should communicate hierarchy through:

- proximity;
- alignment;
- whitespace.

## Non-branching families

A purely linear family should remain visually unchanged.

Example:

```text
[Al]
[Be]
[Nd]
[Eu]
[Ie]
```

Do not add unnecessary offsetting when there is only one descendant path.

## Branching families

When a parent has multiple child branches:

- allocate each child branch a compact horizontal footprint;
- keep sibling branches adjacent;
- center the parent over the total child span;
- recursively apply the same logic at deeper branching points.

## Equal cell dimensions remain mandatory

Do not change the existing rule that all inorganic item buttons use identical width and height.

Centering may require:

- a finer internal column lattice;
- half-step placement;
- CSS grid spans;
- transforms;
- nested branch wrappers;
- or another clean derived-layout technique.

Choose the smallest clear approach.

Do not solve centering by making ancestor buttons wider.

Do not make branch buttons different sizes.

## Metadata-driven layout remains mandatory

Do not hardcode coordinates for named resources.

Do not create a hand-maintained map such as:

```ts
Copper: { row: ..., col: ... }
```

The layout must continue to derive from generic family topology.

Resource names may be used only in tests/assertions/examples, not as the production layout mechanism.

## Ordering rules remain unchanged

Preserve current root ordering from `sortOrder`.

Preserve sibling ordering from:

- explicit `sortOrder` where present;
- deterministic fallback ordering otherwise.

Do not change family order.

Do not change rarity row order.

Do not move Water/Helium-3 out of their special block.

## No relationship graphics

Continue to avoid:

- connector lines;
- tree branches;
- arrows;
- family borders;
- braces.

The refinement is positional only.

---

# Existing behavior to preserve

Do not change:

- three-state Available / Neither / Planned semantics;
- Available items remaining visible in expanded mode;
- Available items being non-toggleable;
- tooltip behavior;
- equal-size controls within grids;
- organic alphabetical ordering within rarity rows;
- manufactured alphabetical ordering within rarity rows;
- Water/Helium-3 special block above main inorganic families;
- horizontal overflow behavior;
- Planned Supply persistence;
- auto-retirement when actual supply appears;
- non-recreation when actual supply later disappears;
- Undo/Redo architecture;
- cargo-export validation;
- import/export;
- storage;
- reference-data types;
- network schema;
- other Outpost Details sections.

---

# Cargo validation explicitly out of scope

Do not change the existing validation behavior:

```text
This cargo export has no actual source.
```

when a cargo export is backed only by Planned Supply rather than actual availability.

Planned Supply makes an item selectable as intended supply but does not make it actually available.

That validator remains correct and is not part of this follow-up.

---

# Component architecture

Prefer a clear split between:

- expanded catalogue rendering;
- compact summary rendering;
- shared item-resolution helpers;
- shared Planned toggle callback;
- inorganic family layout derivation.

Do not duplicate Planned item mutation logic between compact and expanded modes.

If introducing helper functions for compact grouping/sorting, keep them presentation-only.

Add comments explaining:

- why compact mode uses simple category + alphabetical ordering rather than rarity/family topology;
- why inorganic ancestor centering uses descendant footprint rather than leftmost-column anchoring.

---

# Styling

Extend `PlannedSupplyEditor.css` rather than introducing another stylesheet unless existing project conventions strongly justify otherwise.

Compact summary styling should be:

- dense;
- horizontal;
- wrapping;
- abbreviation-first;
- small spacing between categories;
- compatible with existing Planned selected-state styling.

Do not add:

- visible category labels in compact mode;
- rarity labels;
- decorative separators;
- badges;
- relationship graphics.

---

# Acceptance criteria

## Collapse/expand

1. `Planned Supply` again has a collapse/expand control.
2. Expanded state shows the full current catalogue editor.
3. Collapsed state shows only currently Planned items.
4. Collapse/expand is presentation state only.
5. Collapsed empty state shows `No planned supply.`

## Compact sorting/grouping

6. Compact items are grouped inorganic, organic, manufactured.
7. Items are alphabetical by full name within each group.
8. Groups have a small visual gap between them.
9. Items wrap naturally across lines.
10. No visible rarity or category headings are shown in the compact list.

## Compact interaction

11. Compact buttons remain interactive.
12. Clicking one removes it from Planned Supply via the existing history-aware mutation path.
13. Removed items immediately disappear from compact view.
14. Undo restores removed items and makes them reappear.
15. Re-adding a removed item requires expanding the full editor.

## Inorganic centering

16. Non-branching family chains remain visually linear.
17. When a branch widens, ancestors are visually centered over the descendant footprint.
18. Copper should visually resemble:

```text
  [Cu ]
  [ F ]
[Au ][xF4]
[Sb ][IL ]
```

rather than the current left-anchored form.
19. The solution is generic and metadata-driven.
20. No named-resource coordinate table is introduced.
21. Equal inorganic cell dimensions are preserved.
22. No connector lines or family borders are introduced.

## Regression

23. Available / Neither / Planned expanded-state behavior remains unchanged.
24. Water and Helium-3 remain in their special block.
25. Organic and manufactured layouts remain unchanged.
26. Existing Planned Supply auto-retirement semantics remain unchanged.
27. Undo/Redo remains correct.
28. Existing cargo export validation remains unchanged.
29. No persisted schema change is introduced.

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

## Manual checks

### Collapse/expand

- start expanded;
- collapse Planned Supply;
- confirm only Planned items remain visible;
- expand again;
- confirm the full catalogue returns.

### Compact empty state

- remove all Planned items;
- collapse;
- confirm `No planned supply.`

### Compact grouping/sorting

Create a mixed Planned Supply set and confirm:

- inorganic first;
- organic second;
- manufactured third;
- alphabetical by full name within each group;
- small visual gap between groups.

### Compact removal

- click one compact item;
- confirm it vanishes;
- Undo;
- confirm it returns;
- remove it again;
- confirm it can only be re-added after expanding.

### Inorganic family layout

Inspect:

- Copper family;
- Lead family;
- Chlorine family;
- any other branching family.

Confirm ancestors are centered over the descendant span.

Confirm linear families remain straight.

Confirm all inorganic buttons remain identical dimensions.

### Regression

- toggle Planned items in expanded view;
- confirm Available items remain visible/non-toggleable;
- confirm tooltips still work;
- confirm horizontal overflow still behaves as before;
- confirm existing browser-saved network loads normally.

---

# Completion report

At completion, report:

- files changed;
- how compact grouping/sorting is derived;
- how compact removal reuses the existing mutation/history path;
- how ancestor centering is derived generically;
- commands run and outcomes;
- any pre-existing lint failures left untouched;
- manual checks recommended before commit.

Do not commit or push changes.
