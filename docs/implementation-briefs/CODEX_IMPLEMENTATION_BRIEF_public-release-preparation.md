# CODEX IMPLEMENTATION BRIEF — Public Release Preparation

## Objective and authorization boundary

Prepare Starfield Outpost Network for its first public release by implementing the agreed licensing notices, application/build identity, localized About content, support links, and associated repository-documentation cleanup.

This is **preparation, not publication or release-candidate acceptance**. It does not authorize making the repository public, committing, pushing, creating tags/releases/branches, deploying, changing indexing or Cloudflare settings, rewriting history, contacting a third party, sending messages, or modifying Ko-Fi.

Implement one coherent, reviewable change on the current `staging` checkout. Keep unrelated work and the ignored overlay prototype untouched. Do not finish optional polish merely because it appears in the release audit.

The primary audit is `docs/audits/RELEASE-READINESS-REVIEW.md`. Its outstanding-choice statements are superseded by the explicit decisions below. Its historical findings and evidence limits remain valid unless newer evidence contradicts them.

## Settled user decisions

| Concern | Approved direction |
| --- | --- |
| Publication | Prepare the **existing repository with its existing development history** for later public release. No replacement repository or history filtering. |
| Project code licence | **GPL-3.0-or-later**, not GPL-3.0-only, AGPL, LGPL, or a noncommercial licence. |
| Public copyright attribution | **Gooberpede**. Use the supported preparation/release year, currently 2026. Preserve other authors' existing notices. |
| Favicon | **Retain the existing favicon and its historical versions**, with accurate attribution and a clearly documented separate-licence boundary. No request to Flaticon, replacement, deletion, or history rewrite. |
| Other starter assets | Remove from the **current tree only** when actual non-use is established; preserve history. |
| First public application version | **1.0.0**. |
| Release-candidate version | **1.0.0-rc.1**, introduced at the later deliberate candidate-testing gate, not automatically during this preparation. |
| Version source/display | `package.json`, consistent lockfile root; About shows application version and short build commit. |
| Release tags | `v<version>`, including `v1.0.0` for the first public release; document, do not create. |
| Ordinary support | GitHub Issues for reproducible bugs and feature suggestions. |
| Private/alternative support | `support@starfieldoutposts.com`; delivery and replies have already been tested by the user. No further test email is needed. |
| Funding destination | `https://ko-fi.com/gooberpede`, described as voluntary support for the developer's Bethesda modding/tools work. |
| Funding policy | Released projects are free to use. Tips or memberships do not purchase extra features, exclusives, access, priority support, or delivery commitments. This is the developer's offering, not an additional restriction on GPL recipients. |
| Ko-Fi readiness | Page presentation and any membership tier/price are a **separate pre-launch task**. The exact destination and funding policy are sufficient to prepare the app link. |
| History/document archives | Retain useful briefs, audits and benchmarks. Bulk packaging/archiving is separate; no moves or ZIP conversions in this change. Historical XLIFF handoffs are not sensitive and need not be restored to an active workflow. |

Do not reopen these decisions simply because the dated audit asked the user to make them. A genuinely new, material conflict should be reported precisely and independently of already settled questions.

## Baseline and sources

At brief preparation, the GitHub `staging` read returned:

`9b0c37e9d039063c58c2bff3a4d1d130760539e3`

Record the actual starting commit and worktree state. Do not reset to that snapshot or assume it is the deployed production commit. The supplied release-readiness audit may be available locally without yet appearing at the remote tip; read the actual supplied/local report and preserve its existing state.

Read before editing:

```text
AGENTS.md
README.md
package.json and package-lock.json
vite.config.ts and relevant TypeScript configuration
THIRD-PARTY-NOTICE.md
index.html and tracked static-asset inventory

docs/audits/RELEASE-READINESS-REVIEW.md
docs/THIRD-PARTY-REFERENCES.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/DEPLOYMENT.md
docs/BACKLOG.md
docs/localization/LOCALE-ONBOARDING.md

src/ui/components/AboutDialog.tsx
src/ui/components/AboutDialog.css
src/ui/components/useModalDialog.*
src/ui/components/ReferenceFatalState.tsx
src/localization/ and relevant localization tooling/tests
```

