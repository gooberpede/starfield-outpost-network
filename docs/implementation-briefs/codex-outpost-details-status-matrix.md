# Codex Implementation Brief — Outpost Details Status Matrix

## Objective

Redesign the **upper half of Outpost Details** into a shared, stable status matrix that makes local resources, manufacturing, inputs, exports, and imports easy to scan.

This batch is **Outpost Details only**.

Do not redesign Cargo Pads in this batch.

Do not change the persisted Outpost Network schema.

Do not change reference-data generation.

Do not change cargo-domain semantics, Planned Supply semantics, import/export JSON shape, or validation rules except where a UI path must call existing domain logic correctly.

The new design should establish one coherent matrix:

```text
Item | Source | Present | Producing | Inputs | Logistics
```

Each section uses the same column geometry, leaving semantically irrelevant cells blank.

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

- Outpost Details / selected outpost editor
- local resource editing
- active production editing
- manufacturing editing
- manufacturing input availability
- inbound cargo derivation
- outbound cargo derivation
- Undo/Redo update pathways
- body-resource reference data
- product recipe reference data
- current Outpost Details CSS/layout conventions

Preserve existing domain boundaries.

---

# Scope summary

Implement four matrix sections:

```text
Inorganic
Organic
Manufacturing
Imports
```

using one shared responsive column template:

```text
Item | Source | Present | Producing | Inputs | Logistics
```

The same conceptual column must occupy the same horizontal position across every section and across every outpost at the same viewport width.

The matrix may resize when the browser/workspace width changes, but **switching outposts must not change column positions**.

---

# Shared matrix geometry

## One shared column template

Do not build each section as independently sized tables/grids.

Use a shared responsive column definition for all sections.

The selected outpost's content must not affect column widths.

At a fixed viewport/workspace width:

- `Item` begins at the same x-position for every outpost;
- `Source` begins at the same x-position for every outpost;
- `Present` begins at the same x-position for every outpost;
- `Producing` begins at the same x-position for every outpost;
- `Inputs` begins at the same x-position for every outpost;
- `Logistics` begins at the same x-position for every outpost.

Content may change row height but not column geometry.

Use responsive CSS so the template can adapt consistently to viewport changes.

Do not use content-driven `auto` sizing that changes between outposts.

## Shared header row

Render one shared column header row:

```text
Item | Source | Present | Producing | Inputs | Logistics
```

Do not repeat the column headings independently per section.

Section headings appear below the shared header.

## Sticky behavior

Within the **Outpost Details scrolling region**:

- the shared header row should remain sticky at the top;
- the `Item` column should remain sticky at the left during horizontal scrolling;
- the top-left `Item` header should remain sticky in both axes.

Do not make these sticky to the browser viewport if that interferes with the existing PageHeader/StatusBar shell.

Do not redesign the entire workspace scrolling architecture in this batch.

If the current Outpost Details container does not yet create the needed local scrolling context, make the smallest scoped change necessary to support this matrix without implementing the deferred full workspace-scroll overhaul.

---

# Horizontal overflow and row wrapping

The structural matrix columns must not reflow into a different semantic order.

If the available width is too narrow:

- preserve the six-column geometry;
- allow the matrix region to scroll horizontally;
- keep Item sticky on the left;
- do not collapse columns underneath each other;
- do not convert to cards;
- do not reorder columns.

## Row height

Rows may grow vertically.

This is expected where a cell contains multiple compact buttons.

Prefer taller rows with wrapped button content over:

- nested cell scrollbars;
- truncating button lists;
- `+N more`;
- hiding information.

---

# Control vocabulary

Reuse the dense abbreviation-button visual language established by Planned Supply where practical.

Full item names should remain available via tooltip/title for abbreviation cells.

Within matrix state cells, controls should use equal compact dimensions where practical.

The left `Item` column should generally display the **full player-facing name**, not the abbreviation.

Examples:

```text
Iron
Carboxylic Acids
High-Tensile Spidroin
Adaptive Frame
```

The state cells to the right use abbreviations:

```text
[Fe]
[CA]
[HTS]
[AFr]
```

---

# Read-only state styling

Establish a clear visual grammar for read-only derived cells.

## Lit

Use the same positive/readable state for:

- derived active Logistics;
- required Input currently actually available.

These should look active/readable, not disabled.

## Dimmed

Use the same muted/readable state for:

- derived inactive Logistics;
- required Input not currently actually available.

Dimmed does **not** mean disabled form input.

The user should still be able to inspect the abbreviation/full-name tooltip.

Do not use native `disabled` styling as the primary visual language for derived read-only states.

---

# Actual availability for Inputs

For Input requirement state, use **actual availability only**.

Actual availability is whatever the current domain/application logic already defines from real sources such as:

- local active production;
- local manufacturing output;
- inbound cargo.

Planned Supply alone must **not** light an Input requirement.

So:

```text
required + actual source exists  -> lit
required + Planned Supply only   -> dimmed
required + no source             -> dimmed
```

Do not invent a third Planned-only input state in this batch.

Validation remains responsible for cross-network missing-input reporting.

---

# Section 1 — Inorganic

## Which rows appear

Show **all inorganic resources known to occur on the selected planetary body**.

Do not show only resources already recorded at the outpost.

The row universe comes from body-resource reference data.

Sort rows alphabetically by full resource name.

If the selected body has no inorganic resources, hide the entire Inorganic section.

## Columns

Use:

```text
Item | Source(blank) | Present | Producing | Inputs(blank) | Logistics
```

Example:

```text
Iron | | [Fe] | [Fe] | | [Fe]
```

## Present

Editable.

Meaning:

> the player has confirmed this planetary resource is present at this particular outpost site.

Turning Present on adds the resource to the outpost's existing local-resource collection using current domain/update pathways.

Turning Present off removes it from local resources.

## Producing

Editable, but `Present` is a prerequisite.

Rules:

- Producing cannot be turned on unless Present is already on.
- Do not silently turn Present on when the user clicks Producing.
- When Present is off, Producing should be visibly unavailable for editing.
- Turning Present off while Producing is on must also remove active production for that resource.
- That collateral removal must be part of the same deliberate history action as turning Present off.

Preserve existing domain integrity rules.

## Inputs

Blank for inorganic resources.

Do not render fake placeholders.

## Logistics

Read-only derived export state.

For each inorganic resource row:

- lit if at least one cargo pad at this outpost currently includes the item in outbound cargo;
- dimmed if not exported.

Do not display:

- pad names;
- source labels;
- counts;
- `local`;
- `no source`.

This column is a whole-outpost summary only.

---

# Section 2 — Organic

## Which rows appear

Show **all organic resources known to occur on the selected planetary body** from current reference data.

Sort alphabetically by full resource name.

If the selected body has no organic resources, hide the entire Organic section.

## Current columns

Use:

```text
Item | Source(blank for now) | Present | Producing | Inputs(blank for now) | Logistics
```

Example:

```text
Nutrient | | [Nut] | [Nut] | | [Nut]
```

## Present / Producing

Use the same interaction rules as inorganic resources:

- Present is editable.
- Producing requires Present.
- Producing never turns Present on automatically.
- Turning Present off also removes active production in the same history action.

## Source

Reserve the column but leave it blank in this batch.

Do not invent flora/fauna source names from incomplete data.

The eventual design may show organic source species here.

## Inputs

Reserve the column but leave it blank in this batch.

Do not invent organic farming prerequisites.

Future reference-data work may populate derived Water/Fiber/Nutrient requirements and validate them similarly to manufacturing inputs.

## Logistics

Read-only derived export state using the same lit/dimmed grammar as inorganic.

---

# Section 3 — Manufacturing

## Row grain

Rows represent **products currently configured for local manufacturing at this outpost**.

Do not show the full product catalogue as normal rows.

Sort configured rows alphabetically by full product name.

The Manufacturing section is always visible even when no products are configured.

If empty, show a compact empty state while still showing the Manufacturing heading/action bar.

