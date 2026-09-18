# Codex Audit Brief — Reference-Data Integrity, Coherence, and Fatal Startup Design

## Objective

Perform a **read-only design/audit pass** over the Starfield Outpost Tracker’s reference-data pipeline and runtime loading path.

The goal is to determine the best implementation design for a fail-closed reference-data integrity gate before any code is changed.

This audit must answer:

1. what manifests and provenance/coherence metadata already exist under `reference-source/`;
2. what the current build pipeline already guarantees;
3. how runtime reference JSON is produced, deployed, and loaded;
4. what happens today when a required runtime JSON is missing, malformed, stale, or replaced by HTML via SPA fallback;
5. whether an additional runtime deployment manifest is warranted;
6. what that runtime manifest should contain;
7. what startup validation should occur in the browser;
8. how to distinguish transport/content failures from dataset-coherence failures;
9. what the fatal startup UX should expose;
10. how to support a localized, accessible, privacy-preserving `Report` action using `mailto:`.

Do **not** implement any change in this parcel.

Do **not** commit or push.

---

## Branch and workflow

Work on:

- `staging`

Before inspection:

- run `git status`;
- run `git branch --show-current`;
- ensure the working tree is clean enough for a read-only audit;
- do not modify application or configuration files.

Place the report under:

- `docs/audits/`

Suggested report name:

- `docs/audits/REFERENCE-DATA-INTEGRITY-DESIGN.md`

Do not modify durable architecture/backlog documents in this parcel. The audit report may recommend later changes to them.

---

# Settled product decisions

Treat the following as fixed design constraints.

## Fail closed

If any required runtime reference dataset is:

- missing;
- malformed;
- wrong content type;
- structurally invalid;
- stale in a way the app can prove;
- inconsistent with the rest of the deployed reference dataset;

then:

- normal editable application startup must stop;
- the user must not be allowed to continue into normal network editing;
- existing saved user data must remain untouched;
- no automatic repair should modify user data.

The purpose is to prevent users from making compensating changes against incomplete or incorrect reference data.

## Runtime must not auto-rebuild missing JSON from source CSV

Do **not** propose browser-side auto-generation of missing runtime JSON from `reference-source/` CSVs.

The intended boundary is:

`source/provenance data -> build-time generation/validation -> runtime JSON -> browser validation/consumption`

not:

`missing runtime JSON -> browser rebuild from source CSV`

If automatic regeneration is appropriate, it belongs in build/development/CI tooling before deployment.

## Keep `reference-source/` for now

Do not recommend removing CSVs or manifests from `reference-source/` unless inspection identifies a concrete threat.

Their mere presence in the repository is not itself a problem.

If any source files are accidentally shipped in `dist`, report that fact and whether it creates a real security/privacy/integrity concern, but do not delete or move them in this audit.

## User data boundary

Reference-data failure handling must preserve a hard boundary between tracker diagnostics and user data.

The system must never automatically include in diagnostics or reports:

- network JSON;
- `localStorage` contents;
- network names;
- outpost names;
- imported/exported filenames;
- user-created notes;
- any other saved user state.

If a user later chooses to attach an exported network JSON manually to an email, that is their choice and outside automatic reporting.

---

# Existing context to verify

The project currently has:

- runtime reference JSON files loaded by the client;
- a build script:
  - `scripts/build-reference-data.mjs`
- npm scripts including:
  - `reference:build`
  - `reference:test`
- multiple manifests under `reference-source/` according to project context;
- Cloudflare Pages static hosting;
- a known deployed failure mode where a missing runtime reference JSON path can fall through to the SPA and return:
  - HTTP `200`
  - `text/html`
  rather than a normal JSON 404/failure response.

Verify all of this against the repository. Do not assume the current implementation matches the above exactly.

---

# Audit Area 1 — Existing manifests under `reference-source/`

Inventory every manifest-like file under `reference-source/`.

For each one, document:

- path;
- format;
- purpose;
- producer/owner;
- whether it is hand-maintained or generated;
- whether it describes:
  - source provenance;
  - source inventory;
  - localized-name inputs;
  - expected files;
  - hashes/checksums;
  - schema versions;
  - record counts;
  - build identity;
  - cross-file relationships;
- whether any existing manifest is already suitable for runtime deployment validation;
- whether it should remain deliberately separate from runtime validation.

Important question:

