# Resource/Product Control Geometry Review

## Disposition

**GEO-A — Current differences are justified; no pre-release change is
recommended.**

The three surfaces do not share one layout job. The Resource Matrix uses a
compact fixed token inside aligned table tracks; Planned Supply uses a taller
spatial catalogue and compact summary with two deliberate family widths; Cargo
uses the narrowest controls in a fixed 18rem workspace column. At 100% zoom,
the longest catalogue tokens press or exceed the nominal content box but their
glyphs remain complete inside the border box. Cargo has the least slack.

No current token was observed to become ambiguous or visibly lose a glyph in
the measured normal-color states. The obvious Cargo widening would change its
1600px row capacity from five controls to four, so it does not meet the brief's
standard for a narrow, low-risk pre-release correction. A forced-colors manual
check remains worthwhile because Cargo's selected/stale border grows from 1px
to 2px and leaves essentially no horizontal glyph slack.

Primary recommendation: retain the current geometry for release. Post-release,
evaluate **H4 (semantic-family harmonization)** only if a real forced-colors or
browser/font combination demonstrates glyph loss. Height-only harmonization is
technically possible but has no evidence-based pre-release benefit.

## Baseline and evidence limits

| Item | Baseline |
| --- | --- |
| Branch | `staging` |
| Commit | `c39bd43e588a55c55864d02bf1da1f037126ac41` |
| Starting tracked state | Clean; no tracked modifications |
| Starting untracked state | `docs/implementation-briefs/CODEX_AUDIT_BRIEF_resource-product-control-geometry.md` (user-supplied brief) |
| OS | Windows |
| Browser | Codex in-app Chromium; exact Chromium version was not exposed |
| Fonts | `document.fonts.status === "loaded"`; IBM Plex Mono was computed on every audited token |

Repository guidance read: `AGENTS.md`, `docs/UX-DESIGN.md`,
`docs/BACKLOG.md`, and `docs/audits/RELEASE-READINESS-REVIEW.md`.
Relevant prior evidence included the 1366px layout review, cross-locale compact
layout review, fixed-chrome/focus review, and Resource Matrix heading review.
The earlier compact-layout audit's approximately 3px Planned Supply pressure
was reproduced.

Rendered measurements used the existing local application and mature `pl-PL`
browser data. Exact CSS viewport overrides were measured at 1366x768 and
1600x900 at the browser's unchanged 100% zoom (`devicePixelRatio: 1`). The
browser did not respond to zoom shortcuts, consistent with the earlier
fixed-chrome audit, so **true 200% browser zoom was not available**. A 683x384
CSS-pixel viewport was inspected only as a reflow proxy and is not presented as
proof of true zoom. Forced colors were inactive and could not be enabled by the
available browser controls; forced-colors findings below are source-derived,
not a claimed Windows High Contrast rendering pass.

The browser interactions changed only presentation state (Planned Supply and
one Cargo card were temporarily expanded, focus/scroll moved, and the viewport
was overridden). Both disclosures and the viewport override were restored.
No persisted control was toggled.

## Source inventory

### Resource Matrix

`OutpostStatusMatrix.tsx` renders both `ReadOnlyState` spans and
`EditableState` buttons with `.outpost-status-matrix__state`; editable buttons
also receive `.outpost-status-matrix__state--editable`. The shared geometry is
owned by `OutpostStatusMatrix.css`.

The population includes inorganic and organic resource presence/production,
manufactured-product production, recipe inputs (resources or products), and
imported logistics items. Editable and passive/read-only controls intentionally
share dimensions. Lit, dimmed, producing, not-producing, pressed, and disabled
states change paint rather than ordinary geometry.

The surrounding matrix uses a shared six-track template, a 38rem hard table
minimum, a local horizontal scroller, wrapping state lists, and responsive cell
padding below a 41rem container width. The token itself has no responsive size
override.

### Planned Supply

`PlannedSupplyEditor.tsx` renders expanded catalogue and collapsed-summary
buttons with `.planned-supply__item`; the compact form adds
`.planned-supply__compact-item` but no geometry override. Geometry is owned by
`PlannedSupplyEditor.css` through custom properties.

