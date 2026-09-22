# CODEX IMPLEMENTATION BRIEF — HSTS 30-Day Rollout

## Objective

Implement the approved next HSTS rollout state for Starfield Outpost Network:

```text
Strict-Transport-Security: max-age=2592000
```

That is a **30-day HSTS policy**.

This is a narrow deployment/security-hardening parcel based on the completed read-only HSTS audit.

Do not change:

```text
includeSubDomains
preload
Cloudflare dashboard HSTS
SSL/TLS mode
DNS
redirect architecture
application code
localization
accessibility
layout
runtime behavior
```

The repository header remains the intended single HSTS source.

---

# 1. Source of truth

Use the committed audit:

```text
docs/audits/HSTS-POLICY-REVIEW.md
```

as the primary evidence for this rollout.

That audit established:

```text
current repository/live policy:
    Strict-Transport-Security: max-age=86400

recommended next policy:
    Strict-Transport-Security: max-age=2592000

includeSubDomains:
    keep omitted

preload:
    keep omitted

next review gate:
    after at least 30 continuous days on the 30-day policy
```

Do not reopen the policy decision unless current repository/deployment evidence now materially contradicts the audit.

---

# 2. Required header change

Update:

```text
public/_headers
```

Change only the HSTS max-age:

```text
FROM:
Strict-Transport-Security: max-age=86400

TO:
Strict-Transport-Security: max-age=2592000
```

Do not add:

```text
includeSubDomains
preload
```

Do not alter unrelated security headers.

Preserve the existing site-wide response-header structure.

---

# 3. Cloudflare control-plane boundary

Do **not** enable HSTS in the Cloudflare dashboard.

The audit established that:

- Cloudflare dashboard HSTS is disabled;
- no response-header Transform Rule adds HSTS;
- the repository `_headers` file is the intended active HSTS source.

Preserve that architecture.

Do not create a second HSTS source.

---

# 4. Deployment documentation corrections

Update:

```text
docs/DEPLOYMENT.md
```

The document currently contains stale current-state wording.

Correct at minimum:

## 4.1 Initial HSTS verification

Replace wording that says staging/production HSTS verification remains pending.

The current durable state is:

- the initial 24-hour HSTS rollout was verified;
- staging and production/custom-domain rollout was completed;
- the policy is now being advanced to 30 days.

After this parcel is implemented but **before deployed verification**, phrase the 30-day state carefully:

- repository policy changed to 30 days;
- deployed 30-day verification still pending until staging/production checks are actually completed.

Do not claim deployment verification before it occurs.

---

## 4.2 Cloudflare Access wording

Correct stale wording that says Cloudflare Access / Zero Trust is unused.

Current boundary:

- preview/versioned `*.starfield-outpost-network.pages.dev` hosts are protected by Cloudflare Access;
- the bare production `starfield-outpost-network.pages.dev` hostname remains public and redirects to the custom production domain;
- the custom production domain is public;
- non-indexing is crawler guidance, not access control.

Keep this concise and operationally accurate.

---

## 4.3 HSTS next-review gate

Document the next review condition:

> Re-review HSTS only after the 30-day policy has been continuously deployed for at least 30 days.

That future review should re-check:

```text
production HSTS response
staging HSTS response
DNS/subdomain inventory
certificate state
HTTP→HTTPS redirects
possible competing HSTS sources
```

If still healthy, the next candidate may be:

```text
max-age=31536000
```

but do not pre-approve the one-year move in this parcel.

---

# 5. Backlog reconciliation

Update:

```text
docs/BACKLOG.md
```

only as needed to reflect the new current HSTS rollout state.

The backlog should record that:

- the 24-hour rollout is complete;
- the 30-day rollout is now the active approved policy;
- the next HSTS review is deferred until at least 30 continuous days after the 30-day policy is deployed and verified;
- `includeSubDomains` remains intentionally omitted;
- `preload` remains intentionally omitted and is a separate future decision.

Do not add a duplicate HSTS item if one already exists.

Do not leak temporary numbered planning identifiers into durable backlog wording.

---

# 6. Historical documents

Do not rewrite point-in-time historical audit/benchmark documents merely because the current policy has advanced.

In particular, older reports that accurately record earlier states should remain historical snapshots.

Only current-state documentation should be reconciled.

---

# 7. Local verification before deployment

Before handoff, verify:

```text
public/_headers
docs/DEPLOYMENT.md
docs/BACKLOG.md
```

are internally consistent.

Run at minimum:

```text
git diff --check
```

Also inspect the rendered/produced header file path as needed to confirm the committed static Pages header remains syntactically valid.

No application test suite is required solely for this header/docs change unless Codex changes runtime code unexpectedly.

If code changes occur unexpectedly, stop and explain why.

---

# 8. Staging verification plan