## Columns

Use:

```text
Item | Source(blank) | Present(blank) | Producing | Inputs | Logistics
```

Example:

```text
Adaptive Frame | | | [AFr] | [Al][Fe] | [AFr]
```

## Producing

For Manufacturing rows, Producing is **derived/read-only lit state**.

Row existence already means:

> this product is being manufactured here.

Do not make the Producing button an independent toggle.

Stopping/starting manufacturing is controlled by Manufacturing edit mode described below.

## Inputs

Read-only derived recipe requirements.

For each recipe input:

- render one compact abbreviation button;
- use the full item name as tooltip/title;
- lit if that input is currently actually available at the outpost;
- dimmed otherwise.

Inputs may include:

- resources;
- manufactured products.

Do not visually distinguish resource vs product inputs unless current app conventions already do so.

## Inputs width/wrapping

Current manufactured recipes have at most four inputs.

Size the Inputs column to comfortably support up to four compact input buttons on one line at normal workspace widths.

Allow wrapping if necessary under narrower responsive conditions, but do not design around arbitrary long lists.

## Logistics

Read-only derived export state.

Lit if this locally manufactured product is exported on at least one cargo pad.

Dimmed if not.

Important:

If a manufactured product is imported and re-exported but **not manufactured locally**, do not create a ghost Manufacturing row just to surface its export status.

Its presence under Imports is sufficient for this version.

---

# Manufacturing edit workflow

The Manufacturing heading owns a compact action bar.

Normal mode:

```text
Manufacturing  [edit]
```

Edit mode:

```text
Manufacturing  [save] [cancel] [+]
```

The edit workflow uses a **local draft**.

Changes are staged until Save.

## Enter edit mode

Clicking `[edit]`:

- creates local draft state based on the current configured manufacturing set;
- does not mutate the persisted network;
- creates no history entry.

## Remove product

In edit mode, each existing draft row gets a remove affordance conceptually like:

```text
[-] Adaptive Frame
[-] Reactive Gauge
```

Clicking remove:

- removes that product from the local draft only;
- does not mutate persisted state yet;
- creates no history entry.

## Add product

Clicking `[+]` reveals a compact product selector in the Manufacturing action area or directly beneath it.

Conceptually:

```text
Manufacturing  [save] [cancel] [-][select product...]
```

The exact visual arrangement may follow existing form conventions.

Selector behavior:

- only products not already present in the draft are selectable;
- choose by full product name;
- after selection, add immediately to the draft;
- re-sort the draft alphabetically;
- reset/close the selector after selection;
- `[+]` can be used again to add another product.

Do not add duplicate manufacturing entries.

## Save

Clicking `[save]`:

- compares the draft to the current persisted manufacturing set;
- commits the final manufacturing set through the application/domain update pathway;
- creates **one Undo/Redo history entry** for the entire saved edit session;
- exits edit mode.

If the draft is unchanged, prefer no history entry.

Newly added manufacturing entries should use default:

```text
fabricatorCount = 1
```

or the existing project equivalent default.

Existing configured products with `fabricatorCount > 1` must retain their current stored count if they remain in the draft.

Do not normalize existing counts to 1 merely because the current UI hides quantity.

If a product is removed and then re-added within the same unsaved draft, preserve its original count if practical because no persisted removal has yet occurred.

## Cancel

Clicking `[cancel]`:

- discards the draft;
- creates no history entry;
- returns to normal mode;
- leaves persisted manufacturing unchanged.

## Switching outposts during edit mode

Do not silently save draft changes.

Use the simplest safe v1 behavior:

- discard the local draft when the selected outpost changes;
- create no history entry.

Do not add modal dirty-state prompting in this batch.

## Fabricator quantity UI

Remove/hide quantity editing from the current UI.

Keep quantity in:

- persisted model;
- JSON import/export;
- existing domain structures.

This is a version-2/throughput concern.

Do not remove the field from the model.

---

# Section 4 — Imports

## Always visible

The Imports section is always visible.

