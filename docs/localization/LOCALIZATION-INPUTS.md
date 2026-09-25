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

## Rerun provenance generation with extracted locale tables

Point the ignored provenance config at the intake manifest. Star-system
provenance requires the declared official plugin set even when a plugin
contributes zero canonical systems:

```json
{
  "gameVersion": "1.16.244.0",
  "plugins": [
    { "filename": "Starfield.esm", "path": "C:/Games/Starfield/Data/Starfield.esm" },
    { "filename": "ShatteredSpace.esm", "path": "C:/Games/Starfield/Data/ShatteredSpace.esm" },
    { "filename": "SFBGS00D.esm", "path": "C:/Games/Starfield/Data/SFBGS00D.esm" }
  ],
  "localizationInputManifest": "../inputs/manifest.json",
  "localizationInputLocale": "en"
}
```

`SFBGS050.esm` may remain as an additional config entry for compatibility, but
it is optional and non-authoritative. The builder ignores it for canonical
coverage, record discovery, and provider selection. All other unallowlisted
plugins are ignored as well.

## Full provenance regeneration

Prerequisites are Node/npm dependencies, the three authoritative ESMs, the
explicitly configured BA2 archives, and extracted English/Japanese tables with
their intake manifest. Keep machine paths in the ignored
`.local-work/localization/provenance/localization-provenance-inputs.json`; the committed manifest
uses normalized local references.

Run the complete installed-game pipeline with one top-level command:

```text
npm run localization:provenance:build
```

Use `-- --config <path>` only for a non-default local config. The command
validates inputs, runs direct-name, star-system, body, organic, composed-fauna,
and official provider-chain logic, verifies English and
Japanese data, reconciles coverage, compares fresh and committed artifacts, and
writes `.local-work/localization/provenance/build-report.json`. It does not
change committed files in normal mode. Missing authoritative plugins/tables,
hash mismatches, unsupported encodings, coverage gaps, verification failures,
or drift fail with an actionable code and report.

After reviewing intended drift, explicitly accept it with:

```text
npm run localization:provenance:build -- --write
```

This refreshes the six existing provenance/support CSVs and
`reference-source/localized-name-provenance-manifest.json`. Run the normal
command again to prove zero drift and deterministic output.

Before provenance generation reads a table, the manifest adapter rechecks its
size and SHA-256 and fails with `TABLE_HASH_MISMATCH` if local content changed.
The pipeline resolves English and Japanese text
only through exact plugin, table type, and extracted string ID; it never reverse
matches English.

Star-system provenance derives its target set from `planet-directory.csv`,
collapses body rows by stable numeric `StarSystemID`, and verifies that every
PNDT body assigned to a system has the same audited `GNAM` system number. It then requires exactly one
`STDT.DNAM` match across `Starfield.esm`, `ShatteredSpace.esm`, `SFBGS00D.esm`,
and `SFBGS00D.esm`. Zero targets for a supported plugin are valid. Missing or
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

Body provenance independently treats every row in `planet-directory.csv` as
one canonical body target. `Planet`, `Moon`, and `Orbital` rows are peers for provenance:
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

Organic provenance takes species only from `biome-organic-resources.csv` and
deduplicates its Planet × Biome occurrences by species type and stable FormID.
Flora uses direct `FLOR.FULL`. Fauna follows the exporter precedence of direct
`NPC_.FULL`, then valid CCT composition, then the bounded leveled/template route
to an encounter `NPC_.FULL`. CCT evaluation is classification only at this stage:
native keywords, recursive OMOD includes, keyword properties, and INNR rule
precedence identify the exact population deferred to composed-fauna provenance,
but no localized component IDs are emitted yet. Ambiguous CCT or template names fail closed.

Installed game version 1.16.244.0 currently yields 1,121 unique organic species
from 3,855 occurrence rows: 153 direct flora, 41 direct fauna, 5 template fauna,
and 922 composed fauna routed to composed-fauna provenance. The generated
population artifact keeps those 922 target identities and records their resolved
state; the separate five-row lineage artifact records each template fauna's
canonical NPC, LVLN, leveled NPC, and encounter name provider.

Composed-fauna provenance uses
`localized-name-provenance-composed-fauna.csv` as its sole target population.
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
ambiguities or unsupported cases.
`localized-name-composed-fauna-ja-preview.csv` is a verified handoff for later
overlay generation and is not consumed at runtime.

String-table decoding is driven by
`reference-source/localization-locale-metadata.json`: English uses Windows-1252,
while Japanese, French, German, Spanish (`es`), Italian (`it`), and Brazilian
Portuguese (`ptbr`) use strict UTF-8. The last three are tooling-only contracts
with `runtimeAvailable: false`; metadata registration does not activate them.
Unsupported locales fail with
`UNSUPPORTED_LOCALE_ENCODING`; encodings are never guessed from bytes. Direct
Japanese runtime or Creation Kit confirmation of exact displayed U+0020
separator fidelity remains an explicit hardening task.

## Add another language

Add its Bethesda locale token to the config's `languages` array and rerun
intake, add its explicit encoding to the project policy, and add representative
composed-name verification. Discovery, mapping, and extraction are
locale-parameterized. A fresh CCT architecture audit is needed only if evidence
contradicts the fixed prefix/species/diet model. Extraction alone does not create
a runtime overlay or alter reference display behavior; that remains localized
reference-name overlay generation.

## Patch and DLC review workflow

