# Japanese Search, Typography, Layout, and Presentation Hardening Audit

## Executive summary

**Outcome B — targeted hardening required.** Japanese is functionally usable and the official name/terminology overlays are working, but the product still has a small number of concrete search, font, layout, and collation defects.

This audit records **14 findings**:

| Severity | Count |
| --- | ---: |
| BLOCKER | 0 |
| HIGH | 2 |
| MEDIUM | 6 |
| LOW | 5 |
| COSMETIC | 1 |
| **Total** | **14** |

The largest Japanese-specific usability issue is search: under `ja-JP`, the catalogue contains only the localized display name and abbreviation, so canonical English item names do not match. The largest cross-locale UI issue is the page-header/outpost-details breakpoint behavior: Japanese makes it conspicuous, but the underlying rigid grid and breakpoint discontinuity affect every locale.

Conclusions:

- Japanese search **should include canonical English aliases**, plus the existing localized display name and abbreviation, while continuing to submit one stable entity ID.
- Romanization is **not warranted**. There is no evidence that a romaji index would materially improve this product, and it would introduce a large, ambiguous alias surface.
- Font fallback **needs intervention**. No tofu appeared on the audited Windows runtime, but CJK rendering is an implicit generic-system fallback behind Latin-only display faces, producing a visible mixed-script weight/metric change and platform uncertainty.
- `+ Add Outpost` and `+ Add Cargo Link` should both use a locale-appropriate compact visual `+ Add` (`＋ 追加` in Japanese) in their strongly labelled sections, with their full localized action retained as `aria-label` and tooltip.
- `[INT]` should be replaced by a small inline SVG showing two star/nodes joined by a connector. `[I-S]` is the preferred interim text fallback. The full localized meaning must be exposed through an accessible name and tooltip.
- Composed-fauna U+0020 spacing should **remain unchanged**. The generated names are legible in the same component order already established by official data, and the prior evidence supports spaces. No first-party final dynamic string was available to prove the exact rendered separator byte.
- Locale-aware sorting is warranted **selectively**, not globally: localized alphabetical lists should use the existing `getCollator(locale)`, while spatial/domain ordering, body/orbit order, persisted outpost order, validation severity, and history chronology should remain fixed.
- The worst affected components are `PageHeader`/`CharacterHeader`, `OutpostDetails`, `CargoPadsEditor`, and `itemSearch`.
- There is **no blocker before implementation**. Creation Kit runtime confirmation of composed-fauna spacing remains a desirable release-hardening check, not a prerequisite for the focused fixes below.

## Audit method and evidence

The audit combined source inspection with the current local Japanese runtime at `ja-JP`.

Live checks covered:

- exact and partial Japanese item search;
- the requested English search terms while Japanese was active;
- locale switching among `en-US`, `en-GB`, and `ja-JP`;
- widths of 1440, 1280, 1100, 1050, 1024, 960, and 900 CSS pixels;
- the full expanded Planned Supply catalogue;
- the Resource Matrix, including long Japanese resource/product names and the X-Tech control;
- a Japanese validation panel with nine issues;
- the About dialog, locale selector, outpost navigation, body/biome controls, and a cargo list with three links.

At 1280 CSS pixels, switching from English to Japanese changed the page header from about 76.7 px to 145.1 px high and the cargo action row from about 31.5 px to 41.6 px. The layout updated immediately on each locale switch; no stale cached widths or measurements were found.

At 1100 CSS pixels, the document became about 54 px wider than its viewport. The direct owner was `.outpost-details__fields`: its five fixed/minimum columns extended the biome field to approximately x=1138.5 in a document with a 1085 px client width. At 1024 px, the media rule reduced both root font size and field minima, so the same overflow disappeared. This confirms a breakpoint discontinuity rather than a general mobile-layout failure.

The current saved test state contained two outposts and at most three cargo links. A destructive or persisted-data rewrite was deliberately avoided, so six-link and 24-outpost cases were completed as source/geometry stress analyses rather than by replacing the user's browser data. Six cargo rows remain vertically usable through the existing bounded `.cargo-pads__list`; 24 outposts remain unambiguous horizontally because names ellipsize with `title`, but the unbounded `.outpost-list__items` makes the page very tall (JPH-11).

