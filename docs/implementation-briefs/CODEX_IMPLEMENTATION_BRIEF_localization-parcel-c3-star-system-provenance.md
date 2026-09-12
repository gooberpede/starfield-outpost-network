# CODEX IMPLEMENTATION BRIEF — Localization Parcel C3: Star-System Provenance

## Purpose

Implement **Parcel C3**, adding canonical localized-name provenance for the tracker’s **star-system population**.

C3 should extend the existing C1/C2 localization provenance tooling so canonical systems resolve through the already-audited Starfield record relationship:

```text
canonical system
    ->
representative PNDT / canonical system number
    ->
STDT whose DNAM matches that system number
    ->
STDT TESFullName_Component.FULL
    ->
raw localized string ID
    ->
official English verification
```

C3 should cover all canonical star systems represented by the project, regardless of whether the owning records come from the base game or official DLC.

Expected actual contributors:

```text
Starfield.esm
ShatteredSpace.esm
```

Supported official plugin inputs should also include:

```text
SFBGS00D.esm
SFBGS050.esm
```

even if those plugins contribute zero canonical systems.

Do not commit or push.

---

# Source of truth

Use:

- `docs/audits/codex-localized-string-provenance-audit.md`
- the committed C1 narrow ESM reader
- the committed C2 provenance generator/crosswalk
- the committed DLC localization-input intake layer
- current canonical reference-source CSVs

Do not redesign the existing architecture unless a concrete blocker is found.

---

# Scope classification

**Low-to-medium cross-cutting data-pipeline task.**

Expected work:

- enumerate canonical star-system targets;
- derive/join system-number identity;
- exact STDT lookup by `DNAM`;
- extract STDT `TESFullName_Component.FULL`;
- verify official English through existing localization inputs;
- append `EntityKind = system` rows to the normalized provenance crosswalk;
- add unresolved handling/tests/docs.

No runtime UI changes.

No Japanese overlay generation.

No body provenance yet.

---

# Core C3 relationship

The audit established the system relationship as:

```text
PNDT.GNAM system number
    ->
STDT.DNAM system number
    ->
STDT TESFullName_Component.FULL
```

The known proof target was:

```text
Alpha Centauri

Starfield.esm
STDT:0005E60A
EditorID: AlphaCentauriStar

DNAM = 71456

TESFullName_Component.FULL
-> strings:0000A9D0
-> Alpha Centauri
```

Important:

- the numeric system number is the join key;
- English text is not a join key;
- `STDT.ANAM` inline ASCII is not the localization provenance target;
- do not reverse-match `Alpha Centauri` in string tables;
- another matching English string ID exists, so English matching is explicitly unsafe.

---

# Target population

C3 should start from the project’s **canonical system population**.

Do not crawl all STDT records and “discover” systems.

The intended direction is:

```text
canonical tracker/reference system
    ->
known representative PNDT / canonical system-number source
    ->
exact system number
    ->
exact matching STDT
```

Every canonical system must end either:

- resolved in `localized-name-provenance.csv`, or
- present in `localized-name-provenance-unresolved.csv` with a precise reason.

---

# Official plugin set

Use the supported official plugin/load-order set already established by the localization-input tooling:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Expected population behavior:

- `Starfield.esm`: contributes canonical systems;
- `ShatteredSpace.esm`: contributes canonical systems where the canonical source includes them;
- `SFBGS00D.esm`: likely 0 C3 system targets;
- `SFBGS050.esm`: likely 0 C3 system targets.

Report zero-target plugins explicitly.

Do not fabricate targets merely because localization tables exist.

---

# Canonical system identity

Use the project’s existing stable system ID.

Do not create new runtime IDs.

Expected provenance row:

```text
EntityKind = system
EntityId   = existing stable tracker/reference system ID
```

If the project currently lacks an explicit stable system ID in one source, derive it using the existing canonical reference-data model rather than localized/display text.

Do not use English system names as identity.

---

# Canonical source derivation

Determine which existing canonical reference source currently owns system identity and the PNDT/system relationship.

Prefer existing structured data already used by the tracker.

Likely useful source(s) may include the canonical planet/body directory or equivalent current reference-source CSV.

Do not introduce a second independently maintained system catalogue if the required identity already exists.

If canonical system identity must be deduplicated from body rows:

```text
body rows
-> stable system identity/system number
-> unique canonical system target set
```

Build the unique set deterministically.

---

# Representative PNDT / system-number strategy

C3 needs a deterministic route from a canonical system to its system number.

Preferred rule:

1. use an existing canonical body/planet row already associated with the system;
2. use that row’s exact source plugin + PNDT FormID;
3. read the system number from `PNDT.GNAM`;
4. verify all canonical bodies assigned to the same system agree on the same system number.

Do not simply choose an arbitrary PNDT without checking consistency.

If several bodies belong to one system, C3 should either:

- validate that all available `PNDT.GNAM` values agree; then use one deterministic representative; or
- fail/unresolve if contradictory.

Suggested deterministic representative:

```text
lowest stable canonical body ID
```

or another existing stable sort.

The representative rule is internal provenance machinery; system identity remains the system entity.

---

# PNDT.GNAM extraction

Add a narrow, project-owned semantic/raw-field extractor for:

```text
PNDT.GNAM
```

This is not a localized string field.

Treat it as the audited numeric system-number relationship field.

Requirements:

- exact PNDT record lookup through C1;
- exact GNAM field selection;
- decode only the required numeric value;
- fail closed on missing/ambiguous/unexpected payload shape;
- expose normalized integer system number.

Do not broaden C1 into generic arbitrary subrecord decoding.

---

# STDT lookup by system number

Add a narrow STDT lookup capability keyed by:

```text
STDT.DNAM == system number
```

This is the one place C3 may need to inspect the relevant STDT population inside an explicitly supplied plugin.

Keep the scope narrow:

- inspect only `STDT` records;
- read only the exact `DNAM` field required for matching;
- match the numeric system number;
- require exactly one matching STDT in the declared official plugin set.

Do not build a generic record browser/search engine.

If zero matches:

```text
SYSTEM_STDT_NOT_FOUND
```

If more than one match across the declared official plugin set:

```text
SYSTEM_STDT_AMBIGUOUS
```

Report all matching plugin/FormID identities in diagnostics.

---

# Plugin ownership and search order

The C3 system-number-to-STDT join may cross plugin boundaries only where official content actually requires it.

Use the declared official plugin set/load order already supported by the project.

Do not claim generalized arbitrary mod override support.

For C3:

- search the declared official plugins;
- identify the exact STDT whose `DNAM` matches the canonical system number;
- preserve the actual plugin/FormID that owns the STDT provenance row.

If a winning override/provider ambiguity appears, classify it for C7 rather than guessing.

Suggested unresolved code:

```text
OVERRIDE_PROVIDER_UNRESOLVED
```

---

# Localized-name extraction

Once the exact STDT is known, use the existing C1 semantic field map route:

```text
STDT
baseFormComponents.TESFullName_Component.fullName.FULL
```

Expected table:

```text
strings
```

Do not use:

- `ANAM`;
- editor ID;
- reverse English lookup;
- first `FULL` in the record;
- any other text-like field.

The field map remains the authority for the localized-name field and string-table type.

---

# Provenance output

Append direct system rows to:

```text
reference-source/localized-name-provenance.csv
```

Use the existing C2 schema:

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

Expected C3 row shape:

```text
EntityKind            = system
DisplayNameSourceKind = direct
ComponentOrder        = 0
ComponentRole         = complete
RecordSignature       = STDT
NameFieldPath         = baseFormComponents.TESFullName_Component.fullName.FULL
```

`RecordSourcePlugin` should be the plugin owning the selected STDT record.

For C3’s current official-data scope, `NameSourcePlugin` will normally match `RecordSourcePlugin` unless a real provider inheritance case is observed.

---

# English verification

Reuse the existing C2 verification path.

For every resolved system:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
    ->
official English
    ->
