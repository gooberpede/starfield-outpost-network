# X-Tech Support Architecture Audit

## 1. Executive conclusion

First-class X-Tech support fits the current architecture cleanly as a narrow
exception to resource presence. It does not require a new resource category, a
new production-route type, a new supply source, or a new history mechanism.
The safest target shape is:

```ts
interface CharacterCapabilities {
  xTechExtraction: boolean
}

interface Character {
  name: string
  level: number | null
  skills: CharacterSkills
  capabilities: CharacterCapabilities
}

interface Outpost {
  // existing fields...
  explicitResourcePresence: ResourceId[]
}
```

`xTechExtraction` should be a required, typed boolean in the normalized domain
model and should default to `true`. `explicitResourcePresence` should be a
deduplicated collection of stable resource IDs. It should not use `CargoItem`,
because the field can contain resources only and does not describe cargo or
supply.

These are persisted semantic fields and should advance the network schema from
3 to 4. The existing central `migrateNetworkData()` path can materialize
`capabilities: { xTechExtraction: true }` and
`explicitResourcePresence: []` for older networks. The collection envelope can
remain schema 1 because collection loading and collection import already pass
each nested network through the network migrator. Serialization and browser
storage need no special encoding beyond that migration work.

Add one domain module, preferably `src/domain/resourcePresence.ts`, to own:

- which resource IDs use explicit rather than ordinary recorded presence;
- whether a resource is Present at an outpost;
- whether the character capability permits adding/activating an explicit
  resource;
- the inorganic IDs that should be represented by the Matrix;
- the distinction between Present and realized production.

The only X-Tech identity knowledge outside build-time tracker policy should be
centralized in that module (for example, one typed `X_TECH_RESOURCE_ID` constant
and one capability mapping). Matrix, Search, validation, and application edit
handlers should consume its predicates rather than each comparing the string
`'x-tech'`.

The existing route `{ type: 'inorganic', resourceId: 'x-tech' }` already has the
right identity and downstream behavior. `getActiveProducedResourceIds()`, actual
availability, provenance, Planned Supply retirement, cargo eligibility,
imports, exports, and Search `PRODUCING` all operate on opaque stable IDs and
therefore need no X-Tech-specific production model.

Runtime enablement should add a distinct tracker disposition such as
`special-enabled`. Treating X-Tech as `ordinary` would blur the policy boundary
between occurrence-backed resources and this exceptional mechanism. Emit it as
an inorganic `ResourceReference` with `rarity: 'unique'`, no parent,
`plannedSupplyPlacement: 'special'`, and order 3, after the existing Helium-3
(1) and Water (2). Keep Aqueous Hematite and Caelumite `excluded`; the build
must continue to omit them.

There is one terminology conflict to resolve before implementation. Current
code and the earlier Search design define an ordinary inorganic Matrix
`Present` state as the user-recorded `outpost.localResources` value, while
canonical occurrence determines whether the row is a plausible choice. Parts
7 and the final diagram in the current brief can be read as saying occurrence
alone should light `Present`. That literal interpretation would broadly change
ordinary Matrix toggles and Search results, which the brief otherwise says not
to change. This audit therefore recommends the compatibility interpretation:

```text
ordinary row eligibility/potential presence -> canonical occurrence
ordinary recorded Present                  -> outpost.localResources
X-Tech row eligibility and Present          -> explicitResourcePresence
realized supply                              -> active production/imports
```

If occurrence alone is intentionally meant to replace `localResources` as the
ordinary `PRESENT` fact, that is a separate domain/UX change and should be
confirmed explicitly before implementation. It is not necessary for X-Tech.

## 2. Current resource-presence architecture

Canonical inorganic source truth follows this path:

```text
reference-source/inorganic-resource-dictionary.csv
        +
reference-source/inorganic-resource-tracker-policy.csv
        +
reference-source/biome-inorganic-resources.csv
        ↓
scripts/inorganic-resource-data.mjs
scripts/build-reference-data.mjs
        ↓
public/reference-data/resources.json
public/reference-data/inorganic-occurrences.json
public/reference-data/body-resources.json
        ↓
src/data/referenceDataLoader.ts
        ↓
ReferenceData
```

The canonical X-Tech row is currently exact and unambiguous:

```text
SourceFile:            SFBGS00D.esm
ResourceFormID:        01033E3F
ResourceEditorID:      Y2_Res_X-Tech
ResourceName:          X-Tech
ResourceShortName:     XT
SNAMRarity:            Unique
ClassificationKeyword:Y2_X-Tech_Resource_Keyword
parent:                none
```

