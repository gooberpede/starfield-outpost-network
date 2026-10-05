# CODEX IMPLEMENTATION BRIEF — Remote Cargo Creation, Connection Intent and `1.1.0-rc.1`

## Objective and delivery boundary

Implement the accepted **CARGO-A** design in:

`docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-REVIEW.md`

Deliver one integrated, review-ready local candidate for **Starfield Outpost Network `1.1.0-rc.1`**, comprising:

- creation and connection of a new remote Cargo Link from the existing destination selectors;
- persistent, explicitly unfinished outpost selections;
- clean disconnection of established pairings;
- truthful missing/conflicting relationship presentation, diagnostics and explicit repair;
- consistent structural routing, atomic Undo/Redo and unchanged Planned Supply retirement;
- nested network schema **5**, with safe migration from supported older data;
- a localized **Release notes** link in About and concise version/compatibility documentation.

This is an implementation and verification task, **not authorization to release**. Do not commit, stage, push, tag, create a GitHub Release or draft, publish, deploy, change branches, change DNS/indexing, or alter remote settings. The later stable target is `1.1.0`; do not promote to that stable version in this task.

The main product rule is:

> Preserve an unfinished destination the user deliberately selected. Remove established pairings cleanly when disconnected, deleted or replaced. Never manufacture unfinished intent on a former partner. Undo restores the actual prior state and is deliberately different from a later ordinary edit.

---

## 1. Authority, read-first files and baseline

### Design authority

Use the **corrected CARGO-A report**, not its superseded CARGO-B version. Verify that the report contains all of these settled decisions:

- `destinationIntent` stores **only** an outpost ID;
- ordinary deletion/unlink/reassignment leaves former partners unlinked;
- no exact-pad intent, detached-destination rule or remembered-former-partner mechanism;
- supported contradictory imported pairing records are preserved for explicit repair;
- A↔B plus A↔C produces exactly three participant conflict errors;
- an incident pairing can be removed explicitly by its stable record ID.

The corrected report is the detailed source for models, transitions, compatibility and tests. Its illustrative helper names may be adapted to repository conventions without changing the contracts. This brief additionally authorizes the application version and release-discoverability work agreed **after** the audit. The audit's earlier exclusions of version/related documentation changes do not prohibit those expressly scoped additions here.

Read before editing:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/DOMAIN-RULES.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/BACKLOG.md
docs/DEPLOYMENT.md
README.md
docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-REVIEW.md
```

Inspect the report's affected source/test owners, current localization/review workflow, `package.json`, `package-lock.json`, `scripts/version-management.ts`, and `AboutDialog.tsx`.

If the corrected report is unavailable or is still the obsolete design, stop. Do not recover requirements from an older brief by inference.

### Work on `staging` only

The inspected source checkpoint is:

```text
repository: gooberpede/starfield-outpost-network
branch: staging
commit: 18567e816db4f6fc71687cd1e41eea9a5999d6d7
application: 1.0.0
nested network schema: 4
collection schema: 1
```

The corrected audit may have been committed after that checkpoint. Documentation-only descendants are acceptable after checking their diff. Record the actual local baseline; do not reset to the checkpoint. A material source divergence must be reported before dependent work.

Capture current branch, full HEAD, staged/unstaged status, pre-existing untracked files, Node/npm versions and all three package/lockfile version values. Require agreement at `1.0.0` for a fresh execution. If this is a resumed partial execution, identify its previous work explicitly rather than rerunning a version command blindly.

If the checkout is `main`, detached, or another branch, **stop and ask the maintainer to switch**. Do not switch, merge, stash, clean, reset or cherry-pick automatically. Unexpected tracked edits must not be overwritten or silently incorporated.

The corrected audit, both audit briefs, the earlier launch runbook, and this supplied implementation brief may remain untracked. Record and preserve their paths and hashes. Do not edit or archive those inputs; do not execute the old 1.0 launch runbook. The three pre-1.0 ZIPs and their indexes remain immutable and out of scope.

---

## 2. Terminology and non-negotiable invariants

Keep existing user-facing terminology: a **Cargo Link** card represents the installation internally called `CargoPad`. A **pairing** is the network-owned, bidirectional `CargoLink` record connecting two exact pads. **Intent** is the explicitly chosen remote outpost while the user has not selected a remote pad.

Do not globally rename these types or UI terms.

Implement the accepted simple shape:

```ts
interface CargoDestinationIntent {
  outpostId: string
}

