# Whole-Product Accessibility Audit

**Audit date:** 2026-09-14

**Scope:** Whole application source, component semantics, styles, automated coverage, and a bounded Chromium runtime observation

**Disposition:** Outcome B — targeted corrections required

## Executive summary

The application's accessibility baseline is fundamentally sound at its intended desktop width, but a bounded correction batch is warranted before making a strong accessibility-readiness claim. Native controls, localized names, keyboard alternatives for reordering, focus restoration, modal behavior, validation severity, and live-region behavior provide a good foundation. The audit found no mouse-only essential workflow, no focus trap, and no BLOCKER.

The principal defect is reflow: at a 683 CSS-pixel viewport, representative of 200% zoom on a 1366-pixel display, the Resource Matrix shrank to approximately 28 pixels while the document overflowed horizontally; at 640 CSS pixels the Matrix measured zero pixels wide. This makes a core workflow effectively unavailable in that high-zoom configuration. The Matrix itself does not need a true ARIA-grid redesign, but its placement and focus model need targeted correction.

Finding count:

| Severity | Count |
| --- | ---: |
| BLOCKER | 0 |
| HIGH | 1 |
| MEDIUM | 5 |
| LOW | 3 |
| COSMETIC | 0 |
| **Total** | **9** |

Required disposition statements:

- **Core workflow accessibility:** no essential workflow is mouse-only. Resource editing becomes effectively inaccessible at the observed 640–683 CSS-pixel widths, so zoom/reflow is the one significant exception to the otherwise sound desktop baseline.
- **Keyboard-only operation:** fundamentally sound. Native controls and move-button reorder alternatives cover essential actions, though Matrix status chips create excessive Tab stops.
- **Tab order:** generally follows visual and task order. The Matrix is the material efficiency exception.
- **Focus visibility:** adequate in source and in the sampled Chromium states, including the locale selector and a selected dark Matrix control. Full zoom/high-contrast observation remains manual.
- **Screen-reader semantics:** fundamentally sound but not complete. Localized control names and states are broadly present; landmarks/headings, collapsed Cargo summaries, and Matrix status traversal need focused improvements.
- **Live announcements:** adequate. Success and failure have stable, separate live regions; deferred import failure announcement avoids the native file-picker timing problem.
- **Forms:** labels are adequate, but numeric limits and invalid-entry feedback are not.
- **Color-only meaning:** some selected/stale dense-control states still rely on custom color/fill for their visible distinction even though programmatic state is present.
- **Contrast:** no known measured readable-text failure remains. The automated solid-token test passes at 4.5:1; rendered `color-mix()`, focus, disabled, and forced-color combinations still require manual measurement/observation.
- **Zoom/reflow:** significant risk confirmed for the central workspace at 200%-equivalent constrained widths.
- **Semantic structure:** targeted improvement is needed; it does not require a product redesign.
- **Resource Matrix:** targeted layout, focus, and semantic fixes only; no ARIA-grid redesign is recommended.
- **Planned Supply:** targeted visual-state/forced-colors and target-size fixes only.
- **Cargo Links:** targeted collapsed-summary and visual-state fixes only.
- **Validation:** a small trigger/panel relationship fix only; its issue model does not need redesign.
- **Release blocking:** no BLOCKER was found. The HIGH reflow defect should be corrected before describing the product as accessibility-ready at 200% zoom.

## Method and observed scope

The audit followed the requested order: source/component semantics, keyboard and focus, major control surfaces, visual accessibility and reflow, screen-reader semantics, localization interaction, automated coverage, then the manual checklist.

Source inspection covered `App.tsx`, all current UI/layout components and styles, localization integration, accessibility-sensitive tests, architecture guidance, and settled UX conventions. A Chromium runtime observation used the current mature local data in `ja-JP`; it did not alter persisted network data. At the normal 1003-by-958 CSS-pixel viewport, the document had no horizontal overflow, the accessibility tree exposed localized names, and sampled focus indicators were clearly visible. The runtime had 53 sequentially focusable elements, including 10 noninteractive Matrix status spans in the sample.

The constrained-width checks used explicit browser viewport sizes rather than browser zoom controls. They are a valid reflow proxy, not a substitute for the final browser zoom checklist:

| CSS viewport | Document client/scroll width | Matrix viewport width | Observation |
| ---: | ---: | ---: | --- |
| 1003 px | 988 / 988 px | normal working width | No page-wide overflow |
| 768 px | 753 / 764 px | 113 px | Minor document overflow; Matrix severely compressed but locally scrollable |
| 683 px | 668 / 764 px | 28 px | Page-wide overflow and Matrix effectively unusable |
| 640 px | 625 / 764 px | 0 px | Matrix disappears while Cargo retains its 18rem minimum |