The compact list, inorganic special strip, and inorganic families use 3.15rem.
Organic resources and manufactured products override the width to 3.35rem.
All variants use the same 2.15rem height. Neither, planned, and available
states retain those dimensions; planned changes weight from 500 to 600 and
available uses a dashed border/pattern/opacity.

The catalogue owns local horizontal overflow. Inorganic families preserve
semantic topology and five fixed-height rows. Organic and product grids form a
two-column max-content pair above 50rem and stack at or below 50rem. These
relationships explain why width differences are family-local rather than a
single accidental global size.

### Cargo exports

`CargoExportsEditor.tsx` renders the available plus already-exported resource
and product population as `.cargo-exports__item`. Stale selected items remain
visible. `CargoPadEditor.css` owns the token geometry and wrapping group;
`CargoPadEditor.tsx` supplies the expanded-card context. `CargoPadsEditor.tsx`
and `CargoPadsEditor.css` own the collection/card shell but do not override
export-token dimensions.

Resources and products share one geometry. Neutral, pressed, and stale states
retain ordinary dimensions. The group is a flex row with wrapping and a 0.2rem
gap. The workspace reserves Cargo a fixed 18rem (324px at the desktop
baselines); an expanded card's body padding left 263.6px for its first export
group at 1366px and 273.6px at 1600px in the inspected data.

## Geometry comparison matrix

All listed sizes use `box-sizing: border-box`, IBM Plex Mono, `white-space:
nowrap`, and `overflow: hidden`. Ordinary borders are 1px. There are no token
size container-query or media-query overrides; the root font changes from 18px
to 16px at a viewport width of 1024px or less.

| Surface | Control/state | Width | Height | Padding | Font | Overflow / focus | Notes |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| Matrix | Editable neutral/pressed/disabled | 3.2rem | 1.55rem | 0.15rem 0.25rem | 500 0.74rem/1 | hidden; outer 2px outline at +2px | Pressed paint changes only |
| Matrix | Passive lit/dimmed/producing/not-producing | 3.2rem | 1.55rem | 0.15rem 0.25rem | 500 0.74rem/1 | hidden; outer 2px outline at +2px | Same geometry as editable |
| Planned Supply | Compact, inorganic special/family; neither/available/planned | 3.15rem | 2.15rem | 0.15rem 0.25rem | 500 0.76rem/1; planned 600 | hidden + `clip`; inset 2px focus outline at -2px | Compact is selected/planned but not a smaller shape |
| Planned Supply | Organic; all states | 3.35rem | 2.15rem | 0.15rem 0.25rem | same | same | Equal within the organic grid |
| Planned Supply | Product; all states | 3.35rem | 2.15rem | 0.15rem 0.25rem | same | same | Equal within the product grid |
| Cargo | Resource/product neutral/pressed | 2.8rem | 1.65rem | 0.1rem 0.2rem | 500 0.72rem/1 | hidden; outer 2px outline at +2px | Shared resource/product geometry |
| Cargo | Stale selected | 2.8rem | 1.65rem | 0.1rem 0.2rem | same | same | Warning paint/opacity only at normal colors |

The Matrix `.outpost-status-matrix__compact-action` and manufacturing remove
button are not resource/product tokens and were excluded. Cargo summaries show
short names as plain text rather than token controls; they wrap with
`overflow-wrap: anywhere` and are recorded as a separate presentation, not as
another button geometry.

## Rendered measurement

### 1366x768, 100% zoom, fonts loaded

| Surface | Border box | Client box | Computed font / line | Approx. six-glyph width | Horizontal result |
| --- | ---: | ---: | --- | ---: | --- |
| Matrix | 57.59 x 27.89px | 56 x 26px | 13.32 / 13.32px | about 48px | Glyphs fit; about 8px combined inner-border slack, although nominal content width is slightly exceeded |
| Planned 3.15rem | 56.69 x 38.69px | 55 x 37px | 13.68 / 13.68px | about 49px | Glyphs fit; about 5.5px combined inner-border slack; scroll width reports 58px |
| Planned 3.35rem | 60.30 x 38.69px | 58 x 37px | 13.68 / 13.68px | about 49px | Comfortable relative to the six-glyph resources; products are only three glyphs |
| Cargo | 50.39 x 29.69px | 48 x 28px | 12.96 / 12.96px | about 46.7px | Complete but visually pressed; under 2px combined inner-border slack; scroll width reports 54px |

