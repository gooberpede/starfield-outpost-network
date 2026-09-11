# Full localization coverage and Japanese audit

## 1. Executive summary

Japanese (`ja-JP`) is feasible as the first non-English locale. There is no
architectural blocker in React, TypeScript, browser storage, stable reference
identity, or the Bethesda string data. The current implementation is a sound
localization foundation, but it is still only a vertical slice:

- `en-US` contains 40 semantic messages; `en-GB` is a completely sparse
  override and therefore resolves all 40 through `en-US`;
- only two of 25 validator rules expose semantic message keys;
- the repository has 38 `aria-label` sites, of which six call `t(...)`
  directly, and 56 `title` sites, of which three call `t(...)` directly
  (localized tooltip helpers cover some additional matrix titles);
- 22 App-level edit paths plus four collection-lifecycle paths create final
  English history labels;
- resource/product search and parts of the Resource Matrix use localized
  reference names, but most other reference-name consumers still read `.name`
  directly;
- `<html lang>` is fixed at `en`, and `ja`/`ja-JP` browser preferences currently
  fall back to `en-US`.

The existing typed catalogue, sparse fallback, provider, preference storage,
`Intl.PluralRules`, `Intl.ListFormat`, and stable-ID reference overlay are
adequate for English plus Japanese. A third-party localization runtime is not
justified. The implementation needs broader message coverage, consistent
structured validator output, semantic history descriptors, a complete Japanese
catalogue, document-language updates, and a release completeness gate.

Official Bethesda terminology should be generated, not hand-translated. The
recommended approach is a small project-owned, read-only Node build utility
that parses the required BA2 `GNRL` entries and Bethesda string tables and joins
them to new raw string-ID columns in the canonical xEdit extracts. The runtime
overlay should remain keyed by existing application/reference IDs; build-time
provenance should retain `(source plugin, string-table extension, string ID)`.
The full Bethesda corpus and BA2 files must remain external inputs.

The supplied `Starfield - Localization.ba2` was inspected read-only. It is a
114,281,094-byte BA2 v2 `GNRL` archive containing nine language triplets (27
files), including `starfield_en.*` and `starfield_ja.*`. Every English ID has a
Japanese counterpart in the same extension: 8,412 `.dlstrings`, 130,276
`.ilstrings`, and 48,875 `.strings`. Japanese has one, zero, and 88 additional
IDs respectively. This proves the base-game alignment route. DLC/plugin
localizations live in their own archives (for example, `SFBGS00D - Main.ba2`
and `ShatteredSpace - Main02.ba2`) and must be scanned too.

The primary delivery risk is canonical name provenance, not Japanese support.
Current extracts contain resolved English text but no raw localized string IDs.
Most ordinary FULL-name records can acquire those IDs through xEdit native
values. Composed fauna names and star-system names require dedicated extraction
spikes because their current English display names are derived rather than
simple FormID-to-FULL values.

## 2. Current localization architecture

The current boundary is appropriately separated from gameplay state:

- `src/localization/types.ts` defines the closed locale and message-key sets;
- `registry.ts` is the single locale registration point;
- `en-US.ts` is the complete baseline; `en-GB.ts` is a sparse override;
- `catalog.ts` resolves exact locale then `en-US`, performs named interpolation,
  and supports a deliberately small `one`/`other` plural expression;
- `formatters.ts` wraps `Intl.ListFormat`;
- `LocalizationProvider.tsx` exposes effective locale and `t()`;
- `preferences.ts` stores `{ localeOverride }` under a separate localStorage
  key, outside collection JSON and Undo/Redo;
- `referenceNames.ts` resolves `(kind, stable ID, canonical fallback, locale)`;
- localized `New Outpost` text is supplied at creation and then becomes ordinary
  persisted user data, as required by `docs/DOMAIN-RULES.md`.

This foundation should be extended, not replaced. Locale changes already
re-render context consumers and do not enter gameplay history. The important
current limitations are coverage, a closed locale union containing only two
English locales, lack of document metadata updates, and direct reference-name
access outside the migrated slice.

## 3. Current localization coverage inventory

The 40 baseline keys cover the following translation units:

| Area | Keys | Current practical coverage |
|---|---:|---|
| Locale selector | 2 | Label and Automatic option |
| Delete-network flow | 4 | Multi-network delete button/dialog only; sole-network reset branch is English |
| Generated outpost name | 1 | Creation-time base name |
| Validation | 3 | Issue count and two of 25 rules |
| Help | 2 | Inorganic recorded/potential presence |
| Matrix actions/tooltips | 11 | X-Tech, producing, inputs, import/export tooltip slice |
| Search for Items | 17 | Input, autocomplete category, results, flags, drag instructions |

Already localized paths are therefore concentrated in Search for Items, matrix
state tooltips, locale selection, one destructive dialog branch, two validator
messages, and generated outpost naming. It is not meaningful to claim a whole-
application percentage from these 40 keys because one key can serve several
render sites while a single hard-coded helper can emit many variants. The
structural counts above are the reliable baseline.

