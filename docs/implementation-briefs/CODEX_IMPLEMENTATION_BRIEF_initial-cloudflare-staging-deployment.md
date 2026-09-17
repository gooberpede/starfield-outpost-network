# Codex Implementation Brief — Initial Private Cloudflare Pages Staging Deployment and Smoke Test

## Objective

Create the minimum repository-side changes and deployment instructions needed to establish the Starfield Outpost Tracker on a **private Cloudflare Pages staging/preview deployment**, then perform a baseline smoke test against the deployed site where access is available.

This is the first real production-hosting implementation parcel.

The purpose is to:

1. establish that the current static Vite build deploys successfully to Cloudflare Pages;
2. keep the deployment private and non-indexed during pre-release work;
3. preserve the current zero-cost static-hosting model;
4. observe Cloudflare’s default delivery/cache/header behavior before adding custom policy;
5. test the deployed application’s core load/persistence/import/export behavior;
6. record any differences between local production preview and the real Pages deployment;
7. leave CSP, custom security headers, custom cache policy, bundle optimization, domain launch, and reference-data coherence changes for later parcels.

Do **not** treat this as the final public production launch.

---

## Settled hosting decisions

Treat the following as fixed unless the current repository proves an assumption impossible.

### Hosting platform

- Cloudflare Pages Free is the chosen hosting platform.
- The tracker remains a static Vite/React client application.
- No backend is planned for V1.
- Do not add Workers, Pages Functions, databases, analytics, telemetry, paid storage, or other metered Cloudflare services.

### Cost constraints

- Hosting must remain free.
- A custom domain is accepted for launch only if registration **and renewal** remain at or below **AUD$30/year**.
- No custom domain has yet been selected or registered.
- Domain selection is not a blocker for this staging deployment.

### Public-launch constraint

The eventual public release should preferably launch directly on the final custom domain.

Reason:

- browser `localStorage` is origin-specific;
- data created under `*.pages.dev` does not migrate automatically to a later custom domain;
- the staging/preview deployment must therefore not be presented as the durable public home for user data.

### Google Fonts

Keep the current external Google Fonts behavior unchanged for this parcel.

The production-hosting readiness benchmark found no evidence requiring self-hosting or removal before the initial staging deployment.

Do not modify fonts unless the staging smoke test reveals a concrete failure.

### Development server

`vite.config.ts` currently exposes the Vite development server on the LAN intentionally.

This supports the user’s two-PC workflow:

- development on one PC;
- Starfield gameplay on another;
- tracker accessed across the trusted local network.

Do not remove or alter this behavior in this parcel.

The Vite development server must not be used as the public production host.

---

## Read first

Use the current synced repository as the source of truth.

Read at minimum:

- `docs/ARCHITECTURE.md`;
- `docs/BACKLOG.md`;
- `docs/benchmarks/PRODUCTION-HOSTING-READINESS.md`;
- `docs/audits/codex-whole-product-security-audit.md`;
- current `package.json`;
- current `vite.config.ts`;
- current static/public asset layout;
- current build scripts;
- current reference-data load paths;
- current import/export and browser-storage behavior.

Also inspect existing GitHub/deployment-related files if present:

- workflow files;
- environment files;
- Pages-specific files;
- deployment documentation.

Do not duplicate or conflict with existing deployment machinery if the repository already contains something relevant.

---

# Deployment model for this parcel

## Staging/preview, not public production

Create/use a dedicated non-production branch for the initial Pages deployment.

Preferred branch name if none already exists:

- `staging`

A different existing staging/pre-release branch may be used if the repository already has one and it is clearly appropriate.

The goal is:

- production branch remains reserved for eventual public release;
- current deployment is treated as pre-release/staging;
- staging deployment is not presented to users as the permanent application URL.

Do not invent an elaborate Git branching strategy beyond what this parcel needs.

---

## Cloudflare Pages project expectations

The Pages project should use the normal static Vite production build.

Expected values unless current repository state requires otherwise:

- build command: `npm run build`
- output directory: `dist`

Do not introduce a custom server.

Do not introduce Workers or Functions.

Do not add paid features.

Do not add custom caching rules yet.

Do not add CSP/custom security headers yet.

The purpose of this first deployment is to establish and inspect Cloudflare’s baseline behavior.

---

# Private pre-release access

## Preview protection

The staging/preview deployment should not be anonymously available to the public if Cloudflare Pages/Access can be configured for the project.

Use Cloudflare Access or the current Cloudflare-supported equivalent to protect the staging/preview deployment.

The intended behavior is:

- authorised developer access only;
- random visitors cannot browse the staging site;
- search engines cannot meaningfully crawl protected content.

Do not build an application-level login system.

Do not add authentication code to the tracker.

If Cloudflare-side configuration must be performed manually in the dashboard and Codex cannot perform it, document the exact steps instead of fabricating completion.

---

## Search-engine indexing

Confirm the actual staging/preview response behavior.

Cloudflare Pages preview deployments are expected to be non-indexable by default through an `X-Robots-Tag: noindex` response header.

Verify rather than assume.

Record:

- whether `X-Robots-Tag` is present;
- exact value;
- whether it is observed before or after Access authentication where measurable;
- whether any production/staging URL lacks the intended pre-release indexing protection.

Do not add `robots.txt` merely for redundancy unless current deployed behavior proves it necessary.

Authentication/Access is the primary pre-release privacy mechanism.

---

# Repository changes

Make only repository changes that are genuinely required to support the initial Pages staging deployment.

Possible examples, only if needed:

- minimal deployment documentation;
- a Pages-specific configuration file genuinely required by Cloudflare;
- build/deploy metadata required by the chosen integration.

Do **not** add speculative files just because Cloudflare supports them.

In particular, do not add yet:

- `_headers` for final CSP/security policy;
- custom cache directives;
- `_redirects` unless the current application genuinely requires one for correct staging behavior;
- Workers/Functions;
- service workers;
- PWA support;
- analytics;
- runtime reference-data versioning;
- bundle splitting;
- font self-hosting;
- domain redirects.

If no repository change is required for the deployment itself, that is an acceptable result. In that case, create only the deployment/smoke-test report described below.

---

# Cloudflare configuration tasks

Where tooling/account access permits, configure the Pages project.

If a task cannot be completed directly, document the required manual step precisely.

At minimum establish or document:

## GitHub source

- repository: current Starfield Outpost Tracker repository;
- deployment source: GitHub integration already linked to the Cloudflare account;
- staging branch: dedicated non-production branch.

## Build

- framework/build type appropriate to Vite/static output;
- build command: `npm run build`;
- output directory: `dist`;
- no paid build/runtime features.

## Branch behavior

Prefer:

- staging branch generates the intended staging/preview deployment;
- unrelated branches do not generate unnecessary public previews unless desired;
- `main` is not treated as a public launch merely because the Pages project exists.

If Cloudflare requires a designated production branch, document exactly how it is configured and what URL it exposes.

Do not expose a URL as a public release simply because Cloudflare labels it “production.”

---

# Baseline Cloudflare behavior: observe, do not tune

For this first deployment, leave Cloudflare Pages caching/delivery behavior at platform defaults.

Do not add custom cache rules.

Do not add immutable caching manually.

Do not add custom HTML or JSON cache policy.

The production-hosting readiness benchmark specifically recommended observing Pages defaults first.

Record the real deployed headers for representative resources, including:

- `/` or `index.html`;
- hashed JS asset;
- hashed CSS asset;
- at least one large stable-name reference JSON file;
- at least one small stable-name reference JSON file;
- favicon or another simple static asset.

Capture where observable:

- `Cache-Control`;
- `ETag`;
- `Content-Type`;
- `Content-Encoding`;
- `Age`;
- Cloudflare cache/status headers;
- any relevant `Vary`;
- `X-Content-Type-Options`;
- referrer policy;
- `X-Robots-Tag` on preview/staging;
- other notable default headers.