The six-glyph estimates are supported by the monospaced computed font and by
the measured scroll-width delta (text plus declared padding). `R-COOH` was
visually complete in a lit Matrix token, available and planned Planned Supply
states, and neutral Cargo state. `SiH3Cl` was visually complete in planned
Planned Supply and neutral Cargo states. Cargo was the only surface where the
glyphs appeared close enough to the border to weaken the intended padding.

The Matrix viewport/table measured 692.5px/692.5px (693px integral scroll
width). Planned Supply's container measured 692.5px and its overflow viewport
665.5px. Cargo retained a 324px column, 285.2px expanded card/body, and 263.6px
export group.

### 1600x900, 100% zoom, fonts loaded

Token pixel dimensions were unchanged because the root remained 18px. The
Matrix viewport grew to 865px without horizontal overflow. Planned Supply's
container grew to 865px and its organic/product pair occupied 838px.

Cargo deliberately remained a 324px workspace track. Its inspected export
group grew only to 273.6px and placed eleven controls in rows of 5, 5, and 1.
At 1366px the 263.6px group placed the same controls in rows of 4, 4, and 3.
This is the decisive constraint on an otherwise attractive Cargo widening.

### 683x384 CSS-pixel reflow proxy (not true 200% zoom)

The root switched to 16px. Rendered border boxes became 51.19 x 24.80px
(Matrix), 50.39 x 34.39px (3.15rem Planned), and 44.80 x 26.39px (Cargo).
The Matrix correctly used its 608px hard table width inside a 377.1px local
scroller; the workspace stacked to one 377.1px content column. Token fit was
proportionally unchanged and Cargo remained tightest.

True 200% zoom still requires a manual browser pass. The proxy establishes
responsive routing but does not establish browser-zoom rasterization, focus
painting, or device-pixel clipping.

## Catalogue token results

The exact tracker catalogue contains two longest resource abbreviations:
`R-COOH` (Carboxylic Acids) and `SiH3Cl` (Chlorosilanes), each six characters
and equal-width in IBM Plex Mono. `R-COOH` is also the longest
punctuation-heavy token. The next longest resource abbreviations are `C6Hn`,
`He-3`, and `HnCn` at four characters. Every manufactured-product
abbreviation is three characters; there is therefore a many-way tie for
longest product token (representatives include `AFr`, `ADR`, `NFR`, `VFR`, and
`ZGG`).

| Token | Matrix | Planned 3.15rem | Planned 3.35rem | Cargo | Accessible/full-name exposure |
| --- | --- | --- | --- | --- | --- |
| `R-COOH` | Complete; slight content-box pressure | Complete; content-box pressure, available and planned checked | Not used for current wider family | Complete but presses border envelope | Full title and accessible state/name in Matrix; title + full aria-label in Planned; full title + toggle aria-label in Cargo |
| `SiH3Cl` | Same geometry when present | Complete; content-box pressure, planned checked | Not used for current wider family | Complete but presses border envelope | Same full-name pattern |
| Four-glyph resources | Fit | Fit | Fit | Fit with more slack | Full names exposed |
| Three-glyph products | Fit | Not applicable to current product grid | Fit comfortably | Fit | Full names exposed |

Nominal content-box overflow is not the same as visible clipping here. Text is
centered and can paint through the padding area before reaching the hidden
overflow edge. The 100% screenshot and border-box measurements showed complete
glyphs. Accessible full names are useful but were not used to excuse clipping;
visible completeness was assessed separately.

## Width and height analysis

### Width

- **Matrix:** 3.2rem is compatible with 6rem minimum state tracks and wrapping
  state lists. Increasing to 3.35rem would not change the six-track definition,
  but could move a wrap threshold inside Inputs/Logistics and would alter the
  already accepted dense body geometry without fixing visible loss.