exact compare with CanonicalEnglish
```

No reverse search.

No fuzzy normalization.

No silent correction.

Mismatch classes should reuse existing C2 categories where possible.

If a new system-specific reason is needed, add only a narrow code.

---

# Localization input reuse

Use the committed/local manifest-driven localization input layer.

Supported English tables already exist for:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Do not reimplement BA2 extraction in C3.

Do not generate Japanese overlays.

---

# Shattered Space

Include Shattered Space systems in the same C3 population.

Do not create a separate DLC-specific system pipeline.

Use the exact same logic:

```text
canonical system
-> representative PNDT.GNAM
-> matching STDT.DNAM
-> STDT full-name localized ID
-> English verification
```

If Shattered Space bodies/system rows are already represented in canonical reference data, they should naturally enter C3 through that source.

---

# Terran Armada / SFBGS050

Include `SFBGS050.esm` in the supported official plugin input set.

If it contributes zero canonical star systems:

- report `0 targets`;
- do not create artificial provenance rows;
- do not treat zero targets as an error.

Likewise for `SFBGS00D.esm`.

---

# Provenance uniqueness

A canonical star system should produce exactly one provenance row.

Even if many PNDT body records refer to that system:

```text
many bodies
-> one canonical system entity
-> one selected STDT name record
-> one provenance row
```

Do not repeat system provenance once per body.

---

# Consistency checks

Add system-specific consistency validation.

For each canonical system:

1. every canonical body assigned to the system must agree on the system number where PNDT evidence is available;
2. exactly one STDT in the declared official plugin set must match that number;
3. the STDT localized English must equal the canonical English system name.

Any violation should fail generation or produce an explicit unresolved row.

Suggested reason codes:

```text
SYSTEM_NUMBER_MISSING
SYSTEM_NUMBER_CONFLICT
SYSTEM_STDT_NOT_FOUND
SYSTEM_STDT_AMBIGUOUS
SYSTEM_NAME_MISMATCH
UNSUPPORTED_RECORD_SHAPE
OVERRIDE_PROVIDER_UNRESOLVED
```

Reuse existing generic codes where appropriate instead of proliferating unnecessarily.

---

# Unresolved output

Continue using:

```text
reference-source/localized-name-provenance-unresolved.csv
```

For unresolved systems, preserve at minimum:

```text
EntityKind
EntityId
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
ReasonCode
Detail
```

If the unresolved point occurs before an STDT is selected, use the most meaningful known canonical source identity and describe the failure in `Detail`.

Do not silently drop systems.

---

# Committed-data validation

Extend the strengthened C2 committed crosswalk validator so `EntityKind = system` rows are checked against canonical C3 targets.

Without installed Bethesda files, repository validation should still verify canonical facts that are project-owned:

```text
EntityKind
EntityId
CanonicalEnglish
expected direct-name shape
expected STDT signature
expected semantic field path
expected string-table type
```

Where deterministic source plugin/FormID can be derived from committed generated data only through the local Bethesda build, do not overclaim CI knowledge.

Prefer validating all canonical fields that are available from checked-in sources.

---

# Tests

Add focused tests.

## PNDT system-number extraction

Cover:

- valid `GNAM`;
- missing `GNAM`;
- malformed payload;
- ambiguous duplicate `GNAM` if that shape is possible.

## STDT matching

Cover:

- exactly one `DNAM` match;
- zero matches;
- duplicate matches across supplied plugins;
- unrelated STDT ignored.

## System deduplication

Cover:

- multiple bodies in one system produce one system provenance target;
- repeated body rows do not duplicate system rows.

## System-number consistency

Cover:

- several bodies agree -> pass;
- conflicting system numbers -> fail/unresolved.

## Localized field

Cover:

- STDT `TESFullName_Component.FULL` selected;
- inline `ANAM` or unrelated `FULL` not selected.

## Alpha Centauri regression

Use project-authored/synthetic structure to lock the known audited relationship:

```text
system number 71456
-> STDT
-> strings:0000A9D0
```

Do not embed Bethesda binary content.

The real installed-game integration run should separately verify the actual record.

## Plugin coverage

Cover:

- base-game system;
- Shattered Space system;
- zero-target supported plugin is not an error.

---

# Real installed-game verification

Run C3 against the actual official plugin set.

Report:

```text
canonical systems: total
resolved: N
unresolved: N
```

Also break down by owning STDT plugin:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

Report:

- number of canonical systems;
- number of body rows collapsed into those systems;
- any systems with multiple body records used for consistency checking;
- any duplicate/ambiguous STDT system-number matches;
- all English mismatches.

Expected ideal result:

```text
all canonical systems resolved
0 unresolved
```

If not, retain precise unresolved rows rather than guessing.

---

# Alpha Centauri required proof

The local C3 verification must include:

```text
Alpha Centauri
system number: 71456
STDT:0005E60A
strings:0000A9D0
English: Alpha Centauri
```

If the actual current installed data differs, stop and report the drift.

Do not auto-update proof expectations without explanation.

---

# Determinism

Generated rows must remain deterministic.

Sort final provenance rows using the existing normalized crosswalk sort:

```text
EntityKind
EntityId
ComponentOrder
```

Do not introduce timestamps into CSV artifacts.

---

# Build commands

Extend the existing provenance commands rather than creating a parallel system pipeline.

Preferred outcome:

```text
npm run localization:provenance:build
npm run localization:provenance:verify
```

now include C2 + C3 populations.

If a specific diagnostic command is useful, keep it clearly subordinate to the main provenance workflow.

Do not make ordinary `npm run build` require local Starfield binaries.

---

# Documentation

Update durable documentation.

At minimum:

## `docs/ARCHITECTURE.md`

Add the C3 system route:

```text
canonical system
-> representative PNDT.GNAM
-> STDT.DNAM
-> STDT full-name localized ID
-> official locale tables
```

Clarify:

- system number is the join key;
- English is verification only;
- one system provenance row regardless of number of bodies;
- base game and official DLC use one population model.

## localization/reference regeneration docs

Document:

- required plugin inputs;
- system-number consistency checks;
- supported official plugin set;
- zero-target plugins are valid;
- unresolved behavior.

Do not create redundant docs if existing localization provenance documentation is the natural home.

---

# No runtime changes

Do not modify:

- React UI;
- locale selector;
- search behavior;
- `src/localization/reference-names/...`;
- Japanese overlays;
- persistence;
- Undo/Redo;
- import/export;
- network/player schema.

C3 remains reference/build tooling only.

---

# No C4 work

Do not implement body provenance in C3.

Bodies are Parcel C4.

Although C3 may inspect PNDT records to obtain `GNAM`, it must not generate body-name provenance rows.

---

# No generic exploration framework

Do not add:

- arbitrary record querying;
- interactive ESM browsing;
- generic STDT explorers;
- all-record dumps;
- generalized Bethesda reverse-engineering utilities.

The implementation should remain narrowly optimized for:

```text
canonical system -> exact system provenance
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

