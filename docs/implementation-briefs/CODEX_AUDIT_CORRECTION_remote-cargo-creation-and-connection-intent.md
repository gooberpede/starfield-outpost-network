# CODEX AUDIT CORRECTION — Remote Cargo Creation and Connection Intent

## Objective and authority

Update the existing report in place:

```text
docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-REVIEW.md
```

This is a **bounded, report-only reconciliation of maintainer decisions**, not a second broad audit or an implementation task. Preserve useful source findings, evidence boundaries, organization, and detail. Correct all recommendations that depend on the rejected counterpart-intent policy.

The decisions below supersede conflicting requirements in the original audit brief as well as recommendations in the report. In particular, the earlier instruction to preserve a surviving partner's exact destination after ordinary deletion is withdrawn. Do not treat that earlier instruction as an unresolved constraint.

Do not create a second audit report or leave a short addendum above contradictory recommendations throughout the existing report.

## 1. Working baseline and scope

The maintainer has already switched the checkout back to `staging`. Before editing, record the current branch, full HEAD, and staged/unstaged/untracked status. Confirm `staging` is checked out; if not, stop and report rather than switching or changing branches automatically.

The original audit inspected `main` at `18567e816db4f6fc71687cd1e41eea9a5999d6d7`, identical to local `staging` at that time. Preserve that accurate historical baseline. Add a separately labelled correction baseline/date and identify the subsequent maintainer decisions. Do not backdate the correction or imply its policies were approved during the initial audit.

Read the existing report, original feature audit brief, `AGENTS.md`, and relevant current Domain/Architecture/UX guidance. Source inspection is limited to what is needed to reconcile the specified decisions and verify their implementation implications. If application code has changed materially since the audited commit, identify the affected assumptions rather than silently applying stale source locations.

Only the existing report may be edited. Preserve both supplied briefs, the launch runbook, other pre-existing work, and immutable archives. Do not implement code, tests, migrations, localization, or owner-document changes. No commit, push, branch/tag/release, deployment, or remote-setting operation is authorized.

## 2. Settled principle: unfinished choices are not former connections

> Preserve an unfinished destination that the user explicitly selected. Remove established pairings cleanly when disconnected, deleted, or replaced. Never manufacture unfinished or remembered destination intent on a former partner. Undo restores history and is deliberately different from a later ordinary edit.

Keep the report's terminology: a user-facing Cargo Link card is a **pad** (`CargoPad`); a **pairing** is the network-owned bidirectional `CargoLink`; an **incomplete destination** is the user's explicit outpost-only setup choice.

A completed pairing has one reciprocal truth. After A changes from B to C, B must not look connected to A, retain A as an uncompleted destination merely because of that change, or silently reconnect later.

An intentionally unlinked surviving pad receives no incomplete/missing/not-connected issue simply because it used to have a partner. Its independently recorded exports, type, identity and ordering remain intact.

## 3. Replace D1 and its dependent transitions

In the following examples A, B, C, D and N are exact outpost/pad endpoints; O is an outpost; `A → O` means an explicitly selected outpost with no pad chosen.

| Before | Explicit user action | Required result |
| --- | --- | --- |
| A ↔ B | Choose Unlinked at A | A unlinked; B unlinked; pairing removed |
| A ↔ B | Delete A's pad | A deleted; B unlinked; pairing removed |
| A ↔ B | Delete A's whole outpost | A's outpost removed; B unlinked; touching established pairings removed |
| A ↔ B | Choose another remote outpost O at A, without selecting a pad | A → O, because the user chose it; B unlinked |
| A ↔ B | Connect A to free C | A ↔ C; B unlinked |
| A ↔ B and C ↔ D | Connect A to C | A ↔ C; B and D unlinked |
| A ↔ B | Add new remote N at B's outpost | A ↔ N; B remains present and unlinked |
| A → O | Choose Unlinked | A unlinked; explicit unfinished choice cleared |
| A → O | Blur, collapse, navigate, reload, or round-trip supported JSON | Preserve A → O and its incomplete diagnostic; do not revert the choice |

These are **normal, unambiguous editing transitions**, not permission to silently repair contradictory imported records.

Retain an independently recorded unfinished choice on an unrelated pad; do not clear it as collateral cleanup. A previously unfinished selection whose chosen outpost becomes unavailable is still a recorded unresolved reference and must be handled truthfully under the report's missing-parent policy. This is not conversion of an established pairing into intent. Deleting the pad that owns an unfinished choice removes that choice with its owner.

