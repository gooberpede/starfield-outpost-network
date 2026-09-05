# Codex Implementation Brief — Batch 3: Biome-Aware Outposts and Source-Specific Organic Production

## Objective

Implement Batch 3 of the Starfield Outpost Network reference-data/UI migration.

This batch makes outposts biome-aware and introduces source-specific organic production while preserving the tracker’s core philosophy:

> The user records what is true about the outpost. The app derives availability and validation, but does not silently “fix” invalid or incomplete states that may represent work in progress.

Batch 3 must:

1. add persisted biome selection to outposts;
2. keep existing and new outposts unrestricted by default;
3. filter local resource availability by selected biomes;
4. keep atmospheric inorganic resources available in every biome;
5. render organic resources as one row per domesticable species source;
6. migrate active production from resource IDs to production routes;
7. preserve legacy/invalid organic production through an explicit `organic-unspecified` route;
8. show farming inputs per organic source using the existing manufacturing-input presentation grammar;
9. add biome/source/input validation without hiding invalid persisted state;
10. preserve downstream resource aggregation so cargo/manufacturing/logistics continue to care only about the produced resource, not species identity.

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

- `src/domain/models.ts`
- `src/domain/referenceData.ts`
- `src/domain/bodyResourceAvailability.ts`
- `src/domain/availability.ts`
- `src/domain/logistics.ts`
- `src/domain/history.ts`
- `src/domain/networkEditingSession.ts`
- `src/domain/validation/*`
- `src/data/storage.ts`
- `src/data/serialization.ts`
- `src/App.tsx`
- `src/ui/OutpostDetails.tsx`
- `src/ui/OutpostStatusMatrix.tsx`
- any matrix/input subcomponents
- generated reference-data loader/types
- existing regression tests

Preserve repository conventions for comments and file structure.

Do not commit or push.

---

# 2. Persisted outpost biome state

Add persisted biome selection to each outpost.

Preferred shape:

```ts
selectedBiomeIds: BodyBiomeId[]
```

Exact field naming may follow repository conventions, but semantics must match.

## 2.1 Semantics

```text
[]
    = unrestricted
    = treat the outpost as touching all biomes on the selected body

one or more IDs
    = restrict biome-derived availability to those body-biome occurrences

all body biome IDs explicitly selected
    = functionally equivalent to []
    = preserve the explicit user selection in persistence
```

Do **not** automatically normalize “all selected” back to `[]`.

The user may deliberately choose all buttons. Preserve intent.

## 2.2 Defaults

For:

- migrated legacy outposts;
- newly created outposts;

default:

```ts
selectedBiomeIds: []
```

This preserves existing planetary-availability behaviour.

## 2.3 Changing location

Changing Body must clear `selectedBiomeIds` in the same undoable operation.

Changing System in a way that clears or replaces Body must also clear `selectedBiomeIds` in the same undoable operation.

Do not leave old body-biome IDs attached to a new body during normal UI interaction.

---

# 3. Biome selector UI

Add a horizontal biome-toggle area beside the existing System and Body controls in Outpost Details.

Conceptual layout:

```text
Outpost Title

System                 Body                  Biome
[ Select system... ]   [ Select body... ]   [Biome1] [Biome2] [Biome3] [Biome4]
                                             [Biome5] [Biome6]
```

## 3.1 Layout rules

- System and Body remain stable controls.
- Biome owns a flexible third region.
- Biome buttons wrap within the Biome region.
- Wrapped biome buttons must continue below the first biome-button row.
- They must **not** wrap underneath the System or Body selectors.
- Keep the dense-but-legible tracker style.
- Use existing control sizing and spacing conventions where possible.

Do not redesign unrelated Outpost Details UI.

## 3.2 Toggle semantics

Each button represents one or more `BodyBiomeId`s.

Button off:

```text
none of that button's biome IDs are selected
```

Button on:

```text
all of that button's biome IDs are selected
```

Toggling a grouped button must add/remove all represented biome IDs as one undoable operation.

Biome controls are presentation state over persisted `selectedBiomeIds`; do not create a second independent selection model.

## 3.3 Default visual state

When:

```ts
selectedBiomeIds.length === 0
```

no biome buttons need to appear toggled on.

This visually represents “unrestricted/all biomes” without forcing the user to make a selection.

Do not auto-toggle all buttons merely because the effective result is all biomes.

