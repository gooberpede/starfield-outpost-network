# CODEX CORRECTION / REPLACEMENT BRIEF — Localization Parcel C4: Tracker-Body Provenance Including Orbitals

## Purpose

Resume **Parcel C4** with one corrected scope rule.

The previous brief incorrectly assumed that station/orbital-style entries were outside the tracker’s canonical body population.

Codex correctly discovered that this assumption was false:

- `planet-directory.csv` contains canonical `Orbital` rows;
- the reference-data build maps `Orbital` to runtime body type `orbital`;
- therefore orbitals are already part of the tracker body catalogue.

C4 must preserve consistency with the tracker’s existing canonical body population.

The corrected rule is:

> **If an entry is already part of the tracker’s canonical body reference data, C4 must treat it as a body target regardless of whether its type is Planet, Moon, or Orbital.**

Do not commit or push.

---

# Superseded instruction

The previous C4 brief instructed Codex to stop if objects such as:

- The Eye
- The Den
- The Oracle
- ECS Constant
- Deimos Staryard
- similar orbitals/stations

were found in the tracker body reference data.

That instruction is superseded.

These objects are canonical tracker bodies because they are already present in the ingested body catalogue.

Do not filter them out.

---

# Corrected target population

C4 target population is now:

```text
every canonical row in the tracker body reference population
```

Expected body types include:

```text
Planet
Moon
Orbital
```

Based on Codex’s inspection:

```text
Planet/Moon rows: 1,702
Orbital rows:       74
Total body rows:  1,776
```

Use the actual current source counts rather than hard-coding these numbers into implementation logic.

The source data remains authoritative for population membership.

---

# Scope principle

C4 remains a sniper.

The corrected population rule does **not** authorize generic exploration of all Bethesda orbital/station/location records.

The intended direction remains:

```text
canonical tracker body row
    ->
exact source plugin + PNDT FormID
    ->
exact localized-name provenance
```

Only entries already present in the tracker body reference population are in scope.

Do not discover extra orbital/station records from the ESM merely because they exist.

---

# Body-type treatment

Treat:

```text
Planet
Moon
Orbital
```

as peer canonical body categories for provenance purposes.

Do not assume that `Orbital` means “exclude from localization.”

Do not special-case named orbitals merely because they are stations, ships, or other non-planetary objects in game fiction.

Their inclusion is determined by tracker ingestion, not by semantic interpretation.

---

# Localized-name route

Attempt the same audited normal route first for every canonical body:

```text
exact PNDT
    ->
baseFormComponents.TESFullName_Component.fullName.FULL
    ->
raw localized string ID
    ->
official English verification
```

Do not use inline `ANAM` as provenance.

If an Orbital body follows the same route, resolve it normally.

If a real canonical Orbital uses a different record shape or name-bearing field:

1. inspect only that canonical target;
2. document the exact shape;
3. add a narrow semantic-field rule if it is safe and well understood;
4. add focused tests;
5. do not generalize beyond the observed canonical shape.

If the structure cannot be safely resolved, emit an unresolved row rather than guessing.

---

# Structural-variant objective

C4 should now explicitly inventory whether canonical tracker bodies fall into multiple localized-name shapes.

Expected possibilities include:

```text
Planet/Moon PNDT full-name component
Orbital PNDT full-name component
other canonical tracker-body variant, if actually encountered
```

Do not assume a special orbital route exists before inspecting actual canonical rows.

If all 1,776 canonical bodies resolve through the same PNDT full-name route, keep the implementation simple.

---

# Canonical body identity

Use the existing tracker stable body identity.

Expected provenance row:

```text
EntityKind = body
EntityId   = existing tracker/reference body ID
```

Do not create:

```text
EntityKind = orbital
```

Orbitals remain body entities with body-type metadata external to localization provenance.

---

# Official plugin set

Continue using the full supported official plugin set:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Include every canonical body target contributed by those sources, including orbitals.

Zero-target plugins remain valid.

---

# Source-vs-localized display differences

Reuse the existing entity-scoped normalization policy introduced for Sol.

If any canonical body — Planet, Moon, or Orbital — has a structural source name that differs from the official localized display string:

```text
exact source value
exact localized display value
explicit entity-scoped normalization
```

Do not rewrite the canonical extract.

Do not introduce broad case-insensitive or fuzzy matching.

---

# Provenance output

Append all resolved body rows to:

```text
reference-source/localized-name-provenance.csv
```

using:

```text
EntityKind = body
```

for Planet, Moon, and Orbital alike.

Use the existing direct-name schema and semantic field path where applicable.

Every canonical body must appear exactly once as either:

```text
resolved
```

or:

```text
unresolved
```

No silent omission.

---

# Unresolved handling

If a canonical Orbital cannot use the standard PNDT localized-name path, classify precisely.

Reuse generic codes where possible.

Possible narrow additions:

