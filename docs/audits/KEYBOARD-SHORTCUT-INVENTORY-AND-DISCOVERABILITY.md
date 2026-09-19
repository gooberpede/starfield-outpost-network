# Keyboard Shortcut Inventory and Discoverability Audit

## 1. Executive summary

The application currently has **eight application-level shortcut chord bindings representing seven logical actions**:

1. `Ctrl+Z` — Undo;
2. `Ctrl+Y` — Redo;
3. `Ctrl+Shift+Z` — Redo (an intentional alternate binding);
4. `/` — focus Search for Items;
5. `Ctrl+Alt+N` — add an outpost;
6. `Ctrl+Alt+ArrowUp` — select the previous outpost;
7. `Ctrl+Alt+ArrowDown` — select the next outpost;
8. `Ctrl+Alt+V` — toggle Validation details.

The count excludes ordinary component interaction keys such as `Escape` to close a dialog, `Tab` to move within a modal, and arrow keys inside a listbox. Those paths are inventoried separately in this report because they matter to focus and collision analysis, but they are not application command shortcuts.

There are no accidental duplicate chords or internal collisions. Redo deliberately has two conventional chords. The shortcuts are **not all** `Ctrl+Alt+<key>`: history uses conventional `Ctrl` chords and Search uses plain `/`. The `Ctrl+Alt` family can remain the default convention for new application-specific commands on the supported Windows + Chromium/Edge baseline, subject to an explicit AltGr guard, editable and modal suppression, a collision review for each new assignment, and restraint about adding commands.

The current design is partly centralized. Recognition for history, Search, and outpost commands lives in `src/ui/keyboardShortcuts.ts`, while Validation recognition lives in `src/ui/validationInteraction.ts`. Effects remain in their owning React components. That boundary is basically sound, but chord metadata, labels, scope, and modal policy do not have one source of truth.

The highest-priority defect is modal isolation. Undo/Redo and Search are suppressed while either application modal is open, but the outpost shortcuts and Validation shortcut still run through the About and network delete/reset dialogs. All eight bindings reject repeated keydown events. Editable-field protection is strong for the `Ctrl+Alt` bindings and Search; history intentionally permits non-text controls while preserving native editing history in text-like controls. `preventDefault()` is generally used correctly, only after a recognized action executes.

Discoverability is absent from the rendered product. The localized visible controls exist, but none displays its shortcut and there is no shortcut help surface. Before adding commands, Parcel 2 should introduce a small declarative registry and a dedicated, localized Keyboard Shortcuts dialog reachable next to About in the global title/help area. Selected button-adjacent hints or tooltips may reinforce high-value commands, but should not be the only discovery mechanism.

## 2. Existing shortcut inventory

### Counting method

“Shortcut” below means an application-level command chord recognized from a document-level `keydown` listener. Alternate chords count separately because they are distinct user inputs. This produces eight chord bindings and seven logical actions. Standard widget and modal keyboard interactions are recorded in the following subsection but are not included in the eight.

### Application-level command shortcuts

