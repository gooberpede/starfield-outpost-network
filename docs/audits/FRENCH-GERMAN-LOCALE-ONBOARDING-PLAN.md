# French and German Locale Onboarding Plan

## 1. Executive summary

French and German should remain one localization tranche, delivered as several bounded implementation parcels. Nothing found justifies a new localization framework or separate French and German architecture. The current stable-ID, semantic-catalogue, generated-overlay, search-alias, formatter, and locale-collator boundaries are suitable.

Use `fr-FR` and `de-DE` as the tracker locale identifiers. Bethesda's installed string-table tokens are `fr` and `de`; these are input tokens, not runtime locale tags. Automatic resolution should map every `fr` language tag, including `fr-CA`, to the single supported `fr-FR` catalogue, and every `de` tag, including `de-AT` and `de-CH`, to `de-DE`. The app must not imply that Canadian French, Austrian German, or Swiss German are separately translated variants.

The installed game supplies all three table types (`strings`, `dlstrings`, and `ilstrings`) for `fr` and `de` for `Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm`. It also supplies them for the terminology-only `SFBGS050.esm`. A read-only scan of every value in those 24 French/German tables found zero invalid UTF-8 values and widespread byte sequences that would mojibake under Windows-1252. Both new locale tokens therefore require explicit `utf-8` policy entries. English remains `windows-1252`; byte guessing remains forbidden.

The shared canonical provenance is already the correct cross-locale contract: 3,561 entities and 4,818 qualified provider/component rows. French and German must resolve those same identities. Canonical discovery, FormID/provider resolution, English matching, C1-C8 population discovery, and reverse name matching must not be rerun or redesigned merely to add these locales.

The principal generalization work is in scripts and artifacts still named or shaped around Japanese: the review-package generator, overlay builder/serializer/verifier, sidecar manifest, terminology value columns/verifier, composed-fauna preview/verification, npm script naming, and several locale-specific tests. Runtime registration is small and data-driven once locale modules and generated overlays exist.

Current `en-US` contains 414 semantic messages; `ja-JP` has exact 414-key parity and `en-GB` remains sparse. French and German must each be complete 414-key catalogues at the point implementation begins, plus any baseline keys added before release, with exact placeholder parity. Separate deterministic review CSVs should be used for `fr-FR` and `de-DE`, each joining the English source, Codex draft, manually supplied DeepL draft, comparison state, editorial result, and rationale.

Composed fauna is not an architecture blocker, but it is a release gate. The fixed prefix/species/diet identity model is reusable. Its fixed order and U+0020 separator need a bounded independent proof for each target locale before accepting full generated overlays, particularly for French articles/elision/gender/agreement and German compounding/hyphenation. Do not build a grammar engine unless this evidence disproves precomposition from official components.

German is the larger presentation risk. Likely defects are structural pressure in dense controls and dialogs, not a need for German-only CSS. The Keyboard Shortcuts dialog, header/network controls, Cargo Links, Resource Matrix, Planned Supply, Search Results, Validation, status feedback, and confirmation dialogs need focused 1366 px, 1600 px, and 200% zoom/reflow review.

Recommended disposition: one French/German tranche, six ordered parcels, estimated at 13-23 engineering days plus the user's DeepL and editorial turnaround. There is no user-decision blocker before Parcel 1. DeepL output and editorial approval are required before the semantic-catalogue parcel can close; composed-fauna runtime/Creation Kit evidence is required before overlay acceptance.

## 2. Current localization architecture

The current architecture has the correct separations:

- `en-US` is the complete semantic baseline; `en-GB` is a sparse override; `ja-JP` is complete.
- `SupportedLocale`, the central registry, preference validation, browser resolution, and `document.lang` own locale selection.
- `translate()` resolves a whole semantic message, validates named parameters, applies `Intl.PluralRules`, and interpolates values.
- `Intl.NumberFormat`, `Intl.ListFormat`, and `Intl.Collator` are already centralized.
- Bethesda-authored names are resolved by stable kind + stable ID through generated locale overlays, then canonical English, then raw ID.
- Search builds one entity with localized display, abbreviation, canonical-English alias, and curated alternates.
- Canonical provenance is build-time data and is absent from persisted player data and runtime reference JSON.
- Generated overlays are statically imported. Locale changes are presentation-only and do not affect persistence or history.

No persistence, import/export, domain, validation-rule, or Undo/Redo schema work is required.

The handbook's historical `331 semantic messages` statement is stale. Repository code and tests currently prove 414 baseline and Japanese keys. The policy correctly says parity, rather than a historical count, is the invariant.

## 3. Current French/German readiness