Do not infer header values that were not actually observed.

---

# Deployed smoke test

Once the private staging deployment is reachable, perform as much of the following as the available browser/tooling supports.

Document any limitation rather than fabricating a result.

## 1. Basic load

Verify:

- staging URL loads;
- application shell renders;
- no blank page;
- no obvious console/runtime failure if console access is available;
- no missing critical asset.

## 2. Reload/direct navigation

Verify:

- reload succeeds;
- returning to the staging root succeeds;
- no accidental 404 or SPA fallback issue;
- static assets retain correct MIME types;
- reference JSON does not return HTML fallback content.

## 3. Reference-data loading

Verify:

- all expected reference catalogues load successfully;
- no catalogue is missing;
- no obvious mixed-content/CORS issue;
- catalogue-dependent UI becomes usable;
- current fixed same-origin fetch paths work correctly on Pages.

Record any Pages-specific difference from local preview.

## 4. Import/export

Use a normal valid tracker export fixture or a small test collection.

Verify:

- JSON import works;
- imported state appears correctly;
- export produces a downloadable JSON file;
- browser download behavior works under the protected staging origin;
- no Cloudflare/Access behavior interferes with file input/download.

Do not perform destructive testing against valuable user data.

## 5. Browser storage persistence

Verify:

- create or import a small test state;
- reload;
- confirm state persists under the staging origin;
- confirm locale preference persists if practical.

Explicitly document that this staging `localStorage` is tied to the staging origin and will not automatically move to the future custom domain.

Do not create migration behavior in this parcel.

## 6. Google Fonts

Verify:

- current Google Fonts requests succeed;
- expected typography appears;
- application remains usable if font requests fail or are blocked, if this can be tested safely;
- fallback fonts do not make the UI unusable.

Do not self-host fonts.

## 7. Access protection

Verify where possible:

- authorised session can reach the staging site;
- unauthorised/private/incognito session is challenged or denied;
- protected content is not anonymously accessible.

If the environment cannot test unauthorised access, say so.

## 8. Noindex behavior

Verify staging responses include the intended indexing protection.

If Cloudflare Access makes crawler access impossible but `noindex` is still present, record both protections.

---

# GitHub/branch caution

Do not commit or push unless explicitly instructed.

If the Pages project cannot deploy until the staging branch exists remotely, explain that dependency clearly.

Do not silently create/push branches or alter repository branch settings without permission.

If manual user action is required to:

- create/push `staging`;
- select the Pages source branch;
- authorise Cloudflare;
- enable Access;

list those steps cleanly in the completion response/report.

---

# Security scope

This is **not** the CSP/security-header implementation parcel.

Do not add a final Content Security Policy yet.

Do not add HSTS yet.

Do not add Permissions-Policy yet.

Do not self-host fonts yet.

Do not duplicate headers Cloudflare already supplies.

The goal is to observe baseline deployed behavior first.

However, record any surprising or missing default security header that the later header/CSP parcel should address.

---

# Reference-data coherence scope

Do not add runtime shape/version checking yet.

Use this deployment to gather evidence relevant to the later decision.

During the smoke test, note:

- whether all 13 stable-name JSON files update coherently after deployment;
- whether reloading after a deployment produces a consistent build;
- whether missing/malformed reference responses are easy to identify;
- whether Cloudflare serves surprising stale data under its default behavior.

If a second deployment can be tested safely, perform the update test below.

---

# Optional baseline update test

If practical and possible without introducing product-code changes, perform a minimal deployment transition test.

The goal is not to redesign the app.

Possible method:

1. deploy baseline staging build A;
2. record asset/reference identifiers and headers;
3. trigger a harmless build B through a documentation-only or otherwise non-runtime change only if Cloudflare rebuild behavior permits a useful observation;
4. reload the staging deployment;
5. confirm the active deployment is coherent;
6. record whether hashed assets/reference JSON appear current;
7. record cache/header behavior.

