# Codex Audit Brief — TypeScript Test Fixture Static-Type Agreement

## Objective

Conduct a **read-only audit** of TypeScript test fixtures and related test helpers to determine where they have drifted out of static type agreement with the application's current domain/runtime types.

This issue has been present for some time. Before scheduling an implementation parcel, we need to understand:

1. exactly which fixtures/helpers are out of agreement;
2. why they are currently compiling or running despite the mismatch;
3. whether the drift is cosmetic, localized, or structurally significant;
4. whether correcting it is likely to be a small cleanup or a broad test-maintenance parcel;
5. whether any current tests are relying on impossible/invalid object shapes;
6. whether the mismatch hides any actual product/schema inconsistency.

Do **not** fix the fixtures in this audit.

Do **not** commit or push.

---

## Branch and workflow

Work on:

- `staging`

Before inspection:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify any unrelated working-tree changes.

Do not work directly on `main`.

Do not modify application or test files.

---

## Scope

Audit TypeScript test fixtures, factories, builders, mocks, and helper objects that represent application/domain data.

Focus especially on:

- `tests/`
- `src/**/__tests__/`, if present
- fixture/helper modules imported by tests
- benchmark fixtures only where they share production-domain shapes
- test factories/builders that construct:
  - networks
  - outposts
  - cargo links
  - resources
  - manufacturing/planning state
  - persistence/import/export payloads
  - reference-data-backed objects
  - history/Undo state
  - localization-bearing structures

Do not broaden into unrelated test quality review.

---

## Core audit questions

### 1. Where is static type agreement being bypassed?

Identify every meaningful pattern that allows fixture drift, for example:

- `as SomeType`
- `as unknown as SomeType`
- `any`
- `Partial<...>`
- unchecked object literals passed through generic helpers
- runtime casts
- JSON parsing that erases static guarantees
- helper return types broader/narrower than production types
- object spread patterns that suppress excess-property checks
- test-only interfaces duplicating production types
- fixture builders that rely on defaults inconsistent with current required fields

Do not assume all casts are bad. Distinguish legitimate boundary/test techniques from casts masking stale fixtures.

### 2. Which production types are affected?

Map mismatches back to their canonical production/domain types.

For each affected area, identify:

- canonical type/interface/schema;
- fixture/helper location;
- field(s) out of agreement;
- whether mismatch is missing field, wrong field name, wrong optionality, wrong union member, wrong nested shape, stale enum/value, or excess field.

### 3. Are any tests representing impossible states?

Determine whether fixtures currently construct states that:

- cannot be produced by the current app;
- cannot pass import/persistence validation;
- violate current domain invariants;
- rely on legacy schema fields;
- omit now-required fields;
- contain values no longer accepted by production code.

Classify each as:

- intentional invalid-state test;
- legitimate partial/helper fixture;
- stale but harmless;
- stale and misleading;
- potentially masking a defect.

### 4. Why does the current suite still pass?

Explain the mechanisms allowing runtime tests to succeed despite static disagreement.

Examples may include:

- Vitest transpilation without full type-checking;
- test helpers using casts;
- `tsconfig` exclusions;
- separate build/typecheck scope;
- runtime code tolerating omitted fields;
- object literals flowing through variables/builders and escaping excess-property checks.

Identify the actual mechanism in this repository rather than guessing.

### 5. What would a correction parcel involve?

Estimate the likely implementation scope.

Classify the parcel as:

- **Small** — localized fixture/helper edits, low risk, no production changes;
- **Medium** — several fixture families/builders, test expectation updates, moderate churn;
- **Large** — widespread duplicated shapes, helper redesign, schema/test architecture changes.

Provide:

- approximate file count;
- rough categories of edits;
- whether test helpers/factories should be centralized or tightened;
- whether production code changes appear necessary;
- whether snapshot/expected-value churn is likely;
- whether the work can be done mechanically or requires domain decisions.

Do not propose a broad test-framework rewrite unless the evidence strongly supports it.

---

## Required repository inspection

Inspect at minimum:

- `tsconfig*.json`
- `package.json` test/build/typecheck scripts
- Vitest configuration
- relevant domain/model type definitions
- persistence/import/export schemas
- fixture/helper modules
- representative tests from each affected fixture family
- any comments/backlog notes referring to test fixture drift

Search for likely bypass patterns such as:

```text
as unknown as
as any
: any
Partial<
satisfies
fixture
mock
factory
builder
```

Use judgment: not every occurrence needs to be reported.

---

## Static-check experiment

Without modifying source files, determine whether there is a reproducible static-check command that exposes the drift.

