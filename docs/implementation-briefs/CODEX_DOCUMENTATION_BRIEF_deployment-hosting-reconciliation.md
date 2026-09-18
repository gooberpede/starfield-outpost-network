# Codex Documentation Brief — Reconcile Deployment and Hosting Documentation

## Objective

Bring the Starfield Outpost Tracker’s durable documentation into line with the deployment state that has now been implemented and verified.

This is a **documentation-only reconciliation parcel**.

The main goals are to:

1. update `docs/DEPLOYMENT.md` to reflect the now-live production-host redirect and current local-development policy;
2. reconcile stale statements in durable architecture/backlog documentation that still describe hosting, CSP, or deployment selection as pending;
3. add the Cloudflare Node-engine mismatch to the technical cleanup/backlog as a **non-blocking** hosting/toolchain item;
4. preserve the already-settled Dev/Prod deployment model without reopening design decisions;
5. make no application or Cloudflare configuration changes.

Do not commit or push.

---

## Branch and workflow

This work belongs on the Dev / integration branch.

Expected branch:

- `staging`

Before editing:

- run `git status`;
- run `git branch --show-current`;
- if currently on `main`, switch safely to `staging`;
- ensure the worktree is clean before making documentation changes.

Do not make this parcel directly on `main`.

Do not commit or push.

---

# Settled deployment facts

Treat the following as established current state.

## Hosting platform

- Host: Cloudflare Pages Free.
- Pages project: `starfield-outpost-network`.
- App: static Vite/React client.
- Build command: `npm run build`.
- Output directory: `dist`.
- No V1 backend.
- No Workers.
- No Pages Functions.
- No database.
- No analytics/telemetry.
- No paid hosting/runtime feature.

## Branch/environment model

### Dev / Integration

- branch: `staging`;
- deployed automatically by Cloudflare Pages as a Preview deployment when `staging` is pushed;
- stable branch preview alias:
  - `https://staging.starfield-outpost-network.pages.dev`
- browser storage is origin-specific and disposable relative to production;
- used for integration, browser, release-candidate, and Cloudflare-specific checks.

This flow has been tested successfully.

### Production

- branch: `main`;
- durable production domain:
  - `https://starfieldoutposts.com`
- automatic production deployments are disabled;
- pushing `main` alone does **not** change production;
- production deployment is triggered manually after the accepted `staging` state is promoted to `main`.

This manual gate has been tested successfully.

## Promotion workflow

The proven path is:

`local → staging → automatic Preview deployment → test → promote to main → push main → manual production deployment → smoke test`

Do not add Test, UAT, release, or other branches.

A Sandbox environment remains optional for future experimentation and does not exist yet.

---

# Production hostname redirect — now implemented

The previous policy statement that the generated production hostname *may later* redirect is now stale.

The redirect is live and verified.

## Current behavior

Bare generated production hostname:

- `https://starfield-outpost-network.pages.dev`

permanently redirects to:

- `https://starfieldoutposts.com`

Redirect behavior:

- HTTP status: 301 Permanent Redirect;
- query string preserved;
- subpath matching enabled;
- path suffix preserved;
- **subdomains are not included**.

Verified examples include:

- `/` redirects to the custom production domain;
- `/robots.txt?test=1` preserves path and query string;
- `https://staging.starfield-outpost-network.pages.dev/` does **not** redirect.

This distinction is deliberate.

Preview aliases must remain usable, including:

- `staging.starfield-outpost-network.pages.dev`;
- a possible future `sandbox.starfield-outpost-network.pages.dev`.

Document that the bare `pages.dev` production hostname is no longer intended as a user-data origin.

---

# Browser-origin policy

Preserve the following distinction.

`starfieldoutposts.com` and the bare production `pages.dev` hostname serve the same production deployment, but are different browser origins.

Because the bare production hostname now redirects to the custom domain, users should converge on:

- `https://starfieldoutposts.com`

as the single durable production origin.

Preview aliases are separate deployments/origins and have independent:

- `localStorage`;
- cookies;
- service-worker scope where applicable;
- other origin-scoped browser state.

Staging browser data is not production data.

---

# Local-development policy — updated

The previous LAN-development policy is no longer current.

`vite.config.ts` has been changed to remove:

```ts
host: true
```

The project no longer intentionally exposes the Vite development server over the LAN.

Durable documentation should now reflect:

- local development uses the default local-only Vite development server;
- deployed browser testing is performed using the Cloudflare `staging` Preview;
- production validation uses `starfieldoutposts.com`;
- no special two-PC LAN hosting workflow is required.

Do not modify `vite.config.ts` in this parcel; the implementation change has already been made.

---

# Security / privacy state

Preserve the settled state.

## Pre-release indexing

Production remains deliberately non-indexed:

- `X-Robots-Tag: noindex, nofollow`
- `robots.txt`:
  - `User-agent: *`
  - `Disallow: /`

These are temporary pre-release controls and should be removed only through an explicit public-launch decision.

Preview deployments inherit the same static controls.

## CSP and headers

The CSP/security-header parcel is complete and deployed.

Durable policy:

- scripts same-origin only;
- same-origin runtime reference-data connections;
- Google Fonts CSS from `fonts.googleapis.com`;
- font binaries from `fonts.gstatic.com`;
- object content denied;
- framing denied;
- workers denied;
- camera/microphone/geolocation denied;
- Cloudflare-provided `nosniff` and referrer-policy behavior retained.

Do not duplicate the full benchmark detail if a cross-reference is more appropriate.

Relevant benchmark:

- `docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md`

## Cloudflare Web Analytics / RUM

Cloudflare RUM / Web Analytics is intentionally disabled.

Reason:

- the project has no analytics/telemetry requirement;
- Cloudflare injected `static.cloudflareinsights.com/beacon.min.js`;
- the restrictive CSP correctly blocked it;
- the chosen resolution was to disable unnecessary RUM rather than weaken CSP.

## Cloudflare Access / Zero Trust

Not used.

Reason:

- setup required payment details outside project constraints.

Do not characterize non-indexing as authentication or access control.

## HSTS

HSTS is **not yet enabled**.

Record it as a deferred production-hardening decision.

Do not configure or recommend exact HSTS policy in this documentation parcel.

---

# Cost constraints

Keep these durable constraints explicit where appropriate.

- Cloudflare Pages hosting/runtime cost: AUD$0.
- Custom-domain registration/renewal is the only accepted recurring infrastructure cost.
- Domain renewal cap: AUD$30/year.
- Any paid hosting/runtime service requires a new explicit decision.

---

# New cleanup/backlog item — Cloudflare Node version

Add a non-blocking hosting/toolchain cleanup item.

## Observed deployment warning

Cloudflare Pages currently builds using:

- Node.js `22.16.0`
- npm `10.9.2`

During successful Pages builds, npm reports `EBADENGINE` warnings because:

- `jsdom@30.0.1` declares Node:
  - `^22.22.2 || ^24.15.0 || >=26.0.0`
- `undici@8.10.2` declares Node:
  - `>=22.19.0`

The production and staging builds both completed successfully despite these warnings.

## How to record it

Treat this as:

- **non-blocking**;
- hosting/toolchain cleanup;
- something to resolve before it becomes a real incompatibility.

Do not prescribe a fix yet unless existing project documentation already establishes a preferred Node-version policy.

Possible future resolution may involve aligning the Cloudflare build Node version with package engine requirements, but that is outside this documentation parcel.

Do not alter package dependencies, Node configuration, Cloudflare settings, or build configuration here.

---

# Known reference-data hosting issue — preserve as future work

Do not solve it in this parcel, but make sure it is not accidentally removed from future-work documentation if already present.

Known deployed behavior:

- a missing runtime reference JSON path can fall through to the SPA response;
- Cloudflare may return `200 text/html` rather than an unmistakable missing-file response.

This belongs to the forthcoming reference-data coherence / missing-JSON fallback work.

