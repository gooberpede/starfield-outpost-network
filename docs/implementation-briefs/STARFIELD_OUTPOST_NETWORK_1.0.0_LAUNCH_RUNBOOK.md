# Starfield Outpost Network — 1.0.0 Launch Runbook

## Purpose

This runbook governs the deliberate public launch of **Starfield Outpost Network 1.0.0**.

It assumes:

```text
accepted RC: 1.0.0-rc.1
accepted RC commit: 02b62eabdb7b964dc0c2727142d77a0745dd36f1
current release line: staging
production branch: main
canonical production origin: https://starfieldoutposts.com
staging origin: https://staging.starfield-outpost-network.pages.dev
production deployment trigger: manual
staging deployment trigger: automatic on staging pushes
repository: gooberpede/starfield-outpost-network
release tag: v1.0.0
GitHub Release: minimal, draft until production smoke passes
RC tag/release: none
```

The application candidate is frozen. Documentation-only commits after RC acceptance do **not** reopen functional acceptance.

Any new application/source change after this point is a new release candidate and must be revalidated deliberately.

---

# 0. Preconditions

Before starting launch work, verify:

```text
staging is clean and synced
the accepted RC report is committed
the documentation archive implementation is committed
no unexpected tracked changes exist
the repository remains private until the publication step below
production still serves the current known-good pre-1.0 deployment
automatic production deployments remain disabled
```

Capture:

```text
staging HEAD
main HEAD
current production deployment ID / commit
current staging deployment ID / commit
```

Record the current production deployment as the rollback target.

Do not proceed if the current branch/deployment state is unclear.

---

# 1. Prepare the `1.0.0` release commit on `staging`

## 1.1 Version promotion

On `staging`, run:

```sh
npm run version:release
```

Expected transition:

```text
1.0.0-rc.1 -> 1.0.0
```

Expected package metadata changes:

```text
package.json
package-lock.json root version
package-lock.json packages[""].version
```

All must become:

```text
1.0.0
```

## 1.2 Enable production indexing in the same release commit

The current pre-release artifact blocks indexing through:

```text
public/_headers
  X-Robots-Tag: noindex, nofollow

public/robots.txt
  User-agent: *
  Disallow: /
```

For the release commit:

- remove the `X-Robots-Tag: noindex, nofollow` header from `public/_headers`;
- change `public/robots.txt` to allow crawling.

Recommended `robots.txt`:

```text
User-agent: *
Allow: /
```

Do not introduce a sitemap unless one already exists and is deliberately ready for launch.

Do not alter unrelated security headers.

Staging receives this same artifact, but remains protected by Cloudflare Access and therefore is not treated as a public crawler surface.

## 1.3 No other release-content changes

Do not include:

```text
feature work
polish
refactors
dependency upgrades
new documentation cleanup
new accessibility work
new localization work
new reference-data changes
new analytics/telemetry
new HSTS changes
```

The release commit should be limited to:

```text
1.0.0 version promotion
indexing enablement
any strictly necessary release-state wording tied directly to those two changes
```

If anything else appears necessary, stop and review before broadening scope.

---

# 2. Verify and freeze the exact `1.0.0` staging commit

Before commit, review:

```sh
git status --short
git diff --check
git diff
```

Run the full release verification suite:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run localization:terminology:verify
npm run localization:provenance:verify
npm run reference:test
npm run build
npm run lint
git diff --check
```

Verify the built application reports:

```text
Version 1.0.0
```

The pre-commit build may correctly show a modified/local identity.

Commit only after review.

Suggested commit:

```text
release: prepare 1.0.0
```

Push `staging`.

Wait for the automatic staging deployment.

Open staging and verify About shows:

```text
Version 1.0.0
Build <short SHA of the new release commit>
```

with no:

```text
local / modified
local / unverified
```

Verify the deployed staging commit exactly matches `staging` HEAD.

Perform a small staging release check only; do **not** repeat the full RC acceptance matrix because application behavior is unchanged.

At minimum verify:

```text
startup
reload
reference data
About identity
locale switch
one ordinary edit
no obvious console/network failure
robots.txt now permits crawling
X-Robots-Tag noindex is absent from the release artifact
```

Once this exact commit passes, record:

```text
RELEASE_COMMIT=<full SHA>
RELEASE_SHORT=<short SHA>
VERSION=1.0.0
```

From this point, this exact commit is frozen.

Any source/application change creates a new release commit and invalidates the remaining steps until reverified.

---

# 3. Configure and verify `www.starfieldoutposts.com` -> apex

Do this while the current production deployment is still serving the known-good pre-1.0 site.

Desired policy:

```text
canonical origin:
https://starfieldoutposts.com