Also run local installed-game C3 regeneration using the official plugin + localization manifest inputs.

Report exact counts.

---

# Expected diff profile

Expected files may include:

```text
scripts/localization/...
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-unresolved.csv
tests
docs/ARCHITECTURE.md
localization/reference regeneration docs
package.json only if command wiring changes
```

No production runtime source changes should be needed.

---

# Acceptance criteria

C3 is complete when:

1. canonical system targets are built from existing project reference data;
2. systems are not discovered by English-text search;
3. each canonical system derives a numeric system number from PNDT evidence;
4. bodies assigned to one system are consistency-checked;
5. exactly one STDT `DNAM` match is required per resolved system;
6. the selected localized field is STDT `TESFullName_Component.FULL`;
7. system names are verified through official English tables;
8. base-game and Shattered Space systems are handled by the same pipeline;
9. `SFBGS00D.esm` and `SFBGS050.esm` are supported inputs even if they contribute zero system targets;
10. one canonical system produces one provenance row;
11. provenance rows use `EntityKind = system`;
12. Alpha Centauri resolves through system number `71456` to `STDT:0005E60A` and `strings:0000A9D0`;
13. every canonical system is resolved or explicitly unresolved;
14. committed-data validation is extended appropriately;
15. ordinary CI/build does not require installed game files;
16. no body provenance, Japanese overlay, UI, persistence, or schema changes are introduced;
17. no generic Bethesda browser/gatherer is created;
18. all tests/build/lint/reference checks pass;
19. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- canonical system target count;
- body rows collapsed into unique systems;
- resolved/unresolved totals;
- breakdown by STDT-owning plugin;
- zero-target official plugins;
- PNDT system-number extraction design;
- STDT matching design;
- Alpha Centauri proof result;
- any system-number conflicts or ambiguous STDT matches;
- English verification results;
- any field-map/parser additions;
- tests/build/lint results;
- deferred C4–C8/D work;
- confirmation that no runtime/Japanese overlay/UI/persistence/schema changes occurred.

Do not proceed to C4 unless separately instructed.
