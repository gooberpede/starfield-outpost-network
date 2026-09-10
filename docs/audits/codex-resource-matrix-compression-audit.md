# Resource Matrix compression audit

The Matrix can safely shrink from **49rem to about 38rem** before horizontal scrolling becomes preferable—a reduction of roughly **22%**.

The existing `49rem` is the decisive scrollbar floor, but it is not a usability-derived minimum. In fact, Present and Producing header/help controls already collide at that width because the fractional grid allocates them too little space.

## Current width floor

At the desktop root font size of 18px:

- Scrollbar begins when available Matrix width falls below **882px**.
- `49rem = 882px`.
- At 882px available width, no scrollbar appears; at 880px, it does.
- Therefore, the hard-coded `min-width: 49rem` directly controls scrollbar onset.

Below the 1024px viewport breakpoint, the root font becomes 16px and `49rem = 784px`, although horizontal scrolling has already begun earlier due to the surrounding workspace allocation.

### Current columns at the 49rem threshold

| Column | Configured min | Rendered | Usable after padding |
|---|---:|---:|---:|
| Item | 9rem / 162px | 205.3px | 187.3px |
| Source | 6rem / 108px | 136.9px | 118.9px |
| Present | 4.5rem / 81px | 83.6px | 65.6px |
| Producing | 5rem / 90px | 98.8px | 80.8px |
| Inputs | 10rem / 180px | 205.3px | 187.3px |
| Logistics | 7rem / 126px | 152.1px | 134.1px |

The configured minimums total only **41.5rem**. The remaining 7.5rem at the table floor is distributed by the fractional tracks, disproportionately benefiting Item and Inputs while leaving Present and Producing undersized.

## Header and intrinsic-width findings

No child intrinsic width causes the table to overflow. Grid cells have `min-width: 0`; text can ellipsize, and state lists can wrap. The scrollbar is caused exclusively by the table’s explicit `49rem` minimum.

However, fixed child geometry establishes genuine usability constraints:

- State widget: **3.2rem**
- Context-help trigger: **1rem**
- Focus outline: 2px with a 2px offset
- Present header’s measured natural width: approximately **105px / 5.83rem**
- Producing header’s measured natural width: approximately **126px / 7rem**

Consequently:

- The current **4.5rem Present minimum is not close to sufficient**.
- The current **5rem Producing minimum is also insufficient**.
- Both header clusters visibly overlap adjacent columns at the current 49rem table floor.
- Row controls themselves do not overlap; wrapping continues to work.

[Current 49rem screenshot](</C:/Users/User/.codex/visualizations/2026/09/08/01a07f76-b34d-7d02-80c7-21fafa42ca58/matrix-current-49rem.png>)

## Recommended width model

| Column | Current min | Comfortable | Compressed minimum | Notes |
|---|---:|---:|---:|---|
| Item | 9rem | 10rem | 7.5rem | At 10rem only the single longest catalogue item ellipsizes; at 7.5rem about 11% ellipsize. Existing titles preserve full names. |
| Source | 6rem | 8rem | 6rem | Full species names are impractical; 6rem still exposes a recognizable prefix. Below this, many rows show only generic prefixes such as “Flocking”. |
| Present | 4.5rem | 6rem | 6rem | Required by label, help trigger, padding, and focus clearance. |
| Producing | 5rem | 7rem | 7rem | Required by the longer label and help trigger. |
| Inputs | 10rem | 10rem | 4.25rem | Most compressible column. Use 7.25rem when preserving two widgets per row; 4.25rem is the one-widget-per-row floor. |
| Logistics | 7rem | 7.75rem | 7.25rem | Two widgets require 7.65rem with normal padding, or 7.25rem with compressed padding. |

Recommended totals:

- **Comfortable:** 48.75rem — 877.5px at 18px root size.
- **Compressed but usable:** 41rem — 738px.
- **True practical minimum:** 38rem — 684px.
- **Must scroll:** below 38rem.

At the 16px root size these correspond to 780px, 656px, and 608px respectively.

The 38rem candidate retained aligned headers, focus clearance, sticky Item positioning, readable rows, and non-overlapping controls:

[Proposed 38rem screenshot](</C:/Users/User/.codex/visualizations/2026/09/08/01a07f76-b34d-7d02-80c7-21fafa42ca58/matrix-proposed-38rem.png>)

## Inputs and Logistics

Inputs provides most of the recoverable width:

- Four-input recipes currently form two rows at comfortable width.
- At approximately 7.25rem, two controls still fit per row with compressed padding.
- Between 7.25rem and 4.25rem, controls wrap one per row but remain usable.
- At 4.25rem, the 3.2rem control still has enough clearance for its focus outline.
- Below approximately 4.2rem, the fixed control becomes the real limiting child.

For Logistics:

- Two controls plus the current gap and normal padding require about **7.65rem**.
- Reducing horizontal padding to `0.3rem` lowers that requirement to **7.25rem**.
- The current nominal 7rem minimum cannot keep two controls on one row if the track actually reaches its configured minimum.

I do not recommend reducing the `0.25rem` state-list gap. At 18px it is 4.5px, approximately the space needed between neighboring 2px outlines with 2px offsets. Reducing it to 0.15rem saves only 1.8px per adjacency and causes focus-ring crowding.

## Padding

Current horizontal padding consumes:

- **6rem per complete six-column row**
- 108px at the desktop 18px root size
- 96px at the smaller 16px root size

Using `0.3rem` horizontal padding in compressed mode reduces this to 3.6rem and recovers:

- 43.2px at 18px
- 38.4px at 16px

Normal-width spacing should remain unchanged.

## Catalogue results

The actual UI font was used to measure display widths.

Item catalogue:

- 105 combined resource/product names.
- Median rendered width: approximately 70px.
- 90th percentile: approximately 136px.
- Maximum: 185px, `Substrate Molecular Sieve`.
- Full display of every item would require about 11.3rem including current padding, which is unnecessary given existing title tooltips.

Source catalogue:

- 1,121 species records.
- Median rendered width: approximately 133px.
- 90th percentile: approximately 203px.
- Maximum measured width: approximately 247px.
- Even the current Source width truncates approximately 55% of species names, so complete display is not a realistic width target.

Longest resource names:

1. High-Tensile Spidroin
2. Gastronomic Delight
3. Carboxylic Acids
4. Memory Substrate
5. Immunostimulant
6. Metabolic Agent
7. Biosuppressant
8. Luxury Textile
9. Tetrafluorides
10. Antimicrobial

Longest product names:

1. Substrate Molecular Sieve
2. Veryl-Treated Manifold
3. Aldumite Drilling Rig
4. Microsecond Regulator
5. Tasine Superconductor
6. Paramagnon Conductor
7. Austenitic Manifold
8. Isocentered Magnet
9. Supercooled Magnet
10. Tau Grade Rheostat

Longest unique species names by character count:

1. Schooling Kronosaurus Scavenger
2. Flocking Ankylosaurus Geophage
3. Flocking Blistercrab Herbivore
4. Flocking Caterpillar Scavenger
5. Flocking Clickbeetle Herbivore
6. Flocking Coralcrawler Geophage
7. Flocking Horsamander Scavenger
8. Flocking Shellephant Herbivore
9. Schooling Kronosaurus Filterer
10. Schooling Paddlefish Scavenger

## Recommended future CSS strategy

Use a CSS-only stable template:

- Give Present and Producing fixed practical tracks of approximately 6rem and 7rem.
- Reduce the Item minimum to 7.5rem.
- Retain Source at 6rem.
- Reduce Inputs to a 4.25rem hard floor, allowing it to grow normally.
- Set Logistics to approximately 7.25rem.
- Change the table minimum to approximately 38rem.
- Add a scoped container query near 41rem that reduces cell horizontal padding from `0.5rem` to `0.3rem`.
- Keep the state-list gap at `0.25rem`.

This keeps column positions content-independent and stable across outposts. Runtime measurement, pane resizing, `clamp()` complexity, and outpost-specific templates are unnecessary.

## Accessibility and interaction

At the 38rem candidate:

- All six headers remained non-overlapping.
- Present and Producing state controls retained visible 2px focus outlines.
- State widgets remained individually focusable where enabled.
- All inspected Matrix item/source cells retained `title` values.
- All state widgets retained titles and accessible labels.
- Sticky Item cells remained flush with the scroll viewport after horizontal scrolling.
- Header and row track widths remained aligned.

## Repository state

No source files were changed. Browser-only CSS/DOM experiments were discarded when the audit browser closed.

- `git diff --check`: passed.
- Build/lint: not run because repository source was untouched.
- Git status: clean apart from the already supplied untracked brief:
  `docs/implementation-briefs/CODEX_BRIEF_resource-matrix-compression-audit.md`
- No commit or push was performed.