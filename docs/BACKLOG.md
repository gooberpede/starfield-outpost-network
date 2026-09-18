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
- Perform a dedicated 1366px-width visual/layout review. Treat this as product
  polish rather than accessibility re-testing: inspect hierarchy, density,
  wrapping, relative pane balance, and awkward-but-functional states that were
  accepted during zoom/text-scaling verification.

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

### Technical-capacity advisory validation

Review whether normal live validation should warn when understandable parts of
the current collection approach or exceed the supported technical capacity
envelopes for external import and browser storage. These are engineering and
support limits, not Starfield gameplay or skill-based limits and not domain
validity rules. Any warning should remain advisory rather than restricting
editing, preserving modded/high-capacity use where practical.

Candidate dimensions include saved networks, outposts per network, Cargo Pads
per outpost, Cargo Links per outpost and per network, manufacturing entries,
Planned Supply entries, and outbound item selections per Cargo Pad/Cargo Link.
Decide which, if any, warrant user-facing warnings and how the distinct import
and storage envelopes should be communicated. Do not expose recursive array
member counts, nesting depth, object-key length, raw serialized length, or
other traversal guards as ordinary validation without a useful user-facing
model. The separate import/recovery decision below concerns how to handle
otherwise valid incoming data beyond the tested envelope; this item concerns
feedback about the collection already being edited.

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

### Additional keyboard shortcuts

Consider expanding application-level keyboard shortcuts beyond the implemented
Undo/Redo and Validation shortcuts.

Candidate targets include:

- Import;
- Export;
- Search and Search Results;
- Cargo Links area and individual Cargo Links;
- Outpost navigation;
- Inorganic Resources;
- Organic Resources;
- Manufacturing;
- Planned Supply.

Shortcut design should be reviewed as a coherent set before implementation.
Consider landmark-like shortcut navigation between major application regions
to reduce lengthy sequential Tab traversal, without implying screen-reader
landmark semantics. Avoid conflicts with normal browser, operating-system,
text-editing, and assistive-technology behavior, and do not add shortcuts
merely because an action exists. Exact key combinations remain undecided.

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

- Review how otherwise valid imports with more than 12 Cargo Link structures at one outpost should be handled. Legitimate modded usage can exceed the implemented, tested external-import technical ceiling; recovery or exception behavior remains a product decision rather than an immediate security correction.
- Bound and sanitize the character-name fragment in export filenames so long valid persisted names cannot consume the timestamp and `.json` filename budget. The exact fragment limit remains undecided.
- richer import diagnostics or reporting beyond the implemented structured
  error categories and concise localized failure messages, including capacity
  and malformed-structure/identity failures, if the workflow warrants more
  useful detail or context;
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

### Production performance and bundle review

Before public release, perform a bounded production-performance review covering:

- the existing Vite/Rollup large-chunk advisory;
- compressed production bundle size;
- first-load and startup behavior;
- unusually large dependencies;
- whether code splitting would materially improve startup without complicating
  the application unnecessarily.

Do not optimise solely to eliminate a warning. Measure the production build
first and make changes only where they provide a practical benefit.

### Further localization coverage

The semantic localization boundary now covers current tracker-authored UI,
accessible text, help/tooltips, validation, status/transient feedback, and
session history labels. `en-US` remains the complete baseline, `en-GB` a sparse
override, and `ja-JP` a complete tracker catalogue with exact key and
placeholder parity maintained through the existing localization verification
tooling. Japanese work has a durable glossary, comparative machine-assisted
review, and closure verification, but no native-speaker review was available.
Current list/number/percent/collation needs use `Intl`. Deferred localization
work includes:

- final Japanese release verification;
- native-speaker review when available;
- adopting richer ICU/FormatJS-style formatting only if future real catalogue
  content requires nested plural/select or translator-controlled rich text;
- applying locale-aware date/time formatting if user-visible date/time display
  is introduced later.

Export filename timestamps and persisted/schema formats remain invariant unless
a separate design explicitly changes them.

Official Japanese reference overlays and official terminology provenance are
implemented. Free Lanes is settled as a terminology-only source and does not
change the canonical reference-data universe. Localization architecture and
catalogue closure are complete; the remaining release work is
manual, native-speaker, and platform verification.

### Accessibility follow-up

The whole-product accessibility audit and desktop correction batch were completed
in September 2026. The final audit is recorded in
`docs/audits/codex-whole-product-accessibility-audit.md`.

No known BLOCKER, HIGH, MEDIUM, or LOW finding from that audit remains unresolved
within the tested Windows/Chromium desktop scope.

Deferred accessibility/platform follow-up:

- test practical target comfort and interaction with a touchpad and Windows
  touchscreen when suitable hardware is available;
- perform Safari/VoiceOver and iPhone/WebKit accessibility smoke testing when a
  suitable environment is available;
- consider browser-level accessibility regression tooling, such as bounded
  axe-style checks, as a regression aid rather than proof of accessibility;
- consider browser-level reflow regression coverage for representative
  constrained widths and major application surfaces.

Do not reopen the completed accessibility correction batch unless follow-up
testing reveals a concrete defect.

### Apple/WebKit compatibility verification

- Re-test the public production build in Safari/WebKit.
- Perform a Safari/VoiceOver smoke test on macOS when a suitable environment is
  available.
- Verify Japanese font fallback on iPhone, iPad, and macOS Safari.
- Perform an iPhone/WebKit accessibility and rendering sanity check.
- Investigate the current iPhone blank-page behavior if it is reproducible
  against the public build.
- Treat Apple mobile devices as compatibility, accessibility, and font-sanity
  targets, not a mobile-support commitment.

This work is deferred until suitable Apple/WebKit test environments are
available and does not block the completed Windows/Chromium accessibility batch.

### Security and deployment follow-up

The Dev/Prod Cloudflare Pages model, staging auto-deploy, manual production
gate, deployed CSP/security headers, and bare production `pages.dev` redirect
are established. The redirect excludes preview subdomains. Vite now uses its
default local-only development server. See [Deployment](DEPLOYMENT.md) for
current policy; the [whole-product security audit](audits/codex-whole-product-security-audit.md)
records the earlier point-in-time findings.

- **HSTS:** An initial 24-hour policy (`max-age=86400`) is implemented in
  `public/_headers`. `includeSubDomains` and `preload` are intentionally omitted.
  The initial rollout has been verified in staging and production, including
  the production custom-domain response. Defer any policy lengthening or review
  until the next backlog grooming, not before 20 September 2026.
- **Fatal-state recovery review:** Before public release, review whether to add
  a raw, read-only browser-storage backup/export action to the reference-data
  fatal screen.
- **Node 24 runtime alignment (verified):**
  The repository pins Node.js `24.21.0` in `.node-version` and declares
  `>=24 <25` in `package.json`. The local installation is aligned at `24.21.0`,
  and the build, test suites, and lint pass under that exact version. Cloudflare
  staging selected `24.21.0` and built and deployed successfully without
  `EBADENGINE` or Node EOL warnings.

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
