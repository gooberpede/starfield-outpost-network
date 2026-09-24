# CODEX AUDIT BRIEF — Public Repository Rights, Provenance, and Publication Sign-off

## Objective

Perform a **bounded, evidence-led publication sign-off audit** for the current `staging` repository before it is made public.

This is **not a request for legal advice, legal certainty, or a lawyer-like risk memo**.

The user has already decided:

- publish the existing repository and retain its development history after review;
- license project-authored code under **GPL-3.0-or-later**;
- use **Gooberpede** as the public copyright identity;
- retain the Flaticon favicon and its existing history under a **clear separate-licence notice**;
- do not relicense the favicon under GPL;
- do not contact Flaticon, replace the favicon, or rewrite Git history in this audit;
- use GitHub Issues for ordinary bugs/suggestions and `support@starfieldoutposts.com` for private/alternative contact;
- use `https://ko-fi.com/gooberpede` as a general Bethesda modding/tools support page;
- all released projects remain free-to-use; tips or memberships support the developer rather than buying features, exclusives, access, priority support, or delivery commitments;
- the user is not seeking legal certainty and will consult a solicitor if legal advice is needed.

The audit’s job is practical:

> Identify exactly what is being published, how it is sourced, how comparable Bethesda-community projects operate in practice, what Bethesda has actually enforced historically, and whether any concrete current repository item presents an obviously poor publication choice.

Do not turn this into speculative risk amplification.

---

