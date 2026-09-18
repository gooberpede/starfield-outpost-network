# Codex Implementation Brief — Reference-Data Integrity Gate and Fatal Startup State

## Objective

Implement a fail-closed reference-data integrity system for the Starfield Outpost Tracker.

The purpose is to ensure that the editable application does **not** initialize unless the complete required runtime reference dataset has been verified as coherent with the build.

This parcel should:

1. verify all 13 committed runtime reference JSON files at build time;
2. generate a deterministic runtime deployment manifest from the exact committed bytes that will be served;
3. embed an expected dataset identifier into the app bundle;
4. add a pre-`App` startup integrity gate;
5. validate manifest and runtime assets before normal application initialization;
6. show a dedicated localized and accessible fatal state on any required reference-data failure;
7. provide `Reload` and privacy-preserving `Report` actions;
8. prove through tests that normal application/persistence initialization does not occur after integrity failure.

Do not implement browser-side CSV regeneration.

Do not add a backend, Worker, Function, telemetry service, or automatic report submission.

Do not change Cloudflare routing in this parcel.

Do not add the raw emergency backup/export action in this first implementation slice.

Do not commit or push unless explicitly instructed.

---

# Design authority

Use the committed audit as the primary design reference:

- `docs/audits/REFERENCE-DATA-INTEGRITY-DESIGN.md`

Also respect existing architecture, localization, accessibility, persistence, security, and deployment conventions already documented in the repository.

This implementation brief intentionally narrows one aspect of the audit:

- **full cross-file referential/invariant validation belongs at build time**;
- browser runtime validation should remain lightweight once exact-byte hashes prove the files are the same validated bytes.

Do not duplicate substantial generator/business-rule validation in the browser.

---

# Settled product decisions

Treat the following as fixed.

## Fail closed

If any required reference dataset is:

- missing;
- unreachable;
- wrong content type;
- malformed JSON;
- structurally invalid at the required lightweight level;
- hash-mismatched;
- manifest-mismatched;
- demonstrably inconsistent with the current app build;

then:

- normal editable application startup must stop;
- `App` must not mount;
- normal persistence initialization/migration/write paths must not run;
- user data must remain untouched;
- the user must not be allowed into a partial editor.

## No runtime rebuilding

Do not rebuild missing runtime JSON from CSVs or any other source data in the browser.

The allowed boundary is:

`reference-source -> build-time generation/validation -> committed runtime JSON -> deployment manifest -> browser validation -> App`

not:

`missing JSON -> browser regenerates from source`

## User-data boundary

Do not automatically inspect, include, serialize, or report:

- network contents;
- `localStorage` contents;
- network names;
- outpost names;
- notes;
- imported/exported filenames;
- user-created labels;
- any other player/user state.

This integrity mechanism concerns reference-data deployment only.

---

# Current runtime asset set

The audit identified 13 required runtime JSON files under `/reference-data/`:

1. `biomes.json`
2. `body-biomes.json`
3. `inorganic-occurrences.json`
4. `species.json`
5. `planet-species.json`
6. `organic-occurrences.json`
7. `organic-farming-profiles.json`
8. `systems.json`
9. `bodies.json`
10. `resources.json`
11. `products.json`
12. `body-resources.json`
13. `product-recipes.json`

Treat all 13 as fatal-required for the current `ReferenceData` contract.

Do not introduce optional/degraded runtime reference modes in this parcel.

---

# Part 1 — Build-time verification

## Goal

A production build must fail if the committed runtime reference-data set is incomplete, stale relative to the generator, malformed, or internally inconsistent according to existing build-time rules.

## Required approach

Refactor/reuse existing generator logic so that build verification can regenerate the expected 13 JSON outputs into a **temporary location** without silently rewriting committed artifacts.

The production build should then compare regenerated expected outputs against:

- `public/reference-data/*.json`

and fail on:

- missing required file;
- extra unexpected required-file replacement/renaming;
- byte/content mismatch;
- malformed JSON;
- failed existing generator invariants;
- failed required cross-file referential validation.

Do not make `npm run build` silently repair `public/reference-data`.

Developers should continue to use the explicit reference-data generation workflow when updates are intentional.

## Reuse existing logic

