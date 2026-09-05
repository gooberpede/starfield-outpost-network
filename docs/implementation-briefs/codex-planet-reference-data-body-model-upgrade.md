# Codex Implementation Brief — Planet Reference Data and Body Model Upgrade

## Objective

Upgrade the Starfield planetary reference-data pipeline and runtime body model so the tracker can consume the new canonical xEdit planet-directory export directly.

This batch is **reference-data/model work only**.

Do **not** implement the Outpost Details Body-selector filtering in this batch. That will be handled separately after the new reference model is established.

The new canonical source file already exists at:

```text
reference-source/planet-directory.tsv
```

The old file:

```text
reference-source/planet-directory.csv
```

still exists for now and should be removed only once the new TSV pipeline is working and verified.

---

# Read first

Read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`
- `docs/UX-DESIGN.md` only if needed for documentation cross-references

Inspect:

- `scripts/build-reference-data.mjs`
- `src/domain/referenceData.ts`
- the runtime reference-data loader
- generated files under `public/reference-data/`
- any tests/checks that cover reference-data loading or unknown IDs

This task changes the reference-data contract, so follow existing conventions for:
- fail-loud source validation;
- generated JSON;
- stable IDs;
- comments documenting purpose/architecture/change-this-file guidance.

---

# Background

The canonical xEdit planet-directory exporter has been upgraded.

It now exports:

```text
SourceFile
PlanetFormID
PlanetEditorID
PlanetName
BodyType
StarSystemID
SystemName
ParentPlanetID
PlanetID
PlanetNotLandable
OceanWorld
ExtractTimestamp
```

The exporter now writes directly as:

```text
planet-directory.tsv
```

so the generated file can be copied straight into:

```text
reference-source/
```

without renaming or spreadsheet/manual conversion.

The full current export includes records from both:

```text
Starfield.esm
ShatteredSpace.esm
```

and includes:

- planets;
- moons;
- orbitals;
- Shattered Space / House Va'ruun planetary data.

The app should now treat this TSV as the canonical planet-directory source.

---

# Settled architecture

## Canonical source

Use:

```text
reference-source/planet-directory.tsv
```

as the canonical planetary source.

Do not introduce:

- an intermediate converted CSV;
- a hand-maintained transformed copy;
- spreadsheet cleanup;
- manual row edits.

The build pipeline should consume the xEdit output directly.

---

# Source columns and semantics

## `SourceFile`

Examples:

```text
Starfield.esm
ShatteredSpace.esm
```

This is source provenance.

Keep it in the canonical TSV.

Do **not** expose it on each runtime `PlanetaryBodyReference` unless an existing architecture requirement makes that necessary.

---

## `ExtractTimestamp`

This is dataset provenance/version information.

Requirements:

- every row must contain it;
- all rows in one canonical extract must use the same timestamp;
- inconsistent timestamps should fail the build.

Do not repeat the timestamp on every runtime body object.

A dataset-level runtime metadata file is **not required in this batch** unless the existing architecture already has a natural place for it.

For now, build-time provenance is sufficient.

---

## `BodyType`

Expected source values:

```text
Planet
Moon
Orbital
```

These should be represented in the runtime model as a narrow domain type:

```ts
export type PlanetaryBodyType =
  | 'planet'
  | 'moon'
  | 'orbital'
```

Convert source casing to the runtime values above during reference-data generation.

Unexpected `BodyType` values must fail the build.

---

## `PlanetNotLandable`

Canonical xEdit-derived source flag.

Allowed source values:

```text
0
1
```

Interpretation:

- `1` = body has the canonical `PlanetNotLandable` keyword;
- `0` = keyword not present.

Unexpected values must fail the build.

---

## `OceanWorld`

Canonical xEdit-derived source flag.

Allowed source values:

```text
0
1
```

Current exporter logic:

- body has exactly one biome;
- that biome has the `BiomeTypeOcean` keyword.

This identifies the Volii Alpha waterworld case.

Unexpected values must fail the build.

---

# Runtime domain model

Update `PlanetaryBodyReference`.

Target shape:

```ts
export interface PlanetaryBodyReference {
  id: PlanetaryBodyId
  systemId: StarSystemId
  name: string
  bodyType: PlanetaryBodyType
  outpostAllowed: boolean
}
```

Add the exported `PlanetaryBodyType` union type.

Do not add source-only fields such as:

```text
SourceFile
ExtractTimestamp
PlanetNotLandable
OceanWorld
```

to the runtime body model in this batch.

---

# Deriving `outpostAllowed`

Derive during reference-data generation:

```text
outpostAllowed =
    BodyType != Orbital
    AND PlanetNotLandable = 0
    AND OceanWorld = 0
