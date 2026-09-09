# Codex Implementation Brief — 1,000-Entry Session History Retention Cap

## Objective

Implement a **1,000-entry maximum retained history depth** for the app's existing global session history.

The benchmark investigation is complete enough to support this policy:

- realistic substantial network-building sessions appear to require history measured in the **hundreds**;
- ordinary representative history remained effectively flat in Chrome even through 5,000 entries;
- whole-collection replacement history is materially heavier but still modest at 1,000 entries;
- therefore 1,000 entries is not a technical survival threshold, but a deliberately generous defensive upper bound.

The intended policy is:

> Retain the most recent 1,000 history entries in the current browser session.  
> When a new history entry would exceed 1,000 entries, discard the oldest retained entry.

Do not redesign history architecture.

---

# PART A — READ FIRST

Review:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/HISTORY-BENCHMARK.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect the existing implementation of:

```text
CollectionEditingSession
history entry creation
undo stack
redo stack
apply-active-network
replace-collection
Undo
Redo
working context restoration
selectedOutpostByNetworkId
```

Preserve all current history/context semantics.

---

# PART B — POLICY

## 1. Maximum retained Undo history

Define one explicit application-level constant:

```text
1000
```

Use a descriptive name such as:

```ts
MAX_HISTORY_ENTRIES
```

or equivalent.

Place it in the narrowest sensible history/session module.

Do not scatter the literal `1000` through the codebase.

---

## 2. Scope of the cap

The cap applies to the app's **single global collection-level session history**.

It is not:

```text
per network
per outpost
per action type
per imported collection
```

This matches the current `CollectionEditingSession` architecture.

---

## 3. Retain newest entries

Whenever a new history entry is successfully created:

```text
if history depth <= 1000:
    retain all entries

if history depth becomes 1001:
    discard exactly the oldest entry
    retain the newest 1000
```

For any larger overflow, retain the newest 1000 entries.

Conceptually:

```ts
nextHistory = [...history, newEntry]

if (nextHistory.length > MAX_HISTORY_ENTRIES) {
  nextHistory = nextHistory.slice(-MAX_HISTORY_ENTRIES)
}
```

Use the implementation style best suited to the existing history representation.

---

# PART C — REDO SEMANTICS

## 4. Preserve existing branch semantics

Do not change current behavior when a new edit occurs after Undo.

If existing behavior clears Redo on a divergent new edit, preserve it exactly.

The history cap must not introduce a second branching model.

---

## 5. Do not trim Redo independently unless architecture requires it

The policy concerns maximum retained session history.

Inspect how Undo/Redo is currently represented before changing anything.

If the implementation uses:

```text
one entry array + current index
```

cap the retained entry array correctly while preserving the current position.

If it uses:

```text
undo stack + redo stack
```

apply the limit in a way that preserves existing semantics and avoids accidental history growth beyond the intended bound.

Do not invent a new representation simply to implement the cap.

---

# PART D — BOUNDARY BEHAVIOR

## 6. Exactly 1,000 entries

At exactly:

```text
1000
```

entries, no trimming occurs.

The oldest entry is still undoable.

---

## 7. Entry 1,001

After creating entry:

```text
1001
```

the oldest previous entry is discarded.

The user must still be able to Undo the newest 1,000 entries.

The discarded first entry must no longer be reachable.

---

## 8. Continued overflow

After:

```text
1100
2000
5000
```

or any larger number of edits, retained history depth must remain:

```text
1000
```

and always correspond to the most recent 1,000 entries.

---

# PART E — CONTEXT RESTORATION

## 9. Preserve Network + Outpost context

This is critical.

Trimming old history must not alter the behavior of surviving entries.

Undo/Redo through retained history must continue restoring:

```text
active Network
selected Outpost
collection state
```

using the same existing production path.

Add coverage where the retained 1,000-entry window contains edits across multiple networks/outposts.

---

## 10. Preserve presentation reset boundaries

Do not change current presentation-state behavior.

The existing rule remains:

> Reset presentation state at the narrowest ownership boundary that has actually changed.

History trimming must not cause extra:

```text
Navigation resets
Cargo resets
modal state changes
presentation-state persistence
```

---

# PART F — IMPORT / REPLACEMENT HISTORY

## 11. Apply the same cap to replacement/import entries

Whole-collection replacement creates a normal history entry.

Those entries count toward the same global 1,000-entry maximum.

Do not create a special cap for imports.

A sequence of:

```text
ordinary edits
imports
ordinary edits
```

must all participate in the same chronological retained window.

---

# PART G — HISTORY LABELS / METADATA

## 12. Preserve surviving metadata

Trimming must not mutate surviving entries.

Retain existing:

```text
label
timestamp
before/after collection snapshots
before/after working context
```

unchanged.

Only remove entries that fall outside the retained window.

---

# PART H — TESTING

## 13. Add explicit boundary tests

Add focused tests covering at least:

### Below cap

```text
999 entries
```

Expected:

```text
999 retained
```

### At cap

```text
1000 entries
```

Expected:

```text
1000 retained
oldest entry still undoable
```

### First overflow

```text
1001 entries
```

Expected:

```text
1000 retained
oldest original entry discarded
newest 1000 retained
```

