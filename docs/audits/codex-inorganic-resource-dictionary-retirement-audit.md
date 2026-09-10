# Inorganic Resource Dictionary Retirement Audit

## 1. Executive conclusion

The handmade inorganic dictionary can be retired safely without a persisted-network schema migration, but it cannot be replaced by feeding the canonical CSV directly into the current five-column parser. The safe migration shape is:

```text
canonical ESM extract (source truth, retained intact)
        +
FormID-keyed tracker crosswalk/inclusion policy
        +
tracker-owned Planned Supply ordering/classification policy
        ↓
validated build-time resource model
        ↓
current stable application IDs and lean runtime JSON
```

All 45 current inorganic resources have an unambiguous canonical FormID match. Their existing application IDs can and should remain unchanged. The one intentional name exception is canonical `Aluminum` (`000057D6`) mapping to the persisted application ID `aluminium`. Existing IDs must be read from an explicit compatibility crosswalk, not regenerated from canonical or localized names.

The canonical extract contains 48 records. The three records outside the current 45-resource catalogue—X-Tech, Aqueous Hematite, and Caelumite—must remain in the canonical source but should not become ordinary selectable tracker resources merely because they were extracted. The current runtime model has no visibility/role field: every emitted resource automatically enters Search and, if inorganic, Planned Supply. Therefore the lowest-risk first migration is to classify all three explicitly and omit them from the ordinary runtime catalogue. X-Tech may instead be emitted during the migration only if a neutral, typed tracker-role/visibility seam and filtering at every catalogue consumer are implemented and tested at the same time; that is a larger change and is not required to retire the legacy dictionary.

Canonical `SNAMRarity` should remain source truth. The current five-value `Rarity` type should remain a tracker presentation classification rather than being expanded with `Everywhere` and `Special`: those values do not form extra rows in the established Planned Supply layout. The mapping must be explicit and tested (`Water: Everywhere -> common presentation tier`; `Helium-3: Special -> common presentation tier`), while singleton membership is an explicit tracker placement policy, not inferred from rarity or missing sort order.

No source-data question blocks the dictionary migration if Aqueous Hematite, Caelumite, and X-Tech are explicitly non-ordinary/deferred. Their gameplay roles remain unresolved by the supplied occurrence and recipe sources and do block exposing them as ordinary resources. X-Tech-specific availability, placement, DLC assumptions, skills, buffs, and UI remain a separate feature design.

## 2. Current legacy dependency map

### Direct source consumer

Only `scripts/build-reference-data.mjs` reads the legacy file directly:

- `INORGANIC_RESOURCE_DICTIONARY_SOURCE_FILE` resolves `reference-source/inorganic-resource-dictionary.csv`.
- `main()` loads it with the shared `loadCsvFile()` parser.
- `buildResources()` expects `Code`, `Resource`, `Rarity`, `ParentResource`, and `SortOrder`.
- `parseRarity()` accepts only `Common | Uncommon | Rare | Exotic | Unique` and converts these to lowercase runtime values.
- `parseOptionalSortOrder()` accepts blank or a positive integer.
- `createNameId()` slugs the English `Resource` name and currently creates the application ID.
- Parent resolution is an exact English-name join from `ParentResource` to `Resource`; it then emits the parent's app ID.
- Build validation checks unique names, generated IDs, and abbreviations; parent existence; parent rarity strictly lower than child rarity; parent cycles; and sibling sort-order uniqueness.
- `writeJson()` emits the resulting resource records into `public/reference-data/resources.json`.

`reference-source/abbreviations.csv` is not a current build input. Repository search found no code consumer. It contains 33 organic and 30 product rows and no inorganic rows. Inorganic abbreviations currently come only from legacy `Code`; organic and product abbreviations come from their respective dictionaries.

### Indirect build consumers

- `scripts/biome-reference-data.mjs::buildBiomeData()` receives the catalogue produced by `buildResources()`. Its `resolveResource()` builds an occurrence FormID-to-app-ID crosswalk indirectly by exact resource name, with `RESOURCE_NAME_ALIASES` translating `Aluminum` to `Aluminium`. It emits `inorganic-occurrences.json` and the compatibility `body-resources.json` using app IDs. Occurrence rarity is checked for consistency at occurrence grain but deliberately not emitted as catalogue rarity.
- `scripts/build-reference-data.mjs::buildProductRecipes()` resolves `industrial-workbench.csv` products and ingredients by exact catalogue English names. Three recipe rows currently say `Aluminium`, so changing the catalogue fallback name to canonical `Aluminum` breaks this join unless recipe resolution gains an explicit compatibility crosswalk.
- `public/reference-data/resources.json` is generated and checked in. It currently has 75 records: 45 inorganic and 30 organic.
- `scripts/biome-reference-data.test.mjs` loads the checked-in `resources.json` and tests occurrence joins and rejection behavior. It tests bad-name crosswalks, but not the dictionary parser or stable inorganic ID/FormID mapping. These script tests are not included in the repository's `npm test` command, which runs only `tests/*.test.ts`.

