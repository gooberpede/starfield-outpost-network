# Canonical Industrial Workbench Recipes and Handmade Reference-Data Audit

## 1. Executive summary

The supplied `industrial-workbench.csv` is accessible at
`D:\tools\xEdit.4.1.5p\Edit Scripts\industrial-workbench.csv` and is a valid
candidate canonical extract. It has the required 13-column schema, 90 rows, 30
product FormIDs, 30 recipe FormIDs, 55 ingredient FormIDs, one timestamp
(`2026-09-11 13:11:31`), `Starfield.esm` provenance throughout, and positive
integer quantities from 1 through 4. Its identity tuples are internally
consistent and every ingredient resolves uniquely to an existing canonical
population.

The migration can preserve all persisted `ResourceId` and `ProductId` values and
all three runtime JSON contracts. No network schema migration is needed. The
canonical recipe extract should become the manufactured-product identity
backbone and the recipe relationship source. Product and ingredient joins should
use FormIDs; EditorIDs and names should be assertions. Recipe COBJ identity
should be validated at build time but not copied into runtime JSON or a new
general COBJ catalogue.

The legacy and canonical recipes differ in only two runtime facts after
crosswalking both sources to stable application identity:

- Austenitic Manifold gains `1 × Reactive Gauge`.
- Mag Pressure Tank changes from `1 × Aluminum` to `2 × Aluminum`.

Three legacy `Aluminium` spellings become canonical `Aluminum` without changing
the stable resource ID `aluminium`. Four recipe rows identify the product as
canonical `Substrate Molecule Sieve`, while the current catalogue calls it
`Substrate Molecular Sieve`; its stable application ID must remain
`substrate-molecular-sieve`.

`abbreviations.csv` has no active code or build consumer. Its 30 product rows and
30 ordinary organic rows exactly duplicate the live dictionaries, including
every `ShortName`. Its three extra rows (`None`, `Toxin Agent`, and `Unique`) are
known historical/non-resource labels, do not occur in the current canonical
organic extract, and must not become catalogue items. Retire the file.

The smallest clear surviving handmade surface is one typed, item-grain tracker
metadata file covering the 30 manufactured products and 30 organic resources.
It should explicitly pin stable application IDs, abbreviations, tracker rarity,
and the one currently required organic display-name override. Canonical identity
columns in that file are diagnostic assertions copied from canonical sources,
not a second authority. This consolidates the two live handmade dictionaries
without conflating them with recipe facts or canonical extracts.

## 2. Current source inventory and dependency map

### Active data path

```text
inorganic-resource-dictionary.csv (canonical IRES)
              +
inorganic-resource-tracker-policy.csv (tracker policy / stable ResourceId)
              ├──────────────┐
organic-resource-dictionary.csv (handmade catalogue) ── buildResources()
              │              │
biome-organic-resources.csv (canonical occurrence-grain identity)
              │              ├─> resources.json and occurrence relations
              │              │
manufactured-product-dictionary.csv (handmade catalogue) ─> buildProducts()
              │                                      └────> products.json
              │
industrial-workbench.csv (legacy name-grain recipes)
              └────────────── buildProductRecipes() ──────> product-recipes.json

public/reference-data/*.json
              └─> referenceDataLoader.ts
                    ├─> Search for Items
                    ├─> Planned Supply
                    ├─> manufacturing matrix/editor
                    ├─> availability/provenance calculations
                    └─> validation

abbreviations.csv ──> no active consumer
```

### File-by-file findings

| File | Current reader / role | Current grain | Duplicated or unique content |
|---|---|---|---|
| `reference-source/industrial-workbench.csv` | `scripts/build-reference-data.mjs::buildProductRecipes()` | One product-name/ingredient-name relationship | Only recipe source, but identity is name-based and 2 facts are wrong |
| `reference-source/manufactured-product-dictionary.csv` | `buildProducts()` | One manufactured product | Supplies all current product names, generated IDs, short names, and tracker rarity; all 30 products also occur in the canonical recipe extract |
| `reference-source/organic-resource-dictionary.csv` | `buildResources()`; indirectly `buildBiomeData()` through the built catalogue | One logical organic resource | Supplies all current organic application IDs, display names, short names, and rarity; all 30 canonical identities also occur in the organic occurrence extract |
| `reference-source/abbreviations.csv` | No code/build/test reader; only historical documentation mentions | One typed display label | Duplicates 60 live short names; only `None`, `Toxin Agent`, and `Unique` are unique |
| `reference-source/inorganic-resource-dictionary.csv` | `inorganic-resource-data.mjs`, then the main and biome builders | One canonical inorganic IRES | Canonical identity/facts; not part of the handmade consolidation |
| `reference-source/inorganic-resource-tracker-policy.csv` | `inorganic-resource-data.mjs` | One canonical inorganic FormID | Pins stable IDs and tracker policy; remains justified |
| `reference-source/biome-organic-resources.csv` | `build-reference-data.mjs` and `biome-reference-data.mjs` | One planet/biome/species occurrence | Contains the only current canonical organic IRES FormID/EditorID/name population, repeated at occurrence grain |

