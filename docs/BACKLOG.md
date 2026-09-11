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

- throughput-oriented fabricator quantity UI if quantitative modelling is adopted.

### Verify duplicate outpost-name rules in Starfield

Determine whether the game permits two or more player outposts to share the 
same name. If duplicate names are disallowed in-game, continue permitting 
them in the tracker but add a specific validation warning identifying the 
conflicting outposts. If duplicates are allowed in-game, no validation rule 
is needed.

---

## Cargo Pads

- Revisit drag auto-scroll at the top and bottom of the independent Cargo Pads
  list if the current native scrolling behavior proves insufficient.

### Cargo Pad labels

Revisit whether `CargoPad.label` should remain persisted or be derived. Visible
Cargo Pad ordinals are now derived from current pad order and are
presentation-only; stable identity remains `cargoPadId`. The persisted
`CargoPad.label` is no longer the primary visible locator.

Do not persist the ordinal. Do not change the stored label until migration and
downstream display consequences are considered explicitly.

---

## Validation

- Extend issue navigation beyond its outpost to expose or focus relevant local
  context such as a Cargo Pad, Planned Supply item, manufacturing row, or
  resource/biome context. Existing issue metadata already carries stable IDs
  that can support this work; exact scrolling and focus mechanics remain open.

### Possible future validation

Consider, when supported by domain evidence:

- circular cargo-flow information;
- throughput-related warnings;
- Helium-3 throughput constraints;
- biome plausibility;
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
- better differentiation between canonical source data and player-recorded state.

Future reference-data work should preserve the current canonical-source,
FormID-crosswalk, and explicit tracker-policy boundaries when adding new source
populations or provenance capabilities.

These are planner/reference-data concerns and should remain separate from the persisted player network model unless a future design explicitly requires otherwise.

---

## History and editing

Future enhancements may include:

- visible history/timeline list;
- direct jump to an earlier history state.

The completed benchmark investigation is recorded in `docs/HISTORY-BENCHMARK.md`.

Current behaviour remains whole-collection immutable before/after snapshots with
one deliberate operation per history entry and a 1,000-entry collection-global
session cap.

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

- Contextual micro-help and state-specific tooltips now cover selected dense
  concepts and indicators in the working interface. Keep this local assistance
  concise rather than expanding it into a tutorial or help center by default.
- A formal V1 user guide remains deferred. It should provide deeper guidance
  for concepts that the interface cannot fully explain, including:
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

## Repository maintenance and test infrastructure

### Bring the TypeScript test fixtures back into static type agreement

The Node test suite currently runs successfully through:

```text
node --experimental-strip-types --test tests/*.test.ts
```

but the test files are not part of the production TypeScript build and are not
currently required to pass full static type checking.

A temporary attempt to add the tests to the TypeScript build exposed a large
existing set of type errors, including:

* fixtures missing newly required domain fields such as character
  `capabilities`;
* fixtures missing outpost `explicitResourcePresence`;
* stale object shapes such as older Cargo Link fields;
* callbacks losing inferred parameter types because their surrounding fixture
  types are already invalid;
* NodeNext module-resolution complaints about the suite's existing
  extensionless imports.

The editor configuration should continue to provide Node typings without
silently making the existing test suite part of the production `tsc -b` build.

Future maintenance should:

* bring test fixtures into agreement with the current domain model;
* prefer shared/default fixture builders where that reduces stale duplicated
  object literals without obscuring what individual tests are proving;
* remove obsolete fixture fields and update outdated domain shapes;
* decide on a deliberate module-resolution strategy for tests;
* once the suite is clean, consider adding an explicit test type-check command
  and eventually making it part of routine verification/CI.

Do not mix this cleanup into unrelated feature work merely to make tests
statically type-check.

---

## Public release readiness

Public release is now an intended product milestone.

This does not imply a fixed release date or that every deferred feature must be
completed first. It means that work affecting distribution, usability, safety,
and maintainability should increasingly be evaluated against the needs of a
public-facing application rather than only the developer's own use.

### Further localization coverage

The first localization foundation now supports Automatic/explicit `en-US` and
`en-GB`, semantic message catalogues, sparse reference-name overlays, and a
representative vertical slice. Deferred localization work includes:

- migrating the remaining UI, accessible, help, status, and transient strings;
- migrating remaining validators to semantic keys and structured parameters;
- deciding when history labels should move from final strings to action keys;
- adding non-English locale content when translation scope is defined;
- applying locale-aware number, date, and list formatting where future migrated
  display cases require it.

Export filename timestamps and persisted/schema formats remain invariant unless
a separate design explicitly changes them.

### Accessibility audit

Perform a systematic accessibility audit before public release.

The audit should review at least:

- keyboard-only navigation;
- logical focus order;
- visible focus treatment;
- semantic controls and labels;
- dialog focus trapping and focus restoration;
- screen-reader naming and control descriptions;
- colour contrast;
- state communication that does not rely on colour alone;
- zoom and text-scaling behaviour;
- dense-grid usability;
- keyboard alternatives for drag-and-drop interactions;
- accessibility of compact/icon-only controls;
- form validation and error communication.

The application already contains several accessibility-conscious patterns, but
public release should not rely on those individual decisions adding up to a
complete accessibility review.

### Security audit

Perform a security-focused review before public release.

The application is currently a local browser application without a backend, so
its attack surface is comparatively limited, but imported/user-provided data
and eventual public hosting still justify a deliberate audit.

Review at least:

- JSON import parsing and malformed-file handling;
- pathological or excessively large imported collections;
- browser-storage assumptions and failure modes;
- user-entered/imported text rendering and XSS exposure;
- unsafe URL/link handling;
- dependency vulnerabilities;
- static asset and reference-data trust boundaries;
- large-session/history memory or denial-of-service-style failure cases;
- deployment and Content Security Policy considerations once hosting is chosen.

Do not introduce speculative security infrastructure before the audit identifies
a concrete need.

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
