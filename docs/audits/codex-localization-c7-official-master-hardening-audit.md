# Codex audit: Localization Parcel C7 official-master hardening

Audit date: 2026-09-12

Installed game inspected: Starfield 1.16.244.0

Scope: the complete committed localized-name provenance population and exactly
`Starfield.esm`, `ShatteredSpace.esm`, and `SFBGS00D.esm`. No production C7
implementation was performed.

## 1. Executive result

**Disposition: Outcome B — focused C7 implementation still needed.**

The official population contains one nontrivial winning-record chain:

```text
body:0005E364 (Muphrid IV)
canonical identity: Starfield.esm PNDT object 05E364
providers: Starfield.esm 0005E364 -> SFBGS00D.esm 0005E364
winner: SFBGS00D.esm
selected field: baseFormComponents.TESFullName_Component.fullName.FULL
field provider: SFBGS00D.esm (explicitly serialized)
string table identity: SFBGS00D.esm:strings:0000A682
```

The committed row instead records
`Starfield.esm:strings:0000A682`. Both official tables currently resolve that ID
to `Muphrid IV` in English and `ムフリドIV` in Japanese, so the defect is hidden
by identical content. It is nevertheless the wrong provider provenance under
the intended C7 rule.

No winning record inherits the selected localized field. No current target
requires medium- or light-module FormID handling. All three supported masters
are full modules, and every current record identity normalizes without an
exception when its file-local FormID is interpreted through its TES4 master
list.

The existing CSV schema is sufficient: plugin qualification is retained for
both record and string identity. The remaining work is a narrow full-module
provider-chain implementation plus regression tests and regeneration, not a
general load-order or mod-support layer.

## 2. Evidence and method

The audit used:

- `reference-source/localized-name-provenance.csv` as the sole canonical target
  population;
- the committed C5 template lineage and C6 composed-fauna handoff to distinguish
  canonical species identity from the final name-bearing record/component;
- installed plugin bytes and TES4 headers from the three supported masters;
- the manifest-verified English and Japanese string tables already extracted
  under `.local-work/localization/inputs/`;
- the existing narrow record reader and semantic field map;
- an ignored diagnostic at
  `.local-work/localization/c7-audit/audit-c7.mjs`, whose result is
  `.local-work/localization/c7-audit/c7-audit.json`.

The diagnostic scanned only record signatures needed by the current population
and its C5 relationships: `IRES`, `BIOM`, `PERK`, `STDT`, `PNDT`, `FLOR`,
`NPC_`, `LVLN`, `OMOD`, and `INNR`. It did not discover new tracker entities.

For each record, it decoded the high byte of the file-local FormID against:

```text
[TES4 MAST entries..., containing plugin]
```

and retained the lower 24-bit object ID. It then grouped providers by:

```text
(record signature, origin plugin, object ID)
```

in the declared supported order:

```text
Starfield.esm -> ShatteredSpace.esm -> SFBGS00D.esm
```

Field ownership was tested by inspecting the exact serialized semantic field,
not by comparing resolved English text.

## 3. Identity terminology

This audit uses four distinct identities:

- **Canonical/origin record identity**: record signature, origin plugin, and
  origin-local object ID.
- **Winning record provider**: the last supported plugin that serializes a
  record for that canonical identity.
- **Localized field provider**: the latest provider in the chain that explicitly
  serializes the exact selected semantic name field.
- **String-table provider**: the plugin and table declared by that localized
  field provider, qualified with the raw string ID.

`RecordSourcePlugin` is consistent as canonical/origin ownership for direct
name-bearing records. It should remain `Starfield.esm` for Muphrid IV even
though `SFBGS00D.esm` wins the record.

It is not a universal canonical *entity* source column:

- template fauna rows identify the final encounter `NPC_`; canonical species
  identity remains in the C5 lineage artifact;
- composed fauna rows identify the selected `INNR` component record; canonical
  species identity remains in the C6 handoff.

That separation is already sufficient and should not be redesigned in C7.

## 4. Actual module classes and master relationships

| Plugin | TES4 flags | TES4 masters | Module class | FormID namespace exercised |
|---|---:|---|---|---|
| `Starfield.esm` | `00000081` | none | full | index `00` is the containing plugin |
| `ShatteredSpace.esm` | `00000081` | `starfield.esm` | full | `00` is `Starfield.esm`; `01` is the containing plugin |
| `SFBGS00D.esm` | `00000081` | `starfield.esm` | full | `00` is `Starfield.esm`; `01` is the containing plugin |

