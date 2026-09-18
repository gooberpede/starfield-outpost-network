# Codex Implementation Brief — Conservative HSTS Rollout for Production

## Objective

Add a conservative HTTP Strict Transport Security (HSTS) policy for the production custom domain:

- `https://starfieldoutposts.com`

The goal is to harden HTTPS usage without creating unnecessary rollback risk.

This is a small production-hardening parcel. It should:

1. add HSTS in the repository-controlled Pages headers;
2. start with a short `max-age`;
3. exclude `includeSubDomains`;
4. exclude `preload`;
5. preserve all existing CSP and security headers;
6. avoid Cloudflare dashboard-only configuration unless repository-level headers prove ineffective;
7. verify the deployed production response before considering any longer-lived HSTS policy.

Do not commit, push, or deploy unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before changing anything:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify any unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Current hosting/security state

The application is a static Vite/React site hosted on Cloudflare Pages.

Production custom domain:

- `https://starfieldoutposts.com`

Current security headers are repository-controlled in:

- `public/_headers`

The existing file includes, among other headers:

- `X-Robots-Tag: noindex, nofollow`
- `Content-Security-Policy: ...`
- `Permissions-Policy: ...`
- `X-Frame-Options: DENY`

Cloudflare also supplies other standard response headers such as `X-Content-Type-Options` and `Referrer-Policy`.

The custom domain is already HTTPS-enabled and production smoke tests have passed.

HSTS has intentionally been deferred until now.

---

## HSTS policy for this first rollout

Add exactly this policy:

```text
Strict-Transport-Security: max-age=86400
```

This is a 24-hour policy.

Do **not** include:

- `includeSubDomains`
- `preload`

Do not use a longer `max-age` in this parcel.

Rationale:

- 24 hours is long enough to verify browser and CDN behavior;
- short enough to recover quickly if an unforeseen HTTPS/domain issue is discovered;
- `includeSubDomains` would also affect future subdomains and should not be enabled before deliberate review;
- `preload` is intentionally out of scope because it is harder to reverse and requires a more mature long-term policy.

---

## Required repository change

Update:

- `public/_headers`

Add:

```text
Strict-Transport-Security: max-age=86400
```

to the existing catch-all rule.

Preserve all current headers unchanged unless a direct conflict is discovered.

Do not:

- reorder the file unnecessarily;
- weaken CSP;
- remove `X-Robots-Tag`;
- change `Permissions-Policy`;
- change `X-Frame-Options`;
- add duplicate HSTS declarations.

If HSTS already exists anywhere in the repository, stop and report the current declaration before editing.

---

## Verify there is no conflicting HSTS source

Inspect:

- `public/_headers`
- any Cloudflare/Wrangler configuration committed to the repo;
- any other static header configuration files;
- deployment documentation for any existing HSTS note.

If a Cloudflare dashboard-level HSTS setting is known to exist from repository documentation or available connected configuration, report it.

Do not make Cloudflare dashboard changes in this parcel.

If there is no repository evidence of a competing HSTS source, proceed with the `_headers` change.

---

## Local verification

Run:

- `npm run build`
- `npm run test`
- `npm run reference:test`
- `npm run test:components`
- `npm run lint`
- `git diff --check`

Also inspect the built output and confirm:

- `dist/_headers` exists if Vite copies the public file as expected;
- it contains exactly one `Strict-Transport-Security: max-age=86400` line;
- all existing security headers remain present.

Do not treat local static-file presence alone as proof that Cloudflare serves the header. Deployment verification is still required.

---

## Documentation

Update the existing HSTS item in:

- `docs/BACKLOG.md`

to reflect:

- initial 24-hour HSTS policy implemented in repository;
- `includeSubDomains` intentionally omitted;
- `preload` intentionally omitted;
- staging/prod deployment verification still pending.

If `docs/DEPLOYMENT.md` contains a durable production-security section where HSTS belongs, add only a concise note describing the current policy.

Do not create a large new security document for this change.

Also fold in the already-completed Node runtime cleanup if the backlog still says Cloudflare staging verification is pending:

- local Node `24.21.0`;
- `.node-version` `24.21.0`;
- `package.json` `>=24 <25`;
- Cloudflare staging verified on `24.21.0`;
- no engine/EOL warnings.

This documentation cleanup should remain incidental and narrow.

---

## Staging verification expectations

After the maintainer later commits and pushes to `staging`, verify:

- staging deployment succeeds;
- no application regression;
- existing headers still appear;
- HSTS behavior on the `pages.dev` staging hostname is not treated as proof for the production custom domain.

Do not draw conclusions about `starfieldoutposts.com` from the staging hostname alone.

---

## Production rollout expectations

After staging is verified and changes are promoted to `main`, the maintainer will manually deploy production.

Production verification must confirm the response from:

- `https://starfieldoutposts.com`

includes exactly:

```text
Strict-Transport-Security: max-age=86400
```

and does **not** include:

```text
includeSubDomains
```

or:

```text
preload
```

Also confirm:

- HTTPS loads normally;
- bare-domain redirect behavior remains correct;
- no certificate errors;
- no console/security regressions attributable to the header change;
- existing CSP/security headers remain intact.

If possible, verify the raw production response headers using browser DevTools Network or another harmless read-only HTTP inspection method.

---

## Rollback expectation

Because the first policy uses `max-age=86400`, rollback is straightforward:

- remove the HSTS line;
- redeploy production;
- existing browsers may continue enforcing HTTPS for up to the remaining 24-hour lifetime.

Do not claim that removing the response header instantly clears HSTS state already cached by browsers.

No browser-state-clearing workaround needs to be implemented in this parcel.

---

## Future HSTS expansion

Do not implement these now.

After the 24-hour policy has operated cleanly, future options may include increasing to:

- 30 days;
- then 6 months or 1 year.

`includeSubDomains` should be considered separately.

`preload` should remain deferred until:

- long-lived HSTS is already stable;
- all relevant subdomains are HTTPS-safe;
- the maintainer explicitly decides the reversibility trade-off is acceptable.

---

## Scope boundaries

Expected changed files:

- `public/_headers`
- `docs/BACKLOG.md`
- possibly `docs/DEPLOYMENT.md` if a concise durable note is warranted

Do not change:

- application source;
- reference-data logic;
- localization;
- DNS;
- redirects;
- CSP directives;
- Access/Zero Trust;
- Cloudflare analytics/RUM;
- deployment branch controls;
- Node runtime;
- package dependencies;
- package lock;
- Cloudflare dashboard settings.

---

## Failure conditions

Stop and report before broadening scope if:

- another HSTS header already exists;
- Cloudflare appears to inject a conflicting HSTS policy;
- `public/_headers` is not copied into the built deployment as expected;
- adding the header causes Cloudflare Pages validation failure;
- production response behavior differs from repository expectations.

Do not silently replace repository control with a dashboard-level HSTS setting.

---

## Expected completion response

Return:

1. concise summary;
2. current branch;
3. files changed;
4. exact HSTS line added;
5. confirmation `includeSubDomains` is absent;
6. confirmation `preload` is absent;
7. existing security headers preserved;
8. build/test/lint results;
9. `dist/_headers` verification result;
10. documentation changes;
11. whether the Node backlog item was also reconciled;
12. whether any Cloudflare setting changed;
13. whether application behavior changed;
14. whether any dependency/lockfile changed;
15. confirmation no commit or push occurred;
16. exact staging and production verification still required after push/deploy.

Do not commit or push unless explicitly instructed.
