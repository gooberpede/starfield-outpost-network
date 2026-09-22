# CODEX IMPLEMENTATION BRIEF — Fixed-Chrome Occlusion and Focus Visibility

## Objective

Implement the bounded correction recommended by:

`docs/audits/FIXED-CHROME-OCCLUSION-AND-FOCUS-VISIBILITY-REVIEW.md`

The correction must solve the confirmed fixed-chrome visibility failures without redesigning the workspace scrolling model.

The accepted implementation direction is:

> **Category B — shared CSS scroll-inset contract plus a small reusable programmatic focus/reveal adjustment.**

This implementation must address:

- top occlusion beneath the sticky Page Header;
- bottom occlusion behind the fixed Status Bar;
- focus moves that rely on browser-native scrolling;
- application-owned programmatic focus;
- repeated shortcuts targeting an already-focused element;
- focus restoration paths using `preventScroll`;
- the Resource Matrix visible-focus failures identified by the audit.

Do not replace the existing scrolling architecture.

---

# 1. Source of truth

Use the committed audit as the primary implementation basis:

```text
docs/audits/FIXED-CHROME-OCCLUSION-AND-FOCUS-VISIBILITY-REVIEW.md
```

Also inspect:

```text
AGENTS.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
src/App.tsx
src/index.css
src/ui/
tests/
```

Do not reopen decisions already settled by the audit unless implementation evidence materially contradicts them.

---

# 2. Hard behavior-preservation constraints

The implementation may change internal layout/focus mechanics, but must preserve the existing user-facing workspace behavior.

Preserve:

- the Title Bar scrolling away in normal document flow;
- the Page Header becoming/staying sticky at the top;
- the Status Bar remaining fixed at the bottom;
- the desktop two-pane Resource Matrix / Cargo Links layout;
- 1366×768 desktop behavior;
- 1600-class desktop behavior;
- true browser 200% zoom operability;
- Resource Matrix local horizontal scrolling;
- Planned Supply local horizontal behavior;
- sticky Matrix Item column behavior;
- Cargo Links' local vertical card-list scrolling and persistent toolbar;
- Validation's anchored panel and local issue scroller;
- Search Results positioning and local scrolling;
- modal focus traps, body-scroll lock, Escape behavior and focus restoration;
- existing shortcut bindings and semantic destinations;
- Navigation/Cargo presentation/session-state boundaries;
- Undo/Redo and persistence boundaries.

Do not:

- fix the Title Bar permanently;
- merge the Title Bar with the Page Header;
- remove sticky/fixed chrome;
- move the Status Bar into normal flow merely to avoid overlap;
- add new independent Navigation or Outpost Details scroll containers;
- stack the Matrix/Cargo layout at normal desktop widths;
- change persisted schema;
- persist focus, scroll position, or measured chrome values.

---

# 3. Intended viewport contract

Implement this product-level contract:

> Fixed application chrome may remain fixed, but scrollable/focusable application content must remain fully revealable within the usable viewport between the bottom edge of the Page Header and the top edge of the Status Bar.

The contract must apply to:

```text
ordinary browser/native focus scrolling
application-owned programmatic focus
repeated shortcut activation
focus restoration
outpost navigation focus repair
Search restoration
future validation/workspace targets that use the shared helper
```

The usable document interval is conceptually:

```text
[pageHeader.bottom, statusBar.top]
```

Do not hard-code one desktop-only header height.

---

# 4. Shared shell geometry

## 4.1 Page Header

The audit established that Page Header height is dynamic and can change with:

- viewport width;
- locale;
- wrapping;
- zoom/reflow;
- effective font metrics.

Implement a robust shell-level way to expose the **current rendered Page Header height**.

Preferred direction:

- measure the actual Page Header;
- update when its size changes;
- use `ResizeObserver` or an equally robust existing-platform mechanism;
- expose the value centrally, preferably through a CSS custom property and/or a small shell geometry abstraction.

