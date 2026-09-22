# CODEX AUDIT BRIEF — Fixed-Chrome Occlusion and Focus-Visibility Review

## Objective

Perform a **read-only audit** of the application's vertical scrolling, fixed/sticky chrome, focus navigation, and content visibility behavior.

The purpose is to determine why application content can become hidden beneath:

- the fixed page header at the top of the viewport; and
- the fixed status bar at the bottom of the viewport;

while the hidden control or content may still be selected, focused, or otherwise active.

This issue is especially visible at high magnification, but it can occur at ordinary zoom whenever content becomes tall enough.

The audit must preserve the current user-facing workspace behavior as a hard constraint.

Do not change production code, CSS, layout, focus logic, scrolling behavior, shortcuts, or component structure during this audit.

The only tracked repository change permitted is the new durable audit report.

---

# 1. Behavior that must be preserved

The application has accumulated deliberate workspace behavior over time.

The audit must understand and preserve that behavior rather than simplifying it away.

Important examples:

- the application title bar may scroll away with the document;
- the page/workspace header remains fixed/sticky at the top after the title bar scrolls away;
- the status bar remains fixed at the bottom;
- the Resource Matrix retains its intended local horizontal scrolling behavior;
- existing local/internal vertical scrollers, where intentionally present, should remain semantically equivalent;
- the two-pane Resource Matrix / Cargo Links desktop layout should not be casually replaced or stacked;
- current collapse/expand and panel behavior should remain functionally equivalent;
- focus/navigation shortcuts and validation navigation should continue to move to the intended semantic target;
- no existing fixed/sticky chrome should be removed merely to solve occlusion.

Implementation details may change later if needed, but the visible/interaction behavior should remain equivalent unless a separate product decision explicitly changes it.

---

# 2. Core defect statement

The current application allows scrollable or focusable content to enter regions visually covered by fixed chrome.

Two broad manifestations must be audited.

## 2.1 Top occlusion

Focused or programmatically navigated content can end up underneath the fixed page header.

The user may have:

- keyboard focus on the control;
- programmatic focus on the control;
- validation navigation targeting the control;
- shortcut navigation targeting the control;

while the control itself is partly or fully hidden behind the header.

## 2.2 Bottom occlusion

Tall content can extend behind the fixed status bar.

This can occur even without programmatic focus.

Known examples include:

- expanded Planned Supply;
- long outpost lists;
- multiple expanded Cargo Links;
- other tall workspace content;
- high-magnification views where the usable viewport becomes much shorter.

The user can scroll to or focus content that exists logically below the visible usable workspace but is visually covered by the status bar.

---

# 3. Desired viewport contract

Use this as the intended product-level contract:

> Fixed application chrome may remain fixed, but scrollable application content must be able to enter and remain fully visible within the usable viewport between the bottom edge of the page header and the top edge of the status bar.

This applies to:

```text
ordinary scrolling
keyboard focus
programmatic focus
shortcut navigation
validation issue navigation
focus restoration
```

The audit should determine how best to express this contract in the current architecture.

Do not assume the final implementation mechanism.

---

# 4. Adjacent focus-visibility issue

The recent accessibility reconciliation also found that programmatic Resource Matrix focus can reach the intended target while the visible focus outline/indicator is absent or unclear.

Treat this as an **adjacent but distinct issue**.

The audit should investigate whether:

- occlusion and missing visible focus share a cause;
- they are independent;
- one layout correction can improve both;
- they require separate implementation briefs.

Do not merge the two findings conceptually unless the evidence shows a shared cause.

---

# 5. Durable sources to inspect

Inspect at minimum:

```text
AGENTS.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
docs/audits/codex-whole-product-accessibility-audit.md
src/index.css
src/App.tsx
src/ui/
```

Also inspect any other layout/scrolling/focus documentation and tests that materially affect the behavior.

Use current repository state as authority.

Do not rely on historical assumptions if the implementation has evolved.

---

# 6. Map the actual vertical layout architecture

Produce a concrete inventory of the current page/workspace structure.

At minimum identify:

```text
title bar
page/workspace header
navigation pane
outpost details/workspace
Resource Matrix pane
Cargo Links pane
status bar
modal/dialog layers
```

