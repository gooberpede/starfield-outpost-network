# CODEX IMPLEMENTATION BRIEF — Canonical Industrial Workbench Recipes and Handmade Reference-Data Consolidation

## Objective

Implement the approved reference-data migration that:

1. replaces the legacy handmade `reference-source/industrial-workbench.csv` with the supplied canonical 13-column Industrial Workbench extract;
2. migrates recipe joins from English names to canonical FormIDs;
3. preserves all existing stable application `ResourceId` and `ProductId` values;
4. consolidates the two surviving handmade organic/product dictionaries into one typed FormID-keyed tracker metadata file;
5. retires `reference-source/abbreviations.csv`;
6. adopts explicit bespoke provenance sentinels for tracker-authored metadata;
7. keeps recipe COBJ identity build-time/source-only;
8. introduces only the two reviewed runtime recipe corrections;
9. adopts canonical visible product name `Substrate Molecule Sieve`;
10. preserves `Gastronomic Delight` as the explicit tracker display override for canonical `Gastro Delight`;
11. does **not** change runtime JSON contracts, network schema, browser persistence, import/export schema, or history semantics.

This implementation should follow the conclusions in:

`docs/audits/codex-canonical-recipes-and-handmade-reference-data-audit.md`

Treat that audit as the authoritative design basis for this parcel.

---

## Required source inputs

