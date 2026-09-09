# Codex Audit Brief — Localization Inventory and Architecture

## Objective

Perform a **read-only localization inventory and architecture audit** for Starfield Outpost Network.

Do **not** implement localization yet.

Do **not** change application code, tests, reference data, or durable documentation.

The purpose of this audit is to understand the current string landscape and recommend a localization architecture that can initially support:

```text
English (UK)
English (US)
```

while remaining suitable for broader localization later.

The immediate visible motivation includes locale-sensitive terminology such as:

```text
Aluminium / Aluminum
```

but the audit must treat this as a general localization architecture problem rather than a one-off spelling substitution.

---

# PART A — READ FIRST

## 1. Read repository guidance

Read:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
docs/IMPLEMENTATION-WORKFLOW.md
```

Also inspect the relevant source areas under:

```text
src/
reference-source/
public/reference-data/
scripts/
```

Do not assume that localization infrastructure already exists.

---

# PART B — AUDIT SCOPE

## 2. Inventory all user-visible strings

Identify where user-visible text currently originates.

At minimum inspect:

```text
React JSX literals
component constants
button/label text
headings
tooltips/title text
aria-label text
modal/dialog copy
status messages
validation messages
help/micro-help text
default-generated names
history labels
import/export messages
export filenames
reference-data display names
error messages
empty states
count/ordinal labels
```

Do not simply count string literals.

Classify strings by semantic/localization role.

---

## 3. Classify string sources

Use categories at least equivalent to:

### UI chrome / static copy

Examples:

```text
Undo
Redo
Export
Import
Delete Network
Planned Supply
Cargo Pads
Validation
```

### Parameterized UI copy

Examples conceptually like:

```text
Move {name} up
Linked to {outpost}
Network {n}: Add outpost
```

### Validation / diagnostic messages

Identify both:

- fixed text;
- messages assembled from data.

### Help / tooltip text

Identify:

- explanatory micro-help;
- state tooltips;
- accessibility labels/titles.

### Generated domain-facing names

Examples:

```text
New Outpost
New Outpost (2)
```

### History labels

Examples:

```text
Add outpost
Delete cargo pad
Network 2: Add outpost
Import networks
```

### Reference-data names

At minimum inspect:

```text
resources
manufactured products
star systems
planetary bodies
biomes
species
```

### Formatting-sensitive text

Identify:

```text
dates
times
numbers
percentages
list formatting
counts
ordinal displays
```

### Invariant/non-localized strings

Identify candidates that should probably remain stable, such as:

```text
IDs
FormIDs
schema keys
resource abbreviations
chemical symbols
file extensions
internal action/rule identifiers
```

Do not assume every proper noun is localizable.

---

# PART C — REFERENCE-DATA LOCALIZATION

## 4. Audit reference-data display-name ownership

This is a major focus.

Determine how current runtime reference data gets names for:

```text
resources
products
systems
bodies
biomes
species
```

Trace the path from source files through build scripts into runtime JSON and UI presentation.

For each category, report:

- canonical identity field;
- current display-name source;
- whether names are duplicated across generated files;
- whether names are consumed directly by UI;
- whether there is already alias/crosswalk logic;
- whether locale-specific naming could be overlaid without changing stable IDs.

---

## 5. Examine Aluminium / Aluminum specifically

Trace the current `Aluminium`/`Aluminum` data flow end-to-end.

Determine:

- where the canonical resource identity is defined;
- where the current display name is defined;
- whether aliases already exist;
- how the UI resolves the displayed name;
- whether changing display name by locale could be done without changing IDs or resource matching;
- whether any validation/help/history/export logic embeds the current spelling directly.

Do not implement the fix.

Use this as the primary proof case for reference-data localization.

---

## 6. Recommend reference-name architecture

Compare plausible models such as:

### Model A — localized fields in reference records

Conceptually:

```ts
{
  id: "aluminium",
  names: {
    "en-GB": "Aluminium",
    "en-US": "Aluminum"
  }
}
```

### Model B — canonical reference records + locale overlay catalogue

Conceptually:

```text
canonical reference data
        +
locale-specific display-name catalogue
```

### Model C — generated per-locale runtime reference data

Conceptually:

```text
reference source
    ↓
