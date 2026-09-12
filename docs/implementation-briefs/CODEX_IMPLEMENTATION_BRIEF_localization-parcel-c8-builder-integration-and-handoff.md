# CODEX IMPLEMENTATION BRIEF — Localization Parcel C8: Reproducible Builder Integration, Coverage Gates, and Parcel D Handoff

## Purpose

Implement **Parcel C8**, the final integration/closure step for the localization provenance pipeline.

C1–C7 have already established and implemented:

- narrow Starfield plugin parsing;
- manifest-backed localization input intake;
- direct-name provenance;
- systems and body provenance;
- flora/fauna direct and template provenance;
- composed-fauna component provenance;
- official-master provider-chain hardening.

C8 should now make those pieces operate as **one coherent, reproducible, auditable build pipeline**.

C8 is not a new localization-discovery parcel.

It should not discover new naming mechanisms unless an existing integration path reveals a concrete contradiction.

Do not commit or push.

---

# Core objective

C8 should establish a single authoritative local regeneration workflow that:

```text
canonical tracker reference data
+
explicit authoritative Bethesda plugin set
+
manifested installed-game plugin/archive/string-table inputs
+
C1-C7 provenance logic
=
validated normalized provenance outputs
+
coverage report
+
drift report
+
Parcel D handoff-ready data
```

The normal project test/build environment must continue to work without installed Starfield files.

The full provenance rebuild remains an explicit local/developer workflow.

---

# Authoritative source universe

The current authoritative Bethesda source set is exactly:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

These are the only current sources from which the tracker intentionally accepts canonical:

- star systems;
- bodies/orbitals;
- biomes;
- flora;
- fauna;
- skills/official terms;
- inorganic resources;
- manufactured products.

Do not include arbitrary installed plugins merely because they exist.

Do not include Creations or third-party mods.

---

# Historical/config compatibility input

`SFBGS050.esm` may still appear in local config/tooling from previous work.

It is **not** part of the authoritative tracker source universe.

C8 should make this distinction explicit.

Expected behavior:

```text
authoritative coverage/provider selection:
  Starfield.esm
  ShatteredSpace.esm
  SFBGS00D.esm

optional/historical config compatibility:
  SFBGS050.esm
```

If existing tooling can tolerate its presence, keep compatibility.

However, a successful authoritative C8 rebuild should not require `SFBGS050.esm` merely because an older config mentions it, unless another currently supported build step genuinely depends on it.

If that dependency still exists, report it clearly and minimize it.

Do not silently promote `SFBGS050.esm` into authoritative coverage.

---

# Future Bethesda DLC policy

C8 should make the source set **explicitly extensible but allowlisted**.

A future Bethesda DLC ESM should enter tracker scope only after an intentional repository change.

The expected onboarding model is:

```text
1. add new official DLC plugin to authoritative allowlist;
2. declare/manifest its master relationships;
3. declare/manifest localization archive/table inputs;
4. add or extend canonical tracker reference data sourced from that DLC;
5. run the existing provenance pipeline;
6. add narrow new extraction/provider logic only if the DLC introduces a genuinely new record/naming shape;
7. review drift and commit regenerated project-owned outputs.
```

Do not auto-adopt every installed ESM.

Do not design for arbitrary user-selected load orders.

---

# Game patch/update policy

A Starfield patch or DLC update that changes manifested inputs must be treated as a **review event**.

C8 should fail closed when authoritative input drift is detected.

Examples:

```text
plugin hash changed
archive hash changed
string-table member hash changed
canonical population count changed
provider chain changed
field path changed
localized string ID changed
canonical English verification changed
unresolved population appears
```

The pipeline should report the drift, not silently refresh committed provenance.

The user/developer can then inspect and explicitly regenerate/accept the updated outputs.

---

# Drift categories

Where practical, classify drift into useful categories.

At minimum distinguish:

## Input drift

Examples:

```text
plugin hash changed
archive hash changed
string-table hash changed
load/master metadata changed
```

## Editorial localization drift

Examples:

```text
same entity
same provider
same field path
different localized string ID and/or text
```

