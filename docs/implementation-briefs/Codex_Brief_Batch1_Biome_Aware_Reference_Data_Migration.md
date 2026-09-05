# Codex Implementation Brief — Batch 1: Biome-Aware Reference Data Model and Migration

## Objective

Replace the tracker’s legacy planet/resource reference-data pipeline with the three new canonical game-derived datasets, introduce a biome-aware runtime/reference-data model, retire the legacy source files, and preserve current application behaviour through a derived body-level resource compatibility index.

This is **Batch 1 only**.

Do **not** add biome-selection UX, Planetary Habitation validation, power calculations, new matrix presentation, or persisted outpost biome state in this batch. Those belong to later batches.

The purpose of this batch is to establish a durable reference-data foundation that is useful both to the current tracker and to future planner/version-2 work without forcing current UI consumers to understand all of the new richness immediately.

Codex must **not commit or push**.

---

# 1. Read first

Before changing code, read and follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md` only as needed to confirm that this batch should not redesign UI
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`
- `src/domain/referenceData.ts`
- `src/data/referenceDataLoader.ts`
- `scripts/build-reference-data.mjs`

Preserve the repository’s existing architecture and comment conventions.

New or substantially changed code files should retain or add appropriate **Purpose / Architecture / Change this file when** comments. Add short intent comments to non-obvious transformations and validation blocks.

---

# 2. New canonical source files

The canonical game-derived source files for this batch are:

```text
reference-source/planet-directory.csv
reference-source/biome-inorganic-resources.csv
reference-source/biome-organic-resources.csv
```

They replace the legacy game-derived files:

```text
reference-source/planet-directory.tsv
reference-source/planet-all-resources.csv
reference-source/organic-resources.csv
```

The three legacy files above must be retired from the build pipeline and removed from the repository once the new pipeline is working.

There must be **no replacement “resources × planet” source CSV**.

Planet-level resource inventory must be derived from:

1. inorganic biome occurrences;
2. inorganic atmospheric occurrences; and
3. organic species/resource occurrences across body biomes.

Other curated source files remain authoritative for now, including resource dictionaries, abbreviations, manufactured-product data, recipes, etc. Do not opportunistically replace or redesign those sources in this batch.

---

# 3. Source schemas

## 3.1 `planet-directory.csv`

Current columns:

```text
SourceFile
ExtractTimestamp
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
SolarArrayPower
WindTurbinePower
PlanetaryHabitationRank
```

Current grain:

> one row per PNDT / `PlanetFormID`

The current extract contains 1,776 rows and no duplicate PlanetFormIDs.

### Runtime-useful fields

Promote these semantics into runtime data:

- `PlanetFormID`
- `PlanetName`
- `BodyType`
- `StarSystemID`
- `SystemName`
- `PlanetNotLandable`
- `OceanWorld`
- `SolarArrayPower`
- `WindTurbinePower`
- `PlanetaryHabitationRank`

Continue deriving `outpostAllowed` from:

```text
BodyType != Orbital
AND PlanetNotLandable = 0
AND OceanWorld = 0
```

Runtime consumers must continue using the derived `outpostAllowed` fact rather than reconstructing the source-specific rule.

`SolarArrayPower`, `WindTurbinePower`, and `PlanetaryHabitationRank` are canonical source values. Do not convert them into percentages, buckets, booleans, or calculated gameplay effects in this batch.

Blank source values should become `null` in runtime JSON.

---

## 3.2 `biome-inorganic-resources.csv`

Current columns:

```text
ReproducerVersion
ExportTimestamp
SystemName
PlanetName
BodyType
PlanetFormID
PlanetEditorID
StarSystemID
ParentPlanetID
PlanetID
PlanetSourceFile
LocationType
BiomeIndex
BiomeFormID
BiomeEditorID
BiomeName
BiomeChance
BiomeSourceFile
AtmosphereFormID
AtmosphereEditorID
AtmosphereSourceFile
ResourceCategory
ResourceFormID
ResourceEditorID
ResourceName
Rarity
ResourceSourceFile
EffectiveRSGDFormID
EffectiveRSGDEditorID
RSGDSource
RSGDSourceFile
ResourceDefinedByAtmosphereFormID
ResourceDefinedByAtmosphereEditorID
ResourceDefinedByAtmosphereSourceFile
AtmosphereInheritanceDepth
```

