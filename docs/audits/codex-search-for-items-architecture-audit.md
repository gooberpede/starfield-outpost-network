# Architecture audit: Search for Items

Date: 2026-09-10

The feature fits the current architecture without schema, persistence, history, or dependency changes. The cleanest design is a controlled, network-local presentation feature owned by `App.tsx`; a small pure localized matching helper; and one pure domain result-derivation helper that reuses the existing production, manufacturing-feasibility, provenance, logistics, and body-resource seams.

No product code was changed for this audit.

## 1. Existing architecture relevant to Search

### Application state, network context, and navigation

- `src/App.tsx` owns the `CollectionEditingSession`, obtains the active document through `getActiveSavedNetwork(collection)`, and derives the selected outpost from `session.context.outpostId`.
- `selectOutpost(outpostId)` dispatches `{ type: 'select-outpost' }`. In `src/domain/collectionEditingSession.ts`, that action updates working context and per-network selection memory without adding a history entry. This is the exact seam result clicks should reuse.
- Direct network switch/add/delete/reset/import functions in `App.tsx` call `resetNetworkPresentationState()`. Undo and Redo first call `getHistoryPresentationReset()` and then apply the returned reset categories.
- `OutpostStatusMatrix` is rendered with `key={selectedOutpost.id}`. That intentional remount clears its local manufacturing draft when the outpost changes. Search state therefore cannot live inside `OutpostStatusMatrix`: it would incorrectly reset on ordinary result navigation.
- `navigationPresentationEpoch` and `cargoPresentationEpoch` demonstrate the existing pattern for resetting presentation state at distinct context boundaries. Search needs a network boundary, not the current outpost-local Cargo boundary.

### Resource Matrix heading and layout

- The insertion point is the direct `<h2>Resource Matrix</h2>` at the start of `src/ui/components/OutpostStatusMatrix.tsx`.
- `src/ui/components/OutpostStatusMatrix.css` currently styles `.outpost-status-matrix > h2`, including the left structural bar, bottom rule, uppercase type, and compact vertical padding. There is no existing heading-strip wrapper or right-side action area.
- The Matrix table's horizontal overflow begins below the heading in `.outpost-status-matrix__scroll`; the search control must remain outside that scroller.
- `WorkspaceLayout` gives the middle column `minmax(0, 3fr)` beside a right column with an `18rem` minimum. The heading can become narrow even before the table reaches its internal `38rem` floor. A flex heading strip must therefore permit the search group to shrink and then wrap below the heading at a real control-width threshold. It must not increase the Matrix table's minimum width.

### Reference catalogues and localization

- `ReferenceData.resources` and `ReferenceData.products` are loaded together by `src/data/referenceDataLoader.ts` from `public/reference-data/resources.json` and `products.json`.
- `ResourceReference` and `ProductReference` both have stable `id`, canonical `name`, and `shortName`; they do not share a named reference-item union. Persisted cross-category identity already exists as `CargoItem = { type: 'resource' | 'product'; id }` in `src/domain/models.ts`.
- `getReferenceDisplayName(kind, id, canonicalName, locale)` in `src/localization/referenceNames.ts` is the active localized-name seam. It currently has the `Aluminium`/`Aluminum` resource overlay and canonical fallback.
- Abbreviations come directly from each record's `shortName`. There is no localized abbreviation resolver or abbreviation overlay today. The current project treats these as canonical reference codes.
- `useLocalization()` exposes `locale` and typed `t()`. `translate()` supports locale fallback, interpolation, and `Intl.PluralRules`; `formatList()` already owns localized conjunctions. `MessageKey` is a closed union and the complete baseline is `en-US.ts`; `en-GB.ts` is a sparse override catalogue.

### Existing flag derivation seams

