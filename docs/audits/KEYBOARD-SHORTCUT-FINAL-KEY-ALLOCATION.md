# Keyboard Shortcut Final Key Allocation Audit

## 1. Executive summary

The proposed actions fit the existing application architecture. The revised preferred map removes the original Magnifier conflicts without requiring four-key chords, but three physical punctuation assignments should still change for keyboard-layout clarity.

- All 15 proposed chords are internally unique and do not collide with the current 8 bindings. The current `Ctrl+Y` / `Ctrl+Shift+Z` Redo pair remains the only intentional alias.
- Microsoft Edge does not reserve any exact proposed chord in its published shortcut list.
- Windows Magnifier claims six chords from the original provisional map while Magnifier is active: `Ctrl+Alt+I`, `Ctrl+Alt+L`, `Ctrl+Alt+D`, `Ctrl+Alt+M`, `Ctrl+Alt+R`, and `Ctrl+Alt+-`. The revised preferred map avoids all six.
- A follow-up check found Magnifier reading commands omitted from the first audit: the default reading modifier is Ctrl+Alt, with `Ctrl+Alt+H` for the previous sentence, `Ctrl+Alt+K` for the next sentence, and `Ctrl+Alt+Enter` for start/pause/resume. None conflicts with the revised preferred map, but `H`, `K`, and `Enter` should not be used as replacements.
- Use the revised `Ctrl+Alt+,` for Expand All and `Ctrl+Alt+.` for Collapse All. Match physical `Comma` and `Period` codes, retain the visible `,` and `.` key-cap labels, and keep the AltGraph/composition guards.
- `Ctrl+Alt+[`, `Ctrl+Alt+]`, and `Ctrl+Alt+'` have no known Windows/Edge reservation, but are not suitable as statically labelled physical shortcuts across the supported layouts. On German and Japanese keyboards, `BracketLeft`, `BracketRight`, and `Quote` do not consistently carry `[`, `]`, and `'`; logical production of those characters may instead require AltGr/Shift or different physical keys.
- Replace those three with `Ctrl+Alt+B` (Focus Navigation, “navigation bar”), `Ctrl+Alt+W` (Show/hide Navigation, “workspace”), and `Ctrl+Alt+J` (Jump to Search Results). These preserve the three-key pattern and have no identified Windows/Edge accessibility collision.
- `Ctrl+Alt+1/2/3` are practical if they match `Digit1` / `Digit2` / `Digit3` by `code`, exclude the numeric keypad, and retain the existing AltGraph guard. Logical `key` matching would make the family unreliable on layouts such as French AZERTY and when AltGr changes the produced character.
- The registry needs only a small display-token extension for code-matched comma, period, and number-row keys. Dynamic availability and focus resolution should remain in action handlers/components.
- Parcel 3 is **medium**, not small: the registry work is straightforward, but reliable focus ownership crosses `App`, Navigation, Search Results, Resource Matrix, Planned Supply, Cargo Links, import/export controls, localization, Help layout, and tests.

The final recommendation adopts 12 of the 15 revised preferred assignments as written and replaces only the bracket/quote trio. No new shortcut requires `Shift` as a fourth key.

## 2. Existing shortcut baseline

The registry currently contains 8 bindings for 7 logical actions:

| Chord | Logical action | Notes |
|---|---|---|
| `Ctrl+Z` | Undo | Existing |
| `Ctrl+Y` | Redo | Canonical Redo binding |
| `Ctrl+Shift+Z` | Redo | Intentional alias of `Ctrl+Y` |
| `/` | Focus Search for Items | Shift is optional; suppressed during text editing |
| `Ctrl+Alt+N` | Add outpost | Existing broad-editable suppression |
| `Ctrl+Alt+ArrowUp` | Previous outpost | Existing binding; Windows Magnifier can use the same chord to pan while active |
| `Ctrl+Alt+ArrowDown` | Next outpost | Existing binding; Windows Magnifier can use the same chord to pan while active |
| `Ctrl+Alt+V` | Toggle Validation details | Existing |

The existing dispatcher rejects repeats, composition, AltGraph, modal operation, and inappropriate editable targets. It calls `preventDefault()` only after an action reports that it was handled. Parcel 3 should preserve that contract.

