# Codex Benchmark/Audit Brief — Production Hosting Readiness

## Objective

Perform a **read-only production-hosting readiness benchmark and audit** for the Starfield Outpost Tracker.

The tracker is intended to launch as:

- a static Vite/React client application;
- hosted on **Cloudflare Pages**;
- using a custom domain if one can be registered and renewed within a hard ceiling of **AUD$30/year**;
- with **no recurring hosting/infrastructure cost beyond the domain**;
- with no paid Workers, Functions, databases, analytics, or other metered services assumed.

The purpose of this task is to gather evidence before any hosting/deployment configuration is changed.

Do **not** implement Cloudflare deployment, headers, CSP, cache rules, runtime validation, code splitting, font self-hosting, or any other production change in this task.

The output should tell us:

1. what the production build actually weighs;
2. what the app requests at startup;
3. which resources are same-origin versus external;
4. whether the current startup/request pattern is appropriate for static CDN hosting;
5. what caching behavior needs to be designed;
6. whether current reference-data delivery creates integrity or deployment-staleness concerns;
7. what the eventual CSP/security-header policy will need to account for;
8. whether any current app behavior is likely to cause a problem on Cloudflare Pages;
9. what should be implemented in the later production-hosting parcel.

## Read first

Use the current synced repository as the source of truth.

Read at minimum:

- `docs/ARCHITECTURE.md`;
- `docs/BACKLOG.md`;
- `docs/audits/codex-whole-product-security-audit.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- any existing build/performance/accessibility benchmark reports relevant to startup, bundle size, browser behavior, or asset loading.

Inspect current source/config as needed, especially:

- `package.json`;
- `vite.config.ts`;
- `src/index.css`;
- `src/data/referenceDataLoader.ts`;
- app startup/bootstrap code;
- reference-data import/load paths;
- localization loading;
- any lazy-loaded modules/assets;
- public/static assets;
- font declarations;
- service-worker/PWA code if any exists;
- existing production build output behavior.

Do not assume previous architecture notes are still complete if the current repository differs.

## Hosting constraints already settled

Treat the following as accepted project constraints for this benchmark.

### Hosting target

- Cloudflare Pages is the planned production host.
- The app should remain static-only unless a future requirement explicitly changes that.
- Do not assume Workers or Pages Functions are available or desirable.
- No backend is planned for V1.

### Cost constraint

- Hosting must remain free.
- Custom domain registration/renewal is acceptable only if total recurring domain cost is **AUD$30/year or less**.
- No other recurring infrastructure cost should be introduced.

### Development server

- `vite.config.ts` currently exposes the development server on the LAN intentionally.
- Development happens on one PC while Starfield is played on another.
- LAN accessibility is therefore a legitimate two-PC development workflow.
- Do not treat `server.host: true` as a defect to remove in this task.
- The eventual production documentation must make clear that the Vite dev server is for trusted-LAN development only and is not the production host.

### Current product model

- The tracker is client-side.
- User network state is stored locally in the browser.
- Normal application operations do not depend on a backend request.
- Production-host performance therefore depends primarily on:
  - cold-start asset delivery;
  - JavaScript/CSS size;
  - reference-data loading;
  - font loading;
  - cache behavior;
  - deployment correctness.

## Deliverable

Create a benchmark/audit report under:

- `docs/benchmarks/`

Suggested filename:

- `PRODUCTION-HOSTING-READINESS.md`

Do not modify existing audit/benchmark reports except if a factual cross-reference is absolutely necessary. Prefer adding the new report only.

# Benchmark and audit scope

## 1. Measure the current production build

Run the repository’s normal production build.

Record:

- build command;
- build success/failure;
- Vite/Rollup warnings;
- total generated output size;
- total JavaScript size;
- total CSS size;
- total static/reference-data size;
- largest individual output files;
- largest JavaScript chunks;
- largest JSON/reference-data files;
- compressed sizes where practical:
  - gzip;
  - Brotli if readily available without adding dependencies.

Separate:

- hashed build assets;
- stable-name assets;
- reference-data assets;
- fonts/images/icons if present.

If Vite reports a large-chunk warning, record:
- affected chunk(s);
- raw size;
- compressed size if measured;
- likely source modules/dependencies if readily identifiable.

Do **not** introduce code splitting in this task.

## 2. Determine the cold-start request surface

Use a production build served locally with the project’s standard preview/static serving approach.

Inspect a clean/cold page load.

Record:

- number of network requests required for initial usable startup;
- request types;
- request paths;
- resource sizes;
- which requests block or materially influence first meaningful usability;
- which resources are requested immediately versus later;
- whether all reference catalogues are loaded at startup;
- whether localization resources are bundled or fetched separately;
- whether fonts delay rendering;
- whether any duplicate or unnecessary startup requests occur.

Where practical, distinguish:

- HTML;
- JS;
- CSS;
- reference JSON;
- fonts;
- images/icons;
- other assets.

Do not optimize yet.

## 3. Enumerate all external origins

Identify every network origin the production app currently relies on.

At minimum inspect for:

- Google Fonts;
- font asset hosts;
- external APIs;
- CDN imports;
- analytics;
- telemetry;
- third-party images/assets;
- remote scripts/styles;
- source-map or dev-only references that should not appear in production.

For each origin, record:

- purpose;
- whether required for V1;
- whether requested at runtime;
- whether it will need explicit CSP allowance;
- whether self-hosting/removal is a plausible alternative.

If Google Fonts is the only external origin, say so clearly.

Do not self-host or remove anything in this task.

## 4. Review reference-data delivery

Inspect how generated reference catalogues are delivered in production.

Record:

- file paths;
- naming strategy;
- whether filenames are content-hashed or stable;
- whether they are loaded eagerly or lazily;
- whether response caching could cause stale data after deployment;
- whether the app has any version/coherence check between:
  - application build;
  - reference-data build;
  - persisted user state where relevant.

Assess the currently deferred **runtime reference-data trust** question.

The current intended model is:

- strong build-time validation remains the primary integrity boundary;
- a lightweight runtime shape/version check may be justified if stale, partial, or malformed deployments are a realistic risk;
- runtime validation is not intended as protection against a full same-origin compromise.

Report whether the current deployment shape makes a runtime check:
- unnecessary;
- useful;
- strongly advisable.

Explain why.

Do not implement it.

## 5. Assess caching requirements

Do not write final cache rules yet.

Instead classify current production assets into categories such as:

### Fingerprinted immutable assets

Examples:
- Vite hashed JS/CSS chunks.

Determine whether they are suitable for long-lived immutable browser/CDN caching.

### Stable-name application shell assets

Examples:
- `index.html`;
- stable manifest-like files.

Determine whether they require revalidation/no-cache semantics to avoid stale deployments.

### Reference-data files

Determine whether their filenames and update behavior make:
- long-lived caching safe;
- revalidation preferable;
- content hashing/versioned filenames desirable;
- current behavior sufficient.

Record any risk of:
- HTML pointing to removed chunks;
- stale JSON surviving a deployment;
- partial deployment coherence;
- users receiving mismatched app/reference-data versions.

Keep this analysis Cloudflare Pages-oriented, but do not assume custom cache rules are automatically necessary. Prefer platform defaults where they are sufficient.

## 6. Assess Cloudflare Pages compatibility

Audit the current project for obvious incompatibilities with a static Cloudflare Pages deployment.

Check:

- build command expectations;
- output directory;
- client-side routing behavior;
- root/base-path assumptions;
- whether deployment at a custom apex/subdomain works cleanly with current Vite `base`;
- redirects/rewrites requirements;
- SPA fallback requirements if relevant;
- asset path assumptions;
- direct navigation/reload behavior;
- file-size limits;
- file-count limits;
- production environment variables if any;
- dependence on Node/server APIs at runtime;
- browser-only APIs;
- any code that assumes LAN/dev-server behavior in production.

Use current Cloudflare Pages limits/documentation only if needed to verify a concern.

If external/current Cloudflare facts are required, cite their source in the report.

Do not configure Cloudflare in this task.

## 7. Security-header/CSP preparation

Do not implement headers yet.

Prepare an inventory of what the eventual production header policy will need to cover.

At minimum consider:

- Content-Security-Policy;
- `X-Content-Type-Options`;
- referrer policy;
- permissions policy;
- frame/embed policy;
- HSTS implications once HTTPS/custom domain is established;
- any Cloudflare-specific default behavior relevant to these headers.

For CSP specifically, identify current needs for:

- `default-src`;
- `script-src`;
- `style-src`;
- `font-src`;
- `img-src`;
- `connect-src`;
- `worker-src` if relevant;
- `frame-ancestors`;
- other directives only where actually needed.

Do not invent a permissive policy merely to make the current app work.

Report:
- which directives appear necessary from the current request surface;
- which external origins force exceptions;
- whether eliminating/self-hosting an external dependency would materially simplify policy.

## 8. Font-loading assessment

Because current CSS uses Google Fonts, specifically assess:

- which font families/weights are requested;
- number of external font/style requests;
- approximate transfer size;
- rendering behavior during cold load;
- whether fonts are essential to the intended visual identity;
- whether system/local fallbacks are already adequate;
- CSP implications;
- privacy/performance implications of leaving them externally hosted;
- practical implications of self-hosting later.

Do not change fonts in this task.

The purpose is to inform the later choice:
- keep external;
- self-host;
- remove.

## 9. First-load performance characterization

This is not a synthetic performance-optimization project.

Provide a practical baseline for:

- cold first load;
- warm/repeat load;
- startup after browser cache;
- rough transfer size;
- obvious main-thread/startup bottlenecks if visible;
- whether bundle size or reference-data loading dominates.

Use browser tooling where practical.

If timings are environment-specific, record:
- browser;
- machine/context;
- localhost/static-preview caveat;
- whether numbers are useful only comparatively.

Do not overstate localhost timings as equivalent to real CDN performance.

The important outcome is identifying likely bottlenecks, not producing a universal page-speed score.

## 10. Production bundle review

Inspect the main production bundle/chunks.

Identify:

- unusually large dependencies;
- large internal modules;
- duplicate libraries if any;
- localization payload contribution;
- reference-data contribution if bundled anywhere unexpectedly;
- whether obvious lazy-loading/code-splitting candidates exist.

Classify each possible improvement as:

- likely worth doing before release;
- optional optimization;
- not justified by current evidence.

Do not implement any optimization.

Do not recommend code splitting solely to silence Vite’s chunk warning.

## 11. Custom-domain readiness

Do not purchase or configure a domain.

Audit only what the application/deployment will require once one is chosen.

Assume:

- custom domain is accepted for launch;
- domain budget ceiling is AUD$30/year including renewal;
- exact name/TLD is not yet selected.

Determine whether the app itself has any:
- hard-coded hostname;
- origin assumptions;
- absolute URLs;
- canonical URL requirements;
- CORS assumptions;
- storage behavior tied to origin.

Important:

Changing from a temporary `*.pages.dev` hostname to the final custom domain changes browser origin and therefore localStorage scope.

Explicitly assess this consequence.

Document whether launch should preferably occur directly on the intended custom domain to avoid users creating local-only data on the temporary hostname.

This is an important product/data-continuity concern.

Do not create migration logic unless later requested.

## 12. Deployment/update failure modes

Identify realistic static-deployment failure modes, including:

- stale browser cache;
- stale reference JSON;
- partial/mismatched deploy;
- deleted old hashed chunks;
- user opening an old tab after deployment;
- offline/reconnecting behavior;
- external font failure;
- Cloudflare edge/cache propagation behavior where relevant.

For each, classify:
- already harmless;
- likely self-healing on reload;
- worth documenting;
- requires later implementation/design.

Do not implement service workers/offline mode unless already present.

# Explicit non-goals

Do not:

- create a Cloudflare account/project;
- connect GitHub to Cloudflare;
- register a domain;
- modify DNS;
- add `_headers`;
- add `_redirects`;
- change Vite config;
- alter `server.host`;
- change CSP;
- change fonts;
- add runtime validation;
- add cache-busting/versioning;
- add service workers;
- add analytics;
- add Workers or Pages Functions;
- optimize bundle/chunks;
- modify source code;
- modify tests;
- commit or push.

This task is evidence gathering and design preparation only.

# Report structure

The report should include:

## Executive summary

State:
- whether the current app is fundamentally suitable for Cloudflare Pages;
- whether any release-blocking hosting issue was found;
- largest practical hosting/performance concerns;
- key decisions required before implementation.

## Current production build profile

Include useful tables for:
- major output files;
- JS/CSS totals;
- reference-data totals;
- compressed sizes where measured.

## Cold-start request profile

Summarize:
- request count;
- transfer categories;
- immediate/eager reference data;
- external origins.

## Cloudflare Pages compatibility

List:
- compatible areas;
- concerns;
- required future configuration.

## Caching analysis

Separate:
- hashed assets;
- HTML/shell;
- reference data.

## Reference-data trust assessment

Provide a specific recommendation on whether lightweight runtime shape/version checking appears justified, with rationale.

## CSP/security-header preparation

List:
- likely directives;
- required external origins;
- opportunities to simplify policy.

## Font assessment

State whether keeping Google Fonts external appears:
- reasonable;
- undesirable;
- neutral pending implementation preference.

Do not make the change.

## Custom-domain/origin implications

Include the localStorage/origin consequence explicitly.

## Performance observations

Separate:
- measured fact;
- interpretation;
- possible future optimization.

## Findings / recommendations

Use severity-like labels only for practical release planning, for example:

- `RELEASE BLOCKER`
- `PRE-RELEASE`
- `OPTIONAL`
- `DEFER`

Do not reuse security-audit IDs such as `SEC-xx`.

Do not invent a security vulnerability classification where none exists.

## Recommended production-hosting implementation parcel

End with a concise proposed scope for the later implementation brief, based on evidence gathered.

# Verification

Run at minimum:

- production build;
- `git diff --check`.

Use browser/devtools inspection where practical for:
- production preview;
- cold-start requests;
- external origins;
- startup/load behavior.

If a particular benchmark cannot be performed reliably in the available environment, document the limitation rather than fabricating a result.

# Repository changes

Expected repository change:

- one new benchmark/audit report under `docs/benchmarks/`.

Avoid changes to any other file.

If tooling produces temporary build output or measurement artifacts:
- do not commit them unless already tracked and intentionally part of the repository;
- clean up temporary files before completion where appropriate.

# Completion response

Return:

1. concise executive summary;
2. report path;
3. production build totals;
4. largest bundle/chunk findings;
5. reference-data loading findings;
6. cold-start request findings;
7. external-origin inventory;
8. caching assessment;
9. Cloudflare Pages compatibility assessment;
10. runtime reference-data trust recommendation;
11. CSP/security-header preparation findings;
12. Google Fonts assessment;
13. custom-domain/localStorage-origin assessment;
14. any release blockers;
15. pre-release recommendations;
16. optional/deferred optimizations;
17. verification performed;
18. files changed;
19. confirmation no production code/config was changed;
20. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