> Is a new runtime deployment manifest actually necessary, or can an existing manifest be safely reused/generated into a runtime form?

Prefer reuse where semantically correct, but do not force source/provenance manifests into runtime responsibility if that would blur layers.

---

# Audit Area 2 — Build pipeline

Inspect:

- `scripts/build-reference-data.mjs`
- all scripts called by `reference:build`
- all relevant reference-data tests
- localization/provenance verification invoked by build
- Vite/static asset copying behavior
- production `npm run build`

Document:

- which runtime JSON files are generated;
- which are committed vs generated only during build;
- where they live before build;
- where they end up in `dist`;
- whether `npm run build` regenerates them or only verifies committed artifacts;
- whether build can succeed with a required runtime JSON missing;
- whether build can succeed with stale/mismatched runtime JSON;
- what cross-file validation already occurs;
- what record-count/referential-integrity/schema checks already occur;
- whether the build pipeline already has a natural place to generate a runtime manifest.

Also determine whether the source CSVs/manifests under `reference-source/` are copied into `dist`.

If they are not copied, note that.

If they are copied, explain whether this is merely unnecessary exposure or an actual threat.

Do not recommend removal absent a concrete reason.

---

# Audit Area 3 — Runtime loading path

Trace the application startup path for all runtime reference data.

Identify:

- every required runtime JSON asset;
- every loader/module responsible for fetching them;
- whether they load:
  - eagerly;
  - lazily;
  - in parallel;
- how failures are currently handled;
- whether startup waits for all reference data;
- whether partial data can reach editable UI;
- how parse failures are surfaced;
- whether wrong content types are checked;
- whether a `200 text/html` SPA fallback is distinguishable today;
- whether any data is cached in-memory or browser storage;
- whether a failed reference load can mutate user data.

Produce a canonical list of required runtime assets and classify each as:

- fatal-required;
- optional/degradable;
- uncertain.

Given current product decisions, expect most or all true reference datasets to be fatal-required, but verify rather than assume.

---

# Audit Area 4 — Runtime manifest/coherence model

Evaluate the design of a small runtime deployment manifest generated during build.

Do not implement it.

Assess whether it should contain some or all of:

- manifest schema version;
- dataset/build identifier;
- app build/commit identifier if available;
- required runtime file paths;
- per-file schema/version identifier;
- SHA-256 or equivalent content hash;
- record counts;
- byte sizes;
- build timestamp;
- source/provenance manifest linkage.

For each candidate field, classify it:

- required;
- useful but optional;
- unnecessary;
- actively undesirable.

The audit should specifically evaluate SHA-256 hashes.

Question:

> Would per-file content hashes materially improve detection of mixed/stale/coherency failures in this static Pages deployment?

If yes, recommend them and describe where/how they should be generated and verified.

If no, explain why simpler dataset/version identity is sufficient.

Avoid cryptographic overclaiming: hashes here are primarily integrity/coherence fingerprints, not a trust/security signature unless there is an authenticated trust chain.

---

# Audit Area 5 — Browser startup integrity gate

Recommend the exact startup sequence.

A likely model to evaluate is:

1. fetch runtime manifest;
2. validate manifest structure/version;
3. fetch all required runtime JSON;
4. verify HTTP status;
5. verify expected content type where meaningful;
6. parse JSON;
7. verify broad schema/shape;
8. verify hash/fingerprint if adopted;
9. run selected cheap cross-file invariants;
10. only then mount the editable application.

Determine:

- which steps are genuinely necessary;
- which checks belong at build time only;
- which runtime checks are cheap enough and valuable enough to keep;
- whether runtime validation should happen before React app mount, or inside a top-level initialization state;
- whether user persistence can be loaded before reference validation so long as it is not exposed/mutated;
- whether exports can safely remain available from the fatal state without depending on reference data.

Do not assume export is safe.

Inspect the export path and answer explicitly:

> Can saved network JSON be exported safely when reference data has failed to initialize, without interpreting or mutating that saved state?

If yes, recommend whether an **Export saved data** action belongs on the fatal screen.

If no or uncertain, recommend omitting it.

---

# Audit Area 6 — Failure taxonomy

Recommend a small stable error taxonomy suitable for:

- localized user-facing fatal state;
- diagnostics;
- support email;
- automated tests.

Prefer stable machine-readable codes rather than exposing raw exception text.

