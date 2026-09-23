# CODEX CORRECTION BRIEF — Resource Matrix Header Geometry Presentation Regressions

## Objective

Correct the presentation regressions introduced by the current uncommitted Resource Matrix header-geometry implementation while preserving the useful parts of that work:

- Matrix overall width remains unchanged;
- body-column tracks and button/cell geometry remain unchanged;
- header-only geometry remains a valid strategy;
- Spanish Inputs should remain at no more than two lines;
- full current localized headings remain unchanged.

Do **not** revert to the old three-line Spanish layout merely to remove the new defects.

This is a correction to the current uncommitted implementation, not a fresh redesign.

---

# 1. Preserve the successful invariants

Retain these results from the current implementation:

```text
Matrix total width unchanged
1366 px footprint unchanged
1600 px footprint unchanged
body grid tracks unchanged
body button/cell widths unchanged
localized Matrix copy unchanged
header-only presentation may differ from body geometry
Spanish Inputs reduced from three lines to two
```

Do not discard the entire header-only approach unless a stop condition makes it necessary.

---

# 2. Confirmed presentation defects

The current implementation has four visible defects.

## A. Logistics header no longer aligns with Logistics column values

The Logistics heading has been shifted horizontally as part of the header-space donation.

The body Logistics buttons remain in their original logical column, so the header and values now appear misaligned.

This is not acceptable.

**Requirement:**
The Logistics heading must remain visually anchored to the start/centre relationship of the Logistics body column sufficiently that users can immediately associate the heading with the controls beneath it.

Header-space donation must not be implemented by moving the entire Logistics heading away from its column.

---

## B. Help buttons have been pushed away from their labels

Present, Producing, and Logistics help controls are currently pushed toward the far edge of their header cells.

This weakens the visual relationship:

```text
LABEL ?
```

and can make the help control look as though it belongs to the next column.

**Requirement:**
Treat each heading label and its help affordance as one visual group.

Conceptually:

```text
PRESENT ?
PRODUCING ?
LOGISTICS ?
```

not:

```text
PRESENT              ?
PRODUCING            ?
LOGISTICS             ?
```

The help icon may have an expanded invisible hit target, but its **visible icon must remain visually adjacent to the heading it explains**.

Do not reduce accessibility hit-target size to achieve this.

---

## C. German Inputs breaks mid-word

The current German rendering visibly breaks:

```text
EINSATZSTOFFE
```

inside the word, leaving the final letter on a second line.

This is unacceptable typography and defeats the purpose of borrowing header space.

The current implementation appears to permit arbitrary mid-word wrapping.

**Requirement:**

- do not use `overflow-wrap: anywhere` or equivalent arbitrary character breaking for Matrix headings;
- use natural word boundaries;
- preserve unbroken ordinary words such as `Einsatzstoffe`;
- if an indivisible accepted word does not fit, solve that through header presentation geometry rather than character-level wrapping.

Preferred behavior:

```css
overflow-wrap: normal;
word-break: normal;
```

or equivalent default behavior unless repository conventions require something more explicit.

Do not insert discretionary hyphens or manual soft breaks into localized catalogue strings.

---

## D. Spanish Inputs and Logistics visually merge

Spanish now reaches the desired two-line Inputs layout, but the headings:

```text
MATERIALES DE ENTRADA
LOGÍSTICA
```

are positioned so closely that they visually read as one phrase/heading.

This fails column separation even though neither label technically overlaps.

**Requirement:**
Inputs and Logistics must retain a clear visual gap.

The layout must not produce a result resembling:

```text
MATERIALES DE LOGÍSTICA
ENTRADA
```

or otherwise make the headings appear semantically joined.

A technically non-overlapping bounding box is not sufficient.

---

# 3. Revised header-borrowing model

The current implementation appears to interpret donation roughly as:

```text
Inputs expands right
→ Logistics heading moves right
```

Do not use that model.

Use this model instead:

```text
BODY TRACKS — unchanged

| INPUTS                  | LOGISTICS                  |
|     input controls      |      logistics control     |

HEADER PRESENTATION

| INPUTS may borrow →     | LOGISTICS ?                |
```

The **Inputs label box** may extend into otherwise unused presentation space near the beginning of the Logistics track.

However:

- the Logistics heading remains anchored to its logical column;
- Logistics is not translated wholesale to the right;
- the two visible heading groups must not collide or visually merge;
- both body tracks remain unchanged.

The borrowed region is available **only to the extent that Logistics does not need it**.

---

# 4. Minimum visual separation

Introduce an explicit shared visual-separation contract between neighboring header groups.

Inputs and Logistics must have a visible gap at all supported locales and target widths.

Do not rely merely on:

```text
bounding boxes do not technically overlap
```

Require enough blank space that the headings read as distinct columns.

Use an ordinary UI spacing token or a small explicit header gap consistent with the current Matrix typography.

Do not use locale-specific gap values.

The Spanish screenshot is the primary regression example.

---

# 5. Logistics anchor

Preserve the logical start position of the Logistics column.

