# CODEX MICRO-CORRECTION BRIEF — X-Tech Compact Action Alignment and Styling

## Purpose

Apply one final, extremely narrow visual-integration correction to the Resource Matrix.

The Context Help cleanup is now accepted and must remain untouched.

This correction is only for the:

```text
[+ X-Tech]
```

control.

The current X-Tech control is still:

- visually misaligned with the Present-column controls below;
- using normal-mode styling that has drifted away from the shared Manufactured Products `[edit]` compact-action treatment.

Do **not** reopen any other accessibility or visual cleanup work.

Do **not** commit or push.

---

# Current accepted state

The following visual cleanup is considered successful and must not change:

- compact visible Context Help chrome;
- enlarged invisible/asymmetric Context Help hit targets;
- BIOMES alignment;
- Resource Matrix Context Help alignment;
- Resource Matrix header height/borders;
- Context Help focus treatment;
- Context Help forced-colors behavior.

Do not touch those selectors unless strictly necessary to avoid a regression from the X-Tech correction.

---

# Current X-Tech problem

The previous cleanup substantially corrected the X-Tech width numerically:

```text
X-Tech visible width:      ~57.05 px
Present control width:     ~57.59 px
```

So width is close enough to the intended Present-column geometry.

However, the visible result still shows two defects:

1. `[+ X-Tech]` remains horizontally misaligned relative to the Present-column buttons below.
2. Its normal-mode shading no longer resembles the Manufactured Products `[edit]` control.

The current X-Tech-specific modifier appears to override shared compact-action presentation with rules equivalent to:

```css
color: var(--ui-text-muted);
background: transparent;
```

This reintroduces bespoke X-Tech styling and defeats the purpose of sharing the compact-action visual family.

---

# Required design rule

Treat Manufactured Products `[edit]` as the established **visual-family precedent**.

`[+ X-Tech]` should share with `[edit]`:

- normal-mode background treatment;
- border treatment;
- text treatment;
- typography;
- control height;
- focus treatment;
- forced-colors behavior;
- overall compact-action character.

The X-Tech-specific modifier may adjust **geometry only** where needed.

Conceptually:

```text
shared compact-action class
    -> appearance

X-Tech modifier
    -> width / inline padding / grid placement / alignment only
```

Do not use the X-Tech modifier to override the shared background, text color, border, or focus style in normal mode.

---

# Part 1 — Restore shared normal-mode appearance

Remove or revise any X-Tech-specific normal-mode rules that make it visually different from `[edit]`.

In particular, do not leave X-Tech with:

```text
transparent background
muted-only text treatment
bespoke border treatment
```

if those differ from the shared compact-action style.

The result should make `[+ X-Tech]` and `[edit]` immediately read as members of the same control family.

They do **not** need identical widths.

---

# Part 2 — Align X-Tech to the Present column

Do not rely on an arbitrary `margin-left` offset if the Resource Matrix structure can provide a more reliable anchor.

The screenshot still shows visible misalignment despite the previous reported center-offset measurement.

This suggests the previous measurement may not have used the same visual reference as the user sees in the Matrix row.

Preferred alignment strategy:

- use the existing Matrix column/grid/table geometry directly;
- place the X-Tech action in the same horizontal track/reference as the Present-column controls below;
- center it within that track;
- avoid magic offsets where possible.

If the DOM/table structure makes direct column alignment impractical, a small geometry modifier is acceptable, but the final browser measurement must compare:

```text
X-Tech visible center
vs
Present button visible center
```

in the same rendered Matrix.

Do not compare against an unrelated wrapper or row-group boundary.

---

# Part 3 — Width

Keep the current improvement: X-Tech should remain fractionally narrower than the previous oversized Slice-2 version.

Target:

- visually very close to the Present-column button width;
- no text clipping;
- still clearly reads `[+ X-Tech]`;
- not wider merely because of label length.

The current ~57 px width is a useful reference and likely already close enough.

Do not aggressively shrink it if that harms readability.

---

# Part 4 — Practical hit target

Preserve the accessibility gain.

If the visible X-Tech box is smaller than the practical pointer target desired for this control:

- retain or add invisible hit-area expansion;
- keep expanded hit geometry non-overlapping;
- do not increase visible chrome just to satisfy target size.

No overlapping interactive areas may be introduced.

---

# Part 5 — Focus and forced colors

Preserve:

- current keyboard focusability;
- clear visible focus treatment;
- forced-colors/high-contrast rules;
- accessible name;
- native button semantics.

If selector changes are required, verify that the revised X-Tech class still receives the shared forced-colors treatment.

Do not add bespoke X-Tech forced-colors styling unless genuinely necessary.

---

# Part 6 — Runtime visual check

Perform one focused browser check of the Resource Matrix containing:

- the Inorganic group with `[+ X-Tech]`;
- several Present-column controls;
- the Manufacturing group with `[edit]`.

Verify visually:

1. `[+ X-Tech]` and `[edit]` clearly share the same styling family;
2. X-Tech no longer looks washed out/transparent relative to `[edit]`;
3. X-Tech is centered/aligned with the Present controls below;
4. X-Tech width is close to the Present control width;
5. no text clipping;
6. no hit-target overlap;
7. focus still looks correct.

Capture/report actual rendered measurements for:

```text
X-Tech left edge
X-Tech right edge
X-Tech center
X-Tech width
Present button left edge
Present button right edge
Present button center
Present button width
```

Use the same rendered Matrix instance for both measurements.

---

# Tests

Update only the smallest relevant regression coverage.

Useful assertions may include:

- X-Tech still includes the shared compact-action class;
- X-Tech-specific modifier does not replace shared semantics;
- accessible name remains intact;
- focusability remains intact.

Do not write brittle pixel-perfect unit tests.

Browser/runtime geometry is authoritative for alignment.

---

# Explicit non-goals

Do not change:

- Context Help;
- BIOMES layout;
- Matrix header borders/height;
- Resource Matrix table semantics;
- Matrix passive-focus cleanup;
- Planned Supply;
- Cargo;
- Character Header;
- Validation;
- Search;
- workspace responsive layout;
- localization architecture;
- persistence/history/import/export.

Do not turn this into another general cleanup pass.

---

# Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run reference:test
npm run reference:build
npm run localization:provenance:test
npm run localization:provenance:verify
npm run localization:reference-names:verify
npm run localization:terminology:verify
npm run build
npm run lint
git diff --check
```

---

# Acceptance criteria

Complete when:

1. X-Tech normal-mode styling again matches the shared compact-action family used by `[edit]`;
2. X-Tech-specific overrides are limited to geometry where practical;
3. X-Tech no longer uses a bespoke transparent/muted treatment that visually separates it from `[edit]`;
4. X-Tech is visibly centered/aligned with the Present-column controls below;
5. alignment is measured against a Present control in the same rendered Matrix;
6. X-Tech width remains close to the Present-control width;
7. no text clipping occurs;
8. practical pointer target accessibility is preserved;
9. no overlapping hit targets are introduced;
10. focus treatment remains clear;
11. forced-colors behavior remains intact;
12. Context Help cleanup remains untouched;
13. no other accessibility behavior changes;
14. all tests/build/lint/verifiers pass;
15. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- X-Tech shared-style changes;
- X-Tech-specific modifier after correction;
- whether `background`, `color`, `border`, or focus overrides remain and why;
- same-Matrix X-Tech vs Present-control measurements;
- final center offset;
- final visible width comparison;
- hit-target behavior;
- focus/forced-colors regression check;
- tests updated;
- full verification results;
- confirmation Context Help was untouched;
- confirmation no unrelated accessibility work changed;
- confirmation no commit or push was performed.