At minimum consider categories for:

- manifest missing/unreachable;
- manifest invalid;
- manifest version unsupported;
- reference asset missing/unreachable;
- wrong content type / SPA fallback;
- invalid JSON;
- schema/shape invalid;
- hash/fingerprint mismatch;
- cross-file coherence failure;
- unexpected loader/internal failure.

Recommend:

- code format;
- whether the failing asset name/path should be exposed;
- whether raw URL should be hidden from normal user-facing text but retained in diagnostics;
- which fields are safe to include in a report.

Do not include user data.

---

# Audit Area 7 — Fatal startup UX

Design the behavior, not the final visual styling.

The editable application must not mount normally after a fatal reference-data failure.

Recommend:

- whether this should be a dedicated full-screen application state;
- focus behavior on entry;
- semantic heading structure;
- screen-reader announcement strategy;
- keyboard behavior;
- whether retry/reload is automatic or user-triggered;
- button set.

At minimum evaluate:

- `Reload`
- `Report`

Potentially evaluate:

- `Export saved data`

only if the audit proves export is safe without reference initialization.

User-facing copy should be conceptually along the lines of:

> Required reference data could not be loaded correctly. The tracker has stopped to protect your saved work.

Do not hard-code final English copy in the report as the only source of truth; identify localization keys/requirements.

---

# Audit Area 8 — Localization

All new fatal-state UI must use the existing localization architecture.

Inspect the current i18n/localization system and recommend:

- where new strings belong;
- required en-US baseline entries;
- sparse en-GB behavior;
- Japanese coverage requirements;
- whether diagnostic values should remain untranslated;
- how filenames/dataset identifiers should be presented;
- fallback behavior if localization itself is unavailable during startup.

Important edge case:

> If reference-data initialization fails before the normal localization layer is fully ready, what is the safest way to ensure the fatal error remains understandable?

Do not invent a parallel localization system unless necessary.

---

# Audit Area 9 — Accessibility

All new UI must conform to existing accessibility rules.

Inspect established project patterns/tests and identify required behavior for:

- semantic document structure;
- focus placement;
- keyboard navigation;
- screen-reader announcement;
- contrast/non-color-only signaling;
- button names;
- copyable diagnostics;
- reduced-motion implications if any;
- responsive behavior.

Do not weaken existing accessibility baselines.

---

# Audit Area 10 — `Report` action and privacy boundary

The reporting mechanism is settled.

## Destination

Use:

- `support@starfieldoutposts.com`

Cloudflare Email Routing forwards this to the maintainer mailbox.

## Mechanism

Use user-triggered:

- `mailto:`

Do not send telemetry or HTTP reports automatically.

Pressing `Report` should:

- open the user’s configured email client;
- prefill recipient;
- prefill subject;
- prefill technical diagnostics only.

Nothing is transmitted unless the user chooses to send the email.

## Diagnostic payload

Inspect what tracker/build/runtime metadata is actually available and recommend the smallest useful payload.

Candidates include:

- stable error code;
- failing runtime asset;
- failure category;
- app version;
- commit/build identifier if available;
- runtime manifest schema version;
- dataset/build identifier;
- current locale;
- browser user agent or simplified browser/version;
- timestamp.

Classify each field as:

- include by default;
- optional;
- exclude.

Hard exclusions:

- network content;
- localStorage;
- names of user-created networks/outposts;
- imported/exported filenames;
- saved state;
- arbitrary stack traces containing potentially sensitive browser paths;
- anything derived from user data.

Recommend user-facing privacy text near/reporting flow, conceptually:

> Reporting opens your email app and includes technical diagnostics only. No saved network data is included automatically.

All such text must be localized and accessible.

---

# Audit Area 11 — Testing strategy

Recommend tests for:

## Build-time

- manifest generation/verification;
- missing required file;
- stale file;
- malformed file;
- manifest/file mismatch;
- hash mismatch if hashes are adopted;
- invalid manifest schema;
- cross-file invariant failures.

## Runtime/unit/component

- manifest fetch failure;
- HTML returned with `200`;
- bad MIME/content type;
- invalid JSON;
- unsupported manifest version;
- missing asset;
- hash mismatch;
- schema failure;
- coherence failure;
- fatal state appears;
- editable application does not appear;
- user data is not mutated;
- Reload works;
- Report produces expected `mailto:` without user data;
- localization coverage;
- accessibility behavior.