Examples might include:

- existing `tsc` project build;
- a test-specific TypeScript project;
- a temporary read-only invocation of `tsc` against tests;
- another repository-supported typecheck path.

If tests are excluded from current TypeScript project references, document that clearly.

If a temporary TypeScript invocation is needed:

- do not add config files permanently;
- do not install new dependencies;
- record the command;
- distinguish config/tooling noise from real fixture errors.

The goal is to establish a defensible error inventory, not to force every test through an unsuitable compiler configuration.

---

## Error inventory

Create a concise inventory grouped by root cause, not a giant compiler dump.

For each category include:

- affected type/domain area;
- representative file(s);
- representative error;
- approximate occurrence count;
- root cause;
- whether one helper fix would eliminate many downstream errors.

Example categories might be:

- missing newly-required property;
- obsolete property still present;
- test builder return type too loose;
- stale literal union value;
- invalid nested cargo/resource shape;
- intentional invalid-state test requiring a narrower escape hatch.

If there are hundreds of duplicate errors from one root cause, summarize rather than listing every line.

---

## Recommended correction strategy

The audit should recommend the **smallest maintainable approach**.

Consider, where appropriate:

- converting fixture objects to `satisfies CanonicalType` rather than broad assertions;
- tightening shared factories/builders;
- using explicit invalid-fixture helpers for tests that intentionally violate types;
- removing duplicated test-only interfaces;
- preserving intentional malformed-import tests at the trust boundary without pretending malformed data is a valid domain object.

Do not recommend replacing all fixtures wholesale unless necessary.

A useful principle:

> Valid-domain fixtures should statically satisfy valid-domain types. Tests of malformed external input should remain explicitly malformed at the boundary rather than being cast into valid domain types.

---

## Risk assessment

Assess risk in three dimensions.

### Product risk

Could stale fixtures conceal a mismatch between tests and real application state?

### Test-maintenance risk

Could future domain/schema changes silently leave tests behind again?

### Refactor risk

Would tightening fixtures cause many tests to fail for reasons unrelated to behavior?

State whether the issue is:

- hygiene only;
- meaningful maintainability debt;
- confidence/reliability concern;
- evidence of a production schema problem.

---

## Deliverable

Create:

```text
docs/audits/TYPESCRIPT-TEST-FIXTURE-TYPE-AGREEMENT.md
```

Suggested structure:

1. Executive summary
2. Current TypeScript/test compilation model
3. How fixture drift is currently bypassed
4. Affected fixture families
5. Error inventory by root cause
6. Impossible vs intentional invalid states
7. Scope estimate
8. Recommended correction strategy
9. Risks
10. Suggested implementation parcel
11. Commands/reproduction notes
12. Limits of the audit

---

## Required conclusion

The report must explicitly answer:

- How serious is the issue?
- How many fixture families/files are affected?
- Is this likely a small, medium, or large parcel?
- Does it require production-code changes?
- Are any current tests materially misleading?
- What is the recommended implementation order?
- Is it suitable as the first parcel of the next sprint?

Do not overstate severity merely because TypeScript errors exist.

---

## Scope boundaries

This is a read-only audit.

Do not modify:

- production source;
- tests;
- fixtures;
- TypeScript config;
- Vitest config;
- package scripts;
- dependencies;
- lockfile;
- documentation other than the audit report.

Do not fix errors during the audit.

Do not change domain types to make stale fixtures compile.

Do not suppress errors globally.

Do not weaken compiler settings.

---

## Independent gameplay checks

The following upcoming gameplay investigations are **outside this audit** and should not affect conclusions here:

- whether duplicate outpost names are possible;
- maximum character name length;
- whether coastline outposts can access Ocean-biome resources / whether Ocean should remain in biome lists.

Do not infer answers to those questions from current code or fixtures.

---

## Validation

Run, as applicable:

- existing build/typecheck command;
- existing test suite if useful for context;
- any non-mutating test-specific typecheck experiment;
- `git diff --check`.

Do not run unnecessary full benchmarks.

Report all commands used.

---

## Completion response

Return:

1. concise conclusion;
2. current branch;
3. audit file created;
4. severity assessment;
5. parcel-size estimate: small / medium / large;
6. approximate files/fixture families affected;
7. primary mechanisms bypassing static agreement;
8. whether current tests represent impossible states;
9. whether any production-code changes appear necessary;
10. recommended correction strategy;
11. whether this is suitable as the first next-sprint parcel;
12. commands/tests/typecheck experiments run;
13. confirmation no implementation/test/config files changed;
14. confirmation no dependency/lockfile change;
15. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
