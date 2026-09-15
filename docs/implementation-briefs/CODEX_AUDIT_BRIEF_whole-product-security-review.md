# Codex Audit Brief — Whole-Product Security Review

## Objective

Perform a **read-only, whole-product security audit** of the current `starfield-outpost-network` repository before public release.

This task is an **audit only**.

Do not implement fixes.

Do not refactor production code.

Do not add or upgrade dependencies.

Do not alter application behavior.

The only repository change this task may make is the audit report itself:

```text
docs/audits/codex-whole-product-security-audit.md
```

The audit should leave the application in exactly the same functional state even if the task is interrupted by usage limits and resumed later.

---

## Why this audit exists

The application is currently a local React/TypeScript/Vite browser application with:

- no backend;
- no database;
- browser storage as the normal persistence mechanism;
- JSON import/export;
- user-entered and imported text rendered in the UI;
- bundled/static reference data;
- eventual public hosting as an intended milestone.

That gives it a comparatively limited attack surface, but not a zero-risk one.

The current backlog explicitly calls for a security-focused review covering:

- JSON import parsing and malformed-file handling;
- pathological or excessively large imported collections;
- browser-storage assumptions and failure modes;
- user-entered/imported text rendering and XSS exposure;
- unsafe URL/link handling;
- dependency vulnerabilities;
- static asset and reference-data trust boundaries;
- large-session/history memory or denial-of-service-style failure cases;
- deployment and Content Security Policy considerations once hosting is chosen.

The audit should determine which of these are genuine risks in the current codebase, which are already handled safely, and which remain deployment-time concerns.

Do not introduce speculative security infrastructure merely because a category exists.

---

# Read first