## Deployed staging

Because `staging.starfield-outpost-network.pages.dev` is protected by an email-code Cloudflare challenge, do not assume Codex can browse it directly.

Recommend a split:

- Codex/local automated tests for implementation correctness;
- maintainer/manual staging verification for Cloudflare-specific behavior.

Do not remove or weaken preview protection as part of this work.

---

# Audit Area 12 — Cloudflare Pages SPA fallback

Investigate the currently observed behavior where a nonexistent reference JSON path may receive the SPA document with:

- status `200`;
- content type `text/html`.

Determine:

- whether this follows from current Pages fallback/routing behavior;
- whether application-level detection is sufficient;
- whether a narrow Cloudflare/static routing correction should also be considered;
- whether both should exist as defense in depth.

Do not make Cloudflare changes.

Do not recommend a routing rule that would break the SPA’s legitimate client-side navigation.

---

# Architecture questions the report must answer

The report must give explicit recommendations on these questions:

1. **Should there be a new runtime reference-data manifest?**
2. **Can any existing `reference-source/` manifest be reused or transformed for that purpose?**
3. **Should runtime files use SHA-256 fingerprints?**
4. **What exact checks should happen at build time?**
5. **What exact checks should happen in the browser?**
6. **Should the browser verify all files before editable UI is exposed?**
7. **Should normal startup abort on any required reference-file failure?**
8. **Can export remain available safely in the fatal state?**
9. **What stable error taxonomy should be used?**
10. **What diagnostics belong in the `mailto:` report?**
11. **What localization edge cases exist before full app initialization?**
12. **What accessibility requirements must the fatal state satisfy?**
13. **Should Cloudflare routing be changed in addition to application-level validation?**
14. **Are `reference-source/` CSVs/manifests shipped to production, and if so does that constitute a concrete threat?**
15. **What is the smallest implementation slice that delivers meaningful protection without overengineering?**

---

# Preferred implementation philosophy

Favor:

- deterministic startup;
- explicit failure;
- preserving user work;
- narrow validation with high signal;
- reuse of existing build/provenance machinery;
- build-time guarantees plus lightweight runtime verification;
- stable diagnostics;
- no telemetry;
- no backend;
- no runtime source-data regeneration;
- no unnecessary Cloudflare complexity.

Avoid:

- silent recovery;
- browser-side CSV rebuilding;
- partial editable mode;
- automatic deletion/reset;
- heavyweight schema frameworks if existing project patterns can do the job simply;
- duplicating build-time validation wholesale in the browser;
- turning this into a generic global crash handler.

---

# Scope

Read-only audit/design pass.

Allowed repository change:

- the audit report under `docs/audits/`

Do not change:

- app code;
- reference JSON;
- source CSV;
- manifests;
- build scripts;
- tests;
- package files;
- Vite config;
- Cloudflare config;
- deployment settings;
- DNS;
- Email Routing;
- CSP/headers;
- localization files;
- backlog/architecture docs.

Do not commit.

Do not push.

Do not deploy.

---

# Verification

Run:

- `git status`
- `git branch --show-current`
- `git diff --check`

Confirm:

- branch is `staging`;
- only the audit report changed;
- no code/configuration changed;
- no deployment occurred;
- no commit/push occurred.

---

# Completion response

Return:

1. concise summary;
2. current branch;
3. report path;
4. inventory of existing `reference-source/` manifests;
5. current reference-data build pipeline summary;
6. canonical runtime JSON inventory;
7. current runtime loading/failure behavior;
8. recommendation on new runtime manifest;
9. recommendation on reuse of existing manifests;
10. recommendation on hashes/fingerprints;
11. build-time validation recommendation;
12. browser startup validation recommendation;
13. fatal-state UX recommendation;
14. localization recommendation;
15. accessibility recommendation;
16. `mailto:` diagnostic/privacy recommendation;
17. whether export can safely be exposed in fatal state;
18. Cloudflare SPA fallback recommendation;
19. whether any source CSV/manifests are shipped in `dist`;
20. whether that shipping constitutes a concrete threat;
21. smallest recommended implementation slice;
22. open questions, if any;
23. verification performed;
24. confirmation no code/configuration/Cloudflare settings changed;
25. confirmation no commit, push, or deployment occurred.

Do not implement anything in this parcel.
