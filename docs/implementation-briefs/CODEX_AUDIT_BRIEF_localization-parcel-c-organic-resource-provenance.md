# CODEX AUDIT BRIEF — Parcel C Addendum: Organic Resource Localization Provenance

## Purpose

Audit and define the missing localization provenance for the tracker’s **22 organic harvest resources**.

This is a focused Parcel C addendum prompted by the Parcel D integration audit.

Do **not** implement the provenance extension yet.

Do **not** commit or push.

Write the audit report to:

```text
docs/audits/codex-localization-parcel-c-organic-resource-provenance-audit.md
```

---

# Why this audit exists

Parcel C currently closes at:

```text
3,539 resolved entities
4,796 provenance rows
0 unresolved
```

but Parcel D found that the runtime resource catalogue contains a complete 22-resource organic harvest family with no Parcel C provenance entities.

These are:

```text
Adhesive
Amino Acids
Analgesic
Antimicrobial
Aromatic
Gastronomic Delight
Hallucinogen
High-Tensile Spidroin
Hypercatalyst
Immunostimulant
Luxury Textile
Metabolic Agent
Neurologic
Nutrient
Ornamental
Pigment
Sealant
Sedative
Spice
Stimulant
Structural
Toxin
```

The current provenance `resource` population covers inorganic/special resource records but not these organic harvest outputs.

The audit should determine the authoritative Bethesda source/name path for all 22 and recommend the smallest correct Parcel C extension.

---

# Scope classification

**Small-to-medium focused provenance audit.**

Expected work is development-time localization/reference-data analysis only.

No runtime/UI/persistence/history/import/export/schema changes.

---

# Authoritative source universe

The tracker’s authoritative Bethesda source universe remains exactly:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Do not include:

- Creations;
- third-party mods;
- arbitrary installed plugins;
- `SFBGS050.esm` as authoritative content.

If any of the 22 resources are supplied or overridden by one of the three supported masters, report that through the existing C7 provider model.

---

# Core audit question

For each of the 22 organic resource identities:

> What exact Bethesda record and semantic localized-name field owns the canonical resource name used by the tracker?

The audit must determine:

```text
tracker ResourceId
canonical English name
record signature
record source plugin
record FormID
semantic field path
name source plugin
string table
string ID
official English value
official Japanese value
```

and whether one consistent record model covers all 22.

---

# Canonical tracker identities

Use the existing runtime resource IDs as the canonical entity IDs for this addendum.

Expected mapping basis:

```text
adhesive
amino-acids
analgesic
antimicrobial
aromatic
gastronomic-delight
hallucinogen
high-tensile-spidroin
hypercatalyst
immunostimulant
luxury-textile
metabolic-agent
neurologic
nutrient
ornamental
pigment
sealant
sedative
spice
stimulant
structural
toxin
```

Confirm exact IDs from the repository.

Do not invent new IDs.

---

# Audit question 1 — What records define the 22 names?

Determine the actual record signature and record set behind the 22 organic resource names.

Possible outcomes may include:

- one consistent record type;
- multiple record types;
- a shared resource dictionary;
- keyword/global/item definitions;
- another Bethesda data structure.

Do not assume `IRES`.

Do not infer from English names alone.

Use xEdit/record inspection and the narrow existing tooling where appropriate.

---

# Audit question 2 — Are they one-to-one canonical records?

For each tracker `ResourceId`, determine whether there is:

```text
exactly one canonical Bethesda record
```

that should own the localized resource name.

Report any case where:

- multiple records share the same displayed resource name;
- the runtime tracker identity maps to a concept rather than one record;
- an organic resource name is derived/composed rather than direct;
- a record is reused for something else.

Prefer stable record identity over text matching.

---

# Audit question 3 — Exact semantic field path

Identify the exact localized field path used for the resource name.

For each discovered record shape, document the semantic field path in the same style as the existing Parcel C field map, for example conceptually:

```text
topLevel.FULL
```

or another exact nested path.

Do not use generic “first FULL” logic.

If a new record signature/path is needed, recommend the narrow field-map addition.

---

# Audit question 4 — Provider and override behavior

Apply the C7 official-master provider model.

For each organic resource:

1. normalize logical record identity;
2. inspect provider chain across:
   ```text
   Starfield.esm
   ShatteredSpace.esm
   SFBGS00D.esm
   ```
3. identify winning record;
4. identify exact localized field provider;
5. report whether:
   ```text
   RecordSourcePlugin == NameSourcePlugin
   ```
   or differs.

Count:

```text
single-provider records
nontrivial provider chains
winner-owned fields
inherited fields
```

Do not expand beyond the three supported masters.

---

# Audit question 5 — Official English/Japanese coverage

Resolve every selected qualified string identity in both:

```text
English
Japanese
```

using the existing manifest-backed localization inputs.

Expected result should ideally be:

```text
22/22 English
22/22 Japanese
```

Report exact missing IDs if any.

Do not substitute machine translation.

---

# Audit question 6 — Canonical English verification

Compare official English localized values to the tracker’s canonical English names.

Classify each row as:

```text
EXACT
APPROVED_NORMALIZATION_REQUIRED
MISMATCH
```

Do not silently normalize punctuation, hyphens, plurality, capitalization, or spelling.

If any mismatch exists, report the exact:

```text
tracker canonical
Bethesda official
record/string identity
```

and recommend whether an entity-scoped normalization is appropriate.

---

# Audit question 7 — Japanese values

Produce a review table containing the official Japanese value for all 22.

This is an audit/report artifact, not yet a runtime overlay.

Do not manually edit official Japanese strings.

Flag:

- decoder replacement characters;
- suspicious whitespace;
- punctuation anomalies;
- unexpected English fallback.

---

# Audit question 8 — Relationship to existing organic resource data

Inspect current source/reference data used to populate these resource IDs.

Determine whether the 22 names originate today from:

- handmade tracker metadata;
- organic-resource CSVs;
- species harvest data;
- a resource dictionary;
- another source.

Report which current file(s) define:

```text
ResourceId
CanonicalName
abbreviation or metadata
```

and whether the new provenance extension can join directly by stable ID.

Do not redesign organic resource modeling.

---

# Audit question 9 — Relationship to flora/fauna harvest outputs

Determine whether the 22 resource identities are referenced by:

- flora harvest/resource outputs;
- fauna harvest/resource outputs;
- both.

This is not to derive the names from species records.

The purpose is to confirm the tracker’s resource identity population is complete and internally consistent.

Report:

```text
resource ID
flora references count
fauna references count
unused?
```

where practical.

---

# Audit question 10 — Gastronomic Delight special case

Pay specific attention to:

```text
gastronomic-delight
```

because the project already has display/reference-history around the “Gastronomic Delight” naming override in reference data.

Determine whether the Bethesda official localized record name exactly matches the current tracker canonical English display.

If not, explain how this interacts with the existing project-specific display override.

Do not alter the existing runtime behavior during the audit.

---

# Audit question 11 — Resource provenance schema

Determine whether the existing normalized provenance schema is sufficient:

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

Expected preference:

```text
EntityKind = resource
DisplayNameSourceKind = direct
ComponentOrder = 0
ComponentRole = complete
```

Do not add schema columns unless a real organic-resource case requires them.

---

# Audit question 12 — Builder integration point

Identify the smallest correct place to add the organic resource targets into Parcel C.

Determine whether they belong in:

- existing C2 direct-name provenance generation;
- a small dedicated organic-resource target builder feeding the same direct-name generator;
- another current integrated stage.

Prefer reusing the existing direct-name/provider-chain machinery.

Do not create a parallel provenance subsystem.

---

# Audit question 13 — Coverage changes

Calculate the expected Parcel C totals after adding all 22, assuming one direct provenance row each.

