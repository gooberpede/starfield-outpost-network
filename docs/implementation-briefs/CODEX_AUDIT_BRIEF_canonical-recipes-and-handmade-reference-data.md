# CODEX AUDIT BRIEF — Canonical Industrial Workbench Recipes and Handmade Reference-Data Consolidation

## Purpose

Audit the remaining handmade reference-data surface in `starfield-outpost-network`, with two linked goals:

1. prepare to replace the legacy handmade `reference-source/industrial-workbench.csv` with the new canonical game-derived Industrial Workbench extract; and
2. determine whether the remaining handmade metadata files can be reduced, consolidated, and brought into the same provenance/identity discipline as the canonical reference datasets.

This is an **audit and design-recommendation task only**. Do not implement the migration, rename files, regenerate runtime JSON, alter schemas, or delete source files as part of this audit unless explicitly instructed in a later implementation brief.

The audit must produce a written report at:

`docs/audits/codex-canonical-recipes-and-handmade-reference-data-audit.md`

Do not leave the report only in chat/terminal output.

---

## Repository context

The application is a mature React/TypeScript/Vite tracker/editor.

Reference-data generation is build-time infrastructure. Canonical source extracts live under `reference-source/`; generated runtime JSON lives under `public/reference-data/`.

Important current principles:

- canonical game identity/facts should come from canonical game-derived extracts wherever feasible;
- tracker-authored presentation/policy metadata should remain explicitly tracker-authored;
- stable application IDs must not be casually regenerated from corrected canonical names;
- canonical FormIDs should be preferred as crosswalk keys where available;
- names and EditorIDs should normally be treated as consistency assertions/display metadata rather than relational keys;
- persistence compatibility matters: a reference-data cleanup must not silently break existing saved networks;
- do not add runtime fields merely because a canonical source contains them if the runtime does not need them.

Recent precedent: the inorganic resource dictionary migration separated canonical source truth, tracker policy, and runtime presentation while preserving existing application `ResourceId` values.

Read at minimum:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `scripts/build-reference-data.mjs`
- `scripts/inorganic-resource-data.mjs`
- `reference-source/inorganic-resource-dictionary.csv`
- `reference-source/inorganic-resource-tracker-policy.csv`
- `reference-source/industrial-workbench.csv`
- `reference-source/abbreviations.csv`
- `reference-source/manufactured-product-dictionary.csv`
- `reference-source/organic-resource-dictionary.csv`
- the organic occurrence/source files used by the build
- the generated `public/reference-data/resources.json`
- the generated `public/reference-data/products.json`
- the generated `public/reference-data/product-recipes.json`
- all tests and documentation that constrain these sources or outputs.

Search the repository for **every consumer** of the handmade files and for assumptions about their current columns, names, IDs, rarity values, and abbreviations.

---

## Required new canonical input

A new canonical Industrial Workbench extract has been supplied for this work.

Its schema is:

```text
SourceFile
ExtractTimestamp
ProductFormID
ProductEditorID
ProductName
RecipeSourceFile
RecipeFormID
RecipeEditorID
IngredientSourceFile
IngredientFormID
IngredientEditorID
IngredientName
Quantity
```

The supplied extract currently contains:

- 90 ingredient rows;
- 30 distinct manufactured-product FormIDs;
- 30 distinct recipe FormIDs;
- 55 distinct ingredient FormIDs;
- one consistent extraction timestamp;
- `Starfield.esm` as product, recipe, and ingredient source for the current population;
- positive integer quantities in the range 1–4.

The current supplied extraction timestamp is:

```text
2026-09-11 13:11:31
```

Do not rely on the filename alone to identify the candidate extract. Verify its 13-column schema and content.

**Missing-input rule:** if the new canonical extract is not actually accessible in the Codex workspace, stop and report that exact missing input rather than attempting to reconstruct it from the legacy handmade CSV.

Do not overwrite `reference-source/industrial-workbench.csv` during the audit.

---

## What the canonical extract changes

The legacy source is name-based:

```text
Product,Ingredient,Quantity
```

The new source gives canonical identity for all three sides of the relationship:

```text
manufactured product IRES FormID
        ↓
recipe COBJ FormID
        ↓
ingredient IRES FormID
```

The intended future join direction is therefore expected to be approximately:

```text
ProductFormID     -> resolve manufactured product
IngredientFormID  -> resolve resource OR manufactured product
RecipeFormID      -> identify/assert the recipe COBJ
names/EditorIDs   -> consistency assertions
Quantity          -> canonical recipe fact
```