Do not assume the compact ~77 px height.

The implementation must continue to work when the header expands to a taller wrapped state.

---

## 4.2 Status Bar

The current Status Bar height and `#root` bottom padding are duplicated constants.

Centralize the Status Bar clearance so:

- fixed Status Bar geometry;
- document bottom clearance; and
- document block-end scroll inset

derive from one source.

A CSS custom property is preferred where it fits existing architecture.

If the Status Bar is currently fixed at a known stable height, centralizing the constant is acceptable.

If implementation evidence shows the bar can vary in height, measure it instead.

Do not create another duplicated magic number.

---

# 5. Document scroll-inset contract

Apply a shared logical scroll inset to the actual document/root vertical scrolling element.

Use logical properties where practical:

```css
scroll-padding-block-start
scroll-padding-block-end
```

The block-start inset must reflect the current sticky Page Header height.

The block-end inset must reflect the current fixed Status Bar reservation.

The implementation should make browser-native scrolling/focus behavior aware of the usable viewport.

Do not apply the document chrome inset blindly to nested local scrollers.

---

# 6. Reusable focus/reveal helper

A CSS scroll-inset contract alone is insufficient.

Implement one reusable application-level helper for application-owned focus movement.

The helper should conceptually:

1. focus the intended target;
2. allow layout/focus to settle if necessary;
3. inspect the target's bounds;
4. determine the relevant visible interval;
5. reveal the target by the smallest necessary scroll amount;
6. preserve local-scroll behavior where the target belongs to a nested scroll container;
7. ensure the final target is not hidden beneath Page Header or Status Bar.

Do not make every component implement its own fixed-chrome offset logic.

Prefer one well-tested primitive.

---

# 7. Already-focused targets

The audit reproduced a top-occlusion case where the shortcut targeted an element that was already focused.

Calling `.focus()` again did not trigger scrolling.

The shared helper must therefore enforce a **post-focus visibility condition**, not merely depend on focus itself to cause browser scrolling.

Repeated activation of the same shortcut should:

- keep focus on the same semantic element;
- reveal it if it has become occluded;
- avoid unnecessary movement if it is already fully visible.

---

# 8. `preventScroll` restoration paths

Some focus-restoration flows deliberately use:

```ts
focus({ preventScroll: true })
```

This behavior exists to preserve background scroll stability and must not be removed casually.

For these paths:

1. preserve the existing `preventScroll` intent;
2. restore focus;
3. check whether the restored target is inside the usable visible region;
4. perform only the minimal visibility correction if it is actually occluded.

Do not cause gratuitous document jumps after closing dialogs/context help.

---

# 9. Nested/local scroll containers

The audit identified local vertical scroll owners such as:

- Cargo Links card list;
- Validation issues;
- Search autocomplete/results;
- Keyboard Shortcuts dialog.

Do not copy document Page Header / Status Bar insets into these local scrollports automatically.

The reusable focus/reveal logic should distinguish:

```text
document-owned target
nested-scroll target
fixed overlay target
modal/dialog target
```

For nested scrolling:

- reveal the target inside the relevant local container first;
- do not scroll the outer document unnecessarily;
- preserve local toolbar/header visibility;
- avoid affecting fixed overlays based on document chrome.

Use the simplest robust approach supported by the current DOM structure.

---

# 10. Programmatic focus paths to migrate

Inspect and migrate application-owned focus paths that currently rely on raw `.focus()` and browser heuristics where appropriate.

At minimum cover:

```text
Resource Matrix shortcuts
Outpost Details focus shortcut
Planned Supply focus shortcut
Cargo Links focus shortcut
previous/next outpost focus repair
add-outpost focus repair
Navigation collapse/reopen focus repair
Cargo deletion focus repair
Search Results close/restoration
Context Help Escape restoration
modal close restoration
other existing application-owned focus repairs discovered during implementation
```

Do not change the semantic focus destination.

