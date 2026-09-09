# Codex Architecture / Implementation Audit Brief — Multiple Networks + Global Contextual History

## Objective

Perform an architecture and implementation audit for the first multiple-networks lifecycle slice.

Do **not** implement the feature yet.

The audit should map the current codebase against the settled product semantics and recommend the smallest coherent refactor supporting:

- multiple ordered networks;
- create/switch/delete/reset lifecycle;
- whole-collection import/export;
- one global session Undo/Redo timeline;
- Undo/Redo restoring working context at Network + Outpost level;
- Character Level restored to the header;
- compact network controls in the Page Header.

The audit should identify the exact collision points in the current single-network editing/session architecture before implementation begins.

## 1. Read project guidance

Inspect:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Also inspect any existing briefs/design notes related to NetworkCollection, multi-network persistence, Undo/Redo, import/export, PageHeader, and character fields.

## 2. Audit current collection persistence

Inspect especially:

```text
src/data/networkCollection.ts
src/data/storage.ts
src/data/networkMigration.ts
```

Document:

- `NetworkCollection`
- `SavedNetwork`
- `activeNetworkId`
- collection schema version
- legacy single-network migration behavior
- storage read/write path
- current helpers such as `updateActiveNetwork()`

Confirm what multi-network foundation already exists and what is still UI/session-layer work.

## 3. Audit current editing/history architecture

Inspect:

```text
src/domain/history.ts
src/domain/networkEditingSession.ts
src/App.tsx
```

Document:

- current `NetworkEditingSession` shape;
- current history entry shape;
- where Undo/Redo lives;
- where current network state lives;
- how ordinary edits are applied;
- how Undo/Redo is dispatched;
- how import/reset currently enter history;
- how selection is managed separately.

Identify all assumptions that only one active `OutpostNetwork` is being edited.

## 4. Audit current selection/presentation state

Audit at least:

```text
selectedOutpostId
activeNetworkId
CargoPads presentation key
Navigation open/collapsed state
Validation panel state
other presentation state
```

Classify each as:

```text
must participate in global history context
must remain presentation-only
uncertain / needs recommendation
```

The settled minimum history context is:

```text
networkId
outpostId
```

Do not broaden history context to sub-outpost or app-chrome state without compelling reason.

## 5. Audit import/export

Inspect:

```text
NetworkExportButton
NetworkImportButton
serialization helpers
migration/deserialization helpers
filename generation
status messages
tests
```

Document:

- current exported shape;
- current imported shape;
- current filename format;
- current migration expectations;
- where import becomes undoable;
- which contracts are single-network-specific.

## 6. Audit PageHeader / CharacterHeader

Inspect:

```text
src/ui/layout/PageHeader.tsx
src/ui/layout/PageHeader.css
src/ui/components/CharacterHeader.tsx
src/ui/components/CharacterHeader.css
src/App.tsx
```

Confirm that `Character.level` already exists in persisted data and does not require a schema migration merely to return it to the UI.

# Locked product semantics

## 7. Network identity/order

Treat as settled:

- Every network has a stable internal ID.
- IDs are never shown to the user.
- Network order is collection order.
- Networks are appended at the end.
- No network reordering in this lifecycle slice.
- User-facing identity is derived ordinal only.

Presentation:

```text
NETWORK [<] [1 / 3] [>] [+] [-]
```

The ordinal is derived from current collection order and is not persisted separately.

Do not add:

```text
player-facing network names
network menu
dot/pagination strip
network keyboard shortcuts
network reordering
```

## 8. Previous / Next Network

Behavior:

- cycle through current collection order;
- wrap at both ends;
- switching is navigation only;
- switching does **not** create Undo/Redo history.

Audit how `activeNetworkId` should change without becoming an undoable action.

## 9. Add Network

`[+]` means Add Network.

Locked behavior:

- append a new network at the end;
- assign a fresh internal ID;
- make it active;
- select its first/default outpost;
- create one fresh default outpost only;
- carry over character-level details from the **most recently-added network**, meaning the last network in collection order, **not** the currently selected network.

