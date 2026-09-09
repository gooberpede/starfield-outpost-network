# Codex Implementation Brief — Multiple Networks + Global Contextual Undo/Redo

## Objective

Implement the first multiple-networks lifecycle slice.

This implementation must:

- promote editing/history from one active `OutpostNetwork` to the full `NetworkCollection`;
- expose basic network lifecycle/navigation controls;
- preserve one global session Undo/Redo timeline;
- make Undo/Redo restore the Network + Outpost working context of the traversed action;
- support Add / Delete / Reset / Previous / Next Network;
- make Import/Export operate on the whole collection;
- restore Character Level to the header;
- preserve existing application behavior unless explicitly changed below.

This brief incorporates the conclusions of the completed architecture audit.

---

# PART A — READ BEFORE CODING

## 1. Read project guidance

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

Also review the completed audit:

```text
codex-audit-architecture-multiple-networks-contextual-global-history.md
```

Treat the audit as the implementation baseline unless this brief explicitly overrides it.

---

# PART B — LOCKED USER-FACING SEMANTICS

## 2. Network collection model

The application manages an ordered collection of networks.

Locked rules:

- Network order is collection array order.
- Each network has a stable internal ID.
- Internal IDs are never shown to the user.
- User-facing identity is ordinal only.
- No network names.
- No network reordering.
- No network menu.
- No network keyboard shortcuts.
- No dot/pagination strip.

The selector presentation is:

```text
NETWORK [<] [1 / 3] [>] [+] [-]
```

Use actual UI styling consistent with the existing PageHeader, not literal ASCII styling.

## 3. Previous / Next Network

`<` and `>` navigate through current collection order.

Behavior:

- wrap at both ends;
- do not create history entries;
- update persisted `activeNetworkId`;
- use the session-only remembered outpost for the target network when valid;
- otherwise select the first outpost in that network;
- if a network ever has no outposts, selected outpost may be `null`.

No network navigation keyboard shortcuts.

## 4. Add Network

`[+]` means Add Network.

Behavior:

1. Append a new `SavedNetwork` to the end of the collection.
2. Assign a fresh internal ID.
3. Copy character-level details from the **last network in collection order**, not the currently active network.
4. Make the new network active.
5. Start it with exactly one fresh/default outpost.
6. Select that new outpost.
7. Record the entire operation as one undoable action.

Copy:

```text
Character Name
Character Level
Outpost Management
Outpost Engineering
Planetary Habitation
Research Methods
Special Projects
```

Do not copy:

```text
existing outposts
outpost names
cargo pads
cargo links
local resources
production
manufacturing
planned supply
biomes
other network gameplay state
```

The assumption is New Game Plus / next universe, while still allowing the user to edit all copied character fields afterward.

## 5. Delete / Reset Network

`[-]` is the lifecycle control and always has a confirmation guardrail.

### When more than one network exists

It means **Delete Network**.

Behavior:

- delete the current network;
- preserve surviving stable IDs;
- preserve surviving order;
- select the previous network in collection order;
- if deleting the first network, select the new first network;
- select that target network’s remembered outpost when valid, else its first outpost;
- record as one undoable action.

### When exactly one network exists

It means **Reset Network**.

Behavior:

- never allow the collection to become empty;
- reset the one network to default/empty network state;
- preserve the network’s stable ID;
- keep it active;
- select the first/default outpost if the reset state has one, otherwise `null`;
- record as one undoable action.

Use distinct internal lifecycle operations for delete and reset.

---

# PART C — GLOBAL SESSION HISTORY

## 6. Replace single-network editing session

Replace/refactor the current single-network editing architecture into a collection-level session.

Conceptual target:

```ts
interface WorkingContext {
  networkId: string
  outpostId: string | null
}

interface HistoryState {
  collection: NetworkCollection
  context: WorkingContext
}

interface CollectionHistoryEntry {
  label: string
  timestamp: number
  before: HistoryState
  after: HistoryState
}

interface CollectionHistory {
  past: CollectionHistoryEntry[]
  future: CollectionHistoryEntry[]
}

interface CollectionEditingSession {
  collection: NetworkCollection
  context: WorkingContext
  selectedOutpostByNetworkId: Record<string, string | null>
  history: CollectionHistory
}
```

Exact naming may differ, but preserve these semantics.

## 7. Global history rules

Locked rule:

> **Undo/Redo is one seamless session-level timeline across the entire application collection.**

Rules:

- ordinary edits are history entries;
- Add Network is one history entry;
- Delete Network is one history entry;
- Reset Network is one history entry;
- Import is one history entry;
- manual network navigation is not history;
- manual outpost selection is not history;
- a new undoable action after Undo clears the Redo branch;
- history is session-only and is not persisted.

Do not maintain separate per-network Undo/Redo stacks.

## 8. Contextual Undo/Redo

Locked durable UX rule:

> **Undo/Redo restores both the data state and the Network + Outpost working context of the action being traversed.**

History context includes:

```text
networkId
outpostId
```

History context excludes:

```text
Navigation open/collapsed
Navigation reshuffle state
Cargo Pad expanded/collapsed
Cargo Pad reshuffle/drag state
Planned Supply expansion
Validation panel open/closed
Validation row focus
About dialog
modal state
scroll position
sub-outpost editor presentation details
```

## 9. Context normalization

Implement a central normalization helper for restored history state.

Conceptually:

```ts
normalizeHistoryState(state: HistoryState): HistoryState
```

Rules:

1. Restore the collection first.
2. If `context.networkId` exists in the restored collection, use it.
3. Otherwise use a valid `collection.activeNetworkId`.
4. Otherwise use the first network.
5. If `context.outpostId` exists in that resolved network, use it.
6. Otherwise use that network’s first outpost.
7. If it has none, use `null`.
8. Ensure `collection.activeNetworkId === context.networkId`.

This is defensive repair, not normal-case behavior.

## 10. Required Undo/Redo examples

### Ordinary edit

User edits Manufacturing on Network 2 / Outpost A, then navigates elsewhere.

Undo must:

```text
revert the edit
activate Network 2
select Outpost A
```

Redo must likewise return to Network 2 / Outpost A.

### Add Outpost

Undo:

```text
new outpost disappears
previous outpost context restored
```

Redo:

```text
new outpost returns
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
new network/default outpost selected
```

### Delete Network

Undo:

```text
deleted network restored
restored network and its pre-delete outpost selected
```

Redo:

```text
network removed again
post-delete network/outpost context restored
```

### Import

Undo:

```text
pre-import collection and context restored
```

Redo:

```text
imported collection and post-import context restored
```

---

# PART D — HISTORY LABELS

## 11. Multi-network label prefixing

When exactly one network exists, keep current concise labels.

When more than one network exists, prefix the action label using the network ordinal at action time.

Examples:

```text
Network 2: Add outpost
Network 3: Set Planetary Habitation to 4
Network 1: Delete cargo pad
```

Rules:

- never expose internal IDs;
- freeze the label string at action time;
- do not recompute later if ordinals change;
- derive Delete Network ordinal from the pre-delete collection;
- derive Add Network ordinal from the post-add collection;
- collection-wide Import should use a collection label such as `Import networks`.

Centralize label formatting in the collection/session layer.

---

# PART E — SESSION-ONLY OUTPOST MEMORY

## 12. Remember last selected outpost per network

Implement session-only navigation memory:

```ts
selectedOutpostByNetworkId
```

Behavior:

- when the user selects an outpost, update the remembered ID for that active network;
- when manually switching networks, restore the remembered outpost when valid;
- otherwise use first/null fallback;
- when Undo/Redo restores exact action context, use the history entry’s context, not the remembered map;
- update the remembered map after a contextual restore so subsequent ordinary navigation remains coherent.

Do not persist this map.

---

# PART F — COLLECTION HELPERS

## 13. Add pure/testable lifecycle helpers

Introduce clean pure helpers in an appropriate domain/application collection module.

Responsibilities should include equivalents of:

```text
setActiveNetwork
getPreviousNetworkId
getNextNetworkId
appendNetworkFromLatestCharacter
deleteNetwork
resetOnlyNetwork
replaceActiveNetwork
getActiveSavedNetwork
```

Exact names may differ.

Prefer immutable transformations, explicit inputs, no React dependency, and deterministic tests.

For ID generation, inject/provide IDs in a testable way rather than making tests depend directly on random UUID generation.

## 14. Add Network construction

The source character must come from:

```ts
collection.networks.at(-1)
```

not the active network.

Explicitly clone:

```text
name
level
all persisted skill values
```

Then combine with fresh network/default state.

The new network must contain exactly one newly-created default outpost.

Do not accidentally clone gameplay arrays/objects from the previous network.

---

# PART G — APP STATE OWNERSHIP

## 15. Remove current single-network mirroring

Refactor `App.tsx` so the reducer/session owns the entire collection.

Remove the current architecture that:

- initializes the reducer from one active `OutpostNetwork`;
- stores a mutable/ref collection separately;
- writes the active network back through `updateActiveNetwork()`.

Persist:

```ts
session.collection
```

directly.

Derive active network from `session.collection.activeNetworkId`.

Derive selected outpost from `session.context.outpostId`.

Do not reinitialize/remount the reducer per network switch.

## 16. Ordinary active-network edits

Existing network-level updates should still be easy to express.

Provide an application/session helper that applies an update to the active network while:

- producing one collection-level history transaction;
- recording before/after collection snapshots;
- recording before/after context;
- applying network ordinal prefixing when necessary;
- clearing Redo for new actions.

Avoid forcing every caller in `App.tsx` to manually rebuild the collection.

---

# PART H — OUTPOST LIFECYCLE CONTEXT FIX

## 17. Remove action-specific selection workaround

The audit identified current outpost-selection behavior as an existing Undo/Redo weakness.

Update Add/Delete Outpost so context is part of the history transaction.

Remove obsolete workarounds such as `selectedOutpostBeforeDelete` or any label-based Undo special case.

Add/Delete Outpost must now obey the contextual history rules in Part C.

---

# PART I — IMPORT / EXPORT

## 18. Export the entire collection

Change external export from one active `OutpostNetwork` to the complete `NetworkCollection`.

Export must include:

```text
collection schema version
ordered SavedNetwork entries
stable internal IDs
activeNetworkId
all nested OutpostNetwork data
```

For this slice:

> **Export means Export All Networks.**

Do not add separate Export Current / Export All commands.

## 19. External import contract

Change external import to require a collection envelope.

Legacy external JSON containing only one bare `OutpostNetwork` may be rejected.

This is explicitly acceptable because the app is pre-release.

However, keep browser-local migration compatibility separately as described later.

Import flow:

1. fully parse/validate/migrate the incoming collection before dispatch;
2. preserve ordered stable IDs;
3. reject or clearly report malformed/duplicate IDs rather than silently losing entries;
4. if `activeNetworkId` is valid, use it;
5. otherwise use the first valid network;
6. select the first outpost in that active network;
7. dispatch one undoable whole-collection replacement action;
8. record pre-import and post-import context.

Failed imports must not modify collection, history, or selection.

## 20. Import label

Use a collection-wide history label:

```text
Import networks
```

Do not prefix with `Network N`.

## 21. Export filename

Use the **currently active network’s** character details.

Locked example:

```text
starfield-outposts-rhea-26-2026-08-26-125147.json
```

Rules:

- normalized active character name when present;
- active character level when present;
- omit missing segments cleanly;
- preserve existing timestamp convention.

Expected variants:

```text
name + level
name only
level only
neither
```

Implement through the existing filename helper rather than inline UI string building.

---

# PART J — LOCAL STORAGE MIGRATION

## 22. Preserve browser-local continuity

Do **not** remove useful localStorage migration.

Retain:

- existing storage key;
- bare legacy `OutpostNetwork` in localStorage → one-entry `NetworkCollection`;
- current nested network migration;
- collection recovery;
- invalid active ID fallback;
- non-empty collection recovery.

External file compatibility and localStorage compatibility are separate concerns.

---

# PART K — CHARACTER LEVEL

## 23. Return Character Level field

Restore:

```text
Character
Level
Outpost Management
Planetary Habitation
```

Level sits between Character and Outpost Management.

Validation:

```text
blank => null
integer 1–999 => valid
0 => invalid
1000+ => invalid
non-integer => invalid
```

Use the existing CharacterHeader draft/commit behavior:

- invalid draft reverts to authoritative value on commit/blur;
- authoritative Undo/Redo/import changes remount/synchronize correctly.

Field should be wide enough for three digits, but no larger than necessary.

## 24. Domain validation

Update the existing invalid-character-level validation rule from positive integer to integer `1–999`.

Update tests accordingly.

---

# PART L — PAGE HEADER / NETWORK CONTROLS

## 25. Header grouping

Keep existing CharacterHeader content on the left.

Network controls belong on the far right, after the existing action group.

Conceptually:

```text
[Character] [Level] [Outpost Mgmt] [Plan. Habit.]
...
[Undo][Redo][Export][Import][Delete Outpost]
NETWORK [<][1 / 3][>][+][-]
```

The ASCII spacing is semantic, not pixel-level prescription.

## 26. PageHeader structure

If useful, extend PageHeader from `main + actions` to something like `main + actions + networkActions`, or an equivalent structure that creates a distinct far-right network cluster.

Do not overload the generic actions container if a small structural change produces cleaner wrapping and grouping.

