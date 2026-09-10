# Codex Implementation Brief — Retire Legacy Inorganic Resource Dictionary

## Objective

Replace the current handmade legacy inorganic resource dictionary with the newly extracted **canonical inorganic resource dictionary** while preserving existing tracker compatibility.

This is a **reference-data migration**, not an X-Tech feature implementation.

The migration must:

- make the canonical ESM extract the authoritative source for inorganic resource identity/metadata;
- preserve all existing persisted application resource IDs, including `aluminium`;
- use canonical FormID as the primary source crosswalk key;
- adopt canonical names, abbreviations, rarity facts, and parent relationships;
- keep tracker inclusion policy and presentation ordering explicit and separate from canonical source truth;
- exclude Aqueous Hematite and Caelumite from ordinary runtime tracker surfaces for now;
- keep X-Tech represented in canonical/policy data as `special-deferred`, but do not expose it in runtime tracker UI yet;
- preserve existing saved-network/import compatibility without a schema migration;
- retire the five-column legacy parser only after golden compatibility tests pass.

Do not implement the later X-Tech row/buff/availability feature in this parcel.

---

# PART A — READ FIRST

Review:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
```

Inspect current source/build/runtime code, especially:

```text
reference-source/inorganic-resource-dictionary.csv
reference-source/biome-inorganic-resources.csv
reference-source/industrial-workbench.csv
scripts/build-reference-data.mjs
scripts/biome-reference-data.mjs
public/reference-data/resources.json
public/reference-data/inorganic-occurrences.json
public/reference-data/body-resources.json
public/reference-data/product-recipes.json
src/domain/referenceData.ts
src/data/referenceDataLoader.ts
src/localization/referenceNames.ts
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts
src/ui/components/PlannedSupplyEditor.tsx
src/ui/itemSearch.ts
src/domain/bodyResourceAvailability.ts
src/domain/validation/rules/unknownReferenceDataId.ts
src/domain/validation/rules/interstellarCargoHelium3.ts
serialization / network migration code
tests touching resource identities/reference data
```

The supplied canonical inorganic extract is authoritative.

If the exact canonical CSV is materially unavailable to Codex, stop and report the missing input rather than recreating it from the audit or legacy CSV.

---

# PART B — AUDIT REPORT LOCATION

The architecture audit is already complete and stored under:

```text
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
```

Do not rewrite or relocate it.

Future implementation documentation may reference it.

---

# PART C — SOURCE AUTHORITY

Use this rule:

> **Canonical extracted data owns source truth; the tracker owns inclusion policy and presentation order; existing persisted application identities remain stable.**

Do not bend the canonical extract to match the legacy CSV.

Do not edit canonical values merely to preserve old assumptions.

---

# PART D — REPLACE THE LEGACY SOURCE

## 1. Replace the current handmade dictionary

Replace:

```text
reference-source/inorganic-resource-dictionary.csv
```

with the supplied canonical extract **unchanged**.

Preserve its full canonical rows and columns.

Expected canonical columns include:

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

Use the exact supplied header contract.

Do not strip Aqueous Hematite, Caelumite, or X-Tech out of the canonical source file.

---

# PART E — EXPLICIT TRACKER POLICY

## 2. Add a FormID-keyed tracker policy

Introduce a separate, version-controlled tracker-owned policy file.

Preferred location:

```text
reference-source/inorganic-resource-tracker-policy.csv
```

or a comparably clear JSON file if that fits the build better.

The policy must be keyed by canonical `ResourceFormID`.

It should explicitly define, for all 48 canonical rows:

```text
stable application ResourceId
tracker disposition
tracker presentation rarity
Planned Supply placement
Planned Supply order where required
```

Do not make canonical source row order do presentation work.

Do not regenerate application IDs from names.

---

## 3. Tracker dispositions

Use explicit dispositions at least equivalent to:

```text
ordinary
special-deferred
excluded
```

Recommended current classification:

```text
45 existing ordinary inorganic resources
    -> ordinary

X-Tech
    -> special-deferred

Aqueous Hematite
    -> excluded

Caelumite
    -> excluded
