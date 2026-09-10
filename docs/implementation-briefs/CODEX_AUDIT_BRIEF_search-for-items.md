# Codex Architecture Audit Brief — Search for Items

## Objective

Perform a **no-code architecture/design audit** for a new **Search for Items** feature in the Starfield Outpost Network app.

Do not implement the feature yet.

The audit should identify the cleanest existing seams for:

- localized resource/product catalogue search and autocomplete;
- single-item search submission;
- active-network result derivation;
- result-state classification;
- clickable outpost navigation;
- draggable non-modal result palette;
- `/` keyboard focus shortcut;
- live refresh of submitted search results as network data changes;
- network-local presentation-state ownership/reset;
- accessibility-compatible interaction patterns without attempting the full accessibility audit.

The final audit should be specific enough that a later implementation brief can be self-contained and low-risk.

## Part A — Read first

Review:

- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`

Inspect relevant code for:

- Resource Matrix heading strip;
- resource/product reference catalogues;
- localized reference-name resolution;
- abbreviations;
- localization catalog/message system;
- active Network state;
- Outpost navigation;
- `CollectionEditingSession`;
- presentation-state ownership/reset logic;
- existing keyboard-shortcut handling;
- editable-target detection;
- modal suppression;
- drag/reorder utilities or draggable UI patterns;
- validation/result-state derivation helpers;
- logistics/import/export derivation;
- manufacturing readiness / missing inputs;
- Planned Supply;
- Present / Producing state helpers.

Do not change files.

## Part B — Feature intent

The feature exists to answer questions such as:

> “Which outpost or outposts have Zero Wire?”

It should scale better than manually scanning a large network.

The feature is scoped to the **active network only**. One network represents one universe.

Do not propose cross-network search unless explicitly noted as a rejected alternative.

## Part C — Search field

### Placement

Planned placement:

```text
Resource Matrix heading strip
left:  RESOURCE MATRIX
right: Search for Items field
```

The field is intentionally **unlabeled visually**.

Expected affordances:

```text
magnifying-glass icon
placeholder: "Search resources or products"
tooltip / accessible description:
"Search for resources or products in your outposts."
```

Audit the current heading-strip component/CSS and identify the cleanest insertion point. Assess likely responsive implications. Do not redesign the heading strip.

### Search catalogue

Search the complete localized reference catalogue of:

```text
resources
manufactured products
```

Do not search only items currently present in the network.

Audit:

- where these catalogues come from;
- whether they share a common typed identity;
- how localized names are resolved;
- how abbreviations are stored/resolved;
- whether a merged search-index seam already exists.

Stable selected identity must ultimately be:

```text
type + ID
```

Localized display names and abbreviations are for matching/presentation only.

### Matching behavior

Agreed matching priority:

```text
1. exact localized name
2. exact abbreviation
3. localized-name prefix
4. abbreviation prefix
5. localized-name substring
```

Within each tier, ordering must be deterministic.

Audit the cleanest helper/data structure for this. Also assess:

- case-insensitive matching;
- trimming leading/trailing whitespace;
- whether locale-sensitive case folding is warranted;
- collisions in display name or abbreviation.

If collisions are possible, recommend a quiet category disambiguator in autocomplete.

Do not propose fuzzy edit-distance matching for V1.

## Part D — Autocomplete

While typing:

- matching catalogue items appear beneath the search field;
- Up/Down arrows move through matches;
- Enter accepts/submits the highlighted match;
- mouse click selects/submits a match;
- Escape closes autocomplete first;
- unresolved free text does not open bogus results.

Do **not** auto-submit merely because only one match remains.

Audit whether the best implementation is an existing app pattern, custom combobox/listbox, native `datalist`, or another existing seam. Recommend one approach and explain why, especially with future accessibility compatibility in mind.

## Part E — Submission lifecycle

Single-item search only.

Submission occurs by:

```text
Enter
magnifying-glass submit control
clicking an autocomplete match
```

Audit the cleanest state model for:

```text
draftQuery
highlightedMatch
resolvedDraftItem
submittedItem
```

The submitted item must remain separate from draft text.

Agreed behavior:

```text
typing a new query
    -> autocomplete may change
    -> existing submitted Search Results remain unchanged

submitting a new resolved item
    -> Search Results content switches to the new item