Current grain is effectively:

> body × location type × biome × inorganic resource occurrence

`LocationType` currently distinguishes:

```text
BIOME
ATMOSPHERE
```

### Runtime-useful fields

Use:

- `PlanetFormID`
- `LocationType`
- `BiomeIndex`
- `BiomeFormID`
- `BiomeName`
- `ResourceFormID`
- `ResourceEditorID`
- `ResourceName`
- `Rarity`

`BiomeIndex` must be retained. It is the game-file order of biomes on a body and provides the default ordering where no other ordering is applied.

### Audit-only fields

Do **not** promote these into runtime JSON:

```text
EffectiveRSGDFormID
EffectiveRSGDEditorID
RSGDSource
RSGDSourceFile
ResourceDefinedByAtmosphereFormID
ResourceDefinedByAtmosphereEditorID
ResourceDefinedByAtmosphereSourceFile
BiomeChance
AtmosphericInheritanceDepth
```

Other source/provenance columns may likewise remain only in the canonical CSV unless needed for build validation.

Do not model atmosphere as a fake biome.

---

## 3.3 Optional inorganic manifest

The inorganic extraction pipeline may also emit an optional companion manifest beside the canonical CSV, using the producer's existing naming convention, for example:

```text
reference-source/biome-inorganic-resources.manifest.json
```

This manifest is **not canonical runtime/reference data** and must not be incorporated into `ReferenceData` or emitted into runtime JSON.

The canonical inorganic CSV must remain independently ingestible when no manifest is present.

### Behaviour when the manifest is absent

If no manifest is present:

- ingest `biome-inorganic-resources.csv` normally;
- run all ordinary intrinsic validation described elsewhere in this brief;
- do not fail the build;
- an informational diagnostic such as the following is acceptable:

```text
INFO: no biome-inorganic-resources manifest found; skipping optional manifest validation.
```

Do not treat manifest absence as a data-quality warning.

### Behaviour when the manifest is present

If a manifest is present, treat it as a set of build-time assertions about the accompanying inorganic CSV.

Validate, where present in the manifest:

- dataset identity/name corresponds to `biome-inorganic-resources`;
- schema version is supported;
- declared output filename corresponds to the inorganic CSV being ingested;
- declared total row count equals the actual CSV row count;
- declared `BIOME` row count equals the actual count of `LocationType == BIOME`;
- declared `ATMOSPHERE` row count equals the actual count of `LocationType == ATMOSPHERE`.

A disagreement between the manifest and the accompanying CSV must hard-fail the build with a diagnostic that identifies both expected and actual values.

### Diagnostic/provenance-only manifest fields

Other manifest information may be logged or included in build diagnostics but must not enter the runtime model or become required tracker inputs.

Examples include:

- reproducer version;
- export timestamp;
- collapsed-occurrence count;
- upstream input filenames;
- upstream extraction timestamps;
- upstream row counts;
- upstream SHA-256 hashes.

`collapsed_occurrence_count` describes producer behaviour before canonical CSV emission and is not itself a tracker runtime invariant.

### Upstream hashes are provenance, not compatibility locks

Do **not** require upstream file hashes recorded in the manifest to match the tracker repository's current copies of those files.

In particular, do not require the manifest's recorded `planet-directory.csv` hash to equal the current tracker `planet-directory.csv`.

The tracker must validate actual semantic joins directly using FormIDs and biome identity. A newer planet-directory extract may legitimately differ byte-for-byte while remaining semantically compatible.

Therefore:

> manifest upstream hashes are provenance/audit metadata, not cross-file compatibility requirements.