This may indicate Bethesda editorial correction/renaming.

## Structural provenance drift

Examples:

```text
provider changed
record identity changed
field path changed
population changed
new unresolved entity
composition shape changed
record/master relationship changed
```

Structural drift should be treated as higher review risk.

Do not attempt to infer developer intent.

Just report the observed category and before/after facts.

---

# Existing canonical outputs

C8 should integrate and validate the existing project-owned artifacts.

At minimum:

```text
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-unresolved.csv
reference-source/localized-name-normalizations.csv
```

Also include relevant generated/supporting artifacts already introduced by C5/C6 where they are part of the durable regeneration contract, such as:

```text
reference-source/localized-name-provenance-c5-fauna-lineage.csv
reference-source/localized-name-provenance-c6-fauna.csv
reference-source/localized-name-c6-fauna-ja-preview.csv
```

Do not create redundant parallel copies unless needed for a clear integration role.

---

# Current expected closure state

After C7, the current authoritative build should reconcile to:

```text
resolved entities: 3,539
provenance rows:   4,796
unresolved rows:       0
```

Provider totals should be:

```text
Starfield.esm       4,759 provenance rows/components
ShatteredSpace.esm     35
SFBGS00D.esm            2
```

These are current audited invariants for the installed version.

Use them as explicit regression/closure checks, not as permanent runtime constants.

A future accepted Bethesda update may legitimately change them after review.

---

# Population coverage gate

C8 must prove that every canonical tracker-localizable entity is accounted for.

Coverage should be evaluated by **stable tracker identity**, not by scanning ESMs for arbitrary records.

Expected logic:

```text
canonical target population
=
resources
+ products
+ biomes
+ systems
+ bodies
+ flora
+ fauna
+ official terms/skills
```

Each canonical entity must resolve to exactly one of:

```text
resolved provenance
explicit unresolved provenance
explicit excluded/not-localized policy
```

For the current build:

```text
resolved = all
unresolved = 0
```

Do not silently omit canonical entities.

---

# Row-shape validation

C8 should validate provenance-row shape according to `DisplayNameSourceKind`.

## Direct

Expected:

```text
1 row per entity
ComponentOrder = 0
ComponentRole = complete
```

## Template-derived

Expected:

```text
1 row per entity
ComponentOrder = 0
ComponentRole = complete
```

with the actual final name-bearing provider record.

## Composed

Expected:

```text
1–3 rows per fauna
semantic component slots preserved
0 = prefix
1 = species
2 = diet
```

with absent roles omitted rather than renumbered.

Do not treat provenance-row count as equivalent to entity count.

---

# English verification gate

English remains the canonical verification language for provenance correctness.

For every resolved direct/template row:

```text
qualified provider/table/string ID
-> official English value
== expected CanonicalEnglish
```

For composed fauna:

```text
ordered component rows
-> official English component values
-> fixed CCT assembly
-> final composed English name
== canonical tracker English
```

No fuzzy matching.

No reverse matching.

No fallback to another plugin/table with the same string ID.

No silent normalization except approved entity-scoped normalization policy.

---

# Approved normalization policy

Continue using:

```text
reference-source/localized-name-normalizations.csv
```

Normalizations must remain:

- entity-scoped;
- explicit;
- audited;
- deterministic;
- reviewable.

Do not add global case/underscore/punctuation cleanup rules.

C8 should validate that every used normalization corresponds to a current canonical/provenance entity and that stale/unused normalizations are reported.

---

# Provider-chain gate

C7 provider-chain resolution must become part of the normal provenance build.

C8 should verify:

- provider chains use logical identity;
- authoritative plugins only participate in selection;
- exact field ownership determines `NameSourcePlugin`;
- inheritance walks backward only when the winner omits the field;
- Muphrid IV remains the current one live nontrivial chain;
- cross-plugin string-table lookup remains qualified.

Do not leave provider-chain correctness as an optional audit-only path.

---

# Composed-fauna gate

C6 should be treated as ordinary integrated provenance.

Expected current invariants:

```text
922 composed-fauna entities
2,179 component rows

shapes:
  335 prefix + species + diet
  320 species + diet
  267 prefix + species

unique selected components:
  8 prefixes
  198 species/body
  6 diets
  212 total
```

Required:

```text
922/922 exact English reconstructions
0 unresolved
0 unsupported shapes
```

C8 should not re-audit the naming model.

Just enforce the established model.

---

# Japanese verification boundary

C8 should verify that Japanese localization inputs needed for Parcel D are available and decodable.

At minimum verify:

- all qualified direct-name IDs required by resolved provenance are present in Japanese tables;
- all C6 component IDs are present;
- composed fauna reconstruction succeeds through the same component identities;
- locale encoding policy remains correct.

Do **not** wire Japanese names into runtime UI yet.

Parcel D owns production runtime overlay generation/integration.

---

# Japanese C6 separator hardening

Retain the known hardening item:

```text
direct Japanese runtime / Creation Kit confirmation
of exact on-screen U+0020 separator fidelity
```

Do not block provenance closure on this if existing policy still treats it as a later display-hardening check.

C8 should surface it in the final handoff/report as an explicit remaining runtime verification item.

---

# Input manifest

C8 should produce or consolidate a machine-readable regeneration manifest containing at least:

```text
game version
tool/build version
authoritative plugin list
plugin file paths or normalized local references
plugin hashes
TES4 master relationships
module class
localization archive identities
archive hashes
selected localization members
member/table hashes
locales included
table types
encoding policy
generation timestamp
provenance generator version/commit if available
```

Do not include Bethesda file contents.

The manifest should be sufficient to answer:

> Exactly which installed-game bytes produced this committed provenance?

---

# Manifest stability

Avoid noisy nondeterminism.

If a timestamp is included:

- keep it in a dedicated manifest/report field;
- do not let it cause unrelated committed-output churn unless the manifest is intentionally regenerated.

Stable content should sort deterministically.

Use normalized path handling where practical so developer-machine absolute paths do not make committed outputs non-reproducible.

If local absolute paths are needed for execution, keep them in ignored local config rather than committed provenance.

---

# Builder command

Provide one documented top-level local command for full provenance regeneration.

Prefer an existing npm script if the architecture already has a natural home.

Conceptually:

```text
npm run localization:provenance:build
```

or equivalent.

The command should orchestrate, in correct order:

```text
input validation
manifest verification
canonical population target building
direct provenance generation
system/body provenance generation
organic provenance generation
composed-fauna provenance generation
provider-chain resolution
normalization application
English verification
Japanese availability verification
coverage reconciliation
output generation
drift/summary report
```

Do not require the user to manually remember a sequence of 8–12 scripts.

---

# Separation of local full rebuild vs ordinary CI

Ordinary project commands must remain usable without installed game files.

Expected distinction:

## Repository-only validation

Runs in CI / ordinary development:

```text
npm test
npm run reference:test
npm run localization:provenance:test
npm run localization:provenance:verify
npm run build
npm run lint
```

These validate committed project-owned artifacts and synthetic fixtures.

## Installed-game regeneration

Explicit developer/local command:

```text
requires Starfield installation and manifested inputs
regenerates provenance from authoritative Bethesda files
compares against committed outputs
reports drift
```

Do not make normal app builds depend on local Starfield installation.

---

# Missing-input behavior

Installed-game regeneration should fail with actionable errors when required inputs are missing.

Examples:

```text
AUTHORITATIVE_PLUGIN_MISSING
LOCALIZATION_ARCHIVE_MISSING
LOCALIZATION_TABLE_MISSING
INPUT_HASH_MISMATCH
UNSUPPORTED_LOCALE_ENCODING
```

Error output should identify:

- expected plugin/archive/table;
- configured/local path source;
- why the input is required;
- whether this is authoritative or optional/historical.

Do not silently skip missing authoritative inputs.

---

# Optional/historical input behavior

For inputs such as current `SFBGS050.esm` compatibility configuration:

- absence should not fail authoritative C8 coverage unless genuinely required by another current supported step;
- presence should not affect authoritative provider selection;
- report its status separately if useful.

