# Polish Terminology and Review Glossary

## Scope and authority

This document governs semantic review for the staged `pl-PL` catalogue. It records official Bethesda evidence separately from tracker-owned recommendations. It does not activate Polish at runtime or constitute a translated catalogue.

When a tracker concept and grammatical role match Starfield, use the official Polish term. When Polish case, number, agreement, word order, or the UI surface requires another form, preserve the concept rather than copying a source string literally. `reference-source/official-terminology-values-pl-PL.csv` is the identity-keyed evidence record; quoted sentences below are summarized rather than treated as reusable UI strings.

Handling classes used for the 19 evidence term IDs are:

- **A** — direct official standalone default.
- **B** — official term requiring contextual or inflected variants.
- **C** — tracker-owned concept informed by official evidence.
- **D** — evidence only; unsuitable as the tracker UI default.

## Term-ID classification

| Term ID | Class | Preferred tracker handling | Rationale |
|---|---|---|---|
| `term.outpost` | A | `Placówka` | Exact official standalone label; contextual evidence agrees. |
| `term.cargo-link` | A | `Połączenie towarowe` | Exact official standalone label. |
| `term.inter-system-cargo-link` | B | `Międzyukładowe połączenie towarowe` | Strong official standalone form; official context also reverses modifier order. |
| `term.inter-system` | B | `międzyukładowe` in the relevant cargo-link phrase | Evidence is a context-bound adjectival label, not a universal standalone noun. |
| `term.biome` | B | `biom` | Official evidence includes `Biomy:`, singular `biom`, and inflected plural forms. |
| `term.planet` | B | `planeta` | Official evidence is contextual (`planecie`, `planety`); the nominative is the natural standalone lemma. |
| `term.planetary-body` | B | `ciało planetarne` | Official `ciał planetarnych` directly establishes the term; the tracker uses its nominative standalone form and allows ordinary inflection. See the decision below. |
| `term.star-system` | B | `układ gwiezdny`; compact `układ` | Both full and shortened official contextual forms occur. |
| `skill.outpost-management` | A | `Zarządzanie placówką` | Qualified official standalone skill name. |
| `skill.outpost-engineering` | A | `Inżynieria placówek` | Qualified official standalone skill name. |
| `skill.planetary-habitation` | A | `Zasiedlanie planet` | Qualified official standalone skill name. |
| `skill.research-methods` | A | `Metody badawcze` | Qualified official standalone skill name. |
| `skill.special-projects` | A | `Projekty specjalne` | Qualified official standalone skill name. |
| `term.x-tech` | B | `X-Tech` standalone | Official prose proves grammatical inflection, including `X-Techem`. |
| `term.x-tech-power-core` | A | `Rdzeń mocy X-Techu` | Exact official standalone item name, corroborated by contextual evidence. |
| `term.starfield` | D | `Starfield` | Official evidence says `W gwiazdy`, but that string is not the product brand. |
| `term.moon` | B | `księżyc` | Official contextual form is inflected; use the natural lemma where this body type is named. |
| `term.orbital` | C | context-specific orbital wording | Evidence is verbal (`wchodzimy na orbitę`) and does not prove a standalone tracker body-type noun. |
| `term.cargo-pad` | D | no official default | All four rows intentionally record absence of this retired presentation term. |

## Class 1 — Official Bethesda terminology

| Concept | Official Polish evidence | Standalone tracker form | Context, capitalization, exclusions, and compact guidance |
|---|---|---|---|
| Outpost | `Placówka`; contextual `placówka` | `Placówka` | Common noun: lowercase in prose, initial capital only for a standalone label or sentence. Inflect normally. Do not treat user-authored outpost names as this noun. Full form is compact enough. |
| Cargo Link | `Połączenie towarowe` | `Połączenie towarowe` | Common-noun capitalization. Means the routed cargo relationship, not a generic hyperlink. No approved abbreviation. |
| Inter-System Cargo Link | `Międzyukładowe połączenie towarowe`; contextual `Połączenie towarowe międzyukładowe` | `Międzyukładowe połączenie towarowe` | Either official order may be used when sentence structure requires it. Do not reduce it to a generic inter-system connection. No invented abbreviation. |
| X-Tech | `X-Tech`; prose `X-Techem` | `X-Tech` | Preserve capitalization and hyphen. Inflect only where grammar requires it; observed evidence includes `X-Techem`, while `X-Techu` is proven by the compound below. Never require an exhaustive fixed case list. |
| X-Tech Power Core | `Rdzeń mocy X-Techu` in standalone and prose contexts | `Rdzeń mocy X-Techu` | Common noun plus protected technical token. Do not simplify to `X-Tech` or treat the terminology-only item as a runtime reference entity. No safe shorter official form. |
| Outpost Management | `Zarządzanie placówką` | same | Official skill title. Preserve as an opaque display label in parameterized prose. |
| Outpost Engineering | `Inżynieria placówek` | same | Official skill title. Preserve as an opaque display label in parameterized prose. |
| Planetary Habitation | `Zasiedlanie planet` | same | Official skill title. Preserve as an opaque display label in parameterized prose. |
| Research Methods | `Metody badawcze` | same | Official skill title. Preserve as an opaque display label in parameterized prose. |
| Special Projects | `Projekty specjalne` | same | Official skill title. Preserve as an opaque display label in parameterized prose. |