Prefer extracting reusable functions from:

- `scripts/build-reference-data.mjs`

rather than duplicating generator logic.

Use existing reference tests/invariants wherever practical.

Avoid a second independent implementation of the reference build.

## Build command integration

Update the production build flow so reference-data verification runs before Vite emits `dist`.

The exact npm script arrangement may be chosen to fit the repository cleanly, but the effective build order should be:

1. existing localization/provenance verification;
2. reference-data deterministic verification;
3. manifest generation;
4. TypeScript build;
5. Vite build;
6. optional/post-build `dist` completeness verification if useful.

Do not require a developer to remember a separate manual command before `npm run build`.

---

# Part 2 — Runtime deployment manifest

Create a generated manifest:

- `public/reference-data/manifest.json`

or an equivalent generated location that Vite reliably copies into:

- `/reference-data/manifest.json`

The runtime manifest should be deterministic.

## Required manifest content

Include:

- `schemaVersion`
- `datasetId`
- ordered `assets` list

Each asset entry should include:

- fixed relative filename/path
- SHA-256 hash of the exact deployed bytes

Example shape is illustrative only:

```json
{
  "schemaVersion": 1,
  "datasetId": "sha256:...",
  "assets": [
    {
      "path": "biomes.json",
      "sha256": "..."
    }
  ]
}
```

Choose names consistent with project conventions.

## Exact dataset ID definition

Avoid circular hashing.

Define `datasetId` deterministically from canonical content that **does not include the datasetId itself**.

Recommended canonical input:

- manifest schema version;
- ordered sequence of:
  - relative asset path;
  - SHA-256 hash.

For example conceptually:

`SHA256(schemaVersion + ordered(path + hash))`

The exact canonical serialization must be documented and tested.

The same resulting dataset ID must be:

- written into `manifest.json`;
- embedded into the application bundle as the expected dataset ID.

## Bundle-embedded expected dataset ID

Generate a small TypeScript module or equivalent build artifact consumed by the client, for example:

- `src/generated/referenceDataset.ts`

or another repository-appropriate generated location.

It should expose at minimum:

- expected dataset ID;
- supported manifest schema version;
- optionally the required asset allowlist if useful.

Do not require Git commit metadata for correctness.

Do not use build timestamps as identity.

---

# Part 3 — Runtime manifest validation

Before normal app initialization:

1. fetch `/reference-data/manifest.json`;
2. require successful HTTP status;
3. require JSON-compatible media type:
   - `application/json`
   - or `+json`
   - tolerate charset/parameters correctly;
4. parse JSON;
5. validate manifest structure;
6. validate supported manifest schema version;
7. validate the exact required asset allowlist:
   - no missing required asset;
   - no duplicate asset;
   - no unknown asset;
   - no absolute URL;
   - no off-origin URL;
   - no path traversal;
8. validate hash format;
9. recompute/validate manifest `datasetId`;
10. compare manifest `datasetId` against the bundle-embedded expected dataset ID.

A mismatch must fail closed.

This app ↔ manifest comparison is what detects a manifest/files deployment that is self-consistent but belongs to a different app build.

Do not claim this provides authenticated supply-chain security. It is a deployment coherence mechanism.

---

# Part 4 — Runtime asset validation

After manifest validation succeeds, fetch all 13 required assets.

Parallel fetching is fine.

For every response:

- require successful HTTP status;
- inspect media type;
- reject HTML or any non-JSON media type;
- specifically recognize Cloudflare SPA fallback behavior where a missing JSON path can return:
  - `200`
  - `text/html`;
- bound response size before unbounded processing;
- hash the **raw response bytes** with browser Web Crypto SHA-256;
- compare to the manifest hash;
- decode and parse JSON;
- perform lightweight shape validation.

## Runtime shape validation

Keep this narrow.

At runtime validate only enough to prove the asset is recognizable as the expected dataset format, for example:

- expected top-level array;
- required fields exist;
- required primitive types are plausible;
- key fields needed by the app are present;
- obvious invalid/duplicate primary identifiers where cheap.

Do **not** recreate the full cross-file business-rule validator in the browser.

The build-time verification owns the full reference relationships.

