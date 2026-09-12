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

## Rerun C2 with extracted English tables

Point the existing ignored C2 config at the intake manifest:

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

Then run:

```text
npm run localization:provenance:build -- --config .local-work/localization/provenance/c2-inputs.json
npm run localization:provenance:verify
```

Before C2 reads a table, the manifest adapter rechecks its size and SHA-256 and
fails with `TABLE_HASH_MISMATCH` if local content changed. C2 still resolves text
only through exact plugin, table type, and extracted string ID; it never reverse
matches English.

## Add another language

Add its Bethesda locale token to the config's `languages` array and rerun
intake. Discovery, mapping, and extraction are locale-parameterized. Extraction
alone does not create a runtime overlay or alter reference display behavior;
that remains a separate localization parcel.