| Area | Readiness | Finding |
| --- | --- | --- |
| Runtime locale model | High | Central registry and `SupportedLocale` union need ordinary additions. |
| Semantic messages | Medium | Catalogue contract is reusable; two complete catalogues and generalized review tooling are needed. |
| Bethesda inputs | High | Installed `fr`/`de` tables are present for all in-scope plugins and table types. |
| Encoding | High | Both targets are UTF-8; policy entries/tests are needed. |
| Canonical provenance | High | Existing 3,561/4,818 identity contract is locale-neutral. |
| Overlay generation | Medium | Materialization core accepts a locale token, but CLI, serialization, manifests, drift labels, and verifier are Japanese-specific. |
| Official terminology | Medium | Qualified identities are reusable; committed value columns and verifier are Japanese-specific. |
| Composed fauna | Medium | Identity/role model is reusable; order/separator and grammar require per-locale proof. |
| Search/collation | Medium-high | Core behavior is generic; target-corpus normalization tests and a small search-folding decision are needed. |
| Typography | High | Existing Latin stacks should cover both; manual glyph/uppercase/fallback proof remains. |
| Layout | Medium | German creates significant density pressure; fixes should be cross-locale. |
| Accessibility | High | Existing implementation is localized; shortcut chord speech contains one explicit Japanese/English branch. |
| Bundle/runtime loading | High | Static registration remains appropriate through V1 onboarding. |

## 4. Locale identifiers and browser fallback policy

Recommend:

```text
tracker locale       Bethesda token
fr-FR                fr
de-DE                de
```

Reasons:

- the project uses BCP 47-style region-qualified tracker locales (`en-US`, `en-GB`, `ja-JP`);
- Bethesda tables use language tokens (`fr`, `de`) independently of runtime `Intl` tags;
- `fr-FR` and `de-DE` make the translation target and `Intl` behavior explicit;
- they leave room for future regional catalogues without claiming those variants now.

Automatic resolution should iterate `navigator.languages` in order and use this policy:

| Browser language | Effective tracker locale |
| --- | --- |
| `fr`, `fr-FR`, any `fr-*` including `fr-CA` | `fr-FR` |
| `de`, `de-DE`, any `de-*` including `de-AT`, `de-CH` | `de-DE` |
| `ja`, any `ja-*` | `ja-JP` |
| `en-US`, `en-US-*` | `en-US` |
| `en`, other `en-*` | `en-GB` (preserve current behavior) |
| unsupported tag | continue to the next browser preference, then `en-US` |

The selector should self-label the explicit options as `Français (France)` and `Deutsch (Deutschland)` and keep the closed automatic label as the effective short tag (`FR-FR`/`DE-DE`). `document.documentElement.lang` should receive the exact effective locale.

Parameterize the current browser-resolution tests rather than adding independent duplicated suites.

## 5. Bethesda input/table availability

### Repository-proven contract

- The intake tool takes multiple languages in one `languages` array.
- It matches exact `<plugin-base>_<locale>.<table-type>` members and keeps table type and plugin identity distinct.
- It supports BA2 v2 `GNRL`, stored members, and the zlib forms found in current archives.
- Missing requested coverage fails with `LANGUAGE_NOT_FOUND`.
- `Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm` are canonical content sources.
- `SFBGS050.esm` is terminology-only evidence and must never add canonical runtime entities.

### Locally verified installed-game facts

The repository intake inspector was run in read-only mode against the installed game dated April/June 2026. It found this exact coverage:

| Plugin | Archive carrying localized tables | `fr` | `de` |
| --- | --- | --- | --- |
| `Starfield.esm` | `Starfield - Localization.ba2` | all 3 types | all 3 types |
| `ShatteredSpace.esm` | `ShatteredSpace - Main02.ba2` (`Main01` inspected too) | all 3 types | all 3 types |
| `SFBGS00D.esm` | `SFBGS00D - Main.ba2` | all 3 types | all 3 types |
| `SFBGS050.esm` | `SFBGS050 - Main.ba2` | all 3 types | all 3 types |

For each row, “all 3 types” means `.strings`, `.dlstrings`, and `.ilstrings`. Thus coverage exists for every current canonical provider and for the Free Lanes terminology source. Implementation must still create a fresh ignored intake manifest and bind generated sidecars to its archive/member hashes; this audit does not promote local hashes into a production artifact.

The current extraction command fails closed before accepting these tables because `de`/`fr` are absent from the encoding policy. That is expected and confirms the first implementation dependency.

## 6. Encoding policy

French and German official tables require UTF-8 policy entries:

```json
{
  "en": "windows-1252",
  "fr": "utf-8",
  "de": "utf-8",
  "ja": "utf-8"
}
```

Evidence: the diagnostic parsed every value boundary in all French and German `strings`, `dlstrings`, and `ilstrings` tables for the four inspected plugins. Every French/German value decoded as fatal UTF-8 with zero failures. Many thousands of values per large table decode differently as Windows-1252, which is the expected mojibake signature for UTF-8 multibyte text. By contrast, English tables contain invalid UTF-8 values and remain explicitly Windows-1252.

Encoding is currently duplicated in:

- `reference-source/localization-provenance-policy.json`;
- committed input-manifest metadata;
- `scripts/localization/string-table-reader.mjs` (`LOCALE_ENCODINGS`).

Implementation should keep one authoritative locale-token encoding map in tooling and validate manifests/policy against it, rather than adding another independent table. Tests should assert:

- `encodingForLocale('fr')` and `encodingForLocale('fr-FR')` are UTF-8;
- `encodingForLocale('de')` and `encodingForLocale('de-DE')` are UTF-8;
- English remains Windows-1252 and Japanese remains UTF-8;
- unsupported locales fail with `UNSUPPORTED_LOCALE_ENCODING`;
- malformed UTF-8 fails with fatal decoding;
- no byte sniffing/fallback occurs.

## 7. Semantic catalogue onboarding

