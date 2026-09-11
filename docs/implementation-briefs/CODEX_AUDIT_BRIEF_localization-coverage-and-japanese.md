# CODEX AUDIT BRIEF — Full Localization Coverage and First Non-English Locale

## Purpose

Audit the current localization architecture and define an implementation-ready plan for taking the application from its present partial localization foundation to **full practical support for at least one non-English language**, with **Japanese (`ja-JP`) as the preferred first target** unless repository or source evidence identifies a compelling blocker.

This is an **audit and design-recommendation task only**.

Do not bulk-migrate strings, add Japanese translations, alter runtime locale behavior, change source datasets, add dependencies, or implement UI/layout fixes as part of this audit unless explicitly instructed in a later implementation brief.

The audit must produce a written report at:

`docs/audits/codex-localization-coverage-and-japanese-audit.md`

Do not leave the report only in terminal/chat output.

---

## Product goal

The target end state of the eventual localization implementation parcel is stronger than “localization-ready.”

The intended release-readiness outcome is:

> A user can switch the application to Japanese and use a substantially Japanese application, including tracker UI text and canonical Bethesda game terminology wherever official Japanese localization exists.

That means the eventual implementation should cover both:

1. **tracker-authored UI language**, such as controls, help, validation, status, transient feedback, accessible labels, dialog text, and settings; and
2. **Bethesda-owned reference/master-data names**, such as resource/product names and other game terms used by the tracker, sourced from Bethesda's official localization data wherever possible.

The audit must determine what work is required to reach that end state safely and cleanly.

---

## Existing localization foundation

The application already has an initial localization architecture.

The current backlog describes the existing foundation as supporting:

- Automatic locale selection;
- explicit `en-US`;
- explicit `en-GB`;
- semantic message catalogues;
- sparse reference-name overlays;
- a representative localized vertical slice.

Deferred work includes:

- migrating remaining UI strings;
- migrating remaining accessible/help/status/transient strings;
- migrating remaining validators to semantic keys and structured parameters;
- deciding when history labels should move from final strings to action keys;
- adding non-English content;
- applying locale-aware formatting where appropriate.

Do not redesign this foundation without evidence that it is inadequate.

Audit the current implementation before proposing changes.

---

## Required repository reading

Read at minimum:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- all localization modules under `src/localization/`
- all locale files, including `en-US` and `en-GB`
- locale preference/state handling
- reference-name localization/overlay code
- all validators
- all UI components with visible text
- all dialogs/modals
- status bar/transient feedback code
- Search for Items
- Planned Supply
- Resource Matrix / manufacturing UI
- navigation
- import/export
- network/outpost/cargo editing
- About/settings/preferences UI
- keyboard shortcut/help strings
- accessibility labels/descriptions
- history label generation
- persistence/import/export filename/timestamp handling
- reference-data loaders/types
- tests covering localization and reference-name display.

Search the entire repository for hard-coded user-facing English text rather than relying only on obvious localization directories.

---

## External localization source to investigate

Bethesda ships official Starfield localization data in:

`Starfield - Localization.ba2`

This archive is expected to contain Bethesda binary string files such as:

- `.strings`
- `.dlstrings`
- `.ilstrings`

for multiple official languages, including Japanese.

A potentially useful reference implementation is:

`https://github.com/0xra0/bethesda-strings-editor`

Study this repository as a **reference**, especially its:

- BA2 parsing;
- Bethesda `.strings` / `.dlstrings` / `.ilstrings` decoding;
- official terminology mining;
- same-string-ID alignment between official source and target languages;
- language detection;
- string-file triplet handling.

In particular, inspect:

`bethesda_strings/official_tm_miner.py`

The relevant model is:

```text
(plugin, extension, string ID)
    -> English Bethesda string
    -> Japanese Bethesda string
```

The tool's implementation states that the string-file extensions have independent ID spaces, so alignment must remain scoped to the same:

```text
(plugin, extension, string ID)
```

Do not assume a numeric string ID can be joined across `.strings`, `.dlstrings`, and `.ilstrings`.

Do not adopt the external project wholesale as a dependency without explicit justification.

The audit should determine whether the project should:

- reuse/adapt a small amount of parsing logic;
- introduce a build-time utility of its own;
- rely on an external extraction step;
- or use another cleaner approach.

Note relevant licensing implications if code reuse is recommended.

---

## Bethesda localization architecture question

A core audit question is how to connect the project's canonical FormID-based reference data to Bethesda's localized string tables.

