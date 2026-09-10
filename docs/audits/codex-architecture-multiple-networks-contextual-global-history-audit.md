# Architecture audit: multiple networks + contextual global history

The repository already has a sound persisted multi-network foundation, but the live editing architecture remains fundamentally single-network. The smallest coherent path is to promote the editing session and history to `NetworkCollection` level, while keeping ordinary navigation and chrome state outside history.

No implementation or documentation files were changed.

## 1. Current architecture

### Collection persistence

[networkCollection.ts](D:/Projects/starfield-outpost-network/src/data/networkCollection.ts:10) already defines:

```ts
interface SavedNetwork {
  id: string
  network: OutpostNetwork
}

interface NetworkCollection {
  schemaVersion: number
  networks: SavedNetwork[]
  activeNetworkId: string
}
```

Current behavior:

- Collection schema version is `1`.
- Network order is array order.
- `SavedNetwork.id` provides stable identity.
- `activeNetworkId` falls back to the first valid entry when invalid.
- Duplicate IDs and malformed entries are skipped during recovery.
- An empty/unrecoverable collection becomes one default network.
- Legacy browser storage containing a bare `OutpostNetwork` is wrapped in a one-entry collection with a fresh ID.
- Browser storage uses `localStorage["starfield-outpost-network"]`.
- Loading immediately writes the migrated/recovered collection back.
- `updateActiveNetwork()` replaces only the active document while preserving inactive entries, IDs, and order.

This is the necessary persisted foundation. Missing pieces are lifecycle transformations, collection-level session/history, switching, whole-collection interchange, and UI exposure.

### Editing session and history

[networkEditingSession.ts](D:/Projects/starfield-outpost-network/src/domain/networkEditingSession.ts:48) currently owns:

```ts
interface NetworkEditingSession {
  network: OutpostNetwork
  history: NetworkHistory
}
```

[history.ts](D:/Projects/starfield-outpost-network/src/domain/history.ts:54) stores one restore snapshot per stack entry:

```ts
interface NetworkHistoryEntry {
  network: OutpostNetwork
  label: string
  timestamp: number
}
```

`App.tsx` initializes the reducer exactly once from the startup active network. Every normal edit passes an `OutpostNetwork => OutpostNetwork` callback through `applyUndoableNetworkChange()`.

A persistence effect then mirrors the reducer’s one network back into `collectionRef.current` through `updateActiveNetwork()`.

Consequences:

- Inactive networks never enter the reducer or history.
- There is no reducer action that can switch active documents.
- Collection lifecycle changes cannot be represented atomically.
- Undo/Redo cannot restore a network selection.
- Selection changes are separate React updates and are not synchronized atomically with history traversal.

### Current selection and presentation state

| State | Current owner | Recommended classification |
|---|---|---|
| `activeNetworkId` | Persisted collection/ref | Persisted; `networkId` must also be recorded as history working context |
| `selectedOutpostId` | `App` state | Must participate in minimum history context |
| Per-network last selected outpost | Not present | Add as session-only presentation state; do not snapshot the whole map |
| Navigation open/collapsed | `App` state | Presentation-only |
| Navigation Reshuffle and drag state | `OutpostList` | Presentation-only |
| Cargo Pad expansion/Reshuffle/drag state | `CargoPadsEditor` | Presentation-only |
| `cargoPadsPresentationKey` | `App` numeric state | Presentation-only; should become network-aware/reset-aware |
| Planned Supply expanded state | `PlannedSupplyEditor` | Presentation-only |
| Validation panel open and active row | `ValidationSummary` | Presentation-only |
| Status messages | `App` | Presentation-only |
| About/confirmation modal state | `App` | Presentation-only |
| Reference-data state/errors | `App` | External/session state; never history |
| Scroll/focus/sub-editor drafts | Components | Presentation-only |

The current `selectedOutpostBeforeDelete` ref is an action-specific workaround. It should disappear once history records general before/after working context.

### Import/export

Current contracts are single-network-specific:

- `serializeNetwork(OutpostNetwork)` emits pretty-printed schema-3 `OutpostNetwork` JSON.
- `deserializeNetwork()` parses a bare network through `migrateNetworkData()`.
- Export accepts one `OutpostNetwork`.
- Import returns one `OutpostNetwork`.
- Export filename includes normalized character name and local timestamp, but not level.
- Successful import enters history in `App.importNetwork()` as one `"Import network"` replacement.
- Imported selection is then changed separately to the first outpost.
- Import increments `cargoPadsPresentationKey`.
- Failed parsing occurs before the callback, so data, history, and selection remain unchanged.

### Page and character header

[PageHeader.tsx](D:/Projects/starfield-outpost-network/src/ui/layout/PageHeader.tsx:25) has only `main` and `actions` regions. Its two-column grid already supports a right-hand area, but a distinct far-right network cluster is advisable.

Current action order is:

```text
Delete Network, Delete Outpost, Undo, Redo, Export, Import
```

[CharacterHeader.tsx](D:/Projects/starfield-outpost-network/src/ui/components/CharacterHeader.tsx:155) shows:

```text
Character, Outpost Management, Planetary Habitation
```

`Character.level` already exists in:

- the persisted model;
- defaults as `null`;
- migration;
- serialization;
- validation.

Therefore returning Level to the UI requires no schema migration.

However, [invalidCharacterLevel.ts](D:/Projects/starfield-outpost-network/src/domain/validation/rules/invalidCharacterLevel.ts:46) currently accepts every positive integer. It must gain the locked upper bound of `999`.

## 2. Highest-risk collision points

| File/function | Collision |
|---|---|
| [App.tsx reducer initialization](D:/Projects/starfield-outpost-network/src/App.tsx:103) | Extracts one active document once; changing `activeNetworkId` cannot reinitialize or replace reducer state |
| [App.tsx persistence effect](D:/Projects/starfield-outpost-network/src/App.tsx:345) | Recombines one reducer document with a mutable collection ref; unsafe once switching/lifecycle actions exist |
| [applyUndoableNetworkChange](D:/Projects/starfield-outpost-network/src/App.tsx:360) | Accepts only an active-network transformation and knows no action context or affected network |
| [addOutpost](D:/Projects/starfield-outpost-network/src/App.tsx:564) | Selection is changed outside history; Undo cannot restore the previous selection |
| [deleteOutpost](D:/Projects/starfield-outpost-network/src/App.tsx:620) | Selects a survivor outside history; Undo does not select the restored outpost |
| [undo/redo](D:/Projects/starfield-outpost-network/src/App.tsx:1339) | Contains a label-based Delete-network special case rather than general contextual traversal |
| [deleteNetwork](D:/Projects/starfield-outpost-network/src/App.tsx:1363) | Actually resets one `OutpostNetwork`; cannot delete a collection entry |
| [importNetwork](D:/Projects/starfield-outpost-network/src/App.tsx:1770) | Replaces one network and changes selection separately |
| [PageHeader composition](D:/Projects/starfield-outpost-network/src/App.tsx:1818) | No network-navigation cluster and wrong target action ordering |
| [history.ts](D:/Projects/starfield-outpost-network/src/domain/history.ts:54) | Snapshots only `OutpostNetwork`; no collection or before/after context |
| [networkEditingSession.ts](D:/Projects/starfield-outpost-network/src/domain/networkEditingSession.ts:48) | Entire reducer contract assumes one document |
| [networkCollection.ts](D:/Projects/starfield-outpost-network/src/data/networkCollection.ts:105) | Only collection edit is “replace active network”; no lifecycle/navigation helpers |
| [serialization.ts](D:/Projects/starfield-outpost-network/src/data/serialization.ts:5) | Public interchange contract is a bare network |
| [NetworkExportButton](D:/Projects/starfield-outpost-network/src/ui/components/NetworkExportButton.tsx:5) | Accepts and exports one network |
| [NetworkImportButton](D:/Projects/starfield-outpost-network/src/ui/components/NetworkImportButton.tsx:6) | Produces one network |
| [exportFileName.ts](D:/Projects/starfield-outpost-network/src/data/exportFileName.ts:52) | No character-level segment |
| [CharacterHeader.tsx](D:/Projects/starfield-outpost-network/src/ui/components/CharacterHeader.tsx:35) | No level callback/field; rank editor hardcodes `0–4` |
| [defaults.ts](D:/Projects/starfield-outpost-network/src/domain/defaults.ts:6) | Default network contains zero outposts; Add Network specifically requires one new default outpost |
| [networkLifecycle.test.ts](D:/Projects/starfield-outpost-network/tests/networkLifecycle.test.ts:99) | Tests encode first-pass “Delete means reset” and active-network-only interchange |
| Cargo/Navigation component state | Components remain mounted across network changes unless keyed or explicitly reset; drag/reshuffle/expansion state may leak |

