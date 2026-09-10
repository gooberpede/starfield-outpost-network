# Codex Implementation Brief — Search for Items

## Objective

Implement the new **Search for Items** feature in the Starfield Outpost Network app.

This feature should let the user answer questions such as:

> “Which outpost or outposts have Zero Wire?”

The feature is **single-item**, **active-network only**, localized, non-modal, and presentation-only.

It must:

- search the complete localized resource/product reference catalogue;
- support deterministic autocomplete;
- submit one stable `type + ID` item at a time;
- derive matching outposts and semantic flags from the current active network;
- keep submitted results live as network data changes;
- let the user click a result outpost to navigate there without creating history;
- preserve search presentation across outpost navigation;
- reset search presentation on network/lifecycle boundaries;
- provide a draggable, keyboard-movable non-modal Search Results palette;
- support `/` as a focus shortcut when normal workspace controls own focus.

Do not broaden scope into cross-network search, multi-item search, fuzzy matching, saved searches, search history, or a general accessibility audit.

## Part A — Read first

Review:

- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN-RULES.md`
- `docs/UX-DESIGN.md`
- `docs/BACKLOG.md`
- `docs/IMPLEMENTATION-WORKFLOW.md`
- `docs/audits/codex-search-for-items-architecture-audit.md`

Important workflow note:

- Audit reports live under `docs/audits/`.
- Do not move or rewrite the audit report unless a narrowly required correction is discovered.
- This parcel is implementation based on that audit.

Inspect current code for:

- `App.tsx`
- `OutpostStatusMatrix`
- Resource Matrix heading styles
- reference data loading
- localized reference-name resolution
- `shortName` abbreviations
- localization catalogs
- `CollectionEditingSession`
- `selectOutpost`
- `getHistoryPresentationReset`
- `resetNetworkPresentationState`
- keyboard shortcuts
- `isTextEditingShortcutTarget`
- `ContextHelp` portal/positioning patterns
- resource Present/Producing derivation
- manufacturing feasibility
- item provenance
- routed exports
- Planned Supply

Preserve existing architecture.

## Part B — Settled product rules

### 1. Active-network scope only

Search only the current active network.

Do not search other networks, other universes, or archived/past states.

### 2. `PRESENT` meaning

Use this exact rule:

> **Search `PRESENT` means the same thing as a lit Present cell in the Resource Matrix.**

Do not broaden `PRESENT` to body-wide/wild-only organic availability.

Mirror current Matrix semantics.

### 3. Single-item submission only

Only one stable `CargoItem` identity is submitted at a time:

```ts
{ type: 'resource' | 'product', id: string }
```

Do not use localized names as identity.

### 4. Draft and submitted search are separate

Typing a new query must not mutate an existing submitted result palette.

Conceptually:

```text
draftQuery
autocomplete matches
highlightedMatch
resolvedDraftItem

