# Localization input regeneration

## Purpose

The localization-input tool reproducibly extracts Bethesda-owned string tables
needed by build-time provenance work. It accepts only explicitly listed BA2
archives, enumerates their members, and selects exact
`<plugin-base>_<locale>.<table-type>` matches. Archive filenames do not establish
plugin ownership.

Game archives and extracted tables are local inputs. Do not commit or
redistribute them. The application never reads them at runtime.

## Local intake config

Create an ignored config, for example
`.local-work/localization/inputs/dlc-inputs.json`:

```json
{
  "languages": ["en", "ja"],
  "outputDirectory": ".",
  "plugins": [
    {
      "plugin": "Starfield.esm",
      "archives": ["C:/Games/Starfield/Data/Starfield - Localization.ba2"]
    },
    {
      "plugin": "ShatteredSpace.esm",
      "archives": [
        "C:/Games/Starfield/Data/ShatteredSpace - Main01.ba2",
        "C:/Games/Starfield/Data/ShatteredSpace - Main02.ba2"
      ]
    }
  ]
}
```

Paths are resolved relative to the config. List candidate archives explicitly;
the tool deliberately has no directory-crawling mode. `outputDirectory` is also
relative to the config, so `.` in the example writes plugin subdirectories next
to the config under `.local-work/localization/inputs/`.

Inspect without writing extracted tables:

```text
npm run localization:inputs:inspect -- --config .local-work/localization/inputs/dlc-inputs.json
```

Extract requested members and write the local mapping manifest:

```text
npm run localization:inputs:extract -- --config .local-work/localization/inputs/dlc-inputs.json
```

The report and manifest record each archive's filename, size, SHA-256, BA2
version/type, and member count. Each selected table records plugin/base, locale,
table type, source archive/member, stored/compressed status, size, and SHA-256.
Missing requested language coverage is reported as `LANGUAGE_NOT_FOUND` rather
than satisfied by another plugin's table.

The narrow reader supports the installed BA2 v2 `GNRL` format, stored members,
and zlib-framed compressed members. Unsupported versions/types and malformed or
truncated members fail with stable error codes. It does not support texture
archives or arbitrary asset extraction.

## Rerun C2-C6 with extracted locale tables

Point the ignored provenance config at the intake manifest. C3 requires the
declared official plugin set even when a plugin contributes zero canonical
systems:

```json
{
  "gameVersion": "1.16.244.0",
  "plugins": [
    { "filename": "Starfield.esm", "path": "C:/Games/Starfield/Data/Starfield.esm" },
    { "filename": "ShatteredSpace.esm", "path": "C:/Games/Starfield/Data/ShatteredSpace.esm" },
    { "filename": "SFBGS00D.esm", "path": "C:/Games/Starfield/Data/SFBGS00D.esm" },
    { "filename": "SFBGS050.esm", "path": "C:/Games/Starfield/Data/SFBGS050.esm" }
  ],
  "localizationInputManifest": "../inputs/manifest.json",
  "localizationInputLocale": "en"
}
```

Then run:

```text
npm run localization:provenance:build -- --config .local-work/localization/provenance/c2-inputs.json
npm run localization:provenance:verify
```

Before provenance generation reads a table, the manifest adapter rechecks its
size and SHA-256 and fails with `TABLE_HASH_MISMATCH` if local content changed.
The pipeline resolves English and Japanese text
only through exact plugin, table type, and extracted string ID; it never reverse
matches English.

C3 derives its target set from `planet-directory.csv`, collapses body rows by
stable numeric `StarSystemID`, and verifies that every PNDT body assigned to a
system has the same audited `GNAM` system number. It then requires exactly one
`STDT.DNAM` match across `Starfield.esm`, `ShatteredSpace.esm`, `SFBGS00D.esm`,
and `SFBGS050.esm`. Zero targets for a supported plugin are valid. Missing or
conflicting system numbers, absent or ambiguous STDT matches, unsupported record
shapes, missing strings, and English mismatches are retained in
`localized-name-provenance-unresolved.csv`; systems are never silently dropped.

