# Codex Implementation Brief — Verify Nested Reference-Data 404 Behavior on Cloudflare Pages

## Objective

Implement and verify the narrow static candidate identified by the completed feasibility audit:

```text
public/reference-data/404.html
```

The goal is to determine whether Cloudflare Pages can return a genuine HTTP `404` for missing paths under:

```text
/reference-data/*
```

while preserving:

- normal serving of the manifest and 13 required JSON assets;
- existing SPA fallback behavior elsewhere;
- the current static Pages architecture;
- the existing fail-closed reference-data startup gate.

This is a **small experimental hardening parcel**, not a broad routing change.

Do not add Workers, Pages Functions, backend logic, dashboard rules, or top-level `404.html`.

Do not commit or push unless explicitly instructed.

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

## Audit basis

The feasibility audit concluded:

- `_redirects` cannot generate the required 404 response;
- a top-level `404.html` would change global SPA fallback behavior and is not acceptable;
- Workers / Pages Functions could solve the problem but would expand the architecture and are out of scope;
- a nested `public/reference-data/404.html` is the only plausible repository-controlled static candidate;
- Cloudflare documents nearest-directory `404.html` lookup and separately documents root SPA fallback, but does not explicitly guarantee precedence for this exact combination;
- therefore this candidate requires a deployed staging verification before adoption.

The current runtime gate already safely rejects both:

- real non-2xx responses;
- Cloudflare's observed `200 text/html` SPA fallback for a missing JSON path.

This parcel is defense in depth only.

---

## Required implementation

Add:

```text
public/reference-data/404.html
```

Keep it minimal.

The body may be a simple static page such as:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Reference data not found</title>
  </head>
  <body>
    Reference data not found.
  </body>