---

## 3.4 `biome-organic-resources.csv`

Current columns:

```text
SourceFile
ExtractTimestamp
PlanetFormID
PlanetEditorID
PlanetName
BiomeIndex
BiomeFormID
BiomeEditorID
BiomeName
BiomeSourceFile
SpeciesType
SpeciesFormID
SpeciesEditorID
SpeciesDisplayName
SpeciesSourceFile
Domesticable
ResourceFormID
ResourceEditorID
ResourceName
ResourceSourceFile
ResourceResolutionStatus
ResourceInput1FormID
ResourceInput1EditorID
ResourceInput1Name
ResourceInput1SourceFile
ResourceInput1Qty
ResourceInput2FormID
ResourceInput2EditorID
ResourceInput2Name
ResourceInput2SourceFile
ResourceInput2Qty
```

`PlanetName` may currently be blank. Do not depend on it. `PlanetFormID` is authoritative and must resolve to `planet-directory.csv`.

Current quality characteristics:

- 3,855 rows;
- 3,851 `Resolved`;
- 4 `NoLinkedResource`;
- complete species display names;
- no legacy fake `Toxin Agent` / `Unique` display-name repair should be required;
- the four `NoLinkedResource` rows are retained special fauna such as Terrormorph and Chasmbass occurrences.

The organic extract intentionally includes farming input structures even for species that are not domesticable. This is a consequence of game-data representation. **Inputs do not imply farmability. `Domesticable` is authoritative.**

---

# 4. Runtime/reference-data model

Update `src/domain/referenceData.ts` to introduce the following concepts.

Names may be adjusted slightly for consistency with repository conventions, but preserve the semantic separation below.

---

## 4.1 Existing IDs

Retain:

```ts
export type StarSystemId = string
export type PlanetaryBodyId = string
export type ResourceId = string
export type ProductId = string
```

Add:

```ts
export type BiomeId = string
export type BodyBiomeId = string
export type SpeciesId = string
```

`BiomeId` is the canonical `BiomeFormID`.

`SpeciesId` is the canonical `SpeciesFormID`.

`BodyBiomeId` is an application-generated stable occurrence ID for a biome on one body.

Use a deterministic ID derived from body identity plus biome occurrence identity, for example:

```text
<body FormID>:<BiomeIndex>
```

Do not use biome display name as identity.

---

## 4.2 Planetary body

Extend the existing body interface:

```ts
export interface PlanetaryBodyReference {
  id: PlanetaryBodyId
  systemId: StarSystemId
  name: string
  bodyType: PlanetaryBodyType
  outpostAllowed: boolean

  solarArrayPower: number | null
  windTurbinePower: number | null
  planetaryHabitationRank: number | null
}
```

Do not implement habitation validation or power calculations yet.

---

## 4.3 Biome definition

```ts
export interface BiomeReference {
  id: BiomeId
  name: string
}
```

Semantics:

- `id` = canonical `BiomeFormID`;
- `name` = display name;
- display names are **not guaranteed unique**;
- multiple distinct BiomeFormIDs may legitimately share the same display name, including on the same planet.

Do not attach resources directly to `BiomeReference`.

---

## 4.4 Body-biome occurrence

```ts
export interface BodyBiomeReference {
  id: BodyBiomeId
  bodyId: PlanetaryBodyId
  biomeId: BiomeId
  biomeIndex: number
}
```

Semantics:

- represents one BIOM occurrence on one body;
- `biomeIndex` is retained for stable/default ordering;
- body-biome identity must never depend on `BiomeName`.

The inorganic and organic extracts independently repeat body-biome identity. Build one shared `BodyBiomeReference` catalogue from their union and validate that both sources agree.

---

## 4.5 Inorganic occurrence

Model biome and atmosphere separately.

Preferred shape:

```ts
export type InorganicOccurrenceLocation =
  | {
      type: 'biome'
      bodyBiomeId: BodyBiomeId
    }
  | {
      type: 'atmosphere'
    }

export interface InorganicResourceOccurrenceReference {
  bodyId: PlanetaryBodyId
  resourceId: ResourceId
  location: InorganicOccurrenceLocation
}
```

Equivalent discriminated-union shapes are acceptable if clearer.

Semantics:

- a BIOME row means the resource occurs in a specific body-biome occurrence;
- an ATMOSPHERE row means the resource is atmospherically available at body level;
- atmospheric resources are considered available regardless of future biome selection;
- do not duplicate atmospheric resources into every biome.

---

# 5. Organic model

The organic model must separate:

1. global species identity;
2. species-on-planet facts;
3. biome occurrence;
4. generic farming-input profile.

This separation is important for both source fidelity and future planner work.

---

## 5.1 Species identity

```ts
export type SpeciesType =
  | 'flora'
  | 'fauna'

export interface SpeciesReference {
  id: SpeciesId
  name: string
  type: SpeciesType
}
```

Use:

- `SpeciesFormID` -> `id`
- `SpeciesDisplayName` -> `name`
- source `SpeciesType` -> runtime lower-case enum

A Species FormID must not resolve to conflicting display names or conflicting species types.

Terrormorphs and Chasmbass must be retained.

---

## 5.2 Organic source class

```ts
export type OrganicSourceClass =
  | 'plant'
  | 'herbivore'
  | 'carnivore'
```

For resolved source rows, derive source class from the canonical farming-input signature:

### Plant

```text
SpeciesType = Flora
Input 1 = Water × 1
Input 2 = blank
```

### Herbivore

```text
SpeciesType = Fauna
Input 1 = Water × 1
Input 2 = Fiber × 2
```

### Carnivore

```text
SpeciesType = Fauna
Input 1 = Water × 1
Input 2 = Nutrient × 2
```

The current source contains exactly these three resolved signatures.

The four `NoLinkedResource` rows contain no farming inputs and therefore cannot be classified from this dataset. Preserve them with:

```ts
sourceClass: OrganicSourceClass | null
```

Do not invent a diet/source class for them from external knowledge.

---

## 5.3 Species-on-planet facts

Use:

```ts
export interface PlanetSpeciesReference {
  bodyId: PlanetaryBodyId
  speciesId: SpeciesId
  sourceClass: OrganicSourceClass | null
  domesticable: boolean
  resourceId: ResourceId | null
}
```

This is the authoritative place for:

- whether the species is domesticable on that body;
- its plant/herbivore/carnivore source class;
- its harvested resource.

This is more faithful to game semantics than storing resource identity on every biome occurrence.

### Required invariant

For each:

```text
bodyId + speciesId
```

all source rows across all biomes must agree on:

- `Domesticable`;
- resolved/null harvested `resourceId`;
- derived/null `sourceClass`.

Any conflict must hard-fail the reference build.

The current source has no such conflicts.

---

## 5.4 Organic species occurrence

Use:

```ts
export interface OrganicSpeciesOccurrenceReference {
  bodyBiomeId: BodyBiomeId
  speciesId: SpeciesId
}
```

This relation answers only:

> where on this body does this species occur?

Do **not** repeat:

- `resourceId`;
- `domesticable`;
- `sourceClass`;
- farming inputs.

Those belong elsewhere.

---

# 6. Farming-input model

The game represents plant-resource, herbivore-resource, and carnivore-resource constructs separately even when the underlying harvested resource is the same.

For tracker/planner purposes, the current canonical input pattern can be normalized into source-class farming profiles to avoid species-level redundancy.

Use a model such as:

```ts
export interface FarmingIngredientReference {
  resourceId: ResourceId
  quantity: number
}

export interface OrganicFarmingProfileReference {
  sourceClass: OrganicSourceClass
  inputs: FarmingIngredientReference[]
}
```

Generate/validate these effective profiles:

```text
plant:
  Water × 1

herbivore:
  Water × 1
  Fiber × 2

carnivore:
  Water × 1
  Nutrient × 2
```

