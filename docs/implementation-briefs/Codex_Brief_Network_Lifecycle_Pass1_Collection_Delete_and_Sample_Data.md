# Codex Implementation Brief — Network Lifecycle Pass 1: Collection Foundation, Delete Network, and Sample Fixture Refresh

## Objective

Introduce the first network-lifecycle foundation for Starfield Outpost Network.

A **network** represents the player's outpost network in one Starfield universe. The player may later move through the Unity and create a newer network while retaining older ones, so networks have an **ordered sequence** from older to newer universes.

This batch should prepare the application for future multi-network use without exposing full network switching yet.

Implement:

1. an ordered persisted collection capable of storing multiple networks;
2. transparent migration from the current single-network browser-storage format;
3. one currently active network, still the only network exposed in the UI;
4. a confirmed, Undoable `Delete Network` action that resets the current network to a blank default state;
5. first-run startup using a blank default network rather than `sampleNetwork`;
6. refresh `sampleData.ts` so it uses the current schema/reference-data model and remains useful for Codex/tests;
7. preserve existing current-network import/export behaviour.

Do **not** expose `+ Add Network`, network switching, tabs, back/forward navigation, `Export All`, or collection import/export yet.

Codex must **not commit or push**.

---

# 1. Read first

Read and follow:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect at minimum:

- `src/domain/models.ts`
- `src/domain/defaults.ts`
- `src/domain/sampleData.ts`
- `src/data/storage.ts`
- `src/data/networkMigration.ts`
- `src/data/serialization.ts`
- `src/domain/networkEditingSession.ts`
- `src/domain/history.ts`
- `src/App.tsx`
- `PageHeader` and relevant header controls
- existing persistence/import/export tests

Preserve this boundary:

> `OutpostNetwork` is the gameplay document for one universe. Collection/document-management metadata should not be mixed into gameplay state without a deliberate reason.

---

# 2. Product semantics

## 2.1 One network = one universe

One `OutpostNetwork` represents one player's outpost network in one Starfield universe.

The same character may continue through later universes, but each network should retain the character details recorded for that universe. Do **not** move `Character` out of `OutpostNetwork`.

Historical networks may legitimately preserve different character names, levels, or skill ranks.

## 2.2 Ordered sequence

Future multiple networks are ordered:

```text
networks[0] = oldest recorded universe
networks[1] = next universe
...
networks[n] = newest recorded universe
```

Stable IDs identify networks; array order represents sequence.

---

# 3. Persisted network collection

Add a storage-level collection model, conceptually:

```ts
export interface SavedNetwork {
  id: string
  network: OutpostNetwork
}

export interface NetworkCollection {
  schemaVersion: number
  networks: SavedNetwork[]
  activeNetworkId: string
}
```

Exact names/file placement may follow repository conventions.

Keep collection metadata minimal. Do **not** add yet:

- network display name;
- universe number;
- timestamps;
- notes;
- tabs;
- UI metadata beyond `activeNetworkId`.

For this pass the collection may technically contain multiple networks, but the UI still exposes only the active one.

---

# 4. Collection schema/versioning

Give `NetworkCollection` its own schema/version strategy.

Do **not** reuse `OutpostNetwork.schemaVersion` as the collection version.

These are distinct schemas:

```text
NetworkCollection schema
    = storage/document collection structure

OutpostNetwork schema
    = one universe's gameplay state
```

Keep their migration responsibilities separate.

---

# 5. Storage migration

Current browser storage holds one `OutpostNetwork` under a single key.

Refactor persistence so browser storage owns one `NetworkCollection`.

## 5.1 Existing single-network data

If old single-network storage is found:

1. migrate it through the existing OutpostNetwork migration;
2. create a stable `SavedNetwork.id`;
3. wrap the migrated network in a one-element collection;
4. set that ID as `activeNetworkId`;
5. persist the new collection representation.

Preserve the user's gameplay data exactly apart from ordinary existing schema migration.

## 5.2 First run

If no saved network/collection exists:

1. create a stable network ID;
2. create `createDefaultNetwork()`;
3. create a one-element collection;
4. make it active.

Do **not** use `sampleNetwork` as normal first-run user data.

---

# 6. Storage API

Keep browser persistence in the data layer; React components must not call `localStorage` directly.

Possible API concepts:

```ts
loadNetworkCollection()
saveNetworkCollection(collection)
createDefaultNetworkCollection()
getActiveSavedNetwork(collection)
```

Exact names may vary.

The rest of the app should continue editing an `OutpostNetwork` through the existing editing-session architecture rather than being forced to understand storage details.

---

# 7. Editing-session boundary

The current `NetworkEditingSession` owns:

```text
current OutpostNetwork
Undo/Redo history
```

Preserve that model for the active network.

Do **not** place the whole collection into Undo/Redo history in this pass.

Conceptually:

```text
active SavedNetwork.network
    ↓
NetworkEditingSession
```

When the active network changes through normal editing, update the matching `SavedNetwork.network` in persisted collection storage while preserving all other saved networks and their order.

