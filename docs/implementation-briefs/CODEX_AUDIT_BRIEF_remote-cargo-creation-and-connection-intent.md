# CODEX AUDIT BRIEF — Remote Cargo Creation and Persistent Connection Intent

## Objective and authority

Audit the design and implementation scope for a post-1.0 Cargo Links improvement that lets a user finish configuring an outpost without navigating to the remote end of each connection.

The work has two connected parts:

1. Select a remote outpost, including one with no cargo links, then choose **+ Add cargo link** in its remote cargo-link selector to create and connect a new remote pad in one undoable operation.
2. Preserve deliberately selected destinations and diagnose incomplete or broken connections instead of silently discarding them when editing is interrupted or a remote endpoint is removed.

The owner has explicitly approved **two separate validators** for:

- a remote outpost selected with no remote cargo link selected;
- a previously selected remote cargo link that no longer exists.

Do not combine these into one generic validator. Recommend categories and severities by comparison with analogous existing rules, not by intuition alone.

**Audit only:** produce a design/review report. Do not implement the feature, change schemas, add validators, modify source or documentation, or perform release operations.

---

## 1. Baseline and documents to read

Work from the current committed `staging` branch. Record branch, full HEAD, application version, all relevant schema versions, and tracked/untracked status before proceeding. The staging checkpoint observed while preparing this brief was:

```text
18567e816db4f6fc71687cd1e41eea9a5999d6d7
```

This is an inspection reference, not permission to reset the checkout. Reconcile any later changes relevant to the feature. Stop for conflicting uncommitted work rather than overwriting it.

