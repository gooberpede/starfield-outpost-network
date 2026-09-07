# Codex Implementation Brief — Visual Language Pass 5: Planned Supply

## Objective

Implement the **fifth visual-language pass** for `starfield-outpost-network`, focused on the `Planned Supply` section.

Planned Supply is a deliberately subordinate, transitional workspace: it represents items the outpost is intended to have available, but which are not yet realised through local production or imports.

The redesign should:

- separate Planned Supply more clearly from the Matrix above;
- make the expanded area read as one coherent staging catalogue;
- preserve inorganic family-tree structure and vertical rarity order;
- give Special/Everywhere resources such as He-3 and H2O an intentional treatment;
- place Organic Resources and Manufactured Products side by side at normal desktop widths;
- stack those two groups responsively when space is insufficient;
- make inorganic family groups distribute across available center-pane width without losing family associations;
- make the collapsed summary category-aware so wrapping does not mix resource types;
- handle sparse category combinations without blank gaps;
- add modest bottom clearance above the fixed StatusBar;
- preserve all existing Planned Supply semantics and behavior.

This is a **visual/layout pass**, not a domain redesign.

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
Planned Supply disclosure
collapsed selected-item summary
expanded catalogue
inorganic family trees
organic catalogue
manufactured-products catalogue
three-state item controls
workspace/footer clearance
```

Preserve the current semantic model and selection logic.

---

## 2. Hard scope boundary

### In scope

Visual and tightly scoped layout changes for:

```text
Planned Supply heading / disclosure
separation from Matrix
expanded Planned Supply surface
Special/Everywhere inorganic-resource treatment
inorganic family-group spacing
Organic Resources layout
Manufactured Products layout
collapsed selected-item summary
bottom spacing above StatusBar
```

Small markup changes are acceptable where needed for category-aware wrappers or responsive layout containers.

### Out of scope

Do **not** redesign:

```text
TitleBar
PageHeader
StatusBar
Outpost Header
Navigation pane
Resource Matrix
Cargo Pads
validation
network lifecycle
resource-domain rules
Planned Supply state semantics
```

Do not change how Planned Supply contributes to availability.

Do not change which items are selectable, available, or already supplied.

Do not change resource identities, rarity, or family assignments.

---

## 3. Conceptual role

Planned Supply is a **staging / transitional area**, not part of the realised operational core in the same way as Matrix/Cargo.

Target character:

```text
subordinate
intentional
compact
technical
quiet
```

It should feel closer to the operational workspace than Navigation, but clearly more peripheral than `RESOURCE MATRIX` and `CARGO PADS`.

Do not literalise the “basement” metaphor with dark styling.

Use spacing, tone, and subdued structure instead.

---

## 4. Separation from the Matrix

The current collapsed heading sits too close to the Matrix/Imports section.

Increase visual separation modestly.

Preferred treatment:

- slightly more top spacing;
- a fine horizontal rule or subtle tonal transition;
- a quieter structural heading than Matrix/Cargo;
- no full-width dark bar.

The goal is to make Planned Supply feel like a distinct lower-level region rather than something revealed immediately beneath the last matrix row.

Do not add excessive vertical padding.

---

## 5. Heading / disclosure

Keep current disclosure behavior.

Restyle the heading in the existing visual language:

```text
PLANNED SUPPLY
```

Use:

- Barlow Semi Condensed;
- restrained structural emphasis;
- square disclosure control;
- no full Structural-dark fill.

It should be clearly labelled but visually subordinate to Matrix/Cargo headings.

---

## 6. Expanded surface

When expanded, Planned Supply should read as **one coherent staging catalogue**.

Preferred treatment:

- subtle pale tinted background using existing `--ui-*` tokens;
- square / flat geometry;
- no rounded card;
- no heavy enclosing border;
- no large shadow;
- enough internal spacing to clarify group boundaries;
- no individual card boxes around Inorganic, Organic, and Manufactured.

The expanded surface should unify the three domains without erasing their distinctions.

---

## 7. Preserve three-state control semantics

Preserve the existing Planned Supply three-state model:

```text
neutral/selectable
selected/planned
available-but-not-selectable
```

Do not convert it to binary behavior.

Carry the current visual-language direction forward:

- selected should be decisive;
- neutral should clearly read as interactive;
- available-but-not-selectable should remain legible but subdued;
- keyboard focus must remain clear;
- state meaning must not rely on color alone.

Do not change interaction semantics.

---

## 8. Typography

Use the established typography:

```text
Barlow Semi Condensed
IBM Plex Mono
```

Use Barlow Semi Condensed for headings and descriptive labels.

Use IBM Plex Mono for resource/product abbreviations and compact catalogue codes.

Do not spread mono into ordinary prose.

---

## 9. Special / Everywhere inorganic resources

He-3 and H2O sit outside the inorganic family trees and currently look visually ad hoc.

Treat them as an intentional **special strip** above the family trees.

Approved direction:

- keep existing button size;
- do not widen these buttons merely to distinguish them;
- do not add an extra textual heading unless clearly necessary;
- use a subtle strip/surface treatment behind the group;
- preserve the same three-state control grammar as other Planned Supply items;
- provide enough spacing to make the grouping feel deliberate.

The special strip should communicate that these resources belong to Inorganic Planned Supply but not to the family-tree grid below.

Do not invent new game semantics or labels.

---

## 10. Inorganic family trees

The inorganic catalogue contains meaningful family-tree structure.

This structure must be preserved.

Core rule:

> **Preserve the internal geometry of each family; distribute spare horizontal space between families.**

Do not stretch individual buttons to fill the row.

Do not scramble family associations.

Do not reorder rarity levels.

Do not turn the full catalogue into a generic wrapping button cloud.

### Responsive spacing

At wider center-pane widths:

- distribute family groups more evenly across available width;
- reduce the large unused right-side gap;
- preserve family grouping and vertical rarity structure.

At narrower widths:

- move family groups closer together;
- wrap whole family groups only when necessary;
- preserve each group's internal geometry.

Prefer CSS Grid/Flex or equivalent responsive layout over manually tuning many `rem` values by viewport.

---

## 11. Preserve rarity vertically

Expanded catalogue rarity order is:

```text
Common
Uncommon
Rare
Exotic
Unique
```

from top to bottom.

This is semantically meaningful and must remain intact for:

```text
inorganic family trees
organic resources
manufactured products
```

Do not use a masonry/fill layout that moves items between rarity rows.

---

## 12. Organic Resources + Manufactured Products

At normal desktop widths, place these two catalogue groups **side by side**.

Goal:

- reduce excessive vertical height;
- preserve each catalogue's compact rarity matrix;
- keep lookup/scanning easy;
- create a balanced lower portion of Planned Supply.

Conceptually:

```text
ORGANIC RESOURCES       MANUFACTURED PRODUCTS
[compact rarity grid]   [compact rarity grid]
```

Do not stretch either catalogue across the full center-pane width.

Their compact footprints are desirable.

### Responsive fallback

When the center pane becomes too narrow, stack them vertically again.

Choose the breakpoint based on actual fit.

Do not compress buttons until labels become difficult to read merely to preserve side-by-side layout.

---

## 13. Organic catalogue

Preserve:

- current item order;
- rarity rows;
- compact button sizing;
- state behavior.

Do not spread Organic Resources evenly across the full center pane.

---

## 14. Manufactured Products catalogue

Preserve:

- current item order;
- rarity rows;
- compact button sizing;
- state behavior.

Do not spread Manufactured Products to full width.

Exact symmetry with Organic is not required because counts differ.

---

## 15. Expanded internal hierarchy

Preferred expanded composition:

```text
PLANNED SUPPLY