| Chord | Logical action / visible label | Implementation and handler | Scope | Visible control | Editable focus | Modal behavior | Availability and default | Repeat / matching | Focus after execution | Automated coverage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Ctrl+Z` | Undo / localized `history.undo` | `src/ui/keyboardShortcuts.ts`: `getHistoryShortcut`, `handleHistoryShortcut`; wired by `handleGlobalAppShortcut` in `src/App.tsx` to `undo` | Global collection history | Page-header Undo button | Suppressed in text-like `input` types, `textarea`, and contenteditable; works from `select`, button, checkbox, and radio | Suppressed for About and delete/reset dialogs | Checks `history.past`; matches button disabled state; calls `preventDefault()` only after Undo runs | Rejects Alt, Meta, and repeat; no Shift for this binding; uses `key` | Focus is not deliberately moved; context may change underneath the focused element | Strong helper tests, including modifiers, repeats, editable targets, modal suppression, availability, default prevention, and contextual traversal |
| `Ctrl+Y` | Redo / localized `history.redo` | Same history path, wired to `redo` | Global collection history | Page-header Redo button | Same as Undo | Same as Undo | Checks `history.future`; matches button disabled state; prevents only after Redo runs | Rejects Alt, Meta, Shift, and repeat; uses `key` | No deliberate focus move | Same history tests |
| `Ctrl+Shift+Z` | Redo / localized `history.redo` | Same as `Ctrl+Y` | Global collection history | Same Redo button | Same as Undo | Same as Undo | Same as `Ctrl+Y` | Requires Shift for the `Z` alternate; rejects Alt, Meta, and repeat; uses `key` | No deliberate focus move | Same history tests |
| `/` | Focus Search for Items / localized search input label | `src/ui/keyboardShortcuts.ts`: `isSearchFocusShortcut`, `handleSearchFocusShortcut`; `src/App.tsx` focuses `searchInputRef` | Matrix/Search workspace | The Search for Items input itself | Suppressed in text-like inputs, `textarea`, and contenteditable; intentionally works from buttons, `select`, checkbox, and radio | Suppressed for About and delete/reset dialogs | Handles only if the input ref exists and focus succeeds; prevents only then | Rejects Ctrl, Alt, Meta, and repeat; does **not** explicitly reject Shift; uses `key` | Moves focus to Search and selects the existing value | Unit coverage for normal controls, modifiers, repeat, text editing, modal suppression, and default prevention |
| `Ctrl+Alt+N` | Add outpost / localized Add control in Navigation | `src/ui/keyboardShortcuts.ts`: `getOutpostShortcut`, `handleOutpostShortcut`; `src/App.tsx` invokes `addOutpost` | Active network / outpost navigation | Navigation Add button | Suppressed in every `input`, `textarea`, `select`, and contenteditable target | **Not suppressed**; adds an outpost behind either modal | Routes through the same `addOutpost` function as the button. The visible button has no disabled state, so current availability agrees | Exact Ctrl+Alt with no Shift/Meta; rejects repeat; uses `key.toLowerCase()` | Selection moves to the new outpost but DOM focus is left where it was, potentially behind a modal or on unrelated/stale UI | Recognition, editable, repeat, and callback/default behavior tested; no modal or focus integration test |
| `Ctrl+Alt+ArrowUp` | Previous outpost | Same outpost helper; `getAdjacentOutpostId`; `src/App.tsx` invokes `selectOutpost` | Active network / selected outpost | No dedicated Previous button; outpost list buttons expose direct selection | Suppressed in every `input`, `textarea`, `select`, and contenteditable target | **Not suppressed**; changes selected outpost behind either modal | Returns unhandled with zero/one usable outposts or invalid selection; wraps in current navigation order; does not create history | Exact Ctrl+Alt with no Shift/Meta; rejects repeat; uses `key` | Selected outpost changes; focus is not moved to the new selection and can remain on a control belonging to the old outpost | Recognition and wrap/edge logic tested; no modal or focus integration test |
| `Ctrl+Alt+ArrowDown` | Next outpost | Same as Previous | Active network / selected outpost | No dedicated Next button; outpost list buttons expose direct selection | Same as Previous | **Not suppressed** | Same as Previous | Same as Previous | Same as Previous | Same as Previous |
| `Ctrl+Alt+V` | Toggle Validation details / localized issue-count trigger | `src/ui/validationInteraction.ts`: `shouldHandleValidationShortcut`, `handleValidationShortcut`; document listener in `src/ui/components/ValidationSummary.tsx` | Global validation/status region | Validation issue-count toggle | Suppressed in every `input`, `textarea`, `select`, and contenteditable target | **Not suppressed**; opens or closes the panel behind either modal | Validation is always available; prevents whenever recognized, then toggles. No disabled mismatch exists, but modal parity is broken | Exact Ctrl+Alt with no Shift/Meta; rejects repeat; uses `key.toLowerCase()` | On open, focuses the first actionable issue or trigger; on close, returns focus to the trigger only when focus was inside the panel; otherwise preserves current focus | Helper tests cover recognition, case, modifiers, repeat, editable targets, toggle callback, and default prevention; no modal integration test |

### Duplicate and overlapping paths

- `Ctrl+Y` and `Ctrl+Shift+Z` intentionally map to the same Redo action. They share one handler and action path; this is not a conflict.
- No exact chord maps to two application commands.
- Validation has its own document listener, while the other seven chords are processed by the App listener. There is no current chord overlap, but two listeners make ordering and modal policy easier to drift.
- Visible Undo, Redo, Add Outpost, direct outpost selection, Search, and Validation controls reach the same state/action ownership as their keyboard equivalents. Validation duplicates the small `setIsOpen` toggle expression between click and shortcut rather than calling a named shared command, but it does not duplicate domain mutation logic.

### Context keyboard interactions excluded from the shortcut count

| Context | Keys | Behavior | Notes |
| --- | --- | --- | --- |
| About and Confirm dialogs | `Escape`; `Tab`; `Shift+Tab` | Close; trap focus forward/backward | `useModalDialog.ts`; initial focus and restoration are centralized |
| Search autocomplete | `Escape`; `ArrowUp`; `ArrowDown`; `Enter` | Close/clear, move active option, submit | Native composite-widget behavior local to the search control |
| Search results palette | `Escape`; arrows; `Shift+arrows` | Close or keyboard-move the palette | Local interaction, with localized movement instructions |
| Validation issue list | `Escape`; `ArrowUp`; `ArrowDown`; `Home`; `End`; `Enter`; Space | Return focus to trigger, rove focus, activate issue | Local composite-widget behavior |
| Context Help | `Escape` | Close open help popover | Document listener exists only while open |
| Outpost and Cargo reshuffle drag | `Escape` | Cancel an active pointer drag | Document listener exists only while dragging |
| Search results/autocomplete at App level | `Escape` | Close autocomplete first, then results | Suppressed while either application modal is open |

These interaction keys are appropriate and should remain local. They should be documented separately from the command registry unless the registry later needs a distinct `interaction` category; they should not inflate the user-facing “application shortcuts” list.

## 3. Current implementation architecture

The current arrangement has three layers:

1. **Pure recognition and dispatch helpers.** `src/ui/keyboardShortcuts.ts` owns the editable-target predicates, outpost chord recognition, adjacency selection, history chord recognition, and Search chord recognition. `src/ui/validationInteraction.ts` owns Validation recognition while reusing the general editable predicate.
2. **Document listeners.** `src/App.tsx` installs one document listener for history, Search, Search Escape behavior, and outpost commands. `ValidationSummary.tsx` installs a second document listener for Validation. Component interactions install temporary or element-local handlers.
3. **Effect ownership.** App-owned commands call the same application functions used by visible controls (`undo`, `redo`, `addOutpost`, `selectOutpost`). Search focuses the existing input. Validation retains panel state and focus behavior in `ValidationSummary`.

This is not a full command system and does not need to become one. Pure recognition is already testable, and domain effects remain correctly outside shortcut metadata. The weakness is that policy is split: Validation reimplements modifier matching; only the App listener knows the aggregate modal state; labels/chords are absent from localization and UI; and tests must construct ad hoc event shapes rather than consume declarative definitions.

## 4. Scope, focus, input, and modal behavior

### Editable targets

No current application command unexpectedly fires while the user is typing in the app's ordinary text, numeric, or search fields.

- `Ctrl+Alt+N`, `Ctrl+Alt+ArrowUp`, `Ctrl+Alt+ArrowDown`, and `Ctrl+Alt+V` use the broad `isEditableShortcutTarget` guard. It suppresses all `input` types, `textarea`, `select`, and inherited contenteditable targets.
- `/` uses `isTextEditingShortcutTarget`, covering text, search, email, URL, telephone, password, numeric inputs, `textarea`, and contenteditable. It remains active from non-text controls.
- Undo/Redo use the same text-editing guard so native editing history wins in fields, while application history remains available from buttons, selects, checkboxes, and radios.

This distinction is intentional and defensible. The later registry should reference a named focus policy rather than embed DOM callbacks.

### Modal and overlay behavior

The two actual `aria-modal="true"` dialogs are About and the network delete/reset confirmation. `src/App.tsx` correctly aggregates their state for history and Search, but fails to apply it before outpost dispatch. Validation is mounted separately and has no modal input at all.

Current results while a modal owns the UI:

- Undo/Redo: suppressed and native default is not prevented.
- `/`: suppressed and native default is not prevented.
- App-level Search Escape handling: suppressed.
- Add/Previous/Next outpost: **still active through the modal**.
- Validation: **still active through the modal**.
- Dialog-local Escape and focus trap: active as intended.

Validation details and Search results are non-modal panels. Global shortcuts currently continue while those panels are open. That is reasonable, provided focus-based suppression remains in force and opening one surface cannot leave focus hidden.

Recommended policy: one App-owned aggregate `isModalOpen` gate should run before all application command dispatch. Modal-local keys remain owned by the dialog. No global command should mutate state or open a panel behind an application modal unless explicitly exempted and documented; none of the present commands needs an exemption.

### Focus adequacy

Focus handling is mixed:

- Search is good: focus moves to the input and existing text is selected.
- Validation is mostly good: opening places focus on an actionable issue or the trigger; closing returns focus when the panel owned focus; disappearing issues have a fallback.
- Dialogs are good: initial focus, trapping, Escape close, and restoration are centralized.
- Undo/Redo deliberately leave focus in place. This is acceptable for value edits but fragile when history removes, replaces, hides, or changes the context containing the focused element. There is no shortcut integration test for stale focus after structural history.
- Previous/Next changes working context without moving focus to the newly selected outpost or a stable workspace landmark. Focus can remain on a control from the previous outpost until React replacement determines otherwise. This is not adequate as an explicit accessible navigation contract.
- Add Outpost selects the new outpost but does not intentionally place focus. Through the modal defect it can also leave focus in a dialog while content changes behind it.

Parcel 2 should define focus outcomes for existing shortcuts and add integration tests. It should avoid forcing focus movement for Undo/Redo universally; instead, restore or repair focus only when the previously focused node disappears or becomes hidden. For outpost navigation, choose one consistent destination (the selected outpost's Navigation button or a stable Outpost Details heading) after product/accessibility review.

## 5. Disabled state, repeat, and default prevention

### Disabled-state parity

Visible disabled conditions and shortcut availability agree for the states they both model:

- Undo/Redo check the same `history.past`/`history.future` lengths used by their buttons.
- Previous/Next refuse execution when adjacency cannot be produced (empty/single list or invalid selection).
- Add Outpost uses the same `addOutpost` function as its enabled button. Outpost capacity is currently advisory, so neither path is disabled by the displayed maximum.
- Search handles only when its input exists and can be focused.
- Validation has no disabled state.

However, the answer to “do disabled controls and shortcuts always agree?” is **no overall**, because an open modal makes background controls operationally unavailable while the outpost and Validation shortcuts bypass that isolation. This is an interaction-availability mismatch rather than a literal `disabled` attribute mismatch.

### Repeat handling

`event.repeat` is handled consistently for all eight command bindings: every recognizer rejects repeat events. This is especially important for Add, Undo/Redo, and wrapping navigation. The standard local arrow-key interactions are allowed to repeat according to native keydown behavior, which is appropriate for roving or movement controls.

### `preventDefault()`

The command handlers generally follow the correct policy:

- history prevents only after an available action runs;
- Search prevents only after focus succeeds;
- outpost commands prevent only after the callback returns `true`;
- Validation prevents after recognition and before its always-available toggle callback;
- ignored modifiers, repeats, editable targets, modal-suppressed history/Search, and unavailable history/outpost commands remain unprevented.

The policy should remain: recognize the complete chord and scope, confirm the action can execute, execute it, then prevent the browser default. A registry should describe matching but should not itself call `preventDefault()` or decide action availability.

One minor matching inconsistency is that `/` does not explicitly reject Shift. On common US input Shift changes `event.key` to `?`, so it does not match in practice; on another layout an event could still report `/` with Shift. Exact-modifier policy should be made explicit and tested.

## 6. Browser and Windows collision review

### Existing chords

| Chord | Collision classification | Assessment |
| --- | --- | --- |
| `Ctrl+Z` | Browser/editing convention | Conventional Undo. The app correctly yields to native text editing and handles only when application history is available |
| `Ctrl+Y`, `Ctrl+Shift+Z` | Browser/editing convention | Conventional Redo alternatives. Same protections as Undo |
| `/` | Browser / site convention concern | Common in-site search convention. Edge's published Windows shortcuts do not reserve plain `/`; editable suppression preserves typed slash. It needs discoverability because the input itself gives no hint |
| `Ctrl+Alt+N` | AltGr/layout concern; no obvious Windows/Edge collision | No collision found in Microsoft's published Windows/Edge shortcut lists for the supported baseline |
| `Ctrl+Alt+ArrowUp/Down` | Accessibility/system and third-party concern; no obvious default Windows/Edge collision | Windows reserves related Windows-key arrow chords, not these exact chords. Some utilities or assistive setups may claim Ctrl+Alt+arrows, so retain fallback visible navigation and avoid treating the shortcut as the only path |
| `Ctrl+Alt+V` | AltGr/layout concern; no obvious Windows/Edge collision | No collision found in Microsoft's published Edge list; visible Validation trigger remains the primary fallback |

Microsoft's current [Edge keyboard shortcut list](https://support.microsoft.com/en-us/edge/keyboard-shortcuts-in-microsoft-edge) and [Windows keyboard tips](https://support.microsoft.com/en-US/Windows/Hardware/Input-Devices/windows-keyboard-tips-and-tricks) show no reserved default matching `Ctrl+Alt+N`, `Ctrl+Alt+V`, or `Ctrl+Alt+ArrowUp/Down`. This is a practical baseline result, not a promise about every installed utility, keyboard driver, accessibility product, remote-desktop layer, or enterprise policy.

### Conclusion on the convention

`Ctrl+Alt+<key>` is viable as the default family for app-specific commands on Windows + Chromium/Edge. It should not displace established conventions such as Ctrl-based Undo/Redo or a well-understood unmodified focus key. Every future chord still needs a per-key review. The application must always retain an ordinary visible, keyboard-focusable control because OS, browser extension, assistive technology, input method, or user tooling may intercept a chord before the page receives it.

## 7. AltGr and keyboard-layout assessment

All current command recognizers use `KeyboardEvent.key`; none uses `KeyboardEvent.code`, `location`, `getModifierState('AltGraph')`, or `isComposing`.

That choice means letter and punctuation matching follows the effective, layout- and modifier-dependent key value. The W3C UI Events specification defines `key` as the effective value after modifiers and `code` as the physical key independent of keyboard layout. It also notes that some operating systems simulate AltGraph with Ctrl+Alt and that IMEs may suppress or alter keyboard events. See [UI Events](https://www.w3.org/TR/uievents/) and the [KeyboardEvent code values recommendation](https://www.w3.org/TR/uievents-code/).

Current practical risk:

- The broad editable guard prevents the most harmful AltGr failure: adding or navigating outposts, or toggling Validation, while composing text in an app field.
- Outside an editable target, an AltGr-generated event can expose Ctrl+Alt. The effective `key` will often be the generated symbol rather than `n` or `v`, which avoids a match, but the implementation does not explicitly reject `AltGraph`; browser/layout differences therefore remain a meaningful edge risk.
- `Ctrl+Alt+ArrowUp/Down` is layout-stable at the key-value level, but right-Alt/AltGr plus an arrow outside an editor could match.
- `N`, `V`, and `/` matching is not locale-independent. A non-Latin layout can return a different `key` for the same physical position, while punctuation positions vary substantially.
- Conventional Undo/Redo should continue to be interpreted semantically as the displayed character chord rather than blindly moving to a US physical position. Changing all commands to `code` would trade one layout problem for another.

Recommended future policy:

1. Reject `event.getModifierState('AltGraph')` for application shortcuts and test the fallback representation used by supported Chromium/Windows combinations.
2. Record a match strategy per chord: semantic `key` for conventional/displayed character shortcuts, stable named `key` for arrows, and `code` only where the product intentionally promises a physical-position shortcut.
3. Keep chord display metadata aligned with that strategy. Do not label a physical `code` binding as a locale-independent character unless it really produces that character.
4. Reject `isComposing` for app commands.
5. Test representative US, UK, German/AltGr, and Japanese/non-Latin event shapes rather than claiming universal layout independence.

`Ctrl+Alt` remains usable, but AltGr/layout risk is meaningful enough to require explicit guards and tests before adding more printable-key bindings.

## 8. Existing test coverage

### Covered well

`tests/keyboardShortcuts.test.ts` covers:

- outpost chord recognition and case handling;
- incorrect Ctrl/Shift combinations for outpost commands;
- editable `input`, `textarea`, `select`, and contenteditable suppression;
- repeat suppression;
- previous/next order, wraparound, and boundary/invalid-selection behavior;
- callback-based availability and conditional `preventDefault()`;
- history chord recognition for both Redo bindings;
- Alt/Meta/Shift/repeat rejection for history;
- native text-editing priority and non-text-control availability;
- modal suppression and disabled-state parity for history;
- Search focus recognition, modifiers, repeats, text editing, modal suppression, and default prevention;
- history shortcuts using the contextual session reducer path.

`tests/validationInteraction.test.ts` covers Validation recognition, case handling, modifier/repeat/editable suppression, toggling, and prevention. Component tests cover related dialog, Search, and validation focus interactions, but not the complete document-level shortcut integration contract.

### Missing or incomplete

- No test proves that **every** global shortcut is suppressed while each modal is open; such a test would currently fail for outpost and Validation.
- No integration test exercises both document listeners together or detects duplicate execution/listener overlap.
- No test checks Meta/Alt combinations for every family (coverage is family-specific rather than registry-driven).
- `/` has no explicit Shift test.
- No test covers `AltGraph`, `getModifierState`, `isComposing`, layout-dependent `key`, or a chosen `key` versus `code` policy.
- No test checks focus after Add/Previous/Next or structural Undo/Redo.
- No test proves UI labels/help notation are generated from the same chord metadata as matching.
- No test asserts a unique chord set or intentional aliases.
- No test checks modal suppression for Validation/outpost or non-modal behavior for the Validation/Search panels.

### Recommended test strategy

Parcel 2 should add registry table tests for unique IDs/chords, intentional aliases, exact modifiers, display formatting, and translation-key coverage; pure dispatcher tests for focus/modal/repeat/composition/AltGr policy; and a small number of component integration tests that dispatch real `KeyboardEvent`s with dialogs and representative focus targets. Focus assertions should cover Search, Validation, outpost navigation, and structural Undo/Redo. Parcel 3 can add each new definition to the same parameterized contract rather than copying bespoke tests.

## 9. Discoverability options

### Dedicated Keyboard Shortcuts dialog

This is the strongest primary solution. It can expose all bindings without consuming permanent workspace height, follow the established About/Confirm modal pattern, group commands by function, and provide semantic headings/lists or tables. It is keyboard and screen-reader reachable without hover and can use localized action descriptions.

### Entry point near About/help

This is the best location. The title bar already hosts About as a global information action, so a sibling “Keyboard Shortcuts” button is predictable and does not imply that shortcuts belong to one workspace region. About itself should not be overloaded with a growing command reference.

### Adjacent hints and tooltips

Useful only as reinforcement. High-value controls such as Undo, Redo, Search, Add Outpost, and Validation may show compact `<kbd>` hints where layout permits, or include a chord in localized accessible description/title text. Tooltips alone are insufficient because they require discovery by hover/focus and fragment the full inventory.

### Persistent status/help text

Not recommended as the full solution. The application is intentionally dense and the status bar has operational responsibilities. A permanent full shortcut list would add noise; a one-time tip would be transient and incomplete.

## 10. Recommended discoverability design

Build a dedicated localized **Keyboard Shortcuts** dialog in Parcel 2, populated from the registry and reachable from a visible button beside About in the title bar/global help area.

The dialog should:

- use the existing modal hook for initial focus, focus trapping, Escape, scroll lock, and focus restoration;
- have a localized title and introduction;
- group the seven logical actions into History, Search/Matrix, Outpost Navigation, and Validation;
- show both Redo chords against one logical action rather than pretending they are separate commands;
- render chord tokens semantically (for example a localized accessible phrase plus visual `<kbd>` elements);
- explain that shortcuts do not run while typing and, after normalization, do not run through dialogs;
- remain generated from registry metadata rather than manually restating chords;
- expose a visible Close button and require no hover.

Add selected adjacent hints only where they remain legible in the dense UI. Search can benefit from a small `/` hint; Undo/Redo and Add/Validation can use tooltip/accessibility reinforcement or compact hints after visual review. Previous/Next need not add permanent labels to every outpost row; the full dialog is sufficient initially.

Do not add a shortcut to open the dialog in Parcel 2 unless a separate product decision demonstrates a strong need. A visible keyboard-accessible entry point meets the parcel's objective without consuming another chord.

## 11. Shortcut registry assessment

A small central registry is justified. It would eliminate the current split between implicit matching code, documentation-only chord knowledge, future help UI, and bespoke test fixtures. The project does not need a command bus or a framework that owns domain actions.

The registry should be pure, explicit data. A dispatcher may consume it, but effect functions should remain in App or the feature component that owns the state. The existing `isTextEditingShortcutTarget`/`isEditableShortcutTarget` helpers can remain shared policy primitives.

## 12. Recommended registry shape

One minimal conceptual shape is:

```ts
type ShortcutId =
  | 'history.undo'
  | 'history.redo.ctrlY'
  | 'history.redo.ctrlShiftZ'
  | 'search.focus'
  | 'outpost.add'
  | 'outpost.previous'
  | 'outpost.next'
  | 'validation.toggle'