Do not change Cloudflare settings.

After the user commits and syncs this parcel to `staging`, the automatic staging deployment should occur.

The expected staging verification is:

```text
Strict-Transport-Security: max-age=2592000
```

with no:

```text
includeSubDomains
preload
```

Because Cloudflare Access protects staging/preview hosts, Codex may use the connected Cloudflare plugin or other authorized read-only Cloudflare evidence to inspect the deployed application response if available.

If current post-auth staging response cannot be inspected automatically, report that limitation and provide the user with the exact manual verification needed.

Do not weaken or bypass Cloudflare Access.

---

# 9. Production promotion boundary

This Codex parcel does **not** perform production deployment.

The project deployment model remains:

```text
staging branch
→ automatic staging deployment
→ verify

then

promote accepted commit to main
→ push main
→ manually deploy production
→ verify production
```

Do not:

- merge/promote branches;
- push;
- trigger production deployment;
- change Cloudflare dashboard settings.

Those actions remain under user control unless explicitly requested later.

---

# 10. Manual verification instructions for the user

If manual Cloudflare/UI verification is needed, do not assume the user is familiar with the Cloudflare interface.

Provide step-by-step instructions with:

```text
where to click
what page/section to open
what exact value to look for
what result counts as pass/fail
what not to change
```

Keep each instruction sequence narrow and safe.

Do not ask the user to toggle HSTS in the Cloudflare dashboard.

The intended verification is observational, not configurational.

---

# 11. Production verification criteria

After later production deployment, the intended pass criteria are:

## HTTPS custom domain

```text
https://starfieldoutposts.com/
```

must return exactly one:

```text
Strict-Transport-Security: max-age=2592000
```

with neither:

```text
includeSubDomains
preload
```

## HTTP apex

```text
http://starfieldoutposts.com/
```

must continue redirecting to HTTPS.

## Security headers

Existing CSP and other security headers should remain intact.

## Application health

The production shell should continue to load normally.

No broader regression testing is implied by this small security-header change.

---

# 12. Rollback note

Document or preserve the operational rollback understanding:

- 30-day HSTS is a stronger commitment than 24 hours;
- a client may enforce HTTPS for up to 30 days after its last qualifying response;
- removing the header does not immediately clear client state;
- `max-age=0` clears HSTS only after the client successfully reaches the host over valid HTTPS.

Do not add `max-age=0` anywhere in this rollout.

This is rollback knowledge only.

---

# 13. Scope discipline

This parcel should not include:

```text
includeSubDomains
preload
Cloudflare dashboard HSTS
response-header Transform Rules
Always Use HTTPS changes
DNS changes
certificate changes
redirect changes
Cloudflare Access changes
CSP changes
Google Fonts changes
analytics/RUM changes
application code changes
fixed-chrome UI work
localization work
```

If any of those appear necessary, stop and report the conflict.

---

# 14. Expected files

Expected tracked changes should normally be limited to:

```text
public/_headers
docs/DEPLOYMENT.md
docs/BACKLOG.md
```

If another current-state deployment/security document genuinely requires reconciliation, explain why before modifying it.

Do not alter the committed HSTS audit except to correct a factual error discovered during implementation.

---

# 15. Verification

Run:

```text
git diff --check
```

Confirm:

- exact HSTS header is now `max-age=2592000`;
- `includeSubDomains` is absent;
- `preload` is absent;
- no duplicate HSTS declaration exists;
- stale Access wording is corrected;
- stale verification-pending wording is corrected appropriately;
- next review gate is documented;
- no Cloudflare setting was changed;
- no runtime/application code changed;
- no temporary numbered planning identifiers leaked into durable docs.

---

# 16. Stop conditions

Stop and report if:

- `public/_headers` no longer appears to be the active production source;
- current repository state conflicts with the committed HSTS audit;
- another HSTS source has been introduced since the audit;
- the 30-day policy cannot be represented cleanly through the existing Pages header mechanism;
- documentation indicates a materially different deployment architecture;
- implementing the change appears to require a Cloudflare dashboard HSTS toggle;
- unrelated security configuration must change.

Do not improvise around these conditions.

---

# 17. Expected Codex summary

Report:

1. branch used;
2. files modified;
3. exact HSTS value changed from/to;
4. confirmation `includeSubDomains` remains omitted;
5. confirmation `preload` remains omitted;
6. confirmation no Cloudflare dashboard HSTS setting was changed;
7. deployment-document corrections made;
8. Access wording correction made;
9. backlog/review-gate reconciliation;
10. checks run and results;
11. whether staging verification can be performed automatically after sync;
12. any manual verification the user will need, with clear step-by-step guidance;
13. suggested commit message;
14. confirmation no commit/push/deploy was performed.

Suggested commit message:

`security: extend HSTS to 30 days`
