# 1366×768 layout review

## 1. Executive summary

At a `1366 × 768` browser viewport, 100% CSS zoom, the Resource Matrix has a
**631 px** horizontal viewport and a **693 px** scroll width. Its exact overflow
is therefore **62 px**. The user's estimate of about 75 px is directionally
accurate but 13 px high for the measured sample state.

The overflow is not caused by page-level scrolling, Search, or an intrinsically
wide data value. It has two direct causes:

- the matrix's declared `38rem` hard floor is 684 px at the desktop 18 px root
  size, which is 53 px wider than the allocated 631 px center column;
- padded full-width section rows extend 9 px beyond that floor, making the
  effective matrix scroll width 693 px.

The 38rem floor was re-measured at an exact 684 px matrix viewport. Ordinary
header and row cells had no intrinsic overflow, but the floor remains justified:
Inputs is already at its one-control-per-line limit, Logistics is at its
two-control limit, Producing has no measured header/help clearance to donate,
and reducing Item or Source would introduce additional ellipsis. Only the 9 px
section-row overshoot is a safe matrix-internal recovery. The remaining
**53 px must come from surrounding allocation**.

Side-by-side Matrix + Cargo Links at 1366 px is a requirement. A viable
breakpoint-specific budget exists without lowering the matrix floor or narrowing
either side panel. A fluid outer gutter that reaches about 2.5 px per side at
1366 px recovers 40 px. Reducing each 18 px inter-panel gap to 11.25 px recovers
the remaining 13.5 px. Together they produce a **684.5 px** matrix viewport,
0.5 px above the 684 px floor after the overshoot correction. Navigation stays
at 315 px (`17.5rem`) and Cargo stays at 324 px (`18rem`).

The Outposts and Cargo Links **Lock order** buttons represent the same active
reorder state, but only Outposts has an `aria-pressed='true'` visual rule. The
color difference is an unintentional styling inconsistency.

No other genuine 1366 px usability defect was found in the inspected English
or Japanese states.

## 2. Acceptance criteria

The audit applies this criterion:

> At 1366×768, 100% zoom, primary application surfaces should fit horizontally
> without requiring horizontal scrolling. Vertical scrolling and deliberate
> wrapping are acceptable.

The Matrix and Cargo Links must remain side by side at 1366 px. The audit also
treats outpost and cargo-link destination names as functional identifiers.
Their usable width is not a source of recovery unless matrix and layout chrome
have been exhausted, and the final proposal must not introduce new ellipsis.

## 3. Current measurements

The browser viewport was explicitly set to `1366 × 768`. A vertical page
scrollbar consumed 15 px, leaving a 1351 px document client width. Device pixel
ratio was 1 and computed root zoom was `1`.

| Surface | Measured width | Relevant detail |
|---|---:|---|
| Browser viewport | 1366 px | 768 px high |
| Document/page client width | 1351 px | No page-level horizontal overflow |
| Page gutters | 22.5 px each | `--page-gutter: 1.25rem` |
| Workspace content width | 1306 px | Between the two page gutters |
| Outpost navigation track | 315 px | `17.5rem` |
| Navigation-to-outpost gap | 18 px | `1rem` |
| Selected-outpost region | 973 px | Details plus operational columns |
| Resource Matrix column | 631 px | Matrix scroll viewport is also 631 px |
| Matrix-to-Cargo gap | 18 px | `1rem` |
| Cargo Links column | 324 px | `18rem` |
| Matrix table border box | 684 px | `38rem` declared minimum |
| Matrix table scroll width | 693 px | Includes 9 px section-row overshoot |
| Exact matrix overflow | **62 px** | `693 - 631` |
| Search control | 225 px | `12.5rem`; fits in heading independently |

The computed workspace tracks were `315px 973px`. Inside the selected-outpost
region, the computed operational tracks were `631px 324px` with an 18 px gap.

The page itself measured `clientWidth = scrollWidth = 1351px`, so the defect is
local to the Resource Matrix scroller rather than an accidental body overflow.

### Representative-width rendered baseline

