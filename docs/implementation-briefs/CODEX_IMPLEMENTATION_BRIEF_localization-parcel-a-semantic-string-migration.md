# CODEX IMPLEMENTATION BRIEF — Localization Parcel A: Complete Semantic String Migration

## Objective

Implement **Parcel A** from:

`docs/audits/codex-localization-coverage-and-japanese-audit.md`

The purpose of this parcel is to complete the application's semantic localization foundation **before** adding Japanese content or Bethesda localization extraction.

At the end of this parcel:

- ordinary user-facing English should no longer be hard-coded throughout the application;
- visible UI, accessible text, help, validation, status/transient feedback, and history labels should resolve through semantic localization keys/descriptors;
- validators should emit structured facts rather than finished English sentences;
- Undo/Redo/history labels should be semantic and relocalizable;
- `en-US` should be the complete baseline catalogue;
- `en-GB` should remain a sparse override;
- document language metadata should follow the effective locale;
- locale-aware list/number/percent formatting infrastructure should exist where current UI actually needs it;
- English behavior and UI should remain visually and functionally equivalent unless a wording normalization is required by the semantic migration.

This parcel does **not** add Japanese translations.

This parcel does **not** implement Bethesda BA2/string extraction.

This parcel does **not** change persisted network schema or runtime reference-data identity.

---

## Authoritative audit

Use:

`docs/audits/codex-localization-coverage-and-japanese-audit.md`

as the authoritative design basis for this parcel.

Relevant audit conclusions include:

- the existing typed localization architecture is sound and should be extended, not replaced;
- `en-US` is currently only a 40-key vertical slice;
- most visible UI, accessibility strings, validator output, status text, and history labels remain hard-coded/final-string based;
- only two of 25 validator rules currently expose semantic message keys;
- most accessible labels and tooltips still bypass localization;
- history labels are final English strings;
- `<html lang>` is fixed and does not follow the effective locale;
- no third-party localization runtime is justified;
- the current system plus small formatter/descriptor extensions is sufficient for English + Japanese.

Do not introduce FormatJS, i18next, React Intl, or another localization framework unless an implementation blocker is discovered and explicitly reported.

---

## Scope

Parcel A includes:

1. completion of semantic message-key coverage for current tracker-owned UI copy;
2. migration of accessible text;
3. migration of help/tooltips/contextual guidance;
4. migration of all validator messages/remediation/context into structured semantic presentation;
5. migration of status/transient/import/export feedback;
6. migration of history/Undo/Redo labels to semantic descriptors;
7. document language updates;
8. minimal formatter helpers currently required;
9. tests for catalogue completeness, descriptor rendering, interpolation, and locale switching;
10. documentation updates describing the completed semantic boundary.

Parcel A excludes:

- `ja-JP` catalogue content;
- Japanese browser-locale matching;
- Bethesda BA2 parsing;
- Bethesda string-table decoding;
- FormID -> raw localized string-ID extraction;
- generated Japanese reference-name overlays;
- Japanese font/layout/search hardening;
- accessibility remediation beyond string ownership/document language.

---

## Required repository reading

