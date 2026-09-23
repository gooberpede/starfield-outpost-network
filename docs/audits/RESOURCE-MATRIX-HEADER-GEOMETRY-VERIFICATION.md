# Resource Matrix header geometry verification

23 September 2026. Branch: `staging`. No commit, push, or branch creation.

## Current status: accepted within the tested Windows/Chromium scope

The user subsequently authorized Inputs to overhang unused presentation space
on both the Producing and Logistics sides, keeping its logical centre/anchor
in Inputs and preserving both neighboring anchors. This supersedes the earlier
one-sided borrowing restriction and resolves the blocker documented below.
The implementation passes browser layout checks at both desktop sizes and the
user has completed manual acceptance within the tested Windows/Chromium scope.
The header-capacity/layout backlog item is closed. The rejected first
implementation and earlier blocked investigation remain historical evidence,
not sign-off for those proposals.

Only the nested Inputs label expands: 1.25 rem toward Producing and .25 rem
toward Logistics. Its semantic cell retains the original track. The asymmetry
reserves a .5 rem grouping gap on the Logistics side; the label's midpoint is
9 px left of the track midpoint, still within Inputs at both tested widths.
This is deliberate use of unequal available space, not equal overhang that
would collide with Logistics. Producing starts at its body-track start;
Logistics starts 9 px inside its unchanged body track (ordinary header padding,
not the former 25.2 px displacement). Both remain visibly associated with
their body columns.

`MatrixHelpHeading` retains exact full catalogue text and groups the final
whole word with `ContextHelp`. Each visible icon now follows that word with
an 8.1 px gap. The existing .3 rem pointer expansion on each side is preserved.
Every line is 1.5 rem high to accommodate the complete help target, including
when a neighboring Inputs label overhangs on the preceding line. One-line
headers remain 31.6 px high; two-line headers are consistently 58.6 px.

`overflow-wrap: normal` and `word-break: normal` replace arbitrary breaking.
Inputs uses balanced natural wrapping: Spanish is `MATERIALES` / `DE ENTRADA`
at 1366, not `MATERIALES DE` / `ENTRADA`. German stays `EINSATZSTOFFE` on one
line. No catalogue, domain, saved state, history, body-control, technical-token,
outer Matrix/Cargo heading, or Cargo panel geometry changes were introduced.

### Final browser evidence

Fresh current-source runtime on the same isolated origin and populated Jemison
fixture. All ten locales were measured and visually inspected at both sizes.
Measurements were collected before screenshot capture, with the ordinary
15 px document scrollbar present. An early cropped-screenshot attempt changed
scrollbar presentation; those cropped images were excluded from acceptance and
replaced with ordinary viewport captures after restoring normal layout.

- Matrix widths remain 692.5 px at 1366 and 865.0 px at 1600.
- All six tracks match the original values in the historical table below.
- The 15 populated inorganic/organic/manufacturing rows match the original
  tracks, horizontal cell positions, cell widths, control sizes, and row heights
  exactly. Present/Producing/Inputs controls remain 57.6 × 27.9 px.
- Cargo horizontal position/width is unchanged in every locale; no document
  horizontal overflow at either target viewport.
- All labels fit in at most two lines. No word is broken mid-token.
- Full expanded help targets intersect neither heading text nor one another.
  Keyboard focus, Enter opening, Escape dismissal, and focus return work;
  the original 2 px outline with 2 px offset remains visible.
- No locale-specific positioning or styles were introduced. The Inputs label
  boxes are 112.0 / 212.2 px wide, independent of the unchanged body controls.

| Locale | Producing lines 1366 / 1600 | Inputs lines 1366 / 1600 | Inputs-to-Logistics gap 1366 / 1600 |
| --- | --- | --- | --- |
| en-US | 1 / 1 | 1 / 1 | 37.1 / 87.2 |
| en-GB | 1 / 1 | 1 / 1 | 37.1 / 87.2 |
| fr-FR | 2 / 2 | 1 / 1 | 28.3 / 78.4 |
| de-DE | 2 / 2 | 1 / 1 | 9.9 / 60.0 |
| it-IT | 2 / 2 | 2 / 1 | 26.9 / 43.7 |
| ja-JP | 1 / 1 | 1 / 1 | 30.6 / 80.7 |
| pl-PL | 1 / 1 | 2 / 1 | 24.3 / 36.5 |
| pt-BR | 1 / 1 | 1 / 1 | 32.1 / 82.2 |
| zh-Hans | 1 / 1 | 1 / 1 | 30.6 / 80.7 |
| es-ES | 2 / 2 | 2 / 1 | 20.5 / 29.1 |