type ShortcutDefinition = {
  id: ShortcutId
  action: ShortcutActionId
  chord: {
    key: string
    match: 'key' | 'code'
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  labelKey: MessageKey
  groupKey: MessageKey
  scope: 'global' | 'matrix' | 'network' | 'selected-outpost'
  focusPolicy: 'not-text-editing' | 'not-editable'
  aliases?: readonly ShortcutId[]
}
```

The exact types can be simpler, but the registry should contain:

- stable shortcut ID;
- stable logical action ID so alternate chords can group together;
- explicit chord and `key`/`code` strategy;
- localized action-label/description key and localized group key;
- declarative scope;
- a named focus-target policy;
- enough information for a single formatter to produce visual and accessible notation;
- intentional alias/grouping metadata where one action has multiple chords.

It should deliberately **not** contain:

- React setters, refs, callbacks, or component instances;
- domain mutation logic;
- dynamic `canUndo`/`canRedo` or selected-outpost state;
- arbitrary availability callbacks that couple static metadata to App state;
- focus DOM nodes or imperative focus effects;
- persistence or Undo history state;
- modal state;
- local widget keys such as listbox arrows or dialog Tab trapping.

Dynamic availability and effects should remain in action dispatch code. A small action-state map can be supplied at dispatch time if useful. Modal, repeat, composing, AltGr, and exact-modifier gates should be centralized dispatcher policy, not repeated as definition callbacks.

Tests can iterate the registry to verify uniqueness, formatter output, translation keys, base policy, and help completeness, then use targeted tests for dynamic actions and focus outcomes.

## 13. Future shortcut candidate inventory

No new chords are assigned here.

| Candidate action | Classification | Assessment before any assignment |
| --- | --- | --- |
| Previous/next network; add network | Navigation / high frequency for multi-network users | Plausible after outpost/navigation conventions are coherent; needs focus and modal policy |
| Show/hide Navigation | Navigation / layout | Plausible but lower value because visible controls already exist; must not strand focus |
| Focus major regions (Navigation, Outpost Details, Matrix, Cargo, status/Validation) | Navigation / accessibility | Strong candidate family for reducing long Tab traversal; needs product and accessibility design, not ad hoc chords |
| Import | Global file action | Possible but low frequency and invokes a file chooser; visible control is adequate for many users |
| Export | Global file action | Possible, low-to-medium frequency; avoid accidental downloads and confirm browser interaction |
| Add Cargo Link/pad | High-frequency edit | Plausible when a selected outpost exists; availability and focus destination must be explicit |
| Toggle all Cargo Link expansion | Cargo presentation | Plausible but secondary; already keyboard-accessible by tabbing |
| Enter/exit or lock Reshuffle | Edit/reorder mode | Needs product decision; mode shortcuts can be hard to discover and need clear announcements |
| Move selected outpost/Cargo Link up/down | Edit/reorder | Needs product decision and a well-defined selected item. Risk of conflicting with navigation/scrolling; ordinary focused buttons already support the action |
| Delete network/outpost/Cargo Link | Destructive | Poor default candidate. If ever added, require confirmation and strict scope/focus; do not prioritize |
| Matrix section focus or expansion | Navigation / high information density | Plausible as region focus; individual matrix toggles are poor candidates because there are too many |
| Organic Resources, Manufacturing, Planned Supply region focus | Navigation | Plausible as a coherent region-navigation family, matching backlog direction |
| Add/remove individual resource/product/supply entries | Edit | Poor broad shortcut candidates; context and item identity are ambiguous and existing controls are keyboard accessible |
| Open About | Help | Low value; visible global control suffices |
| Open Keyboard Shortcuts help | Help/discoverability | Possible later, but not required for Parcel 2; only add after collision review and demonstrated need |

The best later candidates are coherent navigation/focus families and a small number of genuinely frequent create actions. Import/Export and mode toggles are secondary. Destructive and item-specific matrix/cargo actions should generally remain ordinary focused controls.

## 14. Risks and non-regression constraints

Parcel 2 and Parcel 3 must preserve:

- native text entry, selection, and Undo/Redo;
- browser behavior for unmatched or unavailable chords;
- exact enabled/disabled parity;
- modal isolation across every command;
- repeat suppression for discrete commands;
- IME/composition and AltGr safety;
- visible controls as complete fallback paths;
- current global contextual history and one-operation/one-history-entry semantics;
- outpost wraparound in current reordered sequence without history entries;
- localization of action descriptions and accessible chord announcements;
- visible focus and repair when a command removes or hides the focused node;
- Search and Validation's existing deliberate focus behavior;
- local widget keyboard contracts, which should not be absorbed into the global registry.

## 15. Recommended implementation sequence

### Parcel 1 — this audit

Complete: inventory, inconsistency analysis, collision/layout review, discoverability design, registry boundary, and future candidate inventory.

### Parcel 2 — registry, behavior normalization, and discoverability

1. Add the small static registry for the eight existing bindings only.
2. Centralize recognition/formatting and the repeat, composition, AltGr, exact-modifier, editable, and modal gates.
3. Keep dynamic availability/effects in App and feature owners.
4. Fix modal leakage for outpost and Validation commands.
5. Decide and test existing-command focus outcomes.
6. Add localized registry labels/groups and the Keyboard Shortcuts dialog beside About.
7. Add selective inline/tooltip reinforcement where layout permits.
8. Add registry contract and end-to-end component tests.

Do not add action shortcuts in this parcel. A shortcut for the help dialog is optional and should be omitted by default.

### Parcel 3 — missing shortcuts

1. Re-evaluate the candidate inventory with usage/product priorities.
2. Choose a small coherent set, favoring navigation/focus and genuinely frequent actions.
3. Assign chords only after Windows/Edge, AltGr/layout, accessibility, and internal collision checks.
4. Add each definition through the registry so matching, help, and tests update together.
5. Verify focus, modal, availability, repeat, and native-browser behavior for every new command.

## 16. Parcel sizing

- **Parcel 2: medium.** The registry itself is small, but the work spans two current listeners, localization, a new accessible dialog, modal normalization, focus decisions, display formatting, and component tests. It should remain one coherent medium parcel rather than becoming a command-framework refactor.
- **Parcel 3: medium, subject to candidate selection.** A deliberately small set could be small, but the backlog spans global navigation, region focus, cargo, reorder, and file actions. Treat the planned selection/design/testing parcel as medium and split it if more than one coherent shortcut family is approved.

## 17. Backlog recommendation

`docs/BACKLOG.md` currently has one “Additional keyboard shortcuts” item naming Import, Export, Add Cargo Link, toggle-all Cargo Links, Reshuffle/Lock, reorder, Local Resources, Organic Resources, Manufacturing, Planned Supply, and landmark-like major-region navigation. It correctly says exact chords are undecided and calls for a coherent system.

Do not edit it during this audit. After Parcel 2:

- record registry + discoverability as implemented;
- remove any generic request to design discoverability;
- retain the unassigned action candidate inventory;
- add the rule that future commands must enter through the registry and pass the common policy/test contract.

After Parcel 3:

- remove implemented candidate actions;
- retain explicitly deferred or rejected candidates with the reason (low frequency, destructive, ambiguous scope, or already adequately keyboard-accessible);
- avoid leaving exact chord proposals in backlog if the registry/help is then authoritative.

## 18. Reproduction and inspection notes

### Repository state at start

- Branch: `staging` (confirmed before inspection).
- Starting worktree: the supplied audit brief, `docs/implementation-briefs/CODEX_AUDIT_BRIEF_keyboard-shortcut-inventory-and-discoverability.md`, was already untracked. It was treated as user-supplied input and not modified.
- No unrelated tracked working-tree changes were present.

### Code and documentation inspected

- `src/App.tsx`
- `src/ui/keyboardShortcuts.ts`
- `src/ui/validationInteraction.ts`
- `src/ui/components/ValidationSummary.tsx`
- `src/ui/components/SearchForItems.tsx`
- `src/ui/components/OutpostList.tsx`
- `src/ui/components/CargoPadsEditor.tsx`
- `src/ui/components/ContextHelp.tsx`
- `src/ui/components/useModalDialog.ts`
- `src/ui/components/AboutDialog.tsx`
- `src/ui/components/ConfirmDialog.tsx`
- localization catalogues under `src/localization/locales/`
- shortcut, validation, modal, Search, and component tests under `tests/`
- `docs/ARCHITECTURE.md`, `docs/DOMAIN-RULES.md`, `docs/UX-DESIGN.md`, `docs/BACKLOG.md`, and relevant historical briefs

Searches covered `keydown`, `keyup`, `KeyboardEvent`, modifier properties, `preventDefault`, repeat, `onKeyDown`, shortcut/hotkey/accelerator text, action names, and localized labels. No existing rendered shortcut/help strings were found.

### Browser/runtime interaction

No browser interaction was needed for the code-path inventory. Focus and modal conclusions above are static implementation/test findings, not claims from a manual browser session. Platform collision conclusions use current official Microsoft shortcut documentation and W3C keyboard-event specifications.

### Validation performed

- `npm test` — passed: 183 tests, 0 failures.
- `npm run build` — passed, including localization/reference verification, TypeScript compilation, and the Vite production build. Vite emitted its existing advisory that one generated chunk exceeds 500 kB; the audit made no bundle or application change.
- `git diff --check` — passed with no whitespace errors in tracked diffs. The audit report and supplied brief remained untracked at the final status check.
- No manual browser session was run.

### Required conclusions in compact form

- Current count: **8 chord bindings / 7 logical actions**.
- Duplicates/conflicts: one intentional Redo alias; no exact-chord conflict.
- All `Ctrl+Alt`: **No**.
- Matching API: **`KeyboardEvent.key` only**, not `code`.
- `Ctrl+Alt` default viability: **Yes, conditionally** for app-specific commands on Windows + Chromium/Edge.
- AltGr/layout risk: **Meaningful but manageable**; add explicit AltGraph/composition policy and layout tests.
- Editable controls: current command shortcuts do not fire in relevant text editors; broad `Ctrl+Alt` commands also suppress selects and every input.
- Modals: history/Search are suppressed; outpost and Validation commands incorrectly operate through dialogs.
- Disabled parity: correct for modeled action availability, but modal interaction parity is not.
- Repeat: consistently rejected by all command recognizers.
- Default prevention: appropriately conditional, with no broad swallowing found.
- Focus: good for Search, Validation, and dialogs; underspecified for outpost navigation and structural history.
- Scattering: modest but material—two helper modules and two document listeners, with chord/display metadata absent.
- Registry: recommended, small and declarative; no command framework.
- Discoverability: dedicated localized dialog beside About, registry-driven; optional selective hints/tooltips as reinforcement.
- Next parcel: Parcel 2 registry + normalization + discoverability, **medium**.
- Later missing-shortcut parcel: Parcel 3 after design validation, **medium** unless narrowed to one small family.
