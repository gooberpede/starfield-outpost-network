# Codex Implementation Brief — Reference Data Enrichment

## Objective

Enrich the application's generated reference-data catalogues with canonical rarity and inorganic resource-family metadata, using three curated dictionary CSVs in `reference-source/`.

This is a **reference-data/model batch only**. Do **not** redesign the Planned Supply UI in this batch.

The goal is to establish a clean runtime foundation that a later Planned Supply UI batch can consume.

## Source files

Before implementation begins, the following files will exist in `reference-source/`:

```text
reference-source/
  inorganic-resource-dictionary.csv      # replaces the existing file
  organic-resource-dictionary.csv        # new
  manufactured-product-dictionary.csv    # new
```

Treat these files as curated source data.

### `inorganic-resource-dictionary.csv`

Columns:

```csv
Code,Resource,Rarity,ParentResource,SortOrder
```

Semantics:

- `Code`: player-facing abbreviation already used by the application.
- `Resource`: canonical player-facing resource name for the application catalogue.
- `Rarity`: one of `Common`, `Uncommon`, `Rare`, `Exotic`, `Unique`.
- `ParentResource`: immediate parent resource within the inorganic family tree.
  - blank means the resource is a root.
  - roots are **not** self-parenting.
- `SortOrder`: optional positive integer used to control ordering among siblings.
  - for the eight main family roots it defines family order.
  - at branching points it defines sibling order.
  - blank means no explicit ordering is required.

Important examples:

```csv
Cu,Copper,Common,,4
F,Fluorine,Uncommon,Copper,
Au,Gold,Rare,Fluorine,1
xF4,Tetrafluorides,Rare,Fluorine,2
Sb,Antimony,Exotic,Gold,
```

Water and Helium-3 are valid root/singleton inorganic resources:

```csv
H2O,Water,Common,,
He-3,Helium-3,Common,,
```

Do not invent family relationships for them.

### `organic-resource-dictionary.csv`

Columns:

```csv
Resource,ShortName,Rarity
```

Semantics:

- `Resource`: canonical player-facing organic resource name.
- `ShortName`: curated abbreviation.
- `Rarity`: one of `Common`, `Uncommon`, `Rare`, `Exotic`, `Unique`.

Organic resources do not have family relationships.

For every generated organic `Resource`:

```text
parentId = null
sortOrder = null
```

The dictionary intentionally excludes bogus/intermediate labels such as:

- `None`
- `Toxin Agent`
- generic `Unique`

Do not recreate those as catalogue resources.

### `manufactured-product-dictionary.csv`

Columns:

```csv
Name,ShortName,Rarity
```

Semantics:

- `Name`: canonical player-facing manufactured-product name.
- `ShortName`: curated abbreviation.
- `Rarity`: one of `Common`, `Uncommon`, `Rare`, `Exotic`, `Unique`.

This dictionary becomes the authoritative catalogue metadata source for manufactured products.

The existing `industrial-workbench.csv` remains the recipe source.

---

## Current architecture to preserve

Read and follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

The existing architecture deliberately separates:

```text
reference-source/*.csv
        ↓
scripts/build-reference-data.mjs
        ↓
public/reference-data/*.json
        ↓
runtime loader / TypeScript model
```

Preserve that architecture.

Do not make the browser application read CSV files directly.

Do not introduce a second runtime relationship file for rarity or resource families.

The enriched metadata belongs in the existing catalogue JSON files:

```text
public/reference-data/resources.json
public/reference-data/products.json
```

---

# Required runtime model

## Shared rarity type

Introduce one shared TypeScript rarity type used by both resources and products.

Preferred semantic shape:

```ts
export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'exotic'
  | 'unique'
```

Use the existing project structure to choose the correct domain file for this type. Do not duplicate equivalent rarity unions in multiple files.

Runtime rarity values should be normalized to lowercase even though the curated CSV values are title case.

## Resource

Extend the existing `Resource` model to carry:

```ts
interface Resource {
  id: string
  name: string
  shortName: string
  category: 'inorganic' | 'organic'
  rarity: Rarity
  parentId: string | null
  sortOrder: number | null
}
```

Use the project's existing type declarations rather than blindly creating a second interface if `Resource` already exists elsewhere.

Semantics:

### Inorganic

- `rarity` comes from `inorganic-resource-dictionary.csv`.
- `parentId` is the generated application `ResourceId` corresponding to `ParentResource`.
- blank `ParentResource` becomes `null`.
- `sortOrder` is the parsed positive integer when supplied.
- blank `SortOrder` becomes `null`.

Example generated records:

```json
{
  "id": "copper",
  "name": "Copper",
  "shortName": "Cu",
  "category": "inorganic",
  "rarity": "common",
  "parentId": null,
  "sortOrder": 4
}
```

```json
{
  "id": "gold",
  "name": "Gold",
  "shortName": "Au",
  "category": "inorganic",
  "rarity": "rare",
  "parentId": "fluorine",
  "sortOrder": 1
}
```

### Organic

- `rarity` comes from `organic-resource-dictionary.csv`.
- `parentId` is always `null`.
- `sortOrder` is always `null`.

Example:

```json
{
  "id": "solvent",
  "name": "Solvent",
  "shortName": "Slv",
  "category": "organic",
  "rarity": "exotic",
  "parentId": null,
  "sortOrder": null
}
```

Do not make `parentId` or `sortOrder` optional. Absence of a relationship/order is represented explicitly with `null`.

## Product

Extend the existing manufactured `Product` model to carry rarity:

```ts
interface Product {
  id: string
  name: string
  shortName: string
  rarity: Rarity
}
```

Example:

```json
{
  "id": "adaptive-frame",
  "name": "Adaptive Frame",
  "shortName": "AFr",
  "rarity": "common"
}
```

Do not add fabricator type in this batch unless it already exists for another legitimate reason. Planned Supply will use actual rarity rather than fabricator type as its primary vertical grouping.

---

# Build-pipeline changes

## 1. Add the two new dictionary inputs

Update `scripts/build-reference-data.mjs` to load:

```text
reference-source/organic-resource-dictionary.csv
reference-source/manufactured-product-dictionary.csv
```

Keep loading:

```text
reference-source/inorganic-resource-dictionary.csv
reference-source/organic-resources.csv
reference-source/industrial-workbench.csv
reference-source/planet-all-resources.csv
...
```

where those files are still needed for other generated datasets.

### Important distinction: organic master data vs occurrence data

Do not confuse these two files:

```text
organic-resource-dictionary.csv
organic-resources.csv
```

They have different responsibilities.

`organic-resource-dictionary.csv` is now the **master catalogue source** for organic resource identity, abbreviation, and rarity.

The existing `organic-resources.csv` is an **occurrence/farmability source** and must remain available to the code that determines which organic resources are farmable on which bodies.

In particular, preserve the existing farmable-organic occurrence logic used while building `body-resources.json`.

It is acceptable, and probably clearer, to rename internal constants/functions so this distinction is obvious, for example:

```text
ORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE
ORGANIC_OCCURRENCES_SOURCE_FILE
```

but do not rename source files beyond the filenames specified in this brief.

## 2. Build resources from the two dictionaries

Change the resource-catalogue build so the primary master inputs are:

```text
inorganic-resource-dictionary.csv
organic-resource-dictionary.csv
```

The per-planet `organic-resources.csv` must no longer be used to discover which logical organic resources exist in `resources.json`.

Likewise, occurrence data should not silently manufacture new master resources merely because an unexpected occurrence label appears.

The existing canonical/display-name alias machinery may still be needed for crosswalking canonical occurrence records to application resource IDs. Preserve that function where necessary.

However, aliases should resolve source naming differences to dictionary-backed resources; they should not act as an alternative master-data source.

If an occurrence resolves to a logical resource that does not exist in the dictionaries, fail loudly rather than silently creating a new catalogue record.

## 3. Build products from the product dictionary