// Added to the existing CargoPad shape:
destinationIntent?: CargoDestinationIntent
```

Keep `CargoLink` and its exact `{ outpostId, cargoPadId }` endpoints network-owned. Do not mirror completed pairings onto pads. Derived presentation classifications are not serialized.

Required invariants:

1. Absence of both intent and an incident pairing claim means **unlinked**, regardless of exports or former history.
2. A pad may own one genuine outpost-only intent or participate in exact pairing claims, never both. Schema-5 boundaries reject intent plus **any** incident raw claim, including a missing, conflicting or self-referential claim.
3. Intent contains one nonempty outpost ID. It does not reserve a pad, imply reciprocity, carry an exact pad ID, or supply cargo.
4. Multiple unpaired pads may independently choose the same outpost. Completing a pairing consumes genuine intent on the two selected endpoints only.
5. Qualified endpoint identity is `(outpostId, cargoPadId)`. Pad IDs are scoped to their outpost. Do not use names, ordinals, or ambiguous delimiter-concatenated keys as identity.
6. Preserve supported domain-invalid exact claims for diagnosis and explicit repair. Do not convert missing/conflicting records into intent or select the first claim as authoritative.
7. No tombstones, stored old names/ordinals, deletion timestamps, reason history, exact-target intent, detached-state persistence or automatic reconnection.
8. All ordinary creation/selection commands remain within the active network and exclude the local outpost. Do not introduce a new general policy for historically accepted imports linking two distinct pads within one outpost.

Introduce a small pure domain owner, such as `src/domain/cargoConnections.ts`, for endpoint resolution, conflict analysis, destination classification, new-pad type choice and immutable cargo transitions. Keep serialization in data modules, history/persistence orchestration in existing owners, and localized text/DOM behavior in presentation owners. Avoid a general graph framework or application-wide command-system rewrite.

## 3. Remote outpost and pad selectors

### Remote outpost selector

Keep **Unlinked** first, followed by all other outposts in the current network's existing order. Zero-pad destinations become selectable.

Show a localized count for every ordinary destination, for example:

```text
Kreet Fe He3 — 2 cargo links
Andraphon Al Fe — 1 cargo link
Ternion Hub — 0 cargo links
```

Count all recorded pads, including occupied and unlinked pads—not just free pads or completed pairings. Derive counts from current state; never persist them. Update immediately after Add, deletion, Undo and Redo. Do not change outpost order or identity.

Selecting a different real outpost is a domain edit committed on native selection change, not blur. Store the outpost-only intent, and, where applicable, remove the acting pad's old unambiguous pairing. Its former partner becomes unlinked. This is one history action.

Preserve the selected outpost through blur, collapse, navigation between outposts/networks, remount, reload and supported JSON round-trip. Remove `draftLinkedOutpostIds` and its obsolete precedence/cleanup logic; do not retain two sources of truth.

### Remote pad selector

For an existing selected remote outpost, present:

1. the ordinary pad placeholder;
2. an explicit selected unavailable-status option when a retained exact missing claim requires it;
3. existing pads in their current order, with established contents/occupancy labels;
4. **+ Add cargo link**, last.

For zero pads, show the placeholder and Add. A real but empty outpost is a valid creation target. A nonexistent imported outpost is not: present its unavailable selected identity, but do not fabricate an outpost, children or an enabled Add operation.

The pad placeholder is not an unlink command. Selecting it while a pairing or retained missing claim is selected must leave the model unchanged and restore its controlled value. **Unlinked in the outer selector** is the explicit abandonment action.

Existing occupied targets remain selectable when replacement is unambiguous. Preserve their occupancy descriptions; do not impose a new empty-only policy.

### New remote pad defaults

Every committed Add creates a fresh pad; never reuse an existing empty pad. Append it using the current remote pad order and existing invariant label helper. Give it a fresh stable ID and an empty outbound-item array.

| System information at action time | New remote pad type |
| --- | --- |
| Both nonblank IDs resolve to reference systems and are equal | `regular` |
| Both nonblank IDs resolve to reference systems and differ | `interstellar` |
| Either ID is blank/unresolved, or required system reference data is unavailable | Current local pad type |

Do not infer location from names, bodies or two equal blank strings. Do not retype the local pad or repair inconsistent body/system data. Do not seed exports, Helium-3, production or Planned Supply. Existing type/fuel/location diagnostics remain applicable.

Do not disable Add at the gameplay skill limit or invent a limit for a null rank. Preserve ordinary Add's distinction between permissive gameplay recording and technical storage/import envelopes.

## 4. State transitions and clean counterpart handling

Use the full corrected audit transition table. The following are required acceptance examples; A/B/C/D denote specific qualified pads, O an outpost, and N a newly created pad.

| Before/action | Required result |
| --- | --- |
| Unlinked A selects O | Only A gets outpost-only intent; incomplete warning; no pair/pad creation |
| A has intent for O, then Add | N appended at O; A↔N created; A intent consumed |
| A↔B; A selects a different outpost O | Old pair removed; A explicitly incomplete at O; B unlinked |
| Previous row, then Add | A↔N; B remains unlinked; first Undo restores A's O placeholder, second Undo restores A↔B |
| A↔B; Add at B's outpost | A↔N; B remains present, unlinked, with exports/type unchanged |
| A↔B; A connects to free C | A↔C; B unlinked |
| A↔B and C↔D; A connects to occupied C | A↔C; B and D unlinked; no manufactured intent on either |
| A↔B; either endpoint explicitly chooses Unlinked | Pair removed; both pads unlinked |
| A↔B; either pad is deleted, including the last pad at its outpost | Requested pad and pair removed; surviving partner unlinked |
| Delete a whole outpost participating in normal pairings | Outpost and touching pairings removed; former partners unlinked; existing navigation fallback retained |
| Independent A→O intent, then O is deleted | Preserve A's real recorded outpost ID; missing-parent error replaces incomplete warning |
| Delete the pad owning an unfinished choice | Choice removed with its owner; no orphan intent |
| Unlinked A has exports but no selected destination | No incomplete/missing-destination warning merely because exports exist |
| Re-select current outpost or current connected pad | No-op; do not reset choices, retype, write or add history |

All untouched survivors preserve independent configuration, exports, type, IDs and relative order. Preserve unrelated unfinished choices. Completing A↔C consumes any genuine intent at A and C, not choices belonging to other pads.

A retained unique broken imported pairing can be explicitly removed or replaced from its surviving participant. If its parent exists, select an existing pad or Add; otherwise select another real outpost first. Undo restores the original claim and absent IDs, not newly invented intent.

Normal object deletion is an explicit mutation with its established collateral pair removal. Do not invoke it automatically to repair imports. Ordinary ambiguous selector changes must not guess which record to remove; expose the explicit record-repair path below instead.

## 5. Separate validators and truthful diagnostic placement

### Incomplete destination

Add `cargo-destination-incomplete`, **operational / warning**.

Emit for a surviving pad with a valid outpost-only intent to an existing remote outpost and no incident claim. Derive immediately after the recorded selection; no blur timer or stored validity flag.

Do not emit for unlinked exports, cleanly disconnected former partners, completed pairs, missing parents, retained broken exact claims, self references or conflicts. Use a whole localized message meaning:

> Choose or add a Cargo Link at {destination} to finish this connection.

Issue navigation identifies the surviving owner outpost/pad. Target identity is separate metadata resolved into labels at presentation time.

### Missing endpoint

Adapt existing `cargo-link-endpoint-missing`, preserving **structural / error**. Do not combine it with the incomplete rule or add a detached-destination rule.

Handle separately:

- an actual retained exact claim naming an absent pad in a real outpost;
- an actual retained exact claim naming an absent outpost;
- an independent outpost-only intent naming an absent outpost.

Use missing/unavailable wording, not a claim that import proves deletion. Outpost-only intent must never imply that a pad was selected. Missing parent suppresses secondary missing-pad/incomplete messages for the same target.

Preserve exact claim/endpoint IDs. Target the issue at a surviving participant where repair is possible, with distinct structured target and record context. Deduplicate as specified by the corrected report; do not report duplicate intent/claim ownership.

If neither endpoint survives, retain network-scoped structural diagnostics with record/endpoint IDs and honest guidance to correct an exported copy and reimport or restore a known-good export. Do not fabricate a navigation target. This exceptional orphan guidance must not replace in-app removal for living participants.

### Conflicting pairings: participation, not blame

Retain `cargo-pad-linked-multiple-times` and **structural / error**, but revise its description, message and emission to cover participation in directly conflicting pairing records.

For:

```text
AB: A / Pad 1 ↔ B / Pad 2
AC: A / Pad 1 ↔ C / Pad 4
```

emit exactly three conflict-rule entries: A/1, B/2 and C/4. Each navigates to its own outpost and has sufficient context to explain AB and AC. Do not describe B/C as each being multiply linked. Do not retain the old central-only issue as an additional fourth entry.

Use this deterministic analysis:

- index distinct raw record IDs per qualified endpoint, counting an endpoint only once within a record;
- an endpoint with more than one incident distinct record is a conflict center;
- every record incident to a center is directly conflicting; include both surviving ends of those records;
- emit one issue per distinct surviving participating pad;
- include that owner's incident conflicting records and their direct competitors at either endpoint; merge overlapping direct context without arbitrary recursive graph expansion;
- canonicalize record/endpoint context so record-array order cannot change issue identity or select a winner.

A standalone self-endpoint record is handled by the existing self-link rule, not multiplicity merely because its two endpoint slots match. A self record plus another competing record can independently produce both applicable structural facts. Missing records may independently coexist with conflicts. Broken raw competitors count: do not select a complete record as winner over a broken one.

Do not add new severity rules for unrelated gameplay warnings/errors.

## 6. Explicit record repair and navigation

For structural repair, show a compact inspection area in the expanded pad editor with its actual incident pairing records. Identify each by stable record ID and both endpoint locators, using safe raw-ID fallbacks where objects are missing. Show directly competing nonincident records as explanation, not as local-owned connections.

Each incident record has an accessible semantic **Remove this pairing** action. At A in AB+AC, either record can be removed; B can remove AB; C can remove AC. Ordinary ambiguous Add/relink/Unlinked controls must not infer one record, but these explicit removal actions remain enabled.

Removal takes the chosen record ID, expected network, initiating surviving endpoint and current-state expectations. Validate participation and expected record endpoints, then remove **only** that record. Do not require uniqueness of incident pairings for this repair. Do not add a remove-all operation, confirmation wizard or automatic conflict resolution.

After removing AB at B:

- AC is unchanged; B becomes unlinked;
- all three conflict entries disappear if no other contradiction remains;
- AC can become routable without a new connection command;
- any newly fulfilled Planned Supply retires in the same repair action;
- Undo restores both original records, errors and actual pre-action planning; Redo restores the exact after-state.

Navigation is not mutation. Preserve the existing Validation panel and outpost-targeted interaction. If needed, add only a cargo-scoped, one-shot reveal request keyed by network/outpost/pad so the relevant card and repair control are available after remount. Keep the panel open. Do not implement general exact-control highlighting or multi-destination issue widgets.

## 7. One shared structural routing boundary

Use a shared pure resolver for all supply and destination consumers. Routing must not depend on whether validators are enabled or on the absence of all validation issues.

An eligible exact pairing must have:

- both referenced outposts and both qualified pads present;
- distinct qualified endpoints;
- neither endpoint claimed by another distinct raw record.

Intent alone, a missing endpoint, a self-endpoint claim, and a directly ambiguous pairing never route. A pad with one incident record is still ambiguous if the opposite endpoint is multiply claimed. Do not pick a first record. Preserve raw claims independently from this derived eligibility.

Integrate consistently into `availability.ts`, `logistics.ts`, `provenance.ts`, and Cargo summaries/relationship labels. Cover the indirect Matrix, Search, manufacturing, fuel and other diagnostic consumers identified in the audit. Both sending and receiving endpoint existence must be checked: retaining a broken import must not supply an outpost whose receiving pad is absent.

Unrelated unambiguous pairs continue to work. Preserve existing deduplication and presentation ordering. Analyze each network without a broad graph traversal framework or a persistent secondary connection store.

Do **not** newly require matching pad types, known/equal systems, sufficient skill, fuel, actual upstream resource production or feasible exported-product recipes for routing an otherwise structurally resolved pairing. Recorded exports continue to count under the existing tracker semantics even when separate operational/supply diagnostics apply. Preserve the established UI-versus-validator distinction in actual/effective Helium-3 availability.

Two distinct pads within the same outpost are not the same as a self-endpoint claim. This feature's normal selectors/commands exclude the local outpost; do not silently broaden imported same-outpost policy while implementing the resolver.

## 8. Atomic commands, current-state guards and history

Implement remote Add as one semantic command, not `addCargoPad()` followed by `setCargoLink()`.

1. Capture the initiating saved-network ID, local endpoint, selected remote outpost and rendered before-state expectation.
2. Generate the new pad/link IDs once outside the pure reducer/updater. Check appropriate scopes, including retained raw references to absent objects; do not accidentally satisfy an unrelated missing-ID claim. Do not generate IDs during React reducer replay or Redo.
3. Inside the current-state boundary, verify expected active network, current owner/target existence, selection/topology, identity safety and unambiguous replacement. Do not trust only render-time App checks.
4. Append the empty remote pad, remove the explicitly replaced unambiguous pairing if any, consume genuine intent on the selected endpoints and create the new pairing in one immutable result.
5. Reconcile Planned Supply once on that completed result, then return it for one history entry.

Use a narrow expected-network guard on the existing apply action, or an equivalent bounded mechanism. A command created in one network must not affect another network with coincidentally equal outpost/pad IDs. Reject stale owner/target/selection/record changes before any mutation or retirement.

Rejected/no-op commands return the identical state and cause no history entry or cargo-driven storage write. Record repair uses the same current-state guard but deliberately permits ambiguity because the user identifies the exact record.

Prevent duplicate delivery from one stale Add event/render from appending another pad. A deliberate fresh Add selection after the controlled value updates remains a new valid action. Do not use an arbitrary debounce that suppresses intentional later Adds.

History requirements:

| Situation | Undo requirement |
| --- | --- |
| Add from O intent/placeholder | Remove new pad/pair; restore O intent and placeholder |
| Add replacing an existing pair | Remove new pad; restore exact original pair and selected old partner |
| Add replacing a unique missing imported claim | Restore original record ID, absent endpoint and diagnostic |
| Local pad created by an earlier action | Undo remote Add leaves that local pad present |
| Change remote outpost, then Add | Two actions; first Undo restores new outpost-only intent, second restores the original relationship |
| Explicit conflict-record removal | Restore precisely the removed record and original planning/conflict state |

Keep the existing whole-collection snapshots, 1,000-entry cap and initiating **local** Network + Outpost context. Redo restores stored IDs, not regenerated objects. Normal remote Add stays at the local outpost with its card expanded and focus on the remote pad selector. Remote membership must not trigger new-local-pad focus or unrelated local expansion/scroll resets.

Undo after navigation returns to the initiating local context using established history behavior. Do not promise restoration of all historical DOM focus, scroll or collapse state. Any necessary reveal is session/presentation-only.

## 9. Planned Supply is unchanged except for correct routing inputs

Preserve the settled rule exactly:

> A new actual source can retire Planned Supply. Later ordinary loss of that source does not recreate it. Undo restores the actual historical snapshot, which may contain a previously retired entry.

For example, local A exports Iron, remote O plans Iron, and Add creates empty N. A↔N may immediately supply O and retire its Iron placeholder. Include creation, connection and that retirement in one action. Undo restores the actual earlier planning. Later unlink/deletion/reassignment/production loss creates no new planning entry.

The same reconciliation applies when explicit record removal resolves a conflict and makes a retained pairing usable. Do not reconcile rejected commands, introduce placeholder revival, or delete recorded exports/manufacturing merely because supply is lost.

---

## 10. Nested schema 5: migration and input boundaries

Advance only the nested network schema **4 → 5**. Collection schema stays **1**. Do not add a storage-envelope version, change storage keys, or alter the reference-manifest schema/dataset.

### Required changes

- Explicitly preserve valid `destinationIntent` in reconstruction; the current field-by-field migration drops unknown fields.
- Fix storage-source version acceptance deliberately. A naive current-version increment would reject valid schema-4 storage before migration. Accept supported historical versions with their respective requirements, then validate the complete migrated schema-5 shape.
- Update current defaults/sample data and current-shape fixtures. Do not mass-replace historical schema-4 fixtures or unrelated version numbers.
- Keep raw source guards before migration and complete post-migration checks. Do not mask malformed new input with lossy defaults, filtering, partial collection salvage or inferred pairings.
- Validate the new optional object strictly: nonempty string `outpostId`; no null/array/wrong type/missing or empty ID; reject the obsolete `kind` or `cargoPadId` intent variants. Do not extend this into an unrelated global unknown-property policy.
- Reject new-format intent plus **any** qualified incident raw pairing. Preserve supported multiple distinct exact claims without intent as readable domain-invalid data for diagnostics/repair.
- A correctly shaped nonempty target ID whose outpost is absent remains supported unresolved data. Do not discard it through reference lookup.

### Required compatibility behavior

| Input | New-reader result |
| --- | --- |
| Supported 1.0 exports/storage, nested schema 4 | Migrate to 5 without losing pairing IDs, ordering, exports, character data, resources, production, manufacturing or planning |
| Existing intentionally unlinked pad | No fabricated destination intent |
| Supported historical schemas 1/2/3 | Preserve established exact-link/resource/capability/biome migration, then reach 5 |
| Supported legacy browser storage recording only an outpost choice | Preserve that real nonempty outpost-only choice where it does not compete with exact claims; do not guess a pad |
| External legacy import | Preserve its existing stricter exact-pad requirements; do not broaden acceptance merely because browser recovery supports more |
| Retained exact missing/self/conflicting claims | Preserve IDs and records; derive diagnostics and exclude ineligible routes; no conversion to intent |
| New intent with present/absent parent | Preserve exactly through save/reload/export/import; derive incomplete versus missing-parent state |
| Existing empty endpoint reference strings | Preserve historically supported broken references and diagnose them; do not confuse them with empty entity IDs or create valid intent from them |
| Malformed shapes, duplicate entity IDs/pairs, unsupported versions, exceeded envelopes | Preserve established rejection plus strict new-field checks; no current-state mutation on failed import |
| Future unsupported storage schema or incoherent stored source | Existing recovery fallback preserves original raw bytes at initialization; no silent partial salvage |

Previously discarded UI drafts cannot be recovered. Do not infer them from exports, history or names. Where old outpost-only evidence competes with exact legacy claims, follow the corrected audit's preservation limit: do not construct forbidden dual authority or pretend both were retained. Report the limit truthfully.

Preserve the existing difference between external active-network fallback and stricter browser active-ID coherence.

### Technical resource envelopes

Do not change numeric capacity limits. In particular, retain the distinct external and storage policies identified in audit section 9:

| Bound | External imports | Browser storage |
| --- | --- | --- |
| Raw size | 4 MiB file bytes | 4,194,304 serialized code units |
| Networks | 64 | 128 |
| Outposts per network | 96 | 128 |
| Pads per outpost | 12 | 16 |
| Pairing records per network | 256 | 384 |
| Exports per pad | 128 | 256 |
| Aggregate array members | 25,000 | 65,536 |
| String/key length | 4,096 UTF-16 code units | 16,384 code units |

Retain all other existing limits, including storage depth/generic-array checks and external manufacturing/planning bounds. The new object is visited by existing raw size/string/depth accounting; pad count bounds intent count. Test new-field exact/one-over boundaries rather than increasing limits.

Add remains permissive like ordinary Add. An unusually large network may export beyond the stricter importer or remain unsaved beyond storage limits; preserve existing feedback and do not promise universal round-trip or silent persistence success.

## 11. Application version and future release policy

### Candidate version

Once the integrated change is ready for its verification checkpoint, use the existing command **once**:

```sh
npm run version:rc -- 1.1.0
```

Expected result:

```text
1.0.0 → 1.1.0-rc.1
```

Require these three values to agree:

```text
package.json.version
package-lock.json.version
package-lock.json.packages[""].version
```

Only those version strings may change in the package/lockfile. No dependency churn, npm privacy change, new script, version-tool expansion or manual version editing. A tool failure or unexpected starting version is a stop/report condition, not permission to bypass the command.

Do not advance again for ordinary implementation edits or rerun the command on resume. A later deliberate candidate increment and stable promotion require separate authorization. No RC tag or public RC release is required.

Verify that the built application displays `1.1.0-rc.1` and preserves existing truthful Git identity/source-link behavior. Before commit, a modified identity is expected; do not fabricate a clean deployed identity.

### Document the agreed compatibility contract

Application and data versions are separate identifiers. Clarify in the existing README version section:

- patches are compatible fixes; minor releases add compatible application functionality;
- minor releases may advance the save format while retaining a supported upgrade path for existing data;
- older application versions are not guaranteed to read newer save formats;
- incompatible changes to a supported application or interchange contract still require deliberate major-version treatment;
- version labels do not substitute for migration evidence or build identity.

The proposed stable feature release is `1.1.0`, contingent on migration/acceptance. Describe it as an upcoming candidate, not already publicly released. Remove directly conflicting pre-launch/pre-RC wording in the touched version section; do not use this task for broad README cleanup.

### Schema-aware rollback guidance

Add a concise upcoming-schema compatibility/rollback section to the existing deployment guidance and the implementation verification record. Preserve the factual 1.0 launch record, published tag and current production identity.

State explicitly:

- 1.0.0 does not read nested schema 5. External imports are rejected; browser initialization enters recovery fallback rather than displaying the upgraded collection.
- Preservation of raw bytes at fallback initialization is **not** safe downgrade support. A later deliberate persisted edit in the old reader can overwrite that source.
- Never lower a schema number to force import: the older reader can silently drop the new field.
- A pre-upgrade export usable by 1.0 must be captured before migration. Restoring it would omit later edits. A fresh export from a new reader is not automatically an old-format backup.
- Verify and record exactly when the new reader upgrades/writes existing browser data; do not assume migration requires use of the new Cargo feature.
- The later release plan must distinguish rollback to a verified schema-5-capable build from rollback to 1.0. Fix-forward or a separately verified compatible recovery build may be required; do not promise that the old deployment is universally safe.
- Preserve valuable data before recovery edits. Do not claim that exporting a fallback/default collection retrieves the unread original storage.

This task documents and tests the boundary; it does not implement a downgrade converter, startup backup service, migration popup, database, telemetry or automatic production rollback. Actual release operations remain separate.

## 12. About: one release-history link, not a new subsystem

Add a localized **Release notes** link to the existing About external-link group, using:

```text
https://github.com/gooberpede/starfield-outpost-network/releases
```

Use the ordinary existing anchor convention, including `target="_blank"` and `rel="noopener noreferrer"`. The label must resolve in every supported locale. Preserve the existing exact-build source link and its clean/modified/unverified conditions.

Link to release history, not `/releases/latest`, an inferred `v${version}` URL, the unreleased RC tag, or a specific future `1.1.0` page. A candidate may have no published notes yet.

No GitHub API calls from the app, embedded changelog viewer, new modal, stored last-seen version, notification badge, automatic What's New popup, runtime changelog dependency or `CHANGELOG.md` is authorized.

Public release notes will be maintained through GitHub Releases. At completion, provide a short **provisional** English `1.1.0` notes body in the verification record, clearly marked unpublished and subject to acceptance. Cover remote creation/counts/unfinished choices, diagnostic and routing fixes, and the schema-5/older-reader compatibility warning. Do not claim passing checks that remain outstanding or create a remote draft now. Keep current technical truth in the owner docs; this draft is not a second canonical changelog.

## 13. UI state, native events and accessibility

Use one shared derived destination classification for expanded and collapsed presentation, titles and disclosure semantic summaries:

| State | Required meaning |
| --- | --- |
| Unlinked | Unlinked |
| Genuine intent | Destination outpost selected; choose Cargo Link |
| Eligible completed pair | Existing normal destination/inbound summary |
| Missing exact pad | Outpost shown; Cargo Link unavailable; exact missing ID accessible |
| Missing outpost | Outpost unavailable with truthful ID fallback |
| Conflict | Conflicting cargo-link pairings; no winning destination |
| Self reference | Existing self-link meaning and record-specific repair |

Preserve outbound summaries in all states. Only eligible pairings produce inbound summaries. An unavailable selected pad status must not look like the ordinary never-selected placeholder. A former partner of a cleanly removed pairing shows normal Unlinked, with no stale target.

Do not mix raw imported IDs and magic action/status strings in `<option value>`. Encode **all** relevant options into disjoint namespaces or use a narrow equivalent mapping, with a typed decoder. A legitimate ID literally equal to `__add__`, a placeholder token or encoded-looking text must still be an ordinary ID. Never persist UI tokens.

Trigger Add only from the native committed selection event. Do not also trigger from input, click, keydown, blur or an effect. Native closed-select arrow keys may commit a choice without Enter. Escape only cancels before native commitment; after commitment Undo reverses the action. A rejected/no-op selection must restore the actual controlled value even if React receives an unchanged model; do not leave Add visually selected.

Keep native selects, accessible labels, visible focus and the compact layout. New repair buttons must have full endpoint context. Render imported text as text, not HTML. Long/blank names and long IDs must remain inspectable through the existing full-text/title/accessibility conventions. Limit CSS to this feature's necessary local fit/wrapping; do not redesign the workspace, cargo scroll geometry or Validation panel.

## 14. Localization and review artifacts

Cover all ten supported runtime locales: `en-US`, `en-GB`, `fr-FR`, `de-DE`, `es-ES`, `it-IT`, `pt-BR`, `pl-PL`, `ja-JP`, `zh-Hans`. Respect en-GB inheritance; do not add redundant overrides merely to touch every file.

Localize destination counts, Add, incomplete/missing/conflict states, pairing inspection/removal, history descriptors, relevant diagnostic details and the About link. Keep official Cargo Link terminology and existing abbreviation/full-name conventions. Resolve names from IDs in presentation; never serialize translated text or counts into intent.

For destination counts, implement the audit's narrow whole-message variant formatter, such as `src/localization/cargoDestination.ts`, using `Intl.PluralRules` categories and existing `formatInteger`. Map categories explicitly as appropriate for each locale, with a fallback and invariant forms where natural. Test at least 0, 1, 2, 5, 12 and 22, especially Polish. Do not embed unsupported `few`/`many` syntax in the current one/other parser or expand the general ICU/review grammar incidentally.

Keep natural punctuation/order inside complete localized messages, not an English suffix concatenated to names. Add appropriate action-time history labels while preserving stable identity and existing ordinal parameters.

Update the required production catalogues, review drafts/packages and relevant review CSV rows through the established workflow. Preserve earlier evidence and do not represent fresh wording as already human-reviewed. Changes to exact-copy/key-count assertions must reflect the actual approved keys, not disable contract tests. No reference-name overlay, Bethesda input, provenance-generation or immutable-archive changes.

English GitHub release-note prose need not be translated as a new runtime catalogue.

---

## 15. File and documentation scope

Use the corrected audit's section 11 inventory as the starting map, not a requirement to touch every listed file.

| Area | Expected owners |
| --- | --- |
| Model, resolution and pure operations | `src/domain/models.ts`; proposed `cargoConnections.ts` |
| Orchestration and guards | `src/App.tsx`; narrowly scoped `collectionEditingSession.ts` changes |
| Cargo controls and repair | `CargoPadEditor.tsx`, `CargoPadsEditor.tsx`; local CSS only as needed |
| Supply consumers | `availability.ts`, `logistics.ts`, `provenance.ts`; indirect consumers normally unchanged |
| Diagnostics | Registry/types; new incomplete rule; existing missing-endpoint and multiple-link rules; validation presentation/identity; narrow navigation |
| Migration/boundaries | `networkMigration.ts`, `externalImportValidation.ts`, `storageCoherence.ts`, defaults/sample fixtures; other data owners only where necessary |
| Localization | Narrow formatter, catalogues and required review artifacts |
| Release discoverability | `AboutDialog.tsx`, localized label, focused component/link tests |
| Application version | Three package/lockfile version values only |
| Durable behavior | `DOMAIN-RULES.md`, `ARCHITECTURE.md`, `UX-DESIGN.md` |
| Release/compatibility policy | Focused README version and `DEPLOYMENT.md` guidance; preserve launch facts |
| Evidence | `docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-VERIFICATION.md` |

Reconcile the stale domain-doc sentence suggesting occupied targets cannot be selected. Document the actual accepted replacement policy, explicit unfinished choices, clean disconnection, conflict participation and identified-record repair. Reconcile only the completed cargo backlog entry; do not close unrelated work.

Follow intent-first `CODE-STYLE.md` comments at exclusivity, routing, migration, current-state guards and history boundaries. Remove obsolete transient-draft explanations. Do not leak audit decision IDs or temporary implementation sequence labels into current source/owner docs.

Treat the cargo feature and the About/release-policy addition as separately reviewable change groups in the handoff. They can share one integrated candidate, but **no automatic commits** or branch splitting is authorized. Coordinate shared catalogue changes rather than creating inconsistent intermediate locale state.

Do not change dependencies, general version tooling, gameplay limits, browser storage keys, reference datasets, deployment behavior, HSTS, CSP, DNS, indexing, GitHub settings, public tag/release state or immutable archives. No new browser-testing project, Playwright installation or general benchmark harness.

## 16. Implementation order

Work in dependency order without exposing a partially supported persisted feature:

1. Define qualified resolution/conflict analysis, simple intent and immutable transitions; write focused pure tests.
2. Implement schema-5 migration, all input/storage checks, historical compatibility and shared routing together. Preserve raw invalid claims without ghost supply.
3. Add distinct validators, participant context and explicit record repair; integrate atomic current-state commands/history/planning.
4. Replace transient drafts, wire native selectors/counts/Add/status/repair presentation and localized copy; preserve focus and unrelated presentation.
5. Add the About link, targeted policy docs and migration/rollback guidance; prepare the version checkpoint through existing tooling.
6. Run all required automated and available bounded browser checks; document actual results and owner-only gaps.

No partially completed substep is ready for maintainer acceptance or staging deployment just because its focused tests pass. Do not stop after only the visible Add option while migration/validation/repair paths remain unfinished.

## 17. Automated regression coverage

Implement the corrected audit's finite section 11 test plan. The grouped acceptance matrix below highlights non-negotiable outcomes, not permission to omit detailed boundary cases in that plan.

| Group | Required evidence |
| --- | --- |
| Zero-pad Add and ordinary targets | Zero selectable; count correct; placeholder and Add ordering; occupied unambiguous targets preserved; exactly one fresh empty remote pad |
| Type defaults | Same/different known systems; blank/unresolved/missing reference data; both local types; local type unchanged; no inferred body/name correction |
| Counts/capacity | All pads counted; zero/singular/plural; null/rank 0/trained ranks; exceed skill limit without disabling Add; counts update on history/deletion |
| Persistent choices | Blur, collapse, outpost/network navigation, remount, storage reload and JSON round-trip preserve the exact choice; one edit at selection, none at blur |
| Clean disconnection | Unlink either end, delete either pad/last pad/whole outpost, free and occupied replacement; no manufactured intent/error; survivor configuration preserved |
| Independent missing parent | Delete target of an unrelated real outpost-only choice; preserve that ID, not deleted-pair intent; deleting owner removes choice |
| Missing claims | Both endpoint directions and missing parent/pad separately; same name/ordinal replacement never resolves ID; unique claim repair and wholly orphaned guidance |
| Conflicts | AB+AC gives exactly A/B/C entries; neutral copy/navigation; overlapping contexts deduplicated; reordered records preserve identities; broken competitor is not discarded |
| Qualified identity/self cases | Same pad ID across different outposts, delimiter-like IDs, standalone self and self-plus-competitor; no alias collisions or self-only multiplicity duplicate |
| Explicit repair | Remove AB or AC from A, AB from B, AC from C; record-order independence; remove only chosen incident ID; remaining conflicts retained; no mutation from navigation |
| Routing coherence | Missing receiver/sender pad/outpost, conflicts, self and intent never seed availability/provenance/Matrix/Search/Cargo/import/export/manufacturing; unrelated valid pairs still route |
| Existing semantic boundaries | Resolved routes remain under fuel/type/capacity/unresolved-export diagnostics; no blanket validation gate or new same-outpost import policy |
| Atomic history | Add from placeholder, existing pair and missing claim; previous local Add unaffected; repeated Undo/Redo reuses IDs; initiating context restored after navigation |
| Two selector edits | Change outpost then Add remains two history actions with the specified intermediate choice and clean former partner |
| Planning | Add and conflict repair can retire planning in the same snapshot; ordinary subsequent supply loss never revives it; Undo restores actual prior planning |
| Guards/no-ops | Stale owner/target/record/selection, wrong active network with reused IDs, collisions, duplicate delivery, same-value selection; identical state/no retirement/write/history; fresh later Add works |
| Historical migration | Supported schemas 1–4, exact legacy relationships, browser-only outpost choice, current linked/unlinked 1.0 data; schema-4 storage accepted before migration |
| New-format round-trip | Present/absent-parent intent and separately retained broken/conflicting/self records; multi-network order and IDs preserved; no exact-target intent |
| Strict rejection | Bad new object shape, obsolete variants, dual authority, duplicate identity/pairs, malformed later member; existing readable conflicts still accepted; failed import atomicity and recovery raw-byte preservation |
| Technical boundaries | Exact/one-over new-field string, byte/code-unit, depth/member/pad limits; external/storage distinction; unchanged limits and unsaved feedback |
| Older-reader boundary | Frozen 1.0 synthetic reader rejects properly versioned v5 import; old storage fallback initially preserves source; demonstrate down-label loss rather than claiming compatibility |
| Native selection | Disjoint value namespaces, action-looking IDs, open/closed keyboard events, no double dispatch, canceled precommit action, no-op restores actual select value |
| Presentation/localization | Every derived state truthful collapsed/expanded; all ten locales; counts 0/1/2/5/12/22; full missing IDs/repair labels; existing history and removed-pad expansion behavior |
| About/version | Release notes anchor exact history URL, localized accessible label, safe link attributes, no runtime API dependency; version fields and build identity consistent |

Use the existing Node/Vitest/component harnesses. Do not weaken existing assertions to make the new counts pass. Preserve historical fixtures as old versions; add/update current-format ones intentionally.

For the frozen-reader comparison, use project source at the known 1.0 release commit `be4539e8c01f5bd3c639b0df5ae92fee355926e8` and synthetic data in an isolated temporary work area. Do not switch the main checkout or run the old app against valuable live browser storage. Record exact reader/source and observations; a new-reader test pretending to be the old reader is not equivalent evidence. Do not install a second permanent project or edit the frozen source.

## 18. Required command verification

Run on the completed `1.1.0-rc.1` working tree:

```sh
npm test
npm run test:components
npm run typecheck:tests
npm run localization:verify
npm run localization:terminology:verify
npm run localization:provenance:verify
npm run reference:test
npm run reference:verify
npm run build
npm run lint
git diff --check
```

Use the normal checkout lint configuration; `.local-work/` is already excluded. Do not revive the old clean-checkout lint workaround by modifying ignore rules.

Run focused new/changed tests as useful. Record actual counts and failures; earlier 275/100/157 totals are historical baselines, not expected post-feature totals. Confirm build/reference verification does not leave changes in committed reference artifacts. Do not regenerate installed-game provenance or localized reference overlays.

Review full staged/unstaged/untracked status after all checks. New source/test/localization files must appear in the handoff inventory even if ordinary `git diff` omits them. No commit or staging action is authorized.

## 19. Bounded real-browser and owner acceptance checklist

Use synthetic data in an isolated browser profile/storage context. Build/preview locally as appropriate; there is no deployed `1.1.0-rc.1` staging evidence before the maintainer commits and syncs. Do not inspect or modify personal production networks, reset the maintainer's normal browser storage, or import destructive fixtures into their active data.

Record browser/OS/version, origin, application version, build identity and isolation method. Use these finite checks:

1. Start a disposable two/three-outpost network. Select a zero-pad destination, leave without completing it, return/reload, and confirm the choice and incomplete warning persist.
2. Choose Add. Confirm new remote count/pad/type, empty remote exports, connection, local focus/expanded state and no remote navigation. Repeat from an already established pairing and verify the former partner is cleanly unlinked.
3. Exercise same known system, different known systems and unassigned system fallback. Confirm local type is not silently changed; existing diagnostics remain.
4. Undo/Redo Add from the placeholder and existing pairing. Navigate elsewhere before Undo and verify initiating context. Include an Iron Planned Supply retirement case, then ordinary unlink without revival.
5. Delete a normal connected pad and separately replace an occupied target. Confirm former partners are unlinked and exports remain; no manufactured missing/unfinished warning.
6. Import a **synthetic complete-shaped contradictory fixture** AB+AC. Confirm three entries and truthful collapsed/expanded state. Visit B and remove AB by record ID; AC becomes usable. Undo restores the contradiction. Inspect a separate retained missing-target fixture and its repair controls.
7. Export a schema-5 collection containing genuine intent and valid/diagnostic exact records, mutate disposable state, reimport and reload. Also load a disposable pre-upgrade schema-4 export/storage fixture and confirm migration preserves its data. Keep technical envelopes valid for round-trip fixtures.
8. Test actual native-select pointer use, popup arrows/Enter/Escape, closed arrows and Tab. Confirm Add commits once, precommit cancellation does nothing and failed/no-op selections do not leave the action text selected.
9. Check 1366×768 and 1600×900, long/blank names/IDs, unavailable/conflict/repair UI and Add-last placement; inspect all locale count forms with particular attention to Polish, Japanese and Simplified Chinese. Check true 200% browser zoom and Windows High Contrast where available, including the new About link and repair controls.
10. Verify About shows the candidate identity and the localized Release notes link opens release history, with existing links/Close/focus behavior intact. Inspect meaningful console errors, rerender loops and unexpected requests.

Automated viewport/DPR or forced-colors emulation is supplementary evidence, not a true browser-zoom or Windows High Contrast PASS. Mark unavailable real-browser checks **OWNER MANUAL CHECK REQUIRED**, with exact steps/results still needed. Do not install Playwright/WebKit or reopen Apple/VoiceOver/Narrator certification. Existing accepted platform limitations remain unchanged.

After maintainer review/commit/sync, the same finite staging candidate checks can close remaining environment-specific evidence; do not claim those future checks have already passed.

## 20. Durable evidence and completion report

Create:

```text
docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-VERIFICATION.md
```

Keep the accepted design report unchanged. The implementation record should contain:

- actual baseline and candidate version/schema values;
- implemented behavior and significant deviations, if any;
- relevant file groups and a mapping to the accepted transition/compatibility/test plan;
- automated results with commands, actual counts and evidence boundaries;
- migration preservation and older-reader/rollback findings, including write timing;
- browser checks with environment/isolation details and explicit remaining owner checks;
- confirmation of clean counterpart handling, exactly three conflict participants and user-directed record removal;
- provisional unpublished English `1.1.0` release notes with the compatibility warning;
- no claim of stable acceptance, production deployment, publication or successful checks not run.

Classify completion plainly as ready for maintainer code review, ready subject to listed manual acceptance, or blocked by a concrete defect. A successful implementation build is not authorization to declare `1.1.0` released.

The completion message must report branch/full baseline, `1.1.0-rc.1` metadata agreement, schema 5/collection 1, tests, exact changed/new files, guard/atomicity outcomes, localization review status, manual gaps and rollback limitation. Confirm supplied inputs/immutable archives were untouched and no Git/remote/deployment operation occurred.

Suggested maintainer commit subjects after review, depending on grouping:

```text
feat: add remote cargo creation and persistent destinations
feat: link release history from About
```

The candidate version change belongs to the reviewed integrated feature checkpoint. Do not manufacture intermediate commits or a separate version-only rollout while the schema-aware feature is incomplete.

## 21. Stop conditions and acceptance gate

Stop and report a concrete blocker rather than silently changing policy if:

- the branch is not `staging`, the corrected CARGO-A source is unavailable, or existing work conflicts;
- package/lockfile versions disagree, the version tool fails, or dependency churn appears;
- supported schema-4 browser data cannot migrate without loss, new intent is silently stripped, or raw malformed/unsupported data would be overwritten during failed initialization/import;
- a command must guess a contradictory pairing, user-directed repair is inaccessible, or normal deletion would recreate old partner intent;
- missing/ambiguous/self claims still produce cargo supply in any consumer;
- a new field/routing/locale strategy requires an unapproved schema, capacity, dependency, parser or global UX expansion;
- an unexpected source difference changes the accepted audit's material assumptions.

Unavailable manual browser capabilities are evidence gaps, not permission to invent results and not a reason to abandon the implementable work.

Ready-for-review requires a coherent integrated candidate: persistent choices round-trip; established disconnections stay clean; invalid claims are preserved, diagnosed and explicitly repairable; all consumers share structural eligibility; atomic history/planning and current-state guards hold; supported data migrates; the candidate and About link are correct; required automated checks pass; remaining real-browser checks, if any, are enumerated. **Production remains on the existing stable release until a separate accepted release operation.**
