# CODEX IMPLEMENTATION BRIEF — Localization Parcel C1: Narrow ESM Reader, Manifest, and Semantic Field Map

## Purpose

Implement **Parcel C1**, the foundation for canonical Bethesda localized-string provenance.

C1 should establish a **small, read-only, fail-closed Starfield plugin reader** that can recover raw localized string IDs from a deliberately narrow set of audited record/field paths.

C1 is **not** a general-purpose Starfield ESM parser.

C1 is **not** the full Parcel C provenance pipeline.

C1 must not yet generate the complete canonical `localized-name-provenance.csv` for every population.

C1 must not generate Japanese overlays; that belongs to Parcel D.

Do not commit or push.

---

# Source of truth

Base this implementation on:

`docs/audits/codex-localized-string-provenance-audit.md`

Important proven findings from the audit:

- xEdit 4.1.5p scripting resolves localized fields and does not expose the raw serialized uint32 string ID through the tested scripting APIs.
- A narrow direct Node spike successfully recovered raw localized IDs from Starfield ESM records.
- The minimum audited parser surface is small:
  - 24-byte record/group framing;
  - recursive `GRUP`;
  - zlib-compressed records;
  - `XXXX` extended subrecord sizes;
  - exact record selection;
  - allowlisted semantic field paths only;
  - little-endian uint32 localized IDs.
- String-table type is not serialized beside the ID and must come from a project-owned semantic field map.
- xEdit remains authoritative for structural relationships, winning overrides, and discovery.
- The raw ESM reader should be authoritative only for serialized string IDs.

The four required proof targets from the audit are:

```text
Aluminum
Starfield.esm IRES:000057D6 FULL
-> strings:00008155

Rocky Desert
Starfield.esm BIOM:002ACD5A FULL
-> strings:000062F4

Alpha Centauri
Starfield.esm STDT:0005E60A TESFullName_Component FULL
-> strings:0000A9D0

Akila
Starfield.esm PNDT:0005E2B6 TESFullName_Component FULL
-> strings:0000A3B2
```

These values are diagnostic proof fixtures, not application constants.

---

# Scope classification

**Medium, infrastructure-focused.**

Expected work:

- one narrow read-only parser module/tool;
- one semantic field-map abstraction;
- one reproducibility/input manifest format;
- focused tests/fixtures;
- four representative proof extractions;
- documentation for regeneration and limitations.

Do not broaden into C2/C3/C4 functionality beyond what is needed to validate C1 abstractions.

---

# Hard scope boundaries

C1 must **not**:

- parse arbitrary unknown record types;
- write ESM/plugin files;
- implement arbitrary mod load orders;
- implement full override inheritance;
- normalize every full/medium/light FormID case;
- parse BA2 archives;
- parse Japanese string tables for production;
- generate the final Japanese reference overlay;
- migrate runtime display consumers;
- modify persisted application/network schemas;
- change stable runtime IDs;
- add Japanese search/font/layout work;
- solve composed fauna;
- modify canonical recipe/biome CSV schemas beyond optional C1-local diagnostics.

If something requires those capabilities, record it for C2–C8 instead of expanding C1.

---

# Recommended location

Prefer project-owned tooling under:

```text
scripts/
```

Suggested structure:

```text
scripts/localization/
  starfield-plugin-reader.mjs
  localized-field-map.mjs
  provenance-manifest.mjs
  verify-localized-proof-targets.mjs
```

Exact filenames may differ if repository conventions suggest better names.

Tests should follow the repository’s existing Node/reference-tool test conventions.

---

# Input contract

The parser must never hard-code the user’s local Starfield installation path.

Accept explicit paths through CLI arguments, environment-independent configuration, or a small local-only manifest.

At minimum the C1 diagnostic/proof command should accept:

```text
--plugin <path-to-Starfield.esm>
```

If more than one plugin path is needed for test coverage, accept repeated arguments or a manifest file.

Do not infer paths from Windows Registry or Steam installation automatically in C1.

Missing inputs must produce actionable errors.

---

# Reproducibility manifest

Implement a small machine-readable manifest for local extraction runs.

The manifest should record at minimum:

```text
gameVersion
toolVersion
generatedAt
plugins:
  - sourcePath or normalized basename
  - filename
  - size
  - sha256
declaredLoadOrder:
  - plugin filenames in order
```

