# Codex Follow-Up Implementation Brief — Contextual Undo Presentation Reset + PageHeader Polish + Missing-Input Agent Guidance

## Objective

Make three small follow-up corrections/polish changes to the completed multiple-networks implementation:

1. **Do not reset/remount network-bound presentation state on every Undo/Redo**; only do so when the traversed history action actually changes the active network/document boundary or otherwise requires a defensive remount.
2. **Polish the PageHeader vertical alignment and Network cluster presentation** so action controls align with the character input row and the `NETWORK` label sits above its controls.
3. **Update `AGENTS.md`** with an explicit rule for handling missing referenced audits/specifications/attachments from prior tasks or chats.

Do not reopen the accepted single-network Reset behavior. The current Reset result of one fresh empty outpost is now explicitly accepted and should remain unchanged.

---

# PART A — READ CURRENT STATE FIRST

## 1. Inspect the implementation that just landed

Review the current diff/state for:

```text
src/App.tsx
src/domain/collectionEditingSession.ts   (or equivalent new session file)
src/domain/history.ts
src/ui/layout/PageHeader.tsx
src/ui/layout/PageHeader.css
src/ui/components/CharacterHeader.tsx
src/ui/components/CharacterHeader.css
AGENTS.md
```

Also inspect any network-control component/CSS introduced by the implementation.

Do not redesign the multiple-networks architecture.

---

# PART B — KEEP CURRENT RESET SEMANTICS

## 2. Explicitly preserve current single-network Reset result

The user has now accepted this behavior:

> Resetting the only network should wipe it back to a fresh state with **one empty/default outpost**.

Therefore:

```text
Add Network   -> one fresh default outpost
Reset Network -> one fresh default outpost
```

Do not change this behavior in the follow-up.

No migration or additional design work is needed for this point.

---

# PART C — FIX OVER-BROAD PRESENTATION RESET ON UNDO/REDO

## 3. Current issue

The current implementation appears to invoke presentation reset/remount behavior on every Undo and every Redo, including ordinary same-network edits.

This is too broad.

Example:

```text
Network 1 / Outpost A
Expand Cargo Pad editor
Toggle Iron production
Undo
```

Expected:

```text
Iron production is reverted
Network 1 / Outpost A remains the action context
Cargo Pad expansion and other unrelated presentation state should not be forcibly reset merely because Undo occurred
```

Presentation reset should be tied to a genuine network/document boundary change, not to the fact that history traversal occurred.

---

## 4. Locked rule

> **Undo/Redo restores data + Network/Outpost context, but should not unnecessarily reset unrelated presentation state when the active network remains the same document.**

Keep these excluded from history:

```text
Navigation open/collapsed
Navigation reshuffle state
Cargo Pad expanded/collapsed
Cargo Pad reshuffle/drag state
Planned Supply expansion
Validation panel open/closed
scroll/focus/sub-editor chrome
```

The goal is not to preserve invalid stale component state at all costs; the goal is to avoid remounting/resetting it when there is no network-boundary reason to do so.

---

## 5. Determine when presentation reset is actually required

Audit the current `resetNetworkPresentationState()` (or equivalent) and all call sites.

A reset/remount is appropriate when, for example:

```text
active network ID changes
whole-collection import replaces the active document
Undo/Redo crosses to another network
Undo/Redo deletes/restores/replaces the active network document in a way that leaves local component state unsafe
single-network Reset replaces the active document contents sufficiently that stale drafts/expanded editors should be discarded
```

A reset/remount is generally **not** appropriate merely because:

```text
Undo occurred
Redo occurred
an ordinary same-network resource/manufacturing/cargo value changed
selected outpost changed within the same network and the affected component already handles that safely
```

Use the smallest clean rule that prevents stale local editor state without turning every history traversal into a UI reset.

---

## 6. Prefer explicit boundary detection

If practical, centralize the decision.

Conceptually, compare before/after traversal state such as:

```text
previous active network ID
next active network ID
network replacement/import/reset epoch if needed
```

Avoid brittle history-label inspection.

Do not special-case action names such as `"Import networks"` or `"Delete network"` if structural state tells you what changed.