### Important rules

- `Domesticable` determines whether a species is actually farmable in current tracker logic.
- Farming input presence does not imply farmability.
- Preserve non-domesticable species in the reference model.
- For the current resource matrix, only domesticable species should contribute as farmable organic sources.
- Terrormorph/Chasmbass `NoLinkedResource` records remain represented even though they have no harvested resource/profile classification.

Prefer generating the three profiles from observed source signatures and validating them rather than silently hard-coding assumptions without checking source data.

If the source presents a new/unexpected resolved farming signature, hard-fail with a diagnostic that identifies the relevant planet/species/resource and inputs.

---

# 7. Resource catalogue and crosswalk

Continue using the current application `ResourceReference` catalogue and stable application `ResourceId` model for this batch.

Do not migrate application resource identity to FormID yet.

Build explicit canonical FormID/name -> application ResourceId resolution for both new occurrence files.

Rules:

- no fuzzy matching;
- known aliases may remain explicit and visible;
- `Aluminum` -> curated player-facing `Aluminium` remains an explicit alias if required;
- any resolved inorganic/organic resource that cannot be crosswalked must hard-fail;
- farming inputs (`Water`, `Fiber`, `Nutrient`) must also resolve through the resource catalogue;
- `NoLinkedResource` is an accepted organic state and results in `resourceId: null`, not a fake resource.

Remove legacy organic repair logic that existed solely to accommodate old `Toxin Agent`, `Unique`, or `None` occurrence artifacts when it is no longer needed.

Do not add species-specific repair mappings.

---

# 8. Derived body resource inventory

Retain the existing body-level resource model temporarily for compatibility:

```ts
export interface BodyResourcesReference {
  bodyId: PlanetaryBodyId
  resourceIds: ResourceId[]
}
```

But change its documentation and generation semantics.

It is now a **derived compatibility/index view**, not canonical source truth.

Generate each body inventory as:

```text
distinct inorganic resources from all body biomes
UNION
distinct atmospheric inorganic resources
UNION
distinct harvested organic resources represented by PlanetSpeciesReference
```

For Batch 1 this derived index exists so current UI/validators can continue operating without becoming biome-aware yet.

Do not create any new source CSV for this flattening.

`body-resources.json` may remain as generated runtime JSON during Batch 1.

Document clearly that it is derived and may eventually disappear once all consumers become biome-aware.

### Organic inclusion note

The current application’s body-level resource inventory represents resources present on the body, not only farmable resources. Therefore derive body-level organic resource presence from the canonical species/resource relationships generally.

Current matrix logic that needs **farmable/domesticable sources** must use the new `PlanetSpeciesReference.domesticable` semantics when that richer logic is introduced. Do not silently redefine body-level planetary resource existence as “domesticable only”.

Avoid unnecessary UI behaviour change in this batch.

---

# 9. Runtime ReferenceData snapshot

Update `ReferenceData` toward:

```ts
export interface ReferenceData {
  systems: StarSystemReference[]
  bodies: PlanetaryBodyReference[]

  biomes: BiomeReference[]
  bodyBiomes: BodyBiomeReference[]

  resources: ResourceReference[]
  inorganicOccurrences: InorganicResourceOccurrenceReference[]

  species: SpeciesReference[]
  planetSpecies: PlanetSpeciesReference[]
  organicOccurrences: OrganicSpeciesOccurrenceReference[]
  organicFarmingProfiles: OrganicFarmingProfileReference[]

  bodyResources: BodyResourcesReference[]

  products: ProductReference[]
  productRecipes: ProductRecipeReference[]
}
```

Keep naming consistent across:

- domain types;
- generated JSON filenames;
- loader properties.

---

# 10. Generated runtime files

Generate/load separate JSON datasets with obvious grain.

Recommended outputs:

```text
public/reference-data/systems.json
public/reference-data/bodies.json

public/reference-data/biomes.json
public/reference-data/body-biomes.json

public/reference-data/resources.json
public/reference-data/inorganic-occurrences.json

public/reference-data/species.json
public/reference-data/planet-species.json
public/reference-data/organic-occurrences.json
public/reference-data/organic-farming-profiles.json

public/reference-data/body-resources.json

public/reference-data/products.json
public/reference-data/product-recipes.json
```

Update `src/data/referenceDataLoader.ts` accordingly.

Do not collapse these into one giant JSON file.

Do not add a generated `planet-resources.csv`.

---

# 11. Biome identity and validation rules

This area is important because biome display names are not unique.

### Allowed

Multiple distinct BiomeFormIDs may have the same `BiomeName`.

This can happen even on the same planet and is verified in the game data.

Therefore:

- never key by biome display name;
- never fail merely because two body biomes display the same name;
- future UI disambiguation is a Batch 3 concern.

### Hard-fail invariants

For a given body:

1. one `BiomeIndex` must resolve to one `BiomeFormID`;
2. one `BiomeFormID` must resolve to one `BiomeIndex`;
3. inorganic and organic source rows describing the same body-biome occurrence must agree on FormID/index/name identity;
4. the same `BiomeFormID` must not have conflicting canonical identity/display metadata across source data.

Remember that resource/species rows naturally repeat biome columns many times. Those repetitions are not themselves duplicate-biome errors. Deduplicate them into the body-biome catalogue before applying the semantic checks above.

---

# 12. Build-time validation requirements

Strengthen `scripts/build-reference-data.mjs`.

Diagnostics should identify enough source identity to correct an extract rather than only saying “invalid row”.

## 12.1 Planet directory

Hard fail on:

- duplicate `PlanetFormID`;
- unknown `BodyType`;
- malformed/unsupported numeric values;
- contradictory system identity for a body;
- invalid nonblank `PlanetaryHabitationRank`;
- invalid nonblank solar/wind values.

Continue validating canonical duplicate semantics appropriately.

## 12.2 Body/biome joins

Hard fail when:

- inorganic or organic `PlanetFormID` cannot resolve to `planet-directory.csv`;
- biome FormID/index mapping violates the invariants above;
- inorganic/organic representations of the same body-biome conflict.

Do not depend on organic `PlanetName`.

## 12.3 Inorganic occurrences

Hard fail when:

- `LocationType` is not `BIOME` or `ATMOSPHERE`;
- BIOME row lacks required biome identity;
- ATMOSPHERE row is treated as if it requires a biome occurrence;
- resource cannot resolve to the application catalogue;
- semantically conflicting duplicate occurrence exists.

Exact semantically identical source duplicates may be deduplicated with an informational diagnostic if the builder already follows that pattern.

## 12.4 Optional inorganic manifest

If `biome-inorganic-resources.manifest.json` is present:

Hard fail when:

- manifest dataset identity does not describe the inorganic resource dataset;
- manifest schema version is unsupported;
- manifest output filename does not correspond to the CSV being ingested;
- manifest total row count disagrees with the actual CSV;
- manifest BIOME count disagrees with the actual CSV;
- manifest ATMOSPHERE count disagrees with the actual CSV.

If the manifest is absent, skip these checks and continue normally.

Do not hard-fail or warn merely because:

- upstream hashes differ from current repository files;
- upstream timestamps differ;
- upstream row counts differ from separately refreshed repository sources;
- the manifest is absent.

Those values are provenance/diagnostic information only.

## 12.5 Organic species

Hard fail when:

- `SpeciesFormID` has conflicting display names;
- `SpeciesFormID` has conflicting `SpeciesType`;
- `ResourceResolutionStatus == Resolved` but resource identity is missing;
- a resolved resource cannot crosswalk;
- `Domesticable` contains an unsupported value;
- one `bodyId + speciesId` has conflicting domesticability;
- one `bodyId + speciesId` has conflicting harvested resource;
- one `bodyId + speciesId` has conflicting derived source class;
- a resolved row has an unexpected farming input signature.

