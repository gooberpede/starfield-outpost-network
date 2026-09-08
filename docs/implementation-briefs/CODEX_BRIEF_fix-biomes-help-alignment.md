# Codex Correction Brief — Restore Biomes Vertical Alignment

## Objective

Fix the visual regression introduced by adding contextual help to the **Biomes** label in Outpost Details.

Current problem:

- the new circled `?` help control makes the Biomes label row taller;
- this pushes the Biome buttons down;
- Biomes is now vertically misaligned with System, Body, Solar, and Wind.

This is a **narrow CSS/layout correction only**.

Do not change contextual-help behavior, copy, tooltip behavior, or Outpost Details structure beyond what is required to restore alignment.

---

## 1. Inspect current implementation

Review:

```text
src/ui/components/OutpostDetails.tsx
src/ui/components/OutpostDetails.css
src/ui/components/ContextHelp.tsx
src/ui/components/ContextHelp.css
```

Confirm the current cause of the regression.

The likely cause is that the Biomes label now contains a help trigger whose height exceeds the old plain-text label line, increasing only that field's label-row height.

---

## 2. Required visual outcome

At normal desktop widths, these controls should once again align vertically:

```text
System select
Body select
Solar indicator
Wind indicator
Biome buttons
```

Their top edges should sit on the same horizontal line.

The Biomes `?` must remain:

- immediately to the right of `BIOMES`;
- the same size as the other contextual-help triggers;
- keyboard/mouse accessible;
- visually unchanged unless a tiny alignment-specific adjustment is unavoidable.

Do **not** shrink the `?` to force the row back into place.

---

## 3. Preferred correction strategy

Prefer normalizing the **label-row geometry for all Outpost Details fields**, rather than special-casing Biomes.

A likely direction is to make every field label reserve a common minimum height and align its contents consistently, for example conceptually:

```css
.outpost-details__field > span {
  min-height: <shared label-row height>;
  display: flex;
  align-items: center;
}
```

or an equivalent approach that matches the existing structure.

The exact implementation is up to Codex after inspecting the DOM/CSS.

Important:

- preserve current label typography;
- preserve Solar/Wind centered labels;
- preserve existing field gaps;
- do not create unnecessary extra vertical space;
- do not alter button/select heights.

---

## 4. Avoid brittle fixes

Do not solve this by:

```text
shrinking the help trigger
negative margins
absolute-positioning the Biomes label
moving the Biome buttons with transforms
adding Biomes-only top/bottom offsets
```

unless there is no cleaner layout-level solution.

Prefer a shared row-height/alignment rule.

---

## 5. Responsive behavior

Verify the correction at:

- normal desktop width;
- moderately narrow width around the existing Outpost Details breakpoint.

Ensure:

- controls remain vertically aligned;
- Biome buttons still wrap as before;
- no new horizontal overflow is introduced;
- no label clipping occurs.

---

## 6. Regression checks

Confirm the following remain unchanged:

```text
ContextHelp open/close behavior
ContextHelp positioning
Biomes help copy
System/Body selectors
Solar/Wind indicators
Biome selection semantics
tooltip behavior
responsive workspace behavior
```

No domain or persistence logic should change.

---

## 7. Verification

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Browser-check the Outpost Details strip and compare visually against the pre-help alignment.

---

## 8. Completion report

Report:

```text
file(s) changed
root cause confirmed
CSS/layout change made
desktop alignment result
narrow-width result
tests/checks run
```

Explicitly state whether:

- ContextHelp dimensions changed;
- any contextual-help behavior changed;
- any Outpost Details control height changed;
- any responsive breakpoint changed.

Do not commit or push unless explicitly asked.

---

## 9. Suggested commit message

If accepted as part of the current uncommitted help batch, keep the existing planned commit:

```text
feat: add contextual help and state tooltips
```

If committed separately:

```text
fix: restore outpost details alignment
```

---

## 10. Final instruction

This is a **visual alignment correction only**.

Restore the original top-edge alignment of System, Body, Solar, Wind, and Biomes while keeping the new Biomes help trigger intact.
