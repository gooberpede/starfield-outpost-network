# Remote cargo creation and connection intent — implementation verification

Date: 5 October 2026 (Australia/Sydney).

**Status: ACCEPTED — 1.1.0-rc.1 candidate ready for commit and staging deployment.**
Owner manual acceptance is recorded below. This is candidate acceptance, not a stable release, staging deployment, publication,
or authorization to release. Production operations were not performed.

## Baseline and preserved inputs

- Branch: `staging` throughout.
- Full baseline and unchanged HEAD: `18567e816db4f6fc71687cd1e41eea9a5999d6d7`.
- No staged or unstaged tracked changes at start; no divergence from the brief's source checkpoint.
- Node `v24.21.0`; npm `11.19.0`.
- Starting package, lockfile root, and lockfile package-root versions: all `1.0.0`.
- Candidate: all three values are `1.1.0-rc.1`. `npm run version:rc -- 1.1.0`
  ran once. The package/lockfile diff changes only these three strings.
- Nested network schema: **5**; collection schema: **1**. Storage keys, envelopes,
  reference schema/data, dependencies and version tooling are unchanged.

The following five inputs were already untracked. Their SHA-256 values were
captured before implementation and matched again at handoff. They were not edited
or archived. The old launch runbook was not executed.

| Path | SHA-256 |
| --- | --- |
| `docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-REVIEW.md` | `132BE66537DF0C811A9ECC99F12E1C12C1811497B6A19826293B39402F846531` |
| `docs/implementation-briefs/CODEX_AUDIT_BRIEF_remote-cargo-creation-and-connection-intent.md` | `0E7B687DA32709C420F56258FCC43494882CC1708228DD94E8D24E617C2E22CA` |
| `docs/implementation-briefs/CODEX_AUDIT_CORRECTION_remote-cargo-creation-and-connection-intent.md` | `153F4F5E511C074477EC90F3C85B2B96FFC8463B4338EAC3336C417C6044C9B1` |
| `docs/implementation-briefs/CODEX_IMPLEMENTATION_BRIEF_remote-cargo-creation-1.1.0-rc.1.md` | `9610F5709B3C6E060B9F5A9220F94BCE7FA09B0084D90D3150AD0808554C5F99` |
| `docs/implementation-briefs/STARFIELD_OUTPOST_NETWORK_1.0.0_LAUNCH_RUNBOOK.md` | `9993F7D1F7506B5CABF5FBF3DC8DB170EFCFFEB2A5B57307F1745150569263BC` |

Immutable pre-1.0 ZIPs/indexes, generated reference overlays, `public/` and
`reference-source/` remain unchanged. No staging, commit, branch change, push,
tag, release/draft, deployment, DNS/indexing or remote-setting mutation occurred.
Read-only Git inspection and extraction of frozen source into ignored scratch
space were used for verification.

## Implemented behavior and evidence map

