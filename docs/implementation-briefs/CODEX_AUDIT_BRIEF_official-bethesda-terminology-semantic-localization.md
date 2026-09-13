# CODEX AUDIT BRIEF — Official Bethesda Terminology for Semantic Localization

## Purpose

Audit the remaining Bethesda/game-specific terminology embedded in tracker-authored semantic messages, with Japanese as the current target locale.

This work follows completion of:

- the tracker-authored Japanese semantic catalogue;
- official reference-name provenance;
- the generated Japanese reference-name overlay;
- runtime integration of official reference names.

The remaining terminology problem is different from canonical reference names.

Examples include generic or reusable Starfield vocabulary such as:

```text
Outpost
Cargo Link
Cargo Pad
Inter-System Cargo Link
Biome
Planet
Star System
X-Tech Power Core
Starfield
```

These terms appear inside tracker-authored sentences and UI labels. They do not necessarily correspond to one canonical record identity.

The audit must identify the best official Bethesda localization evidence for these terms, preserve reusable source identity/context where possible, and recommend how the Japanese semantic catalogue should be adjudicated.

Do **not** implement catalogue changes yet.

Do **not** commit or push.

Write the audit report to:

```text
docs/audits/codex-official-terminology-semantic-localization-audit.md
```

---

# Naming guidance

Avoid transient roadmap identifiers such as:

```text
D3
C7
C8
```

in durable implementation names.

Use functional domain terminology, for example:

```text
official terminology
semantic localization
terminology provenance
Bethesda terminology evidence
```

Roadmap labels may remain in historical prose where they document past planning.

---

# Scope classification

**Medium focused audit.**

Expected work:

- inventory deferred Japanese semantic messages;
- cluster them by Bethesda/game-specific terminology;
- inspect official English/Japanese localization data;
- identify reusable official string identities or authoritative usage contexts;
- distinguish canonical standalone terms from contextual/embedded terminology;
- recommend a durable terminology provenance artifact;
- recommend Japanese catalogue adjudication strategy.

No runtime/UI/persistence/history/schema changes.

---

# Current semantic catalogue state

The tracker has a complete Japanese semantic catalogue:

```text
330 / 330 message keys populated
```

However, earlier adjudication deferred 114 semantic messages because they contained Bethesda-owned or game-specific terminology requiring authoritative review.

The prior reference-name audit classified those 114 as:

```text
8 fully covered by existing provenance-backed terms
4 partially covered
102 without matching provenance entities for their deferred terminology
```

Those 102 are not missing canonical reference records. They are tracker-authored messages containing generic game vocabulary.

This audit should revisit the exact row-level deferred population and convert it into a durable terminology decision set.

---

# Source evidence

Use existing project evidence first.

Relevant repository sources may include:

```text
docs/audits/codex-japanese-translation-review.md
docs/audits/codex-localization-parcel-d-reference-name-overlay-audit.md
docs/localization/ja-JP-review-source.csv
```

The earlier exact adjudication CSV may exist only under ignored local work:

```text
.local-work/translation/jp/ja-JP-adjudication.csv
```

If available, use it as diagnostic evidence.

Do not make an ignored local file the sole durable contract.

The final audit must preserve enough row-level reconciliation in tracked documentation or a tracked terminology artifact that future developers do not need the ignored file.

---

# Authoritative Bethesda source universe

The tracker’s authoritative game-source universe remains:

```text
Starfield.esm
ShatteredSpace.esm
SFBGS00D.esm
```

Do not use:

- Creations;
- third-party mods;
- arbitrary installed plugins;
- unofficial translations.

For terminology evidence, official localized string tables from those supported sources are authoritative.

---

# Core audit question

For every recurring Bethesda/game-specific term in the deferred semantic messages:

> What is the best official English/Japanese localization evidence, and can that evidence be preserved as a reusable qualified source identity for future locales?

The audit should distinguish:

```text
A. standalone official term with stable qualified string identity
B. official term embedded in a larger localized string
C. multiple official contexts/usages
D. no reliable standalone official evidence found
E. tracker-owned terminology not meaningfully Bethesda-owned
```

Do not force every term into category A.

---

# Terminology inventory

Start from the deferred semantic-message population and cluster by repeated terminology.

At minimum inspect:

```text
Outpost
Cargo Pad
Cargo Link
Inter-System Cargo Link / Inter-System
Biome
Planet
Planetary Body
Star System
X-Tech
X-Tech Power Core
Starfield
```

Also discover additional repeated Bethesda/game-specific terms from the deferred set.

Do not expand into generic English words that are not game-specific unless their translation was explicitly deferred for Bethesda consistency.

---

# Audit question 1 — exact deferred-message reconciliation

Produce a complete row-level reconciliation of all deferred semantic messages.

For each message include:

```text
MessageKey
English source text
Current Japanese text
Deferred terminology
Terminology cluster
Coverage status
Recommended disposition
```

Recommended disposition values:

```text
OFFICIAL_TERM_CONFIRMED
OFFICIAL_CONTEXT_CONFIRMED
REFERENCE_NAME_PARAMETERIZED
TRACKER_OWNED_TRANSLATION
NEEDS_MANUAL_EDITORIAL_REVIEW
UNRESOLVED
```

The final totals must reconcile exactly to the full deferred population.

---

# Audit question 2 — standalone official strings

For each terminology cluster, search official Bethesda localization data for a standalone or clearly canonical localized string.

Where found, preserve:

```text
TermId
CanonicalEnglish
EvidenceKind = standalone
SourcePlugin
RecordSignature, if applicable
RecordFormID, if applicable
FieldPath, if applicable
NameSourcePlugin
StringTable
StringID
OfficialEnglish
OfficialJapanese
Context
```

Use exact qualified identity.

Do not rely on English text matching alone when a record/string identity is available.

---

# Audit question 3 — embedded/contextual evidence

Some terms may appear only inside larger UI strings, prompts, descriptions, or help text.

Where no standalone identity exists, preserve the best context.

Recommended evidence shape:

```text
TermId
CanonicalEnglish
EvidenceKind = contextual
SourcePlugin
StringTable
StringID
OfficialEnglishContext
OfficialJapaneseContext
ExtractedTermEnglish
ExtractedTermJapanese
ContextNotes
Confidence
```

Do not pretend the extracted Japanese substring is independently canonical if grammar/context makes that uncertain.

---

# Audit question 4 — multiple official usages

Bethesda may use different Japanese renderings for the same English term depending on context.

If this occurs:

- inventory the variants;
- identify contexts;
- determine whether the tracker should choose one default;
- recommend whether the terminology registry should store:
  - one canonical choice;
  - multiple context-qualified variants.

Do not collapse genuine distinctions.

---

# Audit question 5 — Outpost terminology

Audit all official uses relevant to:

```text
Outpost
Outpost Management
Outpost Engineering
```

The two skill names are already provenance-backed official terms.

Determine whether the generic noun “Outpost” has an authoritative standalone or contextual Japanese form and whether it aligns with the current tracker translation.

Preserve the distinction between:

```text
generic noun
skill name
tracker compound phrases
```

---

# Audit question 6 — Cargo terminology

Audit:

```text
Cargo Pad
Cargo Link
Inter-System Cargo Link
Inter-System
```

Determine whether Bethesda uses one consistent Japanese terminology family.

Pay attention to whether:

- Cargo Pad is an official build-item name;
- Cargo Link has a standalone build-item/menu label;
- Inter-System Cargo Link has a distinct official label;
- the tracker’s internal `[INT]` concept corresponds exactly to Bethesda terminology.

Do not infer terminology solely from English.

---

# Audit question 7 — X-Tech Power Core

Audit:

```text
X-Tech
X-Tech Power Core
```

`X-Tech` itself is already provenance-backed through the canonical resource name.

