# CODEX IMPLEMENTATION BRIEF — Planet-Level Organic Farming Eligibility

## Objective

Implement the **OFARM-B** correction defined by:

```text
docs/audits/ORGANIC-FARMING-PLANETARY-ELIGIBILITY-REVIEW.md
```

The current tracker incorrectly requires a domesticable flora/fauna producer to occur in the outpost's selected biome before allowing its organic resource to be farmed.

The confirmed game rule is:

```text
Organic farming eligibility is planet-level.

A species may be farmed at any outpost on a body where that species exists,
provided that exact species is domesticable/farmable and has the harvested resource.

Biome occurrence does not gate farming.
```

This applies equally to:

```text
flora / greenhouse production
fauna / animal husbandry production
```

Planet membership remains required.

Domesticability remains required.

Exact producer identity remains meaningful.

Biome occurrence data remains valid natural-world reference information and must not be removed.

This is a **HIGH-priority pre-release correctness fix**.

---

## 1. Authoritative rule

For a specific organic farming route:

```text
valid =
  producer belongs to selected body
  AND producer is domesticable
  AND producer has a resolved harvested resource
  AND route speciesId matches that producer
  AND route resourceId matches that producer's resource
```

The selected outpost biome is **not** part of this predicate.

Do not implement:

```text
species occurs in selected biome
```

as a prerequisite for greenhouse or husbandry production.

---

## 2. Baseline

Work from the current committed `staging` branch.

Before editing, record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
docs/audits/ORGANIC-FARMING-PLANETARY-ELIGIBILITY-REVIEW.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
README.md
```

Then inspect all affected domain, UI, validation, localization, and test files before changing them.

Do not modify the supplied implementation brief.

No commit, push, deployment, tag, release, repository-publication, or remote-state operation is authorized.

---

## 3. Preserve the existing data architecture

The current generated/reference-data split is correct and must remain:

```text
organicOccurrences
    = natural biome occurrence

planetSpecies
    = body-level producer facts:
      bodyId
      speciesId
      sourceClass
      domesticable
      resourceId

species
    = producer identity/type/display data

organicFarmingProfiles
    = input requirements by source class
```

Do not:

```text
change reference-source grain
regenerate reference assets merely for this logic fix
add a new farming index
change reference JSON schemas
change manifest structure
change loader types
remove organicOccurrences
```

The audit concluded that the existing runtime data is sufficient.

---

## 4. Introduce an explicit planetary organic farming helper

Create or rename toward a semantically explicit helper such as:

```ts
getPlanetaryOrganicFarmingRoutes(referenceData, bodyId)
```

The exact name may differ if repository conventions strongly favor another form, but it must clearly communicate:

```text
planet/body-level
organic
farming eligibility
```

It must derive exact producer routes from `referenceData.planetSpecies`.

At minimum require:

```text
entry.bodyId === bodyId
entry.domesticable === true
entry.resourceId !== null
```

Return/preserve one route per exact:

```text
speciesId + resourceId
```

Do not collapse distinct producers that yield the same resource.

Do not consult selected biome IDs or `organicOccurrences` for this farming predicate.

---

## 5. Add an exact-route eligibility predicate

Introduce or rename toward a helper such as:

```ts
isOrganicFarmingRouteEligibleOnBody(...)
```

for validation and activation of an existing route.

It must validate the exact persisted producer:

```text
bodyId
speciesId
resourceId
domesticable
```

Another valid producer of the same resource must **not** rescue an invalid specific producer.

Example:

```text
Producer A → Polymer, valid on body
Producer B → Polymer, wrong body/non-domesticable

Persisted route uses Producer B
→ INVALID

