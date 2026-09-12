# CODEX AUDIT BRIEF — Localization Parcel C: Canonical Localized-String Provenance

## Purpose

Audit and design the implementation path for **Parcel C: Add canonical localized-string provenance**.

The objective is to establish a trustworthy build-time chain from the tracker’s canonical reference data to Bethesda’s localized string identities.

The desired end state is:

```text
stable tracker/reference ID
    -> Bethesda source record
    -> name-bearing field
    -> localized string ID
    -> string-table type
    -> source plugin
    -> canonical English text
```

Parcel C does **not** generate Japanese overlays yet. That belongs to Parcel D.

This is an audit/spike-design task. Do not implement the production extraction pipeline unless a very small diagnostic proof is necessary to answer an audit question.

Do not commit or push.

## Background

Parcels A and B are complete.

Current localization status:

```text
A. Complete semantic string migration
B. Add complete Japanese tracker catalogue
C. Add canonical localized-string provenance
D. Build official-term extraction and generated overlays
E. Japanese search/font/layout hardening
F. Release verification → accessibility audit
```

The tracker-authored Japanese catalogue is complete and reviewed.

The remaining localization problem is **Bethesda-owned reference terminology**, including resources, products, systems, bodies, biomes, species, skills, X-Tech terminology, and related canonical game names.

A previous localization audit established that:

- Bethesda localization tables align English and Japanese by `(plugin/base, string-table extension, string ID)`;
- numeric string IDs are not globally unique across `.strings`, `.dlstrings`, and `.ilstrings`;
- localization archives do **not** contain FormID-to-string-ID mapping;
- current canonical extracts mostly contain resolved English names and FormIDs, but not raw localized string IDs;
- English-text reverse matching is ambiguous and must not be used as the production identity chain;
- ordinary localized FULL fields are expected to expose or contain raw string IDs somewhere in the plugin record representation;
- star-system names and composed fauna are known special cases requiring dedicated investigation.

The user has manually scouted xEdit and currently expects that ordinary xEdit UI inspection will probably **not** expose the raw localized IDs in a useful way.

Therefore this audit must seriously evaluate **direct ESM/plugin parsing** as a likely extraction route.

## Primary audit question

Determine the safest and most maintainable way to recover, for every relevant canonical reference name:

```text
SourcePlugin
RecordFormID (where applicable)
RecordSignature
NameFieldPath
LocalizedStringID
LocalizedStringTable
CanonicalEnglish
```

without relying on English-text matching.

## Candidate extraction routes to evaluate

Do not assume direct ESM parsing is automatically best. Compare the realistic options.

### A. xEdit scripting / native-value access

Determine whether xEdit scripting APIs can expose raw localized values even if the GUI does not.

Investigate relevant APIs such as:

- `GetNativeValue`
- `GetElementNativeValues`
- any Starfield-specific localized-string accessors
- raw subrecord access if exposed by xEdit scripting.

Questions:

- Can a localized `FULL`/equivalent field yield the raw uint32 string ID?
- Can the script identify whether the ID belongs to `.strings`, `.dlstrings`, or `.ilstrings`?
- Can it preserve source/winning-plugin ownership?
- Is this reliable for Starfield records rather than older Bethesda formats?

If this route is viable, compare its reproducibility and maintenance burden to direct parsing.

### B. Direct ESM/plugin binary parsing

Investigate direct read-only parsing of Starfield plugin files.

The audit should establish:

- Starfield plugin header/record/group structure relevant to the target records;
- compression rules;
- subrecord encoding;
- localized string field representation;
- master/load-order/FormID handling;
- light/master or other Starfield-specific FormID details;
- override/winning-record provenance;
- how the plugin flags indicate localization;
- how to determine the string-table type associated with a localized field.

Do not build a full general-purpose ESM parser if a narrow read-only extractor can safely cover the required record signatures/fields.

Assess whether a project-owned Node implementation is reasonable, or whether another language/library is materially safer.

### C. Existing open-source parser/library

Search for actively maintained libraries/tools that can parse Starfield plugin records and preserve raw localized fields.

For each serious candidate record:

- project name / URL;
- language;
- license;
- Starfield support level;
- localized-string support;
- raw FormID/subrecord support;
- override/master handling;
- whether using it would add a runtime dependency or build-only dependency;
- whether adopting it is preferable to a narrow project-owned parser.

Do not recommend an older Skyrim/Fallout parser unless actual Starfield support is demonstrated.

### D. Creation Kit / official tooling export

Assess whether the Creation Kit or another official Bethesda tool can export the required raw string IDs or localized field metadata in a reproducible form.

If the output is GUI-only or difficult to automate, record that limitation.

### E. Hybrid diagnostic route

A hybrid route is acceptable, for example:

- use xEdit/CK to identify field paths;
- use a narrow direct parser to read raw IDs;
- use the Parcel D BA2/string parser for localized text.

If hybrid is best, describe the boundary clearly.

## Canonical populations to audit

Use the current canonical source files and builders in the repository.

For each population, identify:

- runtime stable identity;
- source file(s);
- Bethesda record type/signature;
- record FormID availability;
- current English name source;
- expected name-bearing field;
- likely string-table type;
- source-plugin provenance requirements;
- special cases;
- recommended new canonical columns.

At minimum cover:

### 1. Inorganic resources

Current source includes canonical resource FormIDs.

Expected ordinary route:

```text
IRES record
-> FULL
-> raw localized string ID
```

Investigate X-Tech/bespoke resource rows separately.

Recommended provenance fields from the prior audit included:

```text
ResourceNameStringID
ResourceNameStringTable
```

Retain `SourceFile` / plugin qualification.

### 2. Manufactured products / Industrial Workbench

Products and ingredients are keyed by item FormID.

Expected ordinary route:

```text
item record
-> FULL
-> raw localized string ID
```

Determine whether product and ingredient occurrences should carry IDs directly in the recipe CSV or join through a canonical item crosswalk.

Prior proposed columns:

```text
ProductNameStringID
ProductNameStringTable
IngredientNameStringID
IngredientNameStringTable
```

Assess normalization to avoid repeated provenance where possible.

### 3. Star systems

This is a known special case.

Current runtime identity is numeric `StarSystemID`, not a FormID.

Current system names are derived from galaxy/star data rather than a simple known name-bearing record.

Determine:

- where the localized system display name actually originates;
- whether a record/subrecord contains a raw string ID;
- whether system name provenance can be associated deterministically with `StarSystemID`;
- whether Alpha Centauri’s known localization string IDs can help validate the route.

Do not use English text as the final join.

### 4. Planetary bodies

Current body identity includes a PNDT/body FormID.

Audit the actual name-bearing field path.

Previous notes suggest body names may come from ANAM/component FULL or a related component structure.

Determine:

- exact field/subrecord path;
- raw string ID ownership;
- whether planet/moon names differ structurally;
- whether Akila is a useful representative test;
- whether multiple components can carry names.

Recommended provenance fields:

```text
BodyNameFieldPath
BodyNameStringID
BodyNameStringTable
```

### 5. Biomes

Current biome identity is a BIOM FormID.

Expected route:

```text
BIOM
-> FULL
-> raw localized string ID
```

Use a representative common display name such as `Rocky Desert` to verify whether multiple BIOM records may share the same localized string ID or merely the same resolved text.

Recommended columns:

```text
BiomeNameStringID
BiomeNameStringTable
```

### 6. Organic species

Split at least:

- explicit flora/fauna records with a direct name field;
- composed/templated fauna names;
- any encounter/template-derived names.

Determine whether composed names can be reconstructed from localized component string IDs without English-text matching.

Prior proposed fields:

```text
SpeciesDisplayNameSourceKind
SpeciesDisplayNameStringID
SpeciesDisplayNameStringTable
```

For composed names, define component IDs/order rather than forcing one fake string ID.

### 7. Skills and other Bethesda-owned UI terms

The tracker currently surfaces several game-native labels:

- Outpost Management
- Outpost Engineering
- Planetary Habitation
- Research Methods
- Special Projects
- X-Tech terminology / capability wording where game-owned

Identify the canonical Bethesda record/field for each and whether they belong in the same provenance pipeline or a small separate official-term crosswalk.

Do not treat tracker-coined concepts as Bethesda-owned.

## Representative proof targets

Use a small set of known terms to validate candidate extraction methods.

### Aluminum

Known localization-table English matches from the previous audit:

```text
0x000040DC
0x00008155
0x0000E209
```

Official Japanese observed:

```text
アルミニウム
```

The audit should determine which exact string ID is referenced by the canonical Aluminum resource record.

### Alpha Centauri

Known localization-table English matches:

```text
0x0000A9D0
0x0000C7E5
```

Official Japanese observed:

```text
アルファ・ケンタウリ
```

Use this to validate the system-name provenance route.

### Rocky Desert

Locate one or more canonical BIOM records displaying `Rocky Desert`.

Determine their raw localized string IDs and whether repeated English display names share an ID.

### Akila

Locate the canonical planetary/body record and identify the exact name-bearing field and raw localized string ID.

These are diagnostic targets only. Do not hard-code their values into production logic.

## Plugin and override provenance

The audit must define how source ownership is represented.

A string identity must be qualified by at least:

```text
SourcePlugin
StringTable
StringID
```

A load-order FormID or bare string ID is not enough.

Investigate:

- `Starfield.esm`;
- DLC/plugin masters such as `SFBGS00D.esm` and `ShatteredSpace.esm`;
- winning overrides;
- inherited unchanged localized fields;
- records whose winning override comes from one plugin while the localized value originated in a master.

Recommend a rule for provenance ownership that can be implemented deterministically.

Do not silently collapse plugin identity.

## String-table type

The audit must prove how to determine one of:

```text
strings
dlstrings
ilstrings
```

for each name-bearing field.

Do not assume every `FULL` is `.strings` unless verified.

If record-field semantics determine the table type externally rather than storing it directly in the record, document the rule/source.

