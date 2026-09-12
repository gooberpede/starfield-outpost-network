# CODEX IMPLEMENTATION BRIEF — Localization Parcel C4: Tracker-Body Provenance

## Purpose

Implement **Parcel C4**, adding canonical localized-name provenance for the tracker’s existing **planet/moon body population**.

C4 must remain tightly scoped to bodies that are already part of the tracker’s reference data.

This includes ordinary and unusual planets/moons such as:

- terrestrial planets;
- moons;
- gas giants;
- ice giants;
- non-landable planets/moons;
- Volii Alpha;
- Shattered Space bodies already present in tracker reference data;
- any equivalent official-DLC planet/moon body that is already part of the tracker’s canonical population.

C4 must **not** broaden into station/orbital/location-like objects that are not part of the tracker’s body population.

Examples explicitly out of scope:

- The Eye
- The Den
- Anchorpoint
- ECS Constant
- The Oracle
- Deimos Staryard
- similar orbital/station/ship/location records not represented as tracker bodies.

If the agreed narrow scope proves insufficient to resolve a real tracker body, stop and report the exception. Do not silently broaden the parser or population.

Do not commit or push.

---

# Source of truth

Use:

- `docs/audits/codex-localized-string-provenance-audit.md`
- committed C1 narrow ESM reader
- committed C2 direct-name provenance pipeline
- committed DLC localization-input intake
- committed C3 star-system provenance
- current tracker/reference-source body data

Do not redesign C1–C3 unless a concrete blocker is found.

---

# Scope classification

**Medium data-pipeline task.**

Expected work:

- enumerate canonical tracker bodies;
- resolve each body to its exact PNDT provenance;
- extract PNDT `TESFullName_Component.FULL`;
- verify official English;
- append `EntityKind = body` rows;
- classify only real tracker-body exceptions;
- add tests/docs/validation.

Do not add:

- generic PNDT exploration;
- orbital/station support;
- body-like locations outside tracker scope;
- runtime UI changes;
- Japanese overlays;
- flora/fauna work;
- arbitrary mod support.

---

# Core C4 route

The audited normal route is:

```text
canonical tracker body
    ->
exact PNDT
    ->
PNDT TESFullName_Component.FULL
    ->
raw localized string ID
    ->
official English verification
```

Known proof target from the audit:

```text
Akila

Starfield.esm
PNDT:0005E2B6
TESFullName_Component.FULL
-> strings:0000A3B2
-> Akila
```

The same PNDT may also contain inline `ANAM = Akila`.

That inline field is **not** the localization provenance target.

C4 must use the localized full-name component.

---

# Population boundary

C4 must be driven by the tracker’s existing canonical body population.

The intended direction is:

```text
tracker body row
-> exact source plugin + PNDT FormID
-> exact localized body-name field
```

Do not enumerate all PNDT records and then decide which ones are bodies.

If a PNDT exists in Bethesda data but is not represented by the tracker body reference data, it is outside C4 scope unless separately approved.

---

# Included body classes

The population should include whatever tracker bodies already exist, including:

```text
planet
moon
gas giant
ice giant
non-landable planet/moon
special environmental planet/moon
DLC planet/moon
```

Do not exclude a body simply because it is:

- not landable;
- not resource-extractable;
- unusual in atmosphere/type;
- a gas/ice giant;
- represented differently in gameplay UI.

If it is a canonical tracker body, C4 attempts provenance.

---

# Explicit exclusions

Do not add provenance targets for orbital/station-like entries such as:

```text
The Eye
The Den
Anchorpoint
ECS Constant
The Oracle
Deimos Staryard
```

or similar objects merely because they participate in planetary/system records.

Absence from the tracker body reference population is sufficient reason to exclude them from C4.

Do not create an `orbital` entity kind.

---

# Official plugin set

Support the official plugin/input set already established by prior parcels:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Expected behavior:

- `Starfield.esm`: contributes many bodies;
- `ShatteredSpace.esm`: contributes tracker bodies where present;
- `SFBGS00D.esm`: contributes any tracker bodies if present, otherwise 0;
- `SFBGS050.esm`: contributes any tracker bodies if present, otherwise 0.

Zero targets for a supported plugin is valid.

Do not fabricate targets just because a plugin is supported.

---

# Canonical body identity

Use the tracker’s existing stable body ID.

Expected provenance row:

```text
EntityKind = body
EntityId   = existing stable tracker/reference body ID
```

Do not create new runtime IDs.

Do not key identity by localized/display name.

---

# Canonical source

Use the existing body/planet directory that currently drives the tracker.

Likely source:

```text
reference-source/planet-directory.csv
```

or the current equivalent if the repository has evolved.

Use existing:

- stable body ID;
- source plugin;
- PNDT FormID;
- canonical structural English/body name;
- system relationship;
- body-type metadata where available.

Do not create a second manually-maintained body catalogue.

---

# Exact PNDT lookup

For every canonical tracker body:

```text
RecordSourcePlugin
RecordFormID
RecordSignature = PNDT
```

must identify the exact source record.

Use the existing C1 exact lookup.

Do not select bodies by name search.

---

# Localized field selection