All five widths were measured at 768 px height and 100% CSS zoom. The vertical
scrollbar consistently consumed 15 px. Navigation remained 315 px throughout;
Cargo remained at its 324 px minimum through 1600 px and began receiving its
fractional share at 1920 px.

| Viewport | Document client | Navigation | Matrix viewport | Cargo Links | Matrix overflow |
|---:|---:|---:|---:|---:|---:|
| 1366 px | 1351 px | 315 px | 631 px | 324 px | 62 px |
| 1440 px | 1425 px | 315 px | 705 px | 324 px | 0 px |
| 1536 px | 1521 px | 315 px | 801 px | 324 px | 0 px |
| 1600 px | 1585 px | 315 px | 865 px | 324 px | 0 px |
| 1920 px | 1905 px | 315 px | 1131.75 px | 377.25 px | 0 px |

This confirms that 1366 px is a narrow boundary problem rather than a general
desktop allocation failure. At 1440 px the current, unmodified layout already
clears the effective 693 px scroll width by 12 px.

## 4. Resource Matrix overflow analysis

### Declared hard floor

`OutpostStatusMatrix.css` defines six tracks whose minimums total exactly
`38rem`:

| Column | Minimum | Pixels at 18 px/rem |
|---|---:|---:|
| Item | 7.5rem | 135 px |
| Source | 6rem | 108 px |
| Present | 6rem | 108 px |
| Producing | 7rem | 126 px |
| Inputs | 4.25rem | 76.5 px |
| Logistics | 7.25rem | 130.5 px |
| **Total** | **38rem** | **684 px** |

The table also has `min-width: 38rem`. At 631 px available width, this floor
accounts for **53 px** of the overflow.

These minima were established by the earlier Resource Matrix compression audit
as the practical floor for state-control geometry, wrapped Inputs/Logistics,
header/help clearance, and visible focus outlines. Reducing the entire table to
about `35.06rem` merely to fit the current allocation would cross that tested
floor.

### Measured re-examination of the 38rem floor

The viewport was widened to 1419 px, which allocates exactly **684 px** to the
matrix under the current layout. At that boundary:

- the matrix scroller measured 684 px and the table border box measured 684 px;
- all ordinary header cells and row cells reported `scrollWidth <= clientWidth`;
- Inputs rendered at 76.5 px (`4.25rem`) with 57.6 px state controls, compressed
  5.4 px inline padding, wrapping multi-input recipes one control per line;
- Logistics rendered at 130.5 px (`7.25rem`), the established width for two
  57.6 px controls, their 4.5 px gap, compressed padding, and focus clearance;
- Present rendered at 108 px against an earlier measured natural header/help
  requirement of about 105 px, leaving only about 3 px;
- Producing rendered at 126 px against an earlier measured natural header/help
  requirement of about 126 px, leaving no useful clearance;
- Item and Source remained at their previously tested 7.5rem and 6rem floors.

The table still reported 693 px `scrollWidth`, but inspection again attributed
the extra 9 px exclusively to the padded full-width section rows described
below. No ordinary grid cell caused it.

This re-check does not support lowering the matrix to 37rem or 35rem. At most,
Present exposes roughly 3 px of theoretical slack; consuming it would leave no
robust rounding, locale, or focus-outline allowance and would not materially
change the surrounding-layout requirement. The recommended floor remains
**38rem / 684 px**.

### Nine-pixel section-row overshoot

The remaining **9 px** is structural rather than content-driven. Section
heading/bar elements are grid containers with `0.5rem` inline padding and the
default content-box sizing. Their child spans `grid-column: 1 / -1`, receives
the full 684 px grid width, and begins after the 9 px left padding. The child
therefore ends at 693 px relative to the table origin. The same behavior was
measured on the Imports section heading and Manufacturing section bar.

This can be corrected locally by making those padded full-width grid rows own
their padding within the declared width, or by moving/removing the conflicting
padding. The precise implementation should retain the current visual inset.

### Search, headers, padding, and controls

- Search is 225 px wide and lives in the wrapping heading strip above the
  scroller. It does not contribute to the table's `scrollWidth`.