Remove the proposed `cargo-destination-not-connected` / `disconnectedCargoDestination.ts` rule and all detached-former-partner/reconnect machinery justified solely by rejected D1. No third detached-destination diagnostic is approved.

## 4. Simplify the proposed representation

Reassess the recommended persisted shape under the corrected policy. The narrow target is:

- completed/exact pairing claims remain network-owned;
- only a genuine outpost-only unfinished choice needs new persisted intent;
- connected pads do not mirror their pairing in per-pad destination fields;
- accepted broken imported pairing claims remain preserved as exact records for diagnostics, not converted into guessed intent.

Remove the `kind: 'pad'` intent variant and derived `not-connected` state if their only purpose was preserving former partners. Do not keep obsolete complexity merely to minimize edits to the report. Explain the final recommended shape and exclusivity boundaries; no code is to be changed.

Keep truthful missing-target presentation for an actual retained broken imported claim. It must not be confused with the ordinary pad placeholder, an operative connection, or proof that a user deleted something. Missing/unavailable is the appropriate meaning when provenance of the absence is unknown.

Revalidate, rather than discard, the existing nested-schema **4 → 5** recommendation. The recorded probe showing that the 1.0 reader drops unknown schema-4 fields remains relevant even if intent becomes simpler. Outer collection schema remains **1** unless concrete new evidence requires otherwise. Update migration examples, strict field validation, round-trip cases and older-reader/rollback implications to the simplified representation. Do not invent formerly discarded selections during migration.

## 5. Keep incomplete and missing-endpoint validators separate

### Incomplete destination

Retain the proposed `cargo-destination-incomplete`, calibrated **operational / warning** against the comparable rules already inspected. It applies to a user's recorded outpost-only choice awaiting remote pad selection, with no competing pairing claim. It is not triggered by exports alone or by becoming unlinked after a former pairing is removed.

### Missing endpoint

Retain `cargo-link-endpoint-missing`, calibrated **structural / error**. It diagnoses actual unresolved stored references, including retained imported pairing claims. Keep the explicit missing-parent branch and precedence where appropriate; never create an empty/dummy pad identity to reuse this validator.

**Normal deletion of an established connection must not create a missing-endpoint error on the surviving pad:** the normal mutation removes the pairing and leaves that pad unlinked. Imported broken records are a separate case.

Keep issue metadata, truthful target labels, deduplication and navigation to surviving repair locations. No incomplete warning should duplicate a missing endpoint or contradiction diagnostic for the same underlying failure. Unrelated supply/type/capacity diagnostics may still coexist.

## 6. Settled imported-conflict policy and explicit repair

For imported pairing records that pass the supported format checks but describe contradictory or structurally impossible topology:

1. Preserve the supplied records and stable identities.
2. Report the applicable structural errors; do not choose a winning pairing.
3. Do not silently delete competing claims, rewrite them into unfinished choices, or let first-array-match presentation imply a valid connection.
4. Exclude ambiguous, missing-endpoint and self-endpoint pairings from routed supply. Keep unrelated unambiguous pairings operational.
5. Require explicit user action to resolve the records.

This accepts the report's D2 routing exclusion, not its alternative of preserving inconsistent first-match/all-record routing. Routing eligibility remains a structural-resolution check, **not a blanket validation-severity gate**. Preserve existing treatment of otherwise resolved pairings with fuel, type, capacity or unresolved-export diagnostics. Do not introduce a new general same-outpost policy.

Keep the distinction between malformed wire input and readable domain-invalid data. Preserve established rejection of malformed JSON, unsupported schemas, invalid field types, duplicate entity identities, existing rejected duplicate-pair shapes and technical-envelope breaches. Do not use this correction to broaden imports. Equally, do not newly reject currently supported multiple-distinct-pair claims merely to avoid displaying their errors. Describe any new-format exclusivity checks precisely; no lossy normalization to hide contradictions.

**A repair must be available without an implicit winner.** Ordinary Add/relink commands may fail atomically when they cannot identify what would be replaced, but this must not disable deliberate removal of an identified erroneous pairing. Recommend the smallest UI/command path for inspecting the competing records and explicitly removing a particular pairing by its stable record identity from any participating surviving pad. Do not make hand-editing JSON the sole repair route for those editable endpoints, and do not design a general network-repair subsystem.

