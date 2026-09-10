# Codex Architecture/Data Audit Brief — Retire Legacy Inorganic Resource Dictionary

## Objective

Perform a **no-code architecture/data audit** for replacing the tracker’s current handmade legacy inorganic resource dictionary with the newly extracted **canonical inorganic resource dictionary** derived from the Starfield and Terran Armada ESMs.

Do **not** implement the migration yet.

The goal is to retire the legacy CSV gracefully, preserving existing application identities and saved-network compatibility while allowing canonical source data to become authoritative.

The audit must identify:

- every current dependency on the legacy `reference-source/inorganic-resource-dictionary.csv`;
- how the build pipeline currently derives runtime resource records, IDs, names, abbreviations, rarity, parent relationships, family grouping, and sort/display order;
- how the canonical extract should map into that pipeline;
- what must remain stable for existing persisted networks and imports;
- how to handle canonical records that should not currently appear as ordinary tracker resources;
- how to separate **canonical source truth** from **tracker inclusion policy** and **presentation ordering**;
- what changes are required before the X-Tech feature can be implemented safely.

This audit is specifically about **reference-data migration and compatibility**, not the X-Tech UI/behavior itself.

---

# PART A — AUDIT REPORT LOCATION

All audit reports should now be written under:

```text
docs/audits/
```

Write the final report as:

```text
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
```

Do not place the audit report elsewhere unless repository conventions make this impossible.

---

# PART B — REQUIRED INPUTS

Read:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect the current repository, especially:

```text
reference-source/inorganic-resource-dictionary.csv
reference-source/abbreviations.csv
reference-source/biome-inorganic-resources.csv
reference-source/industrial-workbench.csv
scripts/build-reference-data.mjs
scripts/biome-reference-data.mjs
public/reference-data/resources.json
src/data/referenceDataLoader.ts
src/domain/models.ts
src/domain/resources.ts
src/localization/referenceNames.ts
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts
network migration / serialization code
tests covering resource reference data
```

Also inspect any other files that consume:

```text
Resource
Code
Rarity
ParentResource
SortOrder
resource IDs
resource names
resource abbreviations
resource family relationships
```

### Canonical input

The supplied canonical inorganic dictionary is the authoritative new source for this audit.

Expected columns include:

```text
ResourceFormID
ResourceEditorID
ResourceName
ResourceShortName
SNAMRarity
ClassificationKeyword
EffectiveParentFormID
EffectiveParentEditorID
EffectiveParentName
SourceFile
```

The exact column names in the supplied file win over this summary.

If the canonical extract is materially missing from the Codex session, stop and report the missing input rather than reconstructing it from memory or the legacy CSV.

---

# PART C — SOURCE AUTHORITY

The following rule is settled:

> **Where the canonical extract disagrees with the handmade legacy dictionary, the canonical extract wins.**

Do not attempt to normalize the canonical file back into the legacy data merely to preserve old assumptions.

However:

> **Existing application/persisted stable IDs must not be regenerated casually from the new canonical names.**

The migration must distinguish:

```text
canonical source identity
application stable identity
localized display name
tracker inclusion policy
presentation order
```

These are not the same concept.

---

# PART D — KNOWN CANONICAL DIFFERENCES TO VERIFY

The audit must independently verify these against the supplied canonical file and current repository.

Known differences observed before this audit include:

## 1. Additional canonical records

The new extract includes resources absent from the legacy CSV, including:

```text
X-Tech
Aqueous Hematite
Caelumite
```

Do not assume all canonical records belong in the current ordinary tracker catalogue.

Audit whether each record should be:

```text
included normally
included but handled specially
excluded/hidden from tracker runtime catalogue
retained only in source/audit data
```

Do not delete such records from the canonical source merely to preserve the old visible set.

---

## 2. Canonical family-tree correction

The legacy dictionary contains at least one incorrect relationship:

```text
legacy:
Aldumite -> Xenon

canonical:
Aldumite -> Caesium
```

Verify the exact canonical relationship from FormID/parent fields.

Audit every downstream place where parent/family relationships are consumed.

The canonical tree must eventually win.