Windows Narrator, Windows forced-colors/high-contrast mode, OS text scaling, and true 125/150/200% browser zoom were not exercised. They remain in the final manual checklist.

## Already-closed baseline checks

The release-hardening baseline remains intact in source, tests, and the sampled accessibility tree:

- readable muted text remains separate from disabled presentation, and the solid-token contrast test passes;
- every Validation row renders and announces its localized severity prefix;
- persistent polite/assertive live regions announce success/failure once, with native file-picker focus deferral retained;
- pointer drag handles remain `tabIndex={-1}` and `aria-hidden`, while native move-up/down buttons remain keyboard reachable;
- focus outlines remain authored across ordinary, selected/dark, dense-grid, Search, Validation, dialog, and status controls;
- Search Results receives focus after keyboard submission and restores Search focus on close;
- the Inter-System marker remains a named, noninteractive image semantic with its glyph hidden from assistive technology;
- Cargo fuel state and stale export state retain associated descriptions;
- compact Add controls retain full localized accessible names;
- `document.lang` follows the effective locale, and the sampled `ja-JP` accessibility tree contained localized names and descriptions;
- component accessibility coverage remains operational.

No closed baseline item is reopened as a finding without current regression evidence.

## Findings

| ID | Area | Classification | Issue | Evidence | Recommended change | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-01 | Zoom/reflow | Accessibility defect | The two-column selected-outpost workspace allows Cargo's 18rem minimum to consume the available content track. The Matrix collapses instead of retaining a usable local scroller, and document-wide horizontal overflow appears. | Runtime: Matrix width 28 px at a 683 px viewport and 0 px at 640 px; document scroll width remained 764 px. `WorkspaceLayout.css` defines `minmax(0, 3fr) minmax(18rem, 1fr)` without a constrained-width stacking/adaptation rule. | Add a deliberate constrained-width/zoom layout that preserves both core surfaces, likely stacking Cargo below the middle column before the Matrix collapses. Retain local Matrix/Planned Supply scrolling and avoid a page-wide horizontal task flow. Test representative 125/150/200% zoom widths. | **HIGH** |
| A11Y-02 | Resource Matrix keyboard model | Accessibility defect | Every read-only Inputs, Producing, Import, and Logistics status chip is a generic focusable `span`. Dense networks can add many inert Tab stops even though these values are already in table cells and do not activate anything. | `OutpostStatusMatrix.tsx:78-91` assigns `tabIndex={0}` to every `ReadOnlyState`. The sampled network exposed 10 such stops among 53 focusable elements. Chromium exposed their localized name and `title` help, so the defect is efficiency rather than missing text. | Keep interactive Present/Producing buttons in normal Tab order. Expose read-only status and its state-specific explanation through cell/row text or descriptions that are available in browse/reading mode; remove per-chip sequential focus, or use one deliberate row-level/roving inspection target if keyboard tooltip access cannot otherwise be preserved. Do not introduce a full ARIA-grid keyboard model. | **MEDIUM** |
| A11Y-03 | Landmarks, headings, and Matrix structure | Structural defect | The document contains a `<main>` around the whole app and a second `<main>` nested inside it. Several headings contain buttons, so their computed names include actions such as expand/help/hide. Matrix rows are also separated by labelled `<section>` regions directly inside `role="table"` rather than explicit row groups. | `App.tsx:2008` opens the outer main; `WorkspaceLayout.tsx:83` creates the nested main. Runtime reported two mains and one nested main. The accessibility tree announced heading names such as “expand Planned Supply / Planned Supply / help”. `OutpostStatusMatrix.tsx:215-234` places sections between the table and rows. | Use one main landmark containing the complete selected-outpost workspace; label Navigation and Cargo regions appropriately. Keep heading text as the heading's accessible name and place action controls adjacent in the same visual strip. For the Matrix, use valid table ownership (for example row-group semantics) and verify row/column associations with Narrator before adding more ARIA. | **MEDIUM** |
| A11Y-04 | Character numeric forms | Accessibility defect | Character level and skill rank fields accept free-form text, silently restore the previous value on blur when invalid, and expose neither allowed ranges nor an invalid state/message. Labels exist, but error prevention and recovery are not understandable programmatically. | `CharacterHeader.tsx:52-73` accepts levels 1–999; `CharacterHeader.tsx:135-184` accepts ranks 0–4. Invalid drafts only call `setDraft...` to restore prior text. No `aria-invalid`, associated instruction, or status message exists. | Add localized range instructions and an explicit, associated invalid-entry response before/resetting the draft. Preserve one-history-entry-on-commit semantics. Native numeric constraints may assist, but should not replace clear feedback. Add component tests for invalid entry, announcement/description, and recovery. | **MEDIUM** |
| A11Y-05 | Reduced visual cues / forced colors | Accessibility defect | Programmatic toggle state is good, but several visible states depend primarily on custom background, border color, or opacity: selected Matrix/Planned Supply/export buttons and stale cargo exports. No `forced-colors` treatment preserves those distinctions if authored colors/gradients are flattened. | Selected-state rules in `OutpostStatusMatrix.css`, `PlannedSupplyEditor.css`, and `CargoPadEditor.css` change color/fill; stale exports use warning color plus opacity. The stylesheets contain no `@media (forced-colors: active)`. ARIA state/descriptions remain available, so this is not a nonvisual blocker. | Add a restrained non-color visible cue for selected/stale states and forced-colors overrides using system colors/borders or another durable shape/text cue. Preserve the current muted-versus-disabled distinction. Verify in Windows forced-colors mode before claiming support. | **MEDIUM** |
| A11Y-06 | Collapsed Cargo Links | Usability weakness | Collapsed summaries visually concatenate destination and item abbreviations without semantic labels or expanded item names. A screen-reader user hears a string such as “Feynman I Li Cu xF4 — —”; keyboard/touch users cannot discover abbreviation expansions without opening the card. | `CargoPadsEditor.tsx:808-844` uses nonfocusable `span title={item.name}` values. The sampled accessibility tree exposed the collapsed card as one unlabelled concatenated text run after the disclosure button. | Associate one concise localized summary with the disclosure button/card that names destination, outbound items, inbound items, and Inter-System state. Do not add a Tab stop for every abbreviation; expanding the existing disclosure should remain the editing path. | **MEDIUM** |
| A11Y-07 | Pointer/touch targets | Usability weakness | Several frequent compact controls are below a practical 24-by-24 CSS-pixel target at the responsive 16px root size. | Runtime at the normal viewport measured Context Help at 16×16, Search at 177×20 with a 23×20 submit button, X-Tech Add at 51×18, Planned Supply disclosure at 22×22, and Cargo disclosure at 23×23. Source dimensions confirm the same pattern. | Increase the interactive hit box without making the visual glyph dominant; prioritize Context Help, Search, disclosures, and X-Tech Add. Keep the dense visual language by using padding/pseudo-elements where suitable. | **LOW** |
| A11Y-08 | Validation panel relationship | Manual-verification limitation | The Validation trigger exposes expanded state but not an explicit relationship to a named panel; the panel is a generic positioned `div`. Issue list and row semantics are otherwise sound. | `ValidationSummary.tsx:241-315` supplies `aria-expanded` only. The panel has no stable ID, `aria-controls`, region role, or label. | Give the trigger/panel a stable `aria-controls` relationship and label the non-modal panel as a region when open. Retain the existing roving-focus behavior and do not make passive issues artificial controls. | **LOW** |
| A11Y-09 | Search submission | Usability weakness | The named Search button remains enabled but performs no action unless there is exactly one match. With zero or multiple results—including a highlighted active descendant—activation silently does nothing. | `SearchForItems.tsx:335-342` calls `submit` only when `matches.length === 1`; keyboard Enter separately submits the highlighted option. | Either disable the button when it has no deterministic action, or make it submit the current highlighted/sole candidate consistently. Add a component test for button activation with zero, one, and multiple matches. | **LOW** |

