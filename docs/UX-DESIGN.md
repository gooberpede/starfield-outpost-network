# UX Design

## Purpose

This document defines the durable user-experience and interaction conventions for the Starfield Outpost Network application.

It exists to capture presentation and interaction decisions that are:

- broader than one implementation brief;
- more durable than a one-off UI task;
- not domain rules;
- not architectural structure;
- not unresolved backlog items.

Use this document when designing or modifying user-facing interaction, layout, density, hierarchy, navigation, selection controls, compact summaries, reordering behavior, tooltips, overflow, and similar presentation concerns.

This document should describe **settled UX principles and reusable interaction patterns**, not every screen in detail.

---

## Relationship to other project documents

Use the project documentation according to concern:

- `docs/DOMAIN-RULES.md`
  - domain meaning;
  - valid and invalid network states;
  - supply/cargo/manufacturing semantics;
  - persisted business rules.

- `docs/ARCHITECTURE.md`
  - application structure;
  - module boundaries;
  - state ownership;
  - domain/UI separation;
  - technical organization.

- `docs/UX-DESIGN.md`
  - interaction behavior;
  - presentation patterns;
  - density and layout principles;
  - visual state grammar;
  - compact/expanded interaction;
  - reordering and navigation conventions.

- `docs/BACKLOG.md`
  - deferred work;
  - unresolved UX questions;
  - later refinements;
  - ideas not yet adopted as current behavior.

- `docs/IMPLEMENTATION-WORKFLOW.md`
  - how design and implementation work is prepared, delegated, reviewed, tested, and committed.

When a UX decision conflicts with a domain rule, the domain rule wins.

Do not move domain semantics into this document merely because they affect the UI.

---

# Core UX principles

## Dense but legible

The application is a working planning tool, not a decorative dashboard.

Prefer interfaces that:

- expose useful information directly;
- make efficient use of horizontal space;
- reduce unnecessary scrolling;
- use compact controls where the meaning remains clear;
- avoid oversized cards, excessive padding, and decorative chrome.

Density should not come at the cost of scanability.

Use:

- alignment;
- stable spacing;
- consistent control dimensions;
- concise labels;
- whitespace hierarchy;
- grouping by proximity.

Avoid solving density problems by hiding useful information unnecessarily.

---

### Adapt before overflowing

Prefer layouts that use available space progressively before introducing scrollbars, clipping, or other overflow behavior.

When defining minimum widths or other hard layout constraints:

* distinguish comfortable dimensions from genuine usability minimums;
* derive hard floors from real content and control geometry rather than arbitrary buffers;
* allow appropriate text to ellipsize and flexible groups to wrap where this preserves meaning;
* reduce non-essential padding or spacing at constrained widths before forcing overflow;
* preserve fixed dimensions only where interaction, accessibility, or semantic alignment genuinely requires them;
* keep equivalent views spatially stable, but do not confuse stability with rigidity.

A hard `min-width` is a usability claim: it should correspond to the point below which further compression is demonstrably worse than scrolling.

Before introducing a hard minimum or overflow threshold, test the component near its compression limit with representative worst-case content.

---

## Stable spatial position

When possible, an item's meaning should remain tied to a stable visual location.

Changing state should not cause unrelated reordering or spatial movement.

For example:

- a Planned Supply item becoming Available remains in the same grid position;
- reordering is explicit rather than an incidental result of state changes;
- selected items are not moved into separate "selected" sections unless the design explicitly calls for a summary view.

Stable positioning helps users build spatial memory.

---

## Useful information should remain visible

Do not hide an item solely because it is not currently actionable.

A control may be:

- visible;
- informative;
- non-toggleable;
- still hoverable/focusable.

This is preferred when disappearance would remove useful context.

Example:

- an actually available Planned Supply item remains visible in the expanded catalogue rather than disappearing.

---

## Presentation state is not persisted domain state

UI-only state should remain presentation-only unless there is an explicit product reason to persist it.

Examples include:

- expanded/collapsed state;
- Reshuffle/Lock mode;
- drag interaction state;
- temporary insertion markers;
- transient interaction hints;
- selected visual tab or panel state where persistence is not required.