A particularly important trap is Redo after manual switching. If history stores only the before snapshot, Undo would construct its Redo snapshot from the current collection—which may now contain a manually changed `activeNetworkId`. Redo would then return to the wrong network. Action-time after context must be retained.

## 3. Recommended target architecture

Yes: replace `NetworkEditingSession` with a collection-level session.

Conceptually:

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

Rules:

- `collection.activeNetworkId === context.networkId` is a reducer invariant.
- `selectedOutpostByNetworkId` is session-only convenience state and is not copied into history entries.
- Undo/Redo updates the cache with the restored entry context.
- Only `collection` is persisted.
- Immutable snapshots remain reference-based; no deep clone is needed.
- A history entry is moved between stacks rather than reconstructing the opposite snapshot.

Storing both before and after immutable references is recommended. It is slightly more metadata than today, but it makes contextual Redo correct after arbitrary manual navigation and makes lifecycle/import actions straightforward. Structural sharing means ordinary edits do not literally duplicate all nested data.

### Safe traversal

```ts
function normalizeHistoryState(state: HistoryState): HistoryState
```

should:

1. Restore the entry’s collection first.
2. Use `context.networkId` if it exists in that restored collection.
3. Otherwise use its valid `activeNetworkId`.
4. Otherwise use the first network.
5. Use `context.outpostId` if it exists in that resolved network.
6. Otherwise use the first outpost, or `null`.
7. Align `collection.activeNetworkId` with the resolved network.

Deleted networks/outposts normally exist in the relevant before snapshot and disappear in the relevant after snapshot, so valid history entries restore exactly. Fallback is defensive handling for corrupted imports, stale IDs, or implementation defects.

## 4. Lifecycle operation map

| Operation | Collection mutation | History entry | Active network | Selected outpost | Persisted |
|---|---:|---:|---|---|---:|
| Previous/Next switch | `activeNetworkId` only | No | Wrapped target | Cached valid selection, else first | Yes |
| Add Network | Append entry | One | New network | Its one default outpost | Yes |
| Delete with >1 | Remove current entry | One | Previous, or new first | Cached valid selection, else first | Yes |
| Reset with 1 | Replace nested document, preserve ID | One | Unchanged ID | First outpost or `null` for current blank default | Yes |
| Import | Replace entire collection | One | Imported valid active, else first | First outpost | Yes |
| Ordinary edit | Replace affected nested network | One | Action network | Action outpost/context | Yes |
| Undo | Restore `entry.before` | Traversal only | Before context | Before context | Yes |
| Redo | Restore `entry.after` | Traversal only | After context | After context | Yes |
| Manual outpost selection | No persisted mutation | No | Unchanged | Requested valid outpost | No |

Option B—remembering the last selected outpost per network—is recommended for ordinary switching. It is inexpensive, avoids repetitive navigation, and remains distinct from contextual history. History restoration must use the action entry’s exact context, not whatever is currently in the cache.

## 5. Collection helper boundaries

Recommended split:

- Domain/application collection module:
  - collection types;
  - pure selectors;
  - `setActiveNetwork`;
  - previous/next wrap;
  - append;
  - delete;
  - reset;
  - replace active network.
- Data layer:
  - collection schema version;
  - migration/recovery;
  - localStorage;
  - JSON serialization/deserialization.
- Collection editing-session reducer:
  - action-time history/context;
  - label prefixing;
  - Undo/Redo;
  - Redo invalidation.
- `App.tsx`:
  - dispatch actions;
  - derive active network and selected outpost;
  - presentation state and component composition.