The pre-existing Magnifier overlap on the two arrow bindings is outside this parcel. It should be documented as a known baseline concern, not used to justify adding more Magnifier collisions.

## 3. Final candidate action inventory

Parcel 3 proposes 15 new logical actions:

- Import / Export: 2
- Cargo Links: Add, Collapse All, Expand All, Focus: 4
- Workspace/navigation: Show/hide Navigation, Focus Navigation, Focus Outpost Details, Focus Resource Matrix, Focus Planned Supply, Focus Search Results: 6
- Matrix internal landmarks: first Inorganic Present, first Organic Present, Manufacturing Edit/Save: 3

Counts after Parcel 3:

| Measure | Count |
|---|---:|
| Current logical actions | 7 |
| Proposed new logical actions | 15 |
| Final logical actions | 22 |
| Final chord bindings, including the Redo alias | 23 |

The explicitly excluded network switching/creation, reorder, deletion, Validation focus, About, and Help commands should remain excluded.

## 4. Proposed key map assessment

The first brief's provisional map exposed the Magnifier conflicts recorded below. The follow-up's revised preferred map successfully reallocates those commands to three-key chords. Its bracket/quote physical-position idea is coherent on US/UK keyboards, but static `[`, `]`, and `'` Help labels do not describe the corresponding physical keys on German and Japanese layouts.

| Action | Original provisional | Revised preference | Final recommendation |
|---|---|---|---|
| Import | `Ctrl+Alt+I` | `Ctrl+Alt+O` | `Ctrl+Alt+O` |
| Export | `Ctrl+Alt+E` | `Ctrl+Alt+S` | `Ctrl+Alt+S` |
| Add Cargo Link | `Ctrl+Alt+L` | `Ctrl+Alt+A` | `Ctrl+Alt+A` |
| Expand all Cargo Links | `Ctrl+Alt+=` | `Ctrl+Alt+,` | `Ctrl+Alt+,` |
| Collapse all Cargo Links | `Ctrl+Alt+-` | `Ctrl+Alt+.` | `Ctrl+Alt+.` |
| Focus Navigation | `Ctrl+Alt+O` | `Ctrl+Alt+[` | `Ctrl+Alt+B` |
| Show/hide Navigation | `Ctrl+Alt+H` | `Ctrl+Alt+]` | `Ctrl+Alt+W` |
| Focus Outpost Details | `Ctrl+Alt+D` | `Ctrl+Alt+T` | `Ctrl+Alt+T` |
| Focus Resource Matrix | `Ctrl+Alt+M` | `Ctrl+Alt+G` | `Ctrl+Alt+G` |
| Focus Cargo Links | `Ctrl+Alt+C` | `Ctrl+Alt+C` | `Ctrl+Alt+C` |
| Focus Planned Supply | `Ctrl+Alt+P` | `Ctrl+Alt+P` | `Ctrl+Alt+P` |
| Focus Search Results | `Ctrl+Alt+R` | `Ctrl+Alt+'` | `Ctrl+Alt+J` |
| Focus first Inorganic Present | `Ctrl+Alt+1` | `Ctrl+Alt+1` | `Ctrl+Alt+1` |
| Focus first Organic Present | `Ctrl+Alt+2` | `Ctrl+Alt+2` | `Ctrl+Alt+2` |
| Focus Manufacturing Edit/Save | `Ctrl+Alt+3` | `Ctrl+Alt+3` | `Ctrl+Alt+3` |

The final letter replacements use `B` for the Navigation bar, `W` for the Workspace Navigation pane, and `J` for Jump to Search Results. They trade the revised map's US-keyboard spatial analogy for portable visible mnemonics. The comma/period Cargo pair remains physical and keeps the revised intentional order: left/comma expands, right/period collapses.

## 5. Internal collision review

There are no exact internal collisions among the provisional chords, the corrected chords, or the current registry. No proposed chord duplicates a local Search input, results-palette, Cargo reshuffle, matrix editing, dialog, or browser-level handler contract.