- **Planned Supply:** 3.15rem is part of the inorganic family pitch and special
  strip; 3.35rem is intentional for the independent organic/product grids.
  A wider inorganic width multiplies across family topology and local overflow.
  The existing pair already switches from two columns at 1600px to one at
  1366px.
- **Cargo:** 2.8rem preserves four controls per row at 1366px and five at
  1600px in the inspected group. A simple change to 3.2rem would keep four at
  1366px but reduce 1600px capacity to four, adding a row for the eleven-item
  group. Cargo's narrowness is therefore constrained, not merely cosmetic
  drift.

Horizontal width is the dominant token-fit constraint. The limiting case is
Cargo, not the taller Planned Supply catalogue.

### Height

- Matrix: 27.89px border box versus a 13.32px line box, centered by flex.
  Vertical padding is 2.7px per side; no crowding was observed.
- Planned Supply: 38.69px border box versus a 13.68px line box and 2.7px
  declared top/bottom padding. It has substantially more unused vertical space
  because height participates in the catalogue's five-row spatial rhythm.
- Cargo: 29.69px border box versus a 12.96px line box and 1.8px declared
  top/bottom padding. It is not vertically cramped.

A shared 1.65rem height would be content-feasible: it would add about 1.8px to
Matrix, leave Cargo unchanged, and remove 9px from each Planned Supply cell at
the 18px root. Across five catalogue rows that removes about 45px before gaps.
That is a real visual-grammar change, not a required fit fix. Conversely,
raising Matrix and Cargo to Planned Supply's 2.15rem would spend vertical space
without improving horizontal fit. The fact that vertical space is less scarce
does not by itself justify either change.

## State and accessibility interactions

Ordinary selected/pressed/available/stale/disabled states do not change width,
height, or border width. Planned changes to font weight 600, but IBM Plex Mono
retains its monospaced advance and the selected six-glyph measurement matched
the available measurement. Opacity and background patterns do not change the
text envelope.

Focus behavior differs intentionally:

- Matrix uses a 2px outline with +2px offset, outside the control.
- Planned Supply uses a 2px outline with -2px offset. It does not affect layout,
  but paints inside the tile; the six-glyph inorganic controls retain enough
  border-box room at 100% for the glyphs to remain distinguishable.
- Cargo uses a 2px outline with +2px offset, outside the control.

In source-defined forced colors:

- Matrix lit/pressed/producing states receive a 3px double border. At the fixed
  3.2rem width, the six-glyph token still has roughly 3.5px combined space
  between glyph envelope and inner border.
- Planned planned/available states receive a 2px border. A 3.15rem six-glyph
  tile retains roughly 3.5px combined inner-border slack, before considering
  the inset focus paint.
- Cargo pressed and stale states receive a 2px border. A six-glyph token's
  estimated glyph width is approximately equal to or fractionally wider than
  the resulting 46.4px inner border box. This is the one credible
  state-specific clipping risk and requires a real High Contrast check.

Every primary token surface exposes the full item name through `title` and/or
an accessible name. Matrix read-only states expose active/inactive meaning and
full item names; editable states expose full action labels. Planned Supply uses
full-name `title` and `aria-label`, keeps available items inspectable with
`aria-disabled`, and exposes pressed state. Cargo exposes a full toggle label,
title, pressed state, and an additional stale description. Selected/available/
stale semantics use borders, patterns, opacity, pressed state, or text—not color
alone—and explicit forced-colors rules are present.

## Harmonization options

| Option | Assessment |
| --- | --- |
| H0 — keep all geometries | **Recommended for pre-release.** No visible normal-state glyph loss; dimensions serve different layout roles. |
| H1 — local Cargo fix | Not justified yet. Cargo is the tight outlier, but a straightforward widening changes established row wrapping. Reconsider only if real forced-colors testing confirms loss. |
| H2 — harmonize height only | Content-feasible around 1.65rem, but it would substantially compress Planned Supply's spatial catalogue and does not address the dominant width pressure. Defer. |
| H3 — harmonize width and height | Rejected. A common 3.35rem width protects all tokens but needlessly widens Matrix, reduces Cargo density, and changes Planned inorganic pitch; a common height either bloats compact surfaces or compresses the catalogue. |
| H4 — harmonize by semantic family | Best future direction if a defect is proven: treat Matrix/Cargo as compact operational controls and Planned Supply as catalogue tiles. It still requires explicit Cargo wrapping acceptance rather than a blind shared rule. |

