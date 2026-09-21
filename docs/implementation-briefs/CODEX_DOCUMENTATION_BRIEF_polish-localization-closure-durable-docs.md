# Codex Documentation Brief — Polish Localization Closure and Durable-Document Reconciliation

## Objective

Perform the final **documentation/backlog closure** for the completed Polish localization onboarding.

Polish is now accepted as supported:

```text
pl-PL -> Supported
```

All required automated and manual release gates have passed.

The remaining Narrator/shortcut-key issues are shared global accessibility behavior already documented elsewhere and are not Polish-specific blockers.

This task is documentation/backlog reconciliation only.

Do not modify runtime behavior, semantic catalogues, reference overlays, search, browser mapping, shortcut bindings, CSS, UI geometry, persistence, or localization artifacts.

Do not begin Simplified Chinese onboarding in this task.

Do not commit or push unless explicitly instructed.

---

# Primary files

At minimum inspect and update as needed:

```text
docs/localization/LOCALE-ONBOARDING.md
docs/BACKLOG.md
```

Update additional durable documentation only if current wording becomes materially stale because Polish is now fully supported.

Possible, only if genuinely necessary:

```text
docs/ARCHITECTURE.md
docs/UX-DESIGN.md
```

Do not create a duplicate historical closure report if the locale profile and backlog can carry the durable state cleanly.

---

# Settled support-status decision

Record:

```text
Polish
pl-PL -> Supported
```

The support decision is based on completed:

- semantic catalogue closure;
- official terminology/glossary closure;
- independent Codex semantic review;
- DeepL comparative adjudication;
- final semantic catalogue generation;
- official reference-name overlay closure;
- fauna composition evidence;
- runtime activation;
- conservative browser-locale mapping;
- locale preference persistence;
- `document.lang`;
- Polish search folding including lower-ranked `ł -> l`;
- canonical English aliases;
- locale-aware collation;
- localized shortcut speech;
- automated localization closure;
- 1366px checks;
- 1600px checks;
- true browser-controlled 200% zoom;
- keyboard-only checks;
- Windows Narrator smoke;
- import/export success and failure feedback;
- localized import/export Narrator announcements;
- typography/glyph checks;
- locale-switch/persistence regression;
- count-neutral plural/runtime checks;
- bounded live semantic sanity review.

Native-speaker review remains desirable but non-blocking.

Apple/WebKit remains deferred.

---

# Manual closure evidence

Record the user-completed manual gates:

```text
Polish 200% browser zoom: PASS
Polish Narrator smoke: PASS
Polish export announcement: PASS
Polish valid-import announcement: PASS
Polish invalid-import announcement: PASS
```

Do not retain stale wording that says these checks remain pending.

---

# Narrator closure interpretation

The manual Narrator pass confirmed that representative Polish accessible names, messages, and live-region feedback are exposed successfully.

Known shared Narrator/shortcut interaction issues were reproduced:

- shortcut chords may not be announced;
- `Ctrl+Alt+ArrowUp` / `Ctrl+Alt+ArrowDown` may be intercepted by Narrator;
- `/` Search shortcut may be unavailable under Narrator.

These remain **global/non-blocking** and must not be reclassified as Polish defects.

Do not describe Polish as “Narrator fully certified” in a platform-wide sense.

Appropriate durable wording should distinguish:

```text
Polish Narrator localization smoke passed
```

from:

```text
all global Narrator/browser interactions are defect-free
```

which is not true.

---

# Polish final Locale Profile

Update the Polish profile in:

```text
docs/localization/LOCALE-ONBOARDING.md
```

so it records the final durable state concisely.

At minimum include:

```text
Tracker locale: pl-PL
Bethesda token: pl
Encoding: UTF-8
Selector: Polski (Polska)
Status: Supported
```

and durable policy/evidence for:

- semantic catalogue complete;
- official terminology/glossary complete;
- official reference overlay complete;
- 3,561 entities / 4,818 qualified provenance rows / 0 unresolved;
- fauna composition provisionally accepted from first-party screenshots;
- runtime registration complete;
- selector label;
- conservative browser mapping;
- search normalization;
- lower-ranked `ł -> l`;
- canonical English aliases;
- collation;
- shortcut speech;
- typography/font decision;
- 1366/1600 layout QA;
- true 200% browser zoom;
- keyboard-only QA;
- Narrator smoke outcome and global limitations;
- import/export feedback and announcements;
- native-speaker review status;
- Apple/WebKit deferred status;
- known non-blocking visual debt.

