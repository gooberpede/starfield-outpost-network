# Codex Implementation Brief — Establish Dev/Prod Deployment Pipeline and Deployment Documentation

## Objective

Establish and document the Starfield Outpost Tracker’s simple two-environment deployment model:

- **Dev / Integration:** Git branch `staging`, automatically deployed by Cloudflare Pages as a preview environment.
- **Prod:** Git branch `main`, deployed to `https://starfieldoutposts.com`, with production deployment remaining manual.

This parcel should:

1. verify the current Cloudflare Pages branch/deployment controls;
2. correct them only if they do not match the intended model;
3. create a durable `docs/DEPLOYMENT.md` describing the settled deployment architecture, operational constraints, and promotion workflow;
4. make no application-code changes;
5. return the diff for review before any commit or push.

Do not commit or push.

---

## Current repository state

Treat the following as current facts unless inspection proves otherwise:

- `main` and `staging` are currently synchronized at the same commit.
- `staging` was recently fast-forwarded from `main`.
- `main` contains the current Cloudflare hosting/security configuration and documentation.
- The current production site is:
  - `https://starfieldoutposts.com`
- The Cloudflare Pages project is:
  - `starfield-outpost-network`
- The generated Cloudflare Pages production hostname is:
  - `https://starfield-outpost-network.pages.dev`

The next intentional change should be made on `staging`, not `main`, so that it can serve as the first real test of the automatic Dev-preview pipeline.

---

## Settled deployment model

Use the following model unless current Cloudflare constraints make it impossible.

### Dev / Integration environment

- Git branch: `staging`
- Purpose:
  - normal integration testing;
  - browser testing;
  - release-candidate validation;
  - Cloudflare-specific testing before promotion to production.
- Deployment:
  - automatically triggered by pushes to `staging`;
  - Cloudflare Pages preview deployment;
  - separate origin from Prod;
  - browser `localStorage` is disposable and independent from production.
- Search indexing:
  - preview environments should remain non-indexed.
- User data:
  - do not treat staging browser data as durable production data.

### Production environment

- Git branch: `main`
- Public domain:
  - `https://starfieldoutposts.com`
- Production deployment:
  - manual gate;
  - pushes to `main` must **not** automatically deploy production.
- Browser data:
  - `starfieldoutposts.com` is the durable production origin for `localStorage`.
- Current release state:
  - pre-release;
  - `X-Robots-Tag: noindex, nofollow`;
  - `robots.txt` blocks crawling;
  - these protections stay until the explicit public-launch decision.

### Promotion model

The intended normal workflow is:

1. develop/change locally;
2. commit/push to `staging`;
3. Cloudflare automatically deploys the staging preview;
4. test/review staging;
5. merge/promote accepted `staging` state to `main`;
6. push `main`;
7. production does **not** deploy automatically;
8. explicitly trigger production deployment;
9. smoke-test `https://starfieldoutposts.com`.

Do not add additional Test/UAT/release branches at this stage.

### Sandbox

A separate Sandbox environment is **not** required now.

Record only that one may be introduced later for risky experiments if normal development starts interfering with the staging environment.

Do not create a `sandbox` branch or deployment in this parcel.

---

## Settled hosting and cost constraints

Document these durable constraints.

### Hosting

- Cloudflare Pages Free.
- Static Vite/React app.
- No backend planned for V1.
- No Workers.
- No Pages Functions.
- No database.
- No analytics/telemetry.
- No paid hosting feature.

### Domain

- Registered domain:
  - `starfieldoutposts.com`
- Registrar:
  - Cloudflare Registrar.
- Custom-domain renewal budget:
  - maximum AUD$30/year.
- `starfieldoutposts.com` is the intended durable public origin.

### Recurring infrastructure cost

- Hosting/infrastructure should remain AUD$0.
- The only accepted recurring infrastructure expense is the custom domain, within the AUD$30/year cap.
- Any future paid service requires an explicit new decision.

---

## Current production security/deployment state

Document the current production policy at a durable, high level.

### Search indexing

Current pre-release production controls:

- `X-Robots-Tag: noindex, nofollow`
- `robots.txt`:
  - `User-agent: *`
  - `Disallow: /`

These remain until launch.

### CSP and security headers

The production Pages site currently uses a restrictive CSP from `public/_headers`.

Document the durable intent rather than duplicating every implementation detail if the exact policy is already documented elsewhere:

- scripts: same-origin only;
- reference-data connections: same-origin only;
- images/static assets: same-origin;
- Google Fonts:
  - stylesheet from `fonts.googleapis.com`;
  - font binaries from `fonts.gstatic.com`;
- framing denied;
- object content denied;
- workers denied;
- camera, microphone, and geolocation denied;
- Cloudflare default `nosniff` and referrer policy retained;
- HSTS deferred until the final-domain policy/rollback implications are explicitly settled.

Cross-reference existing CSP/security-header benchmark documentation where appropriate rather than copying large sections.

### Google Fonts

- External Google Fonts remain accepted for V1.
- Do not self-host or remove them unless later testing reveals a concrete reason.

### Cloudflare analytics / RUM

- Cloudflare Web Analytics / RUM is intentionally disabled.
- Reason:
  - no analytics/telemetry requirement;
  - injected `static.cloudflareinsights.com` beacon conflicted with the restrictive CSP;
  - project policy is to disable unnecessary telemetry rather than loosen CSP.

### Cloudflare Access / Zero Trust

- Not used.
- Reason:
  - configuration required payment details;
  - payment details / paid-account setup are outside the project constraints.
- Pre-release privacy therefore relies on:
  - unadvertised URLs;
  - non-indexing controls;
  - no public launch until ready.

Do not present this as strong access control.

---

## Generated `pages.dev` hostname policy

