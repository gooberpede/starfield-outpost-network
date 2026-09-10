Audit complete. No application code, CSS, documentation, fixtures, or network data was changed.

## 1. Executive summary

- The semantic taxonomy broadly matches the runtime UI.
- The largest inconsistency is between explicitly styled dense controls and browser-native buttons, selects, and inputs.
- Ordinary commands, create/destructive actions, mode buttons, navigation selectors, and bulk actions render largely as Chromium defaults: Arial 13.33px, square native borders, and native focus rings.
- The selected outpost is visually indistinguishable from an ordinarily disabled native button. Its selection meaning is not communicated separately from unavailability.
- Planned Supply, cargo exports, and matrix cells genuinely share the same accent grammar: `--accent` border/text plus `--accent-bg`. They differ substantially in geometry and focus offset.
- Outpost and Cargo Pad reorder controls share behavior but not geometry. Handles have the same width and focus treatment, while Cargo Pad handles are taller and disappear when locked; Outpost handles remain visible and dimmed.
- Reshuffle/Lock Order buttons are identical native buttons in both panes. Active mode changes only the label and `aria-pressed`; there is no active visual styling.
- Solar/Wind indicators deliberately combine explicit application box styling with the browser’s small-control Arial font, making passive output resemble a control.
- Heading hierarchy is already fairly coherent: pane titles and Planned Supply use the same `h2` treatment; matrix and Planned Supply subsections are almost identical.
- Highest-risk future consolidation areas are native command families, selected-versus-disabled navigation, focus consistency, and reorder-control geometry.

Evidence notation below:

- **CV**: computed-style verified.
- **RO**: runtime observed.
- **SI**: source-code inferred.
- **NR**: not safely runtime reachable from the supplied sample.

Primary measurements used Chromium at 1440×1000, DPR 1, light color scheme, with the root font at 18px/26.1px.

## 2. Control-family audit

| Family | Runtime evidence and computed treatment | State findings / inconsistencies |
|---|---|---|
| Primary selector | Outpost buttons: 21px high, native Arial 13.33px, `1px 6px` padding, 2px outset border. **CV/RO** | Current selection is the native disabled treatment: translucent gray text/background/border. No selected-specific grammar. Native 1px `auto` focus on enabled buttons. |
| Drop-down selector | System/Body and cargo destination selects: 19px high, Arial 13.33px, 1px native gray border, no authored padding/radius. System/Body width 180px; cargo destination fills its container. **CV/RO** | Disabled Body retains white background but uses muted text and translucent border. Invalid recovery values such as `feynman` and `feynman-vi-b` look identical to valid values. Native 1px `auto` focus. Hover is browser-dependent. |
| Binary toggle | Inter-System: 105.7×29.6px, Arial 14.76px; cargo export: 50.4×29.7px, mono 12.96px. **CV/RO** | Cargo export pressed state uses accent border/text/background. Inter-System uses the same authored accent declarations when pressed, with a separate green fuelled variant. Biome shares the accent declarations but was **NR/SI** because the sample exposed no biome buttons. |
| Three-state catalogue | Planned Supply cells: 56.7×38.7px, mono 14.04px/14.04px, weight 600, 1px border, 5.4px radius. **CV/RO** | Neutral and available verified. Available uses `--code-bg`, `--text`, opacity .48, `cursor:not-allowed`, but remains an enabled/focusable button with `aria-disabled`, not native `disabled`. Planned state was **NR/SI**. |
| Matrix state | Editable and read-only cells: 57.6×27.9px, mono 13.68px, weight 600, 1px border, 5.4px radius. **CV/RO** | Lit and editable-on are visually identical accent states. Dimmed uses `--code-bg` and opacity .48. Interactive versus derived meaning is primarily conveyed by element type/cursor. Disabled editable styling is opacity .28 and not-allowed cursor, **SI** for this sample. |
| Passive indicator | Solar/Wind: 76.5×29.1px, 2px `--border`, 4.5px radius, `--code-bg`, `--text-h`. **CV/RO** | `font:-webkit-small-control` resolves to Arial 13.33px, closely coupling it to native controls. Only unknown `—` was reachable; known qualitative values were **NR**. |
| Secondary indicator / metadata | `[INT]`: system font 14.4px/26.1px, weight 600, no border/background, 6.3px left margin. Counts such as `[3]` and `[1]` are inline heading text. **CV/RO** | Categorical badge and capacity metadata are materially different and should not be treated as one visual component. Fractional capacity was **NR** because ranks were unset. |
| Mode button | Both Reshuffle controls are native 21px buttons. Active Lock Order is also native; width changes from 72.1px to 79px only because of text. **CV/RO** | No authored inactive/active/pressed distinction. Cargo version becomes native-disabled below two pads; Outpost version remains enabled. |
| Disclosure control | Planned Supply toggle: approximately 25.4×22px native button. Cargo summary: transparent borderless 62.8×26.1px button, system font 18px weight 600. **CV/RO** | Expansion changes glyph only (`▶/▼`, `▸/▾`). Planned Supply uses native focus; Cargo summary also falls back to native focus despite otherwise custom presentation. Hover underline exists only for Cargo Pad summary. |
| Bulk disclosure action | Expand/Collapse All is a normal native 21px button. **CV/RO** | Label changes with state. Native-disabled only when there are no pads; that condition was **SI/NR**. No distinct bulk-action grammar. |
| Reorder handle | Both handles are 22.5px wide with system font 18px. Outpost height 26.1px; Cargo Pad height 36px. **CV/RO** | Both focused handles use a 2px accent outline with 1px offset. Locked Outpost handle remains visible at opacity .35 with not-allowed cursor; locked Cargo Pad handle is absent. Dragging opacity .55 was **SI/NR**. |
| Move control | Both use native 36px-wide buttons with zero inline padding. Outpost controls are 21px high in two columns; Cargo Pad controls are 36px high in two rows. **CV/RO** | Boundary-disabled styling is native. Same semantics, substantially different geometry and orientation. |
| Create action | Add Outpost 100.9×21px; Add Cargo Pad 117.9×21px. Both are otherwise identical native buttons. **CV/RO** | No semantic styling beyond label. Disabled behavior was not present in the sample. |
| Ordinary command | Undo, Redo, Export, Import, Reload Reference Data: native Arial 13.33px buttons, 21px high. **CV/RO** | Disabled Undo/Redo use Chromium’s translucent treatment. Hover/focus remain native and platform-specific. |
| Destructive action | Delete Network/Delete Outpost are ordinary native buttons. Expanded Remove is a compact native button, 77×29.6px, with inherited `--text` color. **CV/RO** | No red/destructive grammar. Remove differs only in density; disabled deletion remains native. |
| Editable text | Character: 177×21px, native Arial 13.33px, inset 2px border. Outpost name: full-width, 37.5px high, heading font 24px/28.32px weight 500. **CV/RO** | Character field uses native 1px auto focus. Outpost name uses authored 2px accent focus with 1px offset and gets `--code-bg` plus `--border` on hover. No invalid styling exists. |
| Numeric/rank field | Runtime size 148×21px, native Arial 13.33px. **CV/RO** | It is not actually compact: `.character-header__field input { min-width:140px }` overrides the intended 4rem minimum. Invalid drafts reset on blur without a visual invalid state. |
| Status-summary trigger | Validation trigger: 129.9×21px native button. Open panel: 576px wide, 18px padding, 1px `--border`, 9px radius, `--shadow`. **CV/RO** | Trigger looks like an ordinary command in both open and closed states. Zero versus non-zero has no authored visual variant; zero was **NR/SI**. |
| Transient dismiss | Source defines a borderless transparent icon button inheriting footer font/color, with hover underline. **SI/NR** | No transient error was safely available, so normal/hover/focus could not be runtime verified. It is distinct from boxed move and disclosure icons. |

