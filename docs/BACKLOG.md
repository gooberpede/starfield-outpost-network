# Starfield Outpost Network — Backlog

## Purpose

This file records deferred work, unresolved decisions, and known future improvements.

It is not an implementation plan and it is not a source of current requirements by itself.

A backlog item becomes active only when a current implementation brief or explicit development decision brings it into scope.

Keep this file focused on work that is genuinely deferred. Current implemented behaviour belongs in the codebase and in the relevant architecture/domain documentation.

---

## Navigation and workspace

### Navigation panel

- Add independent scrolling for the Outpost navigation panel.
- Revisit drag auto-scroll behaviour only when independent navigation scrolling is implemented.
- Preserve conservative drag behaviour at the top and bottom of the scrollable region:
  - no implicit snapping outside valid drop zones;
  - clear indication of valid insertion targets;
  - deliberate handling of edge-triggered auto-scroll.
- Review selected-outpost visual treatment if later layout changes make selection less obvious.

### Workspace layout

- Review the workspace scrolling model as a whole before making major structural changes.
- Consider independent scrolling for:
  - Outpost navigation;
  - Outpost Details.
- Investigate user-controlled width allocation among the Navigation, main
  outpost/matrix workspace, and Cargo Pads regions. A future design should
  establish sensible defaults and minimum widths, prevent the Navigation and
  Cargo Pads panes from becoming unusably narrow, and decide whether widths
  should persist and whether a reset-to-default action would be useful.
- Revisit selected-outpost context in sticky/header UI only as part of a broader workspace review.
- Preserve the middle-column status matrix's scoped horizontal overflow during any broader workspace scrolling review.
- Restore sticky vertical behaviour for the status-matrix column header when the enclosing Outpost Details scrolling model supports it.
- Preserve identical status-matrix column positions across outposts at any given workspace width.

---

## Outpost Details follow-up

The shared resource/manufacturing/import status matrix now establishes the
upper Outpost Details control grammar. Remaining work should be handled in
focused batches and may include:

- throughput-oriented fabricator quantity UI if quantitative modelling is adopted.

---

## Cargo Pads

- Revisit drag auto-scroll at the top and bottom of the independent Cargo Pads
  list if the current native scrolling behavior proves insufficient.
- Improve compact Cargo Pad summary width allocation so remote outpost names
  can use genuinely available horizontal space before ellipsizing, while
  preserving the established compact two-row summary semantics.

### Cargo Pad labels

Revisit whether `CargoPad.label` should remain persisted or be derived. Visible
Cargo Pad ordinals are now derived from current pad order and are
presentation-only; stable identity remains `cargoPadId`. The persisted
`CargoPad.label` is no longer the primary visible locator.

Do not persist the ordinal. Do not change the stored label until migration and
downstream display consequences are considered explicitly.

---

## Validation

- Add deliberate interactive issue navigation. Selecting an issue may navigate
  to its outpost and, where practical, expose or focus relevant local context
  such as a Cargo Pad, Planned Supply item, manufacturing row, or
  resource/biome context. Existing issue metadata already carries stable IDs
  that can support this work. Keep issue rows non-interactive until the
  behaviour is designed and implemented; exact scrolling and focus mechanics
  remain open.

### Possible future validation

Consider, when supported by domain evidence:

- circular cargo-flow information;
- throughput-related warnings;
- Helium-3 throughput constraints;
- biome plausibility;
- unresolved Planned Supply informational issues:
  - emit one Info-level issue for each unresolved Planned Supply item at an
    outpost;
  - provide a quiet checklist of remaining virtual dependencies or loose ends,
    below warnings and errors in the existing severity ordering;
  - avoid emitting one issue for every downstream consequence;
  - `planned-supply-unresolved` is a likely rule name, but the eventual rule may
    use another stable identifier.
- duplicate object-ID checks if stable-ID integrity becomes a practical risk.

---

## Cargo and logistics modelling

### Throughput

Quantitative throughput is not currently modelled.

Future work may consider:

- extractor output rates;
- storage capacity/flow;
- cargo-link transfer rate;
- Helium-3 consumption/availability;
- manufacturing consumption and output rates.

Do not introduce quantitative throughput piecemeal without a coherent model.

### Local output links

Local output links between extractors, storage containers, manufacturing equipment, and cargo-pad storage are intentionally abstracted away.

Inbound cargo contributes to outpost-level availability.

No explicit local-storage plumbing model is currently planned unless future planner requirements demonstrate a clear need.

---

## Recipes and feasibility

Potential future work:

- planner-facing explanation of why a recipe is or is not feasible.

Keep tracker behaviour tolerant of incomplete networks; do not turn advisory feasibility into hard enforcement without an explicit product decision.

---

## Biomes, resources, and planetary data

Future planner/data work may include:

- Confirm in-game whether coastal outposts can overlap Ocean biomes. Ocean remains 
  selectable regardless, because Ocean biomes can contain unique inorganic resources.