Do **not** configure a redirect in this parcel.

Document the intended future policy:

- the bare production hostname:
  - `starfield-outpost-network.pages.dev`
  should eventually redirect to:
  - `https://starfieldoutposts.com`
- preview subdomains must **not** be indiscriminately redirected, because Cloudflare branch previews are needed for the staging environment.

This distinction is important.

The redirect should therefore target only the bare production `pages.dev` hostname, not `*.starfield-outpost-network.pages.dev`.

---

## Development server policy

Document that:

- `vite.config.ts` intentionally exposes the local development server on the LAN;
- development occurs on one PC while Starfield runs on another;
- LAN access supports the user’s two-PC workflow;
- the Vite development server is trusted-LAN development only;
- it must never be treated as the public production host.

Do not change the Vite configuration.

---

# Cloudflare verification task

Before editing documentation, inspect the current Cloudflare Pages project configuration.

Project:

- `starfield-outpost-network`

Verify the current source/deployment settings.

## Required target configuration

### Production

- production branch: `main`
- automatic production deployments: **disabled**

### Preview

- preview deployment mode: **Custom**
- `staging` included as a preview branch
- unrelated branches should not auto-deploy unless already explicitly intended

If the configuration already matches this target:

- do not change it;
- record that it was verified.

If it differs:

- make only the minimum Cloudflare-side correction needed to match the intended Dev/Prod pipeline;
- record exactly what changed;
- do not trigger a deployment.

Do not:

- deploy `main`;
- deploy `staging`;
- change domain configuration;
- change DNS;
- change CSP/headers;
- change caching;
- enable analytics;
- enable Access;
- enable paid features.

The purpose of this step is configuration verification only.

---

# Create durable deployment documentation

Create:

- `docs/DEPLOYMENT.md`

This should be a durable operational/design document, not an audit report.

It should be concise enough to remain useful but complete enough that a future conversation or contributor can understand:

- which branch maps to which environment;
- how changes move to Prod;
- which deployment steps are automatic versus manual;
- where browser data lives;
- cost constraints;
- domain/hostname roles;
- Cloudflare feature decisions;
- security/indexing posture;
- staging-data expectations;
- how/when a Sandbox might be added;
- where detailed benchmark/audit evidence lives.

Prefer cross-references to existing documents over duplication.

Relevant existing documents may include:

- `docs/ARCHITECTURE.md`;
- `docs/BACKLOG.md`;
- `docs/benchmarks/PRODUCTION-HOSTING-READINESS.md`;
- `docs/benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md`;
- `docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md`;
- `docs/audits/codex-whole-product-security-audit.md`.

Do not rewrite those documents unless a factual contradiction requires correction.

If a contradiction exists, report it rather than broadening scope silently.

---

# Recommended `DEPLOYMENT.md` structure

Use a structure similar to:

## Purpose

Short explanation of the deployment model.

## Environment model

Table or concise sections for:

- Staging / Dev
- Production
- Optional future Sandbox

Include:

- branch;
- hostname/origin;
- deployment trigger;
- data durability;
- indexing/public status.

## Promotion workflow

Document the normal path:

`local → staging → test → main → manual Prod deploy → smoke test`

Make clear that Git commits are promoted; files are not manually copied between environments.

## Cloudflare Pages configuration

Document:

- project name;
- build command:
  - `npm run build`
- output:
  - `dist`
- production branch;
- production auto-deploy state;
- preview branch policy.

## Domain and origin policy

Document:

- `starfieldoutposts.com`
- `pages.dev` role
- `localStorage` origin isolation
- future bare-host redirect policy

## Cost constraints

Document:

- free hosting;
- no paid runtime services;
- domain renewal cap.

## Security and privacy

Document:

- CSP location;
- noindex state;
- analytics/RUM disabled;
- Access not used;
- HSTS deferred;
- Google Fonts external.

## Local development

Document intentional LAN Vite behavior.

## Future Sandbox

Document the trigger for adding one, without creating it now.

## Operational checklist

Short checklist for:
- staging release;
- production promotion;
- post-deploy smoke test.

Do not turn this into a large release-management manual.

---

# Branch/worktree expectations

The repository should currently be on `staging`.

Verify before making changes.

If the current checkout is not `staging`, do not silently write the documentation to `main`; switch to `staging` if safe and report it.

Do not commit.

Do not push.

The final diff should therefore represent a **staging-only working-tree change** ready for review.

---

# Expected repository changes

Expected:

- `docs/DEPLOYMENT.md`

Avoid changes elsewhere.

Do not change:

- production source;
- tests;
- `public/_headers`;
- `public/robots.txt`;
- `vite.config.ts`;
- Cloudflare security configuration;
- domain/DNS settings;
- branch contents beyond the uncommitted documentation file.

If a current documentation inconsistency genuinely requires one tiny correction elsewhere, call it out explicitly before making it.

---

# Verification

Run:

- `git status`
- `git branch --show-current`
- `git diff --check`

Verify:

- working branch is `staging`;
- only intended documentation changed;
- no commit occurred;
- no push occurred;
- Cloudflare branch controls were inspected;
- no deployment was triggered.

No application test run is required for a documentation-only repository change unless Codex changes something beyond documentation.

---

# Completion response

Return:

1. concise summary;
2. current local branch;
3. Cloudflare Pages project configuration observed;
4. whether any Cloudflare setting had to be corrected;
5. confirmation automatic staging previews are configured;
6. confirmation automatic production deployments are disabled;
7. files changed;
8. summary of `docs/DEPLOYMENT.md`;
9. any documentation contradictions found;
10. confirmation no application code changed;
11. confirmation no deployment was triggered;
12. confirmation no paid feature was enabled;
13. verification performed;
14. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
