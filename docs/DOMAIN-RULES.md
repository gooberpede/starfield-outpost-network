# Domain Rules

## Purpose

This document describes the current **domain semantics** of Starfield Outpost Network.

It explains what the application's persisted fields mean, how supply and cargo are interpreted, which Starfield rules are currently encoded, and where the application deliberately distinguishes between:

- stored facts;
- derived facts;
- planned intent;
- validation diagnostics;
- unresolved or deferred rules.

This document is intended for maintainers and coding agents.

It describes current agreed behaviour unless a section is explicitly marked **Deferred**, **Unresolved**, or **Future**.

For technical ownership and state-flow rules, see `ARCHITECTURE.md`.

For repository-wide coding-agent instructions, see the root `AGENTS.md`.

---

# 1. General domain principles

The application models a player's **recorded outpost network**, not a perfect simulation of every Starfield mechanic.

The domain model should therefore preserve these distinctions:

1. **Recorded fact**
   - something the user has explicitly configured in the application.

2. **Reference fact**
   - information known from Starfield reference data, such as a planet's resources or a manufacturing recipe.

3. **Derived fact**
   - information computed from network state and reference data, such as inbound availability.

4. **Planned intent**
   - something the user intends to supply later but which does not yet have a real source.

5. **Validation diagnostic**
   - a warning or error describing an inconsistency or constraint violation.

Do not collapse these categories merely because they refer to the same resource or product.

## 1.1 Resource and product reference metadata

Resource and manufactured-product rarity uses one ordered reference scale:

```text
common < uncommon < rare < exotic < unique
```

Inorganic resources may form rarity-progressing families. `parentId` identifies
the immediate parent resource, while `sortOrder` optionally orders siblings.
Roots use `parentId: null`; missing explicit order uses `sortOrder: null`.
Organic resources do not participate in these families and always use null for
both fields.

This metadata is reference fact, not player-network state. Persisted outposts
continue to store stable resource and product IDs rather than catalogue records.

---

# 2. Character values

Character data includes:

- name;
- level;
- Outpost Management;
- Outpost Engineering;
- Planetary Habitation;
- Research Methods;
- Special Projects.

Some of these fields are currently hidden from the UI but remain valid persisted domain data.

## 2.1 Character name

Character name is:

```ts
string
```

An empty string is valid and means no name has been recorded.

Do not substitute `null` for an unnamed character unless the persisted schema is deliberately changed.

---

## 2.2 Character level

Character level is:

```ts
number | null
```

Semantics:

- `null` = no level has been recorded;
- a number = a level has been explicitly recorded.

A blank UI field commits to `null`.

Invalid numeric levels are a validation concern.

---

## 2.3 Skill ranks

Each recorded skill rank is:

```ts
number | null
```

Semantics:

- `null` = the user's rank is unknown/not recorded;
- `0` = the rank is known and the character does not have a trained rank;
- `1` to `4` = known trained rank.

`null` and `0` are intentionally different.

Do not convert unknown ranks to zero.

That distinction matters because the application should not claim to know a capacity derived from a skill when the skill itself is unknown.

---

# 3. Outpost identity

Each outpost has a stable `id`.

The ID is its domain identity.

The outpost's name is user-visible metadata and is not identity.

Therefore:

- renaming an outpost must not break links or references;
- duplicate names can exist;
- array position controls display order but not identity.

---

# 4. Outpost names

New outposts are assigned unique default names using the pattern:

```text
New Outpost
New Outpost (2)
New Outpost (3)
...
```

Available numbering gaps may be reused.

Example:

```text
New Outpost
New Outpost (3)
```

allows the next generated name to be:

```text
New Outpost (2)
```

Users may subsequently rename outposts freely.

Duplicate user-entered names are currently allowed but generate an advisory validation issue.

Names longer than Starfield's normal 25-character limit are also allowed and
preserved. They generate an advisory warning because mods may support longer
names and the tracker does not impose the base-game limit.

Current duplicate-name comparison is exact and case-sensitive.

