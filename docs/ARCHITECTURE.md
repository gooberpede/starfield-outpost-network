# Architecture

## Purpose

This document describes the current technical architecture of **Starfield Outpost Network**.

It is intended to help maintainers and coding agents understand:

- where different responsibilities belong;
- which state is persisted and which is session-only;
- how domain logic, React components, persistence, validation, and Undo/Redo interact;
- which architectural boundaries should be preserved when extending the application.

This document describes the architecture that exists now. It is not a complete product specification and should not be treated as a list of future requirements.

For repository-wide coding-agent instructions, see the root `AGENTS.md`.

---

# 1. Architectural overview

Starfield Outpost Network is a local browser application built with:

- React;
- TypeScript;
- Vite;
- browser `localStorage` for normal persistence;
- JSON import/export for portable backups and interchange.

The codebase is divided broadly into:

```text
src/
├── App.tsx
├── data/
├── domain/
└── ui/
    ├── components/
    └── layout/
```

The intended dependency direction is approximately:

```text
UI components
      │
      ▼
   App.tsx
      │
      ▼
Domain logic   ←→   Data/persistence
```

More precisely:

- `src/domain/` should remain independent of React where practical;
- `src/data/` handles external representations and persistence;
- `src/ui/` handles presentation and local interaction;
- `src/App.tsx` coordinates application-level state and feature interactions.

The application currently favours explicit application orchestration over introducing a separate state-management library.

---

# 2. Core architectural principles

The most important principles are:

1. **Persist domain state, not UI state.**
2. **Keep domain rules outside React presentation code where practical.**
3. **Treat the network as immutable.**
4. **Use stable IDs for identity.**
5. **One deliberate user operation should normally equal one Undo step.**
6. **Derive information where possible instead of duplicating it in persisted state.**
7. **Keep reference data separate from the player's network data.**
8. **Validation reports problems; it does not normally repair data automatically.**
9. **Browser storage is the working persistence mechanism; JSON files are import/export vehicles.**
10. **Presentation components should not silently acquire responsibility for domain semantics.**

These principles should be preserved unless a deliberate architectural change is agreed.

---

# 3. Persisted domain model

The top-level persisted model is `OutpostNetwork`.

Conceptually:

```ts
interface OutpostNetwork {
  schemaVersion: number
  character: Character
  outposts: Outpost[]
  cargoLinks: CargoLink[]
}
```

The network contains:

- character data;
- outposts;
- cargo pads owned by those outposts;
- network-level cargo-link relationships.

It does **not** contain presentation-only state such as:

- selected outpost;
- expanded/collapsed UI panels;
- transient status messages;
- Undo/Redo history;
- file-import/export messages.

---

# 4. Character model

Character data currently contains:

- name;
- level;
- Starfield skill ranks relevant or potentially relevant to outpost behaviour.

Skill values use:

```ts
number | null
```

Semantics:

- `null` means no value has been recorded;
- `0` means a known rank of zero;
- those two values are intentionally distinct.

Character name is a string and may be blank.

Not every persisted character field is currently exposed in the UI.

At present, some fields remain in the model for future use even when the interface does not display them.

This is intentional: hiding a field from the UI does not imply removing it from the persisted schema.

---

# 5. Outpost model

Each `Outpost` has:

- stable `id`;
- user-visible `name`;
- `systemId`;
- `bodyId`;
- local resources;
- active production;
- manufacturing entries;
- Planned Supply entries;
- cargo pads.

Conceptually:

```ts
interface Outpost {
  id: string
  name: string
  systemId: StarSystemId
  bodyId: PlanetaryBodyId
  localResources: ResourceId[]
  activeProduction: ResourceId[]
  manufacturing: ManufacturingEntry[]
  plannedSupply: CargoItem[]
  cargoPads: CargoPad[]
}
```

Array order currently determines presentation order for:

- outposts;
- cargo pads.

Stable IDs remain the identity of those objects.

Visible names and labels must not be used as object identity.

---

# 6. Cargo-item abstraction

Resources and manufactured products share a common identity shape where cargo and supply logic needs to treat them uniformly.

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

This abstraction deliberately describes only **what the item is**.

It does not describe:

- where the item came from;
- whether it is actual or planned supply;
- whether it is inbound or outbound;
- how much throughput exists.