Do not invent new validation sub-control navigation.

---

# 11. Validation boundary

Current validation issue activation changes the selected outpost but does not navigate to a specific workspace control.

That exact sub-control navigation remains a separate product decision.

Do not expand validation behavior in this parcel.

However:

- any existing focus movement associated with Validation must remain safe;
- future validation-target focus should be able to reuse the shared reveal helper;
- do not hard-code validation-specific chrome offsets.

---

# 12. Navigation bottom-occlusion regression

The audit records direct manual evidence that a focused Navigation outpost control can sit partially behind the fixed Status Bar.

The implementation must include a regression test/manual check for this case.

Expected result:

> A focused Navigation outpost control can always be fully revealed above the Status Bar.

This is a focus-triggered visibility contract.

Do not misclassify it as a generic failure of ordinary wheel scrolling.

---

# 13. Matrix top/bottom occlusion regression

Cover the known Matrix cases:

## Top

A focused Matrix state button may sit partially beneath the sticky Page Header.

Expected result:

> Repeated shortcut activation on an already-focused Matrix target reveals it fully below the Page Header.

## Bottom

Earlier durable evidence showed shortcut-focused Matrix content below/behind the fixed Status Bar at high reflow.

Expected result:

> Application-owned Matrix focus remains fully within the usable viewport between fixed chrome.

Do not alter Matrix geometry to achieve this.

---

# 14. Resource Matrix visible-focus styling

The audit found two independent focus-visibility failures.

## 14.1 Matrix region shortcut

`Ctrl+Alt+G` focuses the Matrix section wrapper, but the region lacks a clear authored focus style.

Add a deliberate visible focus indication appropriate to the existing visual language.

Requirements:

- clearly visible when the Matrix region is the focused shortcut target;
- not dependent solely on the browser's thin default outline;
- does not alter Matrix dimensions/layout;
- does not interfere with sticky columns or horizontal scrolling;
- works in forced-colors/high-contrast mode according to existing accessibility conventions.

---

## 14.2 Editable Matrix state shortcut

Programmatic focus on the correct Matrix state button can intermittently fail to match `:focus-visible`.

Make shortcut-initiated programmatic focus visibly deterministic.

Do not remove existing keyboard `:focus-visible` behavior.

Choose a narrow mechanism consistent with current architecture, for example:

- an explicit application-owned programmatic-focus-visible state/class;
- a shared focus helper that marks the target when focus was initiated by an application keyboard command;
- another equally scoped solution.

Avoid globally styling all `:focus` states in a way that causes unwanted mouse-focus rings across the app.

The result must preserve normal pointer/keyboard behavior while guaranteeing a visible cue after application-owned shortcut focus.

---

# 15. Ordinary scrolling

Do not regress current ordinary-scroll reachability.

The audit found that matching root bottom padding generally allows document content to reach the Status Bar boundary during manual scrolling.

After the correction:

- ordinary content must still be scrollable to the bottom;
- root bottom clearance must remain correct;
- no content should become permanently unreachable because of added scroll padding;
- no excessive dead whitespace should appear below ordinary content.

Remember:

```text
padding controls document reachability
scroll-padding controls alignment/preferred scrollport visibility
```

Do not confuse their roles.

---

# 16. Dynamic header regression

Test at least one locale/viewport where the Page Header wraps taller than the compact state.

The implementation must use actual current header geometry rather than an English/Polish desktop constant.

At minimum include one known tall-header case from current durable evidence such as:

```text
French at 1366
German at 1366
Japanese at 1366
Spanish at 1366
```

Exact locale may depend on current runtime reproduction.

---

# 17. Scroll behavior quality

The focus/reveal helper should scroll only as much as necessary.

Prefer nearest/minimal movement.

Avoid:

- always centering targets;
- jumping the document to the top of a section;
- large disorienting repositioning;
- oscillation between nested and document scroll owners;
- repeated micro-scroll loops;
- layout thrashing.