```text
BODY_NAME_FIELD_NOT_FOUND
BODY_NAME_FIELD_AMBIGUOUS
UNSUPPORTED_RECORD_SHAPE
BODY_NAME_MISMATCH
OVERRIDE_PROVIDER_UNRESOLVED
```

Do not classify something as unsupported merely because its body type is `Orbital`.

---

# Committed-data validation

Extend committed provenance validation across the entire canonical body target set, including Orbital rows.

Validate project-owned facts available without game files:

```text
EntityKind
EntityId
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
expected direct-name shape
expected semantic field path
expected string-table type
```

Use explicit normalization policy where required.

---

# Tests

Retain all prior C4 tests and add orbital-specific coverage.

At minimum add:

## Canonical target inclusion

Prove that a canonical row with:

```text
Type = Orbital
```

is included in the C4 target set.

## No semantic filtering

Prove that target enumeration does not exclude a body merely because its type is `Orbital`.

## Standard-route orbital

If any real canonical orbital uses the normal PNDT full-name route, add a synthetic/project-authored equivalent proving it resolves identically to Planet/Moon.

## Variant orbital

If a real canonical orbital requires a different safe route, add a focused synthetic test for that exact observed shape.

## Non-canonical exclusion

Prove that an arbitrary ESM orbital/station record absent from the tracker body reference data is not added to the target set.

This preserves the sniper boundary.

---

# Required representative installed-game checks

Report installed-game proof for at least:

```text
Akila
Volii Alpha
one gas giant
one ice giant
one Shattered Space body
The Eye
The Den
The Oracle
ECS Constant
Deimos Staryard
```

If any named representative is not currently present in canonical data for an unexpected reason, report that instead of fabricating a target.

The purpose is to demonstrate that canonical Orbital bodies are actually covered.

---

# Reporting

Final C4 report should include:

```text
canonical bodies: N
resolved: N
unresolved: N
```

and body-type breakdown from canonical source data:

```text
Planet:  N
Moon:    N
Orbital: N
```

Also report by source plugin.

For Orbitals specifically report:

```text
orbital targets
orbital resolved
orbital unresolved
distinct record/name-field shapes encountered
```

---

# Expected ideal result

If all canonical body shapes are supported:

```text
canonical bodies: 1,776
resolved: 1,776
unresolved: 0
```

Do not force this outcome by weakening validation.

If any canonical body remains genuinely unsupported, preserve an explicit unresolved row and report why.

---

# No generic orbital toolkit

Do not add:

- arbitrary orbital discovery;
- station inventories;
- generic celestial-object classification;
- all-PNDT dumps;
- interactive Bethesda record browsing.

This correction expands **population membership only**, not exploration scope.

---

# No runtime changes

Do not modify:

- React UI;
- locale selector;
- runtime reference-name overlays;
- Japanese overlay;
- search;
- persistence;
- Undo/Redo;
- import/export;
- network/player schema.

C4 remains build/reference tooling only.

---

# No C5/C6 work

Do not implement flora/fauna/species provenance.

---

# Verification

Run:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run build
npm run lint
git diff --check
```

Also run installed-game provenance regeneration across the full canonical body population.

---

# Acceptance criteria

C4 is complete when:

1. all canonical tracker body rows define the target set;
2. Planet, Moon, and Orbital rows are all included;
3. Orbital is not filtered merely because of semantic type;
4. no non-canonical ESM orbital/station records are discovered into scope;
5. exact plugin/FormID drives body lookup;
6. PNDT `TESFullName_Component.FULL` is used wherever it is the actual body-name field;
7. inline `ANAM` is not used as localization provenance;
8. real structural variants are handled only with narrowly audited field rules;
9. every canonical body is resolved or explicitly unresolved;
10. all official DLC body targets are included in the same parcel;
11. source/display differences use explicit entity-scoped normalization only;
12. canonical source extracts remain unchanged;
13. committed-data validation includes Orbital body rows;
14. named orbital representatives are verified;
15. ordinary CI/build does not require installed Starfield files;
16. no runtime/Japanese overlay/UI/persistence/schema/C5/C6 work is introduced;
17. no generic Bethesda orbital/body browser is created;
18. all verification commands pass;
19. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- total canonical body count;
- Planet/Moon/Orbital target counts;
- resolved/unresolved totals;
- plugin breakdown;
- orbital resolved/unresolved counts;
- structural variants encountered;
- representative proofs for Akila, Volii Alpha, gas giant, ice giant, Shattered Space body, The Eye, The Den, The Oracle, ECS Constant, and Deimos Staryard;
- any new normalization approvals;
- tests/build/lint results;
- confirmation that canonical source data remained unchanged;
- confirmation that no generic orbital discovery/runtime/C5/C6 work was introduced.

This brief supersedes the orbital-exclusion portions of the earlier C4 implementation brief.

Do not proceed to C5 unless separately instructed.
