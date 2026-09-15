# Whole-Product Accessibility Audit

**Audit date:** 2026-09-14  
**Final reconciliation:** 2026-09-15

**Scope:** Whole application source, component semantics, styles, automated coverage, bounded Chromium runtime observation, and follow-up manual verification in the primary Windows/Chromium environment.

**Disposition:** Outcome A — accessibility correction batch complete with accepted platform limitations

## Executive summary

The application's accessibility baseline is sound for its intended desktop use, and the targeted correction batch identified by this audit has been completed.

The original audit found no BLOCKER, one HIGH finding, five MEDIUM findings, and three LOW findings. The HIGH reflow defect and all eight remaining findings were addressed through focused implementation slices and verified through automated checks plus manual testing where the behavior could not be established reliably in JSDOM or source inspection.

The product now has:

- one coherent main landmark and improved heading/region structure;
- a Resource Matrix that preserves usable behavior under constrained widths and no longer places passive status indicators in sequential Tab order;
- screen-reader-readable Logistics semantics for both imports and exports;
- explicit numeric-entry recovery feedback;
- durable selected/stale state cues in Windows forced-colors modes;
- meaningful collapsed Cargo summaries and full-name selector announcements;
- an explicit Validation trigger/panel relationship;
- deterministic Search submission behavior;
- enlarged practical hit targets for the smallest dense controls;
- verified keyboard-only operation across the principal workflows;
- verified Windows Narrator behavior for the major control surfaces;
- verified true browser zoom through 200%;
- verified Windows high-contrast/forced-colors behavior;
- verified Windows text scaling at 125% and 150%, with cosmetic degradation but no clipping, overlap, loss of control boundaries, or inaccessible content observed.

The audit does **not** claim WCAG conformance. It is a product-focused accessibility audit and correction record. Touchscreen/touchpad comfort testing and Apple/WebKit coverage remain deferred because suitable test environments are not currently available. Those limitations do not block closure of the desktop accessibility batch.

## Original finding count

| Severity | Original count | Final open count |
| --- | ---: | ---: |
| BLOCKER | 0 | 0 |
| HIGH | 1 | 0 |
| MEDIUM | 5 | 0 |
| LOW | 3 | 0 |
| COSMETIC | 0 | 0 |
| **Total** | **9** | **0** |

## Final disposition statements

- **Core workflow accessibility:** no essential workflow is mouse-only. The original constrained-width failure was corrected and true browser zoom was subsequently exercised through 200%.
- **Keyboard-only operation:** passed for the principal create/edit/export/import workflow and associated Navigation, Matrix, Planned Supply, Cargo, Validation, Search, history, dialogs, and Import picker interactions.
- **Tab order:** passive Matrix status indicators remain outside sequential Tab order; interactive controls remain keyboard reachable.
- **Focus visibility:** manually verified across ordinary and dense controls, including zoomed layouts and local scrollers.
- **Screen-reader semantics:** manually verified with Windows Narrator in the primary Chromium browser across landmarks, Search, Resource Matrix, Planned Supply, Cargo, Validation, dialogs, locale switching, Logistics, and live announcements.
- **Live announcements:** success and failure announcements were manually verified, including the native import-picker focus-return case.
- **Forms:** numeric invalid-entry feedback now announces the reason/reversion without creating noisy invalid-state announcements while typing.
- **Color-only meaning:** selected/stale states retain non-color/system-color distinction in Windows forced-colors modes.
- **Contrast:** no known readable-text failure remains in the tested desktop environment. The audit does not claim blanket WCAG contrast conformance for every rendered `color-mix()` combination.
- **Zoom/reflow:** the original HIGH defect was corrected; true browser zoom at 100%, 125%, 150%, and 200% was manually exercised.
- **Windows text scaling:** manually exercised at 125% and 150%; layout quality degrades somewhat, but no text/control clipping, destructive overlap, or inaccessible content was observed.
- **Semantic structure:** corrected without introducing a full ARIA-grid model.
- **Resource Matrix:** retains native-button-plus-table semantics, local horizontal scrolling where appropriate, passive read-only states, and screen-reader-readable Logistics meaning.
- **Planned Supply:** three-state semantics, forced-colors behavior, focus visibility, and announcement behavior were manually verified.
- **Cargo Links:** collapsed summaries and selector labels now expose meaningful full names without adding per-abbreviation Tab stops.
- **Validation:** trigger/panel relationship and navigation semantics are in place; the initially suspected Narrator-navigation problem was determined not to be an application defect.
- **Release blocking:** no accessibility BLOCKER or unresolved HIGH/MEDIUM/LOW audit finding remains in the tested desktop environment.