If using `scrollIntoView`, ensure the relevant scroller has the correct insets and verify the final postcondition.

A direct `window.scrollBy`/container adjustment may be used where necessary, but centralize the behavior.

---

# 18. Presentation-only boundary

All of the following remain presentation/session concerns:

```text
scroll position
focus
measured chrome height
temporary focus-visible state
local reveal state
```

Do not persist them.

Do not create Undo/Redo history entries for visibility/focus correction.

Do not change network data because scrolling/focus changed.

---

# 19. Accessibility

The correction must improve or preserve:

- visible focus;
- focused-target orientation;
- keyboard navigation;
- high-magnification usability;
- screen-reader/visual focus consistency.

Preserve:

- semantic elements;
- current accessible names/descriptions;
- current shortcut bindings;
- forced-colors behavior.

Do not introduce ARIA solely to solve a visual scroll problem unless semantics genuinely require it.

---

# 20. Tests

Add focused automated coverage where practical.

At minimum test:

## Geometry/inset contract

- current Page Header measurement updates the shared inset;
- Status Bar clearance/inset uses the shared source;
- no stale fixed header height is assumed.

## Focus helper

- fully visible target does not cause unnecessary scroll;
- target above usable interval scrolls minimally downward into view;
- target below usable interval scrolls minimally upward into view;
- already-focused occluded target is still revealed;
- `preventScroll` restoration can retain its initial behavior then perform minimal reveal;
- nested scroll targets prefer the local container where appropriate.

## Matrix visible focus

- Matrix-region shortcut target gets a deterministic visible focus treatment;
- shortcut-focused Matrix editable controls receive deterministic visible focus indication;
- ordinary pointer interaction does not gain unwanted global focus styling.

Use jsdom/component tests only for behavior they can actually establish.

Do not pretend jsdom proves real sticky/fixed geometry if it does not.

Browser/manual checks remain required.

---

# 21. Manual/browser regression matrix

Verify at minimum:

```text
1600×900
1366×768
true browser 200% zoom
```

If practical, also check 150%.

Use current supported Chromium/Edge environment.

## Ordinary document scrolling

Verify:

- Title Bar scrolls away;
- Page Header sticks;
- Status Bar stays fixed;
- content can reach the usable bottom region;
- no excessive bottom whitespace.

## Navigation

- focus first/middle/last outposts;
- focus an outpost near the bottom edge;
- confirm full visibility above Status Bar;
- previous/next navigation remains correct.

## Resource Matrix

- `Ctrl+Alt+G`;
- `Ctrl+Alt+1`;
- repeat shortcut when target is already focused;
- test target near Page Header;
- test target near Status Bar;
- visible focus always present.

## Planned Supply

- expanded, long content;
- focus lowest controls;
- no bottom occlusion.

## Cargo Links

- multiple expanded cards;
- focus controls near the bottom of the local list;
- local scrolling remains independent;
- toolbar remains stable;
- outer document does not jump unnecessarily.

## Search

- open/close;
- restore focus;
- verify target visibility.

## Context Help

- Escape restoration;
- preserve scroll position where possible;
- reveal trigger minimally if it became occluded.

## Dialogs

- Help/About/destructive dialog close restoration;
- modal scroll/focus behavior unchanged;
- background does not jump unnecessarily.

## Validation

- current outpost-selection behavior unchanged;
- panel/local issue scrolling unchanged;
- do not expect new sub-control navigation.

---

# 22. True 200% zoom

A real browser-controlled 200% test is required before closure.

Do not substitute only a 683×384 simulated viewport.

At true 200% verify:

- top chrome;
- bottom chrome;
- Navigation focus;
- Matrix focus;
- Planned Supply;
- Cargo local scroll;
- focus restoration;
- visible focus indicators.

If Codex cannot perform true zoom in its environment, clearly identify the remaining manual user checks.

---

