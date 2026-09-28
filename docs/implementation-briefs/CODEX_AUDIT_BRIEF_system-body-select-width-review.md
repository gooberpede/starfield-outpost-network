# CODEX AUDIT BRIEF — System / Body Select Width and Biome Space Review

## Objective

Perform a focused geometry/content-capacity audit of the **System** and **Body** dropdowns in the selected-outpost details strip.

The user suspects these controls may be wider than necessary for their actual contents. If either can be safely narrowed, the reclaimed horizontal space should benefit the **Biome** controls.

This audit must not assume that narrower is automatically better.

The goal is to determine:

```text
what width each control currently receives
what width its widest real content actually requires
how that varies by locale/font/zoom
whether either control can safely shrink
how much useful space would be returned to Biomes
whether the current widths are already appropriate
```

This is an **audit only**. Do not implement CSS or component changes.

---

## 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
src/ui/components/OutpostDetails.tsx
src/ui/components/OutpostDetails.css
src/localization/referenceNames.ts
src/localization/LocalizationContext.tsx
```

Inspect any locale/reference-name data needed to enumerate actual System and Body labels.

Do not modify the supplied audit brief.

---

## 2. Current geometry to verify

The current details grid is:

```css
.outpost-details__fields {
  display: grid;
  grid-template-columns:
    minmax(10rem, 13rem)
    minmax(10rem, 13rem)
    4.25rem
    4.25rem
    minmax(12rem, 1fr);
  gap: 0.75rem;
}
```

The first two tracks are:

```text
System
Body
```

The last flexible track is:

```text
Biomes
```

At narrower viewport widths, the existing responsive rule changes this to:

```css
grid-template-columns:
  minmax(9rem, 1fr)
  minmax(9rem, 1fr)
  4.25rem
  4.25rem;
```

with Biomes spanning the next row.

At the selected-outpost container breakpoint:

```css
@container selected-outpost (max-width: 39rem)
```

the fields become a two-column stacked grid.

Verify these relationships at runtime rather than assuming the declarations alone describe the final rendered widths.

---

## 3. Core audit questions

Answer:

1. What rendered widths do System and Body receive at representative desktop viewport sizes?
2. Which **actual selectable System names** are widest in each supported locale?
3. Which **actual selectable Body names** are widest in each supported locale?
4. Which placeholder values are wider than the widest real names, if any?
5. What rendered width does each label require under the actual UI font for that locale?
6. How much internal select allowance is needed for:
   - border;
   - native select indicator;
   - browser-controlled padding;
   - safe visual clearance?
7. Does either current track have substantial unused width?
8. Can System and Body use different track widths safely?
9. If narrowed, how many pixels/rem are actually returned to the Biome track?
10. Is that gain large enough to improve biome-button wrapping materially?
11. Does any proposed reduction create clipping/truncation at 200% zoom or in long-label locales?
12. Would a content-derived/flexible sizing strategy be better than fixed min/max tracks?

---

## 4. Supported locales

Audit all supported locales:

```text
en-US
en-GB
fr-FR
de-DE
it-IT
ja-JP
pl-PL
pt-BR
zh-Hans
es-ES
```

Use the same localized reference-name resolution path as the application.

Do not estimate based only on English names or character counts.

---

## 5. Actual selectable populations

For **System** options, use the same eligible population as `OutpostDetails.tsx`:

```text
systems that contain at least one outpost-allowed body
plus the current unresolved/stale system case where applicable
```

For **Body** options, use:

```text
outpost-allowed bodies within the currently selected system
plus the current unresolved/stale body case where applicable
```

For width-capacity analysis, determine the widest body label globally across all selectable eligible bodies, even though only bodies from one system appear at a time.

Do not include bodies that can never be selected unless the current component deliberately preserves them for stale-state recovery.

---

## 6. Placeholder and stale-ID states

Measure or account for:

```text
outpost.system.select
outpost.body.select
```

in every locale.

Also consider the component's fallback behavior for unresolved IDs:

```tsx
<option value={outpost.systemId}>
  {outpost.systemId}
</option>
```

and:

```tsx
<option value={outpost.bodyId}>
  {outpost.bodyId}
</option>
```

Determine whether stable IDs/FormID-like values could be wider than localized names and whether the select needs to remain usable in stale-reference recovery states.

Do not size only for ideal current reference data if the UI deliberately supports unresolved IDs.

---

## 7. Font-aware measurement

Do not use character count as the main sizing metric.

Measure rendered text using the actual UI font stack for each locale:

```text
Latin locales:
Barlow Semi Condensed / actual resolved fallback