The tracker policy reserves stable ID `x-tech`, maps it to tracker rarity
`unique`, and currently marks it `special-deferred` with hidden Planned Supply
placement. `buildInorganicResources()` emits only `ordinary` policy rows, has a
golden invariant of exactly the existing 45 inorganic IDs, and requires the
special strip to contain exactly Helium-3 and Water. Consequently X-Tech is not
present in `public/reference-data/resources.json`; neither are excluded Aqueous
Hematite or Caelumite.

Ordinary inorganic Matrix behavior currently has two layers:

1. `getOutpostAvailableInorganicResourceIds()` derives occurrence-supported IDs
   from selected body biomes plus body-wide atmospheric occurrences.
2. `OutpostStatusMatrix` builds rows from those IDs plus persisted inorganic
   active routes. It lights the editable Present control from
   `outpost.localResources` and disables inactive production until Present is
   recorded.

This means occurrence currently answers “may be represented at this location,”
whereas `localResources` answers “the user recorded it as Present.” The tooltip
API makes the distinction explicit with `recordedPresent` and
`potentiallyPresent` parameters.

Organic presence is route-specific. `getAvailableOrganicProductionRoutes()`
uses selected biome, species occurrence, planet/species facts, and
domesticability. It should not be folded into X-Tech's explicit inorganic
mechanism.

Search currently defines inorganic `PRESENT` as membership in
`outpost.localResources`, organic `PRESENT` as the existence of an available
source-specific route, and `PRODUCING` through
`getActiveProducedResourceIds()`. The predicate lives in
`src/domain/itemSearchResults.ts`, so it is already domain-level but is too
Search-specific to become the shared Matrix seam without extraction.

Present is not realized supply. `src/domain/availability.ts` starts real
resource supply from active production and inbound cargo. It never adds
`localResources`. `src/domain/provenance.ts` likewise considers an active
production route local provenance and never treats mere presence as a source.
Those boundaries are correct for X-Tech and should remain unchanged.

## 3. Character capability model

Character state is modeled by `Character` and `CharacterSkills` in
`src/domain/models.ts`, created by `createDefaultNetwork()` in
`src/domain/defaults.ts`, migrated by `migrateCharacter()` in
`src/data/networkMigration.ts`, and copied to a new universe by
`appendNetworkFromLatestCharacter()` in `src/data/networkCollection.ts`.

Use a typed object, not an open-ended string/boolean bag:

```ts
export interface CharacterCapabilities {
  xTechExtraction: boolean
}

export interface Character {
  name: string
  level: number | null
  skills: CharacterSkills
  capabilities: CharacterCapabilities
}
```

This mirrors `CharacterSkills`, keeps property access type-safe, and makes
invalid imported values rejectable. Do not overload skills: X-Tech extraction
is a capability/buff and the brief explicitly anticipates research, magazine,
and other effects that are not skill ranks.

Defaults should be applied as follows:

- New networks: `createDefaultNetwork()` materializes
  `{ xTechExtraction: true }`.
- New universes copied from the latest character: copy the complete
  `capabilities` object with a new object identity, just as skills are copied.
- Reset networks: inherit the default constructor and therefore reset the
  capability to `true`, consistent with current reset behavior for all
  character fields.
- Stored/imported schema 1–3 networks: `migrateCharacter()` materializes the
  missing container with `xTechExtraction: true`.
- Schema-4 networks: require `capabilities` to be a record and
  `xTechExtraction` to be boolean; preserve `false` exactly.

The network schema should advance to 4 because absence is not equivalent to a
normal JavaScript boolean default: this first capability defaults to `true`,
and a future reader must distinguish “old schema omitted the field” from “new
schema explicitly disabled it.” Supplying defaults only in React or through
optional chaining would make persistence semantics ambiguous.

The capabilities container prevents repeated reshaping of `Character`, but it
cannot safely promise that future persisted capabilities never require schema
work. A future field whose absence has a well-defined false/unknown meaning may
be optional; a field with a non-absence-equivalent default should receive an
explicit migration and, normally, a schema bump. That controlled churn is safer
than an untyped bag or silent reader defaults.

No Character UI should be added in this parcel. App-level capability checks
should read the normalized domain field only.

## 4. Explicit resource presence model

Place `explicitResourcePresence` directly on `Outpost`, beside
`localResources` and before `activeProduction`:

```ts
interface Outpost {
  // identity and location...
  localResources: ResourceId[]
  explicitResourcePresence: ResourceId[]
  activeProduction: ResourceProductionRoute[]
  // remaining fields...
}
```

This is persisted outpost fact, not character state, reference data, or
presentation state. Its identity type should be `ResourceId[]`:

- a `CargoItem` union is unnecessarily broad and would permit products;
- copied `ResourceReference` records would violate the reference-data
  boundary;
- booleans such as `hasXTech` would make every future exceptional resource a
  schema property;
- a vague `specialResources` object would mix unrelated mechanisms.

