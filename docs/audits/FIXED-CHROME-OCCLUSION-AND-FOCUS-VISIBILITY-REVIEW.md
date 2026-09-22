# Fixed-Chrome Occlusion and Focus-Visibility Review

## Audit context

- **Audit date:** 22 September 2026
- **Branch:** `staging`
- **Scope:** read-only review of vertical scrolling, fixed/sticky chrome,
  focus navigation, and visible focus in the current local application
- **Runtime:** local Vite development server in the Codex in-app Chromium
  browser, using the existing mature Polish (`pl-PL`) local data

No production source, CSS, tests, backlog, architecture, or UX documentation
was changed. The runtime interactions changed only presentation/session state:
selected outpost, Planned Supply expansion, Validation-panel visibility, local
scroll positions, and focus.

This review used source inspection, existing durable audit evidence, the
user's direct manual runtime observation, DOM geometry, computed styles,
accessibility-tree observations, and browser interaction. The available
in-app browser accepted exact CSS viewport
overrides but did not respond to browser zoom shortcuts: five attempted zoom
steps left `innerWidth`, `innerHeight`, `devicePixelRatio`, and
`visualViewport.scale` unchanged. Consequently, 1600x900 and 1366x768 are
new exact-viewport observations, while 683x384 is explicitly a supplementary
200%-reflow equivalent, not a new true-browser-200%-zoom result. The earlier
true-zoom Windows/Chromium evidence remains the applicable evidence boundary.

## Current layout and scroll architecture

```text
document / root scrolling element (vertical owner)
└─ App <main>
   ├─ TitleBar <header>                 normal flow; scrolls away
   ├─ PageHeader <header>               sticky; top: 0
   ├─ WorkspaceLayout                   normal flow
   │  ├─ Navigation <nav>               document vertical scrolling
   │  └─ selected-outpost workspace     document vertical scrolling
   │     ├─ Outpost Details             document vertical scrolling
   │     └─ content grid
   │        ├─ Resource Matrix
   │        │  ├─ matrix viewport       local horizontal overflow only
   │        │  └─ Planned Supply        document vertical + local horizontal
   │        └─ Cargo Links <aside>
   │           ├─ persistent toolbar    document vertical scrolling
   │           └─ card list             local vertical scrolling
   └─ StatusBar <footer>                fixed; bottom: 0

document.body portals / overlays
├─ Search Results                       fixed; local body overflow
├─ Context Help                         fixed
├─ Validation panel                     absolute above fixed StatusBar;
│  └─ issue list                        local vertical scrolling
└─ modal backdrops                      fixed
   ├─ Keyboard Shortcuts dialog         local vertical scrolling
   ├─ About dialog                      no explicit local overflow
   └─ confirmation dialogs              no explicit local overflow
```

The document is the vertical owner for Navigation, Outpost Details, the
Resource Matrix, Planned Supply, and the overall workspace. There is no
independent Navigation or Outpost Details vertical scroller. This matches the
documented deferred workspace-scrolling decision.

The Matrix's `.outpost-status-matrix__scroll` sets `overflow-x: auto`. Chromium
computes `overflow-y: auto` as a consequence of the overflow shorthand rules,
but the element has no constrained height and its scroll height equals its
client height. It is therefore not an effective vertical scroll owner. Its
intended local horizontal scrolling and sticky Item column remain intact.

Cargo Links are the important nested vertical exception. The toolbar remains
outside `.cargo-pads__list`; the list uses `overflow-y: auto` and
`max-height: calc(100svh - 12rem)`. Validation issues use a 16rem-high local
scroller. Search autocomplete uses a 16rem-high local scroller; Search Results
uses a fixed palette with an internally scrolling body. Keyboard Shortcuts
uses a viewport-bounded dialog scroller. These local owners are deliberate and
should not be replaced with a new global scrolling model.

## Fixed and sticky chrome

