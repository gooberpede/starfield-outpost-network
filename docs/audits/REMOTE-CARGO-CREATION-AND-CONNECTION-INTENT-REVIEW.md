# Remote Cargo Creation and Connection Intent Review

Original audit date: 1 October 2026 (Australia/Sydney).
Correction date: 1 October 2026 (Australia/Sydney), after the original audit and
the maintainer's switch to staging.

This is a design report, not an implemented feature. The subsequent audit
correction brief settles the counterpart and imported-conflict policies and
supersedes conflicting requirements in the original brief. The recommendations
below incorporate those decisions throughout; remaining implementation details
are recommendations for an implementation brief. Only this report was edited.
No feature, validator, schema migration, catalogue, owner-document,
application-version, or release change was made.

## 1. Baseline and evidence boundaries

### Original audit baseline (historical)

| Item | Observed baseline |
| --- | --- |
| Checked-out branch | `main` |
| Full HEAD | `18567e816db4f6fc71687cd1e41eea9a5999d6d7` |
| Local `staging` | Same full commit as HEAD and the brief's inspection checkpoint |
| Reconciliation | `git diff --stat staging HEAD` and checkpoint-to-HEAD log are empty. Inspection therefore uses exactly the requested committed staging tree without switching the checkout. No later feature changes exist between these local refs. |
| Application | `1.0.0`, `package.json:5` |
| Collection schema | `1`, `src/data/networkCollection.ts:10` |
| Nested network schema | `4`, `src/data/networkMigration.ts:15`; also literal `4` in `src/domain/defaults.ts:18` and `src/domain/sampleData.ts:4` |
| Browser storage envelope | **No independently versioned wrapper.** `storage.ts:81-85` writes the collection directly. `storageEnvelope.ts:13-28` defines resource bounds, not a schema version. |
| Reference manifest | `1`, `src/data/referenceManifest.ts:18`; unrelated and unchanged |
| Starting tracked changes | None, staged or unstaged |
| Starting untracked files | `docs/implementation-briefs/CODEX_AUDIT_BRIEF_remote-cargo-creation-and-connection-intent.md`; `docs/implementation-briefs/STARFIELD_OUTPOST_NETWORK_1.0.0_LAUNCH_RUNBOOK.md` |

Both original untracked inputs were left untouched. The launch runbook is not
authority for this feature and was not used to perform release work. No fetch
was needed: this records local refs, not live remote branch state.

### Correction baseline and subsequent authority

| Item | Observed correction baseline |
| --- | --- |
| Checked-out branch | `staging`; left on that branch |
| Full HEAD | `18567e816db4f6fc71687cd1e41eea9a5999d6d7` |
| Local `main` and `staging` | Both at that full commit; no committed difference from the audited tree |
| Starting staged / unstaged tracked changes | None / none |
| Starting untracked files | This existing report; the original audit brief; `CODEX_AUDIT_CORRECTION_remote-cargo-creation-and-connection-intent.md`; the launch runbook listed above |
| New authority | The correction brief rejects remembered former-partner intent, accepts structural routing exclusion, and specifies explicit record repair and per-participating-pad errors |

No application code changed between the audit and correction baselines, so the
original source citations remain applicable. The original branch observation
above is historical, not a recommendation to switch branches. The correction
decisions were approved subsequently, even though both review dates are the
same local calendar date. Both briefs and the runbook remain untouched.

Repository guidance consulted: `AGENTS.md`, `docs/CODE-STYLE.md`,
`docs/DOMAIN-RULES.md`, `docs/ARCHITECTURE.md`, `docs/UX-DESIGN.md`,
`docs/IMPLEMENTATION-WORKFLOW.md`, and `docs/BACKLOG.md`. Localization source,
review contracts, and relevant portions of `docs/localization/LOCALE-ONBOARDING.md`
were also inspected. Source locations in this report refer to the full HEAD
above; ranges identify the inspected responsibility rather than future code.

Original evidence is source inspection plus three bounded, assertion-based Node
probes against synthetic in-memory data, described in section 13. Correction
work reread both briefs, this report, AGENTS and relevant current Domain,
Architecture and UX guidance, with limited validation-source inspection. The
historical probes were not rerun. No browser or real save was opened. No full
test suite, build, lint, screen-reader or real-browser acceptance is claimed.
Immutable pre-release archives were not unpacked or
changed. The audit needs no missing prior-chat material.

### Documentation reconciliation

- The correction withdraws the original brief's survivor-intent preservation
  requirement. Clean established-pair removal agrees with
  `DOMAIN-RULES.md:1064-1072`; surviving former partners become unlinked.
  Persist only explicit unfinished outpost choices. An unrelated unfinished
  choice whose selected outpost disappears retains that real unresolved
  reference; it is not an intent manufactured by deletion.
- Imported contradictions remain recorded and require explicit correction,
  consistent with `DOMAIN-RULES.md` section 43. Their diagnostic placement and
  structural routing exclusion follow the subsequent approved correction.
- `DOMAIN-RULES.md:1024-1025` suggests preventing selection of an occupied pad;
  `App.tsx:1229-1366` actually replaces occupied connections. The brief expressly
  approves continuing that replacement policy, so this audit follows the brief.
  Future owner-document edits must reconcile that sentence.
- `DOMAIN-RULES.md:595` leaves broader same-outpost rules unresolved, while
  `DOMAIN-RULES.md:1300-1332` describes different-outpost routing. The feature's
  selectors and commands must exclude the local outpost as explicitly required.
  This audit does not invent a new general imported same-outpost validator.
- Exact-control validation navigation is deferred in `UX-DESIGN.md:1071-1076`
  and `BACKLOG.md` under Validation. The brief requires repair on a surviving
  editable pad. A narrowly scoped reveal for these cargo diagnostics is proposed;
  it is not authority to implement general issue highlighting across the app.

## 2. Current end-to-end flow

User-facing **Cargo Link** continues to mean a recorded installation/card. In
this report, **pad** means `CargoPad`, **pairing** means the bidirectional
network-level `CargoLink`, and **intent** means a pad's explicitly selected
remote outpost awaiting pad selection. No global type or UI rename is proposed.

| Owner and precise location | Current behavior and implication |
| --- | --- |
| `src/domain/models.ts:82-115,138-143` | A pairing contains an ID and two exact `{outpostId,cargoPadId}` endpoints. Pads contain ID, label, type and outbound items. No persisted incomplete destination exists. |
| `src/ui/components/CargoPadEditor.tsx:95-104,167-215` | Other outposts are populated in supplied order, but zero-pad destinations are disabled at line 178. Only zero gets explanatory text; ordinary destinations show no count. The pad select contains a placeholder and existing pads, with no Add option or explicit missing-target option. |
| `src/ui/components/CargoPadsEditor.tsx:147-153,598-635` | `draftLinkedOutpostIds` owns incomplete destination selection. An outpost change invokes unlink if a pairing exists, then changes this component-local map. Selecting an outpost on an unlinked pad creates no history entry. |
| `CargoPadsEditor.tsx:645-664,760-780` | `changeLinkedCargoPad` ignores an empty pad choice, calls `onSetCargoLink`, then deletes the draft. An existing pairing overrides a draft, allowing Undo of unlink to show the old exact pairing. |
| `CargoPadsEditor.tsx:162-174,231-235,782-807,884-888,933-935` | Collapse state is separate. Collapse unmounts only the detail child, so a draft can survive collapse/blur in the current parent instance; it is not correct to claim every blur already loses it. Collapsed text and semantic summaries use the completed remote endpoint and may say Unlinked while a draft exists. Local Add focus targets the new local disclosure. |
| `src/App.tsx:2313-2386` | Callbacks bind the selected local outpost. The Cargo editor key includes saved-network ID, selected-outpost ID and presentation epoch (`2315`); navigation/remount loses drafts. |
| `App.tsx:1027-1069`; `src/domain/cargoPadLabels.ts:3-13` | Ordinary Add creates one UUID pad, invariant `Pad N` label, regular type, empty exports; appends in one action with no skill-cap gate. Deletion/reorder renumber labels while preserving IDs. |
| `App.tsx:1081-1156` | `deleteCargoPad` removes the pad, renumbers survivors, removes every referencing pairing, then calls Planned Supply retirement in one update. It does not leave survivor destination intent. |
| `App.tsx:826-880` | `deleteOutpost` removes the outpost and all touching pairings, chooses a surviving outpost when necessary, and records one action. The last outpost cannot be deleted through this handler. |
| `App.tsx:1167-1218` | `unlinkCargoPad` checks the rendered network, finds the first incident link and removes that record. With no link, it is a no-op. Existing exports remain. There is no persisted intent to clear. |
| `App.tsx:1229-1366` | `setCargoLink` checks endpoint existence and same-pair no-op against the rendered network, generates a link UUID, removes pairings touching either selected pad, appends the new pairing and retires fulfilled Planned Supply. Former partners become unlinked without remembered targets. |
| `CargoPadsEditor.tsx:478-587` | Destination option labels expose contents and an occupied pad's current partner. They remain selectable. Current-pair occupancy wording is suppressed. |
| `App.tsx:455-466`; `src/domain/collectionEditingSession.ts:205-219` | One updater is dispatched to the active network and recorded as one whole-collection before/after entry. Returning the identical network reference is a no-op. The reducer uses current state, but many App guards currently run outside the updater. |
| `collectionEditingSession.ts:265-285,311-390`; `App.tsx:1534-1569` | Undo/Redo restores snapshots and action context. Presentation reset detects membership at the initiating selected outpost, not every remote pad. Removal has a narrow expansion-restoration exception. Ordinary same-context value changes do not remount Cargo. |
| `App.tsx:432-442`; `src/data/storage.ts:35-94` | Collection identity changes cause persistence. Draft-only changes do not. Failed recovery preserves original bytes until a subsequent persisted edit; failed save keeps live edit/history with an unsaved status. |
| `src/domain/validation/rules/missingCargoLinkEndpoint.ts:60-98` | Only retained pairing records are checked. Each missing endpoint produces a structural/error issue targeted at the missing endpoint itself; normal deletion removed the record before this validator could see it. |
| `src/ui/validationPresentation.ts:178-203`; `src/ui/validationInteraction.ts:24-63`; `App.tsx:2410-2416` | Presentation falls back to raw IDs, but issues are actionable only when `outpostId` exists. Navigation currently selects an outpost; it does not reveal a pad. A diagnostic aimed only at a deleted outpost cannot be activated. |

### Supply and all direct `cargoLinks` consumers

The direct production consumers found by repository search are:

- App's editing operations and `CargoPadsEditor` relationship presentation above.
- `availability.ts:47-82`, `logistics.ts:47-89,98-154`, and
  `provenance.ts:110-155` for supply and route presentation.
- Validators `missingCargoLinkEndpoint`, `cargoPadLinkedMultipleTimes`,
  `regularCargoPadCrossSystem`, `interstellarCargoHelium3`, and `selfLinkedCargoPad`.
- `networkMigration.ts`, `externalImportValidation.ts`, `storageCoherence.ts`
  and storage/import envelopes for boundary checks and reconstruction.
- `models.ts`, `defaults.ts`, `sampleData.ts`, and
  `src/dev/historyBenchmark.ts` for shape/fixtures and synthetic transitions.

No hidden second persisted pairing owner was found. Relevant indirect consumers
are Matrix imports/logistics (`OutpostStatusMatrix.tsx:189-190`), Search
(`itemSearchResults.ts:48-74`), manufacturing feasibility and Planned Supply
retirement in `availability.ts`, and manufacturing/organic-input/fuel/export
validators. These consumers require coverage even where their source need not
change.

## 3. Approved behavior versus the baseline

**Settled principle:** preserve an unfinished destination that the user explicitly
selected. Remove established pairings cleanly when disconnected, deleted or
replaced. Never manufacture destination intent on a former partner. Undo restores
history and is deliberately different from a later ordinary edit.

| Approved requirement | Gap and required design consequence |
| --- | --- |
| Every other same-network outpost is selectable, including zero pads | Remove the zero-pad disable. Derive all-pad counts from current `cargoPads.length`; preserve order and local exclusion. |
| Placeholder, existing pads in current order, Add last | Add a distinct action option when the selected remote outpost exists and topology is unambiguous, even with zero pads or at/above skill capacity. |
| Always create a fresh empty remote pad and connect | One semantic command; no reuse heuristic, remote navigation, confirmation, auto-exports, fuel or planning entries. |
| Default only the new pad's type | Both nonblank system IDs must resolve in reference data. Equal known IDs give regular; different known IDs give interstellar; either unknown/unresolved gives current local type. Do not infer through bodies or names. |
| Persist outpost-only selection | Native selection change creates its own domain edit/history entry; serialize it. Blur is not a commit boundary. |
| Distinguish unlinked, unfinished, connected, retained missing reference and conflict | New per-pad intent stores only the outpost. Exact claims remain network-owned; truthful imported missing-target status does not imply deletion or an operative route. |
| Clean unlink, pad/outpost deletion and replacement | Remove affected established pairings; surviving former partners are unlinked with exports/type/IDs/order intact. Create no intent or dangling diagnostic on them. |
| Preserve independent unfinished choices | Leave unrelated choices alone, including a real selected outpost ID that becomes unavailable. Deleting the owning pad deletes its choice. |
| Separate incomplete and missing diagnostics | Add `cargo-destination-incomplete`; adapt `cargo-link-endpoint-missing` for actual unresolved stored references. No third former-partner rule. |
| Preserve supported imported conflicts and permit explicit repair | No winner, deletion or conversion during loading/validation. Emit one structural/error per participating surviving pad; expose record-specific removal from each participant. |
| One Add/repair action including supply effects | Compute the complete immutable result, then reconcile supply in the same snapshot. Undo restores actual prior records and choices. |
| No ghost supply | Both endpoints must resolve and be unambiguous and distinct. Missing, conflict and self claims never route; unrelated pairs and resolved pairs with gameplay diagnostics retain existing semantics. |

## 4. Architecture comparison and recommended state model

### Viable representations

| Representation | Ownership and consistency | Migration, validation and supply | History and repair | Assessment |
| --- | --- | --- | --- | --- |
| Keep `cargoLinks`; separate network-level outpost-choice records keyed by owner endpoint | Clear authority with intent/pairing exclusivity; requires owner lookup, duplicate-owner checks and orphan cleanup | Adds a bounded array and capacity accounting; routing remains separate | Snapshots work; explicit choices require owner lifecycle handling | Viable, but redundant owner IDs and an array are unnecessary |
| Network-level discriminated union for exact claims and outpost-only choices | One collection with different owner counts | Every link reader and link envelope becomes union-aware; accepted broken exact claims must remain intact | Atomic transitions work with additional identity/lifecycle handling | Coherent but larger than needed |
| **Keep `cargoLinks`; one optional outpost-only `destinationIntent` on each pad** | Pad implicitly owns its unfinished choice; pairing exists once at network level; no intent alongside an incident claim | No new record array or identity namespace; retained broken imports keep their original exact records; nested-schema bump required | Snapshots capture choice automatically; deleting owner deletes choice; existing editor can complete/clear it | **Recommended narrowest coherent design** |

Mirroring completed connections into pad fields creates competing authorities.
Keeping only exact pairing records cannot represent an outpost choice before a
pad is chosen without dummy IDs. An App/session map cannot meet reload/export
requirements. The corrected policy needs no per-pad exact-target variant and
no stored memory of former connections.

### Illustrative shapes, not implementation

```ts
interface CargoDestinationIntent {
  outpostId: string
}

interface CargoPad {
  id: string
  label: string
  type: CargoPadType
  outboundItems: CargoItem[]
  destinationIntent?: CargoDestinationIntent
}

// CargoLink and OutpostNetwork.cargoLinks keep their exact endpoint shapes.
// Derived presentation state only; none of these tags is persisted:
type CargoDestinationState =
  | { kind: 'unlinked' }
  | { kind: 'incomplete'; target: CargoDestinationIntent }
  | { kind: 'connected'; link: CargoLink; remote: CargoLinkEndpoint }
  | { kind: 'missing-pad'; link: CargoLink; target: CargoLinkEndpoint }
  | {
      kind: 'missing-outpost'
      target: CargoDestinationIntent
      claim?: { linkId: string; endpoint: CargoLinkEndpoint }
    }
  | { kind: 'conflict'; linkIds: string[] }
  | { kind: 'self-reference'; link: CargoLink }
```

A missing-pad state comes from an actual retained exact claim, never an invented
intent. A missing-outpost state can come from such a claim or an independently
recorded unfinished choice; claim metadata preserves the distinction. Conflict
takes presentation priority over choosing one claim; independent missing/self
facts remain available to their structural validators. Self-reference is a
derived explanation of a retained impossible record, not a new persisted
variant or new validator. Copy says **missing/unavailable**, not **deleted**:
an imported absent ID proves no historical action.

### Invariants and boundedness

1. `network.cargoLinks` owns all completed/exact pairing claims. Only eligible
   claims route. Intent stores one nonempty outpost ID and never supplies cargo,
   asserts reciprocity or reserves any pad.
2. Normal app state gives a pad at most one incident pairing or one unfinished
   choice, never both. Absence of both means unlinked regardless of exports.
   New-format boundary checks reject an intent plus **any** incident raw claim,
   even if that claim is missing, self-referential or conflicting.
3. A normal new pairing has two existing pads in different outposts of the
   current network. Commands exclude local-outpost/cross-network targets.
   Identity uses qualified `(outpostId, cargoPadId)` tuples, not names, ordinals
   or delimiter-concatenated keys. Pad IDs are scoped to their outpost.
4. Removing/replacing an established pairing leaves former partners unlinked.
   Preserve their exports, type, IDs and relative ordering; do not manufacture
   incomplete or missing-target diagnostics. An independently stored choice on
   an unrelated pad remains unchanged. If its parent disappears, preserve the
   recorded outpost ID; deleting the owner deletes its choice.
5. Completing a pairing consumes genuine intent on both selected pads. Multiple
   pads can independently choose the same outpost without claiming any pad.
   No tombstones, name caches, timestamps, reason history or automatic
   reconnection mechanism is needed.
6. At most one intent exists per live pad: at most 1,152/network within external
   96-outpost/12-pad bounds or 2,048 within storage's 128/16 bounds, before raw
   size/aggregate limits. Retained claims remain within existing link limits.
   Counts grow with actual pads/records, not historical deletions.
7. Generate pad/link UUIDs once per command; guard their appropriate identity
   scopes. Do not accidentally reuse an absent endpoint ID in a retained claim
   and thereby resolve unrelated imported data. Collision checks use raw stored
   references where relevant; no tombstone subsystem is needed.
8. Preserve accepted domain-invalid exact claims and IDs. A unique broken claim
   supplies survivor missing-target presentation directly, with no duplicate
   intent. Multiple distinct claims are supported diagnostic data, not grounds
   for newly rejecting historically accepted imports or choosing a winner.
   Preserve existing malformed-shape, duplicate-identity/pair and envelope
   rejection. New intent+claim contradictions are rejected without lossy repair.
9. Ordinary Add/relink/unlink must not infer one relationship from conflicting
   claims, including a sole local record whose other endpoint is multiply
   claimed. Such ambiguous commands fail without changes. Explicit removal of
   an identified record remains available from any surviving participant
   (sections 6–7); an ambiguity guard must not block that repair.

| Derived state | Stored evidence | Display / diagnostic | Routing |
| --- | --- | --- | --- |
| Unlinked | No intent or incident claim | Unlinked; no destination diagnostic | None |
| Incomplete | Outpost-only intent, real target outpost, no claim | Selected outpost and placeholder; incomplete warning | None |
| Connected | One eligible exact claim | Exact current partner | Both directions from recorded exports |
| Missing pad | Retained exact claim, real parent, absent pad | Explicit unavailable selected target; structural missing error | None |
| Missing outpost | Retained exact claim or independent outpost choice names absent parent | Truthful parent fallback; missing-parent structural error, no dummy pad | None |
| Conflicting pairings | Multiple distinct records claim a qualified endpoint; participant may be on either end | Neutral conflict state; one error per participating surviving pad | Directly ambiguous claims excluded |
| Self-reference | Same qualified endpoint on both sides of one record | Existing self-link structural error; no multiplicity error solely for this | None |

### Transition ownership

Introduce a small pure owner, illustratively `src/domain/cargoConnections.ts`,
for qualified endpoint resolution, destination classification, conflict context,
new-pad type choice and immutable semantic transitions. Expose value-oriented
operations, including record-specific removal. App captures identity/context
and dispatches one updater. Data owns wire validation/migration; UI owns option
encoding, localized text, record inspection, focus and expansion. Keep history
and storage orchestration in their existing owners.

## 5. Transition and counterpart-impact table

Notation: L is the acting local pad, P its old partner, R a selected target,
Q the old partner of occupied R, N a new remote pad and O a destination outpost.
`L→O` is only explicit outpost-only intent; `L↔R` is a pairing.