When a game update changes a manifested hash, run the normal builder first and
inspect the input/editorial/structural drift in the local report. Update
canonical sources or extraction/provider logic only when the evidence requires
it. Then run the explicit `--write` acceptance command, rerun repository-only
verification, and commit only the reviewed project-owned outputs. Never refresh
committed provenance merely because installed files changed.

For a new official DLC, add it deliberately to
`localization-provenance-policy.json`, declare its masters and archive/table
inputs, extend canonical tracker data, and run this same workflow. New narrow
record logic is required only if its naming shape is unsupported.

## Localized reference-name overlay handoff

Localized reference-name overlay generation consumes these project-owned
contracts:

- `localized-name-provenance.csv` for qualified direct/template identities and
  ordered composed component identities;
- `localized-name-provenance-unresolved.csv` for the explicit unresolved state;
- `localized-name-normalizations.csv` for entity-scoped English policy;
- `localized-name-provenance-manifest.json` for exact reviewed input identity;
- `localized-name-provenance-composed-fauna.csv` and
  `localized-name-provenance-template-fauna-lineage.csv` for organic
  lineage/population;
- `localized-name-composed-fauna-ja-preview.csv` for verified composed-fauna
  Japanese assembly;
- `.local-work/localization/provenance/build-report.json` for the local coverage,
  verification, and drift review.

These artifacts already carry canonical tracker identity, FormIDs, field paths,
provider ownership, exact English verification text, and composed-name rules.
Overlay generation must not rediscover them. Exact Japanese on-screen U+0020
separator fidelity remains a runtime/Creation Kit verification item.

Repository-only verification remains:

```text
npm test
npm run reference:test
npm run localization:provenance:test
npm run localization:provenance:verify
npm run reference:build
npm run build
npm run lint
```

None of these commands require installed game files. The explicit provenance
and reference-name generation commands described below use ignored local game
inputs.

## Official terminology evidence

Semantic terminology uses committed evidence separate from canonical
reference-name provenance:

- `reference-source/official-terminology-policy.json` explicitly distinguishes
  canonical content plugins from terminology evidence plugins;
- `reference-source/official-terminology-provenance.csv` stores locale-neutral
  evidence identity, source-use, and qualified string identity;
- `reference-source/official-terminology-values-<locale>.csv` stores resolved
  values and recommended defaults keyed back to `EvidenceId`;
- `SFBGS050.esm` is terminology evidence only and cannot contribute tracker
  reference entities or generated reference names.

Repository-only verification is available through:

```text
npm run localization:terminology:verify
```

For future languages, a qualified term such as `term.x-tech-power-core` reuses
`SFBGS050.esm / MISC:02031E18 / topLevel.FULL / strings:000011E5` against the
locale-specific official string table. This avoids English reverse matching.
Contextual evidence remains subject to language-specific editorial review.

## Official reference-name overlay generation

The locale-oriented official reference-name generator consumes the committed
`localized-name-provenance.csv` identities and the exact locale tables named
by `localized-name-provenance-manifest.json`. It never discovers FormIDs or
providers and never reverse-matches English. Before reading a local table it
requires its member identity, size, and SHA-256 to match the committed
provenance manifest.

Installed-game generation is locale-oriented; for example:

```text
npm run localization:reference-names:build -- --locale fr-FR
```

Normal mode materializes the result in memory and fails with semantic drift
categories without changing tracked files. After review, explicit acceptance
mode writes the deterministic outputs:

```text
npm run localization:reference-names:build -- --locale fr-FR --write
```

The locale-specific outputs follow the pattern
`src/localization/generated/<locale>-reference-names.ts` and
`reference-source/localized-reference-names-<locale>-manifest.json`. The TypeScript
module is the only committed text-bearing output. The sidecar records upstream
and generated hashes, tracker locale, Bethesda token, encoding, official table identities, game/tool versions, counts,
and composition/separator policy without local paths or Bethesda table text.

Direct and template rows resolve one exact qualified value. Composed fauna are
precomposed during generation in semantic slot order (optional prefix, required
species, optional diet), with exactly one U+0020 between components. The
browser will not need Bethesda composition rules.

The current closure is 3,561 entities: 428 biomes, 1,776 bodies, 1,121 species,
5 official terms, 30 products, 78 resources, and 123 systems. Resource coverage
is all 76 surfaced resources plus source-only `aqueous-hematite` and
`caelumite`.

Repository-only integrity checking requires no installed game files:

```text
npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE
```

It validates exact coverage against committed provenance, hashes, kinds,
non-empty Japanese values, resource reconciliation, and sidecar counts. The
normal production build runs this verifier. A future locale can reuse the same
provenance, kind normalization, materialization, and serialization boundaries
with an explicit locale encoding and manifested official tables.

French and German additionally have project-owned evidence records at
`reference-source/localized-fauna-evidence-<locale>.json`. They retain the
reviewed screenshot identity, exact observed and predicted text, composition
details, and explicit match result. A local, ignored matching index can be
generated after the overlays exist:

```text
npm run localization:fauna-evidence:build -- --locale fr-FR
npm run localization:fauna-evidence:build -- --locale de-DE
```

Each index contains the stable fauna ID, canonical English name, predicted
localized name, component shape, known planetary-body IDs, and qualified component sources for all 922
composed fauna. Evidence observations must identify a canonical fauna and state
an explicit match or mismatch. Any mismatch prevents provisional acceptance;
the tooling does not silently add per-fauna grammar exceptions.

The current French and German evidence records are provisionally accepted from
distinct Jemison observations covering every component shape. This remains a
practical evidence standard rather than mathematical proof; later contradictory
gameplay evidence must reopen the affected locale policy.
