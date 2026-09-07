# Codex Implementation Brief — Manufactured Product Effective Availability

## Objective

Fix the domain availability logic so that a manufactured product is considered locally available **only when its fabricator's recipe inputs are effectively available**, while preserving the intended semantics of Planned Supply.

This is a domain-logic correction, not a UI redesign.

The current bug is that merely adding a manufacturing entry makes its product count as available, even when recipe inputs are missing. This causes at least two visible errors:

- the product appears as an available Cargo export;
- the product is disabled in Planned Supply even though the local fabricator cannot yet make it.

The fix should establish one coherent availability model used by Cargo, Planned Supply, provenance, manufacturing validation, and any other consumers.

---

## 1. Read repository guidance first

Before editing, inspect relevant guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Inspect especially:

```text
src/domain/availability.ts
src/domain/provenance.ts
src/domain/logistics.ts
src/domain/validation/rules/manufacturingInputsUnavailable.ts
src/App.tsx
src/ui/components/PlannedSupplyEditor.tsx
src/ui/components/CargoPadsEditor.tsx
src/ui/components/OutpostStatusMatrix.tsx
src/domain/referenceData.ts
src/domain/models.ts
```

Also inspect existing tests covering availability, cargo, Planned Supply, manufacturing, provenance, and validation.

---

# PART A — LOCKED SEMANTICS

## 2. Planned Supply semantics

Planned Supply represents **virtual supply** intended to let the user work as though upstream requirements have already been fulfilled.

For prerequisite purposes:

> Planned Supply resources/products must be treated the same as actual resources/products.

This means Planned Supply may satisfy:

- manufacturing recipe inputs;
- downstream manufacturing dependencies;
- Cargo export eligibility indirectly through a supplied fabricator;
- other availability checks that depend on supply being present.

However:

- the Planned Supply item itself remains virtual;
- once that exact item acquires an actual source, its Planned Supply placeholder is retired and does not return except via Undo;
- a manufactured output does **not** become virtual merely because one or more of its inputs are Planned Supply.

Example:

```text
Product A requires Product B
Product B requires Resource C

C is Planned Supply
B is manufactured locally
A is manufactured locally
```

Then:

```text
C is effectively available
B is manufacturable and is a real local product
A is manufacturable and is a real local product
```

---

## 3. Manufactured product availability rule

A local manufacturing entry alone is **not enough** to make its product available.

A manufactured product becomes locally available only when:

```text
manufacturing entry exists
AND
every direct recipe input is effectively available
```

Where **effectively available** means the input is available via any of:

```text
active local production
inbound cargo
Planned Supply
another feasible locally manufactured product
```

This rule must support multi-step local manufacturing chains.

---

## 4. Actual vs virtual distinction

Preserve this distinction:

### Planned Supply item

Virtual.

It may satisfy prerequisites, but it is not itself an actual source.

### Manufactured output whose inputs include Planned Supply

Real local manufactured output.

It may:

- count as locally available;
- be exported;
- satisfy downstream manufacturing recipes;
- disable itself in Planned Supply because it is already locally available;
- retire its own Planned Supply placeholder if one existed.

This is intentional.

---

# PART B — EFFECTIVE AVAILABILITY RESOLUTION

## 5. Prefer a fixed-point resolver

Use one central domain resolver that computes effective availability for an outpost.

A fixed-point / iterative approach is preferred over naive recursion.

Conceptually:

```text
effective = active local resources
          + inbound cargo
          + Planned Supply

repeat:
    for each manufacturing entry:
        if all recipe inputs are in effective:
            add manufactured product
until no new products are added
```

This naturally supports:

- manufacturing chains;
- Planned Supply inputs;
- local manufactured intermediates;
- cycle safety.

---

## 6. Cycle safety

The resolver must not make cyclic recipes magically available.

Example:

```text
A requires B
B requires A
```

If neither A nor B is available from another source, neither becomes available.

The fixed-point approach should naturally achieve this.

If one side is externally/effectively supplied, normal propagation may proceed.

---

## 7. Missing recipe reference data

Preserve current defensive behavior unless a stronger existing rule exists.

A manufacturing entry whose product has no recipe reference must **not** be assumed feasible solely because the manufacturing entry exists.

Prefer:

- do not add the product to manufactured availability unless recipe data proves its inputs are satisfied;
- leave unknown/missing reference-data concerns to the appropriate integrity validator.

Do not silently treat missing recipe data as an empty recipe unless existing domain rules explicitly require that.

---

# PART C — AVAILABILITY API