Audit whether the current architecture can adopt that directly and identify every place where the existing name-based join must change.

The current legacy build contains at least one spelling compatibility path for recipe lookup (`Aluminium` -> the stable application resource identity). The new canonical extract uses canonical `Aluminum` with the canonical inorganic FormID. Determine whether that compatibility branch can be retired from the recipe pipeline after migration without affecting unrelated compatibility requirements.

---

## Known canonical-name discrepancy to investigate

The new canonical extract contains the manufactured product:

```text
ProductFormID: 00202781
ProductEditorID: ResMfg_Tier03_SubstrateMolecularSieve
ProductName: Substrate Molecule Sieve
```

The current handmade product dictionary uses:

```text
Substrate Molecular Sieve
```

Trace this discrepancy through:

- current generated product ID;
- persisted references to that product ID;
- recipe generation;
- localization/reference-name handling;
- Search for Items;
- Planned Supply;
- manufacturing UI;
- tests;
- import/export compatibility.

Do **not** recommend regenerating a stable application ID merely because the canonical display name differs.

The audit should distinguish:

1. stable application identity;
2. canonical game name;
3. localized/display name;
4. legacy compatibility aliases, if any are still needed.

---

## Recipe COBJ identity

The new extract contains `RecipeSourceFile`, `RecipeFormID`, and `RecipeEditorID`.

The recipe records are COBJ records. The project does not currently appear to maintain a general COBJ dictionary.

Audit whether a separate COBJ catalogue is actually needed.

The expected default is:

- retain recipe COBJ identity/provenance in the canonical source extract;
- validate it during reference-data generation;
- do **not** create a new general-purpose COBJ dictionary unless a real consumer requires one;
- do **not** emit recipe FormID/EditorID into runtime JSON unless a current or clearly justified near-term runtime consumer needs them.

If the audit recommends otherwise, explain the concrete consumer and benefit.

---

## Ingredient identity and cross-source integrity

All inorganic ingredient IRES FormIDs in the new recipe extract are expected to exist in `reference-source/inorganic-resource-dictionary.csv`.

Manufactured-product ingredients should resolve to manufactured products represented by product FormIDs in the canonical recipe extract itself.

Organic ingredient FormIDs must be traced to the canonical organic source data already present in the repository, or the audit must identify exactly what canonical identity source is still missing.

Audit and recommend validation rules for at least:

- one `ProductFormID` always mapping to one expected product identity;
- one `RecipeFormID` belonging to exactly one product;
- every row for one product agreeing on its recipe FormID;
- `ProductFormID` / `ProductEditorID` / `ProductName` consistency;
- `RecipeFormID` / `RecipeEditorID` consistency;
- `IngredientFormID` / `IngredientEditorID` / `IngredientName` consistency;
- every ingredient FormID resolving to exactly one known item population;
- manufactured-product-as-ingredient references agreeing with product identity elsewhere;
- inorganic ingredient FormIDs resolving through the canonical inorganic dictionary;
- organic ingredient FormIDs resolving through the canonical organic identity source;
- quantities being positive integers;
- source/provenance consistency where appropriate.

Recommend whether these validations belong in `build-reference-data.mjs`, a dedicated module, tests, or a combination.

---

## Handmade source files to audit

The current handmade metadata surface includes at least:

```text
reference-source/abbreviations.csv
reference-source/manufactured-product-dictionary.csv
reference-source/organic-resource-dictionary.csv
```

There is clear overlap:

- `manufactured-product-dictionary.csv` contains product name, short name, and rarity;
- `abbreviations.csv` repeats manufactured-product names and short names under `Type=product`;
- `organic-resource-dictionary.csv` contains organic resource name, short name, and rarity;
- `abbreviations.csv` repeats organic names and short names under `Type=organic`.

The current `abbreviations.csv` also contains organic-like rows such as:

```text
None
Toxin Agent
Unique
```

which are not ordinary rows in `organic-resource-dictionary.csv`.

Do not assume these are either required or obsolete. Find their actual consumers and semantic purpose.

### Required audit questions

For each handmade file:

1. Who reads it today?
2. Is it part of the active reference-data build, test infrastructure, documentation, or dead/legacy tooling?
3. Which columns are canonical game facts?
4. Which columns are tracker-authored metadata?
5. Which values are duplicated elsewhere?
6. Which rows are unique to that file?
7. Would deleting or consolidating it change generated JSON byte-for-byte or semantically?
8. Would any external/manual workflow still require it?
9. Is its current grain correct for its purpose?
10. Is the file still justified as an independent source?

