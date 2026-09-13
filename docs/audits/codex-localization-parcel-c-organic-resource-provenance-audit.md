# Localization Parcel C Addendum: Organic Resource Provenance Audit

## Executive verdict

**Outcome A — straightforward direct-name extension.** All 22 missing runtime
organic resources map to stable, one-to-one canonical `IRES` records in
`Starfield.esm`. Every canonical record stores its localized name in
`topLevel.FULL`, backed by a `.strings` ID that resolves in both the official
English and Japanese tables. `ShatteredSpace.esm` and `SFBGS00D.esm` neither
override nor supply any of the selected records.

The existing provenance schema and C7 provider machinery are sufficient. The
smallest implementation is to add the complete organic-resource target
population, keyed by the existing `ItemId`, to C2's direct-name target assembly
and feed those targets through the existing `generateProvenance()` route. No
new record signature, semantic field map, schema column, or provenance
subsystem is needed.

Twenty-one official English values exactly equal the current tracker display.
The sole exception is `resource:gastronomic-delight`: Bethesda's direct record
name is `Gastro Delight`, while the tracker intentionally displays
`Gastronomic Delight`. The implementation addendum must add that exact pair to
the entity-scoped normalization policy; it must not change the reviewed runtime
display override.

The resulting Parcel C closure is:

```text
resolved entities       3,539 -> 3,561
provenance rows          4,796 -> 4,818
resource entities           56 ->    78
unresolved                    0 ->     0
Starfield.esm name rows   4,759 -> 4,781
ShatteredSpace.esm rows      35 ->    35
SFBGS00D.esm rows             2 ->     2
```

This closes the Parcel D resource-set gap: all 76 surfaced runtime resources
would be provenance-backed, while `aqueous-hematite` and `caelumite` remain the
two intentional provenance-only/source-only resources. No blocker remains for
a focused implementation addendum.

## Scope and evidence

This audit made no production provenance, runtime, UI, persistence, history,
import/export, or schema changes. Evidence came from:

- exact runtime IDs and display metadata in
  `reference-source/item-tracker-metadata.csv`;
- exact harvested-resource FormID/EditorID/name relationships in
  `reference-source/biome-organic-resources.csv`;
- the installed `Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm`, read
  with the repository's narrow plugin reader;
- the manifest-backed official English and Japanese `.strings` inputs under
  `.local-work/localization/inputs/`;
- the committed Parcel C provenance, policy, field map, provider-chain logic,
  builder, and Parcel D audit;
- the generated runtime resource and species reference data.

The ignored diagnostic is at
`.local-work/localization/organic-resource-audit/audit.mjs`; its captured output
is beside it as `audit-output.json`. It selects the 22 exact `IRES` FormIDs,
normalizes full-module identities, evaluates all three supported providers,
extracts the allowlisted semantic field, resolves qualified English/Japanese
IDs, and counts distinct flora/fauna species references. It does not write any
production artifact.

## Canonical record and localized-name results

All FormIDs below are the canonical, load-order-independent IDs recorded for
`Starfield.esm`. `RecordSourcePlugin` and `NameSourcePlugin` are both
`Starfield.esm` on every row.