A correctly labelled explicit operation removing all identified conflicting pairings is not automatic repair, but must not be disguised as an ordinary first-match unlink. Describe the proposed minimal repair action and its exact scope. Fully orphaned records must retain honest network-level diagnostics and explicit recovery guidance rather than fabricated navigation targets.

## 7. Approved conflict-error placement

For:

```text
A / Pad 1 ↔ B / Pad 2
A / Pad 1 ↔ C / Pad 4
```

emit **one structural/error entry for each distinct surviving participating pad**:

| Issue location | Message meaning | Activation destination |
| --- | --- | --- |
| A / Pad 1 | Conflicting pairings involve B / Pad 2 and C / Pad 4 | Outpost A |
| B / Pad 2 | Its pairing with A / Pad 1 conflicts with A / Pad 1 ↔ C / Pad 4 | Outpost B |
| C / Pad 4 | Its pairing with A / Pad 1 conflicts with A / Pad 1 ↔ B / Pad 2 | Outpost C |

This is **three error entries representing one underlying conflict affecting three pads**. A is not repeated for each incident record; do not add a fourth network-level duplicate or retain a separate old central-pad error for the same conflict.

Use neutral wording such as **“Conflicting cargo-link pairings.”** Do not say B or C is itself linked multiple times: each appears in only one record. Error location identifies an inspection/repair entry point, not blame.

Specify detection in terms of qualified `(outpostId, cargoPadId)` identities and the actual competing pairing records. Propagate the diagnostic to both surviving ends of each directly conflicting pairing, deduplicating each participating pad for this conflict rule. Do not mark every pad at an affected outpost, follow arbitrary unrelated network connectivity, or rely on names/ordinals as identities. Include overlapping conflicts and record-order independence in the design.

Each entry carries its own outpost/pad navigation identity plus sufficient stable relationship context to explain the same contradiction. Activation follows the existing outpost-targeted interaction; any narrowly justified pad reveal already proposed by the audit remains presentation-only. Do not replace this with a new grouped multi-destination Validation control or redesign all issue navigation.

For the example, explicit removal of A ↔ B at B leaves A ↔ C and B unlinked. Recomputed conflict errors then disappear at A, B and C. If other contradictions remain, only resolved issues clear. Navigation alone does not repair anything; Undo of the repair restores the original records and corresponding diagnostics.

Retain existing rule identity where sensible, but revise its message and responsibility description to cover **participation in conflicting pairings**, not just the multiply-claimed central pad. Keep independent missing/self-reference responsibilities distinct and avoid double-reporting the same self-link as a multiple-pair conflict.

## 8. Preserve atomic history and Planned Supply semantics

Update every history example to the corrected before/after states:

- Outpost selection is one persisted, undoable edit; blur/navigation is not an extra cargo edit.
- Remote Add appends the new empty pad, replaces/completes the pairing, and reconciles supply in **one** entry.
- Undo Add from a placeholder restores that explicitly selected outpost and placeholder.
- Undo Add replacing A ↔ B restores A ↔ B and removes the newly created remote pad; it does not restore a fabricated detached intent.
- Choosing another outpost and then Add remains two actions: first Undo restores the new outpost's placeholder with the former partner unlinked; second Undo restores the earlier pairing.
- Explicit conflict repair records only the user-chosen repair and its defined collateral effects; Undo/Redo restores exact records, stable IDs and initiating context.

Planned Supply retirement remains unchanged. A new supply source can retire matching planning in the same action. Later ordinary deletion, unlinking, reassignment or production loss does not revive it. Undo may restore planning from the actual earlier snapshot. Do not infer or persist a hidden promise to recreate retired planning.

Keep current-state/expected-network guards, no-op identity preservation and one-time UUID generation. Do not run supply reconciliation after a rejected command. Remote creation stays at the initiating local outpost and does not reset unrelated expansion or scroll state.

## 9. Preserve all unaffected feature decisions

Do not reopen:

- zero-pad destinations being selectable; same-network scope and local-outpost exclusion;
- live counts of **all recorded pads**, not free pads or completed pairings, using natural localized zero/one/many forms;
- placeholder, existing remote pads in order, **+ Add cargo link** last;
- a fresh appended pad with no exports; no reuse heuristic, confirmation, remote navigation, auto-fuel or auto-Planned Supply;
- new pad regular for the same known system, Inter-System for different known systems, and local-pad-type fallback when either system is unknown/unresolved; local type stays unchanged;
- permissive gameplay capacity with existing warnings and unchanged technical storage/import envelopes;
- collision-safe native option encoding, committed-change handling, keyboard/focus verification and localization/review consistency;
- exclusion of broken routes in **both directions** across availability, manufacturing, logistics, provenance, Matrix, Search and Cargo summaries.

