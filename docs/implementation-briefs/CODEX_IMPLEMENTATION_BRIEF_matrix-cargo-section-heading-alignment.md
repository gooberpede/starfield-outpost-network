# CODEX IMPLEMENTATION BRIEF — Resource Matrix / Cargo Links Section-Heading Alignment

## Objective

Fix the visible vertical misalignment between the outer section headings:

```text
RESOURCE MATRIX
CARGO LINKS
```

The two top-level section-heading bars should align cleanly when shown side by side.

This is a **small shell/presentation correction** intended to close the current UI-focused work tranche before moving to bandwidth / locale-on-demand investigation.

Do not reopen the recently completed Resource Matrix internal header work.

---

## Scope

Investigate and correct only the outer section-heading alignment between:

- Resource Matrix
- Cargo Links

The visible defect is that the Resource Matrix heading area appears taller / vertically offset relative to Cargo Links.

Determine the actual cause before changing CSS.

Likely causes may include:

- different padding;
- different line-height;
- different min-height;
- different border treatment;
- Search control participation in the Resource Matrix heading row;
- inherited typography or flex/grid alignment differences.

Do not assume the cause.

---

## Hard constraints

Preserve all recently accepted behavior.

Do not change:

```text
Resource Matrix column-header geometry
Matrix body grid tracks
Matrix button/cell widths
Inputs/Logistics header borrowing
Producing/help grouping
Search compact localization
Cargo Link body geometry
Cargo Link expansion/collapse behavior
fixed-chrome focus behavior
localized Matrix copy
```

Do not alter the 1366 px Matrix footprint.

Do not introduce a new horizontal scrollbar at 1366×768 / 100%.

---

## Desired result

When Resource Matrix and Cargo Links are visible side by side:

- their outer section-heading bars have the same intended vertical height;
- their text baselines/visual centres align;
- borders/dividers align cleanly;
- neither heading appears noticeably taller or lower than the other;
- the Resource Matrix Search field remains vertically well aligned within its own heading row;
- Cargo Links controls remain unchanged.

The result should look intentional at a glance.

---

## Diagnose first

Before implementing, compare the relevant DOM and CSS for the two outer headings.

Inspect at minimum:

```text
Resource Matrix outer heading wrapper
Cargo Links outer heading wrapper
heading text styles
search-field wrapper
Add button / Cargo heading controls
padding
line-height
min-height
border-box sizing
align-items
display mode
font metrics
```

Identify the smallest root cause.

Prefer correcting a shared contract over adding compensating offsets.

---

## Preferred implementation principle

If both sections are conceptually peer panels, prefer a shared section-heading height/alignment contract.

For example, if repository structure supports it:

```text
shared min-height
shared vertical padding
shared box-sizing
shared align-items
```

The exact implementation should follow existing architecture.

Avoid:

```text
translateY(...)
negative margins
magic top offsets
locale-specific adjustments
hard-coded pixel nudges that only match one screenshot
```

unless there is a compelling structural reason and it is documented.

---

## Search field constraint

The Resource Matrix heading contains the Search control.

Do not fix alignment by shrinking, clipping, or vertically crowding the Search input.

Verify:

- Search remains fully usable;
- Search input height unchanged unless a shared heading contract requires a safe matching adjustment;
- focus outline remains visible;
- search icon remains vertically aligned;
- French/German compact placeholders still fit.

---

## Cargo Links constraint

Do not alter Cargo Links body or control behavior.

If the Cargo Links heading includes an Add control or other adjacent control:

- preserve its current dimensions;
- preserve focus visibility;
- preserve click target;
- preserve alignment within the corrected heading bar.

This is not a Cargo panel redesign.

---

## Locale coverage

Check the result across all runtime locales:

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

The outer section-heading alignment should not depend on one language's string length.

Do not add locale-specific CSS.

---

## Viewport checks

Verify at minimum:

```text
1366×768
1600×900
```

At 1366×768:

- no new document-level horizontal scrollbar;
- Matrix and Cargo remain side by side as before;
- section-heading bars align;
- Search remains usable;
- Cargo controls remain usable.