| ResourceId | CanonicalEnglish | RecordSignature | RecordSourcePlugin | RecordFormID | NameFieldPath | NameSourcePlugin | NameStringTable | NameStringID | OfficialEnglish | OfficialJapanese | EnglishMatchStatus |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `adhesive` | Adhesive | `IRES` | `Starfield.esm` | `00077828` | `topLevel.FULL` | `Starfield.esm` | `strings` | `00008198` | Adhesive | 接着剤 | `EXACT` |
| `amino-acids` | Amino Acids | `IRES` | `Starfield.esm` | `0007782A` | `topLevel.FULL` | `Starfield.esm` | `strings` | `0000819A` | Amino Acids | アミノ酸 | `EXACT` |
| `analgesic` | Analgesic | `IRES` | `Starfield.esm` | `00077829` | `topLevel.FULL` | `Starfield.esm` | `strings` | `00008199` | Analgesic | 鎮痛剤 | `EXACT` |
| `antimicrobial` | Antimicrobial | `IRES` | `Starfield.esm` | `00077820` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081C3` | Antimicrobial | 抗菌剤 | `EXACT` |
| `aromatic` | Aromatic | `IRES` | `Starfield.esm` | `000777FB` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081C1` | Aromatic | 芳香剤 | `EXACT` |
| `gastronomic-delight` | Gastronomic Delight | `IRES` | `Starfield.esm` | `0007782F` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081A0` | Gastro Delight | 美食の喜び | `APPROVED_NORMALIZATION_REQUIRED` |
| `hallucinogen` | Hallucinogen | `IRES` | `Starfield.esm` | `0029F403` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000080A9` | Hallucinogen | 幻覚剤 | `EXACT` |
| `high-tensile-spidroin` | High-Tensile Spidroin | `IRES` | `Starfield.esm` | `000777FC` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081C2` | High-Tensile Spidroin | 高抗張力スピドロイン | `EXACT` |
| `hypercatalyst` | Hypercatalyst | `IRES` | `Starfield.esm` | `0029F40C` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000080AB` | Hypercatalyst | ハイパー触媒 | `EXACT` |
| `immunostimulant` | Immunostimulant | `IRES` | `Starfield.esm` | `00077830` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081A1` | Immunostimulant | 免疫刺激剤 | `EXACT` |
| `luxury-textile` | Luxury Textile | `IRES` | `Starfield.esm` | `00077831` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081A2` | Luxury Textile | 高級織物 | `EXACT` |
| `metabolic-agent` | Metabolic Agent | `IRES` | `Starfield.esm` | `0029F3FD` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000080A7` | Metabolic Agent | 代謝製剤 | `EXACT` |
| `neurologic` | Neurologic | `IRES` | `Starfield.esm` | `0029F408` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000080AA` | Neurologic | 神経剤 | `EXACT` |
| `nutrient` | Nutrient | `IRES` | `Starfield.esm` | `000777E6` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081BD` | Nutrient | 栄養剤 | `EXACT` |
| `ornamental` | Ornamental | `IRES` | `Starfield.esm` | `00077822` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081AA` | Ornamental | 装飾 | `EXACT` |
| `pigment` | Pigment | `IRES` | `Starfield.esm` | `0029F401` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000080A8` | Pigment | 顔料 | `EXACT` |
| `sealant` | Sealant | `IRES` | `Starfield.esm` | `0007782D` | `topLevel.FULL` | `Starfield.esm` | `strings` | `0000819E` | Sealant | シーリング剤 | `EXACT` |
| `sedative` | Sedative | `IRES` | `Starfield.esm` | `0007782B` | `topLevel.FULL` | `Starfield.esm` | `strings` | `00008201` | Sedative | 鎮静剤 | `EXACT` |
| `spice` | Spice | `IRES` | `Starfield.esm` | `0007782E` | `topLevel.FULL` | `Starfield.esm` | `strings` | `0000819F` | Spice | 香辛料 | `EXACT` |
| `stimulant` | Stimulant | `IRES` | `Starfield.esm` | `00077825` | `topLevel.FULL` | `Starfield.esm` | `strings` | `00008194` | Stimulant | 興奮剤 | `EXACT` |
| `structural` | Structural | `IRES` | `Starfield.esm` | `000777FA` | `topLevel.FULL` | `Starfield.esm` | `strings` | `000081C0` | Structural | 構造 | `EXACT` |
| `toxin` | Toxin | `IRES` | `Starfield.esm` | `00077823` | `topLevel.FULL` | `Starfield.esm` | `strings` | `00008190` | Toxin | 毒素 | `EXACT` |

Coverage is **22/22 English** and **22/22 Japanese**. No selected Japanese
value contains `U+FFFD`, leading/trailing or embedded suspicious whitespace,
an unexpected English fallback, or an apparent punctuation anomaly. The audit
preserves the official Japanese values exactly as decoded; no translation or
manual correction was applied.

## Identity and duplicate-display-name analysis

Each tracker identity has exactly one canonical Bethesda record. The join is
structural:

```text
biome-organic-resources.csv ResourceFormID
  == item-tracker-metadata.csv ItemFormID
  -> item-tracker-metadata.csv ItemId
  -> resource:<stable tracker ID>
