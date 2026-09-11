# Codex Implementation Brief — X-Tech Support

## Objective

Implement first-class X-Tech support in the Starfield Outpost Tracker using the architecture settled in:

```text
docs/audits/codex-x-tech-architecture-audit.md
```

This feature must add X-Tech as a narrowly-defined exception to ordinary resource presence without changing ordinary biome/atmosphere semantics.

The implementation must:

- add a typed character capability container with `xTechExtraction`;
- add per-outpost `explicitResourcePresence`;
- advance network schema to v4 with safe migration/defaults;
- runtime-enable canonical X-Tech while keeping Aqueous Hematite and Caelumite excluded;
- add `[+ X-Tech]` to the Inorganic Present column when allowed;
- append the X-Tech row at the bottom of the Inorganic section;
- use normal inorganic production once X-Tech is explicitly present;
- integrate X-Tech into Search, Planned Supply, validation, history, import/export, and tooltips through centralized domain helpers;
- preserve invalid imported X-Tech state for diagnosis/recovery;
- avoid scattered `resourceId === 'x-tech'` logic outside the central resource-presence policy seam.

Do not add visible character capability UI in this parcel.

---

# PART A — READ FIRST

Review:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/audits/codex-inorganic-resource-dictionary-retirement-audit.md
docs/audits/codex-x-tech-architecture-audit.md
```

Inspect current implementations of:

```text
reference-source/inorganic-resource-tracker-policy.csv
scripts/inorganic-resource-data.mjs
public/reference-data/resources.json

src/domain/models.ts
src/domain/defaults.ts
src/domain/bodyResourceAvailability.ts
src/domain/availability.ts
src/domain/productionRoutes.ts
src/domain/provenance.ts
src/domain/itemSearchResults.ts
src/domain/outpostEdits.ts
src/domain/validation/

src/data/networkMigration.ts
src/data/networkCollection.ts
src/data/serialization.ts
src/data/storage.ts

src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
src/ui/components/PlannedSupplyEditor.tsx
src/ui/statusTooltips.ts
src/App.tsx

src/localization/types.ts
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts

tests/
```

---

# PART B — SETTLED DOMAIN MODEL

Treat the following as fixed requirements.

## 1. Ordinary Present semantics stay unchanged

Do **not** reinterpret canonical occurrence as ordinary recorded Present.

Compatibility semantics remain:

```text
ordinary inorganic row eligibility
    -> canonical body/biome/atmosphere occurrence

ordinary inorganic recorded Present
    -> outpost.localResources

X-Tech recorded Present
    -> outpost.explicitResourcePresence

realized local supply
    -> active production and/or imports
