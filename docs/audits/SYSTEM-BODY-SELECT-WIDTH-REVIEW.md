# System / Body Select Width Review

## Disposition

**SGEO-A — current System/Body widths are appropriate; no change recommended.**

The System maximum is content-constrained by the French placeholder. Body has a
small bounded reduction available in Chromium, but the useful maximum reduction
does not change representative biome wrapping. Keeping the current shared
`minmax(10rem, 13rem)` tracks preserves more browser/font/reference-data margin
than the tested alternative without a measurable layout cost.

No application CSS, TSX, reference data, localization, breakpoint, or biome
button implementation was changed by this audit.

## Baseline

| Item | Value |
| --- | --- |
| Branch | `staging` |
| Commit | `171e86c035c37a0312cb2107e1cca9598cb39ce3` |
| Initial working tree | Untracked supplied brief only: `docs/implementation-briefs/CODEX_AUDIT_BRIEF_system-body-select-width-review.md` |
| Browser | Local Google Chrome `153.0.8010.53`, headless DevTools Protocol measurement |
| Other-browser coverage | No Safari or Firefox runtime was available; exact native-select results are Chromium-specific |

The supplied brief remained unmodified. A separate Chromium profile and
ephemeral browser-only CSS were used for candidate geometry; neither was part of
the repository or the application implementation.

## Method

The audit read the current component, CSS, localization resolution, generated
reference-name overlays, and deployed reference-data assets. It reproduced the
component populations exactly:

- 121 systems having at least one `outpostAllowed` body;
- 676 `outpostAllowed` bodies globally;
- the current unresolved System and Body option behavior;
- all ten supported locales through `getReferenceDisplayName` and `translate`;
- biome button grouping and localization through `getBiomeButtonGroups` and
  `getBiomeGroupDisplayName`.

Rendered text widths came from inline browser layout at the actual select font,
not character counts. Native minimums came from temporary, auto-width native
`<select>` controls populated with the same options. That measurement includes
Chromium's border, content inset, dropdown indicator, and native clearance even
though computed CSS reports `0px` padding and `1px` borders.

The comfortable targets below add about `0.5rem` (9 px at the desktop root
size), then round upward to a quarter-rem boundary. That margin is intentionally
not tuned to the mathematical minimum.

## Fonts

At 100% desktop layout the select declaration resolves to `500 14.4px/1`.
Availability checks and metric comparisons found:

| Locale group | CSS preference | Font used for the recorded measurements |
| --- | --- | --- |
| Latin locales | Barlow Semi Condensed, Arial Narrow, system fallbacks | **Arial Narrow**; Barlow Semi Condensed was unavailable in the audit browser |
| `ja-JP` | Yu Gothic UI, Yu Gothic, Hiragino Sans, Meiryo, fallback | **Yu Gothic UI** |
| `zh-Hans` | Microsoft YaHei UI, Microsoft YaHei, PingFang SC, Noto Sans CJK SC, fallback | **Microsoft YaHei UI** |

The unavailable preferred web font is a reason to keep measured slack: a
successful Barlow load or another platform fallback can change widths. The
recommendation does not claim pixel-equivalence on Safari.

## Worst-case runtime measurements

“Native minimum” is the auto-width Chromium closed control containing every
eligible option and the placeholder for that locale. “Comfortable target” adds
the safety margin described above. Current desktop width is 234 px (13 rem) at
both representative desktop viewports.

