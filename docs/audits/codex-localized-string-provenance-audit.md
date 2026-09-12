# Codex audit: localized-string provenance (Parcel C)

Audit date: 2026-09-12

Installed game inspected: Starfield 1.16.244.0

Scope: design and narrow diagnostic proof only; no production Parcel C implementation

## 1. Executive summary

Parcel C should use a hybrid extractor. A small project-owned Node program should be the authority for reading raw localized string IDs from a narrowly allowlisted set of Starfield record fields. Existing xEdit exporters should remain the authority for discovering record relationships, field paths, winning overrides, and the composed-fauna dependency graph. An English string-table verification pass should reject or explicitly classify every provenance mismatch before generated data is accepted.

This is safer than any single investigated alternative:

- xEdit 4.1.5p resolves localized fields before exposing them to scripts: both `GetEditValue` and `GetNativeValue` returned display text, not the serialized uint32. No supported raw-subrecord accessor was identified.
- A direct, read-only spike recovered exact IDs from ordinary and component `FULL` fields, including compressed records and `XXXX` extended subrecords. A full general-purpose ESM parser is unnecessary.
- Mutagen is the strongest library candidate if load-order and override handling later dominates the work, but adopting a GPL-3.0 C#/.NET build dependency is not currently justified and its raw localized-field/provider behavior still needs a separate proof.
- Creation Kit export is GUI-oriented and has no sufficiently documented, automatable Starfield contract for this provenance chain.

The four required proof targets succeeded without English reverse matching:

| Target | Source record and field | Qualified raw ID | English | Japanese |
|---|---|---|---|---|
| Aluminum | `Starfield.esm` `IRES:000057D6` `FULL` | `strings:00008155` | Aluminum | アルミニウム |
| Rocky Desert | `Starfield.esm` `BIOM:002ACD5A` `FULL` | `strings:000062F4` | Rocky Desert | 岩石砂漠 |
| Alpha Centauri | `Starfield.esm` `STDT:0005E60A` full-name component `FULL` | `strings:0000A9D0` | Alpha Centauri | アルファ・ケンタウリ |
| Akila | `Starfield.esm` `PNDT:0005E2B6` full-name component `FULL` | `strings:0000A3B2` | Akila | アキラ |

The most important special case is composed fauna. Many fauna `NPC_` records have no direct `FULL`; their displayed name is assembled through naming rules and sometimes template/leveled-record chains. Those names need ordered component provenance, not a fabricated single ID. Plugin-specific archive packaging is another practical exception: `SFBGS00D.esm` string tables are in `SFBGS00D - Main.ba2`, so archive discovery cannot assume a `- Localization.ba2` suffix.

## 2. Current canonical data inventory

The current source files already preserve most record identities but generally preserve only resolved English display names. Counts below are from the repository sources at audit time.

| Population | Canonical source | Current size | Runtime identity | Bethesda identity already present |
|---|---|---:|---|---|
| Inorganic resources | `reference-source/inorganic-resource-dictionary.csv` | 48 | tracker resource ID from policy crosswalk | source plugin, IRES FormID, editor ID |
| Manufactured recipes | `reference-source/industrial-workbench.csv` | 90 recipe rows / 30 products / 55 ingredients | tracker product/resource/organic IDs after builder joins | product and ingredient source plugin, FormID, editor ID |
| Systems and bodies | `reference-source/planet-directory.csv` | 1,776 bodies / 123 systems | numeric `StarSystemID`; body FormID | PNDT plugin and FormID; numeric system ID |
| Inorganic biome occurrences | `reference-source/biome-inorganic-resources.csv` | 7,780 | body/biome FormIDs plus resource ID | BIOM and resource source plugin/FormID/editor ID |
| Organic biome occurrences | `reference-source/biome-organic-resources.csv` | 3,855 | body/biome/species FormIDs | BIOM and species source plugin/FormID/editor ID |
| Organic species | derived from organic occurrence source | 1,121 unique species (153 flora, 968 fauna) | species FormID | FLOR/NPC_ identity and resolved display name |
| Skills / official UI terms | application/domain constants | small fixed set | tracker-owned semantic key | not currently normalized into a Bethesda provenance source |

`Starfield.esm` and `ShatteredSpace.esm` occur in the body and biome sources. The inorganic dictionary also contains `SFBGS00D.esm`; this is the X-Tech row. Existing stable runtime IDs and the current English strings must remain unchanged. Provenance is build metadata, not persisted player/network state.

## 3. Why localization archives alone cannot map FormIDs