### Runtime consumers

- `src/data/referenceDataLoader.ts::loadReferenceData()` fetches `resources.json` as `ResourceReference[]`; it performs transport/JSON parsing but no runtime structural validation.
- `src/domain/referenceData.ts::ResourceReference` defines `id`, `name`, `shortName`, `category`, five-tier `rarity`, `parentId`, and `sortOrder`.
- `src/App.tsx` localizes every resource name and passes the whole catalogue to Planned Supply, the status matrix, and cargo editors. It separately builds Search from the unfiltered `ReferenceData.resources` array.
- `src/ui/components/PlannedSupplyEditor.tsx` is the only live consumer of `rarity`, `parentId`, and `sortOrder`. It uses rarity as vertical row, `parentId` as family topology, `sortOrder` for root/sibling order, and `root && sortOrder === null` to infer the special strip.
- `src/ui/itemSearch.ts::buildItemSearchCatalogue()` includes every runtime resource, uses localized/fallback names and `shortName`, and later sorts matches by match tier, localized display name, category, and stable ID.
- `src/ui/components/OutpostStatusMatrix.tsx` uses names/short names for presentation. Its inorganic rows come from occurrence availability plus already-persisted active routes, so catalogue-only resources with no occurrence do not automatically appear in the matrix.
- `src/ui/components/CargoExportsEditor.tsx` and `CargoPadsEditor.tsx` resolve names and short names for items already made available/planned or already persisted. They do not independently add every catalogue item.
- `src/domain/bodyResourceAvailability.ts` consumes occurrence app IDs, not family or rarity metadata.
- `src/domain/validation/rules/unknownReferenceDataId.ts` regards any resource ID present in `ReferenceData.resources` as known across local resources, active production, Planned Supply, and cargo exports. Other validation and availability logic compares opaque app IDs.
- `src/domain/validation/rules/interstellarCargoHelium3.ts` explicitly compares the stable ID `helium-3`; it is independent of rarity and display name.
- `src/localization/referenceNames.ts` applies sparse name overlays by stable ID. It already maps `aluminium` to US `Aluminum` and UK `Aluminium`.

`src/domain/resources.ts` is a small hard-coded resource sample using the same fields, including `aluminium`, but repository search found no import of it. It is dead/legacy duplication, not a source-file consumer; implementation should either remove it in a tightly scoped cleanup or update it if a hidden consumer is discovered.

Documentation currently describes the handmade dictionary as the master for identity, rarity, parent relationships, and order (`README.md`, `docs/ARCHITECTURE.md`, and `docs/DOMAIN-RULES.md`). Those descriptions will need correction when the migration is implemented.

## 3. Canonical extract inventory

The supplied file is `D:\tools\xEdit.4.1.5p\Edit Scripts\inorganic-resource-dictionary.csv`, extracted at `2026-09-10 20:37:10`. Its exact columns are:

```text
SourceFile
ExtractTimestamp
ResourceFormID
ResourceEditorID
ResourceName
ResourceShortName
SNAMRarity
ClassificationKeyword
EffectiveParentSourceFile
EffectiveParentFormID
EffectiveParentEditorID
EffectiveParentName
```

It contains 48 records: 47 from `Starfield.esm` and X-Tech from `SFBGS00D.esm`. In this extract, FormIDs, EditorIDs, names, and short names are each unique; every non-empty parent FormID resolves to another row.

Canonical rarity counts are: Common 8, Everywhere 1, Uncommon 9, Rare 10, Exotic 11, Unique 8, and Special 1. Classification keywords comprise 10 Common, 9 Uncommon, 10 Rare, 10 Exotic, 8 Unique, and one X-Tech-specific keyword. `SNAMRarity` and classification are not interchangeable: Water and Helium-3 have the Common classification keyword but `Everywhere`/`Special` SNAM values; Caelumite has a Unique classification keyword but `SNAMRarity = Exotic`; X-Tech uses its own keyword.

