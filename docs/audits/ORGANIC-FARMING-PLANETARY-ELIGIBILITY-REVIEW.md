# Organic Farming Planetary Eligibility Review

## 1. Baseline

- Branch: `staging`
- Commit: `236b222024e0fe11177d95d30fa45c1bd160bcd4`
- Initial tracked state: clean
- Initial untracked state: `docs/implementation-briefs/CODEX_AUDIT_BRIEF_organic-farming-planetary-eligibility.md`
- Audit basis: the checked-in reference sources and generated runtime data at the commit above. The supplied untracked brief was treated as authoritative for this audit and was not modified.

## 2. Confirmed rule

Organic farming eligibility is planet-level:

```text
species belongs to the selected planet/body
AND the species is domesticable/farmable
AND the species has the persisted route's harvested resource
```

The outpost's selected biome is not part of that decision. A species from another planet remains invalid, and a planet-native wild-only species remains invalid. The same rule applies to flora/greenhouses and fauna/animal husbandry.

This is a HIGH-priority pre-release blocker until the implementation and regression coverage described below are complete.

## 3. Occurrence versus farming conceptual model

The repository already has the right conceptual data split, but runtime consumers recombine it incorrectly.

| Concept | Question | Correct source | Grain |
| --- | --- | --- | --- |
| Biome occurrence | Where does this species naturally occur? | `organicOccurrences` | body-biome occurrence × species |
| Planet membership and farming facts | Can this exact producer be farmed on this body, and what does it yield? | `planetSpecies` | body × species |
| Producer identity | Which flora/fauna species is the route using? | `species` plus the route's `speciesId` | species / persisted route |
| Farming inputs | What inputs does the producer class require? | `organicFarmingProfiles` | source class |

Biome selection remains persisted outpost state. It continues to constrain biome-occurring inorganic extraction and may support natural-occurrence reference/planner features, but it must not constrain organic farming.

## 4. Source-data findings

`reference-source/biome-organic-resources.csv` is sufficient to establish all required facts:

- `PlanetFormID` proves body membership and joins to `planet-directory.csv`;
- `SpeciesFormID`, `SpeciesType`, and `SpeciesDisplayName` establish species identity and flora/fauna type;
- `Domesticable` is the explicit farmability source of truth for both flora and fauna (`Yes`/`No`);
- `ResourceFormID` plus `ResourceResolutionStatus` establishes the harvested output when resolved;
- the two input slots establish the farming input signature used to derive plant/herbivore/carnivore source class;
- `BiomeIndex` and `BiomeFormID` describe natural occurrence only.

`reference-source/item-tracker-metadata.csv` does not decide farmability. It crosswalks the 30 organic resource FormIDs to stable application IDs, abbreviations, tracker rarity, and display overrides. `reference-source/planet-directory.csv` validates the referenced body and system; it does not carry species farmability.

Flora and fauna use the same `Domesticable` indicator. They differ only in species type and the input-derived source classes: flora resolves to `plant`; fauna resolves to `herbivore` or `carnivore`. Input presence is not a substitute for `Domesticable: Yes`.

The source is intentionally occurrence-grained. One body/species can repeat across several biome rows. `buildBiomeData` correctly collapses those rows as follows:

- body × species facts collapse to one `planetSpecies` record, with conflicts rejected;
- body-biome occurrence × species collapses to one `organicOccurrences` record;
- global species identity collapses to one `species` record;
- farming profiles collapse by source class.

The source grain must remain unchanged. Several valid species on one body can produce the same resource; those are distinct producer routes and must not be collapsed to one route. Resource-level consumers may take their union only after route identity has been preserved.

## 5. Reference-generation findings

### OFE-A — legitimate biome-occurrence logic; keep

- `scripts/biome-reference-data.mjs` calls `joinBiome` for each organic source row and emits `organicOccurrences`. This records natural occurrence and should remain.
- The same generator emits body-level `planetSpecies` containing `bodyId`, `speciesId`, `sourceClass`, `domesticable`, and `resourceId`. This is the correct basis for planetary farming eligibility.
- Its agreement checks across repeated body/species rows are correct and should remain.
- `bodyResources` deliberately includes wild-only harvested resources as body presence. It is not a farming index and should not be repurposed as one.
- Organic localization provenance collapses occurrence rows to stable species identities. It does not decide farming eligibility and is unaffected.