All changed rows are one history entry unless described as two actions.
Survivors retain exports, type, stable IDs, relative ordering and unrelated
configuration. Undo restores the actual before-state, including pair records,
genuine intent and Planned Supply; Redo restores exact after-state identities.

| Before | Action | Persisted result and counterpart impact | Validation and supply | History/context |
| --- | --- | --- | --- | --- |
| L unlinked; O has zero/several pads | Select O | Store L→O; no pad/pair created | Incomplete warning; no route | One local edit |
| L→O or L↔P | Select free existing R | Create L↔R; consume L/R intent if present; remove old pair; P unlinked | Completion clears incomplete warning; old route ends; new route/reconciliation | One edit; local context |
| L→O | Add | Append empty N; create L↔N; consume intent | Warning clears; L exports may supply O; existing capacity/type/fuel diagnostics | One create-and-connect entry |
| L→O1 | Select O2 | Replace choice with L→O2 | One incomplete warning; no route | Undo restores O1 placeholder |
| Any unambiguous destination state | Select current outpost again | No change; preserve genuine unfinished choice or exact imported claim | Unchanged | No history/storage write |
| L↔R | Select current R again | No change | Unchanged | No history/storage write |
| L↔P, P in O | Add at O | Append N; replace pair with L↔N; P remains unlinked | No destination issue on P; old route ends; new route/reconciliation | Undo removes N and restores L↔P |
| L↔P | Select another O | Remove pair; store only L→O; P unlinked | L incomplete; no destination issue on P; old routes stop | One edit, separate from Add |
| Previous row | Add | Replace L intent with L↔N; P stays unlinked | L warning clears; new route only | First Undo restores L→O with P unlinked; second Undo restores L↔P |
| L↔P and R↔Q (or L has intent) | Select occupied R | Remove affected normal pairs; create L↔R; consume L/R intent; P/Q unlinked | No destination issues on former partners; only new pair routes; reconcile | One entry; no confirmation |
| L↔R | Delete R, including last pad at its outpost | Remove R and pairing; L unlinked; outpost remains | No manufactured missing/incomplete error; neither old direction routes | One deletion; Undo restores exact R/link |
| L↔R | Delete L | Symmetric: R survives unlinked; remove L and pair | Exports on R survive; no old route/destination error | One deletion; existing removal expansion rule |
| Pair into O | Delete whole O | Remove O and all touching established pairings; former partners unlinked | No dangling error from removed pairs; no old routes | One edit; existing selected-outpost fallback |
| Independent L→O | Delete O | Preserve L's recorded O; remove O and its own data | Missing-parent error replaces incomplete warning; no Add into absent O | One deletion; Undo restores parent and genuine incomplete state |
| L owns unfinished choice | Delete L | Delete choice with owner | No orphan intent | One deletion |
| L↔P | Explicit Unlinked at L (or symmetrically P) | Remove pair; both pads unlinked | No destination issue on either; no old route | One edit; Undo restores pair |
| L→O, including absent O | Explicit Unlinked at L | Clear only L's choice | Destination issue clears; unrelated choices unchanged | One edit; already unlinked is no-op |
| L has unique retained broken claim with O present | Select R or Add | Explicitly replace that identified claim with L↔R/L↔N; no new intent on former endpoint | Missing issue clears; occupied-target rules apply only when unambiguous | Undo restores original absent ID/claim/error |
| L has missing-parent intent or unique retained claim | Select another real O, then pad/Add | Replace prior evidence with explicit L→O, then complete | Missing-parent becomes incomplete, then clears | Two actions; no fabricated parent |
| L has unique retained broken claim | Explicit Unlinked/remove identified claim | Remove only that claim; surviving participants unlinked | Missing error from it clears; no new intent | One explicit repair |
| A↔B and A↔C imported | Ordinary ambiguous Add/relink/unlink | No change; no implicit winner | Three participant errors remain; both pairs excluded | No history/storage change; record-specific repair stays enabled |
| Same conflict | At B, explicitly remove record A↔B by ID | Remove exactly A↔B; retain A↔C; B unlinked | A/B/C conflict errors clear if no others; A↔C now routes; reconcile planning | One repair; Undo restores both records and errors |
| Overlapping conflicts | Remove chosen incident record at any surviving participant | Only specified record removed; others retained even if still invalid | Recompute all affected errors/routes; clear only resolved facts | One repair; no recursive cleanup |
| Completed pair | Edit either location/type | Keep pair/IDs; only requested edit and existing collateral changes | Existing diagnostics recompute; no auto-retyping or blanket routing gate | Ordinary history |
| L incomplete | Blur/collapse/navigate/remount/reload/JSON round-trip | Preserve L→O; presentation stays separate | Same derived warning; no route | No extra cargo edit for blur/collapse/navigation |
| Any | Stale/duplicate/invalid command or missing required owner/target | Same object; no partial mutation or reconciliation | Existing state unchanged | No history or cargo-driven storage write |

Normal deletion, unlink and replacement are explicit mutations with defined
collateral pair removal, not validation-driven cleanup. Supported imported
contradictions retain their records until an explicitly identified repair;
navigation alone never repairs them. The record-specific path avoids blanket
blocking of a living participant's recovery.

## 6. Validator specifications and severity calibration

### Actual baseline comparisons

| Current rule | Category / severity | Evidence and relevance |
| --- | --- | --- |
| `cargo-link-endpoint-missing` | structural / error | `missingCargoLinkEndpoint.ts:76-98`; retain structural severity for an exact unresolved endpoint |
| `cargo-pad-linked-multiple-times` | structural / error | `cargoPadLinkedMultipleTimes.ts:55-98,105-113`; currently reports only multiply-claimed surviving pads. Approved correction broadens placement to all surviving participants of directly competing records. |
| `regular-cargo-pad-cross-system` | structural / error | `regularCargoPadCrossSystem.ts:47-89,97-105`; ignores absent endpoints, does not auto-retype |
| `unresolved-cargo-export` | supply / warning | `unresolvedCargoExport.ts:39-89`; meaningful recorded configuration can lack an effective source; exports retained |
| `cargo-pad-skill-limit` | operational / warning | `cargoPadSkillLimit.ts:40-80`; future infrastructure permitted, null rank yields no fabricated limit |
| `interstellar-cargo-helium-3` | operational / warning | `interstellarCargoHelium3.ts:75-105,118-208`; incomplete operation is non-blocking; tests sending directions and skips missing/type-invalid endpoints |
| `planned-supply-unresolved` | supply / info | `plannedSupplyUnresolved.ts:31-56`; the virtual supply itself is deliberate usable planning, weaker than an unfinished requested connection |

### Required rule A: incomplete destination

- **ID:** `cargo-destination-incomplete` (new rule in
  `src/domain/validation/rules/incompleteCargoDestination.ts`).
- **Predicate:** a surviving pad owns a genuine outpost-only choice, that remote
  outpost exists, and no incident completed/broken/conflicting claim exists.
- **Exclusions:** exports alone; no choice; cleanly unlinked former partners;
  missing parent; completed, missing, self or conflicting pairing claims;
  malformed representation. Unknown location/skill does not suppress it.
- **Category/severity:** **operational / warning**. Like missing fuel and excess
  planned infrastructure, the configuration awaits an operational step. Unlike
  usable Planned Supply's informational state, the requested connection cannot
  route anything yet. This is neither malformed input nor an item-source rule;
  the warning does not block editing.
- **Message:** “Choose or add a Cargo Link at {destination} to finish this
  connection.” Illustrative key `validation.cargoDestinationIncomplete`; pass
  stable target identity, resolve its name in presentation.
- **Navigation:** `outpostId`/`cargoPadId` identify the surviving owner;
  separate target metadata identifies the chosen outpost.
- **Repair:** choose/add remote pad, choose another outpost, or Unlinked.
  Completion/abandonment clears it; another real outpost remains incomplete.
  Derive immediately from the recorded edit, not blur.
- **Interaction:** unrelated capacity/supply diagnostics can coexist. Never
  create a dummy pairing or infer unfinished intent from exports/history.

### Required rule B: missing selected endpoint

- **ID:** retain `cargo-link-endpoint-missing`; adapt
  `src/domain/validation/rules/missingCargoLinkEndpoint.ts`, without a redundant
  missing-target rule.
- **Exact-target predicate:** an actual retained network-level claim references
  a nonexistent pad in an existing outpost. Preserve the claim and exact IDs.
  No per-pad exact intent is needed. Ordinary established-pair deletion removes
  the claim and leaves survivors unlinked, so it creates no missing error.
- **Missing parent:** use a distinct message when a retained exact claim or an
  independently recorded unfinished choice references an absent outpost.
  Outpost-only intent must not imply that a pad was chosen. No dummy/empty pad
  ID is created to reuse the rule.
- **Category/severity:** **structural / error**, unchanged.
- **Message:** “The selected Cargo Link at {destination} is unavailable
  ({targetPadId}). Choose another or add one.” For the parent: “The selected
  outpost is unavailable ({targetOutpostId}). Choose another destination or
  Unlinked.” Adapt repair copy for conflicting claims to record inspection.
  Separate keys preserve truthful missing/unavailable meaning; do not assert
  historical deletion.
- **Metadata:** owner IDs navigate; separate target metadata carries outpost
  and, only for an exact claim, pad ID; `cargoLinkId` identifies that record.
  The diagnostic target type may distinguish outpost versus endpoint evidence
  without expanding the persisted intent shape. Presentation resolves current
  names/ordinals only for exact existing objects; otherwise use safe IDs and
  full accessible text/title.
- **Repair:** a unique broken claim can be replaced explicitly by pad/Add when
  its parent exists, changed to a real outpost, or removed. A conflicting claim
  exposes the record-specific removal path below even when ordinary selectors
  cannot safely choose what to replace. An unfinished missing-parent choice
  can be changed or cleared normally.
- **Orphans:** a claim with no surviving participant retains network-scoped
  structural diagnostics and exact record/endpoint IDs. Give honest guidance
  to export a copy, remove/correct the identified orphan record and reimport
  through existing validation, or restore a known-good export. No fabricated
  navigation target; this exceptional recovery guidance must not replace the
  in-app removal path for living participants.
- **Interaction:** missing parent suppresses its secondary missing-pad and
  incomplete messages. Independent source loss/capacity issues can coexist;
  existing cross-system/fuel rules continue skipping absent endpoints.

