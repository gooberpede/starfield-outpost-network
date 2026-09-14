# CODEX CLEANUP BRIEF — Accessibility Visual Integration Cleanup

## Purpose

Perform a focused visual-integration cleanup after Accessibility Slices 1–3.

The accessibility changes are now functionally complete enough to preserve as baseline. This cleanup exists only to correct visual/alignment regressions introduced when compact controls were enlarged for practical pointer targets.

The cleanup must **preserve the accessibility gains**.

Do **not** solve these regressions by shrinking the actual practical hit targets back to their old inaccessible size.

Do **not** touch unrelated accessibility behavior.

Do **not** commit or push.

---

# Scope

This cleanup is limited to three known visual regressions:

1. Context Help controls in the **Resource Matrix header** now look too large and vertically cramped inside the header strip.
2. Context Help beside **BIOMES** in Outpost Details is visually oversized and has pushed the Biomes control row out of alignment with the neighboring fields.
3. The **`[+ X-Tech]`** action is vertically misaligned with the Present-column controls below and is also fractionally too wide.

The guiding design principle is:

> The visible size of a control does not have to equal its practical pointer target size.

Use compact visible chrome plus enlarged invisible/asymmetric hit areas where safe.

---

# Non-negotiable accessibility baseline

Preserve all current accessibility behavior from Slices 1–3.

In particular, do not regress:

- practical pointer target size for the audited compact controls;
- keyboard focusability;
- visible focus indication;
- screen-reader naming;
- forced-colors treatment;
- Resource Matrix passive-status Tab cleanup;
- Search behavior;
- Validation relationship;
- Cargo semantic summaries;
- Character Header behavior;
- workspace reflow;
- semantic shell/landmarks.

Do not make any accessibility trade-off merely to make the controls look smaller.

---

# Part 1 — Context Help: decouple visible chrome from hit target

## Current issue

Slice 2 enlarged the Context Help buttons themselves to approximately 27×27 px.

This fixed the pointer-target issue but introduced visual problems:

- Matrix header help buttons nearly touch the top/bottom borders;
- the Biomes help control is disproportionate to the BIOMES label;
- Outpost Details alignment is disturbed.

The visible circle should return to a compact appearance.

## Required direction

Restore the **visible help control** to approximately its pre-Slice-2 visual scale.

Target conceptually:

```text
visible circle/glyph: compact, visually around 14–16 px class
practical pointer area: approximately 24×24 px or better where safe
```

The exact visible diameter should be chosen by matching the established design, not by forcing a specific number.

Use an invisible enlarged hit area attached to the button.

Suitable techniques may include:

- pseudo-element expansion;
- transparent absolute-positioned hit area;
- asymmetric padding combined with compact visible inner chrome;
- wrapper only if necessary and semantically inert.

Prefer the smallest clean CSS solution.

---

# Part 2 — Context Help hit areas may be asymmetric

The enlarged clickable area does **not** need to extend equally in all directions.

This is especially important for the BIOMES help control.

If a centered 24×24 target would overlap nearby biome controls, bias the hit area away from them.

Example conceptually:

```text
more expansion:
- upward
- left
- right where safe

less expansion:
- downward toward biome buttons
```

Likewise, in the Resource Matrix header, shape the target around available whitespace rather than forcing a symmetric square into a tight strip.

---

# Part 3 — No overlapping pointer targets

This is mandatory.

For every Context Help control modified in this cleanup:

- inspect the actual interactive bounding area;
- inspect the nearest neighboring interactive controls;
- confirm expanded hit targets do not overlap;
- if overlap would occur, reduce expansion on that edge;
- do not compensate by inserting awkward visible spacing unless there is no cleaner option.

For BIOMES specifically:

- verify the expanded help target does not intersect the nearest biome button;
- preserve the compact visible relationship between `BIOMES` and the help icon;
- preserve existing row alignment with System, Body, Solar, and Wind controls.

Do not enlarge all Outpost Details labels to solve this.