### OFE-B — farming logic wrongly constrained by biome; change

No OFE-B finding exists in reference generation itself. The generator neither emits a body-biome farming index nor filters `planetSpecies` by a chosen outpost biome. The wrong gate is introduced in runtime domain logic.

### OFE-C — mixed occurrence/farming logic; split

`src/domain/bodyResourceAvailability.ts#getBiomeSignature` combines biome-scoped inorganic occurrences with domesticable organic species occurrences to decide whether repeated instances of the same stable biome identity share one UI button. Organic occurrence no longer changes current production eligibility, so the production-facing signature should become inorganic-only. Natural organic occurrences must remain available separately for future occurrence presentation/planning.

No source file, generator output, or manifest regeneration is required for the fix.

## 6. Runtime-data findings

The browser already receives both required layers:

- `planet-species.json` exposes planet-wide producer identity, `domesticable`, `resourceId`, and `sourceClass`;
- `species.json` exposes flora/fauna type and display identity;
- `organic-occurrences.json` exposes natural biome occurrence separately;
- `organic-farming-profiles.json` exposes source-class inputs.

Therefore only biome-scoped organic availability is **not** the only representation available. Planetary farming eligibility is cheap and clear to derive by filtering `referenceData.planetSpecies` by `bodyId`, `domesticable === true`, and non-null `resourceId`, then preserving one route per `speciesId + resourceId`.

No runtime reference-data schema change is required. A new generated planet-level index would duplicate `planetSpecies`, enlarge the deployment inventory and manifest, and create another consistency surface without improving the current workload.

## 7. Route-model findings

The persisted route union in `src/domain/models.ts` is already adequate:

```text
organic route = { type, resourceId, speciesId }
body           = owning outpost.bodyId
biome          = owning outpost.selectedBiomeIds (independent outpost state)
```

An organic route does not persist a biome occurrence ID. Natural occurrence is not part of route identity. The route deliberately preserves the exact producer species as well as its resource, and `getProductionRouteKey` uses both. That identity remains meaningful because producers can have different source classes/inputs and because a saved route must validate the exact asserted producer, not merely any producer of the same resource.

No persisted route-model or schema redesign is needed. Do not remove biome state from the outpost model.

One adjacent correction is required in `src/domain/resourcePresence.ts`: `canActivateProductionRoute` currently reduces an organic candidate to resource-level presence. It should ask whether that exact producer route is planet-eligible. This prevents a valid same-resource producer from accidentally authorizing a different invalid producer and aligns activation with route identity.

## 8. Validation findings

`src/domain/validation/rules/activeProductionValidForBody.ts` calls `isProductionRouteAvailable`, which currently calls the biome-filtered organic route helper. Consequently, a planet-correct, domesticable, exact producer is warned as invalid when it does not naturally occur in the selected biome. The organic branch must validate the exact body/species/resource/domesticable tuple without biome input. The inorganic branch must retain its current effective-biome and atmosphere rules.

`src/domain/validation/rules/organicFarmingInputsUnavailable.ts` uses the same availability predicate as a guard. In a wrong-biome-but-planet-valid case it currently suppresses the farming-input diagnostic entirely. After the eligibility correction, it must continue to validate inputs for the now-valid exact route.

The presentation layer in `src/ui/validationPresentation.ts` also assumes organic invalidity can be remediated by listing supporting biomes. Organic invalid-route messages and remediation must instead describe a body/producer mismatch, non-domesticability, or output mismatch without suggesting a biome change. Inorganic remediation must keep its biome list.

Other biome validators (`selectedBiomeValidForBody`, unknown biome IDs, duplicate biome IDs) remain correct because they validate persisted biome state rather than organic farming.

## 9. UI-filtering findings

The following runtime/UI paths inherit the wrong biome prerequisite and require correction:

- `getAvailableOrganicProductionRoutes` filters `planetSpecies` through species found in the effective biome scope;
- `getOutpostProductionResources` therefore omits planet-farmable organic resources from selected biomes where the producer does not naturally occur;
- `OutpostStatusMatrix` uses that route list to create organic rows, light `Present`, show inputs, and enable `Producing`;
- `isResourcePresentAtOutpost` uses that list at resource grain;
- `canActivateProductionRoute` inherits that resource-grain result rather than validating the exact route;
- Search for Items inherits `isResourcePresentAtOutpost`, so its `PRESENT` flag is incorrectly biome-scoped for organics;
- `getDomesticableSourceNames` filters unspecified-route remediation by selected biome;
- `getOrganicPresentTooltip` and its helper derive and name supporting selected biomes.

The narrow correction is to derive organic matrix rows and route eligibility from the selected body plus `planetSpecies.domesticable`, while leaving inorganic availability selected-biome-aware. Existing invalid persisted organic routes should still be merged into the Matrix as recovery rows.

Current localized wording explicitly says an organic resource is available or unavailable "in the selected biome(s)" and says invalid organic production is unavailable for harvesting in named biomes. Those keys occur across all supported locale catalogues and some localization review/test fixtures. The implementation should replace the organic semantics with planet-level wording through the established localization workflow; it should not alter the inorganic biome wording.

## 10. Save and import compatibility

The correction can be entirely derived from existing reference data and persisted fields.

- Current saves store body on the outpost and exact `resourceId + speciesId` on normal organic routes.
- No route stores a biome occurrence ID solely to prove farmability.
- `selectedBiomeIds` remains valid independent outpost state.
- Schemas 1–2 migrate known legacy organics to `organic-unspecified`; schema 3 added biomes/specific routes; schema 4 added capabilities/explicit presence. None requires migration for this rule.
- Previously valid saves remain structurally and semantically valid.
- Previously impossible-but-game-valid routes become visible, creatable, and accepted.
- Previously persisted planet-correct/domesticable/biome-non-native routes lose their false warning.
- Wrong-planet and non-domesticable exact routes remain preserved as asserted production but continue to receive the operational warning.

External import validation is structural and reference-agnostic. It does not currently reject a route based on planet, biome, or domesticability. Such routes import successfully and are then assessed by live validation. Therefore no importer/exporter code or format change is required; regression coverage should confirm the post-import/live-validation outcomes:

```text
planet-correct + domesticable + biome-non-native -> no route-validity warning
wrong planet                                    -> warning
planet-native + non-domesticable                -> warning
```

## 11. Flora/fauna parity

The defect affects both categories. The common filter operates on `planetSpecies` and `organicOccurrences` without limiting itself to flora, and the UI's route list is shared.

The fix must preserve:

- flora route identity and `plant` input profile;
- fauna route identity and `herbivore`/`carnivore` input profiles;
- the global `SpeciesReference.type` distinction;
- the requirement for `domesticable === true` in both cases.

A body with fauna occurrence but no domesticable fauna must continue to expose no fauna farming routes. The checked-in data contains 90 such bodies, providing a useful canonical regression population.

## 12. Domesticability source of truth

The source of truth is the explicit `Domesticable` column in `biome-organic-resources.csv`, normalized to `PlanetSpeciesReference.domesticable` by `buildBiomeData`. It is not inferred from flora/fauna type, a resolved resource, input slots, source class, keywords in runtime code, or mere planet/biome occurrence.

The runtime predicate must therefore require all of:

```text
entry.bodyId === selected body
entry.domesticable === true
entry.resourceId !== null
```

For an existing specific route it must additionally require matching `speciesId` and `resourceId`. This retains the two `NoLinkedResource` planet/species records as non-routes and does not make wild-only species farmable.

## 13. Multiple-producer behavior

The checked-in runtime data contains 68 body/resource pairs, across 44 bodies and 16 resources, with more than one domesticable producer. Those pairs contain 149 producer memberships; 44 pairs include both flora and fauna producers.

The correct behavior is:

- route choices are the union of all eligible body-level producer routes;
- Matrix rows and persisted route identity retain each exact producer;
- active production collapses to one resource only at downstream availability/cargo/Planned Supply boundaries, as `getActiveProducedResourceIds` already does;
- validation of a persisted route checks that exact producer. Another valid producer of the same resource must not rescue an invalid species route;
- loss or invalidity of one producer must not invalidate another producer's distinct route.

## 14. Biome data retained

Keep `biomes`, `bodyBiomes`, and `organicOccurrences`, their source rows, generator joins, conflict checks, and loader types. They remain correct natural-world reference truth and are useful for occurrence explanation and future planning.

