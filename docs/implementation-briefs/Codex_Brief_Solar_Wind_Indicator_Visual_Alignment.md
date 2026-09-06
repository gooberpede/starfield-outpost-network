# Codex Mini-Brief — Solar/Wind Indicator Visual Alignment

## Objective

Make a very small presentation-only cleanup to the new Solar and Wind efficiency indicators in Outpost Details.

The indicators work correctly. This pass should only make them visually align with the adjacent Biome toggle buttons.

Do **not commit or push**.

---

## 1. Read first

Inspect:

- `src/ui/components/OutpostDetails.tsx`
- `src/ui/components/OutpostDetails.css`
- current Biome toggle button styling / inherited button metrics
- the current Solar/Wind indicator implementation

This is a visual alignment pass only.

---

## 2. Match indicator text size to Biome buttons

The text inside the Solar/Wind indicator boxes should use the same visible font size as the Biome toggle-button text.

Do not make the indicator text larger or smaller than the adjacent Biome controls.

Prefer reusing the same effective font sizing rather than inventing a separate typography rule.

---

## 3. Match indicator height to Biome buttons

The Solar/Wind indicator boxes should be the same height as the Biome toggle buttons.

Their borders should line up cleanly across the control row.

Do not change the existing fixed width:

```text
4.25rem
```

unless inspection proves a tiny adjustment is necessary for exact alignment. The goal is to preserve stable horizontal geometry.

---

## 4. Match vertical text alignment

The text inside each indicator should be vertically aligned the same way as text inside the Biome buttons.

Avoid the current appearance where the passive indicator text sits at a different vertical position.

Use normal CSS alignment/padding/line-height techniques.

Do not make the indicators interactive.

---

## 5. Center the labels

The `Solar` and `Wind` labels above the indicator boxes should be centered horizontally over their respective fixed-width fields.

Desired appearance:

```text
            Solar   Wind    Biome
            [Good]  [Norm.] [Volcanic] [Mountains]
```

rather than left-aligned labels over narrow centered boxes.

Do not change the System, Body, or Biome labels.

---

## 6. Preserve all existing semantics

Do not change:

- efficiency bucket logic;
- presentation labels (`V.Poor`, `Poor`, `Norm.`, `Good`, `None`, `—`);
- fixed-width behaviour;
- indicator placement between Body and Biome;
- no-body/unknown behaviour;
- domain logic;
- tests unrelated to visual alignment;
- persistence;
- schema;
- Undo/Redo;
- validation;
- Biome toggle behaviour;
- wrapping behaviour;
- navigation/Cargo Pads/workspace layout.

---

## 7. CSS quality

Prefer a small, local stylesheet adjustment.

Avoid:

- hard-coded offsets;
- absolute positioning;
- changing global button styles;
- changing the overall Outpost Details grid.

If possible, make the passive indicator metrics explicitly mirror the existing button metrics.

---

## 8. Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Then browser smoke-test at desktop width.

Verify:

1. Solar/Wind text size matches Biome button text;
2. Solar/Wind boxes match Biome button height;
3. text vertical alignment matches;
4. Solar/Wind labels are centered over the boxes;
5. 4.25rem fixed widths remain stable;
6. switching bodies does not shift Biome controls;
7. biome wrapping remains unchanged;
8. no console errors.

Do not leave temporary test edits behind.

---

## 9. Completion report

Report:

1. files changed;
2. exact CSS adjustment used to match font size/height/alignment;
3. confirmation labels are centered;
4. confirmation fixed width remains unchanged;
5. lint result;
6. build result;
7. `git diff --check` result;
8. browser smoke-test result;
9. confirmation no logic or functionality changed.

Do not commit or push.
