# Cargo Links Vertical Geometry Review

## 1. Baseline

- Branch: `staging`
- Commit: `ea16a34bd3de34e36950a2907dad9ac82c486926`
- Baseline working tree: the supplied audit brief was untracked at
  `docs/implementation-briefs/CODEX_AUDIT_BRIEF_cargo-links-vertical-geometry.md`.
  The supplied screenshots were under the ignored `.local-work/` directory.
- Audit date: 2026-09-25 (Australia/Sydney)
- Scope: layout audit only. No source, runtime, schema, interaction, version,
  deployment, or persistence changes were made.

The runtime measurements used the committed application at the requested
viewports. A local browser profile was populated through the existing UI with
four cargo pads so collapsed, one-expanded, and multiple-expanded states could
be compared. That diagnostic data is deliberately simpler than the user's
saved network in the screenshots; the relevant height and scroll relationships
are independent of the cargo contents.

## 2. Executive finding and disposition

**Disposition: CGEO-C — bounded sticky/flex geometry refactor recommended.**

The defect is caused by a mismatch between the coordinate system used to size
the Cargo list and the coordinate system in which the list is positioned:

- `.cargo-pads__list` has `max-height: calc(100svh - 12rem)`, so its cap is a
  constant function of viewport height and root font size.
- The list remains in ordinary document flow. Its viewport `top` therefore
  changes when the document scrolls.
- The fixed Status Bar always occupies the viewport bottom, but the list cap
  does not subtract the list's actual current top or the Status Bar token.
- `#root` bottom padding reserves document-flow space; it does not constrain a
  nested scroller's viewport rectangle.

At 1366 x 768, with four expanded diagnostic pads, the measured list height was
556.50 px while only 342.80 px existed between the list top and the Status Bar
top. The list therefore extended 213.70 px behind the fixed bar. After 214 px
of document scrolling, its top moved upward by 214 px but its computed
`max-height` remained 552 px. At 1600 x 900 the same setup produced the same
213.70 px initial overrun, proving that the fixed `12rem` subtraction is not a
valid representation of the shell geometry.

The `12rem` rule is therefore materially responsible, but it is not usefully
repairable by choosing a different constant. The general solution is to give
the two-column Cargo region a viewport-aware sticky position, cap the outer
Cargo shell to the band between the measured Page Header and fixed Status Bar,
and let the list flex into the remaining shell space.

## 3. Screenshot interpretation

The supplied files are 1366 x 768 full-window captures. They include about
79 px of browser chrome, so the application viewport is approximately
1366 x 689 CSS pixels. Pixel values below are screenshot-coordinate estimates,
not DOM measurements; their purpose is to relate the images to the reproduced
geometry.

| Screenshot | Page state | Cargo list top | Cargo/list bottom | Status Bar top | Unused visible space | Visible clipping |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `cargo-links-collapsed.PNG` | Document already below the Title Bar; Page Header sticky | about 202 | about 505 | about 698 | about 193 | None; four compact summaries fit naturally |
| `cargo-links-expanded.PNG` | Similar document position; multiple links expanded | about 202 | about 674 | about 698 | about 24 | Second editor continues below the visible portion of the independent list; its controls require Cargo-list scrolling |
| `cargo-links-bottom-gap.PNG` | Document scrolled roughly 215-220 px farther | list top is above the screenshot; visible Cargo content ends about 455 | about 455 | about 698 | about 243 | The list has moved upward with document flow while retaining essentially the same viewport-derived cap |

The two expanded screenshots are consistent with one fixed-height list moving
upward with the document. The approximately 219 px difference in its bottom
edge closely matches both the reproduced document-scroll delta and the
213.70 px runtime mismatch. This explains the apparent contradiction: near
the top, expanded content is guillotined into an underspecified nested
scrollport; farther down, that same scrollport has moved up and leaves a large
blank region below it.

The collapsed image is a baseline to preserve. Its blank space is not itself a
defect: the list has natural height because its content is shorter than the
cap. A fix must not force this state to fill the viewport.

## 4. Current scroll and height ownership map

