# Codex Implementation Brief — Batch 2: Planetary Habitation Validation and Resource Availability Semantics

## Objective

Implement the second reference-semantics batch on top of the completed biome-aware reference-data migration.

Batch 2 has two purposes:

1. add Planetary Habitation minimum-rank validation using the new canonical body reference field; and
2. formalize internal resource-availability semantics so atmospheric, biome, organic, and production-valid resource logic is explicit, reusable, and ready for Batch 3.

This batch should **not** redesign the UI, add biome selection, alter persisted outpost schema, or interpret solar/wind power values.

Codex must **not commit or push**.

---

# 1. Read first

Before changing code, read and follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect at minimum:

- `src/domain/referenceData.ts`
- `src/domain/bodyResourceAvailability.ts`
- `src/domain/validation/registry.ts`
- `src/domain/validation/types.ts`
- `src/domain/validation/validateNetwork.ts`
- `src/domain/validation/rules/outpostBodyNotEligible.ts`
- `src/domain/validation/rules/unknownReferenceDataId.ts`
- `src/domain/validation/rules/invalidSkillLevel.ts`
- `src/domain/validation/rules/bodySystemMismatch.ts`
- `src/domain/validation/rules/activeProductionValidForBody.ts`
- relevant App/matrix consumers of resource availability

Preserve repository comment/style conventions.

Do not commit or push.

---

# 2. Planetary Habitation validation

## 2.1 Domain rule

`PlanetaryBodyReference.planetaryHabitationRank` now carries the minimum Planetary Habitation skill rank required to establish an outpost on that body.

Semantics:

```text
0
    body requires no ranks in Planetary Habitation

1..4
    body requires at least that recorded rank

null
    source provides no applicable rank requirement
```

Do not conflate `0` with `null`.

The character's persisted skill value may also be `null`, which means:

> the tracker does not know the character's rank

Unknown character rank must not be interpreted as failure.

## 2.2 New validator

Add a separate validation rule for insufficient Planetary Habitation rank.

Do **not** fold this into `outpostBodyNotEligible`.

Conceptually:

```text
outpost-body-not-eligible
    body cannot support an outpost in principle

planetary-habitation-requirement
    body permits outposts, but the recorded character skill is known
    and below the body's known minimum requirement
```

Use a repository-consistent rule ID/name. Suggested rule concept:

```text
planetary-habitation-requirement
```

### Trigger condition

For each outpost:

1. it has a selected `bodyId`;
2. that body resolves in reference data;
3. the body is otherwise outpost-eligible;
4. `body.planetaryHabitationRank` is non-null;
5. character `planetaryHabitation` rank is non-null;
6. character rank is less than the body's required rank.

Then emit one validation issue.

### Do not emit an issue when

- outpost has no body;
- body reference is unknown;
- body's requirement is `null`;
- character's Planetary Habitation rank is `null`;
- character rank meets/exceeds requirement;
- body is already categorically ineligible for outpost placement and existing body-eligibility validation owns that issue.

Avoid duplicate/overlapping validation.

## 2.3 Severity/message

Use the project's established validator patterns.

This should be a user-correctable configuration/character-capability issue, not a source-data error.

Use an informative message such as:

```text
This outpost requires Planetary Habitation rank 3, but the recorded character rank is 2.
```

or equivalent repository-consistent wording.

If current validation issue structures support context fields, preserve standard outpost/body linkage.

Do not add UI-specific formatting logic in the validator.

---

# 3. Validator interaction review

Explicitly review the new rule against:

- `outpostBodyNotEligible`;
- `unknownReferenceDataId`;
- `invalidSkillLevel`;
- `bodySystemMismatch`;
- `activeProductionValidForBody`.

Required interaction semantics:

### Unknown body

Owned by unknown-reference validation.

Do not emit Planetary Habitation requirement issue.

### Ineligible body

Owned by body-eligibility validation.

Do not emit Planetary Habitation requirement issue.

### Invalid recorded skill value