```

For all 22, the selected record's `EDID` also exactly equals the exported
`ResourceEditorID`/metadata `ItemEditorID`. FormID, EditorID, source plugin, and
canonical source name are consistent across every occurrence row.

English reverse search alone would be wrong. Each name is also used by two
additional base-game `IRES` records for fauna diet variants. Those records have
independent localized string IDs, but are not the generic harvested-resource
identities referenced by the tracker source data:

| ResourceId | Canonical IRES | Same-name herbivore IRES | Same-name carnivore IRES |
|---|---|---|---|
| `adhesive` | `00077828` | `00224637` | `00224654` |
| `amino-acids` | `0007782A` | `00224636` | `00224653` |
| `analgesic` | `00077829` | `00224635` | `00224652` |
| `antimicrobial` | `00077820` | `002246D8` | `002246D7` |
| `aromatic` | `000777FB` | `00224634` | `00224651` |
| `gastronomic-delight` | `0007782F` | `0022462B` | `00224648` |
| `hallucinogen` | `0029F403` | `00224633` | `00224650` |
| `high-tensile-spidroin` | `000777FC` | `0022462A` | `00224647` |
| `hypercatalyst` | `0029F40C` | `0022463C` | `00224659` |
| `immunostimulant` | `00077830` | `00224629` | `00224646` |
| `luxury-textile` | `00077831` | `00224628` | `00224645` |
| `metabolic-agent` | `0029F3FD` | `00224641` | `0022465E` |
| `neurologic` | `0029F408` | `00224626` | `00224643` |
| `nutrient` | `000777E6` | `00224640` | `0022465D` |
| `ornamental` | `00077822` | `0022463F` | `0022465C` |
| `pigment` | `0029F401` | `0022462F` | `0022464C` |
| `sealant` | `0007782D` | `0022462E` | `0022464B` |
| `sedative` | `0007782B` | `00224632` | `0022464F` |
| `spice` | `0007782E` | `0022462D` | `0022464A` |
| `stimulant` | `00077825` | `0022463A` | `00224657` |
| `structural` | `000777FA` | `0022462C` | `00224649` |
| `toxin` | `00077823` | `0022463E` | `0022465B` |

The variant EditorIDs are the canonical EditorID suffixed with
`FaunaHerbivore` or `FaunaCarnivore`. This systematic duplication explains why
the stable source FormID is essential. None of the tracker names is composed,
derived, or represented only as a concept, and no selected generic record is
reused as another tracker identity.

## Provider and override results

Provider resolution used C7's full-module identity normalization and the exact
ordered authoritative set only:

```text
Starfield.esm -> ShatteredSpace.esm -> SFBGS00D.esm
```

All 22 logical chains contain one provider, all winners serialize the selected
`topLevel.FULL`, and `RecordSourcePlugin == NameSourcePlugin` on every row.

| Plugin | Canonical resource records | Name-provider rows | Override chains | Inherited fields |
|---|---:|---:|---:|---:|
| `Starfield.esm` | 22 | 22 | 0 | 0 |
| `ShatteredSpace.esm` | 0 | 0 | 0 | 0 |
| `SFBGS00D.esm` | 0 | 0 | 0 | 0 |
| **Total** | **22** | **22** | **0** | **0** |

Therefore the addendum contributes 22 single-provider records, zero
nontrivial provider chains, 22 winner-owned localized fields, and zero
inherited fields. `SFBGS050.esm` was not inspected as an authoritative
provider and does not enter these counts.

## Current tracker data and flora/fauna reconciliation

The runtime organic resource population is currently produced from two joined
sources:

- `reference-source/biome-organic-resources.csv` owns the canonical Bethesda
  resource FormID, EditorID, source name, source plugin, and its flora/fauna
  output relationships;
- `reference-source/item-tracker-metadata.csv` owns the stable tracker
  `ItemId`/`ResourceId`, abbreviation (`ShortName`), tracker rarity, and the one
  reviewed display override.

`scripts/item-reference-data.mjs` reduces occurrence-grain organic rows by
resource FormID, checks the source identity for consistency, joins metadata by
that FormID, and emits the runtime resource objects. The provenance extension
can therefore join directly by stable ID without changing organic modeling.

Counts below are distinct canonical species identities, not repeated
planet/biome occurrence rows. This avoids inflating a species that appears in
several biomes. All 22 are used by at least one flora or fauna species.

| ResourceId | Current tracker source file | Flora reference count | Fauna reference count | Notes |
|---|---|---:|---:|---|
| `adhesive` | `item-tracker-metadata.csv` + `biome-organic-resources.csv` | 5 | 32 | Both |
| `amino-acids` | same | 8 | 23 | Both |
| `analgesic` | same | 7 | 24 | Both |
| `antimicrobial` | same | 16 | 46 | Both |
| `aromatic` | same | 8 | 29 | Both |
| `gastronomic-delight` | same | 0 | 1 | Fauna only; two occurrence rows for one species |
| `hallucinogen` | same | 14 | 23 | Both |
| `high-tensile-spidroin` | same | 1 | 0 | Flora only |
| `hypercatalyst` | same | 3 | 12 | Both |
| `immunostimulant` | same | 1 | 0 | Flora only |
| `luxury-textile` | same | 0 | 1 | Fauna only; two occurrence rows for one species |
| `metabolic-agent` | same | 50 | 79 | Both |
| `neurologic` | same | 1 | 0 | Flora only |
| `nutrient` | same | 80 | 100 | Both |
| `ornamental` | same | 18 | 44 | Both |
| `pigment` | same | 13 | 43 | Both |
| `sealant` | same | 71 | 95 | Both |
| `sedative` | same | 7 | 24 | Both |
| `spice` | same | 14 | 39 | Both |
| `stimulant` | same | 2 | 13 | Both |
| `structural` | same | 75 | 64 | Both |
| `toxin` | same | 68 | 79 | Both |

This result confirms that the tracker population is internally consistent; the
species output records are corroborating relationships, not the source from
which localized resource names should be derived.

## Gastronomic Delight special case

The exact record evidence is:

```text
tracker identity/display: resource:gastronomic-delight / Gastronomic Delight
canonical source record:  Starfield.esm IRES:0007782F
record EditorID:           ResOrgUniqueGastronomic
localized field:           topLevel.FULL
official string identity:  Starfield.esm:strings:000081A0
official English:          Gastro Delight
official Japanese:         美食の喜び
```

`item-tracker-metadata.csv` deliberately preserves `Gastro Delight` as the
source `CanonicalName` and `Gastronomic Delight` as `DisplayNameOverride`.
`scripts/item-reference-data.mjs` asserts this is the sole current display
override. The provenance row should continue to use the tracker-visible
`CanonicalEnglish=Gastronomic Delight`, while English verification should be
approved through a new entity-scoped normalization:

```csv
resource,gastronomic-delight,Gastronomic Delight,Gastro Delight,TRACKER_NORMALIZATION,<reviewed display-override rationale>
```

That keeps the stable runtime display contract and records the official source
truth. Silently changing either value, treating the mismatch as exact, or
localizing from the display override would lose information.

## Schema and builder integration

The existing normalized schema is sufficient for every selected record. Each
new row should have:

```text
EntityKind             = resource
DisplayNameSourceKind  = direct
ComponentOrder         = 0
ComponentRole          = complete
RecordSignature        = IRES
NameFieldPath          = topLevel.FULL
NameStringTable        = strings
```

No organic-resource case requires an additional column or a second semantic
path. `IRES/topLevel.FULL` is already allowlisted for the current inorganic,
special-resource, and product populations.

The smallest coherent implementation point is C2 direct target assembly in
`scripts/localization/localized-name-provenance.mjs`:

1. reduce the already-loaded `biomeOrganic` source to unique, consistent
   `ResourceFormID` identities (the existing item reference builder provides
   the model to follow);
2. join each record to the `organic` row in `itemMetadata` by FormID and use
   its existing stable `ItemId` as `EntityId`;
3. use `DisplayNameOverride || CanonicalName` for tracker-visible
   `canonicalEnglish`, which makes the Gastronomic normalization explicit;
4. add the targets through C2's existing deduplicating `add()` path. The eight
   organic resources already encountered as recipe ingredients deduplicate;
   the 22 missing resources become new targets;
5. pass the resulting C2 target set through the unchanged exact-record,
   provider-chain, field-map, English verification, Japanese availability,
   coverage, sorting, and serialization machinery.

This is smaller than a parallel builder and keeps all direct `IRES` resource
names in one path. A tiny private helper for assembling organic-resource
targets is reasonable for readability, but it should feed `buildC2Targets()`
and `generateProvenance()` rather than expose a new provenance stage.

Implementation must also:

- add the Gastronomic Delight row to
  `reference-source/localized-name-normalizations.csv` and its code-owned
  normalization policy representation;
- update the expected closure/provider counts in
  `reference-source/localization-provenance-policy.json`;
- regenerate and review the existing Parcel C outputs using the installed-game
  build path;
- add focused tests for 30 organic metadata identities, 22 newly covered
  targets, exact direct-row shape, the Gastronomic normalization, and the
  unchanged three-master provider boundary.

No change belongs in `organic-provenance.mjs`; that module concerns localized
flora/fauna species names, not harvested-resource identities.

## Coverage and Parcel D impact

The arithmetic is confirmed from the committed population and the 22 unique
new stable resource IDs:

| Invariant | Current | Addendum | Expected |
|---|---:|---:|---:|
| Canonical/resolved entities | 3,539 | +22 | 3,561 |
| Provenance rows | 4,796 | +22 | 4,818 |
| Resource entities | 56 | +22 | 78 |
| Distinct record identities | current | +22 | current + 22 |
| Single-provider rows | current | +22 | current + 22 |
| Winner-owned fields | current | +22 | current + 22 |
| Override-chain rows | current | +0 | unchanged |
| Inherited fields | 0 | +0 | 0 |
| Approved normalizations | 2 | +1 | 3 |
| Unresolved entities/rows | 0 | +0 | 0 |

The entire provider-row delta belongs to `Starfield.esm`; the resulting totals
are `4,781 / 35 / 2` for
`Starfield.esm / ShatteredSpace.esm / SFBGS00D.esm` respectively. No composed
fauna count or row count changes.

The runtime/provenance set reconciliation is exact:

```text
runtime resource catalogue                         76
currently provenance-backed surfaced resources     54
new organic resource entities                      +22
post-addendum surfaced runtime coverage             76