At 1600×900:

- alignment remains consistent;
- no new excess vertical padding;
- no breakpoint-specific regression.

---

## 200% zoom

If Codex can verify true browser 200% zoom, do so.

If not, leave it for manual verification and report accurately.

At 200%:

- heading bars should still align when the panels are displayed side by side;
- no clipping;
- no focus outline clipping;
- existing horizontal-scroll behavior should not worsen.

---

## High Contrast / forced colors

Do not change established forced-colors styling unnecessarily.

Verify that:

- section boundaries remain visible;
- heading text remains visible;
- Search and Cargo controls remain distinguishable;
- focus indicators remain visible.

If manual Windows High Contrast is unavailable, report that limitation.

---

## Accessibility

Preserve:

- heading semantics;
- DOM order;
- Search accessible name/description;
- Cargo control accessible names;
- keyboard focus;
- visible focus indicators.

This change should be visual/layout-only.

---

## Broader inconsistency stop condition

If inspection reveals this is not a two-panel defect but part of a broader inconsistent section-heading system affecting several peer panels, stop and report before generalizing the change.

Do not silently refactor all section headers in the application.

Provide:

- affected components;
- common cause;
- suggested broader follow-up.

If the fix is genuinely a small shared rule already used only by these peer headings, proceed.

---

## Documentation

Inspect:

```text
docs/BACKLOG.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
```

Update only if warranted.

Expected behavior:

- close the specific Matrix/Cargo outer-heading alignment backlog item once manually/visually accepted;
- do not reopen closed Matrix header-capacity work;
- do not touch technical-token geometry items;
- do not modify architecture docs unless the implementation establishes a reusable section-heading contract.

Do not leak temporary task numbering into durable docs.

---

## Tests

Add or update focused tests only if the repository has an appropriate component/layout contract to protect.

Useful tests may cover:

- expected shared heading class/contract;
- no change to Matrix inner-header structure;
- no change to Cargo body controls;
- Search remains present and accessible.

Do not create brittle pixel-perfect jsdom tests.

Visual/manual verification remains primary for alignment.

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

Record exact results.

---

## Manual verification checklist

After implementation, verify:

### 100%

- Resource Matrix and Cargo Links outer headings align vertically.
- Their heading bars have matching intended height.
- Text appears visually aligned.
- Search control remains correctly aligned.
- Cargo heading controls remain correctly aligned.
- No Matrix internal header regression.
- No 1366 px horizontal-scroll regression.

### 200%

- Same alignment remains acceptable.
- No clipping.
- No new layout regression.

### High Contrast

- Alignment remains clear.
- Borders and focus indicators remain visible.

---

## Scope exclusions

Do not address in this pass:

```text
bandwidth / locale-on-demand
bundle splitting
Resource Matrix compact-copy candidates
R-COOH / SiH3Cl geometry
Matrix column widths
Cargo Links body layout
other unrelated panel-heading cleanup
```

---

## Stop conditions

Stop and report if:

- fixing alignment requires changing Matrix body/header geometry;
- fixing alignment requires changing Cargo body geometry;
- the issue is actually systemic across multiple unrelated section headers;
- the only solution found is a fragile pixel nudge;
- 1366 px layout regresses;
- Search field usability or focus visibility degrades;
- locale-specific CSS becomes necessary.

---

## Expected Codex summary

Report:

1. branch used;
2. root cause of the outer-heading misalignment;
3. files changed;
4. exact layout contract/fix applied;
5. whether a shared rule was introduced;
6. Resource Matrix Search alignment result;
7. Cargo heading/control alignment result;
8. 1366×768 result;
9. 1600×900 result;
10. 200% result or manual check remaining;
11. High Contrast result or manual check remaining;
12. accessibility/focus result;
13. confirmation Matrix internal geometry was untouched;
14. confirmation Cargo body geometry was untouched;
15. documentation/backlog reconciliation;
16. tests/checks run and results;
17. limitations/stop conditions;
18. suggested commit message;
19. confirmation no commit or push was performed.

Suggested commit message:

`fix: align workspace section headings`
