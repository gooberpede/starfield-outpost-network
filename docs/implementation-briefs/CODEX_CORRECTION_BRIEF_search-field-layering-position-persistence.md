# Codex Correction Brief — Search Field Refinement + Autocomplete Layering + Palette Position Persistence

## Objective

Apply one final, narrowly scoped refinement pass to the existing uncommitted **Search for Items** implementation.

The Search feature itself is accepted.

This correction is limited to three UX details:

1. make the Search field slightly less cramped while preserving Resource Matrix / Cargo Pads heading alignment;
2. reduce the idle visual prominence of the Search control further;
3. ensure autocomplete always layers above the Search Results palette;
4. make current close/reopen palette-position persistence explicit, intentional, and regression-tested.

Do not change Search semantics, matching, result derivation, keyboard behavior, localization behavior, history behavior, drag mechanics, or network/outpost presentation ownership beyond the explicit persistence clarification below.

---

# PART A — READ FIRST

Review the current uncommitted Search implementation, especially:

```text
src/ui/components/SearchForItems.tsx
src/ui/components/SearchForItems.css
src/ui/components/OutpostStatusMatrix.css
src/App.tsx
src/ui/itemSearchPosition.ts
docs/UX-DESIGN.md
```

Also inspect:

```text
current Resource Matrix heading dimensions
Cargo Pads heading dimensions
Search Results z-index
autocomplete/listbox z-index
Context Help z-index
Status Bar z-index
modal z-index
```

Preserve the existing Search architecture.

---

# PART B — SEARCH FIELD HEIGHT

## 1. Current problem

The previous correction successfully restored Resource Matrix / Cargo Pads heading alignment, but the Search control now feels slightly too short/cramped.

The current goal is not:

```text
make Search as short as possible
```

The goal is:

> **Make Search comfortably compact while ensuring it does not increase the established Resource Matrix heading height.**

---

## 2. Increase internal breathing room slightly

Adjust the Search control so text and icon no longer feel vertically squeezed.

Possible adjustments may include:

```text
slightly greater control height
slightly greater line-height
small vertical padding change
small icon/button alignment change
```

Use whichever combination best fits the existing typography.

Do not make the heading rail taller.

---

## 3. Preserve heading alignment

At the representative desktop layout:

```text
Resource Matrix heading top/bottom
Cargo Pads heading top/bottom
```

should remain visually aligned.

The Search control must fit entirely within that established heading rhythm.

Manual verification is required.

---

# PART C — MAKE IDLE SEARCH QUIETER

## 4. Current problem

Even after being narrowed and flattened, the Search control still draws slightly too much attention when idle.

Search should be:

```text
present
discoverable
clearly usable
visually subordinate
```

The eye should still land on:

```text
RESOURCE MATRIX
```

before the Search control.

---

## 5. Reduce idle contrast

Quiet the unfocused/empty Search state further.

Preferred direction:

```text
background closer to surrounding heading surface
softer border/rule
less visual separation between input and heading strip
compact submit control
```

Retain a clear focus state.

Do not:

```text
remove useful focus visibility
make the control illegible
hide the field entirely
add animation
add shadow
```

---

## 6. Review magnifying-glass treatment

Inspect how the magnifying-glass is currently rendered.

If it visually reads as an oversized/emoji-like glyph relative to the compact control, refine it using the lightest existing project-compatible technique.

Preferred characteristics:

```text
monochrome
compact
technical
quiet
```

Do not add an icon dependency.

If the existing glyph already renders consistently and appropriately, leave it alone.

---

# PART D — AUTOCOMPLETE MUST LAYER ABOVE SEARCH RESULTS

## 7. Current bug

When Search Results is already open and the user starts typing a new query, the autocomplete list may appear underneath the Search Results palette.

This is wrong.

Autocomplete is the user's current interaction surface and must remain visible above Search Results.

---

## 8. Layering rule

Use this priority:

```text
normal app content
    <
Search Results palette
    <
Search autocomplete/listbox
    <
higher-priority utility surfaces if currently designed that way
    <
modals
```

Coordinate with current z-index values rather than choosing arbitrary extremes.

The autocomplete should always appear above Search Results even when overlapping it.

---

## 9. Preserve modal priority

Do not allow autocomplete to rise above modal/backdrop layers.

Do not change modal z-index.

Do not globally restructure stacking contexts unless necessary.

---

## 10. Check portal/stacking behavior

Confirm whether autocomplete and Search Results are:

```text
inside normal DOM flow
portaled
inside distinct stacking contexts
```

Fix the actual stacking cause, not just a lucky screenshot case.

Manual test:

```text
open Search Results
move it beneath/near Search field
type new query
autocomplete opens
autocomplete remains fully visible above palette
```

---

# PART E — PALETTE POSITION PERSISTENCE AFTER CLOSE

## 11. Make current behavior intentional

Current behavior:

```text
user moves Search Results palette
user closes palette
user performs a new search in the same network
palette reopens at the previously moved position
```

Keep this behavior.

It is useful because a user who moved the palette to avoid covering important content should not have to reposition it after every search.

---

## 12. Clarify presentation ownership

Treat:

```text
palette open/closed state
```

and:

```text
palette position
```

as separate presentation concerns.

Intended rule:

```text
closing Search Results
    -> closes the palette
    -> DOES NOT discard palette position

new successful search in same network
    -> reopens at last committed position

outpost navigation in same network
    -> preserves position

new submitted item in same network
    -> preserves position

network/lifecycle boundary
    -> discards position
```

Network/lifecycle reset behavior remains exactly as currently implemented.

---

## 13. Do not persist beyond the network Search session

Do not persist palette position to:

```text
NetworkCollection
history
import/export JSON
browser preferences
gameplay localStorage
```

It remains session-only network-local presentation state.

---

# PART F — DRAGGING

## 14. Preserve outline dragging exactly

Do not change the recently corrected drag model.

Keep:

```text
pointer drag moves lightweight outline only
real palette remains stationary
final committed position updates once on release
pointer cancel does not commit
keyboard movement remains immediate
```

The current drag performance improvement is accepted.

---

# PART G — AUTOCOMPLETE / RESULT INTERACTION

## 15. Preserve draft/submitted separation

When Search Results is open and the user starts typing another query:

```text
autocomplete may open/change
existing submitted Search Results remain unchanged
```

Autocomplete appearing above the palette must not change submission semantics.

---

## 16. Preserve Escape hierarchy

Keep:

```text
modal first
autocomplete second
Search Results third
```

Layering changes must not alter Escape behavior.

---

# PART H — RESPONSIVE BEHAVIOR

## 17. Preserve evidence-based Search width

Do not undo the current evidence-based width work.

Keep the Search field:

```text
narrower than original
comfort/max width based on reference-data names
min-width: 0 or equivalent responsive flexibility
able to shrink/wrap
```

This parcel adjusts height/contrast, not width policy.

---

## 18. Check compressed layouts

Verify at:

```text
wide desktop
representative desktop
compressed workspace
browser zoom
```

that:

- Search remains usable;
- heading alignment remains intact where side-by-side rails are visible;
- Search can still shrink/wrap without widening the Matrix scroller.

---

# PART I — TESTING

## 19. Preserve all existing Search tests

All current Search tests must continue passing.

---

## 20. Add focused persistence coverage

Add or strengthen tests for:

```text
move palette
close palette
reopen via new successful search
same committed position is retained
```

Also confirm:

```text
network reset/change still discards position
```

If this behavior is currently covered only indirectly, make it explicit.

---

## 21. Add layering coverage where practical

If z-index/state can be checked through existing pure/component seams without adding a new test dependency, add focused coverage.

Do not add a DOM test dependency solely to assert CSS stacking.

Manual browser verification is acceptable for the overlap behavior.

---

# PART J — MANUAL BROWSER CHECKS

## Search field

Verify:

```text
slightly more vertical breathing room than current version
no cramped sensation
Resource Matrix / Cargo Pads heading alignment preserved
idle control less visually dominant
focus state still clear
magnifying-glass remains legible but quiet
```

---

## Autocomplete layering

Test:

```text
open Search Results
move palette under/near Search input
type a new query
autocomplete opens above palette
all options remain readable/clickable
```

Repeat after dragging palette to different positions.

---

## Palette persistence

Test:

```text
move palette
close palette
run new search
palette reopens in last committed position
```

Then verify:

```text
switch outpost -> position preserved
switch network -> position discarded/reset
```

---

## Regression

Confirm:

```text
outline drag still smooth
keyboard palette movement still works
autocomplete keyboard behavior unchanged
Escape priority unchanged
new submission still preserves palette position
live result refresh unchanged
```

---

# PART K — DOCUMENTATION

## 22. Update durable UX docs

Update `docs/UX-DESIGN.md` only if needed to make the intended position lifecycle explicit.

Durable rule should be concise:

> Search Results visibility may close independently of its network-local position; reopening Search Results within the same network reuses the last committed position, while network/lifecycle resets discard it.

If Search visual styling is documented, keep wording principle-based:

> Search remains visually subordinate to the Resource Matrix heading.

Do not add pixel-specific implementation notes.

---

# PART L — OUT OF SCOPE

Do not:

```text
change Search matching
change autocomplete ranking
change result flags
change result wording
change live result derivation
change result navigation
change localized catalog behavior
change / shortcut
change Escape priority
change history reset architecture
change drag-outline mechanics
change evidence-based width policy
add dependencies
add shadows
add animation
redesign Search Results
commit
push
```

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

Perform the manual browser checks above.

Do not commit or push.

---

# PART N — COMPLETION REPORT

Report:

## Search field refinement

Explain:

```text
what height/line-height/padding changed
how heading alignment was preserved
what idle visual contrast was reduced
whether magnifying-glass rendering changed
```

## Layering

Report final relevant z-index/stacking relationship for:

```text
Search Results
autocomplete
Context Help / other nearby layers
modals
```

Confirm autocomplete always appears above Search Results.

## Palette persistence

Confirm:

```text
close does not discard position
new search in same network reuses position
outpost navigation preserves it
network reset discards it
```

## Dragging

Confirm outline drag behavior remained unchanged.

## Tests

List focused new/updated coverage.

## Files changed

List all changed files.

## Verification

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

Apply only this final refinement:

> **Give the Search field slightly more vertical breathing room while keeping the Matrix/Cargo heading rails aligned; make the idle Search control quieter; ensure autocomplete always layers above Search Results; and intentionally preserve the last committed palette position when Search Results is closed and reopened within the same network.**