`manufactured-product-dictionary.csv` becomes the authoritative source for:

- product identity/name
- abbreviation
- rarity

`industrial-workbench.csv` remains authoritative for recipes.

Do not continue deriving the product catalogue solely by deduplicating recipe rows.

The builder should validate that recipe products from `industrial-workbench.csv` resolve to product records in `manufactured-product-dictionary.csv`.

If a recipe references a product absent from the dictionary, fail generation with a useful error.

If a dictionary product has no recipe, investigate how the existing application treats such products. Do not silently delete it from the catalogue merely because it is absent from recipe rows; report a material inconsistency rather than guessing.

## 4. Abbreviations

The new organic and product dictionary files already contain curated abbreviations:

```text
organic-resource-dictionary.csv      -> ShortName
manufactured-product-dictionary.csv  -> ShortName
```

Use those dictionary values as the authoritative abbreviations for their catalogue records.

The inorganic dictionary continues to use `Code`.

Inspect the current use of `reference-source/abbreviations.csv`.

Do not blindly maintain two competing sources of truth for the same organic/product abbreviations.

Within this batch, make the smallest coherent change that leaves one authoritative source for the generated catalogue fields.

If `abbreviations.csv` is still legitimately required by other build logic, keep it for those purposes. If all of its organic/product catalogue responsibilities have been superseded by the new dictionaries, remove or reduce that dependency only where safe and within scope.

Do not turn this into the broader master-data ingestion redesign described in the backlog.

---

# Build-time validation

Treat the dictionary CSVs as curated master data and fail loudly on inconsistencies.

## Shared rarity validation

Accepted source values:

```text
Common
Uncommon
Rare
Exotic
Unique
```

Normalize them to lowercase runtime values.

Reject:

- blank rarity;
- unknown rarity;
- malformed values rather than quietly inventing a fallback.

Prefer a shared helper for rarity parsing/validation.

## Inorganic dictionary validation

At minimum validate:

### Required identity

Every row requires:

- `Code`
- `Resource`
- `Rarity`

### Uniqueness

Reject duplicate:

- resource names;
- generated resource IDs;
- inorganic codes/abbreviations.

### Parent validity

For each nonblank `ParentResource`:

- parent must exist in the inorganic dictionary;
- resource must not name itself as parent;
- resolved parent must be inorganic;
- the complete parent graph must be acyclic.

### Rarity relationship sanity

The supplied data currently forms rarity-progressing trees.

Validate that a parent is strictly less rare than its child.

Use rarity order:

```text
common < uncommon < rare < exotic < unique
```

Do **not** require the child to be exactly one tier rarer unless inspection of the source data confirms that this is intended as a hard domain rule.

The build should reject a child whose parent is the same rarity or rarer.

### SortOrder

Blank -> `null`.

If present:

- parse as an integer;
- require a positive value.

Within a set of siblings that use explicit `SortOrder`, reject duplicate non-null sort-order values.

For root records, treat all roots as siblings for this validation.

Do not require every sibling to have a `SortOrder`.

Do not infer fake ordering values for blank fields.

## Organic dictionary validation

Every row requires:

- `Resource`
- `ShortName`
- `Rarity`

Reject duplicate:

- resource names;
- generated IDs;
- abbreviations.

Generated organic resources must always have:

```text
parentId: null
sortOrder: null
```

Do not allow family metadata to leak into organic records.

## Product dictionary validation

Every row requires:

- `Name`
- `ShortName`
- `Rarity`

Reject duplicate:

- product names;
- generated product IDs;
- abbreviations.

Validate product dictionary ↔ recipe compatibility as described above.

---

# Reference crosswalk behavior

The existing application distinguishes:

```text
canonical ResourceFormID
        ↓
logical application ResourceId
```

Preserve this model.

Canonical resource occurrence sources may contain runtime/editor naming variants.

Continue resolving those variants through explicit normalization/alias rules where needed.

Examples already present in the project include canonical/display differences such as:

```text
Aluminum -> Aluminium
Gastronomic -> Gastronomic Delight
MemorySubstrate -> Memory Substrate
HighTensileSpidrion -> High-Tensile Spidroin
LuxuryTextile -> Luxury Textile
```

Do not introduce fuzzy matching.

Unexpected canonical/display mismatches should remain explicit and fail loudly unless deliberately mapped.

### Known cleaned-organic caveat

Earlier occurrence/enrichment data has contained non-master labels such as:

```text
None
Toxin Agent
Unique
```

These are deliberately absent from `organic-resource-dictionary.csv`.

Do not recreate them as logical resources.

If current occurrence/crosswalk generation encounters them, inspect the existing data path and handle them only as source-normalization/occurrence exceptions where necessary.

Known semantic conclusions from the data investigation:

- `None` is not a resource and should not become a catalogue item.
- `Toxin Agent` corresponds to logical `Toxin` in the relevant fauna resource chain.
- generic `Unique` was an intermediate/ambiguous occurrence classification, not a resource identity.

Do not broaden this batch into a full cleanup of every raw organic occurrence unless required to keep the existing generated occurrence data valid.

If the current build cannot cleanly reconcile these legacy occurrence labels without a larger refactor, stop and report the exact conflict rather than guessing.

---

# Generated JSON

Regenerate the checked-in runtime files using the normal project build/reference-data workflow.

Expected enriched shape:

## `public/reference-data/resources.json`

Every resource record includes:

```text
id
name
shortName
category
rarity
parentId
sortOrder
```

No resource record should omit the three new fields.

## `public/reference-data/products.json`

Every product record includes:

```text
id
name
shortName
rarity
```

Preserve deterministic output ordering.

Do not reorder records according to UI layout requirements unless the current generator already has a clear catalogue ordering rule. Planned Supply layout should be derived by the UI later.

---

# Runtime loading and types

Update all relevant TypeScript parsing/loading/reference-data types so the generated JSON is represented accurately.

The application should not treat the new fields as optional compatibility decorations.

After this batch, loaded runtime catalogue objects should carry the enriched metadata as first-class fields.

Search for all places constructing `Resource` and `Product` values manually, including:

- sample/default data;
- tests/fixtures if present;
- reference-data loader parsing;
- any hard-coded catalogue records.

Update them coherently.

Do not change persisted `OutpostNetwork` schema merely because reference catalogue objects gained metadata. Resource/product references in the user's network should continue to use stable IDs rather than embedding catalogue metadata.

No storage migration should be necessary unless inspection shows reference records are unexpectedly persisted inline. If that is the case, stop and report before changing persisted schema.

---

# Planned Supply implications — context only

Do **not** implement this UI now.

The next implementation batch intends to render Planned Supply approximately as follows:

```text
Inorganic Resources
  vertical: rarity
  horizontal: family topology

Organic Resources
  vertical: rarity
  horizontal: alphabetical

Manufactured Products
  vertical: rarity
  horizontal: alphabetical
```

All three use the same rarity order:

```text
Common
Uncommon
Rare
Exotic
Unique
```

The purpose of this batch is to make that UI derivable from reference data without hardcoded resource/product classification tables.

Do not add browser coordinates, grid-column values, or Planned Supply presentation metadata to the dictionaries or JSON.

---

# Non-goals

Do not:

- redesign Planned Supply;
- add the new selection-grid component;
- change current Planned Supply persistence or auto-retirement semantics;
- redesign Outpost Details;
- implement fabricator-type grouping;
- create a separate resource-family JSON file;
- add hardcoded UI coordinates to reference data;
- redesign the entire master-data ingestion architecture;
- rewrite organic occurrence extraction;
- change cargo, availability, history, validation-registry, or outpost-network semantics;
- add unrelated dependencies;
- clean up unrelated lint problems;
- commit or push changes.

The broader review of how canonical/master/reference data is sourced, normalized, joined, validated, and emitted is a backlog item. Make only the changes needed for this coherent enrichment batch.

---

# Documentation