C8 should make the difference between:

```text
required authoritative input
optional compatibility input
```

machine-readable if practical.

---

# Drift comparison

Add a deterministic comparison mode between:

```text
freshly generated provenance
and
committed provenance
```

The comparison should identify at least:

```text
added entity
removed entity
added provenance component
removed provenance component
provider changed
record changed
field path changed
string table changed
string ID changed
CanonicalEnglish changed
normalization changed
unresolved status changed
```

For composed names, compare rows by stable:

```text
EntityKind
EntityId
ComponentOrder
```

Do not reduce the comparison to whole-file byte equality only.

---

# Human-readable build summary

At the end of a successful installed-game regeneration, print a concise summary.

At minimum:

```text
game/input version
authoritative plugins
canonical entity count
resolved entity count
provenance row count
unresolved count
provider counts
composition counts
normalization count
English mismatch count
Japanese missing-ID count
drift count
output files changed/not changed
```

If drift exists, summarize categories.

---

# Machine-readable build report

Also emit a machine-readable report under an ignored local-work path or another clearly appropriate location.

Suggested:

```text
.local-work/localization/provenance/build-report.json
```

Include:

```text
input manifest identity
coverage counts
provider counts
entity-kind counts
drift details
verification failures
normalization usage
Japanese availability statistics
```

Do not commit Bethesda text dumps.

---

# Current no-drift acceptance case

Against the same installed game/input version used for C7, C8 full regeneration should ideally produce:

```text
0 provenance drift
0 unresolved
0 English mismatch
0 Japanese missing IDs
```

and committed generated artifacts should remain byte-for-byte stable after deterministic regeneration.

If C8 integration itself legitimately changes generated formatting/order, document and review that one-time change.

---

# New-DLC extensibility requirement

The builder should not hard-code assumptions that make a future official DLC require a complete rewrite.

At minimum:

- authoritative plugins should come from one explicit project-owned policy/config;
- plugin master relationships should be read from TES4 headers;
- localization archive/member mapping should be manifest-driven;
- canonical populations should remain source-data driven;
- provider selection should naturally include an intentionally added authoritative DLC;
- unsupported/new record shapes should fail clearly.

Do not pre-build generic arbitrary-mod support.

The goal is:

```text
future Bethesda DLC
=> explicit allowlist/config/source-data extension
=> narrow additions if needed
```

not:

```text
future Bethesda DLC
=> redesign localization architecture
```

---

# Patch review workflow

Document a recommended update workflow:

```text
1. game updates;
2. local hashes no longer match committed/expected manifest;
3. run explicit refresh/audit mode;
4. inspect input and provenance drift;
5. classify editorial vs structural changes;
6. update canonical source data/provenance logic only if required;
7. regenerate;
8. run repository verification;
9. commit reviewed project-owned outputs.
```

Do not auto-overwrite committed provenance merely because the installed game updated.

---

# Parcel D handoff contract

C8 should leave Parcel C with a clear, final contract for Parcel D.

Parcel D should receive:

```text
validated localized-name-provenance.csv
0-or-explicit localized-name-provenance-unresolved.csv
normalization policy
input manifest
qualified direct-name identities
ordered composed-name component identities
canonical English verification text
Japanese table availability/preview verification
coverage/build report
```

Parcel D should not need to rediscover:

- FormIDs;
- field paths;
- provider ownership;
- composed-fauna naming rules;
- canonical entity identity.

---

# Parcel D non-goals for C8

Do not:

- generate final production runtime `ja-JP` overlay integration;
- replace runtime English reference names;
- migrate React consumers;
- modify search behavior;
- add locale UI;
- alter persistence or schemas.

C8 prepares the handoff.

Parcel D consumes it.

---

# Documentation

Update durable docs so a future developer can reproduce Parcel C without reconstructing our conversation history.

At minimum document:

## Architecture

- authoritative source universe;
- provenance pipeline stages;
- provider-chain integration;
- composed-name integration;
- coverage model;
- installed-game vs repository-only validation;
- future DLC policy;
- patch-review policy.

## Localization regeneration guide

Document exact steps:

```text
prerequisites
local config
required game files
authoritative vs optional inputs
full regeneration command
expected outputs
drift handling
review workflow
verification commands
```

## Parcel D handoff

Document exactly which generated artifacts Parcel D should consume.

---

# Third-party/provenance documentation

If C8 does not introduce new third-party code/dependencies, do not add gratuitous entries.

If any external implementation is copied/adapted during C8:

- update `docs/THIRD-PARTY-REFERENCES.md`;
- distinguish studied/reference-only from copied/adapted;
- record exact module/function and license implications.

Do not introduce a general parser dependency unless a concrete blocker appears.

---

# Tests

Add focused tests for integration behavior.

At minimum cover:

## Coverage

- every canonical entity resolves or appears explicitly unresolved;
- duplicate canonical entity IDs fail;
- missing canonical population member fails;
- unexpected extra generated entity is reported.

## Determinism

- stable sort/order;
- repeated build with identical synthetic inputs produces identical outputs;
- machine-path differences do not alter committed output.

## Drift classification

Synthetic examples for:

```text
string ID change
provider change
field-path change
entity addition
entity removal
unresolved transition
```

## Input policy

- authoritative missing input fails;
- optional historical input may be absent;
- unallowlisted installed plugin is ignored.

## Future DLC policy

Synthetic allowlisted extra full-module plugin should be accepted by the policy/config path without requiring generic discovery.

Do not attempt full arbitrary-mod simulation.

## Provider integration

- C7 Muphrid behavior remains stable.

## Composed integration

- C6 component order/count reconstruction remains stable.

---

# Verification commands

Run at minimum:

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

Also run the single documented installed-game full regeneration command.

Run it twice if practical to prove deterministic no-drift output.

---

# Acceptance criteria

C8 is complete when:

1. C1–C7 are orchestrated through one documented provenance-build workflow;
2. authoritative source plugins are explicitly:
   ```text
   Starfield.esm
   ShatteredSpace.esm
   SFBGS00D.esm
   ```
3. Creations/mods/unallowlisted ESMs are ignored;
4. SFBGS050 is not authoritative and is not required unless a documented compatibility dependency remains;
5. coverage reconciles every canonical localizable tracker entity;
6. current build resolves 3,539 entities;
7. current build emits 4,796 provenance rows;
8. unresolved count is zero;
9. C7 provider-chain logic is integrated into normal generation;
10. C6 composed fauna is integrated as ordinary provenance;
11. English verification is exact and fail-closed;
12. Japanese qualified IDs/components are all available and decodable;
13. current installed-game regeneration produces no unexplained drift;
14. generated output ordering is deterministic;
15. machine-specific paths do not contaminate committed outputs;
16. an input manifest identifies exact game/plugin/archive/table bytes used;
17. game-input drift fails closed and produces actionable review output;
18. drift distinguishes at least input/editorial/structural categories where possible;
19. normal CI/app builds do not require installed Starfield files;
20. full local regeneration fails clearly on missing authoritative inputs;
21. future official DLCs can be added through explicit allowlist/manifest/source-data extension without redesigning the architecture;
22. patches do not silently rewrite committed provenance;
23. Parcel D receives a documented complete handoff;
24. no runtime/UI/persistence/schema localization integration is introduced;
25. no arbitrary Creation/mod/load-order support is introduced;
26. all verification commands pass;
27. no commit or push is performed.

---

# Final Codex report

Report:

- files changed/added;
- final authoritative input contract;
- whether SFBGS050 remains required anywhere;
- top-level full regeneration command;
- manifest format/location;
- coverage totals;
- provenance row totals;
- provider counts;
- composed-fauna totals;
- unresolved count;
- English verification status;
- Japanese availability status;
- drift classification/reporting behavior;
- deterministic rebuild result;
- future-DLC onboarding behavior;
- patch/update review behavior;
- Parcel D handoff artifacts;
- repository-only vs installed-game verification commands;
- test/build/lint results;
- confirmation that no runtime/UI/mod-support work was introduced.

Do not proceed to Parcel D implementation unless separately instructed.
