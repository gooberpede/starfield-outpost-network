# CODEX IMPLEMENTATION BRIEF — First Compact-UI Localization and Solar/Wind Visual-State Tranche

## Objective

Implement the first bounded tranche arising from:

`docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md`

This tranche covers only:

1. a narrow compact/full localization mechanism for approved surface-specific compact copy;
2. a shared Starfield-adjacent segmented qualitative indicator for Solar/Wind state;
3. Polish compact Solar/Wind headings:
   - `Słońce`
   - `Wiatr`
4. French/German compact Search placeholders:
   - French: `Rechercher…`
   - German: `Suchen…`
5. the accessibility, forced-colors, and regression coverage required for those changes.

Do **not** address Resource Matrix heading geometry, Matrix compact nouns, Planned Supply technical-token capacity, official-name ellipsis, or any other compact-layout findings in this tranche.

In particular, do **not** change the geometry of resource/manufactured-item buttons or cells to solve `R-COOH` / `SiH3Cl`. That issue requires separate design discussion because shared geometry changes can affect Resource Matrix, Planned Supply, and Cargo Links.

---

## Source of truth

Use the committed audit as the primary design source:

```text
docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md
```

Also inspect:

```text
AGENTS.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/localization/LOCALE-ONBOARDING.md
src/localization/
src/ui/components/OutpostDetails.tsx
src/ui/components/OutpostDetails.css
src/ui/components/SearchForItems.tsx
src/ui/powerEfficiencyPresentation.ts
src/ui/statusTooltips.ts
src/domain/powerEfficiency.ts
tests/
```

Preserve the existing localization contracts unless this brief explicitly changes them.

---

## Hard scope boundary

Implement only:

```text
compact/full display mechanism
Solar/Wind segmented qualitative indicator
Polish Solar/Wind compact headings
French/German compact Search placeholders
related accessibility/forced-colors behavior
focused tests and durable documentation
```

Do not implement:

```text
Resource Matrix heading geometry changes
Resource Matrix compact Producing nouns
Inputs-column copy changes
Planned Supply token/cell width changes
R-COOH / SiH3Cl geometry changes
Cargo Link geometry changes
official-name shortening
locale-on-demand loading
workspace layout redesign
throughput or generator calculations
numeric Solar/Wind output UI
power multiplier UI expansion
```

---

## Compact/full localization principle

A compact visible label is a **surface-specific presentation variant**, not a replacement for the full semantic message.

The full localized semantic label remains authoritative for:

```text
accessible names
tooltips/help where full wording is appropriate
validation
history
prose
other unconstrained surfaces
```

The compact label is rendered only in the approved compact surface.

Do not globally replace full localized Solar/Wind or Search strings with the compact forms.

---

## Preserve exact full-catalogue guarantees

The current semantic localization architecture derives `MessageKey` from the complete `en-US` baseline and validates exact key/placeholder parity for full locales.

Do not weaken that contract merely to support a few optional compact forms.

Preferred architecture:

- keep full message catalogues unchanged as the authoritative semantic catalogues;
- add a **small explicit compact-display registry or equivalent narrow layer** keyed by stable surface/concept identity and locale;
- provide one centralized helper that resolves:
  1. approved compact override for the active locale;
  2. otherwise the existing full semantic label.

Do not open-code locale checks inside components.

Do not scatter locale-specific conditionals through `OutpostDetails` or `SearchForItems`.

If a different architecture can preserve all current exact-key guarantees cleanly, it is acceptable, but do not broaden the localization framework unnecessarily.

---

## Approved compact copy

These copy decisions are approved for this tranche.

### Polish Solar heading

Visible compact form:

```text
Słońce
```

Full semantic form remains:

```text
Energia słoneczna
```

### Polish Wind heading

Visible compact form:

```text
Wiatr
```

Full semantic form remains:

```text
Energia wiatrowa
```

### French Search placeholder

Visible compact form:

```text
Rechercher…
```

Keep the current full French Search accessible label/instruction unchanged.

### German Search placeholder

Visible compact form:

```text
Suchen…
```

Keep the current full German Search accessible label/instruction unchanged.

---

## Fallback behavior

For locales without an approved compact override:

- use the existing full visible label;
- do not invent or synthesize abbreviations;
- do not truncate localized strings in code;
- do not require every locale to define an artificial compact value.

Fallback must be deterministic and testable.

---

## Solar/Wind visual-state component

Replace the visible textual qualitative value in the Solar/Wind output box with one shared passive segmented indicator.

The indicator represents the existing **qualitative domain bucket**, not numeric output or throughput.

Implement a reusable component appropriate to the current architecture.

Inputs should remain semantic, such as:

```text
very-poor
poor
normal
good
none
unknown
```

Do not pass rendered labels or numeric multipliers as the primary visual-state input.

---

## Segment mapping

Use four horizontal segments for the ordered non-null Solar quality states:

```text
Very Poor   = 1 filled + 3 empty
Poor        = 2 filled + 2 empty
Normal      = 3 filled + 1 empty
Good        = 4 filled
```

Wind:

```text
None        = 4 empty + distinct structural none marker
Poor        = 2 filled + 2 empty
Normal      = 3 filled + 1 empty
Good        = 4 filled
```

Unknown:

```text
distinct intact indicator structure
not equivalent to None
not equivalent to Very Poor
not visually indistinguishable from rendering failure
```

Do not add a fictitious Wind 1/4 state.

The domain buckets remain unchanged.

---

## `None` and `Unknown` structural distinction

`None`, Very Poor, and Unknown must remain distinguishable **without color**.

Prototype the smallest treatment that fits the existing visual language.

Requirements:

- Very Poor clearly shows one filled segment.
- None clearly shows zero suitability and a structural `none` cue.
- Unknown clearly communicates unavailable/unknown data rather than zero.
- forced-colors mode preserves all three distinctions.
- the structure remains legible at the current compact dimensions.

Do not rely on opacity alone.

Do not rely on color alone.

---

## Starfield-adjacent visual language

The meter should be inspired by Starfield's segmented technical displays without copying proprietary assets.

Use CSS/DOM primitives only.

Desired character:

```text
rectilinear
technical
passive
compact
restrained
segmented
consistent with tracker visual language
```

Avoid:

```text
stars
ratings
health-bar styling
animation
glow-heavy HUD effects
continuous percentage bars
numeric tick marks
```

No image asset is required.

---

## Preserve the V1/V2 boundary

The visible meter must remain qualitative.

Do not show:

```text
raw SolarArrayPower
raw WindTurbinePower
multipliers
percentages
watts
generator counts
throughput
production rate
```

Do not add numeric labels such as `1/4`, `2/4`, etc.

The segment count is visual state, not displayed arithmetic.

---

## Existing detailed tooltip semantics

Inspect the current `getPowerEfficiencyTooltip()` behavior before changing it.

It currently may include quantitative source/multiplier detail.

This tranche is **not** authorization for a broader power-tooltip/content redesign unless required to preserve accessibility correctly.

Rules:

- do not expand quantitative information beyond what already exists;
- do not add new visible multipliers to the meter;
- preserve existing accepted tooltip behavior unless a concrete semantic/accessibility conflict requires a narrow change;
- if the meter needs a simpler accessible name than the detailed tooltip, provide a separate full localized qualitative accessible message rather than deleting accepted tooltip detail incidentally.

If implementation reveals that current tooltip semantics materially conflict with the settled V1 boundary, stop and report the issue rather than redesigning them silently.

---

## Solar/Wind accessible semantics

The graphical meter must not become the accessible name.

Expose a full localized semantic equivalent such as:

```text
Solar power: Poor
Wind power: None
Solar power: Unknown
```

using the active locale's full semantic labels.

The accessible representation should include source + qualitative state and must not require the user to infer meaning from segment count.

Do not make screen readers announce numerical progress/meter semantics.

---

## ARIA/semantic role

Preserve the passive nature of Solar/Wind.

Do not use progressbar, meter, or slider semantics if those imply numerical measurement/range.

Prefer ordinary output/status semantics with an explicit localized accessible name/description, consistent with the current component.

Do not make the meter interactive.

---

## Focus and tooltip behavior

Current Solar/Wind outputs are focusable and expose tooltip/accessibility text.

Preserve the existing accessibility/discoverability behavior unless there is a clearly superior equivalent already supported by project conventions.

