# CODEX CORRECTION / FOLLOW-UP BRIEF — System / Body Placeholder Copy and Width Reassessment

## Objective

Revisit the conclusions of:

```text
docs/audits/SYSTEM-BODY-SELECT-WIDTH-REVIEW.md
```

The audit's measurements were useful, but its **SGEO-A conclusion is not accepted as final** because the dominant width constraint came from verbose placeholder text rather than real selectable System/Body names.

The key issue is conceptual:

> Placeholder copy is editable UI text. It should not be allowed to dictate the geometry of a control when the placeholder itself redundantly repeats information already supplied by the visible field label.

The current UI already labels the fields:

```text
SYSTEM
BODY
```

Therefore placeholder copy such as:

```text
Select system...
Select body...
Sélectionner un système stellaire…
Sélectionner un corps céleste...
```

is more verbose than necessary.

This follow-up has two stages:

1. define and implement concise, natural placeholders across all supported locales;
2. rerun the select-width analysis using the revised placeholders plus the actual selectable labels.

Do not change System/Body widths until the new placeholder copy is settled and remeasured.

---

## 1. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read:

```text
AGENTS.md
docs/CODE-STYLE.md
docs/UX-DESIGN.md
docs/audits/SYSTEM-BODY-SELECT-WIDTH-REVIEW.md
src/ui/components/OutpostDetails.tsx
src/ui/components/OutpostDetails.css
```

Inspect all current locale entries for:

```text
outpost.system.select
outpost.body.select
```

Do not modify the supplied brief.

No commit, push, deployment, branch, tag, release, or remote operation is authorized.

---

## 2. Accepted audit findings

Retain the useful measured findings from the original audit:

- actual System/Body populations and locale-aware name resolution;
- actual native Chromium select measurements;
- current track widths;
- widest real System labels;
- widest real Body labels;
- stale-ID recovery analysis;
- responsive/container-query measurements;
- biome wrapping methodology;
- Chromium/font limitations.

Do not discard or rewrite the original audit.

This task should supersede only the conclusion that current width must be preserved because the current placeholder is the governing value.

---

## 3. Rejected assumption

Do not treat current placeholder strings as immutable geometry requirements.

In particular, the original audit found:

```text
French System placeholder:
Sélectionner un système stellaire…
```

to be the decisive global width constraint.

That should now be treated as a **copy-design problem first**, not a reason to retain a 13rem System track.

Likewise, Body placeholders that exceed all real Body names should be treated as candidate copy simplifications before geometry is decided.

---

## 4. Placeholder design principle

The visible field label already provides the noun/context.

Therefore the placeholder should generally express only the action/state:

```text
Select...
Choose...
or the natural locale equivalent
```

Conceptually:

```text
SYSTEM
[ Select... ]

BODY
[ Select... ]
```

is preferable to:

```text
SYSTEM
[ Select system... ]

BODY
[ Select body... ]
```

provided the shorter wording is natural and unambiguous in each locale.

Do not mechanically translate English `Select...`.

Each locale should use a concise, idiomatic prompt appropriate under an already-labelled field.

---

## 5. Locale scope

Review and update, if appropriate:

```text
en-US
en-GB
fr-FR
de-DE
it-IT
ja-JP
pl-PL
pt-BR
zh-Hans
es-ES
```

Current keys:

```text
outpost.system.select
outpost.body.select
```

Where the same concise prompt is natural for both System and Body, the values may be identical.

Do not merge/remove localization keys solely because values become identical.

Preserve key compatibility unless there is a strong reason otherwise.

---

## 6. Localization quality standard

For each locale, choose wording that is:

```text
short
natural
clear beneath an explicit field label
not a fragment that sounds broken in that language
not unnecessarily formal
not a duplicate of SYSTEM/BODY
```

If a locale genuinely requires the noun for grammatical clarity, retain only as much as necessary.

Do not optimize blindly for shortest character count.

Document the chosen System and Body placeholder for each locale and the rationale where non-obvious.

---

## 7. English baseline

English may use:

```text
Select...
```

for both System and Body unless repository style strongly favors another concise wording.

The exact punctuation should remain consistent with existing UI conventions.

Do not introduce different English System/Body verbs merely for variety.

---

## 8. Re-run width measurement after copy update

After updating placeholder strings, repeat the relevant geometry analysis.

For each locale measure:

```text
widest real System value
System placeholder
widest real Body value
Body placeholder
```

using the same runtime/native-control methodology as the original audit.

Use actual resolved fonts.

Record:

```text
text width
native control minimum
comfortable target
```

Do not use character count as a substitute.

---

## 9. Real selectable values should now dominate normal geometry

The normal target width should be based primarily on:

```text
actual selectable localized names
+ native control chrome
+ sensible safety margin
```

not verbose placeholders.

If a revised placeholder is still wider than the widest real value in some locale, determine whether that is grammatically necessary or whether it can still be improved.

---

## 10. Reassess System and Body independently

Do not assume equal widths.

Recalculate:

```text
recommended System minimum / maximum
recommended Body minimum / maximum
```

based on the revised copy.

Possible outcomes:

```text
same width for both
System wider
Body wider
different max values
current widths still justified
```

Use evidence, not symmetry.

---

## 11. Candidate geometry testing

Test at least a few plausible bounded candidates.

Examples only:

```text
System 11rem / Body 11rem
System 11.5rem / Body 11.5rem
System 12rem / Body 12rem
independent System/Body values
```

Do not assume these examples are correct.

Use the measured worst cases plus safety margin to define real candidates.

