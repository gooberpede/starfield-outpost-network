# Codex Implementation Brief — Align Local and Cloudflare Runtime on Node 24 LTS

## Objective

Move the Starfield Outpost Tracker from Node 22 to a single, consistent Node 24 LTS runtime across:

- the repository pin;
- the documented project engine range;
- local development;
- Cloudflare Pages staging/production builds.

The previous Node 22 alignment worked technically, but Cloudflare now warns that Node 22 is in Maintenance LTS and nearing end-of-life. The project should move to Node 24 LTS now rather than carrying a near-term runtime migration.

Keep this parcel narrow. Do not change application behavior, dependencies, Cloudflare dashboard settings, or unrelated hosting configuration.

Do not commit or push unless explicitly instructed.

---

## Branch and workflow

Work on:

- `staging`

Before changing anything:

- run `git status`;
- run `git branch --show-current`;
- confirm the branch is `staging`;
- identify any unrelated working-tree changes before proceeding.

Do not work directly on `main`.

Do not commit or push.

---

## Current known state

Repository:

- `.node-version` currently pins `22.23.2`;
- `package.json` currently declares Node 22 compatibility, expected to be:
  - `>=22.22.2 <23`;
- `docs/BACKLOG.md` contains the Node-runtime cleanup item.

Cloudflare staging has verified that:

- `.node-version` is honored;
- Node `22.23.2` is installed;
- the former `EBADENGINE` warnings for `jsdom` and `undici` disappear;
- the build succeeds.

However, Cloudflare emits a warning that Node 22 is in Maintenance LTS and nearing end-of-life.

The maintainer's current local runtime, from the previous implementation check, was:

- Node `v24.19.0`
- npm `11.17.0`

Do not assume those local versions are still unchanged; verify them.

---

## Required first step: select the exact Node 24 LTS patch

Before editing, determine the current appropriate **Node 24 LTS patch release** from authoritative Node.js release information.

Requirements:

- stay on Node 24;
- use an LTS release;
- prefer the current/latest stable Node 24 LTS patch unless there is a concrete compatibility reason not to;
- do not choose Node 25 or another odd-numbered/non-LTS line;
- do not retain Node 22 merely to avoid a patch-level local update.

Record:

- the exact chosen version;
- why it is the appropriate Node 24 LTS target;
- whether the maintainer's installed local Node already matches it.

Do not change the user's machine-level Node installation automatically.

If the local runtime does not match the selected version, report the mismatch and the exact manual local update needed after repository changes are prepared.

---

## Repository changes

### `.node-version`

Change the root `.node-version` to the selected exact Node 24 LTS patch, for example:

```text
24.xx.x
```

Use an exact patch version, not `24` or `24.x`.

This exact file is the source of truth for Cloudflare runtime selection.

### `package.json`

Update `engines.node` so the project explicitly supports Node 24 and excludes other major versions.

Preferred shape:

```json
"engines": {
  "node": ">=24 <25"
}
```

If the current ecosystem or package-manager semantics make a more precise lower bound useful, explain why before using it.

Do not declare support for Node 22 after this migration.

Do not declare support for Node 25+.

### Documentation

Update the existing Node/toolchain cleanup item in `docs/BACKLOG.md`.

The backlog entry should reflect the actual state after implementation:

- repository moved to Node 24 LTS;
- local alignment status;
- Cloudflare staging verification still pending until the maintainer pushes and checks the build.

Do not mark Cloudflare verification complete before it has actually happened.

Inspect `docs/DEPLOYMENT.md` for any explicit Node 22 assumption. Change it only if it contains stale durable guidance that would become incorrect.

Do not create duplicate runtime documentation unnecessarily.

---

## Local runtime alignment

Run:

```text
node --version
npm --version
```

Compare the installed local Node version with the selected `.node-version`.

### If local Node already matches

Run the full verification suite under that exact runtime.

### If local Node does not match

Do **not** modify the machine-level Node installation unless explicitly authorized.

Instead:

1. make the repository changes;
2. report the exact selected target;
3. state the current local Node version;
4. state that full target-runtime verification is pending;
5. provide the smallest appropriate manual update instruction for the maintainer's environment, based on the Node installation/version-management method actually present on the machine if it can be determined safely.