Repository search found no external script or documented manual workflow that
still consumes `abbreviations.csv`. Git history shows it arrived with the initial
commit and has no later independent maintenance. Historical implementation
briefs explicitly superseded its catalogue role with the two dictionaries.

The browser never reads source CSVs. It loads generated JSON via
`src/data/referenceDataLoader.ts`. `ResourceReference`, `ProductReference`, and
`ProductRecipeReference` are the runtime contracts. Saved networks and cargo
items store stable IDs, not names, abbreviations, rarity, FormIDs, EditorIDs, or
recipes.

## 3. Canonical Industrial Workbench extract assessment

The candidate was identified by content, not filename. Its exact headers are:

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

Observed checks:

| Invariant | Result |
|---|---:|
| Rows | 90 |
| Distinct product FormIDs | 30 |
| Distinct recipe FormIDs | 30 |
| Distinct ingredient FormIDs | 55 |
| Product/recipe/ingredient source values | `Starfield.esm` only |
| Extract timestamps | One: `2026-09-11 13:11:31` |
| Quantity range | 1–4, all positive integers |
| Product identity tuple conflicts | 0 |
| Recipe identity tuple conflicts | 0 |
| Ingredient identity tuple conflicts | 0 |
| Products with multiple recipe FormIDs | 0 |
| Recipe FormIDs assigned to multiple products | 0 |
| Duplicate product/ingredient pairs | 0 |

The extract is suitable as both the recipe source and the canonical identity
backbone for the current 30-product Industrial Workbench catalogue. It is not a
general catalogue of every possible COBJ or manufactured item, and should not be
presented as one.

The current builder cannot adopt it directly. `buildProductRecipes()` expects
`Product,Ingredient,Quantity`, looks products up by English name, looks
ingredients up by resource/product English name, and contains an explicit
`Aluminium -> aluminium` recipe compatibility map. `buildProducts()` separately
generates product IDs from handmade names. Both paths must change together so
FormID becomes the join key before canonical naming is allowed to influence
display text.

Ingredient identity resolved as follows:

| Population | Distinct ingredient FormIDs | Recipe rows |
|---|---:|---:|
| Manufactured products in the same extract | 17 | 32 |
| Canonical inorganic dictionary | 30 | 45 |
| Canonical organic occurrence identity | 8 | 13 |
| Unresolved | 0 | 0 |
| Ambiguous across populations | 0 | 0 |

The product dependency graph is acyclic. That is useful as a source sanity check,
although runtime manufacturing feasibility already uses a fixed-point resolver
and should not depend on CSV order.

Recipe COBJ fields should remain source-only. A general COBJ dictionary would
add a source and abstraction without a consumer: runtime manufacturing, search,
validation, persistence, and import/export identify recipes by output
`ProductId`, not COBJ. Validate each `RecipeFormID`/`RecipeEditorID` pair and its
one-product ownership in the canonical parser, then discard the COBJ fields when
emitting `product-recipes.json`.

## 4. Legacy-vs-canonical recipe difference analysis

The comparison below crosswalks both files to `{type, stable application ID}`.
That avoids treating spelling or display-name changes as new items.