The existence of Producer A must not make Producer B valid.
```

---

## 6. Correct `getAvailableOrganicProductionRoutes`

The audit identified this as the primary incorrect gate.

Change it so organic farming routes are derived from:

```text
selected body
+ planetSpecies
+ domesticable
+ resolved resource
```

and not from:

```text
effective selected biome scope
+ organicOccurrences
```

If the current helper name implies biome-specific behavior, rename it if doing so materially improves clarity.

Avoid unnecessary API churn if the existing name remains accurate after correction.

---

## 7. Keep inorganic availability biome-sensitive

This correction is organic-only.

Do not weaken or rewrite the inorganic behavior of:

```text
getEffectiveBodyBiomeIds
getOutpostAvailableInorganicResourceIds
isProductionRouteAvailable
```

except where a shared function must branch explicitly by route type.

Expected split:

```text
inorganic route
→ selected/effective biome rules remain

organic route
→ selected body + exact domesticable producer
```

Add explicit tests protecting this separation.

---

## 8. Correct exact-route activation

The audit identified an adjacent issue in:

```text
src/domain/resourcePresence.ts
```

`canActivateProductionRoute` currently reduces an organic route to resource-level presence.

Change organic activation to check the exact producer route.

Do not allow:

```text
another species producing the same resource
```

to authorize activation of an invalid specific route.

Keep downstream resource-level collapsing where it is already semantically appropriate, such as active produced-resource IDs, cargo, or Planned Supply.

---

## 9. Production-facing biome signature

The production-facing biome grouping/signature currently incorporates domesticable organic occurrence differences.

Correct it so the production-facing signature is **inorganic-only**.

Natural organic occurrence remains available through `organicOccurrences`, but it must no longer split biome controls merely because different naturally occurring domesticable species live in those biomes.

Do not delete occurrence information.

Do not change the selected-biome data model.

---

## 10. Resource Matrix behavior

Update the Resource Matrix so organic rows/routes are based on planetary farming eligibility.

For a selected outpost body:

```text
all domesticable planet-native producers
with resolved resources
```

should be available regardless of selected biome.

Preserve:

```text
one route choice per exact producer
producer source class/input display
existing active-production semantics
recovery rows for invalid persisted routes
```

The Matrix may union at resource level for resource-level presentation where it already does so, but exact producer routes must remain distinct choices.

---

## 11. Search behavior

Search for Items currently inherits resource presence from the biome-filtered organic path.

Correct the `PRESENT` result so:

```text
organic resource is PRESENT
```

at an outpost when at least one exact domesticable producer for that resource is eligible on the selected body.

Biome occurrence must not affect this result.

Do not change unrelated Search flags.

---

## 12. Organic source/remediation lists

Correct helpers such as:

```text
getDomesticableSourceNames
```

so source lists/remediation consider all eligible producers on the selected body, not only producers found in selected biomes.

For an unspecified organic route, remediation may list all valid domesticable planet-native sources.

For a specific invalid route, do not imply that changing biome will repair it.

---

## 13. Validation

### Active production validity

Update the organic branch of:

```text
activeProductionValidForBody
```

or its shared availability predicate so it validates:

```text
body + exact producer + domesticability + resource
```

without biome.

Wrong body remains invalid.

Non-domesticable producer remains invalid.

Resource mismatch remains invalid.

### Farming inputs

`organicFarmingInputsUnavailable` must run for an otherwise planet-valid route even when that producer does not naturally occur in the selected biome.

Do not suppress its input diagnostic because of biome mismatch.

### Selected-biome structural validators

Leave validators for:

```text
unknown biome IDs
duplicate biome IDs
selected biome valid for body
```

unchanged.

They validate outpost state, not organic farming.

---

## 14. Validation presentation

Current organic invalid-route presentation can recommend supporting biomes.

That is now incorrect.

Update organic validation presentation so invalidity is described in terms of:

```text
producer not valid on this body
producer not domesticable
producer/resource mismatch
```

as appropriate to the existing diagnostic model.

Do not suggest:

```text
change to biome X
```

as remediation for an organic farming route.

Retain existing biome-based remediation for inorganic extraction.

---

## 15. Tooltips and user-facing copy

Organic farming copy that says or implies:

```text
available in selected biome(s)
unavailable in selected biome(s)
harvestable in these biomes
```

must be corrected to planet-level semantics.

Use wording aligned with the established UX/localization style.

Conceptually:

```text
farmable on this planet/body
domesticable producer on this planet/body
```

rather than natural-occurrence wording.

Do not change inorganic biome copy.

---

## 16. Localization

Apply the organic semantic correction across **all supported locale catalogues** through the established localization workflow.

Current supported locales include:

```text
en-US
en-GB
fr-FR
de-DE
it-IT
ja-JP
pl-PL
pt-BR
zh-Hans
es-ES
```

Update:

```text
catalogue entries
exact-copy tests
localization review fixtures
Japanese-specific expectations
```

where they encode the old organic biome-farming meaning.

Do not casually rewrite unrelated translations.

Do not change official proper-name/reference overlays.

---

## 17. Persisted model and schema

Do not change:

```text
organic route shape
selectedBiomeIds
network schema version
browser storage schema
JSON import/export format
migration code
```

unless implementation evidence directly contradicts the audit.

Current organic route shape remains:

```text
{ type, resourceId, speciesId }
```

and the owning outpost supplies `bodyId`.

Biome remains independent persisted outpost state.

---

## 18. Import/export

No importer/exporter format change is required.

Add regression coverage proving:

```text
planet-correct + domesticable + biome-non-native
→ imports structurally as before
→ live validation reports route valid

