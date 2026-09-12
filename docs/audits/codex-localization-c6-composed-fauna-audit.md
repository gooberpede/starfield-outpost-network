# Localization Parcel C6: Composed-Fauna Naming and Locale-Aware Assembly Audit

## Executive verdict

The C6 population is exactly **922 CCT-composed fauna**. All 922 reconstruct
their committed C5 canonical English name exactly from selected localized
`INNR.WNAM` components. There are no English mismatches, ambiguous composed
names, unsupported shapes, missing selected English or Japanese component
strings, or provider ambiguities.

For this population, the supported architecture outcome is **Model A — fixed
role order**, with one qualification about the strength of the Japanese display
evidence:

```text
prefix (when present)
species/body (required)
diet (when present)
```

The order is structural, not localized:

- `dn_CCTPrefixes` contributes the optional prefix;
- `dn_CCTSuffixes` ruleset 0 contributes the required species/body;
- `dn_CCTSuffixes` ruleset 1 contributes the optional diet;
- the production exporter emits those roles in that order and inserts a literal
  ASCII space (`U+0020`) only between non-empty components;
- English and Japanese resolve the same qualified component identities and
  retain the same role sequence;
- no selected English or Japanese component contains leading/trailing
  whitespace, punctuation, or a localized format/template.

Japanese grammar is carried inside the localized component strings. For
example, English `Herding` and Japanese `遊牧の` are the two locale values of
the same qualified WNAM identity. Japanese does not reverse the role sequence.

Official string tables do not contain a second, fully composed fauna string to
compare against: the names are dynamic outputs of the rules. Publicly captured
Japanese player data independently shows the same prefix → species → diet order
and spaced display (for example `遊牧の ボーンバック グレイザー`). That is
strong corroboration, but a direct Japanese runtime/Creation Kit capture remains
the final hardening check for exact on-screen separator fidelity.

The existing normalized provenance schema is sufficient. C6 does not need a
composition/template entity, a locale-specific order table, or a
`CompositionRuleId`. One row per emitted localized component is faithful if
`ComponentOrder` uses the fixed semantic slots `0=prefix`, `1=species`, and
`2=diet`, and `NameFieldPath` includes the ruleset and rule indices.

## Scope and evidence

### Population boundary

The sole population source was:

```text
reference-source/localized-name-provenance-c6-fauna.csv
```

It contains 922 unique `fauna` identities and exactly matches the C5 deliberate
deferrals. No NPC discovery was used to expand the population. The separate C5
template lineage file contains five non-C6 fauna and was inspected only to
confirm that it does not overlap this parcel.

### Installed inputs

The audit used the locally manifested game version `1.16.244.0` and this load
order:

1. `Starfield.esm`
2. `ShatteredSpace.esm`
3. `SFBGS00D.esm`
4. `SFBGS050.esm`

The committed localization intake manifest supplied official English and
Japanese `strings`, `dlstrings`, and `ilstrings` tables for every plugin. The
audit revalidated the manifest size and SHA-256 metadata before reading a table.

The brief names `Starfield - Export Planet Biome Organic Resources(1).pas`, but
that exact filename is not present locally. The active unsuffixed production
file is version 2.0.3:

```text
D:\tools\xEdit.4.1.5p\Edit Scripts\Starfield - Export Planet Biome Organic Resources.pas
SHA-256 3A65505F28CF8BD6F2E17ABA8E57BB4BB614DE5347AA402E8E2D89C26724DEBA
```

The retained `v2.0.2` copy has identical CCT naming logic; its only substantive
difference is an unrelated planet-name field fix plus the version label. The
filename discrepancy therefore does not affect C6 conclusions.

### Diagnostic method

The ignored diagnostic under `.local-work/localization/c6-audit/`:

1. read only the 922 handoff identities;
2. selected their exact source `NPC_` records;
3. decoded native `KWDA` keywords;
4. decoded every `OBTS` combination;
5. followed included `OMOD` records recursively and collected `NKEY`
   (`NPC - Keyword`) properties;