If there are no actual imports, show:

```text
No imports.
```

Do not hide the section.

## Row grain

One row per **remote source outpost**.

Outpost is the grain, not cargo pad.

If multiple inbound cargo links/pads come from the same remote outpost:

- collapse them into one Imports row.

## Aggregation

For each remote source outpost:

- aggregate all actually imported items from all links/pads from that outpost;
- de-duplicate identical items;
- show each imported item once.

Do not show duplicate `[Cu]` buttons because two links happen to send Copper.

## Layout

Imports uses the same shared matrix geometry.

The source-outpost name/label may span the unused descriptive/state columns on the left so the row is readable, while imported item buttons remain anchored in the same `Logistics` column used by Exporting above.

Conceptually:

```text
Imports

Feynman I Li Cu xF4     ..................................   [Cu] [xF4]
Feynman VI-b Al Be He3  ..................................   [Al]
```

The imported buttons must begin at the same horizontal x-position as the Logistics column above.

## Logistics cell

Imported item buttons are:

- read-only;
- lit;
- abbreviation-first;
- tooltip exposes full item name.

Because one source outpost may send many items:

- allow natural wrapping within the Logistics cell;
- allow the row to grow vertically;
- do not truncate;
- do not show `+N more`;
- do not introduce a nested horizontal scrollbar.

There is no hard maximum on imported items per source outpost.

---

# Shared ordering rules

## Inorganic

Alphabetical by full resource name.

## Organic

Alphabetical by full resource name.

## Manufacturing

Alphabetical by full product name.

## Imports

Use a deterministic source-outpost ordering.

Prefer alphabetical by source outpost display name unless existing navigation/domain order clearly provides a better established convention.

Do not make Imports row order depend on cargo-pad/link creation order if that causes unstable scanning.

---

# Empty-state rules

## Inorganic

Hide entire section if no inorganic body resources.

## Organic

Hide entire section if no organic body resources.

## Manufacturing

Always visible.

If no configured manufacturing:

- keep heading/action bar;
- show compact empty state.

## Imports

Always visible.

If none:

```text
No imports.
```

---

# History and Undo/Redo

Preserve existing whole-network snapshot history semantics.

Important requirements:

- one deliberate Present toggle = one history entry;
- turning Present off and collateral removal of Producing = same history entry;
- one deliberate resource Producing toggle = one history entry;
- Manufacturing edit session Save = at most one history entry;
- Manufacturing Cancel = no history;
- Manufacturing draft add/remove = no history until Save;
- switching outposts and discarding draft = no history;
- read-only derived cells = no history.

Do not put presentation-only edit-mode state into network history.

---

# Domain semantics to preserve

Do not change:

- local resource persistence shape;
- active production persistence shape;
- manufacturing persistence shape;
- fabricator count field;
- cargo link model;
- outbound cargo model;
- Planned Supply model;
- actual availability derivation;
- manufacturing recipe semantics;
- cargo export validation;
- manufacturing input validation;
- body-resource reference-data semantics;
- import/export JSON schema;
- schemaVersion.

If current code contains helper functions for availability/recipe validation, reuse them rather than re-deriving competing logic in the UI.

---

# Cargo Pads explicitly out of scope

Do not redesign:

- expanded Cargo Pad exports;
- Cargo Pad compact summaries;
- Cargo Pad source annotations;
- Cargo Pad layout;
- cargo link editors;
- cargo-pad reordering.

A later batch will simplify Cargo Pad export selection.

This batch may only **read** outbound/inbound cargo state to derive matrix Logistics and Imports.

---

# Planned Supply explicitly out of scope

Do not redesign Planned Supply.

Do not change its grids, compact mode, collapse behavior, or styling.

Do not use Planned Supply to light manufacturing Input requirements.

---

# Organic future behavior explicitly deferred

Do not implement:

- flora/fauna source names;
- domesticability/farmability source resolution;
- organic Water/Fiber/Nutrient prerequisite derivation;
- organic input validation changes.