Any normalization rule such as trimming, case-folding, or locale-aware comparison is a future product decision.

---

# 5. Star system and planetary body

An outpost stores:

```text
systemId
bodyId
```

Both are reference-data IDs.

A planetary body belongs to a specific star system in reference data.

If an outpost's recorded `bodyId` does not belong to its recorded `systemId`, the network is inconsistent.

That inconsistency is reported by validation.

Application editing may also clear an incompatible body when the user deliberately changes system.

Normal System and Body selection is constrained by the body's canonical
`outpostAllowed` reference-data fact. Existing persisted selections that no
longer qualify remain visible for inspection and deliberate correction; the
application does not silently erase or migrate them.

A known selected body with `outpostAllowed === false` is a validation error.
An unknown body ID remains an unknown-reference problem instead.

If system and body are changed as part of one deliberate user operation, associated cleanup should remain part of the same Undo action.

---

# 6. Local resources

`localResources` records resources known to occur at the outpost location/body and selected by the user as locally present.

It does **not** mean those resources are currently being extracted or farmed.

A local resource therefore does not automatically count as supply.

This distinction is deliberate:

```text
Local resource
    ≠
Active production
```

Reference data may constrain which resources are plausible for the selected planetary body.

---

# 7. Active production

`activeProduction` records resources the outpost is actively extracting, harvesting, or otherwise producing.

An actively produced resource counts as **actually available** at the outpost.

A resource should normally be locally valid for the selected body before it can represent active production.

Validation reports active-production resources that are incompatible with known body reference data.

Active production is a source of supply.

Merely listing a resource in `localResources` is not.

---

# 8. Manufacturing

Manufacturing records products actively produced at an outpost.

Each manufacturing entry contains:

```ts
{
  productId: ProductId
  quantity: number
}
```

A manufacturing entry means the product itself is actually available at that outpost.

The product recipe is not stored in the outpost.

Recipes come from reference data.

---

# 9. Manufacturing inputs

Manufacturing recipes may require resources and/or products.

The current validator checks whether required manufacturing inputs are available at the outpost according to the application's availability model.

A missing input is a diagnostic condition.

Do not automatically delete manufacturing configuration merely because an input is unavailable.

The application is a tracker/planner and must be able to preserve configurations that are temporarily incomplete.

---

# 10. Cargo item identity

Cargo and Planned Supply use a shared discriminated identity:

```ts
type CargoItem =
  | {
      type: 'resource'
      id: ResourceId
    }
  | {
      type: 'product'
      id: ProductId
    }
```

The item type is part of identity.

A resource and product with the same textual ID are not the same cargo item.

Cargo-item identity describes **what** the item is, not where it comes from.

---

# 11. Cargo-pad identity

Each cargo pad has a stable `id`.

Its ID is its domain identity.

The current model also stores a visible label.

Array order controls the current presentation order.

Reordering a cargo pad must preserve:

- pad ID;
- cargo-pad type;
- outbound items;
- cargo-link relationship.

Visible positional labels may be renumbered after reordering.

Whether positional pad labels should eventually be derived instead of persisted is unresolved.

---

# 12. Cargo-pad types

Current types are:

```text
regular
interstellar
```

These correspond to the two cargo-link categories used by the application.

Cargo-pad type affects which links are valid and whether Helium-3 supply is required.

---

# 13. Cargo-pad capacity

Cargo-pad capacity is a per-outpost limit derived from the recorded **Outpost Management** rank.

Current rule:

```text
Outpost Management 0  → 3 cargo pads per outpost
Outpost Management 1+ → 6 cargo pads per outpost
```

This rule is currently represented by:

```text
src/domain/capacity.ts
```

If Outpost Management is `null`, capacity is unknown.

The UI must not invent a maximum from an unknown skill rank.

Invalid numeric skill ranks are separately reported by validation.

The capacity helper behaves conservatively for unexpected numeric values, but that does not make those values valid.

---

# 14. Outpost capacity

Maximum outpost count is derived from the recorded **Planetary Habitation** rank.

Current rule:

```text
Rank 0 →  8 outposts
Rank 1 → 12 outposts
Rank 2 → 16 outposts
Rank 3 → 20 outposts
Rank 4 → 24 outposts
```

Equivalently:

```text
8 + (4 × rank)
```

for valid ranks 0 through 4.

If Planetary Habitation is `null`, the applicable maximum is unknown.

The application must not silently treat unknown rank as zero.

Invalid stored ranks are a separate validation concern.

---

# 15. Cargo links

Cargo links are stored at network level.

A link connects two specific cargo pads:

```text
outpost A / pad A
        ↕
outpost B / pad B
```

A cargo link is not stored as a property of just one outpost or one pad.

This reflects the fact that the relationship belongs to both endpoints.

---

# 16. Cargo links are bidirectional

A cargo link has two equivalent endpoints.

Neither endpoint is inherently:

- source;
- destination;
- outbound side;
- inbound side.

Direction is determined independently by each pad's outbound selections.

This permits configurations such as:

```text
Pad A outbound: Copper
Pad B outbound: Helium-3
```

using the same bidirectional link.

Do not model the link itself as one-way unless the domain design is deliberately changed.

---

# 17. One link per cargo pad

Each cargo pad may participate in at most one distinct cargo link.

A pad appearing in multiple network-level links is invalid.

The application has a validator for this condition.

When editing links, prefer preventing creation of invalid duplicate relationships where practical, while preserving validation as a safeguard for imported or stale data.

---

# 18. Cargo-link endpoints must exist

Each cargo-link endpoint identifies:

- an outpost;
- a cargo pad belonging to that outpost.

A link is structurally invalid if an endpoint refers to:

- a missing outpost;
- a missing cargo pad;
- a pad not belonging to the stated outpost.

Broken references are validation issues.

Do not invent replacement endpoints.

---

# 19. Self-linking

A cargo pad must not link to itself.

That means the same:

```text
outpostId + cargoPadId
```

cannot occupy both endpoints of one cargo link.

The application has a specific validation rule for self-linked pads.

A broader rule concerning links between two different pads at the same outpost is **not currently established** and should not be invented.

---

# 20. Regular cargo links

A regular cargo pad is intended for cargo links within one star system.

A regular cargo link connecting outposts in different systems is invalid and is reported by validation.

Do not silently change the pad type or move the outpost to repair the condition.

---

# 21. Interstellar cargo links

Interstellar cargo pads can support cross-system cargo links.

The application currently applies a Helium-3 supply rule to interstellar cargo use.

The exact presence/availability check is implemented in domain validation and should remain centralized there rather than duplicated in React UI code.

Interstellar support does not imply unlimited throughput.

Throughput modelling is currently outside the domain model.

---

# 22. Helium-3

Helium-3 is treated as an ordinary resource for item identity and availability.

It also has special relevance to interstellar cargo links.

Current validation checks whether required Helium-3 supply exists for interstellar cargo operation.

The application does not yet model:

- Helium-3 consumption rate;
- transfer frequency;
- storage volume;
- throughput sufficiency.

A binary availability check must not be mistaken for quantitative fuel modelling.

---

# 23. Outbound cargo

Each cargo pad stores:

```text
outboundItems
```

These are items the user has configured that pad to export.

Outbound cargo selection is persistent configuration.

It is independent of whether the pad is currently linked.

Therefore:

- unlinking a cargo pad must not automatically erase its outbound selections;
- changing remote topology must not automatically erase local export intent.

---

# 24. Cargo export selection

An item may be selected for outbound cargo when it belongs to the outpost's **selectable supply**.

Selectable supply currently includes:

- actual availability;
- Planned Supply.

This means users may configure a downstream network before every upstream source has been completed.

That is intentional planning behaviour.

---

# 25. Unresolved cargo exports

If an outbound item later ceases to be selectable/available, the existing outbound configuration is **not automatically deleted**.

Instead, the application may report it as unresolved.

This rule is important.

The tracker preserves user intent rather than aggressively cleaning configuration in response to temporary supply changes.