```text
document / viewport                         vertical document scroll owner
  #root                                     min-height: 100svh; bottom padding only
    TitleBar                                normal document flow
    PageHeader                              sticky; top: 0
    WorkspaceLayout                         normal document flow; CSS grid
      selected-outpost                      normal-flow flex column
        top details                         normal flow
        workspace-layout__content           two-column grid; align-items: start
          middle / Resource Matrix          normal document flow
            matrix local wrapper            horizontal overflow only
          right / Cargo                     normal document flow; not sticky
            cargo-pads                      natural block height
              heading                       natural height, outside list
              actions                       natural height, outside list
              cargo-pads__list              vertical nested scroll owner
                cargo cards                 list scroll content
    StatusBar                               fixed overlay at viewport bottom
```

Only the document and `.cargo-pads__list` own vertical scrolling in this path.
The workspace, selected-outpost, right column, and outer Cargo component merely
move in document flow. The Resource Matrix does not own an artificial vertical
scrollport.

The content grid already uses `align-items: start`, so the right column is not
being stretched to the middle column's block size. There is no ancestor
`overflow` trapping sticky positioning. The significant intrinsic-size issue
is instead that the list directly owns a viewport cap without a constrained
flex parent. `min-height: 0` will become important once the list is a flex
child, but its absence is not the current root cause.

## 5. Reproduced geometry

### Measurement method

Measurements were read from `getBoundingClientRect()`, element
`clientHeight`/`scrollHeight`, and computed styles in Chromium. Status Bar top
was used as the lower usable boundary:

```text
actual available list space = Status Bar top - Cargo list top
mismatch = rendered list height - actual available list space
```

Positive mismatch means the list extends behind the fixed bar. Small
sub-pixel differences arise because padding and borders contribute to the
rendered box while computed `max-height` describes the relevant CSS box.

### 1366 x 768, page top, four expanded

`window.innerHeight` and `visualViewport.height` were both 768 px. The document
height was 982 px and `window.scrollY` was 0.

| Element | Top | Bottom | Height | clientHeight | scrollHeight | overflow-y | position | computed max-height |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| `.page-header` | 65.98 | 142.66 | 76.67 | 75 | 75 | visible | sticky | none |
| `.workspace-layout__right` | 268.52 | 918.70 | 650.19 | 650 | 650 | visible | static | none |
| `.cargo-pads` | 268.52 | 918.70 | 650.19 | 650 | 650 | visible | static | none |
| `.cargo-pads__heading` | 268.52 | 309.11 | 40.59 | 40 | 41 | visible | relative | none |
| `.cargo-pads__actions` | 317.20 | 348.70 | 31.50 | 32 | 32 | visible | static | none |
| `.cargo-pads__list` | 362.20 | 918.70 | 556.50 | 557 | 962 | auto | static | 552 px |
| first expanded body | 430.73 | 595.23 | 164.50 | 164 | 164 | visible | static | none |
| last cargo item in list content | 1085.86 | 1319.89 | 234.03 | 234 | 234 | visible | relative | none |
| `.status-bar` | 705.00 | 768.00 | 63.00 | 62 | 62 | visible | fixed | none |

- Actual available list space: **342.80 px**
- Rendered list height: **556.50 px**
- Status Bar overrun: **213.70 px**
- The list was independently scrollable: `scrollHeight 962 > clientHeight 557`.

### 1366 x 768, document scrolled 214 px, four expanded

The list's computed `max-height`, rendered height, client height, and scroll
height did not change. Its viewport top changed from 362.20 px to 148.20 px,
exactly following the 214 px document scroll.

| Element | Top | Bottom | Height | clientHeight | scrollHeight |
| --- | ---: | ---: | ---: | ---: | ---: |
| `.page-header` | 0.00 | 76.67 | 76.67 | 75 | 75 |
| `.workspace-layout__right` | 54.52 | 704.70 | 650.19 | 650 | 650 |
| `.cargo-pads__list` | 148.20 | 704.70 | 556.50 | 557 | 962 |
| `.status-bar` | 705.00 | 768.00 | 63.00 | 62 | 62 |