Structural source text is not edited to manufacture an English match. The
default comparison remains exact, and any source/display difference requires an
explicit entity-scoped entry in the checked-in normalization policy with both
expected values. The resolved provenance row retains the structural
`CanonicalEnglish`; the approved official string is authoritative for later
localized display generation. The generated `localized-name-normalizations.csv`
keeps each approved source/display pair visible and independently validated.

C4 independently treats every row in `planet-directory.csv` as one canonical
body target. `Planet`, `Moon`, and `Orbital` rows are peers for provenance:
membership comes only from the checked-in tracker population, never from a scan
for additional PNDT or station records. Each target is looked up by its exact
source plugin and FormID, and its name is read only from
`baseFormComponents.TESFullName_Component.fullName.FULL`; inline `ANAM` text is
not provenance. Every target must have exactly one resolved or unresolved row.
The same four official plugins are supported, and a supported plugin may
legitimately contribute zero targets.

Installed-game regeneration should report body totals by source plugin and by
the canonical `Planet`/`Moon`/`Orbital` types. Representative review covers
Akila, Volii Alpha, gas and ice giants, a Shattered Space body, and canonical
orbitals such as The Eye, The Den, The Oracle, ECS Constant, and Deimos
Staryard. Structural-source/display differences remain exact, entity-scoped
normalizations; unsupported shapes remain explicit unresolved rows.

C5 takes organic species only from `biome-organic-resources.csv` and
deduplicates its Planet × Biome occurrences by species type and stable FormID.
Flora uses direct `FLOR.FULL`. Fauna follows the exporter precedence of direct
`NPC_.FULL`, then valid CCT composition, then the bounded leveled/template route
to an encounter `NPC_.FULL`. CCT evaluation is classification only in C5:
native keywords, recursive OMOD includes, keyword properties, and INNR rule
precedence identify the exact population deferred to C6, but no localized
component IDs are emitted yet. Ambiguous CCT or template names fail closed.

Installed game version 1.16.244.0 currently yields 1,121 unique organic species
from 3,855 occurrence rows: 153 direct flora, 41 direct fauna, 5 template fauna,
and 922 composed fauna routed to C6. The generated C6 population artifact keeps
those 922 target identities and records their resolved state; the separate five-row lineage artifact records each
template fauna's canonical NPC, LVLN, leveled NPC, and encounter name provider.

C6 uses `localized-name-provenance-c6-fauna.csv` as its sole target population.
For each selected Object Template combination it unions native NPC keywords
with `NKEY` properties from selected and recursively included OMODs, then maps
`dn_CCTPrefixes` ruleset 0 to prefix, and `dn_CCTSuffixes` rulesets 0 and 1 to
species and diet. Rules use greatest required-keyword count, highest `YNAM`,
then earliest serialized order. Selected raw `WNAM` IDs produce component rows
in semantic slots `0=prefix`, `1=species`, `2=diet`; absent roles do not shift
later slots. Assembly joins non-empty components with one literal U+0020.

Installed-game regeneration fails unless the audited population remains 922
entities and 2,179 rows, with shapes 335 prefix+species+diet, 320 species+diet,
and 267 prefix+species. It also locks 602/922/655 component occurrences,
8/198/6 unique qualified prefix/species/diet IDs (212 overall), all 922 exact
English reconstructions, all 922 Japanese qualified-ID lookups, eight serialized
rule-order ties, 35 recursive-OMOD fauna, four Shattered Space targets, and zero
ambiguities or unsupported cases. `localized-name-c6-fauna-ja-preview.csv` is a
verified handoff for later overlay generation and is not consumed at runtime.

String-table decoding is locale-policy driven: English uses Windows-1252 and
Japanese uses UTF-8. Unsupported locales fail with
`UNSUPPORTED_LOCALE_ENCODING`; encodings are never guessed from bytes. Direct
Japanese runtime or Creation Kit confirmation of exact displayed U+0020
separator fidelity remains an explicit hardening task.

## Add another language

Add its Bethesda locale token to the config's `languages` array and rerun
intake, add its explicit encoding to the project policy, and add representative
composed-name verification. Discovery, mapping, and extraction are
locale-parameterized. A fresh CCT architecture audit is needed only if evidence
contradicts the fixed prefix/species/diet model. Extraction alone does not create
a runtime overlay or alter reference display behavior; that remains Parcel D.