The help-icon gaps for Present, Producing, and Logistics are all 8.1 px in every
locale at both widths. Other headings remain one line. There is no Polish or
Portuguese Producing regression at 1600. Screenshot inspection confirms the
Spanish headings read as separate columns and German remains a whole word;
box non-overlap alone was not used as acceptance evidence.

Final edges below are relative to the Matrix left edge. Compare with the
historical rejected-runtime and one-sided-probe measurements below.

| Locale / viewport | Inputs text right edge | Logistics text left edge | Visible gap | Logistics track start |
| --- | --- | --- | --- | --- |
| English / 1366 | 533.9 | 571.0 | 37.1 | 562.0 |
| German / 1366 | 561.1 | 571.0 | 9.9 | 562.0 |
| Spanish / 1366 | 550.5 | 571.0 | 20.5 | 562.0 |
| English / 1600 | 649.6 | 736.8 | 87.2 | 727.8 |
| German / 1600 | 676.8 | 736.8 | 60.0 | 727.8 |
| Spanish / 1600 | 707.7 | 736.8 | 29.1 | 727.8 |

### Completed manual acceptance (user-reported)

The user reported the following results for the final two-sided correction:

- Ordinary visual layout: **PASS** across all tested locales.
- True browser 200% zoom: **PASS**, with no clipped or truncated heading text
  and no mid-word wrapping.
- Windows High Contrast: **PASS**, with no visibility degradation.
- Horizontal scrolling: **PASS** relative to established behavior. There is
  no horizontal scrollbar at 1366px/100%. Horizontal scrolling still appears
  at 200% zoom, as it did before this change; this is not a regression.
- German Inputs remains tight but readable and distinct from Logistics.
- Spanish Inputs remains two lines and visually separated from Logistics.
- Logistics heading/value alignment and help-label association are accepted.

These results complete header-geometry acceptance within the tested
Windows/Chromium scope. They do not claim additional Narrator or
non-Windows/font-fallback coverage. The earlier automated body fixture did not
contain a routed Logistics button; that historical fixture limitation is
unchanged. Compact-copy/editorial candidates remain deferred and unapproved;
outer Matrix/Cargo Links heading alignment and `R-COOH` / `SiH3Cl`
technical-token geometry remain separate open issues.

## Historical status: first proposal rejected, one-sided correction blocked

The initial uncommitted implementation preserved body geometry but **is not
visually accepted**. User review identified displaced Logistics, detached help
icons, German mid-word breaking, and Spanish Inputs/Logistics visually merging.
The historical measurements below did not establish acceptable grouping and
must not be read as sign-off. The German break did not reproduce at the exact
1366/1600 font metrics measured here, but `overflow-wrap: anywhere` permits it
when text capacity is tighter; that rule is unsuitable for these headings.

Correction investigation stopped under the brief's German whole-word/1366
footprint condition. No correction was applied to runtime CSS, JSX, catalogues,
or tests. The existing uncommitted implementation is preserved for the next
design decision. Only this report, UX, architecture, and backlog are updated.
Do not commit the runtime proposal as an accepted correction yet.

## Historical one-sided correction investigation

A separate ignored `.local-work/header-correction-probe.html` loaded the current
CSS and full labels directly from `translate`. It reproduced the measured
692.5/865 px Matrix widths and six body tracks, with example controls below each
heading. It is a feasibility fixture, not an end-to-end application correction.
All ten locales were measured at 1366×768 and 1600×900.