Presentation-state changes:

- should not mutate the persisted Outpost Network;
- should not create Undo/Redo history entries unless they represent a real domain edit;
- should not require schema changes.

---

## One deliberate action, one understandable result

A deliberate user action should produce one coherent visible outcome.

Where domain collateral effects are required, they should occur as part of the same action rather than as surprising follow-up edits.

Examples:

- one reorder operation is one history action;
- one Planned Supply toggle is one history action;
- auto-retirement of matching Planned Supply belongs to the action that introduced actual supply.

---

# Compact and expanded editors

## General pattern

Where an editor contains substantial detail, prefer a two-level interaction:

- **compact/collapsed mode** for status and lightweight actions;
- **expanded mode** for full editing.

Compact mode should not attempt to preserve the full geometry of the expanded editor.

Its job is summary and quick interaction.

Expanded mode is where the user browses the full choice space.

---

## Compact summaries

A compact summary should:

- show only information already relevant to the current state;
- use concise labels or abbreviations where appropriate;
- support lightweight removal/toggling when that is safe;
- avoid reproducing complex expanded-layout semantics;
- wrap naturally if necessary;
- remain visually quieter than the expanded editor.

If nothing is present, show a compact empty-state message.

Example:

```text
Planned Supply
[Ag] [Cu]   [Mem] [Slv]   [VFR]
```

The compact summary above is grouped by category, sorted alphabetically within each group, and uses extra whitespace rather than visible group headings.

---

## Default collapsed behavior

Dense secondary editors should generally default to compact/collapsed mode where that makes sense.

Cargo Pads already follow this pattern.

Planned Supply defaults to compact mode. Expansion remains local presentation
state and is not persisted in the network.

---

# Selection and state grammar

## Three-state selection pattern

Where a catalogue item can be:

- already satisfied;
- neither selected nor satisfied;
- deliberately selected;

use a consistent three-state grammar.

For Planned Supply:

### Available

Meaning:

- actual supply already exists.

Presentation:

- visible;
- visually de-emphasized;
- not toggleable;
- still inspectable;
- tooltip/full-name access remains available.

### Neither

Meaning:

- no actual supply;
- not currently planned.

Presentation:

- normal interactive state;
- unselected.

### Planned

Meaning:

- unresolved intended supply.

Presentation:

- visibly selected;
- remains interactive so the user can remove the plan.

Do not use disappearance as the primary way to communicate Available state in the expanded editor.

---

## Disabled-but-inspectable controls

Avoid native disabled behavior when it prevents useful inspection such as:

- hover tooltip;
- keyboard focus;
- descriptive label access.

Where necessary, prefer patterns such as:

- `aria-disabled`;
- guarded click handlers;
- wrappers that preserve tooltip behavior.

The exact implementation should remain compatible with the project's accessibility conventions.

---

# Spatial organization

## Alignment communicates structure

Use alignment where it improves scanning and comprehension.

Examples:

- Organic Resources align vertically within their own grid;
- Manufactured Products align vertically within their own grid;
- navigation columns remain stable;
- cargo-pad summaries use consistent placement.

Cross-component alignment is not required unless it serves a real purpose.

Alignment within a component matters more than forcing unrelated sections onto the same column system.

---

## Outpost status matrix

The middle Outpost Details column uses one shared status matrix for body
resources, local manufacturing, and imports. Planned Supply follows beneath
the matrix, while Cargo Pads remain in the right workspace column:

```text
Item | Source | Present | Producing | Inputs | Logistics
```

All sections share a content-independent responsive column template, so column
positions remain stable across outposts at a given width. The matrix compresses
before scrolling; scarce width may use tighter cell padding and additional
control wrapping. Horizontal scrolling begins only at the practical hard floor
instead of preserving comfortable-width spacing. Semantic columns are never
reordered or stacked, and Item remains sticky during horizontal scrolling. The
matrix grows in normal vertical flow rather than owning an artificial vertical
scrollbar; vertical scrolling belongs to the enclosing workspace/page context.

