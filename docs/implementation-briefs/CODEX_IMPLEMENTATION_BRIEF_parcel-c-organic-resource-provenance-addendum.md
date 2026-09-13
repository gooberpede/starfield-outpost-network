# CODEX IMPLEMENTATION BRIEF — Parcel C Organic Resource Provenance Addendum

## Purpose

Implement the focused Parcel C addendum that adds authoritative localization provenance for the tracker’s **22 organic harvest resources**.

This work follows the completed audit:

```text
docs/audits/codex-localization-parcel-c-organic-resource-provenance-audit.md
```

Do **not** redesign Parcel C.

Do **not** introduce a new provenance stage.

Do **not** change runtime/UI behavior.

Do **not** commit or push.

---

# Scope classification

**Small focused provenance implementation.**

Expected changes are limited to:

- C2 direct target assembly;
- one entity-scoped normalization;
- policy/closure counts;
- focused tests;
- regenerated Parcel C outputs/documentation.

No runtime, UI, persistence, history, import/export, schema, search, or layout changes.

---

# Authoritative result from the audit

All 22 missing organic resources are:

```text
RecordSignature = IRES
RecordSourcePlugin = Starfield.esm
NameSourcePlugin = Starfield.esm
NameFieldPath = topLevel.FULL
NameStringTable = strings
DisplayNameSourceKind = direct
ComponentOrder = 0
ComponentRole = complete
```

All 22 resolve in both official English and Japanese tables.

There are:

```text
22 single-provider chains
0 override chains
0 inherited fields
```

The existing schema, field map, provider-chain machinery, and direct-name generation are sufficient.

---

# Organic resource IDs to add

Use the existing stable tracker `ResourceId` values:

```text
adhesive
amino-acids
analgesic
antimicrobial
aromatic
gastronomic-delight
hallucinogen
high-tensile-spidroin
hypercatalyst
immunostimulant
luxury-textile
metabolic-agent
neurologic
nutrient
ornamental
pigment
sealant
sedative
spice
stimulant
structural
toxin
```

Do not create new IDs.

---

# Canonical source join

Build the organic resource target set from the existing project-owned source data.

Use:

```text
reference-source/biome-organic-resources.csv
reference-source/item-tracker-metadata.csv
```

The intended structural join is:

```text
biome-organic-resources.csv ResourceFormID
==
item-tracker-metadata.csv ItemFormID
```

Then use:

```text
ItemId -> EntityId
```

for provenance identity.

Do not join by English name.

Do not infer from fauna-diet variant records.

---

# Record selection rule

For each of the 22 resources, select the canonical generic harvested-resource `IRES` record referenced by the tracker source data.

Do not accidentally select the same-name herbivore or carnivore variant `IRES` records.

The canonical source FormID is authoritative.

Use existing source consistency checks for:

```text
FormID
EditorID
CanonicalName
SourcePlugin
```

where available.

---

# C2 integration point

Extend the existing C2 direct target assembly in:

```text
scripts/localization/localized-name-provenance.mjs
```

or the current equivalent module if names have shifted.

Preferred implementation:

1. load/reuse the already available organic occurrence source;
2. reduce by canonical `ResourceFormID`;
3. verify repeated occurrence rows are internally consistent;
4. join to `item-tracker-metadata.csv` by FormID;
5. select rows representing tracker organic resources;
6. use the existing stable `ItemId` as provenance `EntityId`;
7. feed targets into the existing C2 deduplicating `add()` path;
8. pass them through unchanged:
   ```text
   generateProvenance()
   -> exact record resolution
   -> C7 provider-chain resolution
   -> exact semantic field extraction
   -> English verification
   -> Japanese availability
   -> coverage/sorting/serialization
   ```

Do not create `organic-resource-provenance.mjs` or another parallel subsystem unless truly required.

---

# Existing overlap/deduplication

The audit found that some organic resources may already appear indirectly in the current C2 target population as recipe ingredients.

The existing target assembly should deduplicate by stable provenance identity.

Expected effect:

- all 22 currently missing organic resources become new canonical provenance entities;
- already-present overlapping target records must not create duplicate rows.

Add explicit duplicate protection/tests.

---

# Canonical English behavior

For 21 resources:

```text
tracker canonical/display English
==
Bethesda official English
```

Those should verify as exact.

One resource is an approved tracker/source difference:

```text
EntityKind = resource
EntityId = gastronomic-delight

tracker-visible CanonicalEnglish:
Gastronomic Delight

Bethesda official English:
Gastro Delight
```

Do not change the tracker-visible English display.

Do not rewrite Bethesda source truth.

