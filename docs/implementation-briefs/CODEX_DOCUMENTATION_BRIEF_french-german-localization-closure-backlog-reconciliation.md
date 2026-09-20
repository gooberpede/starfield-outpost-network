# Codex Documentation Brief — French/German Localization Closure and Backlog Reconciliation

## Objective

Perform a documentation-only closure pass for the completed French and German localization work.

Do not modify application code, tests, CSS, locale catalogues, reference overlays, XLIFF files, deployment files, or package configuration. Do not commit or push unless explicitly instructed.

The goals are to:
- mark French and German as supported;
- record known non-blocking locale-specific presentation limitations;
- reconcile the remaining localization roadmap;
- add/update global UX/accessibility defects discovered during manual QA;
- preserve the rule that physical UI geometry is frozen unless a separate reviewed implementation explicitly reopens it;
- retain deferred XLIFF cleanup until the localization program is complete.

## Branch and starting state

Work on `staging`.

Before editing:

```text
git status
git branch --show-current
```

Confirm `staging` and leave unrelated working-tree changes untouched.

## Primary files

Inspect and update, as needed:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/BACKLOG.md
```

Update `docs/ARCHITECTURE.md` or `docs/UX-DESIGN.md` only if a current durable statement is materially stale because French/German are now supported. Do not create duplicate closure documents or implementation-history diaries.

## Settled supported-status decision

Record:

```text
French (`fr-FR`)  -> Supported
German (`de-DE`)  -> Supported
```

This is based on completed:
- semantic catalogue closure;
- terminology closure;
- official reference-name closure;
- runtime activation;
- browser-family resolution;
- persisted preference support;
- search/collation integration;
- localized shortcut speech;
- automated localization closure;
- manual 1366px checks;
- manual 1600px checks;
- manual 200% zoom/reflow checks;
- keyboard-only checks;
- Windows Narrator smoke checks;
- import/export announcement checks;
- typography/glyph checks;
- locale-switch regression.

Native-speaker review was unavailable and remains desirable but non-blocking. Apple/WebKit remains a separate deferred platform item.

## Update the French locale profile

In `LOCALE-ONBOARDING.md`, set French to `Supported`.

Keep the profile concise but durable. Record:
- full semantic catalogue complete;
- official terminology complete;
- official reference names complete;
- fauna composition provisionally accepted from first-party screenshot evidence;
- runtime registration complete;
- browser `fr-* -> fr-FR` mapping active;
- persisted preference works;
- search/collation active;
- shortcut accessible speech localized;
- Windows/Chromium manual QA complete;
- native-speaker review unavailable/non-blocking;
- Apple/WebKit deferred.

### French known limitation

Record as non-blocking:
- Search placeholder truncates at constrained desktop width, including 1366px.

Do not prescribe a geometry change. Note that the control remains understandable/usable and any mitigation belongs to a separately reviewed UI task.

## Update the German locale profile

Set German to `Supported`.

Record the same closure categories as French.

### German known limitations

Record as non-blocking:
1. Search placeholder truncates at constrained desktop width.
2. The localized Solar/Wind value for `Very Poor` (`Sehr schlecht`) exceeds the current fixed control's visible capacity and is clipped/truncated.

Do not shorten or alter the accepted translation merely to fit the control. Do not prescribe an unapproved geometry change.

## Frozen UI geometry rule

Preserve or add a durable rule that localization QA findings must not trigger autonomous physical UI changes.

Physical/visual changes include:
- button/control widths or heights;
- column widths;
- panel sizes;
- grid/flex proportions;
- padding, margins, gaps;
- breakpoints;
- dialog dimensions;
- header/status-bar geometry;
- wrapping geometry;
- colors, borders, shadows;
- typography metrics that alter layout.

For backlog items involving these:
- describe the defect and user impact;
- suggest candidate mitigations if useful;
- do not encode a geometry/style change as approved.

## Global backlog defects discovered during QA

Add or update these as separate global items. They are not French/German localization blockers.

### Resource Matrix shortcut focus can lack visible feedback

Observed across locales:
- Resource Matrix shortcuts successfully move programmatic focus;
- the visible focus border/indicator sometimes fails to appear;
- this can make a working shortcut appear non-functional.

Future investigation should consider:
- `:focus-visible` behavior;
- programmatic focus state;
- scroll/focus timing;
- destination focus styling;
- whether the expected element receives visible focus treatment.

Preserve current shortcut bindings and matrix geometry. Do not prescribe a redesign.

### Focused content can be obscured by fixed page chrome

Broaden any existing status-bar-only item rather than duplicating it.

Observed:
- focused/programmatically navigated controls can disappear beneath the fixed header or footer/status bar;
- the effect is especially pronounced at high magnification;
- it occurs across locales.

Desired future behavior:
> Keyboard-focused or programmatically navigated content remains visible within the usable viewport between fixed page chrome.

Cover both header and status bar/footer. Do not prescribe a geometry fix in this documentation pass.

### Undoing Cargo Link deletion collapses unrelated expanded links

Observed across locales:
- delete a Cargo Link;
- Undo;
- other expanded Cargo Links revert to collapsed.

Record as a presentation/history regression. Future investigation should preserve unrelated presentation state where consistent with the existing history/presentation contract. Do not change history semantics unnecessarily.

### Narrator can unexpectedly announce Solar when focus is ambiguous

Observed across locales:
- Narrator sometimes starts announcing the Solar control when focus ownership is unclear.

Record as an accessibility investigation. Candidate investigation areas:
- actual DOM focus ownership;
- programmatic focus transitions;
- accessibility-tree ordering;
- nearby labels;
- focus restoration/repair.

Do not assume the Solar control itself is the root cause.

## Search placeholder presentation debt

Add one cross-locale backlog item rather than duplicating per locale where possible:

> Localized Search placeholders can truncate at constrained desktop widths. French and German remain usable and accessible, but visible placeholder copy is partially clipped. Review later whether shorter locale-specific placeholder copy or a separately approved UI-geometry change is preferable.

Do not decide the mitigation now.

## German `Sehr schlecht` presentation debt

Add one small locale-specific backlog item:

> German Solar/Wind `Very Poor` label (`Sehr schlecht`) exceeds the current fixed control's visible capacity.

Record:
- semantic translation is accepted;
- issue is visual only;
- no functionality/accessibility blocker was found;
- later mitigation may involve approved copy treatment, redundant tooltip/accessible description, or a separately reviewed control-geometry change.

Do not shorten the translation or alter the control now.

## Localization roadmap reconciliation

Update the roadmap so the supported Bethesda-language targets are:

```text
English
Japanese
French
German
```

Keep `en-GB` as the sparse English override rather than counting it as a separate Bethesda language.

Remaining substantial V1 locale onboarding:

```text
Spanish (Spain)
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