Owned by invalid-skill validation.

Do not emit an additional misleading Planetary Habitation insufficiency issue from an invalid rank.

If necessary, guard against out-of-range/noncanonical rank values before comparing.

### Valid known body + valid known skill

Only then evaluate rank sufficiency.

---

# 4. Resource availability terminology

Formalize these concepts in domain code/comments/docs.

The end user still needs a simple presentation:

```text
what is available at this outpost
what is being produced at this outpost
```

The richer distinctions are primarily internal so the application can correctly derive results and later explain why something is unavailable.

## 4.1 Body-present resource

A resource is **body-present** if canonical reference data says it occurs somewhere on the body through any valid occurrence path:

- inorganic biome occurrence;
- inorganic atmospheric occurrence;
- organic species/resource occurrence.

This is what the derived `bodyResources` compatibility index represents.

It is not the same as production-valid.

## 4.2 Biome-present inorganic resource

An inorganic resource is biome-present where a canonical inorganic occurrence links it to a specific `BodyBiomeReference`.

This is a location-specific internal fact.

Do not expose biome distinctions in the UI yet.

## 4.3 Atmospheric inorganic resource

An inorganic resource is atmospheric where its occurrence is:

```ts
location.type === 'atmosphere'
```

Semantics:

- atmospheric availability is body-level;
- it is available regardless of future biome selection;
- it is not a separate player-facing resource identity;
- if the same logical resource is present both in a biome and atmospherically, it remains one resource in the UI.

Example desired presentation:

```text
Iron
Alkanes
Chlorine
Nickel
```

not:

```text
Iron
Alkanes
Chlorine
Chlorine (vapor)
Nickel
```

Do not create separate vapor-resource identities or display labels.

## 4.4 Domesticable organic resource

An organic resource is production-eligible through a local organic source where a `PlanetSpeciesReference` on the body:

- has that resource ID; and
- `domesticable === true`.

Non-domesticable species still contribute to body-level natural presence but not to current local organic production eligibility.

## 4.5 Production-valid resource

A resource is production-valid on a body when:

```text
inorganic and body-present
OR
organic with at least one domesticable source on that body
OR
future explicitly supported special production mechanism
```

The existing `getBodyProductionResources()` behaviour should remain the authoritative implementation of this concept unless a better shared lower-level decomposition is introduced.

Do not weaken this rule.

## 4.6 Active production

Active production remains persisted user state:

> the user has marked the resource as being produced at that outpost.

Do not confuse eligibility with active state.

---

# 5. Resource availability helper layer

Refactor or extend `src/domain/bodyResourceAvailability.ts` so the internal distinctions above are available through clear reusable helpers.

Exact function names may differ if repository conventions suggest better names, but aim for equivalent capabilities.

Suggested helpers:

```ts
getBodyPresentResourceIds(...)
getBodyAtmosphericResourceIds(...)
getBodyBiomeResourceIds(...)
getBodyDomesticableOrganicResourceIds(...)
getBodyProductionResources(...)
```

or typed resource-returning variants where appropriate.

Do not add helpers merely to match names in this brief if they create unnecessary duplication. The goal is a coherent domain API.

## 5.1 `getBodyPresentResourceIds`

Should represent all distinct resources known anywhere on the body.

It may use the derived `bodyResources` compatibility index if that is the cleanest authoritative path.

Semantics include:

- biome inorganic;
- atmospheric inorganic;
- organic species resources, including wild-only organic sources.

## 5.2 `getBodyAtmosphericResourceIds`

Derive distinct inorganic resource IDs from atmospheric occurrences for the specified body.

Requirements:

- no duplicates;
- no special renamed resource identity;
- same logical resource can also appear in biome resources.

## 5.3 `getBodyBiomeResourceIds`

Provide body-level access to inorganic biome occurrence resources.

If useful, allow a future-compatible optional body-biome filter, but do **not** introduce outpost biome state.

For example, a helper may support:

```ts
getBodyBiomeResourceIds(referenceData, bodyId)
```