Read other sources only where a concrete implementation or notice requires them. This is not a second whole-product legal/security audit. Distinguish user decisions, certificate evidence, repository observations, external terms, and implementation judgments.

## Application version and build identity

Implement the wiring now, without declaring a release.

- Keep the current development version during preparation. The reviewed baseline is `0.0.0`; do not bump it to `1.0.0` or `1.0.0-rc.1` in this task, and do not invent another prerelease number. If the local version has independently advanced, inspect the approved change rather than downgrade it.
- Read the version from `package.json` at build time, not from a second hard-coded UI constant. Keep root lockfile metadata consistent when modifying package metadata. Retain `private: true`; GitHub publication is not npm publication.
- Document the later sequence: ready for candidate testing → `1.0.0-rc.1`; accepted launch candidate → `1.0.0`; tag/release actions remain separately authorized. If code changes during candidate testing, identify the new candidate rather than silently treating old acceptance as applying to it.
- Document a concise SemVer-based convention for future releases. Do not promise that internal component APIs are public contracts or tie every app version change to a save-schema change.

Add a small typed build-identity module using the existing Vite/build path. Cloudflare documents `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH` as build inputs [C]. Prefer a validated full commit from the actual build checkout/environment; use local Git metadata when appropriate. Test precedence, invalid/missing metadata, clean builds, and local modified builds.

About should show the version plus a short commit when known. Retain the full commit in the build metadata for precise source links/support. Do not bake in the preparation SHA above. A local modified checkout must not masquerade as the pristine committed build; use a clear local/modified indication. A source archive without Git metadata must still build and display an honest local/unknown identity.

Only expose explicitly allowlisted non-secret values. Do not embed environment dumps, local paths, account details, machine names, tokens, or full package metadata in the browser. Do not use runtime GitHub calls, analytics, or nondeterministic timestamps to identify a build. Reuse existing platform facilities rather than adding a release framework or dependency.

Keep app version/build identity separate from collection/network schema versions, reference dataset hashes, source-game versions and locale IDs. No save migration is authorized.

## Apply GPL-3.0-or-later with a clear scope

Add the complete, unmodified official GNU GPL version 3 text in root `LICENSE` (or preserve an existing equivalent if the checkout has advanced). Fetch/verify the actual text from GNU; do not reconstruct or paraphrase the licence itself [A, B].

Use a clear project notice identifying Gooberpede and **version 3 or any later version**. The stock GPLv3 text alone is not the project's choice of the later-version option. Set package licence metadata consistently to `GPL-3.0-or-later`, preserving dependency resolution and npm privacy.

Define the scope as project-authored application/build/test code for which the project holds the relevant rights. Do not blindly apply Gooberpede's copyright or GPL identifiers to favicon artwork, third-party code/notices, official game text, or generated game-derived data. Preserve upstream component licences and notices; do not describe integrated third-party software as exempt from all combined-work obligations merely because its original licence differs.

Prefer a clear root licensing section and precise third-party ledger over a repository-wide header rewrite. Short copyright/SPDX notices may be added to directly touched project-authored source files. Preserve existing Purpose/Architecture comments, upstream attribution, and generated-file conventions. Do not stamp hundreds of historical or generated files speculatively.

Do not modify GPL text, create a bespoke restrictive GPL exception, add a noncommercial condition, require donations, prohibit compliant forks, or require contributions to be sent upstream. The favicon is **separately licensed artwork excluded from this project's GPL grant**, not GPL artwork with rights removed.

Provide access to the licence and applicable shipped third-party notices from the built application. Prefer lightweight static legal-text outputs derived from authoritative repository files, with About links. Do not bundle the full legal texts into JavaScript or fetch them at startup. Verify the files are actually emitted, non-empty, readable, and consistent with their sources; avoid manually maintained duplicate copies.

Document how a public release will provide corresponding source for its exact deployed commit, including build scripts and lockfile, through the existing repository. A clean build's commit/source link may use the full verified SHA; a dirty/unknown build must not advertise an exact pristine source correspondence. Do not treat a private link as publicly accessible or create a tag to make the link work. Public source availability is verified at the later launch gate, before the GPL-labelled public release is promoted.