---

# Gastronomic Delight normalization

Add one entity-scoped normalization to:

```text
reference-source/localized-name-normalizations.csv
```

Expected conceptual row:

```text
resource
gastronomic-delight
Gastronomic Delight
Gastro Delight
TRACKER_NORMALIZATION
<reviewed display-override rationale>
```

Use the repository’s exact column order/schema.

Also update any code-owned normalization policy representation required by the builder.

The normalization must remain:

- entity-scoped;
- explicit;
- reviewable;
- non-global.

Do not add a generic Gastro/Gastronomic rule.

---

# Gastronomic Delight regression

Add a focused regression asserting:

```text
EntityKind = resource
EntityId = gastronomic-delight
RecordSourcePlugin = Starfield.esm
RecordFormID = 0007782F
RecordSignature = IRES
NameFieldPath = topLevel.FULL
NameSourcePlugin = Starfield.esm
NameStringTable = strings
NameStringID = 000081A0
CanonicalEnglish = Gastronomic Delight
```

English verification must pass only because of the approved normalization:

```text
Gastronomic Delight -> Gastro Delight
```

Japanese lookup must resolve:

```text
美食の喜び
```

---

# Direct-row shape

All 22 new rows must use:

```text
EntityKind             = resource
DisplayNameSourceKind  = direct
ComponentOrder         = 0
ComponentRole          = complete
RecordSignature        = IRES
NameFieldPath          = topLevel.FULL
NameStringTable        = strings
```

No composed/template semantics.

No schema changes.

---

# Provider behavior

Run the new targets through the existing C7 provider-chain machinery.

Expected installed-data result:

```text
22 canonical resource records in Starfield.esm
22 Starfield.esm name providers
0 Shattered Space providers
0 SFBGS00D providers
0 override chains
0 inherited fields
```

Do not special-case the 22 to bypass provider resolution.

---

# Japanese coverage

Installed-game regeneration must prove:

```text
22/22 Japanese qualified IDs resolve
```

No machine translation.

No manual Japanese edits.

No fallback text inserted into provenance.

---

# Current source metadata preservation

Do not alter current organic resource runtime metadata semantics.

In particular, preserve:

```text
ResourceId
ShortName
rarity
DisplayNameOverride
organic harvesting relationships
```

This addendum is localization provenance only.

Do not change `scripts/item-reference-data.mjs` behavior unless a tiny shared helper is necessary for consistency.

---

# Flora/fauna relationship preservation

Do not derive resource names from species names or species localization.

The existing flora/fauna occurrence data is only the structural source for the canonical resource FormID relationship.

No changes to:

- flora/fauna provenance;
- species harvest outputs;
- biome organic occurrence modeling;
- domesticability logic.

---

# Parcel C closure totals

After successful implementation/regeneration, expected totals are:

```text
resolved entities       3,561
provenance rows          4,818
resource entities           78
unresolved                    0
```

Expected provider rows:

```text
Starfield.esm       4,781
ShatteredSpace.esm     35
SFBGS00D.esm            2
```

Expected approved normalizations:

```text
3 total
```

assuming the prior two remain unchanged.

Update:

```text
reference-source/localization-provenance-policy.json
```

and any equivalent closure/count gates.

Do not hard-code these into runtime code.

---

# Parcel D reconciliation target

After regeneration, Parcel D should be able to reconcile:

```text
runtime resource catalogue                    76
provenance-backed surfaced runtime resources   76

Parcel C resource entities                     78
source-only excluded:
  aqueous-hematite                              -1
  caelumite                                     -1
surfaced runtime resources                      76
```

Add a regression or documentation assertion for this exact set relationship.

Do not remove the two source-only excluded provenance resources.

---

# Future DLC behavior

Keep the addendum compatible with the existing allowlisted future-DLC model.

A future official organic resource should require:

```text
stable tracker ResourceId
+ explicit authoritative Bethesda record mapping
+ supported official plugin admission
+ exact localized semantic field
```

then flow through the same direct provenance machinery.

Do not auto-discover arbitrary `IRES` records.

---

# Tests

Add focused tests for at least:

## Target assembly

- all 22 expected missing organic `ResourceId`s are included;
- canonical FormID join is used;
- duplicate occurrence rows collapse safely;
- inconsistent repeated source rows fail closed;
- herbivore/carnivore same-name variant records are not selected.

## Metadata reconciliation

- all canonical organic resource FormIDs map to the expected stable IDs;
- no duplicate stable IDs;
- no unmatched required organic metadata row.

## Provenance row shape

