# Starfield Localization Language Inventory Audit

## 1. Executive summary

Installed Starfield 1.16.244.0 contains exactly nine text-table language tokens:

```text
de, en, es, fr, it, ja, pl, ptbr, zhhans
```

No second Spanish token exists in any of the 810 `.strings`, `.dlstrings`, and
`.ilstrings` members enumerated from the 30 installed Bethesda-named
localization/Main archives in scope. The sole Spanish text token is `es`, the
existing Spanish (Spain) source used by tracker locale `es-ES`.

**Required Latin-American Spanish conclusion: B. Voice-only/depot-only/non-text;
no distinct text locale -> no tracker onboarding.** Steam exposes distinct
Latin-American Spanish depots, but neither the installed text tables nor the
public language-support matrix identifies a Latin-American Spanish interface or
subtitle population.

**Required other-languages conclusion: A. No other unexpected text locales
found.** The only metadata-unmapped tokens are the already-known V1 targets
`pl` (Polish) and `zhhans` (Simplified Chinese). Both are complete, strict UTF-8
text populations and both close against the existing provenance and terminology
identities.

The current V1 target list is therefore complete for the installed official
text data audited here. No roadmap change is recommended.

## 2. Trigger and context

The audit was triggered by Steam exposing “Español - Latinoamérica” as a game
language. A selector label is not evidence of a distinct text localization, so
the audit derived tokens from actual BA2 member names without a token allowlist.

The screenshot referenced by the brief was not present as a separate file in
the repository/task context; its quoted selector label was treated as contextual
evidence only. Installed game data remained primary evidence.

## 3. Installed archives inspected

The installed executable reports version **1.16.244.0**. The local Steam app
manifest reports app `1716740`, build `23518663`, mounted language `english`, and
does not mount a Spanish regional depot.

The audit inspected every installed Bethesda-named `* - Localization.ba2` and
`* - Main*.ba2` archive, excluding textures, arbitrary mods, and voice archives
from the text-member scan. All were BA2 v2 `GNRL` archives.

| Archive group | Archives | Localization members |
|---|---:|---:|
| Required canonical/terminology sources | 5 | 108 |
| Additional installed official/Bethesda-named sources | 25 | 702 |
| **Total** | **30** | **810** |

The required archive locations were:

- `Starfield - Localization.ba2`: 27 members for `Starfield.esm`.
- `ShatteredSpace - Main01.ba2`: no localization members.
- `ShatteredSpace - Main02.ba2`: 27 members for `ShatteredSpace.esm`.
- `SFBGS00D - Main.ba2`: 27 members for `SFBGS00D.esm`.
- `SFBGS050 - Main.ba2`: 54 members: 27 for `SFBGS050.esm` and 27 for the
  co-located `blueprintships-sfbgs050.esm` source.

The additional table-bearing archives were:

```text
BlueprintShips-Starfield - Localization.ba2
SFBGS003 - Main.ba2
SFBGS004 - Main.ba2
SFBGS006 - Main.ba2
SFBGS007 - Main.ba2
SFBGS008 - Main.ba2
sfbgs00a_a - main.ba2
sfbgs00a_d - main.ba2
sfbgs00a_e - main.ba2
sfbgs00a_f - main.ba2
sfbgs00a_g - main.ba2
sfbgs00a_i - main.ba2
sfbgs00a_j - main.ba2
sfbgs00b - main.ba2
sfbgs00c - main.ba2
sfbgs00e - main.ba2
sfbgs00f_a - main.ba2
sfbgs019 - main.ba2
sfbgs01c - main.ba2
sfbgs021 - main.ba2
sfbgs023 - main.ba2
sfbgs024 - main.ba2
sfbgs02a_a - main.ba2
sfbgs02b_a - main.ba2
SFBGS047 - Main.ba2
```

Each of those sources has the same nine-token, three-table-type shape. The
record-level ignored diagnostic records archive, inferred plugin/base, member
path, base filename, exact shipped token, table type, extracted size, SHA-256,
and compression state for all 810 members. No table payloads were written.

## 4. Complete observed language-token inventory

| Shipped token | Interpretation | Confidence | Plugins | Types | Canonical content | Other-source status |
|---|---|---|---:|---|---|---|
| `de` | German | High | 30 | all three | Complete | Complete across all additional sources |
| `en` | English | High | 30 | all three | Complete | Complete across all additional sources |
| `es` | Spanish (Spain) | High | 30 | all three | Complete | Complete across all additional sources |
| `fr` | French | High | 30 | all three | Complete | Complete across all additional sources |
| `it` | Italian | High | 30 | all three | Complete | Complete across all additional sources |
| `ja` | Japanese | High | 30 | all three | Complete | Complete across all additional sources |
| `pl` | Polish | High | 30 | all three | Complete | Complete across all additional sources |
| `ptbr` | Portuguese (Brazil) | High | 30 | all three | Complete | Complete across all additional sources |
| `zhhans` | Simplified Chinese (`Hans`) | High | 30 | all three | Complete | Complete across all additional sources |