For C1, a single-plugin proof manifest is acceptable.

Do not commit user-specific absolute local paths.

If the manifest is checked in later, it should contain stable filenames/hashes/version metadata only.

For now, generated local manifests may live under:

```text
.local-work/localization/provenance/
```

unless a durable test fixture manifest is clearly project-authored and safe to commit.

---

# Parser requirements

## 1. Read-only behavior

The parser must open plugins read-only.

No code path may mutate game files.

No temporary modified copy of a plugin should be produced.

---

## 2. Record/group framing

Implement support for:

- 24-byte record headers;
- 24-byte `GRUP` headers;
- recursive traversal of nested groups.

Do not assume all target records are in one fixed group depth.

Expose enough metadata for diagnostics:

```text
record signature
raw FormID
flags
data size
group ancestry if useful
```

---

## 3. Compressed records

Support record flag:

```text
0x00040000
```

Behavior:

- read first uint32 as expected uncompressed size;
- zlib inflate the remaining payload;
- verify actual uncompressed size matches expected size;
- fail clearly on mismatch/decompression error.

Akila PNDT must exercise this path.

---

## 4. Subrecord framing

Support:

- normal four-character signature + uint16 length;
- `XXXX` extended-size subrecord behavior.

The parser must apply the `XXXX` uint32 length only to the immediately following subrecord and then clear the override.

Add focused tests for malformed/incomplete `XXXX` structures.

---

## 5. Exact record selection

C1 should support selecting a record by:

```text
plugin
signature
FormID
```

For this parcel, exact local/raw FormID matching against the audited base plugin is sufficient.

Do not claim generalized origin-plugin/load-order normalization yet.

The API should nevertheless be designed so later C7 normalization can be inserted without rewriting all callers.

For example:

```ts
interface PluginRecordSelector {
  signature: string
  formId: number
}
```

may later evolve behind a stable higher-level identity wrapper.

---

## 6. Fail-closed semantics

Never scan for “the first FULL” and assume it is the display name.

The raw parser should expose subrecord structure.

A separate semantic field map must define exactly which localized field is valid for a given proof target/population.

Unknown or ambiguous shapes must throw/report an unsupported-shape error.

---

# Semantic field map

Implement a checked-in, project-owned map describing audited localized-name paths.

The map must distinguish at least:

```text
IRES top-level FULL
BIOM top-level FULL
STDT TESFullName_Component FULL
PNDT TESFullName_Component FULL
```

The map should also declare the expected string table:

```text
strings
```

for these C1 paths.

Suggested conceptual shape:

```ts
interface LocalizedFieldDefinition {
  recordSignature: string
  semanticPath: string
  stringTable: 'strings' | 'dlstrings' | 'ilstrings'
  selector: ...
}
```

Do not encode xEdit UI breadcrumb text as the only identity.

Use stable project-owned semantic path tokens, for example:

```text
topLevel.FULL
baseFormComponents.TESFullName_Component.fullName.FULL
```

Retain xEdit path wording in comments/docs if useful for traceability.

---

# Component-aware selection

For `STDT` and `PNDT`, the localized `FULL` belongs to the `TESFullName_Component`.

C1 must prove that it can select that semantic field without mistaking:

- unrelated sibling `FULL` fields;
- inline `ANAM` text;
- later component fields;
- nested data with the same signature.

Use surrounding component markers/structure discovered in the audit.

Do not implement generic component semantics beyond the exact audited full-name component path.

---

# Raw localized ID extraction

For an allowlisted localized field:

- require exactly four bytes for the audited uint32 payload;
- read little-endian unsigned uint32;
- expose both numeric and normalized hex forms.

Normalized display format:

```text
00008155
```

Rules:

- uppercase;
- eight hex digits;
- no `0x` prefix in serialized/report output;
- internal numeric representation is unsigned 32-bit.

---

# C1 proof-target command

Provide a focused diagnostic command that proves all four audited targets against the supplied `Starfield.esm`.

Suggested command concept:

```text
npm run localization:provenance:proof -- --plugin "...\Starfield.esm"
```

or an equivalent Node invocation.

The command should emit a deterministic report such as:

```text
PASS Aluminum
  IRES:000057D6
  topLevel.FULL
  strings:00008155

PASS Rocky Desert
  BIOM:002ACD5A
  topLevel.FULL
  strings:000062F4

PASS Alpha Centauri
  STDT:0005E60A
  baseFormComponents.TESFullName_Component.fullName.FULL
  strings:0000A9D0

PASS Akila
  PNDT:0005E2B6
  baseFormComponents.TESFullName_Component.fullName.FULL
  strings:0000A3B2
```

If any record/path/value differs, fail non-zero.

Do not silently accept “close” results.

---

# Proof values and maintenance

The four expected IDs may be stored in a dedicated proof-target data structure used only by tests/diagnostics.

Do not place them in runtime localization code.

Document that they are pinned to the audited game version:

```text
Starfield 1.16.244.0
```

A game update/hash change may legitimately require re-auditing.

---

# Test strategy

Do not commit Bethesda ESM data.

Use synthetic/minimal project-authored binary fixtures for parser mechanics.

Required focused tests:

## Record/group framing

Cover:

- one uncompressed record;
- nested groups;
- unexpected/truncated header;
- declared payload beyond file bounds.

## Compression

Cover:

- valid compressed record;
- wrong uncompressed-size prefix;
- invalid zlib payload.

## Subrecords

Cover:

- normal subrecord;
- multiple subrecords;
- valid `XXXX`;
- dangling `XXXX`;
- extended size beyond record bounds.

## Localized ID

Cover:

- valid four-byte uint32;
- invalid localized-field payload length;
- little-endian normalization to uppercase eight-digit hex.

## Field-map behavior

Cover:

- supported `IRES` top-level `FULL`;
- supported `BIOM` top-level `FULL`;
- supported full-name component route;
- unsupported record signature;
- ambiguous/missing semantic path fails closed.

Synthetic fixtures may model only the minimum bytes required to exercise these paths.

Do not copy chunks of Bethesda records into test fixtures.

---

# Optional live integration test

The four real proof targets may be exercised by an **opt-in local integration command** when a real `Starfield.esm` path is supplied.

This test must not fail ordinary CI merely because the user/game files are unavailable.

Separate:

```text
unit/parser tests
```

from:

```text
local installed-game proof
```

clearly.

---

# Hash verification

For the audited local game build, the audit recorded:

```text
Starfield.esm
SHA-256:
1DABED00C3F4282DD3BB54D2E9601E40B577D8742D078B7CCEF203ADBFEF0DA7
```

C1 should compute SHA-256.

Behavior should be one of:

- report the observed hash and compare against an expected proof-profile hash;
- or require a proof profile specifying expected hash/version.

If the hash differs:

- do not refuse all parsing automatically;
- warn that the audited proof expectations may no longer apply;
- require explicit acknowledgement/profile update before treating mismatches as implementation defects.

Do not hide version drift.

---

# API design

Keep parser internals separate from semantic extraction.

Suggested layering:

```text
binary file reader
    ->
record/group iterator
    ->
subrecord decoder
    ->
exact record lookup
    ->
semantic localized-field extractor
    ->
proof/verifier command
```

Avoid one monolithic script.

Pure functions should be preferred for:

- header decoding;
- subrecord iteration;
- hex formatting;
- field-map selection.

This will make C2–C7 easier to extend safely.

---

# Error model

Use stable error categories or codes where practical.

Examples:

```text
PLUGIN_TRUNCATED
RECORD_DECOMPRESSION_FAILED
RECORD_SIZE_MISMATCH
SUBRECORD_TRUNCATED
XXXX_WITHOUT_FOLLOWING_SUBRECORD
UNSUPPORTED_RECORD_SIGNATURE
SEMANTIC_FIELD_NOT_FOUND
SEMANTIC_FIELD_AMBIGUOUS
LOCALIZED_ID_INVALID_LENGTH
PROOF_EXPECTATION_MISMATCH
```

Errors should include enough context for debugging:

```text
plugin
record signature
FormID
semantic path
byte offset where useful
```

Do not expose raw game-data dumps in normal error output.

---

# Logging/output

Default output should be concise and deterministic.

Verbose diagnostics may be enabled with a flag such as:

```text
--verbose
```

Do not print full record payloads.

