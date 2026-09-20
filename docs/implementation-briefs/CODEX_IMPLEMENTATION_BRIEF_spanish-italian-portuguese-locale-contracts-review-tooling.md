# Codex Implementation Brief — Spanish, Italian, and Brazilian Portuguese Locale Contracts and Reusable Review Tooling

## Objective

Implement the first engineering stage for the next localization tranche:

```text
Spanish (Spain)
Italian
Portuguese (Brazil)
```

This task should add the **non-runtime locale contracts** and generalize the existing localization review tooling so all three locales can use the same proven pipeline as French/German.

The target tracker/runtime locale IDs are:

```text
es-ES
it-IT
pt-BR
```

The exact Bethesda string-table tokens are:

```text
es
it
ptbr
```

All three official table sets decode as strict UTF-8.

This task must **not** expose any of the three locales in the running application yet.

Do not commit or push unless explicitly instructed.

---

## Product decisions already settled

### Conservative browser-language mapping

The later runtime integration must use the conservative mapping policy established in the audit.

When automatic locale resolution is eventually implemented:

```text
es
es-ES
descendants of es-ES
    -> es-ES

explicit non-Spain es-* such as es-MX, es-AR, es-CL
    -> do not map to es-ES automatically

it
it-IT
descendants of it-IT
    -> it-IT

explicit non-Italy it-* such as it-CH
    -> do not map to it-IT automatically

pt
pt-BR
descendants of pt-BR
    -> pt-BR

pt-PT and other explicit non-Brazilian pt-*
    -> do not map to pt-BR automatically
```

The reason is product honesty: do not imply support for a regional language variant that has not been explicitly onboarded.

**Do not implement browser mapping in this task.**

However, make sure the contracts/tooling introduced here do not force a future broad language-family mapping.

---

## Naming rule

Planning identifiers used in discussion/audit sequencing must not leak into repository-facing names.

Do not use names such as:

```text
Parcel
Phase
P1/P2/etc.
```

in:

- source identifiers;
- filenames;
- tests;
- comments;
- commit messages;
- durable headings introduced by this work.

Use descriptive responsibility-based names.

---

## Primary sources

Treat these as current authority:

```text
docs/audits/SPANISH-ITALIAN-PORTUGUESE-LOCALE-ONBOARDING-PLAN.md
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/BACKLOG.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
AGENTS.md
```

Also inspect the completed generalized French/German tooling and tests.

At minimum inspect:

```text
reference-source/localization-locale-metadata.json
src/localization/reviewPackage.ts
src/localization/reviewAdjudication.ts
scripts/generate-review-package.ts
scripts/localization/
tests/
package.json
```

and the current terminology/reference-name build tooling.

---

# 1. Extend locale metadata contracts

Update:

```text
reference-source/localization-locale-metadata.json
```

with non-runtime entries for:

```text
es-ES
it-IT
pt-BR
```

Required values:

```text
es-ES -> Bethesda token es   -> utf-8 -> full
it-IT -> Bethesda token it   -> utf-8 -> full
pt-BR -> Bethesda token ptbr -> utf-8 -> full
```

Set:

```text
runtimeAvailable: false
```

for all three.

Do not activate them in the runtime locale selector.

Preserve all existing locale entries unchanged unless a small schema-preserving normalization is necessary.

---

# 2. Encoding contracts

Extend the strict string-table encoding lookup so:

```text
es    -> utf-8
it    -> utf-8
ptbr  -> utf-8
```

Requirements:

- strict `TextDecoder(..., { fatal: true })`;
- no byte sniffing;
- no silent fallback;
- unsupported Bethesda token fails clearly;
- existing English Windows-1252 policy remains unchanged;
- Japanese/French/German UTF-8 behavior remains unchanged.

Add or extend tests for:

- successful lookup by Bethesda token;
- successful lookup by tracker locale if supported by current abstraction;
- malformed UTF-8 failure;
- unknown token failure;
- no regression for current locales.

Do not add a general-purpose encoding detector.

---

# 3. Generalize review glossary constraints

The audit found current glossary-constraint code still has French/German-specific value fields.

Refactor this to a locale-keyed structure rather than adding:

```text
es
it
ptbr
```

as new parallel hard-coded fields.

The generalized contract should allow:

```text
locale -> approved value / matching rule
```

while preserving existing French/German behavior and reproducibility.

Requirements:

- current French/German review artifacts must remain reproducible;
- existing Japanese behavior must not regress;
- all applicable glossary concepts remain enforceable;
- overloaded concepts may still use key/context-aware constraints;
- stale-constraint detection must continue to work;
- no locale silently defaults to another locale's terminology;
- missing required locale constraint data must fail clearly.

Prefer data-driven locale maps over branching such as:

```ts
if (locale === 'fr-FR') ...
else if (locale === 'de-DE') ...
```

Do not populate actual Spanish/Italian/Portuguese glossary values yet.

This task is contract/tooling work only.

---

# 4. Generalize semantic-review draft routing

Current semantic review draft selection contains explicit Japanese/French/German assumptions.

Generalize the routing so future full locales can provide one independent draft without adding new branch logic each time.

The design should support:

```text
es-ES
it-IT
pt-BR
```

as valid future review targets while making absence of their draft artifact fail clearly.

Do not create final translated catalogues.

Do not invent Spanish/Italian/Portuguese translations.

Requirements:

- per-locale draft source is explicit;
- locale mismatch fails;
- absent draft fails clearly;
- deterministic row order is preserved;
- current Japanese/French/German workflows remain reproducible;
- no machine source becomes a default adjudication winner.

---

# 5. Generalize review output naming and CLI routing

Audit and remove hard-coded locale handling in:

- review-package generation;
- XLIFF generation;
- adjudication output naming;
- review CSV naming;
- any output-path derivation.

Where appropriate, derive filenames from tracker locale metadata.

Target future shapes should naturally produce:

```text
docs/localization/es-ES-review.csv
docs/localization/it-IT-review.csv
docs/localization/pt-BR-review.csv

docs/localization/es-ES-deepl.xliff
docs/localization/it-IT-deepl.xliff
docs/localization/pt-BR-deepl.xliff
```

Do not generate/commit those completed review artifacts yet unless a deterministic empty/bootstrap artifact is already part of the established tooling contract and clearly appropriate.

Prefer the tooling to be ready to generate them in the later semantic-translation task.

---

# 6. XLIFF generation contract

Preserve the existing XLIFF 1.2 behavior.

Verify the generalized tooling can target:

```text
es-ES
it-IT
pt-BR
```

without special-case branching.

Preserve:

- message key in stable identity fields;
- English source hash;
- context;
- risk classification;
- placeholders;
- protected tokens;
- terminology notes/constraints;
- deterministic unit order;
- deterministic serialization;
- strict re-import validation;
- stale-source rejection;
- locale mismatch rejection;
- unknown/duplicate/missing unit rejection;
- invalid token rejection.

Do not call DeepL.

Do not change the settled provenance rule:

> committed XLIFF is a deterministic current handoff representation, not historical proof of exact bytes originally submitted to DeepL.

---

# 7. Adjudication generalization

Ensure neutral adjudication is locale-generic.

Preserve decision provenance:

```text
AGREED
CODEX
DEEPL
CUSTOM
INVALID_DEEPL_REPAIRED
```

Requirements:

- no source is the default winner;
- substantive decisions require explicit rationale;
- invalid placeholder/token output cannot silently win;
- stale source and stale constraints still invalidate review state;
- locale-specific output path derives cleanly from locale metadata;
- French/German current artifacts remain valid.

Do not adjudicate any new target-locale semantic rows in this task.

---

# 8. Fauna evidence eligibility

The fauna evidence tooling currently only accepts French/German.

Generalize the eligibility contract so:

```text
es-ES
it-IT
pt-BR
```

can participate later.

Do not create completed evidence claims.

Preferred initial state for future generated evidence should remain something equivalent to:

```text
pending
```

until first-party screenshots are observed.

Preserve:

- 922 composed fauna;
- 2,179 components;
- component-shape handling;
- contradiction detection;
- one evidence record per locale;
- no target-hunting requirement;
- no screenshot quota.

Do not assume composition order/separators are accepted merely because the tooling can represent the locale.

---