wrong planet
→ live validation warning

planet-native + non-domesticable
→ live validation warning
```

Round-trip should preserve route and selected biome independently.

---

## 19. Multiple producers

Preserve exact producer identity.

The audit found many body/resource pairs with multiple valid producers, including mixed flora/fauna producers.

Required behavior:

```text
each eligible species remains a separate route choice
resource-level UI may union availability where appropriate
persisted exact route validates its own producer
one invalid producer is not rescued by another valid producer
```

Do not deduplicate routes solely by `resourceId`.

---

## 20. Canonical observed manual checks

Use these user-observed in-game farming combinations as manual acceptance checks.

These are **expected valid body/resource combinations**.

### Flora

#### Archimedes III

```text
Lubricant
Pigment
Sealant
```

#### Codos

```text
Analgesic
Solvent
```

#### Ternion III

```text
Fiber
Metabolic Agent
Pigment
Polymer
Structural
```

### Fauna

#### Archimedes III

```text
NONE
```

#### Codos

```text
NONE
```

#### Ternion III

```text
Nutrient
Polymer
Sealant
Spice
```

Use these as **acceptance checks**, not as replacement reference data.

The implementation should derive them from the checked-in authoritative data.

Do not hard-code these planet/resource combinations.

If the corrected runtime model disagrees with any of these observed checks, stop and report the discrepancy rather than silently changing source/reference data.

---

## 21. Required regression matrix

Add tests for:

1. planet-native + domesticable + selected biome where producer does not occur → **valid/creatable**
2. planet-native + domesticable + selected biome where producer occurs → **valid/creatable**
3. same producer on wrong body → **invalid**
4. planet-native + non-domesticable → **invalid / not offered**
5. body with fauna occurrence but zero domesticable fauna → **no fauna farming choices**
6. equivalent flora cases
7. one selected biome vs several selected biomes vs explicit-all → **same organic farming routes**
8. multiple valid producers of one resource remain separate exact routes
9. invalid same-resource producer is not rescued by a different valid producer
10. farming-input validation runs for cross-biome-valid organic route
11. inorganic resource absent from selected/effective biome remains unavailable
12. import/export round-trip preserves route and biome independently and produces corrected live validation

Use real checked-in reference fixtures where practical.

---

## 22. Specific canonical regression populations

The audit identified:

```text
90 bodies with fauna occurrence but no domesticable fauna
```

Use at least one checked-in canonical example from that population in tests.

The user has supplied:

```text
Archimedes III → no fauna farming
Codos          → no fauna farming
```

as observed acceptance examples.

Use one or both where reference data makes them suitable.

For a positive fauna case, use:

```text
Ternion III
```

and verify the expected resource-level union includes:

```text
Nutrient
Polymer
Sealant
Spice
```

while still preserving the individual exact producer routes beneath that resource-level union.

---

## 23. No source-data hard-coding

Do not solve the issue by adding special cases such as:

```ts
if (body === 'Ternion III') ...
```

or hard-coded resource lists.

The supplied body/resource checks are external observed acceptance evidence only.

The application must continue deriving truth from reference data.

---

## 24. Durable documentation

Update current owner docs identified by the audit.

### `docs/DOMAIN-RULES.md`

Correct the rule that currently defines organic production through effective biome occurrence.

State explicitly:

```text
natural organic occurrence is biome-scoped
organic farming eligibility is planet/body-scoped
```

Update production-facing biome grouping semantics.

### `docs/ARCHITECTURE.md`

Update runtime availability descriptions and Search `PRESENT` semantics while preserving the existing `planetSpecies` / `organicOccurrences` architecture.

### `docs/UX-DESIGN.md`

Clarify that biome controls constrain occurrence-backed inorganic availability, while farmable organic rows are body-level.

### `README.md`

Clarify that organic Matrix choices require a domesticable producer **on the selected planet/body**, not in the selected biome.

### `docs/BACKLOG.md`

Do not rewrite legitimate future biome/occurrence/planner items merely because this farming rule changed.

Historical briefs/audits remain untouched.

---

## 25. Terminology

Prefer explicit terminology:

```text
organicOccurrences
natural biome occurrence
planetSpecies
planet-native producer
planetary organic farming eligibility
domesticable producer
farmable organic resource
```

Avoid introducing ambiguous new identifiers such as:

```text
availableOrganic
validOrganic
```

without scope.

The code should make it difficult to accidentally conflate natural occurrence with farming eligibility again.

---

## 26. Expected files/areas

Likely implementation areas include:

```text
src/domain/bodyResourceAvailability.ts
src/domain/resourcePresence.ts
src/domain/validation/rules/activeProductionValidForBody.ts
src/domain/validation/rules/organicFarmingInputsUnavailable.ts
src/ui/statusTooltips.ts
src/ui/validationPresentation.ts
src/ui/components/OutpostStatusMatrix.tsx  (only if helper contract changes require it)
Search-derived logic/tests
supported locale catalogues
relevant domain/component/localization tests
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
```

Do not assume the list is exhaustive.

Do **not** expect functional changes to:

```text
scripts/biome-reference-data.mjs
generated reference JSON
reference manifests
schema migrations
serializers
import validators
```

unless actual implementation evidence contradicts the audit.

---

## 27. Inorganic isolation proof

Add explicit proof that the organic correction did not make inorganic extraction planet-wide.

At minimum demonstrate:

```text
an inorganic resource absent from the selected/effective biome
remains unavailable
```

after the change.

This is a required regression, not optional polish.

---

## 28. Matrix / Search consistency

For the same outpost:

```text
Matrix organic Present
Search organic PRESENT
organic route choices
exact-route activation
validation
```

must agree on the corrected planetary farming rule.

Add or update tests to prevent those consumers from drifting apart again.

---

## 29. Planned Supply

Do not change Planned Supply catalogue visibility as part of this correction.

Existing behavior remains:

```text
planned item visibility = catalogue concern
retirement/actual availability = active-production concern
```

Newly enabled organic routes may subsequently become active supply and retire matching Planned Supply through the existing behavior.

Do not add special Planned Supply logic.

---

## 30. Reference-data invariants

This fix should not change generated reference artifacts.

Before completion confirm:

```text
no reference-source data changed
no generated runtime reference JSON changed
no reference manifest/hash changed
no provenance artifact changed
```

If a reference build produces differences, investigate and report before accepting them.

---

## 31. Focused manual acceptance

Use the real application to verify at least:

### Archimedes III

```text
Flora:
  Lubricant
  Pigment
  Sealant