Keep the field resource-generic at the storage level but narrowly interpreted
through the explicit-presence policy in `resourcePresence.ts`. Today that policy
contains only X-Tech. Do not let arbitrary entries in this array bypass normal
organic source identity or ordinary occurrence rules merely because a hand-edited
file contains them.

New outposts and migrated existing outposts should materialize an empty array.
Migration should retain every string, including unknown IDs, and should not
deduplicate or repair imported state. Normal edit helpers should prevent adding
duplicates; `duplicateCollectionEntriesRule` should diagnose duplicates, and
`unknownReferenceDataIdRule` should diagnose unknown IDs in this new collection.
This matches the repository's preservation-first import philosophy.

Serialization and browser storage need no custom representation. The field is
ordinary JSON, and `serializeNetwork*()` already serializes the complete object.
`migrateNetworkData()` must explicitly read/filter string values so malformed
non-string entries do not enter the normalized model while recoverable IDs are
preserved.

## 5. Unified Present semantics

Create `src/domain/resourcePresence.ts` rather than extending
`bodyResourceAvailability.ts` into player-state ownership. The latter currently
has a coherent responsibility: interpreting canonical biome, atmosphere, and
species occurrence facts. The new module should combine those reference facts
with persisted outpost facts.

Recommended public seams are conceptually:

```ts
export const X_TECH_RESOURCE_ID: ResourceId = 'x-tech'

export function usesExplicitPresence(resourceId: ResourceId): boolean

export function hasExplicitResourcePresence(
  outpost: Outpost,
  resourceId: ResourceId,
): boolean

export function isResourcePresentAtOutpost(
  resourceId: ResourceId,
  outpost: Outpost,
  referenceData: ReferenceData,
): boolean

export function canAddExplicitResourcePresence(
  character: Character,
  resourceId: ResourceId,
): boolean

export function canActivateProductionRoute(
  character: Character,
  outpost: Outpost,
  route: ResourceProductionRoute,
  referenceData: ReferenceData,
): boolean
```

The central explicit-resource/capability mapping can be a typed private map in
this module. It should be the one runtime location that knows X-Tech needs
`xTechExtraction`; callers should ask questions rather than repeat ID tests.

For compatibility with the current Matrix and Search contract,
`isResourcePresentAtOutpost()` should resolve:

- ordinary inorganic: `outpost.localResources.includes(resourceId)`;
- explicit-presence resource: corresponding membership in
  `outpost.explicitResourcePresence`;
- organic: an available source-specific route exists in the current body/biome
  scope.

The module may also expose a Matrix-row helper that unions occurrence-supported
inorganic IDs, recognized explicit-present IDs, and persisted active inorganic
routes. This keeps recovery rows visible while preventing capability alone from
creating a row or a Search `PRESENT` flag.

Consumers that should change are:

- `OutpostStatusMatrix.tsx`: row membership, Present state, add-affordance
  visibility, and production enablement;
- `itemSearchResults.ts`: remove its local presence predicate and import the
  shared one;
- `activeProductionValidForBody.ts`: distinguish ordinary occurrence-backed
  routes from explicitly present routes so X-Tech is not reported as missing
  from every biome;
- new X-Tech validation rules: capability and explicit-presence consistency;
- `App.tsx` and/or pure edit helpers: enforce capability on add/activation as a
  domain/application guard in addition to UI hiding.

Actual availability, provenance, logistics, and Planned Supply should not call
the Present resolver. They correctly depend on active production/imports or
planned intent, not on mere presence.

## 6. X-Tech production integration

The existing discriminated route is sufficient unchanged:

```ts
{ type: 'inorganic', resourceId: 'x-tech' }
```

All downstream route consumers aggregate or compare stable `resourceId`:

- `getProductionRouteKey()` yields `inorganic:x-tech`;
- `toggleOutpostProductionRoute()` adds/removes it immutably;
- `getActiveProducedResourceIds()` exposes realized resource identity;
- `getActuallyAvailableItemsAtOutpost()` treats it as actual local supply;
- `getItemProvenanceAtOutpost()` marks it local;
- `retireFulfilledPlannedSupply()` retires matching X-Tech Planned Supply;
- cargo candidates and unresolved-export validation use the same typed item;
- Search `PRODUCING`, `IMPORTING`, and `EXPORTING` use existing helpers.

Do not change availability to discard an imported invalid route. Existing
architecture intentionally treats even an invalid persisted active route as an
asserted actual source while validation reports the contradiction. Therefore
X-Tech production with capability false or without explicit presence remains
visible, removable, and available downstream until the user corrects it. That
is consistent with the settled non-destructive rule.

