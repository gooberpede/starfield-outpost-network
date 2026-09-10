# Codex Correction Brief — Search UI Quietness + Outline Dragging + Evidence-Based Field Width

## Objective

Apply one narrow correction pass to the existing uncommitted **Search for Items** implementation.

Do **not** change Search semantics, matching, result derivation, localization behavior, keyboard shortcuts, presentation ownership, or history integration.

The correction is limited to:

1. reducing the visual prominence and height of the Search field;
2. narrowing the Search field based on actual localized reference-item lengths rather than an arbitrary width;
3. restyling the Search Results palette to fit the app's flat 2D visual language;
4. replacing live full-palette dragging with a lightweight outline-drag interaction.

The Search feature itself is otherwise accepted.

---

# PART A — READ FIRST

Review the current uncommitted Search implementation, especially:

```text
src/ui/components/SearchForItems.tsx
src/ui/components/SearchForItems.css
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
src/App.tsx
src/ui/itemSearchPosition.ts
```

Also inspect:

```text
current Resource Matrix heading height/rhythm
Cargo Pads heading alignment
existing flat panel/title-strip styles
Planned Supply / navigation / matrix structural strips
current reference resources/products
localized reference-name resolution
en-US / en-GB display names
```

Do not revisit accepted Search architecture.

---

# PART B — SEARCH FIELD HEIGHT / TITLE ALIGNMENT

## 1. Preserve the pre-Search heading height

The Search control must fit within the established Resource Matrix heading rhythm.

Current problem:

> The Search field has increased the height of the Resource Matrix heading strip, pushing the matrix down and breaking the visual alignment with the Cargo Pads title.

Corrective rule:

> **The Search control must fit inside the pre-existing Resource Matrix heading height rather than making that heading taller.**

Reduce as needed:

```text
input vertical padding
submit-button minimum height
button padding
line-height
border/presentation weight
```

Do not shrink text below the app's normal compact-control readability.

---

## 2. Restore visual alignment

At ordinary desktop layout, the top rhythm should again read as aligned:

```text
RESOURCE MATRIX        CARGO PADS
```

The search control must not create a taller left heading rail.

Check this manually at the representative desktop width used in the screenshots.

---

# PART C — MAKE THE SEARCH FIELD VISUALLY QUIET

## 3. Search should recede when idle

The Search control is a utility, not a primary action.

Desired character:

```text
quiet
compact
low-contrast
integrated into heading strip
clearly usable when noticed
not visually dominant when idle
```

Reduce the current "raised form control" appearance.

Prefer:

```text
pale/flat surface
quiet rule/border
minimal contrast change
compact magnifying-glass control
```

Avoid:

```text
shadow
glow
heavy border
large filled button
high-contrast idle chrome
```

Focused/active state may become clearer through the existing focus language.

---

# PART D — EVIDENCE-BASED SEARCH FIELD WIDTH

## 4. Inspect actual localized reference-item lengths

Do not choose a new width arbitrarily.

Inspect the complete current localized Search catalogue:

```text
all resources
all manufactured products
en-US display names
en-GB display names
```

Identify:

```text
longest visible localized resource/product name
its character length
its approximate rendered width using the actual Search input typography
```

Report the longest current examples in the completion report.

---

## 5. Add a modest localization allowance

Use the current longest localized item as evidence for a comfortable width, then add a small allowance for future locale expansion.

Target approximately:

```text
10–20% beyond the current longest visible item
```

This is a design allowance, not a guarantee for all future languages.

Do not engineer speculative multilingual worst cases.

---

## 6. Treat width as comfort, not a hard minimum

The evidence-based width should become a:

```text
preferred/default width
or max-width
```

not a rigid `min-width` that forces layout expansion.

Preserve the project rule:

> **A hard min-width is a usability claim. Adapt before overflowing.**

The Search control should:

```text
use the evidence-based comfortable width when space permits
shrink when the heading becomes constrained
wrap beneath RESOURCE MATRIX when needed
never widen the Matrix table/scroller
```

The placeholder does not need to remain fully visible at every constrained width.