Carry over:

```text
Character Name
Character Level
Outpost Management
Outpost Engineering
Planetary Habitation
Research Methods
Special Projects
```

Do not carry over outposts, cargo, resources, production, manufacturing, planned supply, biomes, or outpost names.

Audit the cleanest helper boundary for this.

## 10. Delete / Reset Network

### More than one network

`[-]` means Delete Network.

Behavior:

- delete current network;
- preserve other stable IDs;
- select previous network in collection order;
- if deleting the first network, select the new first network;
- deletion is undoable/redoable.

### Exactly one network

The collection must never become empty.

`[-]` means Reset Network.

Behavior:

- reset the single network to default/empty state;
- keep it undoable/redoable.

Audit whether existing reset logic can be reused or should become a collection-level action.

# Global session history

## 11. One global timeline

Locked requirement:

> **Undo/Redo is one seamless session-level timeline across the entire NetworkCollection.**

Do not expose or maintain user-visible independent histories per network.

Manual network switching does not create history.

A new undoable action after Undo clears the global Redo branch as usual.

## 12. Promote history above one OutpostNetwork

Audit whether current `NetworkEditingSession` should be replaced/refactored into something conceptually like:

```text
CollectionEditingSession
    collection
    global past
    global future
```

Compare at least:

- whole-`NetworkCollection` snapshots;
- per-network snapshots + lifecycle event history;
- another architecture if materially cleaner.

Recommend one.

# Contextual Undo / Redo

## 13. Restore visible working context

Locked rule:

> **Undo/Redo restores both data state and the working context needed to see the action being traversed.**

Minimum context:

```text
networkId
outpostId
```

Manual navigation itself is not undoable.

## 14. Required contextual behavior

Architecture must support:

### Ordinary edit

Edit Network 2 / Outpost A, switch elsewhere, Undo:

```text
data reverts
Network 2 becomes active
Outpost A becomes selected
```

Redo likewise returns to that action context.

### Add Outpost

Undo:

```text
new outpost disappears
previous outpost/context restored
```

Redo:

```text
new outpost reappears
new outpost selected
```

### Delete Outpost

Undo:

```text
deleted outpost restored
restored outpost selected
```

Redo:

```text
outpost deleted again
post-delete context restored
```

### Add Network

Undo:

```text
new network disappears
pre-add network/outpost context restored
```

Redo:

```text
new network returns
new network/default outpost active/selected
```

### Delete Network

Undo:

```text
deleted network restored
restored network and pre-delete outpost active/selected
```

Redo:

```text
network removed again
post-delete context restored
```

### Import

Undo:

```text
pre-import collection + context restored
```

Redo:

```text
imported collection + post-import context restored
```

## 15. History entry shape

Audit what metadata is required.

Conceptually:

```text
label
timestamp
before collection / restore snapshot
after collection / redo snapshot as needed
before context:
  networkId
  outpostId
after context:
  networkId
  outpostId
```

Do not assume both full before/after snapshots must literally be duplicated if current past/future mechanics can represent this more economically.

Recommend the cleanest shape.

## 16. Excluded presentation state

Do **not** put these into Undo/Redo working context:

```text
Navigation open/collapsed
Navigation reshuffle mode
Cargo Pad expanded/collapsed
Planned Supply expanded/collapsed
Validation panel open/closed
Validation row focus
About dialog state
modal state
scroll positions
other sub-outpost presentation details
```

# History labels

## 17. Multi-network labels

When only one network exists, existing concise labels may remain unchanged.

When more than one exists, history labels should identify the affected network using the **derived ordinal at the time the action occurred**.

Examples:

```text
Network 2: Add outpost
Network 3: Set Planetary Habitation to 4
Network 1: Delete cargo pad
```

Do not expose internal IDs.

Audit where prefixing should happen so callers do not duplicate formatting logic.

# Character Level

## 18. Return Level to CharacterHeader

Restore Character Level between:

```text
Character
Level
Outpost Management
Planetary Habitation
```

Validation:

```text
blank => null
integer 1–999 => valid
anything else => revert/reject using current CharacterHeader convention
```