## Dedicated control-surface conclusions

### Resource Matrix

The Matrix's native-button-plus-table approach is directionally appropriate. Each editable control includes the item in its localized accessible name and exposes pressed/disabled state; row labels and column headings exist; the local horizontal scroller is the correct pattern for a dense surface. A full ARIA grid would add substantial keyboard complexity without solving the observed defects.

The Matrix needs targeted fixes: preserve usable width during reflow (A11Y-01), remove or consolidate read-only status Tab stops (A11Y-02), regularize table ownership and validate header association (A11Y-03), and preserve state cues in forced colors (A11Y-05). It does **not** require redesign.

### Planned Supply

The three states remain programmatically distinguishable: planned uses `aria-pressed`, unavailable uses `aria-disabled`, and neutral remains actionable. Unavailable items remain inspectable rather than disappearing, and selected/dark focus styling remains deliberately contrasting. Catalogue headings and local horizontal scrolling preserve the intended topology.

Planned Supply needs only targeted visible-state/forced-colors and disclosure-target work (A11Y-05/A11Y-07). The large number of catalogue buttons is intrinsic to the editor; no bespoke grid keyboard model is recommended without user testing.

### Cargo Links

Expanded Cargo Links use labelled native selects and buttons; disclosure state, Inter-System pressed/fuel state, stale export descriptions, move controls, and hidden collapsed bodies are sound. Pointer dragging has keyboard move-button alternatives.