Current baseline: 414 `en-US` keys across 19 namespaces. `ja-JP` has exact key parity; `en-GB` is sparse.

Release contract for each target locale:

- exact current `en-US` key set;
- exact named-placeholder set per key;
- no empty values;
- valid supported plural expressions;
- protected tokens preserved;
- ordinary tracker text must not silently equal/fall back to English, except an explicit invariant allowlist;
- accessible, status, history, validation, About, Search, Resource Matrix, Planned Supply, Cargo Links, navigation, and Keyboard Shortcuts strings included.

The catalogue type and runtime fallback are already generic. The Japanese test suite is not: it imports `ja-JP` directly and embeds Japanese-only expected values. Split it into:

1. a parameterized full-locale contract for `ja-JP`, `fr-FR`, and `de-DE` (keys, placeholders, non-empty values, registry/document language, formatters);
2. small locale-profile suites for representative translations, protected tokens, terminology, search, and composition.

Both catalogues can be added in one semantic parcel, but neither should be released sparse. Translation and editorial review may progress independently per locale within that parcel.

## 8. Codex + DeepL review workflow

Use this sequence for tracker-authored text:

1. Freeze a review-source revision from `en-US` and the two approved glossaries.
2. Generate separate deterministic `fr-FR` and `de-DE` review CSVs.
3. Produce Codex translations with UI context, risk, placeholders, protected tokens, and official-term constraints visible.
4. Give the corresponding source file to the user for independent DeepL translation.
5. Re-import DeepL output by stable key; reject missing/duplicate keys or source-hash drift.
6. Compare Codex and DeepL translations.
7. Editorially resolve disagreements against English meaning, UI context, official Bethesda terminology, and target-language grammar.
8. Validate placeholders/tokens, then generate or update the final catalogue from the approved column.
9. If English changes later, regenerate and mark only changed-source rows stale; never silently retain approval against a different source.

DeepL is a comparison witness, not an authority. Identical drafts reduce review effort but do not waive contextual checks for high-risk rows. Differences are not errors; they are review prompts.

## 9. Review CSV/handoff design

Use one UTF-8 RFC 4180 CSV per locale, rather than a combined bilingual file:

```text
docs/localization/fr-FR-review.csv
docs/localization/de-DE-review.csv
```

Recommended columns, in deterministic key order:

```text
Key
Locale
EnglishSource
EnglishSourceSha256
Context
Risk
Parameters
ProtectedTokens
OfficialTermConstraints
CodexTranslation
DeepLTranslation
ComparisonStatus
FinalTranslation
ReviewerNote
```

Rules:

- quote every cell and encode embedded newlines using normal CSV quoting;
- retain literal placeholders such as `{item}` and the full supported plural expression in the source/translation;
- list expected placeholder names separately in `Parameters`;
- treat placeholder loss, addition, renaming, or brace corruption as a hard import error;
- protect `He-3`, `JSON`, key names/chords, IDs, product attribution, and any row-specific invariant tokens;
- express official terms as stable `TermId` constraints plus recommended localized wording, not as free-form translator hints;
- compute `EnglishSourceSha256` from the exact source string so English drift is row-addressable;
- use `IDENTICAL`, `TYPOGRAPHIC_ONLY`, `SUBSTANTIVE`, `MISSING`, and `INVALID_TOKENS` comparison states;
- compare exact strings first; only normalize line endings and documented typographic trivia for the `TYPOGRAPHIC_ONLY` classification;
- derive the final catalogue solely from non-empty `FinalTranslation` rows whose source hash is current.

For the manual DeepL exchange, export a deterministic two-column/keyed projection (`Key`, `EnglishSource`) plus the immutable metadata columns. The user must paste/upload it to DeepL and return its keyed output. Codex cannot call DeepL directly. Re-import must join by `Key`, never by row position alone.

Generalize `japaneseReviewPackage.ts` and `generate-japanese-review-package.ts` into locale-neutral review-source helpers. Keep the current Japanese CSV reproducible during the migration.

## 10. Glossary strategy

Create durable Markdown profiles analogous to `JAPANESE-GLOSSARY.md`:

```text
docs/localization/FRENCH-GLOSSARY.md
docs/localization/GERMAN-GLOSSARY.md
```

Each entry should state:

- English concept and semantic distinction;
- preferred target wording;
- official Bethesda `TermId`/evidence where available;
- tracker-owned status where not official;
- forbidden or easily confused alternatives;
- capitalization/abbreviation policy;
- example UI contexts and grammatical notes.

Stabilize at least Outpost, Cargo Link, Inter-System Cargo Link, Planned Supply, Present, Producing, Inputs, Logistics, Manufacturing, Validation, Resource Matrix, Reshuffle, Lock, Inorganic, Organic, X-Tech, and X-Tech Power Core before bulk translation. Glossaries guide lexical consistency; final sentences remain locale-owned and must not be assembled mechanically from glossary words.

Keep technical abbreviations and chord tokens invariant unless the UI already presents a localized spoken expansion. Official Bethesda wording takes precedence for official concepts; tracker concepts remain editorial decisions.

## 11. Official terminology reuse

`official-terminology-provenance.csv` contains reusable locale-neutral identity evidence: `TermId`, evidence kind/source use, source plugin, record identity where available, name-source plugin, table type, string ID, English evidence, and context. Its current schema is not fully locale-neutral because it embeds `OfficialJapanese` and `RecommendedDefaultForJaJP`; the verifier requires those columns.