---

## 7. OutpostList remount behavior

The current implementation may key `OutpostList` using a general presentation-reset counter.

Audit whether that causes the Navigation component to remount on ordinary Undo/Redo.

If so:

- remove unnecessary remounting;
- preserve Navigation open/collapsed state globally;
- avoid resetting normal outpost-list presentation unless a genuine network boundary requires it;
- still ensure Reshuffle/drag state cannot leak across networks.

Prefer keys based on stable network identity where appropriate.

---

## 8. CargoPadsEditor remount behavior

Keep defensive remounting where it is actually needed to prevent stale:

```text
expanded pad state
reshuffle state
drag state
local drafts
```

from leaking into a different/restored network document.

But ordinary same-network Undo/Redo should not automatically collapse/reset Cargo UI solely because history was traversed.

If a same-network Reset or Import genuinely replaces the active network document while retaining the same network ID, use the existing replacement/import epoch mechanism or a refined equivalent.

---

# PART D — PAGEHEADER POLISH

## 9. Desired vertical rhythm

The attached screenshot shows the action row sitting vertically higher than the CharacterHeader input row.

Adjust the PageHeader so the controls share a clearer two-line rhythm:

```text
CHARACTER   LEVEL   OUTPOST MANAGEMENT   PLANETARY HABITATION                      NETWORK
[input]     [input] [input]              [input]      [Undo/etc...]                 [<][1 / 3][>][+][-]
```

The ASCII layout is conceptual only.

The important visual rule:

> **Toolbar action buttons should align vertically with the character input/control row, not with the combined label+input block.**

---

## 10. Move NETWORK label above the selector controls

Change the current inline:

```text
NETWORK [<] [1 / 3] [>] [+] [-]
```

to a vertically grouped cluster:

```text
NETWORK
[<] [1 / 3] [>] [+] [-]
```

This should reclaim horizontal space and better match the CharacterHeader label/input grammar.

---

## 11. Make label ownership unambiguous without adding a box

Do not introduce a card, surrounding border, or extra dark rail merely to associate the label with the controls.

Use:

- the same muted uppercase label style as `CHARACTER`, `LEVEL`, etc.;
- left alignment of `NETWORK` with the start of its control row;
- tight internal spacing among `<`, ordinal, `>`, `+`, `-`;
- slightly larger separation between the network cluster and the preceding generic action buttons than between controls inside the network cluster.

The relationship should be clear through alignment and spacing.

---

## 12. Keep current visual language

Preserve:

- B1 sage-grey palette;
- flat/square geometry;
- thin rules;
- no shadows;
- no rounded “pill” controls;
- dense desktop layout;
- existing focus-visible behavior.

Do not redesign the whole PageHeader.

---

## 13. Responsive/wrapping behavior

Check that the revised cluster still behaves sensibly when horizontal space tightens.

Prefer:

- keeping `NETWORK` attached to its control row;
- wrapping the network cluster as a unit where practical;
- avoiding orphaned `NETWORK` text on one line with controls far away on another.

Do not introduce a menu or compact overflow control.

---

# PART E — AGENTS.MD MISSING-INPUT GUIDANCE

## 14. Add explicit repository-wide guidance

Add a short section to `AGENTS.md`, preferably near:

```text
Working with implementation briefs
```

or:

```text
When to stop and report instead of guessing
```

Suggested heading:

```text
## Missing referenced inputs
```

The guidance should capture this rule:

> If a task or implementation brief refers to an audit, design note, specification, attachment, prior report, or other input that cannot be found in the repository or current task context, do not invent its contents or assume it can be recovered from prior conversations.

Then distinguish two cases.

### Case A — missing reference is non-material

If the current implementation brief fully restates everything needed to proceed:

- note that the referenced artifact was unavailable;
- continue using the current brief as authoritative;
- do not halt unnecessarily.

### Case B — missing reference may materially affect the task

If the missing artifact could affect:

```text
scope
architecture
domain semantics
UX
acceptance criteria
migration behavior
data safety
implementation choice
```

then:

- stop before making changes dependent on the missing information;
- ask the user to provide the artifact or clarify the requirement;
- do not silently guess.