INORGANIC RESOURCES
    Special/Everywhere strip
    inorganic family trees

ORGANIC RESOURCES       MANUFACTURED PRODUCTS
    rarity grid             rarity grid
```

Use shared subsection-heading grammar.

Do not wrap each domain in a heavy box.

Prefer:

```text
spacing
fine rules
subtle surface changes
aligned headings
```

over nested panels.

---

## 16. Collapsed summary — category-aware clustering

The current collapsed summary globally wraps selected items and loses category identity when wrapping.

Redesign it so selected items are grouped into category-aware clusters:

```text
Inorganic cluster
Organic cluster
Manufactured cluster
```

Each category cluster should be its own internal wrapping container.

The outer summary should lay out only non-empty category clusters.

Requirements:

- items from one category wrap within that category;
- items from one category must not visually interleave with another after wrapping;
- empty categories must not reserve blank columns or space;
- summary remains compact;
- no rarity encoding is needed in collapsed mode.

---

## 17. Collapsed summary — sparse cases

The layout must look intentional for any subset of categories.

Test at least:

```text
only Inorganic
only Organic
only Manufactured
Inorganic + Organic
Inorganic + Manufactured
Organic + Manufactured
all three
```

Important:

> If Inorganic and Manufactured are selected but Organic is empty, do not leave an empty middle column/gap.

Only non-empty category containers should participate in layout.

---

## 18. Collapsed summary — small and large selections

The collapsed layout should remain stable with:

```text
2 selected items
3 selected items
several items in one category
many items across all categories
20+ selected items
```

Avoid:

```text
awkward orphan buttons
huge unexplained gaps
category interleaving
inconsistent left alignment
```

Category clusters may themselves wrap to additional rows.

---

## 19. Collapsed category separation

Keep category separation subtle.

Possible treatments:

- slightly larger gap between category clusters than between buttons inside a cluster;
- very faint cluster tint;
- subtle left rule;
- spacing only.

Do **not** automatically add visible category labels in the collapsed summary.

The collapsed view should remain terse.

If spacing alone preserves grouping, prefer that.

---

## 20. Bottom clearance above StatusBar

The current Planned Supply content can sit hard against the fixed StatusBar.

Add a small amount of bottom breathing room so the final button row does not visually collide with the footer.

Requirements:

- modest only;
- enough to separate content from StatusBar;
- no large dead zone;
- apply cleanly in collapsed and expanded states where relevant.

Do not alter StatusBar positioning or redesign it.

---

## 21. Navigation-height issue is deferred

The Navigation pale rail may stop before the footer when Planned Supply makes the center column taller.

This is acknowledged but **not part of this pass**.

Do not modify Navigation height/layout unless an unavoidable shared-layout issue appears.

Report any such issue instead.

A dedicated workspace-height correction can follow later.

---

## 22. Density guardrails

Do not solve Planned Supply by shrinking controls.

Preserve current compact control sizes unless a tiny consistency adjustment is needed.

Prefer:

```text
better grouping
responsive spacing
side-by-side composition
removal of wasted space
```

over miniaturisation.

Do not add generous modern-web padding.

---

## 23. Geometry and borders

Continue the established language:

```text
square / near-square
flat
minimal shadow
sparse boxing
thin technical rules
pale surfaces
```

Avoid:

```text
rounded cards
individual subsection panels
heavy borders
drop shadows
dark-theme treatment
```

The expanded Planned Supply region should feel unified without becoming a card.

---

## 24. Dark structural color

Do not use Structural dark as a large Planned Supply background.

This region is subordinate.

Structural dark may appear in:

```text
selected controls
focus
small accents
```

but should not turn Planned Supply into another operational-core pane.

---

## 25. Responsive behavior

The redesigned layout should respond to the **center pane width**, not just the full browser window.

Key expectations:

### Inorganic
- family groups redistribute horizontally;
- internal family geometry remains fixed;
- no arbitrary unused right-side gap at normal widths.

### Organic + Manufactured
- side-by-side when both fit comfortably;
- stack when they do not.

### Collapsed summary
- category clusters flow compactly;
- each cluster wraps internally;
- no empty category tracks.

Avoid many viewport-specific magic numbers.

---

## 26. Preserve behavior

Do not change:

```text
click behavior
planned/unplanned state
available-but-not-selectable behavior
actual availability derivation
cargo-export eligibility
manufacturing/farming input semantics
Undo/Redo
persistence
validation
```

This is a visual/layout pass only.

---

## 27. Accessibility / focus

Retain or improve:

- visible keyboard focus;
- readable unavailable states;
- usable hit areas;
- non-color-only state distinction.

Do not remove semantic button behavior.

Do not use `pointer-events: none` if that would change current keyboard/accessibility behavior.

---

## 28. No mini-matrix in collapsed mode

The collapsed view does **not** need:

```text
rarity rows
family trees
subsection matrices
```

Its purpose is simply:

> show what has been planned, compactly, while preserving category grouping.

Expanded and collapsed states deliberately have different layout priorities.

---

## 29. Visual review checklist

Before completion, assess:

1. Does Planned Supply feel intentionally separated from the Matrix?
2. Does the expanded region read as one coherent staging area?
3. Do He-3/H2O look deliberately placed rather than tacked on?
4. Are inorganic family associations preserved?
5. Does inorganic spacing respond to center-pane width?
6. Are rarity rows still Common → Unique top to bottom?
7. Do Organic and Manufactured sit comfortably side by side at normal widths?
8. Do they stack cleanly when narrow?
9. Does the collapsed summary preserve category clustering when wrapping?
10. Do empty categories disappear without blank gaps?
11. Does the collapsed summary look good with 2, 3, and 20+ selected items?
12. Is there modest clearance above the StatusBar?
13. Has control size/density remained compact?
14. Has Planned Supply avoided heavy boxes and dark stripes?

---

## 30. Verification

Run appropriate checks, at minimum where available:

```text
npm test
npm run lint
npm run build
git diff --check
```

Report pre-existing failures separately.

### Manual browser smoke tests

Test expanded Planned Supply with:

```text
Special/Everywhere resources
multiple inorganic families
organic resources
manufactured products
selected/planned items
available-but-not-selectable items
```

Test widths sufficient to observe:

```text
wide inorganic distribution
narrower family spacing
Organic + Manufactured side-by-side
Organic + Manufactured stacked fallback
```

Test collapsed summary with:

```text
only Inorganic
only Organic
only Manufactured
Inorganic + Manufactured, no Organic
all three categories
2 items
3 items
many items
20+ items
```

Verify:

- no semantic behavior changes;
- no category interleaving after wrap;
- no phantom empty-category gaps;
- no unexpected horizontal overflow;
- footer clearance is present;
- collapse/expand behavior is unchanged;
- Undo/Redo remains unchanged.

---

## 31. Deliverable report

When complete, report:

```text
files changed
heading / separation changes
expanded-surface changes
Special/Everywhere treatment
inorganic family-layout changes
Organic layout changes
Manufactured layout changes
responsive breakpoint / behavior
collapsed-summary clustering changes
bottom-clearance changes
tokens added/changed, if any
tests/checks run
manual smoke-test results
unexpected inherited effects
```

Explicitly state whether:

- any out-of-scope component changed visually;
- rarity order changed;
- any Planned Supply semantics changed;
- Navigation-height issue was left untouched;
- new horizontal overflow was introduced.

Do not commit or push unless explicitly asked.

---

## 32. Suggested commit message

If accepted:

```text
feat: restyle planned supply
```

---

## 33. Final instruction

The purpose of this pass is to make Planned Supply feel like a **deliberate staging catalogue** rather than three unrelated button groups stacked beneath the Matrix.

Preserve the information structure that already works.

Prefer:

```text
coherent grouping
responsive use of width
compactness
rarity/family preservation
clear state semantics
subordinate visual hierarchy
```

over decorative redesign or generic web-card layout.
