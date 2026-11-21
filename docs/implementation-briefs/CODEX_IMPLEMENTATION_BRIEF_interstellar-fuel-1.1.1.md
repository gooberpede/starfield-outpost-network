# Codex implementation brief — Inter-system cargo fuel semantics (1.1.1)

**Target:** `gooberpede/starfield-outpost-network`, branch `staging`  
**Scope:** narrowly bounded fuel validation, Inter-System button status, localization, regression coverage, durable workflow, and patch-release preparation.  
**Authorization:** implement and test locally; **do not commit, push, deploy, tag, or publish**. Owner reviews the diff and manually accepts staging before release operations are separately authorized.  
**Sub-agent cap:** **exactly one**, mandatory independent reviewer. No additional sub-agents authorized for this brief.

## 1. Authority and objective

The Starfield research project established that for an ordinary paired **inter-system** cargo route, **either eligible non-mission endpoint passing fuel readiness permits the shared ship to load/depart at either end, including return freight from an unfuelled endpoint**. Fuel is consumed through periodic producer work, not as a charge per leg. This application is not a full simulation of charge states, physical fuel quantities, scheduler timing, or throughput; do not add those mechanics here.

Read authoritative research before changing code:
- https://github.com/gooberpede/starfield-outpost-research/blob/main/docs/experiments/cargo-links/fuel/report.md
- https://github.com/gooberpede/starfield-outpost-research/blob/main/docs/experiments/cargo-links/fuel/stages.md
- https://github.com/gooberpede/starfield-outpost-research/blob/main/docs/experiments/cargo-links/fuel/review.md

The tracker currently validates **each exporting endpoint independently** in `src/domain/validation/rules/interstellarCargoHelium3.ts`, and `CargoPadEditor` colours/describes the Inter-System button using **only local actual He-3**. Correct both behaviours to reflect **either-end fuel eligibility** for an otherwise valid paired inter-system link.

## 2. Agreed domain and UX contract

### Complete and structurally valid inter-system link

A link qualifies for the new rule when it is an unambiguous, non-self-referential pairing between two existing pads at outposts in **different known systems**, and **both pads are interstellar**. Use the existing cargo connection eligibility/resolution owner rather than treating arbitrary raw `cargoLinks` claims as valid. Preserve existing structural diagnostics for missing or conflicted endpoints and cross-system regular-pad mismatches. Handle absent/unknown system identifiers conservatively; do not manufacture an inter-system diagnosis from unresolved location identity.

For a qualifying connection A↔B:

| He-3 available at A | He-3 available at B | Validator | Inter-System button at A and B |
|---|---|---|---|
| Yes | Yes | No fuel warning | Selected — fuelled |
| Yes | No | No fuel warning | Selected — fuelled |
| No | Yes | No fuel warning | Selected — fuelled |
| No | No | **Exactly one operational warning per link** | Selected — unfuelled |

The warning is independent of cargo export selections: even if **neither pad exports cargo**, an otherwise valid unfuelled inter-system connection gets one warning. Stable link identity, not array order or which endpoint was initially chosen, determines deduplication. The warning should identify **both participating outposts** in localized presentation; retain the existing stable rule ID if practical and update outdated rule description and comments.

### Actual versus planned availability

Retain the tracker's existing availability contracts; do not redefine Planned Supply:
- **Validator** uses `getAvailableItemsAtOutpost`: active/local actual, inbound actual, **or Planned Supply** of He-3 at **either** endpoint suppresses the fuel warning.
- **Button** uses actual availability (`getActuallyAvailableItemsAtOutpost`, via existing application flow): Planned Supply alone does **not** make the button appear fuelled. It becomes fuelled if either linked endpoint has **actual** He-3 available.

Thus a planned-only connection can have **no warning yet show unfuelled buttons**. Explain this distinction through localization/tooltips/accessibility, avoiding claims that the validator proves a physically charged pad.

### Incomplete, unlinked, or invalid pairing

For a pad without a structurally valid qualifying inter-system partner, **do not borrow remote fuel**. Its Inter-System button continues to use **local actual** He-3, including for:
- unlinked pads and outpost-only unfinished destination intent;
- missing outpost or pad, self-pairing and contradictory/multiply claimed records;
- cross-system pairing with a regular pad at either end;
- other unresolved partner situations.