Keep the profile durable and concise, not chronological.

---

# Polish fauna evidence summary

Preserve the final accepted evidence state:

```text
922 predictions
2,179 components
267 prefix + species
335 prefix + species + diet
320 species + diet
```

First-party screenshot evidence:

```text
8 screenshots
Jemison + Codos
all three modeled composition shapes represented
8 full matches under scanner casing
0 truncated
0 ambiguous/unmapped
0 contradictions
```

Record that Polish fauna composition is provisionally accepted.

Preserve the limitation:

> Seven unique fauna across two bodies do not represent every possible Polish grammatical context.

Do not weaken the accepted status merely because evidence is opportunistic rather than exhaustive.

---

# Search policy final state

Record the final Polish search policy:

- exact Polish localized spelling ranks highest;
- lower-ranked NFD folding supports:
  - `ą -> a`
  - `ć -> c`
  - `ę -> e`
  - `ń -> n`
  - `ó -> o`
  - `ś -> s`
  - `ź -> z`
  - `ż -> z`
- narrow Polish search-only equivalence:
  - `ł -> l`
- canonical English aliases remain searchable;
- display remains Polish;
- no broad punctuation stripping;
- no fuzzy matching;
- no general transliteration framework.

The current resource/product corpus produced zero new distinct-name collisions under both:

```text
NFD folding
NFD folding + ł -> l
```

---

# Browser mapping final state

Record:

```text
pl       -> pl-PL
pl-PL    -> pl-PL
pl-PL-*  -> pl-PL
```

Explicit other regional Polish tags such as:

```text
pl-UA
pl-LT
```

continue to later browser preferences rather than being treated as Poland Polish.

Do not broaden this mapping during closure.

---

# Count-neutral Polish strategy

Record the final accepted policy:

Polish uses the current narrow application plural syntax:

```text
one / other
```

for the four existing pluralized semantic keys, with count-neutral wording that remains grammatically safe across representative Polish plural categories.

The verified keys are:

```text
cargo.pad.count
validation.issueCount
validation.plannedSupplyUnresolved
search.results.found
```

Representative counts verified:

```text
1
2
5
12
22
25
```

Also preserve the safe non-ICU count wording for:

```text
validation.counts
```

Do not open a richer-plural formatter task merely because Polish has `few` and `many`; current content does not require it.

Future new messages may reopen that architectural decision if genuinely needed.

---

# Known non-blocking Polish visual debt

Record or consolidate the already observed presentation pressure:

## Solar/Wind

Longer Polish headings/labels create visible alignment pressure.

## Resource Matrix

Longer Polish header labels create alignment/spacing pressure.

These are:

```text
NON-BLOCKING
```

because controls remain usable and meaning remains available.

Do not create Polish-specific geometry fixes if the issue is clearly part of broader cross-locale capacity/layout debt.

Prefer consolidating under shared layout backlog wording.

No geometry change is approved by this closure task.

---

# Supported-language roadmap reconciliation

Update durable wording so supported Bethesda text/interface targets now include:

```text
English
French
German
Spanish (Spain)
Japanese
Italian
Polish
Portuguese (Brazil)
```

`en-GB` remains a sparse tracker override and is not a separate Bethesda language target.

The only remaining substantial V1 locale onboarding target is now:

```text
Simplified Chinese
```

Remove stale wording claiming Polish is still pending.

Do not mark the entire localization program complete.

---

# Simplified Chinese status

Record:

```text
Simplified Chinese
zh-Hans / Bethesda token zhhans
Not onboarded
```

if the current durable docs already use that level of detail.

Do not begin implementation.

Do not create Chinese metadata/catalogues/glossaries/overlays in this task.

The next separate task can be the Simplified Chinese onboarding audit.

---

# Final locale-selector ordering

Preserve the deferred decision:

> Final locale-selector ordering will be reviewed after Simplified Chinese is onboarded.

Do not reorder the selector now.

---

# XLIFF cleanup

Preserve the existing post-program cleanup:

- working/handoff XLIFFs may remain under `docs/localization/` while localization is still active;
- after Simplified Chinese onboarding is complete, move working/handoff XLIFF files to ignored `.local-work/localization/...`;
- update scripts/docs/tests accordingly;
- retain durable review evidence separately.

Do not move XLIFF files now.

---

# Post-localization bundle review

Preserve the dedicated bundle/startup review after Simplified Chinese is onboarded.

Current Polish activation measurements may remain in the Polish profile if already recorded:

```text
HTML 572 B raw / 329 B gzip
CSS 56,277 B raw / 9,205 B gzip
JS 1,353,641 B raw / 327,696 B gzip
```

Do not optimize now.

Do not introduce lazy locale loading.

---

# Native-speaker review

Use consistent durable wording:

- native-speaker editorial review is desirable when available;
- absence is a known limitation;
- it is not a hard V1 support gate.

Do not imply that Narrator testing by a non-speaker substitutes for native-language editorial review.

---

# Apple/WebKit

Preserve shared deferred Apple/WebKit verification.

Do not claim:

- Safari certification;
- VoiceOver certification;
- iPhone/iPad certification.

This does not affect Polish Supported status under the current Windows/Chromium release baseline.

---

# Global accessibility backlog

Preserve existing shared items.

Do not duplicate them.

These include:

- Resource Matrix visible focus-border issue after shortcuts;
- fixed-chrome focus/content occlusion;
- Cargo Link Undo presentation-state collapse;
- Narrator Solar-control/focus ambiguity;
- Narrator shortcut chord announcement;
- Narrator shortcut interception;
- Search `/` shortcut behavior under Narrator;
- compact Cargo/Matrix accessible-context follow-up.

Polish reproduced known Narrator shortcut interaction behavior without distinct regression.

Do not reopen or reprioritize those merely because Polish closure exercised them.

---

# Backlog hygiene

Reconcile rather than append blindly.

At minimum:

- remove/update stale Polish “pending closure” wording;
- change remaining-locale count to one;
- preserve Simplified Chinese as the only remaining V1 locale;
- preserve shared layout debt;
- preserve global Narrator/accessibility items;
- preserve XLIFF cleanup;
- preserve post-localization bundle review;
- do not create duplicate Polish-specific geometry issues.

If no backlog change is required because current items already cover the debt, say so and leave the file untouched.

---

# Architecture documentation

Update `docs/ARCHITECTURE.md` only if current statements about runtime/supported locale populations are stale.

If updated, record that Polish is now a full supported runtime locale with:

- complete semantic catalogue;
- complete reference overlay;
- locale-aware search;
- stable-ID presentation boundary.

Do not add historical narrative.

---

# Explicitly out of scope

Do not:

- change Polish semantic text;
- change Polish reference names;
- change Polish fauna evidence;
- alter runtime registration;
- change browser mapping;
- change search behavior;
- change shortcut speech;
- change CSS/UI geometry;
- fix Narrator global issues;
- fix Cargo Undo;
- change persistence/schema;
- reorder selector;
- move XLIFF files;
- optimize bundle;
- begin Simplified Chinese onboarding.

This is closure/documentation reconciliation only.

---

# Verification

Run:

```text
git diff --check
```

If only documentation changes occur, no full build/test suite is required unless repository policy requires it.

Confirm:

- no runtime implementation files changed;
- no Polish semantic/reference/fauna artifacts changed;
- no CSS/UI files changed;
- no commit/push occurred.

---

# Completion criteria

This task is complete when:

- Polish is documented as Supported;
- manual 200% and Narrator closure evidence is recorded;
- known global Narrator issues remain correctly classified;
- Polish locale profile is final;
- supported-language list includes Polish;
- Simplified Chinese is the only remaining V1 locale target;
- selector ordering remains deferred;
- XLIFF cleanup remains deferred;
- bundle review remains deferred;
- no implementation behavior changed.

---

# Completion response

Return:

1. branch;
2. files changed;
3. Polish final support status;
4. manual 200% zoom evidence recorded;
5. Narrator smoke evidence recorded;
6. import/export announcement evidence recorded;
7. known Narrator shortcut issue disposition;
8. Polish locale profile update summary;
9. fauna evidence final status;
10. search policy final status;
11. browser mapping final status;
12. count-neutral plural policy final status;
13. Solar/Wind layout debt disposition;
14. Resource Matrix layout debt disposition;
15. supported Bethesda-language list after closure;
16. remaining V1 locale list;
17. Simplified Chinese status;
18. selector-order deferred status;
19. native-speaker review status;
20. Apple/WebKit deferred status;
21. XLIFF cleanup deferred status;
22. post-localization bundle-review deferred status;
23. backlog changes, if any;
24. architecture-document changes, if any;
25. confirmation no runtime/UI/CSS/localization-artifact changes occurred;
26. `git diff --check` result;
27. confirmation no commit/push occurred;
28. recommended next planning step;
29. suggested documentation commit message.

The suggested commit message should be descriptive and contain no planning identifiers.

Do not commit or push unless explicitly instructed.