The preferred conceptual chain is:

```text
canonical record FormID
    -> localized FULL/name field string ID
    -> Bethesda English localized string
    -> Bethesda Japanese localized string
    -> application reference-name overlay
```

Audit whether this chain is available.

Specifically determine:

1. whether the Starfield ESM/record fields used for names expose raw localized string IDs;
2. whether xEdit can expose those string IDs directly;
3. whether the project's existing canonical extracts already carry those IDs anywhere;
4. whether canonical extraction scripts would need a new field such as:
   - `NameStringID`
   - `FullNameStringID`
   - or a domain-specific equivalent;
5. whether string-ID joins are stable and appropriate for:
   - inorganic resources;
   - organic resources;
   - manufactured products;
   - systems;
   - bodies/planets/moons;
   - biomes;
   - skills/capabilities if surfaced;
   - any other Bethesda-owned terms currently shown in the UI;
6. whether some displayed names are stored directly in records rather than localized string tables;
7. whether DLC/master-file boundaries require plugin-qualified string identity.

Do not fall back to English-name joins unless no canonical ID-based route exists.

If a string-ID extraction step is required, describe exactly what additional canonical columns should be added and to which source files.

---

## First non-English target: Japanese

Treat `ja-JP` as the preferred first fully supported non-English locale.

The audit must determine whether Japanese is feasible with the current application architecture and CSS/font stack.

Japanese is intentionally a demanding first locale because it tests:

- non-Latin glyph coverage;
- font fallback;
- font-family assumptions;
- compact UI widths;
- dense matrix/grid layout;
- wrapping and clipping;
- search behavior;
- case-folding assumptions;
- locale-sensitive sorting;
- punctuation and spacing;
- screen-reader/accessible text;
- locale selector presentation;
- tooltip/help density.

Do not recommend switching to an easier Latin-script language merely to reduce work unless Japanese has a concrete technical blocker.

---

## Font and glyph audit

The app currently uses:

- Barlow Semi Condensed for UI;
- IBM Plex Mono for monospaced text.

Audit whether those fonts cover Japanese glyphs.

If not, determine:

- what fallback the browser currently uses;
- whether the fallback preserves visual coherence;
- whether an explicit Japanese-capable fallback stack is required;
- whether the mono font needs separate fallback handling;
- whether font metrics materially affect dense UI layout;
- whether downloadable/bundled fonts would be required for deterministic presentation;
- any licensing implications of proposed fonts.

Do not include or redistribute font files as part of the audit.

The report should recommend the minimum reliable font strategy for Japanese.

---

## Tracker-authored string inventory

Inventory every current user-facing string and classify it.

Required categories:

### Visible UI
Examples:

- headings;
- buttons;
- labels;
- menu items;
- placeholders;
- table/grid headers;
- badges/status labels;
- settings/preferences;
- modal titles/actions.

### Accessible text
Examples:

- `aria-label`;
- `aria-describedby`;
- visually hidden labels;
- icon-only control labels;
- combobox/listbox announcements;
- drag/reorder instructions;
- dialog descriptions.

### Help and contextual guidance
Examples:

- tooltips;
- micro-help;
- contextual explanations;
- validation explanations;
- empty-state guidance.

### Validation
Examples:

- issue titles/messages;
- parameterized diagnostics;
- severity labels;
- issue navigation labels.

### Status and transient feedback
Examples:

- saved/imported/exported messages;
- error/success messages;
- drag interaction hints;
- status-bar text.

### History
Examples:

- action/history labels;
- undo/redo action descriptions.

### Technical/invariant text that should not be localized
Examples:

- schema values;
- persisted enum values;
- FormIDs;
- EditorIDs;
- JSON field names;
- internal IDs;
- file-format tokens;
- export filename timestamps;
- source-file names;
- diagnostic/developer-only text where localization would be counterproductive.

For each category, identify:

- what is already localized;
- what remains hard-coded;
- what currently uses final strings rather than semantic keys;
- what requires structured parameters/pluralization/list formatting;
- what should remain invariant.

---

## Hard-coded English scan

Perform a repository-wide scan for potential user-facing English strings.

Do not blindly classify every string literal as localizable.

The audit should distinguish:

- user-facing visible text;
- accessibility text;
- debug/developer strings;
- test fixtures;
- source/reference data;
- schema constants;
- CSS class names;
- file paths;
- internal keys;
- historical documentation.