compatibility hostname:
www.starfieldoutposts.com
```

Configure Cloudflare DNS/custom-domain/redirect behavior so:

```text
http://www.starfieldoutposts.com/*
https://www.starfieldoutposts.com/*
```

permanently redirect to:

```text
https://starfieldoutposts.com/*
```

Preserve:

```text
path
query string
```

Requirements:

```text
www resolves in DNS
TLS certificate covers www
HTTP upgrades/redirects correctly
HTTPS www redirects permanently to apex
no redirect loop
staging is unaffected
bare production pages.dev redirect remains unaffected
```

Verify at least:

```text
http://www.starfieldoutposts.com/
https://www.starfieldoutposts.com/
https://www.starfieldoutposts.com/test-path
https://www.starfieldoutposts.com/?test=1
https://www.starfieldoutposts.com/test-path?test=1
```

Expected final destinations:

```text
https://starfieldoutposts.com/
https://starfieldoutposts.com/test-path
https://starfieldoutposts.com/?test=1
https://starfieldoutposts.com/test-path?test=1
```

If the configuration method requires a temporary deployment-affecting operation, stop and reassess before touching production.

---

# 4. Promote the frozen release commit to `main`

Promote the exact frozen `RELEASE_COMMIT` to `main`.

Preferred method:

```text
fast-forward main to the exact release commit
```

Do not:

```text
squash
rebase
cherry-pick into a different commit
rewrite commit identity
```

The commit deployed to production must remain exactly the commit verified on staging.

Push `main`.

Immediately verify:

```text
main HEAD == RELEASE_COMMIT
staging HEAD == RELEASE_COMMIT
```

Confirm that production did **not** deploy automatically.

If production changed automatically, stop and investigate before continuing.

---

# 5. Make the GitHub repository public

Change repository visibility from private to public.

This is an explicit launch operation.

Immediately verify without authentication:

```text
repository root is accessible
README is accessible
LICENSE is accessible
THIRD-PARTY-NOTICE.md is accessible
package.json is accessible
package-lock.json is accessible
build scripts are accessible
exact RELEASE_COMMIT is accessible
Issues page is accessible
documentation archive ZIPs and ARCHIVE.md indexes are accessible
```

Verify that the exact source URL used by About can now resolve publicly.

Do not proceed to production deployment if the public source corresponding to `RELEASE_COMMIT` is not available unauthenticated.

---

# 6. Create `v1.0.0` and prepare the GitHub Release draft

## 6.1 Annotated tag

Create an annotated tag on the exact frozen release commit:

```text
v1.0.0
```

The tag must point to:

```text
RELEASE_COMMIT
```

Suggested annotation:

```text
Starfield Outpost Network 1.0.0
```

Push the tag.

Verify remotely:

```text
v1.0.0 -> RELEASE_COMMIT
```

Do not create or move an RC tag.

Do not later move `v1.0.0` casually.

## 6.2 Draft GitHub Release

Create a GitHub Release against:

```text
v1.0.0
```

Keep it **draft/unpublished** until production smoke passes.

Suggested title:

```text
Starfield Outpost Network 1.0.0
```

Keep notes concise.

Recommended content:

```text
First public release of Starfield Outpost Network.

Highlights:
- local browser-based outpost network tracking
- multiple networks and outposts
- System / Body / Biome tracking
- inorganic and organic production
- manufacturing and Planned Supply
- regular and interstellar Cargo Links
- Undo/Redo
- validation and Search
- import/export
- ten runtime locales

