# Codex Implementation Brief — Cargo Pad Ordinal Gutter

## Objective

Add a narrow, fixed left-side gutter to every cargo pad so that:

- in normal/locked mode, the gutter displays the cargo pad's current ordinal position (`1`, `2`, `3`, ...);
- in reshuffle mode, the same gutter displays the existing drag handle instead;
- the gutter remains present in both collapsed and expanded views;
- the cargo pad content column stays aligned and does not shift when switching modes.

This change restores a lightweight human-readable locator for cargo pads without bringing back the old full `Pad N` labels.

The ordinal is a **presentation-only locator derived from current display order**. It must not become persisted identity.

This pass should remain tightly scoped to cargo-pad presentation and reshuffle-mode display.

---

## 1. Read repository guidance first

Before editing, inspect the repository and relevant guidance, including as applicable:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Also inspect the current implementations of:

```text
CargoPadsEditor.tsx
CargoPadsEditor.css
CargoPadEditor.tsx
CargoPadEditor.css
current reshuffle-mode handle rendering
cargo-pad reorder logic
drag/drop behavior
expanded/collapsed cargo-pad layout
```

Preserve all current cargo-pad semantics and reorder behavior.

---

## 2. Design intent

The previous visual-language pass intentionally removed visible full `Pad 1 / Pad 2 / Pad 3` labels from cargo-pad summaries because they consumed too much space and duplicated information.

That decision still stands.

This pass introduces only a **minimal ordinal gutter**.

Conceptually:

### Locked mode

```text
[1] [ cargo pad summary line 1      ]
    [ cargo pad summary line 2      ]
    [ ----------------------------- ]
    [                               ]
    [ - expanded editor content   - ]
    [                               ]
```

### Reshuffle mode

```text
[☰] [ cargo pad summary line 1      ]
    [ cargo pad summary line 2      ]
    [ ----------------------------- ]
    [                               ]
    [ - expanded editor content   - ]
    [                               ]
```

The number and drag handle occupy the same reserved gutter.

---

## 3. Core behavior

### Locked / normal mode

For each cargo pad, display its current one-based ordinal:

```text
1
2
3
...
```

The ordinal is determined from the pad's current position in the displayed cargo-pad order.

Do not use the persisted cargo-pad ID for display.

Do not store the ordinal in network state.

### Reshuffle mode

Replace the ordinal with the existing drag handle.

The drag handle should continue to work exactly as it does now.

Do not show both ordinal and drag handle at the same time.

---

## 4. Ordinal semantics

The displayed number is a **current positional locator**, not cargo-pad identity.

Important consequences:

- after reshuffling, the numbers update to match the new display order;
- the same cargo pad may therefore display a different ordinal after a reorder;
- this is intentional;
- stable identity remains the existing `cargoPadId`.

This distinction is important for future validation navigation:

```text
ValidationIssue stores cargoPadId
UI resolves cargoPadId -> current cargo-pad ordinal
UI displays "Pad {n}"
```

Do not alter validator structures or validation UI in this pass.

---

## 5. Gutter layout

Add a narrow fixed-width gutter at the left edge of each cargo pad.

Requirements:

- same width in locked and reshuffle modes;
- same width in collapsed and expanded states;
- cargo-pad content should not horizontally jump when mode changes;
- gutter should align with the pad's first summary row;
- expanded content should preserve the same content-column alignment beneath the summary.

The gutter should feel like an integrated technical locator strip, not a separate card.

Suggested width should be minimal and tuned visually; roughly enough for:

```text
1–2 digits
or
the existing drag handle
```

Do not materially widen the overall Cargo Pads region unless absolutely necessary.

---

## 6. Ordinal typography

Preferred treatment:

```text
IBM Plex Mono
small
quiet
technical
muted
```

The ordinal should be subordinate to:

- remote outpost name;
- `[INT]` marker;
- cargo resource/product tokens;
- expanded editor controls.

Do not bold it heavily.

Do not use oversized text.

---

## 7. Ordinal visual treatment

Do **not** make the ordinal look like:

```text
a button
a badge
a pill
a boxed control
```

Preferred:

```text
plain text in the gutter
possibly centered horizontally
muted Primary/Muted text
```

A very subtle vertical rule between gutter and content is acceptable if it helps the structure read clearly.

If a separator is used:

- use existing Rule/border color;
- keep it thin;
- avoid heavy boxing.

No new design token should be necessary.

---

## 8. Drag handle treatment

In reshuffle mode, the existing drag handle should occupy the ordinal's place in the gutter.

Preserve:

- current drag semantics;
- current drag cursor behavior;
- current keyboard/move controls;
- current reorder logic;
- current insertion behavior.

Do not redesign the handle itself beyond any minimal alignment needed to fit the gutter.

The key visual relationship should be:

```text
locked:    ordinal locator
reshuffle: reorder affordance
```

---

## 9. Expanded view behavior

The ordinal/handle gutter must remain visible when the pad is expanded.

Do not:

- hide the ordinal in expanded view;
- move it into the editor header;
- duplicate it elsewhere;
- reintroduce a full `Pad N` title.

The expanded editor should remain visually subordinate to the summary and preserve its existing control order.