After treating Aluminum/Aluminium as the same logical resource, all 45 legacy rows match a canonical record. Material differences are:

| Fact | Legacy | Canonical |
|---|---|---|
| Catalogue size | 45 | 48 |
| Aluminum spelling | Aluminium | Aluminum (`000057D6`) |
| Additional records | none | X-Tech, Aqueous Hematite, Caelumite |
| Carboxylic Acids short name | `R-COC` | `R-COOH` |
| Water rarity | Common | Everywhere |
| Helium-3 rarity | Common | Special |
| Aldumite parent | Xenon | Caesium (`000057E0`) |
| Beryllium parent text | Aluminium | Aluminum (`000057D6`), same logical parent |

The occurrence extract has 7,780 rows and exactly 45 distinct inorganic FormIDs/names. All 45 resolve to the canonical dictionary. X-Tech, Aqueous Hematite, and Caelumite have zero biome or atmosphere occurrence rows. The occurrence extract has 1,721 Water rows, 488 Helium-3 rows, and 392 canonical `Aluminum` rows. It has no `Aluminium` rows.

The recipe source has 89 rows and uses names only. It has no X-Tech, Aqueous Hematite, or Caelumite ingredients. It does contain Aldumite once and legacy `Aluminium` three times; it contains no canonical `Aluminum` spelling.

The supplied sources therefore establish canonical identity and metadata for all 48 records, but do not establish ordinary outpost occurrence, extractability, recipe use, or other gameplay behavior for the three additional records.

## 4. Stable identity strategy

Use `ResourceFormID` as the canonical crosswalk key. It is the identity used by the canonical occurrence source and by parent relationships, and it remains stable across display/localization changes. `ResourceEditorID` is valuable for validation and diagnostics but should be a secondary assertion, not the primary join key: EditorIDs are descriptive source identifiers and the downstream occurrence data already supplies FormIDs. Names and short names must never be keys.

Introduce a tracker-owned, version-controlled crosswalk/policy keyed by FormID. It should explicitly associate at least:

```text
ResourceFormID -> stable application ResourceId + catalogue disposition
```

It may also carry tracker presentation classification and placement/order, or those may live in a second presentation-specific policy. Existing IDs should be pinned for all 45 current records. Do not call `createNameId()` for an already-known canonical FormID. A slug may be proposed for a genuinely new record, but it becomes stable only when deliberately admitted to the tracker policy.

The critical mapping is:

```text
000057D6 (canonical Aluminum) <-> aluminium (stable application ID)
```

The other 44 existing canonical names currently slug to their existing IDs, but they should still be pinned so future source renames cannot silently migrate identity. If IDs are reserved for the three deferred records, the natural candidates are `x-tech`, `aqueous-hematite`, and `caelumite`; reservation alone must not imply runtime visibility or gameplay eligibility.

All existing IDs can be preserved. No canonical conflict requires an ID change.

## 5. Canonical-to-runtime transformation

Recommended build flow:

1. Parse the canonical CSV using its exact 12-column schema and validate required values, timestamp consistency, uniqueness, and parent integrity.
2. Index canonical rows by normalized FormID and validate EditorID/name/short-name facts without treating them as identity.
3. Join each canonical FormID to explicit tracker policy. Reject an unclassified canonical row so a future extract cannot silently enter the UI.
4. Select only records whose policy disposition is currently runtime-eligible.
5. Build runtime records using pinned app ID; canonical `ResourceName` and `ResourceShortName`; `category: inorganic`; explicit tracker presentation rarity; parent resolved as `EffectiveParentFormID -> canonical row -> stable app ID`; and tracker-owned placement/order.
6. Validate that every emitted parent is also emitted, every current stable ID remains present, the graph is acyclic, and intended family/order invariants hold.
7. Pass the FormID-to-app-ID crosswalk into occurrence generation. Validate occurrence name and EditorID against the canonical row as consistency facts, but join by FormID.
8. Resolve legacy name-based recipe rows through a separate explicit source-name-to-app-ID compatibility map; do not make canonical fallback names double as recipe keys.
9. Emit lean JSON. Browser code continues to use app IDs.