Browser zoom commands could not be made observable in the in-app browser: the reported CSS viewport, device scale, root font size, and element metrics did not change. The 100% runtime is verified; 125% and 150% remain a manual follow-up for the eventual implementation slice. Width stress at the actual CSS breakpoints did run successfully.

## Search findings

| Area | CurrentBehavior | JapaneseIssue | RecommendedChange | Severity |
| --- | --- | --- | --- | --- |
| Resources and products (`src/ui/itemSearch.ts`) | Each entity has one localized `normalizedName` and one abbreviation. Matching supports exact name, exact abbreviation, localized prefix, abbreviation prefix, and localized substring. | **JPH-01.** `アルミニウム`, `アルミ`, and `順応型フレーム` match, but `Aluminum`, `Aluminium`, and `adaptive frame` return no result while Japanese is active. Users who know either the English game term or Japanese display term cannot reliably use one search box. Stable-ID submission itself is correct. | Build one entry per entity with multiple normalized aliases: localized display name, canonical English name, and narrowly defined locale alternates such as `Aluminium`. Rank aliases without duplicating visible results. | HIGH |
| Normalization (`normalizeItemSearchText`) | Trims, applies NFC, and uses locale-aware lowercase. Punctuation, whitespace inside the query, half-width/full-width kana, and hiragana/katakana remain distinct. | **JPH-02.** Latin case folding works and canonical composed characters are safe, but search is otherwise literal. A different dash/apostrophe or half-width kana will not match. Current item names contain little apostrophe risk, so this is bounded. | Keep NFC and locale case folding. Add whitespace collapsing and a conservative punctuation-variant fold only when backed by catalogue examples. Do not add broad kana transliteration or kanji reading expansion in the first slice. | LOW |
| Collision/disambiguation (`buildItemSearchCatalogue`) | Category disambiguation is calculated from localized name and abbreviation identities only. | **JPH-03.** Adding aliases later can create collisions that the current `needsCategoryDisambiguator` calculation will not see. | Compute collisions across every searchable alias while still returning one result record per stable `type:id`. Add alias-collision tests. | LOW |
| Search result ordering | Match tier, `Intl.Collator(locale)`, category, then stable ID. | Current localized tiebreaking is sound. Stable IDs remain deterministic and are what `onSubmit` receives. | Preserve the current stable-ID result contract and locale collator. | — |

### Requested query outcomes

| Query under `ja-JP` | Current outcome | Intended outcome |
| --- | --- | --- |
| `アルミニウム` | Exact match: Aluminum resource, stable ID `resource:aluminium` | Keep |
| `アルミ` | Prefix match: Aluminum resource | Keep |
| `Aluminum` | No match | Match `resource:aluminium` through canonical English alias |
| `Aluminium` | No match | Match the same stable resource through the established UK English alternate |
| `adaptive frame` | No match | Match `product:adaptive-frame` through canonical English alias |
| `順応型フレーム` | Exact match: Adaptive Frame, stable ID `product:adaptive-frame` | Keep |
| `al` / `AL` | Matches the `Al` abbreviation case-insensitively | Keep |

### Recommended search model

Use one search entry per stable entity:

```text
stable key: resource:aluminium
display name: アルミニウム
aliases:
  localized: アルミニウム
  abbreviation: Al
  canonical English: Aluminum
  locale alternate: Aluminium
submission: { type: resource, id: aluminium }
```

Recommended ranking:

1. exact localized display name;
2. exact abbreviation;
3. localized prefix;
4. localized substring;
5. exact canonical English alias;
6. canonical English prefix, then substring;
7. exact/prefix/substring of other explicit aliases;
8. exact stable textual ID only if a deliberate technical-ID search is desired.

Stable IDs should primarily remain identity/submission data rather than visible duplicate results. Romanization should not be added.

## Typography and layout findings