```

If the result palette is already open, update its contents and allow it to resize, but **do not reposition it**.

## Part F — Search result semantics

Use neutral localized summary wording because Planned Supply is virtual.

Success:

```text
{searchItem} was found at {count} outpost(s).
```

Failure:

```text
{searchItem} was not found at any outpost.
```

Use proper localization/plural handling, not English branching in the component.

Each matched outpost may show flags in this stable display order:

```text
PRESENT
PRODUCING
MISSING INPUTS
IMPORTING
EXPORTING
PLANNED SUPPLY
```

Semantics:

- **PRESENT** — for resources, the resource exists locally at the outpost, independent of whether it is actively produced.
- **PRODUCING** — resource actively extracted/gathered, or manufactured product configured with all required inputs satisfied.
- **MISSING INPUTS** — manufactured product configured but one or more required inputs unresolved. Mutually exclusive with `PRODUCING` for the same product/outpost.
- **IMPORTING** — searched item actually imported through current routed logistics.
- **EXPORTING** — searched item actually exported through current routed logistics.
- **PLANNED SUPPLY** — searched item exists in Planned Supply at that outpost; virtual and may coexist with other states.

Do not return an outpost merely because the searched item is:

- a missing recipe input;
- mentioned in validation text;
- present only in unrelated reference data.

Audit where each flag should derive from existing domain helpers. Identify any missing abstraction.

## Part G — Live refresh of submitted results

The submitted stable item remains fixed while the palette is open, but results should update automatically when the active network's data changes.

Example:

```text
Zero Wire at Feynman I:
[MISSING INPUTS]

user fixes an input

same open palette becomes:
[PRODUCING]
```

This is **not** live searching the draft query.

Audit the preferred derivation model. Strong preference is to derive results from:

```text
submittedItem + current active network
```

rather than persisting stale result objects, unless current architecture gives a better reason.

## Part H — Result palette

The Search Results surface is:

```text
non-modal
initially below search field
auto-sized to contents
bounded by sensible max width/height
internally scrollable when needed
not manually resizable
```

Title bar:

```text
SEARCH RESULTS                         ×
```

No OK/Cancel footer.

Escape closes it when autocomplete is not open.

Results are one row per outpost:

```text
Outpost Name    [FLAG] [FLAG] [FLAG]
```

Outpost names are vertically listed and flags appear alongside, not beneath, unless wrapping is required at constrained width.

Follow:

> Adapt before overflowing.

Audit compact behavior for long names/many flags.

### Clickable navigation

Outpost names are clickable.

Clicking a result:

```text
makes that outpost active
uses ordinary manual navigation semantics
creates NO history entry
leaves Search Results open
preserves submitted item
preserves dragged palette position
```

Identify the existing navigation seam to reuse.

## Part I — Draggable palette

The palette can be moved by dragging its title bar.

Requirements:

```text
title-bar drag only
no manual resize
position preserved across outpost navigation
position preserved when submitting a new item
position discarded when switching networks
```

Audit existing pointer-drag/reorder utilities and recommend whether to reuse them or implement small pointer-event drag logic. Do not add a heavy dependency.

Also recommend simple recoverability behavior for:

```text
window resize
browser zoom
palette partly offscreen
large result sets
```

Do not over-engineer docking.

## Part J — Presentation-state ownership

Search is **network-local presentation state**.

On Network change:

```text
clear draft query
close autocomplete
clear submitted item
close Search Results
discard palette position
```

Within the same network, on Outpost change:

```text
preserve draft query
preserve submitted item
preserve Search Results open/closed state
preserve palette position
```

This follows:

> Reset presentation state at the narrowest ownership boundary that has actually changed.

Search state must not be persisted into:

```text
NetworkCollection
history
import/export JSON
gameplay localStorage
```

Audit the correct state owner.

### Undo/Redo interaction

Search presentation state is not history.

- Undo/Redo should not record or restore query text or palette position.
- Same-network Undo/Redo should leave the search presentation intact while re-derived result flags update from restored network data.
- If Undo/Redo restores a different network, apply the same network-change reset semantics.

Audit how current history context restoration signals network/outpost changes and how existing reset boundaries should be reused.

## Part K — `/` keyboard shortcut

Agreed behavior:

```text
/ in normal workspace
    -> focus Search for Items
    -> select existing query text if any
    -> prevent default

/ while a genuine text-editing control has focus
    -> do nothing special
    -> preserve normal typing

/ while a modal is open
    -> do nothing special
```

Buttons/selects/checkboxes/matrix controls remain eligible workspace contexts.

Audit the existing keyboard-shortcut helper and editable-target detection added for Undo/Redo. Prefer reuse over a second definition.

Audit conflicts with autocomplete, modals, native text editing, and other global keyboard listeners.

## Part L — Escape priority

Agreed priority:

```text
if autocomplete open
    Esc closes autocomplete

else if Search Results open
    Esc closes Search Results

else
    normal app/browser behavior