| Product | Ingredient | Legacy | Canonical | Classification | Runtime effect |
|---|---|---:|---:|---|---|
| Austenitic Manifold | Reactive Gauge | absent | 1 | Added row / corrected ingredient | Add `{type: product, id: reactive-gauge, quantity: 1}` |
| Mag Pressure Tank | Aluminum | 1 | 2 | Corrected quantity | Change quantity from 1 to 2 for resource ID `aluminium` |
| Adaptive Frame | Aluminium → Aluminum | 1 | 1 | Corrected spelling/name only | None; remains resource ID `aluminium` |
| Mag Pressure Tank | Aluminium → Aluminum | 1 | 2 | Corrected spelling plus corrected quantity | Quantity change above; identity unchanged |
| Reactive Gauge | Aluminium → Aluminum | 2 | 2 | Corrected spelling/name only | None; remains resource ID `aluminium` |
| Substrate Molecular Sieve → Substrate Molecule Sieve | Four unchanged ingredients | unchanged | unchanged | Corrected product identity/name | Keep `substrate-molecular-sieve`; recommended runtime display-name change is described below |

There are no removed rows, corrected ingredient substitutions, or other quantity
changes. The row-count difference (89 to 90) is completely explained by the new
Austenitic Manifold input.

Canonical extract order should not become user-facing recipe order by accident.
The legacy source is effectively arranged by product and ingredient display
name, whereas xEdit row order differs for several products. The implementation
should explicitly emit products in catalogue order and ingredients in a stable
presentation order (resource before product, then stable catalogue/display
order). With that normalization, unrelated ingredient-array reorderings will not
obscure the two reviewed semantic recipe changes.

## 5. Manufactured-product identity and catalogue analysis

The legacy dictionary and canonical extract have exact 30-product coverage after
accounting for one name discrepancy:

```text
00202781
  canonical: Substrate Molecule Sieve
  legacy/runtime: Substrate Molecular Sieve
  stable ProductId: substrate-molecular-sieve
```

All other canonical product names match the handmade dictionary. The canonical
extract supplies product FormID, EditorID, name, and source provenance, so the
handmade dictionary should stop owning those facts. It does not supply a
canonical rarity field. Product EditorID `Tier01`/`Tier02`/`Tier03` text does not
map one-to-one to the current five tracker rarity values and is not a safe
rarity contract. `ShortName`, stable `ProductId`, and tracker rarity must
therefore remain explicit tracker metadata.

The future join should be:

```text
canonical ProductFormID
    -> exact product tracker-metadata row
    -> stable ProductId
    -> ProductReference
```

Do not call `createNameId(ProductName)` for migrated products. The metadata row
must explicitly pin all 30 current IDs. That is how corrected canonical names
remain compatible with stored networks.

### Substrate name trace

- Current generated product: `id = substrate-molecular-sieve`,
  `name = Substrate Molecular Sieve`, `shortName = SMS`, `rarity = unique`.
- Current generated recipe and every recipe-as-ingredient edge use ProductId,
  not the name.
- Persisted manufacturing entries, Planned Supply entries, cargo pad selections,
  cargo links, Undo/Redo snapshots, browser storage, and JSON import/export use
  the namespaced ID.
- Search for Items builds its search text from the runtime product `name` and
  `shortName`; it does not currently have product aliases.
- Manufacturing and Planned Supply render names through
  `getReferenceDisplayName('product', id, product.name, locale)`. There is no
  current product localization override.
- Tests and older audit/design prose contain the legacy text, but no production
  logic keys on it.

Recommendation: emit canonical `Substrate Molecule Sieve` as the runtime
fallback name while retaining `substrate-molecular-sieve` and `SMS`. This makes
canonical source truth visible without a persistence change. No legacy alias is
needed for import/export or domain behavior. If product direction requires the
old full phrase to remain searchable, implement a sparse search alias keyed by
the stable ProductId; do not put the old spelling back into identity joins and
do not add a general runtime alias field solely for this one case. The default
recommendation is not to add that alias because prefix search for `Substrate
Mol` and abbreviation search for `SMS` remain available.

## 6. Organic-resource identity and catalogue analysis

`biome-organic-resources.csv` contains 30 distinct resolved organic resource
FormIDs, 30 EditorIDs, and 30 names from `Starfield.esm`. Every current handmade
organic dictionary row crosswalks unambiguously. There is one name assertion
difference:

```text
0007782F / ResOrgUniqueGastronomic
  occurrence source: Gastro Delight
  current logical/display resource: Gastronomic Delight
  stable ResourceId: gastronomic-delight
```