Those concerns are derived elsewhere.

---

# 7. Cargo-pad model

A cargo pad currently stores:

- stable ID;
- visible label;
- type;
- outbound cargo selections.

```ts
interface CargoPad {
  id: string
  label: string
  type: 'regular' | 'interstellar'
  outboundItems: CargoItem[]
}
```

A cargo pad does **not** store:

- its cargo link;
- inbound items.

Those are deliberately represented elsewhere.

The current stored label generally reflects positional presentation such as:

```text
Pad 1
Pad 2
Pad 3
```

Stable identity is still the pad ID, not the label.

There is a known future design question around whether positional labels should continue to be persisted or instead be derived from array order. That is not currently resolved.

---

# 8. Cargo-link architecture

Cargo links are network-level entities.

A link has two equivalent endpoints:

```ts
interface CargoLinkEndpoint {
  outpostId: string
  cargoPadId: string
}

interface CargoLink {
  id: string
  endpointA: CargoLinkEndpoint
  endpointB: CargoLinkEndpoint
}
```

This design was chosen because a cargo link is a relationship between **two specific cargo pads**, not merely two outposts.

Neither endpoint is inherently the source or destination.

The relationship is bidirectional.

Each cargo pad is intended to participate in at most one distinct cargo link. That rule is enforced through application logic and validation rather than through the TypeScript type itself.

---

# 9. Outbound and inbound cargo

Outbound cargo belongs to the local cargo pad:

```text
CargoPad.outboundItems
```

Inbound cargo is **derived** from the outbound items on the cargo pad at the opposite end of the link.

Therefore:

- outbound selections persist independently of whether a link currently exists;
- unlinking a pad does not inherently erase its outbound configuration;
- inbound availability is not stored redundantly.

This is an important architectural choice.

Do not add an `inboundItems` collection to persisted cargo-pad state merely for convenience.

---

# 10. Availability

Availability is derived in the domain layer.

The application distinguishes between:

## Actual availability

Items which currently have a real source at an outpost, such as:

- active local resource production;
- manufacturing;
- inbound cargo.

## Planned availability

Items represented only by Planned Supply.

The application can therefore answer related but distinct questions such as:

- "What items can this outpost use for downstream planning?"
- "Which of those items already have a real source?"
- "What still needs a source?"

These calculations belong in domain functions rather than React components.

Relevant domain modules include:

```text
src/domain/availability.ts
src/domain/provenance.ts
```

---

# 11. Provenance

Availability answers whether an item is available.

Provenance answers **why** it is available.

Provenance is derived from the network rather than persisted separately.

Examples of provenance may include:

- local production;
- manufacturing;
- inbound cargo.

Presentation components may display provenance, but they should use the domain lookup rather than reconstructing the same rules independently.

---

# 12. Planned Supply

Planned Supply represents unresolved supply intent.

It is stored on the outpost as:

```ts
plannedSupply: CargoItem[]
```

Its current semantics are:

- an item may be added when the user intends the outpost eventually to receive or produce it;
- once that item acquires an actual source, the corresponding Planned Supply entry may be retired automatically;
- if the actual source later disappears, the Planned Supply item is **not automatically recreated**;
- Undo can restore a previously retired Planned Supply item when that retirement occurred as part of the action being undone.

This is intentionally asymmetric.

Planned Supply is a planning placeholder, not a continuously derived mirror of missing availability.

---

# 13. Manufacturing

Manufacturing entries are stored as:

```ts
interface ManufacturingEntry {
  productId: ProductId
  quantity: number
}
```

The persisted entry records what the outpost is configured to manufacture.

Recipe knowledge belongs to reference data, not the outpost model.

Validation may use recipes to determine whether required inputs appear to be available, but recipe definitions themselves should not be copied into the network.

---

# 14. Reference data architecture

Reference data is separate from the player's network state.

The reference-data model currently includes information such as:

- star systems;
- planetary bodies;
- resources;
- products;
- resource/body mappings;
- manufacturing recipes.

Persisted network objects normally store stable IDs referring to that data.

For example:

```text
systemId
bodyId
resourceId
productId
```

Human-readable names are resolved at presentation time where appropriate.

This separation allows:

- reference data to improve independently of user saves;
- stale IDs to remain inspectable rather than silently discarded;
- validation to report unresolved references.