Deduplicate missing issues by surviving repair owner and recorded target,
retaining relevant record IDs as context. If neither end survives, identify
distinct absent endpoints at network scope, consolidating a repeated missing
parent. Do not report the same target both from an intent and a claim:
new-format exclusivity prevents that dual authority.

### Existing conflict rule: participation, not blame

Retain `cargo-pad-linked-multiple-times` and its **structural / error**
classification. Change its responsibility/name/message to **participation in
conflicting cargo-link pairings**, rather than claiming that every reported pad
itself has multiple records. Use neutral text such as “Conflicting cargo-link
pairings.” Update `validation.cargoPadLinkedMultiple` (or its replacement key),
rule description and localized detail together. Replace the old central-only
emission; do not layer another rule or duplicate network issue over it.

For records AB = A/Pad 1 ↔ B/Pad 2 and AC = A/Pad 1 ↔ C/Pad 4:

| One issue at | Explanation from stable record context | Activation |
| --- | --- | --- |
| A / Pad 1 | AB and AC claim A; show both remote participants | Outpost A |
| B / Pad 2 | Its AB pairing conflicts with AC at A | Outpost B |
| C / Pad 4 | Its AC pairing conflicts with AB at A | Outpost C |

Exactly **three** entries represent this one conflict. A occurs once; there is
no fourth network-level duplicate. B and C are inspection/repair entry points,
not pads falsely accused of each having multiple links.

Deterministic detection and context:

1. Index each qualified `(outpostId, cargoPadId)` by the distinct IDs of its
   incident raw pairing records. Use nested maps or an unambiguous tuple key;
   include the outpost scope. Count a repeated endpoint within one record once.
2. A tuple claimed by more than one distinct record is a conflict center.
   Every record incident to such a tuple directly participates in a conflict.
   Propagate to **both surviving ends of those records**, not to all pads at
   their outposts or arbitrary graph neighbors.
3. Deduplicate owners to one issue per qualified surviving pad for this rule.
   For each owner, attach its participating records plus the directly competing
   records at either endpoint of those records. For B above, context includes
   AB and AC even though B appears only in AB. Merge overlapping direct contexts
   into that owner's single issue; do not recursively accumulate unrelated
   connectivity.
4. Carry that owner's `outpostId`/`cargoPadId`, canonical sorted record IDs
   and sufficient endpoint/conflict-center context. Resolve labels at render
   time. Derive from complete input sets, not array-first matches. Reordering
   records changes neither affected owners nor issue identity/context; pad
   reorder may change displayed ordinals only.
5. A standalone self-link has one distinct incident record, so only the
   existing self-link rule reports it. A self-link plus a separate competing
   record can independently violate multiplicity; a missing endpoint can
   independently coexist with a conflict. Do not double-report the same
   self-link as multiplicity merely because it has two equal endpoint slots.

A shared conflict analysis can support validation, eligibility and repair
inspection without making routing depend on enabled validators. All raw claims,
including a broken claim, participate in incident-count ambiguity detection;
a complete claim is not automatically the winner over a broken competitor.

### Minimal explicit repair and navigation

In the expanded pad editor, show a compact list of its actual incident pairing
records whenever structural repair is needed. Identify each by its stable
record ID and both endpoint locators (safe IDs where missing); show the directly
competing records as explanation. Each **incident** record has a semantic
“Remove this pairing” button with an accessible label identifying its endpoints.
Contextual records that do not include this pad are explanatory, with existing
outpost navigation where possible; no implication that the local pad owns them.

The command receives the chosen record ID, expected network and owner endpoint,
and current-state expectations. It removes **only that record**, even if other
incident records make ordinary relink ambiguous. This is deliberately available
from any surviving endpoint of the record: A can remove AB or AC, B can remove
AB, C can remove AC. It is not an ordinary first-match Unlinked action. No
remove-all operation is needed for this minimal design.

Removing AB at B leaves AC intact and B unlinked. Recompute errors at A/B/C:
all three disappear if no other contradiction remains; AC becomes routable.
Undo restores both records and the original diagnostics. No cleanup of other
claims, manufactured intent or navigation-triggered repair occurs. If the
remaining pair supplies something newly, existing Planned Supply retirement
belongs to this same explicit repair action.

Activation follows existing outpost-targeted validation interaction; a narrow
presentation-only reveal of that pad's inspection controls is justified if
needed. Keep the panel open; no grouped multi-destination control or general
navigation redesign. Update `validationInteraction.ts` issue identity with
canonical target/record context, without splitting one participant into
multiple errors. Structured context belongs in `ValidationIssue`; names and
user-facing explanations remain presentation concerns.

### Precedence and timing

Reject malformed new-format input at boundaries without rewriting it; preserve
supported domain-invalid raw claims. Present a conflict/self-reference rather
than a first-match connection. Independently missing references may still
report structural errors, but never also infer an incomplete destination.
For a genuine choice, missing parent takes precedence over incomplete; for an
exact claim, missing parent takes precedence over missing pad. A completed
eligible pair or intentionally unlinked pad has no intent diagnostic.
Independent gameplay/supply diagnostics retain their own predicates.

Validation derives from current state on render (`App.tsx:416-422`); there is
no blur history, validity flag, timer, automatic repair or validation-driven
history entry. No third former-partner diagnostic is part of the design.

## 7. Atomic remote creation, history and current-state guards

The new operation must not call `addCargoPad` followed by `setCargoLink`:
both independently record history, and the first would expose a partial result.
Recommend one command, illustratively `createRemoteCargoPadAndConnect`.

1. Capture the initiating network ID, local endpoint and selected remote outpost,
   plus the rendered relationship/intent expectation. Generate one pad UUID and
   one pairing UUID outside the pure reducer/updater. React replay must reuse
   these values; Redo restores a snapshot and performs no generation.
2. Inside the current-state transition verify the intended network is still
   active, L still exists, O still exists and differs from L's outpost, IDs do
   not collide, and the expected selection/topology is current and unambiguous.
   In particular, an imported endpoint's absent parent cannot be a creation target.
3. Resolve systems from current reference data using nonblank stable IDs. Choose
   N's type from the approved table. Append N using the current remote array
   length for its invariant label and an empty outbound array. Leave L's type,
   exports and location alone. Never infer from inconsistent body/system data.
4. Replace the unambiguous incident pairing at L, if any, leaving P unlinked;
   consume L's explicit unfinished choice, if present, and create L↔N. A unique
   retained broken claim may be explicitly replaced by this repair. The
   existing-target command shares the primitive, leaving R's old partner Q
   unlinked and consuming intent only on the newly selected L/R endpoints.
   Ambiguous claims require the record-specific repair path first.
5. Call `retireFulfilledPlannedSupply` once on the complete resulting network
   with reference data. All collateral manufacturing/supply retirement belongs
   to the same after-snapshot. No dispatch occurs halfway through.
6. Return the new network once. The existing session mechanism records exactly
   one entry with local Network + Outpost context before and after; storage sees
   the resulting collection once through its existing effect.

The existing reducer selects whatever network is active at processing time
(`collectionEditingSession.ts:205-218`). Introduce a narrow expected-network
guard for these commands (for example an optional `expectedNetworkId` on the
apply action) and compare a captured expected network reference or explicit
selection/topology token **inside** the reducer/update. Do not rely solely on
App's render-time checks. A stale request must not mutate another network whose
outpost/pad IDs happen to match. Guards return the identical current network;
do not run retirement on a rejected command, since it could otherwise manufacture
a change and history entry.

Duplicate delivery of the same Add command is rejected using its captured
before-state expectation and generated IDs. A second native event from the
same stale render must fail the expectation after the first commit. A deliberate
new Add selection after the controlled select updates is a new action and must
create another pad, as approved. UI may hold a short pending-action ref until
the controlled value is restored, but this is not persisted history or a timing
debounce that discards intentional later Adds.

| Before Add | After Add | Undo of Add | Redo |
| --- | --- | --- | --- |
| O selected, placeholder | L↔N | Remove N/pair; restore L→O and placeholder | Same N/link IDs; no additional records |
| L↔P at O | L↔N; P unlinked | Remove N; restore exact old pair/selected P and prior planning | Same N/link; P unlinked |
| L has unique retained missing-target claim at O | L↔N | Remove N; restore original claim ID, exact absent endpoint and error | Same N/link; error clears |
| Local L created earlier | L↔N | L remains, with prior intent/pairing | Reuses L and N |
| User changed O from L↔P, then Add | L↔N; P unlinked | First Undo returns new O placeholder with P unlinked; second restores prior L↔P | Each original action restored separately |

Explicit record removal is a separate semantic command using the same
expected-network/current-state boundary. Validate that the owner survives,
the identified record still has the expected endpoints and the owner
participates. Do not require the topology to be unambiguous: the user's chosen
record removes that ambiguity deliberately. Remove exactly its ID, preserve all
others and genuine unrelated choices, then reconcile the completed result
once. No UUID is generated for removal. Missing/stale record or owner yields
the identical state and no reconciliation/history/storage write.

For AB + AC, removing AB at B records B's initiating Network + Outpost context.
If AC becomes eligible and retires planning, both changes belong to this one
entry. Undo restores AB/AC and actual before-state planning; Redo restores the
same retained AC ID and after-state. Neither operation invents intent, regenerates
IDs or silently deletes remaining conflicts.

The current whole-collection snapshots and 1,000-entry cap already handle
genuine intent, exact claims and planning restoration. No serialized history
change is needed.

Remote Add changes **remote** membership, not the initiating local pad list.
`getEditorMembershipChanges` (`collectionEditingSession.ts:385-390`) already
limits cargo membership reset to the action's local context. Preserve this:
same-context Add/Undo/Redo leaves unrelated local expansion/scroll alone and does
not trigger `focusAddedPadRef` for the remote pad. After manual navigation,
history returns to the initiating local outpost as required; the existing
cross-context presentation reset still applies. Do not promise restoration of
historical focus, scroll or collapse. If the initiating card needs revealing
after a remount, derive a one-shot presentation instruction from the action,
following the removal precedent, rather than storing collapse/focus in JSON.

The normal Add event must leave its local card expanded and focus on its remote
pad selector. A controlled value update should preserve that DOM node and key.
Use existing focus visibility helpers only when an actual focus repair is needed.

## 8. Routing and Planned Supply safeguards

### Confirmed asymmetry