---

# 8. Multiple-network capability without UI exposure

The implementation should genuinely support:

```text
networks.length > 1
```

even though normal UI cannot create or switch between them yet.

Tests must prove:

- multiple saved entries persist;
- order is preserved;
- `activeNetworkId` resolves one entry;
- editing/saving the active network does not overwrite inactive networks.

Do not create hidden production UI for switching.

---

# 9. Delete Network feature

Add a visible:

```text
Delete Network
```

control with network-level header actions.

In **this first pass**, Delete Network does **not** remove the collection entry.

Its semantics are:

> replace the contents of the current active network slot with a fresh blank `createDefaultNetwork()`.

Keep the same `SavedNetwork.id` and the same `activeNetworkId`.

Future true multi-network deletion may remove an entry, but that is out of scope.

---

# 10. Delete confirmation

Require explicit confirmation because this operation clears the whole current network.

A native confirmation prompt is acceptable for now if it avoids creating a modal framework.

Suggested wording:

```text
Delete this network and start again?
```

If cancelled:

- no network change;
- no Undo entry;
- no selection change;
- no storage change.

---

# 11. Delete Network Undo/Redo

Confirmed Delete Network must be one ordinary Undoable whole-network replacement:

```text
current populated OutpostNetwork
    ↓ Delete Network
createDefaultNetwork()
```

Required behaviour:

- Delete = one Undo entry;
- Undo restores the whole previous network;
- Redo clears it again;
- new edits after Undo clear Redo normally.

Do not implement Delete as a direct `localStorage` destructive operation that bypasses history.

Do not create per-outpost/per-resource Undo entries.

---

# 12. Selected outpost after Delete

After confirmed Delete there are no outposts, so selected-outpost presentation state must become empty/valid.

Selected outpost remains session-only and must not become persisted collection metadata.

When Undo restores the previous network:

- restore the previously selected outpost if this can be done cleanly within existing session-state ownership;
- otherwise select the first valid restored outpost according to existing replacement-selection conventions.

Do not add persisted selected-outpost state merely to recover selection.

Report the implemented behaviour.

---

# 13. Validation after Delete

A blank `createDefaultNetwork()` should naturally have no network validation issues under normal reference-data conditions.

Do not special-case validators to force this result.

Undo should naturally restore the previous network and therefore its previous validation results.

---

# 14. Import/export remains current-network only

Do not expose collection transfer yet.

## Export

Current `Export` continues to export only the active `OutpostNetwork`.

Do not rename it to `Export Current` yet; that belongs with the later visible multi-network feature.

Do not export the collection.

## Import

Current Import continues to deserialize one `OutpostNetwork` and replace the active network only after successful parsing.

Import remains one Undoable network replacement.

It must update only the active `SavedNetwork.network` in collection persistence and must preserve inactive networks.

Do not create a new collection entry on import in this pass.

---

# 15. `sampleData.ts` role

`sampleNetwork` must stop being a normal startup fallback.

It becomes:

> an explicit development/test/smoke-test fixture.

Keep it if useful; do not show it automatically to a new user.

## 15.1 Refresh sample data

Update `sampleData.ts` to use the current schema and current canonical reference IDs.

The existing fixture contains legacy location IDs such as:

```text
feynman
feynman-vi-b
```

which no longer match current runtime reference identity and have caused misleading smoke-test behaviour.

Replace them with valid current runtime IDs and current shapes, including:

- canonical `systemId`;
- canonical `bodyId`;
- `selectedBiomeIds`;
- production-route objects;
- current cargo/link representations.

Prefer a compact but useful fixture rather than a huge scenario.

It should not immediately produce irrelevant unknown-reference or location mismatch issues simply because its identifiers are obsolete.

Using:

```ts
selectedBiomeIds: []
```

is appropriate unless a test explicitly benefits from selected biomes.

## 15.2 Sample data is not the default template

Do not make `createDefaultNetwork()` depend on sample data.

User-facing defaults remain blank.

---

# 16. Malformed collection recovery

Handle basic collection corruption defensively.

At minimum consider:

- `activeNetworkId` not matching any entry;
- empty `networks` array;
- malformed `SavedNetwork` wrapper;
- malformed nested `OutpostNetwork`.

Follow the repository principle:

> preserve recoverable user data rather than inventing or silently deleting content.

If no valid active network can be recovered, fall back safely to a one-element collection containing a blank default network.

Do not implement elaborate repair heuristics.

Report the recovery rules.

---

# 17. Tests

Add regression coverage at minimum for:

## 17.1 First run

- no storage -> one SavedNetwork;
- `activeNetworkId` resolves it;
- nested network has blank default semantics;
- `sampleNetwork` is not used.

## 17.2 Legacy single-network migration

- old single network becomes one-element collection;
- gameplay data is preserved;
- stable collection-network ID is added;
- `activeNetworkId` points to it.

## 17.3 Multiple entries

- at least two networks can save/load;
- order is preserved;
- active network resolves correctly;
- editing active network leaves inactive one unchanged.

