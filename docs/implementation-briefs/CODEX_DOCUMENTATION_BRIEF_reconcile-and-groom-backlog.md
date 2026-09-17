# Codex Documentation Brief — Reconcile and Groom `docs/BACKLOG.md`

## Objective

Perform a documentation-only grooming pass on:

- `docs/BACKLOG.md`

The goal is to reconcile the backlog against the work completed and deferred during the recent accessibility, localization, import-capacity, browser-storage, and security-review sequence.

This task should:

- remove or rewrite stale backlog wording for work that is now complete;
- preserve already-valid deferred items;
- add genuinely missing follow-up work that was identified during the recent audit/benchmark/release-readiness sequence;
- avoid duplicating implemented behavior;
- avoid turning backlog items into implementation requirements prematurely.

Do **not** change production code, tests, localization catalogues, configuration, or other runtime behavior.

---

## Read first

Use the current synced repository as the source of truth.

Read at minimum:

- `docs/BACKLOG.md`;
- `docs/audits/codex-whole-product-security-audit.md`;
- `docs/audits/codex-whole-product-accessibility-audit.md`;
- `docs/ARCHITECTURE.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BENCHMARK.md`;
- `docs/benchmarks/IMPORT-CAPACITY-BROWSER-VALIDATION.md`;
- `docs/benchmarks/BROWSER-STORAGE-CAPACITY-BENCHMARK.md`.

Also inspect current source/config only where needed to confirm backlog wording, especially:

- `vite.config.ts`;
- `src/data/referenceDataLoader.ts`;
- localization catalogue structure/parity documentation if referenced by the backlog.

Do not rely on stale assumptions when current committed code/docs answer the question.

---

## Important backlog principle

`docs/BACKLOG.md` is for genuinely deferred work, unresolved decisions, and future improvements.

Implemented behavior belongs in code and durable architecture/domain documentation.

When an item has been fully implemented:
- remove it from the backlog, or
- rewrite it so only the genuinely deferred remainder remains.

Do not preserve stale “future work” wording merely for historical record.

Historical record belongs in the relevant audit/benchmark documents.

---

## 1. Replace the obsolete future “Security audit” backlog section

The backlog currently says to perform a security-focused review before public release.

That audit has now been completed.

Rewrite that section so it no longer presents the security audit itself as future work.

The completed audit’s final disposition is:

- no outstanding BLOCKER findings;
- no outstanding HIGH findings;
- no outstanding MEDIUM findings;
- no outstanding LOW findings;
- three INFORMATIONAL items remain with their existing statuses.

Do not duplicate the full audit history in the backlog.

The backlog should capture only the genuinely deferred follow-up work.

### Add/retain the following security-derived follow-ups

#### Production hosting security baseline

Add a deferred item under Public release readiness / security / deployment, whichever fits the current backlog structure best.

Capture the problem/decision, not an assumed implementation.

Include:

- production host not yet selected;
- when hosting is chosen, define and verify the production security-header baseline;
- include Content Security Policy and related HTTP security headers;
- account for the current external Google Fonts dependency:
  - either permit the exact required origins in CSP;
  - or self-host/remove the dependency if that becomes preferable;
- treat this as deployment-stage acceptance work, not an unresolved application-code security defect.

Do not attempt to design the final CSP in the backlog.

#### Runtime reference-data trust

Add a deferred decision item.

Current state:
- generated reference-data files are strongly validated at build time;
- the browser runtime loader still trusts `response.json()` through generic typing;
- malformed same-origin catalogue files can therefore still cause runtime failure.

Backlog direction:

- review whether the final production deployment warrants a compact runtime shape/version check for generated reference catalogues;
- preserve build-time validation as the primary integrity boundary;
- add runtime validation only if stale, partial, or malformed deployments are a realistic production risk;
- do not present runtime checking as protection against full same-origin compromise.

#### Development-server network exposure

Add a small deferred documentation/configuration item that reflects the actual development workflow.

Important context:

- the Vite development server intentionally listens on the LAN;
- development occurs on one PC;
- Starfield is played on another PC;
- LAN access to the development build is therefore useful and intentional.

Do **not** frame `server.host: true` as an accidental defect that should simply be removed.

Backlog direction:

- preserve practical LAN access for the current two-PC workflow;
- before public release, document that the development server is intended only for trusted local-network development use;
- explicitly state that the Vite development server must not be used as the public production host;
- configuration may be revisited only if a safer explicit LAN opt-in can preserve the workflow without unnecessary friction.

Do not implement the configuration change in this task.

---

## 2. Preserve the existing 1366px visual/layout review

The backlog already contains a dedicated 1366px-width visual/layout review.

Keep it.

Do not duplicate it elsewhere.

Its purpose remains product polish, not accessibility re-testing:

- hierarchy;
- density;
- wrapping;
- pane balance;
- awkward-but-functional states accepted during zoom/text-scaling verification.

Only edit wording if necessary for clarity or consistency.

---

## 3. Refine the existing additional-keyboard-shortcuts backlog item

The backlog already contains candidate shortcuts for:

- Import;
- Export;
- Search/Search Results;
- Cargo Links;
- Outpost navigation;
- Inorganic Resources;
- Organic Resources;
- Manufacturing;
- Planned Supply.

Keep that existing list.

Add the missing design intent explicitly:

- consider shortcut-based navigation between major application regions;
- the goal is to reduce lengthy sequential Tab traversal;
- think of this as landmark-like keyboard navigation between major areas, while remaining compatible with normal browser, OS, text-editing, and assistive-technology behavior;
- review shortcuts as a coherent application-wide system rather than adding isolated keys ad hoc.

Do not prescribe exact shortcut combinations yet.

Do not claim screen-reader landmark semantics unless actual semantic landmarks are being discussed separately; this backlog item is about efficient keyboard navigation inspired by the same navigation problem.

---

## 4. Add a technical-capacity advisory-validation backlog item

The recent capacity/security work established technical safety envelopes for import and browser storage.

Those ceilings are engineering/support limits, not Starfield gameplay rules.

Add a backlog item under Validation or another clearly related section.

### Core question

Review whether normal live validation should warn when user-understandable parts of the current collection approach or exceed supported technical capacity envelopes.

The intended direction is:

- advisory validation rather than hard editing restrictions;
- preserve modded/high-capacity use where practical;
- distinguish technical support limits from:
  - Starfield gameplay limits;
  - skill-based limits;
  - domain validation;
  - low-level defensive resource guards.

### Candidate user-understandable structural dimensions

Consider at least:

- saved networks;
- outposts per network;
- Cargo Pads / Cargo Links per outpost;
- Cargo Links per network;
- manufacturing entries;
- Planned Supply entries;
- outbound items per Cargo Link.

Do not assume every candidate requires a validation rule.

### Do not expose low-level engineering guards by default

Do not add ordinary validation requirements for implementation-level safeguards such as:

- recursive aggregate member counts;
- nesting depth;
- object-key length;
- raw serialized length;
- other internal traversal mechanics.

Those remain defensive boundaries unless a useful user-facing model emerges later.

### Distinguish from the existing >12 Cargo Link import item

Keep the current backlog entry about otherwise-valid imports exceeding the tested Cargo Link/pad envelope.

The two items answer different questions:

- import/recovery item:
  - how should legitimate incoming data outside the tested envelope be handled?
- advisory validation item:
  - how should the live app inform the user that their current state is outside or approaching a supported technical envelope?

Do not merge them unless the distinction remains explicit.

---

## 5. Preserve the existing >12-Cargo-Link / modded-import item

The backlog already contains a future decision about otherwise-valid imports with more than 12 Cargo Link structures at one outpost.

Keep it.

Clarify only if needed that:

- legitimate modded usage may exceed the tested technical envelope;
- recovery/exception policy remains a product decision;
- this is not a security vulnerability currently requiring immediate remediation.

Do not invent the final policy.

---

## 6. Preserve the export filename budgeting/sanitization item

The backlog already contains:

- bounding and sanitizing the character-name fragment in export filenames;
- preserving timestamp/`.json` filename budget.

Keep it.

Do not implement or decide the exact fragment limit here.

---

## 7. Reframe “richer import diagnostics”

The security/import work has already implemented:

- structured import error categories;
- concise localized import failure messages;
- capacity-specific failure messages;
- malformed-structure/identity reporting.

Therefore the backlog should no longer imply that basic import diagnostics are absent.

Rewrite the remaining backlog item to mean something like:

- richer import diagnostics/reporting beyond the implemented structured error categories and concise localized status messages;
- potentially expose more useful detail/context only if the workflow warrants it.