`availability.ts:58-78`, `logistics.ts:110-139`, and `provenance.ts:115-153`
identify the receiving side by **outpost ID**, then validate only the opposite
pad. With A's receiving pad absent but A still present and B's pad exporting
Iron, these paths still report Iron at A if the broken record is retained.
The synthetic probe reproduced all three. By contrast,
`logistics.ts:55-77` iterates actual local pads and checks the remote pad, so
routed exports from B disappear. Retained imported broken records therefore
already expose inconsistent imports, provenance and export indicators. Normal
deletion removes established pairs under the corrected policy; imported claims
still require the shared resolution fix.

### Exact proposed eligibility boundary

Use a shared pure endpoint/pair resolver in `cargoConnections.ts`, not validation
success as a routing predicate. A normal routable pair must be a completed
network-level pairing claim with **both referenced outposts and both qualified
pads resolving**, with distinct qualified endpoints and neither endpoint
claimed by another raw record. Intent alone, missing references, ambiguous
claims and self-endpoint claims never route. A single local incident record is
also ineligible if its opposite endpoint has a competing record.

D2's structural exclusion is now approved: retain accepted raw records and
diagnostics until explicit repair, with no implicit winner. The baseline
mixes `.find()` and all-link iteration; it is not already consistent.
Unrelated unambiguous pairings continue to route. Recompute eligibility after
record-specific repair, which may make a retained pairing usable without any
new connection command. This is a structural-resolution boundary, not a
general validator gate or new same-outpost policy.

Do **not** require matching pad types, known/equal system IDs, fuel availability,
skill capacity, actual upstream production, feasible exported-product recipes,
or absence of unresolved-export warnings before routing a resolved pairing.
Current tracker supply counts a remote pad's recorded exports, even when its
source is itself unresolved; recursively proving all upstream supply would be
an unrelated semantic change. Two different pads on the same outpost in old
imported data are outside this feature's editing policy; retain their existing
domain diagnostic policy rather than silently adding a new blocker.

The new-pad default must be reference-aware even though the current cross-system
validator compares raw `systemId` strings (`regularCargoPadCrossSystem.ts:67`).
Different blank/unresolved strings can therefore still yield existing diagnostics
after a fallback-type choice. Do not quietly rewrite that validator's location
policy as part of introducing the approved default; report any desired broader
unknown-location calibration separately.

| Consumer | Required safeguard |
| --- | --- |
| Availability base and manufacturing fixed point | Only resolved pair exports enter the base; local production and virtual planning rules remain unchanged. No missing-receiver ghost can seed a recipe chain. |
| Logistics imports and routed export destinations | Share the same eligible pair set in both directions; stop mixing remote-only checks and first-match assumptions. Preserve distinct-item/name deduplication and ordering. |
| Provenance | Remote source IDs come only from eligible pairs; manufacturing-local provenance inherits corrected feasibility. |
| Matrix | Existing `getImportSummariesAtOutpost` / routed-destination calls inherit the fix. Preserve Present/Producing/Inputs/Logistics meanings and UI geometry. |
| Search | Importing uses provenance; Exporting uses logistics; Producing/Missing inputs uses feasibility. Update no Search-specific cargo rules. |
| Cargo card summary | Inbound items require an eligible pairing, never an unfinished choice, broken claim or first-match conflict winner. Candidate export labels in repair/select controls are not inbound cargo. |
| Fuel | UI fuel state uses actual availability; operational validator uses effective availability, including Planned Supply, and sending-direction conditions. Preserve that deliberate difference. |
| Export/manufacturing/organic-input validators | Inherit corrected supply/provenance; retain source warnings and recorded downstream configuration. |
| Planned Supply retirement | Reconcile the finished transition only, using the same corrected actual-availability paths. |

Example: L already exports Iron, O plans Iron, N is created empty. L↔N supplies
Iron to O immediately; O's Iron placeholder retires in the Add action. Undo Add
restores O's placeholder and removes N; Redo repeats the stored after-state.
Later unlink/deletion/reassignment does not recreate Iron planning. Production
loss likewise creates no automatic planning entry. Existing manufacturing that
uses other Planned Supply as prerequisites retains its current semantics; this
audit proposes no general supply-restoration or fuel-seeding mechanism.

Test missing A, missing B, missing receiving outpost and missing sending outpost
separately, with two different exported items to establish directionality. A
remaining unrelated route must keep functioning. This protects both broken
imports and future mutation regressions while ordinary established-pair
deletion removes its relationship cleanly. Also test ambiguous and self records
in both directions, and record removal that enables a surviving valid route.

## 9. Persistence, import, recovery and rollback

### Versions and boundary changes

Recommend **nested network schema 4 → 5**. Leave collection schema at **1**:
collection order, stable saved-network IDs and `activeNetworkId` do not change.
There is no storage-envelope version to bump or invent. Keep the storage key,
numeric resource limits and reference-manifest schema unchanged. Do not choose
an application release version as part of this audit.

Required migration work is more than adding an optional TypeScript field:

- `networkMigration.ts:145-150` reconstructs pad objects field-by-field and drops
  unknown fields. Schema-5 migration must explicitly preserve valid intent and
  never infer an exact pad from an outpost-only destination.
- `storageCoherence.ts:49` currently requires every source version at least 4
  to equal the current version. A naive bump of `CURRENT_SCHEMA_VERSION` would
  reject **valid stored schema 4** before migration. Replace this with explicit
  supported-version checks and per-version field requirements.
- Source and recovered-shape validators must recognize the optional
  `destinationIntent: { outpostId: string }` object. The ID must be nonempty;
  null, arrays, missing/wrong-type IDs and empty IDs are malformed. There is no
  discriminant or exact-pad member: reject obsolete `kind`/`cargoPadId`
  intent shapes instead of silently dropping their meaning. Absence means no
  intent; a valid ID referring to an absent outpost is a supported unresolved
  reference, not grounds for data loss.
- For each schema-5 owner endpoint, reject a present intent if **any** raw
  pairing record names that qualified endpoint, regardless of eligibility.
  This is new dual-authority rejection only. It must not reject multiple
  distinct pairing claims when no intent is present; those remain supported
  domain-invalid data with explicit repair. Keep exact claims network-owned.
- Defaults, sample fixtures and literal-version assertions need explicit review.
  Historical fixtures must remain historical; do not mass-replace every `4`.
- Preserve the raw input guards before migration and the complete post-migration
  checks. No partial collection salvage on browser recovery and no lossy
  migration to hide malformed new state.

### Compatibility matrix

| Input / reader | Baseline evidence | Recommended new-reader behavior |
| --- | --- | --- |
| Valid 1.0 collection export, linked network 4 | `serialization.ts:51-92`; complete linked shape | Import atomically into schema 5; retain pairing IDs, order, exports and all existing unrelated data. No duplicate per-pad intent for completed links. |
| Valid 1.0 stored collection or bare network, intentionally unlinked | `storage.ts:65-73`; `networkCollection.ts:92-106` | Migrate to 5 with no invented destination. Previously discarded choices cannot be recovered. |
| Previously supported schema 1 exact pad-local link | `networkMigration.ts:128-149`; `networkLifecycle.test.ts:74-98,444-462` | Preserve the established exact-link migration and exports; preserve missing exact targets in diagnostic claims if unresolved. Never infer deletion. |
| Schema 1 browser storage with only destination outpost | `storageCoherence.ts:91-98`; `networkLifecycle.test.ts:101-142` | Preserve the actually recorded nonempty outpost as outpost-only intent when no competing relationship exists. This improves preservation without guessing a pad. If parent absent, show missing-outpost variant. External legacy import remains stricter: baseline `validateLegacyPadLink` requires exact pad ID; do not broaden external acceptance incidentally. |
| Schema 2/3 historical routes/capabilities/biomes | `networkMigration.ts:38-89,153-172`; `networkLifecycle.test.ts:145-181,417-440` | Continue established migrations, then set schema 5. No domain reinterpretation. |
| Old complete-shaped link with absent endpoint | Baseline preserves IDs; `missingCargoLinkEndpoint` diagnoses; `networkLifecycle.test.ts:31-34,388-398` deliberately uses absent target | Keep the raw link claim and its ID; resolve survivor UI to missing state without creating a second persisted copy. Exclude from routing. Permit explicit local repair/unlink of an unambiguous claim. |
| Old claim with both endpoints absent | Shape can be accepted today | Keep bounded raw record and structural diagnostics; truthful IDs and data/import repair path. No dummy owner, target or automatic deletion. |
| New outpost-only intent, parent present or absent | One supported persisted intent shape | Preserve the exact nonempty outpost ID on save/reload/export/import. Present parent derives incomplete; absent parent derives missing-parent. No exact-pad intent or generated former-partner choice. |
| New-schema retained missing/conflicting/self pairing records | Exact network-owned claims remain readable domain-invalid data | Preserve record and endpoint IDs, independent of lookup/eligibility. Missing-target/conflict presentation is derived; no conversion to intent. Permit identified-record removal from living participants. |
| Wrong types, empty/duplicate entity IDs, duplicate relationship pairs | Existing source/post-migration rejection in `externalImportValidation.ts:227-299`; recovery safeguards in `storageCoherence.ts` | Preserve rejection; add equally strict new-field validation. Failed external import leaves collection, context, history and storage unchanged. Recovery preserves raw bytes and shows existing fallback status. |
| Empty **reference** strings in legacy CargoLink endpoints | `externalImportValidation.ts:134-137` and `storageCoherence.ts:109-111` check string type, not nonemptiness | Do not misreport these as already rejected entity IDs. Preserve historical raw broken claims and report structural missing references; never turn empty strings into a valid intent target or repair them by ordinal. New intent target IDs must be nonempty. |
| Multiple distinct link records claim one pad; self-link | Currently representable domain-invalid data; duplicate pair is separately rejected | Preserve accepted records for existing structural validators. Approved policy excludes ambiguous/self pairing claims from routing. Do not silently choose a winner, generate extra intents or erase claims. |
| Intent plus any incident pairing claim in schema 5 | New contradictory dual authority | Reject at external and stored-source coherence boundaries; do not select a precedence and drop data. In-memory command checks prevent this state. |
| Over external envelope but within storage envelope | Distinct existing trust policies | Preserve external rejection and bounded storage acceptance; Add remains gameplay-permissive. No incidental limit relaxation. |
| Above storage resource envelope | `storage.ts:47-71,81-94` | Recovery fallback preserves source; live save returns unsaved/capacity while edit/history remain in memory. Persistent intent cannot promise successful save outside the supported envelope. |
| New schema-5 export opened by 1.0 | `externalImportValidation.ts:249-255`; synthetic probe | Older app rejects the nested schema as unsupported; no replacement dispatch. Outer version 1 is sufficient because nested version rejection occurs before lenient migration. |
| Schema-5 browser storage after rollback to 1.0 | `storageCoherence.ts:34-36`; `storage.ts:65-71`; synthetic probe | Old app enters recovery fallback and preserves original bytes at initialization. It cannot display the new data; a later deliberate persisted edit can overwrite the preserved source under current fallback policy. Do not claim rollback is transparently safe. Preserve/export the data before editing in a rolled-back reader. |
| New fields falsely labeled schema 4 / version simply lowered | `networkMigration.ts:145-150`; synthetic probe | Old app accepts shape, strips intent and may normalized-save the loss. Never down-label a new export to promise compatibility. No downgrade converter is proposed. |