## Canonical schema design

Propose the minimal schema changes needed to current reference CSVs.

Important principles:

- stable runtime IDs must not change;
- canonical English names remain useful fallback and verification values;
- localized string provenance is build metadata, not gameplay state;
- avoid duplicating the same provenance in many recipe rows if a normalized item crosswalk is cleaner;
- unresolved special cases must be explicit, not silently reverse-matched by English;
- use deterministic formatting.

Previous audit recommendation:

- uppercase eight-digit hexadecimal string IDs in CSV for reviewability;
- parse as unsigned 32-bit values in tooling;
- table value enum:
  - `strings`
  - `dlstrings`
  - `ilstrings`.

Reassess and confirm or improve this convention.

## English verification join

Design a validation step:

```text
canonical provenance row
+ English Bethesda string tables
-> resolved English
```

The resolved official English should be checked against the canonical expected English name.

Classify mismatches rather than silently correcting them.

Possible mismatch classes:

- wrong field;
- wrong plugin;
- wrong string-table type;
- winning-override difference;
- deliberate tracker spelling/normalization;
- composed display name;
- canonical-source error.

This validation should become the proof that the provenance chain is correct before Parcel D consumes Japanese tables.

## Relationship to Parcel D

Parcel C should stop once canonical records carry enough qualified provenance to support deterministic localization lookup.

Parcel D will then implement or finalize:

- BA2 archive reading;
- `.strings` / `.dlstrings` / `.ilstrings` parsing;
- English/Japanese alignment;
- generated `ja-JP` reference-name overlay;
- provenance manifest;
- missing/conflict reports;
- migration of reference-name display consumers to the resolver.

Do not pull those implementation concerns into C except where necessary to define the interface.

## Existing/reference tooling and provenance

Review:

`docs/THIRD-PARTY-REFERENCES.md`

The repository previously studied:

**Bethesda Strings Editor / 0xra0**

as a technical reference for:

- BA2 localization archives;
- Bethesda string-table parsing;
- alignment by `(plugin, extension, string ID)`.

Its AI translation functionality is not part of the tracker plan.

If this audit studies additional parsers/libraries, record:

- name;
- URL;
- license;
- exact technical role;
- whether code was merely studied or is recommended for adaptation/use.

Do not claim code was copied if it was not.

## Required audit output

Create:

`docs/audits/codex-localized-string-provenance-audit.md`

The report should include:

1. Executive summary
2. Current canonical data inventory
3. Why localization archives alone cannot map FormIDs
4. Extraction routes compared
5. xEdit scripting feasibility
6. Direct ESM/plugin parsing feasibility
7. Existing parser/library candidates
8. Creation Kit / official tooling feasibility
9. Recommended architecture
10. Record-format findings
11. Per-population provenance map
12. Aluminum proof target
13. Rocky Desert proof target
14. Alpha Centauri proof target
15. Akila proof target
16. Plugin/master/override ownership model
17. String-table type model
18. Proposed canonical schema changes
19. English verification strategy
20. Unresolved special cases
21. Parcel C implementation breakdown
22. Parcel D handoff contract
23. Risks / legal/provenance notes
24. Cost estimate for implementation parcels

## Audit depth and spike permissions

This audit may create **small untracked diagnostic scripts** if necessary to prove format behavior.

Put exploratory work under a suitable ignored/local working directory, preferably:

`.local-work/localization/provenance/`

or the existing translation working area if that is more appropriate.

Do not commit diagnostic dumps from Bethesda files.

Do not commit Bethesda ESM/BA2/string-table content.

If direct plugin parsing is required for the audit, keep it narrow:

- inspect headers;
- locate selected records;
- inspect selected subrecords;
- prove raw string-ID recovery.

Do not attempt a whole production parser during the audit.

## Cost guidance

Classify the eventual Parcel C implementation by subtask.

Expected likely profile:

- ordinary resources/products/biomes: low-to-medium once field encoding is proven;
- body names: medium;
- system names: medium/high uncertainty;
- explicit species names: medium;
- composed fauna: potentially high;
- generic Starfield plugin parser from scratch: potentially high and should be avoided unless clearly justified.

If direct parsing is recommended, identify the **minimum parser surface** required rather than proposing a general Bethesda modding library.

## Verification of the audit

No production build/test suite changes are expected.

If diagnostic scripts are created, report:

- exact inputs;
- exact representative records;
- observed raw IDs;
- whether IDs resolve correctly through known English/Japanese localization tables;
- limitations.

Do not commit or push.

## Final summary to user

Report:

- recommended extraction route;
- whether xEdit scripting remains viable;
- whether direct ESM parsing is necessary;
- whether an existing library is worth adopting;
- exact proof results for Aluminum, Rocky Desert, Alpha Centauri, and Akila where obtainable;
- proposed canonical schema changes;
- special cases that need separate implementation;
- recommended subdivision/order for Parcel C;
- estimated cost/risk of each implementation slice;
- path to the durable audit report.

Do not implement Parcel C production changes unless separately instructed.