“All three” means `.strings`, `.dlstrings`, and `.ilstrings`. There were no
partial token populations, unfamiliar tokens, aliases, legacy tokens, or tokens
limited to terminology-only/optional content.

## 5. Coverage matrix

| Token | Likely locale | Starfield | Shattered Space | SFBGS00D | SFBGS050 | Text-target candidate? |
|---|---|---|---|---|---|---|
| `de` | `de-DE` | complete | complete | complete | complete | Already supported |
| `en` | `en-US`; sparse `en-GB` alias | complete | complete | complete | complete | Already supported |
| `es` | `es-ES` | complete | complete | complete | complete | Already supported |
| `fr` | `fr-FR` | complete | complete | complete | complete | Already supported |
| `it` | `it-IT` | complete | complete | complete | complete | Already supported |
| `ja` | `ja-JP` | complete | complete | complete | complete | Already supported |
| `pl` | `pl-PL` | complete | complete | complete | complete | Known V1 target |
| `ptbr` | `pt-BR` | complete | complete | complete | complete | Already supported |
| `zhhans` | `zh-Hans` | complete | complete | complete | complete | Known V1 target |

Every “complete” cell contains all three table types. No cell is partial or
absent.

## 6. Current tracker metadata comparison

Against `reference-source/localization-locale-metadata.json`:

- **Already mapped:** `de`, `en`, `es`, `fr`, `it`, `ja`, `ptbr`.
- **Known but not yet onboarded:** `pl`, `zhhans`.
- **Duplicate/alias:** `en` intentionally backs both full `en-US` and sparse
  tracker-authored `en-GB`; this is not a second Bethesda population.
- **Unexpected/unmapped:** none beyond the two already-known V1 targets.
- **Non-text/irrelevant:** the Steam Latin-American Spanish selection has no
  corresponding text token.

No installed Bethesda text token lacks either a current tracker contract or an
already-recorded V1 target.

## 7. Latin-American Spanish finding

The complete observed token set contains only one Spanish-like token: `es`.
Searches of all member-derived tokens found no `esmx`, `esla`, `es419`,
`es-419`, `latam`, `eslatam`, `spa`, or other second Spanish population.

`es` has complete `.strings`, `.dlstrings`, and `.ilstrings` coverage in all
four required plugins and all additional sources. It decodes strictly as UTF-8
and is the existing Spanish (Spain) source mapped to `es-ES`.

Because no second Spanish text token exists:

- a Latin-American Spanish encoding is not applicable;
- 3,561-entity/4,818-row provenance closure is not applicable;
- 37-row/19-term terminology closure is not applicable;
- difference-vs-`es` counts and representative comparisons are not applicable;
- `es-419` is not recommended for onboarding from this evidence.

## 8. Voice-versus-text distinction and Steam discrepancy

The installed text-bearing archives are shared populations containing all nine
text tokens. None contains a Latin-American Spanish token. Installed voice
archive names use `...Voices_es.ba2` for relevant Bethesda content and likewise
do not expose a distinct regional text identity; voice filenames were not
treated as localization targets.

