# CODEX IMPLEMENTATION BRIEF — Localization Parcel C7: Official-Master Provider-Chain Hardening

## Purpose

Implement the **focused C7 hardening work** identified by:

```text
docs/audits/codex-localization-c7-official-master-hardening-audit.md
```

C7 is intentionally narrow.

The tracker’s authoritative localization source universe is exactly:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Do **not** generalize this work into arbitrary Creation/mod/load-order support.

The audit found exactly one live provenance defect:

```text
body:0005E364 — Muphrid IV
```

Canonical/origin identity:

```text
Starfield.esm PNDT object 05E364
```

Provider chain:

```text
Starfield.esm 0005E364
-> SFBGS00D.esm 0005E364
```

Winning provider:

```text
SFBGS00D.esm
```

Selected field:

```text
baseFormComponents.TESFullName_Component.fullName.FULL
```

The winning override explicitly serializes that field.

Therefore correct name provenance is:

```text
RecordSourcePlugin = Starfield.esm
RecordFormID        = 0005E364
NameSourcePlugin    = SFBGS00D.esm
NameStringTable     = strings
NameStringID        = 0000A682
```

The currently committed row incorrectly attributes the name provider to:

```text
Starfield.esm
```

even though both tables currently resolve the same ID to the same English/Japanese text.

C7 should fix the provider-selection architecture and regenerate the crosswalk so this row becomes correct.

Do not commit or push.

---

# Source of truth

Use:

```text
docs/audits/codex-localization-c7-official-master-hardening-audit.md
reference-source/localized-name-provenance.csv
reference-source/localized-name-provenance-unresolved.csv
```

and the committed C1–C6 localization/provenance tooling.

The audit is authoritative for:

- supported plugin boundary;
- actual module classes;
- provider-chain counts;
- Muphrid IV behavior;
- absence of inherited live fields;
- FormID normalization requirements;
- SFBGS050 compatibility boundary.

If implementation evidence contradicts the audit, stop and report the contradiction rather than silently expanding scope.

---

# Scope classification

**Small-to-medium focused hardening task.**

Expected work:

- add narrow TES4 master-list parsing needed for the three supported full modules;
- normalize logical record identity across those masters;
- build provider chains;
- resolve winning record;
- resolve exact localized-field ownership;
- walk backward only when the winner omits the selected field;
- regenerate provenance;
- add focused regression/synthetic tests;
- document the authoritative three-plugin boundary.

Do not build generic mod/load-order infrastructure.

---

# Supported plugin boundary

Authoritative source universe:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

The audit found all three are ordinary **full modules**.

Expected module facts:

```text
Starfield.esm
  masters: none
  own records use full-module namespace

ShatteredSpace.esm
  masters: Starfield.esm
  own records use full-module namespace

SFBGS00D.esm
  masters: Starfield.esm
  own records use full-module namespace
```

No current target requires medium- or light-module handling.

Do not add medium/light support in C7.

---

# SFBGS050 compatibility boundary

`SFBGS050.esm` may still appear in existing local config/tooling as a historical or compatibility input.

It is **not** part of the authoritative C7 source universe.

The audit found:

```text
canonical tracker entities: 0
committed provenance rows: 0
NameSourcePlugin rows: 0
```

It must not influence winning-provider selection for authoritative tracker provenance.

Preserve compatibility with existing config structure only where needed.

Do not promote it into the supported source set.

---

# Logical record identity

Add/reuse a narrow full-module identity model.

For each record in a supported plugin:

1. read the plugin’s ordered `TES4 MAST` entries;
2. append the containing plugin as the local namespace;
3. interpret the high byte of the file-local FormID as an index into:
   ```text
   [masters..., containing plugin]
   ```
4. use the lower 24 bits as the object ID;
5. define logical identity as:
   ```text
   (RecordSignature, OriginPlugin, ObjectID)
   ```

Example:

```text
Starfield.esm       0005E364 -> Starfield.esm object 05E364
SFBGS00D.esm        0005E364 -> Starfield.esm object 05E364
ShatteredSpace.esm  01000801 -> ShatteredSpace.esm object 000801
SFBGS00D.esm        01033E3F -> SFBGS00D.esm object 033E3F
```

Retain committed `RecordFormID` exactly as the existing provenance representation requires.

Do not migrate runtime entity IDs.

---

# Provider chains

Build provider chains by logical identity:

```text
(signature, origin plugin, object ID)
```

using the explicitly supported order:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Only supported plugins participate in winning-provider selection.

Expected current audit result:

```text
distinct name-bearing logical records: 2,619
provider-chain length 1:              2,618
provider-chain length >1:                 1
```

The sole nontrivial chain is Muphrid IV.

Lock this as an installed-data regression gate.

---

# Field-provider algorithm

Implement the intended provider rule for direct/name-bearing provenance rows.

For a logical record:

```text
1. build ordered provider chain;
2. choose the winning record as the last provider;
3. inspect the exact selected semantic field path on the winner;
4. if winner explicitly serializes the field:
     winner is NameSourcePlugin;
5. otherwise walk backward through earlier providers;
6. choose the latest provider that explicitly serializes the exact field;
7. resolve NameStringID only in that provider's declared table;
8. if no provider serializes the field, fail closed.
```

Do not determine field ownership by:

- comparing English text;
- comparing string IDs;
- assuming record owner == name provider;
- reverse matching a string table.

---

# Exact semantic field ownership

Use the existing allowlisted semantic-field map.

For each row, inspect the exact:

```text
NameFieldPath
```

rather than any same-signature subrecord.

This matters especially for nested PNDT full-name components.

For Muphrid IV, ownership must be determined from:

```text
baseFormComponents.TESFullName_Component.fullName.FULL
```

not from generic `FULL` signature presence.

---

# NameSourcePlugin behavior

After C7:

```text
RecordSourcePlugin
```

continues to represent the canonical/origin name-bearing record source used by the existing schema.

For Muphrid IV:

```text
RecordSourcePlugin = Starfield.esm
```

must remain unchanged.

Only:

```text
NameSourcePlugin
```

changes to:

```text
SFBGS00D.esm
```

No schema change is required.

---

# String-table qualification

Continue using the fully qualified identity:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
```

The audit found real collisions proving bare string IDs are unsafe.

Examples include:

```text
00002378
Starfield.esm       -> Weakness
ShatteredSpace.esm  -> Female Groat
SFBGS00D.esm        -> Plant

00002379
Starfield.esm       -> AAA Chance
ShatteredSpace.esm  -> Kid Groat
SFBGS00D.esm        -> Water
```

C7 must preserve plugin-qualified lookup.

Do not add reverse-text matching.

---

# Muphrid IV regression

Add an installed-data regression requiring:

```text
EntityKind          = body
EntityId            = 0005E364
RecordSourcePlugin  = Starfield.esm
RecordFormID         = 0005E364
RecordSignature      = PNDT
NameSourcePlugin     = SFBGS00D.esm
NameStringTable      = strings
NameStringID         = 0000A682
```

English verification must still produce:

```text
Muphrid IV
```

Japanese lookup must still produce:

```text
ムフリドIV
```

The important assertion is provider identity, not text difference.

---

# Inherited-field support

The audit found:

```text
live inherited localized fields: 0
```

Even so, implement the backward provider walk because it is part of the correct narrow provider algorithm.

Add a **synthetic full-module test**:

```text
master serializes FULL
override exists
override omits FULL
=> NameSourcePlugin must resolve to master
```

Do not invent a live official example.

---

# Explicit-owner override test

Add a synthetic full-module test:

```text
master serializes FULL
override serializes FULL
=> NameSourcePlugin must resolve to override
```

This should model the Muphrid IV behavior.

---

# Same numeric ID test

Add a synthetic test where:

```text
master strings:      ID X -> text A
override strings:    ID X -> text B
```

and the selected provider owns ID X.

Assert lookup uses the selected provider’s table only.

This protects against accidental unqualified string resolution.

---

# Same object-ID test

Add a synthetic identity test proving:

```text
plugin qualification + TES4 master namespace
```

distinguishes logical identities even when lower 24-bit object IDs repeat in independent full modules.

Do not implement generic module-class support.

---

# Current population invariants

Installed-data regeneration should report:

```text
resolved entities:                   3,539
provenance rows:                     4,796
unresolved rows:                         0
distinct name-bearing records:       2,619

provider-chain length 1 rows:         4,795
provider-chain length >1 rows:            1
winner owns selected field rows:      4,796
winner inherits selected field rows:      0
provider ambiguity/unresolved rows:       0
normalization exceptions:                 0
```

After regeneration, provider counts should reflect the correction:

```text
Starfield.esm       NameProvider rows: 4,759
ShatteredSpace.esm  NameProvider rows:    35
SFBGS00D.esm        NameProvider rows:     2
```

Do not hard-code counts in runtime code; use them as installed-data regression assertions in the provenance build/test path.

---

# Family-specific preservation

C7 must not regress existing C1–C6 behavior.

Preserve:

- IRES direct provenance;
- BIOM direct provenance;
- PERK official terms;
- STDT systems;
- PNDT bodies;
- FLOR names;
- direct NPC fauna;
- C5 template fauna lineage;
- C6 composed fauna component provenance.

The audit found no nontrivial provider chain for:

```text
IRES
BIOM
PERK
STDT
FLOR
NPC_
INNR
```

Only PNDT currently has one.

Do not rewrite unaffected rows.

---

# Template fauna preservation

All five C5 template fauna currently end at single-provider base-game encounter NPCs.

C7 should leave their provenance unchanged.

Add a regression confirming:

- canonical species identity remains in the C5 lineage artifact;
- final encounter NPC remains the name-bearing record;
- provider-chain hardening does not alter those five rows.

---

# C6 preservation

The two selected CCT INNR records remain single-provider `Starfield.esm` records.

All four Shattered Space C6 fauna continue to use base-game components.

C7 should not alter any C6 row.

Add a regression that C6 provider counts/components remain unchanged.

---

# Manifest/archive behavior

Continue using manifest-backed archive/table associations.

Current authoritative mapping includes:

```text
Starfield.esm
-> Starfield - Localization.ba2

