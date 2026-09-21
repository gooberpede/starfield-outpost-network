# Codex Audit Brief — Starfield Localization Inventory and Undocumented Language Coverage

## Objective

Perform a **read-only localization inventory audit** against the installed Starfield files and the tracker’s current localization assumptions.

The immediate trigger is the discovery that Steam exposes:

```text
Spanish - Latin America
```

as a selectable Starfield language, even though the tracker’s current durable language target was based on the previously known Bethesda/Steam support matrix and did not include a separate Latin-American Spanish text locale.

The audit must answer two questions:

1. Does Starfield actually ship a distinct Latin-American Spanish **text/UI localization**, or is the Steam option voice-only / depot-only / otherwise not relevant to the tracker?
2. Are there **any other shipped text/UI localizations or language tokens** in the installed game files that the tracker has not yet identified?

This is an **inventory/discovery audit**, not an onboarding implementation task.

Do not modify runtime localization, locale metadata, catalogues, overlays, search, browser mapping, selector options, or durable supported-language status during this audit.

Do not commit or push.

---

# Product relevance rule

The tracker is text/UI software.

A language counts as a localization target only if Starfield ships relevant **text/interface localization data** for it.

Voice-only support does **not** require tracker onboarding.

Therefore:

```text
separate voice depot only
    -> not a tracker locale target

separate .strings/.dlstrings/.ilstrings population
    -> candidate tracker locale target
```

Do not add a locale merely because Steam exposes it in the game-properties language selector.

---

# Known current tracker/Bethesda text targets

The tracker currently knows about these Bethesda-language targets:

```text
English
French
German
Spanish (Spain)
Japanese
Italian
Polish
Portuguese (Brazil)
Simplified Chinese
```

Current supported tracker locales:

```text
en-US
en-GB   (sparse tracker override; not separate Bethesda language)
ja-JP
fr-FR
de-DE
es-ES
it-IT
pt-BR
```

Remaining known V1 targets:

```text
Polish
Simplified Chinese
```

The audit must not assume this list is complete.

---

# Audit scope

Inspect the actual installed localization/archive inputs and enumerate **all language tokens present**, not just expected ones.

At minimum inspect localization-bearing archives/plugins relevant to the tracker’s existing intake pipeline, including:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

and their corresponding BA2/localization archives.

Also inspect any additional installed official Starfield archives that obviously contain localization/string tables if the existing intake tooling can enumerate them safely.

Do not broaden into arbitrary mod archives.

---

# 1. Enumerate all localization table members

Use the repository’s existing BA2/member-intake tooling where possible.

Enumerate every member matching:

```text
*.strings
*.dlstrings
*.ilstrings
```

from the official installed Starfield archives in scope.

For every member record:

- archive;
- plugin/source;
- member path;
- base filename;
- language token;
- table type;
- size/hash if current tooling exposes it.

Do not begin with a hard-coded allowlist of known tokens.

Derive the token inventory from the actual member names.

---

# 2. Build the complete observed language-token inventory

Produce a deduplicated list of all observed localization tokens.

For each token report:

- token spelling exactly as shipped;
- plugins in which it appears;
- table types present;
- whether coverage is complete across:
  - `.strings`
  - `.dlstrings`
  - `.ilstrings`
- whether it appears in canonical content sources;
- whether it appears only in terminology-only or other optional official sources;
- inferred/known language if identifiable;
- confidence of that identification.

Do not silently discard unfamiliar tokens.

If a token cannot be confidently identified, preserve it as unknown and investigate further.

---

# 3. Compare observed tokens with current locale metadata

Compare the complete observed token set against:

```text
reference-source/localization-locale-metadata.json
```

Classify each token as:

```text
already mapped
known but not yet onboarded
unexpected / unmapped
duplicate / alias
non-text / irrelevant
```

Report any Bethesda token present in installed text tables that has no corresponding tracker-locale contract.

This is the core “are we missing anything else?” check.

---

# 4. Latin-American Spanish investigation

Investigate every Spanish-related token discovered.

Do not assume the token name.

Search the actual inventory for any plausible second Spanish population, including but not limited to patterns such as:

```text
es
esmx
esla
es419
es-419
latam
eslatam
spa
```

but prefer observed member names over speculative guesses.

For each Spanish-like token determine:

- exact shipped token;
- which plugins contain it;
- `.strings/.dlstrings/.ilstrings` coverage;
- encoding;
- whether values differ materially from `es`;
- whether the token is text/UI-capable or only associated with voice/depot naming;
- whether the same 4,818 qualified provenance identities can be resolved.