submittedItem
```

The submitted item remains fixed until the user submits another valid item or search state resets.

## Part C — Search field

### 5. Placement

Add the search control to the **Resource Matrix heading strip**.

Layout:

```text
RESOURCE MATRIX                         [ search field ]
```

The field should be right-aligned directly across from the title at normal widths.

It may wrap below the title when needed.

Do not increase the Matrix table's minimum width.

Keep it outside the Matrix horizontal scroller.

Follow:

> Adapt before overflowing.

### 6. Search field affordances

Use:

```text
magnifying-glass submit button/icon
placeholder: "Search resources or products"
```

No visible label is required.

Provide localized accessible text:

```text
Search for resources or products in your outposts.
```

The magnifying-glass control must have a localized accessible name/title.

## Part D — Localized search catalogue

### 7. Search all reference resources and products

Build a memoized localized display index from:

```text
ReferenceData.resources
ReferenceData.products
active locale
```

Each search entry should include stable item identity, localized display name, abbreviation, category, and normalized name/abbreviation fields.

Use:

- `getReferenceDisplayName(...)`
- reference `shortName`

Abbreviations are currently invariant/canonical.

Do not change persisted reference schemas.

### 8. Query normalization

Normalize query/candidates using:

```text
trim()
Unicode NFC normalization
locale-aware lowercase where practical
```

Do not add fuzzy edit-distance matching or other new fuzzy algorithms.

### 9. Match ranking

Use this exact priority:

```text
1. exact localized name
2. exact abbreviation
3. localized-name prefix
4. abbreviation prefix
5. localized-name substring
```

Each candidate gets only its best tier.

Within a tier, sort deterministically by:

```text
localized displayName
fixed category order: resource, product
stable ID
```

Use an `Intl.Collator` or equivalent localized deterministic collation.

Empty/whitespace-only query returns no matches.

### 10. Collision handling

Current reference data has no known duplicate visible names/abbreviations, but uniqueness is not guaranteed.

If two visible matches are ambiguous by label/abbreviation, show a quiet localized category disambiguator:

```text
RESOURCE
PRODUCT
```

Identity must remain stable `type + ID`.

## Part E — Autocomplete

### 11. Use a controlled ARIA combobox/listbox

Do not use native `datalist`.

Use a controlled search input with appropriate combobox/listbox relationships:

```text
role="combobox"
aria-autocomplete="list"
aria-expanded
aria-controls
aria-activedescendant
```

and matching:

```text
role="listbox"
role="option"
aria-selected
```

Focus remains in the input while Up/Down changes the active option.

### 12. Keyboard behavior

While autocomplete is open:

```text
ArrowDown -> move highlight down
ArrowUp   -> move highlight up
Enter     -> submit highlighted option, otherwise submit uniquely resolvable draft item
Escape    -> close autocomplete first
```

Clicking an autocomplete option submits that exact item.

Do not auto-submit while typing.

### 13. Unique remaining match rule

If typing narrows the catalogue to exactly one valid match:

```text
do NOT auto-submit
```

The user must still confirm with Enter, the magnifying glass, or clicking the match.

If there is exactly one remaining match and nothing is highlighted, Enter/magnifying-glass may submit that unique remaining match even when the typed text is only a prefix or substring.

Example:

```text
"zero w"
-> only Zero Wire remains
-> no automatic submission
-> Enter submits Zero Wire
```

### 14. Multiple-match resolution

If multiple matches remain:

- Enter submits the highlighted match if one exists.
- Magnifying glass should submit only when the current draft resolves unambiguously.
- Otherwise do nothing.

Do not guess among ambiguous matches.

### 15. Invalid/free text

If the typed text does not correspond to a resolvable catalogue item:

```text
do not open Search Results
do not create validation chrome
leave draft text intact
```

## Part F — `/` shortcut

### 16. `/` focuses Search for Items

Add `/` as a workspace shortcut.

Behavior:

```text
/ pressed in normal workspace
    -> focus Search input
    -> select existing query text if any
    -> prevent default