Read and follow:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
package.json
package-lock.json
vite.config.*
```

Also inspect the completed accessibility audit for report style and precedent:

```text
docs/audits/codex-whole-product-accessibility-audit.md
```

Use current repository state as authoritative.

The backlog is deferred work, not current requirements.

---

# Operating rules

## Audit only

Do not modify:

```text
src/
tests/
scripts/
public/
reference-source/
package.json
package-lock.json
vite.config.*
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
README.md
```

Do not:

- fix vulnerabilities;
- harden code during the audit;
- change validation;
- alter import limits;
- add CSP headers;
- install security packages;
- update dependencies;
- rewrite storage;
- sanitize values speculatively;
- add tests;
- commit;
- push.

If a serious vulnerability is discovered, document it clearly and continue the audit unless continuing would itself be unsafe.

## Interruption-safe

This audit may be interrupted by Codex usage limits for hours or days.

Structure the work so that interruption does not leave product code half-modified.

The audit report may be written progressively.

If interrupted:

- leave any completed audit sections intact;
- do not create placeholder conclusions claiming unperformed work;
- resume from the report and repository state later;
- distinguish **inspected**, **tested**, **not tested**, and **inconclusive** evidence.

Never mark a category safe merely because no issue was noticed before interruption.

---

# Threat model

Begin the report with a concise threat model appropriate to the current product.

At minimum distinguish:

## Untrusted inputs

Potentially untrusted data includes:

- imported JSON files;
- character/network/outpost names and other user-authored strings;
- values restored from browser storage;
- persisted data created by older schema versions;
- static/reference data if the distributed files are modified or replaced;
- URL/query/hash content if any code consumes it;
- external links or URLs if any exist;
- package/dependency code.

## Trust boundaries

Identify actual current boundaries, including:

```text
user file -> JSON parser/deserializer -> domain model
browser storage -> loader/migration -> domain model
domain/user strings -> React rendering
reference/static files -> loader -> application state/presentation
application -> browser APIs
build dependencies -> production bundle
production bundle -> eventual web host/browser
```

Do not invent server/API boundaries that do not exist.

## Assets to protect

Focus on realistic product assets:

- integrity of persisted network data;
- availability of the application/session;
- user confidence that imports cannot execute script;
- safe rendering of imported/user text;
- predictable recovery from malformed/corrupt storage;
- prevention of runaway memory/CPU use from pathological data;
- integrity of the distributed application/reference data.

There is currently no account/authentication system, server secret, payment data, or backend database to protect unless the repository proves otherwise.

---

# Audit categories

## 1. JSON import and deserialization

Trace the complete import path from file selection through parse, migration/validation, and state replacement.

Review:

- malformed JSON handling;
- non-object roots;
- wrong schema/version shapes;
- missing required fields;
- extra/unexpected fields;
- malformed arrays;
- duplicate stable IDs;
- invalid references;
- extreme string lengths;
- extreme array lengths;
- deep or pathological nesting;
- numeric extremes;
- prototype-related keys such as `__proto__`, `constructor`, and `prototype`;
- partial mutation before validation completes;
- state/history mutation on failed import;
- migration assumptions;
- error-message exposure.

Determine whether imported objects are treated as ordinary data or can influence prototypes/executable behavior.

Do not assume `JSON.parse()` alone makes downstream handling safe.

Document the exact validation/migration boundary.

## 2. Browser storage and recovery

Trace loading and saving of the persisted `NetworkCollection`.

Review:

- corrupt/malformed stored JSON;
- quota exhaustion;
- unavailable/blocked storage;
- synchronous storage exceptions;
- partial/corrupt writes;
- recovery/fallback behavior;
- stale schema versions;
- unexpectedly large stored collections;
- whether failure can destroy the last good in-memory state;
- whether errors are surfaced safely;
- any assumptions that storage content is inherently trusted.

Assess data-loss and availability risk separately from code-execution risk.

## 3. XSS and unsafe rendering

Search the entire repository for security-sensitive rendering and execution paths.

At minimum inspect for:

```text
dangerouslySetInnerHTML
innerHTML
outerHTML
insertAdjacentHTML
eval
new Function
Function(
document.write
DOMParser
setAttribute with user-controlled names/URLs
style injection
HTML/SVG string construction
```

Trace user/imported strings into React rendering.

Confirm whether ordinary React text interpolation safely escapes:

- character names;
- network names;
- outpost names;
- cargo labels if persisted;
- validation messages containing user values;
- Search/result text;
- status messages;
- tooltip/help text;
- dialog text;
- exported/imported names.

Identify any place where imported or user data can become markup, script, CSS, an event handler, or an unsafe URL.

Use concrete dataflow evidence rather than generic React claims.

## 4. URL, navigation, and external-link handling

Search for:

```text
href=
src=
window.open
location
location.href
URL(
URLSearchParams
target="_blank"
fetch(
WebSocket
postMessage
```

Determine:

- whether the application currently accepts user-controlled URLs;
- whether external links exist;
- whether `javascript:` or other unsafe schemes could be introduced;
- whether `_blank` links use safe opener behavior where relevant;
- whether URL/query/hash state affects application behavior;
- whether any network request exists at runtime.

If there is no meaningful URL attack surface, say so explicitly and support it.

## 5. File APIs and export/download behavior

Inspect import/export browser APIs.

Review:

- file type/extension assumptions;
- whether MIME type is trusted incorrectly;
- size handling before reading;
- object URL creation/revocation;
- filename construction;
- user-controlled filename injection/path assumptions;
- exported JSON serialization;
- formula/CSV injection only if CSV/spreadsheet export actually exists;
- accidental export of presentation/session-only or sensitive browser data.

Do not report desktop filesystem path-traversal risks if the browser never writes arbitrary paths.

## 6. Denial-of-service / resource exhaustion

Assess realistic browser-side availability risks from pathological imported or persisted data.

Review:

- maximum number of networks/outposts/cargo pads;
- enforcement of documented domain caps;
- unbounded arrays not protected by domain limits;
- huge names/strings;
- huge Planned Supply/manufacturing lists;
- pathological cargo-link graphs;
- repeated derivation complexity;
- validation complexity;
- rendering complexity;
- import/migration complexity;
- recursive algorithms;
- quadratic/cubic scans on attacker-controlled collection size;
- Undo/Redo snapshot retention;
- the 1,000-entry session history cap;
- memory retained by whole-collection immutable snapshots;
- large JSON stringify/parse operations;
- potential UI freeze rather than only crashes.

Where possible, distinguish:

```text
bounded by domain rule
bounded by implementation
unbounded but practically low risk
unbounded and materially exploitable for browser freeze/memory exhaustion
```

Do not invent throughput/security limits without evidence.

## 7. Static/reference-data trust boundaries

Inspect how files under:

```text
public/
reference-source/
generated reference data
localization/reference overlays
```

reach runtime behavior.

Determine:

- which files ship to the browser;
- which are build-time-only;
- whether runtime reference JSON is assumed trusted;
- whether malformed/tampered reference data can crash or corrupt persisted data;
- whether reference strings are safely rendered;
- whether generated files have verification/hash/drift checks;
- whether provenance/build tooling introduces executable-code risks.

Treat compromise of the developer's repository/build pipeline separately from ordinary malicious user input.

## 8. Dependency and supply-chain review

Inspect:

```text
package.json
package-lock.json
```

Record:

- direct production dependencies;
- direct development dependencies;
- suspicious or unnecessary runtime packages if any;
- lifecycle scripts (`preinstall`, `postinstall`, etc.) if present;
- package scripts that execute local tools;
- lockfile use;
- dependency versions with known issues if evidence is available.

Run, if the environment permits:

```text
npm audit --json
```

and optionally a normal:

```text
npm audit
```

Do not update packages.

If the audit service/network is unavailable, report that rather than inferring a clean result.

Classify vulnerabilities by whether they can affect the **production browser bundle**, development/build environment only, or are unreachable in the current use case.

Do not treat every transitive advisory as a product vulnerability without reachability/context analysis.

## 9. Secrets and sensitive material

Search tracked repository content for evidence of:

- API keys;
- access tokens;
- passwords;
- private keys;
- credentials;
- `.env` values;
- accidental local paths/usernames where security-relevant;
- embedded service secrets.

Inspect `.gitignore` and relevant environment conventions.

Do not print any real secret value into the report if one is found.

Report only the file/path, secret type, exposure severity, and required response.

Do not search external account configuration or GitHub secrets; this is a repository audit.

## 10. Browser security model

Review use of browser APIs such as:

```text
localStorage/sessionStorage
FileReader / Blob / URL.createObjectURL
clipboard
drag/drop DataTransfer
workers
iframes
postMessage
service workers
notifications
geolocation
camera/microphone
WebAssembly
```

Report only APIs actually used.

Assess whether browser permissions or cross-origin behavior create a meaningful risk.

## 11. Build and deployment assumptions

Inspect the Vite build configuration and production HTML.

Separate **repository-level findings** from **hosting-dependent recommendations**.

Consider:

- Content Security Policy;
- `frame-ancestors` / clickjacking protection;
- MIME sniffing protections;
- Referrer Policy;
- Permissions Policy;
- HTTPS;
- caching of `index.html` vs hashed assets;
- source-map exposure if production sourcemaps are enabled;
- base-path assumptions;
- SPA fallback behavior;
- integrity of static assets;
- whether a service worker/PWA layer exists.

Do not report missing HTTP headers as an application-code defect if hosting has not yet been selected and the repository has no place to configure them.

Instead classify them as:

```text
deployment requirement
```

with a proposed minimum production-hosting baseline.

## 12. Error handling and information exposure

Review whether failures expose:

- stack traces;
- raw imported document contents;
- internal filesystem paths;
- implementation details;
- excessive diagnostic data in the UI;
- sensitive data in console logging.

Developer console diagnostics are not automatically vulnerabilities.

Distinguish normal developer diagnostics from information exposed to ordinary users.

## 13. Security-relevant domain integrity

Review whether untrusted imported state can bypass important invariants in ways that cause:

- broken stable-ID identity;
- link endpoints referencing nonexistent pads;
- duplicated IDs causing state confusion;
- impossible collection structure;
- destructive actions targeting the wrong object;
- history/context restoration to unintended objects.

This is not a general correctness audit.

Only include domain-integrity defects when untrusted/corrupt input can exploit the gap or materially damage user data/availability.

---

# Runtime/manual probing

A local development or preview server may be used for observation.

Do not modify persistent user data unless using a disposable/test state.

Useful manual probes may include:

- importing malformed JSON;
- importing valid JSON with strings containing HTML/script-like text;
- importing duplicate IDs;
- importing unusually large but controlled fixtures;
- corrupting a disposable storage entry;
- verifying that displayed script-like strings remain inert text;
- checking failure behavior after rejected imports.

Do **not** create intentionally enormous inputs likely to exhaust the machine.

Bound any stress test conservatively and document its size.

Do not perform network attacks or scan unrelated hosts.

---

# Static searches

Run repository searches for security-sensitive APIs and patterns.

At minimum cover:

```text
dangerouslySetInnerHTML
innerHTML
outerHTML
insertAdjacentHTML
eval
new Function
document.write
window.open
location.href
URLSearchParams
fetch(
WebSocket
postMessage
localStorage
sessionStorage
FileReader
createObjectURL
revokeObjectURL
target="_blank"
http://
https://
process.env
import.meta.env
```

Also search for likely secret markers:

```text
API_KEY
TOKEN
SECRET
PASSWORD
PRIVATE KEY
BEGIN RSA
BEGIN OPENSSH
```

Interpret results manually.

A textual match is not itself a vulnerability.

---

# Verification commands

Run the normal clean suite:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
git status --short
```

Also run, if available:

```text
npm audit
```

or:

```text
npm audit --json
```

Do not change dependencies in response.

If repository scripts differ from this list, use the current authoritative `package.json` and report the actual commands.

The existing Vite/Rollup large-chunk advisory is a known performance/backlog concern, not automatically a security finding.

---

# Severity model

Use:

## BLOCKER

A directly exploitable issue that should prevent public release, such as credible script execution from untrusted import/user data, exposed production secrets, or destructive unsafe behavior with trivial malicious input.

## HIGH

A serious security/data-integrity/availability flaw that is realistically exploitable and should be corrected before public release.

## MEDIUM

A meaningful weakness with constraints, limited impact, or substantial prerequisites, but still appropriate to correct before or near release.

## LOW

Defense-in-depth, hardening, constrained availability risk, or minor exposure with limited practical impact.

## INFORMATIONAL

Useful security posture observations or deployment requirements that are not application vulnerabilities.

Avoid severity inflation.

For every finding include:

- ID;
- category;
- severity;
- affected files/components;
- concrete evidence;
- realistic attack/failure scenario;
- impact;
- recommended correction direction;
- whether it is repository code, dependency, or deployment/hosting.

---

# Required report structure

Create:

```text
docs/audits/codex-whole-product-security-audit.md
```

Use this structure.

## Header

```text
# Whole-Product Security Audit

Audit date:
Scope:
Disposition:
```

## Executive summary

Include:

- overall posture;
- counts by severity;
- release-blocking status;
- the most important trust boundaries;
- what was actually tested versus source-inspected.

## Threat model

Summarize current architecture, untrusted inputs, trust boundaries, and assets.

## Method and observed scope

Record:

- files/areas inspected;
- static searches performed;
- runtime probes;
- verification commands;
- dependency audit availability/results;
- anything not exercised.

## Findings

Use a compact table followed by detailed sections for nontrivial findings.

Suggested columns:

```text
ID
Area
Severity
Type
Issue
Evidence
Recommended direction
```

## Category conclusions

Provide explicit conclusions for every audit category in this brief, including categories with no finding.

For example:

```text
JSON import/deserialization
Browser storage
XSS/rendering
URL/navigation
File APIs/export
Resource exhaustion
Reference/static-data trust
Dependencies/supply chain
Secrets
Browser APIs
Build/deployment
Error exposure
Security-relevant domain integrity
```

## Dependency audit

Separate package advisories from application findings.

State production reachability/context.

## Deployment security baseline

If hosting is not yet selected, provide a concise **future hosting checklist**, not implementation.

Include only justified items such as:

- HTTPS;
- CSP suited to the actual bundle;
- frame/embed policy;
- referrer policy;
- permissions policy where relevant;
- MIME/content-type protections;
- sane caching.

Do not prescribe a hosting vendor.

## Accepted limitations / untested areas

Be explicit.

Examples might include:

- no selected production host yet;
- HTTP response headers cannot be verified;
- npm advisory service unavailable;
- no hostile browser extension model;
- no compromised developer-machine threat model.

## Recommended correction slices

Group findings into **small coherent future implementation batches**.

Do not implement them.

Prefer:

```text
1. release-blocking correction
2. import/storage hardening
3. resource-limit hardening
4. dependency/deployment work
```

only if evidence warrants those groups.

If no code correction is required, say so.

## Release recommendation

Choose one:

```text
Outcome A — no security correction required before release within audited scope
Outcome B — targeted security corrections required
Outcome C — release-blocking security defect found
Outcome D — audit incomplete / evidence insufficient
```

Explain the choice.

---

# Important audit principles

## Evidence before recommendation

Do not recommend:

- DOMPurify;
- schema libraries;
- CSP libraries;
- storage wrappers;
- sandboxing;
- rate limiting;
- cryptographic signing;
- service workers;
- server infrastructure;

unless a concrete current risk justifies them.

React escaping is not a substitute for tracing dataflow, but neither should ordinary escaped JSX be reported as vulnerable without evidence.

## Distinguish security from robustness

A malformed import producing a friendly validation error is robustness.

A malformed import causing script execution is security.

A huge import freezing the browser may be both robustness and availability/DoS depending on practicality.

Classify carefully.

## Distinguish local app from hosted app

The current application has no backend.

Do not report absent authentication, CSRF protection, server authorization, database encryption, API rate limiting, CORS policy, or server-side session management as missing controls unless the repository actually introduces those surfaces.

## Distinguish application from deployment

Missing CSP/HTTP headers before a production host exists should normally be a deployment requirement, not a code vulnerability.

## Preserve settled architecture

Do not use the audit as an excuse to redesign:

- persistence;
- history;
- import/export;
- domain validation;
- reference data;
- localization;
- UI architecture.

Findings should point to the smallest plausible correction surface.

---

# Final handoff

At completion, report:

1. audit outcome;
2. finding counts by severity;
3. any release blocker;
4. highest-priority correction slice, if any;
5. commands run and their status;
6. path to the audit report;
7. confirmation that no production code, tests, dependencies, backlog, or architecture docs were changed;
8. confirmation that nothing was committed or pushed.

If usage limits interrupt the audit, do not fabricate a completion report. Resume later and complete the report before declaring an outcome.

---

# Completion principle

The audit is complete when it can answer, with repository-specific evidence:

> **Can a malicious or pathological imported/stored value, dependency, browser interaction, or eventual deployment choice cause script execution, destructive data corruption, meaningful information exposure, or practical denial of service — and what, if anything, must be corrected before public release?**
