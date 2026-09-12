# CODEX AUDIT BRIEF — Localization Parcel C7: Official-Master Override and FormID Hardening

## Purpose

Perform a **narrow hardening audit** for Parcel C7.

C7 is **not** a general Starfield load-order/mod-support project.

The tracker’s authoritative content universe is intentionally limited to exactly three official master plugins:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

The tracker does **not** support:

- arbitrary Creations;
- third-party mods;
- unknown plugin load orders;
- generic full/medium/light mod ecosystems;
- arbitrary master chains beyond these three supported sources.

The audit should therefore answer only the questions necessary to prove that localized-name provenance remains correct across these three masters.

Do not implement broad new infrastructure unless the audit demonstrates a concrete need.

Do not commit or push.

---

# Audit output location

Write the report to:

```text
docs/audits/codex-localization-c7-official-master-hardening-audit.md
```

Temporary diagnostics may live under:

```text
.local-work/localization/c7-audit/
```

and remain untracked unless a small reusable helper clearly belongs in production code later.

---

# Core audit question

Across:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

and the complete current localized-name provenance population:

> Do any canonical tracker entities resolve their localized display-name field from a different plugin than the winning/canonical record provider, and what record/FormID normalization is actually required for these three supported masters?

The audit should distinguish:

```text
canonical/origin record identity
winning record provider
localized field provider
string-table provider
```

without expanding into arbitrary mod support.

---

# Why this audit exists

The original Parcel C audit identified two C7 risks:

1. **override/master field inheritance**
2. **full/medium/light FormID identity**

C1–C6 have already implemented substantial provider-aware behavior opportunistically.

C7 should now determine empirically whether any meaningful hardening remains for the actual official tracker source set.

Do not assume the original 3–6 day C7 estimate is still valid.

---

# Population boundary

Audit the complete current resolved provenance population.

Expected current totals after C6:

```text
3,539 resolved entities
4,796 provenance rows
0 unresolved
```

Use the committed provenance crosswalk as the canonical audit target set:

```text
reference-source/localized-name-provenance.csv
```

Include all current entity kinds:

- resources;
- products;
- biomes;
- official terms/skills;
- systems;
- bodies;
- flora;
- direct fauna;
- template fauna;
- composed fauna.

Do not discover new entities from plugin scans.

---

# Supported plugin boundary

The supported source universe is exactly:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

If repository data or current tooling still mentions `SFBGS050.esm`, treat that as a historical/supported-input artifact only if necessary for existing code compatibility, but the C7 audit should explicitly report whether it contributes any canonical tracker entity or localized-name provider.

Do not broaden C7 to support arbitrary plugins simply because generic code paths exist.

---

# Audit area 1 — canonical record identity

For each provenance entity/component, determine and distinguish:

```text
canonical/origin plugin
canonical record local identity
winning provider plugin
winning record identity
```

The audit should answer:

- Is `RecordSourcePlugin` currently being used consistently as canonical/origin ownership?
- Is the stored `RecordFormID` durable within the supported official source model?
- Is any committed provenance row relying only on a bare load-order FormID without enough plugin identity to disambiguate it?
- Do any canonical entities change identity depending on declared load order among the three supported masters?

No runtime IDs should be migrated unless a real defect is found.

---

# Audit area 2 — plugin/master class

Determine the actual module class of:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

For each, report whether it behaves as:

```text
full
medium
light
```

or another relevant Starfield class.

The important question is:

> Which FormID namespace rules are actually exercised by these three supported masters?

Do not merely repeat theoretical Starfield encoding formats.

Inspect the installed plugin metadata/header/master relationships and current canonical IDs.

---

# Audit area 3 — FormID normalization

Trace how the current parser/tooling interprets references and record IDs for the supported masters.

Determine whether the project already correctly normalizes:

```text
record-local object identity
plugin-qualified identity
load-order encoded FormID
master-relative references
```

for every current target.

Report:

- current internal normalization model;
- whether it differs by module class;
- any remaining ambiguity;
- any case where the same bare numeric FormID could identify different records across supported plugins;
- whether current provenance CSV identity is sufficient because plugin qualification is always retained.