Keep the existing `minmax` behavior unless the evidence strongly favors another simple model.

---

## 12. Biome-space benefit

For each viable candidate, measure:

```text
System width delta
Body width delta
total reclaimed horizontal space
Biome track width increase
biome row-count changes
```

Repeat on representative stress cases such as:

```text
Huygens III
```

and any other body with many/long biome labels if useful.

This time, test candidates large enough to determine whether a **meaningful** biome wrapping improvement is possible.

Do not stop after only a ~0.75rem Body-only reduction if both controls can now potentially shrink.

---

## 13. Representative viewport sizes

Measure at minimum:

```text
1600×900
1366×768
1181×900
1180×900
930×900
929×900
```

Preserve the existing:

```text
1180px media rule
39rem selected-outpost container rule
```

unless the new measurements reveal a direct reason they must change.

This task is about select width/copy first, not breakpoint redesign.

---

## 14. 200% zoom

Perform a real 200% browser-zoom manual check if available.

At minimum confirm:

```text
normal selected System value readable
normal selected Body value readable
placeholder readable
focus outline unaffected
disabled Body control readable
stacked layout usable
```

Do not size the desktop tracks solely around the narrow stacked 200% state, where the container query controls layout independently.

---

## 15. Stale-ID recovery

Keep the original audit's conclusion:

```text
arbitrarily long unknown imported IDs are a recovery-state exception
```

Do not allow unbounded stale IDs to dictate normal control width.

Canonical current IDs must still fit comfortably.

Do not remove unresolved-ID fallback behavior.

---

## 16. Browser/font margin

The prior audit lacked Safari/Firefox and did not have the preferred Barlow web font available locally.

Therefore preserve sensible width slack beyond the Chromium mathematical minimum.

Do not choose a width that fits the single measured browser/font combination by only a few pixels.

A modest future-name-growth margin is also appropriate.

---

## 17. Implementation boundary

This follow-up may change:

```text
localized placeholder strings
associated localization review/test fixtures
OutpostDetails desktop track widths, if remeasurement supports a change
relevant tests
current durable UX docs if they mention placeholder wording/width
```

Do not change:

```text
System/Body option populations
reference names
reference data
biome button styling
breakpoints unless absolutely required
component semantics
persistence
app version
```

---

## 18. Localization verification

Because placeholder copy changes across locales, use the established localization workflow.

Update all required:

```text
locale catalogues
review drafts/packages/CSVs where applicable
exact-copy/localization tests
```

Do not leave review artifacts inconsistent with production catalogues.

Run:

```text
npm run localization:verify
```

and any focused localization tests required by the repository.

---

## 19. Recommended disposition after reassessment

Replace the original audit's effective conclusion with one of:

```text
SGEO2-A — concise placeholders adopted; current widths still appropriate

SGEO2-B — concise placeholders adopted; one or both controls can safely shrink

SGEO2-C — concise placeholders adopted; one or both controls should grow

SGEO2-D — concise placeholders adopted; fixed/minmax model still requires broader layout work
```

Use the narrowest justified outcome.

Do not mechanically preserve SGEO-A.

---

## 20. If width change is recommended

Specify exactly:

```text
System track
Body track
units
minimum
maximum
safety margin
Biome space reclaimed
measured biome row-count effect
100% result
200% result
responsive rule impact
```

Prefer a small CSS-only geometry change after the localization update.

---

## 21. If no width change is recommended

Still keep the concise placeholder copy if it is a UX improvement and all locales verify cleanly.

Explain why the geometry remains unchanged despite removing the previous placeholder constraint.

---

## 22. Verification

Run at minimum:

```sh
npm run localization:verify
npm test
npm run test:components
npm run typecheck:tests
npm run build
npm run lint
git diff --check
```

If this task remains only localization + CSS, full behavioral testing may be broader than strictly necessary, but the repository is pre-release and the change touches all locales, so run the normal suite.

Also perform manual/runtime width measurements for the selected final candidate.

---

## 23. Stop conditions

Stop and report if:

- any locale cannot express a concise natural placeholder without retaining the noun;
- the new copy creates ambiguity when read under the visible field label;
- measured widths vary enough by browser/font that a safe reduction cannot be justified;
- a useful width reduction would require breakpoint/layout redesign beyond this task;
- localization review artifacts cannot be updated consistently.

Do not force a width reduction merely because the old placeholder constraint is gone.

---

## 24. Non-goals

Do not:

```text
redesign the entire details strip
change biome button size/style
change select semantics
replace native selects
change reference names
change reference datasets
change app version
change deployment
change unrelated localization
commit
push
deploy
```

---

## 25. Completion report

Report:

1. baseline branch/commit;
2. final placeholder values for all locales;
3. any locale retaining System/Body-specific nouns and why;
4. revised widest System measurement;
5. revised widest Body measurement;
6. revised System comfortable minimum;
7. revised Body comfortable minimum;
8. geometry candidates tested;
9. final System track recommendation;
10. final Body track recommendation;
11. total Biome space reclaimed;
12. biome wrapping effect;
13. 1181/1180 behavior;
14. 930/929 behavior;
15. 200% zoom result;
16. stale-ID result;
17. localization verification;
18. full tests/build/lint result;
19. `git diff --check`;
20. SGEO2-A/B/C/D disposition;
21. confirmation no reference/persistence/version/deployment/remote change occurred.

Suggested commit message, if copy and geometry both change:

```text
fix: tighten outpost location controls
```

If only placeholder copy changes:

```text
fix: simplify outpost location placeholders
```
