# CODEX AUDIT BRIEF — Resource/Product Control Geometry

## Objective

Perform a **bounded geometry audit** of the controls used to represent Starfield resources and manufactured products across the tracker.

The immediate purpose is to establish the current geometry before deciding whether any technical-token clipping should be fixed locally or whether some dimensions should be harmonized across surfaces.

This is **an audit, not an implementation task**.

Do not change CSS, markup, layout, copy, abbreviations, button dimensions, grid tracks, or application behaviour.

The central questions are:

1. What resource/product control geometries are currently used?
2. Which differences are intentional consequences of each surface's layout role?
3. Which tokens, if any, visibly clip or become ambiguous?
4. Are width, height, padding, font size, line-height, border, and overflow behaviour all contributing?
5. Would a common geometry be feasible without disturbing accepted layout constraints?
6. If harmonization is desirable, should it include **height as well as width**?

The user has explicitly noted that vertical space is under less pressure than horizontal space. Therefore, do not treat this as a width-only investigation.

---

## Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read repository guidance first:

```text
AGENTS.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/audits/RELEASE-READINESS-REVIEW.md
```

Also inspect any existing layout/capacity/geometry audits relevant to:

```text
Resource Matrix
Planned Supply
Cargo Pads / Cargo Links
compact technical-token geometry
1366px layout constraints
200% zoom/reflow
High Contrast/forced-colors
```

Preserve existing accepted layout decisions unless this audit demonstrates a concrete reason to revisit them.

---

## Scope

Audit **only resource/product controls and their directly relevant containers**.

Primary surfaces:

```text
Resource Matrix
Planned Supply
Cargo Links / expanded cargo-pad export controls
```

Include all resource/product states within those surfaces, including passive/read-only variants where the same token geometry is used.

Do **not** include unrelated controls such as:

```text
Undo / Redo
Add
Remove
Reshuffle
expand/collapse buttons
help buttons
select controls
inter-system toggle
general dialog/action buttons
```

If a resource/product label is shown as plain text rather than a button/tile in one state, record that separately when relevant to token visibility, but do not broaden this into a general typography audit.

---

## Known starting observations — verify, do not assume

Previous inspection suggested the following current CSS values:

```text
Resource Matrix:
  width 3.2rem
  height 1.55rem
  mono font around 0.74rem

Planned Supply:
  base width 3.15rem
  organic/product width 3.35rem
  height 2.15rem
  mono font around 0.76rem

Cargo export toggles:
  width 2.8rem
  height 1.65rem
  mono font around 0.72rem
```

Treat these as starting observations only.

Verify the current committed source and rendered geometry.

---

## 1. Source inventory

Identify every CSS class/component that controls resource/product token geometry in the three primary surfaces.

At minimum inspect:

```text
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css

src/ui/components/PlannedSupplyEditor.tsx
src/ui/components/PlannedSupplyEditor.css

src/ui/components/CargoExportsEditor.tsx
src/ui/components/CargoPadEditor.tsx
src/ui/components/CargoPadEditor.css
src/ui/components/CargoPadsEditor.tsx
src/ui/components/CargoPadsEditor.css
```

Follow imports/reused components if necessary.

For each geometry owner, record:

```text
component/class
semantic role
resource/product population
state(s)
width
height/min-height
box-sizing
padding
border width
font family
font size
font weight
line-height
white-space
overflow
text-overflow
focus outline and whether it consumes interior space
forced-colors border changes
responsive/container-query overrides
```

Where dimensions are inherited or variable-based, trace the actual source.

---

## 2. Geometry matrix

Produce a concise comparison table.

Suggested structure:

| Surface | Control/state | Width | Height | Padding | Font | Overflow | Notes |
| --- | --- | ---: | ---: | --- | --- | --- | --- |

Separate materially distinct variants, for example:

```text
Matrix editable state
Matrix passive/read-only state
Planned Supply inorganic
Planned Supply organic
Planned Supply product
Planned Supply compact/collapsed
Cargo export resource
Cargo export product
Cargo stale state if geometry changes
```