| Region | DOM owner | Position and geometry | Flow and overflow |
| --- | --- | --- | --- |
| Title bar | `TitleBar` | `position: relative`; content-dependent height | Normal flow; scrolls away |
| Page header | `PageHeader` | `position: sticky; top: 0; z-index: 10`; content-dependent height | Occupies normal flow before sticking; no overflow |
| Status bar | `StatusBar` | `position: fixed; bottom: 0; height: 3.5rem; z-index: 1000` | Outside normal flow; no overflow |
| Root clearance | global `#root` | `padding-bottom: 3.5rem` | Reserves the fixed footer's height in document flow |
| Matrix header | `OutpostStatusMatrix` | `position: sticky; top: 0` inside the horizontal viewport | Does not currently own a constrained vertical viewport |
| Validation panel | `ValidationSummary` | absolute, `bottom: calc(100% + 0.5rem)` from the Status Bar control | Issue list scrolls locally |
| Search Results | `SearchForItems` portal | fixed, viewport-clamped position and height | Results body scrolls locally |
| Modal layers | dialog components | fixed full-viewport backdrops, `z-index: 2000` | Help scrolls internally; body scrolling is locked |

The status-bar height and root clearance are fixed constants expressed twice,
not a shared custom property. They currently agree. Architecture documentation
already identifies that equality as a shell dependency.

The page-header height is not fixed or represented by a CSS custom property.
It is content-dependent, measurable through `getBoundingClientRect()`, and can
change with the responsive grid, locale, wrapping, and effective font size.
This run measured 76.67 px in Polish at both desktop widths. The current
cross-locale capacity review records 77 px in compact locales and 145 px in
French, German, Japanese, and Spanish at 1366 px. Any later contract based on a
single desktop header constant would therefore be incorrect.

## Usable viewport geometry

The usable vertical interval while the header is stuck is:

```text
[pageHeader.bottom, statusBar.top]
```

| Test state | Header bounds | Status bounds | Usable interval / height | Document result |
| --- | --- | --- | --- | --- |
| 1600x900, top of document | 65.98-142.66 px | 837-900 px | 142.66-837 / 694.34 px | Title bar is still above the unstuck header |
| 1600x900, scrolled | 0-76.67 px | 837-900 px | 76.67-837 / 760.33 px | Title bar has scrolled away |
| 1366x768, scrolled | 0-76.67 px | 705-768 px | 76.67-705 / 628.33 px | Polish header remained compact |
| 683x384 supplementary reflow | 0-121.97 px | 313-369 px | 121.97-313 / 191.03 px | Horizontal scrollbar consumed the remaining 15 px; not true zoom |

At 1600x900 the document height was 1251 px with collapsed Planned Supply. At
maximum document scroll, the shared Navigation/Planned Supply content bottom
was approximately 836.56 px, just above the 837 px Status Bar top. At 1366x768,
the content bottom was 704.52 px against the 705 px Status Bar top. These
measurements demonstrate that the current matching root padding reserved the
footer height for ordinary document reachability in the sampled runs, with
less than one CSS pixel of rounding slack. They do not establish that browser-
or application-triggered focus scrolling will always place every focused
control fully above the Status Bar.

With Planned Supply expanded at 1366x768, its lowest measured control ended at
669.86 px, 35.14 px above the Status Bar. At the 683x384 supplementary viewport,
the stacked workspace ended at 313.36 px against the Status Bar's 313 px top.
The Cargo Links local scroller ended at the same position; after scrolling it
to its local maximum, its last disclosure control ended at 279.77 px and was
fully visible. This run therefore did not reproduce ordinary-scroll bottom
occlusion in the sampled layout states. That result is limited to manual
document/local scrolling and must not be generalized to focus-triggered
scrolling or to the broader usable-viewport contract.

The sub-pixel overlap at the containing workspace/list edge is brittle evidence
that the current bottom reservation has no safety inset for focus outlines,
but the sampled focusable controls retained practical clearance. The earlier
shared-accessibility reconciliation separately records a shortcut-focused
Matrix button at 397-422 px in a 384 px viewport, below the viewport and behind
the fixed 313-369 px status region. The user's direct manual runtime observation
also shows a focused Navigation outpost control sitting partially behind the
fixed Status Bar. Together these are concrete focus-triggered bottom-occlusion
cases in two document-scrolling workspace regions. Neither is relabelled as an
ordinary wheel/document-scrolling failure.

## Focus and navigation paths