The visible Logistics label/help group should begin within the Logistics track in a way that corresponds naturally with Logistics body content.

It does not need to be pixel-centred over the body button, but it must not look displaced into the right margin.

If space is needed for Inputs:

- first reduce unnecessary header-only padding;
- then allow Inputs to borrow only genuinely unused left-side Logistics presentation space;
- keep the Logistics group anchored.

Do not use a blanket `margin-left` equal to the borrowed width on the Logistics heading.

---

# 6. Help-group behavior

For headings with help controls, use an inline visual grouping.

Preferred conceptual structure:

```text
[ heading text ][ small visual gap ][ ? ]
```

The group itself may wrap where appropriate.

For a two-line Producing heading, acceptable patterns include:

```text
EN
PRODUCCIÓN ?
```

or another natural wrapping outcome.

Avoid:

```text
EN                         ?
PRODUCCIÓN
```

unless the language/layout genuinely makes the association clearer, which current screenshots do not.

The help icon should generally follow the heading text, not occupy a fixed far-right grid cell.

---

# 7. Help hit-target preservation

Do not confuse visible adjacency with hit-target size.

The visible `?` can sit close to the heading while its pseudo-element or wrapper preserves the larger interaction envelope.

Verify:

- pointer hit target remains at least current size;
- keyboard focus ring remains visible;
- enlarged hit area does not overlap adjacent heading text;
- adjacent help targets do not overlap each other.

If existing `ContextHelp` pseudo-elements expand beyond the visible icon, include that geometry in collision calculations.

---

# 8. Producing stabilization

Retain the useful Producing improvements where possible:

- shared header-only spacing;
- no breakpoint where usable text width unexpectedly shrinks;
- controlled maximum two-line wrapping;
- body Producing column unchanged.

But revise the help grouping so that the `?` stays visually attached to Producing.

Verify especially:

```text
fr-FR   En production
de-DE   In Produktion
it-IT   In produzione
pl-PL   W produkcji
pt-BR   Em produção
es-ES   En producción
```

No mid-word breaking.

---

# 9. Inputs behavior

Inputs has no header help control and therefore remains the natural receiver of borrowed presentation space.

Requirements:

- German `Einsatzstoffe` remains a whole word;
- Spanish `Materiales de entrada` uses no more than two lines;
- Italian `Materiali richiesti` uses natural word wrapping;
- Polish `Wymagane materiały` uses natural word wrapping;
- the label may extend beyond the Inputs body-track boundary;
- the body Inputs controls must not move or resize.

Do not use character-level breaks.

---

# 10. Logistics behavior

Requirements:

- Logistics remains one line in current locales unless natural typography requires otherwise;
- label remains visibly associated with Logistics body column;
- help icon remains adjacent to Logistics label;
- Inputs cannot consume so much header presentation space that Logistics loses its own clear identity;
- no locale-specific positioning.

All current Logistics translations remain unchanged.

---

# 11. No copy changes in this correction

Do not solve these regressions by changing translations.

Do not introduce:

```text
Production
Produktion
Produzione
Produkcja
Produção
Producción
Insumos
```

or any other editorial candidate.

The correction must establish the best geometry achievable with current accepted copy.

After this geometry is stable, editorial compact-copy candidates may be reconsidered separately.

---

# 12. Editorial question remains open

The Spanish screenshot demonstrates an important product point:

> Reducing a heading from three lines to two does not automatically make the result good.

Even after this correction, the product may later decide that an evidence-backed compact label such as Spanish `Insumos` produces a cleaner Matrix.

Do not make that decision in this correction.

Instead, ensure the geometry does not force such a decision.

---

# 13. Body geometry remains immutable

Do not change:

```text
Matrix total width
grid track widths
Item body width
Source body width
Present body width
Producing body width
Inputs body width
Logistics body width
button widths
state control widths
Manufacturing row geometry
inorganic/organic row geometry
sticky Item dimensions
```

The header can differ internally; body geometry cannot.

If correcting the visible defects requires changing body tracks, stop and report.

---

# 14. 1366 px remains the hard constraint

At 1366×768:

- no new page-level horizontal scrollbar;
- Matrix total width unchanged;
- Cargo Links stays in its prior position;
- body tracks unchanged;
- German Inputs whole-word;
- Spanish Inputs ≤ 2 lines;
- Spanish Inputs/Logistics visibly separated;
- Logistics header aligned with its body column;
- help icons visually attached to their labels;
- no header overlap.

Do not trade the established 1366 layout for cleaner headings.

---

# 15. 1600 px behavior

At 1600×900:

- no worse wrapping than at 1366 due to padding;
- no new rightward drift of Logistics;
- no excessive spacing between label and help icon;
- Portuguese/Polish Producing remains stable;
- body geometry remains unchanged.

---

# 16. All-locale visual verification

Check all runtime locales:

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

For every locale inspect:

```text
Present label + help
Producing label + help
Inputs label
Logistics label + help
association with body columns
word boundaries
visual separation
line count
```

Do not consider a layout accepted solely because its measured boxes do not overlap.

Human-readable grouping matters.

---

