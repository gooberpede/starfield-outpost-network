# Cross-Locale Compact Copy and Visual State Review

## Audit record

- **Audit date:** 23 September 2026
- **Branch:** `staging`
- **Scope:** read-only review of compact copy, fixed/nowrap surfaces, qualitative
  Solar/Wind state, and cross-locale layout capacity across every runtime locale
- **Runtime locales:** `en-US`, `en-GB`, `fr-FR`, `de-DE`, `it-IT`, `ja-JP`,
  `pl-PL`, `pt-BR`, `zh-Hans`, and `es-ES`
- **Outcome:** targeted compact-copy, graphical-state, and layout work is
  justified, but no single remedy applies to every surface

This report is a design and implementation plan. It does not authorize or
contain catalogue, CSS, component, accessibility-runtime, test, reference-data,
backlog, architecture, or UX-document changes.

## Executive conclusion

The current pressure is not a general failure of translation. It comes from
four different causes that should remain separate:

1. Solar/Wind qualitative values are categorical state and are the best fit for
   a shared four-segment visual indicator with a full localized semantic label.
2. French and German Search placeholders are tracker-owned instructional
   microcopy and may be shortened naturally to `Rechercher…` and `Suchen…`
   while the existing full accessible instruction remains unchanged.
3. Polish Solar/Wind headings are compact source labels in English but full
   energy phrases in Polish. `Słońce` and `Wiatr` are credible compact
   source-label candidates; native editorial confirmation is required before
   adoption.
4. Resource Matrix headings expose both copy pressure and rigid geometry.
   There is not yet sufficient language evidence to approve shortened Matrix
   terms. The safe default is a controlled layout correction, with
   surface-specific compact nouns considered only after native review.

Official game names remain full official names. Canonical technical tokens
remain literal. Ellipsis is appropriate only where the full value is already
available through the element's semantic name or an equivalent discoverable
mechanism.

## Content taxonomy

| Class | Meaning | Default treatment in this product |
| --- | --- | --- |
| A. Official game terminology | Bethesda-authored terms and official localized entity names | Preserve the official localized form. Do not invent an alias merely to fit a compact surface. |
| B. Tracker-owned full semantic copy | Ordinary labels, instructions, and prose whose complete meaning matters | Translate naturally and correct layout if ordinary language does not fit. |
| C. Tracker-owned compact display copy | Surface-specific terse labels where English is already compact | Permit an idiomatic locale-specific noun, synonym, or conventional abbreviation; retain a separate full accessible meaning. |
| D. Graphical/state representation | A small finite state more legible as geometry than repeated localized words | Use non-color geometry plus a full localized accessible label and, where useful, tooltip. |
| E. Literal technical tokens | FormIDs, IDs, key chords, formula-like abbreviations, and canonical item abbreviations | Preserve the literal token; fix clipping through geometry or overflow treatment. |

The taxonomy is semantic, not visual. The same concept can have a full message,
a compact surface-specific display form, and an accessible description without
making any of those strings interchangeable globally.

## Method and evidence

The audit inspected the required repository documentation, all runtime
catalogues and official reference-name overlays, localization architecture,
relevant React/CSS surfaces, and current tests. It also revisited the earlier
[`CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md`](CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md)
and accessibility audits rather than treating their classifications as final.

A fresh local runtime fixture was measured in the Codex in-app Chromium browser
on Windows using explicit 1366×768 and 1600×900 CSS-pixel viewport overrides,
device pixel ratio 1, the current production font stack, real catalogues, and
generated reference overlays. Each locale was selected through the product UI.
DOM line boxes and rendered element geometry were measured after locale
settling. The fixture contained one outpost and otherwise retained normal
application defaults.

The browser's placeholder text is not a DOM text node. Search text-width values
therefore retain the earlier audit's current-browser probe: 196 px available,
256 px required in French, and 208 px required in German. The same earlier probe
measured the 75 px Solar/Wind output against each current `Very Poor` value.

This run does not claim a new true-200%-zoom result. The previous browser audit
found that browser shortcut zoom did not change the in-app browser's reported
viewport or device scale. Existing documented true-200% evidence remains valid
where available; the prior 683×384 CSS-pixel run remains explicitly a reflow
simulation, not true zoom.

