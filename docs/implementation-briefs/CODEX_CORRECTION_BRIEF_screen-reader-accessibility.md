# Codex Correction Brief — Screen-Reader Accessibility Pass

## Purpose

Implement a narrowly scoped screen-reader correction pass for the Starfield Outpost Network tracker.

This is a **regression-sensitive accessibility correction**, not a general accessibility refactor.

The product has already undergone multiple accessibility correction rounds, including responsive reflow, Matrix semantics, character-field announcements, forced-colors work, compact-control target sizing, and Manufacturing-row fixes. Several of those areas required substantial manual correction after otherwise well-intentioned changes.

For this pass, prefer **no change plus a clear diagnosis** over a speculative change that risks reopening already-fixed defects.

If a finding cannot be corrected confidently without changing validated interaction or layout behavior, leave the code unchanged and report why.

---

## Scope classification

**Medium cross-cutting / regression-sensitive.**

Expected work spans several UI surfaces and accessibility semantics, but should remain local to the specific findings listed below.

Do **not** broaden the pass into generic ARIA cleanup, CSS cleanup, component restructuring, or accessibility modernization.

---

## Hard regression guardrails

Treat the following as effectively frozen unless a specific screen-reader defect below absolutely requires touching them.

If a proposed fix would affect one of these areas, first determine whether the defect can be solved without doing so. If not, explain the dependency in the final report before making a broader change.

### Workspace and Matrix layout

Do not regress:

- the constrained-width workspace stacking behavior;
-- Matrix local horizontal scrolling;
- Manufacturing row geometry;
- full Manufacturing product-name visibility;
- Manufacturing Item-cell overflow behavior;
- the separate empty Source cell in Manufacturing rows;
- Matrix rowgroup/table ownership;
- the current X-Tech alignment and section-strip proportions.

The accepted Manufacturing behavior is:

- full product names remain visible at 100%, 125%, 150%, and 200% browser zoom;
- names may visually extend through the otherwise-empty Source area;
- Producing/Input/state controls remain fully visible and are not covered.

Do not reintroduce ellipsis or clamping for Manufacturing product names.

### Forced colors

Do not regress the current selected/lit Matrix treatment in `@media (forced-colors: active)`.

The accepted selected/lit treatment uses a structural cue rather than filled Highlight inversion:

```css
border: 3px double CanvasText;
color: CanvasText;
background: Canvas;
```

This has been manually verified in:

- High Contrast #1;
- High Contrast #2;
- High Contrast Black;
- High Contrast White.

Do not restore `Highlight` / `HighlightText` filling for these states.

### Character numeric fields

Do not alter the accepted validation timing or interaction model unless directly required by a finding in this brief.

Current accepted behavior:

- invalid drafts are silent while typing;
- validation occurs on blur;
- invalid values revert immediately;
- focus moves to the next field first;
- a stable screen-reader-only status announcement follows on the next animation frame;
- no `aria-invalid` / `aria-describedby` noise is exposed while typing;
- blank optional fields remain valid/null.

This behavior was manually tested with Narrator and accepted.

### Context Help visual treatment

Do not increase the visible Context Help control size again.

Current accepted behavior uses a small visible control with an expanded hit target.

Do not alter its visual size, spacing, section geometry, or target-overlap behavior unless absolutely necessary.

### Search

Do not alter the current deterministic submission model:

- highlighted candidate wins;
- otherwise sole candidate wins;
- zero or ambiguous matches disable submission;
- Enter and the Search button behave identically.

### Collapsed Cargo Links

Do not remove or weaken the current localized hidden semantic summary that exposes full item names for collapsed Cargo Links.

### Semantic shell

Do not regress:

- exactly one `<main>`;
- labelled Outpost Navigation landmark;
- labelled Cargo complementary region;
- heading text names that exclude adjacent controls/counts;
- valid Matrix rowgroup ownership.

### General prohibition

Do not perform opportunistic:

- CSS cleanup;
- ARIA refactoring;
- component restructuring;
- DOM-wrapper changes;
- naming cleanup;
- generic accessibility improvements;
- unrelated localization changes.

If an unrelated issue is discovered, report it separately without implementing it.

---

# Findings to correct

## 1. Locale selector — selected Japanese locale is not announced

### Observed manual behavior

When changing the application locale to Japanese with Narrator, the selected locale is not announced clearly.

### Goal

After locale selection, screen-reader users should receive clear confirmation of the newly selected locale.

### Constraints

- Do not redesign the locale selector.
- Do not change locale persistence/resolution behavior.
- Do not change visible copy unless necessary.
- Use the existing localization layer for any new user-facing or assistive text.
- Avoid redundant announcements if the native control already exposes the selected option correctly after a small semantic correction.

### Preferred approach

First inspect the existing locale-selector semantics and event behavior.

Prefer the smallest change that causes the selected locale to be exposed/announced reliably.

Examples of acceptable solution shapes include:

