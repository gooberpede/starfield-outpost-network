# Codex Documentation Brief — Reconcile Verified Nested Reference-Data 404 Behavior

## Objective

Update durable project documentation to reflect the now-verified Cloudflare Pages behavior for missing reference-data paths.

The nested static file:

```text
public/reference-data/404.html
```

has been tested successfully on both staging and production.

Verified behavior:

- valid reference-data assets still return `200` with `Content-Type: application/json`;
- missing `/reference-data/*.json` paths return genuine `404 Not Found`;
- arbitrary missing `/reference-data/*` paths return genuine `404 Not Found`;
- unrelated missing paths still receive normal SPA fallback;
- normal tracker startup remains unaffected;
- saved network data remains intact;
- locale switching remains functional;
- the fatal reference-data startup path still fails closed when a required JSON request is blocked;
- unblocking the required asset restores normal startup;
- no Worker, Pages Function, dashboard rule, top-level `404.html`, or other architectural expansion was required.

This is a documentation-only parcel.

Do not change application code, hosting configuration, routing behavior, tests, dependencies, or Cloudflare settings.

Do not commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before editing:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify any unrelated working-tree changes.

Do not work directly on `main`.

Do not commit or push.

---

## Source documents to inspect

At minimum inspect:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`
- `docs/audits/CLOUDFLARE-REFERENCE-DATA-404-FEASIBILITY.md`

Also inspect any nearby durable reference-data integrity documentation if necessary to avoid contradictions or duplicate wording.

The audit document is historical evidence and should remain as written unless there is a clear factual typo.

Do not rewrite the audit to make it look as though the outcome had been known at audit time.

---

## Required factual state to document

The durable docs should now reflect all of the following:

### Hosting behavior

Cloudflare Pages now has a repository-controlled nested not-found page at:

```text
public/reference-data/404.html
```

which produces genuine HTTP 404 responses for missing paths under:

```text
/reference-data/*
```

without disabling or changing normal SPA fallback elsewhere.

This behavior has been verified on:

- staging;
- production custom domain.

### Reference-data integrity boundary

The nested 404 is defense in depth only.

The primary integrity control remains the client-side startup gate, which:

- verifies the manifest;
- verifies all 13 required runtime JSON assets;
- rejects non-2xx responses;
- rejects wrong MIME such as `200 text/html`;
- checks size, hashes, JSON parsing, dataset/manifest coherence, and lightweight shape;
- prevents `App` from mounting until verification succeeds;
- keeps normal persistence inactive on failure;
- preserves saved user data.

Do not describe HTTP 404 behavior as the sole or primary integrity boundary.

### Architecture constraint

The successful solution required no architectural expansion:

- no Worker;
- no Pages Function;
- no backend;
- no `_redirects` workaround;
- no top-level `404.html`;
- no dashboard-only routing rule.

The app remains a static Cloudflare Pages deployment.

---

## Required updates

### `docs/ARCHITECTURE.md`

Update the reference-data loading / integrity section so it no longer describes the nested `404.html` as merely a candidate.

The architecture document should say, concisely:

- missing `/reference-data/*` assets now receive a genuine 404 because of the directory-local `reference-data/404.html`;
- unrelated routes retain SPA fallback;
- the client-side gate still treats HTTP status and MIME as part of its fail-closed validation;
- the server-side 404 is defense in depth, not the integrity boundary.

Avoid excessive hosting implementation detail here.

### `docs/DEPLOYMENT.md`

Update the reference-data hosting section to reflect the verified deployment behavior.

Document that:

- `public/reference-data/404.html` is intentionally present;
- it is copied to `dist/reference-data/404.html`;
- missing `/reference-data/*` paths return 404 on both staging and production;
- unrelated missing paths still use SPA fallback;
- no Worker/Function or dashboard routing rule is involved.

Keep this operational and concise.

If there is an existing production verification/checklist section, add a small note that this behavior has been verified rather than creating a second checklist.

### `docs/BACKLOG.md`

Close or remove the now-completed 404 feasibility/verification item.

Do not leave it phrased as pending.

The backlog should retain only future work, not a completed experiment.

If the backlog uses completion notes rather than deletion, follow the existing style.

Also preserve the other previously agreed priorities:

- fatal-state raw storage-only backup/export remains a pre-release review backlog item;
- performance/bundle review remains a near-term peace-of-mind item;
- Sandbox remains deferred until there is a real use case;
- public-launch removal of `noindex` / `robots.txt` remains bundled with launch work;
- HSTS lengthening/review remains a backlog item for later grooming, not before September 20.

Do not broaden this documentation parcel into reprioritizing those items.

---

## Historical audit treatment

Leave:

```text
docs/audits/CLOUDFLARE-REFERENCE-DATA-404-FEASIBILITY.md
```

as a point-in-time audit.

It is acceptable for that document to say Outcome D / candidate pending deployed verification because that was true when the audit was written.

If useful, durable docs may reference that the later staging/production verification confirmed the candidate.

Do not retroactively rewrite the audit conclusion.

---

## Verification evidence to preserve accurately

The implemented nested static 404 was verified with this response matrix.

### Staging

- `/reference-data/__missing_reference_probe__.json` → `404`
- `/reference-data/__missing_probe__` → `404`
- `/__spa_fallback_probe__` → SPA response (`304 Not Modified` observed due browser cache revalidation, confirming the unrelated route was still served as the app shell rather than the nested 404)

Additionally:

- all 14 required reference JSON resources returned `200` and `application/json`;
- normal tracker startup succeeded;
- saved data was intact;
- locale switching worked;
- blocking one required JSON produced the fatal screen;
- unblocking restored normal operation.

### Production

On `https://starfieldoutposts.com`:

- `/reference-data/__missing_reference_probe__.json` → `404 Not Found`
- `/reference-data/__missing_probe__` → `404 Not Found`
- `/__spa_fallback_probe__` → `200 OK`

Do not overstate the staging `304` as a distinct routing rule; it was ordinary cache revalidation of the SPA response.

---

## Scope boundaries

Expected changed files:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/BACKLOG.md`

Do not modify:

- `public/reference-data/404.html`
- application source
- tests
- reference-data loader/gate
- `_headers`
- HSTS
- CSP
- Node/runtime files
- package dependencies
- package lock
- Cloudflare settings
- audit history, except only if a factual typo is found and explicitly reported first

No new implementation is required.

---

## Validation

Run:

- `git diff --check`

Optionally run a lightweight documentation search to confirm there are no stale durable phrases such as:

- “nested 404 candidate”
- “verification pending”
- “possible static defense-in-depth improvement”

where they now incorrectly refer to this completed item.

Do not run the full application test suite unless documentation tooling or repository conventions require it.

---

## Completion response

Return:

1. concise summary;
2. current branch;
3. files changed;
4. what changed in `ARCHITECTURE.md`;
5. what changed in `DEPLOYMENT.md`;
6. what changed in `BACKLOG.md`;
7. confirmation the feasibility audit remains historical and unchanged;
8. confirmation the docs now distinguish defense in depth from the primary runtime integrity gate;
9. confirmation the docs record both staging and production verification accurately;
10. confirmation the other backlog priorities were preserved;
11. `git diff --check` result;
12. confirmation no implementation file changed;
13. confirmation no Cloudflare setting changed;
14. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
