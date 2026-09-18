# Codex Implementation Brief — Align Node Version Across Repository and Cloudflare Pages

## Objective

Resolve the current Node engine mismatch in the Starfield Outpost Tracker’s build environment.

Cloudflare Pages currently builds with Node `22.16.0`, while current project dependencies declare newer Node requirements:

- `jsdom@30.0.1` requires `^22.22.2 || ^24.15.0 || >=26.0.0`
- `undici@8.10.2` requires `>=22.19.0`

The build currently succeeds, but npm emits `EBADENGINE` warnings because the Cloudflare build runtime is outside those declared supported ranges.

This parcel should establish an explicit repository-level Node 22 baseline that:

1. satisfies all current dependency engine requirements;
2. is visible in the repository;
3. is usable by Cloudflare Pages;
4. is documented consistently in `package.json`;
5. does not require a paid Cloudflare feature;
6. does not otherwise change application behavior.

Do not commit or push unless explicitly instructed.

## Branch and workflow

Work on `staging`.

Before changing anything:
- run `git status`;
- run `git branch --show-current`;
- ensure the branch is `staging`;
- ensure the working tree is clean or identify unrelated changes.

Do not work directly on `main`.
Do not commit or push.

## Current known state

Cloudflare Pages build logs currently show:
- Node.js `22.16.0`
- npm `10.9.2`

and emit `EBADENGINE` warnings for:
- `jsdom@30.0.1`
- `undici@8.10.2`

These warnings are non-blocking today, but the environment should be brought inside the declared supported range before it becomes a real incompatibility.

## Preferred solution

Prefer a repository-level Node version pin rather than a Cloudflare-only dashboard variable.

The intended shape is:
- root `.node-version`
- `package.json` `engines.node`

Cloudflare Pages supports selecting Node using repository version files such as `.node-version` / `.nvmrc`, while `package.json` engines should document the project requirement.

Do not rely on `package.json` engines alone to select Cloudflare’s runtime.
Do not add a Cloudflare dashboard-only `NODE_VERSION` variable unless repository-level pinning proves ineffective.

## Version selection

Before editing, inspect:
- current local Node version;
- any existing `.node-version`;
- any existing `.nvmrc`;
- any package-manager/runtime version declarations elsewhere in the repo;
- package-lock metadata if relevant;
- CI/development scripts that assume a specific Node major/minor.

Choose one Node 22.x version that:
- satisfies `jsdom@30.0.1`;
- satisfies `undici@8.10.2`;
- remains on Node 22;
- is appropriate for Cloudflare Pages;
- does not introduce unnecessary major-version churn.

Do not jump to Node 24/26 merely because dependency ranges permit it.

Avoid pinning only to the exact dependency minimum if a more appropriate current Node 22 release is already being used locally or is otherwise clearly preferable.

If a current local Node version already satisfies all requirements and is suitable for Cloudflare Pages, prefer aligning Cloudflare to that version.

## Required repository changes

### `.node-version`

Create or update root `.node-version`.

Contents should be exactly the selected Node version, for example:

```text
22.xx.x
```

Use an exact version, not a floating major such as `22`.
Keep the file minimal.

### `package.json`

Add or update:

```json
"engines": {
  "node": "..."
}
```

The engines range should:
- describe the supported Node 22 baseline;
- be consistent with the selected `.node-version`;
- exclude unsupported older Node 22 releases;
- avoid implying support for untested major versions.

A shape such as:

```json
"node": ">=22.22.2 <23"
```

is acceptable if it matches the chosen version and project intent.

If an exact-version engines declaration is more appropriate under current repo conventions, explain why.

Do not change package dependencies merely to avoid the warning.
Do not downgrade `jsdom` or `undici`.

## Do not change unless required

Do not modify:
- application code;
- reference-data logic;
- CSP;
- Cloudflare routing;
- DNS;
- Pages deployment branch controls;
- HSTS;
- analytics;
- package dependency versions;
- lockfile contents unless the chosen toolchain change genuinely requires it.

If no dependency install/update is performed, avoid unnecessary lockfile churn.

## Local verification

Run:
- `node --version`
- `npm --version`
- `npm run build`
- `npm run test`
- `npm run reference:test`
- `npm run test:components`
- `npm run lint`
- `git diff --check`

Also inspect whether any local `EBADENGINE` warnings remain under the selected Node version.

If the local environment is still running an older Node than the chosen `.node-version`, do not misrepresent local execution as validation under the target version. State clearly:
- current local runtime;
- selected target runtime;
- whether tests were run under the selected runtime or only under the currently installed runtime.

Do not change the user’s machine-level Node installation unless explicitly instructed.

## Cloudflare expectations

Do not manually edit Cloudflare settings in this parcel unless repository-level pinning is demonstrably ignored.

The expected staging verification after commit/push is:
- Cloudflare detects/installs the selected Node version from `.node-version`;
- build log no longer reports Node `22.16.0`;
- `EBADENGINE` warnings for `jsdom` and `undici` disappear;
- build succeeds normally.

Codex does not need to deploy manually.
Automatic staging deployment will occur after the maintainer commits/pushes.

## Documentation

Inspect whether the Node mismatch is currently recorded in:
- `docs/BACKLOG.md`
- `docs/DEPLOYMENT.md`

If it is already listed as non-blocking cleanup:
- update it to reflect the repository-level Node pin once implemented;
- do not duplicate the same item elsewhere unnecessarily.

If documentation already cleanly describes build-toolchain ownership, keep changes minimal.

Do not turn this small parcel into a broad hosting rewrite.

## Failure conditions

If Cloudflare Pages documentation or repository behavior indicates `.node-version` is not honored:
- stop;
- report the evidence;
- recommend the next-smallest alternative, likely `NODE_VERSION` as a build environment variable;
- do not silently make Cloudflare dashboard changes without explicit approval.

If the selected Node version causes test/build regressions:
- do not paper over them;
- report the incompatibility and affected commands;
- do not broaden into dependency-upgrade work without approval.

## Expected diff

Likely files:
- `.node-version`
- `package.json`
- possibly one durable documentation file if cleanup status needs updating

Avoid changes elsewhere.

## Verification after implementation

Before completion, confirm:
- selected Node version;
- `.node-version` exact contents;
- `package.json` engines declaration;
- no dependency downgrade;
- no unrelated configuration changes;
- test/build/lint results;
- current branch;
- `git diff --check`;
- no commit/push/deployment.

## Completion response

Return:
1. concise summary;
2. current branch;
3. current local Node/npm versions;
4. selected target Node version;
5. rationale for that exact version;
6. `.node-version` contents;
7. `package.json` engines value;
8. files changed;
9. whether lockfile changed;
10. whether any dependency versions changed;
11. build/test/lint results;
12. whether local checks ran under the target Node version;
13. documentation update, if any;
14. expected Cloudflare behavior after staging push;
15. confirmation no Cloudflare setting changed;
16. confirmation no application behavior changed;
17. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