- correcting selected-state semantics;
- ensuring the active option/value is represented through the correct native/ARIA relationship;
- adding a narrowly scoped status announcement if native semantics are insufficient.

Do not add a global live region or restructure the selector merely to force speech.

### Acceptance criteria

- Selecting Japanese results in a clear screen-reader announcement that Japanese is now selected.
- Existing locale resolution, persistence, and switching tests continue to pass.
- No duplicate announcement is introduced for ordinary keyboard interaction.

---

## 2. Resource Matrix Logistics controls — state change is not announced

### Observed manual behavior

Activating Matrix Logistics controls changes state visually, but Narrator does not announce the changed state.

### Goal

The same control should communicate its new state after activation.

### Constraints

- Preserve the existing Matrix table semantics.
- Preserve current keyboard behavior and tab order.
- Do not reintroduce passive Matrix statuses into sequential Tab order.
- Do not alter Matrix layout or state-button geometry.
- Keep visible labels unchanged unless required.
- New assistive text must use localization.

### Preferred approach

Inspect whether the Logistics control exposes the right interactive role/state already.

Prefer correcting state semantics on the existing button/control before adding live announcements.

If the control has a binary state, use an existing native/ARIA state appropriate to the interaction model rather than inventing a parallel status channel.

### Acceptance criteria

- Activating a Logistics control results in the changed state being announced.
- The control remains a native keyboard-operable control.
- No extra Tab stops are introduced.
- Matrix row/table semantics remain unchanged.

---

## 3. Planned Supply enabled controls — activation is announced twice

### Observed manual behavior

Enabled Planned Supply controls are announced twice when activated.

### Goal

Activation should produce one meaningful announcement, not duplicate speech.

### Constraints

- Preserve the current Planned Supply semantics for neutral, planned, and unavailable states.
- Preserve current keyboard operation.
- Preserve current visual styling and layout.
- Do not remove an announcement channel until the actual duplication source is identified.
- Do not suppress native control semantics globally.

### Required diagnosis

Identify the two announcement sources before changing code.

Possible sources might include, for example:

- native button state plus live-region output;
- accessible name mutation plus status message;
- duplicated hidden text;
- multiple equivalent ARIA relationships.

Do not guess.

### Acceptance criteria

- Enabled Planned Supply activation produces one clear state announcement.
- Unavailable/disabled semantics remain intact.
- Existing Planned Supply component accessibility tests remain valid or are updated only to reflect the corrected behavior.

---

## 4. Context Help — activation announces button state rather than help content

### Observed manual behavior

When Context Help is activated, Narrator announces the button/control state but does not clearly present the help content that appeared.

### Goal

The help content should become discoverable/announced when opened, without changing the accepted visual control sizing.

### Constraints

- Do not enlarge the visible Context Help button.
- Do not change the expanded hit-target sizing unless absolutely necessary.
- Do not alter surrounding panel geometry.
- Preserve pointer and keyboard access.
- Use existing localized help strings.
- Avoid turning every help popup into a focus trap unless that is already the established interaction model.

### Preferred approach

Inspect the existing relationship between:

- trigger;
- expanded state;
- help content;
- popup/tooltip/popover semantics;
- focus behavior.

Prefer establishing or correcting the semantic relationship between trigger and content, or announcing the opened content through the existing accessibility feedback mechanism.

Do not solve this by making the help text permanently focusable unless required.

### Acceptance criteria

- Activating Context Help gives a screen-reader user access to the actual help content, not merely the trigger state.
- Closing help remains understandable.
- Existing visual size and hit-target treatment is unchanged.

---

## 5. Cargo remote-outpost selector — abbreviations are spoken letter-by-letter

### Observed manual behavior

In the Cargo remote-outpost item selector, compact abbreviations such as:

`MRg`

are spoken by Narrator as individual letters instead of conveying the full item name, e.g. `Microsecond Regulator`.

### Goal

Keep the compact visible abbreviation while exposing the full localized item name to assistive technology.

### Constraints

- Do not replace visible abbreviations with full names.
- Do not change stored cargo identities.
- Do not alter cargo matching or routing behavior.
- Use the existing localized reference-name seam.
- Preserve current collapsed Cargo Link hidden summaries.

### Preferred approach

Add or correct an accessible name/description for the option/control using the full localized item name while retaining the abbreviation visually.

Be careful not to create duplicate speech where the visible abbreviation and accessible name are both read.

### Acceptance criteria

- `MRg` remains visible.
- Screen readers receive `Microsecond Regulator` or the appropriate localized full name.
- The same approach works for other abbreviated resource/product entries.
- Cargo identity and selection behavior are unchanged.

---

## 6. Outpost Details — missing landmark

### Observed manual behavior

Manual landmark navigation identified most major regions, but Outpost Details did not expose an appropriate landmark.

### Goal

Make Outpost Details navigable as a meaningful region without introducing redundant or noisy landmark structure.

### Constraints

- Do not add another `<main>`.
- Do not alter layout.
- Do not wrap the section in a new DOM container if an existing element can carry the semantic role.
- Do not turn every visual panel into a landmark.
- The region must have a stable accessible name derived from existing localized UI text.

### Preferred approach

Use an existing structural element and add the narrowest appropriate region semantics and labelling.

### Acceptance criteria

- Outpost Details appears as a named landmark/region.
- The application still exposes exactly one `<main>`.
- Existing Navigation and Cargo landmark semantics remain unchanged.
- No layout change occurs.

---

# Finding to diagnose cautiously

## 7. Validation popup/message navigation — Narrator interference

### Observed manual behavior

Narrator appears to interfere with the Validation popup/message-navigation controls during manual testing.

Ordinary keyboard behavior and existing validation semantics otherwise appear sound.

### Important instruction

**Do not implement a speculative correction.**

This issue must be diagnosed before any interaction-model change.

It is acceptable — and preferable — to leave this issue unchanged if the cause cannot be demonstrated confidently.

### Diagnosis questions

Determine:

1. whether the problem reproduces in the application without Narrator;
2. whether Narrator browse/scan mode is intercepting keys that the application expects;
3. whether the current roving-focus implementation exposes an incorrect role/state/tabindex pattern;
4. whether `aria-controls`, region naming, focus movement, or button semantics are actually malformed;
5. whether this is primarily expected screen-reader interaction rather than an application defect.

### Do not do the following without concrete evidence

- replace the roving-focus model;
- add a full ARIA grid/listbox interaction model;
- add custom key interception for Narrator;
- change global keyboard handling;
- make all validation messages separately tabbable;
- restructure the validation panel;
- force focus into the panel on every update.

### Required outcome

One of:

**A. Confident code correction**

Only if a concrete semantic/interaction defect is identified.

or:

**B. No code change + diagnosis**

Document:

- what was inspected;
- what appears correct;
- what remains uncertain;
- why changing the interaction model would be unsafe;
- what manual verification should be performed later.

Outcome B is fully acceptable.

---

# Localization requirement

All new user-facing or screen-reader-facing text must go through the localization layer.

Do not insert literal English `aria-label`, `aria-description`, hidden status text, or live-region copy directly into JSX.

Where possible, reuse existing semantic messages rather than adding new catalogue keys.

If new keys are required:

- add them to the baseline catalogue;
- maintain placeholder parity;
- provide all currently required locale entries according to the project's existing localization rules;
- preserve protected technical tokens.

---

# Testing requirements

Add or update focused tests only where they protect the specific corrected behavior.

Do not rewrite broad accessibility tests unnecessarily.

At minimum, automated coverage should verify the relevant semantics for corrected items where practical, including:

- locale-selector selected-state/announcement mechanism;
- Logistics state semantics after activation;
- absence of duplicate Planned Supply announcement channels;
- Context Help relationship/content accessibility;
- Cargo abbreviation visible text versus full accessible name;
- Outpost Details named-region semantics.

For the Validation popup, add tests only if a concrete defect is found and corrected.

---

# Non-regression verification

Before completion, run the project's normal verification suite.

At minimum:

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

The existing non-failing Vite/Rollup large-chunk warning is not part of this correction pass.

Do not attempt bundle splitting or performance work here.

---

# Manual verification expectations

Codex may not be able to reproduce Narrator behavior directly.

Where runtime screen-reader verification is unavailable:

- implement only changes justified by correct platform semantics and existing component behavior;
- report which findings require manual Narrator verification;
- do not claim a screen-reader issue is fixed solely because static tests pass.

Manual follow-up should specifically verify:

1. Japanese locale selection is announced once and clearly.
2. Matrix Logistics activation announces the new state.
3. Planned Supply activation no longer speaks twice.
4. Context Help exposes the opened help content.
5. Cargo abbreviation controls expose full item names.
6. Outpost Details appears in landmark navigation.
7. Validation navigation behavior, if unchanged, is explicitly noted as still requiring manual investigation.

---

# Final report requirements

Provide a concise implementation report containing:

## Changed

For each implemented finding:

- root cause;
- exact semantic/behavioral change;
- files touched;
- tests added/updated.

## Not changed

For any finding intentionally left unchanged:

- what was investigated;
- why no safe correction was identified;
- what evidence would be needed before changing it.

## Regression statement

Explicitly confirm whether the implementation touched any frozen areas listed in the Hard regression guardrails.

If any were touched, explain exactly why and what was done to preserve the accepted behavior.

## Verification

Report:

- command results;
- any existing non-failing warnings;
- items still requiring manual Narrator verification.

---

# Completion principle

The success criterion for this pass is **not** “every reported screen-reader issue changed.”

The success criterion is:

> Correct the defects that can be corrected confidently, preserve all previously accepted accessibility/layout behavior, and leave uncertain interactions unchanged with a useful diagnosis rather than introducing speculative regressions.
