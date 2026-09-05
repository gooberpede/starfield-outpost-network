# Codex Correction Brief — Allow Overwriting Existing Cargo Links

## Objective

Make one focused correction to the recently implemented Cargo Pad expanded-editor redesign.

The redesigned Cargo Pad UI is otherwise close to final.

The specific problem:

> Remote cargo pads that already participate in an existing CargoLink are currently shown as disabled/unselectable.

That is **not** the intended behavior.

The user must be able to select an already-linked remote pad and thereby **replace/overwrite the existing CargoLink relationships atomically**.

Do not redesign the Cargo Pad UI again.

Do not address lint debt in this correction.

Do not change unrelated Cargo Pad behavior.

---

# Read first

Read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect the current uncommitted Cargo Pad redesign, especially:

- `src/ui/components/CargoPadEditor.tsx`
- `src/ui/components/CargoPadsEditor.tsx`
- `src/App.tsx`
- any CargoLink helper/update logic
- current destination Pad option rendering
- current Undo/Redo mutation path
- any helper recently added to mark linked destination pads unavailable

Preserve all successful behavior from the redesign.

---

# Preserve the current redesigned behavior

Do not change:

- compact `Inter-System` toggle;
- He-3 positive/lit treatment;
- `Remove` button wording;
- unlabeled Outpost/Pad selectors;
- zero-pad outposts being unavailable;
- descriptive Pad selector option text;
- compact Exports toggle layout;
- stale selected export behavior;
- Planned Supply candidate behavior;
- Outpost Details routed-export Logistics semantics;
- broken-link cleanup behavior;
- compact Cargo Pad header;
- Cargo Pad ordering;
- right-column scrolling;
- schema / JSON;
- validators.

This is a **link reassignment correction only**.

---

# Problem to fix

Currently, a remote pad already participating in another CargoLink is rendered as unavailable/disabled.

That prevents the user from intentionally redirecting a link to that pad.

This restriction should be removed.

A remote pad being already linked is useful information, but it is **not** a reason to prohibit selection.

---

# Required selector behavior

## Already-linked remote pads remain visible

Keep the current informative Pad option text that indicates:

- whether the remote pad is already linked;
- what it is exporting, if anything.

Do not hide or simplify that descriptive information.

## Already-linked remote pads must be selectable

Do not disable a destination Pad option solely because it already participates in another CargoLink.

If there is a helper such as:

```text
isDestinationPadUnavailable(...)
```

or equivalent logic that marks linked pads disabled, remove or narrow that behavior accordingly.

A pad may still be unavailable for other legitimate reasons if existing domain rules require it, but **existing CargoLink occupancy alone must not disable it**.

---

# Overwrite / reassignment semantics

Selecting an already-linked remote pad should atomically establish the new desired link while preserving the one-link-per-pad invariant.

Example:

```text
Before:

Local Pad A  <-> Remote Pad B

Other Pad D  <-> Target Remote Pad C
```

The user edits Pad A and selects Pad C.

Expected result:

```text
After:

Pad A <-> Pad C

Pad B unlinked
Pad D unlinked
```

The previous links:

```text
A <-> B
D <-> C
```

are removed.

The new link:

```text
A <-> C
```

is created.

No pad may remain in more than one distinct CargoLink.

---

# Preserve outbound cargo on all affected pads

Reassigning CargoLinks must **not** clear or rewrite any affected pad's outbound item selections.

Using the example above:

- Pad A keeps its outbound items;
- Pad B keeps its outbound items;
- Pad C keeps its outbound items;
- Pad D keeps its outbound items.

Only the CargoLink relationships change.

This matches existing behavior where an unlinked pad can retain intended exports.

Do not treat outbound selections as owned by the CargoLink.

---

# History / Undo / Redo

This overwrite must be one deliberate history action.

Using:

```text
Before:
A <-> B
D <-> C
```

then selecting C for A:

```text
After:
A <-> C
B unlinked
D unlinked
```

must create **one** Undo history entry.

Undo must atomically restore:

```text
A <-> B
D <-> C
```

Redo must atomically restore:

```text
A <-> C
B unlinked
D unlinked
```

Do not create separate history entries for:

- unlinking A from B;
- unlinking D from C;
- creating A <-> C.

The user performed one destination selection, so it is one history action.

---

# No-op behavior

If the user selects the remote Pad that is already the current endpoint for this CargoLink:

- do nothing;
- create no history entry.

Preserve existing no-op handling if already implemented.

---

# Outpost selector behavior remains unchanged

Do not change the current behavior for the remote Outpost selector in this correction.