- Actual available list space: **556.80 px**
- Mismatch: **-0.30 px** (box-model rounding)
- Computed list `max-height`: still **552 px**

This is direct proof that page scrolling changes the Cargo panel's viewport
position while leaving its height cap unchanged.

### 1366 x 768 expansion comparison at page top

| State | List height | List scrollHeight | Actual available | Bar overlap | Unused space below list |
| --- | ---: | ---: | ---: | ---: | ---: |
| All four collapsed | 304.19 | 304 | 342.80 | 0 | 38.61 |
| One expanded | 468.69 | 469 | 342.80 | 125.89 | 0 |
| Four expanded | 556.50 | 962 | 342.80 | 213.70 | 0 |

This preserves an important distinction: short content naturally shrinks, but
the first sufficiently tall state can extend behind fixed chrome before it
becomes an obvious internal-scroll problem.

### 1600 x 900, four expanded

At the page top, `window.innerHeight` and `visualViewport.height` were 900 px.
The computed list cap was 684 px, its rendered height was 688.50 px, and its
content height was 962 px.

| State | List top | List bottom | Status top | Actual available | Mismatch |
| --- | ---: | ---: | ---: | ---: | ---: |
| Page top (`scrollY = 0`) | 362.20 | 1050.70 | 837.00 | 474.80 | **213.70** |
| Document scrolled (`scrollY = 214`) | 148.20 | 836.70 | 837.00 | 688.80 | -0.30 |

The invariant 213.70 px mismatch at both desktop heights disproves the idea
that `12rem` is a generally correct shell offset. It happens to align only
after the document has moved by approximately the amount omitted from the
calculation.

### 844 x 390 short-height diagnostic

At this width, the selected-outpost content container measured 538.13 px and
crossed the `39rem` container-query threshold, so Matrix and Cargo stacked.
The root font size was 16 px; the computed list cap became 198 px.

At the page top, Cargo began below the viewport (`cargo top 740.02 px`, list
top 823.39 px). After scrolling to the document end (`scrollY = 691`):

| Element | Top | Bottom | Height | clientHeight | scrollHeight |
| --- | ---: | ---: | ---: | ---: | ---: |
| Page Header | 0.00 | 121.97 | 121.97 | 120 | 120 |
| Cargo/right region | 49.02 | 334.39 | 285.38 | 285 | 285 |
| Cargo heading | 49.02 | 85.20 | 36.19 | 35 | 36 |
| Cargo actions | 92.39 | 120.39 | 28.00 | 28 | 28 |
| Cargo list | 132.39 | 334.39 | 202.00 | 202 | 857 |
| Status Bar | 334.00 | 390.00 | 56.00 | 55 | 55 |

The list nearly aligns with the bar only at the document's maximum scroll, but
the Cargo heading is behind the sticky Page Header. This demonstrates why a
desktop side-rail rule should not be applied unchanged to the stacked layout.
It also shows why short landscape viewports make the existing arithmetic
fragile even when the list itself remains scrollable.

## 6. Root-cause analysis

### What establishes usable Cargo height today?

No element establishes the Cargo region's actual usable viewport height. The
only cap is the list's independent `calc(100svh - 12rem)`. The Page Header,
Cargo heading, action row, margins, current viewport position, and fixed Status
Bar do not participate in that calculation.

### Is the list sized against the viewport rather than its position?

Yes. The desktop measurements show its top moving by exactly the document
scroll delta while its computed max-height is unchanged.

### Can the fixed Status Bar overlap the nested Cargo scroller?

Yes. The reproduced expanded list extended 213.70 px behind it at the top of
both desktop viewports. `#root`'s bottom padding protects the end of normal
document-flow content, not the rectangle of a nested overflow container.

### Does this explain both screenshots?

Yes. A long list is clipped by its own viewport and may also extend behind the
fixed bar. Scrolling the document moves the same fixed-cap panel upward; its
bottom moves upward too, creating the later blank gap. The screenshot delta is
consistent with the reproduced approximately 214 px transition.

### Do grid/flex/intrinsic sizes contribute?