```

This parcel must not change ordinary Matrix/Search Present behavior.

---

## 2. Character capabilities

Add a typed model:

```ts
export interface CharacterCapabilities {
  xTechExtraction: boolean
}
```

and extend Character:

```ts
interface Character {
  ...
  capabilities: CharacterCapabilities
}
```

Use exact repository style/naming.

`xTechExtraction` defaults to:

```text
true
```

Do not expose it in UI yet.

---

## 3. Explicit resource presence

Extend Outpost with:

```ts
explicitResourcePresence: ResourceId[]
```

Place it near other resource-state fields, ideally beside `localResources`.

Meaning:

> this resource is recorded as Present at this outpost through an explicit user-added presence mechanism rather than ordinary canonical occurrence-backed local presence.

This collection is resource-only.

Do not use `CargoItem[]`.

Do not use a vague `specialResources` structure.

Do not allow arbitrary entries in this array to bypass normal ordinary/organic semantics.

---

# PART C — SCHEMA / MIGRATION

## 4. Advance network schema to v4

Update:

```text
CURRENT_SCHEMA_VERSION
createDefaultNetwork().schemaVersion
```

from 3 to 4.

Collection schema remains unchanged unless an actual blocker is found.

---

## 5. Migrate character capabilities

For schema 1–3 inputs:

```ts
character.capabilities = {
  xTechExtraction: true
}
```

For schema 4:

- require capabilities to be structurally valid;
- preserve explicit `false`;
- reject/coherently fail malformed non-boolean values rather than coercing.

Do not rely on optional-chaining defaults at runtime.

---

## 6. Migrate outpost explicit presence

For older networks:

```ts
explicitResourcePresence: []
```

For schema 4:

- read a string/resource-ID array;
- preserve unknown strings;
- preserve duplicates for validation;
- do not silently deduplicate or auto-repair imported data.

Normal editing helpers must prevent duplicates from being created by the UI.

---

## 7. New network / copied character behavior

New network:

```text
xTechExtraction = true
explicitResourcePresence = []
```

When creating a new universe/network by copying the latest character:

- copy `capabilities` as a new object;
- preserve current values.

Reset behavior should follow existing reset semantics and use defaults.

Add migration/copy regression tests.

---

# PART D — RUNTIME-ENABLE X-TECH

## 8. Tracker policy disposition

Change canonical X-Tech from:

```text
special-deferred
```

to a runtime-enabled special disposition, preferably:

```text
special-enabled
```

or the exact audit-recommended equivalent.

Do not change X-Tech to `ordinary`.

This distinction must remain explicit because X-Tech is not occurrence-backed.

---

## 9. X-Tech runtime reference

Emit X-Tech as a runtime inorganic resource with:

```text
id: x-tech
name: X-Tech
shortName: XT
category: inorganic
rarity: unique
parentId: null
plannedSupplyPlacement: special
plannedSupplyOrder/sortOrder: append after existing special items
```

The exact field name/order representation should match current runtime architecture.

---

## 10. Preserve excluded resources

Keep:

```text
Aqueous Hematite
Caelumite
```

excluded from runtime resources.

They must not appear in:

```text
Search
Planned Supply
Matrix
ordinary selectors
```

Update build invariants to exact positive/negative sets, not only counts.

---

## 11. Special strip order

Do not reorder existing special-strip items.

Take current order and append X-Tech.

Expected current sequence per audit:

```text
Helium-3
Water
X-Tech
```

If repository data proves a different existing order, preserve that order and append X-Tech.

---

# PART E — CENTRAL RESOURCE PRESENCE MODULE

## 12. Add `src/domain/resourcePresence.ts`

Create a focused domain module.

This should be the primary runtime location that knows which resources use explicit presence and which character capability gates them.

Prefer one typed constant:

```ts
export const X_TECH_RESOURCE_ID: ResourceId = 'x-tech'
```

and one centralized explicit-resource/capability mapping.

Avoid repeating `'x-tech'` checks throughout Matrix/Search/validation/App.

---

## 13. Recommended public seams

Implement the smallest coherent equivalents of:

```ts
usesExplicitPresence(resourceId)

hasExplicitResourcePresence(outpost, resourceId)

isResourcePresentAtOutpost(resourceId, outpost, referenceData)

canAddExplicitResourcePresence(character, resourceId)

canActivateProductionRoute(character, outpost, route, referenceData)
```

Exact signatures may adapt to current architecture.

Keep canonical occurrence interpretation in:

```text
bodyResourceAvailability.ts
```

Do not make that module own character/player state.

---

## 14. Present behavior

`isResourcePresentAtOutpost()` should preserve compatibility:

```text
ordinary inorganic
    -> outpost.localResources

explicit-presence resource (X-Tech)
    -> outpost.explicitResourcePresence

organic
    -> existing source-specific presence semantics