Japanese:
Yu Gothic UI / Yu Gothic / Hiragino Sans / Meiryo / system fallback

Simplified Chinese:
Microsoft YaHei UI / Microsoft YaHei / PingFang SC / Noto Sans CJK SC / fallback
```

Use the same font size/weight as:

```css
.outpost-details__field select {
  font: 500 0.8rem/1 var(--ui-font);
}
```

If a requested font is unavailable in the audit environment, record the actual resolved font and treat measurements accordingly.

Prefer browser/runtime measurement over theoretical canvas metrics when practical.

---

## 8. Native select chrome allowance

A `<select>` is not just its text width.

Measure or conservatively account for:

```text
left content inset
right-side dropdown indicator
native browser padding
border
focus ring clearance where relevant
```

Do not propose a width equal to the raw text bounding width.

The result should leave enough room that the widest option can be read comfortably in the closed control.

---

## 9. Browser scope

Use the available local browser for exact measurement.

If Chromium is the only browser available, record that limitation.

Do not infer exact Safari native-select chrome geometry from Chromium.

Because this audit is about general layout rather than Safari certification, a Chromium-based geometry decision is acceptable if the recommendation preserves reasonable slack.

---

## 10. Representative viewport sizes

Measure at minimum:

```text
1366 × 768
1600 × 900
```

Also inspect behavior near the existing responsive transitions:

```text
around 1180 px viewport width
around the selected-outpost 39rem container breakpoint
```

The audit should identify the actual selected-outpost/container widths at which the details layout changes.

---

## 11. Zoom

Test at:

```text
100%
200%
```

For 200% zoom, use actual browser zoom if available.

If automation cannot induce browser zoom reliably, use the closest valid browser/manual method and state the limitation.

Do not assume a width safe at 100% is automatically safe at 200%.

---

## 12. Label-heading interaction

Also inspect the field headings:

```text
System
Body
```

in all locales.

The control track must remain wide enough for both:

```text
field label
select control content
```

although the select content will likely be the larger constraint.

Record if any localized field heading becomes the limiting width.

---

## 13. System and Body may differ

Do not preserve equal widths merely for symmetry.

Evaluate independently:

```text
System track
Body track
```

Possible outcomes include:

```text
System can shrink, Body should remain
Body can shrink, System should remain
both can shrink by different amounts
both should remain equal/current
one or both need more width
```

Prefer evidence over visual symmetry.

---

## 14. Biome benefit measurement

For any proposed width reduction, calculate the actual gain to the Biome region.

Report:

```text
current System width
proposed System width
delta

current Body width
proposed Body width
delta

total horizontal space returned to Biomes
```

Then test whether that gain changes biome-button wrapping on representative difficult cases.

Do not recommend narrowing if the reclaimed width is too small to produce a meaningful layout benefit.

---

## 15. Representative biome stress cases

Identify outposts/bodies with:

```text
many biome buttons
long localized biome labels
mixed long/short biome names
```

Use those to determine whether reclaimed width:

```text
reduces wrapping
prevents an extra biome row
improves spacing materially
```

Do not redesign biome-button geometry in this audit.

---

## 16. Content-derived sizing options

Compare at least these strategies.

### Option A — keep current tracks

```css
minmax(10rem, 13rem)
minmax(10rem, 13rem)
```

### Option B — smaller explicit min/max values

For example, independent System/Body ranges justified by measurements.

### Option C — fixed/content-informed widths

Use stable track values chosen from measured worst cases plus safe chrome allowance.

### Option D — intrinsic sizing

For example:

```text
fit-content(...)
max-content
```

or related grid strategies.

Assess whether native `<select>` intrinsic behavior makes this reliable across browsers.

### Option E — no change because current slack is intentional/useful

Include this if supported by evidence.

---

## 17. Avoid fragile over-optimization

The goal is not to make the dropdowns as narrow as mathematically possible.

Preserve:

```text
comfortable readability
native control chrome
locale/font variation
zoom robustness
stale-ID recovery
browser variance
future modest reference-name growth
```

Recommend a small safety margin.

Do not tune to one current longest name with zero slack.

---

## 18. Runtime measurement table

Produce a table of the worst cases.

At minimum include:

```text
locale
control type
display value
resolved font
measured text width
recommended minimum closed-control width
current rendered width
slack
```

Include the top several widest values, not just one.

Separate:

```text
System
Body
placeholder/fallback
```

---

## 19. Current layout measurements

At representative viewports record:

```text
selected-outpost width
details-grid width
System track width
Body track width
Solar width
Wind width
Biome track width
gaps
number of biome-button rows
```

Repeat for any recommended candidate width.

This should make the trade-off visible quantitatively.

---

## 20. 1180px responsive rule

Assess whether the existing:

```css
@media (max-width: 1180px)
```

rule interacts with any recommended width change.

Do not change the breakpoint in this audit.

Determine whether narrower desktop System/Body tracks could:

```text
delay unnecessary biome wrapping
make the 1180px transition less visually abrupt
or have no meaningful effect
```

---

## 21. 39rem stacked layout

At:

```css
@container selected-outpost (max-width: 39rem)
```

System and Body become:

```text
two equal 1fr columns
```

Determine whether the desktop sizing concern is irrelevant there.

Do not recommend forcing desktop fixed widths into the stacked/two-column narrow layout unless evidence warrants it.

---

## 22. Accessibility

Check that any proposed narrowing does not materially harm:

```text
visible selected value
keyboard focus outline
disabled-state readability
native select usability
200% zoom
```

Do not rely on hover/title as a substitute for readable selected text.

---

## 23. No truncation policy assumption

Determine current browser behavior if a selected option exceeds the closed select width.

Do not silently assume ellipsis, clipping, or dropdown expansion is acceptable.

The preferred recommendation should allow the widest supported normal value to remain readable in the closed control.

If unavoidable stale IDs are wider, classify that separately.

---

## 24. Recommendation standard

Prefer the solution that:

```text
frees meaningful Biome space
remains robust across all current locales
keeps normal selected values readable
preserves 200% zoom usability
avoids native-select/browser fragility
does not complicate the responsive layout unnecessarily
```

A no-change recommendation is valid.

---

## 25. Disposition

End with one:

```text
SGEO-A — current System/Body widths are appropriate; no change recommended

