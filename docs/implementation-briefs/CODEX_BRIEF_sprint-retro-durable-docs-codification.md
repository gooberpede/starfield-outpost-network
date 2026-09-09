# Codex Documentation Brief — Sprint-Retro Durable Docs Codification Pass

## Objective

Perform a **documentation-only** consistency and codification pass across the repository’s durable docs at the close of the multiple-networks/global-history sprint.

Do **not** change application code.

The goals are:

1. remove stale pre-sprint wording that still describes the old single-network architecture;
2. preserve the durable architectural, UX, and workflow lessons established during the sprint;
3. keep each document focused on its proper concern;
4. remove one backlog item that has already been implemented;
5. make the durable docs a reliable foundation for backlog grooming and the next sprint.

Do not turn this into a broad rewrite. Prefer small, precise edits.

---

# PART A — READ FIRST

## 1. Read all durable docs before editing

Review:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Treat current committed implementation as authoritative where these docs contain stale wording.

Do not inspect or modify unrelated code unless needed only to confirm a current behavior described below.

---

# PART B — AGENTS.MD

## 2. Update stale Undo/Redo architecture wording

Current wording still refers to:

```text
whole-network immutable snapshots
```

Update this to reflect the committed architecture:

- one global session Undo/Redo timeline;
- whole-collection immutable before/after snapshots;
- history stores Network + Outpost working context;
- manual network/outpost navigation does not create history;
- history remains session-only.

Keep the existing one-deliberate-action/one-history-entry principle.

---

## 3. Update persisted/session-state wording

Where `AGENTS.md` currently frames `OutpostNetwork` as the persisted root, clarify the current hierarchy:

```text
NetworkCollection
    SavedNetwork[]
    activeNetworkId
        ↓
    OutpostNetwork documents
```

Distinguish:

### Persisted

```text
NetworkCollection
SavedNetwork stable IDs
network order
activeNetworkId
nested OutpostNetwork data
```

### Session/history context

```text
networkId
outpostId
selected-outpost memory
Undo/Redo history
```

### Presentation-only

```text
collapse/expand
reshuffle modes
transient drafts
validation visibility
other UI chrome
```

Do not over-specify implementation details such as epoch counters.

---

## 4. Update import/export wording

Change stale phrases such as:

```text
full-network import
```

to:

```text
whole-collection import
```

Preserve these rules:

- failed import changes nothing;
- successful import is one undoable action;
- JSON files are transfer vehicles, not live documents.

---

## 5. Broaden immutability language

Where appropriate, change wording from:

```text
Treat persisted network state as immutable
```

to a collection-aware form:

```text
Treat persisted collection and nested network state as immutable
```

Stable IDs remain identity; visible labels remain metadata.

---

## 6. Update verification expectations

If `AGENTS.md` testing guidance still omits the automated test suite, add:

```text
npm test
```

to the normal verification expectations for coherent batches.

Keep:

```text
npm run build
npm run lint
git diff --check
```

as applicable.

Do not claim lint/build/test requirements beyond what the repository currently supports.

---

## 7. Remove stale deferred example

If `AGENTS.md` still lists:

```text
drag-and-drop ordering
```

as a deferred example, remove it because drag-and-drop ordering is implemented.

Do not replace it with speculative new deferred items merely to keep the list the same length.

---

## 8. Preserve current missing-input guidance

Keep the recently-added:

```text
## Missing referenced inputs
```

section substantively unchanged.

Only edit it if necessary for consistency/wording with the workflow document.

---

# PART C — ARCHITECTURE.MD

## 9. Preserve the current collection/session model

The document already correctly describes:

- `NetworkCollection`;
- `CollectionEditingSession`;
- whole-collection history;
- before/after working context;
- session-only selected-outpost memory;
- separate Navigation/Cargo presentation reset boundaries;
- stable-ID reorder not counting as replacement;
- whole-collection import/export.

Do not rewrite those sections unnecessarily.

---

## 10. Fix stale App.tsx responsibility wording

Update any old wording saying `App.tsx` owns:

```text
the current OutpostNetwork
selected-outpost UI state
```

to reflect current responsibilities.

The durable model is:

- collection editing session owns authoritative collection/history/context;
- `App.tsx` coordinates the reducer/session;
- `App.tsx` derives active network/outpost for presentation;
- presentation/transient app state remains in React where appropriate.

Avoid implying that selected outpost is merely an ad hoc UI state variable.

---

## 11. Fix stale Selected Outpost section

Clarify:

- active selected outpost is session working context;
- per-network remembered outpost is session-only;
- neither belongs inside `OutpostNetwork`;
- `activeNetworkId` is persisted collection state;
- manual navigation updates context without creating history.

Keep presentation-only sub-outpost state separate.

---

## 12. Fix stale browser persistence wording

Where Browser Persistence still describes writing only active edits back into a mirrored collection, replace it with the current model:

```text
session.collection is the authoritative persisted collection
```

The data layer saves the whole current `NetworkCollection`.

Legacy localStorage migration remains supported.

---

## 13. Fix stale editing-flow examples

Any example flow that still says roughly:

```text
OutpostNetwork replacement
Undo stores previous network
browser saves current network
```

should become collection-aware:

```text
collection editing transaction
↓
immutable NetworkCollection before/after state
↓
history records collection + Network/Outpost context
↓
React derives active network/outpost
↓
browser storage saves session.collection
```

Do not document React implementation minutiae beyond what remains architecturally useful.

---

## 14. Promote stable membership vs reorder principle

Add a concise durable architectural principle, preferably near core principles or reordering/history sections:

> **Stable identity/membership determines structural continuity; array reordering alone is not object replacement.**

This should apply generically to:

```text
networks
outposts
cargo pads
other ordered stable-ID collections
```

Explain briefly that order may affect presentation while stable IDs determine identity.

Do not make this a long new section if one sentence/bullet is sufficient.

---

## 15. Preserve presentation reset boundary rule

Keep the recently documented rule that:

- network changes/replacements may reset network-bound state;
- selected-outpost changes may reset outpost-local Cargo state;
- stable-ID reorder alone resets neither;
- ordinary same-context value Undo/Redo preserves unrelated presentation state.

Do not document implementation epoch/key names.

---

# PART D — DOMAIN-RULES.MD

## 16. Character Level range

Update Character Level semantics to explicitly state:

```text
null => unknown/not recorded
integer 1–999 => valid
anything else => invalid
```

Keep validation separate from editing/persistence semantics.

A blank UI field commits to `null`.

---

## 17. Single-network Reset result

In Network collection lifecycle semantics, explicitly document:

> When only one network remains, Reset preserves that stable network slot/ID but replaces its contents with a fresh network containing one default empty outpost.

Preserve:

- Add Network copies only character-level details from the last network in collection order;
- Delete with multiple networks removes the active network;
- collection never becomes empty.

Do not introduce old zero-outpost reset semantics.

---

## 18. Keep contextual Undo/Redo mechanics out of domain rules

Do not move implementation/history-context details into `DOMAIN-RULES.md`.

Those belong in Architecture/UX.

Only preserve domain lifecycle semantics here.

---

# PART E — UX-DESIGN.MD

## 19. Preserve existing sprint lessons already documented

Keep existing sections/rules on:

- Adapt before overflowing;
- hard `min-width` as a usability claim;
- stable spatial position;
- stable IDs vs reorder;
- PageHeader Network cluster;
- symbolic controls with accessible labels/titles;
- contextual Undo/Redo;
- navigation collapse behavior.

Do not duplicate them.

---

## 20. Add narrowest presentation ownership/reset principle

Near the section on presentation state, add a durable UX principle:

> **Reset presentation state at the narrowest ownership boundary that has actually changed.**

Explain briefly:

- app-global state should not reset for an outpost-local change;
- network-wide presentation should not reset merely because selected outpost changes;
- outpost-local editor state should not leak to another outpost;
- if a context/document transition makes local presentation state unsafe, reset only the state owned by that boundary;
- ordinary same-context Undo/Redo should preserve unrelated presentation state.

Do not mention React keys/epochs.

---

## 21. Clarify why contextual Undo/Redo restores context

Expand the existing contextual Undo/Redo rule with one sentence of UX rationale:

> Restoring Network + Outpost context ensures Undo/Redo produces a visible, understandable result instead of silently changing data on another network or outpost.

Keep it concise.

---

## 22. Optional symbolic-control convention

If it fits naturally without over-generalizing, add a small convention:

> Compact symbolic controls are appropriate for secondary/infrequent actions when grouping provides clear context and accessible labels/titles expose the full action.

Use the Network cluster as an example if helpful.

Do not turn this into a blanket recommendation for icon-only UI.

---

## 23. Update persisted-state terminology

Where UX wording says presentation state should not mutate the persisted:

```text
Outpost Network
```

prefer:

```text
persisted domain/collection state
```

where that better reflects the current architecture.

---

# PART F — IMPLEMENTATION-WORKFLOW.MD

## 24. Add architecture-audit step for cross-cutting work

Add a conditional workflow step between design and implementation brief.

Suggested principle:

> For changes that cross major state ownership, persistence, history, migration, import/export, or several feature boundaries, perform an architecture audit before implementation.

The audit should:

- map current collision points;
- identify affected architectural boundaries;
- recommend a target structure;
- avoid implementation changes.

Do **not** require an audit for small/local changes.

---

## 25. Make implementation briefs self-contained across Codex chats

Add explicit workflow guidance:

- a fresh Codex chat should not be expected to recover artifacts or reasoning from previous chats;
- if a prior audit/specification is required, attach/provide it to the current task;
- otherwise restate all implementation-relevant conclusions in the implementation brief;
- if an unavailable prior artifact is merely background, mark it optional.