# 23. Forced colors / high contrast

Because Matrix focus styling is changing, verify it does not regress forced-colors behavior.

At minimum inspect:

- selected Matrix state;
- focused Matrix region;
- focused Matrix editable state.

Do not rely on color alone.

Reuse the established forced-colors visual language where possible.

---

# 24. Documentation

After implementation, update current durable docs only where state has changed.

At minimum inspect:

```text
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/audits/FIXED-CHROME-OCCLUSION-AND-FOCUS-VISIBILITY-REVIEW.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
```

Guidance:

- the audit itself is a point-in-time record; do not rewrite its evidence unless correcting a factual error;
- `UX-DESIGN.md` should own settled viewport/focus behavior if appropriate;
- `ARCHITECTURE.md` should document any new shared shell geometry/focus primitive if it becomes architectural;
- `BACKLOG.md` should retire/reconcile the fixed-chrome and Matrix-visible-focus items if fully resolved;
- accessibility reconciliation may need a short disposition update or may remain historical depending on existing documentation conventions.

Do not propagate temporary task numbering into durable docs.

---

# 25. Scope exclusions

Do not include:

```text
Navigation independent-scrolling redesign
Outpost Details independent-scrolling redesign
workspace scrolling-model redesign
Resource Matrix header localization-capacity fixes
Polish Solar/Wind alignment fix
Search placeholder truncation fix
Very Poor control-width fix
Cargo Link Undo presentation-state fix
validation sub-control navigation
keyboard shortcut reassignment
Narrator-specific corrections
Apple/WebKit/VoiceOver work
locale loading/bundle optimization
HSTS changes
```

Those remain separate work.

---

# 26. Expected implementation shape

The exact architecture should follow current code, but likely pieces include:

- shell-level dynamic Page Header geometry measurement;
- centralized Status Bar clearance token/value;
- document `scroll-padding-block-start/end`;
- reusable focus/reveal utility or hook;
- migration of application-owned focus paths to that helper;
- Matrix region focus styling;
- deterministic programmatic-focus-visible handling;
- focused tests;
- durable architecture/UX/backlog reconciliation.

Avoid broad component rewrites.

---

# 27. Verification commands

Run all relevant automated checks.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Run any focused component/layout/focus tests you add.

If the repository has existing accessibility-specific test commands, run the relevant ones.

Record exact results.

---

# 28. Stop conditions

Stop and report before expanding scope if:

- dynamic Page Header measurement requires a broad shell redesign;
- Status Bar height cannot be centralized without unrelated visual changes;
- one shared focus/reveal helper cannot safely handle current programmatic focus paths;
- nested scroll containers require a new scrolling architecture;
- Matrix visible-focus correction requires changing shortcut semantics;
- true 200% behavior exposes a broader responsive-layout defect unrelated to fixed chrome;
- the correction would require adding independent Navigation/Outpost Details scrollers;
- a fix would alter persisted or Undo/Redo state.

Do not solve adjacent issues opportunistically.

---

# 29. Expected Codex summary

Report:

1. branch used;
2. files changed;
3. shared shell geometry mechanism implemented;
4. Page Header measurement approach;
5. Status Bar clearance centralization;
6. document scroll-padding contract;
7. reusable focus/reveal helper behavior;
8. focus paths migrated;
9. Navigation bottom-occlusion result;
10. Matrix top/bottom occlusion result;
11. Matrix region visible-focus correction;
12. Matrix editable programmatic-focus-visible correction;
13. nested-scroll behavior result;
14. ordinary-scroll regression result;
15. 1600 result;
16. 1366 result;
17. true 200% result or remaining manual check;
18. forced-colors/high-contrast result;
19. documentation/backlog reconciliation;
20. tests/checks run and results;
21. limitations or stop conditions;
22. suggested commit message;
23. confirmation no commit or push was performed.

Suggested commit message:

`fix: keep focused content clear of fixed chrome`