Do not change the typography hierarchy.

---

# Part 4 — Focus indicator geometry

The visible focus treatment does not have to outline the full invisible pointer hit area.

Prefer focus styling around the **visible help control**, provided it remains obvious and high-contrast.

Requirements:

- focus remains clearly visible;
- focus is not clipped;
- pointer target remains larger than visible chrome;
- no giant focus box reveals the invisible target awkwardly.

Do not weaken keyboard focus just to make the control look compact.

---

# Part 5 — Resource Matrix Context Help

## Current visual issue

The enlarged help controls are vertically cramped between the Matrix header strip borders and look as though they are being squeezed into the row.

Avoid changing the Matrix header structure if possible.

Preferred order of solutions:

1. restore compact visible help chrome;
2. retain enlarged invisible/asymmetric hit target;
3. preserve current header height and borders;
4. adjust local alignment only if needed.

Only if the above cannot produce a visually balanced result should Codex consider:

- a very small header-height adjustment.

Do **not** remove header borders as the first solution.

Do **not** materially increase the header height unless necessary.

Do not redesign the Matrix heading strip.

---

# Part 6 — Outpost Details / BIOMES Context Help

## Current visual issue

The BIOMES help button is too large relative to the label and has disturbed alignment with the controls in the rest of the Outpost Details header.

Required outcome:

- `SYSTEM`, `BODY`, `SOLAR`, `WIND`, and `BIOMES` retain their current typography scale;
- BIOMES remains aligned with peer labels;
- the visible help circle returns to a compact scale;
- the biome controls below realign with the other controls in the section;
- the practical help hit target remains enlarged without overlapping a biome button.

Do not:

- enlarge all Outpost Details labels;
- introduce special oversized BIOMES typography;
- create extra vertical space merely to accommodate the help button.

---

# Part 7 — `[+ X-Tech]` alignment and width

## Current issue

The shared compact-action treatment improved consistency but the X-Tech action now:

- sits out of alignment with the Present-column controls below;
- appears fractionally wider than the buttons in that column.

A positional shift alone is not sufficient.

## Required outcome

Treat Manufactured Products `[edit]` as the **style-family precedent**, not an exact width template.

Preserve shared:

- typography;
- bracketed compact-control language;
- border/focus treatment;
- control height;
- vertical rhythm.

But allow X-Tech-specific width/alignment tuning because it belongs visually to the Present column.

Required:

- make the visible `[+ X-Tech]` button slightly narrower so it reads as belonging to the Present column;
- center/align it precisely over the relevant Present-column controls below;
- preserve adequate text readability;
- preserve its accessible name and keyboard behavior.

If reducing the visible button size would compromise the practical pointer target, enlarge the invisible hit area around it rather than making the visible button bulky again.

Do not force `[+ X-Tech]` and `[edit]` to have identical widths.

---

# Part 8 — Shared compact-control CSS

Inspect the current shared compact-action and Context Help CSS.

Use shared rules where they genuinely represent a common design pattern, but do not force unrelated controls into identical geometry.

Preferred model:

```text
shared visual family
+ context-specific sizing/alignment modifiers
```

Avoid:

```text
one universal width/box size for every compact action
```

Do not over-refactor.

A small modifier class is preferable to a broad component-system rewrite.

---

# Part 9 — Normal-mode only cleanup

This cleanup is primarily about ordinary visual integration.

Preserve existing `forced-colors` behavior.

Do not remove or weaken:

- forced-colors outlines;
- selected/stale state cues;
- disabled state cues;
- high-contrast focus treatment.

If selector changes are necessary, verify that forced-colors overrides still match the revised classes.

---

# Part 10 — Browser measurements / geometry checks

Perform targeted runtime checks.

For Context Help controls, report:

- visible button dimensions;
- effective practical hit target dimensions;
- nearest-neighbor distance;
- whether any interactive target overlaps another.

For BIOMES specifically, verify the actual effective hit rectangle against the nearest biome button.

