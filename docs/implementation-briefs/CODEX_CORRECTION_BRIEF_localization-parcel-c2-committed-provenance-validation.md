# CODEX CORRECTION BRIEF — Parcel C2: Strengthen Committed Provenance Validation

## Purpose

Apply one **small pre-commit hardening correction** to Parcel C2.

The generated provenance crosswalk itself is credible and the local installed-game regeneration/verification passed. The remaining issue is narrower:

> `validateCommittedCrosswalk()` validates coverage and row shape, but should also verify that the committed rows still agree with the canonical target identities that would generate them.

This is not a redesign of C2.

Do not regenerate architecture, broaden Parcel C, or start C3.

Do not commit or push.

---

# Problem

The current committed-data validator correctly checks things such as:

- valid row shape;
- valid hex formatting;
- allowed table values;
- uniqueness;
- direct-name structure;
- expected `EntityKind:EntityId` coverage.

However, a syntactically valid committed row could theoretically retain the correct entity key while drifting away from its canonical source identity.

For example, a row for:

```text
resource:aluminium
```

could potentially contain a wrong-but-well-formed:

```text
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
```

and still pass the no-game-files committed-data validation if the stable entity key remains unchanged.

The local regeneration path would catch this when run against game files, but the ordinary repository validation should catch canonical identity drift without requiring Bethesda inputs.

---

# Required correction

Strengthen `validateCommittedCrosswalk()` (or the equivalent committed-artifact validation path) so every resolved and unresolved committed row is compared with the canonical target produced by the existing C2 target-enumeration logic.

Reuse `buildC2Targets()` or the existing canonical-target abstraction rather than duplicating source-of-truth logic.

For every committed target row, validate the canonical facts that are knowable without installed game files.

At minimum compare:

```text
EntityKind
EntityId
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
```

For resolved direct-name rows, also validate where safely derivable from checked-in project metadata:

```text
DisplayNameSourceKind = direct
ComponentOrder = 0
ComponentRole = complete
NameFieldPath
NameStringTable
```

The actual `NameStringID` cannot be independently re-proven without Bethesda plugin/string-table inputs, so do not pretend otherwise.

The goal is:

```text
canonical source identity
    -> committed provenance row identity

must still agree
```

while leaving raw-ID verification to the local regeneration/verification command.

---

# Resolved rows

For each row in:

```text
reference-source/localized-name-provenance.csv
```

find the corresponding canonical C2 target by stable identity.

Fail if any canonical identity field differs.

Examples of drift that must fail:

```text
wrong RecordSourcePlugin
wrong RecordFormID
wrong RecordSignature
wrong CanonicalEnglish
wrong direct-name semantic path
wrong declared string-table type
```

Do not silently normalize these differences.

Use a clear validation error that identifies:

```text
EntityKind
EntityId
field
expected
actual
```

---

# Unresolved rows

Apply the same canonical identity comparison to:

```text
reference-source/localized-name-provenance-unresolved.csv
```

An unresolved row is still required to describe the correct canonical target.

Its unresolved status must not permit drift in:

```text
EntityKind
EntityId
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
```

Do not require `NameStringID`/`NameStringTable` where the unresolved schema intentionally lacks them.

---

# Coverage invariant

Preserve the existing invariant:

> every C2 target appears exactly once, either resolved or unresolved.

The correction should add canonical-field comparison, not replace the existing coverage/uniqueness checks.

---

# Tests

Add focused regression coverage.

At minimum add tests proving that committed validation rejects a row that is otherwise syntactically valid but has:

1. the wrong `RecordFormID`;
2. the wrong `RecordSourcePlugin`;
3. the wrong `CanonicalEnglish`.

One well-structured parameterized test is acceptable.

Also include at least one unresolved-row drift case if the current test structure makes this inexpensive.

The test should demonstrate the exact weakness being corrected:

```text
correct EntityKind + EntityId
valid field syntax
but wrong canonical source identity
=> validation fails
```

Do not add broad snapshots.

---

# Do not change generated provenance unless necessary

The current C2 generated rows are believed correct.

If the strengthened validator passes them unchanged, do not regenerate merely to create churn.

If it finds a real discrepancy, stop and report it clearly before altering canonical output unless the discrepancy is obviously a generator defect within C2 scope.

---

# Statistics wording

While touching C2 reporting/docs, correct any wording that ambiguously describes repeated biome labels across resolved vs total biome targets.

The C2 summary should distinguish:

```text
resolved biome rows
total biome targets
repeated-name groups
```

Do not turn this into a documentation rewrite.

---

# Scope boundaries

Do not:

- add Shattered Space or Terran Armada localization inputs in this correction;
- resolve the existing four `MISSING_LOCALIZATION_INPUT` rows;
- implement BA2 extraction;
- start C3 systems work;
- generate Japanese overlays;
- modify runtime localization/UI/persistence/schema;
- change C1 parser architecture.

Those are separate next steps.

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

If the local installed-game C2 build command is inexpensive and inputs remain available, rerun it as an additional confidence check, but the correction itself must be testable without game files.

---

# Expected diff

Expected change size is small.

Likely files:

```text
scripts/localization/...validator/build module
tests/...provenance tests
possibly a tiny documentation/statistics wording adjustment
```

No production runtime files.

No new dependencies.

No generated Japanese data.

---

# Acceptance criteria

The correction is complete when:

1. committed resolved rows are checked against canonical C2 target identity;
2. committed unresolved rows are checked against canonical C2 target identity;
3. wrong plugin/FormID/signature/English identity cannot pass merely because `EntityKind:EntityId` is correct;
4. resolved direct-name semantic path/table invariants are checked where project metadata already knows them;
5. existing coverage/uniqueness checks remain;
6. regression tests prove syntactically valid canonical drift fails;
7. current committed C2 output passes unchanged unless a genuine discrepancy is found;
8. all required verification commands pass;
9. no C3/D/runtime work is introduced;
10. no commit or push is performed.

---

# Final report

Report:

- files changed;
- exact new canonical-field checks;
- regression tests added;
- whether current C2 generated artifacts passed unchanged;
- whether any real discrepancy was found;
- final verification results;
- confirmation that the four localization-input unresolved rows remain intentionally unresolved;
- confirmation that no C3, BA2, Japanese overlay, UI, persistence, or schema work was introduced.
