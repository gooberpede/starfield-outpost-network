# CODEX AUDIT BRIEF — Per-Locale Resource Matrix Heading Editorial Review

## Objective

Perform a **read-only per-locale editorial and layout audit** of the Resource Matrix column headings.

The goal is to determine, for each supported locale and for each Matrix heading, whether the current visible label should:

1. remain unchanged;
2. use a shorter locale-authored compact label;
3. use a different terse noun/state term;
4. retain the full label and rely on layout/geometry correction;
5. remain unresolved pending stronger language evidence.

This audit must be **locale-specific**.

Do not assume that one compact-label pattern works across French, German, Italian, Polish, Portuguese, Spanish, Japanese, or Simplified Chinese.

Do not implement translations, CSS, layout, catalogue changes, or tests.

The only tracked repository change permitted is the new durable audit report.

---

# 1. Core editorial principle

The Resource Matrix headings are compact technical UI labels.

They should preserve the semantic meaning of the underlying Matrix column without necessarily being literal translations of the current English surface string.

The correct question for each locale is:

> What is the shortest natural heading a fluent speaker would understand in this table/state context without losing the intended meaning?

Do not ask:

> What is the shortest literal translation of the English word?

The row structure, toggle controls, help affordances, and surrounding Resource Matrix context may allow a language to use a terse noun or conventional state label safely.

That determination must be made **per locale and per heading**.

---

# 2. Headings in scope

Audit the full Matrix heading set, not only the currently problematic labels:

```text
Item
Source
Present
Producing
Inputs
Logistics
```

Even if `Item` or `Source` already fit, include them so the resulting vocabulary is coherent.

---

# 3. Semantic meanings that must be preserved

Use these product meanings as the semantic contract.

## Item

The resource/product/item represented by the row.

Do not accidentally narrow this to only:

```text
resource
material
product
```

because the Matrix contains multiple item classes.

---

## Source

The source/origin of the item or production route.

Do not reduce this to a term that implies only:

```text
planetary source
supplier
vendor
input source
```

if that would be narrower than the actual Matrix semantics.

---

## Present

Means:

> the item/resource exists or is recorded as present at this outpost/body.

This is a state, not a command.

Avoid terms equivalent to:

```text
show
display
available for purchase
current
present tense
```

unless clearly idiomatic in the Matrix context.

---

## Producing

Means:

> this outpost is currently configured to produce the resource/product.

It is an active production state.

Do not collapse it into:

```text
possible to produce
manufacturing category
production generally
producer
```

unless the row/toggle context makes the intended state unambiguous.

---

## Inputs

Means:

> materials required for production/farming.

Do not reduce the meaning to arbitrary input/data-entry concepts.

Do not omit “required” if doing so creates ambiguity about whether the column shows:

```text
all materials
actual consumed materials
available materials
form inputs
```

---

## Logistics

Means:

> actual configured routed logistics/import/export state.

Do not replace it with a term that means only:

```text
transport
shipping
availability
distribution generally
```

if configured routing would no longer be clear.

---

# 4. Locales in scope

Audit all runtime locales:

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

English provides the current baseline but is not automatically the ideal semantic model for compact phrasing in other languages.

Japanese and Simplified Chinese should still be reviewed even if current strings fit, to confirm no hidden semantic awkwardness.

---

# 5. Existing localization sources to inspect

Inspect at minimum:

```text
src/localization/locales/en-US.ts
src/localization/locales/en-GB.ts
src/localization/locales/fr-FR.ts
src/localization/locales/de-DE.ts
src/localization/locales/it-IT.ts
src/localization/locales/ja-JP.ts
src/localization/locales/pl-PL.ts
src/localization/locales/pt-BR.ts
src/localization/locales/es-ES.ts
src/localization/locales/zh-Hans.ts
docs/localization/
docs/audits/CROSS-LOCALE-COMPACT-COPY-AND-VISUAL-STATE-REVIEW.md
docs/audits/CROSS-LOCALE-COMPACT-LAYOUT-CAPACITY-REVIEW.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
```

Use current accepted catalogue strings as the starting point.

Do not silently replace accepted terminology with model intuition.

---

# 6. External research is required

Perform an external research pass for every locale where a compact replacement is considered.

Use current public sources.

DeepL is **not** evidence for this audit.

Do not use machine translation output as authority for compact heading decisions.

---

# 7. Preferred external evidence

Prefer evidence from:

```text
government reports
national statistics agencies
energy/manufacturing/logistics agencies
industry associations
technical dashboards
official business/industrial software
public-sector data portals
engineering reports
slide presentations
tables/charts used by professional organizations
standards-oriented glossaries
```

The most useful evidence is compact usage in:

```text
table headings
dashboard headings
chart labels
technical column headers
industrial UI
data portals
```

because the Resource Matrix is itself a dense technical table.

---

# 8. Secondary evidence

If strong government/industry evidence is unavailable, use:

```text
major professional publications
established enterprise software
technical university material
industry conference material
recognized dictionaries/style guides
```

Clearly label weaker evidence.

Do not rely on:

```text
SEO translation sites
random blogs
machine-translation aggregators
unsourced vocabulary lists
forum guesses
```

as primary authority.

---

# 9. Research strategy by semantic concept

For each locale, research how professional users tersely label concepts analogous to:

```text
item / material / product
source / origin
present / available / existing
production / producing / active production
inputs / required materials / components
logistics / routing / distribution
```

Do not search only literal English equivalents.

Also search likely domain forms such as:

```text
manufacturing dashboards
inventory tables
production status tables
resource management tables
supply-chain dashboards
industrial process tables
ERP terminology
```

The aim is to discover **idiomatic compact UI vocabulary**, not merely dictionary translations.

---

# 10. Evidence record per proposed compact label

For each candidate, record:

```text
locale
Matrix concept
current full label
candidate compact label
literal meaning
usage/context found externally
source URL/title
source type
why the evidence is relevant
ambiguity risk
whether row/toggle context resolves omitted grammar
confidence
native/editorial confirmation needed?
```

Do not approve a candidate without showing why it preserves the Matrix meaning.

---

# 11. Distinguish noun labels from state labels

A key question is whether a compact noun can safely stand in for a state phrase.

Example pattern:

```text
In Produktion
→ Produktion
```

This may be acceptable in a state column because:

- the column consists of state controls;
- the row identifies the item;
- the toggle itself expresses active/inactive state.

But this must be evaluated in the target language.

For every Producing candidate, explicitly answer:

> Does the noun form still read naturally as “currently producing here” in this table context, or does it become merely the name of the activity/category?

Do not assume the answer is the same across languages.

---

# 12. Inputs is especially high risk

Treat the Inputs column conservatively.

The full concept is closer to:

```text
required inputs
required materials
production inputs
recipe requirements
```

A shorter word meaning only “materials” may be too broad.

For every locale, research terse professional table headings for:

```text
required materials
components
inputs
requirements
bill-of-material-like contexts
```

Approve a shorter term only if the table context preserves “required for production.”

If not, recommend geometry rather than semantic weakening.

---

# 13. Logistics is also context-sensitive

Research whether the current translation is already the most natural compact technical label.

Potential compact terms may exist, but avoid replacing configured logistics with a term that implies only:

```text
shipping
transport
delivery
distribution
```

without routing/configuration context.

If the current one-word equivalent of “Logistics” is already concise and idiomatic, leave it unchanged.

---

# 14. Item and Source coherence

Review `Item` and `Source` even if they fit.

Questions:

- Is the current term broad enough for all row types?
- Is it idiomatic in a technical table?
- Does it pair naturally with the other candidate headings?
- Would changing only other columns create an odd mixture of grammatical styles?

Do not change working headings merely for symmetry.

---

# 15. Fit is necessary but not sufficient

For each candidate, measure whether it fits the current Matrix geometry.

At minimum inspect:

```text
1366×768
1600×900
```

Use true 200% zoom if available; otherwise preserve existing manual evidence and clearly label any simulation.

Record:

```text
rendered width
line count
header row height
help-icon interaction/overlap
available column width
```

But do not approve a candidate merely because it fits.

Semantic/editorial suitability comes first.

---

# 16. Current known pressure to revisit

Recheck the current evidence:

```text
French Producing wraps
German Producing wraps
German Inputs overpressures the narrow column
Italian Producing wraps
Italian Inputs wraps at 1366
Polish Inputs wraps
Portuguese Producing is unstable around a fractional threshold
Spanish Producing wraps
Spanish Inputs reaches three lines at 1366
```

Do not assume compact copy is the answer to all of them.

---

# 17. Full semantic fallback

For every approved compact visible heading, retain the full current semantic phrase for:

```text
accessible column name
help text
tooltip/context help where applicable
documentation
```

The visible compact heading and accessible/full semantic heading may intentionally differ.

Do not allow compact wording to leak into unrelated prose or validation.

---

# 18. Accessibility requirements

Any compact heading must:

- remain understandable visually in its Matrix context;
- expose the full localized semantic meaning to assistive technology where the compact form is not semantically complete;
- preserve existing help affordances;
- not rely on color;
- not remove current accessible names/descriptions.

If the heading uses a terse noun, document the full accessible phrase explicitly.

---

# 19. Recommended outcome categories

For each locale + heading choose one:

```text
A. Keep current label
B. Approve compact locale-specific label
C. Geometry/layout correction preferred
D. Compact candidate plausible but native/editorial confirmation required
E. More external language evidence required
```

Do not force every locale into category B.

---

# 20. Per-locale decision table

The report must include a matrix broadly like:

| Locale | Item | Source | Present | Producing | Inputs | Logistics |
| --- | --- | --- | --- | --- | --- | --- |
| fr-FR | A | A | ... | B/D | C | A |
| de-DE | ... | ... | ... | ... | ... | ... |

Each cell should link to or summarize the evidence/rationale.

---

# 21. Candidate register

Include a detailed register such as:

| Locale | Concept | Current label | Candidate | Outcome | Evidence | Semantic risk | Fit result | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

This should become the editorial basis for a later implementation brief.

---

# 22. Native/editorial review boundary

For each candidate classify:

```text
high confidence / evidence-backed
medium confidence / editorial confirmation desirable
low confidence / do not implement without native review
```

Do not use “native review required” mechanically.

If external professional usage plus strong table context makes a candidate well supported, it may be recommended without making native review a hard blocker.

Conversely, weak evidence or meaningful semantic ambiguity should remain unresolved.

---

# 23. DeepL exclusion

Do not:

```text
send candidates through DeepL
use DeepL shortening as evidence
compare DeepL outputs
treat translation-engine preference as editorial validation
```

This task is about **idiomatic compact terminology in context**, not translation adjudication.

---

# 24. Geometry recommendations

If compact copy is not sufficiently supported, recommend the minimum geometry contract needed.

Examples:

```text
controlled two-line heading
wider Inputs column
different column balance
help-icon placement contract
stable maximum header height
```

Do not implement it.

Do not recommend arbitrary font shrinking unless strongly justified.

---

# 25. Avoid one-off language CSS

Do not recommend:

```text
German-only font-size reduction
Spanish-only column width
French-only transform
```

unless there is an extraordinary language-specific typographic reason.

Prefer:

```text
locale-authored copy
shared geometry contract
```

---

# 26. Durable report

Create:

```text
docs/audits/RESOURCE-MATRIX-HEADING-EDITORIAL-REVIEW.md
```

or an equally clear repository-consistent filename.

The report should include:

```text
audit date
branch
scope
semantic contract
research methodology
source-quality hierarchy
current labels
per-locale research
per-locale decision table
candidate register
layout measurements
accessibility/full-label contract
native/editorial confidence
geometry recommendations
implementation recommendations
limitations
```

Do not use temporary numbered parcel/task identifiers in durable documentation.

---

# 27. Implementation recommendation

End with a clear recommendation for a later implementation brief.

Possible outcomes:

```text
compact-copy implementation for approved labels
shared Matrix geometry correction
both, in a defined order
geometry only
more editorial research first
```

If mixed, specify exactly which locale/heading pairs are approved for compact copy and which remain geometry problems.

Do not implement anything during the audit.

---

# 28. Backlog handling

This is read-only.

Do not modify:

```text
docs/BACKLOG.md
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
localization catalogues
CSS
components
tests
```

The only tracked change should be the audit report.

---

# 29. Verification

Run:

```text
git diff --check
```

Confirm:

- only the audit report is tracked as changed;
- no localization/runtime file changed;
- every approved compact candidate has external evidence;
- semantic risk is recorded;
- full accessibility meaning is preserved in the recommendation;
- no DeepL evidence was used;
- no temporary task identifiers leaked into durable documentation.

No full build/test suite is required for the read-only audit unless needed to establish a repository/runtime fact.

---

# 30. Stop conditions

Stop and report rather than approving a compact candidate if:

- external evidence is weak or contradictory;
- candidate meaning materially diverges from the Matrix semantic contract;
- candidate only fits by becoming cryptic;
- candidate is plausible in prose but unnatural as a table heading;
- compact noun loses the active-state meaning of Producing;
- Inputs loses the “required” concept;
- Logistics loses configured-routing meaning;
- official terminology would be altered without authority.

The audit should still complete; unresolved entries should remain unresolved.

---

# 31. Expected Codex summary

Report:

1. branch used;
2. audit report path;
3. research sources/types used;
4. approved compact labels by locale/concept;
5. labels left unchanged;
6. labels requiring geometry rather than copy;
7. candidates requiring native/editorial confirmation;
8. unresolved candidates;
9. Producing noun findings by locale;
10. Inputs findings by locale;
11. Logistics findings by locale;
12. accessibility/full-label recommendations;
13. layout measurements;
14. recommended implementation sequence;
15. limitations/stop conditions;
16. checks run;
17. suggested commit message;
18. confirmation no localization/runtime code changed;
19. confirmation no commit or push was performed.

Suggested commit message:

`docs: audit Resource Matrix headings`