`isProductionRouteAvailable()` is currently occurrence-only for inorganics and
cannot validate X-Tech correctly. Keep its low-level occurrence meaning for
existing biome/tooltip callers, and add the higher-level outpost/character-aware
production predicate in `resourcePresence.ts`. The general active-production
validator should either consume a structured result from that predicate or
skip explicit-presence mechanisms through `usesExplicitPresence()` and leave
their diagnostics to dedicated rules. It must not emit the misleading message
that X-Tech is unavailable in selected biomes.

Production activation should require both explicit presence and capability.
When capability is false, an inactive X-Tech production control should be
disabled; an already active imported control should remain enabled so the user
can turn it off.

## 7. Resource Matrix integration

`OutpostStatusMatrix.tsx` currently owns inorganic row construction and the
Present/Producing controls, while `App.tsx` owns persisted edits and history.
Those ownership boundaries can remain.

Build ordinary inorganic rows exactly as today and partition X-Tech out before
sorting. Append one X-Tech row after the localized ordinary sort when either:

- X-Tech is explicitly present; or
- an imported active X-Tech route exists and must remain inspectable/removable.

Capability alone must not create a row. Partition-and-append is safer than
assigning X-Tech a magic sort name and guarantees it remains last in every
locale.

When X-Tech is absent and capability is true, render `[+ X-Tech]` as a small
semantic button owned by the Inorganic section. The cleanest layout is a
section-heading bar using the same matrix column template: the heading spans
Item and Source and the add control occupies the Present column. This avoids a
permanent empty data row, preserves all six column tracks, and does not disturb
Cargo or Matrix geometry. If the current heading markup makes that unnecessarily
complex, a transient action row at the bottom is acceptable only if it is
semantically a populated action row, not a blank placeholder.

Render the Inorganic section when it has ordinary rows, an X-Tech recovery row,
or the add affordance. Keep the button visually equivalent to the matrix's
compact resource controls and no louder than existing section actions.

Capability false should hide the absent-state add affordance, as the brief
prefers and because there is no UI capable of explaining or changing the
capability. Defense in depth still belongs in the App/domain edit handler so a
stale callback cannot add X-Tech after state changes.

The X-Tech Present control should be ON exactly when explicit presence contains
`x-tech`. Turning it OFF must call one atomic edit that removes the explicit ID
and the exact inorganic production route. It must not issue two callbacks. If
the row exists only because of malformed production-without-presence, the
Present control is OFF; capability true may add presence, while capability false
must not. The active Producing control remains available for removal.

## 8. Search integration

`buildItemSearchCatalogue()` includes every runtime resource and searches its
localized display name and canonical abbreviation. Once X-Tech is emitted in
`resources.json`, it will naturally match `X-Tech` and `XT`; no localization
overlay or abbreviation alias is required.

Replace the Search-local `isResourcePresentAtOutpost()` with the centralized
domain helper. For X-Tech it must check explicit presence only. It must never
use `xTechExtraction` as presence; otherwise every outpost in a default network
would incorrectly receive `PRESENT`.

Expected Search results are:

```text
capability only                         -> no PRESENT
explicit presence                      -> PRESENT
explicit presence + active route       -> PRESENT + PRODUCING
active route without explicit presence -> PRODUCING (plus validation elsewhere)
```

The remaining flags already work automatically once `x-tech` is a known
runtime resource:

- `PRODUCING`: `getActiveProducedResourceIds()`;
- `IMPORTING`: `getItemProvenanceAtOutpost()` over linked remote outbound
  cargo;
- `EXPORTING`: `getRoutedExportedItemKeysAtOutpost()`;
- `PLANNED SUPPLY`: exact typed membership in `outpost.plannedSupply`.

Search remains active-network-only and live-derived because `App.tsx` already
recomputes results from the current `network` and `referenceData`. No Search UX
or presentation-state change is required.

## 9. Planned Supply integration

Add a tracker-policy disposition `special-enabled` and use it for FormID
`01033E3F`. This is preferable to changing X-Tech to `ordinary`: the policy
should continue to express that X-Tech is intentionally runtime-enabled but is
not part of ordinary occurrence-backed resource topology.

The emitted X-Tech resource should be:

```text
id:                       x-tech
name:                     X-Tech
shortName:                XT
category:                 inorganic
rarity:                   unique
parentId:                 null
plannedSupplyPlacement:   special
sortOrder/order:           3
```

The build changes in `scripts/inorganic-resource-data.mjs` should:

- accept `special-enabled` as a disposition;
- emit both `ordinary` and `special-enabled` rows;
- retain the complete existing 45-ID set as a required subset, then require
  exactly one enabled extra ID, `x-tech`;
- permit special-enabled placement `special` instead of requiring hidden;
- change the special-strip invariant from Helium-3/Water only to the ordered
  sequence Helium-3, Water, X-Tech;
- continue requiring `special-deferred` and `excluded` records to use hidden
  placement with no order;
- retain parent, rarity, order-scope, and deterministic-output validation.