Legacy data containing contradictory pad-local and network-level claims must
not be folded into guessed intent or an implicit winner. Continue established
exact-claim migration and supported diagnostics. New-format rejection applies
to malformed intent and intent-plus-incident-claim dual authority, not to
historically accepted multiple distinct exact records. If legacy outpost-only
evidence competes with an exact claim, do not create the forbidden dual
representation; preserve the exact claims under existing migration rules and
report the preservation limit rather than inventing a recovered choice.
External import's existing active-network fallback remains unchanged
(`networkLifecycle.test.ts:489-492`); storage's stricter active-ID coherence
remains unchanged (`storageCoherence.ts:122-134`).

### Resource accounting

External import limits (`externalImportValidation.ts:14-27`) remain: 4 MiB file
bytes checked before reading by `NetworkImportButton.tsx:47-52`; 64 networks;
96 outposts/network; 12 pads/outpost; 256 pair records/network; 256 manufacturing
and planning entries/outpost; 128 exports/pad; 25,000 aggregate array members;
4,096 UTF-16 code units per source string/key. Browser limits remain those in
`storageEnvelope.ts:13-28`: 4,194,304 serialized code units, 65,536 aggregate
array members, 128 networks, 128 outposts/network, 16 pads/outpost, 384 pair
records/network, 256 exports/pad, generic arrays 512, strings/keys 16,384, depth 64.

The recommended optional intent object adds no array or identity list. Existing
byte/string/depth walks visit its contents; bounded pad counts bound intent
count. Add maximum-length target-ID fixtures and exact/one-over byte/depth
checks; do not compensate by increasing limits. Remote Add may raise an existing
remote outpost from 12 to 13 pads or 16 to 17 just as ordinary Add can. The first
may export a file the stricter importer rejects; the second may leave live edits
unsaved. These are existing technical policies, not a reason to hide Add or
invent an unknown skill maximum. Broad technical-capacity warning UX remains
in the backlog.

## 10. UI, localization, focus and keyboard implications

### Native selector contract

- Remote outpost select: Unlinked, then all other current-network outposts in
  current order. Each uses a whole localized message with name and recorded
  pad count, including zero and occupied/unlinked pads. Missing current parent
  gets an extra selected unavailable option, not a false ordinary outpost.
- Remote pad select for a real parent: ordinary placeholder, a selected
  unavailable status option for a retained missing claim when necessary,
  existing pads in their
  current order, **+ Add cargo link** last. All normal occupied-target labels
  remain; no empty-pad reuse or capacity disable. Missing parent has no enabled
  Add and no fabricated children.
- An exact absent pad in a retained imported claim must remain displayed as an
  explicit unavailable selected option with native `disabled`, not fall back
  to the placeholder or imply an operative pairing. Use “Unavailable Cargo Link
  ({id})” plus the live parent name. A cleanly unlinked former partner has the
  ordinary Unlinked value and no remembered-target option.
- Conflicts/self references have truthful structural status, without selecting
  a first-match partner. Disable ambiguous ordinary Add/relink/Unlinked actions
  while showing the expanded record-inspection list and enabled record-specific
  removal buttons. Mere ambiguity must not disable the explicit repair path.
  A missing endpoint in a conflict remains visible in its record context.
- The pad placeholder remains a non-action status: selecting it must not unlink
  a completed pairing or clear a missing ID. Restore the controlled model value
  for a no-op selection. The outer Unlinked is the explicit abandonment action.

Do not use a raw magic string such as `__add__` alongside arbitrary imported
pad IDs. Encode **every** selector value into disjoint UI namespaces, for example
tagged JSON tuples `['pad', id]`, `['action','add']`, `['status','missing',id]`
and `['placeholder']`, with a narrow decoder/option map. Apply equivalent
encoding if adding a missing outpost option. A persisted ID literally equal to
the action string must still be a normal ID option. Decode to a typed command;
the action/status token never reaches a schema field or relationship endpoint.

Commit Add from the native select's committed `onChange` only. Do not execute
again from `onInput`, keydown, click, blur or an effect watching selection. Native
closed-select arrow behavior can commit values without a separate Enter on some
platforms; do not assume every keyboard exploration waits for blur. Escape
cancels only before native commit; after a committed Add, ordinary Undo is the
reversal. Verify this with the actual supported browser, including open popup
arrow/Enter/Escape and closed-select arrow behavior. A failed/no-op action must
explicitly restore the controlled normal/status value so Add never remains
visually selected just because React skipped a state update.

The current select has an accessible name and focus-visible CSS
(`CargoPadEditor.tsx:167-199`, `CargoPadEditor.css`). Retain native semantics,
full option accessible names and existing content abbreviations. Do not replace
native selects or add confirmation dialogs without evidence of a specific
unavoidable problem.

### Collapsed state, diagnostics and navigation

Use the same derived destination classification for both expanded and collapsed
views, including disclosure's semantic summary and title:

| Derived state | Concise display meaning |
| --- | --- |
| Unlinked | Unlinked |
| Incomplete | `{outpost} — choose Cargo Link` |
| Connected | Current destination name and normal existing cargo summary |
| Missing pad | `{outpost} — Cargo Link unavailable` with exact ID accessible |
| Missing outpost | `Outpost unavailable ({outpostId})` |
| Conflicted | `Conflicting cargo-link pairings` and record context, no implied winning destination |
| Self-reference | Existing self-link meaning with record-specific repair |

Preserve outbound summaries in every state. Only completed eligible pairings
show inbound cargo. Add history descriptors for “Select destination” and
“Add and connect Cargo Link”, plus “Remove pairing” for explicit record repair;
keep existing unlink/connection descriptors where
their meaning remains accurate. Capture names at action time and ordinals through
`cargoPadOrdinalParameters`, as existing history does; do not serialize these
presentation strings into intent.

For incomplete/missing and participant-conflict diagnostics, activation uses
each issue's own surviving outpost/pad IDs. Preserve the existing outpost-targeted
interaction and keep the validation panel open. If a pad reveal is needed, extend
the callback narrowly to expand that pad and reveal its repair control after
remount, using a one-shot presentation request scoped to network/outpost/pad.
Missing-parent choices use the outpost select; unambiguous missing pads use
the pad select; conflicting/self records use the inspection/removal list.
The three conflict entries in the approved example navigate to A, B and C
respectively. No grouped multi-target Validation control, persisted focus or
global highlight framework is proposed.

### Localized counts are not just English singular/plural

All ten supported locales are listed in `src/localization/types.ts:1-4`:
`en-US`, `en-GB`, `ja-JP`, `fr-FR`, `de-DE`, `es-ES`, `it-IT`, `pt-BR`, `pl-PL`,
`zh-Hans`. `formatInteger` already uses `Intl.NumberFormat`.

`catalog.ts:21-35` currently supports only `one`/`other`, and interpolation at
lines 67-74 stringifies numbers. `locales/pl-PL.ts:48` deliberately uses an
invariant “number of cargo links” wording; review tests at
`localizationReview.test.ts:615-630` explicitly reject `few`/`many` syntax. Do
not claim that simply reusing the English `cargo.pad.count` pattern provides
natural Polish 0/1/2/5/12/22 inflections.

Recommend a narrow localized destination-count formatter that selects an entire
message variant by `Intl.PluralRules(locale)`, with explicit `one/few/many/other`
mapping as applicable to that locale and a fallback variant. Pass the count as
`formatInteger(locale,count)` for display, alongside the outpost name. Languages
with an invariant natural form can map categories to that form. This preserves
the existing parser/review grammar and avoids a general ICU expansion. It must
live in localization/presentation, not each React option. Whole messages keep
punctuation and noun order localizable; no English suffix concatenation or
persisted count. Editorial review should settle natural wording in each locale.

Affected catalogue artifacts: `src/localization/locales/en-US.ts` and all eight
complete non-English catalogues; `en-GB.ts` only if a British-specific override
is necessary. Update relevant tracked review CSV rows in
`docs/localization/{ja-JP,fr-FR,de-DE,es-ES,it-IT,pt-BR,pl-PL,zh-Hans}-review.csv`
and per-locale `reviewDrafts` where the current route uses them. Preserve prior
review evidence; new wording does not inherit an old acceptance automatically.
Update coverage/placeholder/official-terminology expectations and new count
formatter tests. No reference overlay, Bethesda data, or archive regeneration
is needed. A general plural-parser expansion is only a conditional alternative;
it would also affect `reviewPackage.ts`, XLIFF handling and parser tests and is
not the default recommendation.

### Bounded visual checks

Use synthetic data at ordinary desktop scale (1366×768 and 1600×900) and true
browser 200% zoom/constrained width. Check long/blank destination names, 0/1/many
counts, all-pad rather than free-pad counts, long missing IDs, occupied-target
content labels, unavailable/conflict status, the record-removal list and Add's
final position. Verify no
panel widening, selector clipping that makes repair unusable, or loss of full
name/count in title/accessible text. The count may be less visible in a closed
narrow native select; the open option and full accessible/title text must remain
usable. Adjust only local styles if an observed regression requires it.

Check native pointer and keyboard selection, cancel-before-commit, focus retained
on L's selector, no remote navigation, no unrelated collapse or scroll reset,
and meaningful local repair after validation navigation. Keep existing focus
visibility and Windows accessibility scope; this is not a new Narrator,
VoiceOver, Apple, mobile-layout or whole-product geometry initiative.

## 11. Exact implementation inventory and finite regression plan

“Required” means feature work in a future implementation, not a file modified
by this audit. Proposed new filenames are explicitly labeled.

