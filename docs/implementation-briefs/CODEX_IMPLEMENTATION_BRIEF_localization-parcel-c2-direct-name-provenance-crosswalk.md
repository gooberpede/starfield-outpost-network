# CODEX IMPLEMENTATION BRIEF — Localization Parcel C2: Direct-Name Provenance Crosswalk

## Purpose

Implement **Parcel C2**, the first production use of the C1 narrow ESM reader.

C2 should generate and validate canonical localized-name provenance for the **direct-name populations whose record/field routes are already understood**.

This parcel should produce the first real normalized Bethesda localization crosswalk used by later parcels.

C2 is still a build/reference-data task.

It must not generate Japanese runtime overlays or change UI behavior.

Do not commit or push.

---

# Source of truth

Use these durable references:

- `docs/audits/codex-localized-string-provenance-audit.md`
- C1 implementation and its parser/field-map/tests
- current canonical reference-source CSVs and existing reference build scripts

Important C1 assumptions now proven:

- read-only ESM traversal works;
- compressed records work;
- `XXXX` extended subrecords work;
- exact signature/FormID record lookup works for audited base records;
- semantic field selection is separate from binary parsing;
- raw localized IDs are recovered as uint32 values;
- field-map definitions own string-table type;
- local installed-game proof is opt-in and does not run in generic CI.

Do not redesign C1 unless a real blocker is found.

---

# Scope classification

**Medium cross-cutting data-pipeline task.**

Expected changes:

- canonical provenance generator;
- normalized `localized-name-provenance.csv`;
- unresolved/report artifacts;
- English verification path;
- field-map expansion for direct-name records only;
- focused tests;
- docs/reference-build updates.

Do not expand into runtime UI, Japanese overlay generation, generalized ESM parsing, or composed-fauna work.

---

# C2 target populations

Cover the following populations where direct name provenance is expected to be straightforward.

## 1. Inorganic resources

Canonical source:

```text
reference-source/inorganic-resource-dictionary.csv
```

Expected route:

```text
source plugin + IRES FormID
-> IRES top-level FULL
-> strings:<raw ID>
```

Include:

- all canonical inorganic resources represented by the source;
- X-Tech resource rows where plugin ownership differs from `Starfield.esm`.

Do not special-case by English name.

---

## 2. Manufactured products

Canonical source:

```text
reference-source/industrial-workbench.csv
```

Products are identified by canonical item FormID / plugin metadata already present in the source.

Expected route for direct-name products:

```text
item record
-> audited display-name field
-> strings:<raw ID>
```

Normalize the result to one provenance row per unique tracker product entity.

Do not repeat one provenance row for every recipe occurrence.

---

## 3. Direct-name recipe ingredients

Where ingredients correspond to already canonical tracker resource/product/organic entities and have a direct localized display field, resolve them through the same normalized entity provenance model.

Do not create redundant provenance simply because an ingredient appears in multiple recipes.

If an ingredient’s current canonical entity population is not yet covered by a safe direct route, classify it as unresolved rather than guessing.

---

## 4. Biomes

Canonical source:

```text
reference-source/biome-inorganic-resources.csv
reference-source/biome-organic-resources.csv
```

Expected route:

```text
BIOM FormID
-> top-level FULL
-> strings:<raw ID>
```

Deduplicate to one provenance row per stable biome entity.

Important:

- repeated English display names do not imply shared string identity;
- preserve each BIOM record’s own raw ID;
- do not collapse all `Rocky Desert` records to one localization key.

---

## 5. Official skill terms

Add the five proven game-native skill labels as `official-term` provenance entities:

```text
Special Projects
Outpost Management
Planetary Habitation
Research Methods
Outpost Engineering
```

Expected route:

```text
PERK
-> top-level skill-label FULL
-> strings:<raw ID>
```

Use stable tracker-owned IDs for the official-term crosswalk.

Do not hard-code English display text as identity.

Do not include tracker-authored explanatory prose.

---

# Deferred populations

C2 must not solve:

- star systems — C3;
- planetary bodies — C4;
- explicit/simple species — C5;
- composed fauna — C6;
- generalized override/master inheritance — C7;
- final coverage/gating across all populations — C8;
- Japanese overlay generation — D.