The goal is to reduce the number of required handmade files **if the domain and build architecture support it**, not to force everything into one file for its own sake.

Present at least these candidate end states and assess them:

- retain separate organic and manufactured metadata files, retire `abbreviations.csv`;
- consolidate all surviving tracker-authored item metadata into one typed file;
- another structure if repository evidence makes it clearly superior.

Prefer the smallest source surface that preserves clear ownership and maintainability.

---

## Required provenance schema for surviving bespoke files

Any handmade reference-data file that survives this cleanup must be brought into line with the broader reference-data provenance conventions.

At minimum it must contain:

- an explicit `SourceFile` column;
- an explicit `ExtractTimestamp` column;
- the relevant canonical FormID for each row;
- the relevant EditorID where available and useful;
- enough canonical identity fields to make mismatches diagnosable;
- the tracker-authored field(s), such as `ShortName`.

### Bespoke provenance semantics

These rows are **not extracted source rows**.

`SourceFile` must therefore use an unmistakable human-readable sentinel that states there is no canonical source file and the row is bespoke/tracker-authored.

The exact `SourceFile` sentinel string is not yet irrevocably fixed. A candidate is:

```text
BESPOKE - NO SOURCE FILE
```

The audit should recommend the exact final token, checking whether punctuation/spaces create any avoidable tooling issues. Whatever is chosen must be self-explanatory to a human inspecting the CSV.

`ExtractTimestamp` **is settled** as the following bespoke sentinel:

```text
9999-12-31 00:00:00
```

Do not replace that sentinel with the date of some other canonical extract. The point is to make hand-authored provenance obvious and maintenance-independent.

Document the convention so a future maintainer does not “correct” the sentinel as though it were stale or malformed extracted data.

---

## Canonical facts versus bespoke metadata

The audit must explicitly classify every proposed surviving column into one of these conceptual ownership classes:

### Canonical identity/fact

Examples may include:

- FormID;
- EditorID;
- canonical game name;
- canonical rarity, **if rarity can be reliably derived from canonical records**.

### Tracker-authored metadata/policy

Examples include:

- item abbreviations / `ShortName`;
- explicit tracker-only policy fields where no canonical equivalent exists.

### Provenance

Examples include:

- `SourceFile`;
- `ExtractTimestamp`.

Do not assume current rarity fields must remain handmade. Determine whether manufactured-product and organic rarity can be sourced canonically from the available IRES records. If so, recommend whether the canonical source should own rarity and the bespoke metadata source should merely be validated against it or cease to carry it.

Conversely, do not force a canonical derivation where the existing extract does not actually support one.

---

## Manufactured-product catalogue implications

The new recipe extract contains canonical manufactured-product FormIDs and EditorIDs for the 30 current Industrial Workbench products.

Audit whether this extract can become the canonical identity backbone for the manufactured-product catalogue while a much smaller tracker-authored source supplies only presentation metadata such as `ShortName`.

Trace how `products.json` is currently generated and determine:

- whether product application IDs should remain the existing name-derived stable IDs;
- how a FormID -> stable application ProductId crosswalk should be represented;
- whether a separate product policy/metadata file is still required;
- whether the canonical recipe extract alone is sufficient for product identity, name, and EditorID;
- how rarity should be sourced;
- how discrepancies between canonical and legacy display names should be surfaced and tested;
- whether any product exists in the handmade dictionary but not in the canonical recipe population, or vice versa.

Do not make persisted ProductIds depend directly on FormIDs unless the audit demonstrates a compelling compatibility-safe reason. The current application already has stable logical IDs that must be preserved.

---

## Organic-resource catalogue implications

Audit the organic catalogue with the same discipline.

Determine:

- where canonical organic IRES FormIDs and EditorIDs currently exist in repository source data;
- whether every current tracked organic resource can be crosswalked to a canonical FormID;
- whether the surviving handmade organic metadata file can be enriched with those FormIDs without manual ambiguity;
- whether canonical name/rarity are already available elsewhere;
- whether only `ShortName` (plus explicit bespoke provenance and identity columns) genuinely needs to remain hand-authored;
- whether special values appearing only in `abbreviations.csv` are actual resource records, classification labels, legacy artifacts, or something else.