```

Equivalent intent:

- orbitals cannot host outposts;
- canonically non-landable bodies cannot host outposts;
- the all-ocean Volii Alpha case cannot host outposts;
- otherwise the body is considered outpost-capable.

Write the resulting boolean into generated `bodies.json`.

The browser/UI should consume the derived domain fact rather than reproduce source derivation logic.

---

# Stable IDs

Preserve current identifier architecture:

```text
PlanetaryBodyReference.id = PlanetFormID
StarSystemReference.id = StarSystemID
```

Do not generate new logical IDs for bodies or systems.

Existing saved networks must remain compatible with the same canonical body/system IDs.

---

# Orbitals

Orbitals should remain in the generated body catalogue.

Do **not** discard them from `bodies.json`.

Reason:

- the canonical source is a location/body directory;
- future features may care about stations or large ships;
- `outpostAllowed: false` is sufficient to prevent them being treated as valid outpost hosts later.

---

# TSV ingestion

Update the planet-directory loader so it parses tab-separated input.

Prefer either:

- a dedicated TSV loader; or
- a generic delimited-file helper with explicit delimiter configuration.

Do not break existing CSV parsing for the other canonical source datasets.

The build script should no longer expect:

```text
reference-source/planet-directory.csv
```

Once the new TSV path is verified, remove the obsolete CSV file from the repository.

---

# Planet-directory validation

Update validation so each row requires at least:

```text
SourceFile
PlanetFormID
PlanetEditorID
PlanetName
BodyType
StarSystemID
SystemName
ParentPlanetID
PlanetID
PlanetNotLandable
OceanWorld
ExtractTimestamp
```

Validate:

## Required values

Fail if required values are missing.

Be careful with numeric-looking fields where `0` is a valid value.

For example:

```text
ParentPlanetID = 0
StarSystemID = 0
```

must not be rejected merely because string/number coercion treats zero as falsey.

Prefer explicit empty-string/null checks.

---

## Boolean source flags

Require:

```text
PlanetNotLandable ∈ {'0', '1'}
OceanWorld ∈ {'0', '1'}
```

Fail on any other value.

---

## Body type

Require:

```text
Planet
Moon
Orbital
```

Fail on any other value.

---

## Extract timestamp

Require:

- non-empty;
- same value across the complete file.

Do not silently normalize inconsistent timestamps.

---

# Duplicate `PlanetFormID` behavior

The current full dataset has been checked and contains **no duplicate `PlanetFormID`s**.

Nevertheless, add defensive build-time handling.

This is a **build-time diagnostic**, not a tracker runtime validation-registry rule.

## Normal

If a `PlanetFormID` appears once:

- continue normally.

## Identical semantic duplicate

If the same `PlanetFormID` appears more than once and the body/gameplay fields are semantically identical:

- allow the build to continue;
- emit an informational diagnostic.

Suggested style:

```text
INFO: PlanetFormID 00012345 appears in multiple source rows with identical body data.
```

Do not add an app-level warning.

## Conflicting duplicate

If the same `PlanetFormID` appears more than once and any semantic body/gameplay field differs:

- fail the build immediately;
- identify the FormID;
- report enough conflicting data to make source investigation practical.

---

# Duplicate comparison semantics

Treat these as semantic/body data:

```text
PlanetFormID
PlanetEditorID
PlanetName
BodyType
StarSystemID
SystemName
ParentPlanetID
PlanetID
PlanetNotLandable
OceanWorld
```

Treat these as provenance, not semantic identity:

```text
SourceFile
ExtractTimestamp
```

Therefore, two rows may count as an identical semantic duplicate even if:

```text
SourceFile
```

differs.

This is intentional in case a future official Bethesda master duplicates an unchanged planetary record.

---

# Star-system consistency

Preserve the existing invariant:

- repeated rows for the same `StarSystemID` are expected;
- the same `StarSystemID` must not map to conflicting `SystemName` values.

Conflicts must fail the build.

The full source now includes Shattered Space records, so ensure systems derived from the TSV naturally include any DLC-only systems.

Do not hard-code House Va'ruun system names or IDs.

---

# Shattered Space support

The current TSV includes both:

```text
Starfield.esm
ShatteredSpace.esm
```

The build must ingest all rows regardless of source master.

Do not assume all planetary records originate from `Starfield.esm`.

Do not filter out DLC rows.

The resulting runtime reference data should include the House Va'ruun / Shattered Space planetary catalogue represented in the source.

---

# Generated reference data

Regenerate the normal outputs.

At minimum, verify:

```text
public/reference-data/systems.json
public/reference-data/bodies.json
```

`bodies.json` should now include:

```ts
bodyType
outpostAllowed
```

for every body.

Other generated reference datasets should remain semantically unchanged except where DLC coverage naturally introduces newly known body/system IDs needed by their source joins.

Do not hand-edit generated JSON.

---

# Existing body-resource joins

Inspect how `planet-all-resources.csv` and other body-linked source files resolve body IDs.

Existing architecture uses canonical `PlanetFormID` values as body IDs.

Preserve this.

If newly added Shattered Space bodies are absent from other source datasets, do not invent resource occurrence data.

The planet directory may legitimately contain bodies that have no entry in `body-resources.json`.

---

# Existing saved networks

This batch must not:

- mutate persisted OutpostNetwork data;
- delete or rewrite outposts;
- filter existing selected bodies;
- introduce migration logic based on `outpostAllowed`.

Existing body IDs remain canonical FormIDs.

The later Outpost Details/UI batch will decide how body eligibility affects selection and validation.

---

# Out of scope

Do not implement in this batch:

- Body-selector filtering;
- Outpost Details UI changes;
- Delete Outpost repositioning;
- Planned Supply default collapse;
- 25-character outpost-name validation;
- Navigation ellipsization changes;
- spacing/alignment polish;
- new player-network validation rules for invalid outpost locations;
- tooltips explaining why a body is unavailable;
- reference-data provenance UI;
- drag-and-drop auto-scroll.

---

# Documentation updates

Update documentation so the repository accurately describes the new canonical source and runtime model.

At minimum inspect and update:

## `docs/ARCHITECTURE.md`

Document:

- `reference-source/planet-directory.tsv` as the canonical planetary source;
- direct xEdit → TSV → build pipeline;
- generated body model;
- `PlanetaryBodyType`;
- `outpostAllowed`;
- build-time derivation;
- Shattered Space inclusion;
- provenance fields staying in the source layer;
- duplicate handling as a build-time diagnostic/failure rule.

## `docs/DOMAIN-RULES.md`

Document the domain meaning of:

```text
bodyType
outpostAllowed
```

and the current derivation:

```text
not Orbital
AND not PlanetNotLandable
AND not OceanWorld
```

Make clear that UI code should consume `outpostAllowed`, not reproduce xEdit-specific logic.

## `docs/BACKLOG.md`

Update any stale items that say:

- settleability data is unknown;
- non-outpost bodies need a heuristic;
- body filtering still depends on research.

Keep the actual **Body selector filtering** item deferred to the Outpost Details batch.

If useful, note that source/model support is now complete and only UI consumption remains.

## `README.md`

If the README describes reference-source setup or regeneration, update it to reference:

```text
planet-directory.tsv
```

instead of the obsolete CSV and note that the canonical file is generated by xEdit.

## Other docs

Update any other documentation that explicitly names:

```text
planet-directory.csv
```

or documents the old `PlanetaryBodyReference` shape.

Avoid unrelated documentation cleanup.

---

# Code comments

Follow existing project convention.

Update file-level comments where appropriate, especially:

- `scripts/build-reference-data.mjs`
- `src/domain/referenceData.ts`

Explain:

- direct TSV ingestion;
- provenance vs runtime fields;
- outpost-eligibility derivation;
- duplicate semantic comparison.

Add short comments around non-obvious validation/duplicate logic explaining **why** it exists.

---

# Verification

Run:

```bash
npm run lint
```

Run:

```bash
npm run build
```

Run the reference-data generation command used by the repo.

If there is no named npm script, use the existing documented command for:

```text
scripts/build-reference-data.mjs
```

Run:

```bash
git diff --check
```

---

# Data verification checklist

Confirm at minimum:

## Source ingestion

- `reference-source/planet-directory.tsv` loads directly.
- no manual conversion step is required.
- old `planet-directory.csv` is no longer referenced.
- obsolete CSV is removed after successful migration.

## Base-game bodies

Check representative bodies:

### Montara Luna

Expected:

```text
bodyType = moon
outpostAllowed = true
```

### Saturn

Expected:

```text
bodyType = planet
outpostAllowed = false
```

because:

```text
PlanetNotLandable = 1
```

### Volii Alpha

Expected:

```text
bodyType = planet
outpostAllowed = false
```

because:

```text
OceanWorld = 1
```

## Orbitals

Pick at least one source row with:

```text
BodyType = Orbital
```

Expected runtime:

```text
bodyType = orbital
outpostAllowed = false
```

## Shattered Space

Confirm at least one Shattered Space / House Va'ruun body is present in generated `bodies.json`.

Confirm its parent system is present in generated `systems.json`.

Do not rely only on row counts.

---

# Duplicate verification

Because the current source contains no duplicate PlanetFormIDs, the normal build should produce no duplicate diagnostics.

If practical without leaving test fixtures behind, temporarily test:

## Semantic duplicate

Duplicate one source row while changing only:

```text
SourceFile
```

Expected:

- informational diagnostic;
- build continues.

## Conflicting duplicate

Duplicate one row and change one semantic field, e.g.:

```text
PlanetName
```

Expected:

- build fails;
- conflicting `PlanetFormID` is clearly reported.

Restore canonical source afterward.

Do not commit temporary test data.

---

# Timestamp verification

If practical, temporarily alter one row's `ExtractTimestamp`.

Expected:

- build fails due to inconsistent extract timestamp.

Restore canonical source afterward.

---

# Acceptance criteria

1. `planet-directory.tsv` is the canonical planetary source.
2. The build pipeline parses it directly as TSV.
3. No manual conversion/massaging is required.
4. The old CSV source is removed once migration succeeds.
5. Starfield and Shattered Space rows are ingested.
6. `PlanetaryBodyReference` contains:
   - `id`
   - `systemId`
   - `name`
   - `bodyType`
   - `outpostAllowed`
7. `PlanetaryBodyType` is a narrow runtime type for:
   - planet
   - moon
   - orbital
8. `outpostAllowed` is derived centrally during build.
9. Orbitals remain in the body catalogue but are not outpost-capable.
10. `PlanetNotLandable` and `OceanWorld` remain source-layer fields.
11. `SourceFile` and `ExtractTimestamp` remain provenance rather than per-body runtime fields.
12. Required columns are validated.
13. boolean flags accept only `0`/`1`.
14. unknown body types fail the build.
15. inconsistent extraction timestamps fail the build.
16. identical semantic duplicate PlanetFormIDs produce an informational build diagnostic.
17. conflicting duplicate PlanetFormIDs fail the build.
18. stable FormID/SystemID identifier architecture is preserved.
19. existing saved networks require no migration.
20. generated reference JSON is regenerated rather than hand-edited.
21. documentation is updated.
22. `npm run lint` passes.
23. `npm run build` passes.
24. reference-data generation passes.
25. `git diff --check` passes.
26. No commit or push is performed.

---

# Completion report

Report:

- files changed;
- old source file removed;
- TSV parsing approach;
- source validation added;
- runtime model changes;
- exact `outpostAllowed` derivation;
- duplicate handling behavior;
- Shattered Space verification performed;
- representative body checks;
- generated files changed;
- documentation updated;
- `npm run lint` result;
- `npm run build` result;
- reference-data generation result;
- `git diff --check` result;
- any temporary verification performed and restored;
- any unexpected source-data anomalies.

Do not commit or push.