The current builder resolves that difference through
`ORGANIC_RESOURCE_NAME_ALIASES`. After the metadata source is FormID-keyed, the
name-based build alias can be removed: FormID `0007782F` maps directly to
`gastronomic-delight`, and the metadata can carry an explicit tracker display
override `Gastronomic Delight`. This preserves `resources.json`, UI display,
Search for Items, and stored IDs while keeping `Gastro Delight` as a canonical
source assertion.

The organic occurrence source is sufficient for the current catalogue identity
crosswalk. It is occurrence-grain rather than catalogue-grain, so the builder
must first reduce it to a canonical organic identity index and fail if repeated
FormID/EditorID/name/source facts disagree. All 30 current resources pass that
check. A future non-occurring organic resource would not appear in this source;
if the tracker later needs one, obtain a dedicated canonical organic IRES
catalogue rather than inventing an identity.

The occurrence extract does not carry an explicit canonical rarity field.
Rarity-like text embedded in EditorIDs is not a stable schema. Therefore current
organic rarity remains tracker-authored metadata. `ShortName` also remains
tracker-authored. Stable `ResourceId` must be explicit rather than regenerated
from canonical or display names.

## 7. `abbreviations.csv` consumer/retirement analysis

`abbreviations.csv` is dead as an input:

- no application, script, test, package command, or current build path reads it;
- all 30 product rows match `manufactured-product-dictionary.csv` exactly by
  name and short name;
- 30 of 33 organic rows match `organic-resource-dictionary.csv` exactly;
- there are no short-name mismatches or duplicate short names in either live
  namespace (and no current cross-namespace collision);
- no documented current manual/export workflow requires the file.

The three abbreviation-only rows are not catalogue records:

| Row | Evidence | Disposition |
|---|---|---|
| `None / Non` | Historical missing-resource label; absent from the current organic source and runtime catalogue | Drop with file |
| `Toxin Agent / TxA` | Historical/intermediate label mapped conceptually to real resource `Toxin`; absent from current source | Drop; do not alias or create a FormID |
| `Unique / Unq` | Historical ambiguous occurrence classification, not an IRES identity | Drop; rarity remains metadata, not an item |

This agrees with the earlier reference-enrichment brief, which explicitly
classifies these three values as non-resources. They have zero matches as
resource names, species display names, or any cell value in the current organic
extract. Retiring `abbreviations.csv` therefore changes neither generated JSON
nor an evidenced workflow.

## 8. Canonical vs tracker-authored field ownership

| Field/concept | Ownership | Authority / rule |
|---|---|---|
| Product FormID, EditorID, canonical name | Canonical identity/fact | Canonical Industrial Workbench extract |
| Recipe FormID, EditorID, source, quantity | Canonical identity/fact | Canonical Industrial Workbench extract; validated, with only relationship and quantity emitted |
| Ingredient FormID, EditorID, canonical name | Canonical identity/fact | Recipe extract, asserted against the canonical item population |
| Organic FormID, EditorID, canonical source name | Canonical identity/fact | Reduced identity index from `biome-organic-resources.csv` |
| Inorganic identity/name/source facts | Canonical identity/fact | `inorganic-resource-dictionary.csv` |
| Stable `ProductId` / organic `ResourceId` | Tracker compatibility policy | Surviving metadata file; must preserve all current IDs |
| `ShortName` for products/organics | Tracker-authored presentation metadata | Surviving metadata file |
| Product/organic five-tier runtime rarity | Tracker-authored presentation metadata for now | Surviving metadata file; available canonical extracts do not expose a reliable field |
| `Gastronomic Delight` display override | Tracker-authored presentation/localization metadata | Surviving metadata file, keyed by FormID/stable ID |
| `SourceFile`, `ExtractTimestamp` on canonical extracts | Provenance | Extractor output |
| Bespoke source/timestamp sentinels | Provenance | Exact constants described below |

Canonical identity columns repeated in the bespoke file are assertions for
reviewability and mismatch diagnostics. The builder must compare them to the
canonical source and must not treat them as an independent canonical authority.

## 9. Recommended surviving handmade source schema(s)

### Recommended: one typed metadata file

Create `reference-source/item-tracker-metadata.csv` at one row per logical
catalogue item, with exactly 60 rows in the first migration (30 `organic`, 30
`product`):

```csv
SourceFile,ExtractTimestamp,ItemType,ItemFormID,ItemEditorID,CanonicalName,ItemId,ShortName,TrackerRarity,DisplayNameOverride
```