They do not cause the present mismatch. The content grid's `align-items: start`
allows the short collapsed Cargo panel to remain compact. Ancestor overflow is
visible, and no ancestor currently establishes an independent vertical size.
For the recommended refactor, however, the outer Cargo shell must become a
column flex container and the list must use `min-height: 0`; otherwise its
intrinsic content size can prevent it from shrinking into the available band.

## 7. Header and Status Bar interaction

The application already has the necessary authoritative shell tokens:

- `--page-header-height` is updated from the real Page Header rectangle by
  `ResizeObserver` through `observePageHeaderHeight()`.
- `--status-bar-height` is the shared fixed-bar height and root reservation.

The header token is superior to a new `top: 4rem` constant because it tracks
wrapping, locale, zoom, fonts, and the 1280 px header breakpoint. The Status Bar
token must be used in the lower constraint. A small intentional layout gap may
be added through an existing spacing token, but neither chrome dimension should
be duplicated.

`#root` bottom padding and `scroll-padding-block-end` remain useful for document
content and focus alignment. They do not replace an explicit Cargo-shell lower
constraint.

## 8. Viewport-unit analysis

- Desktop Chromium: `svh` is stable, but stability cannot correct a missing
  positional term.
- Desktop Firefox and Safari/WebKit: the same CSS geometry problem remains;
  sticky-in-grid and nested overflow are supportable when ancestors do not
  introduce trapping overflow and the sticky item has a definite usable cap.
- iOS/iPadOS and short landscape views: `svh` uses the small viewport and is
  conservative as browser chrome changes. That can waste space, while a static
  `vh` can be obscured by dynamic chrome. WebKit's dynamic viewport makes a
  magic subtraction especially brittle.

For a viewport-bound sticky rail, use the existing measured header token and
Status Bar token with **`100dvh`**, with a `100vh` fallback if the supported
browser baseline requires one. `dvh` describes the current visible viewport
band; the outer `max-height` preserves natural compact height. Direct viewport
arithmetic cannot be eliminated completely while one boundary is sticky and
the other fixed, but it can be semantic rather than a magic `12rem` estimate.

## 9. Sticky-owner feasibility

### `.workspace-layout__right` — recommended

- It is already the semantic right rail and belongs to the layout layer.
- Its current ancestors have visible overflow, and the content grid uses
  `align-items: start`, a suitable sticky-grid configuration.
- `top: var(--page-header-height)` keeps it below the rendered sticky header.
- Short Cargo content leaves the rail at natural height.
- Tall content can be capped by its child Cargo shell while the rail holds its
  viewport position during Matrix/document scrolling.
- The container-query rule can explicitly reset sticky positioning in the
  stacked layout.

### `.cargo-pads`

This is mechanically viable and has the simplest box tree, but it mixes
workspace positioning policy into a feature component. It is a reasonable
fallback if the right region later hosts siblings that must not stick. Today,
the right region is the cleaner owner.

### New inner cargo-shell wrapper

No new wrapper is justified by current markup. `.cargo-pads` already encloses
the heading, actions, and list, so it can own flex and maximum-height behavior.

## 10. Outer-shell versus list ownership

The viewport cap should move from `.cargo-pads__list` to `.cargo-pads`:

```text
.workspace-layout__right
  sticky owner in the two-column layout

.cargo-pads
  display: flex
  flex-direction: column
  max-height: current viewport - measured header - fixed Status Bar
  natural height when content is shorter

.cargo-pads__list
  flex: 1 1 auto
  min-height: 0
  overflow-y: auto
  no direct calc(100svh - 12rem)
```

`max-height`, rather than mandatory `height`, is essential: all-collapsed and
other short states retain their compact natural height. The heading and actions
remain outside the scroller. `min-height: 0` is required on the flexing list so
its intrinsic content height may shrink; adding it to any intermediate flex
item is prudent if implementation introduces one.

## 11. Stacked-layout implications

The existing `@container selected-outpost (max-width: 39rem)` materially
changes the structure from a side-by-side rail to sequential content. At that
breakpoint:

- reset `.workspace-layout__right` to `position: static` and `top: auto`;
- do not pin Cargo over the preceding Matrix;
- retain a bounded independent Cargo list only if its shell can be aligned into
  the usable header-to-status band through ordinary document scrolling;