## 3. Heading and text-role audit

| Role | Representative element | Computed typography and spacing |
|---|---|---|
| Application identity | Title `h1` | 27px/26.1px, weight 500, `--heading`, letter-spacing −1.68px; zero margin inside padded title bar. |
| Editable workspace title | Outpost-name input | 24px/28.32px, weight 500, letter-spacing −0.24px; 3.6×6.3px padding. |
| Pane title | Outposts/Cargo Pads `h2` | 24px/28.32px, weight 500, margin-bottom 8px. |
| Major collapsible section | Planned Supply `h2` | Same pane-title typography; 6.3px internal gap for disclosure button. |
| Matrix section | Inorganic/Manufacturing `h3` | 17.1px/26.1px, weight 650; 1.8×9px padding where using the section-heading form. |
| Planned Supply subsection | Catalogue `h3` | 17.1px/26.1px, weight 600. Nearly identical to matrix sections. |
| Matrix column heading | Header cells | 14.04px/26.1px, weight 700, letter-spacing .421px, `--code-bg`. |
| Field/indicator label | Character/System/Solar | 18px/26.1px, weight 400. |
| Matrix item label | Aluminium, product names | 15.84px/26.1px, weight 400. |
| Cargo object title | Pad disclosure | 18px/26.1px, weight 600. |
| Badge/status annotation | `[INT]` | 14.4px/26.1px, weight 600. |
| Count/capacity metadata | `[3]`, `[1]` | Not a separate element; inherits pane-title styling exactly. |
| Footer status | Reference-data text | 16.2px/26.1px, weight 400. |
| Validation severity | `strong` inside issue | 16.2px/26.1px, weight 700; no severity-specific color. |
| Interaction hint | Status-bar hint | 16.2px/26.1px, `--text-h`; **SI**, because no drag was initiated. |
| Transient feedback | Status message | Footer typography; errors become weight 600. **SI/NR**. |
| Empty/help copy | Matrix empty row | 15.3px/26.1px with 4.5×9×9px padding. Ordinary Planned Supply empty text remains root 18px. |

