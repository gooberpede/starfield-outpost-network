# System / Body Placeholder and Width Reassessment

## Disposition

**SGEO2-B — concise placeholders adopted; both controls can safely shrink.**

The original audit remains the historical record of the initial measurements.
This reassessment accepts its option-population, recovery-state, breakpoint,
and native-control findings, but supersedes SGEO-A because the former governing
values were redundant placeholders rather than selectable reference names.

The implemented desktop tracks are now:

```css
minmax(10rem, 11rem) /* System */
minmax(10rem, 11rem) /* Body */
```

At the 18 px desktop root size, each maximum is 198 px. This reclaims 36 px per
control and 72 px for Biomes at ordinary desktop widths.

## Baseline and scope

| Item | Value |
| --- | --- |
| Branch | `staging` |
| Commit | `171e86c035c37a0312cb2107e1cca9598cb39ce3` |
| Initial tracked state | Clean |
| Initial untracked state | Original audit, original audit brief, and supplied correction brief |
| Browser | Local Google Chrome 153, native-select measurement through DevTools Protocol |
| Other browsers | Safari and Firefox were unavailable |

The supplied briefs and the original audit were not modified. No reference
data, persistence, version, breakpoint, deployment, branch, tag, commit,
push, or other remote state was changed.

## Placeholder decisions

The visible System and Body labels supply the noun, so all ten locales can use
the same concise action prompt for both keys without ambiguity.

| Locale | System | Body | Rationale |
| --- | --- | --- | --- |
| en-US | `Select...` | `Select...` | Existing verb and punctuation, without the repeated noun |
| en-GB | `Select...` | `Select...` | Inherits the English baseline; no regional spelling difference |
| fr-FR | `Sélectionner…` | `Sélectionner…` | Natural infinitive beneath the persistent label |
| de-DE | `Auswählen...` | `Auswählen...` | Natural action prompt without a repeated compound noun |
| it-IT | `Seleziona...` | `Seleziona...` | Existing imperative retained, noun removed |
| ja-JP | `選択...` | `選択...` | Compact interface action; existing ASCII ellipsis convention retained |
| pl-PL | `Wybierz...` | `Wybierz...` | Existing imperative remains complete in labelled context |
| pt-BR | `Selecione...` | `Selecione...` | Existing imperative retained, noun removed |
| zh-Hans | `请选择……` | `请选择……` | Concise, idiomatic polite prompt with established Chinese punctuation |
| es-ES | `Selecciona...` | `Selecciona...` | Existing imperative retained, noun removed |

No locale required a System- or Body-specific noun. The localization keys were
kept separate for compatibility. Their catalogues, independent drafts, review
CSVs, source hashes, adjudication notes, and exact-copy tests were updated.

## Revised native-control measurements

Measurements used the rendered `500 14.4px/1` select style. Text widths came
from the browser text metrics and native minimums from temporary auto-width
Chromium selects. The preferred Barlow face and the Japanese and Simplified
Chinese system faces reported available during this pass. This differs from
the original audit, where Barlow was unavailable, and reinforces retaining
more than a mathematical-fit margin.

Each pair below is `text width / native minimum` in CSS pixels.

| Locale | System placeholder | Widest real System | Body placeholder | Widest real Body |
| --- | ---: | ---: | ---: | ---: |
| en-US | 52.02 / 75 | Van Maanen's Star — 120.95 / 143 | 52.02 / 75 | Copernicus Minor I-a — 133.65 / 156 |
| en-GB | 52.02 / 75 | Van Maanen's Star — 120.95 / 143 | 52.02 / 75 | Copernicus Minor I-a — 133.65 / 156 |
| fr-FR | 94.45 / 117 | Étoile de Van Maanen — 140.63 / 163 | 94.45 / 117 | Copernicus Minor I-a — 133.65 / 156 |
| de-DE | 82.45 / 105 | Van Maanens Stern — 126.21 / 149 | 82.45 / 105 | Copernicus Minor I-a — 133.65 / 156 |
| it-IT | 75.25 / 98 | Stella di Van Maanen — 135.82 / 158 | 75.25 / 98 | Copernicus Minor I-a — 133.65 / 156 |
| ja-JP | 39.22 / 62 | コペルニクス・マイナー — 117.46 / 140 | 39.22 / 62 | プロクシマ・ターニオンIV-a — 142.91 / 165 |
| pl-PL | 63.88 / 86 | Gwiazda van Maanena — 147.29 / 170 | 63.88 / 86 | Copernicus Minor I-a — 133.65 / 156 |
| pt-BR | 75.25 / 98 | Estrela de Van Maanen — 149.43 / 172 | 75.25 / 98 | Proxima Ternion IV-a — 133.66 / 156 |
| zh-Hans | 66.63 / 89 | 帕弗尼斯星系德尔塔星 — 144.00 / 166 | 66.63 / 89 | 安德拉斯塔阿尔法星I-a — 148.02 / 171 |
| es-ES | 82.45 / 105 | Estrella de Van Maanen — **152.63 / 175** | 82.45 / 105 | Proxima Ternion IV-a — 133.66 / 156 |