```

Exact enum names may differ if there is a better existing convention.

Every canonical row must have an explicit policy disposition.

A future newly extracted row without a policy entry must fail the build rather than silently enter the UI.

---

# PART F — STABLE APPLICATION IDS

## 4. Freeze all 45 existing app IDs

Preserve the complete existing application-ID set for ordinary inorganics.

Do not change:

```text
aluminium
helium-3
carboxylic-acids
aldumite
...
```

These IDs are historical persisted application identifiers and must now be treated as opaque.

Do not derive them from canonical or localized names.

---

## 5. Aluminum / Aluminium

Use this exact compatibility policy:

```text
canonical FormID: 000057D6
canonical source name: Aluminum
stable app ID: aluminium
en-US display: Aluminum
en-GB display: Aluminium
```

FormID is the authoritative source crosswalk.

The stable application ID remains `aluminium`.

Remove obsolete name-based source aliasing only where the new FormID join makes it unnecessary.

Do not break en-GB localization.

---

# PART G — CANONICAL FORMID CROSSWALK

## 6. Primary join key

Use canonical `ResourceFormID` as the primary crosswalk key.

`ResourceEditorID`, `ResourceName`, and `ResourceShortName` are validation/diagnostic facts, not identity keys.

Build flow should conceptually be:

```text
canonical FormID
    -> canonical resource row
    -> tracker policy
    -> stable application ResourceId
```

---

## 7. Parent resolution

Resolve:

```text
EffectiveParentFormID
```

through the canonical FormID index and then into the stable application ID.

Do not join parents by English name.

Use `EffectiveParentName`, EditorID, and source-file fields only as consistency assertions.

---

# PART H — CANONICAL TREE CORRECTION

## 8. Adopt Aldumite -> Caesium

Canonical relationship wins:

```text
Aldumite 00005DF5
    -> Caesium 000057E0
```

Runtime `aldumite.parentId` must become:

```text
caesium
```

Do not preserve the legacy `xenon` parent.

Update tests and Planned Supply topology accordingly.

This correction must not trigger persisted-ID changes.

---

# PART I — ABBREVIATIONS

## 9. Adopt canonical short names

Use canonical `ResourceShortName` for inorganic runtime abbreviations.

Known intentional visible change:

```text
Carboxylic Acids
legacy: R-COC
canonical: R-COOH
```

Adopt:

```text
R-COOH
```

Do not preserve `R-COC` as a display abbreviation.

Do not add `R-COC` as a search alias unless there is an already-existing generic alias mechanism that makes it essentially free and non-confusing.

Default implementation decision:

> **Drop the obsolete `R-COC` abbreviation.**

No persisted-data migration is required because abbreviations are not persisted.

---

# PART J — CANONICAL RARITY VS TRACKER PRESENTATION RARITY

## 10. Preserve canonical rarity as source truth

Do not normalize away:

```text
Water -> Everywhere
Helium-3 -> Special
```

Keep `SNAMRarity` as canonical source data in the source/build layer.

---

## 11. Keep tracker presentation rarity separate

Do not expand the existing five-tier tracker `Rarity` union merely to expose source-only values.

Use explicit tracker presentation mapping:

```text
Common     -> common
Uncommon   -> uncommon
Rare       -> rare
Exotic     -> exotic
Unique     -> unique

Water / Everywhere
    -> common presentation tier

Helium-3 / Special
    -> common presentation tier
```

This is a tracker/UI classification, not a correction to source truth.

For X-Tech, preserve canonical `Unique` in source/policy, but do not let rarity imply runtime visibility or availability.

For Caelumite, do not infer tracker behavior solely from either SNAM rarity or classification keyword.

---

# PART K — PLANNED SUPPLY PLACEMENT / ORDER

## 12. Stop inferring special-strip membership from null sort order

Planned Supply currently overloads `sortOrder`.

Replace that inference with explicit tracker-owned placement.

Use a semantic placement concept such as:

```text
family
special
hidden/deferred
```

or a similarly focused enum.

Do not use `sortOrder === null` as the special-strip discriminator after migration.

---

## 13. Preserve special strip for Water and Helium-3

During this migration, the visible special strip remains:

```text
Helium-3
Water
```

in its current familiar order unless current UX docs/tests establish the reverse.

Do not add X-Tech yet.

Do not expose Aqueous Hematite or Caelumite.

---

## 14. Preserve intentional Planned Supply ordering

Tracker-owned root order should preserve the current deliberate family layout:

```text
Aluminium
Argon
Chlorine
Copper
Iron
Lead
Nickel
Uranium
```

This is a presentation policy, not canonical source order.

Preserve the explicit branch sibling orders:

```text
Lead:
    Silver
    Tungsten