The Redo alias is intentional and is already represented with `aliasOf`. No new action should be modeled as an alias: Collapse All and Expand All are separate commands, and each focus command has a distinct semantic destination.

The handlers must continue to short-circuit when `event.defaultPrevented` is true or otherwise be composed in a deterministic order. The current application handler and Validation handler are separate document listeners; Parcel 3 should avoid making registration order part of correctness.

## 6. Windows / Edge collision review

Microsoft's current [Edge shortcut list](https://support.microsoft.com/en-us/edge/keyboard-shortcuts-in-microsoft-edge) contains related single- or two-modifier commands, but none of the exact revised three-key chords. For example, Edge uses `Ctrl+O` for Open and `Ctrl+S` for Save; adding Alt distinguishes the revised Import/Export commands.

Microsoft's [Windows accessibility shortcut list](https://support.microsoft.com/en-au/accessibility/windows/windows-keyboard-shortcuts-for-accessibility) assigns Magnifier commands to:

- `Ctrl+Alt+I` — invert colors;
- `Ctrl+Alt+L` — lens view;
- `Ctrl+Alt+D` — docked view;
- `Ctrl+Alt+M` — cycle Magnifier views;
- `Ctrl+Alt+R` — resize the lens;
- `Ctrl+Alt+-` — toggle between the chosen magnification and 1x;
- `Ctrl+Alt+Arrow` — pan, relevant to the existing baseline.

These commands are conditional on Magnifier, but they are genuine accessibility/system collisions: the browser application may not receive them, and it should not compete with an assistive feature.