The governing normal System value is Spanish `Estrella de Van Maanen` at a
175 px native minimum. The governing normal Body value is Simplified Chinese
`安德拉斯塔阿尔法星I-a` at 171 px. Neither revised placeholder governs geometry.

The 198 px comfortable target leaves 23 px above the System native minimum and
27 px above Body. This is substantially more than the original audit's 9 px
calculation margin while still allowing a useful Biome gain. System and Body
were assessed independently; their targets converge on 11 rem after rounding
to a simple half-rem boundary.

## Candidate geometry and Biome benefit

Huygens III, with eight biome buttons, was the representative stress body.
The table reports rendered track widths and row counts at 100%.

| Candidate | 1600 Biomes / rows | 1366 Biomes / rows | 1181 Biomes / rows |
| --- | ---: | ---: | ---: |
| Current 13 / 13 rem | 532 px / 2 | 349.25 px / 3 | 216 px / 5 |
| 12 / 12 rem | 568 px / 2 | 385.25 px / 3 | 216 px / 5 |
| 11.5 / 11.5 rem | 586 px / 2 | 403.25 px / 3 | 218.27 px / 5 |
| **11 / 11 rem** | **604 px / 2** | **421.25 px / 2** | **236.27 px / 4** |
| 10.75 / 11 rem | 608.5 px / 2 | 425.75 px / 2 | 240.77 px / 4 |

The selected 11 / 11 rem pair is the first simple candidate to produce a
meaningful wrap change: Huygens III drops from three rows to two at 1366×768
and from five rows to four at 1181×900. The independent 10.75 / 11 rem option
adds only 4.5 px of Biome width and no further row reduction, while reducing
System's cross-browser margin. The 11.5 and 12 rem candidates retain more
unused select width but miss both useful wrap thresholds.

At 1600×900 and 1366×768, System and Body change from 234 px to 198 px and
Biomes gains the full 72 px. At 1181×900 the old tracks were already compressed
to about 208.13 px, so the implemented tracks reclaim about 20.27 px.

## Responsive boundaries

The existing breakpoint and container query remain unchanged.

| Viewport | System | Body | Biomes | Result |
| --- | ---: | ---: | ---: | --- |
| 1181×900 | 198 px | 198 px | 236.27 px | Desktop five-column rule; Huygens III uses 4 rows |
| 1180×900 | 329.13 px | 329.14 px | 838.27 px | Existing four-column media rule; Biomes spans row 2 |
| 930×900 | 232.06 px | 232.06 px | 624.13 px | Four-column rule remains active |
| 929×900 | 307.56 px | 307.56 px | 623.13 px | Existing 39rem two-column stack remains active |

Candidate desktop overrides produced identical measurements at 1180, 930, and
929 px, confirming that the width change does not leak across either boundary.

## 200% zoom-equivalent check

The available in-app browser ignored browser-zoom shortcuts and exposed no
zoom control, so a real browser-zoom pass could not be completed. The same
1366×768-to-683×384, DPR 2 model used by the original audit was rerun against
the final implementation rather than being presented as real zoom.

The 39rem container rule produced two 184.56 px tracks. `Huygens` and
`Huygens III` were readable; the `Select...` placeholder and disabled Body
placeholder were readable; Body used the native disabled state; the 2 px focus
outline and 2 px offset were unchanged; and the layout remained usable as
System/Body, Solar/Wind, then Biomes rows. The desktop maximum does not govern
this stacked state.

## Stale IDs and limitations

The original stale-ID conclusion stands. Canonical current System and Body
labels fit the final tracks with the margins above. Arbitrarily long unknown
imported IDs remain a recovery-state exception and must not dictate normal
control width; unresolved-ID fallback behavior was not changed.

Native minimums are Chromium-specific. Safari and Firefox were unavailable,
and future font or reference-name changes can alter metrics. The 23–27 px
desktop margin is therefore intentional. The original audit's 121 eligible
systems, 676 eligible bodies, resolution behavior, and stale-ID analysis were
accepted rather than redefined.

## Verification

All required checks passed after the final CSS and localization changes:

- `npm run localization:verify`
- `npm test` — 275 passed
- focused localization tests — 44 passed
- `npm run test:components` — 100 passed across 10 files
- `npm run typecheck:tests`
- `npm run build`
- `npm run lint`
- `git diff --check`

The production build retained its existing large-chunk advisory; it did not
fail. No reference data, option population, component semantics, persistence,
version, deployment, or remote repository state changed.

Suggested commit message: `fix: tighten outpost location controls`
