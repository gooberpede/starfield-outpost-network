# CODEX IMPLEMENTATION BRIEF — Resource Matrix Header Geometry Stabilization

## Objective

Implement the Resource Matrix **header-geometry correction** identified by:

`docs/audits/RESOURCE-MATRIX-HEADING-EDITORIAL-REVIEW.md`

The goal is to make the current full localized Matrix headings fit and behave predictably **without widening the Resource Matrix overall and without changing the geometry of the data cells/buttons beneath the headings**.

This is a geometry/layout pass only.

Do not change localized Matrix copy in this tranche.

---

## Hard product constraints

### A. Do not widen the Resource Matrix arbitrarily

The current Matrix footprint was tuned specifically so the application can operate on a 1366 px display without introducing a page-level horizontal scrollbar.

Preserve that behavior.

Do not:

- increase the Matrix’s overall minimum width;
- increase the workspace width requirement;
- introduce a new document-level horizontal scrollbar at 1366 px;
- solve header text pressure by simply widening the whole Matrix.

Any extra heading space must come from **better use of the existing width**.

### B. Do not change body-cell/button geometry

The header may use different internal presentation geometry from the body, but the underlying Matrix data-cell layout must remain stable.

Do not make resource/product/state buttons wider or narrower merely to make headings fit.

Preserve current body geometry for:

```text
Item
Source
Present
Producing
Inputs
Logistics
```

including existing:

- row alignment;
- button widths;
- state-cell widths;
- stacked Inputs presentation;
- single-button Logistics presentation;
- sticky Item behavior;
- horizontal-scroll behavior;
- relationship to adjacent Cargo Links panel.

A header-only change must not ripple into button geometry.

---

## Current problem

The audit established that some accepted full translations create unstable or excessive wrapping.

Known examples include:

```text
French        En production
German        In Produktion
Italian       In produzione
Polish        W produkcji
Portuguese    Em produção
Spanish       En producción

German        Einsatzstoffe
Italian       Materiali richiesti
Polish        Wymagane materiały
Spanish       Materiales de entrada
```

The problem is not that these translations are wrong.

The problem is that the current header presentation gives some columns insufficient or unstable text space.

Relevant audit findings include:

- Producing reserves space for a help affordance and has inconsistent usable width across breakpoints;
- Inputs is too narrow for some accepted full labels;
- Spanish Inputs reaches three lines at 1366 px;
- German Inputs can exceed the available content width;
- Portuguese/Polish Producing behavior can become less stable at the wider viewport because of padding changes.

---

## Design principle

Treat the Matrix as two related but distinct geometries:

```text
BODY GEOMETRY
    authoritative data-column tracks
    must remain unchanged unless explicitly approved later

HEADER PRESENTATION GEOMETRY
    may redistribute internal label/help space
    may allow labels to visually borrow unused neighboring header space
    must remain clearly associated with the correct body columns
```

The header does **not** need to reproduce the body track geometry pixel-for-pixel internally.

However:

- each heading must still visually align with its logical column;
- the user must not be confused about which heading belongs to which controls;
- help affordances must remain associated with the correct heading;
- header overlap must never obscure neighboring labels or controls.

---

## Preferred investigation order

Implement in this order unless repository structure clearly suggests an equivalent safer approach.

### First: Producing header mechanics

Normalize Producing header-only spacing.

Investigate:

- padding;
- text/help flex behavior;
- explicit help-affordance reservation;
- line wrapping;
- breakpoint-dependent spacing.

Goal:

- preserve the existing Producing body column width;
- give the heading a stable text budget;
- avoid the current behavior where usable text space can shrink unexpectedly at a wider viewport;
- support controlled one- or two-line wrapping without overlap.

Do not alter the Producing state buttons/cells beneath it.

### Second: Logistics as the first donor of header presentation space

The Logistics body column is visually sparse compared with Inputs and generally contains at most one compact button per row.

The current UI also shows unused room between Logistics content and the right side of the Matrix.