Do not mark the localization program complete.

Preserve the strategic direction:
- Spanish (Spain), Italian, and Portuguese (Brazil) may plausibly form a later three-locale tranche;
- Polish likely deserves its own focused tranche;
- Simplified Chinese likely deserves its own focused tranche.

Do not overstate those batches as irrevocably settled unless the current docs already do.

## XLIFF cleanup after localization completes

Add/preserve a deferred cleanup item:

While locale onboarding is active, working `.xliff` files under `docs/localization/` are acceptable.

After all planned localization work is complete:
- move working/handoff XLIFF files to an ignored `.local-work/localization/...` location;
- update generator defaults/scripts/docs/tests that assume `docs/localization/`;
- keep durable review evidence in review CSVs, glossaries, locale profiles, manifests, final catalogues, and reference overlays;
- preserve the distinction that current deterministic XLIFF representations are not historical proof of the exact bytes originally sent to DeepL.

Do not perform the move now.

## Native-speaker review

Preserve a non-blocking follow-up:
- native-speaker review for supported non-English locales when available.

Do not downgrade French/German from Supported because it has not occurred.

## Apple/WebKit

Preserve the existing shared deferred Apple/WebKit compatibility/accessibility follow-up. Do not duplicate it under each locale and do not claim Apple-platform certification.

## Bundle review

Do not optimize bundles here.

Preserve the planned post-localization bundle review after all V1 locales are onboarded. Do not reintroduce the stale old production-performance review item that was already completed.

## Backlog hygiene

Apply the backlog's own rules:
- remove stale/resolved French/German localization items;
- do not leave French/German listed as not onboarded;
- preserve future Polish/Chinese/etc. work;
- do not mark all localization complete;
- do not duplicate existing focus/status-bar items;
- keep completed behavior in durable locale profiles rather than backlog history;
- keep global UX defects distinct from localization support status.

## Explicitly out of scope

Do not:
- modify code;
- modify CSS;
- modify locale catalogues;
- modify reference overlays;
- modify review CSVs or XLIFF;
- relocate XLIFF;
- modify tests;
- alter shortcut bindings;
- change UI geometry or colors;
- implement focus fixes;
- implement Cargo Undo fixes;
- implement Narrator fixes;
- implement Search placeholder fixes;
- shorten `Sehr schlecht`;
- optimize bundles;
- alter runtime localization.

This task is documentation/backlog closure only.

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
3. French supported-status update;
4. German supported-status update;
5. French known limitation summary;
6. German known limitation summary;
7. localization roadmap after closure;
8. remaining V1 locales;
9. Resource Matrix focus-feedback backlog item;
10. fixed-header/status-bar obscuration backlog update;
11. Cargo Link Undo presentation-state backlog item;
12. Narrator Solar/focus-ambiguity backlog item;
13. Search placeholder backlog item;
14. German `Sehr schlecht` backlog item;
15. XLIFF cleanup deferred item;
16. native-speaker review status;
17. Apple/WebKit deferred status;
18. bundle-review deferred status;
19. confirmation no UI geometry change was made or implied as approved;
20. `git diff --check` result;
21. confirmation no code/tests/CSS/localization artifacts changed;
22. confirmation no commit or push occurred;
23. suggested documentation commit message.

The suggested commit message must be descriptive and must not contain planning identifiers.

Do not commit or push unless explicitly instructed.