```

Do not let capability alone imply Present.

---

## 15. Matrix-row membership helper

Add or expose a helper that can provide inorganic row IDs from:

```text
ordinary occurrence-supported resources
+
recognized explicit-present resources
+
persisted active inorganic routes required for recovery
```

Capability alone must not create an X-Tech row.

Unknown explicit IDs should not become arbitrary matrix rows unless existing recovery semantics specifically require it.

---

# PART F — OUTPOST EDIT HELPERS

## 16. Add explicit presence immutably

In `src/domain/outpostEdits.ts` or the current pure edit module, add helpers for:

```text
add explicit resource presence
remove explicit resource presence
```

Normal add must:

- avoid duplicate insertion;
- be immutable.

---

## 17. Atomic X-Tech removal

Removing X-Tech Present must atomically:

```text
remove x-tech from explicitResourcePresence
+
remove exact active inorganic x-tech production route if present
```

This must be represented by one pure network/outpost edit and one history entry.

Do not implement this as two sequential callbacks.

Preserve all unrelated production routes.

---

# PART G — RESOURCE MATRIX

## 18. `[+ X-Tech]` affordance

When:

```text
xTechExtraction === true
AND
x-tech not in explicitResourcePresence
AND
no recovery-only X-Tech row state blocks the absent case
```

show:

```text
[+ X-Tech]
```

in the **Present column** of the Inorganic section.

When capability is false:

```text
hide the add affordance
```

Do not add a visible capability control.

---

## 19. Add behavior

Clicking `[+ X-Tech]` must:

- add `x-tech` to `explicitResourcePresence`;
- create/show the X-Tech row;
- show Present ON;
- show Producing OFF;
- create exactly one undoable history entry.

Do not auto-enable production.

Do not retire Planned Supply merely from Present.

---

## 20. X-Tech row position

Always append X-Tech at the bottom of the Inorganic section.

Do not include it in localized alphabetical sorting.

Recommended construction:

```text
build/sort ordinary inorganic rows as today
partition X-Tech out
append X-Tech recovery/present row last
```

This must remain stable across locales.

---

## 21. Recovery row

If imported/malformed state has:

```text
active X-Tech production
BUT no explicit presence
```

still render the X-Tech row last.

Show:

```text
Present OFF
Producing ON
```

so the user can repair the state.

Do not strand invisible invalid production.

---

## 22. Producing control gate

Normal inactive X-Tech production can only be activated when:

```text
xTechExtraction === true
AND
explicitResourcePresence contains x-tech
```

If an imported invalid route is already active while capability/presence is invalid:

- keep the Producing control available for turning OFF;
- do not destructively disable removal.

---

# PART H — APP / HISTORY INTEGRATION

## 23. Use existing history pathway

All X-Tech edits must use existing:

```text
applyUndoableNetworkChange()
```

or exact current equivalent.

No new history mechanism.

---

## 24. Expected history behavior

```text
Add X-Tech
    -> one entry
    -> Undo removes row
    -> Redo restores presence-only row

Remove X-Tech while producing
    -> one entry
    -> row + production removed together
    -> Undo restores both together

Toggle X-Tech production
    -> one normal production history entry
```

If production activation retires matching Planned Supply, that should remain part of the same existing production toggle entry.

---

# PART I — SEARCH INTEGRATION

## 25. Use unified Present predicate

Replace the Search-local resource-present predicate with the centralized domain helper where appropriate.

Do not let Search infer X-Tech presence from capability.

Expected X-Tech flags:

```text
capability only
    -> no PRESENT

explicit presence
    -> PRESENT

explicit presence + production
    -> PRESENT + PRODUCING

production only malformed state
    -> PRODUCING
```

---

## 26. Existing flags should remain generic

Once `x-tech` is in runtime resources, these should work through existing infrastructure:

```text
PRODUCING
IMPORTING
EXPORTING
PLANNED SUPPLY
```

Do not add X-Tech-specific flag logic unless an actual blocker exists.

Search remains active-network-only and live-derived.

---

## 27. Search catalogue

X-Tech should be searchable by:

```text
X-Tech
XT
```

using existing localized/reference catalogue behavior.

No new abbreviation alias required.

Aqueous Hematite and Caelumite must remain absent.

---

# PART J — PLANNED SUPPLY

## 28. X-Tech appears as ordinary selectable Planned Supply item

No special supply semantics.

Once runtime-enabled, X-Tech should appear in the existing special strip.

Do not special-case it in the Planned Supply component if current placement metadata already handles it.

---

## 29. Append only

Preserve the current strip order and append X-Tech.

Do not reorder Helium-3/Water.

Aqueous Hematite and Caelumite remain absent.

---

# PART K — VALIDATION

## 30. Add capability mismatch warning

Add a focused rule equivalent to:

```text
x-tech-capability-mismatch
```

Severity:

```text
warning
```

Trigger when:

```text
xTechExtraction === false
AND
(explicit X-Tech presence OR active X-Tech production)
```

Emit at most one capability-mismatch issue per outpost.

Prefer strongest-state wording:

```text
explicit only
    -> X-Tech recorded as present but capability missing

