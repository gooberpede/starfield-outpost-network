# Codex Implementation Brief — Planned Supply UI Redesign

## Objective

Redesign the Planned Supply editor into a dense, spatially meaningful toggle-grid interface driven entirely by the enriched runtime reference data.

This batch is **UI/presentation only**.

Do not change Planned Supply domain semantics, persisted network structure, cargo logic, availability logic, history behavior, or reference-data generation.

The reference-data enrichment batch has already been completed and committed. The application now has the metadata needed to derive the Planned Supply layouts from runtime catalogue data.

## Read first

Before editing, read and follow:

- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current implementation of:

- `PlannedSupplyEditor`
- outpost availability derivation
- Planned Supply persistence and auto-retirement behavior
- reference-data `Resource` and `Product` types
- current resource/product abbreviations
- Undo/Redo integration for Planned Supply changes
- existing relevant CSS/component conventions

Do not infer a different domain model from the new UI.

## Domain semantics to preserve

Planned Supply represents **unresolved supply intent** at an outpost.

It is not actual availability.

Actual availability is derived elsewhere from sources such as:

- active local resource production;
- local manufactured output;
- inbound cargo.

The existing Planned Supply semantics must remain unchanged.

### Three states

Every resource/product in the Planned Supply catalogue is conceptually in exactly one of three states.

#### Available

The item is currently actually available at the outpost.

UI behavior:

- visible;
- remains in its stable grid position;
- cannot be added to Planned Supply;
- cannot be toggled as Planned;
- visually reads as unavailable for interaction / already satisfied;
- remains hoverable and/or focusable enough to expose the item's full-name tooltip.

#### Neither

The item is not actually available and is not currently Planned.

UI behavior:

- visible;
- selectable;
- normal unselected appearance.

#### Planned

The item is not actually available and is currently in Planned Supply.

UI behavior:

- visible;
- selectable;
- clearly selected appearance;
- clicking/toggling removes it from Planned Supply.

### Existing lifecycle rules

Preserve the existing behavior:

- when an actual source appears for an item that is Planned, the corresponding Planned Supply entry is automatically retired;
- if that actual source later disappears, Planned Supply is **not** automatically recreated;
- Undo restores automatically retired Planned Supply when undoing the action that caused that retirement;
- one deliberate Planned Supply toggle remains one history action;
- network persistence continues to store only the existing Planned Supply item identities, not UI metadata.

Do not change these rules in this batch.

## Catalogue coverage

The Planned Supply editor should display all relevant catalogue items in these three sections:

```text
Inorganic Resources
Organic Resources
Manufactured Products
```

Do not dynamically hide items merely because they are already available.

Do not filter the catalogue by:

- current planetary extractability;
- current local production;
- current cargo;
- current recipes;
- current biome;
- current skill state;
- current availability.

Availability changes only the item state/presentation.

Do not include non-catalogue placeholder values such as:

- `None`
- `Toxin Agent`
- generic `Unique`

These should already be absent from the runtime catalogue.

## Runtime metadata available

The runtime reference data now conceptually includes:

```ts
type Resource = {
  id: string
  name: string
  shortName: string
  category: 'inorganic' | 'organic'
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic' | 'unique'
  parentId: string | null
  sortOrder: number | null
}
```

```ts
type Product = {
  id: string
  name: string
  shortName: string
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic' | 'unique'
}
```

Use the actual project types.

Do not add a parallel UI-only classification table duplicating this metadata.

## Shared visual grammar

All three sections use vertical placement to encode rarity/order progression.

The rarity sequence is:

```text
common
uncommon
rare
exotic
unique
```

However, **do not display visible rarity labels**.

The spatial arrangement may imply rarity, but rarity text is not useful enough for the outpost-planning task to justify visual noise.

No row headers such as `Common`, `Uncommon`, `Rare`, `Exotic`, or `Unique` should appear in the grids.

## Shared item-control requirements

Use a dense toggle-button style rather than checkbox lists.

Each item control should primarily show `shortName`.

Examples:

```text
Al
SiH3Cl
GDl
VFR
```

The full player-facing item name should be available via tooltip.

### Equal dimensions within each grid

This is a hard requirement.

Within each individual grid:

- every item button/cell must have the same width;
- every item button/cell must have the same height.

Grid A may use different button dimensions from Grid B.

For example:

- every inorganic button must be the same size as every other inorganic button;
- every organic button must be the same size as every other organic button;
- every manufactured-product button must be the same size as every other manufactured-product button.

Long/full names must never influence item dimensions because full names are tooltip-only.

The visual goal is closer to a **Periodic Table** than to a flowing tag/chip list.

### No connector lines

Do not add:

- tree branches;
- relationship lines;
- braces;
- family borders;
- family boxes;
- arrows;
- explicit connector graphics.

Familial/group relationships are communicated by **proximity and whitespace only**.

### Stable positions

An item's position must not change when its state changes among Available / Neither / Planned.

Do not re-sort by state.

Do not group selected items separately.

Do not move available items out of the grid.

## State presentation

The exact CSS treatment may follow existing design conventions, but semantic contrast must be clear.

### Available

Should look close to a conventional disabled/satisfied state.

Requirements:

- visually de-emphasized compared with selectable items;
- clearly not toggleable;
- still permits tooltip access;
- should not disappear;
- should not appear selected as Planned.

Do not use a native `disabled` implementation if doing so prevents intended hover/focus tooltip behavior.

Using a wrapper, `aria-disabled`, or another accessible non-interactive pattern is acceptable if it preserves tooltip/focus behavior.

Do not broaden this task into a full application accessibility redesign.

### Neither

Normal selectable state:

- clearly interactive;
- not visually selected.

### Planned

Selected state:

- clearly distinguishable from Neither;
- still interactive so it can be removed from Planned Supply.

Do not add an extra `Planned` text label inside every button.

## Section 1 — Inorganic Resources

### Layout intent

This grid is spatially meaningful.

Vertical placement corresponds to rarity progression.

Horizontal placement corresponds to **resource-family topology**, derived from:

- `parentId`
- `rarity`
- `sortOrder`

Do not alphabetize the whole inorganic catalogue.

Do not hardcode exact resource pixel coordinates.

Do not maintain a second hand-authored family layout table if runtime metadata can derive the same structure.

### Family structure

The major inorganic families should appear as adjacent spatial blocks.

Family relationships are communicated through:

- aligned rarity progression;
- sibling placement;
- proximity;
- whitespace between family blocks.

No visible family labels are required.

No family borders.

No connector lines.

### Root ordering

The main family roots carry `sortOrder`.

Use the reference metadata to derive their left-to-right order.

The intended current order is:

```text
Aluminium
Argon
Chlorine
Copper
Iron
Lead
Nickel
Uranium
```

Do not hardcode this list unless required as a defensive assertion; derive it from root `sortOrder`.

### Branch ordering

Where siblings have explicit `sortOrder`, honor it.

Example:

```text
Fluorine
  Gold            sortOrder 1
  Tetrafluorides  sortOrder 2
```

Where sibling `sortOrder` is absent, use deterministic ordering.

Prefer alphabetical ordering for siblings with no explicit semantic order unless current metadata already implies another stable ordering.

### Family block geometry

Each family may consume more than one internal column where branching requires it.

The renderer should derive a compact family block from the tree and rarity rows.

Conceptually, the resulting topology should resemble:

```text
Aluminium | Argon            | Chlorine        | Copper             | Iron      | Lead             | Nickel   | Uranium
Beryllium | Benzene          | Chlorosilanes   | Fluorine            | Alkanes   | Silver Tungsten  | Cobalt   | Iridium
Neodymium | Carboxylic Acids | Lithium         | Gold Tetrafluorides | Tantalum  | Mercury Titanium | Platinum | Vanadium
Europium  | Neon             | Caesium Xenon   | Antimony Ionic Liq. | Ytterbium | Dysprosium       | Palladium| Plutonium
Indicite  | Veryl            | Aldumite        |                     | Rothicite |                   | Tasine   | Vytinium
```

