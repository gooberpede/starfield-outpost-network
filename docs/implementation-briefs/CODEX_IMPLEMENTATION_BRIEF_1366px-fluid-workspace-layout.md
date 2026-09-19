# Codex Implementation Brief — 1366×768 Fluid Workspace Layout Correction

## Objective

Implement the agreed 1366×768 layout correction described in:

```text
docs/audits/LAYOUT-1366PX-REVIEW.md
```

The goals are to:

1. eliminate the Resource Matrix horizontal scrollbar at 1366×768;
2. preserve the existing three-column desktop composition at 1366px;
3. preserve current Outpost Navigation and Cargo Links widths;
4. preserve current functional identifier readability and existing ellipsis behavior;
5. introduce fluid workspace gutters and major gaps that tighten only at constrained desktop widths and restore current spacing by 1600px;
6. fix the 9px Resource Matrix section-row overshoot;
7. fix the Cargo Links `Lock order` pressed-state styling inconsistency;
8. revise/remove the now-completed 1366px backlog item according to existing backlog conventions.

No domain, data, schema, localization-content, dependency, deployment, or backend change is intended.

Do not commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before editing:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Product requirement

At:

```text
1366 × 768
100% browser zoom
maximized browser
```

the tracker must retain the same basic desktop first impression as wider desktop resolutions:

- Outpost Navigation remains on the left;
- Resource Matrix remains in the center;
- Cargo Links remains on the right;
- Matrix and Cargo Links remain side by side;
- no primary working surface requires horizontal scrolling.

Vertical scrolling is acceptable.

Intentional wrapping of controls is acceptable.

Do not stack Cargo Links below the Resource Matrix at 1366px.

The existing narrower-width stacking behavior should remain available below the constrained desktop range.

---

## Audit baseline

The audit measured:

- 1366px browser viewport;
- 1351px document client width because the vertical scrollbar consumes 15px;
- Navigation: 315px (`17.5rem`);
- Cargo Links: 324px (`18rem`);
- current Resource Matrix viewport: 631px;
- matrix floor: 684px (`38rem`);
- current matrix scroll width: 693px;
- exact overflow: 62px.

The 62px overflow consists of:

- 53px caused by the 684px matrix floor exceeding the current 631px allocation;
- 9px caused by full-width section rows protruding past the matrix floor because of their padding/box model.

The 38rem / 684px matrix floor has been re-measured and remains justified.

Do not lower it in this parcel.

---

## Agreed solution

Implement Candidate A from the audit.

### Workspace gutter

Use:

```css
--workspace-gutter:
  clamp(2.5px, calc(8.547vw - 6.347rem), 1.25rem);
```

This should:

- be approximately 2.5px per side at 1366px;
- grow smoothly with viewport width;
- reach the existing 1.25rem / 22.5px maximum by 1600px;
- remain capped at the current value above 1600px.

### Workspace major gap

Use:

```css
--workspace-major-gap:
  clamp(0.625rem, calc(2.885vw - 1.564rem), 1rem);
```

This should:

- be approximately 11.25px at 1366px;
- grow smoothly with viewport width;
- reach the existing 1rem / 18px maximum by 1600px;
- remain capped above 1600px.

These values should drive:

- Navigation → selected-outpost/workspace gap;
- Resource Matrix → Cargo Links gap.

---

## Important scoping rule

The fluid gutter is **workspace-local**.

Do not apply it globally to:

- Title Bar;
- Page Header;
- Status Bar.

Those areas keep their existing spacing.

Do not replace the global page-gutter token if that would move unrelated page regions to within 2.5px of the viewport edge.

The implementation should introduce or reuse a workspace-specific variable/token as appropriate.

---

## Geometry requirement

At 1366px, after the matrix overshoot fix, the target geometry is approximately:

```text
1351 document client width
−   5.0 total workspace outer gutters
− 315.0 Navigation
−  11.25 Navigation/workspace gap
− 324.0 Cargo Links
−  11.25 Matrix/Cargo gap
= 684.5 Resource Matrix viewport
```

Target:

- Resource Matrix viewport >= 684px;
- ideally ~684.5px as projected;
- no matrix horizontal scrollbar.

The 0.5px projected margin is intentionally narrow.

Browser rounding must be measured, not assumed.

If rounding still produces a horizontal scrollbar at 1366px:

- first reduce the minimum workspace gutter from 2.5px toward 2px;
- do not narrow Navigation;
- do not narrow Cargo Links;
- do not reduce the matrix floor;
- do not add new ellipsis.