Language research used current accepted catalogue wording and official or
professional sources. In particular:

- Polish government material uses the source nouns `słońce` and `wiatr`, the
  full energy phrases `energia słoneczna` / `energia wiatrowa`, and the
  technology terms `fotowoltaika` / `energetyka wiatrowa` in distinct senses:
  [Polish ecological education portal](https://www.gov.pl/web/edukacja-ekologiczna/odnawialne-zrodla-energii-czym-sa-i-co-nalezy-o-nich-wiedziec),
  [Polish government energy glossary](https://zpe.gov.pl/a/slownik-pojec-dla-e-materialu/DH4R2zp1u),
  and [Statistics Poland SDG report](https://raportsdg.stat.gov.pl/cel7.html).
- The official Polish wind-program site uses `uwarunkowania wiatrowe` for site
  conditions and distinguishes wind installations from photovoltaic
  installations: [Moja Elektrownia Wiatrowa](https://mojaelektrowniawiatrowa.gov.pl/).
- EU interfaces use the standalone search concepts `Rechercher` and `Suche` in
  compact navigation/search contexts: [French N-Lex interface](https://n-lex.europa.eu/n-lex/legis_po/digesto_form?lang=fr)
  and [German N-Lex help](https://n-lex.europa.eu/n-lex/help/help?lang=de).

No external source was used to override accepted Bethesda terminology or the
repository's official-name provenance.

## Surface inventory

| Surface | Taxonomy | Current capacity result | Recommended outcome |
| --- | --- | --- | --- |
| Solar/Wind headings | C | All locales fit on one line except Polish, whose two labels wrap to two lines | **A**, locale-specific Polish compact labels after native confirmation |
| Solar/Wind qualitative values | D | `Very Poor` exceeds the fixed 75 px output in French, German, Italian, Portuguese, and Spanish | **B**, shared four-segment qualitative indicator |
| Resource Matrix column headings | C/B | French, German, Italian, Polish, Portuguese, and Spanish reach a two-line header in at least one target width; Spanish reaches three lines at 1366 | **C** by default; **F** for unapproved compact-copy candidates |
| Search placeholder | C | French and German exceed the 196 px content capacity | **A**, locale-specific compact microcopy |
| Search result names | A/B | Long outpost/reference names intentionally ellipsize; full title/name remains available | **D**, retain intentional ellipsis |
| Search result state flags | B/C | Flags wrap as a group and remain fully written; no clipping was observed | **E**, no action |
| Planned Supply cells | E | `R-COOH` and `SiH3Cl` have 58 px rendered content in a 55 px client box | **C**, shared geometry correction; never rewrite the token |
| Planned Supply headings/disclosure | B | Full headings and compact disclosure remain available at target widths | **E**, no action |
| Cargo collapsed summaries | A/E | Official destination names ellipsize; item abbreviations wrap and expose full names through existing semantics/tooltips | **D**, retain current compact summary policy |
| Cargo badges/counters | E/B | `[count/limit]`, expand/collapse, and reshuffle controls remain operable | **E**, no action |
| Validation counter/status labels | B | Counter is compact but semantically complete; issue context uses intentional ellipsis | **D/E**, retain current treatment |
| Navigation counters and network ordinal | E | Numeric identities fit and are not localized prose | **E**, no action |
| Keyboard shortcut keycaps | E | Literal key tokens remain invariant and wrap as complete chords; accessible speech is localized separately | **E**, no action |
| Matrix state cells | E/D | Fixed state boxes use canonical abbreviations/geometry and full semantic names; no cross-locale prose is forced into them | **E**, no action to copy |
| Long system/body/biome/resource/product/species names | A | Ellipsis is common across Latin/Japanese catalogues but full names remain discoverable | **D**, retain intentional ellipsis |
| Locale selector | B/E | All options and the compact effective locale tag remain visible | **E**, no action |
| Dialogs and fixed passive indicators other than power | B | No compact-copy failure found in Help, About, or confirmation dialogs | **E**, no action |

Outcome codes in this report are: **A** locale-authored compact label, **B**
graphical/state representation, **C** layout/geometry correction, **D**
intentional ellipsis/tooltip remains appropriate, **E** no action, and **F**
more language evidence required.

## Cross-locale measurements

### Shared geometry

- Search input client width: **196 px** at both target viewports.
- Solar and Wind output client width: **75 px**.
- Solar and Wind heading column width: **77 px**.
- Planned Supply token client width: **55 px**; both `R-COOH` and `SiH3Cl`
  had **58 px** scroll width.
- No document-level horizontal overflow occurred at 1366×768 or 1600×900.
  Chromium reported 15 px of unused scrollbar-adjusted capacity rather than a
  positive overflow.

### Search and qualitative power labels

| Locale | Search placeholder result | `Very Poor` result in 75 px output |
| --- | --- | --- |
| English (US/UK) | Fits | Fits (`V.Poor`) |
| French | 256 px required; clips | 102 px required; clips (`Très mauvais`) |
| German | 208 px required; clips | 110 px required; clips (`Sehr schlecht`) |
| Italian | Fits | 102 px required; clips (`Molto scarso`) |
| Japanese | Fits | Fits (`極低`) |
| Polish | Fits | Fits (`B. słaba`) |
| Portuguese (Brazil) | Fits | 86 px required; clips (`Muito ruim`) |
| Simplified Chinese | Fits | Fits (`极差`) |
| Spanish (Spain) | Fits | 118 px required; clips (`Muy deficiente`) |

### Outpost Details headings

At both desktop viewports, all Solar/Wind headings except Polish rendered as one
line with an 18 px heading box. Polish rendered `Energia słoneczna` as two line
boxes of 49.4/68.3 px and `Energia wiatrowa` as 49.4/60.8 px inside the 77 px
column. Each heading box rose to approximately **24.5 px**, lowering both output
controls relative to the neighbouring System, Body, and Biomes fields.

This is intrinsically compactable because English and the other locales already
use source/technology labels rather than full explanatory phrases. It is not a
reason to replace the full Polish semantic phrase everywhere.

### Resource Matrix headings

| Locale | 1366×768 | 1600×900 | Material line behavior |
| --- | ---: | ---: | --- |
| English (US/UK) | 31.6 px, 1 line | 31.6 px, 1 line | All headings fit |
| French | 56.8 px, 2 lines | 56.8 px, 2 lines | `En production` wraps |
| German | 56.8 px, 2 lines | 56.8 px, 2 lines | `In Produktion` wraps; `Einsatzstoffe` is 101.2 px in the 85 px 1366 column and visually overpressures it |
| Italian | 56.8 px, 2 lines | 56.8 px, 2 lines | `In produzione` and, at 1366, `Materiali richiesti` wrap |
| Japanese | 31.6 px, 1 line | 31.6 px, 1 line | All headings fit |
| Polish | 56.8 px, 2 lines | 56.8 px, 2 lines | `Wymagane materiały` wraps at 1366; `W produkcji` remains near the fixed help-control threshold |
| Portuguese (Brazil) | 31.6 px, 1 line | 56.8 px, 2 lines | `Em produção` sits on a subpixel/help-icon threshold and wraps at 1600 despite the wider table; treat as unstable rather than a pass |
| Simplified Chinese | 31.6 px, 1 line | 31.6 px, 1 line | All headings fit |
| Spanish | 82.9 px, 3 lines | 56.8 px, 2 lines | `Materiales de entrada` uses three lines at 1366; `En producción` uses two |

The Matrix is not solved by one shorter translation. Producing headings share a
fixed 7 rem column with a help affordance, while the Inputs column changes from
about 85 px at 1366 to 185 px at 1600. The Portuguese threshold reversal shows
that exact line breaking is sensitive to fractional layout and font metrics.
The layout should therefore define a robust line-count and help-icon contract
instead of relying on incidental fit.

## Solar/Wind graphical-state recommendation

Adopt a shared, horizontal four-segment qualitative indicator as the leading
future design:

| Domain state | Visible geometry |
| --- | --- |
| Very Poor | 1 filled + 3 empty segments |
| Poor | 2 filled + 2 empty segments |
| Normal | 3 filled + 1 empty segment |
| Good | 4 filled segments |
| Wind None | 4 empty segments plus a structural `none` treatment |
| Unknown | An intact frame with an explicit unknown treatment, distinct from `None` |

Four segments are sufficient because the domain has exactly four ordered
non-null suitability buckets. More segments would imply precision the source
data and V1 product do not possess. A horizontal form fits the current 75 px
footprint and the rectilinear, passive, technical visual language better than a
vertical meter.

`None` must not be only an empty meter. Use the intact four-cell outline plus a
non-color structural cue such as a diagonal slash or hatch across the group.
`Unknown` needs a different structure, such as an outlined frame with a centred
unknown mark, so missing data cannot be mistaken for zero suitability or a
rendering failure. The exact marks require visual and forced-colors prototyping.

The indicator must not resemble throughput:

- show no number, percent, unit, multiplier, tick scale, or generator output;
- do not animate or respond like a live gauge;
- describe the value as qualitative suitability/efficiency in localized
  tooltip and accessible text;
- keep the same four categories already produced by domain logic;
- do not reuse the component for quantitative V2 power concepts without a new
  design review.

The accessible output remains equivalent to `Solar power: Poor` or
`Wind power: None`, localized as one semantic message. The visible graphic is
not the accessible name. Preserve the current screen-reader meaning and existing
keyboard discoverability until an equivalent non-focus-dependent help pattern
is verified; do not add an additional focus stop solely because the graphic has
a tooltip.

### Forced colors contract

- Meter frame and empty segment outlines use `CanvasText` or another relevant
  system foreground against `Canvas`.
- Filled segments use solid system foreground or `Highlight`; empty segments
  remain outlined, never opacity-only.
- `None` retains its slash/hatch/border structure after authored colors are
  overridden.
- `Unknown` retains a separate structural mark.
- Focus, if retained by the existing output contract, uses a system-color
  outline outside the meter.
- Segment count and structural marks communicate state without hue.

The candidate passes the conceptual accessibility test, but implementation
must stop if forced-colors prototyping cannot reliably distinguish `None`, Very
Poor, and Unknown.

## Solar/Wind heading terminology

Polish professional usage distinguishes three concepts:

| Concept | Natural Polish examples | Fit for this surface |
| --- | --- | --- |
| Technology | `fotowoltaika`, `energetyka wiatrowa` | Too technology-specific or too long; the UI describes body suitability, not the installation itself |
| Energy source | `słońce`, `wiatr`, `energia słoneczna`, `energia wiatrowa` | Best semantic family |
| Conditions/suitability | `nasłonecznienie`, `uwarunkowania wiatrowe` | Accurate in analytical prose but too specialized/long for paired 77 px headings |

Recommended visible candidates are **`Słońce`** and **`Wiatr`**, classified as
compact source-label nouns. They are not abbreviations and they preserve the
same source-level contrast as English `Solar` / `Wind`. Retain the accepted full
phrases `Energia słoneczna` and `Energia wiatrowa` in accessible names and help
or tooltip text.

Confidence is medium: the source nouns are evidence-backed, but whether
`Słońce` is the preferred compact technical label beside a suitability meter is
a product-language judgement. A Polish native editor should confirm the pair.
Do not substitute `PV`, `Fotowoltaika`, or `Solarna` without separate evidence.

No other locale needs a heading change on present evidence.

## Resource Matrix strategy

The six headings describe tracker semantics, not Bethesda names. Their full
meanings remain:

- **Present:** the item/resource exists at the selected body/outpost;
- **Producing:** this outpost is actively producing it;
- **Inputs:** required recipe or farming materials;
- **Logistics:** actual configured routed import/export state.

The currently accepted translations preserve those meanings. Shortening them
blindly risks changing state into action (`produce`), inputs into arbitrary data,
or configured logistics into generic transport.

Recommended treatment:

1. Define a layout that can reliably hold two ordinary heading lines and the
   help control without overlap, height jitter, or a three-line Spanish cell.
2. Rebalance the smallest Inputs column at the 1366 layout or explicitly give
   long input labels a controlled two-line area.
3. After native review, optionally introduce surface-specific compact display
   nouns for the Producing column where that materially reduces height.
4. Keep full current phrases as the accessible column names even if a compact
   visible noun is later approved.

Possible Producing nouns—`Production`, `Produktion`, `Produzione`, `Produkcja`,
`Produção`, and `Producción`—are model suggestions, not approved copy. They may
name the activity without explicitly encoding “active here.” Their use depends
on the toggle/state context being sufficient to preserve the current meaning.
French, German, Italian, Polish, Portuguese, and Spanish native/editorial review
is required.

No compact Inputs replacement is approved. `Materiali`, `Materiały`, or
`Materiales` would lose “required”; German `Input`/`Bedarf` and Spanish
`Entradas` are potentially ambiguous. Prefer geometry unless a native editor
supplies and approves a precise terse form.

## Search placeholder strategy

The input already has a full localized accessible label that says the search is
for resources or products in the user's outposts. The placeholder can therefore
be contextual microcopy rather than duplicating the whole instruction.

- French visible candidate: **`Rechercher…`**
- German visible candidate: **`Suchen…`**

Both are conventional standalone search actions, fit comfortably within the
current field, and avoid font shrinking. Keep the full current accessible labels
unchanged. A localized tooltip is unnecessary because the accessible label and
surrounding Resource Matrix context already carry the domain; if a tooltip is
used, it should contain the full localized instruction.

Other locales' current placeholders fit and should not be changed merely for
uniformity. French editorial confirmation is advisable but not a stop condition;
German editorial confirmation should verify the infinitive preference in this
product's UI voice.

## Official names and terminology policy

System, body, biome, resource, product, species, skill, Cargo Link, and
Inter-System terminology must continue through the existing official evidence
and reference-overlay paths. Do not add unofficial short aliases to visible
catalogue data to solve a layout constraint.

Intentional single-line ellipsis remains appropriate for long official names
when all of the following hold:

- the control remains operable;
- the full localized name is its accessible name or otherwise exposed in the
  existing semantic content;
- a sighted pointer user can discover the full name where a tooltip is already
  part of the established pattern;
- truncation does not create ambiguous destructive choices.

If those conditions fail, change geometry. Do not change the official name.

## Technical-token policy

`R-COOH` and `SiH3Cl` are canonical visible tokens. The live measurement
confirms each loses approximately 3 px in the current 55 px Planned Supply cell.
The correct remedy is a small shared cell-width/padding/font-metric geometry
correction or a deliberate overflow presentation that displays the whole token.
Do not localize, abbreviate, insert discretionary punctuation, or replace them
with translated product names.

The same invariant policy applies to FormIDs, stable IDs, reference
abbreviations, network counters, and keycap tokens. Full localized names remain
available through the control's accessible name/title where the token is a
compact identity proxy.

## Compact-copy candidate register

| Surface | Locale | Full semantic label | Current visible form | Strategy | Candidate | Full accessible fallback | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Solar heading | Polish | `Energia słoneczna` | Same, two lines | A, locale-specific | `Słońce` | `Energia słoneczna` in the complete Solar semantic message | Medium; evidence-backed noun, native confirmation pending |
| Wind heading | Polish | `Energia wiatrowa` | Same, two lines | A, locale-specific | `Wiatr` | `Energia wiatrowa` in the complete Wind semantic message | Medium; evidence-backed noun, native confirmation pending |
| Solar/Wind value | All | Full localized quality state | Locale text in 75 px output | B, shared | Four-segment qualitative meter | Full localized source + state, for example `Solar power: Poor` | High concept confidence; visual/forced-colors prototype required |
| Search placeholder | French | Search resources or products | `Rechercher des ressources ou des produits` | A, locale-specific | `Rechercher…` | Existing full French `search.input.label` | High; conventional search action, editorial check advisable |
| Search placeholder | German | Search resources or products | `Ressourcen oder Produkte suchen` | A, locale-specific | `Suchen…` | Existing full German `search.input.label` | High; conventional search action, editorial check advisable |
| Matrix Producing | French | Active production at this outpost | `En production` | F pending; otherwise C | `Production` (model suggestion) | Current full `En production` plus full help semantics | Low until native/editorial review |
| Matrix Producing | German | Active production at this outpost | `In Produktion` | F pending; otherwise C | `Produktion` (model suggestion) | Current full `In Produktion` plus full help semantics | Low until native/editorial review |
| Matrix Producing | Italian | Active production at this outpost | `In produzione` | F pending; otherwise C | `Produzione` (model suggestion) | Current full `In produzione` plus full help semantics | Low until native/editorial review |
| Matrix Producing | Polish | Active production at this outpost | `W produkcji` | F pending; otherwise C | `Produkcja` (model suggestion) | Current full `W produkcji` plus full help semantics | Low until native/editorial review |
| Matrix Producing | Portuguese (Brazil) | Active production at this outpost | `Em produção` | F pending; otherwise C | `Produção` (model suggestion) | Current full `Em produção` plus full help semantics | Low until native/editorial review |
| Matrix Producing | Spanish | Active production at this outpost | `En producción` | F pending; otherwise C | `Producción` (model suggestion) | Current full `En producción` plus full help semantics | Low until native/editorial review |
| Matrix Inputs | German/Italian/Polish/Spanish | Required materials/recipe inputs | Current full translations | C, surface-specific | No compact form approved | Current full header and help meaning | High that geometry is safer; language candidate unresolved |
| Planned Supply token | All | Canonical technical identity | `R-COOH`, `SiH3Cl` | C, shared | Preserve literal token; widen/rebalance cell | Existing full localized item name | High |

No row with low confidence should become implementation copy without the named
review. Omitting a speculative candidate is preferable to filling a catalogue
with mechanically shortened strings.

## Accessibility contract

### Compact labels

- A compact visible label and full semantic label are intentionally separate.
- The full localized meaning must be used for the accessible name where the
  compact form is not independently complete.
- Tooltips/help, when present, use the full localized phrase rather than the
  compact form.
- Compact forms must be understandable in their immediate visual context and
  must not depend on memorizing undocumented abbreviations.
- The compact key must never leak into full prose, validation, history, or help.

### Graphical states

- A full localized accessible name/description carries source and state.
- Segment count and structural marks, not hue alone, encode state.
- `None`, Very Poor, and Unknown remain distinct in forced colors.
- The passive indicator does not acquire extra keyboard behavior. Preserve the
  current focus/tooltip discoverability until an equivalent tested mechanism
  replaces it.
- Existing screen-reader semantics must not be removed.

### Ellipsis

Native `title` alone is not sufficient for essential meaning. Ellipsis is
acceptable here only where the element already carries the full accessible name
or associated semantic content. An implementation follow-up should recheck each
affected official-name control, not assume every tooltip pattern is equivalent.

## Recommended localization architecture

Use the smallest extension to the current semantic catalogue:

1. Add optional, **surface-specific compact keys** only for approved cases. Do
   not create a universal automatic abbreviation layer.
2. Keep the existing full key authoritative. A compact lookup falls back to the
   full key when a locale has no approved compact override.
3. Render the compact key only in the named surface. Accessible names,
   descriptions, help, tooltips, history, validation, and prose use the full key.
4. Centralize the fallback in one small localization helper or structured
   descriptor rather than open-coding `compact ?? full` in components.
5. Do not require every locale to define every compact key. Completeness means
   every compact use has a deterministic full fallback, not artificial parity of
   speculative abbreviations.
6. Model Solar/Wind as one graphical component receiving the existing domain
   bucket and full semantic message. Do not put rendered segment counts or
   numeric output in localization data.

The existing catalogue/key-union design can support this without broad
localization refactoring. If implementation reveals that optional keys require
weakening current exact-key guarantees across all messages, stop and design a
narrow explicit compact-message registry instead.

## Future test strategy

- Unit-test compact lookup: approved override, absent override, and fallback to
  the full semantic key.
- Assert that a compact key is usable only by its intended surface and never by
  validation, history, prose, or tooltip generation.
- Assert every compact-rendering control exposes its full localized accessible
  meaning in all ten locales.
- Test the exact meter mapping: none/very-poor/poor/normal/good/unknown.
- Test that `None`, Very Poor, and Unknown have different structural attributes,
  not merely different classes or colors.
- Add forced-colors component/browser snapshots or computed-style contracts
  using system colors and visible borders.
- Test French/German Search compact placeholder with unchanged full accessible
  label.
- Add browser layout assertions at 1366×768 and 1600×900 for Matrix maximum line
  count, help-icon non-overlap, Polish heading alignment, complete technical
  tokens, and no document overflow.
- Retain true 200% manual browser zoom and Windows High Contrast checks; do not
  relabel a CSS viewport simulation as true zoom.
- Test full-name availability wherever official names are ellipsized.

Automated layout checks are regression aids, not proof across all browser/font
stacks.

## Native/editorial review boundary

| Locale | Review needed | Status |
| --- | --- | --- |
| Polish | Confirm `Słońce` / `Wiatr`; assess `Produkcja` only if Matrix compact copy proceeds | Heading nouns evidence-backed; product-context preference pending |
| German | Confirm `Suchen…`; assess `Produktion`; do not shorten `Einsatzstoffe` without a precise replacement | Search strong; Matrix pending |
| French | Confirm `Rechercher…`; assess `Production` in a state column | Search strong; Matrix pending |
| Italian | Assess `Produzione`; no approved short Inputs term | Pending |
| Spanish | Assess `Producción`; find a precise shorter Inputs term or retain layout solution | Pending |
| Portuguese (Brazil) | Assess `Produção`; review qualitative terminology only if textual values are retained as fallback | Pending |
| Japanese | Confirm no special compact keys are desired; current terse forms fit | Low-risk editorial smoke check |
| Simplified Chinese | Confirm no special compact keys are desired; current terse forms fit | Low-risk editorial smoke check |

English (US/UK) current compact wording fits and remains the semantic baseline,
but its abbreviations must not be treated as templates for other languages.

## Recommended implementation sequence

1. Add the narrow optional compact/full catalogue mechanism and its semantic
   fallback tests.
2. Prototype and accessibility-test the shared Solar/Wind segmented indicator,
   including forced colors and the `None`/Unknown distinction.
3. Obtain native approval and add only the accepted Polish headings and
   French/German Search compact strings.
4. Correct Matrix heading geometry; add compact Producing nouns only where
   editorial approval shows they preserve active-state meaning.
5. Correct Planned Supply technical-token capacity and recheck official-name
   ellipsis contracts.
6. Reconcile accepted decisions into backlog/UX documentation in the later
   implementation batch, not as part of this audit.

This order keeps architecture small, tests the highest-value shared graphic
before multiplying copy variants, and does not block safe geometry work on weak
language evidence.

## Limitations and stop conditions

- Browser measurements describe Chromium on the current Windows/font stack,
  not every platform.
- This run did not add new true-200%-zoom, Safari/WebKit, touchscreen, Narrator,
  or live Windows forced-colors evidence.
- Candidate fit was not treated as semantic approval.
- Polish source nouns are supported by professional usage, but their exact UI
  pairing remains a native editorial decision.
- Matrix compact nouns are suggestions only. Stop before implementing them if
  native review finds loss of active-state meaning.
- Stop the meter implementation if `None`, Very Poor, and Unknown cannot remain
  structurally distinct in forced colors.
- Stop and retain full official terms if a proposed compact form would create an
  unofficial Bethesda alias.
- Stop architectural work if optional compact variants would require broad
  weakening of the current semantic-catalogue contract.

## Final per-surface plan

- **Solar/Wind values:** B, shared graphical qualitative state.
- **Polish Solar/Wind headings:** A after native confirmation; otherwise C to
  align a controlled two-line heading row.
- **Matrix headings:** C shared geometry first; F for locale-specific compact
  nouns until editorial approval.
- **French/German Search:** A, locale-specific compact placeholder with full
  accessible instruction.
- **Official long names:** D, intentional ellipsis with full semantics; geometry
  if meaning or safe operation is lost.
- **Planned Supply technical tokens:** C, shared geometry; literal token remains.
- **Cargo summaries, status/validation, navigation counters, keycaps, compact
  Matrix states, selector, and dialogs:** D or E as inventoried; no copy change.