No application code calls `scrollIntoView`, `scrollTo`, or `scrollBy`. The
important paths call `.focus()` and rely on the browser to select and scroll
ancestors:

| Path | Focus recipient and scrolling behavior | Visibility consequence |
| --- | --- | --- |
| Search shortcut | Search input, then optional text selection | Browser-native document focus scrolling; no chrome-aware adjustment |
| Workspace/Matrix shortcuts | Navigation selection/region, Outpost Details input, Matrix section, Planned Supply disclosure, first resource button, manufacturing action | Direct `.focus()`; no explicit alignment or post-focus visibility check |
| Previous/next/add outpost | Selected Navigation button after the collection/context render | Direct `.focus()`; document is the relevant vertical ancestor |
| Navigation collapse/reopen | Hide/show control after layout change | Direct `.focus()`; no explicit alignment |
| Cargo Links shortcut | Cargo section with `tabIndex=-1` | Direct `.focus()`; document and possibly Cargo local list are relevant ancestors |
| Cargo deletion repair | Last disclosure or region | Direct `.focus()` |
| Validation panel | Trigger or roving issue button | Focus remains in the fixed/anchored panel and its local issue scroller |
| Validation activation | Selects `issue.outpostId` only | Does not focus, reveal, expand, or scroll a workspace semantic target |
| Search Results open/close | Fixed palette region on open; Search input on close | Close uses `.focus()` without `preventScroll`, so document movement is native and not chrome-aware |
| Context Help Escape | Original trigger | Uses `focus({ preventScroll: true })`; it deliberately preserves the current scroll position even if the trigger has become obscured |
| Dialog open/close | Initial dialog action; previously focused element on close | Uses `preventScroll: true`; preserves background position, but restoration can return focus to an obscured element |
| Tab / Shift+Tab | Next native control | Browser-native focus scrolling; no declared scroll padding or target scroll margin |

Validation navigation currently satisfies the settled behavior of choosing the
issue's outpost while leaving the panel open, but it does not satisfy the
broader desired contract for navigation to a visible semantic target. In the
runtime, activating an Outpost 5 issue changed the selected Navigation item
from Outpost 1 to Outpost 5, left `scrollY` unchanged at 359 px, retained focus
on the Validation issue button, and left Outpost Details at -178.05 px beneath
and above the visible workspace. Exact control highlighting/expansion remains a
documented future enhancement, so a later chrome correction must not silently
invent issue-to-control semantics.

## Reproduction findings

### Top occlusion

At 1600x900, the first inorganic Matrix state button was focused, then the
document was scrolled to its maximum. The sticky header occupied 0-76.67 px;
the still-focused button occupied 61.94-89.83 px. Repeating the existing
`Ctrl+Alt+1` focus shortcut targeted the same already-focused element and did
not scroll. Approximately 14.73 px of the focused button remained under the
header. Its computed two-pixel outline existed, but the covered portion was
not visible.

This exposes an important distinction: a CSS inset can influence a scrolling
operation, but calling `.focus()` on an element that is already focused need
not create any scrolling operation at all. A later implementation needs a
post-focus visibility guarantee, not only a preferred alignment for first-time
focus.

The Matrix-region `Ctrl+Alt+G` shortcut also demonstrated the adjacent region
focus problem. It focused the correct `<section class="outpost-status-matrix">`
with `:focus-visible` matching, but the section began at approximately 0 px
behind the 76.67 px header. The region has no authored focus rule; Chromium
reported only its one-pixel automatic outline and no box shadow. Because the
section is large and its top edge was covered, the indicator did not provide a
clear local cue.

### Bottom occlusion

The ordinary-scroll samples at 1600x900, 1366x768, and the 683x384
supplementary viewport allowed the last document content to reach the Status
Bar boundary. Planned Supply controls and locally scrolled Cargo Link controls
could be exposed above it. This establishes that the matching `#root` padding
was sufficient for ordinary document reachability in those sampled states; it
does not establish a focus-visibility guarantee.

Direct manual evidence confirms that a focused Navigation outpost control can
sit partially behind the fixed Status Bar. Existing durable evidence separately
records a high-reflow shortcut-focused Matrix button below/behind the same
fixed chrome. Navigation and the Matrix both use document vertical scrolling,
so these examples show that successful ordinary scrolling to the document end
does not ensure that browser-native or application-triggered focus scrolling
will keep a target inside the usable viewport.