This should complement, not duplicate in detail, `AGENTS.md` missing-input behavior.

---

## 26. Update automated verification

Change the normal verification list to include:

```text
npm test
npm run build
npm run lint
git diff --check
```

Use normal caveats:

- run relevant checks actually supported;
- report anything not run;
- manual/browser checks remain important for interaction-heavy behavior.

---

## 27. Add sprint-close durable-doc review

Add a lightweight close-of-sprint/big-parcel convention:

> At the end of a substantial sprint or architectural parcel, review durable documentation and backlog state before grooming the next sprint.

This is a periodic maintenance step, not required after every tiny patch.

---

## 28. Preserve current fresh-chat guidance

Keep the existing recommendation:

```text
fresh Codex chat for each coherent batch
same chat for focused corrections
```

The new self-contained-brief rule should explain how to make that safe.

---

# PART G — BACKLOG.MD

## 29. Remove implemented Cargo Pad summary-width item

Remove the backlog item equivalent to:

> Improve compact Cargo Pad summary width allocation so remote outpost names can use genuinely available horizontal space before ellipsizing...

This has been implemented.

Do not replace it with another speculative item.

---

## 30. Preserve Navigation panel scrolling backlog

Keep:

```text
independent Navigation panel scrolling
drag auto-scroll follow-up
```

These remain intentionally deferred.

---

## 31. Do not add rejected/speculative features

Do not add backlog items for:

```text
network names
network menu
network reordering
network keyboard shortcuts
outpost copy/paste
manual pane resizing
Export Current / Export All split
network dot navigation
```

unless another existing backlog item already legitimately covers a broader concern.

---

# PART H — README.MD

## 32. Keep capabilities as-is unless wording needs consistency

The current capability list already correctly includes:

- multiple networks;
- contextual global Undo/Redo;
- whole-collection JSON import/export.

Do not rewrite it unnecessarily.

---

## 33. Expand documentation map

In the Documentation section, add entries for:

```text
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Briefly describe their roles consistently with `AGENTS.md`.

The README should make the durable-document structure discoverable.

---

# PART I — CONSISTENCY PASS

## 34. Search for stale pre-sprint terminology

Across the seven durable docs, search for phrases/concepts such as:

```text
whole-network history
current OutpostNetwork owned by App
selectedOutpostId as simple App-only state
full-network import
save current network
single-network editing session
drag-and-drop ordering as deferred
```

Correct only where they are genuinely stale.

Do not replace historical examples that are still semantically correct.

---

## 35. Keep each concern in its correct document

Use:

```text
AGENTS.md
    agent operating rules

ARCHITECTURE.md
    technical state ownership / history / persistence

DOMAIN-RULES.md
    semantic meaning and lifecycle rules

UX-DESIGN.md
    presentation/interaction principles

IMPLEMENTATION-WORKFLOW.md
    handoff/audit/brief/review process

BACKLOG.md
    genuinely deferred work

README.md
    current capabilities and document map
```

Avoid copying the same paragraph into several files.

Cross-reference instead where appropriate.

---

# PART J — OUT OF SCOPE

## 36. Do not change code

No changes under:

```text
src/
tests/
public/
scripts/
reference-source/
```

unless absolutely necessary only to fix a broken documentation link, and if so report before doing it.

This is a documentation-only batch.

---

## 37. Do not invent new product requirements

Do not:

- add new features;
- create speculative backlog items;
- change current lifecycle behavior;
- alter current UX;
- redesign architecture;
- change schema/version policy;
- change import/export behavior.

This pass records what is already settled.

---

# PART K — VERIFICATION

## 38. Run documentation/repository checks

At minimum run:

```text
git diff --check
git status --short
```

If repository tooling includes a documentation-link/check command, run it only if already available.

No application build is required for pure Markdown edits unless repository policy/tooling requires it.

Do not commit or push.

---

# PART L — COMPLETION REPORT

## 39. Report back with

Provide:

### Files changed

List all durable docs edited.

### Stale wording removed

Summarize important pre-sprint contradictions corrected.

### New durable principles codified

Call out:

```text
collection-level contextual history
stable membership vs reorder
narrowest presentation reset boundary
architecture-audit workflow
self-contained briefs across fresh Codex chats
sprint-close durable-doc review
```

### Backlog cleanup

Confirm the implemented Cargo Pad summary-width item was removed and Navigation scrolling remains deferred.

### Verification

Report:

```text
git diff --check
git status --short
```

### Deviations

Call out any requested edit that was unnecessary because the current doc already captured it well.

---

## Final instruction

Keep this pass conservative.

The desired result is:

> **The repository’s durable documentation accurately reflects the committed multi-network/global-history architecture, preserves the sprint’s reusable UX and workflow lessons, removes stale pre-sprint contradictions, and leaves the backlog clean for the next grooming session.**
