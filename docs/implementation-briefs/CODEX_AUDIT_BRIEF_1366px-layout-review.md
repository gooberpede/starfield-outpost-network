# Codex Audit Brief — 1366×768 Layout Review

## Objective

Conduct a **read-only layout audit** of the Starfield Outpost Tracker at **1366×768**, maximized browser, **100% zoom**.

The goal is to identify the smallest safe changes needed so that primary working surfaces fit horizontally without internal horizontal scrolling.

Do not implement anything. Do not commit or push.

## User-observed baseline

Manual 1366×768 testing found these acceptable:
- Outpost navigation
- Cargo Links
- Planned Supply
- Outpost details
- Title/header area
- Japanese locale

Confirmed problem:
- **Resource Matrix acquires a horizontal scrollbar**

The user estimates the matrix needs about **75 px** less width demand, or that roughly **75 px** needs to be recovered elsewhere. Validate this estimate.

Also inspect:
- Outposts and Cargo Links `Lock order` buttons appear to use different colors.

## Acceptance criteria

At 1366×768 / 100% zoom / maximized browser:

> Primary application surfaces should fit horizontally without requiring horizontal scrolling.

Vertical scrolling is acceptable.

Wrapping is acceptable and is an intentional trade-off.

Do not solve width pressure by aggressively shrinking controls or prematurely ellipsizing names.

## Critical non-regression constraint

Outpost names and cargo-link names are functional identifiers.

Prefer reclaiming width from:
- matrix internals;
- padding/gaps;
- button chrome;
- handles;
- fixed/min widths;

before reducing usable name width.

Explicit rule:

> Do not reduce usable outpost-name or cargo-link-name width unless the Resource Matrix cannot be made to fit by adjusting the matrix and surrounding chrome first.

Ellipsis is a last resort only.

## Scope

Inspect:
- global page grid
- Outpost navigation
- central editor/content column
- Resource Matrix
- Cargo Links
- header controls
- Outpost details
- Planned Supply
- sticky footer
- Japanese locale
- relevant CSS/media queries
- min/max widths
- overflow rules
- search width
- table/grid/flex sizing
- cumulative padding/gaps

Do not modify anything.

## Core audit questions

### 1. Exact source of Resource Matrix overflow

Measure or derive:
- matrix container width;
- matrix scroll/intrinsic width;
- exact overflow amount;
- columns enforcing minimum widths;
- contribution from search control;
- contribution from headers, padding, borders, gaps, fixed widths;
- whether the problem is internal to the matrix or caused by surrounding layout allocation.

State whether the user's ~75 px estimate is accurate.

### 2. Can the matrix absorb the fix internally?

Assess safe recovery from:
- cell/header padding;
- column gaps;
- min-widths;
- fixed widths;
- search field width;
- icon/control spacing;
- unused column slack.

Do not hide columns.
Do not reduce font size unless clearly justified.
Do not accept horizontal scrolling as the solution.

### 3. If more width is needed, where can it come from?

Investigate in this order:

1. Resource Matrix internal spacing
2. Cargo Links chrome
3. Outpost navigation chrome
4. Side-panel widths
5. Text truncation only as a last resort

Estimate recoverable pixels for each.

### 4. Name-width resilience

Assess current usable width for:
- outpost names;
- cargo-link names.

Determine how much side-panel narrowing could occur before names become materially harder to identify.

Do not recommend ellipsis merely because CSS supports it.

### 5. Lock order visual inconsistency

Determine:
- whether both buttons represent the same state/action;
- whether the different colors are intentional semantics;
- which CSS/state causes the difference;
- whether this is a bug or expected behavior.

### 6. Other genuine 1366px defects

Look for:
- clipping;
- unreachable controls;
- accidental page-level horizontal scroll;
- overlap;
- unreadable wrapping;
- dialogs exceeding viewport;
- Japanese-specific failures.

Do not count acceptable wrapping as a defect.

## Repository inspection

Inspect relevant:
- CSS files
- layout components
- Resource Matrix component
- Cargo Links component
- Outpost navigation
- header controls
- responsive media queries
- `min-width`
- `max-width`
- `overflow-x`
- `grid-template-columns`
- `flex-basis`
- fixed pixel widths
- `text-overflow`
- `white-space`
- `ellipsis`

## Browser measurement

Target:
```text
1366 × 768
100% zoom
```

Prefer actual rendered measurements.

Record:
- viewport/page width;
- left panel width;
- center width;
- right panel width;
- matrix container width;
- matrix scroll width;
- exact overflow;
- major padding/gap contributions.

If exact browser measurement is unavailable, say so and avoid invented numbers.

## Deliverable

Create:

```text
docs/audits/LAYOUT-1366PX-REVIEW.md
```

Suggested sections:
1. Executive summary
2. Acceptance criteria
3. Current measurements
4. Resource Matrix overflow analysis
5. Width recovery opportunities
6. Side-panel name-width analysis
7. Lock order styling
8. Other 1366px findings
9. Recommended minimal correction sequence
10. Risks/non-regression constraints
11. Parcel size estimate
12. Reproduction notes

## Required conclusion

Explicitly answer:
- How many pixels does the Resource Matrix overflow by?
- Can the full correction come from inside the matrix?
- If not, how many pixels must come from surrounding layout?
- Is either side panel likely to need narrowing?
- If yes, approximately how much?
- Can that happen without harming name readability?
- Is ellipsis needed at all?
- Is the Lock order color difference intentional?
- Are there any other genuine 1366px usability defects?
- Is the implementation parcel small, medium, or large?

## Scope boundaries

Read-only audit. Do not modify:
- application code
- CSS
- tests
- fixtures
- localization
- breakpoints
- layout widths
- Resource Matrix
- dependencies
- package lock
- Cloudflare settings

Gameplay questions about duplicate outpost names, maximum character-name length, and Ocean/coastline behavior are out of scope.

## Validation

At minimum:
- `npm run build`
- `git diff --check`

Report any browser inspection or focused tests used.

## Completion response

Return:
1. concise conclusion;
2. current branch;
3. audit file created;
4. measured matrix overflow;
5. matrix-internal recovery estimate;
6. surrounding-layout recovery estimate;
7. whether side-panel narrowing is needed;
8. whether ellipsis is needed;
9. name-readability assessment;
10. Lock order finding;
11. other genuine 1366px defects;
12. parcel size estimate;
13. recommended correction order;
14. commands/browser measurements used;
15. confirmation no implementation/CSS/test files changed;
16. confirmation no dependency/lockfile change;
17. confirmation no commit or push occurred.

Do not commit or push unless explicitly instructed.