## 8. Refactor availability.ts around shared semantics

Current behavior in `getActuallyAvailableItemsAtOutpost()` unconditionally adds every `outpost.manufacturing` product.

Replace that assumption.

Introduce a helper or helpers that compute:

```text
base actual supply
effective supply
feasible manufactured products
```

Names are up to the implementation, but the semantics must remain clear.

A clean structure might be conceptually:

```ts
getBaseActuallyAvailableItemsAtOutpost(...)
getEffectiveAvailableItemsAtOutpost(...)
getFeasibleManufacturedProductIdsAtOutpost(...)
```

Do not over-engineer if a smaller arrangement is cleaner.

---

## 9. Preserve public API intent where possible

Existing callers currently use:

```text
getActuallyAvailableItemsAtOutpost()
getAvailableItemsAtOutpost()
```

Preserve these APIs if practical, but correct their semantics.

### `getActuallyAvailableItemsAtOutpost`

Should return:

- active local production;
- inbound cargo;
- feasible locally manufactured products.

A manufactured product may qualify even if some of its inputs are Planned Supply, because the output itself is real once its fabricator is fully supplied under effective-supply semantics.

Do **not** return Planned Supply placeholders themselves from this function.

### `getAvailableItemsAtOutpost`

Should return:

```text
actually available items
+
Planned Supply placeholders
```

This remains the broad effective/selectable supply set.

---

# PART D — CONSISTENT CONSUMERS

## 10. Planned Supply behavior

After the fix:

A manufactured product should be disabled in Planned Supply **only if it is actually available by some real route**, including:

- inbound cargo;
- feasible local manufacturing.

A manufacturing entry with missing effective inputs must **not** disable its product in Planned Supply.

Example:

```text
Microsecond Regulator manufacturing entry exists
missing required inputs
MRg not inbound
MRg not Planned Supply
```

Expected:

```text
MRg is selectable in Planned Supply
```

If the user adds MRg to Planned Supply, it becomes effectively available directly.

If the fabricator later becomes fully supplied and MRg becomes actually available, the MRg Planned Supply placeholder retires automatically.

---

## 11. Cargo export eligibility

A manufactured product should appear as exportable only if it is effectively producible / actually available.

A manufacturing entry with missing inputs must **not** make its product exportable.

Example:

```text
MRg manufacturing entry exists
missing inputs
```

Expected:

```text
MRg not offered as available export
```

If all required inputs become effectively available, MRg becomes exportable.

---

## 12. Planned Supply retirement

`retireFulfilledPlannedSupply()` currently relies on `getActuallyAvailableItemsAtOutpost()`.

Preserve that design if practical.

After availability semantics are corrected, it should naturally behave as intended:

- unresolved virtual supply remains;
- once the exact item acquires an actual source, remove its Planned Supply placeholder;
- do not remove Planned Supply merely because a manufacturing entry exists.

---

## 13. Provenance

`getItemProvenanceAtOutpost()` currently treats any manufacturing entry as a local source.

Correct this.

For products:

```text
local = true
```

only when local manufacturing is feasible under the same effective availability rules.

Planned Supply itself must not be reported as actual provenance.

A manufactured output whose inputs depend on Planned Supply may still report:

```text
local = true
```

because the output source is the local fabricator.

Preserve remote provenance behavior.

---

## 14. Manufacturing validation

`manufacturingInputsUnavailable` already checks direct recipe inputs using `getAvailableItemsAtOutpost()`.

Audit it after the availability refactor.

Desired behavior:

- keep direct-input warning semantics;
- Planned Supply may satisfy a missing input;
- locally manufactured intermediate products may satisfy an input only if they are themselves feasible;
- do not introduce recursive duplicate warnings beyond the current one-warning-per-direct-missing-input model unless clearly required.

Do not change severity/category unless needed.

---

## 15. Resource Matrix manufacturing row

The Manufacturing row currently shows the product as lit unconditionally.

Review this presentation against the corrected domain semantics.

If `Producing` / product-state display is intended to represent **actual local availability**, it should no longer appear lit when the fabricator has missing effective inputs.

If the row intentionally represents “manufacturing entry exists” rather than “output available”, preserve the distinction but make sure the current UI semantics remain truthful.

Do not change visual language unnecessarily.

Report the existing meaning and any change made.

---

# PART E — TEST CASES

## 16. Core regression test: Microsecond Regulators

Create a focused test reproducing the reported bug.

Setup:

```text
outpost has MRg manufacturing entry
one or more MRg recipe inputs missing
MRg not inbound
MRg not Planned Supply
```

