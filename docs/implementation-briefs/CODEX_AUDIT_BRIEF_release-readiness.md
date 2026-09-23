# CODEX AUDIT BRIEF — Release Readiness and Prioritized Launch Plan

## Objective

Perform a **read-only release-readiness and prioritization audit** of Starfield Outpost Network. Produce a finite action plan for public release, distinguishing necessary release work from optional polish, post-release work, and ideas that may never need implementation.

The user has deliberately paused the on-demand reference-overlay prototype. Its potential bandwidth savings are real, but further deployment, failure-handling, accessibility, and integration work must compete with the remaining launch requirements rather than continue by momentum.

This is **not** another implementation task or an instruction to finish the backlog. The audit must answer:

- What genuinely remains before public release?
- What requires a decision or investigation, rather than an implementation?
- What can be deferred safely, with what limitations and revisit triggers?
- What is the smallest dependency-aware sequence that gets this version ready to launch?

Create one durable report:

`docs/audits/RELEASE-READINESS-REVIEW.md`

Include the prioritized action plan in that report. Do not create a separate competing roadmap or change the backlog during this audit. All recommendations remain subject to user review; no implementation, publication, waiver, or deployment is authorized here.

## Authority, baseline, and scope

Repository: `gooberpede/starfield-outpost-network`.

Work from the current committed `staging` branch. At brief preparation, the observed remote tip was:

`9b0c37e9d039063c58c2bff3a4d1d130760539e3` — `docs: prototype on-demand reference overlays`.

Record the actual branch, commit, worktree state, and available history at audit start. If the branch has advanced, inspect the differences; do not reset it to the preparation snapshot. Distinguish repository state from deployed production state. Do not assume a branch tip proves what is currently deployed.

Use this brief's explicit user decisions and supplied manual evidence, `AGENTS.md`, the documents owning each concern, current implementation/tests, and dated audit evidence. Report conflicts rather than silently choosing a convenient interpretation. A historical audit's proposed next step does not override the user's newer decision to defer that work.

Permitted activity is repository/history inspection, necessary read-only public or authorized connector checks, and bounded tests in a disposable local environment. The only intended durable change is the new audit report.

Do not modify runtime code, CSS, catalogues, reference data, dependencies, lockfiles, tests, existing documentation, Git history, branches, repository visibility/settings, Cloudflare configuration, credentials, indexing controls, or deployments. Do not commit or push. Preserve supplied briefs and ignored prototype work without alteration.

## Sources and coverage

Read the **complete** current `docs/BACKLOG.md`, not just its public-release section. Inspect:

```text
AGENTS.md
README.md
package.json and the committed lockfile
.gitignore
existing licence, notices, contribution/support/security files, if present
existing GitHub workflows and repository-publication material, if present

docs/IMPLEMENTATION-WORKFLOW.md
docs/DOMAIN-RULES.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/DEPLOYMENT.md
docs/localization/LOCALE-ONBOARDING.md

public/_headers
public/robots.txt
index.html and current public metadata/assets
```

Consult the current disposition sections of relevant reports, including:

```text
docs/audits/codex-whole-product-security-audit.md
docs/audits/codex-whole-product-accessibility-audit.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
docs/audits/HSTS-POLICY-REVIEW.md
docs/audits/FIXED-CHROME-OCCLUSION-AND-FOCUS-VISIBILITY-REVIEW.md
docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md
docs/audits/RESOURCE-MATRIX-HEADING-EDITORIAL-REVIEW.md
docs/audits/RESOURCE-MATRIX-HEADER-GEOMETRY-VERIFICATION.md
docs/audits/DEPLOYED-BANDWIDTH-AND-LOCALE-LOADING-REVIEW.md
docs/audits/REFERENCE-OVERLAY-ON-DEMAND-PROTOTYPE.md

docs/benchmarks/LOCALIZATION-BUNDLE-AND-STARTUP-REVIEW.md
docs/benchmarks/PRODUCTION-HOSTING-READINESS.md
docs/benchmarks/CLOUDFLARE-CSP-SECURITY-HEADERS.md
```