### Planetary Body decision

Use **`ciało planetarne`** as the preferred standalone tracker term.

The official exact-phrase evidence contains the plural genitive `ciał planetarnych`; deriving the nominative singular is grammatically direct. The alternative official evidence `ciała niebieskie` is natural Polish but covers stars, asteroids, and other celestial objects more broadly than the tracker selector. The tracker field selects a planet-or-moon body within a star system, so `ciało planetarne` preserves the intended scope more precisely. Use normal inflection in prose. Do not constrain a translated sentence to the nominative form, and do not use `ciało niebieskie` as the default selector label.

## Class 2 — Tracker-owned preferred terminology

These are semantic-review proposals, not claims of Bethesda authorship.

| Concept | Preferred Polish | Meaning and excluded senses | Grammar, scope, and variants |
|---|---|---|---|
| Planned Supply | `Planowane zaopatrzenie` | Intended virtual future supply; not inventory, a reservation, or a delivery already in progress. | Neuter noun phrase. Use across `plannedSupply.*`; inflect in prose. No abbreviation. |
| Present | `Obecność` | Matrix/search state that an item exists or can exist at an outpost; not “today/currently”. | Noun preferred for compact headings. Context may use agreeing forms of `dostępny`; review per key. |
| Producing | `W produkcji` | Configured active production state; not measured throughput or the broader manufacturing domain. | Invariant state phrase for headings; action keys may use `produkuj` / `przerwij produkcję`. |
| Inputs | `Wymagane materiały` | Recipe or organic-production requirements; not form fields or data input. | Plural noun phrase. `wymagane zasoby` or `składniki` may fit explanatory prose. |
| Logistics | `Logistyka` | Item is actually assigned to routed exports; not merely eligible for logistics. | Feminine singular; compact heading is safe. |
| Manufacturing | `Wytwarzanie` | Product fabrication/configuration domain; distinct from the state “Producing”. | Verbal noun used for `matrix.manufacturing.*` and related configuration keys. |
| Validation | `Walidacja` | Feature/panel that reports domain issues; not only form-submit validation. | Technical noun is acceptable for headings. Prose may use `sprawdzenie poprawności` or direct problem wording. |
| Resource Matrix | `Macierz zasobów` | The established matrix/table feature. | Feminine phrase; full form is preferred and no abbreviation is approved. |
| Reshuffle | `Zmień kolejność` | Enter manual reorder mode; never randomize items. | Imperative action. Completion may be `Zakończ zmianę kolejności`. |
| Lock | `Zablokuj kolejność` | Finish/prevent reordering; not account/security locking or permanent data immutability. | Imperative action scoped to order controls. |
| Network | `Sieć` | The player's outpost network. | Feminine noun; inflect normally. |
| Active Production | `Aktywna produkcja` | Configured production state; no throughput claim. | Feminine noun phrase. Keep distinct from `W produkcji`. |
| Source | `Źródło` | Cargo/supply or production endpoint/origin; not an evidence citation unless that key actually concerns evidence. | Neuter noun; inflect normally. |
| Destination | `Cel` | Cargo endpoint; not an abstract purpose. | Masculine noun; `miejsce docelowe` is allowed where `cel` could read as purpose. |
| Undo | `Cofnij` | Reverse the last history action. | Imperative UI verb. |
| Redo | `Ponów` | Reapply the undone history action; not repeat any arbitrary operation. | Imperative UI verb. |
| Inorganic | `Nieorganiczne` | Inorganic-resource category. | Nominalized neuter plural for resource headings; adjective agreement may change in prose. |
| Organic | `Organiczne` | Flora/fauna-derived resource category. | Nominalized neuter plural for resource headings; adjective agreement may change in prose. |