The current runtime shape can remain mostly compatible. The cleanest semantic refinement is to stop overloading `sortOrder` as both special-strip membership and order. At minimum, derive the existing field from tracker policy rather than canonical data and add an explicit Planned Supply placement classification. A later cleanup can rename `sortOrder` to a surface-specific field such as `plannedSupplyOrder`; there is no evidence that a global resource order is needed.

## 6. Inclusion/exclusion policy

Recommended dispositions:

| Canonical class | Current disposition | Reason |
|---|---|---|
| Existing 45 ordinary inorganics | Include normally | Existing app identities, occurrences, recipes, and UX rely on them. |
| X-Tech | `special-deferred`; exclude from ordinary catalogue for the first migration | It is valid canonical data from `SFBGS00D.esm`, but has no occurrence or recipe rows and no implemented availability/UI rules. Emitting it without filtering leaks it into Search and Planned Supply. |
| Aqueous Hematite | Exclude/hidden | Canonical record exists, but supplied occurrence and recipe sources provide no ordinary outpost role. Including it would create a false universal Planned Supply/Search option. |
| Caelumite | Exclude/hidden | Same evidence gap as Aqueous Hematite; its SNAM/classification mismatch also argues against inferring treatment from a single field. |

“Exclude” means exclude from the current runtime selectable catalogue, not delete or edit the canonical row. Policy must be explicit, FormID-keyed, documented, and covered by leakage tests.

X-Tech can be represented in a broader runtime reference catalogue before its feature only if runtime records gain an explicit role/visibility field and Search, Planned Supply, unknown-ID validation, and any “all resources” consumers agree on its meaning. With the current single unfiltered `resources` array, it cannot be included safely without partially implementing behavior. The smaller migration is to retain it as validated source/policy data and defer runtime emission.

## 7. Rarity strategy

Keep two concepts:

```text
canonical SNAMRarity: source fact (Common/Everywhere/.../Special)
tracker presentation rarity: common/uncommon/rare/exotic/unique
```

Do not extend the shared runtime `Rarity` union with `everywhere` or `special`. `Rarity` is shared with organic resources/products and directly indexes five Planned Supply rows. Adding values would give Water/Helium-3 no grid row and would confuse source rarity with tracker layout.

The tracker mapping should be explicit and exhaustive. Ordinary values map directly. Water and Helium-3 should retain `common` as their current presentation tier for compatibility, even though the special strip does not use their tier; tests and documentation must state that this is a presentation mapping, not a correction to canonical source truth. X-Tech's canonical `Unique` can be retained in source/policy for its later feature, but rarity must not decide its availability or special placement. Caelumite must not be reclassified solely from either its `Exotic` SNAM or Unique classification keyword.

No current code outside Planned Supply consumes resource rarity. Build-time parent progression currently consumes the normalized tracker rarity. The canonical parent graph for the ordinary families still progresses through the five ordinary tiers; validate that fact after mapping rather than using it to overwrite source rarity.

## 8. Parent/family migration

Canonical parents should be joined only by `EffectiveParentFormID`. The parent row is then resolved through the FormID-to-app-ID crosswalk to emit `parentId`. `EffectiveParentName` and `EffectiveParentEditorID` are assertions/diagnostics, not join keys.

The supplied extract verifies:

```text
Aldumite 00005DF5 -> Caesium 000057E0
```

The current runtime incorrectly emits `aldumite.parentId = xenon`. Changing it to `caesium` affects only the Planned Supply family topology and generated resource metadata. It does not affect occurrence availability, Search matching, validation, recipes, persisted IDs, cargo, or production. In the Lithium family, the unique Aldumite cell will move from the Xenon branch to the Caesium branch; the canonical correction must win even if this changes familiar layout.

Beryllium's logical parent remains the existing `aluminium` app ID even though the canonical parent name is Aluminum. All other existing parent relationships match.

Current build checks for missing parents, self-parenting, cycles, rarity progression, and duplicate sibling sort numbers should be retained and converted to FormID-first checks. Parent policy also needs a clear rule for a child whose canonical parent is excluded; no current included ordinary record has that problem, and the build should reject it rather than silently make the child a root.

## 9. Sort-order replacement

Legacy `SortOrder` is used in exactly three ways:

1. `build-reference-data.mjs` parses and validates it.
2. `resources.json` and `ResourceReference.sortOrder` carry it.
3. `PlannedSupplyEditor` uses it to order roots/siblings and, incorrectly, to infer special-strip roots from `null`.

