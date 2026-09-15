# Codex Correction Brief — Locale Selector Per-Option Language Metadata

## Objective

Implement a **narrow correction** to the native locale selector so that Windows Narrator can identify the Japanese locale option when navigating the expanded native `<select>`.

This correction is justified by a controlled manual comparison and should remain strictly limited to **language metadata on locale-selector options**.

Do not broaden this task into a locale-selector redesign, ARIA refactor, localization cleanup, or general screen-reader pass.

---

## Confirmed manual evidence

A minimal standalone test compared three cases in the same Windows Narrator / Chromium environment.

### Case 1 — ordinary Japanese text with `lang="ja-JP"`

Text:

```html
<p lang="ja-JP">日本語</p>
```

Narrator announced:

> “Enter Japanese”

### Case 2 — Japanese native `<option>` without `lang`

Text:

```html
<option>日本語</option>
```

Narrator announced only:

> “Four of four”

The option position was exposed, but the option content was not identified.

### Case 3 — Japanese native `<option lang="ja-JP">`

Text:

```html
<option lang="ja-JP">日本語</option>
```

Narrator announced:

> “Enter Japanese. Four of four. Enter Japanese”

The phrasing is verbose, but the critical difference is that Narrator now identifies the Japanese option content.

---

## Diagnosis

The previous diagnostic already established that Chromium exposes:

- a non-empty accessible name `日本語`;
- the correct selected state;
- the correct parent select value;
- the same option hierarchy as English options.

Therefore this is **not primarily an accessible-name defect**.

The controlled Narrator comparison demonstrates that explicit per-option language metadata materially changes spoken output.

The narrow correction is therefore:

> Add correct BCP-47 `lang` metadata to fixed locale options in the native selector.

---

## Scope

Primary area:

```text
src/ui/layout/TitleBar.tsx
```

Potentially also the locale-selector option model/registry if that is the cleanest place to expose each option's language.

Tests may be updated in:

```text
tests/componentAccessibility.test.tsx
```

Do not touch unrelated files unless required by the existing locale model.

---

## Required behavior

### Fixed locale options

Each fixed locale option should expose its own correct BCP-47 language tag.

At minimum:

```text
en-US -> lang="en-US"
en-GB -> lang="en-GB"
ja-JP -> lang="ja-JP"
```

Prefer deriving this from the existing stable locale identity rather than hard-coding a one-off Japanese conditional if the current selector model already carries the locale code cleanly.

### Automatic option

Be careful with the `Automatic` option.

Its visible label is localized in the **current effective application language** and may include the automatically resolved locale.

Do **not** blindly assign the resolved target locale as the language of the visible `Automatic (...)` string if the string itself is written in another language.

Use whichever language tag actually matches the rendered option label.

If the current model makes this ambiguous, leave `Automatic` unchanged and report why. The required correction is the fixed locale options.

---

## Hard constraints

### Preserve native control

Do not replace the native `<select>`.

Do not introduce:

- custom combobox/listbox behavior;
- custom keyboard navigation;
- bespoke popups;
- focus management changes.

### Preserve current selector semantics

Keep:

- the current native `<select>`;
- current `aria-label`;
- current `aria-describedby`;
- current `title`;
- current controlled `value`;
- current locale persistence and resolution behavior;
- current visible option labels.

### Do not add English fallback accessible names

Do not add `aria-label="Japanese"` or `aria-label="ja-JP"` to the Japanese option.

The problem is language metadata, not missing option text.

### No unrelated accessibility changes

Do not modify:

- Cargo accessibility;
- Planned Supply;
- Context Help;
- Outpost Details landmark;
- Validation navigation;
- Resource Matrix;
- Manufacturing layout;
- forced-colors rules;
- Character validation;
- Search;
- collapsed Cargo summaries.

---

## Implementation preference

Prefer one of these two shapes:

### Preferred — option model carries language

If the selector options already come from a stable locale registry/model, expose the locale code as option-language metadata and render:

```tsx
<option
  key={option.value}
  value={option.value}
  lang={option.language}
>
  {option.label}
</option>
```

Use whatever property name fits the existing model.

### Acceptable — fixed locale identity directly supplies `lang`

If the option value itself is already the correct BCP-47 locale code and the model does not warrant expansion, using that stable value for `lang` on fixed locale options is acceptable.

Avoid creating new abstractions solely for this three-option case.

---

## Tests

Add or update focused component coverage.

At minimum, verify that:

- the Japanese option has `lang="ja-JP"`;
- `en-US` has `lang="en-US"`;
- `en-GB` has `lang="en-GB"`;
- the selected Japanese option still has accessible name `日本語`;
- the parent selector still retains its current accessible description and selected value.

If `Automatic` receives a `lang`, add a test proving that the tag matches the language of its rendered label.

Do not write a test that claims Narrator speech itself is verified by JSDOM.

The test should protect the semantic condition demonstrated by manual Narrator testing, not simulate Narrator.

---

## Manual verification required

After implementation, manual Windows Narrator verification is still required.

Repeat the production selector test:

1. Open the locale selector.
2. Navigate to the Japanese option.
3. Confirm Narrator now identifies the option content rather than saying only `"Four of four"`.

The exact spoken phrasing does not need to be elegant.

The pass condition is:

> The Japanese option is meaningfully identified.

Verbose Narrator phrasing such as:

> “Enter Japanese. Four of four. Enter Japanese”

is acceptable for this correction.

Do not attempt additional speech tuning unless a separate defect is demonstrated.

---

## Verification

Run the normal relevant checks:

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

The existing non-failing large-chunk warning is not part of this task.

---

## Final report

Report:

### Changed

- files touched;
- where `lang` metadata now comes from;
- how `Automatic` was handled;
- tests added/updated.

### Not changed

Explicitly confirm that:

- the native selector was preserved;
- current `aria-describedby` was preserved;
- no accessible-name fallback was added;
- no unrelated accessibility surface was changed.

### Verification

Report command results and note that manual Narrator verification remains required.

---

## Completion principle

This is a surgical correction.

The goal is not to redesign locale selection.

The goal is simply:

> Ensure each fixed locale option tells the accessibility/speech stack what language its visible label is written in, so Narrator can identify `日本語` when navigating the native locale selector.