Discover other relevant security, import/storage-capacity, reference-integrity, and deployment evidence rather than guessing filenames. Inspect source only as deeply as needed to substantiate a classification, identify an unresolved decision, or estimate the scope of a later task.

For each unresolved backlog item, either assign an individual disposition or map it explicitly to a named group with the same rationale. Do not silently drop inconvenient items. Keep a short coverage crosswalk so the user can tell that the full backlog was considered.

If a source is unavailable, state what is unavailable and which conclusion it limits. Do not infer absence from a truncated preview. Do not invent another conversation's contents.

## Supplied manual evidence and completed work

These updates are inputs to the audit even if current repository prose has not caught up. Attribute them as **user-reported manual evidence**, not checks performed by this audit.

### iPhone 12 / Safari production smoke test

The user tested `https://starfieldoutposts.com/` on a real iPhone 12 with Safari. The page loaded successfully. They created outposts, connected them with a Cargo Link, and changed locales, including Japanese and German. Touch controls appeared to work well. No blocker was observed in those exercised workflows.

Observed limitations:

- Small-screen navigation and Safari browser chrome made use awkward; a larger screen would be preferable.
- Japanese `[+ X-Tech]` text overflowed its button geometry.
- Expanded Cargo Links seemed unusually compressed. The cause is unconfirmed; do not diagnose Safari viewport behaviour from this observation alone.

Disposition: the old blank-page symptom was **not reproduced in current user testing** and should not remain an active launch blocker without new contrary evidence. Recommend replacing that stale item with the specific remaining small-screen/Safari findings. This is not proof of universal Safari compatibility or of a diagnosed historical root cause.

No exact iOS/Safari version, viewport, build identifier, VoiceOver result, or macOS/iPad result was supplied. Do not invent one. An iPad session could provide useful additional evidence, but does not substitute for macOS Safari coverage.

### HSTS rollout

The user manually verified the 30-day policy in Preview/staging and production. Production HTTP redirected to HTTPS. Both environments served:

`Strict-Transport-Security: max-age=2592000`

Neither `includeSubDomains` nor `preload` was present. The user has already set a reminder to review the policy next month, subject to at least 30 continuous days of deployment.

Any current statement that this rollout is still awaiting verification is stale documentation, not evidence of an uncompleted security rollout. Record the later documentation reconciliation needed; do not change headers, re-run the rollout, or create another reminder. A possible one-year policy remains a later review decision. `includeSubDomains` and preload are separate, unapproved decisions, not mandatory launch milestones or automatic follow-ons.

### Recently completed UI/localization work

Treat locale onboarding, compact Solar/Wind indicators and approved compact copy, fixed-chrome/focus corrections, Cargo Remove/Undo expansion preservation, Matrix column-heading geometry, and Matrix/Cargo outer-heading alignment as completed within their documented and user-tested scope.

Do not resurrect their earlier pending states from historical reports. New contradictory evidence can reopen a specific defect, but a final release-candidate regression check is not a requirement to repeat every audit from scratch.

## Classification model

Use the user's five categories exactly:

| Category | Meaning |
| --- | --- |
| **RELEASE GATE** | Must be completed or receive an explicit, evidence-based user disposition before launch. Do not silently waive it. |
| **PRE-RELEASE POLISH** | Desirable before launch when bounded and low-risk, but not inherently a blocker. Include a clear defer condition. |
| **RELEASE DATE** | Work performed or verified at the deliberate public-launch transition; preparation may happen earlier. |
| **POST-RELEASE** | Useful work intentionally postponed. It is not a promised schedule or a reason to delay launch. |
| **SOMEDAY / EVIDENCE-TRIGGERED** | No current implementation commitment. State the evidence or future product decision that would justify revisiting it; “never needed” is a valid outcome. |

Keep classification separate from **current status** and **next action type**. For example, an investigation can be PRE-RELEASE POLISH while its possible implementation remains POST-RELEASE.

Use action types such as: verify evidence, user decision, bounded investigation, implementation, documentation, manual validation, and launch operation. Uncertainty is not automatically a release blocker; specify what the uncertainty could affect.

## Starting classifications agreed in discussion