---

# 4. Biome ordering

Sort body biomes by canonical:

```text
BiomeIndex ascending
```

Use `biomeIndex` as the stable/default ordering because it reflects game-file order.

Do not sort biome buttons alphabetically.

For grouped buttons containing multiple biome IDs, determine the group’s position from the lowest/first member `BiomeIndex`.

---

# 5. Duplicate biome display-name handling

Biome display names are not unique.

Build a UI-level grouping/disambiguation layer for the selected body.

Do **not** change canonical `BiomeReference` or `BodyBiomeReference` identity.

## 5.1 Same display name + same effective biome-dependent signature

If multiple body biomes:

- have the same display name; and
- expose the same effective biome-dependent availability signature;

display **one button** representing all those `BodyBiomeId`s.

Toggling that button selects/deselects all represented IDs.

## 5.2 Same display name + different effective signature

If same-name biomes differ in effective biome-dependent availability, display separate buttons.

Append stable numeric suffixes in `BiomeIndex` order:

```text
Volcanic 1
Volcanic 2
Volcanic 3
```

Numbering is presentation only.

Do not modify canonical biome names.

## 5.3 Signature definition

For grouping same-name biomes, compare the set of:

1. inorganic resource IDs occurring in that biome; plus
2. domesticable organic production routes available in that biome.

Organic routes are source-specific:

```text
resourceId + speciesId
```

not resourceId alone.

Example:

```text
Biome A:
  Sealant from Plant A

Biome B:
  Sealant from Herbivore B
```

These are **different signatures** even though both expose Sealant.

## 5.4 Atmospheric resources excluded from grouping signature

Do not include atmospheric inorganic resources in biome-equivalence comparison.

Atmospheric resources are body-level and available in every biome, so they cannot distinguish biome buttons.

---

# 6. Effective biome selection

Introduce a clear domain helper for effective body-biome scope.

Conceptually:

```ts
getEffectiveBodyBiomeIds(
  referenceData,
  bodyId,
  selectedBiomeIds,
): BodyBiomeId[]
```

Semantics:

```text
selectedBiomeIds = []
    => all valid body-biome IDs for that body

selectedBiomeIds non-empty
    => valid selected IDs belonging to that body
```

Do not silently rewrite persisted invalid IDs inside this helper.

Filtering and validation are separate concerns.

The helper may ignore invalid IDs for derivation while validators report them, provided invalid persisted state remains visible/inspectable elsewhere.

---

# 7. Biome-aware resource availability

Batch 3 changes “available at this outpost” from whole-body availability to effective-biome availability.

## 7.1 Inorganic availability

Available inorganic resources:

```text
inorganic resources occurring in at least one effective selected biome
UNION
atmospheric inorganic resources for the body
```

Atmospheric resources are always available regardless of selected biome subset.

No duplicate logical resource rows.

If Chlorine occurs in a selected biome and atmosphere, show:

```text
Chlorine
```

once.

Do not show:

```text
Chlorine
Chlorine (vapor)
```

## 7.2 Organic availability

Organic source rows are available when:

1. a `PlanetSpeciesReference` exists for the selected body;
2. it is `domesticable === true`;
3. it has a non-null harvested `resourceId`;
4. its species occurs in at least one effective selected body biome.

Each qualifying species/resource route is distinct.

A species occurring in multiple effective selected biomes appears once.

Multiple species yielding the same resource appear as multiple rows.

## 7.3 No selection vs all selection invariant

Add tests proving:

```text
selectedBiomeIds = []
```

and:

```text
selectedBiomeIds = every valid body biome ID
```

produce the same effective resource availability.

This must hold for:

- inorganic availability;
- atmospheric availability;
- domesticable organic routes.

---

# 8. Production-route persisted model

Replace the current resource-ID-only active-production model with an explicit route union.

Preferred shape:

```ts
export type ResourceProductionRoute =
  | {
      type: 'inorganic'
      resourceId: ResourceId
    }
  | {
      type: 'organic'
      resourceId: ResourceId
      speciesId: SpeciesId
    }
  | {
      type: 'organic-unspecified'
      resourceId: ResourceId
    }
```

Exact naming may follow repository conventions, but semantics must match.

## 8.1 Inorganic routes

Inorganic behaviour remains effectively unchanged.

One inorganic resource corresponds to one route.