---

## 3. Abbreviation differences

A known example is:

```text
Carboxylic Acids

legacy short code:
R-COC

canonical short code:
R-COOH
```

Verify whether abbreviations currently come from the legacy dictionary, `abbreviations.csv`, hard-coded data, or generated runtime records.

Recommend the correct authority and compatibility path.

Do not assume persisted data stores abbreviations.

---

## 4. Rarity vocabulary differences

Known examples include canonical rarity values such as:

```text
Water -> Everywhere
Helium-3 -> Special
```

where the legacy dictionary previously flattened these into ordinary rarity categories such as `Common`.

Audit:

- where rarity is consumed;
- whether runtime types currently permit only:
  `Common | Uncommon | Rare | Exotic | Unique`;
- whether UI grouping depends on the old normalized values;
- whether Planned Supply special-strip behavior is driven by rarity or by explicit identity;
- whether canonical rarity should be preserved raw and mapped into a tracker-specific presentation classification;
- whether `Everywhere` / `Special` should be runtime-visible or remain source metadata.

Do not silently coerce canonical rarity values without documenting the rule.

---

# PART E — STABLE IDENTITY AND FORMIDS

## 5. Existing application resource IDs

Audit how resource IDs are currently generated.

The current system historically derived logical IDs from curated English names, e.g. conceptually:

```text
Aluminium -> "aluminium"
Carboxylic Acids -> "carboxylic-acids"
```

These IDs may already exist in:

```text
saved networks
imports
history snapshots
Planned Supply
cargo items
production routes
tests
reference relationships
```

Treat them as **opaque application IDs** once persisted.

Do not recommend changing existing IDs merely because canonical FormIDs are now available.

---

## 6. Canonical FormID as authoritative crosswalk

Audit the best migration pattern for associating each existing application resource ID with:

```text
ResourceFormID
ResourceEditorID
canonical ResourceName
canonical ResourceShortName
canonical rarity
canonical parent FormID
source ESM
```

The likely desired pattern is:

```text
existing stable app ID
    <-> canonical FormID
```

rather than replacing the app ID with the FormID.

But verify actual architecture before recommending this.

---

## 7. Aluminum / Aluminium

Treat this as an important compatibility/localization case.

Canonical source appears to use:

```text
Aluminum
```

The application currently has an existing stable ID historically derived from:

```text
Aluminium
```

and localization already supports:

```text
en-US: Aluminum
en-GB: Aluminium
```

Audit the exact current path.

Preferred conceptual outcome:

```text
stable app ID remains unchanged
canonical source name becomes Aluminum
en-US baseline displays Aluminum
en-GB overlay displays Aluminium
FormID crosswalk is canonical
```

Identify and remove any obsolete build-time aliasing only if it becomes redundant and safe.

Do not break existing saved data.

---

# PART F — CANONICAL SOURCE VS TRACKER INCLUSION POLICY

## 8. Preserve the canonical extract intact

The canonical CSV should remain an honest source artifact.

Do not recommend editing it to remove records merely because the tracker does not currently need them.

Instead, audit where to define an explicit tracker inclusion policy.

Conceptually:

```text
canonical inorganic dictionary
    ↓
tracker inclusion/classification policy
    ↓
runtime resources.json
```

The inclusion policy should be explicit and testable.

---

## 9. Aqueous Hematite and Caelumite

Audit their current relationships to:

```text
biome-inorganic-resources.csv
atmospheric occurrence
resource generation
recipes
Planned Supply
runtime reference catalogue
```

Do not infer gameplay semantics from names alone.

The audit should answer:

- Do they appear anywhere in canonical occurrence/reference inputs?
- Are they currently usable by ordinary outpost extraction?
- Are they consumed by any tracked recipes?
- Would including them in the normal runtime catalogue create false UI/search/planned-supply options?
- Should they be hidden/excluded for now?
- If excluded, where should the exclusion rule live and how should it be documented?

If the supplied source does not establish their gameplay role, state that clearly.

---

## 10. X-Tech

For this migration audit:

- ensure the canonical X-Tech record can enter/reference the runtime data model safely;
- identify what must be true before the later X-Tech feature is implemented;
- do not implement X-Tech special availability or UI behavior here.

The later X-Tech feature will likely require explicit exceptional handling.

This audit should only make sure the reference-data migration does not preclude it.

---

# PART G — FAMILY TREE / PARENT RELATIONSHIPS

## 11. Audit current family-tree consumers

Find every code/build/test/UI location that relies on:

```text
ParentResource
parent resource IDs
family roots
branch order
rarity progression
effective tree relationships
```

Determine whether family relationships are:

```text
used only in Planned Supply grouping
used in resource availability
used in validation
used in search
used in generation/build logic
used in tests
```

Document actual dependencies.

---

## 12. Parent identity should use canonical crosswalks

Recommend how canonical parent fields should resolve to runtime/application resource IDs.

Avoid name-only parent joins if FormID-based joins are available.

If the runtime still needs application IDs, the build should resolve:

```text
EffectiveParentFormID
    -> canonical resource
    -> stable app ID
```

rather than depending on localized/canonical English name equality.

---

# PART H — SORT ORDER

## 13. Legacy `SortOrder` is non-canonical

The legacy CSV contains a `SortOrder` column that could not be reconstructed canonically.

Do not attempt to fabricate a source-level canonical sort order.

Audit exactly where `SortOrder` is currently used.

Separate:

```text
canonical data order
domain relationship order
presentation/display order
```

---

## 14. Recommend explicit presentation-order policy

Where the app genuinely requires a stable human-facing order, recommend an explicit tracker-owned order.

Potential places include:

```text
Planned Supply family/root ordering
family branch sibling ordering
resource matrix ordering
reference selectors/search tie-breaks
```

Do not assume one global order fits all surfaces.

The audit should identify which surfaces currently depend on legacy `SortOrder` and propose the narrowest replacement.

---

## 15. Preserve familiar ordering where useful

If current UI relies on deliberate familiar ordering, continuity may be preferable to arbitrary alphabetical or source-file order.

But the audit must distinguish:

```text
intentional UX order
legacy accidental order
canonical structural relationship
```

Do not retain bad data merely to preserve a mistaken tree.

---

# PART I — BUILD PIPELINE

## 16. Audit the current five-column legacy contract

The existing source currently resembles:

```text
Code
Resource
Rarity
ParentResource
SortOrder
```

Audit every parser/transform expecting that shape.

Document:

- input parsing;
- ID generation;
- abbreviation generation;
- rarity normalization;
- parent resolution;
- ordering;
- emitted `resources.json` shape;
- validation/coherence checks.

---

## 17. Recommend new canonical ingestion contract

Propose the smallest clean change that allows the build to consume the canonical columns.

Prefer:

```text
canonical parsing
explicit crosswalk to existing stable app IDs
explicit tracker inclusion/classification policy
explicit presentation-order policy
runtime output compatible with current app where possible
```

Do not make runtime UI consume raw ESM provenance fields unless there is a real product need.

---

## 18. Source provenance

Audit whether runtime data should retain any of:

```text
ResourceFormID
ResourceEditorID
SourceFile
ClassificationKeyword
SNAMRarity
```

Likely some belong only in build/source verification.

Recommend which fields should:

```text
remain source-only
be used during build validation
be emitted to runtime
```

Justify each.

---

# PART J — OCCURRENCE DATA COMPATIBILITY

## 19. Biome inorganic occurrence crosswalk

The existing canonical occurrence dataset may use:

```text
resource FormIDs
resource names
other resource identity fields
```

Audit exactly how `biome-inorganic-resources.csv` currently maps occurrence rows into runtime resource IDs.

Determine whether the canonical dictionary allows simplification from:

```text
name aliasing
```

to:

```text
FormID-based joins
```

especially for Aluminum/Aluminium.

---

## 20. Preserve occurrence semantics

Do not change established semantics for:

```text
biome occurrence
atmospheric occurrence
selected biome filtering
Ocean
```

This migration is about the resource dictionary, not planetary occurrence logic.

---

# PART K — RECIPE COMPATIBILITY