No availability, validation, occurrence, recipe, localization, or Search code uses it. Runtime JSON's overall resource array is separately sorted by category then canonical/fallback English name. Search sorts matches by localized display name and stable tie-breakers. The status matrix sorts currently applicable inorganics by localized display name.

The established Planned Supply root order is intentional UX policy and should be preserved in a tracker-owned Planned Supply policy:

```text
Aluminium, Argon, Chlorine, Copper, Iron, Lead, Nickel, Uranium
```

The explicit branch orders that matter are:

```text
Lead: Silver, Tungsten
Fluorine: Gold, Tetrafluorides
Lithium: Caesium, Xenon
```

Other siblings currently fall back alphabetically. Water and Helium-3 special-strip membership must become explicit; their current alphabetical order is Helium-3 then Water. A single global canonical sort must not be invented. The narrowest compatibility approach is to preserve the runtime numeric field temporarily but source it from a Planned Supply policy and add explicit placement. The clearer long-term shape is `plannedSupplyPlacement` plus `plannedSupplyOrder`, consumed only by the Planned Supply layout helper.

## 10. Occurrence-data crosswalk

The occurrence CSV already supplies `ResourceFormID`, `ResourceEditorID`, `ResourceName`, rarity, source file, and location facts. The current builder nevertheless joins by English name and only then records that a FormID consistently maps to the resulting app ID.

The canonical dictionary permits a direct join:

```text
occurrence.ResourceFormID
    -> canonical dictionary row
    -> explicit stable app ID
```

All 45 distinct occurrence FormIDs exist in the canonical dictionary, with no FormID/name multiplicities in the current extract. This change removes the inorganic `Aluminum -> Aluminium` build alias. Keep the separate organic `Gastro Delight -> Gastronomic Delight` compatibility behavior until organic identity is migrated; do not remove the entire alias mechanism indiscriminately.

Occurrence names, EditorIDs, rarity, and source metadata should still be checked against canonical/build expectations where appropriate so FormID joins do not conceal contradictory extracts. Runtime occurrence semantics remain unchanged: biome and atmosphere are distinct, atmosphere is body-wide, selected-biome filtering remains in `bodyResourceAvailability.ts`, and Ocean behavior is untouched.

## 11. Recipe compatibility

`industrial-workbench.csv` contains `Product,Ingredient,Quantity` and no FormIDs or abbreviations. `buildProductRecipes()` performs exact name lookup against built resource and product catalogues.

After canonical fallback name changes from Aluminium to Aluminum, the three `Aluminium` ingredient rows would fail. The safest narrow adjustment is an explicit recipe-source compatibility resolver that maps the source name `Aluminium` to app ID `aluminium`, then verifies that this app ID is an included resource. Do not change the stable ID and do not couple recipe joins to localized display names. The recipe source can remain unchanged until it receives its own canonical identity fields.

No supplied recipe uses X-Tech, Aqueous Hematite, or Caelumite, so excluding them does not break recipe generation. Conversely, merely existing in the canonical dictionary must not make a new name a valid recipe ingredient; ingredient resolution must target runtime-eligible app IDs and continue rejecting unknown/ambiguous inputs.

## 12. Planned Supply / Search / localization impact

Planned Supply currently derives all of the following from runtime records:

- singleton strip: root plus `sortOrder === null` (currently Water and Helium-3);
- family membership/topology: `parentId`;
- vertical row: five-tier `rarity`;
- root/sibling order: `sortOrder`, then English/display name fallback;
- compact mode: localized resource name sort;
- disabled/hatched state: actual availability and current Planned Supply membership, not rarity.

The migration must replace inferred singleton membership with explicit placement, retain Water/Helium-3 there, correct Aldumite's branch, and source ordering from tracker policy. X-Tech placement must remain deferred. Aqueous Hematite and Caelumite must not appear as extra singleton roots.

Search includes every runtime resource and searches localized display name plus canonical short name. Canonical `R-COOH` will deliberately replace `R-COC`; add a regression test for the new abbreviation and decide explicitly whether searching the obsolete abbreviation is needed. No evidence shows abbreviations are persisted, so no data migration is required. Runtime array order does not determine match order, but changed localized/fallback names and abbreviations can change deterministic results and collision disambiguation; tests should cover this.

Localization already has the correct architectural seam. Keep stable ID `aluminium`; set the runtime canonical/fallback name to `Aluminum`; keep the US overlay (redundant but harmless and explicit) and UK overlay `Aluminium`. `referenceNames.ts` requires no algorithm change. Tests should use canonical fallback `Aluminum` and prove both locales still resolve from the same ID. Do not generate IDs from either locale.