## Method and observed scope

The audit followed this sequence:

1. source/component semantics;
2. keyboard and focus;
3. major control surfaces;
4. visual accessibility and reflow;
5. screen-reader semantics;
6. localization interaction;
7. automated coverage;
8. manual verification.

Initial runtime observation was performed in Chromium using mature local data, including `ja-JP`. The original constrained-width checks used explicit browser viewport sizes as a reflow proxy:

| CSS viewport | Document client/scroll width | Matrix viewport width | Original observation |
| ---: | ---: | ---: | --- |
| 1003 px | 988 / 988 px | normal working width | No page-wide overflow |
| 768 px | 753 / 764 px | 113 px | Minor document overflow; Matrix severely compressed but locally scrollable |
| 683 px | 668 / 764 px | 28 px | Page-wide overflow and Matrix effectively unusable |
| 640 px | 625 / 764 px | 0 px | Matrix disappeared while Cargo retained its 18rem minimum |

Those observations drove the HIGH reflow correction. Follow-up testing then used true browser zoom at 100%, 125%, 150%, and 200%, plus Windows Narrator, Windows forced-colors/high-contrast modes, and Windows text scaling at 125% and 150%.

## Findings and final status

| ID | Area | Severity | Original issue | Final status |
| --- | --- | --- | --- | --- |
| A11Y-01 | Zoom/reflow | **HIGH** | Matrix collapsed at constrained widths while Cargo retained its minimum width, creating page-wide overflow and making the Matrix unusable. | **CLOSED.** Workspace adapts before the Matrix collapses; Cargo stacks below the editor at the deliberate breakpoint. Local Matrix/Planned Supply scrolling is retained. True browser zoom through 200% was manually verified. |
| A11Y-02 | Resource Matrix keyboard model | **MEDIUM** | Passive Inputs/Producing/Import/Logistics status chips created excessive inert Tab stops. | **CLOSED.** Passive statuses were removed from sequential Tab order. Interactive controls remain keyboard reachable. Logistics meaning is exposed through screen-reader-readable text rather than new focus targets. |
| A11Y-03 | Landmarks, headings, Matrix structure | **MEDIUM** | Nested mains, heading-action name pollution, and irregular table ownership. | **CLOSED.** One `<main>` remains; Navigation and Cargo use appropriate landmarks; heading actions are siblings rather than part of heading names; Matrix rowgroups/cells use valid ownership. Narrator landmark/table navigation was manually verified. |
| A11Y-04 | Character numeric forms | **MEDIUM** | Invalid values silently reverted on blur without programmatic explanation. | **CLOSED.** Invalid drafts remain quiet while typing; blur restores the valid value and produces a stable screen-reader announcement explaining the reversion/reason. Blank optional values remain valid. |
| A11Y-05 | Reduced visual cues / forced colors | **MEDIUM** | Selected/stale dense states relied too heavily on authored color/fill and lacked forced-colors treatment. | **CLOSED.** Forced-colors/system-color cues were added. Matrix selected/lit/producing states use durable double-border/system-color treatment. High Contrast #1, #2, Black, and White were manually verified. |
| A11Y-06 | Collapsed Cargo Links | **MEDIUM** | Collapsed summaries exposed concatenated abbreviations without semantic expansion. | **CLOSED.** Collapsed summaries now expose localized full-name semantic descriptions without adding per-abbreviation Tab stops. Remote-outpost selector abbreviations are also announced by full item name. |
| A11Y-07 | Pointer/touch targets | **LOW** | Several compact controls had very small hit targets. | **CLOSED for desktop correction scope.** Context Help, Search, disclosures, X-Tech, and related dense actions received larger practical hit areas while preserving visual density. Direct touchscreen/touchpad comfort testing remains deferred due unavailable hardware. |
| A11Y-08 | Validation panel relationship | **LOW** | Trigger exposed expanded state without an explicit stable relationship to a named panel. | **CLOSED.** Trigger/panel now use a stable relationship and named region semantics while retaining the existing non-modal navigation model. |
| A11Y-09 | Search submission | **LOW** | Search button could remain enabled while activation had no deterministic action. | **CLOSED.** Submission now uses a deterministic highlighted candidate or sole candidate; zero/ambiguous cases are disabled, and Enter/button behavior is aligned. |

## Control-surface conclusions

