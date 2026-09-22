# CODEX AUDIT BRIEF — Cross-Locale Compact Copy, Graphical State, and Layout Capacity Review

## Objective

Perform a **read-only cross-locale audit** of compact UI surfaces whose current English-derived labels or geometry do not scale cleanly across the completed locale set.

Determine, surface by surface, whether the correct remedy is:

1. a locale-authored compact label;
2. a graphical/state representation;
3. a layout/geometry change;
4. intentional ellipsis/tooltip treatment;
5. no change.

Produce a durable **cross-locale compact-copy and visual-capacity plan**.

Do not implement copy, CSS, graphics, layout, accessibility, or runtime changes during this audit.

The only tracked repository change permitted is the new durable audit report.

---

## Core design principle

Do not treat compact localization as literal translation of an English surface string.

Distinguish:

```text
stable semantic concept
full localized semantic label
compact localized display label
graphical/state representation
literal technical token
official game terminology
```

A compact control should communicate the intended concept within its available space, not mechanically translate the exact English abbreviation or wording.

Example:

```text
English full concept:
    Very Poor

English compact display:
    V.Poor
```

A non-English locale does **not** need to translate `V.Poor` literally. It may use a natural terse locale-specific label, conventional abbreviation, graphical representation, or another compact form that preserves the concept.

---

## Accessibility is a hard constraint

Any compact or graphical solution must preserve or improve accessibility.

A graphical representation must never be the only semantic carrier.

For every graphical/state proposal, require:

- a full localized accessible name or description;
- a full localized tooltip/help description where appropriate;
- non-color-only state distinction;
- understandable structure in forced-colors / Windows High Contrast;
- sufficient contrast;
- no reliance on hue alone;
- keyboard/focus compatibility where the element is interactive;
- no removal of existing screen-reader semantics;
- no loss of full meaning for users who cannot perceive the graphic.

If the visible form is compact or graphical, the full localized semantic phrase must remain available to assistive technology.

Do not approve a graphic that cannot meet this contract.

---

## Locale set

Audit the complete runtime locale set:

```text
English (US)
English (UK)
French
German
Italian
Japanese
Polish
Portuguese (Brazil)
Simplified Chinese
Spanish (Spain)
```

Use real current catalogue strings and official reference overlays.

---

## Durable sources to inspect

Inspect at minimum:

```text
AGENTS.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/localization/LOCALE-ONBOARDING.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
docs/audits/SHARED-ACCESSIBILITY-FOLLOW-UP-RECONCILIATION.md
docs/audits/codex-whole-product-accessibility-audit.md
src/localization/
src/index.css
src/ui/
tests/
```

Also inspect existing glossary/terminology material where compact labels intersect localized semantic meaning.

Use current repository state as authority.

---

## Required content taxonomy

Classify every audited label/surface into one of these categories.

### A. Official game terminology

Bethesda-authored or deliberately official Starfield terminology.

Default treatment:

- preserve official localized wording;
- do not abbreviate casually;
- only create a compact presentation if separately justified and the full official term remains available semantically.

Examples may include Cargo Link, Inter-System, skill names, and official entity names.

### B. Tracker-owned full semantic copy

Normal tracker-authored labels/prose where fidelity of meaning matters more than compactness.

Default treatment:

- translate naturally;
- allow layout to accommodate ordinary language where reasonable.

### C. Tracker-owned compact display copy

Tracker-owned labels deliberately constrained by a compact surface.

Default treatment:

- localize the concept and the space constraint;
- permit locale-specific abbreviation, synonym, noun-form, terse wording, or conventional shorthand;
- retain the full semantic label for accessibility/tooltip/help.

Candidate examples include Resource Matrix column headings, Search placeholder, and compact quality/state text.

### D. Graphical/state representation

A semantic state better represented visually than by localized text.

Default treatment:

- visible graphic may be language-neutral;
- full localized semantic text remains accessible;
- state must be distinguishable without color.

Candidate example: Solar/Wind qualitative suitability.

### E. Literal technical tokens

Values whose literal form is part of their meaning, for example:

```text
R-COOH
SiH3Cl
FormIDs
IDs
canonical technical abbreviations
```

Default treatment:

- preserve literal token;
- solve capacity through layout/overflow/tooltip rather than translation.

---

## Audit inventory

Create an inventory of compact/fixed/nowrap surfaces across the application.

At minimum inspect:

```text
Solar/Wind headings
Solar/Wind quality values
Resource Matrix column headings
Search placeholder
Search compact labels/results
Planned Supply compact cells/tokens
Cargo compact summaries/badges
Validation/status compact labels
Navigation counters/badges
keyboard shortcut keycaps
compact Matrix state cells
any fixed-width passive indicator
any nowrap heading or button found during source inspection
```

