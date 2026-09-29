# HSTS policy review

**Audit date:** 22 September 2026

**Branch:** `staging`

**Scope:** Read-only review of the repository policy, Cloudflare configuration,
DNS and Pages inventory, and live production/staging responses. No application,
deployment, DNS, SSL/TLS, redirect, response-header, or Cloudflare setting was
changed.

## Outcome

```text
Current state:
    Strict-Transport-Security: max-age=86400
    Production serves the value exactly once.

Recommended next max-age:
    2592000 (30 days)

includeSubDomains:
    KEEP OMITTED

preload:
    KEEP OMITTED; review separately only after a stable long-duration policy

Reason:
    The 24-hour policy has completed multiple policy lifetimes without a known
    incident; production HTTPS, the certificate, HTTP-to-HTTPS behavior, and
    the single repository-controlled HSTS source are healthy. A 30-day step
    materially improves persistence while retaining a substantially smaller
    rollback commitment than moving directly to one year.

Next review gate:
    After max-age=2592000 has been deployed continuously for at least 30 days,
    recheck production and staging responses, the complete DNS/subdomain
    inventory, certificate state, redirects, and all possible HSTS sources.
    If those checks remain clean, consider max-age=31536000 without coupling
    that increase to includeSubDomains or preload.
```

This is a recommendation for a later implementation change. This audit does
not change `public/_headers` or any deployed policy.

## Historical and repository policy

Commit `bbc5324c2ea7647b7d2dc3425666ea64f8e1ee2a` introduced the 24-hour
policy on 18 September 2026. The repository-wide `/*` rule in
`public/_headers` currently contains exactly one declaration:

```text
Strict-Transport-Security: max-age=86400
```

The declaration therefore applies to static Pages responses that are reached
without a higher-priority edge interception or redirect. It deliberately omits
`includeSubDomains` and `preload`. The same rule also supplies the current CSP,
Permissions Policy, frame policy, and pre-release indexing header.

`docs/BACKLOG.md` accurately records that the initial rollout was verified on
staging and production, including the custom production domain. The earlier
benchmark and security-audit documents are point-in-time evidence from before
or during the initial hosting/security rollout; their older conclusions should
remain unchanged.

## Cloudflare configuration evidence

Read-only Cloudflare API checks found:

- The `starfieldoutposts.com` zone is active, unpaused, and uses the full-zone
  Cloudflare setup.
- The `starfield-outpost-network` Pages project is static and uses no Pages
  Functions. Its custom domain `starfieldoutposts.com` is active and its
  domain/certificate validation statuses are active.
- SSL/TLS mode is `Full` and reports an active certificate status.
- Universal SSL is enabled. The active Universal certificate pack covers
  `starfieldoutposts.com` and `*.starfieldoutposts.com`; the sampled pack is
  Cloudflare-managed, valid until 16 December 2026, and uses the normal
  short-lived renewal model.
- The Cloudflare dashboard HSTS setting is disabled: `enabled: false`,
  `max_age: 0`, `include_subdomains: false`, and `preload: false`.
- No zone response-header transform entrypoint exists, so no response-header
  Transform Rule was found that could add or modify HSTS.
- No zone dynamic-redirect entrypoint exists. `Always Use HTTPS` is off, while
  Automatic HTTPS Rewrites is on. Despite the former setting, the live Pages
  application redirects the apex from HTTP to HTTPS as recorded below.
- The account has one relevant Bulk Redirect. It maps only the bare production
  host `https://starfield-outpost-network.pages.dev/` to
  `https://starfieldoutposts.com`, uses status 301, preserves paths and query
  strings, and deliberately excludes Pages preview subdomains.
- A Cloudflare Access application covers
  `*.starfield-outpost-network.pages.dev` with an allow policy. It protects the
  staging and versioned preview aliases but does not cover the bare production
  `pages.dev` hostname.

No duplicate or conflicting HSTS source was found. The dashboard setting is
off, no response-header Transform Rule exists, and the live production value
exactly matches `public/_headers`. The evidence therefore supports repository
`_headers` as the only active HSTS source for the production custom domain.
The API does not expose an origin-level configuration beneath Pages, but this
static Pages project has no Function or Worker and the live/repository values
agree.