Do not embed complete reference-data records into `OutpostNetwork` unless an explicit requirement changes this design.

Reference catalogues are generated rather than read from delimited source
files by the browser. Planetary data follows a direct canonical export path:

```text
xEdit → reference-source/planet-directory.tsv
        ↓
scripts/build-reference-data.mjs
        ↓
public/reference-data/*.json
        ↓
src/data/referenceDataLoader.ts
```

The curated inorganic and organic resource dictionaries are the master source
for resource identity, abbreviation, and rarity. The inorganic dictionary also
defines immediate family parents and optional sibling ordering. The curated
manufactured-product dictionary is the master source for product identity,
abbreviation, and rarity, while `industrial-workbench.csv` remains the recipe
source.

Planetary occurrence sources have a separate responsibility. In particular,
`organic-resources.csv` determines farmable organic occurrences; it does not
create logical catalogue resources. The generated `resources.json` therefore
carries rarity for every resource plus explicit inorganic family metadata, and
`products.json` carries rarity for every manufactured product.

The Planet Directory TSV includes base-game and Shattered Space records. Its
`PlanetFormID` and `StarSystemID` values remain the stable runtime identifiers.
Generated body records add the narrow `PlanetaryBodyType` classification
(`planet`, `moon`, or `orbital`) and a build-time-derived `outpostAllowed`
boolean. Orbitals remain in the body catalogue even though they cannot host
outposts.

Source provenance fields such as `SourceFile` and `ExtractTimestamp`, plus the
xEdit-specific eligibility flags, remain in the source layer rather than being
repeated on runtime body objects. The generator requires one consistent extract
timestamp across the file. Repeated PlanetFormIDs with identical semantic body
data produce an informational build diagnostic; conflicting semantic records
fail generation. Star-system name conflicts likewise remain build failures.

---

# 15. Reference-data loading

Reference data is loaded through the data layer and then supplied to the application.

`App.tsx` owns the currently loaded reference-data snapshot.

A reference-data loading failure:

- does not invalidate the persisted network;
- may reduce what can be derived or validated;
- is surfaced to the user through status/error presentation.

The user can manually reload reference data.

Reference-data state is not part of Undo/Redo.

---

# 16. Browser persistence

Normal working persistence uses browser `localStorage`.

The data layer owns this mechanism.

Relevant module:

```text
src/data/storage.ts
```

The storage layer:

- loads the saved network;
- migrates older stored formats where necessary;
- saves the current network in the current representation.

React components should not call `localStorage` directly.

If the persistence mechanism later changes to IndexedDB or another service, the intention is that most domain and UI code should not need to know.

---

# 17. Persistence migration

The storage layer includes migration logic for older saved representations.

One existing migration converts older cargo-pad-local link structures into the current network-level cargo-link model.

Older data may contain enough information to identify the destination outpost but not the exact remote cargo pad.

When safe migration is impossible, the loader preserves recoverable user data rather than inventing a link.

For example:

- outbound cargo may be retained;
- an ambiguous legacy link may remain unlinked.

Migration should favour preservation over speculation.

---

# 18. JSON import/export

JSON files are portable representations of `OutpostNetwork`.

They are not treated as live documents attached to the running application.

## Export

Export:

- serializes the current network;
- generates a useful filename;
- downloads a JSON file.

The current filename convention includes:

- application/network identifier;
- character name when available;
- local timestamp.

The filename is not persisted as network state.

## Import

Import:

- reads a selected JSON file;
- deserializes and validates its structure;
- replaces the current network only after successful parsing;
- records the replacement as one Undoable action.

A failed import must not alter network state.

Import/export success and failure messages are presentation/session state.

---

# 19. Editing-session architecture

The current network and its Undo/Redo history are coordinated as one `NetworkEditingSession`.

Conceptually:

```ts
interface NetworkEditingSession {
  network: OutpostNetwork
  history: NetworkHistory
}
```

React `App.tsx` uses:

```text
useReducer(...)
```

with the pure domain reducer:

```text
networkEditingSessionReducer
```

This design ensures that network state and history move together atomically.

The reducer itself does not depend on React.

---

# 20. Undo/Redo history model

Undo/Redo uses whole-network immutable snapshots.

A history entry contains:

- the previous network snapshot;
- an action label;
- a timestamp.