Use full names in Item and compact reference-data abbreviations in state cells.
Derived active/available state is lit; derived inactive/unavailable state is
dimmed but remains inspectable. Editable resource presence and production use
the same compact geometry while retaining button semantics.

Manufacturing configuration uses a local edit draft. Save commits the complete
set as one history action; Cancel and switching outposts discard the draft.
Fabricator quantity remains persisted but is not part of the current matrix UI.

Outpost location controls include a flexible Biome toggle region beside stable
System and Body selectors. Buttons wrap only inside that region. No pressed
buttons means unrestricted/all body biomes; pressed buttons persist selected
body-biome occurrence IDs. Equal same-name signatures share one button, while
different signatures receive numeric suffixes in biome-index order.

Organic rows are source-specific and show canonical species names in Source.
They sort plant, herbivore, carnivore, then by resource and species name. Inputs
reuse manufacturing input cells. Input quantities remain in reference data for
future throughput modelling but are not displayed because the current matrix
validates resource availability rather than production capacity. Invalid active
routes remain visible and removable with Present dimmed. Migrated ambiguous
production appears first with Source `Unspecified` and no inputs.

---

## Equal-size controls within a grid

Where a grid is intended to behave as a spatial map, all item controls within that grid should use equal dimensions.

Examples:

- all inorganic Planned Supply cells are equal size;
- all organic Planned Supply cells are equal size;
- all manufactured-product Planned Supply cells are equal size.

Different grids may use different dimensions.

Full item names should not force cell resizing when abbreviations are the primary visible label.

This supports a Periodic-Table-like visual rhythm.

---

## Proximity over connector graphics

Prefer proximity and whitespace to communicate grouping where the relationship can be understood spatially.

Avoid unnecessary:

- connector lines;
- arrows;
- braces;
- family boxes;
- heavy borders;
- relationship graphics.

For inorganic resource families, hierarchy is communicated by position and proximity.

---

## Spatial layouts may carry semantic meaning

When a layout encodes meaning, preserve that meaning rather than allowing generic wrapping or sorting to destroy it.

Examples:

- inorganic Planned Supply uses rarity vertically and resource-family topology horizontally;
- Organic Resources use rarity vertically and alphabetical order horizontally;
- Manufactured Products use rarity vertically and alphabetical order horizontally.

The user does not necessarily need visible labels for every encoded dimension.

If the layout is intuitive and the information itself is not useful to the task, avoid adding labels purely because the metadata exists.

---

# Planned Supply layout conventions

## Expanded section structure

The expanded Planned Supply editor contains:

- Inorganic Resources;
- Organic Resources;
- Manufactured Products.

Full catalogue items remain visible regardless of whether they are Available, Neither, or Planned.

---

## Inorganic Resources

The inorganic grid is a semantic spatial map.

Use:

- vertical rarity progression;
- horizontal resource-family topology;
- equal cell dimensions;
- metadata-driven family structure;
- proximity and whitespace;
- no visible rarity labels;
- no connector lines.

Water and Helium-3 occupy a separate singleton block above the main family grid.

Eventually X-Tech may join that conceptual area if and when it becomes valid reference data.

Do not force singleton resources into fake families.

For branching families, descendants establish the horizontal footprint and ancestors should be visually centered over the descendant span.

Linear families remain straight.

---

## Organic Resources

Use:

- vertical rarity progression;
- alphabetical order within each rarity row;
- equal-size cells;
- vertically aligned columns within the Organic grid;
- no visible rarity labels.

The Organic grid does not need to align with the Inorganic or Manufactured grids.

---

## Manufactured Products

Use:

- vertical rarity progression;
- alphabetical order within each rarity row;
- equal-size cells;
- vertically aligned columns within the Manufactured grid;
- ragged right edge where rarity counts differ;
- no fake placeholder cells solely to create a rectangular edge;
- no visible rarity labels.

The Manufactured grid does not need to align with the Organic grid.

---

## Compact Planned Supply

Collapsed Planned Supply is a summary, not a miniature catalogue.

Show only currently Planned items.

Group in this order:

1. inorganic;
2. organic;
3. manufactured.

Within each group, sort alphabetically by full item name.

