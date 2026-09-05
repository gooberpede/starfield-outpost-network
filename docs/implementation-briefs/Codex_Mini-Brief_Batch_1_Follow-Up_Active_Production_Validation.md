# Codex Mini-Brief — Batch 1 Follow-Up: Active Production Validation

## Objective

Make one focused correctness correction to the completed biome-aware reference-data migration, plus one small housekeeping cleanup.

Do **not** redesign the new reference-data model or expand the scope of Batch 1.

Do **not commit or push**.

---

## 1. Correct active-production validation

### Problem

The meaning of `bodyResources` changed during Batch 1.

It now represents the complete body-level resource inventory derived from:

* inorganic biome occurrences;
* atmospheric inorganic occurrences; and
* harvested organic resources from species present on the body.

This deliberately includes organic resources obtainable only from **non-domesticable** species.

That is correct for planetary resource presence.

However, active outpost production has stricter semantics:

* inorganic resources present on the body may be locally produced;
* organic resources may be locally produced only where there is an appropriate **domesticable** species source.

The new helper in:

```text
src/domain/bodyResourceAvailability.ts
```

already implements this distinction for the resource matrix via `getBodyProductionResources()`.

The existing validator:

```text
src/domain/validation/rules/activeProductionValidForBody.ts
```

still validates `activeProduction` directly against `referenceData.bodyResources`.

This is now too permissive. A wild-only organic resource can be present in `bodyResources` and therefore incorrectly pass active-production validation even though the matrix correctly does not offer it as a producible local resource.

### Required correction

Update `activeProductionValidForBody` so it uses the same production-eligibility semantics as the matrix.

Prefer reusing:

```ts
getBodyProductionResources()
```

or an appropriately shared lower-level helper from `bodyResourceAvailability.ts`.

Do **not** duplicate the domesticability rule independently inside the validator unless there is a compelling architectural reason.

There should be one authoritative domain interpretation of:

> Which resources are valid for local production on this body?

### Required semantics

For a selected body:

```text
inorganic resource present on body
    => valid local production resource

organic resource with domesticable planet/species source
    => valid local production resource

organic resource present only through non-domesticable species
    => NOT valid local production resource
```

The validator should continue to preserve its existing behaviour for:

* unknown bodies;
* unknown resource IDs;
* future special production mechanisms;
* warning severity;
* validation issue structure.

Do not introduce biome-selection semantics yet. Batch 1 still treats the complete body as the available geographic scope.

---

## 2. Add regression coverage

Add a regression test proving the corrected validator behaviour.

At minimum cover:

### Wild-only organic

Given:

* a known body;
* an organic resource present in the body-level inventory;
* no domesticable planet/species source for that resource;
* the resource manually or externally present in `activeProduction`;

then:

```text
active-production-valid-for-body
```

must produce its normal warning.

### Domesticable organic

Given the same basic setup but with a domesticable species source, active production must remain valid.

### Inorganic

A normal inorganic resource present on the body must remain valid.

Prefer testing through the actual validator/domain helper boundary rather than duplicating its internal logic in the test.

---

## 3. Remove duplicate `body-resources.json` generation if still present

Review:

```text
scripts/build-reference-data.mjs
```

The Batch 1 implementation appears to write `body-resources.json` once through the generic biome-data output loop and again through the older dedicated `BODY_RESOURCES_OUTPUT_FILE` write path.

If this duplicate write is still present:

* remove the redundant write path;
* retain exactly one authoritative generation path;
* do not change generated content or filename;
* update comments/constants if any become obsolete.

This is housekeeping only. Do not alter the derived `bodyResources` semantics.

If inspection shows the file is not actually written twice, make no change and state that in the completion report.

---

## 4. Explicitly out of scope

Do **not** address these in this correction pass:

* category-qualified resource crosswalk redesign;
* biome selection;
* Planetary Habitation validation;
* solar/wind calculations;
* species presentation;
* persisted schema changes;
* changes to `bodyResources` meaning;
* further builder refactoring purely for style;
* general cleanup of the large biome-reference module.

The existing resource crosswalk works with the current catalogue and can be reconsidered separately.

---

## 5. Verification

Run:

```text
node scripts/build-reference-data.mjs
```

Run the biome/reference regression tests.

Run:

```text
npm run lint
npm run build
```

Then verify:

1. a wild-only organic resource is rejected as active production;
2. a domesticable organic remains valid;
3. inorganic production behaviour is unchanged;
4. the resource matrix behaviour is unchanged;
5. generated `body-resources.json` content/count remains unchanged;
6. persisted network schema and import/export remain unchanged;
7. no unrelated files or behaviours were modified.

---

## 6. Completion report

Report:

1. files changed;
2. how the validator now obtains production-valid resources;
3. regression tests added or updated;
4. confirmation that wild-only organics now fail active-production validation;
5. confirmation that domesticable organics and inorganic resources still behave correctly;
6. whether the duplicate `body-resources.json` write existed and, if so, how it was removed;
7. reference builder result;
8. regression-test result;
9. lint result;
10. production build result;
11. confirmation that no persisted schema/import/export changes were made.

Do not commit or push.
