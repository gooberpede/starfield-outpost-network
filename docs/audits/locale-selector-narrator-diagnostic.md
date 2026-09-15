# Locale Selector / Narrator Diagnostic

## Observed behavior

In the reported Windows Narrator test, the expanded native locale selector exposes four options. Narrator announces the English options with their text and position, but announces only “Four of four” when navigation reaches the Japanese option. It does not speak `日本語`, `ja-JP`, or another identifying name.

This diagnostic did not reproduce or record Narrator speech. It inspected the application DOM and a live Chromium accessibility tree, then compared the application with a minimal native-select reproduction.

## Current implementation

`TitleBar.tsx` renders a controlled native `<select>`. Its options come from `getLocaleSelectorOptions()`, which combines the dynamic Automatic option with the three records in the locale registry.

With Automatic resolving to `en-US`, the rendered options were:

| Value | Visible text | `label` | `aria-label` | `lang` | Effective inherited language | Selected |
| --- | --- | --- | --- | --- | --- | --- |
| `automatic` | `Automatic (EN-US)` | absent | absent | absent | `en-US` | yes |
| `en-US` | `English (US)` | absent | absent | absent | `en-US` | no |
| `en-GB` | `English (UK)` | absent | absent | absent | `en-US` | no |
| `ja-JP` | `日本語` | absent | absent | absent | `en-US` | no |

The Japanese option differs structurally from the English options only in its text and value. It has no application ARIA that could replace or suppress its text-derived native name.

The select itself has a localized `aria-label` and the previous correction’s `aria-describedby` relationship. The description identifies the effective locale when the closed selector is focused. `LocalizationProvider` updates the document language to the effective application locale, so options inherit the current application language rather than carrying their own language metadata.

## Browser accessibility evidence

The local application was inspected in the Codex in-app Chromium browser, using its live accessibility tree rather than JSDOM.

Before changing the selection, Chromium exposed:

```text
pop up button (expanded, settable)
  Description: Language and region
  Value: Automatic (EN-US)
  menu
    (selected) Automatic (EN-US)
    English (US)
    English (UK)
    日本語
```

After selecting `ja-JP`, Chromium exposed:

```text
pop up button (expanded, settable)
  Description: 言語と地域
  Value: 日本語
  menu
    自動（EN-US）
    English (US)
    English (UK)
    (selected) 日本語
```

The Japanese option therefore has a non-empty browser accessibility name, participates in the same menu/parent relationship as the English options, and exposes selected state. The parent native popup also exposes `日本語` as its value. The available tree formatter did not expose position/set-size or language metadata for individual option nodes.

These observations contradict an application defect in which the Japanese option has an empty accessible name. They do not prove that the separate Windows native-popup/UI Automation path seen by Narrator preserves every field from Chromium’s internal accessibility representation.

## Minimal native-select comparison

A temporary, untracked localhost page contained two otherwise identical native selectors. One Japanese option inherited `en-US`; the other used `lang="ja-JP"`. A separate Japanese paragraph also used `lang="ja-JP"`.

Chromium exposed both selectors identically at the inspected level:

```text
menu
  (selected) English (US)
  English (UK)
  Automatic
  日本語
```

Adding `lang="ja-JP"` did not change the exposed option name or hierarchy in the available accessibility-tree output. This is evidence that a language attribute is not required for Chromium to compute the option’s name. Because the tool did not expose language metadata and Narrator speech was unavailable, it does not establish whether the attribute would change voice selection or speech in Narrator.

The temporary reproduction was removed after inspection and was not committed.

## Narrator / language evidence

This environment could not exercise Windows Narrator, install or select a Japanese Narrator voice, toggle automatic language switching, or capture spoken output. It therefore could not determine directly whether:

- Narrator suppresses Japanese glyphs when no Japanese-capable voice is available;
- automatic language switching changes the result;
- the Windows native-select popup loses language information between Chromium and UI Automation;
- `lang="ja-JP"` changes actual speech despite leaving the inspected tree text unchanged.

Japanese text elsewhere in the application was present and correctly named in Chromium’s tree, but its Narrator pronunciation was not testable here.

## Root-cause assessment

This is **Outcome D — mixed / unresolved**, with the likely causes ranked as follows:

1. **Narrator voice/language handling or the Chromium-native-popup-to-Narrator boundary.** This is most plausible because Chromium exposes a non-empty `日本語` option name and correct selected state, while the reported speech retains only positional metadata.
2. **Missing per-option language metadata.** The Japanese option inherits `en-US` while English is active, so this is semantically plausible as a contributor to voice selection. However, the minimal comparison exposed the same option name with and without `lang="ja-JP"`; no evidence yet demonstrates that adding `lang` changes Narrator speech.
3. **A Chromium native-select accessibility defect specific to the Windows popup/UI Automation surface.** The internal Chromium tree looks correct, but the inspected tool may not represent the separate native popup exactly as Narrator receives it.
4. **Application naming or ARIA suppression.** This is unlikely. The option has ordinary text content, no `label`, no `aria-label`, and no structural difference from the English options. Both the application and the minimal selector expose its name.

The evidence is not sufficient to justify an English `aria-label`, a custom selector, or any other production workaround.

## Current `aria-describedby` assessment

**Recommendation: keep for now.**

The description does not repair option-list speech, because it describes the select rather than each native option. It nevertheless exposes the current effective locale when the selector itself is focused: Chromium reported the localized description and the correct current value before and after selection. It is therefore useful for the closed/focused control and is not misleading about what is selected.

Whether it creates redundant Narrator speech during ordinary closed-selector navigation remains a manual usability question. Remove it in a future correction only if Narrator testing demonstrates that the native name/value already provide the same information and the description adds noise.

## Recommended next step

**Perform one specific manual test before writing a correction brief.**

Using Windows Narrator in the same Chromium browser, test the minimal two-selector page with:

1. Japanese text in a normal `lang="ja-JP"` paragraph;
2. a Japanese native option inheriting `en-US`;
3. an otherwise identical Japanese native option with `lang="ja-JP"`;
4. a Japanese-capable Narrator voice/language installed, with automatic language switching tested both enabled and disabled.

Record the spoken result for all three Japanese nodes. If only the explicitly tagged option is spoken, a future narrow correction brief can consider adding locale-specific `lang` attributes to selector options. If neither option is spoken but the paragraph is, investigate the Chromium native-popup/UI Automation path. If none of the Japanese text is spoken, address Narrator language/voice configuration rather than compensating in application markup.

No application change is recommended until that test distinguishes these cases.

## Confidence / limitations

High confidence, from direct DOM and live browser-tree evidence:

- the rendered Japanese option text is `日本語`;
- it has no `label`, `aria-label`, or `lang` attribute;
- while English is active it inherits `en-US`;
- Chromium exposes a non-empty Japanese option name;
- Chromium exposes correct selection and parent value after choosing Japanese;
- the existing description identifies the selected locale on the parent control.

Moderate confidence:

- application markup is not the direct cause of an empty accessible name;
- a custom control or English accessible-name override would be disproportionate and unsupported by current evidence.

Low confidence, because Narrator and Windows voice settings were unavailable:

- whether the failure is Narrator configuration, Chromium’s Windows native-popup bridge, or their interaction;
- whether `lang="ja-JP"` changes actual Narrator speech.
