# CODEX IMPLEMENTATION BRIEF — Localization Parcel C5: Direct Flora and Direct-Through-Template Fauna Provenance

## Purpose

Implement **Parcel C5**, adding localized-name provenance for organic species whose display name ultimately comes from one explicit localized `FULL` field.

C5 should cover:

1. **flora with direct `FLOR.FULL` names**;
2. **fauna with direct `NPC_.FULL` names**;
3. **fauna whose canonical display name is reached through the existing leveled/template fallback but still ultimately comes from one explicit encounter-template `NPC_.FULL`**.

C5 should **not** implement genuinely composed fauna names assembled from CCT Object Template keywords and INNR naming rules. Those belong to Parcel C6.

The attached production xEdit exporter:

```text
Starfield - Export Planet Biome Organic Resources(1).pas
```

is the primary behavioral reference for classifying and resolving the organic species population.

Do not commit or push.

---

# Source of truth

Use:

- the attached production xEdit exporter;
- `reference-source/biome-organic-resources.csv`;
- committed C1–C4 localization provenance tooling;
- committed localization-input intake and English verifier;
- current official plugin set and manifest.

Preserve the exporter’s observed behavior and precedence where C5 reproduces lineage.

Do not silently simplify or replace its naming rules with assumptions.

---

# Scope classification

**Medium data-pipeline task with bounded lineage traversal.**

Expected work:

- build the canonical organic-species target set;
- deduplicate biome occurrences to unique species entities;
- classify flora/fauna naming route;
- resolve direct FLOR names;
- resolve direct NPC names;
- reproduce the existing leveled/template fallback only far enough to identify one explicit encounter-template `NPC_.FULL`;
- generate provenance for those direct-name populations;
- explicitly hand genuinely composed fauna to C6;
- add focused tests/docs/validation.

Do not implement CCT/INNR composition in C5.

---

# Canonical population

Drive C5 from the tracker’s existing production organic resource dataset:

```text
reference-source/biome-organic-resources.csv
```

Its grain is:

```text
Planet × Biome × Species
```

Therefore C5 must deduplicate those occurrence rows to one canonical species target per stable species identity.

Use the existing fields:

```text
SpeciesType
SpeciesFormID
SpeciesEditorID
SpeciesDisplayName
SpeciesSourceFile
```

or their current equivalents.

Do not enumerate arbitrary `FLOR` or `NPC_` records from the plugins.

---

# Entity identity

Use the existing stable canonical species identity.

Expected provenance kinds:

```text
flora
fauna
```

or the project’s existing organic entity-kind convention if one already exists.

Do not invent a new ID based on localized text.

A species repeated across many planets/biomes should produce one provenance entity.

---

# Attached exporter behavior to reproduce

The production exporter documents the species-display-name precedence as follows.

## Flora

```text
FLOR:
    explicit FULL - Name
```

The relevant implementation uses the winning FLOR override and selects its `FULL`.

C5 should treat this as a direct localized-name population.

---

## Fauna

The exporter uses this precedence:

```text
1. explicit FULL - Name
2. CCT Object Template + dn_CCTPrefixes/dn_CCTSuffixes
3. leveled-wrapper fallback:
     biome NPC
     -> TPLT LVLN
     -> leveled NPC
     -> encounter NPC template
     -> common encounter-template FULL name
```

C5 resolves **routes 1 and 3**.

Route 2 is inventory/classification only in C5 and is handed to C6.

Do not change the precedence.

---

# Important precedence consequence

Because the exporter checks CCT composition before the leveled-wrapper fallback, C5 must not blindly run the template fallback for every fauna record lacking direct `FULL`.

The C5 classifier should distinguish:

```text
DIRECT_NPC_FULL
COMPOSED_CCT
LEVELED_TEMPLATE_FULL
UNRESOLVED
```

using behavior consistent with the exporter.

A fauna record that successfully derives a CCT name belongs to C6 even if a later template path also exists.

---

# C5 output categories

Every unique canonical organic species should be classified into exactly one of:

```text
RESOLVED_DIRECT_FLORA
RESOLVED_DIRECT_FAUNA
RESOLVED_TEMPLATE_FAUNA
DEFERRED_COMPOSED_FAUNA_C6
UNRESOLVED
```

Report exact counts.

Do not silently omit C6 species from C5 accounting.

---

# Flora provenance

For canonical flora:

```text
exact source plugin + FLOR FormID
    ->
winning FLOR record
    ->
top-level FULL
    ->
raw localized string ID
    ->
official English verification
```

Expected provenance shape:

```text
EntityKind            = flora
DisplayNameSourceKind = direct
ComponentOrder        = 0
ComponentRole         = complete
RecordSignature       = FLOR
NameFieldPath         = topLevel.FULL
```

Expected table is determined by the checked-in semantic field map.

Do not hard-code table type outside that map.

---

# Direct fauna provenance

For canonical fauna with explicit `NPC_.FULL`:

```text
exact source plugin + NPC_ FormID
    ->
winning NPC_
    ->
top-level FULL
    ->
raw localized string ID
    ->
official English verification
```

Expected provenance shape:

```text
EntityKind            = fauna
DisplayNameSourceKind = direct
ComponentOrder        = 0
ComponentRole         = complete
RecordSignature       = NPC_
NameFieldPath         = topLevel.FULL
```

Add only the narrow `NPC_` direct-name field-map rule needed for this population.

Do not generalize arbitrary NPC naming.

---

# CCT composed-fauna detection

C5 must reproduce enough of the exporter’s CCT path to determine whether a fauna record belongs to C6.

The attached exporter does the following:

1. collect native NPC keywords from:

```text
Keywords\KWDA - Keywords
```

2. inspect each Object Template combination;

3. follow OMOD includes recursively;

4. collect OMOD properties where:

```text
Value = NPC - Keyword
```

and resolve `Value 1` to a `KYWD`;

5. apply the `dn_CCTPrefixes` and `dn_CCTSuffixes` INNR rule sets;

6. select matching rules by:

```text
greatest required-keyword specificity
then highest YNAM - Index
then earliest rule index
```

7. require the species/body suffix to produce a useful composed name;

8. optionally prepend prefix and append diet.

C5 does **not** need to serialize localized provenance for these components.

However, C5 must be able to determine:

```text
this fauna has a valid CCT-composed display name
```

so it can be classified as:

```text
DEFERRED_COMPOSED_FAUNA_C6
```

rather than incorrectly falling through to the leveled-template route.

---

# CCT ambiguity behavior

The exporter iterates Object Template combinations.

If multiple combinations produce different non-empty derived names, it logs a warning.

C5 should preserve fail-closed behavior.

Recommended classification:

```text
COMPOSED_CCT_AMBIGUOUS
```

or an equivalent explicit unresolved/deferred status.

Do not arbitrarily choose one combination.

If all useful combinations collapse to one identical composed name, classify the species as C6-composed.

Do not generate component provenance in C5.

---

# Leveled/template fauna fallback

For fauna with:

- no explicit direct `NPC_.FULL`; and
- no valid CCT-composed name;

reproduce the attached exporter’s fallback:

```text
biome NPC
    ->
TPLT
    ->
LVLN
    ->
Leveled List Entries
    ->
LVLO - Base Data
    ->
NPC
    ->
leveled NPC_
    ->
TPLT
    ->
encounter NPC_
    ->
FULL
```

For each usable leveled-list entry, collect the encounter-template `FULL`.

The fallback succeeds only if all usable entries collapse to **exactly one unique non-empty encounter-template name**.

The exporter explicitly mentions examples such as:

```text
Grylloba
Cataxi
Terrormorph
```

as fauna using this fallback.

Treat those examples as guidance from the production script, not as hard-coded identity rules.

---

# Template-fauna provenance

For a successful fallback, the actual localized-name provenance belongs to the final encounter-template `NPC_.FULL`, not the original biome-wrapper NPC.

Therefore a resolved C5 template-fauna row should record:

```text
EntityKind = fauna
EntityId   = canonical fauna species ID

RecordSourcePlugin = plugin owning selected encounter NPC_
RecordFormID        = selected encounter NPC_ FormID
RecordSignature     = NPC_
NameFieldPath       = topLevel.FULL
NameSourcePlugin    = actual name provider
NameStringTable     = field-map table
NameStringID        = raw localized ID from encounter NPC_.FULL
CanonicalEnglish    = canonical SpeciesDisplayName
```

The canonical entity identity remains the original tracker fauna identity.

Do not replace the tracker species ID with the encounter-template NPC identity.

---

# Template lineage audit metadata

Because the provenance record points at a different NPC than the canonical biome species record, preserve diagnostic lineage somewhere machine-readable.

At minimum report/store enough to reconstruct:

```text
canonical fauna source NPC_
-> TPLT LVLN
-> leveled NPC_
-> TPLT
-> encounter NPC_
```

This may be:

- generated diagnostic CSV;
- local report;
- structured build log;
- a narrowly scoped checked-in lineage file if needed for reproducibility.

Do not overload the main localized-name provenance CSV with every intermediate edge unless the existing schema already supports it.

The main crosswalk should remain normalized around the actual localized-name provider.

---

# Template ambiguity behavior

If usable leveled entries resolve to:

```text
0 unique encounter names
```

C5 does not resolve the species.

If they resolve to:

```text
>1 unique encounter names
```

C5 must fail/defer explicitly.

Do not select the first entry.

Suggested reason codes:

```text
FAUNA_TEMPLATE_NAME_NOT_FOUND
FAUNA_TEMPLATE_NAME_AMBIGUOUS
FAUNA_TEMPLATE_CHAIN_UNSUPPORTED
```

---

# Direct-vs-template English verification

For resolved flora/direct fauna/template fauna:

```text
raw localized provenance tuple
    ->
official English table
    ->
exact localized English
```

Compare to the canonical production exporter’s:

```text
SpeciesDisplayName
```

Strict exact match remains the default.

Reuse the existing entity-scoped normalization mechanism if a genuine source/display discrepancy is discovered.

Do not rewrite `biome-organic-resources.csv`.

---

# Canonical source preservation

The production organic CSV is an xEdit-derived structural/business-data extract.

Do not alter its `SpeciesDisplayName` merely to make verification pass.

If official localized English differs:

```text
source value
localized value
```

add an explicit audited normalization only after proving the exact provenance.

---

# DLC coverage

Use the same official plugin/input set as earlier parcels:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

C5 should include all canonical flora/fauna already represented in `biome-organic-resources.csv` from those sources.

Zero-target plugins are valid.

Do not split DLC organic species into a separate later brief.

---

# Provenance output

Append C5-resolved rows to:

```text
reference-source/localized-name-provenance.csv
```

Use one row per resolved direct name.

C5 does not yet emit multi-component composed-fauna rows.

Species deferred to C6 should remain represented in a dedicated C5 classification/handoff artifact or unresolved report with an explicit C6-deferred reason.

Recommended reason/status:

```text
DEFERRED_COMPOSED_FAUNA_C6
```

This should not be treated as an accidental extraction failure in reporting.

---

# C6 handoff artifact

Produce a deterministic machine-readable handoff for genuinely composed fauna.

Suggested file:

```text
reference-source/localized-name-provenance-c6-fauna.csv
```

or another clearly named project-owned diagnostic/handoff artifact.

At minimum include:

```text
EntityKind
EntityId
SpeciesSourcePlugin
SpeciesFormID
SpeciesEditorID
CanonicalEnglish
Classification
Detail
```

For CCT fauna, include useful audited diagnostics if readily available:

```text
ObjectTemplateCombinationCount
ResolvedCombinationName
```

Do not attempt localized component IDs yet.

The handoff’s purpose is to give C6 an exact, bounded target population.

If the existing unresolved CSV is a better architectural fit, use it, but distinguish deliberate C6 deferral from genuine unresolved errors.

---

# Population accounting