Bethesda string tables are keyed by numeric string ID. They contain an ID-to-text directory and string data, but no record signature, FormID, field path, or load-order ownership. A text such as `Rocky Desert` may appear under many IDs, and the same numeric ID can be valid in more than one table type. Consequently:

```text
BA2/string tables -> (plugin, table, string ID) -> text
plugin record      -> (record, semantic field)  -> raw string ID
```

Both sides are necessary. Joining a canonical English name back to any matching table entry loses record identity and is not deterministic. The direct proofs in this audit make the ambiguity concrete: 26 base-game BIOM records resolve to `Rocky Desert`, and each uses a different string ID.

## 4. Extraction routes compared

| Route | Raw ID | Field semantics | Overrides/links | Automation | Recommendation |
|---|---|---|---|---|---|
| xEdit script alone | No, in tested 4.1.5p API | Excellent | Excellent | Good after local setup | Use for discovery and graph extraction, not raw ID authority |
| Narrow direct parser | Yes | Only allowlisted fields | Must be implemented deliberately | Excellent | Recommended raw-byte authority |
| General parser library | Candidate-dependent | Potentially broad | Potentially excellent | Adds language/license/build surface | Keep Mutagen as escalation option |
| Creation Kit/export | Unproven | Authoritative semantics | Likely good interactively | Weak/GUI-oriented | Validation aid only |
| Hybrid xEdit + narrow parser + verifier | Yes | Strong | Strong, with explicit boundary | Reproducible | Recommended |

The hybrid boundary is important: xEdit must not emit resolved text and have that text reverse-matched later. It should emit stable record/provider relationships. The raw reader must then recover the ID from the exact provider record and exact semantic field.

## 5. xEdit scripting feasibility

The installed tool is xEdit/SF1Edit 4.1.5p. A diagnostic script recursively inspected selected fields and compared `GetEditValue` with `GetNativeValue`. Results were:

| Record/field | `GetEditValue` | `GetNativeValue` |
|---|---|---|
| Aluminum `IRES:000057D6/FULL` | Aluminum | Aluminum |
| Rocky Desert `BIOM:002ACD5A/FULL` | Rocky Desert | Rocky Desert |
| Alpha Centauri component `FULL` | Alpha Centauri | Alpha Centauri |