Expected provisional arithmetic:

```text
entities: 3,539 -> 3,561
rows:     4,796 -> 4,818
```

Confirm rather than assume.

Recalculate provider counts by source plugin.

Report whether any other totals/invariants change.

---

# Audit question 14 — Parcel D impact

State the exact impact on the Parcel D contract.

Expected outcome:

```text
runtime resource catalogue:
76 total

provenance-backed surfaced resources:
54 current
+22 organic
=76 surfaced runtime resources

plus 2 source-only excluded provenance resources:
aqueous-hematite
caelumite
```

Confirm exact reconciliation.

If this does not hold, explain why.

---

# Audit question 15 — Future DLC behavior

Recommend how future Bethesda DLC organic resources should enter this same provenance path.

The desired model is:

```text
new canonical organic ResourceId
+ explicit authoritative Bethesda record mapping
-> same direct provenance builder
```

Do not design automatic discovery of arbitrary resource records.

---

# Required report tables

Include a complete 22-row table:

```text
ResourceId
CanonicalEnglish
RecordSignature
RecordSourcePlugin
RecordFormID
NameFieldPath
NameSourcePlugin
NameStringTable
NameStringID
OfficialEnglish
OfficialJapanese
EnglishMatchStatus
```

Include a provider summary:

```text
Plugin
Canonical resource records
Name-provider rows
Override chains
Inherited fields
```

Include a current-data reconciliation table:

```text
ResourceId
Current tracker source file
Flora reference count
Fauna reference count
Notes
```

---

# Evidence standards

For every resource, provenance must be based on exact record identity and exact localized field.

Do not accept:

- English text search alone;
- string-table reverse matching alone;
- guessed FormIDs;
- inferred ownership from matching names.

Use exact Bethesda record evidence.

---

# Tooling guidance

Prefer the existing narrow Parcel C tooling.

Use xEdit as a development-time oracle when needed for:

- record identification;
- cross-record relationships;
- winning override confirmation;
- semantic path confirmation.

Do not introduce:

- Mutagen;
- general plugin parsing libraries;
- arbitrary load-order support.

Temporary diagnostics should live under:

```text
.local-work/localization/organic-resource-audit/
```

---

# Non-goals

Do not:

- modify Parcel D runtime overlay code;
- generate the final Japanese runtime overlay;
- change resource IDs;
- change organic harvesting mechanics;
- modify flora/fauna resource relationships;
- add semantic-message translations;
- address the 102 generic deferred Japanese terminology messages;
- add future DLC data now;
- add mod/Creation support.

This audit is only about authoritative provenance for the 22 missing organic resource names.

---

# Verification

Run repository-safe checks relevant to the audit.

At minimum:

```text
npm run localization:provenance:verify
git diff --check
```

If temporary installed-game diagnostics are used, report them.

No production provenance outputs should be changed during this audit.

---

# Audit disposition

End with one of:

## Outcome A — straightforward direct-name extension

Use if all 22 map cleanly to stable direct localized records and the existing schema/provider machinery is sufficient.

Recommend a small implementation addendum.

## Outcome B — mixed but bounded extension

Use if more than one record signature/path is needed but all 22 remain directly resolvable within current Parcel C architecture.

Recommend the minimum additional field-map/target logic.

## Outcome C — architectural contradiction

Use only if one or more organic resource names cannot be represented by the current provenance model without redesign.

Stop and explain the contradiction.

---

# Final report requirements

The report must state:

1. whether all 22 organic resources have authoritative Bethesda records;
2. exact record signature(s);
3. exact semantic field path(s);
4. English/Japanese resolution coverage;
5. any canonical-English mismatches;
6. provider-chain results;
7. whether existing provenance schema is sufficient;
8. smallest implementation path;
9. expected new Parcel C totals;
10. exact Parcel D reconciliation impact;
11. whether any blocker remains.

Do not proceed to implementation unless separately instructed.