Keep:
- clearer conflict/migration reporting;
- explicit schema-version migration documentation;
- optional import preview.

Do not duplicate already-implemented basic import error handling.

---

## 8. Remove stale localization message-count wording

The backlog currently contains hard-coded localization catalogue counts such as:

- `331 messages`;
- `331/331`.

Those counts became stale as new localized status/import/storage messages were added.

Replace count-based wording with durable requirements.

Preferred direction:

- `en-US` remains the complete baseline;
- `en-GB` remains a sparse override;
- `ja-JP` maintains exact key and placeholder parity through the existing localization verification tooling;
- final Japanese release verification and native-speaker review remain deferred;
- current `Intl` usage remains as already documented;
- richer ICU/FormatJS-style formatting remains deferred unless future catalogue requirements justify it.

Do not invent a new numeric catalogue count.

---

## 9. Preserve already-valid release-readiness follow-ups

Keep the following existing backlog items unless current code/docs prove them complete:

### Production performance / bundle review

Keep:
- large-chunk advisory review;
- compressed bundle size;
- first-load/startup behavior;
- unusually large dependencies;
- possible code splitting only where practically beneficial.

Do not optimize solely to remove a warning.

### Accessibility/platform follow-up

Keep:
- touchpad / Windows touchscreen comfort checks when hardware is available;
- Safari/VoiceOver;
- iPhone/WebKit;
- browser-level accessibility regression tooling as an aid;
- browser-level reflow regression coverage.

Do not reopen completed Windows/Chromium accessibility corrections without a concrete defect.

### Apple/WebKit compatibility

Keep the existing deferred Apple/WebKit compatibility verification.

Do not turn this backlog grooming task into new platform support requirements.

---

## 10. Do not add backlog ghosts for completed security/storage work

Do **not** add future-work entries for items that were explicitly completed or deliberately ruled out during the security/storage sequence, including:

- browser-storage backup keys;
- recovery-download UI;
- rollback of edits after save failure;
- disabling Undo/Redo for large accepted imports;
- browser-storage source preservation;
- browser-storage historical migration compatibility;
- preference-storage exception containment;
- storage persistence warning states;
- stricter treatment of stale but structurally valid external IDs;
- separate history byte caps unless independently justified later.

Likewise, do not create backlog items merely because the security audit inspected:

- XSS;
- unsafe URLs;
- prototype pollution;
- dependency vulnerabilities;
- privileged browser APIs;
- script execution.

Those areas produced no open finding.

---

## 11. Preserve backlog organization and style

Keep the existing backlog’s style:

- describe problems/decisions rather than assuming implementation;
- record settled direction separately from unresolved decisions;
- avoid duplicating domain rules already documented elsewhere;
- remove or rewrite implemented items.

Prefer editing existing sections over creating many new top-level headings.

A small new subsection is appropriate where necessary, especially for:
- security/deployment follow-up;
- technical-capacity advisory validation.

---

## Scope

This task is documentation-only.

Expected changed file:

- `docs/BACKLOG.md`

Do not change:
- production source;
- tests;
- configuration;
- localization catalogues;
- audit reports;
- benchmark reports;
- architecture docs;
- generated files.

If you discover a factual conflict between the backlog and current repository state that cannot be resolved confidently from existing committed docs/code, report it rather than silently inventing a resolution.

---

## Verification

Run:

- `git diff --check`.

Review the diff to confirm:

- only `docs/BACKLOG.md` changed;
- completed security work is no longer presented as future work;
- the three remaining informational security follow-ups are represented accurately;
- existing valid deferred items are not duplicated;
- no hard-coded localization message count remains;
- technical-capacity validation is framed as advisory/product work rather than a new hard limit;
- the intentional LAN development workflow is preserved in the development-server wording.

No application test run is required for this documentation-only task.

---

## Completion response

Return:

1. concise summary of the backlog reconciliation;
2. files changed;
3. obsolete/stale entries removed or rewritten;
4. new backlog items added;
5. existing backlog items retained unchanged or lightly clarified;
6. how the development-server LAN workflow is represented;
7. how technical-capacity advisory validation is represented;
8. how localization wording was made durable;
9. confirmation the completed security audit is no longer backlogged as future work;
10. verification performed;
11. confirmation only documentation changed;
12. confirmation no commit or push was performed.

Do not commit or push unless explicitly instructed.