Update project documentation where the implementation materially changes the documented reference-data architecture.

At minimum inspect:

```text
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/BACKLOG.md
README.md
```

Update only the documents that genuinely need changes.

The documentation should make clear that:

- resource/product catalogue metadata is generated from curated dictionaries;
- planetary occurrence files are not the master catalogue;
- `resources.json` carries rarity for both organic and inorganic resources plus inorganic family metadata;
- `products.json` carries product rarity;
- the broader reference/master-data ingestion review remains deferred.

Do not remove that broader backlog item merely because this batch improves the immediate pipeline.

---

# Verification

Run the project's normal reference-data generation command(s), then:

```bash
npm run build
```

Run targeted lint/tests appropriate to changed files.

Run full lint if that is the established project workflow, but do not broaden scope to fix known unrelated pre-existing lint failures. Report them separately.

Also run:

```bash
git diff --check
```

## Data-specific verification

Confirm programmatically or by inspection that:

### Resources

- every generated resource has a valid rarity;
- every generated resource has `parentId` present, either a valid ID or `null`;
- every generated resource has `sortOrder` present, either a positive integer or `null`;
- all organic resources have `parentId: null`;
- all organic resources have `sortOrder: null`;
- all non-null inorganic `parentId` values resolve to an inorganic resource;
- no inorganic family cycles exist;
- Water and Helium-3 remain valid singleton roots;
- `None`, `Toxin Agent`, and generic `Unique` are not generated as organic catalogue resources.

### Products

- every generated product has a valid rarity;
- every product dictionary row appears exactly once in `products.json`;
- every Industrial Workbench recipe product resolves to a dictionary product.

### Regression

Verify that:

- existing body-resource generation still works;
- farmable-organic body filtering still works;
- recipe generation still works;
- reference-data loading succeeds in the application;
- existing outpost network data still loads;
- no persisted network schema version change was introduced.

---

# Acceptance criteria

This batch is complete when:

1. `inorganic-resource-dictionary.csv` is the authoritative source for inorganic name, abbreviation, rarity, family parent, and optional family ordering.

2. `organic-resource-dictionary.csv` is the authoritative source for organic name, abbreviation, and rarity.

3. `organic-resources.csv` is no longer used as the organic master catalogue source, but remains in use for existing organic occurrence/farmability logic.

4. `manufactured-product-dictionary.csv` is the authoritative source for manufactured-product name, abbreviation, and rarity.

5. `industrial-workbench.csv` remains the recipe source and all recipe products are validated against the product dictionary.

6. Every runtime `Resource` has:

```text
rarity
parentId
sortOrder
```

with explicit nulls where appropriate.

7. Every runtime `Product` has `rarity`.

8. `resources.json` and `products.json` contain the enriched metadata.

9. Invalid rarity, dangling/self/cyclic inorganic parent relationships, duplicate master identities, and invalid sort-order data fail generation loudly.

10. Existing body-resource, recipe, storage, import/export, cargo, history, and outpost behavior remains unchanged.

11. The project builds successfully, apart from any explicitly reported pre-existing unrelated lint issues.

12. No Planned Supply UI redesign is included.

---

# Implementation approach

Before editing:

1. Read `AGENTS.md` and the project docs named above.
2. Inspect the current reference-data builder and loader end-to-end.
3. Inspect the existing `Resource`, `Product`, and `ReferenceData` TypeScript definitions.
4. Inspect current uses of `abbreviations.csv`.
5. Inspect product recipe generation and organic farmability/body-resource generation.
6. Confirm the three expected dictionary files are present in `reference-source/`.

Then implement the smallest coherent set of changes satisfying this brief.

If the repository's current implementation materially conflicts with an assumption in this brief, stop and report the conflict rather than silently inventing a different domain model.

Do not commit or push changes.

At completion, report:

- files changed;
- generated files changed;
- validation added;
- any source-data inconsistencies found;
- commands run and outcomes;
- known pre-existing failures left untouched;
- manual checks recommended before commit.