- recommended resource combinations by biome;
- avoiding finicky biome-boundary sites by default;
- power planning and generator calculations beyond the implemented qualitative
  solar/wind indicators;
- advanced generator output, generator counts, and planner preference logic;
- future generator-output multiplier and rounding semantics;
- plant/herbivore/carnivore source icons;
- further biome-selector density or accessibility polish if usage requires it;
- explanation UX for why a resource is unavailable, including occurrence provenance;
- eventual retirement of body-resources.json when compatibility consumers are gone;
- possible replacement of curated dictionaries with game-derived extracts;
- better differentiation between canonical source data and player-recorded state.

The immediate resource and product catalogues now have curated dictionary
inputs, but a broader review of master/reference-data ingestion remains
deferred. That review should consider how sources are normalized, joined,
validated, and emitted across all reference datasets without replacing the
current explicit dictionary/occurrence separation piecemeal.

These are planner/reference-data concerns and should remain separate from the persisted player network model unless a future design explicitly requires otherwise.

---

## History and editing

Future enhancements may include:

- visible history/timeline list;
- direct jump to an earlier history state;
- conventional keyboard shortcuts for Undo/Redo, with careful handling of text-input native editing so application history does not unexpectedly consume ordinary field-level Undo;
- history-size limits if session history becomes large;
- optional navigation to the outpost affected by an Undo/Redo action.

Current behaviour remains whole-network immutable snapshots with one deliberate operation per history entry.

---

## Status bar

The current status bar supports validation, transient action feedback,
persistent errors, and transient interaction hints. Reference-data diagnostics
are intentionally hidden during stable operation; the underlying diagnostic
functionality remains available to restore for maintenance or debugging.

Future review should consider the overall information hierarchy for:

- validation;
- application/version information if added;
- transient interaction hints;
- action success feedback;
- persistent errors;
- reference diagnostics when intentionally re-enabled for maintenance or
  debugging.

Do not fold this broader status-bar review into unrelated feature work.

---

## Help, guidance, and localization

### User guide and concept guidance

- Add deferred user guidance for concepts that are intentionally denser than
  the interface can fully explain. In particular:
  - explain that Planned Supply represents virtual supply, allowing users to
    model the intended completed network while progressively constructing it
    through incomplete intermediate states;
  - explain that upstream outposts, resources, or products need not be complete
    before downstream fabricators and logistics are laid out as though those
    inputs already exist;
  - explain that a Planned Supply entry retires automatically when the actual
    item replaces the virtual item;
  - document dense Resource Matrix semantics such as `Present`, `Producing`,
    `Inputs`, and `Logistics`, especially that `Logistics` means actually
    configured on a routed export rather than merely available to export.
- At very low priority, consider lightweight explanatory affordances such as
  tooltips, compact help text, or discoverable definitions for dense Matrix
  column semantics, and only if real usage shows recurring confusion. Do not
  assume a heavyweight help system is needed.

### Localization groundwork

- At very low priority / far future, introduce a lightweight user-facing
  string-resolution layer so additional languages could be added without
  rewriting components. English should remain the default, fallback, and only
  initial language. This is infrastructure groundwork, not translation work;
  it does not currently require a language selector, translation-management
  UI, runtime translation downloads, non-English translation files, or
  pluralization and locale-sensitive number/date handling beyond demonstrated
  need.

---

## Import, export, and storage

### Network lifecycle

- Expose multiple-network UI and creation through `New Network` / `+ Add Network`.
- Design Back/Forward, selector, or tab interaction for switching networks.
- Define Undo-history semantics when switching networks.
- Implement true deletion of one collection entry.
- Decide whether networks need names, labels, universe numbers, timestamps, or notes.
- Revisit the network-operations control cluster when multi-network UI is exposed.
- Rename `Export` to `Export Current` alongside the visible multi-network feature.
- Add `Export All` and collection-level import/backup.

Possible future improvements:

- richer import diagnostics;
- clearer conflict/migration reporting;
- explicit schema-version migration documentation;
- optional import preview if the workflow eventually warrants it.

JSON remains a transfer vehicle, not the live/current-document model.

Browser storage remains the default persistence mechanism unless explicitly redesigned.

---

## Planner direction

Longer-term planner goals include:

- accepting both simple and complex production requests;
- planning multi-outpost manufacturing/logistics networks;
- prioritising set-and-forget designs;
- respecting cargo-pad and outpost capacity;
- avoiding unnecessarily finicky site requirements;
- recommending resource combinations by biome;
- later incorporating player state such as existing outposts, surveyed planets, and skills;
- potentially supporting in-game integration.

Do not let future planner requirements prematurely distort the tracker’s current persisted model.

---

## Backlog maintenance

When adding an item:

- describe the problem or decision, not an assumed implementation;
- record settled direction separately from unresolved questions;
- avoid duplicating rules already captured in `docs/DOMAIN-RULES.md`;
- remove or rewrite entries once a feature is implemented and documented elsewhere.