Therefore investigate whether **Logistics header presentation** can surrender some unused horizontal space without changing the underlying Logistics body track.

Possible strategies include:

- right-aligning or repositioning the Logistics header label/help group inside its existing track;
- reducing unnecessary header-only padding;
- allowing neighboring Inputs header text to visually extend into otherwise unused header space;
- using an overlay/header-grid treatment where the visible header boxes are not identical to the body tracks.

Do not reduce the width of Logistics buttons/cells beneath the heading.

### Third: Inputs header borrowing

If safe space exists around the Logistics header, allow the **Inputs heading presentation box** to borrow that space.

Conceptually:

```text
BODY TRACKS — unchanged

[ Inputs body track ][ Logistics body track ]

HEADER PRESENTATION

[    Inputs heading may extend → ][ Logistics heading/help ]
```

The visible Inputs heading may be wider than the Inputs body track if:

- the heading still clearly belongs to Inputs;
- Logistics remains clearly identifiable;
- the Logistics help button remains usable;
- no overlap occurs;
- focus/hit areas remain correct.

Do not change Inputs body-cell/button width.

---

## Controlled wrapping contract

The target is a **stable maximum of two text lines** for Matrix headings in supported desktop layouts.

Requirements:

- no accepted heading should need three lines at 1366 px;
- two-line headings must not cause uncontrolled header-height jitter;
- one-line locales should remain visually compact;
- the header row should accommodate mixed one-line/two-line labels cleanly;
- help buttons must remain vertically and horizontally stable.

Do not force every heading to two lines.

Do not vertically center text in a way that makes column associations ambiguous.

---

## Help affordance geometry

Present, Producing, and Logistics include help controls.

Treat the full interactive target as part of the layout budget, not only the visible icon.

Reserve for:

- visible icon;
- gap to text;
- expanded pointer hit area;
- focus outline;
- keyboard focus visibility.

The text must not visually fit while the invisible hit area overlaps a neighboring heading.

Preserve:

- current accessible help semantics;
- keyboard reachability;
- tooltip/context-help behavior;
- visible focus indication.

Do not reduce hit targets merely to gain text space.

---

## Inputs has no header help control

Inputs differs from Present/Producing/Logistics because it currently has no header help affordance.

That makes it the safest candidate for a wider visible label box, provided its association with the Inputs body column remains visually clear.

Do not add a help button in this tranche.

Do not change Inputs semantics or localized copy.

---

## Keep all Matrix heading copy unchanged

Do not introduce any compact Matrix labels in this implementation.

Retain current accepted catalogue strings.

Specifically do not replace:

```text
En production       → Production
In Produktion       → Produktion
In produzione       → Produzione
W produkcji         → Produkcja
Em produção         → Produção
En producción       → Producción
Materiales de entrada → Insumos
```

or any other audited candidate.

This pass must prove that geometry can handle the accepted full labels first.

---

## Locale behavior

Verify the current full headings across all ten runtime locales:

```text
en-US
en-GB
fr-FR
de-DE
it-IT
ja-JP
pl-PL
pt-BR
zh-Hans
es-ES
```

Do not add locale-specific CSS.

Avoid language-specific geometry exceptions unless an extraordinary typography-specific reason is discovered and documented.

Prefer shared header geometry that works across all locales.

---

## 1366 px constraint

1366×768 is a hard acceptance viewport.

At this size verify:

- no new document-level horizontal scrollbar;
- Resource Matrix width does not increase;
- Cargo Links remains positioned as before;
- Item sticky behavior remains correct;
- Inputs/Logistics body-cell alignment unchanged;
- Spanish Inputs no longer requires three heading lines;
- German Inputs is no longer visibly overpressured/clipped;
- Producing headings wrap predictably;
- help controls do not collide with heading text.

If this cannot be achieved without changing body tracks, stop and report rather than widening the Matrix silently.

---

## 1600 px behavior

Also verify 1600×900.

The wider viewport must not produce worse wrapping than the narrow viewport due to padding or breakpoint behavior.