and optionally a body-biome subset if architecturally clean.

Do not implement persisted biome selection.

## 5.4 `getBodyDomesticableOrganicResourceIds`

Return distinct organic resource IDs available from domesticable planet/species sources on the specified body.

Do not infer domesticability from farming inputs.

Use `PlanetSpeciesReference.domesticable`.

## 5.5 `getBodyProductionResources`

Keep this as the authoritative body-level production-eligibility helper.

Prefer implementing it by composing lower-level helpers where that improves clarity.

Required semantics:

```text
production valid =
    all body-present inorganic resources
    UNION
    domesticable organic resources
```

plus any existing explicit special mechanism support.

Current matrix and active-production validator behaviour must not regress.

---

# 6. Atmospheric resource integration

Atmospheric resources were absent from the legacy `planet-all-resources.csv`, so they were not previously visible through the resource matrix.

Batch 1 now includes them in canonical reference data and derived body-level resource presence.

Batch 2 should explicitly verify and formalize their treatment.

Required semantics:

- atmospheric inorganic resources count as body-present;
- atmospheric inorganic resources count as production-valid inorganic resources;
- they participate in the current body-level matrix resource availability;
- no duplicate row is shown if the same resource is also biome-present;
- no special `(vapor)` label or alternate resource identity;
- future biome filtering must not remove an atmospheric resource merely because the selected biome lacks a biome occurrence.

Do not add atmospheric badges, provenance tooltips, or info UI in this batch.

---

# 7. Current UI behaviour

The UI should remain simple and substantially unchanged.

The end user should still see:

```text
resource available here
resource being produced here
```

not the internal provenance path.

Do not add:

- atmospheric labels;
- biome-source labels;
- species-source explanations;
- source badges;
- availability explanation popovers;
- biome selectors.

Internal helper semantics should make future explanations possible, but Batch 2 does not expose them.

---

# 8. No persisted schema changes

Do not modify persisted outpost/network schema.

Do not add `selectedBiomeIds` or any equivalent field yet.

Do not change:

- import/export schema;
- storage migration/version;
- Undo/Redo semantics;
- existing saved network compatibility.

Batch 3 owns biome-aware persisted outpost state.

---

# 9. No solar/wind interpretation

Do not interpret:

- `solarArrayPower`;
- `windTurbinePower`.

These remain canonical raw reference values for future planner/power work.

Do not create:

- efficiency buckets;
- efficiency percentages;
- generator ranking;
- power preference logic.

---

# 10. Tests

Add regression coverage for the new validator and helper semantics.

## 10.1 Planetary Habitation validator

Test:

1. body requirement 0 + character rank 0 -> valid;
2. body requirement 1 + character rank 0 -> issue;
3. body requirement 4 + character rank 4 -> valid;
4. body requirement 4 + character rank 3 -> issue;
5. body requirement null -> no issue;
6. character rank null -> no issue;
7. unknown body -> no habitation issue;
8. categorically ineligible body -> no duplicate habitation issue;
9. invalid skill value -> invalid-skill rule owns it, no misleading habitation insufficiency issue.

Use the actual validation registry/entry point where practical so rule interaction is tested, not just isolated comparison logic.

## 10.2 Atmospheric helper semantics

Test a fixture where one inorganic resource is:

- biome-present only;
- atmospheric only;
- both biome-present and atmospheric.

Verify:

- body-present contains each logical resource once;
- atmospheric helper returns only atmospheric resources;
- production-valid contains atmospheric inorganic resources;
- a resource present via both paths is not duplicated.

## 10.3 Organic helper semantics

Verify:

- wild-only organic appears in body-present;
- wild-only organic does not appear in domesticable-organic helper;
- wild-only organic does not appear in production-valid;
- domesticable organic appears in body-present and production-valid.

Preserve the active-production validator regression tests added in the Batch 1 follow-up.

---

# 11. Documentation updates

## `docs/DOMAIN-RULES.md`

