# Codex Correction Brief — Polish Staging Contract Boundary Cleanup

## Objective

Correct two over-broad implementation changes in the staged Polish locale-contract/tooling batch before commit.

The Polish staging work is otherwise sound and should be preserved.

Do not expand scope into terminology/glossary work or Polish runtime activation.

Do not commit or push.

---

# 1. Preserve the runtime locale type boundary

The current diff changes:

```ts
function resolvePluralExpressions(
  template: string,
  locale: SupportedLocale,
  parameters: MessageParameters,
)
```

into an exported function accepting:

```ts
locale: string
```

This weakens the runtime localization type boundary solely so staged `pl-PL` can be exercised before it is a runtime-supported locale.

Revert that broadening.

Requirements:

- `resolvePluralExpressions` should remain internal unless there is an existing product reason for it to be public.
- Its runtime locale parameter should remain constrained to `SupportedLocale`.
- `pl-PL` must remain absent from runtime-supported locale typing until the later runtime-integration stage.
- Do not make production runtime APIs accept arbitrary locale strings for staging tests.

For the current Polish tooling-stage tests, verify instead:

- `Intl.PluralRules('pl-PL')` returns the expected Polish categories for representative counts;
- review-package plural validation still accepts only the current `one / other` catalogue syntax;
- `few` / `many` catalogue branches remain unsupported;
- count-neutral Polish wording remains structurally valid under that syntax.

The actual runtime rendering path can receive direct `pl-PL` coverage once Polish is activated later.

---

# 2. Do not globally require exact placeholder occurrence counts

The current diff changes translation validation from comparing the unique placeholder set:

```ts
parametersOf(...)
```

to comparing every placeholder occurrence:

```ts
parameterOccurrencesOf(...)
```

This makes any translated message invalid if it legitimately repeats a placeholder that appears only once in the English source.

That is a cross-locale semantic-policy change and is broader than the Polish staging requirement.

Revert the global exact-occurrence-count rule unless the repository already has an explicit per-key rule proving such repetition invalid.

Preserve the existing structural requirements:

- required placeholders must not disappear;
- placeholder names must not change;
- unknown/replacement placeholders must not be introduced;
- plural parameters must remain structurally valid;
- protected tokens must remain intact.

A translation may sometimes need to repeat the same opaque value naturally in another language. Do not prohibit that globally merely because English uses it once.

Update the Polish placeholder-risk test accordingly:

- keep tests for missing `{resource}`;
- keep tests for renamed `{product}` / `{produkt}`;
- keep protected-token and malformed-plural tests;
- remove the assertion that an additional occurrence of `{outpost}` must always produce `PLACEHOLDERS`.

If a future key has a product-specific reason to prohibit duplicate rendering, encode that as a bounded key-specific rule rather than a universal localization invariant.

---

# Preserve the rest of the implementation

Do not disturb the good staged work already completed:

- `pl-PL -> pl -> utf-8 -> full`;
- `runtimeAvailable: false`;
- deterministic Polish artifact paths;
- staged review-draft failure;
- empty/fail-closed Polish constraint registration;
- narrow accidental-English handling;
- strict UTF-8 policy;
- staged terminology failure;
- staged reference-overlay failure;
- metadata-derived fauna evidence path;
- parameterized locale/tooling tests;
- Polish absence from selector/runtime/browser mapping/search/collation/shortcut speech.

---

# Verification

Run the same relevant verification after correction:

```text
npm test
npm run test:components
npm run localization:provenance:test
npm run localization:terminology:verify
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

Confirm:

- Polish remains runtime-inactive;
- existing locale behavior is unchanged;
- production runtime locale typing has not been widened;
- placeholder validation has not acquired a new universal occurrence-count restriction.

---

# Completion response

Return:

1. files changed by the correction;
2. runtime plural-helper signature after correction;
3. how staged Polish plural behavior is now tested without widening runtime locale types;
4. placeholder-validation behavior after correction;
5. Polish placeholder-risk tests retained/changed;
6. confirmation all other staged Polish work is preserved;
7. automated verification results;
8. `git diff --check` result;
9. confirmation no commit/push occurred;
10. revised commit-readiness assessment.

Do not commit or push unless explicitly instructed.