Produce a concrete inventory/count where practical.

The report should identify the highest-risk clusters rather than merely saying “many strings remain.”

---

## Message-catalogue design review

Audit whether the current semantic message catalogue is adequate for full coverage.

Evaluate:

- key naming conventions;
- namespace/grouping structure;
- fallback behavior;
- sparse override behavior;
- interpolation/parameter handling;
- pluralization support;
- select/gender support if needed;
- list formatting;
- number formatting;
- date/time formatting;
- nested rich text or markup needs;
- validator message composition;
- accessible text reuse;
- test ergonomics.

Do not introduce FormatJS or another library merely because it is common.

The existing backlog explicitly leaves FormatJS deferred unless real requirements justify it.

If the current lightweight system is sufficient for Japanese + English, say so.

If not, identify the exact feature gap.

---

## History-label decision

The current backlog leaves open whether history labels should move from final strings to semantic action keys.

Audit:

- how history entries are stored today;
- whether they persist across sessions;
- whether they are session-only;
- whether locale changes should relocalize existing history entries;
- whether history strings are currently user-visible enough to matter for the first Japanese release.

Recommend one of:

- keep final strings for now;
- migrate history labels to semantic action keys + parameters;
- defer until visible history/timeline UI exists.

Do not overengineer history localization without a user-visible need.

---

## Validator localization

Audit every validator.

Determine:

- which validators already emit semantic keys/structured parameters;
- which still emit final English strings;
- which messages embed item/outpost/body names;
- whether message composition currently prevents clean Japanese translation;
- whether issue titles and details should be separate message keys;
- whether dynamic lists should use locale-aware list formatting.

Recommend a consistent validator output shape if current patterns differ.

---

## Reference/master-data localization

Audit which Bethesda-owned names currently appear in runtime reference data.

At minimum examine:

- inorganic resources;
- organic resources;
- manufactured products;
- systems;
- bodies;
- biomes;
- species names if displayed;
- skills/capabilities if displayed;
- any DLC-specific terminology such as X-Tech;
- recipe ingredient/output names via catalogue lookups.

For each population, determine:

1. current canonical identity key;
2. current English fallback name source;
3. whether an existing localization overlay mechanism exists;
4. whether official Bethesda localized strings can be mapped canonically;
5. whether a generated `ja-JP` reference-name overlay should be produced;
6. whether the overlay should be keyed by:
   - stable application ID;
   - FormID;
   - another internal reference key;
7. how provenance should be retained at build time;
8. whether runtime JSON should remain lean.

Prefer stable app/reference IDs at runtime, with canonical extraction/provenance kept build-time where possible.

---

## Bethesda Japanese terminology extraction strategy

Design an extraction approach for official Japanese terms.

The audit should compare at least these options:

### Option A — direct BA2/string parser in project tooling

Build a small project-owned parser/extractor that:

- reads `Starfield - Localization.ba2`;
- extracts relevant language string files;
- decodes Bethesda binary string formats;
- aligns English/Japanese IDs;
- emits only the required project localization rows.

### Option B — adapt/reference code from `bethesda-strings-editor`

Use its BA2 and string-file parsing approach as a technical reference, possibly adapting minimal MIT-licensed logic if justified.

If recommending code reuse:

- identify exact source modules/functions;
- note license requirements;
- avoid pulling in the entire GUI/AI stack.

### Option C — external preprocessing tool

Use a separate one-time or repeatable external extraction step that outputs a project-owned CSV/JSON input.

Assess reproducibility and maintenance cost.

### Option D — another approach

Only if repository/source evidence supports something cleaner.

Recommend one approach, not merely list possibilities.

---

## Translation source ownership

The audit must explicitly separate:

### Bethesda-owned official translations

Examples:

- Vytinium Fuel Rod;
- Aluminum;
- Gastronomic Delight / canonical source equivalent;
- planetary/system/body names;
- biome names;
- other game-native terms.

These should use Bethesda's official Japanese localization wherever available.

### Tracker-authored translations

Examples:

- Planned Supply;
- Present;
- Producing;
- Logistics;
- Add Outpost;
- Reshuffle;
- validation/help messages;
- import/export UI;
- About/settings text;
- accessibility labels.

These require project translation.

Do not replace official Bethesda terminology with AI-generated alternatives where official Japanese exists.

---

## Japanese translation workflow for tracker-authored text

The audit should recommend a practical workflow.

It may include:

- AI-assisted initial translation;
- glossary/terminology constraints;
- human review;
- consistency checks;
- fallback handling;
- tests for missing keys;
- untranslated-string detection.

The implementation does **not** need to adopt the external Bethesda Strings Editor's AI translation pipeline.

We primarily care about official terminology extraction from it.

Recommend a workflow suitable for a relatively small application message catalogue, not a game-scale translation project.

---

## Locale fallback and preference behavior

Audit current locale selection.

Determine:

- how `Automatic` currently resolves;
- whether browser locales like:
  - `ja`
  - `ja-JP`
  - region variants
  resolve correctly;
- fallback order;
- what happens when a locale catalogue is incomplete;
- whether sparse `ja-JP` fallback to `en-US` is acceptable during development but not final release;
- how locale preferences are persisted;
- whether locale changes update all visible reference names immediately.

Recommend the release requirement for Japanese completeness.

Preferred end state:

> `ja-JP` should not silently fall back to English for ordinary user-facing UI except for deliberately invariant technical terms or explicitly documented untranslated edge cases.

---

## Locale-aware formatting

Audit all current user-facing formatting for:

- numbers;
- dates;
- times;
- percentages;
- lists;
- counts;
- ordinals;
- ranges.

Do not localize:

- persisted/schema formats;
- FormIDs;
- EditorIDs;
- canonical source timestamps;
- export filename timestamps unless a separate product decision changes them.

Determine whether current application content actually needs locale-sensitive formatting now.

If the need is limited, recommend a minimal formatter abstraction rather than speculative infrastructure.

---

## Search behavior under Japanese

Audit Search for Items and any other text search/filter behavior.

Determine:

- whether matching assumes Latin case folding;
- how Japanese text is normalized;
- whether English abbreviations such as `VFR`, `SMS`, `He-3` remain searchable in Japanese locale;
- whether canonical English names should remain searchable as aliases in Japanese;
- whether official Japanese names should be primary display/search text;
- whether punctuation/width variants need normalization;
- whether diacritic handling matters elsewhere.

Recommend explicit Japanese search semantics.

Do not remove useful abbreviation search merely because display names are localized.

---

## Sorting and collation

Audit all user-visible sorts that depend on names.

Determine whether current code uses:

- `localeCompare`;
- fixed English ordering;
- stable source ordering;
- explicit domain ordering.

Recommend whether Japanese locale should use:

- `Intl.Collator`;
- stable English/canonical order;
- tracker-defined order;
- another deliberate strategy.

Be especially careful where spatial stability matters, such as the resource matrix.

Do not let locale-sensitive sorting accidentally destroy established structural alignment or family ordering.

---

## Layout and density audit for Japanese

Identify UI areas most likely to fail when Japanese is introduced.

At minimum inspect:

- top-level navigation;
- Outposts navigation pane;
- network controls;
- Outpost Details;
- Resource Matrix headers/state buttons;
- manufacturing rows;
- Planned Supply;
- Cargo Pads;
- Search for Items;
- Search Results palette;
- validation pop-out;
- import/export dialogs;
- About/preferences/settings;
- status bar;
- tooltips;
- modal buttons;
- compact icon-only controls.

Classify risks:

```text
LOW
MEDIUM
HIGH
```

for:

- clipping;
- wrapping;
- minimum-width assumptions;
- fixed button widths;
- monospace assumptions;
- vertical rhythm;
- tooltip overflow.

Do not implement layout changes in this audit.

---

## Accessibility interaction

Because accessibility work will follow localization, identify localization decisions that materially affect the later accessibility audit.

At minimum cover:

- localized accessible names/descriptions;
- screen-reader language metadata;
- `lang` attribute updates;
- dialog descriptions;
- form/validation announcements;
- icon-only control naming;
- keyboard help text;
- Japanese punctuation/readability.

Recommend what must be completed in localization **before** the accessibility audit begins.

---

## HTML/document language

Audit whether the application currently updates document language metadata.

Determine whether switching locale should update:

```html
<html lang="...">
```

and any relevant React/document state.

For Japanese, expected language metadata is likely:

```text
ja-JP
```

unless the current architecture deliberately normalizes to another valid value.

---

## Reference localization output format

Recommend the project-owned output/input structure for Japanese Bethesda terms.

Possible shapes include:

```json
{
  "resource": {
    "vytinium": "..."
  },
  "product": {
    "vytinium-fuel-rod": "..."
  }
}
```