| Component | Issue | Cause | RecommendedChange | Severity |
| --- | --- | --- | --- | --- |
| Global font tokens (`src/index.css`) | **JPH-04.** Japanese renders without tofu in the audited Windows browser, including `ー`, `・`, `「」`, full-width punctuation, and mixed Latin/Japanese strings, but the actual CJK face is an implicit system fallback. Mixed rows visibly change weight and width between Barlow/IBM Plex Latin and Japanese glyphs. | `--ui-font` begins with Barlow Semi Condensed and Arial Narrow; `--ui-font-mono` begins with IBM Plex Mono. Neither imported web family supplies Japanese glyphs. The computed family list cannot identify which system face won per glyph. | Add an explicit Japanese UI stack and select it under `:lang(ja)`, for example Yu Gothic UI / Hiragino Sans / Noto Sans JP / Meiryo / system-ui. Keep Barlow for Latin branding or explicitly Latin-only headings. Do not ship font binaries. | MEDIUM |
| Validation context and mixed-script technical rows | **JPH-05.** Japanese outpost/pad context can inherit `--ui-font-mono`; Japanese is not actually monospaced by IBM Plex Mono and appears looser/lighter than adjacent Latin codes. | `.validation-summary-panel__context` and a few summary surfaces use the mono token for whole mixed-language strings. | Restrict mono styling to IDs, abbreviations, counts, and numeric codes. Use the Japanese UI face for human-language context, even when that context contains a technical ID. | LOW |
| Section headings and small labels | **JPH-06.** Uppercase transforms do nothing for Japanese while wide Latin-oriented letter spacing remains, making small Japanese labels look artificially sparse. | Reused `text-transform: uppercase` and `letter-spacing` rules assume condensed Latin capitals. | Under `:lang(ja)`, reduce tracking for Japanese UI headings/labels; preserve the Latin brand/title and technical codes. | COSMETIC |
| Page header / character fields (`PageHeader.css`, `CharacterHeader.css`) | **JPH-07.** Japanese makes the sticky header roughly twice as tall at 1280 px and about 213.5 px high at 1100 px. At 1100 px the main region is only about 269.5 px wide, causing character fields to stack into several rows; at the 1050 px breakpoint the main region suddenly spans the whole header and shrinks again. | The three-column page-header grid gives auto-sized action clusters priority until `max-width:1050px`; Japanese action labels are wider and the character field minima cannot compress. | Move the header wrap/span breakpoint upward based on measured content, or let the main region span before it becomes narrower than its meaningful field layout. Avoid locale-specific pixel values. | HIGH |
| Outpost location strip (`OutpostDetails.css`) | **JPH-08.** The page has horizontal overflow between approximately 1025 px and the point where the five-column minimum fits. At 1100 px the details strip exceeds its container by about 76 px and creates about 54 px document overflow. It paradoxically recovers at 1024 px. | Five column minima plus four gaps remain at the 18 px root size until the `max-width:1024px` rule abruptly reduces them. | Add an earlier container/media compression step: reduce gaps/minima, then allow the biome region to wrap or span. Preserve System/Body selector usability and the established field order. | MEDIUM |
| Cargo action row (`CargoPadsEditor.css`) | **JPH-09.** `＋ 貨物リンクを追加`, `すべて展開`, and `並べ替え` are all about 41.6 px high even at 1440 px because the right column remains 18 rem and Japanese can break between characters. The result looks like three unrelated two-line tiles. | Full labels, normal white-space, and a fixed narrow right column. | Shorten the contextual Add control; keep other labels on one line where practical and allow the action groups to wrap as groups rather than wrapping inside every button. | MEDIUM |
| Resource Matrix names (`OutpostStatusMatrix.css`) | **JPH-10.** Long names such as `オーステナイト・マニホールド` and `高抗張力スピドロイン` cannot be scanned in the 7.5 rem Item column and are ellipsized. The full name is generally available by title/accessibility text, so this is not loss of access. | The matrix intentionally protects a 38 rem semantic layout and uses `white-space: nowrap; text-overflow: ellipsis` for Item. | Retain matrix geometry and horizontal scrolling. Verify every ellipsized item/source receives a full accessible name/tooltip; modestly rebalance Item width only if it does not destabilize shared columns. | LOW |
| Outpost navigation (`OutpostList.css`) | **JPH-11.** A 24-outpost network remains horizontally clear because rows use ellipsis and `title`, but the list has no independent height bound/scroll and makes the page very tall. This is not Japanese-specific. | `.outpost-list__items` is an unbounded vertical list. Independent navigation scrolling is already deferred in `docs/BACKLOG.md`. | Do not fold independent scrolling into Japanese hardening. Retain ellipsis/title and test 24 names after future workspace scrolling work. | LOW |