build en-GB
build en-US
```

You may identify other approaches.

For each, assess:

- source-of-truth clarity;
- duplication;
- build complexity;
- runtime complexity;
- fallback behavior;
- compatibility with current reference-data pipeline;
- future support for non-English locales;
- risk of accidentally localizing stable identity;
- testability.

Recommend one.

---

# PART D — UI STRING ARCHITECTURE

## 7. Inventory literal UI text

Identify where user-visible strings are embedded directly in:

```text
tsx/jsx
ts constants
domain functions
data functions
validation rules
layout components
status/error handlers
```

Report the main concentration points.

Do not produce a useless exhaustive dump of every one-word label unless grouped meaningfully.

Prefer a categorized map with representative examples and approximate scope.

---

## 8. Identify string-concatenation trouble spots

Find user-visible messages assembled through:

```text
template literals
string concatenation
array join
conditional fragments
```

Flag cases that may be difficult to localize because word order is currently baked into code.

Examples conceptually:

```ts
`${pad.label}: linked to ${outpost.name}`
`${name} is unavailable`
`Network ${ordinal}: ${action}`
```

Distinguish:

- safe parameterized templates;
- fragment-based assembly that should be refactored before broader localization.

---

## 9. Assess validation architecture for localization

Determine how validation messages are currently produced.

Report whether validation rules return:

```text
final human-readable strings
message keys + params
structured issue metadata
mixed approaches
```

Recommend how localized validation should work.

Prefer preserving:

- stable rule IDs;
- structured issue context;
- domain/presentation separation.

Assess whether message generation should remain in domain code or move to presentation/localization resolution.

Do not change validators.

---

## 10. Assess accessibility strings

Audit:

```text
aria-label
title
screen-reader-only text
button accessible names
dialog labels
```

Determine whether these should use the same localization mechanism as visible UI copy.

Flag any cases where visible text and accessible text duplicate the same concept but are maintained separately.

Do not perform the accessibility audit itself; this is only localization ownership.

---

# PART E — GENERATED TEXT

## 11. Default-generated names

Audit generated labels/names such as:

```text
New Outpost
New Outpost (2)
```

Determine:

- where generation occurs;
- whether the generated string is persisted;
- implications of changing locale after creation;
- whether historical persisted names should remain as originally generated or be re-resolved dynamically.

This is an important product/architecture question.

Recommend a policy.

Do not assume generated persisted names should automatically change when locale changes.

---

## 12. History labels

Audit current history label creation.

Determine:

- where labels are generated;
- whether stored history entries contain final display strings;
- implications of changing locale mid-session;
- whether history should store:
  - final localized text;
  - stable action key + params;
  - a hybrid.

Assess complexity versus benefit.

The current global contextual history architecture must remain intact.

---

## 13. Status and transient messages

Audit application status/success/error messages.

Identify whether they are:

```text
hardcoded
constructed dynamically
returned from data helpers
derived from exceptions
```

Recommend ownership and localization boundaries.

---

# PART F — LOCALE-SENSITIVE FORMATTING

## 14. Inventory formatting

Search for user-facing:

```text
Date
Intl
toLocaleString
toLocaleDateString
toLocaleTimeString
number formatting
percentage formatting
manual timestamp formatting
list formatting
```

Report:

- what currently exists;
- what is user-facing;
- what is file-format/internal only.

Do not assume export filenames must be localized.

---

## 15. Separate display formatting from invariant formats

Explicitly distinguish:

### User-facing display formatting

Potentially locale-sensitive.

### Persisted/schema/file formats

Should remain stable/invariant unless explicitly redesigned.

Examples:

```text
JSON keys
schema versions
ISO-like timestamps
export filename conventions
stable IDs
```

Recommend where locale formatting should and should not be applied.

---

# PART G — LOCALE SELECTION AND OWNERSHIP

## 16. Audit current settings/preferences architecture

Determine whether the app currently has:

```text
application preferences
localStorage-backed UI preferences
settings dialog
browser-derived settings
session-only preferences
```

Assess where a locale preference should belong.

Important distinction:

> Locale is application preference, not gameplay/network state.

Do not add locale to `OutpostNetwork` or `NetworkCollection` unless the audit finds a compelling reason.

---

## 17. Compare locale selection models

Assess at least:

### Browser-only

```text
navigator.language
```

### Explicit user setting only

### Browser default + explicit override

For each, consider:

- first-run behavior;
- persistence;
- predictability;
- user control;
- testing;
- public-release suitability.

Recommend one.

Initial locales are:

```text
en-GB
en-US
```

Do not assume broader language UI is required immediately.

---

# PART H — LIBRARY / IMPLEMENTATION STRATEGY

## 18. Assess whether a localization library is necessary

Compare:

### Lightweight in-house string resolver

versus

### Existing localization library

Do not add a dependency.

Assess based on actual app needs:

- two initial English locales;
- parameterized strings;
- future non-English support;
- validation messages;
- reference-data names;
- fallback;
- testing;
- bundle/runtime cost;
- maintenance burden.

If recommending a library, name suitable options and explain why.

If recommending no library initially, explain what minimum abstraction is needed to avoid dead-end architecture.

---

## 19. Recommend catalogue organization

Propose a maintainable structure for localized strings.

Examples may include:

```text
src/localization/
src/i18n/
public/locales/
```

Possible catalogue grouping:

```text
common
navigation
network
cargo
validation
help
reference names
```

Do not prescribe excessive fragmentation.

Recommend:

- key naming;
- fallback behavior;
- parameter interpolation;
- typed access if appropriate;
- testing approach.

---

# PART I — MIGRATION / ROLLOUT STRATEGY

## 20. Do not assume one giant conversion

Recommend a staged implementation path.

A likely sequence might be:

```text
1. locale infrastructure
2. locale selection/persistence
3. ordinary UI strings
4. validation/help/status strings
5. reference-data names
6. generated labels/history
7. broader audit cleanup
```

But do not lock this sequence without inspecting the repository.

Recommend the safest order based on actual dependencies.

---

## 21. Identify proof cases for first implementation

At minimum assess these representative proof cases:

```text
Aluminium / Aluminum
Delete Network
one parameterized validation message
New Outpost / New Outpost (2)
one tooltip/help string
```

Explain why each is useful.

Suggest replacements only if another existing string is a better architectural proof case.

---

# PART J — OUTPUT FORMAT

## 22. Produce a structured audit report

The final audit should include:

### Executive summary

- current localization readiness;
- main architectural risks;
- recommended direction.

### String-source inventory

A categorized table such as:

| Category | Representative examples | Current source | Recommended owner |
|---|---|---|---|

### Reference-data name audit

Include `Aluminium`/`Aluminum` trace.

### Parameterized/generated string audit

Highlight difficult assembly patterns.

### Validation/localization audit

### Locale-sensitive formatting audit

### Locale preference/storage audit

### Architecture options

Compare alternatives with pros/cons.

### Recommended target architecture

Include conceptual flow diagrams where useful.

### Migration plan

Provide staged implementation order.

### Proof cases

### Risks and edge cases

### File-by-file implementation impact

List likely files/modules to add/change later.

### Direct answers

Answer the questions in Part K explicitly.

---

# PART K — QUESTIONS TO ANSWER

## 23. Direct architecture questions

Answer all of these:

1. What are the major categories of user-visible strings in the current app?
2. Where are they currently concentrated?
3. Which strings belong in a UI localization catalogue?
4. Which strings should remain invariant?
5. How should reference-data display names be localized?
6. Where exactly does `Aluminium` currently originate?
7. Should canonical reference identity remain locale-neutral?
8. Should validation rules emit final strings or structured message keys/params?
9. How should accessible names/tooltips participate in localization?
10. How should generated persisted names such as `New Outpost` behave after locale changes?
11. Should history store localized final labels or stable action keys/params?
12. Which current string-concatenation patterns are localization hazards?
13. What locale-sensitive date/number/list formatting currently exists?
14. Where should locale preference live?
15. Browser-only, explicit-only, or browser-default-with-override?
16. Is a third-party localization library justified now?
17. What catalogue/module structure is recommended?
18. What fallback behavior should be used?
19. What is the safest staged implementation sequence?
20. Which proof cases should the first implementation cover?
21. What are the highest-risk files/areas for localization regressions?
22. What should explicitly remain out of scope for the first localization implementation?

---

# PART L — OUT OF SCOPE

## 24. Do not implement

Do not:

```text
add locale selectors
add localization dependencies
replace UI strings
change reference-data schemas
change CSVs
change generated JSON
change validation messages
rename Aluminium/Aluminum
modify history labels
change export filenames
add translation files
change browser storage
update docs
commit
push
```

This is an audit only.

---

# PART M — VERIFICATION

## 25. Repository cleanliness

At the end, run:

```text
git diff --check
git status --short
```

Expected result:

- no source/document changes from the audit;
- only any supplied audit brief/report artifact may appear untracked if created locally.

Do not commit or push.

---

# PART N — FINAL INSTRUCTION

The audit should optimize for a localization architecture that is:

```text
simple enough for en-GB + en-US now
not a dead end for broader languages later
compatible with stable reference-data identity
compatible with current validation/history architecture
testable
incrementally adoptable
```

The desired outcome is:

> **A clear map of every major source of user-visible text, a sound ownership model for UI strings versus reference-data names, and a staged localization architecture that can resolve Aluminium/Aluminum correctly without contaminating stable domain identity.**