Maintain:

- sticky behavior;
- existing palette;
- flat/square geometry;
- current visual hierarchy;
- no shadows/cards/glow.

## 27. Symbolic controls and accessibility

Controls:

```text
<  Previous Network
>  Next Network
+  Add Network
-  Delete/Reset Network
```

Requirements:

- `aria-label`;
- `title`;
- keyboard focusability;
- visible focus treatment consistent with PageHeader;
- proper disabled semantics only if needed.

Since Previous/Next wrap, they do not need to disable for multi-entry collections.

For one network, either leave them enabled as harmless self-wrap or disable them because navigation has no effect. Choose the cleaner UX and document the choice in the completion report.

## 28. Ordinal display

Display:

```text
1 / 3
```

Derived from active network position and collection length.

Do not persist it.

Use a compact non-editable control/readout.

---

# PART M — DELETE / RESET CONFIRMATION

## 29. Confirmation modes

Reuse the existing modal infrastructure.

### One network

Title:

```text
RESET NETWORK
```

Confirm label:

```text
Reset Network
```

Copy should explain that the current network will be reset and that the action can be undone during the session.

### Multiple networks

Title:

```text
DELETE NETWORK
```

Confirm label:

```text
Delete Network
```

Copy should clearly state that the current network will be removed and that the action can be undone during the session.

Do not expose internal IDs.

---

# PART N — PRESENTATION STATE AT NETWORK BOUNDARIES

## 30. Prevent state leakage

Keep truly app-wide presentation state unchanged, such as Navigation open/collapsed and Validation open/closed.

Prevent network-specific editor state from leaking between networks.

At network switch / whole-collection import / history restoration that changes network:

- exit/cancel Navigation reshuffle/drag state if needed;
- reset Cargo Pad reshuffle/drag/draft/expanded state;
- ensure stale component-local state cannot render against a different network.

Prefer stable network IDs in keys where appropriate.

A key conceptually like `networkId + replacement/import epoch` may be used for Cargo Pad remount behavior if needed.

Do not put these presentation details in history.

## 31. Avoid stale local component state

The current app uses `cargoPadsPresentationKey` mainly for import.

Refactor this carefully.

If whole-collection Undo/Redo, import, reset, or active-network switching can replace the active network document while keeping the same internal network ID, ensure component-local drafts/expansion do not become stale.

Use the smallest clean mechanism.

Do not globally remount the whole application.

---

# PART O — TESTS

## 32. Collection lifecycle tests

Add focused tests for:

```text
Add Network appends
Add uses last-added character, not active character
all character fields carry over
new network has one fresh default outpost
gameplay state does not carry over
fresh stable ID
Previous wraps
Next wraps
Delete middle
Delete last
Delete first selects new first
single-network Reset preserves collection non-empty invariant
Reset preserves stable network ID
```

## 33. Global history tests

Add tests for:

```text
ordinary edit on Network A
manual switch to Network B
Undo returns to Network A / original Outpost
Redo returns to action context

manual switching creates no history entry

new action after Undo clears Redo

Add Network Undo/Redo restores correct before/after context
Delete Network Undo/Redo restores correct before/after context
Reset one-network Undo/Redo
Add Outpost Undo/Redo restores contextual selection
Delete Outpost Undo/Redo restores contextual selection
Import Undo/Redo restores collection + context
Redo remains correct after manual navigation following Undo
```

The last case is especially important.

## 34. Working-context normalization tests

Test:

```text
valid network + outpost
missing outpost fallback
missing network fallback
invalid activeNetworkId fallback
network with no outposts => null outpost
activeNetworkId/context invariant
```

## 35. History label tests

Test:

```text
single-network concise label
multi-network Network N prefix
ordinal frozen at action time
Delete prefix uses pre-delete ordinal
Add prefix uses post-add ordinal
Import networks has no Network N prefix
```

## 36. Character Level tests

Test:

```text
blank => null
1 valid
999 valid
0 invalid
1000 invalid
negative invalid
decimal invalid
non-numeric invalid
Undo/Redo synchronization
```

Also update domain validation tests.

## 37. Import/export tests

Test:

```text
whole collection serialization
ordered SavedNetwork entries preserved
stable IDs preserved
activeNetworkId preserved
external collection import succeeds
bare single-network external import rejected
invalid activeNetworkId falls back to first
duplicate imported network IDs rejected/diagnosed
failed import leaves state/history/context unchanged
filename name + level
filename name only
filename level only
filename neither
```

## 38. UI tests