Use:

- abbreviation buttons;
- tooltip/full-name access;
- small extra spacing between groups;
- natural horizontal wrapping.

Do not show:

- rarity labels;
- family structure;
- category headings;
- Available-only items;
- Neither items.

Compact buttons remain interactive.

Removing an item:

- removes it from Planned Supply using the same history-aware path as expanded mode;
- makes it disappear from compact view immediately;
- allows Undo to restore it;
- requires expanding the full editor to add it again after removal.

---

# Reordering interactions

## Explicit reorder mode

For collections where accidental drag/reorder would be disruptive, use an explicit interaction mode.

Current navigation uses:

- Lock mode for normal use;
- Reshuffle mode for reordering.

This pattern may be reused where appropriate.

---

## Drag-and-drop behavior

For reorder interactions:

- use a dedicated drag handle;
- do not make the entire row draggable unless explicitly intended;
- do not live-preview destructive reorder changes during drag;
- show an insertion marker;
- commit one reorder when the drop completes;
- no-op drops should not create history;
- Escape should cancel the interaction where practical;
- selection should remain stable;
- stable IDs must remain unchanged.

Reordering should change order, not identity.

---

## Arrow controls

Where move-up/move-down controls exist alongside drag-and-drop:

- they should produce the same underlying reorder semantics;
- one arrow action is one history entry;
- they should remain usable independently of drag-and-drop.

---

# Navigation conventions

Navigation should remain compact and stable.

Current conventions include:

- fixed structural columns for drag handle / name / move controls;
- ellipsis for long names;
- full name available via tooltip/title;
- no decorative bullet list markers;
- selection remains stable during reorder;
- Reshuffle/Lock mode controls reorder affordances.

Avoid allowing long names to distort the structural columns.

Navigation presentation should not alter persisted domain data except when the user explicitly performs a reorder.

The visible Navigation pane has one stable, deliberately generous width in
both Lock and Reshuffle modes so normal 25-character outpost names remain
readable without compressing row controls. It may be fully collapsed to reclaim
workspace width, leaving only a narrow, keyboard-reachable reopen control.
Collapse state is session-only presentation state, and collapsing exits
Reshuffle so reopening always restores ordinary Lock mode.

Global outpost shortcuts remain available whether Navigation is visible or
collapsed: `Ctrl+Alt+N` adds an outpost through the normal creation path,
`Ctrl+Alt+Up` selects the previous outpost, and `Ctrl+Alt+Down` selects the next
outpost. Previous/Next cycle through the current Navigation order, wrapping
from first to last and last to first without changing that order or creating
Undo/Redo history. These shortcuts do not activate from inputs, textareas,
selects, or editable content.

The Outpost Details identity field is a wide, heading-style editable name.
It keeps a local typing draft and commits on blur, while System and Body remain
ordinary labelled selectors below it. Normal location choices are derived from
`body.outpostAllowed`; a currently persisted invalid or unknown value remains
visible only as the current recovery choice until the user changes away.

---

# Cargo Pad presentation

Cargo Pads are secondary detail editors and default collapsed.

The compact summary should expose enough information to recognize the pad and its current logistics role without opening the full editor.

Remote outpost identity receives the flexible width in the compact header.
Normal 25-character outpost names are the design envelope; longer names
ellipsis cleanly while the full name remains available through a title.

Expanded state exposes editing controls.

The detailed summary format may evolve, but preserve the general pattern:

- compact by default;
- expanded on intentional edit;
- stable pad identity;
- reorder changes order rather than identity;
- cargo/link semantics remain domain concerns rather than presentation state.

Cargo Pads use the established Navigation reshuffle grammar: presentation-only
`Reshuffle` / `Lock order` state, handle-only drag, stationary cards with gap
markers, and alternate move-up/down controls. Reorder gutters appear only while
unlocked, and the card list scrolls independently beneath its persistent
toolbar.

Cargo Pad reshuffling requires at least two pads. With zero or one pad the
Reshuffle control remains visible but disabled, and an active reshuffle mode
exits if the pad count drops below two.

---

# Labels, abbreviations, and tooltips