Document:

- Planetary Habitation requirement semantics;
- distinction between rank 0 and null;
- unknown character rank behaviour;
- body-present vs production-valid vs active production;
- atmospheric resources as body-level availability;
- atmospheric + biome occurrence collapsing to one logical player-facing resource;
- domesticable organic production semantics;
- internal provenance distinction vs simple user-facing availability.

## `docs/ARCHITECTURE.md`

Document:

- helper-layer responsibility for availability derivation;
- `bodyResources` as body-presence compatibility/index data;
- `getBodyProductionResources()` as production-eligibility logic;
- atmospheric occurrence preservation;
- no persisted biome state yet.

## `docs/BACKLOG.md`

Keep deferred:

- Batch 3 biome-selection persistence and UX;
- species presentation;
- biome-name disambiguation UI;
- explanation UX for why a resource is unavailable;
- solar/wind efficiency interpretation;
- power planning;
- eventual retirement of compatibility `body-resources.json` if no longer needed.

Do not implement backlog items.

---

# 12. Validation registry

Register the new Planetary Habitation rule in the established validation registry.

Update any documented validator count if the repository tracks it explicitly.

Do not reorder unrelated validators without reason.

Avoid creating duplicate issue categories/messages that overlap existing rules.

---

# 13. Manual/source sanity checks

Use current generated reference data to spot-check known values.

At minimum:

- find a body requiring Planetary Habitation rank 0;
- find one requiring rank 1+;
- verify null requirement bodies do not produce skill warnings;
- verify an atmospheric-only resource appears in body-present/production-valid availability;
- verify a resource present via both biome and atmosphere appears only once;
- verify wild-only organic body presence remains distinct from production eligibility;
- verify Montara Luna or another organic-rich body still produces expected domesticable organic choices;
- verify Shattered Space data remains intact.

Do not alter canonical source files in this batch unless an actual source defect is discovered.

---

# 14. Verification commands

Before completion:

```text
node scripts/build-reference-data.mjs
```

Run the full reference/domain regression-test set.

Then:

```text
npm run lint
npm run build
```

Also perform a browser smoke test.

Verify:

- app loads without console errors;
- body/resource matrix renders;
- atmospheric resources do not duplicate logical rows;
- active-production validation still works;
- Planetary Habitation issue appears only under the intended conditions;
- saved network reload works;
- Undo/Redo behaviour is unchanged.

---

# 15. Scope exclusions

Do **not** implement in Batch 2:

- biome selectors;
- persisted biome selections;
- multi-biome outpost editing;
- species names in matrix;
- fauna/flora presentation;
- atmospheric badges/labels;
- explanation UI;
- solar/wind efficiency;
- generator/power calculations;
- tick-duration modelling;
- organic throughput modelling;
- planner optimisation;
- resource dictionary replacement;
- canonical source extraction changes;
- SFSE/xEdit work.

---

# 16. Implementation quality constraints

- Keep domain semantics out of React components where possible.
- Reuse shared helpers rather than duplicating availability logic.
- Preserve one logical player-facing resource identity regardless of occurrence path.
- Keep atmospheric provenance internally available.
- Keep unknown vs invalid vs insufficient skill states distinct.
- Avoid overlapping validators.
- Preserve lint baseline: zero warnings/errors.
- Do not commit or push.

---

# 17. Codex completion report

When finished, report:

1. files changed;
2. new Planetary Habitation validator rule ID/name/severity;
3. exact validator trigger/guard semantics;
4. availability helpers added/changed;
5. how atmospheric-only and atmosphere+biome resources are handled;
6. how wild-only vs domesticable organic availability is handled;
7. tests added/updated and total passing count;
8. documentation changes;
9. builder result;
10. lint result;
11. production build result;
12. browser smoke-test result;
13. confirmation that persisted schema/import/export/Undo/Redo did not change;
14. any anomalies or assumptions discovered;
15. intentionally deferred Batch 3/power follow-ups.

Do not commit or push.