Field semantics:

| Column | Class | Rule |
|---|---|---|
| `SourceFile` | Provenance | Exact bespoke sentinel on every row |
| `ExtractTimestamp` | Provenance | Exact settled timestamp sentinel on every row |
| `ItemType` | Tracker schema/discriminator | Exactly `organic` or `product` |
| `ItemFormID` | Canonical identity assertion | Eight uppercase hexadecimal characters; join key to canonical source |
| `ItemEditorID` | Canonical identity assertion | Must exactly match the joined canonical record |
| `CanonicalName` | Canonical fact assertion | Must exactly match the joined canonical source name |
| `ItemId` | Tracker compatibility policy | Existing stable `ResourceId` or `ProductId`; never generated from name |
| `ShortName` | Tracker presentation metadata | Required and unique in the relevant namespace |
| `TrackerRarity` | Tracker presentation metadata | One of `common`, `uncommon`, `rare`, `exotic`, `unique` |
| `DisplayNameOverride` | Tracker presentation metadata | Blank by default; initially `Gastronomic Delight` for organic FormID `0007782F` |

This grain is correct because both populations need the same compatibility and
presentation fields and are already disambiguated at runtime by `CargoItem.type`.
It removes two nearly identical schemas and makes cross-namespace abbreviation
checks straightforward.

The product row for `00202781` should assert canonical name `Substrate Molecule
Sieve`, pin `ItemId=substrate-molecular-sieve`, keep `ShortName=SMS` and
`TrackerRarity=unique`, and leave `DisplayNameOverride` blank under the
recommended canonical-display decision.

### Alternative: two reschematized metadata files

Keeping `organic-resource-tracker-metadata.csv` and
`manufactured-product-tracker-metadata.csv` would preserve separate ownership
and remove `ItemType`. It is valid but inferior here: the schemas, provenance
rules, parser rules, and maintenance workflow would be almost identical, and
there is no separate current owner or release cadence. Choose it only if a real
organizational workflow requires separate stewardship.

### Rejected: keep current dictionaries and merely retire abbreviations

This removes one dead file but leaves canonical names as handmade relational
keys, lacks provenance and FormIDs, and cannot safely absorb the Substrate name
correction. It does not meet the identity discipline of the brief.

## 10. Bespoke provenance sentinel recommendation

Use the exact token:

```text
BESPOKE - NO SOURCE FILE
```

It is more immediately understandable to a person inspecting a CSV than a
filename-like or abbreviated token. Spaces and the hyphen create no tooling
problem: CSV parsing already treats the value as a field, not a path, and the
implementation should compare it as an exact string. Quote CSV fields
consistently when generating or editing them.

Use the settled timestamp token exactly:

```text
9999-12-31 00:00:00
```

The pair means “tracker-authored row with no extraction event,” not “data
extracted in year 9999.” Define both as named constants in the parser module,
validate every bespoke row against them, and document them in architecture/build
documentation. Do not replace the timestamp with a nearby canonical extract
date during refreshes.

## 11. FormID crosswalk and validation design

### Build design

Introduce a focused build-time module (for example
`scripts/item-reference-data.mjs`) rather than growing the main orchestration
script further. It should:

1. parse and validate the canonical recipe CSV with exact headers;
2. reduce product rows to a product identity map keyed by `ProductFormID`;
3. reduce resolved organic occurrence rows to an identity map keyed by
   `ResourceFormID`;
4. parse and validate the typed tracker metadata file;
5. join metadata to the appropriate canonical population by FormID;
6. build product and organic runtime catalogues with explicitly pinned app IDs;
7. resolve every recipe ingredient by FormID across exactly one of the product,
   inorganic, or organic maps;
8. emit the existing lean runtime shapes.

`build-reference-data.mjs` should remain orchestration. The existing
`inorganic-resource-data.mjs` should continue to own inorganic canonical/policy
parsing. `biome-reference-data.mjs` should receive the completed organic
FormID-to-resource crosswalk, just as it already receives the inorganic
crosswalk, and can then remove `ORGANIC_RESOURCE_NAME_ALIASES`.

### Required validation

Canonical recipe parser:

- exact 13-column header order and exact column count;
- all required fields nonblank;
- FormIDs match uppercase eight-hex format;
- one consistent, syntactically valid extraction timestamp;
- source filenames nonblank and currently consistent with the joined canonical
  records (`Starfield.esm` for this population);
- one ProductFormID maps to exactly one source/EditorID/name tuple;
- one RecipeFormID maps to exactly one source/EditorID tuple and one product;
- all rows for a product agree on the recipe FormID;
- one IngredientFormID maps to exactly one source/EditorID/name tuple;
- no duplicate product/ingredient FormID pair;
- quantity is a positive safe integer;
- every product has at least one recipe row;
- product dependency graph has no self-edge or cycle (defensive source check).

Cross-source checks:

- exact FormID coverage between canonical products and product metadata;
- exact FormID coverage between the reduced 30-organic identity population and
  organic metadata;
- every inorganic ingredient resolves through the canonical inorganic
  dictionary and agrees on source, EditorID, and name;
- every organic ingredient resolves through the reduced organic canonical index
  and agrees on source, EditorID, and name;
- every manufactured ingredient resolves through the canonical product index and
  agrees with its product identity tuple;
- every ingredient resolves to exactly one population;
- excluded canonical inorganic resources cannot silently become recipe inputs
  without an explicit policy decision;
- the 30 product/30 recipe population remains exact for this extract, or a
  reviewed fixture is updated when the game-derived population legitimately
  changes.

Bespoke metadata checks:

- exact schema and exact bespoke provenance sentinels;
- valid `ItemType`, FormID, app-ID slug, and tracker rarity;
- unique `(ItemType, ItemFormID)` and `(ItemType, ItemId)`;
- exact EditorID and canonical-name agreement with the canonical join;
- nonblank unique short names within each namespace;
- report or reject cross-namespace short-name/name collisions according to the
  Search for Items ambiguity policy (the current combined 60 rows have none);
- reject an override equal to the canonical name, so overrides remain sparse and
  intentional.

Put invariant logic in the dedicated module, adversarial unit tests beside it,
and a small golden integration test around the full generated outputs. Do not
encode all 90 CSV rows in tests; use reviewed difference fixtures and invariant
counts.

## 12. Runtime and persistence compatibility

No runtime type or persisted schema change is necessary.

| Concern | Compatibility result |
|---|---|
| Existing `ResourceId` values | Preserve exactly, including `aluminium` and `gastronomic-delight` |
| Existing `ProductId` values | Preserve all 30 exactly, including `substrate-molecular-sieve` |
| `resources.json` contract | Preserve `{id,name,shortName,category,rarity,parentId,sortOrder,plannedSupplyPlacement}` |
| `products.json` contract | Preserve `{id,name,shortName,rarity}` |
| `product-recipes.json` contract | Preserve `{productId,ingredients:[{item:{type,id},quantity}]}` |
| Network schema | No change |
| Browser storage / import/export | No migration; stored references are stable IDs |
| Undo/Redo | No change; reference-data regeneration does not enter history |

Search, Planned Supply, cargo, manufacturing, validation, and provenance logic
all consume runtime IDs and catalogue records. None needs FormID, EditorID, COBJ
identity, or source provenance at runtime. Keep those fields out of runtime JSON.

Unknown IDs in existing saves retain the current validation/recovery behavior;
the source migration must not auto-correct or discard them.

## 13. Generated-output impact

### `product-recipes.json`

Semantic changes should be limited to:

1. add Reactive Gauge quantity 1 to Austenitic Manifold;
2. change Mag Pressure Tank's Aluminum quantity from 1 to 2.

The `Aluminium` source correction must still emit resource ID `aluminium`.
Recipe COBJ fields and canonical names remain source-only. Explicit stable
sorting should prevent xEdit row order from producing unrelated array-order
diffs.

### `products.json`

Under the recommended display decision, exactly one semantic field changes:

```text
substrate-molecular-sieve.name
  Substrate Molecular Sieve -> Substrate Molecule Sieve
```

Its ID, abbreviation, rarity, position, recipe ownership, and all stored
references remain unchanged. If product direction instead approves an explicit
legacy display override, `products.json` can remain byte-for-byte identical;
that should be a conscious presentation choice, not a consequence of joining by
the old name.

### `resources.json`