- Natural/resource presence: `outpost.localResources` supplies recorded inorganic presence. `getAvailableOrganicProductionRoutes()` supplies the source-specific, biome-scoped organic rows whose Matrix `Present` state is lit. `getBodyPresentResourceIds()` is a different body-wide concept that includes wild-only organics and ignores outpost biome scope.
- Resource production: `getActiveProducedResourceIds(outpost)` aggregates persisted active routes. It intentionally counts invalid persisted routes while validation reports contradictions.
- Manufactured production: `getFeasibleManufacturedProductIdsAtOutpost()` implements the fixed-point recipe calculation. `getActuallyAvailableItemsAtOutpost()` includes feasible products but also inbound items, so it must not alone be used to label `PRODUCING`.
- Import provenance: `getItemProvenanceAtOutpost()` reports stable remote outpost IDs when linked remote pads send the exact item. `getImportSummariesAtOutpost()` presents the same inbound relationship grouped for the Matrix.
- Export configuration: `getRoutedExportedItemKeysAtOutpost()` identifies exact typed items on a local outbound pad with an existing routed destination.
- Planned Supply: `outpost.plannedSupply` already stores exact `CargoItem` identities.
- `getManufacturingProducingState()` is a presentation helper over an already-computed actual-item list. It does not distinguish unconfigured, missing-input, and missing-recipe states.
- Validation issues are not a suitable search source. The manufacturing validator emits one issue per missing ingredient, and its `cargoItem` identifies the ingredient. Searching those issues would create precisely the forbidden false hit for a missing recipe input.

### Keyboard, modal, and overlay patterns

- `src/ui/keyboardShortcuts.ts` already centralizes pure recognition and exports `isTextEditingShortcutTarget()`. It protects text-like inputs, textareas, and inherited `contenteditable`, while allowing buttons, selects, and checkbox/radio inputs to remain workspace shortcut contexts. This is the correct `/` guard.
- `App.tsx` has one document-level shortcut listener and already supplies `isDeleteNetworkDialogOpen || isAboutDialogOpen` to history shortcut handling.
- `useModalDialog()` traps focus and handles Escape on the dialog, calls `stopPropagation()`, and restores prior focus. Modal layers use `aria-modal="true"` and `z-index: 2000`.
- `ContextHelp` is a useful non-modal overlay precedent: it uses a `document.body` portal, fixed viewport coordinates, a named semantic surface, outside-pointer handling, resize repositioning, and Escape. It is not draggable.
- Outpost and Cargo Pad reorder controls use HTML Drag and Drop for ordered-list insertion. Their logic is specific to rows/gaps and is not reusable for moving a floating palette. Pointer-event dragging is more appropriate and also works for touch/pen.

## 2. Recommended state model

Own the following in `App.tsx`, preferably behind a small `useItemSearchPresentation` hook if that keeps orchestration readable:

```ts
interface ItemSearchPresentationState {
  draftQuery: string
  highlightedMatchKey: string | null
  submittedItem: CargoItem | null
  isAutocompleteOpen: boolean
  palettePosition: { left: number; top: number } | null
}
```

`resolvedDraftItem` should be computed rather than independently persisted:

- an explicitly highlighted option is the Enter candidate;
- otherwise a uniquely exact normalized name or abbreviation is the submit-control candidate;
- unresolved or ambiguous free text resolves to `null` and opens no result palette.

If implementation clarity benefits from a `resolvedDraftItem` variable, make it a memoized value or reducer transition value tied to the current draft, not a second durable identity that can become stale. Editing `draftQuery` must clear the highlight/explicit resolution but must not change `submittedItem` or close/update existing results. A successful submission copies only `{ type, id }` into `submittedItem`, opens the palette, and leaves an existing non-null position untouched.

The search input needs an `App`-owned ref for `/` focus/select. Controlled state may be passed to a dedicated `SearchForItems` component inserted into the Matrix heading. The palette may be rendered by that component through a portal, while state remains controlled by `App` so the Matrix's outpost-keyed remount cannot lose it.

Do not put any search fields in `NetworkCollection`, `OutpostNetwork`, `CollectionEditingSession`, history snapshots, application preferences, local storage, or import/export JSON.

## 3. Search catalogue and deterministic matching

Build a small memoized display index from `referenceData + locale`:

```ts
interface SearchCatalogueItem {
  item: CargoItem
  key: string                 // `${type}:${id}`
  displayName: string         // getReferenceDisplayName(...)
  abbreviation: string        // reference.shortName
  category: 'resource' | 'product'
  normalizedName: string
  normalizedAbbreviation: string
}
```

This is presentation/localization logic, not persisted reference data. A suitable home is a pure module such as `src/ui/itemSearch.ts`; it can accept already loaded references and a locale without depending on React.