Generalize without losing the evidence boundary:

- preserve a locale-neutral evidence artifact keyed by `EvidenceId`, retaining exact qualified identities and English/context evidence;
- store locale resolutions in one small per-locale artifact keyed by `EvidenceId` (recommended) rather than adding `OfficialFrench`, `OfficialGerman`, and future language columns indefinitely;
- validate `SourceUse` so `SFBGS050.esm` remains terminology-only;
- resolve French/German values using the same `(NameSourcePlugin, StringTable, StringID)` identities;
- keep contextual evidence contextual; a localized substring is not automatically a standalone canonical term;
- apply the approved localized terms to semantic catalogues/glossaries, not as runtime sentence-fragment assembly.

The current 37 evidence rows / 19 term IDs can be reused. The terminology verifier, schema constants, fixtures, and output labels are Japanese-specific and belong in the tooling-generalization parcel.

## 12. Reference-name overlay generalization

The locale-neutral materializer already accepts a Bethesda locale token and uses the correct qualified-table key. The following pieces are Japanese-specific and should be parameterized:

- CLI default and fixed `ja` table selection;
- `ja-JP-reference-names.ts` output path/export name;
- serializer/parser export name and Japanese source comment;
- drift labels such as `changed-japanese-value`;
- `japaneseLocalizationInputs` sidecar field;
- fixed Japanese manifest locale and input identity;
- verifier paths/messages and tests;
- runtime import/registration.

Recommended output shape:

```text
src/localization/generated/fr-FR-reference-names.ts
src/localization/generated/de-DE-reference-names.ts
reference-source/localized-reference-names-fr-FR-manifest.json
reference-source/localized-reference-names-de-DE-manifest.json
```

Use one generated module and one sidecar per locale. Per-locale sidecars avoid cross-locale rewrite conflicts and bind each module independently to locale token, encoding, table-member hashes, upstream provenance hash, counts, composition policy, separator proof, and generator version. During generalization, migrate or compatibly read the current Japanese sidecar rather than maintaining two incompatible formats indefinitely.

Register both modules statically in `referenceNames.ts`. Do not lazy-load now. The Japanese overlay source is about 152 KB and the Japanese semantic catalogue about 34 KB; two comparable additions imply roughly 350-450 KB of unminified TypeScript source before minification/compression. The current built JS is about 552 KB. This is measurable growth, not evidence that runtime splitting is required. Defer bundle optimization to the existing post-V1-localization review.

## 13. Provenance-pipeline reuse

The expected model is confirmed by current contracts:

```text
same 3,561 entities
same stable entity IDs
same provider/FormID/field/table/string identities
same 4,818 qualified rows
different locale-specific values
```

Do not rerun or redesign:

- canonical entity discovery;
- English-name reverse matching (it must never be introduced);
- C2 direct-name provenance;
- C3 system discovery;
- C4 body population;
- C5 organic lineage;
- C6 component identity/rule selection;
- C7 provider/master resolution;
- C8 coverage reconciliation;
- normalization policy, unless upstream canonical English genuinely drifts.

Locale onboarding should consume the committed provenance CSV and resolve new official tables by exact identity. The full provenance builder currently verifies English + Japanese and emits Japanese preview data; it need not be rerun to discover French/German identities. Generalize only the downstream locale-value resolution and any verification hooks needed to prove new-locale availability.

## 14. Composed-fauna requirements

Current provenance is sufficient to select the prefix/species/diet component identities for all 922 composed fauna. It records 2,179 component rows with fixed semantic slots and has already proved English reconstruction. That does not prove natural French or German rendered names.

Before full overlay acceptance, use the same qualified identities to generate an untracked proof set of 12-16 representatives per locale covering:

- all observed shapes: prefix+species+diet, species+diet, prefix+species;
- absent prefix and absent diet;
- every unique prefix and diet component where practical;
- masculine/feminine-looking French species terms, vowel/elision candidates, and plural-looking components;
- long German species components, compounds, hyphens, and punctuation-bearing components;
- at least two Shattered Space targets;
- at least one recursive-OMOD target;
- heavily reused species components;
- any component with leading/trailing whitespace or embedded punctuation.

For each representative compare the precomposed output to independent first-party rendered evidence from Starfield runtime or Creation Kit/xEdit display that uses the localized game data. Record component order, separator, articles, inflection/agreement, elision, and punctuation. Table strings alone prove components, not the final displayed phrase.

Acceptance outcomes:

- if fixed order + U+0020 matches, reuse current precomposition with locale-scoped proof metadata;
- if component strings encode all needed grammar but separator/order differs, add a narrow locale composition policy;
- only if evidence shows entity-dependent grammar not captured by official component strings should a bounded exception/artifact be designed;
- do not prebuild a general grammar engine.

This is an implementation gate, not a reason to split the tranche today.

## 15. Search behavior

Current search already preserves the required stable-entity model and ranking: localized exact/prefix/substring first, abbreviation, canonical English alias, curated alternate, locale-aware visible-name tie-break, stable ID. It uses NFC, whitespace collapse, and locale-aware lowercasing.

French and German need a corpus-driven normalization pass:

- add a search-only accent fold (NFD/NFKD combining-mark removal) so French users can find accented names without entering accents and German base-letter input can match umlauts;
- keep the original normalized value for ranking so exact localized spelling still wins;
- normalize straight/curly apostrophes only if the generated French corpus contains the typographic form users cannot conveniently type;
- normalize Unicode hyphen variants only where found in official names;
- preserve canonical English aliases and invariant abbreviations;
- do not add fuzzy search;
- do not automatically add `ae/oe/ue/ss` aliases for `ä/ö/ü/ß`. First inspect official names and manual QA/search feedback. Curated aliases can be added later for evidenced high-value cases.

Tests should cover `é/è/ê/ç/œ`, apostrophes, hyphens, `ä/ö/ü`, and `ß`, including exact-ranking behavior and one-result-per-ID deduplication. Note that combining-mark removal does not equate `ß` with `ss` or `œ` with `oe`; those remain explicit policy decisions.

## 16. Collation behavior

The shared `Intl.Collator(locale, { sensitivity: 'base', numeric: true })` with stable-ID fallback is appropriate for `fr-FR` and `de-DE`. Add parameterized representative tests rather than locale-specific sort implementations.

Recheck locale collation only for:

- system selector;
- cargo export candidates;
- alphabetical Planned Supply groups;
- Search result tie-breaking.

Preserve domain/user order for resource topology, bodies/orbits/sources, persisted outposts, cargo order, validation order, and history chronology. A raw `localeCompare` remains in matrix presentation code; verify that it is only used for a presentation grouping where locale collation is intended, and route it through the shared helper if so. Do not broaden sorting as incidental cleanup.

## 17. Typography

No new locale-specific font stack or font binary is expected. The UI already uses Barlow Semi Condensed with Arial Narrow/system fallbacks, and technical text uses IBM Plex Mono with system mono fallback. Both target languages are Latin-script and the current stacks are intended to cover their letters.

Manual verification must include:

- French `ÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ` and lowercase forms;
- German `ÄÖÜäöüß` and uppercase transformation of `ß` in current browsers;
- accented text in UI and technical-mono surfaces;
- absence of per-glyph fallback or width jumps;
- headings that use `text-transform: uppercase` and wide tracking;
- self-labels in the locale selector.

Do not add `:lang(fr)` or `:lang(de)` typography rules unless real rendering proves a defect. German may expose over-wide uppercase/tracked headings; first fix structural tracking/wrapping globally where appropriate.

## 18. Layout/density risks

German is a high-risk content-length test; French is medium. Current structural pressure points include fixed/minimum widths, two-column grids, nowrap/ellipsis summaries, and dense action rows.

| Surface | Risk | Evidence and manual target |
| --- | --- | --- |
| Title/header + locale selector | High (German) | Title select is clamped to 5-11 rem; page header has `1fr auto auto`. Test 1366, 1600, 200% zoom. |
| Network controls / Character header | High | 140 px minimum field and small fixed numeric widths compete with translated actions. Test all three targets. |
| Navigation | Medium-high | Dense action heading and fixed move-control columns; labels already ellipsize. Test 1366 and 200%. |
| Outpost Details / System/Body | High | Multi-column grid, fixed 4.25 rem buttons, nowrap labels. Test 1366, 1600, 200%. |
| Resource Matrix | High | 38 rem minimum internal grid, fixed 3.2 rem action cells, uppercase/tracked headings; scoped overflow exists. Test 1366, 1600, 200%. |
| Planned Supply | High | Fixed cell width/topology and max-content groups; horizontal overflow exists. Check summaries, headings, and action labels at all targets. |
| Cargo Links | High | Two-column summary grids, truncation, compact action groups, translated state/help text. Test all targets. |
| Search / Search Results | Medium-high | 12.5 rem search control and 7-18 rem result names; overlay minimum 24 rem. Test long official German names and 200%. |
| Validation | High | 32 rem anchored panel, truncated context, dense issue text. Test long parameters and issue navigation at all targets. |
| About / confirmation dialogs | Medium-high | Both are 25 rem wide; destructive copy may expand substantially. Test 200% zoom and longest German messages. |
| Status/import/export feedback | High | Status uses nowrap/ellipsis and max-width 42/75 vw. Confirm full text remains discoverable and announcements are complete. |
| Help/tooltips | Medium | 18 rem help cap and 22 rem matrix tooltip cap. Verify wrap and viewport containment. |

Required matrix:

- 1366 px: every listed surface, with German first and French spot checks;
- 1600 px: dense workspace baseline and cross-locale comparison;
- 200% browser zoom/reflow: header, navigation, all editors, Search Results, Validation, all dialogs, status/live feedback;
- additionally test the existing workspace breakpoint near 1024 px and shortcut-dialog breakpoint at 54 rem for discontinuities.

Prefer flex/grid minmax corrections, wrapping, scoped overflow, and discoverable ellipsis that benefit all locales. German-only CSS is not currently justified.

## 19. Keyboard Shortcuts dialog risks

This surface is fully semantic-message driven for headings and action labels but was added after much Japanese work. Risks:

- 58 rem modal width and two equal columns;
- each row reserves `minmax(10rem, 1fr)` for text plus nowrap keycaps;
- one-column change only at 54 rem;
- dual Redo chord keycaps wrap independently but long action labels may force early pressure;
- uppercase/tracked dialog heading;
- 200% zoom height overflow.