Do not design a generic mod-manager-compatible FormID layer unless these masters require it.

---

# Audit area 4 — winning-record provider chains

For every canonical provenance target, inspect whether more than one supported plugin contributes a provider for the same logical record.

Inventory:

```text
provider chain length = 1
provider chain length > 1
```

For nontrivial chains, report:

```text
record signature
canonical/origin plugin
canonical/local ID
provider chain in load-order order
winning provider
```

Group counts by:

- record signature;
- entity kind;
- canonical source plugin;
- winning provider plugin.

---

# Audit area 5 — localized field inheritance

This is the central C7 question.

For each provenance row/component with a nontrivial provider chain, determine whether the winning record:

```text
A. explicitly serializes the selected localized field
B. omits/inherits the selected localized field from an earlier provider
```

For inherited cases, identify:

```text
canonical/origin plugin
winning record plugin
NameSourcePlugin
NameStringTable
NameStringID
exact semantic field path
```

Count all cases.

Expected categories:

```text
winning record owns selected name field
winning record inherits selected name field
no override chain
```

Do not infer inheritance from equal resolved English text.

Inspect the exact selected semantic field serialization.

---

# Audit area 6 — same numeric string ID across plugins

Check whether any current provenance rows would become ambiguous if plugin qualification were dropped.

Specifically inventory cases where the same:

```text
NameStringID
```

appears in more than one supported plugin/table among relevant provenance entries.

Confirm that the current qualified identity:

```text
(NameSourcePlugin, NameStringTable, NameStringID)
```

is sufficient.

No reverse text matching.

---

# Audit area 7 — field-provider algorithm

Compare actual current code behavior against the intended provider rule:

```text
1. identify the winning record for the canonical identity;
2. inspect the exact selected semantic field;
3. if the winning record serializes it, winning plugin is NameSourcePlugin;
4. otherwise walk backward through earlier providers until the latest explicit field serialization is found;
5. resolve string ID only against that provider's declared table;
6. fail if no provider serializes the field.
```

Determine:

- which parts are already implemented;
- which entity families currently exercise them;
- whether any code path still assumes:
  ```text
  RecordSourcePlugin == NameSourcePlugin
  ```
- whether any code path silently borrows a string table from the wrong plugin.

---

# Audit area 8 — C6 composed fauna interaction

C6 found:

- all selected INNR providers are `Starfield.esm`;
- all Shattered Space composed fauna reuse base-game OMOD/INNR/string components;
- no C6 selected INNR override ambiguity exists.

C7 should verify this remains consistent with the general provider model but should not redo the C6 audit.

Report composed fauna simply as one entity family in the provider-chain inventory.

---

# Audit area 9 — direct-name populations

For direct-name families, inspect representative and all nontrivial override cases across:

```text
IRES
BIOM
PERK
STDT
PNDT
FLOR
NPC_
```

and any other currently used direct-name signature.

Pay special attention to DLC-owned records whose names could theoretically be inherited from `Starfield.esm`.

Do not assume DLC ownership implies DLC string ownership.

---

# Audit area 10 — template fauna

For C5 template-derived fauna, verify:

- canonical tracker fauna identity remains the original species;
- actual localized-name provider is still the final encounter-template `NPC_.FULL`;
- provider inheritance, if any, is correctly evaluated on that final name-bearing NPC;
- lineage metadata remains sufficient.

Do not redesign template-fauna provenance.

---

# Audit area 11 — archive/table association

C2 already established that archive naming cannot be guessed from one suffix convention.

C7 should only verify that, for these three official masters:

```text
NameSourcePlugin
-> localization archive/member set
-> locale table
```

remains deterministic and manifest-backed.

No new archive-discovery system should be built unless a concrete gap is found.

---

# Required inventory outputs

The audit report should include a table like:

```text
Plugin                 ModuleClass   CanonicalEntities   WinningRecords   NameProviders
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

and counts for:

```text
provenance rows total
provider chain length 1
provider chain length >1
winning field owned by winner
winning field inherited from earlier provider
cross-plugin name providers
FormID normalization exceptions
ambiguous/unresolved provider cases
```

Also break nontrivial cases down by entity kind/signature.

---

# Representative proofs

Provide concrete traced examples for every observed nontrivial category.

At minimum:

1. one ordinary base-game record;
2. one Shattered Space-owned record;
3. X-Tech from `SFBGS00D.esm`;
4. one composed fauna from Shattered Space using base-game name components;
5. one nontrivial override chain, if any;
6. one inherited localized field, if any;
7. one module-class/FormID normalization example per actual class present among the three masters.

If a requested nontrivial category does not exist, state that explicitly rather than inventing one.

---

# Synthetic-test recommendation

Even if the live official dataset does not exercise every theoretical case, recommend the smallest useful synthetic coverage.

Potential synthetic cases:

```text
winning override explicitly owns FULL
winning override omits FULL -> inherit master FULL
same numeric string ID in two plugins
same object/local ID in two plugins
module-class-specific FormID decoding if more than one class matters
```

Only recommend full/medium/light synthetic coverage that is justified by the supported official-master architecture.

If none of the three supported masters is medium/light, say whether testing those classes is still worthwhile or unnecessary scope.

---

# Important non-goals

Do not recommend or implement:

- arbitrary Creation support;
- third-party mod support;
- user-selected load orders;
- LOOT/libloadorder integration;
- general FormID normalization for unknown plugins;
- Mutagen adoption merely for theoretical completeness;
- generic override browsers;
- plugin editors;
- generic xEdit replacement.

The tracker is intentionally bounded to three official sources.

---

# C7 disposition decision

The audit must end with one of these recommendations:

## Outcome A — C7 substantially already satisfied

Use when:

- current official targets have no problematic inherited fields;
- plugin-qualified identity is already sufficient;
- actual module classes are already handled;
- only a few regression tests/docs remain.

Recommend a small hardening implementation brief.

## Outcome B — focused C7 implementation still needed

Use when:

- real official targets exercise inherited localized fields;
- current provider resolution is incomplete;
- module-class/FormID handling for one of the three masters is not safe;
- committed provenance could be wrong without additional logic.

Recommend the minimal implementation required.

## Outcome C — architecture contradiction

Use only if the current C1–C6 model cannot faithfully represent an observed official-master case.

Stop and describe the contradiction before suggesting implementation.

---

# C8 boundary

Do not absorb C8 into C7.

C8 remains responsible for:

- final builder integration;
- coverage gates;
- reproducible regeneration;
- manifest/verification workflow;
- Parcel D handoff completeness.

C7 is only about official-master record identity and field-provider correctness.

---

# Verification

Run enough checks to ensure diagnostics do not damage the repository.

At minimum:

```text
npm test
npm run reference:test
npm run localization:provenance:test
git diff --check
```

If tracked production files are not modified, full app build/lint is optional.

Report exactly what was run.

---

# Deliverables

The report must contain:

1. actual module class of each supported master;
2. current FormID normalization model;
3. full provenance provider-chain inventory;
4. count of nontrivial override chains;
5. count of inherited localized fields;
6. list of cross-plugin `NameSourcePlugin` cases;
7. same-ID cross-plugin ambiguity analysis;
8. representative trace examples;
9. any gaps in current provider logic;
10. synthetic-test recommendations;
11. exact recommended C7 implementation scope;
12. whether C7 collapses to a small hardening task;
13. explicit confirmation that arbitrary mods/Creations remain out of scope.

---

# Final Codex summary

Summarize:

- whether any current localized field is inherited across supported masters;
- whether `RecordSourcePlugin` ever differs from `NameSourcePlugin`;
- whether any current target needs medium/light FormID handling;
- whether bare FormIDs would be ambiguous without plugin qualification;
- whether current provenance rows are already safe;
- the smallest remaining implementation work;
- recommended commit boundary if follow-up work is needed.

Do not proceed to C7 implementation unless separately instructed.