Therefore:

```text
availability change
    does not imply
delete downstream export configuration
```

---

# 26. Inbound cargo

Inbound cargo is derived.

For an outpost involved in a cargo link:

1. find the remote endpoint;
2. find the remote cargo pad;
3. read that pad's `outboundItems`;
4. treat those items as inbound supply at the current outpost.

Inbound cargo is not persisted as a separate collection.

Inbound availability belongs to the **outpost as a whole**, not only to the local cargo pad that physically receives the shipment.

The game may use local output links to route material between storage containers and cargo pads within the same outpost, but that internal plumbing is intentionally abstracted away by the tracker.

Consequently, an item arriving through one cargo pad may be used as available supply for outbound configuration on another cargo pad at the same outpost.

Do not add redundant inbound state unless a future domain redesign explicitly requires it.

---

# 27. Actual availability

An item is **actually available** at an outpost when it has a real recorded source.

Current actual sources are:

1. active local production;
2. active manufacturing;
3. inbound cargo from linked remote pads.

In notation:

```text
Actual Availability
    =
Active Production
    ∪
Manufacturing Output
    ∪
Inbound Cargo
```

Duplicate sources collapse to one available cargo-item identity.

---

# 28. What does not create actual availability

The following do not currently count as actual supply by themselves:

- a resource merely appearing in `localResources`;
- Planned Supply;
- an outbound cargo selection;
- an item existing in reference data;
- a manufacturing recipe input requirement;
- assumed manual inventory or stockpiles.

Manual stockpiles and asserted external supply are not currently modelled.

---

# 29. Selectable supply

The broader supply set used for planning/configuration is:

```text
Selectable Supply
    =
Actual Availability
    ∪
Planned Supply
```

This allows cargo configuration to use both:

- items with real sources;
- explicitly planned future sources.

Code that needs to distinguish real versus planned supply must use the appropriate domain function rather than treating the broader set as actual availability.

---

# 30. Planned Supply meaning

Planned Supply means:

> The user intends this resource or product to become available at the outpost, but no current real source is being asserted by that Planned Supply entry itself.

It is planning intent, not actual inventory.

A Planned Supply entry should therefore not be used to claim that:

- extraction exists;
- manufacturing exists;
- an inbound cargo link exists;
- the item is physically present.

It simply extends the selectable planning set.

---

# 31. Planned Supply retirement

When an item in Planned Supply acquires an **actual** source, the corresponding Planned Supply placeholder is automatically retired.

Possible actual sources include:

- active production;
- manufacturing;
- inbound cargo.

This avoids representing the same requirement simultaneously as both:

- unresolved planned intent;
- resolved actual supply.

---

# 32. Planned Supply is not automatically recreated

If a previously actual source later disappears, the application does **not** automatically recreate the old Planned Supply entry.

Example:

```text
1. Aluminium is Planned Supply.
2. Aluminium begins arriving through inbound cargo.
3. Planned Supply Aluminium is retired.
4. The inbound link is later removed.
5. Planned Supply Aluminium does not automatically return.
```

This is deliberate.

The application does not maintain a hidden historical promise that a previously planned item must remain planned forever.

---

# 33. Planned Supply and Undo

Automatic Planned Supply retirement is collateral behaviour of the user action that created the actual source.

It should therefore be captured in the same Undo snapshot.

Undoing that action can restore the retired Planned Supply item.

This follows the domain-wide principle:

> one deliberate action and its domain consequences form one Undo step.

---

# 34. Planned Supply UI eligibility

Current product direction is that items already available through actual sources should remain visible in Planned Supply selection UI but be disabled rather than hidden.

Reason:

- hidden implies the item may not exist or may not be supported;
- disabled communicates that the item is known but does not require a planned placeholder because it already has an actual source.

This is an agreed design direction for the next Planned Supply redesign, not yet necessarily the implementation in every current UI component.

Do not generalize this behaviour to unrelated controls unless the implementation brief calls for it.

---

# 35. Reference IDs

Network state stores reference IDs rather than copied reference-data records.