## 21. Industrial Workbench recipes

Audit how recipe ingredients currently resolve to resource identities.

Determine whether recipes use:

```text
resource names
abbreviations
stable IDs
FormIDs
```

If recipe source data still uses names, recommend the safest crosswalk.

Do not silently rewrite recipe files unless required.

---

## 22. Unknown/new canonical resources

Confirm that hidden/excluded canonical resources do not accidentally become valid recipe ingredients or Planned Supply selections merely because they exist in the source dictionary.

---

# PART L — PLANNED SUPPLY

## 23. Audit current resource grouping

The Planned Supply UI currently has:

```text
special strip for Water / Helium-3
family groupings
rarity presentation
disabled/hatched state
```

Audit exactly which dictionary fields drive:

```text
special-strip membership
family grouping
parent grouping
rarity labels/order
resource order
```

Identify what must change when:

```text
Water canonical rarity = Everywhere
Helium-3 canonical rarity = Special
X-Tech canonical rarity = Unique
legacy SortOrder disappears
Aldumite parent changes
```

Do not implement X-Tech Planned Supply placement yet unless the migration itself strictly requires a neutral classification seam.

---

# PART M — SEARCH / LOCALIZATION COMPATIBILITY

## 24. Search catalogue

The newly implemented Search for Items uses the runtime reference catalogue.

Audit whether swapping the dictionary source will:

```text
add unwanted hidden resources to Search
change abbreviations
change localized names
change stable IDs
change deterministic ordering
```

Recommend tests to prevent accidental behavior.

---

## 25. Localization

Canonical source names should be treated as canonical/fallback reference text.

Existing locale overlays should remain keyed by stable identity.

Audit whether current `referenceNames.ts` logic needs changes for the canonical dictionary.

Do not regenerate stable IDs from localized names.

---

# PART N — PERSISTENCE / IMPORT COMPATIBILITY

## 26. Existing saved networks

Audit all persisted places that may contain resource IDs:

```text
local resources / selected resources
production routes
manufacturing dependencies if persisted
cargo exports/imports
Planned Supply
validation context
history snapshots during a session
```

Determine whether the reference-data replacement can be made without schema migration.

Preferred outcome:

> no persisted network schema change merely to replace the source dictionary.

If a migration is genuinely required, explain why.

---

## 27. Unknown legacy states

Preserve the established resilience principle:

> Existing unknown/stale user selections remain recoverable and are validated rather than silently destroyed.

Do not propose destructive cleanup of saved networks merely because a canonical resource is excluded or renamed.

---

# PART O — TEST / INVARIANT AUDIT

## 28. Recommend source/build invariants

The eventual implementation should likely validate:

```text
FormID uniqueness
EditorID uniqueness where expected
one stable app ID per included canonical resource
parent FormID resolves
no parent cycles
expected family roots/branches
runtime stable IDs preserved
included/excluded policy explicit
canonical names/short names non-empty where required
rarity values recognized or explicitly mapped
hidden resources do not leak into runtime UI
```

Audit which checks already exist and which should be added.

---

## 29. Golden compatibility checks

Recommend concrete regression controls, including at least:

```text
Aluminum/Aluminium
Aldumite parent = Caesium
Carboxylic Acids short name = R-COOH
Water special canonical rarity handling
Helium-3 special canonical rarity handling
X-Tech canonical record exists
Aqueous Hematite inclusion/exclusion decision enforced
Caelumite inclusion/exclusion decision enforced
existing app IDs unchanged
legacy saved network resource IDs still resolve
```

---

# PART P — QUESTIONS THE AUDIT MUST ANSWER

The final audit report must explicitly answer:

1. Which files/functions currently consume `reference-source/inorganic-resource-dictionary.csv`?
2. Which runtime fields are derived from each legacy column?
3. How are stable resource IDs currently generated?
4. Can every existing stable resource ID be preserved while adopting canonical FormIDs?
5. What should be the canonical crosswalk key: FormID, EditorID, or another field?
6. Which canonical columns should remain source-only vs appear in runtime reference data?
7. Which canonical records should be included, specially included, or excluded from the tracker catalogue?
8. What should happen to Aqueous Hematite?
9. What should happen to Caelumite?
10. Can X-Tech be included in the reference catalogue now without implementing X-Tech behavior yet?
11. How should canonical `Everywhere` and `Special` rarity values be represented?
12. Does runtime rarity need a new type or a separate tracker presentation classification?
13. Where is the Aldumite parent relationship consumed, and what changes when it moves from Xenon to Caesium?
14. Which code currently depends on `SortOrder`?
15. What explicit presentation-order policy should replace the non-canonical sort field?
16. Can occurrence mapping move from English-name aliasing to FormID-based joins?
17. What happens to the current Aluminum → Aluminium build alias?
18. How do recipes resolve ingredients, and does that need adjustment?
19. Will Search or Planned Supply accidentally expose hidden canonical resources?
20. Does this migration require a persisted-network schema migration?
21. What tests/invariants are required before deleting/retiring the old legacy CSV contract?
22. What exact files are likely to change during implementation?
23. What is the safest implementation sequence?
24. Are there any unresolved source-data questions that should block implementation?
25. What prerequisites remain before the separate X-Tech feature audit/implementation?

---

# PART Q — REQUIRED AUDIT OUTPUT

Write:

```text
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
```

Use these sections:

## 1. Executive conclusion

State whether the legacy dictionary can be retired safely and the recommended migration shape.

## 2. Current legacy dependency map

Actual files/functions and what each consumes.

## 3. Canonical extract inventory

Summarize actual columns, record counts, new records, renamed/changed values, and source provenance.

## 4. Stable identity strategy

Explain app IDs vs canonical FormIDs/EditorIDs/names.

## 5. Canonical-to-runtime transformation

Show the recommended build data flow.

## 6. Inclusion/exclusion policy

Explicit recommendation for:

```text
ordinary inorganic resources
X-Tech
Aqueous Hematite
Caelumite
```

## 7. Rarity strategy

Explain source rarity vs tracker/runtime presentation classification.

## 8. Parent/family migration

Document the corrected tree and downstream consequences.

## 9. Sort-order replacement

Identify all consumers and recommended explicit presentation rules.

## 10. Occurrence-data crosswalk

Explain biome/atmosphere mapping and Aluminum/Aluminium cleanup.

## 11. Recipe compatibility

Explain ingredient resolution changes, if any.

## 12. Planned Supply / Search / localization impact

Explain visible behavior risks and containment.

## 13. Persistence/import compatibility

State whether schema migration is required and how old IDs remain valid.

## 14. Validation and build invariants

List exact checks to add/preserve.

## 15. Testing plan

Separate:

```text
source/build tests
domain/reference tests
persistence compatibility tests
manual browser checks
```

## 16. Likely implementation files

List actual paths.

## 17. Recommended implementation sequence

Provide a low-risk staged order.

## 18. Risks / blockers / open questions

Only genuine unresolved matters.

## 19. X-Tech readiness after migration

State what will remain to be designed after the canonical dictionary is in place.

---

# PART R — OUT OF SCOPE

Do not:

```text
implement code
replace the CSV yet
modify source files
modify generated JSON
change stable IDs
change persisted network schema
implement X-Tech row behavior
implement X-Tech character buffs
change Planned Supply UI
change Search UI
change localization strings
change validation behavior
invent gameplay facts not supported by source data
commit
push
```

This is an audit only.

---

# PART S — VERIFICATION

Because this is a read-only audit:

- do not modify product code;
- do not commit or push;
- `git diff --check` / `git status --short` may be used if useful;
- full tests/build/lint are not required unless needed to establish an architectural fact.

Report what was and was not run.

---

## Final instruction

Audit the repository and supplied canonical resource dictionary so that the handmade legacy dictionary can be retired **without destabilizing existing stable IDs, saved networks, localization, occurrence joins, Planned Supply, Search, or resource-family behavior**.

The guiding rule is:

> **Canonical extracted data owns source truth; the tracker owns inclusion policy and presentation order; existing persisted application identities remain stable unless there is an unavoidable compatibility reason to migrate them.**