The bottom focus contract is therefore currently violated. There is no
document `scroll-padding-bottom`, no shared status-height variable, and no
focus-target `scroll-margin-bottom`; programmatic focus also has no post-focus
visibility check. The current audit can explain the observed Navigation and
Matrix outcomes—focus placement is delegated entirely to browser heuristics—but
cannot claim a fresh true-zoom reproduction from Codex's browser environment.

### Supplementary high-reflow result

At 683x384, the dynamic header grew to 121.97 px and the Status Bar occupied
313-369 px, leaving only 191.03 px of usable vertical space. The document
client width was 668 px and scroll width 787 px, retaining the previously
documented 119 px page-level horizontal overflow. This is relevant because
both chrome heights and the scrollable geometry differ materially from the
desktop case.

From the bottom of the long workspace, `Ctrl+Alt+1` moved focus to the correct
Matrix state and scrolled it to 172.33-197.13 px, inside the usable interval.
However, `:focus-visible` did not match and the computed authored outline was
`none`. This is a new reproduction of the Matrix visible-focus failure, not a
top or bottom occlusion in that particular sequence.

### Search, dialogs, and focus restoration

Source behavior establishes that Search Results restoration can trigger
ordinary browser scrolling because it calls `input.focus()`; it has no
chrome-aware correction. Context Help and modal dialogs intentionally restore
with `preventScroll: true`, which protects the background scroll position but
does not ensure the restored target is visible between fixed chrome. These
paths therefore share the viewport-contract gap even when their fixed overlays
are themselves correctly bounded.

Keyboard Shortcuts has an explicit viewport max height and internal overflow.
About and confirmation dialogs have fixed centered backdrops but no explicit
max height/overflow on their dialog panels. Existing cross-locale evidence
found Help, About, and destructive dialogs fitted at 1366x768. True-200%-zoom
dialog operability was not revalidated in this run.

## Resource Matrix visible-focus root cause

The visible-focus issue is adjacent to, but not caused solely by, fixed chrome.
Two independent failure modes were observed:

- `Ctrl+Alt+G` focuses the Matrix section wrapper. The correct element receives
  focus, but there is no authored Matrix-region focus style. The browser's
  thin automatic outline is distributed around a large section and can have
  its top edge covered by the sticky header.
- `Ctrl+Alt+1` focuses the correct editable button, whose stylesheet has a
  strong `:focus-visible` outline. In the 683x384 sequence, programmatic focus
  succeeded but Chromium's `:focus-visible` heuristic did not match, leaving
  `outline-style: none`. At 1600x900 another sequence did match
  `:focus-visible`; this explains the reported intermittent character.

The first is primarily a focus-recipient/styling problem (wrapper with no clear
local cue), and the second is a focus-modality/selector problem (correct button,
selector not matching). Overflow clipping was not the root cause of the
missing button outline: the button's Matrix viewport allows vertical overflow
at the sampled position, and computed style showed no outline rather than a
present clipped outline.

Fixed-chrome correction can make the recipient visible, but it cannot guarantee
a visible indicator when `:focus-visible` does not match or when focus lands on
an unstyled region. Matrix focus styling should therefore be implemented and
tested as a separate, small part of the later correction, without redesigning
Matrix geometry or its horizontal scrolling.

## Root-cause analysis

The main causes are:

- the application defines fixed chrome visually but does not define a shared
  scrollport inset contract for the document;
- the sticky header is content-dependent and not exposed as a reusable measured
  geometry value;
- the Status Bar height and root clearance are duplicated constants, and root
  padding supported ordinary document reachability in the sampled runs but
  does not guarantee focus alignment above the Status Bar;
- programmatic focus paths call `.focus()` only, with no common reveal helper or
  postcondition check;
- focus on an already-focused element does not necessarily scroll;
- `preventScroll` restoration paths can deliberately preserve an occluded
  position;
- Validation activation changes working context but has no semantic workspace
  focus/scroll target;
- the Matrix region lacks a clear authored focus cue, while editable-button
  focus depends on browser `:focus-visible` heuristics.