Field should be wide enough for three digits.

Audit tests/migration impact.

# Header presentation

## 19. Locked PageHeader arrangement

Network controls belong on the **far right**.

Conceptually:

```text
[Character] [Level] [Outpost Mgmt] [Plan. Habit.] ...
[Undo][Redo][Export][Import][Delete Outpost]
NETWORK [<][1 / 3][>][+][-]
```

The ASCII spacing is semantic, not pixel-level prescription.

## 20. Symbol controls

Use compact controls:

```text
<  Previous Network
>  Next Network
+  Add Network
-  Delete/Reset Network
```

Each needs title, accessible label, and focus-visible treatment.

The `-` action retains a confirmation guardrail.

No network keyboard shortcuts in this lifecycle slice.

## 21. Confirmation semantics

One network:

```text
RESET NETWORK
Reset Network
```

Multiple networks:

```text
DELETE NETWORK
Delete Network
```

Audit reuse of existing modal infrastructure.

# Import / Export

## 22. Export entire collection

Export must serialize the entire `NetworkCollection`, including:

```text
collection schema version
ordered SavedNetwork entries
stable IDs
activeNetworkId
all network/outpost/cargo contents
```

Legacy external single-network export compatibility can be discarded because the app is pre-release.

Audit all affected type signatures/tests.

## 23. Export filename

Use the **currently active network’s** character details for the human-facing filename.

Example:

```text
name = Rhea
level = 26

starfield-outposts-rhea-26-2026-08-26-125147.json
```

Rules:

- include normalized character name if present;
- include level if present;
- omit missing segments cleanly;
- retain current timestamp convention unless necessary to change.

## 24. Import entire collection

Import replaces the entire current `NetworkCollection`.

It remains one undoable/redoable action in the global timeline.

On successful import:

1. validate/migrate imported collection;
2. if `activeNetworkId` exists and is valid, use it;
3. otherwise use first network;
4. select the first outpost in the active network.

Undo/Redo then restores before/after collection + working context.

Audit how current legacy migration should change now that old external export compatibility may be discarded.

# Persistence

## 25. Persisted vs session-only

Persist:

```text
NetworkCollection
network IDs
network order
activeNetworkId
all OutpostNetwork contents
```

Do not persist:

```text
Undo/Redo history
history working context
Navigation/cargo/validation presentation state
```

Audit whether `activeNetworkId` persistence and contextual history interact cleanly.

# Ordinary network switching

## 26. Recommend selected-outpost behavior

Network switching does not create history, but must show a valid outpost.

Compare:

### Option A
Always select first outpost on ordinary switch.

### Option B
Maintain session-only `networkId -> selectedOutpostId` so returning to a network returns to its last used outpost.

### Option C
Another simple model.

Recommend one.

Do not confuse ordinary switch behavior with contextual Undo/Redo, which must restore recorded action context.

# Collection helper boundaries

## 27. Recommend pure operations

Audit where lifecycle helpers should live.

Potential operations:

```text
appendNetworkFromLatestCharacter()
deleteNetwork()
resetOnlyNetwork()
setActiveNetwork()
getPreviousNetworkId()
getNextNetworkId()
```

Recommend whether these belong in:

```text
src/data/networkCollection.ts
new domain collection module
session reducer
App.tsx
```

Prefer pure/testable transformations over ad hoc React state manipulation.

# Collision-point audit

## 28. Identify every single-network assumption

Search for assumptions such as:

```text
getActiveSavedNetwork(...).network used only at startup
one reducer initialized once
updateActiveNetwork on every network change
selectedOutpostId tied to one network
import replacing one OutpostNetwork
export accepting one OutpostNetwork
Delete Network actually resetting
CargoPads remount key only accounting for import
validation always bound to one network
Undo/Redo tooltip reading one network history
```

Return a concrete file/function list.

## 29. React state ownership / reducer reinitialization

Pay particular attention to current `useReducer` initialization.

Audit how switching networks would or would not replace reducer state.

Avoid remount hacks if a cleaner collection-level session exists.