`PlannedSupplyEditor.tsx` already filters roots by
`plannedSupplyPlacement === 'special'` and sorts by explicit numeric order.
Therefore X-Tech will append naturally without a component special case.
Compact Planned Supply will continue to sort selected inorganic items by
localized full name, which is its established separate rule.

Keep policy rows `00006529` (Aqueous Hematite) and `00252074` (Caelumite) as
`excluded, ..., hidden,` and keep the build invariant that neither appears in
runtime resources. Enabling X-Tech must not generalize emission to every
non-ordinary canonical row.

## 10. Validation

Add two focused operational warning rules.

First, `x-tech-capability-mismatch` should emit at most one issue per outpost
when `xTechExtraction === false` and either explicit X-Tech presence or active
X-Tech production is recorded. The message can distinguish the strongest state:

- explicit only: X-Tech is recorded as present, but the character lacks the
  required extraction capability;
- producing (with or without presence): X-Tech is recorded as produced, but the
  character lacks the required extraction capability.

One issue rather than separate present and producing issues avoids duplicate
noise when both normal fields are set. Severity should be `warning`: the state
is contradictory/incomplete but intentionally preserved and may represent an
imported or future save.

Second, `x-tech-production-requires-explicit-presence` should warn when an
inorganic X-Tech route is active but explicit presence is absent. This is an
impossible normal-UI state but can arise through import, manual JSON editing,
or future-save data. Severity should also be `warning`, not error, because the
existing application preserves invalid active routes as asserted state and
allows explicit correction.

Do not let `active-production-valid-for-body` also report occurrence/biome
failure for X-Tech. It should recognize explicit-presence mechanisms via the
central helper and defer to the dedicated rules, avoiding a misleading and
duplicated warning.

Extend existing structural validators:

- `unknownReferenceDataIdRule`: inspect every ID in
  `explicitResourcePresence`; after runtime enablement `x-tech` becomes known,
  while genuinely unknown strings still produce an error and remain stored.
- `duplicateCollectionEntriesRule`: diagnose duplicate explicit-presence IDs as
  structural errors without normalizing them during migration.

No auto-repair should occur in validation. No validator should remove X-Tech,
turn off production, or flip the character capability.

## 11. Tooltip/localization

The current status-tooltip seam is `src/ui/statusTooltips.ts`; localized message
ownership is the closed `MessageKey` union in `src/localization/types.ts`, the
complete baseline in `src/localization/locales/en-US.ts`, and sparse locale
overrides such as `en-GB.ts`.

Add localized message keys for:

- the add affordance, for example
  `matrix.tooltip.xTech.add`: “Add X-Tech as present at this outpost. X-Tech can
  be extracted at any outpost once X-Tech extraction is available.”;
- the explicit Present row state, for example
  `matrix.tooltip.xTech.present`: “X-Tech is explicitly available for extraction
  at this outpost.”

The precise final copy should follow the existing concise state-tooltip style.
The helper should accept the localized resource display name as a parameter
rather than hard-code the visible name. `getProducingTooltip()` can be reused
unchanged once the row is explicitly present.

The canonical runtime reference already supplies `X-Tech` and `XT`.
`referenceNames.ts` needs no new algorithm or overlay unless a future locale
actually translates the name. `en-GB` can inherit the complete US baseline for
the new messages under the existing sparse-override architecture.

The general Present-column Context Help can remain unchanged. The exceptional
rule belongs on the X-Tech state/add controls, not in global help that would
burden ordinary rows.

## 12. History / atomic edits

Use the existing `applyUndoableNetworkChange()` path. No history type or reducer
change is required.

Add pure immutable edit helpers in `src/domain/outpostEdits.ts`, conceptually:

```text
add explicit presence
  -> append x-tech if absent

remove explicit presence
  -> remove x-tech from explicitResourcePresence
  -> remove the exact inorganic x-tech production route
```

The App handler should map the selected outpost once and return one complete
network snapshot. It should dispatch one label/timestamp and therefore create
one collection-history entry. It must not call a presence callback and then a
production callback, because that would create two Undo steps.

Adding presence does not retire Planned Supply: Present alone is not realized
supply. Enabling production should continue through the existing production
toggle and `retireFulfilledPlannedSupply()` path, making X-Tech production and
any matching Planned Supply retirement one history entry.

Expected history behavior is:

- Add X-Tech: one entry; Undo removes row; Redo restores presence-only row.
- Remove X-Tech while producing: one entry containing both removals; Undo
  restores explicit presence and production together.
- Toggle X-Tech production: one normal entry, including Planned Supply
  retirement when turning on.
- Planned Supply and cargo edits: unchanged existing paths.

## 13. Persistence / migration

Advance `CURRENT_SCHEMA_VERSION` and `createDefaultNetwork().schemaVersion` from
3 to 4. The smallest safe migration is entirely inside
`src/data/networkMigration.ts`:

1. Extend `migrateCharacter()` to read a typed capabilities record.
2. For a missing capabilities container from an older schema, materialize
   `xTechExtraction: true`.
3. Preserve explicit boolean `false`; reject a present non-boolean value rather
   than coercing it.
4. For each outpost, read `explicitResourcePresence` as a string array and
   default a missing field to `[]`.
5. Return schema version 4.

The network migration is shared by:

- standalone `deserializeNetwork()`;
- nested collection import validation;
- `migrateNetworkCollectionData()`;
- legacy bare-network browser storage recovery.

Therefore no separate storage migration or collection schema bump is needed.
`deserializeNetworkCollection()` can continue requiring collection schema 1;
its nested documents are already migrated. `serialization.ts` and `storage.ts`
need no algorithm change, although their tests must cover the new fields.

Materialize defaults during migration and constructors rather than relying on
reader fallbacks. The rest of the application can then treat the normalized
domain model as complete and distinguish explicit `false` from legacy absence.

Highest-risk persistence regressions are:

- accidentally defaulting missing X-Tech capability to false;
- coercing or dropping an explicit false during import/reload;
- forgetting to copy capabilities when creating a new network from the latest
  character;
- losing unknown explicit resource IDs during migration;
- deduplicating or auto-repairing imported arrays;
- removing active X-Tech production when capability is false;
- changing collection schema unnecessarily and rejecting valid schema-1
  envelopes;
- updating production fixtures to schema 4 without retaining explicit schema-3
  migration tests.

Once X-Tech enters runtime resources, existing persisted occurrences of
`x-tech` in `localResources`, production, Planned Supply, or outbound cargo stop
being unknown-reference errors. The migrator must not move a pre-existing
`localResources: ['x-tech']` value automatically into
`explicitResourcePresence`: that would invent a semantic interpretation for a
field written before the feature. Preserve it in place, validate any resulting
inconsistency as appropriate, and let the user deliberately add explicit
presence. The new feature's normal UI must write only the new field.

## 14. Test plan

### Automated checks

Model and migration:

- `createDefaultNetwork()` gives `character.capabilities.xTechExtraction ===
  true`.
- `createDefaultOutpost()` gives `explicitResourcePresence: []`.
- schema-3 data missing both fields migrates to schema 4 with those defaults.
- schema-4 explicit `xTechExtraction: false` survives standalone import,
  collection import, browser-storage migration, serialization round trip, and
  reload.
- unknown and duplicate explicit resource IDs remain byte-for-byte present;
  validators, not migration, diagnose them.
- adding a new network copies capabilities with a distinct object identity;
  reset returns to the default capability.

Reference build and catalogue:

- canonical/policy inventory remains 48 rows.
- runtime inorganic count becomes 46: the existing 45 stable IDs plus
  `x-tech`.
- X-Tech's FormID, app ID, name, abbreviation, rarity, null parent, special
  placement, and order 3 are exact.
- special strip order is Helium-3, Water, X-Tech even when policy input order is
  reversed.
- Aqueous Hematite and Caelumite remain absent from runtime resources, Search,
  occurrence outputs, and Planned Supply.
- no X-Tech biome or atmosphere occurrence is synthesized.

Presence and availability:

- capability alone does not create explicit presence or Search `PRESENT`.
- explicit X-Tech presence makes the unified predicate true and leaves actual
  availability false.
- explicit presence plus active inorganic production makes actual availability
  and local provenance true.
- imported production without presence still counts as asserted actual supply
  while validation warns.
- ordinary inorganic recorded/occurrence behavior and organic route behavior
  remain unchanged.

Pure Matrix/edit helpers:

- capability true plus absent X-Tech exposes the add affordance predicate.
- capability false plus absent X-Tech does not.
- add creates explicit presence only; row helper appends X-Tech last after
  ordinary localized sorting.
- removal clears explicit presence and exact X-Tech production atomically while
  preserving unrelated routes.
- production-only malformed state retains a last-position recovery row.
- the inactive production control cannot be activated without capability and
  presence; an already active invalid route can be deactivated.

History:

- add, remove, and production toggle each add exactly one reducer history entry.
- removing while producing creates one snapshot containing both changes.
- Undo/Redo restores both presence and production together.
- enabling production retires X-Tech Planned Supply in the same entry.

Search:

- no explicit state: no `PRESENT`.
- explicit state: `PRESENT`.
- explicit plus production: ordered `PRESENT`, `PRODUCING`.
- production-only malformed state: `PRODUCING` without `PRESENT`.
- X-Tech importing, exporting, and Planned Supply flags use existing paths.
- default capability never marks every outpost present.
- catalogue matching resolves both `X-Tech` and `XT`.

Planned Supply:

- expanded special strip preserves the current two items and appends X-Tech.
- X-Tech is selectable as an ordinary Planned Supply item and is disabled only
  under existing actual-availability rules.
- Aqueous Hematite and Caelumite remain absent.
- compact-mode category/name ordering remains unchanged.

Validation:

- capability false plus explicit presence produces one warning and preserves
  state.
- capability false plus production produces the capability warning and
  preserves state.
- production without explicit presence produces its dedicated warning.
- capability false plus production without presence reports the two independent
  contradictions, not an extra biome-occurrence warning.
- unknown and duplicate explicit IDs use existing structural rule families.

Localization/tooltips:

- X-Tech name and `XT` resolve from reference data in both locales.
- the add and explicit-Present tooltips resolve through message keys with
  en-US baseline and en-GB fallback.
- ordinary inorganic and Producing tooltip tests remain unchanged.

The repository has no DOM component-test harness. Prefer extracting pure row
construction, affordance, and edit predicates for deterministic `node:test`
coverage rather than adding a UI dependency solely for this feature. A small
`react-dom/server` markup test is optional, not a substitute for browser checks.

### Manual browser checks

- On a normal capability-true network, verify `[+ X-Tech]` appears in the
  Inorganic Present column without widening or misaligning Matrix/Cargo.
- Add X-Tech and verify its row is last, Present is ON, Producing is OFF, and
  there is one Undo entry.
- Toggle production and verify Planned Supply retirement, cargo eligibility,
  and local provenance/availability behavior.
- Turn Present OFF while producing; verify the row and production disappear
  together and one Undo restores both.
- Exercise Undo/Redo across add, produce, remove, network switch, and outpost
  switch.
- Search X-Tech/XT and verify live PRESENT, PRODUCING, IMPORTING, EXPORTING, and
  PLANNED SUPPLY flags.
- Verify the Planned Supply special strip is Helium-3, Water, X-Tech and no
  excluded resource is visible.
- Switch en-US/en-GB and verify names, accessible labels, and exceptional help.
- Export/import and reload browser storage; verify presence and capability
  survive.
- Load a synthetic capability-false fixture without adding a temporary visible
  capability control: absent add affordance, preserved explicit/production
  state, removable invalid production, and expected warnings.
- Load a production-without-presence fixture and verify the recovery row is
  visible and correctable.

## 15. Likely implementation files

Product/reference files likely to change:

- `reference-source/inorganic-resource-tracker-policy.csv`
- `scripts/inorganic-resource-data.mjs`
- `public/reference-data/resources.json`
- `src/domain/models.ts`
- `src/domain/defaults.ts`
- `src/domain/resourcePresence.ts` (new)
- `src/domain/outpostEdits.ts`
- `src/data/networkMigration.ts`
- `src/data/networkCollection.ts`
- `src/domain/itemSearchResults.ts`
- `src/domain/validation/registry.ts`
- `src/domain/validation/rules/activeProductionValidForBody.ts`
- `src/domain/validation/rules/unknownReferenceDataId.ts`
- `src/domain/validation/rules/duplicateCollectionEntries.ts`
- `src/domain/validation/rules/xTechCapabilityMismatch.ts` (new)
- `src/domain/validation/rules/xTechProductionRequiresPresence.ts` (new)
- `src/ui/components/OutpostStatusMatrix.tsx`
- `src/ui/components/OutpostStatusMatrix.css`
- `src/ui/statusTooltips.ts`
- `src/localization/types.ts`
- `src/localization/locales/en-US.ts`
- `src/App.tsx`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`

Likely test/fixture changes:

- `scripts/inorganic-resource-data.test.mjs`
- `scripts/biome-aware-outposts.test.mjs`
- `scripts/active-production-validation.test.mjs`
- `tests/resourcePersistenceCompatibility.test.ts`
- `tests/networkLifecycle.test.ts`
- `tests/itemSearchResults.test.ts`
- `tests/contextualHelpAndTooltips.test.ts`
- `tests/validationDiagnostics.test.ts`
- `tests/collectionEditingSession.test.ts`
- `tests/manufacturingAvailability.test.ts`
- `tests/stateLegibility.test.ts`
- `tests/keyboardShortcuts.test.ts`
- a new focused `tests/resourcePresence.test.ts` or equivalent

Other typed fixtures in `src/domain/sampleData.ts`,
`src/dev/historyBenchmark.ts`, and script tests that construct complete
characters/outposts will need the new required fields or should be refactored to
start from the default constructors.

Files inspected but not expected to need algorithm changes include:

- `src/domain/availability.ts`
- `src/domain/productionRoutes.ts`
- `src/domain/provenance.ts`
- `src/domain/logistics.ts`
- `src/data/serialization.ts`
- `src/data/storage.ts`
- `src/data/referenceDataLoader.ts`
- `src/ui/itemSearch.ts`
- `src/ui/components/PlannedSupplyEditor.tsx`
- `src/localization/referenceNames.ts`
- `src/localization/locales/en-GB.ts`

## 16. Recommended implementation sequence

1. Add failing reference-policy/build tests for `special-enabled`, the 46-ID
   runtime set, exact X-Tech metadata/order, and continued exclusion of Aqueous
   Hematite/Caelumite.
2. Change the tracker policy and build logic, regenerate `resources.json`, and
   verify that no occurrence/body-resource output gains X-Tech.
3. Introduce schema-4 model fields, constructor defaults, central migration,
   character-copy behavior, and persistence tests. Update complete typed
   fixtures without changing their intended behavior.
4. Add `resourcePresence.ts` and pure tests for recorded Present, explicit
   Present, capability gates, row membership, and production activation. Keep
   occurrence interpretation in `bodyResourceAvailability.ts`.
5. Add pure immutable outpost edits for adding/removing explicit presence,
   including atomic removal of the inorganic X-Tech route. Test them through
   the collection history reducer.
6. Update validation: explicit/unknown/duplicate collections, capability
   mismatch, production-without-presence, and suppression of misleading generic
   biome warnings for explicit-presence mechanisms.
7. Update Search to consume the unified Present predicate and add exact flag
   regressions. Confirm the other four X-Tech flags work without special cases.
8. Integrate Matrix row partition/append, affordance ownership, capability
   guards, and atomic App callbacks. Add localized state tooltips and minimal
   CSS for existing column geometry.
9. Verify Planned Supply consumes the policy-emitted special placement/order
   without component changes. Add ordering and exclusion regressions.
10. Update durable architecture/domain/UX documentation to describe the
    capability container, explicit presence, and X-Tech exception without
    describing occurrence as universal X-Tech presence.
11. Run `npm run reference:build`, `npm run reference:test`, `npm test`,
    `npm run build`, `npm run lint`, and `git diff --check`, then perform the
    focused manual browser checks.

This order makes reference identity and persistence available before UI work,
keeps every stage independently reviewable, and avoids temporarily teaching
Search or Planned Supply about an absent runtime ID.

## 17. Risks / blockers / open questions

The feature does not require a broad architectural redesign. The following are
the material risks:

1. **Ordinary `Present` terminology conflict.** Current Matrix/Search behavior
   uses recorded `localResources`, while canonical occurrence controls row
   eligibility. A literal occurrence-only reading of the brief would change
   ordinary behavior and make existing toggles semantically unclear. Implement
   the compatibility interpretation in section 5 unless the product owner
   explicitly confirms the broader change. This is the only issue that could
   block implementation scope.
2. **Generic active-production validation is occurrence-only.** Merely emitting
   X-Tech makes every valid X-Tech route look biome-invalid unless the validator
   is routed through the explicit-presence seam.
3. **Runtime policy invariants currently hard-code 45 ordinary IDs and a
   two-item special strip.** Relaxing them broadly could leak both excluded
   resources. Update them to exact positive/negative sets, not only counts.
4. **Required model fields touch many typed fixtures.** Mechanical fixture edits
   can conceal missing migration coverage. Keep explicit schema-3 fixtures and
   test schema-4 false values separately.
5. **Capability gating must not become destructive.** `false` must hide/disable
   new activation while leaving imported state and downstream asserted supply
   intact for validation and correction.
6. **Matrix recovery state.** Production without explicit presence must still
   produce an inspectable last-position row so the user can turn production
   off; building rows only from explicit presence would strand invalid data.
7. **Legacy `localResources: ['x-tech']`.** Now that `x-tech` becomes known,
   this old/future-shaped value will no longer be an unknown ID, but it is not
   the new explicit-presence fact. Do not migrate it speculatively.

Subject to resolving the ordinary-Present terminology as described, no other
design question should block implementation. The settled hidden affordance for
capability false, default-true capability, special-strip placement, warning
severity, and existing production/supply semantics all map cleanly to current
architecture.

## Audit verification

This was a no-code architecture audit. I read the required repository
documentation and prior inorganic-resource audit; inspected the named canonical
source, tracker policy, generated runtime data, build scripts, domain models,
migration/serialization/storage paths, Matrix, Planned Supply, Search,
availability, production, provenance, validation, history, localization, and
representative tests; and searched repository-wide consumers of character,
outpost, `localResources`, production-route, and resource-catalogue state.

No product code, schema, source/policy CSV, generated reference data,
localization, or behavior was changed. The only repository change made by this
audit is this report. Tests, build, lint, reference generation, and browser
checks were not run because they were not required to establish the
architectural facts. `git diff --check` and final `git status --short` were run.
No commit or push was performed.