```

### 17. Reuse text-editing detection

Reuse the existing `isTextEditingShortcutTarget()` or exact existing text-editor guard used for Undo/Redo.

When a genuine text-editing control has focus, `/` behaves normally.

Buttons, selects, checkboxes/radios, Matrix controls remain eligible workspace contexts.

### 18. Modal suppression

If any current modal owns the UI, `/` must do nothing special.

Reuse the same aggregate modal-open state used by current history shortcut handling.

### 19. Shortcut recognition

Recognize plain `/` only.

Ignore when Ctrl, Alt, Meta, or repeat are active.

Use `preventDefault()` only when Search actually takes focus.

## Part G — Search submission + result summary

### 20. Submission actions

Valid submission occurs via:

```text
Enter
magnifying-glass control
autocomplete click
```

On success:

- copy only stable `type + ID` to `submittedItem`;
- open Search Results;
- preserve an existing non-null palette position;
- do not create history.

### 21. Localized summary wording

Use localized complete messages.

Success:

```text
{searchItem} was found at {count} outpost(s).
```

Failure:

```text
{searchItem} was not found at any outpost.
```

Use plural-aware localization.

Do not branch English singular/plural in JSX.

## Part H — Result derivation

### 22. Derive results live

Do not store result rows/flags as durable UI state.

Derive from:

```text
submittedItem
current active network
current reference data
```

This guarantees live refresh when network data changes.

Draft query changes must not affect submitted results.

### 23. Result ordering

Preserve active network outpost order.

Include an outpost only when at least one result flag is true.

### 24. Stable flag display order

Always display flags in this order:

```text
PRESENT
PRODUCING
MISSING INPUTS
IMPORTING
EXPORTING
PLANNED SUPPLY
```

Do not let derivation order determine visual order.

## Part I — Flag semantics

### 25. `PRESENT`

Resources only.

Use the same semantics as a lit Matrix Present control.

For inorganic resources, use recorded local presence at the outpost.

For organics, use the same source-specific / biome-scoped Present semantics used by the Matrix.

Do not use broader body-wide/wild-only organic presence.

Products do not receive `PRESENT`.

### 26. `PRODUCING`

For resources: actively produced/extracted/gathered at the outpost.

For products: manufacturing entry exists and all required inputs are satisfied.

Use existing production/manufacturing feasibility helpers.

### 27. `MISSING INPUTS`

Products only.

Use when:

```text
manufacturing entry exists
known recipe exists
product is not currently feasible
because required inputs are unresolved
```

Do not derive this from validation messages.

`PRODUCING` and `MISSING INPUTS` are mutually exclusive.

If reference/recipe data itself is unresolved, do not falsely label it `MISSING INPUTS`; use the clean explicit readiness classifier recommended by the audit.

### 28. `IMPORTING`

Use existing item provenance/routed import logic.

### 29. `EXPORTING`

Use existing routed-export semantics, e.g. `getRoutedExportedItemKeysAtOutpost()` or equivalent.

This intentionally follows current Matrix semantics: routed outbound configuration counts as exporting even if separate source validation reports a warning.

Do not redefine export validity here.

### 30. `PLANNED SUPPLY`

Exact `type + ID` match in `outpost.plannedSupply`.

Planned Supply is virtual and may coexist with other flags.

### 31. What must not create a result

Do not match an outpost merely because the searched item:

```text
is a missing recipe ingredient
appears in validation text
exists only in reference data
```

## Part J — Result palette

### 32. Non-modal floating palette

Render a non-modal Search Results palette.

Preferred architecture from audit:

```text
createPortal(..., document.body)
position: fixed
```

It should:

```text
initially appear beneath the search field
auto-size to contents
have sensible max width/height
scroll internally for large result sets
not be manually resizable
```

Keep it below modal priority layers.

### 33. Title bar

Title bar:

```text
SEARCH RESULTS                          ×
```

Use localized title and close accessible name.

No OK/Cancel footer.

The close button closes Search Results.

Closing results does not need to clear draft text.

### 34. Result rows

One outpost per row:

```text
Outpost Name      [FLAG] [FLAG] [FLAG]
```

Outpost name is the primary navigation control.

Flags sit alongside the name and may wrap only when necessary.

Use compact layout.

Long outpost names may ellipsize with a useful title/accessible label.

### 35. Result navigation

Outpost names must be semantic buttons.

Clicking one:

```text
calls existing selectOutpost(outpostId)
makes that outpost active
creates NO history entry
keeps Search Results open
keeps submitted item
keeps draft text
keeps palette position
```

## Part K — Live result refresh

### 36. Network edits refresh flags automatically

If submitted Search Results are open and the network changes through production, manufacturing feasibility, cargo routing, Planned Supply, or local presence, re-derived result rows/flags must update automatically.

Example:

```text
Zero Wire -> [MISSING INPUTS]

user fixes input

same open palette -> [PRODUCING]
```

Do not require resubmission.

### 37. Draft changes do not replace results

Typing a different draft query while results are open:

```text
may update autocomplete
must not alter submitted item
must not alter result palette contents
```

Only a successful new submission changes the result item.

## Part L — Presentation ownership

### 38. Search state owner

Search presentation state belongs above the outpost-keyed Matrix component.

Own it in `App.tsx`, optionally behind a focused hook.

Do not put it inside `OutpostStatusMatrix`.

Conceptual state:

```text
draftQuery
highlightedMatchKey
submittedItem
isAutocompleteOpen
palettePosition
```

Compute resolved draft item.

Do not persist Search presentation into collection data, history entries, import/export JSON, or gameplay localStorage.

### 39. Outpost changes preserve Search

Within the same network, preserve Search across manual outpost navigation, result navigation, and same-network Undo/Redo context restoration.

Preserve:

```text
draft query
submitted item
results open/closed
palette position
```

### 40. Network/lifecycle boundaries reset Search

Reset the entire Search presentation state on:

```text
switch Network
Add Network
Delete Network
Reset Network
successful collection import/replacement
Undo/Redo crossing a Network boundary
Undo/Redo replaying a lifecycle/import replacement with network reset semantics
```

Clear draft, autocomplete, highlight, submitted item, results, and palette position.

### 41. History reset integration

Extend existing presentation-reset classification narrowly.

Required behavior:

```text
same-network value Undo/Redo -> preserve Search
outpost-only context restoration -> preserve Search
network/lifecycle/import boundary -> reset Search
```

Do not put Search state into history.

## Part M — Escape priority

### 42. Escape hierarchy

Use this order:

```text
if modal owns Escape
    -> Search does nothing

else if autocomplete is open
    -> Escape closes autocomplete

else if Search Results is open
    -> Escape closes Search Results

else
    -> no Search action
