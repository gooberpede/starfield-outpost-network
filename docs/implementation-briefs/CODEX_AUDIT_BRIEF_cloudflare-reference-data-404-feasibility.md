# Codex Audit Brief — Cloudflare Pages Missing Reference-Data 404 Feasibility

## Objective

Conduct a **read-only feasibility audit** of whether the Starfield Outpost Tracker can make missing runtime reference-data assets return a genuine HTTP `404` from Cloudflare Pages **without**:

- introducing Cloudflare Workers;
- introducing Pages Functions;
- adding a backend;
- changing the app away from its current static Pages architecture;
- breaking or globally disabling normal SPA fallback behavior;
- weakening the existing client-side fail-closed reference-data gate.

The purpose of this audit is to determine whether a narrow, static-hosting-compatible solution exists for:

```text
/reference-data/*
```

If no such solution exists, document that clearly and recommend leaving the current application-level detection as the primary control.

Do not implement anything in this audit.

Do not commit or push.

---

## Context

The tracker is a static React/Vite application deployed to Cloudflare Pages.

Current runtime behavior:

- required reference-data assets live under `/reference-data/`;
- the application verifies a runtime manifest plus 13 required JSON assets before mounting the editable app;
- the gate validates status, MIME type, manifest coherence, hashes, JSON parsing, size limits, and basic shape;
- if any required asset is missing, malformed, wrong MIME, wrong hash, etc., startup fails closed;
- the editable app does not mount;
- saved user data is preserved;
- a dedicated fatal state is shown.

The application already handles Cloudflare's SPA fallback case where a missing asset may return:

```text
200 text/html
```

instead of a real JSON 404.

This audit is about **defense in depth only**.

There is no known safety defect requiring architectural expansion.

---

## Current hosting constraints

The hosting model is intentionally:

- Cloudflare Pages Free;
- static assets only;
- no backend;
- no Workers;
- no Pages Functions;
- no paid/metered runtime services;
- repository-controlled deployment where possible;
- production domain `https://starfieldoutposts.com`;
- staging on `https://staging.starfield-outpost-network.pages.dev`.

Do not recommend architectural expansion unless there is no static solution **and** there is a strong, concrete justification. For this audit, assume the preferred outcome in that case is simply to document the limitation and leave the existing gate in place.

---

## Core audit question

Answer this precisely:

> Can Cloudflare Pages, in the current static architecture, be configured so that a missing path under `/reference-data/*` returns a genuine HTTP `404` while preserving normal SPA fallback behavior elsewhere?

The solution must be:

- static-hosting compatible;
- repository controlled if possible;
- path-scoped to `/reference-data/*`;
- not reliant on a Worker or Function;
- not dependent on a paid feature;
- not globally disruptive to SPA routing.

---

## Required investigation areas

Inspect both the repository and current Cloudflare Pages documentation.

### 1. Existing repository routing/static files

Inspect at minimum:

- `public/_redirects`
- `public/_headers`
- `public/404.html`, if present
- `vite.config.*`
- `package.json`
- any Wrangler configuration
- any other Pages-specific deployment configuration
- `docs/DEPLOYMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/BACKLOG.md`
- the reference-data startup gate implementation
- reference-data loading code
- relevant tests for missing asset / wrong MIME / SPA fallback behavior

Confirm the current implementation's actual protection before evaluating server-side alternatives.

### 2. Cloudflare Pages `_redirects`

Determine whether `_redirects` can:

- scope matching to `/reference-data/*`;
- return or rewrite to a genuine `404`;
- use status-code rules suitable for this purpose;
- preserve SPA fallback elsewhere.

Distinguish clearly between:

- redirects;
- rewrites;
- proxying;
- response status control.

Do not infer capabilities not documented.

### 3. Custom `404.html`

Determine exactly how a top-level custom `404.html` affects Cloudflare Pages behavior.

Specifically answer:

- whether adding `404.html` disables or changes SPA fallback globally;
- whether it can be scoped only to `/reference-data/*`;
- whether it would create regressions for future client-side routes;
- whether a nested `/reference-data/404.html` has any special supported behavior.

Do not recommend a global `404.html` unless its interaction with the app's SPA behavior is fully understood.

### 4. Static asset routing semantics

Investigate whether Pages offers any static-only mechanism for:

- asset-directory-specific fallbacks;
- path-specific 404 handling;
- exclusion of `/reference-data/*` from SPA fallback;
- route matching that distinguishes static assets from navigation routes;
- disabling fallback only for one path prefix.

If such a mechanism exists, identify its exact configuration and constraints.

### 5. Workers / Pages Functions

Briefly confirm whether Workers or Pages Functions could solve the problem.

However:

- treat them as **out of architectural scope**;
- do not propose implementation;
- do not treat their existence as evidence that the static problem is solved.

The audit should explicitly distinguish:

```text
possible with dynamic edge logic
```

from:

```text
possible within the current static architecture
```

### 6. Cloudflare dashboard-only features

Check whether any Pages/zone dashboard feature can path-scope missing-asset behavior without Workers/Functions.

If such a feature exists:

- determine whether it is available on the Free plan;
- determine whether it preserves SPA fallback elsewhere;
- determine whether it can be represented/configured reproducibly;
- assess whether it would create hidden deployment configuration.