## Live response evidence

The following observations were made with fresh `curl.exe` requests on 22
September 2026. The sampled `Date` headers were around 09:41 UTC.

| Target | Observed result | HSTS result |
| --- | --- | --- |
| `https://starfieldoutposts.com/` | `200 OK`, `text/html`; the normal application shell contains the expected title and hashed JS/CSS references | Exactly one `Strict-Transport-Security: max-age=86400`; no `includeSubDomains`; no `preload` |
| Production security headers | CSP matches `public/_headers`; Permissions Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Robots-Tag: noindex, nofollow` are present | No conflicting or duplicate HSTS value |
| `http://starfieldoutposts.com/` | `301 Moved Permanently` to the same-host HTTPS URL | No HSTS on the HTTP response, as expected; browsers ignore HSTS received over HTTP |
| `https://starfield-outpost-network.pages.dev/` | `301 Moved Permanently` to the custom domain | No HSTS on the redirect response |
| Production `pages.dev` path/query probe | `/robots.txt?test=1` redirected to `https://starfieldoutposts.com/robots.txt?test=1` | Confirms documented path/query preservation |
| `http://starfield-outpost-network.pages.dev/` | `301` to the HTTPS `pages.dev` URL, which then redirects to the custom domain | Two-hop first-contact redirect; host-scoped Pages behavior is not evidence for the custom domain's HSTS policy |
| `https://staging.starfield-outpost-network.pages.dev/` | `302` to Cloudflare Access login | The unauthenticated Access response has no HSTS header; the application response behind Access was not directly available |
| Latest versioned preview URL | Also `302` to Cloudflare Access login | Same limitation as the staging alias |
| `www.starfieldoutposts.com` over HTTP and HTTPS | DNS resolution failed, consistently with the account DNS inventory | No deployed `www` host to assess |

The missing HSTS header on the production `pages.dev` redirect does not weaken
the custom domain's cached HSTS state: HSTS is host-scoped, and the generated
Pages hostname is not a subdomain of `starfieldoutposts.com`. It does mean the
compatibility hostname does not independently gain HSTS protection before its
redirect. Because it is not the durable user origin and redirects immediately,
this does not block increasing the custom domain's `max-age`.

The current staging commit is built from the `staging` branch, which contains
the same site-wide `_headers` policy, and earlier durable project evidence says
the rollout was verified there. However, the current audit could observe only
the unauthenticated Access response, not the post-auth static application
response. Production and staging are therefore **expected and previously
recorded to agree**, but current live agreement was not independently
re-established. This limitation does not affect the host-scoped production
recommendation.

## Domain and subdomain inventory

The complete Cloudflare DNS list for the zone contained six records:

| Name | Record/purpose | HTTP and HSTS relevance |
| --- | --- | --- |
| `starfieldoutposts.com` | Proxied CNAME to `starfield-outpost-network.pages.dev` | The only current web hostname; HTTPS and HTTP redirect verified |
| `starfieldoutposts.com` | Three Cloudflare Email Routing MX records | Mail transport, not an HTTP hostname |
| `starfieldoutposts.com` | SPF TXT record | Metadata only |
| `cf2024-1._domainkey.starfieldoutposts.com` | DKIM TXT record | Metadata only; not an HTTP service |

There is no `www`, `staging`, `api`, other A/AAAA/CNAME web record, delegated
sub-zone, or wildcard DNS record under `starfieldoutposts.com`. The active edge
certificate nevertheless covers the apex and wildcard, so certificate
coverage exists for a future proxied subdomain but DNS/routing and the service
itself would still need deliberate configuration. The Pages staging and
versioned preview hosts are beneath `pages.dev`, not beneath
`starfieldoutposts.com`, and are outside any apex `includeSubDomains` policy.

## `includeSubDomains` decision: KEEP OMITTED

