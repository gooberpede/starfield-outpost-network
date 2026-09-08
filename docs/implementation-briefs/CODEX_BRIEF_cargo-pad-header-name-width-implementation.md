# Codex Implementation Brief — Cargo Pad Header Remote-Outpost Name Width

## Objective

Implement the Cargo Pad header refinement identified by the completed runtime visual audit.

The goal is to preserve substantially more of the **remote outpost name** before ellipsis occurs, using Starfield's normal **25-character outpost-name limit** as the design envelope while still degrading gracefully for longer modded names.

This should be a small, focused CSS/markup change.

Do **not** redesign the Cargo pane or workspace.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Inspect especially:

```text
src/ui/components/CargoPadsEditor.tsx
src/ui/components/CargoPadsEditor.css
src/ui/layout/WorkspaceLayout.css
```

Also review the completed Cargo Pad header audit and use its measured geometry as the implementation basis.

---

# PART A — LOCKED AUDIT FINDINGS

## 2. Current root cause

The compact Cargo Pad header currently divides its top row into two equal tracks.

That causes the identity track to reserve roughly half the available width even though it usually contains only:

```text
expand/collapse control
optional [INT] indicator
```

The remote outpost name receives only the other half, causing premature ellipsis.

The Cargo pane itself is wide enough to improve this materially without pane resizing.

---

## 3. Design target

Use:

```text
25 characters
```

as the normal in-game outpost-name design envelope.

The implementation should aim for:

- most realistic 25-character names displaying fully on regular pads;
- most 25-character Inter-System names displaying fully or nearly fully;
- longer modded names ellipsizing cleanly;
- shared-prefix names retaining enough suffix information to remain distinguishable.

Do not attempt to fit pathological all-wide-glyph strings.

---

# PART B — HEADER TRACK REBALANCE

## 4. Replace equal header tracks

Change the compact top-row layout from equal-width tracks to content-sized identity + flexible destination.

Preferred direction:

```css
.cargo-pad__summary-top {
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.5rem;
}
```

Use the actual current selector/class names if they differ.

The intent is:

```text
[identity content at intrinsic width] [remote outpost gets remainder]
```

Do not introduce runtime text measurement.

Do not size the name track based on the currently selected outpost.

---

## 5. Preserve identity content

Keep current dimensions/behavior for:

```text
expand/collapse control
[INT] indicator
ordinal gutter
reorder controls
```

Do not shrink the expand control or remove `[INT]` just to recover width.

The identity area should simply stop claiming unused space.

---

# PART C — GAP / PADDING

## 6. Reduce only the inter-column gap

Reduce the compact header inter-column gap from approximately:

```text
0.75rem
```

to:

```text
0.5rem
```

This is the low-cost spacing recovery identified by the audit.

Do not reduce summary padding in the first implementation unless browser verification shows it is necessary.

The audit specifically found current summary padding only modestly compressible and not the main problem.

---

# PART D — FULL-NAME DISCOVERABILITY

## 7. Add lightweight full-name access

The audit found that the destination name currently ellipsizes but does **not** expose its full value directly.

Add a native title/tooltip fallback, for example conceptually:

```tsx
title={remoteOutpostName}
```

Use the actual destination-name variable.

Do not:

```text
make the non-interactive label focusable
add a heavyweight tooltip dependency
change the label into a button
```

Keep the current compact presentation.

---

# PART E — ELLIPSIS

## 8. Preserve existing ellipsis behavior

Keep:

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

or the current equivalent.

Ellipsis remains the correct graceful fallback for:

```text
modded names >25 characters
pathological wide-glyph names
temporarily constrained Reshuffle mode
very narrow workspace states
```

The objective is to reduce unnecessary ellipsis, not eliminate it.

---

# PART F — RESHUFFLE MODE

## 9. Accept temporary compression

In Reshuffle mode, reorder controls consume additional horizontal space.

Do not restructure the compact summary solely to eliminate ellipsis in this temporary mode.

Expected behavior:

- destination still receives the remaining flexible width;
- some normal 25-character names may ellipsize earlier while reshuffling;
- full name remains discoverable via title;
- reorder controls remain intact.

No second-line reflow is required.

---

# PART G — INTER-SYSTEM PADS

## 10. Preserve [INT]

Inter-System pads include the `[INT]` indicator.

The audit found that with the proposed track model, most realistic 25-character names should still fit fully or nearly fully.

Do not hide, abbreviate further, or relocate `[INT]` in this pass.

If slight ellipsis remains for the widest realistic 25-character Inter-System cases, that is acceptable.

---

# PART H — EXPLICITLY OUT OF SCOPE

## 11. Do not change

Do not implement:

```text
Cargo pane resizing
Cargo pane collapse/slide-away
Navigation pane changes
workspace pane resizing
manual drag resize
second-line Cargo header redesign
remote-name font-size reduction
outpost-name persistence rules
Cargo Pad domain semantics
Resource Matrix layout
```

This is only a compact-header width-allocation correction.

---

# PART I — BROWSER VERIFICATION

## 12. Verify representative viewports

Check at least:

```text
1440px
1280px
1100px
1024px
900px
```

or equivalent representative widths used in the audit.

Confirm:

- regular Cargo Pad names gain substantial width;
- no layout overlap occurs;
- `[INT]` remains stable;
- expand/collapse control remains usable;
- reorder controls remain usable;
- no new horizontal overflow is introduced.

---

## 13. Verify representative names

Test:

### Short
```text
New Outpost
```

### Existing realistic
```text
Feynman I Li Cu xF4
```

### 25-character shared-prefix cases
Use realistic names similar to:

```text
Feynman III Cargo Alpha A
Feynman III Cargo Alpha B
Feynman III Manufacturing
Feynman III Cargo Gateway
```

The key success criterion is that distinguishing suffixes remain visible more often than before.

### Modded / stress
Use a name longer than 25 characters.

Expected:

```text
clean ellipsis
full title available
layout unchanged
```

---

# PART J — ACCESSIBILITY / INTERACTION

## 14. Preserve interaction behavior

Verify that the change does not affect:

```text
expand/collapse keyboard focus
reorder controls
focus-visible styles
Cargo Pad selection/editing
reshuffle mode
```

The destination label itself need not become keyboard focusable solely for the native title.

---

# PART K — TESTING

## 15. Automated checks

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Add focused tests only if there is an existing suitable component/style testing path.

Do not introduce brittle pixel-perfect tests.

---

# PART L — DOCUMENTATION

## 16. UX documentation

Update `docs/UX-DESIGN.md` only if this establishes a durable Cargo Pad rule not already covered.

If documenting, keep it concise:

- remote outpost identity should receive flexible width priority;
- normal 25-character names are the design envelope;
- longer names ellipsize with full-name discoverability.

Do not add pixel-level implementation values unless project conventions call for them.

---

# PART M — COMPLETION REPORT

## 17. Report

Provide:

```text
files changed
final header grid-template
final gap
whether summary padding changed
title/full-name implementation
results at representative viewports
regular vs Inter-System results
Reshuffle behavior
tests/checks run
```

Explicitly state whether:

- Cargo pane width changed;
- any Cargo semantics changed;
- any workspace layout changed;
- any font/control size changed.

Do not commit or push unless explicitly asked.

---

## 18. Suggested commit message

If accepted:

```text
style: improve cargo pad destination names
```

---

## 19. Final instruction

Implement the audit recommendation directly:

> **Let the identity area take only the width it needs, give the remaining compact-header width to the remote outpost name, and retain ellipsis as a graceful fallback rather than the default outcome.**
