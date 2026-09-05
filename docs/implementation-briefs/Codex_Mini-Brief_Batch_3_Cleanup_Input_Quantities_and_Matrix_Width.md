# Codex Mini-Brief — Batch 3 Cleanup: Input Quantities and Matrix Width

## Objective

Make one focused UX cleanup to the completed Batch 3 implementation.

The current Batch 3 matrix now displays input quantities such as:

```text
Water ×1
Fiber ×2
```

for organic farming inputs, and manufacturing inputs also gained visible quantities.

This is premature for the current tracker because version 1 does **not** model throughput, production rates, or material-flow quantities. Showing quantities implies operational significance that the app does not yet calculate.

The goal of this correction is therefore:

1. remove visible input quantities from both organic and manufacturing matrix input cells;
2. preserve quantity metadata internally/reference-side for future throughput work;
3. restore the previous compact matrix state/control width if the quantity display was the reason it was widened;
4. make no other Batch 3 semantic changes.

Do **not commit or push**.

---

# 1. Read first

Inspect the current Batch 3 changes, especially:

* matrix input rendering;
* shared input/state controls;
* `src/ui/OutpostStatusMatrix.tsx` and related components/helpers;
* relevant CSS;
* any shared manufacturing-input presentation logic;
* organic farming input presentation;
* regression tests that assert visible quantity text.

Do not redesign unrelated matrix layout or availability behaviour.

---

# 2. Remove visible quantities

Change input presentation so resource requirements are displayed by resource identity only.

Desired presentation:

```text
Water
Fiber
Nutrient
```

not:

```text
Water ×1
Fiber ×2
Nutrient ×2
```

Apply this consistently to:

* manufacturing/fabricator inputs;
* organic farming inputs.

Do not distinguish them visually by quantity in this version.

---

# 3. Preserve quantity metadata

Do **not** remove or flatten quantity data from:

* `RecipeIngredientReference`;
* `OrganicFarmingProfileReference`;
* generated reference JSON;
* canonical source data;
* domain models;
* validation inputs.

The quantities remain useful future reference data.

Only remove their **current matrix presentation**.

Do not change input-availability validation merely because quantities are no longer shown.

Current validation continues to answer:

> Is the required input resource available?

It does not attempt to answer:

> Is enough of that resource available per unit time?

---

# 4. Throughput remains out of scope

Do not add:

* production rates;
* tick calculations;
* resource balances;
* net-flow modelling;
* input allocation;
* source selection for input resources;
* self-consumption restrictions;
* quantity sufficiency warnings.

The current availability model remains intentionally qualitative.

Self-satisfying production loops are allowed under the current semantics because the tracker only models whether a required resource is available at the outpost.

Do not change farming/manufacturing validation for this cleanup.

---

# 5. Restore compact matrix geometry

Batch 3 appears to have widened shared matrix state/input controls from approximately:

```css
width: 3.2rem;
```

to:

```css
width: 4.2rem;
```

to accommodate quantity labels.

Once quantities are removed, restore the previous compact width where appropriate.

Use the pre-Batch-3 matrix geometry as the baseline.

Do not blindly force `3.2rem` if inspection shows a different current selector or a Batch 3-specific control genuinely requires more space. The intent is:

> remove width introduced solely for visible quantities and return to the previously settled dense matrix layout.

Do not alter unrelated column widths, section spacing, row heights, or typography.

---

# 6. Preserve Batch 3 behaviour

This cleanup must not affect:

* biome selection;
* biome grouping/disambiguation;
* atmospheric availability;
* source-specific organic rows;
* active production routes;
* `organic-unspecified`;
* Source column species names;
* Present/Producing semantics;
* organic farming profiles;
* input availability validation;
* Planned Supply semantics;
* cargo/logistics aggregation;
* persisted schema;
* migrations;
* import/export;
* Undo/Redo.

Only presentation density should change.

---

# 7. Tests

Update any tests that currently expect quantity text in matrix rendering.

Preserve tests proving:

* organic inputs resolve from the correct farming profile;
* plant route requires Water;
* herbivore route requires Water + Fiber;
* carnivore route requires Water + Nutrient;
* manufacturing inputs still resolve correctly;
* input validation behaviour is unchanged.

If practical, add/adjust a presentation-level regression proving:

```text
Water
Fiber
```

are rendered without:

```text
×1
×2
```

Do not weaken domain tests merely because quantities are hidden.

---

# 8. Documentation

If Batch 3 documentation explicitly says quantities are shown in the matrix, correct that wording.

Document the current rule where appropriate:

> Input quantities are retained in reference data for future throughput modelling but are not surfaced in the current matrix because version 1 validates resource availability, not production capacity.

Do not expand the throughput design in this pass.

---

# 9. Verification

Run the relevant regression suites, then:

```text
npm run lint
npm run build
git diff --check
```

Perform a quick browser smoke test.

Confirm:

1. manufacturing inputs show resource names only;
2. organic farming inputs show resource names only;
3. no `×1`, `×2`, etc. remain in matrix input cells;
4. matrix density returns to the intended compact appearance;
5. biome buttons and source-specific rows are unchanged;
6. input validation still behaves exactly as before;
7. no console errors;
8. no persisted schema/import/export changes.

Do not leave temporary browser-test edits behind.

---

# 10. Completion report

Report:

1. files changed;
2. where quantity display was removed;
3. confirmation quantity metadata remains intact;
4. whether the matrix width was restored, and to what value;
5. tests changed and final passing count;
6. lint result;
7. build result;
8. `git diff --check` result;
9. browser smoke-test result;
10. confirmation no domain/validation/persistence semantics changed.

Do not commit or push.