Use these as the starting priorities, not an invitation to restart settled debates. Recommend a change only with a specific evidence-based rationale, identifying the original classification and the proposed change. No reclassification automatically authorizes work.

| Work | Starting classification | Audit treatment |
| --- | --- | --- |
| Application versioning and release/build identity | RELEASE GATE | Establish the remaining scheme/source/display/tag decisions and how deployed builds will be identified. |
| About dialog | RELEASE GATE | Minimum: version context, contact information, Ko-Fi link, and repository link; retain attribution. Identify exact destinations and missing decisions. |
| Public-repository readiness, licence and attribution | RELEASE GATE | Separate from About implementation. Assess current tree, publishable history, rights/evidence, public documentation, and publication consequences. |
| Support/contact and bug-reporting workflow | RELEASE GATE | Decide GitHub Issues, email, or both; use existing verified destinations where available. |
| Fresh-profile/first-run release-candidate smoke test | RELEASE GATE | Define a bounded end-to-end acceptance matrix and evidence required before launch. |
| Final deployment/indexing/discoverability and rollback execution | RELEASE DATE | Prepare a runbook before launch; perform publication/indexing/deployment only under later explicit authorization. |
| User-data backup expectations | RELEASE DATE / documentation | Assess whether current local-storage/export explanation is sufficient; no automatic nagging UI requirement. |
| Localized `Sol` presentation | PRE-RELEASE POLISH | Bounded presentation correction, preserving canonical IDs/data. |
| Character-name 25-character INFO advisory | PRE-RELEASE POLISH | Non-blocking gameplay advice, separate from defensive application limits. |
| Long-character-name/export-filename handling | PRE-RELEASE POLISH | Inspect remaining defensive risk; recommend a gate only if concrete safety/correctness evidence warrants it. |
| `R-COOH` / `SiH3Cl` technical-token geometry | PRE-RELEASE POLISH: investigate first | May move to POST-RELEASE if safe correction affects the shared control/layout system. |
| Reference-data `no-store` caching | PRE-RELEASE POLISH: bounded investigation only | Implementation is not pre-approved; defer if integrity/versioning work is substantial. |
| Safari/VoiceOver, Japanese Apple fonts, touch/touchpad checks | PRE-RELEASE POLISH, optional focused session | Hardware-dependent and readily deferrable. Credit the completed iPhone test; separate untested devices and assistive technology. |
| Japanese `[+ X-Tech]` overflow on iPhone | PRE-RELEASE POLISH candidate | Reproduce/classify; defer if fixing it requires shared geometry or mobile redesign. |
| Other small-screen Safari follow-up | POST-RELEASE | Replace the stale blank-page concern with current specific findings; Cargo compression remains unconfirmed. |
| Fatal-state raw backup/export | POST-RELEASE | Do not make a new recovery UI a gate without evidence of an actual release-critical problem. |
| Remaining Narrator shortcut/speech issues | POST-RELEASE | Preserve known limitations; reopen priority only if a concrete essential-workflow blocker is demonstrated. |
| On-demand reference-name overlays | POST-RELEASE default | Local prototype exists; deployment validation/integration remain. Only reconsider pre-release by explicit user decision, not “spare time” assumed by the agent. |
| Formal user guide | POST-RELEASE | Existing contextual help is the baseline; user feedback may favour focused help over a large guide. |
| Matrix compact-copy/editorial candidates | SOMEDAY / EVIDENCE-TRIGGERED | Geometry already addressed the immediate defect; another locale or useful editorial feedback may justify revisiting. |
| Workspace/Navigation independent scrolling | SOMEDAY / EVIDENCE-TRIGGERED | No current need for redesign. |
| Validation navigation to exact sub-controls | SOMEDAY / EVIDENCE-TRIGGERED | Do not revisit before a deliberate V2 decision. |
| Throughput, generator/output calculations, Planner-oriented features | SOMEDAY / EVIDENCE-TRIGGERED; V2 only | No Tracker V1 expansion. |
| History timeline, richer import UX, status-bar redesign, Cargo auto-scroll refinements | SOMEDAY / EVIDENCE-TRIGGERED | No current implementation need. Separate any actual defect from these enhancements. |
| Later HSTS evolution | POST-RELEASE / scheduled operational review | Independent of launch date. No automatic one-year, subdomain, or preload approval. |

