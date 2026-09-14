# CODEX IMPLEMENTATION BRIEF — Accessibility Slice 3: Forms and Compact Surface Semantics

## Purpose

Implement the third accessibility correction slice from the completed whole-product accessibility audit.

This slice covers:

- **A11Y-04 — Character numeric fields provide no understandable invalid-entry feedback**
- **A11Y-06 — Collapsed Cargo Links summaries lack concise semantic summaries**
- **A11Y-08 — Validation trigger/panel relationship is incomplete**
- **A11Y-09 — Search submit button can be enabled while doing nothing**

Do **not** implement unrelated visual cleanup from Slice 2 in this pass.

Do **not** commit or push.

---

# Important product constraint — optional user-entry fields

Character name, level, and skills are optional user-entered metadata.

Do not turn these fields into validator-driven required forms.

The purpose of this slice is to make invalid numeric entry understandable, not to force completion.

Guidance must remain lightweight.

Avoid:

- intrusive warnings;
- modal validation;
- blocking unrelated actions;
- persistent error banners;
- validation-summary integration;
- treating omitted values as errors;
- marking untouched optional fields invalid;
- generating history noise for invalid drafts.

The app-wide Validation system is for network/domain validation and should remain separate.

---

# Scope classification

**Local / medium cross-cutting implementation.**

This slice touches four small interaction surfaces but should not alter core architecture.

Expected areas:

- CharacterHeader numeric editing;
- collapsed Cargo Link summaries;
- Validation trigger/panel semantics;
- Search submit behavior;
- localization catalogue/tests where new guidance text is required.

---

# Part 1 — Character numeric fields: lightweight invalid-entry guidance

## Current defect

Character level and skill-rank fields accept free-form draft text.

Current valid ranges are:

```text
Character level: 1–999
Skill rank:      0–4
```

If the draft is invalid, the current behavior silently restores the previous value on blur.

This is difficult to understand nonvisually and gives no explanation of the accepted range.

The labels themselves are already adequate.

---

## Required UX

Preserve these fields as **optional, lightweight metadata**.

A blank field is not an accessibility error merely because the user chooses not to enter data.

The preferred interaction model is:

```text
user enters draft
-> draft remains visible while editing
-> invalid draft is marked/announced locally
-> concise range guidance is available
-> only a valid value is committed
```

Do not make invalid keystrokes generate history entries.

Preserve the current one-history-entry-on-valid-commit behavior.

---

## Required semantics

For a non-empty invalid numeric draft:

- expose `aria-invalid="true"` or equivalent native/programmatic invalid state;
- associate concise localized guidance/error text with the field;
- make the allowed range understandable;
- ensure screen readers can discover the message;
- keep the response local to the field.

For a valid draft:

- clear invalid state;
- commit according to existing behavior;
- preserve one history entry per committed change.

For an optional blank/omitted value:

- do not announce an error solely because the field is empty;
- preserve existing product semantics for omission.

If current domain/state representation does not permit a truly blank committed level/rank, do not redesign the data model in this slice. The accessibility requirement applies to the editing interaction, not to domain schema changes.

---

## Error presentation

Use the lightest presentation that is still understandable.

Suitable options include:

- compact inline hint below/adjacent to the field;
- visually modest associated helper/error text;
- existing description area if one is already structurally suitable.

Avoid turning the header into a form-validation panel.

Example meaning, not mandated wording:

```text
Enter a level from 1 to 999.
Enter a rank from 0 to 4.
```

All wording must be localized.

---

## Commit/recovery behavior

Do not silently discard an invalid draft without explanation.

Choose a clear, low-friction recovery model consistent with the existing component.

Acceptable patterns include:

### Pattern A — retain invalid draft

Keep the invalid draft visible and uncommitted until corrected.

### Pattern B — explain, then restore on blur

If preserving the current restore-on-blur behavior is important, expose the invalid state/message before restoration and ensure the user can understand why the value was rejected.

Prefer Pattern A if it can be implemented cleanly without creating awkward stale drafts.

Do not redesign unrelated character-editing behavior.

---

# Part 2 — Collapsed Cargo Links semantic summary

## Current defect

Collapsed Cargo summaries visually concatenate destination and abbreviations.

A screen-reader user may effectively hear something like:

```text
Feynman I Li Cu xF4 — —
```

The individual abbreviations are not individually focusable, which is good, but the collapsed summary lacks one coherent semantic description.

Do **not** make every abbreviation a Tab stop.

---

## Required behavior

Keep the compact visual summary.

Add one concise localized semantic summary associated with the collapsed disclosure/card.

It should communicate, where applicable:

```text
destination
outbound items
inbound items
Inter-System state
```

Use full localized item names rather than abbreviations in the semantic summary.

Example conceptually:

```text
Destination Feynman I. Outbound: Lithium, Copper, Tetrafluorides. No inbound cargo. Standard Cargo Link.
```

Exact wording should fit the existing localization style.

For an Inter-System link, expose the Inter-System state appropriately.

Do not duplicate already-associated fuel/stale descriptions unnecessarily.

---

## Association

Prefer associating the summary with the existing disclosure control/card through:

- `aria-describedby`;
- a concise visually hidden summary;
- another simple semantic relationship.

Do not add:

- one focusable element per abbreviation;
- artificial listbox/grid semantics;
- redundant live announcements.

Expanding the existing disclosure remains the editing path.

---

# Part 3 — Validation trigger/panel relationship

## Current defect

The Validation trigger exposes expanded state but does not explicitly reference its panel.

The panel itself is a generic positioned container.

The internal Validation interaction model is otherwise sound.

---

## Required correction

Add a stable trigger-to-panel relationship.

Preferred structure:

```text
trigger
  aria-expanded
  aria-controls="<stable-panel-id>"

open panel
  id="<stable-panel-id>"
  labelled region semantics where appropriate
```

The panel should have an accessible name through existing localized Validation text.

Use a region only if it improves navigation without adding unnecessary landmark noise.

---

## Preserve existing behavior

Do not alter:

- roving issue focus;
- severity semantics;
- issue ordering;
- Escape behavior;
- global Validation shortcut;
- activation/remediation behavior;
- aggregate counts;
- non-modal interaction model.

This is a semantic relationship fix only.

---

# Part 4 — Search submit behavior must be deterministic

## Current defect

The Search button is currently enabled but only submits when there is exactly one match.

With zero or multiple matches, clicking the button can silently do nothing.

Keyboard Enter already behaves differently by submitting the highlighted option.

This creates inconsistent pointer/keyboard behavior.

---

## Required behavior

Use one deterministic submission rule across pointer and keyboard interaction.

Preferred rule:

```text
if a highlighted active option exists:
    submit it
else if exactly one result exists:
    submit that result
else:
    no deterministic submission is available
```

When no deterministic submission is available, the Search button should be disabled rather than appearing actionable and doing nothing.

---

## Expected cases

### Zero matches

```text
Search button disabled
```

No no-op click.

### Exactly one match

```text
Search button enabled
submit that result
```

### Multiple matches with a highlighted active option

```text
Search button enabled
submit highlighted option
```

### Multiple matches without a deterministic active option

```text
Search button disabled
```

If the current search model always has a highlighted option when multiple results are available, reuse that model rather than inventing new selection state.

Pointer button activation and keyboard Enter should resolve through the same submission helper where practical.

---

# Part 5 — Search accessibility semantics

When the Search button is disabled:

- use native disabled semantics where possible;
- do not leave an `aria-disabled` pseudo-button clickable;
- preserve combobox/listbox semantics;
- preserve arrow navigation;
- preserve Search Results focus hand-off;
- preserve Escape behavior;
- preserve canonical English alias search;
- preserve localized display names.

Do not implement broader Search UX changes.

---

# Part 6 — Localization

Any new guidance or semantic summary text must use the localization layer.

Likely new strings may include:

- character level range guidance;
- skill rank range guidance;
- collapsed Cargo semantic summary fragments/templates.

Requirements:

- exact key parity in full supported locales;
- Japanese translation included;
- `en-GB` remains sparse unless a genuine override is needed;
- placeholders must be explicit and stable;
- no hard-coded English ARIA/help strings.

Do not manually translate official Starfield reference names in semantic templates; resolve full localized item/entity names through the existing reference-name layer.

---

# Part 7 — Component regression coverage

Add focused rendered tests.

## Character numeric entry

Cover at least:

```text
valid level commit
invalid level draft
valid rank commit
invalid rank draft
optional/blank behavior as supported by current model
```

Verify:

- invalid state is programmatically exposed;
- associated guidance is present;
- invalid drafts do not create committed history changes;
- valid correction clears invalid state;
- valid commit preserves existing history semantics.

Do not test only internal helper functions if the rendered behavior can be tested cheaply.

---

## Collapsed Cargo summary

Verify:

- collapsed disclosure/card has one coherent semantic summary;
- full localized item names appear in the semantic description;
- destination appears;
- outbound/inbound absence/presence is represented correctly;
- Inter-System state is represented;
- abbreviations do not become sequential Tab stops.

Include at least one representative standard link and one Inter-System case if practical.

---

## Validation

Verify:

- trigger has `aria-expanded`;
- trigger has `aria-controls`;
- `aria-controls` references the actual panel ID;
- panel has appropriate accessible naming/region semantics when open;
- existing roving-focus behavior remains intact.

---

## Search

Test button activation with:

```text
zero matches
one match
multiple matches with highlighted option
multiple matches without deterministic option, if representable
```

Verify pointer button and keyboard Enter resolve consistently.

Preserve existing Search Results focus-restoration tests.

---

# Part 8 — Do not trespass into validator territory

This is important.

Do not route Character Header numeric-entry feedback into the application's Validation panel.

Do not create new validation issues such as:

```text
Character level missing
Skill rank missing
Character name missing
```

Do not require character metadata for network validity.

Do not create red/error states merely because optional metadata has not been supplied.

Only respond to an **actively entered invalid numeric value**.

The distinction is:

```text
missing optional metadata -> acceptable
invalid typed numeric draft -> explain locally
invalid network/domain state -> Validation system
```

Keep those concerns separate.

---

# Part 9 — Slice 2 visual cleanup remains deferred

The user has intentionally deferred visual cleanup discovered after Slice 2.

Known deferred items include:

- enlarged Context Help target disturbing Outpost Details alignment;
- Context Help target appearing oversized in Resource Matrix headings;
- X-Tech compact action alignment relative to Matrix buttons.

Do **not** fix these in Slice 3.

Do not shrink hit targets to restore visual alignment.

These will be addressed in a dedicated post-Slice-3 visual integration cleanup that must preserve accessibility gains.

---

# Manual verification policy

The user is deferring the full accessibility manual checklist until after Slice 3 and the subsequent visual integration cleanup.

Therefore:

## Required now

Perform only targeted browser/runtime sanity checks:

- invalid numeric draft feedback appears lightweight and local;
- optional fields do not look required;
- collapsed Cargo visual layout is unchanged;
- semantic Cargo summary does not add visible clutter;
- Validation panel still behaves normally;
- Search button states/actions make visual and behavioral sense.

## Deferred

Do not require full:

- Narrator pass;
- forced-colors pass;
- true zoom matrix;
- complete keyboard traversal;
- touch-comfort pass.

Those occur after visual cleanup.

---

# Explicit non-goals

Do **not** implement:

- Slice 2 visual alignment cleanup;
- additional Resource Matrix changes;
- new forced-colors work beyond regression fixes;
- pointer target resizing beyond regression fixes;
- responsive workspace changes;
- axe-core/jest-axe;
- Playwright infrastructure;
- Safari/WebKit;
- mobile support;
- new Validation rules for optional character metadata;
- persistence schema changes;
- character metadata data-model redesign;
- reference/provenance changes.

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

Run any existing relevant browser/runtime smoke checks.

---

# Acceptance criteria

This slice is complete when:

1. actively entered invalid Character Level values receive concise local guidance;
2. actively entered invalid skill-rank values receive concise local guidance;
3. invalid numeric fields expose programmatic invalid state;
4. omitted optional metadata is not treated as an error;
5. invalid drafts do not create history entries;
6. valid commits preserve existing one-history-entry behavior;
7. Character Header feedback remains separate from the network Validation system;
8. collapsed Cargo Links expose one concise localized semantic summary;
9. Cargo abbreviations do not become individual Tab stops;
10. full localized item names are used in the semantic Cargo summary;
11. Validation trigger has a stable relationship to its panel;
12. existing Validation focus/navigation behavior does not change;
13. Search button behavior is deterministic;
14. Search pointer submission and keyboard Enter use equivalent selection logic;
15. Search button is disabled when no deterministic submission is available;
16. existing Search focus hand-off/restoration remains intact;
17. focused component tests are added/updated;
18. all localization parity/verifier checks pass;
19. no Slice 2 visual cleanup is implemented;
20. no commit or push is performed.

---

# Final Codex report

Report:

- files changed;
- Character Level invalid-entry behavior;
- skill-rank invalid-entry behavior;
- how optional/blank fields are treated;
- how history semantics were preserved;
- new localization keys/messages;
- collapsed Cargo summary structure and sample semantic output;
- Validation trigger/panel relationship;
- Search submission rule for zero/one/multiple matches;
- tests added/updated;
- browser/runtime sanity checks performed;
- full verification results;
- manual checks explicitly deferred;
- confirmation that Slice 2 visual cleanup was not touched;
- confirmation that no commit or push was performed.