## 8.2 Organic routes

Organic production is source-specific.

Two distinct species producing the same resource can both be active at once.

## 8.3 Unspecified organic route

Use `organic-unspecified` as an explicit recovery/migration state.

Do **not** invent a fake SpeciesId.

UI display label:

```text
Unspecified
```

is presentation only.

The dummy route:

- has no species reference;
- has no farming inputs;
- does not participate in biome source derivation;
- triggers its own validator;
- persists until the user selects a valid organic source for the same resource.

---

# 9. Persisted schema migration

This is a real persisted-schema migration.

Migrate legacy:

```ts
activeProduction: ResourceId[]
```

to production routes.

## 9.1 Legacy inorganic entry

Known inorganic ResourceId becomes an inorganic route.

## 9.2 Legacy organic entry

Known organic ResourceId becomes:

```ts
{
  type: 'organic-unspecified',
  resourceId,
}
```

Do not arbitrarily choose a species.

## 9.3 Unknown resource IDs

Preserve existing repository behaviour for unknown reference IDs.

Do not discard user state silently.

If migration cannot determine organic/inorganic category because the resource is unknown, use the least destructive repository-consistent recovery strategy and report the decision in the completion summary.

Prefer preserving the entry in a recoverable form rather than dropping it.

## 9.4 Import compatibility

Older exported network JSON must continue to import through the migration path.

New exports use the new route model.

Update schema/version/migration logic appropriately.

Undo/Redo remains snapshot-based and must continue working across new route edits.

---

# 10. Production aggregation boundary

Downstream systems continue to care about resources, not production-route identity.

Add/adjust a helper conceptually like:

```ts
getActiveProducedResourceIds(outpost): ResourceId[]
```

that collapses multiple routes to distinct resource IDs.

Example:

```text
Sealant — Plant A
Sealant — Herbivore B
```

both active:

```text
downstream actual availability = Sealant once
```

Cargo, manufacturing, logistics, Planned Supply retirement, and any other downstream resource-availability consumers must use collapsed resource IDs.

Do not expose `speciesId` to cargo-link or manufacturing logic.

If downstream code begins comparing species IDs, treat that as an abstraction leak.

---

# 11. Resource matrix — inorganic rows

Keep inorganic rows at one row per resource.

Apply biome-aware availability.

Atmospheric resources appear in the same normal inorganic list.

Do not add source/provenance labels for atmosphere.

Existing matrix semantics for Present, Producing, and Logistics should remain consistent, adapted to the new route model.

Toggling Producing for an inorganic row adds/removes the corresponding inorganic route.

---

# 12. Resource matrix — organic rows

Change the organic section from one row per resource to:

> one row per available domesticable species/resource source

Each row represents one production route.

Columns:

```text
Resource | Source | Present | Producing | Inputs | Logistics
```

## 12.1 Resource

Display canonical resource name.

## 12.2 Source

Display `SpeciesReference.name`.

For `organic-unspecified` recovery rows:

```text
Unspecified
```

## 12.3 Present

Represents whether that specific organic source route is locally available under the effective biome selection.

For valid normal source rows:

```text
domesticable
AND species occurs in effective biome scope
```

## 12.4 Producing

Toggles the specific organic production route:

```text
resourceId + speciesId
```

not the resource generally.

Two Sealant rows may have independent Producing states.

## 12.5 Inputs

Show the farming profile corresponding to the route’s `sourceClass`.

Profiles already exist in reference data:

```text
plant
  Water × 1

herbivore
  Water × 1
  Fiber × 2

carnivore
  Water × 1
  Nutrient × 2
```

Do not re-hard-code these values in React.

Resolve through `OrganicFarmingProfileReference`.

Use the same display grammar/component style as manufacturing/fabricator inputs.

For `organic-unspecified`:

- no inputs;
- display the existing empty/no-input convention;
- do not infer a source class.

## 12.6 Logistics

Remain resource-level.

If Sealant is available/produced through multiple species routes, downstream logistics still concern Sealant once.

Do not create species-specific cargo items.

---

# 13. Organic row ordering

Sort normal organic source rows by:

1. source class:
   - plant
   - herbivore
   - carnivore
2. resource name alphabetically;
3. species display name alphabetically as deterministic tie-breaker.

Do **not** sort primarily by species name.