producing
    -> X-Tech recorded as produced but capability missing
```

Do not emit duplicate present+producing capability warnings for the same outpost.

---

## 31. Add production-without-presence warning

Add a second rule equivalent to:

```text
x-tech-production-requires-explicit-presence
```

Severity:

```text
warning
```

Trigger when:

```text
active inorganic X-Tech production
AND
explicitResourcePresence does not contain x-tech
```

Preserve state.

Do not auto-repair.

---

## 32. Avoid misleading generic biome warnings

Update the generic active-production-valid-for-body validator so valid/invalid X-Tech states are not also reported as:

```text
not available in selected biome/body
```

Explicit-presence resources should route through the centralized presence policy and dedicated validation.

Do not weaken ordinary inorganic validation.

---

## 33. Structural validation

Extend existing validators so:

```text
unknownReferenceDataId
duplicateCollectionEntries
```

inspect `explicitResourcePresence`.

Unknown IDs and duplicates should remain stored and be diagnosed.

Do not normalize them during migration.

---

# PART L — DOWNSTREAM AVAILABILITY

## 34. Reuse normal inorganic production

Do not add a new production-route type.

Use:

```ts
{ type: 'inorganic', resourceId: 'x-tech' }
```

---

## 35. Realized supply semantics remain unchanged

Present alone does not create realized supply.

Active X-Tech production should automatically flow through existing:

```text
getActiveProducedResourceIds()
getActuallyAvailableItemsAtOutpost()
getItemProvenanceAtOutpost()
cargo eligibility
Planned Supply retirement
exports/imports
```

Do not change those helpers unless required by an actual type/runtime blocker.

---

## 36. Preserve invalid asserted production

If imported invalid X-Tech production exists:

- keep it visible;
- keep it downstream as asserted actual production under existing non-destructive semantics;
- warn separately.

Do not silently discard it from availability/provenance.

---

# PART M — TOOLTIPS / LOCALIZATION

## 37. Add X-Tech-specific Present/add help

Use the existing localization/message-key seam.

Add concise localized help for:

```text
[+ X-Tech]
X-Tech Present state
```

Conceptual meaning:

```text
Add:
X-Tech can be explicitly added because it is extractable at any outpost once the capability is available.