Final report must reconcile:

```text
unique canonical flora
unique canonical fauna
total unique species
```

against:

```text
resolved direct flora
resolved direct fauna
resolved template fauna
deferred composed fauna for C6
genuinely unresolved
```

The totals must balance exactly.

---

# Field-map additions

Expected narrow additions:

```text
FLOR top-level FULL
NPC_ top-level FULL
```

Only add these where required.

Do not add OMOD/INNR localized component fields in C5 unless needed solely for classification and no localization ID is emitted.

C6 owns component provenance.

---

# Parser/relationship additions

Add only narrow relationship readers needed by C5:

```text
NPC_.TPLT -> linked record
LVLN leveled entries -> NPC
leveled NPC_.TPLT -> encounter NPC_
NPC_ Keywords/KWDA
Object Template combinations
OMOD Includes
OMOD keyword properties
INNR rule matching fields
```

These exist to reproduce the production exporter’s classification/fallback behavior.

Do not turn them into a generalized Bethesda relationship-query framework.

---

# INNR rule precedence

Where C5 must evaluate CCT composition for classification, reproduce the production exporter exactly:

```text
1. greatest keyword specificity
2. highest YNAM - Index
3. earliest matching INNR rule
```

No alternate heuristic.

A rule with no keyword requirements is not treated as a useful match if the exporter rejects it.

Preserve the attached script’s semantics.

---

# OMOD traversal

For CCT classification:

- follow nested OMOD includes recursively;
- deduplicate visited OMODs;
- collect only keyword properties matching `NPC - Keyword`;
- collect linked `KYWD` EditorIDs;
- include native NPC keywords.

Do not reuse produced-resource OMOD logic as naming logic unless it is genuinely the same relationship.

Naming and resource-production OMOD discovery are separate concerns in the attached exporter.

---

# Tests

Add focused project-authored synthetic tests.

## Flora

- direct `FLOR.FULL` resolves;
- missing `FULL` fails/defer explicitly;
- repeated biome occurrences deduplicate to one species.

## Direct fauna

- direct `NPC_.FULL` wins immediately;
- Object Template data is ignored when direct FULL exists because direct FULL has precedence.

## CCT classification

- native NPC keywords participate;
- OMOD keyword properties participate;
- nested OMOD includes participate;
- greatest specificity wins;
- equal specificity -> highest YNAM wins;
- equal specificity + YNAM -> earliest rule wins;
- missing species/body suffix does not yield a valid composed name;
- multiple different combination names are ambiguous/fail closed;
- valid composed fauna is deferred to C6 rather than resolved by C5.

## Template fallback

- no FULL + no CCT name -> follow TPLT/LVLN chain;
- one unique encounter-template FULL resolves;
- multiple leveled entries with same encounter name resolve;
- multiple different encounter names fail/defer;
- no usable encounter FULL fails/defer.

## Precedence

Explicitly prove:

```text
direct FULL
> valid CCT composed name
> leveled/template fallback
```

C5 resolves first and third, defers second.

## Plugin coverage

- base-game organic target;
- Shattered Space organic target if represented;
- zero-target supported DLC is valid.

---

# Real installed-game inventory

Run C5 across the complete canonical organic-species population.

Report exact counts for:

```text
Flora:
  total unique
  direct FULL resolved
  unresolved

Fauna:
  total unique
  direct NPC FULL
  valid CCT composed -> C6
  leveled/template FULL
  ambiguous CCT
  ambiguous template
  genuinely unresolved
```

Also report duplicate biome occurrences collapsed into unique species.

This empirical inventory is an important C5 deliverable because it defines the actual size of C6.

---

# Representative installed-game proofs

At minimum provide:

1. one flora direct FULL example;
2. one fauna direct NPC FULL example;
3. one successful leveled/template fauna example;
4. one CCT-composed fauna classified for C6;
5. one Shattered Space organic species if present in canonical data.

If the named examples in the production exporter (`Grylloba`, `Cataxi`, `Terrormorph`) still resolve through the documented fallback, report them, but do not hard-code them.