## Favicon: implement the chosen separate-licence treatment

The user has explicitly chosen retention with a separate-licence notice after discussing the interpretation and practical uncertainty. Implement that choice without claiming it is special Flaticon permission or a legal clearance. Lack of a bespoke permission letter is **not a new stop condition for this implementation**.

Supplied certificate evidence, sufficient for this bounded notice work:

- Source document: `license-251033545.pdf`, supplied by the user.
- Download date: **23 September 2026**.
- Asset description: **Space exploration**.
- Author: **gravisio**.
- Licence type: **Free for commercial use WITH ATTRIBUTION** under the standard Flaticon terms.
- Web credit specified by the certificate: **“designed by gravisio from Flaticon”**, presented as a visible link.
- The certificate permits website/software/application use and modification, while separately restricting sublicensing/distribution/download offerings; it says the full Flaticon terms prevail. Do not characterize it as an open-source asset licence.

Inventory the actual favicon files, derivatives, and identifiable historical paths in this repository. Use real paths, not guessed IDs. Update `THIRD-PARTY-NOTICE.md` with the author, asset description, licence/source references, required credit and clear exclusion of those assets—including historical versions—from the project-authored-code GPL grant.

Keep attribution visible in About. Use the certificate's credit wording rather than silently replacing it with a vague “icons by” label. Brand/author names and the prescribed credit may remain invariant; surrounding UI headings must be localized. Retain the existing verified source/category URL where an exact item URL is unavailable, and identify it honestly as a category link rather than inventing an asset-specific source URL.

Do not publish the original certificate automatically: it contains a licensee identifier and an embedded asset image. Preserve the supplied file unchanged as owner evidence; use a non-personal textual provenance summary for public notices. Do not copy the licensee identifier, unrelated Gmail address, or local paths into public documentation.

No favicon removal, replacement, redrawing, history filtering, contact with Flaticon, or renewed enforcement-risk investigation is authorized. Do not promise that downstream users receive rights broader than the asset licence. Record retention as the owner's chosen separate-licence arrangement, not a rightsholder endorsement.

## Other third-party material and unused assets

Reconcile the existing notice and `docs/THIRD-PARTY-REFERENCES.md`, rather than creating a competing collection of legal ledgers.

For material actually shipped or deliberately published, record its role, real source, applicable licence/notice evidence, where it is distributed, and any specific unresolved disposition. Keep software dependencies, external fonts, development tools, game-derived data and artwork distinct.

- Preserve actual notices for shipped dependencies. Inspect installed/source licence files and emitted notices where necessary; do not substitute a package licence name for a required full notice. Do not add every dev dependency to About or assume every lockfile package enters the app bundle.
- External Google Fonts remain accepted. Record current provenance without downloading/self-hosting font binaries or changing CSP.
- Distinguish project-authored extraction/generation code from canonical game-derived records, official names and generated overlays. Correct obsolete future-tense provenance descriptions. Do not automatically relicense that content, claim rightsholder approval, or reach an unsupported new infringement conclusion.
- Update development/translation-tool roles from demonstrated project evidence. Do not invent account plans, contract terms, native reviews, copied code, or tool-attribution obligations. A tool being used is not proof that its implementation was copied.

If a non-favicon distribution question remains unanswered, record the exact item and evidence needed for later publication sign-off. Continue independent preparation. Do not turn an unresolved ledger entry into a blanket legal certification or reopen the entire audit. No third-party contact or paid service is authorized.

The audit's candidate unused assets include `src/assets/hero.png`, React/Vite SVGs and `public/icons.svg`. Verify current imports, HTML/CSS references, scripts and build output before deleting anything. Remove only confirmed unused files from the current tree; keep historical versions and their relevant provenance. Never use this as permission to delete the favicon, active imagery, fixtures, or reference datasets. Record the removed file list and verify the runtime no longer emits unwanted starter assets.

## About dialog: required content and exact destinations

Keep the established application name **Starfield Outpost Network** and existing concise description. Do not rebrand the product.

Extend the current modal with compact, readable content covering:

- application version and short build identity;
- public copyright attribution and a concise GPLv3-or-later/no-warranty statement with access to the full licence and third-party notices;
- **Source repository:** `https://github.com/gooberpede/starfield-outpost-network`;
- **Bugs and suggestions:** `https://github.com/gooberpede/starfield-outpost-network/issues`;
- **Private/alternative contact:** `mailto:support@starfieldoutposts.com`;
- **Support Gooberpede:** `https://ko-fi.com/gooberpede`;
- required favicon credit;
- the existing independent/unofficial, not-endorsed-by-Bethesda-or-Microsoft meaning;
- a brief local-save/export reminder, with the fuller explanation in README.

Keep source browsing, bug reporting, email and voluntary funding distinguishable. A plain text link is sufficient for Ko-Fi: no widget, tracking script, iframe, payment form, logo asset or account integration. Do not open issues, send mail or make a test payment to verify links.

Funding copy should communicate support for the developer rather than purchase of the app, exclusive features or support priority. Do not add a tier name, price, reward, membership schedule or claim the Ko-Fi page has passed readiness review. Do not impose this project's free-of-charge offering as a downstream GPL restriction.

The public support mailbox is sufficient. Do not expose its forwarding destination in About/README. Do not change the fatal-state email route or its diagnostic payload as incidental support work.

Use a compact layout consistent with existing visual language, with wrapping for long labels and sensible modal-local scrolling when needed. Prefer a few grouped rows over a large marketing/legal page. Extra content must not alter the underlying workspace, page chrome, Matrix widths or Cargo layout.

Preserve `useModalDialog` behavior: focus on open, Tab/Shift+Tab containment, Escape/Close, backdrop behavior and restoration via the existing focus/reveal contract. Keep every link and Close control reachable at true 200% zoom. Do not make the whole expanded legal/link list a repeatedly announced dialog description; retain a concise descriptive association and individually discoverable links.

Use meaningful localized link text, semantic anchors, established external-link isolation and visible focus. Do not rely on hover-only text, color-only identification, or a title attribute as the sole accessible name. Preserve forced-colors behavior.

## Localization and copy governance

Localize new application-owned About/support/version/build/status labels and explanatory copy across:

```text
en-US, en-GB, fr-FR, de-DE, it-IT, ja-JP, pl-PL, pt-BR, zh-Hans, es-ES
```

Keep `en-GB` a sparse override. Preserve exact full-catalogue key/placeholder guarantees, current locale resolution and compact-display behavior. Use the existing authoritative edit/review/generation workflow and update durable catalogue-review evidence only where that workflow actually requires it. Do not create paid translation jobs or revive historical XLIFF handoffs.

Values such as URLs, email, Gooberpede, commit hashes, version strings and GPL identifiers are stable data, not translated identities. Prescribed third-party credit and the authoritative licence text must not be altered by a translation pass. User-facing descriptions should explain the licence/funding boundaries accurately without pretending to be translated replacement legal terms.

Do not change official reference names, IDs, overlays, domain messages or unrelated accepted translations. Mark the provenance of new copy honestly; absence of native review is not automatically a release blocker.

## Support and README preparation

Prefer a clear README support section over a new support platform or policy suite. Separate public bugs/suggestions from private reports. Request version/build, browser/OS, locale, concise reproduction steps and expected/actual behavior. Prefer a small synthetic example; do not ask for public uploads of real saved networks, credentials or personal data by default.

Document that response times, feature implementation, fluent support in every language, and contribution acceptance are not promised. Do not add a CLA, bounty, paid-support commitment, Discord, subreddit, forum, ticket system or automatic issue-submission feature. GitHub settings remain untouched; any unavailable public Issues route is a later owner/publication check, not an instruction to change repository settings now.

Bring README into line with current capabilities and the chosen licence/support/version convention. Replace the old US/UK-only localization claim and obsolete localization-work-sequence descriptions. Document the verified Node/npm prerequisites, `npm ci`, development, test and production-build commands. Distinguish an ordinary checkout build using committed generated inputs from optional maintainer regeneration requiring legally obtained local game inputs. Do not imply users must install the game to build the website.