### Category inventory

| Category | Localized now | Still hard-coded / final-string based | Required treatment |
|---|---|---|---|
| Visible UI | Search slice; delete-network slice; a few matrix actions | Shell, navigation, character/outpost details, cargo, Planned Supply, most matrix headings/actions, dialogs, import/export, validation panel | Whole semantic messages, not translated fragments |
| Accessible text | Search controls, locale selector, X-Tech add action | Most navigation, reorder, close/dismiss, cargo, matrix state and dialog names | Reuse action keys where wording can be shared; separate keys only when accessible wording differs |
| Help/context | Two inorganic messages and several matrix tooltips | Organic-source help, power/efficiency explanations, contextual-help map, drag hints | Parameterized help keys and locale-aware lists/numbers |
| Validation | Issue count, manufacturing input, Planned Supply | 23 rule files, rule metadata, contexts, remediations, severity/filter UI | Stable message key plus structured facts; resolve names in presentation |
| Status/transient | None | Reference load, export/import success/failure, dismiss action, interaction hints | Structured expected errors; localized generic unexpected error with diagnostic detail kept separately |
| History | None | All history entries store final English labels | Semantic action descriptor plus captured parameters |
| Invariant technical text | Intentionally not localized | IDs, schema values, storage keys, JSON names, FormIDs, EditorIDs, filenames/extensions, keyboard key tokens | Keep invariant |

Product name/brand text `Starfield Outpost Network` may remain a proper product
name. Attribution text must remain accurate; surrounding prose and link-accessible
wording can be translated without translating legal names.

## 4. Hard-coded user-facing English inventory

A repository-wide scan of `src/`, validators, data errors, tests, and reference
sources found these highest-risk clusters:

| Cluster | Concrete signal | Examples |
|---|---:|---|
| `src/App.tsx` | 22 edit-history producers, four lifecycle labels, five status-message setters | Undo/Redo labels, network/outpost controls, import/export feedback, confirmations |
| Validation rules | 25 rules, 41 `message:` emission sites; only two rules also set `messageKey` | Unknown IDs, skill limits, body/biome, cargo links, organic production |
| Accessibility attributes | 38 `aria-label` sites; six direct `t()` calls | show/hide navigation, drag/move, close/dismiss, cargo destinations |
| Tooltip attributes | 56 `title` sites; three direct `t()` calls, plus localized helper calls in the matrix | reorder, import/export, power, collapse/expand, item state |
| Cargo editing | `CargoPadsEditor`, `CargoPadEditor`, `CargoExportsEditor` | Exports, Unlinked, destination labels, pad movement and summaries |
| Planned Supply | `PlannedSupplyEditor` | headings, empty state, add/remove actions and help |
| Matrix/manufacturing | `OutpostStatusMatrix` | headings, column names, source/state words, save/cancel/edit, empty states |
| Navigation/details | `OutpostList`, `WorkspaceLayout`, `OutpostDetails`, `CharacterHeader` | Outposts, System, Body, Solar, Wind, skill names, reshuffle controls |
| Dialog/status/import | `AboutDialog`, `ConfirmDialog`, `StatusBar`, import/export buttons | close/cancel, attribution prose, read/import errors, feedback |
| Presentation helpers | `validationPresentation`, `statusTooltips`, `powerEfficiencyPresentation`, `contextHelpText` | English list joins, severity/state labels, percentages, remediation |

The scan deliberately excludes CSS classes, internal union values, paths,
source/reference text, test fixture data, developer exceptions, and schema
constants. Tests that assert English output must be parameterized or retained as
`en-US` characterization tests; their literals are not production translation
units.

## 5. Message catalogue adequacy

The semantic naming style is good (`feature.concept.variant`), the complete
typed baseline catches missing English entries at compile time, and sparse
fallback is appropriate for `en-GB`. Keep moderate namespaces such as
`common`, `network`, `outpost`, `cargo`, `matrix`, `plannedSupply`, `validation`,
`status`, `history`, `help`, and `accessibility`.

For Japanese plus English, the lightweight system is sufficient if the next
implementation adds:

1. a way to mark release locales as complete (make `ja-JP` satisfy
   `MessageCatalogue`, not `LocaleOverrides`);
2. explicit parameter contracts or runtime/test validation for required and
   unexpected parameters;
3. `formatNumber`, `formatPercent`, and collator helpers alongside `formatList`;
4. whole-message keys for conditional variants instead of English fragments;
5. development diagnostics and a CI/release check for missing translations.

Japanese has no grammatical singular/plural inflection requirement that forces
FormatJS. The existing plural parser is limited—it cannot handle offsets,
nested selects, `#`, gender/select, or rich markup—but no current product copy
requires those features. Use separate semantic variant keys for current select
cases. Adopt a mature ICU library only if real future catalogue content needs
nested plural/select or translator-controlled rich text.

## 6. Validator/status/help/accessibility string analysis