### Controls and surfaces with no material Japanese defect

- Expanded Planned Supply is robust because visible cells use compact reference abbreviations, fixed equal sizes, per-section overflow, and full localized names in accessible labels/tooltips. Long Japanese names therefore do not resize the spatial grids.
- The Resource Matrix header compresses into its existing scoped horizontal scroller; semantic columns remain intact and Item stays sticky.
- Japanese validation messages wrap naturally in the 32 rem panel. The context line ellipsizes, but the actionable row still exposes the full issue text.
- System/body native selectors, biome buttons, locale selector, and About dialog remained readable in the audited runtime.
- Locale switching caused immediate reflow and did not leave stale palette measurements or cached widths.
- Cargo destination summaries use ellipsis and a full `title`; outbound/inbound items use abbreviations and wrap safely.

## Compact-control candidates

| Control | CurrentLabel | SuggestedVisualLabel | Tooltip/AccessibleLabel | CrossLocale? |
| --- | --- | --- | --- | --- |
| Outpost navigation Add | `+ Add Outpost` / `＋ 拠点を追加` | `+ Add` / `＋ 追加` | Tooltip and `aria-label`: full localized “Add Outpost” / `拠点を追加` | Yes. The `Outposts` section heading makes the object unambiguous. |
| Cargo Links Add | `+ Add Cargo Link` / `＋ 貨物リンクを追加` | `+ Add` / `＋ 追加` | Tooltip and `aria-label`: full localized “Add Cargo Link” / `貨物リンクを追加` | Yes. This is the strongest candidate because the current Japanese control wraps. |
| Inter-System marker | `[INT]` | Inline two-star/two-node connector SVG; interim `[I-S]` | Tooltip and accessible name: `Inter-System Cargo Link` / `星系間貨物リンク` | Yes. A symbol is localization-neutral; accessible text remains localized. |

Do not reduce either Add control to a bare `+` in the first slice. `+ Add` retains a visible verb, is still compact, and is clearer for keyboard and low-vision users. The current Add buttons have neither a tooltip nor an explicit accessible name; shortening must add both.

## Inter-System Cargo Link indicator

**JPH-12 (MEDIUM):** `[INT]` is a hard-coded, English-derived abbreviation in `CargoPadsEditor.tsx`. Its `title` contains the localized full term, but the visible text is not localization-neutral and there is no explicit `aria-label`. `[IS]` would be more ambiguous, while `[I.S.]` is denser visually without adding meaning.

Recommended option order:

1. **Small inline SVG: two four-point stars/nodes joined by a short connector.** It works in monochrome, does not require a font-icon package or image asset, is distinguishable from edit/delete controls, and communicates cross-system rather than merely “link”. Put the localized full meaning on the badge with `aria-label` and tooltip; mark the SVG itself `aria-hidden`.
2. **`[I-S]` as an interim/fallback.** It is the clearest requested text abbreviation and preserves the “between systems” relationship.
3. `[I.S.]` is acceptable but visually noisier at small size.
4. Styling alone is not recommended because it would rely too heavily on users learning a color/pattern distinction and would weaken non-color identification.

The internal `interstellar` discriminator must remain unchanged.

## Sorting and collation findings