| Concern | Implementation and regression evidence |
| --- | --- |
| Persistent unfinished choices | Pad-owned `{ outpostId }` intent replaces UI drafts. Selection commits on native change. Schema reconstruction, reload and JSON round-trip preserve it. Node and storage-App tests cover incomplete/missing parent and remount. |
| Remote creation | Zero-pad targets are selectable; counts include every recorded pad. Add is last and always appends an empty, fresh pad. Known equal/different systems choose regular/interstellar; unknown systems fall back to local type. Both local types and 24 known/unknown/reference-availability combinations are exercised in domain tests. |
| Clean disconnection | Free/occupied replacement and unlink preserve former-pad configuration without manufacturing intent. Existing deletion handlers still remove touching pairings; independent unfinished targets are preserved. No downstream export cleanup or planning revival was added. |
| Structural routing | Availability, logistics and provenance use the shared eligible-pair resolver. Missing either pad, self claims, raw broken competitors and conflicting pairs cannot supply cargo. Matrix, Search and feasibility continue to consume those domain owners. Gameplay fuel/type/skill rules are not routing gates. |
| Conflicts and repair | AB+AC emits exactly A/B/C, with canonical direct record context. Qualified delimiter-like identities and overlapping direct contexts are tested. Only incident record buttons mutate; repair removes the chosen ID, preserves other records, and can enable supply/retire planning. A peripheral participant's repair is covered in the App test. |
| Missing references | Missing parent suppresses secondary pad/incomplete facts. Living owners get repair navigation; orphan records keep network-scoped evidence and exported-copy guidance. Empty historical reference strings have explicit unavailable options and survive repair Undo. |
| Atomicity and guards | App captures network ID and exact before-state, generates IDs outside reducer replay, and reconciles only a changed result. Wrong-network, stale/repeated command, missing target/owner, retained-ID collision and stale repair tests reject without history/reconciliation. Add/planning/Undo/Redo are one snapshot; a later deliberate Add remains permitted. |
| Selection tokens and focus | Every option is encoded; action-looking IDs remain IDs. Placeholder events restore the controlled value. Component tests verify Add focus retention and no-op reset. Owner mouse-only and keyboard-only native selector acceptance passed, as recorded below. |
| Migration and boundaries | Historical schema expectations now assert 5 while historical source fixtures remain old versions. Schema-4 storage remains accepted. New intent shape and dual authority are checked before reconstruction and in current-shape validation. Exact/one-over new-field string tests preserve the 4,096 external / 16,384 storage distinction. Existing full envelope/recovery suites remain in force. |
| Localization | Twenty new keys, 451 total English keys; en-GB inherits without redundant overrides. All complete runtime catalogues and seven independent draft owners updated; Japanese uses its existing catalogue-derived review route. Eight CSVs gained exactly 20 rows and preserve earlier rows. New wording explicitly says no new DeepL/native review. Counts 0/1/2/5/12/22 and Polish forms are tested. |
| About and version policy | Localized release-history anchor has exact `/releases` URL, `_blank`, and `noopener noreferrer`; ten-locale link and existing focus/tab-order tests pass. README and Deployment distinguish app version, save format and rollback. |

`tests/cargoConnections.test.ts` adds 14 focused domain/boundary tests.
`tests/browserStorageApp.test.tsx` adds five App regressions, and About gains ten
locale-specific link cases. Existing suites continue covering import failure
atomicity, persistence, history, deletion expansion and reference behavior.
These are automated evidence boundaries, not a claim that every native-browser
acceptance scenario or every permutation has been manually exercised.

The old conflict message key remains in the catalogue to preserve earlier review
evidence; current participant diagnostics use the new neutral conflict key.
No general plural parser, graph framework, schema downgrade service or global UI
redesign was introduced. No completed remote-creation item existed in the current
Cargo Pads backlog to remove; unrelated backlog entries remain open.

## Candidate correction: cargo diagnostic rendering and compact destinations

The initial candidate had a presentation defect: opening Validation for an
unfinished destination blanked the application. The shared cargoTarget branch
passed both destination and id to every cargo diagnostic. Strict localization
interpolation rejected surplus arguments; missing-outpost and orphan messages
were also exposed to the same defect. Earlier domain tests did not open the
Validation panel, so the original green checks did not establish render safety.

validationPresentation.ts now dispatches cargo messages explicitly by key:
incomplete receives only destination, missing outpost only id, missing pad
receives destination and id, and orphan receives no parameters. Conflict
presentation continues using its structured record context. translate() and its
strict parameter validation are unchanged. No domain, persistence, or history
semantics were changed by this correction.

An unfinished destination now displays only the selected outpost name in the
header and localized “no remote link” in the normal inbound summary position.
The existing fuller localized explanation remains in the tooltip and accessible
summary. Other destination classifications retain their presentation. The new
cargo.pad.noRemoteLink key is present in all complete catalogues, the seven
independent drafts and all eight review CSVs; en-GB inherits it. Existing review
evidence is preserved. Japanese retains its catalogue-derived review format;
new wording is provisional Codex translation without human or DeepL review.

