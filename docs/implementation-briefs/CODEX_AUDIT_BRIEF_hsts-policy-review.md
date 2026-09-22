# CODEX AUDIT BRIEF — HSTS Policy Review and Next-Rollout Decision

## Objective

Perform a **read-only HSTS policy audit** for the deployed Starfield Outpost Network application and produce a durable recommendation for the next HSTS rollout state.

This audit should use:

- the current repository and durable deployment/security documentation;
- the current deployed staging and production responses;
- the connected Cloudflare account/plugin, read-only;
- current Cloudflare configuration and DNS/subdomain inventory;
- current authoritative HSTS guidance where useful.

Do **not** change:

- `public/_headers`;
- Cloudflare settings;
- DNS;
- SSL/TLS settings;
- redirects;
- application code;
- repository configuration;
- deployment state.

The only repository change permitted by this audit is the new durable audit report.

---

# 1. Historical context

The project deliberately introduced HSTS conservatively.

The currently established repository policy is:

```text
Strict-Transport-Security: max-age=86400
```

That is:

```text
24 hours
```

and deliberately omits:

```text
includeSubDomains
preload
```

The previous rollout was later verified on staging and production, including the custom production domain.

The prior conversation also recorded that HSTS lengthening/review should not occur before **20 September 2026**.

That date has now passed.

The user recalls the original intended progression approximately as:

```text
1 day
→ 1 month
→ 1 year
```

Treat that progression as **historical intent to evaluate**, not as a binding requirement. The audit should determine whether that staged policy remains appropriate given the actual current deployment, Cloudflare configuration, domain/subdomain inventory, rollback implications, and current guidance.

Do not silently assume that 30 days or 1 year is necessarily the correct next value.

---

# 2. Current repository policy to inspect

Inspect at minimum:

```text
public/_headers
docs/DEPLOYMENT.md
docs/BACKLOG.md
docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md
docs/benchmarks/PRODUCTION-HOSTING-READINESS.md
docs/benchmarks/CLOUDFLARE-STAGING-SMOKE-TEST.md
docs/audits/codex-whole-product-security-audit.md
AGENTS.md
```

Also inspect other current deployment/security documents if they materially affect the decision.

Establish:

- exact HSTS header currently committed;
- which response scope in `_headers` receives it;
- whether repository documentation still accurately describes the deployed state;
- whether any stale “pending verification” wording remains in current-state documents;
- whether point-in-time historical reports should remain unchanged.

Do not rewrite historical audit/benchmark conclusions merely because the current state has advanced.

---

# 3. Cloudflare account/configuration audit

Use the connected Cloudflare plugin **read-only**.

Identify the relevant zone/project/account state and inspect, where available:

```text
zone/domain configuration
DNS records
Pages project domains
custom domains
production hostname
staging/preview hostnames
redirect rules
SSL/TLS mode
Edge certificate status
Always Use HTTPS or equivalent HTTPS enforcement
Cloudflare HSTS dashboard setting
Transform Rules / response-header rules relevant to HSTS
certificate coverage
HTTP-to-HTTPS behavior
```

The purpose is to determine whether HSTS is being controlled only by repository `_headers`, or whether Cloudflare is also adding/modifying it elsewhere.

Specifically check for:

- duplicate `Strict-Transport-Security` sources;
- conflicting `max-age` values;
- Cloudflare dashboard HSTS being enabled separately;
- an `includeSubDomains` or `preload` setting outside the repository;
- any response-header transform rule that could alter HSTS;
- certificate or HTTPS configuration that would make a longer HSTS policy unsafe.

Do not change any Cloudflare setting.

If the plugin cannot expose a relevant setting, state that limitation explicitly.

---

# 4. Live response verification

Inspect actual deployed responses.

At minimum verify:

## Production custom domain

```text
https://starfieldoutposts.com/
```

Check:

- exact `Strict-Transport-Security` header value;
- whether it appears exactly once;
- absence/presence of `includeSubDomains`;
- absence/presence of `preload`;
- existing CSP and other security headers remain intact;
- HTTPS response is healthy;
- certificate is valid;
- normal application shell loads.

## Production Pages hostname

Inspect the current production `pages.dev` hostname and its redirect behavior.

Confirm:

- whether it redirects to the custom domain as documented;
- whether HSTS is present on the redirect response;
- whether the behavior creates any material policy concern.

Do not treat HSTS on the `pages.dev` hostname as equivalent to HSTS on the custom domain: HSTS is host-scoped.

## Staging/preview

Inspect the established staging hostname if accessible through the Cloudflare plugin or directly.

Confirm:

- current HSTS response;
- whether staging behavior differs from production;
- whether any difference matters to the production decision.

If Cloudflare Access/authentication prevents direct browser access, use the connected Cloudflare tooling or report the limitation. Do not weaken access controls.