or equivalent semantic grouping.

The audit should decide:

- whether locale files should contain reference names directly;
- whether generated reference-name overlays should be separate artifacts;
- whether they should be generated from canonical Bethesda string extraction;
- how missing official terms are diagnosed;
- how the English fallback is retained.

Prefer a structure that preserves existing sparse reference-name overlay architecture if practical.

---

## Copyright / repository-size consideration

Do not recommend checking the entire Bethesda localization corpus into the repository.

The project should retain only the minimum derived localized data required for the application, if legally and practically appropriate.

The audit should distinguish:

- project-owned tracker translations;
- derived official terminology required for the app;
- full Bethesda string archives, which should remain external build inputs.

Do not copy or embed large unrelated portions of Bethesda localization data.

---

## Tests

Recommend implementation tests covering at least:

### Catalogue completeness
- every `en-US` semantic key is present;
- every required `ja-JP` key is present before release;
- no accidental hard-coded English remains in selected critical UI paths.

### Fallback
- `en-GB` sparse fallback remains correct;
- `ja-JP` fallback behavior is explicit;
- Automatic locale resolves Japanese browser preferences correctly.

### Reference names
- known Bethesda official Japanese terms resolve through the chosen crosswalk;
- English reference fallback remains valid;
- FormID/string-ID mapping is deterministic;
- plugin/extension/string-ID identity does not cross-contaminate string-file spaces.

### Stable identity
- localized display names do not change `ResourceId`, `ProductId`, body IDs, system IDs, or persisted values.

### Validation/messages
- structured parameters interpolate correctly in Japanese;
- no English sentence-fragment composition assumptions.

### Search
- Japanese display names searchable;
- abbreviations remain searchable;
- English aliases behavior matches the approved design.

### Formatting
- locale-aware number/list formatting where introduced;
- invariant technical/persisted formats remain unchanged.

### Document language
- locale switch updates `lang`.

### Missing translation detection
- release verification fails on missing required Japanese tracker messages;
- missing official Bethesda reference terms are surfaced clearly.

---

## Audit report requirements

Write:

`docs/audits/codex-localization-coverage-and-japanese-audit.md`

Use this structure:

1. **Executive summary**
2. **Current localization architecture**
3. **Current localization coverage inventory**
4. **Hard-coded user-facing English inventory**
5. **Message catalogue adequacy**
6. **Validator/status/help/accessibility string analysis**
7. **History-label decision**
8. **Bethesda localization file-format findings**
9. **FormID -> localized string ID feasibility**
10. **Official Japanese terminology extraction strategy**
11. **Reference/master-data localization coverage**
12. **Recommended Japanese reference-name data model**
13. **Tracker-authored Japanese translation workflow**
14. **Locale selection/fallback behavior**
15. **Font and glyph findings**
16. **Search/collation/sorting findings**
17. **Layout/density risk assessment**
18. **Accessibility dependencies**
19. **Locale-aware formatting**
20. **Testing strategy**
21. **Documentation changes**
22. **Recommended implementation parcels**
23. **Risks / unresolved questions**
24. **Exact proposed file/module changes**

---

## Required implementation-plan outcome

The audit must conclude with a recommended implementation sequence.

Do not assume the full localization effort must be one giant commit.

Prefer coherent parcels such as:

```text
A. Complete semantic string migration
B. Add Japanese tracker catalogue
C. Build Bethesda official-term extraction/crosswalk
D. Generate Japanese reference-name overlays
E. Japanese font/layout/search hardening
F. Release verification and missing-translation gates
```

but change the boundaries if repository evidence supports a better structure.

Identify dependencies between parcels.

The report should make clear what must happen **before** the later accessibility audit.

---

## Audit quality bar

Do not stop at “many strings need localization.”

The report must answer concretely:

- how much of the UI is already localized;
- where hard-coded English remains;
- whether the current catalogue architecture is sufficient;
- whether validators/history need structural changes;
- how official Bethesda Japanese names can be extracted;
- whether FormID -> localized string ID can be made canonical;
- what new canonical fields/extracts are required;
- what Japanese font/fallback strategy is needed;
- what search/sort/layout behavior must change;
- what data should be committed to the repository;
- what remains an external Bethesda build input;
- what tests make Japanese support release-grade;
- what exact implementation parcels should follow.

Where source evidence is insufficient, say so explicitly rather than filling gaps with assumptions.

Do not implement the localization work until a separate implementation brief is approved.