- verify the heading is not hidden behind the sticky Page Header, as occurred
  in the 844 x 390 diagnostic;
- do not make iPhone landscape a release gate, but use it as a stress test.

The implementation should prefer a clean sequential stacked experience over
forcing the desktop sticky-rail contract into a single column. If the same
shell cap remains in stacked mode, it should use the authoritative tokens and
be manually verified at entry and document-end positions. If that remains
fragile, a stacked-only natural-height/document-scroll fallback is safer than a
partially occluded sticky rail, although it relaxes independent scrolling at
that breakpoint.

## 12. Focus and accessibility implications

DOM order and screen-reader reading order need not change. Existing disclosure
buttons and labels remain intact.

`focusAndReveal()` already:

1. discovers vertical nested scroll ancestors;
2. reveals the target inside `.cargo-pads__list`;
3. computes the document-visible band from the rendered Page Header bottom and
   Status Bar top;
4. repeats the check on the next animation frame.

That is compatible with a sticky rail and flexed list. Safeguards for the later
implementation are:

- verify focus on every expanded control and the last disclosure at both ends
  of the Cargo list;
- verify the sticky shell never occupies the Header or Status Bar rectangles;
- retain the post-layout focus recheck because flex and sticky settling can
  change rectangles;
- add a focused regression test if the shell changes which element is detected
  as the nested vertical scroll owner;
- retain semantic source order; do not visually reorder the rail with CSS.

## 13. Reshuffle and drag implications

Keyboard up/down controls operate on stable IDs and are geometrically
unaffected. Drag insertion uses each item's live `getBoundingClientRect()` and
`event.clientY`, so sticky relocation itself should not invalidate drop
coordinates. Markers remain descendants of the list and should continue to be
clipped by its overflow box.

Native drag autoscroll is the uncertainty. Changing the overflow box's height
and placing its ancestor in a sticky rail may expose browser differences. The
implementation must verify dragging to both the top and bottom edges in
Chromium, and spot-check Firefox/WebKit where available. Do not redesign
reshuffling as part of the geometry change.

## 14. Browser compatibility assessment

The recommended primitives—CSS Grid, `position: sticky`, column flex,
`min-height: 0`, nested `overflow-y: auto`, custom properties, and dynamic
viewport units—are appropriate for current Chromium, Firefox, and WebKit.
Compatibility depends more on composition than individual feature support:

- no ancestor of the sticky rail should acquire `overflow: hidden/auto` unless
  that ancestor is intentionally the sticky containing block;
- keep `align-items: start`/`align-self: start` so the grid item has room to
  stick rather than stretch;
- constrain the outer shell and put overflow only on the inner list;
- use measured header and shared footer variables;
- provide a viewport-unit fallback according to the project's supported
  browser policy;
- spot-check WebKit because sticky grid items plus nested overflow and changing
  browser chrome are historically more sensitive there.

## 15. Option comparison

| Option | Assessment | Result |
| --- | --- | --- |
| A. Adjust `calc(100svh - 12rem)` | A different constant may improve one screenshot but cannot account for current list top, header wrapping, document scroll, footer height, zoom, or stacked placement. | Reject |
| B. Compute a better list max-height | Using header/status tokens is better, but applying the value directly to a normal-flow list still lets its viewport position drift during page scrolling. | Insufficient alone |
| C. Sticky right Cargo rail + outer flex shell + inner scroller | Aligns Cargo with the usable viewport band, preserves independent scroll and natural collapsed height, uses existing shell ownership and tokens, and can reset at the stacking breakpoint. | **Recommend** |
| D. Remove Cargo's scrollbar | Simplifies geometry but defeats the explicit workflow of retaining Cargo context while scrolling the Matrix/page. | Reject |
| E. JavaScript measure list top continuously | Could produce an exact height, but duplicates layout logic, adds scroll/resize observation, and is unnecessary because the shell already measures header height and CSS sticky/flex can express the desktop relationship. | Reject unless CSS verification fails |

## 16. Recommended architecture

