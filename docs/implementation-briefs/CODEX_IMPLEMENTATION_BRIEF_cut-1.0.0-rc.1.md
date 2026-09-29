# CODEX IMPLEMENTATION BRIEF — Cut `1.0.0-rc.1`

## Objective

Create the first formal release candidate for Starfield Outpost Network:

```text
1.0.0-rc.1
```

This is the first task in the release phase.

The pre-release implementation phase is now closed. This task must **not** include product polish, feature work, refactoring, documentation cleanup, dependency updates, deployment changes, publication changes, tags, or launch operations.

The release candidate cut is deliberately narrow:

1. verify the working baseline;
2. advance application version metadata from `0.9.0-beta.1` to `1.0.0-rc.1` using the repository's existing version tooling;
3. verify the exact resulting diff;
4. run the full candidate verification suite;
5. report the candidate state for maintainer review.

Do **not** commit, push, tag, publish, deploy, or change repository visibility.

## 1. Read first

Read:

```text
AGENTS.md
docs/CODE-STYLE.md
README.md
docs/DEPLOYMENT.md
scripts/version-management.ts
package.json
package-lock.json
```

Also inspect any current release workflow documentation referenced by those files if needed to understand the existing version/build identity contract.

Do not modify the supplied implementation brief.

## 2. Baseline capture

Before changing anything, record:

```text
branch
HEAD commit
git status --short
current package.json version
current package-lock.json root version
current package-lock.json packages[""].version
Node version
npm version
```

Expected starting application version:

```text
0.9.0-beta.1
```

The three package/lockfile version values must agree before proceeding.

If they do not agree, stop and report rather than repairing them ad hoc.

If there are unexpected tracked changes, stop and report.

Known untracked/local-only implementation briefs or ignored `.local-work/` material are not themselves release defects, but record anything present clearly.

## 3. Use the existing version command

Run exactly:

```sh
npm run version:rc -- 1.0.0
```

Expected result:

```text
Application version 0.9.0-beta.1 -> 1.0.0-rc.1
```

Do not edit version fields manually unless the command fails because of a concrete tooling defect. If it fails, stop and report the error; do not work around it silently.

## 4. Expected metadata changes

After the command, exactly these version values should become:

```text
package.json
  version = 1.0.0-rc.1

package-lock.json
  version = 1.0.0-rc.1

package-lock.json
  packages[""].version = 1.0.0-rc.1
```

No dependency versions, lockfile package entries, scripts, licence metadata, package name, engine requirements, or npm privacy settings should change.

The version command is expected to rewrite JSON formatting only as already defined by the repository tooling. If it causes unrelated package/lockfile churn, stop and investigate before continuing.

## 5. Diff review before tests

Immediately inspect:

```sh
git diff -- package.json package-lock.json
git diff --stat
git status --short
```

Confirm:

```text
only package.json and package-lock.json are tracked modifications
the only semantic change is 0.9.0-beta.1 -> 1.0.0-rc.1
no dependency graph changed
no source, reference, localization, test, CSS, docs, config, deployment, or generated runtime data changed
```

If anything else changed, stop and report it.

## 6. Candidate verification suite

Run on the versioned working tree:

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

Use the normal working tree. `.local-work/` is now intentionally ignored by ESLint, so no clean-checkout lint workaround should be necessary.

Record actual test counts and any advisories.

The existing Vite large-chunk advisory is acceptable if unchanged and non-failing.

Do not regenerate installed-game provenance or any maintainer-only game-derived inputs.

## 7. Verify built application identity

After the successful build, verify that the generated application metadata represents:

```text
application version: 1.0.0-rc.1
```

Use the repository's existing release/build identity verification path where available.

At minimum, inspect the generated build output or existing verification script/test in a way that demonstrates the built app is receiving `1.0.0-rc.1` from package metadata.

Do not fabricate a clean Git identity from the modified working tree. Before commit, the build may correctly identify itself as modified; that is expected.

The RC version and Git build identity are separate concepts.

## 8. Version-tool regression check

The repository already has version-management tests. Confirm the normal test suite covers the transition, or run the focused version-management test if it exists separately.

Specifically confirm the supported transition remains:

```text
0.9.0-beta.1
    ->
npm run version:rc -- 1.0.0
    ->
1.0.0-rc.1
```

Do not add new tests merely because this transition is being executed if existing tests already cover it.

## 9. No tag yet

Do **not** create:

```text
v1.0.0-rc.1
```

or any other tag in this task.

Tagging is a separate release operation and has not yet been authorized.

Likewise do not create a GitHub Release.

## 10. No deployment or publication operation

Do not:

```text
push
deploy
promote staging to production
change Cloudflare configuration
change DNS
configure www.starfieldoutposts.com
change indexing
make the repository public
change Issues settings
change branch protection/settings
publish npm artifacts
```

The staging deployment will occur only after the maintainer reviews this diff, commits it, and syncs it.

The `www.starfieldoutposts.com` -> apex redirect is a later launch-operation item and is explicitly out of scope for this RC version cut.

## 11. Candidate freeze rule

Do not implement any newly noticed polish while working on this task.

If verification exposes a genuine release defect:

1. record it;
2. stop the RC-cut task if it prevents a trustworthy candidate;
3. do not fix it opportunistically inside this version-only diff.

Once the RC commit is later accepted and synced, further source changes should occur only for demonstrated release defects, and any changed candidate must be re-versioned/retested as appropriate.

## 12. Documentation scope

Do not update README or release documentation merely to replace phrases such as “future RC” during this task.

The RC cut should remain a version-metadata-only implementation.

Release-state/runbook documentation can be reconciled separately against the exact committed candidate after it exists.

If some automated test unexpectedly requires a documentation version change, stop and report rather than broadening scope.

## 13. Required final diff state

Before reporting completion:

```sh
git status --short
git diff --check
git diff -- package.json package-lock.json
```

The intended tracked diff is exactly:

```text
package.json
package-lock.json
```

with only the version transition:

```text
0.9.0-beta.1
->
1.0.0-rc.1
```

No commit should exist yet.

## 14. Completion report

Report:

1. branch;
2. baseline HEAD;
3. initial working-tree state;
4. previous version;
5. command run;
6. resulting version;
7. exact changed files;
8. confirmation lockfile root versions agree;
9. `npm test` result/count;
10. `npm run test:components` result/count;
11. `npm run typecheck:tests`;
12. `npm run localization:verify`;
13. `npm run localization:terminology:verify`;
14. `npm run localization:provenance:verify`;
15. `npm run reference:test` result/count;
16. `npm run build`;
17. `npm run lint`;
18. `git diff --check`;
19. built application version verification;
20. any unchanged advisory;
21. confirmation no tag/commit/push/deploy/publication/DNS/indexing action occurred.

Suggested commit message after maintainer review:

```text
release: cut 1.0.0-rc.1
```

## Acceptance condition

The RC cut is ready for maintainer review only if:

```text
version == 1.0.0-rc.1
only package.json + package-lock.json changed
all required verification passes
built app receives 1.0.0-rc.1
no release operations beyond local metadata/version verification occurred
```
