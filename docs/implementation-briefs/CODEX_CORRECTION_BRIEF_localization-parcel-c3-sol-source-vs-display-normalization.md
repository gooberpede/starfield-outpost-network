# CODEX CORRECTION BRIEF — Parcel C3: Formalize Source-vs-Localized Display Differences and Resolve Sol

## Purpose

Apply one **small C3 closure correction**.

Parcel C3 currently resolves 122 of 123 canonical star systems. The sole unresolved system is:

```text
StarSystemID = 0
canonical structural source value: SOL
official localized display value:  Sol
```

This is not an extraction failure.

The structural xEdit-derived source should remain unchanged. The localization provenance layer should be able to represent that the authoritative localized display string differs from the structural source value in an explicitly audited way.

The goal is to resolve Sol **without**:

- editing the canonical xEdit extract;
- adding a Sol-specific runtime hack;
- weakening all English verification to case-insensitive comparison;
- silently accepting arbitrary mismatches.

After this correction, C3 should close at:

```text
123 resolved
0 unresolved
```

Do not commit or push.

---

# Design principle

Formalize the distinction between:

```text
structural/canonical source value
```

and:

```text
official localized display value
```

For Bethesda-owned localized names, the structural source remains authoritative for identity/relationship provenance, but once the exact localization provenance tuple has been established, the official localized string is authoritative for the user-facing display value.

This means:

```text
source value       may differ from localized display value
provenance valid   must still be proven exactly
difference         must be explicit and audited
runtime display    will later use localized value
```

The source extract must not be rewritten to make the strings match.

---

# Current case

The C3 installed-game run found:

```text
EntityKind: system
EntityId: 0
canonical source English: SOL
official localized English: Sol
```

The exact STDT provenance is valid.

This should become a resolved provenance row with an explicit normalization classification rather than remain `SYSTEM_NAME_MISMATCH`.

---

# Scope classification

**Small local correction.**

Expected work:

- add a narrow source/display normalization classification;
- apply it to the Sol case;
- extend validation/tests;
- regenerate C3 provenance;
- update docs minimally.

Do not redesign C2/C3.

Do not start C4.

---

# Required model change

Introduce an explicit project-owned way to represent an accepted structural-source vs localized-display difference.

Prefer extending existing provenance metadata/policy rather than adding ad hoc branching in the generator.

Conceptually, support a classification such as:

```text
TRACKER_NORMALIZATION
```

or a more precise existing equivalent if one is already part of the mismatch taxonomy.

The classification should mean:

> the canonical structural source value is intentionally preserved, but the official localized display value is accepted as authoritative for the localized-name provenance row.

Do not create a special `SOL` code path.

---

# Recommended implementation approach

Use an explicit checked-in normalization policy keyed by stable entity identity.

For example:

```text
EntityKind
EntityId
ExpectedSourceEnglish
ExpectedLocalizedEnglish
ReasonCode
Detail
```

or an equivalent project-owned structure.

For the current case:

```text
system
0
SOL
Sol
TRACKER_NORMALIZATION
xEdit structural source preserves SOL; official localized STDT FULL is Sol
```

The exact storage format is up to repository conventions.

Keep the policy minimal and auditable.

Do not create a broad list of speculative future normalizations.

---

# Verification behavior

The English verification path should remain strict by default.

Pseudo-rule:

```text
if officialEnglish === CanonicalEnglish:
    PASS
else if an explicit approved normalization exists for this exact entity
     and expected source/display values both match:
    PASS_WITH_NORMALIZATION
else:
    mismatch / unresolved
```

Do not:

- lowercase both sides;
- trim arbitrary punctuation;
- case-fold all names;
- fuzzy-match;
- silently accept “close enough.”

This correction should not weaken the verifier globally.

---

# CanonicalEnglish semantics

Clarify the current C3/C2 semantics.

The structural source may continue to expose:

```text
CanonicalEnglish = SOL
```

if that field intentionally represents the canonical extract value.

The resolved provenance row should preserve enough information to show that the official localized English is:

```text
Sol
```

If the current schema has only one English text column, prefer adding or reusing explicit normalization metadata rather than overwriting the canonical extract value without trace.

Do not edit `planet-directory.csv`.

---

# Provenance row outcome

After normalization approval, Sol should move from:

```text
localized-name-provenance-unresolved.csv
```

to:

```text
localized-name-provenance.csv
```

The exact Bethesda provenance tuple should remain unchanged.

Expected result:

```text
EntityKind = system
EntityId = 0
RecordSignature = STDT
NameFieldPath = baseFormComponents.TESFullName_Component.fullName.FULL
official English = Sol
normalization/source discrepancy explicitly recorded
```

Use the existing crosswalk schema/policy conventions where possible.

Do not add a column unless needed; a separate approved-normalizations policy may be cleaner.

---

# Committed-data validation

Extend committed-data validation so an approved normalization is itself checked strictly.

For a normalized row, validate:

```text
EntityKind
EntityId
expected canonical source value
expected localized English value
normalization reason
exact provenance shape
```

A changed source value or localized value must fail.

For example, an approval for:

```text
SOL -> Sol
```

must not also approve:

```text
SOL -> Sun
```

or:

```text
Sol -> SOL
```

unless explicitly changed in policy.

---

# Tests

Add focused regression coverage.

At minimum:

## Exact match still passes

```text
Alpha Centauri
Alpha Centauri
=> PASS
```

## Approved normalization passes

```text
system:0
SOL
Sol
=> PASS_WITH_NORMALIZATION
```

## Same entity, wrong localized result fails

```text
system:0
SOL
Sun
=> FAIL
```

## Same values, wrong entity fails

An approval for `system:0` must not apply to another system.

## Generic case-only mismatch without policy fails

```text
FOO
Foo
```

for an unapproved entity must remain a mismatch.

This test is important: it proves we did not accidentally add global case-insensitive matching.

---

# Reporting

Local provenance generation should report normalized successes separately, for example:

```text
resolved: 123
normalized source/display differences: 1
unresolved: 0
```

The normalization should be visible in final diagnostics.

Do not hide it merely because the row is now resolved.

---

# Documentation

Update durable docs minimally.

At minimum clarify:

- structural canonical extract values are not automatically rewritten;
- localized display strings may differ;
- such differences require explicit entity-scoped approval;
- official localized strings are authoritative for eventual localized display once provenance is proven;
- strict exact verification remains the default.

This principle will likely matter again in C4+.

Do not turn this into a broad localization policy rewrite.

---

# No source-data mutation

Do not modify:

```text
reference-source/planet-directory.csv
```

to change `SOL` to `Sol`.

Preserving the original xEdit-derived source is intentional.

---

# No runtime changes

Do not modify:

- React UI;
- runtime reference-name overlays;
- locale selector;
- search;
- persistence;
- Undo/Redo;
- import/export;
- player/network schema.

Parcel D will later consume localized display values.

---

# No C4 work

Do not begin body provenance.

This correction exists only to close C3 cleanly.

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

Also rerun the installed-game provenance generation/proof.

Expected final C3 status:

```text
canonical systems: 123
resolved: 123
normalized source/display differences: 1
unresolved: 0
```

Expected global C2+C3 status:

```text
resolved: 642
unresolved: 0
```

assuming no unrelated data changed.

---

# Acceptance criteria

The correction is complete when:

1. `planet-directory.csv` remains unchanged with `SOL`.
2. Sol is resolved through its exact STDT localization provenance.
3. The difference `SOL -> Sol` is represented by an explicit audited normalization policy.
4. The verifier remains exact-match by default.
5. No generic case-insensitive/fuzzy normalization is introduced.
6. The approval is scoped to the exact entity.
7. Wrong localized text still fails.
8. Unapproved case-only mismatches still fail.
9. Sol moves from unresolved to resolved.
10. C3 reaches 123/123 systems resolved.
11. Global C2+C3 provenance reaches 642 resolved / 0 unresolved.
12. Reporting exposes the one normalized source/display difference.
13. No source extract, runtime UI, Japanese overlay, persistence, schema, C4, or Parcel D work is introduced.
14. All verification commands pass.
15. No commit or push is performed.

---

# Final report

Report:

- files changed;
- normalization policy representation;
- exact Sol approval;
- whether `planet-directory.csv` remained byte-for-byte unchanged;
- final C3 resolved/unresolved counts;
- global C2+C3 counts;
- normalized-difference count;
- tests added;
- verification results;
- confirmation that strict exact matching remains the default;
- confirmation that no runtime/C4/Parcel D work was introduced.

Do not proceed to C4 unless separately instructed.