State clearly that networks are saved in this browser profile on this origin, with no account sync/server backup. Export before moving browsers/devices or clearing browser data; import replaces the collection; saving failures warrant exporting in-memory work. Avoid promising universal re-import of unusually large/modded/outlier data. Explain existing limitations without implementing new caps, backup reminders or recovery UI.

Describe desktop-oriented use and tested platform limitations accurately. No blanket Apple/VoiceOver certification or phone-optimized support promise.

## History preservation and current-document reconciliation

Leave historical briefs, audits and benchmarks at their existing paths. Do not package archives, rewrite historical findings, remove historical XLIFF copies, or sanitize Git history in this change. Where useful, add a short current/historical distinction or a link to the owning current document. Remove leaked temporary parcel/step references from **current guidance being reconciled**, not all historical records indiscriminately.

Update only affected current documents, including README, the notice/third-party ledger, relevant architecture/workflow/UX sections, Deployment and Backlog. A short appended disposition in the release-readiness report is acceptable; retain the dated findings rather than replacing them with hindsight.

Carry forward these supplied status updates accurately:

- Mailbox delivery/reply workflow is user-verified; source presence is no longer the only evidence.
- Ko-Fi destination is settled; its page readiness remains separate and pending.
- Publication method, GPL qualifier, Gooberpede attribution and first-release/candidate convention are settled.
- The favicon is retained under the agreed separate-licence treatment; do not leave a current instruction to replace it or seek permission as though that were still the plan.
- HSTS at `max-age=2592000` was user-verified on staging and production, with neither subdomains nor preload; a reminder already exists. Correct stale pending prose, not headers or dates unsupported by evidence.
- iPhone 12/Safari basic production workflows passed in user testing; the blank-page symptom was not reproduced. Retain the specific Japanese X-Tech overflow and unconfirmed Cargo compression observations without claiming comprehensive Apple coverage.
- The overlay prototype remains paused/post-release. Only `staging` automatically deploys previews under the current policy; a new experiment branch is not an automatic preview route. Preserve prototype measurements and code.
- Closed UI fixes stay closed. Optional Sol/name/token/caching/Apple tasks keep their agreed priorities and are not implemented here.

Distinguish **decision settled**, **implementation prepared**, **manual acceptance pending**, **publication sign-off pending**, and **launch operation not performed**. Do not close all release gates simply because About links and licence files now exist.

## Explicit exclusions

Do not perform or implement:

```text
repository publication or settings changes; Issues enablement; tags/releases
commits, pushes, branch creation, merges, history filtering or archive conversion
production/staging deployment or candidate freeze
robots/noindex/canonical/social-metadata changes or launch flags
Cloudflare, DNS, HSTS, CSP, Access or analytics changes
Ko-Fi page editing, memberships, payments or a funding readiness audit
reference overlay splitting, caching changes or secure-preview workarounds
Sol/name advisories, filename safeguards, technical-token/X-Tech geometry fixes
save/schema/import/storage/history changes or fatal-state backup UI
workspace/Matrix/Cargo/scrolling redesign or V2 features
dependency upgrades, new paid tools/services or broad licensing automation
```

Publication/indexing/runbook execution and final candidate acceptance remain later tasks. Preserve existing production-origin and security policy, including the distinction between deploying code and changing user data.

## Verification and acceptance

Use disposable data and a clean isolated copy where needed. Do not clear or modify the user's real browser storage. Verify a fresh checkout-shaped build with `npm ci` and no installed game inputs; preserve the main worktree and existing local prototypes.

Add focused tests for:

- package-version sourcing, lockfile consistency, trusted/missing/invalid commit metadata, local modified/unknown identity and safe output escaping;
- no secrets or machine paths in exposed build metadata;
- correct About content and exact destinations in every supported locale, with sparse UK fallback and full-catalogue guarantees;
- preserved modal keyboard behavior, accessible names, external-link isolation and focus restoration;
- no network/history/storage mutation from opening About or viewing identity;
- retained favicon credit and scoped GPL/third-party wording;
- actual shipped licence/notice text outputs and any generated source-build link;
- confirmed unused-asset removal without losing referenced assets;
- unchanged reference manifests/data and security/indexing outputs apart from expected generated build files.

