# Codex Correction Brief — Resource Matrix Logistics Screen-Reader Semantics

## Objective

Implement a **small, narrowly scoped accessibility correction** for the Resource Matrix Logistics column.

The current Logistics cells are intentionally **passive status indicators**, not interactive controls, and they were previously removed from sequential Tab order to avoid flooding keyboard navigation with inert Matrix states.

That decision remains correct.

The defect is different:

> When a screen-reader user inspects a Logistics status, the control/state is not described meaningfully. Narrator reports only positional/control information and does not communicate the actual logistics meaning.

The goal is therefore:

> Expose the Logistics status and destination meaning to assistive technology **without making the status interactive, focusable, or button-like**.

Do not reintroduce Logistics states into the sequential Tab order.

---

## Confirmed manual behavior

Manual Narrator testing found:

- Logistics states remain visually present and useful.
- They cannot and should not be tabbed to.
- Clicking or otherwise inspecting them with Narrator does not expose useful state text.
- Narrator does not communicate information such as:
  - whether the row is being exported;
  - where it is being exported;
  - which outpost or outposts are destinations.

For a row such as `Microsecond Regulator`, the minimum useful spoken meaning should be equivalent to:

> “Microsecond Regulator is exported to Outpost Beta.”

or, for multiple destinations:

> “Microsecond Regulator is exported to Outpost Beta and Outpost Gamma.”

Exact wording should follow existing localized semantics and message keys where possible.

---

## Important historical context

A previous accessibility correction deliberately removed passive Matrix statuses from sequential focus.

That earlier decision must remain intact.

The Resource Matrix currently distinguishes:

- interactive editable states, which remain keyboard-focusable where appropriate;
- passive read-only states, which are informational and intentionally excluded from sequential Tab order.

Do **not** undo that model.

The earlier accessibility audit explicitly recommended exposing read-only state and its explanation through reading/browse semantics rather than restoring individual Tab stops.

---

## Scope

Primary area:

```text
src/ui/components/OutpostStatusMatrix.tsx
```

Potentially:

```text
tests/componentAccessibility.test.tsx
```

and localization catalogues **only if** no existing localized message can describe the Logistics state adequately.

Do not touch CSS unless a semantic correction genuinely requires it. No visual change is expected.

---

## Required behavior

For each passive Logistics state, assistive technology should be able to determine:

1. the item/resource/product represented by the Matrix row;
2. whether that item has routed exports from this outpost;
3. the destination outpost name or names when exports exist.

Examples of acceptable accessible meanings:

```text
Microsecond Regulator is exported to Alpha.
```

```text
Microsecond Regulator is exported to Alpha and Beta.
```

For no routed exports, expose an appropriate localized inactive meaning, e.g.:

```text
Microsecond Regulator is not being exported from this outpost.
```

Do not invent wording if an existing Matrix Logistics tooltip/message already expresses the same semantic information.

Prefer reusing existing localized logistics messages.

---

## Hard constraints

### Logistics remains passive

Do not:

- convert Logistics spans/cells into buttons;
- add `tabIndex={0}`;
- add click handlers;
- add `aria-pressed`;
- add keyboard activation;
- introduce roving focus;
- turn the Matrix into an ARIA grid;
- add new sequential Tab stops.

The Logistics state is informational.

### Preserve Matrix semantics

Do not change:

- `role="table"` structure;
- rowgroup ownership;
- row/column semantics;
- current editable Present/Producing controls;
- current Inputs/Producing/Import passive-state focus model;
- Manufacturing row geometry;
- Matrix scrolling;
- forced-colors styling;
- responsive behavior.

### No visual changes

This correction should not alter:

- button/status geometry;
- spacing;
- colors;
- borders;
- labels;
- visible abbreviations;
- column widths.

### No live-region solution

Do not add a live region merely to announce Logistics state.

The status should be available through the element/cell's own accessible semantics during normal screen-reader reading/browse navigation.

---

## Preferred implementation approach

Inspect the existing passive status abstraction in `OutpostStatusMatrix.tsx`.

Prefer one of these approaches, whichever best fits the current implementation:

### Option A — accessible label on the passive status element

Keep the visible compact state exactly as it is, but give the passive Logistics state an accessible name that expresses the full localized meaning.

For example:

```tsx
<span
  className="..."
  aria-label={localizedLogisticsMeaning}
>
  ...
</span>
```

Use this only if it does not cause duplicate speech from visible text plus the accessible label.