It should remain semantically and byte-for-byte unchanged. Organic stable IDs,
short names, rarity, and display names remain pinned; `Gastronomic Delight` is
preserved as an explicit display override. The recipe spelling change does not
alter resource catalogue output.

### Other generated outputs

Biome, occurrence, species, body-resource, system, and body JSON should remain
semantically unchanged. Their textual output should also remain unchanged if the
organic crosswalk refactor preserves deterministic ordering.

## 14. Test strategy

Add focused tests for:

- exact canonical recipe header validation and malformed/missing column errors;
- timestamp/source/FormID/quantity validation;
- conflicting product, recipe, and ingredient identity tuples;
- one recipe per product and one product per recipe FormID;
- duplicate ingredient pairs and product-recipe cycles;
- all 30 current canonical products resolving to explicit legacy ProductIds;
- all 30 inorganic, 8 organic, and 17 product ingredient FormIDs resolving to
  exactly one population;
- product-as-ingredient crosswalk behavior;
- exact canonical-to-metadata coverage for 30 products and 30 organics;
- `00202781` mapping canonical `Substrate Molecule Sieve` to stable
  `substrate-molecular-sieve` and `SMS`;
- `000057D6` mapping canonical `Aluminum` to stable `aluminium`;
- removal of only the recipe `Aluminium` name compatibility branch;
- removal of the organic name alias after FormID crosswalking while preserving
  `gastronomic-delight` and display `Gastronomic Delight`;
- exact bespoke source and timestamp sentinels, including near-miss rejection;
- app-ID and abbreviation uniqueness in each namespace and current absence of
  cross-namespace abbreviation collisions;
- reviewed expected differences: one added recipe edge and one quantity change,
  with no removed or substituted edges;
- generated output contracts remaining unchanged;
- product display-name decision and search behavior for `Substrate Molecule
  Sieve` and `SMS`;
- existing saved/imported manufacturing, cargo, and Planned Supply references to
  `substrate-molecular-sieve` continuing to resolve;
- no network schema-version change.

Retain the existing inorganic regression test that proves legacy recipe
`Aluminium` resolution until the canonical recipe migration lands. In the same
implementation commit, replace it with FormID-based assertions; do not leave a
test requiring dead compatibility code.

For implementation verification, run `npm test`, `npm run build`, the new
reference-data tests, a clean `npm run reference:build` followed by reviewed JSON
diffs, and `git diff --check`. Run `npm run lint` because the builder/refactor is
broad and lint-sensitive.

## 15. Documentation changes

During implementation:

- update `docs/ARCHITECTURE.md` to show canonical recipes, the typed tracker
  metadata source, FormID crosswalks, organic identity reduction, stable IDs,
  and source-only COBJ provenance;
- update `README.md` reference-data summary so it no longer says the organic and
  product dictionaries retain their current curated roles;
- update `docs/DOMAIN-RULES.md` only where recipe/reference semantics are
  described: quantities remain canonical base-game facts and IDs remain the
  persisted identity; no gameplay rule changes are needed;
- update `docs/BACKLOG.md` to remove/rewrite the now-completed “possible
  replacement of curated dictionaries” and broader handmade-ingestion language;
- revise comments in `scripts/build-reference-data.mjs` and
  `scripts/biome-reference-data.mjs` that describe name-based recipes, curated
  organic ownership, or the organic name alias;
- add a concise provenance convention near the source/build architecture,
  explicitly documenting both bespoke sentinels;
- update tests/audits/design examples that assert the old Substrate display name
  only where they describe current output; historical implementation briefs
  should remain historical.

`docs/UX-DESIGN.md` needs no structural change. Its rule that abbreviations come
from reference data remains correct. A one-name display correction does not
change the interaction design.

## 16. Recommended implementation sequence

1. Add a reviewed expected-difference fixture for the two semantic recipe
   changes and snapshot the current stable product/resource ID sets.
2. Add `item-reference-data.mjs` parsers and adversarial tests for the canonical
   recipe and bespoke metadata schemas.
3. Create the 60-row typed metadata file from the two current dictionaries,
   enriching rows with canonical identity assertions and explicit current IDs.
4. Replace the repository's legacy `industrial-workbench.csv` with the supplied
   canonical extract intact.
5. Build canonical product and organic identity indexes; validate exact metadata
   coverage and all discrepancy assertions.
6. Refactor product/resource catalogue construction to consume the FormID-keyed
   metadata while preserving IDs and current tracker rarity/abbreviations.