This is illustrative of topology and spacing, not a requirement to hardcode these exact text columns.

### Singleton/special inorganic block

Water and Helium-3 are parentless singleton inorganic resources and are not part of the eight major family trees.

They should appear in their **own separate block above the main family grid**.

Current block:

```text
Water
Helium-3
```

Eventually X-Tech may join this block, but do not add X-Tech now unless it already exists as an eligible runtime resource.

Semantically this special block sits before/above the ordinary Common row because these resources occupy a practical niche even more basic/common than the main family roots.

Do not force Water or Helium-3 into fake families.

Do not give them fake parent relationships.

Do not label the block with a fake rarity tier.

The special block should visually read as part of Inorganic Resources while remaining spatially separate from the main family structure.

### Equal inorganic button size

Every inorganic item control must have identical dimensions, including:

- Aluminium;
- Chlorosilanes;
- Water;
- Helium-3;
- unique-tier resources.

The special block and family grid should use the same inorganic item-cell dimensions.

## Section 2 — Organic Resources

### Layout

Organic resources have no family hierarchy.

Use:

```text
vertical: rarity progression
horizontal: alphabetical within each rarity row
```

Do not display rarity labels.

The current catalogue contains 30 organic resources and currently has six items in each rarity tier, but do not hardcode `6` as a domain invariant unless required only for layout sizing.

Derive rows from runtime data.

### Alignment

This must be a true aligned grid, not a wrapping flex/tag layout.

Within the Organic Resources grid:

- each rarity row starts at the same left edge;
- alphabetical position defines the column within that row;
- columns align vertically across rows;
- all organic cells have equal dimensions.

Conceptually:

```text
[row 1] [A] [B] [C] [D] [E] [F]
[row 2] [A] [B] [C] [D] [E] [F]
[row 3] [A] [B] [C] [D] [E] [F]
[row 4] [A] [B] [C] [D] [E] [F]
[row 5] [A] [B] [C] [D] [E] [F]
```

No visible row labels.

The Organic grid does not need to align vertically or horizontally with the Inorganic or Manufactured grids.

Alignment **within the Organic grid** is the requirement.

## Section 3 — Manufactured Products

### Layout

Use:

```text
vertical: rarity progression
horizontal: alphabetical within each rarity row
```

Do not use fabricator type as the primary visual grouping.

The product catalogue now contains actual rarity metadata.

Do not display rarity labels.

### Alignment

Use a true aligned grid.

Within the Manufactured Products grid:

- each rarity row starts at the same left edge;
- items in each row are alphabetical;
- column positions align vertically within the grid;
- all manufactured-product cells have equal dimensions.

The current rarity counts are uneven, so the right edge will be ragged.

That is intentional and acceptable.

Conceptually:

```text
[row 1] [A] [B] [C] [D] [E]
[row 2] [A] [B] [C] [D] [E] [F]
[row 3] [A] [B] [C] [D] [E] [F] [G]
[row 4] [A] [B] [C] [D] [E]
[row 5] [A] [B] [C] [D] [E] [F] [G]
```

Do not force empty placeholder controls merely to create a rectangular right edge.

The Manufactured grid does not need to align with the Organic grid.

Alignment **within the Manufactured grid** is the requirement.

## Component architecture

Prefer a reusable presentation abstraction where it genuinely reduces duplication.

Potentially useful reusable concepts include:

- item-state derivation;
- a common Planned Supply toggle cell;
- rarity grouping helpers;
- alphabetic row sorting;
- tooltip handling.

Do not force the inorganic family-tree layout into the same rendering abstraction as the organic/manufactured flat rarity grids if that makes the code harder to understand.

A clean decomposition might be:

```text
shared PlannedSupplyItemControl
shared state helpers
+
specialized InorganicPlannedSupplyGrid
+
shared/related flat rarity-grid renderer for Organic + Manufactured
```

or another similarly clear structure.

Follow existing project conventions.

