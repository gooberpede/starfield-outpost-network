# CODEX IMPLEMENTATION BRIEF — Version Management and Initial Beta Version

## Objective

Implement a small, explicit application-version management workflow and move the application from:

```text
0.0.0
```

to:

```text
0.9.0-beta.1
```

The purpose is to establish and test the versioning machinery **before** the formal `1.0.0-rc.1` release-candidate stage.

The versioning system must:

- keep `package.json` as the application-version source of truth;
- keep the root versions in `package-lock.json` synchronized automatically;
- preserve the existing Git-derived build identity;
- distinguish meaningful application-version checkpoints from ordinary commits;
- avoid requiring manual edits to package metadata for normal patch/minor/major releases;
- never create Git commits or tags automatically;
- support the agreed progression from beta → release candidate → stable release → patch/minor/major releases.

This task does **not** create a Git tag, GitHub Release, production release, or public repository transition.

---

## Agreed versioning model

Application version and build identity are separate.

Example:

```text
Application version: 0.9.0-beta.1
Build commit:        abc12345
```

Several commits may legitimately share one application version:

```text
0.9.0-beta.1 + commit aaaaaaaa
0.9.0-beta.1 + commit bbbbbbbb
0.9.0-beta.1 + commit cccccccc
```

The Git commit identifies the exact build between meaningful version checkpoints.

Do **not** automatically bump the application version on:

```text
every commit
every staging deployment
every bug fix
every documentation change
```

Application versions advance only when the maintainer deliberately runs a version command.

---

## Version progression

The first public-release progression is expected to look like:

```text
0.9.0-beta.1
0.9.0-beta.2
0.9.0-beta.3
...
1.0.0-rc.1
1.0.0-rc.2
...
1.0.0
1.0.1
1.0.2
1.1.0
2.0.0
```

Semantic intent after public release:

```text
PATCH  1.0.0 → 1.0.1
       backward-compatible bugfix/maintenance release

MINOR  1.0.1 → 1.1.0
       backward-compatible feature release

MAJOR  1.1.0 → 2.0.0
       breaking or major product-generation release
```

Do not make the script infer product significance. The maintainer chooses which command to run.

---

# 1. Baseline

Work from the current committed `staging` branch.

Before editing, record:

```text
branch
commit
tracked/untracked state
```

Read:

```text
AGENTS.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/DEPLOYMENT.md
README.md
package.json
package-lock.json
scripts/build-identity.ts
src/buildIdentity.ts
src/ui/components/AboutDialog.tsx
tests/buildIdentity.test.ts
```

Inspect any current release/version wording in `docs/BACKLOG.md` and release-readiness documents before updating durable guidance.

The current package and lockfile root versions are expected to be `0.0.0`.

---

# 2. Preserve the existing build-identity architecture

The existing architecture is already accepted:

```text
package.json version → human-facing application version
Git HEAD             → exact build commit
Git status           → clean / modified / unknown
```

`package.json` remains the version authority.

`scripts/build-identity.ts` currently verifies that:

```text
package.json version
package-lock.json top-level version
package-lock.json packages[""].version
```

all agree before building.

Preserve that fail-closed consistency check.

Do not:

```text
derive the application version from Git tags
derive version from commit count
derive version from dates
derive version from Cloudflare deployment IDs
expose arbitrary environment variables
remove dirty-build detection
weaken package/lockfile agreement
```

---

# 3. Initial version transition

As part of this implementation, change the application version to:

```text
0.9.0-beta.1
```

Update both:

```text
package.json
package-lock.json
```

using the new version-management mechanism where practical.

After the change, all package/lockfile version roots must agree exactly.

Do not create:

```text
v0.9.0-beta.1 tag
GitHub Release
commit automatically
```

The user will review, commit, and sync separately.

---

# 4. Version-management command design

Add a small repository-local version-management script.

Prefer a dependency-free Node script under `scripts/`, using the existing Node 24 environment.

Do not add a SemVer package merely for this task.

The script may use npm's own `npm version <target> --no-git-tag-version` mechanism after computing/validating the intended target, or may update package/lockfile metadata directly if the implementation is demonstrably safer and tested.

The important requirements are:

```text
one command updates all required version metadata
no Git tag
no Git commit
no push
clear validation
deterministic result
```

---