7. Refactor recipe generation to join output and ingredients by FormID, validate
   COBJ identity, and deterministically sort runtime ingredients.
8. Pass the organic FormID crosswalk into biome generation; remove the now-dead
   organic name alias. Remove the recipe `Aluminium` compatibility branch, but
   retain localization's `aluminium` display overlay.
9. Retire the two old dictionaries and `abbreviations.csv` in the same coherent
   source migration so there is no interval with competing authority.
10. Regenerate all runtime JSON, verify only the intentional semantic changes,
    and run the full test/build/lint/whitespace checks.
11. Update architecture, README, backlog, source comments, and current-output
    tests/docs.

This sequence is one implementation batch from the perspective of generated
data: intermediate commits or worktree states should not be treated as valid
release states unless the old build remains runnable.

## 17. Risks / unresolved questions

1. **Substrate display spelling.** The extract is authoritative for canonical
   game text, so this audit recommends displaying `Substrate Molecule Sieve`.
   The legacy wording may be more familiar to existing users. Keeping it would
   require an explicit `DisplayNameOverride`; it must not affect the ID or join.
2. **Organic catalogue completeness.** The current occurrence extract covers all
   30 tracked organic resources, but occurrence data cannot prove that no other
   non-occurring IRES exists. This is sufficient for current behavior, not a
   substitute for a future general organic IRES catalogue.
3. **Rarity remains bespoke.** Neither supplied canonical source has an explicit
   reliable rarity fact suitable for the current five-tier runtime field.
   EditorID tokens are evidence, not a schema. A future canonical IRES extract
   with a validated rarity field could retire `TrackerRarity` selectively.
4. **Canonical refreshes may change population.** Exact 30-product/30-recipe
   coverage is a current reviewed invariant. Future DLC or extractor expansion
   should fail loudly and require metadata/app-ID decisions, not silently mint
   IDs.
5. **Source order is unstable presentation input.** Without explicit runtime
   sorting, the new extract will create noisy and potentially visible ingredient
   order changes. Sorting must be part of the migration.
6. **No evidenced external abbreviation consumer.** Repository and history
   searches found none. If an undocumented personal tool reads
   `abbreviations.csv`, retirement would affect it; no repository evidence can
   validate such a workflow.

None of these risks requires a runtime or persisted schema change.

## 18. Exact proposed file disposition table

| File | Disposition | Reason |
|---|---|---|
| `reference-source/industrial-workbench.csv` | **REPLACE WITH CANONICAL EXTRACT** | Adopt supplied 13-column FormID/COBJ/ingredient source; do not reconstruct or normalize it in place |
| `reference-source/manufactured-product-dictionary.csv` | **MERGE INTO `reference-source/item-tracker-metadata.csv`** | Preserve stable ProductIds, short names, and tracker rarity; canonical identity/name moves to recipe extract |
| `reference-source/organic-resource-dictionary.csv` | **MERGE INTO `reference-source/item-tracker-metadata.csv`** | Preserve stable ResourceIds, short names, tracker rarity, and explicit display override; canonical identity comes from organic occurrence data |
| `reference-source/abbreviations.csv` | **RETIRE** | No consumer; 60 duplicate rows and 3 confirmed non-resource historical labels |
| `reference-source/item-tracker-metadata.csv` | **NEW FILE** | One typed FormID-keyed bespoke policy/metadata source for products and organics |
| `reference-source/inorganic-resource-dictionary.csv` | **KEEP AS-IS** | Existing canonical inorganic identity/fact source and ingredient crosswalk authority |
| `reference-source/inorganic-resource-tracker-policy.csv` | **KEEP AS-IS** | Existing stable inorganic ResourceId and tracker-policy authority |
| `reference-source/biome-organic-resources.csv` | **KEEP AS-IS** | Current canonical organic FormID/EditorID/name source; reduce repeated rows to an identity index during build |
| `reference-source/biome-inorganic-resources.csv` | **KEEP AS-IS** | Existing occurrence source; unrelated to handmade consolidation |
| `reference-source/planet-directory.csv` | **KEEP AS-IS** | Existing canonical body/system source; unrelated to this migration |
This audit intentionally makes no source migration, schema change, generated
data update, rename, or deletion. Those actions require a separate approved
implementation brief.