Run and record exact results:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run localization:terminology:verify
npm run localization:provenance:verify
npm run build
npm run lint
git diff --check
```

Also run any focused new build-identity or legal-output tests. Do not weaken existing tests to make metadata or new messages pass. Explain unexpected generated changes rather than silently committing them. An existing bundle advisory is not approval to optimize the bundle here.

Browser checks: all ten locales at 1366×768 and 1600×900; longer translated About content; keyboard-only open/traverse/close/restore; regular and forced-colors focus; no new workspace overflow. Verify version and known build identity in a built preview, not just mocked component tests.

Provide the user a short manual checklist for true browser 200% zoom, actual Windows High Contrast and Narrator reading of new content/links, plus external destination checks without sending a report or payment. Distinguish tool emulation from actual OS/browser tests. Public unauthenticated repository/Issues/source availability and actual deployed build identity remain later checks until the owner publishes/deploys.

Record preparation evidence in one concise `docs/audits/RELEASE-PREPARATION-VERIFICATION.md` or an equivalent established location. Do not manufacture PASS results for publication, Ko-Fi readiness, final release acceptance or unavailable hardware.

## Stop boundaries

Stop the affected action and report, while continuing independent safe work, if:

- a newly found credential/private record would be exposed; report sanitized location/type, never the secret;
- a proposed licence notice would overwrite another author's rights or falsely include third-party material;
- a concrete non-favicon third-party finding needs an owner decision beyond this brief;
- exact build identity cannot be represented honestly without a broader build/deployment redesign;
- a planned asset deletion is not supported by usage inspection;
- implementation requires domain/schema changes, new services, weakened checks, remote writes or history manipulation;
- the About content cannot remain operable without a broader modal/workspace redesign.

Do not stop merely to reopen the already settled favicon retention, GPL qualifier, support, funding or publication-method decisions. Report genuinely new contradictory evidence precisely; do not seek absolute legal certainty or initiate third-party contact.

## Handoff

Provide the combined diff and a concise summary covering: baseline/worktree; files changed; exact licence scope and favicon notice; third-party ledger items completed versus unresolved; confirmed unused assets removed; current displayed development version and later RC/release convention; build-identity behavior; About/support/Ko-Fi destinations and localization; tests and browser evidence; manual checks still outstanding; documentation reconciled; and the remaining **separate** publication, Ko-Fi, candidate and launch gates.

Confirm no commit, push, tag, publication, history rewrite, settings change, deployment, message or payment occurred. Do not include screenshots or require them as durable evidence; use self-contained textual observations and measurements. Do not leak temporary task numbers into unrelated durable documentation.

Suggested commit message for the combined preparation, after review:

`feat: prepare public release identity and project information`

## Source notes

The decisions in this brief are the user's approved direction. The repository audit remains the evidence source for code paths, current limitations and publication-review coverage, not an authority to reverse later choices.

- **Repository audit:** `docs/audits/RELEASE-READINESS-REVIEW.md`, 23 September 2026; especially application identity, About/support, publication inventory, notices and documentation reconciliation.
- **Favicon certificate:** user-supplied `license-251033545.pdf`, pages 1–2; identifying licence/author facts, required web credit and separate rights restrictions summarized above. Do not automatically publish the personal certificate.
- **[A] GNU application guidance:** https://www.gnu.org/licenses/gpl-howto.en.html — licence text and project notices.
- **[B] GNU GPLv3:** https://www.gnu.org/licenses/gpl — authoritative licence; sections 5, 6 and 14 distinguish distribution/source/version questions. Plain-text source: https://www.gnu.org/licenses/gpl-3.0.txt . Obtain an intact official copy; do not append asset carve-outs to the licence text itself.
- **[C] Cloudflare Pages build configuration:** https://developers.cloudflare.com/pages/configuration/build-configuration/ — documented commit/branch build variables. This is not authorization to modify Cloudflare.
- **[D] Semantic Versioning:** https://semver.org/ — version/prerelease convention. The first-release and candidate values above are explicit product decisions; no tag or release is created by this brief.
