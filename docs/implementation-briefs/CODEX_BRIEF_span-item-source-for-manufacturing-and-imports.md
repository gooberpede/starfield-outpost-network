# Codex Correction Brief — Span Item + Source in Manufacturing and Imports

## Objective

Improve the Resource Matrix layout for the **Manufacturing** and **Imports** sections by allowing their first-column labels to use the otherwise-empty Source column.

This is a narrow Matrix-layout correction to the current uncommitted compression pass.

The reason is semantic:

- Manufacturing rows never use the Source column.
- Imports rows never use the Source column.
- Some manufactured product names and remote outpost names are long.
- Confining those labels to the compressed Item track creates unnecessary truncation while adjacent space is guaranteed to be empty.

Do not widen the Item column globally.

---

## 1. Inspect current implementation

Review:

```text
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
```

Confirm current row geometry.

Manufacturing currently behaves conceptually like:

```text
Item | empty Source | empty Present | Producing | Inputs | Logistics
```

Imports currently behaves conceptually like:

```text
Remote Outpost | empty Source | empty Present | empty Producing | empty Inputs | Logistics
```

The first visible label in each should be allowed to span:

```text
Item + Source
```

---

## 2. Manufacturing rows

For Manufacturing rows, make the manufactured-product label cell span the first two Matrix columns.

Target geometry:

```text
[ Product Name across Item + Source ] | Present | Producing | Inputs | Logistics
```

Preserve the existing semantic emptiness of the Source column.

Do not invent or display a Source value for manufactured products.

Preserve:

- edit/remove control behavior;
- product-name tooltip/title;
- ellipsis as a last-resort fallback;
- existing Manufacturing Producing/Input/Logistics semantics;
- stable shared Matrix column positions.

The product-name cell should gain width only because it spans two existing columns.

---

## 3. Imports rows

For Imports rows, make the remote-outpost-name cell span the first two Matrix columns.

Target geometry:

```text
[ Remote Outpost across Item + Source ] | Present | Producing | Inputs | Logistics
```

Preserve:

- current import aggregation;
- remote-outpost tooltip/title;
- imported-item placement in Logistics;
- existing row ordering;
- ellipsis only if the combined Item + Source span is still genuinely insufficient.

Do not alter import semantics.

---

## 4. CSS approach

Prefer an explicit reusable class for cells that span Item + Source, for example conceptually:

```css
.outpost-status-matrix__item--span-source {
  grid-column: 1 / span 2;
}
```

The exact class name is up to project conventions.

Because CSS Grid auto-placement will otherwise shift following cells, ensure the remaining cells are explicitly positioned or the DOM structure is adjusted so they still map to the correct semantic columns.

Do not rely on accidental auto-flow behavior.

The final column alignment must remain:

```text
1 Item
2 Source
3 Present
4 Producing
5 Inputs
6 Logistics
```

even when the first visible cell spans columns 1–2.

---

## 5. Preserve sticky behavior carefully

The ordinary Item column is sticky during horizontal scrolling.

For the spanning Manufacturing/Imports cell:

- preserve sensible sticky behavior if it already applies;
- ensure spanning into Source does not create clipping, layering, or overlap during horizontal scrolling;
- keep background treatment correct.

If the existing sticky Item styling needs a small scoped adjustment for spanning cells, keep it local.

Do not alter sticky behavior for normal resource rows.

---

## 6. Compression behavior

Verify the correction at:

```text
comfortable Matrix width
~41rem compressed width
~38rem just-before-scroll threshold
```

Expected:

- manufactured product names gain useful width;
- remote outpost names gain useful width;
- no other Matrix tracks become wider;
- no new horizontal scrolling is introduced;
- Present/Producing/Input/Logistics alignment remains unchanged.

This correction should complement the new compressed Matrix geometry rather than weaken it.

---

## 7. Representative runtime checks

Use examples containing:

### Manufacturing

Long product names such as:

```text
Substrate Molecular Sieve
Microsecond Regulator
Aldumite Drilling Rig
Veryl-Treated Manifold
```

where available in test/reference data.

### Imports

Long remote outpost names.

Confirm full or substantially improved display at compressed widths.

Retain title/tooltip fallback for names that still exceed the combined span.

---

## 8. Explicitly out of scope

Do not change:

```text
global Item-column width
Source-column width
Matrix hard minimum
compressed padding threshold
state-control sizes
Manufacturing semantics
Import semantics
Cargo Pad summary ellipsization
workspace pane behavior
```

This is only a row-span correction for sections where Source is structurally unused.

---

## 9. Verification

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Browser-check both Manufacturing and Imports at compressed widths.

---

## 10. Completion report

Report:

```text
file(s) changed
row-span implementation approach
Manufacturing result
Imports result
sticky-column behavior
compressed-width result
tests/checks run
```

Explicitly state whether:

- any global Matrix column widths changed;
- any Matrix minimum width changed;
- any domain logic changed;
- any import/manufacturing semantics changed.

Do not commit or push unless explicitly asked.

---

## 11. Suggested commit message

Because this belongs to the current uncommitted Matrix-compression batch, keep the planned commit:

```text
style: improve resource matrix compression
```

If committed separately:

```text
fix: use empty source space in matrix rows
```

---

## 12. Final instruction

Use the empty Source column where it is semantically guaranteed to be empty.

Manufacturing product names and Imports remote-outpost names should span **Item + Source** without changing the six-column Matrix model elsewhere.
