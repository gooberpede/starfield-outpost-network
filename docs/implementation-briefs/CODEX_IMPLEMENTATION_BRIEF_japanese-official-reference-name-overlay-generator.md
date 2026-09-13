# CODEX IMPLEMENTATION BRIEF — Japanese Official Reference-Name Overlay Generator

## Purpose

Implement the first runtime-localization build slice for Japanese official reference names.

This slice consumes the completed Parcel C provenance contract and generates the committed Japanese reference-name artifact that later runtime integration will consume.

This is a **build-time generation task only**.

Do not wire the generated map into React/runtime lookup yet.

Do not change semantic-message translations yet.

Do not implement generic terminology adjudication yet.

Do not commit or push.

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
C2
C7
D1
```

in durable implementation names.

Those labels are useful in planning history, not in code that should remain meaningful months later.

Use descriptive names based on function, for example:

```text
reference-name-overlay
official-reference-names
japanese-reference-names
reference-name-materializer
```

Prefer durable domain language over parcel/phase numbering.

---

# Scope classification

**Local-to-medium build tooling task.**

Expected touched areas:

- localization generation scripts;
- generated Japanese reference-name module;
- generated-data manifest/sidecar;
- package scripts;
- repository-only verification tests;
- localization build documentation.

Do not touch:

- React UI;
- runtime locale lookup registration;
- search behavior;
- history;
- validation presentation;
- persistence;
- import/export;
- schema versions;
- semantic message catalogues.

---

# Authoritative upstream contract

Parcel C is complete with:

```text
3,561 resolved entities
4,818 provenance rows
78 resource entities
0 unresolved
3 approved normalizations
```

Provider rows:

```text
Starfield.esm       4,781
ShatteredSpace.esm     35
SFBGS00D.esm            2
```

Authoritative source universe remains exactly:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Do not rediscover FormIDs, providers, field paths, or canonical identities.

Consume the committed provenance contract.

---

# Input artifacts

Primary authoritative input:

```text
reference-source/localized-name-provenance.csv
```

Also use:

```text
reference-source/localized-name-provenance-manifest.json
reference-source/localization-provenance-policy.json
reference-source/localized-name-normalizations.csv
```

and the existing manifest-backed extracted Japanese localization tables under local ignored build inputs.

The generator must validate that the installed/local Japanese table inputs match the committed Parcel C manifest identity before materializing text.

---

# Output artifact

Generate exactly one committed runtime text-bearing module:

```text
src/localization/generated/ja-JP-reference-names.ts
```

Use a clear generated-file header such as:

```text
// Generated file. Do not edit manually.
// Source: committed localization provenance + official Japanese Bethesda string tables.
```

The file should be:

- deterministic;
- stable-sorted;
- two-space formatted;
- UTF-8;
- reviewable in git;
- directly importable by TypeScript/Vite;
- independent of installed Starfield files at runtime.

---

# Runtime data shape

Generate a single nested map keyed by runtime reference kind, then stable application ID.

Recommended shape:

```ts
export const jaJPReferenceNames = {
  biome: {
    /* stable BiomeReference.id -> Japanese */
  },
  body: {
    /* stable PlanetaryBodyReference.id -> Japanese */
  },
  species: {
    /* stable SpeciesReference.id -> Japanese */
  },
  'official-term': {
    /* stable official-term ID -> Japanese */
  },
  product: {
    /* stable ProductId -> Japanese */
  },
  resource: {
    /* stable ResourceId -> Japanese */
  },
  system: {
    /* stable StarSystemReference.id -> Japanese */
  },
} as const
```

If the repository already has a reusable `ReferenceNameOverlay` type, import/type the generated artifact against it where practical without creating circular build/runtime dependencies.

Do not introduce FormIDs as runtime keys where stable app IDs already exist.

---

# Provenance-kind to runtime-kind mapping

Use:

```text
biome         -> biome
body          -> body
flora         -> species
fauna         -> species
official-term -> official-term
product       -> product
resource      -> resource
system        -> system
```

The flora/fauna merge must remain deterministic and collision-free.

Fail if two provenance entities normalize to the same runtime `(kind, id)` key unexpectedly.

---

# Expected generated entity counts

The generated Japanese map should contain:

```text
biome          428
body         1,776
species      1,121
official-term    5
product          30
resource         78
system          123
-------------------
total          3,561
```

These are current reviewed closure invariants.

Use them in generation/verification gates, not in runtime feature code.

---

# Direct/template materialization

For provenance rows with:

```text
DisplayNameSourceKind = direct
or
DisplayNameSourceKind = template
```

resolve Japanese text from the exact qualified identity:

```text
NameSourcePlugin
NameStringTable
NameStringID
```

against the manifested Japanese tables.

Expected result:

```text
one complete Japanese string per entity
```

Do not reverse-match English text.

Do not borrow the same numeric ID from another plugin.

Do not insert English fallback into the generated Japanese map.

Missing Japanese qualified IDs must fail generation.

---

# Composed fauna materialization

For:

```text
DisplayNameSourceKind = composed
```

group rows by fauna entity.

Established semantic slots:

```text
0 = prefix
1 = species/body
2 = diet
```

Rules:

1. slot 1 is required;
2. slots 0 and 2 are optional;
3. sort by `ComponentOrder`;
4. resolve each component through its own qualified Japanese string identity;
5. join non-empty component values with exactly one ASCII space:
   ```text
   U+0020
   ```
6. write the final precomposed Japanese name under:
   ```text
   species[EntityId]
   ```

Do not ship Bethesda INNR/CCT composition rules into the browser.

Do not make runtime code assemble the name.

---

# Separator assertion

Add a focused generator/unit assertion that composed Japanese fauna use exactly:

```text
U+0020
```

between non-empty components.

Retain the known later visual-hardening item:

```text
direct Japanese runtime / Creation Kit confirmation
of separator fidelity
```

That check belongs to later Japanese UX hardening and should not block this generator unless contradictory evidence appears.

---

# Official-term entries

Materialize the five existing provenance-backed official terms into:

```text
'official-term'
```

using their stable namespaced IDs, such as:

```text
skill.outpost-management
```

Do not yet change runtime skill-label consumers.

That belongs to the next integration slice.

---

# Resource coverage

The organic-resource provenance addendum has closed the previous gap.

Generated resource entries should now be:

```text
78 provenance-backed resources
```

This includes:

```text
76 surfaced runtime resources
+ aqueous-hematite
+ caelumite
```

The two source-only resources should remain in the generated authoritative map because generation follows complete provenance, not current UI reachability.

Do not prune them.

---

# Reproducibility sidecar

Generate a committed non-text-bearing sidecar:

```text
reference-source/localized-reference-names-manifest.json
```

It should contain enough information to prove what produced the generated TS module.

Include at least:

```text
schemaVersion
locale
gameVersion
provenanceSha256
provenanceManifestSha256 or stable identity
authoritativePlugins
Japanese table hashes/identities
entity count
per-kind counts
provenance row count
composition policy
separator policy
generatedModuleSha256
generator/tool version
```

Avoid machine-specific absolute paths.

Do not include Bethesda string table contents.

---

# Build command

Add a dedicated downstream build command.

Preferred:

```text
npm run localization:reference-names:build
```

The command should conceptually perform:

```text
validate Parcel C provenance/manifest
validate local Japanese table inputs
materialize direct/template names
materialize composed names
normalize runtime kinds
validate complete key coverage
write/verify generated TS
write/verify sidecar
print summary
```

Keep the dependency direction clear:

```text
Parcel C provenance
-> Japanese reference-name generator
-> committed runtime artifact
```

Do not fold this into the provenance builder itself unless the repository already has a clean orchestration reason.

---

# Verify vs write behavior

Follow the C8 pattern where practical.

Recommended modes:

```text
npm run localization:reference-names:build
```

Default:

- generate in memory/temp;
- compare with committed TS and sidecar;
- fail on drift;
- do not overwrite tracked artifacts.

Explicit acceptance mode:

```text
npm run localization:reference-names:build -- --write
```

Only this mode should update committed generated outputs.

After write mode, rerun normal mode and require zero drift.

---

# Repository-only verification

Ordinary CI/build must not require Starfield installation or extracted official tables.

Add repository-only verification of committed generated artifacts.

It should verify at least:

- generated TS imports successfully;
- exactly 3,561 keys total;
- exact per-kind counts;
- no duplicate runtime keys;
- no empty strings;
- no unknown kinds;
- all provenance entities map to generated runtime keys after deterministic kind normalization;
- no generated extra keys beyond provenance;
- sidecar provenance hash matches committed provenance;
- sidecar generated-module hash matches the committed TS bytes;
- resource reconciliation remains:
  ```text
  78 provenance resources
  76 surfaced runtime resources
  2 source-only excluded resources
  ```

Do not require Bethesda files for these repository-only checks.

---

# Installed-game generation gates

When the local official Japanese tables are available, require:

```text
all 4,818 qualified Japanese IDs/components resolve
all 3,561 entities materialize exactly once
0 empty Japanese values
0 U+FFFD decoder replacement characters
0 duplicate normalized runtime keys
0 unsupported provenance source kinds
0 composition-shape errors
0 unmanifested provider/table lookups
```

All Japanese values must come from the official manifested tables.

No machine translation.

No manual edits.

---

# Representative golden cases

Add focused tests/fixtures for at least:

```text
resource:aluminium
resource:x-tech
resource:adhesive
resource:gastronomic-delight
product:adaptive-frame
system:119226
body:01000801
body:0005E364
biome:01012244
species:01039BE3
species:00170A43
species:0008D0D8
species:000065E6
official-term:skill.outpost-management
```

Expected examples include:

```text
resource:aluminium                       アルミニウム
resource:x-tech                          X-テック
resource:gastronomic-delight             美食の喜び
product:adaptive-frame                   順応型フレーム
body:01000801                            ヴァルーン・カイ
body:0005E364                            ムフリドIV
biome:01012244                           岩石砂漠
species:01039BE3                         ヘイルポッド
species:0008D0D8                         グリロバハンター
species:000065E6                         遊牧の グロウバック スカベンジャー
official-term:skill.outpost-management   拠点管理
```

Verify values against actual generator output rather than copying these blindly if the committed provenance/table data differs.

---

# Determinism

Repeated runs with identical provenance and identical Japanese table inputs must produce byte-identical:

```text
src/localization/generated/ja-JP-reference-names.ts
reference-source/localized-reference-names-manifest.json
```

Stable sort order should be:

1. fixed runtime kind order;
2. stable ID lexical order within kind.

Do not emit nondeterministic timestamps into the generated TS.

If a timestamp is needed in the sidecar, ensure it does not participate in committed-content drift or omit it from committed output.

---

# Drift reporting

When default verify mode finds changes, report useful semantic categories.

At minimum distinguish:

```text
added key
removed key
changed Japanese value
changed kind mapping
changed generated hash
changed upstream provenance hash
changed Japanese input manifest/table identity
```

Do not reduce everything to a generic file mismatch.

---

# Generated artifact ownership

The generated Japanese module is project-owned derived data.

It should be:

- committed;
- reviewable;
- deterministic;
- regenerated from official Bethesda localization through the provenance contract;
- never manually edited.

Do not commit:

- BA2 archives;
- ESM excerpts;
- full Bethesda string tables;
- arbitrary table dumps.

---

# Documentation

Update durable localization documentation with:

- generator purpose;
- exact input/output contract;
- build command;
- verify/write behavior;
- local Japanese table prerequisite;
- repository-only verification behavior;
- composed-fauna precomposition rule;
- current entity counts;
- future-language reuse pattern.

Avoid roadmap-only wording in durable documentation where a functional name is clearer.

For example prefer:

```text
Official reference-name overlay generation
```

over:

```text
D1
```

in long-lived architecture docs.

---

# Future-language reuse

Design the generator so Japanese is the first locale instance, not a one-off architecture dead end.

It is acceptable for the current command/output to be specifically Japanese.

However, internal helper boundaries should make a later locale conceptually:

```text
same provenance
+ locale code
+ locale encoding
+ official locale string tables
-> generated locale reference-name overlay
```

Do not prematurely build a full multilingual framework if not needed.

But do not hard-wire Japanese assumptions into provenance identity or runtime-key normalization.

Locale-specific assumptions that are acceptable:

```text
locale = ja-JP
encoding = UTF-8
composed separator policy currently audited as U+0020
```

Keep those explicit.

---

# No semantic terminology work in this slice

Do not address generic Bethesda terminology such as:

```text
Outpost
Cargo Link
X-Tech Power Core
Starfield
Biome
Planet
Star System
Inter-System
```

Those are semantic-message terminology concerns, not canonical reference entities.

A later terminology task should identify and preserve official qualified Bethesda string identities where possible for reuse across future locales.

Do not create fake reference entities for these terms here.

---

# No runtime integration in this slice

Do not yet:

- register `jaJPReferenceNames` in `referenceNames.ts`;
- add `official-term` to runtime lookup types;
- change character skill labels;
- modify validation presentation;
- modify history fallback behavior;
- change search;
- change sorting;
- change fonts/layout.

This slice ends with a verified generated artifact ready for runtime integration.

---

# Tests

Add focused tests for:

## Materialization

- direct row -> one Japanese string;
- template row -> one Japanese string;
- composed rows -> one precomposed Japanese string;
- required species component;
- exact `U+0020` joining;
- qualified plugin/table/string lookup;
- missing Japanese ID fails.

## Kind normalization

- flora -> species;
- fauna -> species;
- all other kinds preserved;
- collisions fail.

## Coverage

- 3,561 total generated entities;
- per-kind counts exactly match closure;
- all provenance entities represented;
- no extras.

## Resource closure

- 78 generated resource keys;
- all 76 runtime resources present;
- only `aqueous-hematite` and `caelumite` are provenance-only.

## Reproducibility

- repeated generation is byte-identical;
- sidecar hashes match;
- repository-only verifier detects tampering.

## Drift

- changed Japanese value reports value drift;
- changed provenance hash reports upstream drift;
- added/removed keys are classified.

---

# Verification commands

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:build
npm run build
npm run lint
git diff --check
```