Do not emit extracted Bethesda text in C1.

The goal is raw provenance mechanics only.

---

# Package/dependency policy

Prefer Node standard-library functionality where practical.

A small dependency for binary parsing is acceptable only if it materially reduces risk and has a compatible license.

Do not add Mutagen/.NET or a general plugin parser in C1.

Do not add xEdit as a programmatic dependency.

If any new npm dependency is introduced:

- justify it in the final report;
- update third-party provenance if appropriate;
- keep it build/dev-only.

Zero new dependencies is preferred.

---

# Documentation

Update relevant durable documentation.

At minimum:

## `docs/ARCHITECTURE.md`

Add the Parcel C provenance boundary:

```text
xEdit / canonical sources
    -> semantic identity/relationships
narrow ESM reader
    -> raw serialized localized IDs
field map
    -> table type + semantic path
Parcel D
    -> localized text / overlays
```

Clarify that no game-file parsing occurs at runtime.

## `docs/THIRD-PARTY-REFERENCES.md`

Only update if C1 actually adopts or copies/adapts third-party code.

Studying xEdit/Mutagen/etc. is already covered by the audit/provenance record.

Do not add implementation-churn entries unnecessarily.

## Build/reference documentation

Document:

- required local input;
- proof command;
- game-version/hash caveat;
- no Bethesda binary redistribution;
- distinction between CI unit tests and installed-game proof.

If there is already a reference-data build document, extend it rather than creating redundant docs.

---

# No canonical CSV migration yet

Do not generate the final:

```text
reference-source/localized-name-provenance.csv
```

in C1 unless a tiny proof-only temporary artifact is useful locally.

C1 establishes the machinery.

C2/C3/C4/C8 will use it to populate normalized provenance.

Avoid premature schema churn.

---

# Verification commands

Run:

```text
npm test
npm run reference:test
npm run reference:build
npm run build
npm run lint
git diff --check
```

Also run any new focused parser/provenance unit-test command.

If a real local `Starfield.esm` is available, run the four-target installed-game proof command and report:

- plugin filename;
- size;
- SHA-256;
- all four recovered IDs;
- pass/fail.

Do not require the local integration proof for generic CI.

---

# Expected diff profile

Expected C1 diff should mainly contain:

- `scripts/localization/...`
- focused tests;
- package scripts if useful;
- architecture/build documentation.

No React/UI changes.

No runtime localization catalogue changes.

No canonical player/network schema changes.

No generated Japanese data.

---

# Acceptance criteria

C1 is complete when:

1. A project-owned read-only Node parser can traverse Starfield record/group framing.
2. Compressed records are handled safely.
3. `XXXX` extended subrecords are handled safely.
4. Exact record selection by signature/FormID works for audited base-plugin proof targets.
5. A checked-in semantic field map exists.
6. Semantic extraction fails closed for unknown/ambiguous shapes.
7. Raw localized uint32 IDs are emitted in normalized eight-digit uppercase hex.
8. The four real proof targets recover exactly:
   - Aluminum -> `00008155`
   - Rocky Desert -> `000062F4`
   - Alpha Centauri -> `0000A9D0`
   - Akila -> `0000A3B2`
9. Akila proves compressed-record support.
10. STDT/PNDT prove component-aware `FULL` selection.
11. Synthetic fixtures cover parser mechanics without embedding Bethesda content.
12. Local installed-game proof is opt-in and not required in CI.
13. Reproducibility metadata/hash reporting exists.
14. Documentation clearly separates C1 from later C2–C8 work.
15. No Bethesda ESM/BA2/string-table data is committed.
16. No production/runtime application behavior changes.
17. All standard tests/build/lint/reference checks pass.
18. No commit or push is performed.

---

# Final report

Report:

- files added/changed;
- parser architecture;
- dependency additions, if any;
- semantic field-map design;
- synthetic test coverage;
- installed-game proof result;
- actual observed `Starfield.esm` hash;
- four recovered proof IDs;
- any record-shape deviations from the audit;
- documentation changes;
- verification results;
- deferred work for C2/C3/C4/C5/C6/C7/C8;
- confirmation that no Bethesda data, runtime overlays, UI, persistence, or schema changes were introduced.

Do not proceed into C2 unless separately instructed.