The probe removed the Logistics margin, put its text at the ordinary compact
body-content inset (5.4 px from its track start), and reserved a shared .5 rem
(9 px) gap before it. It used natural word boundaries. Each help icon followed
the final heading word in an inline group, retaining the .9 rem visible button
and full .3 rem pointer expansion on both sides. This restored an 8.1 px visible
label/icon gap across all three help headings in all ten locales, rather than
placing help in a `minmax(0, 1fr) max-content` far-edge grid cell.

At 1366, the Inputs track is 85 px. Even after removing its left padding, a
Logistics label anchored at track start + 5.4 px and a 9 px separation leave
only **81.4 px** for Inputs. German `EINSATZSTOFFE` measures **101.2 px**:
it exceeds that safe budget by **19.8 px** and overlaps the anchored Logistics
text by **10.8 px**. Screenshot inspection confirmed the words physically merge.
At 1600 it fits because the Inputs track grows to 185.2 px.

Spanish naturally wraps as `MATERIALES` / `DE ENTRADA` in the probe, with a
10.4 px gap at 1366; it uses one line and a 27.7 px gap at 1600. This addresses
Spanish independently but does not solve the German collision. The failed
prototype was not promoted into the application.

The correction's prescribed borrowing model cannot provide enough unused
left-side Logistics space for German while keeping both Inputs' start anchor
and Logistics' body-content anchor. Even a zero separation would leave only
90.4 px, still less than 101.2 px. Expanding Inputs' box does not create free
space where Logistics already begins. Solving this requires a revised header
arrangement/anchor allowance or a separately reviewed shorter label; widening
body tracks, shrinking type, moving other headings, vertically staggering
columns, and changing copy were not silently substituted.

### Requested extra measurements

All horizontal edges below are relative to the Matrix left edge, in CSS px.
"Current" is the rejected runtime proposal; "probe" is the unshipped anchored
correction experiment. The original before/after measurements remain below.

| Locale / viewport | Inputs right edge current → probe | Logistics text left current → probe | Visible gap current → probe | Logistics track start |
| --- | --- | --- | --- | --- |
| English / 1366 | 525.5 → 523.7 | 587.2 → 567.4 | 61.7 → 43.7 | 562.0 |
| German / 1366 | 580.0 → 578.2 | 587.2 → 567.4 | 7.2 → **−10.8** | 562.0 |
| Spanish / 1366 | 578.4 → 557.0 | 587.2 → 567.4 | 8.8 → 10.4 | 562.0 |
| English / 1600 | 591.2 → 589.4 | 753.0 → 733.2 | 161.8 → 143.8 | 727.8 |
| German / 1600 | 645.6 → 643.8 | 753.0 → 733.2 | 107.9 → 89.4 | 727.8 |
| Spanish / 1600 | 707.3 → 705.5 | 753.0 → 733.2 | 46.3 → 27.7 | 727.8 |

| Locale / viewport | Present icon gap current → probe | Producing icon gap current → probe | Logistics icon gap current → probe |
| --- | --- | --- | --- |
| English / 1366 | 28.0 → 8.1 | 31.6 → 8.1 | 17.7 → 8.1 |
| German / 1366 | 8.9 → 8.1 | 23.0 → 8.1 | 25.6 → 8.1 |
| Spanish / 1366 | 14.8 → 8.1 | 23.1 → 8.1 | 17.3 → 8.1 |
| English / 1600 | 28.0 → 8.1 | 31.6 → 8.1 | 24.4 → 8.1 |
| German / 1600 | 8.9 → 8.1 | 23.0 → 8.1 | 32.3 → 8.1 |
| Spanish / 1600 | 14.8 → 8.1 | 23.1 → 8.1 | 24.0 → 8.1 |

German segmentation in the measured runtime and probe is the single unbroken
`EINSATZSTOFFE` line at both sizes. In the probe it overflows at 1366 instead of
breaking, so this is explicitly a failure, not a whole-word fit pass.