Normalize the query and candidate strings with `trim()`, Unicode NFC normalization, and `toLocaleLowerCase(locale)`. Locale-sensitive folding is inexpensive and appropriate because matching is explicitly against the active localized catalogue; accent/diacritic folding and fuzzy edit distance should not be added for V1.

Assign exactly one best numeric tier per candidate:

1. normalized localized name equals query;
2. normalized abbreviation equals query;
3. localized name starts with query;
4. abbreviation starts with query;
5. localized name contains query.

Sort by tier, then an `Intl.Collator(locale, { sensitivity: 'base', numeric: true })` comparison of `displayName`, then fixed category order (`resource`, `product`), then stable ID. The final two keys guarantee deterministic output even when localized labels collide. Empty trimmed text returns no matches. A sensible autocomplete cap may limit rendered options, but resolution must still use the complete catalogue.

The current generated data contains 75 resources and 30 products. An audit of the combined 105-entry catalogue found no case-insensitive duplicate localized names, duplicate abbreviations, or name/abbreviation cross-collisions for the current en-US/en-GB variants. The types/build pipeline do not enforce uniqueness, so autocomplete should conditionally show a quiet localized `Resource`/`Product` disambiguator when two visible matches share the same name or abbreviation. Identity must always remain `type + ID` regardless of display text.

Abbreviations are not localized today. Use `shortName` as the current active abbreviation, but keep index construction behind one function so a future `getReferenceShortName()` overlay can be added without changing matching or persisted identity.

## 4. Result derivation

Add one pure domain helper, for example `getItemSearchResults(item, network, referenceData)`, returning outpost IDs/names and a stable ordered set of semantic flags. Preserve `network.outposts` order. Include an outpost only when at least one of the six flags is true.

| Flag | Recommended derivation | Existing seam / missing abstraction |
|---|---|---|
| `PRESENT` | Resources only. Mirror the existing Matrix `Present` concept: recorded `outpost.localResources` for inorganic resources; any currently available source-specific organic route for the resource for organics. | Existing data and `getAvailableOrganicProductionRoutes()` are available, but a unified `isResourcePresentAtOutpost()` helper is genuinely missing. See the semantic risk below. |
| `PRODUCING` | Resource ID is in `getActiveProducedResourceIds(outpost)`, or product ID is in `getFeasibleManufacturedProductIdsAtOutpost(outpost.id, ...)`. | Fully supported. `getItemProvenanceAtOutpost(...).local` can expose the same combined boolean, but the lower-level helpers are clearer in a result classifier. |
| `MISSING INPUTS` | Product is configured in `outpost.manufacturing`, has a known recipe, and is not in the feasible-product set. It is mutually exclusive with `PRODUCING`. | Add a small readiness classifier (`unconfigured | producing | missing-inputs | unresolved-reference`) or keep this logic inside the result helper. Do not inspect validation messages/issues. |
| `IMPORTING` | Exact item's `getItemProvenanceAtOutpost(...).remoteOutpostIds.length > 0`. | Fully supported. Alternatively add `getRoutedImportedItemKeysAtOutpost()` beside the existing export-key helper if several consumers need key sets. |
| `EXPORTING` | Exact typed key is in `getRoutedExportedItemKeysAtOutpost()`. | Fully supported. This intentionally follows current Matrix semantics: routed outbound configuration counts even when upstream source validation is unresolved. |
| `PLANNED SUPPLY` | Exact `{ type, id }` exists in `outpost.plannedSupply`. | Fully supported by direct typed identity comparison. |

Emit flags in the brief's order regardless of derivation order. A searched recipe ingredient must never create a result merely because a manufacturing validation issue mentions it.

Compute per-outpost reusable sets once inside the helper (produced resource IDs, feasible product IDs, routed exports, planned keys, and provenance for the submitted item). Do not call whole-network validation. At roughly 24 outposts, 105 catalogue entries, and one submitted item, direct scans are comfortably bounded; no persistent index or cache invalidation scheme is justified.

### The one material `PRESENT` ambiguity

The current domain has no single "resource exists locally at the outpost" fact:

- inorganic Matrix `Present` is a player-recorded `localResources` fact;
- organic Matrix `Present` is a source-specific, biome-scoped, domesticable production-route fact;
- `getBodyPresentResourceIds()` is body-wide and includes wild-only organics, so it is broader than the visible Matrix and not scoped to the selected outpost biome.

The safest implementation interpretation is to mirror the visible Resource Matrix `Present` states as described in the table above. If product intent instead includes every wild/body-present organic resource, a later implementation brief must say so explicitly and define biome scoping. That alternative would be a domain-semantics decision, not merely search plumbing.

## 5. Navigation and live refresh

Result outpost names should be semantic `<button type="button">` controls whose click calls the existing `selectOutpost(outpostId)` callback. That produces ordinary manual selection, updates remembered selection, creates no history entry, and leaves all `App`-owned search state intact.

Derive results with `useMemo` from:

```text
submittedItem.type + submittedItem.id
current active network object
current reference-data snapshot
```

Network updates are immutable, so normal edits and Undo/Redo replace the relevant object identity and naturally rerun the derivation. Do not store result rows or flag booleans. Draft changes are deliberately absent from these dependencies, so typing cannot replace submitted results. Locale changes affect labels and catalogue matching, not semantic flags.

## 6. Presentation ownership and resets

Search is one current-network presentation session, not a per-network remembered map. Keep it across `selectOutpost`; reset it on any network/document boundary:

- `switchNetwork`, `addNetwork`, delete/reset, and successful collection import should call the existing central presentation-reset path and clear the complete search state;
- failed import does nothing because it never reaches `importNetwork()`;
- outpost changes, including result navigation, do not clear it;
- ordinary same-network edits and same-network Undo/Redo preserve it while result flags rederive.

Extend `HistoryPresentationReset` with a `search` (or more general `network`) boolean:

```ts
search = entry.resetsNetworkPresentation || networkChanged
```

Do not include `outpostChanged`, outpost membership, or Cargo Pad membership. This correctly resets search when Undo/Redo crosses networks or replays lifecycle/import replacement, but preserves it for same-network value edits and outpost-context restoration. `App.resetNetworkPresentationState()` can then clear search when `reset.search` is true; its default full reset remains appropriate for direct network lifecycle actions.

An effect keyed only to `session.context.networkId` is insufficient: it would reset after paint (allowing stale results to flash), and it would miss same-ID reset/import replacement actions marked by `resetsNetworkPresentation`.

## 7. Keyboard and autocomplete

### `/` shortcut

Add a pure recognizer/handler in `src/ui/keyboardShortcuts.ts` and reuse `isTextEditingShortcutTarget()`. Recognize `event.key === '/'` only when Ctrl/Alt/Meta are absent and the event is not a repeat. Do not use `isEditableShortcutTarget()`: that broader guard would incorrectly suppress `/` on selects and non-text inputs, which the brief declares eligible workspace contexts.

The `App.tsx` global listener should pass the same aggregate modal-open boolean already used by history. When handled, focus the search input, call `select()` when it contains text, and prevent default. When a modal is open or a genuine text editor owns focus, do nothing and preserve native typing.

### Autocomplete

Use a custom controlled ARIA combobox/listbox; do not use native `datalist`. `datalist` does not provide reliable control over the required five-tier order, explicit highlighted option, category disambiguation, submission rules, or consistent accessible behavior.

Minimum structure:

- a real search `<input>` with an accessible name, `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`;
- a `role="listbox"` below it with stable-ID `role="option"` rows and `aria-selected` on the highlighted option;
- focus remains in the input while Up/Down changes the active descendant;
- Enter submits the highlighted match, or the uniquely resolved exact draft when nothing is highlighted;
- click/pointer selection submits the exact option (prevent input blur before activation where necessary);
- Escape first closes autocomplete and consumes that key;
- one remaining prefix/substring match is not submitted automatically;
- a submit button with a localized accessible name/title attempts the same resolution and does nothing for unresolved/ambiguous free text.

When autocomplete is closed and the palette is open, Escape closes the palette. Search Escape handling must return immediately while a modal is open; modal handling already stops propagation. Because Context Help and active reorder drags also install document Escape listeners, the implementation should avoid independent competing handlers: handle combobox Escape at the input, route palette Escape through the `App` listener, check `event.defaultPrevented`, and document/test priority. No search listener should act on an Escape already consumed by a modal.

