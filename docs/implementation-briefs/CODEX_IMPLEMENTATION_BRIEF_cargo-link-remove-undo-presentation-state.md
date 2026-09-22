# CODEX IMPLEMENTATION BRIEF — Preserve Cargo Link Presentation State Through Remove Undo/Redo

## Objective

Fix the confirmed presentation-state regression where undoing removal of a Cargo Link collapses every Cargo Link in the current outpost.

This is a narrowly scoped presentation/history correction.

The intended behavior is:

- removing a Cargo Link does not disturb the expanded/collapsed state of unrelated Cargo Links;
- undoing the removal restores the deleted Cargo Link **expanded**;
- unrelated Cargo Links retain their current presentation state;
- redoing the removal removes the restored Cargo Link without disturbing unrelated Cargo Link presentation state;
- undoing that redo restores the Cargo Link expanded again.

Do not change Cargo Link domain data, persistence semantics, history snapshot structure, or unrelated presentation behavior.

---

# 1. Source of truth

Use the current repository and these durable documents as primary context:

```text
AGENTS.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
```

The confirmed runtime reproduction is:

1. Navigate to an outpost with at least two Cargo Links.
2. Expand at least two Cargo Links.
3. Remove one Cargo Link.
4. Observe that the remaining Cargo Links retain their expanded/collapsed state.
5. Invoke Undo.
6. Observe that the removed Cargo Link returns collapsed and all other Cargo Links also become collapsed.

The regression is presentation-only. Domain/network data restores correctly.

---

# 2. Settled behavior decision

A Cargo Link must be expanded to expose its Remove control.

Therefore the removed Cargo Link is necessarily expanded at the moment of deletion.

The settled Undo rule is:

> Undo of Cargo Link removal restores the removed Cargo Link expanded, while preserving the current expanded/collapsed state of all unrelated Cargo Links.

This is intentionally deterministic.

Do not attempt to preserve arbitrary presentation changes through the Undo/Redo timeline.

Example edge case that is explicitly **not** worth special handling:

```text
remove expanded Cargo Link
→ Undo restores it
→ user collapses it
→ Redo removes it
→ Undo restores it again
```

The restored Cargo Link should still come back **expanded**.

Presentation state is not historical domain state and should not become part of persisted Undo/Redo snapshots.

---

# 3. Scope boundary

This parcel should change only the Cargo Link presentation/history interaction necessary to fix the regression.

Do not change:

```text
Cargo Link domain model
Cargo Pad domain model
persisted schema
serialization
import/export
browser storage
Undo/Redo snapshot contents
history retention
Cargo Link ordering
Cargo Link linking semantics
Cargo Link expansion UI design
Remove-button placement
outpost/network navigation semantics
Cargo Link local scrolling
fixed-chrome focus behavior
```

Do not add presentation state to persisted data.

Do not add presentation state to whole-collection history snapshots.

---

# 4. Investigate the current reset path

Before changing behavior, identify exactly why Undo currently collapses all Cargo Links.

Inspect:

- Cargo Link expansion-state ownership;
- the stable identity used for expansion state;
- presentation-reset logic around history application;
- outpost/network context changes;
- Cargo Link list remounting;
- effects/hooks that prune or reset expansion state;
- Undo/Redo application paths;
- deletion focus-repair behavior.

Determine whether the regression is caused by:

```text
blanket expansion-state reset
component remount
state replacement
ID pruning/reinitialization
history context restoration
effect dependency behavior
another presentation reset
```

Fix the smallest coherent root cause.

Do not paper over the symptom with arbitrary delayed re-expansion unless that is demonstrably the cleanest current architecture.

---

# 5. Presentation-state contract

Expansion/collapse state remains presentation/session state.

Use stable Cargo Link / Cargo Pad identity consistently with the current architecture.

After removing one Cargo Link:

- all surviving Cargo Links keep their existing expansion state;
- no unrelated row/card is collapsed or expanded.

After Undo:

- surviving Cargo Links keep whatever expansion state they currently have;
- the restored Cargo Link is inserted into presentation state as expanded.

After Redo:

- the restored Cargo Link disappears;
- surviving Cargo Links keep their current expansion state.

After another Undo:

- restored Cargo Link reappears expanded;
- surviving Cargo Links remain unchanged.

---

# 6. Current-state preservation beats historical presentation replay

Do not replay the full presentation state that existed when the deletion occurred.

For unrelated Cargo Links, preserve their **current** state at the moment Undo/Redo is invoked.

Example:

```text
Link A expanded
Link B expanded
Remove Link A
User collapses Link B
Undo
```

Expected:

```text
Link A restored expanded
Link B remains collapsed
```

Undo should reverse the domain deletion without rewinding unrelated presentation changes.

This distinction is important.

---

# 7. Restored Cargo Link state

The restored link should be expanded because:

- Remove is only available in the expanded state;
- the deletion action therefore originated from an expanded Cargo Link;
- restoring it expanded best matches the user's working context;
- no presentation-history machinery is required to infer this.

Do not inspect a historical expansion snapshot.

Do not make the restored state depend on Redo-time presentation changes.

The simple rule is:

```text
restored-after-remove-undo => expanded
```

---

# 8. Focus behavior