Read at minimum:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/audits/codex-localization-coverage-and-japanese-audit.md`
- `src/localization/types.ts`
- `src/localization/registry.ts`
- `src/localization/catalog.ts`
- `src/localization/formatters.ts`
- `src/localization/LocalizationProvider.tsx`
- `src/localization/preferences.ts`
- `src/localization/referenceNames.ts`
- `src/localization/locales/en-US.ts`
- `src/localization/locales/en-GB.ts`
- `src/App.tsx`
- all validators under `src/domain/validation/`
- `src/ui/validationPresentation.ts`
- history/session code, including `src/domain/collectionEditingSession.ts`
- status/help/presentation helpers such as:
  - `src/ui/statusTooltips.ts`
  - `src/ui/contextHelpText.ts`
  - `src/ui/powerEfficiencyPresentation.ts`
- all UI components containing user-facing text;
- all components with `aria-label`, `aria-describedby`, `title`, placeholder, dialog labels, and interaction hints;
- import/export/serialization error presentation;
- localization-related tests and UI/domain tests asserting English strings.

Perform a repository-wide scan for hard-coded user-facing English before implementation is considered complete.

---

## Design principles

### Semantic ownership

The localization system should own **complete user-facing messages**, not English fragments.

Prefer:

```ts
t('cargo.destination.label', { outpostName })
```

over:

```ts
`${t('cargo.destination')} ${outpostName}`
```

when the complete sentence/phrase structure is language-dependent.

Avoid assembling localized UI from translated fragments unless the composition is genuinely invariant.

### Stable technical facts remain invariant

Do not localize:

- `ResourceId`
- `ProductId`
- FormIDs
- EditorIDs
- schema keys/values
- internal enum values
- localStorage keys
- JSON property names
- filenames/extensions
- keyboard key tokens such as `Ctrl`, `Shift`, `Z`
- export filename timestamps
- canonical source timestamps
- developer-only diagnostic identifiers.

### English behavior should not regress

This is primarily an architecture migration.

The `en-US` application should remain visually and behaviorally equivalent unless wording must be normalized to support whole-message localization.

Do not turn this parcel into a UI redesign.

---

## Message catalogue expansion

Expand the semantic key set so `en-US` covers the full current application surface.

The audit recommends moderate namespaces such as:

```text
common
network
outpost
cargo
matrix
plannedSupply
validation
status
history
help
accessibility
```

Use repository evidence to refine names consistently.

Requirements:

- keys must represent user-facing meaning, not component file names alone;
- avoid extremely granular word-fragment keys;
- reuse action keys only when visible and accessible wording are genuinely identical;
- create separate accessible keys where a screen-reader label needs fuller wording;
- use variant keys for conditional grammatical cases rather than English concatenation.

Keep `en-US` as the complete baseline.

Keep `en-GB` sparse.

Do not add `ja-JP` yet.

---

## Parameter contracts

The current catalogue supports named interpolation but lacks strong parameter validation.

Add a deliberate parameter contract approach.

Preferred outcomes:

- each parameterized message has a known expected parameter shape;
- missing required parameters are caught in development/tests;
- unexpected parameters are diagnosable;
- rendering remains lightweight.

Do not introduce a heavyweight ICU system merely to obtain parameter typing.

A suitable design may use typed key-to-parameter mappings or equivalent compile-time/runtime validation.

The implementation should make incorrect calls such as:

```ts
t('validation.someRule', { wrongName: value })
```

hard to write or easy to detect.

---

## Visible UI migration

Migrate all current visible UI text that is tracker-authored.

The audit specifically identified high-risk/currently hard-coded areas including:

- shell/page controls;
- network controls;
- Outposts navigation;
- Character header;
- Outpost Details;
- Resource Matrix headings/state/action labels;
- manufacturing controls;
- Cargo Pad editors;
- Planned Supply;
- Search UI outside already migrated strings;
- validation panel;
- import/export;
- confirmation dialogs;
- About/preferences;
- status bar;
- empty states;
- save/cancel/edit/add/remove controls;
- collapse/expand/reorder/reshuffle controls.

Do not localize canonical reference names in this parcel beyond using the existing reference-name resolver where appropriate.

The Bethesda/reference-name completeness work belongs to later parcels.

---

## Accessibility string migration

Migrate all user-facing accessibility text into the same semantic catalogue.

This includes:

- `aria-label`;
- `aria-describedby` text;
- visually hidden labels;
- icon-only button labels;
- combobox/listbox instructions;
- drag/reorder instructions;
- dialog descriptions;
- close/dismiss labels;
- keyboard-help text;
- live-region messages.

The audit found 38 `aria-label` sites with only six direct `t(...)` calls and 56 `title` sites with only three direct `t(...)` calls, aside from helper-based localization.

The parcel is not complete until remaining accessibility text is accounted for.

Visible and accessible terminology should remain consistent.

Do not convert invariant keyboard tokens themselves into localized strings; localize the surrounding sentence/description.

---

## Tooltip and help migration

Migrate current tracker-authored tooltip/help/context strings.

At minimum review:

- matrix state/tooltips;
- resource presence/production help;
- organic-source help;
- power/efficiency explanations;
- cargo hints;
- drag/reorder hints;
- Planned Supply explanations;
- validation remediation/context;
- collapse/expand/reorder titles.

Do not construct localized help with English fragments such as:

```text
biome / biomes
comma-separated lists
manual `%`
hard-coded state labels
```

Use whole semantic messages and formatter helpers.

---

## Validator migration

This is one of the most important parts of Parcel A.

### Current problem

`ValidationIssue` currently requires a final English `message: string` and only optionally supports a semantic key for a tiny subset.

Domain rules often interpolate English reference names before presentation.

`validationPresentation.ts` then adds more English context/remediation.

This prevents clean Japanese translation later.

### Target direction

Refactor validators so domain rules emit structured semantic facts.

A target shape may resemble:

```ts
interface ValidationIssue {
  ruleId: string
  category: ValidationCategory
  severity: ValidationSeverity
  messageKey: ValidationMessageKey
  parameters: ValidationParameters

