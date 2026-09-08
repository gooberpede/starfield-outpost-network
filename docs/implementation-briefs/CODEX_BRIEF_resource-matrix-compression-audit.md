# Codex Research Brief — Resource Matrix Compression Audit

## Objective

Audit the Resource Matrix to determine its **true practical minimum width** before horizontal scrolling is required.

This is a research/measurement task first.

Do **not** immediately redesign the workspace or implement pane resizing.

The current suspicion is that the Matrix begins scrolling earlier than necessary because of conservative CSS minimums rather than because the content has reached its true usability limit.

The audit should identify:

- which columns are forcing the current width floor;
- how far each column can reasonably compress;
- where ellipsis and wrapping should begin;
- what the actual “comfortable”, “compressed-but-usable”, and “must-scroll” thresholds should be.

---

## 1. Read project guidance first

Inspect:

```text
AGENTS.md
README.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
```

Inspect especially:

```text
src/ui/components/OutpostStatusMatrix.css
src/ui/components/OutpostStatusMatrix.tsx
src/ui/layout/WorkspaceLayout.css
```

Also inspect the current reference-data catalogues for:

```text
resource display names
product display names
species display names
```

The goal is to base minimum-width decisions on the real data rather than arbitrary guesses.

---

# PART A — CURRENT WIDTH FLOOR

## 2. Confirm the explicit table minimum

Current CSS includes:

```css
.outpost-status-matrix__table {
  min-width: 49rem;
  width: 100%;
}
```

Confirm whether this is currently the immediate trigger for horizontal overflow.

Report:

```text
available matrix width at first scrollbar
current table min-width in px/rem
whether scrollbar onset coincides with that min-width
```

Do not assume; verify in the browser.

---

## 3. Confirm column minimums

Current grid is approximately:

```css
minmax(9rem, 1.35fr)   /* Item */
minmax(6rem, 0.9fr)    /* Source */
minmax(4.5rem, 0.55fr) /* Present */
minmax(5rem, 0.65fr)   /* Producing */
minmax(10rem, 1.35fr)  /* Inputs */
minmax(7rem, 1fr)      /* Logistics */
```

Measure and report:

```text
actual rendered width of each column near current overflow threshold
configured minimum of each column
effective content width after cell padding
```

Also report whether any child element’s intrinsic width prevents the track from shrinking further.

---

# PART B — COLUMN-BY-COLUMN AUDIT

## 4. Item column

Determine:

- longest resource/product names in the current catalogue;
- typical name lengths;
- current rendered width near overflow;
- width at which occasional ellipsis begins;
- width at which ellipsis becomes frequent enough to harm usability.

Important design constraint:

> Matrix column positions should remain stable across outposts at a given workspace width.

Do **not** propose runtime width changes based on the currently selected outpost’s content.

Report two suggested thresholds:

```text
comfortable Item width
minimum acceptable Item width
```

Use existing tooltip/title behavior as part of the usability assessment.

---

## 5. Source column

Audit species/source names.

Determine:

- longest species names in reference data;
- typical species-name length;
- current truncation behavior;
- minimum width at which the source name remains meaningfully recognizable;
- whether current `.outpost-status-matrix__item` ellipsis behavior is sufficient.

Report:

```text
comfortable Source width
minimum acceptable Source width
recommended ellipsis point
```

Do not require every species name to display fully at narrow widths.

---

## 6. Present column

This column now contains:

```text
Present label
ContextHelp ? button
3.2rem state widget
```

Determine the smallest width that:

- keeps header label and `?` legible/non-overlapping;
- keeps cell state control usable;
- preserves focus outlines.

Report whether current `4.5rem` floor is already close to optimal.

Do not shrink contextual-help controls just to gain width.

---

## 7. Producing column

Same audit as Present.

Determine the practical floor considering:

```text
Producing label
ContextHelp ? button
3.2rem state widget
```

Report whether current `5rem` minimum is necessary or conservative.

---

## 8. Inputs column

This is expected to be one of the most compressible columns.

Audit:

```css
minmax(10rem, 1.35fr)
padding: 0.1rem 0.5rem
gap: 0.25rem
state width: 3.2rem
flex-wrap: wrap
```

Determine:

- how far the track can shrink before content becomes genuinely unusable;
- whether wrapping works correctly at smaller widths;
- whether cell horizontal padding is consuming disproportionate space;
- whether `gap: 0.25rem` can be reduced at compressed widths;
- whether state controls can approach near-adjacency before scrollbar onset.

Important principle:

> At scarce widths, slightly crowded controls are preferable to forcing the user to horizontally scroll earlier than necessary.

Report:

```text
comfortable Inputs width
compressed-but-usable Inputs width
true minimum Inputs width
```

Do not alter state-control width unless there is strong evidence it is necessary.

---

## 9. Logistics column

Determine the minimum practical width for:

```text
two 3.2rem state controls on one row
plus a small gap
plus necessary cell padding
```

Also inspect rows with one control and rows with none.

Report:

```text
minimum width for two controls
recommended cell padding at compressed widths
whether current 7rem minimum is excessive
```

Avoid allocating large unused space at the right edge when the matrix is under width pressure.

---

# PART C — PADDING / GAP AUDIT

## 10. Cell padding