### Resource Matrix

The Matrix's native-button-plus-table approach remains appropriate. It did not require conversion to a full ARIA grid.

Final state:

- editable states remain native buttons with localized names/states;
- passive statuses remain outside sequential Tab order;
- table/rowgroup ownership is regularized;
- local horizontal scrolling remains available where density requires it;
- Manufacturing labels remain fully readable under tested browser zoom;
- forced-colors selected/lit states remain visibly distinct;
- Logistics cells expose actual hidden semantic text for imports and exports, so Narrator announces the meaningful tooltip-equivalent sentence rather than an abbreviation or fragment.

Manual Narrator verification confirmed that Logistics cells announce table position followed by the full localized import/export meaning, regardless of whether the visual tooltip is displayed.

### Planned Supply

The three states remain programmatically distinguishable, and manual testing confirmed that duplicate enabled-state announcements are gone, focus remains visible, forced-colors behavior is distinguishable, and zoom/text scaling do not mangle the surface.

### Cargo Links

Expanded Cargo Links retain labelled native selects/buttons, disclosure state, Inter-System state/fuel meaning, stale-export descriptions, move controls, and keyboard alternatives to pointer dragging.

Collapsed summaries now provide one concise localized semantic description rather than forcing screen-reader users through per-abbreviation controls. Remote-outpost cargo-link selectors announce full item names rather than spelling abbreviations.

### Validation

Validation retains localized severity text, aggregate counts, complete message/remediation content, ordered-list semantics, efficient navigation, predictable Escape/focus return, and an explicit trigger/panel relationship.

An initial manual concern that Narrator interfered with Validation message navigation was investigated and classified **NOT BROKEN**; no speculative application workaround was introduced.

### Search

Search retains localized combobox/listbox semantics, arrow navigation, Enter/Escape behavior, Search Results focus hand-off, and focus restoration. The original enabled-but-no-op submit inconsistency was corrected so that the button and keyboard submission share deterministic behavior.

### Dialogs

Dialog semantics, containment, Escape handling, body scroll lock, safe initial focus, and focus restoration remain intact. No separate dialog correction finding was required.

## Localization interaction

Representative keyboard/Narrator smoke tests were repeated in `en-US` and `ja-JP`.

A manual defect was found in the native locale selector: Narrator announced the Japanese option only as its ordinal position. Controlled testing showed that per-option BCP-47 language metadata changed Narrator behavior. Fixed locale options now carry correct `lang` metadata, and the Japanese option is meaningfully announced by Narrator.

`en-GB` continues to rely on `en-US` structural equivalence except where an override changes actual copy.

## Automated coverage assessment

Automated coverage remains a regression layer, not proof of accessibility.

The correction batch expanded focused component coverage for:

- Matrix passive status semantics and exclusion from sequential Tab order;
- Matrix Logistics semantic text for inactive, single-destination, multi-destination, and imported states;
- Planned Supply state semantics/announcement behavior;
- collapsed Cargo summary descriptions;
- Character invalid-entry feedback/recovery;
- Validation trigger/panel relationship;
- deterministic Search submission;
- assembled semantic shell and Matrix ownership;
- locale-selector language metadata.

The normal verification suite remained green through the completed correction passes, including unit tests, component tests, reference-data checks, localization provenance/verification commands, build, lint, and scoped diff checks.

There is still no dedicated axe-style scanner or browser-level accessibility/reflow command. Adding one remains worthwhile future regression hardening, but it is **not** required to close this audit batch and would not itself constitute accessibility proof.

## Manual verification checklist

### Keyboard-only

- [x] Principal create/edit/export/import workflow
- [x] Full Tab order across major surfaces
- [x] Matrix passive-status traversal correction
- [x] Search keyboard behavior and focus restoration
- [x] Matrix local horizontal scrolling
- [x] Planned Supply states/focus
- [x] Cargo disclosure/selectors/move controls
- [x] Validation navigation
- [x] Dialog containment/Escape/restoration
- [x] Import native-picker focus return

### Screen reader — Windows Narrator with primary Chromium browser

- [x] Main landmark and heading navigation
- [x] Locale selector and document language in `en-US`/`ja-JP`
- [x] Japanese locale-option announcement
- [x] Search semantics and focus changes
- [x] Matrix table semantics and Inputs/Logistics descriptions
- [x] Logistics imports/exports announce full semantic meaning
- [x] Planned Supply semantics without duplicate announcements
- [x] Collapsed Cargo summaries and remote-selector full names
- [x] Context Help content announcement
- [x] Outpost Details landmark coverage
- [x] Validation semantics/navigation
- [x] Dialog announcement/modal behavior
- [x] Import/export live announcements
- [x] Inter-System passive marker semantics