# 5. Required npm commands

Expose maintainer-facing commands in `package.json`.

Use clear names such as:

```text
npm run version:beta
npm run version:rc
npm run version:release
npm run version:patch
npm run version:minor
npm run version:major
```

The exact script plumbing may differ, but the behavior below is required.

---

# 6. `version:beta`

Purpose:

> Advance an existing beta train by one beta prerelease number.

Example:

```text
0.9.0-beta.1
→ npm run version:beta
→ 0.9.0-beta.2
```

and:

```text
0.9.0-beta.9
→ 0.9.0-beta.10
```

Do not silently change the core version.

If the current version is not an existing `*-beta.N` version, fail with a clear message rather than guessing what beta series the maintainer intended.

Starting a **new** beta train is deliberately not generalized by this task; the initial `0.9.0-beta.1` is established by this implementation.

A future product cycle can extend the command if needed.

---

# 7. `version:rc`

This command has two modes.

## Continue an existing RC train

Example:

```text
1.0.0-rc.1
→ npm run version:rc
→ 1.0.0-rc.2
```

## Start a new RC train

Require an explicit target stable version:

```text
npm run version:rc -- 1.0.0
```

From the current beta period this should produce:

```text
1.0.0-rc.1
```

This explicit target is intentional.

Do **not** make the tool guess that `0.9.0-beta.N` means `1.0.0-rc.1`.

Likewise, in a future cycle the maintainer could deliberately choose:

```text
npm run version:rc -- 1.2.0
```

and receive:

```text
1.2.0-rc.1
```

Validate the supplied target.

The target supplied to start an RC train must be a plain stable SemVer core:

```text
X.Y.Z
```

with no prerelease/build suffix.

Do not permit a target lower than or equal to an already released/stable core where that would obviously move versioning backwards. Keep validation proportional; do not build a release-history database.

---

# 8. `version:release`

Purpose:

> Promote the current prerelease to its stable core version.

Examples:

```text
1.0.0-rc.1
→ npm run version:release
→ 1.0.0
```

and, if ever deliberately used:

```text
0.9.0-beta.3
→ npm run version:release
→ 0.9.0
```

Do not assume only RC versions can be released.

If the current version is already stable, fail clearly rather than silently doing nothing.

No tag is created.

---

# 9. Stable release increment commands

These commands are for **stable versions**.

## Patch

```text
1.0.0
→ npm run version:patch
→ 1.0.1
```

## Minor

```text
1.0.1
→ npm run version:minor
→ 1.1.0
```

Reset patch to zero as normal SemVer behavior requires.

## Major

```text
1.1.0
→ npm run version:major
→ 2.0.0
```

Reset minor and patch to zero.

For this first implementation, require the current version to be stable before running:

```text
version:patch
version:minor
version:major
```

If run from a beta/RC prerelease, fail with a clear instruction to use the appropriate prerelease/release workflow first.

This avoids surprising transitions.

---

# 10. SemVer validation

The workflow only needs the project's chosen subset of SemVer:

```text
X.Y.Z
X.Y.Z-beta.N
X.Y.Z-rc.N
```

where:

```text
X, Y, Z, N are non-negative decimal integers
N for beta/rc is >= 1
no leading sign
no whitespace
```

Do not overengineer support for arbitrary SemVer build metadata or custom prerelease labels unless npm's own mechanism provides it automatically without complicating the project-owned workflow.

Reject malformed or unsupported current versions with a clear error.

The script must not partially update files after validation failure.

---

# 11. Git behavior — critical

Version commands must **not**:

```text
create commits
create lightweight tags
create annotated tags
push
change branches
publish npm packages
create GitHub Releases
```

If npm's `npm version` command is used internally, invoke it with behavior equivalent to:

```text
--no-git-tag-version
```

and ensure no hidden lifecycle behavior creates repository mutations beyond the intended package metadata.

The user's normal workflow remains:

```text
run version command
review diff
run tests/build
commit manually
sync manually
```

---

# 12. Git tags remain release-operation metadata

Do not create tag-management automation in this task.

The intended later public-release convention is:

```text
v1.0.0
v1.0.1
v1.1.0
```

A release tag is a durable pointer to the exact released commit.

Formal RC tags such as:

```text
v1.0.0-rc.1
```

may be considered later, but are **not required or authorized now**.

