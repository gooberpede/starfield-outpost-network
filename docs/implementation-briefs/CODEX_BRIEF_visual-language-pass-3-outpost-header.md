# Codex Implementation Brief — Visual Language Pass 3: Outpost Header

## Objective

Implement the **third visual-language pass** for `starfield-outpost-network`, focused on the selected outpost header / constraint strip immediately above the Resource Matrix and Cargo Pads.

This region currently remains visually tied to the old interface language and is now the clearest seam between:

- the already redesigned application shell; and
- the already redesigned operational core.

The goal is to make the Outpost Header feel like a **quiet technical specification strip** that belongs to the same visual system as the new shell and Matrix/Cargo workspace.

The pass should cover:

```text
selected outpost title
System selector
Body selector
Solar indicator
Wind indicator
Biome controls
layout/alignment of the whole outpost constraint strip
```

This is primarily a **visual consistency pass**, not an information-architecture redesign.

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
Outpost Details / selected outpost header
outpost-name editor
System selector
Body selector
Solar/Wind indicators
Biome controls
PageHeader controls
expanded Cargo Pad selectors
global / shell / operational visual tokens
```

Preserve current domain, validation, persistence, Undo/Redo, and selection behavior.

---

## 2. Hard scope boundary

### In scope

Visual and tightly scoped layout work for:

```text
selected outpost title
System selector
Body selector
Solar indicator
Wind indicator
Biome controls
spacing / alignment / grouping of these controls
```

Supporting local token usage and focus-state adjustments are also in scope.

### Out of scope

Do **not** redesign:

```text
TitleBar
PageHeader
StatusBar
Outpost navigation pane
Resource Matrix
Cargo Pads
Planned Supply
network lifecycle controls
validation panel
drag/reorder controls
manufacturing editing controls
```

Do not change the data model.

Do not alter body/biome/resource availability semantics.

Do not change the meaning or behavior of Solar/Wind.

Do not change how selected biomes are persisted.

Do not change outpost-name validation semantics.

---

## 3. Existing visual language is authoritative

This pass should continue the already committed visual language from Pass 1 and Pass 2.

Use the existing semantic `--ui-*` tokens and typography already introduced.

Current palette direction:

```text
Background        #F1F6F4
Surface           #D9E2DD
Panel tint        #B8C8C1
Structural dark   #2A3E3A
Primary text      #2E4440
Muted text        #6E7F7A
Rule / border     #9FAFAA
Highlight         #F7FAF8
Warning           #D4A23F
Critical          #C75452
Shadow            rgba(42, 62, 58, 0.12)
```

Typography direction:

```text
UI / headings     Barlow Semi Condensed
Technical / mono  IBM Plex Mono
```

Do not add a parallel palette or a new unrelated font system.

---

## 4. Intended role of the Outpost Header

The Outpost Header is **important contextual setup**, but not the operational core.

Its job is to communicate:

```text
which outpost is selected
where it is
what planetary/body constraints apply
which biome constraints apply
what passive power conditions exist
```

Once configured, it should recede visually.

The target character is:

> **compact, technical, pale, quiet, and highly legible.**

It should not compete with:

```text
RESOURCE MATRIX
CARGO PADS
```

which remain the stronger operational regions.

---

## 5. Preserve information architecture

Keep the existing basic arrangement and semantics.

Do not reshuffle controls merely for aesthetic reasons.

Preserve the current relationship among:

```text
outpost name
System
Body
Solar
Wind
Biome
```

Small spacing and alignment adjustments are encouraged if they improve coherence.

Do not substantially increase the height of the header.

Do not introduce a new card or panel around the whole region.

---

## 6. Selected outpost title

The current selected outpost title still looks like the old generic page-heading treatment.

Restyle it so it feels like **current-object identity**, not a second application title.

Goals:

- clearly identify the selected outpost;
- remain visually prominent enough to scan immediately;
- remain subordinate to the application identity and operational headings;
- retain its editable nature;
- feel integrated with the constraint strip beneath / beside it.

Preferred direction:

```text
Barlow Semi Condensed
medium-large, but restrained
mixed case
Structural dark / Primary text
square / flat editing treatment
minimal border when not actively editing
clear hover/focus treatment
```

Do not put the outpost name inside a large dark bar.

Do not make it visually louder than `RESOURCE MATRIX` or `CARGO PADS`.

Preserve current edit/blur/Undo behavior.

---

## 7. System and Body selectors

The current System / Body selectors visually differ too much from the selectors in expanded Cargo Pads.

Bring them into the same general control grammar.

Goals:

```text
same font family
same square / near-square geometry
same border language
same focus treatment
same surface family
same control height family where practical
```

They do not need to become pixel-identical if contextual width differs.

Prefer visual consistency with the already redesigned expanded Cargo Pad selects rather than inventing a header-only select style.

Do not change:

```text
available System options
Body filtering
recovery-value handling
settleability rules
selection behavior
```

Unknown/invalid persisted values should continue to remain visible for recovery as currently designed.

---

## 8. Field labels

Labels such as:

```text
System
Body
Solar
Wind
Biome
```

should use the current shell language:

```text
Barlow Semi Condensed
small uppercase or restrained structural case
Muted text or Primary text
slight tracking if consistent with shell labels
```

The labels should provide structure without becoming mini-headings.

Avoid excessive vertical spacing between label and value/control.

---

## 9. Solar / Wind passive indicators

The runtime audit established that Solar/Wind currently rely on a local hybrid style and use native small-control font metrics.

This pass should remove the visual ambiguity.

Solar/Wind should read as:

> **passive technical values, not buttons.**

Preserve the existing qualitative labels:

```text
Solar:
V.Poor
Poor
Norm.
Good
—