This is not evidence for replacing the document scrolling model. The current
architecture is coherent: one main document owner, one deliberate Cargo list
owner, and bounded overlay owners. The defects arise from the missing contract
between those owners and the fixed chrome.

## Candidate solution analysis

### Shared CSS insets

`scroll-padding-block-start` and `scroll-padding-block-end` on the actual
document scrolling element are the least brittle way to describe its usable
viewing rectangle. They can support native focus scrolling and explicit
`scrollIntoView` without attaching offsets to every target. Logical block
properties are preferable to physical top/bottom properties.

The start inset cannot be a desktop-only literal. A later implementation should
measure the current sticky Page Header, likely with `ResizeObserver`, and expose
the result as a shell-level CSS custom property. The same approach should
either centralize the fixed Status Bar height in a custom property or measure
it if future content is allowed to change its height. Root bottom clearance and
the block-end scroll inset should consume the same source.

Target-level `scroll-margin-block-start/end` may be useful for exceptional
semantic anchors, but applying it component by component across every focusable
control would be brittle and incomplete. A sentinel/spacer duplicates the
existing bottom-padding approach and does not solve top alignment or already-
focused targets.

### Programmatic focus adjustment

A shared CSS contract alone is insufficient. Repeated shortcuts can call
`.focus()` on an already-focused but occluded element, and `preventScroll`
restoration intentionally suppresses native scrolling. The application needs a
small shared focus/reveal operation that:

- focuses the intended element;
- inspects its bounds after layout/focus settles;
- compares them with the measured usable interval;
- scrolls the document by only the necessary amount when the target is outside
  that interval;
- handles the appropriate local scrolling ancestor first when the target is in
  Cargo, Validation, Search, or a dialog;
- avoids moving fixed overlay content in response to outer document chrome;
- preserves existing shortcut recipients and navigation semantics.

Using `scrollIntoView({ block: 'nearest' })` can be part of that helper, but it
is not sufficient by itself unless the active scroll owner has the correct
padding and a postcondition confirms fixed chrome did not cover the target.

### Nested containers

The document contract should cover Navigation, Outpost Details, Matrix,
Planned Supply, and the Cargo region itself. Cargo's list, Validation issues,
Search autocomplete/results, and Keyboard Shortcuts need local `nearest`
visibility within their own boxes, not document header/status insets copied
into each local scrollport. A reusable helper must walk or deliberately target
the relevant scrolling ancestor; applying document scroll padding to an inner
owner would have no effect.

No evidence supports adding new independent Navigation/Outpost Details
scrollers. No evidence supports removing sticky/fixed chrome, fixing the title
bar, stacking the normal desktop two-pane layout, or replacing native local
scrolling.

## Recommended implementation direction

**Category B: shared CSS contract plus a small programmatic focus adjustment.**

Recommended later work:

- establish measured shell custom properties for the dynamic Page Header and
  fixed Status Bar;
- use the Status Bar value for both root clearance and the document's block-end
  scroll inset;
- apply document block-start/block-end scroll padding to express the usable
  viewport;
- introduce one reusable focus/reveal helper for programmatic shortcuts,
  navigation focus repair, Search restoration, and other application-owned
  focus moves;
- preserve `preventScroll` where background-scroll stability is required, then
  run the same minimal visibility correction only if the restored target is
  actually outside the usable interval;
- leave Validation's exact sub-control navigation for its separately documented
  product decision, while ensuring any chosen target later uses the shared
  visibility helper;
- add a deliberate visible style for Matrix-region focus and make shortcut-
  initiated editable focus visibly deterministic rather than relying solely on
  intermittent `:focus-visible` matching.

One shared scroll-inset contract is necessary but **not sufficient**. The
already-focused shortcut case, `preventScroll` restoration, local nested
owners, Validation's context-only activation, and Matrix indicator behavior all
require small explicit handling. A larger scrolling-model correction is not
warranted by current evidence.

## Accessibility implications

A focused element hidden behind sticky/fixed chrome creates a mismatch between
DOM/assistive-technology focus and visual focus. Keyboard users can continue to
operate a control they cannot locate, and screen-reader output can describe a
target whose visual context is absent. This implicates WCAG focus visibility
and focus-not-obscured expectations and can become an orientation/operability
problem at high magnification.