---

## 10. Collapsed view behavior

The collapsed summary should retain the layout established in Visual Language Pass 2.

Preserve:

```text
row 1:
left  = disclosure / [INT] area as currently implemented
right = linked remote outpost or Unlinked

row 2:
left  = outbound items
right = inbound items
```

The new ordinal gutter sits to the left of this existing content.

Do not collapse the summary into one row.

Do not reintroduce visible `Pad N` text inside the content area.

---

## 11. Responsive behavior

The gutter should remain usable at narrower widths.

Requirements:

- fixed/minimal width;
- no wrapping of the ordinal itself;
- content area should take the remaining width;
- existing Cargo width responsiveness should remain unchanged unless a tiny adjustment is strictly necessary.

If a narrow-width edge case appears, prefer preserving the gutter and allowing existing content behavior rather than hiding the number.

---

## 12. Accessibility

The displayed ordinal is primarily visual presentation.

Do not replace stable accessible naming with the ordinal.

If current cargo-pad accessible labels already include stable or descriptive context, preserve them.

If adding an accessible name for the ordinal itself is useful, it may be something like:

```text
Pad 1
Pad 2
```

but avoid causing duplicate or noisy announcements.

The drag handle must retain its current accessible semantics in reshuffle mode.

---

## 13. No data-model change

Do not modify:

```text
OutpostNetwork schema
cargoPad IDs
cargo link semantics
persistence
import/export format
Undo/Redo semantics
network lifecycle
validation issue schema
```

The ordinal must be derived at render time from current cargo-pad ordering.

---

## 14. No validation changes yet

This pass is a prerequisite for the upcoming validation-panel redesign.

Do **not** yet change validation message text or presentation.

Future validation UI will be able to resolve:

```text
cargoPadId -> current ordinal -> "Pad {n}"
```

This pass only establishes the visible locator in the Cargo Pads UI.

---

## 15. Visual-language constraints

Preserve the established Starfield-inspired application language:

```text
flat
square
pale
technical
dense but legible
minimal boxing
no shadows
```

Do not add:

```text
rounded badges
decorative icons
glow
heavy separators
extra title bars
```

The ordinal gutter should look like a small structural refinement, not a new visual feature.

---

## 16. Interaction-state behavior

### Normal mode

Show ordinal.

### Reshuffle mode

Show drag handle instead of ordinal.

If the app has a transition between these states, do not animate the swap.

The change should be immediate.

No fade/slide animation is needed.

---

## 17. Numbering behavior

Use one-based numbering based on current cargo-pad display order.

Example:

```text
cargoPads array/display order:
pad-A
pad-C
pad-B

display:
Pad 1 -> pad-A
Pad 2 -> pad-C
Pad 3 -> pad-B
```

After reorder:

```text
pad-B
pad-A
pad-C

display:
Pad 1 -> pad-B
Pad 2 -> pad-A
Pad 3 -> pad-C
```

No historical number should be preserved.

---

## 18. Testing requirements

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

### Manual browser smoke tests

Verify:

```text
locked mode shows 1..N ordinals
reshuffle mode replaces numbers with drag handles
content does not shift horizontally when toggling reshuffle mode
collapsed pads align correctly
expanded pads align correctly
ordinals update after reorder
drag/drop still works
move controls still work
insertion behavior still works
cargo links and pad contents remain unchanged
no console warnings/errors
```

Also test:

```text
1 cargo pad
multiple cargo pads
expanded first pad
expanded middle pad
expanded last pad
linked pad
unlinked pad
interstellar pad
regular pad
narrow viewport
wide viewport
```

---

## 19. Visual review checklist

Before completion, confirm:

1. Is the gutter narrow?
2. Does it remain the same width in locked and reshuffle modes?
3. Does content stay aligned when the mode changes?
4. Are ordinals visually quiet?
5. Do ordinals avoid looking like buttons/badges?
6. Does the drag handle sit naturally in the same space?
7. Does expanded content remain aligned?
8. Has the previous compact two-row summary layout been preserved?
9. Are numbers derived from current display order?
10. Do numbers update correctly after reshuffle?
11. Has no cargo-pad identity/data semantics changed?

---

## 20. Deliverable report

When complete, report:

```text
files changed
gutter implementation approach
ordinal derivation method
locked-mode rendering
reshuffle-mode rendering
expanded/collapsed behavior
any width/layout adjustments
accessibility changes, if any
tests/checks run
manual smoke-test results
```

Explicitly state whether:

- cargo-pad persistence changed;
- `cargoPadId` semantics changed;
- reorder behavior changed;
- validation code changed;
- cargo summary content/order changed;
- any out-of-scope visual component changed.

Do not commit or push unless explicitly asked.

---

## 21. Suggested commit message

If accepted:

```text
feat: add cargo pad ordinal gutter
```

---

## 22. Final instruction

Introduce a **small positional locator**, not a return to labelled cargo-pad cards.

The intended result is:

```text
locked mode    = current ordinal
reshuffle mode = drag affordance
```

in one stable, narrow gutter that preserves the compact Cargo Pads design and gives future validator messages a clear human-readable `Pad {n}` reference.