The collapsed summary needs one semantic summary rather than per-abbreviation Tab stops (A11Y-06), and stale/selected state needs a durable non-color cue (A11Y-05). Cargo Links need targeted fixes only, not redesign.

### Validation

Validation exposes localized per-row severity text, complete messages/remediation, ordered list semantics, aggregate counts, and an efficient roving focus model for actionable issues. Severity is not color-only. Escape predictably returns focus to the trigger while keeping the non-modal panel open, matching the documented interaction.

Only the trigger-to-panel relationship needs small semantic hardening (A11Y-08). Validation does not require redesign.

### Search

Search has a localized combobox name and description, listbox/option semantics, `aria-activedescendant`, arrow navigation, Enter and Escape behavior, deliberate Search Results focus hand-off, and focus restoration on close. Results are a named non-modal region and its move handle has keyboard arrow alternatives. The sampled Japanese tree did not expose canonical English aliases as visible option content.

The enabled-but-no-op submit behavior is a low-severity consistency weakness (A11Y-09). Search otherwise has a sound accessible model.

### Dialogs

Both dialog types expose a localized name/description, `role="dialog"`, `aria-modal`, initial safe focus, Tab containment, Escape close, body scroll lock, and focus restoration. Destructive confirmations place Cancel before the destructive action and focus Cancel initially. No accidental default action was found. About appropriately focuses its ordinary Close action rather than the icon-only close control.

No dialog correction finding is required. Narrator reading order and focus restoration after destructive state replacement remain manual checks.

## Color, contrast, motion, and transient UI

Readable muted text is separated from disabled text and the current automated test measures `--ui-text-muted` at or above 4.5:1 against all intended solid surfaces. No known source-token contrast failure remains. Because several actual backgrounds are translucent `color-mix()` values, this audit does not claim blanket WCAG contrast conformance; representative rendered combinations still need measurement.

Meaning is not generally color-only: Validation includes severity words, Inter-System fuel states use patterns plus accessible descriptions, and toggle state is exposed programmatically. A11Y-05 captures the remaining reduced-visual-cue weakness for selected and stale controls.

The active product UI has negligible motion. Search movement and drag outlines follow direct input; statuses do not animate. The only discovered CSS transitions are legacy/template selectors not used by the current product surfaces. No `prefers-reduced-motion` correction is warranted now.

Success messages auto-dismiss after five seconds but remain announced through the polite live region; errors persist until dismissal. No essential information is available only briefly because the underlying exported/imported state is not conveyed solely by the toast. Manual assistive-technology verification should still confirm single announcements.

## Localization interaction

The effective locale updates `document.lang`, and semantic strings, accessible names, descriptions, tooltips, validation content, status messages, and dialog content resolve through the localization catalogue. The sampled runtime was `ja-JP`; its accessibility tree exposed Japanese labels/descriptions for the inspected controls and state values. Locale switching does not alter roles, state models, persisted network identity, or history.

No English-only active ARIA string was found in the audited UI paths. `en-GB` inherits the structurally equivalent `en-US` catalogue where it has no override. Japanese typography hardening remains intact, and no accessibility defect requires reopening official reference-name provenance work.

## Automated coverage assessment

Current coverage is useful but narrow:

- 151 unit tests cover keyboard shortcut routing, validation navigation helpers, locale/document language, status derivation, contrast tokens, and domain behavior;
- 12 JSDOM component tests cover compact accessible names, Inter-System semantics, drag-handle exclusion, Validation severity, live regions/import deferral, Cargo state descriptions, Search combobox behavior, Search Results focus restoration, and locale-state separation;
- static localization guards catch hard-coded accessibility copy;
- there is no current accessibility scanner or browser-level accessibility/reflow command.

Cheap, high-value component additions after corrections:

- Matrix read-only status reading semantics and exclusion from sequential Tab order;
- Planned Supply neutral/planned/unavailable accessible names and states across `en-US`/`ja-JP`;
- collapsed Cargo summary description;
- character numeric invalid-entry instruction/feedback;
- Validation trigger/panel relationship;
- Search button behavior for zero/one/multiple matches;
- dialog initial focus, Tab loop, Escape, and restoration in both dialog types;
- landmark/heading assertions for the assembled application shell.

Browser-level coverage should exercise responsive widths corresponding to 125/150/200% zoom, document overflow, Matrix/Cargo visible widths, keyboard focus order, and modal/background behavior. A Playwright-style browser harness would catch A11Y-01 more reliably than JSDOM.

Adding an axe-style scanner is worthwhile as a bounded correction slice. `axe-core` integrated with component tests can cheaply catch invalid landmark nesting, missing relationships, and many name/role errors. A browser-level axe pass over representative expanded/collapsed states would add further value. It must remain a regression aid, not proof of accessibility, and no dependency should be added until implementation is separately authorized.

Manual testing remains essential for screen-reader phrasing and mode changes, true header association, visual focus under zoom, rendered contrast, forced colors, tooltip discoverability, touch comfort, and cognitive efficiency.

## Accepted limitations

- Safari, VoiceOver, iPhone, and other Apple/WebKit testing remain deferred because no suitable environment was available; this does not block the desktop accessibility batch.
- `en-GB` relies on `en-US` structural equivalence unless a specific override changes semantics.
- Dense Matrix and Planned Supply surfaces legitimately retain local horizontal scrolling; eliminating all local scrolling is not an accessibility goal.
- Native `title` behavior varies by browser and is not treated as sufficient for essential information. Supplementary full-name titles on otherwise named controls are accepted.
- Disabled/unavailable presentation may remain visually subdued where the state and essential information are still available.
- The audit did not claim WCAG conformance and did not treat automated tests as such proof.
- Windows Narrator, true browser zoom, OS scaling, and forced-colors behavior remain unverified rather than implicitly passed.

## Recommended correction slices

1. **Responsive workspace and semantic shell (A11Y-01, A11Y-03).** Add the constrained-width workspace adaptation, restore one coherent main landmark, separate heading text from actions, and regularize Matrix table ownership. Add browser reflow and shell-semantic tests.
2. **Dense-control state and focus model (A11Y-02, A11Y-05, A11Y-07).** Consolidate read-only Matrix inspection, add durable selected/stale/forced-color cues, and enlarge the smallest hit boxes while preserving density.
3. **Forms and compact surface semantics (A11Y-04, A11Y-06, A11Y-08, A11Y-09).** Add numeric-entry feedback, one Cargo collapsed-summary description, the Validation panel relationship, and consistent Search submit behavior with focused component coverage.
4. **Regression tooling and manual verification.** Consider axe-style component/browser scanning, then execute the checklist below with Narrator and Windows forced colors. This slice should not be used to postpone the HIGH reflow correction.

## Manual verification checklist

No item below is reported as passed unless explicitly marked **Observed**.

### Keyboard-only

- [x] Traverse the full create/edit/export/import task flow without a mouse.
- [x] Confirm Tab order through locale, Search, network controls, Navigation, Outpost Details, Matrix, Planned Supply, Cargo, Validation, history, settings/About, and dialogs.
- [x] Verify corrected Matrix traversal does not require visiting every passive status chip.
- [x] Verify Search arrow/Enter/Escape, results focus hand-off, keyboard palette movement, close, and Search focus restoration.
- [x] Verify Matrix local horizontal scrolling can be reached and operated with keyboard at each zoom level.
- [x] Verify Planned Supply neutral/planned/unavailable states and focus visibility.
- [x] Verify Cargo disclosure, selectors, Inter-System state, exports, collapsed summary, reshuffle, move buttons, and Escape drag cancellation.
- [x] Verify Validation trigger, roving arrows, Home/End, activation, Escape return, and global shortcut.
- [x] Verify dialog initial focus, forward/reverse Tab containment, Escape, action activation, and focus restoration.
- [x] Verify Import's visible button opens the native picker and focus returns after cancel/success/failure.

### Screen reader — Windows Narrator with primary Chromium browser