The new cargoValidationPanel component suite opens the actual Validation panel
for incomplete intent, missing intent target, missing linked outpost, missing pad,
wholly orphaned record, conflicting records, and self reference in all ten
locales (70 cases). It asserts rendered diagnostic wording and retained record
evidence. An App regression checks the compact header, inbound message, tooltip,
accessible summary, and opening Validation without losing the editor.

All requested commands were rerun after the code correction; final counts are in
the table below. The Node suite initially caught review CSV ordering and the
Japanese review-format mismatch introduced while adding the new row; both were
corrected without weakening assertions. One full component run during concurrent
checks failed the existing reference-startup heading-focus assertion. An isolated
full rerun passed all 185 tests without changes to that test or startup code.
Final logs are in ignored .local-work/cargo-fix-*.log. At correction handoff,
verification used rendered component/App tests. Subsequent owner manual acceptance,
including the corrected Validation and compact presentation, is recorded below.

The candidate remains 1.1.0-rc.1 in all three package/lockfile fields. No commit,
push, deployment, or version-management command was performed for this correction.

## Required command results

All commands below ran on the candidate working tree. Checks affected by later
edits were repeated; the table gives final results, not intermediate failures.

| Command | Final result |
| --- | --- |
| `npm test` | PASS — 290 tests, 0 failures |
| `npm run test:components` | PASS — 185 tests across 11 files, 0 failures |
| `npm run typecheck:tests` | PASS |
| `npm run localization:verify` | PASS |
| `npm run localization:terminology:verify` | PASS — 37 evidence rows, 19 terms, 37 Japanese values |
| `npm run localization:provenance:verify` | PASS |
| `npm run reference:test` | PASS — 157 tests, 0 failures |
| `npm run reference:verify` | PASS |
| `npm run build` | PASS — TypeScript and Vite production output; non-fatal large-chunk advisory remains |
| `npm run lint` | PASS — ordinary checkout configuration |
| `git diff --check` | PASS |

Build/reference checks left no changes in committed reference assets. No dependencies
were installed or changed. Ignored `.local-work/remote-cargo-checks/` contains the
command logs; `.local-work/frozen-cargo-probe.mjs` contains the executed frozen-reader
probe. These are local evidence, not a new permanent testing project.

## Frozen 1.0 reader and rollback findings

The actual source at release commit
`be4539e8c01f5bd3c639b0df5ae92fee355926e8` was extracted with `git archive` into
`.local-work/frozen-cargo-reader/`. Its source files were not edited. The probe
used synthetic in-memory localStorage and imported that frozen reader directly;
it did not run the old app against any browser profile.

Five assertions passed:

1. The frozen reader rejects a properly versioned schema-5 collection import.
2. Its recovery fallback preserves the original raw bytes during initialization,
   with zero writes.
3. A subsequent explicit save of its fallback collection replaces those bytes.
4. Falsely lowering the nested schema to 4 allows the old reader to discard intent.
5. The new reader upgrades valid schema-4 storage to 5 and writes it during
   initialization, before any use of the new cargo feature.

Therefore 1.0 rollback is not universally safe. Capture a 1.0-readable export
**before upgrade**; restoring it omits later edits. A new-reader export is not an
old-format backup. Never down-label a schema. Preserve unread/valuable data before
recovery edits; exporting a fallback/default collection does not retrieve the
original source. A release plan must distinguish rollback to a verified
schema-5-capable build from rollback to 1.0; fix-forward or a separately verified
compatible recovery build may be necessary.

Legacy browser-only outpost choices are retained only where they do not compete
with exact claims. When that historical evidence conflicts, migration preserves
the exact claims and cannot also claim to preserve forbidden dual authority.
Previously discarded UI drafts cannot be recovered.

## Browser smoke and owner manual acceptance

Environment: Microsoft Windows NT `10.0.19045.0`; Codex in-app browser. Its engine
version was not exposed by the available browser tool. Desktop Chrome was not
available through that tool. Origin: `http://127.0.0.1:43187`, a dedicated local
preview origin, initially showing an empty collection. Only newly created
synthetic outposts were edited; no normal browser/production storage was opened
or reset. Isolation was by distinct origin, not a claimed separate Chrome profile.

