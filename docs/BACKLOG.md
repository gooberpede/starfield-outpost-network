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
- Revisit selected-outpost context in sticky/header UI only as part of a broader workspace review.
- Preserve the middle-column status matrix's scoped horizontal overflow during any broader workspace scrolling review.
- Restore sticky vertical behaviour for the status-matrix column header when the enclosing Outpost Details scrolling model supports it.
- Preserve identical status-matrix column positions across outposts at any given workspace width.

---

## Outpost Details follow-up

The shared resource/manufacturing/import status matrix now establishes the
upper Outpost Details control grammar. Remaining work should be handled in
focused batches and may include:

- default Planned Supply to collapsed/compact mode while keeping expansion state presentation-only;
- move the Delete Outpost action into or near the existing Outpost Details header/action area;
- filter the Body selector so bodies that cannot host outposts, such as gas giants and ice giants, are not normal selectable destinations;
- general spacing, sizing, and alignment polish after the major information architecture has settled;
- organic flora/fauna source names when authoritative reference data exists;
- organic farming prerequisite derivation and validation;
- throughput-oriented fabricator quantity UI if quantitative modelling is adopted.

---

## Cargo Pads

- Revisit drag auto-scroll at the top and bottom of the independent Cargo Pads
  list if the current native scrolling behavior proves insufficient.

### Cargo Pad labels

Revisit whether `CargoPad.label` should remain persisted or be derived from stable array order.

Do not change this until migration and downstream display consequences are considered explicitly.

---

## Validation

### Outpost name length

Starfield limits in-game outpost names to 25 characters.

Add an advisory validation rule for names exceeding 25 characters.

Important distinction:

- validation should report that the name exceeds the in-game limit;
- presentation may still ellipsize long names defensively;
- stored/imported names should not be silently truncated merely for display.

### Possible future validation

Consider, when supported by domain evidence:

- circular cargo-flow information;
- throughput-related warnings;
- Helium-3 throughput constraints;
- recursive recipe feasibility;
- biome plausibility;
- organic-resource prerequisites;
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

- recursive manufactured-product feasibility;
- multi-stage dependency resolution;
- distinction between currently available ingredients and theoretically satisfiable upstream inputs;
- planner-facing explanation of why a recipe is or is not feasible.

Keep tracker behaviour tolerant of incomplete networks; do not turn advisory feasibility into hard enforcement without an explicit product decision.

---

## Biomes, resources, and planetary data

Future planner/data work may include:

- biome-level resource plausibility;
- recommended resource combinations by biome;
- avoiding finicky biome-boundary sites by default;
- incorporating extracted Starfield resource-generation data;
- review and rebuild the organic xEdit extraction pipeline so canonical resource identity, biome occurrence, fauna/flora identity, farmability/domesticability, and production inputs come from clean authoritative data rather than legacy enrichment; this should also resolve the currently omitted unique-resource fauna occurrences;
- organic-resource farming prerequisites;
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

The current status bar supports validation/reference information, transient action feedback, persistent errors, and transient interaction hints.

Future review should consider the overall information hierarchy for:

- validation;
- reference-data status;
- application/version information if added;
- transient interaction hints;
- action success feedback;
- persistent errors.

Do not fold this broader status-bar review into unrelated feature work.

---

## Import, export, and storage

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