Because the runtime hash proves the browser received the exact bytes that passed the build-time validation, repeated browser-side body→system / recipe→ingredient / biome→body relational joins are unnecessary for this first slice.

---

# Part 5 — Startup architecture

## Gate location

The integrity gate must exist:

- under the existing `LocalizationProvider`;
- before `App` mounts.

The localization catalogues are bundled and do not depend on runtime reference JSON, so the fatal state can use the normal localization layer.

## Critical guarantee

While the gate is:

- pending;
- failed;

do not mount `App`.

This is essential because current `App` initialization can read/migrate/write persistence during startup.

No normal network collection initialization, migration, persistence effect, editor UI, search UI, import UI, or export UI should become active before integrity success.

## Successful startup

Only after:

- manifest validation;
- dataset ID validation;
- all 13 asset validations;

construct one complete `ReferenceData` snapshot and mount the normal application.

Prefer passing the already-validated reference-data snapshot into the app rather than immediately refetching the same files again.

Refactor the current loader/startup flow accordingly.

---

# Part 6 — Failure model and stable error codes

Implement a stable typed/discriminated failure model.

Use names consistent with the audit, for example:

- `REF_MANIFEST_FETCH`
- `REF_MANIFEST_INVALID`
- `REF_MANIFEST_VERSION`
- `REF_BUILD_MISMATCH`
- `REF_ASSET_FETCH`
- `REF_ASSET_CONTENT_TYPE`
- `REF_ASSET_JSON`
- `REF_ASSET_SCHEMA`
- `REF_ASSET_HASH`
- `REF_LOADER_INTERNAL`

A runtime cross-file coherence code is not required in this first slice if cross-file validation is build-time-only.

If multiple parallel asset failures occur:

- report one deterministic primary failure based on manifest order;
- do not make diagnostics race-dependent.

## Safe diagnostic object

Construct diagnostics from a closed typed object.

Allowed fields may include:

- stable error code;
- safe relative asset filename;
- HTTP status when available;
- observed media type when relevant;
- manifest schema version when known;
- expected dataset ID;
- actual manifest dataset ID;
- expected hash prefix;
- actual hash prefix;
- effective locale;
- optional UTC report timestamp.

Do not include:

- raw exception stack;
- response body;
- full request URL with query string;
- `window.location`;
- local file paths;
- user state;
- browser storage;
- arbitrary serialized exceptions.

---

# Part 7 — Fatal startup UI

Create a dedicated full-screen fatal state outside the editable application shell.

The user-facing concept is:

> Required reference data could not be loaded correctly. The tracker has stopped to protect your saved work.

Final copy must live in localization files rather than hard-coded English.

## Required controls

Provide:

- **Reload**
- **Report**

Do **not** implement the raw emergency backup/export action in this parcel.

That may be added later as a separate enhancement after the core integrity gate is proven.

## Reload behavior

`Reload` should retry the **entire** integrity gate.

It must not:

- reuse a partial reference set;
- keep stale failed requests alive in a way that can overwrite a later retry result;
- mount `App` before retry success.

Use cancellation/generation guards as appropriate.

Do not automatically retry forever.

## Report behavior

Use:

- `mailto:support@starfieldoutposts.com`

Prefer a semantically appropriate anchor/link with a generated `mailto:` URL rather than imperative navigation, unless existing project UI conventions strongly favor another accessible pattern.

The user action should:

- open the configured mail client;
- prefill recipient;
- prefill localized subject;
- prefill a plain-text diagnostic body;
- send nothing automatically.

## Privacy text

Show localized explanatory text near the Report action, conceptually:

> Reporting opens your email app and includes technical diagnostics only. No saved network data is included automatically.

Do not include saved network/user data in the `mailto:`.

---

# Part 8 — Localization

Use the existing localization architecture.

Add required semantic keys to:

- `en-US`
- `ja-JP`

Keep:

- `en-GB` sparse unless a genuine regional wording difference exists.

Maintain exact Japanese semantic/key parity according to existing project rules.

Localize:

- fatal heading;
- explanation;
- Reload label;
- Report label;
- privacy explanation;
- diagnostic labels;
- mapped human-readable failure descriptions;
- report email subject/body prose.

Keep invariant technical values untranslated:

- error code;
- filenames;
- hashes;
- dataset IDs;
- HTTP status;
- manifest schema version.

## Localization failure edge

The normal reference-data failure path should use `LocalizationProvider`, because it is already above `App` and uses bundled messages.

Do not create a separate localization framework.

A catastrophic failure where the JS/localization bundle itself cannot execute is outside this parcel.

---

# Part 9 — Accessibility

Follow established project accessibility rules and patterns.

Required behavior:

- dedicated semantic `h1`;
- move focus to the fatal heading on first entry;
- use `tabIndex="-1"` where appropriate for programmatic heading focus;
- announce the failure once without duplicate assertive output;
- native semantic controls;
- logical Tab order;
- visible focus treatment;
- keyboard-operable Reload and Report;
- no color-only signaling;
- forced-colors support consistent with existing UI;
- responsive/reflow-safe layout;
- no unnecessary animation;
- any loading indicator must respect reduced-motion expectations.

Ensure retry transitions do not produce confusing repeated announcements.

---

# Part 10 — Build and runtime size bounds

The audit left the precise byte-size ceiling open.

Choose a practical bound based on the current runtime asset sizes plus reasonable headroom.

Requirements:

- each runtime asset must have a bounded maximum before parsing;
- the manifest should also have a small independent maximum;
- limits should be centralized/documented;
- current valid assets must comfortably fit;
- do not use a brittle limit that will require frequent maintenance.

If the manifest includes derived byte sizes, treat them as diagnostic/verification metadata only if useful.

Do not depend on HTTP `Content-Length` as the sole size control.

---

# Part 11 — Tests

Add comprehensive automated coverage.

## Build-time tests

Cover at minimum:

- deterministic manifest generation;
- deterministic dataset ID;
- exact 13-file allowlist;
- missing committed runtime file;
- stale committed runtime file;
- malformed committed runtime JSON;
- generator output mismatch;
- invalid/duplicate asset declaration;
- hash mismatch;
- build verification failure before Vite output;
- `dist` contains manifest and all 13 required assets.

Where possible:

- use temporary fixtures/directories;
- never rewrite committed reference artifacts from tests.

## Runtime loader tests

Cover:

- manifest non-2xx;
- manifest `200 text/html`;
- manifest malformed JSON;
- manifest schema invalid;
- unsupported manifest version;
- malformed hash;
- missing/extra/duplicate asset entry;
- path traversal/off-origin/absolute URL rejection;
- bundle/manifest dataset mismatch;
- asset non-2xx;
- asset `200 text/html`;
- asset wrong MIME;
- oversized response;
- invalid JSON;
- shape invalid;
- SHA-256 mismatch;
- Web Crypto unavailable/failing;
- deterministic primary error selection during parallel failures;
- all-valid dataset succeeds.

## Startup/persistence tests

Prove:

- `App` is not mounted while integrity is pending;
- `App` is not mounted after integrity failure;
- normal persistence initialization is not called after failure;
- no `localStorage.setItem` occurs due to normal app initialization on failure;
- successful integrity gate mounts the normal application with one complete snapshot;
- retry after failure can succeed cleanly.

## Fatal-state component tests

Cover:

- localized heading and explanation;
- Reload;
- Report;
- privacy text;
- diagnostic code presentation;
- no raw exception/stack leakage;
- keyboard behavior;
- focus lands correctly;
- screen-reader-oriented semantics;
- Japanese parity;
- en-GB fallback behavior.

## `mailto:` tests

Decode/test the generated URI.

Assert that it includes only allowlisted diagnostic data.

Assert that it never includes:

- network JSON;
- localStorage;
- network/outpost names;
- notes;
- imported/exported filenames;
- raw response body;
- stack traces;
- arbitrary URL/query string;
- arbitrary serialized application state.

---

# Part 12 — Cloudflare Pages behavior

Do not change Cloudflare configuration in this parcel.

Application validation must correctly handle the existing Pages SPA fallback where a missing reference asset can return:

- HTTP 200
- `text/html`

This should map to:

- `REF_ASSET_CONTENT_TYPE`

or the equivalent stable content-type failure code.

Do not add:

- global `404.html`;
- `_redirects` workaround;
- Worker;
- Pages Function;
- Bulk Redirect;
- Transform Rule.