## 17.4 Delete Network

- cancel -> no change;
- confirm -> blank default network;
- `SavedNetwork.id` unchanged;
- collection length unchanged;
- `activeNetworkId` unchanged;
- selected outpost becomes valid/empty;
- blank network has no ordinary validation issues;
- one Undo restores previous network;
- Redo clears it again.

If native `confirm()` is awkward to test, keep confirmation in a thin UI layer and test the pure reset operation separately.

## 17.5 Import/export compatibility

- Export still serializes one `OutpostNetwork`;
- Import replaces active network only;
- inactive saved networks survive unchanged;
- failed import leaves collection/current network unchanged.

## 17.6 Sample fixture

Add a sanity test that `sampleNetwork`:

- is structurally current;
- serializes/migrates correctly;
- uses valid current reference IDs where reference data is available;
- does not create irrelevant unknown-location errors due solely to legacy IDs.

---

# 18. Documentation updates

## `docs/ARCHITECTURE.md`

Document:

- one `OutpostNetwork` = one universe;
- `NetworkCollection` storage wrapper;
- ordered sequence semantics;
- stable SavedNetwork IDs;
- `activeNetworkId`;
- collection persistence vs active editing-session separation;
- first-pass Delete Network reset semantics;
- sampleNetwork no longer normal startup data;
- current import/export remains active-network only.

Update the architecture summary that currently says persistence is “current network only”.

## `docs/DOMAIN-RULES.md`

Record only durable product/domain semantics that belong there:

- network represents one universe;
- network order reflects universe progression;
- character data remains snapshot-local to each network.

Avoid storage implementation detail here.

## `docs/BACKLOG.md`

Create/update a `Network lifecycle` section.

Keep deferred:

- expose multiple-network UI;
- `New Network` / `+ Add Network`;
- Back/Forward or selector interaction;
- true deletion of one collection entry;
- network naming/labels if needed;
- rename `Export` -> `Export Current`;
- `Export All`;
- collection-level import/backup;
- network-switching Undo-history semantics;
- network operations cluster.

Also add the deferred Ocean-biome investigation if not already present:

> Test whether Ocean should remain selectable for coastline/boundary outposts or is operationally redundant.

---

# 19. Explicitly out of scope

Do **not** implement:

- `+ Add Network` / `New Network`;
- visible network selector;
- tabs;
- Back/Forward network navigation;
- true collection-entry deletion;
- network naming;
- universe numbering;
- timestamps;
- per-network notes;
- `Export All`;
- collection JSON exposed to users;
- collection import;
- cross-network planning;
- solar/wind efficiency;
- Ocean-biome behaviour changes;
- scrollbar work;
- visual styling overhaul.

---

# 20. Verification

Run the full regression suite, then:

```text
npm run lint
npm run build
git diff --check
```

Perform browser smoke tests.

Verify:

1. existing locally saved network loads through migration unchanged;
2. reload persists collection-capable storage;
3. first-run/no-storage state is blank, not sample data;
4. Delete Network asks for confirmation;
5. Cancel preserves everything;
6. Confirm produces blank character/outposts/network;
7. validation is naturally clear on the blank network;
8. Undo restores the previous network;
9. Redo resets it;
10. Import still replaces current network only;
11. Export still exports current OutpostNetwork only;
12. sample fixture can be deliberately loaded/tested with current reference IDs;
13. no console errors;
14. temporary smoke-test state is restored/cleaned up.

Be especially careful not to destroy the user's real localhost network during testing. Use backup/restore or a disposable browser profile/storage context where practical.

---

# 21. Implementation quality constraints

- Keep `OutpostNetwork` focused on one universe's gameplay state.
- Keep collection/document metadata outside it.
- Preserve ordered collection semantics.
- Preserve stable network IDs.
- Keep whole-network editing Undoable.
- Do not put collection operations into current history unless explicitly required.
- Do not let sample data become user defaults.
- Preserve inactive networks when saving active edits.
- Avoid broad `App.tsx` refactoring unrelated to lifecycle ownership.
- Maintain zero lint warnings/errors.
- Do not commit or push.

---

# 22. Codex completion report

When finished, report:

1. files changed/added/deleted;
2. final `NetworkCollection` / `SavedNetwork` type shapes;
3. collection schema version strategy;
4. legacy localStorage migration behaviour;
5. first-run behaviour;
6. active-network save/update behaviour;
7. Delete Network confirmation/reset semantics;
8. Undo/Redo behaviour for Delete;
9. selected-outpost behaviour after Delete and Undo;
10. import/export behaviour;
11. `sampleData.ts` changes and canonical test locations chosen;
12. malformed collection recovery rules;
13. tests added/updated and total passing count;
14. lint result;
15. build result;
16. `git diff --check` result;
17. browser smoke-test result;
18. confirmation that real test data was restored/not destroyed;
19. deferred multi-network UI items;
20. any architectural issue or ambiguity discovered.

Do not commit or push.