## Abbreviations

Use abbreviations when:

- the control is dense;
- full names would force excessive width;
- the abbreviation is already part of the application's reference data;
- full names remain discoverable.

Do not duplicate abbreviation authority in UI code when reference data already supplies it.

---

## Tooltips

Dense abbreviation-first controls should expose the full player-facing name.

A simple `title` tooltip is acceptable when it fits current project conventions.

Do not add a heavyweight tooltip dependency unless there is a broader need.

### Contextual help and state tooltips

Contextual help explains semantics; tooltips explain the state of a particular
item or indicator.

Use a quiet circled `?` immediately beside an app-specific or non-obvious
concept that benefits from a concise definition. Its compact anchored help box
is non-modal, overlays rather than reflows the workspace, and uses the existing
flat application surfaces and rules. Only one help box may be open at a time.
Click and standard button keyboard activation open or toggle it; outside click
and Escape close it, with Escape returning focus to the trigger.

Do not decorate ordinary familiar controls with help icons unnecessarily. Use
state tooltips on hover- and keyboard-focusable values when the explanation is
specific to the currently displayed item, availability state, or indicator.

Tooltips should remain available for:

- selectable items;
- selected items;
- disabled-but-inspectable items.

---

## Truncation

When labels exceed available width:

- prefer ellipsis;
- preserve stable layout;
- expose the full label via tooltip/title.

Do not allow one long label to distort an otherwise structured layout.

---

# Overflow and scrolling

## Preserve semantic layout

Compact technical surfaces with internal overflow should use the reusable thin,
low-contrast scrollbar treatment where browser CSS supports it. Native fallback
is acceptable; do not replace native scrolling with JavaScript merely for visual
consistency.

When a meaningful horizontal layout is too wide, prefer scoped horizontal overflow over destructive wrapping.

Do not:

- reorder semantic columns;
- collapse family structures into arbitrary tag wrapping;
- change item geometry unpredictably;
- convert structured grids into unrelated mobile-style lists without an explicit responsive design decision.

Planned Supply may use horizontal overflow to preserve family/grid semantics.

---

## Wrapping is appropriate for summaries

Compact summaries that do not encode spatial hierarchy may wrap naturally.

Example:

- collapsed Planned Supply button list.

Use wrapping when sequence/grouping remains understandable after line breaks.

---

## Broader workspace scrolling

Independent scrolling for navigation and the main workspace remains a deferred UX topic.

Do not implement broader scrolling architecture opportunistically while solving a local overflow problem.

Refer to `docs/BACKLOG.md`.

---

# Accessibility baseline

Accessibility should be addressed locally and consistently without allowing a narrow UI task to expand into an unrelated full-application redesign.

At minimum:

- interactive controls should be keyboard reachable where practical;
- toggle state should be exposed with appropriate `aria-*` semantics;
- collapse/expand controls should expose `aria-expanded`;
- non-actionable controls should expose that they are unavailable;
- full names should remain discoverable for abbreviation controls;
- section headings should remain semantic;
- focus-visible styling should remain clear.

Do not create bespoke keyboard behavior where standard controls already provide suitable behavior.

Broader accessibility work should be planned deliberately rather than introduced piecemeal.

---

# Simple confirmation dialogs

Use a compact application-owned modal when a deliberate destructive action
needs explicit consent. Keep the surface pale, flat, thin-bordered, nearly
square, shadowless, and centered in the viewport behind a restrained backdrop.

Confirmation dialogs should:

- state the action and consequence explicitly;
- place the safe Cancel action before the destructive action;
- focus Cancel initially;
- cancel on Escape;
- trap Tab and Shift+Tab within the dialog;
- restore focus to the trigger when they close where practical;
- keep backdrop clicks from dismissing the dialog or moving focus outside it;
- block background interaction and preserve the underlying scroll position.

Use the existing Critical token to distinguish the destructive action without
turning the dialog into a large alert treatment. Do not use a browser-native
confirmation when this established application pattern is appropriate.

---

# Visual hierarchy

Prefer hierarchy through:

- heading level;
- spacing;
- alignment;
- opacity/state contrast;
- typography;
- stable grouping.

Avoid excessive use of:

- card containers;
- borders around every subgroup;
- badges;
- legends;
- decorative separators;
- explanatory copy inside dense editors.

The application should feel like a compact technical planning tool.

---

# Status and transient feedback

The status bar is the preferred location for application-wide transient feedback and validation/reference status.

Current responsibilities include:

- validation access;
- reference-data status;
- transient action success feedback;
- persistent errors;
- transient interaction hints.

Local editors should not duplicate global feedback unless the information is necessary to understand the local interaction.

---

# Validation presentation

Validation is advisory unless domain rules explicitly require hard enforcement.

The UI should allow incomplete networks to be represented where that supports planning.

Example:

- Planned Supply can make an intended cargo export selectable even though validation still reports that the export has no actual source.

Do not silently convert advisory validation into disabled interaction without an explicit product decision.

Validation wording should help distinguish:

- incomplete but intentional planning;
- invalid or contradictory network state.

Broader wording refinements belong in a dedicated validation/UX review.

The Validation control opens a compact, anchored, non-modal diagnostic panel.
It remains open during workspace interaction and closes through the same
control or the global `Ctrl+Alt+V` toggle. Issues are ordered by severity and
presented as flat, separated rows with a context locator, readable message,
and restrained severity rail. The internally scrolling issue list keeps its
header visible and limits the panel to roughly five ordinary rows.

Outpost-scoped issue rows are actionable and navigate to their outpost while
keeping the panel open. They use roving focus: Arrow keys move between
actionable issues, Home/End reach the boundaries, and Enter/Space activate the
focused issue. Escape returns focus to the Validation control without closing
the panel. Exact control highlighting, expansion, and scrolling remain future
enhancements rather than part of this navigation pattern.

Cargo-pad validation context uses `Pad {n}` derived from current outpost pad
order. The ordinal is presentation-only; the stable cargo-pad ID remains the
issue locator and raw-ID fallback.

---

# Avoiding accidental technical debt in UX

Do not solve presentation problems by:

- adding persisted fields for layout state;
- duplicating reference-data classifications in UI-only tables;
- hardcoding coordinates for named resources when topology metadata exists;
- creating special-case visual rules for one item where a generic rule can express the design;
- encoding temporary source-data repairs into presentation logic.

Prefer generic derivation from authoritative runtime data.

---

# Examples of reusable patterns

## Pattern: compact summary + expanded editor

Used by:

- Cargo Pads;
- Planned Supply.

Use when:

- the user usually needs status;
- editing requires a larger control surface;
- keeping everything permanently expanded consumes too much space.

---

## Pattern: lock + reshuffle

Used by:

- Outpost navigation.

Use when:

- reorder is useful;
- accidental reorder would be costly or confusing.

---

## Pattern: disabled-but-visible

Used by:

- Available items in Planned Supply.

Use when:

- an item remains useful context;
- interaction is not currently allowed.

---

## Pattern: metadata-driven spatial grid

Used by:

- inorganic Planned Supply.

Use when:

- position itself communicates meaningful relationships;
- generic alphabetical listing would discard useful structure.

---

# Deferred UX work

Do not use this document to silently convert backlog ideas into current requirements.

Deferred items remain in `docs/BACKLOG.md`.

Examples currently include:

- middle workspace independent scrolling;
- sticky selected-outpost header;
- broader accessibility pass;
- further validation wording/priority review;
- other future density and navigation refinements.

When a deferred item is implemented and becomes a settled convention, update this document if it establishes a reusable UX pattern.

---

# Maintaining this document

Update `docs/UX-DESIGN.md` when:

- a reusable UX convention changes;
- a new interaction pattern becomes established;
- multiple screens should follow the same presentation rule;
- an implementation brief introduces a principle that should survive beyond that batch.

Do not update this document for:

- one-off temporary styling;
- speculative ideas;
- unresolved alternatives;
- implementation details that belong only in component comments;
- domain rules;
- architectural module changes.

Where practical, write principles first and use existing screens as examples rather than documenting every current pixel-level implementation.