Examples include:

- system IDs;
- body IDs;
- resource IDs;
- product IDs.

Unknown/stale IDs should be preserved where possible.

They are validation problems, not permission to silently delete user data.

---

# 36. Body/resource compatibility

Reference data records which resources are valid for planetary bodies.

Each planetary body also has a canonical `bodyType` of `planet`, `moon`, or
`orbital`, and an `outpostAllowed` domain fact. The current reference-data
generator derives outpost eligibility as:

```text
bodyType is not orbital
AND PlanetNotLandable is false
AND OceanWorld is false
```

The last two inputs are xEdit source facts and are not runtime body fields.
UI and domain consumers should use `outpostAllowed` rather than reproducing
source-specific eligibility logic.

Active production should be compatible with the selected body.

The application validates incompatible active production.

The app may also use body reference data to constrain normal editing choices.

Validation still matters because inconsistent data can arrive from:

- older saves;
- imported JSON;
- future reference-data changes;
- manual corruption.

---

# 37. Manufacturing recipes

Product recipes are canonical reference data.

Recipes define required input quantities.

The recipe itself is not copied into outpost state.

If a recipe changes in reference data, validation/derived behaviour may change without rewriting every saved outpost.

This separation is intentional.

---

# 38. Duplicate collection entries

Collections intended to represent sets should not contain duplicate logical entries.

The application includes validation for duplicate collection entries.

Examples may include resource or cargo-item collections.

Domain logic should avoid intentionally introducing duplicates.

Where sets are derived, duplicate sources should collapse to one logical item.

---

# 39. Character validation

The application currently validates:

- invalid character level;
- invalid recorded skill rank.

Unknown values represented by `null` are not invalid merely because they are unknown.

Do not convert unknown values into validation errors unless a future rule explicitly requires a value to be recorded.

---

# 40. Capacity validation

The application currently validates:

- outpost count against known Planetary Habitation capacity;
- cargo-pad count against known Outpost Management capacity.

If the relevant skill is unknown (`null`), the application should not pretend a specific maximum is known.

Capacity validation and UI capacity display must preserve that distinction.

---

# 41. Current validation rule set

The current validation registry contains rules covering:

1. unresolved cargo exports;
2. missing cargo-link endpoints;
3. cargo pads linked multiple times;
4. cargo-pad skill limit;
5. outpost skill limit;
6. invalid skill level;
7. invalid character level;
8. self-linked cargo pads;
9. regular cargo pads linking across systems;
10. interstellar cargo Helium-3 requirements;
11. body/system mismatch;
12. duplicate collection entries;
13. duplicate outpost names;
14. active production validity for the selected body;
15. unknown reference-data IDs;
16. unavailable manufacturing inputs;
17. outposts on known bodies that cannot host outposts;
18. outpost names longer than the base game's normal 25-character limit.

This list describes the current validator registry.

It is not a declaration that these are the only domain rules the application will ever need.

---

# 42. Validation is not identical to editing enforcement

A rule being validated does not necessarily mean the UI must prevent creation of that state.

There are three broad categories:

## Structurally impossible or nonsensical

The UI should generally prevent these when practical.

Examples:

- linking a pad to itself;
- selecting a cargo pad already committed to another link.

## Temporarily incomplete but meaningful

The application may permit these and report them.

Examples:

- manufacturing whose inputs are not yet supplied;
- an export whose source later disappears.

## Advisory

The application may permit these freely and simply inform the user.

Example:

- duplicate outpost names.

Do not automatically convert validators into blockers.

---

# 43. Validation should preserve user data

Validation exists to explain network problems.

It does not normally authorize destructive repair.

When validation discovers inconsistency:

- preserve the user's configuration;
- report the condition;
- allow explicit user correction.

Automatic correction should happen only where there is a separately defined editing rule.

---

# 44. Deleting cargo pads

Deleting a cargo pad removes that domain object.

Any network-level cargo link that references the deleted pad must also be removed because it no longer has a valid endpoint.

That collateral link removal belongs to the same deliberate user operation and therefore the same Undo step.