Do not change any dashboard setting.

### 7. Current application-level control

Verify the present reference-data gate behavior for the relevant case.

Confirm whether the app currently detects:

- non-2xx status;
- `200 text/html` returned for a JSON asset;
- invalid JSON;
- missing asset;
- wrong MIME;
- hash mismatch;
- manifest mismatch.

Identify which check specifically catches Cloudflare's SPA fallback response.

Assess whether the current behavior is sufficient to keep the application fail-closed and protect saved user data.

---

## Decision criteria

Classify the result into one of these outcomes.

### Outcome A — Static path-scoped 404 is supported cleanly

Use this only if Cloudflare Pages can, without Workers/Functions/backend:

- scope behavior to `/reference-data/*`;
- return a genuine 404 for missing assets;
- preserve normal SPA fallback elsewhere;
- avoid material operational complexity.

If so, document the exact mechanism and recommend a separate implementation parcel.

Do **not** implement it during this audit.

### Outcome B — Possible only with architectural expansion

Use this if the behavior requires:

- Workers;
- Pages Functions;
- other runtime logic;
- a backend;
- or another material hosting-model change.

Recommendation should normally be:

- do not implement;
- keep current application-level fail-closed handling;
- record the server-side limitation as accepted.

### Outcome C — Static workaround exists but harms SPA behavior

Use this if, for example, a global `404.html` can force true 404 responses but changes fallback semantics for the whole application.

Recommendation should normally be:

- do not implement;
- document why the trade-off is not worthwhile;
- preserve the existing SPA model and runtime gate.

### Outcome D — Another narrow static solution exists with caveats

If a less obvious mechanism exists, document:

- exact behavior;
- limitations;
- deployment risk;
- whether it is worth implementing.

Do not force the finding into a preconceived answer.

---

## Security and architecture principles

Use these principles when assessing alternatives:

1. The current reference-data gate already fails closed.
2. A server-side 404 is defense in depth, not the primary integrity boundary.
3. Do not add infrastructure merely to make a missing asset fail "more correctly" at HTTP level.
4. Prefer explicit application detection over hidden platform behavior where the latter adds operational complexity.
5. Preserve the static Pages architecture unless there is a compelling reason to change it.
6. Preserve user data under failure.
7. Do not weaken SPA behavior to solve a narrow asset-routing issue.
8. Do not convert a non-blocking hardening idea into a release blocker without evidence.

---

## Required sources

Use authoritative Cloudflare documentation for claims about:

- Pages SPA fallback behavior;
- `_redirects`;
- rewrites/status-code behavior;
- `404.html`;
- Functions/Workers where relevant;
- any dashboard rule mechanism considered.

Include links in the audit document.

If Cloudflare documentation is ambiguous, say so and distinguish:

- documented behavior;
- repository-observed behavior;
- inference.

Do not rely primarily on community posts if first-party documentation covers the point.

---

## Deliverable

Create:

```text
docs/audits/CLOUDFLARE-REFERENCE-DATA-404-FEASIBILITY.md
```

Do not modify implementation files.

The audit should contain:

### Executive conclusion

A short answer to:

> Can we get genuine path-scoped 404s for missing `/reference-data/*` assets without changing the current static Pages architecture?

### Current behavior

Document:

- Cloudflare SPA fallback behavior relevant to this app;
- current reference-data loader/gate response;
- why the current app remains safe.

### Options considered

At minimum:

- `_redirects`;
- custom `404.html`;
- nested/static fallback possibilities;
- dashboard-only routing features if any;
- Pages Functions;
- Workers.

### Trade-off table

For each viable or semi-viable option, compare:

- path-scoped?
- genuine 404?
- preserves SPA fallback?
- static only?
- Free plan?
- repository controlled?
- architecture impact?
- recommendation?

### Recommendation

State whether to:

- implement a narrow static solution;
- reject architectural expansion and keep current handling;
- or investigate a specific unresolved mechanism further.

### Durable documentation recommendation

If the answer is effectively “not possible without disproportionate architectural change,” propose concise wording for:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`

Do **not** edit those files during the audit unless explicitly instructed.

The proposed wording should capture:

- why Pages may return `200 text/html` for missing reference assets;
- that the runtime gate explicitly detects and rejects this;
- that a path-scoped server-side 404 was investigated;
- why no additional hosting logic is being introduced;
- that this is an accepted platform limitation / defense-in-depth trade-off, not an open defect.

---

## Tests / validation

This is a read-only audit.

Do not alter application code or Cloudflare settings.

You may run existing tests or inspect existing test coverage if useful, but do not add tests unless explicitly asked.

If you run commands, report them.

---

## Completion response

Return:

1. concise conclusion;
2. exact outcome classification: A, B, C, or D;
3. whether a static path-scoped 404 is possible;
4. whether `_redirects` can do it;
5. whether `404.html` can do it without global SPA impact;
6. whether Workers/Functions could do it;
7. whether any dashboard-only Free-plan mechanism solves it cleanly;
8. confirmation of the current application's fail-closed behavior;
9. audit file created;
10. proposed durable-document updates;
11. commands/tests run, if any;
12. confirmation no implementation files changed;
13. confirmation no Cloudflare setting changed;
14. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