The central semantic rule is:

> One deliberate user action should normally create one Undo entry.

A single user action may therefore contain several internal mutations.

Examples include:

- deleting a cargo pad and removing its cargo link;
- changing star system and clearing an incompatible body;
- enabling production and automatically retiring fulfilled Planned Supply;
- importing an entire network.

Those related effects should remain one history action.

---

# 21. History branching

When the user:

1. performs actions;
2. Undo(s);
3. then performs a new action;

the previous Redo branch is discarded.

This follows conventional Undo/Redo behaviour.

History is session-only.

It is not persisted to browser storage or JSON.

---

# 22. No-op editing operations

Editing-session updates may return the existing network object.

Returning the exact same network object is treated as a no-op.

A no-op:

- does not replace the current network;
- does not create an unnecessary Undo entry.

This allows application handlers to safely avoid recording edits that do not actually change persisted state.

---

# 23. Immutable update pattern

Persisted network state should be treated as immutable.

Typical updates use:

- object spread;
- array spread;
- `map`;
- `filter`;
- replacement arrays.

Do not mutate an existing network/outpost/pad/link object in place.

The architecture assumes snapshots are safe to retain in history.

In-place mutation would undermine that assumption.

---

# 24. App.tsx responsibilities

`src/App.tsx` is currently the main application coordinator.

Its responsibilities include:

- creating the editing session;
- owning the current `OutpostNetwork`;
- dispatching Undo/Redo;
- owning selected-outpost UI state;
- owning reference-data state;
- owning transient status messages;
- deriving data needed across multiple features;
- coordinating changes that affect several domain objects;
- composing the page-level UI.

`App.tsx` is currently large.

That is recognised, but broad decomposition should not be done incidentally during unrelated tasks.

Future extraction should be deliberate and preserve the existing ownership boundaries.

---

# 25. UI component responsibilities

UI components generally fall into two categories:

## Feature components

Under:

```text
src/ui/components/
```

Examples include:

- character editing;
- outpost navigation;
- outpost details;
- resource editing;
- manufacturing;
- Planned Supply;
- cargo pads;
- validation display;
- import/export controls.

Feature components should receive:

- data;
- callbacks;
- derived presentation information.

They should not independently mutate persisted network state.

## Layout components

Under:

```text
src/ui/layout/
```

Layout components should primarily own:

- positioning;
- semantic page regions;
- spacing;
- sticky/fixed behaviour;
- major layout structure.

They should not normally own domain behaviour.

---

# 26. Current page shell

The application currently has three distinct shell regions:

## Title bar

`TitleBar`

Purpose:

- application identity.

Behaviour:

- normal document flow;
- scrolls away as the user moves down the page.

It should not contain network-editing controls.

## Page header

`PageHeader`

Purpose:

- persistent network-level controls.

Current contents include:

- character;
- Outpost Management;
- Planetary Habitation;
- Undo;
- Redo;
- Export;
- Import.

Behaviour:

- sticky at the top of the viewport.

## Status bar

`StatusBar`

Purpose:

- persistent status and application feedback.

Current contents include:

- validation access;
- reference-data status;
- reference-data reload control;
- transient success/error messages.

Behaviour:

- fixed to the bottom of the viewport;
- fixed height;
- workspace bottom spacing reserves the same height so content is not covered.

Success messages expire automatically.

Action errors remain visible until dismissed or replaced.

---

# 27. Workspace layout

The main application workspace currently separates:

- outpost navigation;
- outpost editing;
- cargo-pad editing.

`WorkspaceLayout` owns the major positioning.

The exact long-term scrolling behaviour of the major workspace regions is intentionally unresolved.

In particular:

- the status matrix lives above Planned Supply in the middle Outpost Details
  column, while Cargo Pads remain in the right column;
- the matrix uses scoped horizontal overflow and a sticky Item column without
  owning an artificial vertical scrolling region;
- the Cargo Pads toolbar remains outside a viewport-bounded, independently
  scrolling card list;
- broader independent scrolling for Navigation and Outpost Details remains
  unresolved;
- selected-outpost information in the sticky page header has been considered but deferred.

Do not redesign workspace scrolling as incidental work.

---

# 28. Selected outpost

The currently selected outpost is presentation/session state owned by `App.tsx`.