Do not make meaningless production-code changes solely to force a deployment.

If a useful B deployment is not available naturally, defer the update/rollback test to the later hosting parcel and state that clearly.

---

# Report

Create a deployment/smoke-test report under:

- `docs/benchmarks/`

Suggested filename:

- `CLOUDFLARE-STAGING-SMOKE-TEST.md`

The report should distinguish clearly between:

- repository facts;
- Cloudflare configuration actually completed;
- manual Cloudflare steps still required;
- deployed observations;
- untested assumptions;
- future production-launch work.

---

# Report structure

## Executive summary

State:

- whether the staging deployment succeeded;
- whether Access protection is active;
- whether noindex protection is confirmed;
- whether the tracker functions normally on Pages;
- whether any release-blocking deployment issue was discovered.

## Deployment configuration

Record:

- Pages project name if known;
- GitHub repo/source;
- branch;
- build command;
- output directory;
- assigned `*.pages.dev` URL(s) if available;
- whether URL is a preview/staging or Cloudflare-designated production URL;
- Access status.

Do not include secrets, tokens, IDs that should not be committed, or account-private values.

## Default response behavior

Table representative headers for:

- HTML;
- JS;
- CSS;
- reference JSON.

## Smoke-test results

Include:

- basic load;
- reload;
- reference loading;
- import;
- export;
- `localStorage`;
- fonts;
- Access;
- noindex.

Use:
- PASS;
- FAIL;
- NOT TESTED;
- MANUAL STEP REQUIRED

where useful.

## Differences from local production preview

Record only observed differences.

## Findings

Classify as:

- `BLOCKER`
- `PRE-RELEASE`
- `OPTIONAL`
- `DEFER`

Do not reuse historical security-audit IDs.

## Manual Cloudflare steps

List exact steps the user still needs to complete.

## Recommended next hosting parcel

End with a concise recommendation for the next parcel based on real deployment behavior.

Likely candidates include:

- CSP/custom security headers;
- custom domain registration/attachment;
- deployed update/rollback test;
- reference-data coherence handling.

Do not assume all are required if the staging evidence says otherwise.

---

# Verification

Run locally at minimum:

- `npm run build`;
- `npm test`;
- `git diff --check`.

If repository configuration changes are made, run any additional relevant checks.

For the deployed site, capture real observations where tooling permits.

Do not describe a Cloudflare step as completed unless it was actually completed or independently verified.

---

# Expected repository changes

Prefer the smallest possible change set.

Expected possibilities:

- one new deployment/smoke-test report;
- minimal Pages/deployment documentation/config only if genuinely required.

Production source should remain unchanged unless an actual deployment defect makes a minimal correction unavoidable.

If a production-code correction becomes necessary:

- stop treating it as incidental;
- document the defect clearly;
- make only the narrowest justified fix;
- test it;
- call it out explicitly in the completion response.

Do not perform unrelated cleanup.

---

# Explicit non-goals

Do not:

- register or purchase a domain;
- attach the final custom domain;
- publicly announce or release the site;
- add custom cache rules;
- add final CSP/security headers;
- self-host Google Fonts;
- change the visual design;
- split the JS bundle;
- lazy-load reference catalogues;
- add service workers;
- add backend infrastructure;
- add analytics/telemetry;
- add runtime reference-data versioning;
- remove intentional LAN development access;
- commit or push.

---

# Completion response

Return:

1. concise summary;
2. files changed;
3. local build/test results;
4. Pages project/configuration status;
5. branch/deployment URL status;
6. Access protection status;
7. noindex verification;
8. deployed load/reload result;
9. reference-data result;
10. import/export result;
11. `localStorage` persistence result;
12. Google Fonts/fallback result;
13. representative deployed headers/cache behavior;
14. any observed differences from local preview;
15. blockers;
16. pre-release follow-ups;
17. manual steps still required from the user;
18. recommended next hosting parcel;
19. confirmation no paid Cloudflare features were introduced;
20. confirmation no custom domain was purchased/configured;
21. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
