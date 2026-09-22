# Cross-Locale Compact Layout Capacity Review

## Outcome

No locale-specific blocker or loss of operability was found across the
completed locale set. The review confirmed shared compact-capacity debt in the
Search field, Solar `Very Poor` output, wrapped 1366 px header, long reference
names, Resource Matrix column headings, and fixed-chrome focus visibility. It
also records a Polish-specific Outpost Details heading-height/control-alignment
defect. These are evidence for later targeted UI work, not authorization for
geometry or copy changes.

## Method and limits

The production build was reviewed on 22 September 2026 in the Codex in-app
Chromium browser using the real runtime catalogues and generated reference-name
overlays for every supported locale. The corrected findings also incorporate
the user's manual screenshots of the final selector, Resource Matrix in French,
German, Italian, Polish, and Spanish, and Polish Outpost Details Solar/Wind
controls. Those screenshots are treated as direct visual evidence without
inferring unmeasured pixel dimensions.

Repeatable viewport overrides covered 1366×768 and 1600×900. A 683×384 CSS
viewport was also used as a 200%-reflow equivalent. Browser shortcut zoom did
not change the in-app browser's reported viewport or device scale, so this run
does **not** claim a new true-browser-200%-zoom result. The completed Simplified
Chinese QA retains its separate true-200% Windows/Chromium evidence. No
Apple/WebKit environment was available.

Checks included document and element scroll width, hidden/clipped content,
viewport bounds, header/dialog geometry, semantic browser output, and isolated
fresh-origin fixtures for Search and `Very Poor`. Intentional Matrix scrolling
and documented ellipsis were separated from page-level overflow.

## Baseline results

At 1600×900, every locale retained a 77 px working header, no page-level
horizontal overflow, and no control collision. At 1366×768, all locales still
had no page-level horizontal overflow. French, German, Japanese, and Spanish
wrapped the working header from 77 px to 145 px; the remaining locales stayed
at 77 px. The wrap preserved all controls and is classified as **shared capacity
pressure / polish debt**, not a locale-specific defect.

Help, About, and reset/delete confirmation dialogs were opened in all ten
locales at 1366×768. About and confirmation content fit without horizontal or
vertical clipping. Help used its designed internal vertical scroller and had no
horizontal clipping. Expanded Planned Supply had no page-level horizontal
overflow in any locale. Cargo Links zero-state controls and headings remained
available; detailed populated-link speech behavior belongs to the separate
accessibility reconciliation.

## Findings

| Surface | Evidence | Classification | Disposition |
| --- | --- | --- | --- |
| Locale selector | Final ordered options remained visible and self-identifying in all locales | No issue | No follow-up |
| Working header at 1366 px | French, German, Japanese, and Spanish wrapped to 145 px without collision or missing controls | Shared capacity pressure / polish debt | Consider only with broader compact-header work |
| Search placeholder | A real input probe measured 196 px available. French required 256 px and German 208 px; the other current placeholders fit | Shared cross-locale defect, visual and non-blocking | Dedicated Search copy/geometry brief if visible completeness is required |
| Solar `Very Poor` | The 75 px control required 102 px French, 110 px German, 102 px Italian, 86 px Portuguese, and 118 px Spanish. English, Japanese, Polish, and Chinese fit | Shared cross-locale defect, visual and non-blocking | Dedicated compact power-control brief; preserve full semantic tooltip/name |
| Resource Matrix headings | Manual screenshots show visible heading pressure in French, German, Italian, Polish, and Spanish: awkward wrapping, multi-line expansion, and a tall or irregular header row. Spanish `MATERIALES DE ENTRADA` wraps across three lines. Controls remain usable and no evidence indicates incorrect translations | Shared cross-locale Resource Matrix header capacity defect, with severity varying by locale | Dedicated cross-locale UI/design brief; investigate column-width rebalance, surface-specific typography, controlled two-line treatment, or approved compact visible labels with full accessible names without choosing a solution here |
| Polish Solar/Wind headings | Manual Polish evidence shows `ENERGIA SŁONECZNA` and `ENERGIA WIATROWA` wrapping to two lines and placing their controls visibly lower than adjacent System, Body, and Biome controls. The same alignment break has not been observed in other manually checked locales | Polish-specific Outpost Details heading-height/control-alignment defect | Dedicated cross-locale Outpost Details capacity/layout brief; do not shorten the accepted Polish translations merely to fit |
| Long flora/fauna names | Ellipsis occurred in English and most translated Latin/Japanese catalogues; full names remained in semantic content/tooltips. Chinese fixture names fit | Expected/intentional compact behavior | No locale-specific correction |
| Planned Supply cells | The section itself fit. Invariant `R-COOH` and `SiH3Cl` exceeded a 55 px compact cell by about 3 px in every locale | Shared capacity pressure / polish debt | Revisit only if visible token loss is confirmed as material |
| Help/About/destructive dialogs | No horizontal clipping or collision in any locale; Help's internal vertical scroll was expected | No issue | No follow-up |
| Page reflow equivalent | Every locale measured the same 119 px page-level horizontal overflow at 683 CSS px | Shared cross-locale defect | Address only in a dedicated high-magnification/layout brief |
| Focus visibility between fixed chrome | A shortcut-focused Matrix button landed below the 384 px viewport, behind/below the fixed status region | Shared cross-locale defect | Dedicated focus-visibility brief |

Polish remained at the compact 77 px application-header height at both desktop
baselines. That result concerns the application header and does not contradict
the manually observed Polish-specific Outpost Details defect: the two-line
Solar/Wind headings lower those controls relative to adjacent fields. The
Matrix heading issue is separately shared across at least French, German,
Italian, Polish, and Spanish.

## Surface inventory

- Application/title bar and selector: no collision or page overflow.
- Navigation: controls remained available at both desktop baselines.
- Outpost Details: fields remained operable. Localized `Very Poor` has shared
  fixed-width pressure, while Polish Solar/Wind headings create a distinct
  vertical-alignment defect.
- Resource Matrix: manual evidence confirms degraded visible header grammar in
  French, German, Italian, Polish, and Spanish. This visual capacity issue is
  distinct from intentional local scrolling, name ellipsis, and the separately
  reconciled assistive-technology semantic-context finding.
- Planned Supply: expanded catalogue fit its column; compact technical-token
  pressure is shared.
- Cargo Links: headings, add/expand/reshuffle controls, and zero-state fit.
- Search: results control remained operable; French/German placeholder clipping
  was confirmed.
- Validation/status: fixed chrome remained present; high-reflow focus occlusion
  was confirmed.
- Help, About, and destructive dialogs: no clipping or control collision.

No layout CSS, control width, breakpoint, or localized copy was changed.