Use the already-audited semantic route:

```text
PNDT
baseFormComponents.TESFullName_Component.fullName.FULL
```

Expected table:

```text
strings
```

Do not use:

- inline `ANAM`;
- editor ID;
- first `FULL`;
- body display text from the xEdit extract;
- reverse English lookup.

If a tracker body does not expose this exact audited path, classify it rather than guessing.

---

# Structural variants

C4 should inventory only the structural variants actually encountered in the tracker population.

Potential examples may include:

- ordinary landable planets;
- moons;
- gas giants;
- ice giants;
- non-landable bodies;
- DLC bodies.

For each encountered variant, determine whether the same PNDT full-name route works.

If all tracker bodies use the same route, keep the implementation simple.

If a real tracker body has a different supported structure:

1. document the exact record shape;
2. add a narrowly-scoped semantic field-map entry;
3. add focused tests;
4. do not generalize beyond the observed tracker case.

If the exception is not safely understood, leave it unresolved.

---

# Source-vs-localized display differences

Reuse the C3 normalization policy.

Strict exact English verification remains the default.

If a body’s canonical structural source value differs from official localized English, handle it exactly like Sol:

```text
exact source value
exact localized display value
explicit entity-scoped normalization policy
```

Do not:

- case-fold globally;
- trim punctuation globally;
- rewrite canonical source CSVs;
- silently accept differences.

Any new normalization must be explicit and audited.

---

# Provenance output

Append body rows to:

```text
reference-source/localized-name-provenance.csv
```

Use the existing schema:

```text
EntityKind
EntityId
DisplayNameSourceKind
ComponentOrder
ComponentRole
RecordSourcePlugin
RecordFormID
RecordSignature
NameFieldPath
NameSourcePlugin
NameStringTable
NameStringID
CanonicalEnglish
```

Expected normal C4 row:

```text
EntityKind            = body
DisplayNameSourceKind = direct
ComponentOrder        = 0
ComponentRole         = complete
RecordSignature       = PNDT
NameFieldPath         = baseFormComponents.TESFullName_Component.fullName.FULL
```

---

# English verification

Reuse the existing C2/C3 verifier.