Required checks:

- all 23 registry chords represented once and grouped correctly;
- all action/group/intro/close labels translated;
- two columns at 1600 and 1366 px, one column below 54 rem;
- long German labels with both Redo chords;
- modal scroll, focus trap, initial/restore focus, Escape, and 200% zoom.

`formatAccessibleShortcutChord()` currently says English `Control`, `plus`, and `Arrow` for every non-Japanese locale and has an explicit `ja-JP` branch. Visible key tokens may remain invariant, but screen-reader chord phrases should use semantic locale strings or a small locale policy for French and German. Do not change shortcut bindings.

## 20. Accessibility

No broad accessibility redesign is needed. Existing localized labels, descriptions, validation presentation, live/status messages, search announcements, modal behavior, and focus patterns should be verified under both catalogues.

Necessary implementation item: generalize accessible shortcut chord speech as described above. Also verify:

- localized dialog name/description associations;
- complete status/live-region messages (not visual truncation text);
- Search result counts/instructions;
- validation severity and contextual names;
- compact/icon control names;
- `document.lang` switching;
- no untranslated `aria-label`, `title`, placeholder, or visually hidden instruction;
- screen-reader pronunciation of locale names and technical tokens.

The existing accessibility baseline should not be reopened unless these checks reveal a concrete gap.

## 21. Formatting

The existing helpers are sufficient for current French/German needs:

- integer, decimal, and percent via `Intl.NumberFormat`;
- human lists via `Intl.ListFormat`;
- plural category via `Intl.PluralRules`;
- alphabetical display via `Intl.Collator`.

Parameterize formatter tests for French decimal/group punctuation, French list conjunction, German decimal/group punctuation, German list conjunction, numeric collation, and plural selection. Current messages use whole translated templates and named interpolation; no specific French/German message was found that requires gender/select syntax or ICU/FormatJS.

User-visible dates/times remain absent/deferred. Export filename timestamps, schema values, stable IDs, FormIDs, JSON tokens, and persisted values remain invariant.

## 22. Runtime locale registration

Implementation requires:

- add `fr-FR` and `de-DE` to `supportedLocaleIds`;
- add complete catalogue modules and central registry metadata;
- parameterize browser resolution;
- statically import/register two generated reference overlays;
- extend preference tests and any explicit locale unions, including `KeyboardShortcutsDialog` props;
- ensure selector labels and `document.lang` update immediately;
- retain presentation-only locale switching.

There are currently three statically imported semantic catalogues and one generated non-English reference overlay. The registration pattern is adequate; no provider/state redesign is needed.

## 23. Bundle impact

Current source-size reference points:

```text
en-US catalogue                 28,654 bytes
ja-JP catalogue                 33,615 bytes
ja-JP reference overlay       151,852 bytes
current built JS              552,072 bytes
```

French/German should add two catalogue modules and two similarly shaped overlays. Exact production impact must be measured after generation with the normal Vite build and gzip/brotli analysis if available. Static bundling is acceptable for this tranche. Do not introduce lazy loading merely in response to Vite chunk warnings; the backlog intentionally schedules bundle review after all V1 locales.

## 24. Japanese-specific assumptions inventory

| Area | Classification | Required action |
| --- | --- | --- |
| Semantic catalogue type/fallback/interpolation | Already generic | Reuse. |
| Locale registry shape and formatters | Already generic | Add data and parameterized tests. |
| Reference-name stable-ID lookup shape | Already generic | Register new overlays. |
| Provenance entity/provider identities | Already generic | Reuse without rediscovery. |
| Intake language list/member discovery | Already generic | Reuse; add encoding policy. |
| Materializer qualified lookup by locale token | Already generic | Reuse core. |
| `SupportedLocale` union/registry imports | Rename/generalize now | Add target IDs/modules. |
| Browser locale resolver | Rename/generalize now | Data-driven language-to-supported-locale mapping. |
| `localization:review`, Japanese review types/files | Rename/generalize now | Locale-parameterized deterministic review generator. |
| Overlay CLI/output/export/parser/verifier | Rename/generalize now | Locale parameter + per-locale output/manifest. |
| `localized-reference-names-manifest.json` Japanese fields | Rename/generalize now | Versioned per-locale sidecars. |
| Drift category `changed-japanese-value` | Rename/generalize now | `changed-localized-value`. |
| Terminology CSV Japanese columns/verifier | Rename/generalize now | Locale-neutral evidence + per-locale values. |
| Provenance builder's Japanese availability and spot checks | Safe Japanese-specific exception | Preserve for historical Japanese provenance closure; do not make it the new-locale generator. |
| C6 Japanese preview CSV | Safe Japanese-specific exception | Preserve historical artifact; create temporary target-locale proof artifacts, not parallel canonical discovery. |
| `:lang(ja)` font/tracking CSS | Safe locale-specific exception | Leave unchanged. |
| Shortcut spoken-chord `ja-JP` branch | Rename/generalize now | Localize spoken connectors/direction names. |
| Japanese correction/product hardening tests | Safe locale-specific exception | Preserve; add target profile tests separately. |
| Current static bundle model | Defer | Review after all planned V1 locales. |
| Unified `localization:verify -- --locale` command | Generalize now if it orchestrates new checks cheaply | Prefer one parameterized closure command; do not duplicate validators. |