If hidden/special rows are ever emitted in `resources.json`, filtering should be centralized into tracker-facing catalogue selectors rather than separately improvised in Search and Planned Supply. Unknown-ID validation needs a deliberate distinction between “known canonical”, “known tracker but not selectable”, and “unknown”; the first migration avoids that complexity by not emitting deferred records.

## 13. Persistence/import compatibility

Persisted resource IDs occur in:

- `Outpost.localResources`;
- `ResourceProductionRoute.resourceId` in `activeProduction`;
- resource `CargoItem.id` values in `plannedSupply`;
- resource `CargoItem.id` values in `CargoPad.outboundItems`.

Manufacturing persists product IDs only; its resource dependencies live in generated recipes. Cargo links contain outpost/pad IDs only. Validation issues and global Undo/Redo history carry or snapshot these IDs during the session but introduce no additional persisted resource identity.

`serialization.ts`, `networkMigration.ts`, collection migration, and browser storage preserve resource strings. Schema-2 route migration may consult current resource category but does not rename IDs. Unknown/stale IDs are preserved and later reported by `unknownReferenceDataId`; they are not cleaned up.

Because every existing runtime ID remains present, replacing reference data requires no network or collection schema change. Existing saves/imports/history snapshots using `aluminium`, `helium-3`, `carboxylic-acids`, or `aldumite` continue to resolve. The changed short name, fallback display name, canonical rarity metadata, and parent are reference/presentation changes only.

If a future save already contains a deferred ID such as `x-tech`, the current resilience rule remains: preserve the string and validate it as unknown until that ID is admitted. Do not silently delete or rewrite it.

## 14. Validation and build invariants

Retain current invariants and add these exact checks:

- exact canonical header contract and required non-empty fields;
- one consistent `ExtractTimestamp` per extract;
- normalized FormID uniqueness and expected hexadecimal format/width;
- EditorID uniqueness for this dataset, with any future exception explicit;
- canonical name and short-name uniqueness/non-emptiness as diagnostics, never identity generation;
- known/explicit `SNAMRarity` values and classification keywords; no silent fallback;
- every non-empty parent FormID resolves to exactly one canonical row;
- parent EditorID/name/source fields agree with the resolved parent row;
- no self-parent and no parent cycles;
- every canonical row has an explicit tracker disposition, including excluded rows;
- exactly one pinned app ID for every included row, no app ID assigned to multiple FormIDs unless a future deliberate many-to-one rule is documented;
- golden preservation of the complete existing 45 app-ID set;
- `000057D6 -> aluminium` specifically;
- every included child's parent is included;
- mapped tracker parent tier is strictly below child tier for ordinary families;
- explicit Planned Supply root/sibling order is unique within its scope;
- explicit special placement contains Water and Helium-3 only during this migration;
- occurrence FormID resolves through the canonical/crosswalk index; its name/EditorID facts agree;
- recipe names resolve to exactly one eligible resource or product app ID;
- excluded/deferred resources do not appear in `resources.json`, occurrences, body resources, recipes, Search catalogue, or Planned Supply catalogue;
- generated outputs remain deterministic.

Golden facts required before retiring the legacy contract:

```text
000057D6 -> aluminium; en-US Aluminum; en-GB Aluminium
00005DF5 Aldumite -> 000057E0 Caesium -> app parentId caesium
Carboxylic Acids -> R-COOH
Water canonical rarity Everywhere; tracker tier common; explicit singleton
Helium-3 canonical rarity Special; tracker tier common; explicit singleton
X-Tech 01033E3F exists and has explicit special-deferred policy
Aqueous Hematite 00006529 has explicit excluded policy
Caelumite 00252074 has explicit excluded policy
all current stable IDs unchanged
legacy saved IDs resolve after regeneration
```

## 15. Testing plan

### Source/build tests

- Add pure tests for canonical parsing, header validation, duplicate FormID/EditorID, missing parents, contradictory parent metadata, cycles, unrecognized rarity/classification, and unclassified new rows.
- Snapshot or explicitly assert the 48-row inventory, 47/1 source-file split, 45 included + 3 deferred/excluded policy result, and complete stable-ID/FormID crosswalk.
- Assert the golden facts above and verify no source field is rewritten.
- Test deterministic Planned Supply policy ordering independently of source row order.
- Test the occurrence FormID join with deliberately wrong occurrence name/EditorID and with unknown FormID.
- Test recipe `Aluminium -> aluminium` compatibility and unknown/ambiguous ingredient failures.
- Ensure these tests are invoked by a documented npm script or move suitable pure tests under `tests/*.test.ts`; the current `scripts/*.test.mjs` suite is outside `npm test`.