- [x] Confirm one main landmark and coherent heading navigation, with action buttons not included in heading names.
- [x] Confirm locale selector name/value and document language in `en-US` and `ja-JP`.
- [x] Confirm Search combobox instructions, option position/state, submission, results summary, flags, and focus changes.
- [x] Confirm Matrix table name, row/column associations, resource/source context, pressed/disabled states, Inputs/Logistics descriptions, and local scrolling.
- [x] Confirm Planned Supply category headings and three-state catalogue semantics.
- [x] Confirm collapsed Cargo summaries announce destination, outbound, inbound, and Inter-System state; confirm expanded selector labels and stale export descriptions.
- [x] Confirm Validation aggregate counts, per-row severity/context/message/remediation, navigation activation, and panel relationship.
- [x] Confirm dialogs announce name/description once and do not expose background content as active modal content.
- [x] Confirm import/export success announces once, failure announces once after native-picker focus returns, and dismiss remains separate.
- [x] Confirm the Inter-System passive marker is announced by its localized semantic name without reading the decorative glyph.

### Zoom and reflow

- [x] **Observed:** normal 1003 CSS-pixel viewport had no document-wide horizontal overflow and retained usable Matrix/Cargo surfaces.
- [x] **Observed:** constrained widths of 683 and 640 CSS pixels caused page-wide overflow and effectively collapsed the Matrix.
- [x] Test true browser zoom at 100%, 125%, 150%, and 200% where practical on representative 1366px and 1920px displays.
- [x] Confirm no text/control clipping, page-wide task-flow overflow, or sticky header/footer obstruction.
- [x] Confirm dialogs, Search Results, Validation, Matrix, Planned Supply, and Cargo remain reachable and scrollable.
- [x] Confirm focus rings remain visible at container edges and inside local scrollers.

### High contrast / forced colors

- [x] Test Windows forced-colors/high-contrast mode after A11Y-05 correction.
- [x] Confirm selected, planned, available, unavailable, stale, fuelled/unfuelled, validation severity, focus, borders, and icons remain distinguishable.
- [x] Confirm custom backgrounds do not obscure control boundaries or text.

### Locales

- [x] Repeat representative keyboard/Narrator smoke tests in `en-US` and `ja-JP`.
- [x] Confirm Japanese labels do not truncate, overlap focus rings, or change control roles/states/order.
- [x] Confirm switching locale while Search Results, Validation, Context Help, or a dialog is open leaves focus behavior coherent.
- [x] Rely on `en-GB` structural equivalence unless an override-specific semantic difference is discovered.

### Pointer/touch and transient UI

- [ ] Confirm compact target sizes are practical with touchpad, mouse, and Windows touch where available.
- [x] Confirm essential tooltip/help content has keyboard, touch, and screen-reader equivalents.
- [x] Confirm Context Help opens by Enter/Space, only one panel remains open, outside click closes it, and Escape closes/restores focus.
- [x] Confirm no success/failure information is lost because of timing and no user action moves focus unexpectedly.

### Deferred platform coverage

- [ ] Safari/VoiceOver and iPhone/WebKit smoke testing when a suitable environment becomes available; do not block this desktop correction batch on it.

## Manual verification findings — 15 September 2026

### Screen reader — Windows Narrator with primary Chromium browser

- In the locale selector, Japanese language selection is not announced. -- FIXED
- Buttons in the Logistics column are not announced when clicked. -- FIXED
- Enabled buttons (both lit and unlit) in Planned Supply are announced twice 
  when clicked. -- FIXED
- Contextual Help buttons: clicking the button announces the button state, 
  but not the contents of the contextual help message. -- FIXED
- In the Cargo Links drop-down selector for the remote outpost cargo link, 
  abbreviations for the exported items at the remote outpost are not expanded 
  into their full name. For example, if the link shows 'MRg' then Narrator 
  announces 'M-R-G', not 'Microsecond Regulator'. -- FIXED
- Validation popup navigation - Narrator seems to interfere with the message 
  navigation controls. -- NOT BROKEN
- Landmarks - Most areas of the screen are defined landmarks, except for the 
  Outpost Details area. -- FIXED

### Zoom and reflow

- At 125% and 200% zoom the product labels in Manufacturing could overlap or 
  even entirely cover the labels in the Producing and Inputs columns. -- FIXED

### High contrast / forced colors

- In the Resource Matrix, buttons which were active and lit did not have 
  visible text in them in High Contrast #2, High Contrast Black, or High 
  Contrast White modes. The labels were legible in High Contrast #1 mode, 
  however. -- FIXED

### Untested items

- checks relating to Safari/WebKit
- checks relating to touchscreens and touchpads

## Outcome B — targeted corrections required