If no second Spanish text token exists, state that clearly.

---

# 5. Distinguish voice support from text support

Where Steam/depot metadata suggests a language exists but no corresponding text token appears in localization tables:

- classify it as voice-only / depot-only / non-text **if supported by evidence**;
- do not infer text support from voice archive filenames.

If useful, inspect installed voice archive naming only to explain the discrepancy, but keep the audit centered on text/UI relevance.

Do not treat voice BA2 presence as sufficient evidence for tracker onboarding.

---

# 6. Detect hidden or unexpected locales

For every unexpected token:

1. identify likely language/region;
2. verify actual text-table coverage;
3. determine whether it is:
   - full UI/text localization;
   - partial localization;
   - DLC-only;
   - terminology-only;
   - obsolete/legacy;
   - test/internal;
   - duplicate of another token;
4. compare representative values against nearby known locales if needed.

Do not dismiss a token because it is undocumented publicly.

The installed game data is the primary evidence for this audit.

---

# 7. Coverage matrix

Create a durable table covering all observed text-language tokens against:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
SFBGS050.esm
```

with table-type coverage.

Example shape:

| Token | Likely locale | Starfield | Shattered Space | SFBGS00D | SFBGS050 | Text-target candidate? |
|---|---|---|---|---|---|---|

Each plugin cell should indicate:

```text
strings/dlstrings/ilstrings complete
partial
absent
```

Do not collapse partial coverage into “present.”

---

# 8. Encoding discovery

For every unexpected/unmapped token, determine the strict decoding policy using the same bounded diagnostic standard as prior locale audits.

Report:

```text
token -> encoding
```

Requirements:

- fatal decode;
- no byte sniffing;
- no fallback decoder;
- compare plausible encodings only as diagnostics;
- do not add metadata entries during the audit.

If a token cannot be safely decoded, treat that as evidence requiring further investigation.

---

# 9. Provenance resolvability test for unexpected text locales

For every unexpected token that appears to be a real text locale, test the existing canonical provenance population.

Attempt a read-only materialization against the unchanged:

```text
3,561 canonical entities
4,818 qualified provenance rows
```

Report:

- resolved entities;
- resolved qualified rows;
- unresolved rows;
- kind counts;
- replacement/mojibake failures.

Do not regenerate canonical provenance.

Do not write overlays.

This determines whether the existing generalized pipeline can onboard the locale without new architecture.

---

# 10. Terminology resolvability test

For every unexpected real text locale, attempt read-only resolution of the existing official terminology evidence:

```text
37 evidence rows
19 term IDs
```

Report:

- resolved evidence rows;
- intended absence rows;
- unresolved rows;
- representative official values.

Do not create terminology-value CSVs.

This is readiness evidence only.

---

# 11. Text-difference analysis

If Latin-American Spanish or another unexpected locale has a complete text population, compare it against the nearest known related locale.

For Latin-American Spanish compare against:

```text
es / es-ES
```

Measure at least:

- exact-equal value count;
- differing value count;
- empty/absence differences;
- representative differences from:
  - UI/common terms;
  - resources/products;
  - systems/bodies;
  - skills/official terminology;
  - fauna components if available.

The goal is to distinguish:

```text
true independent localization
near-duplicate regional variant
identical duplicate token
```

Do not decide onboarding value based only on percentage difference; report evidence.

---

# 12. BCP-47 tracker-locale recommendation

For each newly discovered real text locale, recommend the appropriate tracker BCP-47 ID.

For Latin-American Spanish, if a real regional text population exists, evaluate:

```text
es-419
```

as the likely tracker ID.

Do not invent country-specific tags such as `es-MX` unless the shipped data is actually country-specific.

For unknown locales, choose BCP-47 only after language/region identification is evidence-backed.

---

# 13. Browser-mapping implications

Do not implement browser mapping.

For any newly discovered locale, discuss how its existence would affect the current conservative policy.

Example for a genuine `es-419` locale:

```text
es / es-ES -> es-ES
es-419 -> es-419
explicit es-MX/es-AR/... -> product-policy decision:
  either remain conservative
  or optionally map to es-419 later