For every resolved body:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
-> official English
-> exact compare to canonical English
```

or:

```text
-> explicit entity-scoped approved normalization
```

No reverse lookup.

No fuzzy matching.

No silent correction.

---

# Localization inputs

Reuse the existing manifest-driven extracted official tables.

Supported plugins already have:

```text
en
ja
strings
dlstrings
ilstrings
```

available locally through the intake layer.

C4 should consume English only for verification.

Do not generate Japanese overlays yet.

---

# DLC inclusion

C4 should cover tracker bodies from all supported official DLCs in one parcel.

Do not split Shattered Space into a later body-specific brief.

Likewise, if SFBGS00D or SFBGS050 contain canonical tracker bodies, include them now.

If they contain zero tracker-body targets, report zero.

---

# Body coverage invariant

Every canonical tracker body must end in exactly one state:

```text
resolved provenance row
```

or:

```text
explicit unresolved row
```

No silent omission.

---

# Suggested unresolved reason codes

Reuse existing generic codes where possible.

Add narrow body-specific codes only if needed, for example:

```text
BODY_PNDT_NOT_FOUND
BODY_NAME_FIELD_NOT_FOUND
BODY_NAME_FIELD_AMBIGUOUS
BODY_NAME_MISMATCH
UNSUPPORTED_RECORD_SHAPE
OVERRIDE_PROVIDER_UNRESOLVED
```

If a tracker body unexpectedly resolves to an orbital/station-like structure, do not broaden C4 automatically. Record it and report.

---

# Committed-data validation

Extend committed crosswalk validation for `EntityKind = body`.

Without Bethesda files, validate all project-owned canonical facts available from checked-in sources:

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

Where normalization policy applies, validate exact source/display pair.

---

# Tests

Add focused tests.

## Normal PNDT body

- exact PNDT lookup;
- exact full-name component route;
- direct provenance row.

## Akila regression

Synthetic/project-authored test should lock the audited semantics:

```text
PNDT
TESFullName_Component.FULL
-> strings:0000A3B2
```

The real installed-game run should verify actual Akila.

## Inline ANAM rejection

Provide a PNDT containing:

```text
ANAM = visible body name
```

plus the localized full-name component.

Prove C4 selects the localized FULL, not ANAM.

## Gas/ice giant

Use one representative real tracker body in installed-game validation.

Synthetic tests need only prove that no body-type assumption blocks provenance.

## Non-landable body

Prove landability is irrelevant to name provenance.

## DLC body

Include at least one Shattered Space tracker body in integration verification.

## Excluded orbital

Use a synthetic/current target-set test proving an object absent from tracker body data is not included merely because a PNDT-like/orbital record exists.

Do not need to model all named excluded orbitals individually.

## Normalization

If C4 discovers any real approved source/display difference:

- exact approval passes;
- wrong text fails;
- unapproved equivalent mismatch fails.

If none occur, existing C3 normalization tests are sufficient.

---

# Real installed-game verification

Run C4 across the full tracker body population.

Report:

```text
canonical tracker bodies: N
resolved: N
unresolved: N
```

Break down by source plugin:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Also report counts by available body type/class if the canonical source makes those categories available, for example:

```text
planet
moon
gas giant
ice giant
non-landable
```

Do not invent classification solely for reporting.

---

# Required representative checks

At minimum report installed-game proof for:

```text
Akila
Volii Alpha
one gas giant
one ice giant
one Shattered Space body
```

If the tracker data lacks an explicit category needed to select a representative automatically, choose a known canonical tracker body and document it.

The point is to prove the narrow PNDT full-name route across representative tracker-body shapes.

---

# Orbitals exclusion report

Report how the target population was bounded.

Explicitly confirm that examples such as:

```text
The Eye
The Den
Anchorpoint
ECS Constant
The Oracle
Deimos Staryard
```

were not added as C4 provenance targets unless they are unexpectedly already present in the tracker’s canonical body reference data.

If any such object is present in the tracker reference data, stop and report that discrepancy rather than silently treating it as a body.

---

# Determinism

Generated rows must remain deterministic.

Use the existing provenance sort:

```text
EntityKind
EntityId
ComponentOrder
```

No timestamps in CSV artifacts.

---

# Build commands

Extend the existing provenance workflow:

```text
npm run localization:provenance:build
npm run localization:provenance:verify
```

C4 should become another population in the same generator.

Do not create a parallel body-only build pipeline unless needed for diagnostics.

Ordinary app build must not require installed game files.

---

# Documentation

Update durable docs.

At minimum:

## `docs/ARCHITECTURE.md`

Add:

```text
canonical tracker body
-> exact PNDT
-> TESFullName_Component.FULL
-> localized ID
-> official English verification
```

Clarify:

- tracker reference population defines scope;
- planets/moons are in scope;
- orbitals/stations are not;
- unusual body types do not imply a different localization model unless proven otherwise;
- source/display differences use explicit normalization policy.

## localization/reference regeneration docs

Document:

- supported official plugin set;
- body target source;
- exclusions;
- unresolved behavior;
- representative verification.

---

# No runtime changes

Do not modify:

- React UI;
- runtime locale catalogs;
- reference-name overlays;
- Japanese overlay;
- search;
- persistence;
- Undo/Redo;
- import/export;
- player/network schema.

C4 remains build/reference tooling only.

---

# No C5/C6 work

Do not implement:

- flora;
- fauna;
- species naming;
- composed fauna;
- NPC naming rules.

Those are later parcels.

---

# No generalized Bethesda body toolkit

Do not add:

- arbitrary PNDT browsing;
- orbital discovery;
- station classification;
- generic celestial-object inventory;
- interactive reverse-engineering utilities.

The tool remains:

```text
canonical tracker body
-> exact body-name provenance
```

---

# Verification commands

Run at minimum:

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

Also run installed-game provenance regeneration using the official plugin + localization inputs.

Report exact counts.

---

# Expected diff profile

Expected files may include:

```text
scripts/localization/...
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-unresolved.csv
reference-source/localized-name-normalizations.csv only if a real new normalization is needed
tests
docs/ARCHITECTURE.md
docs/localization/...
```

No runtime production UI changes should be necessary.

---

# Acceptance criteria

C4 is complete when:

1. the tracker’s existing body reference population defines the target set;
2. no all-PNDT/all-orbital discovery is used;
3. every canonical tracker body is resolved or explicitly unresolved;
4. exact PNDT source plugin/FormID drives lookup;
5. PNDT `TESFullName_Component.FULL` is used for normal body provenance;
6. inline `ANAM` is not used as localization provenance;
7. Akila passes the audited route;
8. Volii Alpha is covered;
9. gas giants and ice giants already in tracker data are covered;
10. non-landable planets/moons already in tracker data are covered;
11. Shattered Space tracker bodies are included in the same parcel;
12. SFBGS00D/SFBGS050 tracker bodies are included if present, otherwise reported as zero targets;
13. orbitals/stations outside tracker body data are not added;
14. The Eye, The Den, Anchorpoint, ECS Constant, The Oracle, and Deimos Staryard are confirmed excluded unless unexpectedly present in tracker reference data;
15. source/display differences use explicit entity-scoped normalization only;
16. no canonical source CSV is rewritten merely to match localized display text;
17. committed-data validation covers body rows;
18. ordinary CI/build does not require installed Starfield files;
19. no runtime/Japanese overlay/UI/persistence/schema/C5/C6 work is introduced;
20. no generic Bethesda body browser/toolkit is created;
21. all verification commands pass;
22. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- canonical tracker-body count;
- resolved/unresolved totals;
- breakdown by source plugin;
- any available body-type breakdown;
- representative proofs for Akila, Volii Alpha, gas giant, ice giant, Shattered Space body;
- any structural variants encountered;
- any new explicit normalization approvals;
- excluded orbital/station confirmation;
- tests/build/lint results;
- deferred C5–C8/D work;
- confirmation that no runtime/Japanese overlay/UI/persistence/schema changes occurred.

Do not expand C4 scope without reporting the need first.

Do not proceed to C5 unless separately instructed.
