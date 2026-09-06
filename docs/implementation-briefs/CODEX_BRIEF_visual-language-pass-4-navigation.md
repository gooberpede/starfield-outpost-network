# Codex Implementation Brief — Visual Language Pass 4: Outpost Navigation Pane

## Objective

Implement the **fourth visual-language pass** for `starfield-outpost-network`, focused on the left-hand Outpost navigation pane.

The navigation pane is **application infrastructure**, not operational content.

Its job is to:

- let the user move between outposts;
- show which outpost is currently selected;
- expose add/reorder controls when needed;
- remain persistent and easy to scan;
- otherwise recede visually so the Resource Matrix and Cargo Pads remain the dominant workspace.

The target character is:

> **quiet, pale, compact, technical, and easy to ignore until needed.**

This pass should continue the already committed visual language from the shell, Outpost Header, Resource Matrix, and Cargo Pads.

---

## 1. Read repository guidance first

Before editing, inspect the repository and read the relevant durable guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
BACKLOG.md
```

Also inspect the current implementation and CSS for:

```text
Outpost navigation pane
Outpost list rows
selected outpost behavior
reshuffle / lock-order mode
drag handles
move controls
Add Outpost
workspace pane layout
global / shell / operational visual tokens
```

Preserve existing navigation, selection, ordering, drag/drop, persistence, and Undo/Redo behavior.

---

## 2. Hard scope boundary

### In scope

Visual and tightly scoped presentation changes for:

```text
Outposts pane heading
capacity/count metadata
Outpost list rows
selected-row treatment
Add Outpost
Reshuffle / Lock order
Outpost drag handles
Outpost move controls
pane surface / separator / spacing
```

Small markup changes are acceptable only where needed for clearer visual semantics or accessibility.

### Out of scope

Do **not** redesign:

```text
TitleBar
PageHeader
StatusBar
Outpost Header
Resource Matrix
Cargo Pads
Planned Supply
validation panel
network lifecycle behavior
cargo ordering controls
```

Do not alter the outpost data model.

Do not change how selection is persisted or how selected outpost identity works.

Do not change the actual order semantics.

Do not broaden this pass into a full app-wide action/mode/drag-handle consolidation unless shared styles already exist and can be safely reused.

---

## 3. Navigation role and hierarchy

The pane should visually communicate:

> **navigation is useful but peripheral.**

It should feel more closely related to the shell / PageHeader than to the operational Matrix/Cargo region.

Preferred hierarchy:

```text
Application / PageHeader     global context
Navigation pane              quiet infrastructure
Outpost Header               selected-object context
Matrix + Cargo               operational core
```

Do not give Navigation the same visual weight as `RESOURCE MATRIX` or `CARGO PADS`.

---

## 4. Pane surface

Use a quiet pale surface consistent with the shell.

Preferred character:

```text
Surface / Background family
minimal boxing
thin separator at workspace edge
flat
square / near-square
no shadow
```

The pane should feel like a pale rail attached to the application, not a floating card.

A single vertical rule along the workspace edge is preferred over a full border box.

Do not add a dark pane-wide background.

---

## 5. Pane heading

Current conceptual heading:

```text
Outposts [9/16]
```

Restyle this so the semantic hierarchy becomes clearer.

### Preferred direction

```text
OUTPOSTS      9 / 16
```

or equivalent, while preserving current meaning.

Goals:

- `OUTPOSTS` is the structural label;
- count/capacity is metadata;
- count should be visually quieter;
- heading should remain compact;
- no full dark structural bar.

Use:

```text
Barlow Semi Condensed
uppercase structural label
Muted text / Primary text hierarchy
slight tracking
fine rule if useful
```

Do not make the heading as strong as Matrix/Cargo headings.

---

## 6. Outpost list rows

The list should remain compact and highly scannable.

Preserve:

```text
one line per outpost
existing order
existing ellipsis behavior where needed
current click / selection behavior
```

Avoid:

```text
cards
icons without semantic meaning
multi-line rows
large vertical padding
rounded row containers
```

Preferred default row treatment:

```text
mostly transparent / pale
Primary text
minimal or no enclosing border
fine separator if needed
```

Rows should almost disappear into the pane until interacted with.

---

## 7. Selected outpost row

This is one of the most important goals of the pass.

The runtime audit established that the current selected outpost effectively looks like a disabled native button.

The redesign should create an explicit **selected navigation state**.

### Approved direction

Use a **subtle highlighted row plus a short dark left marker**.

Preferred character:

```text
light Highlight / Panel-tint row background
Structural dark or Primary text
short Structural-dark left rail / marker
no full dark inversion
```

The selected row should be obvious when the user looks for it, but should not dominate the page.

Guiding principle:

> **Current navigation state should be quieter than operational state.**

Do not use the Matrix-style full Structural-dark selected fill.

Do not make selected state look unavailable.

---

## 8. Disabled vs selected semantics

If the current implementation still uses native `disabled` behavior to represent the selected outpost, preserve behavior only if necessary, but ensure the authored styling clearly communicates **selected**, not disabled.

Do not apply generic disabled opacity to the selected row.

If a safe markup/CSS change can separate visual selection from native disabled appearance without changing behavior, that is encouraged.

Do not alter keyboard/navigation semantics without explicit need.

If changing the selected element's `disabled` behavior would be behavioral rather than visual, report it instead of expanding scope.

---

## 9. Long outpost names

Preserve current compact one-line navigation.

Goals:

- use the available pane width efficiently;
- retain ellipsis only when necessary;
- do not increase row height;
- preserve full persisted/exported outpost names.

If current title/tooltip behavior exposes the full name, retain it.

Do not introduce two-line wrapping.

---

## 10. Add Outpost

`+ Add Outpost` is a create action.

It should remain clearly available but visually secondary to the list itself.

Preferred treatment:

```text
square / near-square control
Barlow Semi Condensed
pale control surface
Rule / border
subtle hover
application-owned focus
```

Do not make it a large primary CTA.

Do not use Structural dark as a permanent fill unless existing shared action styling already calls for it.

---

## 11. Reshuffle / Lock order as a mode button

This pass should make the current mode semantics visually explicit.

Current behavior:

```text
RESHUFFLE
→ ordering mode active
→ LOCK ORDER
```

The runtime audit found that active mode previously changed only label / aria state.

### Normal mode

Preferred treatment:

```text
pale outlined control
Primary text
Rule / border
```

### Active reshuffle mode

Preferred treatment:

```text
Structural-dark fill
Highlight text
clear active-mode state
```

This should read as a persistent mode, not merely another command.

The visual grammar should be reusable later for the Cargo `Reshuffle / Lock order` control.

Do not change the underlying mode behavior.

---

## 12. Drag handles

Normal navigation should be as clean as possible.

### Approved direction

When ordering mode is **inactive**:

> hide the Outpost drag handles rather than leaving them visible and dimmed.

When ordering mode is **active**:

- show the handles;
- use compact technical geometry;
- use the existing drag cursor behavior;
- use application-owned focus;
- keep hit targets usable.

This is an intentional change from the old behavior where Outpost handles remained visible/dimmed while locked.

Do not change drag semantics.

Do not make the handle a decorative icon in normal mode.

---

## 13. Move controls

Arrow move controls should remain available in reshuffle mode as the non-drag fallback.

Preferred treatment:

```text
small square technical action controls
same state language as other icon actions
application-owned focus
clear boundary-disabled state
```

Do not increase their visual prominence.

Preserve boundary-disable behavior.

---

## 14. Normal vs reshuffle mode

The pane should visibly simplify when not reordering.

### Normal mode should show primarily:

```text
OUTPOSTS + count
Add Outpost
Reshuffle
outpost rows
selected marker
```

### Reshuffle mode may additionally show:

```text
drag handles
move controls
Lock order active state
reorder feedback / insertion markers
```

The visual transition should make the ordering mode obvious without dramatically changing pane size.

---

## 15. Reorder insertion / dragging states

Preserve current drag/drop behavior and insertion-marker semantics.

If the current insertion marker conflicts with the new palette, align it with the established Structural-dark / UI state language.

Do not redesign drag feedback beyond visual consistency.

Dragging state should remain legible but restrained.

Avoid neon or animated effects.

---

## 16. Typography

Use the established typography:

```text
Barlow Semi Condensed
```

for:

```text
OUTPOSTS heading
outpost names
Add Outpost
Reshuffle / Lock order
move controls where textual
metadata count
```

Use IBM Plex Mono only if there is a genuinely technical/code-like value that benefits from it.

Do not use mono for outpost names.

---

## 17. State language

### Default row

```text
transparent / pale
Primary text
minimal chrome
```

### Hover

```text
small pale contrast shift
no semantic color change
```

### Selected row

```text
light highlight
short Structural-dark left marker
strong readable text
```

### Focus

Use the application-owned focus language.

Target:

```text
2px solid Structural dark
consistent offset
```

### Disabled move/action state

Use muted text/border and reduced emphasis while remaining legible.

Do not make disabled controls visually identical to selected navigation state.

---

## 18. Geometry and borders

Continue the established shape language:

```text
square / near-square
flat
sparse borders
thin technical rules
no shadows
```

Avoid:

```text
rounded pills
card borders around each row
drop shadows
decorative icons
```

---

## 19. Density

Preserve the current compact list density.

Do not increase row height materially.

Do not add large vertical gaps between outposts.

Prefer removing chrome over adding padding.

The pane should be efficient enough for a large outpost list while remaining readable.

---

## 20. Relationship to workspace

The navigation pane should recede relative to:

```text
Resource Matrix
Cargo Pads
```

Do not introduce dark operational rails into Navigation.

Do not give the pane a dramatic section background.

A pale surface and thin separator should be enough.

---

## 21. Responsive behavior

Preserve the existing pane width unless a tiny adjustment is necessary for the new selected-marker treatment.

Do not widen Navigation at the expense of Matrix/Cargo.

Verify:

- long names still behave correctly;
- controls do not overflow;
- reshuffle controls remain usable;
- no new page-level horizontal scrolling appears;
- the operational workspace width remains unchanged.

---

## 22. No behavior changes

Do not change:

```text
selected outpost logic
Add Outpost behavior
outpost ordering
drag/drop
arrow movement
Reshuffle / Lock order semantics
Undo/Redo
persistence
validation
```

This is a visual pass.

The only approved presentation-state change is:

> hide drag handles when reshuffle mode is inactive.

If implementing that requires behavior beyond conditional presentation, report it before broadening scope.

---

## 23. Visual review checklist

Before considering the pass complete, assess:

1. Does the Navigation pane visually recede into the background?
2. Is `OUTPOSTS` clear without competing with operational headings?
3. Is the count clearly metadata rather than part of the title?
4. Are ordinary outpost rows compact and quiet?
5. Is the selected outpost easy to find without becoming visually dominant?
6. Does selected state look selected rather than disabled?
7. Are drag handles absent in normal mode?
8. Is reshuffle mode visually obvious when active?
9. Do Add Outpost and Reshuffle remain usable but secondary?
10. Has the pane avoided cards, rounded rows, and unnecessary borders?
11. Has workspace width remained stable?
12. Has row density remained essentially unchanged?

---

## 24. Verification

Run appropriate repository checks, at minimum where available:

```text
npm test
npm run lint
npm run build
git diff --check
```

Report pre-existing failures separately.

### Manual browser smoke tests

Test:

```text
0 outposts
1 outpost
several outposts
near capacity / visible count
long outpost names
selected outpost
normal mode
reshuffle mode
drag handle focus
drag/reorder
move up/down
boundary-disabled move control
Add Outpost
Lock order
Undo/Redo after reorder
```

Verify:

- selection behavior unchanged;
- selected row styling remains correct;
- long names remain one line;
- handles appear only in reshuffle mode;
- drag/drop still works;
- move controls still work;
- insertion marker remains visible;
- locking order restores the quiet normal pane;
- no layout or overflow regression;
- Matrix/Cargo dimensions remain unchanged.

---

## 25. Deliverable report

When complete, report:

```text
files changed
pane surface / separator changes
heading / count changes
outpost-row changes
selected-state changes
Add Outpost changes
Reshuffle / Lock order changes
drag-handle changes
move-control changes
tokens added/changed, if any
tests/checks run
manual smoke-test results
unexpected inherited effects
```

Explicitly state whether:

- any out-of-scope component changed visually;
- workspace width changed;
- row height changed materially;
- drag handles are hidden outside reshuffle mode;
- any navigation behavior changed.

Do not commit or push unless explicitly asked.

---

## 26. Suggested commit message

If accepted:

```text
feat: restyle outpost navigation
```

---

## 27. Final instruction

The purpose of this pass is to make Navigation feel like **quiet application infrastructure**.

The user should be able to:

- find the selected outpost immediately when needed;
- navigate effortlessly;
- enter ordering mode deliberately;
- otherwise let the pane fade into the background.

Prefer:

```text
subtlety
compactness
clear selection semantics
minimal chrome
existing workflow preservation
```

over decorative emphasis.