If C2 encounters one of these, emit an unresolved row with a reason code.

---

# Main output

Create:

```text
reference-source/localized-name-provenance.csv
```

This should be deterministic and generated from canonical sources plus local game data.

Recommended columns:

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

Use the audit’s conventions:

- one row for a direct complete name;
- `DisplayNameSourceKind = direct`;
- `ComponentOrder = 0`;
- `ComponentRole = complete`;
- plugin names preserved explicitly;
- string-table enum:
  - `strings`
  - `dlstrings`
  - `ilstrings`;
- `NameStringID`:
  - uppercase
  - eight hex digits
  - no `0x`.

For C2, all expected direct-name fields may resolve to `strings`, but do not encode that as a global rule outside the semantic field map.

---

# Entity identity

`EntityKind + EntityId` must use existing tracker/reference stable identity.

Do not create new runtime IDs.

Recommended `EntityKind` values in C2:

```text
resource
product
biome
official-term
```

If an ingredient maps to another existing kind, reuse the canonical kind rather than inventing `ingredient`.

---

# Provenance ownership

For C2, support the official source plugin explicitly.

At minimum preserve:

```text
RecordSourcePlugin
NameSourcePlugin
```

For direct records where the same plugin owns both, they will match.

Do not pretend full override inheritance is solved yet.

If an inspected record requires inherited-field ownership beyond C2’s implemented scope, emit unresolved:

```text
OVERRIDE_PROVIDER_UNRESOLVED
```

rather than silently assuming the winning plugin owns the localized field.

---

# X-Tech / SFBGS00D

C2 must include the X-Tech resource if it is part of the canonical resource population.

Known audit proof:

```text
SFBGS00D.esm
IRES:01033E3F
FULL
-> strings:00000FC7
```

Important:

- localization archive packaging is nonstandard;
- `SFBGS00D.esm` tables live in `SFBGS00D - Main.ba2`;
- do not derive archive association from a fixed `- Localization.ba2` naming convention.

For C2, it is acceptable to consume explicitly supplied extracted English string tables or a configured archive/table mapping.

Do not build general BA2 discovery here unless strictly required for English verification.

---

# English verification

C2 must add the first production provenance verification gate.

For every resolved row:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
-> official English text
```

Compare that text against `CanonicalEnglish`.

The verifier must never reverse-match English to select an ID.

The direction is always:

```text
record -> raw ID -> official English
```

not:

```text
English -> find plausible ID
```

---

# English string-table input strategy

Prefer the smallest implementation that keeps C2 reproducible.

Allowed options:

1. consume locally extracted `.strings` / `.dlstrings` / `.ilstrings` files;
2. reuse/adapt any already project-owned string-table decoder created during prior diagnostics;
3. add a tiny read-only string-table reader if needed.

Do not yet implement the full production BA2/archive extraction pipeline planned for Parcel D unless unavoidable.

The C2 command should accept explicit local table locations or a local-only input manifest.

Do not hard-code user-specific paths.

---

# Verification result classes

Exact match is the default success path.

Mismatches must be classified, not silently normalized.

At minimum support:

```text
WRONG_FIELD
WRONG_PLUGIN
WRONG_TABLE
MISSING_STRING_ID
TRACKER_NORMALIZATION
CANONICAL_SOURCE_ERROR
UNSUPPORTED_RECORD_SHAPE
OVERRIDE_PROVIDER_UNRESOLVED
MISSING_LOCALIZATION_INPUT
```

If the English resolver returns a different value from `CanonicalEnglish`, fail generation unless the mismatch is explicitly classified and approved by project-owned policy.

Do not auto-edit canonical English.

---

# Unresolved output

Create:

```text
reference-source/localized-name-provenance-unresolved.csv
```

Recommended columns:

```text
EntityKind
EntityId
RecordSourcePlugin
RecordFormID
RecordSignature
CanonicalEnglish
ReasonCode
Detail
```

Requirements:

- deterministic sort;
- no silent drops;
- every canonical C2 target is either:
  - resolved into `localized-name-provenance.csv`, or
  - present in unresolved with a reason.

Generation should report totals by population and reason.

---

# Reproducibility manifest

Extend the C1 manifest concept to record the C2 extraction inputs.

Include at minimum:

```text
gameVersion
toolVersion
generatedAt
declaredLoadOrder
plugins:
  - filename
  - size
  - sha256
