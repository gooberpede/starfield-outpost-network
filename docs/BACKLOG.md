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

- **Cargo Link Undo presentation state:** Deleting a Cargo Link and then using
  Undo can collapse other, unrelated expanded Cargo Links. Investigate this as
  a presentation/history regression and preserve unrelated presentation state
  where that is consistent with the existing history/presentation contract;
  do not change history semantics unnecessarily.

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
- Keep the tracker's defensive persisted-name and export-filename safeguards
  distinct from Starfield's 25-character gameplay limit. Review the much
  higher application ceiling for unusually long character names; 196
  characters is a tentative ceiling, not a settled product rule. Bound and
  sanitize the export-filename fragment so a long persisted name cannot
  consume the timestamp and `.json` filename budget, and prevent absurdly long
  names from dominating transient/status-bar feedback.
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

## Public release readiness

Public release is now an intended product milestone.

This does not imply a fixed release date or that every deferred feature must be
completed first. It means that work affecting distribution, usability, safety,
and maintainability should increasingly be evaluated against the needs of a
public-facing application rather than only the developer's own use.

### Further localization coverage

Localization is the remaining major V1 development phase. V1 targets the full
Starfield text/interface language set:

- English;
- French;
- German;
- Spanish (Spain);
- Japanese;
- Italian;
- Polish;
- Portuguese (Brazil);
- Simplified Chinese.

The supported Bethesda-language targets now comprise English, Japanese, French,
and German. `en-GB` remains a sparse English override rather than a separate
Bethesda language. Five substantial locale onboardings remain for V1: Spanish
(Spain), Italian, Polish, Portuguese (Brazil), and Simplified Chinese. Implement
them in manageable, coherent parcels rather than one giant batch. Spanish
(Spain), Italian, and Portuguese (Brazil) may plausibly form a later three-
locale tranche; Polish and Simplified Chinese likely deserve separate focused
tranches. These are strategic options, not irrevocably settled batches. Do not
settle final locale tags in this backlog. Each parcel should preserve the
existing localization architecture, exact key/placeholder parity tooling,
review process, and reference-name provenance/overlay approach where applicable.

The semantic localization boundary includes tracker-authored UI, accessibility
text, help/tooltips, validation, status/transient feedback, and session history
labels. Current list, number, percent, and collation needs use `Intl`. Adopt
richer ICU/FormatJS-style formatting only if real future catalogue content
requires it. Apply locale-aware date/time formatting if user-visible date/time
display is introduced later. Persisted/schema formats and export filename
timestamps remain invariant unless separately redesigned.

Native-speaker review for supported non-English locales remains desirable when
available but is not a hard V1 release gate. French and German remain Supported
without it.

**Post-program XLIFF cleanup:** while locale onboarding remains active, working
`.xliff` files under `docs/localization/` are acceptable. After all planned
localization work is complete, move working/handoff XLIFF files to an ignored
`.local-work/localization/...` location and update generator defaults, scripts,
documentation, and tests that assume `docs/localization/`. Keep durable review
evidence in review CSVs, glossaries, locale profiles, manifests, final
catalogues, and reference overlays. Current deterministic XLIFF representations
remain current handoffs, not historical proof of the exact bytes originally
sent to DeepL. Do not perform this move during active onboarding.

**Post-localization bundle review:** after planned locale onboarding is 
complete, remeasure bundle composition and startup performance, with 
particular attention to statically bundled locale catalogues and reference-
name overlays. Consider lazy locale loading only if measurements show 
meaningful benefit.

### Pre-release polish

- **Character-name game-validity advisory:** Add a likely `INFO` validator for
  Starfield's 25-character character-name maximum. The tracker may preserve
  longer names; this is a gameplay-validity advisory, not an application
  storage or import error, and it is separate from the higher defensive
  application/export constraint described under import and export.
- **Localized Sol system name:** Investigate why the system selector presents
  the raw/canonical `SOL` form instead of localized `Sol` in both English
  variants. Correct the reference-name presentation or localization overlay
  path while preserving canonical IDs and reference keys; do not assume source
  data should be mutated.
- **Fixed-chrome content occlusion:** Focused or programmatically navigated
  controls can disappear beneath the fixed header or footer/status bar,
  especially at high magnification. Keyboard-focused or programmatically
  navigated content should remain visible within the usable viewport between
  fixed page chrome. The exact mitigation is intentionally open; this item does
  not approve a geometry change.
- **Localized Search placeholder truncation:** Localized Search placeholders can
  truncate at constrained desktop widths. French and German remain usable and
  accessible, but visible placeholder copy is partially clipped. Review later
  whether shorter locale-specific placeholder copy or a separately approved
  UI-geometry change is preferable.
- **German `Sehr schlecht` control capacity:** The accepted German Solar/Wind
  translation of `Very Poor`, `Sehr schlecht`, exceeds the current fixed
  control's visible capacity. This is visual only; no functionality or
  accessibility blocker was found. A later mitigation may use approved copy
  treatment, a redundant tooltip/accessible description, or a separately
  reviewed control-geometry change. Do not shorten the translation merely to
  fit the current control.
- **About and application versioning:** Expand the About dialog to show the
  application version, support/contact details, and a Ko-Fi link while
  retaining appropriate existing attribution/about content. Establish an
  application versioning scheme before public release; SemVer is the likely
  direction and `package.json` the likely canonical source, but the exact
  source/display mechanism remains open. A public project/site link may also be
  included. External links should follow established accessibility and
  localization conventions.
- **Fatal-state recovery review:** Review, without presuming approval, whether
  the reference-data fatal screen should expose a raw, read-only browser-storage
  backup/export action.

### Accessibility follow-up

The whole-product accessibility audit and desktop correction batch were completed
in September 2026. The final audit is recorded in
`docs/audits/codex-whole-product-accessibility-audit.md`.

No known BLOCKER, HIGH, MEDIUM, or LOW finding from that audit remains unresolved
within the tested Windows/Chromium desktop scope.

Deferred accessibility/platform follow-up:

- investigate why Resource Matrix shortcuts successfully move programmatic
  focus while the visible focus border or indicator sometimes fails to appear,
  making a working shortcut seem non-functional. Consider `:focus-visible`,
  programmatic focus state, scroll/focus timing, destination focus styling, and
  whether the expected element receives visible focus treatment. Preserve the
  shortcut bindings and matrix geometry; do not prescribe a redesign;
- investigate intermittent Windows Narrator announcements of the Solar control
  when focus ownership is ambiguous. Check actual DOM focus ownership,
  programmatic focus transitions, accessibility-tree ordering, nearby labels,
  and focus restoration/repair without assuming the Solar control is the root
  cause;
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
  the production custom-domain response. Review or lengthen the policy only at
  an appropriate later grooming point.
- **Public-launch indexing:** Remove the temporary pre-release `noindex` and
  robots controls as part of the public-launch parcel. Keep detailed deployment
  procedure in [Deployment](DEPLOYMENT.md).

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