Do not add headings or whitespace between plant/herbivore/carnivore groups.

`organic-unspecified` recovery rows should appear before normal organic rows so unresolved production remains conspicuous.

Within unspecified rows, sort alphabetically by resource name.

Icons/category markers are deferred.

---

# 14. Keep invalid active production visible

This is a critical UX/domain rule.

> Do not remove or hide active production merely because a new biome selection makes the route invalid.

The user may be in the middle of editing the outpost.

Example:

```text
Sealant — Glossy Stickweed
```

is active.

The user changes biome selection so Glossy Stickweed is no longer available.

Required behaviour:

- keep the row visible;
- keep Producing active;
- show Present/availability as invalid/unavailable according to existing matrix grammar;
- validator flags the invalid route;
- user can correct the state manually;
- do not auto-disable production;
- do not auto-change biome selection;
- do not delete the route.

The same principle applies to other invalid/mangled persisted states where practical.

Validation reports invalidity; it does not “repair” user state.

---

# 15. Matrix row derivation for invalid active routes

The normal visible organic rows come from currently available domesticable species routes.

Additionally, merge in any persisted active organic routes that would otherwise disappear because:

- selected biomes no longer contain the species;
- species/body relationship is otherwise invalid;
- route is `organic-unspecified`;
- species reference is unknown/mangled.

This is necessary so invalid active state remains inspectable.

Avoid duplicate rows when an active route is also normally available.

Use stable row identity.

Suggested identities:

```text
inorganic:
  inorganic:<resourceId>

organic:
  organic:<resourceId>:<speciesId>

unspecified:
  organic-unspecified:<resourceId>
```

Do not key rows only by `resourceId`.

---

# 16. Replacing unspecified organic production

When the user activates any valid specific organic route for the same `resourceId`:

```text
organic-unspecified(resource)
```

must be removed in the **same undoable operation**.

If the user later disables that specific route, do **not** recreate the unspecified route.

Once ambiguity has been resolved, keep it resolved unless Undo restores the prior snapshot.

If the user enables multiple valid species routes for the same resource, all may remain active independently.

---

# 17. Biome/reference validation

Add/extend validation for persisted biome integrity.

Avoid overlapping diagnostics.

## 17.1 Unknown biome reference

If a persisted `selectedBiomeIds` entry does not resolve to a known `BodyBiomeReference`, report a reference-integrity issue.

Prefer integrating with the existing unknown-reference family if that architecture is suitable.

Do not silently delete the ID.

## 17.2 Biome/body mismatch

If a selected biome exists but belongs to a different body than the outpost, report a mismatch/integrity issue.

Do not silently remove it.

## 17.3 Duplicate selected biome IDs

Treat duplicate IDs in persisted/imported state as malformed collection state.

Use existing duplicate-collection validation architecture where suitable.

Normal UI toggles should not create duplicates.

## 17.4 All/none equivalence

This is an internal invariant/test, not a user-facing warning.

Do not warn merely because all biomes are selected.

---

# 18. Active production validation becomes biome-aware

Update active-production validation to work on production routes and effective biome selection.

## 18.1 Inorganic route

Valid where the resource is:

```text
present in at least one effective selected biome
OR atmospheric on the body
```

If active inorganic production is no longer supported by effective biome selection, keep state and emit the existing/updated production-validity warning.

## 18.2 Organic route

A valid specific organic production route requires:

- known body;
- known resource;
- known species;
- matching `PlanetSpeciesReference` for body/species;
- route resourceId matches that planet/species harvested resource;
- domesticable = true;
- species occurs in at least one effective selected biome.

If any availability condition fails:

- keep route;
- keep row visible;
- emit validation issue.

Do not auto-remove or remap it.

## 18.3 Unspecified organic route

Do not process through normal organic source/input availability logic.

It has its own validator described below.

---

# 19. Unspecified organic-source validator

Add a dedicated validation rule, conceptually:

```text
unspecified-organic-production-source
```

Use repository-consistent naming.

Severity:

```text
operational warning
```

Trigger for each active `organic-unspecified` route.

Message should clearly explain that the organic resource is recorded as being produced, but no valid flora/fauna source has been specified.

Do not also emit farming-input validation for this route because there is no authoritative source profile.

Unknown resource-reference validation may still coexist if the resourceId itself is invalid.

---

# 20. Organic farming-input validation