</html>
```

The exact wording is not important because this file exists to control HTTP missing-file semantics, not as user-facing application UX.

Do not add script, styling, redirects, telemetry, or application logic.

Do not add:

- `public/404.html`
- `_redirects`
- `_worker.js`
- `_routes.json`
- Pages Functions
- Wrangler configuration
- dashboard rules

---

## Local/build verification

Run:

- `npm run build`
- `npm run test`
- `npm run reference:test`
- `npm run test:components`
- `npm run lint`
- `git diff --check`

Also verify after build:

- `dist/reference-data/404.html` exists;
- all 13 runtime JSON assets are still present in `dist/reference-data/`;
- `manifest.json` is still present;
- no top-level `dist/404.html` was introduced;
- the existing reference-data manifest/inventory verification still passes unchanged.

Do not change reference-data inventory or manifest logic to include `404.html`. It is not a runtime data asset.

---

## Repository-level behavior constraints

The change must not alter:

- the reference-data manifest;
- dataset ID generation;
- runtime asset allowlist;
- startup gate behavior;
- application persistence;
- CSP/security headers;
- HSTS;
- Node/runtime configuration;
- dependency versions;
- package lock;
- localization.

If any of those appear to require changes, stop and report instead of broadening scope.

---

## Staging deployment verification

After the maintainer later commits and pushes to `staging`, the decisive test is the deployed response matrix.

Do not assume local static-server behavior proves Cloudflare behavior.

Verify on:

```text
https://staging.starfield-outpost-network.pages.dev
```

### A. Existing reference assets remain healthy

Verify all 14 required deployed JSON resources still return:

- HTTP `200`;
- JSON content type.

These are:

```text
/reference-data/manifest.json
/reference-data/biomes.json
/reference-data/body-biomes.json
/reference-data/inorganic-occurrences.json
/reference-data/species.json
/reference-data/planet-species.json
/reference-data/organic-occurrences.json
/reference-data/organic-farming-profiles.json
/reference-data/systems.json
/reference-data/bodies.json
/reference-data/resources.json
/reference-data/products.json
/reference-data/body-resources.json
/reference-data/product-recipes.json
```

### B. Missing JSON under `/reference-data/`

Request a definitely nonexistent path such as:

```text
/reference-data/__missing_reference_probe__.json
```

Expected desired result:

- HTTP `404`;
- not `200`;
- response body may be the nested `404.html`;
- response content type may be HTML.

### C. Arbitrary missing nested path

Request another nonexistent path under the same directory, for example:

```text
/reference-data/__missing_probe__
```

Expected desired result:

- HTTP `404`.

This confirms behavior is directory-scoped, not JSON-extension-specific.

### D. Unrelated missing path outside `/reference-data/`

Request an unrelated nonexistent path such as:

```text
/__spa_fallback_probe__
```

Expected result:

- existing SPA fallback remains in effect;
- response is still the application shell rather than the nested reference-data 404;
- current site behavior outside `/reference-data/` is unchanged.

This is the critical proof that the nested `404.html` does not globally disable SPA fallback.

### E. Application startup

Verify:

- tracker starts normally;
- existing network data remains intact;
- locale switching still works;
- no new console errors or warnings.

### F. Fatal-state behavior

Temporarily block one required reference-data request in browser DevTools, as previously tested.

Verify:

- startup still fails closed;
- editor does not mount;
- fatal state appears;
- Reload remains fail-closed while blocked;
- removing the block restores normal startup;
- saved data remains unchanged.

This confirms the server-side hardening has not replaced or weakened the client-side integrity boundary.

---

## Success criteria

Classify the staging result as **successful** only if all are true:

1. valid reference-data assets still return `200 application/json`;
2. missing `/reference-data/*` path returns genuine HTTP `404`;
3. unrelated missing path still receives normal SPA fallback;
4. tracker startup works normally;
5. fatal-state behavior remains intact;
6. no regression appears in security headers or application behavior.

If all succeed, the nested static 404 is suitable for production adoption.

---

## Failure criteria

Treat the candidate as **not worth adopting** if any of the following occur:

- missing `/reference-data/*` still returns `200 text/html`;
- nested `404.html` changes SPA fallback globally;
- valid reference assets are intercepted;
- Cloudflare ignores the nested file;
- unexpected routing behavior appears;
- application startup or reference integrity is affected.

If that happens:

- do not add Workers or Functions;
- do not add a top-level `404.html`;
- do not invent a dashboard workaround;
- remove the candidate in a follow-up correction;
- keep the existing application-level fail-closed handling;
- document the platform limitation as accepted.

---

## Documentation

Do not pre-emptively rewrite durable documentation as though the candidate is proven.

After implementation but before deployed verification:

- `docs/BACKLOG.md` may note that the nested static candidate is implemented on `staging` and deployed verification is pending;
- do not claim success yet.

If staging later proves the behavior works, durable docs should then be reconciled in a follow-up documentation update:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`

The final wording should distinguish:

- HTTP 404 behavior as defense in depth;
- the runtime gate as the primary integrity control;
- nested `reference-data/404.html` as a static Pages routing hardening mechanism;
- Workers/Functions still not required.

If staging disproves the behavior, durable docs should instead record that the static candidate was tested and rejected.

---

## Scope boundaries

Expected implementation diff:

- `public/reference-data/404.html`
- possibly `docs/BACKLOG.md` for a narrow “verification pending” note

Do not modify:

- application source;
- reference-data loader;
- startup gate;
- tests unless an existing assertion must be adjusted for a legitimate reason;
- manifest generation;
- reference asset lists;
- security headers;
- HSTS;
- CSP;
- deployment branch rules;
- Cloudflare dashboard settings;
- Node/runtime files;
- dependencies;
- lockfile.

---

## Completion response

Return:

1. concise implementation summary;
2. current branch;
3. files changed;
4. exact contents/purpose of `public/reference-data/404.html`;
5. confirmation no top-level `404.html` was added;
6. confirmation no Worker/Function/dashboard rule was added;
7. build/test/lint results;
8. confirmation `dist/reference-data/404.html` exists;
9. confirmation the 14 required JSON resources remain present in `dist`;
10. confirmation manifest/inventory logic is unchanged;
11. documentation change, if any;
12. exact staging response-matrix checks still required after push;
13. confirmation no application behavior intentionally changed;
14. confirmation no dependency/lockfile/runtime change;
15. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