`ValidationIssue` currently requires a final `message: string` and optionally
permits one of two `messageKey` values. Domain rules frequently interpolate
English reference names before presentation. `validationPresentation.ts` then
adds English context (`Pad {n}`), English remediation, manual English lists, and
localized output for only the two migrated rules.

Recommended target shape:

```ts
interface ValidationIssue {
  ruleId: string
  category: ValidationCategory
  severity: ValidationSeverity
  messageKey: ValidationMessageKey
  parameters: ValidationParameters
  // Existing stable outpost/item/pad/body/species IDs remain.
}
```

Prefer discriminated parameter types per key rather than a bag of arbitrary
strings. Carry resource/product/species/body/biome IDs as facts and resolve
their localized names in presentation. Separate issue message and remediation
keys. Rule `name` and `description` need semantic keys only if the rule registry
is exposed; stable rule IDs, categories, and severities remain invariant.
Unknown-ID diagnostics should keep raw IDs visible as technical parameters.

Status failures should not concatenate arbitrary `Error.message` into Japanese
prose. Map expected deserialization/import failures to stable error codes and
parameters. Show a localized generic unexpected-error message while preserving
raw detail for diagnostics. Contextual help and tooltip helpers must stop
assembling `biome/biomes`, comma lists, percentage signs, and state fragments
in English.

Accessible names must be catalogued in the same parcel as their visible action.
Japanese punctuation and sentence-level phrasing should be authored as complete
messages; do not concatenate localized verbs with object names. Dialog titles,
descriptions, buttons, and close controls must all switch together.

## 7. History-label decision

Migrate history labels to semantic action keys plus parameters in the first
Japanese coverage parcel. Although history is session-only and there is no
timeline, the most recent Undo/Redo labels are user-visible in button titles.
Keeping final strings would leave ordinary Japanese UI with English tooltips
and prevent existing entries from updating after an in-session locale change.

The history snapshot architecture need not change. Replace `label: string` with
a session-only action descriptor, for example:

```ts
{ key: 'history.cargo.link', params: { localOutpostName, localPadOrdinal,
  remoteOutpostName, remotePadOrdinal } }
```

Capture user-authored names at action time so later renames do not rewrite the
meaning of old actions. For Bethesda references, retain stable kind/ID plus an
English/raw-ID fallback so presentation can relocalize safely. The four reducer-
owned lifecycle labels should use the same descriptor path. No migration of
portable JSON is needed because history is not persisted.

## 8. Bethesda localization file-format findings

Read-only inspection found:

| Property | Finding |
|---|---|
| Archive | BA2 magic `BTDX`, version 2, type `GNRL`, 27 entries |
| Base languages | `de`, `en`, `es`, `fr`, `it`, `ja`, `pl`, `ptbr`, `zhhans` |
| `.strings` | 8-byte header; `(uint32 ID, uint32 offset)` directory; NUL-terminated UTF-8 data |
| `.dlstrings` / `.ilstrings` | Same directory; each value has a 32-bit byte length and terminating NUL |
| Base EN/JA overlap | 8,412/8,412 DL, 130,276/130,276 IL, 48,875/48,875 STRINGS English IDs aligned |

Sample same-extension joins observed directly:

| English | String ID(s) | Official Japanese |
|---|---|---|
| Aluminum | `0x000040DC`, `0x00008155`, `0x0000E209` | アルミニウム |
| Vytinium Fuel Rod | `0x0000811D`, `0x00008F0F` | ヴァイティニウム燃料棒 |
| Adaptive Frame | `0x000080C7`, `0x00008EFB` | 順応型フレーム |
| Alpha Centauri | `0x0000A9D0`, `0x0000C7E5` | アルファ・ケンタウリ |

These duplicate English terms reinforce why an English-text join is ambiguous.
The identity must be `(plugin base, extension, string ID)`. Numeric IDs must
never be joined across `.strings`, `.dlstrings`, and `.ilstrings`.