Deleting the pad should not affect unrelated cargo links.

---

# 45. Deleting or changing sources

Removing a source may reduce actual availability.

This can make downstream configuration unresolved.

Do not cascade-delete downstream cargo exports merely because their source disappears.

The network is allowed to represent temporarily incomplete plans.

Validation should surface the unresolved condition.

---

# 46. Reordering

Reordering an outpost or cargo pad changes presentation order, not identity.

It must not:

- create new IDs;
- break cargo links;
- alter outbound selections;
- alter manufacturing;
- alter supply semantics.

One move operation is one Undoable user action.

---

# 47. Import semantics

A successful imported network becomes the current network as one deliberate operation.

A failed import must not change:

- network data;
- history;
- selected outpost.

Imported filenames are not domain data.

The application does not maintain an ongoing relationship to the source JSON file.

---

# 48. Browser persistence semantics

Browser storage is the normal working persistence mechanism.

The application saves the current network representation.

Undo/Redo history is not domain persistence and is not saved.

Presentation state is not saved unless explicitly added as a future requirement.

---

# 49. Migration principle

When persisted legacy data cannot be migrated with certainty:

> preserve recoverable user information and avoid inventing facts.

For example, if an old cargo link names a destination outpost but not the exact destination pad, the application should not guess the pad.

Outbound cargo configuration may still be retained.

---

# 50. Throughput

## Deferred

The application does not currently model quantitative cargo throughput.

It therefore does not yet answer questions such as:

- whether one link can carry sufficient material per unit time;
- whether several downstream consumers oversubscribe a source;
- whether Helium-3 production is sufficient for a given interstellar network;
- storage-buffer sufficiency;
- production-rate balancing.

Current availability is essentially qualitative/binary.

Do not infer quantitative sufficiency from the fact that an item is "available."

---

# 51. Circular flows

## Deferred

Circular cargo-flow analysis is not currently part of core availability semantics.

A future validator may identify circular supply arrangements for information or planning diagnostics.

Do not currently reject a network merely because its topology contains a cycle unless an existing specific rule is violated.

---

# 52. Recursive manufacturing feasibility

## Deferred

The application currently validates immediate manufacturing input availability.

A more advanced planner may eventually reason recursively through recipe chains.

That future capability may distinguish:

- direct availability;
- craftable availability;
- recursively satisfiable networks;
- impossible recipe chains.

Do not introduce recursive planning semantics into ordinary availability without an explicit design decision.

---

# 53. Biome/resource placement

Reference data now retains biome-level occurrences. Biome FormID is identity;
biome display names are non-unique, even within one body. A body-local biome index
provides default numeric ordering. One body/index maps to one biome FormID and
one body/FormID maps to one index; independently repeated source facts must agree.
Atmospheric inorganic occurrences belong to the body, never to a synthetic biome.

Global species identity (FormID, display name, flora/fauna type) is separate from
planet/species facts and biome occurrences. Domesticability, harvested resource,
and source class belong to the planet/species pair and must agree across biomes.
Organic occurrences only record where the species occurs.

Resolved input signatures define source classes: plant uses Water × 1; herbivore
uses Water × 1 and Fiber × 2; carnivore uses Water × 1 and Nutrient × 2. Input
presence does not imply domesticability. Non-domesticable species remain in
reference data. NoLinkedResource species (including Terrormorph and Chasmbass)
retain null harvested resource/source class rather than invented facts.

The body-resource compatibility inventory is derived from all biome inorganic,
atmospheric inorganic, and harvested planet/species resources. It includes wild
organics; matrix farming choices require a domesticable planet/species source.
Raw nullable solar/wind power and habitation rank are reference values only.

## Deferred outpost placement

The current outpost domain model does not yet encode detailed biome placement as a required persisted field.

Do not infer or impose biome rules unless a future feature explicitly introduces them.

---

# 54. Organic production prerequisites

## Deferred

Future reference data may support additional requirements for domesticable fauna/flora production.

These rules are not yet part of the core production model.

