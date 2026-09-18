# Codex Implementation Brief — Restore Static Type Agreement Across TypeScript Test Fixtures

## Objective

Implement the correction recommended by:

```text
docs/audits/TYPESCRIPT-TEST-FIXTURE-TYPE-AGREEMENT.md
```

The goals are to:

1. bring valid-domain TypeScript test fixtures and test API calls back into static agreement with current production/domain types;
2. preserve historical and malformed import/migration fixtures as intentionally invalid boundary data rather than pretending they are current valid domain objects;
3. add a durable semantic TypeScript check for the complete test suite, including both `.ts` and `.tsx`;
4. eliminate the current test-typecheck drift without weakening production types, compiler settings, or test coverage.

This is a **test-maintenance and confidence** parcel.

No production behavior change is intended.

Do not commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before editing:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Audit baseline

The audit found:

- 40 TypeScript diagnostics across 13 test files under an all-test semantic check;
- 34 diagnostics across 10 files tied to domain fixtures or domain API calls;
- the remaining six in component harness/localization test typing;
- current `tests/tsconfig.json` uses `noCheck: true`;
- current `tests/tsconfig.json` includes only `.ts`, not `.tsx`;
- Node test execution strips types without semantic checking;
- Vitest/Vite component tests transform TypeScript without a semantic type-check gate.

The audit classified this as:

- meaningful test-maintenance debt;
- limited confidence concern;
- no evidence of a production schema defect;
- a **medium** correction parcel;
- suitable as the first parcel of the next sprint.

Use the audit as the authoritative scope map.

---

## Core principles

### Valid current-domain fixtures

Fixtures representing valid current application state should statically satisfy the actual canonical production types.

Prefer:

- typed builder return values;
- `satisfies CanonicalType` on representative literals;
- current defaults where appropriate.

Avoid:

- broad casts that merely silence the compiler;
- weakening production types;
- leaving required fields absent because a particular test does not currently read them.

### Historical and malformed fixtures

Tests for old schemas, malformed input, migration, storage recovery, and import rejection should remain intentionally malformed when that is the point of the test.

Represent those inputs explicitly as:

- raw object literals;
- `unknown`;
- accurately named historical input shapes;
- parsed external payloads;
- other clear trust-boundary representations.

Do **not** cast historical schema-1/2/3 payloads into current `OutpostNetwork` or `Character` types merely to satisfy the compiler.

### No global suppression

Do not:

- restore `noCheck`;
- add `skip`/ignore directives to hide genuine errors;
- introduce `any` broadly;
- loosen domain interfaces;
- weaken compiler strictness.

---

## Required implementation areas

Follow the audit’s recommended sequence, but use judgment to keep edits local and maintainable.

### 1. Add a real test semantic type-check gate

Create or revise a test-specific TypeScript project/command so that:

- semantic checking is enabled;
- both `tests/**/*.ts` and `tests/**/*.tsx` are included;
- module resolution is compatible with the repository’s Vite/Bundler setup;
- no code is emitted;
- the check can be run directly through an npm script;
- it produces zero diagnostics after this parcel is complete.

Preferred outcome:

```text
npm run typecheck:tests
```

or an equally clear repository-consistent script name.

The permanent configuration should replace the current ineffective `noCheck: true` test project behavior rather than adding a second confusing config if a clean update is possible.

If retaining a separate config is clearer, explain why.

Do not alter the production `tsc -b` project scope unnecessarily.

---

### 2. Correct current `Outpost` / `OutpostNetwork` fixtures

Fix the current-state fixture sites identified by the audit.

Key requirement:

- valid current outposts must include required `explicitResourcePresence`.

Audit-identified areas include:

- `collectionEditingSession.test.ts`
- `keyboardShortcuts.test.ts`
- `itemSearchResults.test.ts`
- `manufacturingAvailability.test.ts`
- `stateLegibility.test.ts`

Also inspect any additional diagnostics revealed after the first fixes.

For local `Partial<Outpost>` builder patterns:

- ensure the base fixture itself is a valid current `Outpost`;
- keep overrides useful for tests;
- do not rely on `Partial` to manufacture an object whose declared return type is false.