The intermittent missing Matrix outline is independently material: even when
the target lies inside the usable interval, programmatic focus may not provide
a visible indicator. Correcting only scroll position would not close that
failure.

The Status Bar can remain semantically separate while visually covering
content; assistive technology will still expose underlying controls. The
current ordinary-scroll padding supports reaching the end of document content,
but the manually observed Navigation case and existing Matrix evidence confirm
that focus-triggered paths need an explicit usable-viewport contract.

## Regression constraints

A later implementation must preserve:

- the Title Bar scrolling away in normal document flow;
- the Page Header becoming and remaining sticky at the viewport top;
- the fixed Status Bar and its validation/transient-feedback behavior;
- dynamic header height under locale wrapping, zoom, and constrained widths;
- 1600 and 1366 desktop behavior, including the desktop two-pane Matrix/Cargo
  relationship;
- the existing constrained-width layout adaptation;
- Resource Matrix and Planned Supply local horizontal scrolling;
- the sticky Matrix Item column and current table semantics;
- Cargo Links' independently scrolling card list and persistent toolbar;
- Validation's anchored non-modal panel and internal issue scroller;
- Search Results positioning, movement, local scrolling, close behavior, and
  focus restoration;
- modal body-scroll lock, focus trap, Escape behavior, and restoration;
- existing shortcut bindings and semantic recipients;
- Navigation and Cargo presentation/session state boundaries;
- Undo/Redo and persistence boundaries: scroll, focus, measured chrome, and
  expansion state must remain presentation/session concerns.

Regression checks should include ordinary wheel/touch scrolling, sequential
Tab focus, every application-owned focus shortcut, repeated activation while a
target is already focused, Search close, Context Help Escape, modal close,
history focus repair, outpost navigation, Validation outpost selection, and
targets inside each local scroll owner.

## Limitations and stop-condition assessment

- True browser 150%/200% zoom was unavailable in the current in-app browser;
  the 683x384 result is supplementary only. No new true-zoom pass is claimed.
- No Apple/WebKit, VoiceOver, touchscreen, or touchpad environment was
  available.
- Narrator speech was not part of this audit.
- Existing local mature data provided six outposts, four populated Cargo Links,
  expanded Planned Supply coverage, manufacturing content, and 145 Validation
  issues. The audit did not mutate persisted data merely to reach capacity
  extremes.
- About and confirmation dialogs were not exhaustively rechecked under true
  zoom; their normal desktop fit is covered by current durable evidence.
- Existing Matrix evidence and the user's direct manual Navigation observation
  confirm focus-triggered bottom occlusion. Codex's sampled runs did not
  reproduce a general ordinary wheel/document-scrolling failure.

No stop condition prevents a bounded implementation recommendation. The
scrolling architecture matches documentation, dynamic chrome is measurable,
the number of scroll owners is manageable, fixed/sticky behavior can remain,
and the Matrix visible-focus correction does not contradict the occlusion
direction. Validation's exact future sub-control destination remains a product
decision and should not be invented by the viewport correction.

## Verification performed

- inspected the audit brief, `AGENTS.md`, architecture, UX, backlog, current
  accessibility/layout audits, application shell, focus paths, UI components,
  CSS, and related tests/helpers;
- searched production source for focus, scrolling, positioning, overflow,
  `tabIndex`, `autoFocus`, `:focus-visible`, scroll margin, and scroll padding;
- ran the local Vite server and exact 1600x900 and 1366x768 browser viewport
  checks;
- ran a clearly labelled 683x384 supplementary reflow check;
- measured chrome/content bounds, document/local scroll ranges, computed focus
  styling, and accessible focus recipients;
- exercised Matrix shortcuts, repeated focus while already focused, ordinary
  document scrolling, Planned Supply expansion, Cargo local scrolling, and
  Validation activation across outposts;
- incorporated the user's direct manual evidence that focused Navigation
  content can be partially obscured by the fixed Status Bar;
- did not run the unit suite or production build because this audit changed no
  runtime code;
- ran `git diff --check` after creating this report.