- At the current 631 px heading width, Resource Matrix plus Search remain on one
  line in both English and Japanese.
- The constrained-width matrix query is active and reduces cell/header inline
  padding from 9 px to 5.4 px per side.
- That padding is already included inside the fixed column minima. Reducing it
  alone would not reduce the 684 px grid floor.
- State controls remain 3.2rem wide and state-list gaps remain 0.25rem. The
  earlier focused audit found these dimensions necessary for usable controls
  and focus clearance.
- No row cell or ordinary header cell exceeded its assigned track. The only
  measured protrusions were the padded full-width section rows.

## 5. Width recovery opportunities

### 1. Resource Matrix internals

Safely recoverable now: **9 px**.

Correct the full-width section-row box/padding ownership. Do not lower the
38rem practical table floor. The measured re-examination found no safe
whole-rem reduction: the existing compressed cell padding, control size,
header/help geometry, and state-list gap are already at or near their deliberate
minimums. The approximately 3 px of theoretical Present-column slack is too
small and fragile to include in the correction budget.

### 2. Fluid outer gutters

After the 9 px internal correction, the matrix needs **53 px** more allocation.
Outer gutters are the best primary pressure valve because they do not reduce
any control, column, or functional name width.

At 1366 px, changing the workspace gutter from 22.5 px to 2.5 px per side
recovers **40 px**. The remaining deficit is 13 px. Reducing each 18 px major
gap to 11.25 px recovers another **13.5 px**, giving 0.5 px of geometric
tolerance without touching Navigation or Cargo widths.

Projected 1366 px equation after the matrix overshoot fix:

```text
1351 document client width
−  5.0 total outer gutters
−315.0 Navigation
− 11.25 Navigation/workspace gap
−324.0 Cargo Links
− 11.25 Matrix/Cargo gap
=684.5 Resource Matrix
```

### 3. Candidate fluid-gutter formulas

The following candidates all use a 2.5 px minimum at 1366 px and the existing
`1.25rem` / 22.5 px maximum. They differ only in the viewport where comfortable
spacing is fully restored.

**Candidate A — restore by 1600 px (recommended):**

```css
--workspace-gutter:
  clamp(2.5px, calc(8.547vw - 6.347rem), 1.25rem);
--workspace-major-gap:
  clamp(0.625rem, calc(2.885vw - 1.564rem), 1rem);
```

**Candidate B — restore by 1536 px:**

```css
--workspace-gutter:
  clamp(2.5px, calc(11.765vw - 8.789rem), 1.25rem);
--workspace-major-gap:
  clamp(0.625rem, calc(3.971vw - 2.388rem), 1rem);
```

**Candidate C — restore by 1728 px:**

```css
--workspace-gutter:
  clamp(2.5px, calc(5.525vw - 4.054rem), 1.25rem);
--workspace-major-gap:
  clamp(0.625rem, calc(1.865vw - 0.790rem), 1rem);
```

Candidate A is the best balance. It resolves 1366 px, progressively restores
breathing room, and returns to the current spacing at 1600 px. Candidate B
restores comfortable spacing sooner but gives the matrix slightly less room at
1440–1536. Candidate C gives the matrix more room through ordinary desktop
widths but keeps the overall shell visually tight until 1728 px.

The gap formula is paired with the gutter formula so the two 11.25 px gaps at
1366 px also return smoothly to 18 px at the same comfortable width. A fixed
11.25 px constrained gap plus a later breakpoint would fit, but the paired
fluid form avoids a visible spacing jump.

### 4. Candidate measurements

These are geometric projections from the measured document widths and current
grid behavior. They retain Navigation at 315 px and Cargo at its 324 px minimum;
at 1920 px Cargo resumes its normal fractional growth.