Present:
X-Tech has been explicitly recorded as present at this outpost.
```

Use wording consistent with existing Matrix tooltip style.

Do not hard-code English in the component.

---

## 38. Producing tooltip

Reuse ordinary Producing tooltip semantics once X-Tech is explicitly present.

No bespoke producing copy unless required for capability-invalid recovery state.

---

## 39. Localization source

Use existing:

```text
src/localization/types.ts
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts
```

en-GB may inherit the US baseline unless wording needs a real locale override.

No reference-name overlay is needed for X-Tech at present.

---

# PART N — PERSISTENCE / IMPORT RESILIENCE

## 40. Preserve explicit false

Test that:

```text
xTechExtraction: false
```

survives:

```text
standalone import
collection import
browser storage
serialization round trip
new-network character copy
```

Do not collapse false into default true.

---

## 41. Preserve future/invalid state

If imported state contains:

```text
explicitResourcePresence: ['x-tech']
```

with capability false, preserve and warn.

If imported state contains:

```text
activeProduction x-tech
```

without explicit presence, preserve and warn.

---

## 42. Do not reinterpret old `localResources: ['x-tech']`

If a pre-feature/future-shaped save already contains:

```text
localResources: ['x-tech']
```

do not automatically migrate that entry into `explicitResourcePresence`.

Preserve it in place.

Do not invent semantics for data written before this feature.

Let validation/recovery behavior handle the resulting state as appropriate.

---

# PART O — TESTS

Add/adjust automated tests for all of the following.

## 43. Reference build

```text
48 canonical policy rows remain
runtime inorganic count becomes 46
x-tech exact metadata
x-tech special-enabled
special strip includes existing items + x-tech
Aqueous Hematite excluded
Caelumite excluded
no fake X-Tech occurrence generated
```

---

## 44. Model/default/migration

```text
new network capability true
new outpost explicitResourcePresence []
schema 3 -> schema 4 defaults correctly
schema 4 false preserved
unknown explicit IDs preserved
duplicate explicit IDs preserved
new network copies capabilities
reset behavior correct
```

---

## 45. Presence/availability

```text
capability alone -> not Present
explicit X-Tech -> Present
explicit only -> not realized supply
explicit + production -> realized supply
ordinary inorganic behavior unchanged
organic behavior unchanged
production-only malformed state remains asserted supply
```

---

## 46. Matrix/edit behavior

```text
capability true + absent -> add affordance
capability false + absent -> no add affordance
add -> row last / Present ON / Producing OFF
remove -> row gone + production cleared
production-only malformed state -> recovery row last
cannot activate production without presence/capability
can turn OFF already-active invalid production
```

---

## 47. History

```text
add = one entry
remove while producing = one entry
Undo/Redo restores both fields atomically
production toggle remains one entry
Planned Supply retirement remains in same production edit
```

---

## 48. Search

```text
no explicit state -> no PRESENT
explicit -> PRESENT
explicit + production -> PRESENT + PRODUCING
production-only -> PRODUCING only
IMPORTING works
EXPORTING works
PLANNED SUPPLY works
capability true never marks every outpost Present
X-Tech and XT match
excluded resources do not appear
```

---

## 49. Planned Supply

```text
existing special order preserved
X-Tech appended
X-Tech selectable
Aqueous Hematite absent
Caelumite absent
compact-mode behavior unchanged
```

---

## 50. Validation

```text
capability false + explicit -> one warning
capability false + production -> one capability warning
production without presence -> one dedicated warning
capability false + production without presence -> two independent warnings only
no extra biome-occurrence warning
unknown explicit ID diagnosed
duplicate explicit ID diagnosed
state preserved
```

---

## 51. Localization/tooltips

```text
X-Tech / XT resolve in both locales
add tooltip localized
Present tooltip localized
ordinary tooltip regressions unchanged
```

---

# PART P — MANUAL BROWSER CHECKS

Verify:

```text
[+ X-Tech] appears in Inorganic Present column
Matrix/Cargo geometry remains aligned
clicking add creates last X-Tech row
Present ON / Producing OFF initially
Producing ON creates local supply
cargo eligibility behaves normally
Search shows correct flags
Planned Supply strip appends X-Tech
Present OFF while producing removes row+production atomically
Undo restores both
Redo removes both again
locale switch leaves behavior intact
network/outpost switching works
export/import/reload preserves state
synthetic capability-false fixture behaves correctly
production-without-presence fixture is visible and repairable
```

Do not add a temporary visible capability control just for testing.

---

# PART Q — DOCUMENTATION

Update durable docs:

```text
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
```

Document:

```text
CharacterCapabilities
xTechExtraction default true / hidden UI
explicitResourcePresence semantics
ordinary Present compatibility semantics
X-Tech explicit-presence exception
X-Tech production reuse
Search behavior
Planned Supply special placement
non-destructive invalid-state validation
schema 4 migration
```

Do not describe Aqueous Hematite/Caelumite as supported tracker resources.

Do not describe future capability UI.

---

# PART R — LIKELY FILES

Likely changes include:

```text
reference-source/inorganic-resource-tracker-policy.csv
scripts/inorganic-resource-data.mjs
public/reference-data/resources.json