Explicitly accept:

```text
ResourceResolutionStatus = NoLinkedResource
```

and model its harvested resource/source class as null where source data cannot determine them.

## 12.6 Farming profiles

Hard fail if observed resolved source signatures contradict the three expected profiles or if an ingredient cannot resolve to the resource catalogue.

---

# 13. Runtime/persisted-network migration contract

This batch changes reference truth, not player-network persistence.

There should be **no persisted OutpostNetwork schema migration** in Batch 1.

Existing saved networks must continue loading.

Preserve:

- `systemId`;
- `bodyId`;
- existing resource IDs;
- local resource selections;
- active production;
- manufacturing;
- planned supply;
- cargo-pad/link state.

Do not add persisted biome fields yet.

Do not silently alter existing outpost state because a richer reference dataset is now available.

Undo/Redo semantics should not change.

JSON import/export schema should not change.

---

# 14. Current UI compatibility

After Batch 1, the application should look and behave as close to the current version as practical.

Do not redesign screens.

Do not add biome selectors.

Do not surface species names yet unless a current component already has a safe passive use for them and doing so is explicitly required by existing behaviour. The planned matrix species presentation belongs to Batch 3.

Do not add Planetary Habitation validation yet; that is Batch 2.

Do not calculate or display solar/wind multipliers yet.

The main visible differences should be consequences of corrected reference data, not new interaction design.

---

# 15. Future Batch 3 semantics to preserve, but not implement

Design Batch 1 so these later semantics remain straightforward.

An outpost may touch zero, one, or multiple explicitly selected body biomes.

Future persisted concept is expected to be equivalent to:

```ts
selectedBiomeIds: BodyBiomeId[]
```

with:

```text
[]                   => unrestricted; treat as all body biomes
one or more IDs      => restrict biome-derived resources to that subset
all body biome IDs   => functionally equivalent to []
```

Do not normalize an explicit “all selected” state to empty automatically; the states may be semantically equivalent while preserving different user intent.

Atmospheric inorganic resources are available regardless of selected biome subset.

Do not implement this persisted field or UX now, but avoid reference-model decisions that make it difficult.

---

# 16. Legacy retirement

Once the new build works, remove build dependencies on:

```text
planet-directory.tsv
planet-all-resources.csv
organic-resources.csv
```

Remove those legacy source files from the repository as part of this batch unless a repository rule explicitly requires retaining archived fixtures.

Do not keep both old and new pipelines running in parallel.

Remove obsolete constants, parser paths, comments, aliases, and repair logic that only exist for the retired datasets.

In particular, revisit existing builder comments that currently describe `planet-all-resources.csv` as canonical occurrence truth.

---

# 17. Documentation updates

Update durable docs to describe the new architecture.

At minimum:

## `docs/ARCHITECTURE.md`

Document:

- the three new canonical game-derived source files;
- biome-aware runtime entities and relationships;
- derived `bodyResources` compatibility index;
- separation of canonical CSV provenance from lean runtime JSON;
- no persisted-network migration in Batch 1.

## `docs/DOMAIN-RULES.md`

Document settled semantics:

- biome FormID is identity; display name is non-unique;
- biome index is body-local ordering;
- atmospheric inorganic resources are body-level, not biome-level;
- species identity vs planet-species vs biome occurrence;
- domesticability is planet/species-level;
- harvested resource is planet/species-level and must remain constant across biomes;
- source class is plant/herbivore/carnivore based on farming input signature;
- inputs do not imply domesticability;
- `NoLinkedResource` special species remain represented;
- body-level resource inventory is derived.

## `docs/BACKLOG.md`

Keep later work clearly deferred:

- Batch 2: Planetary Habitation validator and related source semantics;
- future power-efficiency use of solar/wind values;
- Batch 3: biome-aware outpost persisted state and UX;
- species display in resource matrix;
- biome selector disambiguation where display names collide;
- eventual retirement of `body-resources.json` when no longer required;
- possible future replacement of currently curated dictionaries with game-file extracts.

