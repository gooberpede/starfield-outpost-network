# CODEX AUDIT BRIEF — Organic Farming: Planet-Level Eligibility vs Biome Occurrence

## Objective

Audit the current organic-production model against this confirmed rule:

```text
Biome has no bearing on whether an organic resource can be farmed.

A flora/fauna species may be farmed at any outpost on a planet where that species exists,
provided the species is farmable/domesticable.

Planet membership still matters.
Domesticability/farmability still matters.
```

Examples:

```text
A Jemison species cannot be farmed on Ternion III.

A farmable species that exists somewhere on Jemison may be farmed at a Jemison outpost
even if that species does not naturally occur in the outpost's selected biome.

Fauna follows the same rule.

If a planet has no domesticable fauna, no fauna farming route should be available there,
regardless of biome.
```

The audit must identify every place where current tracker behavior incorrectly uses **biome occurrence** as a prerequisite for **organic farming eligibility**, then define the narrowest correct pre-release fix.

This is an **audit only**. Do not implement changes.

---

## 1. Authoritative conceptual distinction

Treat these as separate concepts.

### Natural biome occurrence

Answers:

```text
Where does this flora/fauna naturally occur?
```

Biome remains relevant here.

### Planetary farming eligibility

Answers:

```text
Can an outpost on this planet farm this species/resource?
```

Correct rule:

```text
species exists on selected planet
AND species is farmable/domesticable
```

Incorrect rule:

```text
species exists in selected biome
AND species is farmable/domesticable
```

The audit should preserve this distinction throughout.

---

## 2. Baseline

Work from the current committed `staging` branch.

Record:

```text
branch
commit
tracked/untracked state
```

Read first:

```text
AGENTS.md
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Then inspect all reference-generation, production, validation, persistence, UI, test, and documentation paths that depend on biome-aware organic data.

Do not modify the supplied audit brief.

---

## 3. Full data-flow scope

Trace organic farming through:

```text
reference-source occurrence data
→ generated reference data
→ selected body/biome state
→ organic availability
→ production-route creation
→ validation
→ persistence/import/export
→ UI filtering/presentation
→ tests
→ durable documentation
```

Do not assume the error is isolated to one validator or one UI component.

---

## 4. Reference-source audit

Inspect at minimum:

```text
reference-source/biome-organic-resources.csv
reference-source/item-tracker-metadata.csv
reference-source/planet-directory.csv
```

and any other files that encode:

```text
species identity
body/planet identity
biome identity
resource output
flora/fauna type
farmability/domesticability
```

Determine:

- what proves a species exists on a planet;
- what proves it is farmable/domesticable;
- whether flora and fauna use different indicators;
- whether one species occurs in multiple biomes;
- whether multiple valid species on the same planet can produce the same resource;
- what duplicate collapse is required when deriving planet-level farming eligibility.

Do not alter source-file grain merely to simplify downstream logic.

---

## 5. Reference-generation audit

Find all generator logic that:

```text
filters organic production by biome
joins producer eligibility to selected biome
emits organic farming availability at Planet × Biome grain
uses natural occurrence as a farming gate
```

Classify findings:

```text
OFE-A — legitimate biome-occurrence logic; keep
OFE-B — farming logic wrongly constrained by biome; change
OFE-C — mixed occurrence/farming logic that must be split
```

For every actionable location, state the semantic correction.

---

## 6. Runtime reference-data audit

Determine what organic availability the browser currently receives.

Answer:

- Is only biome-scoped organic availability exposed?
- Is planet-wide species/resource identity already exposed separately?
- Can planet-level farmability be derived cheaply and clearly at runtime?
- Would a generated planet-level farmability index be cleaner?
- Is any runtime reference-data schema change required?

If a runtime schema change is needed, identify it explicitly.

---

## 7. Architecture options

Compare at least:

### Option A — runtime aggregation

Keep biome occurrence data unchanged and derive planet-level farmable producers/resources at runtime.

### Option B — generated planet-level farming index

Generate an explicit body/planet keyed structure of farmable producers/resources.

### Option C — reuse an existing planet-level structure

If one already contains the necessary information, adapt farming logic to use it.

Compare:

```text
correctness
clarity
duplication
runtime complexity
generated-data size
testability
schema impact
future planner usefulness
```

Recommend one.

---

## 8. Production-route model audit

Trace creation and storage of organic production routes.

Determine whether route identity currently includes:

```text
body
biome occurrence
producer species
resource
```

and which fields are truly semantic requirements.

Explicitly distinguish:

```text
outpost biome
natural occurrence
producer species
produced resource
```

Do not remove biome from the outpost model itself. Biome remains valid outpost state and may still matter elsewhere.

---

## 9. Validation audit

Find every validation rule that can reject/warn because an organic producer/resource is absent from the selected biome.

Under the confirmed rule, that is wrong.

Determine the correct validation semantics:

```text
selected planet has a farmable/domesticable species capable of producing this resource
```

If routes persist a specific producer, determine whether that exact producer must remain valid rather than merely any producer of the resource.

Do not weaken validation beyond the confirmed rule.

---

## 10. UI filtering audit

Inspect every UI location that offers or hides:

```text
organic resources
flora producers
fauna producers
organic production routes
```

Identify any biome-based filtering that should become:

```text
selected planet + farmability/domesticability
```

Also identify wording that currently implies "available in this biome" when the relevant concept is actually "farmable on this planet."

---

## 11. Existing-save compatibility

Determine whether persisted networks encode organic production in a biome-dependent way.

Inspect:

```text
current schema
older schema migrations
browser persistence
JSON import/export
organic route serialization
```

Answer:

- Can the correction be made entirely in derived logic?
- Does any persisted route store a biome occurrence ID solely to prove farmability?
- Is any schema migration required?
- Do previously valid saves remain valid unchanged?
- Do previously impossible but game-valid routes simply become newly creatable/acceptable?

Prefer no save-schema migration if correctness can be restored without one.

---

## 12. Import/export compatibility

Determine whether imports currently reject:

```text
planet-correct + domesticable + biome-non-native
```

organic routes.

Correct result:

```text
planet-correct + domesticable + biome-non-native → valid
wrong planet → invalid
planet-native + non-domesticable → invalid
```

Do not relax any other rule.

---

## 13. Flora/fauna parity

This is **not** a greenhouse-only correction.

Audit both:

```text
flora / greenhouse
fauna / animal husbandry
```

The common high-level rule is:

```text
planet membership + farmability/domesticability
```

Preserve any genuine flora/fauna-specific metadata or route semantics.

---

## 14. Domesticability/farmability source of truth

Determine exactly how the project currently knows a species can be farmed.

Document whether this is represented by:

```text
boolean metadata
keywords
route category
reference policy
derived rule
other field
```

The fix must not accidentally make every planet-native species farmable.

Planets with fauna but no domesticable fauna must still expose no fauna farming option.

---

## 15. Multiple producers / same resource

Investigate cases where several farmable species on one planet yield the same organic resource.

Determine:

```text
whether resource availability is the union of valid producers
whether route identity preserves a specific producer
how validation behaves if one producer becomes invalid but another remains valid
```

Preserve meaningful producer identity if the current model uses it.

---

## 16. Biome data retention

Do **not** remove biome occurrence data.

It remains valid for:

```text
natural-world reference truth
where species can be found
future reference/planner features
other biome-aware modelling
```

Identify which existing biome-aware organic structures remain correct after the farming fix.

---

## 17. Inorganic separation

Ensure the organic fix does not weaken inorganic rules.

Inorganic extraction may remain biome-sensitive under the current design.

Call out shared helpers where changing generic availability logic could accidentally alter inorganic behavior.

---

## 18. Matrix / Planned Supply / Search implications

Inspect whether corrected farming availability affects:

```text
Resource Matrix
Planned Supply
Search for Items
production indicators
validation diagnostics
```

Identify which derive from actual routes versus reference availability.

---

## 19. Test audit

Inventory tests that encode the wrong assumption.

Look for cases equivalent to:

```text
organic unavailable outside selected biome
flora production requires matching biome
fauna production requires matching biome
changing biome invalidates organic production
```

Classify:

```text
rewrite
retain
add regression coverage
```

Required eventual regression cases:

1. planet-native + domesticable + wrong biome → **valid**
2. planet-native + domesticable + matching biome → **valid**
3. wrong planet → **invalid**
4. planet-native + non-domesticable → **invalid**
5. planet with fauna but zero domesticable fauna → **no fauna farming options**
6. equivalent flora cases
7. multiple biomes on one planet
8. multiple valid producers of the same resource, if present in source data

---

## 20. Documentation audit

Inspect current durable docs for incorrect biome-bound farming claims:

```text
README.md
docs/ARCHITECTURE.md
docs/DOMAIN-RULES.md
docs/UX-DESIGN.md
docs/BACKLOG.md
```

Historical briefs/audits may retain historically accurate older assumptions and should not be rewritten merely for consistency.

Current owner docs should clearly distinguish:

```text
biome occurrence
planetary farming eligibility
```

---

## 21. Terminology recommendation

Recommend stable names for code/docs that make conflation less likely.

Useful concepts may include:

```text
biome occurrence
organic occurrence
planetary farming eligibility
farmable organic resource
domesticable producer
planet-native producer
```

Avoid generic names whose scope is unclear unless the owner context makes it explicit.

---

## 22. Quantify impact where possible

Using current checked-in data, derive where practical:

```text
number of affected planets
number of planet × biome cases currently too restrictive
number of farmable resources newly available in at least one biome
flora impact
fauna impact
tests/validators affected
```

Do not infer unsupported game facts.

---

## 23. Implementation-scope classification

For each area classify as:

```text
required
likely
not required
```

Areas:

```text
reference generation
runtime reference data
domain helpers
route creation
validation
UI filtering
tests
durable docs
save schema
import/export
```

Prefer the narrowest correct implementation.

---

## 24. Stop conditions

If current source data is insufficient to derive:

```text
planet membership
farmability/domesticability
producer → resource output
```

reliably, stop and identify the missing evidence.

If the current organic route schema cannot represent the corrected rule without a broader persisted-schema redesign, report that explicitly rather than inventing a workaround.

---

## 25. Audit-only constraints

Do not:

```text
edit source files
edit reference data
regenerate artifacts
change tests
change schemas
change localization
change app version
commit
push
deploy
```

Only create the audit report.

---

## 26. Expected report

Create:

```text
docs/audits/ORGANIC-FARMING-PLANETARY-ELIGIBILITY-REVIEW.md
```

Include:

1. baseline
2. confirmed rule
3. occurrence-vs-farming conceptual model
4. source-data findings
5. reference-generation findings
6. runtime-data findings
7. route-model findings
8. validation findings
9. UI filtering findings
10. save/import compatibility
11. flora/fauna parity
12. domesticability source of truth
13. multiple-producer behavior
14. biome data retained
15. inorganic isolation
16. Matrix/Planned Supply/Search implications
17. test impact
18. documentation impact
19. architecture options
20. recommendation
21. quantified impact
22. implementation scope
23. finite verification plan
24. disposition

---

## 27. Disposition

End with one:

```text
OFARM-A — current model already matches confirmed rule; no change required
OFARM-B — bounded logic/validation correction; no reference schema change
OFARM-C — reference-generation/runtime derived-data correction required
OFARM-D — broader persisted/domain schema migration required
```

Use the narrowest justified classification.

This issue remains a **HIGH-priority pre-release blocker** until corrected and verified.

---

## 28. Verification

Run:

```text
git diff --check
```

Confirm:

```text
only the audit report is created
the supplied brief remains untouched
no source/reference/runtime files changed
no regeneration occurred
no commit/push/deployment occurred
```

No full build/test run is required for report-only work.

---

## Expected Codex summary

Report:

1. branch/commit
2. report path
3. OFARM-A/B/C/D disposition
4. exact current wrong assumption
5. where biome occurrence gates farming
6. domesticability/farmability source of truth
7. whether current source data is sufficient
8. recommended architecture
9. runtime reference schema impact
10. persisted save schema impact
11. import/export impact
12. flora/fauna parity findings
13. multiple-producer findings
14. inorganic isolation
15. affected tests
16. affected durable docs
17. quantified impact
18. exact implementation scope
19. release-blocker status
20. confirmation no implementation occurred

Suggested commit message:

```text
docs: audit planetary organic farming eligibility
```