Also keep selected biome persistence, body/system change cleanup, biome-ID structural validation, and duplicate-name handling. Only the production-facing signature used to group repeated same-identity biome buttons should stop treating organic occurrence differences as farming-availability differences.

## 15. Inorganic isolation

Inorganic extraction remains biome-sensitive, with atmosphere body-wide. The implementation must not replace or broadly weaken `getEffectiveBodyBiomeIds`, `getOutpostAvailableInorganicResourceIds`, or the inorganic branch of `isProductionRouteAvailable`.

The main risk is the shared `isProductionRouteAvailable` and `getOutpostProductionResources` surface. Split by route type explicitly: selected biome for inorganic, selected body plus exact domesticable producer for organic. Tests must show an inorganic resource absent from the selected biome remains unavailable after the organic correction.

## 16. Matrix, Planned Supply, and Search implications

- **Resource Matrix:** Directly affected. It must show all planet-eligible domesticable producer routes regardless of selected biome. `Present`, input display, and Producing enablement become planet-level for organics while remaining source-specific.
- **Production indicators:** Persisted active routes remain authoritative. The false route-invalid warning disappears for cross-biome farming; wrong-body/non-domesticable routes remain recovery rows.
- **Search for Items:** Directly affected only for the `PRESENT` flag, which mirrors Matrix organic eligibility. It should report the planet-farmable resource at every outpost on that body, regardless of selected biome.
- **Planned Supply:** Catalogue visibility is unaffected. Retirement and actual-availability logic derive from active production, not reference eligibility. Newly enabled routes can subsequently become actual supply and retire matching Planned Supply in the existing one-action flow.
- **Resource availability/provenance/cargo:** No semantics change for an already active route; active production already supplies the resource even when validation finds the route invalid. The fix changes creation and diagnostics, not downstream asserted-supply behavior.

## 17. Test impact

### Rewrite

- `scripts/biome-aware-outposts.test.mjs`: replace the expectation that a selected biome reduces organic routes; change same-biome grouping expectations so organic occurrence alone does not split production-facing buttons.
- `tests/contextualHelpAndTooltips.test.ts`: remove named/plural-biome organic farming claims and assert planet-level wording under selected biome subsets.
- `tests/itemSearchResults.test.ts`: replace the wrong-biome organic omission with planet-level `PRESENT` parity.
- `tests/validationDiagnostics.test.ts`: an unspecified organic route must list all planet-valid domesticable sources regardless of selected biome; organic invalid-route presentation must not recommend another biome.
- `tests/japaneseLocalization.test.ts` and relevant exact-copy assertions in `tests/localizationReview.test.ts`: update/remove biome-bound organic message expectations through the localization workflow.
- `scripts/active-production-validation.test.mjs`: update the organic warning contract so body/producer invalidity is not described as selected-body-and-biomes invalidity.

### Retain

- generator tests that preserve `organicOccurrences`, conflict rejection, wild-only presence, and `Domesticable` facts;
- migration/serialization tests preserving `selectedBiomeIds` and exact organic routes;
- selected-biome structural validators;
- farming-input, multiple-route aggregation, and inorganic biome/atmosphere tests, with expectations adjusted only where they relied on the wrong organic gate.

### Add regression coverage

1. planet-native + domesticable + non-occurring selected biome -> exact route valid and creatable;
2. planet-native + domesticable + occurring selected biome -> valid;
3. same producer on wrong body -> invalid;
4. planet-native + non-domesticable -> invalid/no route choice;
5. fauna present but zero domesticable fauna -> no fauna farming choices;
6. equivalent flora cases;
7. several selected biomes and an explicit-all selection yield the same planetary organic routes;
8. multiple valid producers of one resource remain separate route choices and union at resource grain;
9. one invalid same-resource producer is not rescued by another valid producer;
10. farming-input validation runs for a planet-valid route even when its species does not occur in the selected biome;
11. inorganic extraction remains unavailable outside its effective biome;
12. import/export round-trip preserves the route and biome independently, followed by the correct live validation result.

## 18. Documentation impact

Current owner documents need bounded corrections:

- `docs/DOMAIN-RULES.md` section 53 explicitly defines production-valid organics as routes "occurring in" the effective biome scope; this is the principal incorrect durable rule. Its outpost-biome grouping paragraph also uses domesticable organic signatures. Section 54 should state that source-specific `Present` means planet-level farming eligibility, not natural occurrence.
- `docs/ARCHITECTURE.md` correctly documents the separate `planetSpecies` and `organicOccurrences` structures, but its availability-helper description and Search `PRESENT` description imply biome-scoped organics. Update those runtime-consumer descriptions while retaining the data-flow architecture.
- `docs/UX-DESIGN.md` should clarify that biome controls constrain occurrence-backed inorganic availability, while organic rows are planet-level. Its equal-signature grouping description should reflect the production-facing inorganic signature.
- `README.md` is not explicitly wrong, but "organic matrix choices require domesticable species" should be clarified as planet-level so the distinction is discoverable.
- `docs/BACKLOG.md` does not state the wrong farming rule. Its biome recommendation, occurrence-provenance, and future planner items remain legitimate and should not be rewritten as part of this correction.

Historical briefs/audits should remain untouched. Supported locale catalogue wording is implementation content rather than durable product documentation, but it also requires the semantic copy correction identified in section 9.

## 19. Architecture options

| Option | Correctness | Clarity | Duplication / size | Runtime complexity | Testability | Schema impact | Planner usefulness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A. Runtime aggregation from occurrence data | Can be correct if it first rebuilds body membership, but invites the same conflation | Low | No new asset, but duplicates the already-generated body/species collapse | Highest; must join body-biomes and deduplicate occurrences | More edge cases | None | Occurrence-centric, not a clear farming API |
| B. Generate a new body-keyed farming index | Correct | High at consumption sites | Duplicates most of `planetSpecies`; adds asset/manifest bytes | Lowest lookup cost | Straightforward | Runtime reference schema and generated asset change | Potentially useful, but premature for current scale |
| C. Reuse existing `planetSpecies` | Correct | Highest when exposed through a clearly named helper | No duplication or asset growth | Small linear filter over 1,738 records; negligible | Straightforward pure helper tests | None | Preserves producer identity and can later back planner indexes |

## 20. Recommendation

Choose **Option C**.

Introduce or rename toward an explicit helper such as `getPlanetaryOrganicFarmingRoutes(referenceData, bodyId)`. It should derive exact routes solely from body-level `planetSpecies` facts. Use a route-specific predicate such as `isOrganicFarmingRouteEligibleOnBody` for validation and activation. Keep `getOutpostAvailableInorganicResourceIds` selected-biome-aware and keep natural occurrence helpers/data separately named.

Then update the Matrix, resource-level organic presence, Search, source-name remediation, tooltips, and validators to consume the planetary helper. Make the production-facing biome button signature inorganic-only. This is smaller and clearer than either rebuilding planet membership from occurrences or adding a generated asset.

Recommended stable terminology:

- `organicOccurrences` / **natural biome occurrence** for where a species lives;
- `planetSpecies` / **planet-native producer** for body membership;
- **planetary organic farming eligibility** for the combined body + domesticability + output rule;
- **domesticable producer** for an eligible exact species;
- **farmable organic resource** only for a resource-level union of eligible routes;
- avoid unqualified `available organic` where the owner context does not make occurrence versus farming explicit.

## 21. Quantified impact

The following figures were derived read-only from the checked-in generated JSON:

| Measure | Total / affected |
| --- | ---: |
| Organic source rows | 3,855 |
| Generated species | 1,121 |
| Generated body × species facts | 1,738 |
| Planet-level domesticable routes with a resolved output | 718 across 169 bodies |
| Routes incorrectly excluded from at least one biome | 715 |
| Bodies with at least one incorrect exclusion | 167 |
| Distinct body-biome occurrences with at least one incorrect exclusion | 693 |
| Exact body × species × biome exclusions | 2,287 |
| Distinct farmable resources newly exposed in at least one biome | 29 |
| Flora impact | 493 routes; 159 bodies; 652 body-biome occurrences; 1,555 exact exclusions; 26 resources |
| Fauna impact | 222 of 225 routes; 78 of 81 farmable-fauna bodies; 285 body-biome occurrences; 732 exact exclusions; 26 resources |
| Bodies with fauna but no domesticable fauna | 90 |
| Body/resource pairs with multiple valid producers | 68 across 44 bodies and 16 resources |