localizationInputs:
  - plugin/base
  - table type
  - source filename
  - size
  - sha256
```

Do not commit user absolute paths.

If a durable manifest is committed, it should contain only stable filenames/hashes/version metadata.

---

# Canonical-source joins

Use existing canonical identities as the driver.

Do not enumerate the ESM and then “discover” arbitrary relevant records.

The intended direction is:

```text
canonical row
-> exact source plugin + FormID
-> C1 reader
-> exact semantic name field
-> raw ID
```

This keeps the tool a **sniper**, not a browser/gatherer.

Do not add generic record crawling/search APIs unless strictly required by a known canonical join.

---

# Field-map expansion

Extend the checked-in semantic field map only for the direct-name C2 populations.

Expected additions:

```text
PERK top-level skill-label FULL
```

and any direct-name item record signatures required by canonical products/ingredients if they differ from IRES.

For each added signature/path:

- document why it is the display-name field;
- add fail-closed tests;
- reject ambiguous multiple candidates.

Do not add broad “any FULL means name” behavior.

---

# Product/ingredient normalization

Before generating duplicate rows, build a unique entity target set from the recipe source.

Expected process:

```text
industrial-workbench.csv
-> unique output/ingredient canonical entities
-> provenance extraction once per entity
-> recipe rows continue to reference stable entity IDs
```

Do not put localization metadata back into every recipe row.

---

# Skills / official-term IDs

Define stable project-owned `EntityId` values for the five skill terms.

Recommended style:

```text
skill.special-projects
skill.outpost-management
skill.planetary-habitation
skill.research-methods
skill.outpost-engineering
```

or align with an existing official-term naming convention if the repo already has one.

Do not use localized text as an ID.

---

# Determinism

Generated output must be stable across runs with identical inputs.

Sort provenance rows by:

```text
EntityKind
EntityId
ComponentOrder
```

Sort unresolved rows by:

```text
EntityKind
EntityId
ReasonCode
```

No timestamps should appear inside the CSVs.

Timestamps belong only in the manifest/report.

---

# Tests

Add focused tests for:

## Provenance row generation

- direct resource row;
- direct biome row;
- direct product row;
- skill official-term row;
- X-Tech/plugin-qualified row.

## Deduplication

- repeated recipe occurrences produce one entity provenance row;
- repeated BIOM occurrence rows produce one BIOM provenance row.

## Rocky Desert identity rule

Use synthetic/project-authored fixtures to prove that two different BIOM records with the same English text may legitimately produce different `NameStringID` values.

Do not commit Bethesda corpus data.

## English verification

- exact match passes;
- missing string ID fails/classifies;
- wrong table fails/classifies;
- mismatched English fails/classifies;
- approved tracker-normalization exception is explicit.

## Unresolved coverage

- every input target ends resolved or unresolved;
- no silent omission.

---

# Local installed-game verification

When local Starfield inputs are available, run C2 against the actual audited game data.

Report counts for:

```text
resources: resolved / unresolved
products: resolved / unresolved
biomes: resolved / unresolved
official terms: resolved / unresolved
```

Also report:

- number of unique recipe entities considered;
- number of duplicate recipe occurrences collapsed;
- number of repeated English names with distinct string IDs;
- plugins contributing provenance;
- all English-verification mismatches.

Do not accept unexplained mismatches.

---

# Expected X-Tech verification

At minimum verify:

```text
SFBGS00D.esm
IRES:01033E3F
strings:00000FC7
```

If the official English/Japanese table input for this plugin is not yet locally available to the C2 verifier, it may remain unresolved with a precise reason such as:

```text
MISSING_LOCALIZATION_INPUT
```

Do not drop it or substitute a text match.

---

# Build commands

Add or extend clear npm scripts, for example:

```text
npm run localization:provenance:build
npm run localization:provenance:verify
```

Use repository naming conventions where appropriate.

Keep the installed-game/local-input path opt-in.

Do not make ordinary app build depend on locally installed Starfield files.

---

# Relationship to existing reference build

Integrate lightly with the existing reference-data workflow.

The normal repository build should:

- validate committed provenance CSV schema/content;
- not require local Bethesda binaries.

The local regeneration command may require:

- ESM files;
- extracted English string tables;
- local manifest/config.

Do not make `npm run build` parse game files.

---

# Documentation

Update durable docs.

At minimum:

## `docs/ARCHITECTURE.md`

Document:

- canonical source -> exact record -> raw localized ID -> English verification;
- normalized provenance crosswalk;
- unresolved report;
- runtime remains untouched until Parcel D.

## reference-data/build documentation

Document:

- required local inputs;
- regeneration commands;
- explicit plugin/table mapping;
- deterministic outputs;
- unresolved policy;
- no Bethesda binary redistribution.

## `docs/THIRD-PARTY-REFERENCES.md`

Only update if new external code/tooling is actually adopted/copied/adapted.

Do not add parcel-by-parcel OpenAI/Codex implementation notes.

---

# No runtime changes

C2 must not modify:

- `src/localization/reference-names/...`
- React components;
- search behavior;
- locale selector;
- persistence;
- Undo/Redo;
- import/export schema;
- player/network JSON;
- Japanese tracker catalogue.

Parcel D will consume C2 provenance later.

---

# No Japanese generation yet

C2 may inspect English official string tables for verification.

It must not:

- resolve Japanese values into runtime data;
- generate `ja-JP` reference-name overlays;
- migrate display consumers.

If a Japanese value is observed during diagnostics, do not make it an output contract.

---

# Verification commands

Run at minimum:

```text
npm test
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run build
npm run lint
git diff --check
```

Also run new C2 local generation/verification commands against the installed game inputs when available.

Report exact counts.

---

# Expected diff profile

Expected files may include:

```text
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-unresolved.csv
scripts/localization/...
tests/...
package.json
README.md or reference-build docs
docs/ARCHITECTURE.md
```

No production UI/runtime source changes should be necessary.

---

# Acceptance criteria

C2 is complete when:

1. Canonical C2 target entities are enumerated from existing reference sources.
2. The C1 reader is used to recover raw localized IDs by exact plugin/FormID/semantic field.
3. No English reverse lookup is used to choose provenance.
4. A normalized `localized-name-provenance.csv` is generated.
5. One direct entity produces one provenance row.
6. Recipe occurrences do not duplicate provenance.
7. BIOM occurrences do not duplicate provenance.
8. Repeated English biome names remain distinct where their BIOM/string IDs differ.
9. The five skill terms are represented as `official-term` provenance entities.
10. X-Tech is explicitly represented or explicitly unresolved with a reason.
11. Qualified identity preserves `NameSourcePlugin + NameStringTable + NameStringID`.
12. English official string resolution verifies every resolved row.
13. Mismatches are classified, not silently normalized.
14. Every C2 target is either resolved or present in the unresolved CSV.
15. Output is deterministic.
16. Reproducibility metadata records plugin/table input hashes.
17. Ordinary CI/build does not require installed Starfield files.
18. No Bethesda binary/string-table corpus is committed.
19. No Japanese overlay/runtime localization work is performed.
20. No UI, persistence, schema, or gameplay behavior changes are introduced.
21. Standard tests/build/lint/reference checks pass.
22. No commit or push is performed.

---

# Final report

Report:

- files changed/added;
- final row counts by `EntityKind`;
- unresolved counts and reason codes;
- plugins represented;
- unique recipe entities vs repeated recipe occurrences;
- number of BIOM entities and repeated English labels;
- five skill provenance results;
- X-Tech result;
- English verification result;
- any canonical-source mismatches discovered;
- any field-map additions;
- local input hashes/manifest summary;
- test/build/lint results;
- deferred work for C3–C8 and D;
- confirmation that no runtime/Japanese overlay/UI/persistence/schema changes occurred.

Do not proceed to C3 unless separately instructed.