---

# Committed-data validation

Extend no-game-files committed validation for C5 resolved rows.

For direct flora and direct fauna, validate canonical facts available from the source:

```text
EntityKind
EntityId
canonical species source identity
CanonicalEnglish
expected direct-name shape
```

For template fauna, validate:

- canonical entity remains the original species;
- localized-name provider is an `NPC_`;
- semantic path is `topLevel.FULL`;
- any checked-in lineage/handoff identity remains internally consistent.

Do not claim repository-only validation can independently re-prove Bethesda links or raw string IDs.

---

# Documentation

Update durable docs.

At minimum document the C5 route classes:

```text
flora direct FLOR.FULL
fauna direct NPC_.FULL
fauna CCT composition -> C6
fauna leveled/template -> encounter NPC_.FULL
```

Document the exact precedence from the production exporter.

Clarify that C5’s CCT work is classification only; localized component provenance is deferred to C6.

Document the C6 handoff population/count.

Do not create redundant documentation if the existing localization regeneration guide is suitable.

---

# No runtime changes

Do not modify:

- React UI;
- runtime Japanese overlays;
- search;
- locale selector;
- persistence;
- Undo/Redo;
- import/export;
- network/player schema.

C5 remains reference/build tooling only.

---

# No C6 composition implementation

Do not:

- emit INNR component localized IDs;
- generate Japanese composed fauna names;
- define language-specific component ordering;
- migrate runtime fauna display consumers.

C6 owns the genuinely composed naming model.

---

# No generalized Bethesda organic browser

Do not add:

- arbitrary FLOR/NPC enumeration;
- species discovery outside canonical tracker data;
- generic Object Template explorer;
- generic INNR/OMOD reverse-engineering UI;
- broad all-record relationship graphing.

Remain target-driven from the canonical organic CSV.

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

Also run the installed-game provenance regeneration and C5 organic inventory using the official plugin + localization inputs.

---

# Acceptance criteria

C5 is complete when:

1. canonical species targets come only from the tracker organic reference data;
2. repeated Planet × Biome × Species rows are deduplicated to unique species entities;
3. all canonical flora are classified;
4. flora direct FULL provenance is resolved where available;
5. all canonical fauna are classified according to the production exporter precedence;
6. direct `NPC_.FULL` fauna are resolved;
7. valid CCT-composed fauna are explicitly deferred to C6;
8. CCT classification reproduces keyword collection and INNR rule precedence from the attached exporter;
9. leveled/template fauna are resolved only when usable entries collapse to one encounter-template FULL name;
10. ambiguous CCT/template cases fail closed;
11. resolved template fauna point provenance at the actual encounter-template `NPC_.FULL` while retaining canonical fauna entity identity;
12. all official DLC canonical organic targets are included in the same parcel;
13. every unique canonical species is resolved, C6-deferred, or explicitly unresolved;
14. population accounting balances exactly;
15. C6 receives a deterministic bounded target population;
16. no composed-name localization provenance is implemented prematurely;
17. canonical organic source data is not rewritten to force matches;
18. strict English verification remains the default;
19. ordinary CI/build does not require installed Starfield files;
20. no runtime/UI/Japanese-overlay/persistence/schema changes are introduced;
21. no generic Bethesda organic browsing/toolkit is created;
22. all verification commands pass;
23. no commit or push is performed.

---

# Final report

Report:

- files changed/added;
- unique flora count;
- unique fauna count;
- duplicate occurrence rows collapsed;
- direct flora resolved;
- direct fauna resolved;
- template fauna resolved;
- CCT-composed fauna deferred to C6;
- ambiguous CCT count;
- ambiguous template count;
- genuinely unresolved count;
- breakdown by source plugin;
- representative proof examples;
- any new normalization approvals;
- field-map/parser relationship additions;
- exact C6 handoff size;
- tests/build/lint results;
- confirmation that the attached exporter’s precedence was preserved;
- confirmation that no C6 component localization/runtime work was introduced.

Do not proceed to C6 unless separately instructed.