### Domain/reference tests

- Verify generated `ResourceReference` records for ID/name/short name/tracker rarity/parent/placement.
- Verify Aldumite family layout under Caesium and established root/branch/special ordering.
- Verify Water and Helium-3 remain in the special strip without using rarity or null order as the discriminator.
- Verify X-Tech, Aqueous Hematite, and Caelumite cannot leak into ordinary catalogue selectors.
- Verify body/biome/atmosphere availability counts and semantics remain unchanged.
- Verify interstellar Helium-3 validation still recognizes `helium-3`.

### Persistence compatibility tests

- Deserialize representative schema-2/schema-3 networks containing each resource-bearing location and confirm IDs are byte-for-byte unchanged.
- Include `aluminium`, `carboxylic-acids`, `aldumite`, Water, and Helium-3 in local resources, active routes, Planned Supply, and outbound cargo.
- Confirm unknown/deferred IDs remain preserved and diagnosed rather than removed.
- Confirm collection import, browser-storage migration, and Undo/Redo snapshots need no schema version bump.

### Manual browser checks

- Compare expanded Planned Supply family layout before/after, expecting only the Aldumite branch correction and `R-COOH` label change.
- Confirm singleton strip contains only Helium-3 and Water in the familiar order.
- Confirm US shows Aluminum and UK shows Aluminium while persisted/exported ID remains `aluminium`.
- Search by Aluminum/Aluminium according to locale, `Al`, and `R-COOH`; confirm no X-Tech/Aqueous Hematite/Caelumite result.
- Select bodies/biomes and verify matrix resources, atmospheric availability, Ocean behavior, production toggles, and cargo candidates remain unchanged.
- Import an old network, inspect its resources, reload browser storage, and exercise Undo/Redo.

## 16. Likely implementation files

Files expected to change in the eventual implementation:

- `reference-source/inorganic-resource-dictionary.csv` — replace the legacy artifact with the supplied canonical extract intact.
- a new tracker-owned policy file, preferably under `reference-source/` with a clear name such as `inorganic-resource-tracker-policy.csv` or `.json` — stable ID crosswalk, inclusion disposition, tracker tier, and possibly presentation placement/order. If presentation ordering is split out, give it a Planned Supply-specific name.
- `scripts/build-reference-data.mjs` — canonical parser, FormID crosswalk, policy join, rarity mapping, parent resolution, recipe compatibility, and validation.
- `scripts/biome-reference-data.mjs` — accept/use the inorganic FormID crosswalk and remove only the Aluminum name alias path.
- `scripts/biome-reference-data.test.mjs` and/or new tests under `tests/` — build and join invariants.
- `public/reference-data/resources.json` — canonical fallback name/short name/parent and policy-derived presentation metadata.
- `public/reference-data/inorganic-occurrences.json`, `body-resources.json`, and `product-recipes.json` — regenerate and prove semantically unchanged; they may have no textual diff if generation order is preserved.
- `src/domain/referenceData.ts` — only if explicit placement/order or visibility metadata is emitted/renamed.
- `src/ui/components/PlannedSupplyEditor.tsx` — consume explicit singleton placement/order rather than inferring it from null sort order.
- `src/ui/itemSearch.ts` — only if special/hidden rows are emitted; otherwise add leakage regression tests without production change.
- `src/localization/referenceNames.ts` and `tests/localization.test.ts` — likely test/fallback fixture updates; overlay logic need not change.
- `tests/itemSearch.test.ts` — canonical name/abbreviation, stable ID, ordering, and exclusion checks.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DOMAIN-RULES.md`, and possibly `docs/UX-DESIGN.md` — document new authority boundaries and explicit singleton/order policy.
- `src/domain/resources.ts` — remove the unreferenced duplicate or update it only if investigation reveals a real consumer.

`src/data/referenceDataLoader.ts`, persisted models, `networkMigration.ts`, and schema versions should not need changes if the recommended lean runtime and exclusion approach is used.

## 17. Recommended implementation sequence

1. Check the canonical extract into the repository unchanged and add a separate, explicit FormID-keyed tracker policy containing all 48 rows/dispositions and all 45 pinned current IDs.
2. Extract/test pure canonical parsing and validation before replacing `buildResources()` behavior.
3. Build the included runtime catalogue from canonical + policy while retaining the current 45-ID set and current runtime shape where practical.
4. Resolve parents through FormID and apply the Aldumite correction; separate singleton placement from order and preserve the established Planned Supply ordering policy.
5. Pass the stable FormID crosswalk into inorganic occurrence generation; remove only the obsolete Aluminum name alias and retain organic compatibility handling.
6. Add explicit recipe name compatibility for `Aluminium` and prove generated recipe app IDs are unchanged.
7. Regenerate all reference JSON and review diffs/counts. Expected visible resource changes are canonical Aluminum fallback, `R-COOH`, and Aldumite's parent; occurrence and recipe identities should remain unchanged.
8. Add persistence, Search, Planned Supply, localization, occurrence, and hidden-resource leakage regressions.
9. Update durable documentation to distinguish canonical source truth, app identity, tracker inclusion, presentation classification, and surface-specific ordering.
10. Run the full source/build test command, `npm test`, `npm run build`, `npm run lint`, `git diff --check`, then perform the manual browser checks.
11. Retire all five-column parser/validation assumptions only after the golden compatibility suite proves the 45 existing IDs and downstream outputs.

This sequence keeps source ingestion, compatibility, and presentation changes reviewable while avoiding any persisted-data migration.

## 18. Risks / blockers / open questions

- The canonical file supplied for this audit lives outside the repository. Implementation needs that exact artifact copied into the source-controlled `reference-source` location without editing its contents.
- The supplied occurrence and recipe inputs do not establish gameplay semantics for Aqueous Hematite or Caelumite. This does not block migration if they remain explicitly excluded; it blocks ordinary catalogue exposure.
- The supplied inputs establish X-Tech identity but not tracker availability, DLC entitlement behavior, skills, buffs, or UI. This does not block migration if its disposition is special-deferred; it blocks enabling it.
- The repository currently has no explicit npm command for generating reference data, and its relevant `scripts/*.test.mjs` tests are not run by `npm test`. The implementation should make the verification route explicit rather than assuming the production build regenerates public JSON; `npm run build` currently only compiles TypeScript and runs Vite.
- If the team chooses to emit deferred canonical rows in runtime JSON, it must first settle the distinction between canonical-known, tracker-known, selectable, and feature-enabled. That expansion is avoidable for the initial migration.
- Decide during implementation whether obsolete `R-COC` remains a search alias. It is not needed for persisted-data compatibility, but removal changes user search behavior. The canonical display/short name must be `R-COOH` regardless.

No other source-data ambiguity found in this audit requires a network schema change or blocks the 45-resource migration.

## 19. X-Tech readiness after migration

After the recommended migration, X-Tech will have:

- verified canonical identity `01033E3F` / `Y2_Res_X-Tech`;
- canonical name `X-Tech`, short name `XT`, SNAM rarity `Unique`, X-Tech-specific classification keyword, and `SFBGS00D.esm` provenance;
- a reserved stable app identity and explicit `special-deferred` tracker disposition;
- build validation that prevents accidental ordinary-catalogue leakage;
- an architecture capable of enabling it deliberately without changing existing resource IDs.

The separate X-Tech feature still needs decisions and implementation for:

- whether/when the record enters runtime JSON and how DLC/source availability is represented;
- actual availability/source semantics (it has no occurrence rows in the supplied dataset);
- Planned Supply eligibility and exact special-strip placement/order;
- Search visibility before and after feature enablement;
- character skills, buffs, or other exceptional rules;
- validation and provenance behavior;
- old-save/import behavior if a future `x-tech` ID is present while the feature is unavailable.

Canonical rarity alone must not answer any of those questions. The dictionary migration should provide identity and policy seams, not pre-implement X-Tech behavior.

## Audit verification

This was a no-code audit. I read the required repository documentation, inspected the named source/build/runtime/localization/persistence/test files, searched repository-wide consumers of resource fields and IDs, and queried the canonical, legacy, occurrence, abbreviation, recipe, and generated JSON datasets for counts and crosswalk differences.

No product code, source CSV, generated JSON, localization, schema, or behavior was modified. No tests, build, lint, or browser checks were run because they were not needed to establish the architectural facts. The only repository change is this audit report. No commit or push was performed.