Import/export and validation-severity review also uses `Importuj / Eksportuj`, `Błąd`, `Ostrzeżenie`, and `Informacja`. These are tracker UI recommendations rather than Bethesda terms.

## Class 3 — Context-sensitive concepts

| Concept | Review rule |
|---|---|
| Biome | Prefer standalone `biom`. Official evidence proves `Biomy:`, `biom`, `biomach`, and `biomów`; choose the required case and number. |
| Planet | Prefer standalone `planeta`. Official evidence proves contextual `planecie` and `planety`; do not force the lemma into prose. |
| Planetary Body | Prefer standalone `ciało planetarne`, inflected by sentence. Broader `ciało niebieskie` is evidence, not the default tracker scope. |
| Star System | Use full `układ gwiezdny`; compact `układ` is allowed only when the astronomical context is already unambiguous. Do not map every generic English “system” to the full phrase. |
| Starfield branding | `Starfield` is invariant in tracker UI. Record `W gwiazdy` as official evidence only; never force it into product-brand text. |
| X-Tech in prose | Standalone `X-Tech`; allow grammatically necessary official forms such as `X-Techem` and the evidenced genitive `X-Techu`. Human review decides other required inflection. |
| Inter-System Cargo Link order | Default to `Międzyukładowe połączenie towarowe`; allow official `połączenie towarowe międzyukładowe` when Polish word order warrants it. |
| Present | Prefer `Obecność` for compact state headings; use gender/number-agreeing availability wording only where the key's implied noun is clear. |
| Producing | Distinguish the state `W produkcji` from start/stop actions and from the domain `Wytwarzanie`. |
| Inputs | Choose between `wymagane materiały`, `wymagane zasoby`, and `składniki` according to recipe context; never use the data-entry sense. |
| Reshuffle | Use reorder wording (`zmień kolejność`), never random-shuffle wording. Completion text may differ. |
| Lock | Scope the verb to ordering. Avoid security/account meanings and claims of permanent immutability. |
| Source / Destination | Use endpoint senses. Prefer `miejsce docelowe` where `cel` could be misread as purpose. |
| Inorganic / Organic | Headings may use nominalized `Nieorganiczne` / `Organiczne`; prose must agree with its explicit or implied noun. |

## Capitalization and compact labels

Polish common nouns use sentence-style capitalization. Capitalize the first word of standalone selector labels, headings, and buttons; otherwise use lowercase unless a proper name or sentence start requires a capital. Do not copy English title case word by word. Preserve `Starfield`, `X-Tech`, technical tokens, and the official displayed capitalization of skill names.

Use a compact form only when it remains unambiguous: `układ` may shorten `układ gwiezdny` in established astronomical context. The full cargo-link terms, `ciało planetarne`, `Macierz zasobów`, and skill names have no approved abbreviations. Do not invent abbreviations to fit current geometry; clipping belongs to later UI QA.

## Placeholder grammar

Treat `{item}`, `{resource}`, `{product}`, `{outpost}`, `{system}`, `{body}`, `{skill}`, `{name}`, and `{previousName}` as opaque inserted values. The application must not decline them or infer gender/case. Prefer punctuation, labels, arrows, quotation, impersonal wording, or syntactic isolation. Do not encode case in placeholder names. Translate each parameterized message as a whole.

## Count-neutral messages

Do not add Polish plural categories in this parcel. During semantic review, the four current plural keys should use natural count-neutral structures where possible:

- `cargo.pad.count`
- `validation.issueCount`
- `validation.plannedSupplyUnresolved`
- `search.results.found`

For example, a “liczba …: {count}” structure can avoid forcing one noun form across Polish `one`, `few`, and `many`. If editorial review rejects a natural neutral form for any key, stop and reconsider plural support before runtime activation.

## Accidental-English allowlist

`status` and `system` are legitimate Polish words/cognates and remain the only Polish-specific exceptions. Shared invariant handling covers `Starfield`, `X-Tech`, `JSON`, `FormID`, and other protected technical tokens. Do not broaden the allowlist without a demonstrated false positive.

## Evidence notes

Official values come from strict UTF-8 Polish tables for `Starfield.esm`, `ShatteredSpace.esm`, `SFBGS00D.esm`, and terminology-only `SFBGS050.esm`, keyed by the unchanged 37-row provenance artifact. Closure is 33 textual values, four intended absences, and zero unresolved identities. `SFBGS050.esm` evidence remains terminology-only and does not create runtime reference entities.