Observed in the built candidate:

- Create two disposable outposts and a local pad; select a zero-pad destination.
- Reload, return to the owning outpost and confirm the unfinished selection persists.
- Add remotely; inspect the new count/pad and local editor.
- Navigate away before Undo; confirm the initiating outpost returns with its genuine
  unfinished choice. Redo and a further Add leave the first remote pad Unlinked.
- Inspect ordinary desktop layout at 1366×768 and 1600×900; viewport overrides were
  reset afterward. This was a layout smoke, not certification of all long-text cases.
- Reload the final build: About displays `1.1.0-rc.1`, `18567e81`, `local / modified`,
  Release notes, and no pristine-source link. No warning/error console entries were
  captured. The anchor destination was inspected/tested; public release contents
  were not claimed to exist for the candidate.

Local screenshot: `.local-work/remote-cargo-about.png` (About at the normal in-app
panel size). Browser control used semantic DOM clicks/selection; it does not prove
OS-native popup event timing, real browser zoom, or Windows High Contrast.

### Owner-reported acceptance — 1.1.0-rc.1

The owner supplied the following manual results after smoke testing. These are
owner-reported observations, distinct from the agent browser smoke above.

| Manual acceptance check | Result |
| --- | --- |
| Native remote selectors | PASS — mouse-only and keyboard-only operation. |
| Normal deletion, unlinking, and replacement | PASS — exercised from both ends of a remote-created cargo link. Former partners became cleanly unlinked, exports were preserved, and no fabricated incomplete/missing warnings appeared. |
| Schema compatibility | PASS — schema-4 JSON imported successfully into the candidate; existing browser-stored schema-4 data migrated automatically. |
| True 200% browser zoom | PASS |
| Windows High Contrast | PASS |
| Contradictory imported topology | PASS — detailed observations below. |

The contradictory imported topology was:

```text
A / Pad 1 ↔ B / Pad 2
A / Pad 1 ↔ C / Pad 4
```

The owner confirmed all of the following:

- Compact cargo state shows `Conflicting cargo-link pairings.`
- Expanded state exposes both pairing records and separate `Remove this pairing` actions.
- Validation reports exactly three structural errors, one for each participating surviving pad/outpost.
- No arbitrary winning pairing is presented as operative.
- Explicit repair controls are available.

Additional owner smoke checks completed:

| Smoke check | Result |
| --- | --- |
| Remote outpost counts | PASS — displayed correctly. |
| `+ Add Cargo Link` | PASS — creates and connects a fresh remote pad. |
| New remote pad type | PASS — regular/inter-system as appropriate. |
| Undo remote creation | PASS — removes the remotely created pad/link while preserving the selected remote outpost, local exports, and local pad type. |
| Incomplete destination Validation | PASS — opens correctly after the presentation bug fix. |
| Compact incomplete destination | PASS — remote outpost name plus localized `no remote link`. |
| Localization spot-check | PASS |
| About version | PASS — shows `1.1.0-rc.1`. |

**Manual checks remaining: 0.** The owner has accepted the candidate. The
localization spot-check does not change the recorded translation provenance or
claim comprehensive native-speaker certification.

**Final disposition: ACCEPTED — 1.1.0-rc.1 candidate ready for commit and staging deployment.**
Commit, push, and staging deployment have not been performed by this report update.
The schema-5 incompatibility with version 1.0 and pre-upgrade export requirement
for rollback remain in force as documented above.

## Provisional English 1.1.0 release notes — unpublished

- Create and connect a new remote Cargo Link directly from its destination selector,
  including at an outpost with no Cargo Links. Destination counts show all recorded
  Cargo Links, and unfinished destination choices survive navigation, reload and export.
- Disconnect and replace established pairings cleanly. Missing and conflicting
  pairing records remain inspectable and explicitly repairable, with consistent
  structural routing and atomic Undo/Redo and Planned Supply handling.
- Find public release history from About.
- Saves upgrade to nested schema 5. Older 1.0 readers cannot read that format.
  Export a pre-upgrade backup before updating; do not lower schema numbers or assume
  rollback preserves later edits. See the compatibility/rollback guidance.