## HTTP behavior

Where safely inspectable, verify:

```text
http://starfieldoutposts.com/
```

and any canonical `www`/production alias if one exists.

Record redirect behavior to HTTPS.

Remember that browsers ignore HSTS delivered over HTTP; the purpose here is to understand first-contact redirect behavior and deployment consistency.

---

# 5. Domain and subdomain inventory

This is essential before considering `includeSubDomains`.

Using Cloudflare DNS/project data, inventory all current names under:

```text
starfieldoutposts.com
```

Examples to check if present:

```text
www.starfieldoutposts.com
staging.starfieldoutposts.com
api.starfieldoutposts.com
mail-related web hosts
verification/legacy hosts
future placeholders
other A/AAAA/CNAME records
```

Do not assume that the `pages.dev` preview hostname is a subdomain of `starfieldoutposts.com`; treat host relationships accurately.

For each actual HTTP-capable subdomain, determine where evidence permits:

- whether HTTPS works;
- whether a valid certificate exists;
- whether it redirects safely;
- whether it is intentionally unused;
- whether applying parent-domain HSTS through `includeSubDomains` could break access.

Also identify wildcard DNS/certificate configuration if present.

If no relevant subdomains exist, record that fact.

Do not recommend `includeSubDomains` merely because no current problem is visible. Consider likely future use and rollback cost.

---

# 6. `includeSubDomains` decision

Produce an explicit recommendation:

```text
KEEP OMITTED
or
SAFE TO CONSIDER/ENABLE
or
BLOCKED PENDING <specific evidence>
```

Evaluate:

- current subdomain inventory;
- TLS coverage;
- Pages/custom-domain architecture;
- likely future subdomains;
- whether any subdomain might legitimately need plain HTTP;
- operational rollback implications;
- whether the security benefit is material for this project today.

A longer `max-age` does **not** require adding `includeSubDomains`.

Treat them as separate decisions.

---

# 7. `preload` decision

Produce an explicit recommendation:

```text
KEEP OMITTED
or
FUTURE CANDIDATE
or
READY FOR SEPARATE PRELOAD REVIEW
```

Do not enable or recommend immediate preload casually.

The audit should account for the stronger and less reversible commitment:

- preload requires a sufficiently long `max-age`;
- preload normally requires `includeSubDomains`;
- browser preload-list removal is not immediate;
- future subdomain HTTPS obligations become more significant.

The current project has deliberately avoided preload so far.

Unless the evidence is unusually strong, prefer treating preload as a **separate future decision after a stable long-duration HSTS period**, rather than coupling it to the next `max-age` increase.

---

# 8. `max-age` progression review

Evaluate the user's remembered staged progression:

```text
86400       = 1 day
2592000     = 30 days
31536000    = 1 year
```

The current deployed policy began at:

```text
86400
```

Assess whether the next safe state should be:

```text
A. remain at 86400
B. increase to 2592000 (30 days)
C. increase to another intermediate value
D. move directly to 31536000 (1 year)
E. another evidence-based recommendation
```

Consider:

- how long the 24-hour policy has been deployed successfully;
- verified production/custom-domain HTTPS stability;
- certificate renewal/Cloudflare management;
- redirect stability;
- deployment rollback model;
- whether the domain is expected to remain HTTPS-only permanently;
- whether any operational issue has occurred since initial HSTS deployment;
- the fact that browsers refresh the expiry whenever they receive the header;
- rollback behavior if a long `max-age` must later be reduced or disabled.

Do not treat the historical 1-day → 1-month → 1-year idea as mandatory.

---

# 9. Rollback analysis

Document the practical rollback implications for each candidate policy.

At minimum explain:

## Current 1-day policy

How quickly an existing client can naturally age out after the header stops being refreshed.

## Candidate 30-day policy

What operational commitment this creates.

## Candidate 1-year policy

What operational commitment this creates and why a certificate/TLS or hosting mistake becomes more consequential.

## Reducing/turning off HSTS

Review the mechanics of:

```text
Strict-Transport-Security: max-age=0
```

and the limitation that an already-HSTS client must still successfully reach the host over HTTPS to receive the disabling header.

Keep this explanation project-specific and concise.

---

# 10. Certificate and HTTPS continuity

Use Cloudflare evidence to assess whether longer HSTS is operationally safe.

Inspect where available:

- Universal SSL / edge certificate status;
- certificate expiry/renewal management;
- custom-domain certificate coverage;
- TLS mode;
- origin requirements relevant to Pages;
- redirect/canonical-host configuration.

Do not expose secrets or private key material in the audit.

The report should answer:

> Is there any current evidence that `starfieldoutposts.com` may need to become HTTP-accessible, or that HTTPS continuity is unreliable enough to argue against increasing `max-age`?

---

# 11. Current guidance comparison