---

## Required implementation areas

### 1. Fix the 9px Resource Matrix section-row overshoot

The audit identified padded full-width section rows as the only measured protrusion beyond the 684px matrix floor.

Current behavior:

- section heading/bar uses inline padding;
- content-box sizing lets the spanning child extend 9px beyond the declared grid width.

Correct the box/padding ownership so the section rows fit within the 684px floor.

Requirements:

- retain the current visible inset;
- do not alter shared column alignment;
- do not change the 38rem matrix floor;
- do not reduce control sizes;
- do not reduce font size;
- do not hide columns;
- preserve sticky Item behavior;
- preserve focus outline visibility.

### 2. Add workspace-local fluid gutter

Introduce the Candidate A workspace gutter formula.

Requirements:

- applies only to the workspace/content area that currently owns the side gutters around Navigation + selected outpost;
- 2.5px minimum at 1366px;
- smooth interpolation;
- 22.5px maximum by 1600px;
- no visual jump at the restoration point;
- wider desktops should look unchanged once the maximum is reached.

Do not change Title Bar/Page Header/Status Bar spacing.

### 3. Add fluid major gaps

Apply the Candidate A major-gap formula to:

- Navigation → selected-outpost gap;
- Resource Matrix → Cargo Links gap.

Requirements:

- ~11.25px at 1366px;
- 18px at 1600px and above;
- smooth interpolation between those widths;
- preserve logical visual separation between panels.

### 4. Preserve side-panel widths

Keep:

```text
Outpost Navigation = 17.5rem / 315px
Cargo Links        = 18rem / 324px minimum
```

Do not reduce either panel in this parcel.

Do not change:

- name button width rules;
- drag-handle sizes;
- row control sizes;
- font size;
- identifier ellipsis behavior.

No new truncation mechanism is permitted.

### 5. Preserve existing narrow-width stacking

Do not remove the existing responsive behavior that stacks Cargo Links below the matrix at genuinely narrow widths.

Do not move that behavior up to 1366px.

Ensure the new fluid gutter/gap rules integrate cleanly with the existing stacking breakpoint.

At widths where the existing stacked layout applies:

- preserve the current stacked behavior;
- avoid contradictory or redundant gap/gutter rules;
- verify there is no breakpoint jump or overlap.

### 6. Fix Cargo Links `Lock order` pressed-state styling

The audit confirmed:

- Outposts and Cargo Links expose the same pressed semantic state;
- both use `aria-pressed="true"` when reorder mode is active;
- only Outposts has the corresponding pressed visual treatment.

Add the missing Cargo Links pressed-state styling so it follows the same visual grammar as Outposts.

Preserve:

- hover behavior;
- focus behavior;
- disabled behavior;
- accessible pressed state semantics.

Do not change the button text or interaction model.

---

## Representative viewport verification

Verify at minimum:

```text
1366 × 768
1440 × 768
1536 × 768
1600 × 768
1920 × 768
```

At each width, inspect:

- workspace outer gutters;
- Navigation/workspace gap;
- Matrix/Cargo gap;
- Resource Matrix viewport;
- matrix horizontal overflow;
- Navigation width;
- Cargo Links width;
- page-level horizontal overflow.

Expected geometry from the audit for Candidate A:

| Viewport | Gutter / side | Major gap | Matrix width | Cargo width |
|---:|---:|---:|---:|---:|
| 1366 | 2.50px | 11.25px | ~684.50px | 324px |
| 1440 | 8.82px | 13.38px | ~741.58px | 324px |
| 1536 | 17.03px | 16.15px | ~815.63px | 324px |
| 1600 | 22.50px | 18.00px | ~865.00px | 324px |
| 1920 | 22.50px | 18.00px | ~1131.75px | normal fractional growth |

Treat these as validation targets, not reasons to force brittle pixel values elsewhere.

---

## Locale and content verification

At 1366×768, verify at least:

- `en-US`
- `ja-JP`

Inspect:

- Outpost Navigation;
- Resource Matrix;
- Cargo Links;
- Outpost Details;
- Planned Supply;
- header wrapping;
- fixed footer/status bar;
- About dialog;
- Validation Summary.

Japanese wrapping that increases vertical height is acceptable if readable and reachable.

Do not introduce locale-specific layout hacks unless a real regression appears.

---

## Identifier stress verification

At 1366px, verify representative long identifiers, including the existing 25-character outpost-name stress case.

Check:

- normal Navigation mode;
- Outpost Reshuffle mode;
- Cargo normal mode;
- Cargo Reshuffle mode;
- inter-system cargo rows;
- regular cargo rows.

Requirements:

- no additional truncation compared with current behavior;
- no new ellipsis rule;
- no clipping;
- no overlap;
- no control displacement.

---

## Accessibility and interaction regression checks

Recheck:

- keyboard focus outlines in matrix controls;
- sticky Item cells;
- header/help clearance;
- panel focus states;
- Lock order pressed state;
- Reshuffle controls;
- mouse and keyboard interaction;
- visible logical grouping after gaps compress.

Do not accept a width fix that hides or clips focus indicators.

---

## Tests

Add or update tests only where they provide durable value.

Potential areas:

- class/state behavior for Cargo Links pressed styling;
- layout token application if the repository has suitable component/CSS regression coverage.

Do not create brittle tests that assert exact browser-pixel geometry if the existing test stack is not designed for that.

The critical geometry verification is browser-based.

---

## Backlog update

Inspect:

```text
docs/BACKLOG.md
```

Locate the existing 1366px / constrained desktop layout item.

After successful implementation and verification:

- mark it complete or remove it according to the repository's existing backlog conventions;
- ensure no stale wording remains suggesting the 1366px review is still pending;
- if the backlog item contains unresolved sub-items that remain genuinely open, preserve only those specific residual items rather than leaving the completed parent task ambiguous.

Do not perform unrelated backlog grooming.

The `Lock order` styling issue should not remain as a separate backlog item if it is fixed in this parcel.

---

## Audit document

Leave:

```text
docs/audits/LAYOUT-1366PX-REVIEW.md
```

as the historical design/audit record.

Do not rewrite it to describe implementation results unless the repository's established convention explicitly calls for a short status note.

The audit's measured findings should remain intact.

---

## Scope boundaries

Do not change:

- production domain logic;
- persistence;
- reference data;
- localization content;
- schema;
- Cloudflare;
- deployment configuration;
- Node runtime;
- dependencies;
- lockfile;
- backend architecture.

Do not change:

- Navigation width;
- Cargo Links width;
- matrix 38rem floor;
- control sizes;
- font sizes;
- name truncation rules.

Do not introduce new browser-width stacking at 1366px.

---

## Out-of-scope gameplay questions

Do not infer or implement anything relating to:

- duplicate outpost names;
- maximum character name length;
- Ocean/coastline biome behavior.

Those remain separate gameplay investigations.

---

## Verification commands

Run at minimum:

```text
node --version
npm run typecheck:tests
npm run build
npm test
npm run reference:test
npm run test:components
npm run lint
git diff --check
```

Also perform browser verification at the representative widths above.

Expected:

- no test type diagnostics;
- build passes;
- Node tests pass;
- reference tests pass;
- component tests pass;
- lint passes;
- diff check passes;
- no Resource Matrix horizontal scrollbar at 1366×768;
- no page-level horizontal scrollbar;
- side panels remain at current widths;
- no new identifier truncation;
- Cargo `Lock order` pressed styling matches Outposts.

---

## Failure conditions

Stop and report before broadening scope if:

- the 1366px matrix still scrolls horizontally after the agreed gutter/gap and 9px overshoot corrections;
- the required fix appears to need Navigation or Cargo narrowing;
- browser rounding requires more than the permitted minimum-gutter adjustment;
- the matrix floor appears to need reduction;
- identifier readability regresses;
- sticky cells or focus outlines regress;
- a different breakpoint creates overlap or contradictory rules;
- a production-code change appears necessary.

Do not force the fit by weakening established constraints.

---

## Completion response

Return:

1. concise summary;
2. current branch;
3. files changed;
4. final workspace gutter implementation;
5. final major-gap implementation;
6. final measured 1366px matrix width;
7. whether any matrix horizontal scrollbar remains;
8. matrix overshoot correction made;
9. confirmation Navigation remains 17.5rem / 315px;
10. confirmation Cargo remains 18rem / 324px minimum;
11. confirmation no new ellipsis/truncation behavior;
12. `Lock order` styling correction;
13. results at 1366 / 1440 / 1536 / 1600 / 1920;
14. English/Japanese verification;
15. long-identifier verification;
16. focus/sticky-item/accessibility verification;
17. breakpoint/stacking verification;
18. backlog item revision/removal;
19. confirmation audit remains historical;
20. test/build/reference/component/lint results;
21. `git diff --check` result;
22. confirmation no dependency/lockfile change;
23. confirmation no Cloudflare/deployment change;
24. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
