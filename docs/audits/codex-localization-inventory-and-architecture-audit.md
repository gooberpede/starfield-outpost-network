# Localization inventory and architecture audit

## Executive summary

The application has no localization infrastructure today. User-visible text is distributed across React components, `App.tsx`, domain validators, data/import errors, contextual-help helpers, generated persisted names, and session history labels.

The main architectural risks are:

- reference display names are consumed directly from runtime JSON throughout UI and validation code;
- validators currently emit complete English sentences;
- history stores complete English labels;
- `New Outpost` and cargo-pad labels are persisted user data;
- English word order, plurals, lists, percentages, and labels are assembled directly in code;
- application preference storage does not yet exist.

The recommended direction is:

1. Introduce a small typed localization boundary with `en-GB` as the complete fallback catalogue.
2. Resolve locale from browser preference plus an explicit persisted override.
3. Keep locale outside `NetworkCollection` and `OutpostNetwork`.
4. Use an ID-keyed locale overlay for reference-data display names.
5. Preserve all existing reference IDs, including `aluminium`.
6. Move validation presentation toward stable message keys and structured parameters.
7. Represent new history entries as action keys plus captured parameters.
8. Treat already-persisted generated names as user data and never rename them merely because locale changes.

This is compatible with the current architecture and permits incremental adoption without regenerating per-locale reference datasets.

---

## String-source inventory

| Category | Representative examples | Current source | Recommended owner |
|---|---|---|---|
| Static UI chrome | Undo, Redo, Export, Import, Delete Outpost, Planned Supply | JSX in `App.tsx` and components | UI catalogue |
| Parameterized UI | `Undo: {label}`, `Move {name} up`, `Validation: {count} issues` | JSX/template literals | UI catalogue with whole-message templates |
| Dialog copy | Reset/Delete Network headings and consequences | `App.tsx`, shared dialog buttons | UI catalogue |
| Validation messages | Missing input, invalid body, duplicate entries, skill limits | Domain validation rules | Structured issue key/params, rendered by localization layer |
| Validation presentation | `Pad {n}`, `Available from: …` | `validationPresentation.ts` | UI/validation catalogue and formatters |
| Help and tooltips | Planned Supply explanation, power output, resource presence | `contextHelpText.ts`, `statusTooltips.ts` | Help/tooltip catalogue |
| Accessible copy | `aria-label`, titles, dialog close names | Components and layouts | Same catalogue as visible concepts |
| Generated names | `New Outpost`, `New Outpost (2)` | `domain/defaults.ts` | Localized generation policy, then persisted as user data |
| Cargo-pad names | `Pad 1`, `Pad 2` | Persisted labels plus presentation ordinals | Defer schema decision; localize presentation ordinals carefully |
| History labels | Add network, link pads, resource/product edits | `App.tsx`, `collectionEditingSession.ts` | Stable action descriptors plus params |
| Status/import/export copy | Exported/imported file, import failure, reference-data failure | `App.tsx`, data helpers, import button | UI catalogue; structured expected errors |
| Reference names | Resources, products, systems, bodies, biomes, species | Generated reference JSON | Reference-name resolver keyed by stable identity |
| Formatting-sensitive text | Counts, plurals, lists, percentages, ordinal positions | Components and helpers | Locale formatter service |
| Invariant strings | IDs, FormIDs, schema keys, filenames, rule IDs | Domain/data/build layers | Remain invariant |

The largest concentration is [App.tsx](D:/Projects/starfield-outpost-network/src/App.tsx), which owns most semantic action/history labels, status messages, network controls, and confirmation copy. Other major concentrations are:

- [CargoPadsEditor.tsx](D:/Projects/starfield-outpost-network/src/ui/components/CargoPadsEditor.tsx)
- [OutpostStatusMatrix.tsx](D:/Projects/starfield-outpost-network/src/ui/components/OutpostStatusMatrix.tsx)
- [PlannedSupplyEditor.tsx](D:/Projects/starfield-outpost-network/src/ui/components/PlannedSupplyEditor.tsx)
- [ValidationSummary.tsx](D:/Projects/starfield-outpost-network/src/ui/components/ValidationSummary.tsx)
- [src/domain/validation/rules](D:/Projects/starfield-outpost-network/src/domain/validation/rules)
- [networkMigration.ts](D:/Projects/starfield-outpost-network/src/data/networkMigration.ts) and [serialization.ts](D:/Projects/starfield-outpost-network/src/data/serialization.ts)

The scan found at least 38 `aria-label` sites and 41 `title` sites. Those are line-level signals, not counts of unique translations.

---

## Reference-data name audit

| Entity | Stable identity | Current display-name source | Runtime name owner |
|---|---|---|---|
| Resources | Logical slug derived from curated dictionary name | Inorganic/organic dictionaries | `resources.json` |
| Products | Logical slug derived from curated product name | Manufactured-product dictionary | `products.json` |
| Systems | Canonical `StarSystemID` | `SystemName` in `planet-directory.csv` | `systems.json` |
| Bodies | Planet FormID | `PlanetName` in `planet-directory.csv` | `bodies.json` |
| Biomes | Biome FormID | `BiomeName` in occurrence extracts | `biomes.json` |
| Species | Species FormID | `SpeciesDisplayName` in organic extract | `species.json` |

Names are repeated extensively in source occurrence rows, but the generated runtime architecture normalizes them well:

- name-bearing catalogues contain each entity’s name;
- relational catalogues such as `body-biomes`, `inorganic-occurrences`, `planet-species`, `organic-occurrences`, recipes, and body resources contain IDs rather than repeated names;
- UI and several validators consume catalogue `.name` fields directly;
- unresolved references normally fall back to raw IDs.

This structure permits an overlay without altering relationships or persisted gameplay data.

### Aluminium / Aluminum trace

The end-to-end path is:

```text
inorganic-resource-dictionary.csv
  Code=Al, Resource=Aluminium
          │
          ├─ createNameId("Aluminium") → stable ID "aluminium"
          │
          ▼
scripts/build-reference-data.mjs
          │
          ▼
resources.json
  { id: "aluminium", name: "Aluminium", shortName: "Al", ... }
          │
          ▼
referenceDataLoader.ts
          │
          ▼
UI components and validators read resource.name directly
```

The raw game occurrence extract uses `Aluminum`. [biome-reference-data.mjs](D:/Projects/starfield-outpost-network/scripts/biome-reference-data.mjs:8) contains a build-only alias:

```text
Aluminum → Aluminium
```

This resolves raw occurrence FormIDs to the curated resource ID. It is identity crosswalk logic, not runtime localization.

Additional observations:

- Recipes use `Aluminium` and resolve ingredients by curated catalogue name.
- The runtime resource name is defined in [resources.json](D:/Projects/starfield-outpost-network/public/reference-data/resources.json:21).
- [resources.ts](D:/Projects/starfield-outpost-network/src/domain/resources.ts:5) also contains a legacy static `Aluminium` entry, but no current source import was found.
- Sample data uses the stable ID `aluminium`, not its display name.
- Validation and history do not generally hardcode the word; they interpolate `resource.name`, so today they inherit `Aluminium`.
- Tooltip tests explicitly expect `Aluminium`, so localization-aware tests will need locale-specific expectations.

Changing the displayed name to `Aluminum` can therefore be done without changing matching, recipes, occurrences, saves, or the `aluminium` ID.

Although the existing ID contains British spelling, it must now be treated as an opaque stable identifier—not regenerated from a localized display name.

---

## Reference-name architecture options

