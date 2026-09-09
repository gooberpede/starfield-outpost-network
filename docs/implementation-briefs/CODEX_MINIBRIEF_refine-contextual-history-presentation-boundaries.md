# Codex Mini-Brief — Refine Presentation Reset Boundaries for Contextual Undo/Redo

## Objective

Make one narrow correction to the presentation-reset logic introduced during the multiple-networks/global-history work.

The current architecture is accepted.

Do **not** change:

- collection-level history;
- network lifecycle semantics;
- import/export;
- Character Level;
- PageHeader layout;
- single-network Reset behavior;
- AGENTS.md guidance.

The goal is only to make outpost/network-local presentation remounting more precise.

---

# 1. Current issue

The current presentation reset logic correctly avoids remounting network-bound UI on every ordinary same-network Undo/Redo.

However, it still appears to treat only:

```text
active network change
lifecycle/replacement action
outpost/cargo-pad topology change
```

as remount boundaries.

That leaves a remaining edge case:

```text
Network 1 / Outpost A: make an undoable edit
switch manually to Outpost B
put Cargo Pads on B into local presentation state
Undo
```

Undo correctly restores the action context:

```text
Network 1 / Outpost A
```

but if the active network ID is unchanged and topology is unchanged, `CargoPadsEditor` may remain mounted with presentation state originating from Outpost B.

Potential leaked state includes:

```text
isReshuffling
activeDrag
draftLinkedOutpostIds
other outpost-local Cargo editor drafts
```

Pad expansion state is less concerning because it is keyed by stable pad IDs, but outpost-wide editor state should not cross from one outpost to another.

---

# 2. Locked correction

> **When Undo/Redo changes the restored selected outpost within the same network, reset/remount outpost-specific editor state.**

This is distinct from network-wide navigation state.

Do not reset the whole Navigation / OutpostList merely because selected outpost changes.

---

# 3. Separate presentation boundaries

Audit the current shared presentation epoch/key.

If one shared counter currently drives both:

```text
OutpostList
CargoPadsEditor
```

split responsibilities so that each remounts only when appropriate.

Conceptually:

## Navigation / OutpostList boundary

Reset/remount only when needed for network-wide interaction safety, e.g.:

```text
active network changes
network replacement/deletion/restoration invalidates local navigation interaction state
network outpost membership changes in a way that makes reshuffle/drag state unsafe
```

Do **not** remount merely because the selected outpost changes.

## Cargo editor boundary

Reset/remount when:

```text
active network changes
selected outpost changes
active network document is replaced/reset/imported in a way that could stale local editor state
cargo-pad membership changes in a way that invalidates drafts/drag state
```

Do not reset on ordinary same-outpost value Undo/Redo.

---

# 4. Structural detection only

Continue using structural/context comparison.

Do not inspect history labels.

Prefer comparing:

```text
previous context.networkId
next context.networkId
previous context.outpostId
next context.outpostId
network replacement/lifecycle marker if still needed
stable object membership/identity
```

---

# 5. Refine topology detection if practical

The current topology comparison may treat pure ordering changes as topology changes because it serializes arrays in order.

If so, refine this.

A pure reorder of existing:

```text
outposts
cargo pads
```

should generally not count as an identity/membership topology change requiring remount.

Prefer comparing stable ID membership rather than array order when deciding whether local component state has become structurally invalid.

Examples:

```text
same IDs, different order -> not topology replacement
added/removed ID -> topology change
same network ID but reset/replacement -> replacement boundary if needed
```

Keep this change narrow; do not rewrite unrelated reorder logic.

---

# 6. Preserve expected behavior

## Same network + same outpost + ordinary value Undo/Redo

Example:

```text
expand Cargo Pad
toggle resource/manufacturing/etc.
Undo
```

Expected:

```text
data changes
Cargo expansion/local presentation remains intact
```

## Same network + different restored outpost

Example:

```text
edit Outpost A
navigate to Outpost B
enter Cargo reshuffle/draft state
Undo
```

Expected:

```text
Undo returns to Outpost A
Cargo editor mounts cleanly for Outpost A
Outpost B's local Cargo presentation state does not leak
Navigation panel itself is not unnecessarily remounted
```

## Cross-network Undo/Redo

Expected:

```text
restored Network + Outpost context is correct
network-local presentation resets safely
```

## Reorder-only Undo/Redo

If IDs are unchanged and the action is purely reordering:

```text
do not remount solely because array order changed
```

unless an active drag/reshuffle safety requirement genuinely needs it.

---

# 7. Suggested implementation shape

Use whatever naming fits the current code, but a clean direction would be to separate:

```text
navigationPresentationEpoch
cargoPresentationEpoch
```

or equivalent keys.

For example:

```text
OutpostList key -> network identity + navigation epoch
CargoPadsEditor key -> network identity + selected outpost identity + cargo epoch
```

Do not force this exact implementation if a simpler structural approach exists.

The important result is:

```text
different remount boundaries for network-wide Navigation vs outpost-local Cargo UI
```

---

# 8. Tests

Add/update focused tests for the boundary decision helper(s), covering at minimum:

```text
same network + same outpost + value-only change -> no Cargo reset
same network + different outpost -> Cargo reset
same network + different outpost -> no Navigation reset
different network -> both reset as appropriate
same stable IDs reordered -> no topology reset
cargo pad added/removed -> Cargo reset
outpost added/removed -> Navigation reset where needed
reset/import replacement with same network ID -> Cargo reset
```

If the decision logic lives in `App.tsx`, extract a small pure helper if that materially improves testability.

Avoid brittle component-remount tests if pure structural decision tests are sufficient.

---

# 9. Manual smoke tests

Verify:

### Outpost-local Cargo leakage case

1. Create at least two outposts.
2. Make an undoable edit on Outpost A.
3. Switch to Outpost B.
4. Enter Cargo reshuffle and/or an incomplete destination draft on B.
5. Undo.

Expected:

```text
returns to Outpost A
Cargo UI is clean for A
Navigation remains stable
```

### Same-outpost Undo

1. Expand a Cargo Pad.
2. Make a same-outpost value edit.
3. Undo.

Expected:

```text
Cargo Pad remains expanded
```

### Cross-network Undo

Verify network + outpost restoration and clean network-local presentation.

### Reorder

Verify pure outpost/cargo-pad reorder does not cause unnecessary remount if IDs remain the same.

---

# 10. Verification

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Do not commit or push.

---

# 11. Completion report

Report:

- what presentation keys/epochs now exist;
- exact triggers for Navigation reset;
- exact triggers for Cargo reset;
- whether order-only topology changes were removed from reset detection;
- tests added/updated;
- manual smoke-test results;
- files changed;
- any deviation from this brief.

---

## Final instruction

Keep this correction surgical.

Desired result:

> **Contextual Undo/Redo may change Network and Outpost selection, but only the presentation state that actually belongs to the changed document/outpost is reset. Ordinary same-outpost Undo/Redo remains visually stable, and pure reordering does not trigger unnecessary remounts.**