Do not opportunistically implement backlog items.

---

# 18. Verification against current source data

Use the current three source files for explicit sanity checks.

At minimum report:

### Planet directory

- row count;
- distinct PlanetFormIDs;
- counts of null/non-null new power/habitation fields;
- no duplicate body IDs.

### Inorganic

- row count;
- BIOME vs ATMOSPHERE counts;
- distinct bodies;
- distinct resources;
- body-biome count;
- successful resource crosswalk;
- no unresolved body joins;
- if the optional manifest is present, successful reconciliation of:
  - dataset identity;
  - supported schema version;
  - output filename;
  - total row count;
  - BIOME row count;
  - ATMOSPHERE row count;
- if the manifest is absent, confirmation that ingestion still succeeds normally.

### Organic

- row count;
- `Resolved` vs `NoLinkedResource`;
- distinct species;
- distinct planet/species pairs;
- domesticable Yes/No counts;
- source-class counts;
- confirmation of zero body/species conflicts for:
  - domesticable;
  - harvested resource;
  - source class;
- retained Terrormorph and Chasmbass rows;
- successful resource and farming-input crosswalk.

Current source should show four `NoLinkedResource` rows; do not treat that fact itself as an error.

---

# 19. Regression/compatibility checks

Before finishing:

1. run the reference-data builder;
2. run `npm run lint`;
3. run `npm run build`;
4. inspect `git diff`;
5. confirm legacy source files are no longer referenced by code;
6. confirm generated runtime files load;
7. manually launch the app and verify existing saved/reference-driven screens render without runtime errors;
8. verify Shattered Space bodies/resources remain present;
9. spot-check several dense planets such as Montara Luna and Charybdis II;
10. verify body selectors still use `outpostAllowed`;
11. verify existing matrix/body-resource consumers continue receiving a body-level resource inventory;
12. verify no persisted network/schema version changes occurred.

If current source causes a newly strengthened validation to fail because our assumptions are wrong, do not weaken the validation silently. Report the source rows and explain the contradiction.

---

# 20. Scope exclusions

Do **not** implement in this batch:

- biome selectors;
- persisted biome selections;
- multi-biome outpost editing;
- biome-aware Present/Producing interactions;
- species names in the matrix;
- biome display-name disambiguation UX;
- Planetary Habitation validator;
- solar/wind efficiency calculations;
- power demand/supply calculations;
- tick-duration modelling;
- throughput modelling;
- fauna diet as a separate persisted/reference property;
- planner optimisation;
- replacement of currently curated dictionaries;
- SFSE plugin work;
- xEdit script changes;
- reference-data audit/info UI.

---

# 21. Implementation quality constraints

- Preserve domain/data/UI separation.
- Prefer explicit typed relationships over flattened anonymous structures.
- Do not make display names into keys.
- Do not duplicate canonical source facts unnecessarily in runtime JSON.
- Do not put audit/provenance-only columns into runtime objects without a concrete consumer.
- Keep compatibility derivations clearly documented as derivations.
- Fail loudly on source contradictions.
- Avoid fuzzy data repair.
- Keep lint baseline clean: zero new warnings/errors.
- Do not commit or push.

---

# 22. Codex completion report

When finished, report:

1. files changed/added/deleted;
2. final runtime interfaces;
3. generated JSON datasets and their row counts;
4. validation rules added;
5. legacy files/logic retired;
6. source-data sanity results;
7. any source anomalies found;
8. optional inorganic manifest status:
   - absent and skipped successfully; or
   - present and reconciled successfully, including manifest schema/version summary;
9. whether old/new derived body-resource inventories differ, with a concise explanation of material differences;
10. `npm run lint` result;
11. `npm run build` result;
12. manual smoke-test result;
13. confirmation that persisted schema/import/export did not change;
14. any intentionally deferred follow-ups.

Do not commit or push.