The referenced [Bethesda Strings Editor](https://github.com/0xra0/bethesda-strings-editor)
implements the correct model in
[`official_tm_miner.py`](https://github.com/0xra0/bethesda-strings-editor/blob/main/bethesda_strings/official_tm_miner.py):
`scan_language` indexes by `(base, extension)`, `_decode` uses
`BethesdaStringFile`, and `align_indexes` joins IDs only within that key. Its
[`core.py`](https://github.com/0xra0/bethesda-strings-editor/blob/main/bethesda_strings/core.py)
documents the null-terminated versus length-prefixed formats. The project is
[MIT licensed](https://github.com/0xra0/bethesda-strings-editor/blob/main/LICENSE);
copied substantial code would require retaining its copyright and license
notice. Technical reimplementation from the format is preferable at this small
scope.

## 9. FormID -> localized string ID feasibility

The chain is available for ordinary localized record fields, but current
project extracts stop one step too late:

```text
(source plugin, record FormID, field path)
  -> raw localized string ID + table extension
  -> English/Japanese Bethesda table row
  -> stable application/reference ID
```

Current xEdit scripts use `GetElementEditValues`/`GetEditValue`, which resolves
localized IDs to English display text. xEdit also exposes `GetNativeValue` and
`GetElementNativeValues`; the implementation parcel should prove and then use
the native value of the exact name element to export the raw ID. Never infer
the ID by reverse-searching English text.

Add plugin qualification even when current base IDs appear unique. A load-order
FormID alone and a string ID alone are insufficient across `Starfield.esm`,
`SFBGS00D.esm`, and `ShatteredSpace.esm`.

### Required canonical additions

| Source | Additions | Notes |
|---|---|---|
| `inorganic-resource-dictionary.csv` | `ResourceNameStringID`, `ResourceNameStringTable` | Name field is ordinary FULL; retain `SourceFile` |
| `industrial-workbench.csv` | `ProductNameStringID`, `ProductNameStringTable`, `IngredientNameStringID`, `IngredientNameStringTable` | Recipe rows repeat items; validate consistent IDs per FormID |
| `planet-directory.csv` | `PlanetNameFieldPath`, `PlanetNameStringID`, `PlanetNameStringTable`; investigate `SystemNameStringID` | Body ANAM/component FULL paths must be distinguished; system ID is numeric galaxy data, not a FormID |
| `biome-inorganic-resources.csv` | `BiomeNameStringID`, `BiomeNameStringTable` | Resource names should join through the resource dictionary |
| `biome-organic-resources.csv` | `SpeciesDisplayNameSourceKind`, `SpeciesDisplayNameStringID`, `SpeciesDisplayNameStringTable` and, for composed names, component IDs/order | Explicit flora/fauna FULL is simple; templated/encounter-derived fauna is not |

Use uppercase eight-digit hex for string IDs in CSV for reviewability, while
parsing to unsigned integers in tooling. The table value should be one of
`strings`, `dlstrings`, or `ilstrings` even if all currently audited FULL fields
resolve to `strings`.

Unresolved areas requiring a bounded extraction spike are:

- system names, because the current script parses text such as `55539 (Katydid)`
  from galaxy data rather than following a name-bearing record;
- derived fauna names, because some are assembled from object-template
  prefix/suffix rules or encounter-template FULL fields;
- directly stored/translatable component text, if any inspected field returns
  text rather than a localized ID;
- DLC light/master FormID normalization and winning-override ownership.

The spike must fail rows explicitly; it must not fall back to English-name
matching as a silent production path.

## 10. Official Japanese terminology extraction strategy

Recommend Option A, informed by Option B: add a project-owned, read-only Node
extractor under `scripts/`.

It should:

1. accept the Starfield Data directory or explicit BA2 paths as command-line
   inputs, never hard-code one installation;
2. read BA2 v2/v3 `GNRL` file tables, supporting stored and zlib-compressed
   entries, and reject unsupported archive types;
3. select only required `<plugin>_en/ja.(strings|dlstrings|ilstrings)` entries;
4. decode directories and strings with strict bounds checks and UTF-8 error
   reporting;
5. index by `(normalized plugin base, extension, uint32 ID)`;
6. join only canonical rows carrying the exact same qualified identity;
7. emit a small deterministic overlay plus a build report of missing,
   duplicate, conflicting, and unused rows;
8. record tool version, source archive filename/size/hash, source plugin,
   extension, string ID, and extraction timestamp in a build-only manifest.

This matches the existing Node reference-build workflow, needs no runtime or
GUI dependency, and avoids importing Bethesda Strings Editor's PySide/AI stack.
Minimal logic can be independently implemented from the format. If source is
copied from `ba2_handler.py`, `core.py`, or `official_tm_miner.py`, preserve the
MIT notice and document the adapted functions.

Option C (BSArch/xEdit preprocessing) is useful for a one-off diagnostic but is
not the preferred production path: it depends on separately installed Windows
tools and makes CI/reproduction harder. The generic official terminology miner
is also broader than needed and its majority-by-English-text output loses the
record-level provenance the tracker can preserve.

## 11. Reference/master-data localization coverage

| Population | Count | Runtime ID | Current name source | Canonical Japanese route |
|---|---:|---|---|---|
| Resources | 76 | stable app slug | resource dictionary/item metadata | FormID -> resource FULL string ID; X-Tech/bespoke rows need ownership decision |
| Products | 30 | stable app slug | Industrial Workbench + tracker metadata | product FormID -> FULL string ID |
| Systems | 123 | numeric `StarSystemID` | parsed galaxy-data display text | Requires system-name ID extraction spike |
| Bodies | 1,776 | body FormID string | body ANAM/component FULL | field-specific raw ID plus source plugin |
| Biomes | 428 | biome FormID string | biome occurrence extract | biome FULL ID; preserve body-biome structural ordering |
| Species | 1,121 | species FormID string | explicit or derived display name | explicit FULL direct; composed fauna requires provenance/components |
| Body-biomes | 3,211 | body FormID + biome index | relational only | No translated field; display via biome ID |
| Recipes | 30 | product/item IDs | relational quantities | Display ingredient/output through localized catalogues |

Skills/capabilities currently surfaced (`Outpost Management`, `Planetary
Habitation`, X-Tech capability) are Bethesda-owned terms and should use official
Japanese where an exact official record/string is identified. If the tracker
has coined or shortened a concept, treat that label as tracker-authored and
document the relationship in the translator glossary. Rarity, body type,
source-class and state labels are tracker UI vocabulary even when inspired by
game concepts; localize them through the message catalogue.

Current overlay coverage is one stable resource ID (`aluminium`) with an
`en-US`/`en-GB` spelling difference. Only some resource/product paths use the
resolver. Systems, bodies, biomes, species, cargo editors, several validators,
manufacturing selectors, and organic-source helpers still consume canonical
English names directly.

## 12. Recommended Japanese reference-name data model

Keep tracker messages and generated Bethesda names separate:

```json
{
  "resource": { "aluminium": "アルミニウム" },
  "product": { "vytinium-fuel-rod": "ヴァイティニウム燃料棒" },
  "system": { "55539": "…" },
  "body": { "00000000": "…" },
  "biome": { "00000000": "…" },
  "species": { "00000000": "…" }
}
```

Use a generated `src/localization/reference-names/ja-JP.json` (or equivalent
generated module) keyed by the existing runtime stable IDs. Keep the English
canonical name in current runtime reference JSON as fallback/search alias. Do
not add localized fields to every canonical record and do not generate copies
of relational datasets per locale.

Commit only the required derived Japanese names and a compact provenance
manifest/crosswalk suitable for verification. Do not commit BA2 files, complete
string tables, or unrelated translations. Generation must report missing
official terms; the Japanese release gate should fail for required displayed
populations unless each absence is explicitly classified as tracker-authored,
invariant, or an approved unsupported edge case.

## 13. Tracker-authored Japanese translation workflow

1. Complete the English semantic migration first so translators receive stable,
   whole messages with descriptions and parameter examples.
2. Maintain a small glossary separating official Bethesda terms from tracker
   concepts and specifying tone, capitalization, punctuation, `Planned Supply`,
   state labels, and protected tokens such as `He-3`, FormIDs, and shortcuts.
3. Use AI assistance only for an initial tracker-copy draft; prohibit it from
   replacing terms present in the generated official overlay.
4. Have a fluent Japanese reviewer inspect the catalogue in context, especially
   destructive actions, validation, compact labels, and screen-reader text.
5. Run placeholder/key parity, invariant-token, duplicate-translation, and
   residual-English checks.
6. Perform a full UI pass at supported viewport/zoom settings and resolve
   translation or layout issues deliberately; do not shorten away meaning just
   to fit.

For this application size, a reviewed TypeScript catalogue plus glossary is
sufficient. A translation-management platform is unnecessary unless contributor
volume grows.

## 14. Locale selection/fallback behavior

Current Automatic resolution recognizes `en-US` and maps bare/other English to
`en-GB`; all other languages, including `ja` and `ja-JP`, fall back to `en-US`.
An explicit `ja-JP` preference is currently rejected as unsupported and reset to
Automatic. Preference storage is otherwise correctly separate and immediate.

Add `ja-JP` to the supported union/registry. Resolve case-insensitively:

1. explicit supported override;
2. exact `ja-JP` and any `ja-*` or bare `ja` -> `ja-JP`;
3. existing English rules;
4. `en-US` default.

Sparse Japanese fallback is acceptable while developing behind a non-release
flag, but release verification must require every ordinary tracker message and
required Bethesda reference name. Runtime fallback order remains selected
locale -> `en-US` -> canonical name -> stable ID, but production telemetry/test
gates must make unexpected English fallback visible before release.

All direct reference consumers must use the active locale resolver so locale
changes update names immediately. Persisted outpost names and cargo-pad labels
must not be renamed.

## 15. Font and glyph findings

The CSS imports Barlow Semi Condensed and IBM Plex Mono from Google Fonts.
Google Fonts metadata lists only Latin/Latin Extended/Vietnamese for
[Barlow Semi Condensed](https://github.com/google/fonts/blob/main/ofl/barlowsemicondensed/METADATA.pb)
and Cyrillic/Latin/Vietnamese for
[IBM Plex Mono](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/METADATA.pb);
neither supplies Japanese glyphs. The browser therefore performs per-glyph
system fallback. On this Windows installation, Yu Gothic and MS Gothic are
available, but the chosen fallback and metrics remain browser/OS dependent and
may mix faces within one control.

Minimum reliable strategy:

- add an explicit Japanese-capable proportional fallback for `:lang(ja)` and
  the `--ui-font`/heading stacks, preferring `Noto Sans JP`, then `Yu Gothic UI`,
  `Yu Gothic`, `Meiryo`, and `sans-serif`;
- use a Japanese-capable mono fallback only where Japanese genuinely appears;
  invariant abbreviations/IDs can remain IBM Plex Mono. `Noto Sans Mono CJK JP`
  or an OS Japanese mono face should follow IBM Plex Mono in the mono stack;
- for deterministic cross-platform release rendering, self-host the required
  Noto Sans JP weights/subsets or load them through the existing font provider
  with an offline/system fallback. [Noto Sans JP](https://github.com/google/fonts/blob/main/ofl/notosansjp/METADATA.pb)
  is OFL-licensed and explicitly covers Japanese;
- record OFL notices if font files are redistributed and measure layouts after
  the actual font delivery choice.

Japanese glyphs are typically full-width and lose Barlow's condensed advantage.
This is a layout risk even when Japanese strings are shorter in character count.

## 16. Search/collation/sorting findings

Search already uses `trim()`, NFC normalization, locale lower-casing, and
`Intl.Collator(locale, { sensitivity: 'base', numeric: true })`. This supports
ordinary Japanese text, and canonical abbreviations such as `VFR`, `SMS`, and
`He-3` remain searchable because `shortName` is indexed independently.

For Japanese:

- display and prioritize the official Japanese name;
- retain canonical English names as lower-priority aliases so users can search
  game/wiki terminology and mixed-language queries;
- retain abbreviations and stable technical tokens;
- normalize query and aliases with NFKC for full-/half-width compatibility,
  then locale-aware case folding; preserve original display text;
- do not add fuzzy kana/romaji transliteration without a separate product
  decision;
- define ranking as Japanese display exact/prefix/substring, abbreviation,
  then English alias equivalents, with category and stable ID tie-breakers.

Sorting is inconsistent elsewhere: some code uses active-locale comparison,
some default `localeCompare`, some raw English names, and domain helpers preserve
explicit numeric/source order. Centralize `Intl.Collator(locale)` for lists that
are explicitly alphabetical. Preserve structural orders: inorganic family and
`sortOrder`, body-biome index, tracker-defined section order, recipe order where
meaningful, and the mandated last position of X-Tech. Locale-sensitive sorting
must not move cells in fixed resource-family grids or destroy matrix alignment.

## 17. Layout/density risk assessment

| Area | Risk | Reason / check |
|---|---|---|
| Title bar / locale selector | MEDIUM | compact flex layout; Japanese locale label and About coexist |
| Page/network controls | MEDIUM | no-wrap action clusters; icon actions are safe after accessible labels are translated |
| Outposts navigation | MEDIUM | 17.5rem minimum pane, ellipsized names, fixed reshuffle controls |
| Character / Outpost Details | MEDIUM | fixed 4–4.25rem numeric/efficiency cells and 10–13rem label/select column |
| Resource Matrix headings/state buttons | HIGH | dense fixed grid, 2.8rem/abbreviation-first cells, condensed/mono assumptions |
| Manufacturing rows | HIGH | inline save/cancel/edit/add controls and localized product sorting/names |
| Planned Supply | HIGH | 3.15–3.35rem fixed abbreviation cells, max-content grids, dense section headings |
| Cargo Pads expanded editor | HIGH | multi-column summaries, fixed icon columns, clipped/ellipsized destination text |
| Cargo Pads collapsed summary | MEDIUM | abbreviations mostly invariant; destination and state prose can clip |
| Search input/autocomplete | MEDIUM | responsive wrapper exists; category disambiguators and wider glyph metrics need checks |
| Search Results palette | MEDIUM | draggable constrained palette, flags can wrap/overflow |
| Validation pop-out | HIGH | long diagnostics/remediation and contextual names; fixed panel geometry |
| Import/export and confirmation dialogs | MEDIUM | 25rem dialog width; long descriptions wrap but button rows need inspection |
| About/preferences | LOW–MEDIUM | simple 25rem wrapping dialog; locale selector options must remain self-identifying |
| Status bar | HIGH | grid with no-wrap regions and transient filenames/errors |
| Tooltips/context help | MEDIUM | 18rem max width; Japanese line breaking and punctuation require review |
| Icon-only controls | LOW visually / HIGH a11y | geometry stable, but full Japanese accessible names are mandatory |

Test at minimum desktop, the established ~1024px breakpoint, 200% zoom, long
user names, longest Japanese official names, and Windows/macOS font stacks.

## 18. Accessibility dependencies

Before the later accessibility audit begins, localization implementation must:

- migrate every accessible name, description, dialog label/description,
  validation announcement, drag/reorder instruction, and keyboard-help string;
- update `document.documentElement.lang` to the effective BCP 47 locale
  (`ja-JP`, `en-US`, or `en-GB`) on initial resolution and every switch;
- ensure live regions announce complete localized sentences rather than
  fragments mixed with English errors;
- keep visible and accessible state terminology consistent;
- verify Japanese punctuation and pauses in screen readers;
- expose full names where compact abbreviations remain visible;
- retain semantic controls, focus management, and keyboard tokens.

`index.html` currently has `<html lang="en">`; it never changes. The provider
is the correct owner for an effect updating the document element. The static
`en` value remains a reasonable pre-hydration fallback but must be replaced by
the effective locale at runtime.

## 19. Locale-aware formatting

Current user-facing formatting includes manual issue/count plurals, network and
pad ordinals, manual English lists, rounded percentages, `toFixed(2)`
multipliers, and labels such as `Network {n}: ...`. There is no user-visible
date/time display. History timestamps are not rendered.

Add only the small abstractions currently needed:

- `formatList` (already present);
- `formatInteger`/`formatDecimal` using `Intl.NumberFormat`;
- `formatPercent` where a numeric ratio exists;
- `getCollator` or `compareDisplayNames`;
- whole catalogue messages around formatted values.

Do not localize schema/persisted numbers, FormIDs, EditorIDs, JSON, canonical
source timestamps, file extensions, or the export filename timestamp. The
existing `YYYY-MM-DD-HHMMSS` export filename is an invariant portability
convention. Ordinal wording should be message-owned; simple compact `1 / 3`
navigation may remain numeric if its accessible label gives localized context.

## 20. Testing strategy

Add focused tests for:

- `en-US` baseline key completeness and `en-GB` sparse fallback;
- complete `ja-JP` key parity, placeholder parity, and release-mode no-fallback;
- Automatic resolution for `ja`, `ja-JP`, case variants, region variants, and
  mixed browser preference lists;
- preference persistence without collection/history mutation;
- document `lang` updates after initial resolution and switching;
- validator descriptor rendering, Japanese parameter order, localized lists,
  unknown raw IDs, and absence of English fragment composition;
- history descriptor rendering and relocalization of existing session entries;
- stable reference identity under Japanese display overlays;
- golden official terms and deterministic FormID -> plugin/extension/string-ID
  crosswalks;
- explicit rejection of cross-extension and cross-plugin numeric-ID joins;
- generated overlay determinism, duplicate/conflict reporting, and missing-term
  release failure;
- Japanese display-name, English alias, abbreviation, `He-3`, and full-/half-
  width search;
- collation only in approved alphabetical lists and preservation of structural
  family/biome/X-Tech order;
- locale-aware number/list formatting and invariant export/schema formats;
- a maintained critical-path residual-English scanner with allowlists for
  product names, IDs, abbreviations, and technical tokens.

The BA2 parser needs malformed header, bounds, compressed/stored entry, all
three string-table formats, UTF-8, duplicate ID, and v2/v3 fixture tests. Test
fixtures must be synthetic/minimal; do not commit Bethesda corpus excerpts
beyond legally reviewed, minimal golden terminology data required by the app.

## 21. Documentation changes

During implementation, update:

- `docs/ARCHITECTURE.md`: complete-locale policy, generated overlay pipeline,
  document-language ownership, validator/history descriptors;
- `docs/DOMAIN-RULES.md`: preserve current persisted generated-name rule and
  clarify that localization never changes stable identities;
- `docs/UX-DESIGN.md`: Japanese selector label, search aliases/normalization,
  approved collation versus structural order, and Japanese font/layout rules;
- `docs/BACKLOG.md`: remove completed localization items and retain only real
  deferred work;
- a build/reference-data document: required external Bethesda inputs,
  provenance, supported archive/plugin versions, and regeneration command;
- translator guidance/glossary: official versus tracker ownership and review
  workflow.

## 22. Recommended implementation parcels

### A. Complete semantic string migration

Migrate visible, accessible, help, dialog, status, transient, formatting, and
all validator output. Introduce typed validator descriptors, expected import
error codes, semantic history descriptors, complete-key/parameter tests, and
document `lang` updates. This is the foundation for every later parcel.

### B. Add the reviewed Japanese tracker catalogue

Register `ja-JP`, implement Automatic matching, add a complete catalogue and
glossary, add Japanese release completeness checks, and conduct native review.
Depends on A.

### C. Add canonical localized-string provenance

Extend the xEdit exporters/CSV schemas with qualified raw string IDs. Prove
ordinary FULL/ANAM values, system names, composed fauna, and DLC ownership.
Update builders and canonical-source validation without changing runtime IDs.
Can begin alongside A, but unresolved cases must be explicit before D.

### D. Build official-term extraction and generated overlays

Implement the read-only Node BA2/string parser, deterministic crosswalk,
provenance manifest, missing/conflict report, and `ja-JP` reference overlay.
Migrate every reference display consumer to the central resolver. Depends on C;
can integrate with B once the tracker catalogue exists.

### E. Japanese search, font, and layout hardening

Add Japanese/English-alias search semantics, NFKC query normalization,
deliberate collators, Japanese font delivery/fallback, and targeted layout
adjustments based on real Japanese content. Depends on B and D so measurements
use final strings.

### F. Release verification and accessibility handoff

Enable no-missing-Japanese gates, residual-English checks, full automated tests,
cross-platform/font/viewport manual passes, and a documented regeneration
check. Only after this parcel should the systematic accessibility audit start.

Suggested dependency graph:

```text
A ──> B ───────┐
│              ├──> E ──> F ──> accessibility audit
└──> C ──> D ──┘
```

## 23. Risks / unresolved questions

1. **System-name provenance:** current IDs are galaxy numeric IDs, not FormIDs;
   the native localized name source must be found.
2. **Composed fauna:** one species FormID may not own one localized FULL string;
   prefix/suffix and encounter-template composition must be reproduced or a
   canonical localized display record found.
3. **DLC coverage:** the supplied base archive is insufficient by itself.
   `SFBGS00D` and `ShatteredSpace` names require their own BA2 triplets and
   plugin-qualified joins.
4. **Bespoke X-Tech:** tracker metadata marks some content as having no source
   file. Confirm whether it represents an official DLC term and map it to the
   actual record, or classify its Japanese label as tracker-authored.
5. **FormID normalization:** verify exported IDs are stable file-local/canonical
   identities rather than current load-order IDs before using them in a
   crosswalk.
6. **Copyright/distribution:** retain only the minimum derived names. Confirm
   distribution policy before publishing Bethesda-derived terminology; never
   ship the archive or full tables.
7. **Font delivery:** system fallbacks are not deterministic; self-hosted Noto
   improves consistency but adds download/repository size.
8. **False completeness:** runtime fallback can hide missing Japanese. Release
   gates must be stricter than development behavior.
9. **User-authored and persisted names:** these may remain English by design and
   must not be misclassified by residual-English tests.

None is a reason to choose an easier Latin-script first locale. Items 1–5 are
bounded extraction/provenance work, and Japanese remains the recommended target.

## 24. Exact proposed file/module changes

The following is the expected implementation surface; names for new generated
files may be adjusted consistently during the implementation brief.

| File/module | Proposed change |
|---|---|
| `src/localization/types.ts` | Add `ja-JP`, full message keys, typed descriptor/parameter contracts |
| `src/localization/registry.ts` | Register Japanese and distinguish complete release catalogues from sparse regional overrides |
| `src/localization/locales/en-US.ts` | Complete baseline migration |
| `src/localization/locales/en-GB.ts` | Preserve sparse overrides |
| `src/localization/locales/ja-JP.ts` | Add complete reviewed tracker catalogue |
| `src/localization/catalog.ts` | Parameter diagnostics/completeness behavior; retain simple runtime |
| `src/localization/formatters.ts` | Number, percent, and collator helpers |
| `src/localization/locale.ts` | Japanese browser matching and selector metadata |
| `src/localization/LocalizationProvider.tsx` | Update `document.documentElement.lang` |
| `src/localization/referenceNames.ts` | Register generated locale overlays and aliases |
| `src/localization/reference-names/ja-JP.json` | Generated official names keyed by stable runtime IDs |
| `src/ui/itemSearch.ts` | Japanese NFKC matching, canonical-English aliases, deliberate ranking/collation |
| `src/domain/validation/types.ts` | Required discriminated semantic message descriptors |
| `src/domain/validation/rules/*.ts` | Emit structured facts/keys, not final English names/sentences |
| `src/ui/validationPresentation.ts` | Resolve localized names, contexts, remediations, severity labels and lists |
| `src/domain/collectionEditingSession.ts` | Store session-only semantic history descriptors |
| `src/App.tsx` | Localize remaining UI/status/dialog text; create typed history/status descriptors; resolve reference names |
| `src/ui/components/*.tsx`, `src/ui/layout/*.tsx` | Migrate visible/accessibility/help copy and direct reference names |
| `src/ui/statusTooltips.ts`, `contextHelpText.ts`, `powerEfficiencyPresentation.ts` | Replace English composition with messages/formatters |
| `src/data/serialization.ts`, `networkMigration.ts`, `NetworkImportButton.tsx` | Map expected failures to stable presentation codes while retaining diagnostic detail |
| `src/index.css` and affected component CSS | Add Japanese font stacks and evidence-led density fixes in parcel E |
| `index.html` | Keep safe initial language; runtime provider supplies effective exact locale |
| existing xEdit exporter `.pas` files | Export field path, raw string ID/table, source plugin, and name-source kind |
| five affected `reference-source/*.csv` files | Add the columns specified in section 9 via canonical regeneration |
| `scripts/bethesda-localization.mjs` (new) | Read-only BA2/string parsing and qualified lookup |
| `scripts/build-reference-name-overlays.mjs` (new) | Join canonical IDs and emit deterministic locale overlay/manifest/report |
| `scripts/build-reference-data.mjs` and helper modules | Validate new provenance without putting it in ordinary runtime entities |
| `tests/localization.test.ts` | Locale, fallback, catalogue, formatting, document language, reference overlay tests |
| validation/search/history tests | Japanese rendering, aliases, descriptors, stable identities/order |
| new script tests/fixtures | Synthetic BA2/string parser and deterministic crosswalk tests |
| `docs/ARCHITECTURE.md`, `DOMAIN-RULES.md`, `UX-DESIGN.md`, `BACKLOG.md` | Durable architecture/UX/backlog updates after implementation |

No runtime, dataset, dependency, archive, font, or localization implementation
change was made during this audit.