Do not invent FormIDs for semantic labels that are not IRES records.

---

## Runtime and persistence compatibility

The audit must distinguish **source-data migration** from **runtime/persisted schema migration**.

Determine whether the proposed cleanup can preserve:

- existing `ResourceId` values;
- existing manufactured `ProductId` values;
- `resources.json` runtime contract;
- `products.json` runtime contract;
- `product-recipes.json` runtime contract;
- existing network JSON schema and stored references.

Prefer a migration that changes source provenance and build joins while leaving persisted user data untouched.

If any runtime or network schema change is truly necessary, identify it explicitly and explain why it cannot be avoided.

---

## Generated-output comparison

The old handmade recipe file is known to contain errors that the canonical extract corrects.

Therefore **byte-identical `product-recipes.json` is not an acceptance criterion** for the eventual implementation.

The audit must instead prepare an intentional-difference report:

- identify every recipe row/value that differs between legacy and canonical sources;
- classify each difference as:
  - corrected ingredient;
  - corrected quantity;
  - corrected spelling/name only;
  - corrected product identity/name;
  - added/removed row;
  - another clearly explained category;
- identify which differences should change runtime recipe output;
- identify differences that should remain source-only because stable runtime identity/presentation deliberately differs.

Also determine whether `products.json` and `resources.json` should change semantically after the migration, and why.

---

## Tests and regression protection

Recommend concrete tests for the implementation phase.

At minimum consider tests covering:

- canonical recipe CSV schema validation;
- FormID uniqueness/consistency rules;
- every canonical inorganic recipe ingredient resolving;
- every canonical organic recipe ingredient resolving;
- manufactured products resolving by FormID;
- product-as-ingredient recursion/crosswalk;
- stable application IDs surviving canonical-name corrections;
- the `Substrate Molecule Sieve` discrepancy;
- removal of the legacy `Aluminium` name-based recipe compatibility branch;
- bespoke `SourceFile` sentinel validation;
- bespoke `ExtractTimestamp == 9999-12-31 00:00:00`;
- no duplicate abbreviations within the relevant namespace(s);
- exact coverage between canonical product population and tracker metadata;
- generated output changes matching a reviewed expected-difference fixture/report;
- no accidental network schema/persistence changes.

Avoid tests that merely duplicate CSV contents without testing a meaningful invariant.

---

## Documentation impact

Identify documentation that must change during implementation, including as relevant:

- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- comments in `scripts/build-reference-data.mjs`
- any reference-data provenance/build documentation.

The eventual implementation should remove or rewrite backlog language once this work is complete rather than leaving the project described as still depending on replaceable handmade gameplay facts.

The audit report itself belongs in:

`docs/audits/codex-canonical-recipes-and-handmade-reference-data-audit.md`

---

## Required report structure

Write the audit report with these sections:

1. **Executive summary**
2. **Current source inventory and dependency map**
3. **Canonical Industrial Workbench extract assessment**
4. **Legacy-vs-canonical recipe difference analysis**
5. **Manufactured-product identity and catalogue analysis**
6. **Organic-resource identity and catalogue analysis**
7. **`abbreviations.csv` consumer/retirement analysis**
8. **Canonical vs tracker-authored field ownership**
9. **Recommended surviving handmade source schema(s)**
10. **Bespoke provenance sentinel recommendation**
11. **FormID crosswalk and validation design**
12. **Runtime and persistence compatibility**
13. **Generated-output impact**
14. **Test strategy**
15. **Documentation changes**
16. **Recommended implementation sequence**
17. **Risks / unresolved questions**
18. **Exact proposed file disposition table**

The file disposition table must list every relevant source file and recommend one of:

```text
KEEP AS-IS
KEEP BUT RESCHEMA
REPLACE WITH CANONICAL EXTRACT
MERGE INTO <file>
RETIRE
NEW FILE
```

with a concise reason.

---

## Audit quality bar

Do not simply recommend “use FormIDs” or “merge duplicate files.”

The report must trace actual current code paths and produce a concrete, implementation-ready model answering:

- what is authoritative;
- what is bespoke;
- what survives;
- what is retired;
- what joins by FormID;
- what keeps stable application identity;
- what output changes intentionally;
- what remains byte/semantically stable;
- what validations prevent future drift.

Prefer evidence from the repository and supplied canonical extract over assumptions.

Where the repository does not provide enough evidence, state the uncertainty explicitly.

Do not implement the resulting design until a separate implementation brief is approved.