# 17. Explicit screenshot acceptance criteria

The corrected screenshots should satisfy these plain-language tests:

## English

The word `LOGISTICS` appears clearly over the Logistics column rather than shifted toward the Matrix edge.

## Help icons

At a glance, each `?` obviously belongs to the label immediately before it.

## German

`EINSATZSTOFFE` is never broken between arbitrary letters.

## Spanish

`MATERIALES DE ENTRADA` remains at most two lines, but there is enough blank space before `LOGÍSTICA` that the two headings cannot be mistaken for one phrase.

---

# 18. Accessibility

Preserve:

- semantic column order;
- accessible column names;
- help semantics;
- DOM order;
- keyboard reachability;
- focus visibility;
- current hit-target sizes.

Do not visually reorder columns.

Do not move a help control in the DOM away from the heading it describes.

---

# 19. Forced colors

Do not require manual High Contrast acceptance until the ordinary layout defects are corrected.

Automated implementation should nevertheless preserve current forced-colors behavior.

After ordinary-layout acceptance, manual High Contrast should verify:

- label/help grouping remains evident;
- focus rings remain visible;
- header borrowing does not depend on subtle background shading.

---

# 20. True 200% zoom

Do not require the user to perform final 200% manual verification until this correction is complete.

Codex may check if possible, but ordinary 100% geometry must pass first.

After correction, the manual acceptance pass can cover:

```text
100%
200%
High Contrast
Narrator/help semantics as needed
```

---

# 21. Resource Matrix / Cargo Links outer heading issue

Keep the previously noticed vertical misalignment between:

```text
RESOURCE MATRIX
CARGO LINKS
```

out of scope for this correction.

Do not alter outer section-heading heights here.

Leave it tracked separately.

---

# 22. Technical-token geometry remains out of scope

Do not change:

```text
R-COOH
SiH3Cl
```

button/cell sizing.

Do not touch generic resource/product button geometry.

---

# 23. Tests

Update/add focused regression coverage for the corrected geometry.

Where practical verify:

- no arbitrary word-breaking rule on Matrix header labels;
- Logistics header retains its logical anchor;
- Inputs may borrow header-only space without changing body tracks;
- label/help controls remain grouped;
- body-grid classes/tracks unchanged;
- no locale-specific CSS;
- Matrix full translations unchanged.

Do not use brittle jsdom pixel assertions as proof of visual grouping.

Browser/manual evidence remains required for the four confirmed regressions.

---

# 24. Before/after measurements

Retain the existing verification measurements, but add:

```text
Inputs label right edge
Logistics label left edge
minimum visible gap between Inputs and Logistics
Logistics logical track start
Logistics visible heading start
label-to-help-icon visible gap for Present
label-to-help-icon visible gap for Producing
label-to-help-icon visible gap for Logistics
German Inputs line segmentation
```

Measure at:

```text
1366×768
1600×900
```

Do not define acceptance solely by numbers; use them to support screenshot inspection.

---

# 25. Documentation

Update the existing uncommitted verification report rather than creating a competing second verification report unless repository convention requires otherwise.

The report must record:

- initial implementation preserved body geometry but caused presentation regressions;
- correction performed;
- Logistics re-anchored;
- help groups restored;
- arbitrary word breaking removed;
- Spanish Inputs/Logistics separation verified;
- body geometry still unchanged.

Do not present the first implementation as already accepted.

Do not close the Matrix header backlog item until manual acceptance is completed.

---

# 26. Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Record exact results.

---

# 27. Stop conditions

Stop and report if:

- correcting Logistics alignment requires changing its body track;
- German whole-word preservation cannot coexist with the 1366 Matrix footprint;
- Spanish Inputs cannot remain ≤2 lines while retaining a clear Logistics separation;
- help icons cannot remain visually adjacent without reducing their accessible hit targets;
- body buttons/cells must resize;
- overall Matrix width must increase;
- locale-specific positioning hacks become necessary.

If geometry cannot satisfy all constraints, report which editorial compact labels would relieve the remaining pressure rather than implementing them without approval.

---

# 28. Expected Codex summary

Report:

1. branch used;
2. cause of Logistics misalignment;
3. correction to Logistics anchoring;
4. cause of help-icon separation;
5. corrected help-group strategy;
6. cause of German mid-word break;
7. German whole-word result;
8. Spanish Inputs line count;
9. Spanish Inputs/Logistics visual-gap result;
10. whether Inputs still borrows header-only space;
11. Matrix total width before/after;
12. body-track widths before/after;
13. confirmation body buttons/cells unchanged;
14. all-locale 1366 result;
15. all-locale 1600 result;
16. remaining 200%/High Contrast/manual checks;
17. confirmation no Matrix copy changed;
18. confirmation outer Matrix/Cargo heading issue remains out of scope;
19. confirmation technical-token geometry untouched;
20. tests/checks run;
21. documentation/backlog status;
22. limitations/stop conditions;
23. suggested commit message;
24. confirmation no commit or push was performed.

Suggested commit message remains:

`fix: stabilize Resource Matrix header layout`