Keep the magnifying-glass control compact and stable.

---

# PART E — SEARCH RESULTS PALETTE VISUAL STYLE

## 7. Remove shadow

Remove the Search Results palette shadow.

The current shadow is inconsistent with the project's established flat 2D visual language.

Also remove any Search autocomplete shadow if present for the same reason.

Do not replace shadows with glow.

---

## 8. Quiet the palette title bar

Current issue:

> The dark high-contrast title bar makes Search Results look more like a modal/alert than a lightweight utility panel and reduces title legibility.

Restyle the title bar to fit the app's pale structural language.

Preferred direction:

```text
pale/light structural strip
dark readable text
thin rule/border
compact uppercase title
quiet close button
```

A modest structural marker such as a dark left rule is acceptable if useful.

Do not use a large dark filled header unless there is a compelling existing app precedent.

---

## 9. Keep the palette clearly non-modal

The palette should feel like:

```text
a movable technical utility panel
```

not:

```text
dialog
alert
card
floating OS window
```

Keep:

```text
square/near-square geometry
flat surfaces
thin structural rules
no shadow
no glow
no rounded floating-card treatment
```

Do not change its non-modal interaction semantics.

---

# PART F — POINTER DRAG PERFORMANCE

## 10. Stop moving the real palette on every pointermove

Current behavior updates App-owned palette position continuously during drag.

This causes the real palette and its contents to move/re-render on each pointer event and feels sluggish.

Replace this behavior.

---

## 11. Use an outline-drag interaction

On pointer drag, use a lightweight outline/ghost rectangle.

Preferred behavior:

```text
pointerdown on title-bar drag area
    -> capture current real palette bounds/position
    -> show lightweight outline at current position

pointermove
    -> move ONLY the outline
    -> clamp outline to safe viewport
    -> do NOT update App-owned committed palette position
    -> do NOT move/re-render the real palette contents

pointerup
    -> commit the final outline position ONCE
    -> real palette moves to final location
    -> remove outline

pointercancel
    -> remove outline
    -> keep or restore original committed position
```

An **outline** is preferred over a translucent duplicate because it is cheaper and fits the technical flat aesthetic.

---

## 12. Keep drag state local/transient

Transient pointer-drag position should remain local to the Search/palette component.

Do not put every drag frame into `App.tsx`.

Only committed final palette position belongs in the existing App-owned Search presentation state.

This preserves:

```text
outpost-navigation position
new-search submission position
network-reset behavior
```

without causing whole-app state churn during drag.

---

## 13. Reuse existing clamping logic

Continue to use the existing safe viewport/status-bar clamp semantics.

Prefer one shared pure clamp helper for:

```text
outline pointer movement
final committed position
keyboard movement
resize/zoom recovery
```

Do not create different geometry rules for outline vs committed palette.

---

## 14. Keyboard movement remains immediate

Do not convert keyboard palette movement to outline dragging.

Arrow / Shift+Arrow movement is discrete and may continue committing immediately.

Preserve existing keyboard-accessible movement behavior.

---

# PART G — RESIZE OBSERVER / POSITION UPDATES

## 15. Avoid unnecessary App position writes

Inspect any `ResizeObserver` or size-change logic.

Preserve the requirement that the palette remains recoverable/clamped when its size changes, but avoid redundant App-state writes when the clamped position has not actually changed.

If practical:

```text
compare old vs clamped position
only commit when different
```

Do not over-engineer.

---

# PART H — AUTOCOMPLETE STYLE

## 16. Keep autocomplete visually related but quiet

The autocomplete list may remain directly attached below the Search field.

Remove shadow if currently used.

Use flat border/rule treatment consistent with other app controls.

Do not redesign autocomplete behavior.

---

# PART I — UNCHANGED FUNCTIONAL BEHAVIOR

Do not change any of the following:

```text
active-network-only scope
localized reference matching
five-tier ranking
unique remaining match behavior
stable type+ID identity
Search Results wording/count
result flag semantics/order
PRESENT Matrix-equivalent rule
live result refresh
clickable outpost navigation
draft/submitted separation
/ shortcut
autocomplete keyboard behavior
Escape priority
locale-switch behavior
network/outpost reset ownership
Undo/Redo behavior
ARIA combobox/listbox semantics
non-modal role/accessible naming
keyboard palette movement
```

This correction is visual/performance only.

---

# PART J — TESTING

## 17. Preserve all existing Search tests

All current Search behavior tests must continue passing unchanged unless a CSS/geometry test legitimately needs updating.

---

## 18. Add or update focused geometry/drag tests

Where pure helpers permit, cover:

```text
transient outline position clamps correctly
committed position changes only on drag completion
pointer cancel does not commit unintended movement
keyboard movement still commits normally
resize reclamp does not change position unnecessarily
```

Do not add a DOM testing dependency solely for this correction.

---

# PART K — MANUAL BROWSER CHECKS

Verify:

## Heading/search field

```text
Resource Matrix and Cargo Pads headings visually realigned
Search no longer increases Matrix title-bar height
Search field visibly narrower
idle Search field recedes into background
focus remains obvious
placeholder remains useful
```

Check:

```text
wide desktop
representative normal desktop
compressed layout
zoomed layout
```

---

## Search width evidence

Confirm the chosen comfortable width accommodates the longest current en-US/en-GB reference display name at normal width.

Then confirm the control still shrinks/wraps rather than forcing overflow.

---

## Palette

Verify:

```text
no shadow
title bar is lighter/quieter
title text is clearly readable
palette still visually distinct from underlying matrix
close button remains obvious enough
```

---

## Pointer drag

Verify:

```text
pointerdown shows outline
real palette remains stationary during drag
outline tracks pointer smoothly
pointerup moves real palette once
no sluggish/latency-like feeling
clamping still works
close button does not initiate drag
```

Also test:

```text
new Search submission preserves moved position
outpost navigation preserves moved position
network change resets position
```

---

## Keyboard movement

Verify existing:

```text
Arrow
Shift+Arrow
```

palette movement still works and clamps correctly.

---

# PART L — DOCUMENTATION

## 19. Update docs only if current implementation docs became inaccurate

If `docs/UX-DESIGN.md` or `docs/ARCHITECTURE.md` currently describe:

```text
live palette dragging
shadowed palette
specific Search dimensions
```

update only what is necessary.

Prefer documenting durable principles:

```text
Search is visually subordinate to the Matrix title
palette uses flat non-modal styling
pointer drag uses lightweight transient feedback and commits position on release
```

Do not add implementation trivia if the docs do not need it.

---

# PART M — OUT OF SCOPE

Do not:

```text
change Search result semantics
change catalogue matching
change localization messages
change result flags
change history integration
change presentation reset ownership
change / shortcut behavior
change autocomplete interaction
add dependencies
redesign the Matrix
change Cargo Pads
add animation
add opacity-heavy ghost copies
add shadows elsewhere
commit
push
```

---

# PART N — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Perform the manual browser checks above.

Do not commit or push.

---

# PART O — COMPLETION REPORT

Report:

## Search field sizing evidence

Provide:

```text
longest current en-US reference display name
longest current en-GB reference display name
approximate rendered width or measurement method
chosen comfortable Search width
localization allowance used
```

Explain why the resulting width is a comfort/max target rather than a hard minimum.

## Heading correction

Confirm the Resource Matrix heading no longer grows because of Search and visually aligns with Cargo Pads again.

## Visual treatment

Describe the quieter idle Search styling and flat palette/title/autocomplete treatment.

## Drag implementation

Explain:

```text
where transient outline state lives
how pointer movement updates it
when committed App position is updated
how cancel/clamping work
```

Confirm the real palette does not re-render/move continuously during pointer drag.

## Keyboard movement

Confirm unchanged behavior.

## Files changed

List all files.

## Tests / verification

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

Apply only the agreed refinement pass:

> **Make Search quieter, shorter, and evidence-based in width; restyle Search Results as a flat pale utility panel; and replace expensive live palette dragging with a lightweight clamped outline that commits the real palette position only on release.**