Read:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/DOMAIN-RULES.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/BACKLOG.md
```

The approved requirements in this brief supersede the old transient-destination and automatic connection-removal behaviour only where explicitly stated. Unrelated domain and UX conventions remain in force.

This is ordinary post-release work. Do not reopen 1.0 acceptance or modify the published release/tag. The pre-1.0 documentation ZIPs are immutable; do not unpack them into the tracked tree or rewrite them. Current owner documents and source should normally suffice.

## 2. Terminology: distinguish UI cards from connection records

Use the application's established user-facing **Cargo Link** terminology. In the audit, distinguish:

- **Pad/card:** one recorded cargo installation at an outpost (`CargoPad`), with a type and outbound selections.
- **Completed connection:** the bidirectional network-level relationship between two specific pads (`CargoLink` in the current model).
- **Destination intent:** the remote outpost, and possibly a specific remote pad, deliberately selected for a surviving local pad.

These distinctions are for precise design, not authorization to rename the UI or globally rename domain types.

The current model stores completed connections once at network level. Do not casually introduce two competing copies of that relationship.

## 3. Approved remote-selector behaviour

The remote-outpost selector must offer the other outposts in the current network, including outposts with zero pads. Preserve the current exclusion of the local outpost and do not introduce cross-network linking.

Display the number of recorded pads beside every destination name, for example:

```text
Kreet Fe He3 — 2 cargo links
Andraphon Al Fe — 1 cargo link
Ternion Hub — 0 cargo links
```

Count **all pads**, including unlinked pads, not completed connections or spare capacity. Use natural localized number/plural formatting. Zero is informative, not disabling. Counts must reflect creation, deletion, and Undo/Redo; they must not be separately persisted.

After selecting a real remote outpost, its pad selector contains the ordinary placeholder, existing pads in their existing order, and **+ Add cargo link** at the bottom. For an empty outpost, the placeholder and Add action are still available.

Selecting Add must:

- append one new remote pad using ordinary stable-ID and label conventions;
- initialize it with no outbound exports;
- connect it to the local pad being edited;
- select the new pad's normal option, rather than leave the action text selected;
- keep the user at the initiating local outpost, with the card expanded and focus remaining usefully on the local selector;
- avoid confirmation dialogs or remote navigation for this routine operation.

Always create a new pad when Add is selected; do not silently reuse an empty existing pad. Existing-pad selection and occupied-pad replacement remain available under their established policy, subject to the intent-preservation analysis below.

## 4. Approved new-pad type and capacity policies

For the **new remote pad only**:

| Location knowledge | Initial type |
| --- | --- |
| Both systems known and equal | Regular |
| Both systems known and different | Inter-System |
| Either system unknown, unselected, or unresolved | Copy the local pad's current type as the fallback |

Use stable system identity. Two blank IDs do not establish a same-system connection. Do not infer a system from display names or silently repair inconsistent body/system data.

Do not change the existing local pad's type automatically. A regular local pad on a cross-system connection remains subject to the existing validator. Later location changes do not automatically retype pads. Do not add fuel, exports, or Planned Supply on the user's behalf.

Remote Add must remain available at or above the game/skill-derived pad limit, matching ordinary Add. Existing capacity warnings apply to the remote outpost. Unknown skill is not zero skill or a fabricated maximum. Distinguish this gameplay policy from the existing technical import/storage envelopes; do not raise or remove those limits incidentally.

## 5. Approved persistence of incomplete destination choices

Choosing a remote outpost is a deliberate, undoable recorded edit, not an expendable component-local draft.

The choice must survive:

```text
tabbing or clicking away
collapsing/reopening the card
navigating to another outpost or network and back
ordinary component remounts
browser save and reload
supported export/import round-trip
```

If the user stops before selecting a remote pad, retain the chosen outpost and show the incomplete selection. Do not silently reset it to Unlinked, choose a pad automatically, or create a dummy endpoint merely to trigger validation.

A pad with **no destination deliberately selected** is intentionally unlinked; it must not acquire an incomplete-destination warning solely for being unlinked or having exports configured.

Explicitly selecting **Unlinked** abandons the initiating pad's destination intent and clears its connection as one undoable edit. The audit must specify counterpart handling separately rather than equating an explicit unlink with deletion or silently erasing another pad's recorded intent.

## 6. Approved behaviour after deletion

Example:

```text
Kreet / Cargo Link 1 ↔ Andraphon / Cargo Link 2
```

Removing Andraphon's Cargo Link 2 should remove that pad as requested, but must leave Kreet's surviving pad with enough destination intent to show that its selected remote endpoint is missing and to repair it from Kreet.

Requirements:

- retain Andraphon as the intended destination while that outpost exists;
- preserve the distinction between **never selected a remote pad** and **selected a pad that is now missing**, including after reload/export/import;
- retain sufficient stable identity to avoid treating a different pad with the same displayed ordinal as the deleted pad;
- expose the problem on the surviving, editable local pad;
- exclude the incomplete/broken connection from routed supply in both directions;
- do not recreate the deleted pad or silently select a replacement;
- preserve outbound selections on surviving pads;
- make pad deletion and all collateral relationship/intent changes one Undo entry.

The exact UI for the missing selection is to be recommended: for example, an explicit unavailable selected option rather than an unexplained reset to the ordinary placeholder. It must not look like a never-completed selection.

Deleting a whole remote outpost also needs a defined recovery path. Preserve useful target identity without fabricating a replacement outpost. Do not allow Add to create a pad inside an outpost that no longer exists.

## 7. Trace the existing implementation before proposing changes

Inspect at least these current owners and their callers/tests:

```text
src/ui/components/CargoPadEditor.tsx
src/ui/components/CargoPadsEditor.tsx
src/App.tsx
src/domain/models.ts
src/domain/collectionEditingSession.ts
src/domain/cargoPadLabels.ts
src/domain/capacity.ts
src/domain/availability.ts
src/domain/logistics.ts
src/domain/validation/registry.ts
src/domain/validation/types.ts
src/domain/validation/rules/missingCargoLinkEndpoint.ts
src/domain/validation/rules/cargoPadLinkedMultipleTimes.ts
src/domain/validation/rules/regularCargoPadCrossSystem.ts
src/domain/validation/rules/interstellarCargoHelium3.ts
src/domain/validation/rules/cargoPadSkillLimit.ts
src/domain/validation/rules/unresolvedCargoExport.ts
src/ui/validationPresentation.ts
```

Trace `draftLinkedOutpostIds`, selection/remount keys, `changeLinkedOutpost`, `changeLinkedCargoPad`, `addCargoPad`, `deleteCargoPad`, `deleteOutpost`, `unlinkCargoPad`, `setCargoLink`, history restoration, and all consumers of `network.cargoLinks`.

Preparation inspection indicates that partial destinations are currently component-local, deletion removes the associated connection record, and the missing-endpoint validator only examines retained connection records. Verify and cite the actual source locations; do not mistake these old behaviours for the new requirements.

## 8. State model and architecture options

Provide an explicit state model covering at least:

```text
intentionally unlinked
remote outpost selected, remote pad never selected
completed connection with both pads present
previously selected remote pad missing
remote outpost missing
previous partner still exists but is linked elsewhere/displaced
malformed or contradictory imported relationship data
```

Compare a small number of viable representations, including where practical:

1. Keep completed connections network-owned and add a distinct persisted intent representation for incomplete/unresolved selections.
2. Evolve the network-level model to represent incomplete, connected, and unresolved states explicitly with discriminated shapes.
3. A materially simpler alternative justified by current architecture, if one exists.

Compare ownership, reciprocal consistency, duplication, migration cost, validator clarity, derived supply, history, and repair UX. Recommend the narrowest coherent design, not the fewest changed lines.

For the recommendation, provide illustrative TypeScript shapes, invariants, and which layer owns transitions. Do not implement them.

Specifically establish:

- one unambiguous authority for a completed pairing;
- how intent is owned when only one endpoint survives;
- whether intent reserves any remote pad (do not silently change current replacement policy);
- how new connections consume/replace relevant intent without leaving stale duplicate state;
- how record counts and identity scopes remain bounded;
- how missing identity is preserved without an unbounded tombstone/history subsystem.

Do not claim an imported absent ID proves a historical deletion. Missing-target copy should remain truthful when the reason is unknown. Old data cannot recover intent already discarded by older application versions; document that limit rather than inventing it.

## 9. Two separate validators and severity calibration

The two requested situations require **distinct rule identities and predicates**, not one rule with two messages.

### Incomplete destination

A surviving pad has a selected remote outpost but no remote pad has yet been selected. It is an intentionally representable incomplete configuration, not malformed data.

### Missing selected remote pad

A surviving pad has an exact previously selected remote-pad target that no longer resolves. It must not be downgraded to the first case merely by clearing the missing ID.

The existing `cargo-link-endpoint-missing` rule may be retained/adapted for the second responsibility if appropriate. Two separate validators does not require two additional validators plus a redundant legacy one.

For each rule recommend:

```text
stable rule ID
predicate and exclusions
category and severity
message meaning and localization parameters
surviving outpost/pad navigation target
repair action
interaction with existing rules
```

Compare with current missing-endpoint, multiple-link, cross-system, unresolved-export, and capacity severities. The existing missing-endpoint rule reports a structural error; do not silently weaken it. An ordinary incomplete selection may justify a warning, but explain the analogy and keep validation non-destructive.

Define non-duplication/precedence for remote-outpost absence, absent pad, incomplete selection, and contradictory connections. Do not emit both new conditions for the same underlying state. Legitimate additional capacity/fuel/supply diagnostics may coexist.

A displaced partner that still exists is **not a deleted pad**. Specify its treatment using an appropriate existing rule or identify a finite additional decision; do not shoehorn it into either requested predicate.

Validation should be derived from recorded state, not from whether a DOM blur event happened. Recommend timing that remains non-blocking without requiring tab-out history to determine validity.

## 10. Transition and counterpart-impact table

Provide a before/action/after table specifying persisted state, counterpart changes, validation, supply, and Undo for:

- selecting an outpost on an unlinked pad, with zero or several remote pads;
- completing the choice with an existing remote pad;
- completing it with Add;
- changing the selected outpost before completing a connection;
- selecting the current outpost/pad again (no-op);
- replacing an existing connection with a newly created pad at the same remote outpost;
- changing to another remote outpost, then using Add;
- selecting a remote pad already connected elsewhere;
- deleting either endpoint pad, including a remote outpost's last pad;
- deleting the whole destination outpost;
- explicitly selecting Unlinked;
- repairing a missing target by selecting an existing pad or using Add;
- editing locations/types after connection;
- navigating away while incomplete, then returning or reloading.

Distinguish the acting pad, a former local partner, and any displaced remote partner. Do not silently delete their pads or exports. Recommend exactly which intent remains for each survivor and when a warning clears.

Existing behaviour removes an established connection when the user selects a different remote outpost. The approved direction preserves this as a separate recorded edit, now with persistent new destination intent. Do not turn the whole two-dropdown interaction into a hidden wizard transaction.

If counterpart handling has a genuine product ambiguity not resolved by the requirements, show the smallest concrete example, recommend a default, and list that finite decision rather than inventing consensus.

## 11. Atomic remote creation, Undo/Redo, and context

Create-pad-and-connect must be one semantic network operation, not consecutive calls to handlers that each create their own history entry.

Analyse how to validate current endpoints before mutation, generate identities once, append the remote pad, replace the relevant pairing, preserve displaced intent, and reconcile supply within one immutable before/after transition.

Required Undo examples:

| Before Add | After Undo of Add |
| --- | --- |
| Remote outpost selected, pad placeholder | New remote pad/connection removed; selected outpost and placeholder restored |
| Existing remote pad selected at that outpost | New pad removed; prior exact connection and selected value restored |
| Selected missing remote pad | New pad removed; prior missing-target state and corresponding diagnostic restored |
| Local pad created in an earlier action | Local pad remains; only remote creation/connection is undone |

Redo restores the same pad and connection identities, not another newly generated pad. Repeated cycles must not accumulate records.

Changing the remote outpost and then choosing Add remains two actions: first Undo restores that outpost's incomplete choice; second Undo restores the preceding destination/connection.

Undo/Redo after navigation must restore the initiating **local** Network + Outpost context. Preserve unrelated expansion, selection, scroll, and presentation where existing rules require it. Do not serialize focus or collapse state merely to implement persistent domain intent.

A failed/stale/no-op action must not leave a pad without its intended connection, partially unlink another pad, write storage, or add a spurious history entry. Audit duplicate event/rapid activation handling and applicable current-state guards.

## 12. Derived supply: prevent ghost routes without changing other rules

Audit inbound/outbound routing, Matrix imports/logistics, Search results, manufacturing feasibility, validation dependencies, provenance, fuel state, and Planned Supply reconciliation.

**Only a completed, resolvable pairing may route cargo under the new model.** Incomplete, missing-endpoint, or merely remembered destination records must not contribute supply.

Test both directions and both missing-local and missing-remote endpoints. This matters if broken connection records are retained: some current inbound paths locate the opposite pad from the outpost ID without proving the receiving pad still exists. Inspect `availability.ts` and `logistics.ts` specifically; simply retaining records formerly deleted is not sufficient.

Do not turn this into a general “all validators must pass before supply counts” policy. Preserve the existing distinction between a structurally resolved pairing and other diagnostic states, such as capacity, fuel, or pad-type warnings/errors. The audit must identify the exact routing eligibility boundary.

## 13. Planned Supply: settled rule, not a new design decision

Preserve:

```text
New actual source -> matching Planned Supply may retire.
Later deletion/unlink/reassignment/loss of production -> do not recreate it.
Undo -> restore the historical before-state, including Planned Supply when present.
Redo -> restore the corresponding historical after-state.
```

The newly created remote pad has no exports, but the existing local pad may already export resources/products to it. Remote supply and automatic retirement may therefore change immediately.

Include all such collateral effects in the same create-and-connect history action. Apply the existing reconciliation policy; do not seed fuel/planning/export records and do not invent a general supply-restoration mechanism.

## 14. Persistence, import/export, and migration audit

Trace the proposed state through:

```text
src/data/networkMigration.ts
src/data/networkCollection.ts
src/data/serialization.ts
src/data/externalImportValidation.ts
src/data/storage.ts
src/data/storageEnvelope.ts
src/data/storageCoherence.ts
related recovery, history, fixture, and capacity tests
```

Record current collection, nested network, and storage-envelope versions separately. Recommend exactly which versions must change, if any. A schema migration is allowed as a **design recommendation**, not a reason to avoid required persistent intent; no migration is implemented in this task.

Provide a compatibility table for:

- valid 1.0 exports and stored networks, linked and intentionally unlinked;
- previously supported legacy network shapes;
- old data with already-missing endpoint references;
- new incomplete-destination and missing-target records;
- wrong-type, empty-ID, duplicate-ID, contradictory, and over-envelope inputs;
- new exports opened by the older 1.0 application/after deployment rollback.

Do not assume older readers safely preserve new fields; inspect their rejection/default/drop behaviour. Do not silently bump the outer collection version simply because the nested model changes.

New ordinary incomplete/broken states must round-trip within the supported envelope without migration erasing intent. Preserve strict external input validation and bounded storage recovery as separate policies. Explicitly distinguish supported incomplete configuration from malformed input.

Maintain failed-import atomicity for collection, selection/context, history, and storage. Assess additions to capacity accounting without relaxing limits as incidental cleanup. No real user save is required: propose synthetic compatibility fixtures.

## 15. UX, localization, and keyboard audit

Identify the affected selectors, collapsed summaries, tooltips, validation messages, and history labels. Recommend concise states that distinguish Unlinked, incomplete destination, and missing selected target while retaining the remote outpost name or safe ID fallback.

The Add entry is an action, not a persisted pad ID. Audit collision-safe selection handling, keyboard selection/commit behaviour, cancellation, repeated events, and replacement of its displayed value after completion. Do not replace native selects or add confirmation UI without demonstrated necessity.

Keep count labels usable with long outpost names and localize number/plural handling through the existing system across all supported locales. Do not persist localized ordinals or names as identity. Specify narrow component and real-browser checks at normal and constrained/200% layouts; this is not another geometry redesign.

Ensure a missing target can be displayed and repaired even when it is absent from the normal option population. Validation navigation must lead to a surviving editable pad, not only to a deleted object. Identify whether current issue navigation needs adjustment.

List catalogue/review/test artifacts that would need changes. Preserve native-control semantics, focus visibility, and existing accessibility limitations; no broad Narrator or Apple testing initiative is included.

## 16. Finite regression plan

Produce named eventual tests with source ownership, setup, action, and observable assertions. Cover at least:

1. Zero-pad destination selectable; count zero; Add last in list; create and select one empty remote pad.
2. Same known system, different known systems, and unknown/blank/unresolved system fallback; existing local type unchanged.
3. Counts for zero/one/many, over-capacity warning, and unknown skill without a fabricated cap.
4. Incomplete destination persists through blur, collapse, navigation/remount, reload, and export/import.
5. Intentionally unlinked pad does not trigger the incomplete validator, even with exports.
6. Incomplete and missing-selected-target validators remain distinct, correctly classified, and not duplicated.
7. Delete either connected endpoint; preserve survivor intent and exports; no routed supply; diagnostic is repairable locally.
8. Delete/recreate a pad with the same displayed ordinal: new identity does not silently replace the missing target.
9. Delete destination outpost; truthful fallback, usable repair, and no Add into a missing outpost.
10. Explicit Unlinked and occupied-target reassignment, including the audited counterpart/displacement policy.
11. Single-entry Add Undo/Redo from placeholder, existing pairing, and missing-target states; stable IDs across repeated cycles and local context after navigation.
12. Remote source arrival retires Planned Supply in that action; later ordinary source removal does not revive it; Undo can restore it.
13. No ghost imports/manufacturing/Search/provenance after either endpoint is missing; valid existing routing semantics otherwise unchanged.
14. Old-to-new migration, new-state round-trip, malformed import non-mutation, technical envelopes, and older-reader/rollback behaviour.
15. Local selector focus/expansion, localized counts/action/history/diagnostics, and native keyboard Add behaviour.
16. Invalid/stale action fails atomically; no extra pad, partial unlink, persistence mutation, or empty history entry.

Do not build a permanent new harness or implement these tests during the audit. Existing read-only tests/probes may be used if they resolve a material uncertainty; report what actually ran. Browser probes, if needed, must use isolated synthetic data, never the owner's production/staging saves.

## 17. Implementation scope, sequencing, and open decisions

Inventory exact affected files/functions, classifying each as required, conditional, or unchanged. Include current owner docs, validators/presentation, session/history, schemas/import/storage, supply consumers, localization, and tests.

Recommend one coherent implementation or a small dependency-ordered sequence with complete behaviour at each usable boundary. Do not propose shipping persistent partial states before routing, validation, and serialization can handle them safely.

Identify obsolete transient-draft logic to retire rather than leaving two competing sources of truth. Keep explanatory comments intent-first under `docs/CODE-STYLE.md`.

Do not redesign the whole cargo system, reopen resource rules, add cross-network links, introduce telemetry/backends, or alter archives. Distinguish feature-required work from adjacent optional cleanup.

Any remaining product decisions must be finite, concrete, and accompanied by a recommendation. Already approved choices—persistent intent, separate validators, counts, type defaults, permissive capacity, and Planned Supply behaviour—are not open questions.

## 18. Deliverable and disposition

Create only:

```text
docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-REVIEW.md
```

Include:

1. Baseline and evidence boundaries.
2. Current end-to-end flow with precise source locations.
3. Approved requirements versus current behaviour.
4. State model, architecture comparison, recommended shapes/invariants.
5. Complete transition/counterpart table.
6. Two separate validator specifications and severity comparisons.
7. Atomic creation/history/context design.
8. Routing and Planned Supply safeguards.
9. Persistence/schema/import/storage/rollback compatibility matrix.
10. UI/count/localization/focus implications.
11. Affected-file inventory and finite regression plan.
12. Recommended implementation sequence and exact unresolved decisions, if any.

End with one disposition:

```text
CARGO-A — coherent bounded design; ready for an implementation brief
CARGO-B — design identified; finite maintainer decisions remain
CARGO-C — materially broader redesign needed; bounded alternative required
```

State schema impact independently. A necessary, well-understood migration does not automatically imply CARGO-C.

## 19. Audit-only verification and handoff

No source/CSS/test/catalogue/reference/schema/version changes. Do not create implementation scaffolding, update owner docs, install dependencies, commit, push, create tags/branches/releases, deploy, or change any remote settings. Leave the supplied brief untouched and keep the new report outside immutable archives.

Run:

```sh
git diff --check
git status --short
```

Because an untracked report is not covered by ordinary tracked diff checks, check its whitespace separately. Remove temporary audit-only outputs/processes without touching pre-existing local work. No full build/test suite is required for a report-only task.

Completion summary: baseline; report path; disposition; recommended representation; separate rule IDs/categories/severities; migration and older-reader impact; deletion/unlink/displacement policy; Undo/Redo and supply guarantees; affected-file/test scope; any finite decisions; actual verification and confirmation that no implementation or remote operation occurred.

Suggested commit message after maintainer review:

```text
docs: audit remote cargo creation and connection intent
```