For testability, ID creation should be passed into creation helpers or the helper should accept a fully created `SavedNetwork`.

Add Network must read character data from:

```ts
collection.networks.at(-1)!.network.character
```

—not from the active network—then explicitly clone:

- name;
- level;
- all five listed skill ranks.

It should combine that character with fresh network state and exactly one `createDefaultOutpost([])`.

Delete and Reset should be separate internal actions. They happen to share confirmation infrastructure, but have different invariants and lifecycle semantics.

## 6. History labels

Prefixing belongs in the collection session layer, not individual UI callers.

An undoable action should carry:

```ts
{
  baseLabel: string
  affectedNetworkId: string | null
}
```

The reducer formats and freezes the final label at action time:

- one network: existing concise label;
- multiple networks: `Network N: ${baseLabel}`;
- collection-wide import: a collection label such as `Import networks`, without a misleading single-network prefix.

For Delete, derive the ordinal from the pre-delete collection. For Add, derive it from the post-add collection. Stored labels must not be recomputed later because deletion changes current ordinals.

## 7. Import/export and migration strategy

### Retain for browser-local storage

Keep:

- the existing storage key;
- bare legacy `OutpostNetwork` → one-entry `NetworkCollection` migration;
- collection-v1 recovery;
- nested `OutpostNetwork` schema migration;
- active-ID fallback;
- preservation of recoverable local entries.

This protects current development data.

### Remove for external files

The new external import contract may reject bare single-network JSON. It should require a collection envelope.

Do not remove nested network-schema migration merely because bare-file compatibility is removed; older nested documents may still be recoverable inside a collection.

Prefer a distinct `deserializeNetworkCollection()` contract instead of reusing the lenient localStorage wrapper function implicitly. It should:

- parse the collection envelope;
- migrate each nested network;
- preserve order and stable IDs;
- reject or clearly diagnose malformed/duplicate imported entries rather than silently losing file contents;
- repair only an invalid `activeNetworkId` by selecting the first valid entry;
- guarantee a non-empty resulting collection.

The complete imported collection plus post-import context becomes the `after` side of one history entry. The current collection/context becomes `before`.

Export should serialize the whole collection. Filename generation should accept active character name and level:

```ts
createNetworkExportFileName(name, level, now)
```

Missing name or level segments should simply be filtered out.

## 8. Character Level impact

No model or persisted-schema migration is needed.

Required changes later:

- Add `onLevelCommit`.
- Add a Level draft field between Character and Outpost Management.
- Blank commits `null`.
- Accept integer `1–999`.
- Invalid text, `0`, non-integers, and values above `999` revert using the existing keyed-draft convention.
- Add an `App` collection edit for the active character level.
- Update domain validation to enforce both bounds.
- Provide a three-digit-capable width.
- Include level in the export filename.

## 9. Presentation-state handling

Recommended network-boundary behavior:

- Keep Navigation open/collapsed globally unchanged.
- Exit Navigation Reshuffle and cancel drag on network changes.
- Reset Cargo Pad reshuffle, drag, drafts, and expanded-pad state at network/import boundaries.
- A key containing stable network ID plus an import/replacement epoch is safer than the current import-only integer.
- Planned Supply expansion may remain general presentation state, though resetting it on network changes would also be defensible.
- Keep Validation open/closed state; allow its existing issue-key reconciliation to choose a valid row.
- Never place these values in history context.

## 10. File-by-file implementation plan

- `src/domain/networkCollection.ts` or equivalent:
  - collection types and pure lifecycle/navigation helpers.
- `src/data/networkCollection.ts`:
  - retain/move schema migration and local recovery responsibilities.
- `src/data/storage.ts`:
  - continue loading/saving whole collections unchanged in principle.
- `src/domain/history.ts`:
  - promote entries to before/after collection state plus context.
- `src/domain/networkEditingSession.ts`:
  - replace with `collectionEditingSession.ts`, or rewrite and rename deliberately.
- `src/App.tsx`:
  - initialize reducer from the whole collection;
  - remove `collectionRef`, `updateActiveNetwork()` persistence loop, special Delete ref, and separate history-sensitive selection updates;
  - dispatch lifecycle/navigation/context actions;
  - derive the active network from session collection.