### Zoom and reflow

- [x] True browser zoom at 100%, 125%, 150%, and 200%
- [x] No Manufacturing overlap after correction
- [x] No destructive clipping/page-wide task-flow failure
- [x] Dialogs/Search Results/Validation/Matrix/Planned Supply/Cargo remain reachable
- [x] Focus rings remain visible

### Windows text scaling

- [x] 125%
- [x] 150%
- [x] No destructive clipping, overlap, loss of control boundaries, or inaccessible content
- [x] Reduced visual polish accepted as cosmetic

### High contrast / forced colors

- [x] Windows forced-colors/high-contrast modes tested
- [x] Selected/planned/available/unavailable/stale/fuel/focus/borders/icons remain distinguishable
- [x] Active/lit Matrix labels visible in High Contrast #1, #2, Black, and White

### Locales

- [x] Representative keyboard/Narrator smoke tests in `en-US` and `ja-JP`
- [x] Japanese labels remain usable and structurally equivalent
- [x] Locale switching with open overlays/dialogs retains coherent focus
- [x] `en-GB` structural equivalence accepted unless an override-specific difference is discovered

### Deferred input/platform coverage

- [ ] Touchpad/touchscreen comfort testing when suitable hardware is available
- [ ] Safari/VoiceOver smoke testing when a suitable environment is available
- [ ] iPhone/WebKit smoke testing when a suitable environment is available

These deferred checks are backlog items and do not block closure of the current desktop accessibility batch.

## Manual verification findings — 15 September 2026

### Screen reader

- Japanese language selection in the locale selector was not meaningfully announced. — **FIXED**
- Logistics cells did not expose meaningful import/export content when inspected. — **FIXED**
- Planned Supply enabled states were announced twice. — **FIXED**
- Context Help announced button state but not help content. — **FIXED**
- Remote-outpost Cargo selector abbreviations were read as letters rather than full item names. — **FIXED**
- Validation popup navigation appeared to conflict with Narrator. — **INVESTIGATED; NOT BROKEN**
- Outpost Details lacked the intended landmark coverage. — **FIXED**

### Zoom and reflow

- Manufacturing product labels could overlap or cover Producing/Inputs labels at 125% and 200% zoom. — **FIXED**

### High contrast / forced colors

- Active/lit Resource Matrix labels became invisible in High Contrast #2, Black, and White. — **FIXED**

### Windows text scaling

- 125% and 150% Windows text scaling reduce visual polish and density, but no destructive clipping, overlap, loss of control boundaries, or inaccessible content was observed. — **PASS WITH COSMETIC DEGRADATION**

## Accepted limitations and backlog

- Safari/VoiceOver and iPhone/WebKit testing are deferred until a suitable Apple/WebKit environment is available.
- Touchscreen/touchpad comfort testing is deferred until suitable hardware is available.
- `en-GB` relies on `en-US` structural equivalence unless a specific override changes semantics.
- Dense Matrix and Planned Supply surfaces legitimately retain local horizontal scrolling.
- Native `title` behavior varies by browser and is not treated as sufficient for essential information.
- Disabled/unavailable presentation may remain visually subdued where state and essential information remain available.
- Windows text scaling at 125%/150% is functionally acceptable despite reduced visual polish.
- This audit does not claim WCAG conformance.
- Automated tests are regression aids, not substitutes for manual assistive-technology testing.
- Dedicated axe/browser-level accessibility regression tooling remains optional future hardening.

## Final outcome

### Outcome A — accessibility correction batch complete with accepted platform limitations

All nine original audit findings are closed within the tested Windows/Chromium desktop scope.

Manual verification covered keyboard-only operation, Windows Narrator, true browser zoom through 200%, Windows forced-colors/high-contrast modes, representative localization behavior, and Windows text scaling at 125% and 150%.

No known BLOCKER, HIGH, MEDIUM, or LOW accessibility finding from this audit remains unresolved in that tested scope.

The remaining untested areas are explicitly deferred platform/input coverage:

- Safari/VoiceOver;
- iPhone/WebKit;
- touchscreen/touchpad comfort.

Those items should remain on the backlog and be exercised when suitable environments become available. They do not require reopening the completed desktop correction batch unless they reveal a concrete defect.
