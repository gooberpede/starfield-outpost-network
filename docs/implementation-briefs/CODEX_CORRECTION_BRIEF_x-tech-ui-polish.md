# Codex Correction Brief — X-Tech UI Quietness, Planned Supply Strip, Accessible Add Label

## Context

The X-Tech implementation is functionally strong and should be preserved.

Manual browser testing confirms:

- `[+ X-Tech]` appears in the correct Inorganic / Present location;
- adding X-Tech creates the final inorganic row with Present ON and Producing OFF;
- turning Present OFF removes the row and restores the add affordance;
- Producing controls actual local availability correctly;
- Search, cargo eligibility, Planned Supply, Undo/Redo, and explicit-presence semantics work;
- X-Tech is correctly appended after ordinary inorganic rows;
- Aqueous Hematite and Caelumite remain excluded.

This correction is a **small UI/polish/accessibility pass only**.

Do not redesign X-Tech domain behavior, persistence, schema v4, validation, Search semantics, or history.

---

# 1. Quiet the `+ X-Tech` add affordance

Current markup renders:

```text
[+ X-Tech]
```

Change the visible text to:

```text
+ X-Tech
```

The square brackets are unnecessary because the control already has button affordance.

## Typography

The control currently uses the mono font.

Change the add-control typography to the normal UI face:

```text
var(--ui-font)
```

i.e. Barlow Semi Condensed through the existing design token.

Do not change X-Tech resource buttons themselves; those remain mono like other resource abbreviations.

## Visual weight

Make the add affordance quieter than resource-state buttons.

Target:

- no increase to the Inorganic section-bar height;
- compact height comparable to the existing section heading;
- reduced horizontal/vertical padding if necessary;
- muted/quiet default border and text;
- pale or transparent background rather than a conspicuous filled control;
- normal hover/focus strengthening;
- no shadow;
- no rounded-pill treatment;
- preserve semantic `<button>` behavior and focus-visible outline.

The result should read as a small secondary action embedded in the Present column, not as another resource state cell.

Do not alter the matrix column tracks or Matrix/Cargo alignment.

---

# 2. Keep the add control in the Present column

Preserve the current structural approach:

```text
Inorganic section bar uses matrix column template
heading spans Item + Source
add control occupies Present
```

Do not move `+ X-Tech` to the Item column, heading end, separate row, or toolbar.

The location is correct; only styling/text needs refinement.

---

# 3. Localize the accessible add label

The current button has a hard-coded English `aria-label` equivalent to:

```text
Add X-Tech as present
```

Do not leave accessible UI copy hard-coded in the component.

Add/reuse a localized message key for the short action label, e.g. conceptually:

```text
matrix.action.xTech.add
```

with a parameterized value such as:

```text
Add {resource} as present
```

Use that localized value for:

```text
aria-label
```

The existing longer tooltip/help message may remain separate.

Do not use the long tooltip sentence itself as the button's accessible name if that would make the accessible name unnecessarily verbose.

en-GB may inherit the en-US baseline if no wording difference is needed.

---

# 4. Planned Supply: put X-Tech beside Helium-3 and Water

The current special grid is hard-coded to two columns:

```css
.planned-supply__special-grid {
  grid-template-columns: repeat(2, var(--planned-supply-cell-width));
}
```

With the newly appended third item, X-Tech wraps beneath the existing pair.

Change the special-strip layout so the current three resources occupy one row:

```text
He-3   H2O   XT
```

Preserve the current item order from tracker policy.

A simple three-column grid is acceptable if it fits the current architecture:

```css
grid-template-columns: repeat(3, var(--planned-supply-cell-width));
```

or use an equivalent compact layout that gives the same result.

Requirements:

- Helium-3, Water, and X-Tech appear side-by-side at normal desktop widths;
- existing cell dimensions remain unchanged;
- special strip remains compact / width-fit-content;
- no fake family relationship;
- no change to special-item state semantics;
- no change to the main family grid;
- no change to compact-mode ordering unless strictly required;
- do not expose Aqueous Hematite or Caelumite.

If a very narrow container genuinely cannot fit the three cells, graceful wrapping is acceptable under the project's "Adapt before overflowing" rule. Do not introduce a hard page-width minimum.

---

# 5. Preserve all accepted X-Tech behavior

Do not change:

```text
schema v4
character.capabilities.xTechExtraction
outpost.explicitResourcePresence
resourcePresence.ts architecture
special-enabled tracker disposition
X-Tech runtime reference identity
Aqueous Hematite / Caelumite exclusion
row-last behavior
Present semantics
Producing semantics
recovery-row behavior
atomic Present-off removal
Undo/Redo
Search flags
cargo eligibility
Planned Supply availability/disabled state
validation rules
canonical occurrence behavior
```

---

# 6. Tests

Update/add focused tests only where useful.

At minimum verify:

```text
localized short X-Tech add action label resolves
existing X-Tech tooltip localization still resolves
Planned Supply policy order remains He-3 / Water / X-Tech
```

No new DOM testing framework is required solely for CSS layout.

Keep existing X-Tech and regression tests passing.

---

# 7. Manual browser verification

Verify:

1. `+ X-Tech` has no enclosing square brackets.
2. It uses the normal Barlow UI font, not IBM Plex Mono.
3. It is visibly quieter than Present/Producing resource buttons.
4. The Inorganic strip is no taller than before this correction.
5. Matrix/Cargo heading and column geometry are unchanged.
6. Hover and keyboard focus remain clear.
7. Clicking it still adds X-Tech exactly as before.
8. Planned Supply shows:

```text
He-3   H2O   XT
```

on one row at normal desktop width.
9. Disabled/hatched X-Tech state still renders correctly when X-Tech is actually available.
10. Narrow layouts adapt without horizontal page overflow.

---

# 8. Verification

Run:

```text
npm run reference:test
npm test
npm run build
npm run lint
git diff --check
```

`npm run reference:build` is not required unless a reference-data file is changed unexpectedly; this correction should not require reference-data regeneration.

Do not commit or push.

---

## Completion report

Report:

- files changed;
- final `+ X-Tech` styling approach;
- localization key used for the accessible action label;
- Planned Supply special-grid layout change;
- exact automated verification results;
- manual browser result.

Do not commit or push.

---

## Final instruction

Keep the X-Tech implementation functionally unchanged. This pass should only make the add affordance look like a quiet Barlow secondary action, localize its accessible name, and use the special-strip space efficiently by placing X-Tech beside Helium-3 and Water.