The `Source` and `Inputs` columns are reserved now specifically so future organic support can populate them without redesigning the matrix.

Leave those cells blank in the current Organic section.

---

# Component architecture

Prefer extracting reusable presentation pieces if they genuinely clarify the matrix.

Possible concepts:

- shared matrix shell / column template;
- sticky header;
- row/section wrapper;
- editable state cell;
- read-only lit/dim state cell;
- compact abbreviation button;
- Manufacturing draft editor helpers;
- Imports aggregation helper.

Do not over-generalize unrelated semantics.

For example:

- resource Producing is editable;
- manufacturing Producing is derived;
- Imports Logistics is a multi-item read-only list.

They may share visuals without sharing one misleading behavior component.

Keep domain derivation outside CSS/presentation where possible.

---

# Accessibility

Use sensible local semantics:

- editable toggles expose state;
- unavailable Producing when Present is off should communicate non-actionability;
- read-only lit/dim cells remain inspectable;
- tooltips/full names remain discoverable;
- Manufacturing edit/save/cancel/add/remove controls have clear accessible labels;
- sticky header remains semantic;
- section headings remain semantic.

Do not expand this task into a full-app accessibility redesign.

---

# Styling priorities

Use existing app variables/tokens.

Priorities:

- compact;
- highly scannable;
- stable between outposts;
- shared columns;
- restrained visual chrome;
- strong vertical alignment;
- readable row grouping;
- lit/dim read-only state distinction;
- full names in Item column;
- abbreviations in state cells.

Avoid:

- independent per-section column widths;
- excessive borders;
- card-per-row layouts;
- connector graphics;
- per-outpost auto-sizing;
- large form controls;
- quantity spinners for manufacturing;
- decorative badges that obscure matrix scanning.

---

# Suggested matrix example

The result should conceptually resemble:

```text
Item             Source                 Present    Producing    Inputs        Logistics
────────────────────────────────────────────────────────────────────────────────────────

Inorganic
Alkanes                                 [HnCn]     [HnCn]                     [HnCn]
Iron                                    [ Fe ]     [ Fe ]                     [ Fe ]
Lead                                    [ Pb ]     [ Pb ]                     [ Pb ]

Organic
Nutrient                                [Nut ]     [Nut ]                     [Nut ]
Sealant                                 [Sea ]     [Sea ]                     [Sea ]

Manufacturing  [edit]
Adaptive Frame                                      [AFr ]      [Al][Fe]      [AFr ]
Reactive Gauge                                      [RGa ]      [Al][Cu]      [RGa ]

Imports
Feynman I Li Cu xF4                                                         [Cu][xF4]
Feynman VI-b Al Be He3                                                      [Al]
```

This is illustrative, not a pixel-perfect specification.

---

# Acceptance criteria

## Shared geometry

1. One shared header row exists:
   `Item | Source | Present | Producing | Inputs | Logistics`.

2. All sections use the same shared column positions.

3. Switching outposts at fixed viewport width does not move matrix columns.

4. Responsive browser/workspace resizing may change the shared template consistently.

5. Structural columns never reorder/reflow semantically.

6. Matrix can horizontally scroll when necessary.

7. Header row is sticky within Outpost Details scrolling context.

8. Item column is sticky during horizontal scroll.

## Inorganic

9. All inorganic body resources appear, alphabetically.

10. Section hides if none exist.

11. Present is editable.

12. Producing requires Present.

13. Producing does not auto-enable Present.

14. Turning Present off also clears Producing in the same history action.

15. Logistics shows lit/dim derived export state.

## Organic

16. All organic body resources appear, alphabetically.

17. Section hides if none exist.

18. Present/Producing behavior matches inorganic.

19. Source remains blank.

20. Inputs remains blank.

21. Logistics shows lit/dim export state.

## Manufacturing

22. Section always appears.

23. Rows are only locally configured manufacturing products.

24. Rows are alphabetically sorted.

25. Producing is derived/read-only lit.

26. Inputs show recipe requirements.

27. Input buttons light only for actual availability.

28. Planned Supply alone does not light inputs.