Flora and fauna/body/resource counts overlap and are not additive. A "body-biome occurrence" above is a distinct generated `BodyBiomeReference` where at least one otherwise planet-valid route is hidden; an "exact exclusion" is one farmable body/species route missing from one body-biome occurrence.

## 22. Implementation scope

| Area | Classification | Narrow implementation |
| --- | --- | --- |
| Reference generation | Not required | Preserve the current split and generation tests; do not regenerate artifacts for the logic fix. |
| Runtime reference data | Not required | Reuse `planetSpecies`; no asset, manifest, loader, or TypeScript reference shape change. |
| Domain helpers | Required | Add/rename planetary organic route derivation; split organic from inorganic eligibility; make production-facing biome signatures inorganic-only. |
| Route creation | Required | Matrix choices and activation must use exact planet-eligible producer routes. No route shape change. |
| Validation | Required | Validate exact organic producer at body level; keep inorganic biome logic; run input validation for cross-biome-valid routes. |
| UI filtering/presentation | Required | Planet-level Matrix rows/Present, Search `PRESENT`, source remediation, and organic tooltips/messages. |
| Localization | Required | Replace/remove biome-bound organic farming copy in all supported catalogues via the existing workflow; retain inorganic biome copy. |
| Tests | Required | Rewrite wrong assumptions and add the finite flora/fauna, producer-identity, import, and inorganic-isolation matrix. |
| Durable docs | Required | Update README clarification and the owner sections in Architecture, Domain Rules, and UX Design; leave Backlog/historical records alone. |
| Save schema | Not required | Existing body, species, resource, and selected biome fields are sufficient. |
| Import/export | Not required for code/format | Add regression coverage for post-import live validation; serialization remains unchanged. |

Likely touched implementation files are `src/domain/bodyResourceAvailability.ts`, `src/domain/resourcePresence.ts`, the two organic-relevant validation rules, `src/ui/components/OutpostStatusMatrix.tsx` only as required by any helper contract change, `src/ui/statusTooltips.ts`, `src/ui/validationPresentation.ts`, Search tests/derived behavior, locale catalogues, the tests listed above, and the four current owner documents. `scripts/biome-reference-data.mjs`, generated JSON, manifests, migrations, serializers, and import validators should not need functional changes.

## 23. Finite verification plan

1. Add pure helper tests for exact body/species/resource/domesticability eligibility for flora and fauna.
2. Exercise the 12 regression cases in section 17, including a same-resource multi-producer fixture and an inorganic wrong-biome control.
3. Verify Matrix row visibility, `Present`, Producing enablement, inputs, recovery rows, and organic tooltip wording for matching and non-matching selected biomes.
4. Verify Search `PRESENT` matches the corrected Matrix result and other Search flags remain route/state-derived.
5. Verify active-route and farming-input diagnostics, including exact producer identity and planet-level remediation/source names.
6. Round-trip a current collection and a migrated schema-3 network with an exact organic route plus selected biome IDs; confirm bytes/shape are unchanged apart from normal formatting and live validation is corrected.
7. Run the focused domain/component/localization suites, `npm test`, `npm run build`, and `npm run lint` because the implementation will span domain, UI, messages, and docs.
8. Run `git diff --check` and confirm no reference-source/generated asset, manifest, migration, schema version, or serialization format changed.
9. Manually smoke-test one flora planet and one fauna planet with a selected biome where the producer does not naturally occur, plus a body with fauna but no domesticable fauna.

## 24. Disposition

**OFARM-B — bounded logic/validation correction; no reference schema change.**

The exact wrong assumption is that a domesticable planet/species route must also appear in `organicOccurrences` for the outpost's effective selected biome scope. That assumption is implemented primarily in `getAvailableOrganicProductionRoutes` and then propagated through route validation, input validation, Matrix filtering/Present state, activation, Search, source remediation, tooltips, validation presentation, biome-button grouping, tests, localized copy, and current owner documentation.

Current source and runtime data are sufficient. No reference regeneration, persisted save migration, import/export format change, app version change, or implementation was performed by this audit. The issue remains a **HIGH-priority pre-release blocker** until the bounded correction and verification plan are completed.