The application identity and editable/pane titles use different elements but form a coherent hierarchy. Conversely, all `h2` elements render at the same level, regardless of whether they are pane titles or disclosure headings.

## 4. Shared-state comparison

- Selected/pressed: dense custom controls share the accent trio exactly. Native mode buttons and the selected outpost do not participate.
- Focus-visible: matrix and Planned Supply use 2px accent with 2px offset; cargo exports and reorder handles use 2px accent with 1px offset; outpost name also uses 2px/1px. Native controls use Chromium’s 1px `auto` outline at zero offset.
- Disabled: native controls use browser translucency. Matrix uses explicit opacity .28. Planned Supply “available” uses `aria-disabled`, opacity .48, and remains focusable.
- Dimmed: matrix inactive and Planned Supply available both use `--code-bg`, `--text`, and opacity .48.
- Expanded: disclosure controls change glyph/label but not box styling.
- Active mode: only the Reshuffle label and `aria-pressed` change.
- Dragging: source assigns opacity .55 to both reorder collections; not runtime exercised to avoid risking a persisted reorder.

Hover could not be synthesized by the available inspection interface. Source rules show accent-border hover for Planned Supply and cargo exports, underline for Cargo summaries/dismiss, and code-background hover for the outpost-name editor. Native-control hover remains browser-dependent.

## 5. Cross-component duplicate comparison

- Drag handles share width, font, active color, cursor, and focus ring. Cargo Pad handles are taller and absent when locked.
- Reshuffle buttons are runtime-identical native controls. Cargo alone has a count-based disabled state.
- Move controls share width and native treatment, but Outposts use horizontal 36×21px buttons while Cargo Pads use vertical 36×36px buttons.
- Create actions are visually identical except intrinsic label width.
- Pressed accent styling is genuinely identical across Biome, Inter-System, cargo export, Planned Supply, and matrix selectors at the declaration level; geometry, font, native appearance, and focus offset remain variants.
- Pane and major-section headings are identical. Matrix and Planned Supply subsection headings differ only in weight 650 versus 600 and local padding.
- Matrix, Planned Supply, and cargo export cells share mono/accent concepts but use three separate sizes.

## 6. Native/browser dependency and tokens

Strongly native/browser-dependent:

- ordinary, destructive, create, mode, and bulk-action buttons;
- selected Outpost navigation;
- System/Body/cargo selects;
- Character and rank inputs;
- Planned Supply’s small disclosure button;
- Solar/Wind font metrics.

Token usage:

- `--text`, `--text-h`, `--bg`, `--border`, and `--code-bg` dominate custom matrix/catalogue/indicator/panel styling.
- `--accent`, `--accent-bg`, and `--accent-border` provide the consistent selected, focus, hover, and insertion-marker language.
- `--shadow` is materially used by the validation panel.
- `--mono` unifies dense resource/product cells.
- `--heading` unifies application, pane, subsection, and editable-title typography.
- Native controls largely bypass all font and semantic color tokens.
- Page header/status surfaces use browser `Canvas`/`CanvasText`, another browser-dependent path.

## 7. Missing semantic families

One candidate was found: **inline editing-workflow controls**.

Examples are Manufacturing `edit`, `save`, `cancel`, `+`, and draft-item `−`. They enter, commit, cancel, or modify a provisional editing session rather than immediately acting as ordinary commands. Important states would include viewing, editing, adding, dirty draft, and commit/cancel availability. Runtime currently presents them as small native commands, so this is a semantic distinction rather than merely different padding.

No other clearly missing control family was identified.

## 8. Candidate consolidation observations

- Safe to share later: accent state colors, dense mono typography, and the common custom focus-ring declaration.
- Keep as variants: Planned Supply, matrix, and cargo-export geometry; their densities and semantic roles are materially different.
- Safe semantic family: Outpost/Cargo reorder toolbars and move controls. Preserve horizontal versus vertical layout as variants.
- Selected Outpost needs an explicit selected variant before ordinary disabled controls can be consolidated safely.
- Native commands could share a future base treatment, but destructive, mode, disclosure, and inline-edit workflow semantics should remain explicit variants.
- Matrix and Planned Supply subsection heading treatment is already close enough to consolidate without changing hierarchy.
- Solar/Wind should remain a passive-indicator variant even if it later shares dimensions or typography with nearby controls.

Verification performed:

- Ran the application in its normal Vite development environment.
- Exercised disclosures, validation open/closed state, keyboard focus, selected outposts, and both reorder modes.
- Restored the initial presentation state and stopped the temporary server.
- Did not run the production build because this was a strictly read-only runtime audit.
- `git diff --check` reports pre-existing trailing whitespace in `docs/BACKLOG.md`.
- Current Git status remains the pre-existing modified `docs/BACKLOG.md` plus the untracked supplied brief. No audit changes were introduced.
- No commit or push was performed.

Suggested commit message if this audit is later saved as a report:

`docs: add runtime computed-style audit`