| Model | Advantages | Disadvantages | Assessment |
|---|---|---|---|
| A. Localized fields in each reference record | Easy lookup; self-contained records | Bloats canonical records; couples identity data to every locale; schema churn; sparse fallback is awkward | Workable, but not preferred |
| B. Canonical records plus locale overlay | Preserves existing pipeline and IDs; minimal duplication; clear fallback; overlays can be tested independently | Requires a central resolver; direct `.name` consumers must migrate | **Recommended** |
| C. Generated runtime dataset per locale | Simple runtime access; sorting can be precomputed | Duplicates large relational datasets; greater build/cache complexity; risks locale-specific identity drift | Poor fit |
| D. Runtime text substitution | Tiny initial change | Cannot safely distinguish identity, prose, user names, or substrings; a dead end | Reject |

Recommended conceptual flow:

```text
Stable reference record
(id, relationships, canonical fallback name)
               +
Locale name catalogue
(entity kind + stable ID → localized display name)
               │
               ▼
Reference display-name resolver
               │
        ┌──────┴──────┐
        ▼             ▼
       UI       validation/history
```

For `en-GB`, the existing canonical names can initially serve as fallback. The `en-US` overlay may be sparse and contain only real differences such as:

```text
resource.aluminium → Aluminum
resource.caesium   → Cesium
```

Future non-English locales should normally supply complete reference-name catalogues. Fallback order should be:

1. exact selected-locale reference name;
2. `en-GB` reference name;
3. canonical runtime name;
4. raw stable ID.

---

## Parameterized and generated strings

Safe candidates for ordinary parameterized templates include:

- `Move {name} up`
- `Remove {item} from Planned Supply`
- `{resource} may be present at this outpost`
- `Exported {filename}`

They are safe only if the complete sentence is owned by the catalogue.

Higher-risk patterns include:

- concatenated cargo destination labels: `Pad …` + `— linked to …`;
- nested conditional fragments such as `Expand`/`Collapse` followed by a name;
- manual list formatting with `join(' and ')`, comma joins, and Oxford-comma assembly;
- conditional singular fragments such as `biome`/`biomes`, `issue`/`issues`;
- history prefixing via `Network {ordinal}: {label}`;
- duplicated names inside one validation sentence, such as `{input} … but {input} …`;
- composing `resource.name`, `pad.label`, and `/` separators into grammatical text;
- status messages that append raw exception messages;
- `source: qualitative · multiplier output (modifier)` assembled from fragments.

These should become whole-message catalogue entries. Lists should use `Intl.ListFormat`; counts should use one centralized plural API rather than JSX ternaries.

### Generated persisted names

[defaults.ts](D:/Projects/starfield-outpost-network/src/domain/defaults.ts:49) generates `New Outpost` and numbered variants, and the resulting string is stored in `Outpost.name`.

Recommended policy:

- generate a localized default when the outpost is created;
- once persisted, treat it exactly like user-entered data;
- do not rename it when locale changes;
- do not attempt to infer later whether the user edited it;
- allow newly created outposts under a different locale to use that locale’s default;
- do not add generated-name metadata to the first localization implementation.

This avoids surprising save mutations and Undo/history complications.

Cargo-pad labels are also persisted and renumbered. Because their persisted-versus-derived future is already unresolved, changing that schema should remain outside localization’s first phase.

### History labels

[collectionEditingSession.ts](D:/Projects/starfield-outpost-network/src/domain/collectionEditingSession.ts:16) stores final `label: string` values. Most labels originate in `App.tsx`, and multi-network context is prefixed as `Network {n}: {label}`.

Recommended future representation:

```ts
{
  actionKey: 'history.cargo.link',
  params: {
    localOutpostName: capturedUserText,
    localPadOrdinal: 1,
    remoteOutpostName: capturedUserText,
    remotePadOrdinal: 2
  }
}
```

Reference entities should use stable IDs where they can be resolved against the current locale. User-authored names should be captured as literal parameters at action time so later edits do not rewrite history meaning.

History can then re-render when locale changes. A temporary hybrid with `label` as a legacy fallback is sensible during migration. The existing global contextual snapshot architecture does not need to change.

---

## Validation localization audit

Current validation is mixed structurally:

- issues have stable `ruleId`, category, severity, and optional IDs/context;
- they also contain a final English `message: string`;
- rule metadata has final English `name` and `description`;
- many validators directly resolve reference `.name` values;
- presentation adds more English context and remediation text.