6. selected prefix/species/diet rules with the production precedence;
7. resolved each selected WNAM by exact plugin, table type, and raw string ID in
   English and Japanese;
8. reconstructed English with the exporter assembly rule and compared it
   exactly to C5;
9. inventoried shapes, providers, reuse, ties, empty components, and formatting.

The temporary Japanese path decodes official Japanese tables as UTF-8. The
current production `string-table-reader.mjs` always uses Windows-1252 because
it was built for the earlier English-only provenance parcels; using it unchanged
on Japanese bytes produces mojibake. This is an implementation requirement for
C6, not a data ambiguity.

## Exact records and field model

Only two CCT-specific instance-naming records are used:

| Role | Record | Source/provider | Populated rulesets | Selected WNAM table |
| --- | --- | --- | ---: | --- |
| prefix | `INNR:00220394` `dn_CCTPrefixes` | `Starfield.esm` | set 0: 10 rules | `Starfield.esm:strings` |
| species/body | `INNR:003E8650` `dn_CCTSuffixes` | `Starfield.esm` | set 0: 218 rules | `Starfield.esm:strings` |
| diet | `INNR:003E8650` `dn_CCTSuffixes` | `Starfield.esm` | set 1: 7 rules | `Starfield.esm:strings` |

Both records have `UNAM=0x32`, which the current xEdit Starfield definition
identifies as target `Actor`. Each record serializes ten ordered `VNAM`
rulesets. All remaining rulesets are empty.

The exact component field path is:

```text
INNR
  > Naming Rules
    > Ruleset[ruleSetIndex]
      > Names
        > Name[ruleIndex]
          > WNAM - Text
```

