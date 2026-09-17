# Cloudflare Pages staging deployment and smoke-test report

**Date:** 17 September 2026
**Scope:** Initial private staging parcel; observations are limited to the repository, connected Cloudflare account, and GitHub branch listing.

## Executive summary

| Question | Result |
| --- | --- |
| Staging deployment succeeded? | **NOT TESTED** — no Pages project or remote staging branch exists. |
| Access protection active? | **MANUAL STEP REQUIRED** — no Pages project exists to protect. |
| `noindex` confirmed? | **NOT TESTED** — no deployed response exists. |
| Tracker functions normally on Pages? | **NOT TESTED** — local build and tests pass, but this is not a Pages smoke test. |
| Release-blocking deployment issue found? | **Not established.** The missing remote branch, Pages project, and Access policy block this staging test; they do not demonstrate an application defect. |

The Cloudflare connector responded successfully to a read-only Pages project listing, which returned no projects in the connected account. GitHub's branch listing for `gooberpede/starfield-outpost-network` returned only `main`; the local checkout is also on `main`. No Cloudflare project was created because a Git-connected project could deploy `main` before the production hostname and preview URLs are confirmed protected. This parcel forbids a commit or push, and the requested private staging deployment cannot be verified without a remote staging branch and Access configuration.

## Repository facts and deployment configuration

| Item | Current fact or intended configuration |
| --- | --- |
| GitHub repository | `gooberpede/starfield-outpost-network` (local `origin`) |
| Git source | Intended: GitHub integration. Cloudflare-side authorization was not independently verified. |
| Pages project name / URLs | None assigned. |
| Branches | Local and remote: `main` only. Intended non-production preview branch: `staging`. |
| Cloudflare production branch | Not configured. Reserve `main` for eventual public release; disable automatic production deployment during staging. |
| Preview branch behavior | Intended: build `staging` only, using custom preview branch controls. |
| Framework / build | Static Vite/React; `npm run build`; output `dist`. No runtime server or Pages Functions. |
| Runtime assets | Vite's root-relative hashed JS/CSS, 13 root-relative `/reference-data/*.json` files, and static favicons. No application deep-link router. |
| User data | `localStorage` collection and separate locale preference; JSON import uses `FileReader`, export uses a Blob download. |
| Existing deployment machinery | No GitHub workflow, Pages configuration, `_headers`, or `_redirects` found. No repository-side deployment configuration is required for the documented Vite build. |
| Cloudflare changes completed | None. Connector access was read-only for this parcel. |

The production build completed locally with hashed JS/CSS and the 13 stable-name JSON files. The Vite chunk-size advisory remains; it is outside this parcel. The intentional LAN-facing Vite development setting was unchanged. Google Fonts remains an external CSS import. No paid Cloudflare feature, custom domain, custom header, cache rule, Worker, Function, dependency, or application-code change was introduced.

## Default response behavior

There is no deployment URL, so no response headers can be observed. Cloudflare documentation describes defaults, but they are **not measurements of this project**.