| Viewport | Candidate | Gutter / side | Major gap | Matrix | Cargo |
|---:|---|---:|---:|---:|---:|
| 1366 px | All | 2.50 px | 11.25 px | **684.50 px** | 324 px |
| 1440 px | A / 1600 | 8.82 px | 13.38 px | 741.58 px | 324 px |
| 1440 px | B / 1536 | 11.21 px | 14.19 px | 735.21 px | 324 px |
| 1440 px | C / 1728 | 6.59 px | 12.63 px | 747.56 px | 324 px |
| 1536 px | A / 1600 | 17.03 px | 16.15 px | 815.63 px | 324 px |
| 1536 px | B / 1536 | 22.50 px | 18.00 px | 801.00 px | 324 px |
| 1536 px | C / 1728 | 11.89 px | 14.42 px | 829.38 px | 324 px |
| 1600 px | A / 1600 | 22.50 px | 18.00 px | 865.00 px | 324 px |
| 1600 px | B / 1536 | 22.50 px | 18.00 px | 865.00 px | 324 px |
| 1600 px | C / 1728 | 15.43 px | 15.61 px | 883.92 px | 324 px |
| 1920 px | All | 22.50 px | 18.00 px | 1131.75 px | 377.25 px |

The 1366 px result is intentionally close: 684.5 px against a 684 px floor.
Implementation validation must confirm browser rounding. If the half-pixel
margin proves unstable, lower the minimum gutter from 2.5 px toward 2 px; that
adds 1 px across both sides without affecting either panel.

### 5. Cargo Links chrome

No Cargo width or internal-chrome change is required under the fluid-gutter
model. Cargo remains `18rem` / 324 px at 1366–1600, preserving the measured
154.7 px tight inter-system destination field and 195.3 px regular field.

### 6. Outpost navigation chrome

No Navigation width or row-chrome change is required. Navigation remains
`17.5rem` / 315 px, preserving the measured 188.9 px Reshuffle name button and
the established tolerance for realistic 25-character names.

### 7. Text truncation

No new truncation mechanism or additional ellipsis is needed. Both functional
name surfaces retain their current track and internal geometry.

## 6. Side-panel name-width analysis

### Outpost names

At 315 px Navigation width:

- normal-mode selection rows have about 300.5 px total button width;
- Reshuffle-mode name buttons are about 188.9 px wide, with about 187 px client
  width before the button's own inset and selected marker effects;
- the prior navigation audit measured the widest realistic 25-character test
  name at about 156.25 px and found 306 px pane width to be the bare threshold.

Navigation remains at 315 px. Its measured normal and Reshuffle name widths are
unchanged.

### Cargo-link destination names

In Cargo Reshuffle mode, measured destination fields were about **154.7 px** on
the tighter inter-system rows and about **195.3 px** on regular rows. Cargo
remains at 324 px, so those widths are unchanged.

### Conclusion on names

Neither side panel needs narrowing. Functional name readability and existing
ellipsis behavior remain unchanged.

## 7. Lock order styling

Both buttons toggle the same presentation-only semantic state: entering or
leaving explicit reorder mode. Both expose `aria-pressed="true"` while their
label is **Lock order**.

The Outposts stylesheet has a pressed-state selector that changes the button to
dark structural background with light text. Cargo Links has base, hover,
focus, and disabled button rules but no equivalent pressed-state rule.

Measured active-state colors:

| Button | Text | Background | Border |
|---|---|---|---|
| Outposts Lock order | `rgb(247, 250, 248)` | `rgb(42, 62, 58)` | `rgb(42, 62, 58)` |
| Cargo Links Lock order | `rgb(46, 68, 64)` | `rgb(247, 250, 248)` | base/focus-dependent |

The difference is a **styling bug**, not intentional semantic differentiation.
Cargo should receive the same pressed-state grammar as Outposts.

## 8. Other 1366 px findings

- No page-level horizontal scrollbar was present.
- Header actions wrapped in Japanese, increasing header height, but remained
  readable and reachable. This is an allowed vertical/wrapping trade-off.
- Outpost Details stayed within its 973 px region in both locales.
- Planned Supply remained within the center column in the inspected collapsed
  state.
- Cargo Links stayed within its 324 px column.
- The fixed footer stayed within the document width.
- The Japanese matrix had the same 631 px viewport, 693 px scroll width, and
  62 px overflow as English; no locale-specific horizontal regression appeared.