## 8. Floating result palette

Render the palette through `createPortal(..., document.body)` and use `position: fixed`. This avoids clipping by the Matrix's horizontal scroller and keeps viewport coordinates stable across outpost navigation and page layout remounts. Keep its z-index below modal backdrops (`2000`) and coordinate with the fixed Status Bar (`1000`) and Context Help (`1100`) so the palette does not obscure higher-priority surfaces.

On first successful submission, measure the search field with `getBoundingClientRect()` and place the palette just below it, clamped to a safe viewport rectangle. Store the resulting top-left coordinate in `App` state. Subsequent submissions update contents without changing that coordinate.

Use title-bar-only Pointer Events rather than the existing HTML Drag and Drop reorder code:

- on pointer down, record pointer ID plus the pointer-to-palette offset and call `setPointerCapture()`;
- on pointer move, update top/left and clamp to the safe viewport rectangle;
- on pointer up/cancel, release capture and commit the last clamped position;
- do not start a drag from the close button;
- add `touch-action: none` only to the drag handle/title-bar drag area.

On resize (which covers ordinary browser zoom), reclamp the existing coordinate. Clamp the whole palette when it fits; if it cannot fit, prioritize keeping the complete title bar and close control reachable. Account for a small viewport margin and the fixed `3.5rem` Status Bar. Large contents should not move the stored top-left: use auto width/height with `max-width: calc(100vw - margins)` and `max-height: calc(100vh - status-bar - margins)`, and put native/internal `overflow: auto` on the results body using the existing `technical-scrollbar` class.

Rows should use a two-part flex/grid layout: outpost button first and a wrapping flag group alongside it. Let the name ellipsize with `title` at ordinary widths; let flags wrap only when required. This follows "adapt before overflowing" without changing the Matrix table layout. Do not add resize handles or docking.

For minimum keyboard compatibility, make the title-bar drag affordance focusable and describe it. Prefer supporting arrow-key nudging (with a larger modified step) using the same clamp helper, analogous to existing reorder buttons being a keyboard alternative to drag. This can remain small local logic and avoids baking in a pointer-only interaction that a later accessibility audit must replace.

## 9. Localization

Add typed baseline keys, with en-GB overrides only where wording differs. Likely keys are:

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

`search.results.found` should be one complete plural-aware message, for example `{item} was found at {count} {count, plural, one {outpost} other {outposts}}.`. Do not branch on English nouns in JSX. Use `getReferenceDisplayName()` for the submitted item and every autocomplete option. Outpost names are user data and must not be translated.

On locale change:

- retain `submittedItem` stable identity and palette position/open state;
- rerender the submitted item name, summary, categories, flags, descriptions, and accessible labels through the new locale;
- rebuild and rerank the autocomplete index and rematch the unchanged draft text;
- do not translate or rewrite `draftQuery`;
- recompute/clear `highlightedMatchKey` if that option no longer appears under the unchanged draft;
- recompute `resolvedDraftItem`; for example, free text `Aluminum` may cease to resolve after switching to en-GB, while a previously submitted `{ type: 'resource', id: 'aluminium' }` remains selected and displays as `Aluminium`.

## 10. Accessibility compatibility

This is not the deferred full accessibility audit, but the implementation should preserve these seams:

- use an explicit accessible input name; placeholder text is not a label;
- use the combobox/listbox relationships and active-descendant keyboard model described above;
- keep visible `:focus-visible` treatment on input, submit, options where focusable, result navigation, palette close, and keyboard drag affordance;
- render outpost navigation as buttons, not clickable spans;
- give the `×` a localized accessible name and title;
- expose the non-modal palette as a named `role="region"` (preferred here) linked to its visible title. Do not claim `aria-modal`, trap focus, or apply modal scroll locking;
- optionally place the changed result summary in a restrained `aria-live="polite"` status so submissions/live flag changes are announced without repeatedly announcing the entire result list;
- keep drag semantics separate from the title text and provide keyboard movement/instructions as noted above.

## 11. Testing plan

The repository's current `npm test` setup is Node's test runner with pure TypeScript tests; it has no DOM/component-test environment. Maximize pure coverage without adding a dependency implicitly.