The existing source probes are historical evidence, not proof that the correction has been implemented or retested.

## 10. Reconcile the whole report, not only the decision ledger

Update affected portions of sections 1 and 3–12 and the concluding schema/disposition summary. In particular reconcile:

- approved-requirement and documentation-conflict tables;
- illustrative persisted/derived shapes and invariants;
- deletion, unlink, occupied replacement, Add and repair transition tables;
- validator predicates, severity, issue identity, multiplicity and navigation;
- supply eligibility and both-direction safeguards;
- migration, recovery, import, rollback and compatibility examples;
- selector/collapsed copy, obsolete detached tokens and localization inventory;
- affected-file inventory, removing the third validator and unnecessary exact-intent machinery;
- finite regression plan, implementation sequence and D1/D2 decision ledger.

Preserve a short historical note: D1's remembered-counterpart recommendation was rejected; clean disconnection was selected. D2's structural routing exclusion was accepted, with explicit user repair and per-participating-pad errors. These are settled, not pending approval.

Do not rewrite historical source behaviour or original probe results to match the proposed future design. Current owner docs remain unchanged during this report-only correction; identify required later edits without performing them.

## 11. Revised finite regression requirements

Retain unaffected cases and replace obsolete expectations. Include at least:

1. Both directions of ordinary unlink/pad deletion/outpost deletion leave surviving former partners unlinked, exports preserved, no fabricated intent or dangling error, and no old-route supply.
2. Occupied replacement A ↔ B plus C ↔ D becomes A ↔ C with B/D unlinked.
3. Explicit outpost-only choice survives navigation/reload/round-trip and is undone separately from Add.
4. Incomplete selection, retained imported missing endpoint, intentionally unlinked pad and imported conflict have truthful, distinct diagnostics and presentation.
5. A ↔ B plus A ↔ C produces exactly three participating-pad conflict errors, neutral text and A/B/C navigation; shared endpoints are deduplicated and unrelated routes remain unaffected.
6. Reordered records, overlapping contradictions and repeated pad IDs in different outposts preserve deterministic qualified identity and error placement.
7. User-selected pairing removal from A, B or C is possible without arbitrary first-match cleanup; remaining valid records survive, errors/routing recompute, and Undo restores the original conflict.
8. No conflict/missing/self record routes or seeds manufacturing in either direction; otherwise resolved gameplay-diagnostic cases retain established supply semantics.
9. Add/replace/repair Undo and Redo preserve exact IDs, prior selected values, local context and the actual historical Planned Supply state.
10. Simplified new intent migration/round-trip, old schema-4 storage acceptance, strict failed-import atomicity and older-reader rejection remain covered. Missing-reference identity tests use deliberately retained/imported claims, not normal deletion that now cleans up pairings.

Specify proposed tests only. No new tests, fixtures, harnesses, permanent scripts or browser sessions are required for this correction.

## 12. Verification and handoff

Run `git diff --check` and `git status --short`. If the report remains untracked, check its whitespace/EOF separately because ordinary diff checks do not cover it. Inspect the report for stale recommendations involving survivor exact intent, detached/not-connected states, automatic reattachment, pending D1/D2, central-pad-only errors or blanket blocking of explicit repair; retain such wording only as clearly labelled rejected history where needed.

No full application test/build/lint run is required. Do not claim new checks or probes ran unless they actually did. Expected change: **the existing audit report only**; all supplied instructions and other pre-existing files stay untouched.

End with the established disposition:

```text
CARGO-A — coherent bounded design; ready for an implementation brief
```

if the corrected design is coherent with no material unresolved decisions. Use `CARGO-B` only for a concrete new incompatibility that source evidence genuinely reveals; list it narrowly. Do not reopen the decisions specified here, and do not declare implementation or migration complete.

Completion summary: correction baseline; updated report path; final representation/schema recommendation; clean-disconnection policy; separate incomplete/missing validators; conflict rule placement/count/navigation; explicit repair path; routing/history guarantees; affected scope/test revisions; actual checks and disposition.

Suggested eventual report commit after review:

```text
docs: reconcile remote cargo connection audit
```

Do not commit or push as part of this task.