No shared target is recommended for implementation now. The following are
measurement candidates for a later authorized prototype, not chosen values:

| Candidate | Dimensions | Token effect | Layout effect |
| --- | --- | --- | --- |
| Cargo-local conventional widening | 3.2rem x 1.65rem; existing 0.1rem 0.2rem padding and 0.72rem font | Adds 7.2px border-box width at the 18px root; `R-COOH`/`SiH3Cl` become comfortable; short tokens gain whitespace | 1366 remains four per inspected row; 1600 drops from five to four and adds a row. At the 16px root it becomes 51.2px wide. True-zoom behavior unverified. |
| Height-only common rhythm | 1.65rem height; current widths/padding/fonts | No horizontal-fit change; shortest and longest tokens remain centered | Matrix grows about 1.8px; Cargo unchanged; each Planned row shrinks about 9px (about 45px over five rows). Requires visual review of catalogue rhythm. |
| Maximum-content common width | 3.35rem; current surface heights/fonts | Comfortable six-glyph fit everywhere | Matrix state lists may wrap sooner; Cargo density falls; inorganic family pitch grows; no pre-release justification. |

Reducing Cargo padding or gaps could retain more row capacity, but that becomes
a coordinated local layout adjustment and may make the visual envelope less,
not more, comfortable. It should be prototyped rather than inferred from
arithmetic.

## Pre-release and post-release recommendation

**Pre-release:** GEO-A / H0. Make no CSS, markup, token, or layout change. The
current normal-color controls preserve complete, distinguishable abbreviations,
full accessible names, and accepted parent layouts.

**Post-release trigger:** if Windows High Contrast, another Chromium version,
or fallback-monospace loading shows actual glyph loss—especially Cargo
`R-COOH`/`SiH3Cl` while pressed or stale—run a small H1 versus H4 prototype.
Do not widen Cargo without explicitly accepting and testing the five-to-four
wrap change at 1600px. Height harmonization should be treated as independent
visual-rhythm work, not bundled into a clipping fix.

## Manual checks for any later implementation

1. Use Windows Chromium at 1366x768 and 1600x900, 100% zoom, with IBM Plex
   Mono confirmed loaded. Check `R-COOH`, `SiH3Cl`, four-glyph resources, and
   representative three-glyph products in every state.
2. Repeat at true 200% browser zoom; record browser version, effective CSS
   viewport, device-pixel ratio, page and local overflow, Matrix header/body
   alignment, Planned catalogue stacking, and Cargo rows.
3. Enable Windows High Contrast/forced colors. Check neutral, pressed/planned,
   available, stale, disabled, and keyboard-focused states, with special
   attention to Cargo's 2px border.
4. At both desktop widths, count Cargo controls per row before and after any
   candidate. Test a full realistic group, not only two representative tokens.
5. Verify Matrix state-list wrapping and the accepted six-track header/body
   association at the 38rem local floor and at 1366px.
6. Verify Planned Supply special strip, family centering, five-row pitch,
   organic/product pair stacking, compact-group wrapping, and local horizontal
   overflow.
7. Confirm title/full accessible names, `aria-pressed`, `aria-disabled`, stale
   descriptions, focus outlines, and non-color state cues remain intact.

## Verification

This audit creates only this report. No CSS, TSX, runtime, test, catalogue,
backlog, architecture, UX owner document, commit, push, deployment, dependency,
or persisted application state was changed. Per the report-only brief, the full
test suite and production build were not run. Handoff verification uses
`git diff --check` plus Git status/name-only checks. `git diff --check` passed;
the separate no-index whitespace check of this untracked report produced no
whitespace diagnostics. Final status contained only this report and the
pre-existing user-supplied untracked audit brief.