## Review grouping and suggested commits

Review the cargo/schema/routing/localization group and the About/release-policy
group separately within this integrated candidate. The version checkpoint belongs
to the integrated feature, not an incomplete version-only rollout.

Suggested subjects after review:

- `feat: add remote cargo creation and persistent destinations`
- `feat: link release history from About`

No commits or staging were performed.

## Exact implementation file inventory

The preserved inputs above are excluded from this implementation inventory.
`M` means modified tracked file; `NEW` means a new implementation file.

```text
M   README.md
M   docs/ARCHITECTURE.md
M   docs/DEPLOYMENT.md
M   docs/DOMAIN-RULES.md
M   docs/UX-DESIGN.md
M   docs/localization/de-DE-review.csv
M   docs/localization/es-ES-review.csv
M   docs/localization/fr-FR-review.csv
M   docs/localization/it-IT-review.csv
M   docs/localization/ja-JP-review.csv
M   docs/localization/pl-PL-review.csv
M   docs/localization/pt-BR-review.csv
M   docs/localization/zh-Hans-review.csv
M   package-lock.json
M   package.json
M   scripts/biome-aware-outposts.test.mjs
M   src/App.tsx
M   src/data/externalImportValidation.ts
M   src/data/networkMigration.ts
M   src/data/storageCoherence.ts
M   src/domain/availability.ts
M   src/domain/collectionEditingSession.ts
M   src/domain/defaults.ts
M   src/domain/logistics.ts
M   src/domain/models.ts
M   src/domain/provenance.ts
M   src/domain/sampleData.ts
M   src/domain/validation/registry.ts
M   src/domain/validation/rules/cargoPadLinkedMultipleTimes.ts
M   src/domain/validation/rules/missingCargoLinkEndpoint.ts
M   src/domain/validation/types.ts
M   src/localization/locales/de-DE.ts
M   src/localization/locales/en-US.ts
M   src/localization/locales/es-ES.ts
M   src/localization/locales/fr-FR.ts
M   src/localization/locales/it-IT.ts
M   src/localization/locales/ja-JP.ts
M   src/localization/locales/pl-PL.ts
M   src/localization/locales/pt-BR.ts
M   src/localization/locales/zh-Hans.ts
M   src/localization/reviewDrafts/de-DE.ts
M   src/localization/reviewDrafts/es-ES.ts
M   src/localization/reviewDrafts/fr-FR.ts
M   src/localization/reviewDrafts/it-IT.ts
M   src/localization/reviewDrafts/pl-PL.ts
M   src/localization/reviewDrafts/pt-BR.ts
M   src/localization/reviewDrafts/zh-Hans.ts
M   src/ui/components/AboutDialog.tsx
M   src/ui/components/CargoPadEditor.tsx
M   src/ui/components/CargoPadsEditor.css
M   src/ui/components/CargoPadsEditor.tsx
M   src/ui/validationInteraction.ts
M   src/ui/validationPresentation.ts
M   tests/aboutBuildIdentity.test.tsx
M   tests/aboutDialog.test.tsx
M   tests/browserStorageApp.test.tsx
M   tests/browserStorageRecovery.test.ts
M   tests/componentAccessibility.test.tsx
M   tests/japaneseLocalization.test.ts
M   tests/localizationReview.test.ts
M   tests/networkLifecycle.test.ts
M   tests/resourcePersistenceCompatibility.test.ts
M   tests/resourcePresence.test.ts
M   tests/simplifiedChineseRuntime.test.ts
NEW docs/audits/REMOTE-CARGO-CREATION-AND-CONNECTION-INTENT-VERIFICATION.md
NEW src/data/cargoIntentValidation.ts
NEW src/domain/cargoConnections.ts
NEW src/domain/validation/rules/incompleteCargoDestination.ts
NEW src/localization/cargoDestination.ts
NEW src/ui/cargoDestinationOptions.ts
NEW tests/cargoConnections.test.ts
NEW tests/cargoValidationPanel.test.tsx
```