### Pure unit/helper tests

- `itemSearch` matching: every tier, trimming, case folding, no match, no auto-submit, exact ambiguity, deterministic ties, resource/product namespacing, collision disambiguation, and en-US/en-GB `Aluminum`/`Aluminium` behavior.
- result derivation: each flag, stable flag order, multiple flags, multiple outposts, no results, product `PRODUCING` versus `MISSING INPUTS`, unknown/missing recipe behavior, no false hit from a missing ingredient, routed import/export, and Planned Supply coexistence.
- shortcut helper: `/` normal workspace, modifiers/repeat, every text-editing target, contenteditable descendants, and eligible select/button/checkbox targets.
- palette geometry: initial placement, each viewport edge, oversized palette/title-bar recoverability, resize/zoom reclamping, and Status Bar safe area.
- history reset helper: same-network value Undo/Redo preserves search; cross-network and reset/import traversal resets it; outpost-only context restoration does not.
- localization: complete keys, found-count singular/plural, flag labels, accessible copy, and submitted stable-ID display after locale change.

### Component tests (if a DOM harness is deliberately approved)

- Up/Down/Enter/Escape combobox behavior and ARIA attributes;
- click option submission and unresolved submit behavior;
- draft/submitted separation and locale rematch;
- result click calls navigation without closing the palette;
- live rerender after network prop changes;
- pointer capture and keyboard palette movement;
- new submission retains position and network reset discards it.

Adding React Testing Library plus a DOM implementation would be a separate dependency/tooling decision. It is not required to prove the pure semantics and should be called out explicitly in the later implementation brief rather than slipped into the feature.

### Manual browser checks

- visual placement in the real Resource Matrix heading at wide, compressed, zoomed, and narrow viewports;
- autocomplete pointer/focus behavior, scrolling, long labels, and conditional category labels;
- all Escape priorities, including both existing modals and Context Help;
- `/` from Matrix buttons, selects, checkboxes, ordinary text inputs, and while a modal is open;
- drag by mouse/touch/pen where available, title-bar-only activation, close-button behavior, resizing/zoom recoverability, and large-result scrolling;
- result navigation with palette/draft/position preservation;
- same-network edits and Undo/Redo live-refresh flags; cross-network Undo/Redo reset all search presentation;
- en-US/en-GB switch while draft, autocomplete, and results are simultaneously open.

## 12. Risks and open questions

1. **`PRESENT` meaning is not unified.** The later implementation brief should confirm whether Search mirrors the visible Matrix semantics (recommended) or includes broader wild/body-present organics.
2. **Manufacturing readiness needs an explicit classifier.** Treating every configured-but-not-feasible product as `MISSING INPUTS` would mislabel missing recipe/reference data, even though the current generated catalogue has complete recipes for all 30 products.
3. **"Actually exported" follows current routed-configuration semantics.** `getRoutedExportedItemKeysAtOutpost()` does not require the exported item to have a valid source. This matches existing Matrix/validation architecture; requiring source-valid exports would be a domain change.
4. **Escape has existing consumers.** Context Help and active reorder drags use independent document listeners. Search should centralize/check consumption so one key does not unexpectedly close several surfaces.
5. **Palette state must survive the Matrix remount.** Any locally owned implementation will fail ordinary result navigation because `OutpostStatusMatrix` is keyed by outpost ID.
6. **Current abbreviations are invariant.** Future locales that require localized abbreviations need a new resolver, but no schema change.

No agreed requirement is fundamentally incompatible with the architecture. The feature mainly exposes missing aggregation and presentation helpers; it does not require validation, persistence, history, or state-management redesign.

## 13. Likely implementation files

Expected modifications:

- `src/App.tsx` — state owner, refs, submission/reset orchestration, result navigation, global shortcuts, live derivation.
- `src/ui/components/OutpostStatusMatrix.tsx` and `.css` — heading-strip insertion point and responsive layout.
- `src/ui/keyboardShortcuts.ts` — pure `/` recognizer/handler.
- `src/domain/collectionEditingSession.ts` — expose the search/network presentation reset category for history traversal.
- `src/localization/types.ts`, `locales/en-US.ts`, and possibly `locales/en-GB.ts` — typed messages/plurals.
- `tests/keyboardShortcuts.test.ts`, `tests/collectionEditingSession.test.ts`, and `tests/localization.test.ts` — extensions.