### Option B — accessible description associated with the status/cell

If the visible state already has an appropriate accessible name, attach a localized description containing the destination semantics.

For example:

```tsx
aria-describedby={descriptionId}
```

with stable hidden descriptive text.

Use this only if it integrates cleanly with the existing passive-state abstraction.

### Option C — expose semantic text directly through the table cell

If the status span itself is not the best semantic owner, make the Logistics table cell expose the full localized meaning in reading/browse mode while keeping the compact visible child unchanged.

The important requirement is that screen-reader reading of the Matrix reaches the Logistics meaning naturally.

---

## Existing localization / domain seams

Before adding new messages, inspect existing Logistics tooltip and routing presentation helpers.

The product already has logic that derives routed export destinations in stable outpost order and collapses duplicate names.

Reuse the existing derivation rather than recomputing destination semantics separately for accessibility.

Use the localization layer for:

- item names;
- destination outpost names;
- list joining;
- exported/not-exported wording.

Do not hard-code English `aria-label` or hidden text.

If a suitable existing message already says the equivalent of:

```text
{item} is exported to {destinations}.
```

reuse it.

If a new message is unavoidable:

- add it to the baseline catalogue;
- maintain locale/key parity according to current project rules;
- preserve existing localized list formatting;
- do not add literals directly in JSX.

---

## Multi-destination behavior

If an item is exported to multiple outposts:

- use the existing localized list formatter;
- preserve stable destination ordering;
- collapse duplicate destination names according to existing domain behavior;
- do not expose raw IDs.

Examples:

```text
Alpha and Beta
```

or the locale-appropriate equivalent.

Do not manually concatenate with commas/`and`.

---

## Tests

Add or update focused component accessibility coverage.

At minimum, verify that:

1. a Logistics state with no routed export exposes a meaningful localized inactive description/name;
2. a Logistics state with one routed destination exposes the item and destination name;
3. a Logistics state with multiple destinations exposes the localized destination list;
4. the Logistics element remains outside sequential Tab order;
5. no button role or activation semantics are introduced;
6. existing Matrix table/rowgroup semantics remain unchanged.

Prefer testing through accessible names/descriptions/roles rather than implementation-specific class assertions.

Do not write a test that merely asserts `title` text exists.

Native `title` alone is not sufficient for essential screen-reader information.

---

## Manual verification required

After implementation, manually verify with Narrator:

1. Navigate through/read the Resource Matrix using Narrator's reading/browse navigation.
2. Inspect a Logistics state with no export.
3. Inspect a Logistics state with one destination.
4. Inspect a Logistics state with multiple destinations if available.
5. Confirm Narrator communicates the actual logistics meaning, including destination outpost names.
6. Confirm the Logistics statuses still do **not** appear in ordinary Tab navigation.

The exact Narrator preamble may vary.

The pass condition is:

> The user can determine what the Logistics state means without relying on vision and without tabbing through passive status chips.

---

## Regression guardrails

Do not modify or regress any previously accepted accessibility work, including:

- Cargo full-name accessibility;
- Planned Supply state announcement behavior;
- Context Help semantics or sizing;
- Outpost Details landmark;
- locale-selector language metadata;
- Validation navigation;
- Character numeric validation timing;
- Search behavior;
- collapsed Cargo Link summaries;
- Manufacturing full-name overflow behavior;
- forced-colors selected/lit treatment;
- one-main semantic shell;
- Matrix rowgroup ownership.

No opportunistic accessibility cleanup.

No CSS refactor.

No component restructuring unless absolutely necessary to attach the semantic description.

---

## Verification

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

The existing non-failing Vite/Rollup large-chunk warning is not part of this task.

---

## Final report

Report:

### Root cause

Explain why the current Logistics state is visually meaningful but insufficiently exposed to screen readers.

### Changed

List:

- files touched;
- semantic mechanism chosen;
- localization messages reused or added;
- how destination names/lists are derived;
- tests added/updated.

### Not changed

Explicitly confirm:

- Logistics remains passive;
- no Tab stops were added;
- no button/activation semantics were introduced;
- Matrix structure/layout/CSS were not changed unless strictly necessary;
- unrelated accessibility surfaces were untouched.

### Verification

Report command results and note that manual Narrator verification is still required.

---

## Completion principle

The correction succeeds when:

> A screen-reader user can understand the Logistics status and destination meaning while reading the Matrix, without the passive Logistics indicators becoming interactive or re-entering sequential keyboard focus.
