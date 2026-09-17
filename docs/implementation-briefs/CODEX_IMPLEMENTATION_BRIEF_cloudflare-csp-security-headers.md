# Codex Implementation Brief — Cloudflare CSP and Production Security Headers

## Objective

Implement and verify the Starfield Outpost Tracker’s **production Content Security Policy (CSP) and related HTTP security headers** for the current Cloudflare Pages deployment.

This parcel should:

1. derive the policy from the tracker’s **actual deployed request surface**;
2. keep the current static-only Cloudflare Pages architecture;
3. preserve external Google Fonts for V1 unless testing reveals a concrete incompatibility;
4. preserve the current pre-release indexing controls;
5. add only headers that are justified and not already supplied adequately by Cloudflare;
6. test the tracker under the policy across the major UI/browser behaviors that could be affected;
7. avoid unrelated caching, bundle, domain, reference-data, or performance changes.

Do not treat this as a general security rewrite.

---

## Current settled hosting state

Treat the following as current project facts unless the repository or live deployment proves otherwise.

### Hosting

- Cloudflare Pages Free.
- Static Vite/React deployment.
- Current live pre-release hostname:
  - `https://starfield-outpost-network.pages.dev`
- No Workers.
- No Pages Functions.
- No backend.
- No analytics/telemetry.
- No paid Cloudflare features.

### Cost constraints

- Hosting must remain free.
- No paid Cloudflare service may be introduced.
- Custom domain is accepted for launch only if registration and renewal stay at or below AUD$30/year.
- Custom domain is not part of this parcel.

### Current pre-release indexing protection

The repository currently includes:

- `public/_headers`
- `public/robots.txt`

The live deployment has been manually verified to return:

- `X-Robots-Tag: noindex, nofollow`

and:

```text
User-agent: *
Disallow: /
```

Preserve these protections.

Do not weaken or remove them.

### Access / Zero Trust

Cloudflare Access / Zero Trust is **not being used** because it requires payment details, which are outside project constraints.

Do not reintroduce Access or any paid/account-billing requirement.

### Google Fonts

Keep Google Fonts external for V1 unless this CSP implementation demonstrates a concrete functional or deployment problem.

The current automatic external origins are expected to be:

- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`

Do not self-host or remove fonts in this parcel.

### Development server

The LAN-facing Vite development server remains intentional for the user’s two-PC development/gameplay workflow.

Do not alter `server.host`.

---

## Read first

Use the current synced repository and current live Pages deployment as the source of truth.

Read at minimum:

- `docs/ARCHITECTURE.md`;
- `docs/BACKLOG.md`;
- `docs/audits/codex-whole-product-security-audit.md`;
- `docs/benchmarks/PRODUCTION-HOSTING-READINESS.md`;
- `docs/benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md`;
- `public/_headers`;
- `public/robots.txt`;
- `src/index.css`;
- current React/component code that sets inline `style` properties;
- current import/export code;
- current reference-data loader;
- current build configuration.

Also inspect the deployed site’s current response headers before editing anything.

Where Cloudflare behavior is time-sensitive or platform-specific, verify against current Cloudflare documentation rather than relying on stale assumptions.

---

# Scope

## 1. Establish the current deployed header baseline

Before making changes, record the actual headers currently returned for representative live resources:

- `/`
- hashed JavaScript asset
- hashed CSS asset
- one large `/reference-data/*.json`
- `/robots.txt`

At minimum record, where present:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `X-Robots-Tag`
- `Cache-Control`
- `ETag`
- `Content-Type`

Do not duplicate headers merely because they are common recommendations.

If Cloudflare already supplies an acceptable value, prefer preserving the platform default unless a stronger project-specific requirement is justified.

---

## 2. Design a restrictive CSP from the real request surface

Start from the actual tracker behavior, not a generic CSP template.

The current expected needs are:

### Same-origin application resources

- application JavaScript;
- application CSS;
- reference JSON;
- favicons/icons;
- local static assets.

### External fonts

- Google Fonts stylesheet from:
  - `https://fonts.googleapis.com`
- Google font binaries from:
  - `https://fonts.gstatic.com`

### No known need for

- remote scripts;
- analytics;
- WebSockets;
- service workers;
- frames;
- embedded third-party content;
- object/plugin content;
- arbitrary APIs.

### Candidate policy direction

Investigate and test a policy along these lines:

- `default-src 'self'`
- `script-src 'self'`
- `connect-src 'self'`
- `img-src 'self'`
- `font-src 'self' https://fonts.gstatic.com`
- `style-src-elem 'self' https://fonts.googleapis.com`
- `frame-ancestors 'none'`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`

Do **not** assume the exact final syntax above is correct until tested.

Add directives only where they are actually useful.

---

## 3. Handle React inline styles deliberately

The production-hosting audit identified React components that use inline `style` properties.

This is the most important CSP compatibility question in this parcel.

Do not simply add a blanket permissive `unsafe-inline` to all styles without investigation.

Determine:

- which interactions/components use inline style attributes;
- whether current browser CSP behavior requires a `style-src-attr` exception;
- whether a narrower policy is possible;
- whether allowing inline style attributes is the practical V1 choice.

If an exception is necessary, scope it as narrowly as the platform permits and explain why.

Do not rewrite component styling architecture merely to eliminate inline styles unless a small, obviously beneficial change is required and remains within scope.

Prefer CSP correctness over unnecessary UI refactoring.

---

## 4. Add the CSP using Cloudflare Pages static headers

Use the existing `public/_headers` mechanism if appropriate.

Preserve the existing:

```text
/*
  X-Robots-Tag: noindex, nofollow
```

Extend the file only with the final justified security headers.

Do not move this logic into Workers or Functions.

Do not introduce an application server.

---

## 5. Review related security headers

Evaluate whether the project should explicitly add any of the following:

- `Content-Security-Policy`
- `Permissions-Policy`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `X-Content-Type-Options`

### Important guidance

#### `X-Content-Type-Options`

Cloudflare Pages may already supply `nosniff`.

If the live deployment already provides an acceptable value, do not duplicate it unnecessarily.

#### `Referrer-Policy`

Cloudflare Pages may already supply a default such as `strict-origin-when-cross-origin`.

If that value is acceptable, do not override it just for uniformity.

#### `X-Frame-Options`

If `frame-ancestors 'none'` is present in CSP, decide whether adding:

```text
X-Frame-Options: DENY
```

provides worthwhile legacy defense.

Avoid contradictory policies.

#### `Permissions-Policy`

Use a restrictive policy only for browser capabilities the tracker does not need.

Do not add an enormous deny-list simply for appearance.

Prefer a small, maintainable explicit policy justified by current features.

#### HSTS

Do **not** add HSTS automatically.

Assess:

- current Cloudflare HTTPS behavior;
- implications for the future custom domain;
- rollback risk;
- whether HSTS is better deferred until the final custom domain exists.

If deferred, record that decision.

---

## 6. Preserve current functional behavior

The CSP/header implementation must not break:

- initial tracker load;
- reload;
- all 13 reference-data fetches;
- locale switching;
- browser `localStorage`;
- JSON import;
- JSON export/download;
- Google Fonts;
- system/local font fallbacks;
- dialogs/popovers/dropdowns;
- drag/drop or pointer interactions if present;
- keyboard interaction;
- focus behavior;
- any UI that relies on dynamically generated inline styles.

Do not accept a CSP that technically “works” but silently disables legitimate UI behavior.

---

## 7. Use staging preview if it can now be exercised safely

The repository has both:

- `main`
- `staging`

The Cloudflare Pages project is configured so:

- `main` is the production branch;
- automatic production deployment is disabled;
- preview deployment branch controls include `staging`.

If a legitimate push to `staging` can trigger a preview deployment cleanly, use that preview to test the CSP before promoting the same reviewed change to `main`.

However:

- do not create meaningless commits solely to force staging;
- do not spend excessive time fighting Cloudflare’s UI if preview deployment remains unreliable;
- if staging cannot be exercised cleanly, document the limitation and use the existing controlled `main` retry/deploy process only after the diff is reviewed.

Do not alter branch policy in this parcel unless required to correct a proven configuration defect.

---

## 8. Pre-deployment local verification

Before any deployment:

- run `npm run build`;
- run `npm test`;
- run `git diff --check`.

Confirm:

- `_headers` is copied into `dist`;
- `robots.txt` remains copied into `dist`;
- no unrelated file changed.

Where practical, serve the production build locally and test the header file syntax indirectly through build output inspection.

Do not claim CSP behavior is verified locally if the local preview server does not apply Pages `_headers`.

---

## 9. Deployed CSP smoke test

After deployment, verify actual live response headers.

### Required checks

#### Main document

Confirm:

- intended `Content-Security-Policy` is present;
- `X-Robots-Tag: noindex, nofollow` remains present;
- other intended security headers are present;
- no accidental duplicate/conflicting header value is emitted.

#### Application load

Confirm:

- tracker renders normally;
- no blank page;
- no CSP console violations that indicate legitimate application behavior is blocked.

#### Reference data

Confirm:

- all 13 reference JSON requests succeed;
- no `connect-src` violation;
- reference-dependent UI works.

#### Fonts

Confirm:

- Google Fonts stylesheet loads;
- required WOFF2 files load;
- no CSP violation for Google font origins;
- fallback remains usable if fonts are unavailable.

#### Import/export

Confirm:

- import still works;
- export/download still works;
- no CSP restriction interferes with Blob downloads or file input.

#### Inline-style interactions

Exercise UI surfaces known to use React inline style props and confirm there are no CSP violations or broken layouts.

#### Framing

If practical, verify that embedding the app in an iframe is denied by the intended policy.

Do not build a dedicated external test harness unless needed.

---

## 10. Record CSP violations

Use browser console/devtools or available automated browser tooling.

For each violation:

- identify directive;
- identify blocked resource/action;
- determine whether:
  - the app behavior is legitimate and policy needs adjustment;
  - the behavior is unnecessary and should stay blocked;
  - the violation is development-tool noise and irrelevant to production.

Do not solve CSP problems by broadly allowing:

- `*`
- `unsafe-eval`
- remote script origins
- arbitrary `data:` / `blob:` sources

unless the tracker genuinely requires them and the rationale is documented.

`blob:` may be relevant to export/download behavior; verify actual need rather than assuming.

---

# Documentation

Update the existing Cloudflare deployment/smoke report, or create a new focused benchmark/report if that produces clearer history.

Preferred new report if substantial findings exist:

- `docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md`

The report should distinguish:

- pre-change deployed baseline;
- final implemented headers;
- CSP design rationale;
- inline-style decision;
- Google Fonts allowances;
- manual/browser checks;
- deferred items;
- staging-vs-main deployment path actually used.

---

# Findings classification

Use:

- `BLOCKER`
- `PRE-RELEASE`
- `OPTIONAL`
- `DEFER`

Do not reuse historical security-audit IDs outside the original audit document.

---

# Explicit non-goals

Do not:

- add custom cache rules;
- optimize the JS bundle;
- split chunks;
- lazy-load catalogues;
- self-host Google Fonts;
- remove Google Fonts;
- add analytics;
- add service workers;
- add Workers or Pages Functions;
- introduce backend infrastructure;
- register or attach a custom domain;
- implement reference-data versioning/coherence checks;
- fix the missing-reference-JSON SPA fallback in this parcel;
- add HSTS unless the final-domain implications are explicitly resolved;
- alter the intentional LAN dev-server behavior;
- remove `noindex` pre-release controls;
- commit or push unless explicitly instructed.

---

# Expected repository changes

Expected:

- `public/_headers`

Possible:

- one new focused benchmark/report under `docs/benchmarks/`

Avoid production source changes unless a genuine CSP incompatibility forces a small, justified fix.

If a production-code change becomes necessary:

1. stop and document the exact CSP incompatibility;
2. make the narrowest possible correction;
3. test it;
4. call it out explicitly in the completion response.

Do not perform unrelated cleanup.

---

# Verification

Run at minimum:

- `npm run build`;
- `npm test`;
- `git diff --check`.

After deployment, verify real headers and browser behavior against the Cloudflare-hosted site.

Do not report a header as present merely because it exists in `public/_headers`; confirm the deployed response.

---

# Completion response

Return:

1. concise summary;
2. files changed;
3. pre-change deployed security-header baseline;
4. final CSP;
5. final related headers added;
6. headers intentionally left to Cloudflare defaults;
7. inline-style compatibility decision;
8. Google Fonts CSP allowances;
9. staging or production deployment path used;
10. deployed CSP/header verification;
11. tracker load/reload result;
12. reference-data result;
13. import/export result;
14. `localStorage` result if tested;
15. font-load/fallback result;
16. any CSP violations observed and how they were resolved;
17. iframe/frame-ancestor result if tested;
18. blockers;
19. pre-release follow-ups;
20. deferred items;
21. confirmation no paid Cloudflare feature was introduced;
22. confirmation no custom domain was configured;
23. confirmation no cache policy was changed;
24. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