A targeted hosting correction can be evaluated separately later as defense in depth.

---

# Part 13 — Source CSV/manifests

Do not remove or relocate `reference-source/` CSVs/manifests.

The audit found:

- they are not present in `dist`;
- their repository presence is not a concrete production threat.

No action is required.

---

# Part 14 — Documentation updates

As part of implementation, update durable docs where the implementation supersedes current behavior.

At minimum inspect/update:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`

Document:

- fail-closed startup integrity gate;
- build-time verification ownership;
- runtime manifest role;
- no runtime source regeneration;
- fatal-state behavior;
- privacy-preserving `mailto:` reporting;
- Cloudflare fallback now detected application-side;
- raw backup/export remains a future enhancement if still desired.

Do not rewrite the committed audit; it remains the design record.

---

# Part 15 — Manual staging verification plan

Codex should not assume it can directly authenticate to:

- `https://staging.starfield-outpost-network.pages.dev`

because the preview currently presents an email-code Cloudflare challenge.

Therefore:

- perform all feasible local automated tests;
- run local production build/preview checks;
- provide a precise manual staging checklist for the maintainer.

The checklist should include:

1. successful normal staging startup;
2. no console errors in healthy state;
3. manifest loads as JSON;
4. all 13 runtime files load as JSON;
5. report `mailto:` opens correctly under deployed CSP;
6. localization switching still works;
7. keyboard/focus behavior on fatal state;
8. controlled missing/wrong asset scenario if safely testable without destabilizing the shared staging branch;
9. confirmation user data is not modified on failure.

Do not weaken preview Access protection.

---

# Expected implementation shape

The exact file structure is up to Codex after repository inspection, but a reasonable shape may include:

- reusable reference build verification module/script;
- manifest generator;
- generated dataset-ID module;
- runtime integrity loader/gate;
- fatal-state component;
- typed failure/diagnostic model;
- localization additions;
- tests;
- durable documentation updates.

Prefer small cohesive modules over one monolithic loader.

Avoid unnecessary new dependencies if native Node/browser APIs and existing project utilities suffice.

Use native SHA-256 facilities where possible:

- Node crypto at build time;
- Web Crypto in browser.

Do not add a schema-validation package unless clearly justified.

---

# Scope exclusions

Do not implement:

- raw emergency localStorage backup/export;
- automatic telemetry;
- HTTP report submission;
- backend;
- Cloudflare Function/Worker;
- source CSV serving;
- browser-side CSV generation;
- generic global React crash handling;
- Cloudflare routing changes;
- HSTS;
- analytics;
- production deployment automation;
- Sandbox environment.

---

# Verification

Run at minimum:

- `npm run build`
- `npm run test`
- relevant component tests
- relevant reference tests
- any new integrity-specific test command(s)
- `git diff --check`
- `git status`
- `git branch --show-current`

Also inspect:

- `dist/reference-data/manifest.json`
- all 13 required `dist/reference-data/*.json`
- generated dataset-ID artifact
- absence of `reference-source` material from `dist`
- final `mailto:` generation
- no unexpected application/configuration scope changes.

Branch must remain:

- `staging`

Do not commit.

Do not push.

Do not deploy.

---

# Completion response

Return:

1. concise implementation summary;
2. current branch;
3. files changed;
4. build-time verification design implemented;
5. manifest schema and generated location;
6. exact dataset-ID canonicalization rule;
7. generated/bundle dataset-ID mechanism;
8. runtime manifest checks;
9. runtime asset checks;
10. size-limit approach;
11. startup gate architecture;
12. proof that `App`/persistence do not initialize on failure;
13. stable failure-code set;
14. fatal-state UX;
15. localization changes;
16. accessibility behavior;
17. `mailto:` privacy/reporting behavior;
18. tests added;
19. documentation updated;
20. build/test results;
21. any known limitations;
22. manual staging verification checklist;
23. confirmation source CSV/manifests were not removed;
24. confirmation no Cloudflare configuration changed;
25. confirmation no telemetry/backend was added;
26. confirmation no raw backup/export action was added;
27. confirmation no commit, push, or deployment occurred.

Do not commit or push unless explicitly instructed.