| Probe locale | Inputs lines 1366 / 1600 | Inputs/Logistics gap 1366 / 1600 |
| --- | --- | --- |
| en-US | 1 / 1 | 43.7 / 143.8 |
| en-GB | 1 / 1 | 43.7 / 143.8 |
| fr-FR | 1 / 1 | 26.0 / 126.2 |
| de-DE | 1 / 1, overflowing at 1366 | −10.8 / 89.4 |
| it-IT | 2 / 1 | 23.1 / 56.8 |
| ja-JP | 1 / 1 | 30.6 / 130.8 |
| pl-PL | 2 / 1 | 18.0 / 42.4 |
| pt-BR | 1 / 1 | 33.7 / 133.8 |
| zh-Hans | 1 / 1 | 30.6 / 130.8 |
| es-ES | 2 / 1 | 10.4 / 27.7 |

### Earlier decision request (resolved by two-sided authorization above)

Permit a broader header-only arrangement with explicitly reviewed column
anchors, or commission a compact-copy decision. The prior editorial audit's
German `Bedarf` candidate (49.7 px) would relieve the width pressure, but its
meaning is not approved and it needs stronger semantic/editorial evidence.
Spanish `Insumos` (56.7 px) would also relieve pressure but is not necessary for
the probe's Spanish two-line fit and would not solve German. Neither is applied.
The six Producing noun candidates remain separate, unapproved editorial work.

At that point ordinary-layout acceptance was blocked; final true-200%, High
Contrast, and Narrator acceptance were deferred pending a correction. Matrix width,
body controls, technical tokens, and outer Matrix/Cargo title strips were not
modified in that investigation. The backlog was kept open for ordinary layout,
not merely for accessibility follow-up. The two-sided authorization and final
implementation above supersede this earlier blocked status.

## Initial proposal: change and scope (not accepted)

Producing previously had a fixed 126 px body track but lost 7.2 px of heading
capacity when responsive padding increased at the wider viewport. Header-only
spacing now stays constant. Help labels have explicit wrappers and first-line
alignment; the layout reserves the full existing .3 rem pointer expansion on
each side of the .9 rem button, also containing its focus outline.

Inputs borrows 1.4 rem (25.2 px at the tested desktop font size) from Logistics
heading presentation. A single CSS variable controls both sides. Logistics
label/help share a cell, but visual grouping failed user review. The original
shared six-track grid remains authoritative.
Only heading markup and header-specific CSS change at runtime. No catalogue,
body control, technical-token, Cargo panel, outer section-heading, persistence,
domain, or history behavior changes.

The preceding `RESOURCE-MATRIX-HEADING-EDITORIAL-REVIEW.md` remains unchanged as
point-in-time evidence. UX and architecture document the header/body boundary.
The capacity backlog entry remains open for the corrections above; the outer
section-heading discrepancy is now explicitly tracked. No editorial candidate
or technical-token issue is closed.

## Initial proposal browser measurements (historical)

Current-source Vite, isolated `127.0.0.1:5192` origin, Codex in-app Chromium on
Windows. Normal navigation and Cargo columns. CSS pixels, rounded to 0.1.
All ten runtime locales were selected through the real locale control at both
explicit viewports. DOM Range rectangles measured actual text lines. Body
comparison used a disposable Jemison outpost with 5 inorganic, 9 organic, and
1 Adaptive Frame manufacturing row. Exact original stylesheet bytes were
temporarily restored for comparison, then the implementation was restored.

| Measurement | 1366×768 before → after | 1600×900 before → after |
| --- | --- | --- |
| Matrix total width | 692.5 → 692.5 | 865.0 → 865.0 |
| Item body track | 135.0 → 135.0 | 185.2 → 185.2 |
| Source body track | 108.0 → 108.0 | 123.5 → 123.5 |
| Present body track | 108.0 → 108.0 | 108.0 → 108.0 |
| Producing body track | 126.0 → 126.0 | 126.0 → 126.0 |
| Inputs body track | 85.0 → 85.0 | 185.2 → 185.2 |
| Logistics body track | 130.5 → 130.5 | 137.2 → 137.2 |
| Inputs label capacity | 74.2 → 106.6 | 167.2 → 206.8 |
| Logistics label capacity | 98.5 → 75.7 | 98.0 → 82.3 |
| Producing label capacity | 94.0 → 96.3 | 86.8 → 96.3 |
| One-line header height | 31.6 → 31.6 | 31.6 → 31.6 |
| Two-line header height | 56.8 → 45.1 | 56.8 → 45.1 |
| Spanish header height | 82.9 → 45.1 | 56.8 → 45.1 |