Read at minimum:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/audits/codex-canonical-recipes-and-handmade-reference-data-audit.md`
- `scripts/build-reference-data.mjs`
- `scripts/biome-reference-data.mjs`
- `scripts/inorganic-resource-data.mjs`
- `reference-source/inorganic-resource-dictionary.csv`
- `reference-source/inorganic-resource-tracker-policy.csv`
- `reference-source/industrial-workbench.csv`
- `reference-source/manufactured-product-dictionary.csv`
- `reference-source/organic-resource-dictionary.csv`
- `reference-source/abbreviations.csv`
- `reference-source/biome-organic-resources.csv`
- all tests touching reference-data generation, resources, products, recipes, localization/reference names, manufacturing, Planned Supply, Search for Items, persistence, and compatibility.

The supplied canonical Industrial Workbench extract has this exact schema:

```text
SourceFile
ExtractTimestamp
ProductFormID
ProductEditorID
ProductName
RecipeSourceFile
RecipeFormID
RecipeEditorID
IngredientSourceFile
IngredientFormID
IngredientEditorID
IngredientName
Quantity
```

Expected current population:

- 90 rows;
- 30 distinct manufactured products;
- 30 distinct recipe COBJ records;
- 55 distinct ingredient IRES FormIDs;
- one extraction timestamp: `2026-09-11 13:11:31`;
- `Starfield.esm` provenance throughout;
- positive integer quantities 1–4.

**Missing-input rule:** if the canonical extract is not accessible in the working environment, stop and report the missing input. Do not reconstruct it from the legacy file.

---

## Settled design decisions

### Stable application identity

Preserve all existing application IDs exactly.

Examples that must remain unchanged:

```text
ResourceId: aluminium
ProductId: substrate-molecular-sieve
ResourceId: gastronomic-delight
```

Do not regenerate app IDs from canonical names.

Stable IDs remain the persisted/runtime identity used by saved networks.

### Canonical visible product name

Adopt the canonical game name:

```text
Substrate Molecule Sieve
```

for product FormID:

```text
00202781
```

with EditorID:

```text
ResMfg_Tier03_SubstrateMolecularSieve
```

Preserve:

```text
ProductId = substrate-molecular-sieve
ShortName = SMS
TrackerRarity = unique
```

Do **not** add a display override for the legacy `Substrate Molecular Sieve` spelling.

Do **not** add a legacy search alias unless existing tests or requirements explicitly demonstrate a current requirement. The approved default is canonical visible text only.

### Gastronomic Delight

Canonical organic source identity is:

```text
FormID: 0007782F
EditorID: ResOrgUniqueGastronomic
Canonical source name: Gastro Delight
```

Preserve the tracker-facing display name:

```text
Gastronomic Delight
```

via the new metadata file's explicit `DisplayNameOverride`.

Preserve:

```text
ResourceId = gastronomic-delight
```

The old name-based alias mechanism should be retired once FormID crosswalking is in place.

### Recipe COBJ identity

Retain and validate:

```text
RecipeSourceFile
RecipeFormID
RecipeEditorID
```

in the canonical source/build pipeline.

Do not create a general COBJ dictionary.

Do not add recipe FormID/EditorID/source fields to runtime `product-recipes.json` unless an existing runtime consumer unexpectedly requires them. The approved design is source-only/build-time validation.

### Runtime/persistence contracts

Do not change:

- `ResourceReference`;
- `ProductReference`;
- `ProductRecipeReference`;
- `resources.json` runtime shape;
- `products.json` runtime shape;
- `product-recipes.json` runtime shape;
- network schema version;
- browser-storage schema;
- import/export schema;
- CargoItem persisted identity;
- history/Undo/Redo semantics.

---

## Bespoke metadata consolidation

Create:

`reference-source/item-tracker-metadata.csv`

with exactly this schema:

```csv
SourceFile,ExtractTimestamp,ItemType,ItemFormID,ItemEditorID,CanonicalName,ItemId,ShortName,TrackerRarity,DisplayNameOverride
```

Initial population:

- 30 `product` rows;
- 30 `organic` rows;
- total 60 rows.

### Column semantics

#### `SourceFile`

Every row must use exactly:

```text
BESPOKE - NO SOURCE FILE
```

This is a tracker-authored metadata sentinel, not an extract source.

#### `ExtractTimestamp`

Every row must use exactly:

```text
9999-12-31 00:00:00
```

This is a settled sentinel meaning “tracker-authored row with no extraction event”.

Do not derive or update it from canonical extract timestamps.

#### `ItemType`

Allowed values only:

```text
organic
product
```

#### `ItemFormID`

Canonical FormID assertion and join key.

Rules:

- exactly eight uppercase hexadecimal characters;
- products: sourced from canonical Industrial Workbench product identity;
- organics: sourced from the canonical organic identity reduction from `biome-organic-resources.csv`.

#### `ItemEditorID`

Canonical assertion; must exactly match the joined canonical source record.

#### `CanonicalName`

Canonical source-name assertion; must exactly match the joined canonical source record.

This is not necessarily the final runtime display text.

#### `ItemId`

Explicit stable application ID.

Do not derive this from `CanonicalName`.

#### `ShortName`

Tracker-authored abbreviation.

Required.

Preserve all existing abbreviations.

#### `TrackerRarity`

Tracker-authored current five-tier rarity:

```text
common
uncommon
rare
exotic
unique
```

Do not attempt to infer current product/organic runtime rarity from EditorID tokens.

#### `DisplayNameOverride`

Blank by default.

Initial expected nonblank row:

```text
ItemType=organic
ItemFormID=0007782F
DisplayNameOverride=Gastronomic Delight
```

The product row for FormID `00202781` must leave this blank so the canonical visible name becomes `Substrate Molecule Sieve`.

---

## Source-file disposition

Implement the following approved file changes.

| File | Action |
|---|---|
| `reference-source/industrial-workbench.csv` | Replace with supplied canonical extract intact |
| `reference-source/manufactured-product-dictionary.csv` | Retire after migration into `item-tracker-metadata.csv` |
| `reference-source/organic-resource-dictionary.csv` | Retire after migration into `item-tracker-metadata.csv` |
| `reference-source/abbreviations.csv` | Retire |
| `reference-source/item-tracker-metadata.csv` | Add new 60-row tracker metadata source |
| `reference-source/inorganic-resource-dictionary.csv` | Keep as-is |
| `reference-source/inorganic-resource-tracker-policy.csv` | Keep as-is |
| `reference-source/biome-organic-resources.csv` | Keep as-is |
| `reference-source/biome-inorganic-resources.csv` | Keep as-is |
| `reference-source/planet-directory.csv` | Keep as-is |

Do not leave the old handmade files as shadow/compatibility authorities after the new pipeline is active.

---

## Recommended build-time module structure

Prefer a focused new module:

`scripts/item-reference-data.mjs`

rather than continuing to enlarge `scripts/build-reference-data.mjs`.

The new module should own, at minimum:

1. canonical Industrial Workbench parsing/validation;
2. canonical manufactured-product identity reduction;
3. canonical organic identity reduction from occurrence-grain organic data;
4. bespoke item metadata parsing/validation;
5. FormID-keyed product/organic metadata joins;
6. product catalogue construction with explicit stable ProductIds;
7. organic catalogue construction with explicit stable ResourceIds;
8. FormID-keyed recipe resolution;
9. source/build-time cross-source validation.

`build-reference-data.mjs` should remain orchestration.

`inorganic-resource-data.mjs` should continue owning inorganic canonical/policy logic.

Refactor only as much as needed to make ownership clean and testable.

---

## Canonical recipe parsing and validation

Validate the canonical Industrial Workbench CSV strictly.

Required checks:

- exact 13-column schema;
- required fields nonblank;
- FormIDs uppercase eight-hex;
- one consistent syntactically valid `ExtractTimestamp`;
- source filenames nonblank;
- one `ProductFormID` maps to exactly one product source/EditorID/name tuple;
- one `RecipeFormID` maps to exactly one recipe source/EditorID tuple;
- one `RecipeFormID` belongs to exactly one product;
- all rows for one product agree on recipe identity;
- one `IngredientFormID` maps to exactly one ingredient source/EditorID/name tuple;
- no duplicate `(ProductFormID, IngredientFormID)` row;
- `Quantity` is a positive safe integer;
- every product has at least one ingredient row;
- no product self-edge;
- product dependency graph has no cycle.

Keep validation messages specific enough to diagnose bad source data.

---

## Canonical product identity backbone

The canonical Industrial Workbench extract becomes the canonical identity backbone for the current 30 manufactured products.

Reduce repeated product rows to a unique product identity map keyed by:

```text
ProductFormID
```

Canonical product facts:

- source file;
- FormID;
- EditorID;
- canonical name.

Tracker metadata supplies:

- stable ProductId;
- abbreviation;
- tracker rarity;
- optional display override.

Require exact coverage between:

- canonical product FormIDs;
- `ItemType=product` metadata rows.

Fail generation if coverage drifts.

Do not silently mint new ProductIds when canonical population changes.

---

## Canonical organic identity backbone

Reduce `reference-source/biome-organic-resources.csv` to a unique organic IRES identity index keyed by:

```text
ResourceFormID
```

For repeated occurrence rows, assert consistent:

- source file;
- FormID;
- EditorID;
- canonical source name.

Require exact coverage between:

- the current 30 tracked organic canonical identities;
- `ItemType=organic` metadata rows.

Use FormID rather than name to map canonical organics to stable `ResourceId`.

After this migration, remove the current organic name-based alias path used to reconcile:

```text
Gastro Delight
```

with:

```text
Gastronomic Delight
```

The display override now belongs explicitly in tracker metadata.

If the occurrence data reveals identities outside the current tracked 30, do not silently add them. Fail clearly and report the coverage difference so it can be reviewed.

---

## Inorganic ingredient resolution

Resolve inorganic recipe ingredients by:

```text
IngredientFormID
```

against the canonical inorganic dictionary.

Validate agreement on:

- source file;
- FormID;
- EditorID;
- canonical name.

Respect existing inorganic tracker policy.

Do not let excluded/special canonical inorganic records silently become normal recipe ingredients without an explicit policy path.

All currently reviewed inorganic recipe ingredients are expected to resolve.

---

## Manufactured product ingredient resolution

Manufactured products can themselves be recipe ingredients.

Resolve those by `IngredientFormID` against the canonical product identity map.

Validate exact agreement with the product identity tuple.

Do not use product English names as keys.

---

## Organic ingredient resolution

Resolve organic recipe ingredients by `IngredientFormID` against the reduced canonical organic identity index.

Validate exact agreement with source/EditorID/name.

Do not use organic display names as keys.

---

## Ingredient population disambiguation

Every recipe ingredient FormID must resolve to exactly one of:

```text
inorganic resource
organic resource
manufactured product
```

Fail on zero matches.

Fail on ambiguous matches.

Do not infer type from naming conventions.

---

## Stable runtime catalogue construction

### Products

Build each runtime product from:

- canonical product identity;
- joined tracker metadata.

Runtime shape remains unchanged:

```ts
{
  id,
  name,
  shortName,
  rarity,
}
```

Name selection:

```text
DisplayNameOverride ?? CanonicalName
```

For product `00202781`, this must emit:

```text
id: substrate-molecular-sieve
name: Substrate Molecule Sieve
shortName: SMS
rarity: unique
```

### Organic resources

Build each organic runtime resource from:

- canonical organic identity;
- joined tracker metadata.

Runtime shape remains unchanged.

Name selection:

```text
DisplayNameOverride ?? CanonicalName
```

For organic `0007782F`, emit:

```text
id: gastronomic-delight
name: Gastronomic Delight
```

not canonical source text `Gastro Delight`.

### Inorganic resources

Keep current canonical inorganic/policy architecture unchanged except for any minimal shared integration needed for recipe FormID resolution.

---

## Recipe construction

Replace the current name-based recipe pipeline.

Do not resolve:

```text
ProductName
IngredientName
```

to runtime IDs by English text.

Instead:

```text
ProductFormID
    -> canonical product
    -> product metadata
    -> stable ProductId

