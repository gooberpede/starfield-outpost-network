# Deployment

## Purpose

Starfield Outpost Network uses two Cloudflare Pages environments: a `staging`
preview for integration and release checks, and a manually released production
site from `main`. The application is a static Vite/React build with browser
`localStorage`; there is no V1 backend, Worker, Pages Function, or database.

## Environment model

| Environment | Git branch | Origin | Deployment trigger | Browser data and indexing |
| --- | --- | --- | --- | --- |
| Dev / Integration | `staging` | `https://staging.starfield-outpost-network.pages.dev` | Automatic on pushes to `staging` (verified) | Disposable, origin-specific `localStorage`; previews remain non-indexed. Used for integration, browser, release-candidate, and Cloudflare-specific checks. |
| Production | `main` | `https://starfieldoutposts.com` | Manual release after `main` is pushed; automatic production deployments are disabled (verified) | Single durable production origin for users' browser `localStorage`. The site is pre-release and non-indexed until an explicit public-launch decision. |

Browser data is local to each origin and browser profile. Staging data does not
become production data when a commit is promoted. JSON export/import is the
available way to move a saved collection between origins; keep backups of
valuable production data. See [Architecture](ARCHITECTURE.md) for persistence
and import/export boundaries.

## Promotion workflow

`local change → commit and push staging → automatic preview → test → promote accepted commits to main → push main → manually deploy production → smoke test`

Promote the tested Git state to `main`; do not copy individual files between
environments. A push to `main` alone does not update production. At the manual
release gate, deploy the build of the intended `main` commit and verify the
deployed commit before smoke testing the public domain. A failed preview or
release check should be resolved before promotion.

## Cloudflare Pages configuration

- Project: `starfield-outpost-network`, connected to GitHub.
- Build command: `npm run build`; output directory: `dist`.
- Production branch: `main`; automatic production deployments: **disabled**.
- Preview branch policy: **Custom**, including `staging` only. Unrelated
  branches are not set to deploy automatically.
- The static site uses Cloudflare Pages Free. No paid hosting feature is part
  of this deployment model.

These branch controls and the staging auto-deploy and manual production gate
were verified on 18 September 2026. Production release still requires a
deliberate manual deployment.

## Domain and origin policy

`https://starfieldoutposts.com` is the single durable production and user-data
origin. The bare generated production hostname
`https://starfield-outpost-network.pages.dev` now returns a verified 301
Permanent Redirect to that domain. It preserves path suffixes and query strings
(including `/robots.txt?test=1`). The rule excludes subdomains: the `staging`
preview alias does not redirect, and any future `sandbox` preview alias must
remain usable.

The custom domain and bare production `pages.dev` hostname serve the same
production deployment but are different browser origins. The redirect
converges visitors on the custom domain; it does not transfer `localStorage`.
Preview aliases are separate deployments and origins with independent
`localStorage`, cookies, service-worker scope where applicable, and other
origin-scoped state. Staging browser data is not production data. The bare
production `pages.dev` hostname is no longer a user-data origin.

## Cost constraints

Hosting and recurring infrastructure must remain AUD$0 on Cloudflare Pages
Free. The only accepted recurring infrastructure expense is the custom-domain
registration/renewal, capped at AUD$30 per year. A paid service requires a new
explicit decision. V1 has no backend, Workers, Pages Functions, database, or
analytics/telemetry service.

## Security and privacy

- Pre-release production sends `X-Robots-Tag: noindex, nofollow` from
  `public/_headers`. `public/robots.txt` contains `User-agent: *` and
  `Disallow: /`. Keep these until the explicit public-launch decision.
  Previews remain non-indexed through the same static files.
- `public/_headers` supplies a restrictive CSP: scripts, reference-data
  connections, images, and static assets are same-origin; Google Fonts CSS
  from `fonts.googleapis.com` and font binaries from `fonts.gstatic.com` are
  allowed. Object content, framing, and workers are denied. Camera,
  microphone, and geolocation are denied. Cloudflare's `nosniff` and referrer
  policy defaults are retained. The header parcel is deployed; HSTS is not
  enabled and remains a deferred production-hardening decision. See the
  [CSP and security headers benchmark](benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md).
- External Google Fonts remain accepted for V1. Self-hosting or removal needs
  a concrete reason from later testing.
- Cloudflare Web Analytics / RUM remains disabled: there is no telemetry
  requirement, and its injected `static.cloudflareinsights.com` beacon
  conflicted with the CSP. Do not loosen CSP merely to enable it.
- Cloudflare Access / Zero Trust is not used because setup required payment
  details outside project constraints. Unadvertised URLs and non-indexing
  provide limited pre-release visibility, **not access control**. Do not place
  sensitive data on staging on the assumption that it is private.

For earlier hosting and security evidence, see the [production hosting
readiness benchmark](benchmarks/PRODUCTION-HOSTING-READINESS.md), [first Pages
smoke test](benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md), and [whole-product
security audit](audits/codex-whole-product-security-audit.md). Those reports
record their point-in-time state; this document owns the current deployment
policy.

## Local development

Vite uses its default local-only development server; no special two-PC LAN
hosting workflow is required. Deployed browser and Cloudflare-specific testing
uses the `staging` Preview, and production validation uses
`https://starfieldoutposts.com`.

## Reference-data hosting follow-up

`npm run reference:build` deliberately regenerates runtime JSON, the manifest,
and the bundle's expected dataset ID for local development. The production
build verifies all 13 committed runtime JSON files against regenerated
temporary output before refreshing those derived artifacts. A post-build check confirms matching files in
`dist/reference-data`. A missing Pages JSON path may still fall through to
`200 text/html`; the startup gate detects that MIME response and stops the
editor. Reload retries the complete gate. Report opens a prefilled email with
technical diagnostics only and sends nothing automatically. No Cloudflare
routing correction is part of this mechanism.

## Future Sandbox

No Sandbox branch or deployment is needed now. Consider one later if risky
experiments start interfering with normal `staging` integration and release
checks; that would be a separate design and configuration decision.

## Operational checklist

1. Build and check the change locally; commit and push it to `staging`.
2. Confirm Pages created the staging preview and test the application there,
   including relevant browser and Cloudflare behavior. Treat its browser data
   as disposable.
3. Promote the accepted Git commits to `main` and push. Confirm production has
   not deployed automatically.
4. Manually deploy the intended `main` commit to production. Confirm the
   deployment succeeded and is serving the expected commit.
5. Smoke-test `https://starfieldoutposts.com`: load and reload, reference data,
   relevant changed behavior, browser persistence, and import/export where the
   release affects them. Check the pre-release indexing/security headers until
   the launch policy changes.