Expected:

```text
MRg NOT in getActuallyAvailableItemsAtOutpost
MRg NOT offered as available Cargo export
MRg selectable in Planned Supply
MRg local provenance = false
manufacturing validator reports missing direct inputs
```

---

## 17. Planned Supply input test

Setup:

```text
MRg manufacturing entry
all recipe inputs satisfied
at least one input satisfied only by Planned Supply
```

Expected:

```text
MRg is actually available
MRg can be exported
MRg local provenance = true
MRg itself is disabled in Planned Supply
MRg manufacturing validator has no warning for that Planned Supply-satisfied input
```

The MRg output is real even though an input is virtual.

---

## 18. Recursive manufacturing chain test

Example:

```text
A requires B
B requires C
A and B manufactured locally
C actual or Planned Supply
```

Expected:

```text
B becomes feasible
A becomes feasible
both appear in actual availability
both may satisfy downstream dependencies
```

Test at least one chain with a Planned Supply leaf.

---

## 19. Broken chain test

Example:

```text
A requires B
B requires C
C missing
```

Expected:

```text
B not feasible
A not feasible
neither appears in actual availability
```

---

## 20. Cycle test

Example:

```text
A requires B
B requires A
```

No external/effective seed.

Expected:

```text
A unavailable
B unavailable
resolver terminates
```

If one side is externally supplied, test whether the chain resolves correctly according to normal effective-supply semantics.

---

## 21. Inbound intermediate test

Example:

```text
A requires B
A manufactured locally
B imported by cargo
```

Expected:

```text
A feasible
A actually available
A local provenance = true
```

---

## 22. Planned Supply retirement test

Setup:

```text
MRg in Planned Supply
MRg fabricator initially infeasible
```

Then add missing effective inputs.

Expected:

```text
MRg becomes actually available
MRg Planned Supply entry is retired
Undo restores prior state according to existing session behavior
```

---

# PART F — UI SMOKE TESTS

## 23. Browser verification

Using the reported MRg scenario, verify:

### Before missing inputs are supplied

```text
MRg manufacturing row exists
MRg missing-input states/warnings visible
MRg NOT available as Cargo export
MRg Planned Supply button enabled/selectable
```

### After adding MRg itself to Planned Supply

```text
MRg appears as Planned Supply
downstream prerequisite checks may use MRg
```

### After satisfying the fabricator inputs instead

```text
MRg becomes available/exportable
MRg Planned Supply becomes unavailable/retired if present
```

### With one or more recipe inputs supplied only by Planned Supply

```text
MRg still becomes a real available product
```

No console errors/warnings.

---

# PART G — NON-GOALS

## 24. Do not expand scope

Do not implement:

```text
throughput calculations
recipe quantities / Research Methods adjustments
power consumption
storage capacity
production rates
manufacturing scheduling
partial throughput
inventory stockpiles
manual stock levels
new validation navigation
new UI redesign
```

This pass is only about **boolean/effective availability**.

---

# PART H — DOCUMENTATION

## 25. Update domain documentation

Update durable documentation/comments so the semantics are explicit:

> Planned Supply is virtual supply that participates fully in downstream prerequisite resolution.

Also document:

> A manufactured product becomes locally available only when all recipe inputs are effectively available.

And:

> Manufactured outputs are real even when one or more prerequisites are satisfied by Planned Supply.

Avoid ambiguous language suggesting Planned Supply is merely selectable metadata.

---

# PART I — COMPLETION REPORT

## 26. Report

On completion, report:

```text
files changed
new/refactored availability helpers
fixed-point algorithm used
cycle handling
missing-recipe handling
getActuallyAvailableItemsAtOutpost semantics
getAvailableItemsAtOutpost semantics
provenance changes
validation changes
Matrix presentation changes, if any
tests added/updated
browser smoke-test results
```

Explicitly state whether:

- persistence schema changed;
- Planned Supply persistence changed;
- Cargo semantics changed beyond corrected eligibility;
- validation severity/category changed;
- UI visual styling changed;
- throughput/quantity logic was introduced.

Do not commit or push unless explicitly asked.

---

## 27. Suggested commit message

If accepted:

```text
fix: require supplied inputs for manufacturing availability
```

---

## 28. Final instruction

Fix the root domain rule, not the visible symptoms.

The intended model is:

```text
effective supply
= actual supply
+ Planned Supply
+ recursively feasible local manufacturing
```

while:

```text
actual item provenance
!= Planned Supply provenance
```

A manufacturing entry alone must never make its product available.