Do not assume `nvm`, `fnm`, `Volta`, Chocolatey, winget, or a direct Node installer without inspecting the environment first.

Do not install a new version manager.

Do not uninstall Node.

---

## Verification under target Node 24

The goal is to run the full suite under the **same exact Node patch** that `.node-version` specifies.

Once the local runtime matches, run:

- `node --version`
- `npm --version`
- `npm run build`
- `npm run test`
- `npm run reference:test`
- `npm run test:components`
- `npm run lint`
- `git diff --check`

Also confirm:

- no `EBADENGINE` warnings;
- no Node maintenance/EOL warning locally;
- reference-data verification still passes;
- the post-build TypeScript stripping verifier still works under Node 24;
- no dependency or lockfile churn occurred solely because of the runtime pin.

If the local runtime does **not** match the target, do not describe checks run under another Node version as target-runtime validation.

---

## Dependency and lockfile constraints

Do not:

- upgrade dependencies;
- downgrade dependencies;
- change `jsdom`;
- change `undici`;
- regenerate `package-lock.json` unnecessarily;
- change npm versions merely for symmetry with Cloudflare;
- modify application source to accommodate Node 24 unless an actual incompatibility is discovered.

If a real Node 24 incompatibility appears, stop and report it rather than broadening the parcel.

The package lock should remain unchanged unless there is a technically necessary reason. Explain any lockfile change explicitly.

---

## Cloudflare constraints

Do not change Cloudflare dashboard settings.

Do not add or modify:

- `NODE_VERSION` environment variables;
- Pages build commands;
- branch deployment settings;
- DNS;
- redirects;
- security headers;
- HSTS;
- analytics;
- Access/Zero Trust.

Repository-level `.node-version` has already been proven to work with Cloudflare Pages and should remain the runtime selection mechanism.

After the maintainer later commits and pushes to `staging`, the expected Cloudflare proof is:

- Cloudflare detects the selected exact Node 24 patch;
- Node 22 is no longer installed;
- the previous `EBADENGINE` warnings remain absent;
- the Node 22 Maintenance/EOL warning is gone;
- build succeeds;
- staging deploy succeeds.

Codex does not need to deploy.

---

## Scope boundaries

Expected files are likely:

- `.node-version`
- `package.json`
- `docs/BACKLOG.md`
- possibly `docs/DEPLOYMENT.md` only if it contains stale Node 22 guidance

Do not change:

- application code;
- tests, unless an actual Node 24 compatibility defect is exposed and reported first;
- reference-data code;
- localization;
- CSP;
- routing;
- deployment workflow;
- Cloudflare project settings;
- dependency versions.

Keep the diff minimal.

---

## Failure conditions

Stop and report before broadening scope if:

- current Node 24 LTS release information is ambiguous;
- Cloudflare documentation appears to reject the selected Node 24 version;
- Node 24 causes build/test failures;
- target Node 24 cannot be installed or selected locally without changing the user's machine configuration;
- dependency or lockfile changes appear necessary;
- `.node-version` is ignored by local tooling in a way that materially affects verification.

Do not silently work around any of these.

---

## Expected completion state

The repository should express one clear runtime policy:

```text
.node-version      = exact Node 24 LTS patch
package.json       = Node >=24 <25
local Node         = same exact patch, if manually aligned
Cloudflare Pages   = same exact patch after staging push
```

Cloudflare verification remains a maintainer step after commit/push.

---

## Completion response

Return:

1. concise summary;
2. current branch;
3. current local Node version;
4. current local npm version;
5. selected exact Node 24 LTS version;
6. authoritative source used to select that version;
7. whether local Node already matches the target;
8. `.node-version` exact contents;
9. `package.json` `engines.node` value;
10. files changed;
11. whether `package-lock.json` changed;
12. whether any dependency version changed;
13. build/test/lint results;
14. whether those checks ran under the exact target Node version;
15. any manual local Node update still required;
16. documentation changes;
17. expected Cloudflare staging behavior after push;
18. confirmation no Cloudflare dashboard setting changed;
19. confirmation no application behavior changed;
20. confirmation no commit or push occurred.

If local Node does not match the target, clearly separate:

- repository implementation complete;
- local target-runtime verification pending.

Do not commit or push unless explicitly instructed.