```

Do not allow one Escape press to close multiple unrelated surfaces.

Check `event.defaultPrevented` where appropriate.

## Part N — Draggable + keyboard-movable palette

### 43. Pointer dragging

Drag only from the title bar.

Use small local Pointer Events logic, not a dependency.

Use pointer capture and a shared viewport-clamping helper.

Do not start drag from the close button.

Use `touch-action: none` only on the drag handle area.

### 44. Keyboard movement

Make the drag affordance keyboard-movable from the outset.

Use a focusable drag handle/title-bar affordance with localized instructions.

Suggested behavior:

```text
Arrow keys -> nudge palette
Shift + Arrow keys -> larger nudge
```

Use the same clamping helper as pointer dragging.

### 45. Position preservation

On first successful search:

```text
position palette beneath search field
clamp to viewport
store top-left
```

On later search submission:

```text
update content
allow palette to resize
DO NOT reposition
```

On outpost navigation, preserve position.

On network/lifecycle reset, discard position.

### 46. Viewport recovery

On window resize, browser zoom, or palette size change, re-clamp as needed so the title bar and close button remain recoverable.

Account for viewport margins and the fixed Status Bar safe area.

If the full palette cannot fit, prioritize keeping the title bar reachable.

Do not over-engineer docking.

## Part O — Localization

### 47. Add typed messages

Add localized baseline keys for at least:

```text
search.input.label
search.input.placeholder
search.input.description
search.submit
search.autocomplete.resource
search.autocomplete.product
search.results.title
search.results.found
search.results.notFound
search.results.close
search.results.flag.present
search.results.flag.producing
search.results.flag.missingInputs
search.results.flag.importing
search.results.flag.exporting
search.results.flag.plannedSupply
search.results.dragInstructions
```

Use en-US as baseline/fallback.

Add en-GB overrides only if wording differs.

### 48. Locale switching while Search is open

On locale change:

```text
keep submitted stable item
keep palette open/closed state
keep palette position
keep draft free text unchanged
```

But rerender localized labels/names, rebuild/rerank the localized index, rematch the unchanged draft, and clear/recompute highlight if necessary.

Stable identity does not change.

## Part P — Accessibility-compatible implementation

### 49. Minimum semantics

This is not the full accessibility audit, but implement with:

```text
explicit accessible input name
ARIA combobox/listbox relationships
visible focus
semantic buttons for result navigation
localized close accessible name
named non-modal role="region" palette
focusable keyboard drag affordance
```

Do not use `aria-modal`, trap focus, lock page scrolling, or use clickable divs/spans for result navigation.

A restrained `aria-live="polite"` result-summary update is acceptable if implemented cleanly.

## Part Q — Performance

### 50. Keep derivation simple

Expected scale is modest:

```text
~24 outposts maximum
~105 current resource/product reference entries
one submitted item at a time
```

Use simple deterministic scans/memoization.

Do not introduce persistent search indexes, cache invalidation frameworks, new state-management libraries, or dependencies.

## Part R — Testing

Add focused automated coverage for:

### Search matching
- exact localized name;
- exact abbreviation;
- name prefix;
- abbreviation prefix;
- name substring;
- case-insensitive matching;
- trimmed input;
- empty input;
- no match;
- deterministic ordering;
- stable `type + ID`;
- unique remaining match does not auto-submit;
- unique remaining prefix/substring submits on Enter;
- collision/disambiguation behavior;
- en-US Aluminum / en-GB Aluminium.

### Result derivation
- PRESENT;
- PRODUCING;
- MISSING INPUTS;
- IMPORTING;
- EXPORTING;
- PLANNED SUPPLY;
- simultaneous flags;
- stable flag order;
- multiple outposts;
- no results;
- no false result from missing recipe ingredient;
- missing recipe/reference does not falsely report MISSING INPUTS;
- PRESENT mirrors Matrix semantics.

### Navigation/live refresh
- result navigation uses existing outpost selection;
- no history entry;
- Search remains open;
- network mutation changes derived flags;
- draft change does not replace submitted results;
- same-network Undo/Redo rederives.

### Presentation reset
- outpost change preserves Search;
- same-network Undo/Redo preserves Search;
- cross-network Undo/Redo resets Search;
- switch/add/delete/reset/import reset Search.

### Keyboard
- `/` focuses Search in workspace;
- `/` ignored in text editors;
- `/` ignored with modal open;
- modifiers/repeat ignored;
- button/select/checkbox contexts remain eligible;
- autocomplete Up/Down/Enter;
- Escape closes autocomplete before results;
- modal Escape takes precedence.

### Palette geometry
If geometry is extracted to pure helpers, test:
- initial placement;
- viewport clamping;
- Status Bar safe area;
- oversized palette title-bar recoverability;
- resize/zoom reclamping;
- pointer movement clamp;
- keyboard nudge clamp.

### Localization
- message-key completeness;
- singular/plural result count;
- no-results copy;
- flag labels;
- accessible labels;
- locale-switch stable submitted identity;
- en-US/en-GB item display;
- draft text not translated.

Do not add a DOM testing dependency unless separately justified.

## Part S — Manual browser checks

Perform browser checks for:

- wide/compressed/zoomed/narrow heading layout;
- placeholder and search affordances;
- exact name, abbreviation, prefix, substring;
- multiple matches;
- one remaining match;
- Arrow Up/Down, Enter, click, Escape;
- invalid text;
- `/` from workspace controls and suppression in text fields/modals;
- resource, product, and no-result searches;
- every result flag where fixtures permit;
- clickable outpost navigation;
- live `MISSING INPUTS` -> `PRODUCING` refresh;
- draft changes leaving submitted results unchanged;
- new submission updating contents without repositioning palette;
- outpost change preserving Search;
- network change resetting Search;
- same-network Undo/Redo preserving Search;
- cross-network Undo/Redo resetting Search;
- mouse drag;
- close button not initiating drag;
- keyboard arrow movement;
- Shift+Arrow larger movement;
- resize/zoom recovery;
- large-result scrolling;
- en-US/en-GB switching with draft/autocomplete/results open.

## Part T — Documentation

Update appropriate durable sections of:

```text
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Document concisely:

- active-network-only scope;
- stable submitted identity;
- live-derived results;
- flag semantics;
- Search presentation ownership/reset;
- `/` shortcut;
- non-modal draggable/keyboard-movable palette;
- localized autocomplete behavior.

Remove/close any specific backlog item implemented by this parcel.

Do not rewrite unrelated documentation.

## Part U — Likely files

Expected likely changes based on the audit:

```text
src/App.tsx
src/ui/components/OutpostStatusMatrix.tsx
src/ui/components/OutpostStatusMatrix.css
src/ui/keyboardShortcuts.ts
src/domain/collectionEditingSession.ts
src/localization/types.ts
src/localization/locales/en-US.ts
possibly src/localization/locales/en-GB.ts
```

Likely new files may include:

```text
src/domain/itemSearchResults.ts
src/ui/itemSearch.ts
src/ui/itemSearchPosition.ts
src/ui/components/SearchForItems.tsx
src/ui/components/SearchForItems.css
tests/itemSearch.test.ts
tests/itemSearchResults.test.ts
```

Adapt to actual code structure. Do not force unnecessary files.

## Part V — Out of scope

Do not:

- add cross-network search;
- add multiple simultaneous search items;
- add fuzzy/edit-distance matching;
- add search history/recent searches;
- add saved searches;
- add result sorting/filtering UI;
- change validation rules;
- change persisted schemas;
- change import/export JSON;
- persist Search state;
- change history architecture;
- add external dependencies;
- perform the full accessibility audit;
- redesign Resource Matrix;
- commit;
- push.

## Part W — Verification

Run:

```text
npm test
npm run build
npm run lint
git diff --check
git status --short
```

Perform the browser checks above.

No commit or push.

## Part X — Completion report

Report:

### Architecture
Explain where Search state lives and why.

### Matching
Describe catalogue construction, normalization, ranking, unique remaining match behavior, collision handling, and stable identity.

### Result derivation
Map each flag to the implementation/helper and confirm `PRESENT` mirrors Matrix semantics.

### Live refresh
Explain why submitted results update with network data but not draft text.

### Navigation
Confirm result clicks use normal outpost navigation and create no history.

### Presentation ownership
Confirm:
- outpost change preserves;
- network/lifecycle boundary resets;
- same-network Undo/Redo preserves;
- cross-network Undo/Redo resets.

### Keyboard
Confirm `/`, autocomplete arrows/Enter/Escape, modal suppression, and text-editing suppression.

### Palette
Describe portal/layering, placement, pointer drag, keyboard movement, clamping, resize/zoom recovery, scrolling, and position preservation.

### Localization
List new keys and locale behavior.

### Accessibility-compatible seams
Confirm semantic controls/ARIA model without claiming a full accessibility audit.

### Tests
List focused automated coverage.

### Files changed
List all files.

### Verification
Report exact results for:
- `npm test`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

Do not commit or push.

## Final instruction

Implement the agreed feature:

> **A localized, single-item Search for Items field in the Resource Matrix heading lets the user search the complete resource/product catalogue, submit a stable item identity, see every matching outpost in the active network with semantic state flags, navigate directly to those outposts, keep results live as network data changes, preserve the palette across outpost navigation, reset it on network boundaries, and use conventional autocomplete plus `/` keyboard focus and keyboard-accessible palette movement.**