Fluorine:
    Gold
    Tetrafluorides

Lithium:
    Caesium
    Xenon
```

Other sibling ordering may continue to use the existing deterministic fallback.

Do not invent a single global canonical sort order.

---

## 15. Runtime shape

Prefer the smallest compatible runtime change.

A good target is:

```text
existing resource runtime fields
+
explicit Planned Supply placement/order metadata
```

If retaining `sortOrder` temporarily minimizes disruption, it may remain as a compatibility field sourced from tracker policy, but special-strip membership must no longer be inferred from it.

Do not rename broad runtime fields gratuitously unless the audit-backed implementation clearly benefits.

---

# PART L — OCCURRENCE DATA CROSSWALK

## 16. Move inorganic occurrence joins to FormID

Update inorganic occurrence generation so:

```text
occurrence.ResourceFormID
    -> canonical dictionary row
    -> tracker policy
    -> stable app ResourceId
```

Do not use English name as the primary inorganic occurrence join.

---

## 17. Remove obsolete Aluminum name alias only

The canonical occurrence source already uses `Aluminum`.

Once FormID joins are in place, remove the inorganic:

```text
Aluminum -> Aluminium
```

name alias path if it is now redundant.

Do **not** remove unrelated organic compatibility aliases such as:

```text
Gastro Delight -> Gastronomic Delight
```

unless separately justified.

---

## 18. Preserve occurrence semantics

Do not change:

```text
biome occurrence
atmospheric occurrence
selected-biome filtering
Ocean behavior
body-wide atmosphere semantics
```

This is an identity/crosswalk migration only.

---

# PART M — RECIPE COMPATIBILITY

## 19. Keep current recipe source intact

`industrial-workbench.csv` remains name-based for now.

Do not rewrite it merely because the inorganic canonical fallback spelling changes.

---

## 20. Add explicit recipe-source compatibility resolution

Recipe source contains legacy:

```text
Aluminium
```

while canonical fallback is:

```text
Aluminum
```

Resolve recipe ingredient source names explicitly to stable app IDs.

At minimum:

```text
Aluminium -> aluminium
```

Do not rely on localized display names.

Do not use canonical runtime display name as the only recipe key.

Recipe resolution must still reject unknown/ambiguous ingredients.

---

# PART N — HIDDEN / DEFERRED CANONICAL RECORDS

## 21. Aqueous Hematite

Keep in canonical source/policy.

Disposition:

```text
excluded
```

Do not emit it into ordinary runtime resource catalogue.

Therefore it must not appear in:

```text
Search
Planned Supply
normal selectors
normal runtime availability
```

No source data establishes an ordinary outpost role.

---

## 22. Caelumite

Same current policy:

```text
excluded
```

Keep source truth intact, but do not emit to ordinary runtime catalogue.

Do not expose it merely because it exists in canonical data.

---

## 23. X-Tech

Keep canonical source record and policy entry.

Reserve stable app ID:

```text
x-tech
```

Disposition:

```text
special-deferred
```

For this migration:

```text
do not emit into ordinary runtime resources.json
do not expose in Search
do not expose in Planned Supply
do not implement Present/Producing behavior
do not add character buff/capability fields
```

The separate X-Tech feature will deliberately enable it after this migration.

---

# PART O — SEARCH COMPATIBILITY

## 24. No hidden-resource leakage

Search currently indexes the runtime catalogue.

After migration:

```text
45 ordinary inorganic resources remain searchable
X-Tech not yet searchable
Aqueous Hematite not searchable
Caelumite not searchable
```

Add regression coverage.

---

## 25. Canonical name/abbreviation updates

Verify:

```text
en-US Aluminum search resolves app ID aluminium
en-GB Aluminium search resolves same app ID
Al abbreviation resolves same app ID
R-COOH resolves Carboxylic Acids
R-COC no longer resolves unless a deliberate generic alias mechanism already preserves it
```

Do not change Search ranking/UX.

---

# PART P — LOCALIZATION

## 26. Canonical fallback names

Runtime/source fallback for FormID `000057D6` should be:

```text
Aluminum
```

Keep locale overlays:

```text
en-US: Aluminum
en-GB: Aluminium
```

The US overlay may remain explicit even if now redundant.

Do not regenerate IDs from localized strings.

---

# PART Q — PERSISTENCE / IMPORT COMPATIBILITY

## 27. No schema migration

The migration should not require a persisted network or collection schema bump.

Existing resource IDs remain byte-for-byte unchanged.

---

## 28. Preserve existing saved state

Existing network data may contain resource IDs in:

```text
localResources
activeProduction
plannedSupply
cargo outboundItems
session history snapshots
```

All 45 current resource IDs must still resolve after migration.

Do not rewrite them.

---

## 29. Preserve unknown/stale state

Existing resilience rule remains:

> Unknown or stale user data is preserved and validated rather than silently deleted.

Do not add destructive cleanup for deferred/excluded IDs.

If a future/hand-edited save contains `x-tech` before X-Tech is runtime-enabled, preserve the string and let current unknown-reference validation handle it.

---

# PART R — BUILD VALIDATION / INVARIANTS

## 30. Canonical parser invariants

Add validation for:

```text
exact canonical header contract
required non-empty fields
consistent ExtractTimestamp
FormID format and uniqueness
EditorID uniqueness where expected
canonical name/short-name uniqueness as diagnostics
recognized SNAM rarity values
recognized ClassificationKeyword values or explicit policy
parent FormID resolution
parent metadata agreement
no self-parent
no cycles
```

---

## 31. Policy invariants

Validate:

```text
every canonical FormID has exactly one tracker policy row
every ordinary emitted resource has exactly one pinned app ID
no app ID maps to multiple FormIDs
all 45 legacy app IDs remain present
included child parent is also included
Planned Supply placement/order values valid
excluded/deferred rows do not leak into runtime catalogue
```

A newly extracted canonical row without policy must fail the build.

---

## 32. Golden facts

Add explicit golden regression checks for:

```text
000057D6 -> app ID aluminium
canonical fallback Aluminum
en-US Aluminum
en-GB Aluminium

