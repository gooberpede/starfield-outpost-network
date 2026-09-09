# Codex Correction Brief — Planned Supply Validation Localization Consistency

## Objective

Make one **small, targeted correction** to the localization-foundation implementation before commit.

The current implementation correctly localizes `Aluminum` / `Aluminium` in:

```text
Resource Matrix
manufacturing-input validation
tooltips/help
```

but the Validation panel can still show the canonical `Aluminium` spelling under `en-US` in the existing:

```text
planned-supply-unresolved
```

validation rule.

This produces an internally inconsistent panel, for example:

```text
Adaptive Frame requires Aluminum, but Aluminum is not available at this outpost.
...
2 items in Planned Supply: Aluminium, Iron.
```

Fix this validator only.

Do **not** use this correction as an opportunity to migrate the rest of the validation system.

---

# PART A — READ FIRST

Review the current uncommitted localization implementation and especially:

```text
src/domain/validation/rules/plannedSupplyUnresolved.ts
src/domain/validation/rules/manufacturingInputsUnavailable.ts
src/domain/validation/types.ts
src/ui/validationPresentation.ts
src/localization/
tests/localization.test.ts
tests/validationDiagnostics.test.ts
```

Preserve the architecture already implemented.

---

# PART B — CURRENT PROBLEM

`plannedSupplyUnresolved.ts` currently resolves final reference names inside the validator:

```ts
reference?.name ?? item.id
```

and constructs the final English sentence there.

Conceptually:

```ts
1 item in Planned Supply: {name}.
2 items in Planned Supply: {name1}, {name2}.
```

Because the validator has already converted stable item IDs into canonical display names, presentation cannot apply the locale-aware reference-name overlay.

As a result:

```text
en-US
```

may still display:

```text
Aluminium
```

for this rule.

The manufacturing-input validator already demonstrates the intended incremental structured-message path.

---

# PART C — REQUIRED CORRECTION

## 1. Add a structured localization path for planned-supply-unresolved

Migrate **only** `planned-supply-unresolved` to the same incremental localization boundary.

The domain issue must retain enough structured information for presentation to resolve item names from stable IDs under the selected locale.

Do not depend on matching the current canonical display text.

Possible shapes include:

```ts
messageKey: 'validation.plannedSupplyUnresolved'
cargoItems: [...]
```

or another small equivalent representation that fits the existing `ValidationIssue` model.

Prefer reusing existing domain types such as `CargoItem` rather than introducing duplicate resource/product identity structures.

Keep the existing `message: string` as a legacy/fallback value if the current backward-compatible validation architecture requires it.

---

## 2. Extend the typed message-key model minimally

Add only the new key needed for this rule, for example:

```text
validation.plannedSupplyUnresolved
```

Do not broaden the `ValidationIssue.messageKey` union to unrelated validators.

Do not migrate other validation-rule metadata or messages.

---

## 3. Resolve reference names at presentation time

In `validationPresentation.ts` or the established equivalent localization boundary:

- receive the structured planned-supply item IDs/types;
- resolve each item against reference data;
- pass each through the existing locale-aware reference-name resolver;
- preserve raw stable ID fallback for unknown references.

Required behavior:

```text
stable ID: aluminium

en-US => Aluminum
en-GB => Aluminium
```

This must work independently of whether future canonical reference data itself says:

```text
Aluminium
```

or:

```text
Aluminum
```

---

# PART D — COUNT AND LIST FORMATTING

## 4. Localize the complete Planned Supply validation sentence

Do not continue constructing the sentence in the domain validator.

The final localized message should own the complete sentence.

Preserve the existing meaning:

```text
1 item in Planned Supply: X.
N items in Planned Supply: X, Y, Z.
```

Use the existing localization infrastructure for singular/plural handling.

---

## 5. Use locale-aware list formatting

This rule is also a useful proof of localized list presentation.

Use:

```ts
Intl.ListFormat
```

or a small centralized formatter built around it.

Do not retain:

```ts
itemNames.join(', ')
```

for the localized presentation path.

The exact browser-native conjunction/punctuation is acceptable.

For example, an `en-US` result may be:

```text
2 items in Planned Supply: Aluminum and Iron.
```

and three items may use locale-appropriate punctuation.

If adding a shared list-format helper under `src/localization/` is cleaner than instantiating `Intl.ListFormat` directly in validation presentation, prefer the shared helper.

Do not build a custom list formatter.

---

# PART E — PRESERVE DOMAIN SEMANTICS

## 6. Do not change Planned Supply validation behavior

This correction is presentation/localization only.

Preserve:

```text
which outposts generate the issue
issue severity
rule ID
issue count
sorting semantics unless locale-aware display sorting is required for the final presented list
Planned Supply domain semantics
```

Do not alter availability logic or Planned Supply behavior.

---

## 7. Do not modify persisted state

Do not change:

```text
NetworkCollection
OutpostNetwork
plannedSupply persistence
reference-data IDs
import/export
Undo/Redo
application preferences
```

No schema migration.

---

# PART F — TESTING

## 8. Add focused regression tests

Add tests proving the exact bug is fixed.

At minimum cover a planned-supply issue containing stable resource ID:

```text
aluminium
```

and another item such as `iron`.

Verify:

### en-US

The presented message contains:

```text
Aluminum
```

and does **not** contain:

```text
Aluminium
```

### en-GB

The presented message contains:

```text
Aluminium
```

### Stable identity

The underlying item remains:

```text
id: aluminium
```

### Count behavior

Verify singular and plural paths if practical.

### List behavior

Verify multiple item names are passed through locale-aware list formatting rather than canonical-name concatenation.

Avoid brittle assertions against browser-specific punctuation if the runtime's `Intl.ListFormat` output could legitimately vary. Assert the relevant names and grammatical count behavior.

---

# PART G — MANUAL CHECK

## 9. Reproduce the observed Validation-panel case

Using a network/outpost with:

```text
manufacturing-input-unavailable
planned-supply-unresolved
```

visible together, confirm:

### en-US

Both rules use:

```text
Aluminum
```

where they refer to the `aluminium` resource.

### en-GB

Both rules use:

```text
Aluminium
```

No mixed locale spelling should remain within the panel for these migrated rules.

---

# PART H — OUT OF SCOPE

Do not:

```text
migrate any other validation rule
convert all validators to structured messages
change history labels
change other UI strings
change the locale selector
change reference-data files
regenerate reference data
change stable IDs
redesign the localization API
add a third-party dependency
perform general localization cleanup
commit
push
```

This is a correction to one visible inconsistency only.

---

# PART I — DOCUMENTATION

No durable documentation change should be necessary unless the original localization implementation docs contain a factual statement that becomes inaccurate.

Do not expand backlog/docs merely because this second proof validator is now localized.

---

# PART J — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Report exact results.

Also report the focused manual `en-US` / `en-GB` Validation-panel check.

Do not commit or push.

---

## Completion criterion

This correction is complete when the same stable `aluminium` reference can appear in both migrated validation rules without contradictory spelling:

```text
en-US
    Aluminum everywhere in those migrated paths

en-GB
    Aluminium everywhere in those migrated paths
```

while all other validators remain intentionally outside the first localization slice.