1. Make `.workspace-layout__right` the sticky owner in the two-column layout.
2. Use `top: var(--page-header-height)`.
3. Make `.cargo-pads` a column flex shell with a semantic maximum height based
   on `100dvh - var(--page-header-height) - var(--status-bar-height)` (plus only
   an intentional existing layout gap, if required by visual alignment).
4. Remove `max-height: calc(100svh - 12rem)` from `.cargo-pads__list`.
5. Give the list `flex: 1 1 auto`, `min-height: 0`, and retain
   `overflow-y: auto`.
6. Keep heading and actions as non-scrolling shell children.
7. In the `39rem` selected-outpost container query, reset the right rail's
   sticky positioning and validate the chosen stacked shell cap/fallback.
8. Do not add JavaScript measurement. The existing Page Header observer is the
   authoritative dynamic measurement mechanism.

This scope is bounded to `WorkspaceLayout.css` and `CargoPadsEditor.css`, plus
focused layout/interaction tests if the repository's test style supports them.
No TSX wrapper, domain, persistence, Undo/Redo, schema, cargo semantics,
breakpoint, header/status dimension, or interaction redesign is indicated.

## 17. Proposed implementation outline

Without changing code in this audit:

```css
/* two-column concept, not a copy-ready patch */
.workspace-layout__right {
  position: sticky;
  top: var(--page-header-height);
  align-self: start;
}

.cargo-pads {
  display: flex;
  flex-direction: column;
  max-height: calc(
    100dvh - var(--page-header-height) - var(--status-bar-height)
  );
}

.cargo-pads__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* remove calc(100svh - 12rem) */
}

@container selected-outpost (max-width: 39rem) {
  .workspace-layout__right {
    position: static;
    top: auto;
  }
}
```

The real implementation should add any necessary fallback declaration before
`100dvh`, confirm whether one existing layout gap belongs in the formula, and
resolve the stacked cap after runtime verification rather than copying this
concept literally.

## 18. Finite later verification plan

### Required matrix

| Dimension | Values |
| --- | --- |
| Viewport | 1366 x 768; 1600 x 900; short-height 844 x 390 diagnostic |
| Layout | two-column; stacked at/around the `39rem` container threshold |
| Expansion | all collapsed; one expanded; multiple expanded |
| Document position | page near top; Header sticky threshold; deep Matrix scroll; document end |
| Zoom | 100%; 200% |
| Contrast | default; Windows High Contrast if it changes borders/box metrics |
| Browser | Chromium; Firefox; WebKit/Safari spot check |

### Assertions

- The two-column right rail stays below the rendered Page Header.
- The Cargo shell/list bottom does not cross the Status Bar top.
- Collapsed content retains natural compact height; no mandatory full-height
  empty panel appears.
- Tall Cargo content remains independently scrollable.
- The final expanded control and final disclosure are reachable.
- Matrix/document scrolling does not move the sticky Cargo context.
- No unexplained bottom gap appears from stale viewport arithmetic.
- The stacked layout does not overlay Matrix content or hide the Cargo heading.
- Keyboard focus reveal works at list extremes and at 200% zoom.
- Expand All/Collapse All, add/remove, link selectors, and export toggles remain
  operable.
- Keyboard reorder and pointer insertion markers remain correct.
- Native drag autoscroll works at both list edges, or a browser-specific gap is
  documented before release.
- `--page-header-height` updates after header wrap/locale/font changes.
- The shared `--status-bar-height` remains the sole footer dimension.

## 19. Release-readiness disposition

**CGEO-C — bounded sticky/flex geometry refactor recommended.**

Current behavior is not intentional or acceptable for the stated workflow.
The issue does not require a broader workspace-shell redesign: existing layout
boundaries, measured header geometry, and Status Bar token are sufficient for a
focused CSS refactor. Release readiness should be reassessed after the finite
verification matrix above passes, with particular attention to stacked mode,
200% zoom, focus reveal, and drag autoscroll.

## Audit integrity

- Only this audit report was created.
- The supplied brief and screenshots were not modified.
- No source/runtime file was modified.
- No build or full test suite was run, as directed for report-only work.
- No commit, push, or deployment occurred.