29. Logistics shows derived export state.

30. Fabricator quantity is not editable/displayed.

31. Existing hidden counts are preserved.

## Manufacturing edit mode

32. Normal mode has `[edit]`.

33. Edit mode has `[save] [cancel] [+]`.

34. Draft changes do not mutate persisted state.

35. Remove operates on draft only.

36. Add selector excludes products already in draft.

37. Added products are alphabetically re-sorted.

38. Save commits one history action.

39. Unchanged Save preferably creates no history.

40. Cancel creates no history.

41. Switching outposts discards draft without saving/history.

42. New entries use default fabricator count 1.

## Imports

43. Section always appears.

44. Empty state shows `No imports.`

45. One row per remote source outpost.

46. Multiple links from same source collapse to one row.

47. Duplicate imported items from same source are de-duplicated.

48. Imported item buttons appear in the shared Logistics column.

49. Long imported item lists wrap and increase row height.

50. No nested scrollbar/truncation/+N-more is introduced.

## Regression

51. Existing networks load normally.

52. JSON import/export remains unchanged.

53. Schema version remains unchanged.

54. Existing resource/manufacturing domain semantics remain intact.

55. Existing manufacturing input validator remains intact.

56. Existing cargo export validator remains intact.

57. Planned Supply UI remains unchanged.

58. Cargo Pad UI remains unchanged.

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

## Column stability

- open Outpost A;
- note matrix column positions;
- switch to Outpost B with different names/content;
- confirm columns do not move;
- resize browser;
- confirm all outposts adopt the same new responsive geometry.

## Sticky behavior

- scroll vertically within Outpost Details;
- confirm header remains visible;
- scroll horizontally;
- confirm Item remains visible;
- confirm top-left header behaves correctly.

## Inorganic / Organic

- confirm all body resources appear;
- confirm alphabetical sorting;
- toggle Present on/off;
- confirm Producing unavailable while Present off;
- turn Present on, then Producing on;
- turn Present off;
- confirm Producing clears in same Undo action;
- Undo and confirm both restore.

## Manufacturing normal/edit mode

- enter edit mode;
- remove two products;
- add one product;
- confirm no persisted change/history yet;
- Cancel;
- confirm original manufacturing set returns.

Repeat:

- enter edit mode;
- make several changes;
- Save;
- confirm one history entry;
- Undo;
- confirm entire previous manufacturing set restores.

## Hidden fabricator count

Use/import an existing network with a manufacturing entry count >1:

- open UI;
- confirm quantity is not displayed;
- Save unrelated manufacturing draft changes while retaining that product;
- export/reinspect data if practical;
- confirm original count remains unchanged.

## Inputs

- inspect a manufactured product with several inputs;
- confirm every recipe input appears;
- make an input actually available;
- confirm it lights;
- remove actual availability;
- confirm it dims;
- add only Planned Supply;
- confirm it remains dim.

## Exports

- configure outbound cargo for a local resource/product;
- confirm corresponding Logistics cell lights;
- remove outbound selection;
- confirm it dims.

## Imports

- create/import from one source outpost with multiple items;
- confirm one source row;
- confirm items appear once;
- create multiple inbound links from same source;
- confirm still one row;
- confirm duplicates are de-duplicated;
- use enough imports to force wrapping;
- confirm row grows vertically without breaking column geometry.

## Empty states

- body with no organics -> Organic hidden;
- Manufacturing with no products -> section still visible;
- no imports -> `No imports.` visible.

---

# Completion report

At completion, report:

- files changed;
- matrix component/CSS structure;
- how shared column widths are kept stable across outposts;
- how sticky header/Item column are scoped;
- how Present/Producing dependency is enforced;
- how export Logistics is derived;
- how manufacturing Inputs are derived/lit/dimmed;
- how Manufacturing draft/save/cancel/history works;
- how Imports are aggregated/de-duplicated;
- commands run and outcomes;
- any pre-existing lint failures left untouched;
- manual checks recommended before commit.

Do not commit or push changes.