Determine whether “X-Tech Power Core” exists as:

- a standalone official item/term;
- a larger localized phrase;
- a tracker-authored descriptive phrase with no official counterpart.

Preserve reusable evidence if found.

Do not fabricate a provenance identity if none exists.

---

# Audit question 8 — world-structure terminology

Audit generic uses of:

```text
Biome
Planet
Planetary Body
Star System
System
Moon
Orbital
```

Distinguish:

- concrete reference names, already handled elsewhere;
- generic semantic terminology used in tracker-authored messages.

Determine which have official standalone/localized evidence.

---

# Audit question 9 — Starfield

Audit the term:

```text
Starfield
```

Determine whether the Japanese product/game title is localized, transliterated, or preserved in Latin script in official Japanese assets/UI.

If official usage differs by context, report it.

This term should be reusable in future tracker copy such as About/help text.

---

# Audit question 10 — terminology registry design

Recommend a durable tracked artifact.

Preferred candidate:

```text
reference-source/official-terminology-provenance.csv
```

or JSON if the data shape genuinely requires nested/contextual evidence.

The artifact must support future locales.

At minimum it should preserve:

```text
TermId
CanonicalEnglish
EvidenceKind
SourcePlugin
RecordSignature
RecordFormID
FieldPath
NameSourcePlugin
StringTable
StringID
OfficialEnglish
OfficialJapanese
Context
Notes
```

For contextual-only evidence, allow nullable record fields.

If multiple contexts are required, define a clean one-to-many representation rather than stuffing multiple sources into one cell.

---

# Audit question 11 — future-language reuse

The terminology artifact must make French/German/etc. materially easier.

For terms with a stable qualified string ID, future locale onboarding should be:

```text
same TermId
same qualified Bethesda string identity
+ locale string table
-> official localized term
```

For contextual evidence, future locale onboarding should reuse the same source context/string ID and inspect the corresponding localized text.

The audit should explicitly state which terms will be fully reusable and which will still require language-specific editorial judgment.

---

# Audit question 12 — semantic-message parameterization

Determine where semantic messages should be parameterized around reusable official terms rather than hard-code them.

Good candidates may include messages where:

- a provenance-backed skill name is embedded;
- X-Tech is embedded;
- the same official term occurs repeatedly.

But avoid excessive parameterization.

Recommend parameterization only when it:

- prevents duplicated official terminology;
- clearly improves consistency across locales;
- does not make Japanese grammar awkward;
- does not make message keys harder to understand.

Tracker-authored sentence grammar remains locale-owned.

---

# Audit question 13 — current Japanese catalogue comparison

For each terminology cluster:

```text
current Japanese wording
vs
official Japanese evidence
```

Classify as:

```text
MATCH
ACCEPTABLE_VARIANT
SHOULD_CHANGE
CONTEXT_DEPENDENT
UNRESOLVED
```

Do not change catalogue files during the audit.

Provide exact recommended Japanese wording only where evidence is sufficient.

---

# Audit question 14 — semantic correctness vs literal reuse

Official terminology should guide word choice, not force awkward sentence construction.

The report must explicitly distinguish:

```text
official lexical term
from
tracker-authored sentence grammar
```

For Japanese, do not require literal substring substitution if natural grammar needs:

- particles;
- inflection;
- compounding;
- omission;
- reordering.

The terminology registry is provenance, not a templating engine.

---

# Audit question 15 — About/help/hint reuse

Since future tracker features may add:

```text
About copy
hints
help text
tooltips
```

recommend how developers should reuse the official terminology registry.

The intended rule should be:

```text
new tracker-authored text
-> semantic localization layer
-> use official terminology evidence where relevant
```

not:

```text
hard-code English game terminology in components
```

No new user-facing text should bypass localization.

---

# Audit question 16 — terminology not found

For terms where no authoritative Bethesda string evidence can be found:

- say so explicitly;
- classify whether current Japanese translation is acceptable tracker-owned wording;
- recommend manual editorial adjudication;
- do not invent a fake official source.

The absence of a standalone official string is a valid audit result.

---

# Audit question 17 — implementation boundary

End with a recommended implementation scope for the terminology pass.

Expected work may include:

- add terminology provenance artifact;
- update Japanese semantic messages;
- parameterize selected official terms;
- preserve reusable qualified IDs;
- add terminology verification tests;
- update translation review evidence.

Do not include:

- fonts/layout;
- Japanese search hardening;
- broad collation;
- accessibility audit;
- runtime reference-name architecture changes.

---

# Durable terminology IDs

Recommend stable functional IDs such as:

```text
term.outpost
term.cargo-link
term.cargo-pad
term.inter-system-cargo-link
term.biome
term.planet
term.star-system
term.x-tech-power-core
term.starfield
```

Avoid transient plan identifiers.

If context variants are needed, use descriptive suffixes, for example:

```text
term.system.generic
term.star-system.full
```

only where evidence justifies a distinction.

---

# Required report tables

## Terminology summary

```text
TermId
CanonicalEnglish
EvidenceKind
OfficialEnglish
OfficialJapanese
SourceIdentity
CurrentJapanese
Assessment
RecommendedAction
```

## Deferred-message reconciliation

```text
MessageKey
TerminologyCluster
CurrentJapanese
EvidenceStatus
RecommendedDisposition
```

## Future-language reuse

```text
TermId
StableStringIdentity?
ContextRequired?
FutureLocaleCanResolveDirectly?
EditorialReviewStillNeeded?
```

---

# Evidence standards

Prefer:

1. exact standalone qualified Bethesda string identity;
2. exact contextual qualified Bethesda string identity;
3. multiple corroborating official contexts;
4. explicit “no authoritative evidence found.”

Do not use:

- unofficial wikis as primary authority;
- machine translation as authority;
- English guesswork;
- fuzzy matching without source identity.

xEdit may be used as a development-time oracle for record/context identification.

---

# Temporary diagnostics

If needed, place diagnostics under:

```text
.local-work/localization/terminology-audit/
```

Do not commit Bethesda table dumps.

Do not modify tracked semantic catalogues during the audit.

---

# Non-goals

Do not:

- implement the terminology changes;
- change generated Japanese reference-name artifacts;
- change runtime lookup architecture;
- change search behavior;
- change fonts/layout;
- simplify button labels such as `+ Add Outpost` yet;
- add new UI copy;
- touch persistence/history/import/export/schema;
- add support for mods/Creations.

The `+ Add` / `+` button simplification idea belongs to later UI hardening.

---

# Verification

Run repository-safe checks needed for the audit.

At minimum:

```text
git diff --check
```

If temporary scripts use installed localization inputs, report:

- authoritative plugin/table sources;
- string IDs inspected;
- diagnostic location.

No production artifacts should be regenerated or changed.

---

# Audit disposition

End with one of:

## Outcome A — terminology largely reusable

Most recurring terms have stable standalone or strong contextual official evidence.

Recommend a focused implementation pass.

## Outcome B — mixed evidence

Some terms are reusable, others require Japanese-specific editorial adjudication.

Recommend a mixed terminology-provenance + catalogue-edit implementation pass.

## Outcome C — insufficient authoritative evidence

Too much of the deferred terminology lacks reliable official evidence.

Recommend manual editorial review rather than pretending it is Bethesda-authoritative.

---

# Final report requirements

The report must state:

1. exact number of deferred semantic messages reconciled;
2. exact number of reusable terminology clusters;
3. how many have standalone official string identities;
4. how many rely on contextual evidence;
5. how many remain tracker-owned/manual;
6. whether any current Japanese wording should change;
7. proposed durable terminology artifact;
8. future-language reuse model;
9. recommended parameterization changes;
10. smallest implementation scope;
11. whether any blocker remains before implementation.

Do not proceed to implementation unless separately instructed.