| Classification | Files / functions | Scope |
| --- | --- | --- |
| Required | `src/domain/models.ts`: `CargoPad`; proposed `src/domain/cargoConnections.ts` | Simple outpost-only intent; qualified resolver/conflict analysis; state classifier; current-state immutable transitions; type default; clean pair removal and explicit identified-record repair |
| Required | `src/App.tsx`: `addCargoPad`, `deleteCargoPad`, `deleteOutpost`, `unlinkCargoPad`, `setCargoLink`, new remote Add and record-removal handlers; cargo props and issue navigation | Delegate semantic transitions to domain; one entry per action; local context; no intermediate dispatch/first-match repair; narrow reveal |
| Required | `src/ui/components/CargoPadEditor.tsx`, `CargoPadsEditor.tsx` | Enable zero-pad destinations; counts; Add/status encoding; use derived persisted choice/exact claims; conflict record inspection/removal; collapsed/accessible state; focus. Remove `draftLinkedOutpostIds`, its cleanup and old precedence comments. |
| Required, narrow | `src/domain/collectionEditingSession.ts`: `CollectionEditingAction`, `apply-active-network` | Expected-network/current-state guard. Existing snapshots/cap remain. Any new reveal metadata must be semantic/session-only; do not store DOM state. |
| Conditional | `collectionEditingSession.ts`: `getHistoryPresentationReset`, `getCargoPadHistoryPresentationChange` | Only a necessary deterministic local reveal after history/remount. Remote membership alone already does not reset local Cargo. Preserve existing removal exception. |
| Required | `src/domain/availability.ts`, `logistics.ts`, `provenance.ts` | Shared eligible endpoint resolution for all directions and summaries; preserve existing actual/effective/manufacturing/retirement policy |
| Required | `src/domain/validation/registry.ts`, `types.ts`, `rules/missingCargoLinkEndpoint.ts`; proposed `rules/incompleteCargoDestination.ts` | Distinct rule identities, target metadata, missing-parent precedence, survivor context, non-duplication |
| Required | `src/domain/validation/rules/cargoPadLinkedMultipleTimes.ts` | Retain rule ID/severity; report every surviving participant of directly competing records, deduplicate per qualified pad; neutral copy, stable record context; no extra central/network duplicate |
| Conditional on shared resolver integration | `rules/selfLinkedCargoPad.ts`, `regularCargoPadCrossSystem.ts`, `interstellarCargoHelium3.ts` | Preserve independent responsibilities/severities; consume consistent resolution if needed. No skill/fuel/gameplay rewrite or self-as-multiplicity duplicate. |
| Required | `src/ui/validationPresentation.ts`, `validationInteraction.ts`; cargo-specific App callback | Target and competing-record context, neutral conflict copy, canonical issue identity, each participant's own outpost navigation |
| Conditional | `src/ui/components/ValidationSummary.tsx`, `src/ui/historyPresentation.ts` | Only changed props or narrowly needed descriptors; no general validation-panel/history UI redesign |
| Required | `src/data/networkMigration.ts`, `externalImportValidation.ts`, `storageCoherence.ts`, `src/domain/defaults.ts`, `sampleData.ts` | Nested v5 migration and strict new-shape checks; keep v4 storage acceptance; preserve legacy exact claims; defaults/fixture versions |
| Reviewed, normally unchanged source | `src/data/networkCollection.ts`, `serialization.ts`, `storage.ts`, `storageEnvelope.ts`, `src/ui/components/NetworkImportButton.tsx`, `NetworkExportButton.tsx` | Existing whole-collection, JSON and persistence orchestration already carries new fields. Verify migration entrypoints and bounds with tests; no outer-schema/key/limit change. Change only if verification exposes a necessary boundary gap. |
| Required | Proposed `src/localization/cargoDestination.ts`; `src/localization/locales/*.ts` as detailed above; relevant review drafts/CSVs | Natural localized counts, Add/missing/conflict/record-removal/history copy, neutral participant wording, exact key/placeholder parity |
| Conditional | `src/localization/catalog.ts`, `reviewPackage.ts`, generation/adjudication tooling | Only if adopting richer general plural grammar instead of the recommended variant formatter |
| Conditional | `CargoPadEditor.css`, `CargoPadsEditor.css` | Evidence-driven local long-name/status/focus fit only |
| Required documentation after implementation | `docs/DOMAIN-RULES.md`, `ARCHITECTURE.md`, `UX-DESIGN.md` | Outpost-only intent ownership, clean disconnection, schema/migration, structural routing, participant diagnostics and explicit record repair. Describe durable behavior, not temporary audit/test numbering. |
| Conditional documentation | `docs/BACKLOG.md`, `docs/localization/LOCALE-ONBOARDING.md` | Narrowly reconcile completed cargo-navigation follow-up/localization convention if needed; do not close unrelated backlog |
| Unchanged, regression coverage | `src/domain/capacity.ts`, `cargoPadLabels.ts`, `itemSearchResults.ts`, `resourcePresence.ts`, production/recipe rules, `src/ui/components/OutpostStatusMatrix.tsx`, `statusStates.ts`, `CargoExportsEditor.tsx` | Reuse current capacity/labels/derived downstream calls and exports; no new parallel supply rules |
| Conditional fixture maintenance | `src/dev/historyBenchmark.ts`, `tests/historyBenchmark.test.ts`, import benchmark fixtures | Current synthetic delete/link transitions should remain representative if used with intent; no new benchmark harness or throughput work |
| Unchanged | `AGENTS.md`, `docs/CODE-STYLE.md`, `docs/IMPLEMENTATION-WORKFLOW.md`, package/lock dependencies, reference assets, deployment files, immutable archives, supplied briefs | No feature-required change |

### Named eventual tests

These are proposed cases, not tests written or executed by this audit. New pure
tests can use the existing Node test runner and components the existing Vitest
setup. No permanent new harness is needed.

| Test name and owner | Synthetic setup / action | Observable assertions |
| --- | --- | --- |
| `remote add accepts a zero-pad destination` — `tests/componentAccessibility.test.tsx`, `tests/browserStorageApp.test.tsx` | Local L and remote O with zero pads; select O and Add | Zero option enabled; count 0; placeholder then Add last; one empty N appended and selected; local outpost/card/focus retained |
| `remote pad type uses resolved system identity` — proposed `tests/cargoConnections.test.ts` | Same known IDs, different known IDs, both blank, one blank, same unresolved ID, different unresolved IDs, missing reference data; regular/interstellar L | New type follows approved table; L unchanged; body mismatch not repaired; no fuel/exports/planning seeded |
| `counts measure all pads and capacity remains advisory` — component test plus `tests/validationDiagnostics.test.ts` | Zero/one/many including occupied and unlinked pads; rank 0, trained, null; Add beyond gameplay limit; delete and Undo | Counts match array length live; known remote excess gives operational warning; null gives no invented cap; Add enabled; Undo/Redo changes count |
| `destination intent survives every editor boundary` — `tests/browserStorageApp.test.tsx`, `tests/networkLifecycle.test.ts` | Select O without pad; blur, collapse/reopen, switch outpost/network, remount, mock-storage reload, serialize/import | Same O and placeholder restored each time; only original selection edit recorded; domain intent survives independently of presentation reset |
| `unlinked exports do not imply incomplete destination` — `tests/validationDiagnostics.test.ts` | L exports items but has no intent/pairing | No incomplete/missing rule; unresolved export may independently warn |
| `destination states have truthful distinct diagnostics` — validation diagnostics/presentation/component tests | Separate genuine outpost choice, retained imported missing pad/outpost, independent missing-parent choice, unlinked former partner, complete pair, self and conflict fixtures | Operational incomplete warning only for real choice; structural errors for actual references/conflicts; no inferred former-partner issue; parent precedence; unavailable option differs from placeholder/operative pairing; live-owner navigation |
| `normal unlink and deletion clean both directions` — cargo domain/session/storage App tests | A↔B exports different items; independently unlink at A/B, delete either pad including last pad, or delete either whole outpost | Surviving former partners unlinked; pairing removed; no intent or dangling/incomplete error; exports/type/IDs/order preserved; neither old route supplies; one history entry and exact Undo |
| `same ordinal never resolves imported missing identity` — cargo domain/component test | Deliberately import/retain exact claim to absent Cargo Link 2; create/reorder a different pad displayed as 2 | Original claim ID/absent endpoint retained; no automatic route/selection by ordinal/name; explicit replacement changes claim; do not generate fixture by normal deletion |
| `independent unfinished choice keeps missing-parent evidence` — cargo domain/component test | L→O and an unrelated established pair into O; delete O; separately import exact claim to an absent O | Only independently recorded choice retains O intent; established-pair survivor cleanly unlinked; imported exact claim keeps IDs; truthful parent-only diagnostic, no dummy pad; Add unavailable until real parent chosen; owner deletion removes its choice |
| `occupied replacement leaves former partners unlinked` — cargo domain/session tests | A↔B and C↔D; connect A to C; separately connect to free C and Add N at B outpost; unrelated pad has explicit O choice | A↔C or A↔N only; B/D survive unlinked with exports/type/order; no invented intent/error; independent choice unchanged; exact Undo/Redo |
| `remote add is one reversible local action` — `tests/collectionEditingSession.test.ts`, storage App test | Add from placeholder, existing pair and missing target; L created in prior action; navigate to another outpost/network before history | One entry per Add; Undo restores exact prior choices/planning; local L survives; action context is local; repeated Redo reuses same IDs and never accumulates pads/links |
| `destination change and add remain two edits` — session/App test | L↔P; select O; Add | First Undo restores O placeholder with P unlinked; second restores original pair; real choice persists between actions and through reload; no hidden two-dropdown transaction |
| `remote receipt retires planning within add` — `tests/manufacturingAvailability.test.ts`, cargo/session tests | L exports Iron; O plans Iron and configures a dependent product; Add empty N | Receipt/feasibility and matching retirement in same snapshot; later delete/unlink/reassign/production loss does not recreate planning; Undo restores historical planning; no new N exports |
| `missing conflict and self claims never seed routes or recipes` — `tests/stateLegibility.test.ts`, `manufacturingAvailability.test.ts`, `itemSearchResults.test.ts` | Retained/imported claims with either pad/outpost absent, multiple distinct claims including one broken competitor, self endpoint; two-way exports plus unrelated valid route | No ghost availability/import/export/provenance/Matrix/Search/Cargo summaries or manufacturing seed in either direction; incomplete choice never routes; unrelated valid pair still supplies; normal deletion fixture separately expects record removal |
| `resolved routes survive unrelated diagnostics` — same supply suites | Complete pair with missing fuel, regular cross-system type, excess capacity or unresolved remote exports | Current recorded-export routing retained; existing validators still warn/error; no global validity gate |
| `conflict errors belong to all three participants` — cargo/validation/presentation/navigation tests | AB=A/Pad 1↔B/Pad 2 and AC=A/Pad 1↔C/Pad 4 plus unrelated pads/pair | Exactly three structural/error entries under existing conflict rule, neutral wording at A/B/C; no repeated central/fourth network issue; each navigates to its own outpost and has sufficient AB/AC context; neither claim routes, unrelated pair does |
| `overlapping conflicts are qualified and order independent` — cargo/validation tests | AB+AC and AC+CD, reordered input records and pad arrays; same pad ID in different outposts; delimiter-like IDs; standalone self then self plus another record | Deduplicated one issue per actual surviving participant; canonical context/identity stable under record order; no outpost-wide/arbitrary propagation or namespace collisions; standalone self reported only by self rule; independent missing facts retained |
| `identified pairing removal works from every participant` — domain/component/session tests | AB+AC: at A choose AB or AC; at B choose AB; at C choose AC; repeat with overlapping conflict and missing opposite endpoint | Listed record IDs/endpoints identify action; exact chosen record alone removed regardless of array order; remaining claims/exports persist; no first-match or automatic cleanup; ordinary ambiguity guard does not block explicit repair; only resolved errors clear; no navigation-only mutation |
| `repair enables supply and restores exact history` — availability/session/storage App tests | AB+AC blocked; remaining AC exports Iron to an outpost planning it; remove AB at B, then navigate and Undo/Redo | AC begins routing and matching planning retires in same repair entry; B unlinked; Undo restores exact AB/AC IDs, errors, actual prior planning and initiating B context; Redo restores exact after-state; later ordinary supply loss never revives planning |
| `historical schemas preserve supported destination evidence` — `tests/networkLifecycle.test.ts`, `resourcePersistenceCompatibility.test.ts` | Valid network 1/2/3/4, exact legacy links, outpost-only browser legacy, old broken refs, linked and unlinked 1.0 | Nested 5, outer 1; existing defaults/migrations remain; no invented target; intent already discarded by old versions stays unknowable |
| `simple intent and retained claims round-trip without loss` — lifecycle and `tests/browserStorageRecovery.test.ts` | `{outpostId}` intent with present/absent parent; separate exact missing, self and multiple-distinct claims; multiple networks | Outpost ID, exact record/endpoint IDs and ordering preserved; no discriminator/exact-pad intent or lookup-driven conversion/drop; present choice incomplete, absent parent missing; schema-4 storage still accepted into 5 |
| `malformed input rejection preserves supported conflicts` — lifecycle/recovery and `tests/networkImportFileSize.test.tsx` | Wrong-type/null/array intent, absent/empty outpostId, obsolete kind/pad fields, duplicate entity/pair IDs, intent+any qualified incident claim, malformed later member; control with multiple distinct claims and repeated pad IDs in different outposts | Malformed new shape/dual authority rejected before dispatch; historically supported distinct conflicts remain accepted; existing malformed JSON/schema/envelope checks unchanged; valid qualified identity retained; failed import leaves collection/context/history/storage untouched; recovery preserves raw source |
| `intent respects technical envelopes and older readers` — `tests/externalImportCapacity.test.ts`, recovery tests, frozen 1.0 synthetic-reader fixture/probe | Exact/one-over raw byte/string/depth/member/pad bounds including longest target IDs; v5 into v4 reader; falsely v4-labeled intent | Limits unchanged; external/storage distinction preserved; v5 import rejected by old reader; fallback preserves bytes initially; down-label demonstrates loss rather than compatibility |
| `localized native selectors remain repairable` — localization/component suites plus isolated real-browser checklist | All ten locales, counts 0/1/2/5/12/22, 25-character and long names/IDs, normal and 200% layouts | Natural count form and formatted number; full semantic copy/tooltips/history; Add last and normal value after commit; disabled missing option distinguishable; no broad geometry changes |
| `keyboard add commits once and cancellation is native` — component tests plus real browser | Open select arrows/Enter/Escape, closed arrows, Tab, pointer selection, event replay and failed command | Only native committed change acts; precommit cancel no mutation; committed action Undoable; local selector focus/expansion remains; no action token left selected |
| `stale add and selection fail before mutation` — cargo/session and storage App tests | Delete O/L, change selected O, switch network with reused IDs, repeat same command before rerender, fail identity/conflict guard | No pad, partial unlink, retirement, storage write or history entry; same state reference; deliberate fresh second Add still creates exactly one further pad |