Cover behavior rather than pixels:

```text
NETWORK ordinal text
Previous/Next wrap
Add button
Delete/Reset button
confirmation mode changes by network count
Character Level field present in correct order
history tooltip labels update
```

Avoid brittle exact CSS snapshot tests.

---

# PART P — DOCUMENTATION

## 39. Update durable docs after implementation

Update at least:

```text
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
README.md
```

### ARCHITECTURE

Document collection-level editing session, global history, working context, whole-collection import/export, and session-only selected-outpost memory.

### DOMAIN-RULES

Document network ordering, Add Network character carry-forward, Delete vs Reset semantics, collection non-empty invariant, and stable hidden network IDs.

### UX-DESIGN

Document the far-right network control cluster, ordinal selector, compact symbol buttons, and durable rule:

> **Undo/Redo restores both data and the Network + Outpost working context of the traversed action.**

### BACKLOG

Remove/adjust conflicting backlog items, especially:

```text
Export Current / Export All split
Undo navigation as optional
manual pane resizing/collapse work that the user has explicitly closed
```

Do not add speculative copy/paste-outpost backlog work.

### README

Update user-facing capability summary for multiple networks and collection import/export.

---

# PART Q — OUT OF SCOPE

## 40. Do not add

Do not implement:

```text
network names
network menu
network reordering
network keyboard shortcuts
dot/pagination strip
copy/paste outposts
cross-network cargo
network comparison
planner/optimizer behavior
persistent history
history timeline UI
Export Current
manual pane resizing
additional collapse systems
```

---

# PART R — IMPLEMENTATION SEQUENCE

## 41. Recommended order

Follow this sequence unless the codebase strongly suggests a safer equivalent:

1. Add/refactor pure collection lifecycle/navigation helpers.
2. Add `WorkingContext` normalization.
3. Promote history to collection-level before/after snapshots + context.
4. Replace `NetworkEditingSession` with collection-level session/reducer.
5. Refactor `App.tsx` state ownership and direct collection persistence.
6. Convert ordinary active-network edits to collection transactions.
7. Fix Add/Delete Outpost contextual history.
8. Add Previous/Next/Add/Delete/Reset Network lifecycle actions.
9. Convert import/export to whole-collection contracts.
10. Add Character Level field + validation + filename support.
11. Add PageHeader network cluster.
12. Reset/key network-bound presentation state where necessary.
13. Update tests.
14. Update durable documentation.
15. Run full verification.

Keep the app working at each practical checkpoint.

---

# PART S — REPOSITORY CLEANLINESS

## 42. Verification

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also manually smoke-test at least:

```text
Add Network
Previous/Next wrap
Delete first/middle/last network
single-network Reset
character carry-forward from last-added network
ordinary network switching with remembered outpost
Undo edit across network switch
Redo after Undo + manual network switch
Add/Delete Outpost contextual Undo/Redo
Add/Delete/Reset Network Undo/Redo
whole-collection Export
whole-collection Import
Import Undo/Redo
Character Level 1 / 999 / blank / invalid
header wrapping at normal desktop widths
```

Do not commit or push.

---

# PART T — COMPLETION REPORT

## 43. Report back with

Provide:

### Architecture
- final session/reducer shape;
- history entry shape;
- context normalization behavior;
- selected-outpost memory behavior.

### Lifecycle
- Add behavior;
- Delete behavior;
- Reset behavior;
- Previous/Next wrap behavior.

### Undo/Redo
- ordinary edit context restoration;
- Add/Delete Outpost restoration;
- Add/Delete/Reset Network restoration;
- Import restoration;
- Redo-after-manual-navigation behavior.

### Import/export
- new external JSON shape;
- localStorage migration retained;
- external legacy bare-network behavior;
- filename examples.

### Character Level
- validation behavior;
- UI placement.

### UI
- final PageHeader grouping;
- `<`, `>`, `+`, `-` accessibility behavior;
- ordinal display.

### Presentation-state handling
- what resets/remounts on network boundaries;
- what remains app-global.

### Tests / verification
- final test count;
- build/lint status;
- `git diff --check`;
- manual smoke-test results.

### Files changed
List all modified/added/deleted files.

### Deviations
Call out any deviation from this brief and explain why.

---

## 44. Final instruction

Implement the lifecycle slice as one coherent architectural change.

The desired result is:

> **An ordered collection of Starfield outpost networks with compact lifecycle controls, whole-collection import/export, and one global Undo/Redo timeline that always takes the user back to the Network + Outpost where the traversed action occurred.**