Preserve existing non-fuel diagnostics and cargo routing rules. Do **not** generate a new link-level fuel warning for incomplete/invalid connections. Regular pads remain **not selected** regardless of fuel. Do not change linking, editing, persistence, Undo/Redo, import/export, capacity, manufacturing or cargo-routing semantics.

### Three-state Inter-System control

Preserve the existing presentation states (`regular`, `fuelled`, `unfuelled`) and `aria-pressed` semantics:
- regular pad → **not selected**;
- interstellar pad with actual He-3 at **either end of a qualifying link** → **selected — fuelled**;
- interstellar pad without such fuel → **selected — unfuelled**.

Apply the same effective state to the button's `data-fuel-state`, `data-fuelled`, appearance, `title` tooltip and accessible description; do not permit a green/fuelled visual state paired with a local-only “unavailable” accessible message. Localized text should distinguish **local fuel**, **linked-outpost fuel**, **neither-end fuel**, and **local-only fallback**. If both sides have fuel, wording may reflect both or use a truthful generic available message. Keep UI compact and keyboard accessible.

### Validation navigation

**Preferred and required:** the single missing-fuel warning for a qualifying A↔B link is **non-navigable** because either endpoint can resolve it. It must still appear as an ordinary readable warning in the Validation panel, identify both outposts, contribute exactly one to counters, and leave other issues' click/keyboard navigation behaviour unaffected. Implement explicit issue actionability logic (e.g. a rule-specific decision) rather than relying on an accidental absent `outpostId` or a dummy endpoint. The issue may carry stable `cargoLinkId` and endpoint evidence for presentation without implying an authoritative repair destination. Preserve roving focus, accessibility and keyboard activation behaviour for actionable items.

If non-navigation genuinely requires disproportionate changes or undermines shared interaction semantics, **stop and report BLOCKED with the reason**; the owner has proposed outpost-order navigation as a possible fallback, but it is **not silently authorized**.

## 3. Implementation boundaries

Inspect at minimum: `src/domain/cargoConnections.ts`, `src/domain/availability.ts`, `src/domain/validation/rules/interstellarCargoHelium3.ts`, `src/domain/validation/types.ts`, `src/ui/statusStates.ts`, `src/ui/components/CargoPadsEditor.tsx`, `src/ui/components/CargoPadEditor.tsx`, `src/ui/validationInteraction.ts`, `src/ui/components/ValidationSummary.tsx`, `src/ui/validationPresentation.ts`, the localization catalogues and existing tests.

Prefer one shared **pure domain-level fuel-status resolver** for endpoint eligibility and link-level availability, parameterized or otherwise structured so **validator planned-inclusive** and **button actual-only** policies remain distinct. Avoid duplicated interpretation of malformed pairing records. Pass derived state into the presentation-only pad editor; do not make it a second link resolver.

Retain strict localization placeholder checking, all supported locales and existing validation identity guarantees. Use human-readable localized outpost names with stable-ID fallback. Do not add persisted fields or increment the network schema version. Update `docs/DOMAIN-RULES.md` and any necessary current help/UX wording; avoid rewriting historical research or audits.

## 4. Acceptance and regression matrix

Automate representative domain, presentation and component tests, including:

1. A↔B across systems, both pad types interstellar: all four actual-fuel combinations; swapping endpoint A/B orientation and viewing both outposts produces symmetric status.
2. Same combinations with zero outbound items, one-way outbound items and both-way outbound items: warning counts unaffected by exports; exactly **one** warning only when neither endpoint is validator-fuelled.
3. Planned Supply at A only, B only, both and neither; actual He-3 via local production or inbound routing. Confirm validator/button's intentionally distinct policies and no recursion or accidental fuel-source suppression.
4. Regular same-system links; cross-system regular/interstellar mismatch; unlinked, unfinished intent, missing endpoint, duplicate/conflicting AB+AC, self-reference; verify no borrowed remote fuel, no added fuel warnings on invalid links and unchanged structural diagnostics.
5. Toggling interstellar/regular, linking/unlinking, and removing fuel from either end updates **both** buttons and the warning reactively, without mutating the network or creating history entries merely for derived state.
6. Tooltip, `title`, `aria-describedby`, `aria-pressed`, semantic state and CSS hooks agree for both endpoints, including remote-only fuel and fallback states. Verify all supported locales and strict interpolation contracts; open the real Validation panel in component tests.
7. Non-navigable fuel warning remains readable in the Validation worklist, with both outpost names, correct count, no click/keyboard navigation, stable ordering and no regression in navigation/focus for other issues.
8. No changes to cargo availability/routing decisions, persistence, existing saves, schema, Undo/Redo or import/export; preserve valid `1.1.0` data compatibility.