Add comments consistent with project expectations:

- file-level Purpose / Architecture / Change-this-file notes for new/edited files where appropriate;
- short function intent comments;
- explanation of non-obvious layout derivation, especially inorganic family topology.

## Item-state derivation

Do not persist UI state for Available / Neither / Planned.

These states are derived from:

- current actual availability;
- current persisted Planned Supply item identities.

Use stable resource/product IDs.

Avoid duplicating equivalent state arrays if existing helpers already expose availability.

Do not create a second persisted Planned Supply model for the grid.

## Interaction behavior

### Toggle Neither -> Planned

Clicking/selecting a Neither item adds the appropriate item identity to Planned Supply.

Use the same domain update/history path as the existing editor.

### Toggle Planned -> Neither

Clicking/selecting a Planned item removes it from Planned Supply.

### Available

Available items must not change Planned Supply when clicked.

If implemented using non-button wrappers or `aria-disabled`, ensure no accidental toggle event fires.

### Keyboard/focus

Maintain reasonable keyboard/focus behavior for selectable controls.

Available items should remain inspectable enough for tooltip/full-name access.

Do not broaden into a full keyboard-shortcut system.

## Tooltips

Every item control should expose the full player-facing name.

Examples:

```text
Al -> Aluminium
SiH3Cl -> Chlorosilanes
GDl -> Gastronomic Delight
VFR -> Vytinium Fuel Rod
```

Use a simple implementation compatible with the current app.

Do not add a heavyweight tooltip dependency.

If native `title` is sufficient within current project conventions, it is acceptable.

The important requirement is that Available items still expose the full name.

## Section headings and spacing

Keep the three section names visible:

```text
Inorganic Resources
Organic Resources
Manufactured Products
```

Use whitespace to separate sections clearly.

Do not add visible rarity headings.

Do not add excessive explanatory text around the grids.

This is intended to be a dense working control, not a reference manual.

## Responsiveness / overflow

The layout should prioritize dense desktop usability.

Do not destroy the spatial meaning of the inorganic family grid merely to force it into a narrow width.

Inspect the current workspace width and CSS conventions.

If necessary, allow horizontal overflow/scroll for a grid rather than:

- wrapping family blocks unpredictably;
- reordering cells;
- collapsing semantic spacing;
- converting to a mobile tag cloud.

Do not redesign the entire workspace scrolling model in this batch.

Navigation/workspace independent scrolling remains a separate backlog concern.

Keep responsive changes narrowly scoped to the Planned Supply editor.

## Styling constraints

Use the application's existing visual language.

Do not introduce unrelated theme systems or dependencies.

Do not hardcode colors unless existing project CSS conventions already use project variables/tokens.

Visual priorities:

- dense;
- legible;
- stable;
- equal-sized cells;
- strong selected/unselected/available distinction;
- proximity-based hierarchy;
- minimal decorative chrome.

Avoid:

- gradients unless already standard;
- relationship lines;
- family cards/boxes;
- rarity badges;
- noisy legends;
- dynamically changing cell sizes;
- text wrapping inside abbreviation cells.

## Accessibility scope

Implement sensible local semantics:

- selectable toggles should expose selected state appropriately;
- Available controls should expose that they are not actionable;
- tooltip/full name should be reachable/available;
- section headings should remain semantic.

Do not attempt a broad accessibility redesign of the entire application.

Do not introduce inconsistent bespoke keyboard behavior unless necessary.

## Non-goals

Do not change:

- Planned Supply persistence shape;
- Planned Supply auto-retirement semantics;
- availability computation;
- cargo behavior;
- manufacturing behavior;
- production behavior;
- Undo/Redo architecture;
- network schema version;
- JSON import/export schema;
- browser storage format;
- reference-data generation;
- resource rarity values;
- product rarity values;
- inorganic family metadata;
- organic occurrence data;
- planner algorithms;
- throughput;
- quantities;
- supply-source assignment;
- recipe feasibility;
- biome plausibility;
- organic farming prerequisites;
- X-Tech eligibility;
- general workspace layout;
- cargo-pad UI;
- navigation UI.