Requirements:

- keyboard users can still reach the indicator if that is the current established contract;
- visible focus indication remains clear;
- tooltip behavior remains available;
- focus ring must not be obscured by the segmented graphic;
- no additional focus stop is added inside the meter.

The segments themselves must not be individually focusable.

---

## Forced colors / Windows High Contrast

Implement explicit forced-colors behavior.

Requirements:

- outer frame/boundaries remain visible;
- empty segments remain visibly outlined;
- filled segments remain visibly filled or otherwise structurally distinct;
- `None`, Very Poor, and Unknown remain distinct;
- focus indicator remains visible;
- state does not disappear when authored background colors are overridden.

Use appropriate system colors according to existing project conventions.

If implementation cannot make `None`, Very Poor, and Unknown reliably distinct in forced colors, stop rather than ship the meter.

---

## Solar/Wind headings and alignment

Apply the compact-display helper to the visible Solar/Wind headings.

Polish should render:

```text
SŁOŃCE
WIATR
```

subject to existing uppercase CSS treatment.

The semantic/full label remains:

```text
Energia słoneczna
Energia wiatrowa
```

for accessibility/help/tooltip use as appropriate.

Verify that the current Polish vertical-alignment defect is eliminated without changing the general Outpost Details grid geometry.

Do not widen the Solar/Wind columns merely for Polish.

Do not shorten other locales that currently fit.

---

## Search placeholder integration

Use the compact helper only for the visible placeholder.

French:

```text
Rechercher…
```

German:

```text
Suchen…
```

All other locales retain their current placeholder unless an approved compact override exists.

Do not change:

```text
search semantics
autocomplete behavior
search ranking
search aliases
combobox/listbox ARIA
full accessible label
Search Results behavior
```

No tooltip is required merely because the placeholder becomes shorter.

---

## Do not touch Matrix headings yet

Do not add speculative compact Matrix replacements in this tranche.

Do not change Matrix column widths, line heights, help icon geometry, or wrapping.

That remains a separate implementation parcel.

---

## Do not touch technical-token geometry

The audit measured `R-COOH` and `SiH3Cl` at approximately 58 px within a 55 px Planned Supply cell.

Do not fix this here.

In particular, do not widen or otherwise change generic resource/manufactured-item button/cell geometry by 3 px.

Any shared geometry adjustment can affect Resource Matrix, Planned Supply, Cargo Links, and other item surfaces and requires separate discussion.

---

## Tests — compact localization

Add focused automated coverage.

At minimum verify:

- Polish Solar compact override returns `Słońce`;
- Polish Wind compact override returns `Wiatr`;
- French Search compact override returns `Rechercher…`;
- German Search compact override returns `Suchen…`;
- locale without compact override falls back to the full existing label;
- compact override is surface-specific;
- full catalogue translation remains unchanged;
- compact text does not leak into accessible/full semantic paths;
- exact full-catalogue key/placeholder parity remains intact.

Do not weaken existing localization completeness tests.

---

## Tests — Solar/Wind state mapping

Test exact graphical state mapping:

```text
solar very-poor
solar poor
solar normal
solar good
solar unknown

wind none
wind poor
wind normal
wind good
wind unknown
```

At minimum assert:

- correct filled segment count;
- None marker exists and differs from Very Poor;
- Unknown marker exists and differs from None and Very Poor;
- accessible semantic state is full/localized;
- no numeric multiplier is rendered visibly.

---

## Component accessibility tests

Add component coverage verifying:

- graphic is not exposed as a numerical progressbar/meter;
- segment decoration is hidden from assistive technology where appropriate;
- output exposes one coherent localized semantic name/description;
- focus remains on the parent output, not segments;
- French/German Search placeholder compaction does not change accessible Search instruction;
- Polish compact headings do not replace full accessible Solar/Wind semantics.

---

## Forced-colors tests

Add the strongest practical regression coverage available.

Automated tests may verify:

- forced-colors CSS rules exist;
- structural classes/attributes for None/Unknown are present;
- system colors/borders are used.

Do not claim jsdom proves actual Windows High Contrast rendering.

Manual Windows High Contrast verification remains required.

---

## Manual/browser verification

Verify at minimum:

```text
1600×900
1366×768
true browser 200% zoom
```

Across relevant locales.

### Solar/Wind

Check at least:

```text
English
French
German
Italian
Polish
Portuguese
Spanish
Japanese
Simplified Chinese
```

Verify:

- meter fits existing output box;
- no text overflow because qualitative value is graphical;
- Polish `Słońce` / `Wiatr` headings align with neighboring fields;
- other locale headings are unchanged;
- tooltip/full semantics remain correct;
- None, Very Poor, Poor, Normal, Good, Unknown are visually distinct as applicable;
- indicator remains obviously passive.

### Search

Check French, German, and English.

Verify:

- French/German placeholders fit;
- English/current other placeholders remain unchanged;
- accessible label remains full.

---

## Manual accessibility verification

Verify in regular contrast:

- Solar indicator focus visible;
- Wind indicator focus visible;
- tooltip/full semantic text available;
- meter state understandable without color.

Verify in Windows High Contrast / forced colors:

- empty/filled segments distinguishable;
- None distinguishable from Very Poor;
- Unknown distinguishable from None and Very Poor;
- focus indicator visible;
- no state disappears.

If available, use Narrator for a focused sample and verify it announces the full qualitative semantic state rather than decorative segment structure.

If Narrator environment cannot speak the locale, report that limitation accurately.

---

## Documentation reconciliation

After implementation inspect:

```text
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
```

Guidance:

- preserve audits as point-in-time evidence;
- update UX/design documentation with the compact/full and graphical-state conventions if now settled;
- update architecture documentation only if the compact registry/helper or meter component establishes a reusable architectural boundary;
- retire resolved backlog items for:
  - localized `Very Poor` value capacity;
  - Polish Solar/Wind heading alignment;
  - French/German Search placeholder truncation;
- leave Matrix header and technical-token capacity work open;
- do not imply those deferred issues were solved.

Do not leak temporary parcel/step numbering into durable docs.

---

## Expected implementation architecture

Prefer a small shape such as:

```text
full semantic catalogues
        ↓
compact-display resolver
        ↓
surface requests compact concept
        ↓
approved locale override OR full fallback
```

and:

```text
domain Solar/Wind bucket
        ↓
qualitative segmented indicator
        + full localized semantic label
```

Avoid:

```text
locale conditionals in components
automatic abbreviation
duplicate full catalogues
numeric meter semantics
one-off Polish CSS
one-off French/German width hacks
```

---

## Verification commands

Run at minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Also run relevant localization provenance/reference tests if localization infrastructure changes require them.

At minimum preserve all existing locale completeness/coverage guarantees.

---

## Stop conditions

Stop and report before broadening scope if:

- optional compact display support would weaken exact full-catalogue parity;
- compact overrides require a broad localization refactor;
- Polish compact headings cause semantic/accessibility ambiguity;
- French/German compact placeholders cannot be separated cleanly from full accessible instructions;
- the segmented indicator cannot distinguish None, Very Poor, and Unknown in forced colors;
- graphical implementation requires numerical ARIA semantics;
- the meter does not fit the existing output geometry without broader Outpost Details redesign;
- implementation would require changing Matrix or generic resource/item geometry;
- current power tooltip semantics create a substantive V1/V2 policy conflict that cannot be resolved narrowly.

Do not solve unrelated compact-layout issues opportunistically.

---

## Expected Codex summary

Report:

1. branch used;
2. compact/full localization architecture implemented;
3. exact approved compact overrides;
4. full semantic fallback behavior;
5. Solar/Wind indicator component structure;
6. state-to-segment mapping;
7. None treatment;
8. Unknown treatment;
9. accessible semantic output;
10. forced-colors treatment;
11. Polish heading/alignment result;
12. French/German Search result;
13. true 200% result or remaining manual check;
14. Windows High Contrast result or remaining manual check;
15. Narrator/manual accessibility result where available;
16. documentation/backlog reconciliation;
17. explicit confirmation Matrix headings were not changed;
18. explicit confirmation technical-token geometry was not changed;
19. tests/checks run and results;
20. limitations/stop conditions;
21. suggested commit message;
22. confirmation no commit or push was performed.

Suggested commit message:

`feat: add compact localized power indicators`