The first audit missed Magnifier's separate reading commands. Microsoft's [Magnifier reading guidance](https://support.microsoft.com/en-US/accessibility/windows/magnifier/how-to-use-magnifier-reading) says the default reading modifier is Ctrl+Alt and assigns `Ctrl+Alt+Enter` to start/pause/resume, `Ctrl+Alt+H` to the previous sentence, and `Ctrl+Alt+K` to the next sentence. None of the revised preferred chords conflicts with these commands. They do rule out `H` as a safe Show/hide Navigation fallback.

### Collision matrix

| Revised chord | Action | Internal collision | Windows/Edge collision | AltGr/layout risk | `key` vs `code` recommendation | Verdict |
|---|---|---|---|---|---|---|
| `Ctrl+Alt+O` | Import (Open) | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+S` | Export (Save) | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+A` | Add Cargo Link | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+,` | Expand all Cargo Links | None | No obvious exact collision | Low; common layouts retain the physical adjacent pair | Physical `Comma` code plus `,` display token | **Accept with guard** |
| `Ctrl+Alt+.` | Collapse all Cargo Links | None | No obvious exact collision | Low; common layouts retain the physical adjacent pair | Physical `Period` code plus `.` display token | **Accept with guard** |
| `Ctrl+Alt+[` | Focus Navigation | None | No obvious exact collision | High: physical key is not labelled `[` on German/Japanese layouts; logical `[` often needs AltGr | Physical intent requires `BracketLeft`, but static Help label misleads | **Change recommended** to `Ctrl+Alt+B` |
| `Ctrl+Alt+]` | Show/hide Navigation | None | No obvious exact collision | High: physical key is not consistently labelled `]`; logical `]` often needs AltGr | Physical intent requires `BracketRight`, but static Help label misleads | **Change recommended** to `Ctrl+Alt+W` |
| `Ctrl+Alt+T` | Focus Outpost Details | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+G` | Focus Resource Matrix | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+C` | Focus Cargo Links | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+P` | Focus Planned Supply | None | No obvious exact collision | General Ctrl+Alt/AltGr concern | `key` for mnemonic letter | **Accept with guard** |
| `Ctrl+Alt+'` | Focus Search Results | None | No obvious exact collision | High: `Quote` yields other legends/characters on German and Japanese layouts | Physical intent requires `Quote`, but static Help label misleads | **Change recommended** to `Ctrl+Alt+J` |
| `Ctrl+Alt+1` | First Inorganic Present | None | No obvious exact collision | AltGr and non-US number-row output vary | Physical `Digit1` code; exclude numpad | **Accept with guard** |
| `Ctrl+Alt+2` | First Organic Present | None | No obvious exact collision | AltGr+2 commonly produces `²`; French unshifted key is not `2` | Physical `Digit2` code; exclude numpad | **Accept with guard** |
| `Ctrl+Alt+3` | Manufacturing Edit/Save | None | No obvious exact collision | AltGr+3 commonly produces `³`; layout output varies | Physical `Digit3` code; exclude numpad | **Accept with guard** |

“No obvious exact collision” is a practical Windows/Edge baseline, not a claim that no optional utility can ever register the chord.

## 7. AltGr and keyboard-layout review

[`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) is the produced logical value after modifier state and keyboard layout are applied. [`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) identifies a physical position and ignores layout. The [UI Events specification](https://www.w3.org/TR/uievents/) demonstrates that the same `Digit2` code yields `2`, `@`, `"`, or `é` depending on layout and Shift state, and that a physical quote key may yield `'`, `:`, or `Dead` on US, Japanese, and US-International layouts.

Consequences for Parcel 3:

- Keep mnemonic letters on `key`. Users should invoke the letter named in Help, rather than an arbitrary QWERTY position. This is consistent with the current registry.
- Match the recommended Cargo pair by physical `Comma` and `Period` codes. Their purpose is a paired adjacent-key gesture, and their unshifted printed legends remain comma/period across the representative US, UK, German, and Japanese layouts. Display the intended key caps separately from the code token.
- Match matrix landmarks by `Digit1`, `Digit2`, and `Digit3` codes. This gives a stable top-row family on US/UK, German/European, Japanese, and non-Latin layouts. It also deliberately excludes `Numpad1/2/3`.
- Do not use `BracketLeft`, `BracketRight`, or `Quote` with static `[`, `]`, and `'` display tokens for this multilingual application. Code matching would preserve positions but not the advertised key caps; key matching would preserve characters but make German brackets depend on AltGr and move them away from the intended positions.
- Keep `shift: false` for the Cargo comma/period pair, numeric landmarks, and all recommended letter chords.
- Keep `isComposing` suppression. IMEs can suppress or transform keyboard events, and a shortcut must not fire during composition.

AltGr is a material risk for the entire Ctrl+Alt family because browsers/platforms may expose AltGr through Ctrl and Alt modifier state. It is especially visible for `E`, `M`, `2`, and `3` on representative German layouts, but it is not limited to those keys. The existing `event.key === 'AltGraph' || event.getModifierState('AltGraph')` guard is the right policy and must apply to every new action. MDN documents the platform variation in [`getModifierState('AltGraph')`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState); tests should cover the supported Chromium/Edge behavior rather than assuming every engine reports it identically.

With that guard, AltGr does not require rejecting the accepted bindings. It does mean users must press an actual Ctrl+Alt combination, not AltGr, and Help should continue to spell out `Ctrl + Alt`.

## 8. Punctuation and numeric-key analysis

The original `-` / `=` intent was understandable but not practical as proposed:

- `Ctrl+Alt+-` conflicts with Magnifier.
- Logical `=` is unshifted on US/UK but not universally available with `shiftKey === false`.
- `key: '-'` or `key: '='` also permits the numeric keypad unless location/code is checked.
- Matching `Minus` / `Equal` by code would stabilize physical positions, but their printed legends differ on German and Japanese layouts; Help saying `-` / `=` would not describe every keyboard.

The revised comma/period pair retains adjacency, has no known Windows/Edge reservation, and is less layout-sensitive across the supported baseline. It should use `code` because the action is explicitly tied to the physical pair. Preserve the revised direction: comma/left is Expand; period/right is Collapse.

The bracket/quote proposal is different. The physical positions are coherent only if Help is understood as naming US key positions rather than the keys users can see:

| Layout | `BracketLeft` / `BracketRight` positions | `Quote` position | Assessment of static `[`, `]`, `'` labels |
|---|---|---|---|
| US | `[`, `]` | `'` | Accurate |
| UK | `[`, `]` | Apostrophe/@ key | Substantially accurate |
| German | Typically Ü and +/* positions; logical brackets are commonly AltGr+8/9 | Typically Ä position; apostrophe is elsewhere/shifted | Misleading |
| Japanese JIS | Positions/legends differ; one bracket may remain nearby but the pair is not `[`, `]` as on US | The standard `Quote` example yields `:` | Misleading |

`BracketLeft`, `BracketRight`, and `Quote` would be the technically correct matching strategy if the product explicitly chose US physical-position shortcuts and labelled them as such. That is not recommended here because Help renders key-cap notation and the application supports Japanese. Logical `key` matching is also unsuitable: it destroys the intended physical relationship and collides with AltGr production on layouts that use AltGr for brackets. The portable resolution is to use the final `B`, `W`, and `J` letter assignments with `key` matching.

The number shortcuts are practical as physical top-row landmarks. `code` is preferable to `key` here because their meaning is ordinal, not textual. The action labels—not the digits alone—must explain the destination.

## 9. Action-by-action behavior and focus contracts

All commands should be suppressed while any modal is open, during composition/AltGraph/repeat, and from the same editable targets as comparable current application commands. An unavailable action returns false, leaves browser defaults unprevented, and makes no state change.

| Action | Exact contract | Absent/unavailable behavior |
|---|---|---|
| Import | Invoke the same hidden file-input `.click()` path as the visible Import button. Do not replace the chooser or parsing path. On cancel, leave focus with the invoking control/browser's normal restoration. On success/failure, retain current status and import behavior. | No file input/ref: no-op, no `preventDefault()` |
| Export | Invoke the same export function as the visible button once. Repeat suppression prevents held-key download bursts. Preserve focus after the download attempt. | No active export owner: no-op, no `preventDefault()` |
| Add Cargo Link | Invoke the existing visible Add path. In current terminology this creates a new **unlinked cargo pad** in the Cargo Links section; it does not immediately create a network-level `CargoLink`. Capacity is warning-only and never disables Add. After render, focus the new pad's disclosure button; keep its default collapsed state. | No selected outpost/Cargo owner: no-op, no `preventDefault()` |
| Show/hide Navigation | Use the current `isNavigationOpen` action path. Showing does not move focus. When hiding while focus is anywhere in Navigation, repair focus to the visible Show Navigation button; this is the strongest existing stable fallback. If focus is outside Navigation, leave it in place. | Workspace unavailable: no-op |
| Focus Navigation | If visible, focus the selected outpost button; if selection is unexpectedly unresolved, focus the first outpost button; if no outposts exist, focus a programmatically focusable Navigation heading/region. Do not toggle visibility. | Hidden Navigation: no-op; do not reveal it |
| Focus Outpost Details | Focus the selected outpost name input, the first meaningful editable control in the section. | No selected outpost/details content: no-op |
| Focus Resource Matrix | Focus the Resource Matrix heading/region via a programmatic `tabIndex=-1` landmark. Do not focus Search or change a matrix value. | Matrix not rendered (for example, reference data unavailable): no-op |
| Focus Cargo Links | Focus the Cargo Links heading/region via a programmatic `tabIndex=-1` landmark. Do not add, expand, or select a pad. | No selected outpost/Cargo section: no-op |
| Focus Planned Supply | Focus the existing expand/collapse disclosure button whether collapsed or expanded. Do not change its state. | No selected outpost/section: no-op |
| Focus Search Results | If the palette is visible, keep current focus if it is already inside; otherwise focus the palette region, matching its existing post-submit focus contract. Do not reopen, submit, or focus Search. | Palette absent/hidden: no-op, no `preventDefault()` |
| First Inorganic Present | Focus the Present button associated with `inorganicRows[0]`, which is the first rendered current Inorganic row. Use an explicit ref or semantic target, not `nth-child`. Never click/toggle it. | No row/control, or target disabled and therefore not focusable: no-op |
| First Organic Present | Focus the read-only Present indicator associated with `organicRows[0]`. The current indicator is a non-focusable `span`; Parcel 3 needs a programmatic ref and `tabIndex=-1` on this designated target. Never alter state. | No Organic row/indicator: no-op |
| Manufacturing Edit/Save | Focus Edit when `draftManufacturing === null`; focus Save when a draft exists. Use separate refs on those exact buttons. Never enter/leave edit mode and never substitute Cancel. | Matrix/Manufacturing action absent: no-op |

The application currently always has an active saved network by collection invariant, but handlers should still use mounted owner/ref availability rather than assuming a target exists.

## 10. Cargo expand/collapse semantics

Cargo pad expansion is component-local presentation state (`expandedPadIds`) and correctly produces no domain history. The current visible button derives `areAllCargoPadsExpanded` and toggles between all collapsed and all expanded. From a mixed state it expands all; a second click is required to collapse all.

Parcel 3 can cleanly expose independent commands with a small local refactor:

1. Add a shared `setAllCargoPadsExpanded(expanded: boolean)` helper that updates the current outpost's pad IDs while preserving unrelated entries.
2. Route the visible toggle through `setAllCargoPadsExpanded(!areAllCargoPadsExpanded)`.
3. Route shortcuts directly through `setAllCargoPadsExpanded(false)` and `setAllCargoPadsExpanded(true)`.

This guarantees both commands from mixed state without depending on the visible button label. With zero pads, return false and do not prevent default. No product decision or persisted-state/history change is required.

## 11. Search Results focus behavior

The palette is conditionally portalled and already exposes a focusable `section[role=region][tabIndex=-1]`. Submission by Enter sets a flag and focuses that region after it mounts. Reuse that existing region ref/contract.

- Zero results: focus the palette region so its summary is the stable owner.
- One or many results: also focus the palette region; the palette has no active-result state and inventing one is outside scope.
- Focus already inside: report handled without moving focus.
- Hidden/absent: no-op and do not prevent default.

This satisfies the strict requirement without reopening the palette or conflating it with `/`.

## 12. Matrix landmark focus behavior

The current row arrays are semantic sources of truth:

- Inorganic rows: ordinary resources sorted by localized display name, followed by explicit-presence resources.
- Organic rows: source class (plant, herbivore, carnivore, then unknown), then localized resource/species names; recovery-only unspecified routes sort first under the existing comparator.

The shortcut targets must follow those arrays exactly, including recovery-state ordering. Do not query “the first button in the third column” or assume a fixed child index. Attach a ref or stable semantic data attribute while rendering the first entry of each row array.

The Inorganic Present target is an editable button. The Organic Present target is intentionally read-only and therefore needs programmatic focusability, not conversion into a button. Manufacturing requires direct Edit and Save refs because its destination changes with local draft state.

## 13. Registry impact

The registry already represents unique actions, aliases, groups, focus policies, punctuation/numeric strings, and `key`/`code` matching. Focus-only behavior, dynamic destinations, availability, and `preventDefault()` decisions belong outside static metadata.

One small extension is recommended: separate the physical match token from the displayed key cap for comma, period, and top-row digits. For example:

```ts
chord: {
  key: 'Digit1',
  displayKey: '1',
  match: 'code',
  // modifiers...
}
```

Equivalent naming is acceptable. Without it, the current formatter would display `Digit1`, `Comma`, or `Period` rather than `1`, `,`, or `.`. Do not put callback refs, availability predicates, or dynamic target selection in the registry.

Use one shared application-command dispatcher (or small action-family handlers using the same matcher) so every action inherits modal, repeat, composition, AltGraph, editable, and handled-only-default-prevention policy.

## 14. Help dialog layout implications

The final Help content grows from 7 to 22 logical rows, with 23 badges because Redo has two chords. The current `35rem` dialog and two equal columns are insufficient, as already demonstrated by the current Arrow Up/Validation overlap.

Parcel 3 should:

- widen the dialog to approximately `min(58rem, calc(100vw - 2rem))`;
- keep two columns only while each column has enough room for label plus chord cell;
- switch to one column at a content-driven breakpoint around `54rem`, not the current `42rem` viewport rule;
- give chord cells a dedicated minimum width sufficient for `Ctrl + Alt + Arrow Down` and keep each chord badge on one line;
- let the Redo row wrap between its two complete badges, never inside either badge;
- keep ordinary typography sizes; do not abbreviate, truncate, or reduce text;
- lay groups out deliberately by category, not merely by equal auto-flow. Keep each group intact and balance total row height between columns;
- retain internal scrolling under short viewport heights and ensure the title/close controls remain immediately reachable.

Suggested desktop column distribution:

- Left: History, Search, Outpost Navigation, Workspace.
- Right: Resource Matrix, Cargo Links, Import / Export, Validation.

## 15. Help visual-style recommendation

Help should adopt About's established dialog language while remaining wider and scrollable:

- the same structural-dark uppercase title treatment and header divider;
- `var(--ui-highlight)` background, matching border, radius, and backdrop treatment;
- the same header spacing, icon-close size/transparent border, hover/focus treatment, and footer Close button styling;
- consistent body spacing and section headings derived from the same font/color hierarchy;
- `box-sizing: border-box` on the dialog and backdrop;
- Help-specific group/grid and `<kbd>` styling where content needs differ.

Pixel-identical width is neither necessary nor desirable. Visual grammar should match; content geometry should serve the larger shortcut inventory.

## 16. Final grouping recommendation

Use eight groups:

1. **History** — Undo; Redo (both chords in one logical row).
2. **Search** — Focus Search; Focus Search Results.
3. **Outpost Navigation** — Add Outpost; Previous Outpost; Next Outpost.
4. **Workspace** — Show/hide Navigation; Focus Navigation; Focus Outpost Details; Focus Planned Supply.
5. **Resource Matrix** — Focus Resource Matrix; first Inorganic Present; first Organic Present; Manufacturing Edit/Save.
6. **Cargo Links** — Focus Cargo Links; Add Cargo Link; Collapse All; Expand All.
7. **Import / Export** — Import; Export.
8. **Validation** — Toggle Validation details.

This keeps the three numbered matrix landmarks together and presents Cargo Collapse/Expand as distinct rows without creating a separate one-row Planned Supply group.

## 17. Test plan

### Registry and matching

- Assert unique chord signatures across all 23 bindings, allowing only the explicit Redo alias at the action level.
- Test `Comma`, `Period`, `Digit1`, `Digit2`, and `Digit3` physical-code matching and rejection of wrong code/right character combinations.
- Confirm `Numpad1/2/3`, numpad subtract, and numpad decimal do not activate the physical top-row/punctuation shortcuts.
- Confirm all final new chords reject Shift and other extra modifiers.
- Add representative layout fixtures showing why `BracketLeft`, `BracketRight`, and `Quote` are not registered under static `[`, `]`, and `'` labels.
- Test AltGraph via both `key === 'AltGraph'` and `getModifierState('AltGraph')` for every new action family.
- Retain repeat, composition, modal, text-editing, and broad-editable suppression tests.
- Assert unavailable/no-op actions do not call `preventDefault()`; handled actions call it exactly once.

### Behavior and focus

- Import opens the chooser path once; cancel changes nothing; success/failure keep existing behavior.
- Export executes once per non-repeat keydown and preserves focus.
- Add Cargo Link uses the visible path, adds one unlinked pad/history entry, and focuses the new disclosure.
- Collapse All and Expand All each work from all-expanded, all-collapsed, and mixed states; zero pads is an unprevented no-op; neither creates history.
- Navigation toggle repairs focus only when hiding focused Navigation; showing does not move focus.
- Focus Navigation covers selected, fallback-first, no-outpost, and hidden cases.
- Each region focus shortcut reaches its exact destination and no-ops when absent.
- Search Results covers hidden, zero, one, many, and already-inside cases.
- Inorganic and Organic focus actions never toggle state, including Space/Enter not being synthesized by the handler.
- Manufacturing focuses Edit or Save according to draft mode and never Cancel or changes mode.
- Help contains every logical action exactly once, Redo has two chords, grouping order is stable, and all displayed chords derive from registry metadata.
- Visual tests/manual checks cover long chord containment, two-column layout, one-column breakpoint, short viewport scrolling, English/Japanese labels, and 200% browser zoom.

## 18. Backlog recommendation

After Parcel 3 is implemented, revise `Additional keyboard shortcuts` rather than preserving its current candidate list:

- remove Import, Export, Search Results/Matrix, Cargo Links, Navigation, Inorganic, Organic, Manufacturing, and Planned Supply candidates that Parcel 3 implements;
- retain only deliberately deferred candidates, if any, and name them specifically;
- remove “exact key combinations remain undecided” and stale discoverability/design-review wording;
- avoid duplicating the registry, suppression, and Help policy already documented in architecture/UX documentation;
- do not reintroduce the explicitly rejected actions from this audit.

The backlog should not be edited during this audit.

## 19. Final recommended key map

This is the single recommended final map for Parcel 3. It adopts the revised preferred map except for the layout-sensitive bracket/quote trio. Letter chords use `key`; comma/period and top-row digits use the listed physical `code`; all retain repeat, composition, AltGraph, modal, and editable-focus guards.

| Chord shown in Help | Match | Action |
|---|---|---|
| `Ctrl + Alt + O` | `key: o` | Import (Open) |
| `Ctrl + Alt + S` | `key: s` | Export (Save) |
| `Ctrl + Alt + A` | `key: a` | Add Cargo Link |
| `Ctrl + Alt + ,` | `code: Comma` | Expand all Cargo Links |
| `Ctrl + Alt + .` | `code: Period` | Collapse all Cargo Links |
| `Ctrl + Alt + B` | `key: b` | Focus Navigation |
| `Ctrl + Alt + W` | `key: w` | Show/hide Navigation |
| `Ctrl + Alt + T` | `key: t` | Focus Outpost Details |
| `Ctrl + Alt + G` | `key: g` | Focus Resource Matrix |
| `Ctrl + Alt + C` | `key: c` | Focus Cargo Links |
| `Ctrl + Alt + P` | `key: p` | Focus Planned Supply |
| `Ctrl + Alt + J` | `key: j` | Focus Search Results (Jump) |
| `Ctrl + Alt + 1` | `code: Digit1` | Focus first Inorganic Present control |
| `Ctrl + Alt + 2` | `code: Digit2` | Focus first Organic Present indicator |
| `Ctrl + Alt + 3` | `code: Digit3` | Focus Manufacturing Edit/Save |

The unchanged existing bindings remain `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`, `/`, `Ctrl+Alt+N`, `Ctrl+Alt+ArrowUp`, `Ctrl+Alt+ArrowDown`, and `Ctrl+Alt+V`. The resulting application has 22 logical actions and 23 chord bindings.

## 20. Parcel size estimate

**Medium.** No domain model, persistence, migration, or history redesign is needed. However, the work touches shared registry types/formatting, global dispatch, several component-owned refs and presentation states, import/export action exposure, localization, Help layout/styles, and a broad keyboard/focus test matrix. It should remain one coherent parcel because splitting registry, focus contracts, and Help discoverability would leave incomplete intermediate behavior.

## 21. Reproduction and inspection notes

- Branch inspected: `staging`.
- Initial unrelated working-tree state: the supplied brief was already present as untracked `docs/implementation-briefs/CODEX_AUDIT_BRIEF_keyboard-shortcut-final-key-allocation.md`. It was not modified.
- Static implementation inspection covered `App.tsx`, `keyboardShortcuts.ts`, `ValidationSummary`, `KeyboardShortcutsDialog`, `AboutDialog`, `WorkspaceLayout`, `OutpostList`, `OutpostDetails`, `OutpostStatusMatrix`, `SearchForItems`, `PlannedSupplyEditor`, `CargoPadsEditor`, import/export controls, architecture/UX/domain guidance, and the backlog.
- Official references checked on 2026-09-19: Microsoft Edge shortcuts, Windows accessibility shortcuts, MDN `KeyboardEvent` documentation, and W3C UI Events key/code specifications.
- No browser interaction was required for the conclusions. Focus ownership and conditional rendering were determinable from the React implementation. Therefore no viewport/state claim is made.
- Validation: the original audit run passed all 187 tests. After the follow-up revision, `npm run build` passed again (including reference-data verification, TypeScript compilation, and the Vite production build), and `git diff --check` passed. Vite emitted its existing advisory that a generated chunk exceeds 500 kB.
- This audit intentionally makes no shortcut, UI, CSS, test, registry, localization, Cargo, Search, Matrix, backlog, dependency, or deployment change.