| Locale | Control | Governing display value | Text width | Native minimum | Comfortable target | Current width | Slack to target |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| en-US | System | Van Maanen's Star | 104.45 px | 124 px | 135 px | 234 px | 99 px |
| en-US | Body | Proxima Ternion IV-a | 120.75 px | 140 px | 153 px | 234 px | 81 px |
| en-GB | System | Van Maanen's Star | 104.45 px | 124 px | 135 px | 234 px | 99 px |
| en-GB | Body | Proxima Ternion IV-a | 120.75 px | 140 px | 153 px | 234 px | 81 px |
| fr-FR | System | Sélectionner un système stellaire… | 203.84 px | 220 px | **234 px** | 234 px | **0 px** |
| fr-FR | Body | Sélectionner un corps céleste... | 183.55 px | 200 px | 211.5 px | 234 px | 22.5 px |
| de-DE | System | Sternsystem auswählen... | 148.00 px | 166 px | 175.5 px | 234 px | 58.5 px |
| de-DE | Body | Himmelskörper auswählen... | 163.58 px | 181 px | 193.5 px | 234 px | 40.5 px |
| it-IT | System | Stella di Van Maanen | 118.64 px | 138 px | 148.5 px | 234 px | 85.5 px |
| it-IT | Body | Seleziona corpo celeste... | 148.86 px | 167 px | 180 px | 234 px | 54 px |
| ja-JP | System | コペルニクス・マイナー | 119.45 px | 140 px | 153 px | 234 px | 81 px |
| ja-JP | Body | プロクシマ・ターニオンIV-a | 145.63 px | 165 px | 175.5 px | 234 px | 58.5 px |
| pl-PL | System | Gwiazda van Maanena | 126.44 px | 146 px | 157.5 px | 234 px | 76.5 px |
| pl-PL | Body | Wybierz ciało planetarne... | 155.86 px | 173 px | 184.5 px | 234 px | 49.5 px |
| pt-BR | System | Estrela de Van Maanen | 130.53 px | 149 px | 162 px | 234 px | 72 px |
| pt-BR | Body | Selecione o corpo celeste... | 160.11 px | 178 px | 189 px | 234 px | 45 px |
| zh-Hans | System | 帕弗尼斯星系德尔塔星 | 145.81 px | 166 px | 175.5 px | 234 px | 58.5 px |
| zh-Hans | Body | 安德拉斯塔阿尔法星I-a | 150.19 px | 171 px | 180 px | 234 px | 54 px |
| es-ES | System | Selecciona un sistema... | 141.02 px | 159 px | 171 px | 234 px | 63 px |
| es-ES | Body | Selecciona un cuerpo celeste... | 181.11 px | 198 px | 211.5 px | 234 px | 22.5 px |

The global comfortable minimums are therefore:

- **System: 13rem / 234 px** because French needs 220 px of native control
  width and the remaining 14 px is the safety margin;
- **Body: 12rem / 216 px** would be a defensible Chromium content floor, giving
  16 px over the 200 px French native minimum.

The latter is a content floor, not the final recommendation. Browser variance,
the missing preferred Latin web font, reference-name growth, and the lack of a
biome wrapping benefit justify retaining 13 rem.

### Top real System labels

The widest real System value by locale was:

| Locale | Widest real System | Width |
| --- | --- | ---: |
| en-US / en-GB | Van Maanen's Star | 104.45 px |
| fr-FR | Étoile de Van Maanen | 122.84 px |
| de-DE | Van Maanens Stern | 110.08 px |
| it-IT | Stella di Van Maanen | 118.64 px |
| ja-JP | コペルニクス・マイナー | 119.45 px |
| pl-PL | Gwiazda van Maanena | 126.44 px |
| pt-BR | Estrela de Van Maanen | 130.53 px |
| zh-Hans | 帕弗尼斯星系德尔塔星 | 145.81 px |
| es-ES | Estrella de Van Maanen | 133.78 px |

Other repeatedly wide values included Bannoc Secondus, Copernicus Minor,
Proxima Ternion, localized Kapteyn's Star, and localized Barnard's Star.

### Top real Body labels

| Locale | Widest real Body | Width |
| --- | --- | ---: |
| en-US / en-GB / fr-FR / de-DE / it-IT / pl-PL / pt-BR / es-ES | Proxima Ternion IV-a | 120.75 px |
| ja-JP | プロクシマ・ターニオンIV-a | 145.63 px |
| zh-Hans | 安德拉斯塔阿尔法星I-a | 150.19 px |

The next English/fallback-width cases were Copernicus Minor I-b (120.30 px),
Copernicus Minor I-a (119.98 px), Proxima Ternion I-b (113.95 px), and Proxima
Ternion I-a (113.64 px). Japanese and Simplified Chinese localized the same
families into their own widest group.

### Placeholders and headings