The flags are the ESM and localized-file flags; none of the three headers carries
a small/light or medium classification. Their own records also use the ordinary
full-module file index byte (`00` for the masterless base game and `01` for the
two one-master DLC files). SF1Edit's inspected load shows the same ordinary full
slots (`00`, `01`, and `02`).

Only the traditional full-module layout is exercised by C7. The broader
small/medium formats documented by current xEdit are real Starfield formats but
are not present in the supported source universe. See the
[xEdit 4.1.6 release notes](https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/whatsnew.md)
for that distinction.

## 5. Current FormID model and required normalization

### Current production behavior

The current sources and crosswalk store xEdit `FixedFormID`-style, file-local
eight-digit values and always retain the supplying plugin. Examples:

```text
Starfield.esm       IRES 000057D6 -> origin Starfield.esm object 0057D6
ShatteredSpace.esm  PNDT 01000801 -> origin ShatteredSpace.esm object 000801
SFBGS00D.esm        IRES 01033E3F -> origin SFBGS00D.esm object 033E3F
SFBGS00D.esm        PNDT 0005E364 -> origin Starfield.esm object 05E364
```

The reader currently selects raw uint32 FormIDs exactly. C2/C4 and direct C5
look only in the canonical source plugin. C3 joins STDT records by audited
numeric system identity. C5/C6 relationship maps and provider chains are keyed
by raw signature/FormID, not by a decoded origin identity.

That was sufficient for C1-C6's selected records, but it cannot discover the
Muphrid IV override because direct-body generation never constructs a provider
chain. The current code therefore still assumes
`RecordSourcePlugin == NameSourcePlugin` on direct-name paths.

### Required narrow normalization

C7 needs only this full-module rule:

1. read the ordered TES4 `MAST` list;
2. append the containing plugin as the local namespace;
3. interpret the high byte of each record FormID as an index into that list;
4. use the lower 24 bits as the object ID;
5. key a logical record by `(signature, origin plugin, object ID)`;
6. retain the original plugin-qualified `RecordFormID` in committed provenance.

There were zero invalid indices, normalization exceptions, or ambiguous target
identities across all 4,796 rows. No schema or runtime-ID migration is needed.
The stored `RecordFormID` is durable within this fixed official-master model
because the plugin qualification and official master chain are both retained.

Canonical identity does not depend on the declared order of the three input
files. The only override is owned by `SFBGS00D.esm`, which necessarily follows
its `Starfield.esm` master; `ShatteredSpace.esm` does not participate in that
chain. Swapping the two sibling DLC inputs would not change any canonical or
winning identity.

## 6. Complete population inventory

The committed population matches the expected C6 totals:

| Measure | Count |
|---|---:|
| Resolved entities | 3,539 |
| Provenance rows/components | 4,796 |
| Unresolved rows | 0 |
| Distinct name-bearing logical records | 2,619 |
| Provider-chain length 1, rows | 4,795 |
| Provider-chain length greater than 1, rows | 1 |
| Provider-chain length 1, distinct records | 2,618 |
| Provider-chain length greater than 1, distinct records | 1 |
| No override chain | 4,795 rows |
| Nontrivial chain; winner explicitly owns field | 1 row |
| Nontrivial chain; winner inherits field | 0 rows |
| Ambiguous/unresolved provider cases | 0 |
| FormID normalization exceptions | 0 |

The plugin inventory below defines `WinningRecords` as distinct logical
name-bearing records and `NameProviders` as provenance rows/components after
applying the audited provider rule.

| Plugin | ModuleClass | CanonicalEntities | WinningRecords | NameProviders |
|---|---|---:|---:|---:|
| `Starfield.esm` | full | 3,499 | 2,582 | 4,759 |
| `ShatteredSpace.esm` | full | 39 | 35 | 35 |
| `SFBGS00D.esm` | full | 1 | 2 | 2 |

The committed provider counts are currently 4,760 / 35 / 1. Correcting Muphrid
IV moves one name-provider row from `Starfield.esm` to `SFBGS00D.esm` without
changing canonical-entity ownership.

### By entity kind