Likely new files:

- `src/domain/itemSearchResults.ts` — pure six-flag result classification.
- `src/ui/itemSearch.ts` — localized display-index construction, ranking, and exact resolution.
- `src/ui/itemSearchPosition.ts` — pure viewport placement/clamping, if not kept small inside the component.
- `src/ui/components/SearchForItems.tsx` and `.css` — controlled combobox/submit UI and portal palette (or split the palette into a second component if the file becomes large).
- `tests/itemSearch.test.ts` and `tests/itemSearchResults.test.ts` (plus a position test if separated).

Possible small domain modification:

- `src/domain/bodyResourceAvailability.ts` for a unified resource-present helper, or keep that helper in `itemSearchResults.ts` while delegating to the existing body-resource functions.
- `src/domain/logistics.ts` only if a reusable imported-item-key helper is preferred over provenance.

No changes should be needed in data loading, serialization, migrations, storage, persisted models, validation rules, reference JSON/CSV, or package dependencies.

## 14. Recommended implementation sequence

1. Confirm the one `PRESENT` interpretation and encode the six flag rules as pure domain tests/helper.
2. Add the pure localized search index/ranking/resolution helper and collision tests.
3. Add localization keys and plural tests.
4. Extend shortcut and history presentation-reset helpers with focused tests.
5. Add `App`-owned controlled state, submitted-item live derivation, and manual result navigation.
6. Replace the Matrix heading node with the minimal responsive heading strip and combobox.
7. Add the portal palette, stable position, clamping, scrolling, pointer drag, keyboard movement, and Escape priority.
8. Run `npm test`, `npm run build`, `npm run lint`, and `git diff --check`; then perform the interaction/zoom/locale/manual regression checks above.

## Direct answers to the audit questions

1. Search UI state should live in `App.tsx` (optionally through a hook), outside persisted and history state.
2. Scan the current active network with one pure result helper for the submitted typed identity.
3. Store only the submitted `CargoItem`; derive rows/flags from it plus the current network/reference data.
4. Use `localResources`/body-resource helpers, `getActiveProducedResourceIds`, `getFeasibleManufacturedProductIdsAtOutpost`, `getItemProvenanceAtOutpost`, `getRoutedExportedItemKeysAtOutpost`, and `plannedSupply` as mapped above.
5. Add one aggregate result classifier, a unified resource-present predicate, and a manufacturing-readiness classifier; an imported-item key helper is optional.
6. Merge resources/products into a locale-built display index whose identity is `type + ID`.
7. Numeric tier, localized display-name collation, fixed category order, then stable ID.
8. Reuse `t()`, the baseline/override catalogues, `Intl.PluralRules`, and `getReferenceDisplayName()`.
9. Result clicks should invoke `App.selectOutpost()` / the existing `select-outpost` session action.
10. Preserve on outpost changes; clear through the existing network presentation-reset path.
11. Extend `getHistoryPresentationReset()` so only network/lifecycle boundaries reset search; same-network traversal rederives flags and preserves UI.
12. Reuse `isTextEditingShortcutTarget()` and the same App-owned modal-open aggregate used for history shortcuts.
13. Use a controlled ARIA combobox/listbox; native `datalist` is insufficient and no dependency is needed.
14. Portal a fixed palette; pointer-capture title-bar drag; clamp to a viewport/status-bar safe rectangle on open, drag, and resize; preserve top-left across new submissions.
15. The current direct-child `<h2>` selector must become a flex/wrapping strip, and the control must not join or widen the Matrix scroller.
16. Preserve stable submitted identity and free-text draft; rerender labels and rebuild/rematch autocomplete for the new locale.
17. No current collisions were found across 105 entries, but uniqueness is not guaranteed; tie-break and conditionally disambiguate.
18. Likely files are listed in section 13.
19. Highest risks are `PRESENT` semantics, state ownership across keyed remounts/history, Escape/modal coordination, and recoverable palette geometry.
20. No requirement is incompatible; only the exact breadth of `PRESENT` needs explicit product confirmation.