Placeholders, not real names, govern French System and French/Spanish/German/
Italian/Polish/Portuguese Body. The French System placeholder is the decisive
global constraint. It is 203.84 px as text and 220 px with native Chromium
chrome. French Body is 200 px as a native control; Spanish Body is 198 px.

The widest headings were French `Système stellaire` (100.06 px) and Polish
`Ciało planetarne` (96.59 px). Headings are not limiting.

## Stale-ID behavior

Current canonical IDs are much narrower than localized names: System IDs are
short decimal strings and Body IDs are eight-character FormID-like hexadecimal
strings. They fit comfortably in both tracks.

Imported unknown IDs are not length-bounded, however. Chromium clips an
overlong closed selected value; no application ellipsis policy makes the whole
identifier readable. No finite content-derived width can guarantee arbitrary
unknown input without allowing it to dominate layout. This is classified as a
recovery-state exception: preserve the fallback option and current generous
width, but size normal geometry from placeholders and selectable reference
content. The open menu still exposes the option; hover/title is not treated as
a substitute for a readable normal selected value.

## Current layout geometry

Measurements used a clean isolated browser profile and one generated outpost.
Solar and Wind are 4.25 rem (76.5 px) at the desktop root size.

| Viewport | Selected-outpost / grid width | System | Body | Solar | Wind | Biomes | Gap | Layout |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1600×900 | 1207 px | 234 px | 234 px | 76.5 px | 76.5 px | 532 px | 13.5 px | One row |
| 1366×768 | 1024.25 px | 234 px | 234 px | 76.5 px | 76.5 px | 349.25 px | 13.5 px | One row |
| 1181×900 | 839.27 px | 208.13 px | 208.14 px | 76.5 px | 76.5 px | 216 px | 13.5 px | Last one-row viewport |
| 1180×900 | 838.27 px | 329.13 px | 329.14 px | 76.5 px | 76.5 px | 838.27 px | 9 px | Biomes span row 2 |
| 1024×900 | 718.13 px | 279.06 px | 279.06 px | 68 px | 68 px | 718.13 px | 8 px | Biomes span row 2 |
| 930×900 | 624.13 px | 232.06 px | 232.06 px | 68 px | 68 px | 624.13 px | 8 px | Four-column rule |
| 929×900 | 623.13 px | 307.56 px | 307.56 px | 68 px | 68 px | 623.13 px | 8 px | 39rem two-column stack |

At 1181 px, French System's 220 px native minimum exceeds the 208.13 px track;
the placeholder can clip in the narrow interval immediately above the existing
1180 px transition. At 1180 px the control expands to 329 px and the issue
disappears. This is an existing breakpoint-edge localization limitation, not
evidence that either 13 rem desktop maximum should shrink. A future task could
review the transition threshold, but this audit does not recommend a broader
responsive change for that small interval.

The selected-outpost container crosses 39 rem between the measured 930 px and
929 px viewport cases. Once stacked, desktop fixed/max widths are irrelevant:
System and Body become equal `1fr` columns.

## Biome-space benefit

The stress body was **Huygens III**, which has eight mixed-length buttons:
Deciduous Forest, Ocean, Frozen Crevasses, Mountains, Swamp, Wetlands, Savanna,
and Tropical Forest. The same stable groups were localized in every locale.

An ephemeral candidate reduced only Body from 13 rem to 12.25 rem:

| Viewport | Current System | Candidate System | Current Body | Candidate Body | Biome gain |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1600×900 | 234 px | 234 px | 234 px | 220.5 px | 13.5 px / 0.75 rem |
| 1366×768 | 234 px | 234 px | 234 px | 220.5 px | 13.5 px / 0.75 rem |

That candidate retained 20.5 px above French Body's Chromium native minimum.
It changed **zero biome row counts**:

- 1600×900: Latin locales remained at 2 rows; Japanese and Simplified Chinese
  remained at 1 row;
- 1366×768: English, French, German, Italian, Portuguese, and Spanish remained
  at 3 rows; Japanese, Polish, and Simplified Chinese remained at 2 rows.

