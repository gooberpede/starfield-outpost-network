# CODEX IMPLEMENTATION BRIEF — DLC Localization Input Intake and C2 Closure

## Purpose

Extend the existing localization/provenance tooling so the project can reproducibly discover and extract the missing official localization table inputs for supported Starfield plugins, then rerun Parcel C2 to close the currently unresolved rows.

This task should fill the four current `MISSING_LOCALIZATION_INPUT` cases:

- 3 Shattered Space biomes
- 1 X-Tech resource from `SFBGS00D.esm`

It should also add **Terran Armada (`SFBGS050.esm`) archive/table discovery** now, so the same tooling can be reused later when that DLC contributes canonical targets.

The goal is to extend the existing tooling in a reusable way for future languages and future Bethesda-owned terms.

This is **not Parcel D** yet.

Do not generate Japanese runtime overlays.

Do not commit or push.

---

# Background

Parcel C1 implemented the narrow read-only ESM reader.

Parcel C2 implemented the normalized canonical localized-name provenance crosswalk and English verification.

Current C2 status:

```text
519 canonical targets

Resolved:
  515

Unresolved:
  4

Reason:
  MISSING_LOCALIZATION_INPUT

Breakdown:
  Shattered Space biomes: 3
  X-Tech resource:        1
```

The ESM-side provenance is already known for all four unresolved rows.

Known X-Tech proof:

```text
SFBGS00D.esm
IRES:01033E3F
FULL
-> strings:00000FC7
```

The missing piece is archive/table input discovery and extraction.

---

# Primary objective

Build a small reusable build-time tool that can:

```text
explicit BA2 input(s)
    ->
enumerate archive members
    ->
identify matching Bethesda localization table members
    ->
extract only required localization members
    ->
hash them
    ->
associate them with plugin/base + locale + table type
    ->
feed the resulting English tables into C2 verification
```

The tool should be useful later for Japanese and other languages.

---

# Scope classification

**Low-to-medium data-tooling task.**

Expected work:

- narrow BA2 localization-member discovery/extraction;
- plugin/archive/table mapping;
- language-aware table selection;
- reproducibility hashes;
- C2 regeneration using newly available English tables;
- focused tests;
- documentation.

Do not expand into:

- arbitrary BA2 content browsing;
- general asset extraction;
- runtime archive access;
- Japanese overlay generation;
- general mod load-order support;
- C3 systems provenance;
- full Parcel D pipeline.

---

# Target plugins / DLCs

At minimum support and inspect:

## Base game

```text
Starfield.esm
Starfield - Localization.ba2
```

This is already known to contain:

```text
starfield_<lang>.strings
starfield_<lang>.dlstrings
starfield_<lang>.ilstrings
```

Use as a regression/reference case.

## Shattered Space

Plugin:

```text
ShatteredSpace.esm
```

Inspect the installed Shattered Space BA2 set explicitly, including likely candidates such as:

```text
ShatteredSpace - Main01.ba2
ShatteredSpace - Main02.ba2
```

Do not assume which archive contains localization members before enumeration.

## X-Tech / SFBGS00D

Plugin:

```text
SFBGS00D.esm
```

Known archive packaging from the audit:

```text
SFBGS00D - Main.ba2
```

Do not assume a `- Localization.ba2` naming convention.

## Terran Armada

Plugin:

```text
SFBGS050.esm
```

Inspect its installed BA2 set explicitly, including likely:

```text
SFBGS050 - Main.ba2
```

The immediate goal is only to establish reusable archive/table mapping.

Do not require Terran Armada to contribute provenance rows in C2 if no current canonical target references it.

---

# Critical design principle

The project should never infer plugin localization ownership from archive filename convention alone.

Instead:

```text
explicit candidate BA2 paths
    ->
enumerate members
    ->
detect localization tables by member basename/content name
    ->
validate plugin/base association
```

The tool should discover the actual members present.

---

# Language support

The intake tool must be language-parameterized.

At minimum support:

```text
en
ja
```

Do not hard-code English-only behavior into archive discovery.

A future call should be able to request another Bethesda-supported language without changing the extraction architecture.

Suggested conceptual CLI:

```text
node scripts/localization/extract-localization-inputs.mjs \
  --plugin Starfield.esm \
  --archive "Starfield - Localization.ba2" \
  --languages en,ja
```

or equivalent manifest-driven input.

---

# BA2 scope

Implement only enough BA2 support to discover and extract localization table members.

Required format support should match the installed archives actually needed for this task.

The earlier audit found base localization uses BA2 v2 `GNRL`.

Support:

- BA2 header validation;
- archive type validation;
- member/file table enumeration;
- stored members;
- compressed members if encountered;
- exact member extraction;
- deterministic member naming.

Do not implement texture archive handling or unrelated asset types.

If an archive uses a BA2 version already covered by the existing audit/diagnostic knowledge, support it.

If a target DLC archive requires an unsupported variant, stop and report it rather than silently misreading it.

---

# Prefer project-owned implementation

Prefer a small project-owned Node implementation.

Do not shell out to BSArch for the production/reproducible path unless the task uncovers a concrete blocker.

BSArch may be used as a one-off validation oracle during development if useful.

No runtime dependency should be added.

Zero new npm dependencies is preferred.

---

# Localization member detection

Discover members matching Bethesda localization-table patterns.

Conceptually:

```text
<plugin-base>_<locale>.strings
<plugin-base>_<locale>.dlstrings
<plugin-base>_<locale>.ilstrings
```

Comparison should be case-insensitive where archive member naming warrants it.

Normalize plugin/base identity deterministically.

Examples:

```text
Starfield.esm
-> starfield

ShatteredSpace.esm
-> shatteredspace

SFBGS00D.esm
-> sfbgs00d

SFBGS050.esm
-> sfbgs050
```

Do not accept unrelated table basenames just because the language suffix matches.

If multiple candidate members conflict for the same:

```text
(plugin base, locale, table type)
```

fail and report ambiguity.

---

# Extracted input location

Extract only required localization members into a local, ignored workspace.

Prefer:

```text
.local-work/localization/inputs/
```

Suggested structure:

```text
.local-work/localization/inputs/
  starfield/
    starfield_en.strings
    starfield_en.dlstrings
    starfield_en.ilstrings
    starfield_ja.strings
    ...
  shatteredspace/
    ...
  sfbgs00d/
    ...
  sfbgs050/
    ...
```

Do not commit Bethesda string-table files.

---

# Mapping manifest

Create a machine-readable local manifest that records the discovered association.

Suggested shape:

```json
{
  "plugins": {
    "Starfield.esm": {
      "archives": ["Starfield - Localization.ba2"],
      "tables": {
        "en": {
          "strings": "...",
          "dlstrings": "...",
          "ilstrings": "..."
        },
        "ja": {
          "strings": "...",
          "dlstrings": "...",
          "ilstrings": "..."
        }
      }
    }
  }
}
```

Include hashes and sizes for:

- BA2 input archives;
- extracted localization members.

Do not include user-specific absolute paths in durable/committed metadata.

A local manifest under `.local-work/` may contain local paths.

---

# Reproducibility report

For each archive, record:

```text
filename
size
sha256
BA2 version
archive type
member count
```

For each extracted table:

```text
plugin/base
locale
table type
archive filename
member name
size
sha256
```

This should be deterministic apart from timestamp fields.

---

# C2 integration

After discovering/extracting the English tables for:

```text
ShatteredSpace.esm
SFBGS00D.esm
```

rerun the existing C2 local provenance generation/verification using these new table inputs.

Expected result:

```text
519 resolved
0 unresolved
```

Do not alter any raw ESM provenance unless the verifier uncovers a genuine mismatch.

The four currently unresolved rows should become resolved solely because their official English string tables are now available.

---

# Required C2 checks

For the three Shattered Space BIOM rows:

```text
existing record/plugin/FormID/string ID
    ->
ShatteredSpace English table
    ->
exact CanonicalEnglish match
```

For X-Tech:

```text
SFBGS00D.esm
IRES:01033E3F
strings:00000FC7
    ->
SFBGS00D English table
    ->
exact CanonicalEnglish match
```

No English reverse matching.

---

# Japanese intake

While extracting the English tables, also extract the corresponding Japanese tables when present.

This is for future Parcel D use.

Do not consume them into runtime output yet.

Report coverage:

```text
plugin
en tables present?
ja tables present?
```

At minimum inspect all three table types:

```text
strings
dlstrings
ilstrings
```

Do not assume all three exist for every plugin unless observed.

---

# Terran Armada intake

For `SFBGS050.esm`:

- discover candidate archive(s);
- enumerate localization members;
- extract `en` and `ja` tables if present;
- record hashes/mapping;
- validate that table basenames map cleanly to `SFBGS050`.

Do not fabricate a provenance target just to exercise the tables.

If Terran Armada localization tables are absent from the expected archive set, report the exact archive/member evidence and stop short of guessing.

---

# String-table decoder reuse

Reuse the C2 English string-table reader for validation.

Do not create a second table parser.

The same extracted files should be suitable later for:

```text
en verification
ja overlay generation
future language lookup
```

---

# Commands

Add clear reusable npm commands, for example:

```text
npm run localization:inputs:extract
npm run localization:inputs:inspect
```

or one command with modes.

Suggested workflow:

```text
npm run localization:inputs:extract -- --manifest .local-work/.../dlc-inputs.json
npm run localization:provenance:build
npm run localization:provenance:verify
```

Use existing repository conventions if better names already exist.

---

# Input manifest / CLI

Do not auto-search the whole Starfield `Data` directory unless explicitly requested.

Keep this a sniper.

Preferred model:

```text
user supplies explicit archive paths
```

through either:

- repeated `--archive` arguments; or
- a small local input manifest.

The tool may validate that the provided archives contain expected plugin localization members.

It should not crawl arbitrary BA2s looking for anything localization-related.

---

# Error handling

Use stable, actionable errors where practical.

Examples:

```text
BA2_UNSUPPORTED_VERSION
BA2_UNSUPPORTED_TYPE
BA2_MEMBER_TRUNCATED
BA2_DECOMPRESSION_FAILED
LOCALIZATION_TABLE_NOT_FOUND
LOCALIZATION_TABLE_AMBIGUOUS
PLUGIN_BASE_MISMATCH
LANGUAGE_NOT_FOUND
TABLE_HASH_MISMATCH
```

Include:

```text
archive filename
member name
plugin/base
locale
table type
```

where applicable.

Do not dump unrelated archive contents.

---

# Tests

Add synthetic/minimal project-authored BA2 fixtures.

Do not commit Bethesda archive bytes.

Cover:

## Archive mechanics

- valid minimal GNRL archive;
- stored member extraction;
- compressed member extraction if supported/encountered;
- malformed header;
- unsupported archive type;
- truncated member.

## Localization detection

- exact plugin/base + locale + table-type match;
- case normalization;
- unrelated member ignored;
- ambiguous duplicate fails;
- missing requested language reports clearly.

## Mapping

- one plugin across one archive;
- one plugin across multiple archives;
- archive containing unrelated assets plus localization members;
- explicit archive input only; no directory crawler behavior.

## C2 intake integration

- synthetic previously-unresolved target becomes resolved once matching table input is supplied;
- wrong plugin table does not satisfy the target.

---

# Documentation

Update durable documentation.

At minimum:

## `docs/ARCHITECTURE.md`

Document the build-time localization-input layer:

```text
explicit BA2 inputs
    ->
localization member extractor
    ->
local extracted official string tables
    ->
C2 English verification
    ->
future Parcel D locale overlays
```

Clarify that game archives are never read at application runtime.

## Reference/localization regeneration docs

Document:

- how to provide explicit DLC BA2 paths;
- how to request languages;
- where local extracted tables are written;
- how to rerun C2;
- no Bethesda archive/table redistribution;
- how to add another language later.

## `docs/THIRD-PARTY-REFERENCES.md`

Only update if third-party code is copied/adapted or a new dependency/tool becomes part of the workflow.

Do not add parcel-level OpenAI/Codex diary entries.

---

# Expected output after local run

Report the exact discovered table mapping for:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

For each:

```text
archive(s)
en table member(s)
ja table member(s)
hashes
```

Then report C2:

```text
resolved: 519
unresolved: 0
```

if all required inputs are successfully found and verified.

If not, retain unresolved rows with precise reasons and report exactly what was missing.

---

# No runtime changes

Do not modify:

- React UI;
- runtime localization catalogue;
- `ja-JP` reference overlay;
- search behavior;
- persistence;
- Undo/Redo;
- import/export;
- player/network schema.

This remains build tooling only.

---

# No Parcel D implementation yet

Although Japanese tables should be extracted, do not:

- align/generate Japanese runtime names;
- create `src/localization/reference-names/ja-JP.json`;
- migrate reference display consumers;
- add Japanese search aliases.

Parcel D will consume the reusable inputs later.

---

# Verification

Run:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run build
npm run lint
git diff --check
```

Also run the new localization-input extraction tests.

When local DLC files are available, run the full extraction + C2 regeneration/verification and report exact results.

---

# Acceptance criteria

This task is complete when:

1. A project-owned Node tool can inspect explicitly supplied BA2 localization inputs.
2. It extracts only requested localization-table members.
3. Plugin/base, locale, and table type are validated.
4. Archive filename conventions are not assumed.
5. `en` and `ja` are parameterized inputs, not hard-coded architecture.
6. Extracted Bethesda tables remain local/ignored.
7. Archive and table hashes are recorded.
8. Shattered Space English localization tables are successfully supplied to C2.
9. SFBGS00D English localization tables are successfully supplied to C2.
10. The three Shattered Space unresolved rows become resolved if the inputs validate.
11. X-Tech becomes resolved if `00000FC7` verifies against official English.
12. C2 reaches 519/519 resolved, or any remaining failure is precisely classified.
13. Terran Armada archive/table mapping is discovered and recorded for `en` and `ja` where present.
14. Japanese tables are extracted for future use but not consumed into runtime output.
15. No generic BA2 browser/gatherer is created.
16. No runtime/UI/persistence/schema changes are introduced.
17. No Bethesda archive/string-table content is committed.
18. Standard tests/build/lint/reference checks pass.
19. No commit or push is performed.

---

# Final report

Report:

- files added/changed;
- BA2 reader/extractor architecture;
- dependency additions, if any;
- exact plugin -> archive -> table mapping;
- English/Japanese table coverage by plugin;
- hashes for archives and extracted tables;
- C2 before/after resolved/unresolved counts;
- exact X-Tech verification result;
- exact Shattered Space verification result;
- Terran Armada discovery result;
- tests/build/lint results;
- any unsupported BA2/archive variant encountered;
- confirmation that no Japanese overlay/runtime/UI/persistence/schema work was introduced.

Do not proceed to C3 or Parcel D unless separately instructed.
