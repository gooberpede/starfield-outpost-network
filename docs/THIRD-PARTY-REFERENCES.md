# Third-party references and provenance

## Purpose and categories

This ledger records external material influences that are not necessarily
runtime dependencies. Entries are classified as runtime dependency,
code/reference implementation influence, data/content provenance,
development/translation tool, or canonical game source. Public-release review
will decide whether each belongs in repository documentation, license notices,
visible credits, or more than one location.

## Bethesda Strings Editor

- **Name / maintainer:** Bethesda Strings Editor / `0xra0`
- **Canonical URL:** https://github.com/0xra0/bethesda-strings-editor
- **Category:** Code/reference implementation influence
- **License/terms:** MIT according to the repository. Reconfirm the current
  repository license before adapting code.
- **Role:** Studied as a technical reference for Bethesda BA2 and string-table
  localization architecture, especially alignment by `(plugin, string-table
  extension, string ID)`.
- **Code copied or adapted:** No code has been copied or adapted for Parcel B1.
- **Data/output used:** No repository output or translation output is included.
- **Runtime dependency:** No.
- **Attribution action:** Repository credit is recorded here. If future work
  copies or adapts code, update this ledger and retain all license/copyright
  notices required by the MIT license.
- **Scope note:** Its AI translation features are not part of the tracker plan.
- **Used:** Localization architecture audit / Parcel B1 documentation.

## DeepL

- **Name / vendor:** DeepL translation service / DeepL SE
- **Canonical URL:** https://www.deepl.com/
- **Category:** Development/translation tool
- **License/terms:** Service terms apply; any applicable output or attribution
  requirements must be verified before public release.
- **Role:** Planned for Parcel B2 as an independent English-source translation
  QA pass for tracker-authored Japanese copy. Its output will be compared with
  the B1 catalogue, not blindly accepted.
- **Code copied or adapted:** None.
- **Data/output used:** None in Parcel B1.
- **Runtime dependency:** No. Subscription or trial arrangements are development
  workflow details only.
- **Attribution action:** Verify service terms when B2 is performed.
- **Scope note:** DeepL is not a source for Bethesda-owned canonical terminology.

## OpenAI Codex / ChatGPT

- **Name / vendor:** Codex and ChatGPT / OpenAI
- **Canonical URL:** https://openai.com/
- **Category:** Development/translation tool
- **License/terms:** OpenAI service terms apply; no additional attribution
  requirement is asserted here.
- **Role:** Used for code generation/review and the initial Japanese catalogue
  drafting and reasoning in Parcel B1.
- **Code copied or adapted:** Project changes were generated for this repository;
  no OpenAI product source code was copied.
- **Data/output used:** B1 code, documentation, and first-pass tracker-authored
  Japanese catalogue output.
- **Runtime dependency:** No.
- **Attribution action:** Ledger entry only unless future release policy chooses
  broader development-tool disclosure.

## Canonical game-source category

Bethesda game files and official localization are a separate canonical game
source/data-provenance category. Parcel B1 neither extracts nor redistributes
their localized string tables. Future Parcels C/D must add exact source,
version, extraction, redistribution, and credit details without conflating
them with machine-translation tools.