In particular, ensure:

- Portuguese Producing does not regress to a worse layout at 1600;
- Polish Producing does not regress due to breakpoint padding;
- header text capacity should be monotonic or intentionally controlled rather than accidentally shrinking as viewport width increases.

---

## True 200% zoom

Perform a true browser 200% zoom check if available.

Verify:

- no new page-level horizontal scrollbar caused by this change;
- Matrix remains usable;
- header text remains readable;
- help controls remain reachable;
- no heading overlap;
- body cells/buttons remain aligned beneath their logical headings.

If the Codex environment cannot verify true zoom, report it accurately and leave manual verification outstanding.

---

## Keep body geometry invariant

Add regression protection for body geometry where practical.

At minimum verify that this implementation does not change:

- body grid template/column tracks;
- Present control width;
- Producing control width;
- Inputs cell/button widths;
- Logistics cell/button widths;
- Manufacturing row geometry;
- inorganic/organic row geometry;
- sticky Item column dimensions.

If implementation requires touching a shared grid definition, stop and confirm whether it alters body layout before proceeding.

---

## Preferred CSS architecture

Prefer a header-specific layout layer.

Possible approaches include:

- separate header grid overlay aligned to body tracks;
- header cells with controlled overflow/visual extension;
- wrapper elements that reserve body-column anchors while giving labels wider internal boxes;
- absolute/relative positioning within the header only, if robust and accessible.

Avoid:

- magic per-locale offsets;
- arbitrary negative margins without a clear contract;
- transforms that visually move headings away from their logical columns;
- duplicating column definitions independently in multiple places without a shared source of truth.

If a header-specific grid duplicates track math, centralize the shared track values or derive them from existing structure so body/header alignment cannot drift.

---

## Inputs/Logistics visual association

If Inputs borrows visual space from Logistics, preserve strong visual association.

The result should still read naturally as:

```text
ITEM | SOURCE | PRESENT | PRODUCING | INPUTS | LOGISTICS
```

not:

```text
ITEM | SOURCE | PRESENT | PRODUCING | INPUTS LOGISTICS
```

Possible aids:

- preserve text anchor positions;
- preserve column separators/background structure if present;
- keep Logistics label/help visibly grouped;
- do not center Inputs across both columns;
- do not let Inputs text pass beneath or behind Logistics text/help.

---

## Accessibility

Header geometry changes must not reduce accessibility.

Preserve:

- semantic table/header relationships;
- accessible column names;
- help button semantics;
- keyboard focus;
- visible focus indication;
- screen-reader reading order;
- DOM order matching logical column order.

Do not use CSS visual reordering that causes a mismatch between visual and DOM order.

If visual extension is used, keep semantic order unchanged.

---

## Forced colors / High Contrast

Verify that the new header geometry remains legible in forced-colors / Windows High Contrast.

Check:

- text remains visible;
- help controls remain visible;
- focus rings are not clipped;
- borrowed/overhanging header space does not depend on subtle background shading to establish boundaries.

Do not rely solely on color to preserve column grouping.

---

## Scope exclusion: Matrix/Cargo section-heading vertical alignment

A separate visual defect was observed:

```text
Resource Matrix section heading
Cargo Links section heading
```

are no longer vertically aligned; the Resource Matrix heading appears taller.

This is a real issue but is **out of scope for this implementation** unless Codex discovers that the exact same header rule being changed here trivially and safely fixes both without expanding scope.

Otherwise:

- document the issue if not already tracked;
- do not redesign the outer section headers here;
- do not make Cargo Links geometry changes in this pass.

---

## Scope exclusion: technical-token geometry

Do not address:

```text
R-COOH
SiH3Cl
```

or any generic resource/manufactured-item button sizing.

Do not widen Matrix, Planned Supply, or Cargo item buttons.

That remains a separate geometry discussion.

---

## Tests

Add focused regression tests where feasible.

At minimum cover:

- all six header cells remain in logical order;
- Present/Producing/Logistics help controls remain associated with the correct headings;
- header layout uses the approved shared geometry path;
- no locale-specific geometry branch is introduced;
- Matrix body controls retain existing widths/classes/track contract;
- Spanish Inputs is constrained to a maximum two-line header in browser/layout coverage if practical;
- German Inputs fits the intended header presentation;
- Producing text/help separation remains stable.

Do not write brittle pixel-perfect jsdom tests if the environment cannot render real layout.

Prefer browser/component layout assertions where available.

---

## Browser/manual verification

Verify at:

```text
1366×768
1600×900
true 200% zoom if available
```

Across at least:

```text
English
French
German
Italian
Polish
Portuguese
Spanish
Japanese
Simplified Chinese
```

Manual checklist:

- no new horizontal scrollbar;
- Matrix overall width unchanged;
- Cargo Links position unchanged;
- body buttons unchanged in width;
- headings remain clearly associated with body columns;
- German Inputs readable;
- Spanish Inputs ≤ 2 lines;
- Producing predictable;
- Logistics remains readable;
- help icons usable;
- no overlap;
- focus visible.

---

## Before/after measurement

Record before/after values for:

```text
Matrix total width
Inputs body-track width
Logistics body-track width
Producing body-track width
Inputs visible header-label box width
Logistics visible header-label box width
Producing usable header text width
header row height
```

The important invariant is:

```text
body-track widths before == body-track widths after
```

unless Codex stops and reports otherwise.

Also record whether the header presentation now uses different internal widths from the body tracks.

---

## Documentation reconciliation

After implementation inspect:

```text
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/audits/RESOURCE-MATRIX-HEADING-EDITORIAL-REVIEW.md
```

Guidance:

- preserve the audit as point-in-time evidence;
- update UX/architecture only if the new header-specific geometry establishes a reusable layout contract;
- close only the Matrix header-capacity/layout backlog item if acceptance criteria are actually met;
- do not close compact-copy/editorial candidate issues unless they are separately tracked and explicitly resolved;
- do not close technical-token geometry issues;
- do not imply the Matrix/Cargo section-heading alignment issue is fixed unless it actually is.

Do not leak temporary task numbering into durable docs.

---

## Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any relevant browser/layout tests used by the repository.

Record exact results.

---

## Stop conditions

Stop and report rather than broadening scope if:

- the only apparent fix requires increasing overall Matrix width;
- a body-column track must change;
- Inputs/Logistics buttons would become wider/narrower;
- 1366 px gains a new page-level horizontal scrollbar;
- header/body column association becomes ambiguous;
- help hit areas overlap neighboring labels;
- CSS visual reordering would diverge from semantic/DOM order;
- locale-specific geometry hacks appear necessary;
- fixing this requires Cargo Links panel geometry changes;
- the solution depends on changing Matrix copy.

Do not silently trade away the existing 1366 px layout success.

---

## Expected Codex summary

Report:

1. branch used;
2. root cause of Producing header instability;
3. header-specific geometry implemented;
4. whether Logistics donated presentation space;
5. whether Inputs borrowed header-only space;
6. before/after Matrix total width;
7. before/after body-track widths;
8. before/after header-label usable widths;
9. Spanish Inputs line-count result;
10. German Inputs result;
11. French/German/Italian/Polish/Portuguese/Spanish Producing result;
12. 1366×768 horizontal-overflow result;
13. 1600×900 result;
14. true 200% result or remaining manual check;
15. High Contrast / forced-colors result or remaining manual check;
16. accessibility/help/focus result;
17. confirmation no Matrix copy changed;
18. confirmation no body-cell/button geometry changed;
19. confirmation technical-token geometry was not touched;
20. confirmation Matrix/Cargo section-heading alignment was not expanded into scope unless trivially resolved;
21. docs/backlog reconciliation;
22. tests/checks run and results;
23. limitations/stop conditions;
24. suggested commit message;
25. confirmation no commit or push was performed.

Suggested commit message:

`fix: stabilize Resource Matrix header layout`