`GetElementNativeValues` uses the same value abstraction and did not expose the serialized bytes. No Starfield-localized-string accessor or supported arbitrary raw-subrecord byte API was found in the installed scripting surface. The published scripting-function reference documents native/value helpers but does not establish a raw localized-ID contract ([xEdit scripting functions](https://github.com/Freso/xEdit-docs/blob/master/11-Scripting-Functions.html)).

xEdit remains valuable because its Starfield definitions know component layout, links, master resolution, and winning overrides. The project should retain it as a development-time oracle and relationship exporter. If a future xEdit version exposes an explicit raw serialized-byte or localized-string-key accessor, this conclusion should be re-tested against the same four proof records. Current xEdit releases continue to improve Starfield plugin support, including full/light/medium module limits ([xEdit release notes](https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/whatsnew.md)).

## 6. Direct ESM/plugin parsing feasibility

A narrow Node spike successfully streamed `Starfield.esm`, recursed through groups, decompressed flagged records, handled extended subrecord sizes, and enumerated selected records/subrecords. A second spike parsed extracted `.strings`, `.dlstrings`, and `.ilstrings` tables. The diagnostic work is under ignored `.local-work/localization/provenance/` and is not production code.

Exact inspected inputs:

| Input | SHA-256 |
|---|---|
| `Starfield.esm` | `1DABED00C3F4282DD3BB54D2E9601E40B577D8742D078B7CCEF203ADBFEF0DA7` |
| `Starfield - Localization.ba2` | `C1944A84346A919226B97D10E10CD94A776CD7F0AF84F52C9E9EC86CEEDAF3D0` |
| `SFBGS00D.esm` | `35271D3221310094C70AC2F418D7D393DB59DD94D303E830536F85034F44DA95` |

The base localization archive was extracted locally with the xEdit-distributed `BSArch64.exe` 0.9e. BSArch's command-line implementation is published with xEdit ([BSArch source](https://github.com/TES5Edit/TES5Edit/blob/dev-4.1.6/BSArch.dpr)). Twenty-seven base tables were observed: three extensions for nine languages. No Bethesda binary or extracted table content is part of this report or should be committed.

A project-owned Node extractor is reasonable because the minimum required surface is small:

1. Read 24-byte record/group headers and recurse through `GRUP` containers.
2. Inflate records carrying compression flag `0x00040000`.
3. Iterate six-byte subrecord headers and honor `XXXX` extended sizes.
4. Select records by exact plugin-local/canonical identity.
5. Interpret only allowlisted name-bearing paths for `IRES`, `BIOM`, `STDT`, `PNDT`, `FLOR`, `PERK`, and the explicitly designed fauna paths.
6. Read a little-endian uint32 only where the field map declares a localized string field.

It should not try to become a generic editor, write plugins, infer unknown layouts, or model all Starfield signatures. The primary implementation risk is not reading record framing; it is correctly resolving override inheritance, FormID namespaces, and semantically nested component fields. Those must have explicit tests and fail-closed behavior.

## 7. Existing parser/library candidates

No candidate was copied or adapted during this audit.

| Candidate | Language / license | Demonstrated Starfield scope | Localization/raw fields and overrides | Decision |
|---|---|---|---|---|
| [xEdit](https://github.com/TES5Edit/TES5Edit) | Delphi / MPL-2.0 | Mature Starfield record definitions and load-order model | Excellent semantics/overrides; tested script API resolves localized values | Studied; recommend external discovery/QA tool, not a linked dependency |
| [Mutagen](https://github.com/Mutagen-Modding/Mutagen) | C# / GPL-3.0 | Active Starfield solution, typed records, load-order APIs | Strongest general candidate; exact raw localized key/provider behavior still needs proof | Studied; reserve as escalation option, do not adopt yet |
| [esplugin](https://github.com/Ortham/esplugin/blob/master/README.md) | Rust / GPL-3.0 | Starfield plugin metadata and full/light/medium ID handling | Explicitly focused on LOOT/libloadorder needs, not general record fields | Studied; insufficient for this extraction |
| [esper](https://github.com/matortheeternal/esper) | C# / license not clearly established at repository root during audit | Contains Starfield definitions and an xEdit-like parser | Raw localization and provider guarantees not documented sufficiently | Studied; not recommended without license/API proof |
| [bethesda-modutils](https://github.com/willroberts/bethesda-modutils) | Go / GPL-3.0 | Broad Bethesda structural parsing including Starfield claims | Unknown fields and Starfield semantic/override coverage are not sufficient for this task | Studied; not recommended |
| [Bethesda Strings Editor](https://github.com/0xra0/bethesda-strings-editor) | Python / MIT | BA2 and Bethesda string-table handling | Useful table/alignment reference, not a record-provenance parser | Previously studied; retain as technical reference only |

Mutagen documents both its development model and load-order APIs ([development guide](https://github.com/Mutagen-Modding/Mutagen/blob/dev/DEVELOPMENT.md), [load-order documentation](https://github.com/Mutagen-Modding/Mutagen/blob/dev/docs/loadorder/index.md)). It becomes attractive if later requirements expand to arbitrary third-party load orders or broad inherited-field resolution. For the present official-data build, a Node extractor avoids a new .NET toolchain and GPL dependency while keeping the audited byte-level behavior visible and testable.

Starfield's medium-master encoding is a real compatibility concern rather than an older-game assumption. The esplugin Starfield investigation documents full `xxzzzzzz`, medium `FDYYzzzz`, and light `FEYYYzzz` forms ([Starfield FormID investigation](https://github.com/Ortham/esplugin/issues/42)); libloadorder also tracks medium-plugin ordering separately ([medium-plugin issue](https://github.com/Ortham/libloadorder/issues/97)). Production tests must cover the module classes actually present in the declared official load order.

## 8. Creation Kit / official tooling feasibility

Bethesda officially distributes the Starfield Creation Kit through Steam ([Bethesda support](https://help.bethesda.net/app/answers/detail/a_id/65849/~/where-do-i-get-the-creation-kit-for-starfield), [Steam listing](https://store.steampowered.com/app/2722710/Starfield_Creation_Kit/)). However, no official, stable Starfield command-line export contract was found that yields record identity, semantic field path, raw string ID, table type, and provider plugin together.

Community Creation Kit documentation describes tab-delimited localization export from the GUI's File menu ([CK wiki File menu](https://ck.uesp.net/wiki/File_menu)), but this does not prove Starfield automation, raw provider ownership, or exact handling of inherited overrides. Creation Kit should therefore be used only as a semantic spot-check—for example, validating naming-rule precedence—not as the reproducible Parcel C extractor.

## 9. Recommended architecture

The recommended build-time chain is:

```text
canonical CSV identities and expected English
        |
        v
allowlisted record/field map <--- xEdit discovery and QA exports
        |
        v
narrow read-only ESM reader ---> qualified raw provenance candidates
        |
        v
English table resolver ---> exact comparison and classified mismatch report
        |
        v
normalized provenance crosswalk + reproducibility manifest
```

Implementation boundaries:

- Canonical sources continue to own runtime identity and expected English.
- A checked-in field map owns the semantic mapping from population/signature/path to table type. Unknown records or fields are errors, not guesses.
- The raw reader owns serialized IDs only. It does not decide display policy.
- xEdit-derived relationship data may identify the effective field provider and composed-name components, but never substitutes English matching for identity.
- The verifier reads locally owned official English tables and writes only derived metadata/reports. It must not copy full Bethesda table contents into the repository.
- The application builder consumes a normalized crosswalk; it does not parse game files at runtime.

The build should be reproducible against an explicit manifest containing game version, extractor version, load order, plugin hashes, archive hashes, and the selected English table filenames. A hash change requires regeneration and review rather than silent reuse.

## 10. Record-format findings

The direct spike observed the following Starfield behavior on the audited inputs:

- Plugin records and `GRUP` headers use 24-byte framing.
- The `TES4` header on both inspected plugins has flags `0x00000081`, including the localized-file bit `0x80` and master bit `0x01`.
- Ordinary subrecords use a four-byte signature plus uint16 payload length.
- An `XXXX` subrecord carries a uint32 size for the following subrecord.
- Record flag `0x00040000` indicates compressed data. The payload starts with a uint32 uncompressed size followed by zlib data. Akila's PNDT is an observed compressed example: 8,015 compressed bytes and 47,808 uncompressed bytes.
- Audited localized `FULL` fields contain a four-byte little-endian unsigned string ID.
- Table type is not serialized beside the ID. It is a semantic property of the record field and must come from the allowlisted field map.
- `.strings` entries are NUL-terminated; `.dlstrings` and `.ilstrings` entries use a uint32 length prefix. IDs are uint32 values.
- English base tables decoded correctly as Windows-1252 for the audited data; Japanese decoded correctly as UTF-8. Encoding should nevertheless be configured per supported language/table rather than guessed per value.

FormID handling needs a deliberately limited contract. Initial production work can take exact canonical `(SourceFile, FormID)` pairs from xEdit-generated sources and target the declared official master set. It must parse `MAST` order and normalize record identity to `(origin plugin, object ID)` before claiming support for overrides or arbitrary load orders. A bare displayed/load-order FormID is not durable provenance.

Nested component `FULL` fields cannot be selected merely by taking the first subrecord with that signature. The extractor must validate surrounding component markers and semantic type. This is especially important for `PERK`, where later `FULL` fields can name ranks or other nested data.

## 11. Per-population provenance map

| Population | Stable identity | Record/route | Field/table | Ownership/special handling |
|---|---|---|---|---|
| Inorganic resources | existing tracker resource ID | IRES canonical FormID | top-level `FULL` / `strings` | Join through source plugin + IRES; X-Tech uses its own plugin/archive |
| Manufactured products | existing tracker product ID | product IRES FormID | top-level `FULL` / `strings` | One item crosswalk row, not repeated per recipe occurrence |
| Recipe ingredients | existing resource/product/organic ID | canonical item record by source plugin + FormID | record-specific display field, normally `FULL` / mapped table | Join through the same item/species crosswalk; occurrence name is verification only |
| Star systems | decimal `StarSystemID` | PNDT `GNAM` system number -> STDT `DNAM` -> `TESFullName_Component` | component `FULL` / `strings` | STDT provider plugin; no English join |
| Planetary bodies | PNDT FormID | PNDT `TESFullName_Component` | component `FULL` / `strings` | Do not use inline `Body/ANAM` as localized provenance; validate planet/moon/orbital variants |
| Biomes | BIOM FormID | BIOM | top-level `FULL` / `strings` | Repeated English labels remain independent qualified IDs |
| Explicit flora | FLOR FormID | FLOR | direct `FULL` / `strings` | Ordinary direct provenance |
| Explicit fauna | NPC_ FormID | NPC_ when an explicit name exists | exact semantic direct-name path / mapped table | Must distinguish direct name from nested/template fields |
| Composed fauna | NPC_ FormID | NPC_/OMOD/INNR naming rules, possibly TPLT/LVLN chain | ordered localized component fields | Store multiple provider components and derivation metadata |
| Skills | tracker official-term key | PERK | top-level skill-label `FULL` / `strings` | Small separate official-term crosswalk; do not select later rank `FULL`s |
| Other official UI terms | explicit tracker official-term key | audited Bethesda record/field | allowlisted per term | Include only Bethesda-owned wording; tracker-authored capability prose stays in app catalogue |

For products and ingredients, normalization is preferable to adding `ProductNameStringID` and `IngredientNameStringID` to every recipe row. Recipe rows should retain their source identity and join to one canonical entity provenance row. The same principle applies to species repeated over many biome occurrences.

The five audited skills resolve through top-level PERK `FULL` fields in `Starfield.esm`:

| Skill | PERK | String ID |
|---|---|---|
| Special Projects | `0004CE2D` | `00030F39` |
| Outpost Management | `0023826F` | `00009ECC` |
| Planetary Habitation | `0027CBC2` | `00009DD9` |
| Research Methods | `002C555C` | `00009C96` |
| Outpost Engineering | `002C59E0` | `00009B6B` |

These are proof candidates for the official-term crosswalk, not values to hard-code into application logic.

## 12. Aluminum proof target

The canonical resource row points to `Starfield.esm`, `IRES:000057D6`, editor ID `ResInorgCommonAluminum`. Direct inspection found:

```text
FULL bytes: 55 81 00 00
uint32 ID:  00008155
table:      strings
English:    Aluminum
Japanese:   アルミニウム
```

The same record's `NNAM` short-name field contains `00008154`; this is a useful guard against selecting a plausible but semantically wrong sibling field. The previously observed English matches `000040DC`, `00008155`, and `0000E209` demonstrate why reverse lookup is insufficient. Only `00008155` is serialized in the canonical resource's `FULL`.

## 13. Rocky Desert proof target

Representative record `Starfield.esm`, `BIOM:002ACD5A`, editor ID `DesertRockyLife01`, contains:

```text
FULL bytes: F4 62 00 00
uint32 ID:  000062F4
table:      strings
English:    Rocky Desert
Japanese:   岩石砂漠
```

The 26 base-game BIOM records currently represented in canonical occurrence data with English display name `Rocky Desert` use 26 distinct IDs:

```text
00006469 0003247E 00006434 0000641F 00006420 00006421 00006422
00006424 00006316 0000640A 000063F3 000063F4 000063E8 000063E4
00006351 00006352 00006353 00006354 00006356 00006325 000330B2
000062F3 000062F4 000062FE 00006301 00006302
```

Every one resolved to English `Rocky Desert` and Japanese `岩石砂漠` in the corresponding base `.strings` tables. Therefore repeated display text does not imply a shared ID. The Shattered Space BIOM `01012244` (`SFBGS001DesertRockyLifeVaruunkai`) is a separate plugin-qualified case and was not folded into this base-game proof.

## 14. Alpha Centauri proof target

`Starfield.esm` record `STDT:0005E60A`, editor ID `AlphaCentauriStar`, has `DNAM` value 71456, matching the runtime `StarSystemID`. Its `TESFullName_Component` contains:

```text
FULL bytes: D0 A9 00 00
uint32 ID:  0000A9D0
table:      strings
English:    Alpha Centauri
Japanese:   アルファ・ケンタウリ
```

Planet records carry their system membership in `Body/GNAM - Galaxy Data`. A deterministic system join is therefore:

```text
PNDT.GNAM system number
    -> STDT.DNAM system number
    -> STDT TESFullName_Component.FULL
```

The alternative known English match `0000C7E5` is not the ID referenced by this canonical STDT full-name component. `STDT/ANAM` also contains inline ASCII `Alpha Centauri`, but it is not the localized display-name provenance target.

## 15. Akila proof target

`Starfield.esm` record `PNDT:0005E2B6`, editor ID `AkilaPlanetData`, is compressed. Its `TESFullName_Component` contains:

```text
FULL bytes: B2 A3 00 00
uint32 ID:  0000A3B2
table:      strings
English:    Akila
Japanese:   アキラ
```

The same PNDT later carries inline `Body/ANAM - Name` bytes for `Akila`. The current planet-directory xEdit exporter prefers that ANAM presentation value and falls back to the full-name component. Parcel C must instead target `Base Form Components -> TESFullName_Component -> Component Data - Fullname -> FULL - Name`, because that field provides the localized identity.

Akila's `GNAM` begins with system ID 72432, followed by parent/body indexing values. This independently validates the numeric PNDT-to-STDT system join. Planets and moons are expected to share the PNDT component route, but production coverage must enumerate structural variants and explicitly report orbitals or other bodies without the expected component.

## 16. Plugin/master/override ownership model

Represent record identity and name ownership separately:

- `RecordSourcePlugin` identifies the canonical/origin record.
- `RecordFormID` plus signature identifies the record within the declared load-order context and must also be normalized to origin plugin/object ID internally.
- `NameSourcePlugin` identifies the plugin that actually serializes the selected localized field value.
- `NameStringTable` and `NameStringID` are interpreted in `NameSourcePlugin`'s tables.

For a declared load order, resolve the winning record, then walk its override chain backward for the exact semantic field:

1. If the winning override explicitly serializes that field, it is the name provider—even if its numeric ID equals the master's value.
2. If it omits/inherits the field, continue to the latest earlier override/master that explicitly serializes it.
3. Resolve `(NameSourcePlugin, table, ID)` only against that provider's table set.
4. If no provider is found, emit an unresolved error; never borrow a text match from another plugin.

This model handles a winning record owned by one plugin and an unchanged localized name inherited from a master. It also prevents equal numeric IDs in different plugins from collapsing. The manifest must record the exact load order and plugin/archive hashes used to make the determination.

`SFBGS00D.esm` illustrates archive discovery risk. Its X-Tech resource `IRES:01033E3F` (`Y2_Res_X-Tech`) has raw `FULL` ID `00000FC7`, while its 27 localization tables are packaged in `SFBGS00D - Main.ba2`, not an archive named `SFBGS00D - Localization.ba2`. Archive-to-plugin association must be explicit or discovered by enumerating candidate BA2 members and validating table basenames; it cannot be derived from one filename convention.

## 17. String-table type model

Keep the proposed enum exactly:

```text
strings
dlstrings
ilstrings
```

Store string IDs as uppercase, zero-padded eight-digit hexadecimal without `0x` in CSV, and parse them as unsigned 32-bit integers. The fully qualified identity is:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
```

The record bytes contain only the uint32, not the table enum. Table type must be declared by an audited field-semantic map keyed by record signature and exact semantic path/component context. All direct-name `FULL` paths proven in this audit resolve through `.strings`, but this fact must not become a global rule that every subrecord named `FULL` is `.strings`.

The English verifier must look only in the declared table. It must not choose whichever extension happens to contain the ID or matching text. Numeric duplication between table extensions is harmless only when the table is part of the key.

## 18. Proposed canonical schema changes

Add one normalized generated build-metadata source rather than repeating columns across recipe and occurrence CSVs:

```text
reference-source/localized-name-provenance.csv
```

Recommended columns:

| Column | Meaning |
|---|---|
| `EntityKind` | deterministic enum such as `resource`, `product`, `system`, `body`, `biome`, `species`, `official-term` |
| `EntityId` | existing runtime stable ID; no identity migration |
| `DisplayNameSourceKind` | `direct`, `composed`, or `template-derived` |
| `ComponentOrder` | zero-based order; `0` for a direct complete name |
| `ComponentRole` | `complete`, `prefix`, `species`, `diet`, suffix role, or another audited enum |
| `RecordSourcePlugin` | canonical/origin record plugin |
| `RecordFormID` | uppercase eight-digit record ID in the audited load-order representation |
| `RecordSignature` | `IRES`, `BIOM`, `STDT`, `PNDT`, `FLOR`, `NPC_`, `PERK`, etc. |
| `NameFieldPath` | stable semantic path, not a transient UI breadcrumb alone |
| `NameSourcePlugin` | plugin that serializes the selected field |
| `NameStringTable` | `strings`, `dlstrings`, or `ilstrings` |
| `NameStringID` | uppercase eight-digit uint32 hexadecimal |
| `CanonicalEnglish` | existing expected/fallback English for verification and review |

Use one row for a direct name and ordered rows for a composed name. `EntityKind + EntityId + ComponentOrder` should be unique. Recipe and biome occurrence builders join through `EntityKind + EntityId`; their existing resolved names remain useful input assertions but do not duplicate provenance.

Add a generated `localized-name-provenance-unresolved.csv` with the same entity identity plus `ReasonCode` and `Detail`. This makes unsupported special cases explicit without weakening the resolved-file invariant that every row has a complete qualified string identity. Also add a machine-readable manifest with tool/game versions, declared load order, hashes, archive/table inputs, and extraction timestamp.

`NameFieldPath` should use project-owned stable tokens such as `baseFormComponents.TESFullName_Component.fullName.FULL`, with the current xEdit path retained in documentation/diagnostics. This avoids binding the canonical schema to xEdit's presentation wording while preserving traceability.

## 19. English verification strategy

The acceptance gate is an exact identity join:

```text
provenance row
  -> (NameSourcePlugin, NameStringTable, NameStringID)
  -> official English value
  -> compare with CanonicalEnglish
```

Verification should:

1. Validate schema enums, eight-digit hex formatting, component order, and uniqueness.
2. Confirm every canonical target entity has exactly one direct name or a valid ordered component set.
3. Reject orphan provenance rows and missing canonical entities.
4. Confirm provider plugins and English tables appear in the input manifest with matching hashes.
5. Resolve only the qualified tuple and fail if it is missing.
6. Perform an exact comparison first. Any normalization or exception must be separately declared and reported.
7. Recompose component names using the audited naming rule and compare both components and final display text.
8. Produce stable, sorted machine-readable and human-readable reports.

Mismatch classes should include:

- `wrong-field`
- `wrong-plugin`
- `wrong-table`
- `missing-string-id`
- `winning-override-difference`
- `tracker-normalization`
- `composed-display-name`
- `canonical-source-error`
- `unsupported-record-shape`

Deliberate application spellings—such as an English locale preference or tracker-authored label—belong in an explicit exception/copy policy. The verifier must never silently edit canonical English or substitute a different matching ID.

## 20. Unresolved special cases

### Composed and template-derived fauna

The current organic exporter resolves many fauna names without a direct `FULL`. A representative `NPC_:0019B1FA` (`PCM_Nirah_Kazaal_Critter01`) has no direct `FULL`. Existing logic follows object-template/naming-rule records and combines localized prefix/species/diet components; other cases can follow `TPLT` to `LVLN`, then a leveled or encounter NPC template.

Production extraction must preserve:

- each component's provider record, semantic role, table, and ID;
- deterministic component order;
- naming-rule selection evidence, including keyword specificity and priority/order;
- any template or leveled-record chain used to reach a provider;
- the final English recomposition check.

This is the highest-risk slice. xEdit should export the resolved dependency graph while the raw reader extracts IDs from each exact provider field. A general English tokenization/reverse match is not acceptable.

### Body variants

Akila proves the normal PNDT full-name component. Planet, moon, station/orbital, DLC, and non-landable shapes still need a complete inventory. Missing components must enter the unresolved report, not fall back silently to inline ANAM.

### X-Tech and additional plugins

X-Tech follows an ordinary IRES `FULL` route but uses a plugin-specific table set in a nonstandard archive name. The exact raw ID was proven (`SFBGS00D.esm`, `IRES:01033E3F`, `strings:00000FC7`); English/Japanese table resolution was not completed in this audit because that archive was only enumerated, not extracted. Shattered Space record/provider and archive combinations also require end-to-end coverage.

### Tracker-authored versus Bethesda-owned wording

Only exact game-native labels belong in the official-term crosswalk. Capability explanations, planner concepts, validation messages, and other tracker-authored prose remain in the application catalogue even when they mention a Bethesda term. This requires a small explicit review, not an automated word search.

### Override breadth

The initial official-data pipeline can support a declared Bethesda load order. Claiming arbitrary mod support would materially expand FormID normalization, conflict resolution, inherited-field handling, archive discovery, and test scope; it is not required for Parcel C.

## 21. Parcel C implementation breakdown

Recommended order:

1. **C1 — Parser framing, manifest, and semantic field map.** Implement read-only record/group iteration, zlib, `XXXX`, exact record selection, plugin metadata, hashes, and fail-closed field definitions. Lock the four audit proofs as fixtures that contain only minimal synthetic/derived bytes, not Bethesda content.
2. **C2 — Direct IRES/BIOM and official PERK terms.** Cover inorganic resources, products, direct ingredient items, biomes, X-Tech, and the small skill crosswalk.
3. **C3 — Star systems.** Implement numeric PNDT `GNAM` to STDT `DNAM` joining and STDT full-name component extraction.
4. **C4 — Planetary bodies.** Extract PNDT full-name components, inventory all canonical structural variants, and report exceptions.
5. **C5 — Direct flora/fauna and simple template cases.** Add direct FLOR/NPC_ paths and well-defined template/provider traversal.
6. **C6 — Composed fauna.** Extend the current xEdit naming-rule analysis to emit provider components; extract and verify each raw component.
7. **C7 — Override/master hardening.** Resolve field-provider inheritance across the declared official load order and add full/medium/light identity tests. This can begin earlier where required by DLC records, but should be accepted as its own concern.
8. **C8 — Builder integration and gates.** Generate normalized provenance/unresolved files and manifest; enforce coverage and English verification; document regeneration.

Each slice should retain the current canonical sources as input, add focused tests, and leave runtime display resolution for Parcel D. C2 is the best first usable milestone after C1; C6 should not block validating the ordinary populations.

## 22. Parcel D handoff contract

Parcel C hands Parcel D:

- a normalized, validated provenance crosswalk keyed by stable runtime `(EntityKind, EntityId)`;
- one qualified `(NameSourcePlugin, NameStringTable, NameStringID)` for direct names, or ordered qualified components for composed names;
- canonical English fallback/verification text;
- a successful coverage/mismatch report;
- an input manifest containing exact plugin/archive/table provenance;
- an explicit unresolved report.

Parcel D may then resolve the same qualified tuple against Japanese tables and generate a `ja-JP` overlay keyed by runtime identity. It owns production BA2 discovery/reading, final English/Japanese alignment, conflict and missing reports, overlay generation, and migration of display consumers. Parcel C may share a string-table reader for English verification, but it must not generate or wire Japanese overlays.

The interface must preserve component order and role so Parcel D can localize composed fauna without reconstructing identity from English text. Neither parcel should commit Bethesda plugin, BA2, or string-table contents.

## 23. Risks / legal/provenance notes

- **Game updates:** record layouts, values, plugins, and archives can change. Pin hashes and regenerate explicitly.
- **Definition drift:** xEdit definitions and the project field map can disagree. Keep representative byte proofs and cross-tool diagnostics.
- **Field ambiguity:** identical subrecord signatures occur in different semantic contexts. Select by structure/path, not signature alone.
- **Load-order identity:** full, medium, and light modules encode identity differently; never publish a bare load-order FormID as durable provenance.
- **Override inheritance:** winning record ownership can differ from field ownership. Preserve both.
- **Archive naming:** DLC/Creation archives do not follow one naming suffix. Discover and validate plugin/table associations explicitly.
- **Composed names:** naming rules can change and cannot be safely approximated from resolved English.
- **Dependency licensing:** xEdit is MPL-2.0; Mutagen/esplugin/bethesda-modutils are GPL-3.0; Bethesda Strings Editor is MIT. If code is later adapted or linked, re-evaluate distribution obligations and update `docs/THIRD-PARTY-REFERENCES.md` with the exact role. This audit only studied them.
- **Bethesda assets:** ESM, BA2, and string-table contents are user-owned game data and must remain local. Check in only project-authored code, qualified numeric provenance, expected canonical names already used by the project, manifests/hashes, and reports. Public distribution should receive project/legal review; this audit does not grant redistribution rights.
- **Tool availability:** local regeneration requires legally installed game inputs and whichever external discovery/archive tools the documented workflow chooses. Fail with actionable missing-input errors.

## 24. Cost estimate for implementation parcels

These are engineering estimates for one developer familiar with the repository, including focused tests and documentation but excluding review latency and unforeseen game-format variants.

| Slice | Estimate | Risk | Main uncertainty |
|---|---:|---|---|
| C1 parser/manifest/field map | 2–4 days | Medium | nested semantic paths and safe fixture strategy |
| C2 IRES/BIOM/PERK direct names | 1–2 days | Low–medium | DLC archive association and canonical joins |
| C3 systems | 1–2 days | Medium | complete STDT uniqueness/provider coverage |
| C4 bodies | 2–3 days | Medium | PNDT component variants and orbitals |
| C5 direct/simple species | 2–4 days | Medium | NPC_ direct/template shapes |
| C6 composed fauna | 5–10 days | High | naming rules, templates, ordered component provenance |
| C7 override/FormID hardening | 3–6 days | Medium–high | full/medium/light namespaces and inherited providers |
| C8 verifier/build integration | 2–4 days | Medium | coverage policy and reproducible local inputs |

A useful direct-name Parcel C through systems/bodies is approximately 8–15 development days if official-master assumptions hold. Full coverage including composed fauna and hardened official override handling is approximately 18–31 days. The ranges should be recalibrated after C1 inventories every canonical record shape; attempting a general-purpose Starfield parser or arbitrary-mod support would be a separate, substantially larger project.

## Audit verification and limitations

The diagnostic scripts inspected only selected records plus the 26 base Rocky Desert BIOM records. They prove raw ID recovery, compression, extended subrecord framing, and table resolution for the representative paths; they do not constitute broad parser validation. Base English/Japanese values were resolved from locally extracted tables. `SFBGS00D - Main.ba2` was enumerated but not extracted, so X-Tech's raw ID and archive location are proven while its localized text lookup remains an implementation check.

No production source, canonical CSV, runtime schema, package dependency, or persisted data was changed. No Bethesda binary/content dump was added. No commit or push was made.