Secondary public metadata explains the selector discrepancy. SteamDB currently
lists separate Latin-American Spanish depots for the base game (`1716746`),
Shattered Space (`2721675`), and Terran Armada (`3763705`), while its support
matrix marks Latin-American Spanish for achievements only—not interface, full
audio, or subtitles. The base Latin-American and Spain depots are also reported
at the same approximate size. This supports a **depot-only/non-text**
classification for tracker purposes; the installed files provide the decisive
evidence that there is no distinct text population. See the
[SteamDB depot and language record](https://steamdb.info/app/1716740/depots/).

The local installation is mounted as English, so the contents of the unmounted
Latin-American depot were not directly inspected. That limitation does not
change the text finding because all interface/subtitle tables reside in the
shared installed archives and enumerate their complete token set.

## 9. Other unexpected language findings

No unexpected, undocumented, internal, test, legacy, DLC-only, partial, or
terminology-only text token was found. `pl` and `zhhans` are not discoveries;
they exactly match the previously known remaining V1 targets.

## 10. Encoding findings

Strict fatal decoding, with no byte sniffing and no fallback, produced:

```text
en     -> windows-1252
de     -> utf-8
es     -> utf-8
fr     -> utf-8
it     -> utf-8
ja     -> utf-8
pl     -> utf-8
ptbr   -> utf-8
zhhans -> utf-8
```

For each non-English token, UTF-8 decoded all 90 tables across the 30 observed
plugin bases with zero failures, zero U+FFFD, and zero C1 control characters.
Windows-1252 was considered only as a bounded diagnostic and produced thousands
of C1 controls for each relevant locale (including 5,164 for `pl` and 622,298
for `zhhans`). English failed strict UTF-8 in 11 tables but decoded all 90 under
Windows-1252 with no C1 controls. This confirms the existing English policy and
the UTF-8 policy needed by the two remaining V1 targets.

## 11. Provenance resolvability

A read-only in-memory materialization used the unchanged committed provenance
population. Every observed token, including `pl` and `zhhans`, resolved:

| Measure | Result per token |
|---|---:|
| Resolved entities | 3,561 |
| Resolved qualified rows | 4,818 |
| Unresolved rows | 0 |
| Replacement/mojibake failures | 0 |

Per-kind entity counts were 428 biomes, 1,776 bodies, 1,121 species, 5 official
terms, 30 products, 78 resources, and 123 systems. Canonical provenance was not
regenerated and no overlay was written.

## 12. Terminology resolvability

The unchanged official terminology evidence contains 37 rows across 19 term
IDs: 33 resolvable text rows and 4 intended-absence rows. Every observed token,
including `pl` and `zhhans`, resolved all 33 text rows with zero unresolved rows.

Representative readiness evidence:

| Token | Outpost | Cargo Link | Inter-System Cargo Link |
|---|---|---|---|
| `pl` | Placówka | Połączenie towarowe | Międzyukładowe połączenie towarowe |
| `zhhans` | 哨站 | 货运链接 | 跨星系货运链接 |

No terminology-value CSV was created.

## 13. Text-difference analysis

No newly discovered complete locale exists, and specifically no
Latin-American Spanish text population exists. Exact-equal, differing, and
empty/absence comparison counts against `es` therefore have no second operand
and are not applicable. Comparing `es` to itself would not answer the product
question and was deliberately not reported as regional evidence.

## 14. Tracker locale IDs

There is no newly discovered real text locale requiring a new BCP-47 ID.
`es-419` should not be introduced. For the already-known remaining targets, the
shipped evidence continues to support `pl-PL` for `pl` and script-specific
`zh-Hans` for `zhhans`; those are implementation recommendations for their
future onboarding briefs, not changes made by this audit.

## 15. Browser-mapping implications

No browser mapping should change. The current Spanish policy remains:

```text
es / es-ES -> es-ES
```

There is no official tracker `es-419` catalogue to receive explicit or regional
browser mappings. If Bethesda later ships a distinct Latin-American text token,
its onboarding should first establish `es-419`; treatment of country-specific
tags such as `es-MX` or `es-AR` would remain a separate product-policy decision.

## 16. Public-metadata discrepancies

Public metadata exposes Latin-American Spanish as a selectable/depot language,
but does not advertise it as interface, subtitle, or full-audio support. The
installed official text data has no corresponding token. For tracker relevance,
the installed table inventory takes precedence and resolves the discrepancy as
non-text/depot-only.

No public source was used to expand or override the observed token set.

## 17. V1 roadmap implications

The known target list is complete for installed Starfield 1.16.244.0:

- seven Bethesda tokens are represented by current tracker locale contracts;
- `pl` and `zhhans` are the only remaining text tokens and are already listed as
  V1 targets;
- Latin-American Spanish does not add a tracker text target.

Recommended roadmap change: **none**. This audit did not edit
`LOCALE-ONBOARDING.md`, `BACKLOG.md`, or locale metadata.

## 18. Explicit recommended next action

Do not onboard Latin-American Spanish. Continue the existing plan with separate
implementation briefs for Polish and Simplified Chinese. Those briefs may reuse
the demonstrated UTF-8 policy and full provenance/terminology closure, but must
still perform normal language-specific editorial, runtime, collation, search,
and composition review.

## 19. Audit limitations

- The Steam selector screenshot was represented only by the brief's quoted
  label, not an attached image file.
- The local Steam installation is mounted in English. Regional voice/depot
  payloads not mounted locally were not downloaded or extracted.
- Supplemental scanning was deliberately limited to installed
  Bethesda-named `Main`/`Localization` archives; arbitrary mod archives,
  textures, and unrelated assets were excluded.
- The audit establishes table presence and identity resolution, not linguistic
  quality or runtime readiness for Polish or Simplified Chinese.

## 20. Reproduction notes

The audit used the repository's BA2 v2 `GNRL` reader and string-table framing
logic. An ignored diagnostic script and output were created under:

```text
.local-work/localization/language-inventory-audit/audit.mjs
.local-work/localization/language-inventory-audit/audit-output.json
```

The JSON contains the complete 810-member record inventory and summary matrices.
It contains names, sizes, hashes, and derived decoded summaries only—no Bethesda
string-table payload or text corpus. The diagnostic:

1. enumerates member names before deriving tokens;
2. extracts each matching member in memory for SHA-256 and strict decoding;
3. validates table framing;
4. materializes the unchanged 4,818 provenance rows in memory;
5. resolves the unchanged 37 terminology evidence rows in memory;
6. writes only the local ignored JSON summary.

No production file, metadata contract, catalogue, overlay, selector, browser
mapping, persistence code, or raw Bethesda table was changed.