For Matrix help controls, verify the effective target remains within safe neighboring space.

For X-Tech, report:

- visible width/height;
- Present-column control width/height;
- relative alignment.

Do not chase pixel perfection across every browser.

The goal is coherent visual alignment and safe target geometry.

---

# Part 11 — Targeted visual sanity checks

After implementation, visually inspect:

## Outpost Details

- System/Body/Solar/Wind/Biomes labels retain consistent scale;
- Biomes help appears proportionate;
- biome controls align with peer controls;
- no weird vertical spacing;
- help target does not overlap biome buttons.

## Resource Matrix

- help controls no longer look squeezed between header borders;
- header height/borders still feel intentional;
- column heading layout remains balanced;
- no overlap between help hit areas and neighboring controls.

## X-Tech

- button appears fractionally narrower than current Slice-2 version;
- visually aligns with the Present column;
- `[edit]` and `[+ X-Tech]` still read as the same compact-control family;
- no text clipping.

---

# Tests

Add/update only the smallest useful regressions.

Potential assertions:

- Context Help retains an expanded-hit-area class/pseudo-element strategy;
- X-Tech and `[edit]` remain in the same compact-action family;
- X-Tech may use a context-specific modifier;
- no semantic/accessibility regression to accessible names/focusability.

Do not write brittle pixel-value unit tests unless the repository already has an appropriate pattern.

Manual/runtime geometry observation is authoritative for this cleanup.

---

# Full manual accessibility pass remains after cleanup

Do not attempt to close the entire accessibility batch in this implementation.

After this cleanup is complete and visually accepted, the next step is the consolidated manual accessibility verification:

- true browser zoom;
- full keyboard traversal;
- Narrator;
- Windows forced colors/high contrast;
- target comfort/overlap;
- representative `en-US` / `ja-JP` checks.

This cleanup should leave the product ready for that pass.

---

# Explicit non-goals

Do not change:

- Character Header behavior;
- Cargo summary semantics;
- Search submission behavior;
- Validation behavior;
- Matrix passive focus model;
- Resource Matrix table semantics;
- workspace stacking breakpoint;
- major typography scale;
- localization architecture;
- persistence/history/import/export;
- mobile/Safari support.

Do not reopen completed accessibility findings without regression evidence.

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

1. Context Help visible chrome is compact again;
2. practical Context Help hit areas remain approximately 24×24 px or otherwise materially enlarged where safe;
3. BIOMES help hit area does not overlap a biome control;
4. Matrix help hit areas do not overlap neighboring controls;
5. BIOMES label/control alignment is restored without enlarging peer labels;
6. Matrix help controls no longer look vertically crushed inside the header strip;
7. Matrix header borders/height remain unchanged unless Codex demonstrates a small change is genuinely necessary;
8. `[+ X-Tech]` is fractionally narrower than the current Slice-2 version;
9. `[+ X-Tech]` aligns with the Present-column controls below;
10. `[+ X-Tech]` and `[edit]` remain visually related without being forced to identical widths;
11. invisible target enlargement is used where needed rather than enlarging visible chrome;
12. no overlapping interactive hit areas are introduced;
13. visible keyboard focus remains clear;
14. forced-colors behavior is preserved;
15. no completed Slice 1–3 accessibility behavior regresses;
16. all tests/build/lint/verifiers pass;
17. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- Context Help visible dimensions before/after;
- effective hit-area strategy;
- whether hit areas are symmetric or asymmetric;
- measured BIOMES help / nearest biome-button geometry;
- measured Matrix help / nearest-control geometry;
- whether any header height/border changes were needed;
- X-Tech width/alignment before/after;
- how X-Tech relates to the `[edit]` compact-action style;
- focus treatment after cleanup;
- forced-colors regression check;
- tests updated;
- browser/runtime sanity checks;
- full verification results;
- confirmation no completed accessibility behavior regressed;
- confirmation no commit or push was performed.