- `src/data/serialization.ts`:
  - collection serialization/deserialization.
- `src/data/exportFileName.ts`:
  - add optional level.
- `NetworkExportButton.tsx`:
  - accept collection and active character metadata.
- `NetworkImportButton.tsx`:
  - return a migrated collection.
- `PageHeader.tsx` / `PageHeader.css`:
  - add a distinct far-right network-control region.
- `CharacterHeader.tsx` / `CharacterHeader.css`:
  - add Level and its commit contract.
- `invalidCharacterLevel.ts`:
  - enforce `1–999`.
- `tests/networkLifecycle.test.ts`:
  - replace first-pass reset/import/export assumptions and add lifecycle/global-history coverage.
- Documentation after implementation:
  - `ARCHITECTURE.md`: collection session/history/import-export.
  - `DOMAIN-RULES.md`: lifecycle and contextual restoration.
  - `UX-DESIGN.md`: header controls and durable context rule.
  - `BACKLOG.md`: remove conflicting deferred multi-network/export/current optional-history-navigation items.
  - `README.md`: multiple-network and collection-transfer capabilities.

The current backlog says to add “Export Current” and “Export All” and treats Undo navigation as optional. The new brief supersedes both: Export means the complete collection, and Network + Outpost context restoration is required.

## 11. Main risks and controls

- Stale context IDs: normalize against the restored snapshot.
- Deleted/restored networks and outposts: store both action-time states and contexts.
- Changing ordinals: freeze formatted labels at action time.
- Imported duplicate IDs: validate explicitly; do not merge by ID.
- Reducer initialization: initialize once from the whole collection, never remount per network.
- Persistence loops: save `session.collection` directly; remove the mirror/ref arrangement.
- Redo invalidation: every new undoable collection transaction clears `future`; navigation does not.
- Active-ID/context divergence: enforce reducer invariant centrally.
- Cargo/Navigation leakage: reset or key network-bound local interaction state.
- Failed import mutation: deserialize fully before dispatch.
- History memory: retain immutable references, avoid deep cloning, and defer history limits.
- Empty networks: support `outpostId: null`; Add Network remains the special one-default-outpost operation.

## 12. Recommended implementation sequence

1. Introduce collection types/pure lifecycle helpers and focused tests.
2. Introduce `WorkingContext` normalization and collection-level before/after history tests.
3. Replace the single-network editing reducer with the collection session.
4. Convert `App.tsx` persistence, ordinary edits, outpost lifecycle, Undo/Redo, and selection.
5. Add network switch/add/delete/reset actions and confirmation modes.
6. Convert import/export to the whole collection.
7. Add Character Level and filename support.
8. Add PageHeader network controls and network-bound presentation resets.
9. Add integration/UI regression coverage.
10. Run test, build, lint, manual lifecycle/history checks, and update durable documentation.

## Direct answers to the brief

1. Yes, `NetworkEditingSession` should become collection-level.
2. History should store immutable before/after `NetworkCollection` references plus before/after `WorkingContext`, label, and timestamp.
3. Represent each context as `{ networkId, outpostId: string | null }`.
4. Restore the collection first, then validate context against it and fall back to valid active/first network and first/null outpost.
5. Read and clone the character from `collection.networks.at(-1)`, then create fresh gameplay state and one new outpost.
6. Use distinct `delete-network` and `reset-only-network` operations sharing one confirmation component.
7. Import is one collection replacement transaction with before/current and after/imported collection plus contexts.
8. Ordinary switching changes current context and persisted `activeNetworkId` without history; Undo/Redo restores recorded action context.
9. Retain bare-network localStorage wrapping and all current local recovery/migration.
10. Remove external bare-`OutpostNetwork` import compatibility; require a collection envelope.
11. Highest risk: `App.tsx` reducer initialization/persistence/selection, history/session types, serialization, and existing lifecycle tests.
12. Implement collection helpers and history first, then App ownership, lifecycle UI, interchange, Level/header, tests, and docs.

Verification completed:

- `npm test`: 40/40 passed.
- `git diff --check`: passed.
- `git status --short`: only the supplied audit brief is untracked.
- No commit or push was performed.