Wind:
None
Poor
Norm.
Good
—
```

Do not expose numeric values.

### Preferred visual treatment

- Barlow Semi Condensed or IBM Plex Mono, whichever best matches the technical-value role in the existing operational language;
- pale flat background or subtle inset surface;
- weaker border than interactive controls, or a simple rule treatment;
- no hover affordance;
- no pointer cursor;
- no button-like pressed state;
- fixed width sufficient to prevent layout shift across values;
- same vertical alignment as neighboring selectors / biome controls.

The distinction from interactive controls should be visually obvious.

Do not use browser-native control font matching as the main alignment mechanism if the new design system can provide explicit typography.

---

## 10. Biome controls

Biome buttons remain interactive binary toggles.

They should visually join the new state grammar used elsewhere.

Goals:

```text
clearly interactive
square / near-square geometry
compact
high scanability
clear selected vs unselected state
consistent focus behavior
```

### Unselected

Preferred treatment:

```text
pale / Highlight or Surface background
Primary text
Rule / border
```

### Selected

Use a decisive contrast shift, consistent with the operational-control language:

```text
Structural dark background
Highlight text
Structural dark border
```

Do not communicate selected state only through a subtle border change.

### Focus

Use the established application-owned focus language.

Target:

```text
2px solid Structural dark
consistent offset
```

### Disabled / unavailable / stale

If any such biome state exists in current behavior, preserve semantics and ensure it remains legible.

Do not invent new biome-state semantics.

---

## 11. Biome density and wrapping

The header should remain one-page friendly.

Biome controls should stay compact and should not gain generous modern-web padding.

If biome sets wrap:

- preserve readable spacing;
- keep wrapped rows visually associated with the `Biome` label;
- do not increase header height unnecessarily.

Do not force all biome buttons onto one line at the expense of unreadable compression.

---

## 12. Relationship to PageHeader

The Outpost Header should feel related to the PageHeader but not identical.

Conceptually:

```text
PageHeader      global / network / character context
Outpost Header  selected-object / planetary constraint context
```

Shared visual cues may include:

```text
pale technical surface
Barlow typography
square controls
fine rules
muted uppercase labels
consistent focus
```

The Outpost Header may sit directly on the main workspace background rather than gaining another strong filled band.

Avoid stacking too many large horizontal color blocks.

---

## 13. Relationship to Matrix / Cargo

The Outpost Header should bridge into the operational core without competing with it.

Preferred hierarchy:

```text
Outpost title / constraints      quiet context
RESOURCE MATRIX / CARGO PADS     strong operational anchors
```

Do not add a dark structural bar to every header field.

Do not make the Outpost Header visually heavier than the pane headings below.

A fine bottom rule or careful spacing may be enough to separate it from the operational regions.

---

## 14. Geometry and borders

Continue the established shape language:

```text
square / near-square
flat
minimal shadow
sparse boxing
thin technical rules
```

Avoid:

```text
rounded pills
soft cards
drop shadows
large boxed field groups
```

Interactive controls may use a clear control border.

Passive indicators should use weaker containment.

---

## 15. Spacing and density

Preserve the compactness of the existing header.

Do not solve alignment by adding large gaps or padding.

Prefer:

```text
consistent control heights
better baseline alignment
clear label/value grouping
modest horizontal spacing
minimal vertical waste
```

The header should feel carefully laid out, not spacious.

---

## 16. Selector consistency

One key success criterion is that these controls no longer look like they belong to different applications:

```text
System select
Body select
Cargo destination outpost select
Cargo destination pad select
```

This pass should make System / Body visually consistent with the already redesigned Cargo selector family where possible.

Do not broaden the scope into a full app-wide select primitive unless the necessary shared styling already exists and can be reused safely.

Prefer reuse over duplication.

---

## 17. Interactive vs passive distinction

This header contains both kinds of objects:

### Interactive

```text
outpost name editor
System
Body
Biome
```

### Passive

```text
Solar
Wind
```

The redesign should make that difference immediately legible.

Do not make Solar/Wind look like disabled buttons.

Disabled control and passive indicator are different semantics.

---

## 18. Focus / hover language

For interactive controls touched by this pass:

### Hover

Subtle.

Use a small contrast/border change only.

Do not imply selection merely through hover.

### Focus

Use the existing application focus language.

Do not leave these controls using inconsistent Chromium-native focus rings if the rest of the redesigned UI uses explicit focus styling.

### Passive indicators

No hover/focus affordance unless they are genuinely focusable for accessibility reasons in the current markup.

Do not imply clickability.

---

## 19. No behavior changes

Do not change:

```text
outpost-name editing semantics
System selection
Body selection
Biome selection
biome filtering
Solar/Wind derivation
settleability filtering
unknown/recovery selections
validation
Undo/Redo
persistence
```

This is a visual pass.

If a visual inconsistency appears to require behavior changes, report it rather than expanding scope automatically.

---

## 20. Responsive behavior

Maintain the existing one-page desktop design.

Test at the current normal desktop viewport(s).

Verify:

- no new page-level horizontal overflow;
- header does not become materially taller in normal cases;
- long outpost names remain usable;
- System / Body widths remain practical;
- biome wrapping remains stable;
- matrix/cargo proportions below remain unaffected.

Do not introduce a new responsive breakpoint unless clearly necessary.

---

## 21. Visual review checklist

Before considering the pass complete, assess:

1. Does the outpost title look like selected-object identity rather than an old generic heading?
2. Do System and Body now visually belong to the same control family as Cargo selectors?
3. Do Solar/Wind read clearly as passive values rather than buttons?
4. Do Biome controls read clearly as interactive toggles?
5. Is selected Biome state decisive and consistent with the new state language?
6. Is the whole header compact and quiet?
7. Does it bridge the shell and operational core without becoming a third dominant region?
8. Are boxes/borders used sparingly?
9. Is focus styling consistent?
10. Has the redesign avoided unnecessary padding or height growth?

---

## 22. Verification

Run appropriate repository checks, at minimum where available:

```text
npm test
npm run lint
npm run build
git diff --check
```

Report any pre-existing failures separately.

### Manual browser smoke tests

Test representative outposts with:

```text
short outpost name
long outpost name
valid System / Body
legacy / recovery value if safely available
one biome
multiple biomes
wrapped biome row if possible
known Solar/Wind values
unknown Solar/Wind value
selected and unselected biome controls
keyboard focus across name/select/biome controls
```

Verify:

- no behavior changes;
- selectors still update correctly;
- biome filtering still works;
- Solar/Wind remain passive;
- Undo/Redo still captures header edits as before;
- no overflow regression;
- Matrix/Cargo layout below remains stable.

---

## 23. Deliverable report

When complete, report:

```text
files changed
Outpost title changes
System / Body selector changes
Solar / Wind changes
Biome changes
layout / spacing changes
any shared selector styling reused
tokens added/changed, if any
tests/checks run
manual smoke-test results
unexpected inherited effects
```

Explicitly state whether:

- any out-of-scope component changed visually;
- Matrix/Cargo proportions changed;
- header height changed materially;
- any behavior changed.

Do not commit or push unless explicitly asked.

---

## 24. Suggested commit message

If accepted:

```text
feat: restyle outpost header
```

---

## 25. Final instruction

The purpose of this pass is to eliminate the remaining visual seam between the redesigned shell and redesigned operational workspace.

The Outpost Header should become:

> **a compact technical specification strip for the selected outpost.**

Prefer:

```text
consistency
restraint
clear interaction semantics
compactness
existing workflow preservation
```

over novelty or additional layout complexity.