Preserve current focus-repair semantics unless the regression fix requires a small adjustment.

After removal:

- focus should remain/recover according to the existing Cargo Link deletion behavior.

After Undo:

- the restored expanded Cargo Link should not cause unrelated focus jumps;
- do not force focus into the restored link unless current history/focus conventions already require that behavior.

If current code intentionally restores semantic working context after Undo, preserve it.

Do not expand this parcel into a focus-navigation redesign.

---

# 9. Outpost/network boundaries

Verify the fix remains scoped correctly across context changes.

At minimum confirm:

- expansion state does not leak between outposts;
- expansion state does not leak between saved networks;
- Undo affecting another outpost does not reset Cargo Link presentation on the current outpost;
- switching away and back preserves or resets presentation according to the existing documented contract;
- the fix does not introduce stale expansion IDs after a Cargo Link is permanently removed.

Follow current architecture rather than inventing new cross-context persistence.

---

# 10. Tests

Add focused automated regression coverage.

At minimum cover:

## Case A — basic reproduction

```text
A expanded
B expanded
remove A
undo
```

Expected:

```text
A restored expanded
B remains expanded
```

## Case B — mixed unrelated state

```text
A expanded
B collapsed
C expanded
remove A
undo
```

Expected:

```text
A restored expanded
B remains collapsed
C remains expanded
```

## Case C — presentation change between remove and Undo

If possible under current UI flow:

```text
A expanded
B expanded
remove A
collapse B
undo
```

Expected:

```text
A restored expanded
B remains collapsed
```

## Case D — Redo

```text
remove A
undo
redo
```

Expected:

```text
A removed
other links unchanged
```

## Case E — Undo after Redo

```text
remove A
undo
redo
undo
```

Expected:

```text
A restored expanded
other links unchanged
```

## Case F — last/only Cargo Link

Remove the only Cargo Link, Undo, and verify:

- it restores correctly;
- it restores expanded;
- no stale presentation state remains.

## Case G — outpost isolation

Operate on Cargo Links in one outpost and verify another outpost's presentation state is unaffected.

Use component tests where they can faithfully exercise the real presentation/history boundary.

Avoid unit tests that merely reimplement the intended logic without testing the actual component state transition.

---

# 11. Manual regression checks

Manually verify in the browser:

### Scenario 1

- two or more Cargo Links;
- expand at least two;
- remove one;
- Undo.

Pass if:

- restored link is expanded;
- every surviving link retains its prior/current state.

### Scenario 2

- three Cargo Links with mixed expanded/collapsed state;
- remove an expanded link;
- alter another link's presentation state;
- Undo.

Pass if:

- restored link is expanded;
- unrelated links retain their **current** state.

### Scenario 3

- Remove → Undo → Redo → Undo.

Pass if:

- domain removal/restoration remains correct;
- restored link comes back expanded;
- unrelated presentation remains stable.

### Scenario 4

- switch outposts/networks around ordinary Cargo presentation use.

Pass if:

- no state leaks or broad reset regression appears.

---

# 12. Documentation

After implementation, reconcile current durable docs if the issue is fully closed.

At minimum inspect:

```text
docs/BACKLOG.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
```

Guidance:

- retire the confirmed Cargo Undo regression from `BACKLOG.md` if resolved;
- the accessibility reconciliation is a point-in-time audit, so either leave the historical finding intact or add a concise disposition update according to existing project convention;
- update architecture/UX only if the implementation establishes a new reusable presentation/history rule worth preserving.

Do not rewrite historical evidence as though the bug never existed.

Do not leak temporary task/parcel identifiers into durable docs.

---

# 13. Scope exclusions

Do not include:

```text
Cargo Link visual redesign
Cargo Link ordering changes
Cargo Link drag/scroll changes
Cargo Link data-model changes
Cargo Link throughput
Cargo Link validation changes
fixed-chrome work
localized layout corrections
Narrator work
history UI/timeline work
persistent presentation state
```

Keep this bug fix narrow.

---

# 14. Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any focused Cargo/history tests added.

Record exact results.

---

# 15. Stop conditions

Stop and report before broadening scope if:

- preserving unrelated expansion state requires changing history snapshot semantics;
- expansion state is not stably keyed and fixing that would require a broader presentation-state architecture change;
- the regression is caused by a generic history/context reset used across many unrelated features;
- a fix would persist presentation state;
- a fix would alter Undo/Redo domain semantics;
- the restored-link-expanded rule conflicts with an existing documented user-facing contract.

Do not silently redesign history or presentation architecture.

---

# 16. Expected Codex summary

Report:

1. branch used;
2. root cause found;
3. files changed;
4. presentation-state ownership before/after;
5. how unrelated Cargo Link expansion state is preserved;
6. how the restored Cargo Link is forced/initialized expanded;
7. Redo behavior;
8. Undo-after-Redo behavior;
9. outpost/network isolation result;
10. focus behavior result;
11. automated tests added/updated;
12. manual checks performed;
13. documentation/backlog reconciliation;
14. commands/checks run and results;
15. any limitations/stop conditions;
16. suggested commit message;
17. confirmation no commit or push was performed.

Suggested commit message:

`fix: preserve Cargo Link expansion on undo`