src/domain/models.ts
src/domain/defaults.ts
src/domain/resourcePresence.ts
src/domain/outpostEdits.ts
src/domain/itemSearchResults.ts

src/data/networkMigration.ts
src/data/networkCollection.ts

src/domain/validation/registry.ts
src/domain/validation/rules/activeProductionValidForBody.ts
src/domain/validation/rules/unknownReferenceDataId.ts
src/domain/validation/rules/duplicateCollectionEntries.ts
src/domain/validation/rules/xTechCapabilityMismatch.ts
src/domain/validation/rules/xTechProductionRequiresPresence.ts

src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
src/ui/statusTooltips.ts
src/App.tsx

src/localization/types.ts
src/localization/locales/en-US.ts

tests/
scripts/*.test.mjs
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
```

Do not force changes to files that do not need them.

---

# PART S — IMPLEMENTATION SEQUENCE

Use this low-risk order:

1. Add failing reference-policy/build tests for X-Tech runtime enablement and continued exclusion of Aqueous Hematite/Caelumite.
2. Update tracker policy/build and regenerate `resources.json`.
3. Add schema-4 model fields, defaults, migration, character-copy behavior, and persistence tests.
4. Add `resourcePresence.ts` with pure tests.
5. Add explicit-presence edit helpers and atomic removal tests.
6. Add validation rules and suppress misleading generic biome warnings for explicit-presence resources.
7. Update Search to consume unified Present semantics.
8. Integrate Matrix add affordance, recovery row, row ordering, capability guard, and atomic callbacks.
9. Verify Planned Supply appends X-Tech through policy metadata with no component special case if possible.
10. Add tooltips/localization.
11. Update durable docs.
12. Run all automated and manual verification.

Keep each stage reviewable.

---

# PART T — OUT OF SCOPE

Do not:

```text
add visible character capability settings
add research/magazine buff UI
add other capabilities
expose Aqueous Hematite
expose Caelumite
add Show Hidden
change ordinary Present semantics
change ordinary occurrence semantics
create fake X-Tech biome/atmosphere occurrences
create new production route types
redesign Search
redesign Planned Supply
redesign Matrix
change collection schema without necessity
auto-repair invalid imported state
commit
push
```

---

# PART U — VERIFICATION

Run:

```text
npm run reference:build
npm run reference:test
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also perform the focused browser checks above.

No commit or push.

---

# PART V — COMPLETION REPORT

Report:

## Model/schema

Confirm schema v4 and exact new fields/defaults/migration behavior.

## Runtime X-Tech

Confirm `x-tech` is emitted and Aqueous Hematite/Caelumite remain excluded.

## Presence architecture

Explain `resourcePresence.ts` and how ordinary vs explicit Present semantics are separated.

## Matrix

Describe `[+ X-Tech]`, row ordering, recovery row, Present/Producing behavior.

## Search

Confirm exact X-Tech flag semantics.

## Planned Supply

Confirm existing special order preserved and X-Tech appended.

## Validation

List new rules/severities and confirm no misleading biome warning.

## Persistence/history

Confirm atomic edits, Undo/Redo, import/reload behavior, explicit false preservation.

## Localization

List new message keys/help text.

## Generated data

List generated files that changed.

## Tests

Report exact pass counts.

## Files changed

List all files.

## Verification

Report exact command results.

Do not commit or push.

---

## Final instruction

Implement X-Tech as a **narrow explicit-presence exception**:

```text
ordinary row eligibility
    -> canonical occurrence

ordinary recorded Present
    -> localResources

X-Tech recorded Present
    -> explicitResourcePresence

X-Tech capability
    -> character.capabilities.xTechExtraction

X-Tech production
    -> existing inorganic production route

realized supply
    -> existing production/import semantics
```

Centralize the exception in domain helpers, preserve invalid imported state for recovery, keep all ordinary resource behavior unchanged, and do not expose unrelated canonical resources.