No currently deployed custom-domain web subdomain would break, and active edge
certificate coverage includes a wildcard. That is not enough reason to enable
the directive. Its present security benefit is minimal because the zone has no
web subdomains, while it would create a durable HTTPS obligation for every
future subdomain, including internal or temporarily configured names. Email
DNS records do not themselves become HTTP services and do not justify changing
the decision.

Keep `includeSubDomains` separate from the `max-age` increase. Reconsider it
only after a deliberate future-subdomain policy and a fresh inventory proving
that every public and internal name can remain HTTPS-only for the entire
policy lifetime.

## `preload` decision: KEEP OMITTED

Preload is not appropriate in the next rollout. The domain does not yet use
`includeSubDomains`, the current policy is only one day, and the project has
not completed a stable long-duration HSTS period. Preload also creates a
browser-release removal delay beyond ordinary header rollback.

If the project later adopts a stable one-year-or-longer policy and separately
decides that all present and future subdomains must remain HTTPS-only, perform
a new preload-specific review. Do not add the `preload` directive merely as
part of the next `max-age` change.

## `max-age` progression analysis

| Candidate | Assessment |
| --- | --- |
| Hold at `86400` (1 day) | No current evidence requires a hold. Production HTTPS, certificates, redirect behavior, and header ownership are healthy. |
| Move to `2592000` (30 days) | **Recommended.** It follows the already intended conservative progression, has meaningful security value, and tests a materially longer commitment without immediately accepting a one-year recovery window. |
| Another intermediate value | Not justified by a project-specific risk found in this audit. A shorter step would add process without addressing a discovered defect; six months would skip the useful 30-day rollback checkpoint. |
| Move directly to `31536000` (1 year) | Operationally plausible but unnecessarily aggressive. The initial policy has only been deployed since 18 September, and the project has not yet demonstrated a full 30-day policy period. |

The 24-hour header was committed on 18 September and is live on 22 September,
so it has passed multiple 24-hour lifetimes. Repository history and the backlog
record a successful staging/production rollout, and this audit found no known
incident. Continuous per-client enforcement cannot be proven from a point-in-
time audit; each qualifying HTTPS response refreshes a client's expiry.

## Rollback implications

- **Current one-day policy:** after the header stops being refreshed, an
  existing client naturally ages out within its remaining lifetime, at most
  about 24 hours from the last qualifying response.
- **Recommended 30-day policy:** a client may continue forcing HTTPS for up to
  30 days from its last response. The project is committing to keep the apex
  certificate, HTTPS routing, and hosting recovery path working throughout
  that window.
- **One-year policy:** the same mechanism can lock a recently active client to
  HTTPS for up to a year. An expired/mismatched certificate, disabled proxy,
  DNS/hosting migration mistake, or HTTPS outage becomes substantially more
  consequential because browsers do not allow a certificate-error bypass for
  an HSTS host.
- **Reducing or disabling:** deploy
  `Strict-Transport-Security: max-age=0` over a valid HTTPS response. Merely
  removing the header does not clear existing client state; it lets the cached
  policy expire. A client already enforcing HSTS must still successfully reach
  the host over HTTPS to receive `max-age=0`, so preserving or restoring valid
  TLS is the practical recovery requirement.

## Certificate and HTTPS continuity

The live HTTPS request succeeded with certificate validation enabled, the
Pages custom domain is active, the zone reports active certificate status, and
Universal SSL is enabled with an active apex/wildcard certificate pack. The
apex CNAME is proxied, SSL/TLS mode is `Full`, and HTTP currently redirects to
the same host over HTTPS. Cloudflare manages the edge certificate lifecycle;
the audit did not inspect private keys and exposed none.

There is no current evidence that `starfieldoutposts.com` needs to become
HTTP-accessible or that HTTPS continuity is unreliable enough to block a
30-day policy. The application is a static Cloudflare Pages site with no
separate application origin to maintain. As with any managed certificate,
future renewal cannot be guaranteed by a point-in-time audit, so certificate
and custom-domain status remain part of the next review gate.

## Guidance applied

The recommendation uses the deployment-specific implications of current
authoritative guidance rather than treating it as a general HSTS tutorial:

- [Cloudflare HSTS guidance](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)
  requires working HTTPS throughout the policy lifetime, separates
  `includeSubDomains` and preload, and documents `max-age=0` rollback.
- [MDN's Strict-Transport-Security reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)
  confirms host-based storage, expiry refresh on qualifying HTTPS responses,
  persistence when a later response omits the header, and secure delivery of
  `max-age=0`.
- [The HSTS preload service](https://hstspreload.org/) requires at least a
  one-year `max-age`, `includeSubDomains`, `preload`, valid HTTPS across all
  subdomains, and recommends staged rollout. Its
  [removal guidance](https://hstspreload.org/removal/) warns that browser-list
  removal is delayed.

## Documentation consistency

Current-state wording requiring later reconciliation was found only in
`docs/DEPLOYMENT.md`:

1. The HSTS paragraph says "staging and production deployment verification
   remain pending." Replace that clause in a later documentation/implementation
   change with wording that the 24-hour policy was verified on staging and
   production, including the custom domain, and then update it again when any
   approved `max-age` change is actually deployed and verified.
2. The same document says Cloudflare Access / Zero Trust "is not used." The
   current account and live staging response show an Access application for
   `*.starfield-outpost-network.pages.dev`. Replace that paragraph with the
   current boundary: preview/versioned Pages subdomains are Access-protected;
   the bare production `pages.dev` hostname is public and redirects to the
   custom production domain; non-indexing remains crawler guidance rather than
   access control on public production.

`docs/BACKLOG.md` already describes the verified initial rollout accurately.
The older benchmark and audit reports are historical snapshots and should not
be rewritten to reflect later deployment state.

## Checks performed and limitations

Read-only checks performed:

- inspected `public/_headers`, current deployment/backlog documentation, the
  named historical benchmark/security reports, the initial HSTS brief, Git
  history, branch, and worktree state;
- queried the Cloudflare zone, complete DNS record list, Pages project and
  custom domains, SSL/TLS mode, HTTPS settings, dashboard HSTS setting,
  Universal SSL and certificate packs, zone/account rulesets, response-header
  and redirect entrypoints, Bulk Redirect list/items, and relevant Access app;
- probed production HTTPS, production HTTP, the production `pages.dev` host
  over HTTP/HTTPS, path/query preservation, staging, the latest versioned
  preview, `www` over HTTP/HTTPS, and the production application shell;
- compared current Cloudflare, MDN, and HSTS preload guidance.

Commands used for repository and live checks included:

```powershell
git branch --show-current
git status --short
git log -p -S 'max-age=86400' -- public/_headers docs/BACKLOG.md docs/DEPLOYMENT.md
rg -n -i "strict-transport-security|hsts|starfieldoutposts|pages\.dev|cloudflare" docs public
curl.exe --silent --show-error --max-time 20 --connect-timeout 10 --dump-header - --output NUL <URL>
```

`git diff --check` passed. A separate no-index whitespace check passed for this
new untracked report. No build or test suite was run because the audit changes
documentation only and the brief does not require those checks. Final worktree
inspection found no modified tracked file: the only file created by this audit
is `docs/audits/HSTS-POLICY-REVIEW.md`; the supplied audit brief, now listed in
the [pre-1.0 implementation-history index](../implementation-briefs/ARCHIVE.md),
was already untracked and remained untouched during this review.

Limitations:

- Cloudflare Access prevented a fresh unauthenticated observation of the
  post-auth staging application response. The Access response and configuration
  were verified, and the deployed staging commit/repository header were
  inspected, but current post-auth HSTS is not independently verified.
- The Cloudflare API and certificate status provide strong point-in-time
  evidence, not a guarantee of future DNS, renewal, or hosting continuity.
- No browser-profile inspection was needed; browser HSTS cache state varies by
  client and cannot be inferred from a raw response probe.

No stop condition for the production recommendation was triggered: live
production HSTS is established, only one source was found, HTTPS and
certificate health are established, redirect behavior is consistent, and the
custom-domain DNS inventory is complete. The staging limitation should be
closed during the later rollout verification but does not prevent the
host-scoped 30-day production recommendation.