```

Do not settle broader regional fallback unless required.

The audit should identify the future decision, not implement it.

---

# 14. Steam-selector discrepancy

Use the supplied screenshot as contextual evidence that Steam exposes:

```text
Español - Latinoamérica (Spanish - Latin America)
```

Do not treat the screenshot alone as proof of text support.

Explain in the audit whether the installed files show:

- a matching text locale;
- only voice/depot support;
- no distinct shipped localization;
- or another arrangement.

If a corresponding text token is absent, the audit should explicitly resolve the discrepancy.

---

# 15. Public metadata is secondary evidence

The primary audit source is installed official game data.

Public Bethesda/Steam/SteamDB metadata may be consulted only to help interpret discrepancies.

Do not let public store matrices override direct evidence from shipped text tables.

If external metadata and installed files disagree, report both and privilege the installed-file result for tracker relevance.

---

# 16. No roadmap mutation during audit

Do not edit:

```text
LOCALE-ONBOARDING.md
BACKLOG.md
localization-locale-metadata.json
```

during this audit.

The audit report may recommend changes after findings are reviewed.

Do not add a newly discovered locale to V1 until the user approves the audit conclusion.

---

# 17. No implementation

Do not:

- add locale metadata;
- add catalogues;
- add terminology files;
- add glossaries;
- generate overlays;
- add runtime support;
- alter browser mapping;
- alter selector options;
- alter search/collation;
- change UI/CSS;
- modify persistence;
- commit Bethesda localization corpora.

This is read-only discovery/planning.

---

# 18. Diagnostics location

Temporary ignored diagnostics are allowed under something like:

```text
.local-work/localization/language-inventory-audit/
```

Do not commit raw Bethesda tables.

Do not create durable copies of proprietary localization corpora.

The durable audit report should contain only the evidence summaries necessary for future implementation decisions.

---

# 19. Durable audit report

Create:

```text
docs/audits/STARFIELD-LOCALIZATION-LANGUAGE-INVENTORY.md
```

Recommended structure:

1. Executive summary
2. Trigger/context
3. Installed archives inspected
4. Complete observed language-token inventory
5. Coverage matrix
6. Current tracker metadata comparison
7. Latin-American Spanish finding
8. Voice-vs-text distinction
9. Other unexpected language findings
10. Encoding findings
11. Provenance resolvability
12. Terminology resolvability
13. Text-difference analysis
14. Recommended tracker locale IDs for any new real text locales
15. Browser-mapping implications
16. Public-metadata discrepancies
17. V1 roadmap implications
18. Explicit recommended next action
19. Audit limitations
20. Reproduction notes

---

# 20. Required conclusions

The report must answer explicitly:

### Latin-American Spanish
One of:

```text
A. Distinct shipped text/UI locale exists -> recommend onboarding
B. Voice-only/depot-only; no distinct text locale -> no tracker onboarding
C. Partial/ambiguous text support -> further investigation required
```

### Other languages
One of:

```text
A. No other unexpected text locales found
B. Additional text locale(s) found -> list and recommend next action
C. Ambiguous/internal tokens found -> further investigation required
```

Do not leave these conclusions implicit.

---

# 21. Verification

Because this is an audit:

```text
git diff --check
```

is required for the report.

If read-only diagnostics use repository scripts/tests, report exactly what was run.

No production build is required unless the audit changes tracked implementation files, which it should not.

Confirm:

- only the audit report is tracked/changed;
- no proprietary Bethesda localization data was committed;
- no runtime implementation changed;
- no commit/push occurred.

---

# Completion response

Return:

1. branch;
2. files changed;
3. archives inspected;
4. complete observed language-token list;
5. token-to-language interpretation;
6. text-table coverage matrix summary;
7. tokens already mapped by tracker;
8. unexpected/unmapped tokens;
9. Latin-American Spanish exact finding;
10. Latin-American Spanish text vs voice conclusion;
11. Latin-American Spanish token/encoding if present;
12. Latin-American Spanish provenance closure if present;
13. Latin-American Spanish terminology closure if present;
14. Latin-American Spanish difference-vs-es statistics if present;
15. other unexpected language findings;
16. encoding findings for unexpected tokens;
17. provenance resolvability for any unexpected text locales;
18. terminology resolvability for any unexpected text locales;
19. recommended BCP-47 IDs for newly discovered real text locales;
20. browser-mapping implications;
21. public-metadata discrepancy summary;
22. whether current V1 target list is complete;
23. recommended roadmap change, if any;
24. recommended next action;
25. audit report path;
26. `git diff --check` result;
27. confirmation no Bethesda corpus was committed;
28. confirmation no implementation/runtime changes occurred;
29. confirmation no commit/push occurred;
30. suggested documentation commit message.

Do not proceed into locale onboarding without a separate implementation brief.