It is not persisted in `OutpostNetwork`.

The selected ID is used to derive:

- selected outpost data;
- local body/resource options;
- availability;
- provenance;
- cargo editing context.

Network replacement operations such as import must ensure the selected-outpost state still refers to a valid outpost.

---

# 29. Capacity rules

Capacity calculations belong in domain helpers rather than UI components.

Relevant module:

```text
src/domain/capacity.ts
```

Current examples include:

- outpost capacity based on Planetary Habitation;
- cargo-pad capacity based on Outpost Management.

UI components receive the derived capacity and display current/maximum counts.

Unknown skill rank is represented as `null`, and the UI does not invent a maximum when the relevant rank is unknown.

---

# 30. Validation architecture

Validation lives under:

```text
src/domain/validation/
```

Validation is derived from:

- the current network;
- reference data where required.

Validation does not belong in persistence.

A validation rule should generally have:

- one clear responsibility;
- a stable rule ID;
- an appropriate severity/category;
- enough stable context IDs for presentation to explain where the issue occurred.

Validation rules should avoid overlapping reports for the same problem unless the distinction is intentional.

---

# 31. Validation presentation

Domain validation issues store stable identifiers.

The UI resolves those identifiers into human-readable names.

For example:

- outpost ID → outpost name;
- cargo-pad ID → pad label;
- resource/product ID → reference-data display name.

This maintains separation between:

- domain diagnostics;
- presentation wording.

The validation summary is accessible from the fixed status bar.

Its expanded panel is presentation-only state.

---

# 32. Validation versus enforcement

Validation and editing constraints are related but not identical.

Some rules may:

- prevent an impossible action;
- disable a control;
- report an error;
- report a warning;
- simply provide informational diagnostics.

Do not assume every validation issue should block editing.

Do not silently auto-correct network state because a validator reports a problem unless that repair behaviour is explicitly required.

---

# 33. Local UI drafts

Some inputs use temporary local React state while the user edits a value.

This is especially useful for:

- text fields;
- numeric text input;
- values where blank is a meaningful temporary editing state.

The local draft is committed only when editing is completed, such as on blur.

This supports the Undo rule:

> one completed edit = one Undo entry

rather than:

> one keystroke = one Undo entry.

Local drafts must stay synchronized with persisted state so Undo/Redo updates are reflected correctly.

---

# 34. Presentation-only state

Examples of state that should remain outside `OutpostNetwork` include:

- selected outpost;
- expanded/collapsed panels;
- transient status messages;
- file-input state;
- validation panel open/closed state;
- future Expand All / Collapse All state;
- viewport-specific layout state.

Such state should not enter:

- serialization;
- browser persistence;
- Undo/Redo history;

unless explicitly required.

---

# 35. Reordering

Outpost and cargo-pad ordering is currently stored through array position.

Manual up/down movement changes the persisted array order.

Cargo-pad reordering preserves:

- stable pad IDs;
- cargo contents;
- cargo-link relationships.

Visible positional labels are currently renumbered after order changes.

Arrow and drag-and-drop reordering share the same final-index operation.
Each completed reorder is one Undoable action.

---

# 36. Defaults

Creation defaults belong in domain helpers where practical.

Relevant module:

```text
src/domain/defaults.ts
```

Examples include:

- default outpost creation;
- generation of unique default names.

The current default naming scheme uses:

```text
New Outpost
New Outpost (2)
New Outpost (3)
...
```

and fills available numbering gaps.

Default naming is separate from validation of duplicate user-entered names.

---

# 37. Duplicate names and identity

Outpost names are user-visible labels, not IDs.

Duplicate names are currently allowed but produce an advisory validation warning.

The warning is grouped per duplicated exact name rather than emitted once per outpost.

Current duplicate matching is exact/case-sensitive.

Any future name-normalization policy should be a deliberate product decision.

---

# 38. Error and status-message architecture

Application action feedback is owned at App level.

Current transient status messages distinguish:

```ts
'success'
'error'
```

Success behaviour:

- visible in the status bar;
- automatically expires after a short period.

Error behaviour:

- visible in the status bar;
- remains until replaced or dismissed.

Ongoing system conditions such as reference-data failure may also be presented as error status without being treated as completed action feedback.

Status messages are not persisted.

---

# 39. Styling architecture