IngredientFormID
    -> exactly one canonical item population
    -> stable ResourceId/ProductId
```

Use `Quantity` as the canonical base-game recipe fact.

Retain no runtime dependency on COBJ identity.

---

## Remove legacy recipe compatibility code

The current build contains a recipe compatibility branch for:

```text
Aluminium -> aluminium
```

Once canonical FormID-based recipe resolution is implemented, remove that recipe-specific name compatibility branch.

Do **not** remove unrelated localization/display handling that still intentionally renders or recognizes the stable application ID `aluminium`.

Canonical ingredient:

```text
FormID: 000057D6
CanonicalName: Aluminum
```

must still resolve to:

```text
ResourceId: aluminium
```

through the existing inorganic FormID crosswalk/policy.

---

## Expected intentional runtime recipe changes

The canonical migration must produce exactly these reviewed semantic changes in `public/reference-data/product-recipes.json`:

### Austenitic Manifold

Add:

```text
1 × Reactive Gauge
```

as a manufactured-product ingredient.

### Mag Pressure Tank

Change Aluminum quantity from:

```text
1
```

to:

```text
2
```

### No other semantic recipe changes

The following are source/canonical spelling changes only and must not change stable identity:

```text
Aluminium -> Aluminum
```

The canonical product-name correction:

```text
Substrate Molecular Sieve -> Substrate Molecule Sieve
```

changes product display text, not ProductId or recipe identity.

---

## Deterministic recipe output ordering

Do not let xEdit/source row order leak into runtime presentation.

Normalize recipe emission deterministically.

Preferred rule from the audit:

1. products in existing catalogue/stable product order;
2. ingredients sorted with resources before products;
3. then stable catalogue/display order.

The exact implementation can vary if it preserves current intended presentation and produces deterministic diffs, but document and test the chosen rule.

Avoid unrelated ingredient-array reorder noise.

---

## Bespoke metadata validation

Validate `item-tracker-metadata.csv` strictly.

Required rules:

- exact header/schema;
- exact `SourceFile` sentinel;
- exact `ExtractTimestamp` sentinel;
- `ItemType` exactly `organic` or `product`;
- valid uppercase eight-hex `ItemFormID`;
- nonblank `ItemEditorID`;
- nonblank `CanonicalName`;
- valid nonblank explicit `ItemId`;
- nonblank `ShortName`;
- `TrackerRarity` in the allowed five-tier set;
- unique `(ItemType, ItemFormID)`;
- unique `(ItemType, ItemId)`;
- unique ShortName within each namespace;
- exact canonical EditorID/name agreement after FormID join;
- `DisplayNameOverride` blank unless intentionally different from canonical name;
- reject override equal to canonical name.

Current combined 60-row metadata is expected to have no cross-namespace abbreviation collision. If the implementation enforces cross-namespace uniqueness, document it. If it only warns/asserts for Search-for-Items ambiguity, document that instead.

---

## Retire dead abbreviation rows

Do not migrate these historical rows into any catalogue or alias table:

```text
None / Non
Toxin Agent / TxA
Unique / Unq
```

They are not current IRES resource records.

They should disappear with `abbreviations.csv`.

Do not invent FormIDs for them.

---

## Expected generated-output behavior

### `public/reference-data/product-recipes.json`

Expected semantic changes only:

1. Austenitic Manifold gains Reactive Gauge ×1.
2. Mag Pressure Tank Aluminum quantity becomes 2.

All stable IDs remain unchanged.

### `public/reference-data/products.json`

Expected semantic change:

```text
substrate-molecular-sieve.name
```

changes from:

```text
Substrate Molecular Sieve
```

to:

```text
Substrate Molecule Sieve
```

All other product fields should remain semantically stable.

### `public/reference-data/resources.json`

Expected to remain semantically unchanged and, if deterministic output is preserved, byte-for-byte unchanged.

In particular:

- `aluminium` remains stable;
- `gastronomic-delight` remains stable;
- visible `Gastronomic Delight` remains unchanged.

### Other generated reference data

Expected semantically unchanged:

- systems;
- bodies;
- body-resources;
- biomes;
- body-biomes;
- inorganic occurrences;
- species;
- planet-species;
- organic occurrences;
- organic farming profiles.

If any unexpected semantic diff appears, stop and investigate before accepting it.

---

## Tests to add/update

Add focused tests for the new source and build invariants.

At minimum cover:

### Canonical recipe parsing

- exact header validation;
- missing/extra column rejection;
- malformed FormID rejection;
- inconsistent timestamp rejection;
- conflicting product identity tuple;
- conflicting recipe identity tuple;
- conflicting ingredient identity tuple;
- duplicate product/ingredient pair;
- invalid quantity;
- multiple recipe FormIDs for one product;
- one recipe assigned to multiple products;
- self-edge/cycle rejection.

### Product metadata/crosswalk

- exact 30-product canonical coverage;
- explicit stable ProductIds;
- FormID `00202781` -> stable `substrate-molecular-sieve`;
- canonical visible name `Substrate Molecule Sieve`;
- `SMS` preserved;
- no network schema change.

### Organic metadata/crosswalk

- exact 30-organic metadata coverage;
- canonical FormID/EditorID/name assertions;
- FormID `0007782F` -> stable `gastronomic-delight`;
- runtime display `Gastronomic Delight`;
- removal of old name alias path without output regression.

### Ingredient resolution

- all current inorganic ingredient FormIDs resolve uniquely;
- all current organic ingredient FormIDs resolve uniquely;
- all current product ingredient FormIDs resolve uniquely;
- each ingredient resolves to exactly one population;
- product-as-ingredient path works by FormID.

### Legacy compatibility cleanup

- canonical Aluminum FormID resolves to stable `aluminium`;
- recipe generation no longer depends on the `Aluminium` compatibility map;
- unrelated localization/reference-name behavior for `aluminium` remains intact.

### Bespoke metadata sentinels

Validate exact:

```text
SourceFile = BESPOKE - NO SOURCE FILE
ExtractTimestamp = 9999-12-31 00:00:00
```

Include near-miss failures so the sentinels remain deliberate conventions.

### Abbreviation / metadata integrity

- no duplicate ShortName within `product`;
- no duplicate ShortName within `organic`;
- preserve all current 60 real abbreviations;
- the three historical abbreviation-only rows do not become catalogue records.

### Reviewed output changes

Add an expected-difference regression that proves:

- exactly one added recipe edge: Austenitic Manifold -> Reactive Gauge ×1;
- exactly one quantity change: Mag Pressure Tank -> Aluminum 1 -> 2;
- no removed recipe edges;
- no substituted recipe edges;
- no unrelated product/resource ID changes.

Do not encode all 90 recipe rows in brittle tests if a smaller invariant/difference fixture is sufficient.

---

## Documentation updates

Update current documentation to reflect the completed architecture.

At minimum:

### `docs/ARCHITECTURE.md`

Document:

- canonical Industrial Workbench source;
- FormID-keyed recipe/product joins;
- canonical product identity backbone;
- canonical organic identity reduction;
- `item-tracker-metadata.csv`;
- stable app IDs as tracker compatibility policy;
- bespoke provenance sentinels;
- COBJ identity retained source-only;
- runtime JSON remains lean.

### `docs/DOMAIN-RULES.md`

Update only where current recipe/reference semantics are described.

Preserve:

- quantities are canonical base-game facts;
- stable app IDs are persisted identity;
- no gameplay-rule expansion.

### `README.md`

Update the reference-data summary so it no longer describes product/organic dictionaries in their retired role.

### `docs/BACKLOG.md`

Remove or rewrite completed language about:

- possible replacement of curated dictionaries with game-derived extracts;
- broader handmade reference-data ingestion cleanup where this parcel now resolves it.

Do not remove unrelated future reference-data/planner work.

### Build/source comments

Update comments in:

- `scripts/build-reference-data.mjs`;
- `scripts/biome-reference-data.mjs`;
- any new module;

so they no longer describe:

- legacy name-based recipe joins;
- old curated organic/product ownership;
- old organic name alias machinery.

### Historical briefs/audits

Do not rewrite historical implementation briefs merely to make them look current.

The audit report remains as historical/current design evidence.

---

## Implementation sequence

Recommended order:

1. Add regression fixtures/tests that pin current stable product/resource IDs and the two approved recipe differences.
2. Add `scripts/item-reference-data.mjs`.
3. Implement canonical recipe parser/validator.
4. Implement canonical product identity reduction.
5. Implement canonical organic identity reduction.
6. Create `reference-source/item-tracker-metadata.csv` with 60 rows.
7. Replace `reference-source/industrial-workbench.csv` with the supplied canonical extract intact.
8. Refactor product catalogue generation to use FormID + metadata.
9. Refactor organic catalogue generation to use FormID + metadata.
10. Refactor recipe generation to use FormID joins.
11. Pass the organic FormID crosswalk into biome/organic occurrence generation.
12. Remove:
    - recipe `Aluminium` name compatibility branch;
    - organic name alias branch.
13. Retire:
    - `manufactured-product-dictionary.csv`;
    - `organic-resource-dictionary.csv`;
    - `abbreviations.csv`.
14. Regenerate runtime reference data.
15. Review every generated diff against the expected impact above.
16. Update current architecture/domain/README/backlog/build comments.
17. Run the full verification suite.

Treat the source migration as one coherent valid state. Do not leave competing authorities in the final worktree.

---

## Verification requirements

Run at minimum:

```text
npm test
npm run build
npm run lint
npm run reference:build
git diff --check
```

Also run any dedicated reference-data test commands added or already present.

After `reference:build`, inspect generated diffs carefully.

The final report to the user must state:

- tests/build/lint result;
- whether reference generation succeeded;
- exact source files added/replaced/retired;
- exact generated semantic changes;
- confirmation that stable app IDs were preserved;
- confirmation that runtime JSON contracts were unchanged;
- confirmation that no network schema migration occurred;
- any unexpected deviations or unresolved issue.

Do not commit or push unless explicitly instructed.

---

## Acceptance criteria

This parcel is complete when all of the following are true:

- the repository uses the supplied canonical 13-column Industrial Workbench extract;
- recipe joins use FormIDs, not English names;
- recipe COBJ identity is validated but remains source-only;
- `item-tracker-metadata.csv` exists with 60 rows and approved schema;
- all surviving bespoke rows use exact sentinels:
  - `BESPOKE - NO SOURCE FILE`
  - `9999-12-31 00:00:00`
- all existing ProductIds and ResourceIds are preserved;
- `Substrate Molecule Sieve` is the visible canonical product name;
- `substrate-molecular-sieve` remains the stable ProductId;
- `Gastronomic Delight` remains the tracker display name for canonical `Gastro Delight`;
- `abbreviations.csv` is retired;
- the two old organic/product dictionaries are retired;
- the three non-resource abbreviation-only rows are not migrated;
- the recipe-specific `Aluminium` compatibility branch is removed;
- the organic name alias is removed;
- `product-recipes.json` has exactly the two approved semantic recipe corrections;
- `products.json` has the approved Substrate visible-name correction;
- `resources.json` remains semantically unchanged;
- runtime JSON contracts are unchanged;
- network/persistence schema is unchanged;
- documentation describes the new authority/provenance model;
- all verification checks pass.
