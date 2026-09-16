# Codex Correction Brief — Verify Historical Browser-Storage Compatibility

## Objective

Perform one narrow verification/correction pass before committing the browser-storage recovery hardening.

The new pre-migration storage-coherence validator is intentionally stricter than the historical migration code so malformed browser data is no longer silently filtered or partially salvaged.

That architecture is correct, but it now becomes the gatekeeper for **all legitimate historical browser-storage schemas**.

The task is therefore to prove that every supported pre-current schema shape still reaches the current schema through the full browser-storage initialization path.

If a legitimate historical fixture is rejected by the new coherence layer, relax only the specific coherence rule needed to preserve deterministic historical migration.

Do not redesign the storage architecture.

## Important naming rule

Audit/slice identifiers used in discussion are transient shorthand only.

Do **not** introduce those identifiers into:
- filenames;
- source code;
- tests;
- comments;
- documentation;
- localization keys;
- error codes;
- generated artifacts.

Use durable descriptive names only.

---

## Read first

Inspect the current uncommitted browser-storage implementation, especially:

- `src/data/storageCoherence.ts`;
- `src/data/storage.ts`;
- `src/data/networkMigration.ts`;
- `src/data/networkCollection.ts`;
- existing lifecycle/migration/resource-persistence tests;
- existing historical migration fixtures;
- current schema-version constants and migration branches.

Use the current working tree as the source of truth.

---

## Primary question

For every historical network schema version still supported by migration:

- schema 1;
- schema 2;
- schema 3;

confirm that a legitimate persisted representation from that schema:

1. passes the browser-storage resource envelope;
2. passes the pre-migration storage-coherence validator;
3. migrates deterministically;
4. passes recovered-collection identity/coherence checks;
5. returns from `initializeNetworkCollection()` as the expected current-schema collection;
6. is not incorrectly routed to `recovery-fallback`.

The full storage initialization path matters.

Do not prove compatibility only by calling `migrateNetworkData()` directly.

---

## Use existing historical fixtures where possible

Prefer the repository’s existing migration fixtures/tests over inventing new historical shapes.

Identify the strongest existing examples for schemas 1, 2 and 3.

If an existing fixture already represents a real supported historical form, reuse it.

Only construct a new fixture when a transition is not already covered.

---

## Required transition coverage

At minimum, make sure the compatibility pass exercises the historical differences now encoded in `validateStoredSource()`.

### Schema 1

Cover representative schema-1 behavior such as:

- historical bare-network storage representation if supported;
- legacy pad-local `link`;
- legacy `link.exports`;
- older destination structure;
- fields legitimately absent in schema 1;
- migration of legacy Cargo Link state into current network-level links.

The exact fixture should follow the real historical migration rules already present in the repo.

### Schema 2

Cover representative schema-2 behavior such as:

- schema-2 production-route representation;
- arrays/fields that became required by this point;
- absence of later schema-3/4-only fields where historically valid;
- no accidental rejection because the coherence validator assumes a newer representation.

### Schema 3

Cover representative schema-3 behavior such as:

- fields/arrays present before schema 4;
- lack of schema-4 character capabilities where legitimate;
- lack of schema-4 explicit resource-presence shape where legitimate;
- successful upgrade to current schema.

### Schema 4 current baseline

Also retain/confirm one current-schema browser-storage success test so this correction does not regress current data.

---

## Exact validation target

For each supported historical schema test:

- place the serialized historical fixture in mocked browser storage;
- call `initializeNetworkCollection()`;
- assert the returned persistence status is `saved` when the mock write succeeds;
- assert the returned collection is current schema;
- assert the deterministic migrated fields expected from that historical version;
- assert the normalized current collection is written successfully.

If the test deliberately forces the normalized write to fail, `unsaved` is acceptable, but that should be a separate save-failure test rather than the compatibility baseline.

---

## If a legitimate historical fixture fails

Determine which layer rejected it:

1. raw storage envelope;
2. `validateStoredSource`;
3. migration;
4. `validateRecoveredCollection`.

The likely target is `validateStoredSource`.

If the fixture is genuinely supported historical state:

- relax only the specific pre-migration coherence rule that is too strict;
- preserve deterministic migration;
- keep malformed ambiguous state rejected;
- do not reintroduce silent partial salvage.

Document the reasoning in the test or nearby durable code comment only if the historical distinction is not obvious from the code.

---

## Do not broaden recovery permissiveness unnecessarily

This correction is **not** permission to make browser storage generally lenient again.

Do not:

- allow malformed current-schema fields;
- allow duplicate identities;
- allow empty stable IDs;
- allow malformed saved-network wrappers;
- allow invalid current-schema `cargoLinks`;
- silently filter malformed nested items;
- skip a broken network and keep the rest.

The only permitted relaxation is for a shape that is valid for a historical schema and deterministically migratable.

---

## Migration/coherence ownership

Preserve the intended separation:

### `validateStoredSource`
Responsible for:
- rejecting structurally incoherent/ambiguous stored source;
- respecting historical schema differences;
- preventing migration from silently hiding malformed data.

### Migration
Responsible for:
- deterministic historical transformations;
- adding/defaulting fields that were legitimately absent in older schemas;
- converting known old representations to the current model.

### `validateRecoveredCollection`
Responsible for:
- checking current runtime identity/coherence after migration.

Do not duplicate every migration transformation inside the source validator.

---

## Tests

Add focused regression coverage.

### Required tests

At minimum:

- schema 1 browser-storage initialization succeeds;
- schema 2 browser-storage initialization succeeds;
- schema 3 browser-storage initialization succeeds;
- schema 4/current browser-storage initialization succeeds.

Each should pass through:

`initializeNetworkCollection()`

not merely the migration helper.

### Assertions

For each:
- persistence status;
- current schema version;
- representative migrated field(s);
- source normalization/write success.

### Preserve negative coverage

Existing malformed/partial-salvage rejection tests must still pass.

In particular, continue rejecting:
- malformed one-of-many network collection;
- duplicate saved-network IDs;
- empty IDs;
- malformed nested current state;
- identity collisions.

---

## Optional fixture consolidation

If existing historical fixtures are duplicated across several test files, a small test-helper extraction is acceptable if it improves clarity.

Do not perform a broad test-suite refactor.

---

## Production scope

Do not change:

- browser-storage resource ceilings;
- source-preservation behavior;
- autosave suppression;
- persistence status model;
- retry behavior;
- external import;
- localization;
- Status Bar behavior;
- preference storage;
- history semantics;
- export filename handling.

No new product behavior is intended unless a historical schema rule must be relaxed for legitimate migration.

---

## Verification

Run at minimum:

- focused historical migration tests;
- focused browser-storage recovery tests;
- focused browser-storage App tests;
- fixture verifier if already present;
- `npm test`;
- `npm run test:components`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

If any coherence rule changes, also rerun the malformed-source rejection tests specifically.

No new browser benchmark or manual browser campaign is required unless a historical compatibility correction unexpectedly changes runtime behavior.

---

## Completion response

Return:

1. concise summary;
2. files changed;
3. historical schema fixtures/tests used;
4. schema-1 result;
5. schema-2 result;
6. schema-3 result;
7. current-schema result;
8. whether any `validateStoredSource` rule had to be relaxed;
9. if relaxed, exact rule and why;
10. confirmation malformed/ambiguous recovery cases still reject atomically;
11. verification commands/results;
12. confirmation browser-storage limits are unchanged;
13. confirmation persistence/retry/status behavior is unchanged;
14. confirmation external-import behavior is unchanged;
15. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