`WNAM` is a four-byte localized string ID and uses the plugin's `.strings`
table. The current xEdit Starfield definition likewise describes WNAM as a
translatable localized string and warns that naming rules must not be sorted;
the array order is meaningful. See the primary xEdit definition for
[`INNR` in `wbDefinitionsSF1.pas`](https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/Core/wbDefinitionsSF1.pas#L12460-L12713).

There is no field that labels a rule as “prefix”, “species”, or “diet”. Those
roles are encoded by record identity plus ruleset ordinal:

```text
dn_CCTPrefixes / set 0 => prefix
dn_CCTSuffixes / set 0 => species/body
dn_CCTSuffixes / set 1 => diet
```

This confirms that prefix and suffix are separate rule records, while species
and diet are distinct ordered positions within the suffix record. No other INNR
record participates in any of the 922 names.

## Rule-selection semantics

The production exporter and committed C5 implementation agree on this
selection algorithm independently within each role/ruleset:

1. a rule matches only when it has at least one required keyword and every
   required keyword is in the effective keyword set;
2. greatest required-keyword count wins;
3. for equal specificity, highest `YNAM - Index` wins;
4. for equal specificity and YNAM, earliest serialized rule index wins.

The effective keyword set is the union of:

- native NPC `KWDA` keywords;
- `NKEY` keyword properties from every OMOD included by the selected `OBTS`;
- `NKEY` keyword properties from recursively included OMODs.

Full-population validation found no deviation from this precedence:

- prefix selections: 561 one-keyword and 41 two-keyword winners;
- species selections: 922 one-keyword winners;
- diet selections: 638 one-keyword and 17 two-keyword winners;
- prefix YNAM: 596 winners at 5 and six `Apex` winners at 4;
- species and diet: every winner has YNAM 5;
- eight fauna have two matching prefix rules tied on specificity and YNAM;
  earliest rule order selects the C5-exact result in every case.

The eight rule-order tie cases are:

```text
001A634D  Swarming Arachnofly Scavenger
001A634E  Swarming Shardhopper Scavenger
001AD18F  Hunting Sloth Geophage
001E4E98  Swarming Shardhopper
001E757E  Swarming Maggotmaw
001E757F  Pack Trapmaw
001EF5E8  Pack Lionbear
003AD1FA  Pack Cockroach Stalker
```

Thirty-five fauna exercise recursive OMOD includes. The recursion is necessary
to reproduce the exporter keyword set, although none of the selected C6 naming
keywords depends exclusively on a nested OMOD in this installed population.

## Representative traces

All representatives have one `OBTS` combination. The C6 population contains no
fauna with multiple Object Template combinations, so the requested multi-
combination sample shape does not exist.

The two native keywords seen in most examples are shown to establish the start
of the trace; naming-role keywords below are supplied by the named OMODs.

| Fauna | Native KWDA | Top-level OMODs | Selected naming keyword source |
| --- | --- | ---: | --- |
| `000065E2` Carasnail Scavenger | `002AD3EC`, `001E667F` | 9 | species `0009EBA7` from `mod_CCT_Skin_CritterCarasnail`; diet `003CB21D` from `mod_CCT_Diet_Omnivore` |
| `0019BD96` Herding Dodo Scavenger | `002AD3EC`, `001E667F` | 13 | prefix `00200B05` from `mod_CCT_Faction_PreyA_HerdMedium`; species `000992E2` from `mod_CCT_Skin_BipedADodo`; diet `003CB21D` from `mod_CCT_Diet_Omnivore` |
| `0019B89E` Hunting Tuskfrog | `002AD3EC`, `001E667F` | 14 | prefix `003E56E4` from `mod_CCT_Faction_PredatorB`; species `0009937B` from `mod_CCT_Skin_HopperASpikedFrog` |
| `0008BDB7` Schooling Kronosaurus Scavenger | `002AD3EC`, `001E667F` | 11 | two-keyword prefix from `mod_CCT_Skin_SwimmerAKronosaurus` + `mod_CCT_Faction_PreyC_HerdSmall`; species from the skin OMOD; diet from `mod_CCT_Diet_Omnivore` |
| `00048A34` Apex Parrothawk | `002AD3EC`, `001E667F` | 10 | prefix `00200B04` from `mod_CCT_Faction_PredatorALL`; species `0009935E` from `mod_CCT_Skin_FlyerAKite` |
| `001A634D` Swarming Arachnofly Scavenger | `002AD3EC`, `001E667F` | 14 | prefix `003CB21C` from `mod_CCT_Faction_PredatorA_HerdLarge`; species from `mod_CCT_Skin_HexapodAArchnofly`; diet from `mod_CCT_Diet_Omnivore`; exercises rule-order tie |
| `003AD1FA` Pack Cockroach Stalker | `002AD3EC`, `001E667F` | 16 | prefix and one Stalker keyword from `mod_CCT_Faction_PredatorB_HerdMedium`; second Stalker keyword from `mod_CCT_Enviro_Ambusher_2`; species from `mod_CCT_Skin_MantidACockroach` |
| `0019B898` Beetle Grazer | `002AD3EC`, `001E667F` | 10 | species from `mod_CCT_Skin_CritterFlatBeetle`; diet from `mod_CCT_Diet_Ruminant`; highly reused species component |
| `0103D5DE` Tubecrawler Scavenger | `002AD3EC`, `001E667F` | 10 | Shattered Space NPC; base-game skin/diet OMODs and components |
| `0103D5DF` Hunting Twintail | `002AD3EC`, `001E667F` | 10 | Shattered Space NPC; base-game faction/skin OMODs and components |
| `0103D5E0` Herding Olgreg Scavenger | `002AD3EC`, `001E667F` | 11 | Shattered Space NPC; base-game faction/skin/diet OMODs and components |
| `0103D5E1` Herding Wobbleback Grazer | `002AD3EC`, `001E667F` | 10 | Shattered Space NPC; base-game faction/skin/diet OMODs and components |

`0019B89E` also proves recursive traversal: top-level
`mod_CCT_Attack_Anti-Armor2` includes `OMOD:000B8270`
`mod_CCT_Attack_PiercingDamageType`. Neither record contributes the selected
name, but both are present in the audited effective traversal.

### Exact component records, paths, and localized identities

In the following table, all rows have:

```text
RecordSignature    INNR
RecordSourcePlugin Starfield.esm
NameSourcePlugin   Starfield.esm
NameStringTable    strings
```

`P` is `INNR:00220394 dn_CCTPrefixes`; `S` and `D` are
`INNR:003E8650 dn_CCTSuffixes`. The bracket pair is
`[rulesetIndex, ruleIndex]` and maps to the exact WNAM path documented above.

| Fauna | Prefix component | Species/body component | Diet component |
| --- | --- | --- | --- |
| `000065E2` Carasnail Scavenger | absent | `S[0,27]` ID `00033654`: `Carasnail` / `カラカタツムリ` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `0019BD96` Herding Dodo Scavenger | `P[0,7]` ID `0003355B`: `Herding` / `遊牧の` | `S[0,13]` ID `00033662`: `Dodo` / `ドードー` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `0019B89E` Hunting Tuskfrog | `P[0,4]` ID `0003355E`: `Hunting` / `狩猟する` | `S[0,93]` ID `00033612`: `Tuskfrog` / `タスクフロッグ` | absent |
| `0008BDB7` Schooling Kronosaurus Scavenger | `P[0,5]` ID `0003355D`: `Schooling` / `調教された` | `S[0,209]` ID `0003359E`: `Kronosaurus` / `クロノサウルス` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `00048A34` Apex Parrothawk | `P[0,1]` ID `00033561`: `Apex` / `頂点の` | `S[0,64]` ID `0003362F`: `Parrothawk` / `オウムタカ` | absent |
| `001A634D` Swarming Arachnofly Scavenger | `P[0,2]` ID `00033560`: `Swarming` / `群れをなす` | `S[0,70]` ID `00033629`: `Arachnofly` / `スパイダーフライ` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `003AD1FA` Pack Cockroach Stalker | `P[0,3]` ID `0003355F`: `Pack` / `群れの` | `S[0,126]` ID `000335F1`: `Cockroach` / `ゴキブリ` | `D[1,0]` ID `00033596`: `Stalker` / `ストーカー` |
| `0019B898` Beetle Grazer | absent | `S[0,31]` ID `00033650`: `Beetle` / `カブトムシ` | `D[1,2]` ID `00033594`: `Grazer` / `グレイザー` |
| `0103D5DE` Tubecrawler Scavenger | absent | `S[0,99]` ID `0003360C`: `Tubecrawler` / `チューブクローラー` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `0103D5DF` Hunting Twintail | `P[0,4]` ID `0003355E`: `Hunting` / `狩猟する` | `S[0,12]` ID `00033663`: `Twintail` / `ツインテール` | absent |
| `0103D5E0` Herding Olgreg Scavenger | `P[0,7]` ID `0003355B`: `Herding` / `遊牧の` | `S[0,196]` ID `000335AB`: `Olgreg` / `オルグレグ` | `D[1,1]` ID `00033595`: `Scavenger` / `スカベンジャー` |
| `0103D5E1` Herding Wobbleback Grazer | `P[0,7]` ID `0003355B`: `Herding` / `遊牧の` | `S[0,201]` ID `000335A6`: `Wobbleback` / `ウォブルバック` | `D[1,2]` ID `00033594`: `Grazer` / `グレイザー` |

Every representative uses the same qualified string identity for both locales:

```text
(Starfield.esm, strings, raw WNAM string ID)
```

No cross-extension or cross-plugin string-ID match is required.

## Order and formatting

### Where order comes from

The production exporter explicitly selects:

```text
dn_CCTPrefixes ruleset 0
dn_CCTSuffixes ruleset 0
dn_CCTSuffixes ruleset 1
```

and then emits:

```text
prefix, species/body, diet
```

while skipping empty components. Within `dn_CCTSuffixes`, the species-before-
diet relationship is also the serialized ruleset order. xEdit's primary record
definition expressly retains ruleset order. No localized order field, format
string, placeholder template, or higher-level localized formatter appears in
either CCT INNR record or in any selected WNAM.

The prefix-versus-suffix boundary is a naming category boundary: the dedicated
prefix INNR is applied before the ordered suffix rulesets. It is not inferred
from English word appearance.

### English and Japanese comparison

Exact representative assembly is:

| Shape | English | Japanese, same structural sequence |
| --- | --- | --- |
| species + diet | `Carasnail Scavenger` | `カラカタツムリ スカベンジャー` |
| prefix + species + diet | `Herding Dodo Scavenger` | `遊牧の ドードー スカベンジャー` |
| prefix + species | `Hunting Tuskfrog` | `狩猟する タスクフロッグ` |
| prefix + species + diet | `Schooling Kronosaurus Scavenger` | `調教された クロノサウルス スカベンジャー` |
| prefix + species | `Apex Parrothawk` | `頂点の オウムタカ` |

Japanese therefore has **the same logical component order** as English. It is
not a diet-first or species-first locale variant, and no localized template
reorders the roles. Locale-specific syntax such as Japanese `の` is inside the
localized prefix WNAM itself.

Independent Japanese player-observed data lists names in the same order and
shows spaces between roles; examples include `遊牧の ボーンバック グレイザー`,
`群れの ボーンバック`, and `群れをなす ボーンバック` on
[MonoGamer's Japanese Starfield fauna catalogue](https://monogamer.net/sf/flora-fauna/?d1=%E3%83%9C%E3%83%BC%E3%83%B3%E3%83%90%E3%83%83%E3%82%AF).
Another Xbox player transcription independently retains the same role order,
though its spacing is inconsistent enough that it is not suitable as byte-exact
separator proof.

### Spaces and punctuation

The production exporter adds a literal `U+0020` between non-empty components.
It does not add a leading or trailing space and does not emit a separator for a
missing role.

Across all 2,179 selected component occurrences:

- zero English values have leading/trailing whitespace;
- zero Japanese values have leading/trailing whitespace;
- zero selected values carry separator punctuation;
- no selected component is inline/non-localized;
- no format/template string supplies spacing;
- Japanese component bytes are UTF-8 and contain no implicit ASCII or ideographic
  boundary space.

The supported formatting model is therefore assembler-inserted spaces, not
localized separators or phrase fragments. Japanese linguistic affixes such as
`の` are content inside one component, not inter-component punctuation.

### Hidden and empty components

The prefix ruleset contains one `WNAM=0` rule and the two populated suffix
rulesets each contain a `WNAM=0` rule, all keyed by `00182D74` with YNAM 1100.
None is selected by any C6 fauna. They do not influence C6 formatting.

No C6 output contains an article, hyphen, inflection marker outside its localized
component, plural/number behavior, gender marker, qualifier beyond the three
roles, or an empty component that emits punctuation/spacing.

## Full-population inventory

### Composition shapes

| Observed shape | Fauna | Percent |
| --- | ---: | ---: |
| prefix + species + diet | 335 | 36.33% |
| species + diet | 320 | 34.71% |
| prefix + species | 267 | 28.96% |
| species only | 0 | 0% |
| other/unsupported | 0 | 0% |
| **Total** | **922** | **100%** |

### Object Template and reconstruction results

| Measure | Count |
| --- | ---: |
| selected Object Template combinations | 922 |
| distinct top-level OMOD combination identities | 921 |
| fauna with more than one candidate combination | 0 |
| multi-candidate fauna collapsing to one name | 0 |
| ambiguous composed names | 0 |
| unsupported shapes | 0 |
| exact English reconstructions | 922 |
| English reconstruction mismatches | 0 |
| missing Japanese selected component IDs | 0 |

The handoff's `ObjectTemplateCombinationCount` is `1` for every row. There is
therefore no in-scope example of the requested multi-combination case; inventing
one from arbitrary NPCs would violate the population boundary.

## Component reuse

| Role | Total occurrences | Unique qualified string IDs |
| --- | ---: | ---: |
| prefix | 602 | 8 |
| species/body | 922 | 198 |
| diet | 655 | 6 |
| **All roles** | **2,179** | **212** |

The most reused prefix components are:

| ID | English / Japanese | Uses |
| --- | --- | ---: |
| `0003355B` | Herding / 遊牧の | 177 |
| `0003355E` | Hunting / 狩猟する | 137 |
| `0003355F` | Pack / 群れの | 116 |
| `0003355A` | Flocking / 群がる | 93 |
| `00033560` | Swarming / 群れをなす | 32 |
| `0003355D` | Schooling / 調教された | 31 |

The most reused species/body components are `Beetle` (`00033650`, 20),
`Grabber` (`0003364F`, 18), `Spaceroach` (`0003364C`, 17), `Flamethorn`
(`00033651`, 17), and `Milliwhale` (`0003364D`, 16).

Diet reuse is especially concentrated:

| ID | English / Japanese | Uses |
| --- | --- | ---: |
| `00033594` | Grazer / グレイザー | 190 |
| `00033591` | Filterer / フィルタラー | 157 |
| `00033595` | Scavenger / スカベンジャー | 137 |
| `00033592` | Geophage / 土食生物 | 80 |
| `00033593` | Herbivore / 草食動物 | 74 |
| `00033596` | Stalker / ストーカー | 17 |

This strongly favors normalized component provenance rather than copying a
fully composed string per fauna and locale.

## Plugin/provider and override findings

### Canonical NPC ownership

| Winning canonical NPC provider | Fauna |
| --- | ---: |
| `Starfield.esm` | 918 |
| `ShatteredSpace.esm` | 4 |
| `SFBGS00D.esm` | 0 |
| `SFBGS050.esm` | 0 |

### Naming relationship ownership

- all 2,179 selected WNAM occurrences come from `Starfield.esm`;
- all 212 unique selected component identities are
  `Starfield.esm:strings:<ID>`;
- all 10,706 traversed OMOD occurrences (470 unique OMOD FormIDs) resolve to
  `Starfield.esm`;
- the four Shattered Space NPCs reuse base-game OMODs, INNR rules, and component
  strings;
- Shattered Space and SFBGS050 contain no INNR records;
- SFBGS00D overrides three unrelated common armor/gun/melee INNR records but
  does not override either CCT INNR record.

The winning `dn_CCTPrefixes` and `dn_CCTSuffixes` records each have a one-record
provider chain containing only `Starfield.esm`. Every selected WNAM is serialized
directly in that winning record. There is no master-inherited selected CCT name,
winning-override ambiguity, or separate name provider in the official set.

The eventual implementation should still preserve distinct
`RecordSourcePlugin` and `NameSourcePlugin` fields and resolve winning providers
before extracting WNAM. That keeps the general provenance invariant intact
without implementing arbitrary mod support.

## Provenance-schema recommendation

The existing schema is sufficient:

```text
EntityKind
EntityId
DisplayNameSourceKind
ComponentOrder
ComponentRole
RecordSourcePlugin
RecordFormID
RecordSignature
NameFieldPath
NameSourcePlugin
NameStringTable
NameStringID
CanonicalEnglish
```

Recommended C6 conventions:

- one row per **emitted non-empty component**;
- `DisplayNameSourceKind = composed` (or the repository's settled equivalent);
- fixed semantic `ComponentOrder`: `0=prefix`, `1=species`, `2=diet`;
- retain the semantic slot even when an earlier role is absent; do not renumber
  species to zero merely because prefix is absent;
- `ComponentRole` values `prefix`, `species`, and `diet`;
- exact indexed `NameFieldPath`, for example
  `Naming Rules[1]/Names[2]/WNAM - Text`;
- assembly sorts by `ComponentOrder`, drops absent rows, and inserts `U+0020`;
- locale lookup changes only the table locale, not the qualified plugin/table/ID
  identity or row order.

Answers to the schema questions:

- **Is one row per localized component enough?** Yes.
- **Is ComponentOrder globally valid?** Yes for this naming family; it is fixed
  across English and Japanese and no locale-order field exists.
- **Is ComponentRole sufficient?** Yes when paired with record/ruleset identity.
- **Is a composition/template entity needed?** No.
- **Is CompositionRuleId needed?** No; `DisplayNameSourceKind` plus the fixed CCT
  assembly function is sufficient.
- **Is locale-specific ordering metadata needed?** No.
- **Can the rows support future languages unchanged?** Yes structurally. Each
  additional locale still requires encoding-aware table intake and a verification
  sample; the data model itself need not change.

## Recommended C6 implementation sequence

### C6.1 — Locale-safe INNR component resolver

**Effort/usage: high.** Promote the audited rule traversal into a narrow
production module with traceable selected-rule metadata. Make string-table
decoding explicitly locale/encoding aware so Japanese UTF-8 is never decoded as
Windows-1252. Add fixtures for recursive OMODs, specificity, YNAM, earliest-rule
ties, WNAM zero, and missing IDs/providers.

### C6.2 — Generate normalized provenance for all 922 fauna

**Effort/usage: medium-high.** Emit the expected 2,179 component rows using fixed
semantic orders and exact indexed field paths. Replace only the C6 deliberate
deferrals. Require 922/922 identity coverage, 922/922 exact English assembly,
the audited shape counts, 212 unique components, and zero ambiguity/unsupported
rows.

### C6.3 — Japanese composed-name overlay generation

**Effort/usage: medium.** Resolve Japanese with the same qualified component
identities, join non-empty components with `U+0020`, and generate the fauna
overlay without reverse matching. Lock representative outputs for all three
observed shapes and the four Shattered Space fauna.

### C6.4 — Verification and hardening

**Effort/usage: low-medium.** Add a direct Japanese runtime or Creation Kit spot
check for exact on-screen spaces, test malformed/missing rule structures fail
closed, re-run the full localization provenance pipeline, and verify no Bethesda
text corpus/raw dump is committed.

Four parcels are preferable to one large implementation batch because locale
decoding, binary/provider provenance, normalized row generation, and runtime
overlay behavior have different failure surfaces.

## Fail-closed status

| Condition | Result |
| --- | --- |
| equally ranked matches | 8 observed; deterministic earliest rule verified |
| multiple equally valid final selections | 0 |
| locale-order ambiguity in records | 0 |
| missing selected English string IDs | 0 |
| missing selected Japanese string IDs | 0 |
| provider ambiguity | 0 |
| malformed selected INNR structures | 0 |
| unexpected extra components | 0 |
| English reconstruction mismatch | 0 |
| Japanese component-identity mismatch | 0 |
| plugin/table ownership uncertainty | 0 |

## Explicit unresolved questions and limitations

1. **Direct first-party Japanese final-display capture.** Official data proves
   component identity and structural order, and independent Japanese player data
   corroborates the same spaced sequence, but no official table stores the final
   dynamic name. A Japanese runtime/Creation Kit screenshot or engine-level
   name-generation call should be the C6.4 byte-exact display check.
2. **Locales beyond English and Japanese.** The record model contains no locale-
   specific order mechanism, so the same structure should apply, but this audit
   intentionally traced only the required two locales. New locale intake should
   include an encoding and representative-output check.
3. **Unused empty WNAM rules.** Their broader engine purpose is not needed to
   model the 922 fauna because none is selected. C6 should preserve fail-closed
   behavior if a future target selects one instead of inventing visible text.
4. **Missing exact `(1).pas` filename.** The available production v2.0.3 and
   retained v2.0.2 files have identical CCT resolver code, so this is recorded
   provenance context rather than a blocker.

There is no blocker to implementing normalized C6 component provenance. The
Japanese runtime spot check is recommended as a hardening gate before declaring
the later Japanese overlay parcel fully proven on screen.