Styling is currently plain CSS.

Components commonly import a component-specific stylesheet.

Layout-related CSS should remain with the relevant layout component where practical.

Global/root behaviour belongs in global styles such as:

```text
src/index.css
```

An important current shell dependency is:

- fixed status-bar height;
- matching bottom padding on the application root.

If the fixed footer height changes, the reserved workspace clearance must remain consistent.

---

# 40. Data-flow examples

## Editing an outpost field

Typical flow:

```text
User input
   ↓
UI component local draft
   ↓
commit callback
   ↓
App.tsx
   ↓
editing-session reducer
   ↓
immutable OutpostNetwork replacement
   ↓
Undo history records previous snapshot
   ↓
React re-renders
   ↓
browser storage saves current network
```

## Deriving inbound cargo

Typical flow:

```text
Selected outpost/pad
   ↓
network-level CargoLink
   ↓
remote endpoint
   ↓
remote CargoPad.outboundItems
   ↓
availability/provenance domain logic
   ↓
UI presentation
```

No inbound cargo collection is persisted.

## Successful import

Typical flow:

```text
User selects JSON file
   ↓
FileReader
   ↓
deserialize
   ↓
successful OutpostNetwork
   ↓
App import handler
   ↓
one Undoable network replacement
   ↓
selected outpost made valid
   ↓
browser storage updates
   ↓
status-bar success message
```

A parsing/deserialization failure stops before network mutation.

---

# 41. Known architectural pressure points

Several areas are expected to evolve.

They are documented here so maintainers understand where complexity is accumulating, not as permission to refactor them opportunistically.

## App.tsx size

`App.tsx` currently coordinates many application actions and is large.

Future decomposition may be useful, but should be planned around coherent responsibilities rather than arbitrary file-size reduction.

## Outpost Details

The Outpost Details area combines spanning identity/location fields with a
shared status matrix above Planned Supply in the middle workspace column. Cargo
Pads remain in the right column. The matrix derives resource occurrence, actual
availability, exports, and imports without adding presentation state to
`OutpostNetwork`.

Manufacturing add/remove work is staged in component-local draft state and
committed through `App.tsx` as one whole-network history action.

## Selection controls

Checkbox-heavy resource/product lists may evolve toward denser toggle-button grids.

Planned Supply is a likely pilot for that pattern.

Do not globally replace selection controls until the interaction pattern is proven.

## Cargo-pad labels

Persisted positional labels may eventually be replaced by labels derived from current array position.

This is not yet decided.

## Workspace scrolling

Independent scrolling/sticky workspace regions have been discussed but remain unresolved.

## Undo/Redo navigation

The current model supports basic Undo/Redo.

Potential future features include:

- history list;
- direct history navigation;
- keyboard shortcuts;
- automatic navigation to affected outposts.

These are deferred.

---

# 42. What should trigger an architectural discussion

Before implementing a change, pause if it would require:

- adding UI-only fields to `OutpostNetwork`;
- duplicating derived availability/inbound/provenance data in persistence;
- moving domain rules into React components;
- changing cargo-link ownership;
- changing stable identity rules;
- changing schema version/migration behaviour;
- changing one-action/one-Undo semantics;
- making history persistent;
- introducing a new application-wide state-management framework;
- broad restructuring of `App.tsx`;
- adding a second competing model for ordering or relationships.

These changes may eventually be appropriate, but they should be deliberate.

---

# 43. Current architecture summary

At a high level:

```text
REFERENCE DATA
systems / bodies / resources / products / recipes
                 │
                 ▼
           domain lookups
                 │

PERSISTED NETWORK
character
outposts
cargo pads
cargo links
                 │
                 ▼
        domain derived logic
availability / provenance / validation / capacity
                 │
                 ▼
              App.tsx
     application coordination
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
 UI components        session UI state
                       selection
                       drafts
                       status
                       expansion

UNDO/REDO
whole-network immutable snapshots
session-only

PERSISTENCE
localStorage
current network only

IMPORT/EXPORT
JSON interchange
not a live-file relationship
```

The central architectural idea is:

> `OutpostNetwork` records the player's network; domain functions interpret it; `App.tsx` coordinates edits; UI components present and collect interaction; session-only presentation state remains outside the persisted model.

Preserve that separation unless a future design decision explicitly changes it.