## 25. Tooling generalization recommendations

Make only the generalizations needed by two simultaneous locales:

1. Introduce an explicit mapping between tracker tag (`fr-FR`) and Bethesda token (`fr`) plus encoding (`utf-8`). Use it across intake adapters, overlay generation, sidecars, and verification.
2. Turn review-package generation into a target-locale command with deterministic paths and source hashes.
3. Parameterize overlay generation/verification and neutralize serializer/drift terminology.
4. Version per-locale overlay sidecars and migrate Japanese compatibly.
5. Split terminology identity evidence from locale-specific resolved values.
6. Add a locale-oriented closure orchestrator only as a thin wrapper around existing authoritative checks.
7. Parameterize contract tests over all complete locales; retain narrow locale-profile tests.

Do not generalize canonical record discovery, add arbitrary plugin support, introduce translation-management software, add dependencies, or implement dynamic imports in this tranche.

## 26. Automated test plan

Minimum durable expansion:

- full-locale key and placeholder parity parameterized over `ja-JP`, `fr-FR`, `de-DE`;
- empty-value, unsupported plural syntax, protected-token, and ordinary-English-fallback guards;
- registry/selector/document-language/preference coverage for five supported locales;
- browser resolution cases for `fr`, `fr-FR`, `fr-CA`, `de`, `de-DE`, `de-AT`, `de-CH`, mixed preference order, and unsupported fallback;
- deterministic review CSV generation, source hashes, DeepL re-import, duplicate/missing key rejection, placeholder/token loss, and stale-English detection;
- encoding policy/fatal-decoder coverage for `fr`/`de`;
- parameterized overlay materialization, exact 3,561 entity/4,818 provenance-row closure, per-kind counts, input hashes, generated drift, and no empty/replacement values;
- terminology identity/value closure for both target locales and source-use enforcement for `SFBGS050.esm`;
- representative composed-fauna fixtures and checked proof-set expectations per locale;
- localized display + canonical-English alias search, accents, umlauts, apostrophes/hyphens, `ß`, abbreviation behavior, deduplication, and ranking;
- parameterized collation/formatters;
- Keyboard Shortcuts catalogue completeness and accessible chord speech;
- existing component/accessibility tests rendered once with long representative French/German strings where practical.

Tests to generalize first: `japaneseLocalization.test.ts` contract portions, `localizationReferenceNames.test.ts` closure structure, `localizedCollation.test.ts`, review-package tests, string-table encoding tests, materializer tests, overlay verifier tests, and explicit locale arrays/unions in `localization.test.ts` and component props. Keep `localizationCorrections.test.ts` and Japanese product-hardening expectations Japanese-specific.

## 27. Manual verification plan

Recommended implementation workflow:

1. Generalize tooling and generate frozen review sources.
2. Resolve French/German official terminology and approve glossaries.
3. Produce Codex drafts.
4. User obtains independent DeepL outputs and returns the keyed CSVs.
5. Editorially adjudicate all substantive disagreements and high-risk messages.
6. Integrate complete semantic catalogues.
7. Extract/resolve official reference names and terminology from local Bethesda inputs.
8. Run and approve composed-fauna proof sets.
9. Generate overlays and run automated closure.
10. Verify locale switching preserves selected network/outpost, history, persistence, and exported JSON.
11. Run search/collation/formatting checks with representative official names.
12. Run the 1366 px, 1600 px, breakpoint, and 200% zoom layout matrix.
13. Keyboard-only and screen-reader smoke-test Search, Validation, dialogs, status announcements, and Keyboard Shortcuts.
14. Complete locale profiles and release gates.

The user is required at steps 4 and 5 for DeepL exchange/editorial approval. A person with access to runtime/Creation Kit evidence is required for composed-fauna proof if the official rendered names cannot be independently derived from an existing trusted exporter.

## 28. Required implementation documentation updates

On completion:

- update `LOCALE-ONBOARDING.md` status inventory and add complete French and German Locale Profiles;
- update shared policy only for genuinely cross-locale lessons (UTF-8 mapping, review artifact, parameterized overlays, search folding, composition proof);
- update `LOCALIZATION-INPUTS.md` with `fr`/`de` tokens, explicit UTF-8 policy, verified archive/table mapping, and locale-parameterized commands;
- update `BACKLOG.md` to mark French/German complete and retain the post-V1 bundle review;
- update `ARCHITECTURE.md` only for durable generalized artifact/manifest/terminology boundaries;
- update `UX-DESIGN.md` only if French/German establishes a reusable layout or accessibility convention;
- preserve this report as the historical planning record rather than turning policy docs into an implementation diary.

## 29. Recommended implementation parcel sequence

### Parcel 1 — Locale/tooling contracts

Add locale metadata/mapping, UTF-8 policies/tests, parameterized review tooling, parameterized overlay serializer/verifier/sidecars, terminology value boundary, and parameterized closure tests. Preserve current Japanese outputs byte-for-byte or migrate them explicitly with verified equivalence.

### Parcel 2 — Official terminology and glossaries

Resolve French/German values from the 37 existing evidence rows/19 term IDs, review contextual uses, create both glossaries, and lock official-term constraints for translation.