Fauna:
  none
```

### Codos

```text
Flora:
  Analgesic
  Solvent

Fauna:
  none
```

### Ternion III

```text
Flora:
  Fiber
  Metabolic Agent
  Pigment
  Polymer
  Structural

Fauna:
  Nutrient
  Polymer
  Sealant
  Spice
```

For each positive planet, select a biome in which at least one tested producer does **not** naturally occur, where the checked-in occurrence data permits that test.

Confirm the route remains offered/valid.

For negative fauna cases, confirm natural fauna occurrence does not by itself create a farming route.

---

## 32. Required focused verification

Run the relevant domain/reference/component/localization tests.

At minimum include tests covering:

```text
bodyResourceAvailability
resourcePresence
active-production validation
organic farming inputs
Matrix
Search
tooltips
validation presentation
localization exact-copy/review assertions
import/export round-trip
```

Run reference verification to prove data remains unchanged where appropriate, but do not regenerate committed data unnecessarily.

---

## 33. Full verification

Run:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run reference:test
npm run reference:verify
npm run build
npm run lint
git diff --check
```

If normal lint is blocked solely by the known ignored:

```text
.local-work/reference-overlay-prototype
```

multiple-TSConfig-root issue, use the established clean-checkout-shaped lint verification and report it.

---

## 34. Stop conditions