Also classify unresolved items not individually named above: persisted Cargo Pad labels, technical-capacity advisories, modded import exceptions above the current envelope, future validation rules, reference-data refinements, redundant dataset retirement, tooling simplification, and optional regression-tooling improvements. Do not promote them merely because they appear in the backlog.

## Release gates: required examination

### Version and release identity

Inspect existing package version, displayed version, build configuration, tags/releases, and deployment identification. At preparation, `package.json` contained version `0.0.0`; this is a starting observation, not a decision about the first release number.

Recommend the smallest consistent scheme: source of version truth, app display, tag/release convention, and traceability to the deployed commit. Distinguish application version from saved-data schema version, reference dataset identity, and locale identities. SemVer is a candidate, not an already selected first version or automatic release system.

Do not create tags/releases or change package metadata. Repository publication does not authorize npm publication; do not treat the package's `private` flag as a GitHub-visibility setting.

### About, support, and public-facing information

Identify existing components, contact paths, attribution, and verified URLs. List missing user choices, including the exact Ko-Fi destination if not established. Do not invent addresses, contribution commitments, support hours, or a funding account.

Recommend a minimal public support route and bug-report information, including app version and browser. Avoid asking users to post saved networks or personal data publicly by default. Assess an unofficial-project disclaimer and notices already present rather than adding boilerplate blindly.

Account for the real cost of changes: all affected locale messages, compact/full copy conventions, accessible links, keyboard behaviour, and manual closure. An About enhancement is not just an English JSX edit.

### Public repository and publication safety

Inventory the current tree and accessible history/refs intended to become public. Establish history coverage, shallow-clone or connector limits, and any unchecked areas. Inspect tracked documentation, fixtures, exports, generated artifacts, archives, source inputs, remote branches/tags, and relevant repository-hosted material where accessible.

Look for credentials, private configuration, personal data, unintended user saves, copyrighted/raw game assets, and records never intended for public release. Distinguish expected contributor attribution and public operational identifiers from secrets. A clean working tree is not a clean-history finding; ignored paths are not proof that a file was never committed.

Use existing safe local tools where available. Do not dump secret values, unredacted matches, private documents, full configurations, or authentication material into the report, chat, command output, or external scanners. Report sanitized finding type, affected path/ref where safe, coverage, and required remediation. If a credential is suspected, stop the affected publication recommendation and alert the user safely; do not revoke credentials or rewrite history without authorization.

Review project licensing separately from dependencies, icons/fonts, generated data, official names, and raw Bethesda source material. Record demonstrated provenance, actual notices/terms, and unresolved distribution questions. Do not assume an open-source code licence grants rights to third-party assets, or that a disclaimer resolves redistribution concerns. Where rights remain unclear, identify the precise decision/evidence needed rather than provide unsupported legal assurance.

Check README accuracy and outsider-facing build/development instructions, including what can be built without installed game files versus optional regeneration. The preparation read found that README still describes only US/UK English presentation and contains obsolete workflow-sequence prose; check the current file and list necessary reconciliation without editing it here.

For publication consequences and licence/attribution claims, consult current authoritative GitHub/vendor/rightsholder documentation where necessary. Cite the exact source and distinguish it from repository facts and audit judgement. Do not turn this into a speculative legal or infrastructure project.

### Release-candidate and first-run acceptance

Define a finite smoke test using disposable browser/profile data: initial load and locale selection; create a network and outposts; select body/biome; record resources/production; configure manufacturing and Planned Supply; connect Cargo Links; exercise validation and Undo/Redo; reload; export; and import into a separate disposable context.

Include successful round-trip preservation, failed-import non-mutation, and an existing-save upgrade smoke test. Check normal supported sizes before treating extreme/modded capacities as launch blockers. A concrete normal-use export that cannot be re-imported is different from a request for richer import UX.