Also identify current compact labels that already fit all locales, so the resulting framework is based on the whole UI rather than only known failures.

---

## Solar/Wind qualitative values

The current text labels derive from qualitative classifications such as:

```text
Very Poor
Poor
Normal
Good
None (Wind)
```

These classifications are intentionally **not** throughput/output simulation.

Preserve the V1/V2 boundary:

- V1 exposes qualitative suitability;
- V2 may later expose quantitative power/generator/throughput concepts.

Do not recommend numeric multipliers or output values as the default visible representation merely because they are compact.

---

## Segmented-meter candidate

Evaluate a Starfield-adjacent segmented technical meter as the leading graphical candidate for Solar/Wind qualitative state.

Conceptually:

```text
Very Poor   [■□□□]
Poor        [■■□□]
Normal      [■■■□]
Good        [■■■■]

Wind None   [□□□□]
```

This is conceptual only; do not implement literal glyphs.

Assess a CSS-drawn segmented meter inspired by Starfield's existing visual language:

- narrow rectangular segments;
- filled/empty geometry;
- fixed compact footprint;
- passive technical indicator;
- no numeric value shown;
- no color-only state meaning.

Evaluate:

- whether 4 segments are sufficient;
- whether `None` as 0/4 is visually distinct enough from Very Poor as 1/4;
- whether a frame, hatch, slash, or other non-color structural cue is needed for `None`;
- forced-colors behavior;
- screen-reader semantics;
- tooltip/full-label semantics;
- whether horizontal orientation fits current Outpost Details better than vertical.

Do not treat the meter as a live power gauge.

The audit should explicitly state how to avoid implying throughput.

---

## Solar/Wind headings

Treat the heading labels separately from the qualitative value representation.

Known problem:

```text
Polish:
ENERGIA SŁONECZNA
ENERGIA WIATROWA
```

wrap and vertically misalign the controls.

Before recommending geometry changes, research how Polish speakers naturally refer, tersely, to:

- solar power;
- wind power;
- solar/wind conditions or suitability;
- photovoltaics/wind in compact technical contexts.

Do not assume the terse form must be a literal abbreviation of the full phrase.

Distinguish:

```text
technology label
energy-source label
environmental/suitability label
```

because those may have different idiomatic forms.

Apply the same principle to other locales if their headings create pressure.

A terse visible label may still expose the full localized `Solar Power` / `Wind Power` phrase in tooltip/accessibility text.

---

## Locale research requirements

For any proposed compact label, do not machine-shorten strings mechanically.

Use evidence from:

- official/local professional usage;
- technical/energy-sector terminology;
- common software/UI usage;
- dictionaries/style guides where relevant;
- official Starfield localization where the term is Bethesda-authored.

Prefer native idiom over literal translation.

For each proposed compact form, record:

```text
locale
full semantic phrase
candidate compact form
source/evidence
whether it is abbreviation/synonym/conventional shorthand
risk of ambiguity
recommended use
```

If evidence is weak, do not invent a compact form.

---

## Resource Matrix headings

Audit the current visible headings corresponding to concepts such as:

```text
Item
Source
Present
Producing
Inputs
Logistics
```

The problem is not necessarily bad translation. The English labels were selected partly because they fit compact technical columns.

For every locale:

- inspect current full translation;
- inspect actual wrap/height;
- identify whether a shorter idiomatic term exists;
- determine whether a compact visible label should differ from the full semantic label.

Important semantic meanings to preserve:

```text
Present:
    item/resource exists at the outpost/body

Producing:
    this outpost is actively producing it

Inputs:
    required materials/recipe inputs

Logistics:
    actual configured routed logistics/export state
```

Do not choose a shorter term that changes these meanings.

The full semantic phrase must remain accessible if the visible label is abbreviated.

---

## Matrix compact-label architecture

Assess whether the localization system should support separate full/compact keys, conceptually such as:

```text
matrix.present.full
matrix.present.compact
```

or another centralized pattern.

Do not prescribe exact key names unless repository conventions make one clearly preferable.

Evaluate:

- avoiding duplication;
- fallback behavior;
- whether compact keys should fall back to full keys;
- how tests should guarantee semantic/accessibility parity;
- whether compact labels should be surface-specific rather than globally shared.

Do not implement the architecture.

---

## Search placeholder

The Search placeholder is instructional microcopy, not an official term.

Known issue:

- French and German visible placeholder text exceeds current capacity.

Audit it as locale-authored compact microcopy.

Ask:

> What is the shortest natural phrase in each locale that communicates “search resources or products” sufficiently in this context?

Do not require word-for-word translation.

Evaluate:

- whether a simple locale equivalent of `Search…` is sufficient because context already defines the domain;
- whether `Resources/products` must remain explicit;
- whether placeholder text can be shorter while the accessible label carries the full instruction.

Do not solve by simply shrinking the font.

---

## Long official names

Official system/body/biome/resource/product/species names should normally remain unchanged.

For these:

- preserve official localized text;
- retain existing ellipsis/tooltips/accessible names where intentional;
- recommend geometry changes only if actual meaning/operability is lost.

Do not introduce compact unofficial aliases merely to make official names fit.

---

## Technical tokens

Audit small fixed cells containing tokens such as:

```text
R-COOH
SiH3Cl
```

Determine whether visible clipping currently loses meaningful content.

If yes, recommend a presentation remedy.

Do not localize or shorten canonical technical tokens.

---

## Layout-change threshold

For every issue, explicitly answer:

> Is the text intrinsically compactable without losing meaning, or is the layout too rigid for ordinary language?

Prefer compact copy when:

- the surface is deliberately terse;
- English already uses abbreviation/shorthand;
- a natural locale-specific terse form exists.

Prefer layout correction when:

- the text is ordinary full semantic copy;
- shortening would become unnatural or cryptic;
- multiple locales would need awkward abbreviations;
- the heading/control should reasonably support two-line text.

Do not make “shorter translation” the default solution to every layout defect.

---

## Accessibility review for compact labels

For each proposed compact label:

- define the full semantic localized equivalent;
- confirm screen-reader text exposes the full meaning where needed;
- confirm tooltip/help text is full/localized where applicable;
- check whether visible abbreviation is understandable without tooltip for sighted users;
- avoid ambiguous abbreviations that require memorization without support.

If a compact label and accessible label differ, document that intentionally.

---

## Accessibility review for graphics

For each graphical candidate, document:

### Semantics

Conceptual accessible output should remain equivalent to:

```text
Solar power: Poor
Wind power: None
```

localized in the active locale.

### Visual redundancy

State must be encoded through shape/fill/segment count, not only hue.

### Forced colors

Verify that:

- filled and empty segments remain distinguishable;
- frame/boundary remains visible;
- `None` remains distinguishable from a rendering failure;
- no essential state disappears when author colors are overridden.

### Focus

If passive:

- do not make it keyboard-focusable merely because it has a tooltip unless existing accessibility architecture requires a focusable help mechanism.

If interactive in future:

- that requires a separate design; current Solar/Wind indicators remain passive.

---

## High Contrast / forced-colors design guidance

The audit should propose how graphical meters could use system colors or borders in forced-colors mode.

Prefer geometry such as:

```text
filled segment = solid/system foreground
empty segment = outlined cell
```

rather than relying on opacity or color differences that may collapse under forced colors.

Do not implement the CSS.

---

## Visual-language fit

Evaluate the segmented-meter candidate against the established tracker visual language and Starfield-adjacent references.

The meter should feel like:

- a restrained technical status display;
- rectilinear;
- compact;
- passive;
- consistent with existing technical monospace/bordered indicators.

It should not look like:

- a game HUD health bar;
- a star-rating widget;
- a live animated energy meter;
- a quantitative throughput chart.

No animation is needed.

---

## Cross-locale browser measurements

Use current real catalogues and browser rendering.

At minimum measure/review:

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

at:

```text
1366×768
1600×900
```

Use true 200% zoom if available; otherwise retain existing manual evidence and label simulation accurately.

For each problematic compact surface record:

- available width;
- rendered text width;
- wrap count;
- clipping/truncation;
- row/control height;
- whether a compact candidate would fit.

Do not treat one browser/font stack as universal truth; record the environment.

---

## Known current findings to verify

At minimum revisit:

```text
French/German Search placeholder clipping
French/German/Italian/Portuguese/Spanish Very Poor capacity
French/German/Italian/Polish/Spanish Matrix header capacity
Polish Solar/Wind heading alignment
long flora/fauna names
Planned Supply technical-token pressure
```

Do not assume the existing classification is final.

The new taxonomy may change the recommended remedy.

---

## Recommended per-surface outcome

For every audited issue, choose one:

```text
A. locale-authored compact label
B. graphical/state representation
C. layout/geometry correction
D. intentional ellipsis/tooltip remains appropriate
E. no action
F. more language evidence required
```

Also state whether the recommendation is:

```text
shared across all locales
locale-specific
surface-specific
```

---

## Compact-copy candidate table

The durable report should include a table broadly like:

| Surface | Locale | Full semantic label | Current visible form | Recommended strategy | Candidate compact form / graphic | Accessibility fallback | Evidence confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |

Do not fill weak language recommendations merely for completeness.

Mark uncertain entries for later native/editorial review.

---

## Implementation architecture recommendations

Recommend how the product should represent compact/full variants without implementing them.

Consider:

```text
separate semantic catalogue keys
structured message metadata
surface-specific compact keys
full-label fallback
tooltip/accessibility helper
graphical-state component
```

Prefer the smallest architecture consistent with repeated use.

Avoid building a universal “short translation” framework if only a few surfaces need it.

---

## Test strategy recommendation

Recommend future automated coverage for:

- compact-key completeness;
- fallback to full label;
- full accessible semantics;
- graphical state mapping;
- no color-only state;
- forced-colors rendering contracts;
- per-locale compact-label presence only where approved;
- no accidental compact label leaking into full prose;
- browser layout capacity.

Do not add tests during this audit.

---

## Native-speaker/editorial boundary

Clearly identify where native/editorial review would materially improve confidence.

Especially flag:

```text
Polish terse Solar/Wind terminology
German compact Matrix labels
French compact Matrix/Search wording
Italian compact Matrix wording
Spanish compact Matrix wording
Portuguese quality terminology
Japanese/Chinese terse technical UI where relevant
```

Do not block the audit if native review is unavailable.

Distinguish:

```text
evidence-backed candidate
model suggestion
native/editorial confirmation pending
```

---

## Durable report

Create:

```text
docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md
```

or an equally clear repository-consistent name.

The report should include:

```text
audit date
branch
scope
content taxonomy
surface inventory
Solar/Wind meter analysis
Solar/Wind heading terminology research
Matrix heading analysis
Search placeholder analysis
official-name policy
technical-token policy
accessibility requirements
forced-colors requirements
cross-locale measurements
per-surface recommendations
compact-copy candidate table
architecture recommendations
test recommendations
native/editorial review needs
implementation sequencing recommendation
limitations
```

Do not use temporary numbered parcel/task identifiers in durable documentation.

---

## Implementation sequencing recommendation

End with a proposed order for later work.

Likely separation:

```text
shared compact-label architecture
Solar/Wind graphical indicator
approved locale-specific compact copy
remaining layout-only fixes
```

But derive the actual recommendation from the audit.

Do not implement any stage.

---

## Backlog handling

This is a read-only audit.

Do not update `docs/BACKLOG.md`.

The report may recommend later backlog reconciliation after the design decisions are accepted.

---

## Scope exclusions

Do not change:

```text
translations
catalogues
reference overlays
CSS
React components
layout
accessibility runtime
tooltips
ARIA
tests
backlog
architecture docs
UX docs
```

The only tracked change should be the audit report.

---

## Verification

Run:

```text
git diff --check
```

Confirm:

- only the audit report is tracked as changed;
- no runtime/localization asset changed;
- graphical recommendations include accessibility equivalents;
- no recommendation relies on color alone;
- official names are not shortened without justification;
- no temporary planning identifiers leaked into durable docs.

No full build/test suite is required for a read-only audit unless needed to establish a fact.

---

## Stop conditions

Stop and report rather than recommending implementation if:

- a compact label cannot be supported by credible language evidence;
- graphical Solar/Wind state cannot be made unambiguous in forced colors;
- a compact-label architecture would require broad localization refactoring;
- official terminology would need unauthorized abbreviation;
- the observed defect is actually caused by layout rather than copy;
- native-language ambiguity materially affects the choice.

The audit should still complete; uncertainty should remain explicit.

---

## Expected Codex summary

Report:

1. branch used;
2. audit report path;
3. content taxonomy adopted;
4. Solar/Wind value recommendation;
5. Solar/Wind heading recommendation;
6. Polish terminology findings;
7. Matrix heading strategy;
8. Search placeholder strategy;
9. official-name policy result;
10. technical-token result;
11. accessibility requirements for compact labels;
12. accessibility/forced-colors result for graphics;
13. locales needing editorial/native confirmation;
14. per-surface recommended strategy;
15. proposed compact-label architecture;
16. recommended implementation sequence;
17. limitations/stop conditions;
18. checks run;
19. suggested commit message;
20. confirmation no runtime/localization code changed;
21. confirmation no commit or push was performed.

Suggested commit message:

`docs: audit compact localized UI`