Before label capacity is cell width minus padding and visible help/gap where
present; after is the explicit label wrapper width. The presentation widths
intentionally differ from the body tracks. No document horizontal overflow at
either size, before or after. Matrix width and Cargo horizontal position/width
match in every locale. All 15 populated rows have identical computed tracks,
cell horizontal positions/widths, control widths/heights, and row heights before
and after. Present/Producing/Inputs controls remain 57.6 × 27.9 px. Logistics
uses the same unchanged state-control class; a routed Logistics button was not
populated in this browser sample.

| Locale | Producing lines, 1366 / 1600 | Inputs lines, 1366 / 1600 |
| --- | --- | --- |
| en-US | 1 / 1 | 1 / 1 |
| en-GB | 1 / 1 | 1 / 1 |
| fr-FR | 2 / 2 | 1 / 1 |
| de-DE | 2 / 2 | 1 / 1 |
| it-IT | 2 / 2 | 2 / 1 |
| ja-JP | 1 / 1 | 1 / 1 |
| pl-PL | 1 / 1 | 2 / 1 |
| pt-BR | 1 / 1 | 1 / 1 |
| zh-Hans | 1 / 1 | 1 / 1 |
| es-ES | 2 / 2 | 2 / 1 |

All other headings remain one line. German Inputs fits its full unbroken token;
Spanish Inputs no longer needs three lines. French/German/Italian/Spanish
Producing consistently use two lines; Polish/Portuguese consistently use one.
No wider-viewport wrapping regression. Minimum measured Inputs-to-Logistics
text separation across all samples is 7.2 px; minimum label-to-help-pointer-target
separation is 3.5 px. These measurements missed the visual association defects
identified in user review and do not establish acceptance.

## Historical accessibility evidence and remaining checks at that time

This section preserves the initial verification boundary. The completed manual
acceptance above supersedes its outstanding zoom, High Contrast, and scrolling
checks for the final correction.

Six semantic headers and DOM order are preserved. Component tests exercise
localized help ownership, Enter activation, Escape dismissal and returned focus
for all ten locales. Browser keyboard focus on Producing shows the existing
2 px outline with 2 px offset, visibly contained in the reserved space.

True 200% zoom remains outstanding: the in-app browser zoom shortcut left the
reported viewport and DPR unchanged (1366, DPR 1). No reflow simulation is
claimed as true zoom. Windows High Contrast/forced-colors rendering remains
manual; existing forced-colors rules are unchanged, and geometry does not rely
on shading to separate labels. Sticky Item rules and scroller behavior are
unchanged; interactive horizontal-scroll verification remains manual.
Font-fallback/platform coverage beyond this Windows Chromium setup is not
claimed. These limitations keep final manual acceptance open.

## Automated verification

These results record implementation verification. The subsequent
documentation-only acceptance update reran `git diff --check` only; it did not
rerun runtime tests or browser checks.

All commands below were rerun after the two-sided correction. Regression checks
now protect natural word boundaries, the absence of Logistics displacement,
two-sided label-only borrowing, full heading copy and final-word/help ownership,
the unchanged shared tracks/control dimensions, and keyboard help interaction
across all ten locales. Pixel assertions remain browser checks, not jsdom tests.

- `npm test`: 256 passed, 0 failed.
- `npm run test:components`: 8 files, 85 tests passed.
- `npm run typecheck:tests`: exit 0.
- `npm run build`: exit 0, including reference verification. Vite reports a
  bundle-size advisory for the existing large application chunk.
- `npm run lint`: exit 0.
- `git diff --check`: passed at handoff.

The added regression coverage protects header order, help association and
keyboard operation, shared track definitions, body control dimensions, and the
absence of locale-specific Matrix CSS. Browser measurements above provide real
layout evidence rather than treating jsdom as a rendering engine.

Suggested commit message: `fix: stabilize Resource Matrix header layout`.