Do not invent feed, greenhouse, zoology, botany, habitat, or skill prerequisites unless they are explicitly introduced through agreed reference/domain rules.

---

# 55. Same-outpost cargo routing

Cargo links connect cargo pads at **different outposts**.

The in-game cargo-link interface does not use cargo links to move material between two cargo pads at the same outpost.

Local material routing within an outpost is handled through **output links** between extractors, storage containers, manufacturing equipment, and the inbound/outbound storage containers attached to cargo pads.

For example:

```text
Pad 1 receives Aluminium
        │
        ▼
local output link
        │
        ▼
Pad 2 outbound storage
        │
        ▼
Pad 2 exports Aluminium
```

The tracker does not model these local output links explicitly.

Instead, inbound cargo contributes to **outpost-level availability**.

Therefore:

- an item arriving through one cargo pad is considered available to the outpost as a whole;
- that item may be selected for export from another cargo pad at the same outpost;
- no explicit local pad-to-pad routing record is required;
- a network-level cargo link should not connect two cargo pads belonging to the same outpost.

This abstraction is intentional.

The tracker models whether an item is available at the outpost, not the internal storage-container plumbing used to move it between local structures.

---

# 56. Cargo-pad labels

## Unresolved

Cargo pads currently persist a `label`, while array order also determines positional presentation.

A future design may derive labels such as `Pad 1`, `Pad 2`, etc. from position and remove or reinterpret persisted labels.

Until that change is deliberately made:

- preserve the label field;
- preserve stable pad IDs;
- keep current reordering behaviour intact.

---

# 57. Planner versus tracker semantics

The current application is primarily an electronic notebook/tracker with planning assistance.

It must be able to represent:

- complete networks;
- incomplete networks;
- intended future supply;
- temporarily broken links;
- configuration that is valid structurally but not yet fully supplied.

Therefore, do not assume:

> "invalid/incomplete" means "must be impossible to store."

Many useful planning states are intentionally representable.

Validation exists partly to make those incomplete states understandable.

---

# 58. Set-and-forget network philosophy

The broader product direction favours persistent network configurations rather than workflows that require frequent manual reassignment of cargo links.

This informs future planning features but is not itself a low-level validation rule.

In particular:

- cargo configuration should generally survive temporary changes in availability;
- the application should avoid destructive automatic reconfiguration;
- stable network intent is valuable information.

Do not automatically optimize or reassign cargo links unless a future planner feature explicitly requests it.

---

# 59. Rule-change discipline

When changing domain behaviour, identify which category is being changed:

- persisted schema;
- domain meaning;
- derived availability;
- validation;
- editing enforcement;
- presentation-only behaviour.

A UI change should not silently redefine a persisted field.

A validator change should not silently become destructive repair.

An availability change should not silently rewrite stored cargo configuration.

A reference-data change should not silently delete unresolved IDs.

Keep those concerns explicit.

---

# 60. Domain summary

The current supply model can be summarized as:

```text
LOCAL RESOURCES
known to exist locally
        │
        └── do not count as supply by themselves

ACTIVE PRODUCTION
        │
        ▼
actual resource supply

MANUFACTURING
        │
        ▼
actual product supply

REMOTE PAD OUTBOUND ITEMS
through a cargo link
        │
        ▼
inbound actual supply

ACTUAL SUPPLY
production ∪ manufacturing ∪ inbound
        │
        ├───────────────┐
        │               │
        ▼               ▼
real source        retires matching
                   Planned Supply

PLANNED SUPPLY
unresolved future intent
        │
        ▼
extends selectable supply

SELECTABLE SUPPLY
actual ∪ planned
        │
        ▼
may be configured for outbound cargo

SOURCE LATER DISAPPEARS
        │
        ├── existing outbound configuration remains
        ├── Planned Supply is not automatically recreated
        └── validation may report unresolved configuration
```

The central semantic principle is:

> Preserve the difference between what the player has, what the player plans to have, and what the application can derive from the recorded network.

That distinction should remain explicit throughout future domain and UI work.