Add organic production input validation using the same conceptual rule as manufacturing input validation.

For each active valid specific organic route:

1. resolve the route’s `PlanetSpeciesReference`;
2. resolve `sourceClass`;
3. resolve the matching `OrganicFarmingProfileReference`;
4. evaluate required resource inputs against **actual availability at the outpost**.

Use the same “actual, not planned” semantics as manufacturing validation.

Do not count Planned Supply as satisfying the input requirement unless manufacturing validation already does so.

## 20.1 Per-route validation

Validation is route-specific.

Example:

```text
Sealant — Plant A
    needs Water

Sealant — Herbivore B
    needs Water + Fiber
```

If both are active, validate them independently.

Do not collapse their requirements into a union at resource grain.

## 20.2 Avoid duplicate/confusing issues

If a route is itself invalid because its species is unavailable under selected biomes, avoid piling on misleading missing-input diagnostics where possible.

Prefer validation ownership such that:

```text
invalid/unavailable production route
    -> source/availability warning

valid active production route with missing inputs
    -> input warning
```

Do not report farming-input problems for `organic-unspecified`.

---

# 21. Input presentation

Reuse the existing manufacturing/fabricator Inputs-column presentation grammar/components where possible.

Do not invent a second visual language.

Organic input cells should show the same kinds of:

- ingredient names;
- quantities;
- availability state;

used for manufacturing inputs.

The reference profile provides:

```text
resourceId + quantity
```

Do not hard-code Water/Fiber/Nutrient labels or quantities in the matrix.

---

# 22. Present vs Producing semantics

Keep these distinct.

## Present

Answers:

> Is this route/resource locally available under the current outpost location/biome configuration?

For inorganic rows, Present remains resource-level.

For organic rows, Present is route/source-specific.

## Producing

Answers:

> Has the user marked this production route active?

Do not automatically synchronize one from the other.

An invalid state may intentionally exist:

```text
Present = false
Producing = true
```

and must remain visible for correction.

---

# 23. Downstream actual availability

Update actual-availability derivation so:

```text
active production routes
    ↓
distinct produced resource IDs
```

feed the existing resource-level availability graph.

If any valid or invalid persisted route is marked active, consider carefully whether downstream “actual availability” should continue to treat the resource as produced while validation flags the route.

Preserve existing tracker philosophy:

> persisted user state represents what the user says is happening; validators report contradictions.

Therefore, unless current domain rules explicitly say otherwise, **do not silently remove an active resource from downstream availability solely because its route is invalid**.

This is important for in-progress editing and for avoiding cascading destructive side effects.

Document the chosen behaviour.

---

# 24. Planned Supply interaction

Preserve existing Planned Supply retirement semantics.

If the user activates a valid production route for resource X, planned supply for X should retire using existing resource-level logic.

If multiple source routes for X are active, X is still one downstream resource.

Do not create species-specific Planned Supply entries.

When an unspecified organic route is replaced by a valid route for the same resource, treat this as continued production of the same resource rather than a new cargo identity.

---

# 25. Cargo/logistics interaction

Cargo items remain resource/product identities.

Do not add:

- speciesId to CargoItem;
- source-specific cargo exports;
- separate Sealant cargo entries by species.

Multiple organic production routes collapse to Sealant for:

- cargo pads;
- links;
- imports;
- manufacturing availability;
- Planned Supply;
- logistics matrix state.

---

# 26. Migration and malformed JSON recovery

Use the new route model to improve graceful recovery.

Do not auto-delete invalid references during import/load.

Examples:

### Legacy organic production

Recover as:

```text
Source = Unspecified
Producing = true
```

and warn.

### Unknown species in a new-format organic route

Keep the route visible in an invalid/recovery row if possible.

Do not silently substitute a different species.

### Species belongs to different body

Keep route visible and validate.

### Biome IDs invalid/foreign

Keep persisted IDs; derive effective availability from valid applicable IDs; validate the malformed references.

The general rule is:

> preserve user state where possible; surface contradictions; let the user resolve them.

---

# 27. Undo/Redo

All new user operations must remain conventional one-step semantic actions.

Examples:

- toggle one biome button;
- toggle one grouped biome button representing multiple IDs;
- toggle one inorganic production route;
- toggle one organic source production route;
- replacing `organic-unspecified` with a valid source route;
- changing Body and clearing biome selection.

