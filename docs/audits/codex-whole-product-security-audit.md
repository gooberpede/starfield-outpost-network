# Whole-Product Security Audit

Audit date: 15 September 2026

Scope: Current `starfield-outpost-network` repository, including browser application, import/export, persistence, domain validation, runtime reference data, build tooling, dependencies, and deployment assumptions.

Original disposition (15 September 2026): **Outcome B — targeted security corrections required.** The three medium-severity findings below record the risks found at audit time.

Current disposition (16 September 2026): **Targeted application-security corrections complete.** No BLOCKER, HIGH, MEDIUM, or LOW findings from this audit remain open. Informational deployment/hosting hardening remains intentionally deferred until the hosting model is selected.

The original findings, probes, category conclusions, and release recommendation below are retained as the audit-time record. The current status of each finding is recorded under [Correction status](#correction-status); historical present-tense descriptions of vulnerable behavior do not describe the corrected application.

## Original executive summary (15 September 2026)

The product has a comparatively small and generally well-contained attack surface. It is a client-only React/Vite application with no backend, accounts, authentication, database, server secrets, privileged browser permissions, or runtime code-loading feature. User-authored and imported strings flow into ordinary React text, form values, accessible attributes, and tooltips. The audit found no HTML injection sink, JavaScript execution sink, user-controlled URL sink, or evidence that `__proto__`-style JSON keys are merged into application prototypes. The one external link is a fixed HTTPS attribution link with opener isolation, and the only query-string behavior is development-only.

The main security boundary is less strict than its comments and architecture documentation imply. External imports validate the collection envelope and selected nested fields, but they do not establish the complete `OutpostNetwork` runtime type. Malformed nested entries and duplicate domain-object IDs are accepted. A small crafted document can consequently cause an exception during the next derived calculation/render, and identity collisions can cause later actions to select or delete the wrong set of objects. Imports and restored storage also have no byte, string, collection, or graph-size limits. This combines with repeated derived scans and whole-collection history snapshots to permit practical browser availability pressure from a file the user chooses to import.

Storage handling is the other material weakness. `localStorage` reads and writes can throw outside a protected recovery boundary. Storage blocking can prevent startup, quota failures are not surfaced, and malformed storage is replaced with a default collection without retaining a recovery copy. This is primarily an availability and user-data-integrity risk, not code execution.

Finding counts:

| Severity | Count |
| --- | ---: |
| BLOCKER | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 0 |
| INFORMATIONAL | 3 |

There is no **BLOCKER**. Public release should wait for the three targeted medium-severity correction slices, with complete nested import validation first. The dependency audit reported zero known advisories. All prescribed automated suites, reference checks, the production build, and lint passed.

Evidence consisted of source/dataflow inspection, repository-wide static searches, bounded Node probes of the actual deserializer and storage functions, the existing history benchmark, `npm audit`, and the full verification command set. A hostile collection was not loaded into a browser or real user storage, HTTP response headers could not be assessed because no production host has been selected, and no Apple/WebKit runtime was available.

## Threat model

### Current architecture

The application is a static browser bundle. It loads generated JSON catalogues from same-origin `/reference-data/*`, stores one `NetworkCollection` in `localStorage`, stores locale preference under a separate key, accepts a user-selected JSON file, and exports a JSON download. It makes no application API calls and has no server-side trust boundary. Runtime network traffic consists of same-origin reference-data fetches and Google Fonts requests from the CSS; a fixed attribution link navigates externally only when activated.

### Untrusted inputs

- Imported JSON text and the browser-provided filename.
- Character and outpost names, including values restored from imports or storage.
- Browser-storage content, including corrupt, hand-edited, older-schema, or unexpectedly large values.
- Persisted reference IDs and malformed relationships.
- Static/reference JSON if distributed files are accidentally malformed or replaced.
- The development-only `historyBenchmark` query-key presence.
- Third-party package code executed during install, test, or build, and package code included in the browser bundle.
- The response headers and static files eventually supplied by a production host.

### Trust boundaries

```text
user file -> FileReader -> JSON.parse -> collection checks/migration -> application state/history
browser localStorage -> JSON.parse -> recovery migration -> application state
domain/user strings -> localization interpolation -> React text/attributes
reference-source CSV/policy -> build validators -> public/reference-data JSON
public/reference-data JSON -> same-origin fetch/response.json -> typed cast -> application state/UI
application -> localStorage, FileReader, Blob, object URL, download, crypto.randomUUID
package-lock/dependencies -> tests/build tools -> production bundle
production bundle/static data -> future host/HTTP policy -> browser
```

### Assets to protect

- Integrity and recoverability of the user's persisted network collection.
- Availability of startup, import, editing, validation, Undo/Redo, and export.
- Stable-ID identity so an edit or destructive action affects only its intended object.
- Confidence that imported/user text cannot become markup, script, CSS, handlers, or navigation.
- Integrity of the distributed application and generated reference catalogue.
- Clear handling of malformed input and persistence failures without silent data loss.

There is no repository evidence of account data, authentication material, payment data, backend data, or server-held secrets.

## Method and observed scope

### Source and configuration inspected

- Root instructions and the architecture, domain, UX, backlog, and workflow documents required by the brief.
- `package.json`, lockfile v3, `vite.config.ts`, `.gitignore`, `index.html`, the generated production output, and the completed whole-product accessibility audit for reporting precedent.
- All files under `src/data/`, the collection editing/history implementation, domain models, availability/logistics/provenance calculations, the validation registry and security-relevant rules, `App.tsx`, import/export controls, status/error presentation, localization interpolation, and user-string rendering sites.
- Runtime reference loader, generated `public/reference-data/*`, source/reference build scripts and their validation tests, localization provenance/hash verification, static assets, and third-party-reference documentation.
- Tracked filenames and tracked content for likely secret material.

### Static searches

Repository searches covered all patterns required by the brief, including HTML injection and execution APIs; URL, navigation, network, and messaging APIs; browser storage and file APIs; environment-variable access; external URLs; sensitive browser capabilities; and common secret markers. Matches were inspected rather than treated as findings by occurrence alone.

No matches were found in application code for `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`, `DOMParser`, user-controlled `setAttribute`, `window.open`, `location.href`, `WebSocket`, `postMessage`, iframes, workers, service workers, clipboard, notifications, geolocation, camera/microphone, or WebAssembly.

### Bounded probes

- The actual external deserializer accepted `manufacturing: [null]`, `plannedSupply: [null]`, a cargo item missing `id`, wrong manufacturing member types, and duplicate outpost IDs. No files or application state were changed by the probe.
- A controlled 2,619,209-byte collection containing 10,000 minimal outposts was accepted. On Node 24.19.0 it serialized in 8.33 ms and deserialized in 18.84 ms with approximately 30.11 MiB heap in use. This proves the absence of a collection bound; it is not a claim that a browser can render or validate that collection safely.
- The actual storage loader was exercised with mock storage throwing `SecurityError` on read and `QuotaExceededError` on write. Both propagated. A malformed stored string followed by a failing recovery write also propagated.
- Existing benchmark, representative workload at 1,000 retained entries: 10.25 ms build time, 0.0016 ms median Undo step, 0.0021 ms median Redo step, and 9.59 MiB heap. Replacement workload at 100 distinct collections: 9.68 ms build time and 11.77 MiB heap. These are healthy baseline results for the supplied bounded fixtures, not hostile-size tests.

No deliberately enormous input was generated, and no network or unrelated-host scanning was performed.

### Verification and dependency audit

The following passed on 15 September 2026:

- `npm test` — 155/155 tests.
- `npm run test:components` — 24/24 tests.
- `npm run reference:test` — 131/131 tests.
- `npm run reference:build` — completed; generated data remained clean.
- `npm run localization:provenance:test` — 84/84 tests.
- `npm run localization:provenance:verify`.
- `npm run localization:reference-names:verify`.
- `npm run localization:terminology:verify`.
- `npm run build` — production build succeeded; 508.08 kB minified / 134.69 kB gzip JS and the existing large-chunk advisory.
- `npm run lint`.
- `git diff --check`.

The first sandboxed `npm audit --json` attempt could not reach the advisory endpoint. It was rerun with network access and succeeded: **0 critical, high, moderate, low, or informational advisories across 254 installed dependencies**.

## Original findings

| ID | Area | Severity | Type | Issue | Evidence | Recommended direction |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Import/deserialization and identity | MEDIUM | Repository code | External import does not validate the complete nested model or unique domain identities. Small malformed documents can crash derived/render paths; duplicate IDs can confuse edit/delete targeting. | `src/data/serialization.ts:33-60`; `src/data/networkMigration.ts:111-191`; `src/domain/validation/rules/duplicateCollectionEntries.ts:10-15`; `src/App.tsx:357-361`, `760-780`; bounded acceptance probe. | Add a complete, explicit external-import structural boundary, including nested member types and stable-ID uniqueness, before state replacement. Preserve deliberate unknown reference IDs and recoverable semantic contradictions. |
| SEC-02 | Resource exhaustion | MEDIUM | Repository code | File text, strings, networks, outposts, nested arrays, links, and total complexity are unbounded before read/parse/migration/render/history. | `src/ui/components/NetworkImportButton.tsx:29-62`; `src/data/serialization.ts:33-60`; `src/domain/collectionEditingSession.ts:20`, `136-157`; repeated derived scans in `src/domain/availability.ts` and validation rules; 10,000-outpost acceptance probe. | Establish justified byte and structural budgets at the import boundary, reject over-budget data before state replacement, and test representative near-limit validation/rendering. Consider history byte pressure separately from its entry-count cap. |
| SEC-03 | Browser storage/recovery | MEDIUM | Repository code | Storage read/write exceptions propagate; quota/blocked-storage failures are not surfaced; corrupt content is replaced without retaining a recovery copy. | `src/data/storage.ts:9-31`; `src/App.tsx:142`, `432-434`; `src/localization/preferences.ts:8-31`; throwing-storage probe. | Wrap reads and writes, keep the last good in-memory collection, surface persistence status, avoid claiming persistence after a failed write, and provide a non-destructive corrupt-data recovery/export path. |
| SEC-04 | Production hosting controls | INFORMATIONAL | Deployment/hosting | No host is selected, so CSP and security headers do not yet exist or cannot be verified. The actual bundle also loads Google Fonts. | `index.html`; `src/index.css:1`; `vite.config.ts`; built `dist/index.html` and CSS. | Make the deployment baseline below an acceptance criterion for the selected host; either allow the exact font origins or self-host/remove the font dependency. |
| SEC-05 | Runtime reference-data trust | INFORMATIONAL | Repository/deployment | Build-time source validation is strong, but the browser loader trusts `response.json()` through a generic type cast. Malformed same-origin catalogue files can crash the app. | `src/data/referenceDataLoader.ts:42-91`; reference builder and verification suites. | Treat generated catalogue integrity as a build/deploy invariant. If accidental partial/tampered deployments are realistic, add a compact runtime shape/version check and fail with a recoverable catalogue error; do not present this as protection from full same-origin compromise. |
| SEC-06 | Development-server exposure | INFORMATIONAL | Development configuration | `server.host: true` binds the Vite development server beyond loopback when `npm run dev` is used. The dev server is not a production host. | `vite.config.ts:8-12`. | Document that the dev server is for trusted development networks, or bind loopback by default and require an explicit opt-in when LAN testing is needed. Never deploy the Vite dev server publicly. |

## Correction status

The original audit found 0 BLOCKER, 0 HIGH, 3 MEDIUM, 0 LOW, and 3 INFORMATIONAL findings. The original findings table and detailed analysis below describe the 15 September 2026 state. The following disposition reflects the corrected implementation on 16 September 2026.

| Finding | Current status | Correction or remaining work |
| --- | --- | --- |
| SEC-01 — external import and identity | **Resolved** | External collection import validates the source structure before migration and the current shape and nonempty, unique identity scopes afterward. Malformed input is rejected atomically, including source defects that migration might otherwise discard. Stale reference IDs and structurally valid but domain-questionable user intent remain available for domain validation; ambiguous identities are not auto-repaired. |
| SEC-02 — pathological external input | **Resolved** | A selected file is limited to 4,194,304 bytes before read. An early-exiting pre-migration traversal enforces scoped array ceilings, 25,000 aggregate array members across the source graph, and 4,096 UTF-16 code units per string or key. Diagnostic paths are bounded. The dense and broad candidate fixtures were validated in named browsers, and accepted imports retain normal Undo/Redo. See the [import capacity benchmark](../benchmarks/IMPORT-CAPACITY-BENCHMARK.md) and [browser validation](../benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md). |
| SEC-03 — browser storage and recovery | **Resolved** | Storage reads and saves are guarded. A separate browser-storage envelope bounds raw length and pre-migration traversal. Incoherent multi-network sources fail as a whole rather than silently losing members. Failed recovery leaves the original stored source untouched and exposes a persistent status; normalized re-save failure is handled separately. In-memory edits and Undo/Redo survive save failures, with later save attempts able to clear the unsaved warning. Historical schemas 1–3 and the current schema remain recoverable when coherent; schema-1 exports can survive unresolved pad destinations without inventing a Cargo Link. Preference-storage exceptions are contained on a best-effort basis. See the current [browser-persistence architecture](../ARCHITECTURE.md#16-browser-persistence) and [storage capacity benchmark](../benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md). |
| SEC-04 — production hosting controls | **Informational; intentionally deferred** | No production host is selected. Configure and verify CSP, related HTTP security headers, and the deployment baseline when the hosting model is chosen. This is deployment-stage work, not an open application-code MEDIUM finding. |
| SEC-05 — runtime reference-data trust | **Informational; remains open** | The loader still casts same-origin JSON without runtime shape validation. Generated catalogue integrity remains a build/deploy invariant; a runtime shape/version check remains conditional on deployment risk, as described in the original finding. |
| SEC-06 — development-server exposure | **Informational; remains open** | Vite still binds beyond loopback with `server.host: true`. Use the development server only on trusted development networks and never as a public production host; loopback-by-default remains an optional configuration follow-up. |

**Final application-security disposition:** no outstanding BLOCKER, HIGH, MEDIUM, or LOW findings from this audit. The three informational items retain the statuses above; deployment/hosting hardening is revisited when hosting is selected.

### SEC-01 — incomplete external-import validation and identity ambiguity

**Category:** JSON import/deserialization; security-relevant domain integrity

**Affected:** `src/data/serialization.ts`, `src/data/networkMigration.ts`, domain validation and ID-based editing paths

**Type:** Repository code

The external boundary verifies an object root, current collection schema, non-empty `networks`, unique non-empty network wrapper IDs, and that each nested network can pass `migrateNetworkData`. Migration checks character, outpost, pad, endpoint, and production-route fields selectively. It reconstructs ordinary objects, which usefully drops unexpected top-level fields.

It does not validate the members of `manufacturing`, `plannedSupply`, or `outboundItems`; those arrays are retained using assertions. Several other arrays are filtered only to strings, not bounded or semantically constrained. Malformed cargo links are silently skipped rather than making an external import fail. Outpost IDs, pad IDs, and link IDs are not required to be non-empty or unique. The duplicate-collection validator explicitly states that object-identity collisions are outside its scope.

The gap has immediate consequences. `App.tsx` calls the complete validator during render. Rules and derived functions dereference entries such as `entry.productId` and cargo-item fields without treating them as `unknown`, so `manufacturing: [null]` is accepted by deserialization and can then throw. Duplicate outpost IDs produce duplicate React keys and ambiguous `find` operations; deletion filters every outpost with the selected ID, so one apparent delete can remove multiple imported objects and their links. Similar ambiguity exists for pad and link identity.

**Scenario:** a user imports a collection shared by another person. It has a current-looking envelope but includes one null manufacturing entry or repeated stable IDs. The import reports success because the boundary accepts it. The UI can blank on the next render, or a later edit/delete can act on more data than the visible target suggests.

**Impact:** session availability, confidence in import safety, and persisted network integrity. There is no evidence of script execution or prototype pollution. The required user-selected import and local-browser scope constrain severity to MEDIUM.

**Correction direction:** validate the complete nested runtime shape in one external-import boundary before dispatch. Require unique, non-empty IDs in each identity namespace and valid discriminants/member primitives. Decide explicitly whether malformed links are rejected or reported in a preview rather than silently dropped. Continue to preserve unknown reference-data IDs and domain-invalid-but-inspectable states where architecture requires them. Verify that rejection leaves collection, selected outpost, history, and storage unchanged.

### SEC-02 — unbounded import and retained-session resource pressure

**Category:** File APIs; denial of service/resource exhaustion

**Affected:** import control, deserializer/migration, derived calculations, rendering, validation, history

**Type:** Repository code

`FileReader.readAsText` is started without checking `File.size`. Parsing creates a complete string/object graph, migration maps the complete collection, and a successful import immediately becomes state and one history entry. There are no limits on network count, outpost count, strings, pads, links, manufacturing, Planned Supply, exports, or aggregate members. Gameplay capacity rules are validation/advisory semantics and do not bound imported structure.

Several calculations are linear or nested over attacker-controlled collections. Cargo availability/provenance repeatedly scans links and searches outposts/pads. Manufacturing feasibility uses a fixed-point loop over configured manufacturing entries. The full validator executes many passes on every render. React then maps major arrays into UI. The existing 1,000-entry history cap limits count, not retained bytes. Ordinary immutable edits share much structure and perform well in the existing benchmark, but repeated imports retain distinct before/after graphs and large changed strings/arrays can still accumulate.

**Scenario:** a plausible shared JSON file contains tens of thousands of outposts or large nested lists. The user selects it, causing allocation for file text, parsed data, migrated data, validation results, rendered elements, serialization to storage, and an Undo snapshot. A sufficiently large but syntactically valid document can freeze or terminate the tab. It need not exploit recursion or execute code.

**Impact:** browser-tab availability and possible loss of unsaved session work. The bounded 2.62 MB/10,000-outpost Node probe parsed quickly, demonstrating that a structural count far beyond domain scale is accepted; browser validation/rendering of that collection was deliberately not attempted. Severity is MEDIUM because the user must select the file and impact is confined to the local tab/profile.

**Correction direction:** define limits from legitimate product scale rather than arbitrary security theatre. Check `File.size` before reading, then enforce aggregate structural and string budgets while validating. Reject before dispatch/history/storage. Benchmark validation and initial rendering at the accepted ceiling. Retain the entry-count history cap, but add a policy for exceptionally large snapshots or replacement imports if measured memory warrants it.

### SEC-03 — storage exceptions and destructive fallback are not contained

**Category:** Browser storage and recovery

**Affected:** `src/data/storage.ts`, app initialization/autosave, preference storage

**Type:** Repository code

The gameplay loader calls `localStorage.getItem` before its `try`. Both first-run and recovery paths call `saveNetworkCollection`, whose `setItem` is unguarded. The autosave effect also calls it without a failure channel. Private-mode policies, blocked storage, quota exhaustion, browser/profile corruption, or serialization pressure can therefore throw during startup or after an edit. Preference storage has the same exception shape, though losing locale persistence has much lower impact.

For parse/migration failure, the loader creates a default collection and immediately overwrites the storage key. Recovery of valid entries is good when the collection parser can run, but malformed JSON or an unsupported wrapper has no retained raw recovery copy and no user-visible explanation. An exception while writing the replacement prevents even the fallback from completing.

**Scenario:** storage is disabled for the origin or quota is exhausted by a large collection. Startup throws before the application can offer export/recovery, or edits remain in memory without a reliable indication that reload will lose them. Separately, one malformed byte in stored JSON causes replacement with a fresh default and removes the original recovery evidence.

**Impact:** availability and data loss, not execution. Browser settings/quota or existing corruption are prerequisites, so severity is MEDIUM.

**Correction direction:** contain get/stringify/set errors, distinguish load corruption from save failure, keep the last good in-memory state, and expose a persistent “not saved” condition. Before resetting corrupt content, retain or offer the raw value for recovery/export where feasible. Avoid loops that repeatedly attempt a known-failing write. Apply the same defensive pattern to preference storage proportionately.

## Original category conclusions

### JSON import/deserialization

Malformed JSON, non-object roots, bare networks, wrong collection versions, empty collections, malformed network wrappers, duplicate network IDs, future network schemas, invalid character primitives, invalid outposts, invalid schema-4 explicit-presence containers, and invalid pads are rejected with localized error presentation. Older network schemas are migrated. External collection parsing finishes before `onImport` dispatches, so inputs that actually throw do not mutate collection/history/selection.

The boundary is nevertheless incomplete for nested entry types, identity uniqueness, and limits (SEC-01/SEC-02). Unexpected/prototype-related keys do not flow into prototype-merging APIs: migration constructs new ordinary objects from named properties, and the search found no generic merge or executable use. Extra fields are generally dropped. Numeric extremes such as out-of-domain ranks remain data and are diagnosed by validators; they do not become code.

### Browser storage

Legacy bare networks and valid collection entries are migrated, invalid active IDs are repaired, malformed member wrappers can be skipped, and history/presentation state is not persisted. Storage is not treated as executable input. Exception containment, quota status, and non-destructive corrupt-data recovery remain inadequate (SEC-03). Large stored collections inherit SEC-02 because startup has no size guard.

### XSS/rendering

No XSS finding. Character/outpost names, imported filenames, raw unresolved IDs, validation presentation, status text, search results, tooltips, and dialog content are strings passed through React text or ordinary attribute bindings. Localization interpolation returns strings and does not parse rich HTML. No dangerous HTML/DOM parser/evaluation/string-to-code sink exists. User/imported data does not choose element names, attribute names, style property names, CSS classes, URLs, or event handlers. Fixed reference strings from same-origin JSON are likewise escaped when rendered.

Script-like input therefore displays as inert text under the audited code. CSP is still recommended as deployment defense in depth, not as a repair for a current XSS sink.

### URL/navigation

No user-controlled URL surface was found. The only external anchor is a fixed `https://www.flaticon.com/...` URL with `target="_blank"` and `rel="noreferrer"`; it cannot be changed by imported data. There is no `window.open`, location assignment, router, hash consumer, WebSocket, or message listener. `URLSearchParams` only tests for the presence of `historyBenchmark` behind `import.meta.env.DEV`; the module is omitted from normal production behavior. Runtime fetches use fixed same-origin reference paths. Google Fonts are the only automatic cross-origin requests.

### File APIs/export

The file accept filter is convenience only; content is parsed and checked rather than trusting extension/MIME. Read errors are reported. There is no pre-read size check (SEC-02). Export uses `JSON.stringify`, an `application/json` Blob, an object URL, a temporary anchor, and revokes the URL after triggering download. The filename incorporates only a normalized ASCII character-name segment, a numeric level, and local timestamp; it cannot request an arbitrary desktop path. Browser download semantics prevent a filesystem path-traversal claim.

Export contains the persisted collection only. It does not include history, selected outpost memory, transient UI state, locale preference, other storage keys, filesystem paths, or secrets. No CSV/spreadsheet export exists, so formula injection is out of scope.

### Resource exhaustion

Documented skill caps are domain validation and UI capacity signals, not structural import bounds. Network count, names, and most nested arrays are unbounded. Fixed-point manufacturing terminates because it only adds previously unseen configured products, including on cycles, but its repeated scans can become expensive on pathological input. Cargo/link and validation paths contain repeated searches over imported arrays. The 1,000-entry history cap is implemented and tested, and representative benchmark behavior is good; retained bytes remain unbounded. SEC-02 is the resulting finding.

### Reference/static-data trust

`reference-source/*` is build-time input and does not ship as live application state. The generator performs extensive schema, identity, crosswalk, duplicate, relationship, provenance, and drift checks. Current reference tests and builds passed, and localization verification includes hashes/drift detection for the generated name overlay. `public/reference-data/*`, icons, and favicons ship to the browser.

At runtime, fixed same-origin JSON paths are fetched and cast without structural validation (SEC-05). Accidental partial/malformed deployment can cause a recoverable load error for bad JSON/status or later UI errors for wrong shapes. Replacing same-origin static data implies host/build compromise; an attacker with that capability can replace the JavaScript bundle too, so runtime catalogue validation is not a meaningful defense against full distribution compromise. It is chiefly deployment integrity and robustness.

### Dependencies/supply chain

Direct dependencies declared under `dependencies` are `react`, `react-dom`, and `csv-parse`. Only React/React DOM (plus Scheduler) are in the browser runtime graph. `csv-parse` is imported by reference/localization build scripts and tests, not by `src`, despite being classified as a production dependency. Direct development dependencies are ESLint and plugins, Testing Library packages, Node/React types, Vite React plugin, jsdom, TypeScript, typescript-eslint, Vite, and Vitest.

Lockfile v3 records registry resolutions and integrity hashes. The root package defines no install lifecycle hook. The lock contains an optional Darwin-only `fsevents` install script as a transitive development dependency. Project scripts invoke local Node/Vite/TypeScript/ESLint/Vitest tools and reference generators. `npm audit` found no known advisory. No suspicious direct runtime package or runtime dynamic package loading was found.

### Secrets

No secret finding. No tracked `.env` or common key/certificate file was present. Searches for API keys, access/auth tokens, client secrets, private-key headers, and common password/secret markers found no credential material. “password” matches were limited to editable-input type lists and related documentation/tests. `.gitignore` excludes `.env`, `.env.*` (except a possible `.env.example`), local working material, logs, build output, and dependency directories. No real secret value is reproduced here.

### Browser APIs

Used APIs are `localStorage`, `FileReader`, `Blob`, `URL.createObjectURL`/`revokeObjectURL`, synthetic download anchor creation, same-origin `fetch`, `crypto.randomUUID`, focus/animation-frame/event APIs, and drag events. Drag data is used for in-app identity/reordering rather than parsing external dropped files. No privileged permission API, worker, service worker, iframe, cross-window messaging, clipboard, notification, location, camera/microphone, or WebAssembly surface exists. Storage risk is SEC-03; file/resource risk is SEC-02.

### Build/deployment

The production build is a static Vite output with hashed JS/CSS assets, unhashed `index.html`, runtime reference JSON, no service worker/PWA layer, and no emitted source maps. The repository has no selected production host or header configuration, so response policies cannot be tested. Missing headers are classified as deployment requirements, not application defects (SEC-04). The Vite development server listens beyond loopback because `host: true`; that is a trusted-development concern only (SEC-06), and the dev server must not be used as a public host.

### Error exposure

Expected import failures are mapped to localized user-facing reasons. Raw exception messages appear only as `title` tooltips on the visible error, not as HTML, and normal JSON syntax errors expose a position/diagnostic rather than imported document contents. Unsupported/duplicate IDs may be repeated in the diagnostic, but these are the importing user's own data and are React-escaped. Reference fetch errors expose a fixed path/status in a tooltip. No console logging of user documents, production stack-trace renderer, or embedded filesystem-path disclosure was found. Browser developer tooling may still show ordinary uncaught exceptions; that is not a separate information-exposure vulnerability here.

### Security-relevant domain integrity

Validators correctly preserve and report many semantic contradictions: missing endpoints, multiple links per pad, self-links, cross-system constraints, unknown reference IDs, duplicates in set-like value collections, invalid production/body data, and other recoverable planning states. They deliberately do not repair data. The material gap is object identity itself: duplicate outpost, cargo-pad, and cargo-link IDs are neither rejected at external import nor diagnosed, and ID-based editing can affect unintended objects (SEC-01). Failed imports that actually reject do not mutate state/history/selection; successfully accepted malformed structures cross that safety boundary.

## Dependency audit

`npm audit --json` completed successfully after network access was allowed. Result:

```text
critical 0
high 0
moderate 0
low 0
info 0
total 0
installed dependency records 254
```

No package advisory becomes an application finding. React/React DOM/Scheduler are the production browser graph. `csv-parse` is build/test reachable only in current source use. Vite, plugins, TypeScript, ESLint, Vitest, jsdom, and Testing Library affect the developer/build/test environment, not the emitted runtime bundle. The audit result is time-specific and should be repeated in CI/release preparation; a clean advisory service result is not a guarantee against an unknown or compromised-package issue.

## Deployment security baseline

Once a host is chosen, require:

- HTTPS with HTTP redirected to HTTPS; enable HSTS only after the domain/subdomain policy is understood.
- A response-header CSP derived from the built bundle. A suitable starting posture is `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com`. Validate it against the deployed build and tighten it if fonts are self-hosted. Do not add `unsafe-inline`/`unsafe-eval` without measured need.
- `X-Content-Type-Options: nosniff` and correct MIME types for module JS, CSS, JSON, SVG, and fonts.
- `Referrer-Policy: strict-origin-when-cross-origin` or stricter, especially because the bundle contacts Google Fonts and exposes a fixed external link.
- A restrictive `Permissions-Policy` denying currently unused sensitive capabilities.
- Clickjacking prevention through CSP `frame-ancestors`; `X-Frame-Options: DENY` may be retained for older clients where supported.
- Short/no-cache revalidation for `index.html`; long immutable caching for content-hashed JS/CSS; deliberate version/revalidation behavior for unhashed reference JSON so HTML, bundle, and catalogue do not drift.
- SPA/static fallback rules that return `index.html` only for application navigation, not for missing JS/CSS/JSON assets with misleading `200 text/html` responses.
- Atomic deployment of the HTML, hashed assets, and compatible reference data, with post-deploy smoke checks. Do not serve source maps unless deliberately required and access/exposure has been accepted.
- Production hosting of `dist`, never the Vite development server.

Self-hosting the two font families would remove automatic cross-origin font requests and simplify CSP, but it is an optional deployment/privacy tradeoff rather than a security correction required by current dataflow.

## Accepted limitations / untested areas

- No production host is selected, so TLS behavior, DNS, CDN/object-store controls, response headers, MIME types, cache policy, atomic rollout, access logs, and live CSP enforcement were not tested.
- No hostile input was loaded into a real browser profile. Parser/storage functions were probed directly with bounded in-memory data; actual large-collection React rendering and tab memory limits were intentionally not stress-tested.
- Script-like user/import text was traced through the complete source rendering boundary and dangerous sinks were searched, but no browser automation attempted to execute an XSS payload because no markup sink was found.
- The audit did not inspect untracked local secrets outside the repository, GitHub/host configuration, registry accounts, signing keys, CI secrets, or external account settings.
- Compromised developer machines, malicious browser extensions, compromised operating systems, and a malicious package with no published advisory are outside the evidence model.
- No Apple/WebKit runtime, mobile browser, assistive technology, or hostile extension model was exercised.
- Advisory data reflects the service response on the audit date and can change.
- Source provenance and generated-data validation were inspected and executed, but Bethesda game-file licensing and redistribution terms are not a security-audit conclusion.

## Original recommended correction slices

1. **Complete external import validation (SEC-01).** Add the smallest complete structural validator at the file-import boundary, including nested discriminated values and unique/non-empty network, outpost, pad, and link identities. Make rejection atomic and add focused hostile-shape/duplicate-ID tests. Do not change the domain policy that preserves unknown reference IDs and incomplete plans.
2. **Bound pathological imports and history pressure (SEC-02).** Define legitimate product ceilings, add a pre-read byte limit plus aggregate post-parse structural/string limits, benchmark near-limit validation/rendering, and decide how an exceptionally large replacement interacts with history retention.
3. **Contain and communicate persistence failures (SEC-03).** Handle blocked/unavailable/quota storage without preventing startup, expose unsaved state, retain the last good in-memory collection, and provide a non-destructive path for corrupt raw storage before reset. Apply a proportional wrapper to locale preferences.
4. **Release/deployment checklist (SEC-04–SEC-06).** Configure and test the hosting baseline, atomic reference-data deployment, external-font policy, and trusted-network-only development-server guidance. Repeat `npm audit` at release time.

No sanitizer, backend, authentication system, rate limiter, cryptographic document signing, service worker, sandbox library, or new dependency is justified by the current evidence. The correction slices can be implemented with narrow existing-code changes after a separate implementation brief authorizes them.

## Original release recommendation (15 September 2026)

**Outcome B — targeted security corrections required.**

No credible script execution, exposed production secret, unsafe navigation, privileged-browser abuse, or known dependency vulnerability was found, so Outcome C is not warranted. Evidence is sufficient to complete the audited scope, so Outcome D is not warranted.

Before public release, the application should establish a complete external-import type/identity boundary, bounded import/resource policy, and recoverable storage-failure behavior. These are targeted changes rather than an architectural redesign. Hosting controls remain a release/deployment acceptance criterion once the deployment platform is selected.

As of 16 September 2026, those three application corrections are complete. The remaining deployment/hosting acceptance work is informational and deferred until a hosting model is selected; see [Correction status](#correction-status).

The original answer to the audit's completion question was: **malicious imported or corrupt stored values could not be shown to execute script, but small malformed/identity-colliding documents could disrupt or misdirect application behavior, unbounded documents could create practical local denial of service, and storage failures could prevent startup or cause data loss. Dependencies were clean on the audit date. Deployment choices must provide the stated browser security and integrity baseline.** The first three risks are now resolved as recorded in [Correction status](#correction-status).