| Entity kind | Provenance rows |
|---|---:|
| biomes | 428 |
| bodies | 1,776 |
| fauna | 2,225 |
| flora | 153 |
| official terms/skills | 5 |
| products | 30 |
| resources | 56 |
| systems | 123 |

### By signature and provider-chain length

| Signature | Entity families | Rows | Distinct records | Nontrivial rows | Nontrivial records |
|---|---|---:|---:|---:|---:|
| `IRES` | resources, products | 86 | 86 | 0 | 0 |
| `BIOM` | biomes | 428 | 428 | 0 | 0 |
| `PERK` | official terms/skills | 5 | 5 | 0 | 0 |
| `STDT` | systems | 123 | 123 | 0 | 0 |
| `PNDT` | bodies | 1,776 | 1,776 | 1 | 1 |
| `FLOR` | flora | 153 | 153 | 0 | 0 |
| `NPC_` | direct and template fauna | 46 | 46 | 0 | 0 |
| `INNR` | composed-fauna components | 2,179 | 2 | 0 | 0 |

The sole nontrivial case is a body/`PNDT`, with canonical ownership in
`Starfield.esm` and the winner in `SFBGS00D.esm`. There are no nontrivial
`IRES`, `BIOM`, `PERK`, `STDT`, `FLOR`, `NPC_`, or selected `INNR` chains.

## 7. Winning-record and localized-field result

### Muphrid IV

Both providers serialize the exact selected `PNDT` full-name component:

| Provider | Raw file FormID | Serialized `FULL` ID | English table result | Japanese table result |
|---|---:|---:|---|---|
| `Starfield.esm` | `0005E364` | `0000A682` | Muphrid IV | ムフリドIV |
| `SFBGS00D.esm` | `0005E364` | `0000A682` | Muphrid IV | ムフリドIV |

The winning override's serialized subrecord sequence includes the audited
`BFCB(TESFullName_Component) / FULL / BFCE` field. Therefore this is category A:
the winner owns the selected field. Equal text and equal numeric string ID do
not make the base table the provider.

Correct provenance is:

```text
RecordSourcePlugin = Starfield.esm
RecordFormID        = 0005E364
NameSourcePlugin    = SFBGS00D.esm
NameStringTable     = strings
NameStringID        = 0000A682
```

### Inheritance

There are **zero** live inherited localized fields. Consequently no live
example can be supplied without inventing one. Backward field-provider walking
is still the correct small synthetic case because it is part of the intended
algorithm and prevents a future official override that omits `FULL` from
failing or borrowing the wrong table.

## 8. Same numeric string IDs across plugins

Among the 2,829 distinct current `NameStringID` values, three relevant IDs are
present in more than one supported plugin's `strings` table:

| String ID | `Starfield.esm` | `ShatteredSpace.esm` | `SFBGS00D.esm` | Selected current entity |
|---:|---|---|---|---|
| `00002378` | Weakness | Female Groat | Plant | `fauna:0107BDA9` from `ShatteredSpace.esm` |
| `00002379` | AAA Chance | Kid Groat | Water | `fauna:0107BDAA` from `ShatteredSpace.esm` |
| `0000A682` | Muphrid IV | absent | Muphrid IV | `body:0005E364`; winner is `SFBGS00D.esm` |

Two of the three IDs resolve to different text in every table. This proves that
a bare string ID is unsafe even in the intentionally narrow official universe.
The existing qualified identity
`(NameSourcePlugin, NameStringTable, NameStringID)` is sufficient; no reverse
text matching or broader table-discovery system is needed.

No two committed provenance rows use the same bare record FormID across
different source plugins, and the scan found no raw
`(signature, file-local FormID)` collision representing different origins among
the relevant direct/C5 signatures. Plugin qualification must still remain: the
same `01xxxxxx` namespace independently denotes records owned by either
one-master DLC, and file-local IDs are not global load-order IDs.

## 9. Current field-provider algorithm audit

The intended algorithm is only partly implemented.

Already correct:

- exact allowlisted semantic paths select the raw four-byte localized ID;
- string resolution is keyed by plugin and table;
- missing fields and missing string IDs fail closed;
- English verification does not reverse-match text;
- C6 uses explicit INNR rule serialization and rejects provider ambiguity;
- localization archives/tables are manifest-backed and hash-checked.

Remaining gap:

- direct C2/C4 and direct C5 generation selects only the canonical-source file;
- no shared logical provider chain is built from TES4 master-relative record
  identity;
- there is no winner-first exact-field walk;
- the direct row constructor assigns the record plugin to
  `NameSourcePlugin` unconditionally;
- C3's system-number join is unique-provider oriented rather than
  override-chain oriented;
- C5/C6 relationship maps key raw file-local FormIDs rather than explicitly
  normalized origin identities.

No current code path silently opens an unqualified table; table maps are
qualified. The defect occurs earlier, when the wrong plugin is selected as the
field provider. Muphrid IV is the only current output affected.

## 10. Family-specific findings

### Direct-name populations

All current nontrivial cases were inspected across `IRES`, `BIOM`, `PERK`,
`STDT`, `PNDT`, `FLOR`, and `NPC_`. Only `PNDT:Starfield.esm:05E364` has more
than one supported provider. The winner explicitly owns `FULL`; no DLC-owned
direct record inherits a base-game localized field.

### Template fauna

All five template-fauna entities remain canonically identified by their
original base-game species. Their selected localized names still come from the
final encounter `NPC_.FULL`, and all five final name-bearing NPCs have a
single-provider chain in `Starfield.esm`. The C5 lineage columns for canonical
NPC, LVLN, leveled NPC, and encounter NPC remain sufficient. No redesign is
needed.

### Composed fauna

The result agrees with C6 without redoing its naming audit. The 922 composed
fauna emit 2,179 component rows from two selected base-game INNR records, and
neither INNR has a nontrivial provider chain. The four Shattered Space species
emit ten name-component rows, all from `Starfield.esm` INNR/string providers.
This is deliberate cross-plugin entity-to-component provenance, not inheritance
or ambiguity.

## 11. Representative proofs

1. **Ordinary base-game record:** Aluminum is
   `Starfield.esm IRES:000057D6 topLevel.FULL`, resolving
   `Starfield.esm:strings:00008155` to `Aluminum`. Its chain length is one.
2. **Shattered Space-owned record:** Va'ruun'kai is
   `ShatteredSpace.esm PNDT:01000801`, normalized to origin object `000801`,
   resolving `ShatteredSpace.esm:strings:0001492D`. Its chain length is one.
3. **X-Tech:** X-Tech is `SFBGS00D.esm IRES:01033E3F`, normalized to origin
   object `033E3F`, resolving `SFBGS00D.esm:strings:00000FC7`. Its chain length
   is one.
4. **Shattered Space composed fauna:** `fauna:0103D5E0`, Herding Olgreg
   Scavenger, is canonically a `ShatteredSpace.esm` NPC but uses three
   `Starfield.esm` INNR components: `0003355B`, `000335AB`, and `00033595`.
5. **Nontrivial override:** Muphrid IV is the two-provider PNDT chain described
   above; `SFBGS00D.esm` wins and explicitly owns the selected field.
6. **Inherited field:** none exists in the current official population.
7. **Actual module-class example:** all three preceding ordinary/DLC examples
   use the sole actual class, full modules. No medium/light example exists in
   scope.
8. **Template fauna:** `fauna:0008D0D8` retains canonical NPC `0008D0D8` but
   resolves its name from final encounter `Starfield.esm NPC_:0008D0D6`; every
   lineage provider is a single-provider base-game record.

## 12. Archive and table association

The current intake manifest deterministically maps each provider to exact
archive members and verifies extracted table hashes:

| Provider | Localization archive/member source | Available audited locales/tables |
|---|---|---|
| `Starfield.esm` | `Starfield - Localization.ba2` | en/ja × strings/dlstrings/ilstrings |
| `ShatteredSpace.esm` | `ShatteredSpace - Main02.ba2` (from the explicit Main01/Main02 set) | en/ja × strings/dlstrings/ilstrings |
| `SFBGS00D.esm` | `SFBGS00D - Main.ba2` | en/ja × strings/dlstrings/ilstrings |

Archive filenames do not establish ownership; exact manifest plugin/member
mapping does. No new archive-discovery mechanism is needed.

## 13. `SFBGS050.esm` boundary

`SFBGS050.esm` is still present in the local C2-C6 config and in
`OFFICIAL_SYSTEM_PLUGINS`, so it is a historical/supported-input compatibility
artifact. It contributes:

```text
canonical tracker entities: 0
committed provenance rows: 0
committed NameSourcePlugin rows: 0
```

It does contain an override of the canonical Algorab II body
(`Starfield.esm PNDT:0005DE57`) with an explicit equal `FULL`, but that plugin is
outside C7's three-master authoritative universe and therefore is not a C7
winning provider. Follow-up C7 work should keep compatibility with existing
input configs while making the authoritative three-plugin boundary explicit;
it should not silently promote `SFBGS050.esm` into the supported source set.

## 14. Smallest synthetic and regression coverage

Recommended focused coverage:

1. a full-module override that explicitly owns `FULL` and therefore supplies
   `NameSourcePlugin`;
2. a full-module override that omits `FULL`, requiring a backward walk to its
   master's explicit field;
3. the same numeric string ID in two provider tables with different text,
   proving qualified lookup;
4. the same lower 24-bit object ID in two independent full plugins, proving
   origin-plugin qualification;
5. a real installed-data regression asserting that Muphrid IV retains
   `RecordSourcePlugin=Starfield.esm` and gains
   `NameSourcePlugin=SFBGS00D.esm`;
6. preservation tests for X-Tech, a Shattered Space-owned direct record, all
   five template lineages, and the two selected C6 INNR chains.

Medium/light synthetic decoding is unnecessary scope for this tracker. None of
the three supported masters uses those classes, and adding generic coverage
would create infrastructure for unsupported content rather than protect a
current official source.

## 15. Exact recommended C7 implementation scope

Implement one small hardening batch:

1. add a narrow TES4 header/master-list reader for the three allowlisted
   full-module inputs;
2. normalize record provider identity to `(signature, origin plugin, object ID)`;
3. build provider chains in the explicitly declared supported order;
4. select the winner, inspect the exact semantic path, and walk backward only
   when that field is absent;
5. resolve the ID against that field provider's qualified table;
6. keep canonical `RecordSourcePlugin`/`RecordFormID` unchanged;
7. regenerate the crosswalk so only Muphrid IV changes
   `NameSourcePlugin` from `Starfield.esm` to `SFBGS00D.esm`;
8. add the focused synthetic and installed-data regression tests above;
9. document the authoritative three-plugin boundary while preserving
   `SFBGS050.esm` config compatibility as needed.

Do not add arbitrary Creation/mod discovery, user-selected load order support,
LOOT/libloadorder, a generic full/medium/light FormID abstraction, Mutagen, or a
generic override browser. C8 remains responsible for final builder integration,
coverage gates, reproducible regeneration, and Parcel D handoff completeness.

## 16. Final answers

- **Are any current localized fields inherited across supported masters?** No;
  the inherited-field count is zero.
- **Does `RecordSourcePlugin` differ from the correct `NameSourcePlugin`?** Yes,
  for exactly one row after applying the intended rule: Muphrid IV remains
  canonically `Starfield.esm` but its winning explicit field is supplied by
  `SFBGS00D.esm`. The committed row does not yet record that difference.
- **Does any target need medium/light FormID handling?** No. All supported
  masters are full modules.
- **Would bare FormIDs be ambiguous without plugin qualification?** The current
  target rows have no observed cross-plugin bare-record collision, but
  file-local IDs are namespace-relative and cannot safely lose plugin identity.
  Bare string IDs are demonstrably ambiguous: two relevant IDs resolve to
  different text in all three supported tables.
- **Are current provenance rows already safe?** Structurally, yes: the qualified
  schema can represent every case and there are no unresolved identities.
  Semantically, not completely: one row names the wrong field/string provider.
- **Does C7 collapse to a small hardening task?** Yes. It is a focused provider
  chain and regression-test change, not the original broad full/medium/light
  estimate.
- **Are arbitrary mods/Creations in scope?** No. They remain explicitly out of
  scope.

## 17. Verification performed

- `node .local-work/localization/c7-audit/audit-c7.mjs` — passed; produced the
  inventory and traced-provider evidence summarized above.
- `npm test` — passed: 130 tests.
- `npm run reference:test` — passed: 103 tests.
- `npm run localization:provenance:test` — passed: 56 tests.
- `git diff --check` — passed.

`npm run build` and `npm run lint` were not run because the audit changed no
tracked production file; the brief makes those checks optional in that case.