Website:
https://starfieldoutposts.com

Source:
this tagged release

Support:
GitHub Issues or support@starfieldoutposts.com

Known scope:
desktop-oriented; Apple/macOS/iPad/VoiceOver coverage is limited;
the known Narrator static About-body reading limitation remains deferred.
```

Do not attach a custom production ZIP or built `dist` artifact.

GitHub's automatic source archives are sufficient.

Do not publish the Release yet.

---

# 7. Manually deploy the exact tagged commit to production

Deploy:

```text
RELEASE_COMMIT
```

to the Cloudflare Pages production environment.

Do not deploy:

```text
a later main commit
an uncommitted workspace
a branch tip that no longer equals RELEASE_COMMIT
```

Verify Cloudflare reports a successful production deployment for the exact intended commit.

Record:

```text
production deployment ID
production commit
deployment timestamp
previous production deployment ID
previous production commit
```

The previous deployment remains the rollback target until launch smoke completes.

---

# 8. Run the finite production launch smoke

Run against:

```text
https://starfieldoutposts.com
```

Use disposable/synthetic data where edits are required.

## 8.1 Identity

About must show:

```text
Version 1.0.0
Build <RELEASE_SHORT>
```

No modified/unverified marker.

The exact-source link must resolve publicly to `RELEASE_COMMIT`.

## 8.2 Startup/reference data

Verify:

```text
initial load
reload
reference data loads
no fatal startup state
required reference requests succeed
missing /reference-data/... path behaves according to deployed 404 contract
unrelated SPA route still loads the application shell
```

## 8.3 Ordinary state/persistence

Perform a small synthetic edit:

```text
create/rename an outpost or network
select a System/Body
reload
confirm persistence
```

Do not replace valuable existing production data.

## 8.4 Locale

Switch to at least one non-English locale and verify:

```text
UI changes
reference names render
reload preserves explicit locale
```

Return to preferred locale afterward if desired.

## 8.5 Import/export smoke

Using disposable synthetic state:

```text
export
confirm JSON download
import that JSON into disposable production state
confirm expected restoration
reload
confirm persistence
```

Do not use personal data if unnecessary.

## 8.6 About/support/legal links

Verify destinations without causing side effects:

```text
repository
exact build source
GitHub Issues
support email
Ko-Fi
Flaticon attribution
licence
third-party notice
```

Do not submit an issue, send mail, or make a payment.

Verify deployed legal routes are readable.

## 8.7 Indexing

Verify production no longer serves:

```text
X-Robots-Tag: noindex, nofollow
```

Verify:

```text
https://starfieldoutposts.com/robots.txt
```

allows crawling.

Confirm staging remains protected through Cloudflare Access.

Do not attempt to force immediate search-engine indexing; merely confirm the site no longer blocks it.

## 8.8 Security headers

Verify the expected production security posture remains intact:

```text
CSP
Permissions-Policy
X-Frame-Options
Strict-Transport-Security: max-age=2592000
other existing Cloudflare/default headers as applicable
```

Do not change HSTS during launch.

## 8.9 Canonical host behavior

Verify:

```text
https://starfieldoutposts.com
http://starfieldoutposts.com
https://www.starfieldoutposts.com
http://www.starfieldoutposts.com
bare production pages.dev hostname
```

all converge appropriately on:

```text
https://starfieldoutposts.com
```

Preserve path/query behavior for `www` and the bare production Pages hostname.

## 8.10 Console/network

During representative use, check for:

```text
uncaught exceptions
required asset 404s
functional CSP violations
request loops
unexpected reference failures
```

Distinguish deliberate missing-path probes from actual application failures.

---

# 9. Publish the GitHub Release

Only after the production smoke is fully healthy:

1. reopen the prepared draft Release;
2. verify it still targets `v1.0.0`;
3. verify `v1.0.0` still points to `RELEASE_COMMIT`;
4. verify production About still reports `1.0.0` / `RELEASE_SHORT`;
5. publish the GitHub Release.

Do not add custom binaries at this stage.

After publication, verify:

```text
release page is public
tag is public
automatic source archives are available
release notes show the intended website/support/source information
```

This publication is the public announcement point for the 1.0 GitHub release.

---

# 10. Record launch identity and rollback point

Create or update the durable launch record in the appropriate release/deployment documentation.

Record:

```text
version: 1.0.0
release commit: RELEASE_COMMIT
tag: v1.0.0
GitHub Release URL
production deployment ID
production deployment timestamp
previous known-good production deployment ID/commit
canonical origin
www redirect verification
repository public verification
indexing verification
production smoke result
```

Keep the record factual and concise.

Do not rewrite historical RC acceptance evidence.

---

# Rollback procedure

If any release-blocking production defect appears during step 8:

## Immediate action

Redeploy the previously recorded known-good production deployment/commit.

Verify:

```text
starfieldoutposts.com returns to the previous build
startup succeeds
reference data succeeds
```

If the previous deployment was non-indexed, verify its indexing behavior is restored with that artifact.

## GitHub Release

Leave the GitHub Release as:

```text
draft / unpublished
```

Do not announce the failed production candidate.

## Tag handling

Do **not** move or delete `v1.0.0` impulsively.

Stop and decide deliberately.

Preferred principle:

```text
published/referenced tags are immutable release identities
```

If the release has not been publicly announced and a tag correction is genuinely required, decide explicitly before changing it.

Otherwise fix forward with a new release version, normally:

```text
1.0.1
v1.0.1
```

depending on the defect and release state.

## Source fix

Any code fix must:

```text
return to staging
be versioned appropriately
receive relevant verification
receive staging acceptance
produce a new frozen release commit
```

Do not patch production directly.

---

# Release blockers

Stop launch for concrete issues such as:

```text
wrong version/build identity
source repository/exact commit inaccessible publicly
startup/reference-data failure
normal-use data loss
export/import failure
broken essential controls
production commit mismatch
TLS failure on canonical or www host
redirect loop
serious CSP/security-header regression
unexpected automatic production deployment behavior
repository publication exposing an unreviewed unexpected artifact
```

Do not stop launch merely for accepted known limitations already recorded in RC acceptance.

---

# Accepted non-blocking limitations

Retain the accepted release boundary:

```text
Narrator static About-body reading limitation remains deferred
no comprehensive macOS/iPad/VoiceOver certification
desktop-oriented product; not phone-optimized
native-language editorial perfection not guaranteed
reference-overlay on-demand work remains post-release
Help biome wording polish remains backlog
narrow native cargo drag-edge activation remains accepted
```

Do not reopen these during launch unless new evidence demonstrates a materially worse failure.

---

# Launch completion criteria

The 1.0 launch is complete only when all are true:

```text
staging and main both identify the frozen 1.0.0 commit
repository is public
exact source commit is publicly accessible
Issues is public
v1.0.0 points to the exact release commit
GitHub Release is published
production serves the exact release commit
About shows Version 1.0.0 + exact short build
www permanently redirects to apex with path/query preservation
bare production pages.dev redirects to apex
production indexing blocks are removed
staging remains protected
security headers remain correct
production smoke passes
rollback target is recorded
launch identity is documented
```

---

# Suggested operational log format

Use a short log while executing:

```text
[time] Step 1 — PASS — 1.0.0 release commit prepared
[time] Step 2 — PASS — staging serves <SHA>
[time] Step 3 — PASS — www redirects to apex
[time] Step 4 — PASS — main fast-forwarded to <SHA>
[time] Step 5 — PASS — repository public / exact source accessible
[time] Step 6 — PASS — v1.0.0 created / Release draft prepared
[time] Step 7 — PASS — production deployment <ID> serves <SHA>
[time] Step 8 — PASS — production smoke
[time] Step 9 — PASS — GitHub Release published
[time] Step 10 — PASS — launch identity + rollback recorded
```

If any step fails:

```text
STOP
record evidence
execute rollback if production was changed
do not continue to later launch steps
```