Specify targeted regression coverage for the recent focus/occlusion, Cargo Undo, compact indicators, and header changes without rerunning every historical language audit. Define what is checked automatically, what the user must verify, and what is already evidenced but needs a final release-candidate spot check.

Do not clear or alter the user's real localStorage, import over real data, or run destructive UI tests against production. If a safe disposable setup is unavailable, provide the test plan and leave its execution pending.

## Bounded pre-release investigations

### Reference-data caching versus overlay loading

Keep the two problems separate. Existing reports found repeated reference-data transfers under `cache: 'no-store'`, whereas the isolated overlay prototype reduced initial JavaScript artifact size. Those are different units, environments, frequencies, and risk surfaces.

For this audit, inspect why the loader uses `no-store`, its manifest/hash/build checks, existing tests, and the scope of a safe caching investigation. Do not implement caching, change HTTP headers, repeat the full bandwidth audit, or deploy the overlay prototype.

Report whether a small, separately scoped caching investigation is warranted before release. It must be able to conclude “safe to defer.” Integrity and dataset-version correctness remain hard constraints; bandwidth savings alone do not justify weakening them.

The overlay prototype remains isolated under `.local-work/reference-overlay-prototype/`. Preserve it and its report as the restart point. Record remaining deployment, switch/failure, accessibility, and stale-chunk work and its opportunity cost. Do not assume pushing a new prototype branch would deploy it: current deployment documentation permits automatic previews only for `staging`.

### Names, filenames, and shared geometry

Treat the character-name game advisory separately from application string/filename safeguards. Inspect actual current boundaries; `196` was only a tentative application limit, not approval to enforce it. Preserve names, IDs, export timestamp/extension, failed-import safety, and schema/history boundaries.

Assess token clipping across **all** resource/manufactured-item controls—toggle or otherwise—in Matrix, Planned Supply, and Cargo. The measured few-pixel overflow does not authorize a local three-pixel widening. Preserve the tuned 1366px footprint and shared alignment. Report scope and defer if a safe fix becomes a coordinated layout project.

### Optional Apple session

Recommend a compact test guide for an available iPad/Safari session, with VoiceOver and Japanese font/label checks where feasible. Hardware access and an hour or two are possibilities supplied by the user, not a booking, deadline, or comprehensive coverage promise.

Give each newly observed issue its own severity and classification. Small-screen discomfort is not a new phone-support commitment. A newly reproducible core-workflow failure warrants separate triage. Native-language review remains desirable, not a blanket release gate.

## Launch-day preparation and operational constraints

Prepare, but do not execute, a release sequence covering version/commit freeze, final checks, public-repository readiness/sign-off, valid About/support links, staging acceptance, promotion to `main`, deliberate production deployment, and public-origin smoke tests. Separate code preparation from publication timing so a private repo link is not treated as a completed public support path.

Assess title/description/canonical and sharing metadata, robots controls, and whether a sitemap has actual value. Keep this bounded; there is no requirement for a marketing site or an SEO programme. Removing pre-release restrictions permits discovery; it does not guarantee search-engine indexing.

Inspect how launch indexing can change on the public production origin **while previews remain Access-protected and non-indexed**. The same current static headers/robots files serve multiple environments; do not propose a blanket removal without an environment-safe plan. Do not change them during this audit.

Document proposed rollback ownership and a known-good deployment, including compatibility with saved data. Distinguish redeploying application files from restoring user data; avoid implying code rollback reverses localStorage changes. Preserve HTTPS/HSTS and production-origin continuity.

Assess whether users can readily understand that saves are browser/profile/origin-local, with export for portable backups and no account sync/server backup. Recommend minimal accurate wording, not a mandatory tutorial, persistent nag, new backend, or formal guide.

Preserve project constraints: Cloudflare Pages Free, no new recurring infrastructure charge, existing domain-renewal budget, no backend/Worker/database/telemetry expansion, and no weakening CSP or enabling analytics as incidental release work.

The secure Codex preview-access setup was deliberately shelved. Current browser tools cannot safely inject Access credentials or expose all Network fields. Do not request secrets, create service tokens, change Access, or build a workaround. Authorized read-only Cloudflare management evidence may be used when available, but is not proof of authenticated browser behaviour. Leave required dashboard/browser actions for the user, with clear step-by-step instructions in the later relevant task.