### Parcel 3 — Semantic catalogues and independent review

Generate Codex drafts, receive user-supplied DeepL outputs, compare/editorially adjudicate, create two complete catalogues, and pass catalogue/placeholder/token/accessibility/history/status closure.

### Parcel 4 — Official reference names and composed-fauna proof

Create ignored intake manifests, resolve all 4,818 rows for both locale tokens, run bounded fauna proof sets, generate per-locale overlays/sidecars, and prove 3,561-entity closure. Stop if first-party composition evidence contradicts the fixed model.

### Parcel 5 — Runtime/search/collation integration

Register catalogues/overlays, implement browser mappings and any approved narrow search folding, generalize spoken shortcut chords, and add runtime/search/collation/formatter tests. Keep static bundling.

### Parcel 6 — Layout, accessibility, release closure, and docs

Run the manual matrix, implement only evidenced cross-locale layout fixes, run complete verification/build/lint, measure bundle size without optimizing it prematurely, and close durable docs/locale profiles.

## 30. Estimated complexity/size of each parcel

| Parcel | Complexity | Estimate | Main uncertainty |
| --- | --- | --- | --- |
| 1. Tooling contracts | Medium cross-cutting | 2-4 engineering days | Sidecar/terminology migration while preserving Japanese closure. |
| 2. Terminology + glossaries | Medium editorial/technical | 1-3 days | Context-dependent official terms. |
| 3. Two semantic catalogues | Medium-high editorial | 4-7 active days + DeepL turnaround | 828 current target rows and adjudication quality. |
| 4. Names + fauna proof | Medium-high | 3-5 days | Independent proof of composition/grammar. |
| 5. Runtime/search/collation | Medium | 1-2 days | Narrow search normalization policy. |
| 6. QA/closure/docs | Medium-high | 2-4 days | German layout defects revealed by real strings. |

Total: approximately 13-23 engineering days, plus external DeepL/editorial and any runtime/Creation Kit evidence latency. This is one tranche but not one undifferentiated implementation parcel.

## 31. Whether French + German should remain one tranche

Yes. They share every architectural and tooling change, are both present in the same official inputs with the same UTF-8 policy, consume the same canonical identities, and benefit from one cross-Latin layout/search hardening pass. Splitting them would duplicate integration and QA work.

Manage schedule risk with parcel boundaries and per-locale acceptance columns. A locale may temporarily lag in editorial review, but do not ship one as a sparse catalogue or fork the architecture. Reconsider the paired release only if the composed-fauna proof reveals a genuinely language-specific model that cannot be bounded, or if one DeepL/editorial cycle becomes externally unavailable.

## 32. Transferable lessons for Spanish/Italian/Portuguese

After this tranche, Spanish (Spain), Italian, and Portuguese (Brazil) can realistically be considered as a three-locale tranche if:

- tracker-tag/Bethesda-token/encoding mapping is data-driven;
- review CSV generation/import and source-drift detection are locale-parameterized;
- terminology identity evidence is separated from locale values;
- overlay modules and sidecars are per-locale and generated by one command shape;
- full-locale contract tests are parameterized;
- composed-fauna proof is a documented bounded gate;
- Latin search normalization and layout fixes are structural rather than French/German branches.

Remaining per-language work will still include official input/encoding confirmation, terminology/glossary review, catalogue adjudication, composed-name proof, target-corpus search review, and manual layout/accessibility QA. Polish and Simplified Chinese retain larger language-specific risks and are not covered by this inference.

## 33. Explicit unresolved questions/blockers

No user decision is required before beginning Parcel 1.

Open implementation gates:

1. The user must provide independent DeepL output for both deterministic review CSVs and participate in final editorial approval.
2. French/German fixed-order composed fauna and the U+0020 separator require independent first-party rendered proof before generated overlays are accepted.
3. The generated official-name corpus must be inspected before finalizing apostrophe/hyphen normalization and before adding any German `ae/oe/ue/ss` aliases. The recommendation is no automatic digraph aliases without evidence.
4. Real translated strings must be used to determine exact cross-locale layout fixes; this audit does not justify German-only CSS.
5. The terminology artifact migration needs a versioned compatibility decision during Parcel 1; the recommended design is locale-neutral identities plus per-locale value artifacts.

None of these questions requires a new localization framework, dependency, persistence change, or locale split.

## Audit diagnostics and scope confirmation

Diagnostics were placed under `.local-work/localization/fr-de-audit/` and remain ignored/untracked.

- `inputs.json` explicitly listed the four installed archives/plugin mappings and requested `en`, `fr`, `de`, and `ja`.
- `npm run localization:inputs:inspect -- --config ...` inspected BA2 headers/member inventories and hashes without extracting content.
- An attempted normal extraction stopped fail-closed at `UNSUPPORTED_LOCALE_ENCODING` for `de`, after writing one ignored local table; no tracked or runtime artifact changed.
- `diagnose-encodings.mjs` read only the localized table members in memory, parsed table value boundaries, and tested fatal UTF-8 versus Windows-1252 decoding. It did not emit Bethesda strings or dumps.

No French/German catalogue, production overlay, runtime registration, UI/CSS, source dataset, dependency, persistence/schema, or tracked Bethesda-owned content was added. No Bethesda string-table content or game-file dump is part of this report or any tracked change.