Run and report at least `npm test`, `npm run test:components`, `npm run typecheck:tests`, `npm run localization:verify`, `npm run localization:terminology:verify`, `npm run localization:provenance:verify`, `npm run reference:test`, `npm run build`, `npm run lint`, and `git diff --check`. If any script or tool cannot run, do not report a pass. Include tests that would have failed under the old per-sender implementation.

## 5. Mandatory independent reviewer and durable workflow

This task authorizes a **maximum of one sub-agent, exclusively for independent review**. Primary Codex performs implementation and integration. No other sub-agent, parallel specialist or expanded cap is authorized. If the sub-agent feature is unavailable, do not invent a review; report **BLOCKED**.

After implementation and self-testing, hand the **original brief, research evidence, actual full diff and test results** to the independent reviewer. The reviewer must critically challenge every acceptance criterion, negative cases, regressions, architecture, changed tests and code rather than merely endorse the implementer's narrative. Reviewer dispositions: **ACCEPT**, **REWORK**, **BLOCKED**. The primary agent's `COMPLETE` is provisional until the reviewer returns `ACCEPT` on the **final exact implementation snapshot**. A `REWORK` requires primary-agent fixes followed by another independent review; the primary cannot override it. Reviewer must not implement the corrections it requests.

Persist the review under `.local-work/independent-review/1.1.1-interstellar-fuel/` (e.g., dated review rounds and final `review.md`). Record the reviewed diff/commit identity, criterion-by-criterion results, evidence/file references, challenged assumptions, defects/severity, repairs and final disposition. Preserve prior rounds rather than overwriting the rework history. Keep private local review artefacts out of the commit.

**Make the policy durable:** update `docs/IMPLEMENTATION-WORKFLOW.md` and `AGENTS.md` as appropriate so future implementation and audit briefs default to **one mandatory independent reviewer sub-agent**; the cap may rise only when a **source brief explicitly permits it**, up to three concurrent sub-agents. The primary may not self-authorize additional agents. Preserve the original implementer/reviewer separation, final ACCEPT gate, local report path and owner diff/manual acceptance. Do not create a new standalone workflow document unnecessarily.

## 6. Versioning, release notes and handoff

Target **stable patch `1.1.1`** from the existing `1.1.0`. Prefer completing and reviewing functional changes **before** invoking `npm run version:patch` (which updates `package.json` and `package-lock.json`), then verify consistency and candidate build identity. Do **not** introduce `1.2.0`, a schema migration, `CHANGELOG.md`, or a different release mechanism.

Prepare **proposed GitHub Release notes** (the public changelog) as a small Markdown section in the final handoff or an existing suitable release-planning document; **do not publish**. Suggested substance:

> **Fixed:** Inter-system cargo links now require Helium-3 availability at only one endpoint for bidirectional operation. Fuel warnings appear only when neither end has available fuel, and the Inter-System indicators reflect fuel supplied from either end of a valid link.

Do not overclaim actual native charge readiness: the tracker models known/recorded availability, not precise in-game charge/quantity. Version metadata changes are not authorization for release. No tag or GitHub Release until owner approval after staging acceptance. No production deployment without distinct authorization.

**Final handoff:** supply changed-file inventory, concise architectural summary, test matrix/results, exact version, diff/whitespace state, local independent-review path and final disposition, remaining risks, proposed release notes, and a manual staging acceptance checklist. **Do not commit, push or deploy**; owner will review the patch and separately authorize staging integration and production release.

**Stop condition:** Report `BLOCKED` for a material spec conflict, inability to run mandatory independent review, or otherwise unmet acceptance criteria. Do not dilute or silently reinterpret requirements to obtain a `COMPLETE` outcome.