- all 22 are direct/complete slot 0;
- signature/path/table are exactly:
  ```text
  IRES / topLevel.FULL / strings
  ```

## Gastronomic Delight

- exact approved normalization required;
- no global normalization;
- official English remains `Gastro Delight`;
- tracker canonical remains `Gastronomic Delight`;
- Japanese resolves correctly.

## Provider boundary

- all 22 current live providers are `Starfield.esm`;
- no unsupported/historical plugin influences selection.

## Closure totals

- 3,561 entities;
- 4,818 rows;
- 78 resource entities;
- 0 unresolved;
- provider rows 4,781 / 35 / 2.

---

# Generated outputs to refresh

Regenerate the normal Parcel C project-owned outputs through the existing authoritative builder.

At minimum expect updates to:

```text
reference-source/localized-name-provenance.csv
reference-source/localized-name-normalizations.csv
reference-source/localization-provenance-policy.json
reference-source/localized-name-provenance-manifest.json
```

and any existing build/report artifact whose deterministic counts/hash identity depend on the changed provenance population.

Do not create redundant organic-only provenance outputs.

---

# C8 builder integration

The C8 reproducible build must remain authoritative.

Run the normal installed-game provenance workflow.

Expected:

```text
npm run localization:provenance:build
```

should initially report reviewed drift due to the intentional population extension.

Then use the project’s explicit acceptance/write mode:

```text
npm run localization:provenance:build -- --write
```

only after the generated differences match this brief.

After acceptance, rerun normal build mode and require:

```text
0 unexplained drift
```

Do not bypass C8 drift review.

---

# Documentation

Update durable localization/provenance docs where counts or scope statements currently imply resources are inorganic-only.

Clarify that Parcel C resource provenance now includes:

```text
inorganic
special/X-Tech
organic harvest resources
```

Do not rewrite unrelated Parcel C history.

If the Parcel D audit references the old 56-resource/22-resource gap as an unresolved blocker, either:

- leave the historical audit untouched and document the addendum resolution elsewhere, or
- add a clearly dated/resolution note if that is the repository’s audit convention.

Do not rewrite audit findings to pretend the gap never existed.

---

# No runtime changes

Do not modify:

- `src/localization/referenceNames.ts`;
- Japanese runtime overlay integration;
- React components;
- search;
- persistence;
- history;
- import/export;
- schema versions.

Parcel D runtime work begins only after this addendum is complete.

---

# Verification

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:provenance:build
npm run build
npm run lint
git diff --check
```

Also run the installed-game regeneration/write/reverify cycle required by C8.

Final expected closure:

```text
3,561 resolved entities
4,818 provenance rows
78 resource entities
0 unresolved
3 approved normalizations
provider rows 4,781 / 35 / 2
0 unexplained drift
```

---

# Acceptance criteria

The addendum is complete when:

1. all 22 organic resource identities are included in C2 direct targets;
2. targets are joined by canonical FormID, not English name;
3. canonical generic organic `IRES` records are selected;
4. herbivore/carnivore variants are excluded;
5. all 22 use `IRES/topLevel.FULL`;
6. all 22 resolve in English and Japanese;
7. all 22 use the existing C7 provider machinery;
8. all 22 current live name providers are `Starfield.esm`;
9. zero live override/inherited cases are introduced;
10. `gastronomic-delight` uses one approved entity-scoped normalization;
11. tracker display remains `Gastronomic Delight`;
12. Bethesda official English remains `Gastro Delight`;
13. no schema change is introduced;
14. no parallel provenance subsystem is introduced;
15. resolved entities become 3,561;
16. provenance rows become 4,818;
17. resource entities become 78;
18. unresolved remains zero;
19. provider rows become 4,781 / 35 / 2;
20. approved normalization count becomes 3;
21. all 76 surfaced runtime resources are provenance-backed;
22. `aqueous-hematite` and `caelumite` remain source-only excluded resources;
23. C6 fauna counts remain unchanged;
24. runtime/UI/persistence/history remain untouched;
25. C8 normal rebuild finishes with zero unexplained drift;
26. all verification commands pass;
27. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- target-assembly implementation;
- exact source join used;
- duplicate/source-consistency handling;
- Gastronomic Delight normalization;
- number of new resource entities;
- final entity/row/resource totals;
- final provider counts;
- unresolved count;
- Japanese coverage;
- whether any row besides the intended organic additions/normalization-related metadata changed unexpectedly;
- C8 drift/write/reverify result;
- test/build/lint results;
- confirmation that no runtime/UI/schema work was added.

Do not proceed to Parcel D runtime implementation unless separately instructed.