## Required audit output

Make the report usable for a release decision, not merely a catalogue of everything that could improve.

Include:

1. **Release-readiness verdict and evidence limits:** actual remaining gates, not a blanket quality/security certification.
2. **Completed baseline:** concise recognition of accepted work and supplied iPhone/HSTS evidence.
3. **Complete disposition register:** descriptive item name; source; current status/evidence; user starting category; recommended category; next action type; rationale; relative scope/risk; dependencies; completion or explicit-waiver criterion; defer/revisit trigger; and proposed owner (Codex, user decision, user manual check, or external review).
4. **Classification changes:** separate, explicit explanations for any departure from the agreed starting priorities. Do not hide a new gate in an implementation recommendation.
5. **Finite pre-release action plan:** dependency-ordered release gates, bounded polish, and launch-day operations. Include what can be omitted without blocking launch and exactly where a user decision is required.
6. **Post-release and evidence-triggered handoff:** restart evidence, prerequisites, and triggers. Do not promise every backlog idea will be built.
7. **Documentation reconciliation queue:** current-state discrepancies, owning document, and later update needed. Preserve historical evidence.
8. **Coverage and verification:** files/history/remote surfaces inspected, tests actually run, unavailable evidence, and outstanding manual checks.

Use small/medium/large scope and low/medium/high risk with reasons, not unsupported hour estimates or an invented release date. Include localization, testing, deployment, and manual verification costs, not just coding effort.

For each optional task, define its boundary before it starts: what would make it stop and return for triage rather than consume the release. The minimum launch path must exclude optional performance architecture and V2 features. Optional polish must not indefinitely reset a release candidate.

Waivers are proposals for the user, not audit-approved exemptions. Give consequences and residual risk. Concrete data-loss, exposed-secret, or essential-workflow findings must be surfaced prominently, not hidden under polish or waived casually.

## Documentation conventions

Use descriptive feature/finding names. Do not import temporary Step/Parcel/Batch labels from prior briefs into the report. An action order owned by this report is fine; unrelated durable documents must not depend on its transient numbering.

Do not embed, attach, or link screenshots as required evidence. Record self-contained textual observations, environments, reproduction details, and limitations. Cite repository paths/commits and external references where relevant; do not cite a screenshot or another chat as something a future reader must retrieve to understand the finding.

Avoid overstating certainty. Separate newly observed facts, prior report evidence, user manual evidence, source-derived requirements, and recommendations. For example, the supplied iPhone test resolves the current blank-page concern for that tested setup; it does not establish the historical cause or certify all Apple platforms.

## Verification, stop boundaries, and handoff

A full build/test run is not mandatory merely to write this audit. Inspect existing test coverage and dated results; run focused checks only where they materially resolve a release question. Do not claim old green tests were rerun. Where a broad history/publication review cannot be completed with available tools, make that a specific unresolved gate rather than calling the repository safe.

Use ignored scratch space for any diagnostics. If a check regenerates tracked artifacts, use an isolated copy rather than disturbing the working tree. Do not add tools/dependencies or transmit private repository contents to external scanning services.

Before handoff:

- run `git diff --check`;
- also check the new report for whitespace errors if it remains untracked and ordinary diff does not include it;
- confirm the only audit-created deliverable is the report and all pre-existing changes remain untouched;
- confirm every unresolved backlog item has a disposition;
- confirm investigation is not silently equated with implementation;
- confirm no public release, repository publication, history rewrite, credential change, deployment, or reminder was performed.

If evidence indicates a serious safety/publication problem, stop the affected recommendation and report it safely. Continue independent triage where possible. Do not implement a fix under cover of the audit.

Final Codex summary should give the baseline, report path, actual gate list, ordered minimum launch path, bounded-polish list, proposed classification changes, paused/deferred work, outstanding user decisions, iPhone/HSTS dispositions, publication/history coverage and limitations, checks run, and confirmation that no commit/push/settings/deployment change occurred.

Suggested commit message for the audit report only:

`docs: audit public release readiness`