---

## 15. Cross-chat memory expectation

Also make clear that repository agents should **not rely on assumed conversational memory across separate chats/tasks**, even inside the same broader project.

Repository files and explicitly supplied current-task materials are the reliable sources.

Do not phrase this as a limitation apology; make it a working-process rule.

---

## 16. Preserve existing instruction precedence

Do not weaken the current `AGENTS.md` authority ordering.

The current hierarchy remains:

```text
1. current brief / explicit user request
2. AGENTS.md
3. relevant docs
4. tests/types
5. existing code
```

The new missing-input guidance should complement, not replace, the existing conflict/ambiguity rules.

---

# PART F — TESTS / VERIFICATION

## 17. Automated checks

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

## 18. Manual presentation-state smoke tests

At minimum verify:

### Same-network ordinary Undo

```text
expand a Cargo Pad
make a normal edit in same network
Undo
```

Expected:

```text
edit reverts
Cargo presentation does not unnecessarily reset solely due to Undo
```

### Same-network ordinary Redo

Repeat for Redo.

### Cross-network Undo

```text
make edit in Network 1
switch to Network 2
Undo
```

Expected:

```text
returns to Network 1 / affected outpost
network-bound presentation state is safely reset if needed
```

### Cross-network Redo

Verify symmetric behavior.

### Add/Delete Network Undo/Redo

Verify no stale Cargo/Navigation interaction state leaks between networks.

### Single-network Reset

Verify it still produces:

```text
one fresh empty/default outpost
```

and stale network-bound drafts do not leak.

### Import

Verify whole-collection import still resets/remounts unsafe network-local presentation state where necessary.

---

## 19. Manual PageHeader checks

Verify at normal desktop widths:

- Character/Level/skill labels remain aligned.
- Character input row and action-button row share the same vertical baseline.
- `NETWORK` sits above its controls.
- `NETWORK` ownership is visually unambiguous.
- selector controls remain compact.
- no unnecessary extra vertical height is introduced.
- no clipping/overflow regression.
- focus-visible behavior remains clear.

Also test one narrower desktop width where header wrapping occurs.

---

# PART G — DOCUMENTATION

## 20. UX docs

If the current implementation documentation already records PageHeader/network-control placement, update `docs/UX-DESIGN.md` only as needed to reflect:

```text
NETWORK label above selector controls
action controls aligned with the CharacterHeader input row
```

Do not over-document pixel-level CSS.

---

## 21. Architecture docs

Only update architecture documentation if the refined presentation-reset boundary is a durable rule worth recording.

A concise rule would be:

> Network-bound presentation state may be reset when the active network/document boundary changes or is replaced, but ordinary same-network Undo/Redo should not reset unrelated presentation state.

Do not add noise if the existing architecture docs already imply this adequately.

---

# PART H — OUT OF SCOPE

## 22. Do not change

Do not alter:

```text
single-network Reset -> one fresh outpost
global collection history architecture
history context scope
network ordering
network wrap behavior
network add/delete semantics
whole-collection import/export
network IDs
network labels/history labels
Character Level validation
navigation-panel scrolling backlog
pane resize/collapse behavior
```

Do not add new features.

---

# PART I — COMPLETION REPORT

## 23. Report back with

Summarize:

### Presentation reset
- what was previously resetting too broadly;
- what now triggers a reset/remount;
- what same-network Undo/Redo now preserves.

### PageHeader
- vertical alignment change;
- Network label/control grouping;
- responsive behavior.

### AGENTS.md
- exact new missing-input rule;
- where it was added.

### Verification
- test count;
- build result;
- lint result;
- `git diff --check`;
- manual smoke-test results.

### Files changed
List all files.

### Deviations
Call out any deviation from this brief.

---

## Final instruction

Keep this follow-up narrow.

The desired result is:

> **Contextual Undo/Redo still returns the user to the correct Network + Outpost, but ordinary same-network history traversal no longer unnecessarily resets unrelated presentation state; the PageHeader gains cleaner vertical alignment and a compact vertically-labelled Network selector; and repository agents explicitly stop rather than guessing when a materially important referenced input is missing.**