A 12 rem Body floor could return 18 px, but it would reduce browser/font slack
without evidence that the extra 4.5 px would cross a useful wrapping threshold.
The brief's standard says not to recommend narrowing when the reclaimed width
does not produce a meaningful Biome improvement. System has no comparable safe
reduction because French consumes its maximum.

## Zoom and accessibility

The automation surface could not invoke browser chrome zoom reliably. The
closest valid Chromium method used a 683×384 CSS viewport at device scale factor
2 to model a 1366×768 display at 200%.

At that condition:

- the selected-outpost was 377.13 CSS px wide;
- the 39rem container rule was active;
- System and Body were equal 184.56 px tracks;
- ordinary selected values such as Huygens and Huygens III remained readable;
- widest normal localized reference values remain below those tracks after the
  16 px root-font scaling;
- the French System placeholder is the exception: its approximately 195.6 px
  scaled native requirement exceeds the 184.56 px track and can clip;
- the French Body placeholder remains within the track at approximately 177.8 px.

The tested Body-only desktop candidate cannot worsen the 200% result because
the container query replaces its desktop track definition. Native semantic
select behavior, disabled state, keyboard operation, focus outline, and
focus-outline clearance remain unchanged. The ephemeral candidate changed no
control styling or focus geometry.

## Options

### A — keep current tracks

Best overall. It is the only option that gives the French System placeholder a
reasonable desktop safety margin, keeps 34 px above the largest Body native
minimum, and avoids spending robustness for a Biome gain that did not alter
wrapping.

### B — smaller independent min/max tracks

Body could use `minmax(10rem, 12.25rem)` in Chromium, returning 13.5 px. The
stress test found no row-count improvement. `12rem` is the approximate global
Body content floor with safety margin, but its extra risk is not justified.
System should not have a maximum below 13 rem.

### C — fixed content-informed widths

`13rem 12rem` is content-defensible at ordinary desktop width, but loses the
useful gradual compression already provided by `minmax`, does not solve the
1181 px transition edge by itself, and still provides no demonstrated Biome
row benefit.

### D — intrinsic sizing

Native select intrinsic width successfully reflects all current options in
Chromium, but `max-content`/`fit-content` would couple the grid to
browser-specific select chrome, the active locale, and arbitrary stale IDs.
It also complicates interaction with `width: 100%`, the 1180 px media rule, and
the flexible Biome track. Cross-browser behavior is less predictable than the
current bounded tracks.

### E — no change

Selected. Current Body slack is useful future/browser margin; current System
slack is required. The tested reclaim is not material.

## Recommended geometry

Keep the existing desktop declaration exactly as-is:

```css
grid-template-columns:
  minmax(10rem, 13rem)
  minmax(10rem, 13rem)
  4.25rem
  4.25rem
  minmax(12rem, 1fr);
```

- System final track: unchanged `minmax(10rem, 13rem)`.
- Body final track: unchanged `minmax(10rem, 13rem)`.
- Biome space reclaimed/lost: **0 px**.
- 1180 px rule: unchanged; it already moves Biomes to a full-width second row.
- 39rem container rule: unchanged; it already makes System and Body equal
  flexible columns, so desktop sizing is irrelevant there.
- Expected biome wrapping change: none.

## Finite later verification plan

No implementation is recommended. If a later task nevertheless trials an
independent Body maximum, limit the implementation to the first desktop grid
track declaration in `src/ui/components/OutpostDetails.css`; do not change TSX,
localization, data, breakpoints, biome buttons, or the container-query rule.

Verify only:

1. 1366×768 and 1600×900 at 100%;
2. a real 200% browser-zoom pass, supplementing this audit's DPR/viewport model;
3. all ten locales with the widest System and Body values above;
4. French System and French/Spanish Body placeholders;
5. canonical System/Body IDs and one deliberately long stale imported ID;
6. Huygens III or another eight-biome body in long-label locales;
7. 1181 px and 1180 px viewport widths;
8. 930 px and 929 px viewport widths for the 39rem transition;
9. keyboard focus and focus outline;
10. the disabled Body control with no selected System.

The pass criterion is readable normal selected content, no new clipping at
200%, no loss of focus/disabled-state clarity, and a demonstrated biome-row or
otherwise material spacing improvement. Without that improvement, retain the
current tracks.