Current generic Matrix cell padding is:

```css
padding: 0.1rem 0.5rem;
```

Measure how much usable width is lost across six columns.

Determine whether a narrower-width mode should reduce horizontal padding, for example only when the matrix is approaching its compression floor.

Do not globally compact the Matrix if the current spacing is good at normal widths.

---

## 11. State-list gaps

Current state-list gap:

```css
gap: 0.25rem;
```

Determine whether a narrower-width rule could reduce this modestly before horizontal scrolling becomes necessary.

Possible compressed range to test:

```text
0.1rem
0.15rem
0.2rem
```

Do not eliminate gaps entirely unless required.

---

# PART D — TEMPORARY EXPERIMENTS

## 12. Lower the table min-width experimentally

Temporarily reduce or remove:

```css
min-width: 49rem;
```

and observe where the layout actually becomes unusable.

This may be done with temporary local CSS/devtools changes.

Do not commit experimental values as part of the audit.

Record:

```text
first visible degradation
first truncation
first wrapping
first header collision
first control overlap
first genuinely unusable point
```

Take screenshots at useful thresholds if practical.

---

## 13. Distinguish three thresholds

The audit must explicitly identify:

### Comfortable width

The Matrix still looks like the intended normal desktop layout.

### Compressed-but-usable width

The Matrix is denser than ideal, but:

- labels are still intelligible;
- controls remain usable;
- ellipsis/wrapping is acceptable;
- no overlapping occurs;
- avoiding horizontal scroll is preferable.

### Must-scroll width

Below this point, further compression causes unacceptable loss of usability.

The eventual implementation should likely trigger horizontal scrolling only at this third threshold.

---

# PART E — DATA-DRIVEN NAME WIDTHS

## 14. Catalogue analysis

Use actual runtime/reference data to identify long names.

Report at least:

```text
longest 10 resource names
longest 10 product names
longest 10 species names
```

You do not need to expose all IDs unless useful.

Use this to justify Item/Source width recommendations.

Do not hard-code widths from one screenshot alone.

---

# PART F — INTERACTION / ACCESSIBILITY CHECKS

## 15. Focus outlines

At compressed widths, verify:

- Present/Producing controls retain visible focus;
- ContextHelp buttons do not overlap labels or other controls;
- state widgets remain individually focusable;
- ellipsized text still exposes full names through existing title/tooltips.

---

## 16. Sticky Item column

The Item column is sticky during horizontal scroll.

Verify that any proposed narrower Item width does not break:

```text
sticky positioning
row readability
header alignment
```

---

# PART G — DO NOT IMPLEMENT WORKSPACE RESIZING YET

## 17. Explicitly out of scope

Do not implement:

```text
manual pane resizing
pane show/hide controls
navigation collapse
cargo pane collapse
outpost keyboard switching
workspace breakpoint redesign
cargo-summary ellipsis changes
```

Those depend on what this Matrix audit discovers.

---

# PART H — RECOMMENDATION FORMAT

## 18. Deliver a concrete width model

Return a table like:

| Column | Current min | Comfortable | Compressed min | Notes |
|---|---:|---:|---:|---|
| Item | 9rem | ... | ... | ellipsis begins at ... |
| Source | 6rem | ... | ... | species names... |
| Present | 4.5rem | ... | ... | help button constraint |
| Producing | 5rem | ... | ... | help button constraint |
| Inputs | 10rem | ... | ... | wrapping/gap behavior |
| Logistics | 7rem | ... | ... | 2-button requirement |

Also report:

```text
current table min-width
recommended new table min-width
comfortable total matrix width
compressed-but-usable total matrix width
must-scroll threshold
```

If you believe the table should no longer have a hard-coded `min-width`, explain the alternative clearly.

---

## 19. Recommend implementation strategy

After the measurements, recommend a future implementation approach.

Possible strategies may include:

```text
revised minmax values only
revised minmax + compressed padding/gap breakpoint
CSS clamp()/min() usage
container-query-based compression
another simple CSS-only approach
```

Prefer the simplest solution that preserves stable Matrix geometry.

Do not implement it in this audit unless explicitly asked afterward.

---

# PART I — VERIFICATION

## 20. Repository cleanliness

Because this is an audit/research task:

- temporary CSS/browser experiments must be reverted;
- no source changes should remain unless they are documentation-only notes explicitly requested;
- no commit or push.

Run:

```text
git diff --check
git status
```

Build/tests are optional unless source files are temporarily modified and need verification.

---

# PART J — COMPLETION REPORT

## 21. Report

Provide:

```text
root cause of current scrollbar threshold
current rendered column widths
content/intrinsic-width constraints found
catalogue name-length findings
comfortable/minimum widths per column
padding/gap findings
true practical Matrix minimum
recommended future CSS strategy
screenshots/measurements taken
remaining uncertainties
git status
```

Explicitly state:

- whether `49rem` is currently the decisive floor;
- whether any child control prevents further shrinkage;
- which columns have the most recoverable width;
- whether the Matrix can materially postpone horizontal scrolling without harming usability.

---

## 22. Final instruction

This audit should answer:

> **How narrow can the Resource Matrix safely become before horizontal scrolling is genuinely preferable?**

Do not assume the existing `49rem` threshold is correct.

Measure first, then recommend.
