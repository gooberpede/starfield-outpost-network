# Codex Documentation Brief — Spanish, Italian, and Brazilian Portuguese Localization Closure and Durable-Document Reconciliation

## Objective

Perform the final **documentation/backlog closure** for the completed Spanish, Italian, and Brazilian Portuguese localization tranche.

The three locales are now accepted as supported:

```text
es-ES -> Supported
it-IT -> Supported
pt-BR -> Supported
```

The remaining Narrator/shortcut findings are global application accessibility issues, not locale-specific blockers.

This task is documentation/backlog work only unless a tiny documentation-supporting test metadata adjustment is strictly required by repository policy.

Do not modify runtime behavior, semantic catalogues, reference overlays, CSS, UI geometry, search, browser mapping, shortcut bindings, or persistence.

Do not commit or push unless explicitly instructed.

## Primary files

At minimum inspect and update as needed:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/BACKLOG.md
```

Update additional durable documentation only if a current statement has become materially stale because this localization tranche is now complete.

Possible, only if genuinely necessary:

```text
docs/UX-DESIGN.md
docs/ARCHITECTURE.md
```

Do not create a duplicate historical closure report if the locale profiles and backlog can carry the durable state cleanly.

## Settled support-status decision

Record:

```text
Spanish (Spain)        es-ES -> Supported
Italian                it-IT -> Supported
Portuguese (Brazil)    pt-BR -> Supported
```

The support decision is based on completed semantic, terminology, reference-name, fauna-evidence, runtime, browser-mapping, persistence, search, collation, shortcut-speech, automated-closure, layout, typography, import/export, locale-switch, and live semantic checks.

Native-speaker review remains desirable but non-blocking. Apple/WebKit remains deferred.

## Manual 200% zoom closure

Record that true browser-controlled 200% zoom passed for all three locales:

```text
es-ES -> PASS
it-IT -> PASS
pt-BR -> PASS
```

Do not retain stale wording that says true 200% zoom remains pending.

## Narrator closure interpretation

The manual Narrator pass found several **global** issues that reproduce across locales.

These findings do not indicate a Spanish-, Italian-, or Brazilian-Portuguese localization failure.

Record the locale closure accurately:

- localized names/labels/status text were generally exposed to Narrator;
- other representative Narrator checks passed;
- native-language naturalness was not independently verified by a native speaker;
- the shared Narrator/shortcut interaction issues below remain global accessibility follow-up.

Do not describe the three locales as “Narrator fully certified.”

Do not keep their support status pending solely because of these global issues.

## Global accessibility backlog reconciliation

Add or update shared accessibility follow-up items in `docs/BACKLOG.md`.

Avoid duplicate entries if an existing item can be broadened.

### Shortcut chords not announced by Narrator

Observed across locales:

- shortcut actions/labels are present;
- the shortcut chord itself is not being announced to the user by Narrator.

Investigate:
- how shortcut key information is exposed in Help;
- whether `aria-keyshortcuts`, visible keycap markup, or accessible descriptions reach Narrator as intended;
- whether accessible speech formatting is attached to the element Narrator actually announces;
- whether behavior differs between browse/scan/focus modes.

Do not change bindings as part of documentation closure.

### Narrator intercepts or prevents some global shortcuts

Observed across locales with Narrator active:

```text
Ctrl + Alt + ArrowUp
Ctrl + Alt + ArrowDown
```

did not perform previous/next-outpost; Narrator announced:

```text
Not on table
```

Also observed:

```text
/
```

for Search focus is frequently or consistently unavailable while Narrator is active.

Record this as one shared Windows Narrator/browser shortcut-interaction investigation.

Future investigation should determine whether Narrator reserves/intercepts the chord, scan/browse mode changes event delivery, application focus changes routing, or a documented alternate interaction is needed.

Preserve current bindings until reviewed.

### Compact Cargo Link marker/control announcement

Observed across locales:

- clicking `✷⇄✷` did not itself trigger a new Narrator announcement;
- Narrator instead announced the Cargo Link landmark;
- when keyboard focus reached the Cargo Link/header, `✷⇄✷` was included in the description;
- the visual tooltip still appeared.

Record only as an investigation if current semantics do not already establish a sufficient accessible name/state.

Do **not** state that tooltip text must automatically be spoken on mouse activation.

Future review should verify role, accessible name/state, keyboard behavior, and whether information is already redundantly available in the Cargo Link accessible summary.

### Resource Matrix compact controls may lack sufficient accessible context

Observed across locales:

- Manufacturing/Resource Matrix buttons in Producing/Inputs may be announced only by a compact label such as `T-G-R`;
- Narrator does not automatically announce the associated visual tooltip.

Do not treat “tooltip not spoken on click” as the defect.

The durable question is whether the accessible name/description/state provides enough context without relying on the visual tooltip.

Future investigation should inspect accessible name, description, state, table/header context, and whether a screen-reader user can distinguish item and action reliably.

Do not change Matrix geometry.

### Locale-selector “international sort” Narrator utterance

During the Spanish locale-selector check, Narrator inserted:

```text
international sort
```

while focus was on Español/Spanish.

Treat this as **informational unless reproducible evidence shows incorrect application semantics**.

Do not create a high-priority Spanish localization defect from this one utterance.

## Existing global accessibility findings

Preserve the previously recorded global issues:

- Resource Matrix shortcuts can move focus without a visible focus border;
- focused/programmatically navigated content can be obscured by fixed page chrome;
- Cargo Link Undo can collapse unrelated expanded links;
- intermittent Narrator Solar-control announcement/focus ambiguity.

Do not duplicate them.

## Locale-specific presentation debt

Consolidate the Solar/Wind `Very Poor` control-capacity item where appropriate.

Known examples:

```text
de-DE -> Sehr schlecht
es-ES -> Muy deficiente
it-IT -> Molto scarso
```

Brazilian Portuguese `Muito ruim` was reported usable in the tested layout.

Preserve these rules:

- translations remain semantically correct;
- do not shorten solely to fit;
- no geometry change is approved;
- possible future mitigation may consider copy treatment, redundant accessible information, or separately approved geometry changes.

Do not make this a support blocker.

## Update locale profiles

For `es-ES`, `it-IT`, and `pt-BR`, ensure each locale profile records:

- Tracker status: Supported;
- tracker locale ID;
- Bethesda token;
- strict UTF-8;
- semantic catalogue complete;
- official terminology/glossary complete;
- official reference overlay complete;
- 3,561 entities / 4,818 qualified provenance rows / 0 unresolved;
- fauna composition evidence status and limitations;
- runtime registration complete;
- selector label;
- conservative browser mapping;
- search policy;
- canonical English aliases;
- collation/formatting;
- shortcut speech policy;
- typography/font decision;
- 1366/1600 QA;
- true 200% zoom QA;
- keyboard-only QA;
- import/export feedback verification;
- Narrator smoke outcome and global limitations;
- native-speaker review status;
- Apple/WebKit deferred status;
- known locale-specific visual debt.

Keep profiles concise and durable, not chronological diaries.

### Spanish profile details

Record/preserve:

```text
Locale: es-ES
Bethesda token: es
Encoding: UTF-8
Selector label: Español (España)
```

Browser mapping:
- `es`, `es-ES`, descendants of `es-ES` -> `es-ES`;
- explicit other regional `es-*` does not automatically map to Spain Spanish and continues to later browser preferences.

Search:
- lower-ranked diacritic/combining-mark fold;
- `ñ` may be found via `n` fallback;
- exact localized spelling outranks folded form;
- canonical English aliases remain searchable.

Known visual debt:
- `Muy deficiente` exceeds compact Solar/Wind control capacity but remained usable/non-blocking.

True 200% zoom: PASS.

Narrator: representative localized semantics passed; global Narrator/shortcut issues documented separately; linguistic naturalness not native-speaker certified.

### Italian profile details

Record/preserve:

```text
Locale: it-IT
Bethesda token: it
Encoding: UTF-8
Selector label: Italiano (Italia)
```

Browser mapping:
- `it`, `it-IT`, descendants of `it-IT` -> `it-IT`;
- explicit other regional `it-*` such as `it-CH` continues to later preferences.

Search:
- lower-ranked accent folding;
- straight/curly apostrophe equivalence;
- exact official punctuation outranks normalized form;
- canonical English aliases retained.

Known visual debt:
- `Molto scarso` exceeds compact Solar/Wind control capacity but remained usable/non-blocking.

True 200% zoom: PASS.

Narrator limitations are shared/global.

### Brazilian Portuguese profile details

Record/preserve:

```text
Locale: pt-BR
Bethesda token: ptbr
Encoding: UTF-8
Selector label: Português (Brasil)
```

Browser mapping:
- `pt`, `pt-BR`, descendants of `pt-BR` -> `pt-BR`;
- `pt-PT` and other explicit non-Brazilian `pt-*` continue to later preferences.

Search:
- lower-ranked accent/tilde/cedilla folding;
- exact localized spelling outranks folded form;
- canonical English aliases retained;
- no European Portuguese synonym expansion.

Solar/Wind:
- `Muito ruim` was usable in tested layouts and is not currently a clipping defect unless the current QA diff already documents otherwise.

True 200% zoom: PASS.

Narrator limitations are shared/global.

## Supported-language roadmap reconciliation

Update durable roadmap wording so supported Bethesda-language targets now include:

```text
English
French
German
Spanish (Spain)
Japanese
Italian
Portuguese (Brazil)
```

`en-GB` remains a sparse English override, not a separate Bethesda target.

Remaining substantial V1 locale onboarding is now only:

```text
Polish
Simplified Chinese
```

Remove stale wording claiming five locales remain.

Do not mark the entire localization program complete.

## Next-locale planning

Do not choose or begin the next locale in this documentation task.

Preserve that:
- Polish remains not onboarded;
- Simplified Chinese remains not onboarded;
- both likely deserve focused individual onboarding;
- final selector ordering remains deferred until both are complete.

## Locale-selector ordering

Preserve:

> Final locale-selector ordering will be reviewed after all planned V1 locales are onboarded.

Do not reorder the selector now.

## XLIFF cleanup

Preserve post-program cleanup:
- active handoff XLIFFs may remain in `docs/localization/` while localization continues;
- after Polish and Simplified Chinese are complete, move working/handoff XLIFFs to ignored `.local-work/localization/...`;
- update scripts/docs/tests accordingly;
- retain durable review evidence separately.

Do not move files now.

## Bundle review

Preserve the dedicated post-localization bundle review after Polish and Simplified Chinese.

Do not optimize now.

## Native-speaker review

Use consistent durable wording:
- native-speaker review is desirable when available;
- absence is a known limitation;
- it is not a hard V1 support gate.

Do not imply that Narrator testing by a non-speaker substitutes for native-language editorial review.

## Apple/WebKit

Preserve shared deferred Apple/WebKit verification.

Do not claim Safari/VoiceOver/iPhone certification.

## Backlog hygiene

Reconcile rather than append blindly:

- remove stale Spanish/Italian/Portuguese “not onboarded” or “pending runtime/QA” entries;
- change remaining-locale count from five to two;
- preserve Polish and Simplified Chinese;
- broaden existing accessibility items where appropriate rather than duplicating them;
- consolidate localized `Very Poor` control-capacity debt if possible;
- preserve XLIFF cleanup and post-localization bundle review;
- keep completed mechanics out of the backlog.

## Explicitly out of scope

Do not:
- modify semantic catalogues;
- modify reference overlays;
- modify runtime registration;
- modify browser mapping;
- modify search;
- modify shortcut bindings;
- modify accessible speech strings;
- modify CSS/UI geometry;
- implement Narrator fixes;
- implement shortcut fixes;
- implement Matrix accessibility fixes;
- implement Cargo Undo fixes;
- reorder locale selector;
- move XLIFF files;
- optimize bundle;
- begin Polish or Simplified Chinese onboarding.

## Verification

Run:

```text
git diff --check
git diff -- docs/localization/LOCALE-ONBOARDING.md docs/BACKLOG.md docs/ARCHITECTURE.md docs/UX-DESIGN.md
```

Only include architecture/UX files if actually changed.

No build/test suite is required for documentation-only changes unless repository policy requires it.

Confirm no implementation files were intentionally changed.

## Completion response

Return:

1. branch;
2. files changed;
3. Spanish final Supported status;
4. Italian final Supported status;
5. Brazilian Portuguese final Supported status;
6. true 200% zoom evidence recorded;
7. Narrator closure wording;
8. shortcut-announcement backlog item;
9. Narrator shortcut-interception backlog item;
10. Cargo compact-control accessibility disposition;
11. Matrix compact-control accessibility disposition;
12. locale-selector “international sort” disposition;
13. fixed-chrome/focus existing-item status;
14. Cargo Undo existing-item status;
15. Matrix focus-border existing-item status;
16. Solar/Wind localized-control-capacity backlog update;
17. supported Bethesda-language list after closure;
18. remaining V1 locale list;
19. Polish status;
20. Simplified Chinese status;
21. selector-order deferred status;
22. native-speaker review status;
23. Apple/WebKit deferred status;
24. XLIFF cleanup deferred status;
25. bundle-review deferred status;
26. confirmation no runtime/UI/CSS/localization-artifact changes occurred;
27. `git diff --check` result;
28. confirmation no commit or push occurred;
29. recommended next planning step;
30. suggested documentation commit message.

The suggested commit message should be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