- The About dialog measured 450 × 258 px and fit comfortably within the
  viewport.
- The Validation Summary panel measured 576 × 328 px and fit within the
  viewport.
- No clipping, overlap, or unreachable control was observed outside the known
  Resource Matrix scrollbar.

## 9. Recommended minimal correction sequence

1. Correct the 9 px full-width section-heading/section-bar overshoot inside the
   Resource Matrix while preserving the visible inset.
2. Add a workspace-local fluid gutter, preferably Candidate A, so it reaches
   about 2.5 px per side at 1366 px and the existing 1.25rem maximum at 1600 px.
   Do not globally shrink the Title Bar, Page Header, or Status Bar gutters.
3. Make the Navigation/workspace and Matrix/Cargo gaps follow the paired fluid
   gap formula: 0.625rem at 1366 px and 1rem at 1600 px.
4. Preserve Navigation at `17.5rem` and Cargo Links at `18rem`.
5. Keep the existing stacking behavior below the constrained desktop range;
   do not stack Matrix and Cargo Links at 1366 px.
6. Add the missing Cargo `aria-pressed='true'` visual rule to match Outposts.
7. Verify 1366×768 in English and Japanese with Navigation open, 25-character
   names, and both Outposts/Cargo Lock and Reshuffle modes.
8. Recheck adjacent breakpoint widths, page-level overflow, keyboard focus
   outlines, sticky Item behavior, and the 0.5 px matrix-fit tolerance.

## 10. Risks and non-regression constraints

- Retain the 38rem matrix floor. The re-examination did not justify reducing it.
- Preserve Navigation at 17.5rem and Cargo at 18rem.
- Scope the fluid gutter to the workspace. Reusing the global page-gutter token
  would also move header, title, and footer content to within 2.5 px of the
  viewport edge at 1366 px.
- Restore gutters and gaps to their current maxima by the selected comfortable
  desktop width; do not leave the entire desktop range permanently compressed.
- Treat the projected 0.5 px fit margin as a regression target. If rounding
  produces a scrollbar, use a 2 px minimum gutter rather than narrowing a panel.
- Preserve sticky Item cells, stable shared column alignment, header/help
  clearance, and visible keyboard focus outlines.
- Preserve normal document-level vertical scrolling and the fixed footer.
- Keep responsive layout and reorder appearance as presentation-only state.
- Do not add new name ellipsis behavior as part of the correction.

## 11. Parcel size estimate

**Medium.** The code remains CSS-focused, but the correction combines the
matrix box-model fix with two fluid workspace dimensions and has only 0.5 px
of projected fit tolerance at 1366 px. It needs deliberate interpolation,
rounding, locale, and identifier regression coverage in addition to the Lock
order style fix. No domain, data, localization, schema, or dependency work is
indicated.

## 12. Reproduction notes

Environment and actions:

- branch: `staging`;
- local Vite server: `npm run dev -- --host 127.0.0.1`;
- browser: Codex in-app Chromium browser;
- explicit viewport override: `1366 × 768`;
- representative viewport measurements: `1440 × 768`, `1536 × 768`,
  `1600 × 768`, and `1920 × 768`;
- additional matrix-floor viewport: `1419 × 768`, which allocated exactly
  684 px to the matrix;
- computed CSS zoom: `1`;
- device pixel ratio: `1`;
- locales checked: `en-US` and `ja-JP`;
- reorder states checked: Outposts and Cargo Links Lock order;
- additional overlays checked: About and Validation Summary;
- DOM measurements used `getBoundingClientRect`, `clientWidth`, `scrollWidth`,
  and computed styles through the browser inspection API.

The measured sample state contained six outposts, four cargo pads on the
selected outpost, and enough matrix content to exercise Inorganic,
Manufacturing, and Imports sections. Transient browser presentation changes
were restored after measurement.

No application code, CSS, test, fixture, localization, dependency, lockfile,
or Cloudflare setting was modified during this audit.