Future implementation verification should include `npm test`,
`npm run test:components`, `npm run typecheck:tests`, `npm run build`,
`npm run lint`, appropriate localization verification and `git diff --check`,
plus the bounded browser checklist. These are future gates; this report does not
claim they ran. Existing assertion-sensitive fixtures include removal expansion
tests (`browserStorageApp.test.tsx:101-145`), membership/history tests
(`collectionEditingSession.test.ts:314-414`), strict migration tests
(`networkLifecycle.test.ts`), envelope tests, and fixed catalogue/review counts.

## 12. Implementation sequence and settled decision ledger

Recommend one integrated feature delivery. Internal work can be dependency-ordered,
but do not ship persistent partial choices while any serializer, routing path,
validator or repair UI is unaware of them. The correction settles the material
product decisions; no new source incompatibility was found.

1. Define the simple outpost-choice model, qualified resolver/conflict analysis
   and immutable transition/record-removal contracts; add focused pure tests.
2. Implement nested v5 migration, strict import/recovery checks, v4 storage
   acceptance and compatible defaults/fixtures together with route resolution.
   Preserve accepted invalid exact claims without ghost supply. Expose no new
   UI state producer before these boundaries are ready.
3. Integrate clean disconnection, separate incomplete/missing rules and revised
   participant-conflict diagnostics; add structured context/localization.
   Implement atomic commands, current-state guards, explicit record repair,
   history and planning reconciliation. Wire persistent choice and remote Add;
   remove transient drafts rather than retaining two authorities.
4. Complete native status/count/focus behavior and compact incident-record
   inspection/removal, then run the finite regression/browser checks. Update
   current owner docs to implemented truth. Release/version/deployment remain
   separately authorized work.

Use intent-first comments at choice/claim exclusivity, accepted imported claims,
structural route eligibility, explicit record removal, reducer guards, migration
and snapshots under `CODE-STYLE.md`. Do not preserve outdated transient-draft
comments or narrate map/filter operations. No broad cargo redesign, throughput,
resource-rule change, backend, telemetry, cross-network links, archive rewriting
or new dependency is needed.

### D1 — Rejected remembered-counterpart recommendation; clean removal selected

Historically the original audit recommended retaining exact remembered targets
on former partners after unlink/reassignment and after the deletion behavior
required by its brief. The subsequent correction rejects that recommendation
and withdraws the original deletion-preservation requirement.

The settled result is clean removal: unlink makes both ends unlinked; deletion
removes the object and touching established pairs; replacement leaves displaced
partners unlinked. Only a new explicitly selected outpost becomes unfinished
intent. Preserve independent unrelated choices and exports, never manufacture
a former-partner choice, and introduce no third detached-destination rule or
reconnection machinery. Undo restores real historical records and choices.

### D2 — Structural exclusion accepted, with explicit repair and participant errors

Accepted domain-invalid exact records remain intact for diagnostics and explicit
repair. Missing, ambiguous and self-endpoint claims do not route. Unrelated
unambiguous pairs and otherwise resolved gameplay-diagnostic pairs retain
existing supply semantics; no new general same-outpost policy is introduced.

AB+AC produces exactly three neutral structural errors, one per surviving A/B/C
pad, each navigating to its own outpost. Use directly competing records and
qualified identity, deduplicated for overlapping conflicts. Revise the existing
conflict rule rather than retaining an old central-only duplicate.

Ordinary ambiguous edits can fail atomically, but a surviving participant can
inspect and explicitly remove its chosen incident record by stable ID. Removing
AB at B leaves AC intact and B unlinked, recomputes diagnostics/supply and records one
Undoable repair including any actual-source planning retirement. No first-match
winner, automatic cleanup or JSON-only recovery for living participants.

Both decisions are settled. Their rejected alternatives are historical context,
not options still awaiting approval.

## 13. Audit verification and handoff

### Original audit evidence (historical; not rerun for this correction)

Three assertion-based probes ran with Node `v24.21.0` using
`node --experimental-strip-types --input-type=module` and stdin code only:

1. Synthetic A with no receiving pad, B with an Iron-exporting pad, and a retained
   broken link: baseline availability, import summary and provenance incorrectly
   supplied A; B's routed export was correctly absent. Assertions passed and
   establish the source-level asymmetry, not a fix.
2. Synthetic collection/network schema 1/4 with an extra pad `destinationIntent`:
   baseline external deserialization accepted it and migration removed the
   field. Assertions passed, confirming that an optional field without a version
   bump is unsafe for preservation.
3. The same synthetic network labeled schema 5: baseline external import rejected
   it with `unsupported-network-schema`; browser initialization using a temporary
   in-process mock `localStorage` returned recovery fallback, preserved identical
   source bytes, and made zero writes. Assertions passed.

The probes created no fixture files or persistent browser data and started no
server/background process. No cleanup of pre-existing work was performed.
The original report-only checks passed; only this report was created then.
The original audit brief and launch runbook remained untouched.

### Correction verification and scope

Correction verification passed: `git diff --check` and separate whitespace/EOF
checking for this still-untracked report. `git status --short` confirmed the
same four untracked paths and no tracked changes. Final inspection found no
stale policy recommendations; it checked qualified conflict placement and
explicit repair. Branch/HEAD remain unchanged, and SHA-256 hashes of both
briefs and the runbook match their correction-start values. These are report
checks, not evidence of feature implementation. No new probes, tests,
fixtures, scripts, browser sessions, full build or lint run were required or
performed.

Only this existing report was edited in the correction. The two supplied briefs
and launch runbook remain untouched; they and this report are the four pre-existing
untracked paths at correction start. No tracked source/test/schema/catalogue/
owner-document changes, dependency installation or remote operation occurred.
The checkout remains on `staging`; no commit, push, branch/tag creation or
switch, release, deployment or remote-setting change was performed.

Suggested eventual commit after review:

```text
docs: reconcile remote cargo connection audit
```

**Schema impact:** the recommendation remains a necessary, bounded nested-network
migration **4 → 5**, with outer collection **1**, unversioned storage envelope
and unchanged resource limits. Only genuine outpost-only choices add persisted
intent; exact claims remain network-owned. Older 1.0 readers reject properly
versioned new data and cannot transparently operate on it. Down-labeling loses
unknown fields. The migration and feature are not implemented by this report.

**CARGO-A — coherent bounded design; ready for an implementation brief**