# 9. Parameterize tests

Where tests currently enumerate:

```text
ja-JP
fr-FR
de-DE
```

because those are the only known full locales, audit whether they should instead derive from locale metadata or use a parameterized locale table.

Add:

```text
es-ES
it-IT
pt-BR
```

to non-runtime contract tests where appropriate.

Do **not** make runtime tests expect these locales to appear in the selector or runtime registry yet.

Test categories should cover:

- metadata;
- encoding;
- artifact naming;
- review generation;
- glossary constraint routing;
- XLIFF routing;
- adjudication routing;
- fauna evidence eligibility;
- unsupported/missing artifact failures.

Retain focused language-specific assertions where genuinely useful.

Avoid mechanically copying whole suites three times.

---

# 10. Locale closure behavior

Audit the locale closure/orchestration command.

It should be able to recognize the three new locale contracts but must not falsely report them as release-complete before their required artifacts exist.

Desired behavior:

```text
known locale + incomplete artifacts
    -> clear actionable failure

unknown locale
    -> unsupported locale failure

current completed locales
    -> unchanged success
```

Do not weaken closure gates merely to accommodate staged onboarding.

---

# 11. Terminology tooling readiness

The current 37 evidence rows / 19 term IDs are reusable.

Ensure terminology build/verify tooling can target:

```text
es-ES
it-IT
pt-BR
```

using the existing locale-neutral provenance and per-locale value artifact model.

Do not create final terminology value CSVs in this task unless doing so is necessary solely to prove deterministic empty/missing-state behavior.

Preferred outcome:

- tooling recognizes the locale;
- expected artifact path is deterministic;
- missing artifact fails clearly;
- existing `ja-JP`, `fr-FR`, `de-DE` terminology verification remains green.

---

# 12. Reference-overlay tooling readiness

Ensure the generalized reference-name materializer/serializer/verifier recognizes the three tracker locales via metadata.

Do not generate or commit the final overlays in this task.

Desired future paths:

```text
src/localization/generated/es-ES-reference-names.ts
src/localization/generated/it-IT-reference-names.ts
src/localization/generated/pt-BR-reference-names.ts

reference-source/localized-reference-names-es-ES-manifest.json
reference-source/localized-reference-names-it-IT-manifest.json
reference-source/localized-reference-names-pt-BR-manifest.json
```

Requirements:

- known locale;
- correct Bethesda token;
- correct encoding;
- deterministic path derivation;
- clear failure if required installed official inputs are unavailable;
- no runtime registration yet.

---

# 13. Search policy staging

Do not implement new search behavior yet.

However, if there is a shared locale-policy registry that currently hard-codes French/German eligibility for decomposition folding, refactor it only if necessary to make later locale-specific policy addition clean.

Do **not** prematurely enable:

```text
Spanish decomposition fold
Italian decomposition fold
Italian apostrophe equivalence
Brazilian Portuguese decomposition fold
```

unless the current architecture requires representing future policy in a non-runtime metadata structure.

If represented now, it must remain inactive until runtime onboarding.

No fuzzy search.

No broad punctuation stripping.

---

# 14. Accessible shortcut speech staging

Do not add visible/runtime speech strings for the three locales yet unless the current exhaustive type/contract requires placeholder entries.

Preferred behavior:

- tooling/type system is ready for later entries;
- runtime still exposes only currently supported locales;
- no fake English fallback is added and mistaken for completed localization.

Do not alter visible shortcut chords or bindings.

---

# 15. Runtime must remain inactive

At the end of this task:

```text
es-ES
it-IT
pt-BR
```

must **not** appear in:

- locale selector;
- automatic runtime resolution;
- runtime semantic catalogue registry;
- runtime reference-name registry;
- persisted supported-locale acceptance;
- `document.lang` switching paths;
- user-facing localized UI.

Their locale metadata may exist for tooling purposes with:

```text
runtimeAvailable: false
```

Do not make runtime code infer support merely because metadata exists.

Add tests if necessary to lock this distinction.

---

# 16. Browser mapping policy staging

Do not implement browser mapping yet.

But document/test any contract necessary so the later runtime task can cleanly implement the approved conservative policy.

The approved future product policy is:

### Spanish

```text
es
es-ES
es-ES descendants
    -> es-ES

explicit other es-* regional tags
    -> continue to next preference / fallback
```

### Italian

```text
it
it-IT
it-IT descendants
    -> it-IT

explicit other it-* regional tags
    -> continue to next preference / fallback
```

### Portuguese

```text
pt
pt-BR
pt-BR descendants
    -> pt-BR

pt-PT and explicit non-Brazilian pt-*
    -> continue to next preference / fallback
```

Do not broaden this policy in implementation without explicit review.

---

# 17. Documentation

Update durable documentation only where the tooling contract materially changed.

Potential targets:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/localization/LOCALIZATION-INPUTS.md
docs/ARCHITECTURE.md
```

Do not:

- mark any of the three locales Supported;
- mark runtime integration complete;
- create implementation diary entries;
- duplicate the audit.

Document only new reusable contract behavior that future locale work needs to know.

---

# 18. Existing locale preservation

French/German/Japanese must remain stable.

Run and confirm:

```text
npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE

npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE
```

Any generalized refactor must preserve current deterministic outputs.

If expected generated artifacts drift unexpectedly, stop and investigate rather than accepting churn.

---

# 19. Explicitly out of scope

Do not:

- translate semantic catalogues;
- create final Spanish/Italian/Portuguese catalogues;
- perform DeepL handoffs;
- create final glossaries;
- create final terminology values;
- create final reference overlays;
- accept fauna composition;
- activate locales at runtime;
- add locale selector entries;
- implement browser mapping;
- implement search folding/apostrophe policy;
- change collation behavior;
- add shortcut speech translations;
- change UI geometry;
- modify CSS;
- add fonts;
- change persistence/import schema;
- move XLIFF files;
- optimize bundle size;
- commit Bethesda localization corpora.

This task is contracts/tooling only.

---

# 20. Verification

Run the relevant complete suite.

At minimum:

```text
npm test
npm run test:components
npm run typecheck:tests
npm run reference:test
npm run localization:provenance:test
npm run localization:provenance:verify

npm run localization:terminology:verify -- --locale ja-JP
npm run localization:terminology:verify -- --locale fr-FR
npm run localization:terminology:verify -- --locale de-DE

npm run localization:reference-names:verify -- --locale ja-JP
npm run localization:reference-names:verify -- --locale fr-FR
npm run localization:reference-names:verify -- --locale de-DE

npm run localization:verify -- --locale ja-JP
npm run localization:verify -- --locale fr-FR
npm run localization:verify -- --locale de-DE

npm run build
npm run lint
git diff --check
```

Also run targeted tests for:

```text
es-ES
it-IT
pt-BR
```

covering:

- metadata;
- UTF-8 contracts;
- non-runtime status;
- deterministic future artifact naming;
- review routing;
- constraint routing;
- adjudication routing;
- fauna eligibility;
- missing artifact failure.

Do not expect full locale closure to pass for incomplete new locales.

---

# 21. Diff review expectations

Before finishing, inspect:

```text
git diff --stat
git diff
```

Confirm:

- no runtime activation leaked in;
- no translated catalogue content was invented;
- no new locale is visible to users;
- no French/German/Japanese generated artifact drift;
- no UI/CSS changes;
- no Bethesda corpora added;
- locale-generalization is data-driven rather than another set of hard-coded branches.

---

# Completion response

Return:

1. branch;
2. files changed;
3. locale metadata changes;
4. encoding changes;
5. review glossary-constraint generalization;
6. semantic draft-routing generalization;
7. XLIFF/output naming generalization;
8. adjudication generalization;
9. fauna-evidence eligibility changes;
10. terminology tooling readiness;
11. reference-overlay tooling readiness;
12. parameterized test changes;
13. locale-closure behavior for incomplete new locales;
14. confirmation `es-ES`, `it-IT`, `pt-BR` remain runtime-inactive;
15. confirmation conservative browser mapping was not implemented yet;
16. current-locale regression verification;
17. build/lint/test results;
18. `git diff --check` result;
19. any deviations from the brief;
20. any newly discovered blocker;
21. suggested next implementation stage;
22. suggested commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