If variants share identical geometry, group them and explicitly say so.

---

## 3. Rendered measurement

Do not rely only on CSS declarations.

Measure rendered controls in a real browser where practical.

Preferred baseline:

```text
Windows Chromium
1366 × 768
100% browser zoom
default font loading successful
```

Also inspect:

```text
1600 × 900 at 100%
1366 × 768 at true 200% browser zoom
Windows High Contrast / forced-colors where available
```

Record actual rendered:

```text
border-box width
border-box height
content-box width if useful
computed font size
computed line-height
```

If browser measurement is unavailable, say so and keep CSS-derived versus rendered measurements clearly separated.

---

## 4. Representative technical tokens

Test representative short and long resource/product abbreviations.

At minimum include:

```text
R-COOH
SiH3Cl
```

Also identify from the actual catalogue:

```text
longest visible resource abbreviation
longest visible manufactured-product abbreviation
longest punctuation-heavy token
longest token by rendered pixel width, if different
```

Do not invent new abbreviations.

Use the exact tracker catalogue.

Record whether each token:

```text
fits fully
touches/presses the visual envelope
clips visibly
clips only at focus/forced-colors
remains visually distinguishable
has a title/tooltip/full accessible name
```

Do not treat accessible full-name exposure as automatically making visible clipping acceptable; report both facts separately.

---

## 5. Width and height analysis

Assess width and height independently.

### Width

For each surface, determine:

```text
available interior width after border/padding
pixel width of representative tokens
remaining horizontal slack
whether the current width is constrained by parent/grid geometry
whether a modest width increase would change wrapping or total section width
```

### Height

For each surface, determine:

```text
actual vertical content area
vertical centering
top/bottom padding
line-box height
focus/forced-colors border interaction
whether the existing height is visually cramped or unnecessarily large
```

Because vertical space is less constrained, explicitly assess whether a future harmonized geometry could sensibly use a common height even if widths remain different.

Do not assume that current taller Planned Supply tiles are desirable merely because they exist.

---

## 6. Parent-layout constraints

For every primary surface, identify what constrains the token geometry.

### Resource Matrix

Assess:

```text
fixed/shared grid tracks
accepted 1366px footprint
header/body alignment
horizontal overflow
state-list wrapping
whether control width can increase without changing table geometry
```

The previous accepted Matrix header/body geometry must not be casually disturbed.

### Planned Supply

Assess:

```text
catalogue grid pitch
family layouts
special strip
organic/product paired catalogue
compact list wrapping
horizontal overflow behavior
```

Determine whether 3.15rem versus 3.35rem is intentional and whether the height is tied to catalogue grammar.

### Cargo

Assess:

```text
available width in expanded cargo cards
number of export buttons per row
wrap behaviour
resource/product grouping
card width
relationship to narrow workspace column
```

Cargo currently appears to use the narrowest token geometry; determine whether that is a necessary constraint or historical/local styling drift.

---

## 7. State consistency

Check whether pressed/selected/planned/available/stale/disabled states alter the usable text envelope.

Pay particular attention to:

```text
border width changes
double borders
forced-colors borders
outline offset
font-weight changes
opacity
background patterns
```

If a token fits in the neutral state but clips in selected or forced-colors state, record that separately.

---

## 8. Accessibility

For each surface confirm:

```text
accessible name/full item name
tooltip/title behavior where present
focus visibility
no color-only semantic state
forced-colors resilience
```

This audit does not authorize accessibility redesign.

The question is only whether geometry changes would interact with existing accessibility affordances.

---

## 9. Harmonization analysis

After inventory and measurement, evaluate these possibilities without implementing any:

### H0 — Keep all current geometries

Appropriate if differences are clearly purposeful and clipping is negligible/acceptable.

### H1 — Local fix only

Example:

```text
widen Cargo export tokens only
```

Appropriate if one surface is demonstrably the outlier and harmonization provides no broader benefit.

### H2 — Harmonize height only

Appropriate if a common vertical rhythm is desirable while horizontal constraints genuinely differ.

### H3 — Harmonize width and height across all three surfaces