Each deliberate user action should be one Undo entry.

Collateral state changes required by that action belong in the same history entry.

New edits after Undo must still clear Redo.

---

# 28. Suggested domain helpers

Exact naming may vary, but prefer a coherent domain API rather than component-local filtering.

Possible helpers:

```ts
getEffectiveBodyBiomeIds(...)
getBiomeInorganicResourceIds(...)
getAtmosphericResourceIds(...)
getAvailableOrganicProductionRoutes(...)
getOutpostAvailableInorganicResourceIds(...)
getOutpostAvailableOrganicRoutes(...)
getActiveProducedResourceIds(...)
getOrganicRouteInputs(...)
getBiomeButtonGroups(...)
```

Do not create gratuitous wrappers; the goal is to keep biome logic, route identity, production aggregation, and organic input resolution out of React components where practical.

---

# 29. Tests

Add strong regression coverage.

At minimum cover the following.

## 29.1 Biome persistence/defaults

- migrated outpost gets `selectedBiomeIds: []`;
- new outpost gets `[]`;
- changing Body clears selection;
- changing System/body clears selection appropriately;
- Undo restores prior biome selection.

## 29.2 Effective scope

- `[]` => all body biomes;
- explicit all IDs => same effective resources;
- subset => only subset biome-derived resources;
- atmospheric resource survives every subset.

## 29.3 Duplicate-name grouping

Test:

- same name + identical signature => one grouped button;
- grouped button toggles all represented IDs;
- same name + different inorganic signature => numbered buttons;
- same name + different organic source-route signature => numbered buttons;
- numbering follows BiomeIndex;
- atmospheric differences do not split groups.

## 29.4 Inorganic rows

- biome filtering removes unavailable biome-only inorganic resource;
- atmospheric-only remains;
- biome+atmosphere appears once;
- active invalid inorganic route remains visible and warns.

## 29.5 Organic rows

- one row per domesticable species/resource route;
- same resource from multiple species => multiple rows;
- one species in multiple selected biomes => one row;
- non-domesticable species does not create normal production row;
- ordering: plant, herbivore, carnivore; resource alpha; species alpha tie-break.

## 29.6 Organic production routes

- two species producing same resource can both be active;
- toggling one does not toggle the other;
- downstream produced resource IDs collapse duplicates;
- disabling one route leaves resource available downstream if another remains active.

## 29.7 Migration

- legacy inorganic ResourceId -> inorganic route;
- legacy organic ResourceId -> organic-unspecified;
- old exported network still imports;
- new export/import round-trip preserves routes and biome IDs.

## 29.8 Unspecified route

- displayed as `Unspecified`;
- no inputs;
- dedicated validator fires;
- enabling valid same-resource organic route removes unspecified in same operation;
- disabling later valid route does not recreate unspecified;
- Undo restores unresolved state.

## 29.9 Input validation

- plant route gets Water profile;
- herbivore gets Water + Fiber;
- carnivore gets Water + Nutrient;
- validation uses actual availability;
- Planned Supply alone does not satisfy if manufacturing semantics say it does not;
- unspecified route does not receive input warning;
- unavailable/invalid source route does not receive misleading extra input warnings if validator ownership suppresses them.

## 29.10 Invalid persisted biome/source state

- unknown biome ID warns and remains persisted;
- foreign-body biome warns and remains persisted;
- duplicate selected biome IDs warn;
- unknown species route remains inspectable;
- species/body mismatch warns;
- invalid route remains visible even when unavailable.

## 29.11 Downstream compatibility

- cargo exports still use resource IDs;
- manufacturing sees produced Sealant once regardless of one or multiple active species routes;
- Planned Supply retirement remains resource-level;
- existing inorganic-only networks behave as before after migration.

---

# 30. Documentation updates

Update durable docs.

## `docs/DOMAIN-RULES.md`

Document:

- `selectedBiomeIds` semantics;
- empty vs explicit-all equivalence;
- atmospheric availability across all biomes;
- grouped duplicate-name biome controls;
- production-route identity;
- organic source-specific production;
- downstream resource-level collapse;
- `organic-unspecified` recovery semantics;
- invalid active routes remain visible;
- organic farming profiles/input validation;
- route-specific Present/Producing semantics.

## `docs/ARCHITECTURE.md`

Document:

- persisted schema migration;
- biome selection ownership;
- route union;
- matrix row identity;
- aggregation boundary between routes and resource-level logistics;
- domain-helper responsibilities;
- recovery/validation rather than auto-repair.

## `docs/UX-DESIGN.md`

Add settled UX conventions:

- optional biome selection;
- wrapping toggle-button region beside System/Body;
- no selected buttons = unrestricted/all biomes;
- duplicate-name grouping/disambiguation;
- organic source names in Source column;
- source-specific organic rows;
- plant/herbivore/carnivore ordering;
- invalid active state remains visible/inspectable;
- unspecified source presentation.

## `docs/BACKLOG.md`

Remove completed Batch 3 items and retain future items such as:

- icons for plant/herbivore/carnivore;
- provenance/explanation UI;
- solar/wind efficiency;
- power planning;
- planner optimisation;
- eventual deeper source-data replacements;
- any intentionally deferred biome UX polish.

---

# 31. Scope exclusions

Do **not** implement in Batch 3:

- plant/herbivore/carnivore icons;
- atmospheric badges or `(vapor)` labels;
- provenance/info popovers;
- solar/wind efficiency;
- generator/power calculations;
- tick-duration modelling;
- throughput quantities;
- production rates;
- planner optimisation;
- automatic biome detection;
- map integration;
- source extraction changes;
- resource dictionary replacement.

---

# 32. Manual smoke tests

After automated tests, manually verify at minimum:

1. an existing migrated outpost opens with no biome buttons selected and unchanged planetary availability;
2. selecting one biome narrows biome-derived resources;
3. clearing all biome selections restores whole-body availability;
4. selecting every biome produces the same availability as none;
5. atmospheric-only resource remains visible regardless of biome selection;
6. a same-name/same-signature biome group behaves as one button if current canonical data provides an example;
7. a same-name/different-signature case shows stable numbered buttons if current canonical data provides an example;
8. Montara Luna or another organic-rich body shows source-specific organic rows;
9. a common resource with multiple domesticable species shows multiple rows;
10. plant/herbivore/carnivore input cells display correctly;
11. two species routes for the same resource can both be active;
12. cargo/manufacturing still see one resource identity downstream;
13. making an active route unavailable through biome changes leaves the route visible and produces a validation warning;
14. legacy organic production appears as `Unspecified`;
15. choosing a valid source removes `Unspecified`;
16. Undo restores the previous state;
17. no console errors;
18. saved reload/import/export work.

If current reference data lacks a convenient real-world case for one grouping edge case, use regression fixtures rather than altering canonical data.

---

# 33. Verification commands

Run:

```text
node scripts/build-reference-data.mjs
```

Run the full regression suite, including all Batch 1/2 tests.

Run:

```text
npm run lint
npm run build
git diff --check
```

Perform browser smoke tests.

Do not leave temporary browser-test edits in the user's saved localhost network. Restore test state before completion.

---

# 34. Implementation quality constraints

- Preserve canonical IDs; never key by display name.
- Keep biome grouping as presentation/domain derivation, not canonical data mutation.
- Keep organic production route-specific.
- Keep downstream cargo/manufacturing/logistics resource-level.
- Reuse reference farming profiles; do not hard-code profile inputs in UI.
- Do not auto-fix invalid persisted states.
- Keep invalid active routes visible.
- Keep validator ownership clean and non-overlapping.
- Keep React focused on rendering/interactions; place derivation logic in domain helpers.
- Maintain zero lint warnings/errors.
- Do not commit or push.

---

# 35. Codex completion report

When finished, report:

1. files changed/added/deleted;
2. persisted schema/version change and migration behaviour;
3. final production-route type;
4. biome-selection persistence semantics;
5. biome grouping/disambiguation implementation;
6. resource-filter derivation;
7. atmospheric behaviour;
8. organic row derivation and sort order;
9. Source and Inputs column behaviour;
10. unspecified organic recovery behaviour;
11. validators added/changed;
12. downstream resource aggregation changes;
13. tests added/updated and total passing count;
14. legacy import/export compatibility result;
15. builder result;
16. lint result;
17. production build result;
18. `git diff --check` result;
19. browser smoke-test result;
20. confirmation test edits were restored;
21. any anomalies or assumptions discovered;
22. intentionally deferred follow-ups.

Do not commit or push.