SGEO-B — one or both controls can safely shrink by a bounded amount

SGEO-C — one or both controls are currently undersized and should grow

SGEO-D — current fixed/minmax sizing model is unsuitable; broader layout adjustment recommended
```

Use the narrowest justified classification.

---

## 26. Proposed implementation shape

If recommending a change, specify:

```text
exact System track recommendation
exact Body track recommendation
units
safety margin
responsive-rule impact
container-query impact
expected Biome-space gain
```

Do not implement it.

Prefer a small CSS-only change if measurements support one.

---

## 27. Finite later verification plan

If a width change is recommended, define later checks for:

```text
1366×768
1600×900
100% zoom
200% zoom
all supported locales
widest System option
widest Body option
placeholders
stale-ID fallback
representative many-biome body
around 1180px
around 39rem selected-outpost breakpoint
keyboard focus
disabled Body select
```

No broad app regression matrix is needed for a CSS-only width adjustment.

---

## 28. Audit-only constraints

Do not:

```text
edit CSS
edit TSX
change reference names
change localization
change breakpoints
change biome buttons
change app version
commit
push
deploy
```

Only create the audit report.

---

## 29. Expected report

Create:

```text
docs/audits/SYSTEM-BODY-SELECT-WIDTH-REVIEW.md
```

or an equally clear repository-consistent filename.

Include:

1. baseline;
2. current layout geometry;
3. selectable population methodology;
4. locale/font methodology;
5. widest System labels;
6. widest Body labels;
7. placeholder/stale-ID analysis;
8. native-select chrome allowance;
9. viewport measurements;
10. 100%/200% zoom findings;
11. biome-space benefit analysis;
12. responsive-rule implications;
13. container-query implications;
14. accessibility/readability;
15. option comparison;
16. recommended geometry;
17. finite implementation verification plan;
18. SGEO-A/B/C/D disposition.

---

## 30. Verification

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report is created
the supplied audit brief remains untouched
no CSS/TSX/reference/localization files changed
no commit/push/deployment occurred
```

No full build/test suite is required for report-only work.

---

## Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. SGEO-A/B/C/D disposition;
4. current System track width range;
5. current Body track width range;
6. widest System label(s) by locale;
7. widest Body label(s) by locale;
8. resolved fonts used for measurement;
9. recommended minimum System control width;
10. recommended minimum Body control width;
11. proposed final track values, if any;
12. total Biome space reclaimed/lost;
13. whether biome wrapping materially improves;
14. 200% zoom result;
15. responsive/container-query impact;
16. stale-ID fallback finding;
17. exact later implementation scope;
18. confirmation no implementation occurred.

Suggested commit message:

```text
docs: audit system and body select widths
```