Recommended target:

```ts
interface ValidationIssue {
  ruleId: string
  messageKey: ValidationMessageKey
  messageParams: StructuredParams
  // existing stable context IDs remain
}
```

The domain should decide what happened and provide structured facts. Presentation/localization should decide how to say it.

For example, `manufacturing-input-unavailable` should carry product/item identity and outpost context, not:

```text
Adaptive Frame requires Aluminium, but Aluminium is not available...
```

This preserves stable rule IDs and domain/UI separation while allowing the resource name to become `Aluminum` in `en-US`.

Rule `name` and `description` are also display metadata and should be resolved from catalogue keys if exposed to users. Internal rule IDs, categories, and severities remain invariant.

---

## Accessibility ownership

Accessible names, `title` text, contextual-help trigger labels, dialog labels, and screen-reader descriptions should use the same localization service as visible copy.

Where visible and accessible wording express the same action, they should derive from the same key or concept. Current examples with duplicated independently maintained strings include:

- Previous/Next/Add/Delete Network `aria-label` and `title`;
- Show/Hide navigation;
- drag and move controls;
- Expand/Collapse cargo pad;
- dismiss/close actions;
- power tooltip used separately as `title` and `aria-label`.

Localization should not introduce a second accessibility-only catalogue unless the accessible wording is intentionally different.

---

## Status and transient messages

Current status text is a mixture of:

- hardcoded App-level success messages;
- App-level templates around filenames;
- import errors created in UI/data helpers;
- raw `Error.message` values propagated into status;
- reference-loader transport errors containing path and HTTP status;
- generic fallback strings.

Expected failures should eventually use structured error codes and parameters. Unexpected errors should show a localized generic message; raw technical details can remain available for diagnostics rather than being concatenated into localized prose.

Export filenames themselves should remain invariant.

---

## Locale-sensitive formatting audit

No `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.ListFormat`, or locale-aware display service exists.

Current user-facing formatting includes:

- counts with manual singular/plural selection;
- validation severity counts;
- network position as `current / total`;
- pad/position ordinals;
- manual English lists using commas and `and`;
- percentages constructed with `Math.round`, signs, and `%`;
- multiplier formatting using `toFixed(2)`;
- sorting using default `localeCompare`;
- one validator explicitly sorting with locale `'en'`.

No user-facing date or time display currently exists. History timestamps use `Date.now()` but are not displayed.

The export filename uses local clock components formatted manually as:

```text
YYYY-MM-DD-HHMMSS
```

That is a stable filename convention, not localized display formatting, and should remain unchanged unless separately redesigned.

Invariant formats include JSON keys, schema versions, stable IDs, FormIDs, rule IDs, action keys, storage keys, MIME types, file extensions, reference file paths, and export timestamp structure.

---

## Locale preference and storage

The app currently has:

- browser `localStorage` only for `NetworkCollection`;
- session-only React presentation state;
- no application preferences model;
- no settings dialog;
- no browser-language detection.

Locale is an application preference and must not enter `OutpostNetwork`, `SavedNetwork`, or `NetworkCollection`.

Recommended model: **browser default plus explicit override**.

A separate, versioned application-preferences storage record should hold something like:

```ts
{
  localeOverride: 'en-GB' | 'en-US' | null
}
```

Resolution should be deterministic:

1. explicit supported override;
2. supported match from `navigator.languages`;
3. map other English locales according to documented policy;
4. fall back to `en-GB`.

An “Automatic” UI choice should correspond to `null`. This gives sensible first-run behaviour, user control, persistence, and straightforward tests.

Browser-only is unpredictable and offers no correction. Explicit-only requires an unnecessary first-run choice or silently chooses a fixed locale.

---

## Localization library assessment

A third-party dependency is not necessary for the initial `en-GB`/`en-US` implementation.

A small typed resolver is sufficient if it provides:

- complete-message lookup by stable key;
- typed or validated parameters;
- locale fallback;
- reference-name lookup by entity kind and stable ID;
- centralized number/list/plural formatting;
- no fragment concatenation in components;
- missing-key checks in tests.

The abstraction should be replaceable. Once a non-English translation or translator-oriented workflow is planned, FormatJS/`react-intl` would be the strongest next candidate because ICU message syntax handles plural, select, and word-order changes. `react-i18next` is also viable, especially if dynamic catalogue loading becomes important.

Avoid inventing a large custom ICU parser.

### Recommended module structure

```text
src/localization/
  locale.ts
  types.ts
  catalog.ts
  formatters.ts
  referenceNames.ts
  LocalizationProvider.tsx
  locales/
    en-GB.ts
    en-US.ts

src/data/
  applicationPreferences.ts
```

Keep initial catalogue grouping moderate, for example:

```text
common.*
network.*
outpost.*
cargo.*
validation.*
help.*
status.*
history.*
reference.*
```

Use semantic keys such as `network.delete.confirmTitle`, not English-text keys such as `DELETE_NETWORK`.

---

## Safest migration plan

1. **Characterization and core infrastructure**
   - Add locale types, fallback resolution, typed catalogue lookup, formatters, and tests.
   - Initially resolve everything to `en-GB`; no persisted gameplay changes.

2. **Application preference**
   - Add separate preference storage.
   - Support browser default plus explicit override.
   - Keep locale out of Undo/Redo and imports/exports.

3. **Shell, static UI, accessibility, and help**
   - Migrate buttons, headings, dialogs, titles, `aria-label`s, empty states, and centralized contextual help.
   - Prove visible and accessible copy share keys.

4. **Validation and status errors**
   - Introduce message keys/params.
   - Localize validation presentation, plural counts, lists, import failures, and transient status.

5. **Reference-name overlay**
   - Add stable-ID reference display resolver.
   - Migrate all direct `.name` presentation sites.
   - Prove `aluminium` displays differently without changing identity or recipes.

6. **Generated persisted names and history**
   - Localize creation-time defaults while preserving existing names.
   - Migrate history to action descriptors with captured parameters and legacy fallback.

7. **Formatting and cleanup**
   - Centralize locale-aware sorting, lists, numbers, percentages, and future dates.
   - Search again for residual user-facing literals and fragments.

---

## First-implementation proof cases

The first vertical implementation should test:

1. **Aluminium / Aluminum** — proves localized reference display is separate from identity and crosswalks.
2. **Delete Network** — covers visible button text, title/ARIA text, destructive dialog heading, confirmation label, and explanatory copy.
3. **Manufacturing input unavailable** — proves parameterized validation with two localized reference names.
4. **New Outpost / New Outpost (2)** — proves creation-time localization and the persisted-name policy.
5. **Resource-presence tooltip** — proves help/accessibility text uses the same localized reference-name resolver.
6. **Validation issue count** — additionally recommended because it cheaply proves plural formatting.

---

## Risks and edge cases

Highest-risk areas are:

- `App.tsx`, because it mixes orchestration with final history and status wording;
- domain validation rules, because display names and English sentences are generated below the presentation boundary;
- direct `.name` access across UI and validators;
- changing locale while session history already exists;
- persisted generated outpost names;
- persisted and renumbered cargo-pad labels;
- import exceptions whose English text is surfaced directly;
- reference-name sorting and duplicate biome-name grouping;
- sparse catalogue fallback hiding missing translations;
- user-authored names that resemble generated defaults;
- raw unknown IDs, which must remain visible and invariant;
- test fixtures that assert complete English strings.

---

## Likely file-by-file implementation impact

New modules would likely live under `src/localization/` plus a separate application-preference storage module.

Major later modifications:

- [App.tsx](D:/Projects/starfield-outpost-network/src/App.tsx)
- [collectionEditingSession.ts](D:/Projects/starfield-outpost-network/src/domain/collectionEditingSession.ts)
- [defaults.ts](D:/Projects/starfield-outpost-network/src/domain/defaults.ts)
- [validation types](D:/Projects/starfield-outpost-network/src/domain/validation/types.ts)
- [validation rules](D:/Projects/starfield-outpost-network/src/domain/validation/rules)
- [validationPresentation.ts](D:/Projects/starfield-outpost-network/src/ui/validationPresentation.ts)
- [contextHelpText.ts](D:/Projects/starfield-outpost-network/src/ui/contextHelpText.ts)
- [statusTooltips.ts](D:/Projects/starfield-outpost-network/src/ui/statusTooltips.ts)
- UI components and layout modules containing JSX copy and accessible names
- [serialization.ts](D:/Projects/starfield-outpost-network/src/data/serialization.ts)
- [networkMigration.ts](D:/Projects/starfield-outpost-network/src/data/networkMigration.ts)
- localization-focused tests and existing exact-string tests

Under the recommended overlay model, the builder and canonical reference schemas need not change initially. The raw CSVs, generated relational JSON, and persisted network schemas should remain unchanged.

---

## Direct answers

1. Major categories: UI chrome, parameterized copy, validation, help/tooltips, accessibility, generated names, history, status/errors, reference names, formatting-sensitive text, and invariant technical strings.
2. They are concentrated in `App.tsx`, feature components, validation rules, localization-adjacent UI helpers, and import/migration helpers.
3. Visible UI copy, accessible copy, help, tooltips, dialogs, status text, empty states, rule display metadata, and whole parameterized messages belong in UI catalogues.
4. Stable IDs, FormIDs, schema/storage keys, rule/action IDs, JSON structure, paths, MIME types, abbreviations intended as canonical codes, and export filename structure remain invariant.
5. Use canonical reference records plus a locale overlay keyed by entity kind and stable ID.
6. `Aluminium` originates in `inorganic-resource-dictionary.csv`; the ID and runtime name are generated from that curated record. Raw occurrence `Aluminum` is crosswalked at build time.
7. Yes. Canonical identity must remain locale-neutral/opaque and stable.
8. Validators should emit stable message keys plus structured parameters and context IDs.
9. Accessible names and tooltips should use the same localization mechanism as visible copy.
10. Persisted generated names remain exactly as created after locale changes.
11. New history entries should store stable action keys plus captured parameters; final localized strings should be rendered at presentation time.
12. Manual English list joins, conditional word fragments, concatenated cargo labels, network-prefix composition, manual plural nouns, and raw exception concatenation are the main hazards.
13. Manual percentage/multiplier formatting, plural counts, list formatting, ordinals, network counts, and locale-sensitive sorting exist. No localized user-facing date/time formatting exists.
14. Locale belongs in a separate application-preferences store.
15. Browser default with explicit persisted override.
16. No third-party library is required for the initial two English locales; preserve an API boundary for future FormatJS adoption.
17. Use a compact typed `src/localization/` module with locale files, formatters, provider, and reference-name resolver.
18. Exact locale → `en-GB` → canonical reference name/raw ID; missing UI keys should fail tests and warn/fail loudly during development.
19. Infrastructure, preference, static/accessibility/help, validation/status, reference names, generated/history text, then formatting cleanup.
20. Aluminium, Delete Network, one parameterized validation, New Outpost numbering, one tooltip, and preferably a plural count.
21. `App.tsx`, validators, reference display lookup sites, history, defaults, cargo label assembly, import errors, and exact-string tests.
22. Exclude bulk non-English translation, ID/schema changes, CSV or generated-data rewrites, retroactive persisted-name changes, cargo-pad schema redesign, localized export filenames, accessibility redesign, and unrelated UX/history work.

## Verification

No repository files were changed.

- `git diff --check`: passed with no output.
- `git status --short`: only the supplied audit brief is untracked:
  `docs/implementation-briefs/CODEX_AUDIT_BRIEF_localization-inventory-and-architecture.md`
- Tests/build/lint were not run because the task was a read-only audit with no implementation changes.
- No commit or push was performed.