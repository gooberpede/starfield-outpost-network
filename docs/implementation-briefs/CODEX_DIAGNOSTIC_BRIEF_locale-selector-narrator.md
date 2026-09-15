# Codex Diagnostic Brief — Locale Selector / Narrator Japanese Option

## Objective

Diagnose one remaining screen-reader issue in the locale selector.

**Do not implement a fix in this task.**

The purpose of this pass is to determine whether the failure is an application-side accessibility defect, Chromium/native `<select>` behavior, Narrator behavior when encountering Japanese option text, a voice/language configuration issue, or some interaction among those layers.

A correction brief will be written separately only after the cause is understood well enough to justify a safe change.

Prefer an unresolved but evidence-backed diagnosis over speculative code changes.

## Current observed behavior

Manual testing with Windows Narrator:

- The locale selector contains four options.
- English options are announced with both position and option text.
- When moving to the Japanese option, Narrator says only `"Four of four"`.
- It does **not** announce `ja-JP`, `日本語`, or another useful verbal identification of the Japanese option.

The previous screen-reader correction pass attempted to address this by describing the closed locale selector, but the manual problem remains when navigating the native option list.

## Current implementation from the previous correction pass

The previous pass changed `src/ui/layout/TitleBar.tsx` so that the native `<select>` now has a hidden description attached with `aria-describedby`.

Current shape:

```tsx
const localeDescriptionId = useId()

<select
  aria-label={t('locale.selector.label')}
  aria-describedby={localeDescriptionId}
  title={t('locale.selector.current', { locale: closedLabel })}
  value={localeOverride ?? 'automatic'}
  ...
>
  ...
</select>

<span aria-hidden="true" className="title-bar__locale-label">
  {closedLabel}
</span>

<span id={localeDescriptionId} className="ui-visually-hidden">
  {t('locale.selector.current', { locale: closedLabel })}
</span>
```

The focused regression test currently verifies approximately:

```tsx
const selector = screen.getByRole('combobox', { name: '言語と地域' })

expect(selector).toHaveValue('ja-JP')
expect(screen.getByRole('option', { name: '日本語' })).toHaveProperty('selected', true)
expect(selector).toHaveAccessibleDescription('言語と地域：日本語')
```

This proves that the `<select>` has the expected selected value, the Japanese `<option>` has the accessible name `日本語` in the test DOM, and the closed selector has an accessible description referring to Japanese.

It does **not** prove that Windows Narrator will announce the Japanese `<option>` when navigating the expanded native option list.

## Hard constraints

### No implementation

Do not modify application code, CSS, localization files, or tests in this task.

Do not “try” ARIA changes experimentally and leave them in the working tree.

If temporary local instrumentation is needed for diagnosis, revert it before completion and report exactly what was tried.

### Preserve native control model

Do not replace the native `<select>` with a custom listbox, combobox primitive, bespoke menu, or custom keyboard navigation.

A custom selector is far too large a response to this isolated issue and would create substantial regression risk.

### Do not force English onto Japanese

Do not assume that the Japanese option should receive an English accessible label such as `"Japanese"` or `"ja-JP"`.

That may ultimately be considered as a fallback, but only if the diagnosis demonstrates that the localized option text is inaccessible in the target configuration and such a fallback is justified.

The selector is intended to be self-labelled in each locale.

## Diagnostic questions

### 1. What is actually rendered for each locale option?

Inspect the locale registry / selector model and `TitleBar.tsx`.

Record for each option:

- `value`;
- visible option text;
- any `label` attribute;
- any `aria-label`;
- any `lang` attribute;
- whether the `<option>` inherits `document.lang`;
- selected state.

Pay particular attention to the Japanese option.

Determine whether the Japanese option differs structurally from the English options in any way other than its text.

### 2. What does Chromium expose in its accessibility tree?

Inspect the actual browser accessibility tree if the available tooling permits.

For the Japanese `<option>`, record:

- role;
- accessible name;
- selected state;
- position/set-size metadata if exposed;
- language metadata if exposed;
- parent combobox relationship.

Compare it with at least one English option.

The key question is:

> Does Chromium expose a non-empty accessible name for the Japanese option in the real browser accessibility tree?

Do not rely solely on JSDOM / Testing Library for this answer.

### 3. Does the Japanese option have a language-tag problem?

Investigate whether the option text is Japanese while the relevant accessibility node is effectively being treated as English because:

- `document.lang` reflects the currently active application locale rather than the language of each option;
- the Japanese `<option>` has no explicit `lang="ja-JP"`;
- or native `<option>` language inheritance behaves unexpectedly.

Determine whether adding a per-option language tag is semantically valid and whether Chromium exposes it.

**Do not implement such a change in this task.**

Report only whether this is a plausible root cause and what evidence supports or contradicts it.

### 4. Is Narrator suppressing Japanese text because of voice/language settings?

If the environment can exercise Narrator, investigate whether the same option is announced when:

- a Japanese-capable Narrator voice/language is available;
- automatic language switching is enabled/disabled;
- Japanese text elsewhere in the application is encountered.

If the environment cannot exercise these settings, state that clearly.

Do not infer a Narrator configuration cause merely because the text is Japanese.

### 5. Is the problem specific to native `<select>` options?

If practical without changing production code, create a minimal throwaway reproduction outside the application or use browser dev tooling with:

```html
<select>
  <option>English (US)</option>
  <option>English (UK)</option>
  <option>Automatic</option>
  <option lang="ja-JP">日本語</option>
</select>
```

and, if useful, a variant without `lang`.

The purpose is to determine whether the same Narrator behavior occurs independently of this application.

Do not commit the reproduction.

Record whether Chromium exposes the Japanese option name, whether Narrator speaks it, and whether `lang="ja-JP"` changes anything.

### 6. Is the current `aria-describedby` change useful, neutral, or misleading?

Assess the previous correction:

```tsx
aria-describedby={localeDescriptionId}
```

The manual issue persists while navigating the native options.

Determine whether this description still adds useful information when the selector is closed/focused, or whether it is redundant noise.

**Do not remove it in this diagnostic pass.**

Recommend one of:

- keep;
- remove in a future correction;
- inconclusive.

Explain why.

## Possible diagnosis outcomes

### Outcome A — Application defect

Examples:

- Japanese option has an empty or incorrect accessible name in Chromium;
- option structure differs unexpectedly;
- language metadata is wrong in a way that demonstrably prevents announcement;
- application ARIA suppresses or overrides the native name.

If so, identify the narrowest likely correction but do not implement it.

### Outcome B — Browser/native control issue

Chromium exposes incomplete or inconsistent semantics for the Japanese native option.

Document the browser behavior and whether a narrow standards-compliant workaround appears possible.

### Outcome C — Narrator language/voice behavior

Chromium exposes the Japanese option correctly, but Narrator does not speak it under the tested configuration.

If so, determine whether this is expected/configuration-dependent behavior and whether the application should avoid compensating for it.

### Outcome D — Mixed / unresolved

Evidence points to more than one layer or available tooling cannot distinguish the cause.

State what is known, what remains unknown, and what manual test would resolve it.

This is an acceptable outcome.

## Regression sensitivity

This diagnostic must not reopen any of the accessibility work already accepted.

Do not touch:

- Cargo full-name accessibility;
- Planned Supply state announcement behavior;
- Context Help semantics or sizing;
- Outpost Details landmark;
- Validation navigation;
- Resource Matrix semantics;
- Manufacturing layout;
- forced-colors rules;
- Character numeric validation;
- Search behavior;
- collapsed Cargo summaries.

## Testing / evidence expectations

Because this is diagnosis-only, the normal full verification suite is not required unless diagnostic instrumentation changes tracked files temporarily.

If tracked files are touched for investigation:

1. revert all diagnostic-only changes;
2. run `git diff --check`;
3. confirm the final working tree contains no unintended diagnostic edits.

Do not add regression tests yet unless the diagnosis itself demonstrates that an existing test is materially misleading. Even then, report that recommendation rather than editing tests in this task.

## Deliverable

Write the diagnostic report as Markdown under:

```text
docs/audits/
```

Use a durable functional name such as:

```text
docs/audits/locale-selector-narrator-diagnostic.md
```

The report should contain:

### Observed behavior

Restate the manual Narrator symptom precisely.

### Current implementation

Describe the native selector, current option naming, and the previous `aria-describedby` change.

### Browser accessibility evidence

Record what Chromium exposes for English and Japanese options.

### Narrator / language evidence

Record what could and could not be tested.

### Root-cause assessment

Rank the plausible causes and explain the evidence.

### Current `aria-describedby` assessment

Recommend keep/remove/inconclusive for a future correction.

### Recommended next step

Choose one:

- no application change;
- write a narrow correction brief;
- perform one specific additional manual test first.

If a correction is recommended, describe the smallest candidate change without implementing it.

### Confidence / limitations

State clearly where the diagnosis is based on direct evidence versus inference.

## Completion principle

The purpose of this task is to answer:

> Why does Narrator say only “Four of four” for the Japanese locale option when the application and test DOM appear to give that option the accessible name `日本語`?

Do not change the product until there is enough evidence to answer that question with useful confidence.