Do not commit or push changes.

## Acceptance criteria

This batch is complete when all of the following are true.

### General

1. The old checkbox-heavy Planned Supply presentation is replaced with dense toggle-button grids.
2. All relevant catalogue resources/products remain visible regardless of current availability.
3. Every item has a stable grid position independent of Available/Neither/Planned state.
4. Full names are available via tooltip.
5. Available items cannot be toggled but remain inspectable for tooltip/full-name access.
6. Planned items are clearly selected.
7. Neither items are clearly selectable and unselected.
8. Existing Planned Supply persistence and auto-retirement behavior is unchanged.
9. Undo/Redo behavior remains unchanged.
10. No persisted schema migration/version change is introduced.

### Inorganic Resources

11. Water and Helium-3 appear in a separate singleton/special block above the main family grid.
12. Main family roots are ordered from runtime `sortOrder`.
13. Family topology is derived from `parentId`, rarity, and sibling ordering metadata.
14. No connector lines, family borders, or explicit hierarchy graphics are used.
15. Family relationships are communicated through proximity/whitespace only.
16. Every inorganic item cell has identical dimensions.
17. No rarity labels are displayed.

### Organic Resources

18. Rows follow rarity progression.
19. Items within each row are alphabetical.
20. Columns align vertically within the Organic grid.
21. Every organic item cell has identical dimensions.
22. No rarity labels are displayed.

### Manufactured Products

23. Rows follow rarity progression.
24. Items within each row are alphabetical.
25. Columns align vertically within the Manufactured grid.
26. Ragged right edge is allowed and expected.
27. Every manufactured-product cell has identical dimensions.
28. No rarity labels are displayed.

### Regression

29. Existing networks load normally.
30. Planned Supply edits still create correct history entries.
31. Actual supply still retires matching Planned Supply automatically.
32. Removing actual supply does not recreate Planned Supply automatically.
33. Reference-data loading remains unchanged.

## Verification

Run:

```bash
npm run build
```

Run targeted lint/tests for changed files.

Run full lint if that is the project workflow, but do not fix unrelated pre-existing lint failures.

Run:

```bash
git diff --check
```

### Manual verification

At minimum manually test:

#### Basic toggle behavior

- pick an outpost with neither/planned/available examples;
- toggle a Neither item on;
- confirm it becomes Planned without moving;
- toggle it off;
- confirm it returns to Neither without moving.

#### Available behavior

- confirm actually available items remain visible;
- confirm they cannot be added to Planned Supply;
- confirm their tooltip still exposes the full name.

#### Auto-retirement

- plan an item;
- create/add an actual source for that item using existing app controls;
- confirm the Planned Supply selection retires automatically;
- Undo the source-creating action;
- confirm Planned Supply is restored as before.

#### Inorganic layout

- confirm Water + Helium-3 are above the main family grid;
- confirm major family ordering is correct;
- inspect branching families such as Copper and Lead;
- confirm proximity/whitespace communicates structure without lines;
- confirm all inorganic buttons are the same size.

#### Organic layout

- confirm rarity progression from top to bottom;
- confirm alphabetical ordering within rows;
- confirm column alignment within the grid;
- confirm all cells have identical dimensions.

#### Manufactured layout

- confirm rarity progression from top to bottom;
- confirm alphabetical ordering within rows;
- confirm vertical column alignment within the grid;
- confirm ragged right edge rather than padded fake controls;
- confirm all cells have identical dimensions.

#### Import/storage regression

- reload the app;
- reload reference data if needed;
- confirm an existing browser-saved network loads;
- if practical, import an existing JSON network and confirm Planned Supply state renders correctly.

## Completion report

At completion, report:

- files changed;
- any new components/styles/helpers created;
- how the inorganic layout is derived;
- how Available/Neither/Planned state is derived;
- commands run and outcomes;
- any pre-existing lint failures left untouched;
- any UI assumptions made;
- manual checks recommended before commit.

Do not commit or push changes.
