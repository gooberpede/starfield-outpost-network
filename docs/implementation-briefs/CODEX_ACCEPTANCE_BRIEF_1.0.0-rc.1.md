# CODEX ACCEPTANCE BRIEF — `1.0.0-rc.1`

## Objective

Perform the finite release-candidate acceptance pass for the frozen staging candidate:

```text
Application version: 1.0.0-rc.1
Git commit: 02b62eabdb7b964dc0c2727142d77a0745dd36f1
Short build ID: 02b62eab
Staging origin: https://staging.starfield-outpost-network.pages.dev/
```

This is an **acceptance exercise**, not an implementation task.

The goal is to determine whether this exact candidate is acceptable to promote toward `1.0.0`.

Do not make product changes while running the acceptance pass.

If a genuine release defect is found:

1. record it clearly;
2. classify its severity and affected workflow;
3. stop the affected acceptance area;
4. do not fix it inside this task.

Any source change after this frozen candidate must be treated as a new candidate and retested accordingly.

---

## 1. Read first

Read:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/DEPLOYMENT.md
docs/UX-DESIGN.md
docs/DOMAIN-RULES.md
docs/audits/RELEASE-READINESS-REVIEW.md
docs/audits/RELEASE-PREPARATION-VERIFICATION.md
README.md
```

Use the current committed repository as the source of truth.

Historical audit findings remain evidence, not permission to reopen already-settled polish.

Do not modify the supplied acceptance brief.

---

## 2. Candidate identity gate

Before functional acceptance, confirm all three agree on the frozen candidate:

```text
staging branch HEAD
deployed staging About dialog
local checkout HEAD
```

Expected:

```text
version: 1.0.0-rc.1
commit: 02b62eabdb7b964dc0c2727142d77a0745dd36f1
```

The deployed About dialog should show:

```text
Version 1.0.0-rc.1
Build 02b62eab
```

and should not show:

```text
local / modified
local / unverified
```

If staging is serving another commit or version, stop. Do not continue acceptance against a moving or mismatched target.

---

## 3. Freeze rule

During this acceptance pass:

```text
no source edits
no CSS edits
no localization edits
no reference-data regeneration
no dependency updates
no version changes
no commits
no pushes
no tags
no GitHub Releases
no production deploy
no DNS changes
no indexing changes
no repository visibility changes
```

The only intended repository change is the acceptance report itself, if created locally after testing.

Do not commit that report.

---

## 4. Browser-data isolation

Perform testing in disposable browser data.

Do not clear or overwrite the maintainer's ordinary production data.

Preferred approaches:

```text
separate browser profile
private/incognito profile if persistence checks can still be performed within one session
dedicated disposable browser profile for the staging origin
```

Record which method was used.

For persistence, import/export, Undo/Redo and reload tests, use synthetic test data only.

Do not use real personal networks unless the maintainer explicitly supplies a disposable copy.

---

# ACCEPTANCE MATRIX

## 5. A — Clean startup and locale persistence

### Test

Starting with no staging-origin application data:

1. load staging;
2. confirm the app starts normally;
3. confirm an empty/default collection state is usable;
4. inspect About and confirm exact RC identity;
5. switch from Automatic/default locale to at least one explicit non-English locale;
6. reload;
7. confirm the explicit locale persists;
8. restore a known locale as needed for later testing.

### Required result

```text
PASS:
startup succeeds
no fatal reference-data state
no console-level startup blocker
locale changes correctly
explicit locale survives reload
About identity remains exact RC candidate
```

Record the locales used.

---

## 6. B — Ordinary outpost recording

Create a synthetic network containing at least two outposts.

Exercise:

```text
network creation
outpost creation
outpost rename
System selection
Body selection
Biome selection
outpost ordering/reordering
character level
relevant outpost skill ranks
```

Use at least one known valid body with useful resource/biome data.

Confirm:

```text
System/Body compact placeholders are correct before selection
selected values remain readable
new 11rem desktop select geometry behaves normally
Biome controls have no new overlap/clipping
Solar/Wind indicators remain intact
```

### Required result

Ordinary editing works without unexpected validation damage, lost fields, layout breakage or inaccessible controls.

---

## 7. C — Inorganic production

On one synthetic outpost:

1. choose a body/biome with known inorganic resources;
2. record one or more valid inorganic resources;
3. activate production for at least one valid inorganic resource;
4. confirm Matrix/presence/production representation;
5. deliberately attempt or import one incompatible active-production state only if a safe existing UI path exists;
6. confirm validation explains it rather than silently repairing/deleting user data.

### Required result

Biome-sensitive inorganic behavior remains correct.

Do not treat atmospheric/body-wide resource behavior as ordinary biome-local behavior if the current domain model distinguishes it.

---

## 8. D — Organic planetary farming

This is a targeted regression check for the recent farming correction.

Use a body with known domesticable organic producers.

Required checks:

1. select a biome where a farmable species does **not** naturally occur;
2. confirm the species/resource can still be selected for farming if the species belongs to that planet/body and is domesticable;
3. confirm a wild-only/non-domesticable species remains unavailable;
4. confirm exact producer identity is preserved where multiple species can produce the same resource.

Recommended known examples from accepted implementation evidence may include:

```text
Feynman III
Ternion III
```

Use current reference data rather than hard-coding stale expectations.

### Required result

Organic farming is planet/body-level and independent of selected biome.

Natural occurrence must not incorrectly gate farming.

---

## 9. E — Manufacturing and Planned Supply

Configure at least one manufactured product.

Exercise:

```text
manufacturing with satisfied inputs
manufacturing with missing inputs
Planned Supply for a missing prerequisite
multi-step local manufacturing if practical
automatic Planned Supply retirement when a real source appears
Undo restoring the retired Planned Supply entry
```

### Required result

Confirm the distinction remains:

```text
Actual Availability != Planned Supply
Selectable Supply = Actual Availability ∪ Planned Supply
```

Missing manufacturing inputs should be diagnosed, not destructively repaired.

---

## 10. F — Cargo Links

Create at least two outposts and enough pads to exercise both normal editing and derived supply.

At minimum:

1. add cargo pads;
2. create a compatible cargo link;
3. configure outbound cargo at one endpoint;
4. confirm inbound availability at the other endpoint;
5. configure outbound cargo on the reverse endpoint if useful;
6. confirm links remain bidirectional domain relationships with direction determined by each pad's outbound selections;
7. unlink and confirm outbound selections are preserved;
8. re-link where appropriate.

Also exercise:

```text
expanded Cargo cards
scrolling within Cargo Links
drag reshuffle
drag-edge autoscroll if practical
```

### Required result

No recurrence of the prior vertical-geometry defect:

```text
expanded list remains usable
Status Bar is not covered
sticky behavior remains stable
no large blank snap/gap appears
```

Narrow native drag-edge activation is accepted unless a new concrete failure is observed.

---

## 11. G — Cargo remove / Undo / Redo context

With multiple Cargo cards expanded:

1. remove one pad/card;
2. Undo;
3. Redo;
4. Undo again.

Confirm:

```text
the restored card reappears expanded
unrelated expanded cards remain expanded
context remains on the expected network/outpost
```

Also perform a normal non-Cargo Undo/Redo action after navigating to another outpost and confirm history restores the operation's intended Network + Outpost context.

---

## 12. H — Validation and focus

Create at least one deliberate ordinary advisory/warning, for example:

```text
duplicate outpost name
missing manufacturing input
cross-system regular cargo condition
or another safe validation state
```

Exercise:

```text
open Validation
inspect issue
navigate from issue to affected outpost
keyboard-only traversal
focus return after closing dialogs
```

Spot-check:

```text
Search
Context Help
About
Validation
```

Confirm fixed header/status bar do not obscure focused controls.

### Required result

Validation explains problems without destroying recorded state.

Keyboard focus remains visible and restored appropriately.

---

## 13. I — Persistence

With a non-trivial synthetic collection containing:

```text
at least two outposts
selected System/Body/Biomes
production
manufacturing
Planned Supply
cargo endpoints
outbound items
```

reload staging.

Compare before/after:

```text
network order
outpost order
stable IDs where inspectable
active network
System/Body selections
Biome selections
production
manufacturing
Planned Supply
cargo endpoints
outbound items
locale preference
```

History/Undo stack and transient UI expansion state need not persist unless current design explicitly says otherwise.

### Required result

Persisted domain state survives reload without mutation or loss.

---

## 14. J — Successful export/import round-trip

Using synthetic data only:

1. export the current collection;
2. retain the exported JSON file;
3. create a clean/disposable import context;
4. import the file;
5. inspect the restored collection;
6. re-export;
7. compare the parsed persisted data, not presentation order of JSON properties or filenames.

The fixture should include where practical:

```text
two networks
cargo link endpoints
outbound items
manufacturing
Planned Supply
unknown/stale reference IDs only if deliberately safe and already supported
```

### Required result

The ordinary exported collection can be re-imported successfully with equivalent persisted domain data.

Do not expect transient UI/history state to round-trip unless it is part of the documented format.

---

## 15. K — Failed import must not mutate current state

Prepare a non-trivial disposable current collection with:

```text
known selected outpost
known active network
at least one Undo entry
known stored bytes/state if inspectable
```

Test failed imports using existing safe fixtures or locally created synthetic files for at least:

```text
malformed JSON
duplicate IDs
over-envelope input
```

After each failure, confirm:

```text
error is surfaced
collection unchanged
active network unchanged
selected outpost unchanged
Undo/Redo history unchanged where current implementation promises this
stored application data unchanged
```

### Required result

Import failure is atomic with respect to current application state.

---

## 16. L — Existing-save upgrade/compatibility

Use a **copy** of a representative pre-RC save/export if one is available.

Do not test against the maintainer's only copy.

Import/open the copy in disposable staging data.

Verify:

```text
normalization/migration succeeds
network/outpost data preserved
IDs preserved
cargo links preserved
production/manufacturing/planning preserved
export still succeeds
re-import of the resulting export succeeds
```

If no suitable prior save/export is available, record:

```text
NOT RUN — no representative disposable prior save supplied
```

Do not invent evidence.

This item may remain a documented evidence gap if no safe fixture exists.

---

## 17. M — Search

Exercise the global Search feature with:

```text
exact localized name
prefix
substring
abbreviation
canonical English alias while a non-English locale is active
```

Confirm:

```text
deterministic result presentation
localized result labels
submitted item remains fixed
results update if the network changes while Search remains open
count wording is correct
```

Spot-check both found and not-found cases.

---

## 18. N — Localization spot-check

Do not rerun a broad editorial audit.

Use a targeted release check.

At minimum inspect:

```text
en-US
de-DE or es-ES
ja-JP
zh-Hans
```

At 1366px/100% where practical, inspect:

```text
navigation
Outpost Details
compact System/Body placeholders
Solar/Wind headings
Biome controls
Cargo Links
Resource Matrix
Planned Supply
Validation
Search
About
```

Confirm no obvious English leakage outside intentional invariants/branding/reference fallbacks.

The recent System/Body placeholder change should be specifically verified in at least:

```text
English
French
German
Japanese
Simplified Chinese
Spanish
```

because those locales exercised materially different lengths/scripts in the geometry review.

---

## 19. O — 100% and true 200% zoom

Use the maintainer's actual browser for this test if automation cannot control browser zoom.

At 100% and true 200% browser zoom, spot-check:

```text
About
System/Body controls
Biome controls
Cargo Links
Resource Matrix
Search
fixed header/status bar focus visibility
```

At true 200% specifically verify:

```text
no essential control becomes inaccessible
local scrolling works where intended
focus remains visible
About links and both Close controls remain reachable
System/Body placeholders and normal selected values remain readable
```

A viewport/DPR proxy does **not** count as true 200% evidence.

If Codex cannot perform true zoom, mark this item:

```text
OWNER MANUAL CHECK REQUIRED
```

rather than converting a proxy into a PASS.

---

## 20. P — Windows High Contrast / forced colors

If real Windows High Contrast is available to the maintainer, spot-check:

```text
focus outlines
links
buttons
select controls
About
Search
Validation
```

If unavailable in Codex's environment, record:

```text
OWNER MANUAL CHECK REQUIRED
```

Do not substitute source inspection for an actual High Contrast PASS.

---

## 21. Q — About / Narrator known limitation

Do not reopen the deferred Narrator investigation in this RC acceptance pass.

Known state:

```text
About title and interactive controls can be announced
ordinary static body paragraphs were not read reliably in prior manual Narrator testing
broader Narrator follow-up is deferred/post-release
```

Acceptance action:

```text
confirm no regression in keyboard access, visual content, links, Close controls and focus behavior
retain Narrator static-body limitation as known deferred evidence
```

Do not mark Narrator fully passed.

Do not implement a new ARIA strategy.

---

## 22. R — Apple / Safari evidence

Do not make Apple/WebKit hardware testing a release blocker.

Current accepted evidence boundary:

```text
earlier real iPhone 12 Safari smoke passed basic load, outpost/cargo workflows,
locale switching and touch interaction
no current macOS/iPad hardware is available
no current VoiceOver certification
```

Record:

```text
NOT RE-RUN — hardware unavailable; prior bounded iPhone evidence retained
```

Do not use Playwright WebKit as a substitute unless separately authorized.

Do not backlog Playwright WebKit solely because this pass lacks Apple hardware.

---

## 23. S — Reference-data startup and cache behavior

On staging:

1. reload normally;
2. confirm required reference data loads;
3. verify normal manifest/reference requests use expected cache/revalidation behavior where practical;
4. invoke the existing Retry path if there is a safe way to simulate/block then restore a required asset;
5. confirm Retry succeeds and app recovers.

Retain the implemented contract:

```text
normal manifest: no-cache/revalidation behavior
normal assets: default browser cache behavior
Retry: stronger reload behavior for all required reference fetches
```

Do not alter headers or cache implementation during acceptance.

If destructive/intercept testing is impractical in the available browser, use existing automated evidence plus a basic staging startup/reload observation and mark the stronger browser interception step as not repeated.

---

## 24. T — Missing reference-data / nested route behavior

Where safe against staging, verify:

```text
a deliberately missing reference-data JSON path returns 404
an unrelated unknown SPA path behaves according to the current deployment contract
```

Do not alter deployed files.

Record actual status behavior.

This is a deployment-boundary check, not an application implementation task.

---

## 25. U — About links and public-facing destinations

From staging, inspect but do not perform side effects.

Confirm link destinations for:

```text
source repository
GitHub Issues
support email
Ko-Fi
licence
third-party notice / legal routes where exposed
Flaticon attribution if present
```

Do not:

```text
open a real issue
send an email
make a payment
start a membership
```

The repository may still be private at this stage; that is expected.

Public unauthenticated repository availability is a **launch gate**, not an RC-staging requirement.

---

## 26. V — Legal/static output smoke

On the built/staging candidate, verify the intended legal/static routes are present and readable, including the emitted:

```text
LICENSE
THIRD-PARTY-NOTICE
```

or their deployed paths as defined by current release tooling.

Confirm:

```text
content served as intended
no application startup dependency on fetching these files
```

Do not perform a new legal audit.

---

## 27. W — No unexpected console/network failures

During representative staging use, inspect for:

```text
uncaught exceptions
failed required reference requests
CSP violations affecting functionality
unexpected 404s for required assets
repeated network request loops
```

Expected benign browser/devtool noise should be distinguished from application failures.

Record only meaningful findings.

---

# RELEASE-CANDIDATE ACCEPTANCE CLASSIFICATION

## 28. Result classes

Classify each matrix item as exactly one of:

```text
PASS
FAIL — RELEASE BLOCKER
FAIL — NON-BLOCKING KNOWN/DEFERRED
OWNER MANUAL CHECK REQUIRED
NOT RUN — JUSTIFIED
NOT APPLICABLE
```

Do not collapse unavailable evidence into PASS.

---

## 29. Release-blocker standard

Treat as release-blocking if the candidate demonstrates a concrete issue such as:

```text
startup failure
normal-use data loss
ordinary export cannot re-import
failed import mutates current data
reference integrity/startup failure
broken essential input/control
unusable core keyboard path
wrong deployed version/commit
severe persistence corruption
ordinary production/cargo/manufacturing behavior materially incorrect
```

Do not promote minor aesthetic preferences or already accepted deferred limitations into blockers without new evidence.

---

## 30. Existing accepted limitations

Unless new evidence materially worsens them, retain rather than reopen:

```text
Apple/macOS/iPad/VoiceOver coverage unavailable
Narrator static About-body reading deferred
desktop-oriented/mobile-not-optimized product scope
native-language editorial perfection not guaranteed
large-bundle optimization not required for 1.0
on-demand reference overlay remains post-release
narrow native drag autoscroll activation zone accepted
Help biome wording polish deferred
```

Any historical item that has since been fixed should not be reintroduced as an active defect.

---

## 31. `www` hostname is not part of RC acceptance

The newly identified launch item:

```text
www.starfieldoutposts.com
```

currently needs launch configuration so it resolves and permanently redirects to the canonical apex:

```text
https://starfieldoutposts.com
```

That is a later launch-operation task.

Do not change DNS/Cloudflare in this RC acceptance pass.

Record it under:

```text
PENDING LAUNCH OPERATION — not an RC application defect
```

Later verification must cover HTTP/HTTPS, path/query preservation, TLS and canonical indexing behavior.

---

## 32. Production is not the RC target

Do not acceptance-test the current production deployment as though it were the RC.

The frozen RC target is staging.

Production smoke comes only after the exact accepted release commit is deliberately deployed later.

Do not change production in this task.

---

## 33. Acceptance report

Create:

```text
docs/audits/RELEASE-CANDIDATE-1.0.0-RC.1-ACCEPTANCE.md
```

The report should include:

### Candidate identity

```text
version
full commit
short build
staging origin
test date
browser/OS used
browser-data isolation method
```

### Matrix

Use a compact table:

```text
ID
Area
Result
Evidence
Notes / limitation
```

### Manual-owner items

Separate clearly:

```text
true 200% zoom
Windows High Contrast
any other check Codex could not perform directly
```

### Known/deferred evidence

Keep:

```text
Narrator static About-body limitation
Apple/WebKit hardware gap
www hostname pending launch operation
```

### Blockers

A dedicated section:

```text
Release blockers found: NONE
```

or list each actual blocker with reproduction steps.

### Final disposition

Use exactly one:

```text
RC-A — accepted for promotion toward 1.0.0
RC-B — acceptance pending finite owner manual checks
RC-C — release blocker found; candidate rejected
RC-D — candidate identity/deployment mismatch; acceptance invalid
```

If all Codex-executable checks pass but true 200% / High Contrast remain for the maintainer, use:

```text
RC-B
```

until those finite owner checks are supplied.

Do not call the RC accepted merely because automated checks pass.

---

## 34. Repository verification

Because this is an acceptance/report task:

```sh
git diff --check
git status --short
```

Expected tracked application state:

```text
clean
```

Expected new work may be only:

```text
docs/audits/RELEASE-CANDIDATE-1.0.0-RC.1-ACCEPTANCE.md
```

plus the supplied brief if it is deliberately retained untracked.

Do not modify application/source files.

Do not run version commands.

---

## 35. Completion summary

Report:

1. exact candidate version/commit;
2. staging identity result;
3. browser/OS and isolation method;
4. PASS count;
5. blocker count;
6. owner-manual-check count;
7. any justified NOT RUN items;
8. persistence result;
9. export/import result;
10. failed-import atomicity result;
11. organic farming regression result;
12. Cargo/Undo result;
13. localization/geometry result;
14. staging reference/deployment-boundary result;
15. known/deferred limitations retained;
16. `www` hostname recorded as pending launch operation;
17. final RC-A/B/C/D disposition;
18. confirmation no code/version/tag/push/deploy/DNS/indexing/publication action occurred.

No commit message is suggested for the RC itself: the candidate is already frozen.

If the maintainer later chooses to commit the acceptance report, use a documentation-only commit separately from the accepted application candidate.
