# Codex Implementation Brief — Workspace Responsive Layout and Scrollbar Consistency Pass

## Objective

Improve the desktop workspace so Navigation, Resource Matrix, and Cargo Pads all participate in horizontal resizing instead of forcing the Resource Matrix into horizontal scrolling too early.

Also apply the established thin scrollbar treatment to:
- Cargo Pads vertical scrolling;
- Resource Matrix horizontal scrolling.

This is a focused layout-and-consistency pass.

## Visual references supplied

Use these screenshots alongside the brief as runtime references, not exact pixel targets:

- `app-wide.PNG`
- `app-normal.PNG`
- `app-first-matrix-scrollbar-appearance.PNG`
- `app-narrow.PNG`

The key observed problem is that Navigation and Cargo remain nearly fixed while the Matrix absorbs most width changes, causing matrix overflow after only a small reduction in browser width.

## 1. Inspect first

Read relevant repository guidance and inspect at minimum:

- `src/ui/layout/WorkspaceLayout.tsx`
- `src/ui/layout/WorkspaceLayout.css`
- `src/ui/components/OutpostList.*`
- `src/ui/components/OutpostStatusMatrix.*`
- `src/ui/components/CargoPadsEditor.*`
- `src/index.css`
- the thin scrollbar utility/style introduced for Validation

Also inspect applicable project docs such as `AGENTS.md`, `docs/UX-DESIGN.md`, and architecture/domain guidance.

## 2. Audit current runtime layout before changing it

At representative viewport widths corresponding roughly to the supplied screenshots, measure and report:

- Navigation computed width;
- Matrix/center computed width;
- Cargo computed width;
- Matrix `clientWidth` / `scrollWidth`;
- Cargo scroll-container dimensions;
- relevant `width`, `min-width`, `max-width`, grid/flex constraints;
- viewport width where matrix horizontal overflow first appears.

Identify which declarations are effectively fixing Navigation and Cargo widths and what determines the Matrix minimum width.

Do not guess from screenshots alone.

## 3. Core responsive rule

Implement this design rule:

> All three workspace columns should participate in horizontal resizing until each reaches a sensible minimum usable width. Only then should the Resource Matrix begin horizontal scrolling.

Do not simply assign three equal percentages.

Preferred direction: CSS Grid with proportional tracks and `minmax()` (or an equally clear responsive mechanism).

Conceptually:

- Navigation = narrowest, modestly flexible;
- Matrix = largest and most elastic;
- Cargo = meaningfully flexible, secondary operational pane.

A rough starting relationship such as `15–18% / 60–65% / 20–25%` is acceptable for exploration, but tune values from runtime behavior rather than copying those numbers mechanically.

## 4. Functional minimums

### Navigation
Allow it to shrink materially while:
- outpost names remain readable;
- `+ Add Outpost`;
- `Reshuffle` / `Lock order`;
- selection marker and counts
remain usable.

Existing ellipsis/truncation is acceptable.

### Matrix
Keep the largest share of width.

Do not introduce horizontal scrolling while enough width can still be reclaimed from Navigation and Cargo.

Scrolling becomes appropriate only when further compression would cause controls, headers, cells, or column semantics to collide or become impractical.

### Cargo
Allow Cargo to shrink and expand meaningfully.

It may become narrower than today provided:
- summary rows remain legible;
- ordinal gutter/disclosure remain usable;
- remote outpost names may ellipsize;
- expanded selectors/buttons do not overlap;
- export buttons remain usable.

## 5. Wide and narrow behavior

At wide widths:
- all three panes may grow;
- Matrix gets most extra width;
- Navigation and Cargo should also gain some width rather than staying fixed.

As the browser narrows:
- Navigation contracts;
- Cargo contracts;
- Matrix contracts;
- matrix horizontal overflow appears only after practical minima are reached.

The current `app-first-matrix-scrollbar-appearance.PNG` threshold should occur later unless measured control geometry proves otherwise.

## 6. Avoid page-level horizontal overflow

Prefer internal Matrix horizontal scrolling when genuinely necessary.

Do not introduce unnecessary horizontal scrolling on the outer page/workspace.

## 7. Matrix horizontal scrollbar

When Matrix horizontal overflow is required, apply the same thin technical scrollbar language as Validation:

- thin;
- low contrast;
- minimal track;
- simple thumb;
- no chunky native appearance.

Use the existing shared scrollbar utility if practical.

Do not build a custom JavaScript scrollbar.

## 8. Cargo vertical scrollbar

Apply the same thin scrollbar treatment to Cargo Pads vertical scrolling.

Preserve current:
- max-height behavior;
- expanded-pad scrolling;
- reshuffle behavior;
- scroll semantics.

## 9. Shared scrollbar treatment

If Validation already introduced a reusable class/utility, reuse it.

A small shared utility is acceptable if needed.

Do not globally restyle every scrollbar unless the existing architecture already makes that clearly safe.

## 10. Check truncation and alignment

At tested widths verify:
- remote outpost names expand when space is available;
- ellipsis appears only when needed;
- Navigation labels behave consistently;
- pane top edges and separators remain aligned;
- resizing does not create awkward gaps or misaligned rules;
- Cargo ordinal gutter remains unchanged and aligned.

## 11. Explicitly out of scope

Do not change in this pass:

- purple cargo drag/drop insertion indicator;
- Delete Network vs Reset Network wording;
- manufactured-product availability / Planned Supply feasibility bug;
- validation click-to-navigate;
- icons;
- mobile redesign;
- network diagram.

The purple drop indicator may be noted for the later consistency pass, but should not be intentionally changed here.

## 12. Testing

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Browser-test at:
- very wide desktop;
- ordinary desktop;
- moderately narrow desktop;
- current first-overflow region;
- narrow desktop.

For representative widths record:
- Navigation width;
- Matrix width;
- Cargo width;
- whether Matrix overflow exists;
- whether Navigation or Cargo controls collide/clip.

Verify interactions still work:
- Navigation selection/reshuffle;
- Cargo expand/collapse;
- Cargo reshuffle/drag/drop;
- Cargo selectors/buttons;
- Matrix controls;
- Planned Supply disclosure;
- Validation;
- no console errors/warnings.

Before Matrix minimum is reached:
- no horizontal scrollbar;
- no overlapping controls.

After Matrix minimum is reached:
- horizontal scrollbar appears;
- it uses the thin styling;
- Matrix remains fully navigable;
- outer page does not gain unnecessary horizontal scrolling.

Cargo vertical overflow:
- scrollbar remains functional;
- uses thin styling;
- expanded pads remain reachable.

## 13. Completion report

Report:
- original pane sizing model;
- original computed widths at representative viewports;
- original matrix-overflow threshold;
- CSS rules causing rigidity;
- new sizing model;
- new track fractions/minimums/breakpoints if any;
- new matrix-overflow threshold;
- scrollbar classes/utilities used;
- files changed;
- test and browser-smoke results.

Explicitly state whether:
- domain logic changed;
- Cargo semantics changed;
- Navigation semantics changed;
- Matrix data logic changed;
- validation logic changed;
- any out-of-scope styling changed;
- whole-page horizontal scrolling was introduced;
- any new breakpoint was added.

Do not commit or push unless explicitly asked.

## Suggested commit message

```text
fix: improve workspace responsive sizing
```

## Final instruction

The desired result is:

```text
Navigation contracts
Cargo contracts
Matrix contracts
Matrix scrolls only when genuinely necessary
Matrix/Cargo scrollbars use the established thin technical style
```

Choose exact CSS values from measured runtime behavior, not from screenshot guesswork.
