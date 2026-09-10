# Codex Micro-Correction Brief — Integrate Search Control Into Resource Matrix Rail

## Objective

Apply one final, **visual-only micro-correction** to the existing uncommitted **Search for Items** implementation.

The Search feature is functionally accepted.

The only remaining issue is the vertical integration of the Search field in the **Resource Matrix** heading.

Current state:

- the Search field is now suitably quiet;
- its width is accepted;
- Resource Matrix and Cargo Pads rails are aligned;
- autocomplete layering is fixed;
- Search Results styling is accepted;
- outline dragging is accepted;
- palette position persistence is accepted.

However, the Search control still feels slightly vertically cramped.

The desired result is:

> **Make the Search control slightly taller and visually integrate its bottom edge with the Resource Matrix heading rule, without increasing the total heading height or breaking alignment with Cargo Pads.**

Conceptually:

```text
RESOURCE MATRIX────────────────────────[ Search...    ]
```

The Search control should feel **cut into / seated on the heading rail**, not like a small floating form field sitting above it.

Do not revisit any other Search behavior or styling.

---

# PART A — READ FIRST

Review only the relevant current implementation:

```text
src/ui/components/SearchForItems.tsx
src/ui/components/SearchForItems.css
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
```

Also inspect the current visual relationship between:

```text
Resource Matrix heading
Search control
Resource Matrix bottom heading rule
Cargo Pads heading rail
```

Do not change product/domain logic.

---

# PART B — SETTLED VISUAL GOAL

## 1. Preserve total heading height

The current alignment between:

```text
RESOURCE MATRIX
CARGO PADS
```

is correct and must remain correct.

Do **not** make the Resource Matrix heading taller.

The Search control must fit within the existing heading box.

---

## 2. Increase Search control height slightly

The current Search field feels slightly cramped vertically.

Give the control a small amount of additional breathing room.

Possible adjustments:

```text
height
line-height
vertical padding
icon alignment
```

Use the smallest change that removes the cramped sensation.

Do not return to the oversized first implementation.

---

## 3. Bottom-align the Search control

Instead of centering the Search field vertically within the heading rail, position it lower.

The desired relationship is:

```text
heading title
        \
         horizontal structural rule ───────────────[ Search ]
```

The Search control should visually sit on the same lower datum as the heading's bottom rule.

---

## 4. Integrate the heading rule with the Search control

The key visual effect is:

> **The Resource Matrix heading's bottom border/rule should appear to run directly into the Search control.**

The result should read roughly as:

```text
RESOURCE MATRIX_______________________[Search...    ]
```

rather than:

```text
RESOURCE MATRIX                       [Search...    ]
_______________________________________________
```

or:

```text
RESOURCE MATRIX
                         [Search...    ]
_______________________________________________
```

Implement this using the cleanest CSS structure available.

Possible techniques include:

```text
align-self: end
relative positioning
shared bottom border datum
heading-strip border interrupted by Search control
Search control border-bottom sharing the same rule color/weight
```

Do not add decorative complexity merely to reproduce the ASCII sketch literally.

---

# PART C — VISUAL PRIORITY

## 5. Preserve the current subdued Search styling

The latest Search treatment is accepted because it finally recedes into the UI.

Do not make Search more prominent again.

Keep:

```text
quiet idle background
quiet border
compact monochrome search icon
clear focus state
evidence-based narrow width
```

The field should remain visually subordinate to `RESOURCE MATRIX`.

---

## 6. Avoid a floating-control appearance

The integrated lower position should reduce the sense that Search is a standalone form field placed inside the title bar.

Aim for:

```text
embedded utility
structural integration
flat 2D treatment
```

Avoid:

```text
shadow
raised surface
card-like separation
extra surrounding box
extra vertical rail height
```

---

# PART D — DO NOT CHANGE WIDTH POLICY

## 7. Preserve current width

Do not revisit the evidence-based width calculation.

Keep the accepted width behavior:

```text
comfortable width based on current reference names
narrower than the original implementation
responsive shrink
no hard usability minimum
wrap/shrink before overflow
```

This correction is about vertical geometry only.

---

# PART E — DO NOT CHANGE SEARCH BEHAVIOR

The following are frozen and must remain unchanged:

```text
localized catalogue matching
five-tier ranking
unique remaining match behavior
autocomplete keyboard navigation
/ focus shortcut
Escape priority
Search Results semantics
result flags
live result refresh
result navigation
palette styling
autocomplete styling
palette z-index
autocomplete z-index
outline drag
keyboard palette movement
palette position persistence
network/outpost reset ownership
Undo/Redo integration
localization
ARIA semantics
```

No functional changes are requested.

---

# PART F — RESPONSIVE BEHAVIOR

## 8. Preserve "Adapt before overflowing"

At narrower widths:

- Search may shrink;
- Search may wrap below the title if existing layout rules require it;
- the Matrix table must not become wider because of Search.

Do not use a new hard `min-height`, `min-width`, or other rigid constraint merely to force the desktop arrangement.

---

# PART G — MANUAL VISUAL CHECKS

Check the final result at:

```text
representative normal desktop width
wide desktop
compressed workspace
zoom-equivalent/narrow viewport
```

At representative desktop width verify:

### Heading alignment

```text
Resource Matrix top = Cargo Pads top
Resource Matrix bottom = Cargo Pads bottom
```

The Search correction must not disturb this.

### Search comfort

The Search field should:

```text
no longer feel vertically cramped
remain compact
remain quieter than the heading title
```

### Rail integration

The heading bottom rule should visually meet / continue into the Search control.

The Search control should appear seated on the bottom of the rail.

### Focus

Focus treatment must remain obvious and must not disrupt alignment.

### Autocomplete

Opening autocomplete must still:

```text
align naturally beneath Search
appear above Search Results
remain clickable
```

---

# PART H — TESTING

No new domain tests should be necessary.

Preserve all existing Search tests.

If any current geometry/helper test encodes the Search element's vertical dimensions, update only what is legitimately necessary.

Do not add a DOM testing dependency for this visual correction.

---

# PART I — DOCUMENTATION

Do not update durable documentation unless the existing docs explicitly describe Search's exact vertical geometry.

This is visual polish, not a new UX rule requiring documentation.

Do not modify the audit report under:

```text
docs/audits/
```

---

# PART J — OUT OF SCOPE

Do not:

```text
change Search width policy
change Search contrast except where required for border integration
change Search Results palette styling
change autocomplete styling
change z-index
change dragging
change palette persistence
change Search state
change matching
change localization
change shortcuts
change accessibility semantics
change history
change validation
change Matrix content/layout below the heading
change Cargo Pads
add dependencies
commit
push
```

---

# PART K — VERIFICATION

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Perform the manual visual checks above.

Do not commit or push.

---

# PART L — COMPLETION REPORT

Report:

## Geometry change

Explain exactly what changed in:

```text
Search height
vertical alignment
heading bottom-rule relationship
```

## Heading alignment

Confirm Resource Matrix and Cargo Pads retain the same overall heading height/top/bottom alignment.

## Visual result

Confirm the Search control:

```text
has more vertical breathing room
remains visually subdued
appears integrated into the heading rail
```

## Unchanged behavior

Confirm no Search functionality, palette behavior, matching, localization, history, or keyboard behavior changed.

## Files changed

List all files.

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

Make only this final visual refinement:

> **Slightly increase the Search control's vertical comfort and bottom-align it so the Resource Matrix heading rule visually runs directly into the control, while preserving the existing total heading height, Cargo Pads alignment, subdued styling, and all accepted Search behavior.**