Use current authoritative guidance where useful, prioritizing:

```text
Cloudflare documentation
MDN / standards-oriented browser documentation
hstspreload.org requirements only if preload is being assessed
```

Current browser semantics to verify include:

- HSTS is host-based;
- browsers refresh expiry on each qualifying HTTPS response;
- missing the header does not immediately clear an existing policy;
- `max-age=0` removes the policy after a successful HTTPS response;
- `includeSubDomains` has broader scope;
- preload is a separate, stronger commitment.

Do not turn the report into a general HSTS tutorial.

Focus on implications for this deployment.

---

# 12. Audit outcome

The report must give a concrete outcome.

Preferred outcome structure:

```text
Current state:
    <verified deployed policy>

Recommended next max-age:
    <value or HOLD>

includeSubDomains:
    <KEEP OMITTED / CONSIDER / ENABLE LATER>

preload:
    <KEEP OMITTED / FUTURE REVIEW>

Reason:
    <short evidence-based rationale>

Next review gate:
    <what must happen, or how long stable operation should continue, before the next increase>
```

If recommending a staged progression, state it explicitly.

For example, if supported by evidence:

```text
now:
    30 days, no includeSubDomains, no preload

later:
    after stable operation/review, consider 1 year

preload:
    separate future decision only
```

That is an example, not a required answer.

---

# 13. Durable audit report

Create:

```text
docs/audits/HSTS-POLICY-REVIEW.md
```

or an equally clear repository-consistent name.

The report should contain:

```text
audit date
branch
scope
historical/current policy
repository evidence
Cloudflare configuration evidence
live response evidence
domain/subdomain inventory
includeSubDomains analysis
preload analysis
max-age progression analysis
rollback implications
certificate/HTTPS continuity evidence
recommendation
next review gate
limitations/manual checks
```

This audit should remain useful after the eventual policy change.

Do not make the report depend on temporary numbered task/parcel identifiers.

---

# 14. Current documentation consistency

Because this is read-only:

- do not update `docs/DEPLOYMENT.md`;
- do not update `docs/BACKLOG.md`;
- do not update `public/_headers`.

However, report any stale current-state wording discovered there.

In particular, current `docs/DEPLOYMENT.md` has historically described the 24-hour policy and may still contain old language about staging/production verification being pending even though the rollout was later verified.

If stale wording exists, identify it in the audit and recommend the exact documentation reconciliation for the later implementation/documentation parcel.

Do not silently correct it during this audit.

---

# 15. Cloudflare plugin safety

The connected Cloudflare plugin is authorized for evidence gathering only in this audit.

Use read-only actions.

Do not:

- toggle HSTS;
- change SSL/TLS mode;
- change DNS records;
- create/delete redirects;
- alter certificates;
- modify Pages domains;
- change response-header rules;
- deploy anything.

If a Cloudflare action is potentially mutating, do not call it.

---

# 16. Verification

Because this is a read-only audit:

- no build/test suite is required unless Codex needs one to validate a repository fact;
- run `git diff --check`;
- confirm the only tracked change is the new audit report;
- record all live/Cloudflare checks actually performed;
- distinguish verified facts from inferred recommendations;
- do not claim a Cloudflare/browser check succeeded if access was unavailable.

If the audit uses command-line header probes, record the commands and relevant results.

---

# 17. Stop conditions

Stop and report rather than recommending an HSTS increase if:

- the live production HSTS value cannot be established;
- multiple conflicting HSTS sources are present;
- Cloudflare dashboard and repository policy conflict;
- production HTTPS/certificate health is uncertain;
- an apex-domain subdomain lacks reliable HTTPS and `includeSubDomains` is under consideration;
- redirect/canonical-host behavior is materially inconsistent;
- the domain inventory is incomplete enough to make the recommendation unsafe;
- Cloudflare configuration indicates an unexpected architecture not represented in repository documentation.

A stop condition does not prevent producing the audit; it prevents recommending an irreversible or long-lived policy increase without evidence.

---

# 18. Expected Codex summary

Report:

1. branch used;
2. audit report path;
3. current repository HSTS policy;
4. current live production HSTS policy;
5. whether staging and production agree;
6. whether Cloudflare adds/modifies HSTS outside `_headers`;
7. relevant domain/subdomain inventory;
8. HTTPS/certificate continuity result;
9. recommended next `max-age`;
10. recommendation for `includeSubDomains`;
11. recommendation for `preload`;
12. rollback implications;
13. next review gate;
14. stale durable-document wording found;
15. Cloudflare/plugin/live checks performed;
16. limitations or stop conditions;
17. commands/checks run;
18. suggested commit message for the audit report;
19. confirmation that no Cloudflare/repository setting was changed;
20. confirmation that no commit or push was performed.

Suggested commit message for the audit only:

`docs: audit HSTS policy`