post-addendum Parcel C resource entities            78
less source-only excluded aqueous-hematite           -1
less source-only excluded caelumite                  -1
surfaced runtime resources                           76
```

The current 22-item runtime-only set exactly equals the set audited in this
report; the current provenance-only set is exactly `aqueous-hematite` and
`caelumite`. The other Parcel D families and the resource exclusion policy are
unchanged. Parcel D can consume these rows by the existing
`resource:<ResourceId>` stable-ID overlay route and does not need to rediscover
organic identities.

## Future official DLC behavior

Future Bethesda DLC organic resources should enter only through an explicit,
reviewed mapping:

```text
new canonical organic ResourceId
+ authoritative Bethesda plugin/signature/FormID mapping
+ exact semantic localized-name path
-> existing direct target/provider-chain generator
```

The provider set remains the explicitly supported Bethesda masters in policy.
A new DLC master must be deliberately admitted and manifested before its
records are authoritative. Do not auto-discover arbitrary `IRES` records,
reverse-map by localized English, infer from fauna diet variants, or extend to
Creations/mods.

## Final answers and disposition

1. **Authoritative records:** yes, all 22 have exact canonical Bethesda
   records.
2. **Record signature:** `IRES` for all 22.
3. **Semantic path:** `topLevel.FULL` for all 22.
4. **Localized coverage:** 22/22 English and 22/22 Japanese.
5. **English mismatches:** one reviewed tracker/source difference,
   `Gastronomic Delight` versus official `Gastro Delight`; it requires an
   entity-scoped normalization during implementation.
6. **Provider chains:** 22 base-game single-provider chains, no DLC overrides,
   no inherited localized fields.
7. **Schema:** sufficient without modification.
8. **Implementation path:** extend C2's direct resource target assembly from
   the existing organic occurrence + item metadata join; reuse all current
   direct/provider machinery.
9. **New Parcel C totals:** 3,561 entities, 4,818 rows, zero unresolved; provider
   rows 4,781/35/2.
10. **Parcel D effect:** 76/76 surfaced runtime resources become
    provenance-backed; the two extra Parcel C resource entities remain
    source-only exclusions.
11. **Blockers:** none.

**Disposition: Outcome A — straightforward direct-name extension.** Proceed
only under a separate implementation instruction; this audit does not modify
production provenance outputs.

## Verification performed

- `npm run localization:provenance:verify` — passed against the unchanged
  committed baseline: 3,539 resolved entities, 4,796 rows, two normalizations,
  zero unresolved, and provider rows 4,759/35/2.
- `git diff --check` — passed for tracked changes.
- `git diff --no-index --check -- NUL <new audit report>` — emitted no
  whitespace diagnostics (exit 1 is the expected content-difference result for
  comparison with an empty input).
- Explicit trailing-whitespace scan of the new audit report — zero matches.

No production provenance output was changed. The only intended deliverable is
this audit report; the supplied implementation brief remains an untracked user
input.