Beta builds are not expected to be tagged.

Published release tags must never be silently moved to another commit.

Document this boundary briefly where maintainers need it, but do not build tag operations into the version script.

---

# 13. Build identity / About behavior

The existing About dialog already displays:

```text
Version <application version>
Build <short commit>
```

Preserve this.

After this implementation, a clean staging build should be able to show conceptually:

```text
Version 0.9.0-beta.1
Build 12345678
```

Do not hard-code the displayed version in React/localization code.

It must continue to come from build identity/package metadata.

Preserve:

```text
clean/modified/unknown status
source URL only for a clean verified checkout
short displayed commit
full commit for source correspondence internally
```

No new localization strings should be required merely because the version value changed.

---

# 14. Dirty local builds

Before the version bump is committed, the working tree will naturally be modified.

The existing build identity may therefore display a modified build locally.

That is correct.

Do not try to suppress dirty status merely because a version command changed package metadata.

After the user commits and staging builds that commit, the deployed candidate should report a clean build identity.

---

# 15. Tests for version transitions

Add focused automated tests for the version-transition logic.

At minimum cover:

```text
beta.1 → beta.2
beta.9 → beta.10
beta command rejects stable current version
beta command rejects rc current version

rc.1 → rc.2
start rc with explicit 1.0.0 target → 1.0.0-rc.1
starting rc without target from beta fails
malformed rc target fails

rc → release strips prerelease
beta → release strips prerelease
release command rejects already-stable version

1.0.0 patch → 1.0.1
1.0.1 minor → 1.1.0
1.1.0 major → 2.0.0

patch/minor/major reject prerelease current versions
malformed/unsupported current versions fail
```

Also verify that the actual package update mechanism keeps:

```text
package.json version
package-lock.json version
package-lock.json packages[""].version
```

synchronized.

Use temporary files/directories for mutation tests rather than rewriting the working repository during tests.

---

# 16. Preserve build-identity tests

Update existing version-specific fixtures in `tests/buildIdentity.test.ts` only where necessary.

Do not weaken the intent of those tests.

The build identity must still:

```text
prefer verified Git checkout evidence
never claim pristine source for a dirty checkout
treat environment-only commit identity as unverified
expose only allowlisted metadata
fail when package and lockfile versions disagree
```

Tests may continue using synthetic version strings where the test is explicitly exercising allowlisting/escaping rather than production version validity, unless the new versioning code makes a narrowly justified change necessary.

---

# 17. Documentation

Update durable maintainer documentation with the agreed workflow.

At minimum consider:

```text
README.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/DEPLOYMENT.md
```

Avoid duplicating a long versioning manual in several places.

Prefer one owner document for detailed maintainer commands, with concise references elsewhere.

Document:

```text
package.json is version authority
build commit is separate identity
ordinary commits do not bump app version
beta/RC/stable command usage
0.9.0-beta.1 current pre-RC line
1.0.0-rc.1 later formal candidate
stable patch/minor/major meanings
commands do not commit/tag/push
public release tags are separate deliberate operations
```

Reconcile stale text that currently says preparation remains `0.0.0`.

Do not rewrite dated audits merely because their historical baseline was `0.0.0`.

Do not introduce temporary task numbering into unrelated durable documents.

---

# 18. Backlog/release status

Inspect `docs/BACKLOG.md`.

If versioning/build identity is still recorded as an open release gate or pending implementation, reconcile it accurately.

Do not mark the **final release-candidate acceptance** complete.

At the end of this batch:

```text
version-management machinery → implemented
initial beta identity → 0.9.0-beta.1
formal 1.0.0-rc.1 cut → still future
release candidate acceptance → still future
v1.0.0 tag/release → still future
```

---

# 19. No automatic prerelease bump on staging

Do not hook version increments into:

```text
Cloudflare build
Vite build
npm run build
Git hooks
push
staging deployment
CI
```

A rebuild of the same commit must produce the same application version/build identity.

Version changes are deliberate maintainer actions.

---

# 20. No dependency changes

Do not add a SemVer/versioning dependency unless the task proves impossible without one.

The required version grammar is deliberately small enough for a narrow project-owned helper or npm's built-in version handling.

Do not introduce release-management frameworks, changelog generators, Changesets, semantic-release, release-it, or similar tooling in this batch.