## Baseline and sources

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
repository visibility
```

Inspect at minimum:

```text
LICENSE or licence files
THIRD-PARTY-NOTICE.md
docs/THIRD-PARTY-REFERENCES.md
README.md
package.json
docs/BACKLOG.md
docs/DEPLOYMENT.md
docs/audits/RELEASE-READINESS-REVIEW.md
docs/audits/RELEASE-PREPARATION-VERIFICATION.md
docs/localization/
reference-source/
public/reference-data/
src/localization/generated/
scripts/localization/
```

Also inspect tracked assets and relevant reachable history.

---

## Scope boundary

Focus on publication rights/provenance for:

```text
project-authored code and docs
third-party assets
Flaticon favicon
fonts
runtime dependencies
game-derived reference data
official/localized game names
generated reference overlays
provenance crosswalks
historical source/reference files
translation-service-derived text
development-tool/reference influences
```

Do not reopen unrelated release-readiness issues.

Do not:

```text
change repository visibility
rewrite history
delete historical files
replace the favicon
contact Flaticon or Bethesda
request credentials
publish releases
create tags
deploy
change licences
modify runtime code
```

Only create the durable audit report.

---

## Reasoning standard

Use a **common-sense, evidence-based software-publication standard**.

Do not write like outside counsel.

Do not:

- present every ambiguity as a blocker;
- treat absence of explicit permission language as proof of prohibition;
- speculate expansively about hypothetical lawsuits;
- imply that maximally conservative legal interpretation is the project requirement;
- repeatedly substitute “consult a lawyer” for the requested practical analysis.

You may flag obviously bad ideas, for example:

```text
publishing raw proprietary game archives/plugins
committing Bethesda binary game files
claiming Bethesda trademarks/artwork are GPL-covered
removing required third-party attribution
misrepresenting official Bethesda affiliation
publishing credentials or private user data
```

The user is not asking Codex to certify legality.

---

## Evidence hierarchy

Use evidence in this order.

### A. Repository facts

What is actually tracked, generated, deployed, or preserved in history.

### B. Actual licences/terms

Use current applicable licence/terms where known. Do not infer licence from filenames or attribution alone.

### C. Analogous real-world Bethesda projects

This is essential.

Research comparable Bethesda-community projects/tools and how they distribute:

```text
game-data facts
record/FormID databases
localized strings/names
modding utilities
load-order/plugin tools
save editors
wiki/reference databases
xEdit-related tooling
Creation Kit ecosystem tools
Starfield/Skyrim/Fallout data viewers or planners
```

Prefer established, long-lived public projects.

For useful analogues record:

```text
project
repository/site
what Bethesda-derived material it publishes
whether source is public
licence if visible
whether official text/names/FormIDs are included
whether raw game assets are included
known enforcement/takedown history if any
```

Do not assume an analogue is compliant merely because it exists; use it as **practice evidence**, not legal proof.

### D. Actual Bethesda enforcement history

Research what Bethesda/ZeniMax/Microsoft **has actually done**, not only what terms hypothetically permit.

Look for documented examples involving:

```text
mods
modding tools
fan projects
game assets
source-code leaks
trademark misuse
commercial exploitation
unauthorized game redistribution
reverse engineering
wiki/reference data
modding databases
```

Distinguish:

```text
DMCA/takedown
cease-and-desist
lawsuit
platform removal
policy restriction
ordinary tolerated ecosystem activity
```

Do not manufacture a pattern from unrelated disputes.

---

## Bethesda modding ecosystem context

Explicitly account for the large, long-running Bethesda modding ecosystem.

Review practical analogues such as:

```text
Creation Kit ecosystem
Nexus Mods
xEdit / SSEEdit / FO4Edit / SF1Edit
LOOT
Wrye Bash or similar tools
UESP/community reference databases
Starfield community databases
mod managers
record browsers
save editors where relevant
```

The point is **not** “everyone does it, therefore it is legal.”

The practical question is:

> Does this tracker’s publication model broadly resemble ordinary Bethesda modding/reference tooling, or does it materially cross into conduct Bethesda has historically acted against?

---

## Publication ledger

Categorize repository material, for example:

```text
A. Project-authored code
B. Project-authored documentation
C. Third-party software dependencies
D. Third-party artwork/assets
E. Canonical game-derived facts/IDs
F. Official localized names/text
G. Generated transformations/overlays
H. Development-tool outputs/review artifacts
I. Historical-only material
```

For each category identify:

```text
representative paths
source/provenance
current licence/notice treatment
included in deployed runtime?
included in public source?
historical only?
publication recommendation
```

---

## Project-authored code

Chosen licence:

```text
GPL-3.0-or-later
```

Confirm the repository applies that clearly to project-authored code.

Check:

- licence file/text;
- README wording;
- About wording;
- copyright attribution;
- package metadata where relevant.

Do not require per-file GPL boilerplate unless a concrete reason exists.

Do not apply GPL automatically to third-party assets/data.

---

## Flaticon favicon — settled decision

The following decision is **settled**:

> Retain the favicon and existing history, with a clear separate-licence notice.

Do not reopen it as a licence-selection debate.

Audit only whether the current notice clearly communicates:

```text
favicon is separately licensed
favicon is not covered by GPL-3.0-or-later
required gravisio/Flaticon attribution is retained
```

The supplied licence certificate identifies the asset as “Space exploration” by gravisio under Flaticon’s free commercial-use-with-attribution licence.

Do not recommend history rewriting unless a new concrete enforcement/publication fact materially changes the decision.

---

## Starter/default assets

Verify whether setup/default assets remain unused, such as:

```text
Vite/React starter logos
unused hero art
unused SVG sprite sheets
public icons
template artifacts
```

For each:

- verify use;
- identify source/licence where practical;
- recommend current-tree removal if unused.

Do not rewrite history merely because an obsolete asset existed there.

---

## Fonts

Confirm current font usage and licence basis.

If Google Fonts are externally hosted:

- identify families;
- record upstream licence;
- determine whether deployment redistributes binaries or requests them externally;
- note whether font files exist in repository history.

Do not turn accepted external-font usage into a self-hosting project.

---

## Runtime dependencies

Review actual shipped/runtime dependency licensing.

Focus on code actually included in production, such as:

```text
React
React DOM
other runtime-shipped dependencies
```

Do not require exhaustive documentation for development-only transitive dependencies unless a concrete redistribution issue exists.

Determine whether normal licence preservation/notices are sufficient.

---

## Game-derived reference data

This is the central publication question.

Inventory what is distributed from game-derived sources, including where applicable:

```text
systems
planetary bodies
resource identities
FormIDs
product identities
recipes
biomes
species
localized official names
rarity/family relationships
occurrence records
generated overlays
```

For each population identify:

```text
source type
fact vs expressive text
raw extraction vs normalized/transformed output
official IDs/names?
project-created fields/mappings?
raw Bethesda binary/source files present?
```

Do not collapse all game-derived material into one category.

---

## Raw assets versus extracted facts

Explicitly distinguish:

### Raw/proprietary content

Examples:

```text
Starfield.esm
BA2 archives
STRINGS/DLSTRINGS/ILSTRINGS
textures
models
audio
official screenshots/artwork
large copied scripts/assets
```

### Extracted/normalized facts

Examples:

```text
FormIDs
record IDs
system/body names
resource relationships
recipe ingredient IDs
planet/resource occurrence facts
localized names
```

Determine whether raw proprietary game assets exist in the repository.

If none are present, say so clearly.

Do not describe extracted facts as equivalent to redistributing game archives.

---

## Official names and localized text

Short official entity names are different from reproducing dialogue, books, quests, or other substantial expressive text.

Research analogous publication practice in:

```text
UESP
xEdit
LOOT/masterlists
mod documentation
Nexus projects
Starfield databases
community tools
```

Assess whether analogous projects use:

```text
entity names
FormIDs
EditorIDs
short labels
localized names
```

and whether they reproduce substantial narrative text.

Reflect that distinction in the recommendation.

---

## Generated localization overlays

Inspect generated reference-name overlays.

Determine:

```text
what they contain
source provenance
short names/labels vs larger expressive text
normalization/transformation performed
runtime bundling behavior
```

Assess them alongside analogous tools/databases.

Do not treat generated files as automatically project-owned because a script produced them.

Do not equate them automatically with raw string-table redistribution unless evidence supports that equivalence.

---

## Provenance crosswalks and reference-source datasets

Inspect:

```text
localized-name provenance CSVs
official terminology CSVs
fauna evidence
resource dictionaries
canonical reference-source CSVs
```

Determine whether each is:

```text
source-derived facts
project-authored mappings
mixed-source datasets
review/provenance evidence
```

Document the boundary.

---

## Bethesda terms — use narrowly

Review current Bethesda/Microsoft terms only as one evidence source.

Do not quote broad terms and then declare publication unsafe.

Answer:

```text
What conduct do the terms clearly prohibit?
What conduct do they expressly permit/contemplate?
What does Bethesda's modding tooling/ecosystem show operationally?
What has Bethesda actually enforced against?
Does this tracker resemble tolerated tooling or historically targeted conduct?
```

---

## Actual Bethesda enforcement history

Search for documented enforcement examples.

Potential categories:

```text
commercial sale of mods/assets
unauthorized game redistribution
source-code leaks
fan remakes
trademark confusion
monetized projects
asset extraction/republication
third-party-IP mods
reverse-engineering tools
```

For each meaningful example record:

```text
date
project
conduct at issue
Bethesda/ZeniMax/Microsoft action
outcome if known
relevance to this tracker
```

Avoid materially dissimilar cases.

---

## Historical material

The development history is intended to remain public.

Use proportionality.

Do not propose history rewriting merely because:

- deleted XLIFFs exist;
- an old local path appears in prose;
- obsolete starter assets existed;
- implementation briefs contain superseded decisions.

Recommend history rewriting only for materially serious content such as:

```text
credentials
private personal data
raw proprietary game archives
material the user explicitly decides must not be published
```

---

## Translation handoffs

Historical XLIFF handoffs are not sensitive and are intentionally allowed to remain in history.

Do not treat them as a blocker.

Check only whether any concrete service-term distribution issue exists.

If not, record:

```text
historical only
not active translation source
no action
```

---

## DeepL/OpenAI/development-tool outputs

Review tool-output provenance only for concrete redistribution obligations.

Do not assume machine-translated/project-generated prose is owned by the service.

Ask only:

- are there attribution obligations?
- are there redistribution restrictions relevant to committed output?

If not, no further action.

Do not turn AI-assisted development into a publication blocker.

---

## README / notices / ledger recommendations

Recommend the minimum durable documentation required.

Likely owners:

```text
LICENSE
THIRD-PARTY-NOTICE.md
docs/THIRD-PARTY-REFERENCES.md
README licensing section
README unofficial-project disclaimer
```

Avoid duplication.

A reader should understand:

```text
what GPL covers
what it does not cover
favicon separate licence
third-party dependency notices
Bethesda relationship/disclaimer
source-data provenance
```

Do not turn the About dialog into a legal essay.

---

## Bethesda affiliation disclaimer

Current intended meaning:

```text
independent, unofficial project
not affiliated with or endorsed by Bethesda Game Studios or Microsoft
```

Assess whether current wording is sufficient.

Do not invent extra trademark boilerplate without a reason.

---

## Common-sense disposition labels

Use practical labels such as:

```text
LOW PRACTICAL CONCERN
COMMON / ESTABLISHED ECOSYSTEM PRACTICE
NEEDS CLEAR NOTICE / BOUNDARY
AVOID / REMOVE
USER DECISION
```

Do not invent numeric legal-risk scores.

---

## Decision ledger

Include:

| Material | Current treatment | Evidence | Recommendation | Action before publication |
| --- | --- | --- | --- | --- |

At minimum cover:

```text
project-authored code
favicon
unused starter assets
runtime dependencies
fonts
canonical game-derived reference data
official localized names
generated overlays
provenance CSVs
historical XLIFFs
audits/brief history
```

---

## Publication recommendation

End with one of:

```text
PUB-A — Current repository scope is suitable for publication after small notice/documentation cleanup.
PUB-B — Suitable after specific current-tree removals/notice changes.
PUB-C — One or more concrete material issues require user decision before publication.
PUB-D — A serious publication problem was found; stop publication preparation.
```

Do not use PUB-D merely because legal certainty is impossible.

---

## Release-gate closure criteria

The repository-publication gate may close when:

- GPL-3.0-or-later scope is documented;
- favicon separate-licence boundary is documented;
- unused unnecessary assets are removed from the current tree;
- third-party notices accurately cover current shipped material;
- repository history has no known credentials/private user data/raw proprietary game archives;
- game-derived/publication scope has a documented practical disposition;
- README/build/provenance documentation does not materially misrepresent sources;
- the user explicitly signs off the publication scope.

Do not require perfection beyond these evidence-based criteria.

---

## Deliverable

Create only:

```text
docs/audits/PUBLIC-REPOSITORY-PUBLICATION-SIGNOFF.md
```

or an equally clear repository-consistent filename.

Do not edit:

```text
LICENSE
README
notices
assets
history
runtime
localization
reference data
package metadata
Cloudflare
GitHub visibility/settings
```

---

## Verification

Run:

```text
git diff --check
```

Confirm:

- only the audit report was created;
- no runtime/config/licence/history change occurred;
- external claims are cited;
- analogues are real;
- enforcement examples are documented, not hypothetical;
- lack of enforcement is not described as legal immunity;
- no speculative worst case is presented as fact.

No full build/test run is required for this report-only task.

---

## Expected Codex summary

Report:

1. branch/commit;
2. report path;
3. publication recommendation PUB-A/B/C/D;
4. project-code licence disposition;
5. favicon disposition;
6. unused-asset findings;
7. dependency/font findings;
8. game-derived data categories;
9. official-name/localization findings;
10. analogous Bethesda tools/projects reviewed;
11. actual Bethesda enforcement examples found;
12. whether the tracker resembles established/tolerated tooling or historically targeted conduct;
13. historical-material findings;
14. translation/tool-output findings;
15. README/notice cleanup needed;
16. concrete blockers, if any;
17. residual uncertainties;
18. user decisions still required;
19. checks run;
20. confirmation no publication/settings/history/runtime changes occurred.

Suggested commit message:

`docs: audit public repository publication`