Aldumite 00005DF5
    -> Caesium 000057E0
    -> app parentId caesium

Carboxylic Acids -> R-COOH

Water:
    SNAM Everywhere
    tracker presentation common
    explicit special placement

Helium-3:
    SNAM Special
    tracker presentation common
    explicit special placement

X-Tech 01033E3F:
    policy special-deferred
    not emitted

Aqueous Hematite 00006529:
    policy excluded
    not emitted

Caelumite 00252074:
    policy excluded
    not emitted

45 existing app IDs preserved
```

---

# PART S — BUILD / TEST COMMANDS

## 33. Make reference-data verification explicit

The audit found that relevant script tests are not covered by `npm test`.

Add/document an explicit npm command for reference-data generation/verification if one does not exist.

Examples conceptually:

```text
npm run reference:build
npm run reference:test
```

Use naming consistent with the repository.

Do not make `npm run build` silently mutate checked-in reference data unless that is already project policy.

---

## 34. Reference-data tests

Add focused source/build tests for:

```text
canonical parser
FormID crosswalk
policy completeness
parent resolution
rarity mapping
Planned Supply placement/order
occurrence FormID join
recipe Aluminium compatibility
hidden-resource leakage
deterministic generated output
```

Ensure these tests are reachable through a documented command.

---

# PART T — GENERATED OUTPUTS

## 35. Regenerate checked-in runtime reference data

Regenerate as appropriate:

```text
public/reference-data/resources.json
public/reference-data/inorganic-occurrences.json
public/reference-data/body-resources.json
public/reference-data/product-recipes.json
```

Expected visible/resource-model changes include:

```text
canonical fallback Aluminum
R-COOH
Aldumite parent -> caesium
explicit Planned Supply placement/order metadata if emitted
```

Occurrence/resource IDs and recipe app IDs should otherwise remain stable.

Review generated diffs carefully.

---

# PART U — MANUAL BROWSER CHECKS

Verify at least:

## Localization

```text
en-US shows Aluminum
en-GB shows Aluminium
same underlying app ID remains aluminium
```

## Planned Supply

```text
family/root layout remains familiar
Aldumite now appears under Caesium branch
special strip still contains only Helium-3 and Water
Aqueous Hematite absent
Caelumite absent
X-Tech absent
```

## Search

```text
Aluminum/Aluminium works by locale
Al works
R-COOH works
R-COC does not resolve unless intentionally preserved by an existing generic alias mechanism
X-Tech absent
Aqueous Hematite absent
Caelumite absent
```

## Matrix / availability

Verify representative bodies/biomes:

```text
inorganic rows unchanged
atmospheric resources unchanged
Ocean behavior unchanged
production toggles unchanged
cargo candidates unchanged
```

## Persistence

Import/load a pre-migration network containing representative resource IDs, including:

```text
aluminium
carboxylic-acids
aldumite
water
helium-3
```

Confirm they remain intact through:

```text
load
edit
Undo/Redo
export
reload
```

---

# PART V — DOCUMENTATION

Update durable documentation:

```text
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
```

and `docs/UX-DESIGN.md` only if visible Planned Supply ordering/placement needs clarification.

Document these boundaries explicitly:

```text
canonical ESM extract = source truth
FormID = canonical crosswalk identity
stable app ResourceId = persisted tracker identity
tracker policy = inclusion + presentation classification/placement/order
localized name = presentation only
```

Document that:

```text
Aqueous Hematite and Caelumite are canonical-known but tracker-excluded
X-Tech is canonical-known and special-deferred
```

Do not document future X-Tech behavior as if implemented.

---

# PART W — LEGACY RETIREMENT

## 36. Remove five-column parser assumptions

Only after tests prove compatibility, retire code that assumes:

```text
Code
Resource
Rarity
ParentResource
SortOrder
```

as the master inorganic contract.

Do not retain dead fallback logic merely to keep the old CSV shape alive.

---

## 37. Dead legacy duplicate

Inspect:

```text
src/domain/resources.ts
```

If it is truly unreferenced legacy duplication, remove it in this parcel only if doing so is clearly safe and keeps scope coherent.

If uncertain, leave it and report it.

Do not turn this into a general cleanup sweep.

---

# PART X — OUT OF SCOPE

Do not:

```text
implement X-Tech Present row
implement [+ X-Tech]
implement X-Tech Producing behavior
implement character buff/capability collection
expose X-Tech in Search
add X-Tech to Planned Supply
add Show Hidden to Planned Supply
expose Aqueous Hematite
expose Caelumite
change Search UI/semantics
change Matrix UX
change validation semantics
change network schema version
change persisted resource IDs
move to FormID as persisted app ID
rewrite organic identity
rewrite product identity
commit
push
```

---

# PART Y — VERIFICATION

Run the explicit reference-data verification commands plus:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also perform the manual browser checks above.

Do not commit or push.

---

# PART Z — COMPLETION REPORT

Report:

## Canonical source

Confirm the legacy handmade CSV has been replaced by the supplied canonical extract unchanged.

## Tracker policy

Describe the new FormID-keyed policy and dispositions.

## Stable IDs

Confirm all 45 existing app IDs remain unchanged, including:

```text
000057D6 -> aluminium
```

## Canonical corrections

Confirm:

```text
Aluminum fallback
R-COOH
Aldumite -> Caesium
Water SNAM Everywhere
Helium-3 SNAM Special
```

## Hidden/deferred records

Confirm:

```text
Aqueous Hematite excluded
Caelumite excluded
X-Tech special-deferred
```

and none leak into ordinary runtime Search/Planned Supply.

## Planned Supply

Explain explicit placement/order replacement for legacy `SortOrder`.

## Occurrence join

Explain FormID-based inorganic occurrence resolution and which obsolete alias logic was removed.

## Recipe compatibility

Explain how legacy `Aluminium` recipe source rows still resolve to app ID `aluminium`.

## Persistence

Confirm no schema migration and no resource-ID rewriting.

## Generated outputs

List regenerated files and summarize meaningful diffs.

## Tests

Report source/build invariant coverage and golden compatibility checks.

## Documentation

List updated durable docs.

## Files changed

List all files.

## Verification

Report exact results for:

```text
reference-data verification command(s)
npm test
npm run build
npm run lint
git diff --check
```

Do not commit or push.

---

## Final instruction

Retire the handmade inorganic dictionary safely:

> **Use the canonical FormID-based extract as source truth, preserve all existing tracker resource IDs, move inclusion/classification/Planned-Supply ordering into explicit tracker policy, adopt canonical spelling/abbreviation/tree corrections, exclude Aqueous Hematite and Caelumite from ordinary runtime surfaces, keep X-Tech special-deferred, and prove old saved networks remain fully compatible before removing the legacy five-column contract.**