Appropriate only if a shared geometry fits all parent layouts without damaging accepted density/alignment.

### H4 — Harmonize by semantic family

For example:

```text
one geometry for compact matrix/cargo controls
one geometry for catalogue-style Planned Supply tiles
```

Use this if the surfaces fall naturally into two functional classes.

Do not assume full harmonization is intrinsically better.

---

## 10. Common target candidates

If evidence supports harmonization, propose one or more **candidate** geometries.

For each candidate include:

```text
width
height
padding
font size
expected effect on R-COOH
expected effect on SiH3Cl
effect on shortest tokens
effect on row wrapping
effect on 1366px layout
effect at 200% zoom
```

Do not implement the candidate.

Do not choose a target merely by averaging the current values.

The chosen candidate should be driven by:

```text
content fit
layout constraints
visual rhythm
density
accessibility
```

---

## 11. Recommendation categories

End the audit with one of:

```text
GEO-A — Current differences are justified; no pre-release change recommended.

GEO-B — One local geometry defect should be corrected pre-release; broader harmonization should be deferred.

GEO-C — A small shared geometry change is justified pre-release and can be implemented without disturbing accepted layout constraints.

GEO-D — Geometry inconsistency is real but resolving it safely requires coordinated layout work; defer to post-release.

GEO-E — Evidence is insufficient; retain current geometry and document what additional measurement is needed.
```

If useful, give a secondary recommendation such as:

```text
primary: GEO-B
future: evaluate H2 height harmonization post-release
```

---

## 12. Pre-release decision standard

This is optional pre-release polish.

Do not recommend implementation merely because dimensions differ.

A pre-release change should require evidence that:

```text
a current token is visibly clipped/ambiguous, or
the current geometry creates a concrete consistency/accessibility defect,
```

and that the correction is narrow enough not to destabilize:

```text
1366px layout
Matrix alignment
Cargo wrapping
Planned Supply catalogue structure
200% zoom/reflow
```

“Safe to defer” is an acceptable and useful audit result.

---

## 13. Non-goals

Do not:

```text
change abbreviations
change resource/product names
change Matrix column widths
change accepted Matrix header geometry
redesign Planned Supply
redesign Cargo cards
alter domain/state semantics
change mobile layout
add tooltips
change localization
implement responsive redesign
introduce shared CSS abstractions
```

A later implementation brief may authorize a small geometry change after user review.

---

## 14. Deliverable

Create only:

```text
docs/audits/RESOURCE-PRODUCT-CONTROL-GEOMETRY-REVIEW.md
```

or an equally clear repository-consistent filename.

The report should contain:

1. baseline;
2. source inventory;
3. geometry comparison matrix;
4. rendered measurements;
5. token-fit results;
6. parent-layout constraints;
7. state/accessibility interactions;
8. harmonization options H0–H4;
9. any candidate dimensions;
10. GEO-A/B/C/D/E recommendation;
11. explicit pre-release versus post-release recommendation;
12. manual checks needed if implementation is later authorized.

---

## 15. Verification

Because this is report-only:

```text
git diff --check
```

Confirm:

```text
only the audit report was created
no CSS/TSX/runtime/test/document-owner file changed
no commit/push/deployment occurred
```

No full test/build run is required unless the audit tooling itself changes tracked source.

If browser measurements are performed, record:

```text
browser/version
OS
viewport
zoom
font-loaded state
forced-colors state
```

Do not present emulated viewport dimensions as proof of true browser zoom.

---

## Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. current dimensions for Matrix, Planned Supply, and Cargo;
4. all meaningful variants;
5. longest/problematic tokens;
6. where clipping actually occurs;
7. whether width or height is the dominant constraint;
8. whether current differences appear intentional;
9. harmonization options considered;
10. recommended GEO-A/B/C/D/E disposition;
11. any proposed target geometry;
12. pre-release versus post-release recommendation;
13. browser/manual evidence obtained;
14. verification performed;
15. confirmation that no implementation occurred.

Suggested commit message:

`docs: audit resource and product control geometry`