Stop and report if:

- `planetSpecies` is insufficient to derive any observed valid combination;
- a supplied observed body/resource acceptance check contradicts checked-in authoritative data;
- correcting eligibility requires a reference schema change;
- correcting eligibility requires a persisted save-schema migration;
- exact producer identity cannot be preserved with the existing route model;
- the correction unexpectedly alters generated reference artifacts;
- a shared availability change weakens inorganic biome restrictions.

Do not silently broaden scope.

---

## 35. Non-goals

Do not:

```text
remove biome occurrence data
change inorganic extraction rules
change outpost selected-biome persistence
change save schema
change import/export format
change reference source grain
add a generated farming asset
hard-code observed planet/resource combinations
change app version
change deployment
change unrelated localization
rewrite historical briefs/audits
commit
push
deploy
```

---

## 36. Success criteria

The blocker is cleared when:

- organic farming routes are derived from body-level `planetSpecies`;
- selected biome has no effect on flora/fauna farming eligibility;
- domesticability remains mandatory;
- exact producer identity is preserved;
- wrong-body routes remain invalid;
- non-domesticable species remain unavailable;
- bodies with fauna but no domesticable fauna expose no fauna farming routes;
- Matrix, Search, activation, validation, tooltips, remediation, and localization agree;
- inorganic biome-sensitive extraction remains unchanged;
- save/import/export formats remain unchanged;
- the observed Archimedes III, Codos, and Ternion III checks pass;
- reference artifacts remain unchanged;
- full verification passes.

---

## 37. Completion report

Report:

1. baseline branch/commit;
2. exact files changed;
3. helper/API changes;
4. old biome-gated logic removed;
5. final planetary organic farming predicate;
6. exact-route activation correction;
7. production-facing biome-signature correction;
8. Matrix behavior;
9. Search behavior;
10. validation/remediation changes;
11. localized-copy changes;
12. multiple-producer handling;
13. save/import/export confirmation;
14. inorganic-isolation result;
15. reference-artifact diff/invariant result;
16. test additions/rewrites;
17. Archimedes III acceptance result;
18. Codos acceptance result;
19. Ternion III acceptance result;
20. focused verification results;
21. full test/component/type/localization/reference/build/lint results;
22. `git diff --check`;
23. confirmation no schema/version/deployment/remote operation occurred.

Suggested commit message:

```text
fix: make organic farming planet-level
```
