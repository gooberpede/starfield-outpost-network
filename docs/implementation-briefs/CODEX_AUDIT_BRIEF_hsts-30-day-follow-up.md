# CODEX AUDIT BRIEF — HSTS 30-Day Follow-Up and One-Year Policy Decision

## Objective

Perform a **read-only** follow-up to the 22 September 2026 HSTS review for Starfield Outpost Network. Determine whether the deployed 30-day HSTS policy has demonstrated sufficient HTTPS continuity and operational safety to justify a later, separately authorized move to **one year**.

**Candidates:**

- **Retain:** `Strict-Transport-Security: max-age=2592000` (30 days)
- **Consider:** `Strict-Transport-Security: max-age=31536000` (one year)

The initial preference is to **keep `includeSubDomains` and `preload` omitted**, irrespective of the `max-age` outcome. Treat them as independent policies; neither is authorized by this audit. Do not interpret the elapsed calendar interval as automatic approval to increase HSTS.

This task produces evidence and a recommendation **only**. It must not change source, DNS, Cloudflare settings, deployments, tags, releases, or remote repository state.

## 1. Governing records and baseline

Read first:

- `AGENTS.md`
- `docs/DEPLOYMENT.md`
- `docs/audits/HSTS-POLICY-REVIEW.md`
- `docs/BACKLOG.md` (HSTS-related entries)
- `docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md`
- `public/_headers`
- any post-review launch/deployment record, especially the 1.0 launch and subsequent releases

Record the audit date/time (Australia/Sydney), checked-out branch, exact HEAD, local and remote `main`/`staging` heads, and worktree status. Do **not** switch branches. The task should run on `staging`, but if the checkout is on `main` or unexpected tracked changes exist, **stop and report** without forcing a branch change. Preserve all pre-existing untracked/ignored material and supplied briefs.

The September review established a single repository-owned 24-hour header, recommended the 30-day transition, and specified this follow-up gate. Treat its Cloudflare/DNS/certificate inventory as **historical**, not proof of today's state. The repository is expected to declare `max-age=2592000`, but verify rather than assume.

## 2. Establish the real 30-day observation period

Using Git and Cloudflare deployment history where available, identify:

- commit that changed `public/_headers` from 86400 to 2592000;
- first successful production deployment serving the new header, with date/time and deployment ID;
- subsequent production deployments and whether each retained that value;
- any periods with an alternate/absent/conflicting HSTS value, HTTPS incident, certificate error, TLS misconfiguration, or hostname/redirect failure;
- at least **30 continuous days** between first verified deployment of the 30-day header and the review date.

Do not assert continuous operation merely because a Git commit is older than 30 days. Distinguish **verified evidence**, **reasonable continuity inference**, and **gaps** (for example, missing historic HTTP response samples). If evidence supports only “deployed for at least 30 calendar days, with no known incidents,” report exactly that.

## 3. Current live HTTP response matrix

Make fresh, bounded HTTP checks. Capture status, relevant `Location`, certificate validation outcome, `Strict-Transport-Security` occurrence/count and exact value, and other security headers only as needed to identify interference.

Check at least:

| Origin/route | Required evidence |
| --- | --- |
| `https://starfieldoutposts.com/` | Actual application response; one header with correct `max-age`; no `includeSubDomains`/`preload` |
| `http://starfieldoutposts.com/` | HTTPS redirect chain; preserve path/query |
| `https://www.starfieldoutposts.com/` | Current `www` redirect chain; certificate; whether **redirecting host** itself emits HSTS |
| `http://www.starfieldoutposts.com/` | First-contact HTTPS/canonical redirect behavior; path/query preservation |
| `https://starfield-outpost-network.pages.dev/` | Bare production alias redirects to canonical apex; no preview alias hijacking |
| `https://staging.starfield-outpost-network.pages.dev/` | Access gate plus, if authorized session permits, the **post-auth static response** HSTS value |
| Representative versioned preview | Confirm protection and that bare-host redirects do not swallow preview URLs |

Use at least one safe representative path/query probe on the canonical and `www` redirect chains (e.g. `/robots.txt?probe=hsts-review`). Record each hop separately; **do not** infer a host's HSTS header from the final apex response. Browsers ignore HSTS delivered over HTTP. Cloudflare Pages `_headers` may not apply to a redirect response; test actual behavior rather than presuming the file governs all redirects.

Never use `curl -k` / disable certificate verification to claim a TLS PASS. If an endpoint requires Cloudflare Access, obtain an authenticated response only through legitimately available credentials/session; do not attempt to bypass Access. Unauthenticated Access 302 is **not** evidence of the staging application response. If unreachable, record the exact limitation and which check remains open.

## 4. Current Cloudflare and DNS control-plane inventory

Use read-only Cloudflare API/dashboard access **if available**, otherwise record a finite owner-dashboard checklist. Inspect:

- zone status, DNS records, CNAME/A/AAAA, wildcard and delegated names relevant to `starfieldoutposts.com`;
- apex and `www` DNS resolution, proxy state, custom domain/Pages association and redirect implementation;
- Pages project's production/preview settings, branch triggers and Access boundaries;
- SSL/TLS mode and edge certificate issuance/active status, SAN coverage, current expiration and automatic renewal status; include `www` explicitly;
- HTTP-to-HTTPS redirects, `www` → apex permanent redirect, bare production `pages.dev` → apex, and path/query preservation;
- zone-level HSTS settings, `Always Use HTTPS`, Bulk Redirects, Redirect Rules, Transform Rules, Workers/Functions, any relevant Rulesets and alternate response-header sources;
- whether multiple HSTS headers or inconsistent values can be emitted, especially where repository `_headers` and Cloudflare controls overlap;
- prospective hosting/DNS/certificate changes that would make a year-long HTTPS commitment risky.

The September audit found dashboard HSTS disabled, no relevant header transform, and a valid Cloudflare-managed certificate. Do not carry those results forward without fresh verification. The **`www` hostname was subsequently introduced**, so the earlier six-record inventory is no longer sufficient. Do not paste credentials, private certificate keys, sensitive tokens or account identifiers into the report.

## 5. Policy analysis

Assess separately:

**A. `max-age`:** evidence for retaining 30 days versus moving to one year; HTTPS/certificate renewal reliability; managed-hosting and rollback risk; the value of a longer cached HTTPS-only period; any concrete incident or unresolved uncertainty.

**B. `includeSubDomains`:** independently review the actual subdomain inventory and future naming needs. Default recommendation remains **omit**, including if one-year `max-age` is approved. Do not infer that `www` redirect compatibility requires enabling it.

**C. `preload`:** default recommendation remains **omit**. Do not submit to browser preload lists or imply a one-year `max-age` alone approves preloading.

**D. `www`:** distinguish the canonical apex's HSTS guarantee from the separate security posture of `www`. If `www` redirects without HSTS, explain its first-contact behavior and the practical options without bundling an unapproved DNS/redirect/header redesign into the one-year decision.

**E. Rollback:** explain that existing clients may enforce the cached policy for up to the last advertised lifetime since their latest qualifying HTTPS response. Merely removing HSTS does not erase cached policies. A shorter `max-age` or `max-age=0` requires valid HTTPS delivery to the client. Assess recovery obligations for a one-year policy; no rollback setting is authorized here.

Consult current Cloudflare HSTS/Pages header-and-redirect docs, MDN or RFC 6797, and preload guidance as necessary. Cite precise URLs/access dates in the report, distinguishing public documentation from verified project-specific behavior.

## 6. Branch divergence and safe future rollout

**Critical:** production deployments are manually controlled, while `staging` may contain unshipped feature work (including the 1.1 line or later). Inspect current `main` and `staging` divergence and describe whether using the normal branch-promotion workflow for a one-line HSTS change would accidentally ship unrelated application work.

Recommend an **implementation sequencing strategy**, not commands to execute during this audit. Possibilities include waiting for the next accepted application release, or a narrowly controlled production hotfix from `main` with subsequent reconciliation into `staging`. Do not choose a method that rewrites release tags, silently advances production, or strands the branches. If current history complicates a standalone header-only deployment, record the exact issue for a separate implementation brief.

## 7. Deliverable and decision

Create only:

`docs/audits/HSTS-30-DAY-FOLLOW-UP-REVIEW.md`

Include:

1. executive finding and disposition;
2. baseline branch/commit and historical evidence comparison;
3. dates and confidence level for the 30-day deployment period;
4. live response matrix with HSTS header counts/values and redirect hops;
5. full current DNS/Cloudflare/certificate/HSTS-source inventory, or explicit unavailable checks;
6. detailed `www` assessment;
7. separate `max-age`, `includeSubDomains`, and `preload` recommendations;
8. one-year rollback/HTTPS continuity consequences;
9. `main`/`staging` divergence and non-executed safe deployment strategy;
10. finite gaps or owner verification requirements;
11. exact next step if the recommendation is accepted.

Use one disposition:

- **HSTS-FU-A:** evidence supports moving to one-year `max-age`, with both other directives omitted; ready for a separate implementation authorization.
- **HSTS-FU-B:** retain 30 days pending named finite verification gaps or risk resolution.
- **HSTS-FU-C:** material HTTPS/certificate/header/redirect issue found; remediate separately before reconsidering duration.

Do not mark HSTS-FU-A if a material control-plane or live HTTPS verification gap remains unresolved. Avoid turning minor evidence limitations into imaginary incidents, but be precise about confidence.

## 8. Scope and verification

**No modifications** to `public/_headers`, application code, tests, docs other than the single new audit report, DNS, Cloudflare zone/Pages settings, custom domains, SSL/TLS/HSTS controls, repository branches, tags, releases, deployment or access policies. Do not commit, push, deploy, or publish. Do not install new dependencies.

Run `git status --short`, `git diff --check`, and a separate whitespace/EOF check for the new untracked report. No build or tests are needed for a report-only task. Record any inability to access a specific live or authenticated source rather than guessing its result.

Report to maintainer: baseline, disposition, what was verified live, what was only inferred, control-plane evidence, branch divergence, open checks, created report, and confirmation of no operational changes.

Suggested commit after maintainer review (not authorized by this task):

`docs: review 30-day HSTS policy and one-year readiness`