| Resource | `Cache-Control` | `ETag` | `Content-Type` | `Content-Encoding` | `Age` / cache status | `Vary` | Security / robots headers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` or `/index.html` | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |
| Hashed JS | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |
| Hashed CSS | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |
| Large reference JSON | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |
| Small reference JSON | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |
| Favicon | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed | Not observed |

On the first protected deployment, capture actual GET/HEAD responses for these resources, including `X-Content-Type-Options`, `Referrer-Policy`, and `X-Robots-Tag`. Record whether headers are visible before authentication, after authentication, or both. Check the Cloudflare-designated production hostname separately from the preview alias. Do not infer that a preview policy protects the production `project.pages.dev` hostname: [Cloudflare says the built-in preview Access setting covers preview deployments only](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

## Smoke-test results

| Test | Status | Evidence / remaining check |
| --- | --- | --- |
| Basic load and console | NOT TESTED | No staging URL. Open the protected preview and inspect render, console, and network failures. |
| Reload and root navigation | NOT TESTED | Reload the preview and navigate directly to its root. |
| JS/CSS MIME and missing assets | NOT TESTED | Inspect real responses. Verify a missing JSON/asset does not silently pass as useful HTML. |
| Reference data | NOT TESTED | Verify all 13 catalogue requests return JSON and catalogue-dependent UI works. |
| Import | NOT TESTED | Import a small disposable collection in an isolated browser profile. |
| Export | NOT TESTED | Download and inspect JSON from that profile under the protected origin. |
| Collection persistence | NOT TESTED | Reload the disposable collection and check the staging origin's `localStorage`. |
| Locale preference persistence | NOT TESTED | Change locale, reload, and verify it persists. |
| Google Fonts and fallback | NOT TESTED | Inspect Google font requests and typography; optionally block font requests in the test profile and check usability. |
| Authorized Access | MANUAL STEP REQUIRED | Configure Access, then verify an allowed developer session. |
| Unauthorized Access | MANUAL STEP REQUIRED | Check the preview and any production hostname in a clean private session; neither should return the application anonymously. |
| `X-Robots-Tag: noindex` | NOT TESTED | Check the actual preview response. [Cloudflare documents `noindex` as a preview default](https://developers.cloudflare.com/pages/configuration/preview-deployments/), not as a verified header here. Check any Cloudflare-designated production hostname separately. |
| Deployment update / rollback | NOT TESTED | No build A exists; defer build B and cache-coherence comparison. |

Staging `localStorage` is tied to the staging origin. It will **not** move automatically to a future custom domain; use JSON export/import if test data needs to be carried over. Do not put valuable user data in the staging profile.

## Differences from local production preview

None observed: there is no Pages deployment to compare. The earlier [production-hosting readiness benchmark](PRODUCTION-HOSTING-READINESS.md) reported a successful local production preview; this report makes no new Pages-versus-local claim.

## Findings

| Class | Finding |
| --- | --- |
| BLOCKER | The private Pages smoke test cannot proceed until a remote `staging` branch is pushed and the Pages project plus Access policy are configured. |
| PRE-RELEASE | Verify Access on every reachable preview URL and on any populated production `project.pages.dev` URL before treating the site as private. |
| PRE-RELEASE | Capture actual noindex, content type, cache, and security headers; verify all 13 catalogues, import/export, and persistence on the deployed origin. |
| DEFER | A useful second-deployment update/rollback test requires a later legitimate push. |
| DEFER | CSP, custom security/cache headers, custom domain, reference-data coherence code, and bundle changes remain separate parcels. |

## Manual Cloudflare and GitHub steps still required

1. When ready to publish staging changes, create and push a dedicated `staging` branch containing the reviewed repository state. This task made no branch, commit, or push.
2. In Cloudflare **Workers & Pages**, create a Pages project from the linked GitHub repository `gooberpede/starfield-outpost-network`. Use the Vite/static build: `npm run build`, output `dist`, repository root. Keep Functions, analytics, and paid services off. Confirm GitHub authorization if the repository is unavailable in the picker.
3. Configure `main` as the Cloudflare production branch but **disable automatic production branch deployments**. Under preview branch controls, choose **Custom branches** and include only `staging`. Confirm the actual settings before the first staging push or build. Cloudflare's [branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) document these options. If the project-creation wizard insists on deploying `main` immediately, stop and protect the resulting production hostname before treating the project as private; do not expose that URL as a launch.
4. In the Pages project, go to **Settings > General > Enable access policy**. Restrict the resulting preview Access application to the authorized developer identity. Cloudflare's [preview deployment guidance](https://developers.cloudflare.com/pages/configuration/preview-deployments/) says previews are public by default until this is enabled.
5. Inspect whether the Cloudflare-designated production `project.pages.dev` hostname serves app content. The preview Access setting does **not** cover it. If it does or might become populated, protect it separately using Cloudflare's [Pages Access procedure for the production hostname](https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain), and confirm that preview protection remains enabled afterward.
6. Trigger or wait for a build from `staging`, then record the project name, deployment URL, branch alias, build result, and actual protection on **all** reachable URLs. In a private/unauthorized session, verify that the HTML, JS/CSS, and JSON cannot be read anonymously. In an authorized session, complete the response-header and smoke-test table above. Do not assume `noindex` on a Cloudflare-designated production URL; check it directly if that URL serves content.

These steps are intentionally sequenced to make the first application deployment private. The exact dashboard behavior at project creation has not been tested in this account. If Pages requires an initial production deployment before Access can be attached, avoid placing real user data there and treat that exposure as an unresolved staging privacy issue until both URLs are protected and tested.

## Recommended next hosting parcel

Complete the private `staging` deployment and this report's deployed checks after the remote branch is available. Use the observed headers and update behavior to scope the later CSP/security-header and reference-data coherence work. Defer custom-domain registration until its registration and renewal price can be checked against the AUD$30/year ceiling.

## Local verification

- `npm run build`: **PASS** (Vite reported the existing large-chunk advisory).
- `npm test`: **PASS**, 183/183 tests.
- `git diff --check`: **PASS**. The new untracked report also passed a separate trailing-whitespace check.

No commit or push was performed.