Prefer minimal local builders over introducing a broad shared factory unless duplication clearly justifies one.

---

### 3. Correct history action labels

Update test calls that still pass raw strings where production requires:

```text
HistoryLabelDescriptor
```

Audit-identified areas include:

- `collectionEditingSession.test.ts`
- `keyboardShortcuts.test.ts`
- `manufacturingAvailability.test.ts`
- `resourcePersistenceCompatibility.test.ts`
- `resourcePresence.test.ts`

Use a small test-local helper where it removes repeated boilerplate without obscuring intent.

Do not change production `CollectionEditingAction` types.

Review any expectations that assert presented history labels so they still reflect intended behavior.

---

### 4. Correct current cargo fixtures

Address stale current-domain cargo shapes.

Audit-identified examples:

- remove obsolete/nonexistent `CargoLink.type` from current cargo-link fixtures;
- do not access legacy pad-local `.link` through the current `CargoPad` type.

Where a legacy cargo/pad shape is required for migration testing:

- represent it as historical/raw input at the migration/import boundary.

Do not alter current cargo domain types to accommodate old test data.

---

### 5. Correct validation fixtures

Bring current validation fixtures into agreement with:

- `ValidationIssue`
- `ValidationCategory`

Audit-identified examples:

- replace obsolete `message` fixture field with required `messageKey`;
- replace invalid `character` category with the category actually emitted by production skill validation.

Preserve test intent.

Do not invent production categories merely to keep existing expectations unchanged.

---

### 6. Correct component harness contracts

Fix component test harnesses identified by the audit.

Audit examples include:

- `App` rendered without required `referenceData`;
- untyped `this`;
- planned-supply/component state inferred too narrowly;
- obsolete extra argument to `createCollectionEditingSession`.

Requirements:

- supply realistic explicit `referenceData` where `App` requires it;
- use properly typed state matching production contracts;
- update call signatures to current APIs;
- avoid broad casts.

Do not change `App` to make required props optional merely for tests.

---

### 7. Correct adjacent localization typing noise

Fix the narrow localization-test inference issue identified by the audit.

Keep the correction local and typed.

Do not broaden string unions unnecessarily or weaken reference ID types.

---

### 8. Isolate historical schema fixtures correctly

Pay special attention to:

- `resourcePersistenceCompatibility.test.ts`
- `networkLifecycle.test.ts`
- other schema migration / malformed import tests

Historical schema-1/2/3 objects may legitimately omit fields now required in schema 4, such as:

- `Character.capabilities`
- `Outpost.explicitResourcePresence`

These should remain historical inputs.

Do not “upgrade” the source fixture before migration if doing so would invalidate the test’s purpose.

Instead:

- type them as raw/historical input;
- pass them through the same deserialize/migrate/import boundary the production code uses;
- only assert current-domain types after successful migration.

Likewise, malformed import fixtures should remain malformed external payloads.

---

## Static typing style

Use `satisfies` where it helps detect future drift while preserving useful literal inference.

Good examples:

```ts
const outpost = {
  ...
} satisfies Outpost
```

or typed builder signatures such as:

```ts
function makeOutpost(overrides: Partial<Outpost> = {}): Outpost
```

provided the default/base object is fully valid.

Do not mechanically add `satisfies` to every fixture in the suite.

Use it where it adds maintenance value.

---

## Test type-check command

After fixtures are corrected, the repository should have a durable command that checks all TypeScript tests semantically.

Requirements:

- includes `.ts`;
- includes `.tsx`;
- no `noCheck`;
- no emit;
- compatible JSX setting;
- compatible module resolution;
- zero diagnostics.

Add this command to normal verification documentation/scripts as appropriate.

If the repository has a combined verification script where this naturally belongs, add it there only if doing so is consistent and low-risk.

Do not silently make unrelated build pipelines slower or change Cloudflare deployment behavior.

---

## Build/CI/deployment boundary

This parcel is about local/repository test correctness.

Do not change:

- Cloudflare Pages settings;
- deployment branch rules;
- production build target;
- Node runtime pin;
- package dependencies;
- lockfile;
- Vite runtime behavior.

If adding the test type-check to an npm verification script, ensure the Cloudflare `npm run build` path is unaffected unless there is an explicit existing convention that all checks belong there.

Prefer a dedicated test-typecheck command rather than coupling it to production deployment unnecessarily.

---

## Expected scope

Likely changed files:

- `tests/tsconfig.json` or equivalent test-specific TypeScript config
- `package.json` for the type-check script
- approximately 10–13 test files identified by the audit
- possibly a small test helper if clearly justified
- `docs/BACKLOG.md` only if the existing fixture-drift item should be marked complete after verification

Do not modify production source unless a genuine contradiction is discovered.

If any production-code change appears necessary:

- stop;
- report the specific discrepancy;
- explain why correcting the test alone would be wrong;
- do not broaden scope without approval.

---

## Existing gameplay questions out of scope

Do not infer or implement validators related to:

- duplicate outpost names;
- maximum character name length;
- Ocean/coastline biome resource access.

Those are awaiting independent in-game verification.

Do not use fixture cleanup as an excuse to encode assumptions about them.

---

## Verification

Run all of the following after implementation:

```text
node --version
npm run typecheck:tests
npm run build
npm run test
npm run reference:test
npm run test:components
npm run lint
git diff --check
```

If the script receives a different final name, substitute it consistently.

Expected result:

- test type-check: zero diagnostics;
- production build passes;
- Node tests: all pass;
- reference tests: all pass;
- component tests: all pass;
- lint passes;
- diff check passes.

Also confirm:

- no old `noCheck: true` path remains as the effective test semantic-check route;
- `.tsx` tests are included in the permanent test type-check;
- intentional malformed/historical fixtures remain intentional boundary inputs rather than current-domain casts.

---

## Regression review

After tests pass, inspect the diff for accidental semantic changes.

Specifically verify that:

- migration tests still begin from genuinely old schemas;
- malformed-import tests are still malformed;
- history-label expectations still test the intended presentation behavior;
- validation tests still assert the intended category/message behavior;
- component storage tests still exercise the same user-facing behavior, now with correct required props;
- fixture changes did not silently remove edge-case coverage.

Static cleanliness alone is not sufficient if test intent was weakened.

---

## Documentation

### Audit

Leave:

```text
docs/audits/TYPESCRIPT-TEST-FIXTURE-TYPE-AGREEMENT.md
```

unchanged as a historical point-in-time audit.

### Backlog

If the existing backlog item is specifically:

```text
Bring the TypeScript test fixtures back into static type agreement
```

then after successful implementation and verification:

- mark it complete or remove it according to existing backlog conventions;
- note that the suite now has a permanent semantic test type-check gate.

Do not broaden backlog grooming beyond this item.

---

## Failure conditions

Stop and report before continuing if:

- fixing a fixture changes a meaningful behavioral assertion unexpectedly;
- a production type appears genuinely wrong;
- migration code cannot accept accurately represented historical payloads;
- the permanent test type-check reveals a materially larger error population than the audit;
- eliminating diagnostics would require widespread casts/suppressions;
- `.tsx` type-checking exposes unrelated framework/config problems large enough to change parcel size.

Do not force a green type-check by weakening types.

---

## Completion response

Return:

1. concise summary;
2. current branch;
3. final parcel size compared with audit estimate;
4. files changed;
5. permanent test type-check command/configuration;
6. final diagnostic count;
7. current-domain fixture corrections made;
8. history-label corrections made;
9. cargo/validation/component/localization corrections made;
10. how historical/malformed fixtures are now represented;
11. whether any production code changed;
12. whether any behavioral test expectation changed and why;
13. build/test/reference/component/lint results;
14. `git diff --check` result;
15. confirmation `.ts` and `.tsx` tests are both semantically checked;
16. backlog update, if any;
17. confirmation audit document remains historical;
18. confirmation no dependency/lockfile change;
19. confirmation no Cloudflare/deployment setting changed;
20. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