```

Do not let Search Results steal Escape from an open modal.

## Part M — Localization

Audit required catalog additions for:

```text
placeholder
search tooltip / accessible description
Search Results title
success count/plural
no-results text
flag labels
autocomplete category disambiguators if needed
```

Resource/product names must continue through localized reference-name resolution.

Search matching must use the **active localized display catalogue**.

Stable identities remain `type + ID`.

### Locale change while search is open

Recommended behavior unless architecture suggests otherwise:

- submitted stable item remains the same;
- result item name and flag labels re-render in the new locale;
- autocomplete catalogue re-renders/rematches using the new locale;
- draft free text is not silently translated.

Call out any ambiguity.

## Part N — Accessibility compatibility

Do not perform the full accessibility audit.

However, audit the minimum appropriate semantics for:

```text
search input accessible name
autocomplete combobox/listbox behavior
Up/Down/Enter/Escape
visible focus
clickable outpost names
close button accessible name
draggable title bar
non-modal palette semantics
```

Choose seams likely to survive the later formal accessibility audit.

## Part O — Performance and scale

The active network may contain up to roughly 24 outposts and the search catalogue is bounded by existing reference data.

Audit whether simple scans, memoization, or a small precomputed index are appropriate.

Do not over-engineer.

## Part P — Testing strategy

Recommend focused automated coverage for:

### Matching
- exact localized name;
- exact abbreviation;
- name prefix;
- abbreviation prefix;
- name substring;
- case-insensitive behavior;
- no match;
- deterministic ordering;
- collision/disambiguation if applicable.

### Localization
- en-US/en-GB localized reference-name matching;
- locale switch re-renders submitted item;
- localized count/plural;
- localized flag labels.

### Result derivation
- Present;
- Producing;
- Missing Inputs;
- Importing;
- Exporting;
- Planned Supply;
- multiple simultaneous flags;
- no false hit from missing recipe input.

### Navigation
- click result -> correct outpost active;
- no history entry;
- palette remains open.

### Live refresh
- submitted item fixed;
- network edit changes flags;
- draft changes do not replace submitted results.

### Ownership/reset
- outpost navigation preserves search presentation;
- network switch clears it;
- same-network Undo/Redo preserves it;
- cross-network Undo/Redo resets it.

### Keyboard
- `/` focuses search;
- `/` ignored in text-editing target;
- `/` suppressed by modal;
- arrows/Enter autocomplete behavior;
- Escape priority.

### Palette
- new submission preserves dragged position;
- network switch discards position;
- large result set scrolls.

Recommend which belong in unit/helper tests, component tests, and manual browser checks.

## Part Q — Questions the audit must answer

Explicitly answer:

1. Where should Search UI state live?
2. How should active-network results be derived?
3. Should results be stored or derived from submitted item + current network?
4. Which existing domain helpers can supply each of the six flags?
5. What new helper(s), if any, are genuinely needed?
6. How should localized resource + product catalogue matching be structured?
7. How should deterministic match ranking be implemented?
8. What localization/plural infrastructure can be reused?
9. What existing navigation function should result clicks invoke?
10. How should network-change vs outpost-change reset ownership be implemented?
11. How should Undo/Redo context restoration interact with search presentation state?
12. What editable-target/modal keyboard logic should `/` reuse?
13. How should autocomplete be implemented accessibly without unnecessary dependencies?
14. How should palette drag positioning/clamping work?
15. Are there heading-strip CSS/layout constraints that materially affect placement?
16. What should happen on locale change while draft/autocomplete/results are open?
17. Are there duplicate-name/duplicate-abbreviation reference collisions requiring disambiguation?
18. What files would likely change?
19. What parts are highest risk?
20. Are any requirements incompatible with current architecture?

## Part R — Audit output format

Produce a concise but concrete report with:

1. **Existing architecture relevant to Search** — actual files/functions/types.
2. **Recommended state model** — conceptual state adapted to actual architecture.
3. **Search catalogue + matching** — localized display data to stable selected identity.
4. **Result derivation** — each flag mapped to real domain logic/helper.
5. **Navigation + live refresh**.
6. **Presentation ownership** — network/outpost/Undo/Redo behavior.
7. **Keyboard + autocomplete**.
8. **Floating palette** — component placement, sizing, drag, scrolling, clamping.
9. **Localization** — likely message keys and locale-sensitive behavior.
10. **Accessibility compatibility**.
11. **Testing plan**.
12. **Risks / open questions** — only genuine unresolved issues.
13. **Likely implementation files**.
14. **Recommended implementation sequence**.

## Part S — Out of scope

Do not:

- implement code;
- modify files;
- add dependencies;
- change schemas or persistence;
- change history architecture;
- change validation rules;
- perform the full accessibility audit;
- add cross-network search;
- add multi-item search;
- add fuzzy edit-distance search;
- add search history/recent searches;
- add saved searches;
- add filter/sort controls to results;
- commit;
- push.

## Final instruction

Audit the existing codebase against this agreed behavior:

> **A localized, single-item Search for Items field in the Resource Matrix heading should let the user quickly find every relevant outpost in the active network, explain each outpost’s current item state, navigate directly to results, keep submitted results live as network data changes, preserve search presentation across outpost navigation, reset it on network change, and support conventional autocomplete plus `/` keyboard focus without compromising existing history or accessibility patterns.**