Explain recommended React state ownership after refactor.

# Test strategy

## 30. Recommend focused coverage

Plan tests for at least:

### Collection lifecycle

```text
append network
character carry-forward from last-added, not active
fresh outpost state
delete first/middle/last
single-network reset
previous/next wrap
stable IDs
derived ordinal
```

### Global history

```text
ordinary edit across network switches
context restoration network + outpost
Add Network undo/redo
Delete Network undo/redo
Reset only network undo/redo
Add/Delete Outpost context restoration
Import undo/redo
new action after Undo clears Redo
manual switching creates no history
```

### Character Level

```text
blank
1
999
0 invalid
1000 invalid
non-integer invalid
```

### Import/export

```text
whole collection export
activeNetworkId preserved
collection import
invalid activeNetworkId fallback
filename name + level
name only
level only
neither
```

### UI

```text
network ordinal
wrap navigation
+ / - controls
delete/reset dialog mode
history labels with Network N prefix when multiple
```

Avoid brittle pixel-perfect tests.

# Migration / release posture

## 31. Distinguish local persistence from external import compatibility

The user accepts dropping compatibility with legacy **external export files** containing only one network.

However, do not accidentally destroy current browser-local persisted development data.

Audit separately:

```text
localStorage migration compatibility
external import-file compatibility
```

Recommend what to retain/remove.

# Documentation impact

## 32. Recommend documentation changes

Identify likely updates in:

```text
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
README.md
```

Do not edit them in this audit unless explicitly requested.

Especially note the durable UX rule:

> Undo/Redo restores both data and the Network + Outpost working context of the traversed action.

# Audit deliverable

## 33. Produce a concrete implementation map

Return a structured report containing:

### Current architecture
- collection persistence
- editing session
- history
- selection
- import/export
- PageHeader

### Collision points
- exact files/functions
- why each must change

### Recommended target architecture
Include a conceptual state shape.

### History entry / traversal model
Show proposed shapes for:

```text
past entry
future entry
working context
undo result
redo result
```

### Lifecycle operation map
For each:

```text
switch
add
delete
reset
import
ordinary edit
undo
redo
```

state:

```text
collection mutation?
history entry?
active network change?
selected outpost change?
persisted?
```

### File-by-file change plan

### Migration strategy

### Risks
Call out at least:

```text
stale context IDs
deleted/restored networks
deleted/restored outposts
changing ordinals vs historical labels
imported IDs
React reducer initialization
persistence loops
Redo branch invalidation
Cargo/Navigation presentation leakage between networks
```

### Recommended implementation sequencing

# Explicitly out of scope

## 34. Do not design or implement

Do not add:

```text
network names
network menu
network reordering
network keyboard shortcuts
dot/pagination strip
manual pane resizing
copy/paste outposts
cross-network cargo
network comparison
planner/optimizer
persistent Undo/Redo history
history timeline UI
Export Current vs Export All variants
```

For this lifecycle slice, Export means the whole collection.

# Repository cleanliness

## 35. Research task only

Do not make implementation changes.

Revert temporary experiments.

Run:

```text
git diff --check
git status
```

No commit or push.

# Final questions the report must answer

## 36. Explicit answers required

1. Should `NetworkEditingSession` become a collection-level editing session?
2. What exact state should global history snapshot/store?
3. How should before/after `networkId + outpostId` context be represented?
4. How should contextual Undo/Redo restore safely when IDs no longer exist?
5. How should Add Network copy character data from the last network in collection order, not the active one?
6. How should Delete vs Reset Network be represented internally?
7. How should whole-collection Import remain undoable?
8. How should ordinary switching differ from Undo/Redo context restoration?
9. What localStorage migration should remain?
10. What legacy external import compatibility can be removed?
11. What files/functions are the highest-risk collision points?
12. What is the recommended implementation order?

## 37. Final instruction

Design the cleanest path from:

> **one active OutpostNetwork with one history stack**

to:

> **one ordered NetworkCollection with a single global session history that restores both data and Network + Outpost working context.**

Map first. Recommend before coding.