  // existing stable context IDs remain:
  // networkId, outpostId, cargoPadId, item IDs, body IDs, etc.
}
```

Use discriminated parameter contracts where practical.

### Required behavior

- all 25 current validator rules must stop depending on final English sentences as their primary output;
- rules should carry stable IDs/facts where possible;
- localized reference names should be resolved in presentation;
- unknown-ID diagnostics must preserve raw IDs as technical parameters;
- remediation text should use its own semantic message key where distinct;
- validation context such as `Pad {n}` must be localized;
- lists must use locale-aware list formatting;
- message order must be translation-controlled rather than assembled from fragments.

Do not remove stable rule IDs, categories, severities, or issue-navigation metadata.

### Compatibility

This refactor must not change validation semantics, severity, rule triggering, or issue navigation.

Only presentation ownership changes.

---

## Status and transient feedback migration

Migrate current status/transient strings including:

- import success/failure;
- export success/failure;
- reference-data load failures;
- dismiss/close actions;
- interaction hints;
- action success feedback;
- persistent presentation errors.

Avoid concatenating arbitrary `Error.message` into localized prose.

For expected import/deserialization failures:

- map known failures to stable presentation codes/keys plus structured parameters.

For unexpected failures:

- present a localized generic failure message;
- preserve raw technical detail separately for diagnostics where the existing UI supports it.

Do not discard useful diagnostics.

---

## Import/export error presentation

Audit and migrate:

- JSON parse failures;
- unsupported schema/version errors;
- invalid collection structure;
- invalid file content;
- file read failures;
- export failures.

Do not change transfer/storage formats.

Do not localize invariant schema/version tokens embedded in the diagnostic.

Where necessary, use semantic error descriptors:

```ts
{
  code: 'import.unsupportedSchema',
  params: { version }
}
```

rather than preformatted English.

---

## History / Undo / Redo migration

The audit explicitly recommends migrating history labels now.

### Current problem

History entries store final English labels.

Although history is session-only and there is no visible timeline, the latest labels are visible in Undo/Redo button titles.

A locale change cannot relocalize existing history entries.

### Target behavior

Replace final history strings with session-only semantic action descriptors.

Conceptually:

```ts
type HistoryLabelDescriptor = {
  key: HistoryMessageKey
  params: ...
}
```

Examples might include:

```ts
{
  key: 'history.cargo.link',
  params: {
    localOutpostName,
    localPadOrdinal,
    remoteOutpostName,
    remotePadOrdinal,
  }
}
```

### Parameter ownership

For user-authored names:

- capture the name at action time so later renames do not rewrite the historical meaning.

For Bethesda/reference-backed items:

- prefer stable kind/ID plus an English/canonical fallback if that allows safe relocalization.

### Requirements

- all App-level edit paths;
- all collection lifecycle history paths;
- Undo title;
- Redo title;

must use the semantic descriptor path.

No network JSON migration is required because history is session-only.

Do not change history snapshot semantics, history cap, operation granularity, or Undo/Redo behavior.

---

## Formatter helpers

Add only the formatter support the current application actually needs.

The audit recommends:

- existing `formatList`;
- `formatInteger`;
- `formatDecimal`;
- `formatPercent`;
- `getCollator` or equivalent display-name comparator.

Use `Intl` APIs.

Avoid speculative abstractions for date/time because the current application has no user-visible date/time display.

Do not localize export filename timestamps.

Do not localize FormIDs, EditorIDs, source timestamps, schema numbers, or technical identifiers.

---

## Direct reference-name consumers

The audit found that only some reference-name consumers currently use the localization resolver.

Parcel A should improve consistency where this is necessary for semantic messages and future Japanese support.

Audit places where UI directly reads:

```ts
resource.name
product.name
system.name
body.name
biome.name
species.name
```

For resources/products already supported by the reference-name layer, route visible display through the resolver where practical.

For populations not yet supported by official localization overlays, keep canonical English fallback but structure the call path so a later generated `ja-JP` overlay can plug in cleanly.

Do **not** implement the Bethesda Japanese overlays in this parcel.

Do not change stable IDs.

---

## Document language metadata

Update runtime document language to match the effective locale.

The localization provider should update:

```ts
document.documentElement.lang
```

whenever effective locale changes.

For this parcel the valid values remain current supported locales:

```text
en-US
en-GB
```

`index.html` may retain a safe static pre-hydration fallback such as `en`.

Add tests for initial resolution and runtime switching.

Do not add Japanese resolution yet.

---

## Catalogue completeness and diagnostics

Introduce a deliberate concept of baseline completeness.

Requirements:

- `en-US` must contain every semantic message key;
- `en-GB` remains a sparse override;
- missing baseline keys must fail tests/type checks;
- parameter mismatches should be diagnosable;
- duplicate keys should be impossible or caught;
- unknown keys must not silently render nonsense.

Prepare the architecture so Parcel B can register `ja-JP` as a **complete release locale**, distinct from sparse regional overrides.

Do not implement Japanese completeness enforcement yet beyond any reusable infrastructure needed.

---

## Residual-English audit helper

Add or design a maintainable way to detect accidentally hard-coded tracker English in critical UI paths.

This should not be a naive repository-wide ban on English string literals.

Allowlist/exclude:

- product/application names;
- reference data;
- IDs;
- abbreviations;
- technical tokens;
- test fixture source data;
- developer diagnostics;
- documentation.

A practical test or targeted scanner is preferred if it can be maintained without frequent false positives.

If a robust automated scanner is not practical in this parcel, document the manual verification approach and add focused tests around the highest-risk surfaces.

---

## Tests

Add or update tests covering at least:

### Baseline catalogue

- `en-US` key completeness;
- `en-GB` sparse fallback;
- parameter interpolation;
- parameter validation/diagnostics.

### UI semantics

- representative visible UI labels resolve through `t(...)`;
- accessibility labels resolve semantically;
- tooltip/help helpers use catalogue messages.

Avoid brittle tests that simply duplicate the whole English catalogue unless they are intentionally completeness tests.

### Validators

- every rule emits a semantic descriptor;
- presentation resolves descriptor parameters;
- localized list formatting is used where appropriate;
- raw unknown IDs remain visible;
- issue severity/category/rule IDs remain unchanged;
- no rule behavior changes.

### Status/import

- known import errors map to stable semantic codes;
- generic unexpected error path localizes user-facing text while retaining diagnostics.

### History

- history entries store semantic descriptors rather than final English;
- Undo/Redo labels render correctly;
- changing locale relocalizes existing session history labels;
- user-authored names remain captured at action time;
- history remains session-only and does not affect persisted collection JSON.

### Document language

- initial effective locale updates `document.documentElement.lang`;
- switching locales updates it immediately.

### Formatting

- list formatting;
- integer/decimal/percent helpers where used;
- invariant export filename timestamp remains unchanged.

### Stable behavior

- no network schema version change;
- import/export shapes unchanged;
- reference IDs unchanged;
- Undo/Redo semantics unchanged.

---

## English wording preservation

Where practical, preserve existing `en-US` wording exactly.

If semantic migration requires wording changes:

- keep them minimal;
- document notable changes in the implementation summary;
- do not introduce stylistic rewrites unrelated to localization.

This parcel should be reviewable primarily as architecture/string ownership, not copy editing.

---

## Documentation updates

Update current documentation after implementation.

### `docs/ARCHITECTURE.md`

Document:

- semantic message catalogue as the complete tracker-owned UI text boundary;
- complete baseline vs sparse locale overrides;
- validator semantic descriptors;
- status/import semantic descriptors where applicable;
- history semantic descriptors;
- runtime document-language ownership;
- localization preferences remaining outside collection/history state.

### `docs/DOMAIN-RULES.md`

Only update where needed to clarify:

- validation domain facts are separate from localized presentation;
- history remains session-only;
- localization does not alter stable persisted identity.

### `docs/BACKLOG.md`

Update the localization section to remove completed Parcel A items.

Retain genuinely deferred items:

- Japanese catalogue;
- Bethesda official-term extraction;
- Japanese reference-name overlays;
- Japanese font/layout/search hardening;
- any future ICU/FormatJS need if still deferred.

### `docs/UX-DESIGN.md`

Update only if needed to capture:

- complete localized accessible naming;
- locale-aware presentation rules;
- no-fragment composition;
- document-language behavior.

Do not rewrite unrelated historical docs/briefs.

---

## Suggested implementation sequence

1. Inventory all remaining tracker-owned hard-coded strings and map them to semantic key namespaces.
2. Expand localization key/types and complete `en-US`.
3. Add/strengthen typed parameter contracts.
4. Add minimal formatter helpers.
5. Migrate visible UI and accessibility strings.
6. Migrate tooltip/help/context helpers.
7. Refactor validators to structured semantic descriptors.
8. Refactor validation presentation/remediation/context.
9. Refactor status/transient/import error presentation.
10. Refactor history labels to semantic descriptors.
11. Update `document.documentElement.lang`.
12. Route remaining applicable resource/product display paths through the reference-name resolver.
13. Add completeness/descriptor/history/document-language tests.
14. Perform a residual hard-coded-English review.
15. Update current architecture/domain/backlog documentation.
16. Run full verification.

Keep intermediate states buildable where practical.

---

## Verification requirements

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

Also run any new localization-specific test command if added.

Manually verify at minimum:

- current `en-US` UI appears unchanged in normal use;
- `en-GB` still falls back correctly;
- locale switching remains immediate;
- Undo/Redo titles work after several edits;
- validation pop-out renders correctly;
- import/export success and failure states render correctly;
- accessible/icon-only controls retain meaningful names;
- document `<html lang>` changes with locale;
- no obvious `[object Object]`, missing-key token, raw message key, or interpolation placeholder leaks into UI.

Do not commit or push unless explicitly instructed.

---

## Final implementation summary requirements

At completion, report:

- approximate final semantic message-key count;
- major namespaces added;
- number of validator rules migrated;
- whether all visible/accessibility/help/status/history paths were migrated;
- validator descriptor shape;
- history descriptor shape;
- formatter helpers added;
- document-language behavior;
- any intentionally invariant English/technical text left outside localization;
- any deferred hard-coded strings and justification;
- verification results;
- confirmation that no Japanese content or Bethesda extraction was added;
- confirmation that no network/persistence schema migration occurred.

---

## Acceptance criteria

Parcel A is complete when:

- `en-US` is the complete baseline catalogue for current tracker-owned user-facing text;
- `en-GB` remains a sparse override;
- ordinary visible UI text is no longer broadly hard-coded in components/helpers;
- accessible names/descriptions are semantically localized;
- tooltip/help/context strings are semantically localized;
- all current validator rules emit semantic structured descriptors rather than relying on final English messages;
- validation presentation localizes contexts/remediations/lists;
- status/transient/import expected errors use semantic presentation keys/codes;
- history/Undo/Redo labels are semantic and relocalizable;
- locale switching updates `document.documentElement.lang`;
- required number/list/percent formatting uses `Intl` helpers;
- existing stable IDs and runtime reference-data contracts are unchanged;
- network/browser-storage/import/export schema is unchanged;
- English UI behavior is materially unchanged;
- all tests/build/lint/reference generation checks pass;
- documentation describes the new semantic boundary;
- Japanese translation and Bethesda localization extraction remain deferred to later parcels.