| List | CurrentComparator | RecommendedComparator | LocaleSensitive? | Notes |
| --- | --- | --- | --- | --- |
| Item search results | Match tier, `Intl.Collator(locale)`, category, stable ID | Preserve; extend match tier to aliases | Yes | Already correct for localized tiebreaking. |
| Resource Matrix inorganic rows | Localized display name via `localeCompare(..., locale)`; explicit X-Tech last | Prefer shared `getCollator(locale)` but preserve X-Tech-last policy | Yes, with domain exception | Behavior is already locale-aware. |
| Resource Matrix organic rows | Fixed source-class order, then localized resource/species using `getCollator(locale)` | Preserve | Partly | Plant/herbivore/carnivore is domain order, not alphabetic. |
| Resource Matrix manufacturing | Localized product through `getCollator(locale)` | Preserve | Yes | Correct. |
| Manufacturing add selector | Localized `product.name` through current collator | Preserve | Yes | Correct because App supplies localized product objects. |
| Planned Supply inorganic families | Explicit `sortOrder`, then host-default `localeCompare` | Preserve explicit topology/order; use `getCollator(locale)` only for name fallbacks | Partly | Spatial/domain topology must not be reordered by locale. |
| Planned Supply organic/product rows and compact groups | Localized name through host-default `localeCompare` | `getCollator(locale).compare` | Yes | **JPH-14.** Currently inconsistent with the rest of the localized UI. |
| Cargo export candidates | Localized name through host-default `localeCompare` | `getCollator(locale).compare` | Yes | **JPH-14.** App supplies localized names, but the comparator does not receive the active locale. |
| System selector | Reference-data source order, effectively canonical English order | Sort selectable display records with `getCollator(locale)` and stable ID tie-breaker | Yes | **JPH-13.** Japanese labels are displayed in an English-derived order. Keep unresolved current IDs pinned only as recovery entries. |
| Body selector | Reference-data/source order within selected system | Preserve body/orbit/domain sequence; do not alphabetize blindly | No by default | Roman-numeral/orbit sequence is more useful than Japanese alphabetical order. |
| Biome buttons | Body-biome occurrence/index grouping | Preserve | No | Layout reflects body data and equal-signature grouping. |
| Species in organic rows | Source-class order, then locale collator | Preserve | Partly | Correct mixed domain/locale behavior. |
| Outpost navigation | Persisted user order | Preserve | No | Reordering is an explicit user action. |
| Import summaries | User outpost name via host-default `localeCompare` in `domain/logistics.ts` | Prefer persisted network order for spatial stability, or move a `getCollator(locale)` sort into presentation | Product decision | Part of **JPH-14**. Avoid adding locale into pure domain logic merely for display. |
| Validation issues | Severity, then rule/result order | Preserve | No | Severity is semantic, not alphabetical. Localized names inside messages already use locale collation where lists require it. |
| History | Timeline order | Preserve | No | Chronology must not be collated. |

**JPH-13 (MEDIUM):** the star-system selector displays Japanese names but retains source/canonical ordering. This is the clearest place to introduce Japanese collation.

**JPH-14 (MEDIUM):** Planned Supply name groups, cargo export candidates, and import-summary outpost names use host-default `localeCompare`, while nearby code already has the correct `getCollator(locale)` helper. This creates platform-dependent mixed-script ordering.

For mixed values such as `X-テック`, `He-3`, `H2O`, `Vytinium`, and `アルミニウム`, one global Japanese alphabetical order is not useful. Preserve domain topology and explicit placement for inorganic resources; preserve technical abbreviations inside cells; apply Japanese collation to genuinely alphabetical localized name lists only.

## Punctuation and composed-fauna spacing

The Japanese catalogue and live UI correctly rendered the prolonged sound mark, Japanese middle dot, corner quotes, full-width colon, Japanese parentheses, and mixed Latin/Japanese strings. The semantic catalogue generally uses Japanese punctuation appropriately.

Specific observations:

- Select placeholders use ASCII `...` (`星系を選択...`, `天体を選択...`, `製造品を選択...`). A later copy-polish pass may replace these with `…`, but this is not counted as a functional finding and should not trigger global punctuation normalization.
- Slash-separated cargo locators and bracketed counts are technical UI notation and remain readable. Do not replace them globally with Japanese prose punctuation.
- The validation middle-dot separator is legible and appropriately structural.
- Composed fauna use literal U+0020 between non-empty semantic components. The longest generated examples, such as `群れをなす スパイダーフライ スカベンジャー`, remain readable; the spaces make component boundaries clearer and do not look like accidental double spacing.

Local official data and the existing C6 audit establish the same prefix/species/diet order and component identities for English and Japanese. The local Creation Kit installation and authoritative plugins are available, but no stored first-party final string exists: the engine composes the display name dynamically. A trustworthy byte-exact confirmation would require an in-game/Creation Kit rendered-name capture or engine-level name-generation call. That was impractical without constructing or altering runtime state, so this audit relies on the established official component evidence plus current web-app rendering. **No separator change is warranted.**

## User-facing hard-coded strings

One actionable occurrence bypasses localization:

- `src/ui/components/CargoPadsEditor.tsx`: visible `[INT]` — covered by JPH-12.

Other source literals found are deliberate non-language content: the product name `Starfield Outpost Network`, symbols such as `×`, arrows/disclosure glyphs, `+`/`-`, and the empty-state em dash. The external attribution remains the credited proper title. No additional tracker-authored Japanese prose was found bypassing the localization catalogue.

## Tooltip and accessibility dependencies

| Visual element | Tooltip | `aria-label` / accessible name |
| --- | --- | --- |
| Outpost `+ Add` | Full localized Add Outpost action | Same full localized action |
| Cargo Link `+ Add` | Full localized Add Cargo Link action | Same full localized action |
| Inter-System SVG or `[I-S]` | Full localized `cargo.interstellar` text | Same full localized text on the badge; SVG hidden from accessibility tree |
| Ellipsized matrix item/source | Full localized reference name | Full localized name remains in DOM or explicit label |
| Ellipsized outpost/cargo destination | Full user-entered outpost name | Visible DOM text remains the accessible content; do not replace it with icon-only presentation |

`title` alone is not sufficient for the newly shortened Add controls or the Inter-System icon. They require an explicit accessible name.

## Implementation slices

| Slice | Scope | Dependencies | Risk | ExpectedFiles |
| --- | --- | --- | --- | --- |
| 1. Japanese search aliases | Multi-alias catalogue/index, ranking, normalization guardrails, collision handling, tests for all five requested query families | Existing reference-name overlays and stable IDs | Medium | `src/ui/itemSearch.ts`, possibly a narrow localization alias module, `tests/itemSearch.test.ts` |
| 2. Japanese font and typography fallback | Locale-specific UI font token, Latin-only brand/technical exceptions, mixed-language context cleanup | None; no font files | Low-medium | `src/index.css`, `TitleBar.css`, `ValidationSummary.css`, selected component CSS |
| 3. Compact controls and Inter-System indicator | Short visual Add labels with full accessible names; inline monochrome Inter-System SVG or `[I-S]` fallback | Localization keys for compact/common Add text | Low-medium | `OutpostList.tsx`, `CargoPadsEditor.tsx`, their CSS, locale catalogues, focused tests |
| 4. Header and location-strip layout hardening | Raise/derive page-header wrap threshold; add pre-1024 compression/wrap for five-column details; retest matrix/cargo alignment | Compact labels help but are not required | Medium | `PageHeader.css`, `CharacterHeader.css`, `OutpostDetails.css`, possibly `WorkspaceLayout.css` |
| 5. Targeted locale-aware collation | Shared collator in localized alphabetical Planned Supply/cargo/system lists; preserve topology, orbit, persisted, severity, and chronological order | Search slice may reuse alias/collator helpers | Medium | `PlannedSupplyEditor.tsx`, `CargoExportsEditor.tsx`, `OutpostDetails.tsx`, possibly presentation-side import summary code, tests |

### Regression boundaries

1. **Search aliases:** must not duplicate result rows, change visible localized names, change submitted `CargoItem` stable IDs, or make ambiguous free text resolve automatically.
2. **Fonts:** must not add font binaries, make startup depend on Japanese web-font download, replace technical Latin mono for abbreviations/IDs, or alter persisted data.
3. **Compact controls/indicator:** must preserve full localized accessible names, keyboard focus, disabled states, cargo semantics, and the internal `interstellar` discriminator; the marker must not rely on color alone.
4. **Layout:** must not introduce pane resizing, persisted layout state, mobile redesign, reordered matrix columns, or removal of the matrix's scoped horizontal scrolling.
5. **Collation:** must not reorder Planned Supply inorganic topology, X-Tech placement, body/orbit sequence, persisted outpost order, validation severity, or history chronology. Every comparator needs a stable tie-breaker where equal collation is possible.

## Final disposition

**Outcome B — targeted hardening required.**

Japanese is functionally correct enough to proceed in small slices. Dual-script search, explicit Japanese font fallback, two measured breakpoint corrections, compact cargo controls, replacement of `[INT]`, and selective locale-aware collation are the smallest coherent path. No schema, persistence, history, import/export, terminology-provenance, or domain changes are required.