In particular:

- outposts with zero cargo pads remain unavailable/disabled or omitted as currently implemented;
- changing remote Outpost remains undoable as implemented;
- selecting `Unlinked` remains undoable and preserves outbound selections;
- changing Outpost may clear remote Pad selection as already implemented.

This correction concerns **Pad occupancy**, not Outpost availability.

---

# Broken-link cleanup remains unchanged

Preserve current behavior when a remote endpoint becomes invalid elsewhere:

- local pad becomes Unlinked;
- selected remote Outpost/Pad clears;
- local outbound selections remain.

Do not alter that behavior.

---

# Validators remain intact

Do not remove or weaken the existing validator:

```text
pad linked multiple times
```

or equivalent one-link-per-pad validation.

The editor should now proactively maintain the invariant during a deliberate overwrite operation, but validation still remains useful for malformed/imported data.

Do not change unrelated cargo validators.

---

# Implementation guidance

Prefer changing the CargoLink mutation/update operation rather than introducing UI-only hacks.

The ideal flow when selecting a destination Pad is conceptually:

1. identify the local endpoint being edited;
2. identify the chosen remote endpoint;
3. remove any CargoLinks involving the local endpoint;
4. remove any CargoLinks involving the chosen remote endpoint;
5. create the new CargoLink between those endpoints;
6. commit the resulting network as one state/history update.

Be careful not to accidentally remove the same link twice if the current link already involves one of those endpoints.

Do not mutate pad outbound item arrays.

If there is already a centralized CargoLink replacement/helper pathway, extend/reuse it instead of duplicating logic inside JSX.

---

# Explicitly out of scope

Do not:

- change Cargo Pad visual layout;
- change export toggle styling;
- change stale export rules;
- change Inter-System behavior;
- change He-3 availability logic;
- change Outpost Details matrix;
- change Imports;
- add confirmation dialogs before overwriting;
- add separate warnings/modals for occupied pads;
- add Cargo Pad reordering;
- add Cargo Pads scrolling;
- address the six pre-existing lint errors;
- commit or push.

The descriptive Pad option text already tells the user that a remote pad is linked; that is sufficient for this version.

---

# Acceptance criteria

1. Already-linked remote pads remain visible in the Pad selector.
2. Their descriptive linked/export information remains visible.
3. Already-linked remote pads are selectable.
4. Selecting one removes any prior link involving the local pad.
5. Selecting one removes any prior link involving the chosen remote pad.
6. Exactly one new CargoLink is created between the chosen endpoints.
7. No affected pad participates in more than one CargoLink afterward.
8. Outbound selections on all displaced/affected pads are preserved.
9. The reassignment creates exactly one history entry.
10. Undo restores all displaced previous links atomically.
11. Redo restores the reassigned link atomically.
12. Selecting the current endpoint again is a no-op with no history entry.
13. Outpost selector behavior remains unchanged.
14. Zero-pad outposts remain unavailable as currently implemented.
15. Broken-link cleanup behavior remains unchanged.
16. Existing cargo validators remain intact.
17. No unrelated UI redesign occurs.

---

# Verification

Run:

```bash
npm run build
```

Run targeted lint for changed files.

Run:

```bash
git diff --check
```

Do not fix the known six pre-existing lint errors in this correction.

---

# Manual test checklist

## Basic overwrite

Create:

```text
A <-> B
D <-> C
```

Then edit A and choose C.

Confirm:

```text
A <-> C
B unlinked
D unlinked
```

Confirm all four pads retain their outbound items.

## Undo / Redo

Undo once.

Confirm:

```text
A <-> B
D <-> C
```

Redo once.

Confirm:

```text
A <-> C
B unlinked
D unlinked
```

Confirm there was only one history action.

## Selector

Confirm:

- linked pad C remains visible;
- it is selectable;
- its descriptive text still indicates linked/export state.

## No-op

Select the already-current remote pad again.

Confirm:

- no network change;
- no history entry.

## Regression

Confirm:

- Inter-System toggle unchanged;
- export controls unchanged;
- zero-pad outposts still unavailable;
- Unlinked behavior unchanged;
- broken endpoint cleanup unchanged;
- Outpost Details Logistics behavior unchanged.

---

# Completion report

Report:

- files changed;
- where linked-pad disabling was removed;
- how link overwrite/reassignment is implemented;
- how affected links are removed atomically;
- how outbound cargo is preserved;
- how one-history-action Undo/Redo is guaranteed;
- commands run and results;
- any pre-existing lint errors left untouched;
- recommended manual checks.

Do not commit or push.