ShatteredSpace.esm
-> ShatteredSpace Main archive set / Main02 localization members

SFBGS00D.esm
-> SFBGS00D - Main.ba2
```

C7 should not invent archive names from plugin names.

No new archive-discovery system is needed.

---

# Recommended implementation shape

Prefer small reusable helpers, for example:

```text
readTes4MasterList(...)
normalizeFullModuleRecordIdentity(...)
buildSupportedProviderChains(...)
resolveLocalizedFieldProvider(...)
```

Exact filenames/functions are up to the repository architecture.

Do not create a generic load-order subsystem.

---

# Production integration

Provider-chain resolution should be shared by the provenance generators that operate on direct/name-bearing records.

At minimum ensure C4 body generation uses it, since that is where the live defect occurs.

Where practical, route other direct-name generators through the same helper so they no longer encode the assumption:

```text
RecordSourcePlugin == NameSourcePlugin
```

But do not perform a gratuitous broad refactor.

The goal is one consistent narrow provider rule, not architectural churn.

---

# Committed-data validation

Extend committed validation so it can assert:

- Muphrid IV’s committed `NameSourcePlugin` is `SFBGS00D.esm`;
- `RecordSourcePlugin` remains `Starfield.esm`;
- provider-qualified identity remains structurally valid;
- no authoritative row uses `SFBGS050.esm`;
- all previous source/entity invariants still hold.

Repository-only validation does not need to re-derive the provider chain from absent game files.

Installed-game regeneration remains the authority for that.

---

# Documentation

Update durable documentation to state:

1. authoritative localization source universe is:
   ```text
   Starfield.esm
   ShatteredSpace.esm
   SFBGS00D.esm
   ```
2. all three are full modules;
3. logical record identity is:
   ```text
   signature + origin plugin + object ID
   ```
4. winning record and localized field provider can differ from canonical source;
5. `NameSourcePlugin` is chosen by explicit field serialization, not text equality;
6. Muphrid IV is the current live override regression case;
7. medium/light modules, Creations, and third-party mods remain out of scope;
8. `SFBGS050.esm` may remain a compatibility/config artifact but is not authoritative tracker content.

---

# No runtime changes

Do not modify:

- React UI;
- locale overlays;
- search;
- persistence;
- Undo/Redo;
- import/export;
- schema versions;
- player/network domain state.

C7 is build/reference provenance hardening only.

---

# No generic mod support

Do not add:

- arbitrary plugin discovery;
- user-selected load order;
- LOOT/libloadorder;
- Mutagen;
- generic full/medium/light handling;
- Creation support;
- third-party mod support;
- generic override browser;
- plugin editor.

Those are explicitly outside tracker scope.

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

Also run:

- installed-game provenance regeneration;
- provider-chain inventory/regression;
- Muphrid IV provider assertion.

---

# Acceptance criteria

C7 is complete when:

1. TES4 master lists are read for the three supported official masters;
2. full-module logical record identity is normalized correctly;
3. provider chains are built by logical identity;
4. winning record selection is deterministic;
5. exact semantic field ownership is inspected;
6. winner-owned fields resolve to the winner’s table;
7. inherited fields walk backward to the latest explicit provider;
8. missing providers fail closed;
9. Muphrid IV regenerates with:
   ```text
   RecordSourcePlugin = Starfield.esm
   NameSourcePlugin   = SFBGS00D.esm
   ```
10. Muphrid IV’s string ID remains `0000A682`;
11. English/Japanese display values remain unchanged;
12. only the intended provider attribution changes in committed provenance unless another real defect is discovered;
13. no live inherited localized fields remain;
14. no medium/light support is introduced;
15. SFBGS050 does not participate in authoritative provider selection;
16. qualified string-table lookup remains enforced;
17. all C1–C6 populations remain stable;
18. unresolved count remains zero;
19. all tests/build/lint/checks pass;
20. no runtime/UI/persistence/schema work is introduced;
21. no arbitrary mod/Creation support is introduced;
22. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- provider-chain helper design;
- TES4/master-list normalization behavior;
- exact Muphrid IV before/after provenance;
- whether any other committed row changed;
- installed provider-chain counts;
- inherited-field count;
- module-class handling actually implemented;
- SFBGS050 compatibility handling;
- synthetic tests added;
- preservation results for template fauna and C6;
- global provenance totals;
- verification results;
- confirmation that no generic mod/load-order support was added.

Do not proceed to C8 unless separately instructed.
