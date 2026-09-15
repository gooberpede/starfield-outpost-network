# Codex Correction Brief — Resource Matrix Logistics Spoken Text for Exports and Imports

## Objective

Implement a **small, regression-sensitive accessibility correction** for the Resource Matrix Logistics column.

This brief covers **both** Logistics meanings because they are presented in the same column and exhibit the same class of real-world Narrator failure:

1. **Exports** — Logistics cells in the Inorganic, Organic, and Manufacturing sections.
2. **Imports** — Logistics cells in the Imports section.

The current visual UI and tooltips already contain the correct information.

The defect is:

> When a Narrator user clicks/inspects the visible Logistics status, Narrator reads only the compact cell text (or even just its first letter) and ignores the meaningful tooltip/accessibility text.

The goal is therefore:

> Make the same meaningful sentence already represented by the tooltip available as **actual assistive text in the cell's accessible content**, while preserving the compact visible abbreviation and keeping all Logistics states passive and outside sequential Tab order.

---

# Confirmed manual behavior

## Export Logistics cells

These are Logistics cells in rows belonging to:

- Inorganic;
- Organic;
- Manufacturing.

Example visible cell:

```text
[ Cu ]
```

Example tooltip:

```text
Copper is being exported to Feynman VI-b AlBe He3
```

After the previous correction, clicking/inspecting the cell with Narrator causes Narrator to report the table position and then only:

```text
C
```

It does **not** speak the full item name or the tooltip meaning.

## Import Logistics cells

These are Logistics cells in rows belonging to:

- Imports.

Example visible cell:

```text
TGR
```

Expected tooltip meaning:

```text
Tau Grade Rheostats are being imported
```

Narrator instead reports the table position and reads only:

```text
TGR
```

It does **not** speak the full item name or the import meaning.

---

# Previous export correction and why it is insufficient

The immediately preceding export correction introduced a `LogisticsCell` that computes the correct export meaning via the existing tooltip helper and applies it as an accessible name on the table cell:

```tsx
function LogisticsCell({ item, destinationNames, className }: {
  item: ItemDisplay
  destinationNames: readonly string[]
  className?: string
}) {
  const { locale } = useLocalization()
  const meaning = getExportTooltip(item.name, destinationNames, locale)

  return <div className={className} role="cell" aria-label={meaning}>
    {destinationNames.length > 0 && <ReadOnlyState
      item={item}
      lit
      title={meaning}
      assistiveHidden
    />}
  </div>
}
```

This is semantically plausible in automated tests, but **manual Narrator testing shows that `aria-label` on the structural table cell is not being surfaced when the visible child/cell is hit-tested or clicked**.

Do not layer additional ARIA onto this failed mechanism.

The correction should change the mechanism from:

> accessible name on the structural cell

to:

> real assistive text inside the cell's accessibility subtree.

---

# Scope

Primary file:

```text
src/ui/components/OutpostStatusMatrix.tsx
```

Focused tests:

```text
tests/componentAccessibility.test.tsx
```

Localization catalogues should be touched **only if absolutely necessary**.

No CSS change is expected if the existing shared visually-hidden class can be reused.

---

# Required behavior

## Export rows

For an exported item, the Logistics cell must expose the same localized meaning already used by the export tooltip.

Examples:

```text
Copper is being exported to Feynman VI-b AlBe He3
```

```text
Microsecond Regulator is being exported to Alpha and Beta
```

The exact wording should come from the existing export-tooltip/localization seam.

For no routed export, expose the existing localized inactive meaning if the Matrix currently models an inactive Logistics cell as meaningful content.

Do not invent a second accessibility-specific export sentence if the existing tooltip already owns the correct wording.

## Import rows

For an imported item, the Logistics cell must expose the same localized meaning already used by the import tooltip.

Example:

```text
Tau Grade Rheostats are being imported
```

If the existing tooltip includes source/outpost detail, expose that existing full meaning rather than reducing it.

Again, reuse the current import-tooltip/localization seam.

---

# Preferred implementation pattern

The current export `aria-label={meaning}` solution should be replaced.

Prefer a pattern in which the cell contains **actual visually-hidden semantic text**.

For example:

```tsx
<div className={className} role="cell">
  <span className="ui-visually-hidden">
    {meaning}
  </span>

  {destinationNames.length > 0 && (
    <ReadOnlyState
      item={item}
      lit
      title={meaning}
      assistiveHidden
    />
  )}
</div>
```

The key properties are:

- `meaning` exists as real text in the accessibility subtree;
- the compact visible abbreviation remains visible;
- the compact visible abbreviation is hidden from assistive technology when necessary to prevent duplicate/conflicting speech;
- the table cell itself does not rely on `aria-label` as the sole carrier of meaning.

For import rows, use the equivalent pattern around the existing visible import state.

Do **not** mechanically duplicate markup if a tiny shared helper can handle both export/import semantic-text ownership cleanly.

However, do not introduce a broad abstraction or refactor merely to unify them.

---

# Important semantic distinction

Do not conflate exports and imports.

## Export meaning

Applies to Inorganic, Organic, and Manufacturing rows.

The sentence must describe that the item **is being exported**, including routed destination outpost names where the existing tooltip does so.

## Import meaning

Applies to Imports rows.

The sentence must describe that the item **is being imported** using the existing import tooltip meaning.

Do not reuse export wording for import rows.

---

# Hard constraints

## Logistics remains passive

Do not:

- convert any Logistics state into a button;
- add `tabIndex={0}`;
- add click handlers;
- add keyboard activation;
- add `aria-pressed`;
- introduce roving focus;
- add new sequential Tab stops;
- turn the Matrix into an ARIA grid.

The cells remain informational.

## Preserve visual presentation

Do not change:

- visible abbreviations;
- compact state geometry;
- spacing;
- borders;
- colors;
- column widths;
- Matrix responsive behavior;
- Manufacturing overflow behavior;
- forced-colors behavior.

## Preserve Matrix structure

Do not change:

- `role="table"`;
- rowgroups;
- row/cell ownership;
- headings;
- current editable Present/Producing controls;
- existing passive-state focus model.

## No live region

Do not solve this with `aria-live`.

This information is not transient feedback. It belongs to the table cell's normal readable content.

## Do not rely on `title`

The visual tooltip may remain exactly as it is, but native `title` is not sufficient for essential screen-reader information.

---

# Localization and domain reuse

Before adding any messages, inspect the existing helpers used to produce:

- export tooltip text;
- import tooltip text.

Reuse those exact helpers/messages where possible.

For exports, preserve:

- routed destination derivation;
- stable order;
- duplicate collapse;
- localized list formatting;
- localized item/reference names.

For imports, preserve the existing import summary/tooltip derivation and any source/destination naming already present.

Do not hard-code English hidden text.

Do not expose raw stable IDs.

---

# Test philosophy

The previous export test apparently proved that a `role="cell"` could receive an accessible name matching the export sentence.

That is no longer a sufficient acceptance test because **manual Narrator testing demonstrated that this mechanism fails in the real UI**.

Update the tests to protect the new mechanism instead.

At minimum, verify for exports:

1. the Logistics cell contains visually-hidden semantic text with the full localized export meaning;
2. the visible abbreviation remains present visually;
3. the visible abbreviation/state is hidden from assistive technology if necessary to prevent duplicate speech;
4. no Tab stop is introduced;
5. no button/checkable/activation semantics are introduced.

At minimum, verify for imports:

1. the Imports Logistics cell contains visually-hidden semantic text with the full localized import meaning;
2. the visible abbreviation remains present visually;
3. the visible abbreviation is not the only accessible text;
4. no Tab stop is introduced;
5. no interactive semantics are introduced.

Also retain coverage for:

- one export destination;
- multiple export destinations;
- localized destination-list formatting;
- current Matrix rowgroup/table structure.

Do **not** make the core assertion merely:

```text
cell has accessible name X
```

if that accessible name exists only because of `aria-label` on the structural cell.

The test should establish that the meaningful sentence exists as real hidden text in the cell subtree.

---

# Manual verification required

After implementation, verify with Windows Narrator in the actual running application.

Before testing, confirm the dev server is running the current code.

## Export test

Choose a routed export row, for example Copper.

Click/inspect the visible Logistics cell.

Pass condition:

> Narrator communicates the full export meaning, including the full item name and destination outpost name(s), rather than merely `C`, `Cu`, or another abbreviation fragment.

Example acceptable meaning:

```text
Copper is being exported to Feynman VI-b AlBe He3
```

Narrator may prepend table-position/context information. That is acceptable.

## Import test

Choose an Imports row, for example Tau Grade Rheostats.

Click/inspect the visible Logistics cell.

Pass condition:

> Narrator communicates the full import meaning, rather than merely `TGR`.

Example acceptable meaning:

```text
Tau Grade Rheostats are being imported
```

Again, Narrator may prepend structural/table information.

## Keyboard regression

Confirm that neither export nor import Logistics states enter ordinary Tab navigation.

---

# Regression guardrails

Do not touch or regress:

- locale-selector language metadata;
- Cargo full-name accessibility;
- Planned Supply announcement behavior;
- Context Help semantics/sizing;
- Outpost Details landmark;
- Validation navigation;
- Character numeric validation;
- Search;
- collapsed Cargo summaries;
- Manufacturing full-name overflow behavior;
- forced-colors selected/lit treatment;
- one-main semantic shell;
- Matrix rowgroup ownership.

No opportunistic cleanup.

No broad `ReadOnlyState` redesign unless the exact export/import fix genuinely requires a tiny, clearly justified change.

---

# Verification

Run:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

If repository-wide `git diff --check` still reports only known user-owned trailing whitespace in the unrelated accessibility audit, report that precisely and do not edit the audit as part of this task.

The existing non-failing Vite/Rollup large-chunk warning is unrelated.

---

# Final report

Report:

## Root cause

Explain why:

- `aria-label` on the structural export table cell passed automated semantics but failed manual Narrator hit-testing;
- Imports similarly exposed only compact visible text rather than the full tooltip meaning.

## Changed

List:

- files touched;
- how export semantic text is now represented;
- how import semantic text is now represented;
- existing tooltip/localization helpers reused;
- test changes.

## Not changed

Explicitly confirm:

- no Logistics Tab stops were added;
- no buttons or activation semantics were introduced;
- visible abbreviations remain unchanged;
- Matrix structure/layout/CSS were not changed unless strictly required;
- unrelated accessibility surfaces were untouched.

## Verification

Report automated results and state that the final acceptance criterion is manual Narrator verification of both an export and an import Logistics cell.

---

# Completion principle

This correction succeeds when:

> Narrator can read the same meaningful export/import sentence already represented by the Logistics tooltip, while the Matrix remains visually compact and the Logistics cells remain passive, non-focusable table content.