### Larger overflow

Generate substantially more than the cap, e.g.:

```text
1250 or 2000
```

Expected:

```text
exactly 1000 retained
correct chronological window
```

Do not make routine tests unnecessarily expensive.

---

## 14. Test Undo depth after trimming

After creating:

```text
1001
```

or more entries:

- Undo exactly 1,000 retained entries successfully.
- Confirm no additional app Undo remains.
- Confirm resulting collection corresponds to the state immediately after the discarded history boundary.

This is more important than checking only `history.length`.

---

## 15. Test Redo after full retained Undo

After undoing the retained 1,000 entries:

- Redo all 1,000 entries.
- Confirm final state exactly matches the pre-Undo state.
- Confirm context restoration remains correct.

---

## 16. Test divergent edit after Undo near cap

Create a capped history, Undo some retained entries, then make a new edit.

Confirm:

```text
existing redo branch is cleared as before
retained history remains <= 1000
new edit is the newest entry
oldest retained entries are trimmed only as required
```

---

## 17. Test mixed operation types

Include at least one cap-boundary test containing both:

```text
ordinary active-network edits
whole-collection replacement
```

Confirm they share the same chronological cap.

---

## 18. Test context across trimming boundary

Include multiple networks/outposts in a test where old entries are trimmed.

Confirm surviving Undo/Redo entries still restore the correct:

```text
networkId
outpostId
```

Do not rely only on scalar character-level edits for all cap tests.

---

# PART I — PERFORMANCE / IMPLEMENTATION QUALITY

## 19. Keep the cap cheap

Avoid an implementation that performs unnecessary large copies more often than current history creation already does.

A simple bounded append/slice is acceptable at a limit of 1,000 if it fits the current architecture.

Do not prematurely introduce:

```text
ring buffers
linked lists
custom deques
mutable history internals
```

unless the existing code clearly demands them.

The benchmark demonstrated no performance need for sophisticated retention machinery.

---

# PART J — DOCUMENTATION

## 20. Record the decision in `docs/HISTORY-BENCHMARK.md`

Add the browser measurements that closed the investigation.

Representative Chrome heap snapshots:

```text
500 entries     20.7 MB
1000 entries    21.0 MB
2000 entries    21.4 MB
5000 entries    22.8 MB
```

Distinct whole-collection replacement Chrome heap snapshots:

```text
250 entries     32.8 MB
500 entries     37.4 MB
1000 entries    47.0 MB
```

Clarify:

- these are Chrome heap-snapshot totals after snapshot-triggered GC;
- representative history shows very strong structural sharing;
- replacement history is substantially heavier and roughly linear;
- even the replacement stress case remains modest at 1,000 entries;
- 1,000 was chosen as a generous defensive session bound, not because 1,001 is unsafe.

---

## 21. Update `docs/BACKLOG.md`

Close/remove the history-size investigation item.

If appropriate, replace it with a short completed-policy note only if that matches existing backlog conventions.

Do not leave the investigation appearing unresolved.

---

## 22. Update durable history documentation

Update the appropriate durable architecture/UX documentation to state:

```text
session history retains at most the newest 1000 entries
older entries are discarded when the bound is exceeded
history remains collection-global
```

Keep this concise.

Do not over-document implementation mechanics.

---

# PART K — BENCHMARK HARNESS

## 23. Keep the benchmark harness

Do not remove the benchmark tooling.

It is now useful regression/investigation infrastructure.

Do not alter it unless a small documentation reference is required.

---

# PART L — OUT OF SCOPE

Do not:

```text
change Undo/Redo keyboard shortcuts
change history entry schema
change collection schema
change import/export format
change persistence
persist history across reloads
add user-configurable history depth
add UI showing history count
add warnings when trimming occurs
add analytics/telemetry
change localization
remove benchmark infrastructure
commit
push
```

No user-facing notification is required when the oldest entry is discarded.

---

# PART M — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Also run a focused history-cap test or benchmark that confirms:

```text
>1000 generated edits
retained depth = 1000
1000 Undo operations succeed
1001st Undo is unavailable
1000 Redo operations restore final state
```

Do not require a new manual Chrome memory run; the benchmark evidence has already been collected.

---

# PART N — COMPLETION REPORT

Report:

### Implementation

Explain:

```text
where MAX_HISTORY_ENTRIES lives
where trimming occurs
why the implementation preserves existing semantics
```

### Boundary behavior

Confirm results for:

```text
999
1000
1001
>1001
```

### Undo/Redo

Confirm:

```text
full retained Undo depth
full Redo restoration
divergent edit behavior
Network + Outpost context restoration
```

### Import/replacement

Confirm those entries participate in the same global cap.

### Documentation

Confirm:

```text
browser benchmark results recorded
history-size investigation closed
1000-entry policy documented
```

### Files changed

List all files.

### Verification

Report exact results for:

```text
npm test
npm run build
npm run lint
git diff --check
```

Do not commit or push.

---

## Final instruction

Implement the policy established by the completed benchmark investigation:

> **Keep the newest 1,000 collection-level session history entries. When a new entry would exceed that bound, discard the oldest retained entry. Preserve all existing Undo/Redo, context-restoration, branching, and presentation-reset behavior.**