Do not implement a fix now.

---

# Documents to inspect and reconcile

At minimum inspect:

- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`
- `docs/ARCHITECTURE.md`

Also inspect relevant hosting/security documents when needed to avoid contradiction:

- `docs/benchmarks/PRODUCTION-HOSTING-READINESS.md`
- `docs/benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md`
- `docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md`
- relevant security audit documentation under `docs/audits/`

Point-in-time benchmark/audit reports should generally remain historical records.

Do **not** rewrite them merely because later work superseded their state.

Instead:

- update durable policy docs;
- preserve dated benchmark/audit findings as point-in-time evidence;
- add cross-references where useful.

---

# Required changes

## `docs/DEPLOYMENT.md`

Update it to reflect:

- staging auto-deploy has now been verified;
- manual production gate has now been verified;
- bare production `pages.dev` hostname now redirects to `starfieldoutposts.com`;
- preview subdomains remain untouched;
- `starfieldoutposts.com` is the single durable production/user-data origin;
- the old LAN/Vite hosting statement is removed/replaced by local-only development plus deployed staging testing;
- HSTS remains deferred;
- RUM remains disabled;
- reference-data fallback issue remains future work if appropriate;
- Node engine mismatch may be referenced as a cleanup concern if that fits naturally, but detailed backlog ownership can remain in `BACKLOG.md`.

Keep this document operational and concise.

## `docs/BACKLOG.md`

Reconcile stale hosting/deployment items.

Specifically:

- remove or rewrite statements that say hosting-provider selection is still pending;
- remove or rewrite statements that imply CSP/security-header deployment is still pending;
- mark the Dev/Prod Pages deployment model as established where relevant;
- mark the bare production-host redirect as complete where relevant;
- retain HSTS as deferred work;
- retain reference-data coherence / missing-JSON fallback as future work;
- add the Cloudflare Node-engine mismatch as a non-blocking cleanup item;
- retain future Sandbox as optional only if the backlog needs it.

Do not turn completed hosting work into active backlog tasks.

## `docs/ARCHITECTURE.md`

Reconcile only durable architecture statements that are now factually stale.

Likely relevant areas:

- deployment/hosting architecture;
- CSP/security posture;
- local development exposure;
- production origin.

Avoid duplicating operational detail owned by `docs/DEPLOYMENT.md`.

Prefer a short architecture statement plus link to the deployment document.

---

# Scope controls

This parcel is documentation-only.

Do not change:

- application code;
- tests;
- `vite.config.ts`;
- `public/_headers`;
- `public/robots.txt`;
- package files;
- Cloudflare configuration;
- DNS;
- redirect rules/lists;
- branch settings;
- analytics;
- HSTS;
- dependencies.

Do not deploy anything.

Do not create new branches.

Do not create a Sandbox environment.

Do not commit or push.

---

# Verification

Run:

- `git status`
- `git branch --show-current`
- `git diff --check`

Also:

- inspect the final diff for accidental scope expansion;
- confirm all modified Markdown links resolve where practical;
- confirm no application/configuration file changed;
- confirm the work remains on `staging`.

No build/test run is required for documentation-only edits.

---

# Completion response

Return:

1. concise summary;
2. current branch;
3. files changed;
4. stale deployment/hosting statements corrected;
5. how `docs/DEPLOYMENT.md` changed;
6. how `docs/BACKLOG.md` changed;
7. how `docs/ARCHITECTURE.md` changed;
8. confirmation the production-host redirect is documented as live;
9. confirmation preview subdomains remain explicitly exempt from that redirect;
10. confirmation the Cloudflare Node-engine mismatch was added as non-blocking cleanup;
11. confirmation HSTS remains deferred;
12. confirmation the reference-data missing-JSON/fallback issue remains future work;
13. any contradictions found but intentionally left in point-in-time audit/benchmark records;
14. verification performed;
15. confirmation no code/configuration/Cloudflare settings changed;
16. confirmation no deployment occurred;
17. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