Those are disproportionate to the current workflow.

---

# 21. Required automated verification

Run:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run build
npm run lint
git diff --check
```

Also run focused version-management/build-identity tests separately and report their result.

If normal `npm run lint` is still blocked only by the known ignored `.local-work/reference-overlay-prototype` multi-TSConfig-root issue:

1. report the exact known limitation;
2. use the established clean checkout-shaped lint verification if practical;
3. do not alter the ignored prototype as part of version management.

---

# 22. Safe command verification

The implementation report must demonstrate the version-management commands without leaving the working repository at an unintended version.

Use temporary fixture repositories/directories or pure transition tests to demonstrate:

```text
version:beta
version:rc
version:release
version:patch
version:minor
version:major
```

Do **not** run a sequence against the real checkout that changes it beyond the required final:

```text
0.9.0-beta.1
```

The final working-tree version for this batch must remain exactly:

```text
0.9.0-beta.1
```

---

# 23. Manual staging acceptance after commit/sync

After user review, commit, and sync, staging will deploy automatically.

Provide this manual checklist.

## A. About identity

Open About and verify:

```text
Version 0.9.0-beta.1
Build <short staging commit>
```

The displayed short commit must match the deployed staging commit.

The build should not be marked modified/unknown when the normal Cloudflare build has a verified clean Git checkout.

## B. Source correspondence

If the exact-build source link is shown:

```text
it points to the correct full GitHub commit
```

If the repository is still private and the viewer is authenticated, access behavior may reflect repository visibility; do not treat that as an identity failure.

## C. Reload

Reload staging and confirm the version/build identity remains unchanged.

## D. No application regression

A normal startup and a simple existing network interaction should continue to work.

No exhaustive product regression pass is required solely for the version bump.

---

# 24. Relationship to Apple/Safari/WebKit testing

This batch deliberately occurs **before** the optional Apple/Safari/WebKit session.

Once `0.9.0-beta.1` is accepted on staging, Apple testing should record:

```text
application version
exact build commit
device
OS/Safari version
```

If Apple testing finds a defect and code changes are made, the exact Git build still distinguishes the changed staging state even if the app version remains `0.9.0-beta.1`.

A later deliberate checkpoint may advance:

```text
0.9.0-beta.1 → 0.9.0-beta.2
```

The formal release-candidate acceptance pass should begin only after deliberately moving to:

```text
1.0.0-rc.1
```

---

# 25. Success criteria

This implementation is complete when:

- package/version metadata is `0.9.0-beta.1`;
- package and lockfile root versions agree;
- version management commands exist and are documented;
- beta increments existing beta sequence;
- RC continuation increments existing RC sequence;
- starting a new RC line requires an explicit stable target;
- release strips a prerelease suffix;
- patch/minor/major work from stable versions;
- invalid/ambiguous transitions fail clearly;
- no version command commits, tags, pushes, or publishes;
- existing build identity remains accurate;
- About derives the version rather than hard-coding it;
- focused transition/package-sync tests pass;
- full required verification passes subject only to the known isolated lint-worktree issue;
- staging manually shows `0.9.0-beta.1` and the correct build commit after user commit/sync.

---

# 26. Non-goals

Do not:

```text
create Git tags
create GitHub Releases
publish repository
deploy production
change Cloudflare settings
auto-bump on commit/build/deploy
generate changelogs
add release automation frameworks
change save/reference schema versions
change reference dataset identity
change user-visible application behavior beyond version value
start 1.0.0-rc.1 yet
change indexing
```

Application version remains independent of:

```text
collection schema version
network schema version
reference dataset ID
locale/provenance versions
```

---

# 27. Completion report

Report:

1. baseline branch/commit;
2. files changed;
3. final application version;
4. version command implementation;
5. exact semantics of each command;
6. package/lockfile synchronization mechanism;
7. confirmation no command creates commits/tags/pushes;
8. build-identity behavior preserved;
9. tests added;
10. focused version-test results;
11. full verification results;
12. lint status and known prototype limitation if applicable;
13. durable documentation updated;
14. manual staging checklist;
15. any limitations or intentionally deferred versioning behavior;
16. confirmation no tag/release/deployment/publication/remote operation occurred.

Suggested commit message:

```text
build: add application version management
```