For each relevant container, record:

- DOM ownership;
- CSS positioning mode;
- `position: static/relative/sticky/fixed/absolute`;
- `top` / `bottom` offsets;
- height/min-height/max-height;
- overflow behavior;
- whether it participates in normal document flow;
- whether it creates a scrolling container;
- whether it contains another scroll container;
- whether its geometry changes by viewport width/zoom/reflow.

A compact diagram is encouraged, for example:

```text
document/body scroll
├─ title bar (scrolls with document)
├─ page header (sticky/fixed?)
├─ workspace
│  ├─ navigation (scroll owner?)
│  ├─ details/matrix (scroll owner?)
│  └─ cargo (scroll owner?)
└─ status bar (fixed?)
```

But derive the actual result from the current implementation.

---

# 7. Identify every vertical scroll owner

Determine which element actually owns vertical scrolling in each relevant interaction path.

At minimum test:

```text
main page/document
Navigation
Outpost Details
Resource Matrix area
Cargo Links
Planned Supply
Help dialog
About dialog
validation panel/list
```

For each, record:

- scrollable element;
- `scrollTop` behavior;
- whether browser/document scrolling or element-local scrolling occurs;
- whether fixed chrome overlaps that scroll container;
- whether the container has padding/margin reserved for chrome;
- whether browser focus auto-scroll operates on the correct ancestor.

Do not assume there is one global scroll container.

---

# 8. Inspect current focus/navigation mechanics

Search current source for:

```text
.focus(
focus()
scrollIntoView
scrollTo
scrollBy
requestAnimationFrame
setTimeout
tabIndex
autoFocus
focus-visible
:focus-visible
scroll-margin
scroll-padding
```

Also inspect application-specific navigation functions.

Map all important programmatic focus paths, including:

```text
Resource Matrix shortcuts
outpost previous/next navigation
validation issue navigation
Search open/result selection/focus restoration
dialog open/close focus restoration
Navigation reshuffle/focus behavior
Cargo Link controls
Planned Supply expansion/focus behavior
```

For each path, record:

- element receiving focus;
- whether scrolling is browser-native or manually triggered;
- which scrolling ancestor moves;
- whether the resulting target is visible inside the usable viewport.

---

# 9. Reproduction matrix

Reproduce the issue using real application content.

At minimum test the following.

## 9.1 Top chrome

### Resource Matrix shortcut focus

Use the existing shortcut path that focuses the Matrix and first editable state.

Record:

- target bounds;
- header bounds;
- viewport bounds;
- whether the target is visibly unobscured;
- whether focus outline is visible.

### Validation navigation

Use a validation issue that navigates to content near the top of a long/tall workspace.

Record whether the resulting target is hidden under the page header.

### Search/focus restoration

Where applicable, verify restored focus is not placed under fixed chrome.

### Navigation focus

Use keyboard/tab/programmatic outpost navigation where the target is near the upper edge of the viewport.

---

## 9.2 Bottom chrome

### Planned Supply

Create or use enough Planned Supply entries to make the section tall.

Scroll/focus to the lowest controls.

Record whether the bottom rows can become fully visible above the status bar.

### Navigation outpost list

Use enough outposts to exceed the usable vertical workspace.

Record whether the final outpost/control can be fully exposed above the status bar.

### Expanded Cargo Links

Use multiple expanded Cargo Links until content extends below the usable viewport.

Record whether the lowest visible controls can be scrolled fully above the fixed status bar.

### Resource Matrix / Manufacturing

Where matrix/manufacturing content is tall enough to reach the bottom region, inspect equivalent behavior.

---

# 10. Viewports and magnification

Test at minimum:

```text
1600×900
1366×768
true browser 200% zoom
```

If practical, also record one intermediate zoom such as:

```text
150%
```

Do not substitute a half-size CSS viewport for true browser zoom where the brief explicitly asks for real 200%.

A narrow CSS viewport may still be used as supplementary reflow evidence, but label it accurately.

For each tested state, record:

```text
viewport dimensions
header top/bottom
status-bar top/bottom
usable content top
usable content bottom
usable vertical height
```

This should establish the actual reserved visible region.

---

# 11. Ordinary scrolling vs focus-triggered scrolling

Distinguish clearly between:

## A. Ordinary user scrolling

The user manually scrolls/touches/wheels through long content.

Question:

> Can every reachable content item be brought fully into the visible usable viewport?

## B. Browser-native focus scrolling

The user tabs to a control and the browser scrolls it automatically.

Question:

> Does the browser consider the control “visible” even though fixed chrome covers it?

## C. Programmatic focus

The application calls `.focus()` or equivalent.

Question:

> Does focus move without sufficient scrolling?

## D. Explicit scrolling

The application calls `scrollIntoView()` or other scrolling API.

Question:

> Does the chosen alignment ignore fixed chrome?

Do not collapse these cases into one generic “scrolling” result.

---

# 12. CSS mechanisms to evaluate

Evaluate, but do not implement, whether the current architecture could use mechanisms such as:

```text
scroll-padding-top
scroll-padding-bottom
scroll-padding-block-start
scroll-padding-block-end
scroll-margin-top
scroll-margin-bottom
scroll-margin-block-start
scroll-margin-block-end
scrollIntoView({ block: ... })
CSS custom properties for chrome heights
container-specific reserved padding
sentinel/spacer approaches
```

Assess:

- browser support relevant to current target browsers;
- whether the scroll owner is the document or nested containers;
- whether one shared rule can cover all focus targets;
- whether component-specific margins would become brittle;
- whether dynamic header height at wrapped/localized/high-zoom states complicates static values.

Do not prescribe a mechanism before mapping the architecture.

---

# 13. Dynamic chrome geometry

The page header can change height depending on:

```text
viewport width
localized text
wrapping
zoom/reflow
```

The audit must determine whether the current header/status-bar heights are:

- fixed constants;
- CSS-calculated;
- content-dependent;
- measurable through DOM geometry;
- already represented by CSS custom properties;
- suitable for shared layout variables.

The later implementation should not hard-code a desktop-only offset if the actual chrome height changes.

Similarly inspect whether the status bar height can vary.

---

# 14. Preserve title-bar behavior

The user explicitly wants to preserve current title/page-header behavior:

> scrolling down the page may scroll the title bar away while leaving the page header fixed at the top.

Do not recommend:

- making the title bar permanently fixed;
- combining title bar and page header into one fixed block;
- removing sticky/fixed page-header behavior;
- moving the status bar into ordinary flow merely to avoid overlap.

A later implementation may reorganize internal layout mechanics, but this visible behavior must remain equivalent.

---

# 15. Nested-scroll interaction

Determine whether any occlusion arises because:

- an inner scroller moves while the page chrome belongs to an outer scroller;
- browser focus scrolling chooses the wrong ancestor;
- scroll-padding is applied to a non-scrolling ancestor;
- fixed chrome overlaps a local scroll container that has no reserved visible inset.

If multiple scroll owners exist, recommend whether the later fix should use:

```text
one global viewport contract
per-scroll-container reserved insets
a shared reusable CSS/layout primitive
target-specific scroll margins
a combination
```

Do not implement the recommendation in this audit.

---

# 16. Resource Matrix visible-focus investigation

For the known Matrix issue, inspect:

```text
computed outline
box-shadow
border
focus-visible selector matching
actual focused element
programmatic vs keyboard focus modality
browser :focus-visible heuristics
parent/child visual state
overflow clipping of focus ring
```

Test the existing Matrix focus shortcuts.

Determine whether:

```text
A. the correct element is focused but :focus-visible does not match;
B. the focus ring exists but is clipped/covered;
C. focus lands on a wrapper with no visible styling;
D. styling is overridden;
E. another cause applies.
```

Record whether this can be solved independently of fixed-chrome occlusion.

---

# 17. Accessibility implications

The audit should evaluate:

- WCAG focus visibility implications;
- whether hidden focused controls create keyboard-operability or orientation problems;
- whether focus moving behind fixed chrome creates screen-reader/visual mismatch;
- whether the status bar visually covers controls while assistive technology still exposes them.

Do not turn the audit into a new full accessibility programme.

Focus only on the current confirmed issue.

---

# 18. Candidate solution architecture

End the audit with one recommended implementation direction.

Preferred outcome categories:

```text
A. Shared CSS scroll-inset contract is sufficient.
B. Shared CSS contract + small programmatic focus adjustment required.
C. Multiple scroll containers require a reusable per-container solution.
D. Current layout architecture needs a larger scrolling-model correction.
E. More evidence required before implementation.
```

Explain why.

The recommendation should explicitly address:

```text
top header occlusion
bottom status-bar occlusion
ordinary scrolling
keyboard/native focus scrolling
programmatic focus
validation navigation
dynamic chrome height
nested scroll containers
```

Do not implement it.

---

# 19. Regression risks to identify

The audit should identify what a later implementation must not break.

At minimum consider:

```text
title bar scrolling away
page header remaining fixed/sticky
status bar remaining fixed
1366 desktop two-pane layout
1600 desktop behavior
true 200% zoom
Resource Matrix local horizontal scrolling
Cargo Links independent scrolling behavior
Navigation scrolling
dialogs/internal dialog scrolling
locale-dependent header wrapping
focus restoration
keyboard shortcuts
validation navigation
Undo/Redo presentation boundaries
```

---

# 20. Durable audit report

Create:

```text
docs/audits/FIXED-CHROME-OCCLUSION-AND-FOCUS-VISIBILITY-REVIEW.md
```

or an equally clear repository-consistent name.

The report should include:

```text
audit date
branch
scope
current layout/scroll architecture
scroll-owner inventory
fixed/sticky chrome inventory
usable viewport geometry
focus/navigation path inventory
reproduction matrix
ordinary scrolling findings
focus-triggered scrolling findings
high-magnification findings
Resource Matrix visible-focus findings
root-cause analysis
candidate solution analysis
recommended implementation direction
regression constraints
limitations
```

Do not use temporary numbered task/parcel identifiers in the durable report.

---

# 21. Backlog handling

This is read-only.

Do not update `docs/BACKLOG.md` during the audit.

The report may recommend later backlog reconciliation after the implementation direction is accepted.

---

# 22. Scope discipline

Do not change:

```text
CSS
React components
focus logic
scroll logic
shortcuts
validation navigation
status bar
page header
title bar
workspace geometry
tests
backlog
architecture docs
UX docs
```

unless a file must be read for evidence.

The only tracked change should be the new audit report.

---

# 23. Verification

Run:

```text
git diff --check
```

Confirm:

- only the new audit report is tracked as changed;
- no runtime/layout code changed;
- all browser/manual checks are accurately labeled;
- true 200% zoom is distinguished from simulated narrow viewport evidence;
- no temporary planning identifiers leaked into durable documentation.

No full test suite is required for a read-only audit unless Codex needs one to establish a specific behavior.

If a test is run, record it.

---

# 24. Stop conditions

Stop and report rather than recommending a narrow fix if:

- the current scrolling architecture differs materially from repository documentation;
- there are more scroll owners than can be safely handled by one coherent fix;
- solving occlusion would require removing existing fixed/sticky behavior;
- dynamic chrome heights cannot be represented robustly;
- programmatic focus logic is deeply coupled to unrelated state;
- the Matrix focus issue and occlusion require contradictory approaches;
- the issue is caused by browser behavior that cannot be corrected without changing user-facing interaction semantics.

The audit should still be completed; the stop condition only prevents overconfident implementation recommendations.

---

# 25. Expected Codex summary

Report:

1. branch used;
2. audit report path;
3. current page/document vertical scroll owner;
4. local/nested scroll owners;
5. page-header positioning behavior;
6. status-bar positioning behavior;
7. title-bar scrolling behavior;
8. usable viewport geometry;
9. reproduced top-occlusion cases;
10. reproduced bottom-occlusion cases;
11. normal-zoom result;
12. 1366 result;
13. true-200%-zoom result;
14. ordinary-scroll vs focus-scroll differences;
15. programmatic focus behavior;
16. validation navigation behavior;
17. Matrix visible-focus root cause;
18. recommended solution category;
19. whether one shared scroll-inset contract is sufficient;
20. regression constraints;
21. limitations/stop conditions;
22. commands/checks run;
23. suggested commit message;
24. confirmation no runtime/layout code changed;
25. confirmation no commit or push was performed.

Suggested commit message:

`docs: audit fixed-chrome occlusion`