For first acceptance:

```text
npm run localization:reference-names:build -- --write
npm run localization:reference-names:build
```

Final normal build must report zero drift.

---

# Acceptance criteria

This implementation slice is complete when:

1. a dedicated Japanese official-reference-name generator exists;
2. generation consumes committed Parcel C provenance rather than rediscovering records;
3. Japanese text is resolved only through qualified manifested official string identities;
4. all 3,561 provenance entities materialize exactly once;
5. output kind counts are:
   ```text
   428 biome
   1,776 body
   1,121 species
   5 official-term
   30 product
   78 resource
   123 system
   ```
6. all 4,818 Japanese qualified IDs/components resolve;
7. direct/template entities materialize correctly;
8. composed fauna are precomposed at generation time;
9. composed separator is exactly `U+0020`;
10. no runtime code understands INNR/CCT internals;
11. generated output is committed as:
    ```text
    src/localization/generated/ja-JP-reference-names.ts
    ```
12. reproducibility sidecar is committed;
13. normal verify mode detects drift without overwriting;
14. explicit `--write` mode updates generated artifacts;
15. rerunning verify after write reports zero drift;
16. ordinary CI/build does not require installed Starfield files;
17. generated artifact and sidecar are deterministic;
18. no semantic-message terminology work is mixed into this slice;
19. no runtime lookup integration is performed yet;
20. no UI/persistence/history/schema changes occur;
21. no roadmap-only identifiers are introduced into durable implementation names;
22. all requested verification commands pass;
23. no commit or push is performed.

---

# Final Codex report

Report:

- files changed/added;
- generator/module names;
- build command and modes;
- exact generated per-kind counts;
- total generated entity count;
- Japanese qualified-ID resolution count;
- composed-fauna materialization behavior;
- sidecar contents/location;
- deterministic rebuild result;
- repository-only verification behavior;
- drift reporting behavior;
- resource reconciliation;
- representative generated values;
- test/build/lint results;
- confirmation that no runtime integration or semantic terminology work was performed;
- confirmation that no transient roadmap labels were introduced into durable code names.

Do not proceed to runtime integration unless separately instructed